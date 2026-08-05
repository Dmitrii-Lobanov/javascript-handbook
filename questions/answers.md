# JavaScript Fundamentals Interview Cards

## Card 1

- question  
  What is the difference between `var`, `let`, and `const`?

- answer  
  `var`, `let`, and `const` declare variables, but they differ in scope, redeclaration, reassignment, and initialization.

  - `var` is function-scoped and can be redeclared and reassigned.
  - `let` is block-scoped, cannot be redeclared in the same scope, and can be reassigned.
  - `const` is block-scoped and cannot be redeclared or reassigned.

- explanation  
  Prefer `const` by default and use `let` when a variable must change. Avoid `var` in modern JavaScript because its function scope can cause unexpected behavior.

  ```js
  const name = "Alex";
  let count = 0;
  count++;
  ```

- details  
  Variables declared with `let` and `const` belong to the nearest block, while `var` belongs to the nearest function:

  ```js
  if (true) {
    var functionScoped = "available outside";
    let blockScoped = "available only inside";
  }

  console.log(functionScoped); // "available outside"
  console.log(blockScoped);    // ReferenceError
  ```

  A `var` declaration can be repeated in the same scope:

  ```js
  var score = 10;
  var score = 20; // Allowed
  ```

  `let` and `const` cannot be redeclared in the same scope:

  ```js
  let age = 30;
  let age = 31; // SyntaxError
  ```

  `const` prevents reassignment, but it does not make objects immutable:

  ```js
  const user = { name: "Alex" };

  user.name = "Sam";       // Allowed
  user = { name: "Lee" };  // TypeError
  ```

  All three declarations are hoisted. However, `var` is initialized with `undefined`, while `let` and `const` remain inaccessible in the temporal dead zone until their declarations execute.

---

## Card 2

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

  A primitive represents a single immutable value. Everything that is not a primitive is an object, including arrays and functions.

- explanation  
  Primitive values cannot be modified in place and are compared by value:

  ```js
  const first = "hello";
  const second = "hello";

  first === second; // true
  ```

- details  
  Each primitive has a particular purpose:

  - `string` represents text.
  - `number` represents floating-point numbers, including `NaN` and `Infinity`.
  - `bigint` represents integers larger than the safe range supported by `number`.
  - `boolean` represents `true` or `false`.
  - `undefined` commonly represents a missing or uninitialized value.
  - `symbol` creates unique identifiers.
  - `null` represents an intentional absence of a value.

  ```js
  const title = "Developer";
  const price = 19.99;
  const largeNumber = 9007199254740993n;
  const isActive = true;
  const missing = undefined;
  const id = Symbol("id");
  const selectedUser = null;
  ```

  Primitive values are immutable:

  ```js
  let text = "hello";
  text.toUpperCase();

  console.log(text); // "hello"
  ```

  String methods return new values rather than modifying the original string.

  The `typeof` operator identifies most primitive types:

  ```js
  typeof "hello";    // "string"
  typeof 42;         // "number"
  typeof 42n;        // "bigint"
  typeof true;       // "boolean"
  typeof undefined;  // "undefined"
  typeof Symbol();   // "symbol"
  ```

  One historical JavaScript behavior is:

  ```js
  typeof null; // "object"
  ```

  Despite this result, `null` is a primitive.

---

## Card 3

- question  
  What is the difference between `null` and `undefined`?

- answer  
  `undefined` usually means that a value has not been assigned or does not exist. `null` is an explicit value used to represent the intentional absence of a value.

- explanation  
  JavaScript frequently produces `undefined` automatically, while developers normally assign `null` deliberately.

  ```js
  let name;          // undefined
  const user = null; // intentionally empty
  ```

- details  
  Common situations that produce `undefined` include:

  - A declared but uninitialized variable
  - A missing object property
  - A function parameter that was not provided
  - A function with no explicit return value

  ```js
  let value;
  console.log(value); // undefined

  const user = {};
  console.log(user.name); // undefined

  function greet(name) {
    console.log(name);
  }

  greet(); // undefined

  function doSomething() {}
  doSomething(); // returns undefined
  ```

  `null` is commonly used when a value is intentionally empty:

  ```js
  const state = {
    selectedUser: null
  };
  ```

  Their types behave differently:

  ```js
  typeof undefined; // "undefined"
  typeof null;      // "object"
  ```

  Loose equality considers them equal, but strict equality does not:

  ```js
  null == undefined;  // true
  null === undefined; // false
  ```

  A useful nullish check is:

  ```js
  if (value == null) {
    // Runs when value is either null or undefined
  }
  ```

  In most other comparisons, strict equality should be preferred.

---

## Card 4

- question  
  What is the difference between `==` and `===`?

- answer  
  The loose equality operator `==` compares values after performing type coercion when necessary. The strict equality operator `===` compares values without converting their types.

- explanation  
  Strict equality is more predictable and should generally be preferred:

  ```js
  5 == "5";  // true
  5 === "5"; // false
  ```

- details  
  Loose equality follows type-conversion rules that can create surprising results:

  ```js
  0 == false;          // true
  "" == false;         // true
  null == undefined;   // true
  " \t" == 0;          // true
  ```

  Strict equality requires matching types:

  ```js
  0 === false;          // false
  "" === false;         // false
  null === undefined;   // false
  ```

  `NaN` is not equal to itself with either operator:

  ```js
  NaN == NaN;  // false
  NaN === NaN; // false
  ```

  Use `Number.isNaN()` to test for it:

  ```js
  Number.isNaN(NaN); // true
  ```

  Objects are compared by identity rather than by their contents:

  ```js
  {} === {}; // false

  const user = { name: "Alex" };
  const sameUser = user;

  user === sameUser; // true
  ```

  JavaScript also provides `Object.is()`, which differs from `===` in two notable cases:

  ```js
  Object.is(NaN, NaN); // true
  Object.is(0, -0);    // false
  ```

---

## Card 5

- question  
  What are truthy and falsy values?

- answer  
  A truthy value becomes `true` when evaluated in a Boolean context. A falsy value becomes `false`.

  JavaScript’s falsy values are:

  - `false`
  - `0`
  - `-0`
  - `0n`
  - `""`
  - `null`
  - `undefined`
  - `NaN`

  Every other value is truthy.

- explanation  
  JavaScript performs Boolean coercion in conditions and logical expressions:

  ```js
  if ("hello") {
    // Runs because a non-empty string is truthy
  }
  ```

- details  
  Values that sometimes look empty can still be truthy:

  ```js
  Boolean([]);      // true
  Boolean({});      // true
  Boolean("false"); // true
  Boolean("0");     // true
  ```

  Logical operators return operands rather than always returning Boolean values:

  ```js
  "hello" && 42; // 42
  "" && 42;      // ""
  "" || "guest"; // "guest"
  ```

  The `&&` operator returns the first falsy operand or the final operand if all are truthy. The `||` operator returns the first truthy operand or the final operand if all are falsy.

  This can cause problems when `0` or an empty string is a valid value:

  ```js
  const count = 0;
  const result = count || 10;

  console.log(result); // 10
  ```

  Nullish coalescing only uses the fallback for `null` or `undefined`:

  ```js
  const result = count ?? 10;

  console.log(result); // 0
  ```

  Use `Boolean(value)` or double negation when an actual Boolean is required:

  ```js
  Boolean("hello"); // true
  !!"hello";        // true
  ```

---

## Card 6

- question  
  What is type coercion?

- answer  
  Type coercion is the conversion of a value from one data type to another. It can happen automatically through implicit coercion or intentionally through explicit conversion.

- explanation  
  JavaScript may automatically convert values when operators receive different types:

  ```js
  "5" + 2; // "52"
  "5" - 2; // 3
  ```

  Explicit conversion is usually easier to understand:

  ```js
  Number("5"); // 5
  String(5);   // "5"
  Boolean(0);  // false
  ```

- details  
  Implicit coercion depends on the operator and the values involved.

  The `+` operator performs addition when both operands are numbers. If either operand becomes a string, it performs string concatenation:

  ```js
  5 + 2;    // 7
  "5" + 2;  // "52"
  5 + "2";  // "52"
  ```

  Most other arithmetic operators attempt to convert their operands to numbers:

  ```js
  "10" - 4; // 6
  "10" * 2; // 20
  "10" / 2; // 5
  ```

  If a value cannot be converted into a valid number, the result is `NaN`:

  ```js
  Number("hello"); // NaN
  "hello" * 2;     // NaN
  ```

  Boolean coercion occurs in conditions and logical expressions:

  ```js
  Boolean("");      // false
  Boolean("false"); // true
  Boolean([]);      // true
  Boolean({});      // true
  ```

  Loose equality performs coercion before comparison, while strict equality does not:

  ```js
  5 == "5";  // true
  5 === "5"; // false
  ```

  Explicit conversion communicates intent more clearly and reduces unexpected behavior:

  ```js
  const input = "42";
  const total = Number(input) + 8;

  console.log(total); // 50
  ```

---

## Card 7

- question  
  What is hoisting?

- answer  
  Hoisting describes how JavaScript creates declarations before executing the code in a scope.

  Different declarations behave differently:

  - Function declarations are initialized with their function definitions.
  - `var` variables are initialized with `undefined`.
  - `let`, `const`, and `class` declarations remain inaccessible until their declarations execute.
  - Function expressions follow the rules of the variables that contain them.

- explanation  
  JavaScript does not physically move declarations. Hoisting describes the observable result of declarations being processed before code execution.

  ```js
  sayHello(); // Works

  function sayHello() {
    console.log("Hello");
  }
  ```

- details  
  A `var` variable can be accessed before its declaration, but its value is initially `undefined`:

  ```js
  console.log(score); // undefined
  var score = 10;
  ```

  Conceptually, the declaration is processed before execution, but the assignment remains in place:

  ```js
  var score;
  console.log(score);
  score = 10;
  ```

  `let` and `const` are also registered before execution, but accessing them early throws a `ReferenceError`:

  ```js
  console.log(age); // ReferenceError
  let age = 30;
  ```

  Function expressions are not fully initialized early:

  ```js
  greet(); // TypeError: greet is not a function

  var greet = function () {
    console.log("Hello");
  };
  ```

  With `let` or `const`, calling the function expression early produces a `ReferenceError`:

  ```js
  greet(); // ReferenceError

  const greet = function () {
    console.log("Hello");
  };
  ```

  Understanding hoisting helps explain why declaration style affects when a variable or function can be used.

---

## Card 8

- question  
  What is the temporal dead zone?

- answer  
  The temporal dead zone, or TDZ, is the period between entering a scope and executing the declaration of a `let`, `const`, or `class` binding.

  During this period, the binding belongs to the scope but has not been initialized. Accessing it throws a `ReferenceError`.

- explanation  
  The TDZ ends when JavaScript reaches the declaration:

  ```js
  console.log(count); // ReferenceError

  let count = 1;

  console.log(count); // 1
  ```

- details  
  A variable in the TDZ can also shadow a variable from an outer scope:

  ```js
  const status = "global";

  {
    console.log(status); // ReferenceError
    const status = "local";
  }
  ```

  JavaScript does not use the global `status` inside the block because the local binding belongs to that entire block. It remains inaccessible until its declaration.

  Even `typeof`, which is normally safe for undeclared variables, throws an error for a variable in the TDZ:

  ```js
  typeof unknownVariable; // "undefined"

  typeof value; // ReferenceError
  let value = 10;
  ```

  A `const` variable must be initialized at its declaration:

  ```js
  const name; // SyntaxError
  ```

  A `let` variable can be declared without an initial value. It becomes `undefined` after the declaration executes:

  ```js
  let name;
  console.log(name); // undefined
  ```

  The TDZ encourages variables to be declared before use and helps reveal initialization-order mistakes.

---

## Card 9

- question  
  What is lexical scope?

- answer  
  Lexical scope means that a variable’s accessibility is determined by where variables and functions are written in the source code.

  When JavaScript resolves a variable, it searches the current scope and then moves outward through the surrounding scopes. This sequence is called the scope chain.

- explanation  
  Inner functions can access variables from outer scopes, but outer scopes cannot access variables declared only inside inner scopes.

  ```js
  const message = "Hello";

  function greet() {
    console.log(message); // Accessible
  }
  ```

- details  
  JavaScript has several kinds of scope:

  - Global scope
  - Module scope
  - Function scope
  - Block scope

  A function retains the scope in which it was defined, regardless of where it is called:

  ```js
  const name = "Global";

  function printName() {
    console.log(name);
  }

  function run() {
    const name = "Local";
    printName();
  }

  run(); // "Global"
  ```

  `printName` was defined in the global lexical environment, so it uses the global `name`. The fact that it is called inside `run` does not change its scope.

  Nested functions can search through multiple outer scopes:

  ```js
  const globalValue = "global";

  function outer() {
    const outerValue = "outer";

    function inner() {
      const innerValue = "inner";

      console.log(innerValue);
      console.log(outerValue);
      console.log(globalValue);
    }

    inner();
  }
  ```

  Scope lookup moves outward only. `outer` cannot access `innerValue`.

  Lexical scope is also the foundation of closures because a function retains access to the environment where it was created.

---

## Card 10

- question  
  What is a closure?

- answer  
  A closure is the combination of a function and the lexical environment in which that function was created.

  It allows a function to retain access to variables from its outer scope even after the outer function has finished executing.

- explanation  
  Closures are commonly used for private state, callbacks, function factories, memoization, and partial application.

  ```js
  function createCounter() {
    let count = 0;

    return () => ++count;
  }
  ```

- details  
  The returned function continues to access `count` after `createCounter` has completed:

  ```js
  const counter = createCounter();

  counter(); // 1
  counter(); // 2
  counter(); // 3
  ```

  Each invocation of the outer function creates a separate lexical environment:

  ```js
  const firstCounter = createCounter();
  const secondCounter = createCounter();

  firstCounter();  // 1
  firstCounter();  // 2
  secondCounter(); // 1
  ```

  Closures can create private state:

  ```js
  function createAccount(initialBalance) {
    let balance = initialBalance;

    return {
      deposit(amount) {
        balance += amount;
      },
      getBalance() {
        return balance;
      }
    };
  }

  const account = createAccount(100);
  account.deposit(50);
  account.getBalance(); // 150
  ```

  The `balance` variable cannot be accessed directly from outside the returned methods.

  Closures are also created in event handlers:

  ```js
  function attachHandler(button, message) {
    button.addEventListener("click", () => {
      console.log(message);
    });
  }
  ```

  The handler retains access to `message`.

  Closures may keep referenced data in memory for as long as the closure remains reachable. Unnecessary long-lived closures can therefore contribute to memory usage.

---

## Card 11

- question  
  What is variable shadowing?

- answer  
  Variable shadowing occurs when an inner scope declares a variable with the same name as a variable in an outer scope.

  Inside the inner scope, that name resolves to the inner variable. The outer variable still exists and becomes accessible again after execution leaves the inner scope.

- explanation  
  Shadowing is valid, but excessive shadowing can make code confusing because the same name represents different values in nearby scopes.

  ```js
  const name = "Alex";

  function greet() {
    const name = "Sam";
    console.log(name); // "Sam"
  }
  ```

- details  
  Shadowing can occur in functions and blocks:

  ```js
  const status = "offline";

  {
    const status = "online";
    console.log(status); // "online"
  }

  console.log(status); // "offline"
  ```

  Function parameters can also shadow outer variables:

  ```js
  const user = "Alex";

  function greet(user) {
    console.log(user);
  }

  greet("Sam"); // "Sam"
  ```

  Not every combination of declarations is allowed. For example, a `let` variable cannot be redeclared with `var` in the same scope:

  ```js
  let count = 1;
  var count = 2; // SyntaxError
  ```

  Shadowing is different from reassignment:

  ```js
  let score = 10;

  {
    score = 20; // Reassigns the outer variable
  }

  console.log(score); // 20
  ```

  Declaring `let score = 20` inside the block would create a separate shadowing variable instead.

  Clear, specific names are usually preferable when shadowing could make the code difficult to follow.

---

## Card 12

- question  
  What is the difference between passing values by value and by reference?

- answer  
  JavaScript always passes function arguments by value.

  - For a primitive, the copied value is the primitive itself.
  - For an object, array, or function, the copied value is a reference identifying the same object.

  A function can mutate an object through the copied reference, but reassigning the parameter does not change the caller’s variable.

- explanation  
  JavaScript is accurately described as pass-by-value, including when the value being copied is an object reference.

  ```js
  function update(user) {
    user.name = "Sam";
    user = { name: "Lee" };
  }
  ```

- details  
  Reassigning a primitive parameter does not affect the original variable:

  ```js
  function change(value) {
    value = 20;
  }

  let score = 10;
  change(score);

  console.log(score); // 10
  ```

  The function receives its own copy of the number.

  With an object, the parameter and the caller’s variable initially contain copies of the same reference:

  ```js
  function update(user) {
    user.name = "Sam";
  }

  const person = { name: "Alex" };
  update(person);

  console.log(person.name); // "Sam"
  ```

  Both references identify the same object, so mutation is visible to the caller.

  Reassigning the parameter only replaces the function’s local reference:

  ```js
  function replace(user) {
    user = { name: "Lee" };
  }

  const person = { name: "Alex" };
  replace(person);

  console.log(person.name); // "Alex"
  ```

  This distinction also applies to arrays:

  ```js
  function addItem(items) {
    items.push("new"); // Mutates the original array
  }

  function replaceItems(items) {
    items = []; // Reassigns only the local parameter
  }
  ```

  To avoid unwanted mutation, create a new object or array:

  ```js
  function rename(user, name) {
    return { ...user, name };
  }
  ```

---

## Card 13

- question  
  How do shallow and deep copies differ?

- answer  
  A shallow copy creates a new top-level object or array but reuses references to nested objects. A deep copy creates independent copies of nested data as well.

  Modifying a nested value in a shallow copy may affect the original. Modifying a deep copy does not.

- explanation  
  Spread syntax, `Object.assign()`, `Array.from()`, and `slice()` create shallow copies. `structuredClone()` can deeply copy many supported values.

  ```js
  const copy = { ...original };
  ```

- details  
  A shallow copy duplicates only the first level:

  ```js
  const original = {
    name: "Alex",
    settings: {
      theme: "light"
    }
  };

  const copy = { ...original };

  copy.name = "Sam";
  copy.settings.theme = "dark";

  console.log(original.name);           // "Alex"
  console.log(original.settings.theme); // "dark"
  ```

  `name` is independent because it is a primitive top-level property. The nested `settings` object remains shared.

  `structuredClone()` creates a deep copy:

  ```js
  const deepCopy = structuredClone(original);

  deepCopy.settings.theme = "blue";

  console.log(original.settings.theme); // "dark"
  ```

  It supports many types, including:

  - Objects and arrays
  - `Date`
  - `Map` and `Set`
  - Typed arrays
  - Circular references

  It cannot clone every value. Functions, DOM nodes, and some platform-specific objects are not supported.

  Converting through JSON is sometimes used as a simple deep-copy technique:

  ```js
  const copy = JSON.parse(JSON.stringify(original));
  ```

  However, this approach loses or changes unsupported data such as `undefined`, functions, symbols, `Date`, `Map`, `Set`, `BigInt`, and circular references. It should not be treated as a general-purpose cloning solution.

---

## Card 14

- question  
  What is destructuring?

- answer  
  Destructuring is syntax that extracts values from arrays or properties from objects and assigns them to variables.

  Object destructuring matches values by property name, while array destructuring matches values by position.

- explanation  
  Destructuring provides a concise way to access selected data:

  ```js
  const user = { name: "Alex", age: 30 };
  const { name, age } = user;

  const colors = ["red", "blue"];
  const [primary, secondary] = colors;
  ```

