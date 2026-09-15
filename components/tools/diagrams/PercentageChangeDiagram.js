import { DiagramFrame } from "./Symbols";
export function PercentageChangeDiagram({oldValue, newValue}) {
  if (![oldValue,newValue].every(Number.isFinite)) return <p className="muted">Enter finite values to compare.</p>;
  const scale=Math.max(Math.abs(oldValue),Math.abs(newValue),1);
  return <DiagramFrame viewBox="0 0 320 240" caption="Old and new values share one scale. Negative values extend below zero.">
    <line x1="25" y1="110" x2="295" y2="110" stroke="var(--ink)" opacity="0.5" />
    {[oldValue,newValue].map((v,i)=>{
      const height=Math.abs(v)/scale*75;
      return <g key={i}>
        <rect x={70+i*130} y={v>=0?110-height:110} width="50" height={height} fill={i?"var(--asl-gold)":"var(--asl-text-secondary)"} />
        <text x={95+i*130} y="20" textAnchor="middle" className="diagram-label">{Number(v.toPrecision(5))}</text>
        <text x={95+i*130} y="215" textAnchor="middle" className="diagram-label">{i?"NEW":"OLD"}</text>
      </g>;
    })}
  </DiagramFrame>;
}
