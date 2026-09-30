# Ayna kuralı

[English](Mirror-Rule.md)

## Nedir

ABS kontrol üniteleri verinin bir kısmını blok içinde daha sonra, **bitleri ters
çevrilmiş** olarak tekrar eder:

```
bitrev(byte[N]) == byte[M]
```

`bitrev` bir baytın bit sırasını tersine çevirir:

```
0x1E = 0001 1110  ->  0111 1000 = 0x78
```

## Neden var

Yedek kopya bir bütünlük mekanizmasıdır. Flash veya iletim birincil baytı bozarsa
ters çevrilmiş kopyayla karşılaştırma başarısız olur ve ünite bloğu hatalı işaretler.
Bazı üniteler kopya yedek veri kümeleri arasında çapraz kontrol için de kullanır.

Bu yüzden bir ayna baytı asla bağımsız ayarlanamaz: bayt 0'ı değiştirdiyseniz
bayt 15'i de **bitrevi** yapmanız gerekir, aksi halde ünite bloğu reddedebilir.

## Çiftler neden aileye göre değişir

Kural her yerde aynıdır; **harita** değişir.

| Aile | Çiftler |
|---|---|
| MQB_MK100 | 0→15, 2→16, 4→17, 6→18, 8→19, 10→20, 12→21, 14→22 |
| COMPACT_1K0 | 0→8, 2→10, 4→12, 6→14 |
| ESP9_31 | 0→19 … 14→26, ayrıca 15→27, 16→28 |
| PQ46_2Q0 | 0→6, 2→8, 4→10, ardından 12→29, 14→30, 15→31 … |
| MQB_A0_5WA | 0↔2, 4↔6, 10↔12, 14↔15 (komşu değişim) |

Bir ailenin haritasını yanlış almak, yapısal olarak geçerli görünen ama gerçekte
olmayan bir blok üretir. Bu yüzden haritalar bir kalıptan tahmin edilmek yerine
gerçek araçlarla doğrulanır.

## Doğrulama

Her ailenin haritası o ailenin gerçek araç kayıtlarıyla sınanır:

```
MQB_MK100       1247/1248   %99.92
COMPACT_1K0      428/428   %100.00
ESP9_31          100/100   %100.00
PQ46_2Q0         126/126   %100.00
...
toplam          2096/2097   %99.95
```

Doğrulayıcı %90'ın altındaki her haritayı reddeder.

## Bilinen istisna

Tek bir Skoda Karoq kaydı — `5Q0 614 517 DN`, HW H82 / SW 0113 — `byte2 = 6A`
içerirken `byte16 = 58` yazıyor. Beklenen değer `56` (`bitrev(0x6A) = 0x56`).

Bu tek bir kaynak kaydında görülen bir sapmadır; muhtemelen hatalı bir okuma veya
gerçekten standart dışı bir ünite. Program haritayı değiştirmez, istisnayı kaydeder
ve Veri Seti sekmesinde gösterir. Tek bir hatalı kayıt için kuralı değiştirmek diğer
155'ini bozardı.

## Kuralı olmayan aileler

`COMPACT_15` ve `TINY_8K0` için doğrulanabilir ayna haritası yoktur. Yalnızca
çözümleme yaparlar. Program tahmin etmek yerine bunu açıkça söyler.