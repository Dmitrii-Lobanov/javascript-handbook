# Chapter 11 — Closures and State Updates

## Quick refresher

Every render creates new variables and functions. A callback closes over the props and state from the render in which it was created.

## Why this matters

Closures explain stale asynchronous callbacks, missing Effect dependencies, repeated state updates, and many incorrect attempts to “fix” React with refs.

## Core mental model

This interval captures the initial `count` because the Effect never reruns:

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);
```

If the update only needs previous state, remove the captured dependency:

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(value => value + 1), 1000);
  return () => clearInterval(id);
}, []);
```

If an Effect needs a reactive value, include it as a dependency and accept the corresponding resynchronization. If a long-lived external callback truly needs the latest value without causing resubscription, use the appropriate modern Effect-event pattern when available, or a carefully synchronized ref.

A stale closure is not inherently wrong. A submission handler should often retain the values submitted at that moment. The question is whether snapshot or latest-value semantics match the requirement.

## Common traps

- Removing dependencies to silence the linter.
- Calling all captured values stale bugs.
- Using refs to hide reactive data from React.
- Using a functional updater when the callback also needs other changing props.

## Interview answer

Each render creates a snapshot, and its callbacks close over that snapshot. I first decide whether the operation should use the value from that render or the latest value. Functional updates solve previous-state calculations; correct dependencies resynchronize Effects; refs are reserved for mutable values whose changes should not render.

## Check yourself

Why does a functional updater fix an interval that increments state but not one that also reads a changing `step` prop?
