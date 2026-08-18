# Chapter 5 — State as a Snapshot

## Quick refresher

State is not a mutable variable that changes inside an existing render. Each render receives a fixed snapshot of props, state, and context. Calling a state setter queues an update and asks React to produce a later render with the next snapshot.

```text
render N receives state N
  ↓
event handler from render N queues an update
  ↓
render N still sees state N
  ↓
React produces render N + 1 with the next state
```

Event handlers and asynchronous callbacks close over the snapshot from the render that created them.

## Why this matters

This model explains common interview questions about:

- why logging state immediately after a setter shows the old value;
- why three direct updates may increment only once;
- why delayed callbacks see older values;
- when to use a functional state updater;
- when a stale closure is a bug and when it is intentional;
- why refs can expose the latest mutable value without rendering.

“State updates are asynchronous” is an imprecise answer. The stronger explanation is that the running JavaScript closure has a snapshot, while the setter queues work for a future render.

## Core mental model

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function increment() {
    setCount(count + 1);
    console.log(count); // The current render's snapshot.
  }

  return <button onClick={increment}>Count: {count}</button>;
}
```

If `count` is `0` when the button is rendered, the `increment` function created by that render closes over `0`. Calling `setCount(1)` queues the next state; it does not reassign the `count` constant inside the handler. The log therefore prints `0`.

On the next render, React calls `Counter` again and supplies `count` as `1`. A new `increment` closure is created with that new snapshot.

## A render produces its own closures

Every render creates a new version of the component’s local variables and functions.

```tsx
function MessageForm() {
  const [message, setMessage] = useState("");

  function submit() {
    const submittedMessage = message;

    setTimeout(() => {
      alert(`Sent: ${submittedMessage}`);
    }, 1000);
  }

  return (
    <>
      <input
        value={message}
        onChange={event => setMessage(event.target.value)}
      />
      <button onClick={submit}>Send</button>
    </>
  );
}
```

If the user submits “Hello” and then edits the input, the timeout still reports “Hello.” That is often correct: the callback represents the specific submission that created it.

A captured value is not automatically a bug. Ask whether the callback should observe the historical value from its initiating interaction or the latest value at execution time.

## Repeated direct updates use the same snapshot

All reads of `count` inside one handler refer to the same render snapshot:

```tsx
function addThree() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}
```

If `count` is `0`, each call queues “replace with `1`.” The calls do not become `1`, `2`, and `3` because the local `count` variable never changes during the handler.

Use functional updaters when the next state depends on previously queued state:

```tsx
function addThree() {
  setCount(current => current + 1);
  setCount(current => current + 1);
  setCount(current => current + 1);
}
```

React processes the updater queue in order:

```text
0 → 1 → 2 → 3
```

The parameter name `current`, `previous`, or `value` is only a local name. React supplies the result of the previous queued update.

## Replacement updates and functional updates

A setter accepts either a next value or an updater function.

```tsx
setCount(5);                    // Queue a replacement value.
setCount(current => current + 1); // Calculate from queued state.
```

Order matters:

```tsx
setCount(count + 5);
setCount(current => current + 1);
```

If the snapshot is `0`, React first queues replacement with `5`, then applies the updater to produce `6`.

In the reverse order:

```tsx
setCount(current => current + 1);
setCount(5);
```

The final replacement makes the result `5`.

Functional updaters should be pure. In development Strict Mode, React may call updater functions more than once to expose accidental side effects.

## Batching and snapshots

React normally batches state updates made during the same interaction or task. It waits until the running code finishes before processing the queued updates and rendering.

```tsx
function handleCheckout() {
  setSubmitting(true);
  setError(null);
  setAttemptCount(count => count + 1);
}
```

These setters can produce one render rather than three separate intermediate screens. Batching is why the handler finishes with one consistent snapshot.

Do not depend on a specific number of renders for correctness. Think in terms of queued state transitions and the final UI React should calculate.

React keeps separate intentional user events separate. For example, two distinct clicks are not accidentally merged into one logical click.

## State setters do not return the new state

A setter returns `undefined`. If later code in the same handler needs the next value, calculate it locally:

```tsx
function incrementAndReport() {
  const nextCount = count + 1;
  setCount(nextCount);
  analytics.track("count_changed", { count: nextCount });
}
```

If the operation depends on the latest queued state and also causes an external side effect, reconsider the design. Updater functions must remain pure; external work belongs in the event handler or an appropriate synchronization boundary.

## Object state is also a snapshot

Objects stored in state should be treated as immutable snapshots.

```tsx
type Profile = {
  name: string;
  city: string;
};

