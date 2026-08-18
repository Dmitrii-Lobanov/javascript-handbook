# Chapter 6 — State Preservation and Reset

## Quick refresher

React associates local state with a component identity at a position in the rendered tree. State is preserved while the component’s type, position, and key continue to describe the same identity.

```text
same type + same tree position + same key
  → preserve local state

different type or key, or removed position
  → discard old state and mount fresh state
```

Changing props alone normally updates an existing component; it does not reset that component’s state.

## Why this matters

Interview tasks often include a product requirement hidden behind the word “state”:

- Should a chat draft reset when the recipient changes?
- Should each tab remember its unfinished form?
- Should closing a modal discard or retain entered values?
- Should switching records reinitialize a form?
- Should a multi-step flow preserve progress after a step is hidden?

The first question is not “Which Hook should I use?” It is “Which logical entity owns this state, and how long should it live?”

## Core mental model

React does not store state inside the component function. The function can run many times. React stores state against the component’s place and identity in its tree.

```tsx
function App() {
  const [compact, setCompact] = useState(false);

  return <Editor compact={compact} />;
}
```

When `compact` changes, `Editor` remains the same type at the same position with the same key. Its props update, but its local state is preserved.

## Preservation: same identity, new props

```tsx
type ChatProps = {
  contact: Contact;
};

function App({ selectedContact }: { selectedContact: Contact }) {
  return <Chat contact={selectedContact} />;
}
```

Switching `selectedContact` does not reset `Chat`. This may be correct if the draft is shared across contacts, but it may be dangerous if a message intended for Alice remains visible after switching to Bob.

React cannot infer the product meaning of the state. The developer must decide whether the component still represents the same logical thing.

## Reset with a key

When local state belongs exclusively to one entity, include that entity in the component identity:

```tsx
function App({ selectedContact }: { selectedContact: Contact }) {
  return (
    <Chat
      key={selectedContact.id}
      contact={selectedContact}
    />
  );
}
```

Changing the contact changes the key. React therefore:

1. unmounts the previous `Chat` subtree;
2. runs its Effect cleanup and clears its refs;
3. removes or replaces its host nodes as needed;
4. mounts a new `Chat` with fresh initial state;
5. runs the new subtree’s Effects after commit.

A keyed reset applies to the entire subtree, not just one state variable.

Use it when the requirement is “this is a different entity, so all local UI state below this boundary should restart.”

## Reset by changing component type

A different component type at the same position also creates a different identity:

```tsx
function AccountPanel({ mode }: { mode: "personal" | "business" }) {
  return mode === "personal" ? <PersonalForm /> : <BusinessForm />;
}
```

Switching modes unmounts one form and mounts the other. This is appropriate when they are truly different concepts and implementations.

Do not create artificial wrapper component types merely to force resets. A deliberate key usually communicates an entity-based reset more clearly.

## Removing a component discards its local state

Conditional rendering can remove a component from the tree:

```tsx
function Checkout() {
  const [showAddress, setShowAddress] = useState(false);

  return (
    <>
      <button onClick={() => setShowAddress(show => !show)}>
        Toggle address
      </button>
      {showAddress && <AddressForm />}
    </>
  );
}
```

When `showAddress` becomes false, `AddressForm` unmounts and loses its local state. Showing it again mounts a fresh form.

If the UI should disappear but its state must survive, choose one of these strategies:

- keep the component mounted and hide it visually where appropriate;
- lift the state to a parent that remains mounted;
- store the state by entity ID in a parent or external store;
- persist it to browser or server storage when it must outlive the page.

Each strategy has a cost. Keeping a hidden subtree mounted retains DOM, memory, subscriptions, and Effects. Lifting state increases the parent’s responsibility. Persistence requires synchronization and error handling.

## Preserve independent state in independent positions

If two components should remember state simultaneously, render both identities and control only their visibility:

```tsx
function Settings({ activeTab }: { activeTab: "profile" | "security" }) {
  return (
    <>
      <section hidden={activeTab !== "profile"}>
        <ProfileSettings />
      </section>
      <section hidden={activeTab !== "security"}>
        <SecuritySettings />
      </section>
    </>
  );
}
```

Both settings components remain mounted in separate tree positions, so both retain local state.

This is reasonable for small forms. It may be wasteful for many heavy tabs. In that case, lift or normalize the state and mount only the active view.

Also consider accessibility: `hidden` removes the inactive section from layout and the accessibility tree. A CSS-only visually hidden technique may not do so.

## Store drafts by logical identity

Sometimes state should survive switching away and later return to the correct entity.

```tsx
type Drafts = Record<string, string>;

function ChatWorkspace({ contact }: { contact: Contact }) {
  const [drafts, setDrafts] = useState<Drafts>({});
  const draft = drafts[contact.id] ?? "";

  function updateDraft(message: string) {
    setDrafts(current => ({
      ...current,
      [contact.id]: message,
    }));
  }

  return (
    <ChatComposer
      recipient={contact}
      value={draft}
      onChange={updateDraft}
    />
  );
}
```

