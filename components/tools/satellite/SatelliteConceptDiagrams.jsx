"use client";
import { useState } from "react";
import styles from "./SatelliteWorkspace.module.css";
const stages = {
  Receiver:
    "Accepts the weak uplink through filtering and a low-noise front end. It cannot remove noise already mixed with the wanted signal.",
  Downconverter:
    "A mixer and local oscillator translate the uplink to an intermediate frequency. Filtering selects the wanted mixing product.",
  "IF amplifier":
    "Provides intermediate-frequency gain and filtering without recovering or regenerating the information bits.",
  Upconverter:
    "Translates the signal to the selected downlink band. The desired sum or difference product depends on the frequency plan.",
  "Power amplifier":
    "Raises RF power for retransmission. Output back-off, distortion and available spacecraft power constrain operation.",
  Demodulator:
    "Recovers baseband symbols or bits from the uplink waveform; sufficiently poor uplink quality still causes decoding errors.",
  "Baseband processor":
    "Can perform error correction, coding, switching and signal processing. Regeneration reduces analog noise transfer but does not guarantee recovery of incorrectly decoded information.",
  Modulator:
    "Builds a new downlink waveform from the processed information using the chosen modulation and coding scheme."
};
const subsystemRows = [
  [
    "structure",
    "Structure and stabilization",
    "The mechanical bus supports and protects the payload. Spin stabilization and three-axis control use different arrangements for body and antenna pointing."
  ],
  [
    "power",
    "Electrical power",
    "Solar arrays, batteries and regulation supply the spacecraft. Eclipse operation and end-of-life degradation must be included in the power budget."
  ],
  [
    "attitude",
    "Attitude control",
    "Sensors estimate orientation; reaction wheels or actuators turn the body and antennas. Attitude is orientation, not orbital position."
  ],
  [
    "orbit",
    "Orbital control",
    "Tracking estimates the orbit and thruster maneuvers correct it. Station keeping limits drift in assigned orbital position; fuel constrains lifetime."
  ],
  [
    "thermal",
    "Thermal control",
    "Insulation, radiators, surface coatings, heaters and heat paths keep equipment within temperature limits despite sunlight, eclipse and internal dissipation."
  ],
  [
    "ttc",
    "TT&C",
    "Tracking measures orbit and motion; telemetry reports temperatures, voltages and status; command changes spacecraft settings. The operational ground station closes this control loop."
  ],
  [
    "payload",
    "Communication payload",
    "Receive and transmit antennas, transponders and signal-processing electronics carry mission traffic. They depend on the bus for power, pointing and thermal support."
  ]
];
export default function SatelliteConceptDiagrams({ slug }) {
  const [architecture, setArchitecture] = useState("ft"),
    [active, setActive] = useState("Receiver"),
    [subsystem, setSubsystem] = useState("structure");
  if (slug === "subsystems") {
    const selected = subsystemRows.find((row) => row[0] === subsystem);
    return (
      <section className={styles.panel} aria-label="Spacecraft subsystem tree">
        <h2>Spacecraft: bus and payload</h2>
        <p>
          Select a subsystem to follow its responsibility. The TT&C station on Earth supports
          spacecraft operations; user terminals carry customer traffic.
        </p>
        <h3>Bus — spacecraft support</h3>
        <div className={styles.topicButtons}>
          {subsystemRows.slice(0, -1).map(([id, label]) => (
            <button
              key={id}
              data-subsystem={id}
              aria-pressed={subsystem === id}
              onClick={() => setSubsystem(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <h3>Payload — mission traffic</h3>
        <button
          data-subsystem="payload"
          aria-pressed={subsystem === "payload"}
          onClick={() => setSubsystem("payload")}
        >
          Communication payload
        </button>
        <div data-block-explanation aria-live="polite">
          <h3>{selected[1]}</h3>
          <p>{selected[2]}</p>
        </div>
      </section>
    );
  }
  const blocks =
    architecture === "ft"
      ? ["Receiver", "Downconverter", "IF amplifier", "Upconverter", "Power amplifier"]
      : ["Receiver", "Demodulator", "Baseband processor", "Modulator", "Power amplifier"];
  return (
    <section className={styles.panel} aria-label="Interactive transponder signal chain">
      <h2>Follow the signal through a transponder</h2>
      <label className={styles.field}>
        Architecture
        <select
          aria-label="Transponder architecture"
          value={architecture}
          onChange={(e) => {
            setArchitecture(e.target.value);
            setActive("Receiver");
          }}
        >
          <option value="ft">Frequency translation / bent pipe</option>
          <option value="obp">On-board processing / regenerative</option>
        </select>
      </label>
      <p>Uplink → select a block → downlink</p>
      <ol className={styles.signalBlocks}>
        {blocks.map((block) => (
          <li key={block}>
            <button
              data-transponder-block={block}
              aria-pressed={active === block}
              onClick={() => setActive(block)}
            >
              {block}
            </button>
          </li>
        ))}
      </ol>
      <div data-block-explanation aria-live="polite">
        <h3>{active}</h3>
        <p>{stages[active]}</p>
      </div>
      <p>
        {architecture === "ft"
          ? "Bent pipe: no baseband regeneration; uplink noise remains part of the forwarded signal."
          : "On-board processing: information is recovered and processed before a new downlink waveform is generated."}
      </p>
    </section>
  );
}
