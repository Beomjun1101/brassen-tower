(() => {
  "use strict";

  const gear = {
    weapon: [
      ["sluice-blade", "연마한 수문검", "common", { damage: 7 }],
      ["crescent-knife", "초승 단검", "common", { damage: 2, attackCooldown: -0.035, attackRange: -0.2 }],
      ["duct-spear", "환기구 장창", "common", { damage: 3, attackRange: 0.48, attackCooldown: 0.055 }],
      ["recoil-slicer", "반동 절단기", "common", { damage: 3, dashStrike: 7 }],
      ["press-hammer", "압착 망치", "rare", { damage: 10, guardBreak: 0.48, attackCooldown: 0.08 }],
      ["bell-splitter", "종추 파쇄검", "rare", { damage: 10, finishingDamage: 12 }],
      ["jacketed-saw", "피복 톱날", "rare", { damage: 6, healOnKill: 5, attackRange: 0.18 }],
      ["triple-latch", "삼중 걸쇠검", "rare", { damage: 8, attackCooldown: -0.025, guardBreak: 0.27 }],
    ],
    armor: [
      ["woven-vest", "두꺼운 천조끼", "common", { maxHp: 15 }],
      ["padded-jacket", "완충 재킷", "common", { maxHp: 5, damageReduction: 0.14 }],
      ["tanned-coat", "무두질 외투", "common", { maxHp: 9, speed: 0.2 }],
      ["service-apron", "정비 앞치마", "common", { damageReduction: 0.06, dashCooldown: -0.06 }],
      ["steel-spine", "강철 등갑", "rare", { maxHp: 20, damageReduction: 0.24, speed: -0.26 }],
      ["second-wind", "응급 회복 외투", "rare", { maxHp: 18, healOnKill: 4, damageReduction: 0.07 }],
      ["arc-insulator", "아크 절연복", "rare", { maxHp: 16, damageReduction: 0.11, dashGrace: 0.11 }],
      ["spring-rig", "용수철 가슴받이", "rare", { maxHp: 8, dashStrike: 9, damageReduction: 0.08 }],
    ],
    boots: [
      ["canvas-boots", "캔버스 장화", "common", { speed: 0.32 }],
      ["pulse-heels", "탄성 굽", "common", { dashCooldown: -0.105 }],
      ["slide-shoes", "활주 신발", "common", { speed: 0.22, dashGrace: 0.06 }],
      ["braced-heels", "반동 굽", "common", { dashStrike: 6, speed: 0.18 }],
      ["air-cushion", "공기 쿠션 밑창", "rare", { speed: 0.62, dashCooldown: -0.12 }],
      ["reverse-heels", "역동력 장화", "rare", { dashCooldown: -0.19, speed: 0.23, attackRange: -0.12 }],
      ["duel-soles", "결투용 밑창", "rare", { speed: 0.4, attackRange: 0.25 }],
      ["pulse-treads", "맥동 밑창", "rare", { speed: 0.55, dashGrace: 0.1, healOnKill: 4 }],
    ],
    charm: [
      ["vial-token", "작은 회복 부적", "common", { healOnKill: 3 }],
      ["sharp-ring", "쐐기 반지", "common", { guardBreak: 0.11 }],
      ["closing-sigil", "마무리 인장", "common", { finishingDamage: 5 }],
      ["sight-ring", "초점 고리", "common", { attackRange: 0.15, attackCooldown: -0.018 }],
      ["spring-lock", "탄성 걸쇠", "rare", { dashStrike: 9, dashGrace: 0.1 }],
      ["cracked-clock", "금 간 회중시계", "rare", { attackCooldown: -0.052, damage: 4, maxHp: -5 }],
      ["etched-ward", "각인 수호석", "rare", { maxHp: 15, damageReduction: 0.085, dashGrace: 0.035 }],
      ["reclaimer-ring", "회수반 완장", "rare", { maxHp: 8, healOnKill: 3, damage: 4 }],
    ],
  };

  const events = [
    ["blade-drill", "칼날 연습", "common", "damage", 4],
    ["lung-training", "호흡 훈련", "common", "maxHp", 12],
    ["running-drill", "보폭 훈련", "common", "speed", 0.2],
    ["footwork-drill", "거리 재기", "common", "attackRange", 0.14],
    ["rhythm-drill", "타격 박자", "common", "attackCooldown", -0.018],
    ["dodge-drill", "대쉬 동작 교정", "common", "dashCooldown", -0.05],
    ["bracing-drill", "충격 흘리기", "common", "damageReduction", 0.045],
    ["first-aid-drill", "야전 응급처치", "common", "healOnKill", 2],
    ["piercing-drill", "장갑 틈 찾기", "rare", "guardBreak", 0.16],
    ["slip-drill", "대쉬 타이밍 훈련", "rare", "dashGrace", 0.05],
  ];

  const supplies = [
    ["cashbox", "경비대 금고", "common", { gold: 24 }],
    ["large-aid-kit", "대형 구급함", "common", { heal: 33 }],
    ["training-notes", "현장 훈련 기록", "common", { xp: 38 }],
    ["ward-plate", "일회용 보호판", "common", { ward: 22 }],
    ["power-pack", "비상 축전기", "common", { overclock: 10 }],
    ["medical-purse", "비상 구호 가방", "common", { heal: 17, gold: 13 }],
    ["report-cache", "순찰대 보급 상자", "rare", { gold: 16, xp: 20 }],
    ["live-ward", "충전 보호판", "rare", { ward: 14, overclock: 6 }],
  ];

  const statLabels = {
    maxHp: "최대 체력",
    damage: "공격력",
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
  const supplyLabels = {
    gold: "금화",
    heal: "현재 체력",
    xp: "경험치",
    ward: "다음 시련 보호막",
    overclock: "다음 시련 공격력",
  };
  const cooldowns = new Set(["attackCooldown", "dashCooldown"]);
  const integers = new Set(["maxHp", "damage", "healOnKill", "dashStrike", "finishingDamage"]);
  const percentages = new Set(["damageReduction", "guardBreak"]);
  const spatialStats = new Set(["speed", "attackRange"]);
  const statCaps = {
    attackCooldown: 0.15,
    dashCooldown: 0.45,
    dashGrace: 0.24,
    damageReduction: 0.5,
    guardBreak: 1,
  };

  function scaledStat(key, amount, scale) {
    const improves = cooldowns.has(key) ? amount < 0 : amount > 0;
    if (!improves) return amount;

    const base = Math.abs(amount);
    const cap = statCaps[key];
    let value;
    if (cap !== undefined) {
      const growth = base * (scale - 1);
      const remaining = cap - base;
      value = Math.sign(amount) * (base + remaining * (growth / (remaining + growth)));
    } else {
      value = amount * (spatialStats.has(key) ? Math.sqrt(scale) : scale);
    }

    return integers.has(key) ? Math.round(value) : Number(value.toFixed(3));
  }

  function describeStat(key, amount) {
    const sign = amount < 0 ? "−" : "+";
    const percent = percentages.has(key);
    const time = cooldowns.has(key) || key === "dashGrace";
    const value = percent ? Number((Math.abs(amount) * 100).toFixed(1)) : Math.abs(amount);
    const unit = percent ? "%p" : time ? "초" : key === "attackRange" ? "칸" : key === "speed" ? "칸/초" : "";
    return `${statLabels[key]} ${sign}${value}${unit}`;
  }

  function createPool(floor) {
    const power = Number.isFinite(floor) ? Math.max(1, Math.trunc(floor)) : 1;
    const scale = 1 + 0.085 * (power - 1);
    const equipment = Object.entries(gear).flatMap(([slot, entries]) => entries.map(([key, title, rarity, stats]) => {
      const bonus = Object.fromEntries(Object.entries(stats).map(([stat, amount]) => [stat, scaledStat(stat, amount, scale)]));
      const description = Object.entries(bonus).map(([stat, amount]) => describeStat(stat, amount)).join(" · ");
      return { id: "loot-" + key, title, description, tag: description, kind: "gear", slot, rarity, bonus, power, cost: 0 };
    }));
    const talents = events.map(([key, title, rarity, stat, base]) => {
      const amount = scaledStat(stat, base, scale);
      return { id: "event-" + key, title, description: describeStat(stat, amount) + " · 이번 등반 동안 유지", kind: "stat", rarity, stat, amount, power };
    });
    const consumables = supplies.map(([key, title, rarity, stats]) => {
      const effects = Object.fromEntries(Object.entries(stats).map(([effect, amount]) => [effect, Math.round(amount * scale)]));
      const description = Object.entries(effects).map(([effect, amount]) => `${supplyLabels[effect]} +${amount}`).join(" · ");
      return { id: "supply-" + key, title, description, kind: "supply", rarity, effects, power };
    });
    return [...equipment, ...talents, ...consumables];
  }

  window.TowerRewards = { createPool };
})();
