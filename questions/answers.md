### Card 1

- question  
  What is the difference between `var`, `let`, and `const`?

- answer  
  `var` is function-scoped and can be redeclared. `let` and `const` are block-scoped; `let` can be reassigned, while `const` cannot.

- explanation  
  `var` is initialized to `undefined` when its scope starts. `let` and `const` stay in the temporal dead zone until their declaration is evaluated. Use `const` by default and `let` when reassignment is required. A `const` object can still be mutated.

- details  
  `var` belongs to the nearest function scope, so a block such as an `if` statement does not contain it. It also permits redeclaration. `let` and `const` belong to the nearest block and cannot be redeclared in the same scope. `const` requires an initializer and protects only the binding—not the object it identifies.

  ```js
  if (true) {
    var functionScoped = 1;
    let blockScoped = 2;
  }

  console.log(functionScoped); // 1
  console.log(blockScoped); // ReferenceError
  ```

---

### Card 2

- question  
  What are JavaScript’s primitive data types?

- answer  
  JavaScript has seven primitive data types:

  - `string`
  - `number`
  - `bigint`
  - `boolean`
  - `undefined`
  - `symbol`
  - `null`

- explanation  
  Primitive values are immutable and are compared by value. Everything that is not a primitive is an object, including arrays and functions. One historical JavaScript quirk is that `typeof null` returns `"object"`.

- details  
  Immutability means a primitive cannot change in place; an operation produces another value instead. Objects have identity, so separately created objects are unequal even when their properties match. Symbols are primitives with unique identity: two calls to `Symbol("id")` create distinct values.

  ```js
  "hello".toUpperCase(); // returns a new string
  {} === {}; // false: different object identities
  Symbol("id") === Symbol("id"); // false
  ```

---

### Card 3

- question  
  What is the difference between `null` and `undefined`?

- answer  
  `undefined` commonly represents a missing or uninitialized value. `null` is normally assigned deliberately to represent no value.

- explanation  
  JavaScript often produces `undefined` automatically, such as for a missing property. Developers normally assign `null` deliberately.

  ```js
  let name; // undefined
  const user = null; // intentionally empty
  const age = person.age; // undefined if age does not exist
  ```

- details  
  Other common sources of `undefined` are omitted arguments and functions without an explicit return value. `null` and `undefined` are different primitive values: strict equality distinguishes them, while loose equality treats them as equal to each other. Their business meaning is still an application convention, so APIs should use them consistently.

  ```js
  null === undefined; // false
  null == undefined; // true
  null ?? "fallback"; // "fallback"
  ```

---

### Card 4

- question  
  What is the difference between `==` and `===`?

- answer  
  `===` compares without type coercion. `==` follows a type-directed algorithm that may coerce one operand when their types differ.

- explanation  
  Prefer `===` unless a specific loose-equality rule is intentional, such as `value == null` to match both `null` and `undefined`.

  ```js
  5 == "5"; // true
  5 === "5"; // false
  ```

  Objects are compared by identity with either operator:

  ```js
  {} === {}; // false
  ```

- details  
  Loose equality chooses conversions according to the operand types; it does not simply convert both sides to numbers. Booleans convert to numbers, objects may convert to primitives, and `null` is loosely equal only to `undefined`. Both equality operators compare objects by identity rather than their properties. `NaN` is unequal to itself under both operators, so use `Number.isNaN` when testing for it.

  ```js
  false == 0; // true
  [] == false; // true
  null == 0; // false
  Number.isNaN(NaN); // true
  ```

---

### Card 5

- question  
  What are truthy and falsy values?

- answer  
  Truthy values behave like `true` in a Boolean context, while falsy values behave like `false`.

  The falsy values are:

  - `false`
  - `0`
  - `-0`
  - `0n`
  - `""`
  - `null`
  - `undefined`
  - `NaN`

- explanation  
  Every other value is truthy, including empty arrays and empty objects. This matters in conditions, logical operators, and default-value expressions.

  ```js
  if ("hello") {
    // Runs because a non-empty string is truthy
  }

  Boolean([]); // true
  Boolean({}); // true
  ```

- details  
  Boolean contexts include `if`, `while`, ternary conditions, and logical operators. Every object is truthy, including wrapper objects such as `new Boolean(false)`. For defaults, `||` replaces every falsy value, while `??` replaces only `null` and `undefined`. Use `??` when `0`, `false`, or an empty string are valid values.

  ```js
  0 || 10; // 10
  0 ?? 10; // 0
  "" || "Untitled"; // "Untitled"
  "" ?? "Untitled"; // ""
  ```
