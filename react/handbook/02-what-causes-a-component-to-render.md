# Chapter 2 — What Causes a Component to Render

## Quick refresher

A component renders on initial mount and when React processes an update involving it: its own state changes, an ancestor renders, consumed context changes, or a subscribed external store reports a change.

## Why this matters

“Props changed” is an incomplete answer. By default, when a parent renders, React evaluates its child components too—even if their props are referentially unchanged.

## Core mental model

```tsx
function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <Child label="Stable" />
    </>
  );
}
```

Updating `count` renders `Parent`, and React normally calls `Child` as it walks the returned tree. `memo(Child)` may skip that child render when its props compare equal, but memoization is a performance optimization, not a semantic guarantee.

Calling a state setter with the same value may let React bail out using `Object.is`. Context consumers render when the provider value they consume changes. External stores should integrate through `useSyncExternalStore` or a library built on equivalent guarantees.

## Common traps

- Saying a component renders only when its props change.
- Assuming `memo` prevents all renders.
- Mutating state and passing the same object reference back.
- Optimizing before using the React Profiler to identify expensive work.

## Interview answer

A component renders initially and when its state updates, its parent renders, consumed context changes, or an external subscription schedules an update. React can bail out in some cases, and memoization can skip child work when inputs compare equal. Rendering still does not imply a DOM mutation; the commit depends on the reconciled result.

## Check yourself

If a parent’s state changes but a child receives the same primitive props, why might the child function still run?
