# The mirror rule

[English](Mirror-Rule.md) · [Türkçe](Türkçe/Mirror-Rule.md)


## What it is

ABS control units repeat part of their data later in the block, with the bits
reversed:

```
bitrev(byte[N]) == byte[M]
```

`bitrev` reverses the bit order of a byte:

```
0x1E = 0001 1110  ->  0111 1000 = 0x78
```

## Why it exists

The redundant copy is a checksum-like integrity mechanism. If the flash or the
transmission corrupts the primary byte, the comparison against the reversed copy
fails and the control unit flags the block. Some units also use the copy for
cross-checks between redundant data sets.

This is why a mirrored byte can never be set independently: if you change byte 0 you
**must** change byte 15 to its bit-reversal, or the unit may reject the block.

## Why the pairs differ per family

The rule is the same everywhere; the **map** is not.

| Family | Pairs |
|---|---|
| MQB_MK100 | 0→15, 2→16, 4→17, 6→18, 8→19, 10→20, 12→21, 14→22 |
| COMPACT_1K0 | 0→8, 2→10, 4→12, 6→14 |
| ESP9_31 | 0→19 … 14→26, plus 15→27, 16→28 |
| PQ46_2Q0 | 0→6, 2→8, 4→10, then 12→29, 14→30, 15→31 … |
| MQB_A0_5WA | 0↔2, 4↔6, 10↔12, 14↔15 (adjacent swap) |

Getting a family's map wrong produces a block that looks structurally valid but is
not. That is why the maps are verified against real vehicles rather than inferred
from a pattern.

## Verification

Every family's map is tested against that family's real vehicle records:

```
COMPACT_1K0        512/512     100.00 %
ESP9_31            100/100     100.00 %
EV_1EA              80/80      100.00 %
MQB_44               5/5       100.00 %
...             
total             2308/2309     99.96 %
```

The validator rejects any map below 90 %.

## Known exception

One Skoda Karoq record — `5Q0 614 517 DN`, HW H82 / SW 0113 — has
`byte2 = 6A` where `byte16 = 58`. The expected value is `56` (`bitrev(0x6A) = 0x56`).

This is a deviation in a single source record, most likely a mis-scan or a genuine
out-of-spec unit. The program keeps the map unchanged and records the exception,
visible in the Dataset tab. Changing a rule to accommodate one faulty record would
break the other 155.

## Families without a rule

`COMPACT_15` and `TINY_8K0` have no verifiable mirror map. They are decode-only.
Rather than guess, the program says so.