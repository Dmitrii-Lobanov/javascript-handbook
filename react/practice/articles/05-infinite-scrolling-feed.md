# Infinite Scrolling Feed

## The interview prompt

Build a feed that loads an initial page of items and appends another page when the user reaches the end. Display loading, error, empty, and completed states, and avoid sending the same request twice.

This tutorial starts with the smallest working version. We then add one business requirement at a time until it becomes a reliable interview solution.

## What we will build

```text
Basic manual feed
  ↓
Initial loading
  ↓
Cursor-based Load more
  ↓
Loading, error, empty, and end states
  ↓
Duplicate-request protection
  ↓
Item deduplication
  ↓
Cancellation
  ↓
IntersectionObserver
  ↓
Accessible fallback and retry
```

For a 40–55 minute interview, finish the manual Load more version first. Automatic loading is the final enhancement, not the foundation of the solution.

## Clarify the requirements

Ask a few questions before coding:

1. Does the API use an offset or an opaque cursor?
2. Does every item have a stable unique ID?
3. Should a failed next page keep the existing items visible?
4. Is a Load more button required as a fallback?
5. Can the query or filters change?
6. How large can the feed become?

For this tutorial:

- the API uses opaque cursors;
- existing items stay visible after a continuation error;
- pages may overlap, so items are deduplicated by ID;
- only one request may run at a time;
- active requests are cancelled during cleanup;
- a sentinel loads the next page automatically;
- a Load more button remains available.

## System design before implementation

Use GreatFrontEnd's [RADIO framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework) to structure the feed design:

```text
R — Requirements
A — Architecture
D — Data model
I — Interfaces
O — Optimizations and deep dives
```

For a live-coding interview, use RADIO to expose the important product and API decisions, then implement manual pagination before adding automatic observation.

### R — Requirements

The functional requirements are:

- load and render the first page of arbitrary records;
- request another page from an opaque continuation cursor;
- append rather than replace successful earlier pages;
- load automatically when a sentinel approaches the viewport;
- retain an explicit Load more fallback;
- display initial loading, continuation loading, empty, error, and completed states;
- prevent duplicate requests and duplicate rendered items;
- cancel obsolete work during cleanup;
- retry the operation that failed.

Important non-functional requirements are:

- **Correctness:** request timing and overlapping pages must not corrupt the feed.
- **Responsiveness:** loading another page must not block existing interaction.
- **Accessibility:** keyboard users retain an explicit continuation control and status changes are announced appropriately.
- **Reusability:** pagination behavior is independent from post, product, or notification presentation.
- **Scalability:** the design distinguishes network pagination from DOM-size management.
- **Recoverability:** later-page failures preserve already useful content.

Assume one feed instance, forward-only cursor pagination, stable item IDs, online use, and a moderate session length. Query changes, cache restoration, bidirectional loading, real-time insertions, virtualization, and SEO pagination are follow-up concerns.

### A — Architecture

Separate the product's data-access boundary from reusable feed coordination:

```text
Page API
    ↑ cursor, AbortSignal
    ↓ Page<T>
Data-access function
    ↑ injected as loadPage
    ↓ Promise<Page<T>>
InfiniteFeed<T>
├── page/request coordinator
├── accumulated item view
├── status and recovery UI
├── Load more control
└── IntersectionObserver sentinel
    ↓ renderItem(item)
Product-specific item view
```

Responsibilities:

| Boundary | Responsibility |
| --- | --- |
| Parent/data layer | Owns endpoint, authentication, filters, caching policy, and item rendering |
| `loadPage` | Converts a cursor into a page and supports cancellation |
| Feed coordinator | Owns accumulated items, cursor, request lifecycle, and retry intent |
| Manual control | Invokes the tested continuation operation explicitly |
| Observer | Detects proximity and invokes that same continuation operation |
| Item renderer | Displays a domain record without knowing pagination behavior |

One component is enough for the interview version. Extract a pagination Hook when multiple views need identical page coordination or when a server-state library becomes the true cache owner.

The request flow has two deliberate paths:

