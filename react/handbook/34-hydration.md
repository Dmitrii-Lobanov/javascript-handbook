# Chapter 34 — Hydration

## Quick refresher

Hydration attaches React behavior to server-rendered HTML by rendering the same initial tree on the client and connecting it to existing DOM.

## Why this matters

The page may look ready before it can respond. Hydration mismatches can cause warnings, discarded work, incorrect UI, and layout shifts.

## Core mental model

The server and first client render must agree. Avoid nondeterministic render output:

```tsx
// Risky during initial render
return <span>{new Date().toLocaleTimeString()}</span>;
```

Differences can come from time, random values, locale, browser-only APIs, invalid HTML, or data changing between server and client. Provide deterministic initial data, defer browser-only synchronization to an Effect, or isolate client-only UI deliberately.

Hydration also has a performance cost because React must load code and recreate the component tree. Suspense boundaries can allow selective hydration and prioritize interaction with ready regions.

## Common traps

- Using `typeof window` branches that change initial markup.
- Suppressing mismatch warnings instead of fixing the cause.
- Confusing visible HTML with usable UI.
- Rendering the whole page as client-only to avoid one mismatch.

## Interview answer

Hydration connects client React to server HTML, so the initial output must be deterministic and equivalent. I eliminate time, random, locale, and browser-only differences or isolate them behind intentional boundaries. I also measure hydration as JavaScript and main-thread work, not merely correctness.

## Check yourself

How would you render a browser-local preference without producing a hydration mismatch?
