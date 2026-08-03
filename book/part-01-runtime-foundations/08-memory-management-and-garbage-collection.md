# Chapter 8 — Memory Management and Garbage Collection

## Learning objectives

After completing this chapter, you should be able to:

- explain garbage collection in terms of reachability;
- distinguish allocation, retention, reclamation, and memory leaks;
- identify roots and trace retaining paths;
- explain when weak collections are useful;
- recognize common browser and React retention bugs;
- investigate memory growth with heap snapshots and allocation tools;
- avoid relying on garbage-collection timing or finalizers for correctness.

## Quick Refresher

- JavaScript automatically manages memory, but applications still control object reachability.
- An object remains alive while it is reachable from a root through strong references.
- A leak is unwanted retention, not merely high allocation or growing memory.
- Closures, listeners, timers, caches, and detached DOM trees can extend object lifetimes.
- `WeakMap` and `WeakSet` do not keep their object keys strongly reachable.
- Garbage-collection timing is not deterministic or observable as an application contract.
- Heap snapshots explain retained state; CPU profiles explain execution cost.
- React cleanup should remove subscriptions and other external retention paths.

## Why This Matters

“JavaScript has garbage collection” does not mean applications cannot leak memory. The collector can reclaim only state that is no longer reachable. A forgotten listener, unbounded cache, or module-level registry can keep an obsolete interface and its entire object graph alive indefinitely.

Senior engineers must distinguish a real leak from temporary allocation pressure, caching, development tooling, and normal garbage-collector behavior. The correct response begins with evidence about what retains the object—not with deleting arbitrary variables or forcing collection.

## Core Mental Model

Think in terms of a directed graph:

- **nodes** are objects, functions, environments, DOM nodes, and other managed values;
- **edges** are references between them;
- **roots** are starting points the runtime considers live;
- anything reachable from a root must remain available;
- unreachable state becomes eligible for reclamation.

```js
const registry = new Map();

function rememberView(id, viewModel) {
  registry.set(id, viewModel);
}
```

If `registry` is module-scoped and remains reachable, every stored `viewModel` remains reachable too. Removing the UI alone does not release those entries.

The most useful debugging question is:

> What strong reference path still connects this object to a root?

Garbage collection answers whether memory **may** be reclaimed. It does not promise when reclamation will occur or whether the process will immediately return memory to the operating system.

## Visual Model

![Garbage collection reachability from roots and an unreachable object cycle](/garbage-collection-reachability.svg)

The module registry and browser listener are roots for this investigation. Their strong paths keep the map entry, callback, and detached DOM tree alive. The separate object cycle has no path from a root, so the cycle itself does not prevent collection.

## Formal Model

### Allocation, retention, and reclamation

These are separate events:

1. **Allocation:** execution creates a value requiring managed storage.
2. **Retention:** one or more reachable references keep that value alive.
3. **Unreachability:** no strong path from a root reaches the value.
4. **Reclamation:** the implementation eventually reuses or releases its storage.

Memory can rise because allocation temporarily outpaces collection without indicating a leak. A leak produces continuing unwanted reachability across completed application lifecycles.

### Roots and retaining paths

Exact roots are implementation- and host-dependent, but useful categories include:

- active execution state;
- reachable global and module state;
- host registrations such as listeners and timers;
- framework roots and mounted component state;
- native or embedder references exposed through browser APIs.

A retaining path is a chain from one of those roots to the object being investigated. The path matters more than the syntax that created the object.

### Collection strategy is an implementation detail

A conceptual mark-and-sweep explanation is useful:

1. start from roots;
2. mark everything reachable through strong references;
3. reclaim unmarked storage.

Real engines use more sophisticated strategies, often including generational, incremental, and concurrent work. These techniques reduce pause time and collection cost, but ECMAScript does not guarantee a particular algorithm, schedule, or heap layout.

Do not infer liveness from whether DevTools happens to show an object after one operation. Tooling itself can retain inspected values, and collection may not have run yet.

