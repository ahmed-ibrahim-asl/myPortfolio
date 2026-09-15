import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const base = process.env.SITE_RESPONSIVE_BASE_URL || 'http://localhost:3000';
const executablePath = process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

test('student name remains editable after clearing and reaches the report', { timeout: 90000 }, async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${base}/tools/gradify/planner/`);
    await page.waitForSelector('#gradify-delta input[type=file]');
    await (await page.$('#gradify-delta input[type=file]')).uploadFile(path.resolve('test-results/gradify/synthetic-transcript.pdf'));
    const selector = '[aria-label="Student academic summary"] input';
    await page.waitForSelector(selector);
    const toastBounds = await page.$eval('#gradify-delta .pointer-events-none', e => ({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}));
    assert.ok(toastBounds.left >= 0 && toastBounds.right <= 390, 'Transcript notification must fit the mobile viewport');
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    assert.ok(await page.$(selector), 'Clearing the name must not remove the name input or academic summary');
    await page.type(selector, 'Corrected Student');
    assert.equal(await page.$eval(selector, e => e.value), 'Corrected Student');
    assert.ok(await page.$eval(selector, e => parseFloat(getComputedStyle(e).borderWidth) >= 1), 'Name field must have a visible input border');
    await page.click('#delta-tab-calculator');
    await page.click('#delta-panel-calculator button[aria-label^="GEN002 "]');
    await page.waitForFunction(() => document.querySelector('.registration-plan-report-root')?.textContent.includes('Corrected Student'));
    assert.ok(await page.$eval('.registration-plan-report-root', e => e.textContent.includes('Corrected Student')), 'Report must use corrected name');
  } finally { await browser.close(); }
});

test('Delta tabs and semester controls use readable backgrounds and centered content', { timeout: 90000 }, async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${base}/tools/gradify/planner/`);
    for (const theme of ['dark', 'light']) {
      await page.evaluate(t => localStorage.setItem('asl-theme-preference', t), theme);
      for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 900 });
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForSelector('#delta-tab-calculator');
        const result = await page.evaluate(() => {
          const tabs = [...document.querySelectorAll('#gradify-delta [role=tab]')];
          const term = [...document.querySelectorAll('#gradify-delta button')].find(e => e.textContent.includes('Semester 1'));
          const style = getComputedStyle(term);
          return { backgrounds: tabs.map(e => getComputedStyle(e).backgroundColor), center: style.textAlign,
            hoursColor: getComputedStyle(term.lastElementChild).color, titleColor: getComputedStyle(term.firstElementChild).color,
            overflow: document.documentElement.scrollWidth > innerWidth };
        });
        assert.ok(result.backgrounds.every(c => c !== 'rgb(107, 107, 107)' && c !== 'rgb(239, 239, 239)'), 'Tabs must not use browser default button fill');
        assert.equal(result.center, 'center', 'Semester title and hours must be centered');
        assert.equal(result.hoursColor, result.titleColor, 'Selected hours must use the same readable ink as the title');
        assert.equal(result.overflow, false, 'Planner must fit mobile viewport');
      }
    }
  } finally { await browser.close(); }
});
