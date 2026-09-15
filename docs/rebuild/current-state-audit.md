# Current State Audit

Verified: 2026-08-29. Audited from live checkout before any rebuild changes.

---

## 1. Framework and Build Facts

| Item | Verified value |
|---|---|
| Framework | Next.js 16.3.1 |
| React | 19.2.7 |
| Router | App Router (all routes under `app/`) |
| Output mode | `output: "export"` (static HTML) |
| Hosting target | GitHub Pages |
| Production base path | `/myPortflio` (matches actual GitHub Pages repo slug - one "i") |
| Base path logic | `isGitHubPages = process.env.GITHUB_ACTIONS === "true"` |
| Trailing slash | enabled |
| Image optimization | disabled (`images: { unoptimized: true }`) |
| TypeScript | 6.0.3 |
| Package type | `"type": "module"` (ESM) |

---

## 2. Route Inventory

| Route | File | Status |
|---|---|---|
| `/` | `app/page.tsx` | Working, 8 sections |
| `/work` | `app/work/page.tsx` | Working |
| `/tools` | `app/tools/page.tsx` | Working, 41 instruments |
| `/tools/ai-script-generator` | `app/tools/ai-script-generator/` | Flagship |
| `/tools/battery-estimator` | `app/tools/battery-estimator/` | Flagship |
| `/tools/pid-simulator` | `app/tools/pid-simulator/` | Flagship |
| `/tools/security-command-builder` | `app/tools/security-command-builder/` | Flagship |
| `/tools/sensor-code-generator` | `app/tools/sensor-code-generator/` | Flagship |
| `/tools/[slug]` | `app/tools/[slug]/` | 36 calculators |
| `/writing` | `app/writing/page.tsx` | Working - to become `/notes` |
| `/writing/[slug]` | (via WritingIndex) | Working |
| `/about` | `app/about/page.tsx` | Working |
| `/contact` | `app/contact/` | Working |

Routes missing (spec requirements):
- `/notes` (alias/rename from `/writing`)
- `/prompts` (new)
- `/notes/library` (new)

---

## 3. Content Inventory

Writing/Notes (`content/writing/`): 3 published articles
1. `overthewire-bandit-workflow.md` - OTW security walkthrough
2. `reliable-sensor-to-flutter-pipeline.md` - IoT and Flutter tutorial
3. `welcome-to-field-notes.md` - Intro post

Validation: PASS (`Validated 3 articles.`)

Portfolio data (`data/portfolio.ts`):
- Projects: 12 total (4 featured with real images, 8 with SVG placeholders)
- Tutorials: 6 YouTube playlists
- Experience: 2 entries
- Education: 1 entry (Mansoura University, Feb 2025 to present)
- Publications: fetched via Scholar sync (`data/publications.json`)

---

## 4. Asset Inventory

Tool covers (`public/media/tools/`) - untracked, new:
- 5 flagship WebP covers (134-268 KB each) - within budget
- 5 raw PNG sources (3.9-5.3 MB) - must NOT enter production export

Social images: both replaced (48 KB to 212 KB each)

Project media: real WebP images for agribot, ROV, lock, megasumo, rocket-league, human-follower + tutorial covers; SVG placeholders for 6 projects

---

## 5. Design System State

Design tokens (`app/design-tokens/`) - untracked (new):
- `colors.css`: Complete ink ramp, gold accent, semantic aliases, dark/light/gold themes, accent variants
- `fonts.css`: Archivo, IBM Plex Sans Arabic, Aref Ruqaa, Space Mono, Noto Kufi Arabic
- `motion.css`, `spacing.css`, `surfaces.css`: Present

All tokens already imported in `app/layout.tsx`.

---

## 6. Baseline Test Results (2026-08-29, before changes)

