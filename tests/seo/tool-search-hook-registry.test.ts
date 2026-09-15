import { describe, expect, it } from 'vitest';
import {
  getToolSearchHook,
  toolSearchHooks,
  validateToolSearchHooks,
} from '../../data/tool-search-hooks';

const expectedSlugs = [
  'smps-designer',
  'buck-converter-designer',
  'control-design-assistant',
  'logic-gate-designer',
  'cascaded-opamp-gain-designer',
  '555-timer-astable-circuit-calculator',
  'pid-simulator',
  'sensor-code-generator',
  'battery-estimator',
  'ai-script-generator',
].sort();

describe('tool search-hook registry', () => {
it('priority engineering tools have complete, truthful search-hook records', () => {
  expect(Object.keys(toolSearchHooks).sort()).toEqual(expectedSlugs);
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
    expect(hook!.reviewedOn).toBe('2026-09-15');
    expect(questions.has(hook!.primaryQuestion), hook!.primaryQuestion).toBe(false);
    questions.add(hook!.primaryQuestion);
    expect('locale' in hook!).toBe(false);
    expect('translations' in hook!).toBe(false);
  }
});

it('unregistered tools do not receive generic search filler', () => {
  expect(getToolSearchHook('square-root-calculator')).toBeNull();
  expect(getToolSearchHook('')).toBeNull();
});

it('AI builder copy covers both trainable and inference-only workflows', () => {
  const hook = getToolSearchHook('ai-script-generator')!;
  expect(hook.primaryQuestion).not.toMatch(/training project/i);
  expect(`${hook.directAnswer} ${hook.scenario.description}`).toMatch(/inference-only/i);
  expect(hook.outputs.join(' ')).not.toMatch(/training, evaluation, and deployment choices/i);
});
});
