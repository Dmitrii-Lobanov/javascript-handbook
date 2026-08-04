# Chapter 10 — Equality, Identity, and Coercion

## Learning objectives

After completing this chapter, you should be able to:

- distinguish strict equality, loose equality, `Object.is`, and SameValueZero;
- predict when equality compares primitive values and when it compares object identity;
- trace coercion through `ToPrimitive`, numeric conversion, and string conversion;
- explain the special behavior of `NaN`, signed zero, `null`, and `undefined`;
- choose comparison and validation strategies that make application intent explicit;
- connect equality semantics to React state, dependency arrays, `Map`, and `Set`.

## Quick Refresher

- Equality operators do not perform deep structural comparison.
- `===` avoids type conversion, but `NaN !== NaN` and `0 === -0`.
- `Object.is` treats `NaN` as equal to itself and distinguishes `0` from `-0`.
- `Map`, `Set`, and `Array.prototype.includes` use SameValueZero: `NaN` matches itself and signed zeros match.
- `==` follows a defined coercion algorithm; it is not simply “compare after converting both sides.”
- Objects are equal only when both operands identify the same object.
- Objects may be converted to primitives before arithmetic or loose comparison.
- Explicit conversion is usually clearer at system boundaries than relying on operator coercion.

## Why This Matters

Senior interviews rarely stop at “always use triple equals.” They ask why `NaN` behaves differently across APIs, why two identical-looking objects are unequal, why `[] == false` is true, or why a React update using `NaN` may bail out.

The useful skill is not memorizing surprising outputs. It is selecting the correct comparison algorithm and tracing only the conversions that algorithm requires.

## Core Mental Model

Evaluate a comparison in three steps:

1. **Name the operation.** Is it strict equality, loose equality, `Object.is`, SameValueZero, or relational comparison?
2. **Apply its conversion rules.** Some operations compare types directly; others convert one operand or convert an object to a primitive.
3. **Compare the resulting values.** Primitive values compare according to the chosen algorithm. Objects compare by identity.

The common equality operations differ at a few important edges:

| Operation                                | Coerces different types | `NaN` equals itself | `0` equals `-0` | Objects compare by identity |
| ---------------------------------------- | ----------------------- | ------------------- | --------------- | --------------------------- |
| `===`                                    | No                      | No                  | Yes             | Yes                         |
| `==`                                     | Sometimes               | No                  | Yes             | Yes                         |
| `Object.is`                              | No                      | Yes                 | No              | Yes                         |
| SameValueZero (`Set`, `Map`, `includes`) | No                      | Yes                 | Yes             | Yes                         |

No entry performs recursive object comparison.

## Formal Model

### Strict equality

Strict equality normally returns `false` when operand types differ:

```js
1 === "1"; // false
false === 0; // false
null === undefined; // false
```

For operands of the same type:

- strings compare their sequences of code units;
- booleans compare their logical value;
- numbers compare numerically, except `NaN` never equals anything and signed zeros compare equal;
- BigInts compare their mathematical integer values;
- Symbols compare their Symbol identity;
- objects compare their object identity.

```js
const first = { role: "admin" };
const second = { role: "admin" };
const alias = first;

first === second; // false
first === alias; // true
```

“Strict” means no type coercion. It does not mean deep, safer in every context, or mathematically perfect.

### `Object.is` and SameValue

`Object.is` exposes the specification's SameValue comparison:

```js
Object.is(NaN, NaN); // true
Object.is(0, -0); // false
Object.is({}, {}); // false
```

These signed-zero semantics matter in uncommon numeric domains. In ordinary application logic, the `NaN` behavior is usually the more useful distinction.

React uses `Object.is` semantics when comparing state values and dependency entries.

### SameValueZero

SameValueZero combines the convenient edges of strict equality and `Object.is`: `NaN` equals itself, while `0` and `-0` remain equal.

