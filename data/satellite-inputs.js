const frequency = [
  ["Hz", 1],
  ["kHz", 1e3],
  ["MHz", 1e6],
  ["GHz", 1e9]
];
const distance = [
  ["m", 1],
  ["km", 1e3]
];
const bandwidth = [
  ["Hz", 1],
  ["kHz", 1e3],
  ["MHz", 1e6]
];
const rate = [
  ["bit/s", 1],
  ["kbit/s", 1e3],
  ["Mbit/s", 1e6]
];
const field = (key, label, value, unit = "", options) => ({ key, label, value, unit, options });
const quantity = (key, label, value, units, initialUnit) => ({
  ...field(key, label, value),
  units,
  initialUnit
});
const select = (key, label, value, options) => field(key, label, value, "", options);
export const satelliteInputs = {
  "frequency-bands": {
    fields: [quantity("frequencyHz", "Carrier frequency", 6e9, frequency, "GHz")],
    presets: [
      { name: "C-band / 6 GHz", values: { frequencyHz: 6e9 } },
      { name: "Ku-band / 12 GHz", values: { frequencyHz: 12e9 } }
    ]
  },
  orbit: {
    fields: [
      select("orbitMode", "Orbit calculation", "circular", [
        ["circular", "Circular orbit"],
        ["elliptical", "Elliptical orbit"],
        ["geo", "GEO altitude"],
        ["coverage", "Coverage"]
      ]),
      quantity("altitudeM", "Altitude above surface", 800e3, distance, "km"),
      quantity("earthRadiusM", "Earth radius", 6371e3, distance, "km"),
      field("mu", "Earth gravitational parameter", 3.986e14, "m³/s²"),
      quantity("apogeeRadiusM", "Apogee radius from Earth centre", 7600e3, distance, "km"),
      quantity("perigeeRadiusM", "Perigee radius from Earth centre", 7200e3, distance, "km"),
      field("periodS", "Rotation period", 86164.0905, "s"),
      field("minimumElevationDeg", "Minimum elevation", 0, "°")
    ],
    presets: [
      { name: "800 km LEO", values: { orbitMode: "circular", altitudeM: 800e3 } },
      {
        name: "Elliptical: 7600 / 7200 km",
        values: { orbitMode: "elliptical", apogeeRadiusM: 7600e3, perigeeRadiusM: 7200e3 }
      },
      { name: "GEO sidereal orbit", values: { orbitMode: "geo", periodS: 86164.0905 } },
      {
        name: "LEO coverage",
        values: { orbitMode: "coverage", altitudeM: 800e3, minimumElevationDeg: 10 }
      }
    ]
  },
  "look-angles": {
    fields: [
      field("latitudeDeg", "Station latitude (north positive)", 30.0444, "°"),
      field("longitudeDeg", "Station longitude (east positive)", 31.2357, "°"),
      field("satelliteLongitudeDeg", "GEO satellite longitude (east positive)", 26, "°"),
      quantity("earthRadiusM", "Earth radius", 6371e3, distance, "km"),
      quantity("satelliteRadiusM", "Satellite orbital radius", 42164e3, distance, "km")
    ],
    presets: [
      {
        name: "Cairo → 26° E",
        values: { latitudeDeg: 30.0444, longitudeDeg: 31.2357, satelliteLongitudeDeg: 26 }
      },
      {
        name: "Directly below satellite",
        values: { latitudeDeg: 0, longitudeDeg: 26, satelliteLongitudeDeg: 26 }
      },
      {
        name: "Below the horizon",
        values: { latitudeDeg: 30, longitudeDeg: 0, satelliteLongitudeDeg: 170 }
      }
    ]
  },
  "power-lifetime": {
    fields: [
      quantity(
        "requiredPowerW",
        "Required power at end of life",
        5000,
        [
          ["W", 1],
          ["kW", 1e3]
        ],
        "kW"
      ),
      field("degradationFraction", "Total power degradation", 0.25, "fraction"),
      field("years", "Mission lifetime", 15, "years"),
      field("degradationPerYear", "Annual degradation (extension)", 0.02, "fraction/year"),
      field("solarFluxWm2", "Solar irradiance", 1361, "W/m²"),
      field("efficiency", "Solar cell efficiency", 0.3, "fraction"),
      field("areaM2", "Solar array area", 20, "m²")
    ],
    presets: [
      {
        name: "worst case 25%",
        values: { degradationFraction: 0.25, requiredPowerW: 5000 }
      },
      { name: "best case 10%", values: { degradationFraction: 0.1, requiredPowerW: 5000 } }
    ]
  },
  antenna: {
    fields: [
      quantity("frequencyHz", "Carrier frequency", 10e9, frequency, "GHz"),
      field("diameterM", "Dish diameter", 2, "m"),
      field("efficiency", "Aperture efficiency", 0.7, "fraction"),
      field("beamwidthFactor", "Beamwidth approximation factor", 75, "degrees")
    ],
    presets: [
      {
        name: "10 GHz / 2 m / 70%",
        values: { frequencyHz: 10e9, diameterM: 2, efficiency: 0.7 }
      },
      {
        name: "12 GHz receive dish",
        values: { frequencyHz: 12e9, diameterM: 0.9, efficiency: 0.6 }
      }
    ]
  },
  "rf-path": {
    fields: [
      select("rfMode", "RF calculation", "path", [
        ["path", "Free-space path / Friis"],
        ["pfd-receive", "Received power from flux and aperture"]
      ]),
      field("fluxDensityWm2", "Incident power flux density", 1e-8, "W/m²"),
      field("effectiveApertureM2", "Antenna effective aperture", 2, "m²"),
      quantity("frequencyHz", "Carrier frequency", 6e9, frequency, "GHz"),
      quantity("distanceM", "Path distance", 10000, distance, "km"),
      quantity(
        "powerW",
        "Transmitter power",
        10,
        [
          ["W", 1],
          ["kW", 1e3]
        ],
        "W"
      ),
      field("transmitGainDb", "Transmit antenna gain", 30, "dBi"),
      field("receiveGainDb", "Receive antenna gain", 30, "dBi"),
      field("transmitLossDb", "Transmit feeder loss", 0, "dB"),
      field("pathLossDb", "Additional path loss", 0, "dB"),
      field("receiveLossDb", "Receive feeder loss", 0, "dB")
    ],
    presets: [
      {
        name: "10 km / 6 GHz",
        values: { rfMode: "path", frequencyHz: 6e9, distanceM: 10000 }
      },
      {
        name: "PFD receive: 10 nW/m² × 2 m²",
        values: {
          rfMode: "pfd-receive",
          fluxDensityWm2: 1e-8,
          effectiveApertureM2: 2,
          receiveLossDb: 0
        }
      },
      {
        name: "GEO downlink / 12 GHz",
        values: {
          rfMode: "path",
          frequencyHz: 12e9,
          distanceM: 38000e3,
          powerW: 100,
          transmitGainDb: 35,
          receiveGainDb: 44
        }
      }
    ]
  },
  "noise-gt": {
    fields: [
      select("noiseMode", "Noise calculation", "thermal", [
        ["thermal", "Thermal noise and G/T"],
        ["nf", "Noise figure and temperature"],
        ["passive", "Passive attenuator"],
        ["cascade", "Cascaded receiver"],
        ["amplifier", "Amplifier output noise"],
        ["gt", "Receiver G/T"]
      ]),
      field("temperatureK", "Input / system noise temperature", 300.15, "K"),
      quantity("bandwidthHz", "Noise bandwidth", 30e6, bandwidth, "MHz"),
      field("gainDb", "Receive antenna gain", 44, "dBi"),
      field("noiseFigureDb", "Device noise figure", 2, "dB"),
      field("referenceTemperatureK", "Noise figure reference temperature", 290, "K"),
      field("addedTemperatureK", "Device equivalent added temperature", 300.15, "K"),
      field("amplifierGain", "Amplifier power gain", 20, "linear"),
      field("lossDb", "Passive attenuation", 2, "dB"),
      field("physicalTemperatureK", "Attenuator physical temperature", 290, "K")
    ],
    presets: [
      {
        name: "27°C / 30 MHz / 44 dBi",
        values: { noiseMode: "thermal", temperatureK: 300.15, bandwidthHz: 30e6, gainDb: 44 }
      },
      {
        name: "noiseless LNA",
        values: {
          noiseMode: "amplifier",
          temperatureK: 300.15,
          bandwidthHz: 2e6,
          amplifierGain: 20,
          addedTemperatureK: 0
        }
      },
      {
        name: "added noise LNA",
        values: {
          noiseMode: "amplifier",
          temperatureK: 300.15,
          bandwidthHz: 2e6,
          amplifierGain: 20,
          addedTemperatureK: 300.15
        }
      },
      {
        name: "Low noise first stage",
        values: {
          noiseMode: "cascade",
          stages: [
            { gainDb: 20, noiseFigureDb: 1 },
            { gainDb: 10, noiseFigureDb: 6 }
          ]
        }
      }
    ]
  },
  "link-budget": {
    fields: [
      select("linkMode", "Link model", "standard", [
        ["standard", "Uplink / downlink C/N₀"],
        ["basic", "Received power"],
        ["course-ft", "Frequency-translation link"]
      ]),
      field("uplinkEirpDbw", "Ground transmitter EIRP", 60, "dBW"),
      field("uplinkGtDbK", "Satellite receiver G/T", 5, "dB/K"),
      field("uplinkLossDb", "Total uplink loss", 205, "dB"),
      field("downlinkEirpDbw", "Satellite transmitter EIRP", 50, "dBW"),
      field("downlinkGtDbK", "Ground receiver G/T", 19.23, "dB/K"),
      field("downlinkLossDb", "Total downlink loss", 205, "dB"),
      quantity("bandwidthHz", "Common noise bandwidth", 30e6, bandwidth, "MHz"),
      quantity("bitRate", "Information bit rate", 10e6, rate, "Mbit/s"),
      field("requiredEbNoDb", "Required Eᵦ/N₀", 10, "dB"),
      quantity("frequencyHz", "Carrier frequency", 12e9, frequency, "GHz"),
      quantity("distanceM", "Path distance", 38000e3, distance, "km"),
      field("powerW", "Transmit power", 10, "W"),
      field("transmitGainDb", "Transmit gain", 38, "dBi"),
      field("receiveGainDb", "Receive gain", 42, "dBi"),
      field("transmitLossDb", "Transmit feeder loss", 1, "dB"),
      field("pathLossDb", "Additional path loss", 2.5, "dB"),
      field("receiveLossDb", "Receive feeder loss", 1, "dB")
    ],
    presets: [
      {
        name: "GEO link example",
        values: {
          linkMode: "standard",
          uplinkEirpDbw: 60,
          uplinkGtDbK: 5,
          uplinkLossDb: 205,
          downlinkEirpDbw: 50,
          downlinkGtDbK: 19.23,
          downlinkLossDb: 205
        }
      },
      {
        name: "Receiver power waterfall",
        values: {
          linkMode: "basic",
          powerW: 10,
          transmitGainDb: 38,
          receiveGainDb: 42,
          transmitLossDb: 1,
          pathLossDb: 2.5,
          receiveLossDb: 1
        }
      }
    ]
  },
  "doppler-delay": {
    fields: [
      quantity("frequencyHz", "Carrier frequency", 2e9, frequency, "GHz"),
      field("radialVelocityMps", "Radial velocity (receding positive)", 7000, "m/s"),
      quantity("uplinkDistanceM", "Uplink distance", 35786e3, distance, "km"),
      quantity("downlinkDistanceM", "Downlink distance", 35786e3, distance, "km")
    ],
    presets: [
      { name: "LEO approaching", values: { radialVelocityMps: -7000, frequencyHz: 2e9 } },
      { name: "LEO receding", values: { radialVelocityMps: 7000, frequencyHz: 2e9 } },
      {
        name: "GEO propagation delay",
        values: { radialVelocityMps: 0, uplinkDistanceM: 35786e3, downlinkDistanceM: 35786e3 }
      }
    ]
  },
  "multiple-access": {
    fields: [
      select("accessMode", "Multiple access calculation", "scpc", [
        ["scpc", "SCPC capacity"],
        ["tdma", "TDMA frame planner"],
        ["fdma", "FDMA slots"],
        ["cdma", "CDMA codes"]
      ]),
      quantity("transponderBandwidthHz", "Transponder bandwidth", 54e6, bandwidth, "MHz"),
      quantity("channelSpacingHz", "SCPC channel spacing", 60e3, bandwidth, "kHz"),
      quantity("guardBandwidthHz", "Additional edge guard bandwidth", 0, bandwidth, "kHz"),
      quantity("bitRate", "TDMA bit rate", 125e6, rate, "Mbit/s"),
      quantity(
        "frameDurationS",
        "Frame duration",
        0.005,
        [
          ["s", 1],
          ["ms", 1e-3]
        ],
        "ms"
      ),
      field("referenceStations", "Reference stations", 10, "integer"),
      field("trafficTerminals", "Traffic terminals", 25, "integer"),
      field("referenceBits", "Bits per reference burst", 575, "bits"),
      field("preambleBits", "Traffic preamble", 565, "bits"),
      field("guardBits", "Bits per guard interval", 130, "bits"),
      field("targetEfficiency", "Target efficiency", 0.9, "fraction"),
      quantity("voiceBitRate", "PCM voice rate", 64000, rate, "kbit/s"),
      select("convention", "Guard interval convention", "lecture", [
        ["lecture", "Reference + traffic guards"],
        ["final-2026", "Traffic guards only"]
      ])
    ],
    presets: [
      {
        name: "54 MHz / 60 kHz SCPC",
        values: { accessMode: "scpc", transponderBandwidthHz: 54e6, channelSpacingHz: 60000 }
      },
      {
        name: "INTELSAT TDMA",
        values: {
          accessMode: "tdma",
          convention: "final-2026",
          bitRate: 125e6,
          frameDurationS: 0.005,
          referenceStations: 10,
          trafficTerminals: 25
        }
      },
      {
        name: "Lecture: 120 Mbit/s / 2 ms",
        values: {
          accessMode: "tdma",
          convention: "lecture",
          bitRate: 120e6,
          frameDurationS: 0.002,
          referenceStations: 2,
          trafficTerminals: 20
        }
      }
    ]
  }
};
satelliteInputs.orbit.fields[0].options.push(["vis-viva", "Instantaneous speed: vis-viva"]);
satelliteInputs.orbit.fields.push(
  quantity("radiusM", "Instantaneous orbital radius from Earth centre", 7200e3, distance, "km"),
  quantity("semiMajorAxisM", "Orbit semi-major axis", 7400e3, distance, "km")
);
satelliteInputs.orbit.presets.push({
  name: "Vis-viva: perigee speed",
  values: { orbitMode: "vis-viva", radiusM: 7200e3, semiMajorAxisM: 7400e3 }
});
satelliteInputs["look-angles"].fields.push(
  quantity("stationAltitudeM", "Station altitude above sea level", 0, distance, "m")
);
satelliteInputs["power-lifetime"].fields.unshift(
  select("powerMode", "Lifetime degradation model", "total", [
    ["total", "Core: total end-of-life degradation"],
    ["annual", "Extension: compounded annual degradation"]
  ])
);
satelliteInputs["power-lifetime"].fields.find((f) => f.key === "degradationPerYear").value = 0;
satelliteInputs["power-lifetime"].presets.forEach((p) => {
  p.values.powerMode = "total";
});
satelliteInputs["power-lifetime"].presets.push({
  name: "Annual extension: 2% / year for 15 years",
  values: {
    powerMode: "annual",
    degradationPerYear: 0.02,
    years: 15,
    solarFluxWm2: 1361,
    efficiency: 0.3,
    areaM2: 20,
    requiredPowerW: 5000
  }
});
satelliteInputs["noise-gt"].fields[0].options.splice(1, 0, ["density", "Noise spectral density"]);
satelliteInputs["noise-gt"].presets.push(
  { name: "Reference density: 290 K", values: { noiseMode: "density", temperatureK: 290 } },
  {
    name: "NF: 3 dB at 290 K",
    values: { noiseMode: "nf", noiseFigureDb: 3, referenceTemperatureK: 290 }
  },
  {
    name: "Passive: 3 dB feeder at 290 K",
    values: {
      noiseMode: "passive",
      lossDb: 3,
      physicalTemperatureK: 290,
      referenceTemperatureK: 290
    }
  },
  {
    name: "Receiver G/T: 44 dBi / 300.15 K",
    values: { noiseMode: "gt", gainDb: 44, temperatureK: 300.15 }
  }
);
const ftLeg = (uplink) => ({
  frequencyHz: uplink ? 14e9 : 12e9,
  distanceM: 38e6,
  powerW: uplink ? 100 : 30,
  transmitGainDb: 40,
  receiveGainDb: uplink ? 25 : 44,
  pathLossDb: 1,
  antennaTemperatureK: 100,
  pathTemperatureK: 270,
  noiseFigureDb: 2,
  bandwidthHz: 30e6
});
satelliteInputs["link-budget"].presets.push({
  name: "Frequency translation: common 30 MHz bandwidth",
  values: { linkMode: "course-ft", uplink: ftLeg(true), downlink: ftLeg(false) }
});
satelliteInputs["multiple-access"].fields[0].options.push(["voice", "PCM voice capacity"]);
satelliteInputs["multiple-access"].fields.push(
  quantity("trafficBitRate", "Actual net traffic bit rate", 120e6, rate, "Mbit/s"),
  field("codeLength", "Ideal Walsh code length (power of two)", 64, "chips"),
  quantity(
    "chipRate",
    "CDMA spreading chip rate",
    4.096e6,
    [
      ["chip/s", 1],
      ["Mchip/s", 1e6]
    ],
    "Mchip/s"
  ),
  quantity("informationBitRate", "CDMA user information bit rate", 64e3, rate, "kbit/s")
);
satelliteInputs["multiple-access"].presets.push(
  {
    name: "FDMA: 75 kHz guarded slots",
    values: {
      accessMode: "fdma",
      transponderBandwidthHz: 54e6,
      channelSpacingHz: 60e3,
      guardBandwidthHz: 15e3
    }
  },
  {
    name: "Ideal Walsh CDMA: length 64",
    values: { accessMode: "cdma", codeLength: 64, chipRate: 4.096e6, informationBitRate: 64e3 }
  },
  {
    name: "PCM: 120 Mbit/s net traffic",
    values: { accessMode: "voice", trafficBitRate: 120e6, voiceBitRate: 64e3 }
  }
);
export function initialValues(slug) {
  const config = satelliteInputs[slug];
  const values = Object.fromEntries((config?.fields ?? []).map((f) => [f.key, f.value]));
  if (slug === "noise-gt")
    values.stages = [
      { gainDb: 20, noiseFigureDb: 1 },
      { gainDb: 10, noiseFigureDb: 6 }
    ];
  if (slug === "link-budget") {
    values.uplink = ftLeg(true);
    values.downlink = ftLeg(false);
  }
  return values;
}
export function visibleFields(slug, values) {
  const fields = satelliteInputs[slug]?.fields ?? [];
  if (slug === "rf-path") {
    const direct = ["fluxDensityWm2", "effectiveApertureM2"];
    return fields.filter((f) =>
      values.rfMode === "pfd-receive"
        ? ["rfMode", ...direct, "receiveLossDb"].includes(f.key)
        : !direct.includes(f.key)
    );
  }
  if (slug === "orbit") {
    const keys = {
      circular: ["altitudeM", "earthRadiusM", "mu", "minimumElevationDeg"],
      elliptical: ["apogeeRadiusM", "perigeeRadiusM", "earthRadiusM", "mu"],
      geo: ["periodS", "earthRadiusM", "mu"],
      coverage: ["altitudeM", "earthRadiusM", "minimumElevationDeg"],
      "vis-viva": ["radiusM", "semiMajorAxisM", "mu"]
    }[values.orbitMode ?? "circular"];
    return fields.filter((f) => f.key === "orbitMode" || keys?.includes(f.key));
  }
  if (slug === "power-lifetime")
    return fields.filter((f) =>
      values.powerMode === "annual"
        ? f.key !== "degradationFraction"
        : !["degradationPerYear", "years"].includes(f.key)
    );
  if (slug === "multiple-access") {
    const keys = {
      scpc: ["transponderBandwidthHz", "channelSpacingHz", "guardBandwidthHz"],
      fdma: ["transponderBandwidthHz", "channelSpacingHz", "guardBandwidthHz"],
      voice: ["trafficBitRate", "voiceBitRate"],
      cdma: ["codeLength", "chipRate", "informationBitRate"],
      tdma: [
        "bitRate",
        "frameDurationS",
        "referenceStations",
        "trafficTerminals",
        "referenceBits",
        "preambleBits",
        "guardBits",
        "targetEfficiency",
        "voiceBitRate",
        "convention"
      ]
    }[values.accessMode ?? "scpc"];
    return fields.filter((f) => f.key === "accessMode" || keys?.includes(f.key));
  }
  if (slug === "link-budget") {
    const basic = [
      "frequencyHz",
      "distanceM",
      "powerW",
      "transmitGainDb",
      "receiveGainDb",
      "transmitLossDb",
      "pathLossDb",
      "receiveLossDb"
    ];
    return fields.filter(
      (f) =>
        f.key === "linkMode" ||
        (values.linkMode === "course-ft"
          ? false
          : values.linkMode === "basic"
            ? basic.includes(f.key)
            : !basic.includes(f.key))
    );
  }
  if (slug === "noise-gt") {
    const keys = {
      thermal: ["temperatureK", "bandwidthHz", "gainDb"],
      density: ["temperatureK"],
      nf: ["noiseFigureDb", "referenceTemperatureK"],
      passive: ["lossDb", "physicalTemperatureK", "referenceTemperatureK"],
      cascade: ["referenceTemperatureK"],
      amplifier: ["temperatureK", "bandwidthHz", "addedTemperatureK", "amplifierGain"],
      gt: ["temperatureK", "gainDb"]
    }[values.noiseMode ?? "thermal"];
    return fields.filter((f) => f.key === "noiseMode" || keys?.includes(f.key));
  }
  return fields;
}
