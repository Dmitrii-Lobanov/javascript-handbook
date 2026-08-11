# React Live Coding — Explanatory Article Roadmap

## Purpose

This collection explains how to approach and solve common React live-coding tasks in senior frontend interviews.

The goal is not to provide code to memorize. Each article should demonstrate how a senior candidate:

- clarifies ambiguous requirements;
- identifies the smallest useful first version;
- models state before writing JSX;
- chooses component and Hook boundaries;
- handles accessibility and keyboard behavior;
- accounts for asynchronous failure and race conditions;
- explains tradeoffs while working under time pressure;
- tests the behavior that matters;
- identifies what should be production-hardened after the interview.

## Recommended article format

Every task should follow the same structure:

1. The interview prompt
2. What the interviewer is evaluating
3. Clarifying questions to ask
4. Requirements and deliberate non-requirements
5. State model and invariants
6. Component and Hook design
7. Minimum viable implementation
8. Step-by-step React solution
9. Accessibility and keyboard behavior
10. Async, performance, and edge cases
11. Testing strategy
12. Common candidate mistakes
13. Senior-level improvements
14. A 60-second solution explanation
15. Likely interview follow-ups

## The 10-task collection

### 1. Build an accessible autocomplete

**Suggested slug:** `accessible-autocomplete`

**Interview prompt:** Build a search input that displays matching suggestions and lets the user select one.

**Why it belongs:** Autocomplete combines controlled inputs, derived state, asynchronous work, race conditions, keyboard interaction, and reusable component design. It is one of the strongest all-around frontend interview tasks.

**Core version:**

- Render suggestions for the current query.
- Support loading, empty, and error states.
- Select a suggestion with the pointer.
- Close the list when appropriate.

**Senior-level extensions:**

- Debounce requests without making the input lag.
- Prevent an older response from replacing a newer result.
- Support Arrow Up, Arrow Down, Enter, Escape, and active-option scrolling.
- Apply correct combobox semantics and accessible announcements.
- Add caching, request deduplication, and result highlighting.
- Explain whether filtering belongs on the client or server.

**Primary concepts:** controlled state, Effects, cancellation, refs, accessibility, derived data, API design.

---

### 2. Build a sortable and filterable data table

**Suggested slug:** `data-table`

**Interview prompt:** Display tabular data with sorting, filtering, row selection, and pagination.

**Why it belongs:** A table exposes state modeling, derived data, component API design, performance, semantics, and product tradeoffs. It can begin simply and expand naturally during follow-up discussion.

**Core version:**

- Render rows and column headings.
- Sort by a selected column.
- Filter by a text query.
- Show an empty state.

**Senior-level extensions:**

- Support controlled and uncontrolled sorting.
- Separate column definitions from rendered data.
- Add multi-row selection with a correct indeterminate header checkbox.
- Preserve sorting and filters in the URL.
- Compare client and server pagination.
- Handle thousands of rows through pagination or virtualization.
- Preserve table semantics and keyboard usability.

**Primary concepts:** derived state, stable identity, composition, memoization, URL state, accessibility.

---

### 3. Build an accessible modal dialog

**Suggested slug:** `accessible-modal-dialog`

**Interview prompt:** Build a reusable modal with an overlay, close behavior, and arbitrary content.

**Why it belongs:** The visual result is simple, but a correct dialog reveals whether a candidate understands portals, focus, event propagation, cleanup, scroll locking, and accessible component APIs.

**Core version:**

- Open and close the dialog.
- Render a title and arbitrary body content.
- Close through an explicit button and Escape.
- Render above the rest of the page.

**Senior-level extensions:**

- Move focus into the dialog and restore it on close.
- Keep keyboard focus inside while open.
- Make the background inert.
- Use a portal without breaking React event behavior.
- Prevent accidental closure from events inside the dialog.
- Handle nested dialogs and body scroll locking.
- Compare a custom implementation with the native `dialog` element.

**Primary concepts:** portals, refs, Effects, event propagation, focus management, reusable APIs.

---

### 4. Build a reusable tabs component

**Suggested slug:** `reusable-tabs`

**Interview prompt:** Build tabs that switch between panels and can be reused with different content.

**Why it belongs:** Tabs look elementary but test state ownership, composition, keys, semantic relationships, keyboard navigation, and controlled versus uncontrolled component design.

**Core version:**

- Render a list of tabs and corresponding panels.
- Activate a tab with a pointer.
- Choose an initial tab.

**Senior-level extensions:**

- Support Arrow keys, Home, End, and focus movement.
- Implement manual and automatic activation modes.
- Connect tabs and panels with stable IDs.
- Design a compound-component API.
- Support controlled and uncontrolled selection.
- Decide whether inactive panels remain mounted.
- Preserve selection through dynamic tab insertion and removal.

**Primary concepts:** composition, Context, controlled state, identity, `useId`, accessibility.

---

### 5. Build an infinite scrolling feed

**Suggested slug:** `infinite-scrolling-feed`

**Interview prompt:** Load and append another page of items as the user approaches the end of a feed.

**Why it belongs:** Infinite scrolling tests asynchronous state, pagination contracts, deduplication, observers, failure recovery, and the boundary between frontend behavior and API design.

**Core version:**

- Load the first page.
- Load more items near the end of the list.
- Show pending, exhausted, and error states.
- Prevent duplicate requests.

