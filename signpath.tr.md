# SignPath Yapılandırması

[English](signpath.md)

## Başvuru

<https://open-source.signpath.io>

Başvuru yapmadan önce bu depoda bulunması gerekenler:

- [x] Herkese açık GitHub deposu
- [x] Açık kaynak lisansı (MIT)
- [x] `LICENSE` dosyası
- [x] `README.md` (İngilizce) ve `README.tr.md` (Türkçe)
- [x] `SECURITY.md`
- [x] `CONTRIBUTING.md`
- [x] `CHANGELOG.md`
- [x] `CODE_OF_CONDUCT.md`
- [x] `package.json` ve kilit dosyası
- [x] Yeniden üretilebilir derleme talimatları
- [x] İmzalamadan sonraki süreç için `scripts/sign.js`

## Onay sonrası

### 1. Dashboard'dan bilgileri alın

- **Project slug**
- **API URL**
- **CLI token**

### 2. GitHub Actions'a ekleyin

`.github/workflows/release.yml` içinde imzalama adımı tanımlayın:

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

### 3. `electron-builder.yml` içinde hook'u etkinleştirin

```yaml
afterSign: scripts/sign.js
```

Bu satır şu anda yorumda — onaytan sonra etkinleştirin.

### 4. Depo kurallarını tanımlayın

SignPath dashboard'da **Approval** kuralları tanımlayın:

- Yalnızca bakım sahibi (`lepotane`) onaylayabilsin.
- Onay gerekli olsun (PR'lar imzalanmadan önce incelensin).
- Oluşturma imzalarının süresi ve kullanım sınırı belirlensin.

## Yerel geliştirmede imzalama

Kendi makinenizde test etmek için `scripts/make-cert.ps1` kendi
(imza, self-signed) sertifikanızı üretir ve imzalar:

```powershell
.\scripts\make-cert.ps1              # sertifika üret
$env:CSC_KEY_PASSWORD = "..."        # parola
.\scripts\make-cert.ps1 -Sign         # EXE'leri imzala
```

Bu sertifika Windows kök deposunda güvenilir olmadığı için **SmartScreen uyarısı
devam eder**. Yalnızca geliştirme amçlıdır; dağıtım için SignPath kullanın.

## Windows sembolik bağ sorunu

Windows'ta Geliştirici Modu kapalıyken `electron-builder` meta veri aracını
(rcedit) sembolik bağ ile açamaz. Bu nedenle `signAndEditExecutable: false`
ayarı kullanılır ve imzalama **derlemeden sonra** yapılır:

```powershell
npm run build
npx electron-builder --win --config.signAndEditExecutable=false
.\scripts\make-cert.ps1 -Sign
```

SignPath CI üzerinde çalışacaksa aynı kısıt geçerlidir; CI ortamında sembolik
bağ izni olmadığı için `--config.win.signAndEditExecutable=false` bayrağı ile
derleyip ardından imzalama adımını çalıştırın.