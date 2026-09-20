import { notFound } from "next/navigation";
import { CalculatorShell } from "@/components/tools/CalculatorShell";
import { CALCULATOR_COMPONENTS } from "@/components/tools/calculators";
import { getAllTools, getTool } from "@/lib/tools";
import { DesignToolPage } from '@/components/tools/design/DesignToolPage';
import { getToolSearchHook } from '@/data/tool-search-hooks';
import { buildToolMetadata } from '@/lib/tool-metadata';

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  return buildToolMetadata(tool, getToolSearchHook(slug));
}

export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  if (tool.custom) return <DesignToolPage tool={tool} />;
  const Calculator = CALCULATOR_COMPONENTS[tool.slug];
  if (!Calculator) notFound();

  return (
    <CalculatorShell tool={tool}>
      <Calculator />
    </CalculatorShell>
  );
}
