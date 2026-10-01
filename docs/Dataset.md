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

## How the dataset is grown

The current 363 records were produced from a candidate pool of 930 observations. A
record only enters the dataset if it passes **every** check below; anything that fails
is dropped rather than guessed at.

| Check | Rejected |
|---|---|
| Coding is complete (no truncated blocks) | 90 |
| Confidence ≥ 85 | 63 |
| Confirmed in at least two independent source pools | 536 |
| Not all-zero | 42 |

That leaves 199 qualifying records. Each is then matched to a known family by **part
series and byte length together** — matching on part series alone is not enough, because
several series share a prefix. 196 matched; 3 did not and were dropped. Of those 196,
159 were duplicates of records already in the dataset and **37 were new unique codings**,
taking the dataset from 326 to 363.

A full ledger lives in `statistics.filter_accounting` in the dataset file, so the
numbers above can always be checked against the data:

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

Two lessons worth keeping:

- **Do not invent a family to hold new records.** During this expansion three candidate
  families (`MK100_IPB`, `MK60EC1`, `ESP9_MQB`) looked new but were already-known
  families under different names — identical part series, identical byte lengths and an
  identical mirror map. Folding them into the existing families kept the *verified*
  mirror rules and re-validated them against the extra data, which is far safer than
  deriving a mirror map from a handful of observations.
- **Watch for truncated captures.** 142 candidates looked like short 4-byte codings but
  were partial blocks (`0000…`), belonging to modules whose real coding is much longer.
  A minimum byte count is a cheap, effective guard.

## Record the hardware and software

`hardware` and `software` are what make a record useful for generation.

One family covers many control-unit versions and the byte values differ between them.
Without these two fields a record contributes to every version's statistics, and the
"most common value" can then come from a different car. A real 2019 Skoda Superb III
(`5Q0 614 517 DG`, HW H62, SW 0654) had 11 of its 47 bytes filled from other vehicles'
recordings, and the control unit rejected the coding.

So when adding a record:

- **Always fill `hardware` and `software`** if the source states them.
- Keep the exact strings. `H62` and `h62` are different keys; `0654` and `654` are
  different keys.
- Report unknown as `null` rather than guessing. A missing value narrows nothing; a
  wrong one puts the record into a version it does not belong to.

`statistics.filter_accounting` reports how many records matched each version, and the
Generate tab shows the same number live. A version with only one or two records cannot
support generation — that is reported as unverified rather than silently trusted.

## Sources

Sources are declared once in `source_registry` and mirrored into the `sources` array:

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

Every observation's `source` field holds the label shown in the Decode tab, and
`source_id` points back at the originating record. When adding data from a new place,
add it to `source_registry` too rather than writing the name inline.

## Status values

| Status | Meaning |
|---|---|
| `reference` | Meaning taken from a reference byte-meaning table |
| `observed` | Seen in real vehicles, meaning inferred |
| `no_description` | Seen but undocumented |

Use the weakest status that is true. Do not upgrade an inferred meaning to
`reference` without a source.