- details  
  Object properties can be renamed:

  ```js
  const user = { name: "Alex" };
  const { name: displayName } = user;

  console.log(displayName); // "Alex"
  ```

  Default values are used when the extracted value is `undefined`:

  ```js
  const user = {};
  const { role = "guest" } = user;

  console.log(role); // "guest"
  ```

  A default does not replace `null`:

  ```js
  const user = { role: null };
  const { role = "guest" } = user;

  console.log(role); // null
  ```

  Array elements can be skipped:

  ```js
  const colors = ["red", "green", "blue"];
  const [primary, , tertiary] = colors;

  console.log(tertiary); // "blue"
  ```

  Nested values can be destructured:

  ```js
  const user = {
    profile: {
      email: "alex@example.com"
    }
  };

  const {
    profile: { email }
  } = user;
  ```

  Rest syntax collects the remaining values:

  ```js
  const [first, ...remaining] = [1, 2, 3, 4];
  // first: 1
  // remaining: [2, 3, 4]
  ```

  Destructuring is also useful in function parameters:

  ```js
  function printUser({ name, role = "guest" }) {
    console.log(`${name}: ${role}`);
  }
  ```

  Nested destructuring can throw an error if an expected parent value is missing, so defaults or optional access may be necessary when working with uncertain data.

---

## Card 15

- question  
  What are rest and spread syntax, and how do they differ?

- answer  
  Rest and spread both use `...`, but they perform opposite operations:

  - Spread expands an iterable or object into individual values or properties.
  - Rest collects multiple remaining values or properties into a new array or object.

  Their meaning is determined by where the syntax appears.

- explanation  
  Spread expands values, while rest collects them:

  ```js
  const numbers = [1, 2, 3];
  const copy = [...numbers]; // Spread

  function sum(...values) {  // Rest
    return values.reduce((total, value) => total + value, 0);
  }
  ```

- details  
  Array spread can copy or combine arrays:

  ```js
  const first = [1, 2];
  const second = [3, 4];

  const combined = [...first, ...second];
  // [1, 2, 3, 4]
  ```

  Function-call spread passes iterable values as separate arguments:

  ```js
  const numbers = [4, 8, 2];

  Math.max(...numbers); // 8
  ```

  Object spread copies enumerable own properties:

  ```js
  const defaults = {
    theme: "light",
    language: "en"
  };

  const settings = {
    ...defaults,
    theme: "dark"
  };
  ```

  Later properties override earlier properties, so `settings.theme` becomes `"dark"`.

  Rest parameters collect arguments into a real array:

  ```js
  function average(...numbers) {
    const total = numbers.reduce(
      (sum, number) => sum + number,
      0
    );

    return total / numbers.length;
  }
  ```

  Rest syntax can collect remaining destructured values:

  ```js
  const user = {
    id: 1,
    name: "Alex",
    role: "admin"
  };

  const { id, ...details } = user;
  ```

  Spread creates shallow copies. Nested objects remain shared:

  ```js
  const original = {
    settings: { dark: false }
  };

  const copy = { ...original };
  copy.settings.dark = true;

  console.log(original.settings.dark); // true
  ```

---

## Card 16

- question  
  What are template literals?

- answer  
  Template literals are strings enclosed by backticks.

  They support:

  - Expression interpolation with `${expression}`
  - Multiline strings
  - Tagged templates that process the literal through a function

- explanation  
  Template literals make dynamic strings more readable:

  ```js
  const name = "Alex";
  const message = `Hello, ${name}!`;
  ```

- details  
  Any valid expression can appear inside `${...}`:

  ```js
  const price = 20;
  const quantity = 3;

  const message = `Total: $${price * quantity}`;
  // "Total: $60"
  ```

  Properties and function calls can also be interpolated:

  ```js
  const user = { name: "Alex" };

  const text = `Welcome, ${user.name.toUpperCase()}!`;
  ```

  Template literals can span multiple lines:

  ```js
  const content = `First line
  Second line
  Third line`;
  ```

  Tagged templates pass the literal’s static strings and evaluated expressions to a function:

  ```js
  function inspect(strings, ...values) {
    console.log(strings);
    console.log(values);
  }

  const name = "Alex";
  const count = 3;

  inspect`${name} has ${count} messages`;
  ```

  Tagged templates can be used for escaping content, localization, formatting, or domain-specific syntax.

  Interpolation does not automatically make untrusted content safe. When inserting user-controlled values into HTML, developers must still use appropriate escaping or safe DOM APIs to prevent cross-site scripting.

---

## Card 17

- question  
  What are JavaScript modules, and how do `import` and `export` work?

- answer  
  JavaScript modules divide an application into separate files with explicit dependencies and their own top-level scope.

  `export` exposes values from a module, and `import` makes those values available in another module.

  A module may have multiple named exports but only one default export.

- explanation  
  Modules improve code organization, reuse, dependency management, and encapsulation.

  ```js
  // math.js
  export const add = (a, b) => a + b;

  // app.js
  import { add } from "./math.js";
  ```

- details  
  Named exports use the exported names:

  ```js
  // math.js
  export const add = (a, b) => a + b;
  export const subtract = (a, b) => a - b;
  ```

  They are imported with braces:

  ```js
  import { add, subtract } from "./math.js";
  ```

  A named import can be aliased:

  ```js
  import { add as sum } from "./math.js";
  ```

  A default export can be imported using any local name:

  ```js
  // logger.js
  export default function log(message) {
    console.log(message);
  }
  ```

  ```js
  import writeLog from "./logger.js";
  ```

  Named and default imports can be combined:

  ```js
  // math.js
  export default function multiply(a, b) {
    return a * b;
  }

  export const add = (a, b) => a + b;
  ```

  ```js
  import multiply, { add } from "./math.js";
  ```

  Static imports are resolved before the module executes and normally appear at the top level. Dynamic `import()` loads a module asynchronously:

  ```js
  const module = await import("./analytics.js");
  module.trackPageView();
  ```

  Dynamic imports are useful for conditional loading and code splitting.

  Imported bindings are live bindings. If the exporting module updates an exported variable, importing modules observe its current value:

  ```js
  // counter.js
  export let count = 0;

  export function increment() {
    count++;
  }
  ```

  Modules are evaluated once, and repeated imports reuse the same module instance.

  In browsers, modules are loaded with:

  ```html
  <script type="module" src="./app.js"></script>
  ```

  Browser modules use strict mode automatically, have their own scope, and are deferred by default.

  # Functions and Objects Interview Cards

## Card 18

- question  
  What is the difference between a function declaration and a function expression?

- answer  
  A function declaration defines a named function as a standalone statement. A function expression creates a function as part of an expression and usually assigns it to a variable.

  Function declarations are fully initialized during hoisting. Function expressions follow the initialization rules of the variables that contain them.

- explanation  
  A function declaration can be called before it appears in the code. A function expression normally cannot.

  ```js
  greet(); // Works

  function greet() {
    console.log("Hello");
  }
  ```

- details  
  A function declaration uses this syntax:

  ```js
  function add(a, b) {
    return a + b;
  }
  ```

  A function expression can be anonymous:

  ```js
  const add = function (a, b) {
    return a + b;
  };
  ```

  It can also have an internal name:

  ```js
  const calculate = function add(a, b) {
    return a + b;
  };
  ```

  When a function expression is stored in `const`, the variable is in the temporal dead zone before its declaration:

  ```js
  greet(); // ReferenceError

  const greet = function () {
    console.log("Hello");
  };
  ```

  With `var`, the variable is initialized with `undefined`, so calling it early produces a `TypeError`:

  ```js
  greet(); // TypeError: greet is not a function

  var greet = function () {
    console.log("Hello");
  };
  ```

  Function expressions are useful when functions are passed as values, used as callbacks, or created conditionally.

---

## Card 19

- question  
  How do arrow functions differ from regular functions?

- answer  
  Arrow functions provide shorter syntax and do not create their own `this`, `arguments`, `super`, or `new.target`.

  Their `this` value is inherited lexically from the surrounding scope. Arrow functions also cannot be used as constructors and do not have a `prototype` property for constructing instances.

- explanation  
  Arrow functions are useful for callbacks and functions that should preserve the surrounding `this`. Regular functions are usually more appropriate for object methods and constructors.

  ```js
  const double = number => number * 2;
  ```

- details  
  Arrow functions can use an implicit return when the body contains one expression:

  ```js
  const add = (a, b) => a + b;
  ```

  Curly braces require an explicit `return`:

  ```js
  const add = (a, b) => {
    return a + b;
  };
  ```

  Returning an object implicitly requires parentheses:

  ```js
  const createUser = name => ({ name });
  ```

  Arrow functions inherit `this` from their surrounding scope:

  ```js
  const timer = {
    seconds: 0,

    start() {
      setInterval(() => {
        this.seconds++;
      }, 1000);
    }
  };
  ```

  The callback uses the same `this` as `start`.

  An arrow function is usually unsuitable as an object method when dynamic `this` is required:

  ```js
  const user = {
    name: "Alex",
    greet: () => {
      console.log(this.name);
    }
  };
  ```

  The arrow function does not receive `user` as its `this`.

  Arrow functions cannot be called with `new`:

  ```js
  const User = name => {
    this.name = name;
  };

  new User("Alex"); // TypeError
  ```

  They also do not have their own `arguments` object. Rest parameters should be used instead:

  ```js
  const sum = (...numbers) =>
    numbers.reduce((total, number) => total + number, 0);
  ```

---

## Card 20

- question  
  How does the `this` keyword work?

- answer  
  In a regular function, `this` is usually determined by how the function is called, not where it is defined.

  Its value can come from:

  - A method call
  - A constructor call with `new`
  - An explicit call using `call`, `apply`, or `bind`
  - The default function-calling rule
  - The surrounding lexical scope for an arrow function

- explanation  
  When a function is called as an object method, `this` normally refers to the object before the dot.

  ```js
  const user = {
    name: "Alex",
    greet() {
      console.log(this.name);
    }
  };

  user.greet(); // "Alex"
  ```

- details  
  A standalone function call uses the default binding:

  ```js
  "use strict";

  function showThis() {
    console.log(this);
  }

  showThis(); // undefined
  ```

  In older non-strict browser scripts, the default value may be the global object.

  A method can lose its receiver when it is separated from its object:

  ```js
  const greet = user.greet;
  greet(); // `this` is no longer `user`
  ```

  Explicit binding can provide a value:

  ```js
  greet.call(user); // "Alex"
  ```

  Constructor calls create a new object and bind it to `this`:

  ```js
  function User(name) {
    this.name = name;
  }

  const user = new User("Alex");
  ```

  Arrow functions do not create their own `this`:

  ```js
  const user = {
    name: "Alex",

    delayedGreeting() {
      setTimeout(() => {
        console.log(this.name);
      }, 100);
    }
  };
  ```

  Binding precedence is generally:

  1. Constructor binding with `new`
  2. Explicit binding with `bind`, `call`, or `apply`
  3. Method binding
  4. Default binding

  A function created by `bind` keeps its bound `this`, although calling that bound function with `new` uses the newly created instance.

---

## Card 21

- question  
  What do `call`, `apply`, and `bind` do?

- answer  
  `call`, `apply`, and `bind` let developers control the `this` value used by a regular function.

  - `call` invokes the function immediately with arguments listed separately.
  - `apply` invokes the function immediately with arguments provided as an array or array-like value.
  - `bind` returns a new function with a fixed `this` value and optional preset arguments.

- explanation  
  `call` and `apply` execute a function immediately. `bind` creates a function that can be executed later.

  ```js
  greet.call(user, "Hello");
  greet.apply(user, ["Hello"]);
  const boundGreet = greet.bind(user);
  ```

- details  
  Consider this function:

  ```js
  function introduce(greeting, punctuation) {
    return `${greeting}, I am ${this.name}${punctuation}`;
  }

  const user = { name: "Alex" };
  ```

  `call` accepts individual arguments:

  ```js
  introduce.call(user, "Hello", "!");
  // "Hello, I am Alex!"
  ```

  `apply` accepts them as a collection:

  ```js
  introduce.apply(user, ["Hello", "!"]);
  // "Hello, I am Alex!"
  ```

  `bind` creates a new function:

  ```js
  const introduceAlex = introduce.bind(user);

  introduceAlex("Hello", "!");
  // "Hello, I am Alex!"
  ```

  `bind` can also preset arguments, which is called partial application:

  ```js
  const sayHelloToAlex = introduce.bind(
    user,
    "Hello"
  );

  sayHelloToAlex("!");
  ```

  These methods cannot replace the lexical `this` of an arrow function:

  ```js
  const showThis = () => this;

  showThis.call(user); // Does not change arrow `this`
  ```

---

## Card 22

- question  
  What is a higher-order function?

- answer  
  A higher-order function is a function that accepts one or more functions as arguments, returns a function, or does both.

  Higher-order functions support composition and abstraction by allowing behavior to be treated as data.

- explanation  
  Common array methods such as `map`, `filter`, and `reduce` are higher-order functions because they receive callback functions.

  ```js
  const doubled = [1, 2, 3].map(
    number => number * 2
  );
  ```

- details  
  A function that receives another function is higher-order:

  ```js
  function repeat(times, action) {
    for (let index = 0; index < times; index++) {
      action(index);
    }
  }

  repeat(3, index => {
    console.log(index);
  });
  ```

  A function that returns a function is also higher-order:

  ```js
  function multiplyBy(multiplier) {
    return number => number * multiplier;
  }

  const double = multiplyBy(2);
  const triple = multiplyBy(3);

  double(5); // 10
  triple(5); // 15
  ```

  Higher-order functions can separate reusable control flow from changing behavior:

  ```js
  function withLogging(action) {
    return (...argumentsList) => {
      console.log("Starting");
      const result = action(...argumentsList);
      console.log("Finished");
      return result;
    };
  }
  ```

  This pattern is useful for validation, authorization, caching, logging, retries, and event handling.

---

## Card 23

- question  
  What is a callback function?

- answer  
  A callback is a function passed to another function so that the receiving function can execute it at an appropriate time.

  Callbacks may run synchronously, such as callbacks passed to `map`, or asynchronously, such as event handlers and timer callbacks.

- explanation  
  A callback allows one function to receive customizable behavior.

  ```js
  function processUser(user, callback) {
    callback(user);
  }

  processUser({ name: "Alex" }, user => {
    console.log(user.name);
  });
  ```

- details  
  Synchronous callbacks execute before the surrounding function returns:

  ```js
  const numbers = [1, 2, 3];

  const doubled = numbers.map(number => {
    return number * 2;
  });
  ```

  Asynchronous callbacks execute later:

  ```js
  setTimeout(() => {
    console.log("Executed later");
  }, 1000);
  ```

  Event listeners also use callbacks:

  ```js
  button.addEventListener("click", event => {
    console.log(event.target);
  });
  ```

  Traditional asynchronous code can become deeply nested:

  ```js
  getUser(userId, user => {
    getOrders(user.id, orders => {
      getOrderDetails(orders[0].id, details => {
        console.log(details);
      });
    });
  });
  ```

  This is often called callback hell. Promises and `async`/`await` make many asynchronous workflows easier to compose and handle.

  Error-first callbacks are common in older Node.js APIs:

  ```js
  operation((error, result) => {
    if (error) {
      console.error(error);
      return;
    }

    console.log(result);
  });
  ```

---

## Card 24

- question  
  What are pure functions and side effects?

- answer  
  A pure function always returns the same output for the same inputs and does not modify or depend on external mutable state.

  A side effect is any observable interaction with something outside the function’s returned value.

- explanation  
  Pure functions are easier to test, reuse, cache, and reason about.

  ```js
  function add(a, b) {
    return a + b;
  }
  ```

- details  
  Common side effects include:

  - Modifying an external variable
  - Mutating an argument
  - Updating the DOM
  - Writing to storage
  - Sending a network request
  - Logging to the console
  - Reading the current time
  - Generating a random value

  This function is impure because it changes external state:

  ```js
  let total = 0;

  function addToTotal(amount) {
    total += amount;
    return total;
  }
  ```

  This version is pure:

  ```js
  function addToTotal(total, amount) {
    return total + amount;
  }
  ```

  Mutation can also make a function impure:

  ```js
  function addUser(users, user) {
    users.push(user);
    return users;
  }
  ```

  A non-mutating version returns a new array:

  ```js
  function addUser(users, user) {
    return [...users, user];
  }
  ```

  Real applications require side effects. The goal is usually to isolate them from pure business logic rather than eliminate them entirely.

  For example, data transformation can remain pure while a separate function handles the network request or DOM update.

---

## Card 25

- question  
  What is an immediately invoked function expression (IIFE)?

- answer  
  An IIFE is a function expression that executes immediately after it is created.

  It was traditionally used to create a private scope and prevent variables from leaking into the global scope.

- explanation  
  Parentheses turn the function declaration-like syntax into an expression, and the final parentheses invoke it.

  ```js
  (function () {
    const message = "Private";
    console.log(message);
  })();
  ```

- details  
  An arrow function can also be used:

  ```js
  (() => {
    const value = 42;
    console.log(value);
  })();
  ```

  An IIFE can return a value:

  ```js
  const result = (() => {
    const first = 10;
    const second = 20;

    return first + second;
  })();

  console.log(result); // 30
  ```

  IIFEs were commonly used in the module pattern:

  ```js
  const counter = (() => {
    let count = 0;

    return {
      increment() {
        count++;
      },
      getCount() {
        return count;
      }
    };
  })();
  ```

  The `count` variable remains private.

  Modern JavaScript modules and block-scoped variables have reduced the need for IIFEs. However, they can still be useful for one-time initialization or creating an isolated scope in older code.

  An async IIFE allows `await` in environments where top-level `await` is unavailable:

  ```js
  (async () => {
    const response = await fetch("/api/users");
    const users = await response.json();

    console.log(users);
  })();
  ```

---

## Card 26

- question  
  How do default parameters work?

- answer  
  Default parameters provide fallback values for function parameters when the corresponding argument is missing or explicitly set to `undefined`.

  The default expression is evaluated when the function is called, not when it is defined.

- explanation  
  A default value is not used when the argument is `null`, `false`, `0`, or an empty string.

  ```js
  function greet(name = "Guest") {
    return `Hello, ${name}`;
  }

  greet();          // "Hello, Guest"
  greet(undefined); // "Hello, Guest"
  greet(null);      // "Hello, null"
  ```

- details  
  Default expressions can reference earlier parameters:

  ```js
  function createRange(start, end = start + 10) {
    return { start, end };
  }

  createRange(5); // { start: 5, end: 15 }
  ```

  A later parameter cannot safely be referenced before it has been initialized:

  ```js
  function example(first = second, second = 2) {
    return first + second;
  }

  example(); // ReferenceError
  ```

  Default expressions can call functions:

  ```js
  function generateId() {
    return crypto.randomUUID();
  }

  function createUser(name, id = generateId()) {
    return { name, id };
  }
  ```

  `generateId()` runs each time the default is needed.

  Destructured parameters can have defaults:

  ```js
  function configure({
    theme = "light",
    language = "en"
  } = {}) {
    return { theme, language };
  }

  configure(); // Works because the object defaults to {}
  ```

  Without `= {}`, calling `configure()` would attempt to destructure `undefined` and throw an error.

---

## Card 27

- question  
  How do JavaScript objects inherit properties?

- answer  
  JavaScript objects inherit properties and methods through prototypes.

  Every ordinary object has an internal prototype link to another object or to `null`. When a property is not found directly on an object, JavaScript follows this link through the prototype chain.

- explanation  
  Inheritance allows multiple objects to share behavior without copying the same methods onto every instance.

  ```js
  const animal = {
    speak() {
      console.log("Sound");
    }
  };

  const dog = Object.create(animal);
  dog.speak();
  ```

