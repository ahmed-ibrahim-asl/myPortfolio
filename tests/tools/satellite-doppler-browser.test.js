import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer-core";
test("Doppler motion follows radial sign and relay pulse uses unequal leg lengths", async () => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.CHROME_PATH || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true
  });
  try {
    const p = await browser.newPage();
    await p.goto(
      `${process.env.TEST_BASE_URL || "http://localhost:3000"}/tools/satellite/doppler-delay/`,
      { waitUntil: "networkidle0" }
    );
    assert.ok(await p.$("[data-doppler-visual]"), "dedicated Doppler diagram missing");
    assert.ok(await p.$('[data-leo-pass]'),'LEO pass controls missing');
    assert.match(await p.$eval('[data-leo-result]',e=>e.textContent),/Radial velocity 0.0 m\/s · Doppler 0.0 Hz/);
    await p.$eval('input[aria-label="LEO pass position"]',el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'1');el.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.waitForFunction(()=>document.querySelector('[data-leo-result]').textContent.includes('Doppler -'));
    const passBefore=await p.$eval('[data-leo-pass] figcaption',e=>e.textContent);
    await p.$eval('input[aria-label="LEO altitude"]',el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'1200');el.dispatchEvent(new Event('input',{bubbles:true}));});
    await p.waitForFunction(old=>document.querySelector('[data-leo-pass] figcaption').textContent!==old,{},passBefore);
    await p.setViewport({width:1440,height:1000});
    await (await p.$('[data-leo-pass]')).screenshot({path:'test-results/satellite/leo-pass-desktop.png'});
    const edit = (name, value) =>
      p.$eval(
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
    await edit("radialVelocityMps", -7000);
    await p.waitForFunction(() =>
      document.querySelector("[data-doppler-visual]").textContent.includes("Approaching")
    );
    await edit("uplinkDistanceM", 10000);
    await edit("downlinkDistanceM", 30000);
    await p.$eval('input[aria-label="Signal flight progress"]', (el) => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, ".25");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await p.waitForFunction(
      () =>
        Math.abs(Number(document.querySelector("[data-delay-pulse]").getAttribute("cx")) - 310) <
        0.01
    );
    assert.match(await p.$eval("[data-doppler-visual]", (e) => e.textContent), /33.36 ms/);
    const x = await p.$eval("[data-doppler-satellite]", (e) => Number(e.getAttribute("cx")));
    await edit("radialVelocityMps", 7000);
    await p.waitForFunction(() =>
      document.querySelector("[data-doppler-visual]").textContent.includes("Receding")
    );
    assert.notEqual(
      await p.$eval("[data-doppler-satellite]", (e) => Number(e.getAttribute("cx"))),
      x
    );
    await p.setViewport({width:1440,height:1000});
    await (
      await p.$("[data-doppler-visual]")
    ).screenshot({ path: "test-results/satellite/doppler-live.png" });
    await p.click('[data-doppler-visual] button');
    await p.waitForFunction(()=>Number(document.querySelector('input[aria-label="Signal flight progress"]').value)>.3);
    await p.click('[data-doppler-visual] button');
    assert.equal(await p.$eval('[data-doppler-visual] button',e=>e.textContent),'Play animation');
    await p.setViewport({width:390,height:900});
    await (await p.$('[data-doppler-visual]')).focus();
    await p.keyboard.press('ArrowRight');
    await p.waitForFunction(()=>document.querySelector('[data-doppler-visual]').scrollLeft>0);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  } finally {
    await browser.close();
  }
});
