# Accessible Autocomplete

## The interview prompt

Build an autocomplete component that lets a user search for a person and select one of the suggested results.

The component should:

- update suggestions as the user types;
- fetch results from an asynchronous data source;
- display loading, empty, and error states;
- support pointer and keyboard selection;
- close when a result is selected or the user presses Escape;
- expose the selected person to its parent.

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

- results come from an asynchronous `searchPeople` function;
- two characters trigger a request;
- arbitrary text may remain in the input;
- requests are debounced by 250 milliseconds;
- selecting a result calls `onSelect(person)`;
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

## State model and invariants

Start by naming the independent pieces of state.

```ts
type Person = {
  id: string;
  name: string;
  role: string;
};

type SearchState =
  | { status: "idle"; results: Person[] }
  | { status: "loading"; results: Person[] }
  | { status: "success"; results: Person[] }
  | { status: "error"; results: Person[]; message: string };
```

The component also needs:

```ts
const [inputValue, setInputValue] = useState("");
const [activeIndex, setActiveIndex] = useState(-1);
const [searchState, setSearchState] = useState<SearchState>({
  status: "idle",
  results: [],
});
```

Do not combine these concepts accidentally:

- `inputValue` is the editable text.
- `results` are suggestions for the current debounced query.
- `activeIndex` identifies the suggestion currently navigated by keyboard.
- the selected person belongs to the parent through `onSelect`.
- whether the popup is visible can normally be derived.

Useful invariants:

1. `activeIndex` is `-1` or identifies an existing result.
2. Results displayed after a request belong to the latest effective query.
3. Selecting a person sets the input to the selected label and closes the popup.
4. Escape closes the popup without selecting the active option.
5. DOM focus remains on the input while assistive-technology focus follows the active option.

Avoid a collection of loosely related booleans such as `isLoading`, `hasError`, `isEmpty`, and `isOpen` when they can contradict one another. A status union makes the possible request states explicit.

## Component and Hook design

Keep the interview architecture small:

```text
PeopleAutocomplete
├── input and label
├── status message
└── suggestion list
```

One component is acceptable at this size. Extract behavior only when the boundary becomes useful.

A reasonable public API is:

```ts
type PeopleAutocompleteProps = {
  label: string;
  searchPeople: (
    query: string,
    signal: AbortSignal,
  ) => Promise<Person[]>;
  onSelect: (person: Person) => void;
  minimumQueryLength?: number;
};
```

This API makes the data source injectable. The component does not know the endpoint, authentication mechanism, or application store. That makes it easier to test and reuse.

Do not extract `useAutocomplete` merely to show that you know custom Hooks. Extract it when multiple renderers need the behavior or when the component becomes difficult to reason about. A custom Hook shares behavior, not markup or accessibility semantics.

## Step-by-step React solution

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

### Step 1: build the synchronous version

Start without networking, debouncing, keyboard state, or ARIA. Validate the central data flow:

```text
input text → filtered suggestions → selected person
```

```tsx
import { useState } from "react";

type Person = {
  id: string;
  name: string;
  role: string;
};

type Props = {
  people: Person[];
  onSelect: (person: Person) => void;
};

export function PeopleAutocomplete({ people, onSelect }: Props) {
  const [inputValue, setInputValue] = useState("");

  const normalizedQuery = inputValue.trim().toLocaleLowerCase();
  const results = normalizedQuery
    ? people.filter(person =>
        person.name.toLocaleLowerCase().includes(normalizedQuery),
      )
    : [];

  function selectPerson(person: Person) {
    setInputValue(person.name);
    onSelect(person);
  }

  return (
    <div>
      <label htmlFor="person-search">Person</label>
      <input
        id="person-search"
        value={inputValue}
        onChange={event => setInputValue(event.target.value)}
      />

      {results.length > 0 && (
        <ul>
          {results.map(person => (
            <li key={person.id}>
              <button type="button" onClick={() => selectPerson(person)}>
                <strong>{person.name}</strong>
                <span>{person.role}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

At this stage, explain two decisions:

- filtered results are derived during rendering instead of synchronized through an Effect;
- `person.id` provides stable identity, while an array index would describe position rather than the person.

Verify before continuing:

- typing immediately updates the input;
- matching people appear;
- selecting a person updates the input and calls `onSelect`.

### Step 2: replace local filtering with asynchronous search

Change the API so the component receives a search function:

```ts
type Props = {
  searchPeople: (query: string) => Promise<Person[]>;
  onSelect: (person: Person) => void;
};
```

Add explicit request state:

```tsx
type SearchState =
  | { status: "idle"; results: Person[] }
  | { status: "loading"; results: Person[] }
  | { status: "success"; results: Person[] }
  | { status: "error"; results: Person[]; message: string };

