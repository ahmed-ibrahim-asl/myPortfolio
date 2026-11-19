# BioVety Before and After Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the BioVety portfolio page into a permanent before and after case study with a locally rendered Eurokem legacy demo that keeps working if the Wix site disappears.

**Architecture:** Add one project-specific server component below the existing BioVety project entry. The component renders both previews from local React markup and scoped CSS, so neither comparison panel depends on a remote screenshot, iframe, or Wix runtime. Keep the generic portfolio card system unchanged for every other project.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Node test runner

## Global Constraints

- The legacy Eurokem preview must render without network access.
- Do not use an iframe or fetch Wix assets, scripts, styles, or content at runtime.
- Use natural first-person project language.
- Avoid em dashes and en dashes in all new copy.
- Do not publish unverified prices or savings claims.
- State that Hostinger was recommended for value and GoDaddy was implemented for BioVety because the client chose it.
- State that the BioVety website is complete while the wider transition from Eurokem remains ongoing.
- Keep all unrelated project pages unchanged.

---

### Task 1: Add the BioVety case study contract and component

**Files:**
- Create: `tests/tools/biovety-case-study.test.js`
- Create: `components/BiovetyCaseStudy.tsx`
- Create: `components/BiovetyCaseStudy.module.css`
- Modify: `app/work/[category]/[project]/page.tsx`

**Interfaces:**
- Consumes: the resolved `Project` object already returned by the project detail route
- Produces: `BiovetyCaseStudy(): React.JSX.Element` and a route marker `data-case-study="biovety"`

- [ ] **Step 1: Write the failing route test**

```js
import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

test("BioVety includes a local legacy demo and the migration case study", async () => {
  const response = await fetch(`${baseUrl}/work/web-development/biovety-website/`);
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.ok(html.includes('data-case-study="biovety"'));
  assert.ok(html.includes('data-legacy-demo="eurokem"'));
  assert.ok(html.includes("Ongoing migration"));
  assert.ok(html.includes("Hostinger"));
  assert.ok(html.includes("GoDaddy"));
  assert.ok(html.includes("Open the current BioVety website"));
  assert.ok(!html.includes("<iframe"));
  assert.ok(!html.includes("static.wixstatic.com"));
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run the development server in one terminal:

```powershell
npm.cmd run dev
```

Run the focused test in another terminal:

```powershell
node --test tests/tools/biovety-case-study.test.js
```

Expected: FAIL because the case study marker and local Eurokem demo do not exist yet.

- [ ] **Step 3: Create the project-specific component**

Create `components/BiovetyCaseStudy.tsx` with semantic sections and local preview markup. The legacy panel must use only text and CSS elements such as this structure:

```tsx
import styles from "./BiovetyCaseStudy.module.css";

export function BiovetyCaseStudy() {
  return (
    <section className={styles.caseStudy} data-case-study="biovety" aria-labelledby="biovety-case-study-title">
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Website redesign and migration</p>
        <h2 id="biovety-case-study-title">A clearer home for the business, with the wider migration still in progress</h2>
        <p>I rebuilt the client&apos;s web presence around the BioVety identity and a clearer product catalogue. The new website is complete, while the client&apos;s wider move away from Eurokem is still ongoing.</p>
        <span className={styles.status}>Ongoing migration</span>
      </header>

      <div className={styles.comparison}>
        <article className={styles.panel}>
          <div className={styles.legacyDemo} data-legacy-demo="eurokem" aria-label="Local visual demo of the legacy Eurokem Wix website">
            <div className={styles.legacyNav}><strong>EUROKEM</strong><span>HOME&nbsp;&nbsp;ABOUT&nbsp;&nbsp;PRODUCTS&nbsp;&nbsp;CONTACT</span></div>
            <div className={styles.legacyHero}><small>EXPERIENCE CHANGE WITH US</small><strong>DISCOVER OUR EXPERTISE</strong></div>
          </div>
          <p className={styles.panelLabel}>Before</p>
          <h3>Eurokem on Wix</h3>
          <p>A compact local reconstruction preserves the recognizable legacy direction without relying on the live Wix page.</p>
          <a href="https://eurokemsite.wixsite.com/website-1" target="_blank" rel="noreferrer">Open the original Wix site if available</a>
        </article>

        <article className={styles.panel}>
          <div className={styles.currentDemo} aria-label="Local visual demo of the current BioVety website">
            <div className={styles.currentNav}><strong>BIOVETY</strong><span>ABOUT&nbsp;&nbsp;PRODUCTS&nbsp;&nbsp;PARTNERS&nbsp;&nbsp;CONTACT</span></div>
            <div className={styles.currentHero}><small>VETERINARY HEALTH</small><strong>Products made easier to explore</strong></div>
          </div>
          <p className={styles.panelLabel}>After</p>
          <h3>BioVety International</h3>
          <p>The finished site gives the company, catalogue, partners, and contact paths a clearer structure.</p>
          <a href="https://biovety.com/" target="_blank" rel="noreferrer">Open the current BioVety website</a>
        </article>
      </div>

      <section className={styles.operations} aria-labelledby="biovety-operations-title">
        <p className={styles.eyebrow}>Beyond the redesign</p>
        <h3 id="biovety-operations-title">The work also covered the move behind the website</h3>
        <ul>
          <li>Restructured the company presentation and product catalogue.</li>
          <li>Reviewed provider options and recommended Hostinger for cost and feature value.</li>
          <li>Implemented the BioVety domain and hosting on GoDaddy because that was the client&apos;s chosen provider.</li>
          <li>Set up the domain and business email arrangement required for the new identity.</li>
        </ul>
      </section>
    </section>
  );
}
```

- [ ] **Step 4: Add focused responsive styles**

Create `components/BiovetyCaseStudy.module.css`. Use a two-column comparison above 760 pixels and one column below it. Build each browser preview with CSS backgrounds, borders, typography, and spacing. Include `:focus-visible` styles, theme-safe colors through existing `--asl-*` variables, and this minimum responsive contract:

```css
.caseStudy { margin-top: 32px; padding: clamp(24px, 5vw, 56px); border: 1px solid var(--asl-line); background: var(--asl-surface); }
.intro { max-width: 760px; }
.eyebrow, .panelLabel { color: var(--asl-gold); font-size: .78rem; letter-spacing: .08em; text-transform: uppercase; }
.status { display: inline-flex; margin-top: 16px; padding: 8px 12px; border: 1px solid var(--asl-gold); color: var(--asl-gold); }
.comparison { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-top: 36px; }
.panel { min-width: 0; }
.legacyDemo, .currentDemo { min-height: 300px; overflow: hidden; border: 1px solid var(--asl-line); }
.panel a:focus-visible { outline: 3px solid var(--asl-gold); outline-offset: 4px; }
.operations { margin-top: 40px; padding-top: 32px; border-top: 1px solid var(--asl-line); }
@media (max-width: 760px) { .comparison { grid-template-columns: minmax(0, 1fr); } .legacyDemo, .currentDemo { min-height: 240px; } }
```

- [ ] **Step 5: Render the component only for BioVety**

In `app/work/[category]/[project]/page.tsx`, import `BiovetyCaseStudy` and render it after `WorkEntry` only when `project.slug === "biovety-website"`:

```tsx
<div className={styles.detail}>
  <WorkEntry project={project} category={group.id} />
  {project.slug === "biovety-website" ? <BiovetyCaseStudy /> : null}
