# Kaynaktan derleme

[English](Building.md)

## Gereksinimler

- Node.js 20 veya üzeri
- npm

Başka hiçbir araç gerekmez. Veri seti programla birlikte gelir.

## Kurulum

```bash
git clone https://github.com/lepotane/VAG-ABS-Coding-Calculator.git
cd VAG-ABS-Coding-Calculator
npm install
```

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Vite geliştirme sunucusu (tarayıcıda) |
| `npm run electron:dev` | Masaüstü uygulaması |
| `npm test` | Vitest paketi (90 test) |
| `npm run test:watch` | Testleri izleme modunda çalıştırır |
| `npm run data:validate` | Veri seti bütünlük kontrolü |
| `npm run build` | `dist/` altına üretim derlemesi |
| `npm run dist:win` | Windows kurulum paketleri |
| `npm run dist:mac` | macOS `.dmg` |
| `npm run dist:linux` | Linux `.AppImage` ve `.deb` |

## Pull request öncesi

```bash
npm test
npm run data:validate
npm run build
```

Üçü de geçmelidir.

## Klasör yapısı

```
src/
  core/          mantık, DOM erişimi yok
    bits.js      bitrev, bit ayrıştırma
    dataset.js   yükleyici, istatistik, uyumluluk
    decode.js    kod → anlam
    encode.js    anlam → kod
    profiles.js  aile profilleri, motor yönlendirmesi
    vin.js       VIN ayrıştırma
    i18n-data.js veri metinleri çeviri sözlüğü
  ui/
    i18n.js      arayüz metinleri, iki dil
    style.css    tema
  app.js         arayüz ve sekmeler
  data/
    mk100_dataset.json
electron/
  main.cjs       pencere, menü, dosya işlemleri
  preload.cjs    bağlam köprüsü
scripts/
  validate-dataset.mjs
  make-cert.ps1
```

## Mimari notlar

**Tek motor, çok aile.** Ayna *kuralı* her yerde aynıdır; yalnızca harita değişir.
Bu yüzden `encode()` aile başına dallanmak yerine haritayı, VIN bayt konumlarını ve
bayt rollerini veri setinden okur. Yeni bir aile kod gerektirmez.

**Hatalar yapılandırılmıştır.** Çekirdek `{ code, ...params }` döndürür; arayüz
aktif dilde biçimlendirir. Çekirdekten hazır cümleler döndürmeyin — çevrilemez.

**Çekirdek dilden bağımsızdır.** `src/core` içinde kullanıcıya görünen metin
yoktur. Metinler yalnızca `src/ui/i18n.js` ve veri seti çeviri sözlüğünde bulunur.

## Windows imzalama

Windows Geliştirici Modu sembolik bağlara izin verir. Kapalıyken
`electron-builder` `rcedit` aracını çıkaramaz ve derleme başarısız olur.
Bayrakla derleyip sonra imzalayın:

```powershell
npm run build
npx electron-builder --win --config.win.signAndEditExecutable=false
.\scripts\make-cert.ps1 -Sign
```

Dağıtım için [SignPath](https://open-source.signpath.io) kullanın —
ayrıntılar `signpath.tr.md` dosyasında.