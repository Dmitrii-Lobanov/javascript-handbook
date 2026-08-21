# Accessible Autocomplete

## The interview prompt

Build a reusable autocomplete component that lets a user search for and select one suggested record. The caller supplies the record type, asynchronous search function, stable identity, label, and optional rendering.

The component should:

- update suggestions as the user types;
- fetch results from an asynchronous data source;
- display loading, empty, and error states;
- support pointer and keyboard selection;
- close when a result is selected or the user presses Escape;
- expose the selected option to its parent.

Assume the interview lasts 45–60 minutes. Styling is secondary to behavior, state design, and clear reasoning.

## What the interviewer is evaluating

Autocomplete looks like a text input and a list, but it exposes several important frontend skills at once:

- translating an ambiguous product prompt into explicit behavior;
- separating input state, selected value, and highlighted option;
- synchronizing React with an asynchronous external system;
- preventing stale responses from replacing current results;
- preserving immediate typing while requests are delayed;
- managing composite-widget keyboard behavior;
- using stable identities and semantic relationships;
- deciding what belongs in the interview solution and what belongs in production hardening.

A senior candidate is not expected to build a production design-system combobox from memory. They are expected to identify the difficult parts, establish a coherent model, build the critical behavior, and explain the remaining risks.

## Clarifying questions to ask

Before writing JSX, clarify the contract.

1. Are suggestions local or fetched from a server?
2. How many characters should trigger a search?
3. Is arbitrary text allowed, or must the user select a result?
4. Should the search be debounced?
5. What information does each suggestion display?
6. What happens when no result matches?
7. Which keyboard interactions are required?
8. Should the component be controlled by its parent?
9. Does selecting an item submit, navigate, or only update state?
10. Are external component libraries permitted?

For this article, use the following decisions:

- results come from an asynchronous caller-provided search function;
- two characters trigger a request;
- arbitrary text may remain in the input;
- requests are debounced by 250 milliseconds;
- selecting a result calls `onSelect(option)`;
- DOM focus remains in the input while arrow keys change the active suggestion;
- the first version uses no external component library.

## Requirements and deliberate non-requirements

### Required in the interview version

- Controlled text input
- Debounced query
- Loading, error, empty, and success states
- Stale-request protection
- Arrow Up and Arrow Down navigation
- Enter to select
- Escape to close
- Pointer selection
- Correct combobox, listbox, and option relationships
- Stable option IDs

### Explain, but do not necessarily finish

- Result caching
- Request deduplication across component instances
- Windowing thousands of results
- Mobile screen-reader testing
- Internationalized matching
- Analytics
- Server rendering
- Full browser and assistive-technology compatibility testing

This boundary is important. A live-coding solution should be small enough to complete and rich enough to demonstrate judgment.

## System design before implementation

Use GreatFrontEnd's [RADIO framework](https://www.greatfrontend.com/front-end-system-design-playbook/framework) as a lightweight design checklist:

```text
R — Requirements
A — Architecture
D — Data model
I — Interfaces
O — Optimizations and deep dives
```

RADIO is not a rigid sequence. In an interview, move back when a later decision reveals a missing requirement. For this live-coding task, spend only a few minutes establishing the design, then implement the smallest working version.

### R — Requirements

The clarifying questions and scope above establish the functional requirements:

- the user types a query and receives matching suggestions;
- suggestions come from an asynchronous source;
- keyboard and pointer users can navigate and select a suggestion;
- the popup exposes correct combobox semantics;
- loading, empty, error, and success outcomes are distinguishable;
- stale responses never replace results for a newer query.

The most important non-functional requirements are:

- **Responsiveness:** input text must update immediately.
- **Request efficiency:** search should not run for every intermediate keystroke.
- **Correctness:** request completion order must not determine visible results.
- **Accessibility:** focus, labels, roles, active option, and announcements must work together.
- **Reusability:** behavior must not depend on a `Person` or another fixed record shape.

For the interview version, assume one autocomplete instance, a moderate result count, online use, and an existing search service. Caching across screens, virtualization, international matching, and server infrastructure remain follow-up topics.

### A — Architecture

Treat the server as a search API boundary and focus on responsibilities inside the client:

```text
Search service
      ↑ query, AbortSignal
      ↓ matching records
Data-access function
      ↑ injected as searchOptions
      ↓ Promise<T[]>
Autocomplete<T>
├── input and combobox controller
├── request-state coordinator
├── keyboard interaction logic
└── listbox and option views
      ↓ selected record
Parent application
```

Responsibilities are intentionally divided:

| Boundary | Responsibility |
| --- | --- |
| Parent application | Supplies the data source and decides what selection means |
| Data-access function | Converts a query into records and supports cancellation |
| Autocomplete | Owns input and interaction state and coordinates requests |
| Input/combobox | Keeps DOM focus and handles typing and navigation keys |
| Listbox/options | Render current results and expose active and selected semantics |

One React component is sufficient for the interview implementation. These are logical responsibilities, not a requirement to create five files. Extract a data Hook or smaller view only when the code gains a real reuse or testing boundary.

Use unidirectional flow:

```text
user types
  → inputValue changes immediately
  → debounced query changes later
  → searchOptions(query, signal) starts
  → request state changes
  → latest valid results render
  → user selects an option
  → parent receives the original record
```

### D — Data model

Separate server-originated records from ephemeral client interaction state:

| Data | Origin | Owner | Persisted? |
| --- | --- | --- | --- |
| Option records `T[]` | Search service | Request state | No local persistence |
| `inputValue` | User input | Autocomplete | No |
| Debounced query | Derived from input | Autocomplete | No |
| Request status and error | Network lifecycle | Autocomplete | No |
| `activeIndex` | Keyboard interaction | Autocomplete | No |
| Dismissed state | User interaction | Autocomplete | No |
| Selected record | User interaction | Parent callback | Application-dependent |

The generic record `T` needs two projections:

- stable identity for React keys and option DOM IDs;
- a text label for input value and accessible naming.

Visible popup state should be derived from input, results, request state, and dismissal where possible. Do not synchronize a separate `isOpen` boolean if it can contradict those values.

Maintain these invariants:

1. The active index is `-1` or points to a current result.
2. Rendered results belong to the latest effective query.
3. DOM focus stays on the input while active-option state moves through the list.
4. Selecting returns the original record rather than a presentation-only copy.
5. Escape dismisses without selecting.

### I — Interfaces

There are two relevant interfaces: the server/data-access interface and the component API.

The data-access contract is intentionally transport-independent:

```ts
type SearchOptions<T> = (
  query: string,
  signal: AbortSignal,
) => Promise<readonly T[]>;
```

An application may implement it with an HTTP endpoint such as:

```text
GET /api/search?q=<encoded query>&limit=10
→ { results: T[] }
```

The server should validate query length and limit result size. The client should not depend on database or ranking implementation details.

The component interface needs four categories of props:

| Category | Props |
| --- | --- |
| Data access | `searchOptions` |
| Data projection | `getOptionId`, `getOptionLabel` |
| Presentation | `label`, `renderOption` |
| Events and behavior | `onSelect`, `debounceDelay` |

Conceptually:

```ts
type AutocompleteProps<T> = {
  label: string;
  searchOptions: SearchOptions<T>;
  getOptionId: (option: T) => string | number;
  getOptionLabel: (option: T) => string;
  renderOption: (option: T) => ReactNode;
  onSelect: (option: T) => void;
  debounceDelay?: number;
};
```

This API keeps domain knowledge in the caller while centralizing interaction and accessibility rules in the component. The detailed type contract follows this design.

### O — Optimizations and deep dives

Prioritize optimizations unique to autocomplete rather than generic advice.

#### Keep typing urgent

Update `inputValue` synchronously. Debounce only the query that starts external work. Delaying the controlled input makes typing feel broken.

#### Protect request correctness

Abort obsolete requests to save work and also verify request ownership before committing results. Cancellation alone is not a complete stale-response guarantee because later async processing may still resolve.

#### Limit unnecessary traffic

- do not search below a chosen minimum query length;
- debounce rapid edits;
- cap response size;
- cache repeated normalized queries when product usage justifies it;
- deduplicate identical in-flight queries in a shared data layer if multiple instances exist.

#### Preserve accessible interaction

Use the combobox, listbox, and option pattern; retain DOM focus in the input; communicate the active option with `aria-activedescendant`; expose loading and result changes without noisy repeated announcements; and support pointer use without moving focus before selection completes.

