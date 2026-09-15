# Home, Tools, and Calculator Evidence Design

## Goal

Make every tool image explain the real workflow, reuse approved workbench covers on the home page, improve calculator-first interaction, remove corrupted equation characters, and update the portfolio method and project evidence without breaking the existing ASL design system.

## Scope and sequence

Generated images remain review-gated one at a time. The sequence is:

1. ESP32 Battery Life & Power Estimator
2. 5-Band Resistor Color Code Calculator title revision
3. 4-Band Resistor Color Code Calculator
4. Ohm's Law Calculator
5. Series Resistor Calculator
6. Parallel Resistor Calculator
7. Multi-MCU Security Lock

No generated image is copied into the project or referenced by production data until Ahmed approves that individual image.

## Homepage tool evidence

The three featured workbench entries on the home page will render their approved `coverImage` values instead of placeholder grids. The image remains inside a fixed crop frame and grows by approximately 4 to 6 percent on pointer hover and keyboard focus. The container clips the enlarged image so layout dimensions never move. Reduced-motion users receive the final visual state without a transition.

The same restrained interaction applies to workbench and calculator covers in the unified tools catalog. It must work for `:hover`, `:focus-visible`, and `:focus-within`, without treating touch as a permanent hover state.

## Calculator covers and calculator-first flow

