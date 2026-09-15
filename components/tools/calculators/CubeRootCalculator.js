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
import { CubeVolumeDiagram } from "../diagrams/CubeVolumeDiagram";

export function CubeRootCalculator() {
  const [value, setValue] = useState("27");

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.cbrt(n);
  }, [value]);

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel compact visual={result !== null ? (
          <CubeVolumeDiagram
            volume={Number(Number(value).toPrecision(6))}
            edge={Number(result.toPrecision(6))}
            caption="A cube's volume is its edge multiplied by itself three times"
          />
        ) : null}>
        <CalculatorField
          label="Value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {result !== null ? (
          <CalculatorResults>
            <CalculatorResult label="∛x" value={Number(result.toPrecision(6))} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter a number.</p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            Cubing a number means multiplying it by itself twice more - a volume instead of an area. A
            cube root undoes that: it asks what number, multiplied by itself three times, gives you
            this one. Unlike square roots, negative numbers have real cube roots too.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">∛x = y, where y × y × y = x</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              3 × 3 × 3 = 27, so the cube root of 27 is 3. It&rsquo;s the same idea as a square root,
              just one multiplication deeper - which is exactly why it comes up when you&rsquo;re
              working backward from a volume to a side length.
            </p>
          </ToolSection>

          <Mnemonic tag="∛" phrase="What times itself three times gets you here">
            <p>
              Keep a few perfect cubes handy - 1, 8, 27, 64, 125 - the same way you&rsquo;d keep perfect
              squares handy. They cover most of the quick mental checks you&rsquo;ll actually need.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">x = 27</p>
              <p className="step">3 × 3 × 3 = 27</p>
              <p className="step">∛27 = 3</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
