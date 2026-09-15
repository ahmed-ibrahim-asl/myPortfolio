import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WorkCollection } from '../../components/WorkCollection';
import { projects } from '../../data/portfolio';

const expected = ['aqua-sync', 'toolguard', 'fall-detection-system', 'muscle-activity-monitoring', 'firewire-enterprise-ota'];

it('identifies every source-based AI cover and keeps original evidence', () => {
  const html = renderToStaticMarkup(createElement(WorkCollection, { category: 'embedded-iot' }));
  for (const slug of expected) {
    const project = projects.find(item => item.slug === slug);
    expect(project, slug).toBeDefined();
    expect(project!.image).toContain('cover-asl-v1.webp');
    expect(project!.imageNote?.toLowerCase()).toContain('ai-styled');
    expect(project!.gallery?.length, `${slug} original evidence`).toBeGreaterThan(0);
    expect(html).toContain(`id="${slug}"`);
    expect(html).toContain(project!.imageNote!);
  }
});
