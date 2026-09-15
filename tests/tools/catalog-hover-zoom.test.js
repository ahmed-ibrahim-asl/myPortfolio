import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Guards the restrained hover/focus zoom on tool evidence in the unified catalog (home/tools
// evidence design spec). The card frame must clip a ~5% enlargement on :hover/:focus-visible/
// :focus-within, gated so a touch tap never "sticks" as a permanent hover, and reduced-motion
// visitors still get the enlarged state without an animated transition.

test("tool catalog covers scale on hover/focus and are clipped by their frame", () => {
  const css = readFileSync("app/asl-tools.css", "utf8");

  assert.match(css, /\(hover:\s*hover\)\s*and\s*\(pointer:\s*fine\)/, "hover zoom must be gated off touch");
  assert.match(css, /\.unified-tool-card:hover \.unified-tool-cover img[\s\S]{0,300}?transform:\s*scale\(1\.05\)/);
  assert.match(css, /\.unified-tool-card:focus-visible \.unified-tool-cover img/);
  assert.match(css, /\.unified-tool-card:focus-within \.unified-tool-cover img/);
  assert.match(css, /\.unified-tool-card:focus-visible \.calculator-thumbnail-image/);
  assert.match(css, /\.unified-tool-card:focus-within \.calculator-thumbnail svg/);

  assert.match(css, /\.unified-tool-cover\s*\{[^}]*overflow:\s*hidden/s, "the cover frame must clip the enlarged image");
  assert.match(
    css,
    /\.asl-tools-register \.calculator-thumbnail\s*\{[^}]*overflow:\s*hidden/s,
    "the calculator thumbnail frame must clip the enlarged svg"
  );

  assert.match(
    css,
    /prefers-reduced-motion:\s*reduce\s*\)\s*\{\s*\.unified-tool-cover img,\s*\n\s*\.asl-tools-register \.calculator-thumbnail-image,\s*\n\s*\.asl-tools-register \.calculator-thumbnail svg\s*\{\s*transition:\s*none/,
    "reduced motion must drop the transition, not the enlarged end state"
  );
});
