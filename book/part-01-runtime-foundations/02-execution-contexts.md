# Chapter 2 — Execution Contexts

## Learning objectives

After completing this chapter, you should be able to:

- define an execution context without treating it as a JavaScript object;
- trace how calls and returns change the running execution context;
- distinguish execution contexts, lexical environments, and engine stack frames;
- explain declaration instantiation without relying on a universal “creation phase”;
- explain how async functions suspend without blocking a synchronous stack frame;
- connect fresh function invocations to React render behavior.

## Quick Refresher

- An execution context is ECMAScript's internal model for an active or suspended evaluation.
- The running execution context is normally the top entry of an agent's context stack.
- A function call normally suspends the caller and pushes a new function context.
- Returning removes the callee context and resumes the caller.
- Every invocation has distinct runtime state and local bindings.
- An execution context, a lexical environment, and an engine stack frame are related but different models.
- Every React component render is a fresh function invocation with fresh local bindings.

## Why This Matters

Execution contexts explain how control moves between scripts, functions, generators, and async functions. Interviewers rarely want a list of specification fields. They want to know whether you can identify which invocation is running, which invocation owns a local value, and what happens when evaluation returns or suspends.

A poor model leads to practical mistakes: assuming a closure retains an entire call stack, believing `await` leaves a normal stack frame blocked, or expecting a React component's local variables to persist across renders.

## Core Mental Model

An execution context is ECMAScript's **control record for one active or suspended evaluation**. It tracks enough state to answer:

- Which code is being evaluated?
- Which function, script, module, and realm does it belong to?
- Where should evaluation continue after a call returns or suspended work resumes?

At most one context per agent is running at a time. It is normally the top entry of the execution-context stack.

Keep three models separate:

| Concept                 | What it explains                         | What it is not                                    |
| ----------------------- | ---------------------------------------- | ------------------------------------------------- |
| **Execution context**   | Evaluation state and transfer of control | A JavaScript object                               |
| **Lexical environment** | Bindings and identifier resolution       | The dynamic caller chain                          |
| **Engine stack frame**  | Implementation storage for a call        | A required one-to-one representation of a context |

Calling a function changes the context stack. It does not change the called function's lexical parent.

## Formal Model

### Running context and context stack

Each ECMAScript agent has an execution-context stack. Its top entry is the **running execution context**. Calling an ordinary function normally creates a function context, suspends the caller, pushes the callee, and makes it current. When the callee completes, its context is removed and the caller resumes.

This is specification machinery. An engine may inline a call, eliminate storage, or reconstruct frames for debugging while preserving the required behavior.

### What a context contains

Every context carries evaluation state and associations such as:

- the function being evaluated, or `null` for script or module code;
- the relevant realm;
- the originating script or module, when one exists;
- enough state to perform, suspend, and resume evaluation.

Evaluation algorithms also use lexical, variable, and private environment components associated with the running context. Those environments contain bindings; the context itself should not be imagined as a user-visible object containing all local variables.

### Calling an ordinary function

An ordinary call can be summarized as:

1. Evaluate the callee and arguments in the caller.
2. Create a function context for the invocation.
3. Suspend the caller and make the callee context current.
4. Establish parameters, `this`, and the function's environments.
5. Instantiate declarations required by the body.
6. Evaluate the body and produce a completion.
7. Remove the callee context and resume the caller.

A `throw` produces an abrupt completion rather than a normal return. The context still unwinds through defined completion rules.

### Declaration instantiation, not source movement

“Creation phase” is common teaching shorthand, but ECMAScript defines specific declaration-instantiation algorithms for functions, scripts, modules, and blocks. For a function call, parameters and declarations are prepared before body statements execute, but their initialization differs:

| Declaration             | Initial state before its declaration statement |
| ----------------------- | ---------------------------------------------- |
| Function declaration    | Generally initialized with its function object |
| `var`                   | Initialized to `undefined`                     |
| `let`, `const`, `class` | Binding exists but remains uninitialized       |

Nothing is physically moved to the top of the source file. “Hoisting” describes observable initialization behavior; it is not a source-code transformation.

### Suspension is not an ordinary blocked call

