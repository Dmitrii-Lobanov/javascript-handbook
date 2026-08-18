# Chapter 2 — What Causes a Component to Render

## Quick refresher

A component function can run because:

- React is mounting it for the first time;
- its own state was updated;
- an ancestor rendered and React continued rendering through this child;
- a context value it consumes changed;
- an external store it subscribes to produced a new snapshot.

“A component renders when its props change” is not a complete mental model. Props are values supplied during a parent render. By default, rendering a parent also renders its child components whether or not their props changed.

## Why this matters

Interview questions about unnecessary renders, `memo`, Context, referential equality, and React performance all depend on understanding what actually schedules or propagates rendering.

You should be able to separate three different events:

1. An update is scheduled.
2. React calls a component to calculate its next output.
3. React commits a visible DOM change if reconciliation finds one.

These events are related, but they are not equivalent.

## Core mental model

```text
update source
  ↓
React renders the affected component
  ↓
React normally continues through its descendants
  ↓
memoization or another bailout may skip some work
  ↓
React commits only the required host changes
```

## 1. Initial render

When a root is rendered for the first time, React calls the components needed to construct its tree and then commits their host output.

```tsx
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

This is the component’s initial render or mount. An update renders an already mounted component again; it does not necessarily remount it.

## 2. State updates

Calling a state setter requests an update. React queues the update and calculates the next state during rendering.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(current => current + 1)}>
      Count: {count}
    </button>
  );
}
```

The setter does not mutate the `count` variable in the currently running event handler. State behaves like a snapshot for that render. React normally batches multiple updates from the same interaction before rendering.

React compares the next state with the current state using `Object.is`. If they are equal, React can skip committing the update and rendering descendants. React may still need to call the component while processing an update before determining that it can bail out, so correctness must never depend on the exact call count.

```tsx
setCount(0); // May bail out when count is already 0.
```

Mutating an object and passing the same reference back is a bug because React sees the same state identity:

```tsx
// Wrong
user.name = "Ada";
setUser(user);

// Correct
setUser(current => ({ ...current, name: "Ada" }));
```

The same principles apply to `useReducer`: dispatching schedules an update, and returning the current state object can allow React to bail out.

## 3. Parent renders

By default, when a parent renders, React evaluates the child components returned by that parent too.

```tsx
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(value => value + 1)}>
        Parent count: {count}
      </button>
      <Child label="Stable" />
    </>
  );
}

function Child({ label }: { label: string }) {
  console.log("Child rendered");
  return <p>{label}</p>;
}
```

Updating `count` renders `Parent`. React then normally calls `Child`, even though `label` is still the primitive string `"Stable"`. The child rendering still may produce no DOM mutation.

A prop change does not independently notify a child. The child receives new props because its parent rendered and produced a new child element description.

## 4. Context changes

A component that reads a context is subscribed to that context. When the nearest provider receives a different `value` according to `Object.is`, React renders its consumers.

```tsx
type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");

function ThemeLabel() {
  const theme = useContext(ThemeContext);
  return <span>Theme: {theme}</span>;
}
```

Context propagation is independent of a `memo` props comparison. A memoized component must still render when a context value it consumes changes.

Object and function provider values deserve attention because a new reference is unequal on every render:

```tsx
// A new object is created whenever App renders.
<SettingsContext.Provider value={{ locale, setLocale }}>
  {children}
</SettingsContext.Provider>
```

This is not automatically a performance problem. Measure first. If the provider has broad, expensive consumers, split contexts by responsibility or stabilize the value where that provides a demonstrated benefit.

## 5. External-store subscriptions

Data outside React can request rendering through a subscription. The supported low-level integration is `useSyncExternalStore`.

```tsx
function OnlineStatus() {
  const online = useSyncExternalStore(
    subscribeToNetwork,
    getNetworkSnapshot,
    getServerNetworkSnapshot,
  );

  return <p>{online ? "Online" : "Offline"}</p>;
}
```

React calls `getSnapshot` and compares the returned value with the previous snapshot using `Object.is`. The snapshot must be stable while the store has not changed. Returning a fresh object every time can create repeated updates.

State-management libraries commonly implement equivalent subscription behavior for you.

## Rendering descendants and bailouts

React normally walks from an updated component into the elements it returns. It can skip some work when identity and inputs prove that recalculation is unnecessary.

