import React from "react";
import { notFound } from "next/navigation";
import { getAllLibraryItems, getLibraryItem } from "@/lib/library";
import { createPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { PdfViewerWrapper } from "@/components/PdfViewerWrapper";

export async function generateStaticParams() {
  const items = getAllLibraryItems({ includeDrafts: true });
  return items.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getLibraryItem(slug);
  if (!item) return {};

  return createPageMetadata({
    title: item.title,
    description: item.summary,
    pathname: `/notes/library/${item.slug}/`
  });
}

export default async function LibraryItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getLibraryItem(slug);
  if (!item) notFound();

  // Handle GitHub Pages path mapping for the PDF URL
  const pdfUrl = absoluteUrl(item.pdfPath);

  return (
    <article className="asl-page article-page shell">
      <header className="article-header">
        <p className="eyebrow">Library / Document Viewer</p>
        <h1>{item.title}</h1>
        <p className="article-summary">{item.summary}</p>
        <div className="tag-row article-tags">
          <span className="tag">Rights: {item.rights}</span>
          <span className="tag">Attribution: {item.attribution}</span>
          {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </header>

      <div className="article-body">
        <PdfViewerWrapper url={pdfUrl} />
      </div>
    </article>
  );
}
