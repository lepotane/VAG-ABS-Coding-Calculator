# VAG ABS Coding Calculator v1-beta.1

Desktop application that reads and generates ABS/ESP long coding for VAG vehicles.
Windows, macOS and Linux. Fully offline.

## In this release

- **13 module families**, validated against **326 real vehicle codes**
- Mirror rules verified per family against real vehicles — **99.95 %** overall consistency
- Byte lengths, mirror maps, VIN offsets and byte roles **derived from observed data**, not hard-coded
- Code generation **works without a donor code**: unresolved bytes are filled from the most frequently observed value and every assumption is listed in the result
- Turkish and English interface, including error messages
- Windows installer and portable build; binaries signed and timestamped

## Download

| File | Size | Description |
|---|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.1.exe` | ~78 MB | Installer (recommended) |
| `VAG-ABSCoder-Portable-1.0.0-beta.1.exe` | ~78 MB | No installation required |

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

- 144 source records contain partial coding and are excluded from the dataset
- `COMPACT_15` and `TINY_8K0` have no verifiable mirror rule and are decode-only
- Generation is enabled only for families whose mirror rule was verified
- Mirror verification is 99.92 % for MQB_MK100: one Karoq record in the source data
  deviates (`byte2=6A → byte16=58`, expected `56`). The rule was not altered.

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