const [searchState, setSearchState] = useState<SearchState>({
  status: "idle",
  results: [],
});
```

Now synchronize results with `inputValue`:

```tsx
useEffect(() => {
  const query = inputValue.trim();

  if (query.length < 2) {
    setSearchState({ status: "idle", results: [] });
    return;
  }

  setSearchState({ status: "loading", results: [] });

  searchPeople(query)
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
}, [inputValue, searchPeople]);
```

Render the status and remote results:

```tsx
{searchState.status === "loading" && <p>Loading…</p>}
{searchState.status === "error" && <p>{searchState.message}</p>}
{searchState.status === "success" && searchState.results.length === 0 && (
  <p>No people found.</p>
)}

{searchState.results.length > 0 && (
  <ul>
    {searchState.results.map(person => (
      <li key={person.id}>
        <button type="button" onClick={() => selectPerson(person)}>
          {person.name}
        </button>
      </li>
    ))}
  </ul>
)}
```

This version demonstrates loading, success, empty, and error states, but it contains an important bug: responses can arrive out of order.

### Step 3: protect against stale responses

Consider this sequence:

```text
search("rea") starts
search("react") starts
search("react") resolves
search("rea") resolves later and replaces the correct results
```

Extend the search contract with an abort signal:

```ts
type Props = {
  searchPeople: (
    query: string,
    signal: AbortSignal,
  ) => Promise<Person[]>;
  onSelect: (person: Person) => void;
};
```

Then give every Effect execution its own controller and cleanup guard:

```tsx
useEffect(() => {
  const query = inputValue.trim();

  if (query.length < 2) {
    setSearchState({ status: "idle", results: [] });
    return;
  }

  const controller = new AbortController();
  let ignore = false;

  setSearchState(previous => ({
    status: "loading",
    results: previous.results,
  }));

  searchPeople(query, controller.signal)
    .then(results => {
      if (ignore) return;
      setSearchState({ status: "success", results });
    })
    .catch(error => {
      const aborted =
        error instanceof DOMException && error.name === "AbortError";

      if (ignore || aborted) return;

      setSearchState({
        status: "error",
        results: [],
        message: "Suggestions could not be loaded.",
      });
    });

  return () => {
    ignore = true;
    controller.abort();
  };
}, [inputValue, searchPeople]);
```

Why use both mechanisms?

- `controller.abort()` asks the underlying operation to stop doing unnecessary work.
- `ignore` guarantees that this Effect execution cannot commit state after cleanup, even if the supplied search function does not fully honor cancellation.

The component is now correct under out-of-order responses, but it still starts a request for nearly every key press.

### Step 4: debounce the query, not the input

Do not debounce `inputValue`. It controls what the user sees in the input and must update immediately.

Extract the timing concern into a small reusable hook. The hook delays a value; it does not know anything about autocomplete or requests:

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
```

Use the hook to derive a query for external work while keeping the controlled input immediate:

```tsx
const [inputValue, setInputValue] = useState("");
const debouncedQuery = useDebounce(inputValue.trim(), 250);
```

Then change the request Effect to use `debouncedQuery`:

```tsx
useEffect(() => {
  if (debouncedQuery.length < 2) {
    setSearchState({ status: "idle", results: [] });
    return;
  }

  const controller = new AbortController();
  let ignore = false;

  setSearchState(previous => ({
    status: "loading",
    results: previous.results,
  }));

  searchPeople(debouncedQuery, controller.signal)
    .then(results => {
      if (!ignore) {
        setSearchState({ status: "success", results });
      }
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
}, [debouncedQuery, searchPeople]);
```

Verify this distinction explicitly:

- the text field changes on every key press;
- the request starts only after 250 milliseconds without another input change;
- replacing one query with another cleans up the previous request.

### Step 5: add active-option state and keyboard navigation

Introduce one new state value:

```tsx
const [activeIndex, setActiveIndex] = useState(-1);
```

Reset it whenever the query or result set changes:

