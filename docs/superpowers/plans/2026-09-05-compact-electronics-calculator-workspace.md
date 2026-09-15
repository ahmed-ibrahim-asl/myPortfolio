# Compact Electronics Calculator Workspace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the 16 electronics calculators compact and responsive, with controls beside existing visuals on wide screens and a visual-first single-column flow on narrow screens.

**Architecture:** `CalculatorPanel` receives a scoped `compact` opt-in and an optional `visual` slot. Compact panels render stable visual and controls regions, while unscoped calculators retain the current `calculator-grid` markup and styling. Existing calculator diagrams move into the visual slot without changing calculation logic, copy, defaults, or result semantics.

**Tech Stack:** Next.js 16.3.1, React 19.2.7, CSS, Node.js built-in test runner

## Global Constraints

- Apply the new layout only to the 16 calculator routes in Fundamentals, Resistors, and Timing & Filters.
- Keep Math, Physics, Number Systems, Encoding, and Unit Conversion calculator layouts unchanged.
- Use an 1180px maximum panel width and switch to the wide two-column composition at exactly 860px.
- Use a 44% controls column and 56% visual column on wide screens.
- Keep the visual first in DOM order and above the controls below 860px.
- Preserve formulas, defaults, state, validation, result semantics, explanatory copy, focus behavior, reduced motion, and 44px touch targets.
- Do not create a fake visual for Ohm's Law, Capacitive Reactance, or Battery Life.
- Do not add dependencies, commit, push, or alter unrelated dirty-worktree changes.

---

### Task 1: Lock the scoped responsive workspace contract

**Files:**
- Create: `tests/tools/electronics-calculator-workspace.test.js`

**Interfaces:**
- Consumes: source files as UTF-8 text through `readFileSync(path, "utf8")`.
- Produces: static regression coverage for `CalculatorPanel({ title, compact, visual, children })`, the 16 scoped migrations, the unscoped fallback, and the responsive CSS contract.

- [x] **Step 1: Write the failing source-contract test**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

const visualCalculators = [
  "ResistorColorCodeCalculator",
  "FiveBandResistorColorCodeCalculator",
  "SeriesResistorCalculator",
  "ParallelResistorCalculator",
  "VoltageDividerCalculator",
  "RcTimeConstantCalculator",
  "Timer555AstableCalculator",
  "Timer555MonostableCalculator",
  "LedSeriesResistorCalculator",
  "RmsVoltageCalculator",
  "HighPassFilterCalculator",
  "LowPassFilterCalculator",
  "OpAmpGainCalculator"
];

const compactOnlyCalculators = [
  "OhmsLawCalculator",
  "CapacitiveReactanceCalculator",
  "BatteryLifeCalculator"
];

test("CalculatorPanel exposes an opt-in compact workspace with separate visual and controls regions", () => {
  const source = read("components/tools/CalculatorUI.js");
  assert.match(source, /CalculatorPanel\(\{ title = "Try it", compact = false, visual, children \}\)/);
  assert.match(source, /calculator-panel-compact/);
  assert.match(source, /calculator-panel-has-visual/);
  assert.match(source, /calculator-workspace-layout/);
  assert.match(source, /calculator-workspace-visual/);
  assert.match(source, /calculator-workspace-controls/);
  assert.match(source, /!compact/);
});

