import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import {mkdir} from 'node:fs/promises';

test('power schematics keep component labels off conductors and show a component-level flyback',async()=>{
 const browser=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:1000});
  await page.goto('http://localhost:3000/tools/linear-regulator-stability-designer/',{waitUntil:'networkidle0'});
  const overlaps=await page.evaluate(()=>{
   const texts=[...document.querySelectorAll('svg[aria-label^="Linear regulator"] text')];
   return texts.filter(t=>{
    const svg=t.ownerSVGElement,b=t.getBBox();
    return [...svg.querySelectorAll('path')].some(p=>{
     for(let x=b.x-3;x<b.x+b.width+3;x+=2)for(let y=b.y-2;y<b.y+b.height+2;y+=2){const point=svg.createSVGPoint();point.x=x;point.y=y;if(p.isPointInStroke(point))return true;}
     return false;
    });
   }).map(t=>t.textContent);
  });
  assert.deepEqual(overlaps,[],'Capacitor names must clear vertical wires');
  await page.goto('http://localhost:3000/tools/smps-designer/',{waitUntil:'networkidle0'});
  assert.ok(await page.$('svg [aria-label="Inspect Q1 N-channel MOSFET"]'),'Show real MOSFET symbol');
  assert.equal(await page.$$eval('svg [data-bridge-diode]',els=>els.length),4,'AC input contains four bridge diodes');
  assert.deepEqual(await page.$eval('svg[aria-label^="Isolated flyback"]',svg=>{
   return [...svg.querySelectorAll('text')].filter(t=>{
    const b=t.getBBox();
    return [...svg.querySelectorAll('path')].some(p=>{
     const matrix=p.getCTM().inverse().multiply(t.getCTM());
     for(let x=b.x-2;x<b.x+b.width+2;x+=2)for(let y=b.y-2;y<b.y+b.height+2;y+=2){
      const point=svg.createSVGPoint();point.x=x;point.y=y;
      if(p.isPointInStroke(point.matrixTransform(matrix)))return true;
     }return false;
    });
   }).map(t=>t.textContent);
  }),[],'Every flyback label clears its conductors');
  await mkdir('test-results/power-schematic-layout',{recursive:true});
  await (await page.$('svg[aria-label^="Isolated flyback"]')).screenshot({path:'test-results/power-schematic-layout/flyback-detail.png'});
  for(const width of [1440,390])for(const theme of ['dark','light']){
   await page.setViewport({width,height:1000});await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await page.screenshot({path:`test-results/power-schematic-layout/smps-${width}-${theme}.png`,fullPage:true});
  }
  for(const b of await page.$$('button'))if((await b.evaluate(e=>e.textContent)).includes('DC source → isolated DC')){await b.click();break;}
  assert.equal(await page.$$eval('svg [data-bridge-diode]',els=>els.length),0,'DC bypasses bridge');
  await page.setViewport({width:1440,height:1000});
  await page.goto('http://localhost:3000/tools/category/power-conversion-supplies/',{waitUntil:'networkidle0'});
  await page.evaluate(()=>document.documentElement.dataset.theme='light');
  await page.evaluate(async()=>{await Promise.all([...document.images].map(image=>{image.loading='eager';return image.decode();}));});
  assert.deepEqual(await page.$$eval('img',els=>els.filter(e=>!e.complete||!e.naturalWidth).map(e=>e.src)),[]);
  await page.screenshot({path:'test-results/power-schematic-layout/covers-light.png',fullPage:true});
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
});
