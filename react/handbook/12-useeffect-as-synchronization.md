# Chapter 12 — useEffect as Synchronization

## Quick refresher

An Effect synchronizes a component with something outside React: a network connection, browser API, third-party widget, timer, or subscription.

## Why this matters

Treating Effects as generic “run after render” callbacks produces redundant state, tangled data flow, race conditions, and unnecessary renders.

## Core mental model

```text
render describes UI
event handlers respond to interactions
Effects synchronize with external systems
```

```tsx
useEffect(() => {
  const connection = createConnection(roomId);
  connection.connect();
  return () => connection.disconnect();
}, [roomId]);
```

The Effect establishes synchronization for the current `roomId`. When it changes, React cleans up the old connection and establishes the new one.

Do not use an Effect for calculations:

```tsx
// Derive during render instead.
const visibleItems = items.filter(item => item.name.includes(query));
```

Do not move interaction-specific work into an Effect merely because state changed. If submitting a form causes a POST request, perform it in the submit handler; the user event is the cause.

Framework data APIs or server-state libraries may be better than hand-written fetching Effects because they provide caching, deduplication, server rendering, and loading coordination.

## Ask why the code should run

Use this decision sequence:

```text
Can it be calculated from current props and state?
  → calculate during render

Did a specific user interaction cause it?
  → run it in that event handler

Must an external system match the committed UI?
  → use an Effect
```

Sending an order belongs to the submit flow:

```tsx
async function handleSubmit(event: FormEvent) {
  event.preventDefault();
  await placeOrder(cart);
  navigate("/confirmation");
}
```

Setting `submitted=true` and watching it with an Effect disconnects the operation from its cause and can repeat it after remounting or state restoration.

## Think in setup and cleanup pairs

An Effect describes synchronization that should exist while particular inputs are current:

```tsx
useEffect(() => {
  const observer = new ResizeObserver(handleResize);
  observer.observe(element);

  return () => observer.disconnect();
}, [element]);
```

Cleanup is not only “unmount logic.” React runs it before replacing this synchronization with one for changed dependencies.

## Effects run after commit

Effects never run for a render React abandons. Passive `useEffect` normally does not block paint. `useLayoutEffect` runs after DOM mutation but before paint and is appropriate only when layout must be measured and corrected synchronously.

```tsx
useLayoutEffect(() => {
  const rect = tooltipRef.current?.getBoundingClientRect();
  setPosition(calculatePosition(rect));
}, [anchor]);
```

Layout Effects delay painting, so prefer passive Effects for synchronization that does not affect the initial visual frame.

## Data fetching is synchronization—but often belongs elsewhere

A client Effect can fetch data, but it starts only after the component commits and needs manual handling for cancellation, caching, duplicate requests, loading states, and server rendering.

Use an Effect when integrating a simple client-only data source. Prefer router loaders, framework data APIs, or a server-state library when the application needs coordinated fetching behavior.

## Effect decision table

| Work | Correct location |
| --- | --- |
| Filter current rows | Render |
| Submit a form | Event or Action |
| Connect to the current room | Effect |
| Focus after a button click | Usually the handler |
| Measure committed layout before paint | Layout Effect |
| Cache server data across screens | Framework or server-state layer |

## Common traps

- Using Effects to derive local data.
- Triggering user-event side effects indirectly through state.
- Thinking `[]` means “run once” rather than “uses no reactive values.”
- Fetching without accounting for stale responses or framework capabilities.

## Interview answer

I use `useEffect` to keep an external system synchronized with the current rendered state. The setup describes the synchronization and cleanup undoes it. Derived values stay in render, and interaction-caused work stays in event handlers. This framing makes dependencies and cleanup consequences easier to reason about.

## Follow-up questions

### Is every post-render operation an Effect?

No. Derived calculations belong in render and interaction-caused operations belong in their handlers.

### Why does an Effect return cleanup?

Cleanup ends the exact synchronization established by that setup before replacement or unmounting.

### When is a fetching Effect acceptable?

For a simple client-only integration where its manual loading, cancellation, caching, and race-handling tradeoffs are acceptable.

## Check yourself

1. Should click analytics run in an Effect or the interaction flow?
2. Why is cleanup executed when dependencies change?
3. When is `useLayoutEffect` justified?
4. Why is derived data not an external synchronization?
5. What capabilities are missing from a basic fetching Effect?
