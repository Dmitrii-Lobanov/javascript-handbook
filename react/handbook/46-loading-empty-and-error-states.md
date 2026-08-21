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

## Model background states too

The basic union can be extended without producing contradictory booleans:

```tsx
type Resource<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T; isRefreshing: boolean }
  | { status: "error"; error: Error; previousData?: T };
```

The exact model depends on the product. A query library may expose these distinctions already; avoid flattening them into less expressive local state.

## Choose UI by available value

| State | Useful response |
| --- | --- |
| Initial loading | Layout-stable skeleton or focused progress feedback |
| Background refresh | Preserve content and show subtle refresh status |
| Empty success | Explain what is absent and offer a relevant next step |
| Recoverable error | Explain impact and provide retry |
| Partial failure | Keep successful regions and isolate the failure |
| Offline with cached data | Show cached content and communicate freshness limits |

An empty state should be specific. “No saved projects yet” may invite creation; “No results match these filters” should offer filter recovery.

## Avoid flicker

For operations that normally finish almost immediately, a spinner can flash and make the interface feel slower. Preserve existing content or delay nonessential pending decoration where product requirements allow, while ensuring genuinely slow work still receives feedback.

## Make recovery safe

Retry must restart the failed operation with current inputs and avoid duplicate unsafe mutations. Error Boundaries are appropriate for exceptional render failures; expected resource errors usually belong in the resource-state UI.

## Common traps

- Modeling loading and error as contradictory booleans.
- Showing the same empty UI before a request and after an empty success.
- Replacing existing content with a spinner during every refresh.
- Displaying an error without recovery.

## Interview answer

I model async state explicitly and distinguish initial loading, background refresh, empty success, and failure. I preserve useful content when possible, provide relevant recovery, and announce important transitions accessibly. This avoids impossible boolean combinations and makes tests match actual user states.

## Follow-up questions

### Is an empty array an empty state?

Only after a successful request. Before the request or while it is pending, the same array value cannot tell the user what happened.

### When should previous data remain visible after an error?

When it is still useful and can be clearly marked as stale. Do not present it as current if that could cause a harmful decision.

### Should expected API errors be thrown to an Error Boundary?

Usually they should be rendered through explicit resource state. Error Boundaries are better for unexpected failures that prevent a subtree from rendering normally.

## Check yourself

1. Why should an empty search result not use the same UI as an unsubmitted search?
2. How does background refresh differ from initial loading?
3. When should stale data remain visible after failure?
4. What recovery should a filtered empty state offer?
5. How can pending feedback avoid both silence and visual flicker?
