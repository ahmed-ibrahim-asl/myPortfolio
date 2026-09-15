import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { groupWork } from "../../data/work-categories.js";

test("every portfolio project belongs to exactly one category", () => {
  const source = readFileSync(new URL("../../data/portfolio.ts", import.meta.url), "utf8").split("export const projects: Project[] = [")[1].split("export const tutorials")[0];
  const projects = [...source.matchAll(/slug: "([^"]+)"[\s\S]*?category: "([^"]+)"/g)].map(([, slug, category]) => ({ slug, category }));
  const groups = groupWork(projects);
  const slugs = groups.flatMap(group => group.projects.map(project => project.slug));
  assert.equal(slugs.length, projects.length);
  assert.equal(new Set(slugs).size, projects.length);
  assert.equal(groups[0].title, "Web Development");
  assert.deepEqual(groups[0].projects.map(project => project.slug), ["biovety-website", "miraj-academy-website"]);
});
