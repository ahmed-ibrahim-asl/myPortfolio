import test from "node:test";
import assert from "node:assert/strict";

test("work exposes project covers while only verified originals use the original-image gallery", async () => {
  const pages = ["embedded-iot/agribot-architecture", "apps-ui/plant-care-ai", "embedded-iot/mediamate", "embedded-iot/smart-mosque-model", "robotics/amit-avr-autonomous-car"];
  const html = (await Promise.all(pages.map(async page => { const response = await fetch(`http://localhost:3000/work/${page}/`); assert.equal(response.status, 200); return response.text(); }))).join("");
  for (const key of ["agribot", "plant-care", "mediamate", "smart-mosque", "autonomous-car"]) {
    assert.ok(html.includes(`/showcase/${key}/cover.webp`), `${key} cover missing`);
  }
  for (const key of ["plant-care", "mediamate", "smart-mosque", "autonomous-car"]) {
    assert.ok(html.includes(`/showcase/${key}/photos-1.webp`), `${key} original missing`);
  }
  assert.ok(!html.includes("/showcase/agribot/photos-1.webp"), "AgriBot non-original image must not appear in the original-image gallery");
  assert.equal((html.match(/<summary>Mobile app screens/g) || []).length, 4);
  for (const [key, count] of [["plant-care", 2], ["mediamate", 3], ["smart-mosque", 4]]) {
    for (let i=1; i<=count; i++) {
      const path = `/media/portfolio/showcase/${key}/ui-${i}.webp`;
      assert.ok(html.includes(path), `UI image missing: ${path}`);
      assert.equal((await fetch(`http://localhost:3000${path}`)).status, 200);
    }
  }
});
