
# Rendering and component identity

## Card 1

- question  
  What happens when a React component renders?

- answer  
  React rendering has two main phases:

  - **Render phase:** React calls components and calculates what the UI should look like.
  - **Commit phase:** React applies the necessary changes to the DOM and runs commit-related logic.

  Rendering does not necessarily mean that React changes the DOM.

- explanation  
  React compares the newly produced element tree with the previous tree and commits only the required updates.

- details  
  A render may be triggered by:

  - An initial root render
  - A state update
  - A parent render
  - A context update
  - An external-store notification
  - A subscribed framework update

  Component functions must remain pure during rendering. They should not modify the DOM, start subscriptions, make uncontrolled network calls, or mutate external state.

  React may start, pause, restart, or discard render work. Side effects in render are therefore unsafe.

  After render work is complete, React commits DOM changes. It then runs layout effects and later passive effects.

  A component may render without producing a DOM update if its output is equivalent to the previous output.

---

## Card 2

- question  
  How does React reconciliation work?

- answer  
  Reconciliation is the process React uses to compare a new element tree with the previous tree and determine which parts of the rendered interface should be updated, preserved, replaced, or removed.

  React uses element types, positions, and keys as important identity signals.

- explanation  
  When the element type at a position changes, React generally replaces that subtree and resets its state.

- details  
  If an element keeps the same type and identity, React can reuse its existing DOM node and component state:

  ```jsx
  <Profile name="Alex" />
  <Profile name="Sam" />
  ```

  The `Profile` instance is preserved and receives new props.

  Changing the type resets the subtree:

  ```jsx
  {isEditing
    ? <EditProfile />
    : <Profile />}
  ```

  React does not perform a generic character-by-character comparison of arbitrary trees. Its practical rules rely heavily on stable types and keys.

  Reconciliation produces changes during render, but those changes do not affect the DOM until the commit phase.

---

## Card 3

- question  
  How do state snapshots and automatic batching work?

- answer  
  Each render receives a snapshot of state. Calling a state setter schedules a future render; it does not change the state variable captured by the current render.

  React batches multiple state updates so they can often be processed in one render.

- explanation  
  Repeatedly using a captured state value may produce only one effective increment:

  ```jsx
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  ```

- details  
  Each call above uses the same `count` snapshot. Use updater functions when the next state depends on the previous state:

  ```jsx
  setCount(count => count + 1);
  setCount(count => count + 1);
  setCount(count => count + 1);
  ```

  This increments by three.

  State should be treated as immutable:

  ```jsx
  setUser(previous => ({
    ...previous,
    name: "Sam"
  }));
  ```

  Batching reduces unnecessary renders and prevents partially updated UI. Avoid assuming that state is updated immediately after calling its setter.

---

## Card 4

- question  
  How do keys affect component identity and state?

- answer  
  Keys identify sibling elements across renders. React uses them to match previous elements with new elements when lists are reordered, inserted into, or deleted from.

  Keys also control whether component state is preserved or reset.

- explanation  
  A stable key should represent the underlying data rather than its current array position.

  ```jsx
  users.map(user => (
    <UserRow key={user.id} user={user} />
  ))
  ```