```js
[NaN].includes(NaN); // true
[NaN].indexOf(NaN); // -1

new Set([NaN, NaN]).size; // 1
new Map([[0, "zero"]]).get(-0); // "zero"
```

`includes`, `Set`, and `Map` use SameValueZero. `indexOf` uses strict equality, which is why the two array searches differ for `NaN`.

### Abstract equality

Loose equality is a precise algorithm that permits selected conversions when types differ.

Important rules include:

- `null == undefined` is `true`, and neither is loosely equal to other values;
- a Number and a String comparison converts the String to Number;
- a Boolean is converted to Number before comparison;
- an Object compared with a primitive is first converted to a primitive;
- a Number and BigInt can compare equal when they represent the same mathematical value;
- `NaN` remains unequal to everything.

```js
"42" == 42; // true
false == 0; // true
null == undefined; // true
null == 0; // false
42n == 42; // true
```

Do not summarize this as “JavaScript converts both values to the same type.” The algorithm chooses a conversion based on the specific pair of types, and `null == 0` demonstrates that it does not simply convert everything to Number.

### Object-to-primitive conversion

When an operation requires a primitive from an object, JavaScript applies `ToPrimitive` with a hint such as `number`, `string`, or `default`.

At a high level, conversion can use:

1. `obj[Symbol.toPrimitive](hint)`, when present;
2. otherwise, ordinary conversion that tries `valueOf` and `toString` in an order determined by the hint.

```js
const amount = {
  value: 40,
  [Symbol.toPrimitive](hint) {
    return hint === "string" ? `$${this.value}` : this.value;
  },
};

Number(amount); // 40
String(amount); // "$40"
amount == 40; // true
```

The conversion must eventually produce a primitive. Returning another object from every attempted conversion method causes a `TypeError`.

Most ordinary objects stringify as `"[object Object]"`, while arrays stringify by joining their elements:

```js
String({}); // "[object Object]"
String([]); // ""
String([1, 2]); // "1,2"
```

These results explain many loose-equality puzzles without requiring special array rules.

### The `+` operator is overloaded

Binary `+` first converts objects to primitives. If either resulting primitive is a String, it performs string concatenation; otherwise it performs numeric addition.

```js
1 + 2; // 3
1 + "2"; // "12"
"1" + 2 + 3; // "123"
1 + 2 + "3"; // "33"
```

Evaluation is left-to-right. Parenthesization therefore changes which intermediate value becomes a String.

BigInt and Number cannot be mixed by arithmetic:

```js
1n + 1; // TypeError
```

### Boolean contexts are not equality comparisons

Conditions use truthiness through Boolean conversion:

```js
if ([]) {
  // runs: every object is truthy
}

Boolean("false"); // true
Boolean(0); // false
```

The falsy values are `false`, `0`, `-0`, `0n`, `NaN`, `""`, `null`, and `undefined`. Every object—including `[]`, `{}`, and `new Boolean(false)`—is truthy.

Do not use `value == true` as a truthiness test. Loose equality applies its own conversion rules and can disagree with Boolean conversion.

## Step-by-Step Runtime Walkthrough

Explain why this is true:

```js
[] == false; // true
```

Trace the abstract equality algorithm:

1. The operands are Object and Boolean.
2. The Boolean `false` converts to Number `0`.
3. The array must be compared with the primitive Number, so it is converted to a primitive.
4. An empty array's ordinary string conversion produces `""`.
5. Comparing String `""` with Number `0` converts the String to Number `0`.
6. Number `0` equals Number `0`.

This result does not mean an empty array is falsy:

```js
Boolean([]); // true
```

The condition and the loose comparison invoke different abstract operations.

## Practical Comparison Patterns

### Treat input parsing and validation separately

Browser inputs and URL parameters usually provide strings. Convert once at the boundary, then validate the converted value:

```js
function parsePage(raw) {
  const page = Number(raw);

  if (!Number.isInteger(page) || page < 1) {
    return null;
  }

  return page;
}
```

This is clearer than repeatedly relying on comparisons such as `raw == 1` throughout business logic.

