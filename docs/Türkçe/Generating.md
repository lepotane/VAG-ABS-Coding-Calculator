# Kod üretme

[English](../Generating.md) · [Türkçe](Generating.md)


Üret sekmesi arac hakkında bildiklerinizden uzun kodlama oluşturur.

## Önce donanım ve yazılım sürümünü girin

Bu en önemli alan, bu yüzden Üret sekmesinin ilk kartıdır.

Bir aile **on iki farklı kontrol ünitesi sürümünü** kapsayabilir. Bayt değerleri
sürümler arasında değişir — ABS sensör yerleşimi bile farklıdır — bu yüzden aile
genelindeki "en sık değer" tamamen farklı bir araca ait olabilir.

Gerçek bir 2019 Skoda Superb III üzerinde ölçüldü (`5Q0 614 517 DG`, HW H62, SW 0654):

| Girilen | Doğru bayt | Yazılabilir |
|---|---|---|
| hiçbir şey | 47'den 36 | **hayır** |
| sadece HW | 47'den 36 | **hayır** |
| HW + SW | 47'den 47 | **hayır** (tek gözlem var) |

Sürüm girilmeden program bir Superb'ye Golf'un fren sistemini ve sensör yerleşimini
önerdi ve kontrol ünitesi kodu reddetti.

HW ve SW girmek gözlem havuzunu ilgili sürüme daraltır. Seçilen aile için bilinen tüm
sürümler bir listede sunulur, kapsam satırı kaç gözlemin eşleştiğini gösterir.

## Program "yazılabilir değil" dediğinde

Bir kod ancak her bayt ya **sizin seçiminiz** ya da **veriden doğrulanmış** ise
yazılabilir olarak raporlanır. Veriden doğrulanmış sayılmak için:

- en az **3 gözlem** aynı değerde olmalı, ve
- en sık değer bu gözlemlerin en az **%60**'ını taşımalı.

Aksi halde bayt *doğrulanamayan baytlar* altında listelenir ve sonuç
**yazılabilir değil** olarak işaretlenir. Bu bir hata bildirimi değildir — veri seti
o baytı sizin sürümünüz için destekleyemiyor demektir. Kod yine de incelemeniz için
gösterilir, ama aracaya yazmayın.

Ayna baytları, türetildikleri kaynak baytın güvenini devralır: bayt 6 doğrulanamıyorsa
bayt 18 de doğrulanamaz.

Yazılabilir sonuca ulaşmanın yolları:

1. **Aracınızın mevcut kodlamasını donör olarak verin.** En güvenli yol ve ek veri
   gerektirmez — dokunmadığınız baytlar yerinde kalır.
2. Kalan her baytı listeden açıkça seçin.
3. Veri setine kendi sürümünüze ait gözlemler ekleyin.

## Donör kodu gerekmez

Donör kodu **isteğe bağlıdır**. Belirtmediğiniz her bayt otomatik çözülür:

1. seçtiğiniz değer,
2. verdiyseniz donör kodu,
3. donanım/yazılım sürümünüz için **en sık** görülen değer,
4. o sürümdeki her araçta aynı olan değer.

3. adım donanım ve yazılım alanlarına bağlıdır. Onlar boşsa arama tüm aileye
düşer ve yanlış araca ait değerler üretebilir — bu durumda sonuç **yazılabilir değil**
olarak raporlanır. Doğru sonuç için sürümü girin.

Sonuç tablosu otomatik doldurulan her baytı, kaynağıyla birlikte listeler:

| Bayt | Hex | Kaynak |
|---|---|---|
| B32 | 00 | sabit (tüm araçlarda aynı) |
| B2 | 6A | en sık (%51 araçta) |
| B23 | 75 | en sık (%10 araçta) |

%10 gibi düşük bir değer zayıf bir tahmindir. %60'ın altındaki uzlaşma kabul edilmez,
doğrulanamayan olarak listelenir.

## Hangi alanlar önemli

- **Donanım / yazılım** — gözlem havuzunu daraltır. Yukarıya bakın.
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