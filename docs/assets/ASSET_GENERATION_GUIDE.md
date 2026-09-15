# ASL Asset Generation Guide

This guide explains how to regenerate or add new assets to the portfolio.

## Tool Covers
All tool covers must adhere to the `docs/assets/tool-cover-manifest.json`.
- **Format**: WebP
- **Max File Size**: 300KB
- **Aspect Ratio**: 16:9
- **Style**: Dark mode, technical UI, high contrast, using `#D9A441` (Signal Gold) accents.

### Generation Prompt Template
If you are generating these with AI (Midjourney, DALL-E, etc.):
> "A dark-mode technical user interface for [tool purpose], high contrast, minimalist, monospaced typography, dark blue-grey background, golden accent colors, sharp vector-like lines."

### Image Optimization
Use `squoosh.app` or `ffmpeg` to convert raw PNGs to WebP:
`cwebp -q 80 raw-cover.png -o tool-cover.webp`

## Open Graph Images
OG Images should be exactly `1200x630`. Do not exceed 500KB.
Keep text large and legible. Use the bilingual lockup: "Break the problem down / فكّك المشكلة".
