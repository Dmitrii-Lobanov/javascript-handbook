# Chapter 4 — Keys and List Rendering

## Quick refresher

Keys identify siblings across renders. A good key is stable, unique among siblings, and derived from the underlying data.

## Why this matters

Incorrect keys produce subtle bugs: state appears on the wrong row, focused inputs move, animations break, and unnecessary mounts occur.

## Core mental model

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  return todos.map(todo => <TodoRow key={todo.id} todo={todo} />);
}
```

When items reorder, `todo.id` lets React associate each element with the same conceptual todo. An array index identifies a position instead. It is safe only when the list is truly static: items are not inserted, removed, reordered, or independently stateful.

```tsx
// Risky for a changing list
todos.map((todo, index) => <TodoRow key={index} todo={todo} />);
```

Keys are not globally unique and are not passed as a normal prop. They matter only within the immediate sibling collection. A key can also intentionally reset state:

```tsx
<Editor key={documentId} documentId={documentId} />
```

Changing `documentId` gives `Editor` a new identity and resets its local state.

## Common traps

- Using the array index for editable or reorderable data.
- Generating a random key during render, which remounts every item.
- Expecting `props.key` to exist.
- Adding keys deep inside the row instead of where the array is created.

## Interview answer

Keys give React stable identity among siblings during reconciliation. Data IDs are usually best because identity survives insertion, deletion, and reordering. Index keys represent positions and can attach local state to the wrong item when a list changes. Keys can also intentionally reset a subtree by changing its identity.

## Check yourself

Why can an index key put an uncontrolled input’s value on the wrong row after sorting?
