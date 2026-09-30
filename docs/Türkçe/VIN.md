# VIN çözümleme

[English](VIN.md)

## Yapı

VIN 17 karakterdir. Programın çıkardığı alanlar:

```
TMBJ  5 1B2C3D4E5F6G7
│    │ │││││││││││└─ konum 17   seri
│    │ ││││││││││└── konum 14   model yılı kodu
│    │ │││││││││└─── konum 13   model yılı kodu
│    │ ││││││││└──── konum 10   fabrika
│    │ │││││││└───── konum 9    kontrol hanesi
│    │ ││││││└────── konum 5-8  model kodu / model
│    │ │││││└─────── konum 4    model
│    └─┴┴┴┴┴└─────── konum 1-3  WMI (üretici)
```

| Alan | Değer | Anlamı |
|---|---|---|
| WMI | `TMBJ` | Škoda, Çek Cumhuriyeti |
| Model kodu | `NP` | Superb III |
| Model yılı | — | konum 10'dan türetilir |

## VIN sekmesi

Bir VIN yapıştırın; program her alanı bilinen bir etiketle çözer.

**Bilinmiyor** etiketi karakterin tabloların dışında olduğu anlamına gelir; eski
araçlar ve kapsanmayan pazarlar için normaldir.

## Kodlamada VIN

Uzun kodlama VIN'in tamamını saklamaz. Şunları saklar:

- **7. ve 8. konumlar** iki baytta (model kodu),
- **13–17. konumlar** sayısal olarak, aileye özgü ofsetle, birer baytta.

Bu yüzden program çapraz kontrol yapabilir: kod `CA` model koduna çözülüyor ama
VIN `NP` diyorsa aile büyük olasılıkla yanlıştır.

## Model kodları

Bu veri setinde yalnızca **iki karakterli** kodlar vardır — 77 farklı kodun
tamamı iki karakter. `60` ve `61`'in rakam olduğunu unutmayın; `[A-Z]{2}` gibi bir
desen onları sessizce düşürür.

Bir kod birden fazla modelde görünebilir. `3C` Passat B6, B7 ve B8'i kapsar;
`5N` dört Tiguan neslini; `8V` hem A3 kasa tiplerini.

## Maskeleme

Bir issue veya forum gönderisine **asla tam VIN koymayın**. Orta karakterleri
maskeleyin:

```
TMBJ*****796
```