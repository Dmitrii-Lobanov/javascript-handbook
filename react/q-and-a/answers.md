
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
  Investigate:

  - Which interaction is slow
  - Which components render
  - Why they render
  - How long render and commit take
  - Whether Context updates are too broad
  - Whether lists require virtualization
  - Whether state is located too high
  - Whether Effects cause update chains

  Common improvements include:

  - Colocating state
  - Splitting contexts
  - Removing unnecessary Effects
  - Memoizing measured expensive work
  - Stabilizing important identities
  - Virtualizing long lists
  - Deferring non-urgent work
  - Reducing component work
  - Code splitting

  Test performance with production builds because development checks and Strict Mode intentionally add work.

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
  Elements are plain values, not DOM nodes. Function components are invoked by React, not instantiated with `new`. Informally, “instance” means the state and lifecycle associated with one mounted position.

---

### Card 30

- question  
  What are the Rules of Hooks, and why must Hooks be called unconditionally?

- answer  
  Hooks must be called at the top level of React components or custom Hooks, never inside conditions, loops, nested functions, or ordinary JavaScript functions.

- explanation  
  React associates Hook state with call order. Conditional calls can shift that order between renders and connect state to the wrong Hook.

- details  
  Use conditions inside a Hook rather than around it, or extract a conditional subtree into another component. The Hooks linter detects most violations.

---

### Card 31

- question  
  What is the difference between props and state?

- answer  
  Props are inputs supplied by a parent. State is component-specific memory managed by React. Both are immutable snapshots during a render.

- explanation  
  A component must not mutate props or state directly; it requests state changes with setters or dispatches actions.

- details  
  Props support configuration and composition. State represents information that changes over time and affects rendering. Shared state should live in the nearest common owner.

---

### Card 32

- question  
  What is composition, and why is it generally preferred over inheritance in React?

- answer  
  Composition builds interfaces by nesting and combining components through props and `children`.

- explanation  
  It makes dependencies explicit and allows behavior and presentation to be combined without rigid class hierarchies.

- details  
  Common composition techniques include slots, compound components, render props, and custom Hooks. Inheritance is still a JavaScript feature, but it is rarely needed for React component reuse.

---

### Card 33

- question  
  What are Fragments, and when are they useful?

- answer  
  Fragments group multiple children without adding an extra DOM element.

- explanation  
  They preserve valid structure and avoid unnecessary wrapper elements.

- details  
  Use `<>...</>` for ordinary grouping. Use `<Fragment key={id}>...</Fragment>` when a keyed group is rendered in a list.

---

### Card 34

- question  
  How does React handle events, and how do React events differ from native DOM events?

- answer  
  React accepts event handlers as props and provides normalized event objects while integrating event dispatch with React's update system.

- explanation  
  Handlers receive an event with familiar APIs such as `target`, `currentTarget`, `preventDefault`, and `stopPropagation`.

- details  
  React events mostly follow DOM propagation, but some behavior is normalized. Use native listeners when integrating directly with browser APIs and clean them up in an Effect.

---

### Card 35

- question  
  What are portals, and how do events propagate through them?

- answer  
  A portal renders children into a different DOM container while keeping them in the same React tree.

- explanation  
  Context and React event propagation follow the React tree, not the portal's physical DOM position.

- details  
  Portals are useful for dialogs, popovers, and tooltips. They do not automatically solve focus management, stacking, keyboard behavior, or accessibility.

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
  Lift state only when multiple branches genuinely need coordinated access. Server, URL, form, and transient UI state may have different appropriate owners.

---

### Card 37

- question  
  When should state be lifted, and when should it remain local?

- answer  
  Lift state to the nearest common owner when components must share a single source of truth. Keep it local when no outside component needs to coordinate it.

- explanation  
  Excessively high state broadens render impact and makes components harder to reuse.

- details  
  Sometimes composition or moving related components together avoids lifting. Do not globalize state solely to avoid passing one or two props.

---

### Card 38

- question  
  How can you avoid prop drilling?

- answer  
  Use component composition, colocate state, pass complete child elements, introduce focused Context, or use an external store when subscription needs justify it.

- explanation  
  Prop drilling is not automatically harmful; explicit props are often easier to trace than hidden dependencies.

- details  
  Choose Context for broadly relevant, relatively stable dependencies. Split contexts when unrelated values change at different rates.

---

### Card 39

- question  
  What is the difference between derived state and synchronized state?

- answer  
  Derived data is calculated from existing props or state during rendering. Synchronized state is a separate stored value kept aligned with another source.

