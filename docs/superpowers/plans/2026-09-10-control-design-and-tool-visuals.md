# Control Design and Tool Visuals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the engineering tools into a visual, theme-aware design system that explains ROT, op-amp gain, memory/control selection, logic gates, and IC implementations without requiring users to start from equations.

**Architecture:** Keep each designer as an independent route backed by pure domain functions. A shared tool visual layer will provide paired light/dark cover assets and readable formatted equations. The Control Design Assistant will use a guided intent flow that produces a recommendation, then opens the visual gate-level designer and implementation references.

**Tech Stack:** Next.js App Router, React client components, scoped CSS modules, existing theme tokens, SVG/PNG covers, Node test runner, Puppeteer browser checks.

## Global Constraints

- Preserve existing calculator and NE555 URLs.
- Keep first-visit dark theme and manual theme switching.
- All controls remain keyboard accessible with a minimum 44px target.
- Explanations must state model limitations; no fabricated IC compatibility or electrical ratings.
- Do not claim transistor-level designs are production-ready without supply, load, thermal, and timing inputs.
- Keep local processing for all designers; do not upload user circuit data.

---

### Task 1: Theme-aware tool cover assets

**Files:**
- Create: `public/media/tools/design/rot-explorer-dark.png`, `rot-explorer-light.png`, `air-core-coil-dark.png`, `air-core-coil-light.png`, `lc-resonance-dark.png`, `lc-resonance-light.png`, `band-pass-filter-dark.png`, `band-pass-filter-light.png`
- Modify: `data/design-tools.js`, `components/tools/CalculatorThumbnail.js`
- Test: `tests/tools/design-tools-browser.test.js`

- [x] Create four restrained technical cover illustrations with identical composition in dark and light variants; avoid dense text and preserve the gold/cyan engineering accents.
- [x] Add theme-specific visual metadata and select the asset from the active theme.
- [x] Verify the production build includes all new catalog visuals.

### Task 2: ROT explanation and equation presentation

**Files:**
- Modify: `components/tools/design/RotExplorer.tsx`, `components/tools/design/DesignLab.module.css`
- Modify: `lib/tools/rot.js`
- Test: `tests/tools/circuit-rot-math.test.js`, `tests/tools/design-tools-browser.test.js`

- [x] Replace “Follow a letter through the alphabet” with “See how ROT13 moves each letter”.
- [x] Add a visible explanation block below the interactive tool describing ROT13, Caesar shifts, wrapping at Z, and why the mapping is useful.
- [x] Keep the mapping interactive in-page; retain the SVG download as an optional export.
- [x] Add reusable formatted equation styles for designers.

### Task 3: Cascaded op-amp gain designer

**Files:**
- Create: `lib/tools/opamp-design.js`, `components/tools/design/CascadedOpAmpDesigner.tsx`
- Create: `components/tools/design/OpAmpSchematic.tsx`
- Modify: `data/design-tools.js`, `data/calculator-visuals.js`, `app/tools/[slug]/page.js`
- Test: `tests/tools/opamp-design.test.js`, `tests/tools/design-tools-browser.test.js`

- [x] Model per-stage non-inverting and inverting gain, total gain, polarity, and output amplitude.
- [x] Support multiple stages with editable resistor values and a clear stage-by-stage result.
- [ ] Add a selectable schematic for each stage.
- [x] Add reference panels for LM358, LM741, and TL072 with package/pinout guidance and an explicit “verify datasheet” warning.

### Task 4: Control Design Assistant intent flow

**Files:**
- Create: `lib/tools/control-design.js`, `components/tools/design/ControlDesignAssistant.tsx`
- Modify: `data/tool-categories.js`, `data/design-tools.js`
- Test: `tests/tools/control-design.test.js`, `tests/tools/design-tools-browser.test.js`

- [x] Ask intent questions: number of bits, clocked vs level-sensitive behavior, set/reset needs, toggle behavior, and whether the user needs a register, counter, or shift register.
- [x] Return a recommendation with explanation: SR latch, D flip-flop, JK flip-flop, T flip-flop, register, counter, or shift register.
- [x] Show a simple truth table for the selected recommendation.
- [x] Explain why the recommendation fits and what requirement would change it.

### Task 5: Visual logic-gate designer

**Files:**
- Create: `lib/tools/logic-design.js`, `components/tools/design/LogicGateDesigner.tsx`, `components/tools/design/LogicGateSchematic.tsx`
- Modify: `data/design-tools.js`, `data/tool-categories.js`
- Test: `tests/tools/logic-design.test.js`, `tests/tools/design-tools-browser.test.js`

- [x] Provide configurable inputs and outputs with switch controls.
- [x] Add AND, OR, NOT, NAND, NOR, XOR, and XNOR choices with a visual signal path.
- [x] Simulate live output state and generate a truth table from the current gate.
- [ ] Add flip-flop and counter blocks after the basic combinational gate model is stable.

### Task 6: IC and discrete implementation references

**Files:**
- Create: `data/ic-reference.js`, `components/tools/design/ICReferencePanel.tsx`, `components/tools/design/DiscreteImplementationPanel.tsx`
- Modify: `components/tools/design/ControlDesignAssistant.tsx`, `components/tools/design/LogicGateDesigner.tsx`
- Test: `tests/tools/ic-reference.test.js`, `tests/tools/design-tools-browser.test.js`

- [x] Map op-amp references to common parts and show curated static package pinouts with datasheet warnings.
- [ ] Provide “expand to BJT” and “expand to MOSFET” views with symbolic stages, pull-up/pull-down controls, and estimated current/voltage fields.
- [ ] Mark estimates and unsupported constraints prominently; do not present the view as a guaranteed component selection.

### Task 7: Integration and verification

**Files:**
- Modify: `app/sitemap.js`, category pages, catalog metadata, documentation plan checkboxes
- Test: all new unit/browser tests, `npm run build`, `node scripts/audit-ui.mjs`

- [x] Verify existing routes and NE555 tools remain unchanged through the successful production build.
- [ ] Verify all new light/dark covers, mobile overflow, keyboard interaction, formatted equations, and readable contrast in a fresh browser pass.
- [x] Run the production build before publishing.
