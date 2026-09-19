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

export default function HomePage() {
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  const featuredTools = engineeringTools.slice(0, 3);
  const notes = getAllPosts().slice(0, 3);
  const totalToolCount = engineeringTools.length + calculators.length + satelliteCalculators.length + rfCalculators.length;

  return (
    <div className="home-page">
      <section className="home-hero shell">
        <div className="home-hero-copy">
          <p className="eyebrow"><span>001</span> {profile.role} / EGYPT</p>
          <div className="home-mobile-identity">
            <PublicImage src={profile.portrait} alt={profile.name} sizes="(max-width: 560px) 112px, 84px" loading="eager" fetchPriority="high" />
            <div className="home-mobile-identity-copy">
              <strong>{profile.name}</strong>
              <small>{profile.role}</small>
              <span className="home-mobile-capabilities">PROTOTYPING · FIRMWARE · SYSTEM INTEGRATION</span>
            </div>
          </div>
          <div className="home-title-stack">
            <p className="home-title-ar home-title-ar-desktop" lang="ar" dir="rtl">فكّك المشكلة</p>
            <h1><span className="home-copy-desktop">Break the problem <b>down.</b></span><span className="home-copy-mobile home-mobile-headline"><span className="home-mobile-title-line">Your hardware idea.</span><b className="home-mobile-title-line">A prototype ready to test.</b></span></h1>
          </div>
          <p className="home-intro"><span className="home-copy-desktop">I build connected systems from physical signal to useful interface. Embedded hardware, robotics, applied AI, and the tools that make the work easier to repeat.</span><span className="home-copy-mobile">I turn firmware and connected electronics into working prototypes.</span></p>
          <div className="home-actions">
            <Link className="btn-primary home-action-primary" href="/work"><span className="home-copy-desktop">View projects</span><span className="home-copy-mobile">View projects</span></Link>
            <Link className="btn-secondary home-action-tools" href="/tools"><span className="home-copy-desktop">Explore tools</span><span className="home-copy-mobile">Explore tools</span></Link>
          </div>
          <p className="home-title-ar home-title-ar-mobile" lang="ar" dir="rtl">فكّك المشكلة. وابني الحل.</p>
        </div>
        <aside className="home-portrait" aria-label="Ahmed Ibrahim Asl profile">
          <div className="portrait-instrument">
            <ProfilePortrait context="home" />
            <div className="portrait-id"><span>Ahmed Ibrahim Asl</span><strong>101</strong><span lang="ar" dir="rtl">أحمد إبراهيم عسل</span></div>
          </div>
          <div className="portrait-status"><span>{profile.role}</span><span>AGENT 101</span></div>
        </aside>
      </section>

      <section className="home-hook shell" aria-label="Tool catalog size">
        <p><strong>{totalToolCount} tools</strong> live on this site right now - calculators, generators, and guided workflows you can actually run, not a roadmap.</p>
        <Link className="text-link" href="/tools">Open the tools index</Link>
      </section>

      <section className="home-section shell">
        <header className="home-section-head">
          <div><p className="eyebrow"><span>002</span> SELECTED EVIDENCE</p><h2>Systems in the field.</h2></div>
          <p>Natural project colour carries the evidence. Gold marks the identity and the path through it.</p>
        </header>
        <div className="project-ledger">
          {featuredProjects.map((project, index) => (
            <Link className={`project-entry project-entry-${index + 1}`} href={`/work/${workCategories.find(group => group.categories.includes(project.category))?.id}/${project.slug}/`} key={project.slug}>
              <PublicImage src={project.image} alt="" sizes="(max-width: 760px) 100vw, 33vw" />
              <span className="project-index">0{index + 1}</span>
              <div className="project-copy"><p>{project.category} / {project.year}</p><h3>{project.title}</h3><span>{project.outcome}</span></div>
            </Link>
          ))}
        </div>
        <Link className="text-link" href="/work">Read the complete project log</Link>
      </section>

      <section className="home-section shell home-workbench">
        <header className="home-section-head">
          <div><p className="eyebrow"><span>003</span> WORKBENCH / LIVE</p><h2>Tools built from the work.</h2></div>
          <p>Practical helpers for calculations, code generation, and engineering decisions. Each tool explains what it assumes.</p>
        </header>
        <div className="tool-ledger">
          {featuredTools.map((tool, index) => (
            <Link className="tool-entry" href={tool.href} key={tool.id}>
              <div className="tool-cover" aria-hidden="true">
                {tool.coverImage ? <PublicImage src={tool.coverImage} alt="" sizes="(max-width: 760px) 100vw, 33vw" /> : <i />}
                <span>0{index + 1}</span>
                <strong>{tool.icon}</strong>
              </div>
              <div className="tool-copy"><p>UTILITY / {tool.highlight || "LIVE"}</p><h3>{tool.title}</h3><span>{tool.description}</span></div>
              <b>OPEN</b>
            </Link>
          ))}
        </div>
        <Link className="text-link" href="/tools">Open the complete workbench</Link>
      </section>

      <section className="home-section shell home-brain">
        <header className="home-section-head">
          <div><p className="eyebrow"><span>004</span> FIELD NOTES</p><h2>A working digital brain.</h2></div>
          <p>Walkthroughs, programming notes, electronics, Linux, networking, and reusable prompt guides.</p>
        </header>
        <div className="brain-grid">
          <div className="notes-list">
            {notes.map((note, index) => (
              <Link href={`/notes/${note.slug}`} key={note.slug}><span>0{index + 1}</span><div><p>{note.category} / {formatDate(note.publishedAt)}</p><h3>{note.title}</h3><small>{note.readingTime} MIN READ</small></div></Link>
            ))}
          </div>
          <aside className="prompt-panel">
            <p className="eyebrow">PROMPT INDEX / QUICK ACCESS</p>
            <code>/blueprint</code><code>/handwritten</code><code>/machineview</code><code>/sequence</code>
            <p>Search and reuse visual and technical prompt patterns without starting from an empty page.</p>
            <Link className="btn-secondary" href="/prompts">Browse prompt guides</Link>
          </aside>
        </div>
      </section>

      <section className="home-method shell">
        <p className="eyebrow"><span>005</span> OPERATING METHOD</p>
        <div className="method-grid">{workingMethod.map((item) => <div key={item.step}><span>{item.step}</span><h3>{item.label}</h3><p>{item.description}</p></div>)}</div>
      </section>
    </div>
  );
}
