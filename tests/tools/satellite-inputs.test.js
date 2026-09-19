import test from "node:test";
import assert from "node:assert/strict";
import { satelliteInputs, initialValues, visibleFields } from "../../data/satellite-inputs.js";
import { calculate, noiseFigure } from "../../lib/tools/satellite/engine.js";
const value = (c, key) => c.results.find((r) => r.key === key)?.value;
for (const [slug, config] of Object.entries(satelliteInputs)) {
  test(`${slug}: defaults and all complete presets calculate in both constant modes`, () => {
    for (const mode of ["course", "engineering"]) {
      const base = initialValues(slug);
      const defaults = calculate(slug, base, mode);
      assert.ok(defaults.results.length);
      assert.ok(
        defaults.results.every((r) => typeof r.symbol === "string" && r.symbol.length > 0),
        `${slug} result symbols`
      );
      for (const preset of config.presets) {
        const c = calculate(slug, { ...initialValues(slug), ...preset.values }, mode);
        assert.ok(
          c.results.every((r) => Number.isFinite(r.value)),
          preset.name
        );
      }
    }
  });
  test(`${slug}: every selectable calculator submode has usable default values`, () => {
    const selector = config.fields.find((f) => f.key.endsWith("Mode"));
    if (!selector) return;
    for (const [mode] of selector.options) {
      const values = { ...initialValues(slug), [selector.key]: mode };
      const c = calculate(slug, values);
      assert.ok(c.results.length, mode);
      assert.ok(
        c.results.every((r) => r.symbol),
        `${slug}/${mode} result symbols`
      );
      assert.ok(visibleFields(slug, values).length, mode);
    }
  });
}
test("NF convention directly selects input even when hidden defaults remain", () => {
  const base = initialValues("noise-gt");
  const factor = calculate("noise-gt", {
    ...base,
    noiseMode: "nf",
    nfInput: "factor",
    noiseFactor: 2
  });
  assert.equal(value(factor, "equivalentTemperatureK"), 290);
  const te = calculate("noise-gt", {
    ...base,
    noiseMode: "nf",
    nfInput: "te",
    addedTemperatureK: 580
  });
  assert.equal(value(te, "noiseFactor"), 3);
  assert.equal(
    value(te, "noiseFigureDb"),
    noiseFigure({ equivalentTemperatureK: 580 }).noiseFigureDb
  );
});
test("Walsh family example is labelled conceptual and has coherent numerical outputs", () => {
  const c = calculate("multiple-access", {
    ...initialValues("multiple-access"),
    accessMode: "cdma"
  });
  assert.equal(value(c, "idealOrthogonalCodes"), 64);
  assert.equal(value(c, "spreadingFactor"), 64);
  assert.ok(Math.abs(value(c, "processingGainDb") - 18.0617997398) < 1e-8);
  assert.ok(c.warnings.some((w) => w.includes("not a satellite RF user-capacity")));
  assert.throws(() => calculate("multiple-access", { accessMode: "cdma", codeLength: 63 }));
});
test("mode visibility excludes irrelevant controls and retains NF reference convention", () => {
  const keys = (slug, values) =>
    visibleFields(slug, { ...initialValues(slug), ...values }).map((f) => f.key);
  assert.deepEqual(keys("noise-gt", { noiseMode: "density" }), ["noiseMode", "temperatureK"]);
  assert.deepEqual(keys("noise-gt", { noiseMode: "cascade" }), [
    "noiseMode",
    "referenceTemperatureK"
  ]);
  assert.ok(keys("noise-gt", { noiseMode: "nf" }).includes("referenceTemperatureK"));
  assert.ok(!keys("multiple-access", { accessMode: "cdma" }).includes("bitRate"));
  assert.ok(!keys("orbit", { orbitMode: "vis-viva" }).includes("altitudeM"));
  assert.ok(!keys("power-lifetime", { powerMode: "total" }).includes("degradationPerYear"));
  assert.ok(!keys("power-lifetime", { powerMode: "annual" }).includes("degradationFraction"));
  assert.deepEqual(keys("link-budget", { linkMode: "course-ft" }), ["linkMode"]);
});
test("nested initial values are independent between calculator resets", () => {
  const a = initialValues("link-budget"),
    b = initialValues("link-budget");
  a.uplink.powerW = 1;
  assert.equal(b.uplink.powerW, 100);
  const c = initialValues("noise-gt"),
    d = initialValues("noise-gt");
  c.stages[0].gainDb = 1;
  assert.equal(d.stages[0].gainDb, 20);
});
test("PFD receive inputs do not expose unrelated transmitter defaults", () => {
  const keys = visibleFields("rf-path", { rfMode: "pfd-receive" }).map((f) => f.key);
  assert.deepEqual(keys, ["rfMode", "fluxDensityWm2", "effectiveApertureM2", "receiveLossDb"]);
  const base = initialValues("rf-path");
  for (const preset of satelliteInputs["rf-path"].presets) {
    const v = { ...base, rfMode: "pfd-receive", ...preset.values };
    assert.ok(calculate("rf-path", v).results.length);
    assert.ok(preset.values.rfMode, "Preset must select its applicable mode");
  }
});

test("every selectable calculator mode prints explicit worked substitutions", () => {
  const fallbackSteps = [];
  for (const [slug, config] of Object.entries(satelliteInputs)) {
    const selector = config.fields.find((field) => field.key.endsWith("Mode"));
    const modes = selector ? selector.options.map(([mode]) => mode) : [undefined];
    for (const selectedMode of modes) {
      const values = initialValues(slug);
      if (selector) values[selector.key] = selectedMode;
      const calculation = calculate(slug, values);
      for (const step of calculation.steps.slice(1)) {
        if (/[{}]|undefined|\[object Object\]/.test(step.substitution))
          fallbackSteps.push(`${slug}/${selectedMode ?? "default"}: ${step.title}`);
      }
    }
  }
  assert.deepEqual(fallbackSteps, []);
});
