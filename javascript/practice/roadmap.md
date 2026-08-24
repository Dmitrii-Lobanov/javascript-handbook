# JavaScript Practice Roadmap

## Goal

Create ten explanatory live-coding articles for JavaScript interview preparation. Each article should teach how to reason about the task, establish a small contract, implement a correct baseline, and add production behavior one requirement at a time.

The collection complements JavaScript Q&A:

- Q&A prepares concise explanations;
- the handbook builds connected mental models;
- Practice turns those models into executable code under interview constraints.

## Article structure

Every article should follow the same sequence:

1. Clarify the prompt and scope.
2. Use RADIO for a short system-design pass when the task has meaningful boundaries.
3. Define types, public APIs, and invariants.
4. Build the smallest working implementation.
5. Add one business requirement at a time.
6. Assemble a copyable complete solution.
7. Explain complexity, tests, traps, and production extensions.
8. Finish with a concise interview-ready explanation.

Do not begin with the most generic or production-complete abstraction. Preserve a visible first checkpoint that a candidate could finish during the interview.

## Roadmap

### Part I — Function control

#### 1. Debounce with cancel and flush

**Slug:** `01-debounce`

**Prompt:** Implement a debounce utility that delays execution until calls stop for a configured interval.

**Core version:**

- Preserve arguments and dynamic `this`.
- Return a stable wrapper.
- Reset the timeout after every call.
- Add `cancel()` and `flush()`.

**Senior extensions:** leading/trailing modes, return values, pending state, timer typing, reentrancy, memory cleanup, and comparison with throttling.

**Primary concepts:** closures, timers, `this`, rest parameters, function APIs.

#### 2. Throttle with leading and trailing calls

**Slug:** `02-throttle`

**Prompt:** Implement a throttle utility that limits execution frequency without losing the final relevant call.

**Core version:**

- Execute at most once per interval.
- Preserve the latest arguments.
- Support leading and trailing behavior.
- Add cancellation.

**Senior extensions:** timestamp versus timer strategies, clock drift, reentrancy, result semantics, and animation-frame throttling.

**Primary concepts:** time windows, closures, scheduling, API contracts.

#### 3. Memoize with configurable cache keys

**Slug:** `03-memoize`

**Prompt:** Cache function results so repeated calls with the same logical inputs avoid repeated work.

**Core version:**

- Cache primitive argument tuples safely.
- Preserve `this` and return values.
- Accept an optional key resolver.
- Cache falsy values correctly.

**Senior extensions:** promise rejection eviction, TTL, bounded caches, weak references, object identity, serialization hazards, and invalidation.

**Primary concepts:** closures, maps, identity, cache policy.

### Part II — Structural data

#### 4. Deep clone

**Slug:** `04-deep-clone`

**Prompt:** Clone nested values without sharing mutable child references.

**Core version:**

- Clone arrays and plain objects.
- Preserve primitives.
- Handle circular references with `WeakMap`.
- Explain unsupported values explicitly.

**Senior extensions:** property descriptors, prototypes, symbols, Maps, Sets, Dates, typed arrays, functions, and comparison with `structuredClone`.

**Primary concepts:** recursion, graphs, identity, prototypes, built-ins.

#### 5. Deep equality

**Slug:** `05-deep-equal`

**Prompt:** Determine whether two nested values are structurally equivalent.

**Core version:**

- Compare primitives with deliberate equality semantics.
- Compare arrays and plain objects recursively.
- Compare own keys without depending on order.
- Protect circular traversal.

**Senior extensions:** alias topology, prototypes, Maps, Sets, Dates, symbols, descriptors, and custom comparators.

**Primary concepts:** recursion, equality, graph pairs, own properties.

### Part III — Events and asynchronous coordination

#### 6. Event emitter

**Slug:** `06-event-emitter`

**Prompt:** Build an event emitter with subscription, unsubscription, one-time listeners, and deterministic emission.

**Core version:**

- `on`, `off`, and `emit`.
- Return an unsubscribe function.
- Add `once`.
- Define listener order and mutation during emission.

**Senior extensions:** typed event maps, error policy, listener limits, reentrancy, wildcard events, and async listeners.

**Primary concepts:** Maps, Sets, callbacks, snapshots, reentrancy.

#### 7. Implement Promise.all

**Slug:** `07-promise-all`

**Prompt:** Implement the essential behavior of `Promise.all` for an iterable of values and promises.

**Core version:**

- Preserve input order regardless of completion order.
- Accept non-promise values.
- Resolve an empty iterable immediately.
- Reject on the first observed rejection.

**Senior extensions:** arbitrary iterables, thenable assimilation, iterator errors, microtask behavior, and why already-started work is not cancelled.

**Primary concepts:** promises, iterables, ordering, fail-fast coordination.

#### 8. Concurrency-limited promise pool

**Slug:** `08-promise-pool`

**Prompt:** Run asynchronous task functions with a configurable maximum concurrency.

**Core version:**

- Never exceed the limit.
- Preserve result order.
- Start new work as slots become available.
- Define failure behavior.

**Senior extensions:** fail-fast versus all-settled modes, cancellation, progress, dynamic queues, fairness, backpressure, and retries.

**Primary concepts:** scheduling, queues, promises, concurrency invariants.

#### 9. Retry with backoff and cancellation

**Slug:** `09-retry-with-backoff`

**Prompt:** Retry an asynchronous operation using bounded exponential backoff while respecting cancellation.

**Core version:**

- Configure maximum attempts.
- Delay between attempts.
- Stop after success or terminal failure.
- Accept an `AbortSignal`.

**Senior extensions:** jitter, retry classification, server retry hints, total deadlines, idempotency, observability, and testable clocks.

**Primary concepts:** async control flow, timers, abort signals, resilience.

### Part IV — Stateful data structures

#### 10. LRU cache

**Slug:** `10-lru-cache`

**Prompt:** Implement a fixed-capacity least-recently-used cache with efficient reads, writes, and eviction.

**Core version:**

- `get` refreshes recency.
- `set` inserts or updates.
- Evict the least recently used entry at capacity.
- Handle zero capacity deliberately.

**Senior extensions:** Map insertion-order solution, hash map plus doubly linked list, TTL interaction, metrics, memory limits, and concurrency assumptions.

**Primary concepts:** Maps, linked lists, invariants, amortized complexity.

## Recommended publishing order

1. Debounce
2. Promise.all
3. Event emitter
4. Deep clone
5. Promise pool
6. Throttle
7. Deep equality
8. Retry with backoff
9. Memoize
10. LRU cache

This order publishes recognizable interview tasks early while alternating function, object, event, and async reasoning.

## Definition of done for an article

- The first working implementation is realistically finishable during an interview.
- All code samples define types before use and copy as valid source text.
- No framework-specific directive appears in plain React or JavaScript samples.
- Edge cases are introduced only after the baseline works.
- Complexity statements match the actual implementation.
- Tests cover behavior rather than private implementation.
- The article distinguishes language guarantees from chosen API policy.
- Production extensions explain trade-offs without bloating the core solution.
