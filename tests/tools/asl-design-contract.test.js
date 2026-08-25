import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("ASL tokens, fonts, and responsive safeguards are loaded globally", () => {
  const layout = read("app/layout.tsx");
  const theme = read("app/asl-theme.css");

  assert.match(layout, /import "\.\/asl-theme\.css"/);
  assert.match(layout, /import "\.\/asl-tools\.css"/);

  for (const value of ["#0B0D11", "#D9A441", "Archivo", "Space Mono", "Aref Ruqaa"]) {
    assert.ok(theme.includes(value), `missing ${value}`);
  }

  assert.match(theme, /prefers-reduced-motion:\s*reduce/);
  assert.match(theme, /min-(?:width|height):\s*44px/);
});

test("the global shell uses ASL identity without HUD navigation", () => {
  const header = read("components/SiteHeader.tsx");
  const footer = read("components/SiteFooter.tsx");

  assert.match(header, /AslLogo/);
  assert.doesNotMatch(header, /SystemHud/);
  assert.match(header, /header-contact/);
  assert.match(footer, /form="paired"/);
});

test("home follows the ASL fault-line composition", () => {
  const home = read("app/page.tsx");

  assert.match(home, /className="asl-hero/);
  assert.match(home, /className="asl-watermark"/);
  assert.match(home, /<AslSection index="0[2-8]"/);
  assert.doesNotMatch(home, /PixelWorld|SystemHud|data-text=/);
  for (const label of ["Calculate", "Generate", "Simulate", "Plan"]) {
    assert.ok(home.includes(`label: "${label}"`));
  }
});

test("primary routes declare their ASL page modes", () => {
  const expected = new Map([
    ["app/work/page.tsx", "asl-work-log"],
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

test("tools use task groups and the shared ASL workbench shell", () => {
  const index = read("app/tools/page.tsx");
  const calculatorShell = read("components/tools/CalculatorShell.js");
  const toolShell = read("components/tools/ToolShell.tsx");

  for (const label of ["Calculate", "Generate", "Simulate", "Plan", "Investigate"]) {
    assert.match(index, new RegExp(label), `missing ${label} task group`);
  }

  assert.match(calculatorShell, /asl-calculator-shell/);
  assert.match(toolShell, /asl-workbench-shell/);
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
