# File Explorer Tree

## The interview prompt

Build a file explorer that renders nested folders and files. Users must be able to expand and collapse folders and select an item.

This tutorial begins with a small recursive component. We will get that version working before adding selection, accessibility, and keyboard navigation.

## What we will build

```text
Clarify requirements and design the system
  ↓
Render one node
  ↓
Render nested data recursively
  ↓
Expand and collapse folders
  ↓
First working implementation
  ↓
Select an item
  ↓
Add tree semantics
  ↓
Add keyboard navigation
  ↓
Complete interview solution
```

For a 35–50 minute interview, prioritize recursion, stable identity, and independent expansion. Add the complete keyboard model only after the core behavior works.

## Clarify the requirements

Ask a few questions before writing code:

1. Are node IDs unique across the complete tree?
2. Are folder children already loaded or fetched on demand?
3. Can empty folders exist?
4. Does clicking a folder select it, expand it, or both?
5. Is only one item selected at a time?
6. Which keyboard interactions are expected?
7. Do we need rename, create, delete, or drag-and-drop?

For this tutorial:

- every node has a stable, globally unique ID;
- folder children are already available;
- folders expand independently;
- clicking a row selects it, and clicking its disclosure button toggles it;
- one item may be selected;
- arrow keys, Home, End, Enter, and Space are supported;
- editing and server persistence are extensions, not core requirements.

## System design before implementation

Use GreatFrontEnd's [RADIO framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework) to structure the design:

```text
R — Requirements
A — Architecture
D — Data model
I — Interfaces
O — Optimizations and deep dives
```

For a live-coding interview, use RADIO to settle the hierarchy, ownership, and interaction model, then implement recursive rendering before advanced tree behavior.

### R — Requirements

The functional requirements are:

- render nested files and folders from caller-provided data;
- expand and collapse folders independently;
- select one file or folder;
- render empty folders correctly;
- expose tree, treeitem, and group semantics;
- move keyboard focus through visible nodes with Arrow keys;
- use Arrow Right and Arrow Left to expand, collapse, enter, and leave folders;
- support Home, End, Enter, and Space;
- keep collapsed descendants out of rendering and navigation.

Important non-functional requirements are:

- **Correctness:** stable identity and immutable updates preserve the right branch state.
- **Accessibility:** hierarchy, focus, selection, and expansion are perceivable and keyboard-operable.
- **Reusability:** the explorer owns interaction while the parent decides what selection means.
- **Scalability:** the design can evolve toward lazy children, normalized editing, or virtualization.
- **Maintainability:** recursive rendering and flat keyboard navigation have clear, separate responsibilities.

Assume all children are already loaded, node IDs are globally unique, one item may be selected, and editing is out of scope. Lazy loading, rename, create, delete, move, drag-and-drop, multi-selection, and very large trees are follow-ups.

### A — Architecture

Separate parent-owned hierarchy data from explorer-owned interaction:

```text
Parent application
├── owns file/folder hierarchy
├── handles selected-node behavior
└── FileExplorer
    ├── interaction coordinator
    │   ├── expansion
    │   ├── selection
    │   └── roving keyboard focus
    ├── visible-node derivation
    └── recursive TreeItem
        ├── node row and disclosure
        └── child group
            └── recursive TreeItem...
```

Responsibilities:

| Boundary | Responsibility |
| --- | --- |
| Parent | Supplies immutable hierarchy and handles application behavior after selection |
| FileExplorer | Owns expansion, selection, active focus, refs, and keyboard coordination |
| Visible-node helper | Flattens only expanded branches into current navigation order |
| TreeItem | Renders one node and recursively renders an expanded folder's children |

Recursive rendering mirrors the data and semantic hierarchy. A flat array is better for previous/next navigation. They are two derived representations of the same source rather than competing state stores.

Use unidirectional interaction flow:

```text
click disclosure
  → TreeItem calls onToggle(folderId)
  → FileExplorer immutably updates expandedIds
  → recursive tree and visible order derive again

press Arrow Down
  → FileExplorer finds current ID in visible order
  → activeId changes to the next visible ID
  → matching TreeItem receives DOM focus
```

One coordinator and one recursive node component are enough for the interview. Do not put unrelated local expansion state into every node if complete-tree keyboard coordination is required.

### D — Data model

Separate hierarchy data, ephemeral UI state, DOM references, and derived navigation:

| Data | Origin | Owner | Stored or derived? |
| --- | --- | --- | --- |
| Explorer nodes | Parent/server | Parent | Input prop |
| Expanded folder IDs | User | FileExplorer | State set |
| Selected node ID | User | FileExplorer | State |
| Active focus ID | Keyboard/pointer | FileExplorer | State |
| Tree-item elements | Rendered DOM | FileExplorer | Ref map |
| Visible node order | Nodes and expansion | FileExplorer | Derived |
| Parent/depth metadata | Hierarchy | Visible-node helper | Derived |
| Icons and disclosure symbol | Kind and expansion | TreeItem | Derived |

The recursive domain model has two variants:

- a file has identity and a name;
- a folder has identity, a name, and recursive children.

Do not embed `isExpanded`, `isSelected`, or `isFocused` into server records. Two explorer instances can display the same hierarchy with different interaction state.

Maintain these invariants:

1. The input tree remains immutable.
2. Every ID is globally unique and stable.
3. Only folder IDs appear in the expanded set.
3. Selection, focus, and expansion remain independent.
4. Recursive markup mirrors the nested hierarchy.
5. A flattened visible-node view supports keyboard navigation.
6. Collapsed descendants are neither rendered nor navigable.
7. At most one node is selected.
8. Exactly one visible node participates in the normal Tab order.

### I — Interfaces

The component interface supplies data, an accessible name, initial expansion, and a selection event:

```ts
type FileExplorerProps = {
  nodes: readonly ExplorerNode[];
  ariaLabel: string;
  defaultExpandedIds?: readonly string[];
  onSelect?: (node: ExplorerNode) => void;
};
```

| Interface category | Props |
| --- | --- |
| Hierarchy data | `nodes` |
| Accessibility | `ariaLabel` |
| Initial interaction configuration | `defaultExpandedIds` |
| Event | `onSelect` |

The callback returns the original node so the parent can open a preview, update a route, or show metadata. The explorer stores only its stable ID for visual selection.

Internal component callbacks keep recursive nodes presentational:

```ts
onToggle(folderId)
onFocusItem(nodeId)
onSelect(node)
onKeyDown(event, node)
```

The DOM interface follows the tree pattern:

```text
tree[aria-label]
└── treeitem[aria-expanded?, aria-selected, tabIndex]
    └── group
        └── treeitem...
```

Only folders expose `aria-expanded`. Focus and selection are separate: `tabIndex` identifies the roving focus target, while `aria-selected` identifies the chosen node.

For lazy loading, the data interface must distinguish unloaded, loading, loaded-empty, loaded-with-children, and error states. An empty array alone cannot represent all of them.

### O — Optimizations and deep dives

Focus on the areas that are distinctive to hierarchical widgets.

#### Recursive versus normalized data

Recursive data is ideal for read-heavy rendering and interview clarity. Frequent rename, create, move, or delete operations can make repeated recursive copying expensive and complex. A normalized `nodesById` plus child-ID lists provides direct updates but requires hierarchy assembly and invariant enforcement.

#### Lazy-load children safely

Load a folder the first time it expands, deduplicate requests by folder ID, retain loaded children after collapse, and expose folder-local loading, failure, and retry UI. Protect against committing children after the folder or data source becomes obsolete.

#### Prevent invalid moves

A folder cannot move into itself or any descendant. Validate on the client for immediate feedback and on the server for authority. Moving a node also requires rules for name conflicts, permissions, optimistic rollback, focus, selection, and expanded ancestors.

#### Preserve interaction after data refresh

Stable IDs allow expansion and selection to survive new node objects. Remove IDs that no longer exist, and choose a valid visible focus target if the active node disappears or moves into a collapsed branch.

#### Keep navigation efficient

The interview version can flatten visible nodes in `O(v)` and find the active index in `O(v)`, where `v` is the visible count. A large tree may also derive an ID-to-index map for constant-time lookup.

#### Virtualize only the visible model

For genuinely large expanded trees, virtualize the flattened visible sequence rather than the raw hierarchy. Plan focus retention, scrolling to newly focused nodes, dynamic row heights, screen-reader behavior, browser search, and printing first.

#### Support typeahead thoughtfully

Production trees often let users type characters to focus the next matching visible label. Normalize text with locale requirements, use a short reset timer, and search visible nodes from the current position without interfering with browser shortcuts.

#### Test hierarchy and interaction together

