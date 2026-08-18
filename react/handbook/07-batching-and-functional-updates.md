# Chapter 7 — Batching and Functional Updates

## Quick refresher

React queues state updates and normally batches related updates before rendering. Batching avoids exposing partially updated UI and reduces unnecessary render and commit work.

A setter can queue either:

- a **replacement value**, such as `setCount(5)`;
- an **updater function**, such as `setCount(current => current + 1)`.

Functional updaters are required when the next state depends on previously queued state.

## Why this matters

Interviewers use this topic to test whether you can predict update results rather than treating setters as immediate assignments.

You should be able to answer:

- Why do three `setCount(count + 1)` calls usually add only one?
- How are updater functions processed?
- What happens when replacement values and updaters are mixed?
- Which updates does modern React batch?
- Does batching merge different state variables?
- When is `flushSync` justified?

## Core mental model

```text
event or callback runs
  ↓
setters enqueue state transitions
  ↓
React processes each Hook's queue in order
  ↓
React renders with the resulting state
  ↓
React commits the required changes
```

The current handler keeps its existing render snapshot throughout this process. Queuing an update does not modify the local state variable already captured by that handler.

## Replacement updates use the current snapshot

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function addThree() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return <button onClick={addThree}>Count: {count}</button>;
}
```

When `count` is `0`, all three expressions evaluate immediately to `1`. Conceptually, React receives three requests to replace the state with `1`. The final state is therefore `1`, not `3`.

This is not because React “lost” two updates. The application queued the same replacement value three times.

## Functional updaters compose

```tsx
function addThree() {
  setCount(current => current + 1);
  setCount(current => current + 1);
  setCount(current => current + 1);
}
```

React processes these functions in queue order. Each updater receives the result produced by the previous update:

| Queued update | Input | Output |
| --- | ---: | ---: |
| `current => current + 1` | 0 | 1 |
| `current => current + 1` | 1 | 2 |
| `current => current + 1` | 2 | 3 |

The next render receives `3`.

Use a functional updater when the next state depends on the previous state:

```tsx
setCount(count => count + 1);
setOpen(open => !open);
setItems(items => [...items, newItem]);
setSelection(selection => selection.filter(id => id !== removedId));
```

## Replacement and updater ordering

React processes queued updates in the order they were added.

### Replacement, then updater

```tsx
setCount(count + 5);
setCount(current => current + 1);
```

If the snapshot is `0`, the replacement queues `5`, then the updater receives `5` and returns `6`.

### Updater, then replacement

```tsx
setCount(current => current + 1);
setCount(5);
```

The updater produces `1`, but the later replacement makes the final queued result `5`.

### Several mixed updates

```tsx
setCount(5);
setCount(current => current * 2);
setCount(current => current + 3);
```

React calculates:

```text
replace with 5 → 10 → 13
```

Do not memorize isolated examples. Walk through the queue in order.

## Updater functions must be pure

An updater calculates next state from its argument. It must not perform external work:

```tsx
// Wrong
setItems(items => {
  analytics.track("item_added");
  return [...items, newItem];
});
```

React may call updater functions more than once in development Strict Mode to detect impurity. Put the side effect in the event handler and keep the transition pure:

```tsx
function addItem(newItem: Item) {
  analytics.track("item_added");
  setItems(items => [...items, newItem]);
}
```

An updater must also return new objects or arrays rather than mutating its argument.

```tsx
// Wrong
setItems(items => {
  items.push(newItem);
  return items;
});

// Correct
setItems(items => [...items, newItem]);
```

## What batching guarantees

Batching lets React process several queued updates before producing the next visible UI.

```tsx
function submit() {
  setSubmitting(true);
  setError(null);
  setAttemptCount(count => count + 1);
}
```

React can render once with the combined result instead of committing intermediate combinations such as “submitting but old error still visible.”

Batching does **not** mean:

- all state is merged into one object;
- setters mutate variables synchronously;
- updates can be reordered arbitrarily;
- React will always call the component exactly once;
- separate intentional user interactions become one event.

Code should depend on final state semantics, not on counting renders.

## Automatic batching in modern React

Modern React batches updates from more sources than only React event handlers. Updates in callbacks such as promises, timers, and native event listeners are generally batched when the application uses a modern root.

```tsx
function loadProfile() {
  fetchProfile().then(profile => {
    setProfile(profile);
    setLoading(false);
  });
}
```

These updates can result in one render with both changes applied.

An asynchronous function can cross scheduling boundaries:

```tsx
async function save() {
  setSaving(true);

  await saveDocument();

  setSaving(false);
  setSavedAt(Date.now());
}
```

The update before `await` and the updates after it do not form one uninterrupted synchronous batch. The post-`await` updates can be batched together. The user can therefore see the intended intermediate saving state.

Avoid designing logic around subtle batching boundaries. Express correct state transitions regardless of how many render attempts React uses.

## Separate user events stay separate

React does not combine distinct intentional interactions in a way that breaks event semantics. If a user clicks a submit button twice, React processes the first event’s update before the next click where necessary—for example, so a disabled button can prevent the second submission.

Batching groups related updates; it does not erase the boundaries of meaningful user actions.

## Multiple state variables have separate queues

Each state Hook has its own update queue, but React can process their results in one render.

```tsx
function openDialog() {
  setSelectedItem(item);
  setDialogOpen(true);
}
```

The next render can receive both the selected item and the open state. React does not merge them into one value.

If several state variables always change together and represent one transition, consider whether they should be one object or managed by `useReducer`:

```tsx
type FormState =
  | { status: "editing"; error: null }
  | { status: "submitting"; error: null }
  | { status: "error"; error: string }
  | { status: "success"; error: null };
