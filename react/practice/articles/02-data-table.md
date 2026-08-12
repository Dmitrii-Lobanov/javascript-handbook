# Sortable Data Table

## The interview prompt

Build a reusable data table that displays a collection of employees. Users must be able to:

- sort by name, role, or start date;
- filter rows with a text query;
- select individual rows and select all visible rows;
- move between pages;
- use the table with a keyboard and assistive technology.

Keep the implementation small enough for a 45–60 minute interview and explain how it would evolve for remote data or thousands of rows.

## What the interviewer is evaluating

The task is less about drawing rows than modeling transformations correctly. A strong solution demonstrates:

- one source of truth for input data and interaction state;
- derived filtering, sorting, and pagination rather than synchronized copies;
- immutable selection based on stable row IDs;
- a deterministic comparator that does not mutate props;
- correct native table and sort-button semantics;
- clear empty, selection, and pagination behavior;
- awareness of performance and server-side alternatives.

## Clarifying questions to ask

Before coding, establish the contract:

1. Which columns are sortable, and what is their default direction?
2. Does a repeated header click toggle ascending and descending, or also return to unsorted?
3. Which fields does filtering search, and is it case-sensitive?
4. Does “select all” mean all rows in the dataset, all filtered rows, or only the current page?
5. Should selection survive filtering and page changes?
6. Is pagination local or server-driven?
7. How should missing values sort?
8. Is a single-column sort sufficient?

For this walkthrough:

- sorting uses one column and toggles ascending/descending;
- filtering searches name and role case-insensitively;
- select all affects the current page;
- selection survives filtering and pagination;
- pagination and all transformations are local;
- page size is five rows.

## Requirements and deliberate non-requirements

### Required in the interview version

- Semantic `<table>`, `<thead>`, `<tbody>`, header cells, and captions.
- Sorting by three columns with a visible and announced direction.
- Text filtering.
- Stable row selection and select-all-visible behavior.
- Local pagination whose page remains valid after filtering.
- Empty results and a concise result summary.

### Explain, but do not necessarily finish

- Server-side filtering, sorting, and cursor pagination.
- Column resizing, reordering, and visibility.
- Multi-column sorting.
- Virtualization for very large collections.
- URL synchronization.
- Persisted selection across unloaded server pages.

## State model and invariants

Keep only user decisions in state:

```tsx
type SortKey = "name" | "role" | "startedAt";
type SortDirection = "ascending" | "descending";

type SortState = {
  key: SortKey;
  direction: SortDirection;
};

const [query, setQuery] = useState("");
const [sort, setSort] = useState<SortState>({
  key: "name",
  direction: "ascending",
});
const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
const [page, setPage] = useState(1);
```

Do not store `filteredRows`, `sortedRows`, or `pageRows`. They are derivations of current props and state:

```text
rows + query
      ↓
filtered rows + sort
      ↓
sorted rows + page
      ↓
visible rows
```

Important invariants:

- input `rows` are never mutated;
- selection is identified by `row.id`, not array position;
- page is always between `1` and `pageCount`;
- the header checkbox describes only visible rows;
- `aria-sort` exists only on the active sortable header.

## Component and helper design

For interview scope, one component plus pure helpers is enough:

```text
DataTable
├── filtering and sorting derivations
├── selection transitions
├── semantic table markup
└── pagination controls
```

Pure helpers make comparison rules independently testable:

```tsx
function compareEmployees(left: Employee, right: Employee, key: SortKey) {
  if (key === "startedAt") {
    return Date.parse(left.startedAt) - Date.parse(right.startedAt);
  }

  return left[key].localeCompare(right[key], undefined, {
    sensitivity: "base",
    numeric: true,
  });
}
```

Do not begin with a generic column-definition framework. Build the vertical slice, then describe how columns could become configuration if reuse actually requires it.

## Step-by-step React solution

### Step 1: render a semantic table

Start with data and correct HTML before adding state:

```tsx
type Employee = {
  id: string;
  name: string;
  role: string;
  startedAt: string;
};

function DataTable({ rows }: { rows: Employee[] }) {
  return (
    <table>
      <caption>Employees</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Role</th>
          <th scope="col">Start date</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={row.id}>
            <th scope="row">{row.name}</th>
            <td>{row.role}</td>
            <td><time dateTime={row.startedAt}>{formatDate(row.startedAt)}</time></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

Use stable IDs for keys. A table already gives assistive technologies relationships between cells and headers; replacing it with a grid of `<div>` elements would require rebuilding those semantics.

### Step 2: add sorting without mutating props

Put a real button inside each sortable header. The button provides keyboard activation without custom handlers:

```tsx
const [sort, setSort] = useState<SortState>({
  key: "name",
  direction: "ascending",
});