#### Plan for scale only when required

For dozens of suggestions, render the complete list. For thousands, first question the API design: autocomplete should normally return a small ranked set. Virtualization adds complexity to active-option IDs and screen-reader navigation and should follow evidence, not habit.

#### Define failure behavior

An error should not silently look like zero matches. Keep error and empty states distinct, allow a later query to retry naturally, and prevent an obsolete error from replacing newer success.

With RADIO covered, move to the concrete TypeScript boundary and implement one working checkpoint at a time.

## Type contract

Define the reusable boundary before state or JSX. Every progressive checkpoint and the assembled implementation use the same generic contract:

```tsx
import type { ReactNode } from "react";

type OptionId = string | number;

type SearchState<T> =
  | { status: "idle"; results: T[] }
  | { status: "loading"; results: T[] }
  | { status: "success"; results: T[] }
  | { status: "error"; results: T[]; message: string };

type AutocompleteProps<T> = {
  label: string;
  searchOptions: (
    query: string,
    signal: AbortSignal,
  ) => Promise<T[]>;
  getOptionId: (option: T) => OptionId;
  getOptionLabel: (option: T) => string;
  renderOption?: (option: T) => ReactNode;
  onSelect: (option: T) => void;
  minimumQueryLength?: number;
  debounceDelay?: number;
  suggestionsLabel?: string;
};
```

The responsibilities are explicit:

- `T` is the caller's result type, such as `Person`, `Product`, or `City`.
- `searchOptions` owns data access and accepts an `AbortSignal`.
- `getOptionId` provides stable identity without assuming an `id` field.
- `getOptionLabel` provides input text and an accessible option label.
- `renderOption` customizes visible content without changing combobox behavior.
- `onSelect` returns the original typed record to the parent.
- `debounceDelay` controls search timing without delaying the input value.

For example, one caller may use:

```tsx
type Product = {
  sku: string;
  title: string;
  price: number;
};
```

## State model and invariants

Start by naming the independent pieces of state.

```ts
const [searchState, setSearchState] = useState<SearchState<T>>({
  status: "idle",
  results: [],
});
```

The component also needs:

```ts
const [inputValue, setInputValue] = useState("");
const [activeIndex, setActiveIndex] = useState(-1);
const [dismissed, setDismissed] = useState(false);
```

Do not combine these concepts accidentally:

- `inputValue` is the editable text.
- `results` are suggestions for the current debounced query.
- `activeIndex` identifies the suggestion currently navigated by keyboard.
- `dismissed` records an intentional Escape or selection close that cannot be derived.
- the selected option belongs to the parent through `onSelect`.
- whether the popup is visible can normally be derived.

Useful invariants:

1. `activeIndex` is `-1` or identifies an existing result.
2. Results displayed after a request belong to the latest effective query.
3. Selecting an option uses `getOptionLabel`, returns the original record, and closes the popup.
4. Escape closes the popup without selecting the active option.
5. DOM focus remains on the input while assistive-technology focus follows the active option.

Avoid a collection of loosely related booleans such as `isLoading`, `hasError`, `isEmpty`, and `isOpen` when they can contradict one another. A status union makes the possible request states explicit.

## Component and Hook design

Keep the interview architecture small:

```text
Autocomplete<T>
├── input and label
├── status message
└── suggestion list
```

One component is acceptable at this size. Extract behavior only when the boundary becomes useful.

A reasonable public API is:

```ts
type ProductAutocompleteProps = AutocompleteProps<Product>;
```

This API makes the data source injectable. The component does not know the endpoint, authentication mechanism, or application store. That makes it easier to test and reuse.

Do not extract `useAutocomplete` merely to show that you know custom Hooks. Extract it when multiple renderers need the behavior or when the component becomes difficult to reason about. A custom Hook shares behavior, not markup or accessibility semantics.

Build the feature in this order. Finish the basic synchronous version before adding asynchronous business logic.

Build one working vertical slice at a time. Every step below has a visible result and introduces only one new source of complexity.

The sequence is intentional:

```text
Controlled input
    ↓
Local suggestions
    ↓
Asynchronous search
    ↓
Race protection
    ↓
Debounced requests
    ↓
Keyboard navigation
    ↓
Combobox semantics
```

