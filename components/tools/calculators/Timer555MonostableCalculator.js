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
import { CAPACITANCE_UNITS, formatEngineering } from "@/lib/units";
import { Timer555Behavior } from "../Timer555Behavior";

export function Timer555MonostableCalculator() {
  const [r, setR] = useState("100000");
  const [c, setC] = useState("10");
  const [cUnit, setCUnit] = useState(1e-6); // µF

  const pulseWidth = useMemo(() => {
    const resistance = Number(r);
    const capacitance = Number(c) * cUnit;
    if (!Number.isFinite(resistance) || !Number.isFinite(capacitance)) {
      return null;
    }
    return 1.1 * resistance * capacitance;
  }, [r, c, cUnit]);

  return (
    <div className="article-body" data-calculator-experience>
      <CalculatorPanel compact visual={<Timer555Behavior key={`${r}-${c}-${cUnit}`} mode="monostable" high={pulseWidth} />}>
        <CalculatorField
          label="Resistance"
          suffix="Ω"
          value={r}
          onChange={(event) => setR(event.target.value)}
        />
        <CalculatorField
          label="Capacitance"
          value={c}
          onChange={(event) => setC(event.target.value)}
        />
        <CalculatorSelect
          label="Capacitance unit"
          value={cUnit}
          onChange={(event) => setCUnit(Number(event.target.value))}
        >
          {CAPACITANCE_UNITS.map((unit) => (
            <option key={unit.label} value={unit.factor}>
              {unit.label}
            </option>
          ))}
        </CalculatorSelect>
        {pulseWidth !== null ? (
          <CalculatorResults>
            <CalculatorResult label="Pulse width" value={formatEngineering(pulseWidth, "s")} />
          </CalculatorResults>
        ) : (
          <p className="muted">Enter valid numbers to see the result.</p>
        )}
      </CalculatorPanel>

      <CalculatorLearning>
        <ToolSection title="What's going on">
          <p>
            In monostable mode, a 555 timer sits quietly until it&rsquo;s triggered - then it outputs
            one clean pulse of a fixed length and goes back to waiting. It&rsquo;s the
            &ldquo;one-shot&rdquo; mode: a short low trigger pulse starts one timed action.
            Return the trigger high before the timing interval ends; holding it low can extend the output pulse.
          </p>
        </ToolSection>

        <ToolSection title="The formula">
          <p className="mono">T = 1.1 × R × C</p>
          <p>T is the pulse width in seconds, R in ohms, C in farads.</p>
        </ToolSection>

        <LearningDisclosure>
          <ToolSection title="Build it up">
            <p>
              The trigger starts a single charge cycle on the capacitor through the resistor. The output
              stays high for as long as that charge takes to cross a fixed internal threshold - about
              two-thirds of the supply voltage. Bigger R or bigger C means the capacitor takes longer to
              reach that threshold, so the pulse lasts longer.
            </p>
          </ToolSection>

          <Mnemonic tag="1.1RC" phrase="Same shape as RC, just 10% longer">
            <p>
              It&rsquo;s the RC time constant with a 1.1 out front instead of a bare 1 - because the
              capacitor reaches the 555&rsquo;s two-thirds-VCC threshold after about 1.1 time constants. Remember plain RC
              first, then tack on the 1.1.
            </p>
          </Mnemonic>

          <ToolSection title="Worked example">
            <WorkedExample>
              <p className="step">R = 100 kΩ, C = 10 µF</p>
              <p className="step">T = 1.1 × 100,000 × 0.00001</p>
              <p className="step">T = 1.1 seconds</p>
            </WorkedExample>
          </ToolSection>
        </LearningDisclosure>
      </CalculatorLearning>
    </div>
  );
}
