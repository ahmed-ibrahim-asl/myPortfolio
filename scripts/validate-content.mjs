import fs from "node:fs/promises";
import path from "node:path";
import { parseFrontmatter } from "../lib/frontmatter.js";

async function validateDirectory(dirPath, requiredFields) {
  const directory = path.join(process.cwd(), "content", dirPath);
  let files = [];
  try {
    files = (await fs.readdir(directory)).filter((file) => file.endsWith(".md"));
  } catch (err) {
    return []; // directory might not exist yet
  }
  
  const slugs = new Set();
  const failures = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const source = await fs.readFile(path.join(directory, file), "utf8");
    const { data, content } = parseFrontmatter(source);

    if (slugs.has(slug)) failures.push(`${dirPath}/${file}: duplicate slug`);
    slugs.add(slug);

    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === "") {
        failures.push(`${dirPath}/${file}: missing ${field}`);
      }
    }
    if (!Array.isArray(data.tags)) failures.push(`${dirPath}/${file}: tags must be a YAML list`);
    if (typeof data.draft !== "boolean") failures.push(`${dirPath}/${file}: draft must be true/false`);
    if (!content.trim()) failures.push(`${dirPath}/${file}: body is empty`);
    if (content.includes("{{")) failures.push(`${dirPath}/${file}: unresolved template placeholder`);
  }
  
  return { files: files.length, failures };
}

const writingResult = await validateDirectory("writing", ["title", "summary", "category", "tags", "publishedAt", "draft"]);
const promptsResult = await validateDirectory("prompts", ["title", "summary", "tags", "model", "publishedAt", "draft"]);
const libraryResult = await validateDirectory("library", ["title", "summary", "tags", "publishedAt", "draft", "rights", "attribution", "pdfPath"]);

const totalFailures = [...writingResult.failures, ...promptsResult.failures, ...libraryResult.failures];

if (totalFailures.length) {
  console.error(totalFailures.join("\n"));
  process.exit(1);
}

console.log(`Validated ${writingResult.files} articles, ${promptsResult.files} prompts, and ${libraryResult.files} library items.`);
