import React from "react";
import { engineeringTools } from "@/data/tools";
import { ToolsCategoryHub } from "@/components/tools/ToolsCategoryHub";
import { getAllTools } from "@/lib/tools";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Engineering Tools: Workbenches and Electronics Calculators",
  description:
    "Search guided engineering workbenches, academic planning tools, and interactive electronics calculators in one practical catalog.",
  pathname: "/tools/"
});

export default function ToolsIndexPage() {
  const calculators = getAllTools();

  return (
    <div className="asl-page asl-tools-register">
      <header className="section shell asl-tools-header" aria-labelledby="tools-title">
        <p className="eyebrow">Engineering workbench / {engineeringTools.length + calculators.length} working instruments</p>
        <div className="asl-tools-heading-grid">
          <h1 id="tools-title">Find the right instrument for the job.</h1>
          <p className="section-intro">
            Start with the kind of problem you are solving. Each category opens a focused shelf of
            calculators or guided workbenches, so you only see the instruments that matter.
          </p>
        </div>
      </header>

      <main className="section shell tools-unified-section">
        <ToolsCategoryHub />
      </main>
    </div>
  );
}
