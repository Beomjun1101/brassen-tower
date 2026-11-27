(() => {
  "use strict";

  const floorCount = 1332;
  const mapPlanningLimit = 20;
  const shelterInterval = 5;
  const frontierFloor = 35;
  const floorKinds = ["combat", "relay", "boss", "hold", "hunt", "escape"];
  const entranceTrials = [["combat"], ["relay"], ["hold"], ["hunt", "escape"]];
  const openingStages = {
    3: { hold: { title: "가압 밸브실", theme: "forge", objective: "상단 가압 밸브 옆에 머물며 압력을 안정화하세요." } },
    4: {
      hunt: { title: "측선 감시초소", theme: "relay", objective: "표식이 붙은 격리대 지휘관을 쓰러뜨리세요. 나머지 경비는 우회할 수 있습니다." },
      escape: { title: "격리문 비상통로", theme: "sluice", objective: "잠금이 풀릴 때까지 버틴 뒤 상단 출구의 경비를 제압하고 탈출하세요." },
    },
  };
  const storyRoutes = {
    1: { chapter: "commission", branches: {
      open: { kind: "combat", theme: "sluice", feature: "intake", title: "주민들이 열어 준 수문",
        objective: "건널목을 확보하고 수문 경비대와 증원대를 모두 밀어내세요.",
        cue: ["주민", "건널목을 열었어요. 수문 앞은 경비대가 몰려옵니다."] },
      quiet: { kind: "hunt", theme: "forge", feature: "pumps", title: "정비조 우회 갱도",
        objective: "정비 통로로 침투해 표식이 붙은 수문 책임자를 쓰러뜨리세요.",
        targetName: "수문 책임자", cue: ["정비조", "우회 갱도가 비었어요. 수문 열쇠는 책임자가 갖고 있습니다."] },
    } },
    6: { chapter: "reservoir", branches: {
      district: { kind: "hold", theme: "sluice", feature: "pumps", title: "꺼진 관문 전열로",
        objective: "젖은 건널목을 지나 상단의 수동 해제 구역을 사수하세요.",
        cue: ["라온", "진료소로 온수가 갑니다. 위 관문은 수동으로 열어야 해요."] },
      reserve: { kind: "relay", theme: "relay", feature: "transformers", title: "가열된 관문 배전실",
        objective: "건조해진 배전 통로에서 전력 셀 3개를 찾아 출구를 여세요. 경비가 출구를 지킵니다.",
        cue: ["정비조", "열선이 통로를 말렸어요. 배전 회로를 세 군데서 연결하세요."] },
    } },
    16: { chapter: "inspection", branches: {
      escort: { kind: "hold", theme: "forge", feature: "valve-bank", title: "환자 대피 계단",
        objective: "환자들이 계단을 건널 동안 상단 대피 구역을 지키세요.",
        cue: ["진료소", "환자들을 계단으로 옮겨요. 출구 쪽을 잠시 지켜 주세요."] },
      evidence: { kind: "hunt", theme: "relay", feature: "relay-rack", title: "압수품 이송 통로",
        objective: "표식이 붙은 운반책을 쓰러뜨려 압수된 기록을 확보하세요.",
        targetName: "압수 기록 운반책", cue: ["라온", "압수 기록이 이동 중이에요. 표식이 붙은 경비가 운반책입니다."] },
    } },
    666: { chapter: "relay", branches: {
      rescue: { kind: "escape", theme: "sluice", feature: "intake", title: "구조 신호 우회 수로",
        objective: "구조 회선이 고정될 때까지 버티고, 출구 경비를 쓰러뜨려 수로에서 빠져나가세요.",
        cue: ["구조대", "우회 연결 잡았습니다. 신호가 고정되면 수로 끝으로 빠져요."] },
      archive: { kind: "relay", theme: "relay", dry: true, feature: "relay-rack", title: "기록 보존 전원실",
        objective: "전력 셀 3개를 회수해 보존 기록의 전원을 유지하고 출구 경비를 제압하세요.",
        cue: ["라온", "기록을 읽으려면 전원이 필요해요. 전력 셀 세 개를 회수하세요."] },
    } },
  };
  const geometryForTrial = [0, 1, 2, 0, 2, 1];
  const width = 34;
  const height = 26;
  const regions = [
    { id: "lower-drainage", name: "미개척 수계", through: 209, trials: ["combat", "relay", "hold"], theme: "sluice", dividerTheme: "relay" },
    { id: "pressure", name: "압력 조절 구역", through: 419, trials: ["combat", "hold", "hunt"], theme: "forge", dividerTheme: "forge" },
    { id: "service", name: "중층 정비 설비", through: 664, trials: ["relay", "hold", "hunt", "escape"], theme: "forge", dividerTheme: "relay" },
    { id: "transmission", name: "중계·송수 구역", through: 1008, trials: ["relay", "hold", "escape"], theme: "sluice", dividerTheme: "relay" },
    { id: "furnace", name: "상층 연소 구역", through: 1179, trials: ["combat", "hunt", "escape"], theme: "forge", dividerTheme: "forge" },
    { id: "distribution", name: "중앙 배분 구역", through: floorCount, trials: ["relay", "hold", "hunt", "escape"], theme: "forge", dividerTheme: "relay" },
  ];
  const regionalArchitecture = {
    "lower-drainage": { title: "수로 교대", room: [0, 0], machine: [0, 0] },
    pressure: { title: "깊은 압력 격실", room: [0, 3], machine: [0.02, -0.06] },
    service: { title: "옆으로 긴 정비 선로", room: [4, 0], machine: [-0.08, 0] },
    transmission: { title: "평행 송수 회랑", room: [3, 1], machine: [0.04, 0.08] },
    furnace: { title: "넓은 내화 공정장", room: [2, 3], machine: [0.07, 0.02] },
    distribution: { title: "중앙 분기 작업장", room: [3, 2], machine: [-0.03, -0.04] },
  };
  // A destination couples its trial with a working space, independently of the layout roll.
  const destinations = {
    "lower-drainage": {
      combat: ["sluice", "침전 수로", ["intake", "pumps"], "침전조가 넘쳤어. 건널목 쪽으로 돌아가야겠네."],
      relay: ["relay", "수문 배전망", ["transformers", "relay-rack"], "벽의 전압계가 하나씩 꺼져. 전력이 아직 남은 곳부터 찾아보자."],
      hold: ["forge", "온수 가압실", ["condenser", "boilers"], "아래 관은 식었는데 이쪽 몸통은 아직 뜨거워."],
    },
    pressure: {
      combat: ["forge", "열압 조절실", ["condenser", "boilers"], "압력 바늘이 올라갈 때마다 격벽이 울려."],
      hold: ["relay", "압력 계측실", ["valve-bank", "manifold"], "이 계기들은 아래쪽 관의 수치까지 같이 받아 적고 있어."],
      hunt: ["sluice", "응축수 회수장", ["intake", "scrubber"], "응축수가 빠지는 홈에 젖은 자국이 이어져."],
    },
    service: {
      relay: ["relay", "비상 점검망", ["transformers", "relay-rack"], "점검등이 아직 순서대로 들어와. 회로가 끊긴 쪽은 불만 비어 있어."],
      hold: ["forge", "관로 열처리장", ["condenser", "boilers"], "관 이음쇠의 안쪽만 밝아. 아직 열이 돌고 있어."],
      hunt: ["sluice", "배관 정비독", ["drydock", "pumps"], "물이 빠질 때마다 바닥에 긁힌 자국이 드러나."],
      escape: ["relay", "차단벽 점검로", ["valve-bank", "manifold"], "차단문이 열린 것 같다가 다시 한 칸 내려와."],
    },
    transmission: {
      relay: ["relay", "송수 교환대", ["transformers", "relay-rack"], "물 내려가는 소리 사이로 중계선이 툭툭 끊겨."],
      hold: ["sluice", "중계 취수장", ["intake", "pumps"], "여기 모인 물이 다시 위쪽 관으로 올라가고 있어."],
      escape: ["forge", "중계 냉각실", ["condenser", "scrubber"], "정비문이 닫힐 때마다 통로에 뜨거운 바람이 돌아."],
    },
    furnace: {
      combat: ["forge", "용해 주조로", ["smelter", "crucible"], "주형에 새로 고인 쇳물이 있어. 누가 불을 계속 살리고 있지?"],
      hunt: ["relay", "용해 제어실", ["transformers", "relay-rack"], "감시선 하나가 가동 중이야. 지나가는 그림자를 따라 깜박여."],
      escape: ["sluice", "급랭 회수조", ["condenser", "pumps"], "뜨거운 금속 냄새가 찬 물에 닿을 때마다 올라와."],
    },
    distribution: {
      relay: ["relay", "배분 교환실", ["transformers", "relay-rack"], "선로가 갈라질 때마다 다른 층의 계측 번호가 잠깐 떠."],
      hold: ["forge", "열 차단 설비", ["valve-bank", "manifold"], "밸브가 움직이면 벽 뒤에서 낮은 소리가 길게 이어져."],
      hunt: ["sluice", "분기 수로", ["intake", "pumps"], "서쪽에서 밀려온 물살이 여기서 둘로 갈라져."],
      escape: ["relay", "격벽 배기통로", ["condenser", "scrubber"], "배기구가 한 번 열리고 나면 바로 다음 격벽이 내려와."],
    },
  };
  const openingCues = {
    hunt: "저쪽 감시등에 지휘관이 보여. 다른 경비는 따돌릴 수 있어.",
    escape: "격리문 위 표시등이 움직여. 잠금이 풀리는 순서가 있나 봐.",
  };
  const sites = {
    5: { name: "저수조", theme: "sluice" },
    9: { name: "주철 관문", theme: "sluice" },
    29: { name: "복귀 회선", theme: "relay" },
    35: { name: "개척선 경계", theme: "sluice" },
    329: { name: "압력 기록실", theme: "forge" },
    489: { name: "야간 점검실", theme: "forge" },
    665: { name: "전송실", theme: "relay" },
    829: { name: "난방 중계기", theme: "relay" },
    1009: { name: "권한 인계실", theme: "relay" },
    1199: { name: "상층 송수관", theme: "sluice" },
    1329: { name: "최종 제어실", theme: "forge" },
    1332: { name: "별불 배분실", theme: "forge" },
  };
  const bossTrials = {
    9: { title: "주철 관문", bossName: "주철문 검문대장", objective: "주철문 검문대를 돌파해 관문을 여세요." },
    19: { title: "축전탑 심부", bossName: "축전탑 약탈대장", objective: "축전탑을 점거한 약탈대장을 쓰러뜨리세요." },
    29: { title: "종탑 구동부", bossName: "격리대장", objective: "격리대장의 봉쇄를 돌파해 상층 수문을 여세요." },
    39: { title: "녹슨 둥지", bossName: "첫 껍질거수", objective: "관을 둘러싸고 둥지를 튼 껍질거수를 쓰러뜨리세요." },
    329: { title: "원격 기록 저장층", bossName: "잿등 거수", objective: "기록 단말을 에워싼 잿등 거수를 쓰러뜨리세요." },
    489: { title: "야간 신호 기록실", bossName: "반향 거수", objective: "반향 거수를 제압하고 오래된 신호를 확인하세요." },
    829: { title: "난방 중계기", bossName: "열먹이 거수", objective: "난방 중계기에 붙어 열을 빨아먹는 거수를 떼어 내세요." },
    1009: { title: "중앙 권한 중계소", bossName: "엇뿔 거수", objective: "인계 단말 주변을 맴도는 엇뿔 거수를 쓰러뜨리세요." },
    1199: { title: "상층 송수관", bossName: "수맥 거수", objective: "송수관을 감싼 수맥 거수를 쓰러뜨리세요." },
    1329: { title: "최종 제어실", bossName: "배관의 거수", objective: "최종 제어실에 뿌리내린 거수를 쓰러뜨리세요." },
  };
  const standardBoss = { title: "심층 관문", objective: "관문을 지키는 수호자를 쓰러뜨리세요." };
  const bossStyles = [
    { style: "warden", accent: "#dec58d", names: ["주철갑 파수꾼", "격벽 방패수", "심층 집행자"],
      opening: "sweep" },
    { style: "hunter", accent: "#ed946d", names: ["도금 사냥꾼", "추격하는 갈퀴뿔", "광맥의 포식자"],
      opening: "pursuit" },
    { style: "engine", accent: "#88c9dd", names: ["역류 장치", "삼중 압축기", "열압 펌프 거수"],
      opening: "barrage" },
    { style: "beast", accent: "#a9bd85", names: ["갈라진 껍질거수", "배관을 씹는 거수", "격벽에 뿌리내린 짐승"],
      opening: "rupture" },
  ];
  const bossMoves = ["sweep", "rupture", "barrage", "pursuit", "crossfire", "orbit"];

  function bossSequence(opening, rank) {
    const remaining = bossMoves.filter((move) => move !== opening);
    const sequence = [opening];
    // Each floor within a boss style has its own three consecutive permutation ranks.
    while (remaining.length) {
      const index = rank % remaining.length;
      rank = Math.floor(rank / remaining.length);
      sequence.push(remaining.splice(index, 1)[0]);
    }
    return sequence;
  }

  function profileForBoss(floor, theme, macro, placement, minor) {
    if (floor === floorCount) {
      return { id: "stellar-1332", style: "stellar", sequence: ["orbit", "crossfire", "rupture"],
        accent: "#e4d1ff", timing: 1, size: 1,
        appearance: { variant: 3, material: "#665a96", accent: "#ede0ff", head: 3, weapon: 3, frame: 3 } };
    }
    const ordinal = Math.floor(floor / 10);
    const { style, accent, names, opening } = bossStyles[ordinal % bossStyles.length];
    const early = floor <= 19;
    const environment = ["sluice", "relay", "forge"].indexOf(theme);
    const group = Math.floor(ordinal / bossStyles.length);
    const pattern = (group + macro + placement * 2 + minor + environment) % names.length;
    const timing = early ? 1 : [1.06, 1, 0.94][(ordinal + macro + minor) % 3];
    const size = early ? 1 : [0.92, 1, 1.08][(ordinal + placement + minor) % 3];
    const sequence = floor === 9 ? [opening, "rupture", pattern === 1 ? "orbit" : "crossfire"]
      : floor === 19 ? [opening, pattern === 1 ? "crossfire" : "barrage", "orbit"]
      : bossSequence(opening, group * names.length + pattern);
    const palettes = {
      warden: [["#626459", "#f2cd88"], ["#495b59", "#ead6a2"], ["#685542", "#ffbe82"], ["#505160", "#e4c999"]],
      hunter: [["#6f4744", "#ffb381"], ["#6c525d", "#f3a28f"], ["#5b4a43", "#ffd29a"], ["#673c42", "#edad99"]],
      engine: [["#405f69", "#8ee4eb"], ["#4b5f7a", "#a5d7ff"], ["#3f6662", "#9be7cf"], ["#566173", "#d2dcff"]],
      beast: [["#59664c", "#d4eb97"], ["#70634b", "#e9cb85"], ["#546750", "#aee6a4"], ["#596552", "#efd499"]],
    };
    const variant = (group + macro * 3 + placement + minor * 2 + environment) % 4;
    const [material, trim] = palettes[style][variant];
    // Multiplying by an odd integer permutes all 64 combinations so a style does not repeat its silhouette.
    const silhouette = (group * 13 + ordinal % bossStyles.length * 7) % 64;
    const appearance = { variant, material, accent: trim,
      head: silhouette % 4, weapon: Math.floor(silhouette / 4) % 4, frame: Math.floor(silhouette / 16) };
    return { id: `${style}-${floor}-${theme}-${macro}-${placement}-${minor}`, style, accent,
      sequence, timing, size, name: names[pattern], appearance };
  }

  const rosterNames = {
    human: { guard: "경비병", runner: "추격꾼", sentry: "보초 사수", lancer: "장창병", mortar: "탄 투척병", warden: "방패병",
      skirmisher: "유격병", breaker: "파쇄병", marksman: "저격병", saboteur: "공작병" },
    machine: { guard: "차단기", runner: "순찰기", sentry: "자동 포탑", lancer: "압착기", mortar: "분사기", warden: "방벽 장치",
      skirmisher: "측방 순찰기", breaker: "충격 파쇄기", marksman: "정밀 포탑", saboteur: "교란 장치" },
    creature: { guard: "철각충", runner: "물갈퀴 짐승", sentry: "독침거미", lancer: "갈퀴뿔", mortar: "포자주머니", warden: "방패등",
      skirmisher: "틈새발톱", breaker: "격벽파쇄수", marksman: "장침거미", saboteur: "덫주머니" },
  };
  const creatureSpecialists = {
    sluice: { skirmisher: "물살발톱", breaker: "수로 갑각수", marksman: "수침거미", saboteur: "진흙덫충" },
    relay: { skirmisher: "전선발톱", breaker: "철심파쇄수", marksman: "방전가시수", saboteur: "도체덫충" },
    forge: { skirmisher: "잿발톱", breaker: "용암등 파쇄수", marksman: "불침거미", saboteur: "불씨주머니" },
  };

  function combatant(floor, kind, index, signal, theme) {
    const native = floor < frontierFloor ? "human" : "creature";
    const machine = kind !== "boss" && !isBossFloor(floor) && index === 1 && (floor + signal) % 4 === 0;
    const faction = machine ? "machine" : native;
    const regionalName = faction === "creature" ? creatureSpecialists[theme]?.[kind] : undefined;
    return { faction, name: regionalName ?? rosterNames[faction][kind] };
  }
  const finalTrial = {
    title: "별불 배분실",
    bossName: "별의 산파",
    objective: "배분실을 봉쇄한 별의 산파를 쓰러뜨리고 아래로 흐르는 길을 여세요.",
    environment: {
      name: "별불 차단",
      hazard: "none",
      enemies: ["boss", "warden", "sentry"],
    },
    obstacles: [
      [8.2, 5.8, 5.0, 2.6], [8.2, 20.2, 5.0, 2.6], [15.6, 7.9, 2.0, 2.8], [15.6, 18.1, 2.0, 2.8],
      [25.7, 5.2, 4.3, 2.1], [25.7, 20.8, 4.3, 2.1], [30.6, 11, 1.8, 2.8],
    ],
  };
  const entrancePatrols = [
    { name: "혼성 경비", front: ["guard", "runner"], support: "guard" },
    { name: "기동 순찰", front: ["runner", "runner"], support: "runner" },
    { name: "사격 경비", front: ["runner", "guard"], support: "sentry" },
    { name: "중장 경비", front: ["guard", "guard"], support: "guard" },
  ];
  const signedRouteValue = (value) => `${value < 0 ? "−" : "+"}${Number(Math.abs(value).toFixed(2))}`;
  const routePercent = (value) => `${signedRouteValue(Math.round((value - 1) * 100))}%`;
  const routeDetail = {
    heal: (value) => `즉시 체력 ${signedRouteValue(value)}`,
    goldCost: (value) => `금화 ${value} 소모`,
    ward: (value) => `보호막 ${signedRouteValue(value)}`,
    damageBonus: (value) => `공격력 ${signedRouteValue(value)}`,
    clearGoldBonus: (value) => `통과 금화 ${signedRouteValue(value)}`,
    clearXpBonus: (value) => `통과 경험치 ${signedRouteValue(value)}`,
    enemyDamageMultiplier: (value) => `적 공격력 ${routePercent(value)}`,
    dashCooldownMultiplier: (value) => `대쉬 재사용 ${routePercent(value)}`,
    speedMultiplier: (value) => `이동 속도 ${routePercent(value)}`,
    attackCooldownMultiplier: (value) => `공격 간격 ${routePercent(value)}`,
    damageReductionBonus: (value) => `피해 감소 ${signedRouteValue(value * 100)}%p`,
    attackRangeBonus: (value) => `공격 거리 ${signedRouteValue(value)}칸`,
    clearHeal: (value) => `통과 시 체력 ${signedRouteValue(value)}`,
    entryGold: (value) => `입장 금화 ${signedRouteValue(value)}`,
    entryXp: (value) => `입장 경험치 ${signedRouteValue(value)}`,
    guardBreakBonus: (value) => `장갑 관통 ${signedRouteValue(value * 100)}%p`,
    dashStrikeBonus: (value) => `대쉬 후 피해 ${signedRouteValue(value)}`,
  };
  function buildRoute(id, label, description, effects, regions) {
    const detail = Object.entries(effects).map(([key, value]) => routeDetail[key](value)).join(" · ");
    return { id, label, description, detail, effects, regions };
  }

  const routes = [
    {
      id: "repair",
      label: "정비 통로",
      description: "부상부터 치료하고 다음 층에 진입합니다.",
      detail: "즉시 체력 +35",
      effects: { heal: 35 },
    },
    {
      id: "overclock",
      label: "과부하 통로",
      description: "무기에 남은 전력을 보내 다음 시련에 대비합니다.",
      detail: "다음 층 공격력 +12",
      effects: { damageBonus: 12 },
      regions: ["pressure", "furnace"],
    },
    {
      id: "contract",
      label: "회수 통로",
      description: "다음 시련을 돌파하고 추가 금화를 받습니다.",
      detail: "다음 층 클리어 시 금화 +28",
      effects: { clearGoldBonus: 28 },
    },
    {
      id: "insulated",
      label: "차폐 통로",
      description: "벽면 차폐판의 잔류 전력으로 보호막을 충전합니다.",
      detail: "다음 층 보호막 +24",
      effects: { ward: 24 },
      regions: ["lower-drainage", "transmission"],
    },
    {
      id: "service-rail",
      label: "점검 레일",
      description: "균형 보조 장치를 조정하고 위층으로 오릅니다.",
      detail: "다음 층 대쉬 재사용 시간 −28%",
      effects: { dashCooldownMultiplier: 0.72 },
      regions: ["service", "transmission"],
    },
    {
      id: "archive",
      label: "기록 중계로",
      description: "다음 시련을 마치면 회수한 계측 기록을 판독합니다.",
      detail: "다음 층 클리어 기본 경험치 +36",
      effects: { clearXpBonus: 36 },
      regions: ["transmission", "distribution"],
    },
    {
      id: "medkit",
      label: "비상 의료함",
      description: "금화로 봉인된 고급 의료함을 엽니다.",
      detail: "금화 16 소모 · 즉시 체력 +55 · 다음 층 보호막 +10",
      effects: { heal: 55, ward: 10, goldCost: 16 },
      regions: ["lower-drainage", "service"],
    },
    {
      id: "capacitor",
      label: "축전기 교환로",
      description: "예비 축전기를 사서 무기와 보호막에 전력을 나눠 보냅니다.",
      detail: "금화 12 소모 · 다음 층 공격력 +8 · 보호막 +12",
      effects: { damageBonus: 8, ward: 12, goldCost: 12 },
      regions: ["pressure", "furnace", "distribution"],
    },
    {
      id: "hazard-contract",
      label: "위험 회수로",
      description: "강화 경비가 있는 시련을 맡고 더 큰 보수를 받습니다.",
      detail: "다음 층 적 공격력 +18% · 클리어 금화 +52",
      effects: { enemyDamageMultiplier: 1.18, clearGoldBonus: 52 },
      regions: ["pressure", "furnace"],
    },
    buildRoute("field-dressing", "구호품 지름길", "붕대와 새 보호판을 챙깁니다.",
      { heal: 22, ward: 10 }, ["lower-drainage", "service"]),
    buildRoute("recovery-checkpoint", "복귀 의무로", "돌파 뒤 대기 중인 의료함을 엽니다.",
      { clearHeal: 24, clearXpBonus: 16 }, ["service", "distribution"]),
    buildRoute("pressure-grease", "윤활 정비로", "걸리던 무기 관절에 기름을 칩니다.",
      { attackCooldownMultiplier: 0.84 }, ["pressure", "service"]),
    buildRoute("intake-siding", "흡입구 바람길", "바람을 등지고 올라갑니다.",
      { speedMultiplier: 1.12 }, ["lower-drainage", "transmission"]),
    buildRoute("wide-sword-hook", "연장 자루 작업대", "무기 자루를 늘려 멀리 닿게 합니다.",
      { attackRangeBonus: 0.34, attackCooldownMultiplier: 1.08 }, ["service", "furnace"]),
    buildRoute("edge-grind", "쐐기 연마로", "단단한 표면에 맞춰 날을 세웁니다.",
      { guardBreakBonus: 0.23, damageBonus: 4 }, ["furnace", "pressure"]),
    buildRoute("counter-spring", "탄성 반격로", "대쉬 장치에 반동 스프링을 겁니다.",
      { dashStrikeBonus: 12, dashCooldownMultiplier: 0.90 }, ["service", "transmission"]),
    buildRoute("shock-pad", "완충 격벽로", "충격을 흘리는 패드를 붙입니다.",
      { damageReductionBonus: 0.08, ward: 8 }, ["pressure", "distribution"]),
    buildRoute("triage-lane", "야전 처치로", "응급 붕대와 회복제를 챙깁니다.",
      { heal: 12, clearHeal: 12 }, ["lower-drainage", "service"]),
    buildRoute("garrison-audit", "근접 훈련로", "짧은 거리에서 실전 기록을 남깁니다.",
      { attackRangeBonus: -0.18, clearXpBonus: 48 }, ["service", "distribution"]),
    buildRoute("mint-scrap", "예치금 회수로", "문 안쪽에 맡긴 예치금을 받습니다.",
      { entryGold: 14 }, ["lower-drainage", "distribution"]),
    buildRoute("coach-slate", "교대조 교본실", "들어가기 전에 실전 교본을 훑습니다.",
      { entryXp: 23 }, ["service", "transmission"]),
    buildRoute("dispatch-pair", "운송조 인수로", "운송 수고비와 점검 수당을 받습니다.",
      { entryGold: 9, clearXpBonus: 21 }, ["transmission", "distribution"]),
    buildRoute("double-toll", "선불 회수 계약", "먼저 보증금을 내고 회수에 나섭니다.",
      { goldCost: 18, clearGoldBonus: 48, clearHeal: 12 }, ["service", "distribution"]),
    buildRoute("borrowed-shoes", "차용 장화로", "정비조의 빠른 장화를 빌립니다.",
      { goldCost: 10, speedMultiplier: 1.18, dashCooldownMultiplier: 0.84 }, ["service", "transmission"]),
    buildRoute("surplus-brass", "잉여 황동 교환소", "황동 쐐기와 보호판을 사들입니다.",
      { goldCost: 8, guardBreakBonus: 0.34, ward: 16 }, ["pressure", "furnace"]),
    buildRoute("workbench-strip", "무기 개조 작업대", "자루와 날을 함께 손봅니다.",
      { goldCost: 14, attackRangeBonus: 0.42, damageBonus: 6 }, ["service", "furnace"]),
    buildRoute("canvas-wrap", "유료 구호 격실", "완충포를 두르고 사후 치료를 예약합니다.",
      { goldCost: 8, damageReductionBonus: 0.12, clearHeal: 20 }, ["lower-drainage", "service"]),
    buildRoute("field-kiln", "중량 주조로", "무거운 주조판으로 타격을 보강합니다.",
      { speedMultiplier: 0.90, damageBonus: 19 }, ["furnace", "pressure"]),
    buildRoute("fast-sharpen", "얇은 날 작업대", "날을 가볍게 깎아 연격을 냅니다.",
      { attackCooldownMultiplier: 0.72, damageBonus: -4 }, ["furnace", "distribution"]),
    buildRoute("padded-fuel", "중첩 완충로", "보호판을 겹쳐 걸음이 무거워집니다.",
      { damageReductionBonus: 0.16, speedMultiplier: 0.86 }, ["pressure", "furnace"]),
    buildRoute("grease-crossover", "무방비 견인로", "빠른 견인선을 타고 경보선을 넘습니다.",
      { speedMultiplier: 1.16, enemyDamageMultiplier: 1.14 }, ["transmission", "service"]),
    buildRoute("unsafe-override", "잠금 해제 우회로", "적과 무기에 전력이 함께 들어갑니다.",
      { damageBonus: 22, enemyDamageMultiplier: 1.22 }, ["pressure", "furnace"]),
    buildRoute("spring-transfer", "고속 전환 레일", "좁은 회전에 맞춰 대쉬 장치를 당깁니다.",
      { dashCooldownMultiplier: 0.60, speedMultiplier: 0.92, ward: 14 }, ["service", "transmission"]),
    buildRoute("tunnel-lit", "투광기 통로", "밝아진 길에서 긴 자루를 다룹니다.",
      { attackRangeBonus: 0.29, speedMultiplier: 1.08 }, ["lower-drainage", "distribution"]),
    buildRoute("needle-point", "침형 쐐기실", "가느다란 날로 갑주의 틈을 찌릅니다.",
      { guardBreakBonus: 0.35, damageBonus: -3 }, ["pressure", "furnace"]),
    buildRoute("recovery-wedge", "회복 쐐기 통로", "교전을 마치면 비축한 회복제를 씁니다.",
      { clearHeal: 18, attackCooldownMultiplier: 1.10 }, ["lower-drainage", "service"]),
    buildRoute("merit-drive", "실전 검증로", "강해진 적과 맞서 실전 기록을 남깁니다.",
      { enemyDamageMultiplier: 1.13, clearXpBonus: 64 }, ["pressure", "distribution"]),
    buildRoute("deferred-pay", "추가 적재로", "무거운 회수 상자를 들고 갑니다.",
      { clearGoldBonus: 38, speedMultiplier: 0.92 }, ["lower-drainage", "transmission"]),
    buildRoute("respite-patrol", "감압 안전로", "전력이 약한 길에서 짧은 무기를 씁니다.",
      { enemyDamageMultiplier: 0.84, attackRangeBonus: -0.15 }, ["pressure", "service"]),
    buildRoute("vault-channel", "예비 금고 연결로", "보호판과 반격 장치를 챙깁니다.",
      { clearGoldBonus: 24, ward: 16, dashStrikeBonus: 5 }, ["transmission", "distribution"]),
  ];

  function takeWeightedRoute(pool, weight, rng) {
    let ticket = rng() * pool.reduce((total, route) => total + weight(route), 0);
    const index = pool.findIndex((route) => (ticket -= weight(route)) < 0);
    return pool.splice(index, 1)[0];
  }

  function routeOptions(floor, rng = Math.random, { hp = 65, maxHp = 106, gold = 0, previous = [] } = {}) {
    const missingHp = Math.max(0, maxHp - hp);
    const region = getRegion(floor).id;
    const weight = (route) => (route.regions?.includes(region) ? 4 : 2)
      + (route.effects.heal && missingHp >= 25 ? 3 : 0);
    const pool = routes.filter(({ id, effects }) => (effects.goldCost ?? 0) <= gold
      && (id !== "repair" || missingHp > 0)
      && (id !== "medkit" || missingHp >= 24)
      && ((effects.enemyDamageMultiplier ?? 1) <= 1 || hp >= maxHp * 0.42));
    const choices = [];
    while (choices.length < 3) choices.push(takeWeightedRoute(pool, weight, rng));
    if (previous.length === 3 && choices.every(({ id }) => previous.includes(id))) {
      const alternatives = pool.filter(({ id }) => !previous.includes(id));
      if (alternatives.length) choices[2] = takeWeightedRoute(alternatives, weight, rng);
    }
    return choices;
  }

  const floors = [
    {
      title: "폐쇄된 수문",
      name: "경비대 격파",
      spawn: [4.2, 13.25],
      objective: "엄폐물을 이용해 경비대와 후속 증원대를 모두 물리치세요.",
      baseGold: 12,
      macroLabel: "수문 경계",
      minorLabel: "경비대 현상금",
      variations: [
        { name: "교대 시간", hazard: "none", enemies: ["guard", "runner", "sentry", "guard", "runner", "guard"], wave: ["guard", "runner", "sentry"] },
        { name: "증기 유출", hazard: "mist", enemies: ["guard", "runner", "sentry", "runner", "guard", "guard"], wave: ["runner", "runner", "sentry"] },
        { name: "전류 역류", hazard: "sparks", enemies: ["runner", "guard", "sentry", "guard", "sentry", "runner"], wave: ["guard", "runner", "sentry"] },
        { name: "수압 상승", hazard: "pressure", enemies: ["guard", "runner", "sentry", "guard", "guard", "runner"], wave: ["guard", "guard", "sentry"] },
        { name: "신속 대응", hazard: "none", enemies: ["runner", "runner", "sentry", "runner", "guard", "runner", "guard"], wave: ["runner", "runner", "sentry"] },
        { name: "중무장 경계", hazard: "mist", enemies: ["guard", "guard", "sentry", "runner", "sentry", "guard", "runner"], wave: ["guard", "sentry", "runner"] },
      ],
    },
    {
      title: "끊어진 배전실",
      name: "전력 셀 회수",
      spawn: [3.95, 13.1],
      objective: "전력 셀 3개를 회수하고 출구 경비를 쓰러뜨리세요. 중앙 순찰대는 외곽 통로로 우회할 수 있습니다.",
      baseGold: 16,
      macroLabel: "배전실 상태",
      minorLabel: "순찰 인원",
      variations: [
        { name: "비상 정전", hazard: "none", timeLimit: 32, enemies: ["guard", "runner", "sentry", "guard"] },
        { name: "냉각 증기", hazard: "mist", timeLimit: 30, enemies: ["guard", "runner", "sentry", "runner"] },
        { name: "노출된 전선", hazard: "sparks", timeLimit: 28, enemies: ["runner", "guard", "sentry", "guard", "runner"] },
        { name: "환기 압력", hazard: "pressure", timeLimit: 26, enemies: ["guard", "runner", "sentry", "runner", "guard"] },
        { name: "감시 장치 복구", hazard: "none", timeLimit: 24, enemies: ["runner", "runner", "sentry", "guard", "runner"] },
        { name: "방호 병력 도착", hazard: "sparks", timeLimit: 22, enemies: ["guard", "guard", "sentry", "runner", "guard"] },
      ],
    },
    {
      title: "종탑 구동부",
      spawn: [5.1, 13],
      objective: "최상층의 구동 수호자를 쓰러뜨리세요.",
      baseGold: 24,
      macroLabel: "구동부 동력",
      minorLabel: "수호자 경계",
      variations: [
        { name: "냉각 완료", hazard: "none", enemies: ["boss", "guard"] },
        { name: "증기 봉쇄", hazard: "mist", enemies: ["boss", "runner"] },
        { name: "축전기 방전", hazard: "sparks", enemies: ["boss", "sentry"] },
        { name: "과압 작동", hazard: "pressure", enemies: ["boss", "guard"] },
        { name: "호위 가동", hazard: "none", enemies: ["boss", "guard", "sentry"] },
        { name: "긴급 방어", hazard: "pressure", enemies: ["boss", "runner", "guard"] },
      ],
    },
    {
      title: "수문 제어실",
      name: "구역 사수",
      spawn: [4.2, 13.25],
      objective: "표시된 구역에 머물며 수문 해제를 완료하세요. 구역을 벗어나면 진행이 멈춥니다.",
      baseGold: 24,
      macroLabel: "수문 해제 조건",
      minorLabel: "대응 병력",
      variations: [
        { name: "비상 개방", hazard: "none", duration: 12, enemies: ["guard", "runner", "sentry", "lancer"], wave: ["guard", "runner", "sentry"] },
        { name: "증기 배출", hazard: "mist", duration: 13, enemies: ["runner", "guard", "sentry", "lancer"], wave: ["runner", "guard", "lancer"] },
        { name: "배선 과열", hazard: "sparks", duration: 14, enemies: ["guard", "runner", "sentry", "mortar"], wave: ["guard", "runner", "sentry"] },
        { name: "압력 복구", hazard: "pressure", duration: 12, enemies: ["guard", "runner", "sentry", "warden"], wave: ["lancer", "guard", "runner"] },
        { name: "이중 잠금", hazard: "none", duration: 16, enemies: ["guard", "runner", "sentry", "lancer", "warden"], wave: ["runner", "lancer", "sentry"] },
        { name: "침수 경보", hazard: "sparks", duration: 15, enemies: ["runner", "runner", "sentry", "lancer", "guard"], wave: ["guard", "runner", "mortar"] },
      ],
    },
    {
      title: "감시 장비 공방",
      name: "표적 추적",
      spawn: [5.1, 13],
      objective: "표식이 붙은 지휘관을 찾아 쓰러뜨리세요. 주변 호위는 우회할 수 있습니다.",
      baseGold: 25,
      macroLabel: "표적과 환경",
      minorLabel: "호위 병력",
      variations: [
        { name: "순찰 대장", hazard: "none", enemies: ["lancer", "guard", "runner", "sentry"] },
        { name: "증기 속 방패", hazard: "mist", enemies: ["warden", "runner", "guard", "sentry"] },
        { name: "작업장 포격수", hazard: "sparks", enemies: ["mortar", "guard", "runner", "lancer"] },
        { name: "압력 통제관", hazard: "pressure", enemies: ["sentry", "runner", "lancer", "guard"] },
        { name: "중장 호위대", hazard: "none", enemies: ["warden", "guard", "lancer", "sentry", "runner"] },
        { name: "비상 기동대", hazard: "mist", enemies: ["lancer", "runner", "mortar", "guard", "sentry"] },
      ],
    },
    {
      title: "비상 탈출로",
      name: "추격 탈출",
      spawn: [3.95, 13.1],
      objective: "출구 잠금이 풀릴 때까지 버티며 출구 경비를 쓰러뜨린 뒤 탈출하세요.",
      baseGold: 23,
      macroLabel: "출구 잠금 상태",
      minorLabel: "추격 병력",
      variations: [
        { name: "보조 전원", hazard: "none", unlockAfter: 10, timeLimit: 28, enemies: ["guard", "runner", "sentry", "lancer"] },
        { name: "증기 분출", hazard: "mist", unlockAfter: 11, timeLimit: 27, enemies: ["runner", "guard", "sentry", "lancer"] },
        { name: "전압 불안", hazard: "sparks", unlockAfter: 12, timeLimit: 26, enemies: ["lancer", "runner", "sentry", "mortar"] },
        { name: "과압 차단", hazard: "pressure", unlockAfter: 13, timeLimit: 25, enemies: ["guard", "lancer", "sentry", "warden"] },
        { name: "기동 추격", hazard: "none", unlockAfter: 12, timeLimit: 24, enemies: ["lancer", "runner", "sentry", "runner", "lancer"] },
        { name: "최후 봉쇄", hazard: "sparks", unlockAfter: 14, timeLimit: 22, enemies: ["warden", "lancer", "sentry", "runner", "mortar"] },
      ],
    },
  ];

  const layouts = [
    { name: "왼쪽 엄폐 배치", offsets: [-0.75, -0.9, 0.45], fold: 1 },
    { name: "왼쪽 엄폐 배치 반전", offsets: [-0.75, -0.9, 0.45], fold: -1 },
    { name: "오른쪽 엄폐 배치", offsets: [0.9, 0.8, -0.6], fold: 1 },
    { name: "오른쪽 엄폐 배치 반전", offsets: [0.9, 0.8, -0.6], fold: -1 },
  ];

  const routeProfiles = [
    { name: "중앙 교차 통로", size: [22, 17], bank: -0.35, crossings: [5.2, 13.1, 22.1],
      replace: [0, 5], cover: [[8.4, 7.1, 4.7, 1.45], [18.4, 10.1, 1.5, 4.2]] },
    { name: "가로 수로", size: [23, 18], bank: 0.4, crossings: [6.6, 20.8], waterway: "across",
      replace: [3, 7], cover: [[19.35, 9.5, 6.1, 1.45], [18.9, 16.6, 6.4, 1.5]] },
    { name: "한쪽을 끼고 도는 통로", size: [24, 17], bank: 0.72, crossings: [4.4, 16.9, 22.7], waterway: "bend",
      replace: [2, 4], cover: [[7.6, 17.3, 4.4, 1.65], [22.5, 6.7, 6.4, 1.25]] },
    { name: "작업장을 돌아가는 통로", size: [25, 19], bank: -0.65, crossings: [10, 18.8], waterway: "split",
      replace: [0, 6], cover: [[18.5, 20.3, 3.0, 2.4], [23.7, 9.1, 1.6, 5.0]] },
  ];
  const floorPlans = [
    {
      id: "cross", title: "십자 교차실", terraceSize: [24, 20],
      walls: [[5.6, 3.9, 11.2, 7.8], [5.6, 22.1, 11.2, 7.8], [26.5, 3.8, 15, 7.6], [26.5, 22.2, 15, 7.6]],
      underneath: [[5.2, 5.5, 6.1, 6.4], [5.2, 20.5, 6.1, 6.4], [12.1, 5.1, 3.6, 5.6], [12.1, 20.9, 3.6, 5.6]],
    },
    {
      id: "loop", title: "중앙을 도는 순환실", terraceSize: [22, 24],
      walls: [[17, 13, 9.3, 10.0]],
      underneath: [[11.8, 13, 3.1, 8.3]],
    },
    {
      id: "zigzag", title: "엇갈린 격벽 통로", terraceSize: [25, 19],
      walls: [[10.0, 5.9, 2.4, 11.8], [18.0, 20.2, 2.7, 11.6], [25.9, 5.2, 2.5, 10.4]],
      underneath: [[8.6, 5.3, 2.1, 10.6], [13.0, 20.8, 2.2, 10.4]],
    },
    {
      id: "galleries", title: "나란한 두 공정 회랑", terraceSize: [23, 22],
      walls: [[10.5, 13.0, 7.2, 3.6], [20.6, 13.0, 8.2, 3.6], [29.7, 13.0, 3.7, 3.6]],
      underneath: [[11.2, 12.1, 5.9, 2.4], [8.2, 7.0, 5.7, 2.7]],
    },
  ];
  const dryProfiles = [
    { title: "넓은 작업장", widthAndDepth: [35, 27], early: [23, 19] },
    { title: "깊은 설비동", widthAndDepth: [27, 31], early: [20, 24] },
    { title: "긴 생산 라인", widthAndDepth: [40, 21], early: [25, 17] },
    { title: "좁은 점검 통로", widthAndDepth: [25, 22], early: [21, 18] },
  ];
  const equipment = {
    intake: { name: "흡입 여과조", purpose: "원수에서 모래와 부유물을 걸러냅니다.", footprint: [4.5, 1.9], aspect: [2, 0] },
    pumps: { name: "가압 펌프실", purpose: "다음 높이까지 올릴 물의 압력을 높입니다.", footprint: [2.4, 2.5], aspect: [0, 2] },
    condenser: { name: "증기 응축실", purpose: "식힌 증기를 물로 되돌려 환수관에 보냅니다.", footprint: [4.5, 2.4], aspect: [2, 1] },
    boilers: { name: "증기 보일러실", purpose: "순환수를 데워 증기관으로 보냅니다.", footprint: [3.1, 2.8], aspect: [0, 2] },
    smelter: { name: "용해 주조실", purpose: "녹인 금속을 주형으로 옮깁니다.", footprint: [3.7, 2.5], aspect: [2, 2] },
    crucible: { name: "내열 도가니실", purpose: "소량의 합금을 높은 온도에서 녹입니다.", footprint: [2.6, 2.2], aspect: [-2, 2] },
    transformers: { name: "변압 설비실", purpose: "전력을 수신 설비가 감당할 수 있는 전압으로 바꿉니다.", footprint: [3.9, 1.9], aspect: [2, -1] },
    "relay-rack": { name: "신호 교환실", purpose: "끊긴 중계 신호를 다른 회선으로 넘깁니다.", footprint: [1.8, 4.0], aspect: [-2, 3] },
    drydock: { name: "관로 정비독", purpose: "수위를 낮춰 관과 이음쇠를 들어 올리는 곳입니다.", footprint: [5.4, 2.0], aspect: [3, 0] },
    manifold: { name: "분배 헤더실", purpose: "한 관에 모인 흐름을 여러 갈래로 분배합니다.", footprint: [4.8, 1.5], aspect: [2, -1] },
    "valve-bank": { name: "차단 밸브실", purpose: "고장 난 관로를 다른 공급선에서 격리합니다.", footprint: [2.0, 4.2], aspect: [-2, 2] },
    scrubber: { name: "배기 세정실", purpose: "배기의 분진을 가라앉혀 배수관으로 보냅니다.", footprint: [2.6, 3.2], aspect: [-1, 3] },
  };
  const facilityDistricts = {
    "lower-drainage": { name: "수계", features: ["intake", "pumps", "scrubber", "valve-bank"] },
    pressure: { name: "압력망", features: ["condenser", "manifold", "boilers", "valve-bank"] },
    service: { name: "정비선", features: ["transformers", "drydock", "relay-rack", "pumps"] },
    transmission: { name: "송수망", features: ["transformers", "relay-rack", "manifold", "intake"] },
    furnace: { name: "연소열", features: ["smelter", "crucible", "boilers", "scrubber"] },
    distribution: { name: "배분망", features: ["manifold", "relay-rack", "valve-bank", "transformers"] },
  };
  const openingFacilities = [
    ["intake", "수문 흡입 여과조"], ["transformers", "비상 변압 설비"],
    ["valve-bank", "가압 밸브군"], ["relay-rack", "격리 신호 교환대"],
  ];
  const serviceLanes = ["동측", "중앙", "서측", "상류", "내환", "하류", "격벽 뒤", "외환", "북측", "배관측", "남측", "전단", "회랑측", "후단"];
  const branchNames = ["주계통", "직결선", "회류선", "우회선", "예비선", "완충선", "독립선"];
  const holdTasks = {
    sluice: "환수 밸브를 안정화하세요.",
    relay: "중계 신호를 복구하세요.",
    forge: "가압 장치를 안정화하세요.",
  };
  const storyBossFloors = new Set([9, 19, 29, 49, 89, 169, 229, 329, 489, 829, 1009, 1199, 1329, floorCount]);
  const storyOperationFloors = new Set([7, 12, 17]);

  const obstacleMargin = 0.46;
  const terraceHeight = 1.45;
  const edgeTolerance = 1e-7;
  const placementOffsets = [0.55, 1.1, 1.65, 2.2, 2.8, 3.5, 4.25, 5, 6.25, 7.5, 9].flatMap((distance) =>
    Array.from({ length: 8 }, (_, index) => {
      const angle = index * Math.PI / 4;
      return [Math.cos(angle) * distance, Math.sin(angle) * distance];
    }));
  const terraceObjectives = {
    relay: "전력 셀 3개를 모으세요. 상단에 셀 2개와 출구 경비가 있습니다.",
    escape: "잠금이 풀릴 때까지 버티고 상단 출구 경비를 쓰러뜨리세요.",
  };

  // Rectangles are authored as bounds. Adjacent raised surfaces meet edge to edge.
  const terraces = [
    {
      title: "동쪽 직선 작업대",
      decks: [[23, 7.4, 33, 20.9]],
      stairs: [[19.5, 8.2, 23, 11.4, "x", 1], [28, 3.9, 31.2, 7.4, "y", 1]],
      cells: [[26, 11.35], [28.3, 19.25]],
      sentry: [25.7, 8.8],
      hold: [28.3, 12.55],
    },
    {
      title: "중앙 돌출 작업대",
      decks: [[25, 6.2, 33, 20.7], [18.5, 10.9, 25, 17.4]],
      stairs: [[15, 12.4, 18.5, 15.7, "x", 1], [28.3, 20.7, 31.5, 24.2, "y", -1]],
      cells: [[21.8, 12.25], [28.45, 19.05]],
      sentry: [26.7, 9.2],
      hold: [29, 11.7],
    },
    {
      title: "분리된 쌍둥이 작업대",
      decks: [[19.5, 5, 26, 13.5], [27.5, 13, 33, 21.5]],
      stairs: [[16, 7.4, 19.5, 10.6, "x", 1], [20.7, 13.5, 23.9, 17, "y", -1],
        [29, 9.5, 32.2, 13, "y", 1], [24, 17.75, 27.5, 20.95, "x", 1]],
      cells: [[23.8, 11.7], [28.8, 19.1]],
      sentry: [22.2, 7.15],
      hold: [23.05, 9.4],
    },
    {
      title: "안뜰을 감싸는 작업대",
      decks: [[24.5, 3.9, 33, 10], [24.5, 14, 33, 22], [29, 10, 33, 14]],
      stairs: [[21, 5.45, 24.5, 8.65, "x", 1], [27, 22, 30.2, 25.5, "y", -1]],
      cells: [[26.1, 7.25], [28.05, 19.75]],
      sentry: [30.65, 6.75],
      hold: [28.1, 17.9],
    },
  ];

  const roomShapes = [
    [
      [8.8, 5.3, 5.2, 1.7], [8.5, 20.35, 5.2, 1.7], [12.65, 10, 1.65, 6.1],
      [17.6, 15.6, 2, 5.95], [22.9, 8.05, 5, 1.75], [26.2, 18.05, 5, 1.8],
      [29.3, 12, 1.55, 3.6], [4.1, 10.05, 1.7, 1.5], [20.95, 22.1, 2.2, 1.35],
      [31, 5.25, 2, 1.4],
    ],
    // The two aligned walls create a guarded crossing and a longer perimeter approach.
    [
      [14.7, 4.4, 1.85, 8.8], [14.7, 17.45, 1.85, 7.5],
      [9.6, 12.75, 3.3, 1.25], [20.5, 15.9, 5, 1.7],
      [26, 13.75, 3.4, 1.35], [29.6, 23.35, 4.1, 1.25],
      [8.5, 20.4, 2.2, 1.45], [29.7, 8.45, 2.3, 1.6],
    ],
    [
      [9.2, 5.5, 4.1, 1.8], [9.4, 21.3, 4.4, 1.85],
      [15.1, 7.6, 2.05, 3.3], [15, 18.4, 2.1, 3.35],
      [25, 6.4, 2.6, 3], [25, 20, 2.6, 3], [30.4, 12.6, 1.4, 3.5],
      [4.7, 7.5, 2, 1.25], [30.8, 21.8, 2.5, 1.4], [20.2, 2.2, 3, 1.3],
    ],
  ];

  const enemyPositions = [
    [[6.8, 10.85], [10.25, 16.95], [15.75, 6.55], [18.6, 11.1], [24.3, 13.35], [27.1, 5.5], [30, 21.8]],
    [[17.0, 10.45], [18.3, 7.85], [20.3, 11.7], [25.6, 6.65], [26.65, 9.85], [9.45, 3.9], [21.4, 5.25]],
    [[22.3, 13], [17.5, 4.05], [28.2, 19.95], [31.4, 7.6]],
    [[6.8, 10.85], [10.25, 16.95], [15.75, 6.55], [18.6, 11.1], [24.3, 13.35]],
    [[27.4, 9.55], [10.1, 12.2], [17.5, 4.05], [21.4, 17], [30.45, 17.85], [31.4, 7.6], [8.6, 18.1]],
    [[17.0, 10.45], [18.3, 7.85], [20.3, 11.7], [25.6, 6.65], [26.65, 9.85], [9.45, 3.9], [21.4, 5.25]],
  ];
  const wavePositions = [[6.85, 22], [18.55, 22.25], [28.5, 15.6], [31.6, 7.9]];
  const entranceScoutPositions = [[6.85, 12.5], [6.2, 15.95]];
  const gateGuardPosition = [30.15, 15.8];

  const channelCenters = [11.65, 12.65, 11];
  const conduitLanes = [
    [[18.65, 9, 1.2, 4.9], [23.8, 20, 5.5, 1.25]],
    [[22.7, 6.8, 1.35, 6], [25.7, 17.55, 6.6, 1.2], [15.75, 11.6, 5.3, 1.25]],
    [[12.5, 13, 1.45, 6.8], [26.5, 16.85, 5.8, 1.3], [24.5, 8.9, 4.4, 1.1]],
  ];
  const ventZones = [
    [[8.65, 9, 2.35, 2.25], [19.6, 5.1, 2.6, 2.4], [26.8, 21.25, 2.4, 2.25]],
    [[12.15, 11.3, 2.7, 2.2], [22.6, 19.6, 2.4, 2.4], [28.1, 4.5, 2.55, 2.2]],
    [[10.35, 14.2, 2.7, 2.4], [20, 21.4, 2.6, 2.25], [27.4, 4.6, 2.5, 2.35]],
  ];

  const hazardLabels = {
    none: "환경 위험 없음",
    mist: "공격 거리 15% 감소",
    sparks: "일부 바닥에 주기적 전기 피해",
    pressure: "20초 후 적이 더 빠르게 접근하고 공격",
  };

  function roll(rng, sides) {
    return 1 + Math.floor(rng() * sides);
  }

  function isShelterFloor(floor) {
    return Number.isInteger(floor) && floor > 0 && floor % shelterInterval === 0;
  }

  function isBossFloor(floor) {
    return floor === floorCount || (Number.isInteger(floor) && floor >= 9 && floor < floorCount && floor % 10 === 9);
  }

  function regionForFloor(floor) {
    return regions.find((region) => floor <= region.through) ?? regions[regions.length - 1];
  }

  function getRegion(floor) {
    const { id, name, trials } = regionForFloor(floor);
    const site = sites[floor]?.name;
    const eligible = entranceTrials[floor - 1] ?? trials;
    const uncharted = floor >= frontierFloor;
    return { id, name: uncharted ? name : "하층 개척 구역", uncharted, trials: [...eligible],
      architecture: regionalArchitecture[id].title, ...(site ? { site } : {}) };
  }

  function facilityPlan(floor, region, destination, consequence, ordinaryCombat) {
    const district = facilityDistricts[region.id];
    const previous = regions[regions.indexOf(region) - 1];
    const offset = floor - (previous?.through ?? 0) - 1;
    const form = Math.floor(offset / district.features.length);
    const [introFeature, introTitle] = ordinaryCombat ? [] : openingFacilities[floor - 1] ?? [];
    const [destinationTitle, destinationFeatures] = destination ? [destination[1], destination[2]] : [];
    const trialOrdinal = floor - Math.floor(floor / shelterInterval);
    const feature = consequence?.feature ?? introFeature ?? destinationFeatures?.[trialOrdinal % 2]
      ?? district.features[offset % district.features.length];
    const equipmentType = equipment[feature];
    const lane = serviceLanes[form % serviceLanes.length];
    const branch = branchNames[Math.floor(form / serviceLanes.length)];
    const circuit = ["유입측", "환류측", "비상측", "배출측"][offset % 4];
    const fixedTitle = ordinaryCombat ? undefined : sites[floor]?.name ?? bossTrials[floor]?.title;
    const title = consequence?.title ?? introTitle ?? fixedTitle
      ?? (destinationTitle ? `${district.name} ${branch} ${lane} ${circuit} ${destinationTitle}`
        : `${district.name} ${branch} ${lane} ${equipmentType.name}`);
    return { feature, title, purpose: equipmentType.purpose, equipmentType, form, architecture: regionalArchitecture[region.id] };
  }

  function makeElevation(terrace, foldY, fold) {
    const centered = ([left, top, right, bottom]) => ({
      x: (left + right) / 2,
      y: foldY((top + bottom) / 2),
      w: right - left,
      h: bottom - top,
    });
    return {
      height: terraceHeight,
      title: terrace.title,
      decks: terrace.decks.map(centered),
      stairs: terrace.stairs.map((row) => ({
        ...centered(row),
        axis: row[4],
        rise: row[4] === "y" ? row[5] * fold : row[5],
      })),
    };
  }

  function inside(rect, x, y) {
    return Math.abs(rect.x - x) <= rect.w / 2 + edgeTolerance
      && Math.abs(rect.y - y) <= rect.h / 2 + edgeTolerance;
  }

  function overlaps(a, b, margin = 0) {
    return Math.abs(a.x - b.x) < (a.w + b.w) / 2 + margin
      && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + margin;
  }

  function isDry(elevation, terrain, x, y, radius = 0) {
    const reach = radius + edgeTolerance;
    for (const water of terrain) {
      if (water.kind !== "water") continue;
      const halfWidth = water.w / 2;
      const dx = Math.max(0, Math.abs(x - water.x) - halfWidth);
      if (dx > reach) continue;
      const halfHeight = water.h / 2;
      const dy = Math.max(0, Math.abs(y - water.y) - halfHeight);
      if (dy > reach || (dx && dy && Math.hypot(dx, dy) > reach)) continue;

      const left = Math.max(x - radius, water.x - halfWidth);
      const top = Math.max(y - radius, water.y - halfHeight);
      const right = Math.min(x + radius, water.x + halfWidth);
      const bottom = Math.min(y + radius, water.y + halfHeight);
      const supports = (rect) => inside(rect, left, top) && inside(rect, right, bottom);
      if (terrain.some((part) => part.kind === "bridge" && supports(part))) continue;
      if (elevation?.decks.some(supports)) continue;
      return false;
    }
    return true;
  }

  function surfaceAt(elevation, x, y) {
    for (const stair of elevation.stairs) if (inside(stair, x, y)) return stair;
    for (const deck of elevation.decks) if (inside(deck, x, y)) return deck;
    return undefined;
  }

  function surfaceHeight(elevation, surface, x, y) {
    if (!surface) return 0;
    if (!surface.axis) return elevation.height;
    const fraction = surface.axis === "x"
      ? (x - surface.x) / surface.w
      : (y - surface.y) / surface.h;
    return elevation.height * Math.max(0, Math.min(1, 0.5 + fraction * surface.rise));
  }

  function heightAt(elevation, x, y) {
    return elevation ? surfaceHeight(elevation, surfaceAt(elevation, x, y), x, y) : 0;
  }

  function canTraverse(elevation, fromX, fromY, toX, toY) {
    if (!elevation) return true;
    const dx = toX - fromX;
    const dy = toY - fromY;
    const minX = Math.min(fromX, toX);
    const maxX = Math.max(fromX, toX);
    const minY = Math.min(fromY, toY);
    const maxY = Math.max(fromY, toY);
    let cuts;
    const split = (rect, t) => {
      if (t > 0 && t < 1 && inside(rect, fromX + dx * t, fromY + dy * t)) cuts.push(t);
    };

    // Elevation is linear within a surface. A jump at any shared boundary is a wall.
    for (const surfaces of [elevation.decks, elevation.stairs]) {
      for (const rect of surfaces) {
        const left = rect.x - rect.w / 2;
        const right = rect.x + rect.w / 2;
        const top = rect.y - rect.h / 2;
        const bottom = rect.y + rect.h / 2;
        if (maxX < left - edgeTolerance || minX > right + edgeTolerance
            || maxY < top - edgeTolerance || minY > bottom + edgeTolerance) continue;
        cuts ??= [0, 1];
        if (dx) {
          split(rect, (left - fromX) / dx);
          split(rect, (right - fromX) / dx);
        }
        if (dy) {
          split(rect, (top - fromY) / dy);
          split(rect, (bottom - fromY) / dy);
        }
      }
    }
    if (!cuts) return true;
    if (cuts.length > 2) cuts.sort((a, b) => a - b);
    let previous = heightAt(elevation, fromX, fromY);
    for (let index = 1; index < cuts.length; index += 1) {
      const start = cuts[index - 1];
      const end = cuts[index];
      if (end - start <= edgeTolerance) continue;
      const middle = (start + end) / 2;
      const surface = surfaceAt(elevation, fromX + dx * middle, fromY + dy * middle);
      const next = surfaceHeight(elevation, surface, fromX + dx * start, fromY + dy * start);
      if (Math.abs(previous - next) > edgeTolerance) return false;
      previous = surfaceHeight(elevation, surface, fromX + dx * end, fromY + dy * end);
    }
    return Math.abs(previous - heightAt(elevation, toX, toY)) <= edgeTolerance;
  }

  function clearOfElevationEdges(elevation, rect, margin) {
    if (!elevation) return true;
    if (elevation.stairs.some((stair) => overlaps(stair, rect, margin))) return false;
    if (!elevation.decks.some((deck) => overlaps(deck, rect, margin))) return true;
    return elevation.decks.some((deck) => Math.abs(deck.x - rect.x) + rect.w / 2 + margin <= deck.w / 2
      && Math.abs(deck.y - rect.y) + rect.h / 2 + margin <= deck.h / 2);
  }

  function placeEnemies(stage, occupied, clearance) {
    const { elevation, obstacles, terrain, width, height } = stage;
    for (const enemy of [...stage.enemies, ...stage.wave, ...stage.reinforcements]) {
      const radius = enemy.kind === "boss" ? 0.60 : clearance;
      const clear = ({ x, y }) => {
        if (x < 0.78 || y < 0.78 || x > width - 0.78 || y > height - 0.78 || !isDry(elevation, terrain, x, y, radius)) return false;
        const footprint = { x, y, w: 0, h: 0 };
        return clearOfElevationEdges(elevation, footprint, radius)
          && !obstacles.some((obstacle) => overlaps(obstacle, footprint, radius))
          && occupied.every((spot) => Math.hypot(x - spot.x, y - spot.y) >= 0.96);
      };
      if (!clear(enemy)) {
        const top = elevation?.height ?? 0;
        const preferred = heightAt(elevation, enemy.x, enemy.y) >= top / 2 ? top : 0;
        let point;
        let fallback;
        for (const [x, y] of placementOffsets) {
          const candidate = { x: enemy.x + x, y: enemy.y + y };
          const sameTier = heightAt(elevation, candidate.x, candidate.y) === preferred;
          if ((!sameTier && fallback) || !clear(candidate)) continue;
          if (sameTier) {
            point = candidate;
            break;
          }
          fallback = candidate;
        }
        point ??= fallback;
        if (!point) {
          let nearest = Infinity;
          for (let y = 1.0; y < height - 0.78; y += 0.8) {
            for (let x = 1.0; x < width - 0.78; x += 0.8) {
              const score = Math.hypot(x - enemy.x, y - enemy.y) + (heightAt(elevation, x, y) === preferred ? 0 : 4);
              if (score >= nearest || !clear({ x, y })) continue;
              point = { x, y };
              nearest = score;
            }
          }
        }
        if (point) Object.assign(enemy, point);
      }
      occupied.push(enemy);
    }
  }

  function createTerrain({ geometry, theme, layout, profile, waterway, foldY, transmission, terraced, boss, macro }) {
    const terrain = [];
    const water = theme === "sluice" || transmission;
    if (water) {
      const x = channelCenters[geometry] + profile.bank;
      const w = layout.offsets[0] < 0 ? 2.45 : 2.8;
      const channel = (cx, from, to, span) => terrain.push({
        x: cx, y: foldY((from + to) / 2), w: span, h: to - from, kind: "water",
      });
      const bridge = (cx, y, span) => terrain.push({ x: cx, y: foldY(y), w: span + 2.2, h: 2.65, kind: "bridge" });
      if (waterway === "across") {
        const riverY = foldY(boss ? 7.2 : 10.5);
        terrain.push({ x: width / 2, y: riverY, w: width, h: w, kind: "water" });
        const secondBridge = terraced ? 12.6 : macro <= 3 ? 21.8 : 26.8;
        for (const bridgeX of [7.3, secondBridge]) {
          terrain.push({ x: bridgeX, y: riverY, w: 2.75, h: w + 2.2, kind: "bridge" });
        }
      } else if (waterway === "bend") {
        const upper = x - 1.4;
        const lower = x + 2.8;
        const topOfBend = height / 2 - w / 2;
        const bottomOfBend = height / 2 + w / 2;
        channel(upper, 0, topOfBend, w);
        channel((upper + lower) / 2, topOfBend, bottomOfBend, lower - upper + w);
        channel(lower, bottomOfBend, height, w);
        for (const y of profile.crossings) bridge(y < height / 2 ? upper : lower, y, w);
      } else if (waterway === "split") {
        const west = x - 1.30;
        const east = x + 5.10;
        channel(west, 0, height, 2.05);
        channel(east, 0, height, 1.95);
        for (const y of profile.crossings) bridge(west, y, 2.05);
        for (const y of [6.1, 20.6]) bridge(east, y, 1.95);
      } else {
        channel(x, 0, height, w);
        for (const y of profile.crossings) bridge(x, y, w);
      }
    }

    if (theme === "sluice") return terrain;
    const kind = theme === "relay" ? "conduit" : "vent";
    const zones = kind === "conduit" ? conduitLanes[geometry] : ventZones[geometry];
    for (const [index, [x, y, w, h]] of zones.entries()) {
      const phase = (0.08 + index * 0.31 + (layout.fold < 0 ? 0.18 : 0) + (layout.offsets[0] > 0 ? 0.11 : 0)) % 1;
      const zone = { x: x + layout.offsets[index] * 0.42, y: foldY(y), w, h, kind, phase };
      const crossesWaterway = terrain.some((part) => (part.kind === "water" || part.kind === "bridge") && overlaps(part, zone));
      if (!crossesWaterway) terrain.push(zone);
    }
    return terrain;
  }

  function fitRoom(stage, [targetWidth, targetHeight]) {
    const scaleX = targetWidth / stage.width;
    const scaleY = targetHeight / stage.height;
    const shapes = [...stage.terrain, ...stage.obstacles, ...(stage.elevation?.decks ?? []), ...(stage.elevation?.stairs ?? [])];
    const points = [stage.spawn, ...stage.items, ...stage.enemies, ...stage.wave, ...stage.reinforcements];
    if (stage.storySocket) points.push(stage.storySocket);
    if (stage.hold) {
      stage.hold.radius *= Math.min(scaleX, scaleY);
      points.push(stage.hold);
    }
    for (const point of [...points, ...shapes]) {
      point.x *= scaleX;
      point.y *= scaleY;
    }
    for (const shape of shapes) {
      shape.w *= scaleX;
      shape.h *= scaleY;
      if (stage.number <= 4 && shape.kind === "bridge") {
        if (stage.floorPlan.id === "across") shape.w = Math.max(2.15, shape.w);
        else shape.h = Math.max(2.15, shape.h);
      }
    }
    for (const stair of stage.elevation?.stairs ?? []) {
      if (stair.axis !== "y") continue;
      const low = stair.y - stair.rise * stair.h / 2;
      const landing = stair.rise > 0 ? low : targetHeight - low;
      const trim = 1.35 - landing;
      if (trim <= 0) continue;
      stair.y += stair.rise * trim / 2;
      stair.h -= trim;
    }
    stage.width = targetWidth;
    stage.height = targetHeight;
  }

  function mapProposal(planning, context) {
    const manual = Number.isInteger(planning);
    if (!manual && !Number.isSafeInteger(planning?.seed)) return null;
    const plan = manual ? { structureIndex: planning } : window.BrassenMapPlanner?.plan?.({ ...context, seed: planning?.seed });
    if (!plan) return null;
    const structureIndex = Number.isInteger(plan.structureIndex) && plan.structureIndex >= 0 && plan.structureIndex < floorPlans.length
      ? plan.structureIndex : null;
    if (manual && structureIndex === null) return null;
    const manualSizes = [[-1, 1], [0, 2], [2, -1], [1, 0]];
    const [widthOffset, depthOffset] = manual ? manualSizes[structureIndex] : [plan.widthOffset, plan.depthOffset];
    const boundedOffset = (value) => Number.isFinite(value) ? Math.max(-2, Math.min(2, Math.round(value))) : 0;
    return { structureIndex, widthOffset: boundedOffset(widthOffset), depthOffset: boundedOffset(depthOffset),
      laneBias: Math.max(-1, Math.min(1, boundedOffset(plan.laneBias))) };
  }

  function layoutAccess(stage, spacing = 0.8, radius = 0.55) {
    const { width, height, elevation, terrain, obstacles, spawn } = stage;
    const columns = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const cells = columns * rows;
    const reached = new Uint8Array(cells);
    const queue = [];
    const open = (x, y, clearance) => x >= clearance && y >= clearance && x <= width - clearance && y <= height - clearance
      && isDry(elevation, terrain, x, y, clearance)
      && obstacles.every((wall) => {
        const dx = Math.max(0, Math.abs(x - wall.x) - wall.w / 2);
        const dy = Math.max(0, Math.abs(y - wall.y) - wall.h / 2);
        return dx * dx + dy * dy >= clearance * clearance;
      });
    const point = (index) => ({ x: (index % columns + 0.5) * spacing, y: (Math.floor(index / columns) + 0.5) * spacing });
    const link = (from, to, clearance) => open(to.x, to.y, clearance)
      && open((from.x + to.x) / 2, (from.y + to.y) / 2, clearance)
      && canTraverse(elevation, from.x, from.y, to.x, to.y);
    if (!open(spawn.x, spawn.y, 0.29)) return null;
    const nearby = ({ x, y }, accept) => {
      const col = Math.floor(x / spacing);
      const row = Math.floor(y / spacing);
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(columns - 1, col + 1); c++) {
          const index = r * columns + c;
          if (accept(index, point(index))) return true;
        }
      }
      return false;
    };
    const enqueue = (index) => { reached[index] = 1; queue.push(index); };
    nearby(spawn, (index, next) => {
      if (link(spawn, next, radius)) enqueue(index);
      return false;
    });
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const index = queue[cursor];
      const from = point(index);
      const col = index % columns;
      const edges = [index - columns, index + columns, col ? index - 1 : -1, col < columns - 1 ? index + 1 : -1];
      for (const next of edges) {
        if (next >= 0 && next < cells && !reached[next] && link(from, point(next), radius)) enqueue(next);
      }
    }
    const reaches = (target, clearance) => nearby(target, (index, from) => reached[index] && link(from, target, clearance));
    return { reaches, link, points: () => queue.map(point) };
  }

  function layoutTargets(stage) {
    const targets = [...stage.items, ...stage.enemies, ...stage.wave, ...stage.reinforcements];
    if (stage.hold) targets.push(stage.hold);
    if (stage.storySocket) targets.push(stage.storySocket);
    if (stage.gateMarker) targets.push(stage.gateMarker);
    return targets;
  }

  function targetClearance(target) {
    return target.kind === "boss" ? 0.58 : 0.44;
  }

  function reachableLayout(stage) {
    const access = layoutAccess(stage);
    return access !== null && layoutTargets(stage).every((target) => access.reaches(target, targetClearance(target)));
  }

  function exitGateWalls(exit) {
    const x = exit.x + 0.64;
    return [
      { x, y: exit.y, w: 0.28, h: 1.18, gateLeaf: true, gateDecor: true },
      { x, y: exit.y - 0.86, w: 0.29, h: 0.54, gateDecor: true },
      { x, y: exit.y + 0.86, w: 0.29, h: 0.54, gateDecor: true },
    ];
  }

  function combatExit(stage, occupants = []) {
    const { width, height, elevation, terrain, obstacles, spawn, roomGraph } = stage;
    const existing = stage.gateMarker ?? stage.items.find(({ kind }) => kind === "exit");
    const end = roomGraph?.rooms.find(({ id }) => id === roomGraph.exit);
    const preferred = end ? { x: end.right - 1.75, y: end.y } : { x: width - 2, y: height * 0.56 };
    const targets = layoutTargets(stage);
    const clearance = 0.33;

    function find(spacing, radius) {
      const access = layoutAccess(stage, spacing, radius);
      if (!access) return null;
      const reachable = targets.filter((target) => access.reaches(target, targetClearance(target)));
      const spawnDistance = (point) => Math.hypot(point.x - spawn.x, point.y - spawn.y);
      const preference = (point) => Math.hypot(point.x - preferred.x, point.y - preferred.y);
      const canPlace = (point) => {
        const { x, y } = point;
        if (spawnDistance(point) < 3.5 || !access.reaches(point, clearance)) return false;
        const footprint = { x: x + 0.49, y, w: 1.1, h: 2.42 };
        if (x + 1.19 > width - clearance || y - 1.21 < clearance || y + 1.21 > height - clearance
            || !clearOfElevationEdges(elevation, footprint, clearance)
            || obstacles.some((wall) => overlaps(wall, footprint, 0.08))) return false;
        for (const side of [-1, 1]) {
          if (!isDry(elevation, terrain, x + 0.64, y + side * 1.16, clearance)) return false;
        }
        const threshold = { x: x + 0.64, y };
        const beyond = { x: x + 1.19, y };
        if (!access.link(point, threshold, clearance) || !access.link(threshold, beyond, clearance)) return false;

        const walls = exitGateWalls(point);
        if (occupants.some((actor) => walls.some((wall) => overlaps(wall, { ...actor, w: 0, h: 0 }, 0.58)))) {
          return false;
        }
        const closed = layoutAccess({ ...stage, obstacles: [...obstacles, ...walls] }, spacing, radius);
        return closed !== null && closed.reaches(point, clearance)
          && reachable.every((target) => closed.reaches(target, targetClearance(target)));
      };

      const direct = [existing, preferred].find((point) => point && canPlace(point));
      return direct ?? access.points().sort((a, b) => preference(a) - preference(b)).find(canPlace) ?? null;
    }

    const anchor = find(0.8, 0.55) ?? find(0.5, clearance);
    return anchor ? { x: anchor.x, y: anchor.y } : null;
  }

  function rebuildLayout(base, context) {
    const planner = window.TowerFloorGraph;
    if (typeof planner?.rebuild !== "function") return null;
    const isPoint = (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y);
    const isRect = (rect) => isPoint(rect) && Number.isFinite(rect.w) && rect.w > 0
      && Number.isFinite(rect.h) && rect.h > 0;
    const hasRects = (rects) => Array.isArray(rects) && rects.every(isRect);
    const position = (value, point) => ({ ...value, x: point.x, y: point.y });
    const groups = ["items", "enemies", "wave", "reinforcements"];
    const anchors = ["spawn", "hold", "storySocket"];
    const terrainKinds = ["water", "bridge", "conduit", "vent"];
    for (let attempt = 0; attempt < 8; attempt++) {
      const layout = planner.rebuild(base, { ...context, attempt });
      if (!layout || !layout.roomGraph || !Number.isFinite(layout.width) || layout.width <= 0
          || !Number.isFinite(layout.height) || layout.height <= 0
          || !hasRects(layout.obstacles) || !hasRects(layout.terrain)
          || !layout.terrain.every(({ kind }) => terrainKinds.includes(kind))
          || base.terrain.some(({ kind }) => !layout.terrain.some((region) => region.kind === kind))
          || Boolean(base.elevation) !== Boolean(layout.elevation)
          || anchors.some((key) => base[key] && !isPoint(layout[key]))) continue;

      const { elevation } = layout;
      if (elevation && (!Number.isFinite(elevation.height) || elevation.height <= 0
          || !hasRects(elevation.decks) || !hasRects(elevation.stairs)
          || elevation.stairs.some(({ axis, rise }) => !["x", "y"].includes(axis) || Math.abs(rise) !== 1))) continue;
      if (!groups.every((key) => Array.isArray(layout[key]) && layout[key].length === base[key].length
          && layout[key].every(isPoint))) continue;
      if (layout.gateMarker && !isPoint(layout.gateMarker)) continue;

      const stage = { ...base, width: layout.width, height: layout.height, elevation: elevation ?? null,
        obstacles: layout.obstacles, terrain: layout.terrain, roomGraph: layout.roomGraph };
      if (layout.gateMarker) stage.gateMarker = layout.gateMarker;
      for (const key of anchors) if (base[key]) stage[key] = position(base[key], layout[key]);
      for (const key of groups) stage[key] = base[key].map((value, index) => position(value, layout[key][index]));
      if (stage.hold && Number.isFinite(layout.hold.radius) && layout.hold.radius > 0) {
        stage.hold.radius = Math.min(stage.hold.radius, layout.hold.radius);
      }
      if (typeof layout.floorPlan?.title === "string") stage.floorPlan = layout.floorPlan;
      const detail = layout.rolls?.at(-2)?.detail;
      if (typeof detail === "string") {
        stage.rolls = base.rolls.map((roll, index) => index === base.rolls.length - 2 ? { ...roll, detail } : roll);
      }

      if (elevation) {
        const heightFor = (room, point) => heightAt(room.elevation, point.x, point.y);
        const sameTier = (previous, next) => (heightFor(base, previous) >= base.elevation.height / 2)
          === (heightFor(stage, next) >= elevation.height / 2);
        const upperSentry = (room) => room.enemies.some((enemy) => enemy.kind === "sentry"
          && heightFor(room, enemy) >= room.elevation.height / 2);
        if (!sameTier(base.spawn, stage.spawn)
            || (stage.hold && !sameTier(base.hold, stage.hold))
            || stage.items.some((item, index) => !sameTier(base.items[index], item))
            || stage.enemies.some((enemy, index) => enemy.gateGuard && !sameTier(base.enemies[index], enemy))
            || (stage.kind === "relay" && upperSentry(base) && !upperSentry(stage))) continue;
      }
      const exit = stage.items.find(({ kind }) => kind === "exit");
      const closedStage = exit ? { ...stage, obstacles: [...stage.obstacles, ...exitGateWalls(exit)] } : stage;
      if (reachableLayout(closedStage)) return stage;
    }
    return null;
  }

  function facilityRoomSize(plan, dryRoom) {
    const [baseWidth, baseHeight] = dryRoom?.widthAndDepth ?? [width, height];
    const [widthBias, heightBias] = plan.equipmentType.aspect;
    const [regionWidth, regionHeight] = plan.architecture.room;
    const span = plan.form % 5 - 2;
    const depth = Math.floor(plan.form / 3) % 5 - 2;
    return [Math.max(dryRoom ? 25 : 32, baseWidth + widthBias + regionWidth + span),
      Math.max(dryRoom ? 21 : 25, baseHeight + heightBias + regionHeight + depth)];
  }

  function installStructure(stage, plan, foldY, occupied) {
    const shape = stage.elevation ? plan.underneath : plan.walls;
    const scaleX = stage.width / width;
    const scaleY = stage.height / height;
    const protectedAreas = [...occupied.map((spot) => ({ ...spot, w: 1.6, h: 1.6 })),
      ...stage.enemies.filter((enemy) => enemy.gateGuard || enemy.target || enemy.kind === "boss")
        .map((spot) => ({ ...spot, w: 1.7, h: 1.7 }))];
    if (stage.hold) protectedAreas.push({ ...stage.hold, w: stage.hold.radius * 2 + 0.9, h: stage.hold.radius * 2 + 0.9 });
    const walls = shape.map(([x, y, w, h]) => ({
      x: (stage.kind === "boss" && plan.id === "loop" ? x - 1.6 : x) * scaleX,
      y: foldY(y) * scaleY, w: w * scaleX, h: h * scaleY, structural: true,
    })).filter((wall) => !protectedAreas.some((area) => overlaps(wall, area, 0.42))
      && clearOfElevationEdges(stage.elevation, wall, 1.6)
      && !stage.terrain.some((part) => (part.kind === "water" || part.kind === "bridge") && overlaps(wall, part, 1.65)));
    stage.obstacles = stage.obstacles.filter((obstacle) => !walls.some((wall) => overlaps(obstacle, wall, 1.95)));
    stage.obstacles.push(...walls);
  }

  function placeFacility(stage, plan, occupied, preserveFootprint, laneBias = 0) {
    const { width: mapWidth, height: mapHeight, elevation, terrain } = stage;
    const signature = stage.number * 37 % 1333;
    const lane = [0.30, 0.52, 0.67, 0.41][(stage.number + plan.form) % 4];
    const row = [0.26, 0.69, 0.41, 0.57, 0.76][(stage.number * 3 + plan.form) % 5];
    const [regionX, regionY] = stage.kind === "boss" ? [0, 0] : plan.architecture.machine;
    const x = mapWidth * (lane + regionX + laneBias * 0.07) + (signature % 9 - 4) * 0.12;
    const y = mapHeight * (row + regionY) + (Math.floor(signature / 9) % 9 - 4) * 0.12;
    const distanceToBay = (rect) => Math.hypot(rect.x - x, rect.y - y);
    if (!preserveFootprint) {
      const [wide, deep] = plan.equipmentType.footprint;
      const along = wide + (signature % 37 - 18) * 0.025;
      const across = deep + (Math.floor(signature / 37) - 18) * 0.025;
      const turned = plan.form % 3 === 1;
      const w = turned ? across : along;
      const h = turned ? along : across;
      const protectedActors = stage.enemies.filter((enemy) => enemy.gateGuard || enemy.target || enemy.kind === "boss");
      const protectedAreas = [...occupied.map((spot) => ({ ...spot, w: 1.6, h: 1.6 })),
        ...protectedActors.map((spot) => ({ ...spot, w: 1.55, h: 1.55 }))];
      protectedAreas.push({ ...stage.spawn, w: 4.4, h: 3.6 });
      if (stage.hold) protectedAreas.push({ ...stage.hold, w: stage.hold.radius * 2 + 1.6, h: stage.hold.radius * 2 + 1.6 });

      const admissible = (rect) => rect.x - rect.w / 2 > 1.95 && rect.x + rect.w / 2 < mapWidth - 1.95
        && rect.y - rect.h / 2 > 1.95 && rect.y + rect.h / 2 < mapHeight - 1.95
        && !protectedAreas.some((area) => overlaps(area, rect, 0.38))
        && !stage.obstacles.some((wall) => wall.structural && overlaps(wall, rect, 2.0))
        && !terrain.some((part) => overlaps(part, rect, part.kind === "water" || part.kind === "bridge" ? 1.95 : 0.45))
        && clearOfElevationEdges(elevation, rect, 1.8);

      const candidates = [{ x, y, w, h }];
      for (const shift of [1.8, 3.4, 5.2, 7.0, 9.1]) {
        for (let index = 0; index < 8; index += 1) {
          const angle = (index + plan.form) * Math.PI / 4;
          candidates.push({ x: x + Math.cos(angle) * shift, y: y + Math.sin(angle) * shift, w, h });
        }
      }
      const bay = candidates.find(admissible) ?? candidates.map((point) => ({ ...point, w: point.w * 0.70, h: point.h * 0.70 })).find(admissible);
      if (bay) {
        // A large machine takes over the existing cover in its bay, leaving aisles around it.
        stage.obstacles = stage.obstacles.filter((wall) => wall.structural || !overlaps(wall, bay, 1.95));
        stage.obstacles.push({ ...bay, fixture: plan.feature });
        return;
      }
    }
    const landmark = stage.obstacles.filter((wall) => !wall.structural)
      .reduce((best, wall) => !best || distanceToBay(wall) < distanceToBay(best) ? wall : best, null);
    if (!landmark) return;
    if (!preserveFootprint) {
      // Compact in-place installation when there is no bay with two open aisles.
      const insetW = landmark.w * (0.19 + signature % 17 * 0.020);
      const insetH = landmark.h * (0.16 + Math.floor(signature / 17) % 17 * 0.021);
      landmark.x += insetW * (stage.number % 2 ? 0.32 : -0.32);
      landmark.y += insetH * (plan.form % 2 ? 0.32 : -0.32);
      landmark.w -= insetW;
      landmark.h -= insetH;
    }
    landmark.fixture = plan.feature;
  }

  function floorChanges(stage, variation, minor, floor) {
    const enemies = [...variation.enemies];
    const wave = [...(variation.wave ?? [])];
    const elites = new Set();
    let detail;

    if (stage === 0 || stage === 3) {
      if (minor % 2 === 0) wave.push(minor === 2 ? "runner" : "guard");
      if (minor >= 3) elites.add(0);
      if (minor === 4) elites.add(1);
      detail = ["증원 3기", "증원 4기", "정예 경비 1기 · 증원 3기", "정예 경비 2기 · 증원 4기"][minor - 1];
    } else if (stage !== 2) {
      if (minor >= 2) enemies.push(minor === 2 ? "runner" : "guard");
      if (minor >= 3) elites.add(enemies.length - 1);
      if (minor === 4) enemies.push("runner");
      detail = ["기본 순찰", "기동 순찰 1기 추가", "정예 순찰 1기 추가", "순찰 2기 추가 · 정예 포함"][minor - 1];
    } else {
      if (minor >= 3) elites.add(0);
      if (minor % 2 === 0) enemies.push(minor === 2 ? "runner" : "sentry");
      detail = ["수호자 표준형", "기동 보조기 1기 추가", "수호자 강화형", "강화 수호자 · 사격 보조기 추가"][minor - 1];
    }

    if (floor === 1 && (stage === 0 || stage === 1)) {
      const patrol = entrancePatrols[minor - 1];
      enemies[0] = patrol.front[0];
      enemies[1] = patrol.front[1];
      enemies[3] = patrol.support;
      detail = patrol.name + " · " + detail;
    }

    return { enemies, elites, wave, detail };
  }

  const specialistUnlocks = { skirmisher: 2, breaker: 4, marksman: 6, saboteur: 11 };
  const specialistFormations = {
    sluice: ["skirmisher", "saboteur", "breaker", "marksman"],
    relay: ["marksman", "saboteur", "skirmisher", "breaker"],
    forge: ["breaker", "skirmisher", "marksman", "saboteur"],
  };

  function mixCombatRoster(changes, floor, theme, macro, placement, minor) {
    const eligible = specialistFormations[theme].filter((kind) => specialistUnlocks[kind] <= floor);
    const introduction = eligible.find((kind) => specialistUnlocks[kind] === floor);
    // Reuse the floor rolls so enemy specialties do not consume another draw or shift the map dice.
    const signature = (Math.imul(floor, 0x45d9f3b) ^ Math.imul(macro, 0x119de1f3) ^ (placement << 8) ^ minor) >>> 0;
    const specialist = introduction ?? (signature % 4 === 0 ? eligible[(signature >>> 16) % eligible.length] : eligible[0]);
    const support = eligible.filter((kind) => kind !== specialist);
    const supportAt = (index) => support[((signature >>> 10) + index) % support.length];
    changes.enemies[3 + (signature & 1)] = specialist;
    if (floor >= 6) changes.enemies[5] = supportAt(0);
    if (floor >= 11 || (floor >= 4 && minor >= 3)) {
      changes.wave[minor % 3] = supportAt(floor >= 11 ? 1 : 0);
    }
    if (floor >= frontierFloor && macro >= 4) changes.wave[(minor + 1) % 3] = supportAt(2);
    const name = floor < frontierFloor ? rosterNames.human[specialist] : creatureSpecialists[theme][specialist];
    changes.detail = name + " 편성 · " + changes.detail;
  }

  function promoteEnemy(kind, floor, macro, index) {
    if (floor >= 9 && kind === "guard" && index === 0) return "warden";
    if (floor >= 7 && kind === "guard" && index === 3 && macro % 2 === 1) return "mortar";
    if (floor >= 4 && kind === "guard" && index <= 1 && macro % 2 === 0) return "lancer";
    return kind;
  }

  function gateGuardKind(floor, macro, final) {
    if (final) return "warden";
    if (floor >= 19) return ["warden", "lancer", "mortar"][(macro - 1) % 3];
    if (floor >= 4 && macro % 2 === 0) return "lancer";
    return "guard";
  }

  function createFloor(floor, rng = Math.random, kind, storyChoices = {}, planning) {
    let trialRoll = 0;
    let stage;
    const final = floor === floorCount;
    const bossFloor = isBossFloor(floor);
    const ordinaryCombat = kind === "combat" && !bossFloor && !isShelterFloor(floor);
    const region = getRegion(floor);
    const regionSpec = regionForFloor(floor);
    const trials = region.trials;
    const requestedTrial = trials.indexOf(kind);
    const route = storyRoutes[floor];
    const storyChoice = storyChoices?.[route?.chapter];
    const consequence = !kind && route && Object.hasOwn(route.branches, storyChoice) ? route.branches[storyChoice] : null;
    const earlyPlan = floor <= mapPlanningLimit && planning != null && !isShelterFloor(floor);
    const drawn = earlyPlan ? [] : null;
    const next = drawn ? () => { const value = rng(); drawn.push(value); return value; } : rng;
    if (bossFloor) {
      stage = 2;
    } else if (ordinaryCombat) {
      stage = 0;
    } else if (floor <= 3) {
      stage = floorKinds.indexOf(consequence?.kind ?? trials[0]);
      // Keep the seeded environment and layout aligned with the previous floor-3 draw stream.
      if (floor === 3 && requestedTrial < 0) next();
    } else {
      trialRoll = requestedTrial < 0 ? roll(next, trials.length) : requestedTrial + 1;
      stage = floorKinds.indexOf(consequence?.kind ?? trials[trialRoll - 1]);
      if (consequence) trialRoll = 0;
    }

    const geometry = geometryForTrial[stage];
    const trialKind = floorKinds[stage];
    const template = floors[stage];
    const opening = consequence ?? openingStages[floor]?.[trialKind];
    const authoredBoss = final ? finalTrial : stage === 2 ? bossTrials[floor] : null;
    const bossTrial = stage === 2 ? authoredBoss ?? standardBoss : null;
    const macro = final ? 1 : roll(next, 6);
    const placement = final ? 1 : roll(next, 4);
    const minor = final ? 1 : roll(next, 4);
    const regionalDestinations = destinations[region.id];
    const bossDestinations = bossTrial && !authoredBoss ? Object.values(regionalDestinations).slice(0, 3) : [];
    const independentDestinations = ordinaryCombat ? Object.values(regionalDestinations) : bossDestinations;
    // The independent destination draw preserves the environment, geometry and roster draw order.
    const destinationRoll = independentDestinations.length ? roll(next, independentDestinations.length) : 0;
    const rolledDestination = independentDestinations[destinationRoll - 1]
      ?? (floor > 4 && trialRoll && !sites[floor] ? regionalDestinations[trialKind] : null);
    const facility = facilityPlan(floor, regionSpec, rolledDestination, consequence, ordinaryCombat);
    const variation = final ? finalTrial.environment : template.variations[macro - 1];
    const layout = layouts[placement - 1];
    const profile = routeProfiles[placement - 1];
    const foldY = (y) => layout.fold === 1 ? y : height - y;
    const gold = template.baseGold + 3 * (minor - 1);
    const distributionFloor = stage === 1;
    const hasDivider = geometry === 1;
    const fixedTheme = ordinaryCombat ? undefined : sites[floor]?.theme;
    const theme = opening?.theme ?? fixedTheme ?? rolledDestination?.[0]
      ?? (hasDivider ? regionSpec.dividerTheme : regionSpec.theme);
    const bossProfile = bossTrial ? profileForBoss(floor, theme, macro, placement, minor) : null;
    const bossName = authoredBoss?.bossName ?? bossProfile?.name;
    const spawnEnemy = (kind, [x, y], elite = false, index = 0) => ({
      x, y: foldY(y), kind, elite, ...combatant(floor, kind, index, macro, theme),
    });
    const changes = floorChanges(stage, variation, minor, floor);
    if (stage === 0 && floor >= specialistUnlocks.skirmisher) mixCombatRoster(changes, floor, theme, macro, placement, minor);
    const transmission = theme === "relay" && region.id === "transmission" && !consequence?.dry;
    const waterMap = theme === "sluice" || transmission;
    const dryRoom = !waterMap && !bossTrial && !final && floor !== 2 ? dryProfiles[placement - 1] : null;
    const waterway = waterMap ? profile.waterway : null;
    const raisedCombat = ordinaryCombat && (floor === 2 || (floor > 2 && macro >= 5 && placement >= 3));
    const terrace = floor > 1 && !final && (hasDivider || stage === 3 || raisedCombat) ? terraces[placement - 1] : null;
    const elevation = terrace ? makeElevation(terrace, foldY, layout.fold) : null;
    const context = {
      floor, seed: planning?.seed, choices: storyChoices ?? {}, kind: trialKind, theme,
      macro, placement, minor, district: region.id, shelter: false,
    };
    const proposal = earlyPlan ? mapProposal(planning, context) : null;
    // Independent wall recipes fit flat dry rooms; wet and terraced rooms reflow their authored crossings together.
    const plannedIndex = proposal?.structureIndex
      ?? (Number.isInteger(planning) && floor > mapPlanningLimit && !consequence ? planning : null);
    const plannedStructure = dryRoom && !elevation && plannedIndex !== null ? floorPlans[plannedIndex] : null;
    const structure = plannedStructure ?? floorPlans[placement - 1];
    const layoutTitle = waterMap ? ["세로 수로", "가로 수로", "굽은 수로", "나란한 두 수로"][placement - 1] : structure.title;
    const exit = { x: 31.95, y: foldY(15.5 + 0.25 * layout.offsets[0]), kind: "exit" };
    const remoteCells = terrace?.cells ?? [[24.65 + 0.4 * layout.offsets[0], 11.95 + 0.33 * layout.offsets[1]],
      [28.5 + 0.5 * layout.offsets[1], 19.4 - 0.25 * layout.offsets[0]]];
    const items = distributionFloor
      ? [
          { x: 8 + layout.offsets[2], y: foldY(14.6), kind: "cell" },
          ...remoteCells.map(([x, y]) => ({ x, y: foldY(y), kind: "cell" })),
          exit,
        ]
      : stage === 5 ? [exit] : [];
    const reinforcements = [];
    if (hasDivider && !final) {
      reinforcements.push(spawnEnemy("runner", [10.35, 2.4]));
      reinforcements.push(spawnEnemy(promoteEnemy("guard", floor, macro, 0), [21.35, 3.65]));
      reinforcements.push(spawnEnemy("sentry", [31.8, 5.9]));
      if (macro >= 5 || minor === 4) reinforcements.push(spawnEnemy("runner", [22.4, 22.65]));
    }

    const environment = [variation.name, hazardLabels[variation.hazard]];
    if (variation.duration) environment.push(`${variation.duration}초 사수`);
    if (variation.unlockAfter) environment.push(`${variation.unlockAfter}초 후 시간 잠금 해제`, "출구 경비 제압");
    if (variation.timeLimit) environment.push(`${variation.timeLimit}초 후 증원 경보`);
    if (waterway === "across" && !elevation) environment.push(macro <= 3 ? "안쪽 건널목 개방" : "외곽 건널목 개방");
    const routeLayout = [layoutTitle];
    if (terrace) routeLayout.push(`${terrace.title} · 계단 ${elevation.stairs.length}곳`);
    else if (dryRoom) routeLayout.push(dryRoom.title);
    if (waterMap) {
      routeLayout.push(`다리 ${waterway === "split" ? 4 : profile.crossings.length}곳`);
    }
    const rolls = [
      { sides: 6, value: macro, label: rolledDestination ? "시설 상태" : template.macroLabel, detail: environment.join(" · ") },
      { sides: 4, value: placement, label: distributionFloor ? "통로와 전력 셀 배치" : "전장 지형", detail: routeLayout.join(" · ") },
      { sides: 4, value: minor, label: floor === 1 ? "입구 경비 편성" : template.minorLabel, detail: `${changes.detail} · ${gold} 금화` },
    ];
    const arrivalRoll = destinationRoll || trialRoll;
    if (arrivalRoll) {
      const challenge = bossTrial ? "수호자 격파" : floor >= frontierFloor && stage === 0 ? "무리 격파" : template.name;
      const destinationLabel = rolledDestination?.[1] ?? opening?.title ?? template.title;
      rolls.unshift({ sides: destinationRoll ? independentDestinations.length : trials.length, value: arrivalRoll,
        label: "행선지", detail: `${destinationLabel} · ${challenge}` });
    }

    const holdPosition = terrace?.hold ?? [22.5, 12.7];
    const objective = final ? finalTrial.objective : bossTrial?.objective ?? opening?.objective
      ?? (trialKind === "hold" ? `상단의 표시 구역에 머물며 ${holdTasks[theme]}`
        : elevation ? terraceObjectives[trialKind] ?? template.objective : template.objective);
    const title = final ? finalTrial.title : authoredBoss?.title ?? opening?.title
      ?? (floor <= 2 && !ordinaryCombat ? template.title : facility.title);
    const destinationLine = ordinaryCombat ? null
      : consequence?.cue[1] ?? rolledDestination?.[3] ?? (floor === 4 ? openingCues[trialKind] : null);
    const result = {
      number: floor,
      kind: trialKind,
      theme,
      region,
      facility: { feature: facility.feature, title: facility.title, purpose: facility.purpose },
      destination: destinationLine || ordinaryCombat ? { title, kind: trialKind, theme } : null,
      destinationCue: destinationLine ? { speaker: consequence?.cue[0] ?? "등반가", line: destinationLine } : null,
      floorPlan: final ? null : { id: waterMap ? waterway ?? "straight" : structure.id, title: layoutTitle },
      title,
      objective,
      bossName,
      bossProfile,
      final,
      width,
      height,
      elevation,
      storySocket: storyBossFloors.has(floor) ? { x: 30.7, y: 16.3 }
        : !ordinaryCombat && storyOperationFloors.has(floor) ? { x: 30.7, y: foldY(terrace && placement === 1 ? 9.35 : 7.15) } : null,
      spawn: { x: template.spawn[0], y: foldY(template.spawn[1]) },
      hazard: variation.hazard,
      timeLimit: variation.timeLimit,
      unlockAfter: variation.unlockAfter,
      hold: variation.duration ? { x: holdPosition[0], y: foldY(holdPosition[1]), radius: 2.25, duration: variation.duration } : null,
      rule: variation.name,
      rolls: final ? [] : rolls,
      terrain: createTerrain({ geometry, theme, layout, profile, waterway, foldY, transmission,
        terraced: Boolean(elevation), boss: Boolean(bossTrial), macro }),
      obstacles: (final ? finalTrial.obstacles : roomShapes[geometry]).flatMap(([x, y, w, h], index) => {
        if (!terrace && !bossTrial && !final && profile.replace.includes(index)) return [];
        return [{ x: x + layout.offsets[hasDivider && index < 2 ? 0 : index % layout.offsets.length], y: foldY(y), w, h }];
      }),
      enemies: changes.enemies.map((kind, index) => {
        let enemyKind = promoteEnemy(kind, floor, macro, index);
        if (bossTrial && floor >= 19 && index === 1 && kind !== "sentry") {
          enemyKind = floor >= 29 ? "warden" : "lancer";
        }
        let position = enemyPositions[stage][index];
        const entranceScout = floor === 1 && (stage === 0 ? index < entranceScoutPositions.length : stage === 4 && index === 1);
        if (floor === 1 && stage === 4) {
          if (index === 0 || enemyKind === "lancer" || enemyKind === "warden") enemyKind = "guard";
          else if (enemyKind === "mortar") enemyKind = "sentry";
        }
        const gateGuard = hasDivider && index === 3;
        if (entranceScout) position = entranceScoutPositions[index];
        if (gateGuard) {
          enemyKind = gateGuardKind(floor, macro, final);
          position = gateGuardPosition;
        } else if (terrace && kind === "sentry" && index === 2) {
          position = terrace.sentry;
        }

        const enemy = spawnEnemy(enemyKind, position, changes.elites.has(index), index);
        if (entranceScout) enemy.engaged = true;
        if (gateGuard) enemy.gateGuard = true;
        if (kind === "boss" && bossTrial) enemy.name = bossName;
        if (stage === 4 && index === 0) {
          enemy.target = true;
          if (consequence?.targetName) enemy.name = consequence.targetName;
        }
        return enemy;
      }),
      wave: changes.wave.map((kind, index) => spawnEnemy(promoteEnemy(kind, floor, macro, index), wavePositions[index], false, index)),
      items,
      reinforcements,
      gold,
    };

    if (!terrace && !bossTrial && !final) {
      result.obstacles.push(...profile.cover.map(([x, y, w, h]) => ({ x, y: foldY(y), w, h })));
    }
    const baseSize = floor === 2 ? structure.terraceSize
      : floor > 4 && !bossTrial && !final ? facilityRoomSize(facility, dryRoom)
      : dryRoom ? dryRoom.early : floor <= 4 ? profile.size : null;
    if (proposal) {
      const [roomWidth, roomDepth] = baseSize ?? [width, height];
      fitRoom(result, [Math.max(20, roomWidth + proposal.widthOffset), Math.max(17, roomDepth + proposal.depthOffset)]);
    } else if (baseSize) fitRoom(result, baseSize);

    const occupied = [result.spawn, ...items];
    if (result.storySocket) occupied.push(result.storySocket);
    const bridges = result.terrain.filter(({ kind }) => kind === "bridge");
    const stairApproach = dryRoom ? 0.84 : 0.15;
    result.obstacles = result.obstacles.filter((obstacle) => clearOfElevationEdges(elevation, obstacle, stairApproach)
      && !occupied.some((spot) => overlaps(obstacle, { ...spot, w: 0, h: 0 }, obstacleMargin))
      && !bridges.some((bridge) => overlaps(obstacle, bridge, 0.23))
      && isDry(elevation, result.terrain, obstacle.x, obstacle.y, 0)
      && !(result.hold && overlaps(obstacle, { ...result.hold, w: result.hold.radius * 2, h: result.hold.radius * 2 })));
    if (!final && (!waterMap || elevation)) installStructure(result, structure, foldY, occupied);
    if (elevation) {
      result.terrain = result.terrain.filter((part) => part.kind === "water" || part.kind === "bridge"
        || clearOfElevationEdges(elevation, part, 0.05));
    }
    if (transmission && !result.terrain.some(({ kind }) => kind === "conduit")) {
      // The dry approach to the western cell stays below every raised layout.
      const scaleX = result.width / width;
      const scaleY = result.height / height;
      result.terrain.push({ x: 6.35 * scaleX, y: foldY(14.75) * scaleY, w: 1.1 * scaleX, h: 3.2 * scaleY,
        kind: "conduit", phase: layout.fold > 0 ? 0.26 : 0.44 });
    }
    placeFacility(result, facility, occupied, floor <= 4 || final, proposal?.laneBias);
    placeEnemies(result, occupied, floor <= 4 ? 0.72 : dryRoom || !final ? 0.57 : obstacleMargin);
    if (earlyPlan && Number.isSafeInteger(context.seed)) {
      const rebuilt = rebuildLayout(result, { ...context, proposal });
      if (rebuilt) return rebuilt;
    }
    if (proposal && !reachableLayout(result)) {
      let index = 0;
      return createFloor(floor, () => drawn[index++], kind, storyChoices);
    }
    return result;
  }

  window.TowerContent = { floorCount, shelterInterval, frontierFloor, isShelterFloor, isBossFloor, getRegion, createFloor,
    heightAt, canTraverse, isDry, exitGateWalls, combatExit, routes, routeOptions };
})();
