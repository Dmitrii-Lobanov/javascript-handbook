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

## Common traps

- Wrapping only the entire application and losing all UI for one panel failure.
- Expecting a boundary to catch rejected event-handler promises.
- Treating validation or an expected 404 as an exceptional render failure.
- Logging an error without providing recovery or useful context.

## Interview answer

Error boundaries isolate unexpected failures in descendant rendering so the rest of the interface can remain usable. I place them at meaningful recovery boundaries, log diagnostic context, and provide retry or navigation. Expected data errors remain explicit UI state, and event-handler or unrelated async errors require their own handling.

## Check yourself

Why should a dashboard often use panel-level boundaries in addition to a route-level boundary?
