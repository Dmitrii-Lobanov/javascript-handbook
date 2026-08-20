# Chapter 23 — Error Boundaries

## Quick refresher

An error boundary catches rendering errors in its descendant tree and displays fallback UI instead of unmounting the entire application.

## Why this matters

Production React applications need deliberate failure isolation. Interviewers expect you to know both what boundaries catch and what they do not.

## Core mental model

```tsx
<AppShell>
  <ErrorBoundary fallback={<PanelError />}>
    <AccountPanel />
  </ErrorBoundary>
</AppShell>
```

Place boundaries around independently recoverable regions, routes, or risky integrations. A boundary can log component-stack information and offer retry or navigation. Changing its `key` is a common way to reset boundary state for a new resource or retry attempt.

Traditional error boundaries are class components using `getDerivedStateFromError` and optionally `componentDidCatch`; applications commonly consume a framework or library wrapper.

Boundaries catch errors thrown while rendering descendants and in relevant descendant lifecycle work. They do not generally catch errors in event handlers, arbitrary asynchronous callbacks, server rendering, or errors thrown by the boundary itself. Handle expected request failures as explicit data states rather than throwing every failure into a boundary.

## Choose recovery boundaries

A boundary should correspond to a region users can recover independently:

```text
application shell boundary
└── route boundary
    ├── account panel boundary
    └── recommendations boundary
```

Too few boundaries turn one widget failure into a blank application. Too many tiny boundaries create noisy fallbacks and fragmented recovery.

## What boundaries catch

| Error source | Caught by descendant boundary? |
| --- | --- |
| Descendant render | Yes |
| Descendant class lifecycle | Yes |
| Effect setup in descendant tree | Generally yes |
| Event handler | No |
| Timer or unrelated Promise callback | No |
| Boundary’s own render | No; needs an ancestor boundary |
| Server rendering | Requires server/framework handling |

Framework behavior can add route-level error conventions, so explain the React boundary and the framework integration separately.

## Expected errors versus exceptional failures

A 404, validation message, empty result, or rejected mutation is often expected domain state and should render explicit UI. A boundary is appropriate when rendering cannot continue safely because of an unexpected exception.

## Recovery and reset

A fallback should offer a meaningful action: retry, reload the region, navigate elsewhere, or report the issue. Reset boundary state when the failing resource changes or after a deliberate retry, often through a changed key or library reset API.

Logging should include the original error, component stack where available, route or feature context, and a correlation identifier—without leaking sensitive user data.

## Suspense and error boundaries

Suspense handles pending resources; an Error Boundary handles rejected or thrown failures. They are commonly composed so a region has both loading and failure UI.

## Common traps

- Wrapping only the entire application and losing all UI for one panel failure.
- Expecting a boundary to catch rejected event-handler promises.
- Treating validation or an expected 404 as an exceptional render failure.
- Logging an error without providing recovery or useful context.

## Interview answer

Error boundaries isolate unexpected failures in descendant rendering so the rest of the interface can remain usable. I place them at meaningful recovery boundaries, log diagnostic context, and provide retry or navigation. Expected data errors remain explicit UI state, and event-handler or unrelated async errors require their own handling.

## Follow-up questions

### Why do event-handler errors bypass boundaries?

The UI is already committed and the handler runs outside descendant rendering. Catch expected failures in the interaction flow.

### Should every request failure be thrown?

No. Expected failure states often need specific retry, validation, or empty UI rather than exceptional recovery.

### How does a boundary retry?

Reset its captured error state and retry or remount the failing subtree after addressing the underlying resource or condition.

## Check yourself

1. Why should a dashboard use panel and route boundaries?
2. Which errors are not caught by a boundary?
3. When is an error ordinary domain state?
4. What should useful fallback UI provide?
5. How do Suspense and Error Boundaries complement each other?
