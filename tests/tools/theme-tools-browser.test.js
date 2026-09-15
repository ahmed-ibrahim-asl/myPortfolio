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
      categoryCount: 6,
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
        for (const route of ["/tools/", "/tools/category/circuit-design/"]) {
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
    await page.evaluate(() => localStorage.setItem("asl-theme-preference", "dark"));
    await page.goto(`${baseUrl}/tools/`, { waitUntil: "networkidle0" });
    await page.click(".menu-toggle");
    const mobileToggle = await page.$eval(".theme-toggle", (button) => {
      const rect = button.getBoundingClientRect();
      const action = button.querySelector(".theme-toggle-action");
      return {
        labels: [...action.children].map((node) => node.textContent.trim()),
        gap: parseFloat(getComputedStyle(action).gap),
        mobileLabelExists: Boolean(button.querySelector(".theme-toggle-mobile-label")),
        ariaLabel: button.getAttribute("aria-label"),
        width: rect.width,
        height: rect.height
      };
    });
    assert.deepEqual(mobileToggle.labels, ["☀", "Light"]);
    assert.ok(mobileToggle.gap >= 6);
    assert.equal(mobileToggle.mobileLabelExists, false);
    assert.equal(mobileToggle.ariaLabel, "Switch to light theme");
    assert.ok(mobileToggle.width >= 44 && mobileToggle.height >= 44);

    await page.click(".theme-toggle");
    assert.deepEqual(await page.$eval(".theme-toggle", (button) => ({
      labels: [...button.querySelectorAll(".theme-toggle-action > span")].map((node) => node.textContent.trim()),
      ariaLabel: button.getAttribute("aria-label")
    })), { labels: ["☾", "Dark"], ariaLabel: "Switch to dark theme" });

    await page.goto(`${baseUrl}/tools/category/resistors/`, { waitUntil: "networkidle0" });
    assert.equal(await page.$eval("h1", (node) => node.textContent), "Circuit Design");
    assert.deepEqual(
      await page.$$eval(".asl-tool-category-catalog section > h2", (nodes) => nodes.map((node) => node.textContent)),
      [
        "Fundamentals",
        "Resistors & Networks",
        "Timing, Filters & Analog Design",
        "Control Design",
        "Power Conversion & Supplies"
      ]
    );
  } finally {
    await browser.close();
  }
});
