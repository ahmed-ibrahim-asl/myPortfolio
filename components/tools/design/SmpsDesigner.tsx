"use client";
import { useState } from "react";
import { flybackDesign } from "@/lib/tools/smps-design";
import MathEquation from "./MathEquation";
import styles from "./DesignLab.module.css";
import ui from "./SmpsDesigner.module.css";
import FlybackSchematic from "./FlybackSchematic";
type Mode = "ac" | "dc";
const defaults = {
  ac: ["207", "253", "12", "1", "100", "35", "45", "0.5", "20", "0.1"],
  dc: ["24", "30", "12", "1", "100", "35", "45", "0.5", "0", "0.1"]
};
const format = (n: number, unit = "") => `${Number(n.toPrecision(4))} ${unit}`;
const phases = [
  ["store", "1 · Store energy"],
  ["transfer", "2 · Deliver energy"],
  ["idle", "3 · Idle interval"]
];
const descriptions: Record<string, string> = {
  store:
    "The primary switch is ON. Primary current rises from zero and energy builds in the magnetic field. The secondary diode is reverse biased; the output capacitor supplies the load.",
  transfer:
    "The primary switch is OFF. Winding voltages reverse, the secondary diode conducts, and stored energy supplies the load and replenishes the capacitor. Primary switch current is zero.",
  idle: "Both winding currents have reached zero. The switch and output diode are OFF; the output capacitor supplies the load until the next cycle. This idle interval defines discontinuous conduction (DCM)."
};
const parts: Record<string, [string, string]> = {
  input: [
    "Input stage",
    "AC mode needs rectification and a reservoir before the switching stage. The bus estimate assumes two 0.7 V bridge drops and the reservoir sag you enter. It does not size the mains reservoir, fuse, EMI filter, inrush limiting or discharge network. DC mode uses your source directly; input decoupling is still required."
  ],
  magnetics: [
    "Flyback magnetics",
    "This is a coupled energy-storage inductor, often called a flyback transformer. The calculated ratio Np/Ns is not a winding recipe. Core material, effective area, gap, saturation, losses, insulation, creepage and leakage inductance require a separate magnetic design. Dot markers show winding polarity."
  ],
  switch: [
    "Switch and controller",
    "PWM sets the ON interval. The displayed blocking voltage is only the ideal bus plus reflected voltage—not a MOSFET rating recommendation. Leakage spikes, a clamp/snubber, current sensing, gate drive, controller supply and protection are not modeled."
  ],
  diode: [
    "Secondary rectifier",
    "The diode conducts only during energy delivery. Peak and RMS current matter as well as average output current. The ideal reverse-voltage estimate excludes ringing; verify reverse recovery, leakage, temperature and rating margin."
  ],
  capacitor: [
    "Output capacitor",
    "The capacitance estimate integrates the ideal load-current deficit during the nonconducting interval and the tail of the triangular secondary current. It excludes ESR ripple, bias derating, temperature, load transients and loop stability."
  ]
};
export default function SmpsDesigner() {
  const [mode, setMode] = useState<Mode>("ac"),
    [values, setValues] = useState(defaults.ac),
    [phase, setPhase] = useState("store"),
    [part, setPart] = useState("magnetics");
  const n = values.map((v) => (v.trim() === "" ? NaN : Number(v)));
  let r: ReturnType<typeof flybackDesign> | null = null,
    error = "";
  try {
    r = flybackDesign({
      mode,
      inputMin: n[0],
      inputMax: n[1],
      output: n[2],
      current: n[3],
      frequency: n[4] * 1000,
      duty: n[5] / 100,
      transfer: n[6] / 100,
      diode: n[7],
      busRipple: n[8],
      ripple: n[9]
    });
  } catch (e) {
    error = (e as Error).message;
  }
  const fields = [
    `Minimum input (${mode === "ac" ? "V AC RMS" : "V DC"})`,
    `Maximum input (${mode === "ac" ? "V AC RMS" : "V DC"})`,
    "Output voltage (V DC)",
    "Output current (A)",
    "Switching frequency (kHz)",
    "ON interval at minimum input (%)",
    "Energy-transfer interval (%)",
    "Secondary diode forward drop (V)",
    "Assumed input reservoir sag (V)",
    "Output ripple target (V peak-to-peak)"
  ];
  function choose(next: Mode) {
    setMode(next);
    setValues(defaults[next]);
    setPhase("store");
  }
  const metrics = r
    ? [
        ["Primary DC bus range", `${format(r.busMin)}–${format(r.busMax, "V")}`],
        ["Output power", format(r.power, "W")],
        ["Primary inductance Lm", format(r.inductance * 1e6, "µH")],
        ["Turns ratio Np / Ns", format(r.ratio, ": 1")],
        ["Primary peak / RMS", `${format(r.primaryPeak)} / ${format(r.primaryRms, "A")}`],
        ["Secondary peak / RMS", `${format(r.secondaryPeak)} / ${format(r.secondaryRms, "A")}`],
        ["Ideal switch blocking voltage", format(r.switchVoltage, "V")],
        ["Ideal diode reverse voltage", format(r.diodeVoltage, "V")],
        ["Ideal ripple capacitance", format(r.capacitance * 1e6, "µF")],
        ["Idle interval at minimum input", format(r.idle * 100, "%")],
        ["Required ON interval at maximum input", format(r.dutyAtMax * 100, "%")]
      ]
    : [];
  return (
    <>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>One topology / Two input arrangements</p>
        <h2>Where does the power come from?</h2>
        <div className={ui.modes}>
          {(["ac", "dc"] as Mode[]).map((m) => (
            <button key={m} aria-pressed={mode === m} onClick={() => choose(m)}>
              <strong>{m === "ac" ? "AC mains → isolated DC" : "DC source → isolated DC"}</strong>
              <span>
                {m === "ac"
                  ? "Like a compact wall adapter: rectifier and reservoir first."
                  : "Like a battery-fed isolated converter: no mains rectifier."}
              </span>
            </button>
          ))}
        </div>
        <p>
          Both use a fixed-frequency DCM flyback model. Changing mode loads its example values. The
          existing buck tool is a different, non-isolated step-down topology.
        </p>
      </section>
      <p className={styles.error} role="note">
        {mode === "ac"
          ? "Mains safety: rectified mains can be lethal and capacitors can remain charged after unplugging. This is an educational estimator, not a safe-to-build schematic. Do not prototype the mains stage on a solderless breadboard."
          : "DC-input safety: switching spikes and stored energy still require appropriate ratings and protection. A DC source is not automatically safe or isolated."}{" "}
        A transformer symbol does not certify isolation. A qualified design review and hardware
        testing are required.
      </p>
      <div className={ui.workspace}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>01 / Targets and assumptions</p>
          <h2>Set the operating point</h2>
          <div className={ui.targetFields}>
            {fields.map((label, i) =>
              mode === "dc" && i === 8 ? null : (
                <label key={i} className={styles.field}>
                  {label}
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={values[i]}
                    onChange={(e) =>
                      setValues((old) => old.map((v, j) => (j === i ? e.target.value : v)))
                    }
                  />
                </label>
              )
            )}
          </div>
          <p className={styles.caption}>
            ON + transfer must stay below 100%. Remaining time is idle. Example values illustrate
            the model; they are not recommended component ratings.
          </p>
          <button onClick={() => choose(mode)}>Reset this example</button>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </section>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>02 / Follow one switching cycle</p>
          <h2>{mode === "ac" ? "Mains-fed flyback" : "DC-fed flyback"}</h2>
          <div className={styles.toolbar}>
            {phases.map(([id, label]) => (
              <button key={id} aria-pressed={phase === id} onClick={() => setPhase(id)}>
                {label}
              </button>
            ))}
          </div>
          {r ? (
            <>
              <div
                className={styles.diagramScroll}
                tabIndex={0}
                role="region"
                aria-label="Scrollable flyback schematic"
              >
                <FlybackSchematic
                  mode={mode}
                  phase={phase}
                  result={r}
                  output={n[2]}
                  selected={part}
                  onSelect={setPart}
                />
              </div>
              <p className={styles.caption}>
                Scroll horizontally on a small screen. Gold shows the highlighted path; dashed
                control lines are not power wires.
              </p>
              <div className={ui.timeline} aria-label="Cycle timing at minimum input">
                {[r.duty, r.transfer, r.idle].map((v, i) => (
                  <div key={i} style={{ flex: v }} data-active={phase === phases[i][0]}>
                    <b>{["ON", "TRANSFER", "IDLE"][i]}</b>
                    <span>{format(v * 100, "%")}</span>
                  </div>
                ))}
              </div>
              <p className={styles.note} aria-live="polite">
                {descriptions[phase]}
              </p>
            </>
          ) : (
            <p>Enter valid targets to show the calculated circuit.</p>
          )}
          <div className={styles.toolbar}>
            {Object.entries(parts).map(([id, [name]]) => (
              <button key={id} aria-pressed={part === id} onClick={() => setPart(id)}>
                {name}
              </button>
            ))}
          </div>
          <h3>{parts[part][0]}</h3>
          <p aria-live="polite">{parts[part][1]}</p>
        </section>
      </div>
      {r && (
        <section className={styles.explainPanel}>
          <p className={styles.eyebrow}>03 / Analytical results, not a bill of materials</p>
          <h2>First-pass design estimates</h2>
          <div className={ui.results}>
            {metrics.map(([label, v]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{v}</strong>
              </div>
            ))}
          </div>
          <p>
            Calculations include the entered secondary diode drop but otherwise assume lossless
            transfer, ideal coupling and fixed frequency. At higher input voltage the controller
            must reduce ON time. Voltage stresses shown are ideal lower estimates; they omit leakage
            spikes and ringing. Do not select parts directly at these numbers.
          </p>
        </section>
      )}
      <section className={styles.foot}>
        <h2>How the calculation works</h2>
        <MathEquation
          label="Energy and primary peak current"
          tex={String.raw`P_t=(V_o+V_D)I_o=\frac12L_m I_{p,pk}^2f_s,\qquad I_{p,pk}=\frac{2P_t}{V_{bus,min}D}`}
        />
        <MathEquation
          label="Inductance and winding ratio"
          tex={String.raw`L_m=\frac{V_{bus,min}D}{f_s I_{p,pk}},\qquad \frac{N_p}{N_s}=\frac{V_{bus,min}D}{(V_o+V_D)D_2}`}
        />
        <MathEquation
          label="Ideal voltage stresses"
          tex={String.raw`V_{DS}=V_{bus,max}+\frac{N_p}{N_s}(V_o+V_D),\qquad V_{R,diode}=V_o+\frac{V_{bus,max}}{N_p/N_s}`}
        />
        <MathEquation
          label="Ideal capacitor charge balance"
          tex={String.raw`C_o=\frac{I_o}{f_s\Delta V_{pp}}\left(1-D_2+\frac{D_2 I_o}{2I_{s,pk}}\right)`}
        />
        <p>
          D is the ON fraction, D₂ is the secondary energy-delivery fraction, and 1 − D − D₂ is
          idle. Estimates apply to the specified full-load operating point. Startup, light-load
          behavior and transient control are outside this model.
        </p>
        <a
          href="https://www.ti.com/document-viewer/lit/html/ssztcw6"
          target="_blank"
          rel="noreferrer"
        >
          Technical reference: TI — Designing a DCM flyback converter ↗
        </a>
        <h3 style={{ marginTop: 24 }}>What must still be designed?</h3>
        <p>
          Core and winding construction; isolation barriers; controller and gate drive; feedback
          compensation; current limiting; startup and auxiliary supply; snubber/clamp; input
          filtering; fuse, surge and inrush protection; capacitor ripple-current ratings; thermal
          behavior; layout and EMC. This tool does not generate an approved mains power supply.
        </p>
      </section>
    </>
  );
}
