import { DiagramFrame } from "./Symbols";

// A simple isometric cube with its edge and volume labeled.
export function CubeVolumeDiagram({ volume, edge, caption }) {
  const size = Number.isFinite(edge) ? 95 * (2 / Math.PI) * Math.atan(Math.log1p(Math.abs(edge))) : 0;
  const skew = size * 0.4;
  const x = 110 - (size + skew) / 2;
  const y = 120 - size - skew;

  const front = `M ${x} ${y + skew} L ${x + size} ${y + skew} L ${x + size} ${y + skew + size} L ${x} ${y + skew + size} Z`;
  const top = `M ${x} ${y + skew} L ${x + skew} ${y} L ${x + size + skew} ${y} L ${x + size} ${y + skew} Z`;
  const side = `M ${x + size} ${y + skew} L ${x + size + skew} ${y} L ${x + size + skew} ${y + size} L ${x + size} ${y + skew + size} Z`;

  return (
    <DiagramFrame viewBox="0 0 220 185" height={185} caption={volume < 0 ? "Cube shows magnitude, not negative physical volume. Compressed illustrative scale." : `${caption}. Compressed illustrative scale.`}>
      <path d={top} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d={side} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d={front} fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <text x={110} y={145} textAnchor="middle" className="diagram-label">
        edge = {edge}
      </text>
      <text x={110} y={170} textAnchor="middle" className="diagram-label-bold">
        {volume < 0 ? "|volume|" : "volume"} = {Math.abs(volume)}
      </text>
    </DiagramFrame>
  );
}