- details  
  An object can have both own properties and inherited properties:

  ```js
  const animal = {
    type: "animal"
  };

  const dog = Object.create(animal);
  dog.name = "Rex";

  dog.name; // Own property
  dog.type; // Inherited property
  ```

  `Object.hasOwn()` checks whether a property belongs directly to the object:

  ```js
  Object.hasOwn(dog, "name"); // true
  Object.hasOwn(dog, "type"); // false
  ```

  Constructor functions typically place shared methods on their `prototype` object:

  ```js
  function User(name) {
    this.name = name;
  }

  User.prototype.greet = function () {
    return `Hello, ${this.name}`;
  };

  const user = new User("Alex");
  user.greet();
  ```

  The `new` operator creates an object whose prototype points to `User.prototype`.

  Classes use the same prototype-based mechanism:

  ```js
  class User {
    constructor(name) {
      this.name = name;
    }

    greet() {
      return `Hello, ${this.name}`;
    }
  }
  ```

  Class syntax makes the pattern more readable but does not replace prototype-based inheritance with a separate inheritance model.

---

## Card 28

- question  
  What is the prototype chain?

- answer  
  The prototype chain is the sequence of objects JavaScript searches when resolving a property.

  JavaScript first checks the object itself. If the property is not found, it checks the object’s prototype and continues upward until it finds the property or reaches `null`.

- explanation  
  The prototype chain enables inherited properties and shared methods.

  ```js
  const user = {};
  user.toString();
  ```

  `toString` is found through `Object.prototype`.

- details  
  Consider an array:

  ```js
  const numbers = [1, 2, 3];
  ```

  A simplified version of its prototype chain is:

  ```text
  numbers
    → Array.prototype
    → Object.prototype
    → null
  ```

  `numbers.map` is found on `Array.prototype`, while `numbers.toString` can ultimately be found through the chain.

  An own property shadows an inherited property with the same name:

  ```js
  const parent = {
    role: "parent"
  };

  const child = Object.create(parent);
  child.role = "child";

  console.log(child.role); // "child"
  ```

  The prototype can be inspected using:

  ```js
  Object.getPrototypeOf(child);
  ```

  An object without `Object.prototype` can be created with:

  ```js
  const dictionary = Object.create(null);
  ```

  This object does not inherit methods such as `toString` or `hasOwnProperty`.

  Directly changing prototypes with `Object.setPrototypeOf()` can harm performance. Prototypes are usually established when objects are created through classes, constructor functions, object literals, or `Object.create()`.

---

## Card 29

- question  
  What is the difference between a class and a constructor function?

- answer  
  Classes and constructor functions can both create objects that share methods through prototypes.

  JavaScript classes provide clearer syntax for constructors, instance methods, static methods, inheritance, and private fields. Internally, they still use prototype-based inheritance.

- explanation  
  Classes are primarily a more structured syntax over JavaScript’s existing constructor and prototype mechanisms.

  ```js
  class User {
    constructor(name) {
      this.name = name;
    }

    greet() {
      return `Hello, ${this.name}`;
    }
  }
  ```

- details  
  The constructor-function equivalent is:

  ```js
  function User(name) {
    this.name = name;
  }

  User.prototype.greet = function () {
    return `Hello, ${this.name}`;
  };
  ```

  Both versions allow this:

  ```js
  const user = new User("Alex");
  user.greet();
  ```

  Important differences include:

  - Class declarations are in the temporal dead zone.
  - Class constructors must be called with `new`.
  - Class bodies run in strict mode.
  - Class methods are non-enumerable.
  - Classes support `extends`, `super`, static members, and private fields with concise syntax.

  Calling a class without `new` throws an error:

  ```js
  User("Alex"); // TypeError
  ```

  A traditional constructor function may be called without `new`, although doing so is usually a bug.

  Classes support private fields:

  ```js
  class Account {
    #balance = 0;

    deposit(amount) {
      this.#balance += amount;
    }

    getBalance() {
      return this.#balance;
    }
  }
  ```

  Private fields cannot be accessed directly outside the class.

---

## Card 30

- question  
  What is the difference between static and instance methods?

- answer  
  An instance method is called on an object created by a class and can access that instance through `this`.

  A static method belongs to the class itself rather than to individual instances. It is called using the class name.

- explanation  
  Instance methods operate on instance-specific data. Static methods usually provide utilities or class-level behavior.

  ```js
  class User {
    greet() {
      return "Hello";
    }

    static createGuest() {
      return new User();
    }
  }
  ```

- details  
  Instance methods are stored on the class prototype:

  ```js
  class User {
    constructor(name) {
      this.name = name;
    }

    greet() {
      return `Hello, ${this.name}`;
    }
  }

  const user = new User("Alex");
  user.greet();
  ```

  The instance method is shared rather than recreated for every instance:

  ```js
  user.greet === User.prototype.greet; // true
  ```

  Static methods are called on the class:

  ```js
  class User {
    static fromJSON(json) {
      const data = JSON.parse(json);
      return new User(data.name);
    }

    constructor(name) {
      this.name = name;
    }
  }

  const user = User.fromJSON('{"name":"Alex"}');
  ```

  An instance does not inherit static methods:

  ```js
  user.fromJSON(); // TypeError
  ```

  Inside a static method, `this` normally refers to the class on which the method was called:

  ```js
  class Base {
    static create() {
      return new this();
    }
  }

  class Child extends Base {}

  Child.create(); // Creates a Child instance
  ```

  Static properties are also useful for class-level constants or shared state, although shared mutable state should be used carefully.

---

## Card 31

- question  
  What are getters and setters?

- answer  
  Getters and setters are methods that control how an object property is read or assigned while allowing it to be used with ordinary property syntax.

  A getter runs when the property is read. A setter runs when a value is assigned to the property.

- explanation  
  Getters can compute values, while setters can validate or normalize assignments.

  ```js
  const user = {
    firstName: "Alex",
    lastName: "Smith",

    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    }
  };
  ```

- details  
  The getter is accessed like a property, not called like a method:

  ```js
  user.fullName; // "Alex Smith"
  ```

  A setter can validate data:

  ```js
  class Temperature {
    #celsius = 0;

    get celsius() {
      return this.#celsius;
    }

    set celsius(value) {
      if (!Number.isFinite(value)) {
        throw new TypeError("Temperature must be a number");
      }

      this.#celsius = value;
    }
  }
  ```

  It is used with assignment syntax:

  ```js
  const temperature = new Temperature();

  temperature.celsius = 25;
  console.log(temperature.celsius); // 25
  ```

  A getter can expose a derived value:

  ```js
  class Rectangle {
    constructor(width, height) {
      this.width = width;
      this.height = height;
    }

    get area() {
      return this.width * this.height;
    }
  }
  ```

  Getters should generally avoid surprising side effects because property access looks like a simple read.

  Setters accept exactly one parameter. If only a getter is defined, the property is read-only through that accessor.

  Accessors can be defined in object literals, classes, or with `Object.defineProperty()`.

---

## Card 32

- question  
  What is the difference between mutable and immutable operations?

- answer  
  A mutable operation changes an existing object or array. An immutable operation creates and returns a new value without changing the original.

  JavaScript primitives are immutable, but objects and arrays are mutable by default.

- explanation  
  Immutable updates make state changes easier to track and are especially useful in frontend state management.

  ```js
  const original = [1, 2];
  const updated = [...original, 3];
  ```

- details  
  Common mutating array methods include:

  - `push`
  - `pop`
  - `shift`
  - `unshift`
  - `splice`
  - `sort`
  - `reverse`
  - `fill`

  ```js
  const numbers = [3, 1, 2];
  numbers.sort();

  console.log(numbers); // [1, 2, 3]
  ```

  Common non-mutating array methods include:

  - `map`
  - `filter`
  - `slice`
  - `concat`
  - `toSorted`
  - `toReversed`
  - `toSpliced`

  ```js
  const numbers = [3, 1, 2];
  const sorted = numbers.toSorted();

  console.log(numbers); // [3, 1, 2]
  console.log(sorted);  // [1, 2, 3]
  ```

  Objects can be updated immutably with spread syntax:

  ```js
  const user = {
    name: "Alex",
    role: "user"
  };

  const updatedUser = {
    ...user,
    role: "admin"
  };
  ```

  Nested updates require copying every changed level:

  ```js
  const state = {
    user: {
      settings: {
        theme: "light"
      }
    }
  };

  const updatedState = {
    ...state,
    user: {
      ...state.user,
      settings: {
        ...state.user.settings,
        theme: "dark"
      }
    }
  };
  ```

  `const` does not make an object immutable:

  ```js
  const user = { name: "Alex" };
  user.name = "Sam"; // Allowed
  ```

  `Object.freeze()` prevents direct changes to an object’s own properties, but it is shallow:

  ```js
  const settings = Object.freeze({
    nested: {
      theme: "light"
    }
  });

  settings.nested.theme = "dark"; // Nested object is not frozen
  ```

  Immutability can improve predictability, change detection, undo functionality, memoization, and debugging. However, copying large structures also has a performance and memory cost, so the appropriate strategy depends on the application.

  # Arrays and Collections Interview Cards

## Card 33

- question  
  What is the difference between `map`, `filter`, and `reduce`?

- answer  
  `map`, `filter`, and `reduce` iterate over arrays without modifying the original array by themselves.

  - `map` transforms every element and returns an array of the same length.
  - `filter` keeps elements that pass a condition and returns an array of equal or shorter length.
  - `reduce` combines all elements into a single accumulated result.

- explanation  
  Choose the method based on the desired result:

  ```js
  const numbers = [1, 2, 3, 4];

  numbers.map(number => number * 2);
  // [2, 4, 6, 8]

  numbers.filter(number => number % 2 === 0);
  // [2, 4]

  numbers.reduce((sum, number) => sum + number, 0);
  // 10
  ```

- details  
  `map` calls its callback for every existing element and stores each returned value:

  ```js
  const users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "Sam" }
  ];

  const names = users.map(user => user.name);
  // ["Alex", "Sam"]
  ```

  `filter` includes an element when the callback returns a truthy value:

  ```js
  const activeUsers = users.filter(user => user.active);
  ```

  `reduce` receives an accumulator, the current value, the current index, and the original array:

  ```js
  const total = numbers.reduce(
    (accumulator, number) => accumulator + number,
    0
  );
  ```

  The second argument is the accumulator’s initial value. Providing it is generally safer:

  ```js
  [].reduce((sum, number) => sum + number);
  // TypeError

  [].reduce((sum, number) => sum + number, 0);
  // 0
  ```

  `reduce` can build arrays, objects, maps, or other structures:

  ```js
  const grouped = users.reduce((groups, user) => {
    const role = user.role;
    groups[role] ??= [];
    groups[role].push(user);
    return groups;
  }, {});
  ```

  Although these methods do not mutate the source array directly, their callbacks can still mutate objects contained in the array. Avoid such side effects when predictable transformations are important.

---

## Card 34

- question  
  What is the difference between `forEach` and `map`?

- answer  
  Both methods execute a callback for each array element.

  - `map` returns a new array containing the callback’s return values.
  - `forEach` returns `undefined` and is intended for side effects.

- explanation  
  Use `map` to transform data. Use `forEach` when performing an action such as logging, updating the DOM, or modifying external state.

  ```js
  const numbers = [1, 2, 3];

  const doubled = numbers.map(number => number * 2);
  // [2, 4, 6]

  numbers.forEach(number => console.log(number));
  ```

- details  
  Returning a value from a `forEach` callback does not create a result array:

  ```js
  const result = [1, 2, 3].forEach(number => {
    return number * 2;
  });

  console.log(result); // undefined
  ```

  Both methods receive the same callback arguments:

  ```js
  array.map((element, index, originalArray) => {
    // ...
  });

  array.forEach((element, index, originalArray) => {
    // ...
  });
  ```

  Neither method supports early termination with `break` or `return`:

  ```js
  [1, 2, 3].forEach(number => {
    if (number === 2) {
      return; // Skips only the rest of this callback
    }
  });
  ```

  Use `for...of`, `find`, `some`, or `every` when early termination is required.

  Avoid using `forEach` directly with asynchronous callbacks when the operations must be awaited:

  ```js
  // Does not wait for all callbacks to finish
  users.forEach(async user => {
    await saveUser(user);
  });
  ```

  Sequential processing can use `for...of`:

  ```js
  for (const user of users) {
    await saveUser(user);
  }
  ```

  Parallel processing can use `map` with `Promise.all`:

  ```js
  await Promise.all(
    users.map(user => saveUser(user))
  );
  ```

---

## Card 35

- question  
  What is the difference between `find` and `filter`?

- answer  
  Both methods test array elements using a callback.

  - `find` returns the first matching element and stops searching.
  - `filter` returns a new array containing every matching element.

  If no element matches, `find` returns `undefined`, while `filter` returns an empty array.

- explanation  
  Use `find` when expecting one result and `filter` when collecting multiple results.

  ```js
  const numbers = [1, 2, 3, 4];

  numbers.find(number => number > 2);
  // 3

  numbers.filter(number => number > 2);
  // [3, 4]
  ```

- details  
  `find` returns the element itself, not its index:

  ```js
  const users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "Sam" }
  ];

  const user = users.find(user => user.id === 2);
  // { id: 2, name: "Sam" }
  ```

  Use `findIndex` when the position is needed:

  ```js
  const index = users.findIndex(user => user.id === 2);
  // 1
  ```

  Newer JavaScript also provides `findLast` and `findLastIndex` for searching from the end:

  ```js
  const values = [1, 4, 2, 4];

  values.findLast(value => value === 4);      // 4
  values.findLastIndex(value => value === 4); // 3
  ```

  `filter` always returns a new array, even when nothing matches:

  ```js
  const matches = users.filter(user => user.id === 99);

  console.log(matches); // []
  console.log(Boolean(matches)); // true
  ```

  Because an empty array is truthy, check its length when determining whether results exist:

  ```js
  if (matches.length === 0) {
    console.log("No users found");
  }
  ```

---

## Card 36

- question  
  What is the difference between `some` and `every`?

- answer  
  `some` and `every` test array elements and return Boolean values.

  - `some` returns `true` when at least one element passes the test.
  - `every` returns `true` only when all elements pass the test.

  Both methods stop as soon as the final result is known.

- explanation  
  `some` answers “Does any element match?” while `every` answers “Do all elements match?”

  ```js
  const numbers = [2, 4, 5];

  numbers.some(number => number % 2 !== 0);
  // true

  numbers.every(number => number > 0);
  // true
  ```

- details  
  `some` stops after finding the first truthy callback result:

  ```js
  const hasAdmin = users.some(user => {
    return user.role === "admin";
  });
  ```

  `every` stops after finding the first falsy result:

  ```js
  const allActive = users.every(user => {
    return user.active;
  });
  ```

  Their results for an empty array are important:

  ```js
  [].some(() => true);  // false
  [].every(() => false); // true
  ```

  `some` returns `false` because no element satisfies the condition. `every` returns `true` because no element violates the condition. This is known as vacuous truth.

  `some` can be used as an existence check:

  ```js
  const hasPermission = permissions.some(
    permission => permission === "edit"
  );
  ```

  `every` is useful for validation:

  ```js
  const formIsValid = fields.every(field => {
    return field.value.trim() !== "";
  });
  ```

  Because both short-circuit, they may be more efficient than `filter` when only a Boolean result is required.

---

## Card 37

- question  
  Which array methods mutate the original array?

- answer  
  Common mutating array methods include:

  - `push`
  - `pop`
  - `shift`
  - `unshift`
  - `splice`
  - `sort`
  - `reverse`
  - `fill`
  - `copyWithin`

  Methods such as `map`, `filter`, `slice`, `concat`, `toSorted`, `toReversed`, and `toSpliced` return new arrays instead.

- explanation  
  Mutation changes the existing array reference, which can create unexpected state changes in frontend applications.

  ```js
  const numbers = [3, 1, 2];
  numbers.sort();

  console.log(numbers); // [1, 2, 3]
  ```

- details  
  Methods that add or remove elements mutate the array:

  ```js
  const items = ["a", "b"];

  items.push("c");    // ["a", "b", "c"]
  items.pop();        // ["a", "b"]
  items.unshift("z"); // ["z", "a", "b"]
  items.shift();      // ["a", "b"]
  ```

  `splice` can remove, replace, or insert elements:

  ```js
  const items = ["a", "b", "c"];

  items.splice(1, 1, "x");
  // items is ["a", "x", "c"]
  ```

  `sort` and `reverse` mutate the original:

  ```js
  const numbers = [3, 1, 2];

  const result = numbers.sort();

  result === numbers; // true
  ```

  Modern non-mutating alternatives include:

  ```js
  const sorted = numbers.toSorted();
  const reversed = numbers.toReversed();
  const changed = numbers.toSpliced(1, 1, 10);
  const replaced = numbers.with(0, 99);
  ```

  Older code can copy before applying a mutating method:

  ```js
  const sorted = [...numbers].sort((a, b) => a - b);
  ```

  Assignment by index also mutates an array:

  ```js
  numbers[0] = 100;
  ```

  A method can return a new array while its callback still mutates contained objects:

  ```js
  const users = [{ name: "Alex" }];

  const result = users.map(user => {
    user.name = "Sam";
    return user;
  });

  console.log(users[0].name); // "Sam"
  ```

---

## Card 38

- question  
  How can you remove duplicate values from an array?

- answer  
  For primitive values, the most common solution is to create a `Set` and convert it back into an array.

  A `Set` stores only unique values and preserves insertion order.

- explanation  
  Spread syntax provides a concise solution:

  ```js
  const values = [1, 2, 2, 3, 3];
  const uniqueValues = [...new Set(values)];

  // [1, 2, 3]
  ```

- details  
  `Array.from()` can also convert a `Set` into an array:

  ```js
  const uniqueValues = Array.from(new Set(values));
  ```

  `Set` works well for duplicate primitive values:

  ```js
  [...new Set(["a", "a", "b"])];
  // ["a", "b"]
  ```

  Object values are compared by identity, not by contents:

  ```js
  const users = [
    { id: 1 },
    { id: 1 }
  ];

  [...new Set(users)].length; // 2
  ```

  Although the objects contain the same data, they are different object references.

  Objects can be deduplicated by a property using a `Map`:

  ```js
  const users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "Sam" },
    { id: 1, name: "Alexander" }
  ];

  const uniqueUsers = [
    ...new Map(
      users.map(user => [user.id, user])
    ).values()
  ];
  ```

  Because later entries replace earlier entries with the same key, this keeps the final object for each `id`.

  To keep the first occurrence:

  ```js
  const seen = new Set();

  const uniqueUsers = users.filter(user => {
    if (seen.has(user.id)) {
      return false;
    }

    seen.add(user.id);
    return true;
  });
  ```

  The right solution depends on whether uniqueness is based on primitive equality, object identity, or a selected property.

---

## Card 39

- question  
  When would you use `Map` instead of an object?

- answer  
  Use `Map` when keys are dynamic, keys are not limited to strings and symbols, insertion order matters, or the collection is frequently updated and iterated.

  Use an object when representing a record with known property names, especially when the data naturally maps to JSON.

- explanation  
  A `Map` accepts values of any type as keys and provides dedicated collection methods.

  ```js
  const settings = new Map();

  settings.set("theme", "dark");
  settings.set(42, "numeric key");
  settings.set(document.body, "element key");
  ```

- details  
  Object property keys are strings or symbols. Other values are converted to strings:

  ```js
  const object = {};

  object[1] = "number";
  object["1"] = "string";

  console.log(object[1]); // "string"
  ```

  A `Map` distinguishes these keys:

  ```js
  const map = new Map();

  map.set(1, "number");
  map.set("1", "string");

  map.get(1);   // "number"
  map.get("1"); // "string"
  ```

  Objects can also be used as keys:

  ```js
  const user = { id: 1 };
  const permissions = new Map();

  permissions.set(user, ["read", "write"]);
  permissions.get(user); // ["read", "write"]
  ```

  A `Map` provides:

  ```js
  map.set(key, value);
  map.get(key);
  map.has(key);
  map.delete(key);
  map.clear();
  map.size;
  ```

  It is directly iterable:

  ```js
  for (const [key, value] of map) {
    console.log(key, value);
  }
  ```

  Objects are often more convenient for structured records:

  ```js
  const user = {
    id: 1,
    name: "Alex",
    role: "admin"
  };
  ```

  Objects work directly with `JSON.stringify()`. A `Map` requires explicit conversion before JSON serialization.

