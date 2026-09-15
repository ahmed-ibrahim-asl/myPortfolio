import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

test('Apps and UI cards show interface evidence and all previews decode',async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();await page.goto('http://localhost:3000/work/apps-ui/',{waitUntil:'networkidle0'});
  assert.match(await page.$eval('#plant-care-ai img',e=>e.src),/plant-care\/ui-1\.webp$/);
  for(const img of await page.$$('article img')){await img.evaluate(e=>e.scrollIntoView());await img.evaluate(e=>e.decode());}
  assert.deepEqual(await page.$$eval('article img',els=>els.filter(e=>!e.naturalWidth).map(e=>e.src)),[]);
  assert.match(await page.$eval('#dad4hire-mobile-ui',e=>e.textContent),/placeholder/i);
 }finally{await browser.close();}
});
