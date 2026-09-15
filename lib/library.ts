import fs from "node:fs";
import path from "node:path";
import { parseFrontmatter } from "./frontmatter.js";
import { marked } from "marked";
import { LibraryItem } from "@/types/content";

const libraryDirectory = path.join(process.cwd(), "content", "library");

function normalizeLibraryItem(fileName: string): LibraryItem {
  const slug = fileName.replace(/\.md$/, "");
  const source = fs.readFileSync(path.join(libraryDirectory, fileName), "utf8");
  const { data, content } = parseFrontmatter(source);

  return {
    slug,
    title: String(data.title || slug),
    summary: String(data.summary || ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: String(data.publishedAt || ""),
    draft: Boolean(data.draft),
    rights: String(data.rights || ""),
    attribution: String(data.attribution || ""),
    pdfPath: String(data.pdfPath || ""),
    content,
    html: ""
  };
}

export function getAllLibraryItems({ includeDrafts = false }: { includeDrafts?: boolean } = {}): LibraryItem[] {
  if (!fs.existsSync(libraryDirectory)) return [];

  return fs
    .readdirSync(libraryDirectory)
    .filter((file) => file.endsWith(".md"))
    .map(normalizeLibraryItem)
    .filter((item) => includeDrafts || !item.draft)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getLibraryItem(slug: string): LibraryItem | null {
  const file = `${slug}.md`;
  const fullPath = path.join(libraryDirectory, file);
  if (!fs.existsSync(fullPath)) return null;
  return normalizeLibraryItem(file);
}
