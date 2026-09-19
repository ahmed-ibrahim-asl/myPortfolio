import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupedToolsIndex } from "@/components/tools/GroupedToolsIndex";
import {
  getToolCategory,
  getToolCategoryItems,
  getToolCategoryStaticParams
} from "@/data/tool-categories";
import { createPageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return getToolCategoryStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getToolCategory(slug);
  if (!category) notFound();

  return createPageMetadata({
    title: `${category.title} Engineering Tools`,
    description: category.intro,
    pathname: `/tools/category/${category.slug}/`
  });
}

export default async function ToolCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getToolCategory(slug);
  if (!category) notFound();
  const items = getToolCategoryItems(slug);
  const groups = [...new Set(items.map((item) => item.group).filter(Boolean))] as string[];

  return (
    <div className="asl-page asl-tools-register asl-tool-category-page">
      <div className="section shell asl-tool-category-shell">
        <nav className="asl-tool-breadcrumb" aria-label="Breadcrumb">
          <Link href="/tools/">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{category.title}</span>
        </nav>
        <header className="asl-tool-category-header">
          <p className="eyebrow">
            {category.label} / {items.length} {items.length === 1 ? "tool" : "tools"}
          </p>
          <h1>{category.title}</h1>
          <p>{category.intro}</p>
        </header>
        <section className="asl-tool-category-catalog" aria-label={`${category.title} tools`}>
          <GroupedToolsIndex items={items} categoryTitle={category.title} groupOrder={groups} />
        </section>
      </div>
    </div>
  );
}
