import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const rgb = color => color.match(/[\d.]+/g).slice(0, 3).map(Number);
const luminance = color => rgb(color)
  .map(channel => channel / 255)
  .map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (foreground, background) => {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
};

test('mobile homepage leads with a proportional clear-service identity while desktop keeps its editorial hero', async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const readMobileHero = () => page.evaluate(() => {
      const identity = document.querySelector('.home-mobile-identity');
      const title = document.querySelector('.home-title-stack h1');
      const intro = document.querySelector('.home-intro');
      const actions = [...document.querySelectorAll('.home-actions a')];
      const arabic = document.querySelector('.home-title-ar-mobile');
      const portrait = identity?.querySelector('img');
      const name = identity?.querySelector('strong');
      const role = identity?.querySelector('small');
      const rect = element => element?.getBoundingClientRect();
      const font = element => element ? Number.parseFloat(getComputedStyle(element).fontSize) : null;
      const domOrder = [identity, title, intro, document.querySelector('.home-actions'), arabic]
        .map(element => [...document.querySelectorAll('.home-hero-copy *')].indexOf(element));
      return {
        title: title?.innerText.trim(),
        intro: intro?.innerText.trim(),
        arabic: arabic?.innerText.trim(),
        identityVisible: Boolean(identity && getComputedStyle(identity).display !== 'none'),
        desktopPortraitHidden: getComputedStyle(document.querySelector('.home-portrait')).display === 'none',
        portraitWidth: rect(portrait)?.width,
        nameFont: font(name), roleFont: font(role), titleFont: font(title), introFont: font(intro),
        actionHeights: actions.map(action => rect(action).height),
        actionWidths: actions.map(action => rect(action).width),
        actionsWidth: rect(document.querySelector('.home-actions'))?.width,
        actionLabels: actions.map(action => action.innerText.trim()),
        order: [rect(identity)?.top, rect(title)?.top, rect(intro)?.top, rect(actions[0])?.top, rect(arabic)?.top],
        domOrder,
        overflow: document.documentElement.scrollWidth - innerWidth,
        h1Count: document.querySelectorAll('h1').length,
        pageBackground: getComputedStyle(document.body).backgroundColor,
        titleColor: getComputedStyle(title).color,
        introColor: getComputedStyle(intro).color,
      };
    });

    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    for (const width of [360, 390, 430]) {
      await page.setViewport({ width, height: 844, deviceScaleFactor: 1 });
      for (const theme of ['dark', 'light']) {
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        const mobile = await readMobileHero();
        assert.equal(mobile.title, 'Your hardware idea. A working prototype.');
        assert.equal(mobile.intro, 'Firmware, connected electronics, and usable interfaces. I bring the pieces together so you can test your idea in the real world.');
        assert.equal(mobile.arabic, 'فكّك المشكلة. وابني الحل.');
        assert.equal(mobile.identityVisible, true);
        assert.equal(mobile.desktopPortraitHidden, true);
        assert.ok(mobile.portraitWidth >= 72 && mobile.portraitWidth <= 84, `${width}/${theme}: ${mobile.portraitWidth}`);
        assert.equal(mobile.nameFont, 16);
        assert.equal(mobile.roleFont, 12);
        assert.ok(mobile.titleFont >= 43 && mobile.titleFont <= 55, `${width}/${theme}: ${mobile.titleFont}`);
        assert.equal(mobile.introFont, 16);
        assert.deepEqual(mobile.actionLabels, ['SEE SELECTED PROJECTS', 'EXPLORE FREE ENGINEERING TOOLS']);
        assert.equal(mobile.actionWidths.length, 2);
        assert.ok(mobile.actionHeights.every(height => height >= 48), `${width}/${theme}: ${mobile.actionHeights}`);
        assert.ok(mobile.actionWidths.every(actionWidth => Math.abs(actionWidth - mobile.actionsWidth) <= 1), `${width}/${theme}: actions are not full width`);
        assert.deepEqual(mobile.order, [...mobile.order].sort((a, b) => a - b));
        assert.deepEqual(mobile.domOrder, [...mobile.domOrder].sort((a, b) => a - b));
        assert.ok(mobile.overflow <= 0, `${width}/${theme}: ${mobile.overflow}`);
        assert.equal(mobile.h1Count, 1);
        assert.ok(contrast(mobile.titleColor, mobile.pageBackground) >= 4.5, `${width}/${theme}: title contrast`);
        assert.ok(contrast(mobile.introColor, mobile.pageBackground) >= 4.5, `${width}/${theme}: intro contrast`);
      }
    }

    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });
    await page.reload({ waitUntil: 'networkidle0' });
    const desktop = await page.evaluate(() => ({
      title: document.querySelector('.home-title-stack h1')?.innerText.trim(),
      mobileIdentityHidden: getComputedStyle(document.querySelector('.home-mobile-identity')).display === 'none',
      portraitVisible: getComputedStyle(document.querySelector('.home-portrait')).display !== 'none',
      portraitLoaded: document.querySelector('.home-portrait img')?.complete && document.querySelector('.home-portrait img')?.naturalWidth > 0,
      h1Count: document.querySelectorAll('h1').length,
    }));
    assert.equal(desktop.title, 'Break the problem down.');
    assert.equal(desktop.mobileIdentityHidden, true);
    assert.equal(desktop.portraitVisible, true);
    assert.equal(desktop.portraitLoaded, true);
    assert.equal(desktop.h1Count, 1);
  } finally {
    await browser.close();
  }
});
