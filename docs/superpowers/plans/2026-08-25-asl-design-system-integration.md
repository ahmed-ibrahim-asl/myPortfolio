# ASL Design System Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the maintained `myPortfolio/` application into the English-first ASL identity across every portfolio and engineering-tool route, verify the static GitHub Pages export, then remove the obsolete outer application.

**Architecture:** Add a token-driven ASL theme after the existing style sheets, then move shared identity, shell, page structures, and tool surfaces onto those tokens. Keep portfolio facts in existing data modules and preserve tool engines and state. Use static source-contract tests for visual structure and the existing browser-driven suite for behavior and responsive verification.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS, Node test runner, static export under `/myPortflio/`.

## Global Constraints

- The site remains English-first; `عسل` appears as a restrained identity mark and decorative watermark.
- Use `#0B0D11`, `#12161C`, `#1C2129`, `#E6E8EB`, `#A7AEB8`, `#78828F`, and `#D9A441` as the core palette.
- Use Archivo for Latin interface text, Space Mono for data labels, Sora for the Latin mark, and Aref Ruqaa for the Arabic mark.
- Gold covers less than five percent of a viewport.
- Use two- to four-pixel panel radii; reserve eight pixels for dialogs.
- Body and form text starts at 16px; interactive targets measure at least 44 by 44 CSS pixels.
- Keep static export support and the `/myPortflio/` GitHub Pages base path.
- Preserve real project, publication, biography, writing, and tool data.
- Preserve tool calculation, generation, state, validation, export, and download behavior.
- Do not stage unrelated pre-existing changes. Preserve the generated tool-cover assets and metadata already present in the worktree.
- Avoid Bento, masonry, horizontal-scroll, editorial-magazine, Swiss twelve-column, cyberpunk HUD, hover-scale, and continuous decorative animation patterns.
- Respect visible keyboard focus and `prefers-reduced-motion`.

---

## File structure

- `app/asl-theme.css`: brand tokens, typography, shell, fault-line layout, portfolio pages, responsive rules.
- `app/asl-tools.css`: shared calculator and advanced-workbench token mapping and responsive overrides.
- `components/brand/AslLogo.tsx`: Arabic, Latin, glyph, and paired identity lockups.
- `components/brand/AslSection.tsx`: decorative fault line and indexed section label.
- `public/brand/`: supplied hex badges and identity portrait copied from the archive.
- `tests/tools/asl-design-contract.test.js`: source-level design-system, shell, page, and anti-pattern contract.
- Existing pages and components keep their data responsibilities and receive structural ASL classes.

### Task 1: Brand foundation and source contract

**Files:**
- Create: `tests/tools/asl-design-contract.test.js`
- Create: `app/asl-theme.css`
- Create: `app/asl-tools.css`
- Create: `components/brand/AslLogo.tsx`
- Create: `components/brand/AslSection.tsx`
- Create: `public/brand/hex-badge-gold.svg`
- Create: `public/brand/hex-badge-white.svg`
- Create: `public/brand/portrait-asl.png`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `AslLogo({ form, tone, className })` and `AslSection({ index, label, children, className })`.
- Produces: semantic CSS tokens used by all later tasks.

- [ ] **Step 1: Write the failing design contract**

```js
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("ASL tokens, fonts, and responsive safeguards are loaded globally", () => {
  const layout = read("app/layout.tsx");
  const theme = read("app/asl-theme.css");
  assert.match(layout, /import "\.\/asl-theme\.css"/);
  assert.match(layout, /import "\.\/asl-tools\.css"/);
  for (const value of ["#0B0D11", "#D9A441", "Archivo", "Space Mono", "Aref Ruqaa"]) {
    assert.ok(theme.includes(value), `missing ${value}`);
  }
  assert.match(theme, /prefers-reduced-motion:\s*reduce/);
  assert.match(theme, /min-width:\s*44px/);
});
```

- [ ] **Step 2: Run the contract and confirm the missing-theme failure**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL because `app/asl-theme.css` and the imports do not exist.

- [ ] **Step 3: Copy only the approved supplied assets**

