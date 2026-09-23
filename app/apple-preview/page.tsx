import Image from "next/image";
import Link from "next/link";
import { profile, projects } from "@/data/portfolio";
import { workCategories } from "@/data/work-categories";
import { engineeringTools } from "@/data/tools";
import styles from "./apple-preview.module.css";

const featuredProjects = projects.filter(project => project.featured).slice(0, 3);
const featuredTools = engineeringTools.slice(0, 3);

function projectHref(category: string, slug: string) {
  const group = workCategories.find(item => item.categories.includes(category));
  return `/work/${group?.id ?? "embedded-iot"}/${slug}/`;
}

export default function ApplePreviewPage() {
  return (
    <div className={`apple-preview-root ${styles.page}`}>
      <nav className={styles.navigation} aria-label="Preview navigation">
        <Link className={styles.wordmark} href="/apple-preview" aria-label="Ahmed Asl, preview home">
          <span className={styles.mark}>A</span>
          <span>Ahmed Asl</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#work">Work</a>
          <a href="#tools">Tools</a>
          <a href="#contact">Contact</a>
        </div>
        <span className={styles.previewBadge}>Local preview</span>
      </nav>

      <main>
        <section className={styles.hero} aria-labelledby="preview-title">
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Embedded systems · IoT · Robotics</p>
            <h1 id="preview-title">From rough idea to working system.</h1>
            <p className={styles.lede}>{profile.summary}</p>
            <div className={styles.actions}>
              <a className={styles.primaryAction} href="#work" data-preview-action>
                View selected work <span aria-hidden="true">↘</span>
              </a>
              <a className={styles.secondaryAction} href={`mailto:${profile.email}`} data-preview-action>
                Start a project
              </a>
            </div>
            <div className={styles.availability}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{profile.availability}</span>
            </div>
          </div>

          <div className={styles.portraitStage} aria-label={`Portrait of ${profile.name}`}>
            <div className={styles.orbit} aria-hidden="true">
              <span className={styles.orbitDot} />
              <svg viewBox="0 0 520 520" role="presentation">
                <circle cx="260" cy="260" r="224" />
                <path d="M35 293C91 154 205 73 346 91c73 9 125 42 158 91" />
                <path d="M78 413c119 58 249 32 340-67" />
              </svg>
            </div>
            <div className={styles.portraitHalo} />
            <div className={styles.portraitFrame}>
              <Image
                src={profile.portrait}
                alt={profile.name}
                fill
                priority
                sizes="(max-width: 760px) 82vw, 42vw"
              />
            </div>
            <div className={styles.stageCaption}>
              <span>Based in Egypt</span>
              <span>Available remotely</span>
            </div>
          </div>
        </section>

        <section className={styles.workSection} id="work" aria-labelledby="work-title">
          <header className={styles.sectionHeading}>
            <p>Selected work</p>
            <h2 id="work-title">Built to leave the screen.</h2>
            <span>Hardware, software, and interfaces tested as one system.</span>
          </header>

          <div className={styles.projectList}>
            {featuredProjects.map((project, index) => (
              <article className={styles.project} key={project.slug}>
                <div className={styles.projectMedia}>
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(max-width: 760px) 100vw, 62vw"
                  />
                  <span className={styles.projectNumber}>0{index + 1}</span>
                </div>
                <div className={styles.projectCopy}>
                  <p>{project.category} · {project.year}</p>
                  <h3>{project.title}</h3>
                  <span>{project.description}</span>
                  <strong>{project.outcome}</strong>
                  <Link href={projectHref(project.category, project.slug)}>
                    Explore the project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.toolsSection} id="tools" aria-labelledby="tools-title">
          <header className={styles.sectionHeading}>
            <p>Engineering tools</p>
            <h2 id="tools-title">Useful, not ornamental.</h2>
            <span>Small tools made from recurring problems in real projects.</span>
          </header>
          <div className={styles.toolGrid}>
            {featuredTools.map((tool, index) => (
              <Link className={styles.toolCard} href={tool.href} key={tool.id}>
                <span className={styles.toolIndex}>0{index + 1}</span>
                <div>
                  <p>{tool.highlight ?? "Live utility"}</p>
                  <h3>{tool.title}</h3>
                  <span>{tool.description}</span>
                </div>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.contact} id="contact">
        <p>Have a system worth proving?</p>
        <h2>Let&apos;s turn it into something you can test.</h2>
        <a href={`mailto:${profile.email}`} data-preview-action>
          {profile.email} <span aria-hidden="true">↗</span>
        </a>
        <div className={styles.footerMeta}>
          <span>{profile.name}</span>
          <span>Local concept preview · 2026</span>
        </div>
      </footer>
    </div>
  );
}

