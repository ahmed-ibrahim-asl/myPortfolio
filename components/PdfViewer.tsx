"use client";

import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker from local directory for Next.js static export
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error("PDF Load Error:", error);
    setError("Failed to load PDF. The document may be missing, corrupt, or unsupported.");
  }

  return (
    <div className="pdf-viewer-container">
      <div className="pdf-controls">
        <div className="pdf-nav">
          <button 
            disabled={pageNumber <= 1} 
            onClick={() => setPageNumber(p => p - 1)}
            className="button quiet"
          >
            Prev
          </button>
          <span>
            {pageNumber} of {numPages || "--"}
          </span>
          <button 
            disabled={!numPages || pageNumber >= numPages} 
            onClick={() => setPageNumber(p => p + 1)}
            className="button quiet"
          >
            Next
          </button>
        </div>
        <div className="pdf-zoom">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="button quiet">Zoom Out</button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="button quiet">Zoom In</button>
        </div>
        <a href={url} download className="button primary">
          Download PDF
        </a>
      </div>

      <div className="pdf-document-wrapper">
        {error ? (
          <div className="pdf-error">
            <p>{error}</p>
            <a href={url} download className="button primary">Try Downloading</a>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="pdf-loading">Loading document...</div>}
            className="pdf-document"
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="pdf-page"
            />
          </Document>
        )}
      </div>
    </div>
  );
}
