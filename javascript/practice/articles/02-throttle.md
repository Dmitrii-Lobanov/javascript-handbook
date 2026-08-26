# Throttle with Leading and Trailing Calls

## The interview prompt

Implement a `throttle` utility that limits how often a function can run. Preserve the latest arguments and dynamic `this`, support leading and trailing execution, and add `cancel()` and `flush()`.

We will start with a small leading-only throttle. Then we will retain the latest suppressed call, add explicit options, and finish with control methods and TypeScript types.

## Clarify the contract

Ask before coding:

1. May the function run immediately when a time window begins?
2. Should the latest suppressed call run at the end of the window?
3. Which arguments and `this` value win during repeated calls?
4. What should ordinary wrapper calls return?
5. What should `cancel()` and `flush()` do?
6. Is `wait = 0` allowed?

For this tutorial:

- `leading` and `trailing` both default to `true`;
- at most one invocation occurs in each wait window;
- the latest suppressed call supplies trailing arguments and `this`;
- `cancel()` removes the timer and pending call;
- `flush()` immediately executes a pending trailing call;
- calls return the latest invocation result, initially `undefined`;
- a finite, non-negative wait is required.

The central invariant is simple:

```text
no active timer → a new execution window may begin
active timer    → calls are suppressed and only the latest may be retained
```

## Step 1 — Build a leading-only throttle

Use one closure variable to remember whether a window is active:

```js
function throttle(fn, wait) {
  let timer;

  return function throttled(...args) {
    if (timer !== undefined) return;

    fn.apply(this, args);

    timer = setTimeout(() => {
      timer = undefined;
    }, wait);
  };
}
```

The first call executes immediately. Later calls during the window are ignored. When the timer finishes, the next call may execute.

This is a valid first checkpoint, but it loses the user's final action:

```text
0 ms    call("A") → run "A"
30 ms   call("B") → ignored
70 ms   call("C") → ignored
100 ms             → window ends; "C" never runs
```

## Step 2 — Retain the latest suppressed call

Store arguments and `this` together:

```js
function throttle(fn, wait) {
  let timer;
  let pendingCall;

  function invoke() {
    const call = pendingCall;
    pendingCall = undefined;

    if (call) {
      fn.apply(call.thisArg, call.args);
    }
  }

  return function throttled(...args) {
    pendingCall = { args, thisArg: this };

    if (timer !== undefined) return;

    invoke();
    timer = setTimeout(() => {
      timer = undefined;
      invoke();
    }, wait);
  };
}
```

Now the first call runs immediately and the latest suppressed call runs when the timer expires.

Clear `pendingCall` before invoking user code. If `fn` calls the wrapper again, that reentrant call becomes new pending work rather than being accidentally erased afterward.

## Step 3 — Keep the next window active

There is a subtle boundary problem in the previous version. The timer is cleared before the trailing call runs. If that call synchronously invokes the wrapper, it may start another leading call immediately.

Start the next window before invoking the trailing call:

```js
function startTimer() {
  timer = setTimeout(onTimer, wait);
}

function onTimer() {
  timer = undefined;

  if (pendingCall) {
    startTimer();
    invoke();
  }
}
```

A trailing invocation begins a new throttle window. If no additional call arrives, the extra timer simply ends that window without invoking anything.

## Step 4 — Add leading and trailing options

Define the options before using them:

```ts
export type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};
```

The wrapper handles a new window differently depending on `leading`:

```js
if (timer === undefined) {
  startTimer();

  if (leading) {
    invoke();
  }

  return result;
}
```

When `leading` is `false`, the first call remains pending until the timer ends. During that wait, later calls replace it, so the latest one runs.

While a window is active, retain calls only when trailing execution is enabled:

```js
if (trailing) {
  pendingCall = { args, thisArg: this };
}
```

The four option combinations are:

| Leading | Trailing | Behavior |
| --- | --- | --- |
| `true` | `true` | Run immediately and retain the latest additional call |
| `true` | `false` | Run immediately and ignore calls during the window |
| `false` | `true` | Delay and run only the latest call at the boundary |
| `false` | `false` | Never invoke; valid but rarely useful |

## Step 5 — Preserve and return results

Store the latest invocation result in the shared helper:

```js
function invoke() {
  const call = pendingCall;
  pendingCall = undefined;

  if (!call) return result;

  result = fn.apply(call.thisArg, call.args);
  return result;
}
```

A leading call can return its fresh result immediately. Suppressed calls return the most recent result because no new invocation occurred.

## Step 6 — Add cancel

Cancellation ends the current window and discards the pending trailing call:

```js
throttled.cancel = function cancel() {
  if (timer !== undefined) {
    clearTimeout(timer);
  }

  timer = undefined;
  pendingCall = undefined;
};
```

The next wrapper call behaves like the first call of a new throttle lifecycle.

## Step 7 — Add flush

`flush()` executes pending trailing work immediately:

```js
throttled.flush = function flush() {
  if (timer === undefined || !pendingCall) return result;

  clearTimeout(timer);
  timer = undefined;
  return invoke();
};
```

