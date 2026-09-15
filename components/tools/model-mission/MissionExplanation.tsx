"use client";

import { useState } from "react";

import { FloatingExplainer } from "../FloatingExplainer";
import type { Position } from "../useDraggable";
import styles from "./ModelMission.module.css";

type MissionExplanationProps = {
  id: string;
  explanation: {
    what: string;
    why: string;
    useWhen: string;
    avoidWhen?: string;
    tradeoff?: string;
    codeEffect: string;
  };
};

export function MissionExplanation({
  id,
  explanation,
}: MissionExplanationProps) {
  const [anchor, setAnchor] = useState<Position | null>(null);

  const rows: [string, string][] = [
    ["What it is", explanation.what],
    ["Why it matters", explanation.why],
    ["Use it when", explanation.useWhen],
    ["Avoid it when", explanation.avoidWhen ?? ""],
    ["Trade-off", explanation.tradeoff ?? ""],
    ["Python effect", explanation.codeEffect],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  return (
    <div className={styles.explanation}>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={(event) =>
          setAnchor({
            x: Math.min(event.clientX + 12, window.innerWidth - 320),
            y: Math.max(event.clientY - 16, 12),
          })
        }
      >
        Learn this choice
      </button>
      {anchor ? (
        <FloatingExplainer
          title="Learn this choice"
          isOpen
          onClose={() => setAnchor(null)}
          anchorPosition={anchor}
        >
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
