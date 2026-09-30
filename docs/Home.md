# VAG ABS Coding Calculator — Wiki

[English](Home.md) · [Türkçe](Home.tr.md)


## Contents

1. [Home](Home.md) — overview
2. [Installation](Installation.md) — Windows, macOS, Linux
3. [Decoding a coding](Decoding.md) — how the Decode tab works
4. [Generating a coding](Generating.md) — how the Generate tab works
5. [VIN decoding](VIN.md) — VIN structure and the VIN tab
6. [Module families](Families.md) — the 13 families and how to identify one
7. [The mirror rule](Mirror-Rule.md) — what it is and why it exists
8. [Extending the dataset](Dataset.md) — adding a family
9. [Building from source](Building.md) — development setup

## What this program is

A desktop tool that reads and generates ABS/ESP long coding for VAG vehicles.
It works entirely offline: the dataset is bundled with the application.

The program does **not** talk to a vehicle. It has no CAN or diagnostic interface.
You copy a coding out of the control unit, decode it here, understand it, modify
what you need, generate a new coding and write it back with your own diagnostic
tool.

> ⚠️ Always back up the original coding before writing. Even an accepted coding
> may leave fault codes.

## Design principles

**The dataset is the program.** Byte roles, mirror maps and VIN offsets live in
`src/data/mk100_dataset.json`, not in code. Adding a module family means editing
data, not code.

**Everything is derived from real vehicles.** A mirror map is only accepted if it
holds for that family's real vehicle records. The validator reports the pass ratio
and rejects anything below 90 %.

**Nothing is hidden.** When a byte cannot be resolved from your input, the program
uses the most frequently observed value and says so, with the percentage of
vehicles that carried it.

**Two languages, no mixing.** Turkish and English are complete and separate.
Changing the language changes every string, including error messages.