# JSX folding: prop evaluation spec

Specifies how folded usages evaluate prop values: impure values are bound once as IIFE
parameters, replacing the `precompute-style-prop-values` eslint rule with a compiler
transform that preserves the evaluate-once semantics of attribute position. Decisions
D1-D6 are resolved below; a hoisted-helper variant is a follow-up, not part of this
change.

The invariant this spec buys: **a folded usage evaluates every attribute expression the
same number of times and in the same observable order as the unfolded JSX.** The only
accepted divergences are two documented evaluation-*count* classes (D6 elision of unread
`$props`, getter/throwing reads admitted as pure); there is no ordering divergence class.
And the IIFE costs nothing where it matters: swc and terser dissolve it into a temp
assignment in production (verified below).

Design bet: **next-yak targets official React** - the `react-hooks` lint rules and React
Compiler - on the assumption that both are where the ecosystem lands over the next years.
The fold composes with them rather than around them: the lint this change deletes hands
its job back to React's own purity rule, the fold is purity-transparent so both tools
reach the same verdict before and after folding, and every emitted shape is verified
against React Compiler (D2, D4). The division of labour is the point - yak's job is to
preserve unfolded React semantics exactly, and it is React's own tools, not a yak-specific
lint, that judge whether the source obeys the rules.

Stack (nothing merged to main yet):

```
main <- perf-cssprop-folding (#567) <- perf-styled-jsx-folding (#568) <- perf-fold-any-prop-value (#595)
```

Scope: next-yak supports **React 19+ only** (`packages/next-yak/package.json:187`), which
matters for `ref` (see the last section).

## The problem

JSX folding inlines a styled component into its usage by substituting props with the
attribute values. This moves the attribute expression out of **unconditional attribute
position**, where it is evaluated exactly once in source order, and into **arbitrary
expression position** inside the conditions. That changes how often the expression runs
in three distinct ways, all verified against the fixture harness.

### 1. Duplication: read at two sites

```tsx
const Sticker = styled.div<{ $tilt: number }>`
  ${(p) => p.$tilt > 5 && css`transform: rotate(3deg);`}
  ${(p) => p.$tilt > 8 && css`box-shadow: 0 0 8px black;`}
`;

<Sticker $tilt={Math.random() * 10} />

// two rolls
<div className={"a1" + (Math.random()*10 > 5 ? " a2" : "") + (Math.random()*10 > 8 ? " a3" : "")} />
```

The sticker can get the shadow without the rotation - a state the component could never
render. Duplication is per read **site**, not per condition: one condition reading twice
(`${({ $a }) => $a > 5 && $a < 10 && css`...`}`) duplicates exactly like two conditions
reading once.

Non-`$` props duplicate even with a single read site, because `is_transient_prop`
(`styled_jsx_fold.rs:318`) only drops `$`-prefixed attributes - everything else stays on
the element *and* feeds the conditions:

```tsx
<Button disabled={Math.random() > 0.5} />
<button disabled={Math.random() > 0.5} className={"b1" + (Math.random() > 0.5 ? " b2" : "")} />
```

### 2. Multiplication: read inside a callback

```tsx
const InCallback = styled.div<{ $n?: number }>`
  ${({ $n }) => list.some((x) => x > $n) && css`color: red;`}
`;

<InCallback $n={props.roll()} />
// compiled today: props.roll() runs once PER LIST ELEMENT
```

### 3. Elision: read behind a short circuit

```tsx
const ShortCircuit = styled.div<{ $b?: boolean }>`
  ${({ $b }) => flag && $b && css`color: blue;`}
`;

<ShortCircuit $b={props.roll()} />
// compiled today: props.roll() runs ZERO times when flag is falsy
```

Ternary branches elide the same way. So does a `$prop` no condition reads:
`styled_jsx_fold.rs:311-313` drops every `$`-attribute from a dynamic fold whether it is
read or not.

**Only case 1 is a duplication problem. Cases 2 and 3 are reachable with a single read.**
Any gate that counts reads and fires at `>= 2` misses them - the central correction to
the first draft. The #595 eslint rule misses cases 2 and 3 as well
(`precomputeStylePropValues.ts:314`).

## Why bailing is not an option

Bailing to the runtime path on impure values would be safe and cheap, but the SSR
benchmark quantifies what each bail forfeits: the folded build renders at 193k renders/s
against 73k for next-yak 9.5 (2.6x), sustains 234 req/s under load against 130 (1.8x),
beats the tailwind `cn()` reference (cnfast) under load by 2x, and eliminates the
styling-runtime self-time slice entirely - the folded profile is react-dom's floor
(~2.07 ms/render median) plus user code. Every bail falls back toward the 9.5 bar. The
fix below keeps impure values folding *correctly* instead of not folding them.

