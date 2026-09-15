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
import { BitStrip } from "../BitStrip";
import { onesComplement, toBinaryString } from "@/lib/numberSystems";

const WIDTHS = [4, 8, 16];

export function OnesComplementCalculator() {
  const [value, setValue] = useState("18");
  const [bits, setBits] = useState(8);

  const result = useMemo(() => {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n >= 2 ** bits) return null;
    return onesComplement(n, bits);
  }, [value, bits]);

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel>
        <CalculatorField
          label="Value (decimal)"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <CalculatorSelect
          label="Bit width"
          value={bits}
          onChange={(event) => setBits(Number(event.target.value))}
        >
          {WIDTHS.map((w) => (
            <option key={w} value={w}>
              {w}-bit
            </option>
          ))}
        </CalculatorSelect>
        {result !== null ? (
          <>
            <p className="bit-strip-caption">Original</p>
            <BitStrip bits={toBinaryString(Number(value), bits)} label="Original bits" />
            <p className="bit-strip-caption">Every bit flipped</p>
            <BitStrip bits={toBinaryString(result, bits)} label="Complement bits" />
            <CalculatorResults>
              <CalculatorResult label="One's complement" value={toBinaryString(result, bits)} />
              <CalculatorResult label="As decimal" value={result} />
            </CalculatorResults>
          </>
        ) : (
          <p className="muted">Enter a whole number that fits in the chosen bit width.</p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            One&rsquo;s complement is the simplest operation you can do to a binary number: flip every
            bit. Every 0 becomes a 1 and every 1 becomes a 0. It looks trivial, but it&rsquo;s the
            first of two steps computers use to represent negative numbers in binary.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">complement = NOT(value)</p>
          <p>Applied bit by bit, at whatever bit width you&rsquo;re working in.</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              Write out the number in binary at a fixed width, then invert each digit in place - no
              carrying, no borrowing, just a straight swap. Whatever bits were 1s are now 0s and vice
              versa. The result is the number&rsquo;s complement: together, the original and its
              one&rsquo;s complement always add up to all 1s.
            </p>
          </ToolSection>

          <Mnemonic tag="NOT" phrase="Every bit becomes what it wasn't">
            <p>
              No math, just opposites. If you can flip a light switch, you can do one&rsquo;s
              complement.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">18 in 8-bit binary: 00010010</p>
              <p className="step">Flip every bit: 11101101</p>
              <p className="step">= 237 (unsigned)</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
