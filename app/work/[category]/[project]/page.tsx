import { notFound } from "next/navigation";
import type { Project } from "@/types/portfolio";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import { WorkEntry } from "@/components/WorkCollection";
import { WorkBreadcrumb } from "@/components/WorkHub";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/WorkPages.module.css";
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
 return createPageMetadata({ title: project.title, description: project.description, pathname: `/work/${group.id}/${project.slug}/` });
}
export default async function ProjectPage({ params }: { params: Promise<{ category: string; project: string }> }) {
 const { group, project } = await resolve(params);
 return <div className={`asl-page ${styles.page}`}><WorkBreadcrumb category={group} project={project.title} /><header className={styles.heading}><h1>{project.title}</h1></header><div className={styles.detail}><WorkEntry project={project} category={group.id} /></div></div>;
}
