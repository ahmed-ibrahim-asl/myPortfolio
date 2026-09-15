import type { ReactNode } from "react";
export const signalColor = (on: boolean) => (on ? "var(--text-accent)" : "var(--text-secondary)");
export function Wire({ d, on = false }: { d: string; on?: boolean }) {
  return <path d={d} stroke={signalColor(on)} strokeWidth={on ? 3 : 2} fill="none" />;
}
export function Gate({
  type,
  x,
  y,
  on = false,
  label,
  onSelect
}: {
  type: string;
  x: number;
  y: number;
  on?: boolean;
  label?: string;
  onSelect?: () => void;
}) {
  const invert = ["NOT", "NOR", "NAND", "XNOR"].includes(type),
    or = ["OR", "NOR", "XOR", "XNOR"].includes(type);
  return (
    <g
      transform={`translate(${x} ${y})`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? `Inspect ${type} gate` : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{ color: signalColor(on), cursor: onSelect ? "pointer" : undefined }}
    >
      <rect x="-10" y="-38" width="96" height="80" fill="transparent" />
      <path
        d={
          type === "NOT"
            ? "M0 -23L52 0L0 23Z"
            : or
              ? "M0 -30 Q25 0 0 30 Q48 30 64 0 Q48 -30 0 -30Z"
              : "M0 -30H30A30 30 0 0 1 30 30H0Z"
        }
        stroke="currentColor"
        strokeWidth="2.5"
        fill="var(--bg-surface)"
      />
      {["XOR", "XNOR"].includes(type) && (
        <path d="M-7 -30Q18 0 -7 30" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
      {invert && (
        <circle
          cx={type === "NOT" ? 58 : 70}
          cy="0"
          r="6"
          stroke="currentColor"
          strokeWidth="2"
          fill="var(--bg-surface)"
        />
      )}
      {type !== "NOT" && (
        <text x="27" y="5" textAnchor="middle" fontSize="11" fill="currentColor">
          {type}
        </text>
      )}
      {label && (
        <text x="30" y="53" textAnchor="middle" fontSize="12" fill="var(--text-secondary)">
          {label}
        </text>
      )}
    </g>
  );
}
export function LogicCanvas({
  children,
  height = 340,
  label
}: {
  children: ReactNode;
  height?: number;
  label: string;
}) {
  return (
    <svg
      viewBox={`0 0 680 ${height}`}
      role="img"
      aria-label={label}
      style={{
        display: "block",
        width: "100%",
        minWidth: 570,
        color: "var(--text-primary)",
        fontFamily: "Arial,sans-serif"
      }}
    >
      {children}
    </svg>
  );
}
