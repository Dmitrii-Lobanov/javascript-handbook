# Chapter 44 — Strict Mode Behavior

## Quick refresher

Strict Mode enables development-only checks that may repeat rendering and Effect setup-cleanup cycles to expose impure rendering and missing cleanup.

## Why this matters

Code that relies on “this runs once” can duplicate subscriptions, requests, or mutations and fail under remounting or concurrent behavior.

## Core mental model

```tsx
useEffect(() => {
  const subscription = source.subscribe(handleValue);
  return () => subscription.unsubscribe();
}, [source]);
```

Correct synchronization survives setup, cleanup, and setup again. Rendering must also be pure: mutating props or module state during render becomes visible when React calls the component again.

The checks do not mean production always performs the same sequence. They reveal code that is unsafe under legitimate lifecycle changes. Fix the underlying symmetry rather than disabling Strict Mode or using a ref to hide duplicate setup.

## Common traps

- Treating repeated development logs as a React bug.
- Guarding an Effect with `hasRun.current` while leaking its resource.
- Performing irreversible work during render.
- Assuming an empty dependency array guarantees one lifetime execution.

## Interview answer

Strict Mode intentionally stresses render purity and Effect cleanup in development. I make rendering idempotent and every Effect a symmetric setup-cleanup process. I do not suppress repeated setup with a ref because that hides the lifecycle bug rather than making synchronization safe.

## Check yourself

Why is a `hasRun` ref usually the wrong fix for an Effect that sends duplicate development requests?
