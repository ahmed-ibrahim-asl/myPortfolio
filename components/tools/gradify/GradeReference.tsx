import type { UniversityProfile } from "@/lib/tools/gradify/universities";
import styles from "./GradifyWorkspace.module.css";

export default function GradeReference({ profile }: { profile: UniversityProfile }) {
  const hasPercentages = profile.grades.length > 0 && profile.grades.every(grade => grade.minPercent !== undefined);
  const grades = [...profile.grades].sort((a, b) => hasPercentages ? (b.minPercent ?? 0) - (a.minPercent ?? 0) : b.points - a.points);
  return <div className={styles.guideGrid}>
    <section className={styles.panel} aria-labelledby="scale-guide-title">
      <div className={styles.panelHeading}><div><p className={styles.eyebrow}>Grading guide</p><h2 id="scale-guide-title">{profile.name}</h2><p lang="ar" className={styles.arabicName}>{profile.arabicName}</p></div><span className={styles.scaleTag}>{Number.isFinite(profile.maxGpa) ? profile.maxGpa.toFixed(1) : "N/A"} scale</span></div>
      <div className={styles.gradeTableWrap}><table className={styles.gradeTable}><thead><tr><th scope="col">Letter grade</th><th scope="col">Grade points</th>{hasPercentages && <th scope="col">Percentage</th>}</tr></thead><tbody>{grades.map((grade, index) => <tr key={`${grade.grade}-${index}`}><th scope="row">{grade.grade || "Unnamed"}</th><td>{Number.isFinite(grade.points) ? grade.points.toFixed(2) : "Set a value"}</td>{hasPercentages && <td>{grade.minPercent}%{index === 0 ? " to 100%" : ` to <${grades[index - 1].minPercent}%`}</td>}</tr>)}</tbody></table></div>
      {!hasPercentages && <p className={styles.helpText}>Percentage conversion is unavailable for this profile. Use the letter grade on your transcript.</p>}
    </section>
    <div className={styles.guideAside}>
      <section className={styles.panel}><p className={styles.eyebrow}>About this scale</p><h2>{profile.status === "delta-tested" ? "Tested for Delta Engineering" : profile.status === "custom" ? "Your custom scale" : "Reference scale"}</h2><p className={styles.muted}>{profile.note}</p>{profile.status === "reference" && <p className={styles.muted}>This profile has not been tested against your university’s transcripts. Confirm the scale for your faculty, program, and enrollment year before relying on the estimate.</p>}{profile.sourceUrl && <a className={styles.sourceLink} href={profile.sourceUrl} target="_blank" rel="noreferrer">View grading source <span aria-hidden="true">↗</span></a>}</section>
      <section className={styles.formulaNote}><p className={styles.eyebrow}>Before you calculate</p><ul className={styles.guideList}><li>Use GPA credit hours, which can differ from earned graduation credits.</li><li>Do not enter pass/fail courses unless your handbook says they affect GPA.</li><li>Repeated courses may replace or combine earlier attempts. Check your university’s retake policy.</li><li>A percentage is mapped through grade boundaries; it is never converted directly into a fraction of the GPA scale.</li></ul></section>
    </div>
  </div>;
}
