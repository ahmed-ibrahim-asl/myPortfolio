// Per-tool flag descriptions for the command assembly trace. Keyed by toolId, then by the
// exact flag string as it appears in that tool's argumentRules/fixedTokens. The point of
// keying by tool, not just by flag, is that the same letter means different things across
// tools - -c is an SNMP community string in snmpwalk but a packet count in hping3, -w is a
// wordlist in ffuf but a pcap output file in tcpdump - so a global "-c means X" lookup would
// be actively misleading. Only flags that actually appear in the registry are listed; adding
// a new flag to a tool definition without a matching entry here is a silent gap, not an error
// (the trace falls back to its existing "source: <field>" label), so entries can be added
// incrementally rather than needing to stay perfectly in lockstep.
export const SECURITY_FLAG_GLOSSARY = Object.freeze({
  nmap: {
    "-sn": "Ping scan: skip port scanning, just report which hosts respond. Fast host discovery, not a vulnerability check.",
    "-sU": "UDP scan: probes UDP ports instead of TCP. Much slower than a TCP scan and prone to false positives from filtered/dropped packets.",
    "-sV": "Version detection: probes open ports to identify the actual service and version running behind them, not just that the port is open.",
    "-sC": "Runs nmap's default set of NSE scripts (equivalent to --script=default) - safe, commonly-useful enumeration scripts.",
    "-sS": "SYN scan: sends a SYN and reads the response without completing the handshake - fast and relatively stealthy, but needs raw-socket privileges.",
    "-sT": "Connect scan: completes the full TCP handshake via the OS - works without elevated privileges, but is slower and more visible in logs.",
    "-sA": "ACK scan: sends only an ACK to map firewall rule sets (stateful vs stateless), not to find open ports directly.",
    "-sF": "FIN scan: sends a lone FIN flag, hoping to slip past simple packet-filter firewalls that only look for SYN.",
    "-sN": "Null scan: sends a packet with no flags set at all, another firewall-evasion probe with the same open/filtered ambiguity as FIN and Xmas.",
    "-sX": "Xmas scan: sends a packet with FIN, PSH, and URG all set ('lit up like a Christmas tree'), a third firewall-evasion variant.",
    "-p": "Port or port range to scan (e.g. 22,80,443 or 1-1000) - without it, nmap scans its default top-1000 ports.",
    "-T": "Timing template (0 Paranoid through 5 Insane) - trades scan speed and parallelism against stealth and reliability.",
    "-v": "Verbose: prints progress and intermediate results (e.g. ports as they're found) instead of only the final report.",
    "-vv": "Very verbose: even more progress detail than -v.",
    "-oN": "Writes the scan results to a file in nmap's normal (human-readable) format, in addition to the console.",
    "--version-intensity": "How hard nmap tries during version detection (0-9) - higher values send more probes and take longer for a more confident match.",
    "--script=": "Runs a specific NSE script or script category (e.g. vuln, http-enum) instead of, or in addition to, the default set."
  },
  ffuf: {
    "-u": "The target URL, with FUZZ marking where the wordlist entries get substituted.",
    "-w": "Path to the wordlist used to fill in FUZZ."
  },
  gobuster: {
    "-u": "The target URL or domain to enumerate against.",
    "-w": "Path to the wordlist of directory/file/subdomain names to try."
  },
  feroxbuster: {
    "-u": "The target base URL to recursively enumerate.",
    "-w": "Path to the wordlist of paths to try."
  },
  dirsearch: {
    "-u": "The target base URL to enumerate.",
    "-w": "Path to the wordlist of paths to try."
  },
  wfuzz: {
    "-u": "The target URL, with FUZZ marking the injection point.",
    "-w": "Path to the wordlist used to fill in FUZZ."
  },
  wpscan: {
    "-u": "The target WordPress site URL.",
    "--url": "The target WordPress site URL (long form of -u)."
  },
  sqlmap: {
    "-u": "The target URL to test for SQL injection.",
    "--url": "The target URL to test for SQL injection (long form of -u)."
  },
  hydra: {
    "-l": "A single login name to try (lowercase L - not a wordlist; use -L for a username list).",
    "-P": "Path to a password wordlist to try against the login (capital P - lowercase -p is a single password, easy to mix up)."
  },
  medusa: {
    "-h": "The target host.",
    "-u": "A single username to try.",
    "-P": "Path to a password wordlist (capital P, same convention as Hydra)."
  },
  ncrack: {
    "-user": "A single username to try.",
    "-P": "Path to a password wordlist to try against the login."
  },
  kerbrute: {
    "--domain": "The Active Directory domain to enumerate or spray against.",
    userenum: "Kerbrute's subcommand for username enumeration via Kerberos pre-auth (not a -x flag - the first bare word after kerbrute).",
    passwordspray: "Kerbrute's subcommand for spraying one password across a list of usernames via Kerberos pre-auth."
  },
  netexec: {
    smb: "Selects the SMB protocol module (netexec's first argument is always the protocol, not a -x flag).",
    ldap: "Selects the LDAP protocol module.",
    winrm: "Selects the WinRM protocol module.",
    rdp: "Selects the RDP protocol module.",
    mssql: "Selects the MSSQL protocol module.",
    "-u": "Username to authenticate with.",
    "-p": "Password to authenticate with (plaintext - use -H instead if you only have a hash).",
    "-H": "NTLM hash to authenticate with instead of a plaintext password (pass-the-hash)."
  },
  ssh: {
    "-i": "Path to the private key file to authenticate with, instead of a password.",
    "-p": "The remote SSH port (defaults to 22 if omitted).",
    "-L": "Local port forward: <local port>:<remote host>:<remote port>, tunnels a local port to a service reachable from the SSH target.",
    "-D": "Dynamic port forward (SOCKS proxy): turns the SSH connection into a SOCKS proxy on the given local port."
  },
  "evil-winrm": {
    "-i": "The target host's IP or hostname.",
    "-u": "Username to authenticate with.",
    "-p": "Password to authenticate with."
  },
  xfreerdp: {
    "/v:": "The target host (RDP uses /flag:value syntax, not space-separated -f value).",
    "/u:": "Username to authenticate with.",
    "/p:": "Password to authenticate with."
  },
  hashcat: {
    "-m": "The hash mode/type number (e.g. 0 = MD5, 1000 = NTLM) - must match the format of the hashes in the input file or hashcat will report 0 candidates cracked.",
    "-a": "Attack mode: where candidate passwords come from - 0 straight/wordlist, 1 combination, 3 brute-force/mask, 6 and 7 hybrid wordlist+mask.",
    "-r": "Path to a rules file that mangles each wordlist entry (case changes, appended digits, leetspeak, etc.) to multiply a wordlist's effective coverage.",
    "-w": "Workload profile (1-4) - how aggressively hashcat uses the GPU/CPU; higher is faster but can make the machine unresponsive.",
    "-O": "Enables the optimized kernel - faster cracking, at the cost of a shorter maximum supported password length.",
    "--increment": "Automatically tries increasing mask lengths in brute-force mode instead of only the exact mask length given.",
    "--force": "Skips hashcat's hardware/sanity checks (e.g. missing GPU) - only appropriate on a lab VM with no dedicated GPU.",
    "--session": "Names this run so it can be checkpointed and resumed later with --restore.",
    "-o": "Writes cracked results to this file instead of only the terminal/potfile.",
    "--restore": "Resumes a previously started, named session from where it left off.",
    "--show": "Prints already-cracked results for the given hash file from the potfile, without doing any new cracking work."
  },
  john: {
    "--show": "Prints already-cracked results for the given hash file from the pot file, without doing any new cracking work.",
    "--wordlist=": "Path to the wordlist to try, using = rather than a separate argument (John's own flag convention).",
    "--format=": "The hash format to target (e.g. NT, sha512crypt, raw-md5) - John usually auto-detects this, but ambiguous hash files need it spelled out.",
    "--rules=": "Applies a named mangling rule set to the wordlist (case changes, digit suffixes, etc.), multiplying its effective coverage.",
    "--mask=": "John's mask syntax for brute-force generation, used instead of a wordlist.",
    "--incremental=": "Runs John's built-in incremental (pure brute-force) mode with the given charset definition, instead of a wordlist.",
    "--fork=": "Splits the cracking work across this many parallel processes.",
    "--session=": "Names this run so it can be checkpointed and resumed later with --restore.",
    "--restore=": "Resumes a previously interrupted, named session from where it left off.",
    "--pot=": "Custom path for the 'pot file' where John records already-cracked hash:password pairs."
  },
  netcat: {
    "-lvp": "Listen (-l), verbose (-v), on the given port (-p) - sets up a listener rather than connecting outbound."
  },
  socat: {
    "-lvp": "Listen (-l), verbose (-v), on the given port (-p), mirroring the netcat convention this command is standing in for."
  },
  msfconsole: {
    "-q": "Quiet mode: suppresses the ASCII banner and startup checks - mainly useful for scripted, non-interactive runs.",
    "-x": "Runs the given semicolon-separated commands as soon as msfconsole starts (a resource script inline), instead of waiting at the interactive prompt - the standard way to script module selection, target/callback options, and run non-interactively."
  },
  msfvenom: {
    "-p": "The Metasploit payload module to generate (e.g. windows/x64/meterpreter/reverse_tcp).",
    "LHOST=": "The listener (attacker) IP the payload calls back to - must be reachable from the target.",
    "LPORT=": "The listener (attacker) port the payload calls back to.",
    "-f": "Output format for the generated payload (e.g. exe, elf, raw)."
  },
  masscan: {
    "-p": "Port or port range to scan - masscan is built for speed across large ranges, not service detection."
  },
  rustscan: {
    "-p": "Port or port range to scan - rustscan is a fast pre-scan, typically piped into nmap for service detection."
  },
  snmpwalk: {
    "-c": "SNMP community string (the SNMP equivalent of a password) - 'public' is the common default worth trying first.",
    "-v": "SNMP protocol version (1, 2c, or 3) - must match what the device actually speaks."
  },
  onesixtyone: {
    "-c": "Path to a community-string wordlist to try, or a single string.",
    "-v": "Verbose output."
  },
  tcpdump: {
    "-i": "Network interface to capture on (e.g. eth0) - not an IP filter.",
    "-w": "Write raw captured packets to this file instead of printing them, for later analysis in Wireshark."
  },
  tshark: {
    "-i": "Network interface to capture on.",
    "-w": "Write raw captured packets to this file."
  },
  wireshark: {
    "-i": "Network interface to capture on.",
    "-w": "Write raw captured packets to this file."
  },
  hping3: {
    "-p": "Target port to send crafted packets to.",
    "-c": "Number of packets to send, then stop (hping3 sends continuously by default)."
  },
  "pattern-create": {
    "-l": "Length of the unique cyclic pattern to generate, used to find the exact offset of a crash.",
    "-q": "Look up the offset of a specific 4/8-byte value within a previously generated pattern."
  },
  "pattern-offset": {
    "-l": "Length of the unique cyclic pattern to generate.",
    "-q": "The captured EIP/RIP (or other register) value to find the offset for."
  },
  gcc: {
    "-o": "Output binary filename - without it, gcc defaults to a.out."
  },
  nasm: {
    "-o": "Output object/binary filename."
  },
  responder: {
    "-I": "Network interface to listen on for LLMNR/NBT-NS/mDNS poisoning."
  },
  "bloodhound-python": {
    "-d": "Target Active Directory domain.",
    "-u": "Username to authenticate with for LDAP collection.",
    "-p": "Password to authenticate with."
  },
  sharphound: {
    "-d": "Target Active Directory domain.",
    "-dc-ip": "IP of a domain controller to collect from, useful when DNS resolution of the domain doesn't point where you need it to."
  },
  ldapdomaindump: {
    "-d": "Target Active Directory domain (informational; the actual bind target is the DC).",
    "-dc-ip": "IP of the domain controller to query over LDAP."
  },
  certipy: {
    "-target": "The target domain controller or CA host."
  },
  getnpusers: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with instead of a password." },
  getuserspns: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with instead of a password." },
  psexec: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with - pass-the-hash instead of a password." },
  wmiexec: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with." },
  smbexec: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with." },
  atexec: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to authenticate with." },
  ntlmrelayx: { "-hashes": "Pre-obtained NTLM hash (LM:NT format), when relaying on behalf of an already-compromised account." },
  gettgt: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to request a Kerberos TGT with instead of a password." },
  getst: { "-hashes": "Pre-obtained NTLM hash (LM:NT format) to request a service ticket with." },
  ticketer: { "-hashes": "The krbtgt (or target service account) NTLM hash used to forge the ticket's signature." },
  "airodump-ng": {
    "-b": "Target access point's BSSID (MAC address) - narrows capture to one network.",
    "-c": "Wi-Fi channel to capture on - must match the target network's channel.",
    "-w": "Filename prefix to write the capture files to."
  },
  "aireplay-ng": {
    "-b": "Target access point's BSSID.",
    "-c": "Wi-Fi channel to operate on.",
    "-w": "Filename prefix, kept for consistency with the capture step this deauth pairs with."
  },
  "aircrack-ng": {
    "-b": "Target access point's BSSID to crack the key for.",
    "-c": "Wi-Fi channel (informational at crack time - the capture already recorded it).",
    "-w": "Path to the wordlist to try against the captured handshake."
  }
});

export function getSecurityFlagDescription(toolId, flag) {
  return SECURITY_FLAG_GLOSSARY[toolId]?.[flag] ?? null;
}