---

## Card 40

- question  
  When would you use `Set`?

- answer  
  Use a `Set` when a collection should contain only unique values or when efficient membership checks, additions, and deletions are important.

  A `Set` preserves insertion order and can contain values of any type.

- explanation  
  A `Set` is useful for deduplication and checking whether a value has already been seen.

  ```js
  const selectedIds = new Set();

  selectedIds.add(1);
  selectedIds.add(1);
  selectedIds.add(2);

  console.log(selectedIds.size); // 2
  ```

- details  
  The main `Set` operations are:

  ```js
  const roles = new Set();

  roles.add("admin");
  roles.has("admin");    // true
  roles.delete("admin"); // true
  roles.clear();
  roles.size;            // 0
  ```

  A `Set` can be constructed from any iterable:

  ```js
  const uniqueLetters = new Set("hello");
  // Set { "h", "e", "l", "o" }
  ```

  It can be converted into an array:

  ```js
  const values = [...uniqueLetters];
  ```

  Sets are directly iterable:

  ```js
  for (const role of roles) {
    console.log(role);
  }
  ```

  Object values are unique by identity:

  ```js
  const first = { id: 1 };
  const second = { id: 1 };

  const set = new Set([first, second]);

  console.log(set.size); // 2
  ```

  A `Set` is often clearer than repeatedly using `array.includes()` when many membership checks are required:

  ```js
  const allowedRoles = new Set([
    "admin",
    "editor",
    "author"
  ]);

  if (allowedRoles.has(user.role)) {
    // Allow access
  }
  ```

  Modern JavaScript environments also provide set-composition methods such as `union`, `intersection`, `difference`, and `isSubsetOf`. Compatibility should be checked when supporting older browsers.

---

## Card 41

- question  
  What are `WeakMap` and `WeakSet`?

- answer  
  `WeakMap` and `WeakSet` are collections that hold their object entries weakly. Their presence in the collection does not prevent those objects from being garbage-collected when no other reachable references remain.

  A `WeakMap` associates values with object or non-registered symbol keys. A `WeakSet` tracks object or non-registered symbol values.

- explanation  
  They are useful for attaching metadata or tracking objects without extending those objects’ lifetimes.

  ```js
  const metadata = new WeakMap();

  const element = document.querySelector("button");
  metadata.set(element, { clicks: 0 });
  ```

- details  
  A regular `Map` strongly retains its keys:

  ```js
  const cache = new Map();

  let user = { id: 1 };
  cache.set(user, "cached");

  user = null;
  ```

  The object remains reachable through `cache`, so it cannot be garbage-collected.

  A `WeakMap` does not keep its keys alive:

  ```js
  const cache = new WeakMap();

  let user = { id: 1 };
  cache.set(user, "cached");

  user = null;
  ```

  If no other references remain, the object and its associated entry may be collected.

  Common `WeakMap` operations are:

  ```js
  weakMap.set(object, value);
  weakMap.get(object);
  weakMap.has(object);
  weakMap.delete(object);
  ```

  Common `WeakSet` operations are:

  ```js
  weakSet.add(object);
  weakSet.has(object);
  weakSet.delete(object);
  ```

  Weak collections are not iterable and do not expose `size` or `clear`. Garbage collection is unpredictable, so JavaScript cannot provide a reliable list of their current entries.

  A `WeakMap` can store private metadata associated with an object:

  ```js
  const privateData = new WeakMap();

  class User {
    constructor(name) {
      privateData.set(this, { name });
    }

    getName() {
      return privateData.get(this).name;
    }
  }
  ```

  A `WeakSet` can track whether particular objects have been processed:

  ```js
  const processed = new WeakSet();

  function process(object) {
    if (processed.has(object)) {
      return;
    }

    processed.add(object);
    // Process the object
  }
  ```

  Weak collections are specialized tools. Use `Map` or `Set` when iteration, primitive keys, or collection size is required.

  # Asynchronous JavaScript Interview Cards

## Card 42

- question  
  What is the JavaScript event loop?

- answer  
  The event loop coordinates synchronous JavaScript execution with asynchronous work.

  It monitors the call stack and task queues. When the call stack is empty, it allows queued callbacks to run according to their priority and scheduling rules.

- explanation  
  JavaScript executes one piece of JavaScript code at a time on its main thread, but browser APIs can perform operations such as timers and network requests outside the call stack.

  ```js
  console.log("First");

  setTimeout(() => {
    console.log("Third");
  }, 0);

  console.log("Second");
  ```

  Output:

  ```text
  First
  Second
  Third
  ```

- details  
  The browser environment includes several cooperating components:

  - The JavaScript engine
  - The call stack
  - Browser APIs
  - The microtask queue
  - Task queues
  - The event loop
  - The rendering system

  When a timer is created, the browser tracks it outside the JavaScript call stack. After the delay has elapsed, its callback becomes eligible to enter a task queue.

  The event loop generally performs work in this order:

  1. Execute the current task.
  2. Empty the microtask queue.
  3. Give the browser an opportunity to render.
  4. Begin another task.

  A zero-millisecond timeout does not run immediately. It specifies a minimum delay before the callback can be queued:

  ```js
  setTimeout(callback, 0);
  ```

  The callback must still wait for the current code and all queued microtasks to complete.

  Long-running synchronous code blocks the event loop:

  ```js
  const start = Date.now();

  while (Date.now() - start < 5000) {
    // Blocks the main thread
  }
  ```

  During this period, the page may not respond to input, process callbacks, or update its display.

---

## Card 43

- question  
  What is the call stack?

- answer  
  The call stack is the data structure JavaScript uses to track active function executions.

  When a function is called, a stack frame is added. When the function returns or throws an error, its frame is removed.

- explanation  
  JavaScript executes the function at the top of the stack before returning to the function below it.

  ```js
  function first() {
    second();
  }

  function second() {
    console.log("Hello");
  }

  first();
  ```

- details  
  A simplified execution sequence is:

  ```text
  Add global execution context
  Add first()
  Add second()
  Add console.log()
  Remove console.log()
  Remove second()
  Remove first()
  ```

  Each stack frame stores information such as:

  - Function arguments
  - Local variables
  - The current execution position
  - The function’s `this` value
  - A reference to its lexical environment

  Recursive functions add a new frame for every call:

  ```js
  function countDown(number) {
    if (number === 0) {
      return;
    }

    countDown(number - 1);
  }

  countDown(5);
  ```

  Recursion without a valid stopping condition eventually exceeds the available stack:

  ```js
  function recurse() {
    recurse();
  }

  recurse(); // RangeError: Maximum call stack size exceeded
  ```

  Stack traces show the chain of active function calls at the time an error occurred, making them important for debugging.

---

## Card 44

- question  
  What is the difference between synchronous and asynchronous code?

- answer  
  Synchronous code executes sequentially, with each operation completing before the next one begins.

  Asynchronous code starts an operation and allows other JavaScript to continue while waiting. Its result is handled later through a callback, Promise, event, or `async` function.

- explanation  
  Asynchronous programming prevents waiting operations such as network requests and timers from unnecessarily blocking other work.

  ```js
  console.log("Before");

  setTimeout(() => {
    console.log("Timer finished");
  }, 1000);

  console.log("After");
  ```

- details  
  Synchronous code blocks further JavaScript execution until it finishes:

  ```js
  const result = performCalculation();
  console.log(result);
  ```

  Asynchronous APIs return control before their work completes:

  ```js
  fetch("/api/users")
    .then(response => response.json())
    .then(users => console.log(users));

  console.log("Request started");
  ```

  `async`/`await` makes asynchronous code look sequential, but `await` does not block the entire JavaScript thread:

  ```js
  async function loadUsers() {
    const response = await fetch("/api/users");
    const users = await response.json();

    return users;
  }
  ```

  The async function pauses at `await`, while other eligible work can continue.

  Asynchronous code is helpful for:

  - Network requests
  - Timers
  - User interactions
  - File operations in supported environments
  - Background work
  - Streams and animations

  CPU-intensive JavaScript is still blocking unless it is divided into smaller tasks or moved to a worker.

---

## Card 45

- question  
  What are microtasks and macrotasks?

- answer  
  Microtasks and tasks—often informally called macrotasks—are scheduled work with different priorities.

  After the current synchronous code finishes, JavaScript empties the microtask queue before starting the next task.

- explanation  
  Promise callbacks are microtasks, while timer callbacks are tasks. Therefore, a resolved Promise usually runs before a zero-delay timer.

  ```js
  setTimeout(() => console.log("Timer"), 0);

  Promise.resolve().then(() => {
    console.log("Promise");
  });

  console.log("Synchronous");
  ```

  Output:

  ```text
  Synchronous
  Promise
  Timer
  ```

- details  
  Common microtask sources include:

  - Promise reaction callbacks
  - Code after `await`
  - `queueMicrotask()`
  - `MutationObserver` callbacks

  Common task sources include:

  - `setTimeout`
  - `setInterval`
  - User-interface events
  - Message events
  - Some network and platform callbacks

  Microtasks added while processing microtasks run before the browser moves to the next task:

  ```js
  queueMicrotask(() => {
    console.log("Microtask 1");

    queueMicrotask(() => {
      console.log("Microtask 2");
    });
  });
  ```

  Excessive microtasks can delay rendering and other tasks. This is called microtask starvation:

  ```js
  function repeat() {
    queueMicrotask(repeat);
  }

  repeat();
  ```

  Browser scheduling details are defined in terms of tasks rather than “macrotasks,” but “macrotask” is commonly used in interviews to distinguish task queues from the microtask queue.

---

## Card 46

- question  
  In what order do synchronous code, promises, and timers execute?

- answer  
  The usual order is:

  1. Synchronous code
  2. Microtasks, including Promise callbacks and continuations after `await`
  3. The next task, such as a timer callback

  Microtasks are emptied after the current task completes and before another task begins.

- explanation  
  Promise callbacks therefore run before timer callbacks when both become eligible during the same task.

  ```js
  console.log("A");

  setTimeout(() => console.log("B"), 0);

  Promise.resolve().then(() => console.log("C"));

  console.log("D");
  ```

  Output:

  ```text
  A
  D
  C
  B
  ```

- details  
  Nested scheduling changes the order:

  ```js
  console.log("1");

  setTimeout(() => {
    console.log("2");

    Promise.resolve().then(() => {
      console.log("3");
    });
  }, 0);

  Promise.resolve().then(() => {
    console.log("4");

    setTimeout(() => {
      console.log("5");
    }, 0);
  });

  console.log("6");
  ```

  Output:

  ```text
  1
  6
  4
  2
  3
  5
  ```

  The reasoning is:

  1. Synchronous code prints `1` and `6`.
  2. The first Promise callback runs and prints `4`.
  3. The first timer task prints `2`.
  4. Its Promise callback runs as a microtask and prints `3`.
  5. The timer created inside the earlier Promise callback prints `5`.

  An `await` continuation is also scheduled through the microtask mechanism:

  ```js
  async function run() {
    console.log("Inside 1");
    await Promise.resolve();
    console.log("Inside 2");
  }

  console.log("Outside 1");
  run();
  console.log("Outside 2");
  ```

  Output:

  ```text
  Outside 1
  Inside 1
  Outside 2
  Inside 2
  ```

---

## Card 47

- question  
  What is a Promise?

- answer  
  A Promise is an object representing the eventual completion or failure of an asynchronous operation.

  It provides a structured way to register success and failure handlers and to compose asynchronous operations without deeply nested callbacks.

- explanation  
  `then` handles fulfillment, `catch` handles rejection, and `finally` runs after settlement regardless of the outcome.

  ```js
  fetch("/api/users")
    .then(response => response.json())
    .then(users => console.log(users))
    .catch(error => console.error(error))
    .finally(() => console.log("Finished"));
  ```

- details  
  A Promise can be created with an executor function:

  ```js
  const promise = new Promise((resolve, reject) => {
    const succeeded = true;

    if (succeeded) {
      resolve("Completed");
    } else {
      reject(new Error("Failed"));
    }
  });
  ```

  The executor runs synchronously:

  ```js
  console.log("Before");

  new Promise(resolve => {
    console.log("Executor");
    resolve();
  });

  console.log("After");
  ```

  Output:

  ```text
  Before
  Executor
  After
  ```

  Promise handlers always run asynchronously as microtasks, even when the Promise is already settled:

  ```js
  Promise.resolve("Done").then(console.log);
  console.log("Synchronous");
  ```

  Output:

  ```text
  Synchronous
  Done
  ```

  `then` returns a new Promise, enabling chaining:

  ```js
  Promise.resolve(2)
    .then(value => value * 2)
    .then(value => value + 1)
    .then(console.log); // 5
  ```

  Returning a Promise from a handler causes the next step to wait for it:

  ```js
  fetch("/api/user")
    .then(response => response.json())
    .then(user => fetch(`/api/orders/${user.id}`))
    .then(response => response.json());
  ```

  Throwing inside a handler rejects the Promise returned by that handler:

  ```js
  Promise.resolve()
    .then(() => {
      throw new Error("Failed");
    })
    .catch(error => console.error(error));
  ```

---

## Card 48

- question  
  What states can a Promise have?

- answer  
  A Promise has three possible states:

  - **Pending:** The operation has not settled.
  - **Fulfilled:** The operation completed successfully and produced a value.
  - **Rejected:** The operation failed and produced a reason, usually an `Error`.

  A fulfilled or rejected Promise is described as settled.

- explanation  
  A Promise can move from pending to fulfilled or rejected only once. Its final state and result cannot later be changed.

  ```js
  const promise = new Promise(resolve => {
    resolve("First");
    resolve("Second"); // Ignored
  });
  ```

- details  
  These transitions are possible:

  ```text
  pending → fulfilled
  pending → rejected
  ```

  These transitions are not possible:

  ```text
  fulfilled → rejected
  rejected → fulfilled
  settled → pending
  ```

  Resolving a Promise with another Promise makes the outer Promise adopt the other Promise’s eventual state:

  ```js
  const inner = new Promise(resolve => {
    setTimeout(() => resolve("Done"), 1000);
  });

  const outer = new Promise(resolve => {
    resolve(inner);
  });

  outer.then(console.log); // "Done"
  ```

  A Promise may be resolved but still pending while it follows another Promise. For everyday interviews, “resolved” is often treated as synonymous with “fulfilled,” but the specification distinguishes them.

  A rejection should normally use an `Error` object:

  ```js
  reject(new Error("Unable to load user"));
  ```

  This preserves a useful message and stack trace.

  An unhandled rejection occurs when a rejected Promise has no rejection handler. Browsers may report it in the console and emit an `unhandledrejection` event.

---

## Card 49

- question  
  How do `async` and `await` work?

- answer  
  Declaring a function with `async` makes it always return a Promise.

  `await` pauses that async function until a value or Promise settles. If it fulfills, `await` produces its value. If it rejects, `await` throws the rejection reason inside the async function.

- explanation  
  `async`/`await` provides syntax for writing Promise-based workflows in a readable, sequential style.

  ```js
  async function loadUser() {
    const response = await fetch("/api/user");
    const user = await response.json();

    return user;
  }
  ```

- details  
  Returning a normal value from an async function creates a fulfilled Promise:

  ```js
  async function getNumber() {
    return 42;
  }

  getNumber().then(console.log); // 42
  ```

  Throwing creates a rejected Promise:

  ```js
  async function fail() {
    throw new Error("Failed");
  }

  fail().catch(console.error);
  ```

  `await` accepts any value. A non-Promise value behaves like an already fulfilled Promise, but continuation still occurs asynchronously:

  ```js
  async function run() {
    console.log("A");
    await 42;
    console.log("C");
  }

  run();
  console.log("B");
  ```

  Output:

  ```text
  A
  B
  C
  ```

  Errors can be handled with `try` and `catch`:

  ```js
  async function loadUser() {
    try {
      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  ```

  Independent operations should not be awaited one after another unnecessarily:

  ```js
  const [user, products] = await Promise.all([
    fetchUser(),
    fetchProducts()
  ]);
  ```

  This starts both operations before waiting for them together.

---

## Card 50

- question  
  How do `Promise.all`, `Promise.allSettled`, `Promise.race`, and `Promise.any` differ?

- answer  
  These static methods combine multiple asynchronous values:

  - `Promise.all` fulfills when all inputs fulfill and rejects when the first input rejects.
  - `Promise.allSettled` waits for every input and always fulfills with their outcomes.
  - `Promise.race` settles with the first input to settle.
  - `Promise.any` fulfills with the first input to fulfill and rejects only if every input rejects.

- explanation  
  Choose the method based on whether every result is required, partial failures are acceptable, or only the first outcome matters.

- details  
  `Promise.all` preserves input order, regardless of completion order:

  ```js
  const results = await Promise.all([
    fetchUser(),
    fetchProducts(),
    fetchSettings()
  ]);
  ```

  If any input rejects, the combined Promise rejects immediately. Other operations are not automatically cancelled.

  `Promise.allSettled` returns status objects:

  ```js
  const results = await Promise.allSettled([
    Promise.resolve("A"),
    Promise.reject(new Error("Failed"))
  ]);
  ```

  Result shape:

  ```js
  [
    {
      status: "fulfilled",
      value: "A"
    },
    {
      status: "rejected",
      reason: Error("Failed")
    }
  ]
  ```

  `Promise.race` reacts to the first settlement, whether successful or failed:

  ```js
  const result = await Promise.race([
    fetchData(),
    timeoutPromise(5000)
  ]);
  ```

  `Promise.any` ignores rejections until one input fulfills:

  ```js
  const fastestSuccess = await Promise.any([
    fetchFromServerA(),
    fetchFromServerB()
  ]);
  ```

  If every input rejects, `Promise.any` rejects with an `AggregateError`.

  Empty iterables behave differently:

  ```js
  Promise.all([]);        // Fulfilled with []
  Promise.allSettled([]); // Fulfilled with []
  Promise.any([]);        // Rejected with AggregateError
  Promise.race([]);       // Remains pending
  ```

---

## Card 51

- question  
  How should errors be handled in asynchronous code?

- answer  
  Promise errors should be handled with `.catch()` or with `try...catch` around awaited operations.

  Errors should normally be represented by `Error` objects, handled at a level that can meaningfully recover, and rethrown when the caller still needs to know that the operation failed.

- explanation  
  A `try...catch` block can catch an awaited Promise rejection:

  ```js
  try {
    const user = await fetchUser();
  } catch (error) {
    console.error("Unable to load user", error);
  }
  ```

- details  
  Promise chains propagate rejections to the nearest rejection handler:

  ```js
  fetchUser()
    .then(user => fetchOrders(user.id))
    .then(orders => renderOrders(orders))
    .catch(error => {
      showErrorMessage(error);
    });
  ```

  A `try...catch` block does not catch a Promise rejection unless the Promise is awaited:

  ```js
  try {
    fetchUser(); // Rejection is not caught here
  } catch (error) {
    console.error(error);
  }
  ```

  Correct version:

  ```js
  try {
    await fetchUser();
  } catch (error) {
    console.error(error);
  }
  ```

  Fetch only rejects for certain network-level failures. HTTP error statuses must be checked explicitly:

  ```js
  const response = await fetch("/api/user");

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  ```

  Avoid silently swallowing errors:

  ```js
  try {
    await saveUser();
  } catch (error) {
    // Empty catch hides the failure
  }
  ```

  Add contextual information while preserving the original cause:

  ```js
  try {
    await saveUser();
  } catch (error) {
    throw new Error("Could not save user", {
      cause: error
    });
  }
  ```

  `finally` is appropriate for cleanup:

  ```js
  setLoading(true);

  try {
    await loadData();
  } finally {
    setLoading(false);
  }
  ```

---

## Card 52

- question  
  How can an HTTP request be cancelled?

- answer  
  Requests made with the Fetch API can be cancelled using an `AbortController`.

  Its `signal` is passed to `fetch`, and calling `abort()` tells the operation to stop. The Fetch Promise then rejects, normally with an abort-related error.