The 4-band, 5-band, Ohm's Law, series, and parallel resistor covers will use real components or realistic product-diagram compositions instead of generic line-only thumbnails. Each cover receives one short, legible identifier such as `5 BAND`, `4 BAND`, `OHM'S LAW`, `SERIES`, or `PARALLEL`. Existing card titles remain the accessible source of truth.

The 4-band and 5-band calculator pages will start with the interactive resistor body and its currently selected color bands. Color controls and the computed resistance belong directly with that resistor. Explanations, the formula, mnemonic, and worked example follow the interactive section. The same calculator-first ordering remains the default expectation for calculator pages.

## Equation repair

The replacement character `�` is stored directly in several calculator source files. Every occurrence will be classified by meaning before replacement:

- multiplication becomes `×`;
- division becomes `÷`;
- status or punctuation corruption receives its intended symbol or plain text;
- operator map keys use the same visible and executable character.

A source scan and route-level tests will prevent `�` from returning in user-facing files.

## Public metrics

Remove the `GITHUB STARS` metric from the homepage metrics strip. Keep the GitHub social link and repository-related functionality; only the stars statistic is removed from the visible homepage section.

## Project evidence

Use `Robot+Composite+Scene.png` as the real-life AgriBot project evidence after copying it to a versioned project asset inside `public/media/projects/`. Preserve the original file and use a crop that keeps the robot body, wheels, actuators, and yellow tank visible.

The Multi-MCU Security Lock receives a later review-gated generated cover. It should depict a realistic separated architecture: a user-facing keypad/display controller, a physically separate secure control MCU, protected relay or lock actuator, tamper boundary, and a restrained authenticated link between controllers. The image must communicate separation of interface and control logic, not a generic padlock or cyber-security illustration.

## Operating method copy

Expand the method from four generic cards into six concrete stages:

1. **Question** — Ask what the system must do, what problem is being solved, what already exists, and what the inputs, outputs, constraints, and success conditions are.
2. **Learn & Research** — Identify missing knowledge, revisit fundamentals, inspect documentation and prior work, and keep the knowledge ready for design and teaching.
3. **Structure** — Define understandable boundaries, maintainable architecture, and useful file names before speed creates avoidable rework. AI accelerates this reasoning but does not replace it.
4. **Build** — Produce the smallest end-to-end version that proves the system and preserves the intended structure.
5. **Test Together** — Run rapid tests internally and with the customer against the actual requirements, recording failures and decisions.
6. **Improve** — Use each test loop to refine quality, documentation, naming, and maintainability as ongoing development.

The desktop layout uses three columns by two rows; tablet uses two columns; mobile uses one column. Numbers encode the real sequence.

## Footer statement

Replace the footer heading with exactly:

```text
Bring the problem.
I’ll build the system
that solves it.
```

Line breaks are intentional on larger screens and may wrap naturally on narrow screens without clipping.

## Battery estimator cover

The first generated candidate must be derived from the real estimator model:

- a realistic battery and ESP32-family development board;
- a visual choice between bare chip and development board overhead;
- a repeating timeline split into Sleep, Active, and optional Wi-Fi phases;
- phase current or energy contribution shown without pretending to be live measurement;
- output evidence for estimated runtime and average current;
- a short visible title, `BATTERY LIFE & POWER`;
- graphite black, warm white, restrained ASL gold, and limited desaturated signal blue;
- no white background, cyberpunk glow, fake dashboard, generic lightning bolt, or decorative wiring without meaning.

This image is preview-only until approved.

## Verification

- Contract tests verify home tool images use `coverImage`, GitHub stars are absent, the exact footer copy is present, working-method stages are correct, and no user-facing `�` remains.
- Calculator tests verify the interactive resistor appears before explanatory sections for both color-code calculators.
- Responsive browser checks cover 390, 768, 950, 982, 1366, 1920, 2560, and 3440 pixel widths.
- Visual checks confirm hover/focus enlargement is clipped, does not move layout, and is disabled as animation under reduced motion.
- Every approved asset returns HTTP 200 and has a reproducible prompt in the asset manifest.

## Constraints

- Preserve the current ASL graphite, gold, warm-white, and signal-blue design system.
- Keep square corners and editorial engineering structure.
- Preserve all unrelated dirty-worktree changes.
- Do not overwrite existing assets; use versioned filenames.
- Do not commit or push.

## Impeccable audit baseline

The independent Impeccable review scores the current experience **24/40**. The visual system is strongly authored for Ahmed's engineering practice, but the evidence and interaction layers are not yet equally trustworthy. The audit found no viewport-level horizontal overflow and no console errors on the sampled routes at 1265 by 720 pixels.

### What must remain

- The bilingual ASL identity, numbered registers, graphite instrument surfaces, square geometry, gold signal path, and restrained signal blue are distinctive and should not be replaced.
- Immediate calculator feedback, visible pressed states, live catalog counts, active navigation, and Escape support in the mobile menu are useful foundations.
- Project imagery, outcomes, and technical tags should continue to lead the portfolio evidence.

### Release priorities

1. **P1 — Repair technical text corruption.** Classify and replace every user-facing replacement character before visual polish. A visitor must never see `�`, `Ã`, `Â`, or `â` in formulas, operators, units, examples, status text, or navigation.
2. **P1 — Make calculator-first ordering semantic.** Move calculator controls and output before teaching content in the React source. Do not rely on CSS `order` to create a different visual and screen-reader sequence. Co-locate the live resistor body, band controls, resistance, tolerance, and range.
3. **P1 — Make the battery model honest and actionable.** Show the assumptions that already affect the result, prevent visible values from disagreeing with silently clamped calculation values, and keep the result close to the controls on mobile.
4. **P2 — Make imagery prove function.** Replace generic homepage tool placeholders and line-only resistor thumbnails with approved evidence covers. The lock image must explain the real trust boundary; the battery image must explain the real phase model.
5. **P2 — Complete interaction and copy consistency.** Add restrained image zoom for hover and keyboard focus, remove GitHub Stars, expand the operating method, and use the approved footer statement.

## Impeccable implementation additions

### Semantic calculator-first composition

- `CalculatorPanel` appears first in source order for calculator pages.
- On 4-band and 5-band pages, `ResistorBandsDiagram` sits inside the interactive panel above the selectors.
- Desktop may use a sticky preview-and-result column, but the reading order remains controls, result, then explanation.
- Mobile keeps a compact selected-resistor summary adjacent to the active band controls, avoiding a long memory bridge.
- The breadcrumb inserts a visible separator between `ALL ENGINEERING TOOLS` and the calculator category.

### Battery estimator trust model

- Expose the existing `usableCapacityPercent` as a visible battery derating control rather than fixing it at 100 percent.
- Preserve the current chip presets and explicitly distinguish `bare chip / datasheet` from `typical development board` overhead.
- Replace silent input clamping with inline validation that names the invalid field and valid range. Calculations must use the value the visitor sees.
- Replace extremely wide linear duration and current sliders with practical presets or stepped ranges around common values, while retaining precise number inputs for expert use.
- Keep Sleep, Active, and optional Wi-Fi as three visible operating phases and show their relative energy contribution.
- Keep the estimated runtime and average current visible beside the controls on desktop and near them on mobile.
- Label the result as an estimate and keep the existing caveat about regulator loss, battery age, temperature, self-discharge, cutoff voltage, and radio behavior.
- Promote the page title to the route's single `h1`.

### Catalog load and navigation semantics

- The unified tools page must contain one `main` landmark.
- Keep search primary. On narrow screens, present calculator categories as a compact horizontally scrollable filter rail or grouped disclosure so eight filters do not delay the first tool.
- Preserve visible filter state and the live result count.
- Image zoom applies to the image only, never the text or card dimensions.

### Accessibility and responsive gates

- Hover enhancement always has an equivalent `:focus-visible` or `:focus-within` state.
- Generated cover text is supplemental; card titles and meaningful alt text remain available outside the bitmap.
- Test keyboard order against DOM order rather than screenshots alone.
- Verify subdued secondary text reaches WCAG AA contrast on the actual backgrounds.
- Use lazy loading and responsive image sizes for large generated covers.
- Re-run browser checks at 390, 768, 950, 982, 1265, 1366, 1920, 2560, and 3440 pixels.

### Deterministic detector findings

The Impeccable detector reported 18 findings: 16 warnings and 2 advisories. Most are intentional or false positives, including paired L-corner ornaments, blockquote cite bars, the tool measurement grid, and a selector that explicitly forces zero radius. Literal side-accent candidates in `app/asl-tools.css` and legacy `app/game-theme.css` should be reviewed only when their components are touched; they are not permission for a broad unrelated restyle.

The browser sample covered `/`, `/tools/`, `/tools/5-band-resistor-color-code-calculator/`, `/tools/battery-estimator/`, `/work/`, and `/about/`. All loaded without console errors and without viewport-level horizontal overflow at the sampled size. The two confirmed structural defects are the missing battery-page `h1` and the duplicate `main` landmark on `/tools/`.

### Persona acceptance checks

- **First-time visitor:** can identify the first calculator action within five seconds and understands technical abbreviations through nearby plain-language help.
- **Stress tester:** cannot make the displayed input disagree with the calculated value; invalid fields explain how to recover.
- **Distracted mobile visitor:** can change a value and see the result without scrolling through more than one long content region; large filter and swatch sets do not hide progress.

## Full 41-tool Impeccable audit

This pass covers every link exposed by `/tools/`: five engineering workbenches and thirty-six calculators. Each route was opened at a 1265 by 720 desktop viewport and a 390 by 844 mobile viewport. The browser reported no horizontal overflow, no console errors, no visibly unlabeled form controls, and no visible buttons below the 44 pixel touch-target floor. Those strengths must survive the simplification work.

The dominant defect is visual containment overload:

- the average route contains 35.5 visible bordered elements on desktop and 35.7 on mobile;
- the calculator template commonly creates four nested border levels;
- Security Mission and Sensor Code Generator reach five nested border levels;
- a normal calculator repeats seven or eight separately boxed teaching and interaction regions;
- the thirty-six calculators contain 144 `ToolSection` instances, 36 mnemonic panels, and 36 nested worked-example panels;
- twenty-five routes render 82 visible mojibake occurrences;
- PID Simulator, Sensor Code Generator, and Battery Estimator use visually prominent titles that are not semantic `h1` elements;
- the first interactive controls appear around 700 to 900 pixels down on most calculators, at 1,289/1,360 pixels for PID, 1,359/1,991 for Sensor Code Generator, 3,051/3,993 for the 4-band resistor, and 3,234/4,175 for the 5-band resistor (desktop/mobile respectively).

### Design verdict

The engineering identity is specific and worth preserving, but the same border weight currently represents page framing, content grouping, controls, examples, diagrams, navigation, and results. Because nearly everything is outlined, no outline communicates priority. The interface should continue to feel like a precise instrument, but an instrument panel is readable because it groups controls by task and reserves strong boundaries for modules that actually operate independently.

### The no-box-inside-box rule

Adopt `one surface, one edge` across every tool:

1. A major functional workspace may have one outer border.
2. Native controls may keep their own border, but their label, suffix, hint, and validation message do not receive another container border.
3. Results inside a workspace use a tinted background, larger type, and alignment instead of another full rectangle.
4. Teaching content uses headings, whitespace, and a single entry rule above the entire learning region. Individual `What's going on`, `Build it up`, `The formula`, mnemonic, and worked-example blocks are not boxed.
5. A diagram that is part of the calculation sits inside the calculator workspace without its own frame. A genuinely independent visualization may have one frame.
6. Finder/navigation content uses one top divider for the region; its result links rely on spacing and hover/focus background rather than a border around every link.
7. Selection is communicated with fill, text weight, check state, and one accent edge. Do not stack an accent edge, full outline, inset line, and shadow on the same element.
8. Structural border nesting must not exceed two levels. The intended target is no more than eight structural bordered regions on a calculator page, excluding the borders belonging to actual form controls.