Common bailout mechanisms include:

- setting state to a value equal to the current value;
- `memo` skipping a component when its props compare equal;
- preserving an already created React element object;
- framework or compiler optimizations that safely reuse previous work.

These are optimizations, not new application semantics. Your component must behave correctly even if React renders it again.

## What `memo` actually does

`memo` can skip a child render when its parent renders and the child’s props are equal.

```tsx
const Child = memo(function Child({ label }: { label: string }) {
  return <p>{label}</p>;
});
```

By default, React compares each prop using `Object.is`. Primitive props often remain equal naturally. Inline objects, arrays, and functions create new references:

```tsx
// These props are new references on each Parent render.
<Chart options={{ showLegend: true }} onSelect={() => selectItem(id)} />
```

`useMemo` and `useCallback` can stabilize those references, but adding them everywhere increases complexity and may provide no measurable benefit. Use the React Profiler to find expensive render paths first.

`memo` does not prevent rendering caused by:

- the component’s own state update;
- a context change the component consumes;
- an external-store subscription update;
- props that are genuinely different.

It is also a performance optimization rather than a correctness guarantee.

## Render trigger comparison

| Source | What changed? | Important nuance |
| --- | --- | --- |
| Initial mount | The component enters the tree | Produces its first committed output |
| Local state | A queued state value | Equal state can allow a bailout |
| Parent render | An ancestor is recalculating its subtree | Child props do not have to change |
| Context | A consumed provider value | Can render a memoized consumer |
| External store | The subscribed snapshot | Snapshot identity must be stable |

## How to diagnose an unexpected render

Use a repeatable process instead of adding memoization immediately:

1. Confirm the render with React DevTools Profiler.
2. Identify whether state, a parent, context, or an external store initiated it.
3. Inspect which props or context values changed identity.
4. Decide whether the render is actually expensive or user-visible.
5. Reduce state scope, split context, stabilize an input, or memoize only when the measurement justifies it.
6. Profile again to verify the result.

A frequent improvement is moving rapidly changing state closer to the components that need it. This reduces the size of the subtree reached by each update without adding comparison overhead.

## Common traps

- Saying a component renders only when its props change.
- Treating changed props as an independent notification mechanism.
- Assuming every component render changes the DOM.
- Assuming `memo` blocks state or context updates.
- Mutating state and returning the same object reference.
- Returning a fresh object from `useSyncExternalStore` on every read.
- Memoizing every value without measuring the render cost.
- Using a custom `memo` comparison that ignores a function prop and captures stale state.
- Confusing a re-render with a remount and state reset.
- Using console logs alone to evaluate development behavior under Strict Mode.

## Interview answer

A component renders when it mounts and when React processes an update from its own state, an ancestor render, a context it consumes, or a subscribed external store. Props do not independently trigger rendering; a component receives new props when its parent renders. By default React continues rendering through descendants, although equal state or memoization can create bailouts. `memo` only compares props and does not block the component’s own state, consumed context, or store updates. Finally, rendering is only calculation—the DOM changes only if reconciliation produces something to commit.

## Follow-up questions

### If a parent renders, does every descendant render?

React normally follows the elements returned by the parent and renders their component children. Bailouts such as `memo`, equal state, or reused element identity can skip parts of the tree.

### Does changing a regular variable cause a render?

No. React does not track arbitrary local variables or ref mutations. A render must be scheduled through state, context, an external subscription, or a new root render.

### Does changing a ref cause a render?

No. Updating `ref.current` is intentionally mutable and does not notify React. Use state when a value must affect rendered output.

### Can `memo` stop a context-driven render?

Not when the memoized component itself consumes the changed context. The props comparison and context subscription are separate.

### Why can an inline function defeat `memo`?

The parent creates a new function object on every render. Since `Object.is` sees a different reference, the memoized child’s props are not equal.

### Is an extra render always a performance problem?

No. Many renders are cheap, and React may commit no DOM changes. Optimize a measured bottleneck rather than render counts in isolation.

## Check yourself

1. Why can a child render when all its primitive props have the same values?
2. What is the difference between a component re-rendering and remounting?
3. Why can returning the same mutated state object prevent an expected update?
4. Which updates can still render a component wrapped in `memo`?
5. Why must an external-store snapshot have stable identity?
6. What should you measure before introducing `useMemo` or `useCallback`?
