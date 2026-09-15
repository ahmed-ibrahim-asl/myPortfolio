import test from 'node:test';
import assert from 'node:assert/strict';
import puppeteer from 'puppeteer-core';

const base = process.env.SITE_RESPONSIVE_BASE_URL || 'http://localhost:3000';
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const routes = [
  '555-timer-astable-circuit-calculator',
  'smps-designer',
  'buck-converter-designer',
  'control-design-assistant',
  'logic-gate-designer',
  'cascaded-opamp-gain-designer',
  'pid-simulator',
  'sensor-code-generator',
  'battery-estimator',
  'ai-script-generator',
  'square-root-calculator',
  'rot-explorer',
  'security-command-builder',
  'gradify',
];

test('priority tool hooks are visible, structured, and responsive', async () => {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    for (const width of [390, 1366]) {
      await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
      for (const slug of routes) {
        const response = await page.goto(`${base}/tools/${slug}/`, { waitUntil: 'networkidle0' });
        assert.equal(response?.status(), 200, slug);
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
        const result = await page.evaluate(() => {
          const rgb = (value) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
          const luminance = (value) => {
            const [r, g, b] = rgb(value).map((channel) => {
              const normalized = channel / 255;
              return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
          };
          const backgroundOf = (element) => {
            let current = element;
            while (current) {
              const color = getComputedStyle(current).backgroundColor;
              if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
              current = current.parentElement;
            }
            return getComputedStyle(document.body).backgroundColor;
          };
          const contrastOf = (element) => {
            const foreground = luminance(getComputedStyle(element).color);
            const background = luminance(backgroundOf(element));
            return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
          };
          const answer = document.querySelector('[data-tool-direct-answer]');
          const guide = document.querySelector('[data-tool-search-hook]');
          const interactive = [...document.querySelectorAll('input, select, textarea, button, a')].find((element) =>
            answer && guide
            && Boolean(answer.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)
            && Boolean(element.compareDocumentPosition(guide) & Node.DOCUMENT_POSITION_FOLLOWING));
          const questions = [...document.querySelectorAll('[data-tool-question]')];
          const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map((node) => { try { return JSON.parse(node.textContent || '{}'); } catch { return null; } })
            .filter(Boolean);
          const toolSchema = schemas.find((item) => item['@type'] === 'WebApplication');
          return {
            hasAnswer: Boolean(answer),
            hasGuide: Boolean(guide),
            correctOrder: Boolean(answer && interactive && guide
              && (answer.compareDocumentPosition(interactive) & Node.DOCUMENT_POSITION_FOLLOWING)
              && (interactive.compareDocumentPosition(guide) & Node.DOCUMENT_POSITION_FOLLOWING)),
            questionCount: questions.length,
            questionsVisible: questions.every((item) => {
              const rect = item.getBoundingClientRect();
              const style = getComputedStyle(item);
              return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
            }),
            evidenceHref: guide?.querySelector('a[href^="/work/"]')?.getAttribute('href') || '',
            contactHref: guide?.querySelector('a[href^="/contact"]')?.getAttribute('href') || '',
            twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '',
            twitterDescription: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || '',
            schemaType: toolSchema?.['@type'],
            free: toolSchema?.isAccessibleForFree,
            overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            contrast: [...document.querySelectorAll('[data-tool-direct-answer] p:last-child, [data-tool-question] p, [data-tool-search-hook] a')]
              .map(contrastOf),
          };
        });
        assert.equal(result.hasAnswer, true, `${slug}: direct answer`);
        assert.equal(result.hasGuide, true, `${slug}: guide`);
        assert.equal(result.correctOrder, true, `${slug}: document order`);
        assert.equal(result.questionCount, 3, `${slug}: questions`);
        assert.equal(result.questionsVisible, true, `${slug}: visible questions`);
        assert.match(result.evidenceHref, /^\/work\//, `${slug}: evidence link`);
        assert.match(result.contactHref, /^\/contact/, `${slug}: contact link`);
        assert.ok(result.twitterTitle.length > 10 && !result.twitterTitle.includes('Hardware Prototypes & IoT Products'), `${slug}: specific Twitter title`);
        assert.ok(result.twitterDescription.length > 40, `${slug}: specific Twitter description`);
        assert.equal(result.schemaType, 'WebApplication', `${slug}: schema`);
        assert.equal(result.free, true, `${slug}: free tool schema`);
        assert.ok(result.overflow <= 1, `${slug}: ${result.overflow}px horizontal overflow at ${width}px`);
        assert.ok(Math.min(...result.contrast) >= 4.5, `${slug}: contrast ${Math.min(...result.contrast).toFixed(2)} in ${theme} theme`);
        }
      }
    }
  } finally {
    await browser.close();
  }
});
