import { pathToFileURL } from "node:url";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getPublicImageConfig } from "../data/public-image-registry.js";

const SOURCE_DIRECTORIES = Object.freeze(["app", "components", "content", "data", "lib"]);
const SOURCE_EXTENSIONS = new Set([".css", ".js", ".jsx", ".md", ".mdx", ".ts", ".tsx"]);
const RASTER_EXTENSION = /\.(?:avif|gif|jpe?g|png|webp)$/i;
const PUBLIC_RASTER_REFERENCE = /\/(?:blog|brand|images|media|opengraph-image|twitter-image)[A-Za-z0-9_@%+.,()\-/ ]*?\.(?:avif|gif|jpe?g|png|webp)/gi;
const GENERATED_PREFIX = "/media/generated/responsive/";

async function exists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

export async function walkFiles(directory) {
  if (!(await exists(directory))) return [];
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(entryPath));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

export function normalizePublicPath(value) {
  return value.replaceAll("\\", "/").replace(/\/+/g, "/");
}

export async function discoverPublicRasterReferences(rootDir) {
  const references = new Set();
  for (const directory of SOURCE_DIRECTORIES) {
    for (const filePath of await walkFiles(path.join(rootDir, directory))) {
      if (!SOURCE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) continue;
      if (filePath.endsWith("public-image-manifest.generated.ts")) continue;
      const source = await readFile(filePath, "utf8");
      for (const match of source.matchAll(PUBLIC_RASTER_REFERENCE)) {
        const publicPath = normalizePublicPath(match[0]);
        if (!publicPath.startsWith(GENERATED_PREFIX)) references.add(publicPath);
      }
    }
  }

  const explicitPath = path.join(rootDir, "data", "public-image-sources.json");
  if (await exists(explicitPath)) {
    const explicit = JSON.parse(await readFile(explicitPath, "utf8"));
    for (const source of explicit) references.add(normalizePublicPath(source));
  }
  return [...references].sort();
}

async function findDirectImgUsages(rootDir) {
  const usages = [];
  for (const directory of ["app", "components"]) {
    for (const filePath of await walkFiles(path.join(rootDir, directory))) {
      if (!new Set([".js", ".jsx", ".ts", ".tsx"]).has(path.extname(filePath).toLowerCase())) continue;
      const source = await readFile(filePath, "utf8");
      if (!/<img\b/i.test(source)) continue;
      usages.push({ file: normalizePublicPath(path.relative(rootDir, filePath)) });
    }
  }
  return usages;
}

export async function auditPublicImages({ rootDir = process.cwd() } = {}) {
  const sources = await discoverPublicRasterReferences(rootDir);
  const referenced = [];
  for (const source of sources) {
    const filePath = path.join(rootDir, "public", source.replace(/^\//, ""));
    const config = getPublicImageConfig(source);
    let width = null;
    let height = null;
    let bytes = null;
    let decodes = false;
    if (await exists(filePath)) {
      const [metadata, details] = await Promise.all([sharp(filePath, { animated: false }).metadata(), stat(filePath)]);
      width = metadata.width ?? null;
      height = metadata.height ?? null;
      bytes = details.size;
      decodes = Boolean(width && height);
    }
    referenced.push({ source, ...config, width, height, bytes, decodes });
  }

  const publicRoot = path.join(rootDir, "public");
  const allSources = (await walkFiles(publicRoot))
    .filter((filePath) => RASTER_EXTENSION.test(filePath))
    .map((filePath) => `/${normalizePublicPath(path.relative(publicRoot, filePath))}`)
    .filter((source) => !source.startsWith(GENERATED_PREFIX));
  const referencedSet = new Set(sources);
  const roleCounts = referenced.reduce((counts, item) => {
    counts[item.role] = (counts[item.role] ?? 0) + 1;
    return counts;
  }, {});

  return {
    referenced,
    unreferenced: allSources.filter((source) => !referencedSet.has(source)).sort(),
    directImgUsages: await findDirectImgUsages(rootDir),
    oversizedSources: referenced.filter((item) => (item.bytes ?? 0) > 500 * 1024),
    roleCounts
  };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  console.log(JSON.stringify(await auditPublicImages({ rootDir: process.cwd() }), null, 2));
}
