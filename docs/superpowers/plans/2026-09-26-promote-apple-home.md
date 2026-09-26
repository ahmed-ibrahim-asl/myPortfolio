# Promote the Apple-Style Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the English root homepage with the complete Apple-style design and remove `/apple-preview/` from source and the published artifact.

**Architecture:** Move the existing preview server component and CSS Module into homepage-owned files, remove preview-only copy and selectors, and delete the preview route by relocation rather than duplication. Update the browser contract to target `/` and assert that `/apple-preview/` returns 404.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, TypeScript, CSS Modules, Node test runner, Puppeteer, GitHub Pages static export.

## Global Constraints

- Keep the complete hero, selected-work, tools, and contact sections.
- Do not add a redirect, alias, compatibility page, or navigation entry for `/apple-preview/`.
- Remove “Local preview” and “Local concept preview” copy.
- Preserve responsive, dark-mode, reduced-motion, reduced-transparency, keyboard-focus, and 44px touch-target behavior.
- Leave the Arabic homepage and every non-homepage route unchanged.
- Add no dependency, client state, service, or data source.
- Publish source to `source`, then mirror the verified `out/` artifact to `main` without force-pushing.

---

### Task 1: Lock the homepage and removed-route contracts

**Files:**
- Move: `tests/tools/apple-preview.test.js` to `tests/tools/apple-homepage.test.js`
- Modify: `tests/tools/apple-homepage.test.js`

**Interfaces:**
- Consumes: `TEST_BASE_URL`, root route `/`, removed route `/apple-preview/`.
- Produces: browser contracts for the production homepage and removed preview route.

- [ ] **Step 1: Rewrite the browser contract before production changes**

Change every structure, contrast, and responsive visit from `${baseUrl}/apple-preview` to `${baseUrl}/`. Rename the tests from “preview” to “homepage.” Assert the navigation uses `aria-label="Primary navigation"`, the wordmark resolves to `/`, and neither `Local preview` nor `Local concept preview` appears in `document.body.textContent`.

Add a separate route-removal test:

```js
test("the obsolete apple preview route is not available", async () => {
  const page = await browser.newPage();
  const response = await page.goto(`${baseUrl}/apple-preview/`, { waitUntil: "networkidle0" });
  assert.equal(response?.status(), 404);
  assert.equal(await page.locator(".apple-home-root").count(), 0);
  await page.close();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Start the app on port 3105, then run:

```powershell
node --test tests/tools/apple-homepage.test.js
```

Expected: FAIL because `/` still renders `HomePageView`, the new primary navigation is absent, and `/apple-preview/` still returns 200.

- [ ] **Step 3: Commit the failing contract**

```powershell
git add tests/tools/apple-homepage.test.js tests/tools/apple-preview.test.js
git commit -m "test: require apple design on main homepage"
```

---

### Task 2: Promote the complete design and delete the preview route

**Files:**
- Replace: `app/page.tsx`
- Move: `app/apple-preview/apple-preview.module.css` to `app/apple-home.module.css`
- Delete: `app/apple-preview/page.tsx`
- Delete: `app/apple-preview/`
- Test: `tests/tools/apple-homepage.test.js`

**Interfaces:**
- Consumes: `profile`, `projects`, `workCategories`, and `engineeringTools` data exports.
- Produces: `HomePage(): JSX.Element` at `/`; marker class `.apple-home-root`; anchors `#work`, `#tools`, and `#contact`.

- [ ] **Step 1: Move the stylesheet and rename route-scoped selectors**

Relocate the complete CSS Module to `app/apple-home.module.css`. Replace every `.apple-preview-root` selector with `.apple-home-root`. Delete the `.previewBadge` base and responsive rules because the preview badge no longer exists. Preserve every other declaration unchanged.

- [ ] **Step 2: Replace the root page with the full design**

Move the complete component body into `app/page.tsx`, import `./apple-home.module.css`, rename the component to `HomePage`, and use:

```tsx
<div className={`apple-home-root ${styles.page}`}>
  <nav className={styles.navigation} aria-label="Primary navigation">
    <Link className={styles.wordmark} href="/" aria-label="Ahmed Asl, home">
```

Remove the `previewBadge` element. Change the footer’s second metadata item to:

```tsx
<span>Embedded systems · IoT · Robotics · 2026</span>
```

Keep every hero, project, tool, and contact block otherwise unchanged.

- [ ] **Step 3: Delete the obsolete route source**

Remove `app/apple-preview/page.tsx` and the now-empty `app/apple-preview` directory. Do not create a redirect or replacement route.

- [ ] **Step 4: Run the focused test and verify GREEN**

With the app still running on port 3105, run:

```powershell
node --test tests/tools/apple-homepage.test.js
```

Expected: all homepage structure, contrast, responsive, copy, and route-removal tests PASS.

- [ ] **Step 5: Commit the production migration**

```powershell
git add app/page.tsx app/apple-home.module.css app/apple-preview tests/tools/apple-homepage.test.js
git commit -m "feat: promote apple design to main homepage"
```

---

### Task 3: Verify, publish, and check the live site

**Files:**
- Verify: all source files changed by Tasks 1 and 2.
- Publish: generated `out/` tree to the GitHub Pages `main` branch.

**Interfaces:**
- Consumes: committed homepage implementation and production `out/` artifact.
- Produces: updated `origin/source`, updated `origin/main`, live `https://eng-asl.com/`, and a 404 at `https://eng-asl.com/apple-preview/`.

- [ ] **Step 1: Run static verification**

```powershell
npx tsc --noEmit --pretty false
npm run validate:content
npm run build
```

Expected: all commands exit zero; build output lists `/` and does not list `/apple-preview`.

- [ ] **Step 2: Inspect the production artifact**

Verify:

```powershell
Test-Path out\index.html
Test-Path out\apple-preview
Select-String -Path out\index.html -Pattern "From rough idea to working system." -SimpleMatch
```

Expected: root file is `True`, preview directory is `False`, and the headline is found in `out/index.html`.

- [ ] **Step 3: Run the repository suite with its server prerequisite**

Start Next.js at `http://127.0.0.1:3000`, then run:

```powershell
$env:TEST_BASE_URL="http://127.0.0.1:3000"
$env:AI_GENERATOR_TEST_URL="http://127.0.0.1:3000/tools/ai-script-generator/"
npm test
```

Expected: zero failures. Stop the local server after the run.

- [ ] **Step 4: Push source without force**

Fetch `origin/source`, verify it is an ancestor of `HEAD`, then push `HEAD:source`.

- [ ] **Step 5: Publish the exact static artifact**

Create a clean deployment worktree from `origin/main` under `.worktrees/`. Mirror `out/` into it while preserving only its `.git` link, verify `CNAME` equals `eng-asl.com`, verify the artifact contains no `apple-preview` directory, commit as `deploy: promote apple design to main homepage`, and push `HEAD:main` only after confirming the push is fast-forward.

- [ ] **Step 6: Verify GitHub Pages and public routes**

Wait for the Pages workflow for the deployment commit to complete successfully. Verify:

```text
https://eng-asl.com/                -> HTTP 200 and expected headline
https://eng-asl.com/apple-preview/  -> HTTP 404
```

- [ ] **Step 7: Report exact commits and live verification**

Report the source commit, deployment commit, successful Pages workflow URL, test counts, main homepage URL, and removed-route status.