```text
mount
  → loadPage(undefined)
  → replace items
  → store next cursor

button click or sentinel intersection
  → verify cursor and request lock
  → loadPage(nextCursor)
  → append deduplicated items
  → store replacement cursor
```

Automatic loading is an input to `loadMore`, not a second pagination implementation.

### D — Data model

Separate server-originated page data, ephemeral request state, operational refs, and derived UI:

| Data | Origin | Owner | Representation |
| --- | --- | --- | --- |
| Loaded items `T[]` | Page API | Feed/cache | State |
| `nextCursor` | Page API | Feed/cache | State |
| Request status | Async lifecycle | Feed | State union |
| Failure information | Async lifecycle | Feed | Error state |
| In-flight lock | Client operation | Feed | Ref |
| Active controller | Client operation | Feed | Ref |
| Sentinel element | Rendered DOM | Feed | Ref |
| Empty/end/refresh conditions | Current state | Feed | Derived |

The cursor protocol has three meanings:

- `undefined` requests the initial page;
- a cursor value requests the next page;
- `null` means no page remains.

Stable item identity comes from `getItemId(item)`. Deduplication may keep a map or set of IDs while preserving the server's page order. An index is unsuitable because appending and overlapping pages change positions.

Maintain these invariants:

1. First-page loading replaces data; continuation loading appends data.
2. A continuation failure preserves successful earlier pages.
3. Stable IDs reconcile overlapping pages.
4. Obsolete requests cannot commit results.
5. Loading state renders feedback, while a synchronous lock prevents duplicate calls.
6. Automatic loading enhances the same manual `loadMore` operation.
7. A `null` cursor permanently disables continuation until the data source changes.
8. The parent controls domain rendering through `renderItem`.

### I — Interfaces

The server/data-access interface returns records plus continuation metadata:

```ts
type Page<T> = {
  items: readonly T[];
  nextCursor: string | null;
};

type LoadPage<T> = (
  cursor: string | undefined,
  signal?: AbortSignal,
) => Promise<Page<T>>;
```

An HTTP implementation might use:

```text
GET /api/feed?cursor=<opaque cursor>&limit=20
→ {
    items: T[],
    nextCursor: string | null
  }
```

The cursor is opaque to the client. The server owns stable ordering and decides what continuation means when records are inserted or deleted.

The component API supplies data access, stable identity, presentation, and accessibility:

```ts
type InfiniteFeedProps<T> = {
  loadPage: LoadPage<T>;
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
  emptyMessage?: string;
};
```

| Interface category | Props |
| --- | --- |
| Data access | `loadPage` |
| Identity | `getItemId` |
| Presentation | `renderItem`, `emptyMessage` |
| Accessibility | `ariaLabel` |

If filters or search terms change, they form part of data-source identity. Prefer a new stable `loadPage` function or an explicit query-key prop with defined reset behavior rather than an artificial reload counter.

### O — Optimizations and deep dives

Focus on behavior unique to incremental feeds.

#### Use cursor pagination for changing collections

Offset pages can shift when records are inserted or removed, producing duplicates or omissions. A cursor tied to deterministic server ordering provides a continuation point, but the server must still define consistency semantics.

#### Prevent duplicate work synchronously

Rendered loading state may not update before a second observer callback or click runs. Use a ref as an immediate in-flight lock while state independently drives visible feedback.

#### Combine cancellation with ownership checks

`AbortController` saves supported work, but abort alone does not prove that later async processing cannot resolve. Associate results with the current request or data-source generation before committing them.

#### Deduplicate without hiding server defects

Deduplicate overlapping pages by stable ID while preserving order. Client deduplication prevents duplicate rendering; it cannot recover items omitted by unstable server ordering.

#### Tune observation deliberately

Use `rootMargin` to start loading shortly before the sentinel appears. Disconnect observers during cleanup, do not observe after `nextCursor` becomes `null`, and keep the request lock because intersection callbacks may fire repeatedly.

#### Preserve user position and recovery

