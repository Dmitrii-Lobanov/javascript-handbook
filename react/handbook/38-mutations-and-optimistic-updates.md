# Chapter 38 — Mutations and Optimistic Updates

## Quick refresher

A mutation changes server-owned data. An optimistic update shows the expected result before confirmation, then reconciles success or rolls back failure.

## Why this matters

Optimism improves perceived responsiveness but introduces concurrency, rollback, identity, and error-handling problems.

## Core mental model

```text
capture previous state → apply optimistic state → send mutation
                                      ↙ success     ↘ failure
                               reconcile result    rollback
```

Give optimistic records temporary IDs and track pending state. Prefer operation-specific rollback over replacing an entire cache snapshot, which could erase newer successful changes. Server responses remain authoritative.

Optimism is best for likely-successful, understandable, reversible actions. Destructive, financial, permission-sensitive, or conflict-heavy actions may require confirmation or pessimistic UI.

Prevent duplicate submissions, make server operations idempotent when possible, and announce pending or failed state accessibly.

## Represent each operation

Track enough metadata to distinguish overlapping work:

```ts
type PendingItem<T> = {
  clientMutationId: string;
  status: "pending" | "failed";
  value: T;
};
```

A client mutation ID lets the response reconcile the matching optimistic record even when requests finish out of order. A server idempotency key can prevent repeated requests from applying the same operation twice.

## Choose a reconciliation strategy

| Server result | Client response |
| --- | --- |
| Success matches prediction | Clear pending state and use authoritative data |
| Server normalizes or enriches data | Replace optimistic fields with response fields |
| Validation or permission failure | Roll back that operation and show actionable feedback |
| Newer edit already exists | Merge carefully; do not restore an old whole-cache snapshot |
| Network outcome is unknown | Retry idempotently or present a recoverable uncertain state |

For a toggle, rollback may mean applying the inverse operation. For creating an item, remove or mark only its temporary record. Operation-specific recovery composes better than restoring the complete cache.

## React optimistic state

`useOptimistic` can derive temporary UI while an Action is pending:

```tsx
const [optimisticItems, addOptimisticItem] = useOptimistic(
  items,
  (current, pending: Item) => [...current, pending],
);
```

It helps represent the optimistic view; it does not provide persistence, authorization, idempotency, or cache invalidation. Those remain application and server responsibilities.

## Decide whether to be optimistic

Use optimism when success is common, the expected result is obvious, and failure can be explained or reversed. For payment, destructive operations, scarce inventory, or permission changes, confirmed UI may be safer.

## Common traps

- Assuming requests finish in submission order.
- Losing later edits during rollback.
- Leaving temporary and server IDs duplicated.
- Showing success for an operation that cannot safely be reversed.

## Interview answer

For an optimistic mutation I record enough information to reconcile or roll back that operation, update the cache immediately, prevent accidental duplicates, and replace temporary data with the authoritative response. I handle concurrent mutations explicitly and reserve optimism for actions with high success probability and understandable recovery.

## Follow-up questions

### What does `useOptimistic` solve?

It provides a React model for displaying temporary state while an Action is underway. It does not send the request or resolve server concurrency.

### Why use a temporary client ID?

It gives the pending UI stable identity and lets an out-of-order response reconcile the correct optimistic record.

### What is an unknown mutation outcome?

The request may have reached the server even though the client lost the response. Blind retry can duplicate work unless the operation is idempotent.

## Check yourself

1. Why is restoring one old snapshot unsafe when optimistic mutations overlap?
2. How do temporary IDs and idempotency keys solve different problems?
3. When should an operation avoid optimistic success?
4. How should a normalized server response update optimistic data?
5. What responsibilities remain outside `useOptimistic`?