- explanation  
  Prefer derivation because duplicated state can become inconsistent.

- details  
  Memoize an expensive derivation only after measuring. Store a separate value only when it has an independent lifecycle, such as an editable draft initialized from server data.

---

### Card 40

- question  
  How should complex form state and validation be managed?

- answer  
  Separate field values, validation, submission, and server errors; use native form semantics; and choose controlled, uncontrolled, or library-managed state according to requirements.

- explanation  
  Validate at appropriate times without making typing unresponsive, and always validate again on the server.

- details  
  Complex forms benefit from schemas, field-level subscriptions, accessible error associations, pending states, and a clear reset strategy.

---

### Card 41

- question  
  How can component state be intentionally preserved or reset?

- answer  
  React preserves state when a component retains the same type, position, and key. Change its key or render a different type to reset it.

- explanation  
  State belongs to a tree position rather than to JSX text or a variable name.

- details  
  Stable keys preserve list-item state during reordering. A key based on an entity ID can intentionally reset an editor when the selected entity changes.

---

### Card 42

- question  
  When should state be represented with a state machine?

- answer  
  A state machine is useful when behavior has explicit modes, constrained transitions, concurrency, or impossible combinations that Boolean flags cannot model safely.

- explanation  
  It makes allowed states and events explicit and testable.

- details  
  Examples include payment flows, multi-step forms, uploads, and authentication. Simple independent state does not need a machine.

---

## Hooks and Effects

### Card 43

- question  
  How do dependency arrays work in `useEffect`, `useMemo`, and `useCallback`?

- answer  
  React compares each dependency with its previous value using `Object.is` and reruns or recalculates when a dependency changes.

- explanation  
  Dependencies are determined by reactive values read by the callback, not by which values a developer prefers to track.

- details  
  Objects and functions created during rendering have new identities. Restructure code before suppressing the exhaustive-dependencies lint rule.

---

### Card 44

- question  
  How would you debug an infinite `useEffect` loop?

- answer  
  Identify the state updated by the Effect and the dependency that changes because of that update.

- explanation  
  An infinite loop requires the Effect to update state and that update to change one of its dependencies.

- details  
  Remove an unnecessary Effect, derive data during render, use a functional update, or stabilize only the genuinely required dependency. Do not blindly remove dependencies.

---

### Card 45

- question  
  How can asynchronous race conditions occur inside an Effect?

- answer  
  An older request may finish after a newer request and overwrite newer state.

- explanation  
  Completion order does not necessarily match request order.

- details  
  Abort obsolete work with `AbortController`, ignore stale results with a lifecycle flag or request ID, or use a data framework that manages request identity.

---

### Card 46

- question  
  When should logic remain in an event handler instead of moving into an Effect?

- answer  
  Keep logic in an event handler when it occurs because of a specific user action. Use an Effect when synchronization is caused by the component being displayed or reactive values changing.

- explanation  
  Event handlers preserve the cause of an operation and prevent delayed or repeated execution.

- details  
  Submitting a purchase belongs in the submit handler. Connecting to a room while `roomId` is active belongs in an Effect.

---

### Card 47

- question  
  How do you read the latest value inside a callback without unnecessarily restarting an Effect?

- answer  
  Use functional updates, restructure reactive logic, or keep non-rendering mutable data in a ref when appropriate.

- explanation  
  A ref can expose the latest value without becoming an Effect dependency, but it should not replace state used for rendering.

- details  
  Prefer designs that make dependencies honest. Use escape-hatch patterns only when the callback deliberately needs non-reactive access to a current value.

---

### Card 48

- question  
  What is `useId`, and why should it not be used for list keys?

- answer  
  `useId` generates stable IDs for accessibility relationships and server/client consistency.

- explanation  
  List keys must come from the data because they represent item identity; `useId` represents a component call position.

- details  
  Use it for relationships such as `aria-describedby` and corresponding element IDs. Do not use it as a database or globally persistent identifier.

---

### Card 49

- question  
  What does the `use` API do?

- answer  
  `use` reads a supported resource, such as a Promise or Context, during rendering and integrates with Suspense and Error Boundaries.

- explanation  
  A pending Promise suspends; a fulfilled Promise returns its value; a rejected Promise throws its error.

- details  
  Unlike ordinary Hooks, `use` has special conditional usage rules. Its practical use is commonly coordinated by a framework supporting Suspense and Server Components.

---

### Card 50

- question  
  When would you use `useImperativeHandle`?

