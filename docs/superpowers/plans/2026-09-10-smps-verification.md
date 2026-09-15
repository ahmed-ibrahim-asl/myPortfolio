# SMPS Design — local implementation

User-approved scope: AC-mains and DC-input isolated flyback educational design tool. Existing buck stays separate.

Implemented fixed-frequency ideal DCM sizing with entered secondary diode drop, primary bus minimum/maximum, explicit AC reservoir sag, peak/RMS currents, magnetizing inductance, winding ratio, ideal blocking voltages and charge-balance output capacitance. Energy, volt-second and output-charge identities tested. Does not provide transformer construction, certified isolation, control-loop design or ready-to-build mains instructions.

Interactive three-phase schematic has opposite winding polarity dots and separate return domains, keyboard-selectable component explanations, responsive scroll regions and dark/light cover artwork. AC frontend is explicitly a functional bridge/bulk block, not a detailed mains wiring diagram. Added power category listing and Circuit Design cross-link.

Verification: production build 118 pages; 4 numerical tests plus 1 browser suite passed, no captured console errors; 7 category/theme tests passed. Browser exercised modes, all phases, invalid blank input, 1440/390 widths and dark/light appearance. Screenshots in test-results/smps. Root inspected AC light screenshot. Export image check: 458 references, zero broken.

Source: Texas Instruments, Designing a DCM flyback converter, https://www.ti.com/document-viewer/lit/html/ssztcw6 . Output capacitor expression integrates the ideal triangular secondary-current deficit, excluding ESR and transients.

No publishing or git commit performed.
