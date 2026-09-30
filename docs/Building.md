# Building from source

[Türkçe](Türkçe/Building.md)

## Requirements

- Node.js 20 or newer
- npm

No other tooling. The dataset is bundled.

## Setup

```bash
git clone https://github.com/lepotane/VAG-ABS-Coding-Calculator.git
cd VAG-ABS-Coding-Calculator
npm install
```

## Commands

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server in a browser |
| `npm run electron:dev` | The desktop application |
| `npm test` | Vitest suite (90 tests) |
| `npm run test:watch` | Tests in watch mode |
| `npm run data:validate` | Dataset integrity check |
| `npm run build` | Production bundle into `dist/` |
| `npm run dist:win` | Windows installers |
| `npm run dist:mac` | macOS `.dmg` |
| `npm run dist:linux` | Linux `.AppImage` and `.deb` |

## Before opening a pull request

```bash
npm test
npm run data:validate
npm run build
```

All three must pass.

## Layout

```
src/
  core/          logic, no DOM access
    bits.js      bitrev, bit decomposition
    dataset.js   loader, statistics, compatibility
    decode.js    coding → meaning
    encode.js    meaning → coding
    profiles.js  family profiles, engine routing
    vin.js       VIN parsing
    i18n-data.js translation dictionary for dataset strings
  ui/
    i18n.js      interface strings, both languages
    style.css    theme
  app.js         interface and tabs
  data/
    mk100_dataset.json
electron/
  main.cjs       window, menu, file handling
  preload.cjs    context bridge
scripts/
  validate-dataset.mjs
  make-cert.ps1
```

## Architecture notes

**One engine, many families.** The mirror *rule* is identical everywhere; only the
map differs. `encode()` therefore reads the map, the VIN byte positions and the
byte roles from the dataset instead of branching per family. A new family needs no
new code.

**Errors are structured.** The core returns `{ code, ...params }`; the interface
formats them in the active language. Never return a pre-formatted sentence from the
core — it cannot be translated.

**The core is language-agnostic.** `src/core` contains no user-visible strings.
Only `src/ui/i18n.js` and the dataset translation dictionary do.

## Windows signing

Windows Developer Mode allows symbolic links. Without it, `electron-builder`
cannot extract `rcedit` and the build fails. Build with the flag and sign after:

```powershell
npm run build
npx electron-builder --win --config.win.signAndEditExecutable=false
.\scripts\make-cert.ps1 -Sign
```

For distribution, use [SignPath](https://open-source.signpath.io) — see
`signpath.md`.