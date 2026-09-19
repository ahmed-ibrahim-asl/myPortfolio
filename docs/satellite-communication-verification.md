# Satellite & RF Calculators verification

Status: implemented and locally verified on 18 September 2026.

The former Satellite Communication course surface is now a standalone **Satellite & RF Calculators** category. It is not listed in Workbenches.

## Public surface

The category publishes exactly ten calculators:

1. Frequency and wavelength
2. Orbit and Kepler geometry
3. Look angles and slant range
4. Spacecraft power and lifetime
5. Antenna gain and aperture
6. RF path and received power
7. Receiver noise and G/T
8. Satellite link budget
9. Doppler and propagation delay
10. Multiple-access capacity

The old `/tools/satellite-communication/` path redirects to the category. Fundamentals, subsystem, transponder, laboratory, practice, and formula-sheet routes are absent from static generation and the sitemap.

## Product behavior

- Results require an explicit **Calculate** action.
- Engineering diagrams can still update while inputs change.
- Every calculator keeps units, assumptions, warnings, source-backed explanations, derivations, calculation history, share links, printing, and compatible result transfers.
- The Study/Exam selector, progress state, practice sessions, exam modes, and study actions are absent from the public UI.
- The category uses a responsive engineering-flow map and no decorative communication-system image.

## Verification evidence

- Complete repository suite: 610 passing, 0 failing, 1 pre-existing intentional skip.
- Satellite suite: 122 passing, 0 failing.
- Satellite route export: exactly ten generated calculator directories.
- Sitemap: exactly ten Satellite calculator URLs; no removed module URLs and no old course URL.
- Legacy entry: static redirect to `/tools/category/satellite-communication/`.
- Responsive browser matrix: category, orbit, and link budget checked at 320, 390, 768, 1024, 1440, and 1920 px in dark and light themes with equal gutters and no page overflow.
- Production build: 129 static pages and 123 static aliases.
- SEO suite: 19 tests passing.
- TypeScript: `npx tsc --noEmit` passing.

No deployment was requested or performed. Source PDFs remain outside public assets.
