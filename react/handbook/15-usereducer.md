# Chapter 15 — useReducer

## Quick refresher

`useReducer` centralizes state transitions in a pure reducer: `(state, action) => nextState`.

## Why this matters

Reducers make complex transitions explicit, testable, and resistant to invalid partial updates. They do not automatically improve performance or replace application-wide state tools.

## Core mental model

```tsx
type State = { status: "idle" | "saving" | "error"; message: string };
type Action =
  | { type: "submitted" }
  | { type: "succeeded" }
  | { type: "failed"; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "submitted": return { ...state, status: "saving", message: "" };
    case "succeeded": return { ...state, status: "idle" };
    case "failed": return { status: "error", message: action.message };
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

Actions describe what happened, while the reducer decides how state changes. Keep reducers pure: no requests, timers, random values, mutation, or other side effects. Perform effects outside the reducer and dispatch the resulting event.

Choose a reducer when multiple fields change together, transitions are numerous, or centralizing state logic improves clarity. Several independent `useState` calls are often simpler for small components.

## Model events, not setters

Actions should describe what happened in the domain:

```tsx
type Action =
  | { type: "fieldChanged"; field: "email" | "name"; value: string }
  | { type: "submitted" }
  | { type: "submissionSucceeded" }
  | { type: "submissionFailed"; message: string };
```

An action such as `{ type: "setLoading", value: false }` exposes implementation details and may allow invalid transitions. `{ type: "submissionSucceeded" }` lets the reducer update status, error, and other related fields consistently.

## Reducer flow

```text
user or external event
  ↓ dispatch(action)
reducer(currentState, action)
  ↓
next state
  ↓
render
```

Dispatch queues an update; it does not call external systems. The reducer may be called more than once in development, so it must remain deterministic and pure.

## Exhaustive actions with TypeScript

Use a discriminated union and assert impossible cases:

```tsx
function assertNever(value: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(value)}`);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    // cases...
    default:
      return assertNever(action);
  }
}
```

When a new action is added, TypeScript identifies reducers that have not handled it.

## Lazy initialization

When initial state requires computation, pass an initializer:

```tsx
const [state, dispatch] = useReducer(
  reducer,
  savedDraft,
  createInitialState,
);
```

React uses `createInitialState(savedDraft)` for initialization rather than recalculating it on every render.

## Reducer versus alternatives

| Situation | Prefer |
| --- | --- |
| One or two independent values | `useState` |
| Several fields with related transitions | `useReducer` |
| Reusable pure transition logic | Reducer function |
| State shared by distant components | Reducer plus Context, or an external store |
| Cached remote data | Server-state solution |

A reducer does not make state global. It remains local to the component calling `useReducer` unless its state and dispatch are provided elsewhere.

## Testing reducers

Reducers are ordinary pure functions, so test transition tables directly:

```tsx
expect(reducer(initialState, { type: "submitted" })).toEqual({
  ...initialState,
  status: "saving",
  message: "",
});
```

Component tests should still verify user-visible behavior and that UI events dispatch the intended flow.

## Common traps

- Using a reducer for every component by default.
- Performing side effects inside the reducer.
- Creating actions that merely expose setters, such as `setField` for everything.
- Mutating and returning the existing state object.

## Interview answer

I use `useReducer` when state transitions are related enough that explicit events and one transition function make the model clearer. The reducer stays pure and returns new state; event handlers or Effects perform external work and dispatch outcomes. It improves transition design, not automatically rendering performance.

## Follow-up questions

### Does `useReducer` improve performance automatically?

No. It improves transition organization. Rendering performance still depends on ownership, component boundaries, and actual work.

### Where should an API request happen?

Outside the reducer. An event handler or Effect performs the request and dispatches its outcome.

### Can a reducer be reused without React?

Yes. A pure reducer is an ordinary transition function and can be tested or reused independently.

## Check yourself

1. Why is `submissionSucceeded` more meaningful than `setLoading(false)`?
2. Which operations are forbidden inside a reducer?
3. When is `useState` clearer than `useReducer`?
4. What problem does an exhaustive action union solve?
5. Does `useReducer` create shared state automatically?