- answer  
  Use it to expose a small imperative API through a ref instead of exposing an entire internal DOM node or implementation.

- explanation  
  It is appropriate for actions such as `focus`, `scrollTo`, or `reset` that are inherently imperative.

- details  
  Prefer declarative props for ordinary behavior. Keep the exposed handle minimal and stable, and avoid using refs as a general communication channel.

---

## Rendering and performance

### Card 51

- question  
  Why does a child component render when its parent renders?

- answer  
  By default, React recursively renders child components when their parent renders.

- explanation  
  React must calculate the next subtree before it can determine whether DOM changes are necessary.

- details  
  A render is not necessarily expensive and does not necessarily change the DOM. Use `memo` only when measured work justifies comparison overhead.

---

### Card 52

- question  
  What causes a memoized component to render again?

- answer  
  A memoized component renders when its props change, its own state changes, consumed Context changes, or an external subscription produces a new snapshot.

- explanation  
  `memo` only compares props; it does not block state or Context updates.

- details  
  New object, array, and function identities can make props unequal. React may also render for development checks or other internal reasons.

---

### Card 53

- question  
  Why can inline objects and functions affect memoization?

- answer  
  Object and function literals create new references on every render, so shallow prop comparison treats them as changed.

- explanation  
  This matters only when reference identity participates in memoization or a dependency array.

- details  
  Move constants outside components, use stable primitives, or memoize when beneficial. Do not eliminate inline values without evidence of a performance problem.

---

### Card 54

- question  
  How would you render a list containing thousands of items efficiently?

- answer  
  Render only the visible window, keep item keys stable, minimize row work, and paginate or incrementally load data when appropriate.

- explanation  
  Thousands of mounted DOM nodes increase layout, paint, memory, and React rendering costs.

- details  
  Use list virtualization, measured row sizing, overscan, and accessible focus behavior. Profile before and after because virtualization adds complexity.

---

### Card 55

- question  
  What is list virtualization?

- answer  
  Virtualization renders a small window representing the currently visible portion of a much larger collection.

- explanation  
  Spacer measurements preserve the apparent scroll range while off-screen rows remain unmounted.

- details  
  Challenges include dynamic heights, keyboard navigation, focus retention, screen-reader behavior, sticky elements, and scroll restoration.

---

### Card 56

- question  
  How do code splitting and route-based lazy loading differ?

- answer  
  Code splitting is the general technique of producing independently loadable bundles. Route-based lazy loading places split points around route boundaries.

- explanation  
  Routes are useful split points because users often need only one route during initial loading.

- details  
  Component and feature splits may further reduce initial JavaScript. Balance chunk size, request overhead, caching, loading UX, and failure handling.

---

### Card 57

- question  
  How does React prioritize urgent and non-urgent updates?

- answer  
  React treats direct interactions such as typing as urgent and lets developers mark interruptible background work as a Transition.

- explanation  
  Urgent work can interrupt and supersede non-urgent rendering, helping the interface remain responsive.

- details  
  Scheduling does not reduce the calculation itself. Use `startTransition`, `useTransition`, or `useDeferredValue` where stale intermediate UI is acceptable.

---

### Card 58

- question  
  What problems does React Compiler solve?

- answer  
  React Compiler analyzes components and Hooks at build time and can automatically memoize values and component work.

- explanation  
  It reduces manual `memo`, `useMemo`, and `useCallback` usage while preserving React semantics.

- details  
  Code must follow React's purity and Hook rules. The compiler does not fix poor state ownership, expensive algorithms, large DOM trees, or unnecessary network work.

---

### Card 59

- question  
  When can memoization make performance worse?

- answer  
  Memoization can cost more than recomputation when work is cheap, dependencies change frequently, comparisons are expensive, or cached values increase memory pressure.

- explanation  
  It also adds cognitive complexity and can introduce stale dependency bugs.

- details  
  Use profiler evidence. Prefer architectural improvements such as state colocation and narrower subscriptions before adding widespread memoization.

---

### Card 60

- question  
  How would you investigate a component that renders too frequently?

- answer  
  Reproduce the interaction, use the React Profiler, identify the update source, and inspect changed props, state, Context, and external-store snapshots.

- explanation  
  First determine whether the renders create a measurable user-facing cost.

- details  
  Look for lifted state, unstable provider values, Effect update chains, recreated props, broad subscriptions, and development-only Strict Mode behavior.

---

## Suspense and reliability

### Card 61

- question  
  What is the difference between Suspense and an Error Boundary?

- answer  
  Suspense handles supported pending resources; an Error Boundary handles rendering failures in descendant components.

