# Chapter 4 — Lexical Environments and Environment Records

## Learning objectives

After completing this chapter, you should be able to:

- explain bindings without describing scope as a JavaScript object;
- trace lexical lookup through `[[OuterEnv]]` links;
- distinguish binding creation from initialization;
- explain temporal dead zone, global bindings, and live imports;
- connect retained environments to closures and React renders.

## Quick Refresher

- An environment record associates identifier names with bindings.
- A binding has behavior and state; it is not necessarily an object property.
- `[[OuterEnv]]` points to the lexically enclosing environment record.
- Lookup stops at the first record containing the name.
- An uninitialized binding throws when read; lookup does not continue outward.
- Closures retain access to bindings from their creation environment, not an active call stack.

## Why This Matters

“JavaScript searches outer scopes” predicts simple examples, but senior interviews go further: Why can an inner `let` throw before its declaration instead of reading an outer variable? Why does top-level `let` differ from top-level `var`? Why do imports update when an exporter changes?

Environment records provide one model for all of these behaviors. They also prevent two common mistakes: treating local variables as properties of an execution context and treating the temporal dead zone as a period in which a variable does not exist.

## Core Mental Model

Think of an environment record as a specification-level **set of bindings plus an outer link**:

- the record answers whether it contains a name and how that binding behaves;
- `[[OuterEnv]]` leads to the lexically enclosing record;
- different record types support different language constructs.

A binding is more than a name/value pair. It can be mutable or immutable, initialized or uninitialized, deletable or non-deletable, and direct or linked to an exported binding.

Environment records are not ordinary JavaScript objects. Engines may keep values in registers, stack storage, or optimized internal structures as long as observable behavior matches the specification.

## Visual Model

![Environment record bindings, lifecycle states, and outer links](/environment-record-anatomy.svg)

The current record owns bindings with distinct rules and states. Its `[[OuterEnv]]` link connects it to the lexically enclosing record. An uninitialized binding already exists and therefore shadows the same name outside, even though reading it throws.

## Formal Model

### Binding lifecycle

The specification separates the important binding operations:

1. **Create** the binding.
2. **Initialize** it with a value.
3. **Read or update** it according to its rules.
4. **Delete** it only when that binding kind permits deletion.

This separation explains the temporal dead zone. A lexical binding may already exist and shadow an outer name while still being uninitialized.

```js
const status = "outer";

{
  console.log(status); // ReferenceError
  const status = "inner";
}
```

Before the block body runs, its own `status` binding is created. Lookup finds that binding and stops. Reading it before initialization throws; JavaScript does not fall back to the outer `status`.

### Outer environment links

When a name is needed, resolution starts in the current environment record:

1. If the record contains the name, use that binding.
2. Otherwise, follow `[[OuterEnv]]`.
3. Repeat until a binding is found or the chain reaches `null`.

The chain follows **where code was defined**, not who called it. That distinction is the foundation of lexical scope and closures. Chapter 5 develops the identifier-resolution algorithm in detail.

### Record types worth knowing

| Record type | Main role                                            | Interview-relevant behavior                                  |
| ----------- | ---------------------------------------------------- | ------------------------------------------------------------ |
| Declarative | `let`, `const`, `class`, and other language bindings | Bindings are not object properties                           |
| Function    | One function invocation                              | Adds function-specific state such as `this` where applicable |
| Module      | Module-local and imported bindings                   | Imports are indirect, live, and read-only to the importer    |
| Object      | Exposes object properties as bindings                | Used by mechanisms such as `with`                            |
| Global      | Top-level classic-script bindings                    | Combines declarative and object-backed records               |

Function and module records specialize declarative behavior. “One call creates one function environment” is a useful default model, although parameters, direct `eval`, and other edge cases can require additional environments.

### Global bindings are split

A classic script's global environment combines two sides:

- eligible top-level `var` and function declarations use an object-backed record and may become properties of `globalThis`;
- top-level `let`, `const`, and `class` use a declarative record and do not become global-object properties.

```js
var legacyMode = true;
let modernMode = true;

console.log(globalThis.legacyMode); // true in a browser classic script
console.log(globalThis.modernMode); // undefined
```