test("the 13 electronics calculators with diagrams use the explicit compact visual slot", () => {
  for (const calculator of visualCalculators) {
    const source = read(`components/tools/calculators/${calculator}.js`);
    assert.match(source, /<CalculatorPanel\s+compact\s+visual=\{/, `${calculator} should opt into the visual workspace`);
  }
});

test("electronics calculators without diagrams opt into compact mode without fake visuals", () => {
  for (const calculator of compactOnlyCalculators) {
    const source = read(`components/tools/calculators/${calculator}.js`);
    assert.match(source, /<CalculatorPanel compact>/, `${calculator} should use the compact no-visual layout`);
    assert.doesNotMatch(source, /<CalculatorPanel[^>]+visual=/, `${calculator} should not reserve a visual column`);
  }
});

test("an unscoped calculator retains the legacy panel path", () => {
  const source = read("components/tools/calculators/SquareRootCalculator.js");
  assert.match(source, /<CalculatorPanel>/);
  assert.doesNotMatch(source, /<CalculatorPanel compact/);
});

test("compact workspace CSS is bounded, visual-first, and switches to 44/56 columns at 860px", () => {
  const css = read("app/asl-tools.css");
  assert.match(css, /\.calculator-panel-compact\s*\{[^}]*max-width:\s*1180px/s);
  assert.match(css, /\.calculator-workspace-layout\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s);
  assert.match(css, /\.calculator-workspace-visual[^}]*max-height:/s);
  assert.match(css, /@media\s*\(min-width:\s*860px\)/);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*44fr\)\s+minmax\(0,\s*56fr\)/);
  assert.match(css, /\.calculator-workspace-controls\s*\{[^}]*grid-column:\s*1/s);
  assert.match(css, /\.calculator-workspace-visual\s*\{[^}]*grid-column:\s*2/s);
}
);
```

- [x] **Step 2: Run the focused test and confirm the intended failure**

Run: `node --test tests/tools/electronics-calculator-workspace.test.js`

Expected: FAIL because `CalculatorPanel` does not yet accept `compact` or `visual`, the scoped calculators do not pass those props, and the compact CSS selectors do not exist.

---

### Task 2: Implement the shared compact workspace

**Files:**
- Modify: `components/tools/CalculatorUI.js:57-64`
- Modify: `app/asl-tools.css:672-679, 837-844`
- Test: `tests/tools/electronics-calculator-workspace.test.js`

**Interfaces:**
- Consumes: `compact?: boolean`, `visual?: React.ReactNode`, existing `title?: string`, and `children: React.ReactNode`.
- Produces: `CalculatorPanel({ title = "Try it", compact = false, visual, children })`; compact mode emits `.calculator-panel-compact`, `.calculator-workspace-layout`, `.calculator-workspace-visual`, and `.calculator-workspace-controls`. Legacy mode emits the existing `.calculator-grid` markup.

- [x] **Step 1: Add the scoped component branch**

```jsx
export function CalculatorPanel({ title = "Try it", compact = false, visual, children }) {
  if (!compact) {
    return (
      <div className="calculator-panel" data-tool-workspace>
        <p className="eyebrow">{title}</p>
        <div className="calculator-grid">{children}</div>
      </div>
    );
  }

  const className = `calculator-panel calculator-panel-compact${visual ? " calculator-panel-has-visual" : ""}`;

  return (
    <div className={className} data-tool-workspace>
      <p className="eyebrow">{title}</p>
      <div className="calculator-workspace-layout">
        {visual ? <div className="calculator-workspace-visual">{visual}</div> : null}
        <div className="calculator-workspace-controls">{children}</div>
      </div>
    </div>
  );
}
```

- [x] **Step 2: Add mobile-first compact styling and replace the full-row visual override**

```css
.asl-calculator-shell .calculator-panel-compact {
  width: 100%;
  max-width: 1180px;
  margin-inline: auto;
  padding: clamp(16px, 3vw, 26px);
}

.calculator-workspace-layout,
.calculator-workspace-controls {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 2vw, 18px);
  min-width: 0;
}

.calculator-workspace-visual {
  display: grid;
  place-items: center;
  min-width: 0;
  max-height: clamp(210px, 42vw, 320px);
  overflow: hidden;
}

