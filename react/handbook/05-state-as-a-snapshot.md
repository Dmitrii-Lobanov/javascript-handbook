# Chapter 5 — State as a Snapshot

## Quick refresher

Each render receives a fixed snapshot of state. Calling a setter schedules a future render; it does not change variables inside the event handler already running.

## Why this matters

This explains stale logs, delayed callbacks, repeated setters, and why event handlers observe the values from the render that created them.

## Core mental model

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
    console.log(count); // current render's snapshot
  }

  return <button onClick={increment}>{count}</button>;
}
```

`count` remains `0` throughout that handler when it was invoked from the render where `count` was `0`. React schedules another render with the next value.

Closures preserve the same snapshot:

```tsx
function showLater() {
  const submitted = message;
  setTimeout(() => alert(submitted), 1000);
}
```

The callback sees the submitted value, not automatically the latest value. Use a ref only when a callback truly needs the latest mutable value; do not use refs to bypass normal state reasoning.

## Common traps

- Expecting a state variable to mutate immediately after its setter.
- Calling `setCount(count + 1)` repeatedly and expecting cumulative updates.
- Calling every captured value a bug; snapshots often provide intentional consistency.
- Using refs everywhere to force “latest” behavior.

## Interview answer

State behaves like a snapshot attached to a render. Event handlers and callbacks close over that render’s values. A setter queues an update and causes React to create a later render; it does not mutate the current JavaScript variable. When the next value depends on queued previous state, use a functional updater.

## Check yourself

Why does a timeout created by an event handler normally see the state from the click rather than the state at timeout execution?
