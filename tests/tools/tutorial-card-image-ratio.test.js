import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import puppeteer from "puppeteer-core";

const executablePath =
  process.env.CHROME_PATH ||
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

test("tutorial covers keep a 16:9 frame while optimized images are unavailable", async () => {
  const css = await readFile(new URL("../../app/globals.css", import.meta.url), "utf8");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(`
      <base href="https://example.com">
      <style>${css}</style>
      <div style="height: 1600px"></div>
      <div class="tutorial-grid" style="width: 900px">
        <a class="tutorial-card">
          <picture style="display: contents">
            <source type="image/avif" srcset="/unavailable-cover.avif 640w" sizes="33vw">
            <source type="image/webp" srcset="/unavailable-cover.webp 640w" sizes="33vw">
            <img
              src="/unavailable-cover.webp"
              width="1400"
              height="788"
              sizes="33vw"
              loading="lazy"
              decoding="async"
              alt="Course cover"
            >
          </picture>
        </a>
        <a class="tutorial-card"></a>
        <a class="tutorial-card"></a>
      </div>
    `);

    const ratio = await page.$eval(".tutorial-card img", (image) => {
      const bounds = image.getBoundingClientRect();
      return bounds.width / bounds.height;
    });

    assert.ok(Math.abs(ratio - 16 / 9) < 0.01, `expected 16:9, received ${ratio}`);
  } finally {
    await browser.close();
  }
});
