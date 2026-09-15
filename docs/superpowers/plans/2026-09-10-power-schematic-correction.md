# Power schematic correction

Scope: replace the abstract flyback input and switch with component-level educational circuitry, fix capacitor-label collisions in the shared power schematic, and replace four power covers in both themes with connected circuit thumbnails. No numerical model changes or claim of build-ready mains design.

Evidence: Cin and Cout SVG labels begin at the same x as their vertical capacitor leads; SMPS currently contains an AC-to-DC rectangle and open-switch symbol. Existing covers show fragments rather than the topology.

Plan: browser regression first (label path intersection, MOSFET inspection and AC/DC bridge count); dedicated FlybackSchematic component with separate primary/secondary returns and stable labels outside wires; full-width drawing with targets above; eight SVG covers; rerun domain/browser tests and inspect light/dark desktop/mobile screenshots.

Reference: TI, Designing a DCM flyback converter, https://www.ti.com/document-viewer/lit/html/SSZTCW6 . Includes input capacitor, MOSFET, opposite winding dots, output diode and capacitor. Practical protection, snubbing, feedback compensation and controller supply remain outside the sizing model and are disclosed.

Implemented: dedicated FlybackSchematic.tsx with expanded AC bridge and DC bypass, Cbulk/Cin, N-MOSFET with body diode, coupled winding polarity, D5, Cout and load. Full-width sheet and separate values. Component selection no longer colors inactive winding wires as if conducting. Shared regulator capacitor labels offset from their leads. Eight v3 power covers are connected vector circuit overviews.

Verified: initial overlap regression failed for Cin/Cout before changes; all SMPS labels checked against path geometry after changes. Existing SMPS interaction suite, power/domain tests and TypeScript no-emit check pass. Desktop/mobile dark/light screenshots saved under test-results/power-schematic-layout and test-results/smps. No deployment performed.
