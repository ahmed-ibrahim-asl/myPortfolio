# Image Performance, ROV Cover, and Search Visibility Design

## Objective

Improve the portfolio's real loading performance and search visibility without weakening its evidence-first presentation. The work covers the images shipped by the public site, a new Wireless ROV cover aligned with the approved AgriBot art direction, personal-name SEO, engineering-tool SEO, and a focused GPA/CGPA search landing experience for Gradify.

## Current evidence

- `public/` contains 238 raster or vector image assets totaling about 178.6 MB. Several PNG files are 1.5–7.5 MB, and historical cover variants remain alongside current assets.
- The statically exported Next.js site sets `images.unoptimized: true`; many public images are emitted through ordinary `<img>` elements.
- The live site returns 200 for `/robots.txt`, `/sitemap.xml`, the homepage, About, Tools, Gradify, and the Gradify calculator. Canonicals point to `https://eng-asl.com/` routes.
- Search checks for `eng-asl`, `Ahmed Asl`, `Ahmed Ibrahim Asl`, and Gradify do not currently surface the new domain. The domain has only recently moved to its custom HTTPS address, so indexing latency is a factor in addition to on-page signals.
- `/tools/gradify/calculator/` is a working GPA calculator, but its present title, description, introductory copy, and structured data do not give search engines enough page-specific context for GPA and CGPA intent.

## Chosen approach

Use the balanced, comprehensive option:

1. Optimize every image that is actually shipped or referenced by public pages.
2. Remove proven-orphaned historical derivatives from the deployed public asset set instead of spending time optimizing unused files.
3. Preserve irreplaceable original project evidence, but serve an optimized derivative to visitors when an original is too large.
4. Create a new branded ROV cover non-destructively and keep the prototype and SolidWorks images accessible as evidence.
5. Strengthen name, portfolio, engineering-tool, GPA, and CGPA signals with useful visible content and accurate structured data rather than keyword stuffing.

This design does not promise a ranking date or position. Code can make pages indexable and relevant; Search Console submission, crawl timing, competition, and external authority still affect results.

## Image pipeline and budgets

### Inventory

Add a build-time image audit that resolves image references from the portfolio, tools, content, and component sources. It produces a deterministic report with:

- referenced public assets;
- orphaned public image candidates;
- format, dimensions, and byte size;
- oversized referenced assets;
- missing references and missing alt-text contracts where they can be checked statically.

The cleanup allowlist preserves special files whose references are computed dynamically, such as numbered UI galleries and theme pairs.

### Delivery formats

- Photographic and generated raster covers: AVIF first, WebP fallback.
- Small transparent artwork that compresses better as WebP: WebP, with PNG retained only when alpha fidelity or source evidence requires it.
- Existing SVG diagrams and icons remain SVG.
- Original evidence files are retained only when visitors can intentionally open them or when no visually equivalent optimized derivative exists.

Responsive derivatives are generated for the display widths used by the site rather than serving a single oversized source. Shared rendering components emit dimensions, `srcset`, `sizes`, lazy loading below the fold, and eager/high-priority loading only for genuine above-the-fold imagery.

### Performance budgets

- Homepage portrait: at most 100 KB for the largest delivered variant.
- Featured project and tool covers: at most 180 KB for the largest 16:9 delivered variant.
- Gallery/evidence images: at most 300 KB per delivered variant, with the original available through an explicit evidence link only when necessary.
- No new public raster may exceed 500 KB without an explicit allowlist reason.
- Images must declare intrinsic dimensions or an aspect ratio to avoid layout shift.

The build fails on missing referenced assets, new oversized unapproved rasters, or invalid generated derivatives. Compression failures leave the source untouched and report the exact asset instead of silently producing a lower-quality file.

## Wireless ROV cover

Create a new 16:9, text-free, cinematic engineering-product cover using the existing ROV prototype as the subject reference and the AgriBot cover as the style reference.

The approved visual direction is:

- complete ROV visible at a three-quarter angle;
- dark charcoal studio and raised presentation plinth;
- restrained blue engineering grid behind the vehicle;
- warm gold rim light and cool blue fill light;
- realistic metal, enclosure, buoyancy, thruster, antenna, and fastener materials;
- clear safe crop margins for desktop and mobile cards;
- no labels, logos, watermarks, people, extra vehicles, or fictional dashboard UI.

The cover may refine cable management, lighting, and product finish, but must not claim an exact manufacturing configuration or invent performance evidence. It is saved as a new versioned asset, not over the current prototype. The project record uses the new cover and changes its evidence note to state that the cover is an AI-styled visualization based on the prototype. The original prototype and SolidWorks render appear together in the evidence gallery with factual alt text.

The final cover receives AVIF and WebP derivatives within the featured-cover budget. Its visual result is checked at the homepage card crop, project index card crop, and project detail layout.

## Personal-name SEO

The homepage and About page target the identity queries without turning the copy into a list of keywords.

- Homepage metadata leads with `Ahmed Ibrahim Asl` while retaining `Ahmed Asl`, Embedded Systems, IoT, and hardware-prototype intent.
- The first visible identity block includes the full name and exact role: `Embedded Systems & IoT R&D Engineer`.
- About uses `Ahmed Ibrahim Asl` in its H1 and first paragraph, with `Ahmed Asl` as the natural short form.
- Person structured data adds `alternateName` values for `Ahmed Asl` and the verified Arabic name already used by the site.
- ProfilePage structured data repeats the canonical Person entity and current role rather than defining a competing person.
- Social profiles and the canonical About URL remain connected through `sameAs`.

