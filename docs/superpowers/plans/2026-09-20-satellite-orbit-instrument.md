# Satellite Orbit Instrument Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the two satellite-page dropdowns, expose Earth's gravitational parameter only in km³/s², and replace the basic orbit plot with an accessible interactive orbital instrument.

**Architecture:** Keep the calculator engine internally SI-based, but normalize the public kilometre-based gravitational parameter at one engine boundary. Move orbit-specific view-model calculations into pure functions in `visuals.js`, and render them through a focused `OrbitInstrument.jsx` component so animation state does not enlarge the already broad plot collection.

**Tech Stack:** Next.js 16.3, React 19, JavaScript/JSX, CSS Modules, Node `node:test`, Puppeteer Core, inline SVG.

## Global Constraints

- Remove both the satellite-module dropdown and calculation-convention dropdown.
- Use `398600.4418 km³/s²` everywhere the Earth gravitational parameter is visible or entered.
- Use engineering constants for new calculations and links.
- Preserve legacy version-1 shared links and saved orbit values that contain `mu` in m³/s².
- Keep the interactive visualization code-native SVG; do not replace it with a bitmap.
- Reuse the existing ASL tokens and typography; add no new dependency or parallel theme system.
- Preserve all unrelated dirty working-tree changes.
- Respect `prefers-reduced-motion` and keep every control keyboard accessible.

---

## File map

- `data/satellite-inputs.js`: public field keys, defaults, units, and orbit field visibility.
- `data/satellite-field-help.js`: user-facing unit explanation.
- `lib/tools/satellite/engine.js`: SI normalization and orbital calculations.
- `lib/tools/satellite/state.js`: versioned shared-link encoding and legacy-value restoration.
- `lib/tools/satellite/visuals.js`: pure orbital instrument view model and equal-time geometry.
- `components/tools/satellite/SatelliteWorkspace.jsx`: fixed engineering convention and removal of page dropdowns.
- `components/tools/satellite/OrbitInstrument.jsx`: new interactive orbital SVG and playback controls.
- `components/tools/satellite/SatelliteLivePlots.jsx`: retain non-orbit plots and re-export/import the new instrument as needed.
- `components/tools/satellite/SatelliteDiagrams.jsx`: route orbit diagrams to `OrbitInstrument`.
- `components/tools/satellite/SatelliteWorkspace.module.css`: instrument layout, metric rail, controls, themes, responsive behavior.
- `tests/tools/satellite-inputs.test.js`: public unit and engine normalization coverage.
- `tests/tools/satellite-state.test.js`: version-2 links and version-1 migration coverage.
- `tests/tools/satellite-visuals.test.js`: orbital instrument geometry coverage.
- `tests/tools/satellite-browser.test.js`: removed navigation controls and fixed convention coverage.
- `tests/tools/satellite-orbit-hydration-browser.test.js`: interactive control, hydration, motion, and SVG validity coverage.

### Task 1: Public kilometre unit and SI normalization

**Files:**
- Modify: `data/satellite-inputs.js`
- Modify: `data/satellite-field-help.js`
- Modify: `lib/tools/satellite/engine.js`
- Modify: `tests/tools/satellite-inputs.test.js`

**Interfaces:**
- Consumes: orbit input objects with `muKm3S2?: number` or legacy `mu?: number`.
- Produces: `export const EARTH_MU_KM3_S2 = 398600.4418` and engine calculations that normalize `muKm3S2 * 1e9` exactly once.

- [ ] **Step 1: Write failing public-unit tests**

Add assertions equivalent to:

```js
test("orbit exposes Earth mu only in kilometres cubed per second squared", () => {
  const field = satelliteInputs.orbit.fields.find((item) => item.key === "muKm3S2");
  assert.equal(field.value, 398600.4418);
  assert.equal(field.unit, "km³/s²");
  assert.equal(satelliteInputs.orbit.fields.some((item) => item.key === "mu"), false);
});

test("kilometre mu input preserves the engineering circular-orbit result", () => {
  const result = calculate("orbit", {
    ...initialValues("orbit"),
    muKm3S2: 398600.4418
  }, "engineering");
  assert.ok(Math.abs(value(result, "velocityMps") - 7455.956) < 0.01);
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `node --test tests/tools/satellite-inputs.test.js`

Expected: FAIL because `muKm3S2` does not exist and the UI still exposes `mu` in m³/s².

- [ ] **Step 3: Change the public field and help entry**

Replace the orbit field with:

```js
field("muKm3S2", "Earth gravitational parameter", 398600.4418, "km³/s²")
```

Update the orbit visibility tables to use `muKm3S2`, and replace the help-map key and copy so it never instructs users to enter m³/s².

- [ ] **Step 4: Normalize once in the engine**

Add and use:

```js
export const EARTH_MU_KM3_S2 = 398600.4418;

function gravitationalParameterM3S2(values, mode) {
  if (values.muKm3S2 !== undefined)
    return positive(values.muKm3S2, "Gravitational parameter") * 1e9;
  return positive(values.mu ?? constants(mode).mu, "Gravitational parameter");
}
```

Use this boundary in `orbitalInputs()` and `visViva()`. Keep result keys and all distance calculations internally in metres.

- [ ] **Step 5: Run the focused tests and confirm GREEN**

Run: `node --test tests/tools/satellite-inputs.test.js tests/tools/satellite-engine.test.js`

Expected: PASS.

- [ ] **Step 6: Commit the unit boundary**

```bash
git add data/satellite-inputs.js data/satellite-field-help.js lib/tools/satellite/engine.js tests/tools/satellite-inputs.test.js
git commit -m "fix: expose orbital mu in kilometres"
```

### Task 2: Versioned state migration and fixed engineering convention

**Files:**
- Modify: `lib/tools/satellite/state.js`
- Modify: `components/tools/satellite/SatelliteWorkspace.jsx`
- Modify: `tests/tools/satellite-state.test.js`
- Modify: `tests/tools/satellite-browser.test.js`

**Interfaces:**
- Consumes: version-1 payloads `{ slug, values, mode }` and new orbit values.
- Produces: `encodeProblem(slug, values)` version-2 payloads without `mode`; `decodeProblem()` returns normalized values; workspace calculations always pass `"engineering"`.

- [ ] **Step 1: Write failing link-migration tests**

Add:

```js
test("new links omit convention and legacy orbit mu migrates to km³/s²", () => {
  const current = encodeProblem("orbit", { altitudeM: 800000, muKm3S2: 398600.4418 });
  assert.match(current, /^\?v=2&/);
  assert.doesNotMatch(decodeURIComponent(current), /"mode"/);

  const legacy = `?v=1&p=${encodeURIComponent(JSON.stringify({
    slug: "orbit",
    values: { orbitMode: "circular", mu: 398600.4418e9 },
    mode: "course"
  }))}`;
  assert.deepEqual(
    decodeProblem(legacy, ["orbitMode", "muKm3S2"]),
    { slug: "orbit", values: { orbitMode: "circular", muKm3S2: 398600.4418 } }
  );
});
```

Change the browser contract to assert:

```js
assert.equal(await page.$('select[aria-label="Open satellite module"]'), null);
assert.equal(await page.$('label >> text/Calculation convention/'), null);
```

Use DOM text evaluation rather than Puppeteer's unsupported selector extension if necessary.

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --test tests/tools/satellite-state.test.js`

Expected: FAIL because links are still version 1 and retain `mode`.

- [ ] **Step 3: Implement version-2 encoding and version-1 decoding**

Encode `{ slug, values }` under `v=2`. Decode both versions. For an orbit version-1 payload, convert an allowed finite legacy `mu` to `muKm3S2 = mu / 1e9`; do not retain the legacy key. Return no mutable convention from version 2.

- [ ] **Step 4: Remove both dropdowns and stateful convention**

Delete `routeForTool`, the `toolNav` JSX, and the `mode` state setter. Define:

```js
const CALCULATION_MODE = "engineering";
```

