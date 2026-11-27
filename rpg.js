(() => {
  "use strict";

  const startingPoints = 5;
  const attributes = [
    { id: "strength", title: "힘", effect: "공격력 +4" },
    { id: "vitality", title: "체력", effect: "최대 체력 +9" },
    { id: "wisdom", title: "지혜", effect: "획득 경험치 +10%" },
    { id: "luck", title: "행운", effect: "층 통과 금화 +2" },
    { id: "agility", title: "민첩", effect: "이동 +0.18칸/초 · 대쉬 재사용 −0.045초" },
  ];

  const slots = [
    { id: "weapon", title: "무기", icon: "⚔" },
    { id: "armor", title: "방어구", icon: "⛨" },
    { id: "boots", title: "신발", icon: "»" },
    { id: "charm", title: "부적", icon: "◇" },
  ];

  const gearById = new Map();
  function gearSlotCapacity(progress, slot) {
    return 2 + (progress?.extraGearSlots ?? []).filter((id) => id === slot).length;
  }
  const statLabels = {
    damage: "공격력",
    maxHp: "최대 체력",
    speed: "이동 속도",
    attackRange: "공격 거리",
    attackCooldown: "공격 간격",
    dashCooldown: "대쉬 재사용",
    damageReduction: "피해 감소",
    healOnKill: "처치 시 회복",
    dashStrike: "대쉬 후 추가 피해",
    guardBreak: "장갑 관통",
    finishingDamage: "마무리 피해",
    dashGrace: "대쉬 무적 시간",
  };
  const lowerIsBetter = new Set(["attackCooldown", "dashCooldown"]);
  const baseAttackInterval = 0.20;
  const minimumAttackInterval = 0.125;
  const killRecoveryCap = 7.5;

  const levelThresholds = [0, 50, 100, 175, 265, 395, 555, 755, 1000, 1300, 1665, 2110];
  const enemyExperience = {
    guard: 14, runner: 11, sentry: 16, lancer: 19, mortar: 22, warden: 24, boss: 62,
    skirmisher: 16, breaker: 23, marksman: 20, saboteur: 23,
  };
  function levelThreshold(level) {
    if (level <= levelThresholds.length) return levelThresholds[level - 1];
    const excess = level - levelThresholds.length;
    return levelThresholds.at(-1) + 535 * excess + 35 * excess * (excess - 1);
  }

  function gainStat(progress, key, amount) {
    if (!Object.hasOwn(statLabels, key) || !Number.isFinite(amount)) return progress;
    const total = (progress.earned[key] ?? 0) + amount;
    const earned = { ...progress.earned, [key]: key === "healOnKill" ? Math.min(killRecoveryCap, total) : total };
    return { ...progress, earned };
  }

  function retainEarnedStats(progress) {
    const earnedAttributes = Object.fromEntries(
      Object.entries(progress.earnedAttributes ?? {}).map(([key, value]) => [key, value * 2 / 5]),
    );
    return { ...progress, earned: {}, earnedAttributes };
  }

  function createProgress(allocation = {}) {
    let remaining = startingPoints;
    const build = {};
    for (const { id } of attributes) {
      const value = allocation[id];
      const points = Number.isInteger(value) ? Math.max(0, Math.min(value, remaining)) : 0;
      build[id] = points;
      remaining -= points;
    }
    return { build, level: 1, xp: 0, earned: {}, earnedAttributes: {}, gearIds: [] };
  }

  function gainXp(progress, amount, rng = Math.random) {
    if (!Number.isFinite(amount) || amount <= 0) return progress;
    const xp = progress.xp + amount;
    let level = progress.level;
    if (xp < levelThreshold(level + 1)) return { ...progress, xp };

    const earnedAttributes = { ...progress.earnedAttributes };
    while (xp >= levelThreshold(level + 1)) {
      level++;
      const first = Math.floor(rng() * attributes.length);
      const remaining = Math.floor(rng() * (attributes.length - 1));
      const second = remaining >= first ? remaining + 1 : remaining;
      for (const index of [first, second]) {
        const { id } = attributes[index];
        earnedAttributes[id] = (earnedAttributes[id] ?? 0) + 1;
      }
    }
    return { ...progress, xp, level, earnedAttributes };
  }

  function levelAttributeGains(before, after) {
    return attributes.flatMap(({ id, title }) => {
      const previous = before.earnedAttributes?.[id] ?? 0;
      const current = after.earnedAttributes?.[id] ?? 0;
      const amount = Math.round(current - previous);
      return amount > 0 ? [{ id, title, amount }] : [];
    });
  }

  function killXp({ kind, elite }) {
    const base = Object.hasOwn(enemyExperience, kind) ? enemyExperience[kind] : 0;
    return base ? base + (elite ? 5 : 0) : 0;
  }

  function getLevelStatus(progress) {
    const floor = levelThreshold(progress.level);
    const ceiling = levelThreshold(progress.level + 1);
    const current = progress.xp - floor;
    const needed = ceiling - floor;
    return { level: progress.level, current, needed, remaining: needed - current, ratio: current / needed };
  }

  function equippedBySlot(progress) {
    const equipped = new Map();
    for (const id of progress.gearIds) {
      const item = gearById.get(id);
      if (!item) continue;
      const entries = equipped.get(item.slot) ?? [];
      if (entries.length >= gearSlotCapacity(progress, item.slot)) continue;
      entries.push(item);
      equipped.set(item.slot, entries);
    }
    return equipped;
  }

  function rewardChoices(rewards, rng = Math.random) {
    const pool = [...rewards];
    const choices = [];
    const standard = pool.filter(({ compromised }) => !compromised);
    if (standard.length && standard.length < pool.length) {
      const first = standard[Math.floor(rng() * standard.length)];
      choices.push(first);
      pool.splice(pool.indexOf(first), 1);
    }
    while (choices.length < 3 && pool.length) {
      choices.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    }
    return choices;
  }

  function rewardGear(item) {
    if (item.kind !== "gear") return null;
    const id = item.id + "@" + item.power;
    const gear = { ...item, id };
    gearById.set(id, gear);
    return gear;
  }

  function removeGear(progress, ownedIds) {
    const remaining = new Map();
    for (const id of ownedIds) remaining.set(id, (remaining.get(id) ?? 0) + 1);
    for (const id of gearById.keys()) {
      if (!remaining.has(id)) gearById.delete(id);
    }
    const valid = [...equippedBySlot(progress).values()].flat();
    return { ...progress, gearIds: valid.filter(({ id }) => {
      const count = remaining.get(id) ?? 0;
      if (count === 0) return false;
      remaining.set(id, count - 1);
      return true;
    }).map(({ id }) => id) };
  }

  function unequip(progress, gearId) {
    const index = progress.gearIds.indexOf(gearId);
    if (index === -1) return progress;
    const gearIds = [...progress.gearIds];
    gearIds.splice(index, 1);
    return { ...progress, gearIds };
  }

  function equip(progress, gearId) {
    const item = gearById.get(gearId);
    if (!item) return progress;
    const equipped = equippedBySlot(progress);
    const entries = equipped.get(item.slot) ?? [];
    if (entries.length >= gearSlotCapacity(progress, item.slot)) entries.shift();
    equipped.set(item.slot, [...entries, item]);
    return { ...progress, gearIds: [...equipped.values()].flat().map((entry) => entry.id) };
  }

  function getStats(progress) {
    const points = (id) => (progress.build[id] ?? 0) + (progress.earnedAttributes?.[id] ?? 0);
    const strength = points("strength");
    const vitality = points("vitality");
    const wisdom = points("wisdom");
    const luck = points("luck");
    const agility = points("agility");
    const stats = { maxHp: 106 + vitality * 9, damage: 27 + strength * 4, speed: 3.75 + agility * 0.18,
      attackCooldown: baseAttackInterval, dashCooldown: 0.80 - agility * 0.045, xpBonus: wisdom * 0.10, goldOnClear: luck * 2,
      attackRange: 1.8, damageReduction: 0, healOnKill: 0, dashStrike: 0,
      guardBreak: 0, finishingDamage: 0, dashGrace: 0 };
    for (const [key, value] of Object.entries(progress.earned)) stats[key] += value;
    for (const entry of [...equippedBySlot(progress).values()].flat()) {
      for (const [key, value] of Object.entries(entry.bonus)) stats[key] += value;
    }
    stats.maxHp = Math.round(stats.maxHp);
    stats.damageReduction = Math.max(0, Math.min(0.5, stats.damageReduction));
    stats.guardBreak = Math.min(1, stats.guardBreak);
    stats.attackCooldown = Math.max(0.08, stats.attackCooldown);
    stats.dashCooldown = Math.max(0.35, stats.dashCooldown);
    return stats;
  }

  function attackInterval(stats, routeMultiplier = 1, weaponOffset = 0) {
    return Math.max(minimumAttackInterval, (stats.attackCooldown + weaponOffset) * routeMultiplier);
  }

  function compareStats(progress, candidate, resolveStats = getStats) {
    const before = resolveStats(progress);
    const after = resolveStats(candidate);
    return Object.entries(statLabels).flatMap(([key, label]) => {
      const previous = key === "attackCooldown" ? attackInterval(before) : before[key];
      const current = key === "attackCooldown" ? attackInterval(after) : after[key];
      const delta = Number((current - previous).toFixed(4));
      return delta ? [{ key, label, before: previous, after: current, delta,
        improved: lowerIsBetter.has(key) ? delta < 0 : delta > 0 }] : [];
    });
  }

  function compareGear(progress, gearId, resolveStats) {
    const item = gearById.get(gearId);
    if (!item) return null;
    const entries = equippedBySlot(progress).get(item.slot) ?? [];
    const replaced = entries.length >= gearSlotCapacity(progress, item.slot) ? entries[0] : null;
    return { item, replaced, changes: compareStats(progress, equip(progress, gearId), resolveStats) };
  }

  window.TowerRpg = { startingPoints, killRecoveryCap, attributes, slots, gearSlotCapacity,
    createProgress, gainXp, levelAttributeGains, killXp, getLevelStatus,
    rewardChoices, rewardGear, removeGear, equippedBySlot, equip, unequip, getStats, attackInterval, compareGear, compareStats,
    gainStat, retainEarnedStats };
})();
