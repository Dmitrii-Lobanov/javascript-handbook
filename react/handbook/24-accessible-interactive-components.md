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

## Common traps

- Using `div` click handlers instead of native controls.
- Adding `tabIndex={0}` without keyboard activation semantics.
- Treating ARIA as a substitute for semantic HTML.
- Moving focus unexpectedly or failing to restore it after a dialog closes.

## Interview answer

I begin with native semantics because they provide behavior and accessibility for free. For custom widgets, I implement the recognized keyboard, focus, role, state, and announcement contract—not only ARIA attributes. I verify user-observable behavior with keyboard, accessibility-tree queries, automation, and assistive-technology testing.

## Check yourself

Why does adding `role="button"` to a `div` still leave important work unfinished?
