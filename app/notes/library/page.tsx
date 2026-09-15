import React from "react";
import Link from "next/link";
import { getAllLibraryItems } from "@/lib/library";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering PDF Library",
  description: "A collection of engineering notes, schematics, and papers in PDF format.",
  pathname: "/notes/library/"
});

export default function LibraryIndexPage() {
  const items = getAllLibraryItems();

  return (
    <div className="asl-page asl-library-register">
      <section className="section shell page-intro">
        <p className="eyebrow">Notes / PDF Library</p>
        <h1>Engineering Library</h1>
        <p className="page-lede">
          Scans, manuals, technical documents, and reference PDFs.
        </p>
      </section>

      <section className="shell page-section">
        <div className="project-grid">
          {items.map((item) => (
            <Link href={`/notes/library/${item.slug}`} key={item.slug} className="post-card">
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <div className="tag-row">
                <span className="tag">PDF</span>
              </div>
            </Link>
          ))}
          {items.length === 0 && <p className="asl-muted">The library is currently empty.</p>}
        </div>
      </section>
    </div>
  );
}
