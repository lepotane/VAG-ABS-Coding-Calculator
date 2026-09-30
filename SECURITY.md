# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.0-beta.1 | Yes |
| < 1.0.0-beta.1 | No |

## Reporting a Vulnerability

Please **do not open a public issue** for security problems.

Report privately through GitHub's security advisory form:

> Repository → Security → Report a vulnerability

Or contact the maintainer directly.

Please include:

- the affected version,
- a description of the issue,
- steps to reproduce it.

You can expect an acknowledgement within a few days and an assessment shortly after.

## Scope

This application **reads and writes data files**. It does not communicate with a
vehicle, and it contains no CAN or diagnostic interface. Reports about physical
harm caused by writing an incorrect coding to a vehicle are therefore not a code
vulnerability — but they are taken seriously as documentation issues, because the
output may be used by someone else.

If you discover that the generated data is wrong for a specific module, that is a
correctness issue and belongs in a normal issue.

## Data integrity

The dataset is validated on every build:

```bash
npm run data:validate
```

The check covers the schema, family definitions, mirror-map bounds, observation
integrity, VIN byte positions and a full decode of every record. A failing check
must block a release.

## Signed binaries

Release binaries are signed and timestamped. Verify before running:

```powershell
Get-AuthenticodeSignature .\VAG-ABSCoder-Setup-1.0.0-beta.1.exe
signtool verify /pa /v .\VAG-ABSCoder-Setup-1.0.0-beta.1.exe
```

An unexpected signer subject or a verification failure means the file was altered —
do not run it.