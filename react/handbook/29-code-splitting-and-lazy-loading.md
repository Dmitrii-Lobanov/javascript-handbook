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

## Common traps

- Lazy-loading tiny components and increasing coordination overhead.
- Creating sequential code and data waterfalls.
- Showing a full-page spinner for a small deferred region.
- Measuring chunk count instead of user-visible loading behavior.

## Interview answer

I split at meaningful route or feature boundaries so the initial path ships less JavaScript. I place Suspense fallbacks around independently loading regions, avoid code-data waterfalls, and prefetch likely next work when appropriate. I verify both initial improvement and the latency introduced when the deferred feature is first used.

## Check yourself

Why can a smaller initial bundle still produce a worse first interaction with a lazy feature?
