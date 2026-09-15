import { DiagramFrame } from "./Symbols";

// A square with its side and area labeled - area in, side length out (or the reverse).
export function SquareAreaDiagram({ area, side, caption }) {
  const size = Number.isFinite(side) ? 110 * (2 / Math.PI) * Math.atan(Math.log1p(Math.abs(side))) : 0;
  const x = 130 - size / 2;
  const y = 120 - size;

  return (
    <DiagramFrame viewBox="0 0 260 185" height={185} caption={`${caption}. Compressed illustrative scale.`}>
      <rect x={x} y={y} width={size} height={size} fill="none" stroke="var(--ink)" strokeWidth="2" />
      <line x1={x} y1={y + size + 10} x2={x + size} y2={y + size + 10} stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3" />
      <text x={x + size / 2} y={y + size + 24} textAnchor="middle" className="diagram-label">
        side = {side}
      </text>
      <text x={130} y={174} textAnchor="middle" className="diagram-label-bold">
        area = {area}
      </text>
    </DiagramFrame>
  );
}
