import { describe, expect, it } from 'vitest';
import { replaceTranscriptBackendData } from '../../components/tools/gradify/delta/services/transcriptBackendData';

describe('transcript backend state', () => {
  it('replaces old withdrawn data when a new response omits it', () => {
    expect(replaceTranscriptBackendData({ remaining: [{ code: 'ECE222' }] })).toMatchObject({
      remaining: [{ code: 'ECE222' }],
      failed: [],
      withdrawn: [],
      transferred: [],
      sameCourseImprovements: [],
      electiveReplacements: [],
    });
  });

  it('returns empty transcript collections when clearing', () => {
    expect(replaceTranscriptBackendData()).toMatchObject({
      remaining: [],
      failed: [],
      withdrawn: [],
      transferred: [],
      sameCourseImprovements: [],
      electiveReplacements: [],
    });
  });
});
