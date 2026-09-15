# Power rebuild report

Implemented in the five assigned power files. No package changes, builds, commits or shared-file edits.

## Electrical model and interaction

- Buck uses a connected ideal asynchronous stage: DC source and common return, switch, catch diode with grounded anode and switching-node cathode, inductor, capacitor and load. ON/OFF controls change switch position and highlighted closed current paths. Inductor current range, L, C, source and load values update with inputs.
- Bridge uses four individual diode symbols with cathode bars: A to D1 to positive, B to D2 to positive, negative to D3 to A, negative to D4 to B. AC source is isolated from DC return. Positive and negative charging-pulse controls select conducting pairs; between-pulse mode shows reservoir discharge. The upper/lower DC rails route around AC terminals without crossing or shorting them.
- Linear regulator input/output pins connect to source/load; COM connects to the same return as both capacitors. Live capacitance, ESR, voltage and heat labels. Generic stability claims removed. Headroom is explicitly not a verified dropout margin.
- KaTeX equations use shared MathEquation. Native phase buttons expose aria-pressed; current-path descriptions update in an aria-live region. Wide schematics scroll within their panel on narrow viewports.

## Sources and interpretation

- Texas Instruments, Basic Calculation of a Buck Converter’s Power Stage, SLVA477B: https://www.ti.com/lit/an/slva477b/slva477b.pdf . Verified source equations for ripple, inductance, peak current and ripple capacitance. This tool deliberately uses ideal D=Vout/Vin rather than the report’s efficiency-adjusted practical estimate. Efficiency only estimates total loss, and this distinction is stated in the UI.
- Texas Instruments, ESR, Stability, and the LDO Regulator, SLVA115A: https://www.ti.com/lit/an/slva115a/slva115a.pdf . Supports device-specific capacitance and ESR requirements rather than a generic stability pass/fail.

## Verification

Written numerical regression tests before implementation; original implementation failed all six tests for the expected missing outputs or input-validation defects. Tests cover hand-derived bridge/buck reference values, diode ideal limit, linear heat/headroom, no generic stability verdict, efficiency limits, ripple valley, CCM boundary, nonfinite inputs and overflow.

Final `node --test tests/tools/power-conversion.test.js`: 6 tests, 6 passed, 0 failed (after formatting).

`npx tsc --noEmit --incremental false`: only reported DesignToolPage.tsx missing ControlDesignAssistant during the other agent’s in-progress rewrite; no power-file diagnostics. Root owns final integration, browser testing and production build.

## Limits

### Hydration follow-up

Root browser testing reproduced React hydration error 418 on buck and bridge and the development stack identified the Diode SVG title. Its adjacent expression/text children are now one template-string child. Added a real component SSR-to-JSDOM accessible-title regression check. Final targeted test run: 7 passed, 0 failed. Root owns confirming the correction in the browser; no build was run by this agent.

No datasheet-specific regulator profile is supplied; stability is explicitly not evaluated. Buck omits controller feedback/input decoupling/parasitics and labels capacitance as an ideal ripple-only minimum. Bridge assumes constant current and small ripple; charging surge, source impedance and transformer modeling remain out of scope. Browser visual review remains for root.
