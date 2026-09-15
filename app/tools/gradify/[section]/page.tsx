import { notFound } from "next/navigation";
import GradifyWorkspace from "@/components/tools/gradify/GradifyWorkspace";
import { gradifySections } from "@/data/gradify-sections";
import { createPageMetadata } from "@/lib/seo";
import "@/components/tools/gradify/delta.generated.css";
import "@/components/tools/gradify/delta-theme.css";

export const dynamicParams = false;
export function generateStaticParams() { return gradifySections.map(({ slug }) => ({ section: slug })); }
type Props = { params: Promise<{ section: string }> };
export async function generateMetadata({ params }: Props) {
  const { section } = await params;
  const entry = gradifySections.find(item => item.slug === section);
  if (!entry) notFound();
  return createPageMetadata({ title: `${entry.title} | Gradify`, description: entry.detail, pathname: `/tools/gradify/${entry.slug}/` });
}
export default async function GradifyToolPage({ params }: Props) {
  const { section } = await params;
  const entry = gradifySections.find(item => item.slug === section);
  if (!entry) notFound();
  return <GradifyWorkspace key={entry.slug} section={entry.slug} />;
}
