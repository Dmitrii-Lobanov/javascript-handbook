# Chapter 3 — Reconciliation and Element Identity

## Quick refresher

React preserves a component instance when the element at a tree position has the same type and identity. Changing the type or key tells React that it is a different subtree.

## Why this matters

This model explains surprising state resets, preserved form values, Effect cleanup, and why defining components inside other components is dangerous.

## Core mental model

React compares element trees using practical rules:

- different element types produce different subtrees;
- the same component type at the same position is normally preserved;
- keys refine identity among siblings.

```tsx
function Profile({ compact }: { compact: boolean }) {
  return compact ? <UserForm className="compact" /> : <UserForm className="wide" />;
}
```

Both branches return `UserForm` at the same position, so its state is preserved. A prop changed; its identity did not.

```tsx
function Profile({ compact }: { compact: boolean }) {
  return compact ? <CompactForm /> : <FullForm />;
}
```

The types differ, so React unmounts one subtree and mounts the other. Local state resets and Effect cleanup runs.

Never define a component inside another component: each parent render creates a new function identity, which can cause the nested component’s state to reset.

## Common traps

- Believing JSX branches automatically create separate identities.
- Confusing a prop change with a component replacement.
- Defining component functions during render.
- Using keys without understanding that they deliberately affect identity.

## Interview answer

Reconciliation matches the next element tree with the previous tree. React generally preserves state when the same component type and key remain at the same tree position. A changed type or key creates a new identity, so React unmounts the old subtree and mounts a new one. This heuristic makes tree comparison efficient and gives developers explicit control over preservation.

## Check yourself

When a conditional changes only a component’s props, should its local state reset? Why?
