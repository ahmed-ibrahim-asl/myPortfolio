import React from "react";
import Link from "next/link";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { PublicImage } from "@/components/PublicImage";
import { profile, projects, workingMethod } from "@/data/portfolio";
import { workCategories } from "@/data/work-categories";
import { satelliteCalculators } from "@/data/satellite-course";
import { rfCalculators } from "@/data/rf-calculators";
import { engineeringTools } from "@/data/tools";
import { calculators } from "@/data/calculators";
import { formatDate, getAllPosts } from "@/lib/content";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/types";

// English project/tool/note copy is technical prose (component names, protocols,
// measured outcomes) that stays in English per the site's translation policy even
// on the Arabic page; dir="auto" keeps that text reading LTR inside the RTL layout
// instead of being mirrored.
const TECH_DIR = "auto";

export function HomePageView({ locale }: { locale: Locale }) {
  const dictionary = getDictionary(locale);
  const isAr = locale === "ar";
  const prefix = isAr ? "/ar" : "";
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const featuredTools = engineeringTools.slice(0, 3);
  const notes = getAllPosts().slice(0, 3);
  const totalToolCount =
    engineeringTools.length + calculators.length + satelliteCalculators.length + rfCalculators.length;

  return (
    <div className={`home-page${isAr ? " asl-arabic-page" : ""}`}>
      <section className="home-hero shell">
        <div className="home-hero-copy">
          <p className="eyebrow">
            <span>001</span> {isAr ? dictionary.home.role : profile.role} / {dictionary.home.roleSuffix}
          </p>
          <div className="home-mobile-identity">
            <PublicImage
              src={profile.portrait}
              alt={profile.name}
              sizes="(max-width: 560px) 112px, 84px"
              loading="eager"
              fetchPriority="high"
            />
            <div className="home-mobile-identity-copy">
              <strong>{profile.name}</strong>
              <small>{isAr ? dictionary.home.role : profile.role}</small>
              <span className="home-mobile-capabilities">{dictionary.home.capabilities}</span>
            </div>
          </div>
          <div className="home-title-stack">
            {!isAr && (
              <p className="home-title-ar home-title-ar-desktop" lang="ar" dir="rtl">
                فكّك المشكلة
              </p>
            )}
            <h1 lang={isAr ? "ar" : undefined} dir={isAr ? "rtl" : undefined}>
              <span className="home-copy-desktop">
                {dictionary.home.heroDesktopMain}
                <b>{dictionary.home.heroDesktopAccent}</b>
              </span>
              <span className="home-copy-mobile home-mobile-headline">
                <span className="home-mobile-title-line">{dictionary.home.heroMobileLine1}</span>
                <b className="home-mobile-title-line">{dictionary.home.heroMobileLine2}</b>
              </span>
            </h1>
          </div>
          <p className="home-intro">
            {isAr ? (
              <>
                <span className="home-copy-desktop">
                  أنا {profile.name}. بربط الإلكترونيات والبرمجيات والاتصالات علشان أبني نماذج واضحة، قابلة للقياس، وسهلة
                  التطوير.
                </span>
                <span className="home-copy-mobile">بحوّل الفيرموير والإلكترونيات المتصلة لنماذج أولية شغالة فعليًا.</span>
              </>
            ) : (
              <>
                <span className="home-copy-desktop">
                  I build connected systems from physical signal to useful interface. Embedded hardware,
                  robotics, applied AI, and the tools that make the work easier to repeat.
                </span>
                <span className="home-copy-mobile">I turn firmware and connected electronics into working prototypes.</span>
              </>
            )}
          </p>
          <div className="home-actions">
            <Link className="btn-primary home-action-primary" href={`${prefix}/work/`}>
              {dictionary.actions.viewProjects}
            </Link>
            <Link className="btn-secondary home-action-tools" href={`${prefix}/tools/`}>
              {dictionary.actions.exploreTools}
            </Link>
          </div>
          {!isAr && (
            <p className="home-title-ar home-title-ar-mobile" lang="ar" dir="rtl">
              فكّك المشكلة. وابني الحل.
            </p>
          )}
        </div>
        <aside className="home-portrait" aria-label="Ahmed Ibrahim Asl profile">
          <div className="portrait-instrument">
            <ProfilePortrait context="home" />
            <div className="portrait-id">
              <span>Ahmed Ibrahim Asl</span>
              <strong>101</strong>
              <span lang="ar" dir="rtl">أحمد إبراهيم عسل</span>
            </div>
          </div>
          <div className="portrait-status">
            <span>{isAr ? dictionary.home.role : profile.role}</span>
            <span>AGENT 101</span>
          </div>
        </aside>
      </section>

      <section className="home-hook shell" aria-label="Tool catalog size">
        <p dir={isAr ? "rtl" : undefined}>
          <strong>{totalToolCount} {dictionary.home.hookPrefix}</strong> {dictionary.home.hookSuffix}
        </p>
        <Link className="text-link" href={`${prefix}/tools/`}>{dictionary.home.openToolsIndex}</Link>
      </section>

      <section className="home-section shell">
        <header className="home-section-head">
          <div>
            <p className="eyebrow"><span>002</span> {dictionary.home.evidenceEyebrow}</p>
            <h2>{dictionary.home.evidenceHeading}</h2>
          </div>
          <p>{dictionary.home.evidenceSub}</p>
        </header>
        <div className="project-ledger">
          {featuredProjects.map((project, index) => (
            <Link
              className={`project-entry project-entry-${index + 1}`}
              href={`/work/${workCategories.find((group) => group.categories.includes(project.category))?.id}/${project.slug}/`}
              key={project.slug}
            >
              <PublicImage src={project.image} alt="" />
              <span className="project-index">0{index + 1}</span>
              <div className="project-copy" dir={isAr ? TECH_DIR : undefined}>
                <p>{project.category} / {project.year}</p>
                <h3>{project.title}</h3>
                <span>{project.outcome}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link className="text-link" href={`${prefix}/work/`}>{dictionary.home.readProjectLog}</Link>
      </section>

      <section className="home-section shell home-workbench">
        <header className="home-section-head">
          <div>
            <p className="eyebrow"><span>003</span> {dictionary.home.workbenchEyebrow}</p>
            <h2>{dictionary.home.workbenchHeading}</h2>
          </div>
          <p>{dictionary.home.workbenchSub}</p>
        </header>
        <div className="tool-ledger">
          {featuredTools.map((tool, index) => (
            <Link className="tool-entry" href={tool.href} key={tool.id}>
              <div className="tool-cover" aria-hidden="true">
                {tool.coverImage ? <PublicImage src={tool.coverImage} alt="" /> : <i />}
                <span>0{index + 1}</span>
                <strong>{tool.icon}</strong>
              </div>
              <div className="tool-copy" dir={isAr ? TECH_DIR : undefined}>
                <p>UTILITY / {tool.highlight || "LIVE"}</p>
                <h3>{tool.title}</h3>
                <span>{tool.description}</span>
              </div>
              <b>{dictionary.home.open}</b>
            </Link>
          ))}
        </div>
        <Link className="text-link" href={`${prefix}/tools/`}>{dictionary.home.openWorkbench}</Link>
      </section>

      <section className="home-section shell home-brain">
        <header className="home-section-head">
          <div>
            <p className="eyebrow"><span>004</span> {dictionary.home.brainEyebrow}</p>
            <h2>{dictionary.home.brainHeading}</h2>
          </div>
          <p>{dictionary.home.brainSub}</p>
        </header>
        <div className="brain-grid">
          <div className="notes-list">
            {notes.map((note, index) => (
              <Link href={`/notes/${note.slug}/`} key={note.slug}>
                <span>0{index + 1}</span>
                <div dir={isAr ? TECH_DIR : undefined}>
                  <p>{note.category} / {formatDate(note.publishedAt)}</p>
                  <h3>{note.title}</h3>
                  <small>{note.readingTime} {dictionary.home.minRead}</small>
                </div>
              </Link>
            ))}
          </div>
          <aside className="prompt-panel">
            <p className="eyebrow">{dictionary.home.promptEyebrow}</p>
            <code>/blueprint</code><code>/handwritten</code><code>/machineview</code><code>/sequence</code>
            <p>{dictionary.home.promptSub}</p>
            <Link className="btn-secondary" href="/prompts/">{dictionary.home.browsePrompts}</Link>
          </aside>
        </div>
      </section>

      <section className="home-method shell">
        <p className="eyebrow"><span>005</span> {dictionary.home.methodEyebrow}</p>
        <div className="method-grid">
          {workingMethod.map((item) => (
            <div key={item.step}>
              <span>{item.step}</span>
              <h3 dir={isAr ? TECH_DIR : undefined}>{item.label}</h3>
              <p dir={isAr ? TECH_DIR : undefined}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
