(() => {
  "use strict";

  const releaseLimit = 20;
  const kinds = ["combat", "relay", "boss", "hold", "hunt", "escape", "shelter"];
  const themes = ["sluice", "relay", "forge", "shelter"];
  const heads = [4, 5, 5, 3];
  const featureCount = 1 + 20 + kinds.length + themes.length + 3 * 3 + 4 + 3 + 4;
  const scale = 16;
  const weights = [
    [
      [-1, 23, -8, 20, -7, -9, -5, -7, -7, 3, 19, -7, -7, -7, 20, -8, -9, -3, -3, 7, -5, -7, -7, 9, 31, -10, -18, -2, 17, 2, -23, -2, 0, 0, -1, 1, -1, -1, 2, -3, -2, 6, -3, -3, -3, 0, 0, 0, 0, 0, 0, 0],
      [0, -13, -5, -2, -19, 0, -10, 21, -6, -3, -2, 21, -5, -6, -6, -1, 15, 23, -5, -2, -2, 0, -11, -4, -4, 20, 6, -4, -2, 9, -3, -4, 0, 0, 0, -1, -2, 3, 1, -9, 7, -2, 6, -1, -1, 0, 0, 0, 0, 0, 0, 0],
      [-1, 0, -8, -8, 15, -3, -8, -7, 20, -5, -2, -7, -7, 20, -8, -2, -10, -4, 23, -2, 1, -4, 6, -6, -15, 11, 14, -4, 1, -10, 12, -4, 0, -1, -1, 0, -1, -1, 2, -2, -2, -2, -3, 6, -2, 0, 0, -1, -1, 0, 0, 0],
      [1, -10, 21, -10, 12, 11, 22, -7, -7, 5, -16, -7, 19, -7, -7, 10, 4, -16, -15, -3, 6, 11, 12, 1, -12, -21, -1, 10, -16, -1, 14, 10, 1, 1, 1, 0, 4, -1, -5, 14, -3, -1, 0, -2, 7, 1, 1, 1, 1, 1, 1, 1],
    ],
    [
      [-9, -5, -15, -17, 19, -8, 25, -14, -14, -9, -1, -14, -28, 58, -28, -15, -8, -13, 75, -16, 6, -4, -18, -24, -17, 46, 20, -15, -22, 16, 7, -15, -5, -6, -5, -5, -11, 0, 5, -30, 6, -10, 5, -3, -7, 33, -2, -50, 1, 3, -15, -7],
      [0, -17, 1, -34, 18, -29, 11, 10, 11, -14, 22, 10, -45, 37, -45, -37, 0, 22, 52, -15, 33, 13, -7, -27, -22, 31, 25, -7, -19, 11, 19, -7, 1, -1, 0, 1, -4, 2, 8, -15, 4, -5, 6, 1, -2, 20, -6, -17, 3, 6, -7, -3],
      [6, -19, 4, -8, 9, -13, -10, 8, 8, -2, 7, 8, -8, -2, -8, -7, -5, 16, 7, 9, 14, 16, 0, 7, -17, 3, 1, 2, -10, 5, 16, 2, 4, 3, 4, 5, 2, 3, 7, 0, 2, 2, 4, 3, 3, 4, -3, 9, 3, 4, 3, 1],
      [4, 1, 11, 20, -19, 10, -18, 6, 5, 9, -5, 6, 28, -45, 28, 16, -2, 5, -49, 14, -7, -1, 15, 22, 13, -37, -20, 11, 14, -11, -8, 11, 2, 3, 2, 2, 6, -1, -2, 15, -3, 6, -4, 2, 3, -18, 2, 25, -2, -1, 7, 4],
      [-1, 39, 0, 38, -27, 40, -8, -10, -10, 17, -23, -10, 53, -48, 53, 43, 15, -30, -85, 8, -46, -24, 11, 23, 42, -43, -26, 8, 37, -21, -34, 8, -2, 1, -1, -3, 7, -6, -17, 30, -9, 7, -11, -3, 3, -40, 8, 34, -6, -12, 11, 5],
    ],
    [
      [-14, -5, -5, 1, -6, 2, -4, -14, -14, -1, -7, -14, 86, -14, 2, 7, -3, -17, -17, 6, -10, -3, -4, 5, -6, -8, -3, -8, 0, -10, -9, -8, -7, -8, -9, -2, -2, -20, 0, -8, -19, 26, 25, -36, -42, -8, -7, -8, -7, -4, -6, -7],
      [-6, 5, -20, 32, -17, 25, 10, -29, -29, 2, -31, -29, 60, -29, 33, 31, 22, -21, -21, 16, -22, -8, 5, 17, 7, -23, -13, 0, 10, -9, -15, 0, -2, -4, -4, 0, -2, -9, 8, -3, -21, 21, 20, -26, -27, -3, -3, -4, -4, -2, -2, -3],
      [5, 0, -10, 7, 15, 7, -10, -5, -5, 2, -8, -5, -4, -5, 12, 9, 1, 2, 2, 6, 0, 2, 13, 8, 17, -13, -29, 7, 9, -2, -5, 7, 3, 3, 3, 3, 2, 3, 5, 4, -1, 4, 4, -1, 1, 3, 3, 2, 2, 2, 3, 2],
      [9, 2, 11, -10, 11, -9, -9, 17, 17, 1, 13, 17, -67, 17, -7, -11, -7, 15, 15, -6, 11, 2, 5, -6, 2, 12, -2, 4, 1, 3, 9, 4, 4, 5, 5, 2, 2, 11, -2, 6, 14, -14, -14, 22, 23, 5, 4, 6, 5, 3, 3, 5],
      [6, -1, 25, -30, -3, -24, 13, 31, 31, -4, 33, 31, -75, 31, -40, -36, -12, 20, 21, -23, 22, 8, -18, -25, -19, 31, 48, -3, -19, 18, 20, -3, 3, 3, 5, -3, -1, 15, -11, 2, 26, -37, -36, 42, 44, 4, 2, 4, 4, 1, 3, 3],
    ],
    [
      [-3, 22, 7, -2, -19, 23, -6, 45, -41, 0, -15, 45, -41, -41, 5, 27, 14, 43, -48, -4, -19, -10, 15, -4, 31, -39, -18, 12, 14, -14, -20, 12, -2, -2, -2, -1, -1, -3, -5, 2, -2, -1, -1, -2, -1, 0, -2, -4, 15, 15, -18, -18],
      [3, -5, -2, -2, 10, 0, -6, 1, 1, 0, -1, 1, 1, 1, -3, 3, -4, 4, 4, 1, 0, 4, 0, 1, 2, 7, -11, 1, 0, 3, 1, 1, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1, 2, 1, 1],
      [0, -17, -5, 4, 8, -22, 12, -46, 40, 0, 16, -46, 40, 40, -2, -31, -10, -47, 44, 3, 19, 6, -15, 3, -32, 32, 29, -13, -14, 11, 19, -13, 0, 0, 0, -1, 0, 1, 3, -3, 0, 0, 0, 1, -1, -2, 1, 2, -16, -16, 17, 17],
    ],
  ]; // END TRAINED WEIGHTS

  function features({ floor, kind, theme, choices = {}, placement = 1, macro = 1, minor = 1 }) {
    const indexes = [0, floor];
    let start = 21;
    function add(index, size) {
      if (index >= 0 && index < size) indexes.push(start + index);
      start += size;
    }
    add(kinds.indexOf(kind), kinds.length);
    add(themes.indexOf(theme), themes.length);
    add(floor >= 1 ? 1 + ["open", "quiet"].indexOf(choices.commission) : 0, 3);
    add(floor >= 6 ? 1 + ["district", "reserve"].indexOf(choices.reservoir) : 0, 3);
    add(floor >= 16 ? 1 + ["escort", "evidence"].indexOf(choices.inspection) : 0, 3);
    add(placement - 1, 4);
    add(Math.floor((macro - 1) / 2), 3);
    add(minor - 1, 4);
    return indexes;
  }

  function mixedSeed(value) {
    let result = Math.imul(value ^ (value >>> 16), 0x7feb352d);
    result = Math.imul(result ^ (result >>> 15), 0x846ca68b);
    return (result ^ (result >>> 16)) >>> 0;
  }

  function plan(context) {
    const { floor, seed, placement = 1, macro = 1, minor = 1 } = context;
    if (!Number.isInteger(floor) || floor < 1 || floor > releaseLimit) return null;
    const inputs = features(context);
    const key = (Number(seed) ^ Math.imul(floor, 0x9e3779b1) ^ (placement << 12) ^ (macro << 4) ^ minor) >>> 0;
    const [structureIndex, width, depth, lane] = weights.map((head, index) => {
      const scores = head.map((row) => inputs.reduce((sum, feature) => sum + row[feature], 0));
      const peak = Math.max(...scores);
      const likelihoods = scores.map((score) => Math.exp((score - peak) / (scale * 0.62)));
      let draw = mixedSeed(key ^ Math.imul(index + 1, 0x85ebca6b)) / 0x100000000 *
        likelihoods.reduce((sum, likelihood) => sum + likelihood, 0);
      for (let choice = 0; choice < likelihoods.length - 1; choice++) {
        draw -= likelihoods[choice];
        if (draw < 0) return choice;
      }
      return likelihoods.length - 1;
    });
    return { structureIndex, widthOffset: width - 2, depthOffset: depth - 2, laneBias: lane - 1 };
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { plan, featureCount, features, heads, kinds, themes, scale };
  } else {
    window.BrassenMapPlanner = { plan };
  }
})();