**Senior-level extensions:**

- Use cursor-based rather than offset pagination.
- Avoid duplicate or missing items when data changes.
- Cancel obsolete requests on query changes.
- Restore scroll position after navigation.
- Virtualize a long feed.
- Provide a keyboard-accessible “Load more” fallback.
- Discuss SEO and cases where pagination is preferable.

**Primary concepts:** async state machines, Intersection Observer, pagination, deduplication, cleanup, accessibility.

---

### 6. Build a file explorer tree

**Suggested slug:** `file-explorer-tree`

**Interview prompt:** Render nested folders and files, allowing folders to expand and collapse.

**Why it belongs:** A file explorer tests recursive rendering, tree data modeling, stable identity, immutable updates, focus navigation, and scalability.

**Core version:**

- Render nested files and folders.
- Expand and collapse folders.
- Preserve independent expansion state.
- Select an item.

**Senior-level extensions:**

- Support keyboard tree navigation.
- Lazy-load folder children.
- Add rename, create, move, and delete operations.
- Prevent invalid moves such as placing a folder inside itself.
- Preserve state when the tree data refreshes.
- Compare recursive components with flattened visible-node models.
- Virtualize a very large tree.

**Primary concepts:** recursion, normalized state, immutable updates, keys, async loading, tree accessibility.

---

### 7. Build a toast notification system

**Suggested slug:** `toast-notification-system`

**Interview prompt:** Build an API that allows any component to show temporary notifications.

**Why it belongs:** Toasts test system-level component design, shared state, timers, queues, portals, cleanup, animations, and accessibility.

**Core version:**

- Add and dismiss notifications.
- Automatically dismiss after a delay.
- Render multiple notifications in order.
- Support success and error variants.

**Senior-level extensions:**

- Pause dismissal while hovered or focused.
- Prevent stale timer and unmount bugs.
- Limit visible notifications and queue the remainder.
- Deduplicate related messages.
- Design a provider, Hook, and imperative API.
- Handle exit animations before removal.
- Announce important updates without overwhelming screen-reader users.

**Primary concepts:** Context, reducers, timers, portals, cleanup, queues, live regions.

---

### 8. Build a multi-step form

**Suggested slug:** `multi-step-form`

**Interview prompt:** Build a multi-step account or checkout form with validation and final submission.

**Why it belongs:** Forms reveal whether a candidate can model complex state, validation, navigation, server errors, accessibility, and incomplete workflows without creating contradictory state.

**Core version:**

- Move forward and backward through steps.
- Preserve entered values.
- Validate required fields.
- Submit the completed form.

**Senior-level extensions:**

- Separate field, touched, validation, and submission state.
- Support async validation without races.
- Restore drafts after reload.
- Prevent accidental duplicate submission.
- Focus and announce the first validation error.
- Model conditional and skipped steps.
- Compare controlled inputs, uncontrolled inputs, and form libraries.

**Primary concepts:** reducers, state machines, validation, async errors, forms, accessibility.

---

### 9. Build a drag-and-drop reorderable list

**Suggested slug:** `reorderable-list`

**Interview prompt:** Let users reorder a list of items and persist the new order.

**Why it belongs:** Reordering tests identity, immutable updates, optimistic state, pointer interaction, accessibility, and the difference between visual position and data position.

**Core version:**

- Reorder items through drag and drop.
- Preserve stable item identity.
- Display the updated order immediately.
- Save the new order.

**Senior-level extensions:**

- Add keyboard reordering controls.
- Announce movements to assistive technology.
- Roll back an optimistic move after server failure.
- Handle concurrent updates from another client.
- Avoid index-based keys.
- Support touch and pointer cancellation.
- Compare native drag-and-drop with pointer-based libraries.

**Primary concepts:** keys, immutable list operations, optimistic updates, pointer events, accessibility.

---

### 10. Build an asynchronous resource explorer

**Suggested slug:** `async-resource-explorer`

**Interview prompt:** Fetch a collection from an API and provide search, filters, details, retry behavior, and navigation between results.

**Why it belongs:** “Fetch and display data” is common, but the senior version evaluates how the candidate models server state, avoids races and waterfalls, represents all UI states, and separates reusable data behavior from presentation.

**Core version:**

- Fetch and render a collection.
- Display loading, empty, success, and error states.
- Filter the collection.
- Select an item and show details.

**Senior-level extensions:**

- Prevent stale responses after filter changes.
- Cache previously loaded results.
- Prefetch likely detail views.
- Add retry and cancellation policies.
- Keep meaningful state in the URL.
- Avoid collection-to-detail request waterfalls.
- Compare an Effect-based solution with a router or server-state library.

**Primary concepts:** data fetching, server state, cancellation, caching, URL state, Suspense boundaries.

## Recommended publication order

1. Accessible autocomplete
2. Data table
3. Modal dialog
4. Tabs
5. Infinite scrolling feed
6. File explorer tree
7. Toast notification system
8. Multi-step form
9. Reorderable list
10. Asynchronous resource explorer

The first four establish the article format across async behavior, data-heavy UI, focus management, and reusable component APIs. The later articles introduce progressively broader state and architecture concerns.

## Editorial constraint

Each article should present a realistic interview-sized implementation first. Production hardening belongs in a clearly separated follow-up section so readers learn how to finish within 45–60 minutes without mistaking the interview solution for a complete production component.
