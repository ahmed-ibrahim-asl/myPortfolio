# Portfolio Mobile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Multi-MCU cover with an authored diagram, fix the evidenced ROV mobile surface issue, and make shared calls to action concise and readable.

**Architecture:** Project records continue to own media references. A static SVG cover uses design tokens embedded as CSS variables with safe fallbacks. Shared action styles define the hierarchy once; the ROV fix targets only the selector or asset path proven by computed-style diagnostics.

**Tech Stack:** Next.js, React, CSS, SVG, Playwright-style browser tests through the existing Node/JSDOM harness.

## Global Constraints

- Keep original Proteus screenshots as project evidence.
- Do not use photoreal component art, fake wiring, glows, or generated device scenes.
- Use Contact, View projects, Explore tools, Send brief, and Email Ahmed for the specified actions.
- Diagnose the ROV white state before editing its styles.
- Shared actions use at least 14 px, weight 650–700, and 44–48 px height.

---

### Task 1: Multi-MCU architecture cover

**Files:**
- Create: `public/media/portfolio/multi-mcu-security-lock-architecture.svg`
- Modify: `data/portfolio.ts`
- Modify: `data/public-image-sources.json`
- Test: `tests/tools/multi-mcu-cover.test.js`

**Interfaces:**
- Produces an SVG containing labelled HMI/control domains, authenticated UART boundary, peripherals, and command/status arrows.

- [ ] **Step 1: Write a failing test** that parses the selected cover, requires the approved labels, rejects `<image>` and raster hrefs, and confirms gallery evidence remains.
- [ ] **Step 2: Run it** with `node --test tests/tools/multi-mcu-cover.test.js` and verify failure.
- [ ] **Step 3: Author the minimal SVG diagram** using ASL navy, blue, amber, teal, mono labels, and abstract blocks.
- [ ] **Step 4: Point the project cover and image manifest to the SVG** and run `npm run prepare:images`.
- [ ] **Step 5: Run the test and commit** with `git commit -m "feat: replace security lock cover with architecture diagram"`.

### Task 2: CTA copy and shared control hierarchy

**Files:**
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/home-grid.css`
- Test: `tests/tools/site-action-hierarchy.test.js`

**Interfaces:**
- Produces semantic primary, secondary, compact, and utility control classes with the approved minimum sizes.

- [ ] **Step 1: Write failing source/browser tests** for exact CTA labels, mobile computed font size/weight, touch height, focus visibility, and 320 px wrapping.
- [ ] **Step 2: Run tests and confirm the current tiny home action fails**.
- [ ] **Step 3: Update CTA copy and consolidate shared action tokens** without applying blanket bold text.
- [ ] **Step 4: Run focused tests at 320, 390, and 430 px**.
- [ ] **Step 5: Commit** with `git commit -m "fix: improve mobile action copy and typography"`.

### Task 3: ROV root-cause diagnosis and regression

**Files:**
- Create: `tests/tools/rov-mobile-surface-browser.test.js`
- Modify after evidence only: the failing selector, theme token, image source record, or generated responsive variant.

**Interfaces:**
- Produces a regression that samples project hub, category, detail, and gallery surfaces in dark/light mode at 320, 390, and 430 px.

- [ ] **Step 1: Reproduce and log evidence** for computed `background-color`, image `currentSrc`, theme storage state, and ancestor surface selectors in dev and static export.
- [ ] **Step 2: State one root-cause hypothesis** based on the first boundary where white enters.
- [ ] **Step 3: Write the failing regression** that reproduces that exact state.
- [ ] **Step 4: Make the smallest source fix** at the proven selector, state, or image mapping.
- [ ] **Step 5: Run the regression, responsive project suite, and build**.
- [ ] **Step 6: Commit** with `git commit -m "fix: keep rov project surfaces themed on mobile"`.

