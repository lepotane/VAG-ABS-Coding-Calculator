# Katkı rehberi

Katkıda bulunmayı düşündüğünüz için teşekkürler.

Türkçe: [CONTRIBUTING.md](CONTRIBUTING.md)

## Başlangıç

Gereksinimler: Node.js 20+ ve npm.

```bash
git clone https://github.com/lepotane/VAG-ABS-Coding-Calculator.git
cd VAG-ABS-Coding-Calculator
npm install
npm run electron:dev
```

## Pull request öncesi kontrol

```bash
npm test              # 90 test geçmeli
npm run data:validate # veri seti doğrulaması geçmeli
npm run build         # derleme başarılı olmalı
```

Üçü de yeşil olmalı. Biri kırmızı olan pull request birleştirilmez.

## Nereyi değiştirmeli

| Dosya | İçerik |
|---|---|
| `src/core/decode.js` | kod → anlam |
| `src/core/encode.js` | anlam → kod |
| `src/core/dataset.js` | veri seti yükleyici ve istatistik |
| `src/core/profiles.js` | aile profilleri ve motor yönlendirmesi |
| `src/data/mk100_dataset.json` | **veri, kod değil** — aşağıya bakın |

### Bayt değerlerini sabit yazmayın

Ayna haritaları, VIN ofsetleri ve bayt rolleri gözlem verisinden türetilir. Bir
aileyi yanlış bulduğunuzu düşünüyorsanız kaynak kodu değil veri setini düzeltin.

## Veri setini değiştirmek

1. `src/data/mk100_dataset.json` dosyasını düzenleyin.
2. `npm run data:validate` çalıştırıp bildirilen hataların hepsini giderin.
3. Yeni aile için onu sınayan bir test ekleyin.

Ayna haritası yalnızca o ailenin gerçek araç kayıtlarında geçerliyse eklenebilir.
Doğrulayıcı her aile için geçer oranını bildirir; %90'ın altı hata sayılır.

## Kod stili

- Çekirdek mantık için derleme adımı yok: `src/core` altında düz ES modülleri.
- Kısaltmalar yerine açık adlar tercih edin (`byte`, `vin`, `mirror`, `bitrev`
  gibi alana özgü olanlar hariç).
- Yorumda *ne yapıldığını* değil *neden* yapıldığını açıklayın.
- Kullanıcıya görünen tüm metinler `src/ui/i18n.js` içinde **Türkçe ve İngilizce**
  olarak bulunur. `app.js` içine metin gömülmez.
- Çekirdeğin döndürdüğü hatalar yapılandırılmış olmalıdır (`{ code, ...params }`),
  arayüz bunları çevirsin.

## Commit mesajları

Kısa, emir kipinde, tek satır:

```
COMPACT_1K0 byte 2 ayna haritasini duzelt
dogrulanmis ayna kuraliyla PART46_53 ailesini ekle
```

## Hata bildirme

Bir issue açarken şunları ekleyin:

- modül ailesi ve parça numarası,
- araç yılı ve modeli,
- girdiğiniz kod (VIN maskelenmiş),
- beklediğiniz ve olan davranış.

Lütfen issue'a **tam VIN girmeyin**. En azından orta karakterleri maskeleyin.