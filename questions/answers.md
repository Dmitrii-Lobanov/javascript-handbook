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