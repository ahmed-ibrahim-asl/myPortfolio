import { DiagramFrame } from "./Symbols";

// A single labeled sine cycle with the peak and RMS levels marked - used wherever a calculator's
// result depends on where a value sits on an AC waveform (RMS conversion, reactance, filters).
export function SineWaveDiagram({ caption, rmsFraction = 1 / Math.SQRT2, peak }) {
  const width = 400;
  const height = 250;
  const midY = height / 2;
  const amplitude = 80;
  const hasPeak = Number.isFinite(peak) && peak >= 0;
  const voltage = (value) => `${Number(value.toPrecision(3))} V`;
  const points = [];
  const steps = 120;
  for (let i = 0; i <= steps; i += 1) {
    const x = 30 + (i / steps) * (width - 60);
    const y = midY - amplitude * Math.sin((i / steps) * Math.PI * 2);
    points.push(`${x},${y.toFixed(1)}`);
  }
  const rmsY = midY - amplitude * rmsFraction;

  return (
    <DiagramFrame viewBox={`0 0 ${width} ${height}`} height={250} caption={caption}>
      <line x1={30} y1={25} x2={30} y2={220} stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
      <line x1={30} y1={midY} x2={370} y2={midY} stroke="var(--ink)" strokeWidth="1" opacity="0.5" />
      <polyline points={points.join(" ")} fill="none" stroke="var(--asl-gold, #e5ac36)" strokeWidth="2.5" />
      <line x1={30} y1={midY - amplitude} x2={370} y2={midY - amplitude} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
      <line x1={30} y1={midY + amplitude} x2={370} y2={midY + amplitude} stroke="var(--ink)" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
      <line x1={30} y1={rmsY} x2={370} y2={rmsY} stroke="var(--asl-signal, #83b8da)" strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={35} y={34} className="diagram-label">
        {hasPeak ? `+Peak: ${voltage(peak)}` : "+Vpeak"}
      </text>
      <text x={370} y={rmsY + 17} textAnchor="end" className="diagram-label">
        {hasPeak ? `RMS: ${voltage(peak * rmsFraction)}` : "RMS = 0.707 Vpeak"}
      </text>
      <text x={35} y={midY - 7} className="diagram-label">0 V</text>
      <text x={370} y={midY - 7} textAnchor="end" className="diagram-label">Time →</text>
      <text x={35} y={230} className="diagram-label">{hasPeak ? `−Peak: −${voltage(peak)}` : "−Vpeak"}</text>
    </DiagramFrame>
  );
}
