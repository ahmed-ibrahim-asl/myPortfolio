# اللوش · Biovety layout

Second independent experiment, based on the first اللوش commit c6ead573.

- Current branch: `codex/lush-biovety-layout`
- New local export: http://localhost:3112/
- Preserved first اللوش: http://localhost:3114/
- Side-by-side comparison: http://localhost:3113/
- Production remains: https://eng-asl.com/

## Run again

Run `npm ci`, `npm run build`, then `node scripts/serve-preview.mjs out 3112`.

The comparison is saved at `D:/work/portflioWebsite/outputs/rankswat-comparison/index.html`. Serve its directory with `node scripts/serve-preview.mjs D:/work/portflioWebsite/outputs/rankswat-comparison 3113`.

The preserved first export is `D:/work/portflioWebsite/outputs/lush-v1-export`; serve that directory on port 3114. The first source remains on `codex/lush-preview`.

All previews bind to 127.0.0.1 and require the local servers to remain running. No public deployment of this experiment is included.

See DESIGN.md for the implemented visual system and docs/reports/2026-10-20-lush-biovety-review.md for verification scope.
