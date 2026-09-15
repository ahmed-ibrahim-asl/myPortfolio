import React from "react";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/content";
import { WritingIndex } from "@/components/WritingIndex";
import { createPageMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.tags.forEach(t => tags.add(t.toLowerCase().replace(/\s+/g, "-"))));
  
  return Array.from(tags).map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  return createPageMetadata({
    title: `Notes on ${topic.replace(/-/g, " ")}`,
    description: `Read technical notes and tutorials about ${topic.replace(/-/g, " ")}.`,
    pathname: `/notes/topics/${topic}/`
  });
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const allPosts = getAllPosts();
  const posts = allPosts.filter(p => 
    p.tags.some(t => t.toLowerCase().replace(/\s+/g, "-") === topic)
  );

  if (posts.length === 0) notFound();

  return (
    <div className="asl-page asl-field-notes">
      <section className="page-intro shell writing-intro asl-page-intro">
        <p className="eyebrow">Topic filtered view</p>
        <h1 className="capitalize">{topic.replace(/-/g, " ")}</h1>
        <p className="page-lede">
          Found {posts.length} {posts.length === 1 ? "note" : "notes"} in this topic.
        </p>
      </section>

      <section className="shell page-section writing-index-section">
        <WritingIndex posts={posts} />
      </section>
    </div>
  );
}