</div>
```

- [ ] **Step 6: Run the focused test and verify it passes**

```powershell
node --test tests/tools/biovety-case-study.test.js
```

Expected: PASS with the development server running.

- [ ] **Step 7: Commit the case study component**

```powershell
git add -- tests/tools/biovety-case-study.test.js components/BiovetyCaseStudy.tsx components/BiovetyCaseStudy.module.css 'app/work/[category]/[project]/page.tsx'
git commit -m "feat: add BioVety before and after case study"
```

### Task 2: Strengthen the BioVety project record

**Files:**
- Modify: `data/portfolio.ts`
- Test: `tests/tools/biovety-case-study.test.js`

**Interfaces:**
- Consumes: the existing `Project` interface without adding new optional fields
- Produces: the stronger BioVety listing copy, outcome, tags, and existing live-site link

- [ ] **Step 1: Extend the failing test with listing copy assertions**

Add these assertions to the existing BioVety test:

```js
assert.ok(html.includes("Website redesign, catalogue structure, domain, hosting, and business email setup"));
assert.ok(html.includes("Client website completed, wider brand migration ongoing"));
```

- [ ] **Step 2: Run the test and verify the new assertions fail**

```powershell
node --test tests/tools/biovety-case-study.test.js
```

Expected: FAIL because the current project record still contains the generic description and outcome.

- [ ] **Step 3: Update the BioVety project record**

Use this copy in `data/portfolio.ts`:

```ts
description: "Website redesign, catalogue structure, domain, hosting, and business email setup for a veterinary health business moving from its legacy Eurokem presence to the new BioVety identity.",
outcome: "Client website completed, wider brand migration ongoing",
tags: ["Web design", "Product catalogue", "Domain migration", "Hosting setup", "Business email"],
```

Keep `website: "biovety.com"` and the existing `https://biovety.com/` link unchanged.

- [ ] **Step 4: Run the focused test and verify it passes**

```powershell
node --test tests/tools/biovety-case-study.test.js
```

Expected: PASS.

- [ ] **Step 5: Commit the portfolio copy**

```powershell
git add -- data/portfolio.ts tests/tools/biovety-case-study.test.js
git commit -m "content: document BioVety migration work"
```

### Task 3: Verify independence, responsiveness, and production safety

**Files:**
- Modify only if verification exposes a defect: `components/BiovetyCaseStudy.tsx`
- Modify only if verification exposes a defect: `components/BiovetyCaseStudy.module.css`

**Interfaces:**
- Consumes: the completed BioVety route and the repository test and build scripts
- Produces: verified production output with no Wix runtime dependency

- [ ] **Step 1: Scan changed copy and markup for forbidden dependencies and punctuation**

```powershell
rg -n "—|–|<iframe|static\.wixstatic\.com|TODO|TBD" components/BiovetyCaseStudy.tsx components/BiovetyCaseStudy.module.css data/portfolio.ts tests/tools/biovety-case-study.test.js
```

Expected: no matches.

- [ ] **Step 2: Run focused and adjacent tests**

```powershell
node --test tests/tools/biovety-case-study.test.js tests/tools/work-pages.test.js
```

Expected: all tests pass with the development server running.

- [ ] **Step 3: Run the production build**

```powershell
npm.cmd run build
```

Expected: build completes successfully with no TypeScript or Next.js errors.

- [ ] **Step 4: Inspect the finished page in the browser**

Open `/work/web-development/biovety-website/` and verify:

1. The two panels align at desktop width and stack at mobile width.
2. The legacy preview still renders after the browser network is disabled.
3. Light and dark themes retain readable contrast.
4. Both website links have visible keyboard focus.
5. No other project detail page shows the BioVety case study.

- [ ] **Step 5: Commit any verification fixes**

If a defect required a change, stage only the files changed for that defect and commit with a message describing the actual fix. If no defects were found, do not create an empty commit.

