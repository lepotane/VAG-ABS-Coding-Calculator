# Generating a coding

[English](Generating.md) · [Türkçe](Türkçe/Generating.md)


The Generate tab builds a long coding from what you know about the vehicle.

## You do not need a donor code

A donor code is **optional**. Any byte you do not specify is resolved automatically:

1. the value you selected,
2. the donor code, if you supplied one,
3. the **most common** value observed for your hardware/software version,
4. a value that is identical on every vehicle of that version.

Step 3 depends on the hardware and software fields. Without them the search falls back
to the whole family, which can produce values for the wrong car — so the result is then
reported as **not writable**. Enter the version to narrow it.

The result table lists every byte that was filled automatically, together with its
source and - for the most-common case - the share of vehicles that carried it:

| Byte | Hex | Source |
|---|---|---|
| B32 | 00 | constant (same on every vehicle) |
| B2 | 6A | most common (51 % of vehicles) |
| B23 | 75 | most common (10 % of vehicles) |

A value at 10 % is a weak guess. Below 60 % agreement it is listed as unverified rather
than accepted.

## Enter the hardware and software version first

This is the field that matters most, so it is the first card in the Generate tab.

One family can cover **a dozen control-unit versions**. The byte values differ between
them — the ABS sensor layout alone is different — so the "most common value" across
the whole family can belong to a completely different car.

Measured on a real 2019 Skoda Superb III (`5Q0 614 517 DG`, HW H62, SW 0654):

| Entered | Bytes correct | Writable |
|---|---|---|
| nothing | 36 of 47 | **no** |
| HW only | 36 of 47 | **no** |
| HW + SW | 47 of 47 | **no** (only one observation exists) |

Without the version, the program proposed a Golf's brake system and sensor layout for a
Superb, and the control unit rejected the coding.

Entering HW and SW narrows the observation pool to the version at hand. A picker lists
every version known for the selected family, and the scope line shows how many
observations matched.

## When the program says "not writable"

A code is only reported as writable when every byte is either:

- **chosen by you**, or
- **verified from data** — at least 3 observations agree and the most common value
  holds at least 60 % of them.

Otherwise the byte is listed under *unverified bytes* and the result is marked
**not writable**. This is not a bug report — it means the dataset cannot support that
byte for your version. The code is still shown so you can inspect it, but do not write
it.

Mirror bytes inherit the confidence of the byte they are derived from: if byte 6 is
unverified, byte 18 is unverified too.

Ways to reach a writable result:

1. **Supply your vehicle's current coding as a donor.** This is the safest route and
   needs no extra data — the bytes you did not touch stay as they are.
2. Choose each remaining byte explicitly from the list.
3. Add observations for your version to the dataset.

## Which fields matter

- **Hardware / software** — narrows the observation pool. See above.
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