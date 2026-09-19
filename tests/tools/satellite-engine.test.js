import test from "node:test";
import assert from "node:assert/strict";
import katex from "katex";
import * as e from "../../lib/tools/satellite/engine.js";
const near = (a, b, t = 1e-6) => assert.ok(Math.abs(a - b) <= t, `${a} != ${b}`);
test("every orbit result has a worked substitution rather than a hidden-input JSON dump", () => {
  for (const orbitMode of ["circular", "elliptical", "geo", "coverage", "vis-viva"]) {
    const data = e.calculate("orbit", {
      orbitMode,
      altitudeM: 800000,
      earthRadiusM: 6371000,
      mu: 398600e9,
      apogeeRadiusM: 7600000,
      perigeeRadiusM: 7200000,
      minimumElevationDeg: 30,
      radiusM: 7200000,
      semiMajorAxisM: 7400000,
      periodS: 86164
    });
    for (const step of data.steps.slice(1)) {
      assert.doesNotMatch(step.substitution, /[{}]|undefined/, `${orbitMode}: ${step.title}`);
      assert.doesNotMatch(
        step.formula,
        /\\text\{.*sqrt/,
        `${orbitMode}: ${step.title} needs mathematical notation`
      );
    }
  }
});
test("PFD receive mode uses physical aperture and applies feeder loss exactly once", () => {
  for (const [fluxDensityWm2, effectiveApertureM2, receiveLossDb, watts, dbw] of [
    [1e-8, 2, 0, 2e-8, -76.98970004336],
    [1e-8, 2, 10, 2e-9, -86.98970004336],
    [4e-9, 5, 0, 2e-8, -76.98970004336]
  ]) {
    const c = e.calculate("rf-path", {
      rfMode: "pfd-receive",
      fluxDensityWm2,
      effectiveApertureM2,
      receiveLossDb
    });
    const result = (key) => c.results.find((r) => r.key === key)?.value;
    near(result("receivedPowerW"), watts, 1e-20);
    near(result("receivedPowerDbw"), dbw, 1e-9);
    near(result("receivedPowerDbm"), dbw + 30, 1e-9);
    assert.ok(c.steps.every((s) => !/undefined|NaN/.test(s.substitution)));
    assert.match(c.steps.find((s) => s.result.endsWith(" W")).formula, /10/);
  }
});
test("PFD receive mode rejects nonphysical flux, aperture and loss", () => {
  const base = { rfMode: "pfd-receive", fluxDensityWm2: 1e-8, effectiveApertureM2: 2 };
  for (const key of ["fluxDensityWm2", "effectiveApertureM2"])
    for (const value of [0, -1, NaN, Infinity, ""])
      assert.throws(() => e.calculate("rf-path", { ...base, [key]: value }));
  assert.throws(() => e.calculate("rf-path", { ...base, receiveLossDb: -1 }));
});
test("course acceptance examples retain consistent physical units", () => {
  near(e.rfPath({ frequencyHz: 6e9, distanceM: 1e4, powerW: 10 }).fsplDb, 128.0048, 0.001);
  const a = e.antenna({ frequencyHz: 1e10, diameterM: 2, efficiency: 0.7 });
  near(a.wavelengthM, 0.03);
  near(a.gainDb, 44.87, 0.01);
  const n = e.thermalNoise({ temperatureK: 300.15, bandwidthHz: 30e6 });
  near(n.noiseDbw, -129.06, 0.01);
  near(n.noiseDbm, -99.06, 0.01);
  near(e.gOverT({ gainDb: 44, temperatureK: 300.15 }).gtDbK, 19.23, 0.01);
  const o = e.circularOrbit({ altitudeM: 800e3, earthRadiusM: 6371e3, mu: 398600e9 });
  near(o.radiusM, 7171e3);
  near(o.periodS, 6043.3926, 0.001);
  near(
    e.ellipticalOrbit({ apogeeRadiusM: 7600e3, perigeeRadiusM: 7200e3 }).eccentricity,
    0.027027027
  );
  assert.equal(
    e.scpcCapacity({ transponderBandwidthHz: 54e6, channelSpacingHz: 60e3 }).channels,
    900
  );
});
test("validation rejects blank, nonfinite, negative and invalid geometry", () => {
  for (const frequencyHz of ["", null, NaN, Infinity, 0, -1])
    assert.throws(() => e.antenna({ frequencyHz, diameterM: 2, efficiency: 0.7 }));
  assert.throws(() => e.ellipticalOrbit({ apogeeRadiusM: 7200e3, perigeeRadiusM: 7600e3 }));
  assert.throws(() => e.antenna({ frequencyHz: 1e9, diameterM: 2, efficiency: 1.01 }));
  assert.throws(() => e.lookAngles({ latitudeDeg: 91, longitudeDeg: 0, satelliteLongitudeDeg: 0 }));
});
test("Friis equals PFD times effective aperture", () => {
  const p = e.rfPath({
    frequencyHz: 12e9,
    distanceM: 38e6,
    powerW: 20,
    transmitGainDb: 40,
    receiveGainDb: 44,
    pathLossDb: 2
  });
  near(p.receivedPowerW, p.pfdWm2 * p.effectiveApertureM2, 1e-25);
});
test("look angles handle zenith, quadrants and hidden satellite", () => {
  const z = e.lookAngles({ latitudeDeg: 0, longitudeDeg: 0, satelliteLongitudeDeg: 0 });
  near(z.elevationDeg, 90);
  assert.equal(z.azimuthDefined, false);
  const s = e.lookAngles({ latitudeDeg: 30, longitudeDeg: 0, satelliteLongitudeDeg: 0 });
  near(s.azimuthDeg, 180);
  assert.equal(
    e.lookAngles({ latitudeDeg: 0, longitudeDeg: 0, satelliteLongitudeDeg: 180 }).visible,
    false
  );
});
test("orbit invariants, GEO and coverage boundaries", () => {
  const o = e.ellipticalOrbit({ apogeeRadiusM: 7600e3, perigeeRadiusM: 7200e3 });
  assert.ok(o.perigeeVelocityMps > o.apogeeVelocityMps);
  near(
    e.visViva({ radiusM: o.perigeeRadiusM, semiMajorAxisM: o.semiMajorAxisM }).velocityMps,
    o.perigeeVelocityMps
  );
  near(e.geoOrbit({}).radiusM, 42164138.62624946, 0.01);
  near(e.coverage({ altitudeM: 800e3, minimumElevationDeg: 90 }).areaM2, 0);
});
test("noise conversion, passive and cascades", () => {
  near(e.noiseFigure({ noiseFigureDb: 0 }).equivalentTemperatureK, 0);
  const p = e.passiveNoise({ lossDb: 3, physicalTemperatureK: 290 });
  near(p.noiseFigureDb, 3);
  const c = e.cascadeNoise({
    stages: [
      { gainLinear: 10, equivalentTemperatureK: 100 },
      { gainLinear: 20, equivalentTemperatureK: 200 }
    ]
  });
  near(c.equivalentTemperatureK, 120);
  near(c.noiseFactor, 1 + 120 / 290);
  const a = e.amplifierNoise({
    temperatureK: 300.15,
    addedTemperatureK: 300.15,
    bandwidthHz: 2e6,
    amplifierGain: 20
  });
  near(a.outputNoiseW / a.inputNoiseW, 40);
});
test("composite FT exact is dimensionless and differs from density reciprocal", () => {
  const c = e.compositeCN({ uplinkCnDb: 10, downlinkCnDb: 10 });
  near(c.exactLinear, 100 / 21);
  near(c.approximateLinear, 5);
  near(e.combineCNo({ uplinkCNoDbHz: 80, downlinkCNoDbHz: 80 }).compositeCNoDbHz, 76.98970004);
});
test("TDMA conventions, flooring, infeasible frames and required rate", () => {
  const v = {
    bitRate: 120e6,
    frameDurationS: 0.002,
    referenceStations: 2,
    trafficTerminals: 80,
    referenceBits: 560,
    preambleBits: 280,
    guardBits: 128,
    targetEfficiency: 0.9
  };
  const l = e.tdma(v),
    f = e.tdma({ ...v, convention: "final-2026" });
  assert.equal(l.overheadBits - f.overheadBits, 256);
  assert.equal(l.maxTerminals, Math.floor(l.maxTerminalsEquivalent));
  assert.ok(l.requiredBitRate > 0);
  assert.throws(() => e.tdma({ ...v, bitRate: 100 }));
  near(e.voiceCapacity({ trafficBitRate: 120e6, voiceBitRate: 64e3 }).equivalentChannels, 1875);
});
test("power retention, signed Doppler and delay", () => {
  near(
    e.solarPower({ requiredPowerW: 5000, degradationFraction: 0.25 }).requiredBolPowerW,
    5000 / 0.75
  );
  near(
    e.dopplerDelay({
      frequencyHz: 1e10,
      radialVelocityMps: -7500,
      uplinkDistanceM: 36e6,
      downlinkDistanceM: 36e6
    }).dopplerHz,
    250e3
  );
  near(
    e.dopplerDelay({
      frequencyHz: 1e10,
      radialVelocityMps: 0,
      uplinkDistanceM: 36e6,
      downlinkDistanceM: 36e6
    }).roundTripDelayS,
    0.48
  );
});
test("adapter always has named results, steps and warnings", () => {
  const c = e.calculate("antenna", { frequencyHz: 1e10, diameterM: 2, efficiency: 0.7 });
  assert.ok(c.results.length);
  assert.ok(c.steps.every((s) => s.formula && s.substitution && s.title));
  assert.ok(Array.isArray(c.warnings));
});
test("units preserve frequency, power, distance and temperature dimensions", () => {
  near(e.convertUnit({ value: 6, from: "GHz", to: "Hz" }), 6e9);
  near(e.convertUnit({ value: 10, from: "km", to: "m" }), 1e4);
  near(e.convertUnit({ value: 0, from: "dBW", to: "dBm" }), 30);
  near(e.convertUnit({ value: 30, from: "dBm", to: "W" }), 1);
  near(e.convertUnit({ value: 27, from: "C", to: "K" }), 300.15);
  near(e.convertUnit({ value: 100, from: "K", to: "dBK" }), 20);
  assert.throws(() => e.convertUnit({ value: 1, from: "GHz", to: "km" }));
  assert.throws(() => e.convertUnit({ value: -274, from: "C", to: "K" }));
});
test("dB zero is unity; power logarithms reject zero; modes are explicit", () => {
  near(e.dbToLinear(0), 1);
  near(e.linearToDb(1), 0);
  near(e.dbmToWatts(-30), 1e-6);
  assert.throws(() => e.linearToDb(0));
  assert.throws(() => e.dbToLinear(Infinity));
  assert.throws(() => e.constants("unknown"));
  assert.equal(e.constants("engineering").c, 299792458);
});
test("elliptical circular limit and orbital scaling", () => {
  const a = e.ellipticalOrbit({ apogeeRadiusM: 7e6, perigeeRadiusM: 7e6 });
  near(a.eccentricity, 0);
  near(a.perigeeVelocityMps, a.apogeeVelocityMps);
  const x = e.circularOrbit({ altitudeM: 0, earthRadiusM: 7e6 }),
    y = e.circularOrbit({ altitudeM: 7e6, earthRadiusM: 7e6 });
  near(y.periodS / x.periodS, 2 ** 1.5);
  near(e.semiMajorAxis({ periodS: x.periodS }).semiMajorAxisM, 7e6, 0.001);
});
test("coverage increases with height and decreases with minimum elevation", () => {
  const a = e.coverage({ altitudeM: 800e3 }),
    b = e.coverage({ altitudeM: 36e6 }),
    c = e.coverage({ altitudeM: 800e3, minimumElevationDeg: 20 });
  assert.ok(b.areaM2 > a.areaM2);
  assert.ok(c.areaM2 < a.areaM2);
  near(e.coverage({ altitudeM: 0 }).areaM2, 0);
  assert.throws(() => e.coverage({ altitudeM: -1 }));
  assert.throws(() => e.visViva({ radiusM: 14e6, semiMajorAxisM: 7e6 }));
});
test("look angle east and west quadrants and longitude wrap", () => {
  const east = e.lookAngles({ latitudeDeg: 0, longitudeDeg: 0, satelliteLongitudeDeg: 20 }),
    west = e.lookAngles({ latitudeDeg: 0, longitudeDeg: 0, satelliteLongitudeDeg: -20 });
  near(east.azimuthDeg, 90);
  near(west.azimuthDeg, 270);
  near(east.slantRangeM, west.slantRangeM);
  const wrap = e.lookAngles({ latitudeDeg: 0, longitudeDeg: 180, satelliteLongitudeDeg: -180 });
  near(wrap.elevationDeg, 90);
  assert.throws(() =>
    e.lookAngles({ latitudeDeg: 0, longitudeDeg: 181, satelliteLongitudeDeg: 0 })
  );
});
test("solar total and annual retention keep their models separate", () => {
  const a = e.solarPower({ requiredPowerW: 5000, degradationFraction: 0.1 });
  near(a.requiredBolPowerW, 5555.55555556, 0.00001);
  const b = e.solarPower({
    requiredPowerW: 1000,
    powerMode: "annual",
    degradationPerYear: 0.02,
    years: 10,
    areaM2: 10,
    solarFluxWm2: 1000,
    efficiency: 0.2
  });
  near(b.retention, 0.98 ** 10);
  near(b.bolPowerW, 2000);
  near(b.eolPowerW, 2000 * 0.98 ** 10);
  assert.throws(() => e.solarPower({ degradationFraction: 1 }));
  assert.throws(() => e.solarPower({ efficiency: 0 }));
});
test("dish scaling and aperture-gain identity", () => {
  const a = e.antenna({ frequencyHz: 10e9, diameterM: 2 }),
    b = e.antenna({ frequencyHz: 20e9, diameterM: 2 }),
    c = e.antenna({ frequencyHz: 10e9, diameterM: 4 });
  near(b.gainDb - a.gainDb, 6.02059991);
  near(c.gainDb - a.gainDb, 6.02059991);
  near(b.beamwidthDeg, a.beamwidthDeg / 2);
  near(a.gainLinear, (4 * Math.PI * a.effectiveApertureM2) / a.wavelengthM ** 2);
});
test("path inverse-square loss and feeder convention", () => {
  const v = { frequencyHz: 6e9, distanceM: 1e4, powerW: 10, transmitGainDb: 10, receiveGainDb: 20 },
    a = e.rfPath(v),
    b = e.rfPath({ ...v, distanceM: 2e4 }),
    c = e.rfPath({ ...v, transmitLossDb: 1, receiveLossDb: 2, pathLossDb: 3 });
  near(b.fsplDb - a.fsplDb, 6.02059991);
  near(a.receivedPowerW / b.receivedPowerW, 4);
  near(a.receivedPowerDbw - c.receivedPowerDbw, 6);
  near(e.eirp(v).eirpDbw, 20);
  assert.throws(() => e.rfPath({ ...v, pathLossDb: -1 }));
});
test("noise scales linearly and reference temperatures remain distinct", () => {
  const a = e.thermalNoise({ temperatureK: 290, bandwidthHz: 1e6 }, "engineering"),
    b = e.thermalNoise({ temperatureK: 580, bandwidthHz: 1e6 }, "engineering");
  near(b.noiseW / a.noiseW, 2);
  near(
    a.noiseDensityWHz,
    e.noiseDensity({ temperatureK: 290 }, "engineering").noiseDensityWHz,
    1e-30
  );
  near(e.noiseFigure({ equivalentTemperatureK: 290 }).noiseFactor, 2);
  near(e.passiveNoise({ lossLinear: 2, physicalTemperatureK: 100 }).equivalentTemperatureK, 100);
  assert.throws(() => e.noiseFigure({ noiseFigureDb: -1 }));
});
test("standard budget, conversions and positive/negative margins", () => {
  const v = {
      uplinkEirpDbw: 50,
      uplinkGtDbK: 10,
      uplinkLossDb: 200,
      downlinkEirpDbw: 45,
      downlinkGtDbK: 20,
      downlinkLossDb: 205,
      bandwidthHz: 1e6,
      bitRate: 1e6,
      requiredEbNoDb: 20
    },
    a = e.linkBudget(v);
  near(a.uplinkCNoDbHz, a.downlinkCNoDbHz);
  near(a.compositeCnDb, a.uplinkCnDb - 3.010299956);
  near(a.ebNoDb, a.compositeCnDb);
  near(a.marginDb, a.ebNoDb - 20);
  near(e.cNoToCN({ cNoDbHz: 80, bandwidthHz: 1e6 }).cnDb, 20);
  near(e.cNoToEbNo({ cNoDbHz: 80, bitRate: 1e7 }).ebNoDb, 10);
  near(e.margin({ achievedDb: 10, requiredDb: 12 }).marginDb, -2);
});
test("FT path noise, exact common bandwidth and NF temperature", () => {
  const leg = {
      frequencyHz: 6e9,
      distanceM: 36e6,
      powerW: 20,
      transmitGainDb: 40,
      receiveGainDb: 30,
      pathLossDb: 3,
      antennaTemperatureK: 100,
      pathTemperatureK: 290,
      noiseFigureDb: 3,
      bandwidthHz: 1e6
    },
    a = e.courseFtLink(leg);
  near(a.pathNoiseTemperatureK, 290 * (1 - 10 ** -0.3));
  near(a.systemTemperatureK, a.pathNoiseTemperatureK + 100 + 290 * (10 ** 0.3 - 1));
  near(a.cnLinear, a.receivedPowerW / a.noiseW);
  const c = e.calculate("link-budget", { linkMode: "course-ft", uplink: leg, downlink: leg });
  assert.ok(c.results.some((r) => r.key === "exactCnDb"));
  assert.throws(() =>
    e.calculate("link-budget", {
      linkMode: "course-ft",
      uplink: leg,
      downlink: { ...leg, bandwidthHz: 2e6 }
    })
  );
});
test("composite at low C/N and dominant-noise limiting section", () => {
  const c = e.compositeCN({ uplinkCnDb: 0, downlinkCnDb: 0 });
  near(c.exactLinear, 1 / 3);
  near(c.approximateLinear, 0.5);
  const d = e.combineCNo({ uplinkCNoDbHz: 50, downlinkCNoDbHz: 100 });
  assert.ok(d.compositeCNoDbHz < 50 && d.compositeCNoDbHz > 49.99);
  near(e.combineEbNo({ uplinkEbNoDb: 10, downlinkEbNoDb: 10 }).compositeEbNoDb, 6.98970004);
});
test("Doppler receding sign, engineering precision and invalid speed", () => {
  const a = e.dopplerDelay({ frequencyHz: 10e9, radialVelocityMps: 7500, distanceM: 3e8 });
  near(a.dopplerHz, -250e3);
  near(a.oneWayDelayS, 1);
  near(a.receivedFrequencyHz, 10e9 - 250e3);
  near(e.propagationDelay({ distanceM: 299792458 }, "engineering").oneWayDelayS, 1);
  assert.throws(() => e.dopplerDelay({ frequencyHz: 10e9, radialVelocityMps: 3e8 }));
});
test("SCPC guard allocations, fractional count and empty capacity", () => {
  near(
    e.scpcCapacity({ transponderBandwidthHz: 54e6, channelSpacingHz: 60e3, guardBandwidthHz: 15e3 })
      .channels,
    720
  );
  const a = e.scpcCapacity({ transponderBandwidthHz: 100, channelSpacingHz: 30 });
  near(a.channels, 3);
  near(a.unusedBandwidthHz, 10);
  near(e.scpcCapacity({ transponderBandwidthHz: 10, channelSpacingHz: 30 }).channels, 0);
  assert.throws(() => e.scpcCapacity({ transponderBandwidthHz: 54e6, channelSpacingHz: 0 }));
});
test("TDMA fixed overhead infeasibility and actual terminal efficiency", () => {
  const v = {
    bitRate: 1e6,
    frameDurationS: 0.01,
    referenceStations: 2,
    trafficTerminals: 3,
    referenceBits: 500,
    preambleBits: 100,
    guardBits: 50,
    targetEfficiency: 0.99
  };
  const a = e.tdma(v);
  assert.equal(a.targetFeasible, false);
  assert.equal(a.maxTerminals, 0);
  near(a.efficiency, 1 - (1100 + 450) / 10000);
  assert.ok(e.tdma({ ...v, trafficTerminals: 2 }).efficiency > a.efficiency);
  assert.throws(() => e.tdma({ ...v, trafficTerminals: 3.5 }));
  assert.throws(() => e.tdma({ ...v, targetEfficiency: 1 }));
});
test("adapter smoke tests across every calculator and submode", () => {
  const examples = [
    ["orbit", { altitudeM: 800e3 }],
    ["orbit", { orbitMode: "elliptical", apogeeRadiusM: 7600e3, perigeeRadiusM: 7200e3 }],
    ["look-angles", { latitudeDeg: 30, longitudeDeg: 31, satelliteLongitudeDeg: 26 }],
    ["power-lifetime", { requiredPowerW: 5000, degradationFraction: 0.25 }],
    ["rf-path", { frequencyHz: 6e9, distanceM: 1e4, powerW: 10 }],
    ["noise-gt", { temperatureK: 300.15, bandwidthHz: 30e6, gainDb: 44 }],
    ["noise-gt", { noiseMode: "nf", noiseFigureDb: 3 }],
    ["noise-gt", { noiseMode: "passive", lossDb: 2 }],
    [
      "noise-gt",
      { noiseMode: "cascade", stages: [{ gainLinear: 10, equivalentTemperatureK: 100 }] }
    ],
    [
      "noise-gt",
      { noiseMode: "amplifier", temperatureK: 300.15, bandwidthHz: 2e6, amplifierGain: 20 }
    ],
    ["noise-gt", { noiseMode: "gt", gainDb: 44, temperatureK: 300.15 }],
    [
      "link-budget",
      {
        uplinkEirpDbw: 50,
        uplinkGtDbK: 10,
        uplinkLossDb: 200,
        downlinkEirpDbw: 45,
        downlinkGtDbK: 20,
        downlinkLossDb: 205,
        bandwidthHz: 1e6,
        bitRate: 1e6
      }
    ],
    ["doppler-delay", { frequencyHz: 10e9, radialVelocityMps: 7500, distanceM: 36e6 }],
    ["multiple-access", { transponderBandwidthHz: 54e6, channelSpacingHz: 60e3 }]
  ];
  for (const [slug, values] of examples) {
    const c = e.calculate(slug, values);
    assert.ok(c.results.length, slug);
    assert.ok(c.results.every((r) => Number.isFinite(r.value) && r.key && r.interpretation));
    assert.ok(c.steps.every((s) => s.title && s.formula && s.interpretation));
    assert.doesNotThrow(() => JSON.stringify(c));
  }
});
test("three numeric power adapter presets", () => {
  for (const [degradationFraction, expected] of [
    [0, 5000],
    [0.1, 5000 / 0.9],
    [0.25, 5000 / 0.75]
  ]) {
    const c = e.calculate("power-lifetime", { requiredPowerW: 5000, degradationFraction });
    near(c.results.find((r) => r.key === "requiredBolPowerW").value, expected);
  }
});
test("three numeric look-angle adapter directions", () => {
  for (const [satelliteLongitudeDeg, key, expected] of [
    [0, "elevationDeg", 90],
    [20, "azimuthDeg", 90],
    [-20, "azimuthDeg", 270]
  ]) {
    const c = e.calculate("look-angles", {
      latitudeDeg: 0,
      longitudeDeg: 0,
      satelliteLongitudeDeg
    });
    near(c.results.find((r) => r.key === key).value, expected);
  }
});
test("three numeric Doppler adapter directions", () => {
  for (const [radialVelocityMps, expected] of [
    [0, 0],
    [7500, -250000],
    [-7500, 250000]
  ]) {
    const c = e.calculate("doppler-delay", {
      frequencyHz: 1e10,
      radialVelocityMps,
      uplinkDistanceM: 36e6,
      downlinkDistanceM: 36e6
    });
    near(c.results.find((r) => r.key === "dopplerHz").value, expected);
    near(c.results.find((r) => r.key === "oneWayDelayS").value, 0.24);
  }
});
test("reviewed linear FT path loss matches explicit dB representation", () => {
  const v = {
    frequencyHz: 6e9,
    distanceM: 36e6,
    powerW: 10,
    transmitGainDb: 40,
    receiveGainDb: 30,
    antennaTemperatureK: 100,
    noiseFigureDb: 3,
    bandwidthHz: 1e6
  };
  const a = e.courseFtLink({ ...v, pathLossLinear: 2 }),
    b = e.courseFtLink({ ...v, pathLossDb: 10 * Math.log10(2) });
  near(a.receivedPowerW, b.receivedPowerW, 1e-30);
  near(a.systemTemperatureK, b.systemTemperatureK);
  assert.throws(() => e.calculate("link-budget", { linkMode: "course-ft" }), RangeError);
});
test("selected access mode ignores unrelated hidden fields", () => {
  const c = e.calculate("multiple-access", {
    accessMode: "scpc",
    transponderBandwidthHz: 54e6,
    channelSpacingHz: 60e3,
    bitRate: "",
    frameDurationS: ""
  });
  near(c.results.find((r) => r.key === "channels").value, 900);
});
test("annual solar model requires explicit selection and dish beam follows course convention", () => {
  near(
    e.solarPower({
      requiredPowerW: 5000,
      degradationFraction: 0.25,
      degradationPerYear: 0.05,
      years: 10
    }).retention,
    0.75
  );
  near(
    e.solarPower({
      powerMode: "annual",
      degradationFraction: 0.25,
      degradationPerYear: 0.05,
      years: 10
    }).retention,
    0.95 ** 10
  );
  const a = e.antenna({ frequencyHz: 1e10, diameterM: 2, efficiency: 0.7 });
  near(a.beamwidthDeg, 1.125);
  near((a.idealGainLinear * a.effectiveApertureM2) / a.physicalApertureM2, a.gainLinear);
});
test("displayed formulas render with KaTeX and dependent substitutions are explicit", () => {
  const cases = [
    ["orbit", { altitudeM: 800e3 }],
    ["orbit", { orbitMode: "vis-viva", radiusM: 7e6, semiMajorAxisM: 8e6 }],
    ["antenna", { frequencyHz: 1e10, diameterM: 2, efficiency: 0.7 }],
    [
      "noise-gt",
      { noiseMode: "cascade", stages: [{ gainLinear: 10, equivalentTemperatureK: 100 }] }
    ],
    [
      "multiple-access",
      {
        accessMode: "tdma",
        bitRate: 120e6,
        frameDurationS: 0.002,
        referenceStations: 2,
        trafficTerminals: 80,
        referenceBits: 560,
        preambleBits: 280,
        guardBits: 128,
        targetEfficiency: 0.9,
        convention: "final-2026"
      }
    ]
  ];
  for (const [slug, v] of cases)
    for (const step of e.calculate(slug, v).steps)
      assert.doesNotThrow(() =>
        katex.renderToString(step.formula, { throwOnError: true, strict: "error" })
      );
  const c = e.calculate("orbit", { altitudeM: 800e3 });
  assert.ok(c.steps.find((s) => s.title === "Orbital speed").substitution.includes("7171000"));
  const ft = e.calculate("link-budget", {
    linkMode: "course-ft",
    uplink: {
      frequencyHz: 14e9,
      distanceM: 38e6,
      powerW: 100,
      transmitGainDb: 40,
      receiveGainDb: 25,
      pathLossDb: 1,
      antennaTemperatureK: 100,
      pathTemperatureK: 270,
      noiseFigureDb: 2,
      bandwidthHz: 30e6
    },
    downlink: {
      frequencyHz: 12e9,
      distanceM: 38e6,
      powerW: 30,
      transmitGainDb: 40,
      receiveGainDb: 44,
      pathLossDb: 1,
      antennaTemperatureK: 100,
      pathTemperatureK: 270,
      noiseFigureDb: 2,
      bandwidthHz: 30e6
    }
  });
  for (const title of ["Finite FT linear composite C/N", "Approximate linear composite C/N"])
    assert.match(ft.steps.find((step) => step.title === title).formula, /\\frac/);
});
test("three dish, path and noise adapter examples retain physical scaling", () => {
  for (const factor of [1, 2, 4]) {
    const a = e.calculate("antenna", { frequencyHz: 10e9 * factor, diameterM: 2, efficiency: 0.7 });
    near(a.results.find((r) => r.key === "wavelengthM").value, 0.03 / factor);
    const p = e.calculate("rf-path", { frequencyHz: 6e9, distanceM: 10e3 * factor, powerW: 10 });
    near(
      p.results.find((r) => r.key === "fsplDb").value,
      128.004797193721 + 20 * Math.log10(factor),
      0.00001
    );
    const n = e.calculate("noise-gt", {
      temperatureK: 300.15,
      bandwidthHz: 30e6 * factor,
      gainDb: 44
    });
    near(n.results.find((r) => r.key === "noiseW").value, 1.242621e-13 * factor, 1e-25);
  }
});
test("calculation never mutates its supplied state", () => {
  const v = {
    noiseMode: "cascade",
    stages: [
      { gainLinear: 10, equivalentTemperatureK: 100 },
      { gainLinear: 20, equivalentTemperatureK: 200 }
    ]
  };
  const before = JSON.stringify(v);
  e.calculate("noise-gt", v);
  assert.equal(JSON.stringify(v), before);
});