```tsx
function handleInputChange(value: string) {
  setInputValue(value);
  setActiveIndex(-1);
}

// After accepting new results:
setSearchState({ status: "success", results });
setActiveIndex(-1);
```

Implement the keyboard contract:

```tsx
function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  const results = searchState.results;

  if (event.key === "Escape") {
    event.preventDefault();
    setDismissed(true);
    setActiveIndex(-1);
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

  if (event.key === "Enter" && activeIndex >= 0) {
    event.preventDefault();
    selectPerson(results[activeIndex]);
  }
}
```

Add `dismissed` because closing through Escape is a user decision that cannot be derived from the query and results:

```tsx
const [dismissed, setDismissed] = useState(false);

const canShowPopup =
  !dismissed &&
  inputValue.trim().length >= 2 &&
  searchState.status !== "idle";
```

Keep the active option visible in a scrollable result list:

```tsx
const optionRefs = useRef<Array<HTMLLIElement | null>>([]);

useEffect(() => {
  if (activeIndex >= 0) {
    optionRefs.current[activeIndex]?.scrollIntoView({
      block: "nearest",
    });
  }
}, [activeIndex]);
```

At this checkpoint, pointer and keyboard selection both work. Accessibility semantics are the final step, not a separate afterthought.

### Step 6: add combobox semantics and announcements

Generate stable relationships for the input, listbox, options, and status message:

```tsx
const reactId = useId();
const inputId = `${reactId}-input`;
const listboxId = `${reactId}-listbox`;
const statusId = `${reactId}-status`;

const activePerson =
  activeIndex >= 0 ? searchState.results[activeIndex] : undefined;

const activeOptionId = activePerson
  ? `${reactId}-option-${activePerson.id}`
  : undefined;
```

Update the input:

```tsx
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
```

Keep DOM focus in this input. `aria-activedescendant` moves the assistive-technology focus among suggestions without taking away native text editing.

Update the suggestion list:

```tsx
<ul id={listboxId} role="listbox" aria-label="People suggestions">
  {searchState.results.map((person, index) => {
    const active = index === activeIndex;

    return (
      <li
        id={`${reactId}-option-${person.id}`}
        role="option"
        aria-selected={active}
        key={person.id}
        ref={node => {
          optionRefs.current[index] = node;
        }}
        onMouseDown={event => event.preventDefault()}
        onClick={() => selectPerson(person)}
      >
        <strong>{person.name}</strong>
        <span>{person.role}</span>
      </li>
    );
  })}
</ul>
```

Finally, announce asynchronous changes without moving focus:

```tsx
<div id={statusId} role="status" className="sr-only">
  {statusMessage}
</div>
```

This completes the step-by-step implementation. The final assembled component appears below for reference.

## Complete interview-sized implementation

The following version combines all six steps in one component.

```tsx
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

type Person = {
  id: string;
  name: string;
  role: string;
};

type SearchState =
  | { status: "idle"; results: Person[] }
  | { status: "loading"; results: Person[] }
  | { status: "success"; results: Person[] }
  | { status: "error"; results: Person[]; message: string };

type Props = {
  label: string;
  searchPeople: (
    query: string,
    signal: AbortSignal,
  ) => Promise<Person[]>;
  onSelect: (person: Person) => void;
  minimumQueryLength?: number;
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

export function PeopleAutocomplete({
  label,
  searchPeople,
  onSelect,
  minimumQueryLength = 2,
}: Props) {
  const reactId = useId();
  const inputId = `${reactId}-input`;
  const listboxId = `${reactId}-listbox`;
  const statusId = `${reactId}-status`;

  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue.trim(), 250);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dismissed, setDismissed] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
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

    searchPeople(debouncedQuery, controller.signal)
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
  }, [debouncedQuery, minimumQueryLength, searchPeople]);

  const results = searchState.results;
  const canShowPopup =
    !dismissed &&
    inputValue.trim().length >= minimumQueryLength &&
    (searchState.status === "loading" ||
      searchState.status === "error" ||
      searchState.status === "success");

  const activePerson = activeIndex >= 0 ? results[activeIndex] : undefined;
  const activeOptionId = activePerson
    ? `${reactId}-option-${activePerson.id}`
    : undefined;

  useEffect(() => {
    if (activeIndex >= 0) {
      optionRefs.current[activeIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [activeIndex]);

  function selectPerson(person: Person) {
    setInputValue(person.name);
    setDismissed(true);
    setActiveIndex(-1);
    onSelect(person);
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

    if (event.key === "Enter" && activePerson) {
      event.preventDefault();
      selectPerson(activePerson);
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
            <p>No people found.</p>
          )}

          {results.length > 0 && (
            <ul id={listboxId} role="listbox" aria-label="People suggestions">
              {results.map((person, index) => {
                const active = index === activeIndex;

                return (
                  <li
                    id={`${reactId}-option-${person.id}`}
                    role="option"
                    aria-selected={active}
                    key={person.id}
                    ref={node => {
                      optionRefs.current[index] = node;
                    }}
                    onMouseDown={event => event.preventDefault()}
                    onClick={() => selectPerson(person)}
                  >
                    <strong>{person.name}</strong>
                    <span>{person.role}</span>
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
const cache = new Map<string, Person[]>();
```