Pass that constant to `constants`, `calculate`, print output, save history, and diagrams. New share links call `encodeProblem(slug, normalized)` with no mode. Old decoded mode values are ignored.

- [ ] **Step 5: Run state and source-level browser contracts**

Run: `node --test tests/tools/satellite-state.test.js tests/tools/satellite-inputs.test.js`

Expected: PASS.

- [ ] **Step 6: Commit navigation and state migration**

```bash
git add lib/tools/satellite/state.js components/tools/satellite/SatelliteWorkspace.jsx tests/tools/satellite-state.test.js tests/tools/satellite-browser.test.js
git commit -m "fix: simplify satellite calculator controls"
```

### Task 3: Pure orbital instrument view model

**Files:**
- Modify: `lib/tools/satellite/visuals.js`
- Modify: `tests/tools/satellite-visuals.test.js`

**Interfaces:**
- Consumes: `{ eccentricity, semiMajorAxisM, earthRadiusM, periodS, muKm3S2, fraction }`.
- Produces: `orbitInstrumentState(input)` returning `{ position, radiusKm, altitudeKm, speedKmS, elapsedS, perigeeKm, apogeeKm, velocityDirection, activeSweep, comparisonSweeps }`.

- [ ] **Step 1: Write failing geometry tests**

Add tests for `e=0.5` at fractions `0`, `0.25`, and `0.5` that verify:

```js
assert.equal(perigee.radiusKm, 3700);
assert.equal(apogee.radiusKm, 11100);
assert.equal(perigee.elapsedS, 0);
assert.equal(apogee.elapsedS, periodS / 2);
assert.ok(perigee.speedKmS > apogee.speedKmS);
assert.ok(Math.abs(Math.hypot(...perigee.velocityDirection) - 1) < 1e-12);
assert.ok(Math.abs(area(perigee.comparisonSweeps[0]) - area(perigee.comparisonSweeps[1])) < 1e-5);
```