Generators and async functions can suspend and later resume evaluation. The specification preserves the necessary context state, but an engine does not need to retain one normal native stack frame throughout the pause.

This distinction becomes visible with `await`: the async function starts synchronously, suspends, returns a promise to its caller, and resumes later through promise-job scheduling.

## Visual Model

An ordinary function call follows one compact control cycle:

![Execution context call, suspension, and return cycle](/execution-context-cycle.svg)

Read it as a change in which context owns control. A call suspends the caller and makes a new callee context the running context. Completion removes the callee context and continues the caller immediately after the call.

This is a specification model, not a promise about physical engine frames. It also does not describe lexical scope: identifier lookup follows lexical environments, not the chain of callers.

## Step-by-Step Runtime Walkthrough

The preceding trace demonstrates four rules:

1. **One invocation, one context.** The call to `calculateTax` creates invocation-specific state, including its `amount` parameter.
2. **The top context runs.** While `multiply` is current, the script and `calculateTax` contexts are suspended.
3. **Returns unwind in reverse call order.** `multiply` completes before `calculateTax` can continue and return.
4. **Scope is not the call stack.** `taxRate` is found through lexical environments, not by searching callers.

Now compare an async function:

```js
async function loadProfile() {
  console.log("load: start");
  await null;
  console.log("load: resumed");
}

console.log("script: start");
loadProfile();
console.log("script: end");
```

The output is:

```text
script: start
load: start
script: end
load: resumed
```

`loadProfile` begins synchronously. At `await`, its evaluation suspends and the call returns a promise. The script continues without a blocked synchronous frame. Promise-job machinery later resumes the async evaluation. DevTools may display an async stack linking both sides, but that is diagnostic causality—not one uninterrupted physical call stack.

## Common Misconceptions

| Claim                                            | Better explanation                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| “A context is an object containing locals.”      | It is inaccessible specification state; bindings are modeled by environment records.               |
| “Execution context and scope are the same.”      | Context tracks evaluation; lexical environments determine identifier resolution.                   |
| “The context stack is exactly the engine stack.” | The engine may inline, optimize, or reconstruct frames while preserving semantics.                 |
| “Hoisting moves declarations.”                   | Declaration-instantiation algorithms create and initialize bindings according to declaration type. |
| “Returning deletes every local immediately.”     | The context leaves the stack, but reachable objects and captured environments can remain.          |
| “A timer resumes the context that scheduled it.” | A timer callback normally runs as a new function invocation with a new context.                    |

## React Connection

A function component is still a function. Every render is a fresh invocation with a fresh execution context and fresh local bindings.

```jsx
function ProductSearch({ query }) {
  const normalizedQuery = query.trim().toLowerCase();

  function handleSearch() {
    console.log(normalizedQuery);
  }

  return <button onClick={handleSearch}>Search</button>;
}
```

Each render creates a new `normalizedQuery` binding and a new `handleSearch` function. The component call completes, but the handler may keep that render's environment reachable. React state persists because React stores it outside any single component invocation and supplies a snapshot during a later render.

This also explains why a plain local variable cannot serve as persistent component storage. In development, Strict Mode may invoke components more than once to expose impure rendering; each call is a real invocation, not React resetting one context.

## Performance and Memory Implications

The specification does not require one allocation or physical frame per conceptual context. Engines can inline calls, reuse storage, or materialize debugging information only when necessary. Do not estimate performance by counting boxes in a context diagram.

For memory reasoning, separate active execution from reachability:

- a completed call is no longer active;
- a closure may retain selected environment bindings;
- a suspended generator or async evaluation retains state needed for resumption;
- a paused debugger may keep values reachable.

Recursion can exhaust an implementation's stack, but ECMAScript defines no universal maximum call depth.

## Debugging Techniques

When paused inside a function, inspect two DevTools panes separately:

- **Call Stack** reconstructs the dynamic path of invocations.
- **Scope** shows bindings available to the selected frame.

Selecting another recursive frame changes the invocation-specific locals displayed. It does not change the function's lexical structure.

Treat stack traces as diagnostics. Optimized code may be inlined, and async tooling may add causal frames from earlier scheduling points. Those frames are useful evidence about execution history, not a literal dump of ECMAScript's context stack.

