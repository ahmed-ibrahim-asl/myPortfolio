export const CONTROLS = Object.freeze([
  {
    "id": "network-target-host",
    "step": "target",
    "section": "Target Configuration",
    "configKey": "target.host",
    "level": "guided",
    "label": "Target Host / IP",
    "technicalTerm": "Destination IP/Hostname",
    "controlType": "host",
    "defaultValue": "192.168.1.1",
    "shortHelp": "Target IP or hostname for network operations",
    "explanation": {
      "what": "Target IP address or hostname",
      "why": "Specifies destination for network scanning",
      "useWhen": "Executing network discovery",
      "avoidWhen": "No target defined",
      "tradeoff": "None",
      "codeEffect": "Appends target host argument"
    },
    "validation": {},
    "actionIds": [
      "nmap-host-discovery",
      "nmap-tcp-scan",
      "ping-host",
      "traceroute-host",
      "whois-domain",
      "dig-records"
    ]
  },
  {
    "id": "network-nmap-scan-type",
    "step": "configure",
    "section": "Command options",
    "configKey": "options.nmapScanType",
    "valuePath": "options.nmapScanType",
    "level": "advanced",
    "label": "Scan type",
    "technicalTerm": "TCP scan technique",
    "controlType": "select",
    "defaultValue": "",
    "options": [
      { "label": "Default (let nmap choose)", "value": "" },
      { "label": "SYN scan - stealthy, needs raw-socket privileges (-sS)", "value": "-sS" },
      { "label": "Connect scan - full handshake, no special privileges (-sT)", "value": "-sT" },
      { "label": "ACK scan - firewall/filter mapping only (-sA)", "value": "-sA" },
      { "label": "FIN scan - firewall-evasion probe (-sF)", "value": "-sF" },
      { "label": "Null scan - firewall-evasion probe, no flags set (-sN)", "value": "-sN" },
      { "label": "Xmas scan - firewall-evasion probe, FIN/PSH/URG set (-sX)", "value": "-sX" }
    ],
    "shortHelp": "How nmap probes each TCP port",
    "explanation": {
      "what": "Selects which TCP scan technique nmap uses to probe ports.",
      "why": "Different techniques trade off speed, stealth, and required privileges - SYN needs raw sockets, Connect does not, and the FIN/Null/Xmas variants exist specifically to slip past simple firewalls.",
      "useWhen": "Use SYN when you can run as root/admin; use Connect otherwise; use ACK/FIN/Null/Xmas when mapping filtering behavior on an authorized target.",
      "avoidWhen": "Leave on default when a plain, unambiguous scan is all the objective needs.",
      "tradeoff": "Evasion-style scans (FIN/Null/Xmas) are also the least reliable at telling open from filtered on modern stacks.",
      "codeEffect": "Inserts the chosen flag directly (e.g. -sS) with no separate value."
    },
    "validation": {},
    "actionIds": ["nmap-tcp-scan"]
  },
  {
    "id": "network-nmap-timing",
    "step": "configure",
    "section": "Command options",
    "configKey": "options.nmapTiming",
    "valuePath": "options.nmapTiming",
    "level": "customize",
    "label": "Timing template",
    "technicalTerm": "Timing template 0-5",
    "controlType": "select",
    "defaultValue": "",
    "options": [
      { "label": "Default (nmap picks)", "value": "" },
      { "label": "T0 - Paranoid (max stealth, very slow)", "value": "0" },
      { "label": "T1 - Sneaky", "value": "1" },
      { "label": "T2 - Polite (lighter load on the target)", "value": "2" },
      { "label": "T3 - Normal (nmap's own default)", "value": "3" },
      { "label": "T4 - Aggressive (common for CTF/lab speed)", "value": "4" },
      { "label": "T5 - Insane (fastest, most likely to miss or alarm)", "value": "5" }
    ],
    "shortHelp": "How fast nmap sends probes",
    "explanation": {
      "what": "Selects nmap's timing template, which bundles together delay and parallelism settings.",
      "why": "Slower templates are quieter and more reliable on unstable links; faster templates finish sooner at the cost of subtlety and accuracy.",
      "useWhen": "Use T4 for routine lab/CTF scanning; drop to T2 or lower against sensitive or rate-limited targets.",
      "avoidWhen": "Avoid T5 unless the objective specifically calls for maximum speed and false negatives are acceptable.",
      "tradeoff": "Faster templates increase the chance of dropped probes and inaccurate results, and are easier for an IDS to notice.",
      "codeEffect": "Joins directly onto -T with no space, e.g. -T4."
    },
    "validation": {},
    "actionIds": []
  },
  {
    "id": "network-nmap-verbosity",
    "step": "configure",
    "section": "Command options",
    "configKey": "options.nmapVerbosity",
    "valuePath": "options.nmapVerbosity",
    "level": "customize",
    "label": "Verbosity",
    "technicalTerm": "Output verbosity level",
    "controlType": "select",
    "defaultValue": "",
    "options": [
      { "label": "Default", "value": "" },
      { "label": "Verbose (-v)", "value": "-v" },
      { "label": "Very verbose (-vv)", "value": "-vv" }
    ],
    "shortHelp": "How much nmap prints while it runs",
    "explanation": {
      "what": "Raises nmap's own console verbosity while it scans.",
      "why": "Higher verbosity shows progress and intermediate findings (open ports as they're found) instead of only the final report.",
      "useWhen": "Use verbose output on longer scans so you can see progress without waiting for completion.",
      "avoidWhen": "Leave on default for short scans where the final report is all that matters.",
      "tradeoff": "More console noise, no change to what nmap actually probes.",
      "codeEffect": "Inserts the chosen flag directly (e.g. -v) with no separate value."
    },
    "validation": {},
    "actionIds": []
  }
]);
