# Tools Mobile Category Centering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Center the `/tools/` category cards at phone widths without changing their internal alignment or unrelated routes.

**Architecture:** Keep the shared shell contract unchanged and add a route-scoped mobile override in `app/asl-tools.css`. Verify the rendered geometry in a browser test by comparing the category card's left and right viewport gutters.

**Tech Stack:** Next.js 16, React, CSS Modules/global CSS, Node test runner, Puppeteer/CDP browser tests.

## Global Constraints

- Preserve the current card width, internal text alignment, spacing, and desktop layout.
- Avoid changing shared shell behavior on unrelated routes.
- Use symmetric page gutters; do not use transforms or positional offsets.

---

### Task 1: Center the mobile tools category grid

**Files:**
- Create: `tests/tools/tools-category-mobile-centering.test.js`
- Modify: `app/asl-tools.css`

**Interfaces:**
- Consumes: `/tools/`, `.asl-tools-register`, `.tools-unified-section`, and the first category link rendered by `ToolsCategoryHub`.
- Produces: A mobile tools shell whose category card left and right viewport gutters differ by no more than one CSS pixel.

- [ ] **Step 1: Write the failing browser regression test**

```js
test('tool category cards have equal mobile viewport gutters', async () => {
  await setViewport(page, 390, 844);
  await page.goto(`${baseUrl}/tools/`, { waitUntil: 'networkidle0' });
  const gutters = await page.$eval('main.tools-unified-section a', card => {
    const rect = card.getBoundingClientRect();
    return { left: rect.left, right: window.innerWidth - rect.right };
  });
  assert.ok(Math.abs(gutters.left - gutters.right) <= 1, JSON.stringify(gutters));
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/tools/tools-category-mobile-centering.test.js`

Expected: FAIL because the current right gutter is about 40px larger than the left gutter.

- [ ] **Step 3: Add the minimal route-scoped mobile override**

```css
@media (max-width: 639px) {
  .asl-tools-register > .shell {
    width: 100%;
  }
}
```

- [ ] **Step 4: Run focused and related tests**

Run: `node --test tests/tools/tools-category-mobile-centering.test.js tests/tools/asl-design-contract.test.js tests/tools/theme-and-tool-categories.test.js`

Expected: PASS.

- [ ] **Step 5: Build and inspect responsive output**

Run: `npm run build`

Expected: Static export completes successfully. Inspect `/tools/` at 390×844 and desktop width; mobile gutters are equal and desktop remains two columns.

- [ ] **Step 6: Commit the implementation**

```bash
git add app/asl-tools.css tests/tools/tools-category-mobile-centering.test.js
git commit -m "fix: center mobile tools categories"
```

### Task 2: Publish and verify the live route

**Files:**
- Modify: GitHub Pages static output on the deployment branch.

**Interfaces:**
- Consumes: the verified source commit from Task 1.
- Produces: centered category cards at `https://ahmed-ibrahim-asl.github.io/myPortfolio/tools/`.

- [ ] **Step 1: Push the source branch**

Run: `git push origin source`

Expected: The source branch contains the centering fix.

- [ ] **Step 2: Export and publish the static site**

Run: `$env:GITHUB_ACTIONS='true'; npm run build`, then mirror `out/` into the validated Pages worktree, commit, and push `origin main`.

Expected: The Pages branch receives the new static export.

- [ ] **Step 3: Verify production geometry**

Open the live `/tools/` route at 390×844 and measure the first category card.

Expected: left and right viewport gutters differ by no more than one CSS pixel, with no horizontal overflow.
