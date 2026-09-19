import test from "node:test";
import assert from "node:assert/strict";

async function loadProject(path) {
  const response = await fetch(`http://localhost:3000${path}`);
  assert.equal(response.status, 200, `${path} did not render`);
  return response.text();
}

test("Wireless ROV presents the real prototype, SolidWorks design, and related Q1 paper", async () => {
  const html = await loadProject("/work/embedded-iot/wireless-rov-control/");

  assert.match(html, /wireless-rov\/cover-asl-v1\.png/);
  assert.match(html, /wireless-rov\/prototype\.webp/);
  assert.match(html, /wireless-rov\/solidworks-design\.webp/);
  assert.match(html, /AI-styled project visualization/);
  assert.match(html, /View original prototype and SolidWorks design/);
  assert.match(html, /Read the related Q1 Scientific Reports paper/);
  assert.match(html, /s41598-025-23281-8/);
});

test("AgriBot does not present a generated image as an original project photo", async () => {
  const html = await loadProject("/work/embedded-iot/agribot-architecture/");

  assert.doesNotMatch(html, /Original build photos below/);
  assert.doesNotMatch(html, /View original project images/);
  assert.match(html, /Mobile app screens/);
  assert.match(html, /View award and certificates/);
});
