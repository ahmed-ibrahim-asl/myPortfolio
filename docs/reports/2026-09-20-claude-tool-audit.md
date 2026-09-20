# Claude Tool and Satellite Orbit Audit

## Scope

Reviewed the seven newly added classical cryptography/hash tools and the satellite calculator changes in `feature/image-performance-seo`:

- Vigenère & Autokey Cipher
- Additive, Multiplicative & Affine Cipher
- Rail Fence & Transposition Cipher
- Playfair Cipher
- Hill Cipher
- MD5 & SHA Hash Generator
- AES Hex Calculator
- Satellite Orbit & Kepler Calculator

## Findings and corrections

### Satellite calculator

- Removed the satellite-module and calculation-convention dropdowns.
- Fixed the public convention to engineering constants.
- Changed the Earth gravitational-parameter input, help, state and printed substitutions to `398600.4418 km³/s²`.
- Added version-2 shared links without a convention selector while retaining migration for version-1 orbit links containing metre-based `mu`.
- Replaced the sparse orbit plot with an SVG orbital instrument showing Earth at the occupied focus, the empty focus, apsides, radius, altitude, speed, velocity direction, live and comparison equal-time sectors, elapsed time, play/pause, reset, keyboard scrubbing and reduced-motion behavior.
- Updated the Doppler browser expectation from the retired rounded convention (`33.33 ms`) to the engineering result (`33.36 ms`).

### Claude-created tools

- Verified every slug across the design-tool registry, route renderer, search seeds and calculator visual contracts.
- Verified all fourteen dark/light SVG covers exist, parse, have view boxes and contain no executable content.
- Verified canonical UI results for all seven routes, including SHA-256 through browser Web Crypto.
- Verified the routes at 320, 390 and 1440 pixels without horizontal overflow.
- Fixed a shared accessibility omission: mode and operation button sets now have named `role="group"` containers.
- Added polite live announcements to changing cipher, AES and hash outputs.
- Expanded mathematical coverage for negative modular shifts, all ragged keyed-transposition lengths through 32 characters, Playfair J/I normalization, singular 3×3 Hill matrices and the RFC 1321 alphanumeric MD5 vector.

No new generated bitmap was needed. Each new classical tool already has a valid purpose-specific dark/light SVG cover, and the orbital instrument is more accurate and accessible as code-native SVG.

## Verification evidence

- Focused satellite unit/state/visual tests: 45 passed, 0 failed.
- Satellite hydration tests: 4 passed, 0 failed, including English and Arabic routes.
- Satellite accessibility and responsive browser tests: 3 passed, 0 failed.
- Updated satellite/Doppler browser gate: 3 passed, 0 failed.
- Classical canonical math audit: 35 passed, 0 failed.
- Classical integration and browser audit: 3 passed, 0 failed.
- SEO suite: 7 files and 20 tests passed.
- Content validation: 3 articles, 2 prompts and 1 library item validated.
- Production build: compiled, type-checked and generated 168 static pages successfully.
- Full Node suite after changes: 695 tests total; 690 passed, 1 skipped and 4 failed. One scoped failure was an outdated Doppler expectation and passed after correction. The remaining three match the recorded baseline:
  - two `ResistorColorCodeCalculator.js` source-order failures from pre-existing uncommitted work;
  - one Model Mission responsive test whose private Next.js server exits before startup.

## Remaining risks

- The repository-wide Node suite is not globally green because of the three pre-existing failures above. They were not changed because they are outside this task's satellite/classical-tool scope.
- ECB is intentionally exposed only as an educational AES round calculator; the UI warning must remain because ECB is not appropriate for secure application encryption.
