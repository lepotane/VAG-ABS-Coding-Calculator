# Installation

[Türkçe](Türkçe/Installation.md)

## Windows

Download from the [releases page](https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases).

| File | Description |
|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.1.exe` | Installer, creates shortcuts. Recommended. |
| `VAG-ABSCoder-Portable-1.0.0-beta.1.exe` | Single file, runs without installing. |

The installer lets you choose the installation directory and does not require
administrator rights.

### SmartScreen

The binaries are signed and timestamped. For pre-release builds Windows may still
show a blue "Windows protected your PC" window because the signing certificate is
self-signed.

Choose **More info → Run anyway**, or wait for a CA-signed build.

### Verifying the download

```powershell
Get-AuthenticodeSignature .\VAG-ABSCoder-Setup-1.0.0-beta.1.exe
```

Look for `Status: Valid` and a signer subject of `Samet Muric`. Anything else means
the file was modified — do not run it.

## macOS

```bash
npm run dist:mac
```

Produces a `.dmg`. The application is unsigned, so Gatekeeper blocks it on first
launch:

*System Settings → Privacy & Security → Open Anyway*

## Linux

```bash
npm run dist:linux
```

Produces `.AppImage` and `.deb`. On the AppImage:

```bash
chmod +x VAG-ABSCoder-*.AppImage
./VAG-ABSCoder-*.AppImage
```

## Requirements

None beyond the operating system. The program needs no internet connection, no
Python, no external tools.

## Uninstall

Delete the installation directory and the Start-menu entry. The application stores
no data outside its own folder.