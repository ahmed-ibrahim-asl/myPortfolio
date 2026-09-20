import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { calculators } from "../../data/calculators.js";
import { engineeringTools } from "../../data/tools.js";

const read = (path) => readFileSync(path, "utf8");

const assertToolCover = (id, expectedPath) => {
  const tool = engineeringTools.find((item) => item.id === id);
  assert.ok(tool, `${id} is missing from the engineering tool catalog`);
  assert.equal(tool.coverImage, expectedPath);
  assert.ok(existsSync(`public${expectedPath}`), `missing approved cover: public${expectedPath}`);
};

test("ASL tokens, fonts, and responsive safeguards are loaded globally", () => {
  const layout = read("app/layout.tsx");
  const theme = read("app/asl-theme.css");
  const colors = read("app/design-tokens/colors.css");
  const fonts = read("app/design-tokens/fonts.css");

  assert.match(layout, /import "\.\/design-tokens\/colors\.css"/);
  assert.match(layout, /import "\.\/design-tokens\/fonts\.css"/);
  assert.match(layout, /import "\.\/asl-theme\.css"/);
  assert.match(layout, /import "\.\/asl-tools\.css"/);

  for (const value of ["#0B0D11", "#D9A441"]) {
    assert.ok(colors.includes(value), `missing ${value}`);
  }
  for (const value of ["Archivo", "Space Mono", "Aref Ruqaa"]) {
    assert.ok(fonts.includes(value), `missing ${value}`);
  }
  assert.match(theme, /--asl-page:\s*var\(--bg-page\)/);
  assert.match(theme, /--asl-gold:\s*var\(--gold-500\)/);

  assert.match(theme, /prefers-reduced-motion:\s*reduce/);
  assert.match(theme, /min-(?:width|height):\s*44px/);
});

test("the global shell uses the bilingual ASL identity without HUD navigation", () => {
  const header = read("components/SiteHeader.tsx");
  const footer = read("components/SiteFooter.tsx");

  assert.match(header, /brand-latin/);
  assert.match(header, /brand-arabic/);
  assert.match(header, /AGENT \/ 101/);
  assert.doesNotMatch(header, /SystemHud/);
  assert.doesNotMatch(header, /GridToggle|grid-toggle-button/);
  assert.match(header, /header-contact/);
  assert.match(header, /getDictionary/);
  assert.match(header, /LanguageSwitch/);
  assert.match(header, /dictionary\.nav\.home/);
  assert.doesNotMatch(header, /label: "Prompts"/);
  assert.ok(
    header.indexOf("dictionary.nav.home") < header.indexOf("dictionary.nav.work"),
    "Home must be the first primary navigation destination"
  );
  assert.match(footer, /footer-signature/);
  assert.match(footer, /بشمهندس عسل/);
});

test("teaching and publication records use the approved public identity and course facts", () => {
  const portfolio = read("data/portfolio.ts");
  const publications = read("data/publications.json");
  const types = read("types/portfolio.ts");

  assert.match(types, /export interface Course/);
  assert.match(portfolio, /export const coursesTaught:\s*Course\[\]/);
  assert.match(portfolio, /title:\s*"Analog Communication"/);
  assert.match(portfolio, /practical MATLAB/i);
  assert.match(portfolio, /title:\s*"MATLAB Onramp"/);
  assert.match(portfolio, /youtube\.com\/playlist\?list=PLYt83m8l2mixe_1k4BWNVCg0HXdYx6BPw/);
  assert.doesNotMatch(publications, /AIME Asl|AI Asl/);
  assert.match(publications, /Ahmed Ibrahim Asl/);
});

test("Sensor Code Generator uses the approved configurable embedded-workbench cover", () => {
  assertToolCover("sensor-code-generator", "/media/tools/tool-sensor-code-generator-v4.png");
});

test("AI Script Generator uses the approved configurable ML workflow cover", () => {
  assertToolCover("ai-script-generator", "/media/tools/tool-ai-script-generator-v4.png");
});

test("Security Mission uses the approved tool configuration cover", () => {
  assertToolCover("security-command-builder", "/media/tools/tool-security-mission-v4.png");
});

test("Interactive PID Simulator uses the approved simplified tuning cover", () => {
  assertToolCover("pid-simulator", "/media/tools/tool-pid-simulator-v4.png");
});

