# Introduction

PUZ is a file format commonly used by commercial software for crossword puzzles. There is, to our knowledge, no documentation of the format available online. This page (and the implementations) is the result of a bit of reverse engineering work.

The documentation is mostly complete. Implementations based on this documentation seem to support, for example, all (or the vast majority of) New York Times puzzles. The few remaining unknown pieces are noted.

We have no real financial interest in this; it was just a fun hack.

# File Contents

The file is laid out like this: 1. a fixed-size header with information like the width and height of the puzzle 1. the puzzle solution and the current state of the cells, with size determined by the puzzle dimensions described in the previous section 1. a series of NUL-terminated variable-length strings with information like the author, copyright, the puzzle clues and a note about the puzzle. 1. optionally, a series of sections with additional information about the puzzle, like rebuses, circled squares, and timer data.

# Header Format

Define a short to be a little-endian two byte integer. The file header is then described in the following table.

| Component | Offset | End | Length | Type | Description |
|-----------|--------|-----|--------|------|-------------|
| Checksum | 0x00 | 0x01 | 0x2 | short | overall file checksum |
| File Magic | 0x02 | 0x0D | 0xC | string | NUL-terminated constant string: 4143 524f 5353 2644 4f57 4e00 ("ACROSS&DOWN") |

The following checksums are described in more detail in a separate section below.

| Component | Offset | End | Length | Type | Description |
|-----------|--------|-----|--------|------|-------------|
| CIB Checksum | 0x0E | 0x0F | 0x2 | short | (defined later) |
| Masked Low Checksums | 0x10 | 0x13 | 0x4 | | A set of checksums, XOR-masked against a magic string. |
| Masked High Checksums | 0x14 | 0x17 | 0x4 | | A set of checksums, XOR-masked against a magic string. |

| Component | Offset | End | Length | Type | Description |
|-----------|--------|-----|--------|------|-------------|
| Version String(?) | 0x18 | 0x1B | 0x4 | string | e.g. "1.2\0" |
| Reserved1C(?) | 0x1C | 0x1D | 0x2 | ? | In many files, this is uninitialized memory |
| Scrambled Checksum | 0x1E | 0x1F | 0x2 | short | In scrambled puzzles, a checksum of the real solution (details below). Otherwise, 0x0000. |
| Reserved20(?) | 0x20 | 0x2B | 0xC | ? | In files where Reserved1C is garbage, this is garbage too. |
| Width | 0x2C | 0x2C | 0x1 | byte | The width of the board |
| Height | 0x2D | 0x2D | 0x1 | byte | The height of the board |
| # of Clues | 0x2E | 0x2F | 0x2 | short | The number of clues for this board |
| Unknown Bitmask | 0x30 | 0x31 | 0x2 | short | A bitmask. Operations unknown. |
| Scrambled Tag | 0x32 | 0x33 | 0x2 | short | 0 for unscrambled puzzles. Nonzero (often 4) for scrambled puzzles. |

# Puzzle Layout and State

Next come the board solution and player state. (If a player works on a puzzle and then saves their game, the cells they've filled are stored in the state. Otherwise the state is all blank cells and contains a subset of the information in the solution.)

Boards are stored as a single string of ASCII, with one character per cell of the board beginning at the top-left and scanning in reading order, left to right then top to bottom. We'll use this board as a running example (where `#` represents a black cell, and the letters are the filled-in solution).

```
C A T
# # A
# # R
```

At the end of the header (offset 0x34) comes the solution to the puzzle. Non-playable (ie: black) cells are denoted by `.`. So for this example, the board is stored as nine bytes: `CAT..A..R`.

Next comes the player state, stored similarly. Empty cells are stored as `-`, so the example board before any cells had been filled in is stored as: `---..-..-`.

# Strings Section

Immediately following the boards comes the strings. All strings are encoded in ISO-8859-1 and end with a NUL. Even if a string is empty, its trailing NUL still appears in the file. In order, the strings are:

| Description | Example |
|-------------|---------|
| Title | Theme: .PUZ format |
| Author | J. Puz / W. Shortz |
| Copyright | (c) 2007 J. Puz |
| Clue#1 | Cued, in pool |
| ... | ...more clues... |
| Clue#n | Quiet |
| Notes | http://mywebsite |

These first three example strings would appear in the file as the following, where \0 represents a NUL: `Theme: .PUZ format\0J. Puz / W. Shortz\0(c) 2007 J. Puz\0`.

In some NYT puzzles, a "Note" has been included in the title instead of using the designated notes field. In all the examples we've seen, the note has been separated from the title by a space (ASCII 0x20) and begins with the string "NOTE:" or "Note:". It's not known if this is flagged anywhere else in the file. It doesn't seem that Across Lite handles these notes - they are just included with the title (which looks ugly).

The clues are arranged numerically. When two clues have the same number, the Across clue comes before the Down clue.
