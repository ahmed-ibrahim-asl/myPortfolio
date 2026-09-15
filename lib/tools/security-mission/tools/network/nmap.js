import { verificationFor } from "../../verification-helpers.js";

// Timing (-T0..-T5) and verbosity (-v/-vv) are safe to offer on every nmap action, including
// host discovery, so they're appended to every rule list below.
const TIMING_AND_VERBOSITY = [
  { flag: "-T", valuePath: "options.nmapTiming", joinFlag: true, omitWhenEmpty: true },
  { rawFlagFromValue: true, valuePath: "options.nmapVerbosity", omitWhenEmpty: true },
];

const PORTS_AND_OUTPUT = [
  { flag: "-p", valuePath: "options.nmapPorts", omitWhenEmpty: true },
  { flag: "-oN", valuePath: "options.nmapOutputFile", omitWhenEmpty: true },
];

const ACTION_RULES = {
  "nmap-host-discovery": [...TIMING_AND_VERBOSITY],
  "nmap-tcp-scan": [
    { rawFlagFromValue: true, valuePath: "options.nmapScanType", omitWhenEmpty: true },
    ...PORTS_AND_OUTPUT,
    ...TIMING_AND_VERBOSITY,
  ],
  "nmap-udp-scan": [...PORTS_AND_OUTPUT, ...TIMING_AND_VERBOSITY],
  "nmap-service-enumeration": [
    ...PORTS_AND_OUTPUT,
    { flag: "--version-intensity", valuePath: "options.nmapVersionIntensity", omitWhenEmpty: true },
    ...TIMING_AND_VERBOSITY,
  ],
  "nmap-nse-scan": [
    ...PORTS_AND_OUTPUT,
    { flag: "--script=", valuePath: "options.nmapScript", joinFlag: true, omitWhenEmpty: true },
    ...TIMING_AND_VERBOSITY,
  ],
};

const FIXED_TOKENS = {
  "nmap-host-discovery": [{ type: "flag", value: "-sn" }],
  "nmap-udp-scan": [{ type: "flag", value: "-sU" }],
  "nmap-service-enumeration": [{ type: "flag", value: "-sV" }],
  "nmap-nse-scan": [{ type: "flag", value: "-sC" }],
};

export const NMAP_ACTIONS = Object.freeze([
  "nmap-host-discovery", "nmap-tcp-scan", "nmap-udp-scan",
  "nmap-service-enumeration", "nmap-nse-scan"
].map(id => ({
  id,
  toolId: "nmap",
  title: id.replace(/-/g, ' '),
  objectiveIds: ["host-discovery-port-scanning"],
  risk: "low",
  executable: { linux: "nmap", windows: "nmap.exe", macos: "nmap" },
  fixedTokens: FIXED_TOKENS[id] ?? [],
  argumentRules: [
    ...(ACTION_RULES[id] ?? []),
    { positional: true, valuePath: "target.network" },
  ],
  verification: verificationFor(id),
})));
