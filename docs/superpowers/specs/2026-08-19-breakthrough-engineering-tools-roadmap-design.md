# Breakthrough Engineering Tools Roadmap Design

**Date:** 2026-08-19

**Status:** Approved for inclusion in the portfolio roadmap on 2026-08-19

**Implementation status:** Planning only. Each suite still requires its own approved design and implementation plan.

## Objective

Turn the portfolio's Tools area into a memorable, expandable engineering workbench rather than a collection of unrelated pages. The library should give students and working engineers useful results immediately, teach the reasoning behind those results, and provide a practical handoff when a browser cannot perform the full job.

The breakthrough program contains five coordinated suites:

1. Crypto & Encoding Lab
2. Hash Recovery Assistant
3. IP & Subnet Explainer
4. Embedded & Edge Workbench
5. Container Mission

The already-approved Unified Tools Library is the navigation foundation for this program. It ships first and remains independently useful.

## Product position

The portfolio's primary hook becomes:

> Free engineering workbenches that calculate, explain, generate, and prepare real work.

The tools are fully usable without an account, email gate, or payment. A restrained contact or project CTA may appear after the user receives a result, but it must never block the result. This keeps the portfolio credible, shareable, and useful as an engineering reference.

Every suite must follow the same product principles:

- **Immediate value:** one obvious first input and a useful first result.
- **Progressive depth:** start with a guided path; reveal advanced controls only when requested.
- **Local by default:** perform calculations, transformations, candidate testing, and generation in the browser whenever practical.
- **Honest boundaries:** explain what the browser completed, what it could not complete, and why.
- **Actionable handoff:** generate files, commands, or a next-step checklist for work that requires local engineering software or hardware.
- **Explain while doing:** show concise reasoning without placing a textbook above the first interaction.
- **Responsive first:** full-card targets, readable 16px minimum form text, no cropped copy, and no horizontal page overflow on phone, tablet, or desktop.

## Program architecture

### Browser-local execution lane

Pure calculations, encoders, decoders, parsers, code generation, and bounded password-candidate testing run in the visitor's browser. Long-running work uses Web Workers so the interface remains responsive and can report progress, pause, or stop.

The default architecture has no application server, account system, job queue, or stored user input. It remains compatible with the current static GitHub Pages deployment.

### Optional external lookup lane

An external request is allowed only when it adds a capability that cannot be reproduced locally and the user explicitly activates it. The interface must identify the service, describe exactly what leaves the device, and provide a local-only path.

The first approved external integration is the Have I Been Pwned Pwned Passwords range API. It receives only a short hash prefix and is supplementary to local recovery.

### Local engineering handoff lane

When a task needs a GPU, Docker daemon, board, compiler, or other privileged local capability, the site prepares the work instead of pretending to execute it. A handoff may include:

- validated Hashcat or John the Ripper commands;
- a generated wordlist, mutation rules, and hash file;
- a Dockerfile, Compose file, `.dockerignore`, and diagnostic commands;
- a board-specific project bundle, wiring table, dependency manifest, and run instructions.

An optional desktop companion may be designed later, but it is not required for the browser-first program.

### Shared workbench components

The suites should reuse small, independently testable components:

- a normalized tool and capability catalog;
- guided/advanced mode controls;
- examples that fill real inputs with one click;
- input validation and plain-language error messages;
- Web Worker job lifecycle with progress, cancellation, and cleanup;
- privacy and execution-location labels: `Runs in this browser`, `Contacts HIBP`, or `Run locally`;
- result summaries with copy and download actions;
- generated-project packaging;
- accessible searchable selectors for large device, algorithm, and recipe catalogs.

Shared components must not force all suites into one giant runtime. Each page loads only its own catalog and processing code.

## Information architecture

The approved Unified Tools Library initially launches with six categories. The breakthrough program extends its catalog without reopening the complete Tools page.

When all five suites are available, the intended top-level fields are:

1. Electronics & Power
2. Embedded & Edge
3. AI & Computer Vision
4. Control, Physics & Math
5. Security & Networking
6. Data, Encoding & Crypto
7. Developer & Containers

The seventh category is added when Container Mission ships. Until then, the approved six-category Unified Tools Library remains unchanged. Category definitions and counts must remain catalog-driven so the later addition does not require a new hub architecture.

New destinations are classified as follows:

| Destination | Primary field | Primary capability |
|---|---|---|
| Crypto & Encoding Lab | Data, Encoding & Crypto | Transform and inspect data |
| Hash Recovery Assistant | Security & Networking | Authorized credential recovery |
| IP & Subnet Explainer | Security & Networking | Network planning and interpretation |
| Embedded & Edge Workbench | Embedded & Edge | Board-aware project generation |
| Container Mission | Developer & Containers | Container creation and diagnosis |

Global search must index suite names, algorithms, protocols, boards, peripherals, common task phrases, and important aliases. It must route the visitor to a focused suite or directly to a relevant recipe without rendering every internal option on the hub.

## Suite 1: Crypto & Encoding Lab

### User outcome

Convert, inspect, and compare encoded or encrypted-looking data without opening several unrelated websites, while learning whether the selected operation is encoding, obfuscation, hashing, or encryption.

### First interaction

The page opens with a two-panel workspace:

```text
Paste text or bytes -> Choose or detect a transform -> See output immediately
```

Examples fill the input and activate a transform with one click. The result always labels the operation type and whether it is reversible.

### Planned capabilities

- ROT5, ROT13, ROT18, ROT47, Caesar shift, and a custom rotation;
- Base64, Base32, hexadecimal, binary, URL, and HTML entity encode/decode;
- text encoding inspection for UTF-8 and common byte representations;
- local hash generation for MD5, SHA-1, SHA-256, SHA-512, and supported modern checksums;
- text and file checksum comparison;
- a transform chain for deliberate multi-step recipes after the single-transform experience is stable;
- a later secure-encryption lane using standard browser cryptography such as AES-GCM, with explicit nonce, key-derivation, and recovery guidance.

ROT and Base encodings must never be described as protection for sensitive information. Secure encryption must use maintained platform cryptography rather than custom cryptographic code.

### Non-goals for the first release

- no attempt to break modern encryption;
- no custom cryptographic primitive;
- no automatic execution of arbitrary scripts;
- no large transform-chain builder before the basic single-operation workflow is validated.

## Suite 2: Hash Recovery Assistant

### Product purpose

Help a user recover a password from a hash they own or are authorized to audit. Hash identification, exposure lookup, and risk explanation support the recovery goal; they are not the product's main result.

The simple promise is:

> Paste an authorized hash, try realistic password candidates on this computer, and prepare the best next recovery attempt.

### User journey

The initial page contains one primary input and optional examples:

```text
Paste one hash
    -> identify likely formats
    -> confirm an ambiguous format
    -> try common candidates locally
    -> recover the password or improve the attack
    -> export a local Hashcat/John job when more power is required
```

The interface must not show every control at once. The default guided path contains five compact steps:

1. **Hash:** paste one hash and confirm authorized use.
2. **Identify:** review likely algorithms, confidence, and ambiguity.
3. **Clues:** optionally add known words, approximate length, years, prefixes, suffixes, or a likely pattern.
4. **Recover:** choose a bounded attack and run it in the browser.
5. **Result:** show an exact recovered candidate or prepare the next local attempt.

Advanced mode exposes algorithm confirmation, worker count, candidate limits, masks, mutation rules, and local wordlist selection.

### Browser-local recovery engine

The browser uses the visitor's CPU to hash candidate passwords and compare them with the submitted hash. Work runs in Web Workers to avoid freezing the interface and may use WebAssembly where it provides a measured benefit.

Candidate sources are applied in an understandable order:

1. a small, redistributable built-in common-password set loaded only when recovery starts;
2. high-value variations such as capitalization, number and year suffixes, and common substitutions;
3. candidates generated from user-provided clues;
4. an optional wordlist selected from the visitor's computer and processed locally;
5. an optional user-defined mask with an estimated search size shown before execution.

The repository must not redistribute an unlicensed leaked-password corpus. Large wordlists remain user-supplied. Candidate generation and mutation rules must have hard limits and a visible estimate so a mistaken pattern cannot lock the device into an impractical job.

The first browser recovery release targets fast or commonly encountered formats where bounded CPU testing is useful:

- MD5;
- SHA-1;
- SHA-256;
- SHA-512;
- NTLM.

Slow password formats such as bcrypt, scrypt, PBKDF2, and Argon2 may receive a small proof-of-weakness test, but the interface must explain that their cost is intentional. Serious attempts for these formats use the local handoff rather than an unrealistic browser promise.

### Progress and performance

During recovery the result area shows:

- current attack stage;
- candidates tested;
- elapsed time;
- measured candidates per second;
- estimated remaining work when the search space is known;
- pause or stop controls;
- the execution label `Using your device CPU`.

The default worker count leaves capacity for the page and operating system. Advanced mode may let the user choose a lower or higher CPU profile. Closing, stopping, or navigating away must terminate workers and discard in-memory inputs.

### Recovery result

A candidate is shown as recovered only after hashing it with the confirmed algorithm and producing an exact match.

Successful output contains:

- recovered password candidate;
- confirmed format;
- attack stage that found it;
- attempts, time, and measured rate;
- concise advice to replace reused or weak passwords;
- copy action with an explicit sensitive-data warning.

An unsuccessful result must say `Not recovered in this test`, never `safe` or `uncrackable`. It then recommends the next attack based on the algorithm, clues, and measured rate.

### Hashcat and John handoff

For larger recovery work, the assistant generates an authorized local package containing only user-provided and locally generated material:

- `hashes.txt`;
- optional generated clue wordlist;
- optional rule or mask file;
- a README explaining the selected algorithm and attack;
- validated Hashcat and/or John the Ripper commands;
- a short checklist for starting, monitoring, stopping, and resuming the job.

The result explains why a tool and mode were selected. Commands must use safe shell quoting and reuse the existing Security Mission command-generation and redaction patterns instead of creating a competing command compiler.

The static website prepares this package but does not invoke Hashcat, John, a terminal, or the visitor's GPU.

### Optional HIBP exposure check

The Have I Been Pwned Pwned Passwords range API is a secondary, opt-in signal. For a supported SHA-1 or NTLM value, the browser sends only the first five hash characters, compares returned suffixes locally, and reports the known exposure count.

The interface must explain:

- the password itself is not sent;
- the full hash is not sent;
- a known match does not reveal the plaintext;
- no match does not prove that the password is strong;
- the exposure request is separate from local candidate recovery.

Padding is requested when supported to reduce response-size leakage. HIBP failure, rate limiting, or offline use must not block local recovery.

### Safety and privacy boundary

- The user confirms that the hash is theirs or authorized for testing.
- Hashes, clues, selected wordlists, and recovered candidates are not stored, logged, or sent to the portfolio owner.
- The tool does not submit a hash to CrackStation or a collection of third-party cracking sites.
- The tool does not provide a hosted unbounded brute-force service.
- Browser work is bounded, visible, cancellable, and limited to the active session.
- Downloaded packages are generated locally.
- The site distinguishes `identifying`, `testing`, `recovered`, `not recovered`, and `known exposed` so the results cannot be confused.

### Acceptance direction for the later suite spec

The implementation-specific design must define algorithm test vectors, worker cancellation behavior, candidate-limit defaults, supported hash syntax, ambiguous-identification handling, wordlist streaming limits, mobile thermal safeguards, and exact Hashcat/John mode mappings before code is written.

## Suite 3: IP & Subnet Explainer

### User outcome

Turn an address, CIDR block, or subnetting goal into a practical network explanation instead of returning only a mask and host count.

### Primary workflows

1. **Explain this IP:** classify a pasted address as public, private, loopback, link-local, multicast, documentation, or another reserved range and explain what that means.
2. **Explain this subnet:** show network address, prefix, subnet mask, wildcard mask, usable range, broadcast address, total addresses, usable hosts, and the relevant binary boundary.
3. **Plan subnets:** divide a larger network by required subnet count or hosts per subnet and present each resulting range.
4. **Interpret command output:** accept a carefully bounded pasted line from a common network command and extract recognizable addresses and prefixes for explanation.
5. **Summarize routes:** combine or compare CIDR ranges and explain overlap when the requested operation is mathematically valid.

The first release focuses on IPv4. IPv6 explanation and planning becomes a deliberate second release rather than a superficial checkbox.

### Teaching layer

The page leads with the answer, then lets the user reveal binary math, prefix movement, address classes versus classless routing, and worked examples. Copy actions provide router-friendly CIDR, mask, wildcard, and range formats.

All computation runs locally and requires no network lookup. Geolocation, reputation, WHOIS, or live reachability are separate future capabilities because they require external data and different privacy disclosures.

## Suite 4: Embedded & Edge Workbench

### Product change

Rename and expand Sensor Code Generator into **Embedded & Edge Workbench**. Sensors remain a major workflow, but the product becomes a board-aware project generator covering peripherals, communication, examples, and board-to-board systems.

