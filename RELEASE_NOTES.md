# VAG ABS Coding Calculator v1-beta.3

Desktop application that reads and generates ABS/ESP long coding for VAG vehicles.
Windows, macOS and Linux. Fully offline.

## In this release

This release fixes a real defect in the Generate tab: generated codes could contain
byte values taken from other vehicles.

- **Hardware and software version can now be entered** — generation narrows the
  observation data to the version you enter
- **The program says whether the code is writable.** When the data cannot support a
  byte, it refuses and lists the unverified bytes instead of handing you a coding that
  the control unit will reject
- Byte tables now include values actually seen in vehicles, with the vehicles listed
- **363 real vehicle records**, 13 module families, mirror consistency **99.96 %**
- Turkish and English interface
- Windows installer and portable build; binaries signed and timestamped

## What went wrong

A module family can cover a dozen control-unit versions. The Generate tab filled any
byte you had not chosen with the most common value across the *whole family* — which
may belong to a different car.

Measured on a real vehicle, a 2019 Skoda Superb III (`5Q0 614 517 DG`, HW H62,
SW 0654):

| | Bytes |
|---|---|
| Correct | 36 of 47 |
| Wrong (from other vehicles) | 11 |
| Result | the control unit rejected the coding |

Among the wrong bytes were the vehicle variant and the ABS sensor configuration — the
program proposed a Golf's brake system and sensor layout for a Superb.

## How it behaves now

| Situation | Result |
|---|---|
| No HW/SW entered | Code produced, **not writable**, unverified bytes listed |
| HW entered | Pool narrowed to that version; still refused where data is thin |
| HW + SW entered | Narrowed further; refused while observations are fewer than 3 |
| Vehicle's current coding supplied as donor | Zero unverified bytes — **safest route** |

A byte counts as verified only with at least 3 observations and at least 60 % agreement
among them. Below that it is listed as unverified rather than assumed. Mirror bytes
inherit the confidence of the byte they are derived from.

## Download

| File | Size | Description |
|---|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.3.exe` | ~78 MB | Installer (recommended) |
| `VAG-ABSCoder-Portable-1.0.0-beta.3.exe` | ~78 MB | No installation required |

## ⚠️ Warning

Always back up the original coding before writing to a vehicle.

Even an accepted coding may leave fault codes in the control unit. A modified
coding affects safety-critical systems such as ABS, ESC, traction control and
parking assist.

If the program says a code is **not writable**, do not write it.

## About the signature

The binaries are signed and timestamped. The certificate is **self-signed**, so it
is not trusted by Windows and SmartScreen will still warn. Choose
*More info → Run anyway*.

A CA-issued certificate (SignPath, DigiCert, Sectigo, GlobalSign, Azure Trusted
Signing) removes the warning. See `signpath.md` in the repository.

## Known limitations

- `COMPACT_15` and `TINY_8K0` have no verifiable mirror rule and are decode-only
- Generation is enabled only for families whose mirror rule was verified
- Some hardware/software versions have very few observations in the dataset. Those are
  reported as unverified instead of being guessed — enter your version to see where
  the data stands
- Mirror verification is 99.93 % for MQB_MK100: one Karoq record in the source data
  deviates (`byte2=6A → byte16=58`, expected `56`). The rule was not altered.

## Upgrading from v1-beta.2

No action needed. Replace the installer, or delete the old portable folder and extract
the new archive.

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