- explanation  
  Cancellation is useful when a component is removed, the user starts a newer request, or an operation exceeds a time limit.

  ```js
  const controller = new AbortController();

  fetch("/api/users", {
    signal: controller.signal
  });

  controller.abort();
  ```

- details  
  Cancellation can be handled explicitly:

  ```js
  const controller = new AbortController();

  try {
    const response = await fetch("/api/users", {
      signal: controller.signal
    });

    const users = await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request cancelled");
    } else {
      throw error;
    }
  }
  ```

  A single signal can cancel multiple related operations:

  ```js
  const controller = new AbortController();

  const requests = [
    fetch("/api/user", {
      signal: controller.signal
    }),
    fetch("/api/products", {
      signal: controller.signal
    })
  ];

  controller.abort();
  ```

  Some environments support timeout signals:

  ```js
  const response = await fetch("/api/users", {
    signal: AbortSignal.timeout(5000)
  });
  ```

  When implementing search suggestions, cancel the previous request before starting a new one:

  ```js
  let currentController;

  async function search(query) {
    currentController?.abort();
    currentController = new AbortController();

    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      { signal: currentController.signal }
    );

    return response.json();
  }
  ```

  Aborting Fetch does not guarantee that the server stops work already started. It primarily stops the client from continuing to wait for or process the response.

---

## Card 53

- question  
  How can multiple asynchronous operations be executed in parallel?

- answer  
  Start all independent asynchronous operations before awaiting their combined result.

  `Promise.all` is usually appropriate when every operation must succeed. `Promise.allSettled` is useful when all outcomes are needed even if some operations fail.

- explanation  
  Sequential awaits unnecessarily delay independent operations:

  ```js
  const user = await fetchUser();
  const products = await fetchProducts();
  ```

  Parallel version:

  ```js
  const [user, products] = await Promise.all([
    fetchUser(),
    fetchProducts()
  ]);
  ```

- details  
  Suppose each operation takes one second.

  Sequential execution takes approximately two seconds:

  ```js
  const user = await fetchUser();
  const products = await fetchProducts();
  ```

  The second operation does not begin until the first finishes.

  Parallel execution takes approximately one second:

  ```js
  const userPromise = fetchUser();
  const productsPromise = fetchProducts();

  const [user, products] = await Promise.all([
    userPromise,
    productsPromise
  ]);
  ```

  Only independent operations should run in parallel. Dependent operations must wait for the required value:

  ```js
  const user = await fetchUser();
  const orders = await fetchOrders(user.id);
  ```

  When processing an array in parallel:

  ```js
  const users = await Promise.all(
    userIds.map(id => fetchUser(id))
  );
  ```

  Avoid `forEach` with async callbacks:

  ```js
  // Does not wait for completion
  userIds.forEach(async id => {
    await fetchUser(id);
  });
  ```

  Unrestricted parallelism can overload a browser, network, or server when the input is large. A concurrency limit may be necessary:

  ```js
  async function processInBatches(items, batchSize) {
    const results = [];

    for (
      let index = 0;
      index < items.length;
      index += batchSize
    ) {
      const batch = items.slice(index, index + batchSize);

      const batchResults = await Promise.all(
        batch.map(item => processItem(item))
      );

      results.push(...batchResults);
    }

    return results;
  }
  ```

  Parallel execution improves total duration when operations are independent, but it does not make the individual operations themselves execute faster.

  # Browser and DOM Interview Cards

## Card 54

- question  
  What is the DOM?

- answer  
  The Document Object Model, or DOM, is the browser’s object-based representation of an HTML or XML document.

  It represents the document as a tree of nodes and provides APIs that JavaScript can use to read, create, update, move, and remove content.

- explanation  
  HTML elements become objects that JavaScript can interact with:

  ```js
  const heading = document.querySelector("h1");
  heading.textContent = "Updated title";
  ```

- details  
  The DOM tree contains several node types:

  - Document nodes
  - Element nodes
  - Text nodes
  - Comment nodes
  - Document fragments

  For this HTML:

  ```html
  <main>
    <h1>Hello</h1>
  </main>
  ```

  A simplified tree is:

  ```text
  document
    └── html
        └── body
            └── main
                └── h1
                    └── "Hello"
  ```

  The DOM is not part of the JavaScript language itself. It is a Web API supplied by browser environments.

  JavaScript can use DOM APIs to:

  - Find elements
  - Change content and attributes
  - Modify styles and classes
  - Attach event listeners
  - Create or remove elements
  - Measure element positions and sizes

  DOM updates may trigger browser rendering work, so large or repeated changes can affect performance.

---

## Card 55

- question  
  What is the difference between the DOM and the HTML source?

- answer  
  The HTML source is the text initially sent to the browser. The DOM is the live object tree the browser creates after parsing that source.

  JavaScript, browser error correction, user interaction, and dynamic rendering can change the DOM without changing the original HTML response.

- explanation  
  The page source and current DOM may contain different content after JavaScript runs.

  ```js
  document.body.append("Added by JavaScript");
  ```

  This changes the DOM but not the server’s original HTML file.

- details  
  Browsers may correct invalid markup while building the DOM:

  ```html
  <table>
    <tr>
      <td>Item</td>
    </tr>
  </table>
  ```

  The browser may insert a `<tbody>` element into the DOM even if it was not present in the source.

  The source is generally static for a particular response. The DOM is live and can change because of:

  - JavaScript
  - Form input
  - Browser extensions
  - Client-side frameworks
  - DOM APIs
  - Browser parsing rules

  “View Page Source” normally shows the original response. Browser developer tools normally show the current DOM.

  The DOM is also different from the visual rendering of the page. CSS can hide, reorder, or visually transform elements without changing their DOM structure.

---

## Card 56

- question  
  How do you select, create, update, and remove DOM elements?

- answer  
  Elements can be selected with methods such as `querySelector` and `querySelectorAll`, created with `createElement`, updated through properties and attributes, and removed with `remove`.

- explanation  
  A common workflow is to create an element, configure it, and insert it into the document.

  ```js
  const item = document.createElement("li");
  item.textContent = "New item";

  document.querySelector("ul").append(item);
  ```

- details  
  Common selection methods include:

  ```js
  document.querySelector(".card");
  document.querySelectorAll(".card");
  document.getElementById("profile");
  ```

  `querySelector` returns the first match or `null`. `querySelectorAll` returns a static `NodeList`.

  Content and properties can be updated directly:

  ```js
  const image = document.querySelector("img");

  image.src = "/avatar.png";
  image.alt = "User avatar";
  ```

  Attributes can be managed explicitly:

  ```js
  element.setAttribute("aria-label", "Close");
  element.getAttribute("aria-label");
  element.removeAttribute("aria-label");
  ```

  Classes can be managed with `classList`:

  ```js
  element.classList.add("active");
  element.classList.remove("hidden");
  element.classList.toggle("selected");
  ```

  Elements can be inserted with:

  ```js
  parent.append(element);
  parent.prepend(element);
  reference.before(element);
  reference.after(element);
  ```

  They can be replaced or removed:

  ```js
  oldElement.replaceWith(newElement);
  element.remove();
  ```

  For many insertions, a `DocumentFragment` can group work before insertion:

  ```js
  const fragment = document.createDocumentFragment();

  for (const name of names) {
    const item = document.createElement("li");
    item.textContent = name;
    fragment.append(item);
  }

  list.append(fragment);
  ```

---

## Card 57

- question  
  What is event bubbling?

- answer  
  Event bubbling is the phase in which an event moves from its target element upward through its ancestors.

  Most common DOM events bubble, allowing parent elements to respond to events that began on their descendants.

- explanation  
  Clicking the button can trigger listeners on both the button and its parent:

  ```js
  parent.addEventListener("click", () => {
    console.log("Parent");
  });

  button.addEventListener("click", () => {
    console.log("Button");
  });
  ```

  The button listener normally runs before the parent listener.

- details  
  An event generally moves through three phases:

  1. Capturing: from the document toward the target
  2. Target: at the element where the event occurred
  3. Bubbling: from the target back toward the document

  Bubbling makes event delegation possible:

  ```js
  list.addEventListener("click", event => {
    const item = event.target.closest("li");

    if (item) {
      console.log(item.dataset.id);
    }
  });
  ```

  Not every event bubbles. For example, `focus` and `blur` do not normally bubble, although `focusin` and `focusout` do.

  Bubbling can be stopped:

  ```js
  event.stopPropagation();
  ```

  However, stopping propagation can interfere with unrelated parent behavior and should be used intentionally.

---

## Card 58

- question  
  What is event capturing?

- answer  
  Event capturing is the phase in which an event travels from the top of the document tree down toward its target.

  Event listeners use the bubbling phase by default. A listener can participate in capturing by setting the `capture` option to `true`.

- explanation  
  A capturing parent listener runs before a target’s ordinary bubbling listener.

  ```js
  parent.addEventListener(
    "click",
    () => console.log("Parent capture"),
    { capture: true }
  );
  ```

- details  
  The event order is generally:

  ```text
  document capture
    → ancestor capture
    → target
    → ancestor bubble
    → document bubble
  ```

  The shorter boolean form is also supported:

  ```js
  parent.addEventListener("click", handler, true);
  ```

  The options object is clearer and can include other settings:

  ```js
  element.addEventListener("click", handler, {
    capture: true,
    once: true,
    passive: true
  });
  ```

  Capture listeners can be useful when:

  - An event does not bubble normally
  - A parent must observe an event before a child handles it
  - Centralized interception is required

  A listener must normally be removed with the same capture setting used when it was added:

  ```js
  element.removeEventListener("click", handler, {
    capture: true
  });
  ```

---

## Card 59

- question  
  What is event delegation?

- answer  
  Event delegation attaches one listener to a shared ancestor instead of attaching separate listeners to every descendant.

  The ancestor uses event bubbling and information such as `event.target` to determine which descendant initiated the event.

- explanation  
  Delegation reduces the number of listeners and automatically supports matching elements added later.

  ```js
  list.addEventListener("click", event => {
    const button = event.target.closest(".delete-button");

    if (!button || !list.contains(button)) {
      return;
    }

    deleteItem(button.dataset.id);
  });
  ```

- details  
  Without delegation, every button needs a listener:

  ```js
  document
    .querySelectorAll(".delete-button")
    .forEach(button => {
      button.addEventListener("click", handleDelete);
    });
  ```

  Newly added buttons would require additional listeners.

  With delegation, the ancestor’s listener handles current and future descendants:

  ```js
  list.insertAdjacentHTML(
    "beforeend",
    '<button class="delete-button">Delete</button>'
  );
  ```

  `closest()` is usually safer than checking only `event.target.matches()` because the click may originate from a nested icon or text element.

  Confirm that the matched element belongs to the intended container:

  ```js
  if (!button || !list.contains(button)) {
    return;
  }
  ```

  Delegation works best for bubbling events. For non-bubbling behavior, use a related bubbling event or a capture listener where appropriate.

---

## Card 60

- question  
  What is the difference between `event.target` and `event.currentTarget`?

- answer  
  `event.target` is the element where the event originated.

  `event.currentTarget` is the element whose event listener is currently running.

- explanation  
  During event delegation, the target may be a descendant while the current target is the ancestor holding the listener.

  ```js
  list.addEventListener("click", event => {
    console.log(event.target);
    console.log(event.currentTarget); // list
  });
  ```

- details  
  Given this markup:

  ```html
  <button id="save">
    <span>Save</span>
  </button>
  ```

  And this listener:

  ```js
  const button = document.querySelector("#save");

  button.addEventListener("click", event => {
    console.log(event.target);
    console.log(event.currentTarget);
  });
  ```

  Clicking the `<span>` produces:

  - `event.target`: the `<span>`
  - `event.currentTarget`: the `<button>`

  `target` normally stays the same as the event propagates. `currentTarget` changes for each listener.

  Outside the listener callback, `currentTarget` is typically `null`:

  ```js
  button.addEventListener("click", event => {
    setTimeout(() => {
      console.log(event.currentTarget); // null
    });
  });
  ```

  Save the value during the callback if it is needed later.

---

## Card 61

- question  
  What do `preventDefault` and `stopPropagation` do?

- answer  
  `preventDefault()` prevents the browser’s default action for an event.

  `stopPropagation()` prevents the event from continuing through the remaining ancestors during capture or bubbling.

  They affect different parts of event handling.

- explanation  
  Preventing a form submission does not automatically stop the event from bubbling.

  ```js
  form.addEventListener("submit", event => {
    event.preventDefault();
  });
  ```

- details  
  Common default browser actions include:

  - Following a link
  - Submitting a form
  - Checking a checkbox
  - Opening a context menu
  - Performing some drag-and-drop actions

  A default action can be prevented only when the event is cancelable:

  ```js
  if (event.cancelable) {
    event.preventDefault();
  }
  ```

  `stopPropagation()` stops movement to other elements but does not stop other listeners on the same element.

  To stop those as well, use:

  ```js
  event.stopImmediatePropagation();
  ```

  Passive listeners cannot call `preventDefault()`:

  ```js
  element.addEventListener("touchmove", handler, {
    passive: true
  });
  ```

  Passive listeners help scrolling performance by promising that the handler will not cancel the event.

  Both methods should be used carefully because preventing expected browser behavior or propagation may break accessibility and other components.

---

## Card 62

- question  
  What is the difference between `DOMContentLoaded` and `load`?

- answer  
  `DOMContentLoaded` fires after the initial HTML has been parsed and the DOM has been constructed.

  `load` fires later, after the document and dependent resources such as images, stylesheets, and frames have finished loading.

- explanation  
  Use `DOMContentLoaded` when code only needs the DOM. Use `load` when it depends on all page resources being available.

  ```js
  document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM ready");
  });

  window.addEventListener("load", () => {
    console.log("Page resources loaded");
  });
  ```

- details  
  Deferred scripts execute after parsing and before `DOMContentLoaded`:

  ```html
  <script defer src="app.js"></script>
  ```

  Module scripts are deferred by default:

  ```html
  <script type="module" src="app.js"></script>
  ```

  A normal script placed at the end of `<body>` can often access earlier DOM elements without waiting for `DOMContentLoaded`.

  The `load` event also exists on individual resources:

  ```js
  image.addEventListener("load", () => {
    console.log("Image loaded");
  });
  ```

  If code may run after `DOMContentLoaded` has already fired, check the document state:

  ```js
  function initialize() {
    // Set up application
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  } else {
    initialize();
  }
  ```

---

## Card 63

- question  
  What is the difference between `innerHTML`, `innerText`, and `textContent`?

- answer  
  - `innerHTML` reads or writes HTML markup.
  - `textContent` reads or writes the textual content of a node and its descendants.
  - `innerText` represents rendered text and takes visibility and layout into account.

- explanation  
  Use `textContent` for plain text. Use `innerHTML` only when HTML parsing is required and the content is trusted or properly sanitized.

  ```js
  element.textContent = "<strong>Hello</strong>";
  // Displays the markup as text

  element.innerHTML = "<strong>Hello</strong>";
  // Creates a strong element
  ```

- details  
  `innerHTML` parses assigned strings as markup:

  ```js
  container.innerHTML = `
    <button class="save">Save</button>
  `;
  ```

  Assigning untrusted input to it can create an XSS vulnerability:

  ```js
  container.innerHTML = userProvidedContent;
  ```

  `textContent` does not parse markup, making it appropriate for user-provided plain text:

  ```js
  container.textContent = userProvidedContent;
  ```

  `textContent` includes text from hidden elements and returns content close to the underlying DOM structure.

  `innerText` reflects rendered text:

  ```html
  <div id="message">
    Visible
    <span hidden>Hidden</span>
  </div>
  ```

  `textContent` includes `"Hidden"`, while `innerText` generally does not.

  Reading `innerText` may require layout calculation, making it potentially more expensive than `textContent`.

  Setting `textContent` or `innerHTML` replaces existing child nodes and removes their directly attached event listeners.

---

## Card 64

- question  
  What are custom events?

- answer  
  Custom events are application-defined DOM events used to communicate that a meaningful action or state change has occurred.

  They are created with `CustomEvent` and can carry additional information through the `detail` property.

- explanation  
  Custom events let components communicate without calling each other’s internal functions directly.

  ```js
  const event = new CustomEvent("cart:item-added", {
    detail: {
      productId: 42
    }
  });

  element.dispatchEvent(event);
  ```

- details  
  A listener receives the custom data through `event.detail`:

  ```js
  element.addEventListener("cart:item-added", event => {
    console.log(event.detail.productId);
  });
  ```

  Custom events do not bubble by default. Enable bubbling when delegation or ancestor communication is required:

  ```js
  const event = new CustomEvent("cart:item-added", {
    bubbles: true,
    detail: {
      productId: 42
    }
  });
  ```

  They can also be cancelable:

  ```js
  const event = new CustomEvent("dialog:before-close", {
    cancelable: true
  });

  const allowed = dialog.dispatchEvent(event);

  if (allowed) {
    dialog.close();
  }
  ```

  A listener can prevent the action:

  ```js
  dialog.addEventListener("dialog:before-close", event => {
    if (hasUnsavedChanges) {
      event.preventDefault();
    }
  });
  ```

  Custom event names should be descriptive and namespaced to reduce collisions.

---

## Card 65

- question  
  What are the differences between cookies, `localStorage`, and `sessionStorage`?

- answer  
  All three store data in the browser, but they differ in lifetime, capacity, server interaction, and scope.

  - Cookies can be sent automatically with HTTP requests and support security attributes.
  - `localStorage` persists until explicitly cleared.
  - `sessionStorage` lasts for the lifetime of a particular browser tab.

- explanation  
  Web Storage is convenient for non-sensitive client-side data. Cookies are appropriate when the server must receive the value, particularly for session management.

- details  
  A simplified comparison:

  | Feature | Cookies | `localStorage` | `sessionStorage` |
  |---|---|---|---|
  | Lifetime | Configurable | Until cleared | Current tab session |
  | Sent to server | Usually, when applicable | No | No |
  | API | String-based cookie header | Key/value | Key/value |
  | Typical capacity | Small | Larger | Larger |
  | Server can set it | Yes | No | No |

  Web Storage stores strings:

  ```js
  localStorage.setItem(
    "preferences",
    JSON.stringify({ theme: "dark" })
  );

  const preferences = JSON.parse(
    localStorage.getItem("preferences")
  );
  ```

  Storage operations are synchronous and can block the main thread when overused.

  Sensitive data should not be placed in Web Storage because JavaScript running on the origin can access it. An XSS vulnerability could expose it.

  Authentication cookies can use protections such as:

  - `HttpOnly`
  - `Secure`
  - `SameSite`
  - Restricted `Domain` and `Path`
  - Appropriate expiration

  `HttpOnly` cookies cannot be read through JavaScript, reducing token theft through XSS, although XSS remains dangerous.

---

## Card 66

- question  
  What is the same-origin policy?

- answer  
  The same-origin policy is a browser security rule that restricts how documents or scripts from one origin can access resources and data from another origin.

  An origin is defined by its scheme, host, and port.

- explanation  
  These URLs do not all share the same origin:

  ```text
  https://example.com
  http://example.com
  https://api.example.com
  https://example.com:8443
  ```

  Each differs by scheme, host, or port.

- details  
  The policy restricts operations such as:

  - Reading cross-origin responses
  - Accessing another origin’s DOM
  - Reading another origin’s storage
  - Inspecting cross-origin frames

  Some cross-origin operations are allowed in limited ways. For example, a page can often display a cross-origin image but cannot freely inspect its pixel data through a canvas.

  Cross-origin network requests may be permitted through CORS. Cross-document communication can use `window.postMessage()`:

  ```js
  otherWindow.postMessage(
    { type: "READY" },
    "https://trusted.example"
  );
  ```

  The receiving page should validate the sender:

  ```js
  window.addEventListener("message", event => {
    if (event.origin !== "https://trusted.example") {
      return;
    }

    console.log(event.data);
  });
  ```

  The same-origin policy is enforced by browsers. It does not prevent direct server-to-server requests.

