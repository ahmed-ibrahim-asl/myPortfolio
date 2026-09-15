import styles from "./preview.module.css";

export const metadata = { title: "Mobile UI container preview", robots: { index: false, follow: false } };

export default function MobileUiPreview() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const screen = `${basePath}/media/portfolio/showcase/smart-mosque/ui-1.webp`;
  return <main className={styles.preview}>
    <header className={styles.intro}>
      <span className={styles.eyebrow}>ASL / INTERFACE STUDY</span>
      <h1>Smart Mosque</h1>
      <p>One screen. In context.</p>
    </header>
    <figure className={styles.container}>
      <div className={styles.stage}>
        <span className={styles.stageLabel}>MOBILE APPLICATION</span>
        <a className={styles.phone} href={screen} target="_blank" rel="noreferrer" aria-label="Open the original Smart Mosque home screen at full size">
          <span className={styles.speaker} aria-hidden="true" />
          <img src={screen} width={720} height={1600} alt="Smart Mosque Arabic home screen showing prayer times, mosque occupancy, and devotional sections" />
          <span className={styles.chin} aria-hidden="true" />
        </a>
        <span className={styles.stageFoot}>ORIGINAL APP INTERFACE</span>
      </div>
      <figcaption className={styles.caption}>
        <div><span className={styles.eyebrow}>SMART MOSQUE MODEL</span><h2>Home & daily overview</h2><p>Prayer times, mosque occupancy, and daily adhkar in one Arabic interface.</p></div>
        <a href={screen} target="_blank" rel="noreferrer">View full screen <span aria-hidden="true">↗</span></a>
      </figcaption>
    </figure>
  </main>;
}
