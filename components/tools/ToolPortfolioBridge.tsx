import React from 'react';
import Link from 'next/link';
import { profile } from '@/data/portfolio';
import styles from './ToolPortfolioBridge.module.css';
import { PublicImage } from '@/components/PublicImage';

export function ToolPortfolioBridge() {
  return (
    <aside className={styles.bridge} aria-label="About the tool creator">
      <div className={styles.identity}>
        <PublicImage src={profile.portrait} alt={profile.name} sizes="64px" loading="lazy" />
        <div><span className={styles.label}>Behind the workbench</span><Link href="/about/">{profile.name}</Link><p>{profile.role}</p></div>
      </div>
      <div className={styles.copy}>
        <h2>From a calculation to a working prototype.</h2>
        <p>I build embedded firmware, connected hardware, and the interfaces that make them usable. Explore the projects behind this workbench, or tell me what you need to build.</p>
        <nav aria-label="Explore Ahmed's work" className={styles.links}>
          <Link href="/work/embedded-iot/">See embedded &amp; IoT projects <span aria-hidden="true">↗</span></Link>
          <Link href="/contact/">Discuss a project <span aria-hidden="true">↗</span></Link>
          <Link href="/notes/">Read engineering notes <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </aside>
  );
}
