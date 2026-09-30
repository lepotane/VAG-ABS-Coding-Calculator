# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Nothing yet.

## [1.0.0-beta.2] — 2026-10-01

Dataset expansion and source cleanup.

### Changed

- **Dataset expanded from 326 to 363 verified vehicle records** (+37 new unique codings).
  A candidate pool of 930 observations was filtered down to 199 qualifying records; 196
  matched a known module family and 37 were new unique codings.
- Records now carry the **source they came from**, shown in the Decode tab.
- Mirror verification re-run on the enlarged dataset: **99.96 %** (2308/2309).
- Data sources registered explicitly (6 sources) in the dataset and the README.
- Spreadsheet-source wording removed from dataset field names, byte status labels and
  source comments; the provenance is now recorded in `source_registry`.
- Byte status label `xlsx` renamed to `reference`.
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

[Unreleased]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/compare/v1-beta.2...HEAD
[1.0.0-beta.2]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/compare/v1-beta.1...v1-beta.2
[1.0.0-beta.1]: https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases/tag/v1-beta.1