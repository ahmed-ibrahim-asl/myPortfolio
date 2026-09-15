import React from "react";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { ProfilePortrait } from "@/components/ProfilePortrait";
import { VolunteerRecord } from "@/components/CommunityRecord";
import {
  coursesTaught,
  education,
  experience,
  profile,
  technologyGroups,
  toolkitHeading,
  toolkitIntro
} from "@/data/portfolio";
import { createPageMetadata, createProfilePageJsonLd } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Embedded Systems Engineer and Educator",
  description:
    "Meet Ahmed Asl, an embedded systems and IoT engineer and teaching assistant. View his experience, technical skills, publications, courses, CV, and workshops.",
  pathname: "/about/"
});

export default function AboutPage() {
  return (
    <div className="asl-page asl-about-trace">
      <JsonLd data={createProfilePageJsonLd()} />

      <section className="page-intro shell about-intro about-story-intro">
        <div className="about-intro-copy">
          <span className="eyebrow">Engineer / educator / lifelong learner</span>
          <h1>I build by following the question through the whole system.</h1>
          <p className="page-lede">
            My first big question was about an ATM: how one machine could recognize an
            account, check money somewhere else, and complete a physical action safely.
            That question became a career across electronics, firmware, networks, software,
            security, robotics, and teaching.
          </p>
          <nav className="portfolio-jump-links" aria-label="About sections"><a className="text-link" href="#experience">Experience</a><a className="text-link" href="#education">Education</a><a className="text-link" href="#volunteering">Volunteering</a><Link className="text-link" href="/work/#recognition">Awards</Link></nav>
        </div>
        <ProfilePortrait context="about" />
      </section>

      <section className="shell about-statement about-statement-focused">
        <div className="about-story-grid">
          <article>
            <span className="mono">01 / FOLLOW THE SIGNAL</span>
            <h2>Across boundaries, not inside one job title.</h2>
            <p>Firmware, electronics, Linux, security, apps, and interface design are tools for tracing one system from input to useful result.</p>
          </article>
          <article>
            <span className="mono">02 / PROVE THE BUILD</span>
            <h2>Make the idea observable.</h2>
            <p>I document assumptions, test failure modes, and turn uncertain requirements into a prototype that people can inspect and improve.</p>
          </article>
          <article>
            <span className="mono">03 / TEACH THE SYSTEM</span>
            <h2>Leave understanding behind.</h2>
            <p>Teaching sharpened a useful engineering habit: a result is stronger when another person can understand, operate, and extend it.</p>
          </article>
        </div>
        <aside className="profile-credential-card">
          <div>
            <h2>Education, experience, and technical record</h2>
            <p>
              Open my CV for degree, work history, projects, courses, and
              technical skills.
            </p>
          </div>
          <a className="button primary" href={profile.cv} target="_blank" rel="noreferrer">
            Open CV
          </a>
        </aside>
      </section>

      <section id="experience" className="section section-ink">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Work experience</h2>
            </div>
          </div>
          
          <div className="timeline">
            {experience.map((item, index) => (
              <article className="timeline-item" key={`${item.role}-${item.period}`}>
                <span className="timeline-index mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.role}</h3>
                  <p className="timeline-org">{item.organization}</p>
                  <p className="timeline-type mono">{item.type}</p>
                </div>
                <div>
                  <p>{item.description}</p>
                  <div className="tag-row dark">
                    {item.tags.map((tag) => (
                      <span className="tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="timeline-meta mono">
                  <span>{item.period}</span>
                  <span>{item.location}</span>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      <section id="education" className="section shell"><div className="section-heading"><h2>Education</h2></div><div className="timeline">
            {/* Render Education from the data layer */}
            {education.map((item, index) => (
              <article className="timeline-item" key={`edu-${index}`}>
                <span className="timeline-index mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.credential}</h3>
                  <p className="timeline-org">{item.institution}</p>
                </div>
                <div className="timeline-meta mono"><span>{item.period}</span></div>
              </article>
            ))}
            </div></section>

      <VolunteerRecord />
      <section id="teaching" className="section teaching-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <h2>Courses taught</h2>
            </div>
          </div>
          <div className="courses-grid">
            {coursesTaught.map((course, index) => (
              <article className="course-card" key={course.title}>
                <div className="course-card-top mono">
                  <span>COURSE_{String(index + 1).padStart(2, "0")}</span>
                  <span>{course.institution}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                {course.href ? (
                  <a className="text-link course-card-link" href={course.href} target="_blank" rel="noreferrer">
                    {course.actionLabel || "Open course"}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="skills" className="section shell about-capabilities-section">
        <div className="section-heading">
          <div>
            <h2>{toolkitHeading}</h2>
            <p className="section-intro">
              {toolkitIntro}
            </p>
          </div>
        </div>
        <div className="technology-matrix">
          {technologyGroups.map((group) => (
            <article className="technology-cluster" key={group.index}>
              <div className="technology-cluster-top">
                <span className="technology-cluster-index mono">{group.index}</span>
                <span className="mono">SYSTEM CLASS</span>
              </div>
              <h3>{group.title}</h3>
              <p>{group.description}</p>
              <ul className="technology-tool-list" aria-label={`${group.title} tools`}>
                {group.tools.map((tool, index) => (
                  <li key={tool}>
                    <span className="mono" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <strong>{tool}</strong>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Client CTA at bottom as per spec */}
      <section className="section home-contact-section">
        <div className="shell home-contact-grid">
          <div>
            <h2>Bring me the problem, even if the solution is not clear yet.</h2>
            <p>
              Tell me what you are trying to build or fix, what already exists, and where
              you are stuck. I will tell you whether I can help and what the next useful
              step should be.
            </p>
          </div>
          <div className="home-contact-actions">
            <Link className="button primary" href="/contact">
              Send your project brief
            </Link>
            <a className="button text-button" href={`mailto:${profile.email}`}>
              Email directly
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
