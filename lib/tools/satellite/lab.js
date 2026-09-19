/** Logical Scientech 2272A teaching model, not an electrical circuit emulator. */
export const LAB_FREQUENCIES = [2414, 2432, 2450, 2468];
const descriptions = [
  [
    "Direct tone link",
    "Match transmitter and receiver without a transponder.",
    "Select 2468 MHz on both ground units; select Tone on Channel B. Adjust amplitude and tone frequency."
  ],
  [
    "Active link & failure",
    "Observe amplification and frequency translation through the active satellite.",
    "Power transmitter, satellite, then receiver. Match uplink and downlink pairs. Switch satellite power off and explain LINK FAIL."
  ],
  [
    "Audio / video",
    "Recover independent audio and video through the satellite.",
    "Patch video and Audio-II sources and outputs. Select Video on Channel A and Audio-II on Channel B; observe the monitor and audio indicator."
  ],
  [
    "Voice link",
    "Transmit a microphone signal through Audio-II.",
    "Patch the microphone; select MIC at the transmitter and Speaker at the receiver. Change voice level and inspect the envelope."
  ],
  [
    "Frequency combinations",
    "Discover which frequency pairs form a valid link.",
    "Try each manual frequency preset. Change one frequency alone, observe failure, then restore its matching partner."
  ],
  [
    "Simultaneous signals",
    "Receive video, Audio-I and Audio-II tone together.",
    "Select Video on A and Tone on B; patch audio and video. Disconnect each source independently and inspect the three outputs."
  ],
  [
    "Function generator",
    "Compare sine, square and triangle waves up to 5 kHz.",
    "Patch generator to Audio-I and receiver to scope. Begin at 1 kHz; change waveform and frequency; add attenuation and noise."
  ],
  [
    "PC data",
    "Send text from PC1 to PC2 through the satellite.",
    "Select Data on Channel A. Connect both virtual USB ports, enter text, transmit, and disconnect the ports after use."
  ],
  [
    "Simulated delay",
    "Measure separation between transmitted and received data edges.",
    "Select Data on Channel A and Telemetry On. Start with 50 ms/div and 2 V/div; turn Delay Adjust and compare both traces."
  ],
  [
    "Light telemetry",
    "Send a telecommand and read the returned light sensor.",
    "Select Tele on Channel A and Telemetry On. Request light (manual: E low, A1 high, A0 low). Vary light intensity."
  ],
  [
    "Temperature telemetry",
    "Send a telecommand and read the returned temperature.",
    "Select Tele on Channel A and Telemetry On. Request temperature (E low, A1 low, A0 high). Vary the sensor from 20 to 80 °C."
  ],
  [
    "Carrier-to-noise measurement",
    "Compare RF carrier-on and carrier-off power.",
    "Disable tone. Capture carrier plus noise, switch transmitter off, capture noise floor. Subtract powers in linear units when the first reading includes noise."
  ],
  [
    "Signal-to-noise measurement",
    "Compare detected baseband voltage and noise.",
    "Select Tone; capture signal plus noise. Change transmitter B to MIC to capture noise. Compare the course amplitude approximation with independent RMS power subtraction."
  ]
];
export const LAB_EXPERIMENTS = descriptions.map(([title, objective, procedure], i) => ({
  id: i + 1,
  title,
  objective,
  procedure
}));
export function createLabState(experiment = 1) {
  const n = Number(experiment);
  if (!LAB_EXPERIMENTS.some((e) => e.id === n)) throw new RangeError("Choose experiment 1–13");
  const video = [3, 6].includes(n),
    data = [8, 9].includes(n),
    tele = [10, 11].includes(n);
  return {
    experiment: n,
    power: { tx: true, satellite: n !== 1, rx: true },
    txFreq: 2468,
    satRx: 2468,
    satTx: 2414,
    rxFreq: n === 1 ? 2468 : 2414,
    txA: video ? "Video" : data ? "Data" : tele ? "Tele" : "Off",
    rxA: video ? "Video" : data ? "Data" : tele ? "Tele" : "Off",
    txB: n === 3 ? "Audio-II" : n === 4 ? "MIC" : n === 12 ? "Off" : "Tone",
    rxB: n === 3 ? "Audio-II" : n === 4 || n === 6 ? "Speaker" : "Tone",
    cables: {
      txDish: true,
      satRxDish: true,
      satTxDish: true,
      rxDish: true,
      video: true,
      audio: true,
      microphone: true,
      generator: true,
      scope: true,
      usb1: true,
      usb2: true
    },
    alignment: 0,
    toneHz: 1000,
    amplitudeVpp: 2,
    voiceLevel: 70,
    waveform: "Sine",
    noise: 0,
    attenuationDb: 0,
    delayMs: 50,
    telemetryOn: [9, 10, 11].includes(n),
    command: n === 11 ? "temperature" : "light",
    light: 50,
    temperature: 25,
    ports: { pc1: true, pc2: true }
  };
}
export function evaluateLab(s) {
  const faults = [];
  const direct = s.experiment === 1;
  for (const key of direct ? ["tx", "rx"] : ["tx", "satellite", "rx"])
    if (!s.power[key]) faults.push(`${key} power OFF`);
  for (const key of direct ? ["txDish", "rxDish"] : ["txDish", "satRxDish", "satTxDish", "rxDish"])
    if (!s.cables[key]) faults.push(`${key} RF cable missing`);
  if (direct ? s.txFreq !== s.rxFreq : s.txFreq !== s.satRx)
    faults.push("Uplink frequency mismatch");
  if (!direct && s.satTx !== s.rxFreq) faults.push("Downlink frequency mismatch");
  if (
    !LAB_FREQUENCIES.includes(s.txFreq) ||
    !LAB_FREQUENCIES.includes(s.rxFreq) ||
    (!direct && (!LAB_FREQUENCIES.includes(s.satRx) || !LAB_FREQUENCIES.includes(s.satTx)))
  )
    faults.push("Unsupported training frequency");
  if (Math.abs(s.alignment) > 30) faults.push("Dish alignment outside the teaching beam");
  const rfLinked = faults.length === 0;
  const a = (mode) => s.txA === mode && s.rxA === mode;
  const channels = {
    video: rfLinked && a("Video") && s.cables.video,
    audio:
      rfLinked &&
      s.cables.audio &&
      (s.experiment === 6 || (s.experiment === 3 && s.txB === "Audio-II" && s.rxB === "Audio-II")),
    tone:
      rfLinked && s.txB === "Tone" && ["Tone", "Speaker"].includes(s.rxB) && s.experiment !== 12,
    voice: rfLinked && s.txB === "MIC" && s.rxB === "Speaker" && s.cables.microphone,
    function: rfLinked && s.experiment === 7 && s.cables.generator && s.cables.scope,
    data: rfLinked && a("Data"),
    telemetry:
      rfLinked &&
      a("Tele") &&
      s.telemetryOn &&
      s.command === (s.experiment === 11 ? "temperature" : "light")
  };
  const gain = Math.cos((s.alignment * Math.PI) / 180) ** 2 * 10 ** (-s.attenuationDb / 20);
  return {
    rfLinked,
    faults,
    channels,
    gain,
    telemetry: channels.telemetry ? (s.command === "light" ? s.light : s.temperature) : null,
    carrierDbm: rfLinked ? -35.3 + 20 * Math.log10(Math.max(gain, 1e-6)) : -99.8,
    noiseDbm: -99.8
  };
}
export function carrierNoise(carrierDbm, noiseDbm, includesNoise = false) {
  if (!Number.isFinite(carrierDbm) || !Number.isFinite(noiseDbm))
    throw new RangeError("Enter finite power levels");
  const ratio = 10 ** ((carrierDbm - noiseDbm) / 10) - (includesNoise ? 1 : 0);
  if (ratio <= 0) throw new RangeError("Carrier plus noise must be greater than noise");
  return {
    linear: ratio,
    db: 10 * Math.log10(ratio),
    formula: includesNoise ? "C/N = 10^((C+N − N)/10) − 1" : "C/N(dB) = C(dBm) − N(dBm)"
  };
}
export function signalNoise(total, noise, mode = "course") {
  if (!Number.isFinite(total) || !Number.isFinite(noise) || noise <= 0 || total <= noise)
    throw new RangeError("Signal plus noise must be greater than positive noise");
  const signal = mode === "engineering" ? Math.sqrt(total ** 2 - noise ** 2) : total - noise;
  return {
    signal,
    amplitudeRatio: signal / noise,
    powerRatio: (signal / noise) ** 2,
    db: 20 * Math.log10(signal / noise),
    formula:
      mode === "engineering"
        ? "Srms = √(Vrms,total² − Vrms,noise²); SNR = 20 log10(Srms/Nrms)"
        : "S ≈ S1 − N; SNR = 20 log10(S/N)"
  };
}
export function transmitData(s, text) {
  if (!s.ports.pc1 || !s.ports.pc2 || !s.cables.usb1 || !s.cables.usb2)
    return { status: "disconnected", text: "", reason: "Connect both PCs and USB patches" };
  if (!evaluateLab(s).channels.data)
    return {
      status: "failed",
      text: "",
      reason: "Data not received: establish RF link and select Data on both Channel A controls"
    };
  if (!text.trim()) return { status: "ready", text: "", reason: "Enter a message" };
  return { status: "received", text, reason: "PC2 received the transmitted text" };
}
export function waveformSamples(s, received = false, count = 240) {
  const link = evaluateLab(s),
    data = [8, 9].includes(s.experiment),
    duration = data ? 0.5 : 4 / Math.max(1, s.toneHz),
    delay = received && data ? s.delayMs / 1000 : 0;
  const available = data
    ? link.channels.data
    : s.experiment === 4
      ? link.channels.voice
      : s.experiment === 7
        ? link.channels.function
        : link.channels.tone;
  return Array.from({ length: count }, (_, i) => {
    const t = (i / (count - 1)) * duration,
      phase = (t - delay) * (data ? 10 : s.toneHz),
      p = ((phase % 1) + 1) % 1;
    let y =
      data || s.waveform === "Square"
        ? p < 0.5
          ? 1
          : -1
        : s.waveform === "Triangle"
          ? 1 - 4 * Math.abs(p - 0.5)
          : Math.sin(phase * 2 * Math.PI);
    if (s.experiment === 4)
      y *= (s.voiceLevel / 100) * (0.35 + 0.65 * Math.abs(Math.sin(t * 1200)));
    if (received)
      y = available && s.cables.scope ? y * link.gain + (s.noise / 100) * Math.sin(i * 31.71) : 0;
    return { x: i / (count - 1), y: (y * s.amplitudeVpp) / 2 };
  });
}
