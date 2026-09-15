import { notFound } from "next/navigation";
import { workCategories } from "@/data/work-categories";
import { WorkCollection } from "@/components/WorkCollection";
import { WorkBreadcrumb } from "@/components/WorkHub";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/WorkPages.module.css";

export function generateStaticParams() { return workCategories.map(category => ({ category: category.id })); }
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
 const { category } = await params;
 const group = workCategories.find(item => item.id === category);
 if (!group) notFound();
 return createPageMetadata({ title: group.title, description: group.intro, pathname: `/work/${group.id}/` });
}
export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
 const { category } = await params;
 const group = workCategories.find(item => item.id === category);
 if (!group) notFound();
 return <div className={`asl-page ${styles.page}`}><WorkBreadcrumb category={group} /><header className={styles.heading}><h1 id={`${group.id}-title`}>{group.title}</h1><p>{group.intro}</p></header><WorkCollection category={group.id} /></div>;
}
