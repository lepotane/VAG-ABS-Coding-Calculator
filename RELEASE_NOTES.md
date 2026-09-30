# VAG ABS Coding Calculator v1-beta.2

Desktop application that reads and generates ABS/ESP long coding for VAG vehicles.
Windows, macOS and Linux. Fully offline.

## In this release

This release expands the verified dataset and makes source attribution explicit.

- **363 real vehicle records**, up from 326 — 13 module families, unchanged
- Mirror rules verified per family against real vehicles — **99.96 %** overall consistency
- Every record now **names the source it came from**, shown in the Decode tab
- Byte lengths, mirror maps, VIN offsets and byte roles **derived from observed data**, not hard-coded
- Code generation **works without a donor code**: unresolved bytes are filled from the most frequently observed value and every assumption is listed in the result
- Turkish and English interface, including error messages
- Windows installer and portable build; binaries signed and timestamped

## How the dataset grew

A candidate pool of 930 observations was reduced to 199 records that passed every check:

| Check | Dropped |
|---|---|
| Incomplete coding (truncated blocks) | 90 |
| Confidence below 85 | 63 |
| Confirmed in only one source pool | 536 |
| All-zero coding | 42 |

Of the 199, **196 matched a known module family** by part series *and* byte length, and
**37 were new unique codings** on top of the original 326. Records that failed any check
were dropped rather than guessed at. The full ledger is in `statistics.filter_accounting`
of the dataset file.

No new module family was invented: the candidates that looked new turned out to be
already-known families under different names, so the existing verified mirror rules
were reused and re-checked against the new data.

## Data sources

| Source | Contribution |
|---|---|
| [vagcode.info — Address 03](https://vagcode.info/en/components/address-03) | 326 verified vehicle records |
| [Ross-Tech thread 17417](https://forums.ross-tech.com/index.php?threads/17417/) (*Somnus*) | MK100 byte meanings |
| [Ross-Tech forums](https://forums.ross-tech.com) | 5 coding records |
| [TDI Club forums](https://forums.tdiclub.com) | 5 coding records |
| [MQB Retrofits](https://mqb-retrofits.com/abs-coding) | coding reference |

## Download

| File | Size | Description |
|---|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.2.exe` | ~78 MB | Installer (recommended) |
| `VAG-ABSCoder-Portable-1.0.0-beta.2.exe` | ~78 MB | No installation required |

## ⚠️ Warning

Always back up the original coding before writing to a vehicle.

Even an accepted coding may leave fault codes in the control unit. A modified
coding affects safety-critical systems such as ABS, ESC, traction control and
parking assist.

## About the signature

The binaries are signed and timestamped. The certificate is **self-signed**, so it
is not trusted by Windows and SmartScreen will still warn. Choose
*More info → Run anyway*.

A CA-issued certificate (SignPath, DigiCert, Sectigo, GlobalSign, Azure Trusted
Signing) removes the warning. See `signpath.md` in the repository.

## Known limitations

- `COMPACT_15` and `TINY_8K0` have no verifiable mirror rule and are decode-only
- Generation is enabled only for families whose mirror rule was verified
- Mirror verification is 99.93 % for MQB_MK100: one Karoq record in the source data
  deviates (`byte2=6A → byte16=58`, expected `56`). The rule was not altered.
- Binary size is unchanged from v1-beta.1 apart from the slightly larger dataset

## Upgrading from v1-beta.1

No action needed. The dataset is a data file inside the app, so replacing the
installer is enough. If you prefer the portable build, delete the old folder and
extract the new archive.

## Source code

MIT licensed. Verify locally:

```bash
npm install
npm test
npm run data:validate
```

## Documentation

See the [wiki](https://github.com/lepotane/VAG-ABS-Coding-Calculator/wiki).

Author: **Samet Muriç**