### Shared calculator information architecture

All thirty-six calculators use the following semantic and visual order:

```jsx
<div className="article-body" data-calculator-experience>
  <CalculatorPanel>
    {/* Direct inputs, immediate result, and any calculation-critical diagram */}
  </CalculatorPanel>
  <section className="tool-learning-flow" aria-labelledby="learn-heading">
    <h2 id="learn-heading">Understand the result</h2>
    {/* What's going on, formula, mnemonic, and one worked example */}
  </section>
</div>
```

- The compact route header names the tool and states its outcome; it must not consume the entire first viewport.
- The first meaningful control and a useful default result are visible without scrolling at 720 pixels high.
- `What's going on` and `The formula` remain immediately visible. Longer derivation, mnemonic, and worked example use a consistent `details/summary` disclosure when their combined copy would push the next major region more than one viewport away.
- Calculator output updates in place next to the inputs on desktop and immediately after them on mobile.
- Invalid values retain the visitor's input and receive an inline recovery message; no route silently replaces the value used by the calculation.
- `CalculatorFinder` remains last, becomes visually quiet, and never competes with the current calculation.

### Tool-by-tool action register

| # | Tool | Observed interface issue | Required implementation |
|---:|---|---|---|
| 01 | AI Script Generator | 37 bordered regions and 27 visible choices make the first decision compete with downstream configuration. | Keep the task chooser dominant, reveal configuration after a task is selected, keep generated source in one workspace, and remove decorative borders from summaries and passive metadata. |
| 02 | Security Mission | 33 bordered regions, five nesting levels, three modes, and eight workflow steps create the densest navigation stack. | Use one mode selector and one compact progress rail, show only the active step panel plus command preview, and move audit/reference metadata into disclosures. |
| 03 | Interactive PID Simulator | The title is not an `h1`, and the first control begins below the initial desktop and mobile view. | Promote the title to `h1`, shorten the hero, place setpoint/response plot beside P-I-D controls on desktop, and stack controls directly above the plot on mobile. |
| 04 | Sensor Code Generator | Five border levels; controls begin at 1,359 desktop and 1,991 mobile; preview can appear before the configuration context. | Promote the title to `h1`, reduce the opening whitespace, present `hardware → device/sensor → behavior → generate`, and keep wiring, dependencies, and code in one result workspace. |
| 05 | ESP32 Battery Life & Power Estimator | Sixteen controls, non-semantic title, and assumptions/results compete before the primary inputs. | Promote the title to `h1`, group inputs into Battery, Sleep, Active, and Wi-Fi phases, expose usable capacity and board overhead, and keep a sticky estimate summary beside the active phase. |
| 06 | Ohm's Law Calculator | 39 bordered elements and a corrupted multiplication operator make a simple relationship look long and fragile. | Put `solve for` and the two inputs first, display the three-way V/I/R relationship beside the result, then merge the five teaching boxes into one unboxed learning flow. |
| 07 | 4-Band Resistor Color Code | The first selector is 3,051/3,993 pixels down and the live resistor is separated from the band choices. | Start with the physical resistor, place four labeled band pickers directly beneath/alongside it, update resistance and range in the same workspace, then show the lesson. |
| 08 | 5-Band Resistor Color Code | The first selector is 3,234/4,175 pixels down; five corrupted symbols appear before interaction. | Start with the five-band resistor and title, co-locate all five pickers and live result, repair multiplication symbols, and move teaching content after the workspace. |
| 09 | Series Resistor Calculator | Repeated boxed lesson structure obscures a very small multi-value task. | Make the editable resistor list the focus, provide obvious add/remove actions, show total resistance inline, and use one simple series diagram without a second frame. |
| 10 | Parallel Resistor Calculator | The result is visually diluted by the same seven-box lesson template. | Keep the parallel branch diagram with the value list, explain reciprocal behavior beside the output, and place extended derivation behind one learning disclosure. |
| 11 | Voltage Divider Calculator | Diagram, formula, inputs, and result are split across eight panels; three symbols are corrupted. | Combine the divider diagram, Vin/R1/R2 controls, Vout result, and node labels in one workspace; repair operators before styling. |
| 12 | RC Time Constant Calculator | Forty bordered elements separate values from the charge/discharge meaning. | Pair R/C inputs with the curve and `τ` result in one workspace, use phase markers instead of extra cards, and flatten the lesson. |
| 13 | 555 Astable Calculator | At 43 borders and eight corrupted characters, this is the noisiest calculator route. | Build one circuit-and-waveform workspace, group timing inputs by charge/discharge role, surface frequency/duty cycle together, and collapse the derivation and example. |
| 14 | 555 Monostable Calculator | The one-shot relationship is spread across eight panels and four corrupted characters. | Keep trigger, R/C inputs, pulse waveform, and output width in one module; move the explanatory sequence below it. |
| 15 | Capacitive Reactance Calculator | Four corrupted symbols and seven boxes weaken an otherwise direct two-input calculation. | Present frequency and capacitance with unit selectors beside `Xc`, add one frequency-direction hint, and remove individual teaching borders. |
| 16 | LED Series Resistor Calculator | The shared template delays the practical wiring decision. | Put supply voltage, LED forward voltage/current, resistor recommendation, power rating, and LED diagram together; show a clear warning for impossible voltage combinations. |
| 17 | Battery Life Calculator | The idealized result is visually equivalent to explanatory copy and contains two corrupted symbols. | Lead with capacity/load/duty inputs, label the result as idealized, keep assumptions next to it, and move learning copy below one divider. |
| 18 | RMS Voltage Calculator | The simple waveform conversion inherits seven equally weighted panels. | Place waveform type, peak/RMS input, and converted result with one waveform visual; reduce the remainder to concise supporting text. |
| 19 | High Pass Filter Calculator | Diagram, cutoff result, formula, and five corrupted characters are distributed across eight boxes. | Use one circuit/response workspace with R/C controls and cutoff marker; keep derivation secondary. |
| 20 | Low Pass Filter Calculator | Same eight-box split as high-pass, with four corrupted characters. | Mirror the high-pass workspace exactly so users can transfer learning; only the response direction and labels change. |
| 21 | Op-Amp Gain Calculator | Eight panels and two corrupted operators separate topology from gain. | Choose topology first, show the correct schematic and fields together, update gain/output range in place, and disclose theory afterward. |
| 22 | Capacitor Code-Value Converter | A three-control conversion is wrapped in seven panels and two corrupted symbols. | Put code/value direction, input, decoded value, and marking example in one compact workspace; remove redundant mnemonic framing. |
| 23 | Capacitance Conversion | Forty borders surround a direct unit conversion and three corrupted symbols. | Use one value field, clear from/to units, swap control, and live output; make the conversion table optional supporting content. |
| 24 | Temperature Conversion | Thirty-eight borders and three corrupted symbols overstate a basic conversion. | Use a compact from/to converter with a swap action and result, followed by one short formula explanation. |
| 25 | Decimal/Binary/Octal/Hex Converter | Four bases and one corrupted character compete inside the generic lesson stack. | Use one source-base input and a four-row synchronized result table; keep copy/format actions next to each value without extra cards. |
| 26 | Binary Bit Shift Calculator | Nine corrupted characters—the highest text-corruption count—and four border levels make the bit movement hard to follow. | Repair every operator, show a live before/after bit strip beside direction/amount/width controls, and keep overflow/truncation feedback next to the result. |
| 27 | One's Complement Calculator | The bit transformation is described in boxes instead of shown directly. | Put bit width, source bits, and a position-aligned inverted result in one workspace; use the lesson only to explain the rule and signed interpretation. |
| 28 | Two's Complement Calculator | Thirty-nine borders obscure the two-step invert-plus-one operation. | Show original, inverted, `+1`, and final rows in one aligned bit workspace with width and signed-value controls. |
| 29 | ASCII to HEX Converter | A direct text conversion is delayed by seven teaching panels. | Start with the text area and synchronized byte/token output, retain spaces/newlines visibly, and keep encoding notes in one disclosure. |
| 30 | HEX to ASCII Converter | The inverse conversion needs error recovery more than repeated exposition. | Put hex input, parsed bytes, text output, and exact invalid-token guidance together; mirror the ASCII-to-HEX layout. |
| 31 | Log Base 2 Calculator | Thirty-five borders surround one field and result. | Use a single compact calculator row, show exact power-of-two context next to the result, and reduce teaching to one short section. |
| 32 | Binary Calculator | Operation, operands, decimal interpretation, and one corrupted symbol lack a single focal workspace. | Align operand rows, operation choice, binary result, and decimal cross-check in one module; validate widths and unsupported input inline. |
| 33 | Hex Calculator | Same arithmetic task as Binary Calculator but with a different visual rhythm and one corrupted symbol. | Reuse the Binary Calculator composition and behaviors, changing only alphabet, validation, and base annotations. |
| 34 | Acceleration Calculator | The relationship among initial/final velocity and time is split by generic teaching cards. | Let the visitor choose the unknown, show only required fields, and pair the answer with a compact motion timeline. |
| 35 | Force, Mass & Acceleration Calculator | Two corrupted symbols and seven panels weaken the familiar `F = ma` model. | Use a three-variable solve-for workspace with unit-aware fields and a simple force-body visual; explain rearrangement below. |
| 36 | Speed Distance Time Calculator | One corrupted symbol and generic panels hide the solve-for interaction. | Use the same three-variable pattern as Force/Mass/Acceleration, with distance-time visual and consistent unit selection. |
| 37 | Wavelength Calculator | Four corrupted characters interrupt the frequency/speed relationship. | Pair medium/speed and frequency inputs with wavelength output and one annotated wave; keep units and scientific notation close. |
| 38 | Frequency-to-Period Calculator | The route is simple but still inherits the long seven-panel composition. | Use mirrored frequency/period fields with a swap-direction action and a one-cycle timeline; shorten the lesson to formula plus example. |
| 39 | Percentage Change Calculator | Two corrupted characters and repeated panels obscure sign and direction. | Place old/new values, signed change, percentage, and increase/decrease state in one module with explicit zero-baseline handling. |
| 40 | Square Root Calculator | Three corrupted characters and seven panels are excessive for a one-value tool. | Use one field, exact/decimal result, and compact square-area visual; make explanation optional. |
| 41 | Cube Root Calculator | Six corrupted characters and a generic cube diagram do not clearly connect input to edge length. | Use one field, exact/decimal result, and a labeled volume-to-edge cube visual in the same workspace; remove redundant frames. |

