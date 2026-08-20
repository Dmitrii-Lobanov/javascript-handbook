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

## Design state from invariants

Start by listing facts the interface must represent and combinations that must never occur. Then choose a shape that makes valid transitions easy.

For asynchronous data, independent flags allow contradictions:

```tsx
// Can accidentally become loading and successful at once.
const [isLoading, setIsLoading] = useState(false);
const [data, setData] = useState<User[] | null>(null);
const [error, setError] = useState<Error | null>(null);
```

A discriminated union encodes the valid modes:

```tsx
type UsersState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };
```

Now a successful state must contain data, an error state must contain an error, and impossible combinations cannot be constructed accidentally.

## Group by update behavior

Values that always change together often belong in one state object or reducer transition. Values that change independently are usually clearer as separate state variables.

```tsx
const [position, setPosition] = useState({ x: 0, y: 0 });
const [isDragging, setIsDragging] = useState(false);
```

`x` and `y` describe one position and usually update together. Dragging mode changes for different reasons, so it remains separate.

Do not group state merely because the values appear in the same component. Ask whether one update must preserve an invariant across them.

## Normalize collections around identity

Duplicating an object creates two sources of truth:

```tsx
const [items, setItems] = useState(initialItems);
const [selectedItem, setSelectedItem] = useState(initialItems[0]);
```

If `items` refreshes, `selectedItem` can point to an older object. Store identity and derive the current record:

```tsx
const [selectedId, setSelectedId] = useState(initialItems[0]?.id ?? null);
const selectedItem =
  items.find(item => item.id === selectedId) ?? null;
```

For frequently updated relational data, normalize entities by ID:

```tsx
type State = {
  entities: Record<string, Item>;
  orderedIds: string[];
  selectedId: string | null;
};
```

Do not normalize small local collections automatically. The extra indirection should solve a real identity or update problem.

## Avoid deeply nested update paths

Deep nesting makes immutable updates verbose and increases the chance of accidental mutation:

```tsx
setProject(project => ({
  ...project,
  settings: {
    ...project.settings,
    notifications: {
      ...project.settings.notifications,
      email: enabled,
    },
  },
}));
```

Flatten independent concepts, split ownership into child components, or use a reducer or immutable-update helper when the domain is genuinely nested. Do not flatten data so aggressively that relationships become harder to understand.

## State-shape decision table

| Requirement | Prefer |
| --- | --- |
| Mutually exclusive modes | One status or discriminated union |
| Values always updated together | One object or reducer transition |
| Values updated independently | Separate state variables |
| Selected record already exists in a list | Store its ID |
| Value calculable from current inputs | Derive during render |
| Many related transitions | `useReducer` |
| State needed only by one small child | Move it closer to that child |

## Common traps

- Mirroring props in state without a clear ownership reason.
- Storing both a selected object and the collection that contains it.
- Using several booleans for one state machine.
- Flattening everything even when related values always change together.

## Interview answer

I keep state minimal, normalize it around stable IDs, and represent mutually exclusive modes with one status rather than contradictory booleans. I group values by how they change and derive anything that can be calculated from props or state. This reduces invalid states and removes synchronization code.

## Follow-up questions

### Should related values always be one object?

No. Group them when they form one concept or must change atomically. Separate them when they change independently.

### Is normalized state always better?

No. It helps with shared identity and frequent entity updates, but adds indirection that small local lists may not need.

### When should state move into a reducer?

When many related transitions must preserve invariants and explicit events make the model easier to understand and test.

## Check yourself

1. Why is `selectedId` often safer than a duplicated `selectedItem` object?
2. How would you prevent loading, success, and error modes from contradicting one another?
3. When should two values be grouped into one state object?
4. What is the tradeoff of normalizing a small collection?
5. When does a difficult immutable update suggest a reducer or ownership change?
