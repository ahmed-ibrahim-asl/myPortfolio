# Gradify in the ASL portfolio

Open `/tools/gradify/` from the Tools catalog. This is an integrated copy of the active React app in `D:\college\projects\GradifyReport\gradify_react`. The original directory remains intact. No symlink, iframe, or remote Vercel runtime is required.

## Included workflows

- Semester GPA and cumulative GPA, per-university grade scales, sourced percentage conversion, coursework marks, and target GPA feasibility.
- Multiple semester carry-forward, explicit local Save/Restore, custom grade points, CSV export, and printable GPA results.
- The Delta engineering application: transcript PDF import, academic programs, curriculum and prerequisites, repeat/improvement handling, grade caps, term limits, graduation targets, manual and automatic semester plans, and PDF registration reports.

Only the Delta engineering workflow carries the existing student-tested status. The other university/faculty entries are reference profiles with visible scope and sources. A university name is not a promise that every faculty or bylaw is supported. The quick calculator models new graded courses; use Delta planning for the additional repeat and transcript policies.

See [university source notes](gradify-university-sources.md) and `lib/tools/gradify/reference-profiles.json` for evidence, faculty scopes, and gaps. Unsupported percentage ladders are deliberately unavailable. Missing or unknown universities require a custom scale rather than silently using Delta rules.

## Source locations

- `components/tools/gradify/delta/`: the copied Delta components, contexts, curriculum and academic services, plus local transcript analysis.
- `components/tools/gradify/`: the new portfolio workspace, quick calculator, source/grade guide, and styles.
- `lib/tools/gradify/`: university profiles and independently tested calculator/target/coursework math.
- `tests/gradify-delta/`: original Delta regression suites and portability/projection checks.
- `tests/gradify/`: multi-university arithmetic and interface regression checks.

The active source has more recent functionality than its old AGENTS/README feature list. The integration preserves active code; archived Python applications and obsolete Vite entrypoints are not part of the portfolio runtime.

## Running and verification

```sh
npm install
npm run dev
npm run test:gradify
npx tsc --noEmit --incremental false
npm run build
```

`prepare:gradify` runs before development and production builds. It regenerates isolated Delta utility styles using portfolio tokens and copies the matching installed PDF.js worker into `public/vendor/gradify/`. Keep the generated CSS and worker with the static export. The public worker URL respects the GitHub Pages base path.

PDF extraction and analysis run in the browser; transcript contents are not sent to an API. Student transcript state is kept in memory. Quick-calculator drafts are stored only when Save draft is pressed and restored only on request. Browser storage may be unavailable or cleared; exported reports are independent files.

`node scripts/gradify-test-transcript.mjs` generates a synthetic, non-personal PDF in `test-results/gradify/` for browser verification. It is not a public download or real academic record.

## Changes during portability

The former Express transcript endpoint has been replaced by a local module using the already tested frontend best-attempt logic. Browser-only PDF loading uses the portfolio's installed PDF.js version. Detailed Delta grading and curriculum data remain copied source. Automatic semester projections now call the shared GPA rules instead of assuming every course earns three new credits. See the Delta provenance notes for the precise scope and regression coverage.

No deployment or publication is performed by this local integration.

## Planning review and accuracy fixes (2026-09-11)

Both automatic planners now require a course-and-rule review before generating. Each course has an editable usual offering, a checkbox for the selected term's actual availability, and an exclusion from all plans. A one-term exception does not change later offerings; an all-plan exclusion takes precedence over an offering exception. Unknown offerings must be confirmed. Summer offerings remain assumptions for users to verify. Settings are shared in memory and reset when importing/resetting a transcript or changing program.

The review exposes prerequisite checks, seasonal offerings, elective quotas, unlock prioritization, the graduation allowance, and custom regular/summer credit limits. Defaults preserve the existing academic policies. Testers can describe an inaccurate rule and download its settings as JSON to share with a maintainer; the tool does not send feedback or include student details in that file.

Current-course selection uses readable checkboxes with names and prerequisite explanations. It no longer hides blocked courses. The full generator checks remaining curriculum requirements even when reported passed hours already meet the degree total, observes course availability, and applies the same generator to individual semesters. Empty results and incompatible current-course selections produce explicit feedback. Remaining courses and unmet CGPA targets are shown after generation; a 25-term search limit is not presented as a completed degree.

Goal achievement uses the unrounded current points/GPA-hours ratio when exact points are available. A CGPA of 1.96 never meets a target of 2. The simple remaining-hours estimate is labeled as an estimate for new credits; repeat/replacement planning uses course-specific projections. Existing transcript arithmetic and repeat-grade caps are retained.

Gradify now has scoped light/dark surfaces, distinct status colors, readable native controls and course labels, and a responsive review list. No changes to the old Vercel application were made.

Verification: 168 Gradify tests, four browser checks, TypeScript, and the 118-page production build passed. Browser coverage includes synthetic transcript import, current-course names, middle-of-semester full generation, semester generation, exclusions, exact target checks, and desktop/mobile layouts in both themes. Screenshots are in `test-results/gradify/review-{light,dark}-{1440,390}.png`. The supplied screenshots were used as visual references; the user's original transcript was not available for an exact record-level reproduction. Changes are local and have not been deployed.


## Release 2026-09-13

Published the accumulated Gradify updates and current static export in release commit `baa3c9b4a0903e264bc55c708d40638a4d8d3c2c` to the existing GitHub Pages main branch. Source workspace remains intact. Final refinements use neutral charcoal dark surfaces, squared compact status notifications, consistent review spacing, and aligned timeline/export actions even after the repeat-download link appears. Light-theme colors are preserved.

Release checks: 168 Gradify tests; TypeScript; production export with `/myPortfolio` asset prefix and 112 segment aliases; four browser checks against the production export; actual PDF generation followed by exact button-top alignment at 1440px and 390px with no horizontal overflow.
