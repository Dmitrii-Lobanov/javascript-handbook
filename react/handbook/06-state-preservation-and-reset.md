# Chapter 6 — State Preservation and Reset

## Quick refresher

React associates state with a component’s position and identity in the rendered tree, not with the JSX text or component function in isolation.

## Why this matters

Interview tasks frequently involve resetting forms, switching users, conditionally rendering panels, or preserving tabs. The correct solution follows identity rather than manually clearing every state field.

## Core mental model

State is preserved when the same component type and key remain in the same position:

```tsx
<Chat contact={selectedContact} />
```

Changing `selectedContact` changes props but preserves `Chat` state. That may be useful, or it may leave a draft intended for the previous recipient.

Reset the subtree by changing its identity:

```tsx
<Chat key={selectedContact.id} contact={selectedContact} />
```

Now changing contacts unmounts the old `Chat` and mounts a fresh one. Alternatively, render distinct components in distinct tree positions when both states should be preserved.

Before resetting, decide where the state belongs. If a draft must survive unmounting, lift it to a parent or store it by contact ID. A key is a reset tool, not persistence.

## Common traps

- Clearing several state variables in an Effect when a key expresses the reset directly.
- Assuming conditional JSX location in source code defines identity.
- Adding a key when state should actually survive.
- Storing important drafts only in a component that may unmount.

## Interview answer

React preserves state for the same component identity at the same tree position. Changing props alone does not reset it. Changing the component type or key creates a new identity and resets the subtree. I choose between preservation, keyed reset, and lifting state based on the product requirement rather than clearing state reactively in an Effect.

## Check yourself

When switching between chat recipients, when should you use a key and when should you lift draft state instead?
