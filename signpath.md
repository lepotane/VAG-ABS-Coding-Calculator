# SignPath Configuration

[Türkçe](signpath.tr.md)

## Applying

<https://open-source.signpath.io>

Before applying, this repository must provide:

- [x] Public GitHub repository
- [x] Open-source license (MIT)
- [x] `LICENSE` file
- [x] `README.md` (English) and `README.tr.md` (Turkish)
- [x] `SECURITY.md`
- [x] `CONTRIBUTING.md`
- [x] `CHANGELOG.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `package.json` with lockfile
- [x] Reproducible build instructions
- [x] `scripts/sign.js` for the post-build signing step

## After approval

### 1. Get the values from the dashboard

- **Project slug**
- **API URL**
- **CLI token**

### 2. Add the signing step to GitHub Actions

In `.github/workflows/release.yml`:

```yaml
- name: Sign
  uses: signpath/github-action-sign@v1
  with:
    api-token: ${{ secrets.SIGNPATH_CLI_TOKEN }}
    project-slug: ${{ vars.SIGNPATH_PROJECT_SLUG }}
    organization-id: ${{ vars.SIGNPATH_ORGANIZATION_ID }}
    base-profile-guid: ${{ vars.SIGNPATH_BASE_PROFILE_GUID }}
    config-file: signpath.yml
    artifact-configuration-guid: ${{ vars.SIGNPATH_ARTIFACT_CONFIGURATION_GUID }}
```

### 3. Enable the hook in `electron-builder.yml`

```yaml
afterSign: scripts/sign.js
```

This line is currently commented out. Enable it once signing is in place.

### 4. Define repository policy

Configure **Approval** policies in the SignPath dashboard:

- Only the maintainer (`lepotane`) may approve.
- Require approval so pull requests are reviewed before signing.
- Set an expiry and usage limit for the creation signature.

## Local signing for development

To test on your own machine, `scripts/make-cert.ps1` creates a self-signed
certificate:

```powershell
.\scripts\make-cert.ps1              # create certificate
$env:CSC_KEY_PASSWORD = "..."        # password
.\scripts\make-cert.ps1 -Sign         # sign the EXE files
```

This certificate is not trusted by Windows, so **SmartScreen still warns**. It is for
development only; use SignPath for distribution.

## Windows symbolic-link limitation

With Windows Developer Mode off, `electron-builder` cannot extract its metadata
tool (rcedit) because it requires symbolic links. The configuration therefore sets
`signAndEditExecutable: false` and signing happens **after** the build:

```powershell
npm run build
npx electron-builder --win --config.win.signAndEditExecutable=false
.\scripts\make-cert.ps1 -Sign
```

The same constraint applies in CI. Build with that flag, then run the signing step.