test("every raster-cover workbench has a generated cover with its reproducible prompt", () => {
  const generatedCoverTools = engineeringTools.filter((tool) => tool.coverImage.endsWith(".png"));
  assert.equal(generatedCoverTools.length, 6);
  assert.equal(new Set(generatedCoverTools.map((tool) => tool.coverImage)).size, 6);

  const promptManifestPath = "docs/assets/tool-cover-prompts.md";
  assert.ok(existsSync(promptManifestPath), "missing the workbench cover prompt manifest");
  const promptManifest = read(promptManifestPath);

  for (const tool of generatedCoverTools) {
    const assetPath = `public${tool.coverImage}`;
    assert.ok(existsSync(assetPath), `missing generated workbench cover: ${assetPath}`);
    assert.match(
      promptManifest,
      new RegExp(tool.coverImage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    );
  }
});

test("home follows the approved editorial instrument composition", () => {
  // English and Arabic home pages share components/HomePageView.tsx instead of
  // each duplicating the section markup, so that is where this composition lives.
  const home = read("components/HomePageView.tsx");

  assert.match(home, /className="home-hero shell"/);
  assert.match(home, /className="home-title-ar\b/);
  assert.match(home, /className="portrait-instrument"/);
  assert.match(home, /className="project-ledger"/);
  assert.match(home, /className="tool-ledger"/);
  assert.match(home, /className="brain-grid"/);
  assert.doesNotMatch(home, /PixelWorld|SystemHud|data-text=/);
  // The hero headline copy itself now lives in the i18n dictionary, not inline in the component.
  const dictionaries = read("lib/i18n/dictionaries.ts");
  assert.match(dictionaries, /Break the problem/);
  assert.match(dictionaries, /فكّك المشكلة/);
});

test("primary routes declare their ASL page modes", () => {
  const expected = new Map([
    ["app/about/page.tsx", "asl-about-trace"],
    ["app/writing/page.tsx", "asl-field-notes"],
    ["app/contact/page.tsx", "asl-brief"]
  ]);

  for (const [file, className] of expected) {
    assert.ok(read(file).includes(className), `${file} is missing ${className}`);
  }

  assert.doesNotMatch(read("app/writing/page.tsx"), /WorldGallery/);
  assert.match(read("app/writing/[slug]/page.tsx"), /asl-article/);
});

test("tools use a category-first hub and searchable category shelves", () => {
  const index = read("app/tools/page.tsx");
  const catalog = read("components/tools/UnifiedToolsIndex.tsx");
  const calculatorShell = read("components/tools/CalculatorShell.js");
  const toolShell = read("components/tools/ToolShell.tsx");

  assert.match(index, /ToolsCategoryHub/);
  assert.doesNotMatch(index, /UnifiedToolsIndex/);
  assert.doesNotMatch(index, /asl-task-index|tools-scroll-cue|asl-workbench-groups/);
  assert.match(catalog, /type="search"/);
  assert.match(catalog, /lockedItems/);
  assert.match(catalog, /filterToolItems/);
  assert.match(catalog, /calculator-catalog-card/);
  assert.match(
    catalog,
    /className="writing-tools unified-tools-controls"\s+suppressHydrationWarning/,
    "the tool search controls should tolerate password-manager attributes injected before hydration"
  );

  assert.match(calculatorShell, /asl-calculator-shell/);
  assert.match(toolShell, /asl-workbench-shell/);
});

test("every calculator has one purpose-specific visual contract", async () => {
  const visualModule = await import("../../data/calculator-visuals.js").catch(() => ({
    calculatorVisuals: {}
  }));
  const calculatorVisuals = visualModule.calculatorVisuals;
  const calculatorSlugs = calculators.map((tool) => tool.slug).sort();

  assert.deepEqual(Object.keys(calculatorVisuals).sort(), calculatorSlugs);
  assert.equal(new Set(calculators.map((tool) => tool.visualKey)).size, calculators.length);

  for (const tool of calculators) {
    const visual = calculatorVisuals[tool.slug];
    assert.ok(visual?.kind, `${tool.slug} is missing a visual kind`);
    assert.ok(visual?.ariaLabel, `${tool.slug} is missing an accessible visual explanation`);
  }
});

test("the approved 5-band resistor cover uses its generated raster evidence", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["5-band-resistor-color-code-calculator"];
  const thumbnail = read("components/tools/CalculatorThumbnail.js");

  assert.equal(visual.image, "/media/tools/variations/five-band-precision-resistor-desktop-v1.png");
  assert.ok(
    existsSync("public/media/tools/variations/five-band-precision-resistor-desktop-v1.png"),
    "the approved 5-band resistor raster is missing"
  );
  assert.match(thumbnail, /visual\.image/);
  assert.match(thumbnail, /calculator-thumbnail-image/);
});

test("the approved 4-band resistor cover uses its generated raster evidence", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["resistor-color-code-calculator"];
  const thumbnail = read("components/tools/CalculatorThumbnail.js");

  assert.equal(visual.image, "/media/tools/variations/four-band-resistor-desktop-v1.png");
  assert.ok(
    existsSync("public/media/tools/variations/four-band-resistor-desktop-v1.png"),
    "the approved 4-band resistor raster is missing"
  );
  assert.match(thumbnail, /visual\.image/);
  assert.match(thumbnail, /calculator-thumbnail-image/);
});

