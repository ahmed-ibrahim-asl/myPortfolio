import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const base = process.env.ASL_PREVIEW_URL || 'http://127.0.0.1:3111';
const output = 'C:/Users/Asl/.codex/visualizations/2026/10/07/01a1184a-973b-7a83-9447-9a41b14fb043';
await mkdir(output,{recursive:true});
try {
  const page = await browser.newPage();
  for (const width of [1440,1024,390]) {
    await page.setViewport({width,height:900});
    const response = await page.goto(`${base}/tools/`,{waitUntil:'networkidle0'});
    assert.equal(response.status(),200);
    await page.waitForSelector('[data-tools-browser]');
    for (const theme of ['dark','light']) {
      await page.evaluate(t=>{document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;},theme);
      const state = await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        cards:document.querySelectorAll('[data-tools-browser] h2').length,
        first:document.querySelector('[data-tools-browser] h2').getBoundingClientRect().top,
        navHome:[...document.querySelectorAll('#site-navigation > a')].some(a=>a.textContent==='Home'),
        broken:[...document.querySelectorAll('[data-tools-browser] img')].filter(i=>i.getBoundingClientRect().top<900 && (!i.complete||!i.naturalWidth)).length,
        overlay:[...document.querySelectorAll('[data-tools-browser] img')].some(i=>i.parentElement.querySelector('span'))
      }));
      assert.equal(state.overflow,false,JSON.stringify({width,theme,state}));
      assert.ok(state.cards>=60); assert.ok(state.first<800); assert.equal(state.navHome,false); assert.equal(state.broken,0); assert.equal(state.overlay,false);
      await page.screenshot({path:`${output}/asl-tools-${width}-${theme}.png`,fullPage:false});
      console.log({width,theme,...state});
    }
  }
  await page.select('select','workbenches');
  const ids = await page.$$eval('[data-tools-browser] h2',nodes=>nodes.map(n=>n.textContent));
  assert.ok(ids.some(t=>t.includes('Gradify'))); assert.ok(ids.some(t=>t.includes('AI Script')));
  await page.type('input[type="search"]','calculate my gpa');
  assert.equal(await page.$$eval('[data-tools-browser] h2',nodes=>nodes.length),1);
  await page.select('select','rf-engineering');
  assert.ok((await page.$eval('[data-tools-browser]',n=>n.textContent)).includes('No tools found'));
  await page.evaluate(()=>[...document.querySelectorAll('[data-tools-browser] button')].find(button=>button.textContent==='Reset search').click());
  await page.setViewport({width:1440,height:900});
  await page.reload({waitUntil:'networkidle0'});
  await page.click('.nav-more summary');
  assert.ok(await page.$eval('.nav-more',n=>n.open));
  await page.keyboard.press('Escape');
  assert.equal(await page.$eval('.nav-more',n=>n.open),false);
  console.log('Catalog, search, category, images, navigation checks passed.');
} finally {await browser.close();}
