import { createHash } from "node:crypto";
import { notFound } from "next/navigation";
import type { Project } from "@/types/portfolio";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import { WorkEntry } from "@/components/WorkCollection";
import { BiovetyCaseStudy } from "@/components/BiovetyCaseStudy";
import { BiovetySiteArchive } from "@/components/BiovetySiteArchive";
import { WorkBreadcrumb } from "@/components/WorkHub";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/WorkPages.module.css";

// Changes whenever the project's lead image changes, so link-preview caches (LinkedIn) refetch og.jpg.
const shareImageVersion = (project: Project) => createHash("sha1").update(project.image || project.slug).digest("hex").slice(0, 8);
const groups = groupWork(projects);
export function generateStaticParams() { return groups.flatMap(group => group.projects.map((project: Project) => ({ category: group.id, project: project.slug }))); }
export const dynamicParams = false;
async function resolve(params: Promise<{ category: string; project: string }>) {
 const route = await params;
 const group = groups.find(item => item.id === route.category);
 const project: Project | undefined = group?.projects.find((item: Project) => item.slug === route.project);
 if (!group || !project) notFound();
 return { group, project };
}
export async function generateMetadata({ params }: { params: Promise<{ category: string; project: string }> }) {
 const { group, project } = await resolve(params);
 return createPageMetadata({ title: project.title, description: project.description, pathname: `/work/${group.id}/${project.slug}/`, image: `/work/${group.id}/${project.slug}/og.jpg?v=${shareImageVersion(project)}` });
}
export default async function ProjectPage({ params }: { params: Promise<{ category: string; project: string }> }) {
 const { group, project } = await resolve(params);
 const isBiovety = project.slug === "biovety-website";
 return <div className={`asl-page ${styles.page}`}><WorkBreadcrumb category={group} project={project.title} /><header className={styles.heading}><h1>{project.title}</h1></header><div className={styles.detail}>{isBiovety ? <><BiovetyCaseStudy project={project} /><BiovetySiteArchive /></> : <WorkEntry project={project} category={group.id} />}</div></div>;
}