Verify nested semantics, disclosure state, roving Tab order, Arrow navigation, selection, focus after collapse, dynamic removal, and empty folders. Roles without keyboard behavior do not make a complete tree widget.

With RADIO established, define the discriminated recursive types and build one node before expansion or keyboard coordination.

## Define the data types first

Use a discriminated union so TypeScript knows that only folders have children.

```tsx
export type FileNode = {
  id: string;
  name: string;
  kind: "file";
};

export type FolderNode = {
  id: string;
  name: string;
  kind: "folder";
  children: readonly ExplorerNode[];
};

export type ExplorerNode = FileNode | FolderNode;

export type FileExplorerProps = {
  nodes: readonly ExplorerNode[];
  ariaLabel: string;
  defaultExpandedIds?: readonly string[];
  onSelect?: (node: ExplorerNode) => void;
};
```

Why not give every node an optional `children` property?

```tsx
// Avoid this weaker model.
type Node = {
  kind: "file" | "folder";
  children?: readonly Node[];
};
```

That type allows meaningless states such as a file with children or a folder whose child contract is unclear. The union encodes the domain rule directly.

Here is the sample data used throughout the tutorial:

```tsx
const projectFiles: readonly ExplorerNode[] = [
  {
    id: "src",
    name: "src",
    kind: "folder",
    children: [
      {
        id: "src-components",
        name: "components",
        kind: "folder",
        children: [
          { id: "button-tsx", name: "Button.tsx", kind: "file" },
          { id: "modal-tsx", name: "Modal.tsx", kind: "file" },
        ],
      },
      { id: "app-tsx", name: "App.tsx", kind: "file" },
    ],
  },
  { id: "package-json", name: "package.json", kind: "file" },
  { id: "readme", name: "README.md", kind: "file" },
];
```

## Detailed state and component design

Before coding, describe the smallest architecture that satisfies the interview requirements. This demonstrates that the implementation will follow explicit ownership rules instead of accumulating state inside the recursive component.

### Separate data from interaction state

The parent owns the file-system data:

```text
nodes: readonly ExplorerNode[]
```

The explorer owns temporary UI state:

```text
expandedIds: Set<string>
selectedId: string | null
activeId: string | null
```

These values answer different questions:

| Value | Question it answers |
| --- | --- |
| `nodes` | Which files and folders exist? |
| `expandedIds` | Which folders currently reveal their children? |
| `selectedId` | Which node has been chosen? |
| `activeId` | Which visible node receives keyboard focus? |

Do not add `isExpanded`, `isSelected`, or `isFocused` to every node in the server data. Those are view-specific states, and embedding them duplicates the tree whenever another explorer needs different interaction state.

### Choose component boundaries

Use two components initially:

```text
FileExplorer
├── owns expansion, selection, and focus
├── derives visible keyboard order
└── renders root nodes
    └── TreeItem
        ├── renders one file or folder
        └── recursively renders folder children
```

`FileExplorer` coordinates the complete widget. `TreeItem` renders one recursive branch and receives behavior through props.

Avoid giving every `TreeItem` its own expansion state. Local expansion can work for a basic demo, but centralized IDs make keyboard navigation, reset behavior, persistence, and data-refresh reconciliation easier to implement.

### Define the data flow

Interaction flows upward; state flows downward:

```text
click disclosure
  → TreeItem calls onToggle(id)
  → FileExplorer creates a new expandedIds Set
  → updated state flows through the recursive tree
  → the folder's children become visible
```

Selection follows the same model:

```text
click or press Enter on a node
  → TreeItem passes the complete node to onSelect
  → FileExplorer stores its stable ID
  → optional parent callback performs application behavior
```

The explorer owns which row appears selected. The parent decides what selection means, such as opening a preview, updating a route, or displaying file metadata.

### Identify source and derived state

Store only information that cannot be calculated from current inputs:

| Store as state | Derive during render |
| --- | --- |
| Expanded IDs | Whether a particular folder is expanded |
| Selected ID | Whether a particular node is selected |
| Active ID | The ordered list of currently visible nodes |
| — | Icons and disclosure symbols |
| — | Parent and depth information used for navigation |

The flattened visible-node list is derived from `nodes` and `expandedIds`. Storing it separately would create another source of truth that must be synchronized after every expansion or data change.

### Establish invariants

State the rules the implementation must preserve:

1. Every node ID is globally unique and stable.
2. Only folder IDs may appear in `expandedIds`.
3. Collapsed descendants are not rendered or keyboard-navigable.
4. At most one node is selected.
5. Exactly one visible node has `tabIndex={0}`.
6. Focus, selection, and expansion can change independently.
7. Updating interaction state never mutates the input tree.

