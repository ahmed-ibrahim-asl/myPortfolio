import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { mkdir } from 'node:fs/promises';

test('concept demo responds to inputs and remains usable across themes and screen sizes', async () => {
  const browser = await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true});
  try {
    const page = await browser.newPage();
    const errors=[]; page.on('pageerror', e=>errors.push(e.message));
    const response=await page.goto('http://localhost:3000/concepts/workbench-vision/index.html', {waitUntil:'networkidle0'});
    assert.equal(response.status(),200,'Preview should be available');
    await page.$eval('#sensor', e=>{e.value='20';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$eval('#output-state',e=>e.textContent),'OFF');
    await page.$eval('#sensor', e=>{e.value='80';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$eval('#output-state',e=>e.textContent),'ON');
    await page.$eval('#sensor', e=>{e.value='60';e.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.$eval('#output-state',e=>e.textContent),'ON');
    await page.click('[data-layer="interface"]');
    assert.match(await page.$eval('#layer-copy',e=>e.textContent),/remote/i);
    await page.click('[data-layer="hardware"]');
    await page.click('#motion');
    assert.equal(await page.$eval('html',e=>e.dataset.motion),'off');
    await mkdir('test-results/workbench-concept',{recursive:true});
    for(const width of [1440,390]) {
      await page.setViewport({width,height:1000});
      for(const theme of ['dark','light']) {
        if(await page.$eval('html',e=>e.dataset.theme)!==theme)await page.click('#theme');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow');
        assert.deepEqual(await page.$$eval('img',els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[]);
        await page.screenshot({path:`test-results/workbench-concept/${width}-${theme}.png`,fullPage:true});
      }
    }
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.reload({waitUntil:'networkidle0'});
    assert.equal(await page.$eval('html',e=>e.dataset.motion),'off');
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
});
