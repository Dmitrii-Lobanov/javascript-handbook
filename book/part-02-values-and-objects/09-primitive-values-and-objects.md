# Chapter 9 — Primitive Values and Objects

## Learning objectives

After completing this chapter, you should be able to:

- classify every ECMAScript value as primitive or object;
- explain assignment and parameter passing without saying “objects pass by reference”;
- distinguish value equality, object identity, mutation, and reassignment;
- explain why primitives appear to have properties and methods;
- use `typeof`, `Object.is`, and wrapper objects precisely;
- connect object identity to React state, props, dependencies, and memoization.

## Quick Refresher

- ECMAScript has seven primitive types and one Object type.
- Primitives are immutable values without object identity.
- Objects have identity and can contain properties and internal state.
- Assignment and function calls copy values; an object value still identifies the same object after being copied.
- `const` prevents rebinding, not object mutation.
- Property access on most primitives uses temporary object-like language machinery.
- `typeof null` is `"object"`; callable objects normally produce `"function"`.
- React compares state and dependency values with `Object.is`, so object identity matters.

## Why This Matters

“Primitives are copied by value; objects are copied by reference” often predicts simple output, but it teaches the wrong mechanism. JavaScript is pass-by-value: the copied value may be an object identity, allowing two bindings to designate the same mutable object without giving a function access to the caller's variable.

This distinction explains mutation bugs, failed React updates, dependency churn, shallow-copy mistakes, wrapper-object surprises, and interview questions involving `NaN`, `-0`, strings, arrays, and functions.

## Core Mental Model

Every JavaScript value belongs to one of these specification types:

| Category  | Types                                                                | Core property                                       |
| --------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Primitive | Undefined, Null, Boolean, Number, BigInt, String, Symbol             | Immutable value without object identity             |
| Object    | Ordinary objects, arrays, functions, dates, maps, promises, and more | Value with identity, properties, and internal slots |

Variables do not contain “primitive boxes” or “object boxes” defined by the language. A binding holds a value. Assignment copies that value into another binding.

```js
let count = 1;
let copiedCount = count;

let profile = { name: "Ada" };
let copiedProfile = profile;
```

`count` and `copiedCount` hold equal Number values. `profile` and `copiedProfile` hold copies of the same Object value, so both designate one object identity.

Use this interview-safe phrasing:

> JavaScript passes values. When the value is an object, copying it preserves the identity of that object.

## Formal Model

### The seven primitive types

| Type      | Representative values        | Important detail                                                             |
| --------- | ---------------------------- | ---------------------------------------------------------------------------- |
| Undefined | `undefined`                  | Default result for many missing values and uninitialized `var` bindings      |
| Null      | `null`                       | Intentional null value; `typeof null` is historically `"object"`             |
| Boolean   | `true`, `false`              | Logical values                                                               |
| Number    | `3`, `NaN`, `Infinity`, `-0` | IEEE-754 binary64 numeric type                                               |
| BigInt    | `3n`                         | Arbitrary-precision integers; does not mix implicitly with Number arithmetic |
| String    | `"hello"`                    | Immutable sequence of UTF-16 code units                                      |
| Symbol    | `Symbol("id")`               | Unique primitive commonly used as a property key                             |

`undefined` and `null` are both nullish, but they are different values of different types. Their application meanings are conventions: JavaScript does not universally define `undefined` as “missing” and `null` as “intentionally empty.”

### Primitive immutability

A primitive value cannot be changed in place:

```js
let label = "save";

label[0] = "S";
console.log(label); // "save"

label = "Save";
```

The final assignment replaces the value held by `label`; it does not mutate the original string. String methods likewise return new values when a different string is needed.

Immutability does not mean a binding cannot change. A `let` binding can successively hold different immutable values.

### Objects have identity

Two separately created objects have different identities even when their properties look identical:

```js
const first = { enabled: true };
const second = { enabled: true };
const alias = first;

console.log(first === second); // false
console.log(first === alias); // true
```