Appending should not move focus automatically. Keep existing items visible during continuation loading and failure. Retry the failed page, and restore loaded pages plus scroll position when users navigate away and return if the product requires it.

#### Keep a manual fallback

The Load more button supports keyboard users, environments where observation is unavailable, explicit recovery, and deterministic testing. Automatic behavior should not remove user control.

#### Separate pagination from virtualization

Pagination controls how much data is requested. Virtualization controls how many DOM nodes are mounted. A long session can still create a huge DOM even when every network page is small; use virtualization only after addressing focus, accessibility, scroll restoration, and measurement complexity.

#### Consider when infinite scrolling is the wrong product

Traditional pagination can be better for goal-oriented search, stable position, sharing, footer access, SEO, and returning to a known result page. Infinite loading is a product choice, not a default optimization.

With RADIO established, define the concrete types and implement manual pagination before observers or production hardening.

## Define the types first

The feed should work with posts, products, notifications, or any other item type.

```tsx
import type { ReactNode } from "react";

export type Page<T> = {
  items: readonly T[];
  nextCursor: string | null;
};

type LoadPage<T> = (
  cursor: string | undefined,
  signal?: AbortSignal,
) => Promise<Page<T>>;

type InfiniteFeedProps<T> = {
  loadPage: LoadPage<T>;
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
  emptyMessage?: string;
};
```

The pagination contract is deliberately small:

- `undefined` requests the first page;
- a string requests the page after that cursor;
- `null` means the server has no more pages;
- `getItemId` gives every item stable identity;
- `renderItem` keeps pagination independent from presentation.

## Step 1 — Build the most basic feed

Ignore networking initially. Prove that generic items can render correctly.

```tsx
type BasicFeedProps<T> = {
  items: readonly T[];
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
};

function BasicFeed<T>({
  items,
  getItemId,
  renderItem,
}: BasicFeedProps<T>) {
  return (
    <ul>
      {items.map(item => (
        <li key={getItemId(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

This establishes two important rules before async logic appears:

- the feed does not assume an employee, post, or product shape;
- list identity comes from data, never from the array index.

## Step 2 — Load the first page

Move the items into component state and load the first page after mounting.

```tsx
function InfiniteFeed<T>({
  loadPage,
  getItemId,
  renderItem,
  ariaLabel,
}: InfiniteFeedProps<T>) {
  const [items, setItems] = useState<readonly T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();

  useEffect(() => {
    loadPage(undefined).then(page => {
      setItems(page.items);
      setNextCursor(page.nextCursor);
    });
  }, [loadPage]);

  return (
    <section aria-label={ariaLabel}>
      <ul>
        {items.map(item => (
          <li key={getItemId(item)}>{renderItem(item)}</li>
        ))}
      </ul>
    </section>
  );
}
```

The Effect synchronizes this component with an external data source. The parent should pass a stable `loadPage` callback; otherwise a new function identity correctly looks like a new data source and reloads the feed.

This version intentionally has no loading or error UI yet. Add those only after the successful path is understandable.

## Step 3 — Add a manual Load more button

The API returns the cursor needed for the next request. Append the returned items instead of replacing the feed.

```tsx
async function loadMore() {
  if (typeof nextCursor !== "string") return;

  const page = await loadPage(nextCursor);

  setItems(current => [...current, ...page.items]);
  setNextCursor(page.nextCursor);
}
```

Render the button only while another page exists:

```tsx
{nextCursor !== null && (
  <button type="button" onClick={loadMore}>
    Load more
  </button>
)}

{nextCursor === null && <p>You have reached the end.</p>}
```

Use a functional state update because the next array depends on the items already committed when the request finishes.

## First working implementation

At this point, assemble the first complete version:

```tsx
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export type Page<T> = {
  items: readonly T[];
  nextCursor: string | null;
};

type InfiniteFeedProps<T> = {
  loadPage: (
    cursor: string | undefined,
  ) => Promise<Page<T>>;
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
};

