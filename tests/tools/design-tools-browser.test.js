import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {mkdir} from 'node:fs/promises';
const base=process.env.SITE_RESPONSIVE_BASE_URL || 'http://localhost:3012/myPortflio';
const executablePath=process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('ROT and circuit designers respond to input and preserve category navigation', async()=>{
  const browser=await puppeteer.launch({executablePath,headless:true});
  try {
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${base}/tools/rot-explorer/`,{waitUntil:'networkidle0'});
    assert.equal(await page.$eval('textarea[readonly]',e=>e.value),'URYYB');
    await page.select('select[aria-label="Letter shift"]','20');
    await page.waitForFunction(()=>document.querySelector('textarea[readonly]').value==='BYFFI');
    await page.click('button[aria-label="A maps to U"]');
    assert.ok(await page.$eval('button[aria-label="A maps to U"]',e=>e.getAttribute('aria-pressed')==='true'));
    await page.goto(`${base}/tools/lc-resonance-designer/`,{waitUntil:'networkidle0'});
    await page.$eval('svg [aria-label="Inspect capacitor"]',e=>e.focus());await page.keyboard.press('Enter');
    assert.equal(await page.$eval('svg [aria-label="Inspect capacitor"]',e=>e.getAttribute('aria-pressed')),'true');
    await page.click('input[type=number]');await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');await page.keyboard.type('0');
    await page.waitForSelector('[role=alert]');
    assert.equal(await page.$('svg[aria-label="Parallel LC tank schematic"]'),null);
    await page.goto(`${base}/tools/category/circuit-design/`,{waitUntil:'networkidle0'});
    for(const slug of ['555-timer-astable-circuit-calculator','555-timer-monostable-circuit-calculator','band-pass-filter-designer']) assert.ok(await page.$(`a[href$="/tools/${slug}/"]`),slug);
    await page.goto(`${base}/tools/category/timing-filters/`);
    assert.equal(await page.$eval('h1',e=>e.textContent),'Circuit Design');
    await mkdir('test-results/design-tools',{recursive:true});
    for(const slug of ['rot-explorer','air-core-coil-designer','lc-resonance-designer','band-pass-filter-designer']){
      await page.goto(`${base}/tools/${slug}/`,{waitUntil:'networkidle0'});
      for(const width of [1440,390])for(const theme of ['light','dark']){
        await page.setViewport({width,height:1000});
        await page.evaluate(t=>{document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;},theme);
        await page.addStyleTag({content:'*{transition:none!important;animation:none!important}'});
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${slug} ${width} ${theme} overflow`);
        await page.screenshot({path:`test-results/design-tools/${slug}-${width}-${theme}.png`,fullPage:true});
      }
    }
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
