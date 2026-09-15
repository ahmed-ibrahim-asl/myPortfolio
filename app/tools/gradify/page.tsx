import Link from 'next/link';
import { gradifySections } from '@/data/gradify-sections';
import styles from '@/components/tools/gradify/GradifyWorkspace.module.css';
import { createPageMetadata } from '@/lib/seo';
import '@/components/tools/gradify/delta.generated.css';
import '@/components/tools/gradify/delta-theme.css';

export const metadata = createPageMetadata({
  title: 'Gradify: University GPA Calculator and Delta Graduation Planner',
  description: 'Calculate semester GPA and cumulative GPA, plan a target, compare university grading scales, and use the tested Delta engineering transcript and graduation planner.',
  pathname: '/tools/gradify/',
});

export default function GradifyPage() {
  return <div className={styles.workspace}>
    <Link className={styles.sourceLink} href="/tools/category/workbenches/">← Workbenches</Link>
    <header className={styles.landingHeading}><p className={styles.eyebrow}>Gradify / University tools</p><h1>What would you like to work on?</h1><p>Choose a tool, then select your university inside it.</p></header>
    <div className={styles.sectionCards}>{gradifySections.map(section => <Link className={styles.sectionCard} href={`/tools/gradify/${section.slug}/`} key={section.slug}><span className={styles.eyebrow}>{section.label}</span><h2>{section.title}</h2><p>{section.detail}</p><span className={styles.sectionAction}>Explore {section.title.toLowerCase()} ↗</span></Link>)}</div>
  </div>;
}
