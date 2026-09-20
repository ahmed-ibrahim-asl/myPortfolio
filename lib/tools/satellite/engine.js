/** Pure satellite calculations. Distances m, frequency Hz, time s, temperature K.
 * Losses are positive dB; gains are power ratios or explicitly suffixed dB. */
import { resultMetadata } from "./result-metadata.js";
export const CONSTANTS = Object.freeze({
  course: Object.freeze({
    c: 3e8,
    mu: 398600.4e9,
    k: 1.38e-23,
    earthRadiusM: 6371e3,
    referenceTemperatureK: 290,
    siderealDayS: 86164
  }),
  engineering: Object.freeze({
    c: 299792458,
    mu: 398600.4418e9,
    k: 1.380649e-23,
    earthRadiusM: 6371e3,
    referenceTemperatureK: 290,
    siderealDayS: 86164.0905
  })
});
export const EARTH_MU_KM3_S2 = 398600.4418;
export function constants(mode = "course") {
  if (!CONSTANTS[mode]) throw new RangeError("Choose course or engineering mode.");
  return CONSTANTS[mode];
}
function number(v, name, min = -Infinity, max = Infinity) {
  if (
    v === null ||
    v === undefined ||
    typeof v === "boolean" ||
    (typeof v === "string" && !v.trim())
  )
    throw new RangeError(`${name} is required.`);
  const n = Number(v);
  if (!Number.isFinite(n) || n < min || n > max)
    throw new RangeError(`${name} must be finite between ${min} and ${max}.`);
  return n;
}
const positive = (v, n) => {
  const x = number(v, n, 0);
  if (x === 0) throw new RangeError(`${n} must be greater than zero.`);
  return x;
};
const nonnegative = (v, n) => number(v, n, 0);
const integer = (v, n) => {
  const x = nonnegative(v, n);
  if (!Number.isSafeInteger(x)) throw new RangeError(`${n} must be a whole number.`);
  return x;
};
export const linearToDb = (v) => 10 * Math.log10(positive(v, "Linear power ratio"));
export const dbToLinear = (v) => {
  const x = 10 ** (number(v, "dB") / 10);
  return positive(x, "Converted linear ratio");
};
export const wattsToDbw = linearToDb;
export const wattsToDbm = (v) => linearToDb(v) + 30;
export const dbwToWatts = dbToLinear;
export const dbmToWatts = (v) => dbToLinear(number(v, "dBm") - 30);
export function convertUnit({ value, from, to }) {
  const groups = [
    { Hz: 1, kHz: 1e3, MHz: 1e6, GHz: 1e9 },
    { m: 1, km: 1e3 },
    { s: 1, ms: 1e-3, us: 1e-6, min: 60, h: 3600 },
    { bps: 1, kbps: 1e3, Mbps: 1e6, Gbps: 1e9 }
  ];
  const v = number(value, "Value");
  for (const g of groups) if (from in g && to in g) return (v * g[from]) / g[to];
  if (["W", "mW", "dBW", "dBm"].includes(from) && ["W", "mW", "dBW", "dBm"].includes(to)) {
    const w =
      from === "W"
        ? positive(v, "Power")
        : from === "mW"
          ? positive(v, "Power") / 1000
          : from === "dBW"
            ? dbwToWatts(v)
            : dbmToWatts(v);
    return to === "W" ? w : to === "mW" ? w * 1000 : to === "dBW" ? wattsToDbw(w) : wattsToDbm(w);
  }
  if (["K", "C", "dBK"].includes(from) && ["K", "C", "dBK"].includes(to)) {
    const k =
      from === "K"
        ? positive(v, "Temperature")
        : from === "C"
          ? positive(v + 273.15, "Temperature")
          : dbToLinear(v);
    return to === "K" ? k : to === "C" ? k - 273.15 : linearToDb(k);
  }
  throw new RangeError("Incompatible or unsupported units.");
}
function orbitalInputs(v, mode) {
  const c = constants(mode);
  return {
    earthRadiusM: positive(v.earthRadiusM ?? c.earthRadiusM, "Earth radius"),
    mu: gravitationalParameterM3S2(v, mode)
  };
}
function gravitationalParameterM3S2(v, mode) {
  if (v.muKm3S2 !== undefined)
    return positive(v.muKm3S2, "Gravitational parameter") * 1e9;
  return positive(v.mu ?? constants(mode).mu, "Gravitational parameter");
}
export function circularOrbit(v = {}, mode = "course") {
  const { earthRadiusM, mu } = orbitalInputs(v, mode),
    altitudeM = nonnegative(v.altitudeM, "Altitude"),
    radiusM = earthRadiusM + altitudeM,
    velocityMps = Math.sqrt(mu / radiusM),
    meanMotionRadS = Math.sqrt(mu / radiusM ** 3);
  return {
    radiusM,
    altitudeM,
    velocityMps,
    periodS: (2 * Math.PI) / meanMotionRadS,
    meanMotionRadS
  };
}
export function geoOrbit(v = {}, mode = "course") {
  const { earthRadiusM, mu } = orbitalInputs(v, mode),
    periodS = positive(v.periodS ?? constants(mode).siderealDayS, "Period"),
    radiusM = Math.cbrt(mu * (periodS / (2 * Math.PI)) ** 2);
  if (radiusM < earthRadiusM) throw new RangeError("Orbital radius is inside Earth.");
  return {
    ...circularOrbit({ earthRadiusM, mu, altitudeM: radiusM - earthRadiusM }, mode),
    periodS
  };
}
export function visViva(v, mode = "course") {
  const radiusM = positive(v.radiusM, "Radius"),
    semiMajorAxisM = positive(v.semiMajorAxisM, "Semi-major axis"),
    mu = gravitationalParameterM3S2(v, mode);
  if (radiusM >= 2 * semiMajorAxisM)
    throw new RangeError("Radius must be below twice the semi-major axis for a bound orbit.");
  return { velocityMps: Math.sqrt(mu * (2 / radiusM - 1 / semiMajorAxisM)) };
}
export function ellipticalOrbit(v, mode = "course") {
  const { earthRadiusM, mu } = orbitalInputs(v, mode),
    apogeeRadiusM = positive(v.apogeeRadiusM, "Apogee radius"),
    perigeeRadiusM = positive(v.perigeeRadiusM, "Perigee radius");
  if (apogeeRadiusM < perigeeRadiusM)
    throw new RangeError("Apogee must be at least perigee; explicitly swap the entered values.");
  if (perigeeRadiusM < earthRadiusM) throw new RangeError("Perigee is inside Earth.");
  const semiMajorAxisM = (apogeeRadiusM + perigeeRadiusM) / 2;
  return {
    apogeeRadiusM,
    perigeeRadiusM,
    semiMajorAxisM,
    eccentricity: (apogeeRadiusM - perigeeRadiusM) / (apogeeRadiusM + perigeeRadiusM),
    periodS: 2 * Math.PI * Math.sqrt(semiMajorAxisM ** 3 / mu),
    apogeeVelocityMps: visViva({ radiusM: apogeeRadiusM, semiMajorAxisM, mu }, mode).velocityMps,
    perigeeVelocityMps: visViva({ radiusM: perigeeRadiusM, semiMajorAxisM, mu }, mode).velocityMps
  };
}
export function coverage(v, mode = "course") {
  const { earthRadiusM } = orbitalInputs(v, mode),
    altitudeM = nonnegative(v.altitudeM, "Altitude"),
    el = (number(v.minimumElevationDeg ?? 0, "Minimum elevation", 0, 90) * Math.PI) / 180,
    centralAngleRad = Math.max(
      0,
      Math.acos((earthRadiusM / (earthRadiusM + altitudeM)) * Math.cos(el)) - el
    ),
    fraction = (1 - Math.cos(centralAngleRad)) / 2;
  return {
    centralAngleRad,
    centralAngleDeg: (centralAngleRad * 180) / Math.PI,
    areaM2: 4 * Math.PI * earthRadiusM ** 2 * fraction,
    coverageFraction: fraction
  };
}
export function lookAngles(v, mode = "course") {
  const c = constants(mode),
    r =
      positive(v.earthRadiusM ?? c.earthRadiusM, "Earth radius") +
      nonnegative(v.stationAltitudeM ?? 0, "Station altitude"),
    rs = positive(v.satelliteRadiusM ?? geoOrbit({}, mode).radiusM, "Satellite radius");
  if (rs <= r) throw new RangeError("Satellite radius must exceed station radius.");
  const lat = (number(v.latitudeDeg, "Latitude", -90, 90) * Math.PI) / 180,
    lon = number(v.longitudeDeg, "Longitude", -180, 180),
    slon = number(v.satelliteLongitudeDeg, "Satellite longitude", -180, 180),
    delta = ((slon - lon) * Math.PI) / 180,
    eastM = rs * Math.sin(delta),
    northM = -rs * Math.sin(lat) * Math.cos(delta),
    upM = rs * Math.cos(lat) * Math.cos(delta) - r,
    horizontal = Math.hypot(eastM, northM),
    azimuthDefined = horizontal > rs * 1e-12,
    elevationDeg = (Math.atan2(upM, horizontal) * 180) / Math.PI;
  return {
    eastM,
    northM,
    upM,
    slantRangeM: Math.hypot(horizontal, upM),
    elevationDeg,
    azimuthDeg: azimuthDefined ? ((Math.atan2(eastM, northM) * 180) / Math.PI + 360) % 360 : 0,
    azimuthDefined,
    visible: elevationDeg >= -1e-10
  };
}
export function solarPower(v) {
  const d = number(v.degradationFraction ?? 0, "Total degradation", 0, 1),
    annual = number(v.degradationPerYear ?? 0, "Annual degradation", 0, 1),
    years = nonnegative(v.years ?? 0, "Lifetime");
  if (d === 1 || annual === 1) throw new RangeError("Degradation must be less than 100%.");
  const retention = v.powerMode === "annual" ? (1 - annual) ** years : 1 - d;
  if (retention === 0) throw new RangeError("Retention is too small.");
  const requiredPowerW = nonnegative(v.requiredPowerW ?? 5000, "Required EOL power"),
    requiredBolPowerW = requiredPowerW / retention;
  const flux = positive(v.solarFluxWm2 ?? 1361, "Solar flux"),
    efficiency = positive(v.efficiency ?? 0.3, "Cell efficiency");
  if (efficiency > 1) throw new RangeError("Efficiency cannot exceed one.");
  const areaM2 = nonnegative(v.areaM2 ?? requiredBolPowerW / (flux * efficiency), "Array area"),
    bolPowerW = flux * efficiency * areaM2;
  return {
    retention,
    requiredBolPowerW,
    bolPowerW,
    eolPowerW: bolPowerW * retention,
    requiredAreaM2: requiredBolPowerW / (flux * efficiency)
  };
}
export function antenna(v, mode = "course") {
  const frequencyHz = positive(v.frequencyHz, "Frequency"),
    diameterM = positive(v.diameterM, "Diameter"),
    efficiency = positive(v.efficiency ?? 0.7, "Aperture efficiency");
  if (efficiency > 1) throw new RangeError("Efficiency cannot exceed one.");
  const wavelengthM = constants(mode).c / frequencyHz,
    physicalApertureM2 = (Math.PI * diameterM ** 2) / 4,
    effectiveApertureM2 = efficiency * physicalApertureM2,
    gainLinear = efficiency * ((Math.PI * diameterM) / wavelengthM) ** 2;
  return {
    wavelengthM,
    physicalApertureM2,
    effectiveApertureM2,
    gainLinear,
    gainDb: linearToDb(gainLinear),
    idealGainLinear: gainLinear / efficiency,
    idealGainDb: linearToDb(gainLinear / efficiency),
    beamwidthDeg:
      (positive(v.beamwidthFactor ?? (mode === "course" ? 75 : 70), "Beamwidth factor") *
        wavelengthM) /
      diameterM
  };
}
export function rfPath(v, mode = "course") {
  if (v.rfMode === "pfd-receive") {
    const flux = positive(v.fluxDensityWm2, "Incident power flux density"),
      aperture = positive(v.effectiveApertureM2, "Effective aperture"),
      loss = nonnegative(v.receiveLossDb ?? 0, "Receive loss"),
      receivedPowerW = (flux * aperture) / dbToLinear(loss),
      receivedPowerDbw = wattsToDbw(receivedPowerW);
    return { receivedPowerW, receivedPowerDbw, receivedPowerDbm: receivedPowerDbw + 30 };
  }
  if (v.rfMode !== undefined && v.rfMode !== "path")
    throw new RangeError("Select a free-space path or PFD receive calculation.");
  const frequencyHz = positive(v.frequencyHz, "Frequency"),
    distanceM = positive(v.distanceM, "Distance"),
    powerW = positive(v.powerW ?? 1, "Transmitter power"),
    transmitGainDb = number(v.transmitGainDb ?? 0, "Transmit gain"),
    receiveGainDb = number(v.receiveGainDb ?? 0, "Receive gain"),
    transmitLossDb = nonnegative(v.transmitLossDb ?? 0, "Transmit loss"),
    pathLossDb = nonnegative(v.pathLossDb ?? 0, "Path loss"),
    receiveLossDb = nonnegative(v.receiveLossDb ?? 0, "Receive loss"),
    wavelengthM = constants(mode).c / frequencyHz,
    fsplDb = 20 * Math.log10((4 * Math.PI * distanceM) / wavelengthM),
    eirpDbw = wattsToDbw(powerW) + transmitGainDb - transmitLossDb,
    eirpW = dbwToWatts(eirpDbw),
    pfdWm2 = eirpW / (4 * Math.PI * distanceM ** 2) / dbToLinear(pathLossDb),
    effectiveApertureM2 =
      (dbToLinear(receiveGainDb) * wavelengthM ** 2) / (4 * Math.PI) / dbToLinear(receiveLossDb),
    receivedPowerDbw = eirpDbw - fsplDb - pathLossDb + receiveGainDb - receiveLossDb;
  return {
    wavelengthM,
    fsplDb,
    eirpDbw,
    eirpW,
    pfdWm2,
    pfdDbwm2: linearToDb(pfdWm2),
    effectiveApertureM2,
    receivedPowerW: dbwToWatts(receivedPowerDbw),
    receivedPowerDbw,
    receivedPowerDbm: receivedPowerDbw + 30
  };
}
export function thermalNoise(v, mode = "course") {
  const temperatureK = positive(v.temperatureK, "Noise temperature"),
    bandwidthHz = positive(v.bandwidthHz, "Bandwidth"),
    noiseDensityWHz = constants(mode).k * temperatureK,
    noiseW = noiseDensityWHz * bandwidthHz;
  return {
    noiseW,
    noiseDbw: wattsToDbw(noiseW),
    noiseDbm: wattsToDbm(noiseW),
    noiseDensityWHz,
    noiseDensityDbwHz: wattsToDbw(noiseDensityWHz),
    noiseDensityDbmHz: wattsToDbm(noiseDensityWHz)
  };
}
export function noiseFigure(v) {
  const t0 = positive(v.referenceTemperatureK ?? 290, "Reference temperature");
  const noiseFactor =
    v.noiseFigureDb !== undefined
      ? dbToLinear(nonnegative(v.noiseFigureDb, "Noise figure"))
      : v.noiseFactor !== undefined
        ? number(v.noiseFactor, "Noise factor", 1)
        : 1 +
          nonnegative(
            v.equivalentTemperatureK ?? v.addedTemperatureK ?? 0,
            "Equivalent added temperature"
          ) /
            t0;
  return {
    noiseFactor,
    noiseFigureDb: linearToDb(noiseFactor),
    equivalentTemperatureK: t0 * (noiseFactor - 1)
  };
}
export function passiveNoise(v) {
  const lossLinear =
      v.lossDb !== undefined
        ? dbToLinear(nonnegative(v.lossDb, "Passive loss"))
        : number(v.lossLinear, "Passive loss factor", 1),
    physicalTemperatureK = nonnegative(v.physicalTemperatureK ?? 290, "Physical temperature"),
    equivalentTemperatureK = physicalTemperatureK * (lossLinear - 1);
  return {
    gainLinear: 1 / lossLinear,
    lossLinear,
    ...noiseFigure({ equivalentTemperatureK, referenceTemperatureK: v.referenceTemperatureK })
  };
}
export function cascadeNoise(v) {
  if (!Array.isArray(v.stages) || !v.stages.length)
    throw new RangeError("At least one receiver stage is required.");
  let equivalentTemperatureK = 0,
    gainLinear = 1;
  for (const stage of v.stages) {
    const noise = noiseFigure({ ...stage, referenceTemperatureK: v.referenceTemperatureK }),
      gain =
        stage.gainDb !== undefined
          ? dbToLinear(stage.gainDb)
          : positive(stage.gainLinear, "Stage gain");
    equivalentTemperatureK += noise.equivalentTemperatureK / gainLinear;
    gainLinear *= gain;
    positive(gainLinear, "Cascade gain");
  }
  return {
    gainLinear,
    ...noiseFigure({ equivalentTemperatureK, referenceTemperatureK: v.referenceTemperatureK })
  };
}
export function gOverT(v) {
  const gainDb = number(v.gainDb, "Receive antenna gain"),
    temperatureK = positive(v.temperatureK, "System noise temperature");
  return { temperatureDbK: linearToDb(temperatureK), gtDbK: gainDb - linearToDb(temperatureK) };
}
export function amplifierNoise(v, mode = "course") {
  const temperatureK = positive(v.temperatureK, "Input temperature"),
    addedTemperatureK = nonnegative(v.addedTemperatureK ?? 0, "Added temperature"),
    bandwidthHz = positive(v.bandwidthHz, "Bandwidth"),
    gain = positive(v.amplifierGain ?? 1, "Amplifier linear gain"),
    inputNoiseW = thermalNoise({ temperatureK, bandwidthHz }, mode).noiseW,
    outputNoiseW =
      gain *
      thermalNoise({ temperatureK: temperatureK + addedTemperatureK, bandwidthHz }, mode).noiseW;
  return {
    inputNoiseW,
    inputNoiseDbm: wattsToDbm(inputNoiseW),
    outputNoiseW,
    outputNoiseDbm: wattsToDbm(outputNoiseW),
    amplifierGainDb: linearToDb(gain)
  };
}
export function pathNoise(v) {
  const pathLossLinear =
      v.pathLossLinear !== undefined
        ? number(v.pathLossLinear, "Path loss factor", 1)
        : dbToLinear(nonnegative(v.pathLossDb ?? 0, "Path loss")),
    pathTemperatureK = nonnegative(v.pathTemperatureK ?? 290, "Path physical temperature");
  return { pathNoiseTemperatureK: pathTemperatureK * (1 - 1 / pathLossLinear) };
}
export function courseFtLink(v, mode = "course") {
  const normalized =
    v.pathLossLinear !== undefined
      ? { ...v, pathLossDb: linearToDb(number(v.pathLossLinear, "Path loss factor", 1)) }
      : v;
  const p = rfPath(normalized, mode),
    n = noiseFigure(v),
    path = pathNoise(v),
    systemTemperatureK =
      path.pathNoiseTemperatureK +
      nonnegative(v.antennaTemperatureK ?? 0, "Antenna temperature") +
      n.equivalentTemperatureK;
  positive(systemTemperatureK, "System temperature");
  const noise = thermalNoise(
      { temperatureK: systemTemperatureK, bandwidthHz: v.bandwidthHz },
      mode
    ),
    cnLinear = p.receivedPowerW / noise.noiseW;
  return {
    ...p,
    ...path,
    systemTemperatureK,
    ...noise,
    cnLinear,
    cnDb: linearToDb(cnLinear),
    cNoDbHz: linearToDb(p.receivedPowerW / noise.noiseDensityWHz)
  };
}
export function compositeCN(v) {
  const u = dbToLinear(v.uplinkCnDb),
    d = dbToLinear(v.downlinkCnDb),
    approximateLinear = 1 / (1 / u + 1 / d),
    exactLinear = 1 / (1 / u + 1 / d + 1 / u / d);
  return {
    exactLinear,
    exactCnDb: linearToDb(exactLinear),
    approximateLinear,
    approximateCnDb: linearToDb(approximateLinear)
  };
}
export function combineCNo(v) {
  const u = dbToLinear(v.uplinkCNoDbHz),
    d = dbToLinear(v.downlinkCNoDbHz);
  return { compositeCNoDbHz: linearToDb(1 / (1 / u + 1 / d)) };
}
export function cNoToCN(v) {
  return {
    cnDb: number(v.cNoDbHz, "C/N0") - linearToDb(positive(v.bandwidthHz, "Noise bandwidth"))
  };
}
export function cNoToEbNo(v) {
  return { ebNoDb: number(v.cNoDbHz, "C/N0") - linearToDb(positive(v.bitRate, "Bit rate")) };
}
export function margin(v) {
  return {
    marginDb:
      number(v.achievedDb, "Achieved performance") - number(v.requiredDb, "Required performance")
  };
}
export function combineEbNo(v) {
  return {
    compositeEbNoDb: combineCNo({
      uplinkCNoDbHz: v.uplinkEbNoDb,
      downlinkCNoDbHz: v.downlinkEbNoDb
    }).compositeCNoDbHz
  };
}
export function noiseDensity(v, mode = "course") {
  const noiseDensityWHz = constants(mode).k * positive(v.temperatureK, "Noise temperature");
  return {
    noiseDensityWHz,
    noiseDensityDbwHz: wattsToDbw(noiseDensityWHz),
    noiseDensityDbmHz: wattsToDbm(noiseDensityWHz)
  };
}
export function semiMajorAxis(v, mode = "course") {
  return {
    semiMajorAxisM: Math.cbrt(
      positive(v.mu ?? constants(mode).mu, "Gravitational parameter") *
        (positive(v.periodS, "Period") / (2 * Math.PI)) ** 2
    )
  };
}
export function eirp(v) {
  const eirpDbw =
    wattsToDbw(positive(v.powerW, "Transmit power")) +
    number(v.transmitGainDb, "Transmit gain") -
    nonnegative(v.transmitLossDb ?? 0, "Transmit feeder loss");
  return { eirpDbw, eirpW: dbwToWatts(eirpDbw) };
}
export function fspl(v, mode = "course") {
  return {
    fsplDb:
      20 *
      Math.log10(
        (4 * Math.PI * positive(v.distanceM, "Distance") * positive(v.frequencyHz, "Frequency")) /
          constants(mode).c
      )
  };
}
export function propagationDelay(v, mode = "course") {
  const oneWayDelayS =
    (nonnegative(v.uplinkDistanceM ?? v.distanceM ?? 0, "Uplink distance") +
      nonnegative(v.downlinkDistanceM ?? 0, "Downlink distance")) /
    constants(mode).c;
  return { oneWayDelayS, roundTripDelayS: 2 * oneWayDelayS };
}
export function linkBudget(v, mode = "course") {
  const kDb = linearToDb(constants(mode).k),
    uplinkCNoDbHz =
      number(v.uplinkEirpDbw, "Uplink EIRP") +
      number(v.uplinkGtDbK, "Satellite G/T") -
      nonnegative(v.uplinkLossDb, "Uplink total loss") -
      kDb,
    downlinkCNoDbHz =
      number(v.downlinkEirpDbw, "Downlink EIRP") +
      number(v.downlinkGtDbK, "Earth station G/T") -
      nonnegative(v.downlinkLossDb, "Downlink total loss") -
      kDb,
    compositeCNoDbHz = combineCNo({ uplinkCNoDbHz, downlinkCNoDbHz }).compositeCNoDbHz,
    bandwidthHz = positive(v.bandwidthHz, "Noise bandwidth"),
    bitRate = positive(v.bitRate, "Bit rate"),
    uplinkCnDb = uplinkCNoDbHz - linearToDb(bandwidthHz),
    downlinkCnDb = downlinkCNoDbHz - linearToDb(bandwidthHz),
    compositeCnDb = compositeCNoDbHz - linearToDb(bandwidthHz),
    ebNoDb = compositeCNoDbHz - linearToDb(bitRate);
  return {
    uplinkCNoDbHz,
    downlinkCNoDbHz,
    compositeCNoDbHz,
    uplinkCnDb,
    downlinkCnDb,
    compositeCnDb,
    ...compositeCN({ uplinkCnDb, downlinkCnDb }),
    ebNoDb,
    marginDb: ebNoDb - number(v.requiredEbNoDb ?? 0, "Required Eb/N0")
  };
}
export function leoPass(v, mode = "course") {
  const c = constants(mode),
    h = positive(v.altitudeM, "LEO altitude"),
    fraction = number(v.passFraction, "Visible pass fraction", 0, 1),
    frequencyHz = positive(v.frequencyHz, "Carrier frequency"),
    r = c.earthRadiusM + h,
    omega = Math.sqrt(c.mu / r ** 3),
    horizon = Math.acos(c.earthRadiusM / r),
    angle = (2 * fraction - 1) * horizon,
    horizontal = r * Math.sin(angle),
    vertical = r * Math.cos(angle) - c.earthRadiusM,
    slantRangeM = Math.hypot(horizontal, vertical),
    radialVelocityMps = (c.earthRadiusM * r * omega * Math.sin(angle)) / slantRangeM;
  return {
    angleRad: angle,
    horizonRad: horizon,
    slantRangeM,
    radialVelocityMps,
    orbitalSpeedMps: r * omega,
    elevationDeg: (Math.atan2(vertical, Math.abs(horizontal)) * 180) / Math.PI,
    dopplerHz: (-frequencyHz * radialVelocityMps) / c.c,
    elapsedS: (2 * horizon * fraction) / omega,
    passDurationS: (2 * horizon) / omega
  };
}
export function dopplerDelay(v, mode = "course") {
  const c = constants(mode).c,
    frequencyHz = positive(v.frequencyHz, "Carrier frequency"),
    radialVelocityMps = number(v.radialVelocityMps ?? 0, "Radial velocity");
  if (Math.abs(radialVelocityMps) >= c)
    throw new RangeError("Radial speed must be less than light speed.");
  const fractionalShift = -radialVelocityMps / c,
    dopplerHz = frequencyHz * fractionalShift,
    oneWayDelayS =
      (nonnegative(v.uplinkDistanceM ?? v.distanceM ?? 0, "Uplink distance") +
        nonnegative(v.downlinkDistanceM ?? 0, "Downlink distance")) /
      c;
  return {
    dopplerHz,
    receivedFrequencyHz: frequencyHz + dopplerHz,
    fractionalShift,
    ppmShift: fractionalShift * 1e6,
    oneWayDelayS,
    roundTripDelayS: 2 * oneWayDelayS
  };
}
export function scpcCapacity(v) {
  const bandwidth = positive(v.transponderBandwidthHz, "Transponder bandwidth"),
    spacing =
      positive(v.channelSpacingHz, "Channel spacing") +
      nonnegative(v.guardBandwidthHz ?? 0, "Guard bandwidth"),
    equivalentChannels = bandwidth / spacing,
    channels = Math.floor(equivalentChannels);
  return { channels, equivalentChannels, unusedBandwidthHz: bandwidth - channels * spacing };
}
export function voiceCapacity(v) {
  const equivalentChannels =
    nonnegative(v.trafficBitRate, "Net traffic rate") /
    positive(v.voiceBitRate ?? 64e3, "PCM voice rate");
  return { voiceChannels: Math.floor(equivalentChannels), equivalentChannels };
}
/** Ideal synchronized Walsh-code illustration, not an RF user-capacity model. */
export function cdmaCodes(v) {
  const codeLength = integer(v.codeLength ?? 64, "Walsh code length");
  if (codeLength < 2 || Math.log2(codeLength) % 1 !== 0)
    throw new RangeError("Walsh code length must be a power of two, at least 2.");
  const chipRate = positive(v.chipRate ?? 4.096e6, "Chip rate"),
    informationBitRate = positive(v.informationBitRate ?? 64e3, "Information bit rate");
  if (chipRate < informationBitRate)
    throw new RangeError("Chip rate must be at least the information bit rate.");
  const spreadingFactor = chipRate / informationBitRate;
  return {
    spreadingFactor,
    processingGainDb: linearToDb(spreadingFactor),
    idealOrthogonalCodes: codeLength,
    codeDurationS: codeLength / chipRate
  };
}
export function tdma(v) {
  const bitRate = positive(v.bitRate, "TDMA rate"),
    frameDurationS = positive(v.frameDurationS, "Frame duration"),
    nr = integer(v.referenceStations, "Reference stations"),
    nt = integer(v.trafficTerminals, "Traffic terminals"),
    br = nonnegative(v.referenceBits, "Reference burst bits"),
    bp = nonnegative(v.preambleBits, "Preamble bits"),
    bg = nonnegative(v.guardBits, "Guard bits"),
    convention = v.convention ?? "lecture";
  if (!["lecture", "final-2026"].includes(convention))
    throw new RangeError("Select lecture or final-2026 TDMA convention.");
  const fixed = nr * (br + (convention === "lecture" ? bg : 0)),
    per = bp + bg,
    totalFrameBits = bitRate * frameDurationS,
    overheadBits = fixed + nt * per;
  if (overheadBits > totalFrameBits) throw new RangeError("Overhead exceeds the frame capacity.");
  const trafficBits = totalFrameBits - overheadBits,
    efficiency = trafficBits / totalFrameBits,
    target = number(v.targetEfficiency ?? 0.9, "Target efficiency", 0, 1);
  if (target === 1)
    throw new RangeError("Target efficiency must be below 100% when solving required rate.");
  positive(per, "Preamble plus guard bits");
  const maxTerminalsEquivalent = ((1 - target) * totalFrameBits - fixed) / per,
    trafficBitRate = trafficBits / frameDurationS;
  return {
    totalFrameBits,
    overheadBits,
    trafficBits,
    efficiency,
    trafficBitRate,
    maxTerminalsEquivalent,
    maxTerminals: Math.max(0, Math.floor(maxTerminalsEquivalent + 1e-12)),
    targetFeasible: maxTerminalsEquivalent >= 0,
    requiredBitRate: overheadBits / ((1 - target) * frameDurationS),
    ...voiceCapacity({ trafficBitRate, voiceBitRate: v.voiceBitRate })
  };
}
const UNITS = {
  radiusM: "m",
  altitudeM: "m",
  velocityMps: "m/s",
  periodS: "s",
  meanMotionRadS: "rad/s",
  semiMajorAxisM: "m",
  apogeeRadiusM: "m",
  perigeeRadiusM: "m",
  apogeeVelocityMps: "m/s",
  perigeeVelocityMps: "m/s",
  areaM2: "m²",
  centralAngleRad: "rad",
  centralAngleDeg: "°",
  slantRangeM: "m",
  eastM: "m",
  northM: "m",
  upM: "m",
  azimuthDeg: "°",
  elevationDeg: "°",
  requiredBolPowerW: "W",
  bolPowerW: "W",
  eolPowerW: "W",
  requiredAreaM2: "m²",
  wavelengthM: "m",
  physicalApertureM2: "m²",
  effectiveApertureM2: "m²",
  gainDb: "dBi",
  idealGainDb: "dBi",
  processingGainDb: "dB",
  idealOrthogonalCodes: "codes",
  codeDurationS: "s",
  beamwidthDeg: "°",
  fsplDb: "dB",
  eirpDbw: "dBW",
  eirpW: "W",
  pfdWm2: "W/m²",
  pfdDbwm2: "dBW/m²",
  receivedPowerW: "W",
  receivedPowerDbw: "dBW",
  receivedPowerDbm: "dBm",
  noiseW: "W",
  noiseDbw: "dBW",
  noiseDbm: "dBm",
  noiseDensityWHz: "W/Hz",
  noiseDensityDbwHz: "dBW/Hz",
  noiseDensityDbmHz: "dBm/Hz",
  equivalentTemperatureK: "K",
  systemTemperatureK: "K",
  pathNoiseTemperatureK: "K",
  noiseFigureDb: "dB",
  gtDbK: "dB/K",
  temperatureDbK: "dBK",
  inputNoiseW: "W",
  outputNoiseW: "W",
  inputNoiseDbm: "dBm",
  outputNoiseDbm: "dBm",
  amplifierGainDb: "dB",
  cNoDbHz: "dB-Hz",
  cnDb: "dB",
  uplinkCNoDbHz: "dB-Hz",
  downlinkCNoDbHz: "dB-Hz",
  compositeCNoDbHz: "dB-Hz",
  uplinkCnDb: "dB",
  downlinkCnDb: "dB",
  compositeCnDb: "dB",
  exactCnDb: "dB",
  approximateCnDb: "dB",
  ebNoDb: "dB",
  marginDb: "dB",
  dopplerHz: "Hz",
  receivedFrequencyHz: "Hz",
  ppmShift: "ppm",
  oneWayDelayS: "s",
  roundTripDelayS: "s",
  unusedBandwidthHz: "Hz",
  trafficBitRate: "bit/s",
  requiredBitRate: "bit/s",
  totalFrameBits: "bits",
  overheadBits: "bits",
  trafficBits: "bits"
};
const FORMULAS = {
  "frequency-bands": [
    "lambda = c/f",
    "All free-space carrier frequencies propagate at the same speed; wavelength varies inversely with frequency."
  ],
  orbit: [
    "r = R_E + h; v = sqrt(mu/r); T = 2 pi sqrt(r³/mu)",
    "Orbital radius is measured from Earth’s center."
  ],
  "look-angles": [
    "E = R_S sin(delta); N = -R_S sin(phi) cos(delta); U = R_S cos(phi) cos(delta) - R; El = atan2(U,hypot(E,N))",
    "Azimuth is clockwise from true north; negative elevation means below the horizon."
  ],
  "power-lifetime": [
    "R = (1-D)(1-d)^y; P_BOL = P_EOL/R; P = S eta A",
    "Size the beginning-of-life array to retain the required power at end of life."
  ],
  antenna: [
    "lambda = c/f; A = pi D²/4; A_e = eta A; G = eta(pi D/lambda)²; beam = K lambda/D",
    "Larger aperture and higher frequency increase gain and narrow the beam."
  ],
  "rf-path": [
    "EIRP = P_t + G_t - L_t; FSPL = 20 log10(4 pi d f/c); P_r = EIRP - FSPL - L_path + G_r - L_r",
    "Positive loss terms are subtracted from the carrier budget."
  ],
  "noise-gt": [
    "N = k T B; N_0 = k T; T_e = T_0(F-1); G/T = G_dBi - 10 log10(T)",
    "Noise power uses actual input temperature; noise figure uses a separate reference temperature."
  ],
  "link-budget": [
    "C/N_0 = EIRP + G/T - L - 10 log10(k); 1/x_C = 1/x_U + 1/x_D; C/N = C/N_0 - 10 log10(B); E_b/N_0 = C/N_0 - 10 log10(R_b)",
    "Reciprocal density combination assumes independent noise referred to the same carrier; FT exact C/N uses a common bandwidth."
  ],
  "doppler-delay": [
    "delta f = -v_r f/c; tau = (d_U+d_D)/c; RTT = 2 tau",
    "Positive radial velocity means moving away; delays exclude processing and network delays."
  ],
  "multiple-access": [
    "N_SCPC = floor(B_T/(B_C+B_G)); b_O = n_r(b_r+b_g)+n_t(b_p+b_g); eta = 1-b_O/(r_T t_F)",
    "Whole channel and terminal counts are floored; the final-2026 convention omits reference guards."
  ]
};
const label = (k) =>
  k
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Dbw/g, "dBW")
    .replace(/Dbm/g, "dBm")
    .replace(/Db/g, "dB");
