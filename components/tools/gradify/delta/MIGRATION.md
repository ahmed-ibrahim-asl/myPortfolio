# Gradify Delta integration

Source: `D:/college/projects/GradifyReport/gradify_react/src`, inspected 2026-09-08. The source project was not edited. Its existing untracked `test_withdrawn.ts` was left untouched.

The current React implementation is canonical; the Flutter and vanilla web folders are older implementations. The source `AGENTS.md` is useful orientation but stale: current code has 249 courses, four engineering programs, 2013/2021 curricula, a multi-term planner, local PDF text extraction without OCR, and PDF export (not PNG). There is no persistence or JSON/CSV import/export.

## Preserved rules

- Shared grade scale includes D-, PASS, and FAIL. GPA rounding uses the existing three-decimal function. Imported exact total points take precedence over rounded CGPA.
- Failed retakes and improvements replace prior GPA hours/points. The existing tested calculator intentionally adds no earned hours for repeat registrations, including failed retakes; the integrated projections retain this policy.
- Same-course retakes cap at B+ for the second attempt and C for third/later attempts. Elective replacements use their separate source rule.
- Withdrawals, unresolved failures, transfers, completed courses, compulsory D-range improvements, and elective replacement candidates remain distinct.
- Regular registration caps remain 12/15/18/21 hours by CGPA; summer is 9. Eligible graduation terms require CGPA strictly above 1.8 and permit 21 regular or 12 summer hours. The exact final prerequisite-pair exception is preserved.
- Program courses, elective quotas, prerequisite relationships, 160-hour/173-hour bylaw detection, and printable report pagination remain source-derived.

## Portability changes

- `DeltaWorkspace.tsx` replaces the Vite app entry and composes the source providers, header, calculator, and planner. Opened tabs remain mounted so plans survive tab switches.
- `components/Header.tsx` has a compact portfolio header and calls local `services/transcriptAnalysis.ts` instead of the Express endpoint. Transcript contents never leave the browser.
- `services/pdfParser.ts` changes only PDF extraction: dynamic PDF.js import, matching local worker, filtering marked-content items, and PDF resource cleanup. Parsing and curriculum helpers are preserved.
- The worker lives at `/vendor/gradify/pdf.worker.min.mjs`, copied from the installed package by `prepare:gradify`; it respects `NEXT_PUBLIC_BASE_PATH`.
- `services/transcriptAnalysis.ts` uses the tested frontend best-attempt function. The original endpoint sorted on a missing `points` property and had an incomplete passing-grade list; there is now one shared implementation.
- `context/GpaContext.tsx` gives the initial blank rows a visible `Semester 1` label and attempt number 1.

## Projection corrections

The original automatic planner assumed three credits for unknown course rows, counted failed/PASS/repeat grades incorrectly, rebuilt exact points from rounded CGPA, and exported all courses as new three-credit courses. `services/planProjection.ts` now supplies canonical course metadata and applies the existing tested `calculateGPA` to each term. It validates prerequisites using passes from earlier terms, validates term credit limits, excludes completed/transferred registrations, and preserves the exact final prerequisite-pair exception.

`services/fullPlanGenerator.ts` uses those projections, caps suggested retake grades, observes credit/elective quotas, and carries exact points and actual attempt history. Automatic scheduling conservatively takes prerequisites in earlier terms; manual plans can use the eligible final-pair exception. It remains a suggested schedule, not a guarantee that a selected graduation GPA is attainable.

`components/MultiTermPlanner.tsx` uses shared projections for its active term, validation, and export. `components/PlanBuilder.tsx` derives course statuses from the projected history, excludes PASS from SGPA, and offers capped repeat grades. `components/ExportButton.tsx` accepts the active term's academic record so individual and complete-plan exports use the correct baseline. PDF reports retain their white paper layout independently of the portfolio theme.

## Verification

The source baseline passed 8 suites / 101 tests and its TypeScript check. The original eight suites were copied to `tests/gradify-delta`; imports point to the integrated source. Duplicate frontend/API assertions were consolidated because the API copy no longer exists. Additional tests cover browser PDF extraction and cleanup, local analysis, exact points, varying credits, F/PASS/repeats/transfers, prerequisite sequencing, the final-pair exception, registration limits, and capped generated retakes.

Run `npx vitest run --config vitest.gradify.config.ts tests/gradify-delta` and `npx tsc --noEmit` from the portfolio root. Original deployment reference: https://gradify-report.vercel.app (found in source deployment notes; not independently reverified during the local audit).
