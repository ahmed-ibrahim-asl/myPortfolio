import assert from "node:assert/strict";
import test from "node:test";
import puppeteer from "puppeteer-core";

const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

test("the promoted homepage keeps the desktop portrait centered in its stage", async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0" });

    for (const theme of ["dark", "light"]) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      const insets = await page.evaluate(() => {
        const stage = document
          .querySelector('.apple-home-root [class*="portraitStage"]')
          ?.getBoundingClientRect();
        const portrait = document
          .querySelector('.apple-home-root [class*="portraitFrame"]')
          ?.getBoundingClientRect();
        if (!stage || !portrait) return null;
        return {
          left: portrait.left - stage.left,
          right: stage.right - portrait.right
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
