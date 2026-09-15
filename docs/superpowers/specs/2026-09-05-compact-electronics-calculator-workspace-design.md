# Compact Electronics Calculator Workspace

Date: 2026-09-05

Status: Approved for implementation

## Goal

Make the electronics calculators compact, responsive, and immediately usable. On wide screens, controls and results sit beside the circuit or signal diagram instead of below an oversized full-width visual. On narrow screens, the same content becomes one deliberate vertical flow without horizontal scrolling or excessive blank space.

The reference behavior — controls on the left and the circuit on the right — is a layout model, not a request to copy its light theme.

## Scope

Apply the compact workspace to the 16 calculators in these catalog categories:

- Fundamentals
- Resistors
- Timing & Filters

The scoped routes are:

1. Ohm's Law
2. 4-Band Resistor Color Code
3. 5-Band Resistor Color Code
4. Series Resistors
5. Parallel Resistors
6. Voltage Divider
7. RC Time Constant
8. 555 Astable
9. 555 Monostable
10. Capacitive Reactance
11. LED Series Resistor
12. Battery Life
13. RMS Voltage
14. High-Pass Filter
15. Low-Pass Filter
16. Op-Amp Gain

Math, physics, number-system, encoding, and unit-conversion calculators keep their existing workspace arrangement.

## Selected Approach

Use an explicit `compact` opt-in and an optional `visual` slot on `CalculatorPanel`.

```jsx
<CalculatorPanel compact visual={<SeriesRCDiagram ... />}>
  <CalculatorField ... />
  <CalculatorResults>...</CalculatorResults>
</CalculatorPanel>
```

`compact` isolates the new layout to the 16 scoped electronics calculators. `CalculatorPanel` owns the responsive relationship between the visual and the controls. Individual calculators own only their diagram and their input/result content. This avoids brittle CSS that guesses meaning from child order and avoids duplicated page-specific layout wrappers.

Calculators without a useful in-tool visual, currently Ohm's Law, Capacitive Reactance, and Battery Life, use `<CalculatorPanel compact>` without `visual`. Their controls and results remain compact and width-constrained; the layout does not create a fake empty visual column.

## Layout Behavior

### Wide workspace: 860px and above

- The panel is centered and capped at 1180px.
- A visual calculator uses a two-column grid: controls/results at roughly 44% and the visual at roughly 56%.
- Controls appear in a single readable vertical stack, matching the supplied reference.
- Results stay directly beneath the relevant inputs in the controls column.
- The visual aligns with the first control and does not span a separate full-width row.
- Diagram SVGs have a controlled maximum size; unused space belongs around the whole composition, not inside an oversized diagram row.

### Compact workspace: below 860px

- The workspace becomes one column.
- The visual appears first in DOM and visual order so a circuit or resistor state is understood before editing it.
- SVGs scale with their intrinsic aspect ratio. Do not cap the visual container: captions and expanded notes must contribute to its height. Dense 555 schematics are not subject to the decorative-image height cap.
- Inputs and selects are full width with a minimum 44px interaction height.
- Results become two columns when the container permits and one column on narrow phones.
- Panel padding and gaps decrease with `clamp()` rather than abrupt tiny spacing.

### Very narrow screens: 320–430px

- No horizontal page scroll is permitted.
- Text and values wrap instead of forcing the workspace wider.
- Swatches wrap onto additional rows while retaining 44px touch targets.
- Add/remove controls remain reachable and do not overlap input units.
- Long result values use safe wrapping.

## Component Changes

### `CalculatorPanel`

- Add an optional `visual` prop.
- Add an optional `compact` prop so unscoped calculator categories retain their current layout.
- Render a stable `calculator-workspace-layout` wrapper.
- Render the visual in `calculator-workspace-visual` when present.
- Render calculator children inside `calculator-workspace-controls`.
- Add modifier classes for compact mode and for the presence of a visual.
- Preserve the current title, live result behavior, and all calculator state.

### Calculator routes

- Move existing diagram components from anonymous children into the `visual` prop.
- Do not change formulas, defaults, calculations, explanatory copy, or result semantics.
- Do not manufacture decorative diagrams for calculators that currently lack a meaningful one.

### CSS

- Replace the current full-row diagram rule inside the calculator workspace.
- Keep the incumbent ASL palette, typography, surface treatment, and control appearance.
- Remove large internal blank regions by constraining the panel and diagram, not by shrinking text below accessible sizes.
- Use content-driven breakpoints and pointer-safe interaction dimensions.

## Accessibility

- The visual precedes controls in DOM order and is non-interactive unless its existing component already exposes interaction.
- Input labels remain programmatically associated with their controls.
- Result regions retain `aria-live="polite"` and `aria-atomic="true"`.
- Focus styles, keyboard interaction, 44px touch targets, and reduced-motion behavior remain intact.
- Responsive changes do not hide any input, result, caption, or error message.

## Testing

### Static regression tests

- Assert that `CalculatorPanel` supports the explicit optional visual slot and renders separate visual/control regions.
- Assert that representative diagram calculators pass their diagrams through the visual slot.
- Assert that non-electronics calculators are not migrated by this change.
- Assert that the responsive CSS includes the wide two-column layout, the compact single-column layout, bounded diagrams, and no overflow-producing fixed width.

### Functional regression tests

- Run the existing calculator restoration, interaction-order, text-integrity, touch-target, design-contract, and responsive suites.
- Run the production build to catch React or CSS integration errors.

### Visual verification

Inspect at least these representative routes:

- RC Time Constant: standard diagram plus fields and multiple results.
- 5-Band Resistor: high-density swatches and live resistor visual.
- Series Resistors: dynamic field list with add/remove controls.
- 555 Astable: denser schematic and four results.
- Ohm's Law: no-visual fallback.

Check each at 1440px, 1024px, 768px, and 390px. One bounded desktop/mobile inspection pass may produce one consolidated correction pass, followed by one confirmation pass.

## Acceptance Criteria

- At desktop widths, the first editable control and the diagram are visible together without the diagram occupying a full-width row.
- At 390px, all scoped calculators fit without horizontal scrolling.
- Visual calculators use the same responsive workspace pattern.
- Calculators without visuals stay compact and do not reserve blank space.
- No formula, default value, result, validation path, or learning content changes.
- Existing ASL visual identity is preserved.

## Out of Scope

- Redesigning the tool catalog cards or their generated cover images.
- Rewriting diagrams or calculator formulas.
- Redesigning the long-form learning section.
- Changing math, conversion, encoding, or number-system calculator layouts.
- Adding new calculator features.

## 2026-09-06 — 555 schematic correction

User explicitly extended the scope to correct both in-tool 555 diagrams. Astable and monostable now share a pin-labelled schematic renderer, with mode-specific timing and trigger wiring. Capacitor endpoints use the symbol's own height to prevent the previous open ground connection. Supply/reset, ground, output and control bypass are explicit; the waveform remains a separate annotation. Pin positions are logical, not a physical DIP footprint.

Reference: [TI LM555 datasheet](https://www.ti.com/lit/ds/symlink/lm555.pdf), figures 11 and 14. Optional wiring notes explain the external monostable trigger, common ground and supply decoupling without crowding the main illustration. Impeccable's adapt guidance informed intrinsic SVG sizing and progressive disclosure while preserving the ASL palette and existing calculator behavior.
