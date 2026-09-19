import { describe, expect, it } from "vitest";
import type { Metadata } from "next";
import sitemap from "../../app/sitemap.js";
import { generateMetadata as legacyMetadata } from "../../app/writing/[slug]/page";
import { getAllPosts } from "../../lib/content";
import { projects } from "../../data/portfolio";
import { groupWork } from "../../data/work-categories";
import type { Project } from "../../types/portfolio";
import { satelliteCalculators } from "../../data/satellite-course.js";
import { rfCalculators } from "../../data/rf-calculators.js";
import { toolCategories } from "../../data/tool-categories.js";
import { engineeringTools as tools } from "../../data/tools.js";
import { generateMetadata as satelliteToolMetadata } from "../../app/tools/satellite/[slug]/page.jsx";
import { generateMetadata as rfToolMetadata } from "../../app/tools/rf/[slug]/page.jsx";

const base = "https://eng-asl.com";

describe("search discovery contract", () => {
  it("lists canonical notes pages, not duplicate legacy writing pages", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${base}/notes/`);
    expect(urls.some((url) => url.includes("/writing/"))).toBe(false);
    expect(getAllPosts().length).toBeGreaterThan(0);
    for (const post of getAllPosts()) expect(urls).toContain(`${base}/notes/${post.slug}/`);
  });

  it("lets crawlers discover every published project and its collection", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain(`${base}/work/embedded-iot/toolguard/`);
    const groupedProjects = groupWork(projects).flatMap((group) =>
      group.projects.map((project: Project) => project.slug)
    );
    expect(groupedProjects.sort()).toEqual(projects.map((project) => project.slug).sort());
    for (const group of groupWork(projects)) {
      expect(urls).toContain(`${base}/work/${group.id}/`);
      for (const project of group.projects)
        expect(urls).toContain(`${base}/work/${group.id}/${project.slug}/`);
    }
  });

  it("keeps preview pages and drafts out and emits unique URLs", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some((url) => /\/concepts\/|\/ui-preview\//.test(url))).toBe(false);
    for (const post of getAllPosts({ includeDrafts: true }).filter((post) => post.draft)) {
      expect(urls).not.toContain(`${base}/notes/${post.slug}/`);
    }
  });

  it("keeps legacy article URLs usable but canonicalizes the identical notes version", async () => {
    const post = getAllPosts()[0];
    const metadata: Metadata = await legacyMetadata({
      params: Promise.resolve({ slug: post.slug })
    });
    expect(metadata.alternates?.canonical).toBe(`${base}/notes/${post.slug}/`);
  });

  it("registers and canonicalizes the satellite and RF calculators", async () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(satelliteCalculators).toHaveLength(5);
    expect(rfCalculators).toHaveLength(5);
    expect(urls).not.toContain(`${base}/tools/satellite-communication/`);
    expect(toolCategories.some((category) => category.slug === "satellite")).toBe(true);
    expect(toolCategories.some((category) => category.slug === "rf-engineering")).toBe(true);
    expect(tools.some((tool) => tool.href === "/tools/satellite-communication/")).toBe(false);

    for (const tool of satelliteCalculators) {
      const path = `/tools/satellite/${tool.slug}/`;
      expect(urls).toContain(`${base}${path}`);
      expect(tools.some((entry) => entry.href === path)).toBe(false);
      const metadata = await satelliteToolMetadata({
        params: Promise.resolve({ slug: tool.slug })
      });
      expect(metadata.alternates?.canonical).toBe(`${base}${path}`);
    }

    for (const tool of rfCalculators) {
      const path = `/tools/rf/${tool.slug}/`;
      expect(urls).toContain(`${base}${path}`);
      const metadata = await rfToolMetadata({ params: Promise.resolve({ slug: tool.slug }) });
      expect(metadata.alternates?.canonical).toBe(`${base}${path}`);
    }
  });
});
