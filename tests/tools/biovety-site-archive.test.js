import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const rootDir = process.cwd();
const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const manifestPath = path.join(rootDir, "data", "biovety-site-archive.json");

const expectedUrls = new Set([
  "https://eurokemsite.wixsite.com/website-1",
  "https://eurokemsite.wixsite.com/website-1/about-3-1",
  "https://eurokemsite.wixsite.com/website-1/about-3",
  "https://eurokemsite.wixsite.com/website-1/cosmetics",
  "https://eurokemsite.wixsite.com/website-1/cleaner-disinfectan",
  "https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess",
  "https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess-2",
  "https://eurokemsite.wixsite.com/website-1/happy",
  "https://eurokemsite.wixsite.com/website-1/contact",
  "https://biovety.com/",
  "https://biovety.com/products.html",
  "https://biovety.com/contact.html"
]);

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

test("the BioVety site archive preserves all twelve source pages locally", async () => {
  assert.equal(await fileExists(manifestPath), true, "archive manifest is missing");
  const pages = JSON.parse(await readFile(manifestPath, "utf8"));

  assert.equal(pages.length, 12);
  assert.deepEqual(new Set(pages.map((page) => page.url)), expectedUrls);
  assert.equal(pages.filter((page) => page.site === "Eurokem").length, 9);
  assert.equal(pages.filter((page) => page.site === "BioVety").length, 3);

  for (const page of pages) {
    assert.ok(page.title.trim(), `${page.url} needs a verified title`);
    assert.match(page.capturedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(page.tiles.length > 0, `${page.url} needs at least one tile`);
    for (const asset of [page.thumbnail, ...page.tiles]) {
      assert.ok(asset.startsWith("/media/portfolio/showcase/biovety/site-archive/"));
      const filePath = path.join(rootDir, "public", asset.replace(/^\//, ""));
      assert.equal(await fileExists(filePath), true, `missing local capture ${asset}`);
      assert.ok((await stat(filePath)).size <= 500 * 1024, `${asset} exceeds 500 KB`);
    }
  }
});

test("the archive gallery supports keyboard navigation and mobile layout", async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: true,
    args: ["--no-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    await page.goto(`${baseUrl}/work/web-development/biovety-website/`, { waitUntil: "networkidle0" });

    assert.equal(await page.$$eval("[data-archive-page-card]", (cards) => cards.length), 12);
    await page.click("[data-archive-page-card]");
    await page.waitForSelector('[role="dialog"]');
    const before = await page.$eval("[data-tile-position]", (node) => node.textContent);
    await page.keyboard.press("ArrowRight");
    const after = await page.$eval("[data-tile-position]", (node) => node.textContent);
    assert.notEqual(after, before);
    await page.keyboard.press("Escape");
    assert.equal(await page.$('[role="dialog"]'), null);

    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
    await page.reload({ waitUntil: "networkidle0" });
    const mobile = await page.evaluate(() => {
      const grid = document.querySelector("[data-archive-grid]");
      return {
        columns: grid ? getComputedStyle(grid).gridTemplateColumns : "",
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
      };
    });
    assert.match(mobile.columns, /^\d+(?:\.\d+)?px$/);
    assert.equal(mobile.overflow, false);
  } finally {
    await browser.close();
  }
});
