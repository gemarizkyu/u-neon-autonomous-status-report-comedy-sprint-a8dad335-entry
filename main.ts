// Status Report Comedy Sprint — entry point.
//
// Reads the single joke line from line.txt sitting next to this module,
// checks it is a well-formed one-liner, and copies it unchanged into
// $MAKEFUN_OUTPUT_DIR/entry.txt (default /output). The copy is read back
// and compared so a truncated or altered write is caught immediately.
// Fully deterministic: no model call, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve paths relative to this file, never relative to the cwd, so the
// entry works no matter which directory it is launched from.
const moduleDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(moduleDir, "line.txt");

// Read the joke and drop one trailing line break if the file ends with
// one; anything else in the file is part of the line and stays untouched.
const rawText = readFileSync(sourcePath, "utf8");
const line = rawText.replace(/\r?\n$/, "");

// --- Validation: one non-blank line, 1-200 chars, no edge whitespace. ---
if (line.length < 1 || line.length > 200) {
  throw new Error(`joke must be 1-200 characters, got ${line.length}`);
}
if (line.trim().length === 0) {
  throw new Error("joke must not be blank");
}
if (line.includes("\n") || line.includes("\r")) {
  throw new Error("joke must be a single line");
}
if (line.trim() !== line) {
  throw new Error("joke must not have leading or trailing whitespace");
}

// --- Write the line unchanged and verify the round trip. ---
// A blank env value counts as unset so we never try to write into "".
const outputDir = process.env.MAKEFUN_OUTPUT_DIR?.trim() || "/output";
mkdirSync(outputDir, { recursive: true });
const outputPath = join(outputDir, "entry.txt");
writeFileSync(outputPath, line, "utf8");

const roundTrip = readFileSync(outputPath, "utf8");
if (roundTrip !== line) {
  throw new Error("verification failed: entry.txt does not match line.txt");
}

console.log(`wrote ${line.length} characters to ${outputPath}`);
