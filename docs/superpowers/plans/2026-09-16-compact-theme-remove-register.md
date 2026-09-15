# Compact Theme Control and Homepage Register Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the verbose mobile theme row with one compact theme action and remove the homepage statistics register on every viewport.

**Architecture:** Keep the existing theme state and persistence logic, changing only the visible button markup and responsive alignment. Remove the register at its React source and delete its dedicated CSS rules so no empty layout remains.

**Tech Stack:** Next.js 16, React, TypeScript, CSS, Node test runner, Puppeteer.

## Global Constraints

- The button must keep its existing `aria-label`, `aria-pressed`, click behavior, and saved preference.
- The visible action names the destination theme: `Light` in dark mode and `Dark` in light mode.
- The homepage register must not exist on mobile or desktop.
- Existing hero identity, headline, CTAs, Arabic signature, and tools hook remain unchanged.
- Mobile controls retain a minimum 44 by 44 pixel target and must not overflow at 320 pixels.

---

### Task 1: Lock the concise navigation and removed register behavior

**Files:**
- Modify: `tests/tools/home-mobile-clear-service.test.js`
- Modify: `tests/tools/theme-tools-browser.test.js`

**Interfaces:**
- Consumes: `.theme-toggle`, `.theme-toggle-action`, `.home-register` DOM selectors.
- Produces: regression expectations for the implementation task.

- [ ] **Step 1: Write the failing assertions**

Add browser assertions equivalent to:

```js
assert.equal(document.querySelector('.theme-toggle-mobile-label'), null);
assert.equal(document.querySelector('.theme-toggle')?.innerText.trim(), 'LIGHT');
assert.equal(document.querySelector('.home-register'), null);
```

After toggling to light mode, assert the visible action becomes `DARK`, while the existing accessible label remains `Switch to dark theme`.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```powershell
node --test tests/tools/home-mobile-clear-service.test.js tests/tools/theme-tools-browser.test.js
```

Expected: FAIL because `Appearance` and `.home-register` still exist.

### Task 2: Implement the compact action and remove the register

**Files:**
- Modify: `components/ThemeToggle.tsx`
- Modify: `app/page.tsx`
- Modify: `app/home-grid.css`
- Test: `tests/tools/home-mobile-clear-service.test.js`
- Test: `tests/tools/theme-tools-browser.test.js`

**Interfaces:**
- Consumes: existing `nextTheme`, `toggleTheme`, `THEME_STORAGE_KEY`, and `.theme-toggle-action` styling.
- Produces: one visible destination-theme action and no homepage register DOM.

- [ ] **Step 1: Simplify the toggle markup**

Remove the mobile label from `ThemeToggle` and keep:

```tsx
<span className="theme-toggle-action">
  <span aria-hidden="true">{nextTheme === "light" ? "☀" : "☾"}</span>
  <span>{nextTheme === "light" ? "Light" : "Dark"}</span>
</span>
```

- [ ] **Step 2: Remove the register at the source**

Delete the `<section className="home-register">...</section>` block from `app/page.tsx`, remove `technologyGroups` from the import, and retain `totalToolCount` because the following tools hook uses it.

- [ ] **Step 3: Remove dead CSS and compact mobile alignment**

Delete every `.home-register` rule. Replace the mobile toggle distribution with a left-aligned compact action:

```css
.theme-toggle { width: auto; justify-content: flex-start; padding-inline: 14px; }
```

Keep the global minimum height and focus styling.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```powershell
node --test tests/tools/home-mobile-clear-service.test.js tests/tools/theme-tools-browser.test.js
```

Expected: PASS with no overflow or accessibility regression.

### Task 3: Verify, commit, and publish

**Files:**
- Verify all modified files.
- Publish the generated `out/` tree to the GitHub Pages branch.

**Interfaces:**
- Consumes: production build and repository deployment convention.
- Produces: tested source commit and live GitHub Pages deployment.

- [ ] **Step 1: Run static verification**

```powershell
npx tsc --noEmit
npm run validate:content
npm run build
```

Expected: all commands exit zero.

- [ ] **Step 2: Inspect the production export**

Confirm `out/index.html` contains no `home-register` or `Appearance`, but contains `theme-toggle-action` and the existing hero content.

- [ ] **Step 3: Commit source changes**

```powershell
git add components/ThemeToggle.tsx app/page.tsx app/home-grid.css tests/tools/home-mobile-clear-service.test.js tests/tools/theme-tools-browser.test.js docs/superpowers/plans/2026-09-16-compact-theme-remove-register.md
git commit -m "fix: simplify mobile theme control"
```

- [ ] **Step 4: Merge, push, and deploy**

Fast-forward the source branch, push it, publish `out/` to the Pages branch, wait for the Pages workflow, and verify the live homepage at 320 and 390 pixels.
