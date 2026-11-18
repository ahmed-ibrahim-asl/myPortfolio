"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PublicImage } from "./PublicImage";
import {
  archivePagesFor,
  type ArchiveSite,
  type BiovetyArchivePage
} from "@/data/biovety-site-archive";
import styles from "./BiovetySiteArchive.module.css";

const groups: Array<{ site: ArchiveSite; heading: string; note: string }> = [
  {
    site: "Eurokem",
    heading: "Eurokem website archive",
    note: "The complete legacy Wix site, preserved as nine local visual captures."
  },
  {
    site: "BioVety",
    heading: "BioVety website archive",
    note: "The three pages published by the current BioVety website."
  }
];

function number(value: number) {
  return String(value).padStart(2, "0");
}

function captureDate(value: string) {
  const [year, month, day] = value.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day} ${months[Number(month) - 1]} ${year}`;
}

export function BiovetySiteArchive() {
  const [activePage, setActivePage] = useState<BiovetyArchivePage | null>(null);
  const [tileIndex, setTileIndex] = useState(0);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewer = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const pageButtons = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeGroupPages = useMemo(
    () => activePage ? archivePagesFor(activePage.site) : [],
    [activePage]
  );
  const activePageIndex = activePage
    ? activeGroupPages.findIndex((page) => page.id === activePage.id)
    : -1;

  function open(page: BiovetyArchivePage) {
    setActivePage(page);
    setTileIndex(0);
  }

  function close() {
    const activeId = activePage?.id;
    setActivePage(null);
    setTileIndex(0);
    if (activeId) requestAnimationFrame(() => pageButtons.current[activeId]?.focus());
  }

  function moveTile(direction: -1 | 1) {
    if (!activePage) return;
    setTileIndex((current) => (
      current + direction + activePage.tiles.length
    ) % activePage.tiles.length);
  }

  useEffect(() => {
    if (!activePage) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") moveTile(-1);
      if (event.key === "ArrowRight") moveTile(1);
      if (event.key === "Tab") {
        const focusable = [...(viewer.current?.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])") ?? [])]
          .filter((element) => !element.hasAttribute("disabled"));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activePage]);

  useEffect(() => {
    if (canvas.current) canvas.current.scrollTop = 0;
  }, [tileIndex]);

  return (
    <section className={styles.archive} aria-labelledby="website-archive-title">
      <header className={styles.archiveIntro}>
        <p className={styles.eyebrow}>Website archive</p>
        <h2 id="website-archive-title">Every public page, preserved locally</h2>
        <p>
          These are documentary captures of the real websites, not a live copy.
          Every image is stored with this portfolio and remains available if a
          public page changes or goes offline.
        </p>
      </header>

      {groups.map((group) => {
        const pages = archivePagesFor(group.site);
        return (
          <section className={styles.group} key={group.site} aria-labelledby={`${group.site.toLowerCase()}-archive-title`}>
            <header className={styles.groupHeading}>
              <div>
                <p className={styles.groupCount}>{number(pages.length)} preserved pages</p>
                <h3 id={`${group.site.toLowerCase()}-archive-title`}>{group.heading}</h3>
              </div>
              <p>{group.note}</p>
            </header>

            <div className={styles.grid} data-archive-grid>
              {pages.map((page, index) => (
                <button
                  className={styles.card}
                  data-archive-page-card
                  key={page.id}
                  onClick={() => open(page)}
                  ref={(node) => { pageButtons.current[page.id] = node; }}
                  type="button"
                >
                  <span className={styles.thumbnail}>
                    <PublicImage
                      original
                      src={page.thumbnail}
                      alt={`Locally preserved capture of ${page.title}`}
                    />
                  </span>
                  <span className={styles.cardBody}>
                    <span className={styles.pageNumber}>Page {number(index + 1)} of {number(pages.length)}</span>
                    <strong>{page.title}</strong>
                    <span className={styles.cardMeta}>
                      <span>Local capture</span>
                      <span>{page.tiles.length} {page.tiles.length === 1 ? "part" : "parts"}</span>
                    </span>
                    <span className={styles.captureDate}>Captured {captureDate(page.capturedAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {activePage ? (
        <div
          className={styles.overlay}
          onMouseDown={(event) => { if (event.currentTarget === event.target) close(); }}
          role="presentation"
        >
          <section
            className={styles.viewer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="archive-viewer-title"
            ref={viewer}
          >
            <header className={styles.viewerHeader}>
              <div>
                <p className={styles.pageNumber}>
                  {activePage.site} · Page {number(activePageIndex + 1)} of {number(activeGroupPages.length)}
                </p>
                <h3 id="archive-viewer-title">{activePage.title}</h3>
                <p data-tile-position>Part {tileIndex + 1} of {activePage.tiles.length}</p>
              </div>
              <button ref={closeButton} type="button" onClick={close} aria-label="Close website archive viewer">
                Close
              </button>
            </header>

            <div className={styles.canvas} ref={canvas}>
              <PublicImage
                original
                src={activePage.tiles[tileIndex]}
                alt={`${activePage.title}, locally preserved capture, part ${tileIndex + 1} of ${activePage.tiles.length}`}
              />
            </div>

            <footer className={styles.viewerControls}>
              {activePage.tiles.length > 1 ? <>
                <button type="button" onClick={() => moveTile(-1)} aria-label="Show previous capture part">
                  Previous part
                </button>
                <span>Part {tileIndex + 1} of {activePage.tiles.length}</span>
                <button type="button" onClick={() => moveTile(1)} aria-label="Show next capture part">
                  Next part
                </button>
              </> : <span>Complete page capture</span>}
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}
