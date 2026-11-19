import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Project } from "@/types/portfolio";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import { archivePagesFor } from "@/data/biovety-site-archive";

// Share image for each project page: the project's own picture, cropped to 1200x630,
// so link previews (LinkedIn, WhatsApp, Upwork) show the project instead of the site portrait.
export const dynamic = "force-static";
const size = { width: 1200, height: 630 };

const groups = groupWork(projects);
export function generateStaticParams() {
  return groups.flatMap(group => group.projects.map((project: Project) => ({ category: group.id, project: project.slug })));
}

const isRaster = (src?: string) => !!src && /\.(png|jpe?g|webp|gif)$/i.test(src) && !src.startsWith("http");

function pictureFor(project: Project): string | undefined {
  if (project.slug === "biovety-website" && !isRaster(project.image)) return archivePagesFor("BioVety")[0]?.thumbnail;
  return [project.image, project.video?.poster, ...(project.gallery ?? []).map(item => item.src), ...(project.uiGallery ?? []).map(item => item.src)]
    .find(isRaster) ?? (project.image && !project.image.startsWith("http") ? project.image : undefined);
}

function titleCard(project: Project) {
  const escape = (text: string) => text.replace(/[&<>"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char]!);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#0d1014"/>
    <text x="80" y="300" fill="#d9a441" font-family="Arial, sans-serif" font-size="30" letter-spacing="4">${escape(project.category.toUpperCase())}</text>
    <text x="80" y="380" fill="#f2f2f2" font-family="Arial, sans-serif" font-size="72" font-weight="700">${escape(project.title)}</text>
  </svg>`);
}

export async function GET(_request: Request, { params }: { params: Promise<{ category: string; project: string }> }) {
  const { project: slug } = await params;
  const project = projects.find(item => item.slug === slug)!;
  const picture = pictureFor(project);
  const input = picture ? await readFile(path.join(process.cwd(), "public", decodeURI(picture.replace(/^\/+/, "")))) : titleCard(project);
  const jpeg = await sharp(input, { density: 300 })
    .resize(size.width, size.height, { fit: "cover", position: picture === project.image ? "centre" : sharp.strategy.attention })
    .flatten({ background: "#0d1014" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": "image/jpeg" } });
}
