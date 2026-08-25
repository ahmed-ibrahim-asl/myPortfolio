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
