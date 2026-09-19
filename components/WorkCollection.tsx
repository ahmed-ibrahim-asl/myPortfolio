import type { Project } from "@/types/portfolio";
import Link from "next/link";
import { projects } from "@/data/portfolio";
import { groupWork } from "@/data/work-categories";
import { mobileScreens } from "@/data/mobile-screens";
import { MobileScreenGallery } from "./MobileScreenGallery";
import { PublicImage } from "./PublicImage";
import styles from "./WorkCollection.module.css";

export function WorkCollection({ category }: { category: string }) {
  const groups = groupWork(projects).filter(group => group.id === category);
  return <>
    {groups.map(group => <section key={group.id} id={group.id} className={`${styles.collection} ${styles[group.style]}`} aria-labelledby={`${group.id}-title`}>
      <div className={styles.grid}>{group.projects.map((project: Project) => <WorkEntry key={project.slug} project={project} compact category={group.id} />)}</div>
    </section>)}
  </>;
}

export function WorkEntry({ project, compact = false, category }: { project: Project; compact?: boolean; category?: string }) {
  const interfacePreview = compact && category === "apps-ui" ? project.uiGallery?.[0] : undefined;
  const previewImage = interfacePreview?.src ?? project.image;
  const previewAlt = interfacePreview?.alt ?? `${project.title} project preview`;
  const isPlaceholder = previewImage?.includes("/placeholders/");
  const destination = `/work/${category}/${project.slug}/`;
  return <article className={styles.card} id={project.slug}>
    {project.website ? <div className={`${styles.visual} ${styles.browser}`}>
      <div className={styles.browserBar}><span aria-hidden="true">● ● ●</span><span>{project.website}</span></div>
      <div className={styles.webIdentity}><span className={styles.kicker}>{project.slug === "biovety-website" ? "Veterinary health" : "Engineering & education"}</span><strong>{project.title}</strong><span className={styles.domain}>{project.website}</span></div>
    </div> : compact ? <Link className={styles.visual} href={destination} aria-label={`Explore ${project.title}`}><PublicImage src={previewImage} alt={previewAlt} loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" /></Link> : <a className={styles.visual} href={project.image} target="_blank" rel="noreferrer" aria-label={`View ${project.title} image`}><PublicImage src={project.image} alt={`${project.title} project preview`} loading="lazy" sizes="(max-width: 760px) 100vw, 50vw" /></a>}
    <div className={styles.body}>
      {compact && category === "apps-ui" && isPlaceholder && <p className={styles.imageNote}>Preview placeholder · app screenshots not yet added</p>}
      {compact && project.imageNote && <p className={styles.imageNote}>{project.imageNote}</p>}
      <div className={styles.entryMeta}><span>{project.website ? "Company website" : project.category}</span>{project.year && project.year !== "Client work" && <span>{project.year}</span>}</div>
      <h3>{compact ? <Link href={destination}>{project.title}</Link> : project.title}</h3><p>{project.description}</p>
      {compact ? <Link className={styles.action} href={destination}>Explore project <span aria-hidden="true">↗</span></Link> : <>
      {project.role && <p>{project.role}</p>}
      <ul className={styles.tags} aria-label="Project technologies">{project.tags.map(tag => <li key={tag}>{tag}</li>)}</ul>
      <p className={styles.outcome}>{project.outcome}</p>
      {project.imageNote && <p className={styles.imageNote}>{project.imageNote}</p>}
      {project.links?.map(link => link.href.startsWith("#") ? <Link className={styles.action} key={link.href} href={`/work/recognition/${link.href}`}>{link.label}<span aria-hidden="true">↗</span></Link> : <a className={styles.action} key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}
      {project.gallery?.length ? <details className={styles.evidence}><summary>{project.galleryLabel ?? `View original project images (${project.gallery.length})`}</summary><div>{project.gallery.map(image => <a key={image.src} href={image.src} target="_blank" rel="noreferrer"><PublicImage src={image.src} alt={image.alt} loading="lazy" sizes="240px" /></a>)}</div></details> : null}
      {project.uiGallery?.length ? <details className={styles.mobileEvidence}><summary>Mobile app screens ({mobileScreens[project.slug]?.length ?? project.uiGallery.length})</summary>
        {mobileScreens[project.slug] && <MobileScreenGallery screens={mobileScreens[project.slug]} project={project.title} />}
        <details className={`${styles.evidence} ${styles.interfaces}`}><summary>View original UI images</summary><div>{project.uiGallery.map(image => <a key={image.src} href={image.src} target="_blank" rel="noreferrer"><PublicImage src={image.src} alt={image.alt} loading="lazy" sizes="240px" /></a>)}</div></details>
      </details> : null}
      </>}
    </div>
  </article>;
}
