# Chapter 3 — Reconciliation and Element Identity

## Quick refresher

Reconciliation is how React matches the next element tree with the previously committed tree. The result determines whether React:

- updates an existing component and preserves its state;
- mounts a new component with fresh state;
- unmounts an old component and runs its cleanup;
- reuses, updates, inserts, moves, or removes host nodes.

React primarily reasons about a component’s **type**, **position in the tree**, and **key**. State belongs to a component identity at a tree position—not to a JSX tag or a variable name by itself.

## Why this matters

This mental model explains several frequent interview problems:

- Why did form state unexpectedly reset?
- Why did state remain when conditional content changed?
- Why are list keys important?
- How can a key intentionally reset a component?
- Why is defining a component inside another component dangerous?
- Why did an Effect clean up and run again?

The useful interview answer is not “React compares the virtual DOM.” You should explain what React uses to decide whether two elements represent the same component identity.

## Core mental model

```text
same tree position + same element type + same key
  → preserve component identity and local state

different type or different key at that position
  → unmount old subtree and mount a new subtree
```

Keys are part of position. Without an explicit key, React primarily uses the element’s order among its siblings.

## Elements, components, and instances

These terms are related but distinct:

- A **React element** is an immutable description such as `<UserCard user={user} />`.
- A **component type** is the function or class referenced by that element, such as `UserCard`.
- A mounted **component instance** is React’s preserved identity for that type at a particular tree position. Function components do not expose a JavaScript instance object, but React still preserves their Hook state and lifecycle identity.
- A **host node** is a platform element such as a DOM `<div>`.

Calling a component function again normally updates the same component identity. It does not imply a remount.

## Rule 1: Different types replace the subtree

When the element type at a position changes, React treats it as a different subtree.

```tsx
function Profile({ compact }: { compact: boolean }) {
  return compact ? <CompactProfile /> : <FullProfile />;
}
```

Switching `compact` changes the root component type at that position. React unmounts the old profile and mounts the other one.

Consequences include:

- local state is discarded;
- Effect cleanup runs for the removed subtree;
- refs are cleared;
- old DOM nodes may be removed and new ones created;
- the new subtree starts with fresh state and Effects.

The same rule applies to host elements:

```tsx
return emphasized ? <strong>{label}</strong> : <span>{label}</span>;
```

Changing from `strong` to `span` replaces that host subtree rather than updating one tag into another.

## Rule 2: The same type at the same position preserves state

Different JSX branches do not automatically create different component identities.

```tsx
function Profile({ compact }: { compact: boolean }) {
  return compact ? (
    <UserForm layout="compact" />
  ) : (
    <UserForm layout="wide" />
  );
}
```

Both branches place `UserForm` in the same tree position with the same type and no differing key. React updates its props and preserves its local state.

This remains true even though the JSX appears on different lines. React reasons about the returned tree, not the source-code branch that produced it.

Often the clearest version is to keep the stable structure explicit:

```tsx
function Profile({ compact }: { compact: boolean }) {
  return <UserForm layout={compact ? "compact" : "wide"} />;
}
```

## Rule 3: Keys refine sibling identity

A key tells React which sibling an element represents across renders. Keys are most visible in lists, but they can define identity anywhere siblings may change.

```tsx
function UserList({ users }: { users: readonly User[] }) {
  return (
    <ul>
      {users.map(user => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  );
}
```

If the list is reordered, `user.id` lets React associate each `UserRow` with the same logical user. Its state moves with that identity instead of staying attached to the old array index.

A good key is:

- unique among the current siblings;
- stable for the lifetime of the logical item;
- derived from the item’s identity, usually a database or domain ID.

Keys do not need to be globally unique. They only need to distinguish siblings in the same collection.

## Position without explicit keys

When siblings have no keys, their order acts as identity. This can be safe for fixed, non-reordered content, but it becomes risky for dynamic lists.

```tsx
{tasks.map((task, index) => (
  <TaskEditor key={index} task={task} />
))}
```

If a task is inserted at the beginning, the item previously at index `0` moves to index `1`. React instead matches the new first item with the old identity at index `0`, which can make uncontrolled input values or local state appear under the wrong task.

An index key is acceptable only when the list is truly static: items are never reordered, inserted, removed, or filtered, and they have no stable identity of their own.

## Keys can intentionally reset state

Changing a key tells React that the element represents a different identity, even if its component type and visual position are unchanged.

```tsx
function Chat({ recipient }: { recipient: User }) {
  return <MessageComposer key={recipient.id} recipient={recipient} />;
}
```

When the recipient changes, React unmounts the previous composer and mounts a fresh one. A draft intended for one person cannot leak into another conversation.

Use this deliberately. A key is a clear reset boundary when all local state below it should be recreated. If only one value should change, updating that state directly may be more precise than remounting the entire subtree.

## State follows tree identity, not visual placement

State is attached to the returned React tree. CSS that moves an element visually does not change its React identity. Conversely, moving JSX to a different parent or sibling position can change identity even if the result looks identical on screen.

```tsx
function Dashboard({ showSidebar }: { showSidebar: boolean }) {
  return (
    <main>
      {showSidebar && <Sidebar />}
      <Editor />
    </main>
  );
}
```

