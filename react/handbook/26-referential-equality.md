# Chapter 26 — Referential Equality

## Quick refresher

- Primitives compare by value; objects, arrays, and functions compare by identity.
- React uses `Object.is` for state bailouts, context values, and Hook dependencies.
- New object and function literals have new identities on every render.
- Referential stability matters only at a boundary that compares identity.

## Why this matters

Identity explains why Effects rerun, memoized children render, and context consumers update even when values look structurally equal.

## Core mental model

```tsx
const options = { roomId };

useEffect(() => {
  const connection = connect(options);
  return () => connection.disconnect();
}, [options]);
```

`options` is new on every render, so the Effect resynchronizes. The simplest fix is often to create it inside the Effect and depend on the primitive:

```tsx
useEffect(() => {
  const connection = connect({ roomId });
  return () => connection.disconnect();
}, [roomId]);
```

Identity is not inherently a problem. New values are cheap unless they defeat a meaningful cache, retrigger synchronization, or notify consumers. Preserve identity deliberately at those boundaries through simpler APIs, moving creation, or memoization.

State updates must also use new identities when data changes. Mutating an object and passing the same reference can let React bail out even though its contents changed.

## Where identity is observed

| Boundary | Comparison consequence |
| --- | --- |
| State update | React may skip an update when the next value is `Object.is`-equal |
| Effect dependencies | A changed dependency causes cleanup and setup to run again |
| `memo` props | Any unequal prop normally prevents the bailout |
| Context value | A new provider value notifies consumers |
| Memoization dependencies | A changed dependency invalidates the cached value |

The important question is not “Is this reference stable?” but “Does anything observe its identity?” A local object used only during the current render needs no stabilization.

## Immutable state updates

Identity must change along the path that changed:

```tsx
setUser(current => ({
  ...current,
  address: {
    ...current.address,
    city: nextCity,
  },
}));
```

Unchanged branches can retain their references. This makes updates detectable and allows memoized consumers of unchanged branches to bail out.

## Prefer removing dependencies

Before reaching for `useMemo` or `useCallback`, ask whether the value can be:

- created inside the Effect that uses it;
- represented by primitive dependencies;
- passed as JSX rather than through a callback;
- derived during render instead of synchronized into state.

Fewer identity-sensitive boundaries are easier to reason about than more stabilized references.

## Common traps

- Memoizing every object and callback.
- Comparing objects by reference when structural equality is required.
- Mutating state and reusing its reference.
- Ignoring identity in Effect dependencies or context provider values.

## Interview answer

React frequently uses `Object.is`, so equal-looking objects are different when their references differ. This matters at dependency arrays, memoized props, context values, and state updates. I stabilize identity only where a consumer compares it and the skipped work matters; otherwise new values are normal JavaScript behavior.

## Follow-up questions

### Does `const` make an object stable across renders?

No. `const` prevents reassignment within one function call. A component call creates a new object literal and therefore a new reference.

### Is a stable callback guaranteed to read current state?

Only when its dependencies are correct or it uses a safe pattern such as a functional state update. An incorrectly memoized callback can retain a stale closure.

### Why does mutating state sometimes appear to work?

Another update may happen to trigger a render that exposes the mutation. The model is still broken because React was not given a new state identity and cannot reliably schedule or optimize the change.

## Check yourself

1. Why can moving an object inside an Effect be better than memoizing it?
2. At which React boundaries does referential equality matter?
3. Why should an immutable update preserve unchanged branch identities?
4. When is a new function on every render harmless?
5. How can referential stability create a stale-closure bug?