`Number.isNaN(value)` tests whether a value is specifically the Number value `NaN`. Global `isNaN(value)` converts first and therefore answers a different question.

### Use the nullish pair deliberately

One defensible use of loose equality is a concise nullish check:

```js
if (value == null) {
  // value is null or undefined
}
```

This works because the abstract equality algorithm makes `null` and `undefined` equal only to each other. Use it only when the team recognizes the idiom; `value === null || value === undefined` is more explicit.

For defaults, distinguish nullish values from all falsy values:

```js
const retries = configuredRetries ?? 3;
const label = suppliedLabel || "Untitled";
```

`??` falls back only for `null` or `undefined`. `||` falls back for any falsy value, including `0` and `""`.

### Structural equality is application-defined

JavaScript has no universal built-in deep-equality operator. A correct structural comparison must define policies for prototypes, property order, Symbols, non-enumerable properties, cycles, dates, maps, sets, typed arrays, and other specialized objects.

`JSON.stringify(a) === JSON.stringify(b)` is not a general deep-equality solution. Serialization omits or transforms some values, fails on cycles and BigInt, and can produce different text for objects with different property order.

Prefer domain-specific comparisons or a well-tested library whose semantics match the data.

## Common Misconceptions

| Claim                                        | Better explanation                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| “`===` compares object contents.”            | It compares object identity.                                                            |
| “`Object.is` is always stricter than `===`.” | It differs specifically for `NaN` and signed zero.                                      |
| “`==` converts both sides to Number.”        | It selects conversions based on the pair of operand types.                              |
| “Empty arrays are falsy.”                    | Every object is truthy; `[] == false` follows equality coercion, not truthiness.        |
| “`includes` and `indexOf` compare equally.”  | `includes` uses SameValueZero; `indexOf` uses strict equality.                          |
| “Stringifying objects gives deep equality.”  | JSON serialization has narrower, configurable semantics and important information loss. |
| “`                                           |                                                                                         | `and`??` provide the same default.” | `   |     | `reacts to all falsy values;`??` reacts only to nullish values. |

## React Connection

React compares state updates and dependency-array entries using `Object.is` semantics:

```jsx
const [value, setValue] = useState(NaN);

setValue(NaN); // React can bail out: Object.is(NaN, NaN) is true
```

For objects, comparison remains identity-based:

```jsx
function Search({ query }) {
  const options = { query };

  useEffect(() => {
    runSearch(options);
  }, [options]);
}
```

`options` is a new object after every render, so the dependency differs even when `query` is unchanged. Prefer depending on `query` directly or constructing the object inside the effect.

Do not replace identity comparison with deep comparison by default. Deep comparison adds cost, hides unstable ownership, and requires semantics for every nested value. First design state and dependencies so identity changes represent meaningful changes.

## Performance and Debugging

Equality is usually cheap; repeated coercion, allocation, serialization, or deep traversal may not be. Optimize only after identifying the actual hot path.

When a comparison is surprising:

1. Record both operand values and types.
2. Identify the operator or API and its comparison algorithm.
3. If coercion occurs, write each intermediate primitive explicitly.
4. For objects, check identity before inspecting properties.
5. Handle `NaN`, signed zero, and nullish values deliberately when relevant.

Avoid debugging solely with string interpolation because it can coerce values. Log the values separately and inspect them with `typeof`, `Object.is`, and appropriate type guards.

## Interview Questions

### Level 1 — Fundamentals

**Question:** How do `===` and `Object.is` differ?

**Model answer:** Both avoid coercion and compare objects by identity. They differ for two Number cases: `Object.is(NaN, NaN)` is true while `NaN === NaN` is false, and `Object.is(0, -0)` is false while `0 === -0` is true.

### Level 2 — Applied understanding

**Question:** Why does `[NaN].includes(NaN)` return true while `[NaN].indexOf(NaN)` returns `-1`?

