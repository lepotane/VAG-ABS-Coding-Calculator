# Kod üretme

[English](../Generating.md) · [Türkçe](Generating.md)


Üret sekmesi arac hakkında bildiklerinizden uzun kodlama oluşturur.

## Donör kodu gerekmez

Donör kodu **isteğe bağlıdır**. Belirtmediğiniz her bayt otomatik çözülür:

1. seçtiğiniz değer,
2. verdiyseniz donör kodu,
3. o baytın gerçek araçlarda **en sık** görülen değeri,
4. o ailedeki her araçta aynı olan değer.

Sonuç tablosu otomatik doldurulan her baytı, kaynağıyla birlikte listeler:

| Bayt | Hex | Kaynak |
|---|---|---|
| B32 | 00 | sabit (tüm araçlarda aynı) |
| B2 | 6A | en sık (%51 araçta) |
| B23 | 75 | en sık (%10 araçta) |

%10 gibi düşük bir değer zayıf bir tahmindir. Aracınızla karşılaştırın.

## Hangi alanlar önemli

- **Araç / donanım** — donanımla ilgili veri baytları.
- **VIN** — 17 haneli VIN. Aşağıya bakın.
- **Kuyruk bloğu** — sonundaki pazar bloğu. `Otomatik` en yaygın varyantı seçer.
- **Donör kod** — isteğe bağlı.

## VIN ile ilgili davranış

Program hangi durumda olduğunuzu gösterir:

- **VIN gerekli** (turuncu rozet) — VIN baytları araçtan araca değişir. VIN'i
  girmezseniz değer tahmin edilir ve bu bildirilir.
- **VIN gerekmiyor** (yeşil rozet) — VIN baytları tüm araçlarda aynıdır; program
  kendisi doldurur.

Yalnızca VIN 7, 8 ve 13–17. konumları kodlanır. Bayt 1 ve bayt 3 model kodunu taşır
(VIN 7 ve 8. karakterler); kalan VIN baytları **sayısal** olarak, aileye göre
değişen bir ofsetle yazılır.

Ofsetler tahmin edilmez, gözlem verisinden türetilir:

| Aile | Bayt 5 | Bayt 7 | Bayt 9 | Bayt 13 |
|---|---|---|---|---|
| MQB_MK100 | +0x20 | +0x6C | +0x77 | +0xC3 |
| COMPACT_1K0 | +0x22 | — | +0x0B | +0x19 |

Bu alanlar yalnızca rakam kodladığı için VIN 13–17. konumundaki bir **harf**
temsil edilemez. Program yanlış bayt yazmak yerine bunu bildirir.

## Donör kodu kullanmak

En güvenilir temel, benzer bir aracın gerçek kodlamasıdır. **Benzer araç seç**
listesinden birini seçin veya kendi okuduğunuz bir kodu yapıştırın.

Donör **aynı aileden** olmalıdır. Farklı bir modülün kodu, ayna kuralını sağlayan
ama yanlış baytlardan oluşan bir blok üretir.

## Kuyruk bloğu

Sondaki baytlar pazar ve donanım yapılandırmasını taşır. Açılır liste gözlenen
varyantları paylarıyla listeler. `Otomatik` en yaygın olanı seçer.

## Sonucu doğrulamak

Aracınıza yazmadan önce:

1. Ayna özetini kontrol edin — `n/n` olmalı.
2. Otomatik doldurma tablosunun her satırını okuyun ve zayıf olanları düzeltin.
3. Üretilen kodu orijinalle bayt bayt karşılaştırın.