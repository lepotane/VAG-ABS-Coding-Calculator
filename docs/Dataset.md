# Extending the dataset

[English](Dataset.md) · [Türkçe](Türkçe/Dataset.md)


The dataset is the program's source of truth. Adding or correcting a module family
means editing `src/data/mk100_dataset.json` — not the source code.

## Validate before committing

```bash
npm run data:validate
```

This checks:

1. schema version and required fields
2. every family has a byte template matching its default length
3. mirror pairs stay inside the byte range
4. mirror-flagged bytes exist in the map
5. every VIN byte has a `vin_digit`
6. observations reference a known family and carry valid hex bytes
7. all 363 observations decode to the expected row count
8. each family's mirror rule passes on its own records
9. VIN byte positions are known

Any failure exits non-zero and must block a release.

## Adding a family

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

### `kind` values

| Value | Meaning |
|---|---|
| `data` | Equipment or configuration data |
| `vin` | Encodes a VIN character; requires `vin_digit` |
| `mirror` | Computed from another byte; requires `mirror_of` |
| `equipment` | Equipment bitfield |
| `tail` | Market-specific trailing block |

### Register the profile

Add an entry to `src/core/profiles.js` so the family appears in the interface and
engine routing. Set `supported: false` unless the mirror rule is verified.

## Rules for mirror maps

- Derive the map from real vehicle records. Do not assume a family follows another.
- Run the validator and paste the summary in your pull request.
- Do not relax a rule to make one record pass.

## Adding observations

Observations are real vehicle codes. Useful extra fields:

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

Mask or omit the VIN. Never add a full vehicle identification number.

## Status values

| Status | Meaning |
|---|---|
| `tested` | Confirmed by the original source documentation |
| `observed` | Seen in real vehicles, meaning inferred |
| `no_description` | Seen but undocumented |

Use the weakest status that is true. Do not upgrade an inferred meaning to
`tested` without a source.