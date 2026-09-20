import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const paperTitle = "An Enhanced U-Net Architecture for Semantic Segmentation of Aerial Images from Egypt";

test("enhanced U-Net publication includes the supplied post-conference record", async () => {
  const feed = JSON.parse(await readFile("data/publications.json", "utf8"));
  const paper = feed.publications.find(({ title }) => title === paperTitle);

  assert.ok(paper);
  assert.equal(paper.conferenceEvidence.href, "https://web.facebook.com/share/p/1CKC3wMXTT/");
  assert.match(paper.conferenceEvidence.caption, /after the conference/i);
  assert.match(paper.conferenceEvidence.alt, /certificate presentation/i);
  assert.doesNotMatch(paper.conferenceEvidence.alt, /\b[A-Z][a-z]+ [A-Z][a-z]+\b/);
  await access(path.join("public", paper.conferenceEvidence.image));
});

test("publication record renders evidence as a linked figure", async () => {
  const component = await readFile("components/WorkResearchAndTeaching.tsx", "utf8");
  assert.match(component, /publication-conference-evidence/);
  assert.match(component, /item\.conferenceEvidence/);
  assert.match(component, /View the post-conference record/);
});
