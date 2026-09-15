import { DiagramFrame } from "./Symbols";
export function LiveWaveDiagram({ cycle, unit, symbol, caption }) {
  if (!Number.isFinite(cycle) || cycle <= 0) return <p className="muted">Enter positive finite values to see the wave.</p>;
  const decade = 10 ** Math.floor(Math.log10(cycle));
  const window = Math.min(Number.MAX_VALUE, Math.max(Number.MIN_VALUE, decade) * 10);
  const cycles = Math.max(1, Math.min(10, window / cycle));
  const span = 280 / cycles;
  const points = Array.from({length:401}, (_,i) => [20+i*0.7,95-32*Math.cos(i/400*cycles*2*Math.PI)].join(",")).join(" ");
  const number = (n) => Number(n.toPrecision(4)).toString();
  return <DiagramFrame viewBox="0 0 320 180" caption={(caption || "") + ". Axis rescales by decade."}>
    <line x1="20" y1="95" x2="300" y2="95" stroke="var(--ink)" opacity="0.35" />
    <polyline points={points} fill="none" stroke="var(--ink)" strokeWidth="2" />
    <line x1="20" y1="48" x2={20+span} y2="48" className="diagram-rms-line" strokeWidth="2" />
    <line x1="20" y1="43" x2="20" y2="64" stroke="var(--ink)" />
    <line x1={20+span} y1="43" x2={20+span} y2="64" stroke="var(--ink)" />
    <text x="160" y="25" textAnchor="middle" className="diagram-label">{symbol} = {number(cycle)} {unit}</text>
    <text x="160" y="159" textAnchor="middle" className="diagram-label">{unit === "s" ? "Time" : "Distance"}: 0 to {number(window)} {unit}</text>
  </DiagramFrame>;
}
