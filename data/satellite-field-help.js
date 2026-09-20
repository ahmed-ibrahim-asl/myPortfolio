// SI meanings remain unchanged when a display-unit selector changes.
const help = {
  fluxDensityWm2: [
    "Φ",
    "Incident RF power per square metre at the antenna, after path attenuation. Must be positive."
  ],
  effectiveApertureM2: [
    "Aₑ",
    "Antenna effective collecting area, including antenna efficiency but excluding receive feeder loss. Must be positive."
  ],
  frequencyHz: [
    "f",
    "Frequency of the RF carrier. Use the unit selector; internal calculations use Hz."
  ],
  altitudeM: ["h", "Height above the Earth surface, not distance from its centre."],
  earthRadiusM: ["Rₑ", "Spherical Earth radius. The course example uses 6371 km."],
  muKm3S2: ["μ", "Earth gravitational parameter in km³/s²."],
  apogeeRadiusM: [
    "rₐ",
    "Greatest distance from Earth centre; must be at least the perigee radius."
  ],
  perigeeRadiusM: ["rₚ", "Smallest distance from Earth centre; must not lie inside Earth."],
  periodS: ["T", "One complete rotation in seconds. GEO uses the sidereal day, about 86164 s."],
  minimumElevationDeg: ["Elₘᵢₙ", "Lowest permitted angle above the local horizon, from 0° to 90°."],
  radiusM: ["r", "Instantaneous distance from Earth centre, not surface altitude."],
  semiMajorAxisM: ["a", "Half the major axis of the bound orbital ellipse."],
  latitudeDeg: ["φ", "Ground station latitude: north positive, south negative, from −90° to +90°."],
  longitudeDeg: ["λₑ", "Ground station longitude: east positive and west negative."],
  satelliteLongitudeDeg: ["λₛ", "Longitude of the GEO subsatellite point on the equator."],
  satelliteRadiusM: ["rₛ", "Distance from Earth centre to the satellite; GEO is about 42164 km."],
  stationAltitudeM: ["hₑ", "Ground station height above the spherical reference surface."],
  requiredPowerW: ["P_EOL", "Electrical power that must remain available at mission end."],
  degradationFraction: ["d", "Total mission loss as a fraction: 0.25 means 25%, not 25."],
  years: ["t", "Mission duration used only by the annual degradation model."],
  degradationPerYear: [
    "dᵧ",
    "Fraction lost each year, compounded rather than subtracted linearly."
  ],
  solarFluxWm2: ["S☉", "Incident solar power per square metre before conversion losses."],
  efficiency: [
    "η",
    "Useful fraction of the incident power or aperture. Enter a fraction greater than 0 and at most 1."
  ],
  areaM2: ["A", "Active solar-array area, expressed in square metres."],
  diameterM: [
    "D",
    "Dish aperture diameter. Dish formulas assume a diameter large relative to wavelength."
  ],
  beamwidthFactor: [
    "Kθ",
    "Illumination-dependent beamwidth approximation: course 75, common engineering estimate 70."
  ],
  distanceM: ["d", "One propagation path length, not automatically a round-trip distance."],
  powerW: ["Pₜ", "RF transmitter output power before feeder loss and antenna gain."],
  transmitGainDb: [
    "Gₜ",
    "Transmit antenna gain toward the receiver, referenced to isotropic gain."
  ],
  receiveGainDb: [
    "Gᵣ",
    "Receive antenna gain toward the transmitter, referenced to isotropic gain."
  ],
  transmitLossDb: [
    "Lₜ",
    "Positive feeder attenuation before the transmit antenna; subtracted once."
  ],
  pathLossDb: [
    "Lₐ",
    "Positive additional attenuation beyond free-space spreading; do not include FSPL again."
  ],
  receiveLossDb: ["Lᵣ", "Positive receive feeder attenuation; subtracted once from carrier power."],
  temperatureK: [
    "T",
    "Equivalent input or system noise temperature in Kelvin. Never use Celsius directly in kTB."
  ],
  bandwidthHz: ["B", "Equivalent noise bandwidth. Both FT legs must use the same bandwidth."],
  gainDb: ["G", "Receive antenna gain in dBi for G/T; receiver-stage power gains use dB."],
  noiseFigureDb: ["NF", "Noise degradation in dB. Convert to linear factor with 10^(NF/10)."],
  noiseFactor: ["F", "Linear noise factor, at least 1. It is not a value in dB."],
  referenceTemperatureK: [
    "T₀",
    "Reference source temperature for noise figure; conventionally 290 K."
  ],
  addedTemperatureK: [
    "Tₑ",
    "Equivalent device-added input noise temperature; excludes the source temperature."
  ],
  equivalentTemperatureK: ["Tₑ", "Equivalent device-added noise referred to the input."],
  amplifierGain: ["G", "Linear power gain, not an amplitude ratio or a dB value."],
  lossDb: ["L", "Positive passive power attenuation in dB; zero is an ideal lossless device."],
  physicalTemperatureK: [
    "Tₚ",
    "Physical attenuator temperature in Kelvin, used for its thermal emission."
  ],
  antennaTemperatureK: ["Tₐ", "Equivalent antenna noise temperature at the receiver input."],
  pathTemperatureK: ["Tₚ", "Effective physical temperature used for the course path-noise model."],
  uplinkEirpDbw: [
    "EIRPᵤ",
    "Ground transmit power plus antenna gain minus feeder loss, relative to 1 W."
  ],
  uplinkGtDbK: [
    "(G/T)ᵤ",
    "Satellite receive figure of merit at the same reference plane as the uplink budget."
  ],
  uplinkLossDb: [
    "Lᵤ",
    "Total positive uplink attenuation including free-space and additional losses."
  ],
  downlinkEirpDbw: ["EIRP_d", "Satellite radiated equivalent isotropic power, relative to 1 W."],
  downlinkGtDbK: ["(G/T)_d", "Ground receiver figure of merit in dB/K."],
  downlinkLossDb: [
    "L_d",
    "Total positive downlink attenuation including free-space and additional losses."
  ],
  bitRate: [
    "R",
    "Bit rate in bit/s, not noise bandwidth. State the information/coded-rate convention."
  ],
  requiredEbNoDb: [
    "(Eᵦ/N₀)req",
    "Required receiver threshold for the selected modulation, coding and error target."
  ],
  radialVelocityMps: [
    "vᵣ",
    "Line-of-sight relative speed: positive when receding, negative when approaching."
  ],
  uplinkDistanceM: [
    "dᵤ",
    "Ground-to-satellite slant range; altitude is valid only for a directly overhead path."
  ],
  downlinkDistanceM: [
    "d_d",
    "Satellite-to-ground slant range; added to the uplink for one-way relayed delay."
  ],
  transponderBandwidthHz: ["Bₜ", "Available RF bandwidth allocated among complete channels."],
  channelSpacingHz: [
    "B꜀",
    "Bandwidth allocated per channel, including any guard already built into the spacing."
  ],
  guardBandwidthHz: ["Bɢ", "Additional guard allocation per channel, beyond the entered spacing."],
  frameDurationS: [
    "Tꜰ",
    "Time for one complete TDMA frame; convert milliseconds to seconds internally."
  ],
  referenceStations: [
    "nᵣ",
    "Whole number of reference bursts or stations represented in each frame."
  ],
  trafficTerminals: ["nₜ", "Whole number of traffic terminals sharing the TDMA frame."],
  referenceBits: ["bᵣ", "Bits in each reference burst, before any separately counted guard."],
  preambleBits: ["bₚ", "Synchronization and control bits before each traffic payload."],
  guardBits: [
    "bɢ",
    "Bits reserved between bursts. Selected course convention controls reference guards."
  ],
  targetEfficiency: [
    "ηtarget",
    "Required useful frame fraction between 0 and 1, not a percentage value."
  ],
  voiceBitRate: ["R_PCM", "Bit rate per voice channel; conventional PCM example is 64 kbit/s."],
  trafficBitRate: ["Rpayload", "Actual aggregate payload bit rate after frame overhead."],
  codeLength: ["N", "Number of chips in an ideal Walsh code. Must be a power of two."],
  chipRate: ["R꜀", "Spreading chips transmitted per second, not the user information rate."],
  informationBitRate: ["Rᵦ", "User information bits per second before spreading."]
};
export function satelliteFieldHelp(key) {
  if (/^stage-\d+-gain$/.test(key))
    return ["Gᵢ", "Stage power gain in dB; early gain suppresses later input-referred noise."];
  if (/^stage-\d+-nf$/.test(key)) return help.noiseFigureDb;
  return help[key] || help[key.replace(/^(uplink|downlink)-/, "")];
}
