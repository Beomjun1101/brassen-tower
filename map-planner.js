(() => {
  "use strict";

  // Designer-labelled examples: district, chapter, immediate need and a validated structure index.
  const examples = [
    ["lower-drainage", "works", "through", 0], ["lower-drainage", "works", "search", 1],
    ["pressure", "works", "through", 3], ["pressure", "works", "evacuation", 0],
    ["service", "works", "search", 2], ["service", "works", "evacuation", 3],
    ["transmission", "works", "through", 3], ["furnace", "works", "search", 2],
    ["distribution", "works", "evacuation", 0], ["distribution", "works", "search", 1],
    ["lower-drainage", "fracture", "evacuation", 3], ["pressure", "fracture", "evacuation", 0],
    ["service", "fracture", "evacuation", 3], ["furnace", "fracture", "evacuation", 0],
    ["distribution", "fracture", "through", 2], ["transmission", "fracture", "search", 1],
    ["pressure", "fracture", "search", 2], ["service", "fracture", "through", 1],
    ["lower-drainage", "archive", "search", 1], ["pressure", "archive", "search", 2],
    ["service", "archive", "through", 2], ["transmission", "archive", "search", 2],
    ["furnace", "archive", "through", 0], ["distribution", "archive", "search", 1],
    ["service", "archive", "evacuation", 3], ["distribution", "archive", "evacuation", 3],
    ["lower-drainage", "ascent", "evacuation", 3], ["pressure", "ascent", "through", 0],
    ["service", "ascent", "through", 3], ["transmission", "ascent", "evacuation", 3],
    ["furnace", "ascent", "search", 2], ["distribution", "ascent", "through", 1],
    ["pressure", "ascent", "evacuation", 0], ["transmission", "ascent", "search", 1],
    ["lower-drainage", "sky", "through", 1], ["pressure", "sky", "through", 0],
    ["service", "sky", "evacuation", 3], ["transmission", "sky", "search", 2],
    ["furnace", "sky", "through", 1], ["distribution", "sky", "through", 0],
    ["distribution", "sky", "evacuation", 1], ["service", "sky", "search", 2],
  ];

  function train(rows) {
    const categories = Array.from({ length: 4 }, () => ({ total: 0, counts: [new Map(), new Map(), new Map()] }));
    const vocabulary = [new Set(), new Set(), new Set()];
    for (const [district, chapter, goal, label] of rows) {
      const category = categories[label];
      category.total++;
      [district, chapter, goal].forEach((value, index) => {
        const counts = category.counts[index];
        counts.set(value, (counts.get(value) ?? 0) + 1);
        vocabulary[index].add(value);
      });
    }
    return (features) => categories.map(({ total, counts }) => {
      const logWeight = features.reduce((sum, feature, index) => sum +
        Math.log(((counts[index].get(feature) ?? 0) + 1) / (total + vocabulary[index].size)),
      Math.log((total + 1) / (rows.length + categories.length)));
      return Math.exp(logWeight * 0.68);
    });
  }

  const predict = train(examples);

  function structure({ floor, seed, district, choices = {} }) {
    const chapter = floor < 29 ? "works" : floor < 210 ? "fracture" :
      floor < 665 ? "archive" : floor < 1009 ? "ascent" : "sky";
    const latest = choices.relay ?? choices.collapse ?? choices.inspection ?? choices.reservoir;
    const goal = ["rescue", "alarm", "escort", "district"].includes(latest) ? "evacuation" :
      ["archive", "records", "evidence", "reserve"].includes(latest) ? "search" : "through";
    const weights = predict([district, chapter, goal]);
    let random = (Number(seed) ^ Math.imul(floor, 0x9e3779b1)) >>> 0;
    random = Math.imul(random ^ (random >>> 16), 0x7feb352d) >>> 0;
    random = Math.imul(random ^ (random >>> 15), 0x846ca68b) >>> 0;
    let ticket = ((random ^ (random >>> 16)) >>> 0) / 0x100000000 * weights.reduce((sum, value) => sum + value, 0);
    for (let index = 0; index < weights.length - 1; index++) {
      ticket -= weights[index];
      if (ticket < 0) return index;
    }
    return weights.length - 1;
  }

  window.BrassenMapPlanner = { structure };
})();