export function InfiniteFeed<T>({
  loadPage,
  getItemId,
  renderItem,
  ariaLabel,
}: InfiniteFeedProps<T>) {
  const [items, setItems] = useState<readonly T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();

  useEffect(() => {
    loadPage(undefined).then(page => {
      setItems(page.items);
      setNextCursor(page.nextCursor);
    });
  }, [loadPage]);

  async function loadMore() {
    if (typeof nextCursor !== "string") return;

    const page = await loadPage(nextCursor);
    setItems(current => [...current, ...page.items]);
    setNextCursor(page.nextCursor);
  }

  return (
    <section aria-label={ariaLabel}>
      <ul>
        {items.map(item => (
          <li key={getItemId(item)}>{renderItem(item)}</li>
        ))}
      </ul>

      {nextCursor !== null && (
        <button type="button" onClick={loadMore}>
          Load more
        </button>
      )}

      {nextCursor === null && <p>You have reached the end.</p>}
    </section>
  );
}
```

This is the correct first interview checkpoint. It loads, appends, and stops when the cursor becomes `null`.

Now explain its limitations:

- it has no loading, empty, or error states;
- repeated clicks can start duplicate requests;
- overlapping pages can render duplicate items;
- requests continue after unmount;
- loading is manual.

We will fix each limitation separately.

## Step 4 — Add explicit request states

A Boolean cannot distinguish idle, loading, and failed states clearly. Use a small status union:

```tsx
type Status = "idle" | "loading" | "error";

const [status, setStatus] = useState<Status>("idle");
const [error, setError] = useState<Error | null>(null);
const [hasLoadedFirstPage, setHasLoadedFirstPage] = useState(false);
```

Wrap each request:

```tsx
setStatus("loading");
setError(null);

try {
  const page = await loadPage(cursor);
  // Commit the successful page.
  setStatus("idle");
} catch (error) {
  setError(
    error instanceof Error
      ? error
      : new Error("Could not load the feed."),
  );
  setStatus("error");
}
```

`hasLoadedFirstPage` distinguishes an initial failure from a later-page failure. That matters because retry must call a different operation:

```tsx
function retry() {
  if (hasLoadedFirstPage) loadMore();
  else loadFirstPage();
}
```

Keep existing items visible when loading or retrying a continuation. A failed next page does not invalidate pages that already succeeded.

## Step 5 — Extract first-page and next-page operations

Give the two business operations explicit names:

```tsx
const loadFirstPage = useCallback(async () => {
  // Request cursor: undefined.
  // Replace existing items.
}, [loadPage]);

const loadMore = useCallback(async () => {
  // Request nextCursor.
  // Append to existing items.
}, [loadPage, nextCursor]);
```

The mount Effect now only starts the first operation:

```tsx
useEffect(() => {
  loadFirstPage();
}, [loadFirstPage]);
```

This is clearer than changing an artificial counter to force the Effect to rerun. Initial retry directly calls `loadFirstPage`; continuation retry directly calls `loadMore`.

## Step 6 — Prevent duplicate requests

Checking `status === "loading"` is not enough. Two observer callbacks or quick clicks can run before React commits the state update.

Use a ref as a synchronous lock:

```tsx
const inFlightRef = useRef(false);

async function requestPage() {
  if (inFlightRef.current) return;

  inFlightRef.current = true;

  try {
    // Await the request.
  } finally {
    inFlightRef.current = false;
  }
}
```

Updating a ref does not render the component, but the new value is available immediately to the next callback.

State and the ref solve different problems:

- `status` renders loading and error UI;
- `inFlightRef` enforces the request invariant synchronously.

## Step 7 — Deduplicate appended items

Cursor pages may overlap. Deduplicate by stable item ID before appending:

```tsx
function appendUnique<T>(
  current: readonly T[],
  incoming: readonly T[],
  getItemId: (item: T) => string,
) {
  const knownIds = new Set(current.map(getItemId));
  const uniqueIncoming = incoming.filter(item => {
    const id = getItemId(item);

    if (knownIds.has(id)) return false;

    knownIds.add(id);
    return true;
  });

  return [...current, ...uniqueIncoming];
}
```

Use it inside the functional update:

```tsx
setItems(current =>
  appendUnique(current, page.items, getItemId),
);
```

Client deduplication prevents duplicate rendering. It cannot recover items omitted by an inconsistent server ordering policy.

## Step 8 — Cancel obsolete requests

Store the active controller:

```tsx
const requestRef = useRef<AbortController | null>(null);
```

Create one for each request:

```tsx
const controller = new AbortController();
requestRef.current = controller;