Modules use module environment records instead. Their top-level declarations do not become properties of the global object.

### Module imports are live bindings

An import does not receive a one-time copy. It indirectly refers to the exporter's binding, so an importer observes later updates made by the exporter. The importer cannot reassign the imported name.

Detailed module linking and evaluation belong to Chapters 35–38.

## Step-by-Step Runtime Walkthrough

```js
const currency = "USD";

function formatPrice(amount) {
  const precision = 2;

  if (amount === 0) {
    const label = "Free";
    return label;
  }

  return `${currency} ${amount.toFixed(precision)}`;
}

console.log(formatPrice(12));
console.log(formatPrice(0));
```

The output is:

```text
USD 12.00
Free
```

Trace the environments:

1. Script evaluation creates the outer `currency` binding.
2. Each call creates fresh function bindings for `amount` and `precision`.
3. `currency` is absent locally, so lookup follows the function's outer link.
4. On the zero path, entering the block creates a nested `label` binding.
5. Returning finishes the active evaluations. An environment can still remain reachable if a closure needs one of its bindings.

## Important Examples

### Per-iteration bindings

```js
const handlers = [];

for (let index = 0; index < 3; index += 1) {
  handlers.push(() => index);
}

console.log(handlers.map((handler) => handler())); // [0, 1, 2]
```

A `for` loop with a lexical declaration creates a distinct per-iteration binding. Each callback closes over a different binding. With `var`, the callbacks normally share one function- or global-scoped binding and produce `[3, 3, 3]`.

### `const` protects the binding, not the object

```js
const settings = { theme: "dark" };

settings.theme = "light"; // allowed
settings = {}; // TypeError
```

The binding cannot be reassigned after initialization. That rule does not freeze the referenced object.

### Closures observe bindings, not copied values

```js
function createCounter() {
  let count = 0;
  return () => ++count;
}

const next = createCounter();
console.log(next()); // 1
console.log(next()); // 2
```

The returned function retains access to the `count` binding. The completed call does not remain on the call stack.

## Common Misconceptions

| Claim                                                | Better explanation                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| “Scope is an object containing variables.”           | Environment records are inaccessible specification mechanisms; only some records are object-backed. |
| “The TDZ means the variable does not exist.”         | The binding exists but is uninitialized, so it shadows outer bindings and throws when read.         |
| “`const` makes a value immutable.”                   | It prevents reassignment of the binding; referenced objects may remain mutable.                     |
| “A closure copies outer values.”                     | A closure retains access to bindings from its creation environment.                                 |
| “Top-level declarations are properties of `window`.” | Top-level lexical and module bindings are not global-object properties.                             |

## React Connection

Every component render is a fresh function invocation with fresh bindings:

```jsx
function SearchResults({ query, items }) {
  const normalizedQuery = query.trim().toLowerCase();

  function handleReport() {
    console.log(normalizedQuery);
  }

  return <button onClick={handleReport}>Report query</button>;
}
```

`handleReport` retains access to the `normalizedQuery` binding from the render in which that function was created. A later render creates a new binding and usually a new callback; it does not rewrite the environment captured by the old callback. This is the language basis of stale-closure bugs and React's “state as a snapshot” explanation.

Ordinary locals cannot persist component state across renders. State and refs persist because React stores their data outside any one component invocation.

## Performance and Memory Implications

Source-level scopes do not map directly to heap allocations. Engines can keep uncaptured values in registers or stack storage and materialize environments only when semantics, debugging, or deoptimization require them.

A closure is not automatically a leak. Retention becomes a problem when an unwanted long-lived reference—often an event listener, subscription, timer, or cache—keeps the closure and its captured data reachable.

When debugging memory, inspect the retaining path and ask:

- Which function remains reachable?
- What keeps that function alive?
- Which captured value accounts for the retained memory?
- Does removing the listener, subscription, timer, or cache entry release it?

## Debugging Techniques

### Compare Scope and Call Stack

Pause inside a nested function in DevTools. **Call Stack** shows dynamic callers; **Scope** shows visible local, block, closure, script, and global bindings. The panels answer different questions and should not be treated as the same chain.