---

## Card 67

- question  
  What is CORS?

- answer  
  Cross-Origin Resource Sharing, or CORS, is an HTTP-header mechanism that allows a server to tell browsers which origins may read its responses.

  CORS relaxes selected same-origin policy restrictions. It is configured by the server and enforced by the browser.

- explanation  
  The server may allow a particular origin with a response header:

  ```http
  Access-Control-Allow-Origin: https://app.example.com
  ```

  The frontend cannot grant itself CORS permission.

- details  
  Some cross-origin requests are considered simple and may be sent directly. The browser still checks the response headers before exposing the response to JavaScript.

  Other requests trigger a preflight request using `OPTIONS`:

  ```http
  OPTIONS /api/users
  Origin: https://app.example.com
  Access-Control-Request-Method: PUT
  Access-Control-Request-Headers: Content-Type
  ```

  The server responds with allowed methods, headers, and origins.

  Credentialed requests require explicit configuration:

  ```js
  fetch("https://api.example.com/user", {
    credentials: "include"
  });
  ```

  The server must allow credentials and cannot use `*` as the allowed origin for that credentialed response.

  CORS is not an authentication system. A server must still validate permissions and credentials.

  CORS also does not stop non-browser clients from making requests. Its main purpose is controlling whether browser JavaScript can access cross-origin responses.

---

## Card 68

- question  
  How does the Fetch API work?

- answer  
  The Fetch API performs HTTP requests and returns a Promise that fulfills with a `Response` object.

  The response body is read asynchronously using methods such as `json`, `text`, `blob`, or `arrayBuffer`.

- explanation  
  Fetch does not automatically reject for HTTP error statuses such as `404` or `500`. The response status must be checked.

  ```js
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const users = await response.json();
  ```

- details  
  A POST request can be made with:

  ```js
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Alex"
    })
  });
  ```

  Useful response properties include:

  ```js
  response.ok;
  response.status;
  response.statusText;
  response.headers;
  response.url;
  ```

  The body is a stream and normally can be consumed only once:

  ```js
  await response.json();
  await response.text(); // Error: body already consumed
  ```

  Clone the response first if two consumers are genuinely required:

  ```js
  const copy = response.clone();
  ```

  Fetch can include an abort signal:

  ```js
  const controller = new AbortController();

  fetch("/api/users", {
    signal: controller.signal
  });
  ```

  Request options also control credentials, caching, redirects, and request mode. Application code should handle:

  - Network failures
  - HTTP failures
  - Invalid response data
  - Cancellation
  - Timeouts
  - Loading and retry states

---

## Card 69

- question  
  What is the difference between Fetch and `XMLHttpRequest`?

- answer  
  Fetch is the modern Promise-based API for HTTP requests. `XMLHttpRequest`, or XHR, is an older event- and callback-based API.

  Fetch usually provides cleaner composition, better integration with `async`/`await`, and direct access to request and response streams.

- explanation  
  Fetch is preferred for most modern application code, while XHR may still appear in older systems or specialized upload-progress implementations.

- details  
  A Fetch request:

  ```js
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const users = await response.json();
  ```

  A comparable XHR request:

  ```js
  const request = new XMLHttpRequest();

  request.open("GET", "/api/users");

  request.onload = () => {
    if (request.status >= 200 && request.status < 300) {
      const users = JSON.parse(request.responseText);
      console.log(users);
    }
  };

  request.onerror = () => {
    console.error("Network error");
  };

  request.send();
  ```

  Key differences include:

  - Fetch uses Promises.
  - XHR uses events and callbacks.
  - Fetch supports modern stream APIs.
  - XHR has established upload-progress events.
  - Fetch requires explicit checking of HTTP failure statuses.
  - Cancellation uses `AbortController` with Fetch and `abort()` with XHR.

  Download progress can be implemented with Fetch streams, although it requires manual processing. Upload progress support has historically been simpler with XHR.

---

## Card 70

- question  
  What is the History API?

- answer  
  The History API lets browser applications interact with the current tab’s session history.

  It can add or replace history entries and respond when the user navigates backward or forward.

- explanation  
  Single-page applications use it to update the URL without performing a full page reload.

  ```js
  history.pushState(
    { page: "profile" },
    "",
    "/profile"
  );
  ```

- details  
  The main methods are:

  ```js
  history.pushState(state, "", url);
  history.replaceState(state, "", url);
  history.back();
  history.forward();
  history.go(-2);
  ```

  `pushState` adds a new entry. `replaceState` updates the current entry without adding another one.

  Back and forward navigation can be observed with `popstate`:

  ```js
  window.addEventListener("popstate", event => {
    renderRoute(location.pathname, event.state);
  });
  ```

  Calling `pushState` or `replaceState` does not itself trigger `popstate`.

  The new URL must generally have the same origin as the current page.

  Client-side routing also requires server configuration. If a user directly loads `/profile`, the server must return the application rather than an unrelated `404` response.

  The History API should be paired with semantic links where possible so navigation remains accessible and behaves correctly with normal browser features.

---

## Card 71

- question  
  What are Web Workers, and when should they be used?

- answer  
  Web Workers run JavaScript in a background thread separate from the page’s main JavaScript thread.

  They are useful for CPU-intensive work that would otherwise block rendering and user interaction.

- explanation  
  Workers cannot directly access the DOM. They communicate with the main thread by exchanging messages.

  ```js
  const worker = new Worker("./worker.js");

  worker.postMessage({ values: [1, 2, 3] });

  worker.addEventListener("message", event => {
    console.log(event.data);
  });
  ```

- details  
  Worker code receives and sends messages:

  ```js
  // worker.js
  self.addEventListener("message", event => {
    const result = performExpensiveCalculation(
      event.data.values
    );

    self.postMessage(result);
  });
  ```

  Suitable use cases include:

  - Processing large datasets
  - Image or audio manipulation
  - Complex calculations
  - Parsing large files
  - Compression
  - Cryptographic work
  - Background data transformation

  Workers are usually unnecessary for ordinary network requests because Fetch is already asynchronous.

  Data is normally transferred using the structured clone algorithm, so sending very large values has a cost:

  ```js
  worker.postMessage(largeObject);
  ```

  Transferable objects can transfer ownership of certain data without copying:

  ```js
  worker.postMessage(buffer, [buffer]);
  ```

  After transfer, the original thread can no longer use that buffer.

  Common worker types include:

  - Dedicated Workers, used by one page context
  - Shared Workers, potentially shared by multiple contexts
  - Service Workers, used for network interception, caching, and offline capabilities

  These worker types solve different problems and have different lifecycles and APIs.

  # Performance and Optimization Interview Cards

## Card 72

- question  
  What are debounce and throttle?

- answer  
  Debounce and throttle limit how frequently a function executes.

  - Debounce waits until calls have stopped for a specified period before executing.
  - Throttle allows execution at most once during each specified interval.

- explanation  
  Debounce is useful when only the final action matters, such as search input. Throttle is useful when continuous updates are needed at a controlled rate, such as scroll tracking.

- details  
  A debounced search waits until the user pauses typing:

  ```js
  const search = debounce(query => {
    fetchResults(query);
  }, 300);

  input.addEventListener("input", event => {
    search(event.target.value);
  });
  ```

  A throttled scroll handler runs periodically while scrolling continues:

  ```js
  const handleScroll = throttle(() => {
    updateScrollPosition(window.scrollY);
  }, 200);

  window.addEventListener("scroll", handleScroll);
  ```

  A basic debounce implementation:

  ```js
  function debounce(callback, delay) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }
  ```

  Debounce and throttle implementations may support:

  - Leading-edge execution
  - Trailing-edge execution
  - Cancellation
  - Immediate flushing
  - A maximum waiting time

  For visual updates tied to the browser’s refresh cycle, `requestAnimationFrame` may be more appropriate than time-based throttling.

---

## Card 73

- question  
  What causes memory leaks in frontend applications?

- answer  
  A memory leak occurs when an application keeps references to data that it no longer needs, preventing garbage collection.

  Common causes include forgotten event listeners, active timers, retained DOM nodes, long-lived closures, unbounded caches, subscriptions, and detached components.

- explanation  
  Memory leaks gradually increase memory usage and may make an application slow or unstable during long sessions.

- details  
  A listener can keep its related data reachable:

  ```js
  function mount() {
    const largeData = loadLargeData();

    function handleResize() {
      useData(largeData);
    }

    window.addEventListener("resize", handleResize);
  }
  ```

  If the component is removed but the listener remains, `handleResize` and `largeData` may stay in memory.

  Cleanup should remove the listener:

  ```js
  window.removeEventListener("resize", handleResize);
  ```

  An `AbortController` can manage listener cleanup:

  ```js
  const controller = new AbortController();

  window.addEventListener("resize", handleResize, {
    signal: controller.signal
  });

  controller.abort();
  ```

  Other common cleanup operations include:

  ```js
  clearInterval(intervalId);
  observer.disconnect();
  subscription.unsubscribe();
  controller.abort();
  ```

  Detached DOM nodes can remain in memory if JavaScript still references them:

  ```js
  const removedElement = document.querySelector(".panel");
  removedElement.remove();

  // removedElement still references the detached node
  ```

  Browser memory tools, heap snapshots, and allocation timelines help identify objects that remain reachable unexpectedly.

---

## Card 74

- question  
  How does JavaScript garbage collection work?

- answer  
  JavaScript automatically reclaims memory occupied by values that are no longer reachable from active roots.

  Modern engines primarily use reachability-based garbage collection, commonly involving tracing algorithms such as mark-and-sweep along with generational and incremental optimizations.

- explanation  
  Developers do not manually free JavaScript objects. They help garbage collection by removing unnecessary references and cleaning up external resources.

- details  
  Garbage-collection roots typically include:

  - The global object
  - Active call-stack variables
  - Active closures
  - Registered callbacks
  - Reachable DOM and platform objects

  During a simplified mark-and-sweep process, the engine:

  1. Starts from known roots.
  2. Marks every value reachable from those roots.
  3. Reclaims unmarked values.

  Circular references are not automatically leaks:

  ```js
  let first = {};
  let second = {};

  first.other = second;
  second.other = first;

  first = null;
  second = null;
  ```

  The objects can be collected because neither remains reachable from a root.

  Setting a local variable to `null` is not usually necessary. It can help when a long-lived object holds a large value that is no longer needed:

  ```js
  cache.largeResult = null;
  ```

  Garbage collection is nondeterministic. Code cannot rely on it happening at a particular moment.

  Resources such as event listeners, network requests, observers, and timers often require explicit cleanup even though their associated JavaScript memory is managed automatically.

---

## Card 75

- question  
  What are reflow and repaint?

- answer  
  Reflow, often called layout, recalculates the size and position of elements.

  Repaint redraws pixels when visual properties change without necessarily changing layout. Compositing combines rendered layers into the final image.

- explanation  
  Layout changes are usually more expensive because they can affect multiple elements and may be followed by paint and compositing work.

- details  
  Properties that can trigger layout include:

  - Width and height
  - Margin and padding
  - Font size
  - Positioning values
  - Content changes
  - Adding or removing elements

  Paint-only changes can include properties such as colors, backgrounds, borders, and shadows.

  Properties such as `transform` and `opacity` can often be handled mainly during compositing, making them preferable for animations:

  ```css
  .panel {
    transform: translateX(100px);
    opacity: 0.5;
  }
  ```

  Repeatedly mixing DOM reads and writes can cause layout thrashing:

  ```js
  for (const element of elements) {
    const width = element.offsetWidth;
    element.style.width = `${width + 10}px`;
  }
  ```

  Group reads and writes instead:

  ```js
  const widths = elements.map(
    element => element.offsetWidth
  );

  elements.forEach((element, index) => {
    element.style.width = `${widths[index] + 10}px`;
  });
  ```

  Not every style change forces immediate work. Browsers often batch rendering until JavaScript yields, but reading layout-dependent measurements may force pending calculations.

---

## Card 76

- question  
  What is the difference between `async` and `defer` on script elements?

- answer  
  Both `async` and `defer` let external scripts download without blocking HTML parsing.

  - `async` executes each script as soon as it finishes downloading, without preserving document order.
  - `defer` waits until HTML parsing finishes and preserves script order.

- explanation  
  Use `defer` for application scripts that depend on the DOM or each other. Use `async` for independent scripts whose execution order does not matter.

- details  
  A normal external script blocks parsing:

  ```html
  <script src="app.js"></script>
  ```

  The browser pauses HTML parsing while it downloads and executes the script.

  Deferred scripts preserve their document order:

  ```html
  <script defer src="library.js"></script>
  <script defer src="app.js"></script>
  ```

  `library.js` executes before `app.js`, even if `app.js` downloads first. Deferred scripts execute before `DOMContentLoaded`.

  Async scripts execute as soon as they are ready:

  ```html
  <script async src="analytics.js"></script>
  ```

  Multiple async scripts may execute in any order and may run before or after parsing completes.

  Module scripts are deferred by default:

  ```html
  <script type="module" src="app.js"></script>
  ```

  The `async` attribute can also be added to a module script when immediate execution after dependency loading is appropriate.

  `async` and `defer` apply to external classic scripts. Their behavior does not meaningfully apply to an ordinary inline classic script without a `src`.

---

## Card 77

- question  
  What is lazy loading?

- answer  
  Lazy loading delays downloading, initializing, or rendering a resource until it is likely to be needed.

  It reduces initial page work and can improve startup time, bandwidth usage, and responsiveness.

- explanation  
  Images and iframes can use native lazy loading:

  ```html
  <img
    src="/photo.jpg"
    alt="Mountain landscape"
    loading="lazy"
  >
  ```

- details  
  Common lazy-loaded resources include:

  - Images
  - Iframes
  - JavaScript modules
  - Routes
  - Large components
  - Videos
  - Data requested for off-screen content

  JavaScript can detect when content approaches the viewport with `IntersectionObserver`:

  ```js
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      loadContent(entry.target);
      observer.unobserve(entry.target);
    }
  });

  observer.observe(document.querySelector(".gallery"));
  ```

  Modules can be loaded dynamically:

  ```js
  const module = await import("./editor.js");
  module.initializeEditor();
  ```

  Lazy loading has tradeoffs:

  - Loading too late can create visible delays.
  - Layout space should be reserved to prevent shifts.
  - Critical above-the-fold content should not normally be lazy-loaded.
  - Errors and loading states must be handled.
  - Excessively small chunks may add request overhead.

  Prefetching can complement lazy loading by downloading likely future resources during idle time.

---

## Card 78

- question  
  What is code splitting?

- answer  
  Code splitting divides a JavaScript application into smaller bundles that can be loaded independently.

  It reduces the amount of JavaScript required for the initial page and delays less important code until it is needed.

- explanation  
  Dynamic `import()` creates a natural split point in modern bundlers.

  ```js
  const editorModule = await import("./editor.js");
  editorModule.openEditor();
  ```

- details  
  Common splitting strategies include:

  - Route-based splitting
  - Component-based splitting
  - Feature-based splitting
  - Splitting large third-party libraries
  - Loading administrative tools only for authorized users

  For example, an application does not need to load checkout code on its home page:

  ```js
  if (route === "/checkout") {
    const checkout = await import("./checkout.js");
    checkout.render();
  }
  ```

  Code splitting can improve:

  - Initial bundle size
  - Parse and compilation time
  - Time to interactivity
  - Cache efficiency

  It can also create costs:

  - Additional network requests
  - Loading states
  - Chunk-load failures
  - Dependency duplication
  - Delays when a feature is first opened

  Preloading or prefetching important future chunks can reduce interaction delays. Bundle analysis tools help identify large dependencies and ineffective split points.

---

## Card 79

- question  
  What is tree shaking?

- answer  
  Tree shaking is a build optimization that removes exported code determined to be unused.

  It relies primarily on the static structure of ES modules, allowing build tools to analyze `import` and `export` statements without executing the code.

- explanation  
  If a module exports several functions but an application imports only one, a bundler may exclude the unused exports from the production bundle.

  ```js
  // utilities.js
  export function add(a, b) {
    return a + b;
  }

  export function unusedFeature() {
    // ...
  }
  ```

  ```js
  import { add } from "./utilities.js";
  ```

- details  
  Static ES module syntax is easier to analyze than dynamic module patterns:

  ```js
  import { add } from "./math.js";
  ```

  Tree shaking is most effective when:

  - ES modules are used
  - Production optimizations are enabled
  - Modules avoid unnecessary top-level side effects
  - Packages correctly describe side-effect behavior
  - Imports target tree-shakable entry points

  A top-level side effect may require a module to remain:

  ```js
  registerGlobalPlugin();
  ```

  Package metadata can identify files that must be preserved for their side effects:

  ```json
  {
    "sideEffects": [
      "./src/global.css",
      "./src/register.js"
    ]
  }
  ```

  Tree shaking is different from minification:

  - Tree shaking removes unused code.
  - Minification rewrites retained code into a smaller form.

  Importing an entire library through a non-tree-shakable entry point may prevent unused features from being removed.

---

## Card 80

- question  
  What is memoization?

- answer  
  Memoization caches a function’s result based on its inputs and returns the cached result when the same inputs occur again.

  It exchanges additional memory and cache-management complexity for reduced computation time.

- explanation  
  Memoization is most suitable for deterministic, expensive functions that receive repeated inputs.

  ```js
  function memoize(callback) {
    const cache = new Map();

    return argument => {
      if (cache.has(argument)) {
        return cache.get(argument);
      }

      const result = callback(argument);
      cache.set(argument, result);
      return result;
    };
  }
  ```

- details  
  A memoized calculation:

  ```js
  const calculate = memoize(number => {
    console.log("Calculating");
    return number * number;
  });

  calculate(5); // Calculates and returns 25
  calculate(5); // Returns cached 25
  ```

  Multiple arguments require a reliable cache-key strategy:

  ```js
  function memoizeTwoArguments(callback) {
    const cache = new Map();

    return (first, second) => {
      const key = `${first}:${second}`;

      if (!cache.has(key)) {
        cache.set(key, callback(first, second));
      }

      return cache.get(key);
    };
  }
  ```

  String-based keys can collide for complex inputs. Nested `Map` objects or identity-based caches may be safer.

  Object arguments are compared by reference:

  ```js
  cache.get({ id: 1 }); // Different object each time
  ```

  Memoization is less useful when:

  - Inputs rarely repeat
  - Computation is inexpensive
  - Results change despite identical inputs
  - The cache can grow indefinitely
  - Cached data becomes stale

  Frontend frameworks may provide memoization tools, but memoization itself has a cost. It should address a measured performance problem rather than be added automatically.

---

## Card 81

- question  
  How can frontend JavaScript performance be measured and improved?

- answer  
  Frontend performance should be measured with browser tools and real-user data before optimization.

  Improvements usually target loading, JavaScript execution, rendering, memory usage, network activity, and responsiveness.

- explanation  
  A useful process is:

  1. Measure the current experience.
  2. Identify the largest bottleneck.
  3. Apply a focused change.
  4. Measure again.
  5. Confirm that user-facing performance improved.

- details  
  Useful browser tools and APIs include:

  - Performance panel
  - Network panel
  - Memory profiler
  - Lighthouse
  - Performance API
  - `PerformanceObserver`
  - Coverage and bundle-analysis tools

  Custom timings can be recorded:

  ```js
  performance.mark("render-start");

  renderDashboard();

  performance.mark("render-end");

  performance.measure(
    "dashboard-render",
    "render-start",
    "render-end"
  );
  ```

  Common improvements include:

  - Reducing initial JavaScript
  - Code splitting and lazy loading
  - Removing unused dependencies
  - Optimizing images and fonts
  - Caching static resources
  - Avoiding layout thrashing
  - Virtualizing long lists
  - Moving heavy work to Web Workers
  - Debouncing or throttling frequent handlers
  - Reducing unnecessary renders
  - Breaking up long tasks

  Important user-facing metrics include:

  - Largest Contentful Paint
  - Interaction to Next Paint
  - Cumulative Layout Shift
  - Time to First Byte

  Laboratory tests provide controlled comparisons, while real-user monitoring captures actual devices, networks, locations, and user behavior. Both are valuable.

  Optimizing a fast operation that does not affect the user is usually less valuable than fixing a measured rendering, loading, or interaction bottleneck.

