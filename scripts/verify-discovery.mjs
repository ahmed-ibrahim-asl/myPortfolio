import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const origin = process.env.SITE_TEST_URL || 'http://localhost:3000';
const canonicalBase = 'https://ahmed-ibrahim-asl.github.io/myPortfolio';
const pages = ['/tools/smps-designer/', '/tools/gradify/', '/tools/battery-estimator/'];
for (const path of pages) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  const document = new JSDOM(await response.text()).window.document;
  assert.equal(document.querySelector('link[rel="canonical"]')?.href, canonicalBase + path);
  assert.equal(document.querySelectorAll('[aria-label="About the tool creator"]').length, 1);
  console.log(`PASS tool HTML: ${path}`);
}

const collection = await fetch(origin + '/work/embedded-iot/');
assert.equal(collection.status, 200);
const document = new JSDOM(await collection.text()).window.document;
const covers = [...document.images].filter(image => image.src.includes('cover-asl-v1.webp'));
const expectedCovers = ['aqua-sync', 'toolguard', 'fall-detection-system', 'muscle-activity-monitoring', 'firewire-enterprise-ota'];
assert.equal(covers.length, 5, 'all requested covers must appear in the embedded collection');
for (const slug of expectedCovers) {
  const card = document.querySelector(`#${slug}`);
  assert.ok(card, `${slug} project card`);
  assert.ok(card.textContent.toLowerCase().includes('ai-styled'), `${slug} AI disclosure`);
  assert.ok(card.querySelector('img[src*="cover-asl-v1.webp"]'), `${slug} versioned cover`);
}
for (const image of covers) {
  const response = await fetch(new URL(image.src, origin));
  assert.equal(response.status, 200, image.src);
  assert.ok(response.headers.get('content-type')?.includes('image/webp'));
  console.log(`PASS cover: ${image.src}`);
}

const xmlResponse = await fetch(origin + '/sitemap.xml');
assert.equal(xmlResponse.status, 200);
const sitemap = new JSDOM(await xmlResponse.text(), { contentType: 'text/xml' }).window.document;
const urls = [...sitemap.querySelectorAll('loc')].map(item => item.textContent);
assert.ok(urls.includes(canonicalBase + '/notes/'));
assert.ok(urls.includes(canonicalBase + '/work/embedded-iot/toolguard/'));
assert.ok(!urls.some(url => url.includes('/writing/')));
assert.equal(urls.length, new Set(urls).size);
console.log(`PASS sitemap: ${urls.length} unique canonical URLs`);

const preview = await fetch(origin + '/concepts/mobile-hero.html');
assert.equal(preview.status, 200);
const previewDocument = new JSDOM(await preview.text()).window.document;
assert.ok(previewDocument.querySelector('meta[name="robots"]')?.content.includes('noindex'));
for (const link of previewDocument.querySelectorAll('a')) {
  const response = await fetch(new URL(link.getAttribute('href'), origin + '/concepts/mobile-hero.html'));
  assert.equal(response.status, 200, link.href);
}
console.log('PASS preview: noindex and all destination links resolve');
