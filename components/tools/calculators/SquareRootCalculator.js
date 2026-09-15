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
import { SquareAreaDiagram } from "../diagrams/SquareAreaDiagram";

export function SquareRootCalculator() {
  const [value, setValue] = useState("144");

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.sqrt(n);
  }, [value]);

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel compact visual={result !== null ? (
          <SquareAreaDiagram
            area={Number(Number(value).toPrecision(6))}
            side={Number(result.toPrecision(6))}
            caption="A square's area is its side multiplied by itself"
          />
        ) : null}>
        <CalculatorField
          label="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult label="√x" value={Number(result.toPrecision(6))} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a number that&rsquo;s zero or positive.</p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Squaring a number means multiplying it by itself. A square root undoes that - it asks
            &ldquo;what number, multiplied by itself, gives me this?&rdquo; It shows up anywhere areas
            turn back into side lengths, or RMS calculations turn power back into voltage.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">√x = y, where y × y = x</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              12 × 12 = 144, so the square root of 144 is 12 - the operation just runs backward.
              There&rsquo;s no simple arithmetic shortcut for most numbers (that&rsquo;s why calculators
              exist for this), but the idea stays the same: find the number that, squared, lands exactly
              on your target.
            </p>
          </ToolSection>

          <Mnemonic tag="√" phrase="What times itself gets you here">
            <p>
              Keep a handful of perfect squares memorized - 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 - and
              you can eyeball most everyday square roots, or at least bracket them, without reaching for
              a calculator.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">x = 144</p>
              <p className="step">12 × 12 = 144</p>
              <p className="step">√144 = 12</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
