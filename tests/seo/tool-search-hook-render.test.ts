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

    const json = schemaMarkup.match(/<script[^>]*>(.*)<\/script>/)?.[1];
    expect(json).toBeTruthy();
    const data = JSON.parse(json!);
    expect(data['@type']).toBe('WebApplication');
    expect(data.name).toBe('Flyback SMPS Design Calculator for DCM Supplies');
    expect(data.isAccessibleForFree).toBe(true);
    expect(data.author).toEqual({ '@id': personId });
    expect(data.aggregateRating).toBeUndefined();
    expect(data.review).toBeUndefined();
  });

  it('renders nothing for a tool without an approved record', () => {
    expect(renderToStaticMarkup(React.createElement(ToolDirectAnswer, { slug: 'square-root-calculator' }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(ToolSearchHook, { slug: 'square-root-calculator' }))).toBe('');
    expect(renderToStaticMarkup(React.createElement(ToolSearchSchema, { slug: 'square-root-calculator' }))).toBe('');
  });
});