function requestSort(key: SortKey) {
  setSort(current => ({
    key,
    direction:
      current.key === key && current.direction === "ascending"
        ? "descending"
        : "ascending",
  }));
}
```

Derive a copied, sorted array:

```tsx
const sortedRows = [...rows].sort((left, right) => {
  const result = compareEmployees(left, right, sort.key);
  return sort.direction === "ascending" ? result : -result;
});
```

Never call `rows.sort(...)`: `sort` mutates the array supplied by the parent.

Expose the active direction through `aria-sort` on the `<th>`:

```tsx
<th scope="col" aria-sort={sort.key === "name" ? sort.direction : undefined}>
  <button type="button" onClick={() => requestSort("name")}>
    Name <span aria-hidden="true">{sortIcon("name", sort)}</span>
  </button>
</th>
```

### Step 3: derive filtered rows before sorting

Filtering is a render calculation, not an Effect:

```tsx
const normalizedQuery = query.trim().toLocaleLowerCase();

const filteredRows = rows.filter(row => {
  if (!normalizedQuery) return true;

  return [row.name, row.role].some(value =>
    value.toLocaleLowerCase().includes(normalizedQuery),
  );
});

const sortedRows = [...filteredRows].sort(/* comparator */);
```

```tsx
<label htmlFor="employee-filter">Filter employees</label>
<input
  id="employee-filter"
  type="search"
  value={query}
  onChange={event => {
    setQuery(event.target.value);
    setPage(1);
  }}
/>
```

Resetting the page belongs in the filter event because the event changes the result set. No Effect is needed to synchronize page with query.

### Step 4: paginate the derived result

Calculate the page range after filtering and sorting:

```tsx
const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
const currentPage = Math.min(page, pageCount);
const startIndex = (currentPage - 1) * pageSize;
const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);
```

Use `currentPage` rather than setting state during render. It keeps the rendered page valid if the parent replaces `rows` with a smaller collection.

```tsx
<button type="button" disabled={currentPage === 1} onClick={() => setPage(value => value - 1)}>
  Previous
</button>
<span>Page {currentPage} of {pageCount}</span>
<button type="button" disabled={currentPage === pageCount} onClick={() => setPage(value => value + 1)}>
  Next
</button>
```

### Step 5: add row selection using stable IDs

Never mutate the existing `Set`; return a new one so React receives a new state identity:

```tsx
function toggleRow(id: string) {
  setSelectedIds(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}
```

Derive header checkbox state from the current page:

```tsx
const allPageRowsSelected =
  pageRows.length > 0 && pageRows.every(row => selectedIds.has(row.id));
const somePageRowsSelected =
  pageRows.some(row => selectedIds.has(row.id)) && !allPageRowsSelected;
```

HTML checkboxes have an `indeterminate` DOM property rather than an attribute, so synchronize it through a ref:

```tsx
const selectAllRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (selectAllRef.current) {
    selectAllRef.current.indeterminate = somePageRowsSelected;
  }
}, [somePageRowsSelected]);
```

This is a valid Effect: it synchronizes React state with a DOM property that JSX cannot express declaratively.

### Step 6: finish empty states and announcements

Keep the table structure when there are no matching rows:

```tsx
<tbody>
  {pageRows.length ? rowsMarkup : (
    <tr>
      <td colSpan={4}>No employees match “{query}”.</td>
    </tr>
  )}
</tbody>
```

Provide concise status text outside the table:

```tsx
<p role="status" aria-live="polite">
  {sortedRows.length} employees. {selectedIds.size} selected.
</p>
```

Do not announce every visual detail. Native button, checkbox, table, and `aria-sort` semantics already communicate most behavior.

## Complete interview-sized implementation

```tsx
import { useEffect, useId, useRef, useState } from "react";

type Employee = {
  id: string;
  name: string;
  role: string;
  startedAt: string;
};

type SortKey = "name" | "role" | "startedAt";
type SortDirection = "ascending" | "descending";
type SortState = { key: SortKey; direction: SortDirection };

type Props = {
  rows: Employee[];
  pageSize?: number;
};

