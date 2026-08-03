# Chapter 6 — Closures

## Learning objectives

After completing this chapter, you should be able to:

- define a closure using lexical environments rather than vague “remembering” language;
- explain why an outer function can return while captured bindings remain reachable;
- distinguish capturing a binding from copying its current value;
- predict shared and independent closure state;
- explain the difference between `var` and `let` in loop-created callbacks;
- identify closure-related memory retention and clean up long-lived callbacks;
- diagnose stale closures in React without treating every closure as a bug;

## Quick Refresher

- A closure is a function together with access to the lexical environment where that function was created.
- JavaScript functions close over bindings, not frozen copies of primitive values.
- An outer call may finish while its environment remains reachable through a returned callback.
- Closures created by the same outer invocation can share bindings; separate invocations normally create separate bindings.
- `let` in a `for` loop creates a fresh per-iteration binding when required by the loop semantics; `var` uses one function-scoped binding.
- A closure retains only what remains reachable through its environment graph; engines may optimize unobservable details.
- A retained callback can keep DOM nodes, caches, responses, or other large object graphs alive.
- In React, every render creates new bindings. A callback created during one render observes that render's state snapshot.
- A stale closure is usually a synchronization or lifecycle mistake, not evidence that closures themselves are unreliable.

## Why This Matters

Closures power callbacks, event handlers, promises, memoization, factory functions, module APIs, and nearly every React component. They are also a frequent source of weak interview answers. Saying “the inner function remembers the outer variables” predicts some behavior, but it does not explain mutation, shared state, loop bindings, stale React callbacks, or memory retention.

Senior engineers need a model that answers two production questions:

1. **Which binding will this callback read when it eventually runs?**
2. **What remains reachable for as long as this callback remains reachable?**

The first question is about correctness. The second is about lifetime and memory.

## Core Mental Model

When JavaScript creates an ordinary function, the function object receives an internal `[[Environment]]` slot referring to the lexical environment active at creation time. When the function is called later, the new function environment links outward to that saved environment.

```js
function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}

const next = createCounter();

console.log(next()); // 1
console.log(next()); // 2
```

The `createCounter` execution context is removed from the call stack after it returns. That does not make its bindings unreachable. The returned `increment` function still refers to the environment containing `count`, so that environment remains available.

Three structures must remain separate:

- the **call stack** records currently active calls;
- the **lexical environment chain** determines identifier resolution;
- the **reachability graph** determines which objects and environments can be reclaimed.

A call can disappear from the stack while its environment remains reachable.

## Visual Model

![Closure retaining a binding after its outer call returns](/closure-lifetime.svg)

`createCounter` creates the `count` binding and the `increment` function. After the outer call returns, its active frame is gone, but the returned function remains reachable through `next`. Its saved `[[Environment]]` path therefore keeps the same `count` binding available for later calls.

## Formal Model

### Function creation captures an environment

The specification does not define a user-visible `Closure` object. An ordinary function stores its creation environment in `[[Environment]]`. A later call uses that saved environment as its lexical outer environment, regardless of who calls the function.

“Closure” is therefore a programming-language description of behavior produced by functions, environment records, and lexical lookup—not an object that application code can inspect.

### Bindings are captured, not value snapshots

Consider this factory:

```js
function createScoreboard() {
  let score = 0;

  return {
    read() {
      return score;
    },
    add(points) {
      score += points;
    },
  };
}

const board = createScoreboard();
board.add(10);
console.log(board.read()); // 10
```

Both methods resolve `score` to the same mutable binding from one `createScoreboard` invocation. `read` did not capture the number `0`; it retained a lookup path to the binding whose value later became `10`.

You can deliberately capture a snapshot by creating another binding:

```js
let status = "pending";
const snapshot = status;
const readSnapshot = () => snapshot;
const readCurrent = () => status;

status = "complete";

console.log(readSnapshot()); // pending
console.log(readCurrent()); // complete
```

The distinction is not “closure versus no closure.” Both functions are closures. They close over different bindings.