But a cache creates questions:

- How long are results fresh?
- Is the data safe to retain?
- Is the cache shared across component instances?
- Is its size bounded?
- Can user permissions change?

For production, a server-state library or framework cache may be more appropriate than a component-local map.

### Result identity

Use `person.id` for React keys and option IDs. An array index changes meaning when results are inserted, removed, or reordered.

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
8. Pointer selection calls `onSelect` with the correct person.
9. The input exposes the expected combobox state.
10. The active descendant points to an existing option.

Example test outline:

```tsx
it("does not display an older response", async () => {
  const requests = createControllableSearch();
  const user = userEvent.setup();

  render(
    <PeopleAutocomplete
      label="Person"
      searchPeople={requests.search}
      onSelect={() => {}}
    />,
  );

  const input = screen.getByRole("combobox", {
    name: "Person",
  });

  await user.type(input, "rea");
  await advanceDebounce();
  await user.type(input, "ct");
  await advanceDebounce();

  requests.resolve("react", [reactPerson]);
  expect(await screen.findByText("React Person")).toBeVisible();

  requests.resolve("rea", [olderPerson]);
  expect(screen.queryByText("Older Person")).not.toBeInTheDocument();
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

I separated the immediate input value from the debounced query so typing stays responsive while requests are limited. The request Effect owns an `AbortController` and an ignore guard, which prevents an older result from replacing the current query. Request state is modeled as an explicit status rather than contradictory booleans, and popup visibility is derived except for intentional dismissal. For accessibility, DOM focus stays in the input, the input exposes combobox state, and `aria-activedescendant` identifies the active listbox option while arrow keys navigate and Enter selects. In production I would evaluate a framework or server-state cache, test across assistive technologies, and make required-selection versus free-text behavior explicit.

## Likely interview follow-ups

### Why not use `useDeferredValue` instead of debouncing?

Deferring changes rendering priority; it does not inherently reduce network requests. Debouncing intentionally waits for a quiet period before starting work. They solve different problems and can be combined when appropriate.

### Would you use an Effect for production data fetching?

Not automatically. A framework loader or server-state library may provide caching, deduplication, server rendering, prefetching, and better error boundaries. The Effect implementation demonstrates the lifecycle requirements when the component owns synchronization directly.

### How would you support controlled selection?

Accept `selectedPerson` and `onSelectedPersonChange`, define how input text relates to the selected value, and avoid copying the controlled prop into independent state without an intentional editing model.

### How would you avoid request waterfalls?

Load data at an appropriate route or feature boundary, prefetch likely data, and avoid waiting for a child to mount before discovering a request that the parent already knows will be needed.

### How would you render rich suggestions?

Accept a render function or structured slots while keeping listbox and option semantics owned by the autocomplete. Consumers should customize content without needing to rebuild keyboard and accessibility behavior.

## Article summary

- Clarify whether text is free-form or selection is required.
- Keep raw input, debounced query, active option, and selected value conceptually separate.
- Debounce external work rather than the controlled input.
- Cancel or ignore stale requests.
- Derive popup visibility where possible.
- Keep DOM focus in an editable combobox input.
- Implement keyboard behavior in addition to ARIA relationships.
- Use stable domain identity for keys and option IDs.
- Build a complete vertical slice before production hardening.
- Explain caching, testing, and framework tradeoffs instead of silently overengineering them.

## Further reading

- [WAI-ARIA Authoring Practices: Combobox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
- [WAI-ARIA Authoring Practices: Developing a Keyboard Interface](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
- [React: You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [MDN: AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
