"use client";
import { useState } from "react";
import { stepMemory } from "@/lib/tools/control-design";
import { Gate, Wire, LogicCanvas } from "./LogicSymbols";
import MathEquation from "./MathEquation";
import styles from "./DesignLab.module.css";
import ui from "./LogicWorkbench.module.css";

const modes: Record<
  string,
  {
    title: string;
    name: string;
    why: string;
    inputs: string[];
    tex: string;
    part: string;
    url: string;
  }
> = {
  d: {
    title: "Capture an input on a pulse",
    name: "D flip-flop",
    why: "D is copied to Q only at the rising clock edge. Changing D between pulses does not change the stored bit.",
    inputs: ["d"],
    tex: String.raw`Q^{+}=D`,
    part: "SN74HC74 · positive-edge D flip-flop",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc74.pdf"
  },
  sr: {
    title: "Set / reset immediately",
    name: "SR latch · cross-coupled NOR",
    why: "Set remembers 1; reset remembers 0. Releasing both controls holds the previous state. Both high is forbidden.",
    inputs: ["s", "r"],
    tex: String.raw`Q=\overline{R+\overline{Q}}`,
    part: "SN74HC02 · two NOR gates from a quad package",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc02.pdf"
  },
  jk: {
    title: "Hold / set / reset / toggle",
    name: "JK flip-flop",
    why: "J/K = 00 holds, 10 sets, 01 resets, and 11 toggles. This model uses a rising clock edge.",
    inputs: ["j", "k"],
    tex: String.raw`Q^{+}=J\overline{Q}+\overline{K}Q`,
    part: "CD4027B · positive-edge JK flip-flop",
    url: "https://www.ti.com/lit/ds/symlink/cd4027b.pdf"
  },
  t: {
    title: "Toggle on selected pulses",
    name: "T flip-flop",
    why: "When T is on, each pulse reverses Q. With T off, the stored bit holds. A D flip-flop plus XOR implements this behavior.",
    inputs: ["t"],
    tex: String.raw`Q^{+}=T\oplus Q`,
    part: "SN74HC74 + SN74HC86 XOR",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc74.pdf"
  },
  counter: {
    title: "Count incoming pulses",
    name: "Synchronous binary counter",
    why: "Each rising edge adds one. All bits update together; the count wraps to zero after the largest value.",
    inputs: [],
    tex: String.raw`Q^{+}=(Q+1)\bmod 2^n`,
    part: "D flip-flop bank + increment logic",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc74.pdf"
  },
  shift: {
    title: "Shift serial bits",
    name: "Serial-in shift register",
    why: "Each rising edge shifts every bit toward the most significant end. The serial input enters Q0 and the oldest bit is discarded.",
    inputs: ["d"],
    tex: String.raw`Q^{+}=(2Q+D)\bmod 2^n`,
    part: "D flip-flops connected Q → next D",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc74.pdf"
  },
  register: {
    title: "Capture a parallel word",
    name: "Parallel register",
    why: "One shared rising clock edge captures the entire input word. The word holds between clock edges.",
    inputs: [],
    tex: String.raw`Q_i^{+}=D_i`,
    part: "Parallel bank of D flip-flops",
    url: "https://www.ti.com/lit/ds/symlink/sn74hc74.pdf"
  }
};
export default function ControlDesignAssistant() {
  const [mode, setMode] = useState("d"),
    [bits, setBits] = useState(4),
    [q, setQ] = useState(0),
    [inputs, setInputs] = useState<Record<string, number>>({
      d: 1,
      j: 0,
      k: 0,
      s: 0,
      r: 0,
      t: 1,
      word: 0
    }),
    [history, setHistory] = useState<number[]>([0]),
    [error, setError] = useState("");
  const config = modes[mode],
    multi = ["counter", "shift", "register"].includes(mode),
    width = multi ? bits : 1;
  let next = q;
  try {
    next = stepMemory(mode, q, inputs, true, width);
  } catch {}
  function record(value: number) {
    setQ(value);
    setHistory((old) => [...old.slice(-7), value]);
  }
  function changeInput(key: string, value: number) {
    const updated = { ...inputs, [key]: value };
    setInputs(updated);
    setError("");
    if (mode === "sr") {
      try {
        record(stepMemory(mode, q, updated, false, 1));
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }
  function reset() {
    setQ(0);
    setHistory([0]);
    setError("");
    setInputs({ d: 1, j: 0, k: 0, s: 0, r: 0, t: 1, word: 0 });
  }
  const rows: string[][] =
    mode === "jk"
      ? [
          ["0", "0", String(q)],
          ["0", "1", "0"],
          ["1", "0", "1"],
          ["1", "1", String(1 - q)]
        ]
      : mode === "sr"
        ? [
            ["0", "0", String(q)],
            ["0", "1", "0"],
            ["1", "0", "1"],
            ["1", "1", "Forbidden"]
          ]
        : mode === "t"
          ? [
              ["0", String(q)],
              ["1", String(1 - q)]
            ]
          : mode === "d"
            ? [
                ["0", "0"],
                ["1", "1"]
              ]
            : [[q.toString(2).padStart(width, "0"), next.toString(2).padStart(width, "0")]];
  const headers =
    mode === "jk"
      ? ["J", "K", "Next Q"]
      : mode === "sr"
        ? ["S", "R", "Q"]
        : mode === "t"
          ? ["T", "Next Q"]
          : mode === "d"
            ? ["D", "Next Q"]
            : ["Current word", "After pulse"];
  return (
    <>
      <div className={styles.grid}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>01 / Start with intent</p>
          <h2>What should be remembered?</h2>
          <label className={styles.field}>
            I want to…
            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                reset();
              }}
            >
              {Object.entries(modes).map(([id, m]) => (
                <option key={id} value={id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
          {multi && (
            <label className={styles.field}>
              Stored bits
              <select
                value={bits}
                onChange={(e) => {
                  setBits(Number(e.target.value));
                  reset();
                }}
              >
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          )}
          <p>{config.why}</p>
          <p className={styles.note}>
            Start with the behavior, then learn its circuit name. The options are separate so
            contradictory requests cannot silently override one another.
          </p>
        </section>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>Recommended memory circuit</p>
          <h2>{config.name}</h2>
          <div className={ui.bits} aria-live="polite">
            {Array.from({ length: width }, (_, i) => width - i - 1).map((i) => (
              <div className={ui.bit} key={i}>
                <span>Q{width > 1 ? i : ""}</span>
                <strong>{(q >> i) & 1}</strong>
              </div>
            ))}
          </div>
          <div className={styles.toolbar}>
            {config.inputs.map((key) => (
              <button
                key={key}
                aria-pressed={Boolean(inputs[key])}
                onClick={() => changeInput(key, 1 - inputs[key])}
              >
                {key === "d" && mode === "shift" ? "Serial D" : key.toUpperCase()} = {inputs[key]}
              </button>
            ))}
            {mode === "register" &&
              Array.from({ length: width }, (_, i) => (
                <button
                  key={i}
                  aria-pressed={Boolean((inputs.word >> i) & 1)}
                  onClick={() => changeInput("word", inputs.word ^ (1 << i))}
                >
                  D{i} = {(inputs.word >> i) & 1}
                </button>
              ))}
            {mode !== "sr" && (
              <button
                onClick={() => {
                  setError("");
                  try {
                    record(stepMemory(mode, q, inputs, true, width));
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                Send rising clock pulse ↑
              </button>
            )}
            <button onClick={reset}>Restart simulation</button>
          </div>
          {error && (
            <p className={styles.error} role="alert">
              {error} Release one control to recover. The display preserves the last valid state; it
              does not predict an invalid physical latch state.
            </p>
          )}
          <p>
            {mode === "sr"
              ? "Controls act immediately."
              : "Input changes do not clock the circuit. Press the pulse button to update memory."}
          </p>
          <div className={ui.history} aria-label="Recent captured states">
            {history.map((v, i) => (
              <span key={i}>{v.toString(2).padStart(width, "0")}</span>
            ))}
          </div>
        </section>
      </div>
      <div className={ui.workspace}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>02 / Follow the signals</p>
          <h2>Inside the selected circuit</h2>
          <div
            className={styles.diagramScroll}
            tabIndex={0}
            role="region"
            aria-label="Memory logic schematic"
          >
            <MemoryCircuit mode={mode} q={q} inputs={inputs} bits={width} />
          </div>
          <p className={styles.caption}>
            Gold traces are logic 1; neutral traces are logic 0. Named Q nets refer to the same
            stored output. These are functional gate-level equivalents, not the internal transistor
            layout of a particular IC.
          </p>
        </section>
        <section className={styles.panel}>
          <h2>{multi ? "State transition" : "Truth table"}</h2>
          <p>
            {mode === "sr"
              ? "Level-sensitive behavior."
              : "Next Q is captured on the rising edge; otherwise Q holds."}
          </p>
          <table className={styles.truth}>
            <thead>
              <tr>
                {headers.map((cell, i) => (
                  <th key={i}>{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td key={`${r}-${c}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <MathEquation tex={config.tex} label="State equation" />
        </section>
      </div>
      <section className={styles.explainPanel}>
        <h2>From the model to a real circuit</h2>
        <p>
          <a href={config.url} target="_blank" rel="noreferrer">
            Reference: {config.part} ↗
          </a>
        </p>
        <p>
          The simulator starts at zero for teaching; real memory may power up unknown. Provide a
          defined reset circuit. Respect setup/hold times, logic thresholds, supply decoupling and
          the exact device’s clock edge. The SN74HC74 has active-low asynchronous preset/clear;
          those package pins are not the same thing as the abstract S/R inputs of a NOR latch.
        </p>
        <p>
          Digital simulation does not calculate metastability, propagation delays or load current.
          Debounce physical buttons, and use a separately rated transistor or driver stage for
          motors, relays and other loads.
        </p>
      </section>
    </>
  );
}

function CounterRow({ index: i, q }: { index: number; q: number }) {
  const bit = (q >> i) & 1,
    carry = (q & (2 ** i - 1)) === 2 ** i - 1,
    next = Boolean(bit ^ Number(carry));
  return (
    <g transform={`translate(0 ${i * 180 + 15})`}>
      <text x="20" y="18" fill="currentColor" fontSize="12">
        BIT {i} · NEXT-STATE LOGIC
      </text>
      {i === 0 ? (
        <>
          <text x="40" y="65" fill="currentColor">
            Q0 = {bit}
          </text>
          <Wire d="M120 60H290" on={Boolean(bit)} />
          <Gate type="NOT" x={290} y={60} on={next} />
        </>
      ) : (
        <>
          <text x="205" y="35" fill="currentColor">
            Q{i} = {bit}
          </text>
          <Wire d="M260 30H275V45H304" on={Boolean(bit)} />
          {i === 1 ? (
            <>
              <text x="40" y="95" fill="currentColor">
                Q0 = {q & 1}
              </text>
              <Wire d="M120 90H250V75H304" on={carry} />
            </>
          ) : (
            <>
              {Array.from({ length: i }, (_, j) => (
                <g key={j}>
                  <text x="35" y={70 + j * 12} fill="currentColor" fontSize="11">
                    Q{j} = {(q >> j) & 1}
                  </text>
                  <Wire
                    d={`M100 ${66 + j * 12}H145L165 ${90 + (j - (i - 1) / 2) * 7}`}
                    on={Boolean((q >> j) & 1)}
                  />
                </g>
              ))}
              <Gate type="AND" x={165} y={90} on={carry} />
              <Wire d="M225 90H250V75H304" on={carry} />
            </>
          )}
          <Gate type="XOR" x={290} y={60} on={next} />
        </>
      )}
      <Wire d="M354 60H420" on={next} />
      <MemoryCell x={420} y={34} q={bit} />
      <Wire d="M514 60H580" on={Boolean(bit)} />
      <text x="590" y="65" fill="currentColor">
        Q{i}
      </text>
      <Wire d="M325 108H420" />
      <text x="270" y="112" fill="currentColor" fontSize="13">
        CLK ↑
      </text>
    </g>
  );
}
function MemoryCell({ x, y, q, label = "D" }: { x: number; y: number; q: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        width="94"
        height="100"
        fill="var(--bg-surface)"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text x="14" y="31" fill="currentColor">
        {label}
      </text>
      <path d="M0 66L12 74L0 82" fill="none" stroke="currentColor" strokeWidth="2" />
      <text x="59" y="31" fill="currentColor">
        Q
      </text>
      <text x="40" y="63" fill="var(--text-accent)" fontSize="24">
        {q}
      </text>
    </g>
  );
}
function MemoryCircuit({
  mode,
  q,
  inputs,
  bits
}: {
  mode: string;
  q: number;
  inputs: Record<string, number>;
  bits: number;
}) {
  if (mode === "sr")
    return (
      <LogicCanvas height={330} label="SR latch with two cross-coupled NOR gates">
        <text x="55" y="88" fill="currentColor">
          R = {inputs.r}
        </text>
        <text x="55" y="248" fill="currentColor">
          S = {inputs.s}
        </text>
        <Wire d="M115 85H254" on={Boolean(inputs.r)} />
        <Wire d="M115 245H254" on={Boolean(inputs.s)} />
        <Wire d="M316 100H495" on={Boolean(q)} />
        <Wire d="M316 230H495" on={!q} />
        <Wire d="M405 100V170H185V215H254" on={Boolean(q)} />
        <Wire d="M440 230V155H165V115H254" on={!q} />
        <Gate type="NOR" x={240} y={100} on={Boolean(q)} />
        <Gate type="NOR" x={240} y={230} on={!q} />
        <text x="505" y="105" fill="currentColor">
          Q = {q}
        </text>
        <text x="505" y="235" fill="currentColor">
          Q̅ = {1 - q}
        </text>
        <circle cx="405" cy="100" r="4" fill="currentColor" />
        <circle cx="440" cy="230" r="4" fill="currentColor" />
      </LogicCanvas>
    );
  if (mode === "jk" || mode === "t") {
    const a = Boolean(inputs.j && !q),
      b = Boolean(!inputs.k && q),
      next = mode === "t" ? Boolean(inputs.t ^ q) : a || b;
    return (
      <LogicCanvas
        height={340}
        label={`${mode.toUpperCase()} equivalent next-state gates feeding a D flip-flop`}
      >
        {mode === "jk" ? (
          <>
            <text x="20" y="74" fill="currentColor">
              J = {inputs.j}
            </text>
            <text x="20" y="104" fill="currentColor">
              Q̅ = {1 - q}
            </text>
            <text x="20" y="204" fill="currentColor">
              K̅ = {1 - inputs.k}
            </text>
            <text x="20" y="234" fill="currentColor">
              Q = {q}
            </text>
            <Wire d="M95 70H150" on={Boolean(inputs.j)} />
            <Wire d="M95 100H150" on={!q} />
            <Wire d="M95 200H150" on={!inputs.k} />
            <Wire d="M95 230H150" on={Boolean(q)} />
            <Gate type="AND" x={150} y={85} on={a} />
            <Gate type="AND" x={150} y={215} on={b} />
            <Wire d="M210 85H270V135H324" on={a} />
            <Wire d="M210 215H285V165H324" on={b} />
            <Gate type="OR" x={310} y={150} on={next} />
            <Wire d="M374 150H460" on={next} />
          </>
        ) : (
          <>
            <text x="55" y="134" fill="currentColor">
              T = {inputs.t}
            </text>
            <text x="55" y="174" fill="currentColor">
              Q = {q}
            </text>
            <Wire d="M130 130H264" on={Boolean(inputs.t)} />
            <Wire d="M130 170H264" on={Boolean(q)} />
            <Gate type="XOR" x={250} y={150} on={next} />
            <Wire d="M314 150H460" on={next} />
          </>
        )}
        <MemoryCell x={460} y={124} q={q} />
        <Wire d="M554 150H610" on={Boolean(q)} />
        <text x="615" y="155" fill="currentColor">
          Q {q}
        </text>
        <Wire d="M355 198H460" />
        <text x="340" y="235" fill="currentColor">
          CLK ↑
        </text>
        <text x="24" y="300" fill="currentColor" fontSize="13">
          Q and Q̅ are feedback nets. Complemented inputs use NOT gates.
        </text>
      </LogicCanvas>
    );
  }
  if (mode === "counter")
    return (
      <LogicCanvas
        height={bits * 180 + 20}
        label="Synchronous counter with lower-bit carry AND gates and XOR next-state gates"
      >
        {Array.from({ length: bits }, (_, i) => (
          <CounterRow key={i} index={i} q={q} />
        ))}
      </LogicCanvas>
    );
  const height = bits * 145 + 60;
  return (
    <LogicCanvas height={Math.max(height, 230)} label={`${mode} bank of clocked D memory cells`}>
      {Array.from({ length: bits }, (_, i) => {
        const y = 35 + i * 145,
          bit = (q >> i) & 1;
        const d =
          mode === "counter"
            ? ((q + 1) >> i) & 1
            : mode === "shift"
              ? i === 0
                ? inputs.d
                : (q >> (i - 1)) & 1
              : mode === "register"
                ? (inputs.word >> i) & 1
                : inputs.d;
        return (
          <g key={i}>
            <text x="24" y={y + 16} fill="currentColor" fontSize="13">
              {mode === "counter"
                ? `D${i} = ${i === 0 ? "NOT Q0" : `Q${i} XOR (${Array.from({ length: i }, (_, j) => `Q${j}`).join(" AND ")})`}`
                : mode === "shift"
                  ? i === 0
                    ? "Serial input D"
                    : `Previous stage Q${i - 1}`
                  : mode === "register"
                    ? `Parallel input D${i}`
                    : "Data input D"}
            </text>
            {mode === "counter" ? (
              <>
                <text x="25" y={y + 66} fill="currentColor">
                  {i === 0 ? "Q0" : `Q${i}, carry`}
                </text>
                <Wire d={`M120 ${y + 61}H195`} on={Boolean(bit)} />
                <Gate type={i === 0 ? "NOT" : "XOR"} x={195} y={y + 61} on={Boolean(d)} />
                <Wire d={`M259 ${y + 61}H370`} on={Boolean(d)} />
              </>
            ) : (
              <>
                <text x="75" y={y + 66} fill="currentColor">
                  {d}
                </text>
                <Wire d={`M110 ${y + 61}H370`} on={Boolean(d)} />
              </>
            )}
            <MemoryCell x={370} y={y + 35} q={bit} />
            <Wire d={`M464 ${y + 61}H570`} on={Boolean(bit)} />
            <text x="580" y={y + 66} fill="currentColor">
              Q{i} = {bit}
            </text>
            <Wire d={`M300 ${y + 109}H370`} />
            <text x="240" y={y + 114} fill="currentColor" fontSize="13">
              CLK ↑
            </text>
          </g>
        );
      })}
    </LogicCanvas>
  );
}