const LABELS = {
  radiusM: "Orbital radius",
  altitudeM: "Altitude",
  velocityMps: "Orbital speed",
  periodS: "Orbital period",
  eccentricity: "Eccentricity",
  gainDb: "Antenna gain",
  gtDbK: "Figure of merit G/T",
  fsplDb: "Free-space path loss",
  noiseW: "Thermal noise power",
  noiseDbw: "Noise power in dBW",
  noiseDbm: "Noise power in dBm",
  channels: "Complete SCPC channels",
  efficiency: "Frame traffic efficiency",
  maxTerminals: "Maximum complete traffic terminals",
  maxTerminalsEquivalent: "Algebraic terminal count",
  voiceChannels: "Complete PCM voice channels",
  equivalentChannels: "Equivalent channel count",
  ebNoDb: "Energy per bit to noise density",
  marginDb: "Eb/N0 margin",
  retention: "Retained power fraction"
};
function detail(key, v, o, mode, fallback) {
  if (v.rfMode === "pfd-receive") {
    const receive = {
      receivedPowerW: [
        "C = Phi A_e / 10^(L_r/10)",
        `${v.fluxDensityWm2} × ${v.effectiveApertureM2} / 10^(${v.receiveLossDb ?? 0}/10)`,
        "Incident flux times antenna effective aperture, followed by receive feeder loss. Aperture excludes feeder loss."
      ],
      receivedPowerDbw: [
        "C_dBW = 10 log10(C_W)",
        `10 log10(${o.receivedPowerW})`,
        "Received carrier at the receiver input, referenced to one watt."
      ],
      receivedPowerDbm: [
        "C_dBm = C_dBW + 30",
        `${o.receivedPowerDbw} + 30`,
        "The same carrier referenced to one milliwatt."
      ]
    };
    if (receive[key]) return receive[key];
  }
  const c = constants(mode),
    t0 = v.referenceTemperatureK ?? 290;
  if (v.orbitMode) {
    const earth = v.earthRadiusM ?? c.earthRadiusM;
    const mu = v.mu ?? c.mu;
    const radius = Number(earth) + Number(v.altitudeM ?? 0);
    const el = (Number(v.minimumElevationDeg ?? 0) * Math.PI) / 180;
    const orbitSteps = {
      altitudeM: [
        "h = r - R_E",
        `${o.radiusM} - ${earth}`,
        "Height above the selected spherical Earth surface, not distance from its centre."
      ],
      meanMotionRadS: [
        "n = 2 pi / T",
        `2 × pi / ${o.periodS}`,
        "Angular rate of the circular orbit in radians per second."
      ],
      centralAngleRad: [
        "theta = acos(R_E cos(El)/(R_E+h)) - El",
        `acos(${earth} × cos(${el}) / ${radius}) - ${el}`,
        "Angles in this substitution are radians; the surface cap ends at the minimum-elevation boundary."
      ],
      centralAngleDeg: [
        "theta_deg = theta_rad 180/pi",
        `${o.centralAngleRad} × 180 / pi`,
        "The same Earth-centred coverage angle expressed in degrees."
      ],
      areaM2: [
        "A = 2 pi R_E² (1-cos(theta))",
        `2 × pi × ${earth}² × (1 - cos(${o.centralAngleRad}))`,
        "Area on the spherical Earth surface, not a flat circular footprint."
      ],
      coverageFraction: [
        "q = (1-cos(theta))/2",
        `(1 - cos(${o.centralAngleRad})) / 2`,
        "Fraction of the whole Earth surface inside the geometric coverage cap."
      ],
      apogeeRadiusM: [
        "r_a = given",
        `${v.apogeeRadiusM} m (given centre distance)`,
        "The farthest point from Earth’s centre; it must not be smaller than perigee."
      ],
      perigeeRadiusM: [
        "r_p = given",
        `${v.perigeeRadiusM} m (given centre distance)`,
        "The closest point to Earth’s centre; it must remain outside the surface."
      ],
      apogeeVelocityMps: [
        "v_a = sqrt(mu(2/r_a-1/a))",
        `sqrt(${mu} × (2/${o.apogeeRadiusM} - 1/${o.semiMajorAxisM}))`,
        "Vis-viva speed at the farthest apsis, where the satellite is slowest."
      ],
      perigeeVelocityMps: [
        "v_p = sqrt(mu(2/r_p-1/a))",
        `sqrt(${mu} × (2/${o.perigeeRadiusM} - 1/${o.semiMajorAxisM}))`,
        "Vis-viva speed at the closest apsis, where the satellite is fastest."
      ]
    };
    if (orbitSteps[key]) return orbitSteps[key];
  }
  const map = {
    eastM: [
      "E = R_S sin(delta)",
      `${v.satelliteRadiusM} × sin((${v.satelliteLongitudeDeg}-${v.longitudeDeg}) × pi/180)`,
      "East displacement in the station's local horizon frame."
    ],
    northM: [
      "N = -R_S sin(phi) cos(delta)",
      `-${v.satelliteRadiusM} × sin(${v.latitudeDeg} × pi/180) × cos((${v.satelliteLongitudeDeg}-${v.longitudeDeg}) × pi/180)`,
      "North displacement in the station's local horizon frame."
    ],
    upM: [
      "U = R_S cos(phi) cos(delta) - R",
      `${v.satelliteRadiusM} × cos(${v.latitudeDeg} × pi/180) × cos((${v.satelliteLongitudeDeg}-${v.longitudeDeg}) × pi/180) - ${(v.earthRadiusM ?? c.earthRadiusM) + Number(v.stationAltitudeM ?? 0)}`,
      "Vertical displacement above the station's local horizontal plane."
    ],
    radiusM: [
      "r = R_E + h",
      `${v.earthRadiusM ?? c.earthRadiusM} + ${o.altitudeM}`,
      "The orbit radius includes Earth’s radius; altitude alone is not the orbital radius."
    ],
    velocityMps: [
      "v = sqrt(mu/r)",
      `sqrt(${v.mu ?? c.mu}/${o.radiusM})`,
      "The circular orbital speed balances gravitational acceleration."
    ],
    periodS: [
      v.orbitMode === "elliptical" ? "T = 2 pi sqrt(a³/mu)" : "T = 2 pi sqrt(r³/mu)",
      `2 pi sqrt(${o.semiMajorAxisM ?? o.radiusM}³/${v.mu ?? c.mu})`,
      "Time for one complete orbit; divide seconds by 60 to obtain minutes."
    ],
    eccentricity: [
      "e = (r_a-r_p)/(r_a+r_p)",
      `(${o.apogeeRadiusM}-${o.perigeeRadiusM})/(${o.apogeeRadiusM}+${o.perigeeRadiusM})`,
      "Zero is a circle; bound ellipses have eccentricity below one."
    ],
    semiMajorAxisM: [
      "a = (r_a+r_p)/2",
      `(${o.apogeeRadiusM}+${o.perigeeRadiusM})/2`,
      "The semi-major axis sets the orbital period."
    ],
    wavelengthM: [
      "lambda = c/f",
      `${c.c}/${v.frequencyHz}`,
      "Free-space wavelength decreases as frequency increases."
    ],
    physicalApertureM2: [
      "A = pi D²/4",
      `pi × ${v.diameterM}² / 4`,
      "Physical dish opening area, expressed in square metres."
    ],
    effectiveApertureM2:
      v.diameterM !== undefined
        ? [
            "A_e = eta A",
            `${v.efficiency ?? 0.7} × ${o.physicalApertureM2}`,
            "Effective capture area includes aperture efficiency."
          ]
        : [
            "A_e = G_r lambda²/(4 pi L_r)",
            `10^(${v.receiveGainDb ?? 0}/10) × ${o.wavelengthM}²/(4 pi × 10^(${v.receiveLossDb ?? 0}/10))`,
            "Effective receive aperture referred after receive feeder loss."
          ],
    gainLinear: [
      "G = eta(pi D/lambda)²",
      `${v.efficiency ?? 0.7} × (pi × ${v.diameterM}/${o.wavelengthM})²`,
      "Linear antenna power gain relative to isotropic radiation."
    ],
    gainDb: [
      "G_dBi = 10 log10(G)",
      `10 log10(${o.gainLinear})`,
      "Antenna gain relative to an isotropic radiator."
    ],
    beamwidthDeg: [
      "theta_HP = K lambda/D",
      `${v.beamwidthFactor ?? (mode === "course" ? 75 : 70)} × ${o.wavelengthM}/${v.diameterM}`,
      "Approximate half-power beamwidth; coefficient depends on illumination."
    ],
    fsplDb: [
      "L_FS = 20 log10(4 pi d f/c)",
      `20 log10(4 pi × ${v.distanceM} × ${v.frequencyHz}/${c.c})`,
      "Geometric spreading loss; double frequency or distance adds about 6.02 dB."
    ],
    eirpDbw: [
      "EIRP = 10 log10(P_t) + G_t - L_t",
      `10 log10(${v.powerW ?? 1}) + ${v.transmitGainDb ?? 0} - ${v.transmitLossDb ?? 0}`,
      "Equivalent isotropic radiated power after the transmit feeder."
    ],
    eirpW: [
      "EIRP_W = 10^(EIRP_dBW/10)",
      `10^(${o.eirpDbw}/10)`,
      "The same isotropic radiated power expressed in watts."
    ],
    pfdWm2: [
      "Phi = EIRP/(4 pi d² A_path)",
      `${o.eirpW}/(4 pi × ${v.distanceM}² × 10^(${v.pathLossDb ?? 0}/10))`,
      "Power per square metre available at the receive aperture."
    ],
    pfdDbwm2: [
      "Phi_dBW/m2 = 10 log10(Phi_W/m2)",
      `10 log10(${o.pfdWm2})`,
      "Power flux density referenced to one watt per square metre."
    ],
    receivedPowerDbw: [
      "C = EIRP - L_FS - L_path + G_r - L_r",
      `${o.eirpDbw} - ${o.fsplDb} - ${v.pathLossDb ?? 0} + ${v.receiveGainDb ?? 0} - ${v.receiveLossDb ?? 0}`,
      "Carrier power after receive feeder loss; add 30 to express dBm."
    ],
    receivedPowerDbm: [
      "C_dBm = C_dBW + 30",
      `${o.receivedPowerDbw} + 30`,
      "The received carrier referenced to one milliwatt."
    ],
    receivedPowerW: [
      "C = Phi A_e",
      `${o.pfdWm2} × ${o.effectiveApertureM2}`,
      "Friis and PFD-times-aperture give the same received carrier."
    ],
    noiseW: [
      "N = k T B",
      `${c.k} × ${v.temperatureK ?? o.systemTemperatureK} × ${v.bandwidthHz}`,
      "Noise grows linearly with temperature and occupied noise bandwidth."
    ],
    noiseDbw: [
      "N_dBW = 10 log10(N_W)",
      `10 log10(${o.noiseW})`,
      "Noise power referenced to one watt."
    ],
    noiseDbm: [
      "N_dBm = N_dBW + 30",
      `${o.noiseDbw} + 30`,
      "Noise power referenced to one milliwatt; dBW and dBm differ by 30."
    ],
    noiseDensityWHz: [
      "N_0 = k T",
      `${c.k} × ${v.temperatureK ?? o.systemTemperatureK}`,
      "Noise per hertz; multiplying by noise bandwidth gives total noise."
    ],
    equivalentTemperatureK:
      v.noiseMode === "passive"
        ? [
            "T_e = T_p(L-1)",
            `${v.physicalTemperatureK ?? 290} × (${o.lossLinear}-1)`,
            "Added input-referred noise depends on the attenuator’s physical temperature."
          ]
        : v.noiseMode === "cascade"
          ? [
              "T_eq = T_e1 + T_e2/G_1 + T_e3/(G_1 G_2) + ...",
              v.stages
                .map(
                  (s, i) =>
                    `stage ${i + 1}: G=${s.gainLinear ?? `10^(${s.gainDb}/10)`}, T_e=${s.equivalentTemperatureK ?? `${t0}(10^(${s.noiseFigureDb ?? 0}/10)-1)`}`
                )
                .join("; "),
              "Later-stage noise is divided by preceding linear gains; the first receiver stage is critical."
            ]
          : [
              "T_e = T_0(F-1)",
              `${t0} × (${o.noiseFactor}-1)`,
              "Equivalent added noise temperature uses the separate noise-figure reference temperature."
            ],
    noiseFigureDb: [
      "NF = 10 log10(F)",
      `10 log10(${o.noiseFactor})`,
      "Noise figure describes SNR degradation at the specified reference temperature."
    ],
    temperatureDbK: [
      "T_dBK = 10 log10(T_K)",
      `10 log10(${v.temperatureK})`,
      "Absolute noise temperature expressed logarithmically relative to one kelvin."
    ],
    lossLinear: [
      "L = 10^(L_dB/10)",
      `10^(${v.lossDb ?? 0}/10)`,
      "Passive power loss expressed as a linear factor."
    ],
    gtDbK: [
      "G/T = G_dBi - 10 log10(T_K)",
      `${v.gainDb} - 10 log10(${v.temperatureK})`,
      "Receiver sensitivity improves with antenna gain and lower system temperature."
    ],
    outputNoiseW: [
      "N_out = G k(T_in+T_e)B",
      `${v.amplifierGain ?? 1} × ${c.k} × (${v.temperatureK}+${v.addedTemperatureK ?? 0}) × ${v.bandwidthHz}`,
      "Device added temperature raises amplifier output noise above amplified input noise."
    ],
    inputNoiseW: [
      "N_in = k T_in B",
      `${c.k} × ${v.temperatureK} × ${v.bandwidthHz}`,
      "Thermal noise presented to the amplifier input over the entered bandwidth."
    ],
    inputNoiseDbm: [
      "N_in,dBm = 10 log10(N_in,W) + 30",
      `10 log10(${o.inputNoiseW}) + 30`,
      "Input noise power referenced to one milliwatt."
    ],
    outputNoiseDbm: [
      "N_out,dBm = 10 log10(N_out,W) + 30",
      `10 log10(${o.outputNoiseW}) + 30`,
      "Output noise power referenced to one milliwatt."
    ],
    amplifierGainDb: [
      "G_a,dB = 10 log10(G_a)",
      `10 log10(${v.amplifierGain ?? 1})`,
      "Amplifier power gain expressed in decibels."
    ],
    compositeCNoDbHz:
      v.linkMode === "course-ft"
        ? (() => {
            const uplink = courseFtLink(v.uplink, mode);
            const downlink = courseFtLink(v.downlink, mode);
            return [
              "x_C = 1/(1/x_U+1/x_D); C/N0_C = 10 log10(x_C)",
              `10 log10(1/(10^(-${uplink.cNoDbHz}/10)+10^(-${downlink.cNoDbHz}/10)))`,
              "Independent noise densities referred to the same carrier combine reciprocally in linear hertz."
            ];
          })()
        : [
            "x_C = 1/(1/x_U+1/x_D); C/N0_C = 10 log10(x_C)",
            `10 log10(1/(10^(-${o.uplinkCNoDbHz}/10)+10^(-${o.downlinkCNoDbHz}/10)))`,
            "Independent noise densities referred to the same carrier combine reciprocally in linear hertz."
          ],
    exactCnDb: [
      "x_C = 1/(1/x_U+1/x_D+1/(x_U x_D))",
      `10 log10(1/(10^(-${o.uplinkCnDb}/10)+10^(-${o.downlinkCnDb}/10)+10^(-(${o.uplinkCnDb}+${o.downlinkCnDb})/10)))`,
      "Exact frequency-translation course expression for dimensionless C/N with common bandwidth."
    ],
    exactLinear: [
      "x_C = 1/(1/x_U+1/x_D+1/(x_U x_D))",
      `1/(1/10^(${o.uplinkCnDb}/10) + 1/10^(${o.downlinkCnDb}/10) + 1/(10^(${o.uplinkCnDb}/10) × 10^(${o.downlinkCnDb}/10)))`,
      "Finite frequency-translation carrier-to-noise ratio before logarithmic conversion."
    ],
    approximateLinear: [
      "x_C,approx = 1/(1/x_U+1/x_D)",
      `1/(1/10^(${o.uplinkCnDb}/10) + 1/10^(${o.downlinkCnDb}/10))`,
      "Reciprocal approximation omits the finite product term."
    ],
    approximateCnDb: [
      "C/N_approx,dB = 10 log10(x_C,approx)",
      `10 log10(${o.approximateLinear})`,
      "Logarithmic form of the reciprocal composite approximation."
    ],
    ebNoDb: [
      "Eb/N0 = C/N0 - 10 log10(R_b)",
      `${o.compositeCNoDbHz} - 10 log10(${v.bitRate})`,
      "Energy per information bit to noise density; use bit rate in bit/s."
    ],
    marginDb: [
      "M = (Eb/N0)_achieved - (Eb/N0)_required",
      `${o.ebNoDb} - ${v.requiredEbNoDb ?? 0}`,
      o.marginDb >= 0
        ? "The achieved Eb/N0 meets the entered requirement."
        : "The achieved Eb/N0 falls below the entered requirement."
    ],
    requiredBolPowerW: [
      "P_BOL = P_EOL/R",
      `${v.requiredPowerW ?? 5000}/${o.retention}`,
      "Required beginning-of-life rating accounts for total and annual degradation."
    ],
    bolPowerW: [
      "P_BOL = S eta A",
      `${v.solarFluxWm2 ?? 1361} × ${v.efficiency ?? 0.3} × ${v.areaM2}`,
      "Available beginning-of-life power from irradiance, cell efficiency and array area."
    ],
    eolPowerW: [
      "P_EOL = P_BOL R",
      `${o.bolPowerW} × ${o.retention}`,
      "Available array power after the modeled lifetime degradation."
    ],
    requiredAreaM2: [
      "A_req = P_BOL,req/(S eta)",
      `${o.requiredBolPowerW}/(${v.solarFluxWm2 ?? 1361} × ${v.efficiency ?? 0.3})`,
      "Array area needed to meet the required beginning-of-life power."
    ],
    dopplerHz: [
      "delta f = -v_r f/c",
      `-${v.radialVelocityMps ?? 0} × ${v.frequencyHz}/${c.c}`,
      "Positive shift means approaching; negative shift means receding."
    ],
    receivedFrequencyHz: [
      "f_r = f + delta f",
      `${v.frequencyHz} + ${o.dopplerHz}`,
      "Received carrier after the signed first-order Doppler shift."
    ],
    fractionalShift: [
      "delta f/f = -v_r/c",
      `-${v.radialVelocityMps ?? 0}/${c.c}`,
      "Dimensionless signed frequency shift; approaching motion is positive."
    ],
    ppmShift: [
      "shift_ppm = (delta f/f) 10^6",
      `${o.fractionalShift} × 10^6`,
      "Fractional Doppler shift expressed in parts per million."
    ],
    oneWayDelayS: [
      "tau = (d_U+d_D)/c",
      `(${v.uplinkDistanceM ?? v.distanceM ?? 0}+${v.downlinkDistanceM ?? 0})/${c.c}`,
      "One-way propagation through both satellite legs, excluding processing delay."
    ],
    roundTripDelayS: [
      "RTT = 2 tau",
      `2 × ${o.oneWayDelayS}`,
      "Round-trip propagation delay doubles the complete one-way path."
    ],
    channels: [
      "N = floor(B_T/(B_C+B_G))",
      `floor(${v.transponderBandwidthHz}/(${v.channelSpacingHz}+${v.guardBandwidthHz ?? 0}))`,
      "Only complete frequency slots fit within the transponder bandwidth."
    ],
    equivalentChannels:
      ["scpc", "fdma"].includes(v.accessMode) || v.transponderBandwidthHz !== undefined
        ? [
            "N_eq = B_T/(B_C+B_G)",
            `${v.transponderBandwidthHz}/(${v.channelSpacingHz}+${v.guardBandwidthHz ?? 0})`,
            "Unrounded frequency-slot capacity before requiring a whole channel."
          ]
        : [
            "N_eq = R_payload/R_PCM",
            `${o.trafficBitRate ?? v.trafficBitRate}/${v.voiceBitRate ?? 64e3}`,
            "Unrounded PCM voice-channel capacity before requiring a whole channel."
          ],
    unusedBandwidthHz: [
      "B_unused = B_T-N(B_C+B_G)",
      `${v.transponderBandwidthHz} - ${o.channels} × (${v.channelSpacingHz}+${v.guardBandwidthHz ?? 0})`,
      "Residual transponder bandwidth that cannot fit another complete guarded channel."
    ],
    overheadBits: [
      v.convention === "final-2026"
        ? "b_O = n_r b_r+n_t(b_p+b_g)"
        : "b_O = n_r(b_r+b_g)+n_t(b_p+b_g)",
      `${v.referenceStations} × (${v.referenceBits}+${v.convention === "final-2026" ? 0 : v.guardBits}) + ${v.trafficTerminals} × (${v.preambleBits}+${v.guardBits})`,
      "Reference bursts, traffic preambles and convention-specific guard allocation consume frame bits."
    ],
    efficiency: [
      "eta = 1-b_O/(r_T t_F)",
      `1 - ${o.overheadBits}/(${v.bitRate} × ${v.frameDurationS})`,
      "Actual efficiency comes from the entered integer terminal count, rather than the target efficiency."
    ],
    maxTerminals: [
      "n_t,max = floor(((1-eta_target) r_T t_F - b_fixed)/(b_p+b_g))",
      `floor(${o.maxTerminalsEquivalent})`,
      "Floor the algebraic capacity to keep the chosen target efficiency feasible."
    ],
    requiredBitRate: [
      "r_T = b_O/((1-eta_target)t_F)",
      `${o.overheadBits}/((1-${v.targetEfficiency ?? 0.9}) × ${v.frameDurationS})`,
      "Minimum frame bit rate for this overhead and target traffic efficiency."
    ],
    voiceChannels: [
      "N_voice = floor(R_traffic/R_PCM)",
      `floor(${o.trafficBitRate ?? v.trafficBitRate}/${v.voiceBitRate ?? 64e3})`,
      "Complete voice channels use the actual net traffic rate."
    ]
  };
  if (key === "velocityMps" && v.orbitMode === "vis-viva")
    return [
      "v = sqrt(mu(2/r-1/a))",
      `sqrt(${v.mu ?? c.mu} × (2/${v.radiusM}-1/${v.semiMajorAxisM}))`,
      "Instantaneous bound-orbit speed from the vis-viva energy equation."
    ];
  if (key === "uplinkCNoDbHz" || key === "downlinkCNoDbHz") {
    const up = key === "uplinkCNoDbHz";
    return [
      "C/N0 = EIRP + G/T - L - 10 log10(k)",
      `${up ? v.uplinkEirpDbw : v.downlinkEirpDbw} + ${up ? v.uplinkGtDbK : v.downlinkGtDbK} - ${up ? v.uplinkLossDb : v.downlinkLossDb} - ${linearToDb(c.k)}`,
      "Carrier-to-noise spectral density for this leg, referred to the antenna/system-noise reference."
    ];
  }
  if (["uplinkCnDb", "downlinkCnDb"].includes(key) && v.linkMode === "course-ft") {
    const legName = key === "uplinkCnDb" ? "uplink" : "downlink";
    const leg = courseFtLink(v[legName], mode);
    return [
      "C/N = 10 log10(C_W/N_W)",
      `10 log10(${leg.receivedPowerW}/${leg.noiseW})`,
      `Carrier-to-noise ratio for the ${legName} leg using that leg's own carrier and system-noise inputs.`
    ];
  }
  if (["uplinkCnDb", "downlinkCnDb", "compositeCnDb"].includes(key) && v.linkMode !== "course-ft") {
    const cno =
      key === "uplinkCnDb"
        ? o.uplinkCNoDbHz
        : key === "downlinkCnDb"
          ? o.downlinkCNoDbHz
          : o.compositeCNoDbHz;
    return [
      "C/N = C/N0 - 10 log10(B)",
      `${cno} - 10 log10(${v.bandwidthHz})`,
      "Carrier-to-noise ratio over the entered noise bandwidth in hertz."
    ];
  }
  if (key === "totalFrameBits")
    return [
      "b_F = r_T t_F",
      `${v.bitRate} × ${v.frameDurationS}`,
      "Total bit positions in one frame."
    ];
  if (key === "trafficBits")
    return [
      "b_C = b_F-b_O",
      `${o.totalFrameBits} - ${o.overheadBits}`,
      "Frame bits remaining after all reference, preamble and guard overhead."
    ];
  if (key === "trafficBitRate")
    return [
      "R_C = b_C/t_F",
      `${o.trafficBits}/${v.frameDurationS}`,
      "Actual sustained net traffic rate across all terminal bursts."
    ];
  if (key === "gainLinear" && v.noiseMode === "cascade")
    return [
      "G_total = G_1 G_2 ...",
      v.stages.map((s) => s.gainLinear ?? `10^(${s.gainDb}/10)`).join(" × "),
      "Overall cascade gain is the product of stage power gains."
    ];
  if (key === "gainLinear" && v.noiseMode === "passive")
    return [
      "G = 1/L",
      `1/${o.lossLinear}`,
      "A passive attenuator reduces power by the inverse of its loss factor."
    ];
  if (key === "noiseFactor")
    return [
      "F = 1+T_e/T_0",
      `1+${o.equivalentTemperatureK}/${t0}`,
      "Linear noise factor measures SNR degradation at the declared reference temperature."
    ];
  if (key === "noiseDensityDbwHz")
    return [
      "N0_dBW/Hz = 10 log10(kT)",
      `10 log10(${o.noiseDensityWHz})`,
      "Noise density referenced to one watt per hertz. It is independent of occupied bandwidth."
    ];
  if (key === "noiseDensityDbmHz")
    return [
      "N0_dBm/Hz = N0_dBW/Hz + 30",
      `${o.noiseDensityDbwHz} + 30`,
      "Noise density referenced to one milliwatt per hertz."
    ];
  if (key === "spreadingFactor")
    return [
      "G_p = R_chip/R_bit",
      `${v.chipRate ?? 4.096e6}/${v.informationBitRate ?? 64e3}`,
      "Chips per information bit in this ideal spread-spectrum illustration."
    ];
  if (key === "processingGainDb")
    return [
      "G_p,dB = 10 log10(R_chip/R_bit)",
      `10 log10(${o.spreadingFactor})`,
      "Processing gain describes the chip-to-bit-rate ratio; it does not by itself determine user capacity."
    ];
  if (key === "idealOrthogonalCodes")
    return [
      "N_Walsh = L",
      `${v.codeLength ?? 64}`,
      "A length-L Walsh matrix provides L mutually orthogonal rows under ideal synchronous timing."
    ];
  if (key === "codeDurationS")
    return [
      "T_code = L/R_chip",
      `${v.codeLength ?? 64}/${v.chipRate ?? 4.096e6}`,
      "Duration of one complete spreading code at the specified chip rate."
    ];
  if (key === "idealGainLinear")
    return [
      "G_ideal = (pi D/lambda)²",
      `(pi × ${v.diameterM}/${o.wavelengthM})²`,
      "Ideal aperture gain assumes unity aperture efficiency."
    ];
  if (key === "idealGainDb")
    return [
      "G_ideal,dBi = 10 log10(G_ideal)",
      `10 log10(${o.idealGainLinear})`,
      "The ideal dish gain exceeds practical gain by the aperture-efficiency loss."
    ];
  if (key === "maxTerminalsEquivalent")
    return [
      v.convention === "final-2026"
        ? "n_t = ((1-eta)r_T t_F - n_r b_r)/(b_p+b_g)"
        : "n_t = ((1-eta)r_T t_F - n_r(b_r+b_g))/(b_p+b_g)",
      `((1-${v.targetEfficiency ?? 0.9}) × ${v.bitRate} × ${v.frameDurationS} - ${v.referenceStations} × (${v.referenceBits}+${v.convention === "final-2026" ? 0 : v.guardBits}))/(${v.preambleBits}+${v.guardBits})`,
      "Unrounded algebraic terminal count; a negative result means the reference overhead alone makes the target infeasible."
    ];
  if (key === "radiusM" && v.orbitMode === "geo")
    return [
      "r = (mu T²/(4 pi²))^(1/3)",
      `(${v.mu ?? c.mu} × ${o.periodS}²/(4 pi²))^(1/3)`,
      "Geosynchronous radius derives from the selected rotational period."
    ];
  if (key === "slantRangeM")
    return [
      "d = sqrt(E²+N²+U²)",
      `sqrt(${o.eastM}²+${o.northM}²+${o.upM}²)`,
      "Straight-line distance from the station to the satellite."
    ];
  if (key === "elevationDeg")
    return [
      "El = atan2(U,sqrt(E²+N²))",
      `atan2(${o.upM},hypot(${o.eastM},${o.northM})) × 180/pi`,
      "Elevation above the local horizontal; negative means geometrically hidden."
    ];
  if (key === "azimuthDeg")
    return [
      "Az = (atan2(E,N) × 180/pi + 360) mod 360",
      `(atan2(${o.eastM},${o.northM}) × 180/pi + 360) mod 360`,
      o.azimuthDefined
        ? "Clockwise angle from true north."
        : "Azimuth is undefined on the vertical axis; zero is a display placeholder."
    ];
  if (key === "retention")
    return v.powerMode === "annual"
      ? [
          "R = (1-d)^y",
          `(1-${v.degradationPerYear ?? 0})^${v.years ?? 0}`,
          "Annual model compounds the annual degradation across the entered lifetime."
        ]
      : [
          "R = 1-D",
          `1-${v.degradationFraction ?? 0}`,
          "Core course model uses a single total end-of-life degradation fraction."
        ];
  return (
    map[key] ?? [
      fallback,
      JSON.stringify(v),
      "Calculated from the entered physical quantities using the selected constants."
    ]
  );
}
function latexFormula(key, plain) {
  const formulas = {
    altitudeM: String.raw`h=r-R_E`,
    meanMotionRadS: String.raw`n=\frac{2\pi}{T}`,
    centralAngleRad: String.raw`\theta=\cos^{-1}\!\left(\frac{R_E\cos El}{R_E+h}\right)-El`,
    centralAngleDeg: String.raw`\theta_{deg}=\theta_{rad}\frac{180}{\pi}`,
    areaM2: String.raw`A=2\pi R_E^2(1-\cos\theta)`,
    coverageFraction: String.raw`q=\frac{1-\cos\theta}{2}`,
    apogeeRadiusM: String.raw`r_a=\text{given centre distance}`,
    perigeeRadiusM: String.raw`r_p=\text{given centre distance}`,
    apogeeVelocityMps: String.raw`v_a=\sqrt{\mu\left(\frac{2}{r_a}-\frac1a\right)}`,
    perigeeVelocityMps: String.raw`v_p=\sqrt{\mu\left(\frac{2}{r_p}-\frac1a\right)}`,
    radiusM: String.raw`r=R_E+h`,
    velocityMps: String.raw`v=\sqrt{\frac{\mu}{r}}`,
    periodS: String.raw`T=2\pi\sqrt{\frac{a^3}{\mu}}`,
    eccentricity: String.raw`e=\frac{r_a-r_p}{r_a+r_p}`,
    semiMajorAxisM: String.raw`a=\frac{r_a+r_p}{2}`,
    wavelengthM: String.raw`\lambda=\frac{c}{f}`,
    physicalApertureM2: String.raw`A=\frac{\pi D^2}{4}`,
    effectiveApertureM2: String.raw`A_e=\frac{G\lambda^2}{4\pi}=\eta A`,
    gainLinear: String.raw`G=\eta\left(\frac{\pi D}{\lambda}\right)^2`,
    gainDb: String.raw`G_{\mathrm{dBi}}=10\log_{10}G`,
    beamwidthDeg: String.raw`\theta_{HP}=K\frac{\lambda}{D}`,
    fsplDb: String.raw`L_{FS}=20\log_{10}\left(\frac{4\pi df}{c}\right)`,
    eirpDbw: String.raw`\mathrm{EIRP}=10\log_{10}P_t+G_t-L_t`,
    pfdWm2: String.raw`\Phi=\frac{\mathrm{EIRP}_{W}}{4\pi d^2 a_{path}}`,
    receivedPowerDbw: String.raw`C=\mathrm{EIRP}-L_{FS}-L_{path}+G_r-L_r`,
    receivedPowerW: String.raw`C=\Phi A_e`,
    noiseW: String.raw`N=kTB`,
    noiseDbw: String.raw`N_{\mathrm{dBW}}=10\log_{10}N_W`,
    noiseDbm: String.raw`N_{\mathrm{dBm}}=N_{\mathrm{dBW}}+30`,
    noiseDensityWHz: String.raw`N_0=kT`,
    equivalentTemperatureK: String.raw`T_e=T_0(F-1)`,
    noiseFigureDb: String.raw`NF=10\log_{10}F`,
    gtDbK: String.raw`\frac{G}{T}=G_{\mathrm{dBi}}-10\log_{10}T_K`,
    outputNoiseW: String.raw`N_{out}=Gk(T_{in}+T_e)B`,
    uplinkCNoDbHz: String.raw`(C/N_0)_U=\mathrm{EIRP}_U+(G/T)_S-L_U-10\log_{10}k`,
    downlinkCNoDbHz: String.raw`(C/N_0)_D=\mathrm{EIRP}_D+(G/T)_G-L_D-10\log_{10}k`,
    compositeCNoDbHz: String.raw`x_C=\left(\frac{1}{x_U}+\frac{1}{x_D}\right)^{-1}`,
    compositeCnDb: String.raw`(C/N)_C=(C/N_0)_C-10\log_{10}B`,
    uplinkCnDb: String.raw`(C/N)_U=(C/N_0)_U-10\log_{10}B`,
    downlinkCnDb: String.raw`(C/N)_D=(C/N_0)_D-10\log_{10}B`,
    exactLinear: String.raw`x_C=\left(\frac{1}{x_U}+\frac{1}{x_D}+\frac{1}{x_Ux_D}\right)^{-1}`,
    exactCnDb: String.raw`x_C=\frac{x_Ux_D}{1+x_U+x_D}`,
    approximateLinear: String.raw`x_{C,\mathrm{approx}}=\left(\frac{1}{x_U}+\frac{1}{x_D}\right)^{-1}`,
    approximateCnDb: String.raw`x_C\approx\frac{x_Ux_D}{x_U+x_D}`,
    ebNoDb: String.raw`E_b/N_0=C/N_0-10\log_{10}R_b`,
    marginDb: String.raw`M=(E_b/N_0)_{ach}-(E_b/N_0)_{req}`,
    requiredBolPowerW: String.raw`P_{BOL}=\frac{P_{EOL}}{R}`,
    eolPowerW: String.raw`P_{EOL}=P_{BOL}R`,
    dopplerHz: String.raw`\Delta f=-\frac{v_r}{c}f`,
    oneWayDelayS: String.raw`\tau=\frac{d_U+d_D}{c}`,
    roundTripDelayS: String.raw`RTT=2\tau`,
    channels: String.raw`N=\left\lfloor\frac{B_T}{B_C+B_G}\right\rfloor`,
    overheadBits: String.raw`b_O=n_r(b_r+b_g)+n_t(b_p+b_g)`,
    totalFrameBits: String.raw`b_F=r_Tt_F`,
    trafficBits: String.raw`b_C=b_F-b_O`,
    efficiency: String.raw`\eta_F=1-\frac{b_O}{r_Tt_F}`,
    maxTerminals: String.raw`n_{t,max}=\left\lfloor\frac{(1-\eta)r_Tt_F-n_r(b_r+b_g)}{b_p+b_g}\right\rfloor`,
    requiredBitRate: String.raw`r_T=\frac{b_O}{(1-\eta)t_F}`,
    voiceChannels: String.raw`N_{voice}=\left\lfloor\frac{R_C}{R_{PCM}}\right\rfloor`
  };
  return (
    formulas[key] ??
    String.raw`\text{${plain
      .replace(/[{}\\]/g, "")
      .replace(/_/g, " ")
      .replace(/²/g, " squared")
      .replace(/³/g, " cubed")}}`
  );
}
export function calculate(toolSlug, values = {}, mode = "course") {
  constants(mode);
  let out;
  const warnings = [];
  switch (toolSlug) {
    case "frequency-bands":
      out = { wavelengthM: constants(mode).c / positive(values.frequencyHz, "Carrier frequency") };
      break;
    case "orbit": {
      const om = values.orbitMode ?? "circular";
      if (!["circular", "elliptical", "geo", "coverage", "vis-viva"].includes(om))
        throw new RangeError("Unknown orbit mode.");
      out =
        om === "elliptical"
          ? ellipticalOrbit(values, mode)
          : om === "geo"
            ? geoOrbit(values, mode)
            : om === "coverage"
              ? coverage(values, mode)
              : om === "vis-viva"
                ? visViva(values, mode)
                : { ...circularOrbit(values, mode), ...coverage(values, mode) };
      if (om === "circular" && Number(values.altitudeM) === 800e3)
        warnings.push(
          "Course note: the printed final answer gives 6030 s; consistent printed constants yield about 6043 s."
        );
      break;
    }
    case "look-angles":
      out = lookAngles(values, mode);
      if (!out.visible) warnings.push("Satellite is below the local geometric horizon.");
      if (!out.azimuthDefined)
        warnings.push(
          "On the vertical axis, azimuth is undefined; the displayed 0° is only a placeholder."
        );
      break;
    case "power-lifetime":
      out = solarPower(values);
      break;
    case "antenna":
      out = antenna(values, mode);
      if (Number(values.diameterM) < out.wavelengthM)
        warnings.push(
          "The dish approximation is intended for diameters large relative to wavelength."
        );
      break;
    case "rf-path":
      out = rfPath(values, mode);
      if (Number(values.distanceM) < out.wavelengthM / (4 * Math.PI))
        warnings.push(
          "Free-space spreading and Friis assume a far-field path; this separation is too small."
        );
      break;
    case "noise-gt": {
      const nm = values.noiseMode ?? "thermal";
      switch (nm) {
        case "density":
          out = noiseDensity(values, mode);
          break;
        case "thermal":
          out = {
            ...thermalNoise(values, mode),
            ...(values.gainDb !== undefined ? gOverT(values) : {})
          };
          break;
        case "nf":
          if (values.nfInput !== undefined && !["nf", "factor", "te"].includes(values.nfInput))
            throw new RangeError(
              "Select noise figure, linear noise factor, or equivalent temperature input."
            );
          out = noiseFigure(
            values.nfInput === "factor"
              ? {
                  noiseFactor: values.noiseFactor,
                  referenceTemperatureK: values.referenceTemperatureK
                }
              : values.nfInput === "te"
                ? {
                    equivalentTemperatureK:
                      values.equivalentTemperatureK ?? values.addedTemperatureK,
                    referenceTemperatureK: values.referenceTemperatureK
                  }
                : values
          );
          break;
        case "passive":
          out = passiveNoise(values);
          break;
        case "cascade":
          out = cascadeNoise(values);
          break;
        case "amplifier":
          out = amplifierNoise(values, mode);
          break;
        case "gt":
          out = gOverT(values);
          break;
        default:
          throw new RangeError("Unknown noise mode.");
      }
      break;
    }
    case "link-budget": {
      const lm = values.linkMode ?? "standard";
      if (lm === "basic") out = rfPath(values, mode);
      else if (lm === "standard") out = linkBudget(values, mode);
      else if (lm === "course-ft") {
        if (
          !values.uplink ||
          !values.downlink ||
          typeof values.uplink !== "object" ||
          typeof values.downlink !== "object"
        )
          throw new RangeError("Both uplink and downlink leg inputs are required.");
        const u = courseFtLink(values.uplink, mode),
          d = courseFtLink(values.downlink, mode);
        if (Number(values.uplink.bandwidthHz) !== Number(values.downlink.bandwidthHz))
          throw new RangeError(
            "Exact FT C/N requires a common uplink and downlink noise bandwidth."
          );
        const c = compositeCN({ uplinkCnDb: u.cnDb, downlinkCnDb: d.cnDb });
        out = {
          uplinkCnDb: u.cnDb,
          downlinkCnDb: d.cnDb,
          ...c,
          ...combineCNo({ uplinkCNoDbHz: u.cNoDbHz, downlinkCNoDbHz: d.cNoDbHz })
        };
        warnings.push(
          "Exact FT C/N is dimensionless and assumes a common bandwidth; C/N0 uses independent reciprocal noise-density combination."
        );
      } else throw new RangeError("Unknown link mode.");
      if (out.uplinkCnDb !== undefined)
        warnings.push(
          out.uplinkCnDb === out.downlinkCnDb
            ? "Uplink and downlink contribute equally."
            : out.uplinkCnDb < out.downlinkCnDb
              ? "The lower uplink C/N limits the link."
              : "The lower downlink C/N limits the link."
        );
      break;
    }
    case "doppler-delay":
      out = dopplerDelay(values, mode);
      if (Math.abs(Number(values.radialVelocityMps)) > constants(mode).c * 0.01)
        warnings.push(
          "The first-order Doppler approximation is intended for speeds much less than light speed."
        );
      break;
    case "multiple-access": {
      const am =
        values.accessMode ?? (values.transponderBandwidthHz !== undefined ? "scpc" : "tdma");
      if (!["scpc", "fdma", "tdma", "voice", "cdma"].includes(am))
        throw new RangeError("Select SCPC, FDMA, TDMA, CDMA or voice capacity.");
      out =
        am === "scpc" || am === "fdma"
          ? scpcCapacity(values)
          : am === "cdma"
            ? cdmaCodes(values)
            : am === "voice"
              ? voiceCapacity(values)
              : tdma(values);
      if (am === "tdma" && values.convention === "final-2026")
        warnings.push(
          "2026 model-answer compatibility omits reference-burst guard bits used in the lecture formula."
        );
      if (am === "cdma")
        warnings.push(
          "Ideal synchronous Walsh codes are mutually orthogonal only under the assumed timing model. This code-family count is not a satellite RF user-capacity prediction."
        );
      if (out.targetFeasible === false)
        warnings.push("Fixed reference overhead alone exceeds the target overhead allowance.");
      break;
    }
    default:
      throw new RangeError("Unknown satellite tool.");
  }
  const [formula, interpretation] = FORMULAS[toolSlug];
  const results = Object.entries(out)
    .filter(([, value]) => typeof value === "number")
    .map(([key, value]) => {
      if (!Number.isFinite(value))
        throw new RangeError(`Calculation overflow for ${key}; use a smaller physical input.`);
      return {
        key,
        label: resultMetadata[key]?.[1] ?? LABELS[key] ?? label(key),
        symbol: resultMetadata[key]?.[0],
        value,
        unit:
          UNITS[key] ??
          (key.includes("Channels") || key === "channels"
            ? "channels"
            : key.includes("Terminals")
              ? "terminals"
              : "ratio"),
        interpretation: detail(key, values, out, mode, formula)[2]
      };
    });
  const substitution = Object.entries(values)
    .filter(([, v]) => typeof v !== "object")
    .map(([k, v]) => `${k} = ${v}`)
    .join("; ");
  let specific = formula;
  if (toolSlug === "orbit" && values.orbitMode === "elliptical")
    specific =
      "a = (r_a+r_p)/2; e = (r_a-r_p)/(r_a+r_p); v = sqrt(mu(2/r-1/a)); T = 2 pi sqrt(a³/mu)";
  if (toolSlug === "orbit" && values.orbitMode === "geo")
    specific = "r = (mu T²/(4 pi²))^(1/3); h = r - R_E";
  if (toolSlug === "orbit" && values.orbitMode === "coverage")
    specific = "theta = acos(R_E cos(El)/(R_E+h)) - El; A = 2 pi R_E²(1-cos(theta))";
  const steps = results.map((r) => {
    const [plain, numeric, meaning] = detail(r.key, values, out, mode, specific);
    let f = latexFormula(r.key, plain);
    if (values.rfMode === "pfd-receive") {
      f =
        {
          receivedPowerW: String.raw`C=\frac{\Phi A_e}{10^{L_r/10}}`,
          receivedPowerDbw: String.raw`C_{dBW}=10\log_{10}(C_W)`,
          receivedPowerDbm: String.raw`C_{dBm}=C_{dBW}+30`
        }[r.key] ?? f;
    }
    if (r.key === "radiusM" && values.orbitMode === "geo")
      f = String.raw`r=\left(\frac{\mu T^2}{4\pi^2}\right)^{1/3}`;
    if (r.key === "gainLinear" && values.noiseMode === "cascade")
      f = String.raw`G_{total}=\prod_i G_i`;
    if (r.key === "gainLinear" && values.noiseMode === "passive") f = String.raw`G=1/L`;
    if (r.key === "velocityMps" && values.orbitMode === "vis-viva")
      f = String.raw`v=\sqrt{\mu(2/r-1/a)}`;
    if (r.key === "equivalentTemperatureK" && values.noiseMode === "passive")
      f = String.raw`T_e=T_p(L-1)`;
    if (r.key === "equivalentTemperatureK" && values.noiseMode === "cascade")
      f = String.raw`T_{eq}=T_{e1}+\frac{T_{e2}}{G_1}+\frac{T_{e3}}{G_1G_2}+\cdots`;
    if (values.convention === "final-2026" && r.key === "overheadBits")
      f = String.raw`b_O=n_rb_r+n_t(b_p+b_g)`;
    if (values.convention === "final-2026" && r.key === "maxTerminals")
      f = String.raw`n_{t,max}=\left\lfloor\frac{(1-\eta)r_Tt_F-n_rb_r}{b_p+b_g}\right\rfloor`;
    return {
      title: r.label,
      formula: f,
      substitution: numeric,
      result: `${r.value} ${r.unit}`,
      interpretation: meaning
    };
  });
  const waterfall =
    out.receivedPowerDbw !== undefined && values.rfMode !== "pfd-receive"
      ? [
          { label: "Transmit power", value: wattsToDbw(values.powerW ?? 1), unit: "dBW" },
          { label: "Transmit antenna gain", value: Number(values.transmitGainDb ?? 0), unit: "dB" },
          { label: "Transmit feeder loss", value: -Number(values.transmitLossDb ?? 0), unit: "dB" },
          { label: "EIRP", value: out.eirpDbw, unit: "dBW", total: true },
          { label: "Free-space path loss", value: -out.fsplDb, unit: "dB" },
          { label: "Additional path loss", value: -Number(values.pathLossDb ?? 0), unit: "dB" },
          { label: "Receive antenna gain", value: Number(values.receiveGainDb ?? 0), unit: "dB" },
          { label: "Receive feeder loss", value: -Number(values.receiveLossDb ?? 0), unit: "dB" },
          { label: "Received carrier", value: out.receivedPowerDbw, unit: "dBW", total: true }
        ]
      : undefined;
  return {
    results,
    steps: [
      {
        title: "Given and SI unit convention",
        formula: String.raw`\text{SI: m, s, Hz, W, K; positive dB losses}`,
        substitution,
        result: `${mode}: c = ${constants(mode).c} m/s, mu = ${constants(mode).mu} m³/s², k = ${constants(mode).k} J/K`,
        interpretation
      },
      ...steps
    ],
    warnings,
    diagram: { type: toolSlug, ...out, ...(waterfall ? { waterfall } : {}) },
    constants: constants(mode)
  };
}
