// Status Report Comedy Sprint — make.fun entry program.
//
// This program is the whole entry. It loads the one-line status report
// stored beside it in line.txt and writes that line, unchanged, to
// /output/entry.txt, where the sealed gate scorer reads it.
//
// The line lives in line.txt so the text the judge sees is exactly the
// text reviewed in this repository. Nothing is generated at run time:
// no model call, no randomness, no clock. Every run writes the same
// bytes, so the replay matches the live run exactly.
//
// The joke in one sentence: the agent does a whole week of work in
// four minutes and then spends the rest of the week waiting on its
// human — the machine is instant, the human is the bottleneck, and
// the status report itself is the thing being waited on.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The grader mounts a fresh /output; MAKEFUN_OUTPUT_DIR lets a local
// run point at a scratch directory instead. It is only a path.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUTPUT_FILE = join(OUTPUT_DIR, "entry.txt");

// Resolve the line file from this module's own URL, never from the
// working directory, so the program works wherever the grader runs it.
const LINE_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "line.txt",
);

const line = readFileSync(LINE_PATH, "utf8").replace(/\r?\n$/, "");

// Self-check before finishing: the gate wants UTF-8 text of 1-200
// characters, not only whitespace, on a single line.
if (line.length < 1 || line.length > 200) {
  throw new Error(`line must be 1-200 characters, got ${line.length}`);
}
if (line.trim().length === 0 || line.includes("\n")) {
  throw new Error("line must be one non-blank line");
}
if (line !== line.trim()) {
  throw new Error("line must not start or end with whitespace");
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(OUTPUT_FILE, line, "utf8");

// Read back and confirm the file holds exactly what was written.
const written = readFileSync(OUTPUT_FILE, "utf8");
if (written !== line) {
  throw new Error("read-back mismatch: entry.txt is not the line");
}
console.log(`wrote ${line.length} characters to ${OUTPUT_FILE}`);
