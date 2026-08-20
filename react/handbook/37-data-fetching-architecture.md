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

## Model the resource state

Avoid compressing every condition into `data` plus one loading boolean. A useful model distinguishes:

- initial pending with no data;
- success with fresh or stale data;
- background refetch while old data remains visible;
- empty success;
- recoverable error;
- permission or not-found outcomes.

These states often require different UI and retry behavior.

## Define cache identity and freshness

```ts
const key = ["products", { category, query, sort, page }];
```

Every input that changes the resource belongs in its cache key. Then define when data becomes stale, how it is revalidated, how long unused entries remain, and which mutations update or invalidate it. Cache invalidation is a domain decision, not a generic “refresh everything” step.

## Prevent race conditions

When requests can overlap, cancellation saves work but does not by itself define correctness. Associate responses with their resource key, ignore obsolete results, or let a server-state library coordinate them. The last response to arrive is not necessarily the response for the latest user intent.

## Choose the fetching layer

| Situation | Good starting point |
| --- | --- |
| Route data with SSR/streaming | Framework route or server data API |
| Rich client cache and background refresh | Server-state/query library |
| One imperative request tied to an external system | Carefully managed Effect |
| Mutation | Dedicated mutation/action API with cache reconciliation |

Avoid copying query results into component state unless the user is intentionally creating an independent editable draft.

## Common traps

- Fetching sequentially through nested component Effects.
- Using one global loading boolean for independent resources.
- Treating cached data as permanently fresh.
- Invalidating an entire cache after every mutation.

## Interview answer

I model resource identity and freshness explicitly, start independent work in parallel, and use the framework or a server-state cache for deduplication, retries, and SSR integration. Components consume resource states at meaningful loading and error boundaries. Local state remains for client-owned interaction state rather than duplicating server data.

## Follow-up questions

### What belongs in a query key?

Every input that changes the returned resource: identifiers, filters, sorting, pagination, tenant, locale, or relevant authorization scope.

### Why is one global loading boolean insufficient?

Independent resources and background refreshes can overlap. One boolean loses which operation is pending and whether usable cached data already exists.

### When is copying server data to local state justified?

When the user creates a deliberate draft that can diverge before submission. The initialization and reset policy must then be explicit.

## Check yourself

1. Why does lifting a request to a route often remove a component data waterfall?
2. Which values belong in the resource key for a filtered list?
3. How does stale data differ from missing data?
4. Why is request cancellation not the complete race-condition solution?
5. What should a mutation invalidate or update after success?
