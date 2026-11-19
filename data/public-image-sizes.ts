export const publicImageSizes = {
  "tool-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 320px",
  "project-card": "(max-width: 639px) 100vw, (max-width: 1199px) 50vw, 33vw",
  "feature": "(max-width: 767px) 100vw, (max-width: 1599px) 70vw, 1280px",
  "gallery-thumb": "(max-width: 639px) 44vw, 240px",
  "article": "(max-width: 767px) 100vw, 820px",
  "portrait": "(max-width: 639px) 180px, 260px",
  "social": "1200px",
  // Layout-based presets: each matches where the image is actually shown, so the browser
  // downloads a file at least as wide as the box it fills.
  "work-card": "(max-width: 760px) 100vw, 50vw",
  "project-detail": "(max-width: 1180px) 100vw, 1100px",
  "project-gallery": "(max-width: 1180px) 50vw, 550px",
  "home-project": "(max-width: 860px) 100vw, 60vw",
  "testimonial-proof": "(max-width: 480px) 100vw, 420px"
} as const;

export type PublicImageSizesPreset = keyof typeof publicImageSizes;
