import assert from "node:assert/strict";
import test from "node:test";
import puppeteer from "puppeteer-core";

const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

test("the desktop portrait mat has equal left and right insets", async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0" });

    for (const theme of ["dark", "light"]) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      const insets = await page.evaluate(() => {
        const instrument = document.querySelector(".portrait-instrument")?.getBoundingClientRect();
        const portrait = document.querySelector(".portrait-instrument .profile-portrait")?.getBoundingClientRect();
        if (!instrument || !portrait) return null;
        return {
          left: portrait.left - instrument.left,
          right: instrument.right - portrait.right
        };
      });

      assert.ok(insets, `${theme}: portrait geometry is available`);
      assert.ok(
        Math.abs(insets.left - insets.right) <= 1,
        `${theme}: asymmetric portrait insets ${JSON.stringify(insets)}`
      );
    }
  } finally {
    await browser.close();
  }
});
