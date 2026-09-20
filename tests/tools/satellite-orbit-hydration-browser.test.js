import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
import { readFileSync } from "node:fs";

const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

const HYDRATION_PATTERNS = [
  /hydration/i,
  /did not match/i,
  /server.*html.*didn.?t match/i,
  /error #418/i,
  /error #419/i,
  /error #421/i,
  /error #425/i
];

test("orbit instrument exposes playback, reset, metrics and reduced-motion handling", () => {
  const source = readFileSync("components/tools/satellite/OrbitInstrument.jsx", "utf8");
  assert.match(source, /data-orbit-instrument/);
  assert.match(source, /data-orbit-play/);
  assert.match(source, /data-orbit-reset/);
  assert.match(source, /data-orbit-metrics/);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /aria-live="polite"/);
});

async function assertFreshLoadHasNoHydrationIssues(page, url) {
  const consoleMessages = [];
  const pageErrors = [];
  const onConsole = (msg) => consoleMessages.push(msg.text());
  const onPageError = (err) => pageErrors.push(err.message);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  try {
    // A brand-new page (not client-side navigation) forces a real server render
    // followed by hydration, which is the only place this class of bug appears.
    const response = await page.goto(url, { waitUntil: "networkidle0" });
    assert.equal(response.status(), 200, url);
    const flagged = [...consoleMessages, ...pageErrors].filter((text) =>
      HYDRATION_PATTERNS.some((pattern) => pattern.test(text))
    );
    assert.deepEqual(flagged, [], `hydration-related console output on ${url}`);
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
}

function assertFiniteSvgAttribute(value, label) {
  assert.ok(value && value.length > 0, `${label} is empty`);
  assert.doesNotMatch(value, /NaN|Infinity|undefined/i, `${label} contains a non-finite token`);
  const numbers = value.match(/-?\d+(\.\d+)?/g) || [];
  assert.ok(numbers.length > 0, `${label} has no numeric tokens`);
  for (const token of numbers) assert.ok(Number.isFinite(Number(token)), `${label} token ${token}`);
}

test("orbit calculator hydrates cleanly on a fresh load (English)", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    await assertFreshLoadHasNoHydrationIssues(page, `${base}/tools/satellite/orbit/`);
    const points = await page.$eval("[data-orbit-plot] polygon", (e) => e.getAttribute("points"));
    assertFiniteSvgAttribute(points, "orbit polygon points");
    const cx = await page.$eval("[data-orbit-satellite]", (e) => e.getAttribute("cx"));
    const cy = await page.$eval("[data-orbit-satellite]", (e) => e.getAttribute("cy"));
    assertFiniteSvgAttribute(cx, "orbit satellite cx");
    assertFiniteSvgAttribute(cy, "orbit satellite cy");
  } finally {
    await browser.close();
  }
});

test("orbit calculator hydrates cleanly on a fresh load (Arabic)", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    await assertFreshLoadHasNoHydrationIssues(page, `${base}/ar/tools/satellite/orbit/`);
    const points = await page.$eval("[data-orbit-plot] polygon", (e) => e.getAttribute("points"));
    assertFiniteSvgAttribute(points, "orbit polygon points (ar)");
    assert.equal(await page.$eval("html", (e) => e.dir), "rtl");
  } finally {
    await browser.close();
  }
});

test("other satellite/RF plots hydrate cleanly on a fresh load", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    for (const route of [
      "/tools/satellite/orbit/",
      "/tools/satellite/look-angles/",
      "/tools/rf/antenna/",
      "/tools/satellite/power-lifetime/",
      "/tools/rf/noise-gt/",
      "/tools/rf/multiple-access/",
      "/tools/satellite/link-budget/",
      "/tools/satellite/doppler-delay/"
    ]) {
      await assertFreshLoadHasNoHydrationIssues(page, base + route);
      const svgAttrs = await page.$$eval(
        "svg [points], svg [d]",
        (nodes) => nodes.map((n) => n.getAttribute("points") || n.getAttribute("d"))
      );
      for (const attr of svgAttrs) assertFiniteSvgAttribute(attr, `${route} svg attribute`);
    }
  } finally {
    await browser.close();
  }
});
