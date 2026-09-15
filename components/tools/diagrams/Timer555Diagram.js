import { CapacitorV, GroundSymbol, NodeDot, ResistorV, Wire, capacitorVHeight } from "./Symbols";

function Label({ x, y, children, anchor = "start", bold = false }) {
  return <text x={x} y={y} textAnchor={anchor} className={bold ? "diagram-label-bold" : "diagram-label"}>{children}</text>;
}

// Logical schematic positions, not the physical DIP pin arrangement.
// Connections follow TI LM555 figures 11 (monostable) and 14 (astable).
export function Timer555Diagram({ mode }) {
  const astable = mode === "astable";
  const capacitorY = astable ? 300 : 175;
  const caption = astable
    ? "R1 + R2 charge C; R2 discharges C through pin 7. Pins 2 and 6 share the capacitor node."
    : "R charges C at pins 6 and 7. A separate low pulse at pin 2 starts the one-shot timer.";

  return (
    <figure className="tool-diagram timer555-diagram" aria-label={`555 ${mode} circuit`}>
      <svg viewBox="0 0 520 415" role="img" aria-label={`555 ${mode}: ${caption}`}>
        <title>{`555 ${mode} circuit: all eight pins`}</title>
        <desc>{`${caption} Pins 8 and 4 connect to VCC. Pin 1 is grounded. Pin 5 connects to ground through a 10 nF capacitor. All ground symbols share the supply return.`}</desc>
        <Label x={60} y={24}>VCC</Label>
        <Wire x1={60} y1={40} x2={350} y2={40} />
        <Wire x1={60} y1={40} x2={60} y2={65} />
        <ResistorV x={60} y={65} height={65} label={astable ? "R1" : "R"} />
        <Wire x1={60} y1={130} x2={60} y2={150} />
        <Wire x1={60} y1={150} x2={220} y2={150} />
        <NodeDot x={60} y={150} />
        {astable ? <>
          <Wire x1={60} y1={150} x2={60} y2={175} />
          <ResistorV x={60} y={175} height={55} label="R2" />
          <Wire x1={60} y1={230} x2={60} y2={300} />
          <Wire x1={60} y1={250} x2={220} y2={250} />
          <NodeDot x={60} y={250} />
          <NodeDot x={160} y={250} />
          <Wire x1={160} y1={250} x2={160} y2={290} />
          <Wire x1={160} y1={290} x2={220} y2={290} />
        </> : <>
          <Wire x1={60} y1={150} x2={60} y2={175} />
          <NodeDot x={160} y={150} />
          <Wire x1={160} y1={150} x2={160} y2={250} />
          <Wire x1={160} y1={250} x2={220} y2={250} />
          <Label x={24} y={280}>Trigger input</Label>
          <Wire x1={24} y1={290} x2={220} y2={290} />
          <Label x={24} y={317}>Active low</Label>
        </>}
        <CapacitorV x={60} y={capacitorY} label="C" />
        <GroundSymbol x={60} y={capacitorY + capacitorVHeight()} />
        <rect x={220} y={100} width={180} height={245} rx={4} fill="none" stroke="var(--ink)" strokeWidth={2} />
        <Wire x1={260} y1={40} x2={260} y2={100} />
        <Wire x1={350} y1={40} x2={350} y2={100} />
        <NodeDot x={260} y={40} />
        <Label x={248} y={88} anchor="end">8</Label>
        <Label x={338} y={88} anchor="end">4</Label>
        <Label x={260} y={123} anchor="middle">VCC</Label>
        <Label x={350} y={123} anchor="middle">RESET</Label>
        <Label x={207} y={141} anchor="end">7</Label>
        <Label x={232} y={157}>DISCH</Label>
        <Label x={207} y={241} anchor="end">6</Label>
        <Label x={232} y={257}>THRES</Label>
        <Label x={207} y={281} anchor="end">2</Label>
        <Label x={232} y={297}>TRIG</Label>
        <Label x={310} y={206} anchor="middle" bold>555</Label>
        <Label x={388} y={167} anchor="end">OUT</Label>
        <Label x={413} y={153}>3</Label>
        <Wire x1={400} y1={160} x2={495} y2={160} />
        <Label x={495} y={142} anchor="end">Vout</Label>
        {/* Waveforms are annotations, not electrical wires. */}
        <polyline points={astable ? "423,218 431,218 431,193 451,193 451,218 467,218 467,193 487,193 487,218 495,218" : "423,218 435,218 435,193 470,193 470,218 495,218"} fill="none" stroke="var(--signal-dark)" strokeWidth={2} />
        <Label x={388} y={297} anchor="end">CTRL</Label>
        <Label x={413} y={281}>5</Label>
        <Wire x1={400} y1={290} x2={455} y2={290} />
        <Wire x1={455} y1={290} x2={455} y2={305} />
        <CapacitorV x={455} y={305} />
        <Label x={455} y={399} anchor="middle">10 nF</Label>
        <GroundSymbol x={455} y={305 + capacitorVHeight()} />
        <Label x={310} y={331} anchor="middle">GND</Label>
        <Wire x1={310} y1={345} x2={310} y2={370} />
        <Label x={326} y={365}>1</Label>
        <GroundSymbol x={310} y={370} />
      </svg>
      <figcaption className="timer555-caption">{caption}</figcaption>
      <details className="timer555-wiring-notes">
        <summary>Wiring notes &amp; pin reference</summary>
        <p>8 (VCC) and 4 (RESET) → supply positive. 1 (GND) → supply negative. 3 (OUT) → output. 5 (CTRL) → 10 nF → ground. Add 100 nF supply decoupling close to pins 8 and 1. All ground symbols connect to the same return.</p>
        <p>{astable
          ? "VCC → R1 → pin 7 (DISCH) → R2 → pins 6 (THRES) and 2 (TRIG) → C → ground."
          : "VCC → R → pins 7 (DISCH) and 6 (THRES) → C → ground. Drive pin 2 (TRIG) from a normally-high external signal; pulse below VCC/3, then return high before the timer expires. Do not leave this input floating."}</p>
        <p>Logical schematic, not physical package layout. <a href="https://www.ti.com/lit/ds/symlink/lm555.pdf">TI LM555 datasheet, figures 11 and 14</a>.</p>
      </details>
    </figure>
  );
}
