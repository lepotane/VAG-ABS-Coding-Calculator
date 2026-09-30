# VAG ABS Kodlama Hesaplayıcı

[English](README.md) · [Türkçe](README.tr.md)

VAG grubu ABS / ESP ünitelerinin **uzun kodlamasını** çözümleyen ve üreten masaüstü
uygulaması. Windows, macOS ve Linux'ta çalışır. Tamamen çevrimdışıdır; internet
bağlantısı gerekmez.

> ⚠️ **Uyarı:** Canlı araca yazmadan önce orijinal kodlamayı yedekleyin.
> Kabul edilen bir kod bile arıza kaydı bırakabilir. Değiştirilmiş kodlama ABS, ESC,
> çekiş kontrolü ve park yardımı gibi güvenlik açısından kritik sistemleri etkiler.

---

## Öne çıkanlar

- **13 modül ailesi**, 326 gerçek araç koduyla doğrulandı.
- Ayna kuralları her ailede gerçek araçlarla sınandı — toplam **%99,95** tutarlılık.
- Bayt uzunlukları, ayna haritaları, VIN ofsetleri ve bayt rolleri **gözlem
  verisinden türetilir**; elle yazılmış tahminler yoktur.
- Veri seti kodun dışındadır (`src/data/mk100_dataset.json`); dosyayı düzenlemek
  programı değiştirir, kod satırına dokunmayı gerekmez.
- Türkçe ve İngilizce arayüz.
- **Donör kodu olmadan da kod üretimi** — bilinmeyen baytlar en sık görülen değerle
  doldurulur ve her varsayım sonuç tablosunda açıkça listelenir.

## Durum

`v1-beta.1` — ön sürüm. Kaba kenarlar olabilir.

## Sekmeler

| Sekme | İşlev |
|---|---|
| **Çözümle** | Uzun kodlamayı bayt bayt anlamlandırır, ayna bütünlüğünü doğrular, tabloda olmayan baytları işaretler. |
| **Üret** | Araç, donanım ve VIN bilgisinden kod üretir; ayna baytlarını otomatik hesaplar. |
| **VIN** | VIN içindeki WMI, model kodu, model yılı, fabrika ve seri numarasını çözer. |
| **Veri Seti** | Kayıt sayılarını, doğrulanan aileleri ve bilinen istisnaları gösterir. |

## Kod üretimi nasıl çalışır?

Donör kodu vermek **zorunlu değildir**. Baytlar şu sırayla çözülür:

1. sizin seçiminiz,
2. verdiğiniz donör kodu (isteğe bağlı),
3. o baytın **en sık** görülen değeri (payı raporlanır),
4. tüm araçlarda aynı olan değerler.

Bu şekilde doldurulan her bayt sonuç tablosunda kaynağıyla listelenir; hiçbir
varsayım gizlenmez.

**VIN:** Bazı ailelerde VIN baytları araçtan araca değişir ve VIN zorunludur; bazı
ailelerde tüm araçlarda aynıdır ve VIN gerekmez. Arayüz hangi durumda olduğunuzu
gösterir.

## Kurulum

### Windows

[Releases](https://github.com/lepotane/VAG-ABS-Coding-Calculator/releases) sayfasından indirin:

| Dosya | Açıklama |
|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.1.exe` | Kurulum sihirbazı (önerilen) |
| `VAG-ABSCoder-Portable-1.0.0-beta.1.exe` | Kurulum gerektirmez |

Dosyalar dijital olarak imzalı ve zaman damgalıdır. Ön sürümlerde Windows
SmartScreen uyarısı verebilir — *Diğer bilgiler → Yine de çalıştır* seçin.

### macOS

```bash
npm run dist:mac      # .dmg
```

İmzasız uygulama ilk açılışta engellenir:
*Ayarlar → Gizlilik ve Güvenlik → "Aç"*.

### Linux

```bash
npm run dist:linux    # .AppImage ve .deb
```

## Kaynaktan derleme

Gereksinimler: Node.js 20+ ve npm.

```bash
npm install
npm test              # 90 test
npm run data:validate # veri seti bütünlük kontrolü
npm run build         # üretim derlemesi
npm run dist:win      # Windows paketleri
```

## Modül aileleri

Bayt uzunluğu araca değil **modül parça numarası serisine** bağlıdır. Aynı model
farklı modül taşıyabilir (Superb III 30, 31 ve 47 bayt olarak görünüyor).

| Aile | Platform kodları | Bayt | Kayıt |
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

Üretim yalnızca ayna kuralı gerçek araçlarla doğrulanmış ailelerde açıktır. Diğer
aileler çözümleme ile kullanılabilir.

## Ayna kuralı

ABS modülleri bazı baytları bit düzeyinde ters çevirerek ileride tekrar eder:

```
bitrev(byte[N]) == byte[M]
```

`N → M` çiftleri aileye göre değişir ve veri setinde saklanır. Her kural, o ailedeki
gerçek araç kodlarında sınanır.

Bilinen istisna: bir Skoda Karoq kaydında (`5Q0 614 517 DN`, HW H82 / SW 0113)
`byte2=6A → byte16=58` yazıyor, beklenen `56`. Sapma programda not olarak saklanır;
kural tek bir hatalı kaynak kaydına uydurmak için değiştirilmez.

## Belgeler

Ayrıntılı belgeler wiki'de:

- [English Wiki](https://github.com/lepotane/VAG-ABS-Coding-Calculator/wiki)
- [Türkçe Wiki](https://github.com/lepotane/VAG-ABS-Coding-Calculator/wiki/Türkçe)

## Katkı

[Katkı rehberi](CONTRIBUTING.tr.md) ve [güvenlik bildirimi](SECURITY.md) dosyalarına
bakın. Hata bildirimi ve katkılar memnuniyetle karşılanır.

## Lisans

MIT — [LICENSE](LICENSE) dosyasına bakın.

Yapımcı: **Samet Muriç**