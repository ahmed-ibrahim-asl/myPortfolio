import Link from "next/link";
import styles from "./SatelliteCategoryFlow.module.css";

const stages = [
  ["orbit", "Orbit", "Altitude · period · coverage", "km / s"],
  ["look-angles", "Pointing", "Azimuth · elevation · range", "° / km"],
  ["power-lifetime", "Power", "Array output · degradation", "W / m²"],
  ["antenna", "Antenna", "Aperture · gain · beamwidth", "m² / dBi"],
  ["rf-path", "RF path", "Spreading · received carrier", "dB / dBW"],
  ["noise-gt", "Noise", "Receiver temperature · G/T", "K / dB/K"],
  ["link-budget", "Link margin", "Carrier-to-noise · margin", "dB / dB-Hz"],
  ["doppler-delay", "Doppler", "Radial motion · flight time", "Hz / ms"],
  ["multiple-access", "Capacity", "Bandwidth · frame overhead", "channels / bit/s"]
];

export default function SatelliteCategoryFlow() {
  return (
    <section
      className={styles.flow}
      aria-label="Satellite engineering design flow"
      data-satellite-flow
    >
      <header>
        <p>Connect the design quantities</p>
        <h2>From mission geometry to a usable link</h2>
        <span>
          Start where your design needs an answer. Transfer compatible outputs between calculators.
        </span>
      </header>
      <ol>
        {stages.map(([slug, title, quantities, units]) => (
          <li key={slug}>
            <Link href={`/tools/satellite/${slug}/`}>
              <strong>{title}</strong>
              <span>{quantities}</span>
              <code>{units}</code>
            </Link>
          </li>
        ))}
      </ol>
      <Link className={styles.frequency} href="/tools/satellite/frequency-bands/">
        Set the carrier frequency and wavelength →
      </Link>
    </section>
  );
}