Objects are often mutable, but mutability is not what defines Object type. An object can be frozen, sealed, or expose only non-writable properties and still retain its identity.

Functions and arrays are objects with specialized behavior:

- a function is callable and may also have properties;
- an array has indexed properties and Array-specific internal behavior;
- built-ins such as `Map`, `Date`, and `Promise` use internal slots not reproduced by copying visible properties.

### Assignment and function arguments

JavaScript does not give a called function direct access to the caller's binding:

```js
function update(profile) {
  profile.name = "Grace";
  profile = { name: "Lin" };
}

const user = { name: "Ada" };
update(user);

console.log(user); // { name: "Grace" }
```

The parameter `profile` initially receives the same Object value as `user`:

1. `profile.name = "Grace"` mutates their shared object.
2. Reassigning `profile` changes only the local parameter binding.
3. The caller's `user` binding still designates the original object.

If JavaScript passed the caller's variable by reference, assigning a new object to `profile` would also reassign `user`. It does not.

### Binding immutability versus object mutation

```js
const settings = { theme: "dark" };

settings.theme = "light"; // allowed
settings = { theme: "system" }; // TypeError
```

`const` makes the binding non-reassignable after initialization. It does not freeze the object. `Object.freeze(settings)` can prevent certain own-property changes, but freezing is shallow and does not make nested objects recursively immutable.

### Why primitives appear to have methods

Except for `null` and `undefined`, primitives can participate in property access:

```js
console.log("frontend".toUpperCase()); // FRONTEND
console.log((42).toFixed(2)); // 42.00
```

The language performs object-coercion behavior so the operation can use methods such as `String.prototype.toUpperCase`. The primitive does not permanently become a wrapper object.

This is visible when attempting to store a property on a primitive:

```js
"use strict";

let name = "Ada";
name.role = "engineer"; // TypeError in strict mode
```

Avoid explicitly constructed primitive wrappers:

```js
const primitive = false;
const wrapped = new Boolean(false);

console.log(Boolean(primitive)); // false
console.log(Boolean(wrapped)); // true: every object is truthy
console.log(primitive === wrapped); // false
```

Use `String(value)`, `Number(value)`, and `Boolean(value)` for explicit conversion without `new`.

### `typeof` is a classifier with exceptions

| Expression              | Result        |
| ----------------------- | ------------- |
| `typeof undefined`      | `"undefined"` |
| `typeof null`           | `"object"`    |
| `typeof true`           | `"boolean"`   |
| `typeof 1`              | `"number"`    |
| `typeof 1n`             | `"bigint"`    |
| `typeof "x"`            | `"string"`    |
| `typeof Symbol()`       | `"symbol"`    |
| `typeof {}`             | `"object"`    |
| `typeof function () {}` | `"function"`  |

`"function"` is a `typeof` result for callable objects, not an additional ECMAScript value type. Use `value === null` to test for `null`, and `Array.isArray(value)` to identify arrays across realms.

### Equality preview

Chapter 10 examines equality and coercion in depth. For this chapter, retain three facts:

- strict equality compares object identity;
- `NaN === NaN` is `false`;
- `0 === -0` is `true`.

`Object.is` differs on the last two cases:

```js
Object.is(NaN, NaN); // true
Object.is(0, -0); // false
```

For most other primitive comparisons, `Object.is` behaves like strict equality. For objects, it still compares identity.

## Step-by-Step Runtime Walkthrough

Predict the output:

```js
function revise(total, order) {
  total += 10;
  order.total += 10;
  order = { total: 0 };

  return { total, order };
}

let total = 20;
const order = { total: 20 };

const result = revise(total, order);

console.log(total);
console.log(order.total);
console.log(result.total);
console.log(result.order.total);
```

The output is:

```text
20
30
30
0
```

Trace the values:

1. The parameter `total` receives a copy of the Number value `20`.
2. `total += 10` reassigns only the local parameter.
3. The parameter `order` receives the same Object value as the outer binding.
4. `order.total += 10` mutates that shared object, so the caller observes `30`.
5. Reassigning the parameter to `{ total: 0 }` affects only the local binding.
6. The returned object contains the local Number value `30` and the newly created Object value.

The language uses the same pass-by-value rule in every step. The different output follows from object identity and mutation.

## Important Examples

### Shallow copying creates a new outer identity

```js
const original = {
  user: { name: "Ada" },
  active: true,
};

const copy = { ...original };

console.log(copy === original); // false
console.log(copy.user === original.user); // true

copy.user.name = "Grace";
console.log(original.user.name); // Grace
```

Spread creates a new ordinary object and copies enumerable own property values. It does not recursively clone nested objects, preserve every property descriptor, or reproduce specialized internal slots.

Chapter 16 develops copying and structural sharing in detail.

### Symbols are primitive identity values

```js
const first = Symbol("id");
const second = Symbol("id");

console.log(first === second); // false
```

The description is diagnostic text, not Symbol identity. Symbols are primitives, yet separately created symbols remain distinct. Along with strings, they can serve as property keys.

## Common Misconceptions

| Claim                                       | Better explanation                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| “Objects are passed by reference.”          | Arguments are values; copying an Object value preserves its object identity.           |
| “Objects are defined by mutability.”        | Objects are identity-bearing values; some objects reject or restrict mutation.         |
| “`const` makes an object immutable.”        | It prevents rebinding; the designated object can still mutate.                         |
| “Methods prove strings are objects.”        | Primitive property access uses object-coercion behavior; the string remains primitive. |
| “`typeof null` proves `null` is an object.” | The result is a historical language quirk; Null is a primitive type.                   |
| “Functions form a separate value category.” | Functions are callable objects; `"function"` is a special `typeof` result.             |
| “Spread makes a deep clone.”                | It creates a new outer object while normally preserving nested object identities.      |

## React Connection

React uses `Object.is` when deciding whether a state value changed and when comparing dependency-array entries.

```jsx
function ProfileEditor() {
  const [profile, setProfile] = useState({ name: "Ada" });

  function renameIncorrectly() {
    profile.name = "Grace";
    setProfile(profile);
  }

  function renameCorrectly() {
    setProfile({ ...profile, name: "Grace" });
  }
}
```

The first function mutates the existing object and passes the same identity back. React may treat the state as unchanged. The second creates a new outer identity that represents the update.

Identity also affects memoization and effects:

```jsx
const options = { limit: 20 };

useEffect(() => {
  connect(options);
}, [options]);
```

If this object is created during every render, the dependency changes every time even when its properties are equal. The best fix is usually to create the object inside the effect or derive primitive dependencies—not to add memoization mechanically.

Stable identity is not always desirable. Reusing a mutated object can hide a real change, while creating new objects unnecessarily can invalidate memoization. Match identity changes to semantic state changes.

## Performance and Debugging

Primitive-versus-object syntax does not reveal exact storage. Engines may represent values using tagged machine words, registers, stack slots, optimized objects, or heap allocations. “Primitives live on the stack and objects live on the heap” is not a JavaScript guarantee and is not a reliable performance explanation.

When state changes unexpectedly:

1. Identify which bindings contain primitive values and which designate objects.
2. Check whether multiple bindings designate the same object.
3. Separate property mutation from variable reassignment.
4. Inspect shallow copies for shared nested identities.
5. In React, compare the previous and next values with `Object.is`.

Use allocation and memory tools only when allocation behavior is the actual performance question. Prefer clear data ownership over speculative avoidance of object creation.

## Interview Questions

### Level 1 — Fundamentals

**Question:** What are JavaScript's primitive types?

**Model answer:** Undefined, Null, Boolean, Number, BigInt, String, and Symbol. Every other ECMAScript value is an Object value. Functions and arrays are specialized objects, even though callable objects produce `"function"` from `typeof`.

