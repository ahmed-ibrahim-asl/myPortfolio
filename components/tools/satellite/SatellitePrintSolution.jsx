import SatelliteGiven from "./SatelliteGiven";
import SatelliteMath from "./SatelliteMath";
import { visibleFields } from "../../../data/satellite-inputs.js";
import { constants } from "../../../lib/tools/satellite/engine.js";
import styles from "./SatelliteWorkspace.module.css";

export default function SatellitePrintSolution({ tool, slug, values, data, mode }) {
  const results = data.results.filter((r) => Number.isFinite(r.value));
  const steps = data.steps.filter((s) => s.title !== "Given and SI unit convention");
  const c = constants(mode);
  const conversions = visibleFields(slug, values).filter(
    (f) => f.units && Number.isFinite(Number(values[f.key]))
  );
  return (
    <section
      className={styles.printSheet}
      data-satellite-print
      aria-label="Printable engineering calculation"
    >
      <p>ENG-ASL / Satellite &amp; RF / Engineering calculation</p>
      <h1>{tool.title}</h1>
      <h2>1. Problem</h2>
      <p>{tool.summary} Calculate the quantities listed below using the supplied inputs.</p>
      <h2>2. Given</h2>
      <SatelliteGiven slug={slug} values={values} heading={null} />
      <p>
        Constant mode: {mode}. c = {c.c} m/s; k = {c.k} J/K; μ = {values.mu ?? c.mu} m³/s² (an
        entered value overrides the mode default).
      </p>
      <h2>3. Required</h2>
      <p>
        {results.map((r) => `${r.label}${r.symbol ? ` (${r.symbol})` : ""} [${r.unit}]`).join("; ")}
        .
      </p>
      <h2>4. Formula</h2>
      {steps.map((s, i) => (
        <div className={styles.printItem} key={i}>
          <h3>{s.title}</h3>
          <SatelliteMath latex={s.formula} description={s.title} />
        </div>
      ))}
      <h2>5. Unit conversion</h2>
      <p>
        The given values use the calculation's base units. Equivalent scaled units are shown here;
        logarithmic gains and losses remain in dB.
      </p>
      {conversions.length ? (
        <ul>
          {conversions.map((f) => (
            <li key={f.key}>
              {f.label}:{" "}
              {f.units
                .map(([unit, factor]) => `${Number(values[f.key]) / factor} ${unit}`)
                .join(" = ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>No scaled-unit conversion is needed for these inputs.</p>
      )}
      <h2>6. Substitution</h2>
      {steps.map((s, i) => (
        <p className={styles.printItem} key={i}>
          <strong>{s.title}: </strong>
          {s.substitution}
        </p>
      ))}
      <h2>7. Answer</h2>
      <dl>
        {results.map((r) => (
          <div className={styles.printItem} key={r.key}>
            <dt>
              {r.label}
              {r.symbol ? ` · ${r.symbol}` : ""}
            </dt>
            <dd>
              {Number(r.value.toPrecision(8))} {r.unit}
            </dd>
          </div>
        ))}
      </dl>
      <h2>8. Interpretation</h2>
      {results.map((r) => (
        <p className={styles.printItem} key={r.key}>
          <strong>{r.label}: </strong>
          {r.interpretation}
        </p>
      ))}
      {data.warnings.map((w) => (
        <p key={w}>{w}</p>
      ))}
      <p>Educational calculation; assumptions and limitations remain part of this solution.</p>
    </section>
  );
}