These invariants are also the foundation of the testing strategy.

### Choose the rendering and navigation models

Use different representations for different jobs:

- recursive rendering mirrors the nested data and produces nested tree markup;
- a flattened array of visible nodes makes Arrow Up and Arrow Down navigation straightforward.

This is not duplicated state because the flat array is recalculated from current inputs. It is a derived view of the same tree.

### Define the interview scope

Implement now:

- recursive files and folders;
- independent expansion;
- single selection;
- accessible tree semantics;
- keyboard navigation.

Discuss but postpone:

- lazy loading;
- rename, create, move, and delete;
- server persistence and optimistic updates;
- drag-and-drop;
- virtualization;
- multi-selection.

This ordering keeps the first implementation achievable while leaving clear extension points for senior follow-up questions.

## Step 1 — Render one node

Start without recursion or state. Render the two possible node types.

```tsx
type ExplorerRowProps = {
  node: ExplorerNode;
};

function ExplorerRow({ node }: ExplorerRowProps) {
  const icon = node.kind === "folder" ? "📁" : "📄";

  return (
    <div>
      <span aria-hidden="true">{icon}</span>
      <span>{node.name}</span>
    </div>
  );
}
```

The `kind` check narrows `node` to `FolderNode` or `FileNode`. This is the base case of the eventual recursion: every call can always render its current node.

## Step 2 — Render nested nodes recursively

A folder contains the same data type as the root: an array of explorer nodes. That recursive data shape suggests a recursive component.

```tsx
type TreeNodeProps = {
  node: ExplorerNode;
};

function TreeNode({ node }: TreeNodeProps) {
  return (
    <li>
      <ExplorerRow node={node} />

      {node.kind === "folder" && (
        <ul>
          {node.children.map(child => (
            <TreeNode key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function BasicFileExplorer({
  nodes,
}: Pick<FileExplorerProps, "nodes">) {
  return (
    <ul>
      {nodes.map(node => (
        <TreeNode key={node.id} node={node} />
      ))}
    </ul>
  );
}
```

Every recursive algorithm needs:

- a unit of work: render the current node;
- a recursive case: a folder renders its children;
- a stopping condition: a file has no children.

Use `node.id`, not the array index, as the key. Expanding, sorting, inserting, or moving nodes should not transfer component identity to another item.

## Step 3 — Add independent folder expansion

Store expanded folder IDs in a `Set`:

```tsx
const [expandedIds, setExpandedIds] = useState<Set<string>>(
  () => new Set(defaultExpandedIds),
);
```

A set expresses the question directly: “Is this folder ID expanded?” It also lets many folders remain open independently.

Toggle a folder immutably:

```tsx
function toggleFolder(id: string) {
  setExpandedIds(current => {
    const next = new Set(current);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    return next;
  });
}
```

Do not mutate the current set and return it:

```tsx
// Incorrect: the state reference does not change.
expandedIds.add(id);
setExpandedIds(expandedIds);
```

Pass the expansion state and callback through the recursive calls:

```tsx
type ExpandableTreeNodeProps = {
  node: ExplorerNode;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
};

function ExpandableTreeNode({
  node,
  expandedIds,
  onToggle,
}: ExpandableTreeNodeProps) {
  const isFolder = node.kind === "folder";
  const isExpanded = isFolder && expandedIds.has(node.id);

  return (
    <li>
      <div>
        {isFolder ? (
          <button
            type="button"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
            onClick={() => onToggle(node.id)}
          >
            <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
          </button>
        ) : (
          <span aria-hidden="true">•</span>
        )}

        <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>
        <span>{node.name}</span>
      </div>

      {isExpanded && (
        <ul>
          {node.children.map(child => (
            <ExpandableTreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
```

## First working implementation

Assemble recursion and expansion before adding more requirements:

