# Mobile UI sample

Goal: show one ASL-styled mobile UI container for user review, without changing existing galleries.

Approved scope: a single working visual sample. Use the Smart Mosque home screenshot unchanged. Reuse ASL color and typography variables, a restrained gold-edged phone frame, navy grid presentation surface, and a screen caption. Full-size image opens on click. Keep narrow viewports free of overflow.

Implementation: create app/work/ui-preview/page.tsx and its scoped CSS module. Use the existing layout and base-path-aware asset URL. No generated image, cropping, gallery rollout, deployment, or commit.

Verification: request the preview URL, run TypeScript, inspect the sample in the browser, then present its local URL to the user.
