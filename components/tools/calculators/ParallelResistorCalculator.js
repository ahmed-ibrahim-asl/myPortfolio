"use client";

import { useMemo, useState } from "react";
import {
  CalculatorField,
  CalculatorLearning,
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  LearningDisclosure,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";
import { formatOhms } from "@/lib/resistorColors";
import { ParallelResistorDiagram } from "../diagrams/ParallelResistorDiagram";

const MIN_RESISTORS = 2;
const MAX_RESISTORS = 6;

export function ParallelResistorCalculator() {
  const [values, setValues] = useState(["220", "330"]);

  const numbers = values.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
  const total = useMemo(() => {
    if (!numbers.length) return null;
    const reciprocalSum = numbers.reduce((sum, n) => sum + 1 / n, 0);
    return reciprocalSum > 0 ? 1 / reciprocalSum : null;
  }, [numbers]);

  function update(index, next) {
    setValues((prev) => prev.map((v, i) => (i === index ? next : v)));
  }

  function addResistor() {
    setValues((prev) => (prev.length >= MAX_RESISTORS ? prev : [...prev, ""]));
  }

  function removeResistor(index) {
    setValues((prev) => (prev.length <= MIN_RESISTORS ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel compact visual={<ParallelResistorDiagram count={values.length} />}>
        {values.map((value, index) => (
          <div className="calculator-list-row" key={index}>
            <CalculatorField
              label={`R${index + 1}`}
              suffix="Ω"
              value={value}
              onChange={(event) => update(index, event.target.value)}
            />
            {values.length > MIN_RESISTORS ? (
              <button
                type="button"
                className="calculator-list-remove"
                onClick={() => removeResistor(index)}
                aria-label={`Remove R${index + 1}`}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        {values.length < MAX_RESISTORS ? (
          <button type="button" className="calculator-list-add" onClick={addResistor}>
            + Add resistor
          </button>
        ) : null}
        <CalculatorResults>
          <CalculatorResult label="Total resistance" value={total ? formatOhms(total) : "-"} />
        </CalculatorResults>
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Wire resistors side by side instead of end to end and current suddenly has more than one
            path home. More paths means less overall opposition - the combined resistance always ends
            up lower than the smallest single resistor in the group.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">1 / R_total = 1/R1 + 1/R2 + 1/R3 + …</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              Each resistor lets through a share of current proportional to how easily it conducts - its
              conductance, which is just 1 ÷ R. Add more paths and you add more conductance, so the
              shares add up. To turn that combined conductance back into a resistance, flip it once more
              at the end.
            </p>
          </ToolSection>

          <Mnemonic tag="FAF" phrase="Flip, Add, Flip">
            <p>
              Flip every resistance to a fraction (1 ÷ R), add the fractions together, then flip the
              total back over. Three steps, same order, every time - no matter how many resistors join
              the party.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">R1 = 220 Ω, R2 = 330 Ω</p>
              <p className="step">1/R_total = 1/220 + 1/330 = 0.00758</p>
              <p className="step">R_total = 1 ÷ 0.00758 ≈ 132 Ω</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
