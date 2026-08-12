# Chapter 32 — Transitions and Deferred Updates

## Quick refresher

Transitions mark updates as non-urgent so urgent interactions can remain responsive. `useDeferredValue` lets a subtree lag behind a rapidly changing value.

## Why this matters

Concurrent scheduling can improve responsiveness when expensive UI updates compete with typing or navigation. It does not make the expensive work faster or replace debouncing.

## Core mental model

Keep the controlled input urgent and defer the expensive result update:

```tsx
const [query, setQuery] = useState("");
const deferredQuery = useDeferredValue(query);

return (
  <>
    <input value={query} onChange={event => setQuery(event.target.value)} />
    <Results query={deferredQuery} />
  </>
);
```

The input reflects every key immediately while `Results` may temporarily render an older query. Indicate stale content visually when that distinction matters.

Use `startTransition` when you control the state update:

```tsx
const [isPending, startTransition] = useTransition();

function selectTab(tab: Tab) {
  startTransition(() => setActiveTab(tab));
}
```

Transition work is interruptible and can be restarted by urgent updates. Therefore rendering must remain pure. Do not use transitions to control text inputs, and do not wrap work that must complete immediately.

Debouncing waits for inactivity and reduces how often work starts. Deferral allows work to begin but gives urgent updates priority. They solve different problems and may sometimes be combined.

## Common traps

- Expecting transitions to reduce computation time.
- Marking the controlled input update as non-urgent.
- Confusing `isPending` with a network loading state.
- Using deferral instead of fixing an unnecessarily expensive tree.
- Hiding stale content without communicating pending state.

## Interview answer

Transitions separate urgent updates, such as input feedback, from non-urgent rendering that may be interrupted. `startTransition` marks an update I control; `useDeferredValue` gives a subtree a deferred version of a value. They improve scheduling rather than computation, so I still reduce expensive work and use debouncing separately when I need to limit external requests.

## Check yourself

How does `useDeferredValue(query)` differ from debouncing `query` before a network request?
