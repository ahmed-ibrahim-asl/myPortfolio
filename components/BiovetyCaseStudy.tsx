import styles from "./BiovetyCaseStudy.module.css";

export function BiovetyCaseStudy() {
  return (
    <section
      className={styles.caseStudy}
      data-case-study="biovety"
      aria-labelledby="biovety-case-study-title"
    >
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Website redesign and migration</p>
        <h2 id="biovety-case-study-title">
          From the Eurokem site to a clearer BioVety catalogue
        </h2>
        <p>
          I rebuilt the client&apos;s web presence around the BioVety identity and
          made its veterinary products easier to browse. The new website is
          complete, while the wider move away from Eurokem is still ongoing.
        </p>
        <span className={styles.status}>Ongoing migration</span>
      </header>

      <div className={styles.comparison}>
        <article className={styles.panel}>
          <div
            className={styles.legacyDemo}
            data-legacy-demo="eurokem"
            aria-label="Local visual demo of the legacy Eurokem Wix website"
          >
            <div className={styles.browserBar} aria-hidden="true">
              <span className={styles.browserDots}>● ● ●</span>
              <span>eurokemsite.wixsite.com</span>
            </div>
            <div className={styles.legacyNav} aria-hidden="true">
              <strong>EUROKEM</strong>
              <span>HOME &nbsp; ABOUT &nbsp; PRODUCTS &nbsp; CONTACT</span>
            </div>
            <div className={styles.legacyHero} aria-hidden="true">
              <small>EXPERIENCE CHANGE WITH US</small>
              <strong>DISCOVER OUR EXPERTISE</strong>
              <span>Veterinary solutions and company information</span>
            </div>
            <div className={styles.legacyCards} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
          <p className={styles.panelLabel}>Before</p>
          <h3>Eurokem on Wix</h3>
          <p>
            This small local reconstruction preserves the recognizable legacy
            direction without relying on the Wix page staying online.
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
          <div
            className={styles.currentDemo}
            aria-label="Local visual demo of the current BioVety website"
          >
            <div className={styles.browserBar} aria-hidden="true">
              <span className={styles.browserDots}>● ● ●</span>
              <span>biovety.com</span>
            </div>
            <div className={styles.currentNav} aria-hidden="true">
              <strong>BIOVETY</strong>
              <span>ABOUT &nbsp; PRODUCTS &nbsp; PARTNERS &nbsp; CONTACT</span>
            </div>
            <div className={styles.currentHero} aria-hidden="true">
              <small>VETERINARY HEALTH</small>
              <strong>Products made easier to explore</strong>
              <span>Clear categories, company details, and contact paths</span>
            </div>
            <div className={styles.productRail} aria-hidden="true">
              <span>Products</span>
              <span>Partners</span>
              <span>Contact</span>
            </div>
          </div>
          <p className={styles.panelLabel}>After</p>
          <h3>BioVety International</h3>
          <p>
            The finished site gives the company, catalogue, partners, and
            contact paths a clearer structure.
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
        <p className={styles.eyebrow}>Beyond the redesign</p>
        <h3 id="biovety-operations-title">
          The work also covered the move behind the website
        </h3>
        <ul>
          <li>Restructured the company presentation and product catalogue.</li>
          <li>
            Reviewed provider options and recommended Hostinger for cost and
            feature value.
          </li>
          <li>
            Implemented the BioVety domain and hosting on GoDaddy because that
            was the client&apos;s chosen provider.
          </li>
          <li>
            Set up the domain and business email arrangement required for the
            new identity.
          </li>
        </ul>
      </section>
    </section>
  );
}
