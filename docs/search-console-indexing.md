# Search Console handoff

After publishing the verified export:

1. Submit `https://eng-asl.com/sitemap.xml` in the eng-asl.com property.
2. Inspect the homepage, `/about/`, `/tools/`, `/tools/gradify/`, and `/tools/gradify/calculator/`.
3. Run the live URL test, confirm the selected canonical is on eng-asl.com, and request indexing for these pages.
4. Check Page indexing for blocked, duplicate, or crawled-but-not-indexed URLs.
5. Track queries Ahmed Ibrahim Asl, Ahmed Asl, eng-asl, GPA calculator, and CGPA calculator in Performance.

Metadata and structured data make page identity clearer; they do not guarantee indexing or rankings. Search Console actions have not been performed by this implementation.

## Images

Run `npm run prepare:images` after adding imagery. Root-relative raster paths in source are discovered automatically. Add dynamically constructed paths to `data/public-image-sources.json`. `npm run check:images` verifies missing sources and encoded size budgets.

The pipeline preserves original images and produces responsive AVIF/WebP alternatives. Orphan candidates are only reported, never automatically deleted: source photographs and external direct links may still depend on them.
