# Chapter 46 — Loading, Empty, and Error States

## Quick refresher

Async UI should represent distinct idle, pending, success, empty, and error states. Refreshing existing data differs from loading it for the first time.

## Why this matters

Boolean combinations create impossible states and poor transitions. Explicit states make rendering, testing, and accessibility clearer.

## Core mental model

```tsx
type Resource<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

Keep useful previous data visible during background refresh when appropriate, with a subtle pending indicator. Empty state is a successful result with no items, not an error. Errors should explain impact and offer a relevant retry or alternative.

Use `aria-live` or status semantics for important asynchronous changes without repeatedly announcing noisy updates. Skeletons should preserve layout; spinners should not erase useful context.

## Common traps

- Modeling loading and error as contradictory booleans.
- Showing the same empty UI before a request and after an empty success.
- Replacing existing content with a spinner during every refresh.
- Displaying an error without recovery.

## Interview answer

I model async state explicitly and distinguish initial loading, background refresh, empty success, and failure. I preserve useful content when possible, provide relevant recovery, and announce important transitions accessibly. This avoids impossible boolean combinations and makes tests match actual user states.

## Check yourself

Why should an empty search result not use the same UI as an unsubmitted search?