```tsx
import { useState } from "react";

export type FileNode = {
  id: string;
  name: string;
  kind: "file";
};

export type FolderNode = {
  id: string;
  name: string;
  kind: "folder";
  children: readonly ExplorerNode[];
};

export type ExplorerNode = FileNode | FolderNode;

type FileExplorerProps = {
  nodes: readonly ExplorerNode[];
  defaultExpandedIds?: readonly string[];
};

type TreeNodeProps = {
  node: ExplorerNode;
  expandedIds: ReadonlySet<string>;
  onToggle: (id: string) => void;
};

function TreeNode({ node, expandedIds, onToggle }: TreeNodeProps) {
  const isFolder = node.kind === "folder";
  const isExpanded = isFolder && expandedIds.has(node.id);

  return (
    <li>
      <div>
        {isFolder && (
          <button
            type="button"
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
            onClick={() => onToggle(node.id)}
          >
            <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
          </button>
        )}

        <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>{" "}
        {node.name}
      </div>

      {isExpanded && (
        <ul>
          {node.children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileExplorer({
  nodes,
  defaultExpandedIds = [],
}: FileExplorerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );

  function toggleFolder(id: string) {
    setExpandedIds(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <ul>
      {nodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          expandedIds={expandedIds}
          onToggle={toggleFolder}
        />
      ))}
    </ul>
  );
}
```

This is a valid core interview solution. It demonstrates recursive rendering, immutable state updates, and stable keys.

Before continuing, explain its limitations:

- rows cannot be selected;
- the nested lists do not yet expose tree semantics;
- keyboard users must Tab through every disclosure button;
- arrow keys do not navigate the visible tree;
- it assumes all folder children are already loaded.

## Step 4 — Add item selection

Selection and expansion are different state dimensions. A folder can be selected without changing whether it is open.

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null);

function selectNode(node: ExplorerNode) {
  setSelectedId(node.id);
  onSelect?.(node);
}
```

Render each label as a button for the intermediate implementation:

```tsx
<button
  type="button"
  aria-pressed={selectedId === node.id}
  onClick={() => onSelect(node)}
>
  <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>
  {node.name}
</button>
```

This is keyboard-operable through native buttons and is often enough if the interviewer asks for a simple nested explorer rather than the ARIA tree pattern.

Do not store the complete selected node object unless the selection is intentionally a snapshot. The node may be replaced when data refreshes; its stable ID is the durable UI state.

## Step 5 — Add accessible tree semantics

If the requirement is an actual tree widget, use the expected roles:

```text
tree
└── treeitem
    └── group
        ├── treeitem
        └── treeitem
```

The root receives `role="tree"`. Every visible node receives `role="treeitem"`. A folder's nested collection receives `role="group"`.

```tsx
<ul role="tree" aria-label={ariaLabel}>
  {/* root treeitems */}
</ul>

<li
  role="treeitem"
  aria-expanded={isFolder ? isExpanded : undefined}
  aria-selected={isSelected}
>
  {/* node row */}
  {isExpanded && <ul role="group">{/* children */}</ul>}
</li>
```

Only folders receive `aria-expanded`. Files are leaves, so applying `aria-expanded="false"` to them would incorrectly announce that they can expand.

A composite tree normally has one Tab stop. Arrow keys move focus within it. That requires a roving `tabIndex`:

```tsx
tabIndex={node.id === activeId ? 0 : -1}
```

Selection and focus may follow each other, but they are still different concepts:

- `activeId` identifies the current keyboard focus target;
- `selectedId` identifies the chosen file or folder.

## Step 6 — Flatten only the visible nodes

Recursive rendering is natural for markup. Keyboard navigation is easier with a flat array representing the current visual order.

```tsx
type VisibleNode = {
  node: ExplorerNode;
  parentId: string | null;
  depth: number;
};

function flattenVisibleNodes(
  nodes: readonly ExplorerNode[],
  expandedIds: ReadonlySet<string>,
  parentId: string | null = null,
  depth = 1,
): VisibleNode[] {
  const result: VisibleNode[] = [];

  for (const node of nodes) {
    result.push({ node, parentId, depth });

    if (node.kind === "folder" && expandedIds.has(node.id)) {
      result.push(
        ...flattenVisibleNodes(
          node.children,
          expandedIds,
          node.id,
          depth + 1,
        ),
      );
    }
  }

  return result;
}
```

This is derived data. Calculate it from `nodes` and `expandedIds`; do not copy it into state and synchronize it with an Effect.

For this interview-sized tree, recalculating it is simple. For a measured large-tree bottleneck, memoization or a normalized data model may become appropriate.

## Step 7 — Add keyboard navigation

Implement the standard interactions one at a time:

| Key | Behavior |
| --- | --- |
| Arrow Down | Focus the next visible node |
| Arrow Up | Focus the previous visible node |
| Arrow Right | Expand a closed folder; otherwise focus its first child |
| Arrow Left | Collapse an open folder; otherwise focus its parent |
| Home | Focus the first visible node |
| End | Focus the last visible node |
| Enter | Select the focused node |
| Space | Select the focused node |

Keep DOM refs in a map so focus can follow `activeId` immediately:

```tsx
const itemRefs = useRef(new Map<string, HTMLLIElement>());

