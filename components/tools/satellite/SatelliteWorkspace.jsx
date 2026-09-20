"use client";
import { useEffect, useMemo, useState, useId } from "react";
import Link from "next/link";
import { formatSource } from "../../../lib/tools/satellite/sources.js";
import {
  satelliteRfCalculators as satelliteTools,
  satelliteGlossary,
  satelliteFormulas,
  satelliteSources
} from "../../../data/satellite-course.js";
import { satelliteInputs, initialValues, visibleFields } from "../../../data/satellite-inputs.js";
import { satelliteFieldHelp } from "../../../data/satellite-field-help.js";
import { satelliteFormulaExamples } from "../../../data/satellite-formula-examples.js";
import { rfCalculatorSlugs } from "../../../data/rf-calculators.js";
import { arabicToolNames } from "../../../lib/i18n/tool-copy";
import { calculate, constants } from "../../../lib/tools/satellite/engine.js";
import {
  browserStorage,
  encodeProblem,
  decodeProblem,
  saveHistory,
  readHistory,
  transferValues
} from "../../../lib/tools/satellite/state.js";
import SatelliteDiagrams from "./SatelliteDiagrams";
import SatelliteMath from "./SatelliteMath";
import SatelliteLinkPlot from "./SatelliteLinkPlot";
import SatelliteGiven from "./SatelliteGiven";
import SatellitePrintSolution from "./SatellitePrintSolution";
import styles from "./SatelliteWorkspace.module.css";

const bands = [
  ["L", 1e9, 2e9, "Mobile/navigation"],
  ["S", 2e9, 4e9, "Mobile/research"],
  ["C", 4e9, 8e9, "Fixed satellite"],
  ["X", 8e9, 12e9, "Radar/military"],
  ["Ku", 12e9, 18e9, "Broadcast/fixed"],
  ["Ka", 26.5e9, 40e9, "Broadband"]
];
const resultOrder = {
  "look-angles": ["elevationDeg", "azimuthDeg", "slantRangeM", "eastM", "northM", "upM"]
};
const fmt = (v) =>
  Math.abs(v) >= 1e8 || (Math.abs(v) > 0 && Math.abs(v) < 0.001)
    ? v.toExponential(4)
    : new Intl.NumberFormat("en", {
        maximumFractionDigits: Math.abs(v) < 1 ? 5 : Math.abs(v) < 10 ? 3 : 2
      }).format(v);