- details  
  Array indexes are risky when list order can change. State may become associated with the wrong item:

  ```jsx
  users.map((user, index) => (
    <UserRow key={index} user={user} />
  ))
  ```

  Keys need to be unique only among siblings, not globally.

  Changing a key intentionally resets a subtree:

  ```jsx
  <ProfileEditor
    key={selectedUserId}
    userId={selectedUserId}
  />
  ```

  React associates state with a component’s position, type, and key in the render tree. See [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

---

## Card 26

- question  
  What does Strict Mode do in React?

- answer  
  Strict Mode enables additional development-only checks that expose unsafe rendering, missing Effect cleanup, and deprecated behavior.

  It does not change production behavior.

- explanation  
  React may intentionally render components or repeat setup-and-cleanup cycles during development to reveal code that is not resilient.

- details  
  A component must remain correct when React calls its render function more than once:

  ```jsx
  function List({ items }) {
    const sortedItems = items.toSorted();
    return <Results items={sortedItems} />;
  }
  ```

  Mutating `items` during rendering would be exposed by repeated rendering.

  An Effect must mirror setup with cleanup:

  ```jsx
  useEffect(() => {
    connection.connect();

    return () => {
      connection.disconnect();
    };
  }, []);
  ```

  Do not remove Strict Mode merely to hide duplicate development behavior. Fix the impure render, missing cleanup, or lifecycle assumption it reveals.

---

## State management and forms

### Card 5

- question  
  What is the difference between controlled and uncontrolled components?

- answer  
  A controlled input receives its current value from React state and reports changes through a handler.

  An uncontrolled input stores its current value in the DOM and is normally read through a ref or form submission.

- explanation  
  Controlled inputs make React state the source of truth:

  ```jsx
  <input
    value={name}
    onChange={event => setName(event.target.value)}
  />
  ```

- details  
  Uncontrolled input:

  ```jsx
  const inputRef = useRef(null);

  <input
    ref={inputRef}
    defaultValue="Alex"
  />;
  ```

  Controlled inputs are useful for:

  - Immediate validation
  - Conditional interface updates
  - Formatting
  - Coordinating related fields

  Uncontrolled inputs can reduce state wiring and work well with native form behavior.

  An input should not switch unexpectedly between controlled and uncontrolled modes. Use a defined initial value such as `""` for a controlled text input.

  Control is also an architectural concept: a controlled component receives important behavior through props, while an uncontrolled component manages more of its own state.

---

### Card 6

- question  
  How should state be structured in a large React application?

- answer  
  Keep state as local as possible, lift it only to the nearest shared owner, avoid duplicated or contradictory state, and derive values that can be calculated during rendering.

  Separate server state, URL state, form state, and client UI state according to their different lifecycles.

- explanation  
  Storing derived values can create synchronization bugs:

  ```jsx
  // Avoid storing this separately
  const fullName = `${firstName} ${lastName}`;
  ```

- details  
  Good state design generally:

  - Groups values that change together
  - Avoids impossible combinations
  - Avoids duplicating props in state
  - Uses IDs instead of duplicating complete objects
  - Normalizes complex shared data when useful
  - Preserves a single source of truth

  Do not copy a prop into state unless the component intentionally needs an independent initial value.

  State ownership should follow the components that need to read and update it. Not all shared state needs a global store; composition, lifting state, context, or URL parameters may be sufficient.

---

### Card 11

- question  
  How do you prevent Context from causing unnecessary renders?

- answer  
  Context consumers re-render when the provider supplies a different context value according to `Object.is`.

  Reduce unnecessary updates by keeping providers focused, splitting unrelated contexts, stabilizing provider values when appropriate, and separating state from dispatch.

- explanation  
  A new object is created on every render here:

  ```jsx
  <UserContext.Provider
    value={{ user, updateUser }}
  >
    {children}
  </UserContext.Provider>
  ```

- details  
  Stabilization may help when the provider frequently renders:

  ```jsx
  const value = useMemo(
    () => ({ user, updateUser }),
    [user, updateUser]
  );
  ```

  Do not memoize automatically; first determine whether consumer rendering is a real problem.

  For frequently changing large state, consider:

  - Multiple narrower contexts
  - State and dispatch contexts
  - Component composition
  - An external store with selectors
  - Moving the provider closer to consumers

  `memo` does not prevent a component from receiving updated context. Context design and subscription granularity matter more.

---

### Card 12

- question  
  When would you choose `useReducer` over `useState`?

- answer  
  Use `useReducer` when state transitions are complex, multiple fields change together, or many handlers express related state operations.

  A reducer centralizes transition logic as a pure function of the current state and an action.

- explanation  
  Components dispatch what happened, while the reducer determines the next state.

  ```jsx
  function reducer(state, action) {
    switch (action.type) {
      case "item-added":
        return {
          ...state,
          items: [...state.items, action.item]
        };
      default:
        throw new Error("Unknown action");
    }
  }
  ```

- details  
  Reducers are useful when:

  - Transitions need explicit names
  - State has related fields
  - Update logic is repeated
  - Transitions need focused tests
  - State updates are difficult to trace

  A reducer must not mutate existing state:

  ```jsx
  // Avoid
  state.items.push(action.item);
  return state;
  ```

  Use `useState` when state is simple and independent. Reducers add structure, but unnecessary action types and boilerplate can make small components harder to understand.

  Reducer plus Context can distribute state, but it does not automatically provide optimized subscriptions.

---

### Card 22

- question  
  How should React subscribe to an external store?

- answer  
  Use `useSyncExternalStore` when React must read and subscribe to state owned outside React.

  It gives React a consistent snapshot API and supports concurrent rendering and server rendering.

- explanation  
  Reading an external mutable value directly during render can cause inconsistent UI because React does not know when it changes.

- details  
  A store supplies subscription and snapshot functions:

  ```jsx
  function useStore() {
    return useSyncExternalStore(
      store.subscribe,
      store.getSnapshot,
      store.getServerSnapshot
    );
  }
  ```

  `getSnapshot` should return a cached, immutable snapshot until the store actually changes. Returning a new object on every call can cause repeated rendering.

  The server snapshot should agree with the initial client snapshot to prevent hydration problems.

  Libraries typically wrap this low-level API and may add selectors, equality comparison, devtools, persistence, and middleware.

---

### Card 23

- question  
  How would you choose a state-management approach for a large React application?

- answer  
  Choose based on state ownership, update frequency, persistence, server synchronization, subscription granularity, debugging needs, and team constraints.

  Start with React’s local state, reducer, composition, and Context before introducing broader infrastructure.

- explanation  
  Different categories of state often need different tools rather than one universal global store.

- details  
  Distinguish among:

  - Local component state
  - Shared client state
  - Server-cached state
  - URL and navigation state
  - Form state
  - Persistent browser state
  - External real-time state

  Evaluate a solution by:

  - Selector and subscription behavior
  - Concurrent-rendering support
  - Server-rendering support
  - Cache invalidation
  - Optimistic updates
  - Developer tooling
  - Type safety
  - Bundle and runtime cost
  - Migration and testing complexity

  Avoid placing all application data in Context merely because it is built in. Also avoid adding a global store when lifting state or component composition solves the problem clearly.

---

## Effects, refs, and reusable Hooks

### Card 7

- question  
  When should you use `useEffect`, and when should you avoid it?

- answer  
  Use `useEffect` to synchronize a component with an external system after React commits the UI.

  External systems include browser APIs, subscriptions, timers, network connections, analytics services, and non-React widgets.

- explanation  
  If a value can be calculated during render or an action belongs in an event handler, an Effect is usually unnecessary.

- details  
  Appropriate synchronization:

  ```jsx
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => connection.disconnect();
  }, [roomId]);
  ```

  Avoid using Effects to:

  - Derive renderable data from props or state
  - Handle a specific button click
  - Reset state that could be reset with a key
  - Chain state updates that can be calculated together

  Effects run on the client, not during server rendering. After dependencies change, React runs the old cleanup and then the new setup.

  React’s guidance defines Effects as synchronization with external systems: [React `useEffect`](https://react.dev/reference/react/useEffect).

---

### Card 8

- question  
  How should Effect dependencies, stale closures, and cleanup be handled?

- answer  
  Every reactive value read by an Effect should normally appear in its dependency list.

  Cleanup must undo the setup performed by the Effect. Stale closures should be solved by correcting dependencies or changing the state design, not by suppressing lint rules.

- explanation  
  An empty dependency array does not mean “run whenever convenient.” It declares that the Effect reads no reactive values.

- details  
  A subscription should clean up using the same dependency values:

  ```jsx
  useEffect(() => {
    const unsubscribe = subscribe(userId, handleUpdate);
    return unsubscribe;
  }, [userId]);
  ```

  Common stale-closure solutions include:

  - Functional state updates
  - Moving calculations into the Effect
  - Stabilizing necessary callbacks
  - Using refs for mutable non-rendering data
  - Separating reactive and non-reactive logic

  Async work should guard against stale results or support cancellation:

  ```jsx
  useEffect(() => {
    const controller = new AbortController();

    loadUser(userId, controller.signal)
      .then(setUser)
      .catch(handleError);

    return () => controller.abort();
  }, [userId]);
  ```

  Cleanup may run more than only at unmount: it also runs before an Effect is repeated with changed dependencies.

---

### Card 9

- question  
  What is the difference between `useEffect` and `useLayoutEffect`?

- answer  
  `useEffect` generally runs after the browser has had an opportunity to paint.

  `useLayoutEffect` runs after DOM changes are committed but before the browser paints, allowing code to measure layout and synchronously adjust the UI.

- explanation  
  Prefer `useEffect`. Use `useLayoutEffect` only when code must read or modify layout before the user sees the frame.

- details  
  Tooltip measurement is a typical layout-effect use case:

  ```jsx
  useLayoutEffect(() => {
    const rectangle =
      tooltipRef.current.getBoundingClientRect();

    setHeight(rectangle.height);
  }, []);
  ```

  Because `useLayoutEffect` can delay painting, excessive work inside it hurts responsiveness.

  Neither hook runs during server rendering. Code using `useLayoutEffect` may need to be isolated to client-only components.

  If an Effect performs a visual adjustment and the user sees flickering, that is a signal that a layout effect might be appropriate.

---

### Card 10

- question  
  When should refs be used instead of state?

- answer  
  Use a ref for a mutable value that must survive renders but should not cause rendering when it changes.

  Use state for information that affects rendered output.

- explanation  
  Common ref uses include DOM access, timer identifiers, previous values, and integration with imperative libraries.

  ```jsx
  const inputRef = useRef(null);

  function focusInput() {
    inputRef.current.focus();
  }
  ```

- details  
  Updating `ref.current` does not trigger a render:

  ```jsx
  const requestIdRef = useRef(null);
  requestIdRef.current = requestId;
  ```

  Do not read or write refs during rendering except for predictable initialization. Rendering should remain pure.

  A component can expose a limited imperative API rather than its entire DOM node:

  ```jsx
  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    }
  }), []);
  ```

  Modern React allows `ref` to be received as a prop in supported component patterns. Callback refs can also return cleanup functions.

---

### Card 13

- question  
  What makes a good custom Hook?

- answer  
  A custom Hook extracts reusable stateful behavior while preserving React’s declarative model.

  It should have a focused responsibility, a clear interface, correct dependency handling, and complete resource cleanup.

- explanation  
  Custom Hooks share logic, not a single state instance. Every call receives independent state unless the hook connects to a shared external source.

- details  
  Example:

  ```jsx
  function useOnlineStatus() {
    const [online, setOnline] = useState(
      navigator.onLine
    );

    useEffect(() => {
      const enable = () => setOnline(true);
      const disable = () => setOnline(false);

      window.addEventListener("online", enable);
      window.addEventListener("offline", disable);

      return () => {
        window.removeEventListener("online", enable);
        window.removeEventListener("offline", disable);
      };
    }, []);

    return online;
  }
  ```

  Good custom Hooks:

  - Begin with `use`
  - Follow the Rules of Hooks
  - Hide implementation details
  - Return a minimal, stable API
  - Avoid premature abstraction
  - Remain composable

  A wrapper around a single trivial line is not automatically a useful abstraction.

---

## Performance and concurrent rendering

### Card 14

- question  
  How do `memo`, `useMemo`, and `useCallback` differ?

- answer  
  - `memo` can skip rendering a component when its props are unchanged.
  - `useMemo` caches a calculated value between renders.
  - `useCallback` caches a function reference between renders.

  All three are performance optimizations, not semantic guarantees.

- explanation  
  Memoization is valuable only when avoided work costs more than comparison and cache management.

- details  
  `memo`:

  ```jsx
  const UserRow = memo(function UserRow({ user }) {
    return <li>{user.name}</li>;
  });
  ```

  `useMemo`:

  ```jsx
  const visibleItems = useMemo(
    () => filterItems(items, query),
    [items, query]
  );
  ```

  `useCallback`:

  ```jsx
  const handleSelect = useCallback(
    id => selectUser(id),
    [selectUser]
  );
  ```

  Memoization can fail when props are recreated every render. Custom equality functions are risky if they ignore changing callbacks or cost more than rendering.

  React Compiler can automatically apply memoization in compiled applications, reducing the need for manual memoization. Manual tools still matter for deliberate identity contracts and uncompiled code.

---

### Card 15

- question  
  How would you diagnose and improve React rendering performance?

- answer  
  Measure with the React Profiler and browser performance tools, identify expensive commits or interactions, and optimize the actual bottleneck.

  Do not treat every render as a performance bug.

- explanation  
  A render that produces no DOM changes may be inexpensive. Focus on user-visible delay, long tasks, repeated expensive calculations, and unnecessarily broad updates.

- details  
  Use a measure-first workflow instead of adding memoization immediately.

  1. **Define the slow interaction.** Record a concrete action such as typing in search, opening a panel, or changing a filter. Note the device, data size, and network conditions so the result is reproducible.
  2. **Separate React work from browser work.** Use the browser Performance panel to check whether time is spent in JavaScript, style calculation, layout, paint, network activity, or React rendering. React cannot optimize a slow image decode or an expensive CSS layout with `memo`.
  3. **Profile the React update.** Record the interaction with React DevTools Profiler. Inspect long commits, components with high self time, and components that render many times. Use “Why did this render?” information to trace changed props, state, Context, or external-store snapshots.
  4. **Find the update source.** Look for state placed too high in the tree, broad Context providers, unstable object or callback props, Effect-driven update chains, duplicated derived state, and subscriptions that notify more consumers than necessary.
  5. **Apply the smallest relevant fix.** Change the architecture before adding widespread memoization.
  6. **Measure again.** Compare the same interaction and confirm that user-visible latency improved without breaking behavior.

  Match the optimization to the bottleneck:

  - **Too many components update:** colocate state, split Context, narrow store subscriptions, or compose children so unrelated subtrees are not recreated.
  - **One component performs expensive work:** simplify the calculation, precompute it, move it off the critical path, or memoize it when its dependencies are stable.
  - **A large collection creates too much DOM work:** paginate or virtualize it and keep row keys stable.
  - **An urgent interaction waits for non-urgent UI:** use a Transition or `useDeferredValue`. This changes scheduling; it does not make the calculation cheaper.
  - **Effects cause repeated commits:** remove derived-state Effects, fix dependency cycles, and keep user-triggered work in event handlers.
  - **The initial load is slow:** reduce client JavaScript, split code at meaningful boundaries, and investigate data or asset waterfalls.

  `memo`, `useMemo`, and `useCallback` are useful only when they skip work that costs more than their comparisons and cache maintenance. They can be ineffective when dependencies or props receive new identities on every render.

  Profile a production build with representative data. Development mode adds warnings and Strict Mode checks, and a fast desktop with a tiny dataset can hide the bottleneck users actually experience.

---

### Card 16

- question  
  What are transitions and `useDeferredValue`?

- answer  
  Transitions mark state updates as non-urgent so React can keep urgent interactions responsive while rendering other work in the background.

  `useDeferredValue` provides a lagging version of a value, allowing part of the UI to update later.

- explanation  
  Text input should update urgently, while an expensive result list can update as non-urgent work.

  ```jsx
  const deferredQuery = useDeferredValue(query);
  ```

- details  
  `useTransition` provides pending state:

  ```jsx
  const [isPending, startTransition] =
    useTransition();

  startTransition(() => {
    setSelectedTab(nextTab);
  });
  ```

  Transition work can be interrupted and restarted when urgent updates occur.

  Transitions should not control the value of text inputs because inputs require immediate synchronous updates.

  `useDeferredValue` is helpful when the component receives a value but cannot control the setter that changes it.

  These APIs do not make slow calculations faster. They improve scheduling and perceived responsiveness. See [React `useTransition`](https://react.dev/reference/react/useTransition).

---

### Card 17

- question  
  How do Suspense and lazy loading work?

- answer  
  A Suspense boundary displays fallback UI when supported content below it is not ready.

  `lazy` defers loading a component’s code until React first attempts to render it.

- explanation  
  Suspense coordinates loading boundaries and progressive disclosure:

  ```jsx
  const Reports = lazy(() => import("./Reports"));

  <Suspense fallback={<ReportsSkeleton />}>
    <Reports />
  </Suspense>
  ```

- details  
  Suspense can be activated by supported mechanisms such as:

  - Components loaded with `lazy`
  - Promises read with `use`
  - Suspense-enabled frameworks and data sources
  - Streaming server rendering

  It does not detect arbitrary data fetching started inside an Effect.

  Boundary placement is a user-experience decision. One large boundary may hide too much, while many tiny boundaries can create visual noise.

  Transitions can help preserve already visible content rather than replacing it with a fallback during non-urgent updates.

  Suspense also supports streaming server rendering and selective hydration. See [React Suspense](https://react.dev/reference/react/Suspense).

---

## Server rendering and modern React

### Card 19

- question  
  What is the difference between client-side rendering, server-side rendering, static generation, and hydration?

- answer  
  - Client-side rendering builds the interface primarily in the browser.
  - Server-side rendering produces HTML for each request.
  - Static generation produces HTML ahead of requests.
  - Hydration attaches React behavior to server-generated HTML.

- explanation  
  Server-generated HTML can improve initial content delivery, but the client and server must initially produce matching output.

- details  
  Client-only roots use:

  ```jsx
  createRoot(container).render(<App />);
  ```

  Server-rendered HTML uses:

  ```jsx
  hydrateRoot(container, <App />);
  ```

  Hydration mismatches can be caused by:

  - Reading browser-only values during server rendering
  - Rendering current timestamps
  - Random values
  - Locale differences
  - Invalid HTML nesting
  - Different server and client data

  Mismatches should be treated as bugs rather than broadly hidden with `suppressHydrationWarning`.

  Streaming can send completed server-rendered sections progressively. Frameworks usually coordinate routing, data loading, streaming, and hydration. See [React `hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot).

---

### Card 20

- question  
  What are React Server Components?

- answer  
  Server Components render in a server environment and send their rendered result to the client without shipping their component code for client execution.

  Client Components are used where browser APIs, event handlers, client state, or Effects are required.

- explanation  
  Server Components can reduce client JavaScript and access server-side resources directly, but they require framework or bundler integration.

- details  
  Server Components can generally:

  - Read server-side data
  - Access trusted backend resources
  - Render Client Components
  - Pass serializable data to Client Components
  - Use async rendering patterns supported by the framework

  They cannot directly use client-only Hooks such as `useState` or browser event handlers.

  `"use client"` marks a client module boundary:

  ```jsx
  "use client";

  import { useState } from "react";

  export default function Counter() {
    const [count, setCount] = useState(0);

    return (
      <button onClick={() => setCount(count + 1)}>
        {count}
      </button>
    );
  }
  ```

  Server Components are not the same as traditional SSR. SSR produces HTML; Server Components produce a serialized component representation that can be combined with the client tree.

---

### Card 21

- question  
  What are Actions, `useActionState`, and `useOptimistic`?

- answer  
  Actions represent transitions that may include asynchronous work and state updates.

  `useActionState` manages state produced by an Action, while `useOptimistic` temporarily displays an expected result before the underlying operation finishes.

- explanation  
  These APIs help coordinate submissions, pending states, errors, and optimistic feedback.

- details  
  Optimistic update:

  ```jsx
  const [optimisticMessages, addOptimisticMessage] =
    useOptimistic(messages, (current, message) => [
      ...current,
      {
        ...message,
        sending: true
      }
    ]);
  ```

  A good optimistic workflow must consider:

  - Failure rollback
  - Duplicate submissions
  - Race conditions
  - Server validation
  - Ordering
  - Accessibility of pending and error states

  Optimistic state does not replace server authority. The server result must reconcile the final state.

  Actions may integrate with forms and transitions through React frameworks. Their exact server behavior depends on the framework’s Server Function implementation.

---

## Data fetching and error handling

### Card 18

- question  
  What are Error Boundaries, and what do they catch?

- answer  
  Error Boundaries catch rendering errors in descendant components and display fallback UI instead of allowing the entire React tree to fail.

  They also provide a place to report component errors.

- explanation  
  An Error Boundary does not generally catch errors from event handlers, asynchronous callbacks, server-side rendering, or errors thrown inside the boundary itself.

- details  
  A traditional boundary is a class component:

  ```jsx
  class ErrorBoundary extends React.Component {
    state = { failed: false };

    static getDerivedStateFromError() {
      return { failed: true };
    }

    componentDidCatch(error, info) {
      reportError(error, info);
    }

    render() {
      if (this.state.failed) {
        return <ErrorFallback />;
      }

      return this.props.children;
    }
  }
  ```

  Boundaries should be placed around meaningful failure regions such as routes, dashboards, or independent panels.

  Event-handler errors should be handled in the event handler. Async errors should be handled through Promise error handling or framework facilities.

  A changed key can reset a boundary and retry its subtree.

---

### Card 28

- question  
  How would you handle data fetching and race conditions in React?

- answer  
  Prefer framework-integrated data loading or a dedicated server-state solution when available.

  When fetching in an Effect, handle cancellation, stale responses, loading, errors, caching, and repeated requests explicitly.

- explanation  
  A slower earlier request must not overwrite the result of a newer request.

- details  
  Cancellation example:

  ```jsx
  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(
          `/api/users/${userId}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        setUser(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          setError(error);
        }
      }
    }

    load();

    return () => controller.abort();
  }, [userId]);
  ```

  Senior design considerations include:

  - Request deduplication
  - Cache invalidation
  - Retry policies
  - Optimistic updates
  - Pagination
  - Prefetching
  - Suspense integration
  - SSR and hydration
  - Authentication failures
  - Offline behavior

  Fetching data independently in many Effects often creates waterfalls and duplicated server state.

---


## React fundamentals

### Card 29

- question  
  What is the difference between a React element, a component, and a component instance?

- answer  
  A React element is an immutable description of UI. A component is a function or class that produces elements. An instance is React's mounted representation of a component at a particular tree position.

- explanation  
  JSX creates elements; React calls components and preserves their state according to tree identity.

- details  
  A React element is the value created by JSX:

  ```jsx
  const element = <Profile user={user} />;
  ```

  Conceptually, it records the element type (`Profile`), its props, and identity information such as its key. It is a lightweight description, not a DOM node, a rendered component, or something whose props should be mutated.

  A component is the reusable definition:

  ```jsx
  function Profile({ user }) {
    return <h2>{user.name}</h2>;
  }
  ```

  React calls the component while rendering and uses the returned elements to calculate the next UI. Call components through JSX rather than invoking `Profile()` yourself; React needs to control their rendering and Hook lifecycle.

  “Component instance” requires care. Class components have a literal class instance. Function components do not: React stores their Hook state and lifecycle data internally. In everyday discussion, an instance usually means one mounted occurrence of a component at a particular position in the tree.

  Two `<Profile />` elements can therefore represent two independent mounted occurrences with separate state. React preserves an occurrence when its type, position, and key still match; changing those identity signals can create a new occurrence and reset its state.

---

### Card 30

- question  
  What are the Rules of Hooks, and why must Hooks be called unconditionally?

- answer  
  Hooks must be called at the top level of React components or custom Hooks, never inside conditions, loops, nested functions, or ordinary JavaScript functions.

- explanation  
  React associates Hook state with call order. Conditional calls can shift that order between renders and connect state to the wrong Hook.

- details  
  React relies on Hooks being called in the same order on every render:

  ```jsx
  function Profile({ userId, enabled }) {
    const [user, setUser] = useState(null); // Hook 1

    if (enabled) {
      useEffect(() => {                     // 🚩 sometimes Hook 2
        loadUser(userId).then(setUser);
      }, [userId]);
    }
  }
  ```

  If `enabled` changes, the Hook sequence changes. React can no longer reliably associate each call with its previous state, Effect, or memoized value.

  Keep the Hook unconditional and put the condition inside it:

  ```jsx
  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    loadUser(userId, { signal: controller.signal })
      .then(setUser);

    return () => controller.abort();
  }, [enabled, userId]);
  ```

  Hooks may be called only while React is rendering a function component or another custom Hook. Do not call them in event handlers, callbacks, module scope, class methods, or ordinary utility functions. Extract a component when an entire conditional branch needs its own Hooks, or extract a custom Hook when reusable React behavior is needed.

  The `use` API has special conditional and loop support, but it still may only run from a component or Hook and should not be wrapped in `try`/`catch`. It does not relax the rules for APIs such as `useState` or `useEffect`.

  Use `eslint-plugin-react-hooks`; runtime symptoms can be confusing, while the linter catches call-order and component/Hook-boundary mistakes during development.

---

### Card 31

- question  
  What is the difference between props and state?

- answer  
  Props are inputs supplied by a parent. State is component-specific memory managed by React. Both are immutable snapshots during a render.

- explanation  
  A component must not mutate props or state directly; it requests state changes with setters or dispatches actions.

- details  
  Props describe what a parent wants a child to render or do. They can contain data, callbacks, elements, or children:

  ```jsx
  <SearchInput
    value={query}
    onValueChange={setQuery}
  />
  ```

  `SearchInput` reads `value`, but the parent owns it. The child requests a change by calling `onValueChange`; it must not assign to or mutate the prop.

  State is memory owned by a mounted component occurrence:

  ```jsx
  const [isOpen, setIsOpen] = useState(false);
  ```

  Calling the setter queues another render. It does not mutate the state variable captured by the current render, so code should treat both props and state as immutable snapshots. When the next value depends on the previous one, use a functional update:

  ```jsx
  setCount(current => current + 1);
  ```

  Ownership determines where state belongs:

  - Keep state local when only one subtree needs it.
  - Lift it to the nearest common owner when multiple components must stay coordinated.
  - Put shareable navigation state in the URL when appropriate.
  - Treat remote server data separately from transient interface state.

  Avoid copying a prop into state by default:

  ```jsx
  const [name, setName] = useState(user.name); // does not follow later user.name changes
  ```

  Usually, render directly from the prop or derive the required value. A separate state value is appropriate when it intentionally has its own lifecycle, such as an editable draft. In that case, define explicitly when the draft resets, whether later prop changes are merged, and how unsaved edits are handled.

---

### Card 32

- question  
  What is composition, and why is it generally preferred over inheritance in React?

- answer  
  Composition builds interfaces by combining smaller components through props, `children`, slots, and Hooks. It is usually preferred because relationships remain explicit and behavior can be assembled without a rigid inheritance hierarchy.

- explanation  
  It makes dependencies explicit and allows behavior and presentation to be combined without rigid class hierarchies.

- details  
  Common composition techniques include slots, compound components, render props, and custom Hooks:

  ```jsx
  <Card>
    <Card.Header>Account</Card.Header>
    <Card.Body><Profile /></Card.Body>
  </Card>
  ```

  Use component composition for UI structure and custom Hooks for reusable stateful behavior. Inheritance is still a JavaScript feature, but React component reuse rarely needs it. A senior answer should also warn that composition can become obscure when a component exposes too many implicit slots or relies on hidden Context contracts.

---

### Card 33

- question  
  What are Fragments, and when are they useful?

- answer  
  Fragments group multiple children without adding an extra DOM element, which is useful when an extra wrapper would break semantics, layout, or styling.

- explanation  
  They preserve valid structure and avoid unnecessary wrapper elements.

- details  
  Use `<>...</>` for ordinary grouping. Use `<Fragment key={id}>...</Fragment>` when a keyed group is rendered in a list:

  ```jsx
  items.map(item => (
    <Fragment key={item.id}>
      <dt>{item.term}</dt>
      <dd>{item.description}</dd>
    </Fragment>
  ));
  ```

  The shorthand syntax cannot receive a key. A Fragment affects the React tree but does not create a DOM node, styling hook, accessibility landmark, or event target; use a real semantic element when one is required.

---

### Card 34

- question  
  How does React handle events, and how do React events differ from native DOM events?

- answer  
  React accepts event handlers as props and provides normalized event objects while integrating event dispatch with React's update system.

- explanation  
  Handlers receive an event with familiar APIs such as `target`, `currentTarget`, `preventDefault`, and `stopPropagation`.

- details  
  React events mostly follow DOM propagation. `event.currentTarget` is the element whose handler is running; `event.target` is where the event originated. Returning `false` does not prevent default behavior—call `preventDefault()` explicitly.

  Events from portals bubble through the React tree, and React batches state updates made by handlers. Use native listeners when integrating with browser or third-party APIs, attach them in an Effect, and remove the exact same listener during cleanup. Do not reach for native listeners merely to avoid understanding React propagation.

---

### Card 35

- question  
  What are portals, and how do events propagate through them?

- answer  
  A portal renders children into a different DOM container while keeping them in the same React tree.

- explanation  
  Context and React event propagation follow the React tree, not the portal's physical DOM position.

- details  
  Portals are useful for dialogs, popovers, and tooltips that must escape clipping or stacking containers:

  ```jsx
  return createPortal(<Dialog />, document.body);
  ```

  A click inside the dialog can still trigger an ancestor React handler even though the DOM nodes are elsewhere. Stop propagation only when that is the intended interaction contract. Portals do not automatically solve focus management, background inertness, stacking, keyboard behavior, server rendering, or accessible naming.

---

## State and component design

### Card 36

- question  
  What is state colocation, and why does it matter?

- answer  
  State colocation keeps state close to the smallest subtree that needs it.

- explanation  
  It reduces unnecessary renders, coupling, synchronization, and global-store complexity.

- details  
  Lift state only when multiple branches genuinely need coordinated access. For example, keep an accordion item's hover state local, but lift the selected item when a details panel and a list must agree.

  Ownership also depends on the kind of state: shareable navigation state may belong in the URL, remote records in a server-state cache, field state in the form, and transient interaction state in the component. “Put everything in one store” is not a scalable state model; it broadens subscriptions and hides ownership.

---

### Card 37

- question  
  When should state be lifted, and when should it remain local?

- answer  
  Lift state to the nearest common owner when components must share a single source of truth. Keep it local when no outside component needs to coordinate it.

- explanation  
  Excessively high state broadens render impact and makes components harder to reuse.

- details  
  Sometimes composition or moving related components together avoids lifting. When state is lifted, pass both the value and an intentional update API so there is one owner:

  ```jsx
  <SearchInput value={query} onQueryChange={setQuery} />
  <Results query={query} />
  ```

  Do not globalize state solely to avoid passing one or two props. Global state is justified when distant consumers need coordinated access, persistence, external updates, or selective subscriptions—not simply because prop passing is visible.

---

### Card 38

- question  
  How can you avoid prop drilling?

- answer  
  First decide whether prop drilling is actually a problem. A few explicit props are often the clearest solution. When many intermediate components forward data they do not use, reduce the distance with state colocation or composition, use focused Context for shared subtree dependencies, and introduce an external store only when broad access and selective subscriptions justify it.

- explanation  
  Props make dependencies visible and keep components reusable. Context and stores remove forwarding code, but they introduce implicit dependencies and can broaden the impact of updates. The goal is better ownership and component boundaries—not zero prop passing.

- details  
  Use the smallest solution that matches the problem.

  **1. Keep ordinary props when the dependency is direct.**

  Passing data through one or two components is not harmful:

  ```jsx
  <ProfilePage user={user} />
  ```

  Props document what `ProfilePage` needs, work naturally with TypeScript, and make the data flow easy to trace. Do not add Context solely because a prop appears more than once.

  **2. Colocate state with the components that use it.**

  Prop drilling often indicates that state was placed too high. If only `SearchPanel` needs `query`, keep it there instead of storing it at the page or application root. Colocation reduces both forwarding and unrelated rerenders.

  **3. Use composition to bypass intermediaries.**

  A layout does not need to know every dependency of its descendants:

  ```jsx
  function App() {
    return (
      <PageLayout
        sidebar={<UserMenu user={user} />}
      >
        <Dashboard />
      </PageLayout>
    );
  }
  ```

  `PageLayout` receives complete UI rather than accepting `user` only to forward it to `UserMenu`. This keeps the layout generic and moves knowledge to the component that performs the composition.

  **4. Use Context for a shared subtree dependency.**

  Context fits values such as theme, locale, authenticated-user capabilities, or a compound component's shared state:

  ```jsx
  const PermissionsContext = createContext(null);

  function App({ permissions }) {
    return (
      <PermissionsContext value={permissions}>
        <Workspace />
      </PermissionsContext>
    );
  }
  ```

  Keep each Context focused. Memoize a provider object when its identity would otherwise change unnecessarily, and split unrelated values that update at different rates. A Context update rerenders consumers that read that Context; `memo` does not block it.

  **5. Use an external store for genuinely shared mutable state.**

  A store becomes useful when distant parts of the application need the same changing data, updates can originate outside React, or consumers require selectors and narrow subscriptions. Examples include a collaborative document, normalized client cache, or complex cross-route workflow. A store should solve ownership and subscription requirements, not merely hide props.

  In an interview, explain the trade-off: props favor explicit dependencies, Context favors convenient subtree access, and stores favor independently subscribed shared state. Choosing among them is an architectural decision about ownership, update frequency, and reuse.

---

### Card 39

- question  
  What is the difference between derived state and synchronized state?

- answer  
  Derived data is calculated from existing props or state during rendering. Synchronized state is a separate stored value kept aligned with another source.

- explanation  
  Prefer derivation because duplicated state can become inconsistent.

- details  
  Derive during render:

  ```jsx
  const visibleTodos = todos.filter(todo => matches(todo, filter));
  ```

  Avoid storing `visibleTodos` and updating it in an Effect; that adds an extra render and creates an invalid intermediate state. Memoize an expensive derivation only after measuring. Store a separate value when it has an independent lifecycle, such as an editable draft initialized from server data. Decide explicitly whether later server updates should reset, merge with, or leave that draft alone.

---

### Card 40

- question  
  How should complex form state and validation be managed?

- answer  
  Separate field values, validation, submission, and server errors; use native form semantics; and choose controlled, uncontrolled, or library-managed state according to requirements.

- explanation  
  Validate at appropriate times without making typing unresponsive, and always validate again on the server.

- details  
  Start with the platform: meaningful field names, labels, suitable input types, native constraints, and `FormData`. Controlled state is useful when values immediately drive other UI; uncontrolled fields or field-level subscriptions can avoid rerendering an entire large form on every keystroke.

  Complex forms benefit from a shared validation schema, but client validation is only feedback—the server must validate and authorize again. Distinguish field errors from form-level and transport errors, preserve user input after failure, focus or summarize invalid fields accessibly, prevent accidental duplicate submission, and define what reset means after success. Reach for a form library when it reduces these requirements, not merely to store input values.

---

### Card 41

- question  
  How can component state be intentionally preserved or reset?

- answer  
  React preserves state while the same component type remains at the same position in the rendered tree with the same key. To reset a subtree, give it a different key, render a different component type at that position, or remove it from the tree. Preserve state by keeping those identity signals stable.

- explanation  
  State is associated with a component’s identity in the rendered tree—not with a JSX variable, a particular conditional branch in the source code, or the component function by itself. React uses type, position, and key to decide whether the next element represents the existing mounted occurrence.

- details  
  **Preserving state**

  If both branches place the same component at the same tree position, its state is preserved:

  ```jsx
  return isCompact
    ? <Counter compact />
    : <Counter compact={false} />;
  ```

  The props change, but the element is still a `Counter` in the same position. Moving JSX into a variable or helper does not change identity by itself; the resulting tree is what matters.

  Stable data keys preserve the correct item state when a list is reordered:

  ```jsx
  todos.map(todo => (
    <TodoEditor key={todo.id} todo={todo} />
  ));
  ```

  An array index is unsafe when items can move, be inserted, or be removed because state may become attached to the wrong item.

  **Resetting state**

  A key can declare that two otherwise identical elements represent different identities:

  ```jsx
  <ProfileEditor
    key={selectedUserId}
    userId={selectedUserId}
  />
  ```

  When `selectedUserId` changes, React unmounts the previous editor, runs its Effect cleanup, creates new state from the initial values, and mounts a fresh editor. This is often clearer than an Effect that tries to reset several fields after the new user has already rendered.

  Rendering a different type also resets the subtree:

  ```jsx
  {isEditing
    ? <ProfileForm />
    : <ProfileSummary />}
  ```

  Removing a component with conditional rendering resets it when it later returns. CSS hiding usually leaves it mounted, so state and Effects remain active. `<Activity mode="hidden">` is another option when state should be retained while Effects are temporarily cleaned up.

  **Choose the reset boundary carefully.** A key resets the entire keyed subtree, including focus, uncontrolled input values, child state, refs, and Effects. Use a narrower key or an explicit state update when only one field should reset. Before resetting an edited form, also decide what should happen to unsaved work and where focus should move.

  Avoid defining a component inside another component:

  ```jsx
  function Page() {
    function Editor() {
      return <input />;
    }

    return <Editor />;
  }
  ```

  `Editor` is a new component type on every `Page` render, so React can reset its subtree unexpectedly. Declare component types at module scope unless creating a new type is intentional.

---

### Card 42

- question  
  When should state be represented with a state machine?

- answer  
  A state machine is useful when behavior has explicit modes, constrained transitions, concurrency, or impossible combinations that Boolean flags cannot model safely.

- explanation  
  It makes allowed states and events explicit and testable.

- details  
  Replace contradictory flags such as `isLoading`, `isSuccess`, and `hasError` with one discriminated state:

  ```ts
  type RequestState =
    | { status: "idle" }
    | { status: "pending" }
    | { status: "success"; data: User }
    | { status: "error"; error: Error };
  ```

  A reducer may be enough when transitions are local. A state-machine library becomes valuable for guarded transitions, parallel states, retries, timeouts, and visualization. Examples include payment flows, multi-step forms, uploads, and authentication. Simple independent state does not need a machine.

---

## React Hooks

### Card 43

- question  
  How do dependency arrays work in `useEffect`, `useMemo`, and `useCallback`?

- answer  
  React compares each dependency with its previous value using `Object.is` and reruns or recalculates when a dependency changes.

- explanation  
  Dependencies are determined by reactive values read by the callback, not by which values a developer prefers to track.

- details  
  Every reactive value referenced by the callback—props, state, and variables or functions declared in the component—belongs in the dependency list unless it is proven non-reactive. Objects and functions created during rendering have new identities, so depending on them can retrigger work:

  ```jsx
  useEffect(() => {
    const options = { roomId };
    return connect(options);
  }, [roomId]);
  ```

  Moving `options` inside the Effect removes the unnecessary object dependency. Other fixes include moving constants outside the component, using functional state updates, or extracting non-reactive Effect Events. `useMemo` and `useCallback` are performance tools, not loopholes for incorrect dependencies. Restructure code before suppressing the exhaustive-dependencies lint rule.

---

### Card 44

- question  
  How would you debug an infinite `useEffect` loop?

- answer  
  Identify the state updated by the Effect and the dependency that changes because of that update.

- explanation  
  An infinite loop requires the Effect to update state and that update to change one of its dependencies.

- details  
  Add temporary logging to compare dependencies with `Object.is`, then trace the cycle: Effect → state update → render → changed dependency → Effect. A common example is depending on a newly created object or setting derived state on every run.

  First ask whether the Effect synchronizes with an external system. If not, derive the value during render or move action-specific logic into its event handler. Otherwise use a functional update, move object creation into the Effect, or stabilize only the genuinely required identity. Do not blindly remove dependencies, add an empty array, or use a ref to conceal a reactive value; those changes trade a visible loop for stale behavior.

---

### Card 45

- question  
  How can asynchronous race conditions occur inside an Effect?

- answer  
  An older request may finish after a newer request and overwrite newer state.

- explanation  
  Completion order does not necessarily match request order.

- details  
  Cancel obsolete work and still guard the result because not every asynchronous stage observes an abort:

  ```jsx
  useEffect(() => {
    const controller = new AbortController();

    loadUser(userId, { signal: controller.signal })
      .then(user => setUser(user))
      .catch(error => {
        if (error.name !== "AbortError") setError(error);
      });

    return () => controller.abort();
  }, [userId]);
  ```

  A request ID or ignore flag can protect non-cancellable work. For real applications, a router or server-state library can additionally provide deduplication, caching, retries, and request identity. Cleanup prevents stale UI; it is not a substitute for server-side correctness.

---

### Card 46

- question  
  When should logic remain in an event handler instead of moving into an Effect?

- answer  
  Keep logic in an event handler when a particular interaction causes it. Use an Effect when rendering the component—or a change to its reactive inputs—requires synchronization with an external system. If the value can be calculated from props or state, calculate it during rendering instead of using either mechanism to maintain duplicate state.

- explanation  
  Event handlers run once for the interaction that triggered them and have access to that render’s snapshot. Effects run after a commit and may run again whenever synchronization dependencies change. Moving action-specific work into an Effect loses its cause and can repeat it after remounting, navigation, or state restoration.

- details  
  Ask: **“Why should this code run?”**

  If the answer is “because the user clicked Submit,” keep it in the handler:

  ```jsx
  async function handleSubmit(event) {
    event.preventDefault();
    await placeOrder(cart);
    navigate("/confirmation");
  }
  ```

  Do not set `submitted` and watch it with an Effect merely to call `placeOrder`. That separates the operation from its cause, adds another render, and risks duplicate submission if state is restored or the component remounts.

  If the answer is “because this component is currently showing room 42,” use an Effect:

  ```jsx
  useEffect(() => {
    const connection = connect(roomId);
    connection.open();

    return () => connection.close();
  }, [roomId]);
  ```

  This expresses synchronization: while a particular `roomId` is rendered, the matching connection should exist. Cleanup mirrors setup whenever the room changes or the component unmounts.

  Do neither when the result is derivable:

  ```jsx
  const fullName = `${firstName} ${lastName}`;
  ```

  Storing `fullName` and updating it in an Effect creates redundant state and an extra commit. A useful interview summary is: rendering calculates UI, handlers perform interaction-caused work, and Effects synchronize committed UI with systems outside React.

---

### Card 47

- question  
  How do you read the latest value inside a callback without unnecessarily restarting an Effect?

- answer  
  Choose the technique according to what the callback needs: use a functional state update when calculating from previous state, `useEffectEvent` when Effect-owned event logic needs the latest committed values without resubscribing, and a ref for mutable non-rendering data used by an external callback. Do not omit real dependencies merely to keep an Effect from restarting.

- explanation  
  Closures capture values from the render that created them. That snapshot is normally desirable, but a long-lived timer, subscription, or third-party callback may need a current value. The correct solution depends on whether that value is reactive to the synchronization itself.

- details  
  **Use a functional update when only the previous state is needed:**

  ```jsx
  useEffect(() => {
    const id = setInterval(() => {
      setCount(count => count + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);
  ```

  The updater receives the latest queued state, so `count` does not need to be captured by the interval Effect.

  **Use `useEffectEvent` for non-reactive logic triggered by an Effect:**

  ```jsx
  const onConnected = useEffectEvent(() => {
    showNotification(`Connected as ${user.name}`, theme);
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on("connected", onConnected);
    return () => connection.disconnect();
  }, [roomId]);
  ```

  Changing `roomId` must reconnect, so it remains a dependency. Changing `theme` should only affect the next notification, so the Effect Event reads its latest value without reconnecting. Effect Events must be called from Effects or other Effect Events, must remain local to the owning component or Hook, and must not be used to hide dependencies that should resynchronize the Effect.

  **Use a ref for imperative mutable data that does not render:**

  ```jsx
  const latestPosition = useRef(position);

  useEffect(() => {
    latestPosition.current = position;
  }, [position]);
  ```

  A third-party listener can read `latestPosition.current`, but changing it will not rerender the component. If users should see the value, it belongs in state. Prefer an honest reactive design first; refs and Effect Events are targeted escape hatches, not replacements for dependency arrays.

---

### Card 48

- question  
  What is `useId`, and why should it not be used for list keys?

- answer  
  `useId` generates an identifier that is stable for a component occurrence and coordinates correctly between server rendering and hydration. It is intended for accessibility relationships and reusable component markup—not for identifying application data.

- explanation  
  A list key tells React which data item a child represents across insertions and reordering. A `useId` value is associated with where the Hook is called in the component tree, so it cannot provide the data identity that reconciliation needs.

- details  
  Use the generated prefix to connect related elements inside a reusable component:

  ```jsx
  function PasswordField({ hint }) {
    const id = useId();
    const inputId = `${id}-input`;
    const hintId = `${id}-hint`;

    return (
      <div>
        <label htmlFor={inputId}>Password</label>
        <input id={inputId} aria-describedby={hintId} />
        <p id={hintId}>{hint}</p>
      </div>
    );
  }
  ```

  Multiple `PasswordField` occurrences receive distinct relationships without requiring callers to coordinate IDs. This is especially useful in component libraries and avoids server/client ID mismatches that can occur with a module counter or random value during rendering.

  Do not call `useId` inside a loop to generate keys. Hooks cannot be called in loops, and the resulting value would still describe Hook position rather than item identity:

  ```jsx
  items.map(item => (
    <Row key={item.id} item={item} />
  ));
  ```

  Use an ID from the data or create one when the item itself is created. `useId` is also not a database ID, analytics identifier, CSS selector contract, or globally persistent value. If an explicit `id` prop is part of the component API, accept it and use `useId` as the fallback.

---

### Card 49

- question  
  What does the `use` API do?

- answer  
  `use` reads a supported resource during rendering. With a Promise, it returns the fulfilled value, suspends at the nearest Suspense boundary while pending, or sends a rejection to the nearest Error Boundary. With Context, it reads the nearest provider value similarly to `useContext`.

- explanation  
  Unlike an Effect, `use` participates in rendering, so React can coordinate pending and failed resources with declarative boundaries. Unlike most Hooks, `use` may be called conditionally or in a loop, but it must still be called while React is rendering a component or custom Hook.

- details  
  A Server Component can create a Promise and pass it to a Client Component:

  ```jsx
  // Server Component
  function Page() {
    const commentsPromise = loadComments();

    return (
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    );
  }
  ```

  ```jsx
  "use client";

  function Comments({ commentsPromise }) {
    const comments = use(commentsPromise);
    return comments.map(comment => (
      <Comment key={comment.id} comment={comment} />
    ));
  }
  ```

  Do not create a new uncached Promise during every Client Component render; retries can continually produce new work and React warns about unsupported uncached Promises. Prefer a framework data source, a cached server-created Promise, or another Suspense-compatible resource.

  Context reads may be conditional:

  ```jsx
  if (shouldUseTheme) {
    const theme = use(ThemeContext);
    return <Panel theme={theme} />;
  }
  ```

  `use` cannot be called in `try`/`catch` to handle a rejected Promise. Use an Error Boundary for failures and Suspense for pending UI. It also does not by itself define caching, request invalidation, or server authorization; those responsibilities belong to the resource and framework integration.

---

### Card 50

- question  
  When would you use `useImperativeHandle`?

- answer  
  Use `useImperativeHandle` when a parent legitimately needs a small imperative capability—such as `focus()`, `scrollToError()`, or `reset()`—but should not receive the child’s entire DOM node or internal implementation.

- explanation  
  Most component coordination should remain declarative through props and state. An imperative handle is an escape hatch for operations that naturally describe commands and cannot be expressed cleanly as rendered output.

- details  
  In React 19, a function component can receive `ref` as a prop and expose a constrained handle:

  ```jsx
  function SearchInput({ ref }) {
    const inputRef = useRef(null);

    useImperativeHandle(ref, () => ({
      focus() {
        inputRef.current?.focus();
      },
      select() {
        inputRef.current?.select();
      }
    }), []);

    return <input ref={inputRef} type="search" />;
  }
  ```

  The parent can call `searchRef.current.focus()` but cannot mutate arbitrary properties of the internal input. React versions before 19 commonly use `forwardRef` to receive the ref.

  Include every reactive value used to create the handle in its dependency array. Otherwise methods can close over stale props or state. Keep the API small and behavioral: `focus()` is a better boundary than exposing internal nodes, state setters, or child implementation details.

  Avoid using an imperative handle to coordinate ordinary data flow:

  - Use props to configure rendering.
  - Use callbacks to report child events.
  - Lift state when parent and child need one source of truth.
  - Use refs only for commands that are genuinely imperative.

  Also consider timing and lifecycle: the handle is available after commit, becomes `null` when the child unmounts, and should normally be used from an event handler or Effect rather than during rendering.

---

### Card 57

- question  
  What do `useTransition` and `useDeferredValue` solve?

- answer  
  Both APIs let React render non-urgent work in the background so urgent interactions remain responsive. `useTransition` marks state updates that you initiate as non-urgent and exposes pending state. `useDeferredValue` gives a component a deferred version of a value when it cannot control the update that produced that value.

- explanation  
  React may pause, restart, or discard Transition rendering when a newer urgent update arrives, while the currently committed UI remains interactive. Priority changes when work is shown; it does not make the underlying calculation faster.

- details  
  Separate the immediate input update from the expensive result update:

  ```jsx
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event) {
    const nextQuery = event.target.value;
    setQuery(nextQuery); // urgent: controls the input

    startTransition(() => {
      setFilter(nextQuery); // non-urgent: updates expensive results
    });
  }
  ```

  Do not place the controlled input’s `setQuery` inside the Transition; React-controlled inputs must reflect typing synchronously. Use `isPending` to communicate background work without replacing useful existing content with a global spinner.

  `useDeferredValue(query)` is useful when a component receives `query` but does not control the update that produces it. The deferred value initially remains stale while React attempts the background render.

  Transition caveats include:

  - Transition work can be interrupted and restarted, so rendering must remain pure.
  - Updates after an `await` may need another `startTransition` to retain Transition priority.
  - Multiple concurrent Transitions may currently be batched together.
  - A Transition does not debounce, throttle, cancel network requests, or reduce CPU work.
  - Do not use it when stale UI would be incorrect or unsafe.

  If a calculation itself blocks the main thread for too long, optimize or move that work; scheduling alone cannot make the browser responsive during one uninterrupted JavaScript task.

---

### Card 77

- question  
  What does `useActionState` solve?

- answer  
  `useActionState` wraps an Action with state derived from its latest result. It returns the current state, an Action dispatcher, and pending status, making it useful for server validation messages, mutation results, and form submission state that should survive React’s Action flow.

- explanation  
  Unlike an ordinary submit handler plus several state setters, the Action receives the previous result state and submitted arguments, then returns the next result state. React associates pending and returned data with that specific Action.

- details  
  ```jsx
  const initialState = {
    message: "",
    fieldErrors: {}
  };

  function ProfileForm() {
    const [state, submitAction, isPending] = useActionState(
      saveProfile,
      initialState
    );

    return (
      <form action={submitAction}>
        <label htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          name="displayName"
          aria-invalid={Boolean(state.fieldErrors.displayName)}
          aria-describedby="display-name-error"
        />
        <p id="display-name-error">
          {state.fieldErrors.displayName}
        </p>
        <button disabled={isPending}>Save</button>
        <p role="status">{state.message}</p>
      </form>
    );
  }
  ```

  The corresponding Action receives `previousState` before the submitted `FormData`:

  ```jsx
  async function saveProfile(previousState, formData) {
    const result = validateProfile(formData);

    if (!result.success) {
      return {
        message: "Check the highlighted fields.",
        fieldErrors: result.fieldErrors
      };
    }

    await persistProfile(result.data);
    return { message: "Profile saved.", fieldErrors: {} };
  }
  ```

  Pass the returned dispatcher to `form action`, `button formAction`, or call it within an Action context. Do not call it as an arbitrary render-time function. Keep returned state small and serializable when a Server Function or progressive-enhancement transport carries it across the server boundary.

  `useActionState` models the latest Action result; it is not a general cache or a complete concurrent-mutation manager. Overlapping submissions still need domain-specific ordering, idempotency, and reconciliation.

---

## Rendering and performance

### Card 51

- question  
  Why does a child component render when its parent renders?

- answer  
  When a parent renders, React normally evaluates the child elements it returns and calls their component functions to calculate the next subtree. This does not mean React remounts the children or changes their DOM. State is preserved when identity matches, and React commits only actual host changes.

- explanation  
  A parent’s new render can produce different child props or structure, so React generally needs the child’s next output before reconciliation can determine what changed. Render propagation and DOM mutation are separate concepts.

- details  
  Consider this update:

  ```jsx
  function Parent() {
    const [count, setCount] = useState(0);

    return (
      <>
        <button onClick={() => setCount(value => value + 1)}>
          {count}
        </button>
        <Profile name="Ada" />
      </>
    );
  }
  ```

  Clicking the button renders `Parent` and, by default, calls `Profile` again even though its visible prop is unchanged. If `Profile` returns equivalent output, React may perform no DOM mutation for it. Its local state is also preserved because it remains the same type at the same position.

  This default behavior keeps data flow predictable and is often cheap. Investigate only when profiling shows meaningful cost. Possible boundaries include:

  - `memo` for a component whose unchanged props frequently allow expensive work to be skipped.
  - State colocation so an update starts lower in the tree.
  - Narrower Context or external-store subscriptions.
  - Composition that lets a stateful wrapper receive an already-created child element.

  Do not confuse rerendering with remounting. A remount creates new state, DOM, refs, and Effects; a rerender recalculates an existing occurrence. Also do not memoize every child preemptively—the comparison and identity-management costs may exceed the render work.

---

### Card 52

- question  
  What causes a memoized component to render again?

- answer  
  A component wrapped in `memo` can render when a prop is not `Object.is`-equal to its previous value, its own state changes, a Context it reads changes, or an external subscription supplies a new snapshot. `memo` is a props-based optimization, not a guarantee that React will never call the component again.

- explanation  
  By default, `memo` compares each prop shallowly with `Object.is`. It can skip render work caused by the parent when props are equal, but a component must still react to the state and shared data it consumes directly.

- details  
  ```jsx
  const UserRow = memo(function UserRow({ user, onSelect }) {
    const theme = useContext(ThemeContext);
    return (
      <button className={theme} onClick={() => onSelect(user.id)}>
        {user.name}
      </button>
    );
  });
  ```

  `UserRow` can render again because:

  - `user` is a different object reference, even if its fields contain the same values.
  - `onSelect` is a newly created function.
  - Its own state changes.
  - `ThemeContext` provides a changed value.
  - A store Hook used inside it returns a changed snapshot.

  A parent render alone can be skipped only when all props compare equal. Passing children also counts as passing a prop; freshly created JSX can therefore break a memo boundary.

  A custom comparator is possible, but it must compare every prop, including callbacks that may close over changing values. Deep comparison can be slower than rendering and can freeze stale behavior when implemented incorrectly.

  React may call memoized components again for development checks or discard cached work for implementation reasons. Components must remain correct without memoization. Use the Profiler to confirm both that the component is costly and that its props remain stable often enough for `memo` to help.

---

### Card 53

- question  
  Why can inline objects and functions affect memoization?

- answer  
  Inline object, array, function, and JSX expressions usually create new references on every render. When those references are props of a memoized child or dependencies of a Hook, React sees them as changed even if their contents or behavior look equivalent.

- explanation  
  Referential identity is not inherently a performance problem. It matters only at a boundary that compares references, such as `memo`, a dependency array, a Context provider value, or a selector cache.

- details  
  This defeats the `memo` boundary on every parent render:

  ```jsx
  <Results
    options={{ sort: "name" }}
    onSelect={item => setSelectedId(item.id)}
  />
  ```

  Possible fixes depend on what the values capture:

  ```jsx
  const options = useMemo(
    () => ({ sort }),
    [sort]
  );

  const handleSelect = useCallback(
    item => setSelectedId(item.id),
    []
  );

  <Results options={options} onSelect={handleSelect} />;
  ```

  Prefer simpler fixes first: pass primitives instead of a configuration object, move a true constant to module scope, accept an item ID instead of closing over an item, or move object creation inside the Effect that uses it.

  `useMemo` and `useCallback` do not prevent creation of all values or make a function faster. They preserve a reference between renders while dependencies remain equal. That has its own comparison, memory, and readability cost.

  Inline handlers on ordinary DOM elements are normally fine. If there is no meaningful identity-sensitive boundary or measured bottleneck, keeping the inline expression is clearer than adding defensive memoization everywhere.

---

### Card 54

- question  
  How would you render a list containing thousands of items efficiently?

- answer  
  Start by limiting how much data and DOM the interface needs at once. Paginate or incrementally load remote data, virtualize large scrollable collections, keep row identity stable, and prevent unrelated state changes from rerendering every row. Then profile React work and browser layout or paint separately.

- explanation  
  Large lists have several independent costs: fetching and transforming data, calling row components, creating DOM nodes, calculating layout, painting, and retaining memory. Optimizing only React renders may not fix the dominant browser cost.

- details  
  Use a staged approach:

  1. **Reduce the dataset.** Apply server-side filtering and pagination when users do not need every record locally. Avoid downloading 100,000 rows merely to display 20.
  2. **Keep data operations efficient.** Do not repeatedly sort or filter the whole collection in every row. Compute once per relevant change, move expensive processing to the server or a worker when appropriate, and debounce only input that should intentionally lag.
  3. **Keep identity stable.** Use a durable row key such as `row.id`, not the array index. Preserve row objects when their data has not changed so selective memoization or store subscriptions can work.
  4. **Limit DOM size.** Virtualize a genuinely large scrollable list so only visible rows plus a small overscan region are mounted.
  5. **Limit update scope.** Colocate hover or edit state in the row, subscribe rows to only the data they need, and avoid a Context value that changes for every pointer or keystroke event.

  Virtualization is not free. Variable row heights require measurement, and unmounting off-screen items complicates browser find, printing, focus, screen-reader navigation, sticky content, and scroll restoration. Pagination may provide a better user experience for searchable business data; virtualization is often better for continuous feeds or dense explorers.

  Test with representative row counts and interactions. Measure scripting, layout, paint, memory, and responsiveness—not only the number of React renders.

---

### Card 55

- question  
  What is list virtualization?

- answer  
  List virtualization, or windowing, renders only the items in or near the viewport while simulating the full collection’s scrollable size. As the user scrolls, the rendered window moves and DOM nodes are created, removed, or reused.

- explanation  
  The virtualizer calculates which item indices intersect the viewport from scroll position and item measurements. Padding, spacers, or positioned rows preserve the scrollbar geometry even though most items are not mounted.

- details  
  A simplified fixed-height calculation is:

  ```js
  const start = Math.floor(scrollTop / rowHeight);
  const visibleCount = Math.ceil(viewportHeight / rowHeight);
  const from = Math.max(0, start - overscan);
  const to = Math.min(items.length, start + visibleCount + overscan);
  ```

  Only `items.slice(from, to)` is rendered, offset to its logical position. Overscan renders a few extra rows before and after the viewport so fast scrolling does not reveal blank gaps.

  Production implementations must address:

  - Dynamic heights and measurement changes
  - Resize and responsive layout
  - Stable keys and item reordering
  - Scroll anchoring and restoration
  - Focus moving to an item that would otherwise unmount
  - Keyboard navigation to an off-screen item
  - Screen-reader expectations and collection metadata
  - Sticky headers, printing, and browser find

  Use a mature virtualizer unless the requirements are extremely simple. Provide programmatic scrolling for focused or selected items and test zoom, reduced motion, keyboard-only use, and assistive technology. For modest collections, ordinary rendering may be faster to build, more accessible, and sufficiently performant.

---

### Card 56

- question  
  How do code splitting and route-based lazy loading differ?

- answer  
  Code splitting divides application code into independently loadable chunks. Route-based lazy loading is a code-splitting strategy that loads the code for a route only when navigation requires—or deliberately prefetches—it. Routes are good default boundaries, while large optional features may justify additional component-level splits.

- explanation  
  Splitting lowers the initial JavaScript download, parse, and execution cost, but it moves some work to later navigation. A useful boundary ships less unused code without creating a waterfall of tiny chunks and disruptive loading states.

- details  
  `lazy` loads a component module when React first attempts to render it:

  ```jsx
  const ReportsPage = lazy(() => import("./ReportsPage.js"));

  function App() {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <ReportsPage />
      </Suspense>
    );
  }
  ```

  The import Promise and resolved module are cached. If loading fails, the rejection should reach an Error Boundary that can offer retry or navigation recovery. The basic `lazy` contract expects the module’s `.default` export to be a valid component.

  Framework routers usually provide stronger route-level integration: matching routes before rendering, loading code and data in parallel, streaming, prefetching likely destinations, and producing route-specific error UI. Prefer that integration over adding a single Suspense boundary around the whole application.

  Good additional split points include rarely opened editors, charts, admin tools, and large optional libraries. Avoid splitting a tiny component used immediately on every page; request overhead and fallback churn may outweigh the saved bytes.

  Evaluate:

  - Initial and route-specific transferred JavaScript
  - Parse and execution time, not only compressed bundle size
  - Cache stability between deployments
  - Code-and-data waterfalls
  - Loading, error, and offline behavior
  - Whether hover, viewport, or idle prefetching improves navigation

  Code splitting improves delivery. It does not reduce the runtime cost of code after that code has loaded.

---

### Card 58

- question  
  What problems does React Compiler solve?

- answer  
  React Compiler analyzes components and Hooks at build time and automatically applies memoization where it can safely reuse values or UI. Its main benefit is reducing routine manual `memo`, `useMemo`, and `useCallback` work while enabling more precise updates.

- explanation  
  The compiler relies on the Rules of React—especially pure rendering and correct Hook usage—to prove that reuse is safe. It optimizes valid React code; it is not a runtime diffing replacement or a tool that repairs incorrect component behavior.

- details  
  Without the compiler, developers often stabilize a child and its props manually:

  ```jsx
  const visibleTodos = useMemo(
    () => filterTodos(todos, tab),
    [todos, tab]
  );

  const handleSelect = useCallback(
    id => setSelectedId(id),
    []
  );

  return <TodoList todos={visibleTodos} onSelect={handleSelect} />;
  ```

  The compiler can infer many equivalent reuse opportunities from component data flow. This reduces identity plumbing and the risk of adding memoization in the wrong places.

  Adoption still requires engineering work:

  - Enable the recommended Hooks and compiler lint rules.
  - Fix render-time mutation and other Rules-of-React violations.
  - Roll out incrementally when the application has risky legacy patterns.
  - Monitor diagnostics and avoid broadly suppressing skipped compilation.
  - Run behavior tests and compare production performance profiles.

  Existing manual memoization does not need to be removed immediately. It may document an intentional identity contract or support uncompiled code. Remove it only when compiler coverage, tests, and measurement show that simpler code remains correct and performant.

  The compiler does not solve poor state ownership, broad Context updates, inefficient algorithms, network waterfalls, large DOM trees, layout or paint bottlenecks, or memory leaks. Components must remain correct when a cached value is recomputed; memoization is still an optimization rather than semantic state.

---

### Card 59

- question  
  When can memoization make performance worse?

- answer  
  Memoization can make performance and maintainability worse when the skipped work is cheaper than dependency checks, prop comparison, and cache retention; when inputs change almost every render; or when developers add expensive custom equality logic. Incorrect dependencies can additionally preserve stale values and behavior.

- explanation  
  Memoization is not free: React must retain a value, compare dependencies or props, and maintain another identity contract that future code must understand. It helps only when a cache hit skips meaningful work often enough to repay those costs.

- details  
  Low-value memoization often looks like:

  ```jsx
  const fullName = useMemo(
    () => `${firstName} ${lastName}`,
    [firstName, lastName]
  );
  ```

  Concatenating two strings is cheaper and clearer than maintaining this cache. Memoization is more plausible when a measured expensive calculation repeats with unchanged inputs or a costly memoized child frequently receives otherwise stable props.

  Common failure modes include:

  - A new object or callback dependency invalidates the cache every render.
  - A custom `memo` comparator performs a deep comparison slower than rendering.
  - A comparator ignores a callback and preserves a stale closure.
  - Large cached values increase retained memory.
  - `useCallback` is added even though the function is not passed to an identity-sensitive consumer.
  - Dependency arrays are intentionally incomplete, turning an optimization into a correctness bug.

  Prefer structural improvements first: colocate state, derive rather than synchronize values, narrow Context or store subscriptions, reduce DOM size, and eliminate Effect update chains. These changes reduce the work itself rather than attempting to cache around an overly broad update.

  Use production profiling to compare the complete interaction before and after. Count neither `useMemo` calls nor rerenders as the success metric; measure user-visible latency, commit duration, main-thread work, and memory where relevant.

---

### Card 60

- question  
  How would you investigate a component that renders too frequently?

- answer  
  First determine whether the renders are both unexpected and expensive. Reproduce one interaction, record it with React DevTools Profiler, identify what scheduled each update, and trace changed props, local state, Context, or external-store snapshots. Fix the narrowest update source, then profile the same interaction again.

- explanation  
  Render count alone is not a performance metric. A frequently rendered small component may be harmless, while one infrequent render can block the main thread. Diagnosis must connect an update to measured render or commit cost and user-visible delay.

- details  
  Use this investigation sequence:

  1. **Establish the trigger.** Choose one action—typing a character, selecting a row, or receiving a store update—and reproduce it with representative data.
  2. **Profile a production build.** Development Strict Mode deliberately repeats some rendering and Effect work. It can reveal bugs, but it is not representative performance data.
  3. **Find the costly commit.** In React DevTools Profiler, inspect which components rendered, their self time, and why their props or state changed. Use browser Performance tools when layout, paint, or other JavaScript may dominate.
  4. **Trace the update source.** Follow the state setter, Context provider, reducer dispatch, router update, or external-store notification that scheduled the work.
  5. **Verify the fix.** Repeat the same profile and compare user-visible timing, not only the component count.

  Frequent causes include:

  - State is lifted above a large subtree even though only one branch needs it.
  - A provider creates `{ user, permissions }` on every render or combines values with different update frequencies.
  - An Effect sets derived state, producing a second commit after every relevant render.
  - A store selector returns a fresh object or subscribes to the entire store.
  - A parent recreates props that defeat a valuable `memo` boundary.
  - A component sets state unconditionally during an Effect or subscription callback.
  - A list uses unstable keys, causing remounts rather than ordinary rerenders.

  Match the fix to the cause: colocate state, split Context, return stable store snapshots, remove derived-state Effects, preserve data identity, or memoize only a measured expensive boundary. If the render is cheap and produces no user-visible problem, the correct fix may be no change.

---

## Suspense and reliability

### Card 61

- question  
  What is the difference between Suspense and an Error Boundary?

- answer  
  Suspense handles supported work that is not ready yet and shows a fallback while React waits. An Error Boundary handles errors thrown while rendering a descendant tree and replaces that failed region with error UI. Pending and failed are different states, so robust interfaces commonly use both boundaries.

- explanation  
  A Suspense-compatible resource communicates pending work to React, while a rejected resource or rendering exception propagates to an Error Boundary. Suspense does not catch errors, and an Error Boundary is not a loading indicator.

- details  
  Combine the boundaries around a meaningful region:

  ```jsx
  <ErrorBoundary fallback={<ReportsError />}>
    <Suspense fallback={<ReportsSkeleton />}>
      <Reports />
    </Suspense>
  </ErrorBoundary>
  ```

  If `Reports` reads a pending lazy import or supported Promise, the Suspense fallback appears. If rendering throws or that Promise rejects, the Error Boundary displays its fallback.

  Suspense works only with integrated sources such as:

  - Components loaded with `lazy`
  - Promises read with `use`
  - Suspense-enabled framework data sources
  - Streaming server rendering

  It does not detect a `fetch` started inside an Effect or automatically show a fallback for any arbitrary asynchronous operation.

  Error Boundaries catch errors in descendant rendering and relevant lifecycle work. They do not normally catch errors from event handlers, arbitrary asynchronous callbacks, server rendering, or the boundary’s own fallback. Handle an event failure in the event workflow and put it into state when the UI should display it.

  Boundary order controls scope. A boundary outside Suspense can handle both the content and loading subtree. More focused boundaries can let one failed widget degrade without replacing an entire page. Always provide recovery where possible and report errors with useful component and request context.

---

### Card 62

- question  
  Where should Suspense boundaries be placed?

- answer  
  Place a Suspense boundary around a user-visible region that can load and reveal as one unit, has a useful fallback, and can remain independent from surrounding content. Use boundaries to express the intended loading experience—not around every asynchronous component mechanically.

- explanation  
  One page-level boundary can replace useful existing content with a large spinner, while many tiny boundaries produce layout shifts and a patchwork of skeletons. The correct granularity follows the design’s reveal sequence and navigation behavior.

- details  
  Good boundary candidates include a route body, search-results region, comments panel, or secondary dashboard widget. Ask:

  - Can this region show a meaningful skeleton or retained previous state?
  - Should it reveal independently from nearby content?
  - If it is slow, should the rest of the page remain interactive?
  - On the server, is it a useful streaming boundary?
  - Where should errors and retries be isolated?

  ```jsx
  <Article />

  <Suspense fallback={<CommentsSkeleton />}>
    <Comments articleId={articleId} />
  </Suspense>
  ```

  The article can remain visible while comments load. In contrast, placing one boundary around both would hide the already useful article.

  When already displayed content suspends during a non-urgent update, use a Transition or deferred value where appropriate so React can retain stale content instead of immediately replacing it with a fallback. Communicate that refresh is pending rather than making the interface appear to disappear.

  Design fallbacks to preserve approximate dimensions, accessible labels, and context. Avoid spinner-only interfaces for large regions and avoid announcing every nested boundary independently. Boundary placement should be agreed with the product loading design, not decided only from component-file boundaries.

---

### Card 63

- question  
  How do nested Suspense boundaries coordinate progressive loading?

- answer  
  Nested Suspense boundaries create a reveal sequence. The outer boundary controls the first larger region; after it can reveal its primary content, an inner boundary may continue showing its own fallback until its slower subtree is ready.

- explanation  
  Nesting allows React to reveal useful content progressively without exposing an incomplete subtree outside the loading states designed for it. Each boundary coordinates everything directly inside it until a deeper boundary takes responsibility.

- details  
  ```jsx
  <Suspense fallback={<PageSkeleton />}>
    <Biography />

    <Suspense fallback={<AlbumsSkeleton />}>
      <Albums />
    </Suspense>
  </Suspense>
  ```

  Initially, `PageSkeleton` appears if the outer primary content cannot reveal. Once `Biography` and the structure containing the inner boundary are ready, React can show them while `AlbumsSkeleton` remains. `Albums` replaces only its local fallback when ready.

  Sibling components inside one boundary reveal together from the user’s perspective. Give them separate boundaries only when independent reveal is desirable. If a fallback itself suspends, React looks for the next Suspense boundary above it, so fallbacks should usually be simple and immediately renderable.

  Nested boundaries do not automatically prevent network waterfalls. Start independent code and data requests in parallel through the router, framework, or resource layer; otherwise the inner request may not begin until an earlier component renders.

  Watch for layout movement and repeated announcements as fallbacks are replaced. Skeletons should reserve useful space, and accessibility messaging should describe meaningful loading progress without producing noise for every small region.

---

### Card 64

- question  
  How can an Error Boundary be reset?

- answer  
  An Error Boundary must clear its recorded error before it can attempt to render its children again. Reset it through an explicit retry supported by the boundary, or change its key when a route, entity, or other identity change should create a fresh boundary and subtree.

- explanation  
  Simply rendering the same broken children again can immediately throw the same error. Recovery should first change the failed condition—retry a request, discard invalid state, load a different entity, or deploy corrected code—and then reset the boundary.

- details  
  A class Error Boundary commonly stores `hasError` in state and exposes a retry action that clears it:

  ```jsx
  class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
      return { error };
    }

    retry = () => {
      this.setState({ error: null });
    };

    render() {
      if (this.state.error) {
        return <ErrorFallback onRetry={this.retry} />;
      }

      return this.props.children;
    }
  }
  ```

  In production, the retry usually also invalidates or restarts the failed resource. A library boundary may provide `resetErrorBoundary`, reset keys, and an `onReset` callback for this coordination.

  A changed key performs a full reset:

  ```jsx
  <ErrorBoundary key={projectId} fallback={<ProjectError />}>
    <Project projectId={projectId} />
  </ErrorBoundary>
  ```

  This is appropriate when the project identity changes, but it also remounts the entire subtree and loses its local state. Do not use an excessively broad key when only the failed request needs retrying.

  The fallback should explain what failed, offer a safe next action, remain keyboard accessible, and avoid retry loops. Report the original error with component context while filtering secrets and user data from logs.

---

### Card 65

- question  
  How should loading, empty, error, and stale states be represented?

- answer  
  Represent asynchronous UI with explicit states and metadata rather than unrelated Booleans. Distinguish initial loading, successful empty data, successful populated data, blocking failure, background refresh, and stale data with a refresh error. Some of these states legitimately overlap.

- explanation  
  `isLoading`, `isError`, and `hasData` can produce contradictory combinations and encourage the UI to discard useful content. A state model should preserve the information needed to choose the correct user experience.

- details  
  A discriminated model makes invalid states harder to express:

  ```ts
  type ResourceState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T; refreshing: boolean }
    | { status: "error"; error: Error }
    | { status: "stale-error"; data: T; error: Error };
  ```

  Render each state deliberately:

  - **Initial loading:** show a skeleton or progress indicator because no useful content exists yet.
  - **Empty success:** explain that the request succeeded but returned no results; provide an appropriate next action rather than showing an error.
  - **Populated success:** render the data normally.
  - **Background refresh:** retain existing data, indicate subtle progress, and avoid replacing the whole region with a loading fallback.
  - **Blocking error:** show failure UI and a retry path when no usable data exists.
  - **Stale error:** retain cached data, mark it as potentially outdated, and explain that refresh failed.

  Empty must be defined by the domain: an empty filtered result is different from a new account with no records. Likewise, a `404`, validation error, permission failure, offline state, and server failure may need different actions.

  Accessibility is part of the model. Give loading indicators accessible names, announce meaningful asynchronous completion with a restrained live region, associate field errors with controls, and avoid moving focus for ordinary background refreshes. The state model should also carry retry eligibility, timestamps, and request identity when the interface needs them.

---

### Card 66

- question  
  How would you prevent an outdated request from replacing newer data?

- answer  
  Abort obsolete work when possible and independently guard state updates with request identity. Cancellation saves resources, while an identity check ensures that only the result belonging to the latest active query can update the UI. A router or server-state library should provide this behavior when data fetching is application-wide.

- explanation  
  Network completion order is nondeterministic. If request A starts first, request B starts second, and A finishes last, an unconditional A result can overwrite the newer B result. Unmounting and rapid dependency changes create the same class of stale completion.

- details  
  Combine cleanup with a request guard:

  ```jsx
  const requestIdRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const requestId = ++requestIdRef.current;

    setState(current => ({
      ...current,
      status: current.data ? "refreshing" : "loading"
    }));

    search(query, { signal: controller.signal })
      .then(data => {
        if (requestId === requestIdRef.current) {
          setState({ status: "success", data });
        }
      })
      .catch(error => {
        if (
          error.name !== "AbortError" &&
          requestId === requestIdRef.current
        ) {
          setState({ status: "error", error });
        }
      });

    return () => controller.abort();
  }, [query]);
  ```

  `AbortController` tells cooperative APIs such as `fetch` to stop, but cancellation is not a complete correctness guarantee. Work may already have resolved, parsing may continue, or a custom Promise may ignore the signal. The request ID protects the commit even when cancellation cannot stop the work.

  For mutations, “latest wins” may be incorrect: every write may matter, ordering may be significant, and retry can create duplicates. Use operation IDs, idempotency keys, optimistic-update reconciliation, or serialization according to the domain.

  Prefer router loaders or a server-state library when you also need cache keys, deduplication, invalidation, retries, pagination, SSR, and shared subscriptions. The component should not reimplement an incomplete request cache in Effects.

---

## Server rendering and architecture

### Card 67

- question  
  What causes hydration mismatches, and how would you debug them?

- answer  
  A hydration mismatch occurs when the client’s first render does not produce the same structure and content as the server HTML React is attaching to. Common causes include time or randomness, locale and time-zone differences, browser-only branches, invalid HTML nesting, changed data, and DOM modification before React starts.

- explanation  
  Hydration reuses existing server DOM instead of constructing it from scratch. React therefore expects the server render and initial client render to describe equivalent UI; a mismatch can force recovery and may attach behavior to an unexpected structure.

- details  
  Diagnose the first divergence rather than the largest subtree mentioned by the warning:

  1. Capture the full hydration warning and component stack.
  2. Inspect the original server response before client scripts mutate it.
  3. Reproduce with the same URL, authentication state, locale, time zone, feature flags, and initial data.
  4. Compare the server HTML with the client’s first render—not with the DOM after Effects run.
  5. Validate HTML nesting; browsers may repair invalid markup before React sees it.

  Typical nondeterministic code includes:

  ```jsx
  // 🚩 Different values on the server and client
  <p>{new Date().toLocaleString()}</p>
  <span>{Math.random()}</span>
  {typeof window !== "undefined" && <ClientMenu />}
  ```

  Prefer deterministic initial output. Serialize the same initial data to the client, format with an explicit shared locale and time zone, or render a stable placeholder and update it after hydration. For browser-only behavior, move the behavior—not arbitrary markup differences—behind a Client Component or Effect.

  Also check third-party scripts, password managers, browser extensions, CDNs that rewrite HTML, CSS-in-JS configuration, and incorrectly nested tags. A mismatch reported at one node may originate from invalid markup above it.

  `suppressHydrationWarning` is a limited escape hatch for deliberately unavoidable differences such as a timestamp. It works only at limited depth and does not repair the content. Do not apply it broadly to hide an unexplained mismatch.

---

### Card 68

- question  
  What is streaming server rendering?

- answer  
  Streaming server rendering sends an initial HTML shell as soon as it is ready, then progressively streams later Suspense regions as their server work completes. The browser can display useful content before the entire React tree has finished rendering.

- explanation  
  Traditional all-or-nothing SSR waits for every server dependency before sending the page. Streaming lets fast and slow regions progress independently, improving time to first content while preserving a declarative loading design.

- details  
  Suspense boundaries define the streaming units:

  ```jsx
  <PageLayout>
    <Article />
    <Suspense fallback={<CommentsSkeleton />}>
      <Comments />
    </Suspense>
  </PageLayout>
  ```

  The server can send the layout, article, and comments fallback first. When `Comments` is ready, React streams additional HTML and instructions that replace the fallback in the correct location.

  React provides server APIs such as `renderToPipeableStream` for Node streams and `renderToReadableStream` for Web Streams, but frameworks normally manage routing, data loading, status codes, head metadata, caching, aborts, and deployment integration.

  A production design must decide:

  - Which content belongs in the initial shell
  - Where Suspense and Error Boundaries isolate slow or failed regions
  - When headers and HTTP status become committed
  - How disconnected clients abort server work
  - Whether proxies and hosting infrastructure buffer the stream
  - How streamed HTML is protected by the site’s CSP and nonce strategy

  Streaming improves delivery order; it does not make slow data sources faster. Start independent requests early and in parallel, otherwise the server can still stream a waterfall one delayed boundary at a time.

---

### Card 69

- question  
  What is selective hydration?

- answer  
  Selective hydration lets React attach interactivity to server-rendered Suspense regions according to code/data readiness and user priority instead of hydrating the entire application as one blocking operation. An interaction can cause React to prioritize the relevant boundary.

- explanation  
  Server HTML may already be visible while its Client Component JavaScript is still loading or waiting to hydrate. React can hydrate available regions independently and prioritize an attempted interaction so the page becomes useful sooner.

- details  
  Imagine a streamed page containing an article and a comments widget. If the comments bundle is delayed, React can hydrate the article without waiting. If the user interacts with the comments region, React can raise that boundary’s priority and replay supported events after hydration completes.

  Suspense boundaries provide the units React can coordinate. Streaming controls when server HTML arrives; code splitting controls when Client Component code arrives; selective hydration controls when React attaches behavior to each region. These features complement one another but describe different stages.

  Selective hydration is not the same as completely independent “islands.” The regions remain part of one React tree with normal Context and event semantics. It also does not remove the cost of hydration—large Client Component trees still ship, parse, and execute JavaScript.

  Improve hydration by keeping Client Component boundaries narrow, splitting code at useful interaction boundaries, avoiding large synchronous initialization, and ensuring server/client output matches. Framework integration normally coordinates these details.

---

### Card 70

- question  
  What determines whether a component should be a Server Component or a Client Component?

- answer  
  Make a component a Client Component when its module needs client-only capabilities such as state, Effects, event handlers, refs, browser APIs, or client Context. Keep data access, secret-bearing work, and non-interactive composition in Server Components where possible. Choose the boundary from dependencies, not from whether the component sounds like a page or widget.

- explanation  
  A `"use client"` directive creates a client module boundary: that module and the client-side dependencies it imports become part of the client graph. A narrow interactive leaf can therefore preserve a mostly server-rendered tree and reduce shipped JavaScript.

- details  
  Server Components are suitable for:

  - Reading databases or internal services close to the data source
  - Using server-only credentials without exposing them to the bundle
  - Transforming large data into minimal UI props
  - Rendering non-interactive structure and content
  - Composing Client Components

  Client Components are required for:

  - `useState`, `useReducer`, Effects, and most browser-oriented Hooks
  - Event handlers such as `onClick`
  - DOM refs and imperative browser APIs
  - Client-side Context providers and consumers
  - Browser storage, observers, geolocation, and similar APIs

  Keep the boundary near the interaction:

  ```jsx
  // Server Component
  export default async function ProductPage({ id }) {
    const product = await getProduct(id);

    return (
      <article>
        <ProductDescription product={product} />
        <AddToCartButton productId={product.id} />
      </article>
    );
  }
  ```

  Only `AddToCartButton` needs to be client code. Marking the entire page `"use client"` can move unnecessary dependencies and data-fetching work into the browser.

  A Client Component cannot directly import a Server Component as ordinary client code, but a Server Component can compose server-rendered content into a Client Component through supported props such as `children`. Audit third-party packages too: a dependency using browser APIs can force the boundary upward or require a small client wrapper.

---

### Card 71

- question  
  What data can cross the Server Component and Client Component boundary?

- answer  
  Values passed from a Server Component to a Client Component must be serializable by React’s Server Component transport. Supported data includes common serializable values and React-specific references, but not arbitrary executable closures, DOM nodes, database connections, request objects, or secret-bearing server resources.

- explanation  
  The boundary is a network serialization boundary, not an in-memory component call. React must encode the value on the server and reconstruct a supported representation for the client, so the public prop contract must be designed accordingly.

- details  
  Prefer a minimal view model:

  ```jsx
  // Server Component
  const account = await database.account.findById(accountId);

  return (
    <AccountCard
      account={{
        id: account.id,
        displayName: account.displayName,
        plan: account.plan
      }}
    />
  );
  ```

  Do not pass the database model, connection, session object, or unused private fields merely because the client currently ignores them. Serialized props can be inspected by the user and may appear in framework payloads.

  Functions are not generally serializable. Server Function references are a deliberate supported exception: React and the framework encode a reference that the client can invoke as a server request. Treat that function as a public endpoint and authenticate, authorize, and validate every call.

  React’s transport supports more than JSON in supported configurations, but exact types and framework behavior should be checked against the current integration. Convert custom class instances into explicit data contracts instead of relying on prototypes or methods surviving the boundary.

  Security does not follow visual ownership. A value read in a Server Component is not automatically safe to send to a Client Component. Apply data minimization and authorization before constructing client props, and never include secrets, internal tokens, or unrestricted records.

---

### Card 72

- question  
  What is the difference between a Server Component and SSR?

- answer  
  SSR renders React output to HTML so users can see an initial page before client JavaScript hydrates it. Server Components render into a serialized React component payload and do not ship their component code to the browser. They can be used together, but they optimize different parts of the architecture.

- explanation  
  SSR addresses initial HTML delivery for a React tree that may include Client Components. Server Components address where component code and data access execute, reducing client JavaScript and enabling server-only composition across initial loads and later navigations.

- details  
  Compare their responsibilities:

  - **SSR output:** HTML for the initial visual result.
  - **SSR client behavior:** Client Component JavaScript still downloads and hydrates to become interactive.
  - **Server Component output:** a serialized React tree representation that a framework merges with the client tree.
  - **Server Component JavaScript:** remains on the server and is not hydrated in the browser.

  A Client Component can participate in both systems:

  ```jsx
  // Server Component
  export default async function ProductPage({ id }) {
    const product = await getProduct(id);
    return <BuyButton productId={product.id} />;
  }
  ```

  `ProductPage` executes only on the server. `BuyButton` may be included in server-generated HTML for the first load and then hydrate in the browser because it needs interaction.

  SSR without Server Components can still produce fast initial HTML, but the component modules generally belong to the client application and their data-fetching logic needs a separate server strategy. Server Components without initial SSR could still provide a server-generated component payload, but users would not receive the same immediately rendered HTML experience.

  Frameworks combine Server Components, SSR, streaming, routing, caching, and code splitting. In an interview, avoid saying that Server Components “replace SSR” or that anything rendered on a server is automatically a Server Component.

---

### Card 73

- question  
  What are Server Functions, and what security considerations apply to them?

- answer  
  A Server Function is a function that runs on the server but can be referenced from client-facing React code through framework integration, commonly as a form Action or mutation callback. Invocation crosses a network boundary, so it must be designed and protected like any other server endpoint.

- explanation  
  The framework may generate the transport automatically, but the browser and every submitted argument remain untrusted. A hidden input, disabled button, TypeScript type, or Server Component parent is not an authorization control.

- details  
  A protected mutation should derive identity from the verified session and authorize the specific resource:

  ```jsx
  "use server";

  async function updateProject(projectId, formData) {
    const session = await requireSession();
    const input = parseProjectUpdate(formData);

    const project = await loadProject(projectId);
    if (!canEditProject(session.user, project)) {
      throw new ForbiddenError();
    }

    await saveProject(project.id, input);
  }
  ```

  Required controls include:

  - Authenticate every protected invocation.
  - Authorize the operation against the requested record, tenant, or role.
  - Validate and normalize every argument at runtime.
  - Derive user identity from the session, not a submitted `userId`.
  - Apply CSRF protection according to the framework and authentication model.
  - Add rate limits, idempotency, and audit logging where the operation requires them.
  - Return minimal safe errors and outputs without secrets or internal details.

  Bound arguments and hidden form fields improve API ergonomics but can still be manipulated or replayed. Recheck current permissions at execution time because authorization may change after the UI was rendered.

  Mutations must also handle concurrency. Use transactions, version checks, idempotency keys, or conflict responses when duplicate or out-of-order submissions could corrupt data. Invalidate or update affected caches only after the authoritative write succeeds.

---

### Card 74

- question  
  How would you avoid network request waterfalls?

- answer  
  Start independent requests as early and in parallel as possible, colocate dependent requests with the data they require, preload predictable resources, and move request initiation to router or server boundaries when nested client rendering would delay it. First identify whether the waterfall is code, data, or both.

- explanation  
  If request B starts only after request A completes, total latency includes both waits. This sequencing is necessary when B needs A’s result, but accidental waterfalls commonly come from fetching only after a child mounts or loading code before discovering its data dependency.

- details  
  Start independent server work before awaiting it:

  ```jsx
  async function Dashboard() {
    const userPromise = getUser();
    const projectsPromise = getProjects();

    const [user, projects] = await Promise.all([
      userPromise,
      projectsPromise
    ]);

    return <DashboardView user={user} projects={projects} />;
  }
  ```

  A real dependency remains sequential:

  ```jsx
  const user = await getUser();
  const permissions = await getPermissions(user.id);
  ```

  Do not force parallelism when the second request cannot be formed safely without the first result.

  Common waterfall sources and fixes:

  - **Fetch-on-mount children:** use route loaders, Server Components, or a query layer that starts known requests before child Effects run.
  - **Code then data:** preload the route module and its data together instead of waiting for the lazy component to render.
  - **Many backend round trips:** aggregate on the server or provide a purpose-built endpoint while avoiding an unmaintainable “fetch everything” response.
  - **Duplicate reads:** deduplicate by a stable request or cache key.
  - **Late discovered assets:** use framework preloading or appropriate resource hints for predictable critical resources.

  Suspense allows independent regions to stream as they finish, but it does not automatically start requests early. The data source must initiate work before or during the correct render boundary without serial parent-child discovery.

  Verify with a browser network waterfall and server tracing. Parallel requests can increase backend load, so respect connection limits, rate limits, and dependencies rather than applying `Promise.all` indiscriminately.

---

### Card 75

- question  
  How would you design cache invalidation for server data?

- answer  
  Design invalidation from the data’s consistency requirements. Define what a cache entry represents, how it is keyed and scoped, how long it may be stale, which mutations affect it, and whether consumers need immediate consistency or may use stale-while-revalidate behavior.

- explanation  
  Caching creates another copy of server state. Without an ownership and invalidation model, it can return data for the wrong user, preserve obsolete relationships, overwrite optimistic changes, or trigger repeated refetching that removes the original benefit.

- details  
  Start with a precise key that includes every input affecting the result:

  ```text
  project:{tenantId}:{projectId}
  projects:{tenantId}:status={status}:page={page}
  ```

  Never share an authorization-sensitive entry across users or tenants unless the cached value is intentionally public and the keying model proves that separation is unnecessary.

  Common strategies include:

  - **Time-based freshness:** treat data as fresh for a known interval, then revalidate.
  - **Mutation-driven invalidation:** invalidate the affected detail and collection keys after a successful write.
  - **Tag or dependency invalidation:** associate related entries with a domain tag such as `project:42`.
  - **Event-driven invalidation:** consume database, queue, or webhook events when changes can originate outside the current process.
  - **Direct cache update:** merge an authoritative mutation response when the new value is complete and unambiguous.
  - **Stale while revalidate:** display cached data immediately while refreshing in the background.

  For an optimistic mutation, keep enough information to reconcile success or roll back only that operation’s change. Overlapping operations need unique identities so one failed mutation does not undo a later successful one.

  Define behavior for races: an older revalidation response must not replace a newer mutation result. Version numbers, timestamps from the authority, cancellation, or request identity can establish ordering.

  Distinguish React request memoization, framework data caches, browser HTTP caches, CDN caches, and client server-state caches. They have different lifetimes and invalidation APIs. Document ownership, observe hit rate and staleness, and prefer a simple refetch when correctness matters more than a complex manual merge.

---

## Forms and React Actions

### Card 76

- question  
  How do React form Actions work?

- answer  
  A React DOM `<form>` can receive a function in its `action` prop. React calls that Action with the submitted `FormData`, coordinates the submission as a Transition, and exposes pending state to descendant controls. Frameworks can connect the same model to Server Functions and progressive enhancement.

- explanation  
  The browser’s form semantics remain the foundation, while React coordinates asynchronous mutation state, optimistic UI, and returned validation results. This avoids rebuilding every submission around `preventDefault`, loading Booleans, and manually collected input values.

- details  
  A client Action receives `FormData` directly:

  ```jsx
  function RenameProject({ projectId }) {
    async function rename(formData) {
      const name = formData.get("name");
      await updateProject(projectId, { name });
    }

    return (
      <form action={rename}>
        <label>
          Project name
          <input name="name" required />
        </label>
        <SubmitButton />
      </form>
    );
  }
  ```

  Inputs still need names because native form submission constructs `FormData` from successful controls. Preserve labels, input types, constraints, Enter-to-submit behavior, and a real submit button rather than treating the form as a generic click container.

  A function Action may be asynchronous. While it runs, `useFormStatus` can expose pending submission data to descendants, `useActionState` can store the Action’s returned result, and `useOptimistic` can derive temporary UI. After a successful Action, React resets uncontrolled form fields; controlled values remain owned by their state.

  In a Server Function integration, JavaScript can enhance a form submission while the framework may preserve useful behavior before hydration. Exact navigation, permalink, error, and cache-revalidation behavior belongs to the framework and deployment model.

  Actions do not replace server guarantees. Parse untrusted `FormData`, authenticate the caller, authorize the resource, handle duplicate submissions, and return safe field or form errors. Use a normal event handler when the operation is not semantically a form submission.

---

### Card 78

- question  
  What is the difference between `useOptimistic` and immediately updating ordinary state?

- answer  
  `useOptimistic` derives a temporary view from authoritative state while an Action is in progress. When the Action finishes, React renders from the current authoritative value again. Updating ordinary state changes the source of truth immediately, so the application must manually distinguish provisional and confirmed data and implement rollback.

- explanation  
  Optimistic UI is a projection of what the interface expects the server to confirm, not confirmed domain state. `useOptimistic` makes that temporary layer explicit and keeps the base state separate.

- details  
  ```jsx
  function MessageList({ messages, sendMessage }) {
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(
      messages,
      (current, draft) => [
        ...current,
        { ...draft, pending: true }
      ]
    );

    async function action(formData) {
      const draft = {
        clientId: crypto.randomUUID(),
        text: formData.get("message")
      };

      addOptimisticMessage(draft);
      await sendMessage(draft);
    }

    return (
      <>
        <Messages messages={optimisticMessages} />
        <form action={action}>{/* controls */}</form>
      </>
    );
  }
  ```

  The update function must be pure. Give optimistic entries stable client-generated identities so pending operations can be rendered and reconciled independently. Show provisional status visually and accessibly rather than making an unconfirmed item indistinguishable from saved data.

  Ordinary state remains appropriate when the update is purely local or should become authoritative immediately. `useOptimistic` is useful when an asynchronous Action has a separate authoritative result and users benefit from seeing the likely outcome early.

  Optimism is a product decision. Avoid it for operations whose failure would be dangerous or confusing, such as final payment confirmation, permission changes, or irreversible deletion without a recovery model.

---

### Card 79

- question  
  How should an optimistic update be rolled back after failure?

- answer  
  Roll back by returning to the last confirmed server state, removing or marking only the failed optimistic operation, and showing an actionable error. Do not restore one old snapshot over the whole collection when other operations may have succeeded in the meantime.

- explanation  
  Optimistic state is provisional and operation-specific. Correct recovery depends on which request failed, what the server accepted, and whether later optimistic changes were based on the failed result.

- details  
  Track each mutation with a client operation ID and a status such as `pending`, `confirmed`, or `failed`. On success, reconcile the temporary entity with the authoritative response—often replacing a temporary ID with a server ID. On failure, remove that operation’s projection or keep it visibly failed with Retry and Discard actions.

  Consider three rollback strategies:

  - **Refetch:** invalidate and reload authoritative data. This is simple and reliable when the result is small and connectivity is available.
  - **Inverse operation:** store enough information to undo exactly the optimistic change, such as restoring a previous field value.
  - **Failed-item state:** keep the attempted item locally with an error marker so the user can edit and retry without losing input.

  Overlapping mutations make a whole-state snapshot unsafe. If operation A fails after operation B succeeds, restoring the snapshot from before A would erase B. Reconcile by operation identity or use a mutation queue when order is semantically important.

  Retries can duplicate writes after an ambiguous timeout—the server may have committed even though the client did not receive the response. Use idempotency keys for operations such as orders or payments. For irreversible or high-risk actions, prefer confirmed UI, an undo/compensating operation, or a staged workflow over aggressive optimism.

  Announce the failure, preserve user input, and explain whether the interface has reverted or retained a failed draft. Silent rollback makes the UI appear unreliable.

---

### Card 80

- question  
  What does `useFormStatus` provide?

- answer  
  `useFormStatus` exposes the status of a parent `<form>` submission. It returns `pending`, `data`, `method`, and `action` for the latest submission handled by that form.

- explanation  
  Descendant controls can respond to submission state without manually threading props through the form. The component calling the Hook must be rendered inside the form; calling it in the same component that renders the form does not observe that form.

- details  
  Put submission UI in a descendant component of the form:

  ```jsx
  function SubmitButton() {
    const { pending } = useFormStatus();

    return (
      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </button>
    );
  }

  function ProfileForm({ saveProfile }) {
    return (
      <form action={saveProfile}>
        <input name="displayName" />
        <SubmitButton />
      </form>
    );
  }
  ```

  The Hook returns:

  - `pending`: whether the parent form is currently submitting.
  - `data`: the active submission’s `FormData`, or `null` when there is no submission.
  - `method`: the form method, normally `get` or `post`.
  - `action`: the submitted function Action, or `null` for unsupported action forms.

  It observes only the nearest parent form. Calling `useFormStatus` in the same component that returns `<form>` does not observe that form, and it does not report a child form’s status.

  Use `data` carefully: it can contain sensitive field values. Do not render passwords, tokens, or private submitted data in status messages or logs. `pending` can prevent accidental duplicate submission and drive progress text, but disabling every form control can make review or cancellation unnecessarily difficult.

  `useActionState` and `useFormStatus` solve different scopes. The former owns the returned state of one Action; the latter lets any descendant control observe its parent form’s current submission.

---

### Card 81

- question  
  How do pending, validation, and submission errors affect accessible form design?

- answer  
  Preserve native form semantics, label every control, associate validation errors programmatically, keep user input after failure, expose pending state without removing context, and move focus only when it helps users recover or when submission navigates to a new context.

- explanation  
  Color, spinners, and disabled styling may be invisible or ambiguous to assistive-technology users. Accessible forms communicate relationships and state through labels, descriptions, focus, and restrained status announcements.

- details  
  For field errors, connect the message to the control:

  ```jsx
  <label htmlFor="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    aria-invalid={Boolean(errors.email)}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error">{errors.email}</p>
  )}
  ```

  On an invalid submission:

  - Preserve entered values whenever safe.
  - Show a clear error summary for long forms.
  - Move focus to the summary or first invalid field when users would otherwise need to search for the problem.
  - Keep field messages next to their controls and avoid relying on placeholders as labels.

  During submission, keep the button’s name understandable and expose progress:

  ```jsx
  <button disabled={pending}>
    {pending ? "Saving profile…" : "Save profile"}
  </button>
  <p role="status">
    {pending ? "Saving profile." : statusMessage}
  </p>
  ```

  Avoid replacing the entire form with a spinner, which removes the user’s context. Do not use `aria-live="assertive"` for routine progress, and avoid repeatedly announcing every small state change. If the operation takes long enough, explain whether it can be cancelled.

  Distinguish validation, authorization, network, and server errors because they require different recovery. After success, announce the result and move focus only if the page context changed—for example, to a confirmation heading after navigation. Test keyboard submission, error recovery, pending behavior, and screen-reader announcements rather than checking ARIA attributes alone.

---

## Component architecture

### Card 82

- question  
  What are compound components?

- answer  
  Compound components are a family of components that share state and behavior while letting consumers compose the visible structure. A parent usually owns the state and exposes a focused Context to related children, as with tabs, menus, accordions, or select controls.

- explanation  
  The pattern replaces a large configuration object or many layout props with explicit JSX composition. Consumers control arrangement, while the component family preserves one behavioral and accessibility contract.

- details  
  ```jsx
  <Tabs defaultValue="details">
    <Tabs.List aria-label="Product sections">
      <Tabs.Trigger value="details">Details</Tabs.Trigger>
      <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
    </Tabs.List>

    <Tabs.Panel value="details">
      <ProductDetails />
    </Tabs.Panel>
    <Tabs.Panel value="reviews">
      <Reviews />
    </Tabs.Panel>
  </Tabs>
  ```

  `Tabs` can own the selected value or support a controlled `value` and `onValueChange` pair. Descendants read a narrow internal Context containing the current value, generated IDs, and intentional actions such as `select(value)`.

  A robust implementation should:

  - Throw a useful development error when a compound child is used outside its provider.
  - Generate stable relationships between triggers and panels.
  - Implement the expected keyboard pattern, focus movement, roles, and ARIA state.
  - Keep internal and public Context contracts separate.
  - Support controlled and uncontrolled state without switching modes unexpectedly.
  - Avoid rerendering every descendant for unrelated provider-value changes.

  Prefer Context over inspecting or cloning arbitrary `children`; cloning is fragile when children are wrapped, reordered, rendered through portals, or composed by another component. Context also lets related parts be nested inside layout markup.

  The trade-off is hidden coupling: `Tabs.Trigger` only works meaningfully inside `Tabs`. Use compound components when that relationship is part of the public design, not for unrelated components that merely happen to share data.

---

### Card 83

- question  
  What is the render-prop pattern?

- answer  
  A render prop is a function passed to a component so the component can provide state or behavior while the caller controls the rendered UI. The function may be named, such as `renderItem`, or supplied as `children`.

- explanation  
  The owner component controls when and with what data the function is called; the consumer controls the resulting elements. This is useful when reuse requires a specific render scope or lifecycle rather than only reusable Hook logic.

- details  
  ```jsx
  <MousePosition>
    {({ x, y }) => <Cursor x={x} y={y} />}
  </MousePosition>
  ```

  A more practical collection API might expose rendering decisions without exposing its state implementation:

  ```jsx
  <VirtualList
    items={messages}
    estimateSize={48}
    renderItem={({ item, style, isVisible }) => (
      <MessageRow
        message={item}
        style={style}
        highlighted={isVisible && item.id === activeId}
      />
    )}
  />
  ```

  The virtualizer must control which items render and supply positioning information, so a render prop expresses the boundary better than a Hook alone.

  Prefer a custom Hook when consumers only need reusable stateful behavior and can render normally:

  ```jsx
  const { x, y } = usePointerPosition();
  return <Cursor x={x} y={y} />;
  ```

  Render-prop trade-offs include nesting, a larger callback API, and function identities that may affect memoized consumers. Document whether the callback may run many times, whether it must return one element, and which provided values are stable.

  Do not call a render prop outside rendering or treat it like an event handler. It participates in rendering and must remain pure. Use the pattern when the component genuinely owns render timing, placement, or scope—not simply because passing a function feels flexible.

---

### Card 84

- question  
  What are higher-order components, and when are they still useful?

- answer  
  A higher-order component, or HOC, is a function that accepts a component type and returns a new component type that adds data, behavior, or rendering policy. HOCs remain useful in legacy code and library integrations that must wrap components rather than run inside their implementation.

- explanation  
  Hooks usually provide clearer reuse inside function components, but they cannot always replace an API that decorates an unknown component supplied by a consumer. HOCs also appear in routing, state, internationalization, error-reporting, and compatibility layers.

- details  
  ```jsx
  function withPermission(requiredPermission) {
    return function wrap(Component) {
      function WithPermission(props) {
        const permissions = usePermissions();

        if (!permissions.has(requiredPermission)) {
          return <Forbidden />;
        }

        return <Component {...props} />;
      }

      WithPermission.displayName =
        `withPermission(${Component.displayName ?? Component.name ?? "Component"})`;

      return WithPermission;
    };
  }
  ```

  Create the enhanced component at module scope:

  ```jsx
  const ProtectedSettings = withPermission("settings:write")(Settings);
  ```

  Creating an HOC inside another component’s render produces a new component type each time and can reset the wrapped subtree.

  Important API concerns include:

  - Forward unrelated props without silently overwriting them.
  - Namespace or document injected props to avoid collisions.
  - Decide deliberately whether and how refs reach the wrapped component.
  - Preserve required static metadata when the framework or library reads it.
  - Give wrappers useful display names for DevTools and errors.
  - Compose several HOCs carefully; wrapper stacks can obscure data ownership.

  Prefer a custom Hook for new logic when the component can opt into the behavior directly. Use an HOC when component-type transformation is the actual requirement, not merely because the codebase historically used decorators.

---

### Card 85

- question  
  How would you design a reusable modal or dialog component?

- answer  
  Design a dialog as a coordinated accessibility and interaction primitive: controlled open state, correct modal semantics, accessible naming, initial focus, contained keyboard interaction, Escape and outside-interaction policy, background inertness, focus restoration, portal and stacking behavior, and animation-aware mounting.

- explanation  
  A fixed overlay may look like a modal while keyboard focus remains behind it, screen readers continue navigating background content, or closing loses the user’s position. The reusable API must own these cross-cutting behaviors consistently.

- details  
  A composable API can separate the trigger, surface, title, description, and actions:

  ```jsx
  <Dialog open={open} onOpenChange={setOpen}>
    <Dialog.Trigger>Edit profile</Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Title>Edit profile</Dialog.Title>
      <Dialog.Description>
        Changes are visible to your team.
      </Dialog.Description>
      <ProfileForm />
    </Dialog.Content>
  </Dialog>
  ```

  The primitive should provide or enforce:

  - `role="dialog"` and `aria-modal="true"`, or correct native `<dialog>` behavior.
  - An accessible name through a title or explicit label.
  - Meaningful initial focus—not automatically the first destructive action.
  - Tab containment while modal, visible focus, and Escape behavior.
  - An explicit outside-click policy; destructive or multi-step flows may not dismiss on outside interaction.
  - Background inertness and scroll locking without breaking scrollbar layout.
  - Restoration to the trigger or a logical successor when the trigger disappeared.

  Use a portal to escape clipping and stacking contexts, but remember that portals do not implement accessibility or focus behavior. Coordinate z-index, nested dialogs and popovers, pointer events, and event propagation through one overlay system.

  Keep content mounted until its exit animation finishes, but prevent hidden exiting content from remaining interactive. Support reduced motion and avoid restoring focus before the closing transition is logically complete.

  Prefer a well-tested platform or headless-dialog primitive over rebuilding focus containment. Test keyboard-only use, screen-reader naming, long content, mobile viewport and virtual keyboard behavior, nested overlays, interrupted animations, and removal of the original trigger.

---

### Card 86

- question  
  How would you design a reusable data table?

- answer  
  Build a data table from a generic row model and declarative column definitions, then keep sorting, filtering, selection, pagination, and virtualization as independent controlled capabilities. Preserve native table semantics for genuinely tabular data and let applications own server-driven state.

- explanation  
  A reusable table should not assume employee-shaped rows or embed one fetching strategy. Columns describe how to identify, render, and optionally sort values; the application decides where rows come from and which state belongs in the URL, server query, or local UI.

- details  
  A useful generic contract is:

  ```ts
  type ColumnDef<T> = {
    id: string;
    header: ReactNode;
    cell: (row: T) => ReactNode;
    sortValue?: (row: T) => string | number | Date | null;
    align?: "start" | "center" | "end";
  };

  type DataTableProps<T> = {
    rows: readonly T[];
    columns: readonly ColumnDef<T>[];
    getRowId: (row: T) => string;
    sort?: SortState;
    onSortChange?: (sort: SortState) => void;
    selectedIds?: ReadonlySet<string>;
    onSelectedIdsChange?: (ids: ReadonlySet<string>) => void;
  };
  ```

  `getRowId` provides durable identity; never derive selection from an array index. A column separates rendered content from its sortable value so formatted dates, badges, and links do not require parsing DOM text.

  Decide which features are client- or server-owned. A small in-memory table can sort and paginate locally. A large dataset should emit controlled query state so the server can filter, order, and paginate authoritative data. Clearly communicate whether selection applies to visible rows, the current page, or all matching records.

  Accessibility and semantics include:

  - A `<caption>` or another programmatic table name.
  - Correct `<th scope="col">` and row-header relationships.
  - Real buttons for sortable headers with current sort direction exposed through `aria-sort`.
  - Keyboard-operable selection controls with specific accessible names.
  - Loading, empty, error, and stale states that preserve column context.

  Do not add grid-style arrow-key navigation to an ordinary reading table. Use the more complex ARIA grid interaction model only when cells are truly interactive like a spreadsheet.

  For large collections, consider pagination or virtualization, but test focus retention, sticky headers, responsive overflow, printing, and screen-reader behavior. Keep feature logic modular; one universal table with dozens of interacting Boolean props becomes harder to understand than composable state Hooks and a semantic rendering core.

---

### Card 87

- question  
  How do you balance abstraction with duplication?

- answer  
  Accept small duplication until repeated cases reveal a stable concept and change pattern. Abstract when one shared rule, behavior, or policy should change consistently across consumers—not merely because two code blocks currently look similar.

- explanation  
  Duplication costs repeated maintenance, but a wrong abstraction couples unrelated requirements and grows flags, branches, and escape hatches. The goal is minimizing the cost of future change, not minimizing the number of repeated lines.

- details  
  Evaluate a possible abstraction with these questions:

  - Do the cases share the same domain rule or only similar markup?
  - Do they change together for the same reasons?
  - Can the shared contract be named clearly?
  - Are variations intentional extension points or evidence that the cases differ?
  - Will consumers understand the abstraction without reading its implementation?

  Three similar implementations often provide enough evidence, but “rule of three” is a heuristic rather than a quota. A security rule, analytics contract, or accessible interaction pattern may deserve centralization immediately because inconsistency is costly. Two small presentational fragments may remain duplicated indefinitely if they evolve independently.

  Warning signs of premature abstraction include:

  - Many Boolean props describing unrelated modes
  - Callbacks that expose internal implementation steps
  - Consumers overriding most defaults
  - Conditional branches named after individual product screens
  - A shared component changed repeatedly for only one caller

  Prefer the smallest stable layer: a pure utility, focused Hook, primitive component, or shared policy may remove the important knowledge duplication without forcing entire features into one universal abstraction.

  Keep escape hatches deliberate and observable. If every consumer needs arbitrary internal overrides, the abstraction may be at the wrong level. It is acceptable to inline or split a failed abstraction when requirements diverge; maintaining it is not automatically better than restoring some duplication.

---

### Card 88

- question  
  How do you prevent a design-system component API from becoming overly complex?

- answer  
  Keep design-system APIs small by separating stable primitives from product composition, representing supported variation with constrained variants, exposing a few deliberate slots, forwarding appropriate native attributes, and making accessibility and design tokens defaults rather than optional add-ons.

- explanation  
  Every public prop creates a long-term compatibility and testing obligation. One-off Boolean additions quickly allow contradictory combinations and move product-specific policy into a shared primitive.

- details  
  Prefer a constrained model:

  ```tsx
  <Button
    variant="danger"
    size="compact"
    loading={isDeleting}
  >
    Delete project
  </Button>
  ```

  over unrelated switches:

  ```tsx
  <Button red small bold rounded noShadow withSpinner />
  ```

  `variant` encodes a supported semantic decision; the Boolean collection exposes implementation details and permits combinations the design system may never have tested.

  API guidelines include:

  - Start from a native element and forward compatible attributes and refs.
  - Use semantic tokens instead of accepting arbitrary internal colors and spacing.
  - Define controlled and uncontrolled behavior consistently across components.
  - Keep state props distinct from visual variants.
  - Expose composition slots for content structure instead of a prop for every possible child.
  - Avoid polymorphic `as` APIs unless semantics, typing, and ref behavior remain reliable.
  - Reject or warn about invalid combinations during development when practical.

  Accessibility invariants belong inside the primitive: disabled and pending semantics, keyboard behavior, focus visibility, accessible naming requirements, and reduced-motion behavior should not depend on every product team remembering them.

  Establish an API review process. Require a repeated use case, document ownership, test the supported variant matrix, publish migration guidance, and deprecate before removing. Use product-level wrapper components for local policy instead of adding each screen’s exception to the global primitive.

  An escape hatch such as `className` can be reasonable, but it should not make internal DOM structure a permanent public contract. Track repeated overrides; they are evidence that a missing token, variant, slot, or separate component may be needed.

---

### Card 89

- question  
  What belongs in a component, custom Hook, utility, service, or store?

- answer  
  Put code where its lifecycle and dependencies naturally belong: components describe UI, custom Hooks compose React state and synchronization, utilities perform pure framework-independent work, services implement external-system operations, and stores own shared mutable state with a subscription model.

- explanation  
  File length is not an architectural boundary. Separating code by responsibility keeps domain logic testable, React lifecycles explicit, external effects replaceable, and shared state ownership understandable.

- details  
  **Component**

  Use a component when the responsibility is rendering structure and connecting user interaction to application behavior. Components may orchestrate Hooks, but dense domain transformations and transport details should not be buried in JSX.

  **Custom Hook**

  Use a Hook when logic composes React Hooks or exposes a React lifecycle:

  ```jsx
  function useOnlineStatus() {
    return useSyncExternalStore(
      subscribeToOnlineStatus,
      getOnlineSnapshot,
      getServerOnlineSnapshot
    );
  }
  ```

  A function does not become a Hook merely because its name starts with `use`. If it needs no React state, Context, Effect, ref, or subscription lifecycle, it may be a utility instead.

  **Utility or domain function**

  Keep parsing, validation, sorting, calculations, and state transitions pure when possible. Pure functions can run on the server, client, worker, or test runner without a React environment.

  **Service**

  A service integrates an external boundary such as HTTP, storage, analytics, or a payment SDK. It should expose domain-oriented operations, accept cancellation and dependencies where relevant, normalize transport errors, and avoid importing component state.

  **Store**

  A store owns shared mutable state outside an individual component and provides subscriptions. Use it when distant consumers need coordinated updates, updates originate outside React, or selector-based subscriptions are important. Do not create a global store merely to avoid passing props.

  A typical flow is:

  ```text
  Component → custom Hook → service → external system
                  ↓
             utility/domain logic
  ```

  These are responsibilities, not mandatory layers. A small component can call a service through a focused Hook without five wrapper files. Split code when doing so clarifies ownership, enables reuse at the correct level, or isolates effects—not to satisfy an arbitrary folder convention.

---

## Testing and quality

### Card 90

- question  
  What should be mocked in a React test?

- answer  
  Mock at external or nondeterministic boundaries that the test does not intend to exercise—such as network transport, time, randomness, browser APIs, analytics, or a payment SDK. Keep your own components, Hooks, state transitions, and meaningful provider integration real whenever practical.

- explanation  
  A mock replaces production behavior with a second implementation maintained by the test. Mocking internal collaborators can make the test pass even when those collaborators no longer integrate correctly, while boundary mocks give deterministic control without hiding application behavior.

- details  
  Prefer intercepting the network boundary over mocking the data Hook:

  ```jsx
  server.use(
    http.get("/api/profile", () =>
      HttpResponse.json({ name: "Ada" })
    )
  );

  render(<Profile />);
  expect(await screen.findByText("Ada")).toBeVisible();
  ```

  This keeps the component, query layer, loading state, response parsing, and rendering connected while making the server response controllable.

  Good mock candidates include:

  - HTTP responses and transport failures
  - Current time, timers, and randomness when determinism matters
  - Unsupported environment APIs such as `ResizeObserver`
  - Irreversible third-party side effects such as analytics or payment submission
  - Slow infrastructure outside the scope of a component test

  Avoid mocking:

  - `useState`, `useContext`, or React itself
  - Your custom Hook merely to force a component branch
  - Child components whose real interaction is central to the behavior
  - Internal functions only so the test can assert that they were called

  Use the narrowest faithful substitute and make it fail realistically: status codes, latency control, malformed payloads, cancellation, and retry may matter. Reset mocks between tests and avoid shared mutable fixtures. Keep some integration and end-to-end coverage with real boundaries so contract drift is detected.

---

### Card 91

- question  
  Why can testing implementation details make tests fragile?

- answer  
  Tests become fragile when they assert how a component works—private state, Hook calls, helper invocations, CSS structure, or child composition—instead of what users and external systems can observe. A harmless refactor then breaks tests even though the behavior is unchanged.

- explanation  
  Public behavior is the stable contract. Testing through roles, labels, user interactions, visible outcomes, navigation, or emitted requests allows the implementation to evolve while still detecting regressions users would notice.

- details  
  Fragile test:

  ```jsx
  expect(wrapper.find(UserRow)).toHaveLength(3);
  expect(setSelectedId).toHaveBeenCalledWith("42");
  ```

  This assumes a component boundary and state setter. The same feature may later use virtualization, a reducer, or different composition.

  Behavior-oriented test:

  ```jsx
  render(<UserPicker users={users} />);

  await user.click(
    screen.getByRole("option", { name: "Ada Lovelace" })
  );

  expect(
    screen.getByRole("status")
  ).toHaveTextContent("Ada Lovelace selected");
  ```

  Prefer queries in the order users perceive the interface: role and accessible name, label text, visible text, then a test ID only when no meaningful semantic query exists. A test ID is not inherently wrong, but it should represent a stable product contract rather than a DOM path.

  Implementation assertions are appropriate when the implementation itself is the contract—for example, a memoization utility’s cache semantics, an analytics integration event, or a low-level library primitive. Even then, test through the narrowest public API.

  Do not equate “behavior test” with an enormous end-to-end test. A focused component test can still render realistic providers, perform one user workflow, and assert one observable result with a clear failure reason.

---

### Card 92

- question  
  How do you test custom Hooks?

- answer  
  Test a custom Hook through the smallest realistic React consumer when its value is primarily visible through component behavior. Use a Hook test harness when the Hook itself exposes a reusable public API whose rerenders, returned callbacks, errors, or cleanup require focused verification.

- explanation  
  Hooks depend on React’s render and commit lifecycle. Calling the Hook as an ordinary function cannot reproduce state retention, Effect cleanup, Context, Strict Mode checks, or rerender behavior.

- details  
  For a Hook that drives UI, a consumer is often clearest:

  ```jsx
  function Status() {
    const online = useOnlineStatus();
    return <p>{online ? "Online" : "Offline"}</p>;
  }

  render(<Status />);
  expect(screen.getByText("Online")).toBeVisible();
  ```

  For a reusable Hook API, a harness can inspect returned behavior:

  ```jsx
  const { result, rerender, unmount } = renderHook(
    ({ delay }) => useDebouncedValue("query", delay),
    { initialProps: { delay: 300 } }
  );
  ```

  Cover the public contract:

  - Initial returned value
  - Behavior after callbacks or external notifications
  - New props supplied through rerender
  - Asynchronous transitions with controlled time or Promises
  - Subscription and timer cleanup on dependency change and unmount
  - Error and cancellation behavior
  - Required providers through a wrapper

  Avoid asserting how many times an internal Effect ran or which private state variables exist unless lifecycle count is the documented contract. In development Strict Mode, setup and cleanup may be stress-tested more than once.

  If a Hook mostly coordinates a service and returns data to a component, one integration-oriented component test may provide more confidence than separately mocking the service, Hook, and consumer in three isolated tests.

---

### Card 93

- question  
  How do you test components that use Context?

- answer  
  Render the component under the real Context provider or a faithful test provider and verify behavior through the consumer’s public UI. Supply the smallest realistic value needed by each scenario, and test provider updates when reactivity is part of the contract.

- explanation  
  Mocking `useContext` bypasses provider lookup, default behavior, value shape, and rerender propagation. A provider wrapper preserves the integration React actually runs while keeping the test setup concise.

- details  
  ```jsx
  function renderWithPermissions(
    ui,
    { permissions = new Set(), ...options } = {}
  ) {
    return render(
      <PermissionsContext value={permissions}>
        {ui}
      </PermissionsContext>,
      options
    );
  }

  renderWithPermissions(<ProjectActions />, {
    permissions: new Set(["project:delete"])
  });

  expect(
    screen.getByRole("button", { name: "Delete project" })
  ).toBeEnabled();
  ```

  Test meaningful cases: missing provider behavior, default value, permitted and forbidden branches, provider updates, and callbacks that modify provider-owned state. If the production provider contains important reducer or subscription logic, include integration coverage with that provider rather than always replacing it with a static value.

  A shared `renderApp` helper can install router, query, theme, locale, and authentication providers, but keep overrides explicit. An opaque helper with many hidden defaults makes tests pass under a setup that may not resemble the scenario being described.

  Do not put unrelated values into one test Context merely for convenience. Tests should reinforce the same focused provider boundaries expected in production.

---

### Card 94

- question  
  How do you test loading, errors, Suspense, and asynchronous updates?

- answer  
  Make asynchronous work deterministic: control when the request or Promise resolves, assert the initial loading or retained-content state, resolve or reject it deliberately, and await the final observable result. Test Suspense and Error Boundaries as they are composed in production.

- explanation  
  Fixed delays make tests slow and timing-dependent. Controlling the boundary lets the test prove each state transition and fail because behavior is wrong rather than because a machine was temporarily slower.

- details  
  A reliable happy-path test follows the user-visible sequence:

  ```jsx
  render(<ProfilePage />);

  expect(
    screen.getByRole("status", { name: "Loading profile" })
  ).toBeVisible();

  expect(
    await screen.findByRole("heading", { name: "Ada Lovelace" })
  ).toBeVisible();
  ```

  Configure the network handler or controllable Promise before rendering. Use `findBy...` when an element should eventually appear and `waitFor` when repeatedly checking a broader observable condition. Do not use `waitFor` to conceal an interaction that was never awaited.

  Test separate scenarios for:

  - Initial loading followed by success
  - Empty successful data
  - Rejection handled by the production Error Boundary
  - Retry that replaces the failure with content
  - Background refresh that retains stale data
  - Two requests resolving out of order
  - Cancellation or unmount cleanup when it is part of the contract

  For Suspense, use a stable controllable Promise or framework test integration. Assert the fallback before resolving, then resolve inside the testing environment’s supported async flow and await the content. Reject in a separate test and verify the nearest Error Boundary, error reporting, and reset behavior.

  Fake timers are useful for debounce, retry delay, or timeout behavior, but advance them deliberately and restore real timers after the test. Timers do not automatically flush Promises, so await both the user-visible interaction and resulting UI.

  Verify accessibility as part of async behavior: loading indicators need names, important completion may need a restrained live-region announcement, and a background Transition should not unnecessarily remove useful content or focus.

---

### Card 95

- question  
  What causes React test warnings about updates not being wrapped in `act`?

- answer  
  An `act` warning means React observed an update that the test did not include in a completed interaction or async boundary before making assertions or finishing. It usually signals a missing `await`, an unresolved timer or Promise, an external subscription update, or unhandled cleanup—not a need to wrap the entire test in `act`.

- explanation  
  `act` tells React to flush updates and Effects associated with a test operation so assertions observe a settled state. Modern rendering and user-event utilities wrap their own operations, but the test must still await those operations and any observable outcome they trigger.

- details  
  Start with the first asynchronous action:

  ```jsx
  // 🚩 The click starts updates, but the test does not await them.
  user.click(screen.getByRole("button", { name: "Save" }));

  // ✅ Await the interaction and the resulting UI.
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Saved")).toBeVisible();
  ```

  Common causes include:

  - Missing `await` on `user.click`, `user.type`, or another async helper
  - A request finishing after the test ends
  - Fake timers advanced outside the supported `act` flow
  - A subscription emitting after render without a controlled test API
  - An Effect cleanup or state update occurring during unmount
  - Asserting only the initial state while a known update remains pending

  Prefer waiting for the visible consequence rather than adding `await act(async () => {})` without a triggering operation. Manual `act` is appropriate when the test directly controls a source outside React testing utilities, such as invoking a custom store emitter or advancing a timer.

  Do not silence console warnings globally. Treat the warning as evidence that the test has not modeled the complete lifecycle, locate the originating update, and make its completion or cleanup explicit.

---

### Card 96

- question  
  When are snapshot tests useful, and when are they harmful?

- answer  
  Snapshot tests are useful for small, stable, intentionally reviewable serialized contracts. They become harmful when a large component tree, volatile markup, generated IDs, or broad page output creates noisy diffs that reviewers update mechanically instead of understanding.

- explanation  
  A snapshot records everything without explaining which details matter. Focused assertions name the expected behavior and produce failures that point directly to the broken contract.

- details  
  Reasonable snapshot targets include:

  - A small compiler or formatter output
  - A stable accessibility-tree fragment
  - A compact serialized state migration
  - A design token or generated configuration contract

  Weak targets include an entire route, a deeply nested component tree, timestamps, random IDs, CSS implementation structure, and output that changes for unrelated reasons.

  Prefer an explicit assertion when the contract is specific:

  ```jsx
  expect(
    screen.getByRole("button", { name: "Save" })
  ).toBeDisabled();
  ```

  This communicates more intent than a page snapshot containing a disabled attribute somewhere among hundreds of lines.

  Keep snapshots close to the behavior they document, normalize only truly irrelevant nondeterminism, and review every diff as production code. Never update snapshots merely to make CI green.

  DOM snapshots do not prove keyboard behavior, focus order, screen-reader announcements, responsive layout, or visual appearance. Use interaction assertions, accessibility tooling, and visual-regression tests for those distinct risks.

---

### Card 97

- question  
  How would you test keyboard and focus behavior?

- answer  
  Exercise the component with realistic keyboard input and assert focus after every meaningful step, along with the resulting selection, expansion, dismissal, or activation state. Test the keyboard pattern appropriate to the widget rather than assuming every interactive element uses Tab for internal navigation.

- explanation  
  Keyboard accessibility depends on both event handling and focus management. A control can respond to a synthetic key event while still being unreachable in the real tab order, trapping focus, or failing to expose state semantically.

- details  
  Test through user-level keyboard APIs:

  ```jsx
  render(<DialogExample />);

  const trigger = screen.getByRole("button", {
    name: "Edit profile"
  });

  trigger.focus();
  await user.keyboard("{Enter}");

  const dialog = screen.getByRole("dialog", {
    name: "Edit profile"
  });
  expect(dialog).toBeVisible();
  expect(screen.getByLabelText("Display name")).toHaveFocus();

  await user.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
  ```

  Cover the relevant interaction contract:

  - Natural Tab and Shift+Tab order
  - Enter and Space activation differences for native controls
  - Escape dismissal and focus restoration
  - Arrow, Home, and End navigation for tabs, menus, listboxes, or grids
  - Roving `tabIndex` or `aria-activedescendant` behavior
  - Disabled-item and typeahead behavior where the widget pattern requires it
  - Focus after insertion, deletion, validation failure, and route changes

  Avoid calling `.focus()` for every step when the purpose is to test reachability; use Tab navigation to prove the element can actually be reached. Direct focus is appropriate for setting the initial precondition.

  DOM test environments do not reproduce every browser focus behavior, layout dependency, Shadow DOM interaction, or screen-reader announcement. Keep browser-level coverage for critical dialogs, menus, command palettes, and other complex widgets, and include representative manual assistive-technology testing.

---

## Security and accessibility

### Card 98

- question  
  What are the risks of `dangerouslySetInnerHTML`?

- answer  
  `dangerouslySetInnerHTML` asks React to insert an HTML string directly into a DOM element. It bypasses React’s normal text escaping, so untrusted or incorrectly sanitized content can execute script-capable markup, create unsafe links, alter page structure, or enable cross-site scripting.

- explanation  
  Rendering `{userInput}` creates text, so characters such as `<` do not become markup. Passing the same value through `dangerouslySetInnerHTML` changes the value’s interpretation from text to HTML and transfers responsibility for its safety to the application.

- details  
  Safe ordinary rendering:

  ```jsx
  <p>{comment.body}</p>
  ```

  Raw HTML sink:

  ```jsx
  <article
    dangerouslySetInnerHTML={{ __html: comment.html }}
  />
  ```

  The explicit name is a warning, not protection. Dangerous content is broader than a `<script>` tag. Attackers may use event-handler attributes, unsafe URL schemes, SVG or MathML features, CSS-capable constructs, malformed markup, or browser parsing behavior.

  Other risks include:

  - Replacing React-managed descendants of that element
  - Hydration differences when server and client sanitization disagree
  - Unsafe links or embedded resources even when script execution is removed
  - Future policy regressions when new tags or attributes are allowed

  Prefer structured data rendered through JSX, plain text, or a constrained format whose nodes map to approved React components. If arbitrary rich HTML is a genuine requirement, sanitize it with a maintained parser-based policy before it reaches this sink.

  Content Security Policy and Trusted Types can reduce exploitability and enforce safer sinks, but they are defense in depth. They do not make untrusted HTML intrinsically safe or replace sanitization and output minimization.

---

### Card 99

- question  
  How should untrusted HTML be rendered safely?

- answer  
  Treat HTML as untrusted until a maintained, parser-based sanitizer transforms it according to a narrow allowlist. Sanitize at a trusted boundary, render only the sanitized result, and avoid accepting arbitrary HTML when plain text or a structured rich-text model can meet the requirement.

- explanation  
  Validation answers whether input matches an expected data shape; sanitization removes or rewrites dangerous markup for a specific output context. Escaping would display HTML as text, while sanitization deliberately retains an approved subset as markup.

- details  
  Define a policy from product requirements:

  - Allow only needed elements such as paragraphs, lists, emphasis, and links.
  - Allow only needed attributes.
  - Restrict URL schemes and normalize links.
  - Decide whether images, embedded media, inline style, SVG, and MathML are necessary.
  - Add safe link attributes where external navigation requires them.

  ```jsx
  const safeHtml = sanitizer.sanitize(untrustedHtml, policy);

  return (
    <article
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
  ```

  Sanitize as close as practical to the trust boundary and avoid mutating the markup afterward. A transformation performed after sanitization can reintroduce unsafe attributes or URLs. If both server and client render the content, use compatible policies and versions to avoid hydration inconsistencies.

  Do not write an HTML sanitizer with regular expressions. HTML parsing, namespaces, entity decoding, and browser correction rules are too complex. Use a security-maintained library appropriate to the runtime, keep it updated, and test known malicious payload categories as well as the allowed formatting contract.

  Consider representing rich text as validated structured nodes:

  ```jsx
  const renderers = {
    paragraph: node => <p>{render(node.children)}</p>,
    strong: node => <strong>{render(node.children)}</strong>
  };
  ```

  This makes supported content explicit and avoids exposing a general HTML sink. Still validate URLs and every node type because structured input can contain unsafe values too.

  CSP, Trusted Types, sandboxed iframes for isolated third-party documents, and server-side storage policy are additional layers. Record where sanitized content originated and avoid assuming that “stored” content is trusted merely because it came from your database.

---

### Card 100

- question  
  How should focus be managed when opening and closing a modal?

- answer  
  When a modal opens, save the invoking context and move focus to a deliberate element inside it. While open, keep focus and interaction within the modal and make the background inert. When it closes, restore focus to the trigger or another logical location if that trigger no longer exists.

- explanation  
  Visual position does not control keyboard or assistive-technology focus. Without explicit management, users may continue interacting with obscured content, lose their place after closing, or land on a destructive action unexpectedly.

- details  
  **On open**

  Store the element that triggered the modal before moving focus. Choose initial focus according to the task:

  - A heading or container for long informational content
  - The first invalid field for a correction flow
  - The primary field for a short input dialog
  - The least destructive action for a destructive confirmation

  The modal needs an accessible name through a visible title or explicit label. Initial focus should be visible and should not unexpectedly scroll important context out of view.

  **While open**

  A modal interaction model should:

  - Keep Tab and Shift+Tab within the dialog.
  - Prevent pointer and keyboard interaction with the background.
  - Support Escape unless the product has a strong documented reason not to.
  - Define whether outside interaction dismisses the modal.
  - Preserve focus through validation, loading, and content updates.
  - Handle nested popovers or dialogs through one coordinated overlay system.

  Use native `<dialog>` behavior or a well-tested accessible primitive when possible. A portal, `role="dialog"`, and `aria-modal="true"` provide structure and semantics, but do not alone implement focus containment or restoration.

  **On close**

  Restore focus to the original trigger when it still exists and remains meaningful. If deleting an item also removes its trigger, move focus to the next item, collection heading, or another predictable successor. Do not send focus to `<body>` and force keyboard users to restart navigation.

  Coordinate focus with exit animations: prevent the closing surface from remaining interactive, but restore focus at a point that does not create visible focus jumps. Test keyboard opening, Tab wrapping, Escape, validation failure, nested overlays, trigger removal, reduced motion, and browser back navigation.

---

### Card 101

- question  
  What is the difference between hiding and unmounting content?

- answer  
  Unmounting removes a subtree from React and the DOM, runs Effect cleanup, clears refs, and discards its local state. Hiding usually keeps the subtree mounted, but the exact behavior depends on whether it is hidden with CSS, `hidden`, `inert`, or React’s `<Activity>`—these choices differ in accessibility, interaction, and Effect lifecycle.

- explanation  
  “Not visible” is not one lifecycle state. A visually hidden element may still consume memory, run subscriptions, receive programmatic focus, or remain exposed to assistive technology. Choose a mechanism from the required state and behavior, not appearance alone.

- details  
  | Technique | React state | DOM | Effects | Interaction and accessibility |
  |---|---|---|---|---|
  | Conditional unmount | Reset when mounted again | Removed | Cleaned up | Removed |
  | `display: none` or `hidden` | Preserved | Retained | Continue running | Normally not rendered or exposed |
  | `visibility: hidden` | Preserved | Retains layout space | Continue running | Not interactive; accessibility behavior should still be verified |
  | `inert` | Preserved | Retained | Continue running | Removed from normal interaction and focus; may remain visually present |
  | `<Activity mode="hidden">` | Preserved | React hides the subtree | Effects are cleaned up while hidden | Intended for retained, inactive UI |

  Use unmounting when returning should start a fresh workflow or retaining the subtree wastes resources:

  ```jsx
  {isOpen && <CheckoutForm />}
  ```

  Use CSS hiding when the content should remain fully active and immediate reappearance matters, such as a short purely visual transition. Ensure hidden controls cannot remain in the tab order or be announced unexpectedly.

  Use `inert` for content that may remain visible but must not be interactive, commonly the background behind a modal. It does not stop Effects, network work, timers, or store subscriptions.

  Use `<Activity>` when preserving state is valuable but hidden Effects should be torn down. On visibility restoration, React recreates those Effects. This can support inactive routes or prepared content, but retained DOM and state still consume resources.

  Also consider focus. Before hiding or unmounting the currently focused element, move focus to a logical visible target. Animation libraries must keep exiting content long enough to animate without leaving it keyboard-accessible after the interaction has logically closed.

---

### Card 102

- question  
  How should asynchronous status updates be announced to assistive technologies?

- answer  
  When important content changes without moving focus, update visible text inside an appropriate live region so assistive technologies can announce it. Use polite status messaging for routine progress and reserve assertive alerts for urgent information that requires immediate attention.

- explanation  
  Sighted users may notice a spinner, toast, or changed color elsewhere on the page, while a screen-reader user’s virtual cursor remains unchanged. A live region creates a non-focus-based announcement channel, but excessive announcements become distracting and can interrupt more useful speech.

- details  
  Keep the live-region container mounted before the asynchronous update and change its text:

  ```jsx
  <p role="status" aria-live="polite">
    {statusMessage}
  </p>
  ```

  `role="status"` provides a polite live region suitable for messages such as “Profile saved” or “12 results loaded.” Many screen readers do not announce initial content inserted together with a newly mounted live-region node, so mounting an empty persistent region and updating it later is more reliable.

  Use `role="alert"` for urgent errors or conditions that need immediate attention. It is effectively assertive and can interrupt current speech, so it should not announce routine loading, every validation keystroke, or background refresh.

  Write useful messages:

  - “Saving profile” when a noticeable operation starts
  - “Profile saved” when it completes
  - “Could not save profile. Check your connection and try again” on failure

  Avoid messages such as “Done,” repeated percentage changes, or duplicated text that focus already communicates. Debounce rapidly changing search-result counts so announcements do not queue faster than they can be spoken.

  `aria-live` controls urgency, while `aria-atomic` determines whether the whole region or only the changed part is presented. Prefer one concise text update when possible rather than assembling a sentence from several independently changing nodes.

  Moving focus is better than a live region when the user must interact with the new context—for example, focusing an error summary after a failed long-form submission. Use live regions when focus should remain where the user is working. Test with representative screen readers because announcement timing varies across browser and assistive-technology combinations.

---

### Card 103

- question  
  How do you make custom interactive components keyboard accessible?

- answer  
  Start with the closest native HTML element. If the design genuinely requires a custom widget, implement the complete established interaction pattern: semantic roles and relationships, keyboard commands, focus management, state exposure, disabled behavior, and visible focus—not only click handling.

- explanation  
  ARIA changes what assistive technology is told; it does not add browser behavior. A `<div role="button">` does not automatically become focusable, activate with Enter and Space, submit forms correctly, or receive native disabled semantics.

- details  
  Prefer:

  ```jsx
  <button type="button" onClick={save} disabled={pending}>
    Save
  </button>
  ```

  over recreating button behavior on a generic element. Native controls provide semantics, focusability, keyboard activation, high-contrast behavior, form integration, and platform accessibility APIs.

  For a composite widget, select and follow one established pattern. Tabs typically use:

  - One Tab stop within the tab list
  - Left and Right Arrow to move between tabs
  - Home and End for first and last tab
  - `role="tablist"`, `role="tab"`, and `role="tabpanel"`
  - `aria-selected` and ID relationships between each tab and panel
  - Either automatic or manual activation, documented consistently

  Other widgets have different contracts. A menu is for application commands, not ordinary site navigation; a listbox is not a collection of arbitrary interactive cards. Choosing the wrong role creates expectations the implementation cannot meet.

  Composite focus is commonly implemented with:

  - **Roving `tabIndex`:** one item has `tabIndex={0}` and receives DOM focus; other items use `-1`.
  - **`aria-activedescendant`:** focus stays on a container while an ID identifies the active option.

  The choice affects scrolling, browser focus styling, virtualization, and assistive-technology support. Keep visible focus distinct from selection; moving focus does not always mean committing a value.

  Handle disabled items, dynamic insertion and removal, typeahead, orientation, RTL arrow behavior, focus restoration, and Escape according to the chosen pattern. Avoid positive `tabIndex`, global key handlers, and preventing default browser behavior for keys the widget does not own.

  Validate with semantic queries and automated accessibility checks, then test real Tab order, keyboard commands, zoom, high contrast, and representative screen readers in browsers. Automation can confirm attributes and focus movement but cannot prove that the experience is understandable.

---

## Architecture, testing, and accessibility

### Card 27

- question  
  How would you design reusable React component APIs?

- answer  
  Design the smallest API that expresses a stable responsibility. Prefer semantic defaults, composition for structure, constrained variants for supported appearance, predictable controlled and uncontrolled state, and a few deliberate extension points. Make common behavior easy and invalid or inaccessible combinations difficult to represent.

- explanation  
  A reusable API is a long-lived contract, not merely extracted JSX. It must hide implementation details while preserving enough control for real use cases, and every public prop creates compatibility, documentation, accessibility, and testing obligations.

- details  
  Start by defining ownership and invariants:

  - What behavior does the component guarantee?
  - Which state does it own, and which state may the consumer control?
  - Which native semantics and keyboard behavior must always be preserved?
  - Which variations are supported product decisions rather than arbitrary styling?
  - What must remain private so the implementation can evolve?

  Use an explicit controlled contract when the application needs coordination:

  ```jsx
  <Dialog
    open={isOpen}
    onOpenChange={setIsOpen}
  >
    <Dialog.Content>{children}</Dialog.Content>
  </Dialog>
  ```

  Offer `defaultOpen` only when an uncontrolled mode is genuinely useful. Do not switch between controlled and uncontrolled ownership during the component’s lifetime, and keep event naming consistent across the design system.

  Prefer composition over configuration for structure. Compound components or slots let consumers arrange meaningful parts without exposing internal DOM nodes. Use a render prop only when the component must control render timing or provide rendering-specific state; use a custom Hook when consumers only need reusable React behavior.

  Avoid Boolean-prop accumulation:

  ```jsx
  <Dialog
    compact
    warning
    centered
    noPadding
    rounded
  />
  ```

  These switches permit contradictory combinations and expose styling mechanics. A constrained model is clearer:

  ```jsx
  <Dialog
    variant="warning"
    size="compact"
  />
  ```

  Strong APIs also:

  - Forward appropriate native attributes and refs.
  - Use durable data identity rather than array position.
  - Expose behavioral callbacks, not private state setters or lifecycle steps.
  - Keep Context focused and validate compound-child provider usage.
  - Offer a narrow imperative handle only for commands such as `focus()`.
  - Preserve accessible naming, focus behavior, reduced motion, and disabled semantics.
  - Define server/client compatibility when the library supports Server Components.

  TypeScript can constrain variants and mutually exclusive modes, but runtime semantics must still be correct. Test the public contract through consumer behavior, keyboard interaction, controlled updates, ref forwarding, and representative composition.

  Add an extension point only after a repeated requirement shows where the stable boundary belongs. If consumers need to understand internal markup or override most defaults, the abstraction is probably at the wrong level.

---


### Card 24

- question  
  How should senior engineers test React applications?

- answer  
  Use a risk-based test portfolio. Test pure domain logic directly, React behavior through realistic component integration, external contracts at their boundaries, and a smaller set of critical journeys in a real browser. Prefer observable user and system outcomes over component internals.

- explanation  
  No single test level provides enough confidence. Small tests localize failures and cover edge cases cheaply; integration tests catch wiring errors; browser tests cover routing, focus, layout-dependent behavior, and deployed boundaries. Senior engineers choose the cheapest level capable of detecting each important risk.

- details  
  Match tests to risk:

  - **Unit tests:** parsers, validators, reducers, sorting, state-machine transitions, and other pure domain rules.
  - **Component tests:** rendering from meaningful inputs, user interaction, forms, providers, loading and error states, and accessible semantics.
  - **Integration or contract tests:** network adapters, cache behavior, routing, serialization, authentication boundaries, and third-party interfaces.
  - **End-to-end tests:** a small set of revenue-, security-, or workflow-critical journeys in a real browser.
  - **Visual tests:** layout, responsive behavior, themes, and component-state appearance.
  - **Accessibility testing:** semantic automation plus real keyboard and representative assistive-technology checks.

  Test through the interface users perceive:

  ```jsx
  render(<ProfileForm />);

  await user.type(
    screen.getByLabelText("Display name"),
    "Ada"
  );
  await user.click(
    screen.getByRole("button", { name: "Save profile" })
  );

  expect(
    await screen.findByRole("status")
  ).toHaveTextContent("Profile saved");
  ```

  Include the failure paths that change product behavior: validation, empty data, permissions, stale responses, retry, optimistic rollback, offline or timeout handling, and interrupted navigation. Do not chase 100% line coverage while important state transitions remain untested; coverage reveals unexecuted code, not whether assertions are meaningful.

  Mock at external boundaries and keep application collaboration real. Network interception is usually stronger than mocking a custom data Hook because it retains parsing, cache, loading, and rendering integration. Maintain some real contract or end-to-end coverage so mocks cannot drift unnoticed.

  Keep tests deterministic without making them unrealistic: control time, random IDs, and request completion explicitly; avoid fixed sleeps; isolate mutable data; and await user interactions and visible outcomes. Treat flaky tests as engineering defects rather than adding retries indefinitely.

  Finally, optimize the suite as a system. Run fast focused checks during development, parallelize reliable tests, collect failure artifacts for browser tests, and assign ownership for unstable or obsolete coverage. A useful test should fail for a comprehensible product reason and help the team diagnose it quickly.

---

### Card 25

- question  
  How do you build accessible React components?

- answer  
  Build accessibility into the component contract: start with semantic HTML, preserve native keyboard behavior, provide programmatic names and relationships, manage focus when context changes, support visual accessibility preferences, and use ARIA only to express semantics native HTML cannot provide.

- explanation  
  Accessibility is behavior across markup, state, focus, input methods, and assistive technology—not a collection of attributes added after visual implementation. Native elements provide a tested platform baseline that custom widgets must otherwise recreate.

- details  
  Start with native semantics:

  ```jsx
  <button type="button" onClick={save}>
    Save
  </button>
  ```

  Avoid recreating a button with a generic element:

  ```jsx
  <div onClick={save}>Save</div>
  ```

  The `<div>` lacks native focus, Enter and Space activation, disabled behavior, high-contrast adaptation, and button semantics. Adding `role="button"` fixes only part of that contract.

  Design each component across these layers:

  1. **Structure:** semantic headings, landmarks, lists, tables, buttons, links, labels, and fieldsets.
  2. **Name and relationships:** accessible names, descriptions, error associations, expanded state, selection, and ownership.
  3. **Keyboard and focus:** logical Tab order, widget-specific keys, visible focus, initial focus, and restoration after overlays or deletion.
  4. **Dynamic behavior:** loading and result announcements, validation recovery, retained context, and no unexpected focus movement.
  5. **Visual access:** contrast, zoom and reflow, target size, non-color indicators, forced-colors support, and reduced motion.

  Dynamic form errors should be connected to their inputs:

  ```jsx
  <label htmlFor="name">Name</label>
  <input
    id="name"
    aria-invalid={Boolean(error)}
    aria-describedby={error ? "name-error" : undefined}
  />

  {error && (
    <p id="name-error">
      {error}
    </p>
  )}
  ```

  For custom composite widgets such as tabs or listboxes, follow the established ARIA Authoring Practices interaction pattern. Decide whether focus or selection moves, implement roving `tabIndex` or `aria-activedescendant` correctly, and avoid inventing keyboard commands.

  Make accessible behavior part of reusable primitives so product teams receive correct defaults. A dialog primitive should own naming, focus containment, background inertness, Escape behavior, and focus restoration; consumers should not rebuild those rules for every modal.

  Test in layers:

  - Semantic component queries and focused interaction tests
  - Automated accessibility checks
  - Keyboard-only browser testing
  - Zoom, responsive reflow, forced colors, and reduced motion
  - Representative screen-reader combinations for critical workflows

  Automated tools catch only a subset of problems and cannot determine whether focus order, instructions, announcements, or interaction design make sense. Include disabled users and accessibility specialists in design and usability feedback where possible, document component guarantees, and treat regressions as product defects rather than optional polish.

---

## JSX and update mechanics

### Card 104

- question  
  What does JSX produce, and how is it different from HTML?

- answer  
  JSX is syntax that a build tool transforms into calls that create React elements. It describes UI as JavaScript values; it is not an HTML string and it is not inserted into the DOM directly.

- explanation  
  JSX can embed JavaScript expressions, pass non-string props, and represent custom components. React later uses the resulting element descriptions during rendering and reconciliation.

- details  
  Conceptually, a JSX expression such as:

  ```jsx
  <Button tone="primary">Save</Button>
  ```

  produces an element description containing the component type, props, and children. Modern JSX transforms usually call functions from the JSX runtime rather than `React.createElement` directly.

  Important differences from HTML include:

  - Component names beginning with a capital letter refer to JavaScript values.
  - Props can contain functions, objects, arrays, and other JavaScript values.
  - Most DOM property names follow JavaScript conventions such as `className`.
  - Expressions use braces; statements cannot appear directly inside JSX.
  - React escapes ordinary text values before placing them in the DOM.

  JSX syntax does not determine whether a component runs on the client or server. The renderer and framework establish that execution environment.

---

### Card 105

- question  
  How does React render `null`, booleans, arrays, strings, and numbers?

- answer  
  React renders strings and numbers as text, flattens arrays and fragments into children, and renders `null`, `undefined`, and booleans as nothing.

- explanation  
  This explains why `condition && <Panel />` normally works but `count && <Panel />` can display `0` when `count` is zero.

- details  
  Avoid relying on the truthiness of a number when the falsy value is renderable:

  ```jsx
  // May render 0
  {items.length && <Results items={items} />}

  // Expresses the condition explicitly
  {items.length > 0 && <Results items={items} />}
  ```

  Arrays may contain elements and other renderable values, but siblings produced from a collection need stable keys. Plain objects are not valid React children because React does not know how they should be represented visually.

  Ordinary string interpolation is escaped. Rendering trusted markup through `dangerouslySetInnerHTML` deliberately bypasses that protection and requires a separate sanitization strategy.

---

### Card 106

- question  
  How does React process queued state updates?

- answer  
  React queues state updates and processes them for a future render. A value update replaces the queued state for that step, while an updater function receives the result of the preceding queued update.

- explanation  
  Updater functions are required when the next value depends on state already queued in the same batch.

- details  
  These calls all capture the same `count` snapshot:

  ```jsx
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  ```

  These updaters are evaluated in sequence:

  ```jsx
  setCount(value => value + 1);
  setCount(value => value + 1);
  setCount(value => value + 1);
  ```

  React may call updater functions more than once in development to verify purity, so an updater must not mutate data or perform side effects.

  The queue model also explains mixed updates. A replacement can override the preceding queued result, while a later updater operates on the replacement. Prefer one clear update when possible; complicated queues are difficult to review even when their behavior is defined.

---

### Card 107

- question  
  Why can declaring a component inside another component reset state?

- answer  
  Every render creates a new inner component function. React sees that new function as a different component type, so it replaces the subtree and resets its state.

- explanation  
  Component identity depends on the type placed at a tree position. A newly created function is not identical to the function from the previous render.

- details  
  Avoid this pattern:

  ```jsx
  function ProfilePage() {
    function Editor() {
      const [name, setName] = useState("");
      return <input value={name} onChange={event => setName(event.target.value)} />;
    }

    return <Editor />;
  }
  ```

  Move `Editor` to module scope. Pass values through props when it needs information from `ProfilePage`.

  Defining a small render helper that is called as an ordinary function is different, but that helper does not create an independent component boundary. Prefer explicit components when independent state, Hooks, memoization, or error boundaries are needed.

---

### Card 108

- question  
  What does `flushSync` do, and when is it appropriate?

- answer  
  `flushSync` forces React to synchronously flush updates inside its callback so the DOM is updated before the next statement runs.

- explanation  
  It is an integration escape hatch for code that must coordinate immediately with browser or third-party APIs. It should not be used as a general way to make state feel synchronous.

- details  
  A browser API may require updated DOM before a callback returns:

  ```jsx
  flushSync(() => {
    setExpanded(true);
  });

  panelRef.current.scrollIntoView();
  ```

  Forcing synchronous work can hurt responsiveness, reveal Suspense fallbacks, and flush updates outside the immediate callback. First consider whether the imperative work belongs in a layout Effect, whether the browser API supports a later callback, or whether the state design can avoid the dependency.

---

### Card 109

- question  
  What happens if a component updates state during rendering?

- answer  
  Updating the component currently rendering schedules another render immediately. React permits limited guarded render-time adjustment, but unconditional updates cause an infinite rendering loop.

- explanation  
  Rendering should normally calculate UI without causing updates. Most synchronization belongs in an event handler or Effect, and most derived values should be calculated directly.

- details  
  This is invalid because every render schedules another one:

  ```jsx
  function Counter() {
    const [count, setCount] = useState(0);
    setCount(count + 1);
    return count;
  }
  ```

  Updating a different component during render is also unsafe because it couples partially evaluated trees.

  A guarded adjustment of the same component can occasionally replace an Effect-based reset, but it should be rare and must converge. Changing a key or deriving the value is usually clearer.

---

## Modern React and concurrency

### Card 110

- question  
  What problem does `useEffectEvent` solve, and when should it not be used?

- answer  
  `useEffectEvent` extracts event-like logic from an Effect so that logic can read the latest committed props and state without making the surrounding Effect re-synchronize.

- explanation  
  Use it when an external system fires an event whose handler needs current values, but changes to those values should not reconnect or recreate that external system.

- details  
  ```jsx
  const onConnected = useEffectEvent(() => {
    showNotification("Connected", theme);
  });

  useEffect(() => {
    const connection = connect(roomId);
    connection.on("connected", onConnected);
    return () => connection.disconnect();
  }, [roomId]);
  ```

  A theme change affects the notification but should not reconnect the room.

  Effect Events:

  - Are called only from Effects or other Effect Events
  - Always observe the latest committed values
  - Are not included in dependency arrays
  - Must remain local to the component or custom Hook that owns the Effect

  Do not use `useEffectEvent` merely to silence the dependency linter. If a value determines what the Effect synchronizes with, that value remains a dependency.

---

### Card 111

- question  
  How does `<Activity>` differ from conditional rendering, CSS hiding, and unmounting?

- answer  
  `<Activity>` can hide a subtree while preserving its state. In hidden mode, React hides the content, cleans up its Effects, and deprioritizes its updates.

- explanation  
  Conditional rendering removes the subtree and normally loses its state. CSS hiding keeps the subtree and its Effects active. Activity provides a lifecycle-aware middle ground.

- details  
  ```jsx
  <Activity mode={active ? "visible" : "hidden"}>
    <SearchPage />
  </Activity>
  ```

  Useful cases include:

  - Preserving state when navigating away and back
  - Preparing likely next content in the background
  - Hiding an expensive interface without leaving subscriptions active

  Activity is not automatically the right choice for every conditional. Unmount content when its state should reset or when retaining it wastes resources. Use CSS when content must remain fully active while merely invisible.

---

### Card 112

- question  
  How do callback refs and ref cleanup work?

- answer  
  A callback ref runs when React attaches a node and can return a cleanup function that runs when the ref is detached or the callback changes.

- explanation  
  Callback refs are useful when attaching imperative behavior to a changing set of nodes or when setup and cleanup should follow the exact node lifecycle.

- details  
  ```jsx
  <div
    ref={node => {
      const observer = new ResizeObserver(handleResize);
      observer.observe(node);

      return () => observer.disconnect();
    }}
  />
  ```

  Keep the callback identity stable when repeated detach-and-attach work is costly. Object refs remain simpler when the code only needs to read a single DOM node.

  In modern React, function components can receive `ref` as a prop in supported patterns. Expose the DOM node only when consumers need it; `useImperativeHandle` can expose a smaller API such as `focus()` or `reset()`.

---

### Card 113

- question  
  When is `useInsertionEffect` appropriate?

- answer  
  `useInsertionEffect` is primarily for CSS-in-JS libraries that must insert styles before layout Effects read layout. Application components should almost never need it.

- explanation  
  Inserting styles in a passive Effect is too late for layout measurement, while inserting them during rendering violates render purity.

- details  
  `useInsertionEffect` runs around the commit process before layout Effects, but it has important restrictions and is not a faster substitute for `useLayoutEffect`.

  Prefer static CSS, extracted styles, or the styling system's documented integration. Use a layout Effect to measure or synchronously adjust committed DOM. Use a passive Effect for ordinary external synchronization that does not need to block paint.

---

### Card 114

- question  
  What does concurrent rendering mean in React?

- answer  
  Concurrent rendering means React can prepare some updates interruptibly: it may pause, resume, restart, or abandon render work before committing a complete result.

- explanation  
  It does not mean component functions execute simultaneously on multiple threads. It means rendering work can be scheduled with different priorities while committed UI remains consistent.

- details  
  Consequences include:

  - Render logic must be pure and idempotent.
  - A render is not evidence that a commit occurred.
  - Side effects belong in event handlers or commit-phase Effects.
  - Transitions allow urgent updates to interrupt non-urgent rendering.
  - External mutable stores need a concurrency-safe subscription interface.

  React still commits a coherent tree. Users should not observe a half-committed result merely because rendering was interrupted.

---

### Card 115

- question  
  What is tearing, and how does `useSyncExternalStore` help prevent it?

- answer  
  Tearing occurs when different components render inconsistent snapshots of the same external mutable state during one logical update.

- explanation  
  `useSyncExternalStore` gives React a subscription and repeatable snapshot reader so React can detect changes and keep the committed UI consistent.

- details  
  The snapshot must be referentially stable until the store actually changes:

  ```jsx
  const value = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
  ```

  Returning a freshly allocated object on every `getSnapshot` call makes React believe the store continuously changed. Mutable objects that change without producing a new snapshot are equally problematic.

  Libraries usually wrap this API with selectors and equality comparison. Components should use the library integration instead of reading mutable store fields directly during render.

---

### Card 116

- question  
  How do React Performance Tracks help diagnose slow interactions?

- answer  
  React Performance Tracks add React scheduling and component information to browser performance profiles, connecting user-visible main-thread work to the updates and components that produced it.

- explanation  
  The Scheduler track shows update priority and scheduling behavior, while the Components track shows rendering and Effect work.

- details  
  A useful investigation asks:

  1. Which interaction feels slow?
  2. Is time spent in network activity, JavaScript, layout, paint, or React work?
  3. Which update scheduled the React work?
  4. Was it blocking or transition work?
  5. Which components rendered or ran Effects?
  6. Did React yield, restart, or wait for paint?

  Performance Tracks complement the React Profiler; they do not replace measurement of the complete browser timeline. Profile a production build under representative device and network conditions.

---

### Card 117

- question  
  How should a team adopt React Compiler, and what does it not guarantee?

- answer  
  Adopt React Compiler incrementally, verify that the code follows the Rules of React, monitor compiler diagnostics, and confirm behavior and performance with tests and profiling.

- explanation  
  The Compiler can automatically memoize eligible code, but it does not repair impure components, remove the need for sound state design, or guarantee that every interaction becomes fast.

- details  
  A practical rollout includes:

  - Enable the current Hooks and Compiler lint rules.
  - Fix render-time mutation and other Rules-of-React violations.
  - Compile a limited surface first.
  - Run behavior tests and compare performance profiles.
  - Inspect compilation failures instead of suppressing them broadly.
  - Expand coverage gradually.

  Existing `memo`, `useMemo`, and `useCallback` calls do not need to be removed immediately. Manual memoization can still express an intentional identity contract or control a dependency. Remove it only when measurement and testing show that doing so is safe and clearer.

---

### Card 118

- question  
  What do `cache` and `cacheSignal` do in a Server Component environment?

- answer  
  `cache` memoizes work for React's server rendering context so repeated calls with the same arguments can share a result. `cacheSignal` provides an abort signal tied to that cache lifetime.

- explanation  
  Together they can deduplicate server work and cancel operations whose cached result will no longer be used.

- details  
  ```jsx
  const getUser = cache(async id => {
    return database.users.find(id, {
      signal: cacheSignal()
    });
  });
  ```

  Distinguish this mechanism from:

  - Browser HTTP caching
  - Framework data caches
  - A durable distributed cache
  - Client-side server-state caching

  Cache scope and invalidation depend on the rendering environment and framework integration. Never assume memoization is an authorization boundary; every protected operation must still verify the current user and requested resource.

---

## Emerging rendering APIs

### Card 119

- question  
  What is partial pre-rendering, and how does it differ from ordinary streaming SSR?

- answer  
  Partial pre-rendering creates a reusable static shell ahead of time and later resumes server rendering to fill dynamic regions. Streaming SSR starts rendering for a request and progressively sends completed content, but does not necessarily reuse a precomputed shell.

- explanation  
  The goal is to combine fast delivery of stable content with request-time rendering for personalized or fresh content. Suspense boundaries identify where prerendering can pause and where resumed work can continue.

- details  
  React's server APIs separate the work into two stages:

  1. Prerender as much of the tree as possible and save the result plus resumable state.
  2. Resume later with request-specific data and stream the remaining content.

  Partial pre-rendering is infrastructure for framework authors and is normally consumed through a framework rather than assembled directly in application code. It does not make all content static, remove hydration, or replace sensible cache and data-loading decisions.

  In an interview, explain the trade-off: a static shell can improve time to first content and cacheability, while dynamic regions still pay request-time data and rendering costs.

---

### Card 120

- question  
  What problem does React's `<ViewTransition>` solve, and is it ready for general production use?

- answer  
  `<ViewTransition>` coordinates animated transitions for DOM changes caused by React updates. It is currently available in React's Canary channel, so teams should not treat it as a stable API for general production adoption yet.

- explanation  
  React can activate a browser View Transition when an update reveals, hides, reorders, or changes content inside a transition boundary. This lets the animation follow React's commit rather than relying on manual DOM snapshots.

- details  
  ```jsx
  <ViewTransition>
    <Page route={route} />
  </ViewTransition>
  ```

  Transition-aware updates commonly originate from a Transition, Suspense reveal, or navigation integration. Stable `name` values can connect matching elements across the old and new UI, but duplicate names can prevent a transition.

  Prefer progressive enhancement: the interface must remain correct without animation, honor reduced-motion preferences, and avoid transitions that obscure focus or interaction state. Because the component and its related APIs are Canary, verify the current React and framework documentation before adopting them.