## Proposal

When a prop value is read by a condition and is not provably pure, bind it once as an
IIFE parameter and substitute the *parameter* into the conditions. The parameter restores
the guarantee attribute position gave: evaluated exactly once, unconditionally, in source
order. The value expression never moves - it stays at the usage site in **argument
position**, so conditional and nested usages keep their per-branch, per-render evaluation.

Two output shapes (D2):

```tsx
// $props only: nothing but className leaves the closure - className-IIFE
<div className={(($tilt) => "a1" + ($tilt > 5 ? " a2" : "") + ($tilt > 8 ? " a3" : ""))(Math.random() * 10)} />

// a non-$ prop must reach the element too: wrap the element itself - element-wrap IIFE
{(($d) => <button disabled={$d} className={"b1" + ($d ? " b2" : "")} />)(Math.random() > 0.5)}
```

The element-wrap replaces the first draft's spread form
(`<button {...iife(f())} />`), which was rejected because the element-wrap removes the
spread's entire correctness surface at once: no spread placement semantics, no
`key`-in-spread hazard (`key` stays a normal attribute on the wrapped element, which is
still the element in list position), `data-*`/`aria-*` and the user `className` stay
plain attributes, and the props object stays a flat literal that JSX static analysis can
see through. Cost is a wash: one closure per render (which the minifier removes, below)
versus the spread's extra object plus copy.

When a usage needs the element-wrap, it covers everything - there is never a
className-IIFE nested inside an element-wrap - and it binds **every evaluated
reorder-impure attribute value** (consumed or not, `$` or not, the user className
expression included) as a parameter in source order. That full capture is what makes the
element-wrap exact by construction: without it, `<Button id={g()} disabled={f()} />`
would run `f` before `g`, because IIFE arguments evaluate before the closure body.

## The gate

```
IIFE parameter  <=>  read by >= 1 style-condition read site  AND  not provably pure
```

Not `>= 2` - one read is enough to multiply or elide. A prop read by **zero** conditions
is the only exempt case: it never leaves attribute position, so `id={f()}` stays inline.

### Purity is two predicates, not one

**dup-pure** - safe to evaluate 0..N times. Gates whether a *consumed* value is inlined
at its read sites or becomes a parameter. Needs effect-freedom *and* identity-freedom.

- **pure**: literal, identifier, member and optional chain over pure - including
  computed access with a pure key (`colors[status]`, `p?.x`; excluding computed members
  would IIFE one of the most common prop shapes), unary (not `delete`), binary, logical,
  conditional, template literal over pure - all judged under `unwrap_type_casts`
  (`ast_helper.rs:133-147`, which also strips parens, so `$a={(x)}` and `f() as number`
  are judged unwrapped).
- **impure**: call, new, update, tagged template, `await`, JSX elements/fragments and
  array/object literals (effect-free but identity-bearing: two reads are two objects),
  and anything unrecognised.

The eslint rule's `isSafeToInline` (`precomputeStylePropValues.ts:26`) is deliberately
narrower (a lint nag is harmless) and would IIFE `$active={i % 4 !== 0}` - the single
most common dynamic prop shape. Its arithmetic does not carry over.

**reorder-pure** - safe to move relative to other evaluations while still evaluated
exactly once. Gates shape selection for *unconsumed* values, where identity and
allocation are invisible. Superset of dup-pure, additionally admitting:

- arrow/function expressions (creating a closure is unobservable - this is what keeps
  `onClick={() => setOpen(true)}`, present on nearly every interactive element, from
  forcing the element-wrap),
