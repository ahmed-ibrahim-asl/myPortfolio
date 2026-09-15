import { notFound } from "next/navigation";
import { CalculatorShell } from "@/components/tools/CalculatorShell";
import { CALCULATOR_COMPONENTS } from "@/components/tools/calculators";
import { getAllTools, getTool } from "@/lib/tools";
import { absoluteUrl } from "@/lib/site";
import { DesignToolPage } from '@/components/tools/design/DesignToolPage';
import { getToolSearchHook } from '@/data/tool-search-hooks';
import { twitterImage } from '@/lib/seo';

export function generateStaticParams() {
  return getAllTools().map((tool) => ({ slug: tool.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const searchHook = getToolSearchHook(slug);
  const title = searchHook?.seoTitle ?? tool.title;
  const description = searchHook?.metaDescription ?? tool.summary;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/tools/${tool.slug}/`)
    },
    openGraph: {
      type: "article",
      title,
      description,
      tags: tool.tags
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImage]
    }
  };
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
