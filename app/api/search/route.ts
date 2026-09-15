import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/content";
import { getAllPrompts } from "@/lib/prompts";
import { engineeringTools } from "@/data/tools";

export const dynamic = 'force-static';

export async function GET() {
  const posts = getAllPosts();
  const prompts = getAllPrompts();
  
  const searchIndex = [
    ...posts.map(p => ({
      type: "note",
      title: p.title,
      summary: p.summary,
      url: `/notes/${p.slug}`,
      tags: p.tags
    })),
    ...prompts.map(p => ({
      type: "prompt",
      title: p.title,
      summary: p.summary,
      url: `/prompts/${p.slug}`,
      tags: p.tags
    })),
    ...engineeringTools.map(t => ({
      type: "tool",
      title: t.title,
      summary: t.description,
      url: t.href,
      tags: []
    }))
  ];

  return NextResponse.json(searchIndex);
}
