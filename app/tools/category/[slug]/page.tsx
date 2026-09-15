import Link from "next/link";
import { CalculatorThumbnail } from "@/components/tools/CalculatorThumbnail";
import { notFound } from "next/navigation";
import { UnifiedToolsIndex } from "@/components/tools/UnifiedToolsIndex";
import {
  getToolCategory,
  getToolCategoryItems,
  getToolCategoryStaticParams
} from "@/data/tool-categories";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/tools/design/DesignLab.module.css";

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

  return (
    <div className="asl-page asl-tools-register asl-tool-category-page">
      <div className="section shell asl-tool-category-shell">
        <nav className="asl-tool-breadcrumb" aria-label="Breadcrumb">
          <Link href="/tools/">Tools</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{category.title}</span>
        </nav>
        <header className="asl-tool-category-header">
          <p className="eyebrow">{category.label} / {items.length} {items.length === 1 ? "tool" : "tools"}</p>
          <h1>{category.title}</h1>
          <p>{category.intro}</p>
        </header>
        <section className="asl-tool-category-catalog" aria-label={`${category.title} tools`}>
          {category.slug==='circuit-design'&&<p style={{marginBottom:28}}><Link href="/tools/smps-designer/">Looking for power supplies? Explore the new SMPS Design tool →</Link></p>}
          {category.slug === "circuit-design" ? <div className={styles.groups}>
            {[...new Set(items.map(item => item.group))].map(group => <section key={group}>
              <h2>{group}</h2>
              <div className={styles.cards}>{items.filter(item => item.group === group).map(item => <Link className={styles.card} key={item.id} href={item.href}>
                {'visualKey' in item&&<CalculatorThumbnail visualKey={item.visualKey} title={item.title}/>}
                <h3>{item.title}</h3><p>{item.summary}</p><span>Open tool →</span>
              </Link>)}</div>
            </section>)}
          </div> : <UnifiedToolsIndex items={items} categoryTitle={category.title} />}
        </section>
      </div>
    </div>
  );
}