### PASSING tests (from asl-design-contract, frontmatter, github-pages-export):
- ASL tokens loaded globally
- Global shell uses ASL identity
- Home follows ASL fault-line composition
- Primary routes declare page modes
- Tools use task groups
- Advanced workbenches expose instrument modes
- Sitemap includes all tools
- llms.txt advertises tools with correct base path
- parseFrontmatter reads safe YAML
- parseFrontmatter handles missing frontmatter block
- parseFrontmatter rejects non-object metadata
- stringifyFrontmatter round-trips
- GitHub Pages export preserves _next assets

### FAILING test (site-responsive.test.js) - PRE-EXISTING BASELINE FAILURE:
The responsive test reports ASL palette tokens not active on several calculator routes and writing article routes at multiple viewports:
- `/writing/welcome-to-field-notes/` at 390, 768, 1024, 1440px
- `/tools/ohms-law-calculator/` at 390, 768, 1024, 1440px (also: shared calculator finder missing at 1440)
- `/tools/resistor-color-code-calculator/` at all viewports
- `/tools/555-timer-astable-circuit-calculator/` at all viewports
- `/tools/decimal-binary-octal-hex-converter/` at all viewports
- 23 uncaught browser console errors reported

This is an existing failure before this rebuild work began. It is documented here as the baseline.

Content validation: PASS (3 articles, exit 0)

---

## 7. Dirty Worktree Boundary

Modified files (18 files changed, 822 insertions, 261 deletions):
- `app/asl-theme.css` (+97 lines net)
- `app/asl-tools.css` (+124 lines net)
- `app/game-theme.css` (+264 lines net)
- `app/icon.svg` (changed)
- `app/layout.tsx` (+6/-6 - added design-token imports)
- `app/series-theme.css` (modified)
- `components/PixelWorld.tsx` (+59 lines)
- `components/SiteHeader.tsx` (-6 lines)
- `components/SystemHud.tsx` (+49 lines)
- `components/tools/ToolNavCard.tsx` (+29 lines)
- `components/tools/model-mission/ModelMission.module.css` (+12 lines)
- `components/tools/security-mission/SecurityMission.module.css` (+334/-334)
- `public/opengraph-image.png` (replaced)
- `public/twitter-image.png` (replaced)
- `tests/tools/asl-design-contract.test.js` (+13 lines)
- `tests/tools/github-pages-export.test.js` (+3 lines)
- `tests/tools/site-responsive.test.js` (+2 lines)
- `tsconfig.tsbuildinfo` (generated)

Untracked new work:
- `PORTFOLIO_MASTER_EXECUTION_PROMPT.md`
- `app/design-tokens/` (5 CSS token files)
- `docs/design-options/` (option-01-editorial-instrument.md)
- `public/media/tools/` (10 files: 5 WebP + 5 raw PNG)

---

## 8. Broken or Missing Items

| Item | Status | Priority |
|---|---|---|
| `/notes` route | Missing - spec requires alias from `/writing` | Phase 4 |
| `/prompts` route | Missing | Phase 4 |
| `/notes/library` route | Missing | Phase 6 |
| Hero bilingual thought (`fakirruk al-mushkila`) | Missing from home | Phase 2 |
| Grid toggle (`GRID ON / GRID OFF`) | Not visible in SiteHeader | Phase 1 |
| Header lockup (`ASL | bshmhnds asl | AGENT / 101`) | Not present | Phase 1 |
| Bilingual footer | Only English currently | Phase 1 |
| YouTube channel URL mismatch | `@ahmedassal8710` vs spec `@ahmed-ibrahim-asl` | Phase 8 - needs owner confirmation |
| Responsive test: ASL tokens not active on calculator/writing routes | Pre-existing baseline failure | Phase 1 fix |
| 23 uncaught console errors on calculator routes | Pre-existing baseline failure | Phase 1/3 fix |
| Static search index | Does not exist | Phase 4 |
| PDF viewer | Does not exist | Phase 6 |
| `CONTENT_INTERVIEW_MASTER_PROMPT.md` | Missing | Phase 8 |
| Tool cover manifest | `docs/assets/tool-cover-manifest.json` missing | Phase 7 |
| Content templates directory | Exists but not inventoried | Phase 5 |