function moveFocus(id: string) {
  setActiveId(id);
  itemRefs.current.get(id)?.focus();
}
```

The keyboard handler uses the flattened visible array:

```tsx
function handleKeyDown(event: KeyboardEvent<HTMLLIElement>, node: ExplorerNode) {
  const index = visibleNodes.findIndex(item => item.node.id === node.id);
  const current = visibleNodes[index];

  switch (event.key) {
    case "ArrowDown": {
      const next = visibleNodes[index + 1];
      if (next) moveFocus(next.node.id);
      break;
    }

    case "ArrowUp": {
      const previous = visibleNodes[index - 1];
      if (previous) moveFocus(previous.node.id);
      break;
    }

    case "ArrowRight":
      if (node.kind === "folder") {
        if (!expandedIds.has(node.id)) {
          toggleFolder(node.id);
        } else if (node.children[0]) {
          moveFocus(node.children[0].id);
        }
      }
      break;

    case "ArrowLeft":
      if (node.kind === "folder" && expandedIds.has(node.id)) {
        toggleFolder(node.id);
      } else if (current.parentId) {
        moveFocus(current.parentId);
      }
      break;

    case "Home":
      if (visibleNodes[0]) moveFocus(visibleNodes[0].node.id);
      break;

    case "End": {
      const last = visibleNodes.at(-1);
      if (last) moveFocus(last.node.id);
      break;
    }

    case "Enter":
    case " ":
      selectNode(node);
      break;

    default:
      return;
  }

  event.preventDefault();
  event.stopPropagation();
}
```

Prevent default only for keys the widget handles. Otherwise typing, scrolling, and browser shortcuts can be broken unnecessarily.

## Complete solution

The complete version keeps recursive markup while using a flattened visible-node model for keyboard movement.

```tsx
import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";

export type FileNode = {
  id: string;
  name: string;
  kind: "file";
};

export type FolderNode = {
  id: string;
  name: string;
  kind: "folder";
  children: readonly ExplorerNode[];
};

export type ExplorerNode = FileNode | FolderNode;

type FileExplorerProps = {
  nodes: readonly ExplorerNode[];
  ariaLabel: string;
  defaultExpandedIds?: readonly string[];
  onSelect?: (node: ExplorerNode) => void;
};

type VisibleNode = {
  node: ExplorerNode;
  parentId: string | null;
};

function flattenVisibleNodes(
  nodes: readonly ExplorerNode[],
  expandedIds: ReadonlySet<string>,
  parentId: string | null = null,
): VisibleNode[] {
  const result: VisibleNode[] = [];

  for (const node of nodes) {
    result.push({ node, parentId });

    if (node.kind === "folder" && expandedIds.has(node.id)) {
      result.push(
        ...flattenVisibleNodes(node.children, expandedIds, node.id),
      );
    }
  }

  return result;
}

type TreeItemProps = {
  node: ExplorerNode;
  expandedIds: ReadonlySet<string>;
  activeId: string | null;
  selectedId: string | null;
  itemRefs: MutableRefObject<Map<string, HTMLLIElement>>;
  onFocusItem: (id: string) => void;
  onSelect: (node: ExplorerNode) => void;
  onToggle: (id: string) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLLIElement>,
    node: ExplorerNode,
  ) => void;
};

