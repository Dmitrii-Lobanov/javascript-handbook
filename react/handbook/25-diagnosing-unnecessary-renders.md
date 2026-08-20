# Chapter 25 — Diagnosing Unnecessary Renders

## Quick refresher

- A render is not automatically a performance problem.
- Find a slow user interaction before counting renders.
- Use the React Profiler to identify expensive commits and components.
- Fix state ownership and component boundaries before adding memoization.
- Measure again to verify that the change improved user-visible behavior.

## Why this matters

“This component rerenders too much” is a common but incomplete diagnosis. Rendering is how React calculates UI. A fast render that produces no expensive commit may be harmless, while one infrequent render of a large tree may block an important interaction.

Senior candidates should connect a user-visible symptom to measured React work and then choose the smallest justified change.

## Core mental model

Use this investigation chain:

```text
slow interaction
      ↓
record a profile
      ↓
find the expensive commit
      ↓
identify why components rendered
      ↓
change ownership, work, or boundaries
      ↓
profile again
```

Start with a reproducible interaction, representative data, and a production-like build. In React DevTools Profiler, inspect:

- which commit overlaps the delay;
- which components consumed the most render time;
- why they rendered;
- whether the cost is React rendering or browser layout, paint, or scripting outside React.

## Common causes

### State is owned too high

```tsx
function Page() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchBox value={query} onChange={setQuery} />
      <ExpensiveDashboard />
    </>
  );
}
```

Every keystroke renders `Page` and normally evaluates `ExpensiveDashboard`. If only search needs the query, move the state into a smaller subtree. Colocation can eliminate work without adding memoization.

### Expensive work runs during every render

```tsx
const visibleRows = sortAndFilter(rows, query);
```

First improve the algorithm or reduce the data processed. If the calculation is genuinely expensive and its inputs often remain unchanged, `useMemo` may avoid repeating it.

### A large subtree receives a frequently changing value

Broad context providers, animation state, pointer coordinates, or controlled input state can notify more consumers than necessary. Split ownership or subscription boundaries so frequently changing data reaches only the components that need it.

### Child props change identity

New objects and functions can defeat `memo`:

```tsx
<Results filters={{ query }} onSelect={item => selectItem(item)} />
```

Do not stabilize every value automatically. First confirm that `Results` is expensive, memoized, and frequently receives otherwise unchanged inputs. Then simplify the API, move value creation, or stabilize the relevant props.

## Choosing the fix

Prefer fixes in this order:

1. colocate state and narrow update scope;
2. remove unnecessary Effects and derived-state updates;
3. reduce expensive work or improve its algorithm;
4. split large components at meaningful boundaries;
5. virtualize large collections;
6. apply `memo`, `useMemo`, or `useCallback` where profiling justifies them;
7. use transitions when non-urgent work cannot be avoided synchronously.

Memoization trades computation for comparisons, retained values, dependency management, and API complexity. It is useful when skipped work is more expensive than those costs.

## Common traps

- Treating every parent-to-child render as waste.
- Measuring only in development or with tiny test data.
- Adding `useCallback` when the callback is not passed to a memoized consumer or used as a dependency.
- Ignoring browser layout and paint because the React profile looks busy.
- Comparing render counts instead of interaction latency.
- Optimizing a component that is not on a user-critical path.

## Interview answer

I start from a slow user interaction, reproduce it with representative data, and record a React profile. I identify the expensive commit, the components that consumed time, and why they rendered, while checking whether the real cost is outside React. I first narrow state ownership, remove redundant updates, and reduce the work performed. I add memoization only at an expensive boundary with stable inputs, then profile the same interaction again to verify the improvement.

## Follow-up questions

### Does a child always render when its parent renders?

React normally evaluates the child again when the parent renders. That is not necessarily waste: the calculation may be cheap, and React may commit no DOM changes. A memoized child can bail out when its props compare equal.

### Why can component splitting improve performance without `memo`?

Splitting can move frequently changing state into a smaller owner. React then starts the update from that owner rather than reevaluating an unrelated parent subtree.

### When should you use a transition?

Use a transition when a necessary, non-urgent render competes with urgent feedback such as typing. It improves scheduling; it does not reduce the amount of work.

## Check yourself

1. Why is a high render count not sufficient evidence of a performance problem?
2. When can moving state downward outperform wrapping a large subtree in `memo`?
3. What evidence would justify adding `useCallback`?
4. How would you distinguish React render cost from layout or paint cost?
5. Why should the optimized interaction be profiled again?

## Related chapters

- [What causes a component to render](/react/handbook/chapters/02-what-causes-a-component-to-render)
- [State ownership and lifting state](/react/handbook/chapters/17-state-ownership-and-lifting-state)
- [React performance investigations](/performance/investigations)
