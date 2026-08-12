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

## Common traps

- Using Effects to derive local data.
- Triggering user-event side effects indirectly through state.
- Thinking `[]` means “run once” rather than “uses no reactive values.”
- Fetching without accounting for stale responses or framework capabilities.

## Interview answer

I use `useEffect` to keep an external system synchronized with the current rendered state. The setup describes the synchronization and cleanup undoes it. Derived values stay in render, and interaction-caused work stays in event handlers. This framing makes dependencies and cleanup consequences easier to reason about.

## Check yourself

Should analytics for “the user clicked Buy” run in an Effect watching purchase state or in the click/submission flow?
