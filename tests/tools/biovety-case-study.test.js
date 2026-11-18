import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

test("BioVety includes a local legacy demo and the migration case study", async () => {
  const response = await fetch(`${baseUrl}/work/web-development/biovety-website/`);
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.ok(html.includes('data-case-study="biovety"'));
  assert.ok(html.includes('data-legacy-demo="eurokem"'));
  assert.ok(html.includes("Ongoing migration"));
  assert.ok(html.includes("Hostinger"));
  assert.ok(html.includes("GoDaddy"));
  assert.ok(html.includes("Open the current BioVety website"));
  assert.ok(html.includes("Website redesign, catalogue structure, domain, hosting, and business email setup"));
  assert.ok(html.includes("Client website completed, wider brand migration ongoing"));
  assert.ok(!html.includes("<iframe"));
  assert.ok(!html.includes("static.wixstatic.com"));
});