### Lifetime follows reachability

Returning removes a call from the active stack. Garbage collection instead follows reachability: if a reachable function still needs an outer binding, the required state must remain available.

This is a semantic rule, not a required heap layout. Engines may omit unused bindings or represent captured state differently. Reason about binding identity and reachability, not a literal scope object containing every local.

### Shared versus independent environments

Closures created during one factory invocation can share its bindings. A second invocation normally creates a new environment with independent bindings. Calling the same returned closure repeatedly therefore updates its existing state; calling another factory result updates different state.

Use one reliable interview rule: determine which invocation created the binding, then determine which closures can still reach it.

## Step-by-Step Runtime Walkthrough

Predict the output:

```js
function createQueue(name) {
  const items = [];

  return {
    enqueue(item) {
      items.push(item);
      console.log(`${name}: added ${item}`);
    },
    flush() {
      const snapshot = [...items];
      items.length = 0;
      return snapshot;
    },
  };
}

const urgent = createQueue("urgent");
const normal = createQueue("normal");

urgent.enqueue("fix-login");
normal.enqueue("update-copy");
urgent.enqueue("restore-cache");

console.log(urgent.flush());
console.log(normal.flush());
```

Expected output:

```text
urgent: added fix-login
normal: added update-copy
urgent: added restore-cache
[ 'fix-login', 'restore-cache' ]
[ 'update-copy' ]
```

Trace it precisely:

1. The first `createQueue` invocation creates bindings for `name` and `items`.
2. Its returned methods retain that invocation's environment.
3. The second invocation creates a separate `name` binding and a separate array referenced by its `items` binding.
4. Calling `urgent.enqueue` creates a new `enqueue` call environment. `items` and `name` are not local there, so lookup follows the saved outer environment.
5. Mutating the array does not replace the `items` binding; it changes the referenced object.
6. `flush` copies the current array elements, then mutates the shared array's `length`.
7. The two queue objects never share their captured arrays because they came from different factory invocations.

## Important Examples

### Encapsulated mutable state

```js
export function createRequestDeduper() {
  const inFlight = new Map();

  return function requestOnce(key, load) {
    if (inFlight.has(key)) {
      return inFlight.get(key);
    }

    const request = Promise.resolve()
      .then(load)
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, request);
    return request;
  };
}
```

The returned function provides controlled access to `inFlight` without exposing the map directly. The `finally` cleanup is essential: without it, settled promises and their keys remain reachable for as long as the deduper remains reachable.

This pattern is appropriate when the desired lifetime is the lifetime of one created deduper. A module-level map would instead be shared by every consumer of that module instance. A React component-local closure would be recreated with renders unless deliberately stabilized.

### Interview edge case: `var` and per-iteration `let`

```js
const withVar = [];

for (var i = 0; i < 3; i += 1) {
  withVar.push(() => i);
}

console.log(withVar.map((read) => read())); // [3, 3, 3]
```

`var i` creates one function- or global-scoped binding. Every callback closes over that binding. By the time they run, its value is `3`.

Now compare `let`:

```js
const withLet = [];

for (let i = 0; i < 3; i += 1) {
  withLet.push(() => i);
}

console.log(withLet.map((read) => read())); // [0, 1, 2]
```

For a `for` loop with a lexical declaration, the specification creates per-iteration environments. Each callback closes over a different `i` binding.

The important difference is binding identity, not asynchronous timing or arrow-function syntax.

## Common Misconceptions

| Claim                                                | Better explanation                                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| “A closure exists only when a function is returned.” | Event listeners, promise handlers, and immediately invoked nested functions also use their creation environments. |
| “Closures capture values.”                           | Functions retain access to bindings; later reads observe the value currently held by that binding.                |
| “The outer call stays on the stack.”                 | The call finishes; required bindings can remain reachable independently.                                          |
| “Every local is retained forever.”                   | Only reachable, semantically required state matters, and engines can optimize its representation.                 |
| “Closures are memory leaks.”                         | A leak requires unintended retention beyond the desired lifetime.                                                 |
| “`let` changes when callbacks run.”                  | It changes binding identity in the loop, not scheduling.                                                          |
| “React hooks cause stale closures.”                  | Ordinary closures expose a lifecycle mismatch when old callbacks remain connected.                                |

