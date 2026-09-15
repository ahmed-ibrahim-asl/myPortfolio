import { RecognitionRecord } from "@/components/CommunityRecord";
import { WorkBreadcrumb } from "@/components/WorkHub";
import { createPageMetadata } from "@/lib/seo";
import styles from "@/components/WorkPages.module.css";
export const metadata = createPageMetadata({ title: "Awards & Competitions", description: "Team competition results, awards, and certificates.", pathname: "/work/recognition/" });
export default function RecognitionPage() { return <div className={`asl-page ${styles.page}`}><WorkBreadcrumb category={{ id: "recognition", title: "Awards & Competitions" }} /><header className={styles.heading}><h1>Awards & Competitions</h1></header><RecognitionRecord /></div>; }
