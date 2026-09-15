# Rebuilt design tools — verification

Implemented locally; no commit or publication.

- Replaced control checkboxes/static recommendation with mutually exclusive behavioral intent, live D/JK/T/SR memory, counter, shift and parallel register simulations. Gate/state drawings sit beside tables; all table cells use position-based unique keys.
- Logic conditions generate an OR-of-AND network with OFF-condition inversion, live signals and selectable truth-table cases (2–4 inputs, 1–4 rules).
- Power stages now have connected schematics, correct diode orientation and operating phases. Replaced unsupported stability judgments with explicit model limits.
- Fixed cascaded signed/zero input behavior, added selected-stage feedback schematics and selectable reference pin tables; corrected LM741 offset-null pin.
- Added shared KaTeX display renderer with bundled fonts/MathML to recent engineering tools.
- Added twenty deterministic SVG cover assets (ten dark/light pairs), image-led category cards, enlarged finder previews and breadcrumb spacing. Existing raster artwork remains unchanged.
- Corrected SVG diode-title hydration mismatch and Windows static-export segment filename mismatch. Normal npm build now prepares segment aliases.

## Evidence

- Production build: 117 static pages, exit 0.
- Targeted domain/theme/export/SSR tests: 25 passed, 0 failed.
- Browser suites `design-rebuild-browser.test.js` and `design-tools-browser.test.js`: 2 passed, no captured page/console errors in rebuild suite.
- Rebuild suite: all memory modes, SR forbidden state, logic input/rule changes, buck OFF, three bridge phases, 1440/390 viewport widths, dark/light themes, no document overflow or broken images.
- Export image audit: 456 references checked, none broken.
- Screenshots: `test-results/design-rebuild/` and `test-results/design-tools/`. Root visually inspected power equations/schematic, category covers, logic network and mobile memory layout.
- Independent source review found TeX escaping, OR input connection and missing counter carry drawing issues; all corrected before final verification. Power connection review passed.

## Explicit limits

This is an educational functional design suite, not SPICE or a board-ready synthesis tool. It does not synthesize BJT/MOSFET implementations, rate output drivers, certify regulator stability, simulate metastability, or verify hardware measurements. Large circuit drawings scroll horizontally on mobile. The new covers are vector technical illustrations, not generated photographic assets. The entire unrelated site test suite was not claimed passing.
