# Power Conversion Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add safe low-voltage power-conversion designers for bridge rectifiers, linear-regulator capacitor stability, and buck converters.

**Architecture:** Pure calculation functions provide topology-specific results and warnings. Each tool gets an independent React page with editable inputs, a selectable SVG schematic, formatted equations, and a limitations panel. The tools live in a new Power Conversion & Supplies category.

**Tech Stack:** Next.js App Router, React client components, scoped CSS, existing theme tokens, Node test runner.

## Global Constraints

- First release covers isolated/safe low-voltage DC systems and does not calculate mains wiring.
- Every result is an engineering estimate and must show datasheet, thermal, ripple, and layout limitations.
- Preserve existing routes and dark/light theme behavior.
- Keep controls keyboard accessible and at least 44px tall.

### Task 1: Power math and tests

**Files:**
- Create: `lib/tools/power-conversion.js`
- Test: `tests/tools/power-conversion.test.js`

- [x] Test bridge rectifier peak/ripple/capacitor sizing, linear regulator dissipation/stability checks, and buck inductor/ripple/efficiency estimates.
- [x] Implement validated pure functions with warnings for impossible or unsafe inputs.

### Task 2: Shared power designer UI

**Files:**
- Create: `components/tools/design/PowerConversionDesigner.tsx`, `components/tools/design/PowerSchematic.tsx`
- Modify: `components/tools/design/DesignLab.module.css`

- [x] Add per-topology fields, calculated metrics, formatted equations, warnings, and selectable component explanations.
- [x] Draw rectifier, regulator, and buck schematics with actual labels.

### Task 3: Catalog and routing

**Files:**
- Modify: `data/design-tools.js`, `data/calculators.js`, `data/tool-categories.js`, `components/tools/design/DesignToolPage.tsx`, `data/calculator-visuals.js`, `components/tools/CalculatorThumbnail.js`, `app/sitemap.js`

- [x] Add three independent routes under Power Conversion & Supplies.
- [x] Preserve all existing category and tool URLs.

### Task 4: Verification

- [x] Run new unit tests, existing domain tests, and `npm run build`.
- [ ] Check mobile/light/dark layouts and input validation in browser.
