import test from "node:test";
import assert from "node:assert/strict";

const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

test("BioVety presents the real before and after captures with the local archive", async () => {
  const response = await fetch(`${baseUrl}/work/web-development/biovety-website/`);
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.ok(html.includes('data-case-study="biovety"'));
  assert.equal((html.match(/data-archive-page-card/g) || []).length, 12);
  assert.ok(html.includes("Eurokem website archive"));
  assert.ok(html.includes("BioVety website archive"));
  assert.ok(html.includes("Page 01 of 09"));
  assert.ok(html.includes("Page 01 of 03"));
  assert.ok(html.includes("/site-archive/eurokem/home/thumbnail.webp"));
  assert.ok(html.includes("/site-archive/biovety/home/thumbnail.webp"));
  assert.ok(html.includes("Ongoing migration"));
  assert.ok(html.includes("Moved the Eurokem domain and business email to Hostinger"));
  assert.ok(html.includes("Implemented the BioVety domain and hosting on GoDaddy"));
  assert.ok(html.includes("Open the current BioVety website"));
  assert.ok(html.includes("Website redesign, catalogue structure, domain, hosting, and business email setup"));
  assert.ok(html.includes("Client website completed, wider brand migration ongoing"));
  assert.ok(!html.includes("<iframe"));
  assert.ok(!html.includes("static.wixstatic.com"));
  assert.ok(!html.includes("Local visual demo"));
});
