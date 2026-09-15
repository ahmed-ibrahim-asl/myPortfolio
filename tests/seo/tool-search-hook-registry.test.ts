import { describe, expect, it } from 'vitest';
import {
  getToolSearchHook,
  toolSearchHooks,
  validateToolSearchHooks,
} from '../../data/tool-search-hooks';
import { calculators } from '../../data/calculators';
import { engineeringTools } from '../../data/tools';

const expectedSlugs = [...new Set([
  ...calculators.map((tool) => tool.slug),
  ...engineeringTools.map((tool) => tool.id),
])].sort();

describe('tool search-hook registry', () => {
it('every public engineering tool has a complete, truthful search-hook record', () => {
  expect(Object.keys(toolSearchHooks).sort()).toEqual(expectedSlugs);
  expect(expectedSlugs).toHaveLength(53);
  expect(validateToolSearchHooks()).toEqual({ valid: true, issues: [] });

  const questions = new Set<string>();
  for (const slug of expectedSlugs) {
    const hook = getToolSearchHook(slug);
    expect(hook, slug).not.toBeNull();
    expect(hook!.slug).toBe(slug);
    expect(hook!.questions, slug).toHaveLength(3);
    expect(hook!.usefulFor.length, slug).toBeGreaterThanOrEqual(2);
    expect(hook!.outputs.length, slug).toBeGreaterThanOrEqual(2);
    expect(hook!.limitations.length, slug).toBeGreaterThanOrEqual(2);
    expect(hook!.evidence.href).toMatch(/^\/work\/[a-z0-9-]+\/[a-z0-9-]+\/$/);
    expect(hook!.cta.href).toBe('/contact/');
    expect(hook!.reviewedOn).toMatch(/^2026-09-(15|16)$/);
    expect(hook!.seoTitle.length, `${slug}: SEO title length`).toBeGreaterThanOrEqual(35);
    expect(hook!.seoTitle.length, `${slug}: SEO title length`).toBeLessThanOrEqual(65);
    expect(hook!.metaDescription.length, `${slug}: meta description length`).toBeGreaterThanOrEqual(120);
    expect(hook!.metaDescription.length, `${slug}: meta description length`).toBeLessThanOrEqual(165);
    expect(questions.has(hook!.primaryQuestion), hook!.primaryQuestion).toBe(false);
    questions.add(hook!.primaryQuestion);
    expect('locale' in hook!).toBe(false);
    expect('translations' in hook!).toBe(false);
  }
});

it('published calculators receive specific search content while unknown slugs stay empty', () => {
  expect(getToolSearchHook('square-root-calculator')?.primaryQuestion).toMatch(/square root/i);
  expect(getToolSearchHook('rot-explorer')?.scenario.description).toMatch(/HELLO|URYYB/i);
  expect(getToolSearchHook('security-command-builder')?.directAnswer).toMatch(/authorized/i);
  expect(getToolSearchHook('gradify')?.directAnswer).toMatch(/GPA|graduation/i);
  expect(getToolSearchHook('')).toBeNull();
  expect(getToolSearchHook('not-a-real-tool')).toBeNull();
});

it('AI builder copy covers both trainable and inference-only workflows', () => {
  const hook = getToolSearchHook('ai-script-generator')!;
  expect(hook.primaryQuestion).not.toMatch(/training project/i);
  expect(`${hook.directAnswer} ${hook.scenario.description}`).toMatch(/inference-only/i);
  expect(hook.outputs.join(' ')).not.toMatch(/training, evaluation, and deployment choices/i);
});
});
