# Generating a coding

[English](Generating.md) · [Türkçe](Türkçe/Generating.md)


The Generate tab builds a long coding from what you know about the vehicle.

## You do not need a donor code

A donor code is **optional**. Any byte you do not specify is resolved automatically:

1. the value you selected,
2. the donor code, if you supplied one,
3. the **most common** value observed across that family's real vehicles,
4. a value that is identical on every vehicle of that family.

The result table lists every byte that was filled automatically, together with its
source and — for the most-common case — the share of vehicles that carried it:

| Byte | Hex | Source |
|---|---|---|
| B32 | 00 | constant (same on every vehicle) |
| B2 | 6A | most common (51 % of vehicles) |
| B23 | 75 | most common (10 % of vehicles) |

A value at 10 % is a weak guess. Check it against your vehicle.

## Which fields matter

- **Vehicle / equipment** — the equipment-related data bytes.
- **VIN** — the 17-character VIN. See below.
- **Tail block** — the market-specific block at the end. `Auto` uses the most
  common variant.
- **Donor coding** — optional, see below.

## VIN handling

The program tells you which case you are in:

- **VIN required** (amber badge) — the VIN bytes differ between vehicles. Supply
  the VIN or the value will be estimated and reported.
- **VIN not required** (green badge) — the VIN bytes are identical across all
  vehicles in this family; the program fills them.

Only VIN positions 7, 8 and 13–17 are encoded. Byte 1 and byte 3 carry the model
code (VIN positions 7 and 8); the remaining VIN bytes are encoded **numerically**,
with an offset that differs per family.

The offsets are derived from observed data, not assumed. For example:

| Family | Byte 5 | Byte 7 | Byte 9 | Byte 13 |
|---|---|---|---|---|
| MQB_MK100 | +0x20 | +0x6C | +0x77 | +0xC3 |
| COMPACT_1K0 | +0x22 | — | +0x0B | +0x19 |

Because these fields encode digits only, a **letter** at VIN position 13–17 cannot
be represented. The program says so instead of writing a wrong byte.

## Using a donor code

The most reliable base is a real coding from a comparable vehicle. Pick one from
the **Pick a similar vehicle** list, or paste a code you read yourself.

A donor must come from the **same family**. A coding from a different module will
produce a block with wrong bytes that still satisfies the mirror rule.

## Tail block

The trailing bytes carry market and equipment configuration. The dropdown lists
observed variants with their share. `Auto` picks the most common one.

## Verifying the result

Before writing anything to a vehicle:

1. Check the mirror summary — it must be `n/n`.
2. Read every row in the automatic-fill table and correct the weak ones.
3. Compare the generated coding against the original byte by byte.