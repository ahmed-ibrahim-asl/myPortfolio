import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
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
    expect(answerIndex).toBeLessThan(workbenchIndex);
    expect(guideIndex).toBeGreaterThan(workbenchIndex);
  });
});
