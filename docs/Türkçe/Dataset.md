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
7. 326 gözlemin tamamı beklenen satır sayısına çözülüyor
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

## Durum değerleri

| Durum | Anlamı |
|---|---|
| `tested` | Özgün kaynak dokümanıyla doğrulandı |
| `observed` | Gerçek araçlarda görüldü, anlam çıkarıldı |
| `no_description` | Görüldü ama belgelenmemiş |

Doğru olan en zayıf durumu kullanın. Kaynaksız bir anlamı `tested` seviyesine
çıkarmayın.