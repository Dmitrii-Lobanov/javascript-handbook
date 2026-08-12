# Chapter 7 — Batching and Functional Updates

## Quick refresher

React queues state updates and batches them so related updates can produce fewer renders. Functional updaters calculate the next state from the previously queued state.

## Why this matters

This topic tests whether you can reason about multiple updates without treating setters as immediate assignments.

## Core mental model

```tsx
function addThree() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

All three expressions use the same `count` snapshot, so they request the same replacement value. To compose updates, pass updater functions:

```tsx
function addThree() {
  setCount(value => value + 1);
  setCount(value => value + 1);
  setCount(value => value + 1);
}
```

React processes the queue in order, passing each updater the result of the previous one. Use an updater whenever the next state depends on previous state, especially when multiple updates may be queued.

Modern React batches updates from more asynchronous contexts than older versions. Batching is an implementation optimization: code should depend on state semantics, not on counting renders. `flushSync` exists for rare DOM-integration cases that require an immediate commit, but it can harm performance and should not be routine.

## Common traps

- Treating setters as synchronous assignments.
- Repeating replacement updates based on one stale snapshot.
- Mutating an object inside an updater instead of returning a new value.
- Reaching for `flushSync` to make ordinary application logic work.

## Interview answer

React queues and batches state updates before rendering. Replacement updates created from the same snapshot can overwrite one another conceptually. Functional updaters receive the latest queued value, so they compose correctly and are the right choice when next state depends on previous state. Batching reduces work but should not change the meaning of the update logic.

## Check yourself

What value results from three `setCount(count + 1)` calls, and how do three functional updaters differ?
