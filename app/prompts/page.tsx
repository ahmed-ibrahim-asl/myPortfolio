import React from "react";
import Link from "next/link";
import { getAllPrompts } from "@/lib/prompts";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "LLM Prompts and Workflows",
  description: "Technical LLM prompts and workflows used for engineering, code generation, and research.",
  pathname: "/prompts/"
});

export default function PromptsIndexPage() {
  const prompts = getAllPrompts();

  return (
    <div className="asl-page asl-prompts-register">
      <section className="section shell page-intro">
        <p className="eyebrow">Prompts / LLM Workflows</p>
        <h1>Technical Prompts and Context Strategies</h1>
        <p className="page-lede">
          System prompts, context framing, and few-shot examples used for code generation, 
          hardware research, and agentic workflows.
        </p>
      </section>

      <section className="shell page-section">
        <div className="project-grid">
          {prompts.map((prompt) => (
            <Link href={`/prompts/${prompt.slug}`} key={prompt.slug} className="post-card">
              <h2>{prompt.title}</h2>
              <p>{prompt.summary}</p>
              <div className="tag-row">
                <span className="tag">{prompt.model}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
