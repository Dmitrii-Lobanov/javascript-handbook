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

## Common traps

- Using a reducer for every component by default.
- Performing side effects inside the reducer.
- Creating actions that merely expose setters, such as `setField` for everything.
- Mutating and returning the existing state object.

## Interview answer

I use `useReducer` when state transitions are related enough that explicit events and one transition function make the model clearer. The reducer stays pure and returns new state; event handlers or Effects perform external work and dispatch outcomes. It improves transition design, not automatically rendering performance.

## Check yourself

Why is `dispatch({ type: "saveSucceeded" })` usually more meaningful than `dispatch({ type: "setLoading", value: false })`?
