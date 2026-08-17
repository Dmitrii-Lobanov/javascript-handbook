# Accessible Modal Dialog

## The interview prompt

Build a reusable modal dialog that renders above the application and accepts arbitrary content. It must open and close predictably, support keyboard users, move focus into the dialog, keep focus inside while open, and restore focus when it closes.

Assume a 35–50 minute interview. Styling is secondary to interaction design, cleanup, accessible semantics, and a clear reusable API.

## What the interviewer is evaluating

A modal appears simple, but a correct implementation exposes several senior frontend skills:

- translating “show an overlay” into an explicit interaction contract;
- separating state ownership from dialog behavior;
- using a portal without confusing DOM and React-tree behavior;
- managing Escape, outside interaction, and event propagation;
- moving, containing, and restoring focus;
- synchronizing React with the DOM through refs and Effects;
- making the background unavailable while the modal is active;
- cleaning up global listeners, scroll locking, and temporary DOM nodes;
- recognizing when a production-tested primitive is safer than custom code.

A strong interview solution does not reproduce every browser and assistive-technology edge case. It implements the critical behavior, explains its invariants, and identifies what requires production hardening.

## Clarifying questions to ask

Before coding, establish the expected behavior.

1. Is the dialog modal, or may users interact with the background?
2. Is `open` controlled by the parent?
3. Should Escape always close it?
4. Should clicking the overlay close it?
5. What receives initial focus?
6. Where should focus return after closing?
7. Are nested dialogs or popovers required?
8. Should the content remain mounted while closed?
9. Are animations required?
10. May we use the native `<dialog>` element or a headless component library?

For this walkthrough:

- the parent controls `open`;
- Escape and the close button dismiss the dialog;
- overlay dismissal is configurable;
- focus moves to an explicit initial target or the first focusable element;
- Tab and Shift+Tab remain within the dialog;
- focus returns to the element active before opening;
- the dialog renders in a portal;
- background content becomes inert and body scrolling is locked;
- nested dialogs and exit animations are production extensions.

## Requirements and deliberate non-requirements

### Required in the interview version

- Controlled `open` and `onOpenChange` API
- Portal rendering
- Accessible dialog name and optional description
- Explicit close button
- Escape dismissal
- Safe overlay dismissal
- Initial focus
- Tab and Shift+Tab containment
- Focus restoration
- Background inertness
- Body scroll locking and cleanup

### Explain, but do not necessarily finish

- Nested modal stacks
- Exit animations that delay unmounting
- Shadow DOM and iframe focus
- Mobile virtual-keyboard behavior
- Complex scroll-lock compensation
- Alert-dialog semantics
- Server-rendered initially open dialogs
- Full browser and screen-reader compatibility testing

This boundary keeps the exercise achievable while showing that a design-system dialog requires more hardening than an interview implementation.

## Type contract

Define the public contract before implementing DOM behavior:

```tsx
import type {
  ReactNode,
  RefObject,
} from "react";

type ModalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  closeLabel?: string;
};
```

The responsibilities are explicit:

- the parent owns whether the dialog is open;
- `onOpenChange(false)` is the only dismissal request;
- `title` always gives the dialog an accessible name;
- `description` supplies optional supporting context;
- `children` keeps body content composable;
- `initialFocusRef` lets a form choose its first invalid or primary field;
- dismissal behavior is configured without exposing internal event handlers.

Do not accept an arbitrary `role` in this version. A modal dialog and an alert dialog have different interaction expectations and should not be switched accidentally by a styling prop.

## State model and invariants

The dialog does not need local open state because the parent owns it:

```tsx
const [open, setOpen] = useState(false);

<ModalDialog
  open={open}
  onOpenChange={setOpen}
  title="Edit profile"
>
  <ProfileForm />
</ModalDialog>
```

The component needs refs rather than additional rendering state:

```tsx
const dialogRef = useRef<HTMLDivElement>(null);
const previouslyFocusedRef = useRef<HTMLElement | null>(null);
```

Useful invariants:

1. A closed dialog renders no interactive modal surface.
2. An open dialog has an accessible name.
3. Focus is inside the dialog after it opens.
4. Tab navigation cannot move into inert background content.
5. Escape and overlay dismissal request the same controlled state change.
6. Clicking inside the dialog never counts as an overlay click.
7. Every global mutation is restored during cleanup.
8. Closing restores focus to a meaningful element when it still exists.

Avoid storing `isMounted`, `hasFocus`, and `isClosing` unless animation or server-rendering requirements make those states real. Most behavior is synchronized from the controlled `open` prop.

## Component and Hook design

Keep the interview architecture small:

```text
ModalDialog
├── usePortalContainer
├── focus and keyboard Effect
├── inert and scroll-lock Effect
└── portal
    └── overlay
        └── dialog surface
```

Extract `usePortalContainer` because temporary DOM-node ownership has a clear setup and cleanup lifecycle. Keep the initial focus and dismissal logic in the component until a second overlay primitive needs the same behavior.

Do not extract a generic `useModal` Hook merely to make the component shorter. Focus containment, labeling, portal structure, and dismissal are one interaction contract; splitting them prematurely can make it harder to verify that they stay coordinated.

## Step-by-step React solution

Build one behavior at a time:

```text
Controlled dialog shell
    ↓
Portal
    ↓
Escape and safe overlay dismissal
    ↓
Initial focus and restoration
    ↓
Tab containment
    ↓
Background inertness and scroll lock
```

Each checkpoint remains explainable if the interview ends early.

### Step 1: build a controlled semantic dialog

Start with state ownership and accessible structure:

```tsx
function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: ModalDialogProps) {
  const titleId = useId();
  const descriptionId = useId();

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className="modal-surface"
      >
        <h2 id={titleId}>{title}</h2>
        {description && (
          <p id={descriptionId}>{description}</p>
        )}
        {children}
        <button type="button" onClick={() => onOpenChange(false)}>
          Close
        </button>
      </div>
    </div>
  );
}
```

`aria-modal="true"` communicates modal intent, but it does not make the background inert or contain focus. Those behaviors still need implementation.

Do not omit a visible title merely because the visual design has an icon. If a visible heading is genuinely inappropriate, the API still needs an explicit accessible label strategy.

### Step 2: render through a portal

A portal lets the overlay escape ancestor clipping and stacking contexts while remaining in the same React tree.

Create and own one portal container:

```tsx
function usePortalContainer() {
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.dataset.modalPortal = "";
    document.body.append(node);
    setContainer(node);

    return () => {
      node.remove();
    };
  }, []);

  return container;
}
```

Render only after the container exists:

```tsx
const portalContainer = usePortalContainer();

if (!open || !portalContainer) return null;

return createPortal(dialogMarkup, portalContainer);
```

The Effect avoids reading `document` during server rendering. In a production application, a shared overlay root may be preferable to creating one container per instance.

Portal events follow the React tree, not only the DOM tree. A dialog click can still bubble to React ancestors of the component that returned the portal.

### Step 3: add Escape and safe overlay dismissal

Handle Escape only while open and remove the listener during cleanup:

```tsx
useEffect(() => {
  if (!open || !closeOnEscape) return;

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onOpenChange(false);
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [open, closeOnEscape, onOpenChange]);
```

For overlay dismissal, check that the overlay itself was the event target:

```tsx
function handleOverlayMouseDown(
  event: React.MouseEvent<HTMLDivElement>,
) {
  if (
    closeOnOverlayClick &&
    event.target === event.currentTarget
  ) {
    onOpenChange(false);
  }
}
```

```tsx
<div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
  <div className="modal-surface">...</div>
</div>
```

Do not call `stopPropagation` on every event inside the dialog. It can break legitimate React-tree event behavior. The target equality check distinguishes the overlay from its descendants.

A production primitive should also decide how pointer-down inside followed by pointer-up outside behaves and how nested overlays coordinate dismissal.

### Step 4: move and restore focus

When opening, remember the active element, then focus the requested target or the first focusable descendant:

```tsx
const dialogRef = useRef<HTMLDivElement>(null);
const previouslyFocusedRef = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (!open || !portalContainer) return;

  previouslyFocusedRef.current =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

  const target =
    initialFocusRef?.current ??
    getFocusableElements(dialogRef.current)[0] ??
    dialogRef.current;

  target?.focus();

  return () => {
    const previous = previouslyFocusedRef.current;
    if (previous?.isConnected) previous.focus();
  };
}, [open, portalContainer, initialFocusRef]);
```

Make the dialog surface programmatically focusable as a fallback:

```tsx
<div ref={dialogRef} role="dialog" tabIndex={-1}>
```

Initial focus is a product decision. A destructive confirmation should normally focus the least destructive action, while a long informational dialog may focus its heading or container.

### Step 5: contain Tab navigation

Collect currently focusable descendants when Tab is pressed:

```tsx
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];

  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(element => !element.hidden && element.getClientRects().length > 0);
}
```

Cycle from the last item to the first and from the first to the last:

```tsx
function containTabKey(event: KeyboardEvent) {
  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(dialogRef.current);
  if (!focusable.length) {
    event.preventDefault();
    dialogRef.current?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
```

Attach this inside the same open-dialog keyboard Effect. Recalculate on each key press because form validation or conditional content can change which elements are focusable.

This selector is interview-sized, not a complete focus-management engine. Production implementations must account for radio groups, Shadow DOM, iframes, hidden ancestors, disabled fieldsets, and nested overlays.

### Step 6: make the background inert and lock scrolling

When the dialog opens, make every body child except its portal container inert and preserve the previous values:

```tsx
useEffect(() => {
  if (!open || !portalContainer) return;

  const siblings = Array.from(document.body.children)
    .filter(element => element !== portalContainer)
    .filter((element): element is HTMLElement => element instanceof HTMLElement);

  const previousInert = siblings.map(element => [
    element,
    element.inert,
  ] as const);
  const previousOverflow = document.body.style.overflow;

  siblings.forEach(element => {
    element.inert = true;
  });
  document.body.style.overflow = "hidden";

  return () => {
    previousInert.forEach(([element, inert]) => {
      element.inert = inert;
    });
    document.body.style.overflow = previousOverflow;
  };
}, [open, portalContainer]);
```

`inert` prevents focus and interaction with the background. It does not stop React Effects, timers, requests, or subscriptions in that background subtree.

Saving prior values is essential. Cleanup must restore the environment it found rather than assuming `false` and an empty overflow style. Nested modal stacks need a shared overlay manager or reference counting so one dialog does not undo another dialog’s lock.

## Complete interview-sized implementation

```tsx
"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

type ModalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
  closeLabel?: string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(root: HTMLElement | null) {
  if (!root) return [];

  return Array.from(
    root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(element => !element.hidden && element.getClientRects().length > 0);
}

function usePortalContainer() {
  const [container, setContainer] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.dataset.modalPortal = "";
    document.body.append(node);
    setContainer(node);

    return () => node.remove();
  }, []);

  return container;
}

export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocusRef,
  closeOnEscape = true,
  closeOnOverlayClick = true,
  closeLabel = "Close dialog",
}: ModalDialogProps) {
  const portalContainer = usePortalContainer();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open || !portalContainer) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const target =
      initialFocusRef?.current ??
      getFocusableElements(dialogRef.current)[0] ??
      dialogRef.current;

    target?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && closeOnEscape) {
        event.preventDefault();
        onOpenChange(false);
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      const previous = previouslyFocusedRef.current;
      if (previous?.isConnected) previous.focus();
    };
  }, [
    open,
    portalContainer,
    initialFocusRef,
    closeOnEscape,
    onOpenChange,
  ]);

  useEffect(() => {
    if (!open || !portalContainer) return;

    const siblings = Array.from(document.body.children)
      .filter(element => element !== portalContainer)
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement,
      );

    const previousInert = siblings.map(element => [
      element,
      element.inert,
    ] as const);
    const previousOverflow = document.body.style.overflow;

    siblings.forEach(element => {
      element.inert = true;
    });
    document.body.style.overflow = "hidden";

    return () => {
      previousInert.forEach(([element, inert]) => {
        element.inert = inert;
      });
      document.body.style.overflow = previousOverflow;
    };
  }, [open, portalContainer]);

  if (!open || !portalContainer) return null;

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>) {
    if (
      closeOnOverlayClick &&
      event.target === event.currentTarget
    ) {
      onOpenChange(false);
    }
  }

  return createPortal(
    <div className="modal-overlay" onMouseDown={handleOverlayMouseDown}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="modal-surface"
      >
        <header className="modal-header">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description && (
              <p id={descriptionId}>{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    portalContainer,
  );
}
```