const page = await loadPage(cursor, controller.signal);
```

Abort during Effect cleanup:

```tsx
useEffect(() => {
  loadFirstPage();

  return () => {
    requestRef.current?.abort();
    requestRef.current = null;
    inFlightRef.current = false;
  };
}, [loadFirstPage]);
```

Check the signal before committing:

```tsx
if (controller.signal.aborted) return;
```

Abort is cleanup, not a complete ordering strategy. If several query generations can coexist, also associate responses with a request or query ID before committing them.

## Step 9 — Add IntersectionObserver

The manual button already proves pagination works. Automatic loading now becomes a small enhancement.

Add an empty sentinel after the list:

```tsx
const sentinelRef = useRef<HTMLDivElement>(null);

<div
  ref={sentinelRef}
  className="feed__sentinel"
  aria-hidden="true"
/>
```

Observe it only while the feed is idle and another cursor exists:

```tsx
useEffect(() => {
  const sentinel = sentinelRef.current;

  if (
    !sentinel ||
    status !== "idle" ||
    typeof nextCursor !== "string"
  ) {
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      if (entries[0]?.isIntersecting) loadMore();
    },
    { rootMargin: "300px 0px" },
  );

  observer.observe(sentinel);
  return () => observer.disconnect();
}, [loadMore, nextCursor, status]);
```

`rootMargin` starts preloading before the sentinel becomes visible. The observer disconnects when its inputs change and on unmount.

Do not remove the synchronous request lock. Observer callbacks may occur more than once.

## Step 10 — Add business UI and accessibility

Derive the final display states:

```tsx
const loading = status === "loading";
const exhausted = hasLoadedFirstPage && nextCursor === null;
const empty = exhausted && items.length === 0;
```

Render each state near the feed:

```tsx
{empty && <p>{emptyMessage}</p>}

{error && (
  <div role="alert">
    <p>{error.message}</p>
    <button type="button" onClick={retry}>
      Try again
    </button>
  </div>
)}

{loading && (
  <p role="status">
    {hasLoadedFirstPage ? "Loading more items…" : "Loading feed…"}
  </p>
)}

{!error && !exhausted && hasLoadedFirstPage && (
  <button type="button" onClick={loadMore} disabled={loading}>
    Load more
  </button>
)}

{exhausted && !empty && <p>You have reached the end.</p>}
```

The Load more button remains important even with automatic loading:

- it works when `IntersectionObserver` is unavailable;
- it gives keyboard users explicit control;
- it provides a stable place for retry and status feedback;
- it makes the pagination behavior testable without scrolling.

Do not move focus automatically when items append. Keep the user’s current position stable.

## Complete solution

```tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

export type Page<T> = {
  items: readonly T[];
  nextCursor: string | null;
};

type LoadPage<T> = (
  cursor: string | undefined,
  signal?: AbortSignal,
) => Promise<Page<T>>;

type InfiniteFeedProps<T> = {
  loadPage: LoadPage<T>;
  getItemId: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  ariaLabel: string;
  emptyMessage?: string;
};

type Status = "idle" | "loading" | "error";

function appendUnique<T>(
  current: readonly T[],
  incoming: readonly T[],
  getItemId: (item: T) => string,
) {
  const knownIds = new Set(current.map(getItemId));
  const uniqueIncoming = incoming.filter(item => {
    const id = getItemId(item);

    if (knownIds.has(id)) return false;

    knownIds.add(id);
    return true;
  });

  return [...current, ...uniqueIncoming];
}

