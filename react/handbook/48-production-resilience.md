# Chapter 48 — Production Resilience

## Quick refresher

Resilient React applications isolate failures, expose useful diagnostics, tolerate partial outages, and provide safe recovery without losing user work.

## Why this matters

Production behavior includes slow networks, stale deployments, third-party failures, malformed data, unsupported browsers, and long-running sessions—not only successful local rendering.

## Core mental model

Design resilience in layers:

```text
validation → explicit resource states → timeout/retry policy
→ error boundaries → observability → recovery or degradation
```

Place error and Suspense boundaries around independently recoverable regions. Preserve form drafts and useful cached data during transient failure. Retry only safe operations with bounded backoff and jitter; avoid retry storms and non-idempotent mutations.

Collect actionable client errors, component context, release version, performance signals, and user journey information while respecting privacy. Source maps and release correlation make reports diagnosable. Provide recovery for stale chunk failures after deployments and degrade optional third-party features rather than blocking core journeys.

## Isolate by recovery scope

| Failure | Appropriate recovery scope |
| --- | --- |
| Optional chart fails | Chart region fallback |
| Route data fails | Route-level error and retry |
| Authentication expires | Session recovery or sign-in flow |
| Application shell cannot render | Top-level fallback |
| Analytics provider fails | Disable optional integration silently or log safely |

One top-level boundary prevents a blank page but cannot preserve useful unaffected features. Add narrower boundaries around independently recoverable regions.

## Define retry policy

Retry only transient failures and consider operation safety. Use bounded exponential backoff with jitter, respect server retry guidance, pause when offline, and stop when the user action or resource is obsolete. Do not automatically retry validation, permission, or most not-found responses.

## Handle deployments and long sessions

A browser may hold old HTML or runtime code that requests a chunk removed by a new deployment. Keep old assets available when the platform permits, detect recoverable chunk-load failures, and offer a guarded one-time refresh. Prevent refresh loops and preserve drafts before reloading.

## Make telemetry actionable

Capture:

- error type, sanitized message, and reconstructed stack;
- release and environment;
- route and feature boundary;
- relevant request or trace correlation IDs;
- recent safe interaction breadcrumbs;
- impact counts and performance context.

Avoid tokens, form contents, personal data, and unbounded application state. Group noisy duplicates, set service objectives, and route alerts to an owner.

## Degrade deliberately

Define what the application can still do during API, CDN, real-time connection, or third-party failure. Cached read-only data, queued safe work, disabled optional features, and honest offline messaging are better than a generic success-looking screen.

## Common traps

- Retrying every failure indefinitely.
- Sending sensitive state in error reports.
- Using one application-wide fallback for local failures.
- Losing unsaved user input during recovery.
- Monitoring errors without ownership or alert thresholds.

## Interview answer

I design failure isolation with explicit async states and scoped boundaries, preserve valuable user state, and define safe timeout and retry policies. Observability includes release and journey context without sensitive data. Recovery may retry, refresh stale code, use cached data, or degrade optional functionality, and every alert has clear ownership.

## Follow-up questions

### Which failures should not be retried?

Validation, authorization, deterministic client bugs, and most not-found outcomes need correction or user action rather than repeated traffic. Unsafe mutations also require idempotency before retry.

### What should an Error Boundary log?

Enough sanitized context to group and reproduce the failure: error and component stack, release, route, boundary, and trace identifiers—without secrets or user-entered content.

### How do you avoid a stale-chunk refresh loop?

Record that an automatic recovery refresh was attempted for this release or session. If loading still fails, show a stable fallback with an explicit user choice.

## Check yourself

1. How should an application recover when a deployed lazy chunk no longer exists?
2. Why are scoped Error Boundaries better than only one global boundary?
3. Which failures qualify for automatic retry?
4. What production context is useful but safe to collect?
5. How should an application behave when an optional third party is unavailable?
