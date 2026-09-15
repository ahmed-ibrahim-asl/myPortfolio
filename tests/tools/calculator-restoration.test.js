import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";

const catalogUrl = new URL("../../data/calculators.js", import.meta.url);
const designCatalogUrl = new URL("../../data/design-tools.js", import.meta.url);
const registryUrl = new URL("../../components/tools/calculators/index.js", import.meta.url);
const visualRegistryUrl = new URL("../../data/calculator-visuals.js", import.meta.url);

test("all completed calculators and custom design tools are present", async () => {
  assert.equal(existsSync(catalogUrl), true, "calculator catalog must be restored");
  assert.equal(existsSync(registryUrl), true, "calculator component registry must be restored");

  const { calculators } = await import(catalogUrl.href);
  const { designTools } = await import(designCatalogUrl.href);
  const registrySource = readFileSync(registryUrl, "utf8");
  const componentFiles = (
    await readdir(new URL("../../components/tools/calculators/", import.meta.url))
  ).filter((name) => name.endsWith(".js") && name !== "index.js");

  assert.equal(calculators.length, componentFiles.length + designTools.length);
  assert.equal(new Set(calculators.map(({ slug }) => slug)).size, calculators.length);
  assert.equal(componentFiles.length, 36);
  for (const { slug } of calculators.filter(({ custom }) => !custom)) {
    assert.match(registrySource, new RegExp(`[\"]${slug}[\"]\\s*:`), `${slug} must be registered`);
  }
});

test("every calculator resolves to its own supported visual contract", async () => {
  const { calculators, calculatorCategories } = await import(catalogUrl.href);
  const visualRegistryExists = existsSync(visualRegistryUrl);

  assert.equal(visualRegistryExists, true, "calculator visual registry must exist");
  if (!visualRegistryExists) return;

  const { calculatorVisuals } = await import(visualRegistryUrl.href);

  assert.deepEqual(calculatorCategories, [
    "Fundamentals",
    "Resistors",
    "Circuit Design",
    "Control Design",
    "Power Conversion & Supplies",
    "Text & Encoding",
    "Conversions",
    "Number Systems",
    "Physics & Math"
  ]);
  assert.ok(calculators.every(({ slug, visualKey }) => visualKey === slug));
  assert.deepEqual(
    Object.keys(calculatorVisuals).sort(),
    calculators.map(({ slug }) => slug).sort()
  );
});

test("calculator search matches useful metadata and related results exclude the active tool", async () => {
  const [{ calculators }, search] = await Promise.all([
    import(catalogUrl.href),
    import(new URL("../../lib/tools/calculator-search.js", import.meta.url).href)
  ]);

  assert.deepEqual(
    search.filterCalculators(calculators, { query: "current limiting", category: "All" })
      .map(({ slug }) => slug),
    ["led-series-resistor-calculator"]
  );
  assert.ok(
    search.filterCalculators(calculators, { query: "", category: "Number Systems" })
      .every(({ category }) => category === "Number Systems")
  );

  const related = search.getRelatedCalculators(
    calculators,
    "ohms-law-calculator",
    6
  );
  assert.equal(related.length, 6);
  assert.ok(related.every(({ slug }) => slug !== "ohms-law-calculator"));
  assert.equal(related[0].category, "Fundamentals");
});

test("restored utility modules retain representative behavior", async () => {
  const unitsUrl = new URL("../../lib/units.js", import.meta.url);
  const resistorUrl = new URL("../../lib/resistorColors.js", import.meta.url);
  const numbersUrl = new URL("../../lib/numberSystems.js", import.meta.url);
  assert.equal(existsSync(unitsUrl), true);
  assert.equal(existsSync(resistorUrl), true);
  assert.equal(existsSync(numbersUrl), true);

  const [{ formatEngineering }, { formatOhms }, numbers] = await Promise.all([
    import(unitsUrl.href),
    import(resistorUrl.href),
    import(numbersUrl.href)
  ]);
  assert.equal(formatEngineering(0.000001, "F"), "1 µF");
  assert.equal(formatOhms(4700), "4.7 kΩ");
  assert.equal(numbers.toBinaryString(10, 8), "00001010");
  assert.equal(numbers.twosComplement(1, 8), 255);
  assert.equal(numbers.asciiToHex("Hi"), "48 69");
  assert.equal(numbers.hexToAscii("48 69"), "Hi");
  assert.equal(numbers.hexToAscii("4869"), "Hi");
  assert.equal(numbers.parseInBase("102", 2), null);
  assert.equal(numbers.parseInBase("1G", 16), null);
  assert.equal(numbers.parseInBase("-2A", 16), -42);
  assert.equal(numbers.hexToAscii("4"), null);
  assert.equal(numbers.hexToAscii("48 6G"), null);
  assert.equal(numbers.shiftValue(5, 8, 7, "left"), 128);
  assert.equal(numbers.shiftValue(5, 8, 8, "left"), 0);
  assert.equal(numbers.shiftValue(5, 8, 32, "left"), 0);
  assert.equal(numbers.shiftValue(5, 8, 33, "right"), 0);
});

test("shared calculator controls expose accessible result and selection semantics", () => {
  const ui = readFileSync(
    new URL("../../components/tools/CalculatorUI.js", import.meta.url),
    "utf8"
  );
  const index = readFileSync(
    new URL("../../components/tools/ToolsIndex.js", import.meta.url),
    "utf8"
  );

  assert.match(ui, /className="calculator-results"[^>]*aria-live="polite"/);
  assert.match(ui, /role="group" aria-label=\{label\}/);
  assert.doesNotMatch(ui, /role="listbox"/);
  assert.match(index, /aria-pressed=\{category === item\}/);
});

test("the Tools hub reveals focused category destinations before individual tools", () => {
  const hub = readFileSync(new URL("../../app/tools/page.tsx", import.meta.url), "utf8");
  const catalog = readFileSync(
    new URL("../../components/tools/UnifiedToolsIndex.tsx", import.meta.url),
    "utf8"
  );
  assert.match(hub, /engineeringTools/);
  assert.match(hub, /getAllTools/);
  assert.match(hub, /ToolsCategoryHub/);
  assert.doesNotMatch(hub, /UnifiedToolsIndex/);
  assert.match(catalog, /data-unified-tools-catalog/);
  assert.match(catalog, /lockedItems/);
  assert.match(catalog, /filterToolItems/);
  assert.doesNotMatch(hub, /id="calculators"|id="advanced-tools"/);
});

test("the calculator route statically generates catalog slugs", () => {
  const routeUrl = new URL("../../app/tools/[slug]/page.js", import.meta.url);
  assert.equal(existsSync(routeUrl), true, "dynamic calculator route must exist");
  const route = readFileSync(routeUrl, "utf8");
  assert.match(route, /generateStaticParams/);
  assert.match(route, /dynamicParams\s*=\s*false/);
  assert.match(route, /CALCULATOR_COMPONENTS\[tool\.slug\]/);
  assert.match(route, /if \(!Calculator\) notFound\(\)/);
});