export function InfiniteFeed<T>({
  loadPage,
  getItemId,
  renderItem,
  ariaLabel,
  emptyMessage = "No items found.",
}: InfiniteFeedProps<T>) {
  const [items, setItems] = useState<readonly T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [hasLoadedFirstPage, setHasLoadedFirstPage] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlightRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);

  const loadFirstPage = useCallback(async () => {
    if (inFlightRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;
    inFlightRef.current = true;
    setItems([]);
    setNextCursor(undefined);
    setHasLoadedFirstPage(false);
    setStatus("loading");
    setError(null);

    try {
      const page = await loadPage(undefined, controller.signal);

      if (controller.signal.aborted) return;

      setItems(page.items);
      setNextCursor(page.nextCursor);
      setHasLoadedFirstPage(true);
      setStatus("idle");
    } catch (error) {
      if (controller.signal.aborted) return;

      setError(
        error instanceof Error
          ? error
          : new Error("Could not load the feed."),
      );
      setStatus("error");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        inFlightRef.current = false;
      }
    }
  }, [loadPage]);

  useEffect(() => {
    loadFirstPage();

    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
      inFlightRef.current = false;
    };
  }, [loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || typeof nextCursor !== "string") return;

    const controller = new AbortController();
    requestRef.current = controller;
    inFlightRef.current = true;
    setStatus("loading");
    setError(null);

    try {
      const page = await loadPage(nextCursor, controller.signal);

      if (controller.signal.aborted) return;

      setItems(current =>
        appendUnique(current, page.items, getItemId),
      );
      setNextCursor(page.nextCursor);
      setStatus("idle");
    } catch (error) {
      if (controller.signal.aborted) return;

      setError(
        error instanceof Error
          ? error
          : new Error("Could not load more items."),
      );
      setStatus("error");
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        inFlightRef.current = false;
      }
    }
  }, [getItemId, loadPage, nextCursor]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      status !== "idle" ||
      typeof nextCursor !== "string"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, nextCursor, status]);

  const loading = status === "loading";
  const exhausted = hasLoadedFirstPage && nextCursor === null;
  const empty = exhausted && items.length === 0;

  function retry() {
    if (hasLoadedFirstPage) loadMore();
    else loadFirstPage();
  }

  return (
    <section className="feed" aria-label={ariaLabel}>
      {items.length > 0 && (
        <ul className="feed__list">
          {items.map(item => (
            <li className="feed__item" key={getItemId(item)}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}

      {empty && <p>{emptyMessage}</p>}

      <div
        ref={sentinelRef}
        className="feed__sentinel"
        aria-hidden="true"
      />

      <div className="feed__controls">
        {error && (
          <div role="alert">
            <p>{error.message}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {loading && (
          <p role="status">
            {hasLoadedFirstPage ? "Loading more items…" : "Loading feed…"}
          </p>
        )}

        {!error && !exhausted && hasLoadedFirstPage && (
          <button type="button" onClick={loadMore} disabled={loading}>
            Load more
          </button>
        )}

        {exhausted && !empty && <p>You have reached the end.</p>}
      </div>
    </section>
  );
}
```

## Example usage

```tsx
import { useCallback } from "react";
import { InfiniteFeed } from "./InfiniteFeed";
import type { Page } from "./InfiniteFeed";

type Post = {
  id: string;
  author: string;
  body: string;
};

async function fetchPosts(
  cursor: string | undefined,
  signal?: AbortSignal,
): Promise<Page<Post>> {
  const search = new URLSearchParams();
  if (cursor) search.set("cursor", cursor);

  const response = await fetch(`/api/posts?${search}`, { signal });

  if (!response.ok) {
    throw new Error("Could not load posts.");
  }

  return response.json();
}

export function PostFeed() {
  const loadPage = useCallback(fetchPosts, []);
  const getPostId = useCallback((post: Post) => post.id, []);
  const renderPost = useCallback(
    (post: Post) => (
      <article>
        <h2>{post.author}</h2>
        <p>{post.body}</p>
      </article>
    ),
    [],
  );

  return (
    <InfiniteFeed
      loadPage={loadPage}
      getItemId={getPostId}
      renderItem={renderPost}
      ariaLabel="Recent posts"
      emptyMessage="No posts yet."
    />
  );
}
```

## Minimal CSS

```css
.feed {
  max-width: 44rem;
  margin-inline: auto;
}

.feed__list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.feed__item {
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
}

.feed__sentinel {
  height: 1px;
}

.feed__controls {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding-block: 1.5rem;
}
```

## Testing strategy

Test the behavior in the same order it was implemented:

1. The first page loads after mount.
2. Clicking Load more sends the current cursor.
3. New items append instead of replacing previous items.
4. A null cursor displays the end state.
5. Loading and errors produce visible status messages.
6. A failed continuation keeps existing items visible.
7. Retry repeats the correct operation.
8. Duplicate clicks or observer events start only one request.
9. Overlapping item IDs are rendered once.
10. Unmounting aborts the active request.
11. The observer calls `loadMore` after intersection.
12. Observer cleanup disconnects it.

Mock `IntersectionObserver` at the browser boundary, then assert appended content rather than private state variables.

## Complexity

For `n` existing items and `m` incoming items:

- rendering is `O(n)`;
- deduplication is `O(n + m)` average;
- stored item data is `O(n)`;
- the observer itself watches one sentinel and is not the scaling bottleneck.

As the feed grows, mounted DOM size becomes the larger concern. Pagination limits fetched data per request; virtualization limits rendered DOM nodes. They solve different problems.

## Common mistakes

- Starting with `IntersectionObserver` before manual pagination works.
- Using the array index as an item key.
- Replacing the whole feed with every new page.
- Treating loading state as a synchronous request lock.
- Appending overlapping pages without deduplication.
- Hiding successful earlier pages after a continuation error.
- Retrying the first page after a later page fails.
- Forgetting request and observer cleanup.
- Loading again after `nextCursor` becomes `null`.
- Removing the Load more fallback.
- Moving focus automatically when new items append.
- Assuming infinite scrolling is always better than pagination.

## Production improvements to discuss

Do not implement all of these during the interview. Mention them after the core works:

- Add query and filter values to the data-source identity.
- Reject stale responses with request-generation IDs.
- Use a server-state library for caching, retries, and query deduplication.
- Restore loaded pages and scroll position after navigation.
- Virtualize very long feeds.
- Define deterministic server ordering and cursor consistency.
- Reconcile real-time insertions without moving content unexpectedly.
- Provide crawlable pagination when SEO or direct linking matters.
- Measure an appropriate preloading distance instead of guessing.

## How to explain the solution in 60 seconds

I first build manual cursor pagination: load the first page, store its next cursor, and append later pages with a functional state update. Then I add explicit request states and separate `loadFirstPage` from `loadMore`, so retry behavior is clear. A ref acts as a synchronous in-flight lock because React loading state may not commit before another callback runs. Each request owns an AbortController, and cleanup aborts obsolete work. Incoming pages are deduplicated by stable item ID. Finally, an IntersectionObserver watches one sentinel and calls the same tested `loadMore` function, while a real button remains available for keyboard users and failure recovery. A null cursor is the exhausted state.

## Likely interview follow-ups

### Why use cursor pagination?

Offsets can shift when records are inserted or deleted. An opaque cursor represents the server’s continuation point, provided the server also defines stable ordering.

### Why use a ref for the request lock?

The ref changes synchronously, so a second callback sees the lock before React commits the loading state.

### Why keep the Load more button?

It provides an explicit keyboard-accessible fallback, supports environments where automatic observation fails, and makes retry behavior clearer.

### Does AbortController completely solve stale responses?

No. A transport or later async stage may ignore abort. When data-source generations can overlap, validate request identity before committing the response.

### Why deduplicate on the client?

Adjacent pages may overlap. ID-based deduplication prevents duplicate rendering, although the server still owns consistent ordering and completeness.

### When should pagination replace infinite scrolling?

Prefer pagination when users need stable locations, direct links, a reachable footer, reliable back navigation, comprehensive searching, or a clear sense of progress.
