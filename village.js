(() => {
  "use strict";

  const maxQuests = 3;
  const villageStep = 5;
  const classStep = 50;
  const passageJob = {
    id: "relay-check", title: "진입로 돌파", goal: { type: "clear", trial: "combat" }, count: [1, 1],
    task: () => "일반 전투 층을 한 번 통과하세요.", gold: 31,
  };
  const jobs = [
    { id: "patrol", title: "마을 순찰 의뢰", goal: { type: "kill" }, count: [6, 9], task: (n) => `전투에서 적 ${n}기를 제압하세요.`, gold: 24 },
    { id: "marksmen", title: "사격 통로 확보", goal: { type: "kill", kind: "sentry" }, count: [2, 3], task: (n) => `전투에서 사격형 적 ${n}기를 제압하세요.`, gold: 29 },
    { id: "veterans", title: "정예 경비 돌파", goal: { type: "kill", elite: true }, count: [2, 2], task: (n) => `전투에서 정예 적 ${n}기를 제압하세요.`, gold: 31 },
    { id: "survey", title: "윗길 답사", goal: { type: "clear" }, count: [3, 4], task: (n) => `전투 층 ${n}개를 통과하세요.`, gold: 26 },
    passageJob,
    { id: "recovery", title: "회수반 보급", goal: { type: "loot" }, count: [3, 4], task: (n) => `전투 보상으로 물품 ${n}개를 회수하세요.`, gold: 23 },
  ];
  const classes = [
    { id: "sentinel", title: "수호병", description: "타격을 버티며 통로를 지킵니다.", detail: "최대 체력 +14 · 피해 감소 +9%p · 이동 −0.15칸/초", bonus: { maxHp: 14, damageReduction: 0.09, speed: -0.15 } },
    { id: "duelist", title: "결투가", description: "짧은 틈에 재빨리 칼을 넣습니다.", detail: "공격력 +6 · 공격 간격 −0.025초(최소 0.10초) · 최대 체력 −8", bonus: { damage: 6, attackCooldown: -0.025, maxHp: -8 } },
    { id: "scout", title: "척후병", description: "자리를 바꾸며 적을 따돌립니다.", detail: "이동 +0.28칸/초 · 대쉬 재사용 −0.09초 · 공격력 −2", bonus: { speed: 0.28, dashCooldown: -0.09, damage: -2 } },
    { id: "mage", title: "마법사", description: "먼 적을 마력탄으로 견제합니다.",
      detail: "공격력 +2 · 최대 체력 −12 · 이동 −0.12칸/초", bonus: { damage: 2, maxHp: -12, speed: -0.12 } },
    { id: "archer", title: "궁수", description: "거리를 두고 화살로 적을 노립니다.",
      detail: "이동 +0.12칸/초 · 공격력 −2 · 최대 체력 −8", bonus: { speed: 0.12, damage: -2, maxHp: -8 } },
    { id: "brawler", title: "격투가", description: "바짝 붙어 권갑으로 연타합니다.",
      detail: "최대 체력 +10 · 피해 감소 +4%p", bonus: { maxHp: 10, damageReduction: 0.04 } },
    { id: "bulwark", parent: "sentinel", title: "철벽 수호병", description: "폭주한 설비 앞에서 오래 버팁니다.", detail: "최대 체력 +24 · 피해 감소 +13%p · 이동 −0.18칸/초", bonus: { maxHp: 24, damageReduction: 0.13, speed: -0.18 } },
    { id: "marshal", parent: "sentinel", title: "전열 집행관", description: "피해를 흘리고 정면의 적을 밀어붙입니다.", detail: "최대 체력 +18 · 피해 감소 +10%p · 공격력 +5", bonus: { maxHp: 18, damageReduction: 0.10, damage: 5 } },
    { id: "sabre", parent: "duelist", title: "속검 결투가", description: "체력을 내주고 공격 사이의 틈을 줄입니다.", detail: "공격력 +10 · 공격 간격 −0.045초(최소 0.10초) · 최대 체력 −10", bonus: { damage: 10, attackCooldown: -0.045, maxHp: -10 } },
    { id: "breaker", parent: "duelist", title: "갑주 파쇄인", description: "단단한 상대의 방호를 무너뜨립니다.", detail: "공격력 +9 · 장갑 관통 +22%p · 최대 체력 −5", bonus: { damage: 9, guardBreak: 0.22, maxHp: -5 } },
    { id: "runner", parent: "scout", title: "틈새 길잡이", description: "좁은 통로에서도 빠르게 빠져나옵니다.", detail: "이동 +0.45칸/초 · 대쉬 재사용 −0.16초 · 공격력 −2", bonus: { speed: 0.45, dashCooldown: -0.16, damage: -2 } },
    { id: "riposte", parent: "scout", title: "반격 척후병", description: "대쉬 직후의 한 번에 힘을 싣습니다.", detail: "이동 +0.25칸/초 · 대쉬 재사용 −0.10초 · 대쉬 후 피해 +10", bonus: { speed: 0.25, dashCooldown: -0.10, dashStrike: 10 } },
    { id: "arcanist", parent: "mage", title: "비전술사", description: "마력구에 힘을 모아 멀리 보냅니다.",
      detail: "공격력 +4 · 최대 체력 −14 · 이동 −0.12칸/초", bonus: { damage: 4, maxHp: -14, speed: -0.12 } },
    { id: "ranger", parent: "archer", title: "명사수", description: "쇠뇌를 들고 사격 위치를 빠르게 바꿉니다.",
      detail: "이동 +0.20칸/초 · 공격력 +1 · 최대 체력 −9", bonus: { speed: 0.20, damage: 1, maxHp: -9 } },
    { id: "pugilist", parent: "brawler", title: "격투 달인", description: "톤파로 근접전을 이어갑니다.",
      detail: "최대 체력 +14 · 피해 감소 +6%p · 이동 +0.08칸/초", bonus: { maxHp: 14, damageReduction: 0.06, speed: 0.08 } },
  ];
  const classIndex = new Map(classes.map((entry) => [entry.id, entry]));
  const startingWeapon = { id: "sword", label: "장검", attackLabel: "베기", detail: "정면의 적 하나를 벱니다." };
  const classWeapons = new Map([
    ["sentinel", { id: "hammer", label: "전투 망치", attackLabel: "내려치기", detail: "적을 내려쳐 잠시 비틀거리게 합니다." }],
    ["duelist", { id: "rapier", label: "레이피어", attackLabel: "정밀 찌르기", detail: "먼 적 하나를 좁은 각도로 찌릅니다." }],
    ["scout", { id: "daggers", label: "쌍단검", attackLabel: "빠른 베기", detail: "짧은 거리에서 빠르게 벱니다." }],
    ["mage", { id: "staff", label: "지팡이", attackLabel: "마력탄 발사", detail: "멀리 있는 적에게 마력탄을 쏩니다." }],
    ["archer", { id: "bow", label: "활", attackLabel: "사격", detail: "먼 거리에서 적 하나에게 화살을 쏩니다." }],
    ["brawler", { id: "gauntlets", label: "권갑", attackLabel: "연타", detail: "바짝 붙어 적 하나를 빠르게 칩니다." }],
    ["bulwark", { id: "maul", label: "대형 전투 망치", attackLabel: "강타", detail: "적을 강하게 쳐 더 오래 비틀거리게 합니다." }],
    ["marshal", { id: "poleaxe", label: "장대 도끼", attackLabel: "멀리서 찍기", detail: "긴 자루로 먼 거리에서 적 하나를 찍습니다." }],
    ["sabre", { id: "sabre", label: "기병도", attackLabel: "넓게 베기", detail: "넓은 각도로 휘둘러 적 하나를 벱니다." }],
    ["breaker", { id: "greatsword", label: "대검", attackLabel: "방어 깨기", detail: "무거운 검으로 적의 방어를 뚫습니다." }],
    ["runner", { id: "twinblades", label: "쌍검", attackLabel: "파고들어 베기", detail: "짧게 전진해 적과의 거리를 좁힌 뒤 벱니다." }],
    ["riposte", { id: "hooks", label: "갈고리 검", attackLabel: "패링 반격", detail: "패링에 성공한 직후 후속 공격이 강해집니다." }],
    ["arcanist", { id: "orb", label: "마력구", attackLabel: "마력구 투사", detail: "힘을 모은 마력구를 먼 적에게 보냅니다." }],
    ["ranger", { id: "crossbow", label: "쇠뇌", attackLabel: "쇠뇌 사격", detail: "쇠뇌로 먼 거리에서 적을 정밀하게 노립니다." }],
    ["pugilist", { id: "tonfa", label: "톤파", attackLabel: "톤파 연타", detail: "짧은 거리에서 톤파로 힘 있게 칩니다." }],
  ]);
  const shopSupplyLabels = {
    heal: "현재 체력", xp: "경험치", ward: "다음 전투 보호막", overclock: "다음 전투 공격력",
  };
  let latestShop;
  const blessings = [
    { id: "quiet", title: "잠잠한 제단", description: "불꽃이 잠시 흔들리다 제자리로 돌아옵니다.", effects: {}, weight: 55 },
    { id: "ward", title: "구리 수호자의 인장", description: "다음 전투 보호막 +18", effects: { ward: 18 }, weight: 16 },
    { id: "heal", title: "등불 아래의 붕대", description: "현재 체력 최대 24 회복", effects: { heal: 24 }, weight: 12 },
    { id: "xp", title: "오래된 인수 일지", description: "경험치 +26", effects: { xp: 26 }, weight: 8 },
    { id: "gold", title: "봉헌함 속 동전", description: "금화 +14", effects: { gold: 14 }, weight: 5 },
    { id: "power", title: "꺼지지 않은 심지", description: "다음 전투 공격력 +7", effects: { overclock: 7 }, weight: 4 },
  ];

  function isVillage(floor) {
    return Number.isInteger(floor) && floor >= villageStep && floor <= (window.TowerContent?.floorCount ?? floor)
      && floor % villageStep === 0;
  }

  function seededDraw(floor, seed, salt) {
    let state = ((Number(seed) >>> 0) ^ Math.imul(floor, 0x9e3779b1) ^ salt) >>> 0;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return (state ^ state >>> 16) >>> 0;
    };
  }

  function pick(items, draw) {
    return items[Math.floor(draw() / 4294967296 * items.length)];
  }

  function questOffers(floor, seed = 0) {
    if (!isVillage(floor)) return [];
    const draw = seededDraw(floor, seed, 0x223a7f11);
    const types = [pick(jobs.filter(({ goal }) => goal.type === "kill"), draw),
      pick(jobs.filter(({ goal }) => goal.type !== "kill"), draw)];
    return types.map((job) => {
      const [low, high] = job.count;
      const count = low + Math.floor(draw() / 4294967296 * (high - low + 1));
      const rank = Math.min(40, Math.floor(floor / villageStep));
      return { id: `${floor}:${job.id}`, title: job.title, description: job.task(count),
        goal: { ...job.goal, count }, reward: { gold: job.gold + rank * 2, xp: 26 + rank * 6 } };
    });
  }

  function acceptQuest(active, offer, floor) {
    if (!isVillage(floor) || !offer?.goal || active.length >= maxQuests || active.some(({ id }) => id === offer.id)) return active;
    return [...active, { ...offer, startedAt: floor, progress: 0 }];
  }

  function migrateQuests(quests) {
    if (!Array.isArray(quests)) return [];
    return quests.map((quest) => {
      if (quest?.goal?.type !== "clear" || quest.goal.trial !== "relay") return quest;
      return { ...quest, title: passageJob.title, description: passageJob.task(),
        goal: { ...quest.goal, trial: passageJob.goal.trial } };
    });
  }

  function questReady(quest) {
    return Boolean(quest && quest.progress >= quest.goal.count);
  }

  function advanceQuests(active, event) {
    if (!Number.isInteger(event?.floor) || event.floor % villageStep === 0) return active;
    const amount = event.amount === undefined ? 1 : Math.floor(event.amount);
    if (!Number.isFinite(amount) || amount < 1) return active;
    let changed = false;
    const next = active.map((quest) => {
      const goal = quest.goal;
      const matchesKind = !goal.kind || goal.kind === event.kind || (goal.kind === "sentry" && event.kind === "marksman");
      if (questReady(quest) || event.floor <= quest.startedAt || goal.type !== event.type
          || !matchesKind || (goal.trial && goal.trial !== (event.trial ?? event.kind))
          || (goal.faction && goal.faction !== event.faction) || (goal.elite && !event.elite)) return quest;
      changed = true;
      return { ...quest, progress: Math.min(goal.count, quest.progress + amount) };
    });
    return changed ? next : active;
  }

  function buyPrice(item) {
    if (item?.kind !== "gear" && item?.kind !== "supply") return 0;
    const power = Number.isFinite(item.power) ? Math.max(1, item.power) : 1;
    const rare = item.rarity === "rare";
    const base = item.kind === "gear" ? (rare ? 49 : 30) : (rare ? 27 : 16);
    const depth = Math.min(140, Math.round((power - 1) * (item.kind === "gear" ? 1.4 : 0.8)));
    const villagePremium = Math.min(25, Math.floor((power - 1) / villageStep));
    return Math.max(base + depth, (item.effects?.gold ?? 0) + 5) + villagePremium;
  }

  function sellPrice(item) {
    const price = buyPrice(item);
    return price ? Math.max(1, Math.floor(price * (item.kind === "gear" ? 0.46 : 0.36))) : 0;
  }

  function shopStock(floor, seed = 0) {
    if (!isVillage(floor)) return [];
    const seedValue = Number(seed) >>> 0;
    if (latestShop?.floor !== floor || latestShop.seed !== seedValue) {
      const draw = seededDraw(floor, seedValue, 0x731ec4d9);
      const items = window.TowerRewards.createPool(floor);
      const ordinary = pick(items.filter((item) => item.kind === "gear" && item.rarity === "common"), draw);
      const special = pick(items.filter((item) => item.kind === "gear" && item.rarity === "rare" && item.slot !== ordinary.slot), draw);
      const aid = pick(items.filter((item) => item.kind === "supply" && (item.effects.heal || item.effects.ward)), draw);
      const effects = Object.fromEntries(Object.entries(aid.effects).filter(([key]) => key !== "gold"));
      const description = Object.entries(effects).map(([key, amount]) => `${shopSupplyLabels[key]} +${amount}`).join(" · ");
      const stockAid = { ...aid, effects, description };
      const entries = [ordinary, special, stockAid].map((item) => ({ id: `${floor}:${item.id}`, item, price: buyPrice(item) * 2 }));
      latestShop = { floor, seed: seedValue, entries };
    }
    return latestShop.entries.map((entry) => {
      const item = { ...entry.item };
      if (item.bonus) item.bonus = { ...item.bonus };
      if (item.effects) item.effects = { ...item.effects };
      return { ...entry, item };
    });
  }

  function classById(classId) {
    return classIndex.get(classId) ?? null;
  }

  function weaponFor(classId) {
    return classWeapons.get(classId) ?? startingWeapon;
  }

  function classOptions(floor, classId, seed = 0) {
    if (!isVillage(floor) || floor % classStep !== 0) return [];
    const candidates = classes.filter(({ id, parent }) => id !== classId && (!parent || parent === classId));
    const draw = seededDraw(floor, seed, 0xa340c0d1);
    const selected = [];
    while (selected.length < 3 && candidates.length) {
      const job = pick(candidates, draw);
      candidates.splice(candidates.indexOf(job), 1);
      selected.push(job);
    }
    return selected;
  }

  function applyClass(stats, classId) {
    const chosen = classById(classId);
    if (!chosen) return stats;
    const result = { ...stats };
    for (const [key, amount] of Object.entries(chosen.bonus)) result[key] = (result[key] ?? 0) + amount;
    result.maxHp = Math.max(1, result.maxHp);
    result.damage = Math.max(1, result.damage);
    result.speed = Math.max(1, result.speed);
    result.damageReduction = Math.max(0, Math.min(0.5, result.damageReduction));
    result.guardBreak = Math.max(0, Math.min(1, result.guardBreak));
    result.attackCooldown = Math.max(0.08, result.attackCooldown);
    result.dashCooldown = Math.max(0.35, result.dashCooldown);
    return result;
  }

  function shrineEvent(floor, seed = 0) {
    if (!isVillage(floor) || floor % 10 !== 0) return null;
    const draw = seededDraw(floor, seed, 0x4bd79365);
    let roll = Math.floor(draw() / 4294967296 * 100);
    const selected = blessings.find(({ weight }) => (roll -= weight) < 0);
    return { id: `${floor}:${selected.id}`, title: selected.title, description: selected.description, effects: { ...selected.effects } };
  }

  window.TowerVillage = { maxQuests, isVillage, questOffers, acceptQuest, migrateQuests, questReady, advanceQuests,
    shopStock, buyPrice, sellPrice, classById, weaponFor, classOptions, applyClass, shrineEvent };
})();
