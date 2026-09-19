import { calculate } from "./engine.js";
import { satelliteTheoryQuestions } from "../../../data/satellite-course.js";
import { encodeProblem } from "./state.js";
const numericalTopics = [
  ["orbit", "Circular orbit"],
  ["eccentricity", "Eccentricity"],
  ["fspl", "Free-space loss"],
  ["antenna", "Dish gain"],
  ["noise", "Thermal noise"],
  ["gt", "G/T"],
  ["scpc", "SCPC channels"],
  ["tdma", "TDMA efficiency"],
  ["link", "Link budget"],
  ["pfd", "Power flux density"],
  ["received-power", "Received power"],
  ["noise-figure", "Noise figure"],
  ["doppler", "Doppler calculation"]
];
const conceptualTopics = [...new Set(satelliteTheoryQuestions.map((q) => q.topic))];
export const practiceTopics = [
  ["all", "All topics"],
  ...numericalTopics,
  ...conceptualTopics
    .filter((t) => !numericalTopics.some(([id]) => id === t))
    .map((t) => [t, `${t.replaceAll("-", " ")} concepts`]),
  ["theory", "All theory"]
];
const families = {
  m: { m: 1, km: 1000 },
  "m/s": { "m/s": 1, "km/s": 1000 },
  "m²": { "m²": 1 },
  W: { W: 1, mW: 0.001 },
  "°": { "°": 1 },
  "bit/s": { "bit/s": 1, "kbit/s": 1000, "Mbit/s": 1e6 },
  terminals: { terminals: 1 },
  s: { s: 1, min: 60, h: 3600 },
  Hz: { Hz: 1, kHz: 1000, MHz: 1e6 },
  "W/m²": { "W/m²": 1, "nW/m²": 1e-9 },
  dB: { dB: 1 },
  dBi: { dBi: 1 },
  dBW: { dBW: 1 },
  dBm: { dBm: 1 },
  "dB/K": { "dB/K": 1 },
  channels: { channels: 1 },
  fraction: { fraction: 1, "%": 0.01 },
  dimensionless: { dimensionless: 1 }
};
function rng(seed) {
  let s = (Number(seed) || 1) >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function generateQuestion(topic = "orbit", seed = 42) {
  const random = rng(seed);
  const example = Number(seed) === 42;
  const pick = (a) => a[Math.floor(random() * a.length)];
  let slug, values, key, unit, prompt, hints, source;
  source = { file: "finalExam.pdf", page: 2 };
  if (topic === "pfd" || topic === "received-power") {
    slug = "rf-path";
    values = {
      frequencyHz: 6e9,
      distanceM: 10000,
      powerW: 10,
      transmitGainDb: example ? 0 : pick([0, 10, 20]),
      receiveGainDb: 0
    };
    key = topic === "pfd" ? "pfdWm2" : "receivedPowerDbw";
    unit = topic === "pfd" ? "W/m²" : "dBW";
    prompt = `A 10 W transmitter has gain ${values.transmitGainDb} dBi toward a receiver 10 km away at 6 GHz. Receive gain is 0 dBi and all additional losses are zero. Find ${topic === "pfd" ? "power flux density in W/m²" : "received carrier power in dBW"}.`;
    hints = [
      "Convert transmitter power and gain into EIRP.",
      "For flux divide EIRP by 4πd²; for received power subtract FSPL from EIRP in dBW and add receive gain."
    ];
    source = { file: "finalExam.pdf", page: 3 };
  } else if (topic === "doppler") {
    slug = "doppler-delay";
    values = {
      frequencyHz: 2e9,
      radialVelocityMps: example ? 6000 : pick([-7000, -3000, 3000, 7000]),
      distanceM: 800e3
    };
    key = "dopplerHz";
    unit = "Hz";
    prompt = `A 2 GHz carrier has recession-positive radial velocity ${values.radialVelocityMps} m/s. Find the signed first-order Doppler shift using c = 3 × 10⁸ m/s.`;
    hints = [
      "Use radial velocity, not total orbital speed.",
      "Δf = −f vᵣ/c; recession produces a negative shift."
    ];
    source = { file: "finalExam.pdf", page: 1 };
  } else if (topic === "noise-figure") {
    slug = "noise-gt";
    values = {
      noiseMode: "nf",
      noiseFactor: example ? 2 : pick([1.5, 2, 3, 4]),
      referenceTemperatureK: 290
    };
    key = "noiseFigureDb";
    unit = "dB";
    prompt = `A receiver has linear noise factor ${values.noiseFactor}. Find its noise figure in dB.`;
    hints = ["Noise factor is a power ratio.", "Use 10 log₁₀(F), not 20 log₁₀(F)."];
    source = { file: "finalExam.pdf", page: 5 };
  } else if (topic === "eccentricity") {
    slug = "orbit";
    values = {
      orbitMode: "elliptical",
      apogeeRadiusM: (example ? 7600 : pick([8000, 10000, 12000])) * 1000,
      perigeeRadiusM: 7200e3
    };
    key = "eccentricity";
    unit = "dimensionless";
    prompt = `An elliptical orbit has apogee radius ${values.apogeeRadiusM / 1000} km and perigee radius 7200 km, measured from Earth's centre. Find eccentricity.`;
    hints = [
      "Use the radii measured from Earth’s centre.",
      "Subtract the radii, then divide by their sum."
    ];
  } else if (topic === "fspl") {
    slug = "rf-path";
    values = {
      frequencyHz: (example ? 6 : pick([2, 4, 6, 10, 12])) * 1e9,
      distanceM: (example ? 10 : pick([5, 10, 20, 100])) * 1000,
      powerW: 10,
      transmitGainDb: 0,
      receiveGainDb: 0
    };
    key = "fsplDb";
    unit = "dB";
    prompt = `Find free-space path loss for ${values.distanceM / 1000} km at ${values.frequencyHz / 1e9} GHz.`;
    hints = [
      "Normalize frequency to Hz and distance to metres.",
      "Use 20 log₁₀(4πdf/c); the practical km/GHz constant is approximately 92.44."
    ];
    source = { file: "finalExam.pdf", page: 3 };
  } else if (topic === "antenna") {
    slug = "antenna";
    values = {
      frequencyHz: (example ? 10 : pick([6, 10, 12])) * 1e9,
      diameterM: example ? 2 : pick([0.9, 1.2, 2, 3]),
      efficiency: 0.7
    };
    key = "gainDb";
    unit = "dBi";
    prompt = `A ${values.diameterM} m dish operates at ${values.frequencyHz / 1e9} GHz with aperture efficiency 0.70. Find antenna gain in dBi.`;
    hints = [
      "Find wavelength using c/f.",
      "Calculate η(πD/λ)² in linear units, then apply 10 log₁₀."
    ];
    source = { file: "finalExam.pdf", page: 4 };
  } else if (topic === "noise" || topic === "gt") {
    slug = "noise-gt";
    values = {
      temperatureK: 300.15,
      bandwidthHz: (example ? 30 : pick([2, 10, 20, 30])) * 1e6,
      gainDb: 44
    };
    key = topic === "gt" ? "gtDbK" : "noiseDbm";
    unit = topic === "gt" ? "dB/K" : "dBm";
    prompt =
      topic === "gt"
        ? "Find receiver G/T for antenna gain 44 dBi and system temperature 300.15 K."
        : `Find thermal noise in dBm for 300.15 K and bandwidth ${values.bandwidthHz / 1e6} MHz. Use k = 1.38 × 10⁻²³ J/K.`;
    hints =
      topic === "gt"
        ? [
            "Use the system noise temperature in Kelvin.",
            "Subtract 10 log₁₀(T) from antenna gain in dBi."
          ]
        : ["Calculate kTB in watts.", "Convert watts to dBW with 10 log₁₀, then add 30 for dBm."];
    source = { file: "finalExam.pdf", page: 4 };
  } else if (topic === "scpc") {
    slug = "multiple-access";
    values = {
      accessMode: "scpc",
      transponderBandwidthHz: (example ? 54 : pick([36, 54, 72])) * 1e6,
      channelSpacingHz: 60e3
    };
    key = "channels";
    unit = "channels";
    prompt = `A ${values.transponderBandwidthHz / 1e6} MHz transponder uses 60 kHz channel spacing. How many complete SCPC channels fit?`;
    hints = [
      "Put both bandwidths in the same units.",
      "Divide available bandwidth by channel spacing and round down."
    ];
    source = { file: "finalExam.pdf", page: 6 };
  } else if (topic === "tdma") {
    slug = "multiple-access";
    values = {
      accessMode: "tdma",
      bitRate: 125e6,
      frameDurationS: 0.005,
      referenceStations: 10,
      trafficTerminals: example ? 25 : pick([20, 30, 40]),
      referenceBits: 575,
      preambleBits: 565,
      guardBits: 130,
      targetEfficiency: 0.9,
      voiceBitRate: 64000,
      convention: "final-2026"
    };
    key = "efficiency";
    unit = "fraction";
    prompt = `Find actual frame efficiency at 125 Mbit/s and 5 ms with 10 reference stations and ${values.trafficTerminals} traffic terminals. Reference burst = 575 bits, preamble = 565 bits, guard = 130 bits. Use the 2026 convention (traffic guards only).`;
    hints = [
      "Frame bits equal bit rate multiplied by frame duration in seconds.",
      "Overhead = 10 × 575 + traffic terminals × (565 + 130). Efficiency = 1 − overhead/frame bits."
    ];
    source = { file: "finalExam.pdf", page: 7 };
  } else if (topic === "link") {
    slug = "link-budget";
    values = {
      uplinkEirpDbw: 60,
      uplinkGtDbK: 5,
      uplinkLossDb: 205,
      downlinkEirpDbw: 50,
      downlinkGtDbK: 19.23,
      downlinkLossDb: 205,
      bandwidthHz: 30e6,
      bitRate: 10e6,
      requiredEbNoDb: 10
    };
    key = "ebNoDb";
    unit = "dB";
    prompt =
      "For uplink EIRP 60 dBW, G/T 5 dB/K and loss 205 dB; downlink EIRP 50 dBW, G/T 19.23 dB/K and loss 205 dB, find composite Eᵦ/N₀ at 10 Mbit/s. Use independent-noise reciprocal combination.";
    hints = [
      "Compute each C/N₀ = EIRP + G/T − loss − 10 log₁₀(k).",
      "Combine the linear C/N₀ values by their reciprocals, then subtract 10 log₁₀(bit rate) in dB."
    ];
    source = { file: "week 3/reference.pdf", page: 263, pages: [263, 264, 267, 268] };
  } else {
    topic = "orbit";
    slug = "orbit";
    values = {
      orbitMode: "circular",
      altitudeM: (example ? 800 : pick([400, 600, 800, 1000, 1200])) * 1000,
      earthRadiusM: 6371e3,
      mu: 3.986e14
    };
    key = "periodS";
    unit = "s";
    prompt = `Find the orbital period of a circular satellite ${values.altitudeM / 1000} km above Earth. Earth radius = 6371 km; μ = 398600 km³/s².`;
    hints = [
      "Orbital radius equals Earth radius plus altitude.",
      "Use T = 2π√(r³/μ) with consistent distance units."
    ];
  }
  // Preserve seed 42 as the printed course example; other seeds also vary what is asked.
  if (!example) {
    const variants = {
      orbit: [
        ["periodS", "s", "orbital period", "Use T = 2π√(r³/μ)."],
        ["radiusM", "m", "orbital radius", "Add Earth radius and altitude."],
        ["velocityMps", "m/s", "circular orbital velocity", "Use v = √(μ/r)."]
      ],
      eccentricity: [
        ["eccentricity", "dimensionless", "eccentricity", "Use (rₐ−rₚ)/(rₐ+rₚ)."],
        ["semiMajorAxisM", "m", "semi-major axis", "Average the two apsis radii."]
      ],
      antenna: [
        ["gainDb", "dBi", "gain in dBi", "Apply 10 log₁₀ to linear gain."],
        ["wavelengthM", "m", "wavelength", "Use λ = c/f."],
        ["physicalApertureM2", "m²", "physical aperture", "Use πD²/4."],
        [
          "effectiveApertureM2",
          "m²",
          "effective aperture",
          "Multiply physical aperture by efficiency."
        ],
        ["gainLinear", "dimensionless", "linear power gain", "Use η(πD/λ)²."],
        ["beamwidthDeg", "°", "half-power beamwidth with course factor 75", "Use 75λ/D in degrees."]
      ],
      noise: [
        ["noiseDbm", "dBm", "thermal noise in dBm", "Convert kTB to dBW, then add 30."],
        ["noiseW", "W", "thermal noise in watts", "Use N = kTB."],
        ["noiseDbw", "dBW", "thermal noise in dBW", "Use 10 log₁₀(kTB / 1 W)."]
      ],
      scpc: [
        [
          "channels",
          "channels",
          "maximum complete channels",
          "Floor the bandwidth divided by spacing."
        ],
        [
          "unusedBandwidthHz",
          "Hz",
          "unused bandwidth",
          "Subtract complete channels times spacing from the transponder bandwidth."
        ]
      ],
      tdma: [
        ["efficiency", "fraction", "actual efficiency", "Subtract the overhead fraction from one."],
        [
          "maxTerminals",
          "terminals",
          "maximum traffic terminals at target efficiency 0.90",
          "Solve the overhead inequality and floor the bound."
        ],
        [
          "requiredBitRate",
          "bit/s",
          "minimum bit rate at target efficiency 0.90 for the stated terminal count",
          "Divide overhead by frame duration times (1−0.90)."
        ],
        [
          "trafficBitRate",
          "bit/s",
          "actual payload bit rate",
          "Divide frame payload bits by frame duration."
        ],
        [
          "voiceChannels",
          "channels",
          "complete 64 kbit/s PCM voice channels",
          "Floor actual payload rate divided by 64000."
        ]
      ]
    }[topic];
    if (variants) {
      const variant = variants[Math.abs(Math.trunc(Number(seed))) % variants.length];
      [key, unit] = variant;
      const given = {
        orbit: `A circular satellite is ${values.altitudeM / 1000} km above Earth. Earth radius = ${values.earthRadiusM / 1000} km and μ = ${values.mu / 1e9} km³/s².`,
        eccentricity: `An ellipse has apogee radius ${values.apogeeRadiusM / 1000} km and perigee radius ${values.perigeeRadiusM / 1000} km, measured from Earth's centre.`,
        antenna: `A ${values.diameterM} m dish operates at ${values.frequencyHz / 1e9} GHz with aperture efficiency ${values.efficiency}. Use c = 3 × 10⁸ m/s.`,
        noise: `The system temperature is ${values.temperatureK} K and noise bandwidth is ${values.bandwidthHz / 1e6} MHz. Use k = 1.38 × 10⁻²³ J/K.`,
        scpc: `A ${values.transponderBandwidthHz / 1e6} MHz transponder uses ${values.channelSpacingHz / 1000} kHz channel spacing including guards.`,
        tdma: `A TDMA frame uses ${values.bitRate / 1e6} Mbit/s and ${values.frameDurationS * 1000} ms, with ${values.referenceStations} reference stations and ${values.trafficTerminals} traffic terminals. Reference burst = ${values.referenceBits} bits, preamble = ${values.preambleBits} bits, guard = ${values.guardBits} bits. Use the 2026 convention (traffic guards only).`
      }[topic];
      prompt = `${given} Find the ${variant[2]} (${unit}).`;
      hints = [hints[0], variant[3]];
    }
  }
  const calculation = calculate(slug, values, "course");
  const result = calculation.results.find((r) => r.key === key);
  if (!result) throw Error(`Practice result ${key} unavailable for ${slug}`);
  return {
    id: `${topic}-${seed}`,
    topic,
    slug,
    values,
    prompt,
    expected: result.value,
    unit,
    units: Object.keys(families[unit] ?? { [unit]: 1 }),
    tolerance: ["W/m²", "W"].includes(unit)
      ? Math.abs(result.value) * 0.001
      : ["channels", "terminals"].includes(unit)
        ? 0
        : unit === "dimensionless"
          ? 0.00005
          : unit === "fraction"
            ? 0.00005
            : unit === "s"
              ? 0.5
              : 0.05,
    hints,
    steps: calculation.steps,
    interpretation: result.interpretation,
    source,
    learnHref: `/tools/satellite/${slug}/${encodeProblem(slug, values, "course")}&return=practice&topic=${topic}&seed=${seed}`
  };
}
export function gradeAnswer(question, answer, unit = question.unit) {
  if (question.choices) {
    const correct = String(answer) === String(question.answer);
    return {
      correct,
      message: correct ? "Correct." : "Choose the answer that matches the physical definition."
    };
  }
  if (answer === "" || answer === null || answer === undefined || !Number.isFinite(Number(answer)))
    return { correct: false, message: "Enter a finite numerical answer." };
  const conversion = families[question.unit]?.[unit];
  if (conversion === undefined)
    return { correct: false, message: `Choose an answer unit compatible with ${question.unit}.` };
  const value = Number(answer) * conversion;
  const correct = Math.abs(value - question.expected) <= question.tolerance;
  return {
    correct,
    message: correct
      ? "Correct, within the stated rounding tolerance."
      : "Check the units and the next hint, then try again."
  };
}
export function supportsNumericalPractice(topic) {
  return topic === 'all' || numericalTopics.some(([id])=>id===topic);
}
export function createSession(mode = "topic", topic = "all", seed = 42, kind = "mixed") {
  if(kind==='numerical'&&!supportsNumericalPractice(topic))throw new RangeError('Choose a calculation topic for numerical-only practice, or select Theory/Mixed.');
  seed = Number.isFinite(Number(seed)) ? Math.abs(Math.trunc(Number(seed))) >>> 0 : 42;
  const numeric = numericalTopics.map(([id]) => id);
  const count = mode === "final" ? 12 : mode === "midterm" ? 8 : mode === "quiz" ? 5 : 1;
  const aliases = {
    eccentricity: "orbit",
    fspl: "rf-path",
    pfd: "rf-path",
    "received-power": "rf-path",
    noise: "noise-gt",
    gt: "noise-gt",
    "noise-figure": "noise-gt",
    scpc: "multiple-access",
    tdma: "multiple-access",
    link: "link-budget",
    doppler: "doppler-delay"
  };
  const theory = satelliteTheoryQuestions.filter(
    (q) => topic === "all" || topic === "theory" || q.topic === (aliases[topic] || topic)
  );
  return Array.from({ length: count }, (_, i) => {
    const useTheory =
      kind === "theory" ||
      topic === "theory" ||
      (topic !== "all" && !numeric.includes(topic)) ||
      (kind !== "numerical" && topic === "all" && i % 3 === 2);
    if (useTheory && theory.length) {
      const q = theory[(seed + i) % theory.length];
      return {
        ...q,
        id: `${q.id}-${seed}-${i}`,
        hints: [`Think about ${q.topic.replaceAll("-", " ")}.`, q.explanation],
        unit: "choice",
        units: [],
        learnHref: `/tools/satellite/${q.topic}/`
      };
    }
    return generateQuestion(
      topic === "all" || topic === "theory" ? numeric[i % numeric.length] : topic,
      seed + i
    );
  });
}
export function scoreSession(attempts) {
  const earned = attempts.reduce(
    (sum, a) => sum + (a.correct && !a.revealed ? Math.max(0.25, 1 - (a.hints ?? 0) * 0.25) : 0),
    0
  );
  return {
    earned,
    possible: attempts.length,
    percent: attempts.length ? (100 * earned) / attempts.length : 0
  };
}

export function reviewSession(attempts) {
  const routes = {
    pfd: "rf-path",
    "received-power": "rf-path",
    "noise-figure": "noise-gt",
    doppler: "doppler-delay",
    eccentricity: "orbit",
    fspl: "rf-path",
    noise: "noise-gt",
    gt: "noise-gt",
    scpc: "multiple-access",
    tdma: "multiple-access",
    link: "link-budget"
  };
  const topics = [...new Set(attempts.map((a) => a.topic))].map((topic) => ({
    topic,
    ...scoreSession(attempts.filter((a) => a.topic === topic)),
    href: `/tools/satellite/${routes[topic] || topic}/`
  }));
  return {
    ...scoreSession(attempts),
    topics,
    checks: attempts.reduce((n, a) => n + (a.checks || 0), 0),
    elapsedSeconds: attempts.reduce((n, a) => n + (a.elapsedSeconds || 0), 0),
    recommendations: topics.filter((t) => t.percent < 100).sort((a, b) => a.percent - b.percent)
  };
}

export function restorePracticeSession(text){
  try{
    if(typeof text!=='string'||text.length>20000)return null;
    const s=JSON.parse(text);
    if(s?.version!==2||!['topic','quiz','midterm','final'].includes(s.mode)||!practiceTopics.some(([id])=>id===s.topic)||!['mixed','numerical','theory'].includes(s.kind)||!Number.isFinite(s.seed))return null;
    const questions=createSession(s.mode,s.topic,s.seed,s.kind);
    if(!Number.isInteger(s.index)||s.index<0||s.index>=questions.length||!Array.isArray(s.attempts)||s.attempts.length>questions.length)return null;
    const nonnegative=v=>Number.isFinite(v)&&v>=0&&v<=1e9;
    for(const key of ['hints','steps','checks','seconds'])if(s[key]!==undefined&&!nonnegative(s[key]))return null;
    if(s.attempts.some(a=>!a||typeof a.correct!=='boolean'||!practiceTopics.some(([id])=>id===a.topic)||['hints','checks','elapsedSeconds'].some(k=>a[k]!==undefined&&!nonnegative(a[k]))))return null;
    if(typeof s.answer!=='string'||s.answer.length>100||typeof s.unit!=='string')return null;
    const q=questions[s.index];
    if(s.unit!=='choice'&&!q.units.includes(s.unit))return null;
    return {...s,feedback:s.feedback?gradeAnswer(q,s.answer,s.unit):null};
  }catch{return null;}
}
