export const publicImageSizes = {
  "tool-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 320px",
  "project-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 33vw",
  "feature": "(max-width: 767px) 100vw, (max-width: 1599px) 70vw, 1280px",
  "gallery-thumb": "(max-width: 639px) 44vw, 240px",
  "article": "(max-width: 767px) 100vw, 820px",
  "portrait": "(max-width: 639px) 180px, 260px",
  "social": "1200px"
} as const;

export type PublicImageSizesPreset = keyof typeof publicImageSizes;
