# Rebuild Progress Ledger

Last updated: 2026-08-29 by agent session.

---

## Phase 0: Baseline, safeguards, and truth inventory

Status: IN PROGRESS

### Completed steps

- [x] Read `AGENTS.md` - confirms Next.js 16.3.1 with breaking changes; read local docs first
- [x] Read relevant Next.js local docs structure (`node_modules/next/dist/docs/`)
- [x] Ran `git status --short` - 18 modified files, 4 untracked paths documented
- [x] Ran `git diff --stat HEAD` - 822 insertions, 261 deletions across 18 files
- [x] Read `package.json`, `next.config.mjs`, `app/layout.tsx`, `app/page.tsx`
- [x] Read all design token files (`app/design-tokens/`)
- [x] Read `docs/design-options/option-01-editorial-instrument.md`
- [x] Read `data/portfolio.ts`, `lib/content.ts`, `lib/site.ts`
- [x] Read `components/SiteHeader.tsx`, `components/SiteFooter.tsx`
- [x] Read `app/about/page.tsx`, `app/work/page.tsx`, `app/tools/page.tsx`, `app/writing/page.tsx`
- [x] Read `scripts/validate-content.mjs`
- [x] Inventoried `tests/tools/` (76 test files)
- [x] Inventoried `public/media/tools/` (5 flagship covers, raw + WebP)
- [x] Ran `node scripts/validate-content.mjs` - PASS (3 articles validated)
- [x] Ran baseline subset of tests (asl-design-contract, frontmatter, github-pages-export) - 13 PASS
- [x] Ran `site-responsive.test.js` - FAILING (pre-existing baseline failure documented)
- [x] Created `docs/rebuild/current-state-audit.md` with verified findings
- [x] Created `docs/rebuild/progress.md` (this file)
- [x] Created directory structure: `docs/rebuild/experiments/`, `plans/`, `verification/`

### Still needed for Phase 0 gate

- [ ] Create `docs/rebuild/content-gaps.md`
- [ ] Run full `npm test` and record complete pass/fail count
- [ ] Start dev server and take reference screenshots (desktop + mobile)
- [ ] Record console errors and failed requests on live dev server

### Baseline test summary (2026-08-29)

| Test file | Result |
|---|---|
| `asl-design-contract.test.js` | 8/8 PASS |
| `frontmatter.test.js` | 4/4 PASS |
| `github-pages-export.test.js` | 1/1 PASS |
| `site-responsive.test.js` | FAIL (25 failures: ASL tokens inactive on calculator routes + 23 console errors) |
| `validate:content` | PASS (3 articles) |

### Key baseline findings

1. The `site-responsive.test.js` failure is a PRE-EXISTING condition before this rebuild began.
   - ASL palette tokens (`--bg-page`, `--gold-500`) are not active on calculator sub-routes and writing article routes.
   - 23 uncaught console errors on those routes.
   - Root cause: the design token CSS from `app/design-tokens/colors.css` is not being loaded in the HTML for those routes - likely because the calculator routes use a different layout or the token files were added as untracked changes but the dev server was not restarted.
   - This is a Phase 1 fix priority.

2. The dirty worktree contains substantial design work (design tokens, theme CSS, tool covers, test updates, component changes) that is valuable and must be preserved.

3. The design-token system is complete and matches the Option 01 spec exactly.

---

## Phase 0A: Research and experiment sprint

Status: NOT STARTED

---

## Phase 1: Design tokens and resilient global shell

Status: NOT STARTED

Key tasks: grid toggle, header lockup, nav update, mobile menu, bilingual footer, fix token loading on calculator/writing routes.

---

## Phase 2: Home page and content hierarchy

Status: NOT STARTED

Key tasks: bilingual editorial hero, Agent 101 portrait rail, evidence register, curated selected work.

---

## Phases 3-10

Status: NOT STARTED

See `docs/rebuild/plans/` for phase plans as they are created.

---

## Open Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Token loading failure on calculator routes | High - test failure + broken identity | Investigate in Phase 1 first step |
| YouTube channel URL mismatch (`@ahmedassal8710` vs `@ahmed-ibrahim-asl`) | Medium - wrong link in footer | Needs owner confirmation before Phase 8 |
| PDF publication rights unclear | Medium - C programming PDF in repo | Do not publish until confirmed |
| Full `npm test` may surface more failures | Unknown | Run full suite before Phase 1 |
