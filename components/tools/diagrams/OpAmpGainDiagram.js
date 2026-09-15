import { DiagramFrame, GroundSymbol, NodeDot, ResistorH, Wire } from "./Symbols";

export function OpAmpGainDiagram({ config = "inverting" }) {
  const inverting = config === "inverting";
  return (
    <DiagramFrame
      viewBox="0 0 420 260"
      height={260}
      caption={inverting
        ? "Inverting: Vin enters through Rin at −; + is grounded. Rf feeds Vout back to −. Ideal linear operation; supply rails omitted."
        : "Non-inverting: Vin enters + directly. Rf connects Vout to −; Rg connects − to ground. Ideal linear operation; supply rails omitted."}
    >
      <polygon points="220,70 220,190 320,130" fill="none" stroke="var(--ink)" strokeWidth="2" />
      <text x={231} y={105} className="diagram-label">−</text>
      <text x={231} y={165} className="diagram-label">+</text>
      <Wire x1={170} y1={100} x2={220} y2={100} />
      <NodeDot x={170} y={100} />
      <Wire x1={170} y1={100} x2={170} y2={35} />
      <Wire x1={170} y1={35} x2={230} y2={35} />
      <ResistorH x={230} y={35} width={70} label="Rf" />
      <Wire x1={300} y1={35} x2={350} y2={35} />
      <Wire x1={350} y1={35} x2={350} y2={130} />
      <Wire x1={320} y1={130} x2={375} y2={130} />
      <NodeDot x={350} y={130} />
      <text x={380} y={135} className="diagram-label">Vout</text>
      {inverting ? (
        <>
          <text x={30} y={85} className="diagram-label">Vin</text>
          <Wire x1={30} y1={100} x2={70} y2={100} />
          <ResistorH x={70} y={100} width={60} label="Rin" />
          <Wire x1={130} y1={100} x2={170} y2={100} />
          <Wire x1={220} y1={160} x2={195} y2={160} />
          <Wire x1={195} y1={160} x2={195} y2={215} />
          <GroundSymbol x={195} y={215} />
        </>
      ) : (
        <>
          <Wire x1={170} y1={100} x2={135} y2={100} />
          <ResistorH x={55} y={100} width={80} label="Rg" />
          <Wire x1={55} y1={100} x2={35} y2={100} />
          <GroundSymbol x={35} y={100} />
          <text x={30} y={150} className="diagram-label">Vin</text>
          <Wire x1={30} y1={160} x2={220} y2={160} />
        </>
      )}
    </DiagramFrame>
  );
}