**Model answer:** `includes` uses SameValueZero, under which `NaN` equals itself. `indexOf` uses strict equality, under which `NaN` is unequal to every value, including itself.

### Level 3 — Senior reasoning

**Question:** Is using `==` always a bug?

**Model answer:** No. It follows a specified algorithm, and `value == null` can intentionally test for both nullish values. However, mixed-type coercion is easy to misread at application boundaries. I normally convert input explicitly and use strict equality, allowing loose equality only for a narrow, documented idiom.

### Level 4 — Deep follow-up

**Question:** Why is there no simple universal deep-equality operation for JavaScript objects?

**Model answer:** Structural equality requires policy decisions: prototypes, descriptors, Symbols, key order, cycles, and specialized internal state for collections, dates, typed arrays, and other built-ins. Different domains need different definitions, so I use identity by default and a domain-specific comparator when structural equivalence is genuinely required.

## Exercises

### 1. Choose the algorithm

Predict each result:

```js
NaN === NaN;
Object.is(NaN, NaN);
Object.is(0, -0);
new Set([0, -0]).size;
```

<details>
<summary>Solution</summary>

The results are `false`, `true`, `false`, and `1`. Strict equality rejects `NaN`; SameValue accepts it and distinguishes signed zero; SameValueZero used by `Set` treats signed zeros as equal.

</details>

### 2. Trace coercion

Explain the result:

```js
[1] == 1;
```

<details>
<summary>Solution</summary>

It is `true`. The array converts to the primitive String `"1"`; comparison between String and Number then converts the String to Number `1`, which equals the other Number.

</details>

### 3. Preserve valid falsy input

Repair this default so a configured value of `0` is preserved:

```js
const delay = config.delay || 250;
```

<details>
<summary>Solution</summary>

Use `const delay = config.delay ?? 250;`. Nullish coalescing uses the default only when the value is `null` or `undefined`.

</details>

### 4. Diagnose the effect

Why does this effect run after every render?

```jsx
useEffect(() => subscribe({ topic }), [{ topic }]);
```

<details>
<summary>Solution</summary>

The object in the dependency array is newly created on every render. `Object.is` compares object identity, so every instance differs. Depend on `topic` and create the options object inside the effect.

</details>

## Chapter Summary

- JavaScript exposes several comparison algorithms with different `NaN` and signed-zero behavior.
- Strict equality avoids coercion but compares objects only by identity.
- Loose equality applies defined, type-directed conversions.
- Object-to-primitive conversion explains many arithmetic and equality surprises.
- Truthiness is Boolean conversion, not loose equality with `true` or `false`.
- `Map`, `Set`, and `includes` use SameValueZero.
- React uses `Object.is` for state and dependency comparisons.
- Structural equality needs explicit domain semantics.
- Convert and validate external input at boundaries instead of spreading implicit coercion through application logic.

### Interview-ready explanation

JavaScript does not have one universal equality rule. Strict equality avoids coercion, SameValue through `Object.is` additionally equates `NaN` and distinguishes signed zero, and SameValueZero equates `NaN` while treating signed zeros alike. Loose equality follows a type-directed coercion algorithm, including object-to-primitive conversion; it is not simply “convert both sides.” Objects compare by identity under all these operations. In production code, I normally normalize external input explicitly, choose the comparison that matches the domain, and rely on structural comparison only when its semantics are clearly defined.

## Further Reading

- [ECMA-262: Equality Operators](https://tc39.es/ecma262/#sec-equality-operators)
- [ECMA-262: Abstract Equality Comparison](https://tc39.es/ecma262/#sec-islooselyequal)
- [ECMA-262: Strict Equality Comparison](https://tc39.es/ecma262/#sec-isstrictlyequal)
- [ECMA-262: SameValue and SameValueZero](https://tc39.es/ecma262/#sec-samevalue)
- [ECMA-262: ToPrimitive](https://tc39.es/ecma262/#sec-toprimitive)
- [MDN: Equality Comparisons and Sameness](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness)
- [React: Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
