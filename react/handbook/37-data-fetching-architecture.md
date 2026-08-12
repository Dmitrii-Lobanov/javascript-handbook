# Chapter 37 — Data-Fetching Architecture

## Quick refresher

Data architecture defines where fetching begins, who owns cache state, how duplicate requests are avoided, and how freshness and errors are represented.

## Why this matters

Fetching in leaf Effects often creates waterfalls, duplicate requests, poor server rendering, and manual race-condition handling.

## Core mental model

Separate three concerns:

```text
resource identity → cache/freshness policy → UI boundary
```

Start requests as high and early as the route permits, run independent requests in parallel, and use framework or server-state primitives for caching and deduplication. A cache key must include every input that changes the resource.

Distinguish server state from client UI state. Server state has remote ownership, freshness, errors, and invalidation; copying it into local state usually creates synchronization problems.

Effects remain appropriate for imperative external synchronization, but raw fetching Effects need cancellation and stale-response protection.

## Common traps

- Fetching sequentially through nested component Effects.
- Using one global loading boolean for independent resources.
- Treating cached data as permanently fresh.
- Invalidating an entire cache after every mutation.

## Interview answer

I model resource identity and freshness explicitly, start independent work in parallel, and use the framework or a server-state cache for deduplication, retries, and SSR integration. Components consume resource states at meaningful loading and error boundaries. Local state remains for client-owned interaction state rather than duplicating server data.

## Check yourself

Why does lifting a request to a route often remove a component data waterfall?
