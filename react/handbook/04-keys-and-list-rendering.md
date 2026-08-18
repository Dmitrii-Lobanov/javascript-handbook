# Chapter 4 — Keys and List Rendering

## Quick refresher

React renders collections by transforming data into elements, commonly with `map`. Each element in a dynamic sibling collection needs a key that identifies the same logical item across renders.

```tsx
function TodoList({ todos }: { todos: readonly Todo[] }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoRow key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

A good key is:

- **stable:** the same item receives the same key on every render;
- **unique among its siblings:** no two items in that collection share it;
- **derived from data identity:** usually a database ID or domain identifier.

## Why this matters

Keys are not primarily about removing a console warning. They determine how React matches siblings during reconciliation.

Incorrect keys can cause:

- input values or validation state to appear on the wrong row;
- focus and text selection to jump unexpectedly;
- expanded or selected state to follow a position instead of an item;
- Effects to clean up and restart unnecessarily;
- animations to attach to the wrong element;
- avoidable DOM replacement and lost user input.

Interviewers expect you to explain both what keys do and when an index key is unsafe.

## Core mental model

```text
key identifies the logical sibling
  ↓
React matches the old and new element with that key
  ↓
component state and DOM identity follow the item
```

Without explicit keys, React primarily matches siblings by their order. A stable key changes the question from “what is at position 2?” to “where is the item with ID `todo-42` now?”

## Rendering a collection

Keep the data transformation separate from the row’s rendering responsibility:

```tsx
type Product = {
  id: string;
  name: string;
  price: number;
  available: boolean;
};

type ProductListProps = {
  products: readonly Product[];
};

function ProductList({ products }: ProductListProps) {
  const availableProducts = products.filter(product => product.available);

  return (
    <ul>
      {availableProducts.map(product => (
        <ProductRow key={product.id} product={product} />
      ))}
    </ul>
  );
}
```

`filter` and `map` return new arrays without mutating the input. Rendering should not sort or modify the received array in place:

```tsx
// Wrong: mutates a prop during render.
products.sort((a, b) => a.price - b.price);

// Correct: creates a sorted copy.
const sortedProducts = products.toSorted((a, b) => a.price - b.price);
```

If the environment does not support `toSorted`, use `[...products].sort(...)`.

## How stable keys preserve identity

Suppose these editable rows are rendered:

```text
key a → Buy milk
key b → Book tickets
key c → Read notes
```

After sorting, the order becomes:

```text
key b → Book tickets
key a → Buy milk
key c → Read notes
```

With stable IDs, React knows that `b` moved before `a`. The local state, focus, and DOM associated with each row can remain with the corresponding task.

Keys are hints for matching React elements. They do not guarantee that React literally moves every existing DOM node, but they give React the identity information needed to preserve the correct component instances.

## Why index keys fail in changing lists

An index identifies a current position rather than the underlying item.

```tsx
// Risky when the collection can change.
todos.map((todo, index) => (
  <TodoRow key={index} todo={todo} />
));
```

Imagine row `0` has local edit text for todo A. If A is removed, todo B becomes row `0`. React sees the same key, `0`, and may reuse A’s previous component identity for B. The edit state can now appear beside the wrong data.

Index keys are usually acceptable only when all of these are true:

- the items have no stable IDs;
- the list’s order never changes;
- items are never inserted, removed, or filtered;
- rows do not contain identity-sensitive local or DOM state.

Even then, an explicit domain key is clearer when one exists.

## Why random keys are worse

Never generate keys during render:

```tsx
// Wrong
items.map(item => <Row key={Math.random()} item={item} />);
```

Every render creates different keys. React treats every row as a new identity, unmounts the old rows, and mounts new ones. Local state, focus, and uncontrolled form values are lost, while setup and cleanup work repeats.

Generate an ID once when an item is created, then store that ID in the data:

```tsx
function createTodo(title: string): Todo {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
  };
}
```

Randomness is not the problem when generating a persistent data ID. Regenerating identity during every render is the problem.

## Put the key where the array is created

The key belongs on the outermost element returned directly from `map`:

```tsx
function TodoList({ todos }: { todos: readonly Todo[] }) {
  return todos.map(todo => (
    <TodoRow key={todo.id} todo={todo} />
  ));
}

function TodoRow({ todo }: { todo: Todo }) {
  return <article>{todo.title}</article>;
}
```

Putting the key on `<article>` inside `TodoRow` is too late. React needs the key while matching the `TodoRow` siblings created by the parent.

## Keys and fragments

When each item must return multiple sibling DOM nodes, use the explicit `Fragment` form because the shorthand syntax cannot receive a key:

```tsx
import { Fragment } from "react";