Clearing the timer prevents a duplicate invocation later. This contract ends the current window, so the next ordinary call may begin a new one immediately.

## Step 8 — Add TypeScript types

```ts
type AnyFunction = (this: any, ...args: any[]) => any;

export type Throttled<F extends AnyFunction> = {
  (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  pending(): boolean;
};
```

The public wrapper preserves the original parameter, receiver, and result types. Its return type includes `undefined` because a trailing-only wrapper has no result before its first invocation.

## Complete solution

```ts
type AnyFunction = (this: any, ...args: any[]) => any;

type PendingCall<F extends AnyFunction> = {
  args: Parameters<F>;
  thisArg: ThisParameterType<F>;
};

export type ThrottleOptions = {
  leading?: boolean;
  trailing?: boolean;
};

export type Throttled<F extends AnyFunction> = {
  (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<F> | undefined;
  cancel(): void;
  flush(): ReturnType<F> | undefined;
  pending(): boolean;
};

export function throttle<F extends AnyFunction>(
  fn: F,
  wait: number,
  options: ThrottleOptions = {},
): Throttled<F> {
  if (!Number.isFinite(wait) || wait < 0) {
    throw new RangeError("wait must be a finite, non-negative number");
  }

  const { leading = true, trailing = true } = options;
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

  function startTimer() {
    timer = setTimeout(onTimer, wait);
  }

  function onTimer() {
    timer = undefined;

    if (trailing && pendingCall) {
      startTimer();
      invoke();
    } else {
      pendingCall = undefined;
    }
  }

  function throttled(
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ) {
    if (timer === undefined) {
      pendingCall = { args, thisArg: this };
      startTimer();

      if (leading) {
        invoke();
      }

      return result;
    }

    if (trailing) {
      pendingCall = { args, thisArg: this };
    }

    return result;
  }

  throttled.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }

    timer = undefined;
    pendingCall = undefined;
  };

  throttled.flush = () => {
    if (timer === undefined || !pendingCall) return result;

    clearTimeout(timer);
    timer = undefined;
    return invoke();
  };

  throttled.pending = () => pendingCall !== undefined;

  return throttled;
}
```

Here, `pending()` means “a call is waiting to execute,” not merely “a throttle window is active.” Immediately after a leading invocation it returns `false`, even though later calls are still temporarily limited.

## Timeline reasoning

With `wait = 100`, `leading = true`, and `trailing = true`:

```text
0 ms    call("A") → invoke "A", start window
30 ms   call("B") → retain "B"
70 ms   call("C") → replace pending call with "C"
100 ms            → invoke "C", start next window
140 ms  call("D") → retain "D"
200 ms            → invoke "D"
```

Only the latest suppressed call is relevant. Throttle bounds execution frequency while activity continues; debounce waits for activity to stop.

## Usage examples

### Limit scroll measurements

```ts
const measureScroll = throttle(() => {
  console.log(window.scrollY);
}, 100);

window.addEventListener("scroll", measureScroll);

// Cleanup:
window.removeEventListener("scroll", measureScroll);
measureScroll.cancel();
```

### Trailing-only updates

```ts
const reportPosition = throttle(
  (x: number, y: number) => ({ x, y }),
  100,
  { leading: false, trailing: true },
);

reportPosition(10, 20); // undefined
reportPosition(30, 40); // undefined
reportPosition.flush(); // { x: 30, y: 40 }
```

### Preserve dynamic this

```ts
const tracker = {
  prefix: "pointer",
  record(this: { prefix: string }, x: number) {
    return `${this.prefix}:${x}`;
  },
};

const record = throttle(tracker.record, 100);
const result = record.call(tracker, 42); // "pointer:42"
```

## React application — useThrottle

React components often need a throttled value for high-frequency visual input such as pointer coordinates or scroll position. The source state stays current, while consumers observe updates at most once per interval.

```tsx
import { useEffect, useRef, useState } from "react";

export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRunRef = useRef(Date.now());

  useEffect(() => {
    const elapsed = Date.now() - lastRunRef.current;
    const remaining = Math.max(0, delay - elapsed);

    if (remaining === 0) {
      lastRunRef.current = Date.now();
      setThrottledValue(value);
      return;
    }

    const timer = setTimeout(() => {
      lastRunRef.current = Date.now();
      setThrottledValue(value);
    }, remaining);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return throttledValue;
}
```

Each new value replaces the timer while preserving the original window deadline. Unlike debounce, continuous updates do not restart the complete delay, so a recent value is published when the window ends.

### Use it for pointer coordinates

```tsx
import { useState, type PointerEvent } from "react";
import { useThrottle } from "./useThrottle";

type Point = {
  x: number;
  y: number;
};

export function PointerTracker() {
  const [point, setPoint] = useState<Point>({ x: 0, y: 0 });
  const throttledPoint = useThrottle(point, 100);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    setPoint({ x: event.clientX, y: event.clientY });
  }

  return (
    <div onPointerMove={handlePointerMove}>
      <p>
        Latest sampled position: {throttledPoint.x}, {throttledPoint.y}
      </p>
    </div>
  );
}
```

