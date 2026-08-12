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

## Common traps

- Wrapping every component in Suspense.
- Assuming Suspense catches errors.
- Causing sequential data waterfalls inside nested components.
- Replacing already visible content with a disruptive fallback during an update.

## Interview answer

Suspense coordinates loading UI; streaming allows ready server output to arrive incrementally. I choose boundaries from UX reveal order and independent recovery regions, avoid data waterfalls, preserve layout, and pair loading boundaries with error handling. I use framework-supported data integration rather than ad hoc promises.

## Check yourself

When should two loading regions share a Suspense boundary rather than reveal independently?
