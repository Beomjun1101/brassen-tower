(() => {
  "use strict";

  const content = window.TowerContent;
  const renderer = window.TowerRenderer;
  const titleRenderer = window.BrassenTitle;
  const rpg = window.TowerRpg;
  const rewards = window.TowerRewards;
  const story = window.TowerStory;
  const audio = window.TowerAudio;
  const shelter = window.TowerShelter;
  const village = window.TowerVillage;
  const canvas = document.querySelector("#game-canvas");
  const shell = document.querySelector(".game-shell");
  const elements = Object.fromEntries([
    "floor-value", "objective", "health-label", "health-fill", "gold-value",
    "dice-list", "dice-panel", "stage-progress", "stage-title", "threat-label", "notification", "live-status", "overlay",
    "overlay-kicker", "overlay-title", "overlay-copy", "overlay-choices",
    "primary-action", "touch-controls", "hero-label", "level-value", "xp-label", "xp-fill", "gear-list",
    "game-stage", "floor-steps", "hazard-label", "timer-label", "dash-state", "minimap",
    "gear-compare", "compare-equipped", "compare-candidate", "compare-stats", "compare-detail",
    "build-editor", "build-points", "build-stats", "skip-gear",
    "pack-panel", "pack-list", "pack-count", "compare-heading", "compare-candidate-label",
    "audio-toggle", "music-track", "back-to-title", "region-label",
    "elevation-label", "elevation-legend", "scene-speaker", "scene-skip",
    "story-radio", "story-radio-speaker", "story-radio-line",
    "entry-results", "entry-result-dice",
  ].map((id) => [id, document.getElementById(id)]));
  const minimapSection = elements.minimap.closest(".map-section");

  const playerRadius = 0.29;
  const challengeGold = 12;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const diceThrowDuration = 1780;
  const diceResultDuration = 1950;
  const doorOpeningDuration = 610;
  const gateSeconds = 0.64;
  const checkpointKey = "brass-spire-campaign-v1";
  const swingDurations = [0.24, 0.27, 0.32];
  const terrainCycles = {
    conduit: { period: 5.4, warningAt: 3.25, activeAt: 4.25, stopsAt: 5.15, damage: 12 },
    vent: { period: 6.5, warningAt: 3.7, activeAt: 5, stopsAt: 6.1, damage: 15 },
  };
  const entrance = { width: 34, height: 26, spawn: { x: 4, y: 13 }, enemies: [], obstacles: [], items: [] };
  const previewFloorLimit = 20;
  const storyChapters = { 5: "reservoir", 15: "inspection", 29: "collapse", 329: "ledger", 665: "relay", 1009: "key" };
  const clinicLanding = {
    ...entrance, title: "진료소 배관실", theme: "sluice", fixture: "cold-pipe",
    width: 12, height: 9, spawn: { x: 3.55, y: 5.25 }, storySocket: { x: 6.35, y: 4.9 },
    obstacles: [{ x: 2.6, y: 2.25, w: 1.7, h: 1.0 }, { x: 9.55, y: 2.25, w: 2.1, h: 1.3 }],
    stations: [], rolls: [],
  };
  const storyControls = "가까이에서 상호작용";
  const enemyTypes = {
    guard: { hp: 84, speed: 2.57, damage: 24, range: 1.95, windup: 0.56, cooldown: 0.65, radius: 0.32 },
    runner: { hp: 54, speed: 3.47, damage: 19, range: 1.55, windup: 0.46, cooldown: 0.56, radius: 0.27 },
    sentry: { hp: 54, speed: 1.58, damage: 22, range: 7.6, windup: 0.72, cooldown: 1.18, radius: 0.35 },
    lancer: { hp: 72, speed: 2.70, damage: 27, range: 4.7, windup: 0.69, cooldown: 1.13, radius: 0.31 },
    mortar: { hp: 78, speed: 1.55, damage: 30, range: 8.9, windup: 0.94, cooldown: 1.69, radius: 0.38 },
    warden: { hp: 111, speed: 2.10, damage: 28, range: 2.12, windup: 0.69, cooldown: 0.92, radius: 0.43 },
    boss: { hp: 405, speed: 2.24, damage: 34, range: 2.78, windup: 0.83, cooldown: 0.92, radius: 0.58 },
  };
  const movement = {
    up: ["KeyW", "ArrowUp"], down: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"], right: ["KeyD", "ArrowRight"],
  };
  const gameKeys = new Set([...Object.values(movement).flat(), "Space", "ShiftLeft", "ShiftRight", "KeyE"]);
  const keys = new Set();
  const touchPointers = new Map();
  let attackPointer = null;
  let run;
  let stage;
  let state;
  let minimapBackground;
  let adminRun = false;
  let cellGoal = 0;
  let allocation;
  let action;
  let skipScene;
  let notificationUntil = 0;
  let radioUntil = 0;
  let previousTime = performance.now();
  let trackName = "";

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

  function distance(from, to) {
    return Math.hypot(to.x - from.x, to.y - from.y);
  }

  function direction(x, y) {
    const size = Math.hypot(x, y);
    return size > 0.001 ? { x: x / size, y: y / size } : null;
  }

  function isOpen(x, y, radius) {
    if (x < radius || y < radius || x > state.map.width - radius || y > state.map.height - radius) return false;
    return state.obstacles.every((wall) => {
      if (wall.gateLeaf && (state.exit?.openProgress ?? 0) >= 0.92) return true;
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
    if (dx && openStep(actor, actor.x + dx, actor.y, radius)) actor.x += dx;
    if (dy && openStep(actor, actor.x, actor.y + dy, radius)) actor.y += dy;
    return x !== actor.x || y !== actor.y;
  }

  function createPlayer(health, stats, spawn) {
    return {
      ...spawn, hp: health, maxHp: stats.maxHp, facingX: 1, facingY: 0,
      velocityX: 0, velocityY: 0,
      attackFlash: 0, invulnerable: 0, dashFlash: 0, attackCooldown: 0,
      attackVariant: 2, swingLife: 0, nextComboUntil: 0,
      dashCooldown: 0, dashRemaining: 0, dashX: 0, dashY: 0, dashStrikeUntil: 0,
    };
  }

  function createEnemy(enemy, index, floor = state.floor, damageMultiplier = 1) {
    const base = enemyTypes[enemy.kind];
    const depth = Math.max(0, floor - 3);
    const creature = enemy.faction === "creature";
    const hp = Math.round(base.hp * (1 + depth * 0.064) * (enemy.elite ? 1.24 : 1));
    return {
      ...enemy, id: index, hp, maxHp: hp, windup: 0, attackRange: base.range,
      damage: Math.round(((base.damage + (enemy.elite ? 3 : 0)) * (1 + depth * 0.040) + (creature ? 3 : 0)) * damageMultiplier),
      guarded: enemy.kind === "warden", marked: Boolean(enemy.target),
      stellar: floor === content.floorCount && enemy.kind === "boss",
      flash: 0, cooldown: (floor === 1 ? 0.83 : 0.66) + index % 4 * 0.13,
      facingX: -1, facingY: 0, steering: 0,
    };
  }

  function newRun(survivor, jumpFloor) {
    adminRun = jumpFloor !== undefined;
    const seeds = crypto.getRandomValues(new Uint32Array(content.floorCount + 1));
    const progress = survivor?.progress ?? rpg.createProgress(adminRun ? undefined : allocation);
    const classId = survivor?.classId ?? null;
    const stats = village.applyClass(rpg.getStats(progress), classId);
    const random = randomFrom(seeds[0]);
    run = { random, floorSeeds: seeds.slice(1), gold: survivor?.gold ?? 0, seconds: 0, cleared: 0,
      rewards: survivor?.rewards ?? [], totalClears: survivor?.totalClears ?? 0, nextRewardId: survivor?.nextRewardId ?? 0,
      storyChoices: survivor?.storyChoices ?? {}, scenesSeen: survivor?.scenesSeen ?? [],
      trials: [], progress, stats, classId, quests: [], villageVisits: {}, nextWard: 0, nextPower: 0 };
    renderGear();
    if (adminRun) {
      enterFloor(jumpFloor, stats.maxHp);
    } else if (!run.storyChoices.commission) {
      openLanding(1, stats.maxHp, { scene: story.scenes.commission, chapter: "commission" });
    } else {
      enterFloor(1, stats.maxHp);
    }
  }

  function viewFloor(number, data, health, mode, damageMultiplier = 1) {
    return {
      floor: number,
      kind: data.kind, theme: data.theme, region: data.region, revealed: false,
      map: { width: data.width, height: data.height },
      facility: data.facility ?? null,
      elevation: data.elevation ?? null,
      player: createPlayer(health, run?.stats ?? previewStats, data.spawn),
      enemies: data.enemies.map((enemy, index) => createEnemy(enemy, index, number, damageMultiplier)),
      obstacles: data.obstacles,
      terrain: (data.terrain ?? []).map((surface) => ({ ...surface, status: "idle" })),
      items: data.items.map((item) => ({ ...item, collected: false, active: item.kind !== "exit" })),
      hazard: data.hazard, hazardTiles: [], bossTargets: [], bossShockCooldown: 0, projectiles: [],
      timeLimit: data.timeLimit, alarm: false, patrolsArrived: false, hitCount: 0,
      bossPhaseTwo: false, bossOverdrive: false, overdriveReleased: false, shockBursts: 0, shockHits: 0,
      holdZone: data.hold && { ...data.hold, progress: 0, active: false }, mortarTargets: [],
      ward: 0, overclock: 0,
      wave: 1, waveArrival: 0, effects: [], cameraShake: 0, cameraShakeEnabled: !reducedMotion,
      elapsed: 0, revealTimer: 0, entryElapsed: 0, entryDuration: 0, mode,
    };
  }

  function enterFloor(number, health, routeId) {
    saveCheckpoint(number, health, routeId);
    if (content.isShelterFloor(number)) {
      openLanding(number, health, storyAtFloor(number));
      return;
    }
    const floorSeed = run.floorSeeds[number - 1] ?? crypto.getRandomValues(new Uint32Array(1))[0];
    stage = content.createFloor(number, randomFrom(floorSeed), undefined, run.storyChoices, { seed: floorSeed });
    const routeEffects = content.routes.find(({ id }) => id === routeId)?.effects ?? {};
    state = viewFloor(number, stage, health, "rolling", routeEffects.enemyDamageMultiplier);
    state.routeEffects = routeEffects;
    state.entryRolls = stage.rolls;
    state.entrySettleAt = stage.rolls.length ? (reducedMotion ? 180 : diceThrowDuration) : 0;
    state.entryOpenAt = stage.rolls.length ? state.entrySettleAt + diceResultDuration : (reducedMotion ? 0 : 270);
    state.entryDuration = state.entryOpenAt + (reducedMotion ? 180 : doorOpeningDuration);
    state.entryPhase = stage.rolls.length ? "throw" : "open";
    state.entryTicks = 0;
    state.ward = run.nextWard + (routeEffects.ward ?? 0);
    state.overclock = run.nextPower;
    run.nextWard = 0;
    run.nextPower = 0;
    cellGoal = state.items.filter((item) => item.kind === "cell").length;
    if (state.hazard === "sparks") {
      const locations = [
        [0.2, 0.37], [0.38, 0.56], [0.55, 0.25], [0.31, 0.73], [0.64, 0.67], [0.81, 0.47], [0.82, 0.83],
      ].map(([x, y]) => ({ x: state.map.width * x, y: state.map.height * y }))
        .filter(({ x, y }) => walkable(x, y, 0.84));
      const offset = Math.floor(run.random() * Math.max(1, locations.length));
      state.sparkLocations = locations.slice(offset).concat(locations.slice(0, offset));
      state.sparkCycle = -1;
    }
    const encounter = storyAtFloor(number);
    const exit = state.items.find((item) => item.kind === "exit");
    if (exit) {
      state.exit = exit;
      state.obstacles = [...state.obstacles, ...content.exitGateWalls(exit)];
    } else if (number === 1) {
      const gate = stage.gateMarker ?? { x: stage.width - 1.55, y: stage.height * 0.61 };
      state.gateMarker = { ...gate, type: "sluice", active: false, openProgress: 0 };
    }
    if (stage.final && exit) {
      state.storyPoint = { x: exit.x, y: exit.y, scene: story.epilogue(run.storyChoices), atExit: true,
        prompt: "공급 밸브 열기", device: "valve", active: false };
    } else if (encounter) {
      state.storyPoint = { ...(stage.storySocket ?? { x: 30.7, y: 16.3 }), ...encounter, active: false };
    }
    elements.notification.hidden = true;
    renderDice();
    renderFloorSteps();
    syncHUD();
    panel({
      kicker: number + "층",
      title: stage.rolls.length ? "주사위 투척" : "문 개방",
      copy: "",
    });
  }

  function saveCheckpoint(floor, health, route) {
    if (adminRun) return;
    const { random, stats, floorSeeds, ...data } = run;
    try {
      localStorage.setItem(checkpointKey, JSON.stringify({ floor, health, route, randomSeed: random.snapshot(),
        run: { ...data, floorSeeds: [...floorSeeds] } }));
    } catch {
      // Browser privacy and storage settings can make checkpointing unavailable.
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

  function restoreCheckpoint(saved) {
    adminRun = false;
    try {
      for (const entry of saved.run.rewards) {
        if (entry.kind === "gear") {
          const version = entry.item.id.lastIndexOf("@");
          rpg.rewardGear({ ...entry.item, id: entry.item.id.slice(0, version) });
        }
      }
      run = { ...saved.run, storyChoices: saved.run.storyChoices ?? {}, scenesSeen: saved.run.scenesSeen ?? [],
        classId: saved.run.classId ?? null, quests: saved.run.quests ?? [], villageVisits: saved.run.villageVisits ?? {},
        random: randomFrom(saved.randomSeed), stats: village.applyClass(rpg.getStats(saved.run.progress), saved.run.classId) };
      delete run.localPlans;
      renderGear();
      const health = Math.min(run.stats.maxHp, Math.max(1, saved.health ?? run.stats.maxHp));
      if (saved.floor === 1 && !run.storyChoices.commission) {
        openLanding(1, health, { scene: story.scenes.commission, chapter: "commission" });
      } else {
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
      if (state.landing || state.combatComplete) {
        trackName = audio.cue(state.landing ? "shelter" : "story");
      } else {
        const boss = state.kind === "boss";
        const roster = livingEnemies().map((enemy) => enemy.kind + (enemy.elite ? " elite" : "")).sort();
        const phase = boss ? (state.bossPhaseTwo ? 1 : 0) + (state.bossOverdrive ? 1 : 0) : state.wave - 1 + Number(state.alarm);
        trackName = audio.cue(boss ? "boss" : state.theme, { theme: state.theme, floor: state.floor, foes: roster.join("/"), phase });
      }
    } else {
      const menus = { title: "title", menu: "title", rolling: "entry", story: "story", shelter: "shelter",
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

  function panel({ kicker, title, copy, options = [], primary, activate, beat, skip }) {
    clearInput();
    hideRadio();
    setText("overlay-kicker", kicker);
    setText("overlay-title", title);
    setText("overlay-copy", copy);
    elements["build-editor"].hidden = state.mode !== "menu";
    elements["gear-compare"].hidden = state.mode !== "gear";
    elements.overlay.dataset.mode = state.mode;
    elements.overlay.dataset.scene = state.mode === "story" ? state.scene : "";
    elements.overlay.dataset.speakerTone = beat?.tone ?? "";
    elements.overlay.dataset.entryPhase = state.mode === "rolling" ? state.entryPhase : "";
    elements["entry-results"].hidden = true;
    elements["scene-speaker"].hidden = !beat?.speaker;
    setText("scene-speaker", beat?.speaker ?? "");
    shell.dataset.appMode = state.mode;
    canvas.tabIndex = -1;
    if (state.mode === "title") canvas.setAttribute("aria-hidden", "true");
    else canvas.removeAttribute("aria-hidden");
    elements.overlay.scrollTop = 0;
    elements["game-stage"].dataset.mode = state.mode;
    elements["overlay-choices"].replaceChildren(...options.map(({ id, title, description, detail, choose, rpgChoice, rarity, disabled, icon, price }) => {
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
    }));
    action = activate;
    skipScene = skip?.activate;
    elements["scene-skip"].hidden = !skip;
    if (skip) setText("scene-skip", skip.label);
    elements["primary-action"].hidden = !primary;
    elements["primary-action"].disabled = false;
    if (primary) setText("primary-action", primary);
    elements.overlay.hidden = false;
    renderPack();
    syncMusic();
    setText("live-status", beat ? [beat.speaker, beat.line].filter(Boolean).join(". ") : title);
    const firstOption = elements["overlay-choices"].querySelector("button:not(:disabled)");
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
    cellGoal = 0;
    state = viewFloor(1, entrance, previewStats.maxHp, "title");
    elements.overlay.dataset.titleMenu = String(menu);
    notify(null);
    renderDice();
    renderGear();
    renderFloorSteps();
    syncHUD();
    const checkpoint = menu ? readCheckpoint() : null;
    const options = [];
    if (checkpoint) options.push({
      id: "resume", title: "이어하기", description: checkpoint.floor + "층 입장부터",
      choose: () => { if (!restoreCheckpoint(checkpoint)) setupBuild(); },
    });
    if (menu) options.push({
      id: "new-run", title: "새 등반", description: checkpoint ? "시련에 들어가면 새 기록이 저장됩니다." : "능력치 5점을 배분해 등반을 준비합니다.",
      choose: setupBuild,
    });
    panel({ kicker: "", title: "Brassen Tower", copy: menu ? "" : "1,332층을 향하는 액션 로그라이크 · 1–20층 체험판",
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
    state = viewFloor(1, entrance, previewStats.maxHp, "menu");
    cellGoal = 0;
    notify(null);
    renderDice();
    renderGear();
    renderFloorSteps();
    syncHUD();
    panel({
      kicker: "새 등반",
      title: "능력치 배분",
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
    elements["build-stats"].querySelector("button[data-step='1']")?.focus({ preventScroll: true });
  }

  function enterPlayableScene() {
    state.mode = "playing";
    state.revealed = true;
    shell.dataset.appMode = state.mode;
    elements["game-stage"].dataset.mode = state.mode;
    elements.overlay.hidden = true;
    renderDice();
    renderPack();
    syncMusic();
    setText("live-status", stage.title + ". " + stage.objective);
    canvas.tabIndex = 0;
    canvas.focus({ preventScroll: true });
  }

  function beginFloor() {
    state.revealTimer = reducedMotion ? 0 : 1.05;
    state.cameraShake = reducedMotion ? 0 : 0.14;
    enterPlayableScene();
    if (stage.final && state.kind === "boss") {
      const anchor = { ...stage.storySocket, scene: story.starPrelude, active: false, celestial: true };
      state.storyPoint = anchor;
      showScene(anchor, () => {
        state.storyPoint = null;
        enterPlayableScene();
        notify("별의 산파 · 접근하는 별무리를 피해 틈을 노리세요.", 2600);
      });
      return;
    }
    if (state.floor === 2) showRadio("sluice-open");
    if (state.floor === 3) showRadio("pressure-start");
    if (stage.final) showRadio("final-lead");
    if (stage.destinationCue) displayRadio(stage.destinationCue);
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
      messages.push("입장 금화 +" + entryGold);
    }
    if (entryXp) {
      const gainedXp = Math.round(entryXp * (1 + run.stats.xpBonus));
      const growth = awardXp(entryXp);
      messages.push("입장 경험치 +" + gainedXp, ...growth);
    }
    if (damageBonus) messages.push("공격력 " + statValue("damage", damageBonus, true));
    if (clearGoldBonus) messages.push("통과 보상 금화 +" + clearGoldBonus);
    if (clearXpBonus) messages.push("통과 보상 XP +" + clearXpBonus);
    if (dashCooldownMultiplier) {
      messages.push("회피 재사용 시간 " + (dashCooldownMultiplier < 1 ? "단축" : "증가"));
    }
    if (state.ward) messages.push("보호막 " + state.ward);
    if (state.overclock) messages.push("공급품 공격력 +" + state.overclock);
    notify(messages.join(" · "));
  }

  function advanceEntry(gap) {
    state.entryElapsed += Math.min(65, gap);
    const rebounds = [0.38, 0.49, 0.61, 0.73];
    while (state.entryTicks < state.entryRolls.length && !reducedMotion &&
        state.entryElapsed >= state.entrySettleAt * rebounds[state.entryTicks]) {
      audio.dieTick(state.entryTicks);
      state.entryTicks++;
    }
    const phase = state.entryElapsed >= state.entryOpenAt ? "open"
      : state.entryElapsed >= state.entrySettleAt ? "result" : "throw";
    if (phase !== state.entryPhase) {
      state.entryPhase = phase;
      elements.overlay.dataset.entryPhase = phase;
      const result = phase === "result";
      const destination = result ? stage.destination?.title : undefined;
      setText("overlay-title", result ? destination ?? "주사위 결과" : "문 개방");
      if (result) {
        const labels = state.entryRolls.length === 4 ? ["행선지", "환경", "배치", "보상"] : ["환경", "배치", "보상"];
        const summary = [];
        elements["entry-result-dice"].replaceChildren(...state.entryRolls.map(({ value, sides }, index) => {
          const entry = document.createElement("li");
          const label = document.createElement("span");
          label.textContent = labels[index];
          const score = document.createElement("strong");
          score.textContent = value + " / " + sides;
          summary.push(labels[index] + " " + value);
          entry.append(label, score);
          return entry;
        }));
        setText("live-status", [destination ?? "주사위 결과", ...summary].join(". "));
      }
      elements["entry-results"].hidden = !result;
    }
    if (state.entryElapsed >= state.entryDuration) beginFloor();
  }

  function storyAtFloor(floor) {
    const chapter = storyChapters[floor];
    if (chapter) {
      const setting = run.storyChoices[chapter];
      if (setting && !content.isShelterFloor(floor)) return null;
      return { scene: story.scenes[chapter], chapter, setting };
    }
    if (floor === content.floorCount) return null;
    const operation = story.operations[floor]?.(run.storyChoices);
    if (operation && !run.scenesSeen.includes(operation.scene.id ?? floor)) return operation;
    const scene = story.interludes[floor] ?? story.shelterNotes[floor];
    if (!scene) return null;
    const seen = run.scenesSeen.includes(scene.id ?? floor);
    if (seen && !content.isShelterFloor(floor)) return null;
    return { scene, setting: seen ? "read" : undefined };
  }

  function openLanding(floor, health, encounter) {
    const seed = run.floorSeeds[floor - 1];
    const planner = window.BrassenMapPlanner;
    const roll = randomFrom(seed);
    const plan = floor > 1 && floor <= previewFloorLimit ? planner?.plan({ floor, seed, kind: "shelter", theme: "shelter",
      choices: run.storyChoices, macro: 1 + Math.floor(roll() * 6), placement: 1 + Math.floor(roll() * 4),
      minor: 1 + Math.floor(roll() * 4) }) : null;
    const landing = floor === 1 ? clinicLanding : shelter.create(floor, plan, { seed, choices: run.storyChoices });
    stage = {
      ...landing, region: content.getRegion(floor), hazard: "none",
      objective: "휴식하거나 장비를 정비한 뒤 출발하세요.",
    };
    state = viewFloor(floor, stage, health, "playing");
    state.landing = landing.fixture;
    state.shelter = floor === 1 ? null : landing;
    state.stations = landing.stations;
    if (encounter) {
      state.storyPoint = { ...landing.storySocket, ...encounter, active: !encounter.setting,
        triggeredAt: encounter.setting ? 0 : undefined };
    }
    cellGoal = 0;
    notify(null);
    hideRadio();
    renderFloorSteps();
    enterPlayableScene();
    if (state.storyPoint?.active) activateStoryPoint(state.storyPoint);
  }

  function hideRadio() {
    elements["story-radio"].hidden = true;
  }

  function showRadio(key) {
    displayRadio(story.cues[key]?.(run.storyChoices));
  }

  function displayRadio(cue) {
    if (!cue) return;
    elements["story-radio"].hidden = false;
    setText("story-radio-speaker", cue.speaker);
    setText("story-radio-line", cue.line);
    audio.deviceSignal("radio");
    radioUntil = performance.now() + Math.max(4100, cue.line.length * 120);
  }

  function activateStoryPoint(marker) {
    const physical = startIncident(marker);
    if (physical) hideRadio();
    else showRadio(marker.scene.cue);
    if (state.floor <= previewFloorLimit && !marker.scene.optional) {
      notify("이야기 · " + marker.scene.title, 2800);
    }
    return physical;
  }

  function rememberStoryPoint(point) {
    if (point.chapter || point.atExit) return;
    const id = point.scene.id ?? state.floor;
    if (!run.scenesSeen.includes(id)) run.scenesSeen.push(id);
  }

  function applyStoryChoice(chapter, choice) {
    if (run.storyChoices[chapter]) return false;
    const { id, effect } = choice;
    run.storyChoices[chapter] = id;
    creditGold(effect.gold);
    if (effect.xp) awardXp(effect.xp);
    if (effect.stat) updateProgress(rpg.gainStat(run.progress, effect.stat, effect.amount));
    run.nextWard += effect.ward ?? 0;
    run.nextPower += effect.overclock ?? 0;
    return true;
  }

  function incidentPositions(anchor, count) {
    const spacing = 0.52;
    const origin = { x: anchor.x, y: anchor.y };
    const reachable = [{ ...origin, col: 0, row: 0 }];
    const visited = new Set(["0,0"]);
    const stations = state.stations ?? [];
    for (let index = 0; index < reachable.length; index++) {
      const from = reachable[index];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const col = from.col + dx, row = from.row + dy;
        const key = col + "," + row;
        if (Math.abs(col) > 9 || Math.abs(row) > 9 || visited.has(key)) continue;
        const x = origin.x + col * spacing, y = origin.y + row * spacing;
        if (!openStep(from, x, y, 0.47)) continue;
        visited.add(key);
        reachable.push({ x, y, col, row });
      }
    }
    const positions = [origin];
    const offsets = [[-2.6, 1.55], [0.75, -2.60], [2.6, 1.55]];
    const options = reachable.filter((spot) => stations.every((station) => distance(station, spot) > 1.5));
    for (const [x, y] of offsets.slice(0, count - 1)) {
      const target = { x: origin.x + x, y: origin.y + y };
      const nearest = [...options].sort((a, b) => distance(a, target) - distance(b, target));
      const spot = nearest.find((candidate) => positions.every((position) => distance(candidate, position) >= 2.3))
        ?? nearest.find((candidate) => positions.every((position) => distance(candidate, position) >= 1.25));
      if (!spot) return null;
      positions.push({ x: spot.x, y: spot.y });
    }
    return positions;
  }

  function startIncident(anchor) {
    const definition = anchor.operation ?? story.incidents[anchor.chapter];
    if (!definition) return false;
    const steps = definition.steps;
    const options = anchor.scene.choices ?? [];
    const positions = incidentPositions(anchor, steps.length + options.length);
    if (!positions) return false;
    const points = steps.map(({ done, ...step }, index) => ({
      ...positions[index], ...step, doneText: done, active: index === 0, done: false,
    }));
    options.forEach((choice, index) => {
      const [device, label] = definition.routes[choice.id];
      points.push({ ...positions[steps.length + index], device, label, hint: choice.description, kind: "choose",
        choice: choice.id, active: false, done: false });
    });
    anchor.active = false;
    state.incident = { anchor, points, definition, step: 0, steps: steps.length, progress: 0, payload: false,
      reservoir: anchor.chapter === "reservoir", complete: false, task: steps[0].task };
    setText("live-status", state.incident.task);
    return true;
  }

  function incidentPointInReach(point, radius = 1.26) {
    const player = state.player;
    return point.active && distance(player, point) <= radius && closeReach(player, point) &&
      isOpen((point.x + player.x) / 2, (point.y + player.y) / 2, 0.13);
  }

  function completeIncidentStep(point) {
    const incident = state.incident;
    point.done = true;
    point.active = false;
    point.triggeredAt = performance.now() / 1000;
    incident.step++;
    incident.progress = 0;
    if (incident.step === incident.steps) {
      const branches = incident.points.slice(incident.steps);
      if (!branches.length) {
        finishIncident(point, point.doneText);
        return;
      }
      for (const branch of branches) branch.active = true;
      incident.task = incident.definition.task;
    } else {
      const next = incident.points[incident.step];
      next.active = true;
      incident.task = next.task;
    }
    audio.deviceSignal(point.device === "cartridge" ? "terminal" : "valve");
    addEffect("loot", point, 0.6);
    notify(point.doneText);
    setText("live-status", incident.task);
  }

  function finishIncident(point, result) {
    const incident = state.incident;
    const anchor = incident.anchor;
    for (const entry of incident.points) entry.active = false;
    point.done = true;
    point.triggeredAt = performance.now() / 1000;
    incident.complete = true;
    incident.payload = false;
    incident.task = result;
    anchor.setting = point.choice ?? "read";
    anchor.triggeredAt = point.triggeredAt;
    rememberStoryPoint(anchor);
    audio.deviceSignal(point.device);
    addEffect("loot", point, 0.75);
    notify(result, 2800);
    setText("live-status", result);
    if (state.shelter) saveVillage();
    else incident.leaveAt = state.elapsed + 1.1;
  }

  function useIncidentPoint(point) {
    if (!incidentPointInReach(point)) return;
    const incident = state.incident;
    if (point.kind === "hold") {
      notify("압력판 위에 서 있으면 서서히 안정됩니다.", 1400);
      return;
    }
    if (point.kind === "choose") {
      const anchor = incident.anchor;
      const choice = anchor.scene.choices.find(({ id }) => id === point.choice);
      if (!applyStoryChoice(anchor.chapter, choice)) return;
      finishIncident(point, incident.definition.result[point.choice]);
      return;
    }
    if (point.kind === "lift") incident.payload = true;
    if (point.kind === "fit") incident.payload = false;
    completeIncidentStep(point);
  }

  function updateIncident(delta) {
    const incident = state.incident;
    if (!incident) return;
    if (incident.leaveAt !== undefined && state.elapsed >= incident.leaveAt) {
      incident.leaveAt = undefined;
      if (incident.anchor.chapter === "commission") enterFloor(1, state.player.hp);
      else finishFloorRewards();
      return;
    }
    const point = incident.points[incident.step];
    if (point?.kind !== "hold" || !point.active) return;
    if (incidentPointInReach(point, 0.66)) {
      incident.progress = Math.min(1, incident.progress + delta / point.time);
      if (incident.progress >= 1) completeIncidentStep(point);
    } else {
      incident.progress = Math.max(0, incident.progress - delta * 0.45);
    }
  }

  function showScene(point, resume) {
    const { scene, chapter } = point;
    state.mode = "story";
    state.scene = scene.art;
    point.triggeredAt = performance.now() / 1000;
    audio.deviceSignal(point.device ?? scene.device);
    notify(null);
    const directionToDevice = direction(point.x - state.player.x, point.y - state.player.y);
    setFacing(state.player, directionToDevice);
    state.player.moving = false;
    state.player.velocityX = state.player.velocityY = 0;
    state.player.dashRemaining = 0;
    state.player.dashFlash = 0;
    state.player.swingLife = 0;
    state.player.attackFlash = 0;
    state.player.pendingStrike = undefined;
    const beats = scene.beats(run.storyChoices);
    const stageState = state;
    const active = () => state === stageState && state.mode === "story";
    const leave = () => {
      if (active()) resume();
    };
    const present = (beat, controls) => {
      if (!active()) return;
      state.storyShot = beat?.shot ?? "device";
      panel({ kicker: scene.chapter, title: scene.title, copy: beat?.line ?? scene.choicePrompt, beat, ...controls });
    };
    const options = (scene.choices ?? []).map((choice) => ({
      id: choice.id, title: choice.title, detail: choice.description,
      choose: () => {
        if (!active() || !applyStoryChoice(chapter, choice)) return;
        point.setting = choice.id;
        point.triggeredAt = performance.now() / 1000;
        audio.deviceSignal(point.device ?? scene.device);
        const response = scene.response?.(run.storyChoices);
        if (response) {
          notify(null);
          present(response, { primary: state.floor === 1 ? "수문으로" : "계속", activate: leave });
        } else {
          leave();
        }
      },
    }));
    const choose = () => present(null, { options });
    function read(index) {
      const last = index === beats.length - 1;
      if (last && options.length) {
        present(beats[index], { options });
        return;
      }
      const next = last ? leave : () => read(index + 1);
      const primary = last ? "계속" : "다음 대사";
      const skip = !last && (options.length
        ? { label: "선택으로", activate: choose }
        : { label: "건너뛰기", activate: leave });
      present(beats[index], { primary, activate: next, skip });
    }
    read(0);
  }

  function renderDice() {
    const section = elements["dice-panel"];
    section.hidden = !state.revealed || !stage.rolls.length;
    section.open = false;
    if (section.hidden) {
      elements["dice-list"].replaceChildren();
      return;
    }
    elements["dice-list"].replaceChildren(...stage.rolls.map((roll) => {
      const entry = document.createElement("div");
      entry.className = "verdict-row";
      const die = document.createElement("span");
      die.className = "verdict-die";
      die.dataset.value = String(roll.value);
      die.setAttribute("aria-hidden", "true");
      die.append(...Array.from({ length: 9 }, () => document.createElement("i")));
      const copy = document.createElement("div");
      const label = document.createElement("strong");
      label.className = "verdict-title";
      label.textContent = roll.label;
      label.setAttribute("aria-label", roll.label + ", 주사위 눈 " + roll.value);
      const detail = document.createElement("small");
      detail.className = "verdict-result";
      detail.textContent = roll.detail;
      copy.append(label, detail);
      entry.append(die, copy);
      return entry;
    }));
  }

  function livingEnemies() {
    return state.enemies.filter((enemy) => enemy.hp > 0);
  }

  function gatheredCells() {
    return state.items.filter((item) => item.kind === "cell" && item.collected).length;
  }

  function exitBlocker() {
    if (gatheredCells() < cellGoal) return "cells";
    if (state.kind === "escape" && state.elapsed < (stage.unlockAfter ?? 10)) return "timer";
    if (state.enemies.some((enemy) => enemy.gateGuard && enemy.hp > 0)) return "guard";
    return null;
  }

  function openExitIfReady() {
    const exit = state.items.find((item) => item.kind === "exit");
    if (!exit || exit.active || exitBlocker()) return false;
    exit.active = true;
    exit.openSince = state.elapsed;
    exit.openProgress = reducedMotion ? 1 : 0;
    if (reducedMotion && state.storyPoint?.atExit) state.storyPoint.active = true;
    addEffect("pickup", exit, 0.62);
    notify(stage.final ? "공급 밸브 잠금 해제" : state.theme === "sluice" ? "수문 잠금 해제" : "격벽문 잠금 해제");
    return true;
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
    return { point, shape };
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
    const { image, point, shape } = minimapBackground;
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
        enemy.marked ? "#ffd482" : ["sentry", "mortar"].includes(enemy.kind) ? "#ef9af0" : "#f08c75");
    }
    for (const item of state.items) {
      if (item.collected) continue;
      const [x, y] = point(item.x, item.y);
      if (item.kind === "exit") {
        context.strokeStyle = item.active ? "#c5f7ae" : "#c1cbb9";
        if (item.active) {
          context.fillStyle = "#9ad879";
          context.fillRect(x - 3, y - 3, 6, 6);
        }
        context.strokeRect(x - 3, y - 3, 6, 6);
      } else {
        mapPolygon(context, [[x, y - 4], [x + 4, y], [x, y + 4], [x - 4, y]], "#ffda8b", "#553c28");
      }
    }
    if (state.holdZone) {
      const { x, y, radius } = state.holdZone;
      mapPolygon(context, shape(x - radius / 2, y - radius / 2, radius, radius), "#4cad99", "#9cf7df");
    }
    const storyMarkers = state.incident?.points ?? (state.storyPoint ? [state.storyPoint] : []);
    for (const marker of storyMarkers) {
      if (!marker.active) continue;
      const [mx, my] = point(marker.x, marker.y);
      mapPolygon(context, [[mx, my - 4], [mx + 4, my], [mx, my + 4], [mx - 4, my]], "#edbb79", "#2e261a");
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
    const active = state.revealed && state.mode === "playing" && !state.landing && !state.combatComplete;
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
    if (active && state.kind === "combat" && !state.waveArrival && state.hitCount === 0) threat = "무피격 +" + challengeGold + " 금화";
    if (active && state.bossOverdrive) threat = "과열";
    if (active && state.kind === "escape" && state.elapsed < (stage.unlockAfter ?? 10)) {
      threat = "시간 잠금 " + Math.ceil((stage.unlockAfter ?? 10) - state.elapsed) + "초";
    }
    setText("threat-label", threat);
    elements["threat-label"].hidden = !threat;
    const remaining = state.player.dashCooldown;
    elements["dash-state"].dataset.ready = String(remaining <= 0);
    setText("dash-state", remaining > 0 ? (Math.ceil(remaining * 10) / 10).toFixed(1) + "초" : "준비");
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
    const point = state.storyPoint;
    const incident = state.incident;
    setText("objective", state.revealed
      ? incident && (!incident.complete || incident.leaveAt !== undefined) ? incident.task
      : point?.active && (!point.scene.optional || storyPointInReach(point))
        ? (point.prompt ?? point.scene.prompt) + " · " + storyControls : stage.objective
      : "");
    if (minimapSection.hidden !== !state.revealed) minimapSection.hidden = !state.revealed;
    setText("health-label", Math.ceil(state.player.hp) + " / " + maxHp);
    setText("gold-value", String(run?.gold ?? 0));
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
    if (cellGoal || state.kind === "escape") {
      const exit = state.items.find((item) => item.kind === "exit");
      const guards = alive.filter((enemy) => enemy.gateGuard).length;
      const label = stage.final ? "배분 회로" : "전력 셀";
      if (exit?.active) {
        progress = (stage.final ? "공급 밸브 가동 가능" : "출구 개방") + " · 가까이에서 상호작용";
      } else {
        const objectives = [];
        if (cellGoal) objectives.push(label + " " + gatheredCells() + " / " + cellGoal);
        if (guards) objectives.push("출구 경비 " + guards);
        progress = objectives.join(" · ") || "출구 잠김";
      }
    } else if (state.enemies.some((enemy) => enemy.kind === "boss")) {
      const boss = state.enemies.find((enemy) => enemy.kind === "boss");
      progress = (stage.bossName ?? "수호자") + " " + Math.ceil(boss.hp / boss.maxHp * 100) + "%";
      if (boss.shielded) progress += " · 충격파 충전";
    } else if (state.holdZone) {
      const zone = state.holdZone;
      progress = "동기화 " + Math.floor(zone.progress * 100) + "%";
      if (zone.active) progress += " · 구역 확보";
    } else if (state.kind === "hunt") {
      const target = state.enemies.find((enemy) => enemy.marked);
      progress = "표식 대상 · " + Math.ceil(target.hp / target.maxHp * 100) + "%";
    }
    if (!state.revealed || state.landing || state.combatComplete) progress = "";
    if (incident && !incident.complete) {
      const step = incident.points[incident.step];
      const nearby = incident.points.find((entry) => entry.hint && incidentPointInReach(entry));
      progress = nearby?.hint ?? (step?.kind === "hold" && step.active
        ? "압력 안정 " + Math.floor(incident.progress * 100) + "%" : "");
    }
    setText("stage-progress", progress);
    updateRunIndicators();
  }

  function renderGear() {
    const equipped = run ? rpg.equippedBySlot(run.progress) : new Map();
    elements["gear-list"].replaceChildren(...rpg.slots.map((slot) => {
      const item = equipped.get(slot.id);
      const box = document.createElement("div");
      box.className = item ? "gear-slot" : "gear-slot gear-slot-empty";
      box.dataset.slot = slot.id;
      if (item) box.dataset.rarity = item.rarity;
      const emblem = document.createElement("span");
      emblem.className = "gear-icon";
      emblem.textContent = slot.icon;
      emblem.setAttribute("aria-hidden", "true");
      const label = document.createElement("small");
      label.textContent = slot.title;
      const name = document.createElement("strong");
      name.className = "gear-name";
      name.textContent = item?.title || "비어 있음";
      const info = document.createElement("span");
      info.append(label, name);
      box.append(emblem, info);
      if (item?.tag) {
        const tag = document.createElement("small");
        tag.className = "gear-tag";
        tag.textContent = item.tag;
        box.append(tag);
      }
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
    return Object.entries(effects).map(([key, value]) => descriptions[key] + value).join(" · ");
  }

  function renderPack() {
    const pack = elements["pack-list"];
    const entries = run?.rewards.filter((entry) => entry.kind !== "gold").slice().reverse() ?? [];
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
      const equipped = entry.kind === "gear" && run.progress.gearIds.includes(entry.item.id);
      button.disabled = !safe || equipped || entry.kind === "upgrade";
      detail.textContent = entry.kind === "gear"
        ? rpg.slots.find(({ id }) => id === entry.item.slot).title + " · " + entry.item.power + "층 보상" + (equipped ? " · 장착 중" : "")
        : entry.kind === "supply" ? describeSupply(entry.item) : "공격력 +6 · 적용 중";
      button.append(title, detail);
      button.addEventListener("click", () => useOwnedReward(entry));
      return button;
    }));
  }

  function useOwnedReward(entry) {
    if (!packAvailable() || !run.rewards.includes(entry)) return;
    if (entry.kind === "gear") {
      updateProgress(rpg.equip(run.progress, entry.item.id));
      renderGear();
    } else if (entry.kind === "supply") {
      const { gold, heal, xp, ward, overclock } = entry.item.effects;
      run.rewards = run.rewards.filter((record) => record !== entry);
      creditGold(gold);
      if (heal) state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
      if (xp) awardXp(xp);
      run.nextWard += ward ?? 0;
      run.nextPower += overclock ?? 0;
    }
    if (state.mode === "gear" && run.selectedReward) showRewardComparison(run.selectedReward);
    if (state.mode === "branch") {
      setText("overlay-copy", "체력 " + Math.ceil(state.player.hp) + " / " + state.player.maxHp + " · 금화 " + run.gold);
    }
    if (state.mode === "playing" && state.shelter) saveVillage();
    syncHUD();
    renderPack();
    notify(entry.item.title + (entry.kind === "gear" ? " 장착" : " 사용"));
  }

  function packAvailable() {
    return ["gear", "branch"].includes(state.mode) || (state.mode === "playing" && state.shelter);
  }

  function updateProgress(progress) {
    const player = state.player;
    const stats = village.applyClass(rpg.getStats(progress), run.classId);
    const health = player.hp + stats.maxHp - player.maxHp;
    run.progress = progress;
    run.stats = stats;
    player.maxHp = stats.maxHp;
    player.hp = player.hp > 0 ? Math.max(1, Math.min(stats.maxHp, health)) : 0;
  }

  function awardXp(amount) {
    const previous = run.progress;
    updateProgress(rpg.gainXp(previous, Math.round(amount * (1 + run.stats.xpBonus)), run.random));
    const gains = rpg.levelAttributeGains(previous, run.progress).map(({ title, amount }) => title + " +" + amount);
    if (gains.length) {
      addEffect("level", state.player, 0.76);
      notify(["레벨 상승 · Lv. " + run.progress.level, ...gains].join(" · "), 3300);
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

  function addEffect(kind, actor, life) {
    state.effects.push({
      kind, x: actor.x, y: actor.y, life, maxLife: life,
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

  function setFacing(actor, aim) {
    if (!aim) return;
    actor.facingX = aim.x;
    actor.facingY = aim.y;
  }

  function enemiesInReach(range) {
    const player = state.player;
    return livingEnemies()
      .filter((enemy) => distance(player, enemy) <= range + enemyTypes[enemy.kind].radius &&
        closeReach(player, enemy) && hasLineOfSight(player, enemy))
      .sort((a, b) => distance(player, a) - distance(player, b));
  }

  function attack() {
    const player = state.player;
    if (state.mode !== "playing" || state.landing || state.combatComplete ||
        player.attackCooldown > 0 || player.pendingStrike || player.dashRemaining > 0) return;
    const route = state.routeEffects ?? {};
    const range = (run.stats.attackRange + (route.attackRangeBonus ?? 0)) * (state.hazard === "mist" ? 0.85 : 1);
    const target = enemiesInReach(range)[0];
    if (target) setFacing(player, direction(target.x - player.x, target.y - player.y));
    player.attackCooldown = Math.max(0.12, run.stats.attackCooldown * (route.attackCooldownMultiplier ?? 1));
    player.attackVariant = state.elapsed < player.nextComboUntil ? (player.attackVariant + 1) % 3 : 0;
    player.nextComboUntil = state.elapsed + 0.62;
    player.swingDuration = Math.min(swingDurations[player.attackVariant], player.attackCooldown + 0.04);
    player.swingLife = player.swingDuration;
    player.attackFlash = player.swingDuration;
    player.pendingStrike = { at: state.elapsed + player.swingDuration * 0.37, range,
      x: player.facingX, y: player.facingY };
  }

  function advanceStrike() {
    const player = state.player;
    const strike = player.pendingStrike;
    if (!strike || strike.at > state.elapsed) return;
    player.pendingStrike = undefined;
    const route = state.routeEffects ?? {};
    const workshopPower = run.rewards.filter((entry) => entry.kind === "upgrade").length * 6;
    const damage = run.stats.damage + (route.damageBonus ?? 0) + state.overclock + workshopPower;
    const dashStrike = run.stats.dashStrike + (route.dashStrikeBonus ?? 0);
    const guardBreak = Math.min(1, run.stats.guardBreak + (route.guardBreakBonus ?? 0));
    const healOnKill = run.stats.healOnKill + (route.healOnKillBonus ?? 0);
    for (const enemy of enemiesInReach(strike.range)) {
      const aim = direction(enemy.x - player.x, enemy.y - player.y);
      const dot = aim ? aim.x * strike.x + aim.y * strike.y : 1;
      if (dot < 0.38) continue;
      let healthLimit = 0;
      if (enemy.kind === "boss") {
        if (state.shockBursts === 0) healthLimit = Math.floor(enemy.maxHp / 2);
        else if (!state.overdriveReleased) healthLimit = Math.floor(enemy.maxHp * 0.27);
      }
      if (enemy.hp <= healthLimit) continue;
      const dashDamage = state.elapsed < player.dashStrikeUntil ? dashStrike : 0;
      player.dashStrikeUntil = 0;
      const finishing = enemy.hp <= enemy.maxHp * 0.30 ? run.stats.finishingDamage : 0;
      const frontal = !aim || aim.x * enemy.facingX + aim.y * enemy.facingY <= -0.38;
      const armor = enemy.guarded && frontal ? 0.26 + 0.74 * guardBreak : 1;
      enemy.hp = Math.max(healthLimit, enemy.hp - Math.max(1, Math.round((damage + dashDamage + finishing) * armor)));
      enemy.flash = 0.16;
      if (!reducedMotion && player.attackVariant === 2) state.cameraShake = Math.max(state.cameraShake, 0.12);
      addEffect(armor < 0.50 ? "charge" : "hit", enemy, 0.28);
      if (!enemy.hp) {
        enemy.windup = 0;
        addEffect("fall", enemy, 0.42);
        if (enemy.elite || enemy.kind === "boss") addEffect("loot", enemy, 0.52);
        awardXp(rpg.killXp(enemy));
        trackQuests({ type: "kill", kind: enemy.kind, faction: enemy.faction, elite: enemy.elite });
        if (healOnKill > 0 && player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + healOnKill);
          addEffect("pickup", player, 0.28);
        }
      }
    }
  }

  function dash() {
    const player = state.player;
    if (state.mode !== "playing" || player.dashCooldown > 0) return;
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

  function storyPointInReach(point) {
    return point?.active && distance(state.player, point) <= 1.3 && closeReach(state.player, point);
  }

  function useStoryPoint(point) {
    if (point.atExit) {
      point.setting = "supply";
      settleCombat();
    }
    showScene(point, () => {
      rememberStoryPoint(point);
      if (point.chapter === "commission") enterFloor(1, state.player.hp);
      else if (state.shelter) {
        point.setting ??= "read";
        point.active = false;
        saveVillage();
        enterPlayableScene();
      }
      else finishFloorRewards();
    });
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

  function questBoard() {
    const visit = visitDetails();
    const progress = run.quests.map((quest) => {
      const ready = village.questReady(quest);
      return { id: "quest-status-" + quest.id, title: quest.title,
        description: ready ? "완료 · 보상 받기" : quest.progress + " / " + quest.goal.count,
        disabled: !ready, choose: () => {
          if (!run.quests.includes(quest) || !village.questReady(quest)) return;
          run.quests = run.quests.filter((entry) => entry.id !== quest.id);
          visitDetails(quest.startedAt).claimed.push(quest.id);
          applyVillageEffects(quest.reward);
          saveVillage();
          questBoard();
        } };
    });
    const offers = village.questOffers(state.floor, run.floorSeeds[state.floor - 1]).map((quest) => {
      const claimed = visit.claimed.includes(quest.id);
      const accepted = run.quests.some((active) => active.id === quest.id);
      return { id: "quest-accept-" + quest.id, title: quest.title,
        description: quest.description,
        detail: claimed ? "보상 수령 완료" : accepted ? "수행 중" :
          "금화 +" + quest.reward.gold + " · 경험치 +" + quest.reward.xp,
        disabled: claimed || accepted || run.quests.length >= village.maxQuests, choose: () => {
          if (visit.claimed.includes(quest.id)) return;
          run.quests = village.acceptQuest(run.quests, quest, state.floor);
          saveVillage();
          questBoard();
        } };
    });
    villagePanel("의뢰 게시판", "수행 중 " + run.quests.length + " / " + village.maxQuests, [...progress, ...offers]);
  }

  function villageShop(page) {
    const gold = "보유 금화 " + run.gold;
    if (!page) {
      const options = [
        { id: "shop-buy", title: "잡화 구매", choose: () => villageShop("buy") },
        { id: "shop-sell", title: "전리품 판매", choose: () => villageShop("sell") },
      ];
      villagePanel("상점", gold, options);
      return;
    }
    const visit = visitDetails();
    const equipment = run.progress.gearIds;
    const options = page === "buy"
      ? village.shopStock(state.floor, run.floorSeeds[state.floor - 1]).map(({ id, item, price }) => {
        const sold = visit.purchases.includes(id);
        const gear = item.kind === "gear" ? rpg.rewardGear(item) : null;
        const detail = gear
          ? rpg.compareGear(run.progress, gear.id).changes
            .map(({ key, label, delta }) => label + " " + statValue(key, delta, true)).join(" · ")
          : describeSupply(item);
        return { id: "buy-" + id, title: item.title, description: sold ? "품절" : detail || "장착 능력치 동일",
          price: price + " 금화", disabled: sold || run.gold < price, choose: () => {
            if (visit.purchases.includes(id) || run.gold < price) return;
            spendGold(price);
            recordReward(item.kind, gear ?? item);
            visit.purchases.push(id);
            saveVillage();
            villageShop("buy");
          } };
      })
      : run.rewards.filter((entry) => entry.item && village.sellPrice(entry.item) > 0).map((entry) => {
        const price = village.sellPrice(entry.item);
        const equipped = entry.kind === "gear" && equipment.includes(entry.item.id);
        return { id: "sell-" + entry.uid, title: entry.item.title, price: "+" + price + " 금화",
          description: equipped ? "장착 중 · 판매하면 해제" : undefined, choose: () => {
          if (!run.rewards.includes(entry)) return;
          run.rewards = run.rewards.filter((reward) => reward !== entry);
          if (entry.kind === "gear") {
            const owned = new Set(run.rewards.filter((reward) => reward.kind === "gear").map((reward) => reward.item.id));
            updateProgress(rpg.removeGear(run.progress, owned));
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
    if (heal) state.player.hp = Math.min(state.player.maxHp, state.player.hp + heal);
    if (xp) awardXp(xp);
    run.nextWard += ward ?? 0;
    run.nextPower += overclock ?? 0;
  }

  function villageShrine() {
    const visit = visitDetails();
    const jobs = village.classOptions(state.floor, run.classId).map((job) => ({
      id: "class-" + job.id, title: job.title, description: job.description, detail: job.detail,
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
    villagePanel(state.floor === 10 ? "성당" : "신전", job ? "현재 직업 · " + job.title : "", jobs);
  }

  function useShelterStation(station) {
    if (!station || distance(state.player, station) > 1.32) {
      notify("표시된 시설에 다가가 상호작용하세요.", 1300);
      return;
    }
    if (station.kind === "board") return questBoard();
    if (station.kind === "shop") return villageShop();
    if (station.kind === "shrine") return villageShrine();
    if (station.kind === "campfire") {
      const visit = visitDetails();
      if (visit.campfire || state.player.hp >= state.player.maxHp) {
        notify(visit.campfire ? "이미 모닥불에서 쉬었습니다." : "체력이 가득 찼습니다.");
        return;
      }
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + state.player.maxHp / 3);
      visit.campfire = true;
      saveVillage();
      addEffect("loot", station, 0.6);
      notify("모닥불에서 최대 체력의 1/3만큼 회복했습니다.");
      return;
    }
    if (station.kind === "departure") {
      if (state.incident && !state.incident.complete) {
        notify(state.incident.task, 1800);
        return;
      }
      if (state.storyPoint?.active && !state.storyPoint.scene.optional) {
        notify(state.storyPoint.scene.prompt + " · 출발 전에 확인하세요.", 1600);
        return;
      }
      if (!adminRun && state.floor >= previewFloorLimit && run.previewComplete) {
        showPreviewComplete();
        return;
      }
      run.cleared = state.floor;
      run.totalClears++;
      chooseReward(0, "");
      return;
    }
    const visit = visitDetails();
    if (visit.service) {
      notify("이번 쉼터에서는 이미 정비를 마쳤습니다.");
      return;
    }
    if (station.kind === "rest") {
      if (state.player.hp >= state.player.maxHp) {
        notify("체력이 가득 찼습니다.");
        return;
      }
      state.player.hp = state.player.maxHp;
      notify("체력을 모두 회복했습니다.");
    } else {
      if (run.gold < 30) {
        notify("장비 개조에는 금화 30개가 필요합니다.");
        return;
      }
      spendGold(30);
      recordReward("upgrade", { title: "쉼터 무기 개조" });
      notify("무기 개조 · 공격력 +6");
      renderPack();
    }
    visit.service = station.kind;
    saveVillage();
    addEffect("loot", station, 0.6);
  }

  function interact() {
    if (state.mode !== "playing") return;
    const active = state.incident?.points.filter((entry) => incidentPointInReach(entry));
    if (active?.length) {
      active.sort((a, b) => distance(a, state.player) - distance(b, state.player));
      useIncidentPoint(active[0]);
      return;
    }
    const point = state.storyPoint;
    if (storyPointInReach(point)) {
      useStoryPoint(point);
      return;
    }
    if (state.shelter) {
      const station = state.stations.find((entry) => distance(state.player, entry) <= 1.32);
      useShelterStation(station);
      return;
    }
    if (state.landing || state.combatComplete) {
      if (state.incident && !state.incident.complete) notify(state.incident.task, 1500);
      else if (point?.active) notify(point.scene.prompt + " · " + storyControls, 1300);
      return;
    }
    if (!cellGoal && state.kind !== "escape") return;
    const nearby = state.items.find((item) => !item.collected && distance(state.player, item) <= 1.05 && closeReach(state.player, item));
    if (!nearby) {
      const object = stage.final ? "배분 회로나 공급 밸브" : cellGoal ? "전력 셀이나 출구" : "표시된 출구";
      notify(object + " 옆에서 상호작용하세요.", 1000);
      return;
    }
    if (nearby.kind === "cell") {
      nearby.collected = true;
      addEffect("pickup", nearby, 0.45);
      if (state.floor === 2 && gatheredCells() === 1) showRadio("relay-cell");
      if (!openExitIfReady()) {
        const recovered = stage.final ? "배분 회로 복구" : "전력 셀 확보";
        notify(gatheredCells() === cellGoal ? recovered + " 완료 · 남은 출구 경비를 격파하세요" : recovered);
      }
      return;
    }
    openExitIfReady();
    if (nearby.active) {
      if ((nearby.openProgress ?? 1) < 0.92) {
        notify("문이 열리고 있습니다.", 900);
        return;
      }
      if (point?.atExit) useStoryPoint(point);
      else finishFloor();
      return;
    }
    const blocked = {
      cells: stage.final ? "배분 회로를 모두 복구해야 합니다." : "전력 셀을 모두 확보하세요.",
      timer: "출구의 시간 잠금이 작동 중입니다.",
      guard: "출구를 지키는 경비를 먼저 쓰러뜨리세요.",
    };
    notify(blocked[exitBlocker()], 1400);
  }

  function damagePlayer(amount) {
    const player = state.player;
    if (player.invulnerable > 0 || player.hp <= 0) return false;
    const reduction = Math.min(0.70, run.stats.damageReduction + (state.routeEffects?.damageReductionBonus ?? 0));
    const damage = Math.max(1, Math.round(amount * (1 - reduction)));
    const blocked = Math.min(state.ward, damage);
    state.ward -= blocked;
    player.hp = Math.max(0, player.hp - (damage - blocked));
    if (state.kind === "combat" && state.hitCount === 0) notify("무피격 보너스 종료", 1000);
    state.hitCount++;
    player.invulnerable = 0.56;
    state.cameraShake = Math.max(state.cameraShake, 0.19);
    addEffect("hit", player, 0.35);
    return true;
  }

  function choosePursuit(enemy, aim, radius) {
    const detour = enemy.blockedFor > 0.45 && pursuitWaypoint(enemy);
    if (detour) aim = direction(detour.x - enemy.x, detour.y - enemy.y) || aim;
    if (openStep(enemy, enemy.x + aim.x * 0.37, enemy.y + aim.y * 0.37, radius)) {
      enemy.steering = 0;
      return aim;
    }
    const angle = Math.atan2(aim.y, aim.x);
    const bias = enemy.steering || (enemy.id % 2 ? 1 : -1);
    for (const rotation of [bias * 0.70, bias * 1.40, bias * 2.10, -bias * 0.70, -bias * 1.40, -bias * 2.10]) {
      const x = Math.cos(angle + rotation);
      const y = Math.sin(angle + rotation);
      if (!openStep(enemy, enemy.x + x * 0.37, enemy.y + y * 0.37, radius)) continue;
      enemy.steering = Math.sign(rotation);
      return { x, y };
    }
    return aim;
  }

  function pursuitWaypoint(enemy) {
    const unit = 0.8;
    if (!state.navigation) {
      const columns = Math.floor(state.map.width / unit);
      const rows = Math.floor(state.map.height / unit);
      const points = Array.from({ length: columns * rows }, (_, index) => ({
        x: (index % columns + 0.5) * unit,
        y: (Math.floor(index / columns) + 0.5) * unit,
      }));
      const open = points.map(({ x, y }) => walkable(x, y, 0.55));
      const links = points.map((point, index) => {
        if (!open[index]) return [];
        const column = index % columns;
        const candidates = [index - columns, index + columns];
        if (column > 0) candidates.push(index - 1);
        if (column < columns - 1) candidates.push(index + 1);
        return candidates.filter((neighbor) => {
          if (!open[neighbor]) return false;
          const { x, y } = points[neighbor];
          return walkable((point.x + x) / 2, (point.y + y) / 2, 0.55) &&
            content.canTraverse(state.elevation, point.x, point.y, x, y);
        });
      });
      state.navigation = { columns, points, open, links };
    }
    const navigation = state.navigation;
    const { points, open, columns } = navigation;
    const closest = (actor) => {
      let best = -1;
      let gap = 1.5;
      for (let y = Math.floor(actor.y / unit) - 1; y <= Math.floor(actor.y / unit) + 1; y++) {
        for (let x = Math.floor(actor.x / unit) - 1; x <= Math.floor(actor.x / unit) + 1; x++) {
          const index = y * columns + x;
          if (x < 0 || x >= columns || !open[index]) continue;
          const point = points[index];
          const offset = distance(actor, point);
          if (offset >= gap || !openStep(actor, point.x, point.y, playerRadius)) continue;
          best = index;
          gap = offset;
        }
      }
      return best;
    };
    const goal = closest(state.player);
    const origin = closest(enemy);
    if (goal < 0 || origin < 0 || goal === origin) return null;
    if (goal !== navigation.goal) {
      const next = new Int16Array(points.length).fill(-1);
      const queue = [goal];
      next[goal] = goal;
      for (let index = 0; index < queue.length; index++) {
        const node = queue[index];
        for (const neighbor of navigation.links[node]) {
          if (next[neighbor] >= 0) continue;
          next[neighbor] = node;
          queue.push(neighbor);
        }
      }
      navigation.goal = goal;
      navigation.next = next;
    }
    return points[navigation.next[origin]];
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
      damagePlayer(enemy.damage);
    }
  }

  function mortarSalvo(enemy, player) {
    const mark = (x, y, remaining) => ({
      x: Math.max(0.6, Math.min(state.map.width - 0.6, x)),
      y: Math.max(0.6, Math.min(state.map.height - 0.6, y)),
      radius: 1.32, remaining, active: false, damage: enemy.damage,
    });
    state.mortarTargets.push(mark(player.x, player.y, enemy.windup));
    if (state.floor >= 8) {
      const aim = inputDirection() || direction(player.x - enemy.x, player.y - enemy.y) || { x: 1, y: 0 };
      state.mortarTargets.push(mark(player.x + aim.x * 2.6, player.y + aim.y * 2.6, enemy.windup + 0.28));
    }
  }

  function updateMortars(delta) {
    for (const marker of state.mortarTargets) {
      marker.remaining -= delta;
      if (marker.remaining > 0 || marker.active) continue;
      marker.active = true;
      state.cameraShake = Math.max(state.cameraShake, 0.15);
      if (distance(marker, state.player) <= marker.radius + playerRadius * 0.4 && withinTier(marker, state.player)) damagePlayer(marker.damage);
    }
    state.mortarTargets = state.mortarTargets.filter((marker) => marker.remaining > -0.30);
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
        damagePlayer(bolt.damage);
      }
    }
    state.projectiles = state.projectiles.filter((bolt) => bolt.life > 0);
  }

  function updateEnemy(enemy, allies, delta) {
    const player = state.player;
    const type = enemyTypes[enemy.kind];
    const ranged = enemy.kind === "sentry";
    const runner = enemy.kind === "runner";
    const mortar = enemy.kind === "mortar";
    const lancer = enemy.kind === "lancer";
    const boss = enemy.kind === "boss";
    const creature = enemy.faction === "creature";
    const enraged = boss && enemy.hp <= enemy.maxHp / 2;
    const pressured = state.alarm || (state.hazard === "pressure" && state.elapsed >= 20);
    enemy.flash = Math.max(0, enemy.flash - delta);
    enemy.recover = Math.max(0, (enemy.recover ?? 0) - delta);
    enemy.moving = false;
    enemy.cooldown = Math.max(0, enemy.cooldown - delta);
    enemy.attackRange = type.range + (enraged ? 0.22 : 0);
    enemy.guarded = enemy.kind === "warden" && enemy.windup <= 0 && enemy.recover <= 0;

    if (enemy.chargeTime > 0) {
      advanceLancer(enemy, delta);
      return;
    }

    if (enemy.windup > 0) {
      enemy.windup = Math.max(0, enemy.windup - delta);
      if (enemy.windup === 0) {
        enemy.recover = boss || mortar || enemy.kind === "warden" ? 0.40 : 0.28;
        if (ranged) {
          const target = { x: enemy.aimX, y: enemy.aimY };
          fireBolt(enemy, enemy.damage, direction(target.x - enemy.x, target.y - enemy.y), target);
          addEffect("charge", enemy, 0.23);
          return;
        }
        if (mortar) return;
        if (lancer) {
          enemy.chargeTime = Math.min(0.46, distance(enemy, { x: enemy.aimX, y: enemy.aimY }) / 10);
          enemy.chargeHit = false;
          addEffect("charge", enemy, 0.30);
          return;
        }
        addEffect("danger", enemy, boss ? 0.40 : 0.24);
        if (distance(enemy, player) <= enemy.attackRange && closeReach(enemy, player) && hasLineOfSight(enemy, player)) {
          damagePlayer(enemy.damage + (enraged ? 4 : 0));
        }
      }
      return;
    }

    const gap = distance(enemy, player);
    const aim = direction(player.x - enemy.x, player.y - enemy.y);
    const sight = ranged ? (gap < type.range * 1.10 && hasLineOfSight(enemy, player, true))
      : lancer ? (gap < type.range * 1.10 && hasLineOfSight(enemy, player) && closeReach(enemy, player))
      : mortar || closeReach(enemy, player);
    const detection = (cellGoal ? 5.8 : state.holdZone ? 13 : 10.5) + (creature ? 1.65 : 0);
    const heardCombat = !cellGoal && gap < detection + 3 && allies.some((ally) => ally !== enemy
      && (ally.windup > 0 || ally.flash > 0) && distance(ally, enemy) < 5.2);
    if (gap < detection || enemy.hp < enemy.maxHp || boss || heardCombat || (state.holdZone && state.wave > 1)) {
      enemy.engaged = true;
    }
    setFacing(enemy, aim);
    if (sight && gap <= enemy.attackRange * 0.94 && enemy.cooldown <= 0
        && (ranged || mortar || lancer || hasLineOfSight(enemy, player))) {
      const windup = type.windup * (enraged ? 0.86 : 1);
      const nearbyWindup = !ranged && !mortar && !lancer && !boss && allies.some((ally) => ally !== enemy
        && Math.abs(ally.windup - windup) < 0.14 && distance(ally, player) < 2.4);
      if (nearbyWindup) return;
      enemy.windup = windup;
      enemy.cooldown = windup + Math.max(0.38, type.cooldown * (pressured ? 0.77 : 1)
        * (creature ? 0.88 : 1) * (enraged ? 0.83 : 1));
      enemy.guarded = false;
      if (ranged) {
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
    const pursue = !sight || gap > (ranged || mortar ? type.range * 0.86 : Math.min(enemy.attackRange * 0.76, 1.42));
    const retreat = (ranged || mortar) && sight && gap < (ranged ? 3.2 : 2.75);
    if (aim && enemy.engaged && (pursue || retreat)) {
      const speed = type.speed + (creature ? (runner ? 0.33 : 0.24) : 0);
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
      const along = openStep(enemy, enemy.x + x * 0.54, enemy.y + y * 0.54, type.radius);
      if (!retreat) enemy.blockedFor = along ? Math.max(0, (enemy.blockedFor ?? 0) - delta * 0.6) : (enemy.blockedFor ?? 0) + delta;
      const steering = retreat ? direction(x, y) || aim : choosePursuit(enemy, direction(x, y) || aim, type.radius);
      enemy.moving = move(enemy, steering.x * step, steering.y * step, type.radius);
    }
  }

  function updateCombatWave(remaining) {
    if (state.wave > 1 || !stage.wave.length) return;
    const deep = state.floor >= content.frontierFloor;
    const trigger = state.floor === 1 ? 1 : deep ? 3 : 2;
    const combat = state.kind === "combat" && remaining <= trigger;
    const holding = state.holdZone && state.holdZone.progress >= (deep ? 0.25 : 0.32);
    if (!state.waveArrival) {
      if (!combat && !holding) return;
      const warning = deep ? 1.0 : 1.18;
      state.waveArrival = state.elapsed + warning;
      notify(holding ? "방어 구역으로 증원이 접근합니다." : deep ? "다른 무리가 합류합니다." : "경비 증원이 다가옵니다.", 1600);
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

  function updateBossShock(boss, delta) {
    if (!boss || boss.hp <= 0 || boss.hp > boss.maxHp / 2) return;
    const player = state.player;
    const deep = state.floor >= content.frontierFloor;
    if (!state.bossPhaseTwo) {
      state.bossPhaseTwo = true;
      boss.shielded = true;
      state.bossShockCooldown = 0.15;
      notify(stage.final ? "별무리가 모입니다 · 빛이 닿기 전에 표식 밖으로 피하세요." :
        "수호자 폭주 · 바닥 표식 밖으로 피하세요.");
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
        if (target.overdrive) state.overdriveReleased = true;
        if (!state.bossOverdrive || state.overdriveReleased) boss.shielded = false;
        state.shockBursts++;
        state.cameraShake = Math.max(state.cameraShake, 0.19);
        const damage = Math.min(Math.round(player.maxHp * 0.32), Math.round(boss.damage * (deep ? 0.77 : 0.70)));
        if (distance(target, player) <= target.radius && withinTier(target, player) && damagePlayer(damage)) state.shockHits++;
        if (target.volley) {
          const count = deep ? 12 : 8;
          for (let index = 0; index < count; index++) {
            const angle = 2 * Math.PI * index / count + target.angle;
            fireBolt(boss, Math.round(boss.damage * 0.56), { x: Math.cos(angle), y: Math.sin(angle) });
          }
          addEffect("charge", boss, 0.38);
        }
      }
      state.bossTargets = state.bossTargets.filter((target) => target.remaining > -0.32);
      if (!state.bossTargets.length) {
        state.bossShockCooldown = deep ? 0.95 : 1.22;
        if (state.bossOverdrive) state.bossShockCooldown = state.overdriveReleased ? (deep ? 0.56 : 0.72) : 0.15;
      }
      return;
    }
    state.bossShockCooldown -= delta;
    if (state.bossShockCooldown > 0) return;
    const aim = inputDirection() || direction(player.x - boss.x, player.y - boss.y) || { x: 1, y: 0 };
    const targetAt = (x, y, radius, remaining) => ({
      x: Math.max(0.6, Math.min(state.map.width - 0.6, x)),
      y: Math.max(0.6, Math.min(state.map.height - 0.6, y)),
      radius, remaining, active: false, overdrive: state.bossOverdrive,
    });
    if (stage.final) {
      const rotation = state.shockBursts * 0.19;
      const count = state.bossOverdrive ? 6 : 4;
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
    const gate = state.exit ?? state.gateMarker;
    if (gate?.active && gate.openProgress < 1) {
      gate.openProgress = Math.min(1, (state.elapsed - gate.openSince) / gateSeconds);
      if (gate.openProgress >= 0.92 && state.storyPoint?.atExit) state.storyPoint.active = true;
    }
    state.revealTimer = Math.max(0, state.revealTimer - delta);
    run.seconds += delta;
    for (const timer of ["attackCooldown", "attackFlash", "swingLife", "dashCooldown", "dashFlash", "invulnerable"]) {
      player[timer] = Math.max(0, player[timer] - delta);
    }
    const walking = inputDirection();
    player.moving = false;
    if (player.dashRemaining > 0) {
      const step = Math.min(delta, player.dashRemaining) * 12.3;
      player.moving = move(player, player.dashX * step, player.dashY * step, playerRadius);
      player.dashRemaining = Math.max(0, player.dashRemaining - delta);
    } else {
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
    if (state.landing || state.combatComplete) {
      updateIncident(delta);
      if (state.finishAt != null && state.elapsed >= state.finishAt) finishFloorRewards();
      return;
    }

    advanceStrike();
    if (attackPointer !== null || keys.has("Space") || [...touchPointers.values()].includes("attack")) attack();

    updateAlarm();
    if (state.holdZone) {
      const zone = state.holdZone;
      zone.active = distance(zone, player) <= zone.radius && closeReach(zone, player);
      if (zone.active) zone.progress = Math.min(1, zone.progress + delta / zone.duration);
    }
    openExitIfReady();
    updateCombatWave(livingEnemies().length);
    const alive = livingEnemies();
    const boss = state.enemies.find((enemy) => enemy.kind === "boss");
    const combatCleared = state.kind === "combat" && !alive.length && (state.wave > 1 || !stage.wave.length);
    const targetCleared = state.kind === "hunt" && !alive.some((enemy) => enemy.marked);
    if (combatCleared || targetCleared || state.holdZone?.progress >= 1 || (boss && boss.hp === 0)) {
      finishFloor();
      return;
    }

    for (const enemy of alive) updateEnemy(enemy, alive, delta);
    updateBolts(delta);
    updateMortars(delta);
    updateBossShock(boss, delta);
    updateSparks();
    updateTerrain();
    if (state.hazard === "pressure" && state.elapsed >= 20 && state.elapsed - delta < 20) {
      notify("경보 작동 · 적의 이동과 공격 속도가 빨라집니다.");
    }
    if (player.hp === 0) endRun(false);
  }

  function settleCombat() {
    state.combatComplete = true;
    state.projectiles = [];
    state.mortarTargets = [];
    state.bossTargets = [];
    state.hazardTiles = [];
    for (const surface of state.terrain) surface.status = "idle";
  }

  function finishFloor() {
    if (state.mode !== "playing") return;
    if (stage.final && state.kind === "boss") {
      settleCombat();
      syncMusic();
      const anchor = { x: state.player.x, y: state.player.y, scene: story.epilogue(run.storyChoices),
        celestial: true, active: false };
      state.storyPoint = anchor;
      showScene(anchor, finishFloorRewards);
      return;
    }
    if (state.storyPoint || state.gateMarker) {
      settleCombat();
      notify(null);
      syncMusic();
      if (state.storyPoint) {
        const marker = state.storyPoint;
        marker.active = true;
        if (!activateStoryPoint(marker) && marker.scene.optional) state.finishAt = state.elapsed + 2.4;
      } else {
        state.gateMarker.active = true;
        state.gateMarker.openSince = state.elapsed;
        state.gateMarker.openProgress = reducedMotion ? 1 : 0;
        state.finishAt = state.elapsed + (reducedMotion ? 0.25 : gateSeconds + 0.50);
      }
      return;
    }
    finishFloorRewards();
  }

  function finishFloorRewards() {
    run.cleared = state.floor;
    run.totalClears++;
    trackQuests({ type: "clear", trial: state.kind });
    let trial = "";
    if (state.kind === "combat" && state.hitCount === 0) trial = "무피격 통과";
    if (state.timeLimit && !state.alarm) trial = "경보 전 탈출";
    if (state.kind === "boss" && state.shockBursts > 0 && state.shockHits === 0) trial = "충격파 회피";
    if (trial) run.trials.push(trial);
    creditGold(stage.gold + run.stats.goldOnClear + (state.routeEffects?.clearGoldBonus ?? 0) + (trial ? challengeGold : 0));
    renderFloorSteps();
    const baseXp = state.kind === "boss" ? 58 : state.kind === "combat" ? 20 : 50;
    const xp = baseXp + Math.max(0, state.floor - 3) * 3 + (state.routeEffects?.clearXpBonus ?? 0);
    const earnedXp = Math.round(xp * (1 + run.stats.xpBonus));
    const gains = awardXp(xp);
    const recovery = state.routeEffects?.clearHeal ?? 0;
    if (recovery) state.player.hp = Math.min(state.player.maxHp, state.player.hp + recovery);
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
    let changes = [];
    let equipped = "";
    let detail = item.description;
    if (item.kind === "gear") {
      const gear = rpg.rewardGear(item);
      const comparison = rpg.compareGear(run.progress, gear.id);
      changes = comparison.changes;
      equipped = comparison.replaced?.title || "빈 슬롯";
    } else if (item.kind === "stat") {
      changes = rpg.compareStats(run.progress, rpg.gainStat(run.progress, item.stat, item.amount));
    } else {
      detail = describeSupply(item) + " · 정비 중 가방에서 사용";
    }
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
        const gear = rpg.rewardGear(item);
        recordReward("gear", gear);
        updateProgress(rpg.equip(run.progress, gear.id));
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
    const candidates = rpg.rewardChoices(rewards.createPool(state.floor), run.random);
    state.mode = "gear";
    const options = candidates.map((item) => {
      const slot = rpg.slots.find((entry) => entry.id === item.slot);
      return {
        id: item.id,
        title: item.title,
        detail: slot?.title ?? (item.kind === "stat" ? "성장" : "공급품"),
        icon: slot?.icon ?? (item.kind === "stat" ? "✧" : "▦"),
        rarity: item.rarity,
        rpgChoice: true,
        choose: () => showRewardComparison(item),
      };
    });
    const reward = trial ? " · " + trial + " 금화 +" + challengeGold : "";
    const storyResult = state.floor <= previewFloorLimit && state.incident?.complete ? state.incident.task + "\n" : "";
    panel({
      kicker: state.floor + "층 통과",
      title: "보상 선택",
      copy: storyResult + (xp ? "목표 달성 +" + xp + " XP" + reward + " · " : "") +
        "보유 금화 " + run.gold + (gains.length ? "\n레벨 상승 · " + gains.join(" · ") : ""),
      options,
      primary: "보상 받기",
    });
    showRewardComparison(candidates[0]);
  }

  function chooseRoute() {
    run.selectedReward = undefined;
    if (!adminRun && state.floor >= previewFloorLimit) {
      showPreviewComplete();
      return;
    }
    if (state.floor === content.floorCount) {
      endRun(true);
      return;
    }
    const nextFloor = state.floor + 1;
    if (content.isShelterFloor(nextFloor)) {
      enterFloor(nextFloor, state.player.hp);
      return;
    }
    const player = state.player;
    const floorSeed = run.floorSeeds[state.floor - 1] ?? 0;
    const routeSeed = floorSeed ^ Math.imul(state.floor, 0x9e3779b1) ^ 0x726f7574;
    const routes = content.routeOptions(state.floor, randomFrom(routeSeed), {
      hp: player.hp, maxHp: player.maxHp, gold: run.gold, previous: run.lastRouteOffers,
    });
    const offered = routes.map(({ id }) => id);
    state.mode = "branch";
    panel({
      kicker: state.floor + "층 통과 · 갈림길",
      title: "갈림길 선택",
      copy: "체력 " + Math.ceil(player.hp) + " / " + player.maxHp + " · 금화 " + run.gold,
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
          enterFloor(nextFloor, Math.min(player.maxHp, player.hp + heal), route.id);
        },
      })),
    });
  }

  function showPreviewComplete() {
    state.mode = "victory";
    run.previewComplete = true;
    saveCheckpoint(state.floor, state.player.hp);
    panel({ kicker: "체험판 · " + previewFloorLimit + "층", title: "첫 구간 등반 완료",
      copy: (run.scenesSeen.includes("lower-gate-warning") ? "하층으로 돌아가는 문이 잠겼습니다. 명령은 29층에서 내려왔습니다.\n" : "") +
        "진행 기록을 저장했습니다. 시작 화면에서 이어하면 마지막 쉼터로 돌아갑니다.",
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
    const owned = new Set(run.rewards.filter((entry) => entry.kind === "gear").map((entry) => entry.item.id));
    const statsLost = [...Object.values(run.progress.earned), ...Object.values(run.progress.earnedAttributes ?? {})]
      .some((value) => value !== 0);
    updateProgress(rpg.retainEarnedStats(rpg.removeGear(run.progress, owned)));
    return { recentItems, recentGold, oldItemsLost: olderItems.length - retainedItems, oldGoldLost, statsLost };
  }

  function endRun(victory) {
    state.mode = victory ? "victory" : "defeat";
    const seconds = Math.floor(run.seconds);
    const time = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    const progress = run.cleared + "층 통과 · Lv. " + run.progress.level + " · " + time + " · 금화 " + run.gold;
    const trials = run.trials.length ? " · 추가 목표 " + run.trials.length + "개 달성" : "";
    if (victory) {
      if (!adminRun) {
        try { localStorage.removeItem(checkpointKey); } catch {}
      }
      panel({ kicker: "이야기 완료", title: story.epilogue(run.storyChoices).title, copy: progress + trials,
        primary: "시작 화면으로", activate: () => setupTitle() });
      return;
    }
    const loss = loseRewards();
    const pending = { cleared: run.cleared, nextWard: run.nextWard, nextPower: run.nextPower,
      quests: run.quests, villageVisits: run.villageVisits };
    run.cleared = 0;
    run.nextWard = 0;
    run.nextPower = 0;
    run.quests = [];
    run.villageVisits = {};
    saveCheckpoint(1, run.stats.maxHp);
    Object.assign(run, pending);
    renderGear();
    const report = [
      "최근 5층 손실 · 보유품 " + loss.recentItems + "개 / 금화 " + loss.recentGold,
      "이전 층 손실 · 보유품 " + loss.oldItemsLost + "개 / 금화 " + loss.oldGoldLost,
      loss.statsLost ? "획득 성장치 60% 손실 · 기본 배분 유지" : "기본 배분 유지",
      "남은 보유품 " + run.rewards.filter((entry) => entry.kind !== "gold").length + "개 · 금화 " + run.gold,
    ];
    panel({ kicker: "등반 종료", title: state.floor + "층에서 쓰러졌습니다", copy: report.join("\n"),
      primary: "남은 것을 들고 1층부터", activate: () => newRun(run, adminRun ? 1 : undefined) });
  }

  function frame(now) {
    const gap = Math.max(0, now - previousTime);
    const delta = Math.min(1 / 30, gap / 1000);
    previousTime = now;
    const paused = document.hidden || window.TowerAdmin?.isOpen();
    if (state.mode === "rolling" && !paused) advanceEntry(gap);
    state.cameraShake = Math.max(0, state.cameraShake - Math.max(0, delta));
    if (state.mode === "playing" && delta > 0 && !paused) {
      updateGame(delta);
    }
    if (now >= notificationUntil && !elements.notification.hidden) elements.notification.hidden = true;
    if (now >= radioUntil && !elements["story-radio"].hidden) hideRadio();
    syncHUD();
    drawMinimap();
    if (state.mode === "title") titleRenderer.draw(canvas, now, reducedMotion);
    else renderer.draw(canvas, state, now);
    requestAnimationFrame(frame);
  }

  elements["primary-action"].addEventListener("click", () => action?.());
  elements["scene-skip"].addEventListener("click", () => skipScene?.());
  elements["audio-toggle"].addEventListener("click", () => {
    audio.setEnabled(!audio.active()).then(refreshAudioUI);
  });
  elements["back-to-title"].addEventListener("click", () => {
    if (state.mode === "menu") setupTitle(true);
  });
  elements["skip-gear"].addEventListener("click", () => {
    if (state.mode === "gear") chooseRoute();
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
    if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey || !gameKeys.has(event.code)) return;
    if (event.code === "Space") {
      const button = event.target instanceof HTMLButtonElement ? event.target : null;
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
    if (event.code === "Space" && event.repeat) return;
    keys.add(event.code);
    if (event.repeat) return;
    if (event.code === "Space") attack();
    if (event.code.startsWith("Shift")) dash();
    if (event.code === "KeyE") interact();
  });
  window.addEventListener("keyup", (event) => keys.delete(event.code));
  window.addEventListener("blur", clearInput);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInput();
    audio.setVisible(!document.hidden);
    refreshAudioUI();
  });

  canvas.addEventListener("pointerdown", (event) => {
    if (state.mode !== "playing" || event.button !== 0) return;
    event.preventDefault();
    canvas.focus({ preventScroll: true });
    const aim = renderer.screenToWorld(canvas, event.clientX, event.clientY, state);
    const targets = state.incident?.points.filter((entry) => entry.active);
    const target = targets?.find((entry) => renderer.storyDeviceHit(canvas, event.clientX, event.clientY, state, entry))
      ?? targets?.find((entry) => distance(aim, entry) < 1.1);
    if (target) {
      if (incidentPointInReach(target)) useIncidentPoint(target);
      else notify(target.label + " · " + storyControls, 1300);
      return;
    }
    const point = state.storyPoint;
    if (point?.active && (distance(aim, point) < 1.55 ||
        renderer.storyDeviceHit(canvas, event.clientX, event.clientY, state))) {
      if (storyPointInReach(point)) useStoryPoint(point);
      else notify((point.prompt ?? point.scene.prompt) + " · " + storyControls, 1300);
      return;
    }
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
  });
  elements["touch-controls"].addEventListener("lostpointercapture", releasePointer);
  elements["touch-controls"].addEventListener("click", (event) => {
    if (event.detail !== 0) return;
    const actionName = event.target.closest("button")?.dataset.action;
    if (actionName === "attack") attack();
    if (actionName === "dash") dash();
    if (actionName === "interact") interact();
  });

  const previewStats = rpg.getStats(rpg.createProgress());
  window.TowerAdmin?.setup({ maxFloor: content.floorCount, move(floor) {
    if (!Number.isInteger(floor) || floor < 1 || floor > content.floorCount) return;
    if (adminRun && run) enterFloor(floor, run.stats.maxHp);
    else newRun(undefined, floor);
  } });
  setupTitle();
  requestAnimationFrame(frame);
})();