- array/object literals without spread over reorder-pure values (a spread reads getters),
- JSX elements/fragments over reorder-pure values (`jsx()` allocates, doesn't observe).

Both predicates live in one module so they cannot drift.

### Accepted divergence: effectful "pure" reads

Admitting member reads as pure knowingly diverges for pathological values: `$a={obj.x}`
with a getter fires per read site (or zero times when elided); a throwing read (`obj`
undefined) behind an elision doesn't throw. Accepted and documented rather than gated -
gating members would IIFE the most common shapes - and the follow-up helper design
eliminates this class entirely.

### React's purity rule is an ally, not a substitute

The `react-hooks` purity lint (React Compiler's rule set, "components and hooks must be
idempotent") flags `$tilt={Math.random() * 10}` with or without yak - an impure call in
attribute position during render is already invalid React. Three uses, one non-use:

- **Normative backing for the accepted divergences.** Every case where the fold diverges
  observably from the runtime path - effectful getters, the D6 elision - is a
  render-purity violation React itself forbids. The divergences are only observable in
  code already broken by React's own rules, with an official lint pointing at the value.
- **It succeeds the deleted lint.** D1 removes `precompute-style-prop-values`; the
  education role passes to the ecosystem rule, which flags the value at its source with
  react.dev docs attached, instead of asking users to lint around a yak implementation
  detail.
- **The fold is purity-transparent - pin it in CI.** Values never move and parameters
  evaluate exactly once, so folded output violates the rule iff the source did. A lint
  error on folded output (as seen on the fixture with `Math.random()` as the IIFE
  argument) is the input's violation surfacing, not a fold-created impurity. Cheap CI
  property: the purity lint's verdict on `input.tsx` equals its verdict on the folded
  output.
- **It does not let us drop the IIFE.** React-pure is weaker than dup-pure: the rules
  explicitly permit local mutation and fresh allocations during render (`i++` on a
  render-local counter, `$items={list.filter(fn)}`, `$icon={<Icon/>}`) - exactly the
  identity- and count-sensitive shapes the parameter protects. The dramatic examples in
  "The problem" use rule-violating values because they make the mechanics visible; for
  fully rule-compliant code the IIFE still buys identity stability and work-count
  stability (case 2 multiplies an idempotent-but-costly call once per list element),
  and for the many codebases not running the lint it buys unchanged semantics.

React Compiler composes the same way (verified on the real folded output, both shapes):
it compiles despite the lint error - lint and compiler are decoupled - outlines the
className-IIFE to a module-scope `_temp($tilt)`, and memo-caches the whole element, so
`Math.random() * 10` runs once *ever*, not once per render. The element-wrap it leaves
untouched: no outlining (that closure captures children and siblings, so it cannot hoist)
and no cache slot - but the *identical shape without the IIFE* is left untouched too, so
the wrap forfeits no memoization. An IIFE in JSX position is not a React Compiler bailout
trigger; this was the one hypothesis that could have reopened D2, and the control
disproved it. That freeze is RC's
documented behavior for rule-violating values and it hits the unfolded source
identically (`<Sticker $tilt={Math.random() * 10} />` lands in the same cache slot).
The invariant is therefore scoped precisely: **the fold guarantees folded == unfolded;
transforms downstream that assume the React rules act on both forms alike**, and only
rule-violating values are affected by them at all - rule-compliant impure shapes
(local mutation, fresh allocations) are tracked by RC's dependency analysis and keep
their per-render evaluation.

### `await` values

`$a={await f()}` in an async server component is legal and impure, so it takes a
parameter. This only compiles because the value stays in argument position -
`((p) => ...)(await f())` is valid inside the async component, while moving the `await`
into the synthesized non-async closure would be a syntax error. Satisfied by construction
(values never move); an async-RSC fixture pins it.

## Evaluation order

Resolves D3. `<button disabled={f()} title={g()} />` runs `f` then `g` today; these rules
keep observable order exact:

1. **Arguments in attribute source order.** Arguments evaluate left-to-right, so order
   among all captured values is preserved exactly - independent of the order the
   *conditions* read them:

   ```tsx
   <Row $b={f()} $a={g()} />
   // conditions read $a first - irrelevant, parameters are bound before the body runs
   <div className={(($b, $a) => "r1" + ($a > 0 ? " r2" : "") + ($b ? " r3" : ""))(f(), g())} />
   ```

   Identical expressions are never deduped - `<Row $b={f()} $a={f()} />` binds two
   parameters and calls `f()` twice, exactly as attribute position did.
2. **Reorder-pure values move freely** - that is the definition. They stay inline
   wherever they land.
3. **Placement.** The synthesized className is inserted at the source index of the first
   consumed reorder-impure attribute (not `attrs.push`, which would evaluate the
   arguments after every other attribute); a merge into an existing user `className`
   keeps that attribute's index. The merge composes outside the closure
   (`mergeClassNames(iife(f()), user)`), so the user expression - and any
   `/*YAK Extracted CSS:*/` comment span on it - never relocates, and evaluates after
   the parameter block.
4. **Escalation instead of residual.** The className-IIFE is exact iff no reorder-impure
   unconsumed evaluation sits in source order between the placement index and any
   consumed reorder-impure attribute. When one does - `$a={f()} id={g()} $b={h()}`,
   where `g` would jump the parameter block, or an impure user `className={cn(x)}`
   preceding a consumed impure attribute - the usage takes the element-wrap, whose full
   capture is exact by construction. The first draft accepted this as a documented
   ordering leak; with arrows and object literals classified reorder-pure, escalation
   fires only on genuinely effectful sandwiched values, so the absolute invariant costs
   almost nothing.

## Minifier interplay (verified)

Measured on the exact output shapes with the workspace toolchain (@swc/core 1.15,
terser 5.44, esbuild 0.28):

| shape | swc (Next.js prod) | terser | esbuild (Vite default) |
| --- | --- | --- | --- |
| pure inline concat, literal usage | folds to `"m7uBBu m7uBBu3"` | same | same |
| className-IIFE, impure arg | dissolved: `let $tilt; ... ($tilt = roll()) > 5 ...` | dissolved (sequence expr) | IIFE kept, params mangled |
| className-IIFE, literal arg | constant-folds **through** the IIFE to `"a1 a2 a3"` | same | IIFE kept |
| element-wrap, impure arg | dissolved: `disabled: $d = f(), ...` | dissolved | IIFE kept |

Consequences:

- **Zero per-render closure allocation in production** on swc and terser chains - the
  IIFE is a source-level shape, not a runtime cost. Only esbuild-minified Vite builds and
  dev mode keep the closure: one allocation per render, invisible next to the ~2 ms
  react-dom floor. (Re-verify with oxc when rolldown-vite becomes the Vite default.)
- **The purity allowlist is not for swc's benefit** - swc recovers even a misclassified
  literal through the IIFE. It is what keeps dev output readable and esbuild output
  closure-free, and what preserves the fully-static-usage -> single string literal
  guarantee on *every* minifier, since esbuild folds the plain concat but not through an
  IIFE. "IIFE everything and let the minifier back-substitute" is therefore not an
  option.
- **Code size**: the wrapper bytes vanish under swc/terser; under esbuild the overhead is
  the mangled wrapper, ~15 B per usage pre-gzip.

## Case table

`reads` is the number of style-condition read sites.

| Usage | reads | dup-pure | Outcome |
| --- | --- | --- | --- |
| `$a={size}` | 2 | yes | inline, duplicated (free) |
| `$a={i % 4 !== 0}` | 2 | yes | inline (widened allowlist) |
| `$c={colors[status]}` | 1 | yes | inline (computed member over pure) |
| `$a={p?.x}` | 1 | yes | inline |
| `$a={f()}` | 1+ | no | **IIFE** (one read multiplies or elides; two duplicate) |
| `$a={f()}` | 2 (one condition) | no | **IIFE**, single parameter (pins read-site counting) |
| `<Row $b={f()} $a={g()} />` | 1 each | no | **IIFE** `(($b, $a) => ...)(f(), g())` - argument order = attribute order |
| `<Row $b={f()} $a={f()} />` | 1 each | no | **IIFE**, two parameters, `f()` twice - never deduped |
| `$t={new Date()}` | 1 | no | **IIFE** (pins allowlist against a "contains a call" gate) |
| `$a={f() as number}` | 1 | no | **IIFE** (pins `unwrap_type_casts`) |
| `$a={await f()}` (RSC) | 1 | no | **IIFE**, `await` stays in argument position |
| `$icon={<Icon/>}` | 1 | no | **IIFE** (element identity evaluated once) |
| `$a={f()}` | 0 | - | elided, never evaluated (D6) |
| `id={f()}` | 0 | - | inline, stays on the element only |
| `onClick={() => setOpen(true)}` | 0 | reorder-pure | inline, never forces element-wrap |
| `disabled={f()}` | 1 | no | **element-wrap IIFE** |
| `$a={f()} id={g()} $b={h()}` | sandwich | no | **element-wrap**, parameters `f, g, h` in source order |

Bails are unchanged and stay on the runtime path: cross-file components, `theme` access,
`key`/`children`/`className`/`style` reads, `.attrs()`, css variables,
`styled(Component)` with conditions, spread at the usage, non top level `const`, and
type arguments on the usage (`styled_jsx_fold.rs:284`).

## Case -> emitted code

The case table decides the gate; this is the emission contract. Components used:

```tsx
const Sticker = styled.div<{ $tilt: number }>`
  ${(p) => p.$tilt > 5 && css`...`}          /* a2, base a1 */
  ${(p) => p.$tilt > 8 && css`...`}          /* a3 */
`;
const Row = styled.div<{ $a?: boolean; $b?: boolean }>`
  ${({ $a }) => $a && css`...`}              /* r2, base r1 */
  ${({ $b }) => $b && css`...`}              /* r3 */
`;
const Button = styled.button<{ disabled?: boolean }>`
  ${({ disabled }) => disabled && css`...`}  /* b2, base b1 */
`;
```

Every case carries a real-world frequency (**dominant · common · occasional · rare**) -
how likely the shape is to occur repeatedly in a real codebase. The frequencies are
design input: the dominant and common cases must land on the cheapest output, and it is
acceptable for rare cases to take the heavier shape.

**Inline** - every consumed value dup-pure; today's output, unchanged:

```tsx
// dominant - identifiers, member reads, comparisons make up nearly all dynamic props
<Sticker $tilt={tilt} />
<div className={"a1" + (tilt > 5 ? " a2" : "") + (tilt > 8 ? " a3" : "")} />

// dominant - literal/bare variant props; bare reads true, absent reads void 0,
// the minifier folds the usage to a single static string
<Row $a />
<div className={"r1" + (true ? " r2" : "") + (void 0 ? " r3" : "")} />

// common - impure non-$ attr read by no condition (aria-label={t("key")},
// value={format(x)}): never leaves attribute position, stays put
<Sticker $tilt={tilt} aria-label={t("save")} />
<div aria-label={t("save")} className={"a1" + (tilt > 5 ? " a2" : "") + (tilt > 8 ? " a3" : "")} />

// rare (user error) - unread impure $-prop: elided, f() never runs (D6)
<Sticker $tilt={tilt} $track={f()} />
<div className={"a1" + (tilt > 5 ? " a2" : "") + (tilt > 8 ? " a3" : "")} />
```

**className-IIFE** - impure consumed values are all `$`-props, ordering exact:

```tsx
// common - a call as a $-prop value ($active={isSelected(item)})
<Sticker $tilt={roll()} />
<div className={(($tilt) => "a1" + ($tilt > 5 ? " a2" : "") + ($tilt > 8 ? " a3" : ""))(roll())} />

// common - impure $-prop next to an event handler; the arrow is reorder-pure so this
// stays the cheap shape (classifying arrows impure would element-wrap nearly every
// interactive element); pure $b inlines; className sits at the first consumed impure index
<Row $a={f()} $b={open} onClick={() => toggle()} />
<div className={(($a) =>
  "r1" + ($a ? " r2" : "") + (open ? " r3" : ""))(f())}
  onClick={() => toggle()} />

// occasional - two impure values: argument order = attribute order,
// even though the conditions read $a first
<Row $b={f()} $a={g()} />
<div className={(($b, $a) =>
  "r1" + ($a ? " r2" : "") + ($b ? " r3" : ""))(f(), g())} />

// rare - identical expressions never dedupe: attribute position ran f() twice
<Row $b={f()} $a={f()} />
<div className={(($b, $a) =>
  "r1" + ($a ? " r2" : "") + ($b ? " r3" : ""))(f(), f())} />

// common - user className merges outside the closure (string and expression form)
<Sticker $tilt={roll()} className="user" />
<div className={(($tilt) => "a1" + ...)(roll()) + " user"} />
<Sticker $tilt={roll()} className={cx} />
<div className={__yak_mergeClassNames((($tilt) => "a1" + ...)(roll()), cx)} />

// rare - async RSC: await stays in argument position
<Sticker $tilt={await f()} />
<div className={(($tilt) => "a1" + ...)(await f())} />
```

**element-wrap** - a consumed non-`$` prop, or escalation; full capture of every
evaluated reorder-impure value, parameters in source order:

```tsx
// occasional - styling on a real DOM prop with a computed value
<Button disabled={f()}>Save</Button>
{((disabled) => <button disabled={disabled}
  className={"b1" + (disabled ? " b2" : "")}>Save</button>)(f())}

// occasional - list rendering with a computed DOM prop; key and children stay normal JSX
items.map((it) => <Button key={it.id} disabled={load(it)}>{it.label}</Button>)
items.map((it) =>
  ((disabled) => <button key={it.id} disabled={disabled}
    className={"b1" + (disabled ? " b2" : "")}>{it.label}</button>)(load(it)))

// rare - escalation: the unconsumed g() sits between consumed impure values and may
// not jump the parameter block, so it becomes a pass-through parameter
<Row $a={f()} id={g()} $b={h()} />
{(($a, id, $b) => <div id={id}
  className={"r1" + ($a ? " r2" : "") + ($b ? " r3" : "")} />)(f(), g(), h())}
```

Everything on the bail list emits the runtime path unchanged - the shapes above are
total over foldable usages. The distribution confirms the design: the dominant cases
emit exactly today's output, the common cases pay one IIFE that swc/terser erase, and
only rare shapes take the element-wrap for exactness.

## Implementation

Do **not** implement this as "count reads, then decide". Counting requires replicating
every substitutability rule (`is_runtime_injected_prop`, computed access, whole-param
escape) in a fourth place alongside `SubstituteProps` (`:639`), `SubstituteMemberProps`
(`:682`) and the TS rule - and copies of this predicate demonstrably drift (the rule
already disagrees with the compiler in four places). Instead, **count during
substitution**:

1. Substitute *every* prop read with a fresh parameter identifier. The existing visitors
   already walk exactly the right nodes; have them record read-site counts as they go,
   so counts are exact by construction (including twice-in-one-condition).
2. Post-process: for each parameter whose attribute value is dup-pure, back-substitute
   the original expression and drop the parameter.
3. Parameters that remain form the IIFE, arguments in attribute source order; shape
   selection (evaluation-order rule 4) runs the reorder-purity scan over the remaining
   attributes. No parameters remaining, emit the current path unchanged.

One traversal, one predicate per question, and the gate lands correctly for free. Note
the substitution map stays mixed: absent attributes still substitute `void 0` (`:561`,
`:702`), and one parameter per prop *name* - both visitors must resolve the same prop to
the same parameter (`SubstituteProps` is `Id`-keyed, `SubstituteMemberProps` is
`Atom`-keyed).

### Code structure

Three output shapes times the gate times the ordering rules is the real risk - not any
single rule, but the case analysis smearing into flag soup inside the visitor. The
structure that keeps it flat: **plan, then emit**. All decisions funnel into one enum
built from pure data; the emitters contain no judgment.

```rust
/// One value that stays bound as an IIFE parameter
struct Binding {
  /// prop-derived name ($tilt for $tilt, disabled for disabled, sanitized for
  /// data-*) with a clean SyntaxContext - names are cosmetic, hygiene is real
  param: Ident,
  /// attribute source position - bindings are collected in attribute order and
  /// never reordered, so "arguments in source order" is data layout, not logic
  attr_index: usize,
  /// moves into argument position at the usage site, never anywhere else
  value: Box<Expr>,
}

/// The complete case analysis - every foldable usage is exactly one of these
enum FoldShape {
  /// every consumed value dup-pure: today's output, unchanged
  Inline { class_name: Box<Expr> },
  /// impure consumed values are all $-props, ordering exact:
  /// the className carries the IIFE
  ClassNameIife { class_name: Box<Expr>, bindings: Vec<Binding> },
  /// a consumed non-$ prop, or escalation: full capture, wraps the element
  ElementWrap { class_name: Box<Expr>, bindings: Vec<Binding> },
}
```

- **One `ParamBinder`, shared by `SubstituteProps` and `SubstituteMemberProps`**: hands
  out one parameter per prop name and counts read sites as a byproduct of substitution.
  This is the no-fourth-predicate rule made concrete - there is no separate "analysis"
  that could disagree with what the substitution actually did.
- **The two purity predicates are two plain recursive `match` functions**
  (`is_dup_pure`, and `is_reorder_pure` delegating to it for the shared arms), ~30 lines
  each, side by side in one module. No visitor, no trait, no effect framework: the
  allowlist *is* the match arms, so the spec section above reads 1:1 against the code.
- **Shape selection is one pure function** `select_shape(attrs, bindings,
  class_name_attr) -> FoldShape`, encoding the gate plus evaluation-order rules 3-4.
  The escalation check is an index scan over the attribute list, not an ordering IR.
  Being pure data-in/data-out, every row of the case table becomes a unit-test
  assertion next to the existing `fold_target` test - no fixture run needed to cover
  the decision matrix.
- **Emission splits by who owns the node.** `try_fold(&mut JSXElement) -> FoldOutcome`
  handles `Inline` and `ClassNameIife` by mutating the element in place (as today) and
  returns the params/args for `ElementWrap`, because only the parent knows how to wrap
  a call around an element: four small hooks (plain expression, JSX child via
  `JSXExprContainer`, attribute value, fragment child) each do one position-appropriate
  wrap of the same core result.

Deliberately not built: per-shape modules, strategy traits, a builtin-function purity
list, or any abstraction over "evaluation position". Three enum variants, two ~30-line
predicates and one selection function cover every row of the case mapping; if a future
case doesn't fit, the enum grows a variant and the compiler points at every match that
must decide it.

Care needed:

- **Element-wrap changes the node type.** The current visitor mutates the `JSXElement`
  in place; wrapping it in a call requires rewriting at every parent position a JSX
  element can occupy: plain expression, JSX child (needs a `JSXExprContainer`), attribute
  value, fragment child.
- **Comment spans.** The synthesized closure is built from `DUMMY_SP` nodes; the user
  className span carrying `/*YAK Extracted CSS:*/` stays at the usage site under both
  shapes. Comment byte positions orphan across the wasm ABI in ways native fixtures
  cannot catch - this needs an e2e/wasm check.
- **Parameter hygiene.** Fresh identifiers with a clean `SyntaxContext` so a parameter
  named `$tilt` can never capture or be captured by a user binding.
- **`await` in argument position.** Values are arguments, never moved into the closure
  body - rule, not accident; the async-RSC fixture pins it.

## Fixtures

Each pins a decision, four modes each.

- `$n={f()}` read inside a callback -> IIFE (case 2); `$b={f()}` behind `flag && $b` ->
  IIFE (case 3); `$a={f()}` read twice by one condition -> single parameter.
- `$t={new Date()}` -> IIFE (allowlist, not a call-gate); `$a={i % 4 !== 0}` read twice
  -> inline; `$c={colors[status]}` -> inline; `$a={f() as number}` -> IIFE;
  `$icon={<Icon/>}` -> IIFE.
- `$a={await f()}` in an async component -> `await` in argument position.
- `<Row $b={f()} $a={g()} />` with conditions reading `$a` first -> arguments in
  attribute order. `<Row $b={f()} $a={f()} />` -> two parameters, no dedup.
- `id={f()}` read by no condition -> stays on the element; `$a={f()}` read by no
  condition -> elided (D6).
- `$a={f()}` plus `onClick={() => ...}` -> className-IIFE, no escalation (arrow is
  reorder-pure).
- `$a={f()} id={g()} $b={h()}` -> element-wrap, parameters `f, g, h` in source order
  (escalation). Impure user `className={cn(x)}` before a consumed impure attribute ->
  element-wrap; after it -> className-IIFE with the merge outside the closure.
- Mixed `$` and non-`$` impure -> single element-wrap, parameters in source order.
  Non-`$` impure with `key={k}` and children -> element-wrap, `key` a normal attribute.
- Impure prop plus `className="user"` -> merge outside the IIFE. Impure prop plus
  `data-*` -> dashed attribute untouched.
- Two usages of one component, one pure one not -> both shapes in one file. Usage inside
  a conditional branch -> argument evaluated only when the branch renders.
- Existing bails, unchanged. e2e/wasm check for `/*YAK Extracted CSS:*/` survival.
- CI property check (not a fixture): the `react-hooks` purity lint's verdict on
  `input.tsx` equals its verdict on the folded output - the fold never introduces a
  render-purity violation the source didn't have.

## Decisions (resolved)

**D1. Auto-transform, not lint. Yes.** The current #595 state is the magic: the compiler
silently changes evaluation counts and asks users to lint around an implementation detail
of the fold. A parameter that restores attribute-position semantics is the compiler *not
breaking* user code. The lint, FAQ entry and changeset paragraph go (list below).

**D2. Two output shapes.** className-IIFE for the common `$`-only case, element-wrap
with full impure capture when a non-`$` prop is consumed or ordering requires it
(rule 4). Spread rejected (proposal section) - and the one argument that could have
revived it is now measured away: the spread would keep the node a plain JSX element,
which was worth something only if wrapping the element cost React Compiler memoization.
It does not. RC treats the element-wrap exactly as it treats the same shape without the
IIFE (purity section).

**D3. Evaluation order.** Resolved by rules 1-4: arguments in attribute source order,
placement at the first consumed impure attribute, escalation to element-wrap instead of
any accepted ordering leak. The invariant is absolute.

**D4. Allocation cost. Resolved by measurement.** swc and terser dissolve both IIFE
shapes into temp assignments - zero closures in production on the Next.js path. esbuild
keeps one closure per render, invisible next to react-dom's ~2 ms floor. React Compiler
(which runs after the yak plugin) removes it on a third path, per shape: the
className-IIFE is capture-free, so RC outlines it to a module-scope `_temp($tilt)` and
the element lands in a `_c(1)` cache slot; the element-wrap captures children and keeps
its closure, at no memoization cost (D2). That cache slot is also the perf
side-effect folding unlocks: with stable inputs the folded element is *referentially*
stable across renders, a subtree bailout the runtime wrapper component used to block.
No bench lane blocks this change; the bail-cost lane remains worth adding.

**D5. Allowlist width. Resolved:** dup-pure as specced (including computed members over
pure), reorder-pure as the wider shape-selection predicate; no builtin-function list -
getting one wrong toward "pure" is silent. The getter/throwing divergence is accepted and
documented. The follow-up helper design dissolves the effect-judgment entirely.

**D6. Unread impure `$props`: accept the elision.** `<Icon $unread={props.track()} />`
is a side effect nobody consumes; preserving it preserves a bug, and foreign `$props`
are already user error in this project - and a side effect during render is a purity
violation React's own lint flags at the source. The useful lint successor is a
different rule: "this `$prop` is not declared/read by the component".

## Follow-up: hoist the closure to module scope

**Not part of this change**, and the official-React bet shrinks it further: React Compiler
already emits this exact design unprompted. The `_temp($tilt)` it outlines to module scope
*is* the helper below, synthesized from the className-IIFE with no work from us. So the
allocation motivation is now dead three times over (swc, terser, RC), and one of the two
remaining reasons is weaker than it looks:

1. **Code size** for components with several dynamic usages: the concat chain is emitted
   once per component instead of re-inlined per usage. **Unverified, and narrower than
   stated.** RC outlines per usage site, so three usages of `Sticker` plausibly yield
   `_temp`, `_temp2`, `_temp3` where a yak helper would be shared once - but that has not
   been measured, and it only pays off for users who run RC at all. Confirm with a
   three-usage playground run before treating this as a reason.
2. **D5 dissolves into a scope check. This is the reason that survives**, and it is one
   RC cannot give us, because it changes what yak has to decide rather than what the
   output costs. Foldable components are top-level `const` by
   construction (`immutable_bindings`, `styled_jsx_fold.rs:159`), so after substitution
   the className expression references nothing but parameters and module scope - it can
   be a module-scope helper. Once it is, "pure" is replaced by a mechanical predicate:
   **bake iff the value is a literal or references only immutable module-scope bindings**;
   everything else becomes a parameter. Scope is decidable; purity is an effect judgment
   that drifts. This also closes the accepted getter/throwing divergence exactly.

```tsx
const __yak_Sticker = ($tilt) => "a1" + ($tilt > 5 ? " a2" : "") + ($tilt > 8 ? " a3" : "");
<div className={__yak_Sticker(Math.random() * 10)} />
```

Only the function hoists; values stay in argument position at the usage, so per-branch,
per-render evaluation is untouched. The element-wrap cannot hoist (its body captures
children and sibling attributes) and keeps its per-render closure - which the minifier
removes anyway. Fully static usages keep the current inline path with no helper, so the
literal -> single-string folding survives. Migration from the IIFE is mechanical (the
IIFE becomes a named call). Open points: helper naming/hygiene, per-component vs
per-usage helpers, HMR interaction, the code-size bench lane.

## What this deletes from #595

If D1 lands as proposed, these go in the same PR, so the branch never claims something
false:

- `packages/eslint-plugin-yak/rules/precomputeStylePropValues.ts` and its tests.
- `docs/rules/precompute-style-prop-values.md` and the rule's entries in
  `docs/content/docs/eslint-plugin.mdx`.
- The divergence FAQ entry in `docs/content/docs/faq.mdx`.
- `.changeset/precompute-style-prop-values.md` (would announce a rule that doesn't exist).
- The last paragraph of `.changeset/styled-jsx-folding.md` ("prop expressions must be
  pure", points at the rule). It lives on #568, the changeset that ships the feature -
  which is the reason to do the IIFE inside #595 rather than stacking another PR. Its
  replacement documents the D6 elision and the accepted getter divergence.

The Rust gate removal in #595 stays - it is the prerequisite: we *want* impure values to
fold, the IIFE makes them fold correctly. The rule is prior art, not a spec for the
port: it already disagrees with the compiler in four places (css-variable bails, tag
validation, shadowing, type args) on top of the allowlist width.

## Pre-existing findings this note does not fix

- **`ref` is deliberately absent from `is_runtime_injected_prop`** (`:595-600`) and must
  not be "fixed" in next to `key`. `key` bails because React strips it before the
  component sees props (runtime reads `undefined`, a fold would substitute the value).
  React 19 passes `ref` as an ordinary prop, so runtime and fold agree; a bail would only
  cost folds.
- **className order/dedup differs between folded and bailed usages** (runtime seeds a
  `Set` user-first, the fold appends user-last, no dedup). Harmless for the cascade;
  relevant to DOM snapshots. Worth its own issue.
- **`removeNonDomProperties`** (`runtime/styled.tsx:185-193`) strips `undefined`-valued
  props on the runtime path; the fold keeps them. Worth its own issue.
