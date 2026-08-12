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

## Common traps

- Assuming request completion order matches start order.
- Treating abort as proof that no server mutation occurred.
- Reporting cancellation as an error.
- Updating shared state without checking which request owns it.

## Interview answer

I associate async work with the render or operation that started it. Cleanup aborts supported work and invalidates that execution so stale results cannot commit. For mutations I also design idempotency and reconciliation because cancelling transport does not necessarily cancel server-side effects.

## Check yourself

Why might an ignore guard remain useful when using `AbortController`?
