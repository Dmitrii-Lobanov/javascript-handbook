# Reorderable List

## The interview prompt

Build a reusable list whose items can be reordered. Start with explicit Move up and Move down controls, then add drag-and-drop without removing keyboard access. Keep item identity stable and expose the new order to the parent.

This tutorial treats drag-and-drop as a progressive enhancement. A correct immutable reorder operation and an accessible non-pointer interaction are the first interview checkpoint.

## What we will build

```text
Write moveItem
  ↓
Render Up and Down controls
  ↓
First working implementation
  ↓
Extract a generic controlled API
  ↓
Add native drag-and-drop
  ↓
Add keyboard shortcuts and announcements
  ↓
Add optimistic persistence
  ↓
Complete interview solution
```

For a 40–55 minute interview, finish immutable reordering, stable keys, a controlled API, and keyboard-accessible controls first. Drag previews, touch gestures, virtualization, and collaborative ordering are follow-up topics.

## Clarify the requirements

Ask before coding:

1. Is the list controlled by its parent or should it own the items?
2. Is reordering triggered by buttons, keyboard shortcuts, drag-and-drop, or all three?
3. Must touch input work?
4. Can every item move, or are some items pinned?
5. Should dropping place the item before, after, or directly at the target index?
6. Must the order be persisted?
7. What happens when persistence fails?
8. Can filtering or virtualization change the visible indices?

For this tutorial:

- the parent owns the ordered items;
- every item has a stable string or number ID;
- Move up and Move down buttons provide the baseline interaction;
- Alt + Arrow Up or Alt + Arrow Down is an optional shortcut;
- native drag-and-drop enhances mouse and trackpad use;
- dropping an item moves it to the target item's current index;
- the parent may optimistically persist a new order;
- persistence failure restores the previous order.

## Requirements and deliberate non-requirements

### Required in the interview version

- Immutable reordering
- Stable item identity
- Generic item rendering
- Controlled items and `onReorder`
- Move up and Move down controls
- Clear disabled states at list boundaries
- Drag-and-drop enhancement
- Keyboard shortcut and screen-reader announcement
- Optional disabled state during persistence

### Explain, but do not necessarily finish

- Pointer-event drag support for touch devices
- Drag overlays and animated layout transitions
- Moving multiple selected items
- Reordering a filtered or virtualized list
- Server conflict resolution
- Fractional ranking for very large lists
- Cross-list dragging
- Undo and redo history

## System design before implementation

Use a short RADIO pass because this UI has meaningful input, accessibility, ownership, and persistence boundaries.

### R — Requirements

The primary interaction is:

```text
choose item
  → choose destination
  → derive a new array
  → notify parent
  → render stable items in the new order
```

Important non-functional requirements:

- **Accessibility:** reordering must not depend on pointer dragging.
- **Correctness:** no item is duplicated or lost.
- **Identity:** an item's ID remains stable when its index changes.
- **Recoverability:** a failed save can restore the previous order.
- **Responsiveness:** local reordering appears immediately.

### A — Architecture

```text
ReorderableCollection
├── ordered item state
├── persistence and rollback
└── ReorderableList
    ├── immutable move operation
    ├── button and keyboard input
    ├── drag state
    └── live announcements
```

The reusable list owns only temporary interaction state such as the dragged ID and announcement. The parent owns domain data and persistence.

### D — Data model

| Data | Owner | Stored or derived? |
| --- | --- | --- |
| Ordered items | Parent | State |
| Item ID | Domain item | Stable data |
| Current index | Items array | Derived |
| Dragged item ID | Reorderable list | Temporary state |
| Current drop target ID | Reorderable list | Temporary state |
| Can move up/down | Index and length | Derived |
| Saving status | Persisting parent | State |

Store IDs rather than indices for an active drag. Indices can change after a render; stable IDs preserve intent.

### I — Interfaces

The reusable component needs ordered data, identity, presentation, and a change callback. Persistence stays outside it.

### O — Optimizations and deep dives

For a normal interview list, copying and scanning an array is appropriate. For thousands of persisted items, discuss virtualized rendering and rank-based ordering rather than prematurely complicating the baseline.

## Type contract

Define the types before the component uses them:

```tsx
import type { ReactNode } from "react";

type ItemId = string | number;

export type ReorderableListProps<T> = {
  items: readonly T[];
  getId(item: T): ItemId;
  renderItem(item: T): ReactNode;
  getLabel(item: T): string;
  onReorder(items: T[]): void;
  disabled?: boolean;
};
```

Why each prop exists:

- `items` is the current controlled order;
- `getId` supplies stable React keys and interaction identity;
- `renderItem` makes the list independent of a particular domain type;
- `getLabel` creates useful button labels and announcements;
- `onReorder` sends the newly derived array to the owner;
- `disabled` prevents overlapping edits while a simple persistence request is pending.

## Step 1 — Implement immutable movement

Solve the array problem before the UI problem:

```ts
export function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}
```

Example:

```ts
moveItem(["A", "B", "C", "D"], 1, 3);
// ["A", "C", "D", "B"]
```

Do not mutate the prop array with `splice`. Copy first, remove exactly one item, then insert that item at the target index.

Returning a copy for a no-op keeps this helper's return type simple. A production API could deliberately return the original reference for no-op moves if consumers benefit from referential equality.

## Step 2 — Add explicit reorder controls

Begin with a concrete list. Buttons are fast to implement and already work with keyboard and assistive technology:

```tsx
import { useState } from "react";

type Task = {
  id: string;
  title: string;
};

const initialTasks: Task[] = [
  { id: "research", title: "Research requirements" },
  { id: "build", title: "Build the feature" },
  { id: "test", title: "Test edge cases" },
];

export function TaskList() {
  const [tasks, setTasks] = useState(initialTasks);

  function move(fromIndex: number, toIndex: number) {
    setTasks(current => moveItem(current, fromIndex, toIndex));
  }

  return (
    <ol>
      {tasks.map((task, index) => (
        <li key={task.id}>
          <span>{task.title}</span>
          <button
            type="button"
            onClick={() => move(index, index - 1)}
            disabled={index === 0}
            aria-label={`Move ${task.title} up`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, index + 1)}
            disabled={index === tasks.length - 1}
            aria-label={`Move ${task.title} down`}
          >
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}
```

Stable `task.id` keys are essential. An array index is a position, not identity; using it as the key can attach local component state to the wrong item after movement.

## First working implementation

At this checkpoint the candidate has demonstrated:

- one ordered source of truth;
- immutable movement;
- stable keys;
- correct first and last boundary states;
- accessible keyboard-operable controls.

This is already a complete baseline. Add drag behavior only after verifying that values are neither duplicated nor lost.

## Step 3 — Make the component generic and controlled

Move domain state to the parent and let the reusable component emit the next order:

```tsx
export function ReorderableList<T>({
  items,
  getId,
  getLabel,
  renderItem,
  onReorder,
  disabled = false,
}: ReorderableListProps<T>) {
  function move(fromIndex: number, toIndex: number) {
    if (disabled || fromIndex === toIndex) return;
    onReorder(moveItem(items, fromIndex, toIndex));
  }

  return (
    <ol>
      {items.map((item, index) => (
        <li key={getId(item)}>
          <div>{renderItem(item)}</div>
          <button
            type="button"
            onClick={() => move(index, index - 1)}
            disabled={disabled || index === 0}
            aria-label={`Move ${getLabel(item)} up`}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => move(index, index + 1)}
            disabled={disabled || index === items.length - 1}
            aria-label={`Move ${getLabel(item)} down`}
          >
            ↓
          </button>
        </li>
      ))}
    </ol>
  );
}
```

The component does not copy `items` into local state. Mirroring controlled props would create two orders that must be synchronized.

## Step 4 — Add drag-and-drop as an enhancement

Store the dragged and hovered items by ID:

```tsx
const [draggedId, setDraggedId] = useState<ItemId | null>(null);
const [overId, setOverId] = useState<ItemId | null>(null);
```

Add native drag handlers to each list item:

```tsx
<li
  draggable={!disabled}
  onDragStart={event => {
    const id = getId(item);
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
  }}
  onDragOver={event => {
    if (draggedId === null || draggedId === getId(item)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOverId(getId(item));
  }}
  onDrop={event => {
    event.preventDefault();
    moveById(draggedId, getId(item));
    resetDrag();
  }}
  onDragEnd={resetDrag}
>
  {/* item content and buttons */}
</li>
```

