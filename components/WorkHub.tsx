import Link from "next/link";
import type { Project } from "@/types/portfolio";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import styles from "./WorkPages.module.css";

export function WorkHub() {
  return <div className={styles.hub}>
    {groupWork(projects).map(group => <Link key={group.id} href={`/work/${group.id}/`} className={`${styles.category} ${styles[group.style]}`}>
      <span className={styles.categoryMeta}>{group.projects.length} {group.projects.length === 1 ? "project" : "projects"} <span aria-hidden="true">↗</span></span>
      <h2>{group.title}</h2><p>{group.intro}</p>
      <span className={styles.names}>{group.projects.slice(0, 3).map((project: Project) => project.title).join(" / ")}</span>
      <span className={styles.enter}>Explore category</span>
    </Link>)}
    <Link href="/work/recognition/" className={`${styles.category} ${styles.awards}`}><span className={styles.categoryMeta}>Competition record <span aria-hidden="true">↗</span></span><h2>Awards & Competitions</h2><p>Team results, certificates, and the builds behind them.</p><span className={styles.enter}>View recognition</span></Link>
  </div>;
}

export function WorkBreadcrumb({ category, project }: { category?: { id: string; title: string }; project?: string }) {
  return <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/work/">Work</Link>{category && <><span aria-hidden="true">/</span>{project ? <Link href={`/work/${category.id}/`}>{category.title}</Link> : <span aria-current="page">{category.title}</span>}</>}{project && <><span aria-hidden="true">/</span><span aria-current="page">{project}</span></>}</nav>;
}
