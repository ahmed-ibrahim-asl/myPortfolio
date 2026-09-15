import test from 'node:test';
import assert from 'node:assert/strict';

test('all supplied unique mobile screens have individual named containers', async () => {
  const html = (await Promise.all(['apps-ui/plant-care-ai', 'embedded-iot/mediamate', 'embedded-iot/smart-mosque-model'].map(async page => {
    const response = await fetch(`http://localhost:3000/work/${page}/`); assert.equal(response.status, 200); return response.text();
  }))).join('');
  assert.equal((html.match(/<figure[^>]*data-ui-screen=/g) || []).length, 20);
  for (const label of ['Patient sign in', 'Medication tracker', 'Create account', 'After-prayer adhkar']) {
    assert.ok(html.includes(label), `Missing screen: ${label}`);
  }
  assert.equal((html.match(/aria-label="Enlarge /g) || []).length, 20);
});