Example usage:

```tsx
function EditProfile() {
  const [open, setOpen] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Edit profile
      </button>

      <ModalDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit profile"
        description="Changes are visible to your team."
        initialFocusRef={nameRef}
      >
        <form>
          <label htmlFor="profile-name">Display name</label>
          <input ref={nameRef} id="profile-name" name="name" />
          <button type="submit">Save changes</button>
        </form>
      </ModalDialog>
    </>
  );
}
```

Minimal styling:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(0 0 0 / 60%);
}

.modal-surface {
  width: min(34rem, 100%);
  max-height: min(42rem, calc(100dvh - 2rem));
  overflow: auto;
  border-radius: 0.75rem;
  background: white;
  color: #171717;
  box-shadow: 0 1.5rem 4rem rgb(0 0 0 / 35%);
}

.modal-header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
}

.modal-content {
  padding: 0 1.25rem 1.25rem;
}

@media (prefers-reduced-motion: no-preference) {
  .modal-surface {
    animation: modal-enter 160ms ease-out;
  }
}
```

## Accessibility and keyboard behavior

The required interaction contract is:

| Input | Expected behavior |
|---|---|
| Open | Focus moves to the deliberate initial target |
| Tab | Focus moves to the next focusable dialog descendant |
| Shift+Tab | Focus moves to the previous focusable descendant |
| Tab at the last item | Focus wraps to the first item |
| Shift+Tab at the first item | Focus wraps to the last item |
| Escape | Requests close when enabled |
| Close button | Requests close |
| Overlay pointer action | Requests close only when configured and truly outside |
| Close | Focus returns to the trigger or logical successor |

Important semantic rules:

- the dialog has `role="dialog"` and `aria-modal="true"`;
- `aria-labelledby` references a meaningful title;
- `aria-describedby` is omitted when no useful description exists;
- the close button has an accessible name;
- background content is inert rather than merely visually obscured;
- focus remains visible throughout the workflow.

Do not put every paragraph into `aria-describedby`; screen readers may announce an overwhelming block when the dialog receives focus. Use it for concise supporting context.

## Portals, events, and edge cases

### React events still follow the React tree

Portals change DOM placement, not React ownership. A click inside the modal can bubble to React ancestors outside the portal container. Use precise dismissal checks rather than assuming DOM separation stops propagation.

### Focus can disappear during updates

Validation may remove the currently focused element. After conditional updates, preserve it when possible or move focus to the replacement or error summary. A focus trap should not continually force focus back on every render.

### Nested overlays require coordination

Two independent dialogs can fight over Escape, inert state, scroll locking, and focus restoration. A production overlay manager should track a stack so only the topmost modal handles dismissal and locks are reference-counted.

### Exit animations require presence state

Immediate `open === false` unmounting cannot display an exit animation. Production code may separate logical open state from temporary presence state. During exit, the surface should no longer accept interaction, and focus restoration must happen at a deliberate time.

### Native `<dialog>` is a valid alternative

The native element provides top-layer rendering, modal behavior through `showModal()`, Escape handling, and focus support. It still requires a controlled React integration, accessible naming, form behavior decisions, animation handling, and cross-browser testing. In production, compare native support with a mature headless primitive before maintaining a custom focus manager.

## Testing strategy

Test the public behavior rather than internal refs.

### Component tests

1. The dialog is absent while closed.
2. Opening renders the title, description, and body.
3. Initial focus moves to `initialFocusRef`.
4. The close button requests `onOpenChange(false)`.
5. Escape closes only when enabled.
6. Clicking the overlay closes only when enabled.
7. Clicking dialog content does not close it.
8. Tab and Shift+Tab wrap at the boundaries.
9. Focus returns to the original trigger.
10. Unmounting restores inert and scroll styles.

Example:

```tsx
test("moves focus into the dialog and restores it", async () => {
  render(<EditProfile />);
  const trigger = screen.getByRole("button", {
    name: "Edit profile",
  });

  await user.click(trigger);
  expect(screen.getByLabelText("Display name")).toHaveFocus();

  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});
```

### Browser and assistive-technology tests

DOM test environments do not reproduce every focus, layout, inert, scroll, or accessibility behavior. Verify critical dialog flows in a real browser:

- keyboard-only opening, traversal, dismissal, and restoration;
- screen-reader title and description announcement;
- zoom and mobile viewport behavior;
- long scrolling content;
- reduced motion and forced colors;
- nested popovers or dialogs;
- removal of the trigger while open.

## Common candidate mistakes

### Treating the overlay as the dialog

The overlay is visual and receives outside interaction. The inner surface owns dialog semantics and labeling.

### Adding `role="dialog"` without focus behavior

ARIA does not move focus, trap Tab, inert the background, or restore the trigger.

### Closing on every overlay click

An event from dialog content bubbles to the overlay. Check `event.target === event.currentTarget`.

### Forgetting cleanup

Leaked document listeners, `body.style.overflow = "hidden"`, or `inert` state can break the application after the dialog closes.

### Focusing the first element blindly

The first element may be a destructive action. Choose initial focus from task intent.

### Defining a new portal container during render

DOM mutation during render is impure and can leak nodes when rendering restarts. Create and remove the node in an Effect.

### Building a production focus manager in an interview

Implement the common path, state the limitations, and explain when a tested primitive is the responsible production choice.

## Senior-level production improvements

After the interview version, consider:

- a shared overlay stack for nested dialogs and popovers;
- reference-counted inertness and scroll locking;
- scrollbar compensation and iOS scroll behavior;
- exit-presence state with reduced-motion support;
- robust tabbable-element discovery;
- alert-dialog and non-modal variants as separate contracts;
- a shared portal root with server-rendering integration;
- focus recovery when the trigger disappears;
- analytics that do not interfere with dismissal;
- visual-regression, browser, and assistive-technology coverage.

The strongest production improvement may be replacing the custom implementation with a maintained headless dialog primitive while preserving the public application API.

## A 60-second solution explanation

> The parent owns `open`, and every dismissal path calls `onOpenChange(false)`. The dialog renders through an Effect-owned portal so it escapes clipping without mutating the DOM during render. When it opens, I remember the active element, move focus to an explicit target or the first focusable child, contain Tab navigation, listen for Escape, make background siblings inert, and lock body scrolling. Cleanup removes the listener, restores inert and scroll state, and returns focus. The overlay closes only when it is the original event target, so clicks inside are safe. For production I would use a tested primitive or add an overlay stack, robust tabbable discovery, animation presence, and browser and screen-reader coverage.

## Likely interview follow-ups

### Why use a portal?

To escape ancestor clipping and stacking contexts while keeping Context and React event propagation connected to the original React tree.

### Why not stop propagation inside the dialog?

It can break legitimate ancestor behavior. Checking whether the overlay itself was targeted solves outside dismissal more precisely.

### Why is `aria-modal` insufficient?

It communicates semantics but does not implement focus movement, Tab containment, background inertness, or restoration.

### When would you use `<dialog>`?

When its platform behavior and browser support match the product requirements. I would still wrap it in a controlled component and test focus, forms, animation, and assistive technology.

### What changes for nested dialogs?

A shared manager should track the topmost overlay, coordinate Escape and outside interaction, reference-count global locks, and restore focus through the stack.

### Should overlay click always close?

No. It may be appropriate for lightweight dismissible content, but destructive, blocking, or multi-step workflows may require an explicit decision.

### Why is the focus selector incomplete?

Real tabbability depends on visibility, radio groups, disabled fieldsets, Shadow DOM, iframes, and browser behavior. The interview version covers common controls; production should use a well-tested focus-management utility.