const [profile, setProfile] = useState<Profile>({
  name: "Ada",
  city: "London",
});
```

Mutating the current object changes data that belongs to an existing render and keeps the same reference:

```tsx
// Wrong
profile.city = "Paris";
setProfile(profile);
```

Create the next snapshot instead:

```tsx
setProfile(current => ({
  ...current,
  city: "Paris",
}));
```

This preserves the history of previous render snapshots and gives React a new identity to compare.

## Stale closures: expected versus problematic

### Expected snapshot behavior

An asynchronous callback should remember the value associated with the action that created it:

```tsx
function confirmOrder() {
  const orderToSubmit = order;
  submitOrder(orderToSubmit);
}
```

The user editing a later order should not change the already submitted payload.

### Problematic stale state

A long-lived callback may need to update from whatever state is current when it runs:

```tsx
useEffect(() => {
  const id = window.setInterval(() => {
    setCount(count + 1); // Captures the Effect's count snapshot.
  }, 1000);

  return () => window.clearInterval(id);
}, []);
```

The interval repeatedly queues the same next value. Use a functional updater:

```tsx
useEffect(() => {
  const id = window.setInterval(() => {
    setCount(current => current + 1);
  }, 1000);

  return () => window.clearInterval(id);
}, []);
```

This avoids reading `count`, so the Effect does not need it as a dependency.

Do not omit a dependency merely to suppress Effect reruns. First decide whether the logic needs a snapshot, a reactive dependency, a functional updater, or a latest-value escape hatch.

## When a ref should hold the latest value

Sometimes an asynchronous callback genuinely needs the latest value rather than its historical snapshot. A ref can provide mutable storage that does not schedule rendering.

```tsx
function SearchStatus({ query }: { query: string }) {
  const latestQueryRef = useRef(query);

  useEffect(() => {
    latestQueryRef.current = query;
  }, [query]);

  function reportLater() {
    setTimeout(() => {
      console.log(latestQueryRef.current);
    }, 1000);
  }

  return <button onClick={reportLater}>Report latest query</button>;
}
```

Use this deliberately:

- state drives rendered output and schedules rendering;
- a ref stores mutable information that rendering does not need to observe.

Do not replace ordinary state with refs just to avoid understanding closures. The UI will not update when `ref.current` changes.

## Props and context are snapshots too

The same closure reasoning applies to props and context values. An event handler belongs to one render and sees the props and context from that render.

```tsx
function SaveButton({ documentId }: { documentId: string }) {
  function handleSave() {
    saveDocument(documentId);
  }

  return <button onClick={handleSave}>Save</button>;
}
```

When `documentId` changes, React creates a new render with a new handler. A handler already running does not have its captured variables silently rewritten.

## Choosing the right update form

| Situation | Preferred form |
| --- | --- |
| Replace state with a value independent of previous state | `setOpen(true)` |
| Toggle or increment from previous state | `setOpen(open => !open)` |
| Apply several updates cumulatively | Functional updaters |
| Replace an object while preserving other fields | Functional updater plus immutable copy |
| Async callback should retain action-time value | Use its captured snapshot |
| Long-lived callback should update from latest queued state | Functional updater when possible |
| Non-rendering callback must read latest value | Ref, used deliberately |

## Common traps

- Saying a setter immediately changes the state variable.
- Explaining the behavior only as “asynchronous state.”
- Logging after a setter and treating the snapshot as a failed update.
- Calling `setCount(count + 1)` repeatedly and expecting cumulative results.
- Mutating an object or array from the current state snapshot.
- Calling every captured value a stale-closure bug.
- Omitting Effect dependencies to force an old closure to remain.
- Performing side effects inside functional updater functions.
- Using refs for values that should update the UI.
- Expecting batching details or render counts to be application semantics.

## Interview answer

React state behaves like a snapshot associated with a particular render. Event handlers and callbacks close over that render’s props and state. Calling a setter queues an update for a future render; it does not mutate the variable in the currently running closure. That is why reading state immediately after a setter returns the old snapshot. When the next state depends on previously queued state, I use a pure functional updater. For asynchronous code, I first decide whether it should preserve the initiating render’s value or intentionally read the latest value; a ref is an escape hatch for the latter when the value does not drive rendering.

## Follow-up questions

### Why does logging state after a setter show the old value?

The handler is still running with the snapshot from the render that created it. The setter queued another render rather than mutating that local variable.

### Why do three `setCount(count + 1)` calls usually add only one?

All three calls read the same `count` snapshot and queue the same replacement value. Functional updaters consume the queued result in sequence.

### Are stale closures always bugs?

No. Capturing the value associated with a particular click or submission provides useful consistency. It is a bug only when the requirement is to observe a newer value.

### When should you use a functional updater?

When the next state is calculated from previous or already queued state, especially for increments, toggles, async callbacks, and multiple updates in one batch.

### Does a ref solve stale state?

A ref can expose the latest mutable value to a callback, but changing it does not render the UI. Prefer a functional updater or correct dependencies when those express the requirement.

### Can a functional updater contain a network request?

No. Updaters must be pure and may be invoked more than once in development. Perform external side effects in an event handler or Effect as appropriate.

## Check yourself

1. What does `count` contain immediately after `setCount(count + 1)` in the same handler?
2. What result follows from queuing a replacement with `5` and then an increment updater?
3. Why do functional updaters compose while repeated direct replacements do not?
4. When is a callback’s captured historical value the desired behavior?
5. Why does mutating a state object violate the snapshot model?
6. When should a ref hold the latest value instead of state?
