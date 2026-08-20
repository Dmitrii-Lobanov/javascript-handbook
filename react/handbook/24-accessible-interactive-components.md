# Chapter 24 — Accessible Interactive Components

## Quick refresher

Start with native HTML semantics. Add ARIA only when native elements cannot express the required interaction, and implement the complete keyboard and focus behavior of the chosen pattern.

## Why this matters

Accessibility is part of component correctness. A component that works only with a pointer or only visually is incomplete, even if its React state is well designed.

## Core mental model

Build in this order:

```text
semantic element → accessible name → keyboard behavior → focus → state announcement → testing
```

Use a button instead of a clickable `div`:

```tsx
<button type="button" aria-expanded={open} aria-controls={menuId} onClick={toggle}>
  Options
</button>
```

The browser provides focusability, Enter and Space activation, and button semantics. `aria-expanded` communicates component state; `aria-controls` identifies the controlled region.

For composite widgets such as tabs, listboxes, menus, dialogs, or comboboxes, follow the established interaction pattern. Decide where DOM focus lives, how arrow keys work, how Escape behaves, and where focus returns after dismissal. Do not add an ARIA role without implementing its expected behavior.

Test with keyboard-only navigation, visible focus, accessible-name queries, automated checks, and representative screen-reader testing. Automation cannot verify the complete experience.

## Native semantics first

Use the element whose built-in contract matches the interaction:

| Interaction | Native element |
| --- | --- |
| Perform an action | `button` |
| Navigate to a location | `a` with `href` |
| Enter text | labelled `input` or `textarea` |
| Choose one option | radio buttons or `select` |
| Submit related fields | `form` with submit button |

A clickable `div` requires focusability, Enter/Space behavior, disabled semantics, role, and focus styling that a button already provides.

## Accessible names and relationships

Every interactive control needs a programmatic name from visible text, a label, or an appropriate ARIA naming relationship. Supporting text and errors should be connected with `aria-describedby`; invalid state can use `aria-invalid`.

IDs should be stable across server rendering and hydration. `useId` is useful for relationships inside reusable components, but list keys must still come from data identity.

## Keyboard and focus contracts

Composite widgets require a deliberate focus model:

- Tabs use Tab to enter and arrow keys within the tablist.
- Dialogs move focus inside, contain it, and restore it on close.
- Comboboxes keep DOM focus on the input while active-descendant state identifies an option.
- Menus and listboxes follow their own established key patterns.

Do not invent one keyboard model for every popup.

## Announce dynamic state carefully

Use semantic state attributes such as `aria-expanded`, `aria-selected`, and `aria-pressed`. Use restrained live regions for asynchronous status that is not otherwise announced.

Avoid announcing large result collections or every rapidly changing value; excessive live output can make the interface unusable.

## Visual and motor accessibility

Maintain visible focus, sufficient contrast, usable target sizes, zoom support, reduced-motion preferences, and layouts that reflow rather than force two-dimensional scrolling.

Disabled controls can become undiscoverable. Sometimes an enabled action that explains why it cannot proceed is more useful than a silently disabled button.

## Testing layers

1. Query by role and accessible name in component tests.
2. Test complete keyboard flows and focus restoration.
3. Run automated accessibility checks.
4. Inspect the accessibility tree.
5. Test representative browsers and screen readers.
6. Include disabled users in usability testing when possible.

## Common traps

- Using `div` click handlers instead of native controls.
- Adding `tabIndex={0}` without keyboard activation semantics.
- Treating ARIA as a substitute for semantic HTML.
- Moving focus unexpectedly or failing to restore it after a dialog closes.

## Interview answer

I begin with native semantics because they provide behavior and accessibility for free. For custom widgets, I implement the recognized keyboard, focus, role, state, and announcement contract—not only ARIA attributes. I verify user-observable behavior with keyboard, accessibility-tree queries, automation, and assistive-technology testing.

## Follow-up questions

### Is valid ARIA enough?

No. The widget also needs expected keyboard behavior, focus management, visible state, and usable interaction.

### When should `aria-live` be used?

For important dynamic status not already conveyed through focus or native semantics, with restrained announcement frequency.

### Why use `useId` but not for keys?

It creates stable markup relationships; keys must identify domain items across collection changes.

## Check yourself

1. Why is `role="button"` on a `div` incomplete?
2. How should an error message relate to its input?
3. What focus behavior does a modal require?
4. Why can excessive live-region announcements be harmful?
5. Which accessibility checks require more than automation?
