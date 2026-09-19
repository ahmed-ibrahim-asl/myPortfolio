import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("shared site actions use the approved concise labels", () => {
  const header = readFileSync("components/SiteHeader.tsx", "utf8");
  const footer = readFileSync("components/SiteFooter.tsx", "utf8");
  // The English and Arabic home pages now share components/HomePageView.tsx
  // (locale-parameterized) instead of each having its own duplicated markup,
  // so that is where the CTA copy actually lives.
  const home = readFileSync("components/HomePageView.tsx", "utf8");
  assert.match(header, /dictionary\.nav\.contact/);
  assert.match(footer, /dictionary\.actions\.sendBrief/);
  assert.match(footer, /dictionary\.actions\.email/);
  assert.match(home, /dictionary\.actions\.viewProjects/);
  assert.match(home, /dictionary\.actions\.exploreTools/);
});

test("mobile actions keep readable type and touch heights", () => {
  const css = `${readFileSync("app/globals.css", "utf8")}\n${readFileSync("app/home-grid.css", "utf8")}`;
  assert.match(css, /--action-font-size:\s*14px/);
  assert.match(css, /--action-min-height:\s*44px/);
  assert.match(css, /--action-primary-height:\s*48px/);
  assert.doesNotMatch(css, /\.home-actions a[^}]*font-size:\s*clamp\(\.62rem/i);
});
