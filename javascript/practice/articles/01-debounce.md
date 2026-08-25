# Debounce with Cancel and Flush

## The interview prompt

Implement a `debounce` utility. The returned function delays calling the original function until no new call has arrived for a configured interval. Add `cancel()` to discard a pending call and `flush()` to execute it immediately.

We will first build a small working debounce, then preserve arguments and `this`, and only then add the control methods and stronger TypeScript types.

## Clarify the contract

Before coding, confirm the behavior:

1. Is execution on the trailing edge, the leading edge, or both?
2. Which call supplies the arguments when several calls arrive?
3. Must the wrapper preserve dynamic `this`?
4. What should `cancel()` remove?
5. What should `flush()` return when a call is pending—or when none is pending?
6. What does an ordinary wrapper call return?

For this interview version:

- execution is trailing-only;
- every call restarts the wait period;
- the latest arguments and `this` value win;
- `cancel()` prevents the pending invocation;
- `flush()` immediately invokes a pending call and returns its result;
- when nothing is pending, `flush()` returns the most recent result;
- ordinary calls return the most recent result, initially `undefined`.

## Step 1 — Build the smallest debounce

Start without generics, `this`, or control methods:

```js
function debounce(fn, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}
```

Every wrapper call clears the previous timer and schedules a new one. The callback closes over the arguments from that wrapper call. Because every older timer is cancelled, only the newest callback should run.

This is a valid first checkpoint in an interview.

## Step 2 — Preserve dynamic this

An arrow wrapper captures lexical `this`, so it cannot forward the receiver used at the call site. Use a normal function and `apply`:

```js
function debounce(fn, wait) {
  let timer;

  return function debounced(...args) {
    const thisArg = this;
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(thisArg, args);
    }, wait);
  };
}
```

Why it matters:

```js
const searchBox = {
  prefix: "Results for",
  show(query) {
    console.log(`${this.prefix}: ${query}`);
  },
};

searchBox.debouncedShow = debounce(searchBox.show, 250);
searchBox.debouncedShow("closures");
```

The original function must receive `searchBox` as `this`. Avoid an arrow for `debounced` when dynamic receiver preservation is part of the contract.

## Step 3 — Store the latest pending call

`cancel()` and `flush()` need access to call data outside the timer callback. Move it into the closure:

```js
function debounce(fn, wait) {
  let timer;
  let pendingCall;

  return function debounced(...args) {
    pendingCall = { args, thisArg: this };
    clearTimeout(timer);

    timer = setTimeout(() => {
      timer = undefined;
      const call = pendingCall;
      pendingCall = undefined;

      if (call) {
        fn.apply(call.thisArg, call.args);
      }
    }, wait);
  };
}
```

Clear `timer` and `pendingCall` before invoking `fn`. That ordering makes the state accurate if `fn` calls the debounced wrapper again.

## Step 4 — Add cancel

Cancellation must clear both scheduled work and retained references:

```js
debounced.cancel = function cancel() {
  if (timer !== undefined) {
    clearTimeout(timer);
  }

  timer = undefined;
  pendingCall = undefined;
};
```

Only clearing the timer is functionally close, but it unnecessarily retains the latest arguments and receiver. Those values may reference large object graphs.

Calling `cancel()` repeatedly should be harmless.

## Step 5 — Add one invocation helper

The timer and `flush()` must perform exactly the same state transition. Centralize it:

```js
function invoke() {
  const call = pendingCall;
  pendingCall = undefined;

  if (!call) return result;

  result = fn.apply(call.thisArg, call.args);
  return result;
}
```

The helper snapshots and clears the pending call before user code runs. It also stores the latest return value.

The timer becomes:

```js
timer = setTimeout(() => {
  timer = undefined;
  invoke();
}, wait);
```

## Step 6 — Add flush

`flush()` consumes scheduled work immediately:

```js
debounced.flush = function flush() {
  if (timer === undefined) return result;

  clearTimeout(timer);
  timer = undefined;
  return invoke();
};
```

Clearing the timer before invoking prevents the old callback from running later. A second `flush()` has no pending call, so it returns the latest result without invoking again.

## Step 7 — Add pending state

Do not expose the platform-specific timer handle. Expose the fact the caller cares about:

```js
debounced.pending = function pending() {
  return timer !== undefined;
};
```

After a normal call it is `true`; after delayed execution, `cancel()`, or `flush()`, it is `false`.

## Step 8 — Add TypeScript types

Define the function and wrapper types before using them:

```ts
type AnyFunction = (this: any, ...args: any[]) => any;

export type Debounced<F extends AnyFunction> = {
  (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  pending(): boolean;
};
```

The utility preserves:

- parameter types through `Parameters<F>`;
- the receiver through `ThisParameterType<F>`;
- the result through `ReturnType<F>`.

The wrapper result includes `undefined` because trailing execution has not necessarily happened yet.

## Complete solution

```ts
type AnyFunction = (this: any, ...args: any[]) => any;

type PendingCall<F extends AnyFunction> = {
  args: Parameters<F>;
  thisArg: ThisParameterType<F>;
};

export type Debounced<F extends AnyFunction> = {
  (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  pending(): boolean;
};

export function debounce<F extends AnyFunction>(
  fn: F,
  wait: number,
): Debounced<F> {
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a finite, non-negative number");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  let pendingCall: PendingCall<F> | undefined;
  let result: ReturnType<F> | undefined;

  function invoke() {
    const call = pendingCall;
    pendingCall = undefined;

    if (!call) return result;

    result = fn.apply(call.thisArg, call.args) as ReturnType<F>;
    return result;
  }

  function debounced(
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    pendingCall = { args, thisArg: this };

    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      timer = undefined;
      invoke();
    }, wait);

    return result;
  }

  debounced.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = undefined;
    pendingCall = undefined;
  };

  debounced.flush = () => {
    if (timer === undefined) return result;

    clearTimeout(timer);
    timer = undefined;
    return invoke();
  };

  debounced.pending = () => timer !== undefined;

  return debounced;
}
```

The `as ReturnType<F>` assertion compensates for a current limitation around generic `apply`; the public types still connect the input function to the wrapper accurately.

## Usage examples

### Keep only the latest call

```ts
const search = debounce((query: string) => {
  console.log("Searching for", query);
}, 300);

search("re");
search("rea");
search("react");

// After 300 ms of silence: "Searching for react"
```

### Cancel pending work

```ts
const saveDraft = debounce((text: string) => {
  console.log("Saved", text);
}, 500);

saveDraft("unfinished text");
saveDraft.cancel();

// Nothing is saved.
```

### Flush before navigation

```ts
const persist = debounce((value: string) => {
  localStorage.setItem("draft", value);
  return value.length;
}, 500);

persist("interview notes");
const savedLength = persist.flush(); // 15
```

### Preserve this

```ts
const editor = {
  documentId: "doc-42",
  save(this: { documentId: string }, text: string) {
    return `${this.documentId}:${text}`;
  },
};

const save = debounce(editor.save, 200);
const result = save.call(editor, "draft"); // undefined
const flushed = save.flush(); // "doc-42:draft"
```

## React application — useDebounce

React components often need a debounced **value**, rather than an imperative function wrapper. A search input should update immediately so typing stays responsive, while expensive work observes a value that changes only after the quiet interval.

Build that behavior directly with state and an Effect:

```tsx
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

The state has two different meanings:

- `value` is the latest value supplied by the component;
- `debouncedValue` is the latest value whose quiet interval completed.

Whenever `value` or `delay` changes, React runs the previous cleanup before starting the new Effect. The cleanup cancels the obsolete timer, so only the latest value is committed.

### Use it in a search component

```tsx
import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce";

type SearchResult = {
  id: string;
  title: string;
};

type SearchBoxProps = {
  search(query: string, signal: AbortSignal): Promise<SearchResult[]>;
};

export function SearchBox({ search }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const debouncedQuery = useDebounce(query.trim(), 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    search(debouncedQuery, controller.signal)
      .then(setResults)
      .catch(error => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);
      });

    return () => controller.abort();
  }, [debouncedQuery, search]);

  return (
    <section>
      <label htmlFor="search-query">Search</label>
      <input
        id="search-query"
        type="search"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />

      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </section>
  );
}
```

Debouncing and request cancellation solve different problems:

- `useDebounce` reduces how often a request starts;
- `AbortController` prevents an obsolete request from winning a race or wasting work.

### Why not call debounce during render?

This creates a new wrapper and a new timer closure on every render:

```tsx
// Incorrect: wrapper state is discarded on every render.
const searchLater = debounce(search, 300);
```

The value hook fits React's lifecycle naturally and its Effect cleanup acts as cancellation. If a component specifically needs an imperative debounced callback with public `cancel()` and `flush()` methods, build a separate `useDebouncedCallback` hook that keeps one wrapper instance and always calls the latest callback. Do not complicate `useDebounce` with an API its consumers do not need.

## Timeline reasoning

Suppose `wait` is 100 ms:

```text
0 ms    debounced("A")  → timer 1
40 ms   debounced("B")  → cancel timer 1, create timer 2
90 ms   debounced("C")  → cancel timer 2, create timer 3
190 ms  timer 3 fires   → fn("C")
```

Debounce does not guarantee execution every 100 ms. Continuous calls can postpone trailing execution indefinitely. Throttle solves a different problem: it limits execution frequency during continued activity.

## Testing strategy

Use fake timers so tests express time without waiting in real time.

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { debounce } from "./debounce";

describe("debounce", () => {
  afterEach(() => vi.useRealTimers());

  it("invokes once with the latest arguments", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    vi.advanceTimersByTime(50);
    debounced("latest");
    vi.advanceTimersByTime(99);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith("latest");
  });

  it("cancels a pending invocation", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced.cancel();
    vi.runAllTimers();

    expect(fn).not.toHaveBeenCalled();
    expect(debounced.pending()).toBe(false);
  });

  it("flushes exactly once and returns the result", () => {
    vi.useFakeTimers();
    const fn = vi.fn((value: number) => value * 2);
    const debounced = debounce(fn, 100);

    debounced(4);

    expect(debounced.flush()).toBe(8);
    expect(debounced.flush()).toBe(8);
    vi.runAllTimers();
    expect(fn).toHaveBeenCalledOnce();
  });

  it("preserves the receiver", () => {
    vi.useFakeTimers();
    const receiver = {
      value: 7,
      read(this: { value: number }) {
        return this.value;
      },
    };
    const debounced = debounce(receiver.read, 100);

    debounced.call(receiver);

    expect(debounced.flush()).toBe(7);
  });
});
```

