# Contributing

Thank you for considering a contribution.

## Getting started

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/lepotane/VAG-ABS-Coding-Calculator.git
cd VAG-ABS-Coding-Calculator
npm install
npm run electron:dev
```

## Before you open a pull request

```bash
npm test              # 90 tests must pass
npm run data:validate # dataset integrity must pass
npm run build         # bundle must build
```

All three must be green. A pull request that fails any of them will not be merged.

## Where to make changes

| File | Contains |
|---|---|
| `src/core/decode.js` | coding → meaning |
| `src/core/encode.js` | meaning → coding |
| `src/core/dataset.js` | dataset loader and statistics |
| `src/core/profiles.js` | family profiles and engine routing |
| `src/data/mk100_dataset.json` | **data, not code** — see below |

### Do not hard-code byte values

Mirror maps, VIN offsets and byte roles are derived from observed vehicle data. If
you find a family that is wrong, fix the dataset, not the source.

If you add a hard-coded byte map, the next dataset update will silently disagree
with it.

## Changing the dataset

The dataset is the single source of truth. To add or correct a family:

1. Edit `src/data/mk100_dataset.json`.
2. Run `npm run data:validate` and fix every error it reports.
3. Add a test that exercises the new family.

A mirror map may only be added if it holds for the family's real vehicle records.
The validator reports the pass ratio per family; anything below 90 % is an error.

## Coding style

- No build step for the core logic: plain ES modules under `src/core`.
- Prefer explicit names over abbreviations, except where the domain uses them
  (`byte`, `vin`, `mirror`, `bitrev`).
- Comment the *why*, not the *what*. A comment that restates the line below it is
  noise.
- All user-facing strings live in `src/ui/i18n.js` in **both** Turkish and English.
  Never hard-code a user-visible string in `app.js`.
- Errors returned from the core use structured objects (`{ code, ...params }`) so
  the interface can localise them. Do not return pre-formatted sentences.

## Commit messages

Short, imperative, one line:

```
fix mirror map for COMPACT_1K0 byte 2
add PART46_53 family with verified mirror rule
```

## Pull requests

- One topic per pull request.
- Describe what changed and how it was verified.
- If you changed the dataset, paste the validator summary.

## Reporting bugs

Open an issue with:

- the module family and part number,
- the vehicle year and model,
- the coding you entered (mask the VIN),
- what you expected and what happened.

Please never post a complete VIN in an issue. Mask at least the middle characters.