Also test fraction wrapping (`1` maps to the start point) and circular-orbit altitude.

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --test tests/tools/satellite-visuals.test.js`

Expected: FAIL because `orbitInstrumentState` is not exported.

- [ ] **Step 3: Implement the pure view model**

Reuse `orbitPosition()` and `orbitSweep()`. Calculate speed using vis-viva in kilometre units:

```js
const speedKmS = Math.sqrt(muKm3S2 * (2 / radiusKm - 1 / semiMajorAxisKm));
```

Derive the tangent from eccentric-anomaly derivatives, normalize it with `Math.hypot`, and keep SVG projection out of the pure state object.

- [ ] **Step 4: Run the geometry suite and confirm GREEN**

Run: `node --test tests/tools/satellite-visuals.test.js`

Expected: PASS.

- [ ] **Step 5: Commit the view model**

```bash
git add lib/tools/satellite/visuals.js tests/tools/satellite-visuals.test.js
git commit -m "feat: model interactive orbit instrument"
```

### Task 4: Accessible SVG orbital instrument

**Files:**
- Create: `components/tools/satellite/OrbitInstrument.jsx`
- Modify: `components/tools/satellite/SatelliteLivePlots.jsx`
- Modify: `components/tools/satellite/SatelliteDiagrams.jsx`
- Modify: `components/tools/satellite/SatelliteWorkspace.module.css`
- Modify: `tests/tools/satellite-orbit-hydration-browser.test.js`

**Interfaces:**
- Consumes: `<OrbitInstrument values={values} results={results} />` and `orbitInstrumentState()`.
- Produces: `[data-orbit-instrument]`, `[data-orbit-satellite]`, `[data-orbit-play]`, `[data-orbit-reset]`, `[data-orbit-metrics]`, and the existing `[data-equal-area-sector]` hooks.

- [ ] **Step 1: Write failing browser assertions**

Extend the hydration test to require the new hooks, click play, wait for a changed slider value, click pause, reset to zero, and assert the metric rail includes `km`, `km/s`, and elapsed time. Emulate reduced motion before navigation and assert the play button is disabled or reports that animation is unavailable.

- [ ] **Step 2: Run the browser test and confirm RED**

Start the app with `npm run dev`, then run:

`node --test tests/tools/satellite-orbit-hydration-browser.test.js`

Expected: FAIL because the instrument controls do not exist.

- [ ] **Step 3: Build `OrbitInstrument.jsx`**

Use `useEffect`, `useRef`, and `requestAnimationFrame`. Advance fraction from elapsed wall time divided by `periodS`, cap display animation to a readable visual cycle, and cancel the frame on pause, invalid inputs, unmount, or reduced motion. Keep the range input authoritative so arrow keys work without custom keyboard handlers.

Render one SVG with:

- ellipse, occupied and empty foci;
- scaled Earth plus an explicit `not to scale` inset label only when minimum marker enlargement is applied;
- apogee/perigee markers and dimension lines;
- live radius and tangent velocity vector;
- current and comparison equal-time sectors;
- `<title>` and `<desc>` containing the current numerical state.

Place changing text in a sibling metric rail with `aria-live="polite"`, not in dozens of SVG text nodes.

- [ ] **Step 4: Add design-system CSS**

Add focused classes for `.orbitInstrument`, `.orbitCanvas`, `.orbitMetrics`, `.orbitControls`, `.orbitLegend`, and `.orbitStatus`. Derive every color from `--signal`, `--instrument`, `--ink`, `--muted`, `--rule`, and the existing gold. At `max-width: 700px`, stack the metric rail and controls without forcing the SVG above the viewport width.

- [ ] **Step 5: Remove the old `OrbitPlot` implementation and route the new component**

Delete only the orbit-specific component from `SatelliteLivePlots.jsx`; preserve antenna, coverage, look-angle, and TDMA plots. Import `OrbitInstrument` in `SatelliteDiagrams.jsx`; continue routing coverage and vis-viva states to their appropriate explanatory views.

- [ ] **Step 6: Run focused unit and browser tests**

Run:

```bash
node --test tests/tools/satellite-visuals.test.js tests/tools/satellite-orbit-hydration-browser.test.js
```

Expected: PASS with no hydration errors and finite SVG attributes.

- [ ] **Step 7: Commit the instrument**

```bash
git add components/tools/satellite/OrbitInstrument.jsx components/tools/satellite/SatelliteLivePlots.jsx components/tools/satellite/SatelliteDiagrams.jsx components/tools/satellite/SatelliteWorkspace.module.css tests/tools/satellite-orbit-hydration-browser.test.js
git commit -m "feat: add interactive orbital instrument"
```

### Task 5: Responsive verification and satellite regression gate

**Files:**
- Modify: `tests/tools/satellite-browser.test.js`
- Modify if a verified layout defect exists: `components/tools/satellite/SatelliteWorkspace.module.css`

**Interfaces:**
- Consumes: completed satellite interface.
- Produces: browser evidence at 390px and 1440px in dark and light themes, plus a complete passing satellite test set.

- [ ] **Step 1: Extend responsive assertions**

At `/tools/satellite/orbit/`, assert the instrument, metric rail, range control, play, and reset controls remain within the document width at `320`, `390`, `768`, `1440`, and `1920` pixels. Assert both removed dropdown texts are absent.

- [ ] **Step 2: Run all satellite and RF tests**

Run: `node --test tests/tools/satellite-*.test.js tests/tools/rf-*.test.js`

Expected: PASS.

- [ ] **Step 3: Capture visual evidence**

Use the existing Puppeteer screenshot path under `test-results/satellite/` for dark/light screenshots at 390px and 1440px. Inspect focus visibility, label collisions, theme contrast, and overflow.

- [ ] **Step 4: Apply only evidence-backed CSS corrections**

Limit any correction to the new orbit classes. Re-run Task 5 Steps 2–3 after each correction.

- [ ] **Step 5: Commit the regression gate**

```bash
git add tests/tools/satellite-browser.test.js components/tools/satellite/SatelliteWorkspace.module.css
git commit -m "test: verify satellite orbit experience"
```

