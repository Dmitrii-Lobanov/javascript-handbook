# Chapter 45 — Race Conditions and Cancellation

## Quick refresher

Async operations can finish out of order. Cleanup should cancel obsolete work when possible and prevent obsolete results from updating state.

## Why this matters

Without ownership rules, an older request can replace newer UI, or an unmounted feature can continue consuming resources.

## Core mental model

```tsx
useEffect(() => {
  const controller = new AbortController();
  let ignore = false;

  search(query, controller.signal).then(result => {
    if (!ignore) setResult(result);
  });

  return () => {
    ignore = true;
    controller.abort();
  };
}, [query]);
```

Cancellation stops unnecessary supported work. The ignore guard ensures that this Effect execution cannot commit after losing ownership, even if the abstraction does not honor abort fully.

Server-state libraries often implement cancellation, deduplication, and request identity. Mutations additionally require idempotency and conflict strategy; blindly cancelling a client request does not guarantee the server did not apply it.

## Separate transport from ownership

Two independent questions matter:

1. Can obsolete work be stopped to save resources?
2. Is this result still allowed to update the current UI?

`AbortController` addresses the first when the API honors its signal. A request ID, resource key, or closure invalidation addresses the second. Robust code often needs both.

## Common race patterns

| Scenario | Correctness rule |
| --- | --- |
| Search query changes | Only results for the current query may render |
| Route parameter changes | Old route data must not replace the new route |
| Component unmounts | Its abandoned operation must not own later UI |
| Multiple saves overlap | Define ordering, versioning, or conflict behavior |
| Retry follows uncertain failure | Use idempotency to avoid duplicate mutation |

“Latest request wins” is suitable for search, but not universal. A chat send may need to preserve submission order, while document edits may require version checks or merging.

## Handle abort distinctly

An abort caused by superseding work is normally not a user-facing failure. Do not replace newer content with an error banner for an intentionally cancelled request. Still surface genuine network, parsing, authorization, and server errors.

## Prefer an owner with request identity

Route loaders and server-state libraries can associate data with a key, deduplicate requests, cancel obsolete work, and retain useful previous data. Raw Effects are reasonable for focused imperative integrations, but reproducing a complete query cache inside every component is error-prone.

## Common traps

- Assuming request completion order matches start order.
- Treating abort as proof that no server mutation occurred.
- Reporting cancellation as an error.
- Updating shared state without checking which request owns it.

## Interview answer

I associate async work with the render or operation that started it. Cleanup aborts supported work and invalidates that execution so stale results cannot commit. For mutations I also design idempotency and reconciliation because cancelling transport does not necessarily cancel server-side effects.

## Follow-up questions

### Why is “last response wins” incorrect?

Network completion order is unrelated to the latest user intent. An older, slower request can finish after the newer request and overwrite it.

### Does aborting `fetch` undo a POST?

No. The server may already have received or committed it. Mutation safety requires server-side idempotency, transaction rules, or reconciliation.

### When is an ignore flag enough?

It can protect UI ownership when work cannot be cancelled, but the obsolete operation still consumes network and server resources.

## Check yourself

1. Why might an ignore guard remain useful with `AbortController`?
2. When is “latest request wins” the wrong policy?
3. How should intentional cancellation appear in the UI?
4. What problem does an idempotency key solve?
5. Why can mutation ordering require server versioning?
