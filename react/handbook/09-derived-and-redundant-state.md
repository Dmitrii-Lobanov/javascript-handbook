# Chapter 9 — Derived and Redundant State

## Quick refresher

If a value can be calculated from current props and state during render, it usually should not be stored as state.

## Why this matters

Redundant state creates an additional source of truth. It can become stale, requires extra updates, and often causes an unnecessary render through an Effect.

## Core mental model

Do not synchronize a value React can calculate:

```tsx
function Name({ firstName, lastName }: Props) {
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
}
```

Derive it while rendering:

```tsx
function Name({ firstName, lastName }: Props) {
  const fullName = `${firstName} ${lastName}`;
  return <span>{fullName}</span>;
}
```

Expensive derivation is still derivation. Measure first, then use `useMemo` only when avoiding the recalculation is valuable.

State is appropriate when the value represents independent information: user input, a server result, a chosen mode, or a snapshot intentionally captured at a particular time. Initializing state from a prop can be valid when the prop is explicitly only an initial value, such as `initialColor`.

## Derive collections during render

Filtering, sorting, totals, and validation summaries are common derived values:

```tsx
const visibleTodos = todos
  .filter(todo => todo.title.includes(query))
  .toSorted((a, b) => a.title.localeCompare(b.title));

const completedCount = todos.filter(todo => todo.completed).length;
```

Do not synchronize them through Effects:

```tsx
// Avoid: commits stale visibleTodos, then schedules another render.
useEffect(() => {
  setVisibleTodos(filterTodos(todos, query));
}, [todos, query]);
```

Render-time derivation always uses one consistent snapshot of its inputs.

## Initial values are not synchronized values

This initializer is read only when the component identity mounts:

```tsx
function ColorPicker({ initialColor }: { initialColor: string }) {
  const [color, setColor] = useState(initialColor);
  // Later initialColor changes do not overwrite the user's choice.
}
```

Name the prop `initialColor` or `defaultColor` to communicate that contract. If the parent must always own the value, make the component controlled with `color` and `onColorChange`.

If a different entity should receive fresh local state, key the component by entity ID rather than resetting copied props in an Effect.

## Historical snapshots can be legitimate state

Sometimes the product requires remembering a previous fact:

```tsx
const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);

function submit() {
  setSubmittedOrder(currentOrder);
}
```

`submittedOrder` is not redundant with `currentOrder`; it intentionally preserves what the user submitted at a particular time.

Ask whether the value represents a current calculation or information accumulated over time.

## Expensive derivation and memoization

`useMemo` can cache a calculation between renders when dependencies are equal:

```tsx
const visibleRows = useMemo(
  () => expensiveFilter(rows, query),
  [rows, query],
);
```

It is still a derived value, not semantic state. React may recompute it, so correctness cannot depend on the cache. Measure the calculation and its render frequency before adding memoization.

## Derivation decision table

| Value | Store or derive? |
| --- | --- |
| `firstName + lastName` | Derive |
| Filtered or sorted rows | Derive |
| User-edited draft | Store |
| Currently selected item from `selectedId` | Derive |
| Submitted snapshot | Store |
| Expensive calculation | Derive; memoize only if useful |

## Common traps

- Using an Effect to synchronize two pieces of local state.
- Assuming every calculated value needs `useMemo`.
- Copying a prop into state and expecting later prop changes to synchronize automatically.
- Removing state that intentionally represents a historical snapshot.

## Interview answer

I derive values during render whenever current props and state already contain the required information. Storing the result would duplicate a source of truth and introduce synchronization risk. I use state only when the value changes independently or intentionally captures information over time, and I memoize expensive derivations only after identifying a real cost.

## Follow-up questions

### Why not derive data in an Effect?

The component first commits with stale data, then the Effect schedules another render. Render-time derivation uses the same current snapshot immediately.

### Does `useMemo` turn a derived value into state?

No. It only caches a calculation as an optimization; React may recompute it.

### When is copying a prop into state valid?

When the prop explicitly provides only an initial or default value and later local edits are independently owned.

## Check yourself

1. When is `useState(props.value)` intentional, and when is it a synchronization bug?
2. Why does Effect-based derivation create an unnecessary stale commit?
3. Is an expensive calculation automatically state?
4. Why is a submitted snapshot different from a current derived value?
5. How would you reset local state for a different record without copying props in an Effect?
