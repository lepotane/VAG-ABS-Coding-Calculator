# Kod çözümleme

[English](Decoding.md)

Çözümleme sekmesi ham uzun kodlamayı bayt bayt açıklamaya çevirir ve bloğun
kendisiyle tutarlı olup olmadığını kontrol eder.

## Adımlar

1. Kontrol ünitesine uyan **Aile / Platform** seçeneğini seçin.
2. Önerilen değilse bayt sayısını girin.
3. Uzun kodlamayı yapıştırın — boşluklar isteğe bağlıdır.
4. **Çözümle** düğmesine basın.

Şu iki ifade aynıdır:

```
1E 07 6A 9C 34 23 23 74 47 80 06 08
```

```
1E076A9C342323744780 0608
```

## Sonucu okumak

### Başlık

- **Bayt** — okunan bayt sayısı.
- **Ayna kontrolü** — `8/8` her ayna çiftinin doğru olduğu anlamına gelir.
- **Hata** — yapısal sorun sayısı.

### Araç tanımlama

VIN baytları bilinen bir model koduna çözülürse program aracı ve yılı yazar.
Doğru aileyi seçtiğinizi doğrulamanın pratik bir yoludur.

### Bayt tablosu

Her satır şunları gösterir:

| Sütun | Anlamı |
|---|---|
| **Bayt** | Blok içindeki konum |
| **Hex** | Bayt değeri |
| **İkili** | Aynı baytın bit karşılığı |
| **Rol** | Bu baytın neyi kontrol ettiği |
| **Anlam** | Kaynak tablolardan çözülen değer |
| **Kanıt** | Anlamın nereden geldiği |

**Kanıt** sütunu önemlidir. Üç etiket görülür:

- **Kaynak metin** — anlam özgün dokümandan geliyor.
- **Gözlem** — anlam gerçek araçlardan çıkarıldı.
- **Bilinmiyor** — açıklama yok; yalnızca *n* araçta görüldüğü biliniyor.

"12 araçta görüldü" yazan bir bayt, on iki gerçek araçta karşılaşılmış ama ne
yaptığı kimse tarafından belgelenmemiş demektir. Bu tahmin değil, olgudur.

### Ayna satırları

Ayna baytları gölgeli gösterilir ve hangi baytı yansıttığini yazar. Doğru ayna
tik işareti, bozuk ayna çarpı işareti ve beklenen değeri gösterir.

## Doğru aileyi seçmek

Aileyi yanlış seçmek en sık karşılaşılan karışıklık nedenidir. Bayt sayısı en
hızlı ipucudur, ancak bayt sayısı **araç tarafından belirlenmez** —
[Modül aileleri](Families.md) sayfasına bakın.

Sonuç inandırıcı değilse (her bayt bilinmiyor, ayna kontrolü başarısız) büyük
olasılıkla aile yanlıştır.