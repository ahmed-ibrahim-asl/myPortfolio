"use client";

import { useMemo, useState } from "react";
import {
  CalculatorField,
  CalculatorLearning,
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  CalculatorSelect,
  LearningDisclosure,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";

const MODE_LABELS = {
  acceleration: "Acceleration",
  finalVelocity: "Final velocity",
  initialVelocity: "Initial velocity",
  time: "Time"
};

const MODE_UNITS = {
  acceleration: "m/s²",
  finalVelocity: "m/s",
  initialVelocity: "m/s",
  time: "s"
};

const INPUT_LABELS = {
  acceleration: [
    { key: "vi", label: "Initial velocity", suffix: "m/s" },
    { key: "vf", label: "Final velocity", suffix: "m/s" },
    { key: "t", label: "Time", suffix: "s" }
  ],
  finalVelocity: [
    { key: "vi", label: "Initial velocity", suffix: "m/s" },
    { key: "a", label: "Acceleration", suffix: "m/s²" },
    { key: "t", label: "Time", suffix: "s" }
  ],
  initialVelocity: [
    { key: "vf", label: "Final velocity", suffix: "m/s" },
    { key: "a", label: "Acceleration", suffix: "m/s²" },
    { key: "t", label: "Time", suffix: "s" }
  ],
  time: [
    { key: "vi", label: "Initial velocity", suffix: "m/s" },
    { key: "vf", label: "Final velocity", suffix: "m/s" },
    { key: "a", label: "Acceleration", suffix: "m/s²" }
  ]
};

function compute(mode, values) {
  const { vi, vf, t, a } = values;
  if (mode === "acceleration") {
    if (t === 0) return null;
    return (vf - vi) / t;
  }
  if (mode === "finalVelocity") return vi + a * t;
  if (mode === "initialVelocity") return vf - a * t;
  if (mode === "time") {
    if (a === 0) return null;
    return (vf - vi) / a;
  }
  return null;
}

export function AccelerationCalculator() {
  const [mode, setMode] = useState("acceleration");
  const [values, setValues] = useState({ vi: "0", vf: "20", t: "4", a: "5" });

  const inputs = INPUT_LABELS[mode];
  const numeric = Object.fromEntries(
    Object.entries(values).map(([key, raw]) => [key, Number(raw)])
  );
  const result = useMemo(() => {
    if (!inputs.every(({ key }) => Number.isFinite(numeric[key]))) return null;
    return compute(mode, numeric);
  }, [mode, values]);

  function updateField(key, raw) {
    setValues((prev) => ({ ...prev, [key]: raw }));
  }

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel>
        <CalculatorSelect
          label="Solve for"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          {Object.entries(MODE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </CalculatorSelect>
        {inputs.map((field) => (
          <CalculatorField
            key={field.key}
            label={field.label}
            suffix={field.suffix}
            value={values[field.key]}
            onChange={(event) => updateField(field.key, event.target.value)}
          />
        ))}
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label={MODE_LABELS[mode]}
              value={Number(result.toPrecision(4))}
              unit={MODE_UNITS[mode]}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">
            Enter valid numbers{mode === "acceleration" || mode === "time" ? "; the divisor can't be zero" : ""}.
          </p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Acceleration isn&rsquo;t speed - it&rsquo;s how fast speed itself is changing. A car
            holding a steady 60 km/h has zero acceleration no matter how fast it&rsquo;s going; a car
            going from 0 to 60 in five seconds has a lot.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">a = (v_f − v_i) / t</p>
          <p>
            a is acceleration in m/s², v_f and v_i are final and initial velocity in m/s, t is time in
            seconds.
          </p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              Take the velocity you ended with, subtract the velocity you started with, and that
              difference is how much speed you gained (or lost). Spread that gain over however long it
              took to happen, and you get a rate - the gain per second, which is exactly what
              acceleration means.
            </p>
          </ToolSection>

          <Mnemonic tag="Δv / t" phrase="Change in speed, spread over time">
            <p>
              Acceleration is just a rate, like speed itself is a rate. Speed is distance change over
              time; acceleration is speed change over time - one level up.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">v_i = 0 m/s, v_f = 20 m/s, t = 4 s</p>
              <p className="step">a = (20 − 0) / 4</p>
              <p className="step">a = 5 m/s²</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