## Interface implementation plan

### Task 1: Establish the tool surface hierarchy

**Files:**

- Modify `components/tools/CalculatorUI.js`
- Modify `components/tools/CalculatorShell.js`
- Modify `app/asl-tools.css`
- Modify only overlapping legacy selectors in `app/game-theme.css`
- Test `tests/tools/calculator-theme.test.js`
- Test `tests/tools/asl-design-contract.test.js`
- Create `tests/tools/tool-interface-hierarchy.test.js`

- [ ] Add `data-tool-workspace`, `data-tool-learning`, and `data-tool-support` hooks so CSS expresses functional hierarchy instead of targeting every generic box.
- [ ] Remove the outer border/background from `ToolSection`, `Mnemonic`, `WorkedExample`, and `tool-diagram` when nested in a calculator learning region.
- [ ] Keep one bordered `CalculatorPanel`; render results as an unboxed tinted result band inside it.
- [ ] Remove the surrounding `CalculatorFinder` box and individual result-card borders; retain one region divider and visible hover/focus states.
- [ ] Add a contract test that fails when a learning component reintroduces a full border or when calculator CSS exceeds two declared structural nesting levels.

### Task 2: Put every calculator before its lesson

**Files:**

- Modify all exports in `components/tools/calculators/*.js`
- Modify `components/tools/CalculatorUI.js`
- Test `tests/tools/calculator-restoration.test.js`
- Create `tests/tools/calculator-source-order.test.js`

