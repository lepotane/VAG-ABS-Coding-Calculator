# Veri setini genişletme

[English](../Dataset.md) · [Türkçe](Dataset.md)


Veri seti programın temel kaynağıdır. Bir modül ailesi eklemek veya düzeltmek
`src/data/mk100_dataset.json` dosyasını düzenlemektir — kaynak kod değil.

## Commit öncesi doğrula

```bash
npm run data:validate
```

Şunları kontrol eder:

1. şema sürümü ve zorunlu alanlar
2. her ailenin bayt şablonu varsayılan uzunluğuyla eşleşiyor
3. ayna çiftleri bayt aralığının içinde
4. ayna işaretli baytlar haritada mevcut
5. her VIN baytında `vin_digit` var
6. gözlemler bilinen bir aileye referans veriyor ve geçerli hex bayt içeriyor
7. 363 gözlemin tamamı beklenen satır sayısına çözülüyor
8. her ailenin ayna kuralı kendi kayıtlarında geçerli
9. VIN bayt konumları bilinen değerler

Hata durumunda sıfırdan farklı bir kodla çıkar ve bir yayını engellemelidir.

## Aile ekleme

```json
"PART46_53": {
  "id": "PART46_53",
  "label": "Continental MK70 (53 bayt)",
  "engine": "pq46",
  "part_series": ["2Q0 614"],
  "default_length": 53,
  "lengths": [53],
  "mirror_map": { "0": 6, "2": 8, "4": 10 },
  "byte_template": [
    { "index": 0, "kind": "data", "name": "Araç",
      "values": { "40": { "meaning": "FWD", "status": "observed" } } },
    { "index": 1, "kind": "vin", "vin_digit": 7 },
    { "index": 6, "kind": "mirror", "mirror_of": 0 }
  ],
  "observation_count": 0,
  "vehicles": "...",
  "note_key": "pq46_twin_block"
}
```

### `kind` değerleri

| Değer | Anlamı |
|---|---|
| `data` | Donanım veya yapılandırma verisi |
| `vin` | VIN karakteri kodlar; `vin_digit` zorunlu |
| `mirror` | Başka bir bayttan hesaplanır; `mirror_of` zorunlu |
| `equipment` | Donanım bit alanı |
| `tail` | Pazara özel son blok |

### Profili kaydet

Ailenin arayüzde görünmesi ve motor yönlendirmesi için `src/core/profiles.js`
dosyasına bir giriş ekleyin. Ayna kuralı doğrulanmadıysa `supported: false`
yapın.

## Ayna haritaları için kurallar

- Haritayı gerçek araç kayıtlarından türetin. Bir ailenin başkasını izlediğini
  varsaymayın.
- Doğrulayıcıyı çalıştırın ve özetini pull request'e yapıştırın.
- Tek bir kayıt geçsin diye kuralı gevşetmeyin.

## Gözlem ekleme

Gözlemler gerçek araç kodlarıdır. Yararlı ek alanlar:

```json
{
  "family": "COMPACT_1K0",
  "vehicle": "Volkswagen Golf 2014",
  "model_code": "5G",
  "year": "2014",
  "part_number": "1K0 907 379 Q",
  "hardware": "H46",
  "software": "0188",
  "part_series": "1K0 907",
  "bytes": ["10", "2A", "80", "0C", "31", "25", "00", "2B"],
  "byte_count": 8,
  "coding": "102A800C3125002B",
  "source": "vagcode.info/address-03",
  "source_id": "..."
}
```

VIN'i maskeleyin veya hiç eklemeyin. **Asla tam VIN eklemeyin.**

## Veri seti nasıl büyütülür

Mevcut 363 kayıt, 930 gözlemlik bir aday havuzdan üretildi. Bir kayıt ancak aşağıdaki
kontrollerin **tamamından** geçerse veri setine girer; geçemeyen kayıt tahmin edilerek
değil, elenir.

| Kontrol | Elenen |
|---|---|
| Kodlama eksiksiz (kırpılmış blok yok) | 90 |
| Güven ≥ 85 | 63 |
| En az iki bağımsız kaynak havuzunda doğrulanmış | 536 |
| Tamamı sıfır değil | 42 |

Böylece 199 uygun kayıt kalır. Her kayıt sonra **parça serisi ve bayt uzunluğu birlikte**
kullanılarak bilinen bir aileye eşleştirilir — yalnızca parça serisine bakmak yeterli
değildir, çünkü birçok seri aynı öneki paylaşır. 196'sı eşleşti, 3'ü eşleşmediği için
elendi. Bu 196'nın 159'u veri setinde zaten olan kayıtların aynısıydı; **37'si yeni
benzersiz kodlamaydı** ve veri seti 326'dan 363'e çıktı.

Tam hesap veri seti dosyasındaki `statistics.filter_accounting` alanında durur, böylece
yukarıdaki sayılar her zaman veriyle karşılaştırılabilir:

```json
"filter_accounting": {
  "pool_records": 930,
  "rejected_all_zero": 42,
  "rejected_low_confidence": 63,
  "rejected_single_pool": 536,
  "rejected_truncated": 90,
  "passed_filter": 199,
  "assigned_to_registry_family": 196,
  "unmatched_family": 3,
  "duplicate_of_existing": 159,
  "added": 37
}
```

Öğrenilmesi gereken iki ders:

- **Yeni kayıtları tutmak için aile uydurmayın.** Bu genişleme sırasında üç aday aile
  (`MK100_IPB`, `MK60EC1`, `ESP9_MQB`) yeni görünüyordu ama aslında farklı adlarla
  kayıtlı, çoktan bilinen ailelerdi: parça serileri, bayt uzunlukları ve ayna haritaları
  birebir aynıydı. Bunları mevcut ailelere katmak **kanıtlı** ayna kurallarını korudu ve
  ek veriyle yeniden doğruladı — birkaç gözlemden yeni ayna haritası türetmekten çok
  daha güvenlidir.
- **Kırpılmış okumalara dikkat.** 142 aday 4 baytlık kısa kodlama gibi görünüyordu ama
  aslında kısmi bloklardı (`0000…`) ve gerçek kodlaması çok daha uzun modüllere
  aitlerdi. Bir bayt sayısı alt sınırı, ucuz ve etkili bir koruma.

## Kaynaklar

Kaynaklar `source_registry` içinde bir kez tanımlanır ve `sources` dizisine yansıtılır:

```json
"source_registry": [
  {
    "id": "vagcode_info",
    "label": "vagcode.info - Address 03 (ABS)",
    "url": "https://vagcode.info/en/components/address-03",
    "kind": "web"
  }
]
```

Her gözlemin `source` alanı Çözümle sekmesinde gösterilen etikettir, `source_id` ise
kaynak kayda geri götürür. Yeni bir yerden veri eklerken adı satır içine yazmak yerine
`source_registry`'e de ekleyin.

## Durum değerleri

| Durum | Anlamı |
|---|---|
| `reference` | Anlam referans bayt anlam tablosundan alındı |
| `observed` | Gerçek araçlarda görüldü, anlam çıkarıldı |
| `no_description` | Görüldü ama belgelenmemiş |

Doğru olan en zayıf durumu kullanın. Kaynaksız bir anlamı `reference` seviyesine
çıkarmayın.