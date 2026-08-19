# Reusable Tabs

## The interview prompt

Build a reusable tabs component that receives arbitrary tab data, displays one panel at a time, and supports mouse and keyboard interaction.

Assume a 30–40 minute live-coding interview. Prioritize a clear data model, correct selection behavior, basic accessibility, and code you can explain while writing it.

## What the interviewer is evaluating

- Can you turn data into reusable UI instead of hard-coding tabs?
- Can you keep one source of truth for selection?
- Do you understand derived state?
- Can you add keyboard behavior without overengineering it?
- Do you know the essential tabs ARIA relationships?
- Can you explain what you would improve in production?

The interview solution does not need to be a complete design-system primitive.

## Clarifying questions

Ask a few questions before coding:

1. Is selection controlled by the parent?
2. Should disabled tabs be supported?
3. Should Left and Right Arrow navigate between tabs?
4. Should navigation wrap at the ends?
5. Should inactive panels preserve their local state?
6. Are vertical tabs or route-synchronized tabs required?

For this walkthrough:

- the parent controls the selected tab;
- tabs are provided as data;
- disabled tabs are supported;
- Left/Right Arrow, Home, and End navigate enabled tabs;
- moving focus also selects the tab;
- only the selected panel is rendered;
- vertical orientation and state-preserving panels are follow-up improvements.

## Keep the scope interview-sized

### Implement now

- Generic tab data and prop types
- Controlled selection
- Click interaction
- Tab and panel semantics
- Stable IDs
- Arrow, Home, and End navigation
- Disabled-tab handling
- Empty-state handling

### Discuss afterward

- Controlled and uncontrolled modes in one API
- Compound components and Context
- Vertical tabs
- Manual activation with Enter/Space
- Preserving every panel’s local state
- Dynamic insertion and removal
- URL synchronization
- Animated indicators
- RTL navigation

This distinction is important in a live interview: finish the required behavior first, then show senior judgment by identifying production concerns.

## Step 1 — Define the data and props

Start with the public contract so the component is not tied to one content type:

```tsx
import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
};
```

Why this shape works:

- `id` is the stable logical identity and selected value;
- `label` accepts text, an icon, or a badge;
- `content` accepts any React content;
- `disabled` is optional;
- `value` and `onValueChange` make selection controlled;
- `ariaLabel` gives the tab list an accessible name.

Do not store the selected tab object or index as additional state. Both are derived from `value` and `items`.

## Step 2 — Render selectable tabs

Find the selected item during render:

```tsx
const selectedItem = items.find(item => item.id === value);
```

Render the triggers from data:

```tsx
<div role="tablist" aria-label={ariaLabel}>
  {items.map(item => {
    const selected = item.id === value;

    return (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={selected}
        disabled={item.disabled}
        onClick={() => onValueChange(item.id)}
      >
        {item.label}
      </button>
    );
  })}
</div>
```

The parent remains the source of truth. Clicking requests a value change; the component does not copy the prop into local state.

## First working implementation

At this point, assemble the types and rendering logic into a complete clickable version:

```tsx
import type { ReactNode } from "react";

export type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
};

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel,
}: TabsProps) {
  const selectedItem = items.find(item => item.id === value);

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={ariaLabel}>
        {items.map(item => {
          const selected = item.id === value;

          return (
            <button
              key={item.id}
              className="tabs__tab"
              type="button"
              role="tab"
              aria-selected={selected}
              disabled={item.disabled}
              onClick={() => onValueChange(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {selectedItem ? (
        <div className="tabs__panel" role="tabpanel">
          {selectedItem.content}
        </div>
      ) : (
        <p role="status">No tab is selected.</p>
      )}
    </div>
  );
}
```

This is a valid first checkpoint:

- it works with arbitrary data and content;
- selection has one owner;
- clicking and native button activation work;
- disabled tabs cannot be selected;
- an invalid value has an explicit fallback.

It is not finished yet. Every button remains in the normal Tab order, and the tabs and panel do not have explicit ID relationships. Say that aloud, then improve this working version rather than trying to write the final component in one pass.

## Step 3 — Connect the selected tab and panel

Use `useId` to create a stable prefix, then derive matching IDs from each item ID:

```tsx
const instanceId = useId();

function getTabId(instanceId: string, itemId: string) {
  return `${instanceId}-tab-${encodeURIComponent(itemId)}`;
}

function getPanelId(instanceId: string, itemId: string) {
  return `${instanceId}-panel-${encodeURIComponent(itemId)}`;
}
```

Each tab controls its matching panel:

```tsx
<button
  id={getTabId(instanceId, item.id)}
  aria-controls={getPanelId(instanceId, item.id)}
  // ...
>
```

Render the selected panel and point it back to the selected tab:

```tsx
{selectedItem && (
  <div
    key={selectedItem.id}
    role="tabpanel"
    id={getPanelId(instanceId, selectedItem.id)}
    aria-labelledby={getTabId(instanceId, selectedItem.id)}
    tabIndex={0}
  >
    {selectedItem.content}
  </div>
)}
```

