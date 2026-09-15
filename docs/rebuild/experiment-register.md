# Experiment Register

Experiments are logged here with baseline, method, results, and adopt/revise/reject decisions.
No experiment is promoted to production without comparative evidence.

---

## Status legend

- PLANNED - question identified, not yet run
- RUNNING - currently in progress
- DONE-ADOPT - result adopted into production
- DONE-REJECT - result rejected, code isolated or removed
- DONE-REVISE - partial adoption with modifications

---

## EXP-001: Token loading failure on calculator and writing routes

Status: PLANNED (Phase 1 first task)
Question: Why are ASL palette tokens (`--bg-page`, `--gold-500`) not active on `/tools/[slug]` calculator routes and `/writing/[slug]` article routes in the responsive test?
Hypothesis: The design-token CSS files were added as untracked changes to `app/design-tokens/` and imported in `app/layout.tsx`, but the dev server or the test runner is using a stale build that predates those imports. Alternatively, the calculator route has a separate layout that does not inherit the root layout imports.
Baseline: 25 failures in `site-responsive.test.js` (pre-existing)
Method: Inspect calculator route layout.tsx and writing route layout.tsx. Check if they override or shadow the root layout. Restart dev server. Re-run responsive test.
Results: TBD
Decision: TBD

---

## EXP-002: Editorial hero composition

Status: PLANNED (Phase 2)
Question: Which composition best serves both nontechnical and technical visitors at desktop and mobile widths?
Hypothesis: A left-anchored editorial split with the Arabic display phrase at large size and the English counterpart below will communicate faster than the current centered stack.
Baseline: Current hero is left-aligned but does not show bilingual thought or Agent 101 portrait rail.
Variants: (1) Left rail: portrait + right copy with bilingual display phrase; (2) Full-width editorial strip with portrait below right; (3) Portrait as editorial plate interrupting after first paragraph of copy.
Method: Build all three as isolated components. Test at 320, 768, 1280, 1920px. Check Arabic shaping and line breaking.
Results: TBD
Decision: TBD

---

## EXP-003: Grid toggle implementation

Status: PLANNED (Phase 1)
Question: Where in the header should the GRID ON / GRID OFF control live at each breakpoint, and what persistence mechanism works with static export?
Hypothesis: A small control at the right edge of the header, stored in localStorage, toggling a class on `<html>`, works at all widths without a server.
Baseline: No grid toggle exists currently.
Variants: (1) Header right slot; (2) Floating fixed corner; (3) Footer-only (low discoverability, likely reject).
Method: Build variant 1. Test keyboard accessibility, tab order, reduced motion, localStorage persistence across reload, and visibility at 320px with open mobile menu.
Results: TBD
Decision: TBD

---

## EXP-004: Navigation structure (6-item vs 4-item)

Status: PLANNED (Phase 1)
Question: How do Work, Tools, Notes, Prompts, About, Contact fit in the header across breakpoints, given the Arabic signature also lives there?
Hypothesis: 6 items collapse cleanly to mobile menu at 768px without crowding the Arabic signature at desktop widths.
Baseline: Current nav has 4 items: Work, About, Writing, Tools (+ Contact as a styled CTA).
Variants: N/A - spec defines the 6 items. The experiment is about collapse point and label widths with long Arabic/English labels.
Method: Measure label widths at desktop. Check collapse at 768px. Verify Arabic labels do not overflow.
Results: TBD
Decision: TBD
