import { DiagramFrame, NodeDot, ResistorV, Wire } from "./Symbols";

export function ParallelResistorDiagram({ count }) {
  const n = Math.max(1, count);
  const branchHeight = 60;
  const branchGap = 46;
  const railInset = 30;
  const totalWidth = railInset * 2 + (n - 1) * branchGap;
  const viewWidth = Math.max(totalWidth, 160);
  const topY = 10;
  const bottomY = topY + branchHeight;

  return (
    <DiagramFrame
      viewBox={`-30 0 ${viewWidth + 60} ${branchHeight + 20}`}
      height={130}
      caption={`${n} resistor${n === 1 ? "" : "s"} in parallel - shared rails, more paths for current`}
    >
      <Wire x1={-30} y1={topY} x2={viewWidth} y2={topY} />
      <Wire x1={-30} y1={bottomY} x2={viewWidth} y2={bottomY} />
      {Array.from({ length: n }).map((_, index) => {
        const x = railInset + index * branchGap;
        return (
          <g key={index}>
            <Wire x1={x} y1={topY} x2={x} y2={topY + 8} />
            <ResistorV x={x} y={topY + 8} height={branchHeight - 16} label={`R${index + 1}`} />
            <Wire x1={x} y1={bottomY - 8} x2={x} y2={bottomY} />
            <NodeDot x={x} y={topY} />
            <NodeDot x={x} y={bottomY} />
          </g>
        );
      })}
    </DiagramFrame>
  );
}
