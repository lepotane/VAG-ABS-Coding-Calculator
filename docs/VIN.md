# VIN decoding

[English](VIN.md) · [Türkçe](Türkçe/VIN.md)


## Structure

A VIN is 17 characters. The fields the program extracts:

```
TMBJ  5 1B2C3D4E5F6G7
│    │ ││││││││││││└─ position 17   serial
│    │ ││││││││││└── position 14   model year code
│    │ │││││││││└─── position 13   model year code
│    │ ││││││││└──── position 10   plant
│    │ │││││││└───── position 9    check digit
│    │ ││││││└────── positions 5–8 model code / model
│    │ │││││└─────── position 4    model
│    └─┴┴┴┴┴└─────── positions 1–3 WMI (manufacturer)
```

| Field | Value | Meaning |
|---|---|---|
| WMI | `TMBJ` | Škoda, Czech Republic |
| Model code | `NP` | Superb III |
| Model year | — | derived from position 10 |

## The VIN tab

Paste a VIN and the program resolves each field with a label where known.

An **unknown** label means the character is outside the tables; that is normal for
older vehicles and for markets not covered by the dataset.

## VIN in the coding

The long coding does not store the whole VIN. It stores:

- **positions 7 and 8** in two bytes (the model code),
- **positions 13–17** numerically, one byte each, using a per-family offset.

This is why the program can cross-check: if a coding decodes to model code `CA` but
the VIN says `NP`, the family is probably wrong.

## Model codes

Only **two-character** codes exist in this dataset — 77 distinct codes, all of
length two. Note that `60` and `61` are digits, not letters, so a pattern like
`[A-Z]{2}` will silently drop them.

Two codes can appear on more than one model. `3C` covers Passat B6, B7 and B8;
`5N` covers four Tiguan generations; `8V` covers both A3 body styles.

## Masking

Never post a complete VIN in an issue or a forum post. Mask the middle
characters:

```
TMBJ*****796
```