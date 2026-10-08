import React from "react";
import { engineeringTools } from "@/data/tools";
import { getAllTools } from "@/lib/tools";
import { satelliteCalculators } from "@/data/satellite-course";
import { rfCalculators } from "@/data/rf-calculators";
import { createPageMetadata } from "@/lib/seo";
import { getGlobalToolSearchItems } from "@/data/tool-categories";
import { ToolsBrowser } from "@/components/tools/ToolsBrowser";

export const metadata = createPageMetadata({
  title: "Engineering Tools: Workbenches and Electronics Calculators",
  description:
    "Search guided engineering workbenches, academic planning tools, and interactive electronics calculators in one practical catalog.",
  pathname: "/tools/"
});

export default function ToolsIndexPage() {
  const calculators = getAllTools();
  const totalToolCount = engineeringTools.length + calculators.length + satelliteCalculators.length + rfCalculators.length;
  const searchItems = getGlobalToolSearchItems();

  return (
    <div className="asl-page asl-tools-register">
      <header className="section shell asl-tools-header" aria-labelledby="tools-title">
        <p className="eyebrow">Engineering workbench / {totalToolCount} working instruments</p>
        <div className="asl-tools-heading-grid">
          <h1 id="tools-title">Find the right instrument for the job.</h1>
          <p className="section-intro">
            Free calculators, generators, and guided workbenches for engineers. Search a tool or choose a category to get started.
          </p>
        </div>
      </header>

      <main className="section shell tools-unified-section">
        <ToolsBrowser items={searchItems} />
      </main>
    </div>
  );
}
