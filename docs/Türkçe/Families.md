# Modül aileleri

[English](Families.md)

## Bayt uzunluğu araca göre değil, parça numarasına göre belirlenir

Bunu anlamak en önemli nokta. Aynı araç modeli farklı kontrol üniteleri
taşıyabilir:

| Araç | Görülen bayt uzunlukları |
|---|---|
| Golf AU | 29, 30, 31, 47, 48 |
| Superb III (NP) | 30, 31, 47 |
| Tiguan 5N | 31, 47, 48 |

Yani "Golf'im var, hangi aile?" sorusu yanlıştır. Doğru soru:
**parça numarası ne?**

## Parça numarasını tanımak

Parça numarası kontrol ünitesinin etiketinde yazılıdır, örneğin `5Q0 614 517 DG`.
İlk grup platform kodu, ikinci grup ünite serisini ayırır.

| Platform | Aile |
|---|---|
| `5Q0`, `3Q0` | Continental MK100 — MQB |
| `5WA`, `3QG` | Continental MK100 — MQB-A0 |
| `1K0`, `6R0`, `1S0` | MK60EC1 / kompakt |
| `8W0`, `4M6`, `4M8` | Bosch ESP9 |
| `2Q0`, `6R0 614` | Continental MK70 / PQ46 |
| `1EA` | MK100 — elektrikli |
| `2H0`, `7E0` | kompakt 15 bayt |
| `4G0`, `4H0` | 4G0 907 |
| `8K0`, `8R0` | 8K0 / 8R0 907 |
| `6C0` | 6C0 907 |
| `5N0` | 5N0 614 |

## Aileler

| Aile | Kodlar | Bayt | Kayıt | Üretim |
|---|---|---|---|---|
| MQB_MK100 | 5Q0, 3Q0 | 29–48 | 156 | var |
| MQB_A0_5WA | 5WA, 3QG | 35 | 5 | var |
| MQB_44 | 5Q0 | 44 | 1 | yok |
| EV_1EA | 1EA | 47 | 4 | yok |
| COMPACT_1K0 | 1K0, 6R0, 1S0 | 18–20 | 107 | var |
| COMPACT_15 | 2H0, 7E0 | 15 | 2 | yok |
| ESP9_31 | 8W0, 4M6, 4M8 | 31 | 10 | var |
| PQ46_2Q0 | 2Q0, 6R0 | 53 | 6 | var |
| PQ46_59 | 2Q0 | 59 | 3 | yok |
| SHORT_24_5N0 | 5N0 | 24 | 3 | yok |
| SHORT_10_4G0 | 4G0, 4H0 | 10 | 14 | yok |
| TINY_8K0 | 8K0, 8R0 | 3–4 | 14 | yok |
| SINGLE_26_6C0 | 6C0 | 26 | 1 | yok |

Üretim yalnızca ayna kuralı gerçek araçlarla doğrulanan ailelerde açıktır.
Tüm aileler çözümleme için kullanılabilir.

## İsimlendirme

`COMPACT_1K0`, farklı kaynakların farklı isimler verdiği üniteyi kapsar.
`1K0 907 379` ünitesi MK60EC1, MK60 ya da "Golf 5/6 ABS modülü" diye anılır.
Belirsizliği önlemek için platform kodu kullanılır.

## İki ailenin örtüştüğü durumlar

`PQ46_2Q0` (53 bayt) ve `PQ46_59` (59 bayt) ön eki aynıdır ama kuyrukta
**farklı ayna haritalarına** sahiptir. Seçimden önce bayt sayısını kontrol edin.

MQB_MK100 içinde de aynı durum geçerlidir: 47 ve 48 baytlık üniteler aynı ayna
kuralını kullanır.