Extract these exact archive entries into `public/brand/`: `assets/brand/hex-badge-gold.svg`, `assets/brand/hex-badge-white.svg`, and `assets/brand/portrait-asl.png`. Do not copy `_ds_bundle.js`, demo HTML, or fictitious portfolio content.

- [ ] **Step 4: Implement the brand components**

```tsx
type AslLogoProps = {
  form?: "arabic" | "latin" | "glyph" | "paired";
  tone?: "gold" | "white";
  className?: string;
};

export function AslLogo({ form = "latin", tone = "gold", className = "" }: AslLogoProps) {
  const labels = { arabic: "عسل", latin: "ASL", glyph: "ع", paired: "عسل | ASL" };
  return <span className={`asl-logo asl-logo--${form} asl-logo--${tone} ${className}`.trim()}>{labels[form]}</span>;
}
```

`AslSection` renders a semantic `<section>` with `.asl-section`, a decorative `aria-hidden="true"` rail, and a mono label containing the two-digit index and supplied label.

- [ ] **Step 5: Implement exact global tokens and imports**

Start `app/asl-theme.css` with the approved Google Font import and tokens:

```css
@import url("https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..125,300..800&family=Aref+Ruqaa:wght@400;700&family=Sora:wght@600;700&family=Space+Mono:wght@400;700&display=swap");

:root {
  --asl-page: #0B0D11;
  --asl-surface: #12161C;
  --asl-raised: #1C2129;
  --asl-text: #E6E8EB;
  --asl-text-secondary: #A7AEB8;
  --asl-muted: #78828F;
  --asl-gold: #D9A441;
  --asl-ok: #5FA37A;
  --asl-alert: #C4553D;
  --asl-info: #6E8BA8;
  --asl-font: "Archivo", "Segoe UI", sans-serif;
  --asl-mono: "Space Mono", Consolas, monospace;
  --asl-mark-ar: "Aref Ruqaa", serif;
  --asl-mark-latin: "Sora", sans-serif;
}
```

Import `asl-theme.css` and `asl-tools.css` after `series-theme.css` in `app/layout.tsx` so semantic overrides win without editing the user's current `game-theme.css` work.

- [ ] **Step 6: Run the contract and full content validation**

Run: `node --test tests/tools/asl-design-contract.test.js && npm run validate:content`

Expected: PASS.

- [ ] **Step 7: Commit the brand foundation**

```powershell
git add app/asl-theme.css app/asl-tools.css app/layout.tsx components/brand public/brand tests/tools/asl-design-contract.test.js
git commit -m "feat: add ASL brand foundation"
```

### Task 2: Global shell and navigation

**Files:**
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `components/SiteHeader.tsx`
- Modify: `components/SiteFooter.tsx`
- Modify: `app/asl-theme.css`

**Interfaces:**
- Consumes: `AslLogo` from Task 1.
- Produces: conventional desktop navigation, accessible mobile drawer, and paired footer lockup.

- [ ] **Step 1: Extend the contract before editing the shell**

```js
test("the global shell uses ASL identity without HUD navigation", () => {
  const header = read("components/SiteHeader.tsx");
  const footer = read("components/SiteFooter.tsx");
  assert.match(header, /AslLogo/);
  assert.doesNotMatch(header, /SystemHud/);
  assert.match(header, /Contact/);
  assert.match(footer, /form="paired"/);
});
```

- [ ] **Step 2: Confirm the shell test fails for the current HUD header**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL because `SiteHeader` imports `SystemHud` and does not render `AslLogo`.

- [ ] **Step 3: Replace the shell composition**

`SiteHeader` renders the gold hex asset, `AslLogo form="latin"`, a small `عسل` signature hidden below 960px, the five existing navigation links, and a contact link. Keep `usePathname`, `aria-current`, `aria-expanded`, `aria-controls`, and menu-close behavior. Remove the `SystemHud` import and render call without deleting the dirty `SystemHud.tsx` file.

`SiteFooter` renders `AslLogo form="paired"`, the current email and social links, navigation, and current year.

- [ ] **Step 4: Style stable interaction states**

