import test from "node:test";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import puppeteer from "puppeteer-core";

test("printed study solution puts the problem and givens before the worked answer", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    await page.goto(
      `${process.env.TEST_BASE_URL || "http://localhost:3000"}/tools/satellite/orbit/`,
      { waitUntil: "networkidle0" }
    );
    await page.click('[data-action="calculate"]');
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMediaType("print");
    const colors = await page.evaluate(() => ({
      paper: getComputedStyle(document.documentElement).backgroundColor,
      heading: getComputedStyle(document.querySelector("[data-satellite-print] h1")).color
    }));
    assert.equal(
      colors.paper,
      "rgb(255, 255, 255)",
      "Printed margins must not inherit dark-theme paper"
    );
    assert.equal(
      colors.heading,
      "rgb(17, 17, 17)",
      "Printed headings must remain legible on white"
    );
    await mkdir("test-results/satellite", { recursive: true });
    const path = "test-results/satellite/orbit-study-print.pdf";
    await page.pdf({
      path,
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" }
    });
    const text = execFileSync("pdftotext", ["-layout", path, "-"], { encoding: "utf8" });
    const headings = [
      "1. Problem",
      "2. Given",
      "3. Required",
      "4. Formula",
      "5. Unit conversion",
      "6. Substitution",
      "7. Answer",
      "8. Interpretation"
    ];
    let previous = -1;
    for (const heading of headings) {
      const index = text.indexOf(heading, previous + 1);
      assert.ok(index > previous, `Missing or out-of-order print section: ${heading}`);
      previous = index;
    }
    assert.match(text, /800000\s*m/);
    assert.match(text, /6043/);
    assert.doesNotMatch(text, /Browse all tools|Common mistakes|Practice this topic/);
    assert.equal(
      await page.$eval('details[class*="solution"]', (e) => e.open),
      false,
      "Print must restore the collapsed screen solution"
    );
  } finally {
    await browser.close();
  }
});

test("nested FT legs and receiver stages survive the real print pipeline", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    await mkdir("test-results/satellite", { recursive: true });
    for (const scenario of [
      {
        slug: "link-budget",
        selector: "linkMode",
        value: "course-ft",
        path: "test-results/satellite/link-budget-ft-study-print.pdf",
        readyText: "Uplink carrier-to-noise ratio",
        expected: [
          /uplink \/ Carrier frequency\s+14000000000 Hz/i,
          /downlink \/ Carrier frequency\s+12000000000 Hz/i,
          /Uplink carrier-to-noise ratio/i
        ]
      },
      {
        slug: "noise-gt",
        selector: "noiseMode",
        value: "cascade",
        path: "test-results/satellite/noise-cascade-study-print.pdf",
        readyText: "Equivalent input noise temperature",
        expected: [
          /Stage 1 \/ Power gain\s+20 dB/i,
          /Stage 2 \/ Noise figure\s+6 dB/i,
          /Equivalent input noise temperature/i
        ]
      }
    ]) {
      const page = await browser.newPage();
      await page.goto(
        `${process.env.TEST_BASE_URL || "http://localhost:3000"}/tools/satellite/${scenario.slug}/`,
        { waitUntil: "networkidle0" }
      );
      await page.select(`select[name="${scenario.selector}"]`, scenario.value);
      await page.click('[data-action="calculate"]');
      await page.waitForFunction(
        (value) => document.querySelector(`[data-satellite-print]`)?.textContent?.includes(value),
        {},
        scenario.readyText
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      await page.emulateMediaType("print");
      const rowLayout = await page.$eval("[data-satellite-print] dl > div", (row) => {
        const styles = getComputedStyle(row);
        const valueStyles = getComputedStyle(row.querySelector("dd"));
        return {
          display: styles.display,
          valueDisplay: valueStyles.display,
          valueWhiteSpace: valueStyles.whiteSpace
        };
      });
      assert.equal(rowLayout.display, "table-row");
      assert.equal(rowLayout.valueDisplay, "table-cell");
      assert.equal(rowLayout.valueWhiteSpace, "nowrap");
      const formulaSpacing = await page.$eval(
        "[data-satellite-print] div[class*='printItem']",
        (item) => parseFloat(getComputedStyle(item).paddingBottom)
      );
      assert.ok(formulaSpacing >= 8);
      await page.pdf({
        path: scenario.path,
        format: "A4",
        printBackground: true,
        margin: { top: "14mm", bottom: "14mm", left: "14mm", right: "14mm" }
      });
      const text = execFileSync("pdftotext", ["-layout", scenario.path, "-"], { encoding: "utf8" });
      for (const pattern of scenario.expected) assert.match(text, pattern, scenario.path);
      assert.doesNotMatch(text, /[{}]|undefined|\[object Object\]/, scenario.path);
      assert.doesNotMatch(text, /uplink C\/N0|downlink C\/N0/, scenario.path);
      assert.doesNotMatch(text, /antennaTemperatureK|pathTemperatureK/, scenario.path);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
