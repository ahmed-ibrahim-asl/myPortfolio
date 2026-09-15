import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {mkdir} from 'node:fs/promises';
const base=process.env.SITE_RESPONSIVE_BASE_URL||'http://localhost:3012/myPortflio';
const executablePath=process.env.CHROME_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
test('SMPS modes, phases, validation, artwork and responsive pages',async()=>{
 const browser=await puppeteer.launch({executablePath,headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(`${base}/tools/smps-designer/`,{waitUntil:'networkidle0'});
  const click=async text=>{for(const b of await page.$$('button'))if((await b.evaluate(e=>e.textContent)).includes(text)){await b.click();return;}throw Error('Missing '+text);};
  assert.ok(await page.$('.katex-mathml math'));
  await mkdir('test-results/smps',{recursive:true});
  for(const mode of ['AC mains → isolated DC','DC source → isolated DC']){
   await click(mode);
   for(const phase of ['1 · Store energy','2 · Deliver energy','3 · Idle interval']){await click(phase);assert.ok(await page.$('button[aria-pressed=true]'));}
   for(const width of [1440,390])for(const theme of ['dark','light']){
    await page.setViewport({width,height:1000});await page.evaluate(t=>{document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;},theme);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`test-results/smps/${mode.startsWith('AC')?'ac':'dc'}-${width}-${theme}.png`,fullPage:true});
   }
  }
  const input=await page.$('main input[type=number]');await input.click();await page.keyboard.down('Control');await page.keyboard.press('A');await page.keyboard.up('Control');await page.keyboard.press('Backspace');assert.equal(await input.evaluate(e=>e.value),'');await page.waitForSelector('[role=alert]');assert.equal(await page.$('svg[aria-label^="Isolated flyback"]'),null);
  await page.goto(`${base}/tools/category/power-conversion-supplies/`,{waitUntil:'networkidle0'});
  assert.ok(await page.$('a[href$="/tools/smps-designer/"]'));
  assert.deepEqual(await page.$$eval('.asl-tool-category-catalog img',els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[]);
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
