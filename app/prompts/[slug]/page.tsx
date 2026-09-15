import React from "react";
import { notFound } from "next/navigation";
import { getAllPrompts, getPrompt, renderPrompt } from "@/lib/prompts";
import { createPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const prompts = getAllPrompts({ includeDrafts: true });
  return prompts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = getPrompt(slug);
  if (!prompt) return {};

  return createPageMetadata({
    title: prompt.title,
    description: prompt.summary,
    pathname: `/prompts/${prompt.slug}/`
  });
}

export default async function PromptPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prompt = getPrompt(slug);
  if (!prompt) notFound();

  const { html } = renderPrompt(prompt.content);

  return (
    <article className="asl-page article-page shell">
      <header className="article-header">
        <p className="eyebrow">Prompt</p>
        <h1>{prompt.title}</h1>
        <p className="article-summary">{prompt.summary}</p>
        <div className="tag-row article-tags">
          <span className="tag">{prompt.model}</span>
          {prompt.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </header>

      <div
        className="article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
