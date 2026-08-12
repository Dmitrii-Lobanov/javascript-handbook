# Chapter 27 — memo, useMemo, and useCallback

## Quick refresher

- `memo` may skip rendering a component when its props compare equal.
- `useMemo` caches a calculated value between renders.
- `useCallback` caches a function identity; it does not prevent creating the function expression.
- All three are performance optimizations, not correctness tools.

## Why this matters

These APIs are frequently overused in interviews. A strong answer explains the boundary, cost, and evidence that make memoization valuable.

## Core mental model

```tsx
const Results = memo(function Results({ items, onSelect }: Props) {
  return items.map(item => (
    <button key={item.id} onClick={() => onSelect(item)}>{item.name}</button>
  ));
});

const visibleItems = useMemo(
  () => expensiveFilter(items, query),
  [items, query],
);

const handleSelect = useCallback(
  (item: Item) => onSelect(item.id),
  [onSelect],
);
```

This combination is useful only if `Results` is expensive, its inputs often remain unchanged, and the cache costs less than the skipped work. One always-new prop breaks the `memo` bailout.

`useMemo` is not a semantic guarantee. Code should remain correct if React discards the cached value. Use state or refs for information whose persistence is part of behavior.

Prefer structural fixes first: colocate state, accept JSX children, remove unnecessary Effects, and reduce the underlying computation.

## Common traps

- Using `useMemo` for correctness or side effects.
- Adding `useCallback` when no consumer benefits from stable identity.
- Writing expensive custom prop comparators that omit function closures.
- Ignoring memory retention and dependency complexity.

## Interview answer

`memo` caches a component render by props, `useMemo` caches a calculation, and `useCallback` caches a function identity. I use them together only at a measured expensive boundary whose inputs often stay equal. I first improve state placement and the work itself, because memoization adds comparisons, retained values, and dependency maintenance.

## Check yourself

When does `useCallback` make no observable performance difference?
