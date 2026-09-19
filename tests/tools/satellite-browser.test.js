import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import { satelliteCalculators } from "../../data/satellite-course.js";
import { rfCalculators } from "../../data/rf-calculators.js";
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
test("primary outputs require an explicit Calculate action", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    await page.goto(base + "/tools/satellite/orbit/", { waitUntil: "networkidle0" });
    assert.equal(await page.$("[data-result]"), null);
    assert.ok(await page.$("[data-orbit-plot]"));
    await page.click('[data-action="calculate"]');
    assert.ok(await page.$("[data-result]"));
  } finally {
    await browser.close();
  }
});
test("calculator category, functional routes, no course controls, and equal responsive gutters", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await mkdir("test-results/satellite", { recursive: true });
    await page.goto(base + "/tools/satellite-communication/", { waitUntil: "networkidle0" });
    assert.match(page.url(), /\/tools\/category\/satellite\//);
    assert.equal(await page.$$eval("[data-grouped-tools-index] a", (nodes) => nodes.length), 5);
    assert.equal(await page.$('img[src*="tool-satellite-communication"]'), null);
    for (const [root, tools] of [["satellite", satelliteCalculators], ["rf", rfCalculators]]) {
      for (const tool of tools) {
      const response = await page.goto(base + "/tools/" + root + "/" + tool.slug + "/", {
        waitUntil: "networkidle0"
      });
      assert.equal(response.status(), 200, tool.slug);
      assert.ok(await page.$('[data-action="calculate"]'), tool.slug);
      assert.equal(
        await page.$$eval(
          'select[aria-label="Open satellite module"] option',
          (nodes) => nodes.length
        ),
        10
      );
      assert.doesNotMatch(
        await page.$eval("main", (e) => e.textContent),
        /Mark as studied|Return to your practice|Exam \/ solve first|Start session/
      );
      await page.click('[data-action="calculate"]');
      assert.ok(await page.$("[data-result]"), tool.slug);
      }
    }
    for (const route of [
      "category/satellite",
      "category/rf-engineering",
      "satellite/orbit",
      "satellite/link-budget",
      "rf/antenna",
      "rf/rf-path"
    ])
      for (const width of [320, 390, 768, 1024, 1440, 1920])
        for (const theme of ["dark", "light"]) {
          await page.setViewport({ width, height: 900 });
          await page.goto(base + "/tools/" + route + "/", { waitUntil: "networkidle0" });
          await page.evaluate((t) => (document.documentElement.dataset.theme = t), theme);
          const bounds = await page.evaluate(() => {
            const header =
              document.querySelector(".asl-tool-category-header") ||
              document.querySelector("article header");
            const r = header.getBoundingClientRect();
            return {
              left: r.left,
              right: innerWidth - r.right,
              overflow: document.documentElement.scrollWidth - innerWidth
            };
          });
          assert.ok(bounds.overflow <= 1, route + " " + width + " overflow " + bounds.overflow);
          assert.ok(
            bounds.left >= 12 && bounds.right >= 12,
            route + " " + width + " missing gutters: " + JSON.stringify(bounds)
          );
          assert.ok(
            Math.abs(bounds.left - bounds.right) < 2,
            route + " " + width + " asymmetric gutters: " + JSON.stringify(bounds)
          );
          if (width === 390 || width === 1440)
            await page.screenshot({
              path:
                "test-results/satellite/calculators-" +
                route.replace("/", "-") +
                "-" +
                width +
                "-" +
                theme +
                ".png",
              fullPage: true
            });
        }
    await page.goto(base + "/tools/satellite/orbit/", { waitUntil: "networkidle0" });
    await page.click('[data-action="calculate"]');
    const original = await page.$eval('[data-result="periodS"]', (e) => e.textContent);
    await page.$eval('input[name="altitudeM"]', (e) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(e, "1200");
      e.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await page.click('[data-action="calculate"]');
    assert.notEqual(await page.$eval('[data-result="periodS"]', (e) => e.textContent), original);
    await page.click('[data-action="save"]');
    assert.ok(await page.$("[data-history-item]"));
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
