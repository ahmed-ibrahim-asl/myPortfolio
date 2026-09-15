import test from 'node:test';
import assert from 'node:assert/strict';
for (const [slug, count] of [['aqua-sync',0],['toolguard',3],['fall-detection-system',2],['muscle-activity-monitoring',2],['agribot-architecture',11]]) {
 test(`${slug} has its own page and expected screen containers`, async () => {
  const response = await fetch(`http://localhost:3000/work/embedded-iot/${slug}/`);
  assert.equal(response.status,200);
  const html = await response.text();
  assert.equal((html.match(/data-ui-screen=/g)||[]).length,count);
  if (slug === 'aqua-sync') {
   assert.match(html,/Aqua Sync 2\.0\.0/);
   assert.match(html,/uSNevyW1fgwfgnIF2y8q0T/);
   assert.match(html,/CrowPanel HMI/);
  }
  const images = [...html.matchAll(/src="(\/media\/portfolio\/showcase\/[^" ]+)"/g)].map(match=>match[1]);
  for (const src of new Set(images)) assert.equal((await fetch(`http://localhost:3000${src}`)).status,200,src);
 });
}
