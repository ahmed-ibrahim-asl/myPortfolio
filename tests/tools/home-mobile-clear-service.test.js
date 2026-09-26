import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";

const executablePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

test("the promoted homepage stays clear and usable across mobile widths and themes", async () => {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox"]
  });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: "networkidle0" });

    for (const width of [320, 360, 390, 430]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });

      for (const theme of ["dark", "light"]) {
        await page.evaluate(value => (document.documentElement.dataset.theme = value), theme);
        const home = await page.evaluate(() => {
          const root = document.querySelector(".apple-home-root");
          const portrait = root?.querySelector('img[alt="Ahmed Ibrahim Asl"]');
          const actions = [...(root?.querySelectorAll("[data-preview-action]") ?? [])];
          const navLinks = [...(root?.querySelectorAll("nav a") ?? [])].filter(
            link => getComputedStyle(link).display !== "none"
          );
          const rect = element => element?.getBoundingClientRect();

          return {
            rootVisible: Boolean(root && getComputedStyle(root).display !== "none"),
            title: root?.querySelector("h1")?.textContent.trim(),
            h1Count: document.querySelectorAll("h1").length,
            portraitLoaded: Boolean(portrait?.complete && portrait.naturalWidth > 0),
            portraitWidth: rect(portrait)?.width ?? 0,
            actionLabels: actions.map(action => action.textContent.trim().replace(/\s+/g, " ")),
            actionHeights: actions.map(action => rect(action)?.height ?? 0),
            navHeights: navLinks.map(link => rect(link)?.height ?? 0),
            overflow: document.documentElement.scrollWidth - innerWidth,
            oldHomeElements: document.querySelectorAll(
              ".home-mobile-identity, .portrait-instrument, .home-register"
            ).length
          };
        });

        assert.equal(home.rootVisible, true, `${width}/${theme}: homepage root is visible`);
        assert.equal(home.title, "From rough idea to working system.");
        assert.equal(home.h1Count, 1);
        assert.equal(home.portraitLoaded, true, `${width}/${theme}: portrait loaded`);
        assert.ok(home.portraitWidth >= 180, `${width}/${theme}: portrait is too small`);
        assert.deepEqual(home.actionLabels, [
          "View selected work ↘",
          "Start a project",
          "aassal950@gmail.com ↗"
        ]);
        assert.ok(
          home.actionHeights.every(height => height >= 44),
          `${width}/${theme}: action target is below 44px`
        );
        assert.ok(
          home.navHeights.every(height => height >= 44),
          `${width}/${theme}: navigation target is below 44px`
        );
        assert.ok(home.overflow <= 0, `${width}/${theme}: ${home.overflow}px overflow`);
        assert.equal(home.oldHomeElements, 0);
      }
    }
  } finally {
    await browser.close();
  }
});
