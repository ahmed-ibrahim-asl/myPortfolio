// Link-budget diagram preparation.
import { rfPath, constants } from "./engine.js";
function rows(terms) {
  let running = 0;
  return terms.map(([label, delta]) => {
    const start = running;
    running += delta;
    return { label, delta, start, end: running };
  });
}
function carrier(v, mode, title) {
  const path = rfPath(v, mode);
  return {
    title,
    unit: "dBW",
    rows: rows([
      ["TX power", 10 * Math.log10(v.powerW)],
      ["TX gain", Number(v.transmitGainDb || 0)],
      ["TX feeder", -Number(v.transmitLossDb || 0)],
      ["Free space", -path.fsplDb],
      ["Other path", -Number(v.pathLossDb || 0)],
      ["RX gain", Number(v.receiveGainDb || 0)],
      ["RX feeder", -Number(v.receiveLossDb || 0)]
    ])
  };
}
export function linkVisual(v, mode = "course") {
  if (v.linkMode === "basic") return [carrier(v, mode, "Received carrier power")];
  if (v.linkMode === "course-ft")
    return [
      carrier(v.uplink, mode, "Uplink received carrier"),
      carrier(v.downlink, mode, "Downlink received carrier")
    ];
  return ["uplink", "downlink"].map((leg) => ({
    title: `${leg === "uplink" ? "Uplink" : "Downlink"} C/N₀`,
    unit: "dB-Hz",
    rows: rows([
      ["EIRP", v[`${leg}EirpDbw`]],
      ["G/T", v[`${leg}GtDbK`]],
      ["Path loss", -v[`${leg}LossDb`]],
      ["−10 log k", -10 * Math.log10(constants(mode).k)]
    ])
  }));
}
