import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const executablePath = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
]
  .filter(Boolean)
  .find(existsSync);
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

test(
  "satellite tools support keyboard focus, reduced motion, invalid-input recovery, and responsive themes",
  { timeout: 120000 },
  async (t) => {
    if (!executablePath) {
      t.skip("Chrome or Edge required");
      return;
    }

    const browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--disable-background-networking", "--no-first-run"]
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(`${base}/tools/satellite/orbit/`, { waitUntil: "networkidle0" });

      const reducedMotion = await page.$eval('[data-action="calculate"]', (element) => ({
        animation: getComputedStyle(element).animationName,
        transition: getComputedStyle(element).transitionDuration
      }));
      assert.equal(reducedMotion.animation, "none");
      assert.equal(reducedMotion.transition, "0s");

      let focused = null;
      for (let i = 0; i < 40 && !focused; i += 1) {
        await page.keyboard.press("Tab");
        focused = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active?.closest('[class*="workspace"]')) return null;
          const style = getComputedStyle(active);
          return {
            tag: active.tagName,
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth)
          };
        });
      }
      assert.ok(focused, "Tab navigation must enter the satellite workspace");
      assert.notEqual(focused.outlineStyle, "none");
      assert.ok(focused.outlineWidth >= 3, JSON.stringify(focused));

      const setInput = (value) =>
        page.$eval(
          'input[name="altitudeM"]',
          (element, next) => {
            Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
              element,
              String(next)
            );
            element.dispatchEvent(new Event("input", { bubbles: true }));
          },
          value
        );
      await setInput(-1);
      await page.click('[data-action="calculate"]');
      await page.waitForSelector('[role="alert"]');
      assert.match(
        await page.$eval('[role="alert"]', (element) => element.textContent),
        /Altitude must be finite between 0 and Infinity/i
      );
      await setInput(1200);
      await page.click('[data-action="calculate"]');
      await page.waitForSelector('[data-result="periodS"]');
      assert.equal(await page.$('[role="alert"]'), null);

      await mkdir("test-results/satellite", { recursive: true });
      for (const width of [390, 768, 1440]) {
        await page.setViewport({ width, height: 900 });
        for (const theme of ["light", "dark"]) {
          await page.evaluate((nextTheme) => {
            document.documentElement.dataset.theme = nextTheme;
            scrollTo(0, 0);
          }, theme);
          assert.ok(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `${width}px ${theme} mode must not overflow horizontally`
          );
          await page.screenshot({
            path: `test-results/satellite/orbit-viewport-${width}-${theme}.png`
          });
        }
      }

      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  }
);
