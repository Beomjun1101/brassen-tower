(() => {
  "use strict";

  const content = window.TowerContent;
  const renderer = window.TowerRenderer;
  const titleRenderer = window.BrassenTitle;
  const rpg = window.TowerRpg;
  const rewards = window.TowerRewards;
  const audio = window.TowerAudio;
  const shelter = window.TowerShelter;
  const village = window.TowerVillage;
  const canvas = document.querySelector("#game-canvas");
  const shell = document.querySelector(".game-shell");
  const elements = Object.fromEntries([
    "floor-value", "objective", "health-label", "health-fill", "gold-value",
    "stage-progress", "stage-title", "threat-label", "notification", "live-status", "overlay",
    "overlay-kicker", "overlay-title", "overlay-copy", "overlay-choices",
    "primary-action", "entry-continue", "touch-controls", "hero-label", "level-value", "xp-label", "xp-fill", "gear-list",
    "game-stage", "floor-steps", "hazard-label", "timer-label", "dash-state", "parry-state", "minimap",
    "gear-compare", "compare-equipped", "compare-candidate", "compare-stats", "compare-detail",
    "build-editor", "build-points", "build-stats", "run-difficulty",
    "pack-panel", "pack-list", "pack-count", "compare-heading", "compare-candidate-label",
    "audio-toggle", "music-track", "back-to-title", "region-label",
    "elevation-label", "elevation-legend",
    "status-dialog", "status-trigger", "status-close", "status-summary", "status-gear", "status-available-gear", "status-stats", "status-quests",
    "pause-dialog", "pause-trigger", "pause-resume", "pause-exit", "pause-save-error",
    "coach-tip", "coach-text", "coach-next",
  ].map((id) => [id, document.getElementById(id)]));
  const minimapSection = elements.minimap.closest(".map-section");

  const playerRadius = 0.29;
  const playerStartDelay = 0.5;
  const enemyStartDelay = 1;
  const challengeGold = 12;
  const killRecoveryOfferChance = 0.05;
  const parryWindow = 0.125;
  const failedParryCooldown = 5;
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  const dieRebounds = [0.38, 0.49, 0.61, 0.73];
  const checkpointKey = "brass-spire-campaign-v1";
  const seenCoaches = new Map();
  const coach = {
    dice: { target: "#entry-continue",
      text: "이 버튼이나 Space로 전투를 시작하세요.", touchText: "주사위가 멈추면 이 버튼으로 전투를 시작하세요." },
    movement: { target: "#keyboard-help .control-list > :first-child", touch: ".touch-movement",
      text: "WASD나 방향키로 이동하세요.", touchText: "방향 버튼을 누르고 이동하세요." },
    attack: { target: "#keyboard-help .control-list > :nth-child(2)", touch: '[data-action="attack"]',
      text: "Space나 클릭으로 가장 가까운 적을 공격하세요.", touchText: "공격 버튼으로 가까운 적을 공격하세요." },
    defense: { target: ".parry-readout", touch: '[data-action="parry"]',
      text: "Shift로 대쉬하고, 적의 공격이 닿을 때 F로 패링하세요.", touchText: "대쉬로 피하고, 공격이 닿을 때 패링하세요." },
    reward: { target: "#overlay-choices .route-choice", text: "장비 보상은 받는 즉시 착용합니다." },
    route: { target: "#overlay-choices .route-choice", text: "다음 층에 적용할 통로 효과를 고르세요." },
    departure: { target: "#objective", text: "열린 문에 닿으면 위층으로 바로 올라갑니다." },
    status: { target: "#status-trigger",
      text: "Q로 착용 중인 장비와 착용 가능한 장비를 확인하세요.", touchText: "상태창에서 착용 중인 장비와 착용 가능한 장비를 확인하세요." },
    pack: { target: "#pack-panel > summary", text: "가방의 소모품은 눌러 사용하고, 장비는 눌러 착용하세요." },
    town: { target: "#objective", text: "게시판에서 의뢰를 받고 상점에서 물건을 사고팔 수 있습니다." },
  };
  const swingDurations = [0.24, 0.27, 0.32];
  const terrainCycles = {
    conduit: { period: 5.4, warningAt: 3.25, activeAt: 4.25, stopsAt: 5.15, damage: 12 },
    vent: { period: 6.5, warningAt: 3.7, activeAt: 5, stopsAt: 6.1, damage: 15 },
  };
  const entrance = { width: 34, height: 26, spawn: { x: 4, y: 13 }, enemies: [], obstacles: [], items: [] };
  const previewFloorLimit = 20;
  const dialogModes = new Set(["playing", "rolling", "tutorial", "shelter", "gear", "branch"]);
  const dialogFocus = new WeakMap();
  const difficulties = {
    easy: { name: "쉬움", health: 1, damage: 1, speed: 1, interval: 1, windup: 1, shots: 2, mines: 2, bossExtra: 0, campfireRecovery: 1 },
    normal: { name: "보통", health: 1.20, damage: 1.12, speed: 1.04, interval: .93, windup: .98, shots: 2, mines: 3, bossExtra: 1, campfireRecovery: 2 / 3 },
    hard: { name: "어려움", health: 1.45, damage: 1.28, speed: 1.09, interval: .85, windup: .94, shots: 3, mines: 3, bossExtra: 2, campfireRecovery: 1 / 3 },
  };
  const enemyTypes = {
    guard: { hp: 84, speed: 2.57, damage: 24, range: 1.95, windup: 0.56, cooldown: 0.65, radius: 0.32 },
    runner: { hp: 54, speed: 3.47, damage: 19, range: 1.55, windup: 0.46, cooldown: 0.56, radius: 0.27 },
    sentry: { hp: 54, speed: 1.58, damage: 22, range: 7.6, windup: 0.72, cooldown: 1.18, radius: 0.35 },
    lancer: { hp: 72, speed: 2.70, damage: 27, range: 4.7, windup: 0.69, cooldown: 1.13, radius: 0.31 },
    mortar: { hp: 78, speed: 1.55, damage: 30, range: 8.9, windup: 0.94, cooldown: 1.69, radius: 0.38 },
    warden: { hp: 111, speed: 2.10, damage: 28, range: 2.12, windup: 0.69, cooldown: 0.92, radius: 0.43 },
    skirmisher: { hp: 63, speed: 3.21, damage: 21, range: 2.05, windup: 0.58, cooldown: 0.84, radius: 0.30 },
    breaker: { hp: 97, speed: 1.91, damage: 30, range: 2.72, windup: 1.04, cooldown: 1.43, radius: 0.39 },
    marksman: { hp: 57, speed: 1.62, damage: 19, range: 8.10, windup: 0.74, cooldown: 1.39, radius: 0.34 },
    saboteur: { hp: 72, speed: 2.06, damage: 24, range: 5.85, windup: 0.72, cooldown: 1.71, radius: 0.35 },
    boss: { hp: 405, speed: 2.24, damage: 34, range: 2.78, windup: 0.83, cooldown: 0.92, radius: 0.58 },
  };
  const bossPacing = {
    warden: { speed: .82, pause: 1.35 }, hunter: { speed: 1.25, pause: .94 },
    engine: { speed: .94, pause: 1.16 }, beast: { speed: 1.10, pause: 1.05 },
  };
  const playerWeapons = {
    sword: { reach: 1.8, angle: .38 },
    hammer: { reach: 1.65, angle: .36, interval: 1.30, intervalOffset: .06, minimum: .18, impact: .53, stagger: .20 },
    rapier: { reach: 2.28, angle: .73, impact: .33, step: .17, power: .96 },
    daggers: { reach: 1.26, angle: .54, impact: .27, step: .12, power: .92 },
    maul: { reach: 1.76, angle: .36, interval: 1.49, intervalOffset: .10, minimum: .25, impact: .62, stagger: .30, power: 1.15 },
    poleaxe: { reach: 2.58, angle: .65, interval: 1.28, intervalOffset: .05, minimum: .16, impact: .48, stagger: .16 },
    sabre: { reach: 2.11, angle: .18, power: .97 },
    greatsword: { reach: 2.35, angle: .44, interval: 1.36, intervalOffset: .05, minimum: .15, impact: .56, pierce: .17, power: 1.07 },
    twinblades: { reach: 1.42, angle: .55, step: .23, impact: .28, power: .89 },
    hooks: { reach: 1.62, angle: .56, impact: .39, counter: .22, power: .92 },
    staff: { reach: 6.7, interval: 1.87, intervalOffset: .10, minimum: .32, swing: .39, impact: .55, projectile: "spell", speed: 9.5, power: .82 },
    orb: { reach: 7.15, interval: 1.98, intervalOffset: .10, minimum: .34, swing: .43, impact: .55, projectile: "spell", speed: 10, pierce: .13, power: .81 },
    bow: { reach: 6.05, interval: 1.62, intervalOffset: .10, minimum: .27, swing: .35, impact: .51, projectile: "arrow", speed: 13.5, power: .86 },
    crossbow: { reach: 6.55, interval: 1.80, intervalOffset: .10, minimum: .29, swing: .36, impact: .43, projectile: "arrow", speed: 15, pierce: .10, power: .86 },
    gauntlets: { reach: .95, angle: .58, impact: .24, step: .10, stagger: .12, power: .94 },
    tonfa: { reach: 1.12, angle: .46, impact: .30, step: .13, stagger: .18, power: .92 },
  };
  const movement = {
    up: ["KeyW", "ArrowUp"], down: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"],
  };
  const gameKeys = new Set([...Object.values(movement).flat(), "Space", "ShiftLeft", "ShiftRight", "KeyE", "KeyF"]);
  const keys = new Set();
  const touchPointers = new Map();
  let attackPointer = null;
  let run;
  let stage;
  let state;
  let minimapBackground;
  let adminRun = false;
  let allocation;
  let action;
  let notificationUntil = 0;
  let reducedMotion = motionPreference?.matches ?? false;
  let previousTime = performance.now();
  let trackName = "";
  let activeCoach;
  let coachAnchor;

  function randomFrom(seed) {
    let value = seed;
    const next = () => {
      value = (value + 0x6d2b79f5) | 0;
      let result = Math.imul(value ^ (value >>> 15), value | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
    next.snapshot = () => value;
    return next;
  }

  function setText(name, text) {
    if (elements[name].textContent !== text) elements[name].textContent = text;
  }

  function goldText(value) {
    return String(Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0);
  }

  function distance(from, to) {
    return Math.hypot(to.x - from.x, to.y - from.y);
  }

  function direction(x, y) {
    const size = Math.hypot(x, y);
    return size > 0.001 ? { x: x / size, y: y / size } : null;
  }

  function normalizeDifficulty(value) {
    return Object.hasOwn(difficulties, value) ? value : "easy";
  }

  function difficultyRules() {
    return difficulties[run?.difficulty] ?? difficulties.easy;
  }

  function isOpen(x, y, radius) {
    if (x < radius || y < radius || x > state.map.width - radius || y > state.map.height - radius) return false;
    return state.obstacles.every((wall) => {
      if (wall.gateLeaf && state.gateMarker?.openProgress >= 1) return true;
      const gapX = Math.max(0, Math.abs(x - wall.x) - wall.w / 2);
      const gapY = Math.max(0, Math.abs(y - wall.y) - wall.h / 2);
      return gapX * gapX + gapY * gapY >= radius * radius;
    });
  }

  function elevationAt({ x, y }) {
    return state.elevation ? content.heightAt(state.elevation, x, y) : 0;
  }

  function walkable(x, y, radius) {
    return isOpen(x, y, radius) && content.isDry(state.elevation, state.terrain, x, y, radius);
  }

  function openStep(from, x, y, radius) {
    return walkable(x, y, radius) && content.canTraverse(state.elevation, from.x, from.y, x, y);
  }

  function withinTier(from, to, tolerance = 0.65) {
    return Math.abs(elevationAt(from) - elevationAt(to)) <= tolerance;
  }

  function closeReach(from, to) {
    return withinTier(from, to) && content.canTraverse(state.elevation, from.x, from.y, to.x, to.y) &&
      content.isDry(state.elevation, state.terrain, (from.x + to.x) / 2, (from.y + to.y) / 2);
  }

  function move(actor, dx, dy, radius) {
    const { x, y } = actor;
    if (actor === state.player && state.elevation && dx && dy && openStep(actor, x + dx, y + dy, radius)
        && walkable(x + dx / 2, y + dy / 2, radius)) {
      actor.x += dx;
      actor.y += dy;
      return true;
    }
    if (dx && openStep(actor, actor.x + dx, actor.y, radius)) actor.x += dx;
    if (dy && openStep(actor, actor.x, actor.y + dy, radius)) actor.y += dy;
    return x !== actor.x || y !== actor.y;
  }

  function createPlayer(health, stats, spawn) {
    return {
      ...spawn, hp: health, maxHp: stats.maxHp, facingX: 1, facingY: 0,
      weapon: village.weaponFor(run?.classId).id,
      velocityX: 0, velocityY: 0,
      attackFlash: 0, invulnerable: 0, dashFlash: 0, attackCooldown: 0,
      parryExpiresAt: null, parryReadyAt: 0, pendingHits: [],
      attackVariant: 2, swingLife: 0, nextComboUntil: 0,
      dashCooldown: 0, dashRemaining: 0, dashX: 0, dashY: 0, dashStrikeUntil: 0,
    };
  }

  function createEnemy(enemy, index, floor = state.floor, damageMultiplier = 1) {
    const base = enemyTypes[enemy.kind];
    const difficulty = difficultyRules();
    const depth = Math.max(0, floor - 3);
    const creature = enemy.faction === "creature";
    const hp = Math.round(base.hp * (1 + depth * 0.064) * (enemy.elite ? 1.24 : 1) * difficulty.health);
    return {
      ...enemy, id: index, hp, maxHp: hp, windup: 0, attackRange: base.range,
      damage: Math.round(((base.damage + (enemy.elite ? 3 : 0)) * (1 + depth * 0.040) + (creature ? 3 : 0))
        * damageMultiplier * difficulty.damage),
      guarded: enemy.kind === "warden", marked: Boolean(enemy.target),
      stellar: floor === content.floorCount && enemy.kind === "boss",
      flash: 0, cooldown: (floor === 1 ? 0.83 : 0.66) + index % 4 * 0.13,
      facingX: -1, facingY: 0, steering: 0,
    };
  }

  function createRun(survivor) {
    const seeds = crypto.getRandomValues(new Uint32Array(content.floorCount + 1));
    const progress = survivor ? { ...survivor.progress, level: 1, xp: 0 }
      : rpg.createProgress(adminRun ? undefined : allocation);
    const classId = survivor?.classId ?? null;
    const stats = village.applyClass(rpg.getStats(progress), classId);
    const selectedDifficulty = elements["run-difficulty"].querySelector("input:checked")?.value;
    const difficulty = normalizeDifficulty(survivor?.difficulty ?? (adminRun ? "easy" : selectedDifficulty));
    return { random: randomFrom(seeds[0]), floorSeeds: seeds.slice(1), gold: survivor?.gold ?? 0, seconds: 0, cleared: 0,
      rewards: survivor?.rewards ?? [], totalClears: survivor?.totalClears ?? 0, nextRewardId: survivor?.nextRewardId ?? 0,
      trials: [], progress, stats, classId, difficulty, quests: [], villageVisits: {}, nextWard: 0, nextPower: 0 };
  }

  function newRun(jumpFloor) {
    adminRun = jumpFloor !== undefined;
    run = createRun();
    renderGear();
    enterFloor(jumpFloor ?? 1, run.stats.maxHp);
  }

  function viewFloor(number, data, health, mode, damageMultiplier = 1) {
    return {
      floor: number,
      kind: data.kind, theme: data.theme, region: data.region, revealed: false,
      map: { width: data.width, height: data.height },
      facility: data.facility ?? null,
      elevation: data.elevation ?? null,
      player: createPlayer(health, run?.stats ?? previewStats, data.spawn),
      enemies: data.enemies.map((enemy, index) => createEnemy(enemy.kind === "boss" ? { ...enemy, bossProfile: data.bossProfile } : enemy,
        index, number, damageMultiplier)),
      obstacles: data.obstacles,
      terrain: (data.terrain ?? []).map((surface) => ({ ...surface, status: "idle" })),
      items: data.items.map((item) => ({ ...item, collected: false, active: item.kind !== "exit" })),
      hazard: data.hazard, hazardTiles: [], bossTargets: [], bossShockCooldown: 0, projectiles: [], playerProjectiles: [],
      timeLimit: data.timeLimit, alarm: false, patrolsArrived: false, hitCount: 0,
      bossPhaseTwo: false, bossFirstRelease: false, bossOverdrive: false, overdriveReleased: false,
      bossSignatureIndex: 0, shockBursts: 0, shockHits: 0,
      mortarTargets: [],
      ward: 0, overclock: 0,
      wave: 1, waveArrival: 0, effects: [], cameraShake: 0, cameraShakeEnabled: !reducedMotion,
      elapsed: 0, revealTimer: 0, mode,
    };
  }

  function enterFloor(number, health, routeId) {
    clearInput();
    elements["entry-continue"].hidden = true;
    saveCheckpoint(number, health, routeId);
    if (content.isShelterFloor(number)) {
      openShelter(number, health);
      return;
    }
    const floorSeed = run.floorSeeds[number - 1] ?? crypto.getRandomValues(new Uint32Array(1))[0];
    stage = content.createFloor(number, randomFrom(floorSeed), "combat", {}, { seed: floorSeed });
    const routeEffects = content.routes.find(({ id }) => id === routeId)?.effects ?? {};
    state = viewFloor(number, stage, health, "playing", routeEffects.enemyDamageMultiplier);
    state.routeId = routeId;
    state.routeEffects = routeEffects;
    state.ward = run.nextWard + (routeEffects.ward ?? 0);
    state.overclock = run.nextPower;
    run.nextWard = 0;
    run.nextPower = 0;
    if (state.hazard === "sparks") {
      const locations = [
        [0.2, 0.37], [0.38, 0.56], [0.55, 0.25], [0.31, 0.73], [0.64, 0.67], [0.81, 0.47], [0.82, 0.83],
      ].map(([x, y]) => ({ x: state.map.width * x, y: state.map.height * y }))
        .filter(({ x, y }) => walkable(x, y, 0.84));
      const offset = Math.floor(run.random() * Math.max(1, locations.length));
      state.sparkLocations = locations.slice(offset).concat(locations.slice(0, offset));
      state.sparkCycle = -1;
    }
    installCombatExit();
    renderFloorSteps();
    if (stage.rolls.length) startEntry();
    else beginFloor();
    syncHUD();
  }

  function installCombatExit(occupants) {
    const position = content.combatExit(stage, occupants);
    const marker = position ?? stage.spawn;
    state.gateMarker = { ...marker, type: "departure", active: false, openProgress: 0 };
    state.obstacles = state.obstacles.filter((wall) => !wall.gateDecor);
    if (position) state.obstacles.push(...content.exitGateWalls(position));
    state.items = state.items.filter((entry) => entry.kind !== "exit");
  }

  function saveCheckpoint(floor, health, route, scene) {
    if (adminRun) return false;
    const { random, stats, floorSeeds, ...data } = run;
    try {
      localStorage.setItem(checkpointKey, JSON.stringify({ floor, health, route, randomSeed: random.snapshot(), scene,
        run: { ...data, floorSeeds: [...floorSeeds] } }));
      return true;
    } catch {
      return false;
    }
  }

  function readCheckpoint() {
    try {
      const saved = JSON.parse(localStorage.getItem(checkpointKey));
      if (!saved?.run?.progress?.build || !Array.isArray(saved.run.rewards) || !Array.isArray(saved.run.floorSeeds) ||
          !Number.isInteger(saved.floor) || saved.floor < 1 || saved.floor > content.floorCount) return null;
      return saved;
    } catch {
      return null;
    }
  }

  function hasSavedScene(saved) {
    const scene = saved.scene;
    const snapshot = scene?.state;
    return scene?.version === 1 && snapshot?.floor === saved.floor &&
      scene.stage?.width > 0 && scene.stage?.height > 0 && snapshot.map?.width > 0 && snapshot.map?.height > 0 &&
      dialogModes.has(snapshot.mode) && Number.isFinite(snapshot.player?.x) && Number.isFinite(snapshot.player?.y) &&
      Number.isFinite(snapshot.player?.hp) && Array.isArray(snapshot.enemies) &&
      (snapshot.mode !== "rolling" || (Array.isArray(snapshot.entryRolls) && ["throw", "settle", "open"].includes(snapshot.entryPhase))) &&
      (snapshot.mode !== "gear" || snapshot.rewardOffer?.candidates?.length > 0) &&
      (snapshot.mode !== "branch" || (Array.isArray(snapshot.branchOffers) && snapshot.branchOffers.length > 0 &&
        snapshot.branchOffers.every((id) => content.routes.some((route) => route.id === id))));
  }

  function restoreScene({ stage: savedStage, state: savedState }) {
    clearInput();
    elements["entry-continue"].hidden = true;
    notify(null);
    stage = savedStage;
    state = savedState;
    if (!state.shelter && state.gateMarker?.type !== "departure") {
      installCombatExit([state.player, ...livingEnemies()]);
    }
    state.cameraShakeEnabled = !reducedMotion;
    renderFloorSteps();
    switch (state.mode) {
      case "rolling":
        presentEntry();
        break;
      case "gear":
        presentReward(state.rewardOffer, run.selectedReward?.id);
        break;
      case "branch":
        chooseRoute(state.branchOffers);
        break;
      default:
        enterPlayableScene();
        break;
    }
    syncHUD();
  }

  function restoreCheckpoint(saved) {
    adminRun = false;
    try {
      const { storyChoices, scenesSeen, localPlans, ...runData } = saved.run;
      const equipped = new Set(runData.progress.gearIds);
      let legacyRecovery = 0;
      const inventory = runData.rewards.map((entry) => {
        if (entry.kind !== "gear") return entry;
        if (equipped.delete(entry.item.id)) legacyRecovery += entry.item.bonus?.healOnKill ?? 0;
        const item = rewards.storedGear(entry.item);
        const version = item.id.lastIndexOf("@");
        rpg.rewardGear({ ...item, id: item.id.slice(0, version) });
        return { ...entry, item };
      });
      const owned = inventory.filter(({ kind }) => kind === "gear").map(({ item }) => item.id);
      const progress = rpg.gainStat(rpg.removeGear(runData.progress, owned), "healOnKill", legacyRecovery);
      run = { ...runData, progress, rewards: inventory, difficulty: normalizeDifficulty(runData.difficulty),
        classId: runData.classId ?? null, quests: village.migrateQuests(runData.quests), villageVisits: runData.villageVisits ?? {},
        random: randomFrom(saved.randomSeed), stats: village.applyClass(rpg.getStats(progress), runData.classId) };
      renderGear();
      if (hasSavedScene(saved)) {
        restoreScene(saved.scene);
      } else {
        const health = Math.min(run.stats.maxHp, Math.max(1, saved.health ?? run.stats.maxHp));
        enterFloor(saved.floor, health, saved.route);
      }
      return true;
    } catch {
      return false;
    }
  }

  function refreshAudioUI() {
    const playing = audio.active();
    elements["audio-toggle"].setAttribute("aria-pressed", String(playing));
    setText("audio-toggle", playing ? "음악 켬" : "음악 끔");
    setText("music-track", playing ? trackName : "");
    elements["music-track"].hidden = !playing || !trackName;
  }

  function syncMusic() {
    if (state.mode === "playing") {
      if (state.shelter) {
        trackName = audio.cue("shelter");
      } else {
        const boss = state.kind === "boss";
        const roster = livingEnemies().map((enemy) => enemy.kind + (enemy.elite ? " elite" : "")).sort();
        const phase = boss ? (state.bossPhaseTwo ? 1 : 0) + (state.bossOverdrive ? 1 : 0) : state.wave - 1 + Number(state.alarm);
        trackName = audio.cue(boss ? "boss" : state.theme, { theme: state.theme, floor: state.floor, foes: roster.join("/"), phase });
      }
    } else {
      const menus = { title: "title", menu: "title", rolling: "entry", shelter: "shelter", tutorial: state.shelter ? "shelter" : "entry",
        gear: "reward", branch: "reward", defeat: "defeat", victory: "victory" };
      trackName = audio.cue(menus[state.mode]);
    }
    refreshAudioUI();
  }

  function clearInput() {
    keys.clear();
    touchPointers.clear();
    attackPointer = null;
  }

  function hasRunDialog() {
    return elements["status-dialog"].open || elements["pause-dialog"].open;
  }

  function canOpenRunDialog() {
    return Boolean(run) && dialogModes.has(state.mode) && !window.TowerAdmin?.isOpen();
  }

  function setDetailList(name, entries) {
    elements[name]?.replaceChildren(...entries.flatMap(([label, value]) => {
      const term = document.createElement("dt");
      const detail = document.createElement("dd");
      term.textContent = label;
      detail.textContent = value;
      return [term, detail];
    }));
  }

  function renderStatusDialog() {
    const player = state.player;
    const progress = run.progress;
    const weapon = village.weaponFor(run.classId);
    const battleWeapon = playerWeapons[player.weapon] ?? playerWeapons.sword;
    const route = state.routeEffects ?? {};
    setDetailList("status-summary", [
      ["현재 층", state.floor + "층"], ["난이도", difficultyRules().name],
      ["직업", village.classById(run.classId)?.title ?? "등반가"], ["레벨", "Lv. " + progress.level],
      ["체력", Math.ceil(player.hp) + " / " + player.maxHp], ["소지 금화", goldText(run.gold) + " 금화"],
      ["보호막", String(Math.ceil(state.ward))],
    ]);
    const equipped = rpg.equippedBySlot(progress);
    setDetailList("status-gear", [["전투 무기", weapon.label + " · " + weapon.attackLabel],
      ...rpg.slots.flatMap(({ id, title }) => {
        const items = equipped.get(id) ?? [];
        return items.length ? items.map((item, index) =>
          [title + " " + (index + 1), [item.title, item.tag].filter(Boolean).join(" · ")]) : [[title, "비어 있음"]];
      })]);
    const availableGear = packEntries(equipped).filter(({ kind }) => kind === "gear").map(({ item }) => {
      const slot = rpg.slots.find(({ id }) => id === item.slot);
      return [item.title, [slot?.title ?? "장비", item.tag].filter(Boolean).join(" · ")];
    });
    setDetailList("status-available-gear", availableGear.length ? availableGear : [["보유 장비", "가방에 장비가 없습니다."]]);
    setDetailList("status-stats", [
      ...rpg.attributes.map(({ id, title }) => [title, statValue(id, (progress.build[id] ?? 0) + (progress.earnedAttributes?.[id] ?? 0))]),
      ["기본 타격", statValue("damage", currentAttackDamage(battleWeapon, route))],
      ["사거리", statValue("attackRange", currentAttackRange(battleWeapon, route))],
      ["공격 간격", statValue("attackCooldown", currentAttackInterval(battleWeapon, route))],
      ["이동 속도", statValue("speed", run.stats.speed * (route.speedMultiplier ?? 1))],
      ["처치 시 회복", statValue("healOnKill", killRecovery()) + " / " + rpg.killRecoveryCap],
      ["받는 피해 감소", statValue("damageReduction", Math.min(.70, run.stats.damageReduction + (route.damageReductionBonus ?? 0)))],
    ]);
    const quests = run.quests.map((quest) => {
      const entry = document.createElement("li");
      const title = document.createElement("strong");
      const progressText = document.createElement("span");
      title.textContent = quest.title;
      progressText.textContent = village.questReady(quest) ? "완료 · 보상 수령 가능" : "진행 중 · " + quest.progress + " / " + quest.goal.count;
      entry.append(title, progressText);
      return entry;
    });
    if (!quests.length) {
      const empty = document.createElement("li");
      empty.textContent = "진행 중인 의뢰가 없습니다.";
      quests.push(empty);
    }
    elements["status-quests"].replaceChildren(...quests);
  }

  function toggleRunDialog(dialog) {
    if (dialog.open) {
      dialog.close();
      return;
    }
    if (!canOpenRunDialog() || hasRunDialog()) return;
    dialogFocus.set(dialog, document.activeElement);
    clearInput();
    if (dialog === elements["status-dialog"]) {
      renderStatusDialog();
    } else {
      elements["pause-save-error"].hidden = true;
      setText("pause-exit", adminRun ? "나가기" : "저장하고 나가기");
    }
    dialog.showModal();
  }

  function returnFromDialog({ currentTarget }) {
    const focus = dialogFocus.get(currentTarget);
    dialogFocus.delete(currentTarget);
    if (hasRunDialog()) return;
    clearInput();
    if (focus?.isConnected && !focus.closest("[hidden]")) focus.focus({ preventScroll: true });
  }

  function panel({ kicker, title, copy, options = [], primary, activate, questCards }) {
    clearInput();
    setText("overlay-kicker", kicker);
    setText("overlay-title", title);
    setText("overlay-copy", copy);
    elements["build-editor"].hidden = state.mode !== "menu";
    elements["gear-compare"].hidden = state.mode !== "gear";
    elements.overlay.dataset.mode = state.mode;
    shell.dataset.appMode = state.mode;
    canvas.tabIndex = -1;
    if (state.mode === "title") canvas.setAttribute("aria-hidden", "true");
    else canvas.removeAttribute("aria-hidden");
    elements.overlay.scrollTop = 0;
    elements["game-stage"].dataset.mode = state.mode;
    const choices = questCards ? questCards.map(renderQuestCard) : options.map(({ id, title, description, detail, choose, rpgChoice, rarity, disabled, icon, price }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "route-choice";
      if (id) button.dataset.choice = id;
      if (state.mode === "gear") button.setAttribute("aria-pressed", "false");
      if (rpgChoice) button.classList.add("rpg-choice");
      if (rarity) button.dataset.rarity = rarity;
      button.disabled = Boolean(disabled);
      if (icon) {
        const emblem = document.createElement("span");
        emblem.className = "choice-icon";
        emblem.setAttribute("aria-hidden", "true");
        emblem.textContent = icon;
        button.append(emblem);
      }
      for (const [tag, text] of [["strong", title], ["span", description], ["small", detail]]) {
        if (!text) continue;
        const part = document.createElement(tag);
        if (tag === "small") part.className = "choice-meta";
        part.textContent = text;
        button.append(part);
      }
      if (price) {
        const priceLabel = document.createElement("span");
        priceLabel.className = "choice-price";
        priceLabel.textContent = price;
        button.append(priceLabel);
      }
      button.addEventListener("click", choose);
      return button;
    });
    elements["overlay-choices"].replaceChildren(...choices);
    action = activate;
    elements["primary-action"].hidden = !primary;
    elements["primary-action"].disabled = false;
    if (primary) setText("primary-action", primary);
    elements.overlay.hidden = false;
    renderPack();
    syncMusic();
    setText("live-status", title);
    const firstOption = elements["overlay-choices"].querySelector(questCards ? ".quest-action-primary:enabled" : "button:enabled");
    const focusTarget = firstOption ?? (primary ? elements["primary-action"] : elements.overlay);
    if (focusTarget === elements.overlay) focusTarget.tabIndex = -1;
    focusTarget.focus({ preventScroll: true });
  }

  function remainingPoints() {
    return rpg.startingPoints - Object.values(allocation).reduce((total, points) => total + points, 0);
  }

  function setupTitle(menu = false) {
    adminRun = false;
    run = undefined;
    stage = null;
    state = viewFloor(1, entrance, previewStats.maxHp, "title");
    elements.overlay.dataset.titleMenu = String(menu);
    notify(null);
    renderGear();
    renderFloorSteps();
    syncHUD();
    const checkpoint = menu ? readCheckpoint() : null;
    const options = [];
    if (checkpoint) options.push({
      id: "resume", title: "이어하기", description: checkpoint.floor + (hasSavedScene(checkpoint) ? "층 저장 지점 · " : "층 입장부터 · ") +
        difficulties[normalizeDifficulty(checkpoint.run.difficulty)].name,
      choose: () => { if (!restoreCheckpoint(checkpoint)) setupBuild(); },
    });
    if (menu) options.push({
      id: "new-run", title: "새 등반", description: checkpoint ? "1층에 들어가면 새 기록이 저장됩니다." : "능력치 5점을 배분해 전투를 준비합니다.",
      choose: setupBuild,
    });
    panel({ kicker: "", title: "Brassen Tower", copy: menu ? "" : "전투를 돌파하며 탑을 오르는 액션 로그라이크 · 1–20층 체험판",
      options, primary: menu ? undefined : "시작",
      activate: () => {
        audio.unlock().then(refreshAudioUI);
        setupTitle(true);
      } });
  }

  function updateBuild() {
    const remaining = remainingPoints();
    setText("build-points", String(remaining));
    for (const row of elements["build-stats"].children) {
      const [minus, plus] = row.querySelectorAll("button");
      const points = allocation[plus.dataset.stat];
      row.querySelector("output").textContent = String(points);
      minus.disabled = points <= 0;
      plus.disabled = remaining <= 0;
    }
    const { maxHp, damage } = rpg.getStats(rpg.createProgress(allocation));
    state.player.hp = maxHp;
    state.player.maxHp = maxHp;
    setText("overlay-copy", "최대 체력 " + maxHp + " · 공격력 " + damage);
    elements["primary-action"].disabled = remaining > 0;
  }

  function setupBuild() {
    run = undefined;
    rpg.removeGear(rpg.createProgress(), new Set());
    stage = null;
    allocation = Object.fromEntries(rpg.attributes.map(({ id }) => [id, 0]));
    const defaultDifficulty = elements["run-difficulty"].querySelector('input[value="easy"]');
    defaultDifficulty.checked = true;
    state = viewFloor(1, entrance, previewStats.maxHp, "menu");
    notify(null);
    renderGear();
    renderFloorSteps();
    syncHUD();
    panel({
      kicker: "새 등반",
      title: "스탯 배분",
      copy: "",
      primary: "등반 시작",
      activate: () => {
        if (state.mode === "menu" && remainingPoints() === 0) newRun();
      },
    });
    elements["build-stats"].replaceChildren(...rpg.attributes.map(({ id, title, effect }) => {
      const row = document.createElement("div");
      row.className = "build-stat";
      const info = document.createElement("div");
      const label = document.createElement("strong");
      label.textContent = title;
      const detail = document.createElement("small");
      detail.textContent = effect;
      info.append(label, detail);
      const createStep = (step) => {
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.stat = id;
        button.dataset.step = String(step);
        button.textContent = step > 0 ? "+" : "−";
        button.setAttribute("aria-label", title + (step > 0 ? " 올리기" : " 내리기"));
        return button;
      };
      const value = document.createElement("output");
      value.setAttribute("aria-label", title + " 투자 포인트");
      row.append(info, createStep(-1), value, createStep(1));
      return row;
    }));
    updateBuild();
    defaultDifficulty.focus({ preventScroll: true });
  }

  function enterPlayableScene() {
    state.mode = "playing";
    state.revealed = true;
    shell.dataset.appMode = state.mode;
    elements["game-stage"].dataset.mode = state.mode;
    elements.overlay.hidden = true;
    renderPack();
    syncMusic();
    setText("live-status", stage.title + ". " + stage.objective);
    canvas.removeAttribute("aria-hidden");
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
  }

  function setEntryTiming() {
    state.reducedMotion = reducedMotion;
    state.entryElapsed = 0;
    state.entryTicks = 0;
    state.entrySettleAt = reducedMotion ? 0 : 1780;
    state.entryOpenAt = state.entrySettleAt;
    state.entryDuration = state.entryOpenAt + (reducedMotion ? 180 : 550);
    state.entryPhase = "throw";
  }

  function startEntry() {
    state.mode = "rolling";
    state.entryRolls = stage.rolls;
    setEntryTiming();
    presentEntry();
  }

  function presentEntry() {
    shell.dataset.appMode = state.mode;
    elements["game-stage"].dataset.mode = state.mode;
    elements.overlay.hidden = true;
    elements.notification.hidden = true;
    renderPack();
    syncMusic();
    setText("live-status", state.kind === "boss" ? "보스전 주사위 굴리는 중" : "주사위 굴리는 중");
    canvas.removeAttribute("aria-hidden");
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
    if (state.entryPhase === "settle" || (state.entryPhase === "throw" && state.reducedMotion)) {
      settleEntry();
    } else if (state.entryPhase === "open") {
      setText("live-status", "전투 입구가 열립니다.");
    }
  }

  function settleEntry() {
    state.entryPhase = "settle";
    state.entryElapsed = state.entrySettleAt;
    const button = elements["entry-continue"];
    button.hidden = false;
    const entry = state.kind === "boss" ? "보스전. " : "";
    setText("live-status", entry + "주사위가 멈췄습니다. 스페이스바를 누르거나 전투 시작을 선택하세요.");
    if (!window.TowerAdmin?.isOpen()) button.focus({ preventScroll: true });
  }

  function openEntry() {
    if (state.mode !== "rolling" || state.entryPhase !== "settle" || window.TowerAdmin?.isOpen()) return;
    if (state.floor === 1 && !hasSeenCoach("dice")) markCoachSeen("dice");
    state.entryPhase = "open";
    state.entryDuration = state.entryOpenAt + (reducedMotion ? 180 : 550);
    clearInput();
    elements["entry-continue"].hidden = true;
    setText("live-status", "전투 입구가 열립니다.");
    canvas.focus({ preventScroll: true });
  }

  function advanceEntry(gap) {
    if (state.entryPhase === "settle") return;
    state.entryElapsed += Math.min(65, gap);
    if (state.entryPhase === "open") {
      if (state.entryElapsed >= state.entryDuration) beginFloor();
      return;
    }
    const count = Math.min(state.entryRolls.length, dieRebounds.length);
    while (!state.reducedMotion && state.entryTicks < count &&
        state.entryElapsed >= state.entrySettleAt * dieRebounds[state.entryTicks]) {
      audio.dieTick(state.entryTicks);
      state.entryTicks++;
    }
    if (state.entryElapsed >= state.entrySettleAt) settleEntry();
  }

  function beginFloor() {
    state.reducedMotion = false;
    state.revealTimer = reducedMotion ? 0 : 1.05;
    state.cameraShake = reducedMotion ? 0 : 0.14;
    enterPlayableScene();
    const messages = [state.floor === 1 ? "경비대 접근 · 가까이서 공격하세요" : stage.title];
    if (state.floor === 2 && state.elevation) messages.push("계단으로 상단과 하단을 오갈 수 있습니다");
    if (run.pendingGear) {
      messages.push(run.pendingGear + " 장착");
      run.pendingGear = undefined;
      addEffect("loot", state.player, 0.70);
    }
    const {
      damageBonus, clearGoldBonus, clearXpBonus, dashCooldownMultiplier, entryGold, entryXp,
    } = state.routeEffects;
    if (entryGold) {
      creditGold(entryGold);
      messages.push("입장 금화 +" + goldText(entryGold));
    }
    if (entryXp) {
      const gainedXp = Math.round(entryXp * (1 + run.stats.xpBonus));
      const growth = awardXp(entryXp);
      messages.push("입장 경험치 +" + gainedXp, ...growth);
    }
    if (damageBonus) messages.push("공격력 " + statValue("damage", damageBonus, true));
    if (clearGoldBonus) messages.push("통과 보상 금화 +" + goldText(clearGoldBonus));
    if (clearXpBonus) messages.push("통과 보상 XP +" + clearXpBonus);
    if (dashCooldownMultiplier) {
      messages.push("대쉬 재사용 시간 " + (dashCooldownMultiplier < 1 ? "단축" : "증가"));
    }
    if (state.ward) messages.push("보호막 " + state.ward);
    if (state.overclock) messages.push("공급품 공격력 +" + state.overclock);
    notify(messages.join(" · "));
  }

  function guideForScene() {
    if (!run || adminRun || hasRunDialog()) return [];
    if (state.floor === 1) {
      if (state.mode === "rolling" && state.entryPhase === "settle") return ["dice"];
      if (state.mode === "gear") return ["reward"];
      if (state.mode === "branch") return ["route"];
      if (state.mode === "playing") return state.departure ? ["departure"] : ["movement", "attack", "defense"];
    }
    if (state.mode !== "playing") return [];
    if (state.floor === 2 && !state.combatComplete) return ["status", "pack"];
    if (state.floor === 5 && state.shelter && !state.departure) return ["town"];
    return [];
  }

  function hasSeenCoach(id) {
    if (!seenCoaches.has(id)) {
      let dismissed = false;
      try { dismissed = localStorage.getItem("brassen-coach-" + id) === "1"; } catch {}
      seenCoaches.set(id, dismissed);
    }
    return seenCoaches.get(id);
  }

  function markCoachSeen(id) {
    seenCoaches.set(id, true);
    try { localStorage.setItem("brassen-coach-" + id, "1"); } catch {}
  }

  function positionCoach() {
    if (!coachAnchor) return;
    const tip = elements["coach-tip"];
    const bounds = coachAnchor.getBoundingClientRect();
    const width = document.documentElement.clientWidth;
    const height = window.innerHeight;
    tip.hidden = !bounds.width || !bounds.height;
    if (tip.hidden) return;

    const edge = 8;
    const gap = 12;
    const box = tip.getBoundingClientRect();
    const rect = {
      left: Math.max(edge, Math.min(width - edge, bounds.left)),
      right: Math.max(edge, Math.min(width - edge, bounds.right)),
      top: Math.max(edge, Math.min(height - edge, bounds.top)),
      bottom: Math.max(edge, Math.min(height - edge, bounds.bottom)),
    };
    const centerX = (rect.left + rect.right) / 2;
    const centerY = (rect.top + rect.bottom) / 2;
    const options = {
      top: { x: centerX - box.width / 2, y: rect.top - gap - box.height },
      bottom: { x: centerX - box.width / 2, y: rect.bottom + gap },
      left: { x: rect.left - gap - box.width, y: centerY - box.height / 2 },
      right: { x: rect.right + gap, y: centerY - box.height / 2 },
    };
    const order = activeCoach === "pack" && bounds.top < height && bounds.bottom > 0
      ? ["left", "right", "top", "bottom"] : ["top", "bottom", "left", "right"];
    const fits = {
      top: options.top.y >= edge,
      bottom: options.bottom.y + box.height <= height - edge,
      left: options.left.x >= edge,
      right: options.right.x + box.width <= width - edge,
    };
    const side = order.find((candidate) => fits[candidate]) ?? (centerY >= height / 2 ? "top" : "bottom");
    const x = Math.max(edge, Math.min(width - box.width - edge, options[side].x));
    const y = Math.max(edge, Math.min(height - box.height - edge, options[side].y));
    const vertical = side === "top" || side === "bottom";
    const offset = vertical ? centerX - x : centerY - y;
    const limit = (vertical ? box.width : box.height) - 12;
    tip.dataset.side = side;
    tip.style.setProperty("--coach-left", x + "px");
    tip.style.setProperty("--coach-top", y + "px");
    tip.style.setProperty("--coach-arrow", Math.max(12, Math.min(limit, offset)) + "px");
  }

  function refreshCoach() {
    const tip = elements["coach-tip"];
    if (!tip) return;
    const remaining = guideForScene().filter((id) => !hasSeenCoach(id));
    const id = remaining[0];
    if (id === activeCoach) return;
    coachAnchor?.classList.remove("coach-target");
    coachAnchor = undefined;
    activeCoach = id;
    tip.hidden = true;
    if (!id) {
      delete tip.dataset.guide;
      return;
    }
    const step = coach[id];
    const touch = window.matchMedia?.("(pointer: coarse)")?.matches;
    coachAnchor = document.querySelector((touch && step.touch) || step.target);
    if (!coachAnchor) return;
    coachAnchor.classList.add("coach-target");
    tip.dataset.guide = id;
    setText("coach-next", remaining.length > 1 ? "다음" : "확인");
    setText("coach-text", (touch && step.touchText) || step.text);
    positionCoach();
  }

  function nextCoach() {
    if (!activeCoach) return;
    const previous = coachAnchor;
    markCoachSeen(activeCoach);
    refreshCoach();
    if (coachAnchor) {
      const rect = coachAnchor.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        coachAnchor.scrollIntoView({ block: "nearest" });
        positionCoach();
      }
    } else if (!activeCoach && previous?.matches("button, summary")) {
      previous.focus({ preventScroll: true });
    } else if (!activeCoach && state.mode === "playing") {
      canvas.focus({ preventScroll: true });
    }
  }

  function openShelter(floor, health) {
    const seed = run.floorSeeds[floor - 1];
    const roll = randomFrom(seed);
    const plan = floor <= previewFloorLimit ? window.BrassenMapPlanner?.plan({ floor, seed, kind: "shelter", theme: "shelter",
      macro: 1 + Math.floor(roll() * 6), placement: 1 + Math.floor(roll() * 4), minor: 1 + Math.floor(roll() * 4) }) : null;
    const landing = shelter.create(floor, plan, { seed });
    stage = {
      ...landing, region: content.getRegion(floor), hazard: "none",
      objective: floor % 10 === 5 ? "장비를 정비하거나 의뢰를 받은 뒤 출발하세요." : "휴식하거나 장비를 정비한 뒤 출발하세요.",
    };
    state = viewFloor(floor, stage, health, "playing");
    state.landing = landing.fixture;
    state.shelter = landing;
    state.stations = landing.stations;
    notify(null);
    renderFloorSteps();
    enterPlayableScene();
    syncHUD();
  }

  function livingEnemies() {
    return state.enemies.filter((enemy) => enemy.hp > 0);
  }

  function renderFloorSteps() {
    const limit = adminRun ? content.floorCount : Math.max(previewFloorLimit, state.floor);
    const start = Math.max(1, Math.min(state.floor - 1, limit - 3));
    elements["floor-steps"].replaceChildren(...Array.from({ length: 4 }, (_, index) => {
      const floor = start + index;
      const step = document.createElement("span");
      step.className = "floor-step";
      step.textContent = floor + "층";
      if (floor <= (run?.cleared ?? 0)) {
        step.dataset.state = "cleared";
        step.setAttribute("aria-label", floor + "층 통과");
      } else if (floor === state.floor) {
        step.dataset.state = "current";
        step.setAttribute("aria-current", "step");
      } else {
        step.dataset.state = "locked";
      }
      return step;
    }));
  }

  function mapPolygon(context, points, fill, stroke) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.closePath();
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.stroke();
    }
  }

  function paintMinimapBackground(context, box) {
    const { width: cols, height: rows } = state.map;
    const unit = Math.min((box.width - 10) / (cols + rows), (box.height - 8) / (0.50 * (cols + rows)));
    const point = (x, y) => [box.width / 2 + (x - y - (cols - rows) / 2) * unit,
      box.height / 2 + (x + y - (cols + rows) / 2) * unit * 0.50];
    const shape = (x, y, w, h) => [point(x, y), point(x + w, y), point(x + w, y + h), point(x, y + h)];
    context.lineWidth = 1;
    mapPolygon(context, shape(0, 0, cols, rows), "#263d35", "#718e7e");
    const groundColors = { water: "#287b80", bridge: "#9d9f79", conduit: "#816e38", vent: "#764b36" };
    for (const { x, y, w, h, kind, status } of state.terrain) {
      const color = status === "active" ? "#ffd57d" : groundColors[kind];
      mapPolygon(context, shape(x - w / 2, y - h / 2, w, h), color);
    }
    if (state.elevation) {
      for (const { x, y, w, h } of state.elevation.decks) {
        mapPolygon(context, shape(x - w / 2, y - h / 2, w, h), "#536e70", "#9cb6a5");
      }
      for (const { x, y, w, h } of state.elevation.stairs) {
        mapPolygon(context, shape(x - w / 2, y - h / 2, w, h), "#e6b56f");
      }
    }
    for (const block of state.obstacles) {
      mapPolygon(context, shape(block.x - block.w / 2, block.y - block.h / 2, block.w, block.h),
        block.fixture ? "#9b845e" : block.structural ? "#566c71" : "#83917c",
        block.fixture ? "#cfb88b" : block.structural ? "#97b2b7" : null);
    }
    return { point };
  }

  function drawMinimap() {
    if (!state.revealed) return;
    const map = elements.minimap;
    const context = map.getContext("2d");
    if (!context) return;
    const box = map.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.round(box.width * dpr);
    const height = Math.round(box.height * dpr);
    if (width < 20 || height < 20) return;
    if (map.width !== width || map.height !== height) {
      map.width = width;
      map.height = height;
    }
    if (minimapBackground?.state !== state || minimapBackground.boxWidth !== box.width ||
        minimapBackground.boxHeight !== box.height || minimapBackground.dpr !== dpr ||
        minimapBackground.obstacles !== state.obstacles || minimapBackground.terrain !== state.terrain ||
        state.terrain.some((surface, index) => (surface.status === "active") !== minimapBackground.hazards[index])) {
      const image = minimapBackground?.image ?? document.createElement("canvas");
      image.width = width;
      image.height = height;
      const background = image.getContext("2d");
      background.setTransform(dpr, 0, 0, dpr, 0, 0);
      const projection = paintMinimapBackground(background, box);
      minimapBackground = {
        state, image, boxWidth: box.width, boxHeight: box.height, dpr,
        obstacles: state.obstacles, terrain: state.terrain,
        hazards: state.terrain.map((surface) => surface.status === "active"),
        ...projection,
      };
    }
    const { image, point } = minimapBackground;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.lineWidth = 1;
    for (const enemy of state.enemies) {
      if (enemy.hp <= 0) continue;
      const [x, y] = point(enemy.x, enemy.y);
      if (enemy.gateGuard) {
        mapPolygon(context, [[x - 3, y - 3], [x + 3, y - 3], [x + 2.5, y + 1], [x, y + 4.5], [x - 2.5, y + 1]],
          "#ffdd89", "#513a25");
        continue;
      }
      const size = enemy.kind === "boss" || enemy.marked ? 4 : 2;
      mapPolygon(context, [[x, y - size - 1], [x + size, y + size], [x - size, y + size]],
        enemy.marked ? "#ffd482" : ["sentry", "marksman", "mortar", "saboteur"].includes(enemy.kind) ? "#ef9af0" : "#f08c75");
    }
    const gate = state.gateMarker ?? state.stations?.find(({ kind }) => kind === "departure");
    if (gate) {
      const [x, y] = point(gate.x, gate.y);
      const open = state.shelter || gate.active;
      context.strokeStyle = open ? "#c5f7ae" : "#c1cbb9";
      if (open) {
        context.fillStyle = "#9ad879";
        context.fillRect(x - 3, y - 3, 6, 6);
      }
      context.strokeRect(x - 3, y - 3, 6, 6);
    }
    for (const item of state.items) {
      if (item.collected) continue;
      const [x, y] = point(item.x, item.y);
      mapPolygon(context, [[x, y - 4], [x + 4, y], [x, y + 4], [x - 4, y]], "#ffda8b", "#553c28");
    }
    const [x, y] = point(state.player.x, state.player.y);
    context.beginPath();
    context.arc(x, y, 3.4, 0, Math.PI * 2);
    context.fillStyle = "#90fbe0";
    context.fill();
    context.strokeStyle = "#123032";
    context.stroke();
  }

  function updateRunIndicators() {
    const active = state.revealed && state.mode === "playing" && !state.shelter;
    const hazard = state.revealed && state.hazard !== "none" ? stage.rule : "";
    setText("hazard-label", hazard);
    const tiers = state.revealed ? state.elevation : null;
    elements["elevation-label"].hidden = !tiers;
    elements["elevation-legend"].hidden = !tiers;
    if (tiers) {
      const z = elevationAt(state.player);
      const level = z < 0.04 ? "lower" : z > tiers.height - 0.04 ? "upper" : "stairs";
      setText("elevation-label", { lower: "하단", upper: "상단", stairs: "계단" }[level]);
      elements["elevation-label"].dataset.elevation = level;
      elements["elevation-label"].title = tiers.title;
    } else {
      setText("elevation-label", "");
      elements["elevation-label"].removeAttribute("data-elevation");
      elements["elevation-label"].removeAttribute("title");
    }
    const timer = elements["timer-label"];
    timer.hidden = !active || !state.timeLimit;
    if (!timer.hidden) {
      const left = Math.max(0, Math.ceil(state.timeLimit - state.elapsed));
      timer.dataset.urgent = String(left <= 12);
      setText("timer-label", state.alarm ? "경보 작동" : "경보까지 " + left + "초");
    }
    let threat = "";
    if (active && state.waveArrival) threat = "증원 접근 중";
    if (active && state.kind === "combat" && !state.waveArrival && state.hitCount === 0) threat = "무피격 +" + goldText(challengeGold) + " 금화";
    if (active && state.bossOverdrive) threat = "과열";
    setText("threat-label", threat);
    elements["threat-label"].hidden = !threat;
    const remaining = state.player.dashCooldown;
    elements["dash-state"].dataset.ready = String(remaining <= 0);
    setText("dash-state", remaining > 0 ? (Math.ceil(remaining * 10) / 10).toFixed(1) + "초" : "준비");
    const parryRemaining = state.player.parryReadyAt - state.elapsed;
    const parryState = parryRemaining > 0 ? "cooldown" : state.player.parryExpiresAt !== null ? "active" : "ready";
    elements["parry-state"].dataset.state = parryState;
    elements["parry-state"].dataset.ready = String(parryState === "ready");
    setText("parry-state", parryState === "cooldown" ? (Math.ceil(parryRemaining * 10) / 10).toFixed(1) + "초"
      : parryState === "active" ? "시도" : "준비");
  }

  function syncHUD() {
    const alive = livingEnemies();
    const maxHp = state.player.maxHp;
    const status = run ? rpg.getLevelStatus(run.progress) : null;
    setText("floor-value", state.floor + " / " + (adminRun ? content.floorCount : Math.max(previewFloorLimit, state.floor)));
    const region = state.revealed ? stage.region?.name ?? "" : "";
    setText("region-label", region);
    elements["region-label"].hidden = !region;
    setText("stage-title", state.revealed ? stage.title : "");
    elements["stage-title"].hidden = !state.revealed;
    const hasStatus = Boolean(run) && dialogModes.has(state.mode);
    elements["status-trigger"].hidden = !hasStatus;
    elements["pause-trigger"].hidden = !hasStatus;
    setText("objective", state.revealed ? (state.departure && !state.shelter ? "열린 출구로 이동하세요." : stage.objective) : "");
    if (minimapSection.hidden !== !state.revealed) minimapSection.hidden = !state.revealed;
    setText("health-label", Math.ceil(state.player.hp) + " / " + maxHp);
    setText("gold-value", goldText(run?.gold));
    const healthFill = elements["health-fill"];
    const health = state.player.hp / maxHp;
    const healthWidth = health * 100 + "%";
    if (healthFill.style.width !== healthWidth) healthFill.style.width = healthWidth;
    healthFill.classList.toggle("low", health < 0.35);
    setText("hero-label", run ? village.classById(run.classId)?.title ?? "등반가" : "새 등반");
    setText("level-value", status ? "Lv. " + status.level : "Lv. –");
    let xpLabel = "– XP";
    if (status) xpLabel = status.needed === null ? "최고 레벨" : status.current + " / " + status.needed + " XP";
    setText("xp-label", xpLabel);
    const xpPercent = String(Math.round((status?.ratio ?? 0) * 100));
    const xpFill = elements["xp-fill"];
    if (xpFill.style.width !== xpPercent + "%") {
      xpFill.style.width = xpPercent + "%";
      xpFill.closest('[role="progressbar"]')?.setAttribute("aria-valuenow", xpPercent);
    }
    let progress = "교전 " + state.wave + " · 남은 적 " + alive.length;
    if (state.kind === "boss") {
      const boss = state.enemies.find((enemy) => enemy.kind === "boss");
      if (boss) {
        progress = (stage.bossName ?? "수호자") + " " + Math.ceil(boss.hp / boss.maxHp * 100) + "%";
        if (boss.shielded) progress += " · 충격파 충전";
      }
    }
    if (!state.revealed || state.shelter || state.combatComplete) progress = "";
    setText("stage-progress", progress);
    updateRunIndicators();
  }

  function renderGear() {
    const equipped = run ? rpg.equippedBySlot(run.progress) : new Map();
    elements["gear-list"].replaceChildren(...rpg.slots.map((slot) => {
      const items = equipped.get(slot.id) ?? [];
      const box = document.createElement("div");
      box.className = items.length ? "gear-slot" : "gear-slot gear-slot-empty";
      box.dataset.slot = slot.id;
      const emblem = document.createElement("span");
      emblem.className = "gear-icon";
      emblem.textContent = slot.icon;
      emblem.setAttribute("aria-hidden", "true");
      const label = document.createElement("small");
      label.textContent = slot.title + " " + items.length + " / " + rpg.gearSlotCapacity;
      const info = document.createElement("div");
      info.className = "gear-slot-items";
      info.append(label);
      if (!items.length) {
        const empty = document.createElement("strong");
        empty.className = "gear-name";
        empty.textContent = "비어 있음";
        info.append(empty);
      }
      for (const item of items) {
        const row = document.createElement("div");
        row.className = "gear-equipped-item";
        row.dataset.rarity = item.rarity;
        const name = document.createElement("strong");
        name.className = "gear-name";
        name.textContent = item.title;
        row.append(name);
        if (item.tag) {
          const tag = document.createElement("small");
          tag.className = "gear-tag";
          tag.textContent = item.tag;
          row.append(tag);
        }
        info.append(row);
      }
      box.append(emblem, info);
      return box;
    }));
  }

  function recordReward(kind, item, amount = 1) {
    const earnedAt = run.totalClears + Number(run.cleared < state.floor);
    run.rewards.push({ uid: run.nextRewardId++, earnedAt, kind, item, amount });
  }

  function creditGold(amount) {
    if (!amount) return;
    recordReward("gold", null, amount);
    run.gold += amount;
  }

  function spendGold(amount) {
    run.gold -= amount;
    for (const entry of run.rewards) {
      if (entry.kind !== "gold" || amount <= 0) continue;
      const applied = Math.min(entry.amount, amount);
      entry.amount -= applied;
      amount -= applied;
    }
    run.rewards = run.rewards.filter((entry) => entry.amount > 0);
  }

  function describeSupply({ effects }) {
    const descriptions = {
      gold: "금화 +", heal: "체력 회복 +", xp: "경험치 +", ward: "다음 시련 보호막 +", overclock: "다음 시련 공격력 +",
    };
    return Object.entries(effects).map(([key, value]) => descriptions[key] + (key === "gold" ? goldText(value) : value)).join(" · ");
  }

  function equippedRecords(equipped) {
    const remaining = [...equipped.values()].flat().map(({ id }) => id);
    return new Set(run.rewards.filter((entry) => {
      if (entry.kind !== "gear") return false;
      const index = remaining.indexOf(entry.item.id);
      if (index === -1) return false;
      remaining.splice(index, 1);
      return true;
    }));
  }

  function packEntries(equipped) {
    if (!run) return [];
    const worn = equippedRecords(equipped);
    return run.rewards.filter((entry) => entry.kind !== "gold" && !worn.has(entry)).reverse();
  }

  function ownedGearIds() {
    return run.rewards.filter((entry) => entry.kind === "gear").map((entry) => entry.item.id);
  }

  function renderPack() {
    const pack = elements["pack-list"];
    const equipped = run && rpg.equippedBySlot(run.progress);
    const entries = packEntries(equipped);
    if (elements["pack-count"]) setText("pack-count", String(entries.length));
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "pack-empty";
      empty.textContent = "보유품 없음";
      pack.replaceChildren(empty);
      return;
    }
    const safe = packAvailable();
    pack.replaceChildren(...entries.map((entry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pack-item";
      const title = document.createElement("strong");
      const detail = document.createElement("small");
      title.textContent = entry.item.title;
      const items = entry.kind === "gear" ? equipped.get(entry.item.slot) ?? [] : [];
      const replaced = items.length >= rpg.gearSlotCapacity ? items[0] : null;
      button.disabled = !safe || entry.kind === "upgrade";
      detail.textContent = entry.kind === "gear"
        ? rpg.slots.find(({ id }) => id === entry.item.slot).title + " · " + entry.item.power + "층 보상" +
          (replaced ? " · " + replaced.title + " 교체" : "")
        : entry.kind === "supply" ? describeSupply(entry.item) : "공격력 +6 · 적용 중";
      button.append(title, detail);
      button.addEventListener("click", () => useOwnedReward(entry));
      return button;
    }));
  }

  function useOwnedReward(entry) {
    if (!packAvailable() || !run.rewards.includes(entry)) return;
    if (entry.kind === "gear" && equippedRecords(rpg.equippedBySlot(run.progress)).has(entry)) return;
    if (entry.kind === "gear") {
      updateProgress(rpg.equip(run.progress, entry.item.id), true);
      renderGear();
    } else if (entry.kind === "supply") {
      const { gold, heal, xp, ward, overclock } = entry.item.effects;
      run.rewards = run.rewards.filter((record) => record !== entry);
      creditGold(gold);
      if (heal) recoverHealth(heal);
      if (xp) awardXp(xp);
      run.nextWard += ward ?? 0;
      run.nextPower += overclock ?? 0;
    }
    if (state.mode === "gear" && run.selectedReward) showRewardComparison(run.selectedReward);
    if (state.mode === "branch") {
      setText("overlay-copy", "체력 " + Math.ceil(state.player.hp) + " / " + state.player.maxHp + " · 금화 " + goldText(run.gold));
    }
    if (state.mode === "playing" && state.shelter) saveVillage();
    syncHUD();
    renderPack();
    notify(entry.item.title + (entry.kind === "gear" ? " 장착" : " 사용"));
  }

  function packAvailable() {
    return ["gear", "branch", "playing"].includes(state.mode);
  }

  function currentClassStats(progress) {
    return village.applyClass(rpg.getStats(progress), run.classId);
  }

  function updateProgress(progress, keepHealth = false) {
    const player = state.player;
    const stats = currentClassStats(progress);
    const health = keepHealth ? player.hp : player.hp + stats.maxHp - player.maxHp;
    run.progress = progress;
    run.stats = stats;
    player.maxHp = stats.maxHp;
    player.hp = player.hp > 0 ? Math.max(1, Math.min(stats.maxHp, health)) : 0;
    player.weapon = village.weaponFor(run.classId).id;
  }

  function recoverHealth(amount) {
    const player = state.player;
    if (player.hp <= 0 || amount <= 0) return 0;
    const before = player.hp;
    player.hp = Math.min(player.maxHp, before + amount);
    return player.hp - before;
  }

  function killRecovery() {
    return run.progress.earned.healOnKill ?? 0;
  }

  function recoveryAllowance(draw) {
    const remaining = rpg.killRecoveryCap - killRecovery();
    return remaining > 0 && draw() < killRecoveryOfferChance ? remaining : 0;
  }

  function applyGearRecovery(progress, item) {
    return item.killRecovery ? rpg.gainStat(progress, "healOnKill", item.killRecovery) : progress;
  }

  function awardXp(amount) {
    const previous = run.progress;
    const progress = rpg.gainXp(previous, Math.round(amount * (1 + run.stats.xpBonus)), run.random);
    updateProgress(progress, true);
    const levelsGained = progress.level - previous.level;
    const recovery = recoverHealth(state.player.maxHp * .05 * levelsGained);
    const gains = rpg.levelAttributeGains(previous, run.progress).map(({ title, amount }) => title + " +" + amount);
    if (gains.length) {
      addEffect("level", state.player, 0.76);
      const messages = ["레벨 상승 · Lv. " + progress.level, ...gains];
      if (recovery > 0) messages.push("체력 " + statValue("maxHp", recovery, true));
      notify(messages.join(" · "), 3300);
    }
    return gains;
  }

  function notify(message, duration = 2200) {
    const element = elements.notification;
    if (!message) {
      element.hidden = true;
      return;
    }
    setText("notification", message);
    element.hidden = false;
    notificationUntil = performance.now() + duration;
  }

  function addEffect(kind, actor, life, amount) {
    state.effects.push({
      kind, x: actor.x, y: actor.y, life, maxLife: life, amount,
      facingX: actor.facingX, facingY: actor.facingY,
    });
  }

  function inputDirection() {
    const touches = [...touchPointers.values()];
    const isDown = (name) => movement[name].some((key) => keys.has(key)) || touches.includes(name);
    const x = Number(isDown("right")) - Number(isDown("left"));
    const y = Number(isDown("down")) - Number(isDown("up"));
    return direction(x + y, y - x);
  }

  function stairDirection(player, aim) {
    if (!aim || !state.elevation) return aim;
    const screenAim = direction(aim.x - aim.y, aim.x + aim.y);
    for (const stair of state.elevation.stairs) {
      const along = stair.axis;
      const across = along === "x" ? "y" : "x";
      const length = along === "x" ? stair.w : stair.h;
      const width = along === "x" ? stair.h : stair.w;
      if (Math.abs(player[along] - stair[along]) > length / 2 + 0.33 ||
          Math.abs(player[across] - stair[across]) > width / 2 - playerRadius * 0.6) continue;
      const projected = direction(along === "x" ? 1 : -1, 0.49 - stair.rise * state.elevation.height / length);
      const agreement = screenAim.x * projected.x + screenAim.y * projected.y;
      const forward = Math.abs(agreement) >= 0.60 ? Math.sign(agreement) : aim[along];
      if (Math.abs(forward) < 0.42) continue;
      const step = { x: player.x, y: player.y };
      step[along] += Math.sign(forward) * 0.18;
      if (!openStep(player, step.x, step.y, playerRadius)) continue;
      const guided = { [along]: Math.sign(forward), [across]: aim[across] * 0.16 };
      return direction(guided.x, guided.y);
    }
    return aim;
  }

  function setFacing(actor, aim) {
    if (!aim) return;
    actor.facingX = aim.x;
    actor.facingY = aim.y;
  }

  function enemiesInReach(range, ranged = false) {
    const player = state.player;
    return livingEnemies()
      .filter((enemy) => distance(player, enemy) <= range + enemyTypes[enemy.kind].radius &&
        (ranged || closeReach(player, enemy)) && hasLineOfSight(player, enemy, ranged))
      .sort((a, b) => distance(player, a) - distance(player, b));
  }

  function weaponAttackRange(weapon, stats, bonus = 0) {
    const reach = weapon.reach + stats.attackRange - 1.8 + bonus;
    return Math.max(.75, Math.min(weapon.projectile ? 8.6 : 3.15, reach));
  }

  function currentAttackRange(weapon, route) {
    return weaponAttackRange(weapon, run.stats, route.attackRangeBonus) * (state.hazard === "mist" ? 0.85 : 1);
  }

  function currentAttackInterval(weapon, route, stats = run.stats) {
    const multiplier = (route.attackCooldownMultiplier ?? 1) * (weapon.interval ?? 1);
    return Math.max(weapon.minimum ?? 0, rpg.attackInterval(stats, multiplier, weapon.intervalOffset));
  }

  function comparisonStats(progress) {
    const stats = currentClassStats(progress);
    const weapon = playerWeapons[village.weaponFor(run.classId).id] ?? playerWeapons.sword;
    return { ...stats, attackRange: weaponAttackRange(weapon, stats), attackCooldown: currentAttackInterval(weapon, {}, stats) };
  }

  function currentAttackDamage(weapon, route) {
    const workshopPower = run.rewards.filter((entry) => entry.kind === "upgrade").length * 6;
    return (run.stats.damage + (route.damageBonus ?? 0) + state.overclock + workshopPower) * (weapon.power ?? 1);
  }

  function compareGearOffer(item) {
    const gear = rpg.rewardGear(rewards.storedGear(item));
    const { replaced, changes } = rpg.compareGear(run.progress, gear.id, comparisonStats);
    const recoveryChange = rpg.compareStats(run.progress, applyGearRecovery(run.progress, item), comparisonStats);
    return { gear, replaced, changes: changes.concat(recoveryChange) };
  }

  function waitingForCombatStart(delay) {
    return !state.shelter && !state.combatComplete && state.elapsed + 0.000001 < delay;
  }

  function attack() {
    const player = state.player;
    if (state.mode !== "playing" || state.shelter || state.combatComplete || waitingForCombatStart(playerStartDelay) ||
        player.attackCooldown > Number.EPSILON || player.pendingStrike || player.dashRemaining > 0) return;
    const route = state.routeEffects ?? {};
    const weapon = playerWeapons[player.weapon] ?? playerWeapons.sword;
    const ranged = Boolean(weapon.projectile);
    const range = currentAttackRange(weapon, route);
    const target = enemiesInReach(range, ranged)[0];
    if (target) setFacing(player, direction(target.x - player.x, target.y - player.y));
    player.attackCooldown = currentAttackInterval(weapon, route);
    player.attackVariant = state.elapsed < player.nextComboUntil ? (player.attackVariant + 1) % 3 : 0;
    player.nextComboUntil = state.elapsed + 0.62;
    player.swingDuration = Math.min(weapon.swing ?? swingDurations[player.attackVariant], player.attackCooldown + 0.04);
    player.swingImpact = weapon.impact ?? .37;
    player.swingLife = player.swingDuration;
    player.attackFlash = player.swingDuration;
    player.pendingStrike = { at: state.elapsed + player.swingDuration * player.swingImpact, range, weapon,
      x: player.facingX, y: player.facingY, altitude: target ? elevationAt(target) : elevationAt(player),
      targetDistance: target ? distance(player, target) : range };
  }

  function applyPlayerStrike(enemy, weapon, aim) {
    const player = state.player;
    let healthLimit = 0;
    if (enemy.kind === "boss") {
      if (!state.bossFirstRelease) healthLimit = Math.floor(enemy.maxHp / 2);
      else if (!state.overdriveReleased) healthLimit = Math.floor(enemy.maxHp * 0.27);
    }
    if (enemy.hp <= healthLimit) return false;
    const route = state.routeEffects ?? {};
    const damage = currentAttackDamage(weapon, route);
    const dashDamage = state.elapsed < player.dashStrikeUntil ? run.stats.dashStrike + (route.dashStrikeBonus ?? 0) : 0;
    player.dashStrikeUntil = 0;
    const finishing = enemy.hp <= enemy.maxHp * 0.30 ? run.stats.finishingDamage : 0;
    const counter = state.elapsed < (player.counterUntil ?? 0) ? damage * (weapon.counter ?? 0) : 0;
    player.counterUntil = 0;
    const frontal = !aim || aim.x * enemy.facingX + aim.y * enemy.facingY <= -0.38;
    const guardBreak = Math.min(1, run.stats.guardBreak + (route.guardBreakBonus ?? 0) + (weapon.pierce ?? 0));
    const armor = enemy.guarded && frontal ? 0.26 + 0.74 * guardBreak : 1;
    enemy.hp = Math.max(healthLimit, enemy.hp - Math.max(1, Math.round((damage + dashDamage + finishing + counter) * armor)));
    enemy.flash = 0.16;
    if (weapon.stagger && enemy.kind !== "boss" && !enemy.guarded) {
      enemy.windup = 0;
      enemy.chargeTime = 0;
      enemy.recover = Math.max(enemy.recover ?? 0, weapon.stagger);
      enemy.cooldown = Math.max(enemy.cooldown, weapon.stagger);
    }
    if (!reducedMotion && player.attackVariant === 2) state.cameraShake = Math.max(state.cameraShake, 0.12);
    addEffect(armor < 0.50 ? "charge" : "hit", enemy, 0.28);
    if (!enemy.hp) {
      enemy.windup = 0;
      addEffect("fall", enemy, 0.42);
      if (enemy.elite || enemy.kind === "boss") addEffect("loot", enemy, 0.52);
      const recovery = recoverHealth(killRecovery());
      if (recovery > 0) addEffect("recovery", player, 0.7, recovery);
      awardXp(rpg.killXp(enemy));
      trackQuests({ type: "kill", kind: enemy.kind, faction: enemy.faction, elite: enemy.elite });
    }
    return true;
  }

  function advanceStrike() {
    const player = state.player;
    const strike = player.pendingStrike;
    if (!strike || strike.at > state.elapsed) return;
    player.pendingStrike = undefined;
    const { weapon } = strike;
    if (weapon.projectile) {
      const speed = weapon.speed;
      const height = elevationAt(player);
      const rise = (strike.altitude - height) / Math.max(0.5, strike.targetDistance);
      state.playerProjectiles.push({ kind: weapon.projectile, weapon, x: player.x, y: player.y, absoluteZ: height + .58,
        vx: strike.x * speed, vy: strike.y * speed, vz: rise * speed, life: strike.range / speed });
      return;
    }
    const step = Math.min(weapon.step ?? 0, Math.max(0, strike.targetDistance - .56));
    if (step > 0) move(player, strike.x * step, strike.y * step, playerRadius);
    for (const enemy of enemiesInReach(strike.range)) {
      const aim = direction(enemy.x - player.x, enemy.y - player.y);
      const dot = aim ? aim.x * strike.x + aim.y * strike.y : 1;
      if (dot >= weapon.angle && applyPlayerStrike(enemy, weapon, aim)) return;
    }
  }

  function advancePlayerProjectiles(delta) {
    if (!state.playerProjectiles.length) return;
    const enemies = livingEnemies();
    for (const bolt of state.playerProjectiles) {
      const travel = Math.min(delta, bolt.life);
      const segments = Math.ceil(travel * bolt.weapon.speed / .16);
      const step = travel / Math.max(1, segments);
      bolt.life -= travel;
      for (let index = 0; index < segments; index++) {
        bolt.x += bolt.vx * step;
        bolt.y += bolt.vy * step;
        bolt.absoluteZ += bolt.vz * step;
        if (!isOpen(bolt.x, bolt.y, .12) || elevationAt(bolt) + .12 >= bolt.absoluteZ) {
          bolt.life = 0;
          break;
        }
        const enemy = enemies.find((entry) => entry.hp > 0 &&
          distance(entry, bolt) <= enemyTypes[entry.kind].radius + .12 &&
          Math.abs(bolt.absoluteZ - elevationAt(entry) - .58) <= .47);
        if (enemy) {
          applyPlayerStrike(enemy, bolt.weapon, direction(bolt.vx, bolt.vy));
          bolt.life = 0;
          break;
        }
      }
    }
    state.playerProjectiles = state.playerProjectiles.filter((bolt) => bolt.life > 0);
  }

  function dash() {
    const player = state.player;
    if (state.mode !== "playing" || waitingForCombatStart(playerStartDelay) || player.dashCooldown > 0) return;
    const aim = inputDirection() || { x: player.facingX, y: player.facingY };
    setFacing(player, aim);
    player.pendingStrike = undefined;
    player.swingLife = 0;
    player.attackFlash = 0;
    player.velocityX = 0;
    player.velocityY = 0;
    player.dashX = aim.x;
    player.dashY = aim.y;
    player.dashRemaining = 0.18;
    player.dashFlash = 0.30;
    player.dashCooldown = run.stats.dashCooldown * (state.routeEffects?.dashCooldownMultiplier ?? 1);
    if (run.stats.dashStrike + (state.routeEffects?.dashStrikeBonus ?? 0) > 0) {
      player.dashStrikeUntil = state.elapsed + 1;
    }
    player.invulnerable = Math.max(player.invulnerable, 0.23 + run.stats.dashGrace);
    addEffect("dash", player, 0.30);
  }

  function visitDetails(floor = state.floor) {
    return run.villageVisits[floor] ??= { claimed: [], purchases: [] };
  }

  function saveVillage() {
    saveCheckpoint(state.floor, state.player.hp);
  }

  function trackQuests(event) {
    run.quests = village.advanceQuests(run.quests, { ...event, floor: state.floor });
  }

  function villagePanel(title, copy, options, back = enterPlayableScene) {
    state.mode = "shelter";
    panel({ kicker: title === stage.title ? state.floor + "층" : state.floor + "층 · " + stage.title, title, copy, options,
      primary: back === enterPlayableScene ? "닫기" : "이전", activate: back });
  }

  function renderQuestCard({ quest, status, actions = [] }) {
    const card = document.createElement("article");
    card.className = "quest-card";
    card.dataset.status = status;
    card.dataset.quest = quest.id;
    const heading = document.createElement("div");
    heading.className = "quest-card-heading";
    const title = document.createElement("h3");
    title.textContent = quest.title;
    const badge = document.createElement("strong");
    badge.className = "quest-status";
    badge.textContent = {
      offered: "수락 대기", limited: "수락 한도 도달", inProgress: "진행 중",
      completed: "완료", claimed: "보상 수령 완료", rejected: "거절함",
    }[status];
    heading.append(title, badge);
    const description = document.createElement("p");
    description.textContent = quest.description;
    const detail = document.createElement("small");
    const reward = "금화 +" + goldText(quest.reward.gold) + " · 경험치 +" + quest.reward.xp;
    detail.textContent = quest.progress === undefined ? reward : "진행 " + quest.progress + " / " + quest.goal.count + " · " + reward;
    card.append(heading, description, detail);

    if (actions.length) {
      const controls = document.createElement("div");
      controls.className = "quest-actions";
      for (const { id, label, choose, primary, disabled } of actions) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "quest-action";
        button.classList.toggle("quest-action-primary", Boolean(primary));
        button.dataset.choice = id;
        button.textContent = label;
        button.setAttribute("aria-label", quest.title + " " + label);
        button.disabled = Boolean(disabled);
        button.addEventListener("click", choose);
        controls.append(button);
      }
      card.append(controls);
    }
    return card;
  }

  function questBoard() {
    const visit = visitDetails();
    const rejected = visit.rejected ??= [];
    const claimed = visit.claimed ??= [];
    const progress = run.quests.map((quest) => {
      const ready = village.questReady(quest);
      return { quest, status: ready ? "completed" : "inProgress",
        actions: ready ? [{ id: "quest-claim-" + quest.id, label: "보상 받기", primary: true, choose: () => {
          if (!run.quests.includes(quest) || !village.questReady(quest)) return;
          run.quests = run.quests.filter((entry) => entry.id !== quest.id);
          const origin = visitDetails(quest.startedAt);
          (origin.claimed ??= []).push(quest.id);
          if (origin !== visit) claimed.push(quest.id);
          applyVillageEffects(quest.reward);
          saveVillage();
          questBoard();
        } }] : [] };
    });
    const active = new Set(run.quests.map(({ id }) => id));
    const limited = run.quests.length >= village.maxQuests;
    const available = adminRun || state.floor < previewFloorLimit;
    const offers = village.questOffers(state.floor, run.floorSeeds[state.floor - 1])
      .filter(({ id }) => !active.has(id) && (available || claimed.includes(id) || rejected.includes(id)));
    for (const id of claimed) {
      const floor = Number(id.split(":")[0]);
      if (floor === state.floor || active.has(id)) continue;
      const quest = village.questOffers(floor, run.floorSeeds[floor - 1]).find((offer) => offer.id === id);
      if (quest) offers.push(quest);
    }
    const listings = offers.map((quest) => {
      if (claimed.includes(quest.id)) return { quest, status: "claimed" };
      if (rejected.includes(quest.id)) return { quest, status: "rejected" };
      return { quest, status: limited ? "limited" : "offered", actions: [
        { id: "quest-accept-" + quest.id, label: "수락", primary: true, disabled: limited, choose: () => {
          if (claimed.includes(quest.id) || rejected.includes(quest.id)) return;
          const next = village.acceptQuest(run.quests, quest, state.floor);
          if (next === run.quests) return;
          run.quests = next;
          saveVillage();
          questBoard();
        } },
        { id: "quest-reject-" + quest.id, label: "거절", choose: () => {
          if (run.quests.some(({ id }) => id === quest.id) || claimed.includes(quest.id) || rejected.includes(quest.id)) return;
          rejected.push(quest.id);
          saveVillage();
          questBoard();
        } },
      ] };
    });
    state.mode = "shelter";
    const count = "등록한 의뢰 " + run.quests.length + " / " + village.maxQuests;
    panel({ kicker: state.floor + "층 · " + stage.title, title: "의뢰 게시판",
      copy: available ? count : count + "\n마지막 쉼터에서는 완료한 의뢰의 보상을 받을 수 있습니다.",
      questCards: [...progress, ...listings], primary: "닫기", activate: enterPlayableScene });
  }

  function villageShop(page) {
    const gold = "보유 금화 " + goldText(run.gold);
    if (!page) {
      const options = [
        { id: "shop-buy", title: "잡화 구매", choose: () => villageShop("buy") },
        { id: "shop-sell", title: "전리품 판매", choose: () => villageShop("sell") },
      ];
      villagePanel("상점", gold, options);
      return;
    }
    const visit = visitDetails();
    const worn = page === "sell" ? equippedRecords(rpg.equippedBySlot(run.progress)) : null;
    const shopSeed = (run.floorSeeds[state.floor - 1] ?? 0) ^ 0x4dad31c2;
    const allowance = page === "buy" ? recoveryAllowance(randomFrom(shopSeed)) : 0;
    const options = page === "buy"
      ? village.shopStock(state.floor, run.floorSeeds[state.floor - 1]).map(({ id, item: stockItem, price }) => {
        const item = rewards.withKillRecovery(stockItem, allowance);
        const sold = visit.purchases.includes(id);
        const comparison = item.kind === "gear" ? compareGearOffer(item) : null;
        const detail = comparison
          ? comparison.changes.map(({ key, label, delta }) => label + " " + statValue(key, delta, true)).join(" · ")
          : item.kind === "stat" ? item.description : describeSupply(item);
        return { id: "buy-" + id, title: item.title, description: sold ? "품절" : detail || "장착 능력치 동일",
          price: goldText(price) + " 금화", disabled: sold || run.gold < price, choose: () => {
            if (visit.purchases.includes(id) || run.gold < price) return;
            spendGold(price);
            if (item.kind === "stat") updateProgress(rpg.gainStat(run.progress, item.stat, item.amount));
            else {
              recordReward(item.kind, comparison?.gear ?? item);
              if (item.killRecovery) updateProgress(applyGearRecovery(run.progress, item), true);
            }
            visit.purchases.push(id);
            saveVillage();
            villageShop("buy");
          } };
      })
      : run.rewards.filter((entry) => entry.item && village.sellPrice(entry.item) > 0).map((entry) => {
        const price = village.sellPrice(entry.item);
        const equipped = worn.has(entry);
        return { id: "sell-" + entry.uid, title: entry.item.title, price: "+" + goldText(price) + " 금화",
          description: equipped ? "장착 중 · 판매하면 해제" : undefined, choose: () => {
          if (!run.rewards.includes(entry)) return;
          run.rewards = run.rewards.filter((reward) => reward !== entry);
          if (entry.kind === "gear") {
            const progress = equipped ? rpg.unequip(run.progress, entry.item.id) : run.progress;
            updateProgress(rpg.removeGear(progress, ownedGearIds()), true);
            renderGear();
          }
          creditGold(price);
          saveVillage();
          villageShop("sell");
        } };
      });
    villagePanel(page === "buy" ? "잡화 구매" : "전리품 판매",
      options.length ? gold : "판매할 전리품이 없습니다. · " + gold, options, () => villageShop());
  }

  function applyVillageEffects({ gold, heal, xp, ward, overclock } = {}) {
    creditGold(gold);
    if (heal) recoverHealth(heal);
    if (xp) awardXp(xp);
    run.nextWard += ward ?? 0;
    run.nextPower += overclock ?? 0;
  }

  function villageShrine() {
    const visit = visitDetails();
    const jobs = village.classOptions(state.floor, run.classId).map((job) => ({
      id: "class-" + job.id, title: job.title, description: job.description,
      detail: [village.weaponFor(job.id).label, village.weaponFor(job.id).attackLabel, job.detail].join(" · "),
      choose: () => {
        if (!village.classOptions(state.floor, run.classId).some(({ id }) => id === job.id)) return;
        run.classId = job.id;
        updateProgress(run.progress);
        saveVillage();
        villageShrine();
      },
    }));
    jobs.push({ id: "shrine-event", title: "기도하기", description: visit.prayed ? "이미 기도했습니다." : "신전의 응답을 살핍니다.",
      disabled: Boolean(visit.prayed), choose: () => {
        if (visit.prayed) return;
        visit.prayed = true;
        const event = village.shrineEvent(state.floor, run.floorSeeds[state.floor - 1]);
        applyVillageEffects(event?.effects);
        saveVillage();
        villagePanel(event?.title ?? "고요한 신전", event?.description ?? "촛불이 잠깐 흔들립니다.", [], villageShrine);
      } });
    const job = village.classById(run.classId);
    const weapon = village.weaponFor(run.classId);
    villagePanel(state.floor === 10 ? "성당" : "신전",
      job ? "현재 직업 · " + job.title + "\n무기 · " + weapon.label + " · " + weapon.attackLabel : "", jobs);
  }

  function stationInReach(station) {
    if (!station) return false;
    const player = state.player;
    const bench = station.kind === "workbench" && state.obstacles.find((entry) => entry.shelterDecor &&
      entry.x === station.x && entry.y === station.y);
    if (!bench) return distance(player, station) <= 1.32;
    const gapX = Math.max(0, Math.abs(player.x - bench.x) - bench.w / 2);
    const gapY = Math.max(0, Math.abs(player.y - bench.y) - bench.h / 2);
    return Math.hypot(gapX, gapY) <= 0.63;
  }

  function useShelterStation(station) {
    if (station.kind === "departure") return;
    if (!stationInReach(station)) {
      notify("표시된 시설에 다가가 상호작용하세요.", 1300);
      return;
    }
    if (station.kind === "board") return questBoard();
    if (station.kind === "shop") return villageShop();
    if (station.kind === "shrine") return villageShrine();
    if (station.kind === "campfire") {
      const visit = visitDetails();
      const { player } = state;
      if (visit.campfire || player.hp >= player.maxHp) {
        notify(visit.campfire ? "이미 모닥불에서 쉬었습니다." : "체력이 가득 찼습니다.");
        return;
      }
      const { campfireRecovery } = difficultyRules();
      const healing = campfireRecovery === 1 ? player.maxHp : Math.round(player.maxHp * campfireRecovery);
      const restored = Math.min(healing, player.maxHp - player.hp);
      player.hp = Math.min(player.maxHp, player.hp + healing);
      visit.campfire = true;
      saveVillage();
      addEffect("loot", station, 0.6);
      notify("모닥불 · 체력 +" + Math.ceil(restored));
      return;
    }
    if (station.kind !== "workbench") return;
    const visit = visitDetails();
    if (visit.service) {
      notify("이번 쉼터에서는 이미 정비를 마쳤습니다.");
      return;
    }
    if (run.gold < 30) {
      notify("장비 개조에는 금화 30개가 필요합니다.");
      return;
    }
    spendGold(30);
    recordReward("upgrade", { title: "쉼터 무기 개조" });
    notify("무기 개조 · 공격력 +6");
    renderPack();
    visit.service = station.kind;
    saveVillage();
    addEffect("loot", station, 0.6);
  }

  function interact() {
    if (state.mode !== "playing" || !state.shelter) return;
    const station = state.stations.filter((entry) => entry.kind !== "departure" && stationInReach(entry))
      .sort((a, b) => distance(state.player, a) - distance(state.player, b))[0];
    if (station) useShelterStation(station);
  }

  function completeParry() {
    state.player.parryExpiresAt = null;
    if (state.player.weapon === "hooks") state.player.counterUntil = state.elapsed + .75;
    addEffect("parry", state.player, .40);
    notify("패링 성공", 900);
  }

  function parry() {
    const player = state.player;
    const now = state.elapsed + Math.min(1 / 30, Math.max(0, performance.now() - previousTime) / 1000);
    if (state.mode !== "playing" || state.shelter || state.combatComplete || player.hp <= 0 ||
        waitingForCombatStart(playerStartDelay) || player.parryExpiresAt !== null || player.parryReadyAt > now) return;
    const hit = player.pendingHits.findIndex((entry) => entry.contactCount === state.hitCount && now <= entry.deadline);
    if (hit !== -1) {
      player.pendingHits.splice(hit, 1);
      completeParry();
      return;
    }
    player.parryExpiresAt = now + parryWindow;
  }

  function receiveEnemyHit(damage, shock = false) {
    const player = state.player;
    if (player.invulnerable > 0 || player.hp <= 0) return false;
    if (player.parryExpiresAt !== null && state.elapsed <= player.parryExpiresAt) {
      completeParry();
    } else {
      // Keep contact reversible only for the late half of the parry window.
      player.pendingHits.push({ damage, shock, contactCount: state.hitCount, deadline: state.elapsed + parryWindow });
    }
    return true;
  }

  function resolveParry() {
    const player = state.player;
    if (player.parryExpiresAt !== null && state.elapsed > player.parryExpiresAt) {
      player.parryReadyAt = player.parryExpiresAt + failedParryCooldown;
      player.parryExpiresAt = null;
      notify("패링 실패 · 5초 후 다시 시도할 수 있습니다.", 1400);
    }
    while (player.pendingHits.length && state.elapsed > player.pendingHits[0].deadline) {
      const hit = player.pendingHits.shift();
      if (hit.contactCount === state.hitCount && damagePlayer(hit.damage, true) && hit.shock) state.shockHits++;
    }
  }

  function damagePlayer(amount, contactConfirmed = false) {
    const player = state.player;
    if ((!contactConfirmed && player.invulnerable > 0) || player.hp <= 0) return false;
    const reduction = Math.min(0.70, run.stats.damageReduction + (state.routeEffects?.damageReductionBonus ?? 0));
    const damage = Math.max(1, Math.round(amount * (1 - reduction)));
    const blocked = Math.min(state.ward, damage);
    state.ward -= blocked;
    player.hp = Math.max(0, player.hp - (damage - blocked));
    if (blocked === damage) notify("보호막이 피해 " + blocked + "를 막았습니다.", 1000);
    else if (state.kind === "combat" && state.hitCount === 0) notify("무피격 보너스 종료", 1000);
    state.hitCount++;
    player.invulnerable = Math.max(player.invulnerable, 0.56);
    state.cameraShake = Math.max(state.cameraShake, 0.19);
    addEffect(blocked === damage ? "charge" : "hit", player, 0.35);
    return true;
  }

  function hasLineOfSight(from, to, raisedShot = false) {
    const steps = Math.ceil(distance(from, to) / 0.32);
    const fromZ = raisedShot ? elevationAt(from) + 0.56 : 0;
    const deltaZ = raisedShot ? elevationAt(to) - elevationAt(from) : 0;
    for (let index = 1; index < steps; index++) {
      const fraction = index / steps;
      const x = from.x + (to.x - from.x) * fraction;
      const y = from.y + (to.y - from.y) * fraction;
      if (!isOpen(x, y, 0.10)) return false;
      if (raisedShot && elevationAt({ x, y }) + 0.14 >= fromZ + fraction * deltaZ) return false;
    }
    return true;
  }

  function fireBolt(enemy, damage, aim, target) {
    if (!aim) return;
    const velocity = 8.2;
    const altitude = elevationAt(enemy);
    const rise = target ? (elevationAt(target) - altitude) / Math.max(distance(enemy, target), 0.1) : 0;
    state.projectiles.push({
      x: enemy.x + aim.x * 0.34, y: enemy.y + aim.y * 0.34,
      absoluteZ: altitude + 0.56 + rise * 0.34, vz: rise * velocity,
      vx: aim.x * velocity, vy: aim.y * velocity, radius: 0.14, damage, life: 1.35,
    });
  }

  function fireAimedBolt(enemy, spread = 0) {
    const target = { x: enemy.aimX, y: enemy.aimY };
    const aim = direction(target.x - enemy.x, target.y - enemy.y);
    if (!aim) return;
    const angle = Math.atan2(aim.y, aim.x) + spread;
    fireBolt(enemy, enemy.damage, { x: Math.cos(angle), y: Math.sin(angle) }, target);
    addEffect("charge", enemy, 0.23);
  }

  function contains(surface, actor) {
    return Math.abs(actor.x - surface.x) <= surface.w / 2 && Math.abs(actor.y - surface.y) <= surface.h / 2;
  }

  function updateTerrain() {
    for (const surface of state.terrain) {
      const cycle = terrainCycles[surface.kind];
      if (!cycle) continue;
      const clock = state.elapsed + (surface.phase ?? 0) * cycle.period;
      const beat = clock % cycle.period;
      const round = Math.floor(clock / cycle.period);
      surface.status = beat >= cycle.activeAt && beat < cycle.stopsAt && state.elapsed > 0.95 ? "active"
        : beat >= cycle.warningAt && beat < cycle.stopsAt ? "warning" : "idle";
      if (surface.status === "active" && surface.lastHit !== round && contains(surface, state.player) && withinTier(surface, state.player)) {
        const damage = cycle.damage * (1 + Math.max(0, state.floor - 3) * 0.022);
        if (damagePlayer(damage)) surface.lastHit = round;
      }
    }
  }

  function advanceLancer(enemy, delta) {
    enemy.chargeTime -= delta;
    const x = enemy.x + enemy.facingX * delta * 10;
    const y = enemy.y + enemy.facingY * delta * 10;
    if (!openStep(enemy, x, y, enemyTypes.lancer.radius) || distance(enemy, { x: enemy.aimX, y: enemy.aimY }) < 0.22) {
      enemy.chargeTime = 0;
      return;
    }
    enemy.x = x;
    enemy.y = y;
    enemy.moving = true;
    if (!enemy.chargeHit && distance(enemy, state.player) < 0.75 && closeReach(enemy, state.player)) {
      enemy.chargeHit = true;
      receiveEnemyHit(enemy.damage);
    }
  }

  function mortarSalvo(enemy, player) {
    const mark = (x, y, remaining) => ({
      x: Math.max(playerRadius, Math.min(state.map.width - playerRadius, x)),
      y: Math.max(playerRadius, Math.min(state.map.height - playerRadius, y)),
      kind: "mortar", radius: 1.32 + playerRadius * .4, remaining, active: false, damage: enemy.damage,
    });
    state.mortarTargets.push(mark(player.x, player.y, enemy.windup));
    if (state.floor >= 8) {
      const aim = inputDirection() || direction(player.x - enemy.x, player.y - enemy.y) || { x: 1, y: 0 };
      state.mortarTargets.push(mark(player.x + aim.x * 2.6, player.y + aim.y * 2.6, enemy.windup + 0.28));
    }
  }

  function layMines(enemy, player) {
    const aim = inputDirection() || direction(player.x - enemy.x, player.y - enemy.y);
    const placements = [player];
    if (aim) {
      placements.push({ x: player.x + aim.x * 2.25, y: player.y + aim.y * 2.25 });
      if (difficultyRules().mines > 2) placements.push({ x: player.x - aim.y * 1.7, y: player.y + aim.x * 1.7 });
    }
    for (const [index, { x, y }] of placements.entries()) {
      if (!walkable(x, y, 0.38) || !withinTier({ x, y }, player) || !hasLineOfSight(enemy, { x, y })) continue;
      state.mortarTargets.push({ x, y, kind: "mine", radius: 0.93, remaining: 0.74 + index * 0.19,
        active: false, damage: enemy.damage });
    }
  }

  function updateMortars(delta) {
    for (const marker of state.mortarTargets) {
      marker.remaining -= delta;
      if (marker.kind === "mine") {
        marker.active = marker.remaining <= 0;
        if (marker.active && marker.remaining > -2.4 && distance(marker, state.player) <= marker.radius &&
            withinTier(marker, state.player) && hasLineOfSight(marker, state.player) && receiveEnemyHit(marker.damage)) {
          marker.remaining = -2.4;
          addEffect("danger", marker, .25);
        }
        continue;
      }
      if (marker.remaining > 0 || marker.active) continue;
      marker.active = true;
      state.cameraShake = Math.max(state.cameraShake, 0.15);
      if (distance(marker, state.player) <= marker.radius && withinTier(marker, state.player) &&
          (marker.kind !== "aftershock" || hasLineOfSight(marker, state.player))) receiveEnemyHit(marker.damage);
    }
    state.mortarTargets = state.mortarTargets.filter((marker) => marker.remaining > (marker.kind === "mine" ? -2.4 : -0.30));
  }

  function updateBolts(delta) {
    const player = state.player;
    for (const bolt of state.projectiles) {
      bolt.life -= delta;
      if (bolt.life <= 0) continue;
      const x = bolt.x + bolt.vx * delta;
      const y = bolt.y + bolt.vy * delta;
      const z = bolt.absoluteZ + bolt.vz * delta;
      if (!isOpen(x, y, bolt.radius) || elevationAt({ x, y }) + bolt.radius >= z) {
        bolt.life = 0;
        addEffect("charge", bolt, 0.15);
        continue;
      }
      bolt.x = x;
      bolt.y = y;
      bolt.absoluteZ = z;
      if (distance(bolt, player) <= playerRadius + bolt.radius && Math.abs(z - elevationAt(player) - 0.56) <= 0.32) {
        bolt.life = 0;
        receiveEnemyHit(bolt.damage);
      }
    }
    state.projectiles = state.projectiles.filter((bolt) => bolt.life > 0);
  }

  function updateEnemy(enemy, allies, delta) {
    const player = state.player;
    const type = enemyTypes[enemy.kind];
    const difficulty = difficultyRules();
    const marksman = enemy.kind === "marksman";
    const saboteur = enemy.kind === "saboteur";
    const skirmisher = enemy.kind === "skirmisher";
    const breaker = enemy.kind === "breaker";
    const ranged = enemy.kind === "sentry" || marksman;
    const runner = enemy.kind === "runner";
    const mortar = enemy.kind === "mortar";
    const lancer = enemy.kind === "lancer";
    const boss = enemy.kind === "boss";
    const signatureBoss = boss && enemy.bossProfile && !enemy.stellar;
    const creature = enemy.faction === "creature";
    const enraged = boss && enemy.hp <= enemy.maxHp / 2;
    const pressured = state.alarm || (state.hazard === "pressure" && state.elapsed >= 20);
    enemy.flash = Math.max(0, enemy.flash - delta);
    enemy.recover = Math.max(0, (enemy.recover ?? 0) - delta);
    enemy.moving = false;
    enemy.cooldown = Math.max(0, enemy.cooldown - delta);
    enemy.attackRange = type.range + (enraged ? 0.22 : 0);
    enemy.guarded = enemy.kind === "warden" && enemy.windup <= 0 && enemy.recover <= 0;

    if (enemy.volleyAt != null && state.elapsed >= enemy.volleyAt) {
      const side = (enemy.id + enemy.volleyShots) % 2 ? 1 : -1;
      fireAimedBolt(enemy, side * 0.085);
      enemy.volleyShots--;
      enemy.volleyAt = enemy.volleyShots > 0 ? state.elapsed + 0.24 : undefined;
    }

    if (signatureBoss && state.bossTargets.length) {
      enemy.windup = Math.max(0, enemy.windup - delta);
      if (enemy.bossMove === "pursuit" && enemy.windup > 0 && enemy.windup < 0.48) {
        const lunge = direction(enemy.aimX - enemy.x, enemy.aimY - enemy.y);
        if (lunge && distance(enemy, { x: enemy.aimX, y: enemy.aimY }) > 0.76) {
          enemy.moving = move(enemy, lunge.x * delta * 5.1, lunge.y * delta * 5.1, type.radius);
        }
      }
      return;
    }

    if (enemy.chargeTime > 0) {
      advanceLancer(enemy, delta);
      return;
    }

    if (enemy.windup > 0) {
      if (skirmisher && enemy.windup > type.windup * 0.59) {
        const step = delta * (enemy.id % 2 ? 2.3 : -2.3);
        enemy.moving = move(enemy, -enemy.facingY * step, enemy.facingX * step, type.radius);
      }
      enemy.windup = Math.max(0, enemy.windup - delta);
      if (enemy.windup === 0) {
        enemy.recover = breaker ? 0.62 : boss || mortar || enemy.kind === "warden" ? 0.40 : 0.28;
        if (ranged) {
          fireAimedBolt(enemy);
          if (marksman) {
            enemy.volleyShots = difficulty.shots - 1;
            enemy.volleyAt = state.elapsed + 0.24;
          }
          return;
        }
        if (mortar) return;
        if (saboteur) {
          layMines(enemy, { x: enemy.aimX, y: enemy.aimY });
          return;
        }
        if (lancer) {
          enemy.chargeTime = Math.min(0.46, distance(enemy, { x: enemy.aimX, y: enemy.aimY }) / 10);
          enemy.chargeHit = false;
          addEffect("charge", enemy, 0.30);
          return;
        }
        addEffect("danger", enemy, boss ? 0.40 : 0.24);
        const line = skirmisher ? direction(enemy.aimX - enemy.x, enemy.aimY - enemy.y) : null;
        const toward = line && direction(player.x - enemy.x, player.y - enemy.y);
        if (breaker) state.mortarTargets.push({ x: enemy.x, y: enemy.y, radius: 3.04 + playerRadius * .4, kind: "aftershock",
          remaining: 0.80, damage: Math.round(enemy.damage * 0.64), active: false });
        if ((!toward || line.x * toward.x + line.y * toward.y >= 0.60) && distance(enemy, player) <= enemy.attackRange &&
            closeReach(enemy, player) && hasLineOfSight(enemy, player)) {
          receiveEnemyHit(enemy.damage + (enraged ? 4 : 0));
        }
      }
      return;
    }

    const gap = distance(enemy, player);
    const aim = direction(player.x - enemy.x, player.y - enemy.y);
    const sight = ranged ? (gap < type.range * 1.10 && hasLineOfSight(enemy, player, true))
      : lancer || saboteur ? (gap < type.range * 1.10 && hasLineOfSight(enemy, player) && closeReach(enemy, player))
      : mortar || closeReach(enemy, player);
    const detection = 10.5 + (creature ? 1.65 : 0);
    const heardCombat = gap < detection + 3 && allies.some((ally) => ally !== enemy
      && (ally.windup > 0 || ally.flash > 0) && distance(ally, enemy) < 5.2);
    if (gap < detection || enemy.hp < enemy.maxHp || boss || heardCombat) {
      enemy.engaged = true;
    }
    setFacing(enemy, aim);
    if (!signatureBoss && sight && gap <= enemy.attackRange * 0.94 && enemy.cooldown <= 0
        && (ranged || mortar || lancer || hasLineOfSight(enemy, player))) {
      const windup = type.windup * difficulty.windup * (enraged ? 0.86 : 1);
      const nearbyWindup = !ranged && !mortar && !lancer && !boss && allies.some((ally) => ally !== enemy
        && Math.abs(ally.windup - windup) < 0.14 && distance(ally, player) < 2.4);
      if (nearbyWindup) return;
      enemy.windup = windup;
      enemy.cooldown = windup + Math.max(0.38, type.cooldown * difficulty.interval * (pressured ? 0.77 : 1)
        * (creature ? 0.88 : 1) * (enraged ? 0.83 : 1));
      enemy.guarded = false;
      if (ranged || skirmisher || saboteur) {
        enemy.aimX = player.x;
        enemy.aimY = player.y;
      }
      if (lancer && aim) {
        const travel = Math.min(4.6, gap + 0.42);
        enemy.aimX = enemy.x + aim.x * travel;
        enemy.aimY = enemy.y + aim.y * travel;
      }
      if (mortar) mortarSalvo(enemy, player);
      return;
    }
    const pursue = !sight || gap > (ranged || mortar || saboteur ? type.range * 0.86 : Math.min(enemy.attackRange * 0.76, 1.42));
    const retreat = (ranged || mortar || saboteur) && sight && gap < (ranged ? 3.2 : 2.75);
    if (aim && enemy.engaged && (pursue || retreat)) {
      const bossSpeed = signatureBoss ? (bossPacing[enemy.bossProfile.style]?.speed ?? 1) : 1;
      const speed = (type.speed + (creature ? (runner ? 0.33 : 0.24) : 0)) * bossSpeed * difficulty.speed;
      const step = speed * (enraged ? 1.23 : 1) * (pressured ? 1.22 : 1) *
        (enemy.recover > 0 ? 0.56 : 1) * delta;
      let x = retreat ? -aim.x : aim.x;
      let y = retreat ? -aim.y : aim.y;
      if (runner && sight && gap > enemy.attackRange && gap < (creature ? 5.2 : 3.8)) {
        const side = enemy.id % 2 ? 1 : -1;
        const drift = creature ? 0.55 : 0.36;
        x -= aim.y * side * drift;
        y += aim.x * side * drift;
      }
      for (const ally of allies) {
        if (ally === enemy || ally.hp <= 0) continue;
        const separation = distance(ally, enemy);
        if (separation < 0.92 && separation > 0.01) {
          const weight = (0.92 - separation) / separation;
          x += (enemy.x - ally.x) * weight;
          y += (enemy.y - ally.y) * weight;
        }
      }
      const desired = direction(x, y) || aim;
      const steering = retreat ? desired : window.TowerPursuit.direction(enemy, desired, type.radius, { state, walkable, openStep });
      if (steering) enemy.moving = move(enemy, steering.x * step, steering.y * step, type.radius);
    }
  }

  function updateCombatWave(remaining) {
    if (state.wave > 1 || !stage.wave.length) return;
    const deep = state.floor >= content.frontierFloor;
    const trigger = state.floor === 1 ? 1 : deep ? 3 : 2;
    if (!state.waveArrival) {
      if (state.kind !== "combat" || remaining > trigger) return;
      const warning = deep ? 1.0 : 1.18;
      state.waveArrival = state.elapsed + warning;
      notify(deep ? "다른 무리가 합류합니다." : "경비 증원이 다가옵니다.", 1600);
      for (const enemy of stage.wave) addEffect("charge", enemy, warning);
    }
    if (state.elapsed < state.waveArrival) return;
    state.wave = 2;
    state.waveArrival = 0;
    for (const entry of stage.wave) {
      state.enemies.push(createEnemy({ ...entry, engaged: true }, state.enemies.length, state.floor, state.routeEffects?.enemyDamageMultiplier));
    }
    state.cameraShake = Math.max(state.cameraShake, 0.17);
    syncMusic();
  }

  function updateAlarm() {
    if (!state.timeLimit || state.elapsed < state.timeLimit) return;
    if (!state.alarm) {
      state.alarm = true;
      notify("경보 작동 · 순찰 병력이 추가됩니다.");
      for (const enemy of stage.reinforcements) addEffect("danger", enemy, 0.80);
    }
    if (state.patrolsArrived || state.elapsed < state.timeLimit + 0.8) return;
    state.patrolsArrived = true;
    for (const patrol of stage.reinforcements) {
      state.enemies.push(createEnemy(patrol, state.enemies.length, state.floor, state.routeEffects?.enemyDamageMultiplier));
    }
    syncMusic();
  }

  function startBossSignature(boss, player, mark, technique) {
    const { timing = 1, size = 1 } = boss.bossProfile;
    const difficulty = difficultyRules();
    state.bossSignatureIndex++;
    const facing = direction(player.x - boss.x, player.y - boss.y) || { x: 1, y: 0 };
    const side = state.bossSignatureIndex % 2 ? 1 : -1;
    const at = (origin, along, across, radius, delay) => mark(origin.x + along * facing.x - across * facing.y,
      origin.y + along * facing.y + across * facing.x, radius * size, delay * timing * difficulty.windup);
    const shot = (remaining, count, angle) => ({ ...at(boss, 0, 0, .92, remaining), volley: true, count, angle });
    let targets;
    switch (technique) {
      case "sweep":
        targets = [-1.75, -.60, .60, 1.75].map((offset, index) => at(boss, 2.05, offset * side, 1.17, .92 + index * .11));
        targets.push(at(boss, .55, 0, 1.16, .90));
        break;
      case "rupture":
        targets = [at(boss, 0, 0, 2.55, .84), at(boss, 0, 0, 3.58, 1.60)];
        break;
      case "barrage":
        targets = [at(player, -1.7, .64 * side, 1.03, .93), at(player, 0, 0, 1.24, 1.16),
          at(player, 1.7, -.64 * side, 1.03, 1.37), shot(1.27, 6, state.bossSignatureIndex * .36)];
        break;
      case "pursuit":
        targets = [at(player, 0, 0, 1.44, .96), at(player, 1.62, .82 * side, 1.18, 1.37)];
        break;
      case "crossfire":
        targets = [at(player, -2.18, 0, 1.13, 1.02), at(player, 2.18, 0, 1.13, 1.02),
          at(player, 0, -2.18, 1.13, 1.27), at(player, 0, 2.18, 1.13, 1.27), shot(1.33, 8, state.bossSignatureIndex * .48)];
        break;
      default:
        targets = Array.from({ length: 6 }, (_, index) => {
          const angle = Math.PI * index / 3 + state.bossSignatureIndex * .32;
          return at(player, Math.cos(angle) * 2.75, Math.sin(angle) * 2.75, 1.04, .86 + (index % 2) * .35);
        });
        break;
    }
    if (state.bossOverdrive) targets.push(at(player, .8, .8 * side, 1.12, 1.64));
    for (let followup = 0; followup < difficulty.bossExtra; followup++) {
      targets.push(at(player, 1.15 + followup * 1.35, side * (followup ? -1.55 : 1.55), 1.17, 1.76 + followup * .25));
    }
    state.bossTargets = targets;
    boss.bossMove = technique;
    boss.windup = Math.min(...targets.map(({ remaining }) => remaining));
    boss.aimX = targets[0].x;
    boss.aimY = targets[0].y;
    setFacing(boss, facing);
  }

  function updateBossShock(boss, delta) {
    if (!boss || boss.hp <= 0) return;
    const signature = boss.bossProfile?.sequence?.length && !boss.stellar;
    if (!signature && boss.hp > boss.maxHp / 2) return;
    const player = state.player;
    const deep = state.floor >= content.frontierFloor;
    if (!state.bossPhaseTwo && boss.hp <= boss.maxHp / 2) {
      state.bossPhaseTwo = true;
      boss.shielded = true;
      state.bossShockCooldown = 0.15;
      notify(stage.final ? "별무리가 모입니다 · 빛이 닿기 전에 표식 밖으로 피하세요." :
        (stage.bossName ?? "수호자") + "의 다음 기술 · 바닥 표식 밖으로 피하세요.");
      syncMusic();
    }
    if (!state.bossOverdrive && boss.hp <= boss.maxHp * 0.27) {
      state.bossOverdrive = true;
      boss.shielded = true;
      state.bossShockCooldown = Math.min(state.bossShockCooldown, 0.14);
      notify(stage.final ? "별이 점화됩니다 · 유성 낙하지점이 교대로 터집니다." : "과열 · 충격파가 연달아 퍼집니다.");
      syncMusic();
    }
    if (state.bossTargets.length) {
      for (const target of state.bossTargets) {
        target.remaining -= delta;
        if (target.remaining > 0 || target.active) continue;
        target.active = true;
        if (target.phase >= 2) state.bossFirstRelease = true;
        if (target.overdrive) state.overdriveReleased = true;
        boss.shielded = state.bossOverdrive ? !state.overdriveReleased : state.bossPhaseTwo && !state.bossFirstRelease;
        state.shockBursts++;
        state.cameraShake = Math.max(state.cameraShake, 0.19);
        const damage = Math.min(Math.round(player.maxHp * 0.32), Math.round(boss.damage * (deep ? 0.77 : 0.70)));
        if (distance(target, player) <= target.radius && withinTier(target, player) &&
            (!signature || hasLineOfSight(target, player))) receiveEnemyHit(damage, true);
        if (target.volley) {
          const count = target.count ?? (deep ? 12 : 8);
          for (let index = 0; index < count; index++) {
            const angle = 2 * Math.PI * index / count + target.angle;
            fireBolt(boss, Math.round(boss.damage * 0.56), { x: Math.cos(angle), y: Math.sin(angle) });
          }
          addEffect("charge", boss, 0.38);
        }
      }
      state.bossTargets = state.bossTargets.filter((target) => target.remaining > -0.32);
      if (!state.bossTargets.length) {
        boss.recover = .38;
        const pacing = signature ? (bossPacing[boss.bossProfile.style]?.pause ?? 1.12) : 1.22;
        state.bossShockCooldown = pacing * (deep ? .78 : 1) * difficultyRules().interval;
        if (state.bossOverdrive) state.bossShockCooldown = state.overdriveReleased ? (deep ? 0.56 : 0.72) : 0.15;
      }
      return;
    }
    state.bossShockCooldown -= delta;
    if (state.bossShockCooldown > 0) return;
    const targetAt = (x, y, radius, remaining) => ({
      x: Math.max(0.6, Math.min(state.map.width - 0.6, x)),
      y: Math.max(0.6, Math.min(state.map.height - 0.6, y)),
      radius, remaining, active: false, overdrive: state.bossOverdrive,
      phase: state.bossOverdrive ? 3 : state.bossPhaseTwo ? 2 : 1,
    });
    if (signature) {
      const { sequence } = boss.bossProfile;
      const technique = sequence[state.bossSignatureIndex % sequence.length];
      const reach = technique === "sweep" || technique === "rupture" ? 4.3 : 8.6;
      if (!state.bossPhaseTwo && distance(boss, player) > reach) return;
      startBossSignature(boss, player, targetAt, technique);
      return;
    }
    if (stage.final) {
      const rotation = state.shockBursts * 0.19;
      const count = (state.bossOverdrive ? 6 : 4) + difficultyRules().bossExtra;
      const center = targetAt(player.x, player.y, 1.45, 0.90);
      const volley = { ...targetAt(boss.x, boss.y, 1.12, 1.48), volley: true, angle: rotation };
      state.bossTargets = [center, volley];
      for (let index = 0; index < count; index++) {
        const angle = rotation + index * Math.PI * 2 / count;
        state.bossTargets.push(targetAt(player.x + Math.cos(angle) * 3.2, player.y + Math.sin(angle) * 3.2,
          1.12, 1.18 + (index % 2) * 0.29));
      }
      boss.windup = 0;
      boss.cooldown = Math.max(boss.cooldown, 1.5);
      return;
    }
    const aim = inputDirection() || direction(player.x - boss.x, player.y - boss.y) || { x: 1, y: 0 };
    state.bossTargets = [targetAt(player.x, player.y, deep ? 1.78 : 1.68, 0.84)];
    if (state.floor >= 19 || state.bossOverdrive) {
      const volley = targetAt(boss.x, boss.y, 1.05, 1.11);
      volley.volley = true;
      volley.angle = state.shockBursts * 0.31;
      state.bossTargets.push(volley);
      boss.windup = 0;
      boss.cooldown = Math.max(boss.cooldown, 1.25);
    }
    const ahead = targetAt(player.x + aim.x * 2.65, player.y + aim.y * 2.65, 1.28, deep ? 1.08 : 1.18);
    if (distance(ahead, player) > 1.2) state.bossTargets.push(ahead);
    if (state.bossOverdrive) {
      const offsets = state.floor >= 29 ? [-1, 1] : [1];
      for (const offset of offsets) {
        const side = targetAt(player.x - aim.y * 2.75 * offset, player.y + aim.x * 2.75 * offset, 1.35, 1.35);
        if (distance(side, player) > 1.2 && distance(side, ahead) > 1) state.bossTargets.push(side);
      }
    }
  }

  function updateSparks() {
    if (state.hazard !== "sparks" || !state.sparkLocations.length) return;
    const cycle = Math.floor(state.elapsed / 3.6);
    const phase = state.elapsed % 3.6;
    if (cycle !== state.sparkCycle) {
      state.sparkCycle = cycle;
      state.sparkSpent = false;
    }
    const location = state.sparkLocations[cycle % state.sparkLocations.length];
    state.hazardTiles = phase >= 1.35 ? [{ ...location, active: phase >= 2.45 }] : [];
    if (!state.sparkSpent && phase >= 2.45 && distance(location, state.player) < 0.82 && withinTier(location, state.player)) {
      damagePlayer(9);
      state.sparkSpent = true;
    }
  }

  function updateGame(delta) {
    const player = state.player;
    state.elapsed += delta;
    state.revealTimer = Math.max(0, state.revealTimer - delta);
    run.seconds += delta;
    for (const timer of ["attackCooldown", "attackFlash", "swingLife", "dashCooldown", "dashFlash", "invulnerable"]) {
      player[timer] = Math.max(0, player[timer] - delta);
    }
    resolveParry();
    if (player.hp === 0) {
      endRun(false);
      return;
    }
    const playerWaiting = waitingForCombatStart(playerStartDelay);
    player.moving = false;
    if (playerWaiting) {
      player.velocityX = 0;
      player.velocityY = 0;
    } else if (player.dashRemaining > 0) {
      const step = Math.min(delta, player.dashRemaining) * 12.3;
      player.moving = move(player, player.dashX * step, player.dashY * step, playerRadius);
      player.dashRemaining = Math.max(0, player.dashRemaining - delta);
    } else {
      const walking = stairDirection(player, inputDirection());
      const speed = run.stats.speed * (state.routeEffects?.speedMultiplier ?? 1) * (player.swingLife > 0 ? 0.82 : 1);
      const blend = 1 - Math.exp(-(walking ? 20 : 28) * delta);
      player.velocityX += ((walking?.x ?? 0) * speed - player.velocityX) * blend;
      player.velocityY += ((walking?.y ?? 0) * speed - player.velocityY) * blend;
      if (walking && player.swingLife <= 0) setFacing(player, walking);
      if (Math.hypot(player.velocityX, player.velocityY) >= 0.05) {
        player.moving = move(player, player.velocityX * delta, player.velocityY * delta, playerRadius);
      }
    }

    for (const effect of state.effects) effect.life -= delta;
    state.effects = state.effects.filter((effect) => effect.life > 0);
    if (state.shelter || state.combatComplete) {
      advanceDeparture();
      return;
    }

    if (!playerWaiting) {
      advanceStrike();
      advancePlayerProjectiles(delta);
      if (attackPointer !== null || [...touchPointers.values()].includes("attack")) attack();
    }

    updateAlarm();
    updateCombatWave(livingEnemies().length);
    const alive = livingEnemies();
    const boss = state.enemies.find((enemy) => enemy.kind === "boss");
    const combatCleared = state.kind === "combat" && !alive.length && (state.wave > 1 || !stage.wave.length);
    if (combatCleared || (boss && boss.hp === 0)) {
      if (!player.pendingHits.length) finishFloor();
      return;
    }

    if (!waitingForCombatStart(enemyStartDelay)) {
      for (const enemy of alive) updateEnemy(enemy, alive, delta);
      updateBolts(delta);
      updateMortars(delta);
      updateBossShock(boss, delta);
    }
    updateSparks();
    updateTerrain();
    if (state.hazard === "pressure" && state.elapsed >= 20 && state.elapsed - delta < 20) {
      notify("경보 작동 · 적의 이동과 공격 속도가 빨라집니다.");
    }
    if (player.hp === 0) endRun(false);
  }

  function finishFloor() {
    state.combatComplete = true;
    state.projectiles = [];
    state.playerProjectiles = [];
    state.mortarTargets = [];
    state.bossTargets = [];
    state.hazardTiles = [];
    for (const surface of state.terrain) surface.status = "idle";
    finishFloorRewards();
  }

  function finishFloorRewards() {
    run.cleared = state.floor;
    run.totalClears++;
    trackQuests({ type: "clear", trial: state.kind });
    let trial = "";
    if (state.kind === "combat" && state.hitCount === 0) trial = "무피격 통과";
    if (state.timeLimit && !state.alarm) trial = "경보 전 전투 완료";
    if (state.kind === "boss" && state.shockBursts > 0 && state.shockHits === 0) trial = "충격파 회피";
    if (trial) run.trials.push(trial);
    creditGold(stage.gold + run.stats.goldOnClear + (state.routeEffects?.clearGoldBonus ?? 0) + (trial ? challengeGold : 0));
    renderFloorSteps();
    const baseXp = state.kind === "boss" ? 58 : 20;
    const xp = baseXp + Math.max(0, state.floor - 3) * 3 + (state.routeEffects?.clearXpBonus ?? 0);
    const earnedXp = Math.round(xp * (1 + run.stats.xpBonus));
    const gains = awardXp(xp);
    recoverHealth(state.routeEffects?.clearHeal ?? 0);
    chooseReward(earnedXp, trial, gains);
  }

  function statValue(key, value, delta = false) {
    const sign = value < 0 ? "−" : delta && value > 0 ? "+" : "";
    const number = Math.abs(value);
    if (key === "damageReduction" || key === "guardBreak") return sign + Math.round(number * 100) + (delta ? "%p" : "%");
    let unit = "";
    if (key === "speed") unit = "칸/초";
    if (key === "attackRange") unit = "칸";
    if (["attackCooldown", "dashCooldown", "dashGrace"].includes(key)) unit = "초";
    return sign + Number(number.toFixed(2)) + unit;
  }

  function comparisonRow(change) {
    const row = document.createElement("div");
    row.className = "comparison-row";
    row.setAttribute("role", "row");
    const deltaClass = change.improved ? "stat-rise" : "stat-fall";
    const cells = [
      ["comparison-label", "rowheader", change.label],
      ["comparison-before", "cell", statValue(change.key, change.before)],
      ["comparison-after", "cell", statValue(change.key, change.after)],
      ["comparison-delta " + deltaClass, "cell", statValue(change.key, change.delta, true)],
    ];
    for (const [className, role, value] of cells) {
      const cell = document.createElement("span");
      cell.className = className;
      cell.textContent = value;
      cell.setAttribute("role", role);
      row.append(cell);
    }
    return row;
  }

  function showRewardComparison(item) {
    if (state.mode !== "gear") return;
    run.selectedReward = item;
    for (const button of elements["overlay-choices"].children) {
      button.setAttribute("aria-pressed", String(button.dataset.choice === item.id));
    }
    elements["gear-compare"].dataset.kind = item.kind;
    setText("compare-heading", { gear: "교체 미리보기", stat: "성장 효과", supply: "공급품 효과" }[item.kind]);
    if (elements["compare-candidate-label"]) setText("compare-candidate-label", "선택한 보상");
    setText("compare-current-label", "현재 장착");
    let changes = [];
    let equipped = "";
    let detail = item.description;
    if (item.kind === "gear") {
      const comparison = compareGearOffer(item);
      changes = comparison.changes;
      equipped = comparison.replaced?.title || "빈 슬롯";
      setText("compare-heading", comparison.replaced ? "교체 미리보기" : "추가 착용 미리보기");
      setText("compare-current-label", comparison.replaced ? "교체할 장비" : "착용할 자리");
    } else if (item.kind === "stat") {
      changes = rpg.compareStats(run.progress, rpg.gainStat(run.progress, item.stat, item.amount), comparisonStats);
    } else {
      detail = describeSupply(item) + " · 가방에서 클릭해 사용";
    }
    if (item.downside) detail += " · " + item.downside;
    setText("compare-equipped", equipped);
    setText("compare-candidate", item.title);
    setText("compare-detail", detail);
    elements["compare-stats"].replaceChildren(...changes.map(comparisonRow));
    const confirm = elements["primary-action"];
    confirm.disabled = false;
    setText("primary-action", item.kind === "gear" ? "받고 장착" : "보상 받기");
    action = () => {
      if (state.mode !== "gear") return;
      if (item.kind === "gear") {
        const gear = rpg.rewardGear(rewards.storedGear(item));
        recordReward("gear", gear);
        updateProgress(applyGearRecovery(rpg.equip(run.progress, gear.id), item), true);
        run.pendingGear = item.title;
        renderGear();
      } else if (item.kind === "stat") {
        updateProgress(rpg.gainStat(run.progress, item.stat, item.amount));
      } else {
        recordReward("supply", item);
      }
      if (!state.shelter && item.kind !== "stat") trackQuests({ type: "loot" });
      chooseRoute();
    };
  }

  function chooseReward(xp, trial, gains = []) {
    const allowance = recoveryAllowance(run.random);
    const pool = rewards.createFloorPool(state.floor).map((item) => rewards.withKillRecovery(item, allowance));
    const candidates = rpg.rewardChoices(pool, run.random);
    state.rewardOffer = { candidates, xp, trial, gains };
    presentReward(state.rewardOffer);
  }

  function presentReward(offer, selectedId) {
    const { xp, trial, gains } = offer;
    const remaining = rpg.killRecoveryCap - killRecovery();
    const candidates = offer.candidates.map((item) => rewards.withKillRecovery(item, remaining));
    state.rewardOffer = { candidates, xp, trial, gains };
    state.mode = "gear";
    const options = candidates.map((item) => {
      const slot = rpg.slots.find((entry) => entry.id === item.slot);
      return {
        id: item.id,
        title: item.title,
        description: item.downside,
        detail: slot?.title ?? (item.kind === "stat" ? "성장" : "공급품"),
        icon: slot?.icon ?? (item.kind === "stat" ? "✧" : "▦"),
        rarity: item.rarity,
        rpgChoice: true,
        choose: () => showRewardComparison(item),
      };
    });
    const reward = trial ? " · " + trial + " 금화 +" + goldText(challengeGold) : "";
    panel({
      kicker: state.floor + "층 통과",
      title: "보상 선택",
      copy: (xp ? "목표 달성 +" + xp + " XP" + reward + " · " : "") +
        "보유 금화 " + goldText(run.gold) + (gains.length ? "\n레벨 상승 · " + gains.join(" · ") : ""),
      options,
      primary: "보상 받기",
    });
    showRewardComparison(candidates.find((item) => item.id === selectedId) ?? candidates[0]);
  }

  function chooseRoute(savedOffers) {
    run.selectedReward = undefined;
    delete state.rewardOffer;
    if ((!adminRun && state.floor >= previewFloorLimit) || state.floor === content.floorCount) {
      queueDeparture(null);
      return;
    }
    const nextFloor = state.floor + 1;
    if (content.isShelterFloor(nextFloor)) {
      queueDeparture(nextFloor);
      return;
    }
    const player = state.player;
    const floorSeed = run.floorSeeds[state.floor - 1] ?? 0;
    const routeSeed = floorSeed ^ Math.imul(state.floor, 0x9e3779b1) ^ 0x726f7574;
    const routes = savedOffers ? savedOffers.map((id) => content.routes.find((route) => route.id === id))
      : content.routeOptions(state.floor, randomFrom(routeSeed), {
        hp: player.hp, maxHp: player.maxHp, gold: run.gold, previous: run.lastRouteOffers,
      });
    const offered = routes.map(({ id }) => id);
    state.branchOffers = offered;
    state.mode = "branch";
    panel({
      kicker: state.floor + "층 통과 · 갈림길",
      title: "갈림길 선택",
      copy: "체력 " + Math.ceil(player.hp) + " / " + player.maxHp + " · 금화 " + goldText(run.gold),
      options: routes.map((route) => ({
        id: route.id,
        title: route.label,
        description: route.description,
        detail: route.detail,
        choose: () => {
          if (state.mode !== "branch") return;
          const { heal = 0, goldCost = 0 } = route.effects;
          if (goldCost > run.gold) return;
          if (goldCost) spendGold(goldCost);
          run.lastRouteOffers = offered;
          queueDeparture(nextFloor, route.id, heal);
        },
      })),
    });
  }

  function queueDeparture(floor, route, heal = 0) {
    state.departure = { floor, route, heal };
    if (state.gateMarker) {
      state.combatComplete = true;
      state.gateMarker.active = true;
      state.gateMarker.openSince = state.elapsed;
      state.gateMarker.openProgress = reducedMotion ? 1 : 0;
    }
    enterPlayableScene();
    if (!state.shelter) {
      const message = "출구 개방 · 열린 문으로 이동하세요.";
      notify(message);
      setText("live-status", message);
    }
  }

  function advanceDeparture() {
    const player = state.player;
    if (state.shelter) {
      const gate = state.stations.find(({ kind }) => kind === "departure");
      if (!gate || distance(player, gate) > .80 || !closeReach(player, gate)) return;
      if (!state.departure) {
        if (!adminRun && state.floor >= previewFloorLimit && run.previewComplete) {
          showPreviewComplete();
          return;
        }
        run.cleared = state.floor;
        run.totalClears++;
        chooseReward(0, "");
        return;
      }
    } else {
      if (!state.departure) return;
      const gate = state.gateMarker;
      gate.openProgress = reducedMotion ? 1 : Math.min(1, (state.elapsed - gate.openSince) / .54);
      const threshold = { x: gate.x + .64, y: gate.y };
      if (gate.openProgress < 1 || Math.abs(player.x - threshold.x) > playerRadius + .23 ||
          Math.abs(player.y - threshold.y) > .59 || !closeReach(player, threshold)) return;
    }
    const { floor, route, heal } = state.departure;
    if (floor === null) {
      if (adminRun) endRun(true);
      else showPreviewComplete();
      return;
    }
    recoverHealth(heal);
    enterFloor(floor, player.hp, route);
  }

  function showPreviewComplete() {
    state.mode = "victory";
    run.previewComplete = true;
    saveCheckpoint(state.floor, state.player.hp);
    panel({ kicker: "체험판 · " + previewFloorLimit + "층", title: "첫 구간 등반 완료",
      copy: "진행 기록을 저장했습니다. 시작 화면에서 이어하면 마지막 쉼터로 돌아갑니다.",
      primary: "시작 화면으로", activate: () => setupTitle() });
  }

  function loseRewards() {
    const cutoff = run.totalClears - 5;
    const recent = run.rewards.filter((entry) => entry.earnedAt > cutoff);
    const older = run.rewards.filter((entry) => entry.earnedAt <= cutoff);
    const olderGold = older.filter((entry) => entry.kind === "gold");
    const olderItems = older.filter((entry) => entry.kind !== "gold");
    const recentItems = recent.filter((entry) => entry.kind !== "gold").length;
    const recentGold = recent.reduce((total, entry) => total + (entry.kind === "gold" ? entry.amount : 0), 0);
    const oldBalance = olderGold.reduce((total, entry) => total + entry.amount, 0);
    const oldGoldLost = oldBalance - Math.floor(oldBalance / 3);
    const retainedItems = Math.floor(olderItems.length / 3);
    for (let index = olderItems.length - 1; index > 0; index--) {
      const chosen = Math.floor(run.random() * (index + 1));
      [olderItems[index], olderItems[chosen]] = [olderItems[chosen], olderItems[index]];
    }
    run.rewards = [...olderGold, ...olderItems.slice(0, retainedItems)].sort((a, b) => a.uid - b.uid);
    run.gold = oldBalance;
    spendGold(oldGoldLost);
    const statsLost = [...Object.values(run.progress.earned), ...Object.values(run.progress.earnedAttributes ?? {})]
      .some((value) => value !== 0);
    updateProgress(rpg.retainEarnedStats(rpg.removeGear(run.progress, ownedGearIds())));
    return { recentItems, recentGold, oldItemsLost: olderItems.length - retainedItems, oldGoldLost, statsLost };
  }

  function endRun(victory) {
    state.mode = victory ? "victory" : "defeat";
    const seconds = Math.floor(run.seconds);
    const time = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    const progress = run.cleared + "층 통과 · Lv. " + run.progress.level + " · " + time + " · 금화 " + goldText(run.gold);
    const trials = run.trials.length ? " · 추가 목표 " + run.trials.length + "개 달성" : "";
    if (victory) {
      if (!adminRun) {
        try { localStorage.removeItem(checkpointKey); } catch {}
      }
      panel({ kicker: "1,332층", title: "첨탑 등반 완료", copy: progress + trials,
        primary: "시작 화면으로", activate: () => setupTitle() });
      return;
    }
    const loss = loseRewards();
    run = createRun(run);
    saveCheckpoint(1, run.stats.maxHp);
    renderGear();
    const report = [
      "레벨 1 · 경험치 0에서 다시 시작",
      "최근 5층 손실 · 보유품 " + loss.recentItems + "개 / 금화 " + goldText(loss.recentGold),
      "이전 층 손실 · 보유품 " + loss.oldItemsLost + "개 / 금화 " + goldText(loss.oldGoldLost),
      loss.statsLost ? "획득 성장치 60% 손실 · 기본 배분 유지" : "기본 배분 유지",
      "남은 보유품 " + run.rewards.filter((entry) => entry.kind !== "gold").length + "개 · 금화 " + goldText(run.gold),
    ];
    panel({ kicker: "등반 종료", title: state.floor + "층에서 쓰러졌습니다", copy: report.join("\n"),
      primary: "남은 것을 들고 1층부터", activate: () => enterFloor(1, run.stats.maxHp) });
  }

  function frame(now) {
    const gap = Math.max(0, now - previousTime);
    const delta = Math.min(1 / 30, gap / 1000);
    previousTime = now;
    const paused = document.hidden || window.TowerAdmin?.isOpen() || hasRunDialog();
    state.cameraShake = Math.max(0, state.cameraShake - Math.max(0, delta));
    if (!paused && state.mode === "rolling") {
      advanceEntry(gap);
    } else if (state.mode === "playing" && delta > 0 && !paused) {
      updateGame(delta);
    }
    if (now >= notificationUntil && !elements.notification.hidden) elements.notification.hidden = true;
    syncHUD();
    refreshCoach();
    drawMinimap();
    if (state.mode === "title") titleRenderer.draw(canvas, now, reducedMotion);
    else renderer.draw(canvas, state, now);
    requestAnimationFrame(frame);
  }

  elements["primary-action"].addEventListener("click", () => action?.());
  elements["entry-continue"].addEventListener("click", openEntry);
  elements["coach-next"]?.addEventListener("click", nextCoach);
  window.addEventListener("resize", positionCoach);
  window.addEventListener("scroll", positionCoach, true);
  elements.overlay.addEventListener("animationend", positionCoach);
  elements["status-trigger"].addEventListener("click", () => toggleRunDialog(elements["status-dialog"]));
  elements["status-close"].addEventListener("click", () => elements["status-dialog"].close());
  elements["pause-trigger"].addEventListener("click", () => toggleRunDialog(elements["pause-dialog"]));
  elements["pause-resume"].addEventListener("click", () => elements["pause-dialog"].close());
  elements["pause-exit"].addEventListener("click", () => {
    if (!adminRun && !saveCheckpoint(state.floor, state.player.hp, state.routeId, { version: 1, stage, state })) {
      elements["pause-save-error"].hidden = false;
      return;
    }
    dialogFocus.delete(elements["pause-dialog"]);
    elements["pause-dialog"].close();
    setupTitle();
  });
  elements["status-dialog"].addEventListener("close", returnFromDialog);
  elements["pause-dialog"].addEventListener("close", returnFromDialog);
  elements["audio-toggle"].addEventListener("click", () => {
    audio.setEnabled(!audio.active()).then(refreshAudioUI);
  });
  elements["back-to-title"].addEventListener("click", () => {
    if (state.mode === "menu") setupTitle(true);
  });
  elements["build-stats"].addEventListener("click", (event) => {
    const step = event.target.closest("button[data-stat]");
    if (!step || state.mode !== "menu" || step.disabled) return;
    allocation[step.dataset.stat] += Number(step.dataset.step);
    updateBuild();
    if (step.disabled) {
      const next = remainingPoints() ? step.parentElement.querySelector("button[data-step='1']") : elements["primary-action"];
      next.focus({ preventScroll: true });
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || event.isComposing) return;
    if (event.code === "KeyQ" && !elements["pause-dialog"].open && canOpenRunDialog()) {
      event.preventDefault();
      if (!event.repeat) toggleRunDialog(elements["status-dialog"]);
      return;
    }
    if (event.code === "Escape" && !elements["status-dialog"].open && canOpenRunDialog()) {
      event.preventDefault();
      if (!event.repeat) toggleRunDialog(elements["pause-dialog"]);
      return;
    }
    if (hasRunDialog() || !gameKeys.has(event.code)) return;
    if (event.code === "Space") {
      const button = event.target instanceof HTMLButtonElement ? event.target : null;
      if (state.mode === "rolling" && (!button || button === elements["entry-continue"]) && !window.TowerAdmin?.isOpen()) {
        event.preventDefault();
        if (!event.repeat) openEntry();
        return;
      }
      if (button) {
        if (!elements.overlay.hidden && elements.overlay.contains(button)) {
          event.preventDefault();
          if (!event.repeat && !button.disabled) button.click();
        }
        return;
      }
    }
    if (state.mode !== "playing") return;
    event.preventDefault();
    if (event.code === "Space") {
      if (!event.repeat) attack();
      return;
    }
    keys.add(event.code);
    if (event.repeat) return;
    if (event.code.startsWith("Shift")) dash();
    if (event.code === "KeyE") interact();
    if (event.code === "KeyF") parry();
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", clearInput);
  motionPreference?.addEventListener?.("change", ({ matches }) => {
    reducedMotion = matches;
    state.cameraShakeEnabled = !matches;
    if (matches && state.mode === "rolling" && state.entryPhase === "throw") {
      setEntryTiming();
      settleEntry();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInput();
    audio.setVisible(!document.hidden);
    refreshAudioUI();
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (state.mode === "rolling") {
      event.preventDefault();
      openEntry();
      return;
    }
    if (state.mode !== "playing") return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    const aim = renderer.screenToWorld(canvas, event.clientX, event.clientY, state);
    const station = state.stations?.find((entry) => distance(aim, entry) < 1.4);
    if (station) {
      useShelterStation(station);
      return;
    }
    attackPointer = event.pointerId;
    attack();
  });
  function releasePointer(event) {
    touchPointers.delete(event.pointerId);
    if (attackPointer === event.pointerId) attackPointer = null;
  }
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);

  elements["touch-controls"].addEventListener("pointerdown", (event) => {
    const button = event.target.closest("button");
    if (!button || state.mode !== "playing") return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (button.dataset.move) touchPointers.set(event.pointerId, button.dataset.move);
    if (button.dataset.action === "attack") {
      touchPointers.set(event.pointerId, "attack");
      attack();
    }
    if (button.dataset.action === "dash") dash();
    if (button.dataset.action === "interact") interact();
    if (button.dataset.action === "parry") parry();
  });
  elements["touch-controls"].addEventListener("lostpointercapture", releasePointer);
  elements["touch-controls"].addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    const actionName = event.target.closest("button")?.dataset.action;
    if (actionName === "attack") attack();
    if (actionName === "dash") dash();
    if (actionName === "interact") interact();
    if (actionName === "parry") parry();
  });

  const previewStats = rpg.getStats(rpg.createProgress());
  window.TowerAdmin?.setup({ maxFloor: content.floorCount, move(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > content.floorCount) return;
    if (adminRun && run) enterFloor(floor, run.stats.maxHp);
    else newRun(floor);
  } });
  setupTitle();
  requestAnimationFrame(frame);
})();
