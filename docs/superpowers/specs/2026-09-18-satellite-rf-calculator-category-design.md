# Satellite & RF calculator category redesign

Date: 18 September 2026  
Status: Approved design, pending implementation plan

## Purpose

Replace the course-style Satellite Communication product with a standalone category of specialized engineering calculators. The category serves engineers and advanced learners who want to size, evaluate and connect parts of a satellite link.

The category must not appear as a product inside Workbenches. No Satellite item may appear in the Workbenches category.

## Product structure

The Satellite & RF category contains these ten calculators:

1. Frequency and wavelength
2. Orbit and coverage
3. Look angles and slant range
4. Spacecraft power sizing
5. Antenna gain and beamwidth
6. RF path and received power
7. Receiver noise and G/T
8. End-to-end link budget
9. Doppler and propagation delay
10. Multiple-access capacity

Remove these products and surfaces from navigation, static route generation, search registration and the sitemap:

- Fundamentals
- Subsystems
- Transponders
- Laboratory
- Exam Practice
- Formula Sheet
- Quiz, midterm and final modes
- Embedded practice questions
- Study progress and “mark as studied” controls

The old `/tools/satellite-communication/` URL remains only as a compatibility redirect to `/tools/category/satellite-communication/`. The category URL becomes the canonical entry point.

## Category experience

The category page opens with a short technical introduction and a compact engineering flow:

`Orbit → Pointing → Power → Antenna → RF path → Noise → Link margin → Doppler → Capacity`

Each stage links to one calculator. The flow uses responsive HTML and SVG only where geometry adds information. It must display tool names and engineering quantities, rather than a decorative ground-station illustration. On narrow screens, stages wrap or scroll within their own labelled region without widening the page.

The category lists ten cards grouped by engineering task:

- Mission geometry: orbit, look angles, Doppler and delay
- Spacecraft and antenna sizing: power, antenna
- RF chain: frequency, RF path, noise/G/T, link budget
- Channel capacity: multiple access

Each card has one action: open the calculator. The category does not show learning time, difficulty, practice links, progress or study status.

## Calculator experience

Each calculator keeps a narrow scope and a consistent engineering sequence:

1. Select the calculation or design target.
2. Enter quantities with explicit symbols and units.
3. Calculate primary outputs and important intermediate values.
4. Inspect the physical interpretation, limits and warnings.
5. Open the worked derivation when needed.
6. Transfer compatible results to the next calculator.

The calculator page retains source-backed explanations, formulas, assumptions, common mistakes, share links, local calculation history and printable worked solutions. These elements explain the tool; they do not behave like lessons, quizzes or exams.

Remove the Study/Exam selector. Calculators show results after the user selects Calculate. They may update diagrams from input changes, but they must not reveal an answer through a practice-session workflow.

## Responsive layout correction

The current workspace combines the global `.shell` class with a CSS-module workspace on the same node. The global ASL cascade forces `.shell` to the left edge, while contextual gutter rules do not match this route structure. At 768 px the hero touches both viewport edges; at 390 px the shell loses width on the right without an equal left margin.

The Satellite category and calculator root will own their inline gutter and width. The layout must satisfy these checks at 320, 390, 768, 1024, 1440 and 1920 px:

- equal left and right page gutters;
- no page-level horizontal overflow;
- controls remain at least 44 px high;
- labels, values and units remain visible;
- input and output panels stack before either panel becomes too narrow;
- diagrams scroll inside their figure only when preserving their scale improves readability.

## Visual direction

The interface uses the portfolio's existing dark/light themes and typography. The category's signature is the connected engineering flow, with each connector representing a value that can move between calculators. Signal blue marks calculated data. Amber marks a constraint or warning. Teal marks a valid design margin.

Avoid decorative satellite art, generic dashboards, large empty panels, glow effects and illustrations that do not change with engineering inputs.

## Data and navigation changes

- Filter all Satellite module entries out of Workbenches.
- Register only the ten calculators under Satellite & RF.
- Remove the course landing product from the engineering-tool catalog.
- Generate only the ten calculator slugs under `/tools/satellite/[slug]/`.
- Remove practice-return query handling and links.
- Update tool-search hooks, category summaries, sitemap entries, canonical metadata and structured data to describe calculators rather than a course.
- Keep compatible value-transfer links among calculators.

## Verification

Implementation must add failing tests before production changes. Tests must prove:

- Workbenches contains no Satellite entries.
- Satellite & RF contains exactly ten unique calculator entries.
- removed routes do not appear in static params, navigation, search hooks or sitemap output.
- no page contains Practice, Quiz, Midterm, Final, Exam mode, Mark as studied or learning-time UI.
- the category flow links to the correct calculators.
- mobile, tablet and desktop layouts have equal gutters and no page overflow.
- the old course URL redirects to the category URL.
- existing numerical engines, presets, unit conversion, result transfer, sharing, history and printing still pass.
- production build and exported canonical/sitemap inspection pass.

## Out of scope

- New numerical domains beyond the ten existing calculators
- User accounts or cloud-synced history
- Course PDFs or public source downloads
- Deployment
