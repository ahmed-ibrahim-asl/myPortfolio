import test from "node:test";
import assert from "node:assert/strict";

test("work exposes all five project covers and separate original/UI galleries", async () => {
  const pages = ["embedded-iot/agribot-architecture", "apps-ui/plant-care-ai", "embedded-iot/mediamate", "embedded-iot/smart-mosque-model", "robotics/amit-avr-autonomous-car"];
  const html = (await Promise.all(pages.map(async page => { const response = await fetch(`http://localhost:3000/work/${page}/`); assert.equal(response.status, 200); return response.text(); }))).join("");
  for (const key of ["agribot", "plant-care", "mediamate", "smart-mosque", "autonomous-car"]) {
    assert.ok(html.includes(`/showcase/${key}/cover.webp`), `${key} cover missing`);
    assert.ok(html.includes(`/showcase/${key}/photos-1.webp`), `${key} original missing`);
  }
  assert.equal((html.match(/<summary>Mobile app screens/g) || []).length, 3);
  for (const [key, count] of [["plant-care", 2], ["mediamate", 3], ["smart-mosque", 4]]) {
    for (let i=1; i<=count; i++) {
      const path = `/media/portfolio/showcase/${key}/ui-${i}.webp`;
      assert.ok(html.includes(path), `UI image missing: ${path}`);
      assert.equal((await fetch(`http://localhost:3000${path}`)).status, 200);
    }
  }
});