`preventDefault()` in `onDragOver` is required to make the element a valid drop target. Setting plain text data improves compatibility with browsers that otherwise do not start a native drag.

Native HTML drag-and-drop does not provide good touch behavior by itself. State that limitation rather than claiming complete cross-device support.

## Step 5 — Add keyboard shortcuts and announcements

The buttons are the dependable keyboard interface. Add Alt + Arrow as a convenience on the focused item:

```tsx
onKeyDown={event => {
  if (!event.altKey) return;

  if (event.key === "ArrowUp" && index > 0) {
    event.preventDefault();
    move(index, index - 1);
  }

  if (event.key === "ArrowDown" && index < items.length - 1) {
    event.preventDefault();
    move(index, index + 1);
  }
}}
```

Make the item focusable with `tabIndex={0}` and explain the shortcut once:

```tsx
<p id="reorder-instructions">
  Use the Move buttons, or focus an item and press Alt with an arrow key.
</p>

<ol aria-describedby="reorder-instructions">...</ol>
```

After a move, announce the outcome:

```tsx
const [announcement, setAnnouncement] = useState("");

setAnnouncement(
  `${getLabel(item)} moved to position ${toIndex + 1} of ${items.length}.`,
);

<p className="sr-only" aria-live="polite" aria-atomic="true">
  {announcement}
</p>
```

Stable keyed DOM nodes normally preserve focus when their position changes. Test this rather than manually focusing on every render.

## Complete solution

```tsx
import { useState, type DragEvent, type KeyboardEvent, type ReactNode } from "react";

type ItemId = string | number;

export type ReorderableListProps<T> = {
  items: readonly T[];
  getId(item: T): ItemId;
  getLabel(item: T): string;
  renderItem(item: T): ReactNode;
  onReorder(items: T[]): void;
  disabled?: boolean;
};

export function moveItem<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  if (
    fromIndex < 0 ||
    fromIndex >= items.length ||
    toIndex < 0 ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }

  const next = [...items];
  const [movedItem] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, movedItem);
  return next;
}

export function ReorderableList<T>({
  items,
  getId,
  getLabel,
  renderItem,
  onReorder,
  disabled = false,
}: ReorderableListProps<T>) {
  const [draggedId, setDraggedId] = useState<ItemId | null>(null);
  const [overId, setOverId] = useState<ItemId | null>(null);
  const [announcement, setAnnouncement] = useState("");

  function resetDrag() {
    setDraggedId(null);
    setOverId(null);
  }

  function move(fromIndex: number, toIndex: number) {
    if (
      disabled ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= items.length ||
      toIndex >= items.length ||
      fromIndex === toIndex
    ) {
      return;
    }

    const movedItem = items[fromIndex];
    onReorder(moveItem(items, fromIndex, toIndex));
    setAnnouncement(
      `${getLabel(movedItem)} moved to position ${toIndex + 1} of ${items.length}.`,
    );
  }

  function moveById(sourceId: ItemId | null, targetId: ItemId) {
    if (sourceId === null) return;

    const fromIndex = items.findIndex(item => getId(item) === sourceId);
    const toIndex = items.findIndex(item => getId(item) === targetId);
    move(fromIndex, toIndex);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLLIElement>,
    index: number,
  ) {
    if (!event.altKey || disabled) return;

    if (event.key === "ArrowUp" && index > 0) {
      event.preventDefault();
      move(index, index - 1);
    }

    if (event.key === "ArrowDown" && index < items.length - 1) {
      event.preventDefault();
      move(index, index + 1);
    }
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>, item: T) {
    if (disabled) return;

    const id = getId(item);
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, targetId: ItemId) {
    if (disabled || draggedId === null || draggedId === targetId) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setOverId(targetId);
  }

  function handleDrop(event: DragEvent<HTMLLIElement>, targetId: ItemId) {
    event.preventDefault();
    moveById(draggedId, targetId);
    resetDrag();
  }

  return (
    <section aria-busy={disabled || undefined}>
      <p id="reorder-instructions">
        Use the Move buttons, or focus an item and press Alt with an arrow key.
      </p>

      <ol className="reorderable-list" aria-describedby="reorder-instructions">
        {items.map((item, index) => {
          const id = getId(item);
          const isDragging = id === draggedId;
          const isDropTarget = id === overId;

          return (
            <li
              className={isDropTarget ? "reorderable-item drop-target" : "reorderable-item"}
              key={id}
              tabIndex={0}
              draggable={!disabled}
              aria-describedby="reorder-instructions"
              data-dragging={isDragging || undefined}
              onKeyDown={event => handleKeyDown(event, index)}
              onDragStart={event => handleDragStart(event, item)}
              onDragOver={event => handleDragOver(event, id)}
              onDrop={event => handleDrop(event, id)}
              onDragEnd={resetDrag}
            >
              <span className="drag-handle" aria-hidden="true">⋮⋮</span>
              <div className="reorderable-content">{renderItem(item)}</div>
              <div className="reorderable-actions">
                <button
                  type="button"
                  onClick={() => move(index, index - 1)}
                  disabled={disabled || index === 0}
                  aria-label={`Move ${getLabel(item)} up`}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, index + 1)}
                  disabled={disabled || index === items.length - 1}
                  aria-label={`Move ${getLabel(item)} down`}
                >
                  ↓
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
```

