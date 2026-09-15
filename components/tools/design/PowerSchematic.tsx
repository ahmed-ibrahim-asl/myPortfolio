import styles from "./PowerDesigner.module.css";

type Props = {
  kind: "bridge" | "linear" | "buck";
  phase: string;
  values: number[];
  result: Record<string, any>;
};
const fmt = (n: number) => Number(n.toPrecision(4)).toString();
function Wire({ d, active = false }: { d: string; active?: boolean }) {
  return <path d={d} className={active ? styles.active : styles.wire} />;
}
function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="4" fill="currentColor" />;
}
function Cap({
  x,
  top = 100,
  bottom = 300,
  label,
  active = false
}: {
  x: number;
  top?: number;
  bottom?: number;
  label: string;
  active?: boolean;
}) {
  const y = (top + bottom) / 2;
  return (
    <g>
      <Wire
        active={active}
        d={`M${x} ${top}V${y - 8}M${x - 17} ${y - 8}h34M${x - 17} ${y + 8}h34M${x} ${y + 8}V${bottom}`}
      />
      <text x={x + 24} y={y}>
        {label}
      </text>
    </g>
  );
}
function Load({
  x,
  top = 100,
  bottom = 300,
  active,
  label
}: {
  x: number;
  top?: number;
  bottom?: number;
  active: boolean;
  label: string;
}) {
  const y = (top + bottom) / 2;
  return (
    <g>
      <Wire d={`M${x} ${top}V${y - 30}m0 60V${bottom}`} active={active} />
      <rect
        x={x - 12}
        y={y - 30}
        width="24"
        height="60"
        className={active ? styles.active : styles.wire}
      />
      <text x={x + 23} y={y - 7}>
        Load
      </text>
      <text x={x + 23} y={y + 16}>
        {label}
      </text>
    </g>
  );
}
function Ground({ x, y }: { x: number; y: number }) {
  return <Wire d={`M${x} ${y}v12m-15 0h30m-24 7h18m-12 7h6`} />;
}
// Diode local coordinates: anode at x=0, cathode at x=80. Rotate the whole symbol.
function Diode({
  x,
  y,
  angle = 0,
  active,
  name
}: {
  x: number;
  y: number;
  angle?: number;
  active: boolean;
  name: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <title>{`${name}: anode to cathode`}</title>
      <Wire active={active} d="M0 0H28M52 0H80M28 -13L52 0L28 13ZM52 -15V15" />
    </g>
  );
}

