# Live calculator diagrams

Approved direction: input-driven geometry for roots, percentage comparison and waves; clear non-inverting feedback routing. Execute inline in the existing checkout, preserving unrelated changes.

Architecture: pure SVG components consume validated calculator values. Keep responsive DiagramFrame and compact panel. Geometry uses bounded, explicitly labelled illustrative scaling for roots; wave axes display the actual window. No timers or continuous animation required.

- [ ] Add regression tests in tests/tools/diagram-electrical-accuracy.test.js: root geometry changes, wave paths change, percentage bars reflect values, invalid values remain finite.
- [ ] Update SquareAreaDiagram and CubeVolumeDiagram: bounded logarithmic display size, external labels, zero collapse and explicit negative-cube magnitude description.
- [ ] Add a shared LiveWaveDiagram consumed by WavelengthDiagram and CycleTimelineDiagram. Supply wavelength and period from calculators; show actual axis window and one-cycle marker.
- [ ] Add PercentageChangeDiagram with signed bars and pass old/new values from PercentageChangeCalculator using compact visual slot.
- [ ] Route non-inverting Rg above the negative input, to its own ground, away from Vin. Keep feedback connected to the external summing node.
- [ ] Run diagram regression tests and HTTP route checks. Check responsive SVG viewport bounds. Do not commit or deploy externally.

Future calculator rule: diagrams should respond to meaningful numeric inputs, not merely change labels. Use truthful labelled scales, finite invalid states and no forced decorative animation.

Implementation completed: root geometry, shared numeric wave diagrams, signed percentage bars and separated non-inverting ground route. Verification: eight regression tests pass; calculator routes respond on localhost. Browser visual inspection at mobile widths remains unperformed.
