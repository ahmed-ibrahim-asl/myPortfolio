---
name: "اللوش / Ahmed Ibrahim Asl"
description: "An independent engineering portfolio experiment built around original hardware evidence."
colors:
  primary: "#1748e8"
  primary-deep: "#1039b8"
  paper: "#eef1f5"
  ink: "#17202e"
  muted: "#526070"
  line: "#c7cfd9"
  window: "#e0e5eb"
  tool-surface: "#153dbb"
  dark-paper: "#101c30"
  dark-ink: "#edf2fc"
  dark-muted: "#b2bfd4"
  dark-accent: "#a9c5ff"
typography:
  display:
    fontFamily: "Archivo, IBM Plex Sans Arabic, sans-serif"
    fontSize: "clamp(2.8rem, 5.1vw, 5.4rem)"
    fontWeight: 800
    lineHeight: 1.03
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Archivo, IBM Plex Sans Arabic, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  control: "4px"
  image-label: "3px"
spacing:
  compact: "14px"
  normal: "24px"
  section: "70px"
components:
  primary-action:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "17px 22px"
---

## Overview
This system belongs to the independent `codex/lush-preview` experiment. The production audit release remains separate. The homepage uses a service-manual foldout: original hardware photography, attached technical captions, a clear action and restrained maker attribution. Engineering tools retain their working interfaces.

## Colors
Cool paper supports daytime inspection; navy supports the existing dark theme. Cobalt owns the ROV caption, primary actions and tools section. Text on cobalt is white. The caption's hardware terms must not inherit the site's ordinary paragraph color.

## Typography
Use the existing self-hosted Archivo for Latin display and body. Arabic uses the existing Plex Arabic stack; the brand retains its Aref Ruqaa signature. The experiment adds no font download. Headings use weight and scale rather than labels above them. Utility metadata uses small sans text; mono is reserved for actual code and data in existing tools.

## Layout
The opening splits approximately 40/60, with introduction and action on the left and real ROV image on the right. Arabic reverses reading direction. Below 760px these regions stack in reading order. The project gallery uses two unequal columns; the tools surface pairs an introduction with open rows. Notes use dated rows; the actual working method uses an ordered sequence. Content width caps at 1420px with responsive gutters. At 430px the method becomes one column. Text can wrap at 200% scale.

## Elevation & Depth
Photography supplies depth. Interface surfaces are flat, separated by space and occasional light rules; no simulated texture, glass or decorative glow. Existing tool visualizations remain unchanged.

## Shapes
The image and its caption form a single rectangular region. Primary controls have 4px corners. Do not turn every section into cards or add decorative section numbers.

## Components
`LushHomePageView` owns the homepage and its bilingual copy. `lush.css` scopes this surface and the aligned shared header/footer with `.lush-version`. Existing SiteHeader behavior controls theme, language, menus and search. The maker attribution links to About. Project images and names link to real project details; tools use their actual catalog URLs.

Primary actions have an explicit hover color and visible keyboard focus. Reduced-motion removes transitions. The skip link stays hidden until focused. Images use PublicImage responsive sources where available and eager loading only in the opening.

## Do's and Don'ts
Use original project gallery photos as evidence. Label diagrams as architecture. Preserve facts, functional routes and bilingual access. Do not use generated covers as original photographs, invent outcomes, or publish this branch over the stable site without a new user decision.
