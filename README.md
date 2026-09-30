# VAG ABS Coding Calculator

VAG grubu ABS / ESP ünitelerinin **uzun kodlama** (long coding) verisini çözümleyen ve
üreten masaüstü uygulaması. Windows, macOS ve Linux'ta çalışır.

**English** | [Türkçe](#türkçe)

> ⚠️ **Uyarı:** Canlı araca yazmadan önce orijinal kodlamayı yedekleyin.
> Kabul edilen bir kod bile arıza kaydı bırakabilir. Değiştirilmiş kodlama ABS, ESC,
> çekiş kontrolü ve park yardımı gibi güvenlik açısından kritik sistemleri etkiler.

Program tamamen çevrimdışıdır; internet bağlantısı gerekmez.

---

## Öne çıkanlar

- **13 modül ailesi**, 326 gerçek araç koduyla doğrulandı.
- Her ailenin ayna (mirror) kuralı gerçek araçlarla sınandı — toplam **%99,95** tutarlılık.
- Veri seti koddan ayrıdır: `src/data/mk100_dataset.json`. Dosyayı değiştirmek programı değiştirmez.
- Türkçe / İngilizce arayüz.
- Ayna kuralları, VIN ofsetleri ve bayt rolleri **gözlem verisinden türetilir**.

## Sekmeler

| Sekme | İşlev |
|---|---|
| **Çözümle** | Uzun kodlamayı bayt bayt anlamlandırır, ayna bütünlüğünü doğrular, tabloda olmayan baytları işaretler. |
| **Üret** | Araç, donanım ve VIN bilgisinden kod üretir; ayna baytlarını otomatik hesaplar. |
| **VIN** | VIN içindeki WMI, model kodu, model yılı, fabrika ve seri numarasını çözer. |
| **Veri Seti** | Kaç kayıt olduğunu, hangi ailelerin doğrulandığını ve bilinen istisnaları gösterir. |

## Kod üretimi nasıl çalışır?

Donör kodu vermek **zorunlu değildir**. Bilinmeyen baytlar şu sırayla doldurulur:

1. sizin seçiminiz,
2. verdiğiniz donör kodu,
3. o baytın **en sık** görülen değeri (yüzdesi raporlanır),
4. tüm araçlarda sabit olan değerler.

Doldurulan her bayt sonuç tablosunda kaynağıyla birlikte listelenir; hangi baytın
tahmin olduğu görülür.

**VIN:** Bazı ailelerde VIN baytları araçtan araça değişir, o durumda zorunludur.
Bazı baytlar tüm araçlarda aynıdır ve VIN girilmeden çözülür. Arayüz hangi durumda
olduğunuzu gösterir.

## Kurulum

### Windows

```
release\VAG-ABSCoder-Setup-1.0.0.exe       kurulum sihirbazı (önerilen)
release\VAG-ABSCoder-Portable-1.0.0.exe    kurulum gerektirmez
```

#### İmza (SmartScreen uyarısı)

**Kendi sertifikanızla (ücretsiz):** SmartScreen uyarısı devam eder, ancak
"Bilinmeyen yayımcı" yerine sertifika sahibiniz görünür.

```powershell
.\scripts\make-cert.ps1          # sertifika üret (bir kez)
$env:CSC_KEY_PASSWORD = "..."    # parola
.\scripts\make-cert.ps1 -Sign     # EXE'leri imzala
```

Derlemeyle birlikte otomatik imzalamak için:

```powershell
$env:CSC_LINK = "build\codesign.pfx"
$env:CSC_KEY_PASSWORD = "parola"
npm run dist:win
```

**CA sertifikası (SmartScreen tamamen kalkar — ücretli):** Azure Trusted Signing
(~₺3.500/yıl) veya DigiCert / Sectigo / GlobalSign (~₺2.500–15.000/yıl).
Sertifikayı aldıktan sonra yapılandırma değişmez; aynı `CSC_LINK` değişkenlerini
kullanırsınız.

### macOS / Linux

```bash
npm run dist:mac      # .dmg
npm run dist:linux    # .AppImage ve .deb
```

macOS'ta imzasız uygulama ilk açılışta engellenirse:
*Ayarlar → Gizlilik ve Güvenlik → "Aç"*.

## Geliştirme

```bash
npm install

npm run dev           # tarayıcıda geliştir
npm run electron:dev  # masaüstü uygulaması
npm test              # testler
npm run data:validate # veri seti doğrulaması
npm run build         # üretim derlemesi
npm run dist:win      # Windows paketleri
```

## Proje yapısı

```
src/
  core/
    bits.js         bit yardımcıları (bitrev, bit kırılımı)
    dataset.js      veri seti yükleyici, istatistik ve doğrulama
    decode.js       kod -> anlam / ayna / VIN
    encode.js       anlam -> kod
    profiles.js     aile profilleri ve motor yönlendirmesi
    vin.js          VIN çözümleme
    i18n-data.js    veri metinleri için TR/EN sözlük
  ui/
    i18n.js         arayüz metinleri (TR/EN)
    style.css       tema
  app.js            arayüz ve sekmeler
  index.html
  data/
    mk100_dataset.json   aile tanımları + 326 gerçek gözlem

electron/
  main.cjs          pencere, menü, dosya işlemleri
  preload.cjs       güvenli IPC köprüsü
```

## Modül aileleri

Bayt sayısı araca değil **modül parça numarası serisine** bağlıdır. Aynı model
farklı nesilde modül taşıyabilir (ör. Superb III 30, 31 veya 47 bayt).

| Aile | Platform kodları | Bayt | Gözlem |
|---|---|---|---|
| Continental MK100 — MQB | 5Q0, 3Q0 | 29–48 | 156 |
| Continental MK100 — MQB-A0 | 5WA, 3QG | 35 | 5 |
| Continental MK100 — MQB 44 | 5Q0 | 44 | 1 |
| Continental MK100 — elektrikli | 1EA | 47 | 4 |
| MK60EC1 / kompakt | 1K0, 6R0, 1S0, 5Z0, 7P0 | 18–20 | 107 |
| 15 baytlık kompakt | 2H0, 7E0 | 15 | 2 |
| Bosch ESP9 | 8W0, 4M6, 4M8, 4KE, 4N0 | 31 | 10 |
| Continental MK70 / PQ46 | 2Q0, 6R0 | 53 | 6 |
| Continental MK70 / PQ46 | 2Q0 | 59 | 3 |
| 5N0 614 | 5N0 | 24 | 3 |
| 4G0 907 | 4G0, 4H0 | 10 | 14 |
| 8K0 / 8R0 907 | 8K0, 8R0 | 3–4 | 14 |
| 6C0 907 | 6C0 | 26 | 1 |

Üretim (Üret sekmesi) yalnızca ayna kuralı gerçek araçlarla doğrulanmış ailelerde
açıktır. Diğer aileler çözümleme ile kullanılabilir.

## Ayna kuralı

ABS modülleri bazı baytları bit düzeyinde ters çevirerek ileride tekrar eder:

```
bitrev(byte[N]) == byte[M]
```

Her aile için `N → M` çiftleri farklıdır ve veri setinde kayıtlıdır. Kural, o
ailedeki gerçek araç kodlarında sınanır.

Bilinen tek istisna: Karoq `5Q0 614 517 DN` (HW H62/H82 serisi) kaydında
`byte2=6A → byte16=58`, beklenen `56`. Kaynak verideki bu sapma programda not olarak
saklanır; kural değiştirilmez.

## Veri setini genişletme

`src/data/mk100_dataset.json` dosyasına yeni bir aile eklemek yeterlidir:

```json
"yeni_aile": {
  "id": "yeni_aile",
  "label": "...",
  "default_length": 47,
  "lengths": [47],
  "mirror_map": { "0": 15, "2": 16 },
  "byte_template": [
    { "index": 0, "kind": "data", "values": { "1E": { "meaning": "..." } } },
    { "index": 1, "kind": "vin", "vin_digit": 7 }
  ]
}
```

`kind` değerleri: `data`, `vin`, `mirror`, `equipment`, `tail`.

## Lisans

MIT

---

# Türkçe

## VAG ABS Kodlama Hesaplayıcı

VAG grubu ABS / ESP ünitelerinin **uzun kodlama** verisini çözümleyen ve üreten
masaüstü uygulaması.

> ⚠️ **Uyarı:** Canlı araca yazmadan önce orijinal kodlamayı yedekleyin.
> Kabul edilen bir kod bile arıza kaydı bırakabilir.

Program tamamen çevrimdışıdır; internet bağlantısı gerekmez.

### Öne çıkanlar

- **13 modül ailesi**, 326 gerçek araç koduyla doğrulandı.
- Ayna kuralları gerçek araçlarla sınandı — toplam **%99,95** tutarlılık.
- Türkçe / İngilizce arayüz.
- Veri seti koddan ayrıdır; dosyayı değiştirmek programı değiştirmez.

### Kod üretimi

Donör kodu vermek **zorunlu değildir**. Bilinmeyen baytlar sırayla doldurulur:
seçiminiz → donör kod → o baytın **en sık** görülen değeri → sabit değerler.
Doldurulan her bayt kaynağıyla birlikte raporlanır.

**VIN:** Bazı ailelerde zorunludur, bazılarında gerekmez. Arayüz bunu gösterir.

### Kurulum

**Windows** — `VAG-ABSCoder-Setup-1.0.0.exe` (kurulum sihirbazı) veya
`VAG-ABSCoder-Portable-1.0.0.exe` (kurulum gerektirmez).

İmza için `scripts\make-cert.ps1` betiğini kullanabilirsiniz; ayrıntı için yukarıdaki
İmza bölümüne bakın.

**macOS / Linux** — `npm run dist:mac` / `npm run dist:linux`.

### Geliştirme

```bash
npm install
npm test
npm run data:validate
npm run dist:win
```

### Yapımcı

**Samet Muriç**