### Cycles are not inherently leaks

Reachability-based collectors can reclaim unreachable cycles:

```js
let left = {};
let right = {};

left.other = right;
right.other = left;

left = null;
right = null;
```

After the external references are removed, the pair can become unreachable even though the objects still reference each other. Cycles become leaks only when some unwanted path from a root still reaches them.

### Strong and weak associations

A normal `Map` strongly retains both keys and values. `WeakMap` does not keep an object key alive solely because it is present in the collection.

```js
const metadata = new WeakMap();

function annotate(element, data) {
  metadata.set(element, data);
}
```

When an `element` becomes unreachable elsewhere, its weak association does not prevent collection. This makes `WeakMap` useful for metadata whose lifetime should follow an object.

Weak collections deliberately cannot be enumerated. If entries could be listed, observable results would depend on nondeterministic garbage-collection timing.

Use weak collections only when object-key lifetime matches the desired ownership model. They do not fix leaks when another strong path still retains the key, and they are not a replacement for bounded caches that must be enumerable.

### `WeakRef` and finalization

`WeakRef` allows a non-owning observation of an object, and `FinalizationRegistry` can request a callback after collection. Both are intentionally nondeterministic.

Do not use them for essential cleanup, business logic, cache correctness, or timely release of scarce external resources. Prefer explicit lifecycle operations such as `close`, `dispose`, unsubscribe functions, and `AbortController`.

## Step-by-Step Runtime Walkthrough

Consider a modal controller:

```js
const openModals = new Map();

function mountModal(id, element, model) {
  function handleClose() {
    element.remove();
  }

  element.querySelector("[data-close]").addEventListener("click", handleClose);
  openModals.set(id, { element, model, handleClose });
}
```

Closing the modal removes its element from the document, but that does not necessarily make it collectible:

1. `openModals` is reachable from module scope.
2. Its entry strongly references `element`, `model`, and `handleClose`.
3. The callback's closure also refers to `element`.
4. Removing the element from the DOM changes document membership, not JavaScript reachability.
5. The entry and its reachable graph remain alive until the registry releases them.

A lifecycle-aware version removes both external registrations and application references:

```js
const openModals = new Map();

function mountModal(id, element, model) {
  const closeButton = element.querySelector("[data-close]");

  function dispose() {
    closeButton.removeEventListener("click", dispose);
    openModals.delete(id);
    element.remove();
  }

  closeButton.addEventListener("click", dispose);
  openModals.set(id, { element, model, dispose });

  return dispose;
}
```

The key design improvement is explicit ownership: mounting establishes retention paths, and disposal removes them.

## Important Leak Patterns

### Unbounded caches and registries

```js
const responseCache = new Map();

export async function loadProduct(id) {
  if (!responseCache.has(id)) {
    responseCache.set(
      id,
      fetch(`/api/products/${id}`).then((response) => response.json()),
    );
  }

  return responseCache.get(id);
}
```

This may be intentional caching, but without eviction its lifetime is the module instance's lifetime. Choose a bound, expiration policy, explicit invalidation, or object-keyed weak association according to product requirements.

### Listeners, observers, and subscriptions

An event target or external store may retain its callbacks. Those callbacks can retain component data through closures. Cleanup must use the same callback identity that was registered.

```js
const handleResize = () => updateLayout(model);

window.addEventListener("resize", handleResize);

// Later
window.removeEventListener("resize", handleResize);
```

Creating a new arrow during removal does not remove the original listener.

### Timers and pending work

Intervals remain registered until cleared. Long-delay timers, observers, queued work, and pending requests can also extend lifetimes. Cancellation is valuable both for memory and for preventing obsolete work from updating current UI.

### Detached DOM trees

A detached node is not automatically leaked. It becomes a problem when JavaScript, a listener registry, a framework, or tooling still retains it after the application expects it to disappear. Investigate the retaining path rather than the “Detached” label alone.

## Common Misconceptions