If the interview ends early, you still have a working checkpoint and can explain the next step.

## Step 1 — Build a basic synchronous autocomplete

Start with caller-supplied local options and the type contract defined above:

```tsx
type LocalAutocompleteProps<T> = Pick<
  AutocompleteProps<T>,
  "label" | "getOptionId" | "getOptionLabel" | "renderOption" | "onSelect"
> & {
  options: readonly T[];
};

export function LocalAutocomplete<T>({
  label,
  options,
  getOptionId,
  getOptionLabel,
  renderOption,
  onSelect,
}: LocalAutocompleteProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const query = inputValue.trim().toLocaleLowerCase();
  const results = query
    ? options.filter(option =>
        getOptionLabel(option).toLocaleLowerCase().includes(query),
      )
    : [];

  function selectOption(option: T) {
    setInputValue(getOptionLabel(option));
    onSelect(option);
  }

  return (
    <div>
      <label>
        {label}
        <input
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
        />
      </label>
      <ul>
        {results.map(option => (
          <li key={getOptionId(option)}>
            <button type="button" onClick={() => selectOption(option)}>
              {renderOption?.(option) ?? getOptionLabel(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

The component assumes nothing about the shape of T. Identity, searchable labels, visible content, and the selected record all come from typed caller props.

## First working implementation

Stop here briefly and verify the basic user flow:

1. Typing filters the local options.
2. Matching options render from generic data.
3. Clicking an option reports the selected item.
4. Selecting an option updates the input label.

This version is already demonstrable. It intentionally has no network request, debounce, stale-response protection, arrow navigation, or combobox ARIA yet. Add those requirements to this working component one at a time.

## Step 2 — Replace local options with asynchronous search

Use the generic request state from the opening contract:

```tsx
const [searchState, setSearchState] = useState<SearchState<T>>({
  status: "idle",
  results: [],
});

useEffect(() => {
  const query = inputValue.trim();

  if (query.length < minimumQueryLength) {
    setSearchState({ status: "idle", results: [] });
    return;
  }

  const signal = new AbortController().signal;
  setSearchState({ status: "loading", results: [] });

  searchOptions(query, signal)
    .then(results => {
      setSearchState({ status: "success", results });
    })
    .catch(() => {
      setSearchState({
        status: "error",
        results: [],
        message: "Suggestions could not be loaded.",
      });
    });
}, [inputValue, minimumQueryLength, searchOptions]);
```

Render loading, empty, and error states independently from generic option rendering:

```tsx
{searchState.status === "loading" && <p>Loading…</p>}
{searchState.status === "error" && <p role="alert">{searchState.message}</p>}
{searchState.status === "success" && searchState.results.length === 0 && (
  <p>No suggestions found.</p>
)}
```

## Step 3 — Protect against stale responses

Each Effect execution owns one request:

```tsx
useEffect(() => {
  const query = inputValue.trim();

  if (query.length < minimumQueryLength) {
    setSearchState({ status: "idle", results: [] });
    return;
  }

  const controller = new AbortController();
  let ignore = false;

  setSearchState(previous => ({
    status: "loading",
    results: previous.results,
  }));

  searchOptions(query, controller.signal)
    .then(results => {
      if (!ignore) setSearchState({ status: "success", results });
    })
    .catch(error => {
      const aborted =
        error instanceof DOMException && error.name === "AbortError";

      if (!ignore && !aborted) {
        setSearchState({
          status: "error",
          results: [],
          message: "Suggestions could not be loaded.",
        });
      }
    });

  return () => {
    ignore = true;
    controller.abort();
  };
}, [inputValue, minimumQueryLength, searchOptions]);
```

Cancellation reduces work; the ignore guard prevents obsolete results even when a supplied search implementation does not fully honor abort.

## Step 4 — Debounce the query, not the input

Extract timing into a reusable value Hook:

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const debouncedQuery = useDebounce(
  inputValue.trim(),
  debounceDelay,
);
```

The input still displays inputValue immediately. Only the Effect that starts external work changes from inputValue to debouncedQuery.

## Step 5 — Add keyboard navigation

The active index navigates the current typed result array:

```tsx
const results = searchState.results;
const activeOption =
  activeIndex >= 0 ? results[activeIndex] : undefined;

function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Escape") {
    setDismissed(true);
    setActiveIndex(-1);
    return;
  }

  if (results.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActiveIndex(index =>
      index < results.length - 1 ? index + 1 : 0,
    );
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActiveIndex(index =>
      index > 0 ? index - 1 : results.length - 1,
    );
  } else if (event.key === "Enter" && activeOption) {
    event.preventDefault();
    selectOption(activeOption);
  }
}
```

Selection uses getOptionLabel for input text and returns the original T:

```tsx
function selectOption(option: T) {
  setInputValue(getOptionLabel(option));
  setDismissed(true);
  setActiveIndex(-1);
  onSelect(option);
}
```

## Step 6 — Add combobox semantics

Caller-provided identity creates stable React keys and active-descendant IDs:

```tsx
const activeOptionId = activeOption
  ? `\${reactId}-option-\${getOptionId(activeOption)}`
  : undefined;

<input
  id={inputId}
  role="combobox"
  aria-autocomplete="list"
  aria-expanded={canShowPopup}
  aria-controls={listboxId}
  aria-activedescendant={activeOptionId}
  aria-describedby={statusId}
  value={inputValue}
  onChange={event => handleInputChange(event.target.value)}
  onKeyDown={handleKeyDown}
/>

<ul id={listboxId} role="listbox" aria-label={suggestionsLabel}>
  {results.map((option, index) => {
    const optionId = getOptionId(option);
    const active = index === activeIndex;

    return (
      <li
        id={`\${reactId}-option-\${optionId}`}
        role="option"
        aria-selected={active}
        key={optionId}
        ref={node => {
          optionRefs.current[index] = node;
        }}
        onMouseDown={event => event.preventDefault()}
        onClick={() => selectOption(option)}
      >
        {renderOption?.(option) ?? getOptionLabel(option)}
      </li>
    );
  })}
</ul>
```

The autocomplete owns listbox semantics and keyboard behavior. Callers customize only typed data access and visible option content.

This completes the generic vertical slice. The assembled component below repeats the contract so it is self-contained and ready to copy.

## Complete interview-sized implementation

The following version combines all six steps in one component.

