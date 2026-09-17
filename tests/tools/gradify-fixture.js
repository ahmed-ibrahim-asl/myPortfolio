import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const fixturePath = path.resolve("test-results/gradify/synthetic-transcript.pdf");

export function ensureGradifyTranscript() {
  if (!existsSync(fixturePath)) {
    execFileSync(process.execPath, ["scripts/gradify-test-transcript.mjs"], { stdio: "ignore" });
  }
  return fixturePath;
}