.calculator-workspace-visual :is(.tool-diagram, .resistor-preview) {
  width: 100%;
  max-width: 560px;
  max-height: inherit;
  margin: 0;
  padding: 0 !important;
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

.calculator-workspace-visual :is(svg, img) {
  width: 100%;
  max-height: clamp(190px, 38vw, 300px);
  object-fit: contain;
}

.calculator-workspace-controls > * {
  min-width: 0;
}

@media (min-width: 860px) {
  .calculator-panel-has-visual .calculator-workspace-layout {
    grid-template-columns: minmax(0, 44fr) minmax(0, 56fr);
    align-items: start;
    gap: clamp(24px, 4vw, 52px);
  }

  .calculator-panel-has-visual .calculator-workspace-controls {
    grid-column: 1;
    grid-row: 1;
  }

  .calculator-panel-has-visual .calculator-workspace-visual {
    grid-column: 2;
    grid-row: 1;
  }
}
```

The implementation may adjust selector specificity to match the incumbent ASL stylesheet, but must preserve these exact layout values and behaviors.

- [x] **Step 3: Run the focused test to isolate the remaining migration failures**

Run: `node --test tests/tools/electronics-calculator-workspace.test.js`

Expected: the shared component and CSS assertions PASS; the 16 calculator opt-in assertions still FAIL.

---

### Task 3: Migrate the 16 scoped electronics calculators

**Files:**
- Modify: `components/tools/calculators/ResistorColorCodeCalculator.js`
- Modify: `components/tools/calculators/FiveBandResistorColorCodeCalculator.js`
- Modify: `components/tools/calculators/SeriesResistorCalculator.js`
- Modify: `components/tools/calculators/ParallelResistorCalculator.js`
- Modify: `components/tools/calculators/VoltageDividerCalculator.js`
- Modify: `components/tools/calculators/RcTimeConstantCalculator.js`
- Modify: `components/tools/calculators/Timer555AstableCalculator.js`
- Modify: `components/tools/calculators/Timer555MonostableCalculator.js`
- Modify: `components/tools/calculators/CapacitiveReactanceCalculator.js`
- Modify: `components/tools/calculators/LedSeriesResistorCalculator.js`
- Modify: `components/tools/calculators/BatteryLifeCalculator.js`
- Modify: `components/tools/calculators/RmsVoltageCalculator.js`
- Modify: `components/tools/calculators/HighPassFilterCalculator.js`
- Modify: `components/tools/calculators/LowPassFilterCalculator.js`
- Modify: `components/tools/calculators/OpAmpGainCalculator.js`
- Modify: `components/tools/calculators/OhmsLawCalculator.js`
- Test: `tests/tools/electronics-calculator-workspace.test.js`

**Interfaces:**
- Consumes: `CalculatorPanel`'s `compact` and `visual` props from Task 2, plus each calculator's existing diagram node.
- Produces: 13 visual compact calculators and three compact calculators without fake visual content.

- [x] **Step 1: Move every existing diagram into the visual slot**

For each of the 13 visual calculators, replace this shape:

```jsx
<CalculatorPanel>
  <ExistingDiagram existingProps />
  <CalculatorField ... />
</CalculatorPanel>
```

with this shape, preserving every diagram prop exactly:

```jsx
<CalculatorPanel compact visual={<ExistingDiagram existingProps />}>
  <CalculatorField ... />
</CalculatorPanel>
```

For multiline diagram props such as `SeriesRCDiagram`, wrap the unchanged node in parentheses:

```jsx
<CalculatorPanel
  compact
  visual={(
    <SeriesRCDiagram
      first="resistor"
      second="capacitor"
      output="junction"
      caption="R charges C - Vout is the voltage building up across the capacitor"
    />
  )}
>
```

- [x] **Step 2: Opt the three no-visual electronics calculators into compact mode**

In `OhmsLawCalculator.js`, `CapacitiveReactanceCalculator.js`, and `BatteryLifeCalculator.js`, change only the opening tag:

```jsx
<CalculatorPanel compact>
```

Do not add a `visual` prop or new diagram to these files.

- [x] **Step 3: Run the focused contract test**

Run: `node --test tests/tools/electronics-calculator-workspace.test.js`

Expected: PASS.

- [x] **Step 4: Run the related calculator regression suites**

Run: `node --test tests/tools/calculator-restoration.test.js tests/tools/resistor-interaction-order.test.js tests/tools/task6-calculator-enhancements.test.js tests/tools/tool-text-integrity.test.js tests/tools/touch-target-floor.test.js tests/tools/asl-design-contract.test.js`

Expected: PASS with no formula, interaction order, text, touch-target, or design-contract regression.

---

### Task 4: Verify responsive geometry and production integration

**Files:**
- Verify: `components/tools/CalculatorUI.js`
- Verify: `components/tools/calculators/*.js`
- Verify: `app/asl-tools.css`
- Verify: `tests/tools/electronics-calculator-workspace.test.js`

**Interfaces:**
- Consumes: the completed compact workspace and the running local app.
- Produces: evidence that representative visual and no-visual routes work at desktop, tablet, and phone sizes without overflow.

- [x] **Step 1: Run a bounded visual inspection**

Inspect these routes at 1440×900, 1024×768, 768×1024, and 390×844:

```text
/tools/rc-time-constant-calculator/
/tools/5-band-resistor-color-code-calculator/
/tools/series-resistor-calculator/
/tools/555-timer-astable-circuit-calculator/
/tools/ohms-law-calculator/
```

For each viewport, confirm that the diagram and first input are visible together on wide screens, the visual appears above controls below 860px, no horizontal scroll exists, values wrap safely, diagram details remain legible, and no empty visual column appears on Ohm's Law.

- [x] **Step 2: Apply one consolidated correction pass if visual inspection finds defects**

Restrict corrections to spacing, max-height, grid behavior, overflow wrapping, and selector specificity in `app/asl-tools.css`; do not alter calculator math or copy.

- [x] **Step 3: Run the full automated suite**

Run: `npm test`

Expected: PASS.

Verification result: 420 tests passed, one test was skipped, and one pre-existing Tools catalog visual-variant assertion failed because the current catalog reports 30 raster variants instead of 36. The compact workspace tests and rendered geometry checks passed; this catalog-cover failure is outside this plan's files and behavior.

- [x] **Step 4: Run the production build**

Run: `npm run build`

Expected: PASS with all calculator routes generated successfully.

- [x] **Step 5: Run Impeccable's UI detector once across the changed implementation**

Run:

```powershell
node C:\Users\Asl\.codex\skills\impeccable\scripts\detect.mjs --json components/tools/CalculatorUI.js app/asl-tools.css components/tools/calculators/ResistorColorCodeCalculator.js components/tools/calculators/FiveBandResistorColorCodeCalculator.js components/tools/calculators/SeriesResistorCalculator.js components/tools/calculators/ParallelResistorCalculator.js components/tools/calculators/VoltageDividerCalculator.js components/tools/calculators/RcTimeConstantCalculator.js components/tools/calculators/Timer555AstableCalculator.js components/tools/calculators/Timer555MonostableCalculator.js components/tools/calculators/CapacitiveReactanceCalculator.js components/tools/calculators/LedSeriesResistorCalculator.js components/tools/calculators/BatteryLifeCalculator.js components/tools/calculators/RmsVoltageCalculator.js components/tools/calculators/HighPassFilterCalculator.js components/tools/calculators/LowPassFilterCalculator.js components/tools/calculators/OpAmpGainCalculator.js components/tools/calculators/OhmsLawCalculator.js
```

Expected: no high-confidence usability regression in the compact workspace. Review any advisory manually against the approved design before changing code.

Verification result: no compact-workspace finding. The detector reported two existing warnings at `app/asl-tools.css:482` and `app/asl-tools.css:642`, outside the selectors changed by this plan.

- [x] **Step 6: Confirm the implementation diff is scoped**

Run: `git diff -- components/tools/CalculatorUI.js app/asl-tools.css components/tools/calculators tests/tools/electronics-calculator-workspace.test.js docs/superpowers/specs/2026-09-05-compact-electronics-calculator-workspace-design.md docs/superpowers/plans/2026-09-05-compact-electronics-calculator-workspace.md`

Expected: only the compact workspace contract, the 16 scoped opt-ins, tests, and approved design/plan documentation are present; no commit or push is created.