The visual handle communicates drag intent, while the actual list item is draggable. The handle is hidden from assistive technology because the labeled buttons and documented keyboard shortcut expose the operable alternatives.

## Example usage

```tsx
import { useState } from "react";
import { ReorderableList } from "./ReorderableList";

type PlaylistItem = {
  id: string;
  title: string;
  artist: string;
};

const initialPlaylist: PlaylistItem[] = [
  { id: "track-1", title: "First Light", artist: "Mira" },
  { id: "track-2", title: "Side Street", artist: "Northbound" },
  { id: "track-3", title: "After Rain", artist: "Kite Theory" },
];

export function PlaylistEditor() {
  const [tracks, setTracks] = useState(initialPlaylist);

  return (
    <ReorderableList
      items={tracks}
      getId={track => track.id}
      getLabel={track => track.title}
      renderItem={track => (
        <>
          <strong>{track.title}</strong>
          <span>{track.artist}</span>
        </>
      )}
      onReorder={setTracks}
    />
  );
}
```

The component works for tracks, tasks, navigation links, dashboard panels, or any other ordered data with stable IDs.

## Add optimistic persistence

Keep persistence in the parent. Apply the new order immediately, disable more moves during this simple request, and roll back on failure:

```tsx
import { useState } from "react";

type SaveOrder<T> = (itemIds: T[]) => Promise<void>;

type Project = {
  id: string;
  name: string;
};

type ProjectListProps = {
  initialProjects: Project[];
  saveOrder: SaveOrder<string>;
};

export function ProjectList({
  initialProjects,
  saveOrder,
}: ProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleReorder(nextProjects: Project[]) {
    if (saving) return;

    const previousProjects = projects;
    setProjects(nextProjects);
    setSaving(true);
    setError("");

    try {
      await saveOrder(nextProjects.map(project => project.id));
    } catch {
      setProjects(previousProjects);
      setError("The new order could not be saved. Your previous order was restored.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <ReorderableList
        items={projects}
        getId={project => project.id}
        getLabel={project => project.name}
        renderItem={project => project.name}
        onReorder={handleReorder}
        disabled={saving}
      />
      {saving && <p role="status">Saving order…</p>}
      {error && <p role="alert">{error}</p>}
    </>
  );
}
```

Disabling during a request is intentionally simple and prevents overlapping saves. A production interface that must allow continuous reordering needs request serialization, version numbers, or a latest-write-wins contract so older responses cannot overwrite newer intent.

## Minimal CSS

```css
.reorderable-list {
  display: grid;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}

.reorderable-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid currentColor;
  border-radius: 0.5rem;
}

.reorderable-item[data-dragging="true"] {
  opacity: 0.5;
}

.reorderable-item.drop-target {
  outline: 3px solid Highlight;
  outline-offset: 2px;
}

.drag-handle {
  cursor: grab;
}

.reorderable-content {
  display: grid;
}

.reorderable-actions {
  display: flex;
  gap: 0.25rem;
}
```

Keep visible focus styles. Color should not be the only drop-target indicator; the outline supplies shape as well as color.

