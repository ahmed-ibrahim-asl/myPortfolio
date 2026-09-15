export interface TranscriptBackendData {
  limit?: any;
  remaining: any[];
  failed: any[];
  withdrawn: any[];
  transferred: any[];
  sameCourseImprovements: any[];
  electiveReplacements: any[];
}

export function replaceTranscriptBackendData(
  data: Partial<TranscriptBackendData> = {},
): TranscriptBackendData {
  return {
    limit: data.limit,
    remaining: data.remaining ?? [],
    failed: data.failed ?? [],
    withdrawn: data.withdrawn ?? [],
    transferred: data.transferred ?? [],
    sameCourseImprovements: data.sameCourseImprovements ?? [],
    electiveReplacements: data.electiveReplacements ?? [],
  };
}