function DefinitionList({ entries }: { entries: readonly Entry[] }) {
  return (
    <dl>
      {entries.map(entry => (
        <Fragment key={entry.id}>
          <dt>{entry.term}</dt>
          <dd>{entry.definition}</dd>
        </Fragment>
      ))}
    </dl>
  );
}
```

`<>...</>` cannot accept `key`.

## Key uniqueness is local

Keys need to be unique only among siblings in the same array or collection.

```tsx
<ActiveUsers users={users} />
<ArchivedUsers users={users} />
```

Both lists may use `user.id`. They are separate sibling scopes, so keys do not need to be globally unique across the application.

Duplicate keys within one collection are ambiguous. React cannot reliably know which previous sibling corresponds to which next sibling.

## Keys are not component props

React consumes `key` as reconciliation metadata. The child cannot read `props.key`.

```tsx
<TodoRow key={todo.id} todoId={todo.id} todo={todo} />
```

If the component needs the identifier, pass it separately as a normal prop.

## Keys can intentionally reset state

A key is useful outside a rendered list when two alternatives should be treated as different identities.

```tsx
function DocumentWorkspace({ documentId }: { documentId: string }) {
  return <Editor key={documentId} documentId={documentId} />;
}
```

When `documentId` changes, React unmounts the previous editor and mounts a fresh one. All local state below `Editor` resets.

This is appropriate when state belongs exclusively to one logical entity, such as:

- a message draft for a particular recipient;
- an editor history for one document;
- a form initialized for a different record.

Do not use a changing key as a general way to “force a re-render.” It forces a remount, which is more destructive and also repeats Effect setup and DOM creation.

## Keys and memoization solve different problems

- A **key** identifies which sibling an element represents across renders.
- `memo` may skip recalculating a preserved component when its props compare equal.

A stable key does not prevent a row from rendering when its parent renders. An unstable key prevents memoization from helping because React sees an entirely new component identity.

## Updating list state immutably

Stable keys work best with immutable state updates that preserve unchanged item references.

```tsx
function toggleTodo(id: string) {
  setTodos(currentTodos =>
    currentTodos.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo,
    ),
  );
}
```

The array is new, the changed todo is new, and unchanged todo objects keep their references. This makes the update predictable and allows row memoization to be effective if profiling shows it is useful.

## Key strategy table

| Key source | Stable identity? | Suitable? |
| --- | --- | --- |
| Database or domain ID | Yes | Usually the best choice |
| Composite stable fields | Sometimes | Valid if the combination is unique and immutable |
| Array index | Identifies position | Only for truly static lists |
| `Math.random()` during render | No | Never |
| `crypto.randomUUID()` during render | No | Never |
| ID generated once when data is created | Yes | Good when the backend provides no ID |

## Common traps

- Treating keys as a warning-suppression requirement rather than identity.
- Using an array index for editable, filterable, or reorderable data.
- Generating a key during rendering.
- Putting the key inside the extracted row component.
- Expecting `key` to be available through props.
- Assuming keys must be globally unique.
- Using a mutable field such as an editable title as the key.
- Expecting stable keys to prevent child renders.
- Changing a key to force an update when a normal state or prop update is sufficient.
- Mutating the list with `sort`, `splice`, or direct item assignment.

## Interview answer

Keys give React stable identity among sibling elements during reconciliation. A key should be unique among those siblings, stable across renders, and derived from the logical item—usually its domain ID. This lets state and DOM identity follow an item through insertion, deletion, and reordering. An index key identifies a position, so in a changing list it can associate existing row state with the wrong item. Random keys are worse because every render remounts every row. Keys can also be used deliberately outside lists to reset a subtree when its logical entity changes.

## Follow-up questions

### Why can an index key move input state to the wrong row?

After insertion, removal, or sorting, the same index refers to a different item. React reuses the component identity for that position, including its local and DOM state.

### When is an index key acceptable?

For a genuinely static collection with fixed order and membership and no identity-sensitive row state. Use a real ID whenever one exists.

### Why is `Math.random()` a bad key?

It changes on every render, so React cannot match old and new rows. Every row unmounts and mounts again.

### Where should a key be placed after extracting a row component?

On the row component returned directly from `map`, because that is the sibling collection React is reconciling.

### Does changing a key re-render or remount a component?

It remounts it. The previous identity unmounts and loses its state; a new identity mounts with fresh state.

### Do stable keys make list operations constant time?

No. Keys improve matching correctness and help React reuse identities, but they do not make reconciliation or DOM work free.

## Check yourself

1. What three properties make a good key?
2. Why is an editable title usually a poor key?
3. How would you assign an ID to client-created data that has no backend ID?
4. Why must the explicit `Fragment` form be used for a keyed fragment?
5. What is the difference between a key and `memo`?
6. When would changing a key be the clearest way to reset state?