- [ ] Move each `CalculatorPanel` to the first meaningful child of `.article-body` in React source order.
- [ ] Add one shared `CalculatorLearning` component that supplies the `Understand the result` heading and optional disclosures without adding nested panel borders.
- [ ] Keep `What's going on` and formula visible; place derivation, mnemonic, and worked example in consistent native disclosures when long.
- [ ] Test all thirty-six component files, not a sample, and fail with the route slug when a calculator panel follows learning content.

### Task 3: Repair technical text before visual polish

**Files:**

- Modify the twenty-five files returned by `rg -l '�|â€|Â' components/tools app/tools data lib`
- Test `tests/tools/asl-design-contract.test.js`
- Create `tests/tools/tool-text-integrity.test.js`

- [ ] Classify each of the 82 rendered replacement characters as multiplication, subtraction, punctuation, or an operator-map value before replacement.
- [ ] Use `×`, `÷`, `−`, arrows, or plain language consistently in display text; keep executable operator keys aligned with the visible control.
- [ ] Scan every user-facing tool source and fail when UTF-8 replacement or common mojibake sequences return.

### Task 4: Fix the three workbench heading and above-the-fold failures

**Files:**

- Modify `app/tools/pid-simulator/page.tsx` and its shell component
- Modify `app/tools/sensor-code-generator/page.tsx` and `components/tools/model-mission/*`
- Modify `app/tools/battery-estimator/page.tsx`
- Modify `app/asl-tools.css`
- Test the existing PID, model-mission, sensor, battery, and responsive suites

