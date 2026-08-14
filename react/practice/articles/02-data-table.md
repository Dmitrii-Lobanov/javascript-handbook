# Sortable Data Table

## The interview prompt

Build a reusable, typed data table that can display any record shape. The caller supplies rows, stable row identity, and column definitions. Users must be able to:

- sort columns that opt into sorting;
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
- filtering searches columns that opt into filtering;
- select all affects the current page;
- selection survives filtering and pagination;
- pagination and all transformations are local;
- page size is five rows.

## Requirements and deliberate non-requirements

### Required in the interview version

- Semantic `<table>`, `<thead>`, `<tbody>`, header cells, and captions.
- Configurable rendering plus opt-in sorting and filtering per column.
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

## Type contract

Define the reusable boundary before writing component logic. Every later snippet uses these types:

```tsx
import type { ReactNode } from "react";

type RowId = string | number;
type SortValue = string | number | Date;
type SortDirection = "ascending" | "descending";

type SortState = {
  columnId: string;
  direction: SortDirection;
};

type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
  searchValue?: (row: T) => string;
  rowHeader?: boolean;
};

type DataTableProps<T> = {
  rows: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => RowId;
  getRowLabel: (row: T) => string;
  caption: string;
  initialSort?: SortState;
  pageSize?: number;
};
```

The roles are deliberately separate:

- `T` is the caller's record type, such as `Employee`, `Product`, or `Invoice`.
- `ColumnDef<T>` contains domain-specific accessors and cell rendering.
- `DataTableProps<T>` contains generic table configuration.
- `getRowId` avoids assuming that every record has an `id` property.
- `getRowLabel` supplies an accessible name for its selection checkbox.
- `SortValue` limits sorting to values the shared comparator understands.

For example, one caller could supply this model without changing the table:

```tsx
type Product = {
  sku: string;
  title: string;
  price: number;
  available: boolean;
};
```

## State model and invariants

Keep only user decisions in state:

```tsx
const [query, setQuery] = useState("");
const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
const [selectedIds, setSelectedIds] = useState<Set<RowId>>(() => new Set());
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
- selection is identified by `getRowId(row)`, not by a hard-coded field or array position;
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

The shared comparator supports the `SortValue` union from the type contract:

```tsx
function compareValues(left: SortValue, right: SortValue) {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: "base",
    numeric: true,
  });
}
```

The caller owns domain knowledge—how to display a value, which value should be compared, and which text should be searched. The table owns only generic transformations, selection, pagination, and semantics.

## Step-by-step React solution

### Step 1: render a semantic table

Start with the generic contract and correct HTML before adding state:

```tsx
function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
}: DataTableProps<T>) {
  return (
    <table>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map(column => (
            <th scope="col" key={column.id}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr key={getRowId(row)}>
            {columns.map(column =>
              column.rowHeader ? (
                <th scope="row" key={column.id}>{column.cell(row)}</th>
              ) : (
                <td key={column.id}>{column.cell(row)}</td>
              ),
            )}
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
const [sort, setSort] = useState<SortState | null>(initialSort ?? null);

function requestSort(columnId: string) {
  setSort(current => ({
    columnId,
    direction:
      current?.columnId === columnId && current.direction === "ascending"
        ? "descending"
        : "ascending",
  }));
}
```

Derive a copied, sorted array:

```tsx
const sortColumn = sort
  ? columns.find(column => column.id === sort.columnId)
  : undefined;

const sortedRows =
  sort && sortColumn?.sortValue
    ? [...rows].sort((left, right) => {
        const result = compareValues(
          sortColumn.sortValue!(left),
          sortColumn.sortValue!(right),
        );
        return sort.direction === "ascending" ? result : -result;
      })
    : [...rows];
```

Never call `rows.sort(...)`: `sort` mutates the array supplied by the parent.

Expose the active direction through `aria-sort` on the `<th>`:

```tsx
<th scope="col" aria-sort={sort?.columnId === column.id ? sort.direction : undefined}>
  <button type="button" onClick={() => requestSort(column.id)}>
    {column.header}
  </button>
</th>
```

### Step 3: derive filtered rows before sorting

Filtering is a render calculation, not an Effect:

```tsx
const normalizedQuery = query.trim().toLocaleLowerCase();

const filteredRows = rows.filter(row => {
  if (!normalizedQuery) return true;

  return columns.some(column => {
    const value = column.searchValue?.(row);
    return value?.toLocaleLowerCase().includes(normalizedQuery) ?? false;
  });
});

const sortedRows = [...filteredRows].sort(/* comparator */);
```

```tsx
<label htmlFor="table-filter">Filter rows</label>
<input
  id="table-filter"
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
function toggleRow(id: RowId) {
  setSelectedIds(current => {
    const next = new Set(current);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
}
```

Derive header checkbox state from the current page:

```tsx
const pageIds = pageRows.map(getRowId);
const allPageRowsSelected =
  pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
const somePageRowsSelected =
  pageIds.some(id => selectedIds.has(id)) && !allPageRowsSelected;
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
      <td colSpan={columns.length + 1}>No rows match “{query}”.</td>
    </tr>
  )}
</tbody>
```

Provide concise status text outside the table:

```tsx
<p role="status" aria-live="polite">
  {sortedRows.length} rows. {selectedIds.size} selected.
</p>
```

Do not announce every visual detail. Native button, checkbox, table, and `aria-sort` semantics already communicate most behavior.

## Complete interview-sized implementation

The component below knows nothing about employees, products, invoices, or any other domain. All domain behavior enters through typed props.

```tsx
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type RowId = string | number;
type SortValue = string | number | Date;
type SortDirection = "ascending" | "descending";
type SortState = { columnId: string; direction: SortDirection };

export type ColumnDef<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
  searchValue?: (row: T) => string;
  rowHeader?: boolean;
};

type DataTableProps<T> = {
  rows: readonly T[];
  columns: readonly ColumnDef<T>[];
  getRowId: (row: T) => RowId;
  getRowLabel: (row: T) => string;
  caption: string;
  initialSort?: SortState;
  pageSize?: number;
};

function compareValues(left: SortValue, right: SortValue) {
  if (left instanceof Date && right instanceof Date) {
    return left.getTime() - right.getTime();
  }

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    sensitivity: "base",
    numeric: true,
  });
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  getRowLabel,
  caption,
  initialSort,
  pageSize = 5,
}: DataTableProps<T>) {
  const filterId = useId();
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(initialSort ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<RowId>>(
    () => new Set(),
  );
  const [page, setPage] = useState(1);

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = rows.filter(row => {
    if (!normalizedQuery) return true;

    return columns.some(column => {
      const value = column.searchValue?.(row);
      return value?.toLocaleLowerCase().includes(normalizedQuery) ?? false;
    });
  });

  const sortColumn = sort
    ? columns.find(column => column.id === sort.columnId)
    : undefined;

  const sortedRows =
    sort && sortColumn?.sortValue
      ? [...filteredRows].sort((left, right) => {
          const result = compareValues(
            sortColumn.sortValue!(left),
            sortColumn.sortValue!(right),
          );
          return sort.direction === "ascending" ? result : -result;
        })
      : [...filteredRows];

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(startIndex, startIndex + pageSize);
  const pageIds = pageRows.map(getRowId);
  const allPageRowsSelected =
    pageIds.length > 0 && pageIds.every(id => selectedIds.has(id));
  const somePageRowsSelected =
    pageIds.some(id => selectedIds.has(id)) && !allPageRowsSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = somePageRowsSelected;
    }
  }, [somePageRowsSelected]);

  function requestSort(columnId: string) {
    setSort(current => ({
      columnId,
      direction:
        current?.columnId === columnId &&
        current.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
    setPage(1);
  }

  function toggleRow(id: RowId) {
    setSelectedIds(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function togglePage() {
    setSelectedIds(current => {
      const next = new Set(current);
      for (const id of pageIds) {
        allPageRowsSelected ? next.delete(id) : next.add(id);
      }
      return next;
    });
  }

  return (
    <section aria-labelledby={`\${filterId}-title`}>
      <h2 id={`\${filterId}-title`}>{caption}</h2>

      <label htmlFor={filterId}>Filter rows</label>
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
        {sortedRows.length} rows. {selectedIds.size} selected.
      </p>

      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allPageRowsSelected}
                disabled={pageRows.length === 0}
                onChange={togglePage}
                aria-label="Select all rows on this page"
              />
            </th>
            {columns.map(column => {
              const active = sort?.columnId === column.id;
              return (
                <th
                  scope="col"
                  key={column.id}
                  aria-sort={
                    active && column.sortValue
                      ? sort.direction
                      : undefined
                  }
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => requestSort(column.id)}
                    >
                      {column.header}
                      <span aria-hidden="true">
                        {active
                          ? sort.direction === "ascending"
                            ? " ↑"
                            : " ↓"
                          : " ↕"}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pageRows.length > 0 ? (
            pageRows.map(row => {
              const rowId = getRowId(row);
              return (
                <tr key={rowId}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(rowId)}
                      onChange={() => toggleRow(rowId)}
                      aria-label={`Select \${getRowLabel(row)}`}
                    />
                  </td>
                  {columns.map(column =>
                    column.rowHeader ? (
                      <th scope="row" key={column.id}>
                        {column.cell(row)}
                      </th>
                    ) : (
                      <td key={column.id}>{column.cell(row)}</td>
                    ),
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + 1}>
                No rows match “{query}”.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav aria-label={`\${caption} pages`}>
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
          onClick={() =>
            setPage(value => Math.min(pageCount, value + 1))
          }
        >
          Next
        </button>
      </nav>
    </section>
  );
}
```

Here is one employee configuration. A product or invoice table supplies a different row type and column array without changing `DataTable`:

```tsx
type Employee = {
  id: string;
  name: string;
  role: string;
  startedAt: string;
};

const employeeColumns = [
  {
    id: "name",
    header: "Name",
    cell: (employee: Employee) => employee.name,
    sortValue: (employee: Employee) => employee.name,
    searchValue: (employee: Employee) => employee.name,
    rowHeader: true,
  },
  {
    id: "role",
    header: "Role",
    cell: (employee: Employee) => employee.role,
    sortValue: (employee: Employee) => employee.role,
    searchValue: (employee: Employee) => employee.role,
  },
  {
    id: "startedAt",
    header: "Start date",
    cell: (employee: Employee) => (
      <time dateTime={employee.startedAt}>
        {new Intl.DateTimeFormat(undefined, {
          dateStyle: "medium",
        }).format(new Date(employee.startedAt))}
      </time>
    ),
    sortValue: (employee: Employee) => new Date(employee.startedAt),
  },
] satisfies readonly ColumnDef<Employee>[];

<DataTable
  rows={employees}
  columns={employeeColumns}
  getRowId={employee => employee.id}
  getRowLabel={employee => employee.name}
  caption="Employee directory"
  initialSort={{ columnId: "name", direction: "ascending" }}
/>;
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

1. The configured initial sort is applied through the column's `sortValue`.
2. Clicking a sortable header toggles direction and updates `aria-sort`.
3. Clicking another header activates its ascending sort.
4. Filtering searches only columns with `searchValue` and resets to page one.
5. Empty filtering retains the table and shows the empty message.
6. Pagination displays the correct slice and disables boundary buttons.
7. Row selection survives page and filter changes.
8. Select-all selects and clears only visible rows.
9. The header checkbox becomes indeterminate for partial page selection.
10. Sort buttons and checkboxes work using keyboard interaction.

Unit-test `compareValues` and domain-specific column accessors separately when null handling, locale rules, or custom ordering becomes complex.

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

### Overengineering the generic abstraction

The useful generic boundary is small: identity plus column accessors and renderers. Avoid recreating a full table library with plugins, nested headers, and dozens of options during the interview.

## Senior-level improvements

- Add reusable column factories for repeated domain patterns such as currency, dates, and status badges.
- Synchronize filters, sorting, and page with URL search parameters.
- Add server-state caching and cancellation for remote transformations.
- Support explicit null ordering and locale-sensitive collators.
- Add column visibility and persisted user preferences.
- Use cursor pagination when offset pagination becomes unstable or expensive.
- Model whole-result selection as “all matching except excluded IDs” rather than enumerating unloaded IDs.
- Add virtualization with an accessibility and focus strategy.

## A 60-second solution explanation

The table is generic over `T`: callers provide columns plus functions for row identity and accessible labels, so the component contains no domain field names. Each column independently defines rendering, sorting, filtering, and row-header behavior. I store only user decisions—query, sort descriptor, selected IDs, and page—and derive rows through filter, sort, and pagination. Selection uses stable caller-provided IDs, native table semantics remain intact, and the only Effect synchronizes the checkbox’s indeterminate DOM property. At server scale I would make these controls report intent to a cached remote query instead of transforming all rows locally.

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
- Keep domain knowledge in typed column definitions and caller-provided row identity.
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
