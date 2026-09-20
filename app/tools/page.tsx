import React from "react";
import { engineeringTools } from "@/data/tools";
import { ToolsCategoryHub } from "@/components/tools/ToolsCategoryHub";
import { getAllTools } from "@/lib/tools";
import { satelliteCalculators } from "@/data/satellite-course";
import { rfCalculators } from "@/data/rf-calculators";
import { createPageMetadata } from "@/lib/seo";
import { getGlobalToolSearchItems } from "@/data/tool-categories";
import { ToolsQuickSearch } from "@/components/tools/ToolsQuickSearch";

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
            Start with the kind of problem you are solving. Each category opens a focused shelf of
            calculators or guided workbenches, so you only see the instruments that matter.
          </p>
        </div>
      </header>

      <main className="section shell tools-unified-section">
        <ToolsQuickSearch items={searchItems} />
        <ToolsCategoryHub />
      </main>
    </div>
  );
}
