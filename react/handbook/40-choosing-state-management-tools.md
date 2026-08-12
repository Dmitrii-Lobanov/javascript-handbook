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

## Common traps

- Putting server responses into a generic global store.
- Using context for high-frequency selective subscriptions.
- Keeping shareable filters only in memory.
- Adopting a library before defining state ownership.

## Interview answer

I classify state first. Local interaction state stays local, subtree dependencies use props or context, shareable navigation state belongs in the URL, and remote data uses a server-state cache. I introduce an external store when lifetime or subscription granularity requires it, then compare SSR, debugging, performance, and team costs.

## Check yourself

Where should product-search filters live if users must share and restore the result page?
