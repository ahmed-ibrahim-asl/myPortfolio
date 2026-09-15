import Link from 'next/link';
import { gradifySections } from '@/data/gradify-sections';
import styles from '@/components/tools/gradify/GradifyWorkspace.module.css';
import { createPageMetadata } from '@/lib/seo';
import { ToolDirectAnswer, ToolSearchHook, ToolSearchSchema } from '@/components/tools/ToolSearchHook';
import { getToolSearchHook } from '@/data/tool-search-hooks';
import '@/components/tools/gradify/delta.generated.css';
import '@/components/tools/gradify/delta-theme.css';

const searchHook = getToolSearchHook('gradify')!;

export const metadata = createPageMetadata({
  title: searchHook.seoTitle,
  description: searchHook.metaDescription,
  pathname: '/tools/gradify/',
});

export default function GradifyPage() {
  return <div className={styles.workspace}>
    <Link className={styles.sourceLink} href="/tools/category/workbenches/">← Workbenches</Link>
    <header className={styles.landingHeading}><p className={styles.eyebrow}>Gradify / University tools</p><h1>What would you like to work on?</h1><p>Choose a tool, then select your university inside it.</p></header>
    <ToolDirectAnswer slug="gradify" />
    <ToolSearchSchema slug="gradify" />
    <div className={styles.sectionCards}>{gradifySections.map(section => <Link className={styles.sectionCard} href={`/tools/gradify/${section.slug}/`} key={section.slug}><span className={styles.eyebrow}>{section.label}</span><h2>{section.title}</h2><p>{section.detail}</p><span className={styles.sectionAction}>Explore {section.title.toLowerCase()} ↗</span></Link>)}</div>
    <ToolSearchHook slug="gradify" />
  </div>;
}
