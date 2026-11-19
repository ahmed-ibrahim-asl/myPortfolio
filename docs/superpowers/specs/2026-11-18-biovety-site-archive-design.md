# BioVety and Eurokem Website Archive Design

## Goal

Preserve every live page from the legacy Eurokem Wix website and the current BioVety website as local visual evidence inside the BioVety portfolio case study.

The archive must remain available if either public website changes or becomes unavailable.

## Source pages

### Eurokem

Capture these nine public pages:

1. `https://eurokemsite.wixsite.com/website-1`
2. `https://eurokemsite.wixsite.com/website-1/about-3-1`
3. `https://eurokemsite.wixsite.com/website-1/about-3`
4. `https://eurokemsite.wixsite.com/website-1/cosmetics`
5. `https://eurokemsite.wixsite.com/website-1/cleaner-disinfectan`
6. `https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess`
7. `https://eurokemsite.wixsite.com/website-1/copy-of-feed-addtivess-2`
8. `https://eurokemsite.wixsite.com/website-1/happy`
9. `https://eurokemsite.wixsite.com/website-1/contact`

### BioVety

Capture the three pages published in the official sitemap:

1. `https://biovety.com/`
2. `https://biovety.com/products.html`
3. `https://biovety.com/contact.html`

## Capture method

Use an automated browser at a fixed desktop viewport to load each real page.

For every page:

1. Wait for the initial page load.
2. Scroll through the complete page to trigger lazy images and Wix sections.
3. Capture the complete rendered page.
4. Divide very tall captures into ordered vertical tiles when needed.
5. Generate one compact thumbnail for the archive index.
6. Store every delivered image locally in the repository.

The portfolio must not load images, styles, scripts, or page content from Eurokem, Wix, or BioVety at runtime.

## Image format and storage

Store the archive under:

`public/media/portfolio/showcase/biovety/site-archive/`

Use one directory per website and page. Use descriptive lowercase filenames.

Each page record contains:

- Website name
- Page title
- Original URL
- Local thumbnail path
- Ordered local image tile paths
- Capture date

Use optimized WebP images for delivery. Keep dimensions large enough to preserve the page design and readable text when opened. Split captures when a single image would exceed the repository image budget or become impractical in the browser.

## Portfolio interface

Add a new `Website archive` section below the existing before and after comparison.

The section contains two groups:

1. `Eurokem website archive`
2. `BioVety website archive`

Each group renders a grid of page cards. A card contains the local thumbnail, page title, archive status, and capture date.

Selecting a card opens its local screenshot tiles in order. The viewer must support:

- Previous and next controls
- Close control
- Keyboard navigation
- Escape to close
- Descriptive image alt text
- Visible focus styles

The live website URL may appear as a secondary reference link. It is never required to display the archive.

## Data and components

Create a dedicated archive manifest for the twelve page records.

Keep the archive viewer separate from `BiovetyCaseStudy` so the component has one responsibility and can be tested independently.

Suggested units:

- `data/biovety-site-archive.ts` owns page metadata and local asset paths.
- `components/BiovetySiteArchive.tsx` owns the two archive groups and page selection.
- `components/BiovetySiteArchive.module.css` owns the grid and viewer styles.
- `scripts/capture-biovety-site-archive.mjs` performs repeatable capture and image preparation.

## Responsive behavior

- Three page cards per row on wide screens when space permits.
- Two page cards per row on medium screens.
- One page card per row on narrow screens.
- Screenshot tiles remain within the viewport with no horizontal page overflow.
- Controls meet the existing portfolio touch target and keyboard focus rules.

## Content rules

- Use the real page titles where they can be verified from the loaded document.
- Do not invent missing pages or page names.
- Do not describe the screenshots as a live copy.
- Label them as locally preserved visual captures.
- Avoid em dashes and en dashes in new copy.
- Keep wording factual and concise.

## Verification

- Confirm all twelve source URLs are represented in the manifest.
- Confirm every manifest image exists locally.
- Confirm the rendered archive contains no remote image dependencies.
- Confirm the Eurokem archive remains visible with network access disabled.
- Confirm desktop, tablet, and mobile layouts have no horizontal overflow.
- Confirm keyboard navigation and Escape work in the viewer.
- Confirm the BioVety page still passes its existing case study test.
- Run the focused tests and production build.
- Inspect representative Eurokem and BioVety pages visually before completion.

## Out of scope

- Copying website source code.
- Mirroring forms, checkout, WhatsApp, email, or other live interactions.
- Rehosting the live websites.
- Editing the client websites.
- Publishing private or authenticated pages.
