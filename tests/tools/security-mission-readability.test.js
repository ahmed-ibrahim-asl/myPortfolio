import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Guards three readability bugs reported live in Security Mission:
// 1. Selecting an objective/tool/action/workflow card forced its background to solid gold via a
//    blanket [aria-pressed="true"] rule meant for simple pills, leaving the card's own light
//    title/description text (tuned for a dark card) almost invisible on gold.
// 2. The executable token in the command trace paired muted gray text with a gold background.
// 3. The command line and command-assembly-trace tokens were rendered too small, and the "flag"
//    token's gold color was being dropped by the cascade instead of actually rendering gold.

const read = (path) => readFileSync(path, "utf8");

test("the blanket gold-fill rule excludes the multi-text choice cards (data-selected)", () => {
  const css = read("app/asl-tools.css");
  assert.match(
    css,
    /\.asl-security-mission-shell \[aria-pressed="true"\]:not\(\[data-selected\]\)/,
    "choice cards (which always render data-selected) must opt out of the simple-pill gold fill"
  );
  assert.match(css, /\.asl-security-mission-shell \[aria-selected="true"\]:not\(\[data-selected\]\)/);
});

test("the executable trace token uses dark text on its gold background", () => {
  const css = read("components/tools/security-mission/SecurityMission.module.css");
  const rule = css.match(/\.traceToken\[data-token-type="executable"\]\s*\{([^}]*)\}/s);
  assert.ok(rule, "executable token rule must exist");
  assert.match(rule[1], /color:\s*#14100A/i);
  assert.doesNotMatch(rule[1], /color:\s*var\(--asl-muted\)/);
});

test("the command line and trace tokens use a readable font size", () => {
  const css = read("components/tools/security-mission/SecurityMission.module.css");

  const commandRule = css.match(/\.commandCode pre,\s*\n\.commandCode p \{([^}]*)\}/s);
  assert.ok(commandRule, "command code rule must exist");
  assert.doesNotMatch(commandRule[1], /font-size:\s*0\.72rem/);

  const tokenRule = css.match(/\.traceToken \{([^}]*)\}/s);
  assert.ok(tokenRule, "traceToken rule must exist");
  assert.doesNotMatch(tokenRule[1], /font-size:\s*0\.61rem/);
});

test("flag/value/placeholder trace tokens force their distinguishing color through the cascade", () => {
  const css = read("components/tools/security-mission/SecurityMission.module.css");
  assert.match(css, /\.traceToken\[data-token-type="flag"\]\s*\{[^}]*color:\s*var\(--security-gold\)\s*!important/s);
  assert.match(
    css,
    /\.traceToken\[data-token-type="value"\],\s*\n\.traceToken\[data-token-type="positional"\]\s*\{[^}]*color:\s*var\(--security-green\)\s*!important/s
  );
});