### Level 2 — Applied understanding

**Question:** Is JavaScript pass-by-value or pass-by-reference?

**Model answer:** JavaScript is pass-by-value. A parameter receives a copy of the argument value. When that value is an object, both bindings designate the same object, so property mutation is shared. Reassigning the parameter does not reassign the caller's binding.

### Level 3 — Senior reasoning

**Question:** Why can mutating React state and passing it back fail to render?

**Model answer:** The mutation changes properties but preserves the state object's identity. React compares the previous and next state with `Object.is`, so passing the same object can bail out. A state update should create a new identity for the changed path while preserving identities for unchanged data.

### Level 4 — Deep follow-up

**Question:** Are primitives always stored on the stack and objects on the heap?

**Model answer:** ECMAScript does not specify that layout. Engines choose representations and can optimize, box, scalar-replace, or move values while preserving observable behavior. I use primitive versus object to reason about semantics—immutability and identity—not physical storage.

## Exercises

### 1. Mutation versus reassignment

```js
function change(value) {
  value.done = true;
  value = { done: false };
}

const task = { done: false };
change(task);
console.log(task.done);
```

<details>
<summary>Solution</summary>

The output is `true`. The property mutation affects the shared object. Reassigning the local parameter does not change the caller's `task` binding.

</details>

### 2. Primitive property access

Why does `"hello".length` work if strings are not objects?

<details>
<summary>Solution</summary>

Property access applies object-coercion behavior to the primitive so String prototype behavior and indexed properties can be used. The original value remains a primitive and is not permanently converted into a wrapper object.

</details>

### 3. Find the shared identity

```js
const first = { nested: { value: 1 } };
const second = { ...first };

second.nested.value = 2;

console.log(first.nested.value);
console.log(first === second);
console.log(first.nested === second.nested);
```

<details>
<summary>Solution</summary>

The output is `2`, `false`, and `true`. Spread created a new outer object but copied the nested Object value, preserving that nested identity.

</details>

### 4. Explain the wrapper

```js
if (new Boolean(false)) {
  console.log("runs");
}
```

<details>
<summary>Solution</summary>

It logs `runs`. `new Boolean(false)` creates an object, and objects are truthy regardless of the wrapped Boolean value. Use the primitive `false` or `Boolean(value)` instead.

</details>

## Chapter Summary

- ECMAScript values are either primitives or objects.
- Primitives are immutable values; objects have identity and may be mutable.
- JavaScript passes values, including Object values that preserve object identity when copied.
- Property mutation and binding reassignment are different operations.
- `const` protects a binding, not the object it designates.
- Primitive property access does not make the primitive a persistent wrapper object.
- `typeof` has historical and callable-object exceptions.
- Spread creates a new outer identity but normally preserves nested identities.
- React uses `Object.is`, making identity changes part of state and dependency design.

### Interview-ready explanation

JavaScript has seven primitive types and one Object type. Primitives are immutable values without object identity; objects are identity-bearing values with properties and internal behavior. JavaScript is always pass-by-value: copying an Object value makes another binding designate the same object, which is why mutation is shared while parameter reassignment is not. `const` prevents rebinding rather than object mutation, and primitive method calls use temporary object-coercion behavior. In React, state and dependencies are compared with `Object.is`, so updates should change identity exactly where semantic data changed.

## Further Reading

- [ECMA-262: ECMAScript Data Types and Values](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)
- [ECMA-262: The `typeof` Operator](https://tc39.es/ecma262/#sec-typeof-operator)
- [ECMA-262: ToObject](https://tc39.es/ecma262/#sec-toobject)
- [ECMA-262: SameValue](https://tc39.es/ecma262/#sec-samevalue)
- [MDN: JavaScript Data Types and Data Structures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures)
- [React: Updating Objects in State](https://react.dev/learn/updating-objects-in-state)
- [React: Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs)
