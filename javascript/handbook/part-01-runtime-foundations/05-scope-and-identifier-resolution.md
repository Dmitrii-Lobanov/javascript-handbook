# Chapter 5 — Scope and Identifier Resolution

## Learning objectives

After completing this chapter, you should be able to:

- trace identifier resolution through lexical environments;
- distinguish lexical scope from dynamic call order;
- explain shadowing and unresolvable references;
- distinguish binding lookup from object property lookup;
- reason about `typeof`, modules, and accidental globals;
- diagnose scope mistakes in React applications.

## Quick Refresher

- JavaScript is lexically scoped: where a function is defined determines its outer scope.
- Resolution searches the current environment and then follows `[[OuterEnv]]` links.
- The nearest matching binding wins.
- A caller's local variables do not enter the callee's scope.
- An unresolvable name and an uninitialized binding are different conditions.
- In `obj.key`, only `obj` is resolved lexically; `key` is a property name.
- Module bindings are isolated from global scope but shared by consumers of that module instance.

## Why This Matters

Senior scope questions test more than “inner code can access outer variables.” They combine callbacks, shadowing, modules, temporal dead zones, globals, and property access. The core skill is identifying which lookup mechanism applies.

Keep three structures separate:

| Structure                 | Answers                                                   |
| ------------------------- | --------------------------------------------------------- |
| Lexical environment chain | Which binding does this identifier mean?                  |
| Call stack                | Which function is running, and which callers are waiting? |
| Prototype chain           | Where can this object property be found?                  |

Confusing these structures produces plausible but incorrect explanations.

## Core Mental Model

When JavaScript evaluates an identifier such as `timeout`:

1. Check the current environment for a `timeout` binding.
2. If found, stop and create an internal reference to that binding.
3. Otherwise, follow `[[OuterEnv]]` and repeat.
4. If the chain reaches `null`, the reference is unresolvable.

Finding a binding and reading its value are separate operations. Resolution can therefore find an uninitialized binding and then throw when code tries to read it.

The outer chain comes from lexical nesting—where code was created—not the sequence of functions that called it.

## Visual Model

![Lexical identifier lookup stops at the nearest binding](/identifier-lookup.svg)

The lookup begins where `timeout` is used. Because the current block does not contain that name, resolution follows `[[OuterEnv]]`. It stops at the function binding, creates a reference to it, and never reaches the same name in module scope.

## Formal Model

### Resolve first, then read or write

Evaluating an identifier uses specification machinery commonly summarized as `ResolveBinding(name)`. The search produces an internal **Reference Record** describing the binding or the fact that no binding was found. JavaScript code cannot inspect or store this record directly.

The next operation depends on context:

- reading uses the reference to obtain a value;
- assignment uses it as a destination;
- a normal read through an unresolvable reference throws `ReferenceError`;
- reading a resolved but uninitialized binding also throws `ReferenceError`.

These errors have different causes: one name was not found; the other was found but is not ready to be read.

### Lexical scope is not dynamic scope

```js
const mode = "global";

function readMode() {
  return mode;
}

function callWithLocalMode() {
  const mode = "local";
  return readMode();
}

console.log(callWithLocalMode()); // global
```

`callWithLocalMode` is the runtime caller, but its local `mode` is not part of `readMode`'s lexical chain. `readMode` searches the environment captured where it was defined and finds the global binding.

### Shadowing stops the search

An inner declaration shadows an outer declaration with the same name. Resolution stops at the nearest environment containing the name, even if that binding is uninitialized.

```js
const status = "ready";

{
  console.log(status); // ReferenceError
  const status = "pending";
}
```

The block's `status` exists before its declaration initializes it. The outer `status` is never considered.

### Binding lookup is not property lookup

```js
const timeout = 1000;
const settings = { timeout: 5000 };

console.log(timeout); // lexical binding: 1000
console.log(settings.timeout); // object property: 5000
```

In `settings.timeout`, JavaScript resolves only `settings` through lexical scope. It then looks up the `timeout` property on the resulting object, potentially using its prototype chain.

Destructuring can connect the two mechanisms without making them identical:

```js
const { timeout: requestTimeout } = settings;
```

`timeout` is the property key; `requestTimeout` is the new lexical binding.

### The two important `typeof` cases

