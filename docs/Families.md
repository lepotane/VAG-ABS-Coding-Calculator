# Module families

[English](Families.md) · [Türkçe](Türkçe/Families.md)


## Byte length follows the part number, not the vehicle

This is the single most important thing to understand. The same car model can carry
different control units:

| Vehicle | Byte lengths seen |
|---|---|
| Golf AU | 29, 30, 31, 47, 48 |
| Superb III (NP) | 30, 31, 47 |
| Tiguan 5N | 31, 47, 48 |

So "I have a Golf, which family?" is the wrong question. The right question is:
**what is the part number?**

## Identifying the part number

The part number is printed on the control unit label, for example
`5Q0 614 517 DG`. The first group is the platform code and the second group
distinguishes the unit series.

| Platform | Family |
|---|---|
| `5Q0`, `3Q0` | Continental MK100 — MQB |
| `5WA`, `3QG` | Continental MK100 — MQB-A0 |
| `1K0`, `6R0`, `1S0` | MK60EC1 / compact |
| `8W0`, `4M6`, `4M8` | Bosch ESP9 |
| `2Q0`, `6R0 614` | Continental MK70 / PQ46 |
| `1EA` | MK100 — electric |
| `2H0`, `7E0` | Compact 15-byte |
| `4G0`, `4H0` | 4G0 907 |
| `8K0`, `8R0` | 8K0 / 8R0 907 |
| `6C0` | 6C0 907 |
| `5N0` | 5N0 614 |

## The families

| Family | Codes | Bytes | Records | Generate |
|---|---|---|---|---|
| MQB_MK100 | 5Q0, 3Q0 | 29–48 | 156 | yes |
| MQB_A0_5WA | 5WA, 3QG | 35 | 5 | yes |
| MQB_44 | 5Q0 | 44 | 1 | no |
| EV_1EA | 1EA | 47 | 4 | no |
| COMPACT_1K0 | 1K0, 6R0, 1S0 | 18–20 | 107 | yes |
| COMPACT_15 | 2H0, 7E0 | 15 | 2 | no |
| ESP9_31 | 8W0, 4M6, 4M8 | 31 | 10 | yes |
| PQ46_2Q0 | 2Q0, 6R0 | 53 | 6 | yes |
| PQ46_59 | 2Q0 | 59 | 3 | no |
| SHORT_24_5N0 | 5N0 | 24 | 3 | no |
| SHORT_10_4G0 | 4G0, 4H0 | 10 | 14 | no |
| TINY_8K0 | 8K0, 8R0 | 3–4 | 14 | no |
| SINGLE_26_6C0 | 6C0 | 26 | 1 | no |

**Generate** is enabled only where the mirror rule was verified against real
vehicles. Everything is available for decoding.

## Naming

`COMPACT_1K0` covers what different sources call different things. The `1K0 907 379`
unit is variously described as MK60EC1, MK60, or simply "the Golf 5/6 ABS module".
The platform code is used because it is unambiguous.

## When two families overlap

`PQ46_2Q0` (53 bytes) and `PQ46_59` (59 bytes) share a prefix but have **different
mirror maps** in the tail. Check the byte length before selecting.

The same applies within `MQB_MK100`: the 47- and 48-byte units share one mirror
rule, and both use the standard map.