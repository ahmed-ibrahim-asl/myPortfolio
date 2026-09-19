import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
test("antenna geometry and TDMA allocation change when their physical inputs change", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const page = await browser.newPage();
    const base = process.env.TEST_BASE_URL || "http://localhost:3000";
    const edit = async (name, value) =>
      page.$eval(
        `input[name="${name}"]`,
        (el, value) => {
          Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
            el,
            String(value)
          );
          el.dispatchEvent(new Event("input", { bubbles: true }));
        },
        value
      );
    await page.goto(`${base}/tools/rf/antenna/`, { waitUntil: "networkidle0" });
    const before = await page.$eval("[data-beam-curve]", (e) => e.getAttribute("d"));
    await edit("diameterM", 4);
    await page.waitForFunction(
      (old) => document.querySelector("[data-beam-curve]")?.getAttribute("d") !== old,
      {},
      before
    );
    await page.goto(`${base}/tools/rf/multiple-access/`, { waitUntil: "networkidle0" });
    await page.select('select[name="accessMode"]', "fdma");
    await edit("guardBandwidthHz", 10);
    assert.ok((await page.$eval("[data-fdma-guard]", (e) => Number(e.getAttribute("width")))) > 0);
    await page.select('select[name="accessMode"]', "tdma");
    assert.ok(await page.$('section[aria-label="TDMA burst structure"]'));
    const payload = await page.$eval('[data-tdma-segment="Payload"]', (e) =>
      Number(e.getAttribute("width"))
    );
    await edit("trafficTerminals", 50);
    assert.ok(
      (await page.$eval('[data-tdma-segment="Payload"]', (e) => Number(e.getAttribute("width")))) <
        payload
    );
    for (const width of [390, 1440]) {
      await page.setViewport({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    }
    await page.goto(`${base}/tools/satellite/orbit/`, { waitUntil: "networkidle0" });
    const x = await page.$eval("[data-orbit-satellite]", (e) => e.getAttribute("cx"));
    await page.$eval('[aria-label="Orbit time fraction"]', (el) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, ".5");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    assert.notEqual(await page.$eval("[data-orbit-satellite]", (e) => e.getAttribute("cx")), x);
    await page.select('select[name="orbitMode"]', "elliptical");
    await edit("apogeeRadiusM", 21600);
    await edit("perigeeRadiusM", 7200);
    await page.waitForFunction(() =>
      document.querySelector("[data-orbit-plot]").textContent.includes("0.5000")
    );
    assert.equal(await page.$$eval("[data-equal-area-sector]", (nodes) => nodes.length), 2);
    await (
      await page.$("[data-orbit-plot]")
    ).screenshot({ path: "test-results/satellite/orbit-equal-area.png" });
    await page.select('select[name="orbitMode"]', "coverage");
    await page.waitForSelector("[data-coverage-cap]");
    const cap = await page.$eval("[data-coverage-cap]", (e) => e.getAttribute("d"));
    await edit("minimumElevationDeg", 30);
    await page.waitForFunction(
      (old) => document.querySelector("[data-coverage-cap]").getAttribute("d") !== old,
      {},
      cap
    );
    assert.match(await page.$eval("[data-coverage-plot]", (e) => e.textContent), /30.0°/);
    await (
      await page.$("[data-coverage-plot]")
    ).screenshot({ path: "test-results/satellite/coverage-live.png" });
    await page.goto(`${base}/tools/satellite/look-angles/`, { waitUntil: "networkidle0" });
    await page.click('[data-action="calculate"]');
    assert.equal(
      await page.$eval("[data-result]", (e) => e.getAttribute("data-result")),
      "elevationDeg"
    );
    await edit("satelliteLongitudeDeg", -140);
    assert.ok(
      (await page.$eval("[data-elevation-point]", (e) => Number(e.getAttribute("cy")))) > 145
    );
    const figure = await page.$('[class*="outputPanel"] figure');
    await figure.screenshot({ path: "test-results/satellite/look-angle-live-viewport.png" });
    await page.goto(`${base}/tools/rf/noise-gt/`, { waitUntil: "networkidle0" });
    await page.select('select[name="noiseMode"]', "cascade");
    const contribution = await page.$eval('[data-noise-stage="2"]', (e) =>
      Number(e.getAttribute("width"))
    );
    await edit("stage-0-gain", 30);
    assert.ok(
      (await page.$eval('[data-noise-stage="2"]', (e) => Number(e.getAttribute("width")))) <
        contribution
    );
    await page.goto(`${base}/tools/satellite/power-lifetime/`, { waitUntil: "networkidle0" });
    const curve = await page.$eval("[data-power-curve]", (e) => e.getAttribute("d"));
    await edit("degradationFraction", 0.4);
    assert.notEqual(await page.$eval("[data-power-curve]", (e) => e.getAttribute("d")), curve);
    await page.setViewport({ width: 390, height: 900 });
    const readable = await page.$eval(
      "[data-power-plot] text",
      (e) => parseFloat(getComputedStyle(e).fontSize) * e.getScreenCTM().a
    );
    assert.ok(readable >= 12, `Diagram text rendered at ${readable}px`);
    const plot = await page.$("[data-power-plot]");
    await plot.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForFunction(() => document.querySelector("[data-power-plot]").scrollLeft > 0);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  } finally {
    await browser.close();
  }
});
