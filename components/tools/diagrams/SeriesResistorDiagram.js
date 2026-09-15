import { DiagramFrame, NodeDot, ResistorH, Wire } from "./Symbols";

export function SeriesResistorDiagram({ count }) {
  const n = Math.max(1, count);
  const resistorWidth = 56;
  const gap = 24;
  const leadIn = 24;
  const totalWidth = leadIn * 2 + n * resistorWidth + (n - 1) * gap;
  const viewWidth = Math.max(totalWidth, 200);
  const y = 40;

  return (
    <DiagramFrame
      viewBox={`0 0 ${viewWidth} 80`}
      height={110}
      caption={`${n} resistor${n === 1 ? "" : "s"} in series - one path, resistances add`}
    >
      <Wire x1={0} y1={y} x2={leadIn} y2={y} />
      {Array.from({ length: n }).map((_, index) => {
        const x = leadIn + index * (resistorWidth + gap);
        return (
          <g key={index}>
            <ResistorH x={x} y={y} width={resistorWidth} label={`R${index + 1}`} />
            {index < n - 1 ? (
              <Wire x1={x + resistorWidth} y1={y} x2={x + resistorWidth + gap} y2={y} />
            ) : null}
          </g>
        );
      })}
      <Wire x1={leadIn + (n - 1) * (resistorWidth + gap) + resistorWidth} y1={y} x2={viewWidth} y2={y} />
      <NodeDot x={0} y={y} />
      <NodeDot x={viewWidth} y={y} />
    </DiagramFrame>
  );
}
