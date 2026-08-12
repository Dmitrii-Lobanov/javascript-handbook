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

## Common traps

- Memoizing every object and callback.
- Comparing objects by reference when structural equality is required.
- Mutating state and reusing its reference.
- Ignoring identity in Effect dependencies or context provider values.

## Interview answer

React frequently uses `Object.is`, so equal-looking objects are different when their references differ. This matters at dependency arrays, memoized props, context values, and state updates. I stabilize identity only where a consumer compares it and the skipped work matters; otherwise new values are normal JavaScript behavior.

## Check yourself

Why can moving an object inside an Effect be better than memoizing it?
