# Chapter 13 — Effect Dependencies and Cleanup

## Quick refresher

Dependencies list every reactive value read by an Effect. Cleanup stops or reverses the previous synchronization before the Effect reruns and when the component unmounts.

## Why this matters

Correct dependencies prevent stale behavior; correct cleanup prevents leaked subscriptions and obsolete asynchronous work.

## Core mental model

```tsx
useEffect(() => {
  const controller = new AbortController();
  let ignore = false;

  loadUser(userId, controller.signal).then(user => {
    if (!ignore) setUser(user);
  });

  return () => {
    ignore = true;
    controller.abort();
  };
}, [userId]);
```

`userId` is reactive because it comes from props or state and is read inside the Effect. When it changes, cleanup invalidates the previous request before the next synchronization starts.

Objects and functions created during render have new identities. Before memoizing them, ask whether they can be created inside the Effect or whether the Effect can depend on primitive inputs instead.

Cleanup must be symmetrical: unsubscribe what was subscribed, disconnect what was connected, or cancel work that no longer belongs to the current render. Development Strict Mode may run an extra setup-cleanup cycle to expose missing symmetry.

## Common traps

- Suppressing dependency lint rules.
- Omitting a changing value because rerunning feels inconvenient.
- Adding memoization before simplifying the Effect.
- Relying only on request order and allowing old responses to overwrite new state.

## Interview answer

An Effect’s dependency list is determined by the reactive values its setup reads; it is not a manually chosen schedule. Cleanup ends the synchronization created by that particular execution before replacement or unmounting. For async work, I cancel when possible and also prevent obsolete executions from committing state.

## Check yourself

Why can moving an options object inside an Effect be better than wrapping it in `useMemo`?
