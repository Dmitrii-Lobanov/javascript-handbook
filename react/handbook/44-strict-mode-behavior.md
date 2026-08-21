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

## What Strict Mode stresses

| Development check | Defect it can reveal |
| --- | --- |
| Extra component render | Mutation or another impure render side effect |
| Extra Effect setup and cleanup | Missing cleanup or non-repeatable synchronization |
| Extra ref callback setup and cleanup | Leaked node or resource handling |
| Deprecated API checks | Unsafe or obsolete integration |

The precise development checks can evolve. The durable contract is that render must be pure and synchronization must tolerate being started and stopped.

## Effects synchronize resources

An Effect should answer:

- Which external resource is being synchronized?
- What values define that resource?
- How is the previous synchronization undone?
- Can setup safely run after cleanup?

If the Effect merely derives state from props, remove it and calculate during render. That avoids both duplicate work and a whole extra update.

## One-time business actions need another owner

Purchases, analytics tied to a user event, and POST requests caused by submission belong in event or Action logic—not mount Effects. Component mounting is a UI lifecycle event and may legitimately happen more than once.

## Common traps

- Treating repeated development logs as a React bug.
- Guarding an Effect with `hasRun.current` while leaking its resource.
- Performing irreversible work during render.
- Assuming an empty dependency array guarantees one lifetime execution.

## Interview answer

Strict Mode intentionally stresses render purity and Effect cleanup in development. I make rendering idempotent and every Effect a symmetric setup-cleanup process. I do not suppress repeated setup with a ref because that hides the lifecycle bug rather than making synchronization safe.

## Follow-up questions

### Does Strict Mode double-render production UI?

Its additional checks are development-only. The bugs they expose can still matter in production during remounts, interrupted work, navigation, or changed dependencies.

### Is duplicate data fetching always an Effect bug?

It often indicates that raw Effect fetching lacks deduplication or cleanup. A framework or server-state cache can own request identity and reuse, while the Effect must still remain correct across setup and cleanup.

### Why can a ref guard leak a subscription?

It prevents the second setup without proving that the first resource remains valid or was cleaned up symmetrically. It masks the stress test rather than repairing ownership.

## Check yourself

1. Why is a `hasRun` ref usually the wrong fix for duplicate development requests?
2. Which render-time operations violate purity?
3. What symmetry should every subscription Effect have?
4. Where should a user-triggered purchase request be started?
5. Why can an empty dependency array not promise one execution for the application's lifetime?