No hidden keyword blocks or duplicate doorway pages are added.

## Tool SEO

Every public tool must expose a unique, stable search contract:

- one canonical URL;
- a specific title and meta description;
- one descriptive H1;
- useful visible introductory copy that states the task, inputs, outputs, and limitations;
- `SoftwareApplication` or `WebApplication` structured data where appropriate;
- breadcrumbs and links to its tool category;
- FAQ data only when the same questions and answers are visible on the page;
- sitemap inclusion and an index/follow robots policy.

The existing search-hook dataset remains the source of truth where it already contains accurate tool-specific content. The implementation adds validation for duplicates, weak generic titles, missing canonical paths, and pages whose schema name does not match their visible H1.

## Gradify GPA and CGPA page

`/tools/gradify/calculator/` remains the canonical calculator URL and becomes the focused search landing page.

### Search intent

Primary intent: free online GPA calculator.

Secondary intent: CGPA calculator, semester GPA calculator, cumulative GPA calculator, target GPA planning, university grading-scale calculator, and Delta University GPA calculation.

### Page structure

1. H1: `Free GPA & CGPA Calculator`.
2. A concise answer paragraph above the interactive calculator explaining that it calculates semester GPA, cumulative GPA, and required future grades.
3. The working university selector and calculator.
4. A visible `How the calculation works` section with the weighted-point formula, definitions, rounding behavior, and repeat/improvement caveat.
5. A short visible FAQ covering GPA versus CGPA, credit-hour weighting, custom grading scales, Delta support, and the need to verify official university rules.
6. Links to the graduation planner and grading guide.

The calculator's existing behavior remains unchanged unless tests reveal a correctness defect.

### Metadata and schema

- Title targets `GPA Calculator & CGPA Calculator | Gradify` with the site brand supplied by the shared metadata system only once.
- Description explains semester GPA, cumulative GPA, target-grade planning, and university scales in approximately 150–160 characters.
- Structured data includes `WebApplication`, `HowTo` only for visible steps, and FAQ entries only for visible answers.
- The parent Gradify page remains a suite overview and does not compete with the calculator page for the same primary query.

## Indexation and Search Console

The implementation verifies:

- HTTPS 200 responses and HTTP-to-HTTPS redirect;
- one self-referencing canonical per indexable route;
- robots allowance;
- sitemap coverage for the homepage, About, tool index, every canonical tool, Gradify, and the Gradify sections;
- no stale `github.io` or `/myPortfolio` canonical or asset URLs;
- rendered JSON-LD in a browser, not only raw-source checks.

After deployment, the required external steps are:

1. submit `https://eng-asl.com/sitemap.xml` in the verified Search Console property;
2. inspect and request indexing for `/`, `/about/`, `/tools/`, `/tools/gradify/`, and `/tools/gradify/calculator/`;
3. monitor Page Indexing and Core Web Vitals rather than repeatedly requesting indexing;
4. keep the previous GitHub Pages domain redirecting to the canonical custom domain.

## Data flow and failure handling

- Portfolio and tool data provide image and SEO records.
- The audit resolves those records into an asset manifest.
- The image generator creates deterministic responsive derivatives without overwriting source evidence.
- Components consume the manifest and emit responsive markup.
- Metadata and schema helpers consume the same page-specific SEO records, preventing title/schema drift.
- Static export produces the final site; post-build verification crawls exported HTML and asset links.

If an asset cannot be decoded, optimized, or matched to a reference, the pipeline reports it and fails before deployment. If metadata or schema validation fails, the affected route and conflicting values are printed. External Search Console or PageSpeed API rate limits do not fail the local build; they are reported as external verification limitations.

## Verification

### Automated

- Unit tests for image-manifest resolution, size budgets, allowlists, missing assets, and derivative selection.
- Metadata and rendered-schema tests for homepage, About, tool index, representative calculators, Gradify, and Gradify Calculator.
- Tests that all canonical tool routes appear in the sitemap exactly once.
- Existing GPA calculation tests remain green.
- Browser checks at mobile and desktop widths for image aspect ratio, no layout shift caused by missing dimensions, calculator-first interaction, visible SEO copy, and no horizontal overflow.
- Full test suite, type check, content validation, and production build.

### Live

- Confirm the new Pages deployment succeeds.
- Confirm HTTP redirects to HTTPS and live canonicals use `eng-asl.com`.
- Confirm the new ROV derivatives return 200 and the prototype/SolidWorks evidence remains reachable.
- Run browser metadata/schema checks against the live homepage and Gradify Calculator.
- Record Lighthouse or PageSpeed measurements when the service is available; API rate limiting is not treated as a product failure.

## Acceptance criteria

- Every publicly referenced image is optimized or explicitly allowlisted with a documented reason.
- No ordinary delivered raster exceeds its performance budget.
- Proven orphaned historical image variants are absent from the deployed public output.
- The ROV has a versioned AgriBot-style cover plus accessible original evidence.
- Homepage and About clearly identify Ahmed Ibrahim Asl / Ahmed Asl and the exact professional role.
- All public tools pass unique metadata, canonical, schema, sitemap, and visible-content validation.
- Gradify Calculator visibly and accurately targets GPA and CGPA intent while retaining its tested calculations.
- The complete test suite and production build pass before deployment.