test("the approved Ohm's law cover uses its generated physical measurement evidence", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["ohms-law-calculator"];

  assert.equal(visual.image, "/media/calculators/ohms-law-physical-measurement-v1.png");
  assert.ok(
    existsSync("public/media/calculators/ohms-law-physical-measurement-v1.png"),
    "the approved Ohm's law raster is missing"
  );
  assert.match(visual.ariaLabel, /20 volt DC/i);
});

test("the approved series-resistor cover uses one physical current path", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["series-resistor-calculator"];

  assert.equal(visual.image, "/media/tools/variations/series-resistors-desktop-v1.png");
  assert.ok(
    existsSync("public/media/tools/variations/series-resistors-desktop-v1.png"),
    "the approved series-resistor raster is missing"
  );
  assert.match(visual.ariaLabel, /1 kiloohm.*2\.2 kiloohm.*4\.7 kiloohm/i);
});

test("the approved parallel-resistor cover uses three branches across two shared nodes", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["parallel-resistor-calculator"];

  assert.equal(visual.image, "/media/tools/variations/parallel-resistors-desktop-v1.png");
  assert.ok(
    existsSync("public/media/tools/variations/parallel-resistors-desktop-v1.png"),
    "the approved parallel-resistor raster is missing"
  );
  assert.match(visual.ariaLabel, /three parallel branches.*600 ohms/i);
});

test("the approved voltage-divider cover uses one closed source-to-ground series path", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["voltage-divider-calculator"];

  assert.equal(visual.image, "/media/tools/variations/voltage-divider-desktop-v1.png");
  assert.ok(
    existsSync("public/media/tools/variations/voltage-divider-desktop-v1.png"),
    "the approved voltage-divider raster is missing"
  );
  assert.match(visual.ariaLabel, /9 volt.*R1.*Vout.*R2.*negative/i);
});

test("the approved RC time-constant cover pairs a schematic RC path with its charge curve", async () => {
  const { calculatorVisuals } = await import("../../data/calculator-visuals.js");
  const visual = calculatorVisuals["rc-time-constant-calculator"];

  assert.equal(visual.image, "/media/calculators/rc-time-constant-no-scales-v3.png");
  assert.ok(
    existsSync("public/media/calculators/rc-time-constant-no-scales-v3.png"),
    "the approved RC time-constant raster is missing"
  );
  assert.match(visual.ariaLabel, /schematic resistor.*polarized capacitor.*63\.2.*99\.3/i);
});

test("the ASL tool surfaces contain no decorative Arabic watermark", () => {
  const toolsTheme = read("app/asl-tools.css");

  assert.doesNotMatch(toolsTheme, /content:\s*["']عسل["']/);
  assert.doesNotMatch(toolsTheme, /asl-tools-header::after/);
});

test("one Windows launcher starts only the local portfolio server", () => {
  const launchers = readdirSync(".").filter((name) => name.toLowerCase().endsWith(".bat"));
  const launcher = read("start.bat");
  const startScript = read("scripts/start-local.ps1");

  assert.deepEqual(launchers, ["start.bat"]);
  assert.match(launcher, /scripts\\start-local\.ps1/i);
  assert.match(startScript, /localhost:3000/i);
  assert.match(startScript, /node_modules\\next\\dist\\bin\\next/);
  assert.match(startScript, /'dev',\s*'--hostname',\s*'127\.0\.0\.1',\s*'--port',\s*'3000'/);
  assert.doesNotMatch(launcher, /set\s+\/p|RUN_STUDIO|RUN_BUILD|test:auto/i);
  assert.doesNotMatch(startScript, /RUN_STUDIO|RUN_BUILD|test:auto/i);
});

test("advanced workbenches expose ASL instrument modes", () => {
  const sources = {
    "components/tools/model-mission/ModelMissionShell.tsx": "asl-model-mission-shell",
    "components/tools/security-mission/SecurityMissionShell.tsx": "asl-security-mission-shell",
    "app/tools/sensor-code-generator/page.tsx": "embedded-workbench",
    "app/tools/pid-simulator/page.tsx": "pid-simulator",
    "app/tools/battery-estimator/page.tsx": "battery-estimator"
  };

  for (const [file, marker] of Object.entries(sources)) {
    assert.match(read(file), new RegExp(marker), `${file} is missing ${marker}`);
  }
});