This hook throttles the value consumed by downstream logic; it does not prevent the component from receiving every pointer event or updating `point`. For expensive event handling, use a stable throttled callback or subscribe imperatively inside an Effect. For animation work synchronized with painting, `requestAnimationFrame` may be a better scheduler than a millisecond throttle.

## Testing strategy

Use fake timers and test observable timing rather than private variables:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { throttle } from "./throttle";

describe("throttle", () => {
  afterEach(() => vi.useRealTimers());

  it("runs a leading call immediately", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("A");

    expect(fn).toHaveBeenCalledWith("A");
  });

  it("runs one trailing call with the latest arguments", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("A");
    throttled("B");
    throttled("C");
    vi.advanceTimersByTime(100);

    expect(fn.mock.calls).toEqual([["A"], ["C"]]);
  });

  it("supports trailing-only behavior", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100, { leading: false });

    throttled("A");
    throttled("B");
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith("B");
  });

  it("cancels pending trailing work", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled("A");
    throttled("B");
    throttled.cancel();
    vi.runAllTimers();

    expect(fn.mock.calls).toEqual([["A"]]);
  });

  it("flushes pending work exactly once", () => {
    vi.useFakeTimers();
    const fn = vi.fn((value: number) => value * 2);
    const throttled = throttle(fn, 100);

    throttled(2);
    throttled(4);

    expect(throttled.flush()).toBe(8);
    vi.runAllTimers();
    expect(fn.mock.calls).toEqual([[2], [4]]);
  });
});
```

Also test:

- leading-only mode ignores calls inside a window;
- dynamic `this` is preserved for leading and trailing calls;
- `cancel()` is idempotent and a later call starts fresh;
- `pending()` distinguishes retained work from an active empty window;
- suppressed calls return the latest result;
- a trailing invocation does not permit an immediate reentrant leading call;
- invalid wait values follow the declared contract.

## Complexity

For every wrapper call:

- time: `O(1)`, excluding platform timer scheduling;
- retained state: `O(a)`, where `a` is the latest argument list size;
- active timers: at most one per throttled wrapper.

The latest receiver and arguments remain reachable until invocation or cancellation, so cleanup is part of the memory contract.

## Common interview mistakes

- Confusing throttle with debounce and restarting the whole window on every call.
- Dropping every call during the window when trailing behavior is required.
- Keeping the first suppressed arguments instead of the latest.
- Using an arrow wrapper when dynamic `this` matters.
- Clearing state after user code runs and breaking reentrant behavior.
- Running both leading and trailing for one isolated call without defining that policy.
- Letting `flush()` invoke now and again when the old timer fires.
- Treating a timer handle as a boolean instead of comparing with `undefined`.
- Exposing contradictory option behavior without documenting it.
- Claiming a time-based throttle is synchronized with browser painting.

## Senior follow-up discussion

### Timer-based or timestamp-based?

A timer-based implementation maps naturally to trailing execution and control methods. A timestamp strategy can decide immediately whether enough time elapsed, but still needs a timer if the latest suppressed call must run. A hybrid is common when precise boundary behavior matters.

### What about clock drift?

Timers run no earlier than their delay and can be postponed by long tasks, background-tab clamping, or a busy event loop. If the contract is based on elapsed time rather than approximate windows, calculate remaining time from a monotonic clock such as `performance.now()`.

### When should requestAnimationFrame be used?

For visual DOM reads and writes caused by pointer, scroll, or resize input, scheduling once per animation frame often aligns work better with rendering. It limits work to frame cadence rather than an arbitrary millisecond interval and should be cancelled during cleanup.

### What if the function returns a promise?

The promise is stored like any result. Throttling limits when operations start; it does not limit how many previously started operations remain in flight. Add a concurrency or cancellation policy separately when that matters.

### How is this different from debounce?

Throttle permits periodic execution during continuous activity. Debounce postpones trailing execution until a quiet interval. Use throttle for sampling sustained input and debounce for reacting after input settles.

## Interview-ready explanation

The wrapper closes over one timer, the latest pending call, and the latest result. With no active timer, a call starts a new window and optionally runs on the leading edge. Calls during that window are suppressed, but trailing mode replaces the retained arguments and receiver so the latest call runs at the boundary. The next window is established before a trailing invocation to keep reentrant calls throttled. `cancel()` clears both scheduled work and references, while `flush()` consumes pending work once and ends the current window.

## Final checklist

- [ ] One closure owns one active timer.
- [ ] Leading and trailing behavior is explicitly defined.
- [ ] Only the latest suppressed call is retained.
- [ ] Arguments, dynamic `this`, and return values are preserved.
- [ ] Trailing invocation handles reentrancy consistently.
- [ ] `cancel()` clears the timer and pending references.
- [ ] `flush()` cannot cause a duplicate later invocation.
- [ ] Fake-timer tests cover all option combinations.
- [ ] Throttle and debounce are explained as different contracts.
- [ ] The React hook is presented as application material, not the core utility.
