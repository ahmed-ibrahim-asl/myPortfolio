"use client";

import React from "react";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer").then((mod) => mod.PdfViewer), { ssr: false });

export function PdfViewerWrapper({ url }: { url: string }) {
  return <PdfViewer url={url} />;
}