- [ ] Give PID, Sensor Code Generator, and Battery Estimator exactly one semantic `h1`.
- [ ] Reduce route-header minimum height so the first meaningful control/result pair enters a 720-pixel viewport.
- [ ] Apply the per-tool workspace changes in rows 03–05 without changing calculation or generation behavior.
- [ ] Verify DOM order and visual order match at 390, 768, 1265, and 1366 widths.

### Task 5: Refactor the two resistor selectors as direct-manipulation tools

**Files:**

- Modify `components/tools/calculators/ResistorColorCodeCalculator.js`
- Modify `components/tools/calculators/FiveBandResistorColorCodeCalculator.js`
- Modify `components/tools/diagrams/ResistorBandsDiagram.js`
- Modify `components/tools/CalculatorUI.js`
- Test `tests/tools/calculator-restoration.test.js`
- Create `tests/tools/resistor-interaction-order.test.js`

- [ ] Place `ResistorBandsDiagram` inside `CalculatorPanel` before the band selectors.
- [ ] Bind each selected swatch to its corresponding live resistor band and keep resistance, tolerance, and range in the same viewport.
- [ ] Preserve named labels and `aria-pressed`; add visible focus that does not rely on border stacking.
- [ ] Assert in rendered DOM that resistor, controls, and results precede all explanatory headings on both routes.