### Diagnose a TDZ error

When you see “Cannot access before initialization”:

1. Find the nearest lexical declaration with the same name.
2. Identify the environment that owns it.
3. Check whether evaluation reads it before initialization.
4. For modules, also consider circular evaluation order.

Changing `let` to `var` changes semantics and may only hide the ordering defect.

## Interview Questions

### Level 1 — Fundamentals

**Question:** What is a lexical environment?

**Model answer:** JavaScript models identifier bindings with environment records connected through `[[OuterEnv]]`. A record knows which names it contains and how those bindings behave. Resolution follows the lexical chain determined by where code was defined. These records are specification mechanisms, not ordinary JavaScript objects.

### Level 2 — Applied understanding

**Question:** Why does a shadowed `let` throw before its declaration instead of reading the outer variable?

**Model answer:** Block setup creates the inner binding before the statements run, but the declaration initializes it later. Resolution finds the inner binding and stops. Reading that uninitialized binding throws a `ReferenceError`, so the outer name is never considered.

### Level 3 — Senior reasoning

**Question:** Why do callbacks created by `for (let ...)` observe different indices?

**Model answer:** The loop creates a distinct binding for each iteration. Each callback closes over its iteration's binding. With `var`, the callbacks normally share one function- or global-scoped binding and therefore observe its final value.

### Level 4 — Deep follow-up

**Question:** Is a top-level binding always a property of `globalThis`?

**Model answer:** No. In classic scripts, eligible `var` and function declarations use the object-backed side of the global environment, while top-level `let`, `const`, and `class` use its declarative side. Modules use module environments. Only the object-backed case normally appears as a `globalThis` property.

## Exercises

### 1. Predict shadowing behavior

```js
const value = 1;

{
  const value = 2;
  console.log(value);
}

console.log(value);
```

<details>
<summary>Solution</summary>

The output is `2` and then `1`. The block owns a distinct binding; after the block finishes, lookup starts in the outer environment again.

</details>

### 2. Explain the error

```js
let enabled = true;

function check() {
  console.log(enabled);
  let enabled = false;
}

check();
```

<details>
<summary>Solution</summary>

The function's local `enabled` binding exists before body evaluation reaches its declaration, but it is uninitialized. It shadows the outer binding, so the read throws a `ReferenceError`.

</details>

### 3. Diagnose a React callback

A callback created during an old render reads an old `query` after state changes. Why can React not update the callback's existing environment?

<details>
<summary>Solution</summary>

The function retains the environment from the render that created it. A later render creates new bindings; it cannot change which environment the existing function captured. The application must use the newer callback, correct dependencies, a functional update, or deliberately current mutable data through a ref.

</details>

## Chapter Summary

- Environment records associate names with bindings and link outward through `[[OuterEnv]]`.
- Lookup follows lexical nesting and stops at the first record containing the name.
- Binding creation and initialization are separate, which explains temporal dead zone behavior.
- Global lexical bindings, global object properties, and module bindings are not interchangeable.
- Closures retain access to bindings; React callbacks therefore retain values from a particular render.

### Interview-ready explanation

JavaScript models lexical scope with environment records. Each record contains bindings and points to its lexically enclosing record through `[[OuterEnv]]`. Lookup stops at the first record containing a name. Because creation and initialization are separate, an inner lexical binding can shadow an outer name while still throwing in the temporal dead zone. Closures keep access to bindings from the environment where they were created, which also explains why React callbacks can observe values from an older render.

## Further Reading

- [ECMA-262: Environment Records](https://tc39.es/ecma262/#sec-environment-records)
- [ECMA-262: Global Environment Records](https://tc39.es/ecma262/#sec-global-environment-records)
- [ECMA-262: Module Environment Records](https://tc39.es/ecma262/#sec-module-environment-records)
- [ECMA-262: BlockDeclarationInstantiation](https://tc39.es/ecma262/#sec-blockdeclarationinstantiation)
- [React: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Chrome DevTools: JavaScript Debugging Reference](https://developer.chrome.com/docs/devtools/javascript/reference)
