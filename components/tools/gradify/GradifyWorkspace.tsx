"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { UNIVERSITY_PROFILES, getUniversityProfile, type UniversityProfile } from "@/lib/tools/gradify/universities";
import { gradifySections, type GradifySection } from "@/data/gradify-sections";
import UniversityCalculator from "./UniversityCalculator";
import GradeReference from "./GradeReference";
import styles from "./GradifyWorkspace.module.css";

const DeltaWorkspace = dynamic(() => import("./delta/DeltaWorkspace"), { ssr: false, loading: () => <div className={styles.loading} role="status">Loading the Delta graduation workspace…</div> });
const defaultId = UNIVERSITY_PROFILES.find(profile => profile.status === "delta-tested")?.id ?? UNIVERSITY_PROFILES[0].id;

export default function GradifyWorkspace({ section = "calculator" }: { section?: GradifySection }) {
  const [selectedId, setSelectedId] = useState(defaultId);
  const [visitedIds, setVisitedIds] = useState([defaultId]);
  const [customProfile, setCustomProfile] = useState<UniversityProfile | null>(null);
  const profile = getUniversityProfile(selectedId);
  const guideProfile = profile.status === "custom" && customProfile ? customProfile : profile;
  const isDelta = profile.status === "delta-tested";
  const entry = gradifySections.find(item => item.slug === section)!;
  const universities = section === "planner" ? UNIVERSITY_PROFILES.filter(item => item.status === "delta-tested") : UNIVERSITY_PROFILES;

  function selectUniversity(id: string) {
    setSelectedId(id);
    setVisitedIds(current => current.includes(id) ? current : [...current, id]);
  }

  return <article className={styles.workspace} data-gradify-workspace>
    <header className={styles.heading}>
      <Link href="/tools/gradify/" className={styles.backLink}>← All Gradify tools</Link>
      <div className={styles.titleRow}><div><p className={styles.eyebrow}>Gradify</p><div className={styles.titleLine}><h1>{entry.title}</h1></div><p className={styles.description}>{entry.detail}</p></div></div>
    </header>
    <nav className={styles.toolNavigation} aria-label="Gradify tools">{gradifySections.map(item => <Link key={item.slug} href={`/tools/gradify/${item.slug}/`} aria-current={section === item.slug ? "page" : undefined}>{item.title}</Link>)}</nav>
    <section className={styles.universityBar} aria-label="University selection">
      <label className={`${styles.field} ${styles.universityField}`} htmlFor="gradify-university"><span>Your university</span><select id="gradify-university" value={selectedId} onChange={event => selectUniversity(event.target.value)}>{universities.map(item => <option key={item.id} value={item.id}>{item.name}: {item.arabicName}</option>)}</select></label>
      <div className={styles.universityStatus}><span className={`${styles.statusBadge} ${isDelta ? styles.testedBadge : ""}`}>{isDelta ? "Tested · Delta Engineering" : profile.status === "custom" ? "You define the scale" : "Reference scale"}</span><p>{isDelta ? "Transcript and graduation tools available for this program." : "Confirm the scale for your faculty and program."}</p></div>
    </section>
    <div className={styles.tabPanel} style={{ marginTop: 24 }}>
      {section === "calculator" && visitedIds.map(id => <div key={id} hidden={selectedId !== id}><UniversityCalculator profile={getUniversityProfile(id)} onCustomProfile={setCustomProfile} /></div>)}
      {section === "planner" && <DeltaWorkspace />}
      {section === "guide" && <GradeReference profile={guideProfile} />}
    </div>
  </article>;
}
