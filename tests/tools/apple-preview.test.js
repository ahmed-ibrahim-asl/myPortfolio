import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import puppeteer from "puppeteer-core";

const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3105";

let browser;

before(async () => {
  browser = await puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
});

after(async () => {
  await browser?.close();
});

test("the local preview renders its complete page structure", async () => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/apple-preview`, { waitUntil: "networkidle0" });

  const structure = await page.evaluate(() => ({
    title: document.querySelector("h1")?.textContent?.trim(),
    headingCount: document.querySelectorAll("h1").length,
    navigation: Boolean(document.querySelector('nav[aria-label="Preview navigation"]')),
    work: Boolean(document.querySelector("section#work")),
    tools: Boolean(document.querySelector("section#tools")),
    contact: Boolean(document.querySelector("footer#contact")),
    sharedHeaderVisible: document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0,
    sharedFooterVisible: document.querySelector(".site-footer")?.getBoundingClientRect().height ?? 0
  }));

  assert.equal(structure.title, "From rough idea to working system.");
  assert.equal(structure.headingCount, 1);
  assert.equal(structure.navigation, true);
  assert.equal(structure.work, true);
  assert.equal(structure.tools, true);
  assert.equal(structure.contact, true);
  assert.equal(structure.sharedHeaderVisible, 0);
  assert.equal(structure.sharedFooterVisible, 0);

  await page.close();
});

test("the closing headline remains legible on its dark surface", async () => {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 1 });
  await page.goto(`${baseUrl}/apple-preview`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  });

  const colors = await page.evaluate(() => {
    const heading = document.querySelector("footer#contact h2");
    const footer = document.querySelector("footer#contact");
    return {
      foreground: heading ? getComputedStyle(heading).color : "",
      background: footer ? getComputedStyle(footer).backgroundColor : ""
    };
  });

  const channels = value => value.match(/[\d.]+/g).slice(0, 3).map(Number);
  const luminance = value => {
    const linear = channels(value).map(channel => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const lighter = Math.max(luminance(colors.foreground), luminance(colors.background));
  const darker = Math.min(luminance(colors.foreground), luminance(colors.background));
  const contrast = (lighter + 0.05) / (darker + 0.05);

  assert.ok(contrast >= 3, `closing headline contrast is ${contrast.toFixed(2)}:1`);
  await page.close();
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 320, height: 700 }
]) {
  test(`the preview remains touchable without horizontal overflow at ${viewport.width}px`, async () => {
    const page = await browser.newPage();
    await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/apple-preview`, { waitUntil: "networkidle0" });

    const result = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      actionHeights: Array.from(document.querySelectorAll("[data-preview-action]"), element =>
        Math.round(element.getBoundingClientRect().height)
      )
    }));

    assert.ok(result.overflow <= 0, `horizontal overflow is ${result.overflow}px`);
    assert.ok(result.actionHeights.length >= 2, "expected at least two primary actions");
    assert.ok(result.actionHeights.every(height => height >= 44), `action heights: ${result.actionHeights.join(", ")}`);

    await page.close();
  });
}