Also test:

- repeated calls restart the complete wait period;
- `cancel()` is idempotent;
- calling again after cancellation works;
- `pending()` changes after timeout, cancel, and flush;
- a reentrant original function can schedule another call;
- invalid waits throw according to the chosen contract.

## Complexity

For each wrapper call:

- time: `O(1)`, excluding platform timer work;
- retained state: `O(a)`, where `a` is the size of the latest argument list;
- timers: at most one active timer per debounced wrapper.

The utility retains the latest receiver and arguments until execution or cancellation. That lifecycle is why cleanup matters.

## Common interview mistakes

- Creating the timer variable inside the wrapper, so calls cannot cancel one another.
- Using an arrow wrapper when dynamic `this` must be preserved.
- Keeping the first call's arguments instead of the latest call's arguments.
- Implementing `flush()` without clearing the scheduled timer, causing two invocations.
- Clearing the timer but retaining arguments after `cancel()`.
- Using a truthiness check for a timer handle instead of comparing with `undefined`.
- Clearing pending state after invoking user code, which makes reentrancy harder to reason about.
- Claiming debounce executes periodically during continuous activity.
- Adding leading/trailing options before the baseline works.

## Senior follow-up discussion

### What changes for leading execution?

Invoke immediately only when no wait window is active. You must then define whether a trailing call also runs, what result later calls return, and whether one isolated call fires once or twice.

### What is maxWait?

Ordinary debounce can postpone work forever under continuous calls. `maxWait` adds a second deadline so the function runs after a bounded interval even without a quiet period. It requires tracking time or another timer and carefully reconciling both deadlines.

### What if the function returns a promise?

The utility stores and returns that promise like any other value. Ordinary calls made before the first invocation still return `undefined`. Cancellation cannot cancel an already-started promise; the underlying operation needs its own cancellation mechanism such as `AbortSignal`.

### Why derive the timer type from setTimeout?

Browsers commonly return a number while Node.js can return an object. `ReturnType<typeof setTimeout>` follows the active TypeScript environment without hard-coding either representation.

### Could AbortSignal replace cancel?

It can complement the method when cancellation must compose with a larger operation. Register an abort listener that calls `cancel()`, remove that listener when the wrapper is disposed, and distinguish cancelling the scheduled invocation from aborting work that already began.

## Interview-ready explanation

The wrapper closes over one timer and the latest pending call. Each call replaces both, so a quiet interval produces exactly one trailing invocation with the latest arguments and receiver. Invocation snapshots and clears pending state before calling user code, which keeps reentrant behavior consistent. `cancel()` clears the timer and retained references; `flush()` clears the timer, consumes the pending call once, and returns its result. The public type preserves the original parameters, `this`, and return type while acknowledging that no result exists before the first invocation.

## Final checklist

- [ ] One closure owns one timer.
- [ ] Every call restarts the wait period.
- [ ] The latest arguments and dynamic `this` are preserved.
- [ ] Invocation clears pending state before user code runs.
- [ ] `cancel()` removes scheduled work and retained references.
- [ ] `flush()` cannot cause a later duplicate invocation.
- [ ] Return-value behavior is explicit.
- [ ] Fake-timer tests cover timing and control methods.
- [ ] Debounce and throttle are explained as different contracts.