---

## Card 82

- question  
  What is the difference between `requestAnimationFrame` and `setTimeout`?

- answer  
  `requestAnimationFrame` schedules a callback before the browser’s next repaint.

  `setTimeout` schedules a task after a minimum time delay, without synchronizing it with rendering.

- explanation  
  Use `requestAnimationFrame` for visual updates and JavaScript-driven animations. Use `setTimeout` for general delayed work.

  ```js
  requestAnimationFrame(timestamp => {
    updateAnimation(timestamp);
  });
  ```

- details  
  A `requestAnimationFrame` loop can animate based on elapsed time:

  ```js
  let previousTime;

  function animate(currentTime) {
    if (previousTime !== undefined) {
      const elapsed = currentTime - previousTime;
      updatePosition(elapsed);
    }

    previousTime = currentTime;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
  ```

  Using timestamps makes movement independent of the display’s refresh rate.

  The browser can coordinate animation-frame callbacks with layout, paint, and compositing. It may pause or reduce them in background tabs to save resources.

  `setTimeout` provides only a minimum delay:

  ```js
  setTimeout(callback, 16);
  ```

  The callback may execute later if the call stack or task queue is busy. Repeated 16-millisecond timers are not reliably synchronized with the display.

  Animation frames can be cancelled:

  ```js
  const frameId = requestAnimationFrame(animate);
  cancelAnimationFrame(frameId);
  ```

  Timers use separate cancellation:

  ```js
  const timeoutId = setTimeout(callback, 1000);
  clearTimeout(timeoutId);
  ```

  `requestAnimationFrame` is not automatically appropriate for expensive nonvisual calculations. Long callbacks still block the main thread and can cause dropped frames.

  # Errors, Security, and Code Quality Interview Cards

## Card 83

- question  
  How do `try`, `catch`, `finally`, and `throw` work?

- answer  
  These statements provide structured error handling:

  - `try` contains code that may throw an error.
  - `catch` handles an error thrown inside the associated `try`.
  - `finally` runs after `try` and `catch`, whether an error occurred or not.
  - `throw` creates or propagates an exception.

- explanation  
  Use `try...catch` when code can fail in a way the application can meaningfully handle.

  ```js
  try {
    const data = JSON.parse(input);
    console.log(data);
  } catch (error) {
    console.error("Invalid JSON", error);
  } finally {
    console.log("Parsing attempt finished");
  }
  ```

- details  
  Any JavaScript value can technically be thrown, but an `Error` object should normally be used:

  ```js
  throw new Error("Unable to load user");
  ```

  `Error` objects provide useful information such as:

  - `name`
  - `message`
  - `stack`
  - `cause`

  Custom validation can throw an error:

  ```js
  function setAge(age) {
    if (!Number.isInteger(age) || age < 0) {
      throw new RangeError(
        "Age must be a non-negative integer"
      );
    }

    return age;
  }
  ```

  A caught error can be handled, transformed, or rethrown:

  ```js
  try {
    await saveUser(user);
  } catch (error) {
    throw new Error("Could not save user", {
      cause: error
    });
  }
  ```

  `finally` is useful for cleanup:

  ```js
  setLoading(true);

  try {
    await loadData();
  } catch (error) {
    showError(error);
  } finally {
    setLoading(false);
  }
  ```

  A `return` inside `finally` overrides an earlier return or thrown error, so it should generally be avoided:

  ```js
  function example() {
    try {
      throw new Error("Failed");
    } finally {
      return "Success"; // Suppresses the error
    }
  }
  ```

  `try...catch` handles synchronous exceptions and awaited Promise rejections. It does not catch an unawaited Promise rejection:

  ```js
  try {
    fetchData(); // A later rejection is not caught here
  } catch (error) {
    // Does not handle the Promise rejection
  }
  ```

  Correct version:

  ```js
  try {
    await fetchData();
  } catch (error) {
    console.error(error);
  }
  ```

---

## Card 84

- question  
  What is the difference between syntax, runtime, and logical errors?

- answer  
  - A syntax error means the code does not follow JavaScript’s grammar and cannot be parsed correctly.
  - A runtime error occurs while otherwise valid code is executing.
  - A logical error allows the program to run but produces incorrect behavior or results.

- explanation  
  Syntax and runtime errors usually produce exceptions. Logical errors may not produce any error message, making tests and debugging particularly important.

- details  
  A syntax error prevents the affected script from being parsed:

  ```js
  function greet( {
    console.log("Hello");
  }
  ```

  A runtime error happens during execution:

  ```js
  const user = null;
  console.log(user.name);
  // TypeError
  ```

  Other common runtime errors include:

  - `ReferenceError`
  - `TypeError`
  - `RangeError`
  - `URIError`
  - Custom application errors

  A logical error produces the wrong result:

  ```js
  function calculateDiscount(price) {
    return price * 1.2; // Increases the price
  }
  ```

  The code is valid and executes successfully, but the business logic is incorrect.

  Tools for finding these errors include:

  - Syntax highlighting and linters
  - Browser developer tools
  - Breakpoints
  - Stack traces
  - Logging
  - Static type checking
  - Automated tests
  - Code review

  Tests are especially valuable for logical errors because the JavaScript engine cannot know the intended business behavior.

---

## Card 85

- question  
  What is cross-site scripting (XSS), and how can it be prevented?

- answer  
  Cross-site scripting is a vulnerability in which untrusted content is interpreted and executed as code in another user’s browser within a trusted application’s context.

  Prevention requires context-appropriate output encoding, safe DOM APIs, HTML sanitization when HTML is intentionally accepted, framework protections, and defense-in-depth controls.

- explanation  
  Untrusted text should be inserted with a safe text API instead of being parsed as HTML:

  ```js
  message.textContent = userInput;
  ```

  Avoid inserting untrusted content directly with `innerHTML`.

- details  
  Common categories include:

  - Stored XSS, where malicious content is persisted
  - Reflected XSS, where malicious input is included in an immediate response
  - DOM-based XSS, where unsafe client-side code writes attacker-controlled data into a dangerous DOM location

  Unsafe example:

  ```js
  output.innerHTML = location.hash.slice(1);
  ```

  Safer plain-text version:

  ```js
  output.textContent = location.hash.slice(1);
  ```

  Security depends on where the value is inserted. HTML content, attributes, URLs, CSS, and JavaScript have different parsing rules and require context-specific protections.

  Important protections include:

  - Use framework output escaping correctly.
  - Use safe sinks such as `textContent`.
  - Sanitize untrusted HTML with a well-maintained sanitizer when HTML must be supported.
  - Validate URL schemes and destinations.
  - Avoid dangerous APIs such as `document.write`.
  - Avoid constructing executable JavaScript from strings.
  - Use Content Security Policy as an additional layer.
  - Consider Trusted Types where supported.

  Sanitization is different from validation. Validation checks whether input matches expected rules. Sanitization transforms allowed HTML to remove unsafe content.

  Content Security Policy can reduce impact but should not be treated as the only XSS defense. Cookie attributes may also reduce certain consequences but do not prevent malicious script execution.

  See the [OWASP Cross-Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html).

---

## Card 86

- question  
  What is cross-site request forgery (CSRF), and how can it be prevented?

- answer  
  Cross-site request forgery is an attack that tricks an authenticated browser into sending an unwanted state-changing request to a trusted application.

  It commonly works when the browser automatically includes authentication credentials, such as session cookies, but the server does not verify that the intended application initiated the request.

- explanation  
  CSRF prevention is primarily enforced on the server through protections such as unpredictable CSRF tokens, appropriate `SameSite` cookies, and origin validation.

