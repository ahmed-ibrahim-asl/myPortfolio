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
import { formatEngineering } from "@/lib/units";
import { CycleTimelineDiagram } from "../diagrams/CycleTimelineDiagram";

export function FrequencyToPeriodCalculator() {
  const [mode, setMode] = useState("frequency");
  const [value, setValue] = useState("50");

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n) || n === 0) return null;
    return 1 / n;
  }, [value]);

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel compact visual={<CycleTimelineDiagram period={mode === "frequency" ? result : Number(value)} caption="Repeats happen back to back, each one lasting one period" />}>
        <CalculatorSelect
          label="I have"
          value={mode}
          onChange={(event) => setMode(event.target.value)}
        >
          <option value="frequency">Frequency (Hz)</option>
          <option value="period">Period (s)</option>
        </CalculatorSelect>
        <CalculatorField
          label={mode === "frequency" ? "Frequency" : "Period"}
          suffix={mode === "frequency" ? "Hz" : "s"}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult
              label={mode === "frequency" ? "Period" : "Frequency"}
              value={formatEngineering(result, mode === "frequency" ? "s" : "Hz")}
            />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a non-zero number.</p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Anything that repeats has two natural ways to describe it: how often it happens
            (frequency) or how long one repeat takes (period). They&rsquo;re not two different
            measurements - they're the same fact turned inside out.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">T = 1 / f</p>
          <p className="mono">f = 1 / T</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              If something happens 50 times a second, one occurrence takes 1/50th of a second - flip the
              frequency over and you get the period. Run it the other way: if one cycle takes 0.02
              seconds, then 1/0.02 = 50 cycles fit into a second. Whichever one you have, dividing 1 by
              it gets you the other.
            </p>
          </ToolSection>

          <Mnemonic tag="f ↔ T" phrase="Flip one, get the other">
            <p>
              There&rsquo;s only one relationship to remember, and it works both directions: whichever
              one you have, 1 divided by it is the other one.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">f = 50 Hz (mains power)</p>
              <p className="step">T = 1 ÷ 50</p>
              <p className="step">T = 0.02 s = 20 ms</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
