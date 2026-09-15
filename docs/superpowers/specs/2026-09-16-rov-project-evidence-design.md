# ROV Project Evidence Design

## Goal

Present the Wireless ROV Control System with authentic project evidence and connect it to Ahmed Ibrahim Asl's related Q1 publication, while removing an inaccurate original-photo claim from AgriBot.

## Wireless ROV presentation

- Use the supplied real ROV prototype photograph as the project cover and primary visual.
- Store the supplied SolidWorks render as a secondary engineering image.
- Label the expandable secondary image section **View SolidWorks mechanical design** so it is not mistaken for another prototype photograph.
- Add a project link titled **Read the related Q1 Scientific Reports paper** pointing to `https://www.nature.com/articles/s41598-025-23281-8`.
- Keep the project description focused on the ESP32 and NRF24L01+ bidirectional control system. Describe the paper as related research rather than claiming that every subsystem in the paper is represented by this portfolio entry.
- Use accurate, descriptive alternative text for both images.

## AgriBot correction

- Remove the gallery entry currently described as an original AgriBot hardware photograph.
- Remove the note that claims original build photographs appear below.
- Preserve the project cover, award link, and mobile interface gallery.

## Reusable UI change

Add an optional `galleryLabel` field to `Project`. The work entry uses it when present and otherwise retains the existing `View original project images (N)` label. This keeps existing projects unchanged while allowing the ROV SolidWorks image to be labeled truthfully.

## Verification

- A focused data/UI contract test must fail before implementation and pass afterward.
- The supplied images must be converted to optimized WebP assets and remain visually faithful to the originals.
- The full test suite and production build must pass.
- The ROV and AgriBot project pages must be checked in a local browser at desktop and mobile widths.
