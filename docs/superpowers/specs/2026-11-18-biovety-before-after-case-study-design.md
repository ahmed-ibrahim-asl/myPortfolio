# BioVety Before and After Case Study

## Goal

Turn the existing BioVety portfolio entry into a clear client case study that proves the work completed and explains the business value behind the redesign, domain setup, hosting guidance, and company email migration.

## Current situation

- Eurokem is the client’s legacy identity and website.
- The legacy Eurokem website is published on Wix.
- The Eurokem domain and company email are managed through Hostinger.
- BioVety is the new identity and website built for the same client.
- The BioVety domain and hosting are managed through GoDaddy because the client selected that provider.
- Ahmed recommended Hostinger as the stronger value option, then implemented the client’s final provider choice.
- The BioVety website build is complete.
- The wider rebrand remains ongoing because the client has not finished moving operations away from Eurokem.

## Page structure

### 1. Project introduction

Replace the short generic description with a direct summary of the client’s starting point, the new BioVety website, and the ongoing migration status.

The introduction must state that this was more than a visual redesign. It included provider guidance, domain work, hosting setup, and business email setup.

### 2. Before and after comparison

Add a two-panel comparison inside the BioVety project detail page.

The Before panel represents the legacy Eurokem Wix website. It uses a curated visual placed inside the portfolio’s browser-frame treatment. It includes a link to the public legacy website as evidence.

The After panel represents the completed BioVety website. It uses the same browser-frame treatment and links to the live BioVety website.

The layout is side by side on wide screens and stacked on mobile. Both panels must remain readable in light and dark themes.

Do not embed the legacy website in an iframe. The page must not depend on Wix allowing third-party embedding, and it must not copy the entire legacy site into the portfolio.

### 3. Beyond the redesign

Add a compact section explaining the operational work:

- Restructured the company presentation and product catalogue.
- Built a clearer route from company information to products and contact details.
- Reviewed hosting and provider options with the client.
- Recommended Hostinger for cost and feature value.
- Implemented the BioVety domain and hosting on GoDaddy because that was the client’s chosen provider.
- Set up the company email under the selected domain and provider arrangement.

The copy must present this as professional client service. It must not attack Wix or GoDaddy.

### 4. Cost comparison

Reserve a small comparison block for verified annual costs. Do not publish estimated or remembered prices.

Until the exact Wix and replacement costs are confirmed, show no price numbers and make no savings claim. The code should make it easy to add the verified numbers later.

### 5. Project status

Show the status as `Ongoing migration`.

Explain that the BioVety website is complete while the client’s wider transition from Eurokem is still pending.

## Content rules

- Use natural first-person project language.
- Avoid em dashes.
- Avoid slogans, inflated claims, and generic AI-style wording.
- Do not claim the client chose Hostinger for BioVety.
- Do not claim the Eurokem and BioVety migrations are fully complete.
- Do not publish unverified cost figures.
- Keep provider recommendations factual and respectful.

## Components

### BioVety case study component

Create a dedicated component that renders only for the `biovety-website` project. This keeps project-specific content out of the generic work-card logic.

The component owns:

- Before and after panels
- Legacy and live-site links
- Operational scope list
- Provider decision note
- Ongoing status note

### Portfolio data

Update the BioVety project record with the stronger description, outcome, tags, legacy website link, and current status text.

### Visual assets

Create curated visual assets from the available public websites or existing project materials. The assets must be stored locally, optimized for the portfolio, and given accurate alt text.

## Responsive and accessibility requirements

- Side-by-side comparison at desktop widths.
- Stacked comparison on narrow screens.
- Visible keyboard focus for both website links.
- Accurate headings and link labels.
- Descriptive alt text that distinguishes legacy Eurokem from current BioVety.
- Respect reduced-motion preferences.
- No autoplaying media.

## Verification

- Confirm the BioVety project page renders the dedicated case study.
- Confirm other project pages remain unchanged.
- Confirm the legacy and current links open the intended websites.
- Check desktop and mobile layouts.
- Check light and dark themes.
- Run the project’s lint, type, and build checks available in the repository.
- Inspect the final page in a browser before completion.

## Out of scope

- Mirroring the full Wix website.
- Changing the client’s live hosting or DNS.
- Publishing unverified prices.
- Rebuilding unrelated portfolio project pages.
