import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  ToolDirectAnswer,
  ToolSearchHook,
  ToolSearchSchema,
} from '../../components/tools/ToolSearchHook';
import { personId } from '../../lib/seo';

describe('tool search-hook presentation', () => {
  it('renders useful SMPS content and a factual WebApplication entity', () => {
    const answer = renderToStaticMarkup(React.createElement(ToolDirectAnswer, { slug: 'smps-designer' }));
    const layer = renderToStaticMarkup(React.createElement(ToolSearchHook, { slug: 'smps-designer' }));
    const schemaMarkup = renderToStaticMarkup(React.createElement(ToolSearchSchema, { slug: 'smps-designer' }));

    expect(answer).toContain('How do I estimate a DCM flyback SMPS operating point?');
    expect(answer).toContain('first design to examine');
    expect(layer.match(/data-tool-question=/g)).toHaveLength(3);
    expect(layer).toContain('dateTime="2026-09-15"');
    expect(layer).toContain('href="/work/embedded-iot/agribot-architecture"');
    expect(layer).toContain('href="/contact"');

    const schemas = [...schemaMarkup.matchAll(/<script[^>]*>(.*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const application = schemas.find((item) => item['@type'] === 'WebApplication');
    const faq = schemas.find((item) => item['@type'] === 'FAQPage');
    const breadcrumbs = schemas.find((item) => item['@type'] === 'BreadcrumbList');
    expect(application.name).toBe('Flyback SMPS Design Calculator for DCM Supplies');
    expect(application.isAccessibleForFree).toBe(true);
    expect(application.offers).toEqual(expect.objectContaining({ price: '0', priceCurrency: 'USD' }));
    expect(application.author).toEqual({ '@id': personId });
    expect(application.aggregateRating).toBeUndefined();
    expect(application.review).toBeUndefined();
    expect(faq.mainEntity).toHaveLength(3);
    expect(breadcrumbs.itemListElement).toHaveLength(3);
  });

  it('renders a direct answer, worked example, and schema for every published calculator', () => {
    const answer = renderToStaticMarkup(React.createElement(ToolDirectAnswer, { slug: 'square-root-calculator' }));
    const layer = renderToStaticMarkup(React.createElement(ToolSearchHook, { slug: 'square-root-calculator' }));
    const schema = renderToStaticMarkup(React.createElement(ToolSearchSchema, { slug: 'square-root-calculator' }));
    expect(answer).toMatch(/square root/i);
    expect(layer).toContain('Enter 144');
    expect(layer.match(/data-tool-question=/g)).toHaveLength(3);
    expect(schema).toContain('WebApplication');
  });
});