```tsx
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type OptionId = string | number;

type SearchState<T> =
  | { status: "idle"; results: T[] }
  | { status: "loading"; results: T[] }
  | { status: "success"; results: T[] }
  | { status: "error"; results: T[]; message: string };

type AutocompleteProps<T> = {
  label: string;
  searchOptions: (
    query: string,
    signal: AbortSignal,
  ) => Promise<T[]>;
  getOptionId: (option: T) => OptionId;
  getOptionLabel: (option: T) => string;
  renderOption?: (option: T) => ReactNode;
  onSelect: (option: T) => void;
  minimumQueryLength?: number;
  debounceDelay?: number;
  suggestionsLabel?: string;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function Autocomplete<T>({
  label,
  searchOptions,
  getOptionId,
  getOptionLabel,
  renderOption,
  onSelect,
  minimumQueryLength = 2,
  debounceDelay = 250,
  suggestionsLabel = `${label} suggestions`,
}: AutocompleteProps<T>) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listboxId = `${reactId}-listbox`;
  const statusId = `${reactId}-status`;

  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue.trim(), debounceDelay);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [searchState, setSearchState] = useState<SearchState<T>>({
    status: "idle",
    results: [],
  });

  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

  useEffect(() => {
    if (debouncedQuery.length < minimumQueryLength) {
      setSearchState({ status: "idle", results: [] });
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    let ignore = false;

    setSearchState(previous => ({
      status: "loading",
      results: previous.results,
    }));

    searchOptions(debouncedQuery, controller.signal)
      .then(results => {
        if (ignore) return;
        setSearchState({ status: "success", results });
        setActiveIndex(-1);
      })
      .catch(error => {
        if (ignore || error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setSearchState({
          status: "error",
          results: [],
          message: "Suggestions could not be loaded.",
        });
        setActiveIndex(-1);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [debouncedQuery, minimumQueryLength, searchOptions]);

  const results = searchState.results;
  const canShowPopup =
    !dismissed &&
    inputValue.trim().length >= minimumQueryLength &&
    (searchState.status === "loading" ||
      searchState.status === "error" ||
      searchState.status === "success");

  const activeOption = activeIndex >= 0 ? results[activeIndex] : undefined;
  const activeOptionId = activeOption
    ? `${reactId}-option-${getOptionId(activeOption)}`
    : undefined;

  useEffect(() => {
    if (activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex]);

  function selectOption(option: T) {
    setInputValue(getOptionLabel(option));
    setDismissed(true);
    setActiveIndex(-1);
    onSelect(option);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      if (canShowPopup) {
        event.preventDefault();
        setDismissed(true);
        setActiveIndex(-1);
      }
      return;
    }

    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDismissed(false);
      setActiveIndex(index =>
        index < results.length - 1 ? index + 1 : 0,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setDismissed(false);
      setActiveIndex(index =>
        index > 0 ? index - 1 : results.length - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      selectOption(activeOption);
    }
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    setDismissed(false);
    setActiveIndex(-1);
  }

  let statusMessage = "";

  if (inputValue.trim().length > 0 && inputValue.trim().length < minimumQueryLength) {
    statusMessage = `Enter at least ${minimumQueryLength} characters.`;
  } else if (searchState.status === "loading") {
    statusMessage = "Loading suggestions.";
  } else if (searchState.status === "error") {
    statusMessage = searchState.message;
  } else if (searchState.status === "success") {
    statusMessage = results.length === 0
      ? "No suggestions found."
      : `${results.length} suggestions available.`;
  }

  return (
    <div className="autocomplete">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={canShowPopup}
        aria-controls={listboxId}
        aria-activedescendant={activeOptionId}
        aria-describedby={statusId}
        autoComplete="off"
        value={inputValue}
        onChange={event => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setDismissed(false)}
      />

      <div id={statusId} role="status" className="sr-only">
        {statusMessage}
      </div>

      {canShowPopup && (
        <div className="autocomplete-popup">
          {searchState.status === "loading" && results.length === 0 && (
            <p>Loading…</p>
          )}

          {searchState.status === "error" && (
            <p role="alert">{searchState.message}</p>
          )}

          {searchState.status === "success" && results.length === 0 && (
            <p>No suggestions found.</p>
          )}

          {results.length > 0 && (
            <ul id={listboxId} role="listbox" aria-label={suggestionsLabel}>
              {results.map((option, index) => {
                const optionId = getOptionId(option);
                const active = index === activeIndex;

                return (
                  <li
                    id={`${reactId}-option-${optionId}`}
                    role="option"
                    aria-selected={active}
                    key={optionId}
                    ref={node => {
                      optionRefs.current[index] = node;
                    }}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => selectOption(option)}
                  >
                    {renderOption?.(option) ?? getOptionLabel(option)}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

Here is one product configuration. A city, repository, or employee search supplies different accessors and rendering without changing `Autocomplete`:

```tsx
<Autocomplete<Product>
  label="Product"
  searchOptions={searchProducts}
  getOptionId={product => product.sku}
  getOptionLabel={product => product.title}
  renderOption={product => (
    <>
      <strong>{product.title}</strong>
      <span>{formatCurrency(product.price)}</span>
    </>
  )}
  onSelect={product => addToCart(product)}
  minimumQueryLength={2}
  debounceDelay={250}
