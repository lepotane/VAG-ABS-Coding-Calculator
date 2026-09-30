# VAG ABS Coding Calculator — Wiki

[English](Home.md) · [Türkçe](Home.tr.md)

## İçindekiler

1. [Ana sayfa](Home.md) — genel bakış
2. [Kurulum](Türkçe/Installation.md) — Windows, macOS, Linux
3. [Kod çözümleme](Türkçe/Decoding.md)
4. [Kod üretme](Türkçe/Generating.md)
5. [VIN çözümleme](Türkçe/VIN.md)
6. [Modül aileleri](Türkçe/Families.md)
7. [Ayna kuralı](Türkçe/Mirror-Rule.md)
8. [Veri setini genişletme](Türkçe/Dataset.md)
9. [Kaynaktan derleme](Türkçe/Building.md)

## Program ne yapar

VAG araçlarının ABS/ESP uzun kodlamasını okuyan ve üreten masaüstü araç.
Tamamen çevrimdışı çalışır; veri seti programla birlikte gelir.

Program **araçla konuşmaz**. CAN veya tanı arayüzü yoktur. Kodlamayı kontrol
ünitesinden okuyup burada çözümler, neyi değiştirmek istediğinizi anlarsınız,
yeniden kod üretir ve kendi tanı aracınızla geri yazarsınız.

> ⚠️ Yazmadan önce orijinal kodlamayı yedekleyin. Kabul edilen bir kod bile
> arıza kaydı bırakabilir.

## Tasarım ilkeleri

**Veri seti programdır.** Bayt rolleri, ayna haritaları ve VIN ofsetleri
`src/data/mk100_dataset.json` içindedir, kodda değil. Yeni bir aile eklemek veri
düzenlemektir, kod yazmak değil.

**Her şey gerçek araçlardan türetilir.** Bir ayna haritası yalnızca o ailenin
gerçek araç kayıtlarında geçerliyse kabul edilir. Doğrulayıcı geçer oranını
bildirir ve %90'ın altını reddeder.

**Hiçbir şey gizlenmez.** Girdinizden çözülemeyen bir bayt için program en sık
görülen değeri kullanır ve bunu yüzdesiyle birlikte söyler.

**İki dil, karışmadan.** Türkçe ve İngilizce eksiksiz ve ayrıdır. Dil değiştirildiğinde
hata mesajları dahil her metin değişir.