function compareEmployees(left: Employee, right: Employee, key: SortKey) {
  if (key === "startedAt") {
    return Date.parse(left.startedAt) - Date.parse(right.startedAt);
  }

  return left[key].localeCompare(right[key], undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function EmployeeTable({ rows, pageSize = 5 }: Props) {
  const filterId = useId();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState>({
    key: "name",
    direction: "ascending",
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [page, setPage] = useState(1);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = rows.filter(row =>
    !normalizedQuery
      ? true
      : [row.name, row.role].some(value =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        ),
  );

  const sortedRows = [...filteredRows].sort((left, right) => {
    const result = compareEmployees(left, right, sort.key);
    return sort.direction === "ascending" ? result : -result;
  });

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);
  const allPageRowsSelected =
    pageRows.length > 0 && pageRows.every(row => selectedIds.has(row.id));
  const somePageRowsSelected =
    pageRows.some(row => selectedIds.has(row.id)) && !allPageRowsSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = somePageRowsSelected;
    }
  }, [somePageRowsSelected]);

  function requestSort(key: SortKey) {
    setSort(current => ({
      key,
      direction:
        current.key === key && current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
    setPage(1);
  }

  function toggleRow(id: string) {
    setSelectedIds(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelectedIds(current => {
      const next = new Set(current);
      for (const row of pageRows) {
        allPageRowsSelected ? next.delete(row.id) : next.add(row.id);
      }
      return next;
    });
  }

  function sortIcon(key: SortKey) {
    if (sort.key !== key) return "↕";
    return sort.direction === "ascending" ? "↑" : "↓";
  }

  function sortHeader(label: string, key: SortKey) {
    return (
      <th scope="col" aria-sort={sort.key === key ? sort.direction : undefined}>
        <button type="button" onClick={() => requestSort(key)}>
          {label} <span aria-hidden="true">{sortIcon(key)}</span>
        </button>
      </th>
    );
  }

  return (
    <section aria-labelledby={`${filterId}-title`}>
      <h2 id={`${filterId}-title`}>Employees</h2>

      <label htmlFor={filterId}>Filter by name or role</label>
      <input
        id={filterId}
        type="search"
        value={query}
        onChange={event => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />

      <p role="status" aria-live="polite">
        {sortedRows.length} employees. {selectedIds.size} selected.
      </p>

      <table>
        <caption>Employee directory</caption>
        <thead>
          <tr>
            <th scope="col">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allPageRowsSelected}
                disabled={pageRows.length === 0}
                onChange={togglePage}
                aria-label="Select all employees on this page"
              />
            </th>
            {sortHeader("Name", "name")}
            {sortHeader("Role", "role")}
            {sortHeader("Start date", "startedAt")}
          </tr>
        </thead>
        <tbody>
          {pageRows.length > 0 ? (
            pageRows.map(row => (
              <tr key={row.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
                <th scope="row">{row.name}</th>
                <td>{row.role}</td>
                <td><time dateTime={row.startedAt}>{formatDate(row.startedAt)}</time></td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={4}>No employees match “{query}”.</td></tr>
          )}
        </tbody>
      </table>

      <nav aria-label="Employee table pages">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => setPage(value => Math.max(1, value - 1))}
        >
          Previous
        </button>
        <span>Page {currentPage} of {pageCount}</span>
        <button
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => setPage(value => Math.min(pageCount, value + 1))}
        >
          Next
        </button>
      </nav>
    </section>
  );
}
```

## Why the solution is structured this way

### Transformation order is explicit

The component filters, then sorts, then paginates. Changing that order changes behavior: paginating before filtering would search only the current slice, while paginating before sorting would sort each page independently.

### Derived collections are not state

Every displayed collection follows from `rows`, `query`, `sort`, and `page`. Storing intermediate arrays would add synchronization paths and stale-data bugs.

### Selection is independent of visibility

The `Set` holds stable IDs across pages and filters. The header checkbox operates only on `pageRows`, matching the stated requirement without erasing hidden selections.

### The only Effect synchronizes a DOM property

Filtering, sorting, and pagination require no Effects. The indeterminate checkbox is different: its DOM property cannot be represented as a normal JSX attribute.

## Accessibility and keyboard behavior

- Preserve native table markup and header scopes.
- Put sorting interactions in `<button>` elements inside headers.
- Set `aria-sort="ascending"` or `"descending"` only on the active header.
- Give every checkbox an accessible name.
- Use native disabled pagination buttons.
- Keep a caption, even if it is visually hidden in the finished design.
- Announce result and selection summaries without making every row update noisy.
- Do not add `role="grid"` unless implementing grid-specific focus and keyboard behavior.

## Performance and scale

For dozens or hundreds of local rows, direct derivation is normally adequate. If profiling finds expensive transformations, memoize the complete pipeline based on `rows`, `query`, and `sort` rather than storing its output.

For large datasets:

- move filtering, sorting, and pagination to the server;
- encode sort, filters, and page or cursor in the request and possibly URL;
- use request cancellation and cache keys that include every parameter;
- define whether select-all means loaded rows, filtered rows, or the entire server result;
- virtualize only when DOM size is the demonstrated bottleneck;
- consider `useDeferredValue` for expensive local filtering while keeping input urgent.

## Testing strategy

Essential integration tests:

1. Initial rows are ordered by name ascending.
2. Clicking Name toggles descending order and updates `aria-sort`.
3. Clicking another header activates its ascending sort.
4. Filtering searches name and role and resets to page one.
5. Empty filtering retains the table and shows the empty message.
6. Pagination displays the correct slice and disables boundary buttons.
7. Row selection survives page and filter changes.
8. Select-all selects and clears only visible rows.
9. The header checkbox becomes indeterminate for partial page selection.
10. Sort buttons and checkboxes work using keyboard interaction.

Unit-test `compareEmployees` separately if its null handling, locale rules, or domain ordering becomes complex.

## Common candidate mistakes

### Mutating the input array

`rows.sort()` changes parent-owned data. Sort a copy with `[...rows]` or `toSorted()` when supported by the target environment.

### Synchronizing derived arrays through Effects

This adds extra renders and permits intermediate stale UI. Calculate the pipeline during render.

### Using array indices as row identity

Sorting and filtering change positions. Selection and local row state must follow the record ID.

### Making the entire header clickable

A `<th onClick>` is not automatically keyboard operable. Use a button inside the header.

### Ambiguous select-all behavior

State the selection scope before implementation. “All” may mean page, filtered result, loaded records, or every server record.

### Premature generic abstraction

A column framework can consume the interview while hiding the essential reasoning. Prove one typed table first.

## Senior-level improvements

- Extract typed column definitions when multiple tables share rendering and comparison behavior.
- Synchronize filters, sorting, and page with URL search parameters.
- Add server-state caching and cancellation for remote transformations.
- Support explicit null ordering and locale-sensitive collators.
- Add column visibility and persisted user preferences.
- Use cursor pagination when offset pagination becomes unstable or expensive.
- Model whole-result selection as “all matching except excluded IDs” rather than enumerating unloaded IDs.
- Add virtualization with an accessibility and focus strategy.

## A 60-second solution explanation

I store only user decisions: query, sort descriptor, selected IDs, and page. The displayed rows are derived in a fixed pipeline—filter, copy and sort, then paginate—so there are no synchronized collection states or prop mutation. Selection uses a `Set` of stable IDs and select-all is explicitly scoped to the visible page. Native table elements preserve relationships, sort controls are buttons, and the active header exposes `aria-sort`. The only Effect synchronizes the checkbox’s indeterminate DOM property. For large remote data, I would move transformations to a cached server query and define whole-result selection separately.

## Likely interview follow-ups

### Why not put filtered rows in state?

They contain no independent information. Storing them duplicates `rows` and `query`, creates synchronization work, and can display stale results.

### When would you use `useMemo`?

After profiling shows that repeated filtering or sorting is meaningful and inputs often remain unchanged. It is an optimization, not a source of truth.

### How would server-side sorting change the component?

The sort descriptor becomes part of the resource key. A parent, route, or data Hook owns requests, cancellation, caching, loading, and errors; the table reports sort intent and renders the supplied page.

### How would you support all filtered rows across server pages?

Represent selection as an all-matching mode plus excluded IDs, tied to the active filter definition. The server action must interpret the same filter snapshot.

### Should this use `role="grid"`?

Not for ordinary sorting, checkboxes, and links. A grid role implies a more complex composite-widget keyboard model. Native table semantics are preferable unless spreadsheet-like cell navigation is required.

## Article summary

- Clarify transformation and selection semantics before coding.
- Store interaction choices; derive displayed collections.
- Filter, sort, and paginate in an explicit order.
- Never mutate input arrays.
- Identify rows by stable IDs.
- Preserve native table semantics and use buttons for sorting.
- Treat local and server-scale tables as different architectures.
- Measure before memoizing or virtualizing.

## Further reading

- [Derived and redundant state](/react/handbook/chapters/09-derived-and-redundant-state)
- [State ownership and lifting state](/react/handbook/chapters/17-state-ownership-and-lifting-state)
- [Accessible interactive components](/react/handbook/chapters/24-accessible-interactive-components)
- [List virtualization](/react/handbook/chapters/30-list-virtualization)
- [Choosing state-management tools](/react/handbook/chapters/40-choosing-state-management-tools)