| Claim                                                    | Better explanation                                                                                   |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| “Garbage collection prevents memory leaks.”              | It reclaims unreachable state; applications determine which references remain reachable.             |
| “Setting a variable to `null` frees memory immediately.” | It removes one reference. Other paths may remain, and collection timing is nondeterministic.         |
| “Circular references always leak.”                       | Unreachable cycles can be collected by reachability-based collectors.                                |
| “A large heap proves a leak.”                            | Caches, allocation bursts, delayed collection, and tooling can also increase heap size.              |
| “A detached DOM node is necessarily leaked.”             | It is a leak only if unwanted strong references keep it alive.                                       |
| “`WeakMap` makes its values weak.”                       | Weakness concerns reachability through object keys; values remain available while their key is live. |
| “Finalizers are reliable cleanup hooks.”                 | Their execution is delayed, nondeterministic, and may never occur before process termination.        |

## React Connection

React releases its own references when components unmount, but it cannot automatically clean up every external system a component contacted.

```jsx
function Presence({ userId }) {
  useEffect(() => {
    const controller = new AbortController();
    const unsubscribe = presenceStore.subscribe(userId, handlePresence);

    loadPresence(userId, { signal: controller.signal });

    return () => {
      controller.abort();
      unsubscribe();
    };
  }, [userId]);

  return null;
}
```

The effect cleanup mirrors setup: it aborts obsolete work and removes the store's reference to the callback. When `userId` changes, React first cleans up the previous synchronization before establishing the next one.

Common React retention problems include:

- effects that subscribe without unsubscribing;
- timers or observers that survive unmount;
- module-level maps keyed by component or request data;
- external stores that retain abandoned listeners;
- caches without bounds or invalidation;
- development measurements misread as production behavior.

React Strict Mode may run an extra development setup-and-cleanup cycle to expose missing cleanup. It is a diagnostic signal, not the production lifecycle itself.

State updates after unmount do not by themselves prove a memory leak. Ask whether some external root still retains the callback or data and whether that retention is unwanted.

## Performance and Debugging

### Distinguish allocation pressure from retention

- **Allocation pressure:** many short-lived values increase collection work but become unreachable normally.
- **Retention:** values remain reachable across completed lifecycles.
- **Leak:** retention is unintended and continues to grow or preserve obsolete state.

Optimize only after identifying which condition exists. A CPU profile or allocation timeline helps with allocation cost; heap snapshots and retaining paths help with retained state.

### Use a repeatable investigation

1. Define one lifecycle, such as opening and closing a modal.
2. Record a baseline after the application settles.
3. Repeat the lifecycle several times.
4. Release the feature and allow or request collection in the diagnostic tool.
5. Compare snapshots by constructor and retained size.
6. Inspect retaining paths for objects that should have disappeared.
7. Fix the root reference and repeat the same experiment.

One snapshot rarely proves growth. Repetition distinguishes one-time initialization from accumulation.

### Read memory metrics carefully

- **Shallow size** is storage directly owned by an object.
- **Retained size** estimates memory that could become collectible if that object and its exclusive descendants were released.
- **Dominator** relationships help identify objects responsible for retaining large subgraphs.

These are tooling models and estimates, not source-language guarantees. DevTools consoles, selected elements, framework extensions, and heap snapshots can retain values while debugging.

## Interview Questions

### Level 1 — Fundamentals

**Question:** How does JavaScript know when an object can be garbage-collected?

**Model answer:** The useful semantic model is reachability. Starting from runtime and host roots, the collector traces strong references. If no root can reach an object, it becomes eligible for reclamation. Eligibility does not guarantee immediate collection or memory return to the operating system.

### Level 2 — Applied understanding

**Question:** Why can a removed DOM node remain in memory?

**Model answer:** Removing a node from the document only removes that document relationship. JavaScript variables, caches, event registrations, framework state, or debugging tools may still retain it. I inspect its retaining path to find the strong reference that conflicts with the intended lifecycle.

### Level 3 — Senior reasoning

