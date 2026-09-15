import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { calculators } from "../../data/calculators.js";

test("the GitHub Pages export preserves Next.js _next assets", { timeout: 120_000 }, () => {
  const npmCommand = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "npm";
  const npmArgs =
    process.platform === "win32" ? ["/d", "/s", "/c", "npm.cmd", "run", "build"] : ["run", "build"];
  const result = spawnSync(npmCommand, npmArgs, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GITHUB_ACTIONS: "true",
      NEXT_TELEMETRY_DISABLED: "1"
    },
    encoding: "utf8",
    timeout: 110_000
  });

  assert.equal(result.status, 0, `GitHub Pages build failed:\n${result.stdout}\n${result.stderr}`);
  assert.equal(
    existsSync(join(process.cwd(), "out", ".nojekyll")),
    true,
    "out/.nojekyll must exist so GitHub Pages serves the _next directory"
  );
  const nextAssets = join(process.cwd(), "out", "_next");
  assert.equal(
    existsSync(nextAssets) && readdirSync(nextAssets).length > 0,
    true,
    "out/_next must contain the exported Next.js assets"
  );

  const homeHtml = readFileSync(join(process.cwd(), "out", "index.html"), "utf8");
  // Guards against a regression of the historical bug where a public/ asset
  // was referenced with an unprefixed root path instead of NEXT_PUBLIC_BASE_PATH.
  assert.doesNotMatch(homeHtml, /(?:src|href)="\/brand\//);

  for (const { slug } of calculators) {
    assert.equal(
      existsSync(join(process.cwd(), "out", "tools", slug, "index.html")),
      true,
      `missing exported calculator route: ${slug}`
    );
  }

  const htmlFiles = [];
  const collectHtml = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) collectHtml(path);
      else if (entry.name.endsWith(".html")) htmlFiles.push(path);
    }
  };
  collectHtml(join(process.cwd(), "out"));

  const brokenInternalLinks = [];
  const root = join(process.cwd(), "out");
  for (const htmlFile of htmlFiles) {
    const html = readFileSync(htmlFile, "utf8");
    for (const match of html.matchAll(/href="(\/myPortflio\/[^"?#]*)/g)) {
      const pathname = match[1].slice("/myPortflio".length);
      if (pathname.startsWith("/_next/")) continue;
      const relative = pathname.replace(/^\//, "");
      const candidates = pathname.endsWith("/")
        ? [join(root, relative, "index.html")]
        : [join(root, relative), join(root, `${relative}.html`), join(root, relative, "index.html")];
      if (!candidates.some(existsSync)) {
        brokenInternalLinks.push(`${htmlFile}: ${match[1]}`);
      }
    }
  }
  assert.deepEqual(brokenInternalLinks, [], `broken exported links:\n${brokenInternalLinks.join("\n")}`);
});
