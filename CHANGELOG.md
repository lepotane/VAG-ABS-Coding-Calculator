# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

## [1.0.0-beta.3] — 2026-10-01

Generation is now hardware-aware and refuses to produce a code it cannot verify.

### Fixed

- **Generated codes no longer mix values from other vehicles.** A family can cover a
  dozen control-unit versions, and the "most common value" across the whole family can
  belong to a different car. Generation now narrows the observation pool to the hardware
  and software version you enter.
- **Generation states whether the code is writable.** A code can still be produced, but
  when the data cannot support it the program says so and lists the unverified bytes
  instead of presenting an unsafe coding as final.
- Byte value tables now include the values actually seen in real vehicles, with the
  vehicles they were seen on. For example byte 0 = `1E` (Skoda Superb III) occurs on 12
  vehicles and can now be selected; previously it was absent from the table, so Superb
  could not be chosen at all.

### Added

- **Hardware (HW) and software (SW) fields** in the Generate tab, plus a picker listing
  every version known for the selected family.
- Scope indicator showing how many observations the chosen version matches.
- Per-byte confidence: a data-derived byte counts as verified only with at least 3
  observations and at least 60 % agreement. Below that it is listed as unverified.
- Mirror bytes inherit the confidence of the byte they are derived from.
- 15 regression tests, including a real-world case: Skoda Superb III 2019
  (`5Q0 614 517 DG`, HW H62, SW 0654). Previously 11 of its 47 bytes came from other
  vehicles; the control unit rejected the coding. With the version entered, zero bytes
  are wrong.

### Notes

Supplying the vehicle's current coding as a donor remains the safest route and now
produces zero unverified bytes.

## [1.0.0-beta.2] — 2026-10-01

Dataset expansion and source attribution.

### Changed

- **Dataset expanded from 326 to 363 verified vehicle records** (+37 new unique codings).
  A candidate pool of 930 observations was filtered down to 199 qualifying records; 196
  matched a known module family and 37 were new unique codings.
- Records now carry the **source they came from**, shown in the Decode tab.
- Mirror verification re-run on the enlarged dataset: **99.96 %** (2308/2309).
- Data sources registered explicitly (6 sources) in the dataset and the README.
- Byte meanings are labelled by their origin kind (`reference`, `observed`,
  `no_description`) so the Decode tab always states where an interpretation comes from.
- `index.html` document title aligned with the product name.

### Fixed

- `summary()` no longer loses its record statistics; legacy keys restored alongside the
  new `filter_accounting` block.
- Tests no longer hard-code the observation count; they now assert that the summary and
  the dataset statistics agree, so future data growth does not break them.

### Added

- `statistics.filter_accounting` — the full filter ledger (930 → 199 → 196 → +37) with
  the rejection reason for every dropped record.
- `source_registry` in the dataset — structured source list with id, label, URL and kind.

## [1.0.0-beta.1] — 2026-10-01

First public pre-release.

### Added

- **Decode** — long coding explained byte by byte, mirror integrity verified,
  bytes missing from the tables flagged.
- **Generate** — builds a coding from vehicle, hardware and VIN data; mirror bytes
  computed automatically.
- **VIN** — decodes WMI, model code, model year, plant and serial number.
- **Dataset** — record counts, per-family verification status, known exceptions.
- Turkish and English interface, switchable at runtime.
- 13 module families covering 326 verified real vehicle records.
- Per-family mirror verification against real vehicles; 99.95 % overall.
- Mirror maps, VIN offsets and byte roles derived from observed data rather than
  hard-coded.
- Code generation without a donor code — unresolved bytes are filled from the most
  common observed value and reported per byte.
- Validation script (`npm run data:validate`) covering schema, family definitions,
  mirror bounds, observation integrity, VIN byte positions and a full decode pass.
- Optional self-signed code signing (`scripts/make-cert.ps1`).

### Known limitations

- 144 source records contain partial coding and are excluded from the dataset.
- Two families (COMPACT_15, TINY_8K0) have no verifiable mirror rule and are
  decode-only.
- Release binaries are self-signed; Windows SmartScreen still warns until a CA-issued
  certificate is in place.

[Unreleased]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/compare/v1-beta.3...HEAD
[1.0.0-beta.3]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/compare/v1-beta.2...v1-beta.3
[1.0.0-beta.2]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/compare/v1-beta.1...v1-beta.2
[1.0.0-beta.1]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases/tag/v1-beta.1