## React Connection

Each React render calls the component again and creates a new lexical environment. Props, state variables, derived values, and inline callbacks belong to that render.

```jsx
function SearchStatus({ query }) {
  const [count, setCount] = useState(0);

  function handleClick() {
    setTimeout(() => {
      console.log({ query, count });
    }, 1000);
  }

  return <button onClick={handleClick}>Log current render</button>;
}
```

When the user clicks, `handleClick` and the timer callback belong to that render. Updating state before the timer fires does not rewrite the captured `count` binding into a newer render's binding. The callback reports the snapshot associated with the click.

That behavior is often desirable: an event should retain the values relevant when it occurred. It becomes a stale-closure bug when long-lived logic is expected to synchronize with current reactive values but remains connected to an older render.

### Effect dependencies

```jsx
function Chat({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => connection.disconnect();
  }, [roomId]);
}
```

The effect setup closes over one render's `roomId`. Including `roomId` in the dependency list tells React to clean up the previous synchronization and run a new setup when that reactive value changes.

Removing a dependency merely to silence the linter does not make the callback current. Strong fixes change the design:

- include reactive values that genuinely control synchronization;
- use a functional state update when the next state depends only on previous state;
- move non-reactive logic outside an effect when it does not belong there;
- use a ref when mutable current data must not trigger a render;
- separate event-specific logic from synchronization logic.

The closure is behaving correctly; stale behavior indicates that the surrounding lifecycle or synchronization contract is wrong.

## Memory and Debugging

Creating small closures is normal. The more important question is whether a long-lived callback retains data beyond its intended lifetime:

```js
function mountPanel(button, model) {
  function handleClick() {
    renderDetails(model.selectedItem);
  }

  button.addEventListener("click", handleClick);

  return () => {
    button.removeEventListener("click", handleClick);
  };
}
```

The likely path is: event target → `handleClick` → saved environment → `model` → its object graph. The cleanup removes the listener at the root of that path.

Common long-lived roots include:

- event targets with registered listeners;
- timers and intervals that have not been cancelled;
- subscriptions and observer callbacks;
- pending asynchronous operations;
- caches and module-level collections;
- framework roots holding mounted component state.

The existence of a closure does not prove which path retains an object. Confirm the actual path with memory tooling.

For incorrect values, inspect the callback's creation site: the invocation site explains when it ran, while the creation site explains which environment it retained. Ask separately:

1. Is this the same callback function as before?
2. Does it resolve the name to the same binding as before?

Recreating a callback changes its identity and may capture new bindings. Mutating a shared binding instead changes what existing closures observe.

For suspected retention:

1. create and then remove the UI or data expected to be released;
2. force garbage collection when the tool supports it;
3. compare heap snapshots;
4. inspect retaining paths for unexpected listeners, timers, collections, or closures;
5. fix the lifecycle root rather than deleting unrelated locals.

## Interview Questions

### Level 1 — Fundamentals

**Question:** What is a closure?

**Model answer:** A closure is a function with access to the lexical environment where it was created. In specification terms, an ordinary function stores that environment in its internal `[[Environment]]` slot. Later calls resolve outer identifiers through that saved environment, even if the creating function has already returned.

### Level 2 — Applied understanding

**Question:** Why do callbacks created with `var` in a loop often all log the final value, while callbacks created with `let` log different values?

**Model answer:** `var` gives the callbacks one shared function-scoped binding. They run after the loop has updated that binding to its final value. A `for` loop with `let` creates per-iteration lexical bindings, so each callback closes over a different binding. The difference is binding identity, not asynchronous execution itself.

### Level 3 — Senior reasoning

**Question:** When does a closure cause a memory leak?

