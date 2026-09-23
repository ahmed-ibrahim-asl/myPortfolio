# Apple Homepage Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a removable, local-only Apple-inspired portfolio homepage at `/apple-preview` and verify it at phone and desktop widths without changing the production homepage.

**Architecture:** Add one static App Router page backed by existing portfolio and tools data, with all visual behavior isolated in a colocated CSS Module. A focused Node test enforces route isolation and accessibility/responsive contracts; browser screenshots provide final visual verification.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, CSS Modules, Node test runner, Puppeteer/Chrome.

## Global Constraints

- Do not modify `app/page.tsx`, `app/home-grid.css`, production metadata, deployment configuration, or existing global navigation behavior.
- Add no packages, backend services, analytics, or data mutation.
- Reuse existing `profile`, `projects`, `workCategories`, and `engineeringTools` data and media.
- Support widths from 320px through large desktop monitors without horizontal scrolling.
- Use at least 44px touch targets on compact layouts, visible keyboard focus, logical landmarks and headings, and descriptive links.
- Support light/dark schemes plus reduced motion and reduced transparency.
- Keep glass effects on the local navigation and small status surfaces; keep content surfaces opaque.

---

### Task 1: Route contract and isolated page

**Files:**
- Create: `tests/tools/apple-preview.test.js`
- Create: `app/apple-preview/page.tsx`
- Create: `app/apple-preview/apple-preview.module.css`

**Interfaces:**
- Consumes: `profile` and `projects` from `@/data/portfolio`, `workCategories` from `@/data/work-categories`, and `engineeringTools` from `@/data/tools`.
- Produces: static route `/apple-preview`; global marker class `apple-preview-root`; anchors `#work`, `#tools`, and `#contact`.

- [ ] **Step 1: Write the failing source-contract test**

Create a Node test that reads the proposed page and CSS files and asserts: the route exists, imports a CSS Module, has one `h1`, uses semantic `nav`/`section`/`footer` landmarks, contains `apple-preview-root`, leaves `app/page.tsx` untouched by design, includes `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-color-scheme: dark`, a `320px` compact breakpoint, and a minimum `44px` control size.

- [ ] **Step 2: Run the test and verify it fails**

Run: `node --test tests/tools/apple-preview.test.js`

Expected: FAIL because `app/apple-preview/page.tsx` and its CSS Module do not exist.

- [ ] **Step 3: Implement the server-rendered preview page**

Create `app/apple-preview/page.tsx` with:

- a local translucent navigation bar and page anchors;
- a split hero using `profile.headline`, `profile.summary`, `profile.availability`, and `profile.portrait`;
- a decorative engineering-orbit SVG marked `aria-hidden="true"`;
- three featured projects resolved to their existing `/work/<group>/<slug>/` routes;
- three existing tools resolved to their current routes;
- a mail contact action using `profile.email`;
- `next/link` and `next/image`, with no client state or new dependency.

Create `app/apple-preview/apple-preview.module.css` with route-scoped color/type/spacing tokens, opaque editorial content cards, accessible focus rings, desktop split layout, single-column compact layout, dark-scheme overrides, and global ancestor selectors that hide only the shared site header/footer while `.apple-preview-root` is present.

- [ ] **Step 4: Run the focused test and TypeScript check**

Run: `node --test tests/tools/apple-preview.test.js`

Expected: PASS.

Run: `npx tsc --noEmit --pretty false`

Expected: exit 0 with no type errors.

- [ ] **Step 5: Commit the isolated route**

```bash
git add app/apple-preview/page.tsx app/apple-preview/apple-preview.module.css tests/tools/apple-preview.test.js
git commit -m "feat: add local apple homepage preview"
```

---

### Task 2: Browser verification and screenshots

**Files:**
- Modify only if verification exposes a defect: `app/apple-preview/page.tsx`
- Modify only if verification exposes a defect: `app/apple-preview/apple-preview.module.css`
- Create locally for review (do not commit): `test-results/apple-preview-desktop.png`
- Create locally for review (do not commit): `test-results/apple-preview-phone.png`

**Interfaces:**
- Consumes: `/apple-preview` from Task 1.
- Produces: verified local page and two review screenshots.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: exit 0 and static output includes `/apple-preview`.

- [ ] **Step 2: Start a local server for visual verification**

Run: `npm run dev -- --hostname 127.0.0.1 --port 3105`

Expected: Next.js reports ready at `http://127.0.0.1:3105`.

- [ ] **Step 3: Verify desktop behavior and capture it**

At 1440 by 1000, load `/apple-preview`, verify the local navigation replaces the shared chrome, inspect focus visibility and hero/project hierarchy, confirm `document.documentElement.scrollWidth === document.documentElement.clientWidth`, and save `test-results/apple-preview-desktop.png`.

- [ ] **Step 4: Verify phone behavior and capture it**

At 390 by 844 and then 320 by 700, load `/apple-preview`, confirm single-column order, at least 44px action heights, readable copy, no clipped portrait, and no horizontal overflow. Save the 390px view as `test-results/apple-preview-phone.png`.

- [ ] **Step 5: Verify accessibility preferences**

Emulate dark appearance, reduced motion, and reduced transparency. Confirm dark surfaces retain readable contrast, animations stop under reduced motion, and translucent surfaces become opaque under reduced transparency.

- [ ] **Step 6: Fix only observed defects and rerun checks**

For any failure, first add or tighten the relevant assertion in `tests/tools/apple-preview.test.js`, rerun it to observe failure, make the smallest page/CSS correction, then rerun the focused test, TypeScript check, and production build.

- [ ] **Step 7: Commit verified corrections if any**

```bash
git add app/apple-preview/page.tsx app/apple-preview/apple-preview.module.css tests/tools/apple-preview.test.js
git commit -m "fix: polish apple preview responsiveness"
```

