import { describe, expect, it } from 'vitest';
import type { Metadata } from 'next';
import sitemap from '../../app/sitemap.js';
import { generateMetadata as legacyMetadata } from '../../app/writing/[slug]/page';
import { getAllPosts } from '../../lib/content';
import { projects } from '../../data/portfolio';
import { groupWork } from '../../data/work-categories';
import type { Project } from '../../types/portfolio';

const base = 'https://ahmed-ibrahim-asl.github.io/myPortfolio';

describe('search discovery contract', () => {
  it('lists canonical notes pages, not duplicate legacy writing pages', () => {
    const urls = sitemap().map(entry => entry.url);
    expect(urls).toContain(`${base}/notes/`);
    expect(urls.some(url => url.includes('/writing/'))).toBe(false);
    expect(getAllPosts().length).toBeGreaterThan(0);
    for (const post of getAllPosts()) expect(urls).toContain(`${base}/notes/${post.slug}/`);
  });

  it('lets crawlers discover every published project and its collection', () => {
    const urls = sitemap().map(entry => entry.url);
    expect(urls).toContain(`${base}/work/embedded-iot/toolguard/`);
    const groupedProjects = groupWork(projects).flatMap(group => group.projects.map((project: Project) => project.slug));
    expect(groupedProjects.sort()).toEqual(projects.map(project => project.slug).sort());
    for (const group of groupWork(projects)) {
      expect(urls).toContain(`${base}/work/${group.id}/`);
      for (const project of group.projects) expect(urls).toContain(`${base}/work/${group.id}/${project.slug}/`);
    }
  });

  it('keeps preview pages and drafts out and emits unique URLs', () => {
    const urls = sitemap().map(entry => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.some(url => /\/concepts\/|\/ui-preview\//.test(url))).toBe(false);
    for (const post of getAllPosts({ includeDrafts: true }).filter(post => post.draft)) {
      expect(urls).not.toContain(`${base}/notes/${post.slug}/`);
    }
  });

  it('keeps legacy article URLs usable but canonicalizes the identical notes version', async () => {
    const post = getAllPosts()[0];
    const metadata: Metadata = await legacyMetadata({ params: Promise.resolve({ slug: post.slug }) });
    expect(metadata.alternates?.canonical).toBe(`${base}/notes/${post.slug}/`);
  });
});