Because `Sidebar` and `Editor` occupy distinct structural positions, toggling the conditional does not necessarily make `Editor` the same kind of unkeyed list item as the sidebar. React uses the actual child structure and element types when matching. For dynamic homogeneous sibling collections, explicit stable keys remove ambiguity.

The safest interview habit is to reason from the complete returned tree: parent, sibling slot, type, and key.

## Never define component types during render

Defining a component inside another component creates a new function object on every parent render. React sees a different component type and remounts it.

```tsx
function ProfilePage() {
  const [name, setName] = useState("");

  function NameInput() {
    return <input value={name} onChange={event => setName(event.target.value)} />;
  }

  return <NameInput />;
}
```

Every `ProfilePage` render creates a new `NameInput` function identity. This can reset the input subtree and rerun its Effects.

Move the component definition to module scope:

```tsx
type NameInputProps = {
  value: string;
  onChange: (value: string) => void;
};

function NameInput({ value, onChange }: NameInputProps) {
  return <input value={value} onChange={event => onChange(event.target.value)} />;
}

function ProfilePage() {
  const [name, setName] = useState("");
  return <NameInput value={name} onChange={setName} />;
}
```

Passing a new callback prop may cause an update, but it does not change the component type and therefore does not reset its state.

## Conditional rendering cases

### Same type, different props

```tsx
{isAdmin ? <Panel mode="admin" /> : <Panel mode="member" />}
```

`Panel` is preserved because its type, position, and key are the same.

### Same type, different keys

```tsx
{isAdmin ? (
  <Panel key="admin" mode="admin" />
) : (
  <Panel key="member" mode="member" />
)}
```

The changed key intentionally resets `Panel`.

### Different types

```tsx
{isAdmin ? <AdminPanel /> : <MemberPanel />}
```

The types differ, so React replaces the subtree.

### Component removed from the tree

```tsx
{showForm && <CheckoutForm />}
```

When `showForm` becomes false, the form unmounts and its local state is lost. Rendering it again creates a new identity. Lift the state to a preserved parent if it must survive being hidden, or hide it without removing it when that tradeoff is appropriate.

## Identity and Effects

Identity determines whether an Effect is updated or completely discarded:

- Preserved component: Effect cleanup and setup depend on its dependency changes.
- Replaced or removed component: all of its Effect cleanup runs as it unmounts.
- Newly mounted component: its Effects start fresh after commit.

Unexpected repeated Effect setup can therefore indicate either changing dependencies or an unintended remount caused by type, key, or position.

## Identity decision table

| Type | Position | Key | Result |
| --- | --- | --- | --- |
| Same | Same | Same | Preserve identity and state |
| Different | Same | Any | Replace subtree and reset state |
| Same | Same | Different | Replace subtree and reset state |
| Same | Different parent or slot | Any | Usually a different identity |
| Same list item | Reordered | Stable domain key | Preserve logical item identity |
| Same list item | Reordered | Index key | State may attach to the wrong item |

## Common traps

- Saying React preserves state because the JSX “looks the same.”
- Believing separate conditional branches always create separate identities.
- Confusing a prop update with a component replacement.
- Defining a component function inside another component.
- Generating keys with `Math.random()` or `Date.now()` during render.
- Using array indexes as keys in a list that can change order.
- Expecting a `key` to appear inside the child’s props.
- Assuming keys must be globally unique.
- Adding a key without realizing that changing it resets every stateful descendant.
- Treating a re-render and a remount as synonyms.

## Interview answer

During reconciliation, React matches the next element tree with the previous one. It generally preserves a component and its local state when the same element type and key remain at the same tree position. If the type or key changes, React treats it as a new identity: the old subtree unmounts, its Effects clean up, and a new subtree mounts with fresh state. In lists, stable domain keys let identity follow logical items through insertion and reordering. This is also why defining components inside another component is unsafe—the nested function is a new type on every render.

## Follow-up questions

### If only a component’s props change, does its state reset?

No. If its type, position, and key remain the same, React normally preserves the component identity and updates it with new props.

### Why are random keys harmful?

A new random key is produced on every render. React therefore remounts every item, losing local state and DOM state and repeating setup work.

### Is an array index always a bad key?

No. It can be acceptable for a static list whose order and membership never change. It is unsafe when items can be inserted, deleted, filtered, or reordered.

### Can a key be used outside a list?

Yes. A changed key can distinguish alternatives at the same position or deliberately reset a stateful subtree.

### Can a child read its own key from props?

No. `key` is metadata used by React. Pass the same value as a separate prop if the component needs it.

### What is the difference between a re-render and a remount?

A re-render recalculates an existing identity and normally preserves its state. A remount creates a new identity with fresh state after cleaning up the previous one.

## Check yourself

1. Why does switching `<Form theme="light" />` to `<Form theme="dark" />` normally preserve form state?
2. What lifecycle work happens when a component’s key changes?
3. Why can an index key put input state on the wrong list item after reordering?
4. How would you intentionally clear a chat draft when the recipient changes?
5. Why does moving a component definition to module scope prevent accidental resets?
6. How would you tell whether repeated Effect setup comes from dependency changes or a remount?