- explanation  
  A pending resource displays a Suspense fallback, while a thrown error activates the nearest Error Boundary.

- details  
  They are complementary and are often nested. Neither automatically handles every event-handler or arbitrary Effect error.

---

### Card 62

- question  
  Where should Suspense boundaries be placed?

- answer  
  Place boundaries around meaningful regions that can reveal together and have a useful independent loading experience.

- explanation  
  One huge boundary hides too much; excessive tiny boundaries create visual noise.

- details  
  Align boundaries with design skeletons, navigation behavior, streaming opportunities, and content dependencies.

---

### Card 63

- question  
  How do nested Suspense boundaries coordinate progressive loading?

- answer  
  Each boundary can reveal its subtree when ready while an outer boundary coordinates broader fallback behavior.

- explanation  
  This lets essential content appear before slower secondary content.

- details  
  If a fallback itself suspends, React searches for the next parent boundary. Boundary placement determines reveal sequence and perceived stability.

---

### Card 64

- question  
  How can an Error Boundary be reset?

- answer  
  Reset its error state after an explicit retry or change its key to create a fresh boundary subtree.

- explanation  
  A retry should occur only after the condition that caused the error may have changed.

- details  
  Reset on route or entity changes, provide a retry control, and report the original error with component context.

---

### Card 65

- question  
  How should loading, empty, error, and stale states be represented?

- answer  
  Model them explicitly and allow valid combinations, such as stale data being displayed during a background refresh.

- explanation  
  One Boolean `isLoading` cannot represent initial loading, refreshing, failure with cached data, and empty success accurately.

- details  
  Design state around user experience, accessible announcements, retry behavior, retained content, and whether an error blocks the entire region.

---

### Card 66

- question  
  How would you prevent an outdated request from replacing newer data?

- answer  
  Cancel obsolete requests, associate results with request identity, or use a server-state library that rejects stale updates.

- explanation  
  Requests can complete in a different order from the order in which they started.

- details  
  `AbortController` reduces unnecessary work. A request counter or query key can also ensure that only the current result commits.

---

## Server rendering and architecture

### Card 67

- question  
  What causes hydration mismatches, and how would you debug them?

- answer  
  Mismatches occur when initial client output differs from server HTML, often because of time, randomness, browser-only data, invalid nesting, locale, or inconsistent data.

- explanation  
  Hydration expects equivalent initial markup so React can attach behavior safely.

- details  
  Compare server and first-client output, fix nondeterminism, serialize initial data consistently, and treat broad suppression as an escape hatch.

---

### Card 68

- question  
  What is streaming server rendering?

- answer  
  Streaming sends server-rendered HTML progressively as sections become ready instead of waiting for the entire page.

- explanation  
  Users can receive and view useful content earlier while slower Suspense regions continue rendering.

- details  
  Streaming requires coordinated fallbacks, error handling, caching, infrastructure support, and a framework or server integration.

---

### Card 69

- question  
  What is selective hydration?

- answer  
  Selective hydration lets React hydrate server-rendered regions according to readiness and interaction priority rather than strictly hydrating the whole page in one blocking pass.

- explanation  
  User interaction with one region can be prioritized while other regions wait.

- details  
  It is integrated with Suspense and streaming and is normally coordinated by a React framework.

---

### Card 70

- question  
  What determines whether a component should be a Server Component or a Client Component?

- answer  
  Use a Server Component for server data access and non-interactive rendering; use a Client Component for state, Effects, event handlers, refs, and browser APIs.

- explanation  
  Keep client boundaries narrow to reduce shipped JavaScript while preserving required interactivity.

- details  
  Server Components may render Client Components. The choice is a dependency-boundary decision, not simply a page-versus-widget distinction.

---

### Card 71

- question  
  What data can cross the Server Component and Client Component boundary?

- answer  
  Props crossing into Client Components must be serializable by the framework's React transport, with supported exceptions such as Server Function references.

- explanation  
  Arbitrary closures, browser objects, and ordinary server-only resources cannot be transferred to the browser.

- details  
  Pass minimal data, preserve authorization on the server, and avoid leaking secrets merely because a value is provided through props.

---

### Card 72

- question  
  What is the difference between a Server Component and SSR?

- answer  
  SSR generates HTML on the server for initial display. Server Components execute on the server and send a serialized component result without shipping their component code to the client.

- explanation  
  The technologies can be used together but solve different problems.

- details  
  Client Components may be server-rendered to HTML and later hydrated. Server Components can refetch and compose server/client trees without becoming client JavaScript.

