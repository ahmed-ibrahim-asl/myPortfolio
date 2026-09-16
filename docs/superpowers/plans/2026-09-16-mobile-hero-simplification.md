# Mobile Hero Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the phone homepage hero while retaining the existing profile card, and ship the already-approved desktop portrait-frame alignment fix.

**Architecture:** Keep one semantic hero DOM for desktop and mobile, using the existing `.home-copy-desktop` and `.home-copy-mobile` spans for copy variants. Add mobile-only action classes so CSS changes the second action from a boxed button to a quiet text link without changing desktop behavior. Extend the existing Puppeteer regression coverage across 320–430px, both themes, and 1366px desktop.

**Tech Stack:** Next.js 15, React 19, CSS, Node test runner, Puppeteer Core, static export to GitHub Pages.

## Global Constraints

- Mobile identity card and circular portrait remain visible in their existing horizontal arrangement.
- Full role stays `Embedded Systems & IoT R&D Engineer`.
- Mobile intro is exactly `I turn firmware and connected electronics into working prototypes.`
- Mobile primary action stays `See selected projects` and is at least 48px tall.
- Mobile tools action reads `Explore 53 free engineering tools →` and appears as a centered text link.
- Standalone Arabic phrase is hidden on mobile; Arabic navigation branding remains.
- Desktop hero content and two-button action treatment remain unchanged.
- Support 320, 360, 390, and 430px in light and dark themes without horizontal overflow.

---

### Task 1: Lock the focused mobile hierarchy in browser tests

**Files:**
- Modify: `tests/tools/home-mobile-clear-service.test.js`

**Interfaces:**
- Consumes: homepage selectors `.home-mobile-identity`, `.home-intro`, `.home-actions`, `.home-title-ar-mobile`.
- Produces: regression assertions for the approved copy, primary/link hierarchy, hidden Arabic phrase, preserved portrait, and unchanged desktop controls.

- [ ] **Step 1: Update the mobile test expectations to the approved design**

Change the intro assertion to:

```js
assert.equal(mobile.intro, 'I turn firmware and connected electronics into working prototypes.');
```

Record each action's class, display, height, and text-decoration, then assert:

```js
assert.deepEqual(mobile.actionLabels, ['SEE SELECTED PROJECTS', 'EXPLORE 53 FREE ENGINEERING TOOLS →']);
assert.equal(mobile.primaryHeight >= 48, true);
assert.equal(mobile.toolsActionIsQuiet, true);
assert.equal(mobile.arabicVisible, false);
```

Add desktop assertions that both actions remain visible boxed controls and retain `View selected work` / `Open engineering tools`.

- [ ] **Step 2: Run the focused test and confirm it fails for the old hierarchy**

Run:

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:3105'; node --test tests/tools/home-mobile-clear-service.test.js
```

Expected: FAIL because the old intro, second boxed button, and visible Arabic mobile phrase are still rendered.

- [ ] **Step 3: Commit the failing regression test together with its implementation in Task 2**

The test and implementation form one user-visible change and will be committed after Task 2 passes.

---

### Task 2: Implement the simplified mobile hero

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/home-grid.css`
- Test: `tests/tools/home-mobile-clear-service.test.js`

**Interfaces:**
- Consumes: `totalToolCount`, existing Next.js `Link` actions, existing responsive copy helpers.
- Produces: `.home-action-primary` and `.home-action-tools` hooks used by mobile CSS and tests.

- [ ] **Step 1: Update mobile-only content and action hooks**

In `app/page.tsx`, keep the desktop copy unchanged and replace the mobile intro with:

```tsx
<span className="home-copy-mobile">I turn firmware and connected electronics into working prototypes.</span>
```

Add stable classes and the dynamic tools count:

```tsx
<Link className="btn-primary home-action-primary" href="/work">...</Link>
<Link className="btn-secondary home-action-tools" href="/tools">
  <span className="home-copy-desktop">Open engineering tools</span>
  <span className="home-copy-mobile">Explore {totalToolCount} free engineering tools →</span>
</Link>
```

Keep the existing Arabic element in the DOM so desktop semantics remain stable; hide it in the mobile media query.

- [ ] **Step 2: Apply the mobile-only visual hierarchy**

In `app/home-grid.css` inside `@media (max-width: 560px)`:

```css
.home-actions { gap: 0; margin-top: 22px; }
.home-actions .home-action-primary { min-height: 52px; }
.home-actions .home-action-tools {
  min-height: 44px;
  margin-top: 9px;
  padding: 10px;
  color: var(--text-primary);
  background: transparent;
  border: 0;
  box-shadow: none;
  text-decoration: underline;
  text-underline-offset: 5px;
}
.home-title-ar-mobile { display: none; }
```

Retain the current identity-card width, portrait dimensions, typography, and ordering. Do not alter desktop action styles.

- [ ] **Step 3: Run the focused test and confirm it passes**

Run:

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:3105'; node --test tests/tools/home-mobile-clear-service.test.js
```

Expected: PASS at all four mobile widths in both themes and at desktop width.

- [ ] **Step 4: Commit the focused mobile change**

```powershell
git add app/page.tsx app/home-grid.css tests/tools/home-mobile-clear-service.test.js
git commit -m "feat: simplify mobile homepage hero"
```

---

### Task 3: Verify portrait alignment and production export

**Files:**
- Modify: `app/home-grid.css`
- Create: `tests/tools/home-portrait-frame.test.js`

**Interfaces:**
- Consumes: `.portrait-instrument` and `.profile-portrait` desktop layout.
- Produces: equal portrait mat insets at wide desktop widths and a deployable `out/` export.

- [ ] **Step 1: Preserve the approved desktop portrait alignment rule**

Keep the existing pending rule:

```css
.portrait-instrument .profile-portrait {
  width: 100%;
  margin: 0;
  padding: 14px 14px 52px;
  justify-self: stretch;
  background: var(--portrait-mat);
}
```

- [ ] **Step 2: Run both focused browser tests**

Run:

```powershell
$env:TEST_BASE_URL='http://127.0.0.1:3105'; node --test tests/tools/home-mobile-clear-service.test.js tests/tools/home-portrait-frame.test.js
```

Expected: 2 tests pass with 0 failures.

- [ ] **Step 3: Build the static export**

Run:

```powershell
$env:GITHUB_ACTIONS='true'; npm run build
```

Expected: Next.js build completes and exports the site to `out/` with no error.

- [ ] **Step 4: Commit the remaining portrait regression file if it was not included in Task 2**

```powershell
git add app/home-grid.css tests/tools/home-portrait-frame.test.js
git commit -m "fix: align desktop portrait frame"
```

- [ ] **Step 5: Publish source and generated Pages output**

Push the source commit to `origin/source`, mirror the verified `out/` directory into the clean Pages worktree tracking `origin/main`, verify `CNAME` contains `eng-asl.com`, commit the generated output, and push to `origin/main` without force.

- [ ] **Step 6: Verify the deployed site**

After GitHub Pages propagation, load `http://eng-asl.com/` at 390px and 1920px. Confirm the mobile approved hierarchy, both themes, equal desktop portrait insets, working `/work` and `/tools` links, and no missing CSS or images.
