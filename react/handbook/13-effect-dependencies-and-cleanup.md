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

## Dependencies describe reactive reads

Reactive values include props, state, and variables or functions declared in the component body. The dependency list is a description of the Effect’s code, not a custom schedule.

```tsx
function Chat({ roomId }: { roomId: string }) {
  const serverUrl = useContext(ServerUrlContext);

  useEffect(() => {
    return connect(serverUrl, roomId);
  }, [serverUrl, roomId]);
}
```

Module constants and state setter functions are stable and do not need to be added merely because they are mentioned.

React compares dependencies with `Object.is`. A new object or function is different even if its contents look equal.

## Remove unnecessary object dependencies

Instead of creating an object during render:

```tsx
const options = { serverUrl, roomId };

useEffect(() => connect(options), [options]);
```

Create it inside the Effect and depend on its primitive inputs:

```tsx
useEffect(() => {
  const options = { serverUrl, roomId };
  return connect(options);
}, [serverUrl, roomId]);
```

This is usually clearer than memoizing an object solely to satisfy another Hook.

## Cleanup belongs to one Effect execution

Each setup owns its own resources:

```text
setup for room A
  ↓ room changes
cleanup for room A
setup for room B
  ↓ unmount
cleanup for room B
```

Capture the exact subscription, timer, observer, or controller created by that execution. Avoid cleanup that reaches into mutable global state and accidentally tears down a newer resource.

## Async races need invalidation

Aborting a fetch saves work when the transport supports it. An ignore flag or request ID also prevents an obsolete continuation from committing:

```tsx
useEffect(() => {
  let current = true;
  const controller = new AbortController();

  loadUser(userId, controller.signal).then(user => {
    if (current) setUser(user);
  });

  return () => {
    current = false;
    controller.abort();
  };
}, [userId]);
```

Do not rely on requests finishing in the order they started.

## Strict Mode is a cleanup test

Development Strict Mode can run an extra setup → cleanup → setup cycle. Correct synchronization should remain indistinguishable from one setup. Duplicate listeners, connections, or timers usually reveal missing or incomplete cleanup—not a reason to disable Strict Mode.

## Common traps

- Suppressing dependency lint rules.
- Omitting a changing value because rerunning feels inconvenient.
- Adding memoization before simplifying the Effect.
- Relying only on request order and allowing old responses to overwrite new state.

## Interview answer

An Effect’s dependency list is determined by the reactive values its setup reads; it is not a manually chosen schedule. Cleanup ends the synchronization created by that particular execution before replacement or unmounting. For async work, I cancel when possible and also prevent obsolete executions from committing state.

## Follow-up questions

### Can dependencies be chosen to control scheduling?

No. They are determined by reactive values read by the Effect. Change the code structure when the synchronization scope is wrong.

### Why do objects often retrigger Effects?

A new object reference is created during each render, and React compares dependencies with `Object.is`.

### Does aborting a request guarantee correct ordering?

No. Obsolete continuations may still run, so an ignore flag or request identity can also be necessary.

## Check yourself

1. Why can moving an options object inside an Effect be better than `useMemo`?
2. Which values count as reactive dependencies?
3. Why does every Effect execution need its own cleanup resources?
4. Why may cancellation and an ignore guard both be useful?
5. What does Strict Mode’s extra setup-cleanup cycle reveal?
