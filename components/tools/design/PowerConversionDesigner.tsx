"use client";
import { useState } from "react";
import { bridgeDesign, linearRegulatorDesign, buckDesign } from "@/lib/tools/power-conversion";
import PowerSchematic from "./PowerSchematic";
import MathEquation from "./MathEquation";
import styles from "./DesignLab.module.css";
import power from "./PowerDesigner.module.css";

const configs = {
  bridge: {
    fields: [
      "AC RMS voltage (V)",
      "Line frequency (Hz)",
      "Load current (A)",
      "Diode forward drop (V)",
      "Peak-to-peak ripple (V)"
    ],
    defaults: ["12", "50", "1", ".7", "1"]
  },
  linear: {
    fields: [
      "Input voltage (V)",
      "Output voltage (V)",
      "Load current (A)",
      "Input capacitor (µF)",
      "Output capacitor (µF)",
      "Output capacitor ESR (mΩ)"
    ],
    defaults: ["12", "5", ".5", "1", "10", "100"]
  },
  buck: {
    fields: [
      "Input voltage (V)",
      "Output voltage (V)",
      "Load current (A)",
      "Switching frequency (Hz)",
      "Inductor peak-to-peak ripple (% of load)",
      "Output peak-to-peak ripple (V)",
      "Efficiency for loss estimate (%)"
    ],
    defaults: ["12", "5", "2", "500000", "30", ".05", "90"]
  }
};
const fmt = (n: number, unit: string) => `${Number(n.toPrecision(5))} ${unit}`;
export default function PowerConversionDesigner({ kind }: { kind: "bridge" | "linear" | "buck" }) {
  return <Designer key={kind} kind={kind} />;
}
function Designer({ kind }: { kind: "bridge" | "linear" | "buck" }) {
  const c = configs[kind],
    [values, setValues] = useState(c.defaults),
    [phase, setPhase] = useState(kind === "buck" ? "on" : "positive");
  const n = values.map((v) => (v.trim() === "" ? NaN : Number(v)));
  let r: any = null,
    error = "";
  try {
    r =
      kind === "bridge"
        ? bridgeDesign(n[0], n[1], n[2], n[3], n[4])
        : kind === "linear"
          ? linearRegulatorDesign(n[0], n[1], n[2], n[3], n[4], n[5])
          : buckDesign(n[0], n[1], n[2], n[3], n[4], n[5], n[6]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Check the supply values.";
  }
  const metrics = r
    ? kind === "bridge"
      ? [
          ["Average DC estimate", fmt(r.dc, "V")],
          ["Reservoir capacitance", fmt(r.capF * 1e6, "µF")],
          ["Ripple valley", fmt(r.valley, "V")],
          ["Ripple frequency", fmt(r.rippleHz, "Hz")],
          ["Total bridge conduction loss", fmt(r.bridgeLossW, "W")]
        ]
      : kind === "linear"
        ? [
            ["Heat to dissipate", fmt(r.dissipation, "W")],
            ["Ideal efficiency", fmt(r.efficiency * 100, "%")],
            ["Available headroom", fmt(r.headroom, "V")],
            ["Loop stability", "Not evaluated"]
          ]
        : [
            ["Ideal duty cycle", fmt(r.duty * 100, "%")],
            ["Inductance", fmt(r.inductance * 1e6, "µH")],
            ["Ripple-only C minimum", fmt(r.capF * 1e6, "µF")],
            ["Inductor current range", `${fmt(r.valleyI, "")}–${fmt(r.peakI, "A")}`],
            ["Estimated total loss", fmt(r.lossW, "W")]
          ]
    : [];
  const phases =
    kind === "buck"
      ? [
          ["on", "Switch ON"],
          ["off", "Switch OFF"]
        ]
      : [
          ["positive", "A positive pulse"],
          ["negative", "B positive pulse"],
          ["discharge", "Between pulses"]
        ];
  const explanation =
    kind === "buck"
      ? phase === "on"
        ? "The switch closes the source loop. Inductor current rises while the catch diode is reverse biased."
        : "The switch opens. The diode conducts from ground (anode) toward the switching node (cathode), closing the inductor–load loop."
      : kind === "bridge"
        ? phase === "positive"
          ? "During an A-positive charging pulse, D1 and D4 conduct. The reservoir and load receive the same DC polarity."
          : phase === "negative"
            ? "During a B-positive charging pulse, D2 and D3 conduct. DC output polarity stays the same."
            : "Between source peaks, the diodes block and the reservoir capacitor supplies the load. Highlighted DC rails show the discharge loop."
        : "The regulator common, source return, both capacitors and load share one connected return. Capacitance and ESR are documented inputs; this generic model cannot approve stability.";
  return (
    <>
      <div className={styles.grid}>
        <section className={styles.panel}>
          <h2>Set your supply targets</h2>
          <div className={styles.fields}>
            {c.fields.map((label, i) => (
              <label className={styles.field} key={label}>
                {label}
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={values[i]}
                  onChange={(e) =>
                    setValues((old) => old.map((v, j) => (i === j ? e.target.value : v)))
                  }
                />
              </label>
            ))}
          </div>
          <div className={styles.toolbar}>
            <button
              type="button"
              onClick={() => {
                setValues(c.defaults);
                setPhase(kind === "buck" ? "on" : "positive");
              }}
            >
              Reset example
            </button>
          </div>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : (
            <div className={styles.result} aria-live="polite">
              {metrics.map(([label, value]) => (
                <div className={styles.metric} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className={styles.panel}>
          <h2>{kind === "linear" ? "Connected regulator stage" : "Trace an operating phase"}</h2>
          <p>The highlighted path carries conventional current. Values follow your inputs.</p>
          {kind !== "linear" && (
            <div className={power.phases} aria-label="Operating phase">
              {phases.map(([id, label]) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={phase === id}
                  onClick={() => setPhase(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          {r ? (
            <PowerSchematic kind={kind} values={n} result={r} phase={phase} />
          ) : (
            <p>Enter valid targets to draw the calculated supply.</p>
          )}
          <p className={power.status} aria-live="polite">
            {explanation}
          </p>
          {r?.warnings.map((w: string) => (
            <p className={styles.note} key={w}>
              {w}
            </p>
          ))}
        </section>
      </div>
      <section className={styles.foot}>
        <h2>Equations and model scope</h2>
        <div className={power.equations}>
          {kind === "bridge" ? (
            <>
              <MathEquation
                label="Reservoir sizing"
                tex={String.raw`C\approx\frac{I_{\mathrm{load}}}{2f_{\mathrm{line}}\Delta V_{pp}}`}
              />
              <MathEquation
                label="Average DC and ripple valley"
                tex={String.raw`V_{\mathrm{DC}}\approx\sqrt{2}V_{\mathrm{AC,rms}}-2V_D-\frac{\Delta V_{pp}}{2},\quad V_{\min}=\sqrt{2}V_{\mathrm{AC,rms}}-2V_D-\Delta V_{pp}`}
              />
            </>
          ) : kind === "linear" ? (
            <>
              <MathEquation
                label="Heat, neglecting quiescent current"
                tex={String.raw`P_{\mathrm{loss}}\approx(V_{\mathrm{in}}-V_{\mathrm{out}})I_{\mathrm{out}}`}
              />
              <MathEquation
                label="Ideal efficiency"
                tex={String.raw`\eta\approx\frac{V_{\mathrm{out}}}{V_{\mathrm{in}}}`}
              />
            </>
          ) : (
            <>
              <MathEquation
                label="Ideal CCM duty and inductor"
                tex={String.raw`D=\frac{V_{\mathrm{out}}}{V_{\mathrm{in}}},\quad L=\frac{(V_{\mathrm{in}}-V_{\mathrm{out}})D}{f_s\Delta I_L}`}
              />
              <MathEquation
                label="Ideal ripple-only capacitor minimum"
                tex={String.raw`C_{\mathrm{out,min}}=\frac{\Delta I_L}{8f_s\Delta V_{pp}},\quad I_{L,\mathrm{pk/min}}=I_{\mathrm{out}}\pm\frac{\Delta I_L}{2}`}
              />
            </>
          )}
        </div>
        <p>
          {kind === "linear"
            ? "Use the exact part’s datasheet to verify dropout at the chosen current, effective capacitance after bias and temperature derating, allowable ESR and thermal resistance. No stable/unstable verdict is inferred from generic capacitor thresholds."
            : kind === "buck"
              ? "This is an ideal asynchronous buck power stage in continuous conduction. It omits controller feedback, input decoupling and parasitics. Real duty, capacitor selection and regulation depend on the selected controller."
              : "This is a low-voltage, isolated AC source model with constant load current. The reservoir approximation is most useful when ripple is small compared with the rectified peak. Transformer impedance and diode charging-current peaks are excluded."}
        </p>
        <div className={power.sources}>
          <a
            href="https://www.ti.com/lit/an/slva477b/slva477b.pdf"
            target="_blank"
            rel="noreferrer"
          >
            TI: buck power-stage calculations
          </a>
          <a
            href="https://www.ti.com/lit/an/slva115a/slva115a.pdf"
            target="_blank"
            rel="noreferrer"
          >
            TI: ESR and LDO stability
          </a>
        </div>
      </section>
    </>
  );
}
