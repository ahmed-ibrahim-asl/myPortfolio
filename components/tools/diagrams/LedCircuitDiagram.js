import { DiagramFrame, GroundSymbol, LedSymbol, NodeDot, ResistorH, Wire } from "./Symbols";

export function LedCircuitDiagram({ safe }) {
  const y = 50;
  return (
    <DiagramFrame
      viewBox="0 0 300 110"
      height={140}
      caption={safe ? "Resistor drops the leftover voltage so the LED sees a safe current" : "Impossible: supply must exceed the LED's forward voltage"}
    >
      <text x={8} y={y + 4} className="diagram-label">
        V+
      </text>
      <Wire x1={28} y1={y} x2={55} y2={y} />
      <ResistorH x={55} y={y} width={60} label="R" />
      <Wire x1={115} y1={y} x2={150} y2={y} />
      <NodeDot x={150} y={y} />
      <LedSymbol x={190} y={y} label="LED" lit={safe} />
      <Wire x1={214} y1={y} x2={250} y2={y} />
      <Wire x1={250} y1={y} x2={250} y2={y + 20} />
      <GroundSymbol x={250} y={y + 20} />
    </DiagramFrame>
  );
}
