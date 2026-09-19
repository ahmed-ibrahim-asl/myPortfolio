import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
test("slant range and antenna aperture transfer into the RF calculator", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const p = await browser.newPage(),
      base = process.env.TEST_BASE_URL || "http://localhost:3000";
    await p.goto(`${base}/tools/satellite/look-angles/`, { waitUntil: "networkidle0" });
    const link = await p.$eval('a[href*="/tools/rf/rf-path/?v="]', (e) => e.href);
    const values = JSON.parse(new URL(link).searchParams.get("p")).values;
    assert.ok(values.distanceM > 35000000 && values.distanceM < 45000000);
    await p.goto(link, { waitUntil: "networkidle0" });
    const km = Number(await p.$eval('input[name="distanceM"]', (e) => e.value));
    assert.ok(Math.abs(km * 1000 - values.distanceM) < 0.001);
    await p.goto(`${base}/tools/rf/antenna/`, { waitUntil: "networkidle0" });
    const apertureLink = await p.$eval('a[href*="/tools/rf/rf-path/?v="]', (e) => e.href);
    await p.goto(apertureLink, { waitUntil: "networkidle0" });
    assert.equal(await p.$eval('select[name="rfMode"]', (e) => e.value), "pfd-receive");
    const aperture = Number(await p.$eval('input[name="effectiveApertureM2"]', (e) => e.value));
    assert.ok(Math.abs(aperture - 2.1991148575) < 1e-9);
    assert.equal(await p.evaluate(() => document.querySelector('input[name="distanceM"]')), null);
    assert.match(await p.$eval("main", (e) => e.textContent), /Incident power flux density/);
  } finally {
    await browser.close();
  }
});
