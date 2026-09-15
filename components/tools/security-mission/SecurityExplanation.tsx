"use client";

import { useState } from "react";
import { FloatingExplainer } from "../FloatingExplainer";
import type { Position } from "../useDraggable";
import styles from "./SecurityMission.module.css";

export type ExplanationData = {
  what?: string;
  why?: string;
  useWhen?: string;
  avoidWhen?: string;
  tradeoff?: string;
  codeEffect?: string;
};

export function SecurityExplanation({
  title = "Explain this choice",
  explanation,
}: {
  title?: string;
  explanation?: ExplanationData;
}) {
  const [anchor, setAnchor] = useState<Position | null>(null);
  if (!explanation) return null;

  const rows = [
    ["What it is", explanation.what],
    ["Why it matters", explanation.why],
    ["Use it when", explanation.useWhen],
    ["Avoid it when", explanation.avoidWhen],
    ["Trade-off", explanation.tradeoff],
    ["Command effect", explanation.codeEffect],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <div className={styles.explanation}>
      <button
        type="button"
        className={styles.explanationButton}
        aria-haspopup="dialog"
        onClick={(event) =>
          setAnchor({
            x: Math.min(event.clientX + 12, window.innerWidth - 320),
            y: Math.max(event.clientY - 16, 12),
          })
        }
      >
        Explain this choice
      </button>
      {anchor ? (
        <FloatingExplainer title={title} isOpen onClose={() => setAnchor(null)} anchorPosition={anchor}>
          {rows.map(([label, value]) => (
            <p key={label}>
              <strong>{label}:</strong> {value}
            </p>
          ))}
        </FloatingExplainer>
      ) : null}
    </div>
  );
}