`useId` is stable across renders and safe for server rendering. Do not generate IDs with `Math.random()` during render.

This version renders only the selected panel. The `key` deliberately gives each panel distinct identity, so panel-local state resets after switching away. If state must survive, render all panels and hide inactive ones instead.

## Step 4 — Add keyboard navigation

Tabs are a composite widget, so only the selected tab should be in the normal Tab order. Add roving `tabIndex` while implementing arrow navigation:

```tsx
tabIndex={selected ? 0 : -1}
```

Expected horizontal-tab behavior:

| Key | Result |
| --- | --- |
| Right Arrow | Select the next enabled tab |
| Left Arrow | Select the previous enabled tab |
| Home | Select the first enabled tab |
| End | Select the last enabled tab |
| Tab | Enter or leave the tab widget |

Create the enabled list and calculate the destination:

```tsx
function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
  const enabledItems = items.filter(item => !item.disabled);
  const currentIndex = enabledItems.findIndex(item => item.id === value);

  if (currentIndex === -1 || enabledItems.length === 0) return;

  let nextIndex: number | null = null;

  if (event.key === "ArrowRight") {
    nextIndex = (currentIndex + 1) % enabledItems.length;
  }

  if (event.key === "ArrowLeft") {
    nextIndex =
      (currentIndex - 1 + enabledItems.length) % enabledItems.length;
  }

  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = enabledItems.length - 1;

  if (nextIndex === null) return;

  event.preventDefault();
  const nextItem = enabledItems[nextIndex];
  onValueChange(nextItem.id);
  tabRefs.current.get(nextItem.id)?.focus();
}
```

Store button elements in a ref map so keyboard navigation can focus its destination:

```tsx
const tabRefs = useRef(new Map<string, HTMLButtonElement>());
```

The destination button already exists, so focus can move during the keyboard interaction. Do not focus from an Effect on every controlled value change; that could steal focus on initial mount or when routing changes the selection externally.

Attach each button to the map:

```tsx
ref={node => {
  if (node) tabRefs.current.set(item.id, node);
  else tabRefs.current.delete(item.id);
}}
```

In an interview, explain that automatic activation is suitable when panels switch immediately. If selection triggers slow requests, manual activation—move focus with arrows, select with Enter or Space—may be preferable.

## Complete solution

```tsx
"use client";

import { useId, useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export type TabItem = {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
};

function getTabId(instanceId: string, itemId: string) {
  return `${instanceId}-tab-${encodeURIComponent(itemId)}`;
}

function getPanelId(instanceId: string, itemId: string) {
  return `${instanceId}-panel-${encodeURIComponent(itemId)}`;
}

export function Tabs({
  items,
  value,
  onValueChange,
  ariaLabel,
}: TabsProps) {
  const instanceId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const selectedItem = items.find(item => item.id === value);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const enabledItems = items.filter(item => !item.disabled);
    const currentIndex = enabledItems.findIndex(item => item.id === value);

    if (currentIndex === -1 || enabledItems.length === 0) return;

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % enabledItems.length;
    }

    if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + enabledItems.length) % enabledItems.length;
    }

    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = enabledItems.length - 1;

    if (nextIndex === null) return;

    event.preventDefault();
    const nextItem = enabledItems[nextIndex];
    onValueChange(nextItem.id);
    tabRefs.current.get(nextItem.id)?.focus();
  }

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={ariaLabel}>
        {items.map(item => {
          const selected = item.id === value;

          return (
            <button
              key={item.id}
              ref={node => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              className="tabs__tab"
              type="button"
              role="tab"
              id={getTabId(instanceId, item.id)}
              aria-selected={selected}
              aria-controls={getPanelId(instanceId, item.id)}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => onValueChange(item.id)}
              onKeyDown={handleKeyDown}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {selectedItem ? (
        <div
          key={selectedItem.id}
          className="tabs__panel"
          role="tabpanel"
          id={getPanelId(instanceId, selectedItem.id)}
          aria-labelledby={getTabId(instanceId, selectedItem.id)}
          tabIndex={0}
        >
          {selectedItem.content}
        </div>
      ) : (
        <p role="status">No tab is selected.</p>
      )}
    </div>
  );
}
```

The component is generic, accessible, and short enough to build while explaining each decision.

## Example usage

```tsx
import { useState } from "react";
import { Tabs } from "./Tabs";
import type { TabItem } from "./Tabs";

const settingsTabs: readonly TabItem[] = [
  {
    id: "profile",
    label: "Profile",
    content: <ProfileSettings />,
  },
  {
    id: "security",
    label: "Security",
    content: <SecuritySettings />,
  },
  {
    id: "billing",
    label: "Billing",
    content: <BillingSettings />,
    disabled: true,
  },
];

export function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState("profile");

  return (
    <Tabs
      items={settingsTabs}
      value={selectedTab}
      onValueChange={setSelectedTab}
      ariaLabel="Account settings"
    />
  );
}
```

