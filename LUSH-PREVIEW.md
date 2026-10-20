# اللوش

Independent preview based on stable audit source commit `2c8c50ff`.

- Published stable site: https://eng-asl.com/
- Local experimental export: http://localhost:3112/
- Side-by-side comparison: http://localhost:3113/
- Branch: `codex/lush-preview`

The source and static deployment of the stable site remain on their own branches. This experiment is not deployed to the public domain.

## Run again

From this folder, run `npm ci`, `npm run build`, then:

```powershell
node scripts/serve-preview.mjs out 3112
```

The current comparison page is saved at `D:/work/portflioWebsite/outputs/rankswat-comparison/index.html`. Serve it in a second terminal:

```powershell
node scripts/serve-preview.mjs D:/work/portflioWebsite/outputs/rankswat-comparison 3113
```

Both servers bind only to 127.0.0.1. Preview links work while the local servers are running.

## Validation

Production build and TypeScript passed; static export prepared 161 segment aliases. English/Arabic, light/dark, 320/390/768/1366 widths passed the recorded homepage geometry audit. 200% text, menu Escape, browser runtime checks and all checked homepage destinations passed. Final screenshots and JSON are under `D:/work/portflioWebsite/outputs/rankswat-evidence/lush-final`.

The independent final reviewer could not run because of its usage limit. The fallback review and its scope are recorded in `docs/reports/2026-10-20-lush-review.md`.
