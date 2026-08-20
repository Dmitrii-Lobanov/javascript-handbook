# Chapter 29 — Code Splitting and Lazy Loading

## Quick refresher

Code splitting divides JavaScript into chunks loaded when needed. `lazy` defers loading a component module, while `Suspense` provides a fallback during loading.

## Why this matters

Shipping less initial JavaScript can improve loading and responsiveness, but excessive splitting creates request overhead, waterfalls, and disruptive fallback transitions.

## Core mental model

```tsx
const SettingsPanel = lazy(() => import("./SettingsPanel"));

function SettingsRoute() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPanel />
    </Suspense>
  );
}
```

Choose boundaries around routes, large optional features, editors, charts, or rarely opened dialogs—not every small component. The fallback should preserve layout and appear at a boundary that matches the user experience.

Loading code only after a click can create a visible delay. Prefetch likely next routes or modules on intent, idle time, or viewport proximity when the bandwidth tradeoff is justified. Framework route-level splitting is usually the starting point.

Splitting code does not reduce total application code by itself. Remove unused dependencies, import narrowly, and inspect chunk duplication. Measure transferred bytes, parse and execution time, and the interaction that first needs the lazy chunk.

## Design the loading boundary

A useful boundary answers three questions:

1. Can this region load independently?
2. Can the rest of the interface remain useful while it loads?
3. Can the fallback preserve the region's size and context?

Put the boundary close enough to avoid replacing the whole page, but high enough to avoid a patchwork of spinners. When already visible content suspends during an update, a transition can help keep the previous content visible until the next screen is ready.

## Avoid waterfalls

This sequence adds latency:

```text
load route code → render → discover data request → wait for data
```

Prefer starting independent work together through route loaders, framework data APIs, preload hints, or event-based prefetching. Code splitting and data fetching should be designed as one loading path.

## What to split

| Candidate | Why it is often useful |
| --- | --- |
| Route | Users may never visit it; frameworks commonly support it |
| Large optional feature | Editors, charts, maps, and admin tools carry substantial code |
| Infrequent modal or panel | It can load after intent without blocking the initial screen |
| Tiny shared component | Usually a poor boundary because overhead outweighs savings |

Account for failures too. A dynamic import can fail because of a network or deployment mismatch, so pair loading UI with an appropriate Error Boundary and retry or reload path.

## Common traps

- Lazy-loading tiny components and increasing coordination overhead.
- Creating sequential code and data waterfalls.
- Showing a full-page spinner for a small deferred region.
- Measuring chunk count instead of user-visible loading behavior.

## Interview answer

I split at meaningful route or feature boundaries so the initial path ships less JavaScript. I place Suspense fallbacks around independently loading regions, avoid code-data waterfalls, and prefetch likely next work when appropriate. I verify both initial improvement and the latency introduced when the deferred feature is first used.

## Follow-up questions

### What does `lazy` expect from the imported module?

By default, the import promise should resolve to a module whose default export is a component. Named exports usually need a small adapter module or promise transformation.

### Is more chunking always better?

No. More chunks add requests, scheduling overhead, cache coordination, and more opportunities for waterfalls. Boundaries should produce a meaningful loading or caching benefit.

### When should you prefetch a lazy feature?

When there is a strong signal of likely use—such as hover, focus, viewport proximity, or idle time—and the bandwidth cost is acceptable.

## Check yourself

1. Why can a smaller initial bundle still produce a worse first interaction with a lazy feature?
2. Where should a Suspense boundary be placed for a settings panel?
3. How can code and data loading create a sequential waterfall?
4. What metrics demonstrate that splitting improved the initial route?
5. How should a failed dynamic import be handled?
