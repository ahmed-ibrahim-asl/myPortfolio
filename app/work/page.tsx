import React from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { projects } from "@/data/portfolio";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Embedded Systems and Robotics Projects",
  description:
    "Explore embedded systems and robotics projects by Ahmed Asl, including ESP32 firmware, IoT telemetry, secure hardware, OTA tools, and Flutter interfaces.",
  pathname: "/work/"
});

export default function WorkPage() {
  return (
    <div className="asl-page asl-work-log">
      <section className="page-intro shell asl-page-intro">
        <p className="eyebrow">Work log / verified builds</p>
        <h1>Embedded Systems, IoT, and Robotics Projects</h1>
        <p className="page-lede">
          Explore my work in ESP32 firmware, IoT telemetry, autonomous robots,
          secure access systems, OTA management, and Flutter control interfaces.
        </p>
      </section>

      <section className="shell page-section" aria-labelledby="project-archive-title">
        <div className="archive-header">
          <h2 className="sr-only" id="project-archive-title">Project archive</h2>
          <span className="mono muted">{projects.length} projects</span>
          <span className="mono muted">Hardware, firmware, and interface work</span>
        </div>
        <div className="project-grid asl-work-log-list">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              project={project}
              index={index}
              compact
            />
          ))}
        </div>
      </section>
    </div>
  );
}
