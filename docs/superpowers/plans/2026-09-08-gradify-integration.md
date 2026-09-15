# Gradify integration implementation plan

**Goal:** Copy the active Gradify application into the portfolio, preserve its tested Delta behavior, and add university GPA profiles from gpacal.net within the portfolio design system.

**Architecture:** A static-export-compatible `/tools/gradify/` route contains a lightweight university calculator and a lazily loaded Delta planning workspace. Actual Delta source, data, and tests live in this repository. The former transcript API runs locally in the browser. University profiles have explicit provenance and do not inherit Delta-specific policy.

**Constraints:** Preserve the original project and unrelated working-tree edits. No iframe or Vercel shortcut. Preserve Delta grading and curriculum logic. Scope all imported presentation rules. Do not claim other universities are verified. Do not publish or upload student documents. Use existing ASL typography, colors, surfaces, and control sizes.

- [x] Inspect both applications and identify static hosting requirements.
- [ ] Copy active Delta data, services, contexts, components, and regression tests; port PDF extraction and transcript analysis.
- [ ] Add source-backed university catalog, weighted GPA, previous record and target calculations, and invalid-input tests.
- [ ] Build compact ASL workspace, university selection, grading guide, editable custom scale, and results export.
- [ ] Rebuild imported UI styles with scoped ASL tokens and retain detailed planning/report features.
- [ ] Add tool route and catalog entry; remove hard-coded tool counts.
- [ ] Verify Delta regression suite, new math tests, TypeScript, production static export, and desktop/mobile workflows.

The user requested integration directly into the portfolio. Changes are limited to that feature in the existing checkout, preserving all pre-existing local work. University rule research is documented separately with source URLs and retrieval date.