---

### Card 73

- question  
  What are Server Functions, and what security considerations apply to them?

- answer  
  Server Functions are remotely callable server-side functions exposed through React framework integration.

- explanation  
  Treat every invocation as an untrusted network request, regardless of where the call originated.

- details  
  Authenticate, authorize, validate input, protect sensitive output, handle CSRF according to the framework, enforce rate limits, and avoid exposing secrets in errors.

---

### Card 74

- question  
  How would you avoid network request waterfalls?

- answer  
  Start independent requests in parallel, preload predictable data, fetch at route or server boundaries, and avoid nesting fetch initiation behind avoidable client renders.

- explanation  
  Sequential request latency accumulates even when the operations do not depend on one another.

- details  
  Use `Promise.all`, router loaders, server aggregation, Suspense-aware preloading, and caching. Preserve sequencing only for genuinely dependent requests.

---

### Card 75

- question  
  How would you design cache invalidation for server data?

- answer  
  Define cache keys, freshness windows, ownership, mutation effects, refetch triggers, and consistency requirements before choosing an invalidation strategy.

- explanation  
  A cache is correct only when consumers know whether data is fresh, stale, invalid, or being refreshed.

- details  
  Strategies include time-based staleness, event invalidation, tag invalidation, mutation-driven updates, optimistic changes, and background revalidation.

---

## Forms and React Actions

### Card 76

- question  
  How do React form Actions work?

- answer  
  Forms can receive an Action function that processes submitted `FormData` and coordinates pending behavior with React and supported frameworks.

- explanation  
  Actions make submissions part of React's transition-oriented data flow rather than requiring every form to implement manual request state.

- details  
  Preserve native semantics, validate on the server, handle errors explicitly, and understand the framework's progressive-enhancement behavior.

---

### Card 77

- question  
  What does `useActionState` solve?

- answer  
  `useActionState` associates an Action with state derived from its latest result and exposes whether that Action is pending.

- explanation  
  It is useful for validation messages, server results, and submission state that belongs to an Action.

- details  
  The Action receives previous state and submitted arguments. Keep returned state serializable when the framework sends it across a server boundary.

---

### Card 78

- question  
  What is the difference between `useOptimistic` and immediately updating ordinary state?

- answer  
  `useOptimistic` expresses temporary UI derived while an Action is pending and reconciles it with authoritative state afterward.

- explanation  
  Ordinary state updates require the application to manage temporary values, confirmation, failure, and rollback manually.

- details  
  Optimistic interfaces must visibly communicate pending state and remain correct under overlapping operations and server rejection.

---

### Card 79

- question  
  How should an optimistic update be rolled back after failure?

- answer  
  Reconcile the optimistic view with the last confirmed server state, show an actionable error, and allow retry when safe.

- explanation  
  The server remains authoritative; optimistic data is provisional.

- details  
  Track operation identity so one failed request does not undo later successful work. Consider compensating operations and idempotency for critical mutations.

---

### Card 80

- question  
  What does `useFormStatus` provide?

- answer  
  `useFormStatus` exposes status information about a parent form submission, including pending state and submitted data.

- explanation  
  Descendant controls can respond to submission state without manually threading props through the form.

- details  
  Call it from a component rendered inside the relevant form. Use pending state for both interaction control and accessible feedback.

---

### Card 81

- question  
  How do pending, validation, and submission errors affect accessible form design?

- answer  
  Keep controls labeled, connect errors programmatically, preserve user input, announce meaningful status, and manage focus when submission changes context.

- explanation  
  Visual styling alone does not communicate errors or pending state to assistive technologies.

- details  
  Use `aria-invalid`, `aria-describedby`, suitable live regions, clear error summaries, and avoid disabling controls without explaining progress.

---

## Component architecture

### Card 82

- question  
  What are compound components?

- answer  
  Compound components are related components that cooperate to form one flexible interface, often through shared Context.

- explanation  
  Consumers compose structure directly instead of configuring every variation through one large prop object.

- details  
  Examples include tabs, menus, and accordions. Enforce semantic relationships, keyboard behavior, and provider usage with clear errors.

---

### Card 83

- question  
  What is the render-prop pattern?

- answer  
  A render prop is a function prop that receives state or behavior and returns UI.

- explanation  
  It separates reusable behavior from rendering decisions.

- details  
  Custom Hooks replace many render-prop use cases, but render props remain useful when a component must explicitly control rendering scope or lifecycle.

---

### Card 84

