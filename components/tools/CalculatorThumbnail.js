import { calculatorVisuals } from "@/data/calculator-visuals";

function InstrumentGrid() {
  return (
    <path
      d="M0 27H240M0 54H240M0 81H240M0 108H240M40 0V135M80 0V135M120 0V135M160 0V135M200 0V135"
      className="calculator-thumbnail-grid"
    />
  );
}

function EndNodes({ y = 58 }) {
  return (
    <>
      <circle cx="20" cy={y} r="4" className="calculator-thumbnail-node" />
      <circle cx="220" cy={y} r="4" className="calculator-thumbnail-node" />
    </>
  );
}

function Resistor({ x = 54, y = 58, width = 72 }) {
  const unit = width / 6;
  return <path d={`M${x} ${y}l${unit} -14 ${unit} 28 ${unit} -28 ${unit} 28 ${unit} -28 ${unit} 14`} />;
}

function Formula({ children }) {
  return <text x="120" y="121" className="calculator-thumbnail-formula">{children}</text>;
}

function Diagram({ visual }) {
  switch (visual.kind) {
    case "resistor-bands-4":
    case "resistor-bands-5": {
      const bands = visual.kind.endsWith("5") ? [88, 101, 114, 127, 140] : [92, 108, 124, 140];
      return (
        <>
          <EndNodes />
          <path d="M20 58h46M174 58h46" />
          <rect x="66" y="37" width="108" height="42" rx="18" />
          {bands.map((x, index) => (
            <path key={x} d={`M${x} 39v38`} className={`calculator-thumbnail-band band-${index + 1}`} />
          ))}
          <Formula>{visual.formula}</Formula>
        </>
      );
    }
    case "resistors-series":
      return (
        <>
          <EndNodes />
          <path d="M20 58h22" /><Resistor x={42} width={42} />
          <path d="M84 58h14" /><Resistor x={98} width={42} />
          <path d="M140 58h14" /><Resistor x={154} width={42} />
          <path d="M196 58h24" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "resistors-parallel":
      return (
        <>
          <EndNodes />
          <path d="M20 58h28M192 58h28M48 28v60M192 28v60M48 28h32" />
          <Resistor x={80} y={28} width={72} /><path d="M152 28h40M48 58h32" />
          <Resistor x={80} y={58} width={72} /><path d="M152 58h40M48 88h32" />
          <Resistor x={80} y={88} width={72} /><path d="M152 88h40" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "voltage-divider":
      return (
        <>
          <circle cx="88" cy="18" r="4" className="calculator-thumbnail-node" />
          <circle cx="88" cy="96" r="4" className="calculator-thumbnail-node" />
          <path d="M88 18v10" /><Resistor x={52} y={42} width={72} />
          <path d="M88 28v14M88 42v20" /><Resistor x={52} y={76} width={72} />
          <path d="M88 62v34M88 62h100m0 0-14-10m14 10-14 10" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "rc-time":
      return (
        <>
          <EndNodes y={48} /><path d="M20 48h30" /><Resistor x={50} y={48} width={66} />
          <path d="M116 48h24M140 29v38M158 29v38M158 48h62" />
          <path d="M32 93c34 0 46-3 62-16 20-16 37-20 90-20" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "timer-astable":
    case "timer-monostable":
      return (
        <>
          <rect x="70" y="24" width="82" height="64" />
          <text x="111" y="62" className="calculator-thumbnail-chip-label">555</text>
          <path d="M24 55h46M152 55h22" />
          {visual.kind === "timer-astable" ? (
            <path d="M174 73V37h16v36h16V37h16" className="calculator-thumbnail-signal" />
          ) : (
            <path d="M174 73V37h31v36h17" className="calculator-thumbnail-signal" />
          )}
          <path d="M88 24V14M110 24V14M132 24V14M88 88v10M110 88v10M132 88v10" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "capacitive-reactance":
      return (
        <>
          <EndNodes /><path d="M20 58h66M86 31v54M108 31v54M108 58h112" />
          <path d="M130 82c10-20 20-20 30 0s20 20 30 0 20-20 30 0" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "led-resistor":
      return (
        <>
          <EndNodes /><path d="M20 58h25" /><Resistor x={45} width={60} />
          <path d="M105 58h30M135 36v44l38-22-38-22M173 36v44M173 58h47M176 31l15-12m-7 27 16-12" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "battery-runtime":
      return (
        <>
          <rect x="34" y="31" width="92" height="54" />
          <path d="M126 46h10v24h-10M48 58h54M75 42v32" />
          <path d="M158 82V38M158 82h58M169 72v-9h13v9h12V56h13v16" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "rms-wave":
      return (
        <>
          <path d="M20 58c17-40 34-40 51 0s34 40 51 0 34-40 51 0 34 40 51 0" className="calculator-thumbnail-signal" />
          <path d="M20 78h204" className="calculator-thumbnail-reference" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "filter-high-pass":
    case "filter-low-pass":
      return (
        <>
          <path d="M34 88V25M34 88h186M119 88V24" />
          {visual.kind === "filter-high-pass" ? (
            <path d="M38 85c40-1 58-6 75-35 14-23 31-24 103-24" className="calculator-thumbnail-signal" />
          ) : (
            <path d="M38 26h52c20 0 25 7 34 30 9 24 27 29 92 29" className="calculator-thumbnail-signal" />
          )}
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "op-amp":
      return (
        <>
          <path d="M73 27v62l78-31-78-31M151 58h69M34 43h39M34 73h39M84 43h12M90 37v12M84 73h12" />
          <path d="M182 58v34H90V73M112 92l10-12 14 24 14-24 10 12" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "capacitor-code":
      return (
        <>
          <path d="M58 92V71M182 92V71" /><rect x="48" y="25" width="144" height="48" rx="6" />
          <text x="120" y="58" className="calculator-thumbnail-component-code">104</text>
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "capacitance-scale":
      return (
        <>
          <path d="M23 54h28M51 29v50M71 29v50M71 54h28M101 54h112m0 0-14-10m14 10-14 10" />
          <circle cx="118" cy="54" r="4" className="calculator-thumbnail-node" />
          <circle cx="154" cy="54" r="4" className="calculator-thumbnail-node" />
          <circle cx="190" cy="54" r="4" className="calculator-thumbnail-node" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "temperature-scale":
      return (
        <>
          {[62, 120, 178].map((x, index) => (
            <g key={x}>
              <circle cx={x} cy="79" r="12" />
              <path d={`M${x} 79V31M${x - 8} 31h16M${x - 5} ${49 - index * 5}h10`} />
            </g>
          ))}
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "number-bases":
      return (
        <>
          {[[50, 34, "10"], [190, 34, "2"], [50, 78, "8"], [190, 78, "16"]].map(([x, y, label]) => (
            <g key={label}>
              <rect x={x - 22} y={y - 15} width="44" height="30" />
              <text x={x} y={y + 5} className="calculator-thumbnail-mini-label">{label}</text>
            </g>
          ))}
          <path d="M72 34h96m0 0-12-8m12 8-12 8M72 78h96m0 0-12-8m12 8-12 8M50 49v14M190 49v14" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "bit-shift":
      return (
        <>
          <text x="120" y="56" className="calculator-thumbnail-bits">1 0 1 1 0</text>
          <path d="M42 28h154m0 0-14-9m14 9-14 9M198 80H44m0 0 14-9m-14 9 14 9" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "ones-complement":
    case "twos-complement":
      return (
        <>
          <text x="62" y="53" className="calculator-thumbnail-bits">10100</text>
          <path d="M102 48h40m0 0-12-8m12 8-12 8" className="calculator-thumbnail-signal" />
          <text x="178" y="53" className="calculator-thumbnail-bits">01011</text>
          {visual.kind === "twos-complement" ? <text x="178" y="80" className="calculator-thumbnail-mini-label">+ 1</text> : null}
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "ascii-to-hex":
    case "hex-to-ascii":
      return (
        <>
          <rect x="37" y="30" width="55" height="48" /><rect x="148" y="30" width="55" height="48" />
          <text x="64" y="61" className="calculator-thumbnail-component-code">{visual.kind === "ascii-to-hex" ? "A" : "41"}</text>
          <text x="176" y="61" className="calculator-thumbnail-component-code">{visual.kind === "ascii-to-hex" ? "41" : "A"}</text>
          <path d="M101 54h36m0 0-12-8m12 8-12 8" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "log-two":
      return (
        <>
          <path d="M34 89V22M34 89h185" /><path d="M45 82c30-38 60-48 170-58" className="calculator-thumbnail-signal" />
          {[68, 106, 158].map((x) => <circle key={x} cx={x} cy={95 - Math.log2(x / 17) * 18} r="4" className="calculator-thumbnail-node" />)}
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "binary-arithmetic":
    case "hex-arithmetic":
      return (
        <>
          <rect x="28" y="29" width="67" height="46" /><rect x="145" y="29" width="67" height="46" />
          <text x="61" y="58" className="calculator-thumbnail-mini-label">{visual.kind === "binary-arithmetic" ? "1010" : "0xA"}</text>
          <text x="178" y="58" className="calculator-thumbnail-mini-label">{visual.kind === "binary-arithmetic" ? "0110" : "0x6"}</text>
          <path d="M105 52h30M120 37v30" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "acceleration":
      return (
        <>
          <path d="M31 76h182m0 0-14-9m14 9-14 9" />
          {[48, 76, 116, 171].map((x, index) => <circle key={x} cx={x} cy="58" r={4 + index} className="calculator-thumbnail-node" />)}
          <path d="M48 42h123" className="calculator-thumbnail-signal" /><Formula>{visual.formula}</Formula>
        </>
      );
    case "force-mass":
      return (
        <>
          <rect x="87" y="35" width="70" height="55" />
          <path d="M24 62h52m0 0-15-10m15 10-15 10M157 62h58m0 0-15-10m15 10-15 10" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "speed-distance":
      return (
        <>
          <path d="M27 76C63 36 94 35 124 62s54 25 91-12" />
          <circle cx="27" cy="76" r="5" className="calculator-thumbnail-node" />
          <circle cx="215" cy="50" r="5" className="calculator-thumbnail-node" />
          <circle cx="120" cy="58" r="18" /><path d="M120 58V44M120 58l10 7" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "wavelength":
      return (
        <>
          <path d="M20 59c18-38 36-38 54 0s36 38 54 0 36-38 54 0 36 38 54 0" className="calculator-thumbnail-signal" />
          <path d="M38 26h72m0 0-10-7m10 7-10 7M38 26l10-7M38 26l10 7" /><Formula>{visual.formula}</Formula>
        </>
      );
    case "frequency-period":
      return (
        <>
          <path d="M20 58c12-30 24-30 36 0s24 30 36 0 24-30 36 0 24 30 36 0 24-30 36 0 24 30 36 0" className="calculator-thumbnail-signal" />
          <path d="M44 25h48m0 0-9-6m9 6-9 6M44 25l9-6M44 25l9 6" /><Formula>{visual.formula}</Formula>
        </>
      );
    case "percentage-change":
      return (
        <>
          <rect x="44" y="52" width="48" height="39" /><rect x="148" y="28" width="48" height="63" />
          <path d="M99 66h37m0 0-12-8m12 8-12 8" className="calculator-thumbnail-signal" /><Formula>{visual.formula}</Formula>
        </>
      );
    case "square-root":
      return (
        <>
          <rect x="79" y="25" width="82" height="70" />
          <path d="M79 103h82m-82 0 10-7m-10 7 10 7m72-7-10-7m10 7-10 7" className="calculator-thumbnail-signal" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    case "cube-root":
      return (
        <>
          <path d="M74 44l42-22 52 18-42 23-52-19v45l52 20 42-24V40M126 63v46" />
          <path d="M78 96h44" className="calculator-thumbnail-signal" /><Formula>{visual.formula}</Formula>
        </>
      );
    case "ohms":
      return (
        <>
          <EndNodes /><path d="M20 58h34" /><Resistor x={54} width={72} /><path d="M126 58h94" />
          <Formula>{visual.formula}</Formula>
        </>
      );
    default:
      if (visual.kind === "rot") return <><text x="120" y="40" textAnchor="middle">H E L L O</text><path d="M120 48v20m-6-6 6 6 6-6"/><text x="120" y="90" textAnchor="middle">U R Y Y B</text><Formula>{visual.formula}</Formula></>;
      if (visual.kind === "coil") return <><path d="M20 60h35c0-40 30-40 30 0s30 40 30 0 30-40 30 0 30 40 30 0h45"/><Formula>{visual.formula}</Formula></>;
      if (visual.kind === "tank") return <><path d="M65 35h110v25m0 15v20H65V35m0 10c25 0 25 12 0 12s-25 12 0 12 25 12 0 12M155 60h40m-40 15h40"/><Formula>{visual.formula}</Formula></>;
      if (visual.kind === "bandpass") return <><path d="M30 20v75h180M35 90c30 0 35-50 60-50h50c25 0 35 50 60 50"/><Formula>{visual.formula}</Formula></>;
      if (visual.kind === "opamp") return <><path d="M28 65h46m68 0h26m20 0h48"/><path d="M74 38l48 27-48 27z"/><path d="M140 35v60"/><Formula>{visual.formula}</Formula></>;
      if (visual.kind === "logic") return <><path d="M22 65h42m48 0h44m46 0h38"/><rect x="64" y="43" width="48" height="44" rx="4"/><path d="M154 43h24c30 0 30 44 0 44h-24z"/><Formula>{visual.formula}</Formula></>;
      throw new Error(`Unsupported calculator visual kind: ${visual.kind}`);
  }
}

export function CalculatorThumbnail({ visualKey, title, compact = false }) {
  const visual = calculatorVisuals[visualKey];
  if (!visual) throw new Error(`Unknown calculator visual: ${visualKey}`);

  return (
    <div
      className={`calculator-thumbnail calculator-thumbnail--${visual.accent}${compact ? " calculator-thumbnail--compact" : ""}`}
      role="img"
      aria-label={visual.ariaLabel || `${title} technical relationship`}
    >
      {visual.imageDark ? (
        <>
          <img className="calculator-thumbnail-image calculator-thumbnail-image-dark" src={visual.imageDark} alt="" aria-hidden="true" />
          <img className="calculator-thumbnail-image calculator-thumbnail-image-light" src={visual.imageLight} alt="" aria-hidden="true" />
        </>
      ) : visual.image ? (
        <img
          className="calculator-thumbnail-image"
          src={visual.image}
          alt=""
          aria-hidden="true"
        />
      ) : (
        <svg viewBox="0 0 240 135" aria-hidden="true" focusable="false">
          <InstrumentGrid />
          <g className="calculator-thumbnail-diagram"><Diagram visual={visual} /></g>
        </svg>
      )}
    </div>
  );
}
