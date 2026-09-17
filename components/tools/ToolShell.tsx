import React from "react";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { ToolDirectAnswer, ToolSearchHook, ToolSearchSchema } from "@/components/tools/ToolSearchHook";

export function ToolShell({ slug, title, description, children }: { slug?: string, title: string, description: string, children: React.ReactNode }) {
  return (
    <section className="section shell tool-page asl-workbench-shell">
      <div className="tool-shell-heading">
        <Link href="/tools" className="text-link tool-shell-back">
          Back to Tools
        </Link>
        <SectionHeading
          title={title}
          level="h1"
        />
        <p className="section-intro tool-shell-description">
          {description}
        </p>
      </div>
      {slug ? <ToolSearchSchema slug={slug} /> : null}
      <div className="tool-grid">
        {children}
      </div>
      {slug ? <><ToolDirectAnswer slug={slug} /><ToolSearchHook slug={slug} /></> : null}
    </section>
  );
}
