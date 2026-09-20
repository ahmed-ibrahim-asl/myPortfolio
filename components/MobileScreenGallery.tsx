"use client";

import { useId, useRef, useState } from "react";
import type { MobileScreen } from "@/data/mobile-screens";
import styles from "./MobileScreenGallery.module.css";
import { PublicImage } from "./PublicImage";

function ScreenImage({ screen }: { screen: MobileScreen }) {
  const { crop } = screen;
  return <span className={styles.screen} style={{ aspectRatio: `${crop.width} / ${crop.height}` }}>
    <PublicImage src={screen.src} alt={screen.title} loading="lazy" draggable={false} style={{
      width: `${screen.sourceWidth / crop.width * 100}%`,
      height: `${screen.sourceHeight / crop.height * 100}%`,
      left: `${-crop.x / crop.width * 100}%`,
      top: `${-crop.y / crop.height * 100}%`
    }} />
  </span>;
}

export function MobileScreenGallery({ screens, project }: { screens: MobileScreen[]; project: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<MobileScreen | null>(null);
  const titleId = useId();
  return <>
    <div className={styles.gallery}>
      {screens.map((screen, index) => <figure key={`${screen.src}-${index}`} className={`${styles.container} ${screen.crop.width > screen.crop.height ? styles.landscape : ""}`} data-ui-screen={screen.title}>
        <div className={styles.stage}>
          <span className={styles.stageLabel}>MOBILE APPLICATION</span>
          <button type="button" className={styles.phone} aria-label={`Enlarge ${project}: ${screen.title}`} onClick={() => { setSelected(screen); dialog.current?.showModal(); }}>
            <span className={styles.speaker} aria-hidden="true" />
            <ScreenImage screen={screen} />
            <span className={styles.chin} aria-hidden="true" />
          </button>
          <span className={styles.stageFoot}>ORIGINAL APP INTERFACE</span>
        </div>
        <figcaption className={styles.caption}><span>{project}</span><h4>{screen.title}</h4><small>Tap screen to enlarge <span aria-hidden="true">↗</span></small></figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} className={`${styles.dialog} ${selected && selected.crop.width > selected.crop.height ? styles.wideDialog : ""}`} aria-labelledby={titleId} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
      <header><h3 id={titleId}>{selected?.title}</h3><button type="button" onClick={() => dialog.current?.close()} autoFocus>Close</button></header>
      {selected && <div className={styles.enlarged}><ScreenImage screen={selected} /></div>}
    </dialog>
  </>;
}
