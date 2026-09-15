import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

const browserPath = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
].filter(Boolean).find(existsSync);

test("theme choice persists and tool categories stay focused in both themes", { timeout: 90_000 }, async (t) => {
  if (!browserPath) {
    t.skip("Chrome or Edge is required for the theme browser check.");
    return;
  }

  const baseUrl = process.env.SITE_RESPONSIVE_BASE_URL ?? "http://127.0.0.1:3000";
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--disable-background-networking", "--no-first-run"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(`${baseUrl}/tools/`, { waitUntil: "networkidle0" });

    const firstVisit = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      colorScheme: document.documentElement.style.colorScheme,
      background: getComputedStyle(document.body).backgroundColor,
      categoryCount: document.querySelectorAll("a[href*='/tools/category/']").length,
      toggleBeforeContact: Boolean(
        document.querySelector(".theme-toggle")?.nextElementSibling?.matches(".header-contact")
      )
    }));
    assert.deepEqual(firstVisit, {
      theme: "dark",
      colorScheme: "dark",
      background: "rgb(11, 13, 17)",
      categoryCount: 10,
      toggleBeforeContact: true
    });

    await page.click(".theme-toggle");
    assert.deepEqual(await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      saved: localStorage.getItem("asl-theme-preference")
    })), { theme: "light", saved: "light" });

    await page.reload({ waitUntil: "networkidle0" });
    assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), "light");

    for (const width of [390, 768, 1366, 1920, 3440]) {
      await page.setViewport({ width, height: width < 1000 ? 900 : 1080 });
      for (const theme of ["dark", "light"]) {
        await page.evaluate((nextTheme) => {
          localStorage.setItem("asl-theme-preference", nextTheme);
        }, theme);
        for (const route of ["/tools/", "/tools/category/resistors/"]) {
          await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle0" });
          assert.equal(
            await page.evaluate(() => document.documentElement.dataset.theme),
            theme,
            `${route} did not restore ${theme} mode`
          );
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth),
            0,
            `${route} overflows at ${width}px in ${theme} mode`
          );
        }
      }
    }

    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/tools/`, { waitUntil: "networkidle0" });
    await page.click(".menu-toggle");
    const mobileToggle = await page.$eval(".theme-toggle", (button) => {
      const rect = button.getBoundingClientRect();
      const navRect = button.parentElement.getBoundingClientRect();
      const navStyle = getComputedStyle(button.parentElement);
      const mobileLabel = button.querySelector(".theme-toggle-mobile-label");
      return {
        widthDifference: navRect.width
          - parseFloat(navStyle.paddingLeft)
          - parseFloat(navStyle.paddingRight)
          - rect.width,
        labelVisible: getComputedStyle(mobileLabel).display !== "none"
      };
    });
    assert.ok(
      mobileToggle.widthDifference <= 44,
      `mobile appearance row leaves ${mobileToggle.widthDifference}px unused`
    );
    assert.equal(mobileToggle.labelVisible, true);

    await page.goto(`${baseUrl}/tools/category/resistors/`, { waitUntil: "networkidle0" });
    await page.type("input[type='search']", "battery");
    await page.waitForFunction(() => document.querySelectorAll(".unified-tool-card").length === 0);
    assert.match(await page.$eval(".calculator-results-count", (node) => node.textContent), /0 tools/i);
  } finally {
    await browser.close();
  }
});