- question  
  What are higher-order components, and when are they still useful?

- answer  
  A higher-order component is a function that accepts a component and returns an enhanced component.

- explanation  
  HOCs were widely used for reusable behavior before Hooks and remain common in libraries and legacy code.

- details  
  Preserve refs and static metadata when required, avoid prop collisions, give wrappers useful display names, and prefer Hooks for new function-component logic when clearer.

---

### Card 85

- question  
  How would you design a reusable modal or dialog component?

- answer  
  Use native dialog semantics where appropriate, a portal, controlled open state, focus management, keyboard dismissal, and focus restoration.

- explanation  
  A modal is an interaction and accessibility system, not merely an element with fixed positioning.

- details  
  Handle initial focus, Escape, outside interaction policy, background inertness, accessible naming, nested overlays, scrolling, and animation lifecycle.

---

### Card 86

- question  
  How would you design a reusable data table?

- answer  
  Separate data modeling, column definitions, rendering, sorting, filtering, selection, pagination, and virtualization while preserving native table semantics.

- explanation  
  Controlled state lets applications own server-driven behavior; sensible defaults keep simple cases easy.

- details  
  Address keyboard access, headers, captions, responsive behavior, loading and empty states, stable row identity, and large-data performance.

---

### Card 87

- question  
  How do you balance abstraction with duplication?

- answer  
  Abstract stable repeated concepts, not superficial similarity or speculative future requirements.

- explanation  
  A good abstraction reduces knowledge and change cost; a premature one adds indirection and configuration.

- details  
  Wait until requirements reveal the shared invariant, keep escape hatches explicit, and prefer small composition points over one universal component.

---

### Card 88

- question  
  How do you prevent a design-system component API from becoming overly complex?

- answer  
  Define clear primitives, constrained variants, composable slots, consistent conventions, and strong accessibility defaults.

- explanation  
  Avoid accumulating Boolean props for every one-off layout or behavior.

- details  
  Document ownership, support native attributes, use semantic tokens, version changes, test supported combinations, and allow composition for exceptional cases.

---

### Card 89

- question  
  What belongs in a component, custom Hook, utility, service, or store?

- answer  
  Components render UI, Hooks compose React behavior, utilities perform framework-independent computation, services integrate external systems, and stores own shared external state.

- explanation  
  Place logic according to its lifecycle and dependencies rather than file-size rules.

- details  
  Pure domain logic should usually remain outside React. A custom Hook is justified when logic uses Hooks or exposes a React-oriented lifecycle.

---

## Testing and quality

### Card 90

- question  
  What should be mocked in a React test?

- answer  
  Mock unstable or expensive external boundaries when necessary, while keeping meaningful component collaboration real.

- explanation  
  Excessive mocking verifies the test's assumptions instead of actual integrated behavior.

- details  
  Prefer network-boundary interception over mocking internal Hooks. Mock time, randomness, or platform APIs only when the test needs deterministic control.

---

### Card 91

- question  
  Why can testing implementation details make tests fragile?

- answer  
  Tests tied to internal state, method calls, or component structure fail during harmless refactoring even when user behavior remains correct.

- explanation  
  Behavior-oriented tests give stronger confidence with lower maintenance cost.

- details  
  Query by role and accessible name, perform realistic interactions, and assert visible output or external effects.

---

### Card 92

- question  
  How do you test custom Hooks?

- answer  
  Prefer testing a small component that uses the Hook, or use a Hook testing utility when direct state transitions need focused verification.

- explanation  
  Exercise the Hook through React so rendering, cleanup, and dependency behavior remain realistic.

- details  
  Test inputs, returned behavior, rerenders, asynchronous transitions, cleanup, and error cases without asserting private implementation details.

---

### Card 93

- question  
  How do you test components that use Context?

- answer  
  Render them with a small provider wrapper containing realistic values and interactions.

- explanation  
  The test should verify consumer behavior rather than mocking `useContext` itself.

- details  
  Create reusable render helpers for common providers, but let individual tests override state, permissions, locale, or theme.

---

### Card 94

- question  
  How do you test loading, errors, Suspense, and asynchronous updates?

- answer  
  Control the asynchronous boundary, assert the initial state, resolve or reject it deliberately, and await the final observable UI.

- explanation  
  Avoid fixed sleeps; wait for meaningful conditions.

- details  
  Include Suspense and Error Boundaries used in production, test retries, and ensure deferred work and pending indicators behave accessibly.

---

### Card 95

- question  
  What causes React test warnings about updates not being wrapped in `act`?

