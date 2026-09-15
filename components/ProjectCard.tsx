import React from "react";
import { Project } from "@/types/portfolio";

interface ProjectCardProps {
  project: Project;
  index: number;
  compact?: boolean;
}

export function ProjectCard({ project, index, compact = false }: ProjectCardProps) {
  return (
    <article
      className={`project-card ${compact ? "compact" : ""}`}
      id={project.slug}
    >
      <div className="project-card-top">
        <span className="mono muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="mono muted">{project.year}</span>
      </div>

      {project.website ? (
        <div className="project-media website-preview"><span className="mono">Website design / live project</span><strong>{project.title}</strong><span>{project.website}</span></div>
      ) : project.image ? (
        <div className="project-media">
          <img
            src={project.image}
            alt={`${project.title} hardware or interface`}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="project-media project-placeholder" aria-hidden="true">
          <span>{project.tags[0]}</span>
        </div>
      )}

      {compact && project.gallery?.length ? (
        <div
          className="project-evidence-strip"
          aria-label={`${project.title} additional images`}
        >
          {project.gallery.map((image) => (
            <a href={image.src} target="_blank" rel="noreferrer" key={image.src}><img src={image.src} alt={image.alt} loading="lazy" /></a>
          ))}
        </div>
      ) : null}
      <div className="project-copy">
        <p className="project-category">{project.category}</p>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        {project.links?.map(link => <a className="text-link" href={link.href} target={link.href.startsWith("#") ? undefined : "_blank"} rel={link.href.startsWith("#") ? undefined : "noreferrer"} key={link.href}>{link.label}</a>)}
        {project.slug === "multi-mcu-security-lock" && <small>Illustrated architecture above; original Proteus simulations below.</small>}
      </div>

      <div className="project-meta">
        <div className="tag-row">
          {project.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <span className="outcome">Result / {project.outcome}</span>
      </div>
    </article>
  );
}
