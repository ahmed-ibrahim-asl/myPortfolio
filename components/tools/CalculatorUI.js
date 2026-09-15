export function ToolSection({ title, children }) {
  return (
    <section className="tool-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

export function Mnemonic({ tag, phrase, children }) {
  return (
    <aside className="tool-mnemonic">
      <p className="eyebrow">Remember it</p>
      {tag ? <p className="tool-mnemonic-tag">{tag}</p> : null}
      {phrase ? <p className="tool-mnemonic-phrase">{phrase}</p> : null}
      <div className="tool-mnemonic-note">{children}</div>
    </aside>
  );
}

export function WorkedExample({ children }) {
  return (
    <div className="tool-example">
      <p className="tool-example-title mono">Worked example</p>
      <div className="tool-example-body">{children}</div>
    </div>
  );
}

/**
 * The one calm learning region for a calculator page. Everything passed in - "What's going on",
 * the formula, mnemonic, worked example - shares one entry rule and heading instead of each
 * getting its own bordered panel.
 */
export function CalculatorLearning({ children }) {
  return (
    <section className="tool-learning-flow" aria-labelledby="learn-heading" data-tool-learning>
      <h2 id="learn-heading">Understand the result</h2>
      {children}
    </section>
  );
}

/**
 * Longer derivation, mnemonic, and worked-example content that would otherwise push the next
 * region more than one viewport away. Native disclosure keeps it reachable without another box.
 */
export function LearningDisclosure({ summary = "Show the derivation, mnemonic, and worked example", children }) {
  return (
    <details className="tool-disclosure">
      <summary>{summary}</summary>
      <div className="tool-disclosure-body">{children}</div>
    </details>
  );
}

export function CalculatorPanel({ title = "Try it", compact = false, visual, children }) {
  if (!compact) {
    return (
      <div className="calculator-panel" data-tool-workspace>
        <p className="eyebrow">{title}</p>
        <div className="calculator-grid">{children}</div>
      </div>
    );
  }

  const className = `calculator-panel calculator-panel-compact${visual ? " calculator-panel-has-visual" : ""}`;

  return (
    <div className={className} data-tool-workspace>
      <p className="eyebrow">{title}</p>
      <div className="calculator-workspace-layout">
        {visual ? <div className="calculator-workspace-visual">{visual}</div> : null}
        <div className="calculator-workspace-controls">{children}</div>
      </div>
    </div>
  );
}

export function CalculatorField({ label, suffix, ...inputProps }) {
  return (
    <label className="calculator-field">
      <span>{label}</span>
      <div className="calculator-field-input">
        <input
          type="text"
          inputMode="decimal"
          lang="en"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          {...inputProps}
        />
        {suffix ? <span className="calculator-field-suffix">{suffix}</span> : null}
      </div>
    </label>
  );
}

export function CalculatorTextArea({ label, ...textareaProps }) {
  return (
    <label className="calculator-field calculator-field-wide">
      <span>{label}</span>
      <div className="calculator-field-input">
        <textarea rows={3} spellCheck="false" {...textareaProps} />
      </div>
    </label>
  );
}

export function CalculatorSelect({ label, children, ...selectProps }) {
  return (
    <label className="calculator-field">
      <span>{label}</span>
      <div className="calculator-field-input">
        <select {...selectProps}>{children}</select>
      </div>
    </label>
  );
}

export function CalculatorResults({ children }) {
  return (
    <div className="calculator-results" aria-live="polite" aria-atomic="true">
      {children}
    </div>
  );
}

export function CalculatorResult({ label, value, unit }) {
  return (
    <div className="calculator-result">
      <span className="calculator-result-label">{label}</span>
      <span className="calculator-result-value">
        {value}
        {unit ? <span className="calculator-result-unit">{unit}</span> : null}
      </span>
    </div>
  );
}

export function ColorSwatchPicker({ label, colors, value, onChange, colorKey }) {
  const selected = colors.find((color) => color[colorKey] === value);

  return (
    <div className="calculator-field">
      <span>{label}</span>
      <div className="swatch-row" role="group" aria-label={label}>
        {colors.map((color) => (
          <button
            type="button"
            key={color.name}
            className={`swatch ${selected?.name === color.name ? "active" : ""}`}
            style={{ background: color.hex }}
            aria-label={color.name}
            aria-pressed={selected?.name === color.name}
            onClick={() => onChange(color[colorKey])}
          >
            <span className="sr-only">{color.name}</span>
          </button>
        ))}
      </div>
      <p className="swatch-selected muted mono">{selected?.name ?? "-"}</p>
    </div>
  );
}