export default function PowerSchematic({ kind, phase, values: n, result: r }: Props) {
  const on = phase === "on",
    pos = phase === "positive",
    charging = phase !== "discharge";
  const title =
    kind === "buck"
      ? "Asynchronous buck: source, switch, catch diode, inductor, capacitor and load"
      : kind === "bridge"
        ? "Four diode bridge with isolated AC source and DC reservoir"
        : "Linear regulator with input capacitor, output capacitor and common return";
  return (
    <div className={styles.schematicScroll}>
      <svg className={styles.schematic} viewBox="0 0 820 410" role="img" aria-label={title}>
        <title>{title}</title>
        <desc>
          Highlighted lines show the selected conventional-current path. All capacitor and load
          branches connect to the return rail.
        </desc>
        {kind === "buck" ? (
          <>
            <text x="30" y="32">
              IDEAL ASYNCHRONOUS BUCK · {on ? "SWITCH ON" : "SWITCH OFF"}
            </text>
            <Wire d="M65 100H180M230 100H290" active={on} />
            <Wire d="M65 100V174M65 226V300H290" active={on} />
            <circle cx="65" cy="200" r="26" className={on ? styles.active : styles.wire} />
            <text x="59" y="191">
              +
            </text>
            <text x="60" y="220">
              −
            </text>
            <text x="20" y="150">
              {fmt(n[0])} V
            </text>
            <circle cx="180" cy="100" r="4" fill="currentColor" />
            <circle cx="230" cy="100" r="4" fill="currentColor" />
            <Wire d={on ? "M180 100H230" : "M180 100L222 66"} active={on} />
            <text x="170" y="52">
              Switch
            </text>
            <Wire d="M290 100H340" active />
            <path
              d="M340 100a12 18 0 0 1 24 0a12 18 0 0 1 24 0a12 18 0 0 1 24 0a12 18 0 0 1 24 0"
              className={styles.active}
            />
            <Wire d="M436 100H680M290 300H680" active />
            <text x="342" y="62">
              L {fmt(r.inductance * 1e6)} µH
            </text>
            <text x="335" y="133">
              iL → {fmt(r.valleyI)}–{fmt(r.peakI)} A
            </text>
            <Wire d="M290 300V240M290 160V100" active={!on} />
            <Diode x={290} y={240} angle={-90} active={!on} name="Catch diode" />
            <text x="187" y="202">
              D catch
            </text>
            <text x="190" y="224">
              A ↓ / K ↑
            </text>
            <Cap x={520} label={`${fmt(r.capF * 1e6)} µF`} />
            <Load x={680} active label={`${fmt(n[2])} A`} />
            <text x="564" y="62">
              Vout {fmt(n[1])} V
            </text>
            {[290, 520, 680].map((x) => (
              <g key={x}>
                <Dot x={x} y={100} />
                <Dot x={x} y={300} />
              </g>
            ))}
            <Ground x={65} y={300} />
            <text x="175" y="362">
              {on
                ? "Vin → switch → L → load → source return"
                : "Return → diode (A to K) → L → load → return"}
            </text>
            <text x="175" y="386">
              {on
                ? "Inductor current rises; catch diode blocks."
                : "Inductor current falls; current through L stays positive."}
            </text>
          </>
        ) : kind === "linear" ? (
          <>
            <text x="30" y="32">
              LINEAR REGULATOR · CONNECTED DC SUPPLY
            </text>
            <Wire d="M60 100H280M450 100H680M60 100V174M60 226V300H680" active />
            <circle cx="60" cy="200" r="26" className={styles.active} />
            <text x="54" y="192">
              +
            </text>
            <text x="54" y="219">
              −
            </text>
            <text x="25" y="150">
              {fmt(n[0])} V
            </text>
            <rect x="280" y="72" width="170" height="90" rx="5" className={styles.wire} />
            <text x="300" y="103">
              IN
            </text>
            <text x="405" y="103">
              OUT
            </text>
            <text x="308" y="127">
              REGULATOR
            </text>
            <text x="337" y="149">
              COM
            </text>
            <Wire d="M365 162V300" />
            <Cap x={175} label={`${fmt(n[3])} µF`} />
            <Cap x={520} label={`${fmt(n[4])} µF`} />
            <Load x={680} active label={`${fmt(n[2])} A`} />
            <text x="535" y="62">
              Vout {fmt(n[1])} V
            </text>
            <text x="199" y="245">
              Cin
            </text>
            <text x="544" y="245">
              Cout
            </text>
            {[175, 520, 680].map((x) => (
              <g key={x}>
                <Dot x={x} y={100} />
                <Dot x={x} y={300} />
              </g>
            ))}
            <Dot x={365} y={300} />
            <Ground x={60} y={300} />
            <text x="175" y="357">
              Heat {fmt(r.dissipation)} W · Cout ESR {fmt(r.esrOhm)} Ω
            </text>
            <text x="175" y="382">
              Capacitor values alone do not establish loop stability.
            </text>
          </>
        ) : (
          <>
            <text x="24" y="28">
              FOUR-DIODE BRIDGE ·{" "}
              {phase === "discharge"
                ? "RESERVOIR DISCHARGE"
                : pos
                  ? "A POSITIVE CHARGING PULSE"
                  : "B POSITIVE CHARGING PULSE"}
            </text>
            {/* A/B are isolated AC nodes; DC+ is top, DC− bottom. */}
            <Wire d="M240 80V42H455V80M240 320V360H455V320" active={charging} />
            <Wire d="M455 80H635M455 320H635" active />
            <Wire d="M145 200V80H160" active={charging && pos} />
            <Wire d="M145 200V320H160" active={charging && !pos} />
            <Diode x={160} y={80} name="D1, A to DC positive" active={charging && pos} />
            <Diode
              x={240}
              y={320}
              angle={180}
              name="D3, DC negative to A"
              active={charging && !pos}
            />
            <Wire d="M360 200V80H320" active={charging && !pos} />
            <Wire d="M360 200V320H320" active={charging && pos} />
            <Diode
              x={320}
              y={80}
              angle={180}
              name="D2, B to DC positive"
              active={charging && !pos}
            />
            <Diode x={240} y={320} name="D4, DC negative to B" active={charging && pos} />
            <Wire d="M145 200H219M271 200H360" active={charging} />
            <circle cx="245" cy="200" r="26" className={charging ? styles.active : styles.wire} />
            <path d="M228 201q8-22 17 0t17 0" className={styles.wire} />
            <text x="105" y="185">
              A
            </text>
            <text x="373" y="185">
              B
            </text>
            <Dot x={145} y={200} />
            <Dot x={360} y={200} />
            <text x="184" y="252">
              {fmt(n[0])} Vrms · {fmt(n[1])} Hz
            </text>
            <text x="182" y="61">
              D1 →
            </text>
            <text x="269" y="61">
              ← D2
            </text>
            <text x="182" y="347">
              ← D3
            </text>
            <text x="269" y="347">
              D4 →
            </text>
            <Cap x={455} top={80} bottom={320} active label={`${fmt(r.capF * 1e6)} µF`} />
            <Load x={635} top={80} bottom={320} active label={`${fmt(n[2])} A`} />
            <text x="534" y="59">
              DC+ {fmt(r.dc)} V avg
            </text>
            <text x="539" y="348">
              DC− return
            </text>
            {[240, 455, 635].map((x) => (
              <g key={x}>
                <Dot x={x} y={80} />
                <Dot x={x} y={320} />
              </g>
            ))}
            <text x="100" y="382">
              {!charging
                ? "All diodes block between charging pulses; C supplies the load."
                : pos
                  ? "A → D1 → DC+ → load / C → DC− → D4 → B"
                  : "B → D2 → DC+ → load / C → DC− → D3 → A"}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
