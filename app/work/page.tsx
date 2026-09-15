import React from "react";
import { WorkHub } from "@/components/WorkHub";
import { WorkResearchAndTeaching } from "@/components/WorkResearchAndTeaching";
import { LegacyWorkLinks } from "@/components/LegacyWorkLinks";
import { projects } from "@/data/portfolio";
import { workCategories } from "@/data/work-categories";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering, Robotics and Website Projects",
  description:
    "Explore Ahmed Asl’s engineering projects, client websites, and competition awards, from IoT robotics and secure hardware to web design.",
  pathname: "/work/"
});

export default function WorkPage() {
  const destinations: Record<string, string> = { recognition: "/work/recognition/", "agribot-award": "/work/recognition/#agribot-award", "dead-code-award": "/work/recognition/#dead-code-award" };
  workCategories.forEach(group => {
    destinations[group.id] = `/work/${group.id}/`;
    projects.filter(project => group.categories.includes(project.category)).forEach(project => { destinations[project.slug] = `/work/${group.id}/${project.slug}/`; });
  });
  return (
    <div className="asl-page">
      <LegacyWorkLinks destinations={destinations} />
      <section className="page-intro shell asl-page-intro">
        <p className="eyebrow">Work log / verified builds</p>
        <h1>Selected work</h1>
        <p className="page-lede">
          Explore my work in ESP32 firmware, IoT telemetry, autonomous robots,
          secure access systems, OTA management, Flutter interfaces, and client websites.
        </p>
      </section>

      <WorkHub />
      <WorkResearchAndTeaching />
    </div>
  );
}
