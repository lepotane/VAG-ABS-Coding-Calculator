# Decoding a coding

[Türkçe](Türkçe/Decoding.md)

The Decode tab turns a raw long coding into a byte-by-byte explanation and checks
whether the block is internally consistent.

## Steps

1. Select the **Family / Platform** that matches the control unit.
2. Enter the byte length if it is not the recommended one.
3. Paste the long coding — spaces are optional.
4. Press **Decode**.

```
1E 07 6A 9C 34 23 23 74 47 80 06 08
```

and

```
1E076A9C342323744780 0608
```

are the same thing.

## Reading the result

### Header

- **Bytes** — how many bytes were read.
- **Mirror check** — `8/8` means every mirror pair is correct.
- **Errors** — how many structural problems were found.

### Vehicle identification

If the VIN bytes resolve to a known model code, the program names the vehicle and
year. This is a useful cross-check that you picked the right family.

### The byte table

Each row shows:

| Column | Meaning |
|---|---|
| **Byte** | Position in the block |
| **Hex** | The byte value |
| **Binary** | The same byte as bits |
| **Role** | What this byte controls |
| **Meaning** | The decoded value, from the source tables |
| **Evidence** | Where the meaning comes from |

**Evidence** matters. Three labels appear:

- **Source text** — the meaning comes from the original documentation.
- **Observed** — the meaning was inferred from real vehicles carrying this value.
- **Unknown** — no description exists; only the fact that it was seen in *n* vehicles.

A byte showing "12 vehicles" was seen in twelve real vehicles but nobody has
documented what it does. It is not a guess presented as a fact.

### Mirror rows

Mirror bytes are shaded and show which byte they mirror. A correct mirror displays a
check mark; a broken one displays a cross and shows the expected value.

## Choosing the right family

Getting the family wrong is the most common source of confusion. The byte length is
the quickest clue, but it is **not** determined by the vehicle — see
[Module families](Families.md).

If the result looks implausible (every byte unknown, mirror check failing), the
family is probably wrong.