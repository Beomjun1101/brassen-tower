import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createContext, runInContext } from "node:vm";

const root = new URL("../", import.meta.url);
const require = createRequire(import.meta.url);
const { featureCount, features, heads, scale } = require("../map-planner.js");
const sandbox = createContext({ window: {} });
runInContext(readFileSync(new URL("content.js", root), "utf8"), sandbox, { filename: "content.js" });
const content = sandbox.window.TowerContent;

// Early campaign staging notes: preferred structure, room width, room depth and service-side access.
const direction = [
  [0, 0, 0, 0], // 1: intake checkpoint
  [3, 0, 1, 0], // 2: relay across decks
  [0, 1, 0, 0], // 3: pressure adjustment
  [2, -1, 1, 1], // 4: first fork
  [3, 1, 0, -1], // 5: reservoir
  [3, 0, 0, 0], // 6: follows the reservoir's active pipe
  [1, 0, 1, -1], // 7: return line
  [2, 0, 1, 1], // 8: checkpoint approach
  [0, 1, 0, 0], // 9: first guard captain
  [0, 0, 1, 0], // 10: cathedral
  [1, 0, 1, -1], // 11: distribution
  [3, 1, -1, 1], // 12: parallel service routes
  [2, -1, 1, 1], // 13: inspection approach
  [0, 1, 0, 0], // 14: checkpoint perimeter
  [3, 1, 0, -1], // 15: blockade
  [1, 0, 0, 0], // 16: follows the selected checkpoint door
  [1, 0, 1, -1], // 17: recovery route
  [2, -1, 1, 1], // 18: approach to the secondary guard
  [0, 1, 0, 0], // 19: interception
  [3, 0, 1, 0], // 20: upper shrine
];
const branchCases = {
  1: { open: [0, 2, 1, -1], quiet: [2, -1, 1, 1] },
  6: { district: [0, 2, 0, -1], reserve: [3, -1, 2, 1] },
  16: { escort: [3, 2, 1, -1], evidence: [1, -1, 2, 1] },
};
const chapterByFloor = { 1: "commission", 6: "reservoir", 16: "inspection" };
const structureByKind = { combat: 0, relay: 3, boss: 0, hold: 0, hunt: 1, escape: 2, shelter: 3 };
const normalize = (logits) => {
  const max = Math.max(...logits);
  const weights = logits.map((value) => Math.exp(value - max));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return weights.map((weight) => weight / total);
};
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function examplesFor({ floor, kind, theme, placement, macro, minor, choices }) {
  const response = branchCases[floor]?.[choices[chapterByFloor[floor]]];
  const [structure, initialWidth, initialDepth, initialLane] = response ?? direction[floor - 1];
  const stance = floor >= 16 ? choices.inspection : floor >= 6 ? choices.reservoir : choices.commission;
  const escort = ["open", "district", "escort"].includes(stance);
  const search = ["quiet", "reserve", "evidence"].includes(stance);
  const shape = Array.from({ length: 4 }, (_, index) =>
    Number(index === structure) * (response ? 2.9 : 1.7) +
    Number(index === structureByKind[kind]) * 0.86 +
    Number(index === placement - 1) * 0.54 +
    Number(escort && index === 3 || search && index === 1) * 0.75);
  const moveWidth = macro >= 4 ? 1 : -1;
  const moveDepth = placement >= 3 ? 1 : -1;
  const width = initialWidth + moveWidth * 0.53 + (theme === "sluice" ? 0.24 : 0) + (escort ? 0.35 : 0);
  const depth = initialDepth + moveDepth * 0.53 + (kind === "escape" || search ? 0.36 : 0);
  const lane = initialLane + (minor <= 2 ? -0.46 : 0.46);
  const around = (target, min, max, sharpness) => Array.from({ length: max - min + 1 },
    (_, offset) => -((offset + min - clamp(target, min, max)) ** 2) * sharpness);
  return [shape, around(width, -2, 2, 1.7), around(depth, -2, 2, 1.7), around(lane, -1, 1, 1.8)].map(normalize);
}

function randomFrom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const samples = { train: [], check: [] };
for (let floor = 1; floor <= 20; floor++) {
  for (const commission of [undefined, "open", "quiet"]) {
    for (const reservoir of floor >= 6 ? [undefined, "district", "reserve"] : [undefined]) {
      for (const inspection of floor >= 16 ? [undefined, "escort", "evidence"] : [undefined]) {
        const choices = { commission, reservoir, inspection };
        for (let sample = 0; sample < 40; sample++) {
          const seed = 0x1685ae1 ^ Math.imul(sample + 1, 0x9e3779b1);
          const rng = randomFrom(seed);
          const shelter = content.isShelterFloor(floor);
          const stage = shelter ? null : content.createFloor(floor, rng, undefined, choices);
          const [macro, placement, minor] = stage
            ? stage.rolls.slice(-3).map(({ value }) => value)
            : [1 + Math.floor(rng() * 6), 1 + Math.floor(rng() * 4), 1 + Math.floor(rng() * 4)];
          const context = { floor, kind: stage?.kind ?? "shelter", theme: stage?.theme ?? "shelter",
            macro, placement, minor, choices };
          samples[sample % 5 === 4 ? "check" : "train"].push({
            inputs: features(context), targets: examplesFor(context),
          });
        }
      }
    }
  }
}

function predict(head, inputs, denominator = 1) {
  return normalize(head.map((row) => inputs.reduce((sum, index) => sum + row[index], 0) / denominator));
}

const weights = heads.map((size) => Array.from({ length: size }, () => new Float64Array(featureCount)));
const order = samples.train.map((_, index) => index);
const rng = randomFrom(420062);
for (let epoch = 0; epoch < 14; epoch++) {
  for (let index = order.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1));
    [order[swap], order[index]] = [order[index], order[swap]];
  }
  const rate = 0.050 / (1 + epoch * 0.14);
  for (const index of order) {
    const { inputs, targets } = samples.train[index];
    weights.forEach((head, number) => {
      const prediction = predict(head, inputs);
      head.forEach((row, outcome) => {
        const step = rate * (targets[number][outcome] - prediction[outcome]);
        for (const column of inputs) row[column] += step - rate * 0.0004 * row[column];
      });
    });
  }
}
const packed = weights.map((head) => head.map((row) => Array.from(row, (weight) => Math.round(weight * scale))));
const losses = heads.map((size, index) => samples.check.reduce((sum, { inputs, targets }) =>
  sum - predict(packed[index], inputs, scale).reduce((partial, probability, choice) =>
    partial + targets[index][choice] * Math.log(probability), 0), 0) / samples.check.length);

assert(losses.every((loss, index) => loss < Math.log(heads[index]) * 0.96), "Held-out loss should beat uniform guesses");
const lines = packed.map((head) => "    [\n" + head.map((row) => "      [" + row.join(", ") + "],").join("\n") + "\n    ],");
const block = "  const weights = [\n" + lines.join("\n") + "\n  ]; // END TRAINED WEIGHTS";
const output = new URL("map-planner.js", root);
const source = readFileSync(output, "utf8");
const version = source.replace(/  const weights = \[[\s\S]*?\]; \/\/ END TRAINED WEIGHTS/, block);
assert(version.includes(block), "Could not locate generated weight block");
if (process.argv.includes("--check")) assert.equal(source, version, "Embedded weights differ from reproducible training");
else writeFileSync(output, version);
console.log(JSON.stringify({ training: samples.train.length, heldOut: samples.check.length,
  crossEntropy: losses.map((value) => Number(value.toFixed(3))) }));
