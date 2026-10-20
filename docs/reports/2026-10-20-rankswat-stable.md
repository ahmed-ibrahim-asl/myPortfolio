# RankSWAT remediation: stable release

Source baseline: `7f158af83fe5447205e109ee809880d117fbf325` (`origin/source`). Deployment baseline: `768bb4a92a288c196c96245b588c1df74194c282` (`origin/main`, generated static output).

The user authorized the audit update for production, followed by a separate experimental design called «اللوش». This release preserves the existing design and tools. The main local checkout's unrelated changes were not used or modified.

## Changes and findings

| Item | Result |
|---|---|
| Mobile overflow | Long homepage links now wrap, mobile headline and actions allow enlarged text, and tool rows shrink their content column. |
| Title, description and canonical | Already present and unique. Raw HTML, rendered DOM and client navigation agree. Kept existing metadata. |
| Structured data | Added English and Arabic homepage WebPage entities linked to the existing Person and WebSite IDs. |
| Content clarity | Replaced design-process language under the projects with a factual explanation of what visitors can inspect; clarified the tools description in both languages. |
| Fonts | Kept all families but stopped preloading every optional family/weight globally. Archivo remains preloaded. |
| Images | Existing responsive AVIF/WebP and lazy-loading retained. Build generated missing responsive derivatives for the already-published Aqua Sync poster. |
| HTTPS | Live HTTP-to-HTTPS redirect verified. |
| Response security headers | Hosting-dependent: GitHub Pages does not apply arbitrary headers from a Next static export. No unsupported static header configuration or DNS change was made. See the hosting report. |

## Measurements

Three mobile Lighthouse runs before and after on the same local static export server, Chrome, default Lighthouse simulated mobile settings:

| Measure | Before | After |
|---|---:|---:|
| Median LCP | 6.836 s | 5.856 s |
| Median performance score | 72 | 72 |
| Font requests | 12 | 4 |
| Font transfer bytes | 362,322 | 129,636 |
| CLS | 0 | 0.00027 or less |

LCP improved approximately 14% in this local lab comparison; the overall score did not materially change. The local server is uncompressed, so these are comparative measurements, not a prediction of production Core Web Vitals. One pre-release live run scored 88 with LCP 3.9 s. Do not compare that single live result directly to the local measurements or claim field CWV passed.

## Verification

- Production build passed, including TypeScript and static export (167 pages, 161 segment aliases).
- Content validation passed: 3 articles, 2 prompts and 1 library item.
- SEO suite: 9 files, 30 tests passed.
- New homepage browser suite: 2 tests passed on both development and production export. Geometry covers 320/360/390/430/1366 widths, both themes and 100%/200% text. Metadata covers raw HTML, hydration and return navigation.
- Separate screenshots/geometry audit of English and Arabic at 320/360/390/430/768/1366 in both themes: no recorded outside elements, clipped headings or runtime errors. Enlarged text and menu Escape checks passed.
- Full legacy suite was run: 714 tests, 693 passed, 19 failed, 2 skipped in the initial run. This is **not** an all-green suite.
- Nine old browser test files hardcoded port 3000. They now respect TEST_BASE_URL while retaining the old default. The affected rerun passed 21/21.
- Model Mission needs its development fault-injection path; its rerun on the existing dev server passed. Security Mission passed with its explicit test URL.
- Inherited source-contract tests still expect navigation/ToolsCategoryHub markup replaced before this release. Their target production files and failing assertions are unchanged from the baseline. The legacy theme test likewise expects eight category links absent in the existing ToolsBrowser. These unrelated assertions were not weakened.
- The broad responsive CDP harness initially stopped with “Inspected target navigated or closed”; it was rerun separately. See the final release evidence for its result.
- Independent code review found no actionable regression. Coverage is not a comprehensive accessibility certification.

Reproduction: `npm run test:seo`; serve `out/`, then set `SITE_TEST_URL` and run `npm run test:audit:browser`. Other browser tests use `TEST_BASE_URL`, `SITE_RESPONSIVE_BASE_URL`, `SECURITY_MISSION_TEST_URL`, and `AI_GENERATOR_TEST_URL` as appropriate.

Local evidence: `D:/work/portflioWebsite/outputs/rankswat-evidence/`. This includes before/after JSON, Lighthouse reports, screenshots, full logs and reruns. Deployment and the independent «اللوش» preview are recorded in the final handoff.
