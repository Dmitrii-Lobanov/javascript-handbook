# Chapter 17 — State Ownership and Lifting State

## Quick refresher

- Every piece of state should have one clear owner.
- Keep state as close as possible to the components that use it.
- Lift it to the nearest common ancestor when multiple descendants must coordinate.
- Pass data down and communicate changes upward through callbacks.

## Why this matters

State placement determines coupling, render scope, and whether components can disagree. Interviewers often test whether you can find the owner without immediately reaching for context or a global store.

## Core mental model

Two inputs that must stay synchronized need a shared owner:

```tsx
function TemperatureCalculator() {
  const [celsius, setCelsius] = useState(0);

  return (
    <>
      <TemperatureInput value={celsius} onChange={setCelsius} />
      <TemperatureInput
        value={toFahrenheit(celsius)}
        onChange={value => setCelsius(toCelsius(value))}
      />
    </>
  );
}
```

The parent owns the source of truth; each child receives a value and reports intent. Do not lift state higher than necessary: distant ownership increases prop plumbing and can enlarge the subtree affected by updates.

Before choosing context or an external store, ask:

1. Which components read the value?
2. Which events change it?
3. What is their closest stable common owner?
4. Must it survive that owner unmounting?

## Common traps

- Keeping synchronized copies in multiple children.
- Moving all state to the application root.
- Using context solely to avoid passing a prop through one or two layers.
- Confusing server cache data with client UI state.

## Interview answer

I place state at the lowest component that owns all reads and writes. If siblings must coordinate, I lift one source of truth to their closest common ancestor and pass values and event callbacks down. I move beyond that boundary only when lifetime, sharing, or update requirements justify context, URL state, a server cache, or an external store.

## Check yourself

When does lifting state improve consistency but worsen performance or maintainability?
