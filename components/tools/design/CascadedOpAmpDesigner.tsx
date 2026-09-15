"use client";
import { useState } from "react";
import { cascadedGain } from "@/lib/tools/opamp-design";
import { icReferences } from "@/data/ic-reference";
import MathEquation from "./MathEquation";
import styles from "./DesignLab.module.css";
type Stage = { type: string; rin: string; rf: string };
const fmt = (v: number) => Number(v.toPrecision(5)).toString();
export default function CascadedOpAmpDesigner() {
  const [input, setInput] = useState("0.1"),
    [stages, setStages] = useState<Stage[]>([
      { type: "non-inverting", rin: "10000", rf: "10000" },
      { type: "inverting", rin: "10000", rf: "20000" }
    ]),
    [selected, setSelected] = useState(0),
    [part, setPart] = useState(0),
    [pin, setPin] = useState(1),
    [showFull, setShowFull] = useState(false);
  let value: ReturnType<typeof cascadedGain> | null = null,
    error = "";
  try {
    value = cascadedGain(stages, input.trim() === "" ? NaN : Number(input));
  } catch (e) {
    error = (e as Error).message;
  }
  function update(i: number, key: keyof Stage, next: string) {
    setStages((old) => old.map((s, j) => (j === i ? { ...s, [key]: next } : s)));
  }
  const ic = icReferences[part];
  return (
    <>
      <div className={styles.grid}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>01 / Define each stage</p>
          <h2>Build the signal path</h2>
          <label className={styles.field}>
            Input signal (V)
            <input
              type="number"
              step="any"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </label>
          {stages.map((stage, i) => (
            <div className={styles.stage} key={i}>
              <h3>Stage {i + 1}</h3>
              <label className={styles.field}>
                Topology
                <select value={stage.type} onChange={(e) => update(i, "type", e.target.value)}>
                  <option value="non-inverting">Non-inverting</option>
                  <option value="inverting">Inverting</option>
                </select>
              </label>
              <label className={styles.field}>
                {stage.type === "inverting" ? "Input resistor Rin" : "Ground resistor Rg"} (Ω)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stage.rin}
                  onChange={(e) => update(i, "rin", e.target.value)}
                />
              </label>
              <label className={styles.field}>
                Feedback resistor Rf (Ω)
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={stage.rf}
                  onChange={(e) => update(i, "rf", e.target.value)}
                />
              </label>
            </div>
          ))}
          <div className={styles.toolbar}>
            <button
              disabled={stages.length === 8}
              onClick={() =>
                setStages((s) => [...s, { type: "non-inverting", rin: "10000", rf: "10000" }])
              }
            >
              Add stage
            </button>
            <button
              disabled={stages.length === 1}
              onClick={() => {
                setSelected(0);
                setStages((s) => s.slice(0, -1));
              }}
            >
              Remove last stage
            </button>
          </div>
        </section>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>02 / Inspect the cascade</p>
          <h2>Gain, polarity and the actual feedback circuit</h2>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : (
            value && (
              <>
                <div className={styles.result} aria-live="polite">
                  <div className={styles.metric}>
                    <span>Total gain</span>
                    <strong>{fmt(value.totalGain)}×</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Ideal output</span>
                    <strong>{fmt(value.outputVoltage)} V</strong>
                  </div>
                  <div className={styles.metric}>
                    <span>Polarity</span>
                    <strong>{value.inverted ? "Inverted" : "Non-inverted"}</strong>
                  </div>
                </div>
                <div className={styles.toolbar}>
                  {value.stages.map((s, i) => (
                    <button key={i} aria-pressed={selected === i} onClick={() => setSelected(i)}>
                      Stage {i + 1} · {fmt(s.gain)}×
                    </button>
                  ))}
                </div>
                <div
                  className={styles.diagramScroll}
                  tabIndex={0}
                  role="region"
                  aria-label="Selected amplifier stage"
                >
                  <OpAmpStage
                    stage={stages[selected]}
                    input={
                      selected === 0 ? Number(input) : value.stages[selected - 1].outputVoltage
                    }
                    output={value.stages[selected].outputVoltage}
                    index={selected}
                  />
                </div>
              </>
            )
          )}
          <p className={styles.note}>
            Ideal DC/small-signal gain only. Each stage’s output feeds the next input. No supply
            rails, bias point, clipping, bandwidth, noise or output-current limits are simulated. A
            real output cannot exceed its available swing.
          </p>
          <MathEquation
            label="Inverting stage"
            tex={String.raw`A_v=-\frac{R_f}{R_{\mathrm{in}}}`}
          />
          <MathEquation label="Non-inverting stage" tex={String.raw`A_v=1+\frac{R_f}{R_g}`} />
          <MathEquation
            label="Cascaded gain"
            tex={String.raw`A_{v,\mathrm{total}}=\prod_{k=1}^{n}A_{v,k},\qquad V_{\mathrm{out}}=A_{v,\mathrm{total}}V_{\mathrm{in}}`}
          />
        </section>
      </div>
      <section className={styles.explainPanel}>
        <p className={styles.eyebrow}>03 / Package reference</p>
        <h2>Know the pins before wiring</h2>
        <p>
          Select a reference IC, then select a pin. These 8-pin PDIP top views are not
          interchangeable with every package or suffix.
        </p>
        <div className={styles.toolbar}>
          {icReferences.map((item, i) => (
            <button
              key={item.name}
              aria-pressed={part === i}
              onClick={() => {
                setPart(i);
                setPin(1);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className={styles.grid}>
          <div>
            <div className={styles.pinout}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ display: "contents" }}>
                  {[i, 7 - i].map((j) => (
                    <button key={j} aria-pressed={pin === j + 1} onClick={() => setPin(j + 1)}>
                      {ic.pins[j]}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            <p className={styles.caption}>
              Notch at the top: pins 1–4 down the left, 8–5 down the right.
            </p>
          </div>
          <div>
            <h3>
              {ic.name} · pin {pin}
            </h3>
            <p aria-live="polite">{ic.pins[pin - 1]}</p>
            <p>{ic.note}</p>
            <a
              href={`https://www.ti.com/lit/ds/symlink/${ic.name.toLowerCase()}.pdf`}
              target="_blank"
              rel="noreferrer"
            >
              Open manufacturer datasheet ↗
            </a>
          </div>
        </div>
      </section>
      {value && (
        <section className={styles.explainPanel}>
          <h2>Complete cascade circuit</h2>
          <p>
            Show every calculated stage, its feedback resistors and the wire connecting each output
            to the next input. Ground symbols share the same signal reference. Supply and bias
            wiring are not modeled.
          </p>
          <button
            aria-expanded={showFull}
            aria-controls="full-cascade"
            onClick={() => setShowFull((v) => !v)}
          >
            {showFull ? "Hide full circuit" : "Show full circuit"}
          </button>
          {showFull && (
            <div
              id="full-cascade"
              className={styles.diagramScroll}
              tabIndex={0}
              role="region"
              aria-label="Complete cascaded amplifier circuit"
            >
              <svg
                className={styles.diagram}
                viewBox={`0 0 720 ${stages.length * 360}`}
                role="img"
                aria-label="All amplifier stages with connected signal paths"
              >
                {stages.map((stage, i) => (
                  <g key={i}>
                    <svg x="10" y={i * 360} width="700" height="340" viewBox="0 0 700 340">
                      <OpAmpStage
                        stage={stage}
                        input={i === 0 ? Number(input) : value.stages[i - 1].outputVoltage}
                        output={value.stages[i].outputVoltage}
                        index={i}
                      />
                    </svg>
                    {i < stages.length - 1 && (
                      <path
                        d={`M645 ${i * 360 + 185}H695V${i * 360 + 345}H30V${(i + 1) * 360 + (stages[i + 1].type === "inverting" ? 150 : 220)}H65`}
                        stroke="var(--text-accent)"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    )}
                  </g>
                ))}
              </svg>
            </div>
          )}
        </section>
      )}
    </>
  );
}
function OpAmpStage({
  stage,
  input,
  output,
  index
}: {
  stage: Stage;
  input: number;
  output: number;
  index: number;
}) {
  const inv = stage.type === "inverting";
  return (
    <svg
      className={styles.diagram}
      viewBox="0 0 700 340"
      role="img"
      aria-label={`Stage ${index + 1} ${stage.type} amplifier with connected input and feedback resistors`}
    >
      <text x="30" y="30">
        STAGE {index + 1} / {stage.type.toUpperCase()}
      </text>
      <g stroke="currentColor" strokeWidth="2.5" fill="none">
        <path d="M320 120L450 185L320 250Z" />
        <path d="M450 185H635M520 185V75H420M360 75H265V150H320" />
        <rect x="360" y="64" width="60" height="22" />
        {inv ? (
          <>
            <path d="M55 150H135M205 150H265M320 220H275V280M259 280H291M264 287H286M269 294H281" />
            <rect x="135" y="139" width="70" height="22" />
          </>
        ) : (
          <>
            <path d="M55 220H320M265 150H205M135 150H100V180M84 180H116M89 187H111M94 194H106" />
            <rect x="135" y="139" width="70" height="22" />
          </>
        )}
        <circle cx="265" cy="150" r="3" fill="currentColor" />
        <circle cx="520" cy="185" r="3" fill="currentColor" />
      </g>
      <text x="334" y="158">
        −
      </text>
      <text x="334" y="228">
        +
      </text>
      <text x="390" y="53" textAnchor="middle">
        Rf {fmt(Number(stage.rf) / 1000)} kΩ
      </text>
      <text x="170" y="121" textAnchor="middle">
        {inv ? "Rin" : "Rg"} {fmt(Number(stage.rin) / 1000)} kΩ
      </text>
      <text x="55" y={inv ? 185 : 252}>
        In {fmt(input)} V
      </text>
      <text x="530" y="162">
        Out {fmt(output)} V
      </text>
      <text x="350" y="313" textAnchor="middle" className={styles.small}>
        Ideal signal model · supply and bias connections omitted
      </text>
    </svg>
  );
}