```js
console.log(typeof missingName); // 'undefined'

{
  console.log(typeof pendingValue); // ReferenceError
  let pendingValue = 1;
}
```

`typeof` has special behavior for an **unresolvable** name and returns `'undefined'`. It does not suppress the error for a **resolved but uninitialized** lexical binding.

### Assignment to an undeclared name

Assigning through an unresolvable reference throws in strict code. Legacy non-strict script semantics may instead create a global-object property:

```js
result = 42;
```

Modules are always strict, so this mistake throws. Depending on implicit global creation is unsafe and environment-sensitive; declare the intended binding.

### Scope categories

- **Block scope:** `let`, `const`, `class`, and applicable block functions.
- **Function scope:** parameters, `var`, and function-body declarations.
- **Script global scope:** top-level declarations stored through the global environment's declarative or object-backed side.
- **Module scope:** module-local declarations and live import bindings; module code is strict.

Module scope prevents global-name collisions, but it does not provide per-component or per-request state.

## Step-by-Step Runtime Walkthrough

```js
const currency = "USD";

function formatOrder(order) {
  const prefix = "Order";

  function formatLine(item) {
    const total = item.price * item.quantity;
    return `${prefix} ${order.id}: ${currency} ${total}`;
  }

  return order.items.map(formatLine);
}

console.log(
  formatOrder({
    id: "A-17",
    items: [{ price: 5, quantity: 2 }],
  }),
);
```

The output is:

```text
[ 'Order A-17: USD 10' ]
```

Resolve each name from inside `formatLine`:

1. `item` and `total` are found in the current function environment.
2. `prefix` and `order` are found in the enclosing `formatOrder` environment.
3. `currency` is found in the surrounding script or module environment.
4. `price`, `quantity`, `id`, and `items` are property names, not lexical searches.
5. `map` calling `formatLine` does not insert its own internals into `formatLine`'s lexical chain.

## Important Examples

### Module scope is shared scope

```js
// request-id.js
let nextRequestId = 0;

export function createRequestId() {
  nextRequestId += 1;
  return `request-${nextRequestId}`;
}
```

The name is private to the module unless exported, but the binding is still shared by consumers of that evaluated module instance. In React it can be shared across components; in server code it can outlive a request. Name isolation and lifecycle isolation are different properties.

## Common Misconceptions

| Claim                                              | Better explanation                                                            |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| “JavaScript checks the caller's variables.”        | Lookup follows lexical environments captured where the function was created.  |
| “An unusable inner binding falls through outward.” | A matching uninitialized binding stops lookup and throws when read.           |
| “`obj.key` resolves `key` through scope.”          | Only `obj` is resolved lexically; `key` is looked up as a property.           |
| “`typeof` never throws for missing variables.”     | It handles unresolvable names specially but still throws for TDZ bindings.    |
| “Module scope gives every importer a copy.”        | Importers normally share one evaluated module instance and its live bindings. |

## React Connection

React code commonly uses three lexical layers:

1. **Module scope:** imports, constants, helpers, and deliberately shared state.
2. **Render scope:** props, state snapshots, derived values, and callbacks created during one component invocation.
3. **Callback invocation scope:** event parameters and updater-function parameters created later.

```jsx
const defaultLimit = 20;

function Results({ limit = defaultLimit }) {
  const [page, setPage] = React.useState(1);

  function handleNextPage() {
    setPage((currentPage) => currentPage + 1);
  }

  return (
    <button onClick={handleNextPage}>
      Page {page}, limit {limit}
    </button>
  );
}
```

`defaultLimit` comes from module scope. `limit`, `page`, and `handleNextPage` belong to this render. `currentPage` is created when React later invokes the updater.

The functional updater does not make `page` dynamically scoped. It avoids reading the captured `page` binding by accepting the latest queued state as an argument.

Mutable module bindings bypass React's state model, are shared across component instances, and do not trigger rendering. Use them only when that shared lifetime is intentional.

## Practical Implications

At a breakpoint, **Call Stack** shows how execution arrived at the current function. **Scope** shows which bindings are visible from the selected frame. A caller's local variable can appear in another frame without belonging to the current function's lexical chain.

When a name resolves unexpectedly:

1. Find every declaration with the same name.
2. Start from the use site and identify the nearest environment.
3. Include parameters, imports, catch bindings, and destructuring aliases.
4. Distinguish an absent binding from an uninitialized one.

