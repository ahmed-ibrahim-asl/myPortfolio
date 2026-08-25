import React from "react";
import Link from "next/link";
import { AslLogo } from "@/components/brand/AslLogo";
import { AslSection } from "@/components/brand/AslSection";
import { FreeToolsHook } from "@/components/FreeToolsHook";
import { PostCard } from "@/components/PostCard";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/SectionHeading";
import {
  education,
  experience,
  profile,
  projects,
  publication,
  technologyGroups,
  workingMethod
} from "@/data/portfolio";
import { getAllPosts } from "@/lib/content";

const toolEntries = [
  {
    label: "Calculate",
    description: "Circuit values, timing, conversions, and engineering math.",
    href: "/tools#calculators"
  },
  {
    label: "Generate",
    description: "Embedded starter code and complete machine-learning projects.",
    href: "/tools/sensor-code-generator"
  },
  {
    label: "Simulate",
    description: "Tune a PID loop and inspect the response before hardware tests.",
    href: "/tools/pid-simulator"
  },
  {
    label: "Plan",
    description: "Turn a model idea into a reproducible training project.",
    href: "/tools/ai-script-generator"
  }
];

export default function HomePage() {
  const posts = getAllPosts();
  const featuredProjects = projects.filter((project) => project.featured).slice(0, 4);
  const competitionProject = projects.find(
    (project) => project.slug === "megasumo-autonomous-robot"
  ) || projects[0];

  return (
    <>
      <section className="asl-hero" aria-labelledby="home-title">
        <AslLogo form="arabic" className="asl-watermark" decorative />
        <div className="shell asl-hero-frame">
          <div className="asl-hero-index mono" aria-hidden="true">
            <span>01</span>
            <span>Origin</span>
          </div>

          <div className="asl-hero-copy">
            <p className="hero-kicker">
              <span className="status-dot" aria-hidden="true" />
              {profile.label}
            </p>
            <h1 id="home-title">
              <span className="asl-hero-name">{profile.name}</span>
              <span className="asl-hero-role">{profile.role}</span>
            </h1>
            <p className="asl-hero-lede">{profile.headline}</p>
            <p className="asl-hero-summary">{profile.summary}</p>
            <div className="hero-actions">
              <Link className="button primary" href="/contact">
                Send a project brief
              </Link>
              <Link className="button text-button" href="/work">
                Inspect selected work
              </Link>
            </div>
          </div>

          <div className="asl-hero-line" aria-hidden="true"><span /></div>

          <aside className="asl-hero-evidence" aria-label="Profile and availability">
            <ProfilePortrait context="home" />
            <dl className="asl-profile-register">
              <div>
                <dt>Based</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Current role</dt>
                <dd>{experience[0].role}</dd>
              </div>
              <div>
                <dt>Availability</dt>
                <dd>{profile.availability}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <AslSection index="02" label="Capabilities" className="asl-capabilities">
        <SectionHeading title="One system, traced across its boundaries." />
        <p className="section-intro asl-section-lede">
          I work wherever the fault or unanswered question lives: board, firmware,
          network, model, or operator interface.
        </p>
        <div className="asl-capability-register">
          {technologyGroups.map((group) => (
            <article key={group.index}>
              <span className="mono">{group.index}</span>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <p className="asl-capability-tools mono">{group.tools.slice(0, 4).join(" · ")}</p>
            </article>
          ))}
        </div>
      </AslSection>

      <AslSection index="03" label="Selected work" className="asl-selected-work">
        <SectionHeading
          title="Problems, builds, and measured results."
          action={<Link className="text-link" href="/work">Open the full work log</Link>}
        />
        <div className="project-grid asl-project-log">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} />
          ))}
        </div>
      </AslSection>

      <AslSection index="04" label="Evidence" className="asl-evidence-section">
        <SectionHeading title="Teaching, research, and competition evidence." />
        <div className="asl-evidence-register">
          <article>
            <span className="mono">Teaching</span>
            <h3>{experience[0].role}</h3>
            <p>{experience[0].organization}</p>
            <Link className="text-link" href="/about#experience">View experience</Link>
          </article>
          <article>
            <span className="mono">Research</span>
            <h3>{publication.title}</h3>
            <p>{publication.description}</p>
            <Link className="text-link" href="/about#publications">View publication</Link>
          </article>
          <article>
            <span className="mono">Competition</span>
            <h3>{competitionProject.title}</h3>
            <p>{competitionProject.outcome}</p>
            <Link className="text-link" href={`/work#${competitionProject.slug}`}>View project</Link>
          </article>
          {education[0] ? (
            <article>
              <span className="mono">Study</span>
              <h3>{education[0].institution}</h3>
              <p>{education[0].credential}</p>
              <Link className="text-link" href="/about">Read my background</Link>
            </article>
          ) : null}
        </div>
      </AslSection>

      <AslSection index="05" label="Method" className="asl-method" id="method">
        <SectionHeading title="Question, learn, build, test." />
        <div className="asl-method-register">
          {workingMethod.map((item) => (
            <article key={item.step}>
              <span className="mono">{item.step}</span>
              <h3>{item.label}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </AslSection>

      <AslSection index="06" label="Workbench" className="asl-tool-entry">
        <SectionHeading
          title="Use the tools built from the work."
          action={<Link className="text-link" href="/tools">Open all engineering tools</Link>}
        />
        <FreeToolsHook />
        <div className="asl-tool-register">
          {toolEntries.map((entry, index) => (
            <Link href={entry.href} key={entry.label}>
              <span className="mono">{String(index + 1).padStart(2, "0")}</span>
              <h3>{entry.label}</h3>
              <p>{entry.description}</p>
              <span className="asl-register-action mono">Open workbench</span>
            </Link>
          ))}
        </div>
      </AslSection>

      <AslSection index="07" label="Field notes" className="asl-writing-preview">
        <SectionHeading
          title="Methods another engineer can reproduce."
          action={<Link className="text-link" href="/writing">Browse all field notes</Link>}
        />
        <div className="post-list">
          {posts.slice(0, 3).map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </AslSection>

      <AslSection index="08" label="Contact" className="asl-home-contact">
        <div className="asl-contact-callout">
          <div>
            <h2>Bring the problem, even if the fix is unclear.</h2>
            <p>
              Describe the system, its current behavior, and what you have measured.
              I will tell you whether I can help and what the next useful step is.
            </p>
          </div>
          <div className="home-contact-actions">
            <Link className="button primary" href="/contact">Send a project brief</Link>
            <a className="button text-button" href={`mailto:${profile.email}`}>Email directly</a>
          </div>
        </div>
      </AslSection>
    </>
  );
}
