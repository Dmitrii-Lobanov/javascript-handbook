# Chapter 7 — `this` Binding

## Learning objectives

After completing this chapter, you should be able to:

- determine `this` from a function's invocation form;
- explain why extracting a method changes its receiver;
- distinguish ordinary, arrow, bound, and constructor calls;
- explain strict-mode and non-strict-mode fallback behavior;
- use `call`, `apply`, and `bind` precisely;
- diagnose lost-receiver bugs in callbacks, classes, DOM code, and React.

## Quick Refresher

- For an ordinary function, `this` is usually determined when the function is called.
- `object.method()` calls `method` with `object` as the receiver.
- Copying `object.method` into a variable does not permanently attach it to `object`.
- A plain strict-mode call receives `undefined` as `this`.
- Arrow functions do not create their own `this`; they use the surrounding lexical `this`.
- `call` and `apply` invoke immediately with an explicit receiver; `bind` creates a new function.
- `new` creates a receiver and invokes a constructable function as a constructor.
- Passing a method as a callback often loses its original receiver.

## Why This Matters

Weak explanations say that `this` refers to “the current object” or “the object that owns the function.” Neither rule predicts detached methods, callbacks, arrows, bound functions, constructors, or strict mode. Senior interviews expect you to read the call expression and identify the receiver without guessing from where the function was defined.

The same skill prevents production failures such as an event handler losing a class instance, a private method throwing after extraction, or a callback silently writing to the wrong object.

## Core Mental Model

For an ordinary function, start with the **call site**:

| Invocation                  | Resulting `this`                               |
| --------------------------- | ---------------------------------------------- |
| `account.read()`            | `account`                                      |
| `read()` in strict mode     | `undefined`                                    |
| `read.call(account)`        | `account`                                      |
| `read.apply(account, args)` | `account`                                      |
| `read.bind(account)()`      | The bound `account`                            |
| `new Account()`             | A newly created receiver                       |
| Arrow function call         | No new `this`; use the enclosing lexical value |

```js
"use strict";

const account = {
  balance: 100,
  read() {
    return this.balance;
  },
};

console.log(account.read()); // 100

const detached = account.read;
console.log(detached()); // TypeError: this is undefined
```

The function did not change. The invocation changed from a property-reference call to a plain call, so the receiver was lost.

## Visual Model

![How different call sites select this for the same function](/this-call-site.svg)

For an ordinary function, the invocation selects the receiver: a method call preserves the property base, a strict plain call has no receiver, `call` supplies one explicitly, and `new` creates one. Arrow functions follow a separate rule because they read `this` lexically instead of receiving it from the call site.

## Formal Model

### A method call preserves a reference base

Evaluating `account.read` produces an internal property Reference Record whose base is `account`. Calling that reference supplies the base object as `this`.

```js
account.read();
```

Extraction first obtains the function value and discards the property reference:

```js
const read = account.read;
read();
```

This is why “the function belongs to the object” is misleading. Functions are values; the call expression determines whether a receiver is supplied.

Parentheses alone do not normally detach a method:

```js
account.read(); // this === account
```

But expressions that produce only the function value do:

```js
(0, account.read)();
const { read } = account;
read();
```

### Plain calls and strictness

For a plain call to an ordinary function:

- strict-mode code keeps `this` as `undefined`;
- legacy non-strict code substitutes the global object for `undefined` or `null` and boxes primitive receivers.

Modules and class bodies are strict. Modern code should not depend on global-object substitution.

```js
function strictReceiver() {
  "use strict";
  return this;
}

console.log(strictReceiver()); // undefined
```

### Explicit receivers: `call`, `apply`, and `bind`

`call` and `apply` invoke a function immediately:

```js
function describe(prefix, suffix) {
  return `${prefix}${this.name}${suffix}`;
}

const user = { name: "Mina" };

describe.call(user, "User: ", ".");
describe.apply(user, ["User: ", "."]);
```

`bind` creates a new bound function and can also prefill arguments:

```js
const describeUser = describe.bind(user, "User: ");
console.log(describeUser(".")); // User: Mina.
```

Calling `call` or `apply` on a bound function cannot replace its bound receiver. If a bound function is used with `new`, construction creates the receiver instead; the stored bound `this` is ignored, while bound arguments still apply.

### Arrow functions use lexical `this`

An arrow function has no own `this` binding. Reading `this` inside it continues through the surrounding lexical environment.

```js
const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds += 1;
    }, 1000);
  },
};
```

The arrow uses the `this` of `start`. Replacing it with an ordinary callback would give that callback a receiver according to how the host invokes it, not according to where it appears in the source.

Because arrows have no own `this`, `call`, `apply`, and `bind` cannot change the value they read. Arrow functions also cannot be used as constructors.

### Constructor calls

For `new Constructor(...args)`, the language broadly:

1. creates a new object linked to `Constructor.prototype`;
2. invokes the constructor with that object as `this`;
3. returns the explicit result if it is an object, otherwise returns the created object.

```js
function Account(balance) {
  this.balance = balance;
}

const account = new Account(100);
```

In a derived class constructor, `this` remains uninitialized until `super()` completes. Accessing it earlier throws.

### Class methods and private fields

Class methods are strict but not automatically bound:

```js
class Counter {
  #count = 0;

  increment() {
    this.#count += 1;
  }
}

const counter = new Counter();
const increment = counter.increment;
increment(); // TypeError
```

The detached call supplies `undefined`, and private-field access also requires a receiver carrying the correct private brand. Bind the method, wrap the call, or use an instance field arrow when its per-instance identity and allocation are intentional.

## Step-by-Step Runtime Walkthrough

Predict the output:

```js
"use strict";

const player = {
  name: "Ada",
  score: 10,
  add(points) {
    this.score += points;
    return `${this.name}: ${this.score}`;
  },
};

const detached = player.add;
const bound = player.add.bind(player, 5);

console.log(player.add(2));

try {
  detached(3);
} catch (error) {
  console.log(error.name);
}

console.log(bound());
console.log(player.score);
```

The output is:

```text
Ada: 12
TypeError
Ada: 17
17
```

Trace the call sites:

1. `player.add(2)` preserves the property reference, so `this` is `player`.
2. `detached(3)` is a plain strict-mode call, so `this` is `undefined`.
3. `bound()` uses the receiver and first argument stored by `bind`.
4. Both successful calls mutate the same `player.score` property.

## Important Examples

### Passing a method as a callback

```js
class SearchTracker {
  constructor() {
    this.count = 0;
  }

  record() {
    this.count += 1;
  }
}

const tracker = new SearchTracker();

button.addEventListener("click", tracker.record); // receiver is not tracker
button.addEventListener("click", () => tracker.record()); // receiver is tracker
```

A callback consumer controls how it invokes the function. Passing a method value does not preserve the original object. A wrapper creates a new call site that explicitly uses `tracker` as the receiver.

For DOM listeners registered as ordinary functions, browsers set `this` to the listener's `currentTarget`. Prefer the explicit `event.currentTarget`; it is clearer and also works with arrows.

### Borrowing a method

```js
const first = {
  name: "first",
  identify() {
    return this.name;
  },
};

const second = { name: "second", identify: first.identify };

console.log(second.identify()); // second
```

The function was defined in `first`, but `second` is the receiver at this call site. Unlike lexical variables, ordinary-function `this` does not come from the function's creation environment.

## Common Misconceptions

| Claim                                               | Better explanation                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------ |
| “`this` is the object that owns the function.”      | Ordinary-function `this` is generally determined by invocation, not ownership. |
| “`this` refers to the current function.”            | It is a receiver value, not the function object.                               |
| “Arrow functions bind `this` permanently.”          | Arrows have no own `this`; they read the enclosing lexical value.              |
| “Methods are automatically bound.”                  | Extracting a method usually removes the property-reference receiver.           |
| “`bind` changes the original function.”             | It returns a new bound function with different identity.                       |
| “`call` can change an arrow's `this`.”              | Explicit-receiver operations cannot create a binding an arrow does not have.   |
| “Callbacks keep the receiver from where they came.” | The callback consumer determines the later invocation form.                    |

## React Connection

Function components do not use `this`; props and state are lexical bindings. This avoids an entire category of receiver bugs but does not remove closures or function identity concerns.

Legacy class components do use instance methods:

```jsx
class SaveButton extends React.Component {
  handleClick() {
    this.props.onSave();
  }

  render() {
    return <button onClick={() => this.handleClick()}>Save</button>;
  }
}
```

The wrapper calls `this.handleClick()` as a method. Common alternatives are binding once in the constructor or using an instance field arrow:

```jsx
handleClick = () => {
  this.props.onSave();
};
```

These approaches produce different function identities and allocation patterns. Binding or creating wrappers during every render can also defeat shallow equality or memoization when identity matters. Correctness comes first; optimize identity only where measurement or component contracts justify it.

When a function component passes `service.save` directly, the ordinary JavaScript detached-method rule still applies. React does not restore the service receiver.

## Performance and Debugging

Receiver selection itself is rarely a useful optimization target. More practical concerns are accidental function allocation and unstable callback identity from repeated `bind` or wrapper creation.

When `this` is wrong:

1. Find the exact call expression, not only the function definition.
2. Classify it as method, plain, explicit, bound, constructor, or arrow behavior.
3. Check whether destructuring or callback passing discarded a property reference.
4. Confirm whether strict mode turns the missing receiver into `undefined`.
5. Inspect transpiled code only after understanding the source-level call.

At a breakpoint, inspect `this` in the current frame and compare it with the expected object. For private-field errors, verify both receiver presence and private brand. Avoid “fixing” receiver bugs with a global arrow conversion: arrows are appropriate only when lexical `this` is the intended contract.