## Interview Questions

### Level 1 — Fundamentals

**Question:** What is an execution context?

**Model answer:**

An execution context is ECMAScript's internal mechanism for tracking code evaluation. It carries associations such as the current function, realm, source script or module, and enough state to run, suspend, or resume. The running context is normally the top of an agent's context stack. It is not a JavaScript object and does not have to map one-to-one to an engine frame.

### Level 2 — Applied understanding

**Question:** Does each call to the same function receive a new execution context?

**Model answer:**

Yes. Each active invocation has distinct evaluation state and normally a distinct function context and function environment. That is why recursive calls and calls with different arguments have independent local bindings. The function object can be shared while invocation state differs.

### Level 3 — Senior reasoning

**Question:** What happens to an async function's execution context at `await`?

**Model answer:**

The function starts synchronously. At `await`, its evaluation can suspend and return a promise to the caller, which then continues. Promise-job machinery later resumes the async evaluation with a fulfillment value or rejection. The engine does not need to leave one normal native stack frame blocking the thread during the wait.

### Level 4 — Deep follow-up

**Question:** Does a closure preserve its outer function's execution context?

**Model answer:**

The precise model is that the closure retains access to its creation environment. Captured bindings can remain reachable after the outer call's context has left the context stack. The engine does not need to retain the entire context or physical frame. In memory debugging, I inspect actual retaining paths rather than assuming every local survives.

## Exercises

### 1. Trace running contexts

```js
function first(value) {
  return second(value + 1);
}

function second(value) {
  return value * 2;
}

console.log(first(5));
```

<details>
<summary>Solution</summary>

The script runs first. Calling `first` suspends it and makes the `first` context current. Calling `second` suspends `first`. `second` returns `12`, so `first` resumes and returns `12`; the script then resumes and logs it.

</details>

### 2. Predict async output

```js
async function run() {
  console.log("B");
  await Promise.resolve();
  console.log("D");
}

console.log("A");
run();
console.log("C");
```

<details>
<summary>Solution</summary>

The output is `A`, `B`, `C`, `D`. `run` starts synchronously and suspends at `await`. The script logs `C`; the async continuation resumes later through promise-job scheduling and logs `D`.

</details>

### 3. Diagnose the React assumption

Why does `let previousCount = 0` inside a function component not remember the value from its previous render?

<details>
<summary>Solution</summary>

Every render is a new function invocation with a fresh local binding, so `previousCount` is initialized again. React state and refs persist because React stores their data outside a particular invocation. Use state when changes affect rendering and a ref for mutable data that should survive renders without causing one.

</details>

## Chapter Summary

- **Control:** the running execution context is normally the top of an agent's context stack.
- **Invocation:** each function call has distinct evaluation state and local bindings.
- **Scope:** lexical environments determine identifier resolution; callers do not.
- **Implementation:** contexts do not map rigidly to physical engine frames.
- **Suspension:** `await` can suspend evaluation without blocking a synchronous frame.
- **React:** every component render is a fresh function invocation with fresh locals.

### Interview-ready explanation

An execution context is ECMAScript's internal model for tracking code evaluation. A function call normally suspends the caller, creates and pushes a new context for the callee, and removes it when the callee completes. Contexts are not JavaScript objects and need not map one-to-one to engine frames. Bindings live in environment records, so lexical scope is separate from dynamic call order. That distinction explains why closures can retain bindings after a call finishes, why async functions can suspend without blocking a native stack frame, and why each React render receives fresh local variables.

## Further Reading

- [ECMA-262: Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts)
- [ECMA-262: PrepareForOrdinaryCall](https://tc39.es/ecma262/#sec-prepareforordinarycall)
- [ECMA-262: FunctionDeclarationInstantiation](https://tc39.es/ecma262/#sec-functiondeclarationinstantiation)
- [ECMA-262: Async Functions](https://tc39.es/ecma262/#sec-async-function-definitions)
- [React: Keeping Components Pure](https://react.dev/learn/keeping-components-pure)
- [React: State as a Snapshot](https://react.dev/learn/state-as-a-snapshot)
