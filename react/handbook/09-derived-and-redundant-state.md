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

## Common traps

- Using an Effect to synchronize two pieces of local state.
- Assuming every calculated value needs `useMemo`.
- Copying a prop into state and expecting later prop changes to synchronize automatically.
- Removing state that intentionally represents a historical snapshot.

## Interview answer

I derive values during render whenever current props and state already contain the required information. Storing the result would duplicate a source of truth and introduce synchronization risk. I use state only when the value changes independently or intentionally captures information over time, and I memoize expensive derivations only after identifying a real cost.

## Check yourself

When is `useState(props.value)` intentional, and when does it create a synchronization bug?