/>
```

## Why the solution is structured this way

### The raw input and debounced query are separate

The input must update immediately on every key press. Debouncing the state bound to `value` would make typing feel delayed. Instead, the raw input is urgent UI state and the debounced query controls only external synchronization.

`useDebounce` owns only the timer lifecycle and remains reusable for other delayed values. The autocomplete still owns query normalization (`trim`), the delay choice, minimum-length rules, networking, and rendering. Keeping those responsibilities outside the hook avoids turning a small timing primitive into a feature-specific abstraction.

### The Effect synchronizes with the current query

Fetching belongs in an Effect in this standalone example because results must remain synchronized with the effective query regardless of whether it came from typing, restored URL state, or a parent update.

Production frameworks and server-state libraries may provide a better loading boundary, cache, deduplication, and server-rendering strategy. The interview implementation keeps the mechanism explicit so it can be discussed.

### Cancellation and ignoring are both present

`AbortController` asks the underlying request to stop. The `ignore` flag protects state even if the supplied data function does not fully honor cancellation or resolves during cleanup.

This prevents the classic race:

```text
Request "rea" starts
Request "react" starts
Request "react" finishes
Request "rea" finishes later and overwrites the correct results
```

### Popup visibility is mostly derived

The component does not maintain an independent `isOpen` value that must be synchronized with query length, request state, and available results. It derives visibility and keeps only `dismissed`, the user decision that cannot be inferred from the other state.

### Input focus does not move into the list

DOM focus remains on the editable input so standard text-editing keys continue to work. `aria-activedescendant` communicates which listbox option is active. This follows the editable combobox focus model.

## Accessibility and keyboard behavior

The semantic relationships are as important as the rendered list.

The input exposes:

- `role="combobox"`;
- `aria-expanded` for popup visibility;
- `aria-controls` pointing to the listbox;
- `aria-autocomplete="list"`;
- `aria-activedescendant` pointing to the active option.

The popup exposes:

- a `listbox` containing `option` elements;
- `aria-selected` on the active option;
- stable IDs derived from stable result IDs.

Keyboard contract:

| Key | Behavior |
| --- | --- |
| Arrow Down | Open the popup if necessary and move to the next option |
| Arrow Up | Open the popup if necessary and move to the previous option |
| Enter | Select the active option |
| Escape | Close without selecting |
| Tab | Leave the widget normally |
| Printable keys | Continue editing the input using native behavior |

Do not intercept Home, End, Left Arrow, or Right Arrow unless the chosen combobox behavior explicitly requires it. They are native text-editing keys while focus remains in the input.

Pointer selection uses `onMouseDown={event => event.preventDefault()}` so the input does not lose focus before the click completes. A production component must test pointer, touch, and mobile assistive-technology behavior rather than assuming mouse behavior covers every input modality.

## Async, performance, and edge cases

### Minimum query length

Short queries often produce noisy results and unnecessary server load. Make the threshold explicit and communicate it to the user.

### Debouncing

Debouncing reduces requests during continuous typing. It does not make a slow endpoint faster, and it adds intentional delay. Choose the duration based on request cost and product behavior rather than copying 300 milliseconds automatically.

### Caching

A small cache can make repeated queries instant:

```ts
function createSearchCache<T>() {
  return new Map<string, T[]>();
}
```

But a cache creates questions:

- How long are results fresh?
- Is the data safe to retain?
- Is the cache shared across component instances?
- Is its size bounded?
- Can user permissions change?

For production, a server-state library or framework cache may be more appropriate than a component-local map.

### Result identity

Use `getOptionId(option)` for React keys and option IDs. An array index changes meaning when results are inserted, removed, or reordered.

### Selected value versus input text

This implementation allows arbitrary text. If selection is required, the component needs an explicit validity rule and must decide what blur, form submission, and later editing do to the selected object.

### Internationalized matching

Client filtering through lowercase string comparison is not universally correct. Locale, accents, tokenization, transliteration, and server ranking may affect the intended behavior.

### Large result sets

Autocomplete should usually return a small ranked result set. Virtualizing hundreds of suggestions can complicate `aria-activedescendant`, scrolling, and screen-reader behavior. Prefer a better result limit and ranking before adding virtualization.

## Testing strategy

Test observable behavior, not internal state variables.

### Essential component tests

1. Typing fewer than the minimum characters does not request results.
2. Typing a valid query eventually requests it.
3. Loading, success, empty, and error states are rendered.
4. A stale request cannot replace the newest results.
5. Arrow Down and Arrow Up change the active option.
6. Enter selects the active option.
7. Escape closes without selecting.
8. Pointer selection calls `onSelect` with the original typed option.
9. The input exposes the expected combobox state.
10. The active descendant points to an existing option.

Example test outline:

```tsx
it("does not display an older response", async () => {
  const requests = createControllableSearch();
  const user = userEvent.setup();

  render(
    <Autocomplete<Product>
      label="Product"
      searchOptions={requests.search}
      getOptionId={product => product.sku}
      getOptionLabel={product => product.title}
      onSelect={() => {}}
    />,
  );

  const input = screen.getByRole("combobox", {
    name: "Product",
  });

  await user.type(input, "rea");
  await advanceDebounce();
  await user.type(input, "ct");
  await advanceDebounce();

  requests.resolve("react", [reactProduct]);
  expect(await screen.findByText("React Product")).toBeVisible();

  requests.resolve("rea", [olderProduct]);
  expect(screen.queryByText("Older Product")).not.toBeInTheDocument();
});
```

Automated accessibility checks are useful but insufficient. Manually test keyboard behavior, visible focus, zoom, pointer interaction, and representative screen readers.

## Common candidate mistakes

### Debouncing the controlled input

This makes typing visibly lag. Debounce the query that triggers work, not the value rendered by the input.

### Storing filtered results through another Effect

Local filtered results are derived data and can be calculated during rendering. Effects are needed only when synchronizing with an external source.

### Fetching without cleanup

Responses can arrive out of order. A loading implementation is incomplete until it prevents stale results.

### Using array indexes as option identity

Indexes change when the result set changes and can make active-descendant relationships point at the wrong item.

### Moving DOM focus into every suggestion

Editable comboboxes normally keep focus in the input. Moving focus can interfere with continued typing and standard editing keys.

### Treating ARIA attributes as complete accessibility

Roles do not implement keyboard behavior, focus management, scrolling, announcements, or touch interaction.

### Closing on blur without understanding pointer order

The input can blur before a suggestion click fires, unmounting the option before selection. Handle the interaction deliberately and test it.

### Overengineering before a vertical slice works

Building a generic reducer, cache, compound API, and virtualization layer before selection works is a poor interview tradeoff. Establish the critical journey first.

## Senior-level improvements

After the interview-sized version works, discuss these production decisions:

- integrate with a framework loader or server-state library;
- share request caching and deduplication;
- expose controlled input and selected-value APIs;
- add configurable result rendering without losing semantics;
- support required-selection and free-text modes explicitly;
- preserve results during non-urgent updates;
- add retry behavior and richer errors;
- test with multiple browsers and assistive technologies;
- collect query latency, selection, abandonment, and error metrics;
- protect private result data from inappropriate caching;
- document API invariants for design-system consumers.

Do not claim every improvement belongs in every product. A reusable design-system combobox and a single product search field have different complexity budgets.

## A 60-second solution explanation

The component is generic over `T`: callers provide search, identity, label, and optional rendering while the component owns asynchronous and accessible combobox behavior. I separate the immediate input from the configurable debounced query, and the request Effect uses `AbortController` plus an ignore guard to prevent stale results. Request state is an explicit status, popup visibility is mostly derived, and DOM focus stays in the input while `aria-activedescendant` tracks keyboard navigation. In production I would evaluate a framework or server-state cache, test across assistive technologies, and make controlled selection and free-text behavior explicit.

## Likely interview follow-ups

### Why not use `useDeferredValue` instead of debouncing?

Deferring changes rendering priority; it does not inherently reduce network requests. Debouncing intentionally waits for a quiet period before starting work. They solve different problems and can be combined when appropriate.

### Would you use an Effect for production data fetching?

Not automatically. A framework loader or server-state library may provide caching, deduplication, server rendering, prefetching, and better error boundaries. The Effect implementation demonstrates the lifecycle requirements when the component owns synchronization directly.

### How would you support controlled selection?

Accept `selectedOption` and `onSelectedOptionChange`, define how input text relates to the selected value, and avoid copying the controlled prop into independent state without an intentional editing model.

### How would you avoid request waterfalls?

Load data at an appropriate route or feature boundary, prefetch likely data, and avoid waiting for a child to mount before discovering a request that the parent already knows will be needed.

### How would you render rich suggestions?

Accept a render function or structured slots while keeping listbox and option semantics owned by the autocomplete. Consumers should customize content without needing to rebuild keyboard and accessibility behavior.

## Article summary

- Clarify whether text is free-form or selection is required.
- Keep record-specific identity, labels, and rendering in typed caller props.
- Keep raw input, debounced query, active option, and selected value conceptually separate.
- Debounce external work rather than the controlled input.
- Cancel or ignore stale requests.
- Derive popup visibility where possible.
- Keep DOM focus in an editable combobox input.
- Implement keyboard behavior in addition to ARIA relationships.
- Use stable domain identity for keys and option IDs.
- Build a complete vertical slice before production hardening.
