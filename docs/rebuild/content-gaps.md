# Content Gaps

Items that appear in the site but have no verified source, or items the spec requires that have no content yet.
These must NOT be invented. Each gap is a question for the owner.

---

## 1. YouTube Channel URL

- Current in `data/portfolio.ts`: `https://www.youtube.com/@ahmedassal8710`
- Spec requires: `https://www.youtube.com/@ahmed-ibrahim-asl`
- Question: Which URL is canonical? Is `@ahmed-ibrahim-asl` a different channel or an alias for `@ahmedassal8710`?
- Blocked: Phase 9 YouTube metrics pipeline, footer link

## 2. GitHub Pages Repo Name Typo

- Base path is `/myPortflio` (missing one "i" - "Portfolio" misspelled)
- This matches the actual deployed repo slug so it works, but is worth noting
- Action: Confirm with owner whether to fix the typo in the repo name (requires updating base path) or leave it

## 3. Project Case Study Content

These 4 featured projects have real cover images but no case-study detail page content:
- AgriBot Architecture - outcome described as "Agriculture workflow integration" - needs specifics
- Wireless ROV Control System - outcome "Bidirectional telemetry and control" - needs specifics
- Multi-MCU Security Lock - outcome "Separated control and interface logic" - needs specifics
- MegaSumo Autonomous Robot - outcome "2nd place nationwide" - which competition, which year, how many competitors?

## 4. AgriBot System Architecture

- Referenced as graduation project
- "Firewire OTA" is mentioned - is this a real product, an internal tool, or a project name?
- "Firewire Enterprise OTA" is a separate project with no image - is it the same system or related?

## 5. Publication Details

- Publications pulled from Google Scholar via `sync:scholar` script
- Citation counts are live data - confirm they display the last-synced value with a date stamp

## 6. Phone and WhatsApp Number

- `profile.phone = "+20 106 816 3322"` is in the data file and may appear publicly
- Confirm: should phone number appear on the public contact page?

## 7. Prompts Content

- No `content/prompts/` directory exists
- The spec requires: `/blueprint`, `/handwritten`, `/debug`, `/research`, `/build` prompt entries
- Each entry needs purpose, required input, variables, expected output, limitations, tested example
- These must be written by the owner in their own voice

## 8. Notes / Topic Content

- Current writing: 3 articles (OTW bandit walkthrough, sensor-to-Flutter pipeline, welcome)
- Spec lists 12 note topics: C, C++, Python, Bash, Dart, Flutter, Linux, Computer Networks, Security/CTF, Embedded Systems, Electronics, Robotics
- No notes exist for these topics yet
- Question: Which topics should launch with the site? Which can be "coming soon" stubs?

## 9. Library / PDF Content

- `portfolio_codebase.pdf` is in the repo root (82 KB) - this is a code export, not a library document
- The spec mentions a "234-page C programming, Data Structures, and Algorithms PDF"
- No PDF exists in `public/` for the library feature
- Do NOT publish any PDF without confirmed publication rights
- Question: Which documents does Ahmed want to publish? What are the rights status for each?

## 10. Contact Form Target

- Current contact page not reviewed yet
- What email or service should contact form submissions go to?
- Static sites cannot process forms server-side - needs a service (Formspree, etc.) or mailto: link
- Question: What contact mechanism is currently implemented?

## 11. Availability Status

- `profile.availability = "Open to selected embedded systems, IoT, and robotics collaborations"`
- Question: Is this accurate as of the publish date? Should it update automatically?

## 12. Evidence Register Numbers

- The home page has an evidence section with Teaching, Research, Competition, Study entries
- No quantified metrics are claimed (good) but MegaSumo "2nd place nationwide" needs the competition name
- Question: What competition was the MegaSumo entry for?

## 13. Portrait Image Usage

- 3 portrait images exist: profile1.jpg, profile2.jpg, profile3.png
- The spec calls for a "mounted 4:5 plate with crop marks" as the Agent 101 portrait
- Question: Which portrait should be used as the primary editorial portrait?
- The optimized version (`/media/optimized/profile-ahmed.webp`) - is this a new optimized version of one of the three?