### Task 6: Simplify the remaining calculator families

**Files:**

- Modify the relevant files in `components/tools/calculators/`
- Reuse diagrams in `components/tools/diagrams/`
- Test `tests/tools/calculator-restoration.test.js`
- Test `tests/tools/tool-interface-hierarchy.test.js`

- [ ] Electronics: implement rows 06 and 09–23 with diagram, inputs, and output in one workspace.
- [ ] Number systems: implement rows 24–33 with synchronized representations and exact token-level validation.
- [ ] Physics and math: implement rows 34–41 with a consistent solve-for pattern and one meaningful visual.
- [ ] Preserve each calculator's formulas and defaults unless a separate calculation test proves a defect.

### Task 7: Distill the two configuration workbenches

**Files:**

- Modify `components/tools/model-mission/*`
- Modify `components/tools/security-mission/*`
- Modify their CSS modules
- Test `tests/tools/model-mission-responsive.test.js`
- Test `tests/tools/security-mission-responsive.test.js`
- Test the existing generation, validation, state, and parity suites

- [ ] Sensor/AI workflows reveal one decision group at a time while keeping the chosen configuration summarized above the active step.
- [ ] Security Mission displays one compact mode selector, one progress rail, one active configuration panel, and one command preview; reference and audit details move to disclosures.
- [ ] Reduce structural border nesting to two without weakening warnings, active states, or safe-generation language.

### Task 8: Verify the complete system

**Files:**

- Update `tests/tools/site-responsive.test.js`
- Update `tests/tools/asl-design-contract.test.js`
- Use all existing `tests/tools/*.test.js`

- [ ] Run `node --test tests/tools/tool-text-integrity.test.js tests/tools/tool-interface-hierarchy.test.js tests/tools/calculator-source-order.test.js tests/tools/resistor-interaction-order.test.js` and confirm all new contracts pass.
- [ ] Run `npm test` and preserve every existing calculation/generator contract.
- [ ] Open all 41 routes at 390, 768, 1265, and 1366 widths; confirm one `h1`, one `main`, no overflow, no console errors, labeled controls, 44-pixel touch targets, and input-before-result-before-learning order.
- [ ] Re-measure structural borders: calculator learning sections must be unboxed, structural nesting must be at most two, and no route may use an outline merely to decorate passive text.
- [ ] Run the Impeccable detector once after implementation, then perform one batched visual confirmation pass and one bounded correction pass.
