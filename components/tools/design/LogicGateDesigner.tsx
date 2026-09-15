"use client";
import { useState } from "react";
import { evaluateRules, rulesTruthTable } from "@/lib/tools/logic-design";
import { Gate, Wire, LogicCanvas } from "./LogicSymbols";
import styles from "./DesignLab.module.css";
import ui from "./LogicWorkbench.module.css";

export default function LogicGateDesigner() {
  const [inputs, setInputs] = useState([1, 0]),
    [rules, setRules] = useState([
      [1, 0],
      [0, 1]
    ]),
    [selected, setSelected] = useState("AND");
  const count = inputs.length,
    output = evaluateRules(inputs, rules),
    table = rulesTruthTable(count, rules);
  const explain: Record<string, string> = {
    NOT: "A NOT gate turns a required OFF condition into a high signal. Its output is 1 only when its input is 0.",
    AND: "Each AND gate checks one complete condition. Every connected requirement must be true before that rule becomes 1.",
    OR: "The OR gate combines the rules. The output turns on when any complete rule is true. This sum-of-products network is not necessarily the smallest possible circuit."
  };
  function resize(n: number) {
    setInputs((old) => Array.from({ length: n }, (_, i) => old[i] ?? 0));
    setRules((old) => old.map((row) => Array.from({ length: n }, (_, i) => row[i] ?? -1)));
  }
  return (
    <>
      <section className={styles.panel}>
        <p className={styles.eyebrow}>01 / Describe the behavior</p>
        <h2>When should the output turn on?</h2>
        <p>
          Choose the input conditions. Requirements within a row are combined with AND; separate
          rows are combined with OR. No Boolean expression is needed.
        </p>
        <div className={styles.toolbar}>
          <label>
            Number of inputs
            <select
              aria-label="Number of inputs"
              value={count}
              onChange={(e) => resize(Number(e.target.value))}
            >
              {[2, 3, 4].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() =>
              setRules([
                [1, ...Array(count - 1).fill(0)],
                [0, 1, ...Array(count - 2).fill(-1)]
              ])
            }
          >
            Reset to example rules
          </button>
        </div>
        <p className={styles.caption}>The example turns Y on when A is ON and all other inputs are OFF, or when A is OFF and B is ON. Resetting replaces your current rules; input switches stay unchanged.</p>
        <div className={ui.rules}>
          {rules.map((row, r) => (
            <div className={ui.rule} key={r}>
              <b>{r === 0 ? "WHEN" : "OR WHEN"}</b>
              {row.map((v, i) => (
                <label className={styles.field} key={i}>
                  Input {String.fromCharCode(65 + i)}
                  <select
                    aria-label={`Rule ${r + 1} input ${String.fromCharCode(65 + i)}`}
                    value={v}
                    onChange={(e) =>
                      setRules((old) =>
                        old.map((a, j) =>
                          j === r ? a.map((b, k) => (k === i ? Number(e.target.value) : b)) : a
                        )
                      )
                    }
                  >
                    <option value="1">Is ON · 1</option>
                    <option value="0">Is OFF · 0</option>
                    <option value="-1">Does not matter</option>
                  </select>
                </label>
              ))}
              <button
                aria-label={`Remove rule ${r + 1}`}
                disabled={rules.length === 1}
                onClick={() => setRules((old) => old.filter((_, i) => i !== r))}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className={styles.toolbar}>
          <button
            disabled={rules.length >= 4}
            onClick={() => setRules((old) => [...old, Array(count).fill(-1)])}
          >
            + Add alternative condition
          </button>
          <span>Up to four rules. An all-ignored rule always turns Y on.</span>
        </div>
      </section>
      <div className={ui.workspace}>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>02 / Test the circuit</p>
          <h2>Your generated gate network</h2>
          <div className={styles.toolbar}>
            {inputs.map((v, i) => (
              <button
                key={i}
                aria-pressed={Boolean(v)}
                onClick={() => setInputs((old) => old.map((n, j) => (j === i ? 1 - n : n)))}
              >
                Input {String.fromCharCode(65 + i)} · {v}
              </button>
            ))}
            <output className={ui.output} aria-live="polite">
              Y = {output}
            </output>
          </div>
          <div
            className={styles.diagramScroll}
            tabIndex={0}
            role="region"
            aria-label="Generated logic circuit"
          >
            <LogicCanvas
              height={rules.length * 150 + 80}
              label="Interactive generated NOT, AND and OR logic circuit"
            >
              {rules.map((row, r) => {
                const cy = 85 + r * 150,
                  active = row.every((v, i) => v === -1 || v === inputs[i]);
                const terms = row.map((v, i) => ({ v, i })).filter((t) => t.v !== -1);
                return (
                  <g key={r}>
                    <text x="24" y={cy - 56} fill="currentColor" fontSize="12">
                      RULE {r + 1}
                    </text>
                    {(terms.length ? terms : [{ v: -1, i: -1 }]).map(({ v, i }, j) => {
                      const y = cy + (j - (Math.max(terms.length, 1) - 1) / 2) * 24;
                      const on = i < 0 || inputs[i] === v;
                      return (
                        <g key={i}>
                          <text x="24" y={y + 5} fill="currentColor" fontSize="14">
                            {i < 0 ? "1" : String.fromCharCode(65 + i)}
                            {i >= 0 ? ` = ${inputs[i]}` : ""}
                          </text>
                          <Wire
                            d={`M82 ${y}H${v === 0 ? 120 : 260}`}
                            on={i < 0 || Boolean(inputs[i])}
                          />
                          {v === 0 && (
                            <>
                              <g transform={`translate(120 ${y}) scale(.38)`}>
                                <Gate type="NOT" x={0} y={0} on={on} />
                              </g>
                              <Wire d={`M144.4 ${y}H260`} on={on} />
                            </>
                          )}
                          <Wire
                            d={`M260 ${y}L285 ${cy + (j - (Math.max(terms.length, 1) - 1) / 2) * 12}`}
                            on={on}
                          />
                        </g>
                      );
                    })}
                    <Gate
                      type="AND"
                      x={285}
                      y={cy}
                      on={active}
                      label={`Rule ${r + 1} = ${Number(active)}`}
                      onSelect={() => setSelected("AND")}
                    />
                    <Wire
                      d={`M345 ${cy}H${390 + r * 16}V${(rules.length * 150 + 80) / 2 + (r - (rules.length - 1) / 2) * 14}H514`}
                      on={active}
                    />
                  </g>
                );
              })}
              <Gate
                type="OR"
                x={500}
                y={(rules.length * 150 + 80) / 2}
                on={Boolean(output)}
                onSelect={() => setSelected("OR")}
              />
              <Wire d={`M564 ${(rules.length * 150 + 80) / 2}H625`} on={Boolean(output)} />
              <text x="630" y={(rules.length * 150 + 80) / 2 + 5} fill="currentColor">
                Y {output}
              </text>
            </LogicCanvas>
          </div>
          <div className={styles.toolbar}>
            {["NOT", "AND", "OR"].map((g) => (
              <button key={g} aria-pressed={selected === g} onClick={() => setSelected(g)}>
                Inspect {g}
              </button>
            ))}
          </div>
          <p className={styles.note} aria-live="polite">
            {explain[selected]}
          </p>
        </section>
        <section className={styles.panel}>
          <p className={styles.eyebrow}>03 / Verify every case</p>
          <h2>Truth table</h2>
          <p>The highlighted row is the current input. Select a row to test it.</p>
          <table className={styles.truth}>
            <thead>
              <tr>
                {inputs.map((_, i) => (
                  <th key={i}>{String.fromCharCode(65 + i)}</th>
                ))}
                <th>Y</th>
                <th>Test</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, r) => (
                <tr
                  key={r}
                  className={row.inputs.every((v, i) => v === inputs[i]) ? ui.activeRow : undefined}
                >
                  {row.inputs.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                  <td>
                    <b>{row.y}</b>
                  </td>
                  <td>
                    <button
                      aria-label={`Test input ${row.inputs.join("")}`}
                      onClick={() => setInputs(row.inputs)}
                    >
                      Try
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <section className={styles.explainPanel}>
        <h2>From a rule to real electronics</h2>
        <p>
          OFF requirements use inverters, complete conditions use AND gates, and alternatives use OR
          gates. Gates with more than two inputs can be decomposed into cascaded two-input gates.
          This draws the functional network, not an IC pinout or transistor-level design.
        </p>
        <p>
          A logic output is a signal, not a motor or relay driver. Select compatible logic voltage
          levels, then design a separate output stage for load current, voltage, inductive kick and
          heat. Mechanical switches need debouncing; unused IC inputs must not float.
        </p>
      </section>
    </>
  );
}
