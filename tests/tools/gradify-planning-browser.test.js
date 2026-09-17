import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import puppeteer from 'puppeteer-core';
import { ensureGradifyTranscript } from './gradify-fixture.js';

const base = process.env.SITE_RESPONSIVE_BASE_URL || 'http://localhost:3000';
const executablePath = process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
async function clickText(page, text) {
  const clicked = await page.evaluate(text => {
    const button = [...document.querySelectorAll('#gradify-delta button')].find(e => e.textContent.trim() === text && e.getClientRects().length);
    button?.click(); return Boolean(button);
  }, text);
  assert.ok(clicked, `Button exists: ${text}`);
}
async function upload(page) {
  await page.goto(`${base}/tools/gradify/planner/`, { waitUntil: 'networkidle0' });
  await (await page.$('#gradify-delta input[type=file]')).uploadFile(ensureGradifyTranscript());
  await page.waitForSelector('.delta-current-courses, [aria-label="Full plan target CGPA"]');
}
test('reviewed full and single-term generation, current-course names, exclusions and goal precision', { timeout: 120000 }, async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  const errors = [];
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewport({ width: 1440, height: 1000 });
    await upload(page);
    await clickText(page, 'Middle of Semester');
    assert.ok(await page.$eval('.delta-current-courses', e => e.textContent.includes('BAS011: Engineering Mathematics (1)')));
    await page.evaluate(() => [...document.querySelectorAll('.delta-current-courses label')].find(e => e.textContent.includes('BAS011:')).querySelector('input').click());
    await page.select('[aria-label="First plan term"]', 'Fall');
    await clickText(page, 'Generate Full Plan');
    assert.equal(await page.$eval('.delta-planning-review button.bg-indigo-600', e => e.disabled), true);
    await page.click('.delta-planning-review .delta-review-confirm input');
    await clickText(page, 'Generate Full Plan with reviewed settings');
    await page.waitForFunction(() => document.querySelector('#delta-panel-planner')?.textContent.includes('Graduation Timeline'));
    const selected = await page.$$eval('#plan-content [class*="bg-indigo-50/50"] p', es => es.map(e => e.textContent).join(' '));
    assert.match(selected, /BAS011/);
    await clickText(page, 'Reset');
    await clickText(page, 'Before Registration');
    // Semester generation goes through the same review and honors all-plan exclusions.
    await clickText(page, 'Auto-Generate');
    await page.evaluate(() => {
      const row = [...document.querySelectorAll('.delta-availability-row')].find(e => e.textContent.includes('BAS011:'));
      row.querySelectorAll('input[type=checkbox]')[1].click();
    });
    await page.click('.delta-planning-review .delta-review-confirm input');
    await clickText(page, 'Generate this semester');
    await page.waitForFunction(() => !document.querySelector('#plan-content .delta-planning-review'));
    const planned = await page.$$eval('#plan-content [class*="bg-indigo-50/50"] p', es => es.map(e => e.textContent).join(' '));
    assert.ok(planned.length > 0);
    assert.doesNotMatch(planned, /BAS011/);
    await page.click('#delta-tab-calculator');
    for (const [label, value] of [['GPA Hours','164'],['Passed Hours','160'],['Previous CGPA','1.96']]) {
      await page.click(`[aria-label="${label}"]`, { clickCount: 3 });
      await page.keyboard.down('Control'); await page.keyboard.press('A'); await page.keyboard.up('Control');
      await page.type(`[aria-label="${label}"]`, value);
    }
    await page.click('#delta-tab-planner');
    assert.doesNotMatch(await page.$eval('#plan-content', e => e.textContent), /Goal Achieved/);
    assert.match(await page.$eval('#plan-content', e => e.textContent), /1\.960 is below 2/);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); }
});

test('planning review fits desktop and mobile in both themes', { timeout: 120000 }, async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await upload(page);
    await clickText(page, 'Generate Full Plan');
    await mkdir('test-results/gradify', { recursive: true });
    for (const theme of ['dark', 'light']) for (const width of [1440, 390]) {
      await page.setViewport({ width, height: 960 });
      await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
      await page.$eval('#delta-panel-planner .delta-planning-review', e => e.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.screenshot({ path: `test-results/gradify/review-${theme}-${width}.png` });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      const colors = await page.evaluate(() => {
        const root = document.querySelector('#gradify-delta');
        return ['text-emerald-600','text-red-600','text-indigo-600'].map(className => {
          const span = document.createElement('span'); span.className = className; root.append(span);
          const color = getComputedStyle(span).color; span.remove(); return color;
        });
      });
      assert.equal(new Set(colors).size, 3, 'Success, error and action colors stay distinct');
    }
  } finally { await browser.close(); }
});
