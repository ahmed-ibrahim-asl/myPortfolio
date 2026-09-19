import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
const base=process.env.TEST_BASE_URL||'http://localhost:3000';
test('saved noise-factor calculations restore the selected input convention and result',async()=>{
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage();
    await page.goto(`${base}/tools/satellite/noise-gt/`,{waitUntil:'networkidle0'});
    await page.select('select[name="noiseMode"]','nf');
    // Locate the convention through its visible label, not its position in the page.
    await page.evaluate(()=>{const label=[...document.querySelectorAll('label')].find(l=>l.textContent.startsWith('Noise figure input'));const el=label.querySelector('select');el.value='factor';el.dispatchEvent(new Event('change',{bubbles:true}));});
    await page.waitForSelector('input[name="noiseFactor"]');
    await page.$eval('input[name="noiseFactor"]',el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'4');el.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.click('[data-action="calculate"]');
    await page.click('[data-action="save"]');
    const before=await page.$eval('[data-result="noiseFigureDb"]',e=>e.textContent);
    const href=await page.$eval('[data-history-item]',e=>e.href);
    await page.goto(href,{waitUntil:'networkidle0'});
    await page.click('[data-action="calculate"]');
    assert.equal(await page.$eval('[data-result="noiseFigureDb"]',e=>e.textContent),before);
    assert.ok(await page.$('input[name="noiseFactor"]'));
    assert.equal(await page.$eval('input[name="noiseFactor"]',e=>e.value),'4');
    await page.goto(`${base}/tools/satellite/orbit/`,{waitUntil:'networkidle0'});
    const description=await page.$eval('input[name="altitudeM"]',e=>document.getElementById(e.getAttribute('aria-describedby'))?.textContent);
    assert.match(description||'',/surface/);
    await page.click('[data-action="calculate"]');
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.$eval('details[class*="solution"]',e=>e.open),true);
    assert.match(await page.$eval('[class*="printGiven"]',e=>e.textContent),/800000\s*m/);
    await page.evaluate(()=>window.dispatchEvent(new Event('afterprint')));
    assert.equal(await page.$eval('details[class*="solution"]',e=>e.open),false);
    await page.goto(`${base}/tools/satellite/link-budget/`,{waitUntil:'networkidle0'});
    await page.select('select[name="linkMode"]','course-ft');
    await page.click('[data-action="calculate"]');
    await page.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));
    assert.match(await page.$eval('[class*="printGiven"]',e=>e.textContent),/uplink.*14000000000\s*Hz/s);
    assert.equal(await page.$$eval('[data-link-waterfall]',e=>e.length),2);
  }finally{await browser.close();}
});
