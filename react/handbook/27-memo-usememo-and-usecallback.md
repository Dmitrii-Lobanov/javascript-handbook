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

## Choose the matching tool

| Tool | What it stabilizes | Typical justified use |
| --- | --- | --- |
| `memo` | A component result by props | An expensive child often receives equal props |
| `useMemo` | A calculated value | A costly calculation often has unchanged inputs |
| `useCallback` | A function identity | A memoized consumer or dependency needs stability |

`useCallback(fn, deps)` is conceptually similar to `useMemo(() => fn, deps)`. It does not make the function body faster and does not stop JavaScript from evaluating the function expression.

## Work through the boundary

Ask four questions before memoizing:

1. Is there a measured or credible expensive interaction?
2. Which work would this cache skip?
3. Do the dependencies remain equal often enough?
4. Is the comparison and maintenance cost smaller than the skipped work?

If a parent recreates `items` on every render, stabilizing only `onSelect` will not help a `memo` bailout. All props observed by the comparison must remain equal.

## Correct dependency handling

Never omit a dependency merely to preserve a cache. Restructure the code instead. Functional updates can sometimes remove a state dependency:

```tsx
const addItem = useCallback((item: Item) => {
  setItems(current => [...current, item]);
}, []);
```

The callback no longer reads `items`, so it does not need `items` as a dependency.

## Common traps

- Using `useMemo` for correctness or side effects.
- Adding `useCallback` when no consumer benefits from stable identity.
- Writing expensive custom prop comparators that omit function closures.
- Ignoring memory retention and dependency complexity.

## Interview answer

`memo` caches a component render by props, `useMemo` caches a calculation, and `useCallback` caches a function identity. I use them together only at a measured expensive boundary whose inputs often stay equal. I first improve state placement and the work itself, because memoization adds comparisons, retained values, and dependency maintenance.

## Follow-up questions

### Does `memo` prevent every render?

No. The component still renders when its own state changes or a context it consumes changes. React may also render it for other implementation reasons; memoization is an optimization, not a semantic guarantee.

### Should cheap derived data be wrapped in `useMemo`?

Usually not. The dependency comparison and added complexity may cost as much as recomputing it. Memoize when measurement or the computation's scale supports it.

### When can a custom `memo` comparator be dangerous?

If it treats changed callbacks as equal, the child can keep a callback that closes over old props or state. A deep comparison may also be slower than rendering.

## Check yourself

1. When does `useCallback` make no observable performance difference?
2. Why can one unstable prop defeat `memo`?
3. Why is `useMemo` unsuitable for semantic persistence?
4. How can a functional update reduce callback dependencies?
5. What would you measure before and after memoizing?