const legDefaults = (uplink) => ({
  frequencyHz: uplink ? 14e9 : 12e9,
  distanceM: 38000e3,
  powerW: uplink ? 100 : 30,
  transmitGainDb: 40,
  receiveGainDb: uplink ? 25 : 44,
  pathLossDb: 1,
  antennaTemperatureK: 100,
  pathTemperatureK: 270,
  noiseFigureDb: 2,
  bandwidthHz: 30e6
});
function Field({ field, value, onChange }) {
  const helpId = useId();
  const help = satelliteFieldHelp(field.key);
  const [unit, setUnit] = useState(field.initialUnit || field.unit || "");
  const multiplier = field.units?.find(([u]) => u === unit)?.[1] ?? 1;
  const displayed =
    typeof value === "number" ? Number((value / multiplier).toPrecision(12)) : (value ?? "");
  return (
    <label className={styles.field}>
      <span>
        {field.label}
        {help && (
          <>
            {" "}
            · <strong>{help[0]}</strong>
          </>
        )}
      </span>
      {field.options ? (
        <select name={field.key} value={value} onChange={(e) => onChange(e.target.value)}>
          {field.options.map(([v, t]) => (
            <option key={v} value={v}>
              {t}
            </option>
          ))}
        </select>
      ) : (
        <div className={styles.quantity}>
          <input
            name={field.key}
            aria-describedby={help ? helpId : undefined}
            type="number"
            step="any"
            value={displayed}
            onChange={(e) =>
              onChange(e.target.value === "" ? "" : Number(e.target.value) * multiplier)
            }
          />
          {field.units ? (
            <select
              aria-label={`${field.label} unit`}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {field.units.map(([u]) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          ) : field.unit ? (
            <span>{field.unit}</span>
          ) : null}
        </div>
      )}
      {help && !field.options && (
        <small id={helpId} className={styles.muted}>
          {help[1]}
        </small>
      )}
    </label>
  );
}
function ExplanationCards({ tool }) {
  const [active, setActive] = useState(0);
  return (
    <section className={styles.panel} aria-label="Concept explorer">
      <p className={styles.kicker}>Understand the system</p>
      <div className={styles.topicButtons}>
        {tool.lessons.map((l, i) => (
          <button key={l.title} aria-pressed={active === i} onClick={() => setActive(i)}>
            {l.title}
          </button>
        ))}
      </div>
      {tool.lessons[active] && (
        <div className={styles.lesson}>
          <h2>{tool.lessons[active].title}</h2>
          <p>{tool.lessons[active].text}</p>
          <SatelliteMath
            latex={tool.lessons[active].formula}
            description={tool.lessons[active].symbols}
          />
          <p className={styles.muted}>{tool.lessons[active].symbols}</p>
          <p>{tool.lessons[active].interpretation}</p>
          <p className={styles.source}>Source: {formatSource(tool.lessons[active].source)}</p>
        </div>
      )}
    </section>
  );
}
function FormulaReference({ toolSlug }) {
  const [query, setQuery] = useState(""),
    [tab, setTab] = useState("formulas");
  const formulas = satelliteFormulas.filter(
    (f) =>
      (!toolSlug || f.tool === toolSlug) &&
      `${f.title} ${f.symbols}`.toLowerCase().includes(query.toLowerCase())
  );
  const glossary = satelliteGlossary.filter((g) =>
    `${g.term} ${g.definition}`.toLowerCase().includes(query.toLowerCase())
  );
  return (
    <section className={styles.panel} aria-label="Formula reference">
      <div className={styles.controls}>
        <label>
          Search formulas and symbols
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="FSPL, temperature, orbit…"
          />
        </label>
        {!toolSlug && (
          <label>
            Reference view
            <select value={tab} onChange={(e) => setTab(e.target.value)}>
              <option value="formulas">Formula sheet</option>
              <option value="glossary">Glossary</option>
              <option value="sources">Course sources</option>
            </select>
          </label>
        )}
      </div>
      {tab === "formulas" ? (
        <div className={styles.formulas}>
          {formulas.length ? (
            formulas.map((f) => (
              <article key={f.id}>
                <h3>{f.title}</h3>
                <SatelliteMath latex={f.latex} description={f.symbols} />
                <p>{f.symbols}</p>
                <p className={styles.muted}>{f.assumptions}</p>
                <p data-formula-example>
                  <strong>Example: </strong>
                  {satelliteFormulaExamples[f.id]}
                </p>
                <Link href={`/tools/satellite/${f.tool}/`}>Open related tool →</Link>
              </article>
            ))
          ) : (
            <p>No formulas match this search.</p>
          )}
        </div>
      ) : tab === "glossary" ? (
        <dl className={styles.glossary}>
          {glossary.map((g) => (
            <div key={g.term}>
              <dt>{g.term}</dt>
              <dd>{g.definition}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div>
          {satelliteSources.map((s) => (
            <article key={s.file}>
              <h3>{s.title}</h3>
              <p>{s.file}</p>
              <p>{s.description || s.note}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
const routeForTool = (toolSlug, locale = "en") => `/${locale === "ar" ? "ar/" : ""}tools/${rfCalculatorSlugs.includes(toolSlug) ? "rf" : "satellite"}/${toolSlug}/`;
const CALCULATION_MODE = "engineering";

export default function SatelliteWorkspace({ slug, routeRoot = "satellite", locale = "en" }) {
  const tool = satelliteTools.find((t) => t.slug === slug);
  const [values, setValues] = useState(() => initialValues(slug)),
    [history, setHistory] = useState([]),
    [notice, setNotice] = useState(""),
    [revealed, setRevealed] = useState(false),
    [temperatureUnit, setTemperatureUnit] = useState("K"),
    [nfInput, setNfInput] = useState("nf");
  useEffect(() => {
    setHistory(readHistory(browserStorage()));
    const allowed = [
      ...(satelliteInputs[slug]?.fields ?? []).map((f) => f.key),
      "stages",
      "uplink",
      "downlink",
      "nfInput",
      "noiseFactor",
      "equivalentTemperatureK"
    ];
    const shared = decodeProblem(window.location.search, allowed);
    if (shared && shared.slug === slug) {
      setValues((v) => ({ ...v, ...shared.values }));
      if (["nf", "factor", "te"].includes(shared.values.nfInput)) setNfInput(shared.values.nfInput);
      setNotice("Shared calculation restored. Review the units and calculate.");
    }
  }, [slug]);
  useEffect(() => {
    let opened = [];
    const before = () => {
      opened = [...document.querySelectorAll(`.${styles.solution}:not([open])`)];
      opened.forEach((detail) => {
        detail.open = true;
      });
    };
    const after = () => {
      opened.forEach((detail) => {
        detail.open = false;
      });
      opened = [];
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
      after();
    };
  }, []);
  const normalized = useMemo(() => {
    const v = { ...values };
    if (slug === "noise-gt" && v.noiseMode === "nf") {
      v.nfInput = nfInput;
      if (nfInput === "te") {
        delete v.noiseFigureDb;
        v.equivalentTemperatureK = v.addedTemperatureK;
      } else if (nfInput === "factor") {
        delete v.noiseFigureDb;
        v.noiseFactor = v.noiseFactor ?? 2;
      }
    }
    if (slug === "noise-gt" && v.noiseMode === "cascade")
      v.stages = v.stages ?? [
        { gainDb: 20, noiseFigureDb: 1 },
        { gainDb: 10, noiseFigureDb: 6 }
      ];
    if (slug === "link-budget" && v.linkMode === "course-ft") {
      v.uplink = v.uplink ?? legDefaults(true);
      v.downlink = v.downlink ?? legDefaults(false);
    }
    return v;
  }, [values, slug, nfInput]);
  const computation = useMemo(() => {
    if (!satelliteInputs[slug]) return { data: null, error: null };
    try {
      if (slug === "frequency-bands") {
        const f = Number(values.frequencyHz);
        if (!(f > 0 && Number.isFinite(f)))
          throw Error("Carrier frequency must be greater than zero.");
        return {
          data: {
            results: [
              {
                key: "wavelengthM",
                label: "Wavelength",
                symbol: "λ",
                value: constants(CALCULATION_MODE).c / f,
                unit: "m",
                interpretation:
                  "Frequency and wavelength are inversely related; free-space propagation speed is the same."
              }
            ],
            steps: [
              {
                title: "Wavelength",
                formula: "\\lambda=\\frac{c}{f}",
                substitution: `${constants(CALCULATION_MODE).c} m/s ÷ ${f} Hz`,
                result: `${constants(CALCULATION_MODE).c / f} m`
              }
            ],
            warnings: [],
            diagram: {}
          },
          error: null
        };
      }
      return { data: calculate(slug, normalized, CALCULATION_MODE), error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [slug, normalized, values]);
  const data = computation.data;
  const raw = data?.diagram ?? {};
  function save() {
    if (!data) return;
    const storage = browserStorage();
    const saved = saveHistory(storage, {
      slug,
      values: normalized,
      mode: CALCULATION_MODE,
      title: tool.title,
      summary: `${data.results[0]?.label}: ${fmt(data.results[0]?.value ?? 0)} ${data.results[0]?.unit ?? ""}`
    });
    setHistory(readHistory(storage));
    setNotice(
      saved
        ? "Calculation saved on this browser."
        : "Browser storage is unavailable. Copy the calculation link to keep this calculation."
    );
  }
  async function share() {
    const url =
      window.location.origin + `/${locale === "ar" ? "ar/" : ""}tools/${routeRoot}/${slug}/` + encodeProblem(slug, normalized);
    try {
      await navigator.clipboard.writeText(url);
      setNotice("Calculation link copied.");
    } catch {
      setNotice(url);
    }
    window.history.replaceState(null, "", url);
  }
  function set(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }
  if (!tool) return null;
  const formulas = satelliteFormulas.filter((f) => f.tool === slug);
  return (
    <article className={`${styles.workspace}`}>
      {data && revealed && !computation.error && (
        <SatellitePrintSolution
          tool={tool}
          slug={slug}
          values={normalized}
          data={data}
          mode={CALCULATION_MODE}
        />
      )}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href={locale === "ar" ? "/ar/tools/" : "/tools/"}>{locale === "ar" ? "الأدوات" : "Tools"}</Link>
        <span>/</span>
        <Link href={`/${locale === "ar" ? "ar/" : ""}tools/category/${routeRoot === "rf" ? "rf-engineering" : "satellite"}/`}>{locale === "ar" ? (routeRoot === "rf" ? "هندسة الترددات اللاسلكية" : "الأقمار الصناعية") : (routeRoot === "rf" ? "RF Engineering" : "Satellite")}</Link>
        <span>/</span>
        <span aria-current="page">{locale === "ar" ? arabicToolNames[slug] : tool.title}</span>
      </nav>
      <header className={styles.heading}>
        <p className={styles.kicker}>{tool.group}</p>
        <h1>{locale === "ar" ? arabicToolNames[slug] : tool.title}</h1>
        <p>{tool.summary}</p>
        {locale === "ar" ? <p className={styles.muted}>المحتوى التفصيلي متاح بالإنجليزية، بينما الحسابات والوحدات والنتائج تعمل بنفس المحرك الهندسي.</p> : null}
      </header>
      {
        <>
          {satelliteInputs[slug] && (
            <section className={styles.workbench} aria-label="Engineering calculator">
              <form
                className={styles.inputPanel}
                onSubmit={(e) => {
                  e.preventDefault();
                  setRevealed(true);
                }}
              >
                <p className={styles.kicker}>Given / choose the units</p>
                <div className={styles.presetButtons}>
                  {satelliteInputs[slug].presets.map((p) => (
                    <button
                      type="button"
                      key={p.name}
                      onClick={() => {
                        setValues((v) => ({ ...v, ...p.values }));
                        setRevealed(false);
                      }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {slug === "frequency-bands" && (
                  <div className={styles.bandButtons}>
                    {bands.map(([band, low, high, label]) => (
                      <button
                        key={band}
                        type="button"
                        aria-pressed={values.frequencyHz >= low && values.frequencyHz < high}
                        onClick={() => set("frequencyHz", (low + high) / 2)}
                      >
                        {band}
                        <small>
                          {low / 1e9}–{high / 1e9} GHz · {label}
                        </small>
                      </button>
                    ))}
                  </div>
                )}
                {slug === "noise-gt" && (
                  <>
                    {values.noiseMode === "nf" && (
                      <label className={styles.field}>
                        Noise figure input
                        <select value={nfInput} onChange={(e) => setNfInput(e.target.value)}>
                          <option value="nf">Noise figure in dB</option>
                          <option value="factor">Linear noise factor</option>
                          <option value="te">Equivalent noise temperature</option>
                        </select>
                      </label>
                    )}
                    {values.noiseMode === "nf" && nfInput === "factor" && (
                      <Field
                        field={{ key: "noiseFactor", label: "Linear noise factor", unit: "linear" }}
                        value={values.noiseFactor ?? 2}
                        onChange={(v) => set("noiseFactor", v)}
                      />
                    )}
                  </>
                )}
                <div className={styles.fields}>
                  {visibleFields(slug, values)
                    .filter(
                      (f) => !(slug === "noise-gt" && f.key === "noiseFigureDb" && nfInput !== "nf")
                    )
                    .map((f) => (
                      <Field
                        key={f.key}
                        field={f}
                        value={values[f.key]}
                        onChange={(v) => set(f.key, v)}
                      />
                    ))}
                </div>
                {slug === "noise-gt" && values.noiseMode === "nf" && nfInput === "te" && (
                  <Field
                    field={{
                      key: "addedTemperatureK",
                      label: "Equivalent added temperature",
                      unit: "K"
                    }}
                    value={values.addedTemperatureK}
                    onChange={(v) => set("addedTemperatureK", v)}
                  />
                )}
                {slug === "noise-gt" && (
                  <label className={styles.field}>
                    Input temperature unit
                    <select
                      value={temperatureUnit}
                      onChange={(e) => setTemperatureUnit(e.target.value)}
                    >
                      <option>K</option>
                      <option>°C</option>
                    </select>
                    {temperatureUnit === "°C" && (
                      <input
                        aria-label="Input temperature in Celsius"
                        type="number"
                        step="any"
                        value={
                          Number.isFinite(values.temperatureK)
                            ? Number((values.temperatureK - 273.15).toFixed(8))
                            : ""
                        }
                        onChange={(e) =>
                          set(
                            "temperatureK",
                            e.target.value === "" ? "" : Number(e.target.value) + 273.15
                          )
                        }
                      />
                    )}
                  </label>
                )}
                {slug === "noise-gt" && values.noiseMode === "cascade" && (
                  <fieldset className={styles.stages}>
                    <legend>Receiver stages in signal order</legend>
                    {normalized.stages.map((stage, i) => (
                      <div key={i} className={styles.stage}>
                        <Field
                          field={{
                            key: `stage-${i}-gain`,
                            label: `Stage ${i + 1} power gain`,
                            unit: "dB"
                          }}
                          value={stage.gainDb}
                          onChange={(value) =>
                            set(
                              "stages",
                              normalized.stages.map((s, j) =>
                                j === i ? { ...s, gainDb: value } : s
                              )
                            )
                          }
                        />
                        <Field
                          field={{
                            key: `stage-${i}-nf`,
                            label: `Stage ${i + 1} noise figure`,
                            unit: "dB"
                          }}
                          value={stage.noiseFigureDb}
                          onChange={(value) =>
                            set(
                              "stages",
                              normalized.stages.map((s, j) =>
                                j === i ? { ...s, noiseFigureDb: value } : s
                              )
                            )
                          }
                        />
                        <button
                          type="button"
                          disabled={normalized.stages.length <= 1}
                          onClick={() =>
                            set(
                              "stages",
                              normalized.stages.filter((_, j) => j !== i)
                            )
                          }
                        >
                          Remove stage {i + 1}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={normalized.stages.length >= 8}
                      onClick={() =>
                        set("stages", [...normalized.stages, { gainDb: 10, noiseFigureDb: 3 }])
                      }
                    >
                      Add stage
                    </button>
                  </fieldset>
                )}
                {slug === "link-budget" &&
                  values.linkMode === "course-ft" &&
                  ["uplink", "downlink"].map((leg) => (
                    <fieldset key={leg} className={styles.stages}>
                      <legend>
                        {leg === "uplink" ? "Ground to satellite" : "Satellite to ground"}
                      </legend>
                      {Object.entries(normalized[leg]).map(([key, value]) => (
                        <Field
                          key={key}
                          field={{
                            key: `${leg}-${key}`,
                            label: key.replace(/([A-Z])/g, " $1"),
                            unit: key.endsWith("Hz")
                              ? "Hz"
                              : key.endsWith("M")
                                ? "m"
                                : key.endsWith("K")
                                  ? "K"
                                  : key.endsWith("Db")
                                    ? "dB"
                                    : key.endsWith("W")
                                      ? "W"
                                      : ""
                          }}
                          value={value}
                          onChange={(v) => set(leg, { ...normalized[leg], [key]: v })}
                        />
                      ))}
                    </fieldset>
                  ))}
                {slug === "orbit" && values.orbitMode === "elliptical" && (
                  <button
                    type="button"
                    onClick={() =>
                      setValues((v) => ({
                        ...v,
                        apogeeRadiusM: v.perigeeRadiusM,
                        perigeeRadiusM: v.apogeeRadiusM
                      }))
                    }
                  >
                    Swap apogee and perigee
                  </button>
                )}
                <button data-action="calculate" type="submit" className={styles.calculate}>
                  {locale === "ar" ? "احسب واعرض النتائج" : "Calculate and show results"}
                </button>
                <p className={styles.muted}>
                  Diagrams update as you edit. Run Calculate to refresh numerical results.
                </p>
              </form>
              <div className={styles.outputPanel}>
                {computation.error ? (
                  <p role="alert" className={styles.warning}>
                    {computation.error}
                  </p>
                ) : data && revealed ? (
                  <>
                    <p className={styles.kicker}>{locale === "ar" ? "النتيجة / التفسير" : "Result / interpretation"}</p>
                    <div className={styles.results} aria-live="polite">
                      {data.results
                        .filter((r) => Number.isFinite(r.value))
                        .sort((a, b) =>
                          resultOrder[slug]
                            ? resultOrder[slug].indexOf(a.key) - resultOrder[slug].indexOf(b.key)
                            : 0
                        )
                        .map((r) => (
                          <div key={r.key} data-result={r.key}>
                            <span>
                              {r.label}
                              {r.symbol && <> · {r.symbol}</>}
                            </span>
                            <strong>
                              {fmt(r.value)} <small>{r.unit}</small>
                            </strong>
                            <p>{r.interpretation}</p>
                          </div>
                        ))}
                    </div>
                    {data.warnings.map((w) => (
                      <p key={w} className={styles.warning}>
                        {w}
                      </p>
                    ))}
                    <div className={styles.actions}>
                      <button data-action="save" onClick={save}>
                        {locale === "ar" ? "احفظ الحساب" : "Save calculation"}
                      </button>
                      <button onClick={share}>{locale === "ar" ? "انسخ رابط الحساب" : "Copy calculation link"}</button>
                      <button onClick={() => window.print()}>{locale === "ar" ? "اطبع الحساب" : "Print calculation"}</button>
                    </div>
                    <details className={styles.solution}>
                      <summary>Show calculation / full worked solution</summary>
                      <div className={styles.printGiven}>
                        <SatelliteGiven slug={slug} values={normalized} />
                      </div>
                      {data.steps.map((step, i) => (
                        <div className={styles.step} key={i}>
                          <h3>
                            {i + 1}. {step.title}
                          </h3>
                          <SatelliteMath latex={step.formula} description={step.title} />
                          <p>{step.substitution}</p>
                          <strong>{step.result}</strong>
                          <p>{step.interpretation}</p>
                        </div>
                      ))}
                    </details>
                  </>
                ) : (
                  <p>{locale === "ar" ? "أدخل قيم التصميم ثم شغّل الحساب لمراجعة النتائج." : "Enter the design inputs, then calculate to inspect the results."}</p>
                )}
                {data && !computation.error && (
                  <>
                    <p className={styles.diagramHint}>
                      Swipe the diagram sideways to see the full view. With a keyboard, focus the
                      diagram and use the arrow keys.
                    </p>
                    <SatelliteDiagrams slug={slug} values={normalized} results={raw} mode={CALCULATION_MODE} />
                    {slug === "link-budget" && (
                      <SatelliteLinkPlot values={normalized} mode={CALCULATION_MODE} />
                    )}
                  </>
                )}
              </div>
            </section>
          )}
          <ExplanationCards tool={tool} />
          <section className={styles.panel}>
            <h2>Common mistakes</h2>
            <ul>
              {tool.mistakes.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
          {formulas.length > 0 && (
            <details className={styles.panel}>
              <summary>Formula reference and symbol definitions</summary>
              <FormulaReference toolSlug={slug} />
            </details>
          )}
        </>
      }
      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}
      <section className={styles.panel}>
        <h2>Continue the signal path</h2>
        <div className={styles.related}>
          {tool.related.map((target) => {
            const next = satelliteTools.find((t) => t.slug === target);
            if (!next) return null;
            const transferred = transferValues(slug, target, raw);
            return (
              <Link
                key={target}
                href={`${routeForTool(target, locale)}${Object.keys(transferred).length ? encodeProblem(target, transferred) : ""}`}
              >
                {next.title}
                {Object.keys(transferred).length ? " · use this result" : ""} →
              </Link>
            );
          })}
        </div>
      </section>
      {history.length > 0 && (
        <details className={styles.panel}>
          <summary>Recent satellite calculations ({history.length})</summary>
          <div className={styles.history}>
            {history.map((entry, i) => (
              <Link
                data-history-item
                key={`${entry.savedAt}-${i}`}
                href={`${routeForTool(entry.slug, locale)}${encodeProblem(entry.slug, entry.values)}`}
              >
                {entry.title}
                <small>{entry.summary}</small>
              </Link>
            ))}
          </div>
        </details>
      )}
    </article>
  );
}
