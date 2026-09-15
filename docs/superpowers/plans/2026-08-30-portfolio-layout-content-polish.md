# Portfolio Layout and Content Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use test-driven-development for every production change and verification-before-completion before reporting success.

**Goal:** Correct the portfolio's image sizing, spacing, navigation, calculator order, course content, publication identity, and Sensor Code Generator cover while preserving the approved Editorial Instrument design system.

**Architecture:** Keep content truth in `data/`, shared navigation in `components/SiteHeader.tsx`, and responsive presentation in the existing theme stylesheets. Add regression coverage to the existing design-contract and responsive Playwright suites before changing production code. Use one generated local cover asset and update only its catalog reference.

**Tech Stack:** Next.js, React, TypeScript, CSS, Node test runner, Playwright, GPT Image.

---

## Task 1: Lock the requested behavior with failing tests

**Files:**

- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `tests/tools/site-responsive.test.js`

1. Add contract assertions for Home-first navigation, no Prompts navigation item, structured course records, the two MATLAB course entries, full publication identity, and the new sensor cover path.
2. Add browser assertions for portrait label containment, work media padding and containment, tools-grid gaps, and calculator-panel-first geometry.
3. Run the targeted tests and confirm they fail for the missing behavior rather than syntax or environment errors.

## Task 2: Correct shared navigation and content records

**Files:**

- Modify: `components/SiteHeader.tsx`
- Modify: `types/portfolio.ts`
- Modify: `data/portfolio.ts`
- Modify: `data/publications.json`
- Modify: `app/about/page.tsx`

1. Put Home first and remove Prompts from the primary navigation.
2. Replace the string-only course list with structured course records.
3. Add Analog Communication and MATLAB Onramp content, including the verified playlist URL.
4. Render each course's institution, description, and optional external action.
5. Replace abbreviated owner names in publication author lines with `Ahmed Ibrahim Asl`.
6. Run the contract test and confirm these assertions pass.

## Task 3: Repair portrait, home evidence, and work media geometry

**Files:**

- Modify: `app/home-grid.css`
- Modify: `app/asl-theme.css`

1. Protect all three portrait identity columns with padding, min-width rules, and non-clipping text behavior.
2. Reduce the home evidence frame heights while keeping the existing hierarchy.
3. Convert work media into padded dark matte frames with contained images.
4. Preserve the stacked mobile layout and remove any text or image overlap.
5. Run the responsive test at the six target widths and confirm the geometry assertions pass.

## Task 4: Improve the unified tools catalog and calculator flow

**Files:**

- Modify: `app/asl-tools.css`

1. Replace the one-pixel joined grid with responsive gaps and individually bordered cards.
2. Present `.calculator-panel` before explanatory sections inside calculator detail pages without altering calculator behavior.
3. Verify card gaps, focus states, and calculator-first geometry in the browser test.

## Task 5: Generate and integrate the Sensor Code Generator cover

**Files:**

- Create: `public/media/tools/tool-sensor-code-generator-v2.png`
- Modify: `data/tools.js`

1. Generate a wide dark sensor still life using the supplied sensor collage only as subject reference.
2. Inspect the result for unwanted text, logos, watermarks, white background, or off-palette neon effects.
3. Save it as a new asset without overwriting the current cover.
4. Update only the Sensor Code Generator catalog record.
5. Re-run the design contract test.

## Task 6: Full verification and visual review

**Files:**

- Verify: all modified files and routes

1. Run the targeted design-contract and responsive test suites.
2. Run the full automated test suite.
3. Run the production build.
4. Start or reuse the local server and visually inspect Home, Work, Tools, one calculator, and About at the required widths.
5. Scan modified public copy and documentation for the forbidden em dash character.
6. Report the local URL and exact changed files without committing or pushing.