**Question:** How would you prove that repeatedly opening a screen leaks memory?

**Model answer:** I define a repeatable open-close lifecycle, establish a settled baseline, repeat the lifecycle, allow collection, and compare multiple heap snapshots. I look for instances that accumulate and inspect their retaining paths and dominators. Then I remove the responsible listener, cache entry, timer, subscription, or framework reference and repeat the same test.

### Level 4 — Deep follow-up

**Question:** When is `WeakMap` preferable to `Map`?

**Model answer:** I use `WeakMap` for metadata associated with object keys when the collection should not own those keys and enumeration is unnecessary. It does not provide observable eviction, size, or iteration, and it does not help if another strong path retains the keys. Bounded or enumerable caches usually need an explicit `Map` policy instead.

## Exercises

### 1. Analyze a cycle

```js
let parent = { name: "parent" };
let child = { name: "child", parent };
parent.child = child;

parent = null;
child = null;
```

<details>
<summary>Solution</summary>

The cycle can become collectible because no remaining application reference reaches either object. The mutual references do not make the cycle a root.

</details>

### 2. Find the listener bug

```js
window.addEventListener("resize", () => updateLayout(model));

return () => {
  window.removeEventListener("resize", () => updateLayout(model));
};
```

<details>
<summary>Solution</summary>

The two arrows are different function objects, so removal does not match the registered listener. Store one callback in a binding and use the same identity for both operations.

</details>

### 3. Choose a cache

You need metadata for DOM elements that should disappear when each element is otherwise unreachable. Do you choose `Map` or `WeakMap`?

<details>
<summary>Solution</summary>

Choose `WeakMap` if the elements are object keys, the metadata should follow their lifetime, and enumeration is unnecessary. A `Map` would strongly retain each element until explicit deletion.

</details>

### 4. Diagnose React cleanup

A component subscribes to a global store whenever `roomId` changes but never returns cleanup. What can accumulate, and what should the effect return?

<details>
<summary>Solution</summary>

The store can retain one callback and its captured render data for every previous room. The effect should return the unsubscribe function—or a function that calls it—so React removes the old subscription before resynchronizing or unmounting.

</details>

## Chapter Summary

- Garbage collection is best understood through strong reachability from roots.
- A leak is unwanted retention across the application's intended lifecycle.
- Removing one reference or DOM relationship does not prove an object is unreachable.
- Cycles can be collected when no root reaches them.
- Weak collections support non-owning object-key associations but are not general cache policies.
- Finalization is nondeterministic and unsuitable for correctness-critical cleanup.
- Listeners, subscriptions, timers, registries, and caches are common retention roots.
- React effects should explicitly undo external synchronization.
- Heap snapshots and retaining paths diagnose retention; repeated experiments establish accumulation.

### Interview-ready explanation

JavaScript garbage collection is best explained with reachability. Objects remain alive while a strong path connects them to a runtime or host root; unreachable objects become eligible for reclamation at an unspecified time. Memory leaks therefore come from unwanted references—often listeners, subscriptions, timers, caches, closures, or module registries—not from the absence of manual `free`. I diagnose them by repeating a lifecycle, comparing heap snapshots, and following retaining paths to the responsible root. `WeakMap` is useful when object-keyed metadata should not own the key, but explicit cleanup and bounded storage remain the primary lifecycle tools, especially in React effects.

## Further Reading

- [ECMA-262: Memory Model](https://tc39.es/ecma262/#sec-memory-model)
- [ECMA-262: WeakMap Objects](https://tc39.es/ecma262/#sec-weakmap-objects)
- [ECMA-262: WeakRef Objects](https://tc39.es/ecma262/#sec-weak-ref-objects)
- [ECMA-262: FinalizationRegistry Objects](https://tc39.es/ecma262/#sec-finalization-registry-objects)
- [MDN: Memory Management](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management)
- [Chrome DevTools: Fix Memory Problems](https://developer.chrome.com/docs/devtools/memory-problems/)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
