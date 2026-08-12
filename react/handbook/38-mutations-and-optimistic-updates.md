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

## Common traps

- Assuming requests finish in submission order.
- Losing later edits during rollback.
- Leaving temporary and server IDs duplicated.
- Showing success for an operation that cannot safely be reversed.

## Interview answer

For an optimistic mutation I record enough information to reconcile or roll back that operation, update the cache immediately, prevent accidental duplicates, and replace temporary data with the authoritative response. I handle concurrent mutations explicitly and reserve optimism for actions with high success probability and understandable recovery.

## Check yourself

Why is restoring one old cache snapshot unsafe when multiple optimistic mutations overlap?
