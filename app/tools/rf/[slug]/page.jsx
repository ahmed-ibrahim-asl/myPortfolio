import { notFound } from "next/navigation";
import SatelliteWorkspace from "@/components/tools/satellite/SatelliteWorkspace";
import { rfCalculators } from "@/data/rf-calculators";
import { createPageMetadata } from "@/lib/seo";
import { ToolSearchHook, ToolSearchSchema } from "@/components/tools/ToolSearchHook";

export const dynamicParams = false;

export function generateStaticParams() {
  return rfCalculators.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = rfCalculators.find((item) => item.slug === slug);
  if (!tool) return {};
  return createPageMetadata({
    title: tool.title,
    description: tool.summary,
    pathname:`/tools/rf/${slug}/`
  });
}

export default async function RfToolPage({ params }) {
  const { slug } = await params;
  if (!rfCalculators.some((item) => item.slug === slug)) notFound();
  return <>
    <ToolSearchSchema slug={`rf-${slug}`} pathname={`/tools/rf/${slug}/`} />
    <SatelliteWorkspace key={slug} slug={slug} routeRoot="rf" />
    <ToolSearchHook slug={`rf-${slug}`} />
  </>;
}