function TreeItem({
  node,
  expandedIds,
  activeId,
  selectedId,
  itemRefs,
  onFocusItem,
  onSelect,
  onToggle,
  onKeyDown,
}: TreeItemProps) {
  const isFolder = node.kind === "folder";
  const isExpanded = isFolder && expandedIds.has(node.id);

  return (
    <li
      ref={element => {
        if (element) itemRefs.current.set(node.id, element);
        else itemRefs.current.delete(node.id);
      }}
      role="treeitem"
      aria-expanded={isFolder ? isExpanded : undefined}
      aria-selected={selectedId === node.id}
      tabIndex={activeId === node.id ? 0 : -1}
      onClick={event => {
        event.stopPropagation();
        onFocusItem(node.id);
        onSelect(node);
      }}
      onFocus={() => onFocusItem(node.id)}
      onKeyDown={event => onKeyDown(event, node)}
    >
      <div className="tree-row">
        {isFolder ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${node.name}`}
            onClick={event => {
              event.stopPropagation();
              onToggle(node.id);
            }}
          >
            <span aria-hidden="true">{isExpanded ? "▾" : "▸"}</span>
          </button>
        ) : (
          <span className="tree-spacer" aria-hidden="true" />
        )}

        <span aria-hidden="true">{isFolder ? "📁" : "📄"}</span>
        <span>{node.name}</span>
      </div>

      {isExpanded && (
        <ul role="group">
          {node.children.map(child => (
            <TreeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              activeId={activeId}
              selectedId={selectedId}
              itemRefs={itemRefs}
              onFocusItem={onFocusItem}
              onSelect={onSelect}
              onToggle={onToggle}
              onKeyDown={onKeyDown}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FileExplorer({
  nodes,
  ariaLabel,
  defaultExpandedIds = [],
  onSelect,
}: FileExplorerProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandedIds),
  );
  const [activeId, setActiveId] = useState<string | null>(
    () => nodes[0]?.id ?? null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const visibleNodes = useMemo(
    () => flattenVisibleNodes(nodes, expandedIds),
    [nodes, expandedIds],
  );

  function toggleFolder(id: string) {
    setExpandedIds(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function moveFocus(id: string) {
    setActiveId(id);
    itemRefs.current.get(id)?.focus();
  }

  function selectNode(node: ExplorerNode) {
    setSelectedId(node.id);
    onSelect?.(node);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLLIElement>,
    node: ExplorerNode,
  ) {
    const index = visibleNodes.findIndex(item => item.node.id === node.id);
    if (index < 0) return;

    const current = visibleNodes[index];
    let handled = true;

    switch (event.key) {
      case "ArrowDown": {
        const next = visibleNodes[index + 1];
        if (next) moveFocus(next.node.id);
        break;
      }
      case "ArrowUp": {
        const previous = visibleNodes[index - 1];
        if (previous) moveFocus(previous.node.id);
        break;
      }
      case "ArrowRight":
        if (node.kind === "folder") {
          if (!expandedIds.has(node.id)) toggleFolder(node.id);
          else if (node.children[0]) moveFocus(node.children[0].id);
        }
        break;
      case "ArrowLeft":
        if (node.kind === "folder" && expandedIds.has(node.id)) {
          toggleFolder(node.id);
        } else if (current.parentId) {
          moveFocus(current.parentId);
        }
        break;
      case "Home":
        if (visibleNodes[0]) moveFocus(visibleNodes[0].node.id);
        break;
      case "End": {
        const last = visibleNodes.at(-1);
        if (last) moveFocus(last.node.id);
        break;
      }
      case "Enter":
      case " ":
        selectNode(node);
        break;
      default:
        handled = false;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  if (nodes.length === 0) {
    return <p>No files or folders.</p>;
  }

  return (
    <ul role="tree" aria-label={ariaLabel}>
      {nodes.map(node => (
        <TreeItem
          key={node.id}
          node={node}
          expandedIds={expandedIds}
          activeId={activeId}
          selectedId={selectedId}
          itemRefs={itemRefs}
          onFocusItem={setActiveId}
          onSelect={selectNode}
          onToggle={toggleFolder}
          onKeyDown={handleKeyDown}
        />
      ))}
    </ul>
  );
}
```

## Example usage

```tsx
export function ProjectPanel() {
  function openNode(node: ExplorerNode) {
    console.log("Selected:", node.id);
  }

  return (
    <FileExplorer
      nodes={projectFiles}
      ariaLabel="Project files"
      defaultExpandedIds={["src"]}
      onSelect={openNode}
    />
  );
}
```

The component owns interaction state. The parent owns the data and decides what selection means—for example, opening a file preview or updating a route.

## Minimal CSS

```css
[role="tree"],
[role="group"] {
  margin: 0;
  padding: 0;
  list-style: none;
}

[role="group"] {
  padding-inline-start: 1.25rem;
}

[role="treeitem"] {
  outline: none;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
  cursor: default;
}

[role="treeitem"][aria-selected="true"] > .tree-row {
  background: #dbeafe;
}

[role="treeitem"]:focus > .tree-row {
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.tree-row > button {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  padding: 0;
  border: 0;
  background: transparent;
  place-items: center;
}

.tree-spacer {
  width: 1.5rem;
}
```

Do not remove the focus indicator. Focus and selection can point to different nodes, so both states need visible styling.

## Complexity

Let `v` be the number of currently visible nodes and `d` the maximum depth.

- Initial recursive render: `O(v)` time and `O(d)` call stack.
- Flattening visible nodes: `O(v)` time and `O(v)` output space.
- Expansion lookup: approximately `O(1)` with a set.
- Arrow navigation: `O(v)` in this version because `findIndex` searches the visible list.

For an interview-sized tree, clarity is more important than replacing `findIndex` with another index map. For a very large tree, maintain an ID-to-visible-index map and consider virtualization.

## Testing strategy

Test behavior through roles, accessible names, and keyboard input.

### Recursive rendering

- Root nodes are visible.
- Children of collapsed folders are absent.
- Expanding a folder reveals only its children.
- Nested folders can expand independently.

### Selection

- Clicking a row marks it selected.
- Selecting another row clears the previous selection.
- `onSelect` receives the correct node.
- Expansion does not accidentally change selection.

### Keyboard navigation

- Arrow Down and Arrow Up move through visible nodes.
- Arrow Right expands a folder, then enters its first child.
- Arrow Left collapses a folder, then moves to its parent.
- Home and End reach the first and last visible nodes.
- Enter and Space select the focused node.
- Collapsed descendants are skipped.

### Accessibility

- The root has a useful accessible name.
- Folders expose their expansion state.
- Files do not expose `aria-expanded`.
- Exactly one visible tree item participates in the Tab order.
- Focus remains visibly distinguishable from selection.

## Common interview traps

- Storing one global `isExpanded` boolean for the entire tree.
- Using array indexes as keys.
- Mutating the `Set` stored in state.
- Copying the flattened visible tree into state.
- Treating files as expandable nodes.
- Making every tree item a Tab stop.
- Moving focus into a collapsed descendant.
- Mixing selection, expansion, and focus into one state variable.
- Adding lazy loading, editing, drag-and-drop, and virtualization before the basic recursion works.

## Senior follow-up discussion

### How would you lazy-load folder children?

Represent folder loading explicitly rather than overloading an empty array:

```tsx
type AsyncFolderNode = {
  id: string;
  name: string;
  kind: "folder";
  children:
    | { status: "unloaded" }
    | { status: "loading" }
    | { status: "loaded"; nodes: readonly AsyncExplorerNode[] }
    | { status: "error"; message: string };
};
```

Load on first expansion, deduplicate requests by folder ID, retain loaded children when the folder collapses, and expose loading and retry states inside that folder.

### How would you support rename or move?

For small trees, a recursive immutable update is reasonable. For frequent editing of large trees, normalize the model:

```ts
type NormalizedTree = {
  nodesById: Record<string, ExplorerNode>;
  childIdsByFolderId: Record<string, readonly string[]>;
  rootIds: readonly string[];
};
```

Before moving a folder, reject its own ID and every descendant ID as a destination. The server must enforce the same invariant.

### How would you preserve state after data refresh?

Keep expansion and selection keyed by stable IDs. After new data arrives, remove IDs that no longer exist and choose a valid focus target if the active node disappeared.

### When would you virtualize the tree?

When profiling shows that the visible DOM or flattening work is too large. Virtualize the flattened visible list, but plan focus retention, variable row heights, scrolling, and screen-reader behavior before adopting it.

## Interview-ready explanation

I model files and folders as a discriminated recursive union and render them with a recursive component. Expansion is a set of stable folder IDs, while selection and keyboard focus are separate state. I first ship recursive rendering and independent expansion. For an accessible tree, I add tree, treeitem, and group semantics, use a roving Tab stop, and flatten only the visible nodes for arrow-key navigation. For larger or editable trees, I would consider normalized data, lazy child loading, and virtualization only when their additional complexity is justified.

## Final checklist

- [ ] Node IDs are stable and unique.
- [ ] Files and folders have an explicit type distinction.
- [ ] Recursive rendering has a clear stopping condition.
- [ ] Expanded folders are tracked independently and immutably.
- [ ] Selection, expansion, and focus are separate concepts.
- [ ] Only folders expose expansion state.
- [ ] Keyboard navigation follows visible tree order.
- [ ] The first working version is complete before extensions begin.
- [ ] Empty and async folder states are modeled explicitly when required.
- [ ] Tests assert behavior through accessible semantics.
