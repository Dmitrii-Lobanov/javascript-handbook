# Chapter 36 — Suspense and Streaming

## Quick refresher

Suspense coordinates a fallback while a supported child is not ready. Streaming lets the server send completed parts of a response progressively.

## Why this matters

Boundary placement controls reveal order, perceived loading, layout stability, and failure isolation.

## Core mental model

```tsx
<Suspense fallback={<ProfileSkeleton />}>
  <Profile />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />
  </Suspense>
</Suspense>
```

Place boundaries around regions that can load meaningfully and independently. Too few boundaries block large sections; too many create flicker and visual fragmentation. Skeletons should preserve approximate layout.

Suspense does not make arbitrary fetching code Suspense-aware. Use a framework or data source designed to integrate with it. Pair boundaries with error boundaries because loading and failure are separate states.

Streaming improves progressive delivery but does not remove network, database, JavaScript, or hydration costs.

## Suspense represents readiness

A boundary shows its fallback when a supported descendant suspends while rendering. This includes lazy component loading and framework-integrated data sources. Starting an ordinary request in an Effect happens after rendering and does not activate the nearest Suspense boundary.

Suspense also does not prescribe cache identity, retries, freshness, or mutation behavior. Those belong to the framework or data layer.

## Design reveal order

| UX requirement | Boundary choice |
| --- | --- |
| Regions should appear together as one coherent unit | Share a boundary |
| One slow region should not block another | Use sibling boundaries |
| A child can progressively refine a parent region | Nest boundaries |
| Existing content should remain during navigation | Use a transition with an appropriate boundary |

Boundary placement should follow the product's loading sequence rather than mirror every component in the codebase.

## Combine loading and failure isolation

Suspense handles “not ready”; an Error Boundary handles an exception. Place them so a failed region can show useful recovery without removing unrelated content. A retry needs to reset or re-request the failed resource, not merely redraw the same failure.

## What streaming changes

The server can send an initial shell and later insert completed boundary content into the stream. This may improve time to visible content, but the browser still needs the relevant client code before interactive regions can hydrate. Avoid slow server work that blocks the entire shell above all boundaries.

## Common traps

- Wrapping every component in Suspense.
- Assuming Suspense catches errors.
- Causing sequential data waterfalls inside nested components.
- Replacing already visible content with a disruptive fallback during an update.

## Interview answer

Suspense coordinates loading UI; streaming allows ready server output to arrive incrementally. I choose boundaries from UX reveal order and independent recovery regions, avoid data waterfalls, preserve layout, and pair loading boundaries with error handling. I use framework-supported data integration rather than ad hoc promises.

## Follow-up questions

### Does Suspense start the request?

No. It coordinates what React displays when a supported resource is not ready. The framework, cache, lazy import, or other integration starts and tracks the work.

### Why might a transition keep old content visible?

If a non-urgent update suspends, React can continue displaying the already revealed UI while preparing the next state, avoiding a disruptive fallback replacement.

### Can streaming eliminate hydration?

No. Interactive Client Components still require their JavaScript and hydration. Streaming changes delivery order, not the need for client behavior.

## Check yourself

1. When should two loading regions share a boundary rather than reveal independently?
2. Why does fetching in `useEffect` not trigger Suspense by itself?
3. How do nested and sibling boundaries change reveal order?
4. What should happen when streamed content fails?
5. Which work remains after server HTML has streamed to the browser?
