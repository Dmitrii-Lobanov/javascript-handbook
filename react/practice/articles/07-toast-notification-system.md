# Toast Notification System

## The interview prompt

Build a notification system that lets any component show temporary success, error, or informational messages. Users must be able to dismiss a toast, and non-persistent toasts should disappear automatically.

This tutorial begins with local state and one visible list. We then introduce the provider and Hook API only after the core add, dismiss, and timer behavior works.

## What we will build

```text
Render notifications from state
  ↓
Add and dismiss notifications
  ↓
First working implementation
  ↓
Automatically dismiss with cleanup
  ↓
Move shared state into a provider
  ↓
Expose a useToast Hook
  ↓
Render through a portal
  ↓
Add accessible announcements
  ↓
Limit visible notifications
```

For a 35–50 minute interview, complete the local implementation and provider API first. Queueing, paused timers, deduplication, and exit animations are follow-up improvements.

## Clarify the requirements

Ask before coding:

1. Which notification variants are required?
2. Are messages plain text or arbitrary React content?
3. What is the default dismissal duration?
4. Can a notification remain until manually dismissed?
5. Where should notifications appear?
6. How many may be visible simultaneously?
7. Should hovering or focusing pause the timer?
8. How should screen readers be notified?
9. Do duplicate messages merge, replace, or remain separate?

For this tutorial:

- variants are `info`, `success`, and `error`;
- messages are strings;
- the default duration is five seconds;
- `durationMs: null` creates a persistent toast;
- newest notifications appear at the end of a top-right stack;
- at most three notifications are visible in the final enhancement;
- every toast has an explicit dismiss button;
- success and informational messages use polite announcements;
- errors use assertive announcements;
- pausing, animations, and deduplication are discussed after the core solution.

## Requirements and deliberate non-requirements

### Required in the interview version

- Add notifications from application components
- Stable notification identity
- Multiple variants
- Manual dismissal
- Automatic dismissal
- Timer cleanup
- Multiple notifications in deterministic order
- Provider and Hook API
- Portal rendering
- Accessible labels and live announcements
- Visible-notification limit

### Explain, but do not necessarily finish

- Pausing timeouts while hovered or focused
- Exit animations before state removal
- Duplicate-message policies
- Updating an existing notification
- Promise lifecycle helpers
- Cross-tab or server-driven notifications
- Persisting notifications across navigation
- Full design-system theming

## System design before implementation

Use GreatFrontEnd's [RADIO framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework) to structure the design.

```text
R — Requirements
A — Architecture
D — Data model
I — Interfaces
O — Optimizations and deep dives
```

For this component exercise, RADIO should clarify ownership and lifecycle without consuming the time needed to produce a working implementation.

### R — Requirements

The functional and non-functional requirements are defined above. The critical user journey is:

```text
application event
  → notification appears
  → user reads or dismisses it
  → notification is removed automatically or manually
```

The system must remain correct when several notifications overlap, a toast is dismissed before its timeout, the provider unmounts, or development checks repeat Effect setup and cleanup.

The most important quality attributes are:

- **Availability:** any descendant can publish a notification.
- **Predictability:** every notification has one stable identity and one removal path.
- **Accessibility:** messages are announced without stealing focus or overwhelming users.
- **Cleanup:** abandoned timers cannot update stale state.
- **Bounded UI:** a burst cannot cover the application indefinitely.

### A — Architecture

Separate publishing, state coordination, timing, and presentation:

```text
Application component
  → useToast().showToast(input)
  → ToastProvider dispatches add action
  → reducer stores Toast records
  → ToastViewport renders visible records in a portal
  → ToastItem owns its dismissal timer
  → dismissToast(id) dispatches remove action
```

Responsibilities:

| Boundary | Responsibility |
| --- | --- |
| Application component | Decides when and why to notify |
| `useToast` | Exposes the nearest provider's publishing API |
| `ToastProvider` | Owns records, IDs, reducer transitions, and context value |
| Reducer | Adds and removes notifications immutably |
| `ToastViewport` | Positions and limits the visible stack |
| `ToastItem` | Renders one notification and owns its timeout lifecycle |

Keep timer ownership close to the rendered toast. When the toast unmounts, its Effect cleanup clears its timeout naturally.

### D — Data model

Separate caller input from the stored record:

```ts
type ToastInput = {
  message: string;
  tone?: "info" | "success" | "error";
  durationMs?: number | null;
};

type Toast = {
  id: string;
  message: string;
  tone: "info" | "success" | "error";
  durationMs: number | null;
};
```

