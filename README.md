# VAG ABS Coding Calculator

[English](README.md) · [Türkçe](README.tr.md)

Desktop application that reads and generates **ABS/ESP long coding** for VAG vehicles.
Runs on Windows, macOS and Linux. Fully offline — no internet connection required.

> ⚠️ **Warning:** Always back up the original coding before writing to a vehicle.
> Even an accepted coding may leave fault codes in the control unit. A modified
> coding affects safety-critical systems such as ABS, ESC, traction control and
> parking assist.

---

## Highlights

- **13 module families**, validated against 326 real vehicle codes.
- Mirror rules verified per family against real vehicles — **99.95 %** overall consistency.
- Byte lengths, mirror maps, VIN offsets and byte roles are **derived from observed data**,
  not hard-coded guesses.
- The dataset lives outside the code (`src/data/mk100_dataset.json`); editing it
  changes the program without touching a single line of code.
- Turkish and English interface.
- **Code generation works without a donor code** — unknown bytes are filled from the
  most frequently observed value and every assumption is listed in the result.

## Status

`v1-beta.1` — pre-release. Expect rough edges.

## Tabs

| Tab | What it does |
|---|---|
| **Decode** | Explains a long coding byte by byte, verifies mirror integrity and flags bytes missing from the tables. |
| **Generate** | Builds a coding from vehicle, hardware and VIN data; computes mirror bytes automatically. |
| **VIN** | Decodes WMI, model code, model year, plant and serial number from a VIN. |
| **Dataset** | Shows record counts, which families are verified, and known exceptions. |

## How code generation works

A donor code is **not required**. Bytes are resolved in this order:

1. your selection,
2. the donor code you supplied (optional),
3. the **most common** observed value for that byte (its share is reported),
4. values that are identical on every vehicle.

Every byte filled this way is listed in the result table with its source, so an
assumption is never hidden.

**VIN:** in some families VIN bytes differ from vehicle to vehicle and the VIN is
required; in others they are identical across all vehicles and no VIN is needed.
The interface tells you which case you are in.

## Install

### Windows

Download from [Releases](https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases):

| File | Description |
|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.1.exe` | Installer (recommended) |
| `VAG-ABSCoder-Portable-1.0.0-beta.1.exe` | No installation required |

The binaries are digitally signed and timestamped. Windows SmartScreen may still
show a warning for pre-release builds — choose *More info → Run anyway*.

### macOS

```bash
npm run dist:mac      # .dmg
```

Unsigned applications are blocked on first launch:
*Settings → Privacy & Security → Open Anyway*.

### Linux

```bash
npm run dist:linux    # .AppImage and .deb
```

## Build from source

Requirements: Node.js 20+ and npm.

```bash
npm install
npm test              # 90 tests
npm run data:validate # dataset integrity check
npm run build         # production bundle
npm run dist:win      # Windows packages
```

## Module families

Byte length depends on the **module part-number series**, not on the vehicle. The
same model can carry different modules (Superb III appears with 30, 31 and 47-byte
units).

| Family | Platform codes | Bytes | Records |
|---|---|---|---|
| Continental MK100 — MQB | 5Q0, 3Q0 | 29–48 | 156 |
| Continental MK100 — MQB-A0 | 5WA, 3QG | 35 | 5 |
| Continental MK100 — MQB 44 | 5Q0 | 44 | 1 |
| Continental MK100 — EV | 1EA | 47 | 4 |
| MK60EC1 / compact | 1K0, 6R0, 1S0, 5Z0, 7P0 | 18–20 | 107 |
| Compact 15-byte | 2H0, 7E0 | 15 | 2 |
| Bosch ESP9 | 8W0, 4M6, 4M8, 4KE, 4N0 | 31 | 10 |
| Continental MK70 / PQ46 | 2Q0, 6R0 | 53 | 6 |
| Continental MK70 / PQ46 | 2Q0 | 59 | 3 |
| 5N0 614 | 5N0 | 24 | 3 |
| 4G0 907 | 4G0, 4H0 | 10 | 14 |
| 8K0 / 8R0 907 | 8K0, 8R0 | 3–4 | 14 |
| 6C0 907 | 6C0 | 26 | 1 |

Generation is enabled only for families whose mirror rule was verified against real
vehicles. All other families are available for decoding.

## The mirror rule

ABS modules repeat some bytes bit-reversed further along the block:

```
bitrev(byte[N]) == byte[M]
```

The `N → M` pairs differ per family and are stored in the dataset. Each rule is tested
against the real vehicle codes belonging to that family.

Known exception: one Skoda Karoq record (`5Q0 614 517 DN`, HW H82 / SW 0113) contains
`byte2=6A → byte16=58` where `56` is expected. The deviation is kept as a note in the
program; the rule itself is not altered to accommodate one faulty source record.

## Data sources

- **326 verified vehicle records** — address 03, [vagcode.info](https://vagcode.info/en/components/address-03)
- **Byte meanings** — the MK100 ABS Coding spreadsheet shared by user *Somnus* in
  [Ross-Tech forum thread 17417](https://forums.ross-tech.com/index.php?threads/17417/)

## Documentation

Full documentation is available in the wiki:

- [English Wiki](https://github.com/lepotane/VAG-ABS-Coding-Calculator/wiki)
- [Türkçe Wiki](https://github.com/lepotane/VAG-ABS-Coding-Calculator/wiki/TR-Home)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Issues and pull requests are welcome.

## Security

See [SECURITY.md](SECURITY.md). Please report vulnerabilities privately.

## License

MIT — see [LICENSE](LICENSE).

Author: **Samet Muriç**