## Interview Questions

### Level 1 — Fundamentals

**Question:** How is `this` determined in JavaScript?

**Model answer:** For an ordinary function, start from the invocation. A property-reference call supplies its base object, a strict plain call supplies `undefined`, `call` and `apply` supply an explicit receiver, `bind` stores one for later calls, and `new` creates one. Arrow functions are different because they use lexical `this` from the surrounding environment.

### Level 2 — Applied understanding

**Question:** Why does an extracted method often fail?

**Model answer:** `object.method()` preserves a property Reference Record whose base becomes `this`. Assigning `object.method` to a variable retrieves only the function value. Calling that variable is a plain call, so the original object is no longer supplied as the receiver.

### Level 3 — Senior reasoning

**Question:** When would you choose a wrapper, `bind`, or an arrow instance field?

**Model answer:** A wrapper makes the receiver and arguments explicit at one call site. `bind` creates a reusable function with a fixed receiver and optional partial arguments. An arrow instance field provides lexical instance access but creates a function per instance and changes prototype-method semantics. I choose based on lifetime, identity requirements, and API expectations rather than style alone.

### Level 4 — Deep follow-up

**Question:** What happens when a bound constructor is called with `new`?

**Model answer:** If the target is constructable, `new` creates the receiver and the bound `this` value is ignored. Bound arguments are still prepended. Construction behavior comes from the target function, and the resulting object follows the target's construction semantics.

## Exercises

### 1. Predict the receiver

```js
"use strict";

const box = {
  value: 3,
  read() {
    return this?.value;
  },
};

const read = box.read;

console.log(box.read());
console.log(read());
console.log(read.call({ value: 7 }));
```

<details>
<summary>Solution</summary>

The output is `3`, `undefined`, and `7`. The optional chain inside `read` prevents an error for the strict plain call; it does not restore the lost receiver.

</details>

### 2. Explain the arrow

```js
const panel = {
  title: "Settings",
  createReader() {
    return () => this.title;
  },
};

const read = panel.createReader();
console.log(read.call({ title: "Profile" }));
```

<details>
<summary>Solution</summary>

The output is `Settings`. `createReader()` runs with `panel` as `this`, and the arrow reads that surrounding lexical value. `call` cannot provide the arrow with a different `this` binding.

</details>

### 3. Repair the callback

```js
class Controller {
  save() {
    return this.repository.commit();
  }
}

queue.add(controller.save);
```

Give two valid repairs and explain their identity or lifetime trade-off.

<details>
<summary>Solution</summary>

Pass `controller.save.bind(controller)` and retain that bound function if removal later requires the same identity, or pass `() => controller.save()` and retain the wrapper for the same reason. Binding once during initialization avoids creating a new callback at every registration or render.

</details>

### 4. Explain construction

What receiver does `new BoundAccount(100)` use if `BoundAccount` was created with `Account.bind(existingAccount)`?

<details>
<summary>Solution</summary>

Construction creates a new receiver; it does not use `existingAccount`. Any arguments stored by `bind` are prepended to the constructor arguments.

</details>

## Chapter Summary

- Ordinary-function `this` is determined primarily by the invocation form.
- Method syntax preserves a property-reference base; method extraction discards it.
- Strict plain calls receive `undefined`; modern code should not rely on global fallback.
- Arrows use lexical `this` and cannot be rebound or constructed.
- `call` and `apply` invoke explicitly; `bind` creates a new function.
- `new` creates a receiver and applies constructor return rules.
- Callback APIs frequently expose lost-receiver bugs.
- React function components avoid `this`, but passed service methods still follow JavaScript rules.

### Interview-ready explanation

For an ordinary JavaScript function, I determine `this` from the call expression. `object.method()` supplies `object` because the property reference retains its base. Extracting the method leaves only a function value, so a strict plain call receives `undefined`. `call` and `apply` provide an explicit receiver, `bind` creates a function with a stored receiver, and `new` creates a receiver for construction. Arrow functions are the exception: they have no own `this` and read it lexically from the surrounding environment. This model explains detached callbacks, class-method errors, and why passing `service.save` through React does not preserve `service`.

## Further Reading

- [ECMA-262: ResolveThisBinding](https://tc39.es/ecma262/#sec-resolvethisbinding)
- [ECMA-262: EvaluateCall](https://tc39.es/ecma262/#sec-evaluatecall)
- [ECMA-262: Function Environment Records](https://tc39.es/ecma262/#sec-function-environment-records)
- [ECMA-262: Bound Function Exotic Objects](https://tc39.es/ecma262/#sec-bound-function-exotic-objects)
- [ECMA-262: The `new` Operator](https://tc39.es/ecma262/#sec-new-operator)
- [MDN: `this`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
- [React: Responding to Events](https://react.dev/learn/responding-to-events)
