import test from 'node:test';
import assert from 'node:assert/strict';

const testBaseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
test('work hub leads to category and isolated project pages', async () => {
 const hub = await (await fetch(`${testBaseUrl}/work/`)).text();
 assert.ok(hub.includes('href="/work/embedded-iot/"'));
 assert.ok(!hub.includes('data-ui-screen='));
 const category = await fetch(`${testBaseUrl}/work/embedded-iot/`);
 assert.equal(category.status,200);
 const listing = await category.text();
 assert.ok(listing.includes('href="/work/embedded-iot/mediamate/"'));
 assert.ok(!listing.includes('data-ui-screen='));
 const detail = await fetch(`${testBaseUrl}/work/embedded-iot/mediamate/`);
 assert.equal(detail.status,200);
 const html = await detail.text();
 assert.equal((html.match(/<figure[^>]*data-ui-screen=/g)||[]).length,12);
 assert.ok(html.includes('aria-label="Breadcrumb"'));
});
