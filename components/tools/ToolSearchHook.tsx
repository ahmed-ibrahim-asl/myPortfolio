import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { getToolSearchHook } from "@/data/tool-search-hooks";
import { absoluteUrl } from "@/lib/site";
import { personId } from "@/lib/seo";
import styles from "./ToolSearchHook.module.css";

type ToolSearchHookProps = {
  slug: string;
};

export function ToolDirectAnswer({ slug }: ToolSearchHookProps) {
  const hook = getToolSearchHook(slug);
  if (!hook) return null;

  const headingId = `${slug}-direct-answer`;

  return (
    <section className={styles.answer} aria-labelledby={headingId} data-tool-direct-answer>
      <p className={styles.eyebrow}>Answer first</p>
      <h2 id={headingId}>{hook.primaryQuestion}</h2>
      <p>{hook.directAnswer}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className={styles.detailBlock}>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export function ToolSearchHook({ slug }: ToolSearchHookProps) {
  const hook = getToolSearchHook(slug);
  if (!hook) return null;

  const headingId = `${slug}-search-guide`;

  return (
    <section className={styles.layer} aria-labelledby={headingId} data-tool-search-hook>
      <header className={styles.layerHeader}>
        <div>
          <p className={styles.eyebrow}>Design guide</p>
          <h2 id={headingId}>Use the result with engineering context</h2>
        </div>
        <p className={styles.reviewed}>Technical content reviewed <time dateTime={hook.reviewedOn}>September 15, 2026</time></p>
      </header>

      <div className={styles.detailGrid}>
        <DetailList title="When this tool is useful" items={hook.usefulFor} />
        <DetailList title="What the result includes" items={hook.outputs} />
        <DetailList title="What the model does not guarantee" items={hook.limitations} />
        <section className={`${styles.detailBlock} ${styles.scenario}`}>
          <p className={styles.eyebrow}>Worked approach</p>
          <h3>{hook.scenario.title}</h3>
          <p>{hook.scenario.description}</p>
        </section>
      </div>

      <section className={styles.questions} aria-labelledby={`${slug}-questions`}>
        <p className={styles.eyebrow}>Common decisions</p>
        <h2 id={`${slug}-questions`}>Questions engineers ask</h2>
        <div className={styles.questionGrid}>
          {hook.questions.map((item) => (
            <article className={styles.question} data-tool-question key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.bridgeGrid}>
        <section className={styles.evidence}>
          <p className={styles.eyebrow}>Related build evidence</p>
          <h2>{hook.evidence.title}</h2>
          <p>{hook.evidence.description}</p>
          <Link href={hook.evidence.href}>See the project</Link>
        </section>
        <section className={styles.cta}>
          <p className={styles.eyebrow}>Apply it to real hardware</p>
          <h2>{hook.cta.title}</h2>
          <p>{hook.cta.description}</p>
          <Link href={hook.cta.href}>Discuss the system</Link>
        </section>
      </div>
    </section>
  );
}

export function ToolSearchSchema({ slug }: ToolSearchHookProps) {
  const hook = getToolSearchHook(slug);
  if (!hook) return null;

  const url = absoluteUrl(`/tools/${slug}/`);
  return (
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": `${url}#tool`,
      url,
      name: hook.seoTitle,
      description: hook.metaDescription,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any modern web browser",
      browserRequirements: "JavaScript enabled",
      isAccessibleForFree: true,
      inLanguage: "en",
      dateModified: hook.reviewedOn,
      author: { "@id": personId },
    }} />
  );
}