### Supported platform families

The planned catalog includes:

- existing Arduino and ESP32 targets;
- Raspberry Pi 3, Raspberry Pi 4, and Raspberry Pi 5;
- NVIDIA Jetson Nano;
- NVIDIA Jetson Orin Nano;
- NVIDIA Jetson Orin NX;
- NVIDIA Jetson AGX Orin.

Specific memory configurations are metadata, not separate workflow cards unless their hardware capabilities materially differ. Legacy and end-of-life targets are labeled clearly instead of being silently presented as current recommendations.

### Language and runtime choices

- Python and C++ are first-class where the selected platform supports them.
- The generator chooses maintained platform libraries and explains installation context.
- Board capability validation prevents impossible combinations, such as treating an unavailable analog input as a built-in peripheral.
- Raspberry Pi dependency guidance accounts for current operating-system package and virtual-environment practices.
- NVIDIA projects distinguish ordinary GPIO/peripheral work from accelerated CUDA, camera, and inference workflows.

### User workflows

1. **Connect a sensor:** select board, sensor, bus, language, and example goal.
2. **Use a peripheral:** GPIO, PWM, I2C, SPI, UART, camera, storage, networking, or another board-supported interface.
3. **Connect two boards:** choose both endpoints and a protocol, then receive code for both sides plus the wiring and message contract.
4. **Start an edge project:** generate a structured project for data acquisition, camera inference, telemetry, or local control.
5. **Learn from an example:** open a tested scenario that preselects the hardware and explains the data flow before showing advanced options.

### Communication recipes

Board-to-board recipes may cover UART, I2C, SPI, CAN where hardware support is explicit, TCP, UDP, MQTT, BLE, and ESP-NOW where compatible. Each recipe contains:

- supported board roles;
- electrical-level and grounding warnings;
- pin and wiring table;
- sender and receiver code;
- message schema;
- timeout and reconnect behavior;
- verification steps;
- common failure guidance.

### Generated artifact

The output is a downloadable, runnable project rather than an isolated snippet. It includes source files, dependency manifest, configuration placeholders, README, wiring table, run commands, and verification checklist. Secrets use placeholders and are never embedded in generated examples.

## Suite 5: Container Mission

### User outcome

Help someone create, understand, or troubleshoot a containerized project without requiring them to remember every Dockerfile, Compose, networking, volume, or health-check detail.

### Primary workflows

1. **Containerize my project:** select a language/runtime and project shape, then generate a Dockerfile, `.dockerignore`, Compose file when useful, and run commands.
2. **Explain this Dockerfile or Compose file:** parse pasted configuration locally, explain each stage or service, and flag common structural problems.
3. **Fix a container problem:** choose or paste a bounded error, then receive ordered diagnostic commands and explanations.
4. **Design a multi-service stack:** define app, database, cache, ports, volumes, networks, health checks, and dependencies through a guided builder.
5. **Prepare an edge deployment:** create board-aware Docker guidance for Raspberry Pi and NVIDIA Jetson, including architecture and GPU-runtime considerations when applicable.

### Design boundary

The static site generates, validates, and explains container artifacts. It cannot inspect the visitor's Docker daemon, images, containers, filesystem, or logs unless a future optional local companion is installed. The UI must say `Prepared for local Docker` instead of claiming that the container ran successfully.

Generated output includes concise explanations, secure defaults, multi-stage builds when justified, non-root execution where practical, health checks, explicit persistence choices, and a verification checklist. The tool should complement current Docker commands such as `docker init`, not recreate them without additional teaching or diagnostic value.

## Release roadmap

### Phase 0 — Unified discovery foundation

Implement the already-approved Unified Tools Library plan:

- category-first `/tools/` hub;
- global search across tools and capabilities;
- focused category pages;
- full-card navigation;
- responsive and accessible discovery components;
- catalog-driven expansion.

This phase is a dependency for every later public release.

### Phase 1 — Pure-browser quick wins

Design and ship separately:

1. IP & Subnet Explainer for IPv4;
2. Crypto & Encoding Lab single-transform workspace.

These validate the shared workbench patterns with low operational risk and immediate SEO/reference value.

### Phase 2 — Hash Recovery Assistant

Design and implement the browser CPU recovery engine, guided clues, local wordlist support, result reporting, optional HIBP range lookup, and Security Mission handoff. This is the flagship security utility and receives its own security, privacy, performance, and mobile-thermal review.