The caller does not provide identity. The provider creates it once when accepting the notification.

| Data | Owner | Stored or derived? |
| --- | --- | --- |
| Complete toast collection | Provider | Reducer state |
| Next numeric ID | Provider | Ref |
| Visible toasts | Viewport | Derived slice |
| Queued count | Viewport | Derived |
| Announcement politeness | Toast item | Derived from tone |
| Remaining duration | Not implemented initially | Would require state/ref for pausing |

Maintain these invariants:

1. Every toast ID is unique for the provider lifetime.
2. Adding appends exactly one normalized record.
3. Dismissing one ID never removes another toast.
4. Persistent notifications create no automatic timer.
5. Timer cleanup runs when a toast is dismissed or unmounted.
6. Only visible notifications render live regions and timers.
7. The provider is the single owner of notification records.

### I — Interfaces

The publishing API should be small:

```ts
type ToastApi = {
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
};
```

Returning the ID lets a caller dismiss a long-running notification later:

```tsx
const { showToast, dismissToast } = useToast();

const id = showToast({
  message: "Uploading report…",
  durationMs: null,
});

await uploadReport();
dismissToast(id);
```

The provider API controls global configuration:

```ts
type ToastProviderProps = {
  children: ReactNode;
  defaultDurationMs?: number;
  maxVisible?: number;
};
```

Do not expose reducer dispatch or internal records through context. Consumers need commands, not permission to construct invalid state transitions.

### O — Optimizations and deep dives

#### Keep the Context value stable

Memoize the public API only when necessary to avoid notifying consumers after every reducer update. `showToast` and `dismissToast` can use stable callbacks because reducer `dispatch` and the ID ref are stable.

#### Bound bursts deliberately

A maximum visible count prevents a notification storm from covering the page. Decide whether extra records wait in a queue, replace older low-priority records, or are dropped. This tutorial stores all records and renders the first visible slice, so hidden records do not start timers prematurely.

#### Pause timers correctly

Pausing requires tracking remaining time, not restarting the full duration on every hover. Record the start timestamp and remaining milliseconds, clear the timer on hover or focus, and resume with the remainder on leave or blur.

#### Coordinate exit animations

Removal and visual exit are different transitions. A production record can move from `visible` to `exiting`, then be deleted after animation completion. Keep it out of the queue capacity only when product behavior defines that slot as available.

#### Define deduplication policy

Identical text does not always mean the same event. If the product needs deduplication, accept a semantic key and define whether a duplicate increments a count, refreshes duration, updates content, or is ignored.

#### Avoid announcement overload

Do not put the complete changing stack inside one assertive live region. Announce each new message with appropriate politeness, keep errors concise, and avoid repeatedly announcing countdown or animation changes.

#### Decide whether notifications survive navigation

A provider above the router can preserve notifications across client navigation. A route-scoped provider clears them when the route leaves. Choose the lifetime from product behavior rather than placing the provider globally by habit.

With RADIO established, define the types and implement local state before introducing Context.

## Define the types first

```tsx
export type ToastTone = "info" | "success" | "error";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number | null;
};

export type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number | null;
};
```

`undefined` duration means “use the provider default.” `null` explicitly disables automatic dismissal. Normalize defaults when creating the stored record so every rendered toast has a complete contract.

## Step 1 — Render notifications from state

Start locally. This proves the data model and list rendering without Context or timers.

```tsx
import { useState } from "react";

const initialToasts: readonly Toast[] = [
  {
    id: "example-1",
    message: "Profile saved.",
    tone: "success",
    durationMs: 5000,
  },
];

export function ToastDemo() {
  const [toasts] = useState<readonly Toast[]>(initialToasts);

  return (
    <ol aria-label="Notifications">
      {toasts.map(toast => (
        <li key={toast.id}>
          <span>{toast.message}</span>
        </li>
      ))}
    </ol>
  );
}
```

Use the toast ID as the key. An array index would transfer component and timer identity when an earlier toast is removed.

## Step 2 — Add and dismiss notifications

Use a ref for ID generation because incrementing it does not render the UI:

```tsx
const nextIdRef = useRef(1);

function showToast(input: ToastInput) {
  const toast: Toast = {
    id: `toast-${nextIdRef.current++}`,
    message: input.message,
    tone: input.tone ?? "info",
    durationMs: input.durationMs === undefined ? 5000 : input.durationMs,
  };

  setToasts(current => [...current, toast]);
  return toast.id;
}

function dismissToast(id: string) {
  setToasts(current => current.filter(toast => toast.id !== id));
}
```

