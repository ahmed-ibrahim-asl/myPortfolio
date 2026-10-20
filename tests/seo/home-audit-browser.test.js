import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';
import { JSDOM } from 'jsdom';
const base = process.env.SITE_TEST_URL || 'http://localhost:3110';
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const metadata = (doc) => ({ title: [...doc.querySelectorAll('title')].map(n => n.textContent), description: [...doc.querySelectorAll('meta[name="description"]')].map(n => n.content), canonical: [...doc.querySelectorAll('link[rel="canonical"]')].map(n => n.href) });

test('home actionable text and hero remain readable across viewport, theme and enlarged text', async () => {
 const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
 try {
  const page = await browser.newPage();
  const failures = [];
  for (const width of [320,360,390,430,1366]) {
   await page.setViewport({width,height:900});
   await page.goto(base, {waitUntil:'networkidle0'});
   for (const theme of ['dark','light']) for (const scale of [100,200]) {
    await page.evaluate(({theme,scale}) => {document.documentElement.dataset.theme=theme; document.documentElement.style.fontSize=`${scale}%`;}, {theme,scale});
    const issues = await page.evaluate(() => {
     const selector = '.home-page h1, .home-page h1 span, .home-page h1 b, .home-intro, .home-mobile-identity-copy, .home-page a, .site-header a, .site-header button';
     return [...document.querySelectorAll(selector)].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden').flatMap(e => {
      const r=e.getBoundingClientRect();
      const range=document.createRange(); range.selectNodeContents(e);
      const textRects=[...range.getClientRects()].filter(t=>t.width && t.height);
      const outside = r.left < -1 || r.right > innerWidth+1;
      // Glyph ascenders may extend outside a tight line box without being clipped.
      const clipped = textRects.some(t => t.left < -1 || t.right > innerWidth+1);
      return outside || clipped ? [`${e.className}: ${e.textContent.trim().slice(0,70)}`] : [];
     });
    });
    if(issues.length) failures.push({width,theme,scale,issues});
   }
  }
  assert.deepEqual(failures, []);
 } finally {await browser.close();}
});

test('homepage metadata is unique and stable in raw HTML, rendered DOM and return navigation', async () => {
 const response = await fetch(base);
 assert.equal(response.status, 200);
 const raw= new JSDOM(await response.text(), {url:base});
 const expected=metadata(raw.window.document);
 assert.equal(expected.title.length,1); assert.equal(expected.description.length,1); assert.equal(expected.canonical.length,1);
 assert.ok(expected.title[0].trim()); assert.ok(expected.description[0].trim());
 assert.deepEqual(expected.canonical, ['https://eng-asl.com/']);
 const browser=await puppeteer.launch({executablePath,headless:true,args:['--no-sandbox']});
 try {
  const page=await browser.newPage(); await page.goto(base,{waitUntil:'networkidle0'});
  const read=()=>page.evaluate(() => ({title:[...document.querySelectorAll('title')].map(n=>n.textContent),description:[...document.querySelectorAll('meta[name="description"]')].map(n=>n.content),canonical:[...document.querySelectorAll('link[rel="canonical"]')].map(n=>n.href)}));
  assert.deepEqual(await read(),expected);
  await page.click('.home-actions a'); await page.waitForFunction(()=>location.pathname.includes('/work'));
  await page.click('.brand'); await page.waitForFunction(()=>location.pathname === '/');
  assert.deepEqual(await read(),expected);
 } finally {await browser.close();raw.window.close();}
});
