import type { Project } from "@/types/portfolio";
import { archivePagesFor } from "@/data/biovety-site-archive";
import { PublicImage } from "./PublicImage";
import styles from "./BiovetyCaseStudy.module.css";

export function BiovetyCaseStudy({ project }: { project: Project }) {
  const eurokemHome = archivePagesFor("Eurokem")[0];
  const biovetyHome = archivePagesFor("BioVety")[0];

  return (
    <section
      className={styles.caseStudy}
      data-case-study="biovety"
      aria-labelledby="biovety-case-study-title"
    >
      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Website redesign and migration</p>
          <h2 id="biovety-case-study-title">
            From Eurokem to a clearer BioVety catalogue
          </h2>
        </div>
        <div className={styles.summary}>
          <p>{project.description}</p>
          <p>
            I rebuilt the client&apos;s web presence around the BioVety identity
            and made its veterinary products easier to browse. The new website
            is complete, while the wider transition is still ongoing.
          </p>
          <strong>{project.outcome}</strong>
          <span className={styles.status}>Ongoing migration</span>
        </div>
      </header>

      <div className={styles.comparison}>
        <article className={styles.panel}>
          <div className={styles.realCapture} data-legacy-demo="eurokem">
            <PublicImage
              original
              src={eurokemHome.thumbnail}
              alt="Locally preserved capture of the legacy Eurokem home page"
            />
          </div>
          <p className={styles.panelLabel}>Before · Page 01 of 09</p>
          <h3>Legacy Eurokem on Wix</h3>
          <p>
            The original site spread the company story and products across a
            visually dense Wix experience. This capture is stored locally, so
            the comparison does not depend on Wix staying online.
          </p>
          <a
            href="https://eurokemsite.wixsite.com/website-1"
            target="_blank"
            rel="noreferrer"
          >
            Open the original Wix site if available
          </a>
        </article>

        <article className={styles.panel}>
          <div className={styles.realCapture}>
            <PublicImage
              original
              src={biovetyHome.thumbnail}
              alt="Locally preserved capture of the current BioVety home page"
            />
          </div>
          <p className={styles.panelLabel}>After · Page 01 of 03</p>
          <h3>Current BioVety website</h3>
          <p>
            The finished site gives the company, catalogue, and contact paths
            a clearer hierarchy with a focused three-page structure.
          </p>
          <a href="https://biovety.com/" target="_blank" rel="noreferrer">
            Open the current BioVety website
          </a>
        </article>
      </div>

      <section
        className={styles.operations}
        aria-labelledby="biovety-operations-title"
      >
        <div>
          <p className={styles.eyebrow}>Beyond the redesign</p>
          <h3 id="biovety-operations-title">
            The work also covered the move behind the website
          </h3>
        </div>
        <ol>
          <li>Restructured the company presentation and product catalogue.</li>
          <li>
            Reviewed provider options and recommended Hostinger for cost and
            feature value.
          </li>
          <li>
            Moved the Eurokem domain and business email to Hostinger.
          </li>
          <li>
            Implemented the BioVety domain and hosting on GoDaddy because that
            was the client&apos;s chosen provider.
          </li>
        </ol>
      </section>
    </section>
  );
}
