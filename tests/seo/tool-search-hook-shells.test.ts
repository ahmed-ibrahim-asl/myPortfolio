import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ToolShell } from '../../components/tools/ToolShell';

describe('tool search-hook shell integration', () => {
  it('places the hook around dedicated ToolShell workbenches when a slug is supplied', () => {
    const markup = renderToStaticMarkup(React.createElement(ToolShell, {
      slug: 'pid-simulator',
      title: 'PID',
      description: 'PID simulator',
      children: React.createElement('div', { 'data-test-workbench': true }, 'simulator'),
    }));

    const answerIndex = markup.indexOf('data-tool-direct-answer');
    const workbenchIndex = markup.indexOf('data-test-workbench');
    const guideIndex = markup.indexOf('data-tool-search-hook');
    expect(answerIndex).toBeGreaterThan(-1);
    expect(guideIndex).toBeGreaterThan(-1);
    expect(answerIndex).toBeGreaterThan(workbenchIndex);
    expect(guideIndex).toBeGreaterThan(workbenchIndex);
  });

  it('integrates the shared search layer into Security Mission and Gradify', () => {
    const securityPage = readFileSync('app/tools/security-command-builder/page.tsx', 'utf8');
    const securityShell = readFileSync('components/tools/security-mission/SecurityMissionShell.tsx', 'utf8');
    const gradifyPage = readFileSync('app/tools/gradify/page.tsx', 'utf8');
    expect(securityPage).toMatch(/ToolSearchSchema/);
    expect(securityShell).toMatch(/ToolDirectAnswer/);
    expect(securityShell).toMatch(/ToolSearchHook/);
    expect(gradifyPage).toMatch(/ToolDirectAnswer/);
    expect(gradifyPage).toMatch(/ToolSearchHook/);
    expect(gradifyPage).toMatch(/ToolSearchSchema/);
  });

  it('gives Arabic satellite and RF tool routes the same search-hook guide as their English counterparts', () => {
    const arSatellitePage = readFileSync('app/ar/tools/satellite/[slug]/page.jsx', 'utf8');
    const arRfPage = readFileSync('app/ar/tools/rf/[slug]/page.jsx', 'utf8');
    for (const page of [arSatellitePage, arRfPage]) {
      expect(page).toMatch(/ToolSearchSchema/);
      expect(page).toMatch(/ToolSearchHook/);
      // The guide reuses the shared gutter shell so it aligns with the workbench above it.
      expect(page).toMatch(/tool-search-hook-shell/);
    }
  });
});
