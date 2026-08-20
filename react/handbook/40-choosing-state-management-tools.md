# Chapter 40 — Choosing State-Management Tools

## Quick refresher

Choose a state tool from ownership, lifetime, sharing, update frequency, persistence, and synchronization requirements—not popularity.

## Why this matters

Applications contain different state categories that should not be forced into one global store.

## Core mental model

```text
local UI state      → useState / useReducer
subtree dependency  → props / context
shareable location  → URL
remote server state → framework cache / query library
external live state → external store subscription
```

Keep transient input, disclosure, and selection near their owner. Put filters and navigation state in the URL when they should survive refresh or be shareable. Use a server-state cache for remote freshness and invalidation. Use an external client store when many distant consumers need selective high-frequency updates or state must outlive component trees.

Evaluate debugging, SSR, persistence, selectors, bundle cost, team familiarity, and migration—not only API convenience.

## Ask ownership questions first

For each value, identify:

1. Who can change it?
2. Which components need it?
3. How long should it live?
4. Must it survive refresh or be shareable?
5. Is it authoritative locally or remotely?
6. How frequently does it update?

The answers usually narrow the tool more reliably than the shape of the value.

## Compare React mechanisms

| Mechanism | Appropriate scope | Important characteristic |
| --- | --- | --- |
| `useState` | Local component or small lifted subtree | Direct and minimal |
| `useReducer` | Cohesive local transitions | Centralizes update rules, not storage scope |
| Context | Subtree-wide ambient dependency | Consumers update with provider value |
| URL | Navigable/shareable state | Survives refresh and browser navigation |
| External store | Cross-tree state with selective subscriptions | Independent lifetime and subscription model |
| Query cache | Server-owned data | Freshness, deduplication, and invalidation |

`useReducer` does not make state global, and Context does not automatically make a reducer performant. Storage and distribution are separate decisions.

## Recognize when an external store is justified

Strong signals include state that outlives component trees, many distant writers, selective subscriptions to frequent updates, integration with non-React code, or demanding debugging and persistence requirements. “Avoiding prop drilling” alone is usually not enough.

## Plan migration and boundaries

Hide tool-specific APIs behind domain hooks where practical. Keep server data in its server-state layer and avoid mirroring it into the client store. Define serialization, versioning, reset, multi-tab, and SSR hydration policies before enabling persistence.

## Common traps

- Putting server responses into a generic global store.
- Using context for high-frequency selective subscriptions.
- Keeping shareable filters only in memory.
- Adopting a library before defining state ownership.

## Interview answer

I classify state first. Local interaction state stays local, subtree dependencies use props or context, shareable navigation state belongs in the URL, and remote data uses a server-state cache. I introduce an external store when lifetime or subscription granularity requires it, then compare SSR, debugging, performance, and team costs.

## Follow-up questions

### Does `useReducer` replace a global store?

No. It organizes transitions for state owned by the component using it. The state becomes widely available only if it is separately distributed.

### When should filters live in the URL?

When users should bookmark, share, refresh, or use browser navigation to restore the filtered view.

### Why not copy query data into an external store?

It creates two caches with unclear authority, freshness, invalidation, and error behavior. Keep server-owned data in the layer designed for those concerns.

## Check yourself

1. Where should product-search filters live if users must share and restore the result page?
2. Why are storage and distribution separate decisions?
3. What signals justify an external store?
4. Where should server-owned cached data live?
5. What new policies are required when client state is persisted?