- details  
  A malicious page might attempt to trigger an authenticated action:

  ```html
  <form
    action="https://bank.example/transfer"
    method="POST"
  >
    <input name="amount" value="1000">
    <input name="destination" value="attacker">
  </form>
  ```

  If the browser automatically sends the victim’s session cookie and the server accepts the request without additional verification, the action may succeed.

  Common protections include:

  - Synchronizer CSRF tokens
  - Properly implemented signed double-submit cookies
  - `SameSite` cookie attributes
  - Verification of `Origin` or `Referer`
  - Reauthentication for highly sensitive actions
  - Custom request headers where appropriate
  - Avoiding state changes through safe methods such as `GET`

  A token-based request may look like:

  ```js
  await fetch("/api/profile", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken
    },
    credentials: "same-origin",
    body: JSON.stringify(profile)
  });
  ```

  The server must verify that the token is valid, secret, unpredictable, and associated with the correct session.

  `SameSite` is valuable, but it should generally be treated as defense in depth unless the application meets strict conditions allowing it to stand alone.

  CORS is not a complete CSRF defense. Some cross-origin requests can be sent without CORS permission even when JavaScript cannot read the response.

  XSS can often defeat CSRF protections because malicious script running within the trusted origin can access application capabilities. Both vulnerabilities must be addressed.

  See the [OWASP Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

---

## Card 87

- question  
  Why is using `eval` dangerous?

- answer  
  `eval()` parses and executes a string as JavaScript code.

  It is dangerous because untrusted input can become executable code, it makes program behavior harder to analyze, and it prevents many engine and build-time optimizations.

- explanation  
  Never pass user-controlled or externally controlled content to `eval`.

  ```js
  eval(userInput); // Dangerous
  ```

  Prefer normal JavaScript operations, data parsing, or explicit mappings.

- details  
  Code injection can occur when data is combined with executable source:

  ```js
  const expression = getUserInput();
  const result = eval(expression);
  ```

  An attacker may supply code that reads page data, changes application behavior, or performs authenticated actions.

  Safer alternatives depend on the intended task.

  Parse JSON with:

  ```js
  const data = JSON.parse(jsonText);
  ```

  Access a dynamic property with bracket notation:

  ```js
  const value = object[propertyName];
  ```

  Select a known operation with a mapping:

  ```js
  const operations = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b
  };

  const operation = operations[operationName];

  if (!operation) {
    throw new Error("Unsupported operation");
  }

  const result = operation(first, second);
  ```

  Set a timer with a function rather than a string:

  ```js
  setTimeout(() => {
    runTask();
  }, 1000);
  ```

  Avoid:

  ```js
  setTimeout("runTask()", 1000);
  ```

  The `Function` constructor has similar code-generation risks:

  ```js
  new Function(userInput);
  ```

  Indirect `eval` changes scope behavior but does not make untrusted code safe.

  See the [MDN `eval()` reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval).

---

## Card 88

- question  
  What is strict mode?

- answer  
  Strict mode is a restricted JavaScript execution mode that converts some silent mistakes into errors, prevents certain unsafe behavior, and simplifies language semantics.

  It can be enabled for a classic script or individual function with `"use strict"`. ES modules and class bodies use strict mode automatically.

- explanation  
  Strict mode catches accidental global-variable creation:

  ```js
  "use strict";

  username = "Alex";
  // ReferenceError
  ```

- details  
  In non-strict classic code, assigning to an undeclared identifier may create a property on the global object. Strict mode rejects it.

  Strict mode also changes standalone function `this`:

  ```js
  "use strict";

  function showThis() {
    console.log(this);
  }

  showThis(); // undefined
  ```

  Without strict mode in an older classic browser script, `this` may become the global object.

  Other strict-mode behaviors include:

  - Rejecting assignments to non-writable properties
  - Rejecting deletion of plain identifiers
  - Preventing duplicate parameter names in ordinary function syntax
  - Reserving certain identifiers
  - Restricting some `eval` behavior
  - Removing some historically error-prone semantics

  Enable it for an entire classic script by placing the directive first:

  ```js
  "use strict";

  function run() {
    // Strict mode applies here
  }
  ```

  Or for one function:

  ```js
  function run() {
    "use strict";
    // Strict only inside this function
  }
  ```

  Blocks cannot independently enable strict mode.

  Modern projects using ES modules already receive strict-mode behavior:

  ```html
  <script type="module" src="app.js"></script>
  ```

  See the [MDN strict mode reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode).

---

## Card 89

- question  
  What is optional chaining?

- answer  
  Optional chaining uses `?.` to access a property, call a function, or read an indexed value only when the preceding value is not `null` or `undefined`.

  If the preceding value is nullish, the expression short-circuits and returns `undefined`.

- explanation  
  It avoids errors when optional intermediate values may be missing.

  ```js
  const city = user.address?.city;
  ```

  If `user.address` is `null` or `undefined`, `city` becomes `undefined`.

- details  
  Optional property access:

  ```js
  user.profile?.name;
  ```

  Optional element access:

  ```js
  users?.[0];
  dictionary?.[key];
  ```

  Optional function call:

  ```js
  options.onComplete?.();
  ```

  Optional chaining checks only for `null` and `undefined`. Other falsy values remain valid:

  ```js
  const data = {
    count: 0,
    label: ""
  };

  data.count?.toString(); // "0"
  ```

  Chaining can continue across multiple optional levels:

  ```js
  const country =
    response.data?.user?.address?.country;
  ```

  Be careful with grouping:

  ```js
  user?.profile.name;
  ```

  This protects access to `user`, but if `user` exists and `profile` is nullish, accessing `.name` still fails. Safer version:

  ```js
  user?.profile?.name;
  ```

  Optional chaining cannot be used on the left side of assignment:

  ```js
  user?.name = "Alex"; // SyntaxError
  ```

  It should not hide required-data errors. If a value must exist, explicit validation may communicate the contract better.

---

## Card 90

- question  
  What is nullish coalescing?

- answer  
  The nullish coalescing operator `??` returns its right-hand operand only when its left-hand operand is `null` or `undefined`.

  Unlike `||`, it does not replace other falsy values such as `0`, `false`, or an empty string.

- explanation  
  It is useful when falsy values are valid data:

  ```js
  const count = 0;

  count || 10; // 10
  count ?? 10; // 0
  ```

- details  
  Examples:

  ```js
  null ?? "default";      // "default"
  undefined ?? "default"; // "default"
  false ?? true;          // false
  0 ?? 100;               // 0
  "" ?? "untitled";       // ""
  ```

  Nullish coalescing is often combined with optional chaining:

  ```js
  const city =
    user.address?.city ?? "Unknown city";
  ```

  The right-hand expression is evaluated only when needed:

  ```js
  const value = cachedValue ?? calculateValue();
  ```

  `calculateValue()` runs only if `cachedValue` is `null` or `undefined`.

  Nullish assignment updates a variable only when it is nullish:

  ```js
  settings.theme ??= "light";
  ```

  JavaScript does not allow `??` to be mixed directly with `&&` or `||` without parentheses:

  ```js
  value || fallback ?? defaultValue;
  // SyntaxError
  ```

  The intended grouping must be explicit:

  ```js
  (value || fallback) ?? defaultValue;
  ```

---

## Card 91

- question  
  What are common ways to test JavaScript code?

- answer  
  JavaScript code can be tested through automated unit, integration, component, end-to-end, accessibility, performance, and visual tests.

  Static analysis, type checking, linting, and manual exploratory testing complement automated tests but test different qualities.

- explanation  
  Effective test suites focus on observable behavior and combine fast focused tests with a smaller number of realistic full-system tests.

- details  
  Common testing layers include:

  - Unit tests for isolated logic
  - Integration tests for cooperating modules
  - Component tests for UI behavior
  - End-to-end tests for complete user journeys
  - Contract tests for service boundaries
  - Visual regression tests for unexpected layout changes
  - Accessibility tests for detectable accessibility issues
  - Performance tests for speed and resource budgets

  A simple behavior-focused test might look like:

  ```js
  function calculateTotal(items) {
    return items.reduce(
      (total, item) => total + item.price,
      0
    );
  }

  test("calculates the total price", () => {
    const items = [
      { price: 10 },
      { price: 15 }
    ];

    expect(calculateTotal(items)).toBe(25);
  });
  ```

  UI tests should generally interact with the interface as a user would:

  ```js
  const button = screen.getByRole("button", {
    name: "Save"
  });

  await user.click(button);

  expect(
    screen.getByText("Saved successfully")
  ).toBeVisible();
  ```

  Useful testing principles include:

  - Test behavior rather than implementation details.
  - Keep tests deterministic.
  - Avoid unnecessary mocks.
  - Test success, failure, empty, and boundary cases.
  - Give tests descriptive names.
  - Ensure failures clearly identify broken behavior.
  - Run important tests automatically in continuous integration.

  Automated accessibility tools identify many issues but cannot replace manual keyboard, screen-reader, and usability testing.

---

## Card 92

- question  
  What is the difference between unit, integration, and end-to-end testing?

- answer  
  - Unit tests verify a small piece of logic in isolation.
  - Integration tests verify that multiple parts work correctly together.
  - End-to-end tests verify complete user workflows through the running application.

  The levels differ in scope, realism, speed, maintenance cost, and diagnostic precision.

- explanation  
  A balanced test strategy uses each level for the behavior it can verify most effectively.

- details  
  A unit test might verify a formatting function:

  ```js
  test("formats a full name", () => {
    expect(
      formatName({
        first: "Alex",
        last: "Smith"
      })
    ).toBe("Alex Smith");
  });
  ```

  Unit tests are typically:

  - Fast
  - Focused
  - Easy to run frequently
  - Good at identifying the source of a failure

  An integration test might render a form, submit it, and verify its interaction with a mocked or local API layer:

  ```js
  test("submits valid profile data", async () => {
    render(<ProfileForm />);

    await user.type(
      screen.getByLabelText("Name"),
      "Alex"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Save"
      })
    );

    expect(api.saveProfile).toHaveBeenCalledWith({
      name: "Alex"
    });
  });
  ```

  Integration tests cover boundaries that isolated unit tests may miss.

  An end-to-end test might:

  1. Open the application in a real browser.
  2. Sign in.
  3. Add an item to a cart.
  4. Complete checkout.
  5. Verify the confirmation page.

  End-to-end tests provide strong confidence in important user journeys but are generally slower, more expensive to maintain, and harder to debug.

  Not every function needs a unit test, and not every variation needs an end-to-end test. High-value business rules benefit from focused tests, while critical user journeys benefit from a smaller number of reliable end-to-end tests.

  # Practical Interview Question Cards

## Card 93

- question  
  How would you reverse a string?

- answer  
  For simple strings, convert the string to an array, reverse the array, and join it again.

  ```js
  function reverseString(value) {
    return [...value].reverse().join("");
  }
  ```

- explanation  
  Strings are immutable, so the function creates and returns a new string.

  ```js
  reverseString("hello"); // "olleh"
  ```

- details  
  Spread syntax handles Unicode code points better than `split("")`:

  ```js
  [..."A😀B"];
  // ["A", "😀", "B"]
  ```

  By comparison, `split("")` separates the emoji into UTF-16 code units:

  ```js
  "A😀B".split("");
  // ["A", "\uD83D", "\uDE00", "B"]
  ```

  A manual implementation can use a loop:

  ```js
  function reverseString(value) {
    let result = "";

    for (const character of value) {
      result = character + result;
    }

    return result;
  }
  ```

  Both versions have linear time complexity, `O(n)`, and require additional memory.

  Some visible characters consist of multiple Unicode code points, such as letters with combining marks or family emojis. Correctly reversing user-perceived characters requires grapheme segmentation:

  ```js
  function reverseGraphemes(value, locale = "en") {
    const segmenter = new Intl.Segmenter(locale, {
      granularity: "grapheme"
    });

    return [...segmenter.segment(value)]
      .map(segment => segment.segment)
      .reverse()
      .join("");
  }
  ```

  In an interview, clarify whether the expected solution must handle basic characters, Unicode code points, or complete grapheme clusters.

---

## Card 94

- question  
  How would you check whether a string is a palindrome?

- answer  
  Normalize the string according to the requirements and compare it with its reversed form.

  ```js
  function isPalindrome(value) {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    return (
      normalized ===
      [...normalized].reverse().join("")
    );
  }
  ```

- explanation  
  A palindrome reads the same forward and backward.

  ```js
  isPalindrome("Racecar"); // true
  isPalindrome("Hello");   // false
  ```

- details  
  A two-pointer solution avoids creating a reversed string:

  ```js
  function isPalindrome(value) {
    const normalized = value
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    let left = 0;
    let right = normalized.length - 1;

    while (left < right) {
      if (normalized[left] !== normalized[right]) {
        return false;
      }

      left++;
      right--;
    }

    return true;
  }
  ```

  Time complexity is `O(n)`. The normalization step still creates an additional string.

  Requirements should be clarified:

  - Should letter casing be ignored?
  - Should spaces and punctuation be ignored?
  - Should accented characters be normalized?
  - Should all Unicode letters and numbers be supported?
  - Is an empty string considered a palindrome?

  A Unicode-aware normalization can use property escapes:

  ```js
  const normalized = value
    .normalize("NFC")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
  ```

  This retains Unicode letters and numbers instead of only ASCII characters.

---

## Card 95

- question  
  How would you flatten a nested array?

- answer  
  Use `flat(Infinity)` when arrays may have any nesting depth.

  ```js
  function flatten(array) {
    return array.flat(Infinity);
  }
  ```

- explanation  
  `flat` creates a new array and removes the specified number of nested array levels.

  ```js
  flatten([1, [2, [3, 4]]]);
  // [1, 2, 3, 4]
  ```

- details  
  A recursive implementation can demonstrate the underlying algorithm:

  ```js
  function flatten(array) {
    const result = [];

    for (const value of array) {
      if (Array.isArray(value)) {
        result.push(...flatten(value));
      } else {
        result.push(value);
      }
    }

    return result;
  }
  ```

  A reducer version is also possible:

  ```js
  function flatten(array) {
    return array.reduce((result, value) => {
      if (Array.isArray(value)) {
        return result.concat(flatten(value));
      }

      result.push(value);
      return result;
    }, []);
  }
  ```

  Deep recursion may exceed the call stack. An iterative solution avoids that risk:

  ```js
  function flatten(array) {
    const stack = [...array].reverse();
    const result = [];

    while (stack.length > 0) {
      const value = stack.pop();

      if (Array.isArray(value)) {
        stack.push(...value.slice().reverse());
      } else {
        result.push(value);
      }
    }

    return result;
  }
  ```

  Time complexity is `O(n)`, where `n` includes all nested values. The result requires `O(n)` additional space.

---

## Card 96

- question  
  How would you group an array of objects by a property?

- answer  
  Iterate over the array and store each object in a collection associated with its property value.

  ```js
  function groupBy(items, property) {
    return items.reduce((groups, item) => {
      const key = item[property];

      groups[key] ??= [];
      groups[key].push(item);

      return groups;
    }, {});
  }
  ```

- explanation  
  Each property value becomes a key whose value is an array of matching objects.

  ```js
  groupBy(
    [
      { name: "Alex", role: "admin" },
      { name: "Sam", role: "user" },
      { name: "Lee", role: "admin" }
    ],
    "role"
  );
  ```

- details  
  The result is:

  ```js
  {
    admin: [
      { name: "Alex", role: "admin" },
      { name: "Lee", role: "admin" }
    ],
    user: [
      { name: "Sam", role: "user" }
    ]
  }
  ```

  A callback makes the function more flexible:

  ```js
  function groupBy(items, getKey) {
    return items.reduce((groups, item) => {
      const key = getKey(item);

      groups[key] ??= [];
      groups[key].push(item);

      return groups;
    }, {});
  }

  groupBy(users, user => user.role);
  ```

  A `Map` supports keys of any type and avoids object-key coercion:

  ```js
  function groupByMap(items, getKey) {
    const groups = new Map();

    for (const item of items) {
      const key = getKey(item);
      const group = groups.get(key) ?? [];

      group.push(item);
      groups.set(key, group);
    }

    return groups;
  }
  ```

  Modern JavaScript environments may provide `Object.groupBy()` and `Map.groupBy()`:

  ```js
  const groups = Object.groupBy(
    users,
    user => user.role
  );
  ```

  Check runtime compatibility when using newer built-in methods.

---

## Card 97

- question  
  How would you implement debounce?

- answer  
  Return a wrapper function that resets a timer after every call. Execute the original function only when no new call occurs during the delay.

  ```js
  function debounce(callback, delay) {
    let timeoutId;

    return function (...args) {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        callback.apply(this, args);
      }, delay);
    };
  }
  ```

- explanation  
  Debouncing is useful when only the final call matters, such as waiting for a user to stop typing before searching.

  ```js
  const search = debounce(fetchResults, 300);
  input.addEventListener("input", search);
  ```

- details  
  `apply` preserves the wrapper’s dynamic `this` and forwards its arguments.

  A version with cancellation and flushing:

  ```js
  function debounce(callback, delay) {
    let timeoutId;
    let latestArgs;
    let latestThis;

    function debounced(...args) {
      latestArgs = args;
      latestThis = this;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        timeoutId = undefined;
        callback.apply(latestThis, latestArgs);
      }, delay);
    }

    debounced.cancel = () => {
      clearTimeout(timeoutId);
      timeoutId = undefined;
      latestArgs = undefined;
      latestThis = undefined;
    };

    debounced.flush = () => {
      if (timeoutId === undefined) {
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = undefined;
      callback.apply(latestThis, latestArgs);
    };

    return debounced;
  }
  ```

  Important design choices include:

  - Leading or trailing execution
  - Preserving `this`
  - Forwarding arguments
  - Returning results
  - Cancellation
  - Maximum wait time
  - Handling async callbacks

  A production implementation should also clean up pending timers when the owning UI component is removed.

---

## Card 98

- question  
  How would you implement throttle?

- answer  
  Return a wrapper that permits the original function to execute at most once during each specified interval.

  ```js
  function throttle(callback, interval) {
    let lastExecutionTime = 0;

    return function (...args) {
      const currentTime = Date.now();

      if (
        currentTime - lastExecutionTime >= interval
      ) {
        lastExecutionTime = currentTime;
        callback.apply(this, args);
      }
    };
  }
  ```

- explanation  
  Throttling is useful when regular updates are needed during a frequent event such as scrolling, resizing, or pointer movement.

- details  
  The basic implementation executes on the leading edge but may discard the final call.

  A leading-and-trailing implementation preserves a final call:

  ```js
  function throttle(callback, interval) {
    let lastExecutionTime = 0;
    let timeoutId;
    let latestArgs;
    let latestThis;

    return function (...args) {
      const currentTime = Date.now();
      const remaining =
        interval - (currentTime - lastExecutionTime);

      latestArgs = args;
      latestThis = this;

      if (remaining <= 0) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
        lastExecutionTime = currentTime;

        callback.apply(latestThis, latestArgs);
      } else if (timeoutId === undefined) {
        timeoutId = setTimeout(() => {
          timeoutId = undefined;
          lastExecutionTime = Date.now();

          callback.apply(latestThis, latestArgs);
        }, remaining);
      }
    };
  }
  ```

  Debounce and throttle solve different problems:

  - Debounce waits for activity to stop.
  - Throttle produces periodic updates while activity continues.

  For visual updates, `requestAnimationFrame` can act as a rendering-aware throttle:

  ```js
  let frameRequested = false;

  window.addEventListener("scroll", () => {
    if (frameRequested) {
      return;
    }

    frameRequested = true;

    requestAnimationFrame(() => {
      updateInterface(window.scrollY);
      frameRequested = false;
    });
  });
  ```

---

## Card 99

- question  
  How would you implement a deep clone?

- answer  
  In modern JavaScript, use `structuredClone()` when the input contains supported structured-clone values.

  ```js
  const copy = structuredClone(original);
  ```

  A custom implementation is necessary only when the application has specific cloning rules or unsupported values.

- explanation  
  A deep clone creates independent nested data, unlike spread syntax, which copies only the top level.

  ```js
  const copy = structuredClone(original);
  copy.settings.theme = "dark";
  ```

- details  
  `structuredClone()` supports many built-in types:

  - Objects and arrays
  - `Date`
  - `Map`
  - `Set`
  - Typed arrays
  - `ArrayBuffer`
  - Circular references

  It does not clone every kind of value. Functions and DOM nodes are notable unsupported examples.

  A basic custom implementation:

  ```js
  function deepClone(value, seen = new WeakMap()) {
    if (
      value === null ||
      typeof value !== "object"
    ) {
      return value;
    }

    if (seen.has(value)) {
      return seen.get(value);
    }

    if (value instanceof Date) {
      return new Date(value.getTime());
    }

    if (value instanceof Map) {
      const copy = new Map();
      seen.set(value, copy);

      for (const [key, item] of value) {
        copy.set(
          deepClone(key, seen),
          deepClone(item, seen)
        );
      }

      return copy;
    }

    if (value instanceof Set) {
      const copy = new Set();
      seen.set(value, copy);

      for (const item of value) {
        copy.add(deepClone(item, seen));
      }

      return copy;
    }

    const copy = Array.isArray(value)
      ? []
      : Object.create(Object.getPrototypeOf(value));

    seen.set(value, copy);

    for (const key of Reflect.ownKeys(value)) {
      copy[key] = deepClone(value[key], seen);
    }

    return copy;
  }
  ```

  Even this implementation does not preserve every possible property descriptor, internal slot, or built-in type.

  JSON conversion is not a general-purpose deep clone:

  ```js
  JSON.parse(JSON.stringify(value));
  ```

  It loses or changes values such as `undefined`, `Date`, `Map`, `Set`, `BigInt`, symbols, functions, and circular references.

  In an interview, explain the supported data types before presenting a custom clone.

---

## Card 100

- question  
  How would you implement a simplified version of `Promise.all`?

- answer  
  Convert the input into an array, resolve each value with `Promise.resolve`, store results by input index, and resolve when all operations fulfill.

  Reject immediately when any input rejects.

  ```js
  function promiseAll(iterable) {
    const values = Array.from(iterable);

    return new Promise((resolve, reject) => {
      if (values.length === 0) {
        resolve([]);
        return;
      }

      const results = new Array(values.length);
      let completed = 0;

      values.forEach((value, index) => {
        Promise.resolve(value).then(result => {
          results[index] = result;
          completed++;

          if (completed === values.length) {
            resolve(results);
          }
        }, reject);
      });
    });
  }
  ```

- explanation  
  Results must remain in input order even when the operations finish in a different order.

- details  
  Example:

  ```js
  const slow = new Promise(resolve => {
    setTimeout(() => resolve("slow"), 100);
  });

  const fast = Promise.resolve("fast");

  promiseAll([slow, fast, 42]).then(console.log);
  // ["slow", "fast", 42]
  ```

  The important behaviors are:

  - Accept an iterable
  - Accept both Promises and ordinary values
  - Preserve input order
  - Fulfill when every value fulfills
  - Reject when the first rejection is observed
  - Fulfill with an empty array for empty input

  `Promise.resolve(value)` also adopts compatible thenable values:

  ```js
  Promise.resolve({
    then(resolve) {
      resolve("thenable result");
    }
  });
  ```

  Rejecting the combined Promise does not cancel the other operations:

  ```js
  promiseAll([
    fetch("/first"),
    Promise.reject(new Error("Failed")),
    fetch("/third")
  ]);
  ```

  The Fetch operations may continue even though the combined Promise has rejected.

  A fully specification-compatible implementation has additional details involving iterator behavior, Promise subclasses, thenables, and error handling. Interview implementations are normally expected to demonstrate the core behavior.

---

## Card 101

- question  
  How would you retry a failed asynchronous operation?

- answer  
  Wrap the operation in a loop, catch failures, and try again until it succeeds or reaches the maximum number of attempts.

  Include a delay, preferably exponential backoff with jitter, and retry only failures that are likely to be temporary.

- explanation  
  Not every error should be retried. Validation failures and most client errors will not improve through repetition.

  ```js
  async function retry(operation, attempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }
  ```

- details  
  A more complete implementation:

  ```js
  function wait(milliseconds, signal) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(
        resolve,
        milliseconds
      );

      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId);
          reject(signal.reason);
        },
        { once: true }
      );
    });
  }

  async function retry(
    operation,
    {
      attempts = 3,
      initialDelay = 300,
      factor = 2,
      shouldRetry = () => true,
      signal
    } = {}
  ) {
    let lastError;

    for (let attempt = 1; attempt <= attempts; attempt++) {
      signal?.throwIfAborted();

      try {
        return await operation({
          attempt,
          signal
        });
      } catch (error) {
        lastError = error;

        if (
          attempt === attempts ||
          !shouldRetry(error)
        ) {
          throw error;
        }

        const baseDelay =
          initialDelay * factor ** (attempt - 1);

        const jitter = Math.random() * baseDelay * 0.2;

        await wait(baseDelay + jitter, signal);
      }
    }

    throw lastError;
  }
  ```

  Exponential backoff increases the delay:

  ```text
  300 ms → 600 ms → 1200 ms
  ```

  Jitter prevents many clients from retrying simultaneously.

  Good candidates for retry may include temporary network failures, rate limits, and some server errors. Respect server guidance such as a `Retry-After` header.

  Be careful when retrying non-idempotent operations. Repeating a payment or creation request could duplicate an action unless the API supports idempotency keys.

---

## Card 102

- question  
  How would you build an event emitter?

- answer  
  Store listeners by event name and provide methods to subscribe, unsubscribe, and emit events.

  A `Map` of event names to `Set` collections prevents duplicate listener entries and supports efficient removal.

  ```js
  class EventEmitter {
    #events = new Map();

    on(eventName, listener) {
      const listeners =
        this.#events.get(eventName) ?? new Set();

      listeners.add(listener);
      this.#events.set(eventName, listeners);

      return () => this.off(eventName, listener);
    }

    off(eventName, listener) {
      const listeners = this.#events.get(eventName);

      if (!listeners) {
        return;
      }

      listeners.delete(listener);

      if (listeners.size === 0) {
        this.#events.delete(eventName);
      }
    }

    emit(eventName, ...args) {
      const listeners = this.#events.get(eventName);

      if (!listeners) {
        return;
      }

      for (const listener of [...listeners]) {
        listener(...args);
      }
    }
  }
  ```

- explanation  
  Event emitters allow components to communicate without requiring the producer to know each consumer directly.

- details  
  Usage:

  ```js
  const emitter = new EventEmitter();

  const unsubscribe = emitter.on(
    "user:updated",
    user => {
      console.log(user.name);
    }
  );

  emitter.emit("user:updated", {
    name: "Alex"
  });

  unsubscribe();
  ```

  Copying the listener set during emission provides predictable behavior if a listener removes itself while the event is being processed:

  ```js
  for (const listener of [...listeners]) {
    listener(...args);
  }
  ```

  A `once` method can automatically unsubscribe:

  ```js
  once(eventName, listener) {
    const unsubscribe = this.on(
      eventName,
      (...args) => {
        unsubscribe();
        listener(...args);
      }
    );

    return unsubscribe;
  }
  ```

  Design decisions include:

  - Should duplicate listeners be allowed?
  - Should listener errors stop later listeners?
  - Should listeners run synchronously or asynchronously?
  - What happens when listeners are added during emission?
  - Should wildcard events be supported?
  - Is there a maximum-listener warning?

  Long-lived emitters can cause memory leaks when consumers forget to unsubscribe. Returning a cleanup function makes correct lifecycle management easier.

---

## Card 103

- question  
  How would you cache the result of a function?

- answer  
  Wrap the function with a cache that stores results using the function arguments as keys. When the same input appears again, return the stored result instead of recomputing it.

  This technique is called memoization.

  ```js
  function memoize(callback) {
    const cache = new Map();

    return function (argument) {
      if (cache.has(argument)) {
        return cache.get(argument);
      }

      const result = callback.call(this, argument);
      cache.set(argument, result);

      return result;
    };
  }
  ```

- explanation  
  Memoization is most valuable for deterministic, expensive functions that receive repeated inputs.

- details  
  A multi-argument implementation can use nested maps without converting arguments to strings:

  ```js
  function memoize(callback) {
    const root = new Map();
    const resultSymbol = Symbol("result");

    return function (...args) {
      let current = root;

      for (const argument of args) {
        if (!current.has(argument)) {
          current.set(argument, new Map());
        }

        current = current.get(argument);
      }

      if (current.has(resultSymbol)) {
        return current.get(resultSymbol);
      }

      const result = callback.apply(this, args);
      current.set(resultSymbol, result);

      return result;
    };
  }
  ```

  Stringifying arguments is simple but unreliable for general values:

  ```js
  const key = JSON.stringify(args);
  ```

  Problems include:

  - Property-order differences
  - Unsupported values
  - Circular references
  - Large serialization costs
  - Semantically different values producing similar keys

  Async functions require special consideration. Caching the Promise prevents duplicate concurrent work:

  ```js
  function memoizeAsync(callback) {
    const cache = new Map();

    return function (key) {
      if (!cache.has(key)) {
        const promise = callback.call(this, key);

        cache.set(key, promise);

        promise.catch(() => {
          cache.delete(key);
        });
      }

      return cache.get(key);
    };
  }
  ```

  Removing rejected Promises allows a later call to retry.

  Production caches may also need:

  - Expiration
  - Size limits
  - Least-recently-used eviction
  - Manual invalidation
  - Weak references for object keys
  - Protection against stale data

  Memoization should not be used for impure functions whose result changes despite identical arguments.

---

## Card 104

- question  
  How would you diagnose and improve a slow frontend application?

- answer  
  Begin by measuring the user-visible problem, reproduce it consistently, and use browser tools to identify whether the main bottleneck is network loading, JavaScript execution, rendering, memory, or backend latency.

  Apply a targeted improvement and measure again to verify the result.

- explanation  
  Performance work should follow evidence:

  ```text
  Measure → identify bottleneck → optimize → verify
  ```

  A faster internal operation is not valuable unless it improves the user experience or prevents a meaningful resource problem.

- details  
  Start by clarifying the symptom:

  - Is the initial page slow?
  - Is an interaction delayed?
  - Is scrolling or animation uneven?
  - Does performance degrade over time?
  - Is the problem limited to certain devices or networks?
  - Is the backend response slow?

  Useful browser tools include:

  - Network panel
  - Performance profiler
  - Memory profiler
  - Rendering diagnostics
  - Lighthouse
  - Coverage tools
  - Framework-specific profilers
  - Bundle analyzers

  For slow initial loading, inspect:

  - Large JavaScript bundles
  - Render-blocking resources
  - Slow API responses
  - Unoptimized images or fonts
  - Missing compression or caching
  - Excessive third-party scripts
  - Duplicate dependencies

  Potential improvements include:

  - Code splitting
  - Lazy loading
  - Tree shaking
  - Image optimization
  - Resource caching
  - Preloading critical assets
  - Reducing third-party code
  - Server-side or static rendering where appropriate

  For slow interactions, inspect the main-thread timeline for long tasks:

  ```js
  performance.mark("operation-start");

  performOperation();

  performance.mark("operation-end");

  performance.measure(
    "operation",
    "operation-start",
    "operation-end"
  );
  ```

  Potential improvements include:

  - Reducing unnecessary work
  - Breaking long tasks into smaller units
  - Moving CPU-heavy work to Web Workers
  - Debouncing or throttling frequent events
  - Virtualizing large lists
  - Avoiding unnecessary component renders
  - Caching expensive calculations

  For rendering problems, look for:

  - Layout thrashing
  - Large DOM trees
  - Expensive CSS selectors
  - Frequent style recalculation
  - Large paint areas
  - Animations using layout-triggering properties

  For degradation over time, inspect:

  - Forgotten event listeners
  - Active timers
  - Detached DOM nodes
  - Unbounded caches
  - Retained subscriptions
  - Repeatedly created resources

  Compare results before and after the change using the same conditions. Confirm improvements with real-user monitoring when possible because local development hardware may not represent actual users.

  