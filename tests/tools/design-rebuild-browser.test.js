import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {mkdir} from 'node:fs/promises';
const base=process.env.TEST_BASE_URL || process.env.SITE_RESPONSIVE_BASE_URL || 'http://localhost:3000';
const executablePath=process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('rebuilt tools simulate state, generate gates, render math and fit both themes',async()=>{
  const browser=await puppeteer.launch({executablePath,headless:true});
  try {
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(page.url()+' '+e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(page.url()+' '+m.text()+' '+JSON.stringify(m.location()));});
    const clickText=async text=>{const buttons=await page.$$('button');for(const b of buttons){if((await b.evaluate(e=>e.textContent)).trim()===text){await b.click();return;}}throw Error(`Missing button ${text}`);};
    await page.goto(`${base}/tools/control-design-assistant/`,{waitUntil:'networkidle0'});
    await clickText('Send rising clock pulse ↑');
    assert.match(await page.$eval('[aria-label="Recent captured states"]',e=>e.textContent),/01/);
    for(const mode of ['sr','jk','t','counter','shift','register']) {
      await page.select('main select',mode);
      assert.ok(await page.$('.katex-mathml math'),mode+' rendered math');
      assert.ok(await page.$('svg'),mode+' schematic');
      if(mode==='sr') {await clickText('S = 0');await clickText('R = 0');assert.match(await page.$eval('[role=alert]',e=>e.textContent),/Forbidden/);}
      else await clickText('Send rising clock pulse ↑');
    }
    await page.goto(`${base}/tools/logic-gate-designer/`,{waitUntil:'networkidle0'});
    assert.equal(await page.$eval('output',e=>e.textContent),'Y = 1');
    await clickText('Input B · 0');assert.equal(await page.$eval('output',e=>e.textContent),'Y = 0');
    await page.select('select[aria-label="Number of inputs"]','4');
    assert.equal(await page.$$eval('tbody tr',els=>els.length),16);
    await clickText('+ Add alternative condition');assert.equal(await page.$eval('output',e=>e.textContent),'Y = 1');
    await page.goto(`${base}/tools/cascaded-opamp-gain-designer/`,{waitUntil:'networkidle0'});
    await clickText('Show full circuit');
    assert.equal(await page.$$eval('#full-cascade svg[aria-label^="Stage"]',els=>els.length),2);
    await mkdir('test-results/design-rebuild',{recursive:true});
    await page.$eval('#full-cascade',e=>e.scrollIntoView());
    await page.screenshot({path:'test-results/design-rebuild/full-cascade.png'});
    await page.goto(`${base}/tools/category/control-design/`,{waitUntil:'networkidle0'});
    await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode();}));});
    assert.deepEqual(await page.$$eval('.asl-tool-category-catalog img',els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[]);
    await page.goto(`${base}/tools/buck-converter-designer/`,{waitUntil:'networkidle0'});
    await clickText('Switch OFF');
    assert.match(await page.$eval('[aria-live=polite]',e=>e.textContent),/./);
    assert.ok(await page.$('button[aria-pressed=true]'));
    await page.goto(`${base}/tools/bridge-rectifier-designer/`,{waitUntil:'networkidle0'});
    for(const phase of ['B positive pulse','Between pulses','A positive pulse']) await clickText(phase);
    await mkdir('test-results/design-rebuild',{recursive:true});
    for(const slug of ['control-design-assistant','logic-gate-designer','cascaded-opamp-gain-designer','buck-converter-designer','bridge-rectifier-designer','linear-regulator-stability-designer','category/circuit-design']){
      await page.goto(`${base}/tools/${slug}/`,{waitUntil:'networkidle0'});
      for(const width of [1440,390]) for(const theme of ['light','dark']) {
        await page.setViewport({width,height:1000});
        await page.evaluate(t=>{document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;},theme);
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${slug} ${width} ${theme}: overflow`);
        await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode();}));});
        assert.deepEqual(await page.$$eval('img:not([width="64"][height="64"])',els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[],slug+' image load');
        await page.screenshot({path:`test-results/design-rebuild/${slug.replaceAll('/','-')}-${width}-${theme}.png`,fullPage:true});
      }
    }
    assert.deepEqual(errors,[]);
  }finally{await browser.close();}
});