### Phase 3 — Embedded & Edge Workbench

Refactor the existing sensor generator into a board-capability architecture, preserve current working recipes, then add Raspberry Pi and NVIDIA Jetson families, Python/C++ projects, paired-board communication, and example-led generation.

### Phase 4 — Container Mission

Add Developer & Containers to the library taxonomy and ship artifact generation, explanation, multi-service planning, diagnostics, and edge deployment recipes.

### Phase 5 — Optional local companion investigation

Only after the browser suites prove demand, evaluate a signed local companion that could invoke authorized Hashcat/John jobs, inspect a local Docker daemon, or communicate with connected development boards. This is a separate product decision with installation, update, trust, and security costs; it is not assumed by this roadmap.

## Prioritization scorecard

Scores use the free-tool strategy dimensions of audience relevance, distinctiveness, feasibility, maintenance, link value, and shareability. They guide sequence but do not replace suite-specific validation.

| Suite | Strategic strength | Main risk | Recommended position |
|---|---|---|---|
| IP & Subnet Explainer | Broad practical use, easy to verify, strong learning value | Becoming a generic calculator | First quick win with explanation-led differentiation |
| Crypto & Encoding Lab | Frequent utility and strong search surface | Confusing encoding with security | First quick win with precise terminology |
| Hash Recovery Assistant | Memorable flagship and strong hands-on value | CPU limits, wordlist licensing, misuse, mobile heat | Flagship after shared worker patterns are proven |
| Embedded & Edge Workbench | Closest match to the portfolio's engineering identity | Large hardware and library maintenance surface | Major third wave built on a capability matrix |
| Container Mission | Broad developer appeal and natural project handoff | Static site cannot inspect Docker directly | Fourth wave, focused on preparation and diagnosis |

## Cross-suite quality requirements

Every suite-specific design and implementation plan must include:

- examples that can be loaded without typing;
- one clear primary action above the fold;
- full-card or full-row activation where a selection is presented;
- progressive disclosure rather than a wall of controls or documentation;
- readable text and input sizing at phone, tablet, and desktop widths;
- deterministic local test vectors for calculations and transforms;
- browser-level tests for the primary successful and unsuccessful journeys;
- cancellation and cleanup tests for long-running workers;
- explicit privacy labels for every external request;
- static export verification for the `/myPortflio` base path;
- natural page titles that do not mechanically repeat the portfolio owner's name;
- focused metadata and supporting explanatory content for discoverability;
- no copied third-party imagery unless its license explicitly permits reuse.

## Program non-goals

- Do not implement all five suites in one code change or one implementation plan.
- Do not add a backend merely to make the tools appear more powerful.
- Do not store passwords, hashes, code, network inputs, or generated projects.
- Do not automate submissions to unrelated third-party websites.
- Do not claim that a browser result proves security, compatibility, or successful hardware/container execution.
- Do not expose every suite, recipe, device, or option simultaneously on the Tools hub.
- Do not duplicate Security Mission's command compiler; extend or consume its safe command-generation interfaces.

## Required design sequence

This roadmap is the master scope and dependency map. Before implementation, each phase follows the same gate:

1. focused suite design;
2. user review and approval;
3. written implementation plan;
4. test-driven implementation;
5. independent review and responsive verification;
6. publication and live-route verification.

The Unified Tools Library remains the next executable plan. The first new suite design after that foundation should be IP & Subnet Explainer unless the user explicitly reprioritizes the flagship Hash Recovery Assistant.

## Reference foundations

- [Have I Been Pwned Pwned Passwords API](https://haveibeenpwned.com/API/v3#PwnedPasswords)
- [Hashcat documentation](https://hashcat.net/wiki/)
- [John the Ripper documentation](https://www.openwall.com/john/doc/)
- [ROT13.app operation examples](https://www.rot13.app/)
- [NVIDIA Jetson module lineup](https://developer.nvidia.com/embedded/jetson-modules)
- [NVIDIA Jetson lifecycle](https://developer.nvidia.com/embedded/lifecycle)
- [Raspberry Pi operating-system documentation](https://www.raspberrypi.com/documentation/computers/os.html)
- [Docker `docker init` documentation](https://docs.docker.com/reference/cli/docker/init/)
- [Docker Compose getting started](https://docs.docker.com/compose/gettingstarted/)
