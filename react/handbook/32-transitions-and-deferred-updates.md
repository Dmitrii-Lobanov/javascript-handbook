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

## Choose the scheduling tool

| Requirement | Tool |
| --- | --- |
| Mark a state update you control as non-urgent | `startTransition` / `useTransition` |
| Let a consumer lag behind a changing prop or state value | `useDeferredValue` |
| Wait for inactivity before starting a request | Debouncing |
| Limit repeated events to a maximum rate | Throttling |
| Make an expensive calculation cheaper | Better algorithm, caching, or less work |

`useTransition` also provides `isPending`, which describes pending transition work. The standalone `startTransition` is appropriate when that pending indicator is unnecessary.

## Async transition caveat

Updates scheduled after an `await` may need another transition boundary:

```tsx
startTransition(async () => {
  const nextData = await loadData();

  startTransition(() => {
    setData(nextData);
  });
});
```

Framework or action APIs may coordinate this for you, but in an interview explain that priority is attached to state updates, not permanently to the async function.

## Preserve stale content intentionally

With a deferred value, the current input and displayed results can temporarily disagree:

```tsx
const isStale = query !== deferredQuery;

<section aria-busy={isStale} className={isStale ? "results--stale" : ""}>
  <Results query={deferredQuery} />
</section>
```

The UI should communicate that distinction without blocking urgent input. Avoid replacing useful stale content with a disruptive spinner when it can remain visible.

## Know the limits

Transitions cannot defer the state update that controls a text input, do not automatically cancel network requests, and do not make synchronous JavaScript outside React interruptible. They help React prioritize rendering work.

## Common traps

- Expecting transitions to reduce computation time.
- Marking the controlled input update as non-urgent.
- Confusing `isPending` with a network loading state.
- Using deferral instead of fixing an unnecessarily expensive tree.
- Hiding stale content without communicating pending state.

## Interview answer

Transitions separate urgent updates, such as input feedback, from non-urgent rendering that may be interrupted. `startTransition` marks an update I control; `useDeferredValue` gives a subtree a deferred version of a value. They improve scheduling rather than computation, so I still reduce expensive work and use debouncing separately when I need to limit external requests.

## Follow-up questions

### Why not put the controlled input update in a transition?

The input value must update synchronously with typing. Deferring it can make the control feel incorrect or laggy; defer the expensive dependent UI instead.

### Does a transition debounce requests?

No. React may interrupt rendering, but request side effects need their own debouncing, deduplication, or cancellation strategy.

### When is `useDeferredValue` preferable to `useTransition`?

When the component receives or owns a rapidly changing value but cannot wrap the update that produced it. It passes a lagging value to the expensive subtree.

## Check yourself

1. How does `useDeferredValue(query)` differ from debouncing it before a network request?
2. What does `isPending` actually represent?
3. Why must transition rendering remain pure?
4. How should stale deferred content be communicated?
5. What should you do when an update after `await` is not treated as a transition?
