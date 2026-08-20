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

## Find the source of truth

For each value, identify readers, writers, lifetime, and persistence requirements. A component should not own a synchronized copy merely because it displays the value.

```tsx
function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <SearchResults query={query} />
    </>
  );
}
```

The nearest common ancestor owns `query`; the input reports edits and the results derive from the same value.

## Keep state low when coordination is unnecessary

Moving every input value to a page or application root increases prop plumbing and broadens render scope. State used by one expandable row should usually remain in that row.

Colocation also clarifies lifetime: when the row unmounts, its local UI state disappears. Lift it only if the product requires preservation beyond that boundary.

## Ownership is different from distribution

Context can distribute state, but the provider still owns it. An external store owns state outside the component tree. A server-state cache owns remote-data lifecycles. URL state is appropriate when navigation, sharing, or restoration should reproduce the value.

| Requirement | Likely owner |
| --- | --- |
| One component’s temporary UI | That component |
| Sibling coordination | Closest common ancestor |
| Deep subtree-wide configuration | Context provider |
| Shareable navigation state | URL/router |
| Cached remote records | Server-state layer |
| High-frequency cross-tree updates | External store with subscriptions |

## Avoid two-way synchronization

Two components should not each own a copy and synchronize through Effects. Choose one canonical value and treat other representations as controlled projections or derivations.

## Common traps

- Keeping synchronized copies in multiple children.
- Moving all state to the application root.
- Using context solely to avoid passing a prop through one or two layers.
- Confusing server cache data with client UI state.

## Interview answer

I place state at the lowest component that owns all reads and writes. If siblings must coordinate, I lift one source of truth to their closest common ancestor and pass values and event callbacks down. I move beyond that boundary only when lifetime, sharing, or update requirements justify context, URL state, a server cache, or an external store.

## Follow-up questions

### Is prop drilling always a problem?

No. A few explicit props often make ownership clearer than hidden context dependencies.

### When should state move higher?

When multiple consumers must coordinate or the value must survive the current owner’s unmounting.

### Does Context own state?

No. The provider component or an external source owns the value; Context distributes it.

## Check yourself

1. When does lifting state improve consistency but worsen maintainability?
2. What is the closest common owner of two synchronized inputs?
3. When should state remain colocated in a child?
4. How does URL state differ from local UI state?
5. Why are synchronized copies usually unsafe?
