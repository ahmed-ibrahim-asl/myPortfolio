import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portfolioSource = readFileSync("data/portfolio.ts", "utf8");
const projectBlock = portfolioSource.slice(
  portfolioSource.indexOf('slug: "multi-mcu-security-lock"'),
  portfolioSource.indexOf('slug: "megasumo-autonomous-robot"')
);

test("Multi-MCU Security Lock uses an authored architecture SVG", () => {
  assert.match(projectBlock, /image: asset\("\/media\/portfolio\/multi-mcu-security-lock-architecture\.svg"\)/);
  const svg = readFileSync("public/media/portfolio/multi-mcu-security-lock-architecture.svg", "utf8");
  for (const label of ["HMI MCU", "CONTROL MCU", "AUTHENTICATED UART", "KEYPAD", "DISPLAY", "EEPROM", "ALARM", "MOTOR DRIVER", "LOCK ACTUATOR", "TRUST BOUNDARY"]) {
    assert.match(svg, new RegExp(label));
  }
  assert.doesNotMatch(svg, /<image\b|data:image|\.png|\.webp|\.jpe?g/i);
});

test("original Proteus evidence remains in the project gallery", () => {
  assert.equal((projectBlock.match(/Original Proteus simulation/g) ?? []).length, 2);
  assert.match(projectBlock, /lock-running\.png/);
  assert.match(projectBlock, /lock-password\.png/);
});
