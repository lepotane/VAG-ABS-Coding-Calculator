# VAG ABS Coding Calculator v1-beta.1

VAG grubu ABS / ESP ünitelerinin uzun kodlamasını çözümleyen ve üreten masaüstü uygulaması.

## Bu sürümde

- **13 modül ailesi**, 326 gerçek araç koduyla doğrulandı
- Ayna (mirror) kuralları her ailede gerçek araçlarla sınandı — toplam **%99,95** tutarlılık
- VIN ofsetleri ve bayt rolleri gözlem verisinden türetildi, elle yazılmış sabitler yok
- Donör kodu vermeden de kod üretimi: bilinmeyen baytlar **en sık** değerle doldurulur ve kaynağı raporlanır
- Türkçe / İngilizce arayüz
- Windows kurulum ve taşınabilir sürüm; EXE'ler dijital olarak imzalı ve zaman damgalı

## İndirme

| Dosya | Boyut | Açıklama |
|---|---|---|
| `VAG-ABSCoder-Setup-1.0.0-beta.1.exe` | ~78 MB | Kurulum sihirbazı (önerilen) |
| `VAG-ABSCoder-Portable-1.0.0-beta.1.exe` | ~78 MB | Kurulum gerektirmez |

## ⚠️ Uyarı

Canlı araca yazmadan önce **orijinal kodlamayı yedekleyin**.
Kabul edilen bir kod bile arıza kaydı bırakabilir. Değiştirilmiş kodlama ABS, ESC,
çekiş kontrolü ve park yardımı gibi güvenlik açısından kritik sistemleri etkiler.

## SmartScreen uyarısı

EXE'ler imzalı ve zaman damgalıdır. Ancak imza **kendi kendine üretilmiş (self-signed)
sertifika** ile yapılmıştır; Windows kök deposunda güvenilir olmadığı için SmartScreen
uyarısı devam eder. *"Diğer bilgiler → Yine de çalıştır"* ile devam edebilirsiniz.

## Bilinen sınır

- 144 kayıt kaynağında yarım kodlama olduğu için kullanılamıyor (bunlar dışarıda bırakıldı)
- Ayna kuralı doğrulanamayan 2 aile (COMPACT_15, TINY_8K0) yalnızca çözümleme yapar
- Üretim, ayna kuralı doğrulanmış ailelerde açıktır

## Kaynak kodu

Tamamı açık — MIT lisansı. `npm install && npm test` ile doğrulayabilirsiniz.

**Yapımcı: Samet Muriç**