Use functional state updates because the next collection depends on whatever state is current when React processes the update.

Render a manual close button:

```tsx
<li key={toast.id} data-tone={toast.tone}>
  <span>{toast.message}</span>
  <button
    type="button"
    aria-label={`Dismiss: ${toast.message}`}
    onClick={() => dismissToast(toast.id)}
  >
    <span aria-hidden="true">×</span>
  </button>
</li>
```

## First working implementation

The first complete checkpoint supports adding multiple notifications and dismissing each one independently:

```tsx
import { useRef, useState } from "react";

export type ToastTone = "info" | "success" | "error";

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
};

export function ToastDemo() {
  const [toasts, setToasts] = useState<readonly Toast[]>([]);
  const nextIdRef = useRef(1);

  function showToast(message: string, tone: ToastTone = "info") {
    const toast: Toast = {
      id: `toast-${nextIdRef.current++}`,
      message,
      tone,
    };

    setToasts(current => [...current, toast]);
  }

  function dismissToast(id: string) {
    setToasts(current => current.filter(toast => toast.id !== id));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => showToast("Changes saved.", "success")}
      >
        Save
      </button>

      <ol aria-label="Notifications">
        {toasts.map(toast => (
          <li key={toast.id} data-tone={toast.tone}>
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label={`Dismiss: ${toast.message}`}
              onClick={() => dismissToast(toast.id)}
            >
              <span aria-hidden="true">×</span>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
```

This is the first valid interview solution. Its limitations are now clear:

- only this component can publish notifications;
- notifications do not dismiss automatically;
- the list is tied to its current DOM position;
- the announcement strategy is incomplete;
- an unlimited burst can cover the page.

## Step 3 — Add automatic dismissal

Give every rendered toast item ownership of its timeout:

```tsx
type ToastItemProps = {
  toast: Toast;
  onDismiss: (id: string) => void;
};

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  useEffect(() => {
    if (toast.durationMs === null) return;

    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <li data-tone={toast.tone}>
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label={`Dismiss: ${toast.message}`}
        onClick={() => onDismiss(toast.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}
```

Cleanup matters when the user dismisses early, the provider unmounts, or Effect setup is repeated during development checks. A stale timeout must not outlive the toast that created it.

## Step 4 — Move transitions into a reducer

The state operations are small but system-level. A reducer names the legal transitions:

```tsx
type ToastAction =
  | { type: "added"; toast: Toast }
  | { type: "dismissed"; id: string };

function toastReducer(
  state: readonly Toast[],
  action: ToastAction,
): readonly Toast[] {
  switch (action.type) {
    case "added":
      return [...state, action.toast];
    case "dismissed":
      return state.filter(toast => toast.id !== action.id);
  }
}
```

The reducer stays pure. ID generation, timer creation, and DOM work remain outside it.

## Step 5 — Create the provider and Hook API

Context distributes commands to descendants:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

type ToastApi = {
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
```

Do not provide a silent no-op default. A missing provider is a configuration error and should fail close to its cause.

Provider operations normalize input and dispatch actions:

```tsx
const showToast = useCallback((input: ToastInput) => {
  const id = `toast-${nextIdRef.current++}`;

  dispatch({
    type: "added",
    toast: {
      id,
      message: input.message,
      tone: input.tone ?? "info",
      durationMs:
        input.durationMs === undefined
          ? defaultDurationMs
          : input.durationMs,
    },
  });

  return id;
}, [defaultDurationMs]);

const dismissToast = useCallback((id: string) => {
  dispatch({ type: "dismissed", id });
}, []);
```

Memoize the context value so consumers that only publish notifications do not rerender whenever the toast collection changes:

```tsx
const api = useMemo(
  () => ({ showToast, dismissToast }),
  [showToast, dismissToast],
);
```

## Step 6 — Render through a portal

The viewport belongs near the end of `document.body`, independent of the component that published a notification:

```tsx
import { createPortal } from "react-dom";

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: readonly Toast[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <ol className="toast-viewport" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </ol>,
    document.body,
  );
}
```

For a browser-only React exercise, using `document.body` is sufficient. An SSR-capable application must ensure the portal target is accessed only in the browser or inject a target element.

## Step 7 — Add accessible announcements

The toast itself can act as the live region. Choose politeness from importance:

```tsx
const liveRole = toast.tone === "error" ? "alert" : "status";

return (
  <li role={liveRole} data-tone={toast.tone}>
    {/* message and dismiss button */}
  </li>
);
```

- `role="status"` provides a polite announcement suitable for ordinary confirmation.
- `role="alert"` is assertive and should be reserved for urgent errors.
- do not move focus to a new toast automatically;
- the dismiss button remains reachable through normal keyboard navigation;
- the message must not rely on color or an icon alone.

If a form already renders an inline field error, a duplicate assertive toast can be noisy. Choose one primary announcement channel for the error.

## Step 8 — Limit visible notifications

Derive the visible slice:

```tsx
const visibleToasts = toasts.slice(0, maxVisible);
const queuedCount = Math.max(0, toasts.length - visibleToasts.length);
```

Only rendered `ToastItem` components create timers. When one dismisses, the next queued record becomes visible and starts its own complete duration.

This is a simple FIFO policy. If newest-first presentation is required, define whether queue priority and visual order also reverse rather than calling `.reverse()` without considering timing.

## Complete solution

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type ToastTone = "info" | "success" | "error";

export type ToastInput = {
  message: string;
  tone?: ToastTone;
  durationMs?: number | null;
};

type Toast = {
  id: string;
  message: string;
  tone: ToastTone;
  durationMs: number | null;
};

type ToastAction =
  | { type: "added"; toast: Toast }
  | { type: "dismissed"; id: string };

type ToastApi = {
  showToast: (input: ToastInput) => string;
  dismissToast: (id: string) => void;
};

type ToastProviderProps = {
  children: ReactNode;
  defaultDurationMs?: number;
  maxVisible?: number;
};

const ToastContext = createContext<ToastApi | null>(null);

function toastReducer(
  state: readonly Toast[],
  action: ToastAction,
): readonly Toast[] {
  switch (action.type) {
    case "added":
      return [...state, action.toast];
    case "dismissed":
      return state.filter(toast => toast.id !== action.id);
  }
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.durationMs === null) return;

    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <li
      className="toast"
      data-tone={toast.tone}
      role={toast.tone === "error" ? "alert" : "status"}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        aria-label={`Dismiss: ${toast.message}`}
        onClick={() => onDismiss(toast.id)}
      >
        <span aria-hidden="true">×</span>
      </button>
    </li>
  );
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: readonly Toast[];
  onDismiss: (id: string) => void;
}) {
  return createPortal(
    <ol className="toast-viewport" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </ol>,
    document.body,
  );
}

export function ToastProvider({
  children,
  defaultDurationMs = 5000,
  maxVisible = 3,
}: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  const nextIdRef = useRef(1);

  const showToast = useCallback((input: ToastInput) => {
    const id = `toast-${nextIdRef.current++}`;

    dispatch({
      type: "added",
      toast: {
        id,
        message: input.message,
        tone: input.tone ?? "info",
        durationMs:
          input.durationMs === undefined
            ? defaultDurationMs
            : input.durationMs,
      },
    });

    return id;
  }, [defaultDurationMs]);

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: "dismissed", id });
  }, []);

  const api = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  );

  const visibleToasts = toasts.slice(0, maxVisible);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport
        toasts={visibleToasts}
        onDismiss={dismissToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (context === null) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
```

## Example usage

Wrap the part of the application that should share notifications:

```tsx
function App() {
  return (
    <ToastProvider>
      <ProfilePage />
    </ToastProvider>
  );
}
```

Publish from any descendant:

```tsx
function SaveProfileButton() {
  const { showToast } = useToast();

  async function handleSave() {
    try {
      await saveProfile();
      showToast({
        message: "Profile saved.",
        tone: "success",
      });
    } catch {
      showToast({
        message: "Profile could not be saved.",
        tone: "error",
        durationMs: null,
      });
    }
  }

  return (
    <button type="button" onClick={handleSave}>
      Save profile
    </button>
  );
}
```

The error is persistent because recovery may require the user to read and dismiss it deliberately.

## Minimal CSS

```css
.toast-viewport {
  position: fixed;
  z-index: 1000;
  inset-block-start: 1rem;
  inset-inline-end: 1rem;
  display: grid;
  gap: 0.75rem;
  width: min(24rem, calc(100vw - 2rem));
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid #94a3b8;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 0.5rem 1.5rem rgb(15 23 42 / 18%);
  pointer-events: auto;
}

.toast[data-tone="success"] {
  border-inline-start: 0.35rem solid #15803d;
}

.toast[data-tone="error"] {
  border-inline-start: 0.35rem solid #b91c1c;
}

.toast[data-tone="info"] {
  border-inline-start: 0.35rem solid #1d4ed8;
}
```

The colored border reinforces tone but never replaces the text message.

## Complexity

For `n` stored notifications:

- adding is `O(n)` because a new immutable array is created;
- dismissing is `O(n)` because the array is filtered;
- deriving at most `k` visible notifications is `O(k)`;
- each visible toast owns one timeout;
- storage is `O(n)` until notifications dismiss.

Toast collections are usually small. A map plus ordered ID array is unnecessary unless profiling or unusually high volume justifies it.

## Testing strategy

Test public behavior rather than reducer implementation details.

### Core behavior

1. A descendant can publish a notification.
2. Input defaults are normalized correctly.
3. Multiple notifications preserve FIFO order.
4. A dismiss button removes only its notification.
5. A persistent notification creates no timeout.
6. A timed notification disappears after its duration.
7. Early manual dismissal clears the timer safely.
8. Only `maxVisible` notifications render.
9. A queued notification appears after a visible one dismisses.
10. Calling `useToast` outside the provider throws a useful error.

### Accessibility

- the viewport has a useful accessible label;
- informational and success messages use status semantics;
- errors use alert semantics only when urgency warrants it;
- dismiss buttons have names that identify their notification;
- publishing does not steal focus;
- meaning remains clear without color.

Use fake timers only for timeout behavior. Advance the clock intentionally and assert visible removal. Use real interaction utilities for publishing and dismissal.

## Common interview mistakes

- Starting with Context before basic list transitions work.
- Using the array index as the key.
- Creating all timers in one Effect without clear ownership.
- Forgetting to clear a timeout after manual dismissal.
- Storing timer IDs in rendering state.
- Exposing reducer `dispatch` through the public API.
- Using one assertive live region for every message.
- Moving focus to each new notification.
- Hiding the dismiss button until hover.
- Starting timers for notifications that are still queued and invisible.
- Implementing animations before add and dismiss behavior is correct.
- Making errors disappear too quickly to read or recover from.

## Senior follow-up discussion

### Why use Context here?

Publishing is needed by distant descendants, while the provider owns a single viewport and queue. Context distributes a small stable command API. The frequently changing toast collection does not need to be exposed to every consumer.

### Why does each ToastItem own its timer?

The timer lifetime matches the rendered notification lifetime. Effect cleanup naturally handles manual dismissal, queue movement, unmounting, and development setup/cleanup checks.

### Would you expose an imperative global function?

A module-level `toast()` function is convenient outside React components but introduces provider registration, multiple-root behavior, test isolation, and server-rendering concerns. Start with a Hook unless non-component callers are a real requirement.

### How would you update a loading toast after success?

Add an `updateToast(id, patch)` transition or a promise helper that owns one stable ID. Define whether updating refreshes the timer and how tone changes affect announcement behavior.

### How would you pause on hover and focus?

Pause when either hover or focus-within is active. Track remaining time from timestamps, clear the active timeout, and resume only after both pause reasons are gone.

## Interview-ready explanation

I first model notifications as records with stable IDs and implement immutable add and dismiss operations locally. Each rendered toast owns its timeout through an Effect, so manual dismissal and unmount cleanup are naturally safe. I then move transitions into a provider reducer and expose only stable `showToast` and `dismissToast` commands through Context. A portal renders one viewport, and only its visible slice mounts toast items, so queued records do not start timers early. Ordinary messages use polite status semantics, urgent errors may use alerts, and every toast has an explicit dismiss control. Animations, paused timers, deduplication, and imperative APIs are follow-up policies rather than prerequisites for the first working solution.

## Final checklist

- [ ] Notifications have stable provider-generated IDs.
- [ ] Add and dismiss transitions are immutable.
- [ ] The first local implementation works before Context is introduced.
- [ ] Persistent notifications create no timeout.
- [ ] Every active timeout has cleanup.
- [ ] The context exposes commands rather than internal state.
- [ ] Only visible queued items start timers.
- [ ] New notifications do not steal focus.
- [ ] Error announcements are assertive only when justified.
- [ ] Every notification can be dismissed explicitly.