Reproduce top-level bugs in the correct environment. Browser console snippets, classic scripts, ES modules, CommonJS, and bundler wrappers can have different global behavior.

Engines statically analyze and optimize lexical access, so scope depth is not a useful microbenchmark. Prefer clear structure, avoid `with` and direct `eval`, and investigate retained closures or module state as lifetime issues rather than lookup-speed issues.

## Interview Questions

### Level 1 — Fundamentals

**Question:** How does JavaScript resolve an identifier?

**Model answer:** It checks the current environment record and follows lexical `[[OuterEnv]]` links until it finds the name or reaches the end. The chain is determined by where code was defined, not who called it. Resolution creates an internal reference, which is then used to read or write the binding.

### Level 2 — Applied understanding

**Question:** Why can shadowing cause a temporal-dead-zone error?

**Model answer:** A lexical binding is created before its declaration initializes it. Resolution finds that nearer binding and stops, so an outer binding with the same name is not considered. Reading the uninitialized binding throws `ReferenceError`.

### Level 3 — Senior reasoning

**Question:** Why is mutable module state risky in React or server rendering?

**Model answer:** Module scope isolates names from the global environment but normally shares one evaluated module's bindings among its consumers. State can therefore cross component instances or server requests, and mutation bypasses React's update mechanism. The correct storage depends on the intended lifecycle.

### Level 4 — Deep follow-up

**Question:** Why does `typeof missingName` return `'undefined'`, while `typeof value` can throw before `let value`?

**Model answer:** `missingName` is unresolvable, and `typeof` has a special case for that result. A TDZ name resolves successfully to an existing but uninitialized binding. Reading that binding still throws.

## Exercises

### 1. Trace lexical lookup

```js
const value = "module";

function outer() {
  const value = "outer";
  return function inner() {
    return value;
  };
}

console.log(outer()());
```

<details>
<summary>Solution</summary>

The output is `outer`. `inner` follows its lexical outer link to the retained `outer` invocation environment and finds that binding before module scope.

</details>

### 2. Distinguish binding and property

```js
const timeout = 1000;
const options = { timeout: 5000 };

console.log(options.timeout);
console.log(timeout);
```

<details>
<summary>Solution</summary>

The output is `5000` and `1000`. The first expression resolves `options` and then performs property lookup. The second resolves the lexical `timeout` binding.

</details>

### 3. Predict `typeof`

```js
console.log(typeof notDeclared);

try {
  console.log(typeof later);
  let later = 1;
} catch (error) {
  console.log(error.name);
}
```

<details>
<summary>Solution</summary>

The output is `undefined` followed by `ReferenceError`. `notDeclared` is unresolvable; `later` is resolved but uninitialized.

</details>

## Chapter Summary

- Identifier resolution follows lexical environment links, not dynamic callers.
- The nearest matching binding stops the search.
- Unresolvable and resolved-but-uninitialized references fail for different reasons.
- Identifier lookup and object property lookup are separate mechanisms.
- Module scope isolates names but can still share mutable state across consumers.
- React module, render, and callback scopes have different lifetimes.

### Interview-ready explanation

JavaScript is lexically scoped. Resolving an identifier starts in the current environment and follows `[[OuterEnv]]` links determined by where the code was defined. The nearest matching binding wins, even if it is still uninitialized. An unresolvable name normally throws, although `typeof` handles that case specially. Property access is separate: in `obj.key`, only `obj` is resolved lexically. In React, this model separates shared module bindings, per-render bindings, and parameters created when callbacks run later.

## Further Reading

- [ECMA-262: ResolveBinding](https://tc39.es/ecma262/#sec-resolvebinding)
- [ECMA-262: GetIdentifierReference](https://tc39.es/ecma262/#sec-getidentifierreference)
- [ECMA-262: Reference Record Specification Type](https://tc39.es/ecma262/#sec-reference-record-specification-type)
- [ECMA-262: GetValue](https://tc39.es/ecma262/#sec-getvalue)
- [ECMA-262: PutValue](https://tc39.es/ecma262/#sec-putvalue)
- [ECMA-262: Strict Mode](https://tc39.es/ecma262/#sec-strict-mode-of-ecmascript)
- [React: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
- [Chrome DevTools: JavaScript Debugging Reference](https://developer.chrome.com/docs/devtools/javascript/reference)