## Complexity

Let `n` be the number of items:

- button move: `O(n)` because the array is copied and spliced;
- drag ID lookup: `O(n)` for each source and target lookup;
- render: `O(n)`;
- temporary interaction state: `O(1)` beyond the copied result array;
- optimistic rollback snapshot: `O(1)` additional allocation because it retains the previous immutable array reference.

These costs are appropriate for ordinary UI lists. A memoized ID-to-index map can improve repeated lookup, but rendering and copying still dominate until the data is unusually large.

## Testing strategy

### Pure movement

1. Moving forward produces the expected order.
2. Moving backward produces the expected order.
3. The original array is unchanged.
4. Invalid and identical indices do not lose items.
5. Object references and IDs are preserved.

### Component behavior

6. The first Up and last Down buttons are disabled.
7. Clicking a button emits the complete next order.
8. Alt + Arrow moves the focused item.
9. Focus remains associated with the same stable item.
10. A successful drop emits the correct order.
11. Drag end clears temporary visual state.
12. The live region announces the item and new position.
13. Disabled mode blocks buttons, keyboard movement, and dragging.

### Persistence

14. The new order appears before the save resolves.
15. Successful persistence retains the new order.
16. Failed persistence restores the previous order and reports an error.
17. Another reorder is blocked while the simple save is pending.

Test button and keyboard behavior as the reliable accessibility contract. Native drag events can be covered separately, but should not be the only evidence that users can reorder.

## Common interview mistakes

- Mutating the incoming `items` prop.
- Using array indices as React keys.
- Storing both items and a separate array of ordered IDs without a synchronization need.
- Using a dragged index that becomes stale after reordering.
- Implementing drag-and-drop before the movement operation works.
- Making drag the only interaction.
- Forgetting to call `preventDefault()` in `onDragOver`.
- Leaving drag state active after drop or drag cancellation.
- Persisting inside the generic presentation component.
- Applying optimistic updates without a rollback or request-order policy.
- Claiming native HTML drag-and-drop fully supports touch input.

## Senior follow-up discussion

### How would you support touch?

Use pointer events or a well-tested drag library. Define activation distance, pointer capture, collision detection, auto-scroll, cancellation, and a drag overlay. Keep the button or keyboard path because pointer support does not replace accessibility.

### What changes for filtered lists?

Visible indices no longer necessarily match indices in the source collection. Reorder by stable IDs, define whether movement applies within the visible subset or the complete order, and merge the result back without disturbing hidden items.

### What changes for virtualization?

Off-screen drop targets do not exist in the DOM. The drag layer must cooperate with the virtualizer, calculate positions from measurements, and auto-scroll near viewport boundaries. This is a reason to prefer a library in production.

### How should the server store order?

For small lists, send the complete ordered ID array. For large or frequently edited lists, store sortable ranks so one move updates only the moved record. Fractional ranks eventually require compaction, and concurrent edits need version or conflict semantics.

### Would you use a drag-and-drop library?

Usually in production, especially for touch, sensors, overlays, auto-scroll, collision strategies, and cross-list movement. In an interview, implement the immutable ordering and accessible baseline yourself so the important state and identity reasoning remains visible.

## Interview-ready explanation

The parent owns one ordered item array, while the reusable list owns only temporary drag and announcement state. Every move derives a new array with a pure helper and emits it through `onReorder`; stable item IDs serve as React keys and drag identity because indices are only positions. Move buttons are the baseline accessible interaction, Alt + Arrow is a shortcut, and native drag-and-drop is progressive enhancement. Persistence belongs to the parent, which can optimistically apply the next order and either confirm it or restore the previous immutable array on failure.

## Final checklist

- [ ] Reordering is immutable and never loses an item.
- [ ] Stable IDs—not indices—represent identity.
- [ ] The reusable component is controlled and generic.
- [ ] Move buttons work without pointer input.
- [ ] Keyboard shortcuts prevent default scrolling when handled.
- [ ] Drag state uses IDs and is cleared after the interaction.
- [ ] Changes are announced with the new position.
- [ ] Native drag limitations are stated honestly.
- [ ] Persistence and rollback remain in the parent.
- [ ] Advanced production behavior does not obscure the interview baseline.
