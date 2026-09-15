import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { marked } from "marked";
import { PromptItem } from "@/types/content";

const promptsDirectory = path.join(process.cwd(), "content", "prompts");

function normalizePrompt(fileName: string): PromptItem {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(promptsDirectory, fileName), "utf8");
  const { data, content } = parseFrontmatter(source);

  return {
    slug,
    title: String(data.title || slug),
    summary: String(data.summary || ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    model: String(data.model || "Any"),
    publishedAt: String(data.publishedAt || ""),
    draft: Boolean(data.draft),
    content,
    html: ""
  };
}

export function getAllPrompts({ includeDrafts = false }: { includeDrafts?: boolean } = {}): PromptItem[] {
  if (!fs.existsSync(promptsDirectory)) return [];

  return fs
    .readdirSync(promptsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(normalizePrompt)
    .filter((prompt) => includeDrafts || !prompt.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPrompt(slug: string): PromptItem | null {
  const file = `${slug}.md`;
  const fullPath = path.join(promptsDirectory, file);
  if (!fs.existsSync(fullPath)) return null;
  return normalizePrompt(file);
}

export function renderPrompt(content: string): { html: string } {
  const rawMarkdownHtml = marked.parse(content, {
    gfm: true,
    breaks: false
  }) as string;

  return { html: rawMarkdownHtml };
}