The draft state belongs to `ChatWorkspace` and is indexed by contact identity. Switching contacts shows each contact’s own preserved draft.

This is different from a keyed reset:

- keyed reset discards the previous local state;
- state stored by ID preserves multiple entity-specific values.

## Resetting forms from changing records

A common interview scenario initializes a form from a selected record.

```tsx
function EditUser({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  // ...
}
```

The `useState` initializer runs only when that component identity mounts. Changing `user` does not re-run it.

If each user should receive a fresh form, key the form by user ID:

```tsx
function UserEditor({ selectedUser }: { selectedUser: User }) {
  return <EditUser key={selectedUser.id} user={selectedUser} />;
}
```

If unsaved edits should survive user switching, move drafts into state keyed by user ID instead.

If the form should always mirror the server record and never own an editable draft, it may not need local duplicated state at all.

## Avoid resetting state in an Effect by default

This pattern renders once with stale state and then schedules another render:

```tsx
function EditUser({ user }: { user: User }) {
  const [name, setName] = useState(user.name);

  useEffect(() => {
    setName(user.name);
  }, [user]);

  // ...
}
```

It also requires remembering every field that must reset and can accidentally overwrite a user edit when object identity changes.

Prefer:

- a key when the entire local subtree should restart;
- lifted state when the parent owns the draft;
- derived values when no independent local state is needed;
- an explicit event-driven reset when the user invokes a reset action.

An Effect can be justified when synchronizing with a genuinely external system, but prop-to-state copying is usually a state-modeling issue rather than synchronization.

## Explicit user-initiated reset

When a reset is a user action, update the state in that event:

```tsx
function SearchFilters() {
  const initialFilters = { query: "", category: "all" } as const;
  const [filters, setFilters] = useState({ ...initialFilters });

  function resetFilters() {
    setFilters({ ...initialFilters });
  }

  return (
    <form>
      {/* controlled fields */}
      <button type="button" onClick={resetFilters}>
        Reset filters
      </button>
    </form>
  );
}
```

Use a key at a higher boundary only if the reset should recreate all descendant state and DOM state, including uncontrolled inputs.

## State lifetime decision table

| Requirement | Typical design |
| --- | --- |
| Preserve state while props change | Keep the same type, position, and key |
| Reset all state for a different entity | Key the subtree by entity ID |
| Preserve separate state for several visible views | Render them in separate stable positions |
| Preserve state after a view unmounts | Lift it or store it externally |
| Preserve a draft per entity | Store drafts keyed by entity ID |
| Reset selected fields from a button | Update them in the event handler |
| Recompute a value from current props | Derive it during render instead of storing it |
| Persist across reloads or devices | Browser or server persistence, as required |

## Common traps

- Assuming a prop change re-runs a `useState` initializer.
- Clearing several local state fields in an Effect after a prop changes.
- Adding a key without realizing the whole subtree will remount.
- Using a key when the user expects unsaved state to survive.
- Storing important data only inside a component that can unmount.
- Confusing hiding a mounted component with conditionally removing it.
- Keeping many expensive hidden trees mounted without considering memory and Effects.
- Using an array index as an entity identity.
- Defining components inside another component and accidentally resetting state.
- Treating persistence and preservation as the same requirement.

## Interview answer

React preserves local state for the same component type and key at the same tree position. Changing props alone does not reset state, and a `useState` initializer does not run again on an ordinary update. If a new logical entity should start with fresh local state, I key the subtree by that entity’s stable ID. If state must survive unmounting or be restored per entity, I lift it to a stable owner or store it by ID. I avoid copying props into state and resetting them in an Effect unless there is a real synchronization requirement; the correct choice follows the intended state lifetime.

## Follow-up questions

### When should a chat be keyed by recipient ID?

When a draft belongs only to the active recipient and should be discarded upon switching. The new key mounts a fresh chat subtree.

### What if every recipient’s draft must be preserved?

Store drafts in a parent or external store keyed by recipient ID. A key alone resets state; it does not preserve previous instances indefinitely.

### Why does `useState(user.name)` not update when `user` changes?

The initializer is used for the component’s initial mount. If React preserves the same identity, later prop changes do not reinitialize its state.

### What is the cost of hiding instead of unmounting?

The component retains state, DOM, memory, and potentially active Effects or subscriptions. It may be appropriate for small frequently switched views but expensive at scale.

### Why is an Effect often the wrong reset mechanism?

It commits one render with the previous state and then schedules another. It also duplicates state-management logic and can overwrite user input. Identity or ownership usually expresses the requirement more directly.

### Does changing a key merely re-render a component?

No. It creates a new identity: the old subtree unmounts and cleans up, while a new subtree mounts with fresh state.

## Check yourself

1. Why does changing a component’s props normally preserve its local state?
2. When should a form be keyed by a record ID?
3. How would you preserve a separate draft for every chat contact?
4. What resources remain active when a component is hidden but still mounted?
5. Why can resetting prop-derived state in an Effect produce a stale intermediate render?
6. What is the difference between preserving state, resetting state, and persisting state?
