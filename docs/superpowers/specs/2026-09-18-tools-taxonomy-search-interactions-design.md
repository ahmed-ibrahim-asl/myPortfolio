# Tools taxonomy, search, and interaction design

Date: 18 September 2026  
Status: Approved direction

## Goal

Make the engineering-tool library easy to scan on desktop and mobile. Separate Satellite mission work from RF engineering, give every category its own search, and raise the calculator graphs to the interaction quality of the Circuit Design tools.

## Category order

The Tools hub uses this fixed order:

1. Workbenches
2. Circuit Design
3. Text & Encoding
4. Conversions
5. Number Systems
6. Physics & Math
7. Satellite
8. RF Engineering

Workbenches stays first because those products have the broadest scope. Satellite and RF sit at the end as specialist engineering domains.

## Single ownership

Each calculator has one category card. Calculators can pass results to a calculator in another category, but the catalog does not repeat cards.

### Satellite

- Orbit & Kepler Calculator
- GEO Look Angle Calculator
- Satellite Power & Lifetime Calculator
- Doppler & Propagation Delay Calculator
- Satellite Link Budget Calculator

### RF Engineering

- RF Band & Carrier Planner
- Antenna Gain & Aperture Calculator
- RF Path, PFD & Received Power Calculator
- Noise, Noise Figure & G/T Calculator
- Multiple Access, SCPC & TDMA Planner

Physics & Math keeps the general Wavelength Calculator. The RF Band & Carrier Planner must earn its separate place through band classification, carrier planning, wavelength context, and RF-service guidance. It must not duplicate the general calculator's page or card.

## Routes and compatibility

- Use `/tools/category/satellite/` and `/tools/category/rf-engineering/` as category canonicals.
- Keep Satellite calculator canonicals under `/tools/satellite/<slug>/`.
- Move RF calculator canonicals to `/tools/rf/<slug>/`.
- Redirect the moved `/tools/satellite/<rf-slug>/` paths to their RF equivalents.
- Redirect `/tools/category/satellite-communication/` and `/tools/satellite-communication/` to `/tools/category/satellite/`.
- Preserve shared calculation links by decoding old URLs before redirecting their query strings.

## Category page pattern

All category pages use one shared pattern modeled on Circuit Design:

- breadcrumb and concise technical introduction;
- category-scoped search above the groups;
- live result count;
- sections with meaningful engineering group headings;
- purpose-specific calculator thumbnails where a diagram helps recognition;
- a clear empty state that retains the search field;
- no difficulty, estimated study time, practice link, exam mode, or progress state.

Search filters titles, summaries, tags, symbols, common abbreviations, and group names. It hides empty groups while preserving the original group order. The URL may carry `?q=` so a search can be shared or opened from global search.

## Satellite groups

- Mission geometry: Orbit, Look Angles, Doppler & Delay
- Spacecraft: Power & Lifetime
- End-to-end design: Satellite Link Budget

## RF groups

- Carrier & antenna: RF Band & Carrier, Antenna Gain & Aperture
- Path & receiver: RF Path/PFD, Noise/G/T
- Channel capacity: Multiple Access

## Calculator graph standard

Graphs use the existing ASL design tokens. Blue identifies calculated data, amber identifies a constraint or selected reference, teal identifies acceptable margin or capacity. Borders, type, surfaces, and spacing come from the current site design system.

Interaction must explain an engineering relationship. It must not add decorative motion.

### Antenna

The antenna calculator becomes the reference implementation:

- synchronized polar and Cartesian views;
- a visible boresight and half-power beamwidth;
- diameter, frequency, and efficiency controls update the graph and readouts;
- hover, focus, or tap probes show angle, relative power, and dB;
- the approximation label stays visible because the graph is not a measured radiation pattern;
- optional aperture and dish-geometry inset uses the same input values;
- keyboard controls and reduced-motion behavior match pointer behavior.

### Other calculators

- Orbit: keep the elapsed-time slider and add direct readouts for radius, anomaly, speed, and equal-area sweep.
- Look Angles: let longitude changes update the horizon and compass views; expose below-horizon state clearly.
- RF Path: add a distance probe on a logarithmic FSPL/received-power plot.
- Noise/G/T: make each stage focusable and expose its referred noise contribution.
- Link Budget: make each waterfall bar focusable with value, sign, equation term, and reference plane.
- Doppler: keep the pass-position control and label approach, closest approach, and recession.
- Multiple Access: let users inspect bandwidth or frame segments and their capacity cost.
- Power: expose beginning-of-life and end-of-life points with the chosen degradation model.

## Mobile controls

Do not make every button uniformly bold. Use hierarchy:

- primary actions: at least 14 px, weight 700, minimum height 48 px;
- normal actions: at least 14 px, weight 650, minimum height 44 px;
- compact presets and chips: at least 12 px, weight 600, minimum height 40 px;
- uppercase utility labels may use the mono face but must not drop below 11 px;
- button text must remain readable at 320 px without letter-spacing that thins the words.

Calculator inputs stack before they become too narrow. A graph may scroll inside its figure, but the page must never gain horizontal overflow.

## Verification

- The Tools hub has eight categories in the specified order.
- Every public tool belongs to exactly one category.
- Satellite and RF have five cards each.
- The general Wavelength Calculator appears only in Physics & Math.
- Every category page has working scoped search, group filtering, live count, keyboard focus, and a tested empty state.
- No public Satellite or RF surface contains exam, practice, study status, or progress controls.
- Legacy URLs redirect without losing valid shared-calculation parameters.
- Interactive graphs work with pointer, keyboard, touch, and reduced motion.
- Responsive screenshots pass at 320, 390, 768, 1024, 1440, and 1920 px in both themes.