Use border and color changes between 150ms and 240ms. Add `:focus-visible` rings, 44px menu and navigation targets, sticky-header anchor offset, and a one-column mobile drawer below 760px. Do not use scale transforms.

- [ ] **Step 5: Verify and commit the shell**

Run: `node --test tests/tools/asl-design-contract.test.js`

```powershell
git add components/SiteHeader.tsx components/SiteFooter.tsx app/asl-theme.css tests/tools/asl-design-contract.test.js
git commit -m "feat: redesign the ASL site shell"
```

### Task 3: Instrumented fault-line homepage

**Files:**
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `app/page.tsx`
- Modify: `components/ProfilePortrait.tsx`
- Modify: `components/ProjectCard.tsx`
- Modify: `components/SectionHeading.tsx`
- Modify: `app/asl-theme.css`

**Interfaces:**
- Consumes: `AslLogo`, `AslSection`, current portfolio data, `ProjectCard`, and `PostCard`.
- Produces: the seven-part homepage from the approved spec and the reusable project-log presentation.

- [ ] **Step 1: Add a failing homepage structure contract**

```js
test("home follows the ASL fault-line composition", () => {
  const home = read("app/page.tsx");
  assert.match(home, /className="asl-hero/);
  assert.match(home, /className="asl-watermark"/);
  assert.match(home, /<AslSection index="0[2-8]"/);
  assert.doesNotMatch(home, /PixelWorld|SystemHud|data-text=/);
  assert.match(home, /Calculate/);
  assert.match(home, /Generate/);
});
```

- [ ] **Step 2: Confirm the current homepage fails the contract**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL because the hero and indexed ASL sections are absent.

- [ ] **Step 3: Recompose the homepage with existing factual data**

Build these ordered regions: identity hero, four capabilities, selected work, credibility register, Question/Learn/Build/Test method, Calculate/Generate/Simulate/Plan tool entry points, field notes, and contact. Render `عسل` in `.asl-watermark` with `aria-hidden="true"`. Keep one portrait and the existing contact/work links.

- [ ] **Step 4: Implement the desktop and mobile fault line**

At 1200px, use `grid-template-columns: minmax(44px,.35fr) repeat(2,minmax(0,1fr)) 28px repeat(2,minmax(0,1fr)) minmax(44px,.35fr)`. Below 900px, switch to one content column and render the rail as a 32px left marker. Below 640px, use 20px page gutters and crop the watermark behind the hero without overlapping text.

- [ ] **Step 5: Verify the homepage contract and production build**

Run: `node --test tests/tools/asl-design-contract.test.js && npm run build`

Expected: PASS and static export completes.

- [ ] **Step 6: Commit the homepage**

```powershell
git add app/page.tsx components/ProfilePortrait.tsx components/ProjectCard.tsx components/SectionHeading.tsx app/asl-theme.css tests/tools/asl-design-contract.test.js
git commit -m "feat: build the ASL fault-line homepage"
```

### Task 4: Work, About, Writing, Contact, and detail pages

