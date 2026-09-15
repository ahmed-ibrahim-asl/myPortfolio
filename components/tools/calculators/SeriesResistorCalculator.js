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
import { SeriesResistorDiagram } from "../diagrams/SeriesResistorDiagram";

const MIN_RESISTORS = 2;
const MAX_RESISTORS = 8;

export function SeriesResistorCalculator() {
  const [values, setValues] = useState(["220", "330", "470"]);

  const numbers = values.map((v) => Number(v)).filter((n) => Number.isFinite(n) && n > 0);
  const total = useMemo(() => numbers.reduce((sum, n) => sum + n, 0), [numbers]);

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
      <CalculatorPanel compact visual={<SeriesResistorDiagram count={values.length} />}>
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
          <CalculatorResult label="Total resistance" value={formatOhms(total)} />
        </CalculatorResults>
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Chain resistors one after another - same current has to squeeze through every one of them
            in turn - and each resistor adds its own bit of opposition on top of the last.
            There&rsquo;s no shortcut here and no need for one.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">R_total = R1 + R2 + R3 + …</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              Current has exactly one path to follow through a series chain, so whatever resistance the
              first resistor adds, the second adds more on top, and the third more still. The total
              opposition the current feels is just those oppositions stacked up.
            </p>
          </ToolSection>

          <Mnemonic tag="Series stacks" phrase="Same line, so just add">
            <p>
              If the resistors sit on one single wire, one after another, the math is the easy kind: add
              them. Save the flipping and dividing for when they sit side by side instead.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">R1 = 220 Ω, R2 = 330 Ω, R3 = 470 Ω</p>
              <p className="step">R_total = 220 + 330 + 470</p>
              <p className="step">R_total = 1,020 Ω</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