- answer  
  The warning means a React update completed outside the test's expected interaction boundary before assertions were synchronized with it.

- explanation  
  User-event and async query utilities often handle `act`; unresolved timers or Promises commonly reveal missing awaits.

- details  
  Await interactions and visible outcomes. Do not wrap arbitrary code merely to suppress the warning without understanding the pending update.

---

### Card 96

- question  
  When are snapshot tests useful, and when are they harmful?

- answer  
  Snapshots can help review small stable serialized outputs, but large component snapshots are noisy and easy to approve without understanding changes.

- explanation  
  Focused behavioral assertions communicate intent more clearly.

- details  
  Keep snapshots small, review diffs carefully, and do not treat snapshots as a substitute for interaction, accessibility, or visual-regression tests.

---

### Card 97

- question  
  How would you test keyboard and focus behavior?

- answer  
  Simulate realistic keyboard navigation and assert which element is focused, which controls activate, and whether focus is restored.

- explanation  
  Click-only tests miss essential behavior for keyboard and assistive-technology users.

- details  
  Test Tab order, Enter, Space, Escape, arrow-key patterns, modal focus trapping, initial focus, and return focus.

---

## Security and accessibility

### Card 98

- question  
  What are the risks of `dangerouslySetInnerHTML`?

- answer  
  It inserts a raw HTML string and can create cross-site scripting when the content is untrusted or incorrectly sanitized.

- explanation  
  React's normal text rendering escapes values; this API intentionally bypasses that protection.

- details  
  Prefer ordinary JSX and text content. If rich HTML is required, sanitize it with a maintained policy and add defense-in-depth controls such as CSP.

---

### Card 99

- question  
  How should untrusted HTML be rendered safely?

- answer  
  Avoid HTML parsing when plain text is sufficient. When rich HTML is required, sanitize it using a context-appropriate, well-maintained sanitizer before rendering.

- explanation  
  Input validation alone does not make arbitrary HTML safe.

- details  
  Restrict allowed elements, attributes, and URL schemes; keep sanitizer rules updated; and never rely solely on Content Security Policy.

---

### Card 100

- question  
  How should focus be managed when opening and closing a modal?

- answer  
  Move focus into the modal, keep keyboard interaction within it while open, and restore focus to the invoking control when it closes.

- explanation  
  This preserves navigation context and prevents interaction with obscured background content.

- details  
  Choose meaningful initial focus, support Escape according to product rules, mark the rest of the page inert, and handle removal of the original trigger.

---

### Card 101

- question  
  What is the difference between hiding and unmounting content?

- answer  
  Hidden content remains mounted and may preserve state, DOM, subscriptions, and memory. Unmounted content is removed and its Effects are cleaned up.

- explanation  
  CSS visibility alone does not necessarily remove content from the accessibility tree or stop background behavior.

- details  
  Choose based on state preservation, performance, accessibility, animation, and whether hidden content should continue performing work.

---

### Card 102

- question  
  How should asynchronous status updates be announced to assistive technologies?

- answer  
  Use visible status text and an appropriate live region or status role when an important update occurs without moving focus.

- explanation  
  Screen-reader users may otherwise receive no indication that loading, saving, or validation completed.

- details  
  Keep announcements concise, avoid repeatedly replacing the live-region node, and use assertive announcements only for genuinely urgent messages.

---

### Card 103

- question  
  How do you make custom interactive components keyboard accessible?

- answer  
  Prefer native elements. When a custom widget is necessary, implement its expected semantics, focus behavior, keyboard interactions, and state communication.

- explanation  
  Adding `role` does not automatically add keyboard behavior.

- details  
  Follow the established pattern for the widget, manage `tabIndex`, support required keys, expose state with ARIA, preserve visible focus, and test with keyboard and assistive technology.

---

## Architecture, testing, and accessibility

### Card 27

- question  
  How would you design reusable React component APIs?

- answer  
  Prefer small composable components with clear responsibilities, predictable controlled and uncontrolled behavior, semantic defaults, and explicit extension points.

  Use composition before adding large collections of configuration props.

- explanation  
  A component API should make common behavior easy and invalid combinations difficult to express.

- details  
  Useful patterns include:

  - `children` composition
  - Explicit variants
  - Controlled and uncontrolled state
  - Compound components
  - Render props where actual rendering control is needed
  - Focused custom Hooks
  - Context for related compound descendants
  - Ref exposure for necessary imperative actions

  Avoid excessive Boolean props:

  ```jsx
  <Dialog
    compact
    warning
    centered
    noPadding
    rounded
  />
  ```

  A clearer API may use a small variant model:

  ```jsx
  <Dialog
    variant="warning"
    size="compact"
  />
  ```

  Reusable components should preserve native props, semantics, focus behavior, and accessible naming. Flexibility should not require consumers to understand internal implementation details.

