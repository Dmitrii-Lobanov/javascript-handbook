# Chapter 11 — Closures and State Updates

## Quick refresher

Every render creates new variables and functions. A callback closes over the props and state from the render in which it was created.

## Why this matters

Closures explain stale asynchronous callbacks, missing Effect dependencies, repeated state updates, and many incorrect attempts to “fix” React with refs.

## Core mental model

This interval captures the initial `count` because the Effect never reruns:

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(count + 1), 1000);
  return () => clearInterval(id);
}, []);
```

If the update only needs previous state, remove the captured dependency:

```tsx
useEffect(() => {
  const id = setInterval(() => setCount(value => value + 1), 1000);
  return () => clearInterval(id);
}, []);
```

If an Effect needs a reactive value, include it as a dependency and accept the corresponding resynchronization. If a long-lived external callback truly needs the latest value without causing resubscription, use the appropriate modern Effect-event pattern when available, or a carefully synchronized ref.

A stale closure is not inherently wrong. A submission handler should often retain the values submitted at that moment. The question is whether snapshot or latest-value semantics match the requirement.

## Classify the callback first

Before fixing a closure, ask which semantics the callback needs:

| Requirement | Technique |
| --- | --- |
| Preserve the value from a click or submission | Use the captured snapshot |
| Calculate next state from current queued state | Functional updater |
| Resynchronize when a value changes | Include the dependency |
| External callback needs latest non-reactive data | Effect Event or carefully synchronized ref |

## Functional updates solve one specific problem

This callback needs only the latest queued count:

```tsx
setCount(count => count + 1);
```

But a functional updater does not make every other captured value current:

```tsx
useEffect(() => {
  const id = setInterval(() => {
    setCount(count => count + step);
  }, 1000);

  return () => clearInterval(id);
}, [step]);
```

`step` remains a reactive dependency because the interval’s behavior changes with it.

## Function dependencies are closures too

A function declared in a component is recreated and captures that render’s values:

```tsx
function createOptions() {
  return { roomId, serverUrl };
}
```

Depending on it can restart an Effect every render. Often the clearest fix is to move the function inside the Effect, or pass primitive inputs to an external pure helper. Use `useCallback` only when stable function identity is itself required.

## Latest values for external events

An external subscription may need to stay connected by `roomId` while its event handler reads the latest theme:

```tsx
const onConnected = useEffectEvent(() => {
  showNotification("Connected", theme);
});

useEffect(() => {
  const connection = connect(roomId);
  connection.on("connected", onConnected);
  return () => connection.disconnect();
}, [roomId]);
```

Do not use an Effect Event to hide a value that should actually cause resynchronization. A ref is the lower-level alternative for mutable non-rendering data used by third-party callbacks.

## Async operations need identity as well as fresh state

Functional updates prevent overwriting an array with a captured version, but they do not stop an older request from committing after a newer one. Cancellation, an ignore flag, or a request ID must establish which result still belongs to the current UI.

## Common traps

- Removing dependencies to silence the linter.
- Calling all captured values stale bugs.
- Using refs to hide reactive data from React.
- Using a functional updater when the callback also needs other changing props.

## Interview answer

Each render creates a snapshot, and its callbacks close over that snapshot. I first decide whether the operation should use the value from that render or the latest value. Functional updates solve previous-state calculations; correct dependencies resynchronize Effects; refs are reserved for mutable values whose changes should not render.

## Follow-up questions

### Are stale closures always bugs?

No. A callback often should preserve the state associated with the interaction that created it.

### What does a functional updater make current?

Only the queued state value passed to that updater. Other captured props and state remain from the callback’s render.

### When should a ref expose the latest value?

When a long-lived external callback needs mutable current data that does not itself drive rendering.

## Check yourself

1. Why does a functional updater fix an incrementing interval but not a changing `step` prop?
2. When is a captured historical value desirable?
3. Why can a component-declared function repeatedly restart an Effect?
4. When is a ref more appropriate than state?
5. Why does fresh state not solve an out-of-order request race?