**Files:**
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `app/work/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `app/writing/page.tsx`
- Modify: `app/writing/[slug]/page.tsx`
- Modify: `app/contact/page.tsx`
- Modify: `components/PostCard.tsx`
- Modify: `components/WritingIndex.tsx`
- Modify: `components/WritingSeries.tsx`
- Modify: `app/asl-theme.css`

**Interfaces:**
- Consumes: existing project, experience, education, publication, tutorial, and post data.
- Produces: problem log, chronological trace, field-note register, readable articles, and engineering brief.

- [ ] **Step 1: Add failing route contracts**

```js
test("primary routes declare their ASL page modes", () => {
  const expected = new Map([
    ["app/work/page.tsx", "asl-work-log"],
    ["app/about/page.tsx", "asl-about-trace"],
    ["app/writing/page.tsx", "asl-field-notes"],
    ["app/contact/page.tsx", "asl-brief"],
  ]);
  for (const [file, className] of expected) assert.ok(read(file).includes(className));
});
```

- [ ] **Step 2: Confirm the route contract fails**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL for all four missing page-mode classes.

- [ ] **Step 3: Implement each route structure**

- Work: use an indexed problem log with image, domain, description, tags, and result.
- About: use one portrait, chronological experience/education rail, publication citations, work-context skills, and tutorials.
- Writing: remove `WorldGallery`, keep series and search, and present posts as an indexed register.
- Article: add a compact metadata rail, readable measure, code overflow, and a breadcrumb back to Writing.
- Contact: retain the real FormSubmit action, add work type, domain, timeline, project links, and direct channels with explicit labels.

- [ ] **Step 4: Add route-specific responsive CSS**

Use the fault line as a desktop alignment aid and a left marker on narrow screens. Keep articles below 74 characters per line, stack contact fields below 760px, and convert wide publication records into labeled rows below 640px.

- [ ] **Step 5: Verify and commit primary routes**

Run: `node --test tests/tools/asl-design-contract.test.js && npm run validate:content && npm run build`

```powershell
git add app/work app/about app/writing app/contact components/PostCard.tsx components/WritingIndex.tsx components/WritingSeries.tsx app/asl-theme.css tests/tools/asl-design-contract.test.js
git commit -m "feat: redesign ASL portfolio routes"
```

### Task 5: Tools index and calculator system

**Files:**
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `app/tools/page.tsx`
- Modify: `components/tools/ToolsIndex.js`
- Modify: `components/tools/ToolCard.js`
- Modify: `components/tools/CalculatorShell.js`
- Modify: `components/tools/CalculatorUI.js`
- Modify: `components/tools/CalculatorFinder.js`
- Modify: `components/tools/ToolShell.tsx`
- Modify: `app/asl-tools.css`

**Interfaces:**
- Consumes: `getAllTools`, `engineeringTools`, current filter logic, calculator components, and preserved cover images.
- Produces: Calculate/Generate/Simulate/Plan/Investigate register and shared measured calculator surfaces.

- [ ] **Step 1: Add failing tool-system contracts**

```js
test("tools use task groups and the shared ASL workbench shell", () => {
  const index = read("app/tools/page.tsx");
  const shell = read("components/tools/CalculatorShell.js");
  for (const label of ["Calculate", "Generate", "Simulate", "Plan", "Investigate"]) {
    assert.ok(index.includes(label));
  }
  assert.match(shell, /asl-calculator-shell/);
});
```

- [ ] **Step 2: Confirm the current tools route fails**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL because the task groups and shell class are absent.

- [ ] **Step 3: Recompose the tools index without changing search behavior**

Keep all 36 calculators and five advanced tools. Group the advanced tools by the approved job labels and present calculators as compact register entries. Preserve the current full-card links, images, search, category filters, empty state, result count, and active calculator finder.

- [ ] **Step 4: Map calculator UI to ASL tokens**

Use `.asl-calculator-shell`, `.calculator-panel`, `.calculator-field`, `.calculator-results`, `.tool-diagram`, and `.calculator-finder` selectors in `asl-tools.css`. Inputs receive 16px text, 44px minimum height, gold focus rings, direct error colors, and contained overflow.

- [ ] **Step 5: Run calculator and responsive tests**

Run: `node --test tests/tools/asl-design-contract.test.js tests/tools/calculator-restoration.test.js tests/tools/calculator-theme.test.js tests/tools/discoverability.test.js`

Expected: PASS with 36 calculators and unchanged formulas.

- [ ] **Step 6: Commit the tool index and calculators**

```powershell
git add app/tools/page.tsx components/tools/ToolsIndex.js components/tools/ToolCard.js components/tools/CalculatorShell.js components/tools/CalculatorUI.js components/tools/CalculatorFinder.js components/tools/ToolShell.tsx app/asl-tools.css tests/tools/asl-design-contract.test.js
git commit -m "feat: unify ASL tools and calculators"
```

### Task 6: Advanced engineering workbenches

**Files:**
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `app/asl-tools.css`
- Modify only when global mapping cannot express a state: `components/tools/model-mission/ModelMission.module.css`
- Modify only when global mapping cannot express a state: `components/tools/security-mission/SecurityMission.module.css`

**Interfaces:**
- Consumes: existing Model Mission, Security Mission, sensor generator, PID, and battery DOM and state.
- Produces: ASL surfaces, controls, status, code panels, and responsive workbench behavior without engine changes.

- [ ] **Step 1: Add a failing selector and anti-pattern contract**

```js
test("advanced workbench families receive ASL token mappings", () => {
  const tools = read("app/asl-tools.css");
  for (const selector of [
    ".model-mission-shell",
    ".security-mission-shell",
    ".embedded-workbench",
    ".pid-simulator",
    ".battery-estimator",
  ]) assert.ok(tools.includes(selector), `missing ${selector}`);
  assert.doesNotMatch(tools, /text-shadow:\s*0 0|animation:\s*glitch|transform:\s*scale\(/);
});
```

- [ ] **Step 2: Confirm missing workbench mappings fail**

Run: `node --test tests/tools/asl-design-contract.test.js`

Expected: FAIL for each advanced family not yet mapped.

- [ ] **Step 3: Implement semantic workbench mappings**

Map page, surface, raised, text, line, accent, status, input, tab, code, dialog, toast, and focus variables for all five families. Gold marks active steps and primary actions. Green, red, and blue retain status meaning. Remove decorative glow, glitch, scanline, and continuous animation from rendered workbench surfaces.

- [ ] **Step 4: Preserve responsive state models**

Above 1200px, keep the current split configuration/output workspaces. At 1200px and below, keep the existing tabs or stacked panels and preserve selections, generated output, validation, imports, and downloads. Do not change engine modules or catalogs.

- [ ] **Step 5: Run all specialized suites**

Run: `npm test`

Expected: every Node test passes, including model mission, security mission, sensor generator, PID, battery, calculators, and export contracts.

- [ ] **Step 6: Commit only ASL workbench styling and tests**

```powershell
git add app/asl-tools.css tests/tools/asl-design-contract.test.js components/tools/model-mission/ModelMission.module.css components/tools/security-mission/SecurityMission.module.css
git commit -m "feat: apply ASL styling to engineering workbenches"
```

### Task 7: Responsive, accessibility, and visual verification

**Files:**
- Modify: `tests/tools/site-responsive.test.js`
- Modify: `tests/tools/asl-design-contract.test.js`
- Modify: `app/asl-theme.css`
- Modify: `app/asl-tools.css`

**Interfaces:**
- Consumes: all completed routes.
- Produces: verified viewport, keyboard, reduced-motion, and console behavior.

- [ ] **Step 1: Extend browser assertions before final fixes**

Add computed checks for `--asl-gold`, 16px body/form floors, 44px target floors, one home portrait, no visible HUD/pixel-world, no horizontal page overflow, and a visible focus outline on the first navigation link.

- [ ] **Step 2: Run the responsive test and record exact failures**

Run: `node --no-warnings --test tests/tools/site-responsive.test.js`

Expected: FAIL only for remaining responsive or focus gaps introduced by the redesign.

- [ ] **Step 3: Fix the reported selectors without hiding overflow globally**

Adjust the component responsible for each failure. Keep code and table overflow inside their local wrappers. Do not use blanket clipping as a substitute for fitting layout content.

- [ ] **Step 4: Run automated verification**

Run:

```powershell
npm run validate:content
npx tsc --noEmit
npm test
npm run build
$env:GITHUB_ACTIONS='true'; npm run build; Remove-Item Env:GITHUB_ACTIONS
```

Expected: all commands exit with code 0 and the exported links include `/myPortflio/`.

- [ ] **Step 5: Inspect representative pages in the browser**

Inspect Home, Work, About, Writing, Contact, Tools, Ohm's Law, sensor generator, PID, battery, Model Mission, and Security Mission at 1440px, 1024px, 768px, 375px, and 320px. Check the full-page reading path, menu, filters, forms, active states, code panels, and console errors.

- [ ] **Step 6: Commit verification fixes**

```powershell
git add tests/tools/site-responsive.test.js tests/tools/asl-design-contract.test.js app/asl-theme.css app/asl-tools.css
git commit -m "test: verify ASL responsive experience"
```

### Task 8: Remove the obsolete outer application and complete the audit

**Files:**
- Remove from `D:\work\portflioWebsite` after path verification: `app`, `components`, `content`, `data`, `lib`, `public`, `scripts`, `src`, `studio`, `tests`, `.next`, `out`, root `package.json`, root `package-lock.json`, root `next.config.mjs`, root `jsconfig.json`, root `README.md`, and root studio/tunnel log files.
- Preserve: `myPortfolio`, `عسل  ASL Design System.zip`, `.agents`, `.codex`, `.ease`, `.github`, `.worktrees`, `securityMissionWorktree`, `.deploy-nojekyll-fix`, and workspace metadata.

**Interfaces:**
- Consumes: a fully verified maintained app.
- Produces: one maintained portfolio source tree and the supplied design-system archive.

- [ ] **Step 1: Verify deletion targets resolve inside the outer workspace and outside the maintained app**

Resolve every target with `Resolve-Path -LiteralPath`. Abort removal if any resolved target equals `D:\work\portflioWebsite`, begins with `D:\work\portflioWebsite\myPortfolio`, or falls outside `D:\work\portflioWebsite`.

- [ ] **Step 2: Remove the verified obsolete targets with native PowerShell**

```powershell
$workspacePath = 'D:\work\portflioWebsite'
$maintainedPath = 'D:\work\portflioWebsite\myPortfolio'
$obsoleteNames = @(
  'app','components','content','data','lib','public','scripts','src','studio','tests',
  '.next','out','package.json','package-lock.json','next.config.mjs','jsconfig.json',
  'README.md','.local-public-dev.err.log','.local-public-dev.out.log',
  '.local-public-tunnel.err.log','.local-public-tunnel.out.log'
)
$resolvedWorkspace = [IO.Path]::GetFullPath($workspacePath).TrimEnd('\')
$resolvedMaintained = [IO.Path]::GetFullPath($maintainedPath).TrimEnd('\')
$obsoleteTargets = foreach ($name in $obsoleteNames) {
  $candidate = Join-Path $resolvedWorkspace $name
  if (Test-Path -LiteralPath $candidate) { [IO.Path]::GetFullPath($candidate).TrimEnd('\') }
}
foreach ($target in $obsoleteTargets) {
  if (!$target.StartsWith($resolvedWorkspace + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw "Target leaves workspace: $target"
  }
  if ($target.Equals($resolvedWorkspace, [StringComparison]::OrdinalIgnoreCase) -or
      $target.Equals($resolvedMaintained, [StringComparison]::OrdinalIgnoreCase) -or
      $target.StartsWith($resolvedMaintained + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw "Unsafe target: $target"
  }
}
foreach ($target in $obsoleteTargets) {
  Remove-Item -LiteralPath $target -Recurse -Force
}
```

Do not construct or pass deletion commands through another shell.

- [ ] **Step 3: Confirm the maintained app and archive remain**

Run:

```powershell
Test-Path -LiteralPath 'D:\work\portflioWebsite\myPortfolio\package.json'
Test-Path -LiteralPath 'D:\work\portflioWebsite\عسل  ASL Design System.zip'
Get-ChildItem -LiteralPath 'D:\work\portflioWebsite' -Force | Select-Object Name
```

Expected: both tests return `True`; no outer Next.js source or build directory remains.

- [ ] **Step 4: Run the final maintained-app verification after cleanup**

Run from `myPortfolio/`: `npm run validate:content && npx tsc --noEmit && npm test && npm run build`

Expected: all commands exit with code 0.

- [ ] **Step 5: Audit every acceptance criterion against current evidence**

Compare the final files, automated outputs, browser screenshots, console logs, static export, base-path links, and outer workspace listing with the design specification. Keep the task active if any criterion lacks direct evidence.

- [ ] **Step 6: Keep the audit honest**

If the audit finds a defect, return to the task that owns the failed criterion, add a failing regression assertion, implement the fix, rerun that task's full verification, and commit the named files from that task. Do not use a generic completion commit to hide an unresolved criterion.
