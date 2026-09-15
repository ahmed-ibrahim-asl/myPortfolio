import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractPdfText } from '../../components/tools/gradify/delta/services/pdfParser';

const pdfFixture = vi.hoisted(() => ({
  getDocument: vi.fn(),
  destroy: vi.fn(async () => {}),
  workerOptions: { workerSrc: '' },
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: pdfFixture.workerOptions,
  getDocument: pdfFixture.getDocument,
}));

const file = { arrayBuffer: async () => new ArrayBuffer(8) } as File;

describe('browser PDF extraction', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('reads every page with the local worker and releases PDF resources', async () => {
    pdfFixture.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: async (pageNumber: number) => ({
          getTextContent: async () => ({ items: [{ str: `Page ${pageNumber}` }, { type: 'beginMarkedContent' }, { str: 'ECE111' }] }),
        }),
      }),
      destroy: pdfFixture.destroy,
    });
    expect(await extractPdfText(file)).toBe('Page 1\nECE111\nPage 2\nECE111\n');
    expect(pdfFixture.workerOptions.workerSrc).toBe(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/vendor/gradify/pdf.worker.min.mjs`);
    expect(pdfFixture.destroy).toHaveBeenCalledOnce();
  });

  it('releases PDF resources when a document cannot be read', async () => {
    pdfFixture.getDocument.mockReturnValue({
      promise: Promise.reject(new Error('Invalid PDF')),
      destroy: pdfFixture.destroy,
    });
    await expect(extractPdfText(file)).rejects.toThrow('Invalid PDF');
    expect(pdfFixture.destroy).toHaveBeenCalledOnce();
  });
});
