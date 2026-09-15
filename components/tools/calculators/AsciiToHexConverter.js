"use client";

import { useMemo, useState } from "react";
import {
  CalculatorLearning,
  CalculatorPanel,
  CalculatorResult,
  CalculatorResults,
  CalculatorTextArea,
  LearningDisclosure,
  Mnemonic,
  ToolSection,
  WorkedExample
} from "../CalculatorUI";
import { asciiToHex } from "@/lib/numberSystems";

// Renders each character's own token so spaces and newlines stay visible instead of collapsing
// into invisible gaps in the hex output.
function visibleChar(char) {
  if (char === " ") return "·";
  if (char === "\n") return "↵";
  if (char === "\t") return "⇥";
  return char;
}

export function AsciiToHexConverter() {
  const [text, setText] = useState("Hi there!");

  const hex = useMemo(() => (text ? asciiToHex(text) : ""), [text]);
  const chars = Array.from(text);
  const hexTokens = hex ? hex.split(" ") : [];

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel>
        <CalculatorTextArea
          label="Text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {chars.length ? (
          <>
            <p className="bit-strip-caption">Characters (· = space, ↵ = newline)</p>
            <div className="bit-strip">
              {chars.map((char, index) => (
                <span key={index} className="bit-cell">
                  {visibleChar(char)}
                </span>
              ))}
            </div>
            <p className="bit-strip-caption">Hex bytes</p>
            <div className="bit-strip">
              {hexTokens.map((token, index) => (
                <span key={index} className="bit-cell">
                  {token}
                </span>
              ))}
            </div>
          </>
        ) : null}
        <CalculatorResults>
          <CalculatorResult label="Hex bytes" value={hex || "-"} />
        </CalculatorResults>
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            A computer never stores the letter &ldquo;A&rdquo; - it stores the number 65. ASCII is
            just an agreed-upon table that maps every character you can type to a number, and hex is
            the compact way engineers usually write that number down.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">hex = ASCII_code(char).toString(16)</p>
          <p>Repeated for every character in the string, left to right.</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              Take a string, and look up each character&rsquo;s position in the ASCII table one at a
              time. That position is a plain decimal number between 0 and 255, which converts to exactly
              two hex digits. String those hex pairs together, usually with a space between characters,
              and you&rsquo;ve got the raw bytes a program or a serial monitor would actually see.
            </p>
          </ToolSection>

          <Mnemonic tag="One char, two hex digits" phrase="ASCII always fits in a single byte">
            <p>
              Every standard ASCII character maxes out at 127 - well under 256 - so it never needs more
              than two hex digits. If you ever see three or more per character, you&rsquo;re looking at
              a different encoding.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">Text: "Hi"</p>
              <p className="step">'H' = 72 decimal = 48 hex</p>
              <p className="step">'i' = 105 decimal = 69 hex</p>
              <p className="step">Result: 48 69</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
