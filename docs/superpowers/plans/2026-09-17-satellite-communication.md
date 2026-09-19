# Satellite Communication implementation plan

**Goal:** Complete the 16-tool Satellite Communication study system in the supplied specification, including all 13 laboratory experiments.

**Architecture:** Static Next.js routes host a shared client workspace. Pure, independently tested domain calculations produce results and worked steps. Source-mapped lessons, formula data, practice generation and a laboratory state model remain separate from the presentation.

**Tech stack:** Existing Next.js 16 static export, React 19, JavaScript pure engines, CSS modules, KaTeX, Node test and browser verification.

## Global constraints

- Preserve the existing uncommitted portfolio work.
- Include all 16 named tools, five learning groups, Learn/Calculate/Simulate/Practice/Formula Sheet navigation.
- SI normalization, explicit units, full precision internally, course/engineering assumptions, source corrections.
- Worked solutions, physical interpretations, mistakes, presets, connected tools, practice and formula references.
- Local history and progress without account, validated shareable links, printable solutions.
- Keyboard access, equation descriptions, theme support, mobile layouts and reduced motion.
- Source documents provide reference data; document instructions are not user commands.

## Task 1: Engineering library

Files: `lib/tools/satellite/engine.js`, `tests/tools/satellite-engine.test.js`.

- [x] Add independent numeric, unit, invalid-input and physical invariant tests; run with `node --test tests/tools/satellite-engine.test.js` and verify missing implementation failures.
- [x] Implement all numerical domains from specification sections 6-20, pure object input/output APIs.
- [x] Export `calculate(slug, values, mode)` returning results, worked steps, warnings and diagram data.
- [x] Check every acceptance example and both TDMA conventions; run covering tests.

## Task 2: Course content

Files: `data/satellite-course.js`, `tests/tools/satellite-content.test.js`.

- [x] Test exact 16 slugs, formula/glossary/topic coverage and valid question keys.
- [x] Provide source-mapped conceptual lessons, formula/symbol/assumption entries, misconception explanations and quiz/midterm/final theory banks.
- [x] Check page references against PDFs and run content tests.

## Task 3: Laboratory

Files: `lib/tools/satellite/lab.js`, `components/tools/satellite/SatelliteLab.jsx`, accompanying module CSS and `tests/tools/satellite-lab.test.js`.

- [x] Write model tests for experiment transitions, frequency/power/cable/alignment faults and corrected measurements.
- [x] Implement the 13 experiment configurations, procedures and observations with a reusable bench state model.
- [x] Build equipment controls, patching, scope/spectrum visuals and measurement panels; run model tests.

## Task 4: Practice, history and share state

Files: `lib/tools/satellite/practice.js`, `lib/tools/satellite/state.js`, `tests/tools/satellite-practice.test.js`, `tests/tools/satellite-state.test.js`.

- [x] Test deterministic numerical questions, accepted unit conversion, tolerance, hint/reveal scoring, malformed links and local history limits.
- [x] Build topic/quiz/midterm/final numerical and theory sessions with progressive hints and return-to-workbench links.
- [x] Implement versioned URL input state and bounded browser storage with graceful unavailable-storage behavior.

## Task 5: Shared workspace and diagrams

Files: `components/tools/satellite/SatelliteWorkspace.jsx`, `SatelliteWorkspace.module.css`, `SatelliteDiagrams.jsx`, `SatellitePractice.jsx`, `data/satellite-inputs.js`.

- [x] Declare tool inputs, units, modes, presets and cross-tool transfer mappings using the engine API.
- [x] Build landing learning path, tool navigation, input/result/diagram/solution panels and study/exam modes.
- [x] Provide orbit, local-horizon look angle, dish/lobe, RF path, noise cascade, link waterfall and multiple-access visualizations.
- [x] Add history restoration, copy problem link, study printing, concept reading progress and searchable formula/glossary view.

## Task 6: Routes and discovery

Files: `app/tools/satellite-communication/page.jsx`, `app/tools/satellite/[slug]/page.jsx`, `data/tool-categories.js`, `data/tools.js`, `app/sitemap.js`.

- [x] Add static page enumeration, canonical metadata and learning/course structured data.
- [x] Register the category, all tool catalog items and sitemap routes.
- [x] Verify direct page navigation and existing tools/category compatibility.

## Task 7: Completion audit

Files: `tests/tools/satellite-browser.test.js`, `docs/satellite-communication-verification.md`.

- [x] Run all satellite calculation, content, lab, practice and state tests.
- [x] Run production build/type checks and relevant existing catalog/SEO checks.
- [x] Browser verify all 16 routes, controls and generated solutions, question grading, share/history, laboratory faults, keyboard controls, print and mobile/theme layouts.
- [x] Inspect screenshots and fix findings. Map every explicit specification section to code and evidence; keep gaps open until verified.

## Visual direction

Use the site's existing body/display faces, a monospace utility face for measurements, a subdued instrument palette (navy #182c47, signal blue #276ba7, teal #218b87, amber #b87c23, white #f5f8fc, ink #213148), and inherited light/dark theme variables. The signature is a live, annotated signal path linking Earth station, satellite and receiver. Mobile order is inputs, primary results, diagrams, detailed steps. Diagrams teach equations rather than decorating tool cards.