---


### Card 24

- question  
  How should senior engineers test React applications?

- answer  
  Test observable user behavior and important integration boundaries rather than component implementation details.

  Combine focused unit tests, component or integration tests, and a smaller number of end-to-end tests for critical journeys.

- explanation  
  Prefer queries that reflect how users and assistive technologies find the interface.

  ```jsx
  const saveButton = screen.getByRole("button", {
    name: "Save"
  });

  await user.click(saveButton);
  ```

- details  
  Valuable tests cover:

  - Rendering from meaningful inputs
  - User interaction
  - Loading, empty, success, and error states
  - Form validation
  - Accessibility behavior
  - Data-boundary integration
  - Routing
  - Critical end-to-end workflows

  Avoid overusing snapshots, testing internal state, or asserting that private functions were called when visible behavior provides a stronger test.

  Mock external boundaries deliberately. Excessive mocking can create tests that pass even when the integrated application fails.

  Tests should be deterministic, isolated, readable, and capable of failing for one clear reason.

---

### Card 25

- question  
  How do you build accessible React components?

- answer  
  Start with semantic HTML, preserve native keyboard behavior, provide accessible names, manage focus deliberately, and use ARIA only when native HTML cannot express the required behavior.

  Accessibility must be included in component design rather than added only after implementation.

- explanation  
  Use a native button instead of recreating button behavior with a generic element:

  ```jsx
  <button onClick={save}>
    Save
  </button>
  ```

- details  
  Senior-level accessibility considerations include:

  - Keyboard navigation
  - Focus order and focus restoration
  - Accessible names and descriptions
  - Form labels and error associations
  - Live announcements
  - Modal focus management
  - Color contrast
  - Motion preferences
  - Semantic headings and landmarks
  - Screen-reader testing

  Avoid:

  ```jsx
  <div onClick={save}>Save</div>
  ```

  It lacks native keyboard behavior and button semantics.

  Dynamic form errors should be connected to their inputs:

  ```jsx
  <input
    aria-invalid={Boolean(error)}
    aria-describedby={error ? "name-error" : undefined}
  />

  {error && (
    <p id="name-error">
      {error}
    </p>
  )}
  ```

  Automated accessibility checks are useful but do not replace keyboard and assistive-technology testing.

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

## Senior interview scenarios

### Card 119

- question  
  Hydration fails only for users in certain locales. How would you investigate it?

- answer  
  Compare the exact server and first client output, then look for locale-sensitive formatting, time-zone differences, browser-only data, invalid HTML, random values, or data that changed between rendering and hydration.

- explanation  
  Dates and numbers can produce different strings when the server locale or time zone differs from the browser's settings.

- details  
  A disciplined investigation should:

  1. Capture the hydration warning and component stack.
  2. Reproduce with the affected locale and time zone.
  3. Inspect the server HTML before client code changes it.
  4. Identify the first differing node rather than the largest reported subtree.
  5. Make the initial render deterministic.

  Possible fixes include formatting with an explicit shared locale and time zone, sending the formatted value from the server, or rendering a deterministic placeholder and updating it after hydration.

  `suppressHydrationWarning` is appropriate only for a deliberately unavoidable text difference and works at limited depth. It should not hide an unexplained mismatch.

---

### Card 120

- question  
  A Server Function receives a hidden `userId` field from a form. What security problem can this create?

- answer  
  Hidden fields are controlled by the client. Trusting the submitted `userId` can let an attacker act as another user or access a resource they do not own.

- explanation  
  A Server Function is a public server entry point. It must authenticate the caller, authorize the requested operation, and validate all submitted data.

- details  
  The server should derive identity from a verified session, not from a user identifier supplied by the browser:

  ```jsx
  "use server";

  async function updateProfile(formData) {
    const session = await requireSession();
    const input = validateProfile(formData);

    await updateAuthorizedProfile(
      session.user.id,
      input
    );
  }
  ```

  Authorization must also check ownership or role for the particular resource. UI restrictions, disabled buttons, hidden inputs, TypeScript types, and Client Component boundaries are not security controls.

  Consider CSRF protection where the framework and authentication design require it, avoid returning sensitive error detail, and log rejected authorization attempts without exposing secrets.
