import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ToolsLayout from '../../app/tools/layout';

it('puts portfolio discovery after the usable tool with crawlable internal links', () => {
  const html = renderToStaticMarkup(createElement(ToolsLayout, { children: createElement('div', { id: 'calculator' }, 'Calculator') }));
  const document = new DOMParser().parseFromString(html, 'text/html');
  const bridge = document.querySelector('[aria-label="About the tool creator"]');
  expect(bridge).not.toBeNull();
  expect(html.indexOf('id="calculator"')).toBeLessThan(html.indexOf('About the tool creator'));
  // Next's test runtime normalizes trailing slashes differently from its export build.
  const paths = [...bridge!.querySelectorAll('a')].map(link => link.getAttribute('href')?.replace(/\/$/, ''));
  expect(paths).toContain('/work/embedded-iot');
  expect(paths).toContain('/contact');
  expect(paths).toContain('/about');
  expect(paths).toContain('/notes');
});