```

This is a modeling choice, not a batching requirement. Separate state values are fine when they change independently.

## Functional updates avoid stale async writes

Suppose several asynchronous responses add notifications:

```tsx
function handleNotification(notification: Notification) {
  setNotifications([...notifications, notification]);
}
```

The callback may capture an older `notifications` array, causing later writes to overwrite one another. Calculate from the queued current state:

```tsx
function handleNotification(notification: Notification) {
  setNotifications(current => [...current, notification]);
}
```

This solves state-transition staleness. It does not solve all async problems: stale requests can still finish out of order, so request identity, cancellation, or response validation may also be required.

## When direct replacement is clearer

Not every setter needs an updater. Direct replacement is appropriate when the next value does not depend on previous state:

```tsx
setOpen(true);
setQuery(event.target.value);
setSelectedUser(user);
setError(null);
```

Writing `setOpen(() => true)` adds no value. Choose the form that expresses the transition.

If you reference a state variable only to calculate its next value, an updater is usually safer:

```tsx
// Better than setOpen(!open) when updates may queue.
setOpen(open => !open);
```

## The rare role of `flushSync`

`flushSync` forces React to process updates and synchronously update the DOM before the callback returns.

```tsx
import { flushSync } from "react-dom";

function addAndScroll(item: Item) {
  flushSync(() => {
    setItems(items => [...items, item]);
  });

  listRef.current?.lastElementChild?.scrollIntoView();
}
```

Without the forced commit, the new DOM node might not exist when the imperative measurement runs.

This is an escape hatch for integrations that require the DOM immediately, such as certain browser APIs or third-party widgets. It can hurt performance, force pending work to run, and undermine batching. Do not use it to make ordinary state logic feel synchronous.

Often a ref callback, layout Effect, or declarative design expresses the requirement better.

## Update strategy table

| Requirement | Appropriate update |
| --- | --- |
| Set a value independent of old state | `setValue(nextValue)` |
| Increment or toggle | Functional updater |
| Apply several cumulative updates | Functional updaters in queue order |
| Update an object from its current fields | Functional updater returning a new object |
| Update several independent Hooks | Queue each; React can batch the render |
| Model one complex transition | Consider `useReducer` |
| Read DOM immediately after a required commit | Rare `flushSync`, after considering alternatives |

## Common traps

- Treating a setter as a synchronous assignment.
- Expecting repeated replacement updates from one snapshot to accumulate.
- Assuming functional updaters run immediately when queued.
- Mutating the updater argument.
- Performing logging, requests, or analytics inside an updater.
- Using direct replacement when an async callback depends on current state.
- Assuming batching merges separate state Hooks.
- Depending on an exact number of component calls.
- Claiming every update across an `await` belongs to one batch.
- Using `flushSync` for normal application flows.
- Believing a functional updater solves request race conditions by itself.

## Interview answer

React queues state updates and batches related work before rendering. A direct value is a replacement calculated from the current render’s snapshot, so repeated `setCount(count + 1)` calls queue the same value. A functional updater receives the latest value produced by the queue, which makes cumulative updates compose correctly. Modern React generally batches updates from React events and asynchronous callbacks, but application correctness should not depend on render counts or subtle batch boundaries. Updaters must remain pure, and `flushSync` is reserved for rare imperative integrations that need the DOM committed immediately.

## Follow-up questions

### What does three `setCount(count + 1)` calls produce from zero?

Usually `1`, because each expression reads the same zero snapshot and queues replacement with `1`.

### What does three increment updater functions produce?

`3`. React passes each updater the result of the previous queued update.

### Are state updates asynchronous?

It is more precise to say setters enqueue updates for a future render. The current closure keeps its snapshot, and React schedules and batches the queued work.

### Does automatic batching mean the loading state never appears?

No. Updates separated by asynchronous boundaries can produce separate renders. A pre-`await` loading update can commit before the post-`await` result updates.

### When should state values be combined?

When they represent one coherent state machine, must maintain invariants together, or are easier to transition atomically. Do not combine them merely because React batches their updates.

### When is `flushSync` acceptable?

When an unavoidable imperative integration must read or manipulate DOM that depends on a state update immediately. It should remain localized and rare.

## Check yourself

1. Starting from `2`, what is the result of replacement with `5`, multiplication by `2`, then addition of `3`?
2. Why must an updater function be pure?
3. Which direct state updates remain clearer than functional updaters?
4. How does batching differ from merging state?
5. Why might updates before and after `await` produce separate renders?
6. What problem does `flushSync` solve, and what is its cost?