The same component can display product information, dashboard views, documentation sections, or any other React content.

## Minimal CSS

```css
.tabs__list {
  display: flex;
  gap: 0.25rem;
  border-bottom: 1px solid #cbd5e1;
}

.tabs__tab {
  border: 0;
  border-bottom: 3px solid transparent;
  padding: 0.75rem 1rem;
  color: #475569;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.tabs__tab[aria-selected="true"] {
  border-color: #2563eb;
  color: #0f172a;
  font-weight: 700;
}

.tabs__tab:focus-visible,
.tabs__panel:focus-visible {
  outline: 3px solid rgb(37 99 235 / 40%);
  outline-offset: 3px;
}

.tabs__tab:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.tabs__panel {
  padding-block: 1.25rem;
}
```

Selection and focus are different states. Keep both the selected styling and a visible focus indicator.

## Complexity

Let `n` be the number of tabs:

- rendering is `O(n)`;
- finding the selected item is `O(n)`;
- an arrow-key operation filters and searches in `O(n)`;
- ref lookup for focusing is `O(1)`.

Tabs collections are normally small, so clarity matters more than maintaining extra lookup structures. If hundreds of tabs exist, the interaction design likely needs reconsideration before micro-optimization.

## Testing strategy

Test the public behavior:

1. The selected tab has `aria-selected="true"` and `tabIndex={0}`.
2. The matching panel is visible and labelled by its tab.
3. Clicking an enabled tab calls `onValueChange`.
4. Disabled tabs cannot be clicked.
5. Right and Left Arrow navigation wraps.
6. Keyboard navigation skips disabled tabs.
7. Home and End select the boundary tabs.
8. Keyboard navigation moves focus to the newly selected tab.
9. An invalid selected value renders the empty state.

```tsx
it("selects the next enabled tab with ArrowRight", async () => {
  const user = userEvent.setup();
  render(<SettingsTabs />);

  const profile = screen.getByRole("tab", { name: "Profile" });
  const security = screen.getByRole("tab", { name: "Security" });

  profile.focus();
  await user.keyboard("{ArrowRight}");

  expect(security).toHaveFocus();
  expect(security).toHaveAttribute("aria-selected", "true");
  expect(
    screen.getByRole("tabpanel", { name: "Security" }),
  ).toBeVisible();
});
```

Query by role and accessible name rather than class names or component state.

## Common mistakes

- Hard-coding each tab instead of rendering data.
- Storing both selected ID and selected index.
- Using the array index as the item identity.
- Copying the controlled value into local state.
- Rendering clickable `<div>` elements instead of buttons.
- Omitting `tablist`, `tab`, or `tabpanel` roles.
- Forgetting `aria-controls` and `aria-labelledby`.
- Putting every tab in the normal Tab order.
- Navigating to disabled tabs.
- Generating random IDs during render.
- Removing the focus outline.
- Adding Context and compound components before the requirements need them.

## Production improvements to discuss

After the core solution works, mention—not necessarily implement—the following:

- Add uncontrolled mode with `defaultValue`.
- Add `orientation="vertical"` and use Up/Down Arrow.
- Add manual activation for panels that load slowly.
- Render all panels with `hidden` when their local state must survive.
- Recover selection if the active tab is removed or disabled.
- Synchronize controlled selection with the URL.
- Support RTL-aware horizontal navigation.
- Expose refs and merge consumer handlers in a design-system API.
- Add compound components only when consumers need custom tab/panel structure.
- Validate duplicate IDs in development.
- Test with representative screen readers.

This is where seniority appears: complete the essential task first, then describe how requirements would change the design.

## How to explain the solution in 60 seconds

I model each tab with a stable ID, arbitrary label, arbitrary content, and an optional disabled state. The parent controls one selected ID, so the selected item and index remain derived rather than duplicated state. I render native buttons with tab semantics and connect the active tab and panel using stable IDs from `useId`. Roving `tabIndex` puts only the selected tab in the page’s Tab order. Left, Right, Home, and End calculate the next enabled item, request selection, and focus its existing button during the keyboard interaction. This interview version renders one panel and resets its local state when switching; if preservation were required, I would keep all panels mounted and hide inactive ones.

## Likely interview follow-ups

### Why use an ID rather than the array index as the value?

The ID represents logical identity after insertion, removal, or reordering. An index represents only the current position.

### Why is selection controlled?

The parent may need to coordinate tabs with routing, analytics, or other UI. A controlled API also keeps the interview implementation focused on one state owner.

### Why focus inside the keyboard handler?

The destination button already exists, and focus movement is caused directly by that keyboard event. An Effect tied to `value` could steal focus when selection changes for another reason.

### Why not use Context?

One component does not need it. Context becomes useful when a production API separates the root, list, triggers, and panels into compound components.

### How would you preserve panel state?

Render every panel with a stable key and apply `hidden` to inactive panels instead of unmounting them. This trades memory and Effect cost for preservation.

### When would you use manual activation?

When selecting a panel starts slow work. Arrow keys would move focus, while Enter or Space would update selection.
