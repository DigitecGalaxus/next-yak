#!/usr/bin/env node
// Aggregate self-time per function from a V8 .cpuprofile (as produced by
// `node --cpu-prof`). Groups frames by origin (next-yak runtime /
// styled-components / react-dom / generated bench code / node internals)
// so the "library tax" of a benchmark case is directly readable.
//
// Usage: node analyze-cpuprofile.mjs <file.cpuprofile> [topN]

import { readFileSync } from "node:fs";

const file = process.argv[2];
const topN = Number(process.argv[3] ?? 30);
if (!file) {
  console.error("Usage: node analyze-cpuprofile.mjs <file.cpuprofile> [topN]");
  process.exit(1);
}

const profile = JSON.parse(readFileSync(file, "utf8"));
const { nodes, samples, timeDeltas } = profile;

const nodeById = new Map(nodes.map((n) => [n.id, n]));

// Self time per node id (µs).
const selfTime = new Map();
for (let i = 0; i < samples.length; i++) {
  const delta = timeDeltas[i] ?? 0;
  if (delta <= 0) continue;
  selfTime.set(samples[i], (selfTime.get(samples[i]) ?? 0) + delta);
}

// Order matters: the repo path itself contains "next-yak", so library
// checks must come before the next-yak-runtime catch.
const categoryOf = (url) => {
  if (!url) return "(v8/anonymous)";
  if (url.includes("node_modules/styled-components") || url.includes("stylis"))
    return "styled-components";
  if (url.includes("react-dom")) return "react-dom";
  if (url.includes("node_modules/react") || /\breact\b/.test(url.split("/").pop() ?? ""))
    return "react";
  if (url.includes("packages/next-yak/dist") || url.includes("next-yak/runtime"))
    return "next-yak-runtime";
  if (url.includes("/generated/") || url.includes("dist-profile")) return "bench-generated";
  if (url.startsWith("node:") || url.includes("esm/utils")) return "node-internals";
  return "other";
};

const byFunction = new Map();
const byCategory = new Map();
let total = 0;

for (const [id, time] of selfTime) {
  const node = nodeById.get(id);
  if (!node) continue;
  const cf = node.callFrame;
  // Skip program/idle/gc meta-frames in the per-function table but count
  // GC separately — allocation-heavy code shows up here.
  const name = cf.functionName || "(anonymous)";
  const isMeta = ["(program)", "(idle)", "(root)"].includes(name);
  total += time;
  const category = isMeta ? "(meta)" : name === "(garbage collector)" ? "(gc)" : categoryOf(cf.url);
  byCategory.set(category, (byCategory.get(category) ?? 0) + time);
  if (isMeta) continue;
  const loc = cf.url ? `${cf.url.split("/").slice(-2).join("/")}:${cf.lineNumber + 1}` : "";
  const key = `${name} ${loc}`;
  const entry = byFunction.get(key) ?? { time: 0, category };
  entry.time += time;
  byFunction.set(key, entry);
}

const ms = (us) => (us / 1000).toFixed(1).padStart(9);
const pct = (us) => (((us / total) * 100).toFixed(1) + "%").padStart(6);

console.log(`\n=== ${file} — total sampled: ${(total / 1000).toFixed(0)}ms ===\n`);

console.log("By category (self time):");
for (const [cat, time] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${ms(time)}ms ${pct(time)}  ${cat}`);
}

console.log(`\nTop ${topN} functions (self time):`);
const sorted = [...byFunction.entries()].sort((a, b) => b[1].time - a[1].time).slice(0, topN);
for (const [key, { time, category }] of sorted) {
  console.log(`  ${ms(time)}ms ${pct(time)}  [${category}] ${key}`);
}
console.log();
