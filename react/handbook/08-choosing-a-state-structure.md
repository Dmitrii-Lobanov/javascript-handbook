# Chapter 8 — Choosing a State Structure

## Quick refresher

- Keep state minimal and represent each fact once.
- Group values that change together; separate values that change independently.
- Avoid contradictory, redundant, deeply nested, or duplicated state.
- Prefer IDs over duplicating complete objects when the object already exists in a collection.

## Why this matters

Many React bugs are state-modeling bugs rather than rendering bugs. A good model makes invalid combinations difficult to represent and reduces synchronization Effects.

## Core mental model

Avoid independent booleans that can contradict one another:

```tsx
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [isSuccess, setIsSuccess] = useState(false);
```

Model the mutually exclusive state directly:

```tsx
type Status = "idle" | "loading" | "success" | "error";
const [status, setStatus] = useState<Status>("idle");
```

For collections, store stable identity rather than a second object copy:

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);
const selectedItem = items.find(item => item.id === selectedId) ?? null;
```

When updating nested data, treat state as immutable and copy only the changed path. If updates become difficult to express or many transitions must remain consistent, consider a reducer.

## Common traps

- Mirroring props in state without a clear ownership reason.
- Storing both a selected object and the collection that contains it.
- Using several booleans for one state machine.
- Flattening everything even when related values always change together.

## Interview answer

I keep state minimal, normalize it around stable IDs, and represent mutually exclusive modes with one status rather than contradictory booleans. I group values by how they change and derive anything that can be calculated from props or state. This reduces invalid states and removes synchronization code.

## Check yourself

Why is `selectedId` often safer than storing a duplicate `selectedItem` object?