**Model answer:** A closure is not inherently a leak. It becomes part of a leak when a long-lived root—such as an event listener, timer, subscription, or cache—retains the closure beyond its intended lifecycle, and the closure's environment keeps otherwise obsolete objects reachable. I confirm this with heap snapshots and retaining paths, then remove the root through cleanup or bounded storage.

### Level 4 — Deep follow-up

**Question:** Does a closure store a copy of every local variable from its outer function?

**Model answer:** That is not a valid observable guarantee. Semantically, the function retains access through its saved lexical environment to bindings required by later identifier resolution. Engines can optimize storage, omit unused bindings, or represent captured state differently as long as behavior is preserved. I reason about binding identity and reachability, not a literal copied scope object.

## Exercises

### 1. Compare shared and independent state

```js
function pair() {
  let value = 0;
  return [() => ++value, () => --value];
}

const [up, down] = pair();
console.log(up(), up(), down());

function counter() {
  let value = 0;
  return () => ++value;
}

const a = counter();
const b = counter();

console.log(a(), a(), b());
```

<details>
<summary>Solution</summary>

Both lines output `1 2 1`, for different reasons. `up` and `down` share the binding created by one `pair` call. `a` and `b` use bindings created by separate `counter` calls.

</details>

### 2. Fix the loop

Explain and fix this code without changing when the callbacks execute:

```js
const readers = [];

for (var index = 0; index < 3; index += 1) {
  readers.push(() => index);
}
```

<details>
<summary>Solution</summary>

Use `let index`. The loop then creates per-iteration bindings, producing `0`, `1`, and `2`. An extra factory invocation receiving `index` as a parameter also works because each call creates a new parameter binding.

</details>

### 3. Find the retention path

A removed modal remains in a heap snapshot. Its close button registered a callback that references the modal's model. List the likely retention path and the cleanup you would verify.

<details>
<summary>Solution</summary>

A likely path is an active event target or application registry → listener function → saved lexical environment → model → modal data. Verify that unmounting removes the listener and that no subscription, timer, or registry still stores the callback. Use the actual retaining path in memory tools rather than assuming the closure is the root.

</details>

## Chapter Summary

- **Essential model:** a function retains access to its creation environment through lexical environment links.
- **Binding rule:** closures capture access to bindings, not automatic frozen value copies.
- **Lifetime rule:** leaving the call stack does not imply that captured state is unreachable.
- **Identity rule:** closures from one invocation may share bindings; different invocations normally create independent bindings.
- **Loop rule:** `var` commonly shares one binding, while `let` can create per-iteration bindings.
- **Memory rule:** leaks come from unintended long-lived reachability paths, not from closure syntax itself.
- **React rule:** callbacks belong to render snapshots; stale behavior indicates a lifecycle or synchronization mismatch.

### Interview-ready explanation

A closure is a function that retains access to the lexical environment where it was created. Ordinary functions save that environment internally, so later identifier resolution follows the saved outer chain even after the creating call has returned. The function closes over bindings rather than frozen value copies, which explains shared mutable state and why separate factory invocations produce independent state. In loops, `var` callbacks share one binding, while `let` can create a binding per iteration. Closures affect memory only through reachability: a long-lived listener or timer can retain an environment and the object graph reachable from it. In React, each render creates new bindings, so a callback observes the state snapshot from the render that created it unless the design explicitly reconnects it to current data.

## Further Reading

- [ECMA-262: Lexical Environments](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-lexical-environments)
- [ECMA-262: Ordinary Function Objects](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-ordinary-function-objects)
- [ECMA-262: OrdinaryFunctionCreate](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-ordinaryfunctioncreate)
- [ECMA-262: CreatePerIterationEnvironment](https://tc39.es/ecma262/multipage/ecmascript-language-statements-and-declarations.html#sec-createperiterationenvironment)
- [React: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [React: Removing Effect Dependencies](https://react.dev/learn/removing-effect-dependencies)
- [Chrome DevTools: Fix Memory Problems](https://developer.chrome.com/docs/devtools/memory-problems/)
