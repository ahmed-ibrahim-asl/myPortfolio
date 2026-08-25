import React from "react";
import { engineeringTools } from "@/data/tools";
import { ToolNavCard } from "@/components/tools/ToolNavCard";
import { ToolsIndex } from "@/components/tools/ToolsIndex";
import { getAllTools } from "@/lib/tools";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering Tools: Workbenches and Electronics Calculators",
  description:
    "Five advanced engineering workbenches and 36 interactive electronics calculators for circuits, components, number systems, firmware, IoT, ML, and security labs.",
  pathname: "/tools/"
});

export default function ToolsIndexPage() {
  const calculators = getAllTools();
  const workbenchGroups = [
    {
      label: "Generate",
      note: "Turn a brief into usable code and project scaffolding.",
      ids: ["ai-script-generator", "sensor-code-generator"]
    },
    {
      label: "Simulate",
      note: "Explore control behavior before tuning hardware.",
      ids: ["pid-simulator"]
    },
    {
      label: "Plan",
      note: "Estimate power budgets before committing components.",
      ids: ["battery-estimator"]
    },
    {
      label: "Investigate",
      note: "Build commands for authorized, documented security labs.",
      ids: ["security-command-builder"]
    }
  ];

  return (
    <div className="asl-page asl-tools-register">
      <section className="section shell asl-tools-header" aria-labelledby="tools-title">
        <p className="eyebrow">Engineering workbench / 41 working instruments</p>
        <h1 id="tools-title">Choose the job. Open the instrument.</h1>
        <p className="section-intro">
          Fast calculators for known quantities and guided workbenches for the larger engineering
          decisions around code, control, power, and security.
        </p>
        <nav className="asl-task-index" aria-label="Tool tasks">
          <a href="#calculators"><span>01</span>Calculate</a>
          {workbenchGroups.map((group, index) => (
            <a href={`#task-${group.label.toLowerCase()}`} key={group.label}>
              <span>{String(index + 2).padStart(2, "0")}</span>{group.label}
            </a>
          ))}
        </nav>
      </section>

      <section id="calculators" className="section shell tools-calculator-section asl-task-group">
        <div className="tools-intro-grid">
          <div>
            <p className="eyebrow">01 / Calculate / 36 instruments</p>
            <h1>Start with the calculation in front of you.</h1>
            <p className="section-intro">
              Search circuits, component values, timing, number systems, conversions, and
              engineering math. Every calculator is interactive and works without an account.
            </p>
          </div>
          <aside className="tools-intro-note">
            <span className="mono">BENCH MODE</span>
            <strong>Search first. Filter only when you need it.</strong>
            <p>Choose a card to calculate, then find related formulas without returning to this page.</p>
          </aside>
        </div>

        <ToolsIndex tools={calculators} />
      </section>

      <div className="shell tools-scroll-cue" aria-hidden="true">
        <span className="mono">GUIDED WORKBENCHES</span>
        <span className="tools-scroll-track"><span /></span>
      </div>

      <section id="advanced-tools" className="section shell tool-page tools-featured-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Advanced engineering workbenches</p>
            <h2>Generate, simulate, and learn the full workflow.</h2>
            <p className="section-intro">
              Guided workbenches for firmware, IoT, control, machine learning, and authorized
              security labs, all built as working tools instead of static demos.
            </p>
          </div>
        </div>

        <div className="asl-workbench-groups">
          {workbenchGroups.map((group, groupIndex) => {
            const tools = group.ids
              .map((id) => engineeringTools.find((tool) => tool.id === id))
              .filter((tool): tool is (typeof engineeringTools)[number] => Boolean(tool));

            return (
              <section
                className="asl-workbench-group"
                id={`task-${group.label.toLowerCase()}`}
                key={group.label}
                aria-labelledby={`task-title-${groupIndex}`}
              >
                <header className="asl-workbench-group-heading">
                  <span className="mono">{String(groupIndex + 2).padStart(2, "0")}</span>
                  <div>
                    <h3 id={`task-title-${groupIndex}`}>{group.label}</h3>
                    <p>{group.note}</p>
                  </div>
                </header>
                <div className="asl-workbench-group-tools">
                  {tools.map((tool) => (
                    <ToolNavCard
                      key={tool.id}
                      tool={tool}
                      index={engineeringTools.findIndex((item) => item.id === tool.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}
