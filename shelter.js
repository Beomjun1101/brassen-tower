(() => {
  "use strict";

  const settlements = [
    { title: "환수 물가 마을", theme: "sluice", fixture: "tank", width: 15, height: 11, cloth: "#487973", trim: "#e3bd86", layout: "well" },
    { title: "하층 교대 성당 마을", theme: "relay", fixture: "cables", width: 16, height: 11, cloth: "#626d85", trim: "#d0be9c", layout: "line" },
    { title: "주철 정비 마을", theme: "forge", fixture: "workshop", width: 14, height: 10, cloth: "#8b5641", trim: "#ebbb82", layout: "forge" },
    { title: "우회 관로 신전 마을", theme: "sluice", fixture: "clinic", width: 17, height: 12, cloth: "#687a5f", trim: "#daccad", layout: "ward" },
    { title: "중계 장터", theme: "relay", fixture: "cables", width: 15, height: 11, cloth: "#775e79", trim: "#dbc7b2", layout: "market" },
    { title: "개척선 앞 급수 마을", theme: "forge", fixture: "frontier", width: 16, height: 11, cloth: "#836e4e", trim: "#e5d3a2", layout: "supply" },
  ];

  // Plans use proportions for navigation anchors and tile units for the fixed equipment.
  const recessPlans = [
    { title: "쌍갑문 전실", width: 15, height: 10, start: [.17, .79], bench: [.66, .31],
      exit: [.85, .68], socket: [.49, .57], spine: [[.17, .79], [.17, .56], [.85, .56], [.85, .68]],
      equipment: [[.27, .13, 3.5, .8, "baffle"], [.68, .13, 3.8, .8, "baffle"], [.61, .88, 1.7, .9, "supplies"]] },
    { title: "축압조 순환실", width: 17, height: 12, start: [.14, .59], bench: [.76, .24],
      exit: [.83, .75], socket: [.25, .71], spine: [[.14, .59], [.14, .25], [.83, .25], [.83, .75], [.24, .75]],
      equipment: [[.51, .54, 4.0, 3.2, "tank"], [.60, .84, 2.1, .75, "valves"]] },
    { title: "케이블 릴 회랑", width: 18, height: 9, start: [.12, .61], bench: [.61, .71],
      exit: [.88, .40], socket: [.46, .27], spine: [[.12, .61], [.31, .61], [.31, .43], [.88, .43]],
      equipment: [[.44, .74, 1.65, 1.24, "reel"], [.68, .19, 2.0, 1.1, "reel"], [.75, .72, .78, .93, "post"]] },
    { title: "굽은 환기 전실", width: 13, height: 13, start: [.17, .82], bench: [.70, .31],
      exit: [.80, .73], socket: [.43, .25], spine: [[.17, .82], [.17, .27], [.80, .27], [.80, .73]],
      equipment: [[.48, .65, 2.3, 3.1, "pump"], [.72, .48, 1.43, .82, "grate"], [.37, .89, 1.1, .84, "supplies"]] },
    { title: "삼갈래 변류실", width: 16, height: 12, start: [.50, .86], bench: [.76, .55],
      exit: [.53, .18], socket: [.53, .47], spine: [[.50, .86], [.50, .55], [.19, .55], [.50, .55], [.76, .55], [.53, .55], [.53, .18]],
      equipment: [[.23, .25, 2.25, 1.26, "receiver"], [.73, .25, 2.25, 1.26, "receiver"], [.24, .77, .90, .94, "post"], [.73, .77, .90, .94, "post"]] },
    { title: "측벽 잔해 대피소", width: 14, height: 11, start: [.83, .80], bench: [.44, .23],
      exit: [.17, .57], socket: [.49, .52], spine: [[.83, .80], [.83, .37], [.53, .37], [.48, .55], [.17, .55]],
      equipment: [[.24, .80, 1.86, 1.24, "rubble"], [.56, .72, 2.45, 1.10, "rubble"], [.31, .22, 1.08, .8, "supplies"]] },
    { title: "쌍열교환 격벽실", width: 17, height: 13, start: [.48, .86], bench: [.80, .69],
      exit: [.83, .19], socket: [.48, .47], spine: [[.48, .86], [.56, .68], [.81, .68], [.81, .19], [.25, .19], [.25, .30]],
      equipment: [[.30, .62, 2.4, 2.2, "pump"], [.59, .27, 2.55, 2.1, "pump"], [.73, .42, .72, .82, "post"]] },
    { title: "작업 승강기 전실", width: 14, height: 12, start: [.17, .79], bench: [.29, .26],
      exit: [.83, .27], socket: [.46, .46], spine: [[.17, .79], [.46, .71], [.46, .46], [.46, .28], [.83, .28]],
      equipment: [[.20, .53, 1.48, 1.75, "post"], [.72, .50, 2.55, 1.85, "lift"], [.86, .81, 1.2, .9, "supplies"]] },
    { title: "폐수 봉쇄칸", width: 14, height: 10, start: [.86, .47], bench: [.29, .72],
      exit: [.16, .37], socket: [.35, .24], spine: [[.86, .47], [.86, .19], [.16, .19], [.16, .37], [.16, .68], [.29, .68]],
      equipment: [[.51, .55, .86, 4.18, "valves"], [.24, .49, 1.3, .9, "grate"], [.76, .76, 1.7, 1.28, "tank"]] },
    { title: "엇갈린 단열 복도", width: 18, height: 11, start: [.11, .50], bench: [.59, .75],
      exit: [.89, .46], socket: [.53, .28], spine: [[.11, .50], [.26, .50], [.26, .23], [.53, .23], [.53, .80], [.88, .80], [.88, .46]],
      equipment: [[.37, .61, 1.45, 4.06, "baffle"], [.72, .33, 1.43, 3.59, "baffle"], [.32, .88, 1.68, .64, "grate"]] },
    { title: "공압조 정비마당", width: 16, height: 13, start: [.15, .77], bench: [.49, .20],
      exit: [.82, .65], socket: [.50, .67], spine: [[.15, .77], [.15, .25], [.51, .25], [.51, .67], [.82, .67]],
      equipment: [[.73, .34, 3.1, 2.44, "tank"], [.34, .52, 2.0, 1.21, "valves"], [.46, .85, 1.5, 1.0, "receiver"]] },
    { title: "경첩식 잠금실", width: 13, height: 10, start: [.25, .18], bench: [.65, .45],
      exit: [.81, .80], socket: [.57, .20], spine: [[.25, .18], [.25, .58], [.45, .58], [.45, .77], [.81, .77]],
      equipment: [[.42, .38, 1.65, 1.28, "lift"], [.25, .84, 2.1, .82, "baffle"], [.81, .22, 1.55, .92, "receiver"]] },
  ];

  const recessMaterials = {
    "lower-drainage": { theme: "sluice", cloth: "#536b68", trim: "#c7c2a2",
      names: ["낙차 수로", "하류 취수", "외벽 여과", "녹슨 배수", "수문 역류", "환수관 접속", "저층 우회"] },
    pressure: { theme: "forge", cloth: "#765a49", trim: "#dab58a",
      names: ["과압 방출", "예비 감압", "내압 시험", "단열 접합", "상류 계측", "압축 저장", "완충 배관"] },
    service: { theme: "relay", cloth: "#615f72", trim: "#c5bdad",
      names: ["교대 공구", "구형 감시", "단선 점검", "예비 구동", "야간 보수", "인양 장치", "마모 계측"] },
    transmission: { theme: "relay", cloth: "#536779", trim: "#bdc9c4",
      names: ["송수 중계", "원거리 신호", "우회 선로", "교환 장치", "광로 증폭", "단절 회선", "망 분리"] },
    furnace: { theme: "forge", cloth: "#755841", trim: "#d6ac7f",
      names: ["잔열 회수", "연소 감시", "냉각 배관", "온도 계측", "재 처리", "등압 환기", "내화 보수"] },
    distribution: { theme: "sluice", cloth: "#53667a", trim: "#c8bea1",
      names: ["중앙 배분", "분기 급수", "상단 계량", "원격 제어", "구역 할당", "예비 공급", "최종 순환"] },
  };

  const storyRecesses = {
    35: { title: "개척선 방호실", fixture: "frontier", width: 15, height: 10, start: [.17, .80],
      bench: [.67, .31], exit: [.86, .64], socket: [.48, .47], spine: [[.17, .80], [.17, .55], [.86, .55], [.86, .64]],
      equipment: [[.27, .14, 3.35, .78, "baffle"], [.68, .14, 3.75, .78, "baffle"], [.68, .86, 1.75, .9, "supplies"]] },
    665: { title: "전송실 대피칸", fixture: "cables", width: 17, height: 11, start: [.16, .76],
      bench: [.72, .25], exit: [.86, .65], socket: [.44, .36], spine: [[.16, .76], [.16, .40], [.83, .40], [.83, .65]],
      equipment: [[.43, .67, 2.6, 1.3, "reel"], [.67, .69, 2.2, 1.2, "receiver"], [.52, .14, 3.25, .78, "baffle"]] },
  };

  function addVillageServices(room, floor) {
    const { width, height, spawn, storySocket, stations, obstacles, inhabited, layout, cloth, trim } = room;
    const services = [
      { kind: "board", caption: "게시판", u: .25, v: .66, w: 1.02, h: .35 },
      { kind: "shop", caption: "상점", u: .65, v: .39, w: 1.48, h: .88 },
    ];
    if (floor % 10 === 0) {
      services.unshift({ kind: "campfire", caption: "모닥불", u: .49, v: .78, w: .96, h: .96 });
      const central = floor === 10 || floor === 20;
      services.unshift({ kind: "shrine", caption: floor === 10 ? "성당" : "신전",
        u: central ? .52 : .85, v: central ? .28 : .24,
        w: floor === 10 ? 1.85 : 1.24, h: floor === 10 ? 1.16 : .76 });
    }
    const variant = Math.floor(floor / 5) % recessPlans.length;
    const separation = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const roomFor = ({ x, y }, w, h) => obstacles.every((block) => {
      const dx = Math.max(0, Math.abs(x - block.x) - (w + block.w) / 2);
      const dy = Math.max(0, Math.abs(y - block.y) - (h + block.h) / 2);
      return Math.hypot(dx, dy) >= .62;
    });
    for (const { kind, caption, u, v, w, h } of services) {
      const target = { x: width * (!inhabited && variant % 2 ? 1 - u : u),
        y: height * (!inhabited && variant % 4 >= 2 ? 1 - v : v) };
      const candidates = [];
      for (let x = 1.75; x <= width - 1.75; x += .5) {
        for (let y = 1.75; y <= height - 1.75; y += .5) {
          const point = { x, y };
          if (separation(point, spawn) < 1.65 || separation(point, storySocket) < 2.12 || !roomFor(point, w, h)) continue;
          const spacing = Math.min(...stations.map((entry) => separation(point, entry)));
          if (spacing < 2.30) continue;
          candidates.push({ x, y, score: separation(point, target) + Math.max(0, 2.68 - spacing) * 12 });
        }
      }
      candidates.sort((a, b) => a.score - b.score);
      const { x, y } = candidates[0];
      stations.push({ kind, caption, x, y, inhabited, style: layout, cloth, trim, variant,
        design: floor === 10 ? "chapel" : floor === 20 ? "sanctuary" : "field" });
      obstacles.push({ x, y, w, h, shelterDecor: true });
    }
    return room;
  }

  function createRecess(floor, visit) {
    const region = window.TowerContent?.getRegion(floor).id ?? "lower-drainage";
    const material = recessMaterials[region] ?? recessMaterials["lower-drainage"];
    const cycle = Math.floor(visit / recessPlans.length);
    const fixed = storyRecesses[floor];
    const plan = fixed ?? recessPlans[visit % recessPlans.length];
    const width = plan.width + (fixed ? 0 : Math.floor(cycle / 4) % 3);
    const height = plan.height + (fixed ? 0 : Math.floor(cycle / 12) % 2);
    const coordinate = ([u, v]) => ({
      x: width * (!fixed && (cycle & 1) ? 1 - u : u),
      y: height * (!fixed && (cycle & 2) ? 1 - v : v),
    });
    const station = (kind, anchor, caption) => ({ ...coordinate(anchor), kind, caption, inhabited: false,
      style: "recess", cloth: material.cloth, trim: material.trim, variant: visit % recessPlans.length });
    const decor = plan.equipment.map(([u, v, w, h, design]) => ({ ...coordinate([u, v]), w, h, design }));
    const title = fixed?.title ?? material.names[cycle % material.names.length] + " " + plan.title;
    const theme = floor === 35 ? "sluice" : floor === 665 ? "relay" : material.theme;
    return addVillageServices({
      title, theme, fixture: fixed?.fixture ?? "recess", width, height, inhabited: false,
      layout: "recess", cloth: material.cloth, trim: material.trim, spawn: coordinate(plan.start),
      storySocket: coordinate(plan.socket), paths: plan.spine.map(coordinate), decor,
      obstacles: decor.map((entry) => ({ ...entry, shelterDecor: true })),
      stations: [station("workbench", plan.bench, "작업대"), station("departure", plan.exit, "위층으로")],
      terrain: [], items: [], enemies: [], rolls: [],
    }, floor);
  }

  function earlyVariation(floor, plan) {
    if (!plan || floor < 5 || floor > 20 || floor % 5 !== 0) return undefined;
    const bounded = (value) => Number.isFinite(value) ? Math.max(-1, Math.min(1, value)) : 0;
    const { structureIndex, widthOffset, depthOffset, laneBias } = plan;
    if (![structureIndex, widthOffset, depthOffset, laneBias].some(Number.isFinite)) return undefined;
    return {
      width: Math.round(bounded(widthOffset)), depth: Math.round(bounded(depthOffset)), lane: bounded(laneBias),
      structure: Number.isInteger(structureIndex) ? Math.max(0, Math.min(3, structureIndex)) : 0,
    };
  }

  function openShelterPoint(room, x, y, radius) {
    if (x < radius || y < radius || x > room.width - radius || y > room.height - radius) return false;
    return room.obstacles.every((entry) => {
      const gapX = Math.max(0, Math.abs(x - entry.x) - entry.w / 2);
      const gapY = Math.max(0, Math.abs(y - entry.y) - entry.h / 2);
      return gapX * gapX + gapY * gapY >= radius * radius;
    });
  }

  function walkableShelterPoints(room, start) {
    const step = .32;
    const points = [{ x: start.x, y: start.y, row: 0, col: 0 }];
    const tested = new Set(["0,0"]);
    for (let index = 0; index < points.length; index++) {
      const from = points[index];
      for (const [dx, dy] of [[1, 0], [0, -1], [0, 1], [-1, 0]]) {
        const row = from.row + dy, col = from.col + dx;
        const id = `${col},${row}`;
        if (tested.has(id)) continue;
        const x = start.x + col * step, y = start.y + row * step;
        if (!openShelterPoint(room, x, y, .34)) {
          tested.add(id);
          continue;
        }
        if (!openShelterPoint(room, (from.x + x) / 2, (from.y + y) / 2, .34)) continue;
        tested.add(id);
        points.push({ x, y, row, col, from });
      }
    }
    return points;
  }

  function validatedShelterPath(room, variation, waypoint) {
    const { spawn, storySocket, stations } = room;
    if (!openShelterPoint(room, spawn.x, spawn.y, .34) || !openShelterPoint(room, storySocket.x, storySocket.y, .47)) return undefined;
    const departure = stations.find((entry) => entry.kind === "departure");
    const reachable = walkableShelterPoints(room, spawn);
    const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    if (!reachable.some((point) => distance(point, storySocket) <= .64) ||
      !stations.every((station) => reachable.some((point) => distance(point, station) <= 1.31))) return undefined;
    const closest = (points, target) => points.reduce((best, point) => distance(point, target) < distance(best, target) ? point : best);
    const lane = closest(reachable, waypoint ?? { x: room.width * (.38 + variation.structure * .057),
      y: room.height * (.49 + variation.structure % 2 * .14) + variation.lane * .60 });
    const endpoint = closest(walkableShelterPoints(room, lane), departure);
    const trace = (point) => {
      const path = [];
      for (let node = point; node; node = node.from) path.unshift({ x: node.x, y: node.y });
      return path;
    };
    const path = [...trace(lane), ...trace(endpoint).slice(1)];
    return path.filter((point, index) => {
      const previous = path[index - 1], next = path[index + 1];
      if (!previous || !next) return true;
      return Math.abs((point.x - previous.x) * (next.y - point.y) - (point.y - previous.y) * (next.x - point.x)) > .0001;
    });
  }

  function createSettlement(floor, visit, variation) {
    const inhabited = true;
    const room = settlements[visit % settlements.length];
    const { title, theme, fixture, layout } = room;
    const width = room.width + (variation?.width ?? 0);
    const height = room.height + (variation?.depth ?? 0);
    const shift = variation ? (variation.structure - 1.5) * .18 : 0;
    const lane = variation?.lane ?? 0;
    const landmark = { well: "cistern", forge: "heater", ward: "medcase", market: "stall", supply: "depot" }[layout];
    const station = (kind, x, y, caption) => ({ x, y, kind, caption, inhabited,
      style: layout, cloth: room.cloth, trim: room.trim, variant: visit % settlements.length });
    const stations = [
      station("workbench", width * 0.67, height * (layout === "market" ? 0.70 : 0.33), "작업대"),
      station("departure", width - 2.05, height * 0.62 + lane * .28, "위층으로"),
    ];
    const decor = [
      { x: width * 0.23 + shift, y: 1.42, w: 2.65, h: 1.35, design: "house" },
      { x: width * 0.67 - shift, y: 1.42, w: layout === "ward" ? 3.45 : 2.9, h: 1.35, design: "house" },
      { x: width * 0.65, y: height - 1.2, w: layout === "supply" ? 2.4 : 1.5, h: 0.9, design: landmark ?? "supplies" },
    ];
    const obstacles = decor.map((entry) => ({ ...entry, shelterDecor: true }));
    return addVillageServices({
      title, theme, fixture, width, height, inhabited, layout, cloth: room.cloth, trim: room.trim,
      spawn: { x: 2.75 + shift, y: height - 2.2 + lane * .26 },
      storySocket: { x: width * 0.48 + lane * .45, y: height * 0.48 + shift },
      stations, obstacles, decor, terrain: [], items: [], enemies: [], rolls: [],
    }, floor);
  }

  function settlementPlacement(chambers, preferred, spec, room, reserved) {
    const w = spec?.w ?? 0;
    const h = spec?.h ?? 0;
    const insetX = .65 + w / 2;
    const insetY = .65 + h / 2;
    const radius = Math.max(w, h) * .37;
    for (const chamber of [preferred, ...chambers.filter((entry) => entry !== preferred)]) {
      let best;
      let bestDistance = Infinity;
      const targetX = chamber.left + chamber.w * (spec?.u ?? .5);
      const targetY = chamber.top + chamber.h * (spec?.v ?? .5);
      for (let x = chamber.left + insetX; x <= chamber.right - insetX; x += .38) {
        for (let y = chamber.top + insetY; y <= chamber.bottom - insetY; y += .38) {
          if (reserved.some((entry) => Math.hypot(x - entry.x, y - entry.y) < entry.clearance + radius)) continue;
          const nearWall = room.obstacles.some((entry) => {
            const gapX = Math.max(0, Math.abs(x - entry.x) - (w + entry.w) / 2);
            const gapY = Math.max(0, Math.abs(y - entry.y) - (h + entry.h) / 2);
            return gapX * gapX + gapY * gapY < .39 ** 2;
          });
          if (nearWall) continue;
          const distance = Math.hypot(x - targetX, y - targetY);
          if (distance < bestDistance) {
            best = { x, y };
            bestDistance = distance;
          }
        }
      }
      if (best) return best;
    }
    return undefined;
  }

  function generatedSettlement(floor, base, variation, context, attempt) {
    const width = Math.max(24, base.width + 10);
    const height = Math.max(18, base.height + 8);
    const seed = context?.seed ?? (Math.imul(floor, 0x45d9f3b) ^ (variation.structure << 24)
      ^ (variation.width << 12) ^ (variation.depth << 6) ^ Math.round(variation.lane * 32));
    const graph = window.TowerFloorGraph?.build({ width, height, seed, kind: "shelter", theme: base.theme, floor, attempt,
      choices: context?.choices ?? {}, profile: { structureIndex: variation.structure, widthOffset: variation.width,
        depthOffset: variation.depth, laneBias: variation.lane } });
    if (!graph?.rooms?.length || graph.rooms.length < 3) return undefined;
    const byId = new Map(graph.rooms.map((entry) => [entry.id, entry]));
    const entry = byId.get(graph.entry);
    const exit = byId.get(graph.exit);
    if (!entry || !exit || entry === exit) return undefined;
    const interior = graph.rooms.filter((room) => room !== entry && room !== exit)
      .sort((a, b) => b.w * b.h - a.w * a.h);
    const story = interior[0];
    const service = interior[1] ?? exit;
    const spawn = { x: entry.x, y: entry.y };
    const storySocket = { x: story.x, y: story.y };
    const departure = { x: exit.x, y: exit.y };
    const room = { ...base, width, height, roomGraph: graph, spawn, storySocket, stations: [], decor: [], obstacles: [...graph.walls] };
    const reserved = [
      { ...spawn, clearance: 1.05 }, { ...storySocket, clearance: 1.80 }, { ...departure, clearance: 1.10 },
      ...graph.links.map((link) => ({ x: link.x, y: link.y, clearance: .85 })),
    ];
    const positions = {
      workbench: { room: service, u: .70, v: .29 },
      board: { room: entry, u: .72, v: .71 }, shop: { room: service, u: .74, v: .72 },
      campfire: { room: entry, u: .27, v: .77 }, shrine: { room: exit, u: .48, v: .27 },
    };
    for (const station of base.stations) {
      if (station.kind === "departure") {
        room.stations.push({ ...station, ...departure });
        continue;
      }
      const slot = positions[station.kind];
      const collision = base.obstacles.find((obstacle) => obstacle.x === station.x && obstacle.y === station.y);
      const at = settlementPlacement(graph.rooms, slot.room, { ...slot, w: collision?.w, h: collision?.h }, room, reserved);
      if (!at) return undefined;
      room.stations.push({ ...station, ...at });
      reserved.push({ ...at, clearance: collision ? 1.48 : 1.32 });
      if (collision) room.obstacles.push({ ...collision, ...at });
    }
    const decorRooms = [entry, service, exit];
    for (const [index, art] of base.decor.entries()) {
      const preferred = decorRooms[index];
      const at = settlementPlacement(graph.rooms, preferred, { w: art.w, h: art.h, u: .27, v: .19 }, room, reserved);
      if (!at) continue;
      room.decor.push({ ...art, ...at });
      room.obstacles.push({ ...art, ...at, shelterDecor: true });
      reserved.push({ ...at, clearance: 1.36 });
    }
    const routeMiddle = byId.get(graph.route[Math.floor(graph.route.length / 2)]);
    const paths = validatedShelterPath(room, variation, routeMiddle);
    return paths ? { ...room, paths } : undefined;
  }

  function create(floor, plan, context) {
    const visit = Math.floor((floor - 1) / 5);
    if (floor >= 35) return createRecess(floor, visit);
    const variation = earlyVariation(floor, plan);
    if (variation) {
      const room = createSettlement(floor, visit, variation);
      if (typeof window.TowerFloorGraph?.build === "function") {
        for (let attempt = 0; attempt < 4; attempt++) {
          const generated = generatedSettlement(floor, room, variation, context, attempt);
          if (generated) return generated;
        }
      }
      const paths = validatedShelterPath(room, variation);
      if (paths) return { ...room, paths };
    }
    return createSettlement(floor, visit);
  }

  function box(context, camera, art, x, y, w, h, z, base, shade, top, edge = null, lift = 0) {
    if (art.occlusion) {
      art.occlusion.push({ x, y, w, h, bottom: lift, top: lift + z });
      return;
    }
    const low = art.rectangle(camera, x - w / 2, y - h / 2, w, h, lift);
    const high = art.rectangle(camera, x - w / 2, y - h / 2, w, h, lift + z);
    art.poly(context, [high[1], high[2], low[2], low[1]], shade, edge);
    art.poly(context, [high[2], high[3], low[3], low[2]], base, edge);
    art.poly(context, high, top, edge);
  }

  function opaqueFace(context, art, points, fill, edge, lineWidth) {
    if (art.occlusion) art.occlusion.push({ faces: [points] });
    else art.poly(context, points, fill, edge, lineWidth);
  }

  function upright(context, camera, art, x, y, bottom, top, color, width) {
    if (art.occlusion) art.occlusion.push({ x, y, w: .065, h: .065, bottom, top });
    else art.line(context, [art.point(camera, x, y, bottom), art.point(camera, x, y, top)], color, width);
  }

  function sidePanel(context, camera, art, x, y, w, bottom, top, color, edge) {
    const p = (at, z) => art.point(camera, at, y, z);
    art.poly(context, [p(x - w / 2, bottom), p(x + w / 2, bottom), p(x + w / 2, top), p(x - w / 2, top)], color, edge);
  }

  function contact(context, camera, art, x, y, scale = 1) {
    const [px, py] = art.point(camera, x, y);
    art.contactShadow?.(context, px, py, camera.unit * scale, art.palette);
  }

  function lamp(context, camera, art, x, y, z, color, reach = 0.75) {
    if (art.occlusion) return;
    const [px, py] = art.point(camera, x, y, z);
    const radius = Math.max(2, camera.unit * reach);
    const pulse = art.reduced ? 0.85 : 0.87 + 0.09 * Math.sin((art.seconds ?? 0) * 2.7 + x);
    const glow = context.createRadialGradient(px, py, 0, px, py, radius);
    glow.addColorStop(0, color + "82");
    glow.addColorStop(0.32, color + "36");
    glow.addColorStop(1, color + "00");
    context.save();
    context.globalAlpha *= pulse;
    art.ellipse(context, px, py, radius, radius * 0.72, glow);
    art.ellipse(context, px, py, Math.max(1.1, camera.unit * 0.045), Math.max(1.6, camera.unit * 0.073), color);
    context.restore();
  }

  function house(context, camera, art, structure, state) {
    const { x, y, w, h } = structure;
    const leaf = state.cloth;
    const brass = state.trim;
    const p = (dx, dy, z) => art.point(camera, x + dx, y + dy, z);
    const lip = 0.12;
    const front = y + h / 2 + 0.01;
    const peak = state.layout === "ward" ? 1.71 : 1.55;
    contact(context, camera, art, x, y, 2.5);
    box(context, camera, art, x, y, w, h, 0.17, "#40342a", "#222628", "#7c694e", "#282323");
    box(context, camera, art, x, y, w - 0.16, h - 0.05, 0.93,
      "#67543e", "#3a3933", "#96826a", "#352d25", 0.15);
    sidePanel(context, camera, art, x - w * 0.08, front, 0.56, 0.17, 0.83, "#252a25", "#a38a61");
    sidePanel(context, camera, art, x - w * 0.14, front, 0.045, 0.19, 0.81, leaf);
    for (const side of [-1, 1]) {
      const windowX = x + side * w * 0.31;
      sidePanel(context, camera, art, windowX, front, 0.32, 0.49, 0.78, "#eaad62", "#392b22");
      sidePanel(context, camera, art, windowX, front + 0.004, 0.025, 0.49, 0.78, "#593d2d");
      lamp(context, camera, art, windowX, front, 0.6, "#e9ad72", 0.39);
    }
    const roofY = h / 2 + lip;
    const ridge = [p(-w / 2 - lip, 0, peak), p(w / 2 + lip, 0, peak)];
    const behind = [p(-w / 2 - lip, -roofY, 1.01), p(w / 2 + lip, -roofY, 1.01)];
    const edge = [p(-w / 2 - lip, roofY, 1.01), p(w / 2 + lip, roofY, 1.01)];
    opaqueFace(context, art, [behind[0], behind[1], ridge[1], ridge[0]], "#343a34", "#232824");
    opaqueFace(context, art, [ridge[0], ridge[1], edge[1], edge[0]], leaf, "#252d29");
    opaqueFace(context, art, [ridge[1], behind[1], edge[1]], "#493d32", "#252d29");
    art.line(context, ridge, brass + "bb", 1.35);
    art.line(context, edge, brass + "a8", 1.05);
    for (const fraction of [-0.29, -0.1, 0.1, 0.29]) {
      art.line(context, [p(w * fraction, 0, peak + 0.005), p(w * fraction, roofY, 1.014)], brass + "45", 1);
    }
    if (state.layout === "forge" || state.layout === "supply") {
      box(context, camera, art, x + w * 0.37, y + 0.12, 0.27, 0.29, 0.38,
        "#47423b", "#292c2a", "#a09378", "#37322c", peak - 0.22);
    }
  }

  function supplies(context, camera, art, x, y, trim) {
    box(context, camera, art, x - 0.26, y, 0.55, 0.58, 0.38, "#72573a", "#51432f", "#a88b60", "#3b3023");
    box(context, camera, art, x + 0.39, y + 0.13, 0.54, 0.56, 0.31, "#654f39", "#453626", "#9a835e", "#392e21");
    const p = (dx, dy) => art.point(camera, x + dx, y + dy, 0.39);
    art.line(context, [p(-0.34, -0.25), p(-0.34, 0.23)], trim + "a0", 1.25);
    art.line(context, [p(-0.15, -0.25), p(-0.15, 0.23)], trim + "a0", 1.25);
  }

  function baffle(context, camera, art, { x, y, w, h }, trim) {
    box(context, camera, art, x, y, w, h, 0.83, "#3a4543", "#242d2d", "#75807c", "#192222");
    const f = y + h / 2 + 0.012;
    for (let panel = x - w / 2 + 0.32; panel < x + w / 2 - 0.22; panel += 0.54) {
      sidePanel(context, camera, art, panel, f, 0.34, 0.19, 0.61, "#242f30", "#556361");
      sidePanel(context, camera, art, panel + 0.12, f, 0.045, 0.55, 0.60, trim);
    }
  }

  function landmarkProp(context, camera, art, { x, y, w, h, design }, room) {
    const p = (dx, dy, z = 0) => art.point(camera, x + dx, y + dy, z);
    const u = camera.unit;
    const trim = room.trim;
    const metal = art.palette.capSide ?? "#506261";
    const shadow = art.palette.wallY ?? "#2f3939";
    const highlight = art.palette.cap ?? "#82938c";
    switch (design) {
      case "cistern": {
        box(context, camera, art, x, y, 1.32, 0.83, 0.34, "#4d615e", "#354b4a", "#809691", "#263c3a");
        const [px, py] = p(0, 0, 0.35);
        art.ellipse(context, px, py, u * 0.43, u * 0.21, "#22575d", "#97c0b6", 1.1);
        art.ellipse(context, px - u * 0.09, py, u * 0.13, u * 0.06, null, "#a1d6d1a0", 1);
        break;
      }
      case "heater":
        box(context, camera, art, x, y, 0.83, 0.68, 0.59, "#6f5540", "#493a2f", "#a68462", "#3e342d");
        sidePanel(context, camera, art, x, y + 0.35, 0.52, 0.2, 0.43, "#593924", "#97775c");
        for (const dx of [-0.16, 0, 0.16]) lamp(context, camera, art, x + dx, y + 0.36, 0.33, "#ffc17b", 0.37);
        break;
      case "medcase":
        box(context, camera, art, x, y, 1.28, 0.68, 0.35, "#67776c", "#465851", "#a9b5a1", "#435349");
        art.line(context, [p(-0.14, 0, 0.36), p(0.14, 0, 0.36)], "#d5d5b7", 1.8);
        art.line(context, [p(0, -0.12, 0.36), p(0, 0.12, 0.36)], "#d5d5b7", 1.8);
        break;
      case "stall":
        for (const side of [-1, 1]) art.line(context, [p(side * 0.61, 0.24), p(side * 0.61, 0.24, 0.78)], "#75644a", 1.9);
        box(context, camera, art, x, y, 1.29, 0.62, 0.37, "#6f5345", "#544238", "#9f8066", "#473a31");
        opaqueFace(context, art, [p(-0.68, -0.48, 0.98), p(0.68, -0.48, 0.98),
          p(0.68, 0.38, 0.78), p(-0.68, 0.38, 0.78)], room.cloth, "#4b4042");
        for (const dx of [-0.44, 0, 0.44]) {
          art.line(context, [p(dx, -0.48, 0.985), p(dx, 0.38, 0.785)], room.trim + "aa", 1.55);
        }
        break;
      case "depot":
        supplies(context, camera, art, x - 0.26, y, room.trim);
        box(context, camera, art, x + 0.64, y, 0.63, 0.73, 0.49, "#78664a", "#57462f", "#ac9870", "#514230");
        break;
      case "tank": {
        box(context, camera, art, x, y, w, h, 0.18, metal, shadow, highlight, "#202e2f");
        box(context, camera, art, x, y, w * 0.89, h * 0.83, 0.66, "#395455", shadow, "#687e77", "#294444", 0.18);
        const [px, py] = p(0, 0, 0.85);
        const faceRadius = Math.max(0.16, Math.min(w, h) * 0.21) * u;
        art.ellipse(context, px, py, faceRadius, faceRadius * 0.53, "#22565f", "#91b4a5");
        art.ellipse(context, px, py, faceRadius * 0.47, faceRadius * 0.245, null, trim + "7c");
        art.line(context, [p(-w * 0.35, h * 0.32, 0.84), p(w * 0.35, h * 0.32, 0.84)], trim + "a6", 1.4);
        break;
      }
      case "reel":
        box(context, camera, art, x, y, w, h, 0.12, metal, shadow, highlight, "#242c2b");
        for (const side of [-1, 1]) {
          const [px, py] = p(side * w * 0.30, 0, 0.48);
          art.ellipse(context, px, py, u * Math.min(0.27, h * 0.25), u * 0.32, "#624d37", "#ad9371", 1.2);
          art.ellipse(context, px, py, u * 0.09, u * 0.11, "#263436", "#d2ac76", 1.05);
        }
        art.line(context, [p(-w * 0.28, 0, 0.48), p(w * 0.28, 0, 0.48)], "#1a2324", Math.max(2.3, u * 0.24));
        art.line(context, [p(-w * 0.26, -0.04, 0.54), p(w * 0.28, -0.04, 0.54)], "#b6966a", 1.1);
        break;
      case "pump":
        box(context, camera, art, x, y, w, h, 0.17, metal, shadow, highlight, "#253236");
        box(context, camera, art, x, y, w * 0.78, h * 0.74, 0.92, shadow, "#202b2e", metal, "#233034", 0.17);
        art.line(context, [p(-w * 0.34, -h * 0.08, 0.72), p(-w * 0.34, -h * 0.08, 1.26),
          p(w * 0.28, -h * 0.08, 1.26), p(w * 0.28, h * 0.25, 0.48)],
        "#526f71", Math.max(4, u * 0.20));
        art.line(context, [p(-w * 0.33, -h * 0.10, 1.29), p(w * 0.27, -h * 0.10, 1.29)], trim + "b0", 1.4);
        lamp(context, camera, art, x + w * 0.22, y + h * 0.38, 0.65, "#edb477", 0.38);
        break;
      case "receiver":
        box(context, camera, art, x, y, w, h, 0.73, metal, shadow, highlight, "#263638");
        box(context, camera, art, x - w * 0.16, y - h * 0.12, w * 0.52, h * 0.43, 0.39,
          "#48595b", shadow, metal, "#182a2d", 0.73);
        sidePanel(context, camera, art, x - w * 0.16, y + h * 0.10, w * 0.38, 0.78, 1.02, "#1b3b43", "#4d8490");
        art.line(context, [p(-w * 0.28, h * 0.11, 0.86), p(-w * 0.17, h * 0.11, 0.91), p(-w * 0.03, h * 0.11, 0.87)], "#97caca", 1.2);
        break;
      case "valves": {
        box(context, camera, art, x, y, w, h, 0.54, metal, shadow, highlight, "#293334");
        const alongX = w >= h;
        const edge = Math.max(w, h) * 0.39;
        const linePoint = (offset, z) => p(alongX ? offset : 0, alongX ? 0 : offset, z);
        art.line(context, [linePoint(-edge, 0.73), linePoint(edge, 0.73)], "#596f69", Math.max(2, u * 0.12));
        for (const ratio of [-0.66, 0, 0.66]) {
          const [px, py] = linePoint(edge * ratio, 0.77);
          art.ellipse(context, px, py, u * 0.095, u * 0.061, "#563e2d", trim, 1.4);
        }
        break;
      }
      case "post":
        box(context, camera, art, x, y, w, h, 0.27, metal, shadow, highlight, "#222b2c");
        box(context, camera, art, x, y, w * 0.72, h * 0.74, 1.08, metal, shadow, highlight, "#222b2c", 0.27);
        sidePanel(context, camera, art, x, y + h * 0.39, w * 0.42, 0.96, 1.26, "#344549", trim + "66");
        break;
      case "grate":
        box(context, camera, art, x, y, w, h, 0.44, metal, shadow, "#243d43", "#54666c");
        for (const stripe of [-0.32, -0.16, 0, 0.16, 0.32]) {
          art.line(context, [p(w * stripe, h * -0.37, .451), p(w * stripe, h * 0.37, .451)], highlight, 1.15);
        }
        break;
      case "rubble":
        box(context, camera, art, x - w * 0.21, y + h * 0.03, w * .41, h * .62, 0.48, "#60564c", shadow, "#988a78", "#3d3b35");
        box(context, camera, art, x + w * 0.18, y - h * 0.14, w * .37, h * .56, 0.30, "#6d6657", shadow, "#9e9983", "#4e4a3f");
        art.line(context, [p(-w * 0.43, -h * 0.12), p(w * 0.41, h * 0.34)], "#997658", 2.1);
        break;
      case "lift":
        box(context, camera, art, x, y, w, h, 0.15, metal, shadow, highlight, "#293637");
        box(context, camera, art, x, y - h * 0.23, w * 0.9, h * 0.45, 1.10, metal, shadow, highlight, "#293637", 0.15);
        sidePanel(context, camera, art, x, y, w * 0.56, 0.21, 1.08, "#2d4143", "#84a2a1");
        sidePanel(context, camera, art, x + w * 0.25, y + 0.01, w * 0.062, 0.61, 0.69, "#bf7a5c");
        art.line(context, [p(-w * 0.30, h * 0.38, 0.151), p(w * 0.30, h * 0.38, 0.151)], trim + "a0", 1.7);
        break;
      default:
        supplies(context, camera, art, x, y, room.trim);
    }
  }

  function lane(context, camera, art, x, y, w, h, color) {
    art.poly(context, art.rectangle(camera, x, y, w, h, 0.016), color);
    const p = (ax, ay) => art.point(camera, ax, ay, 0.026);
    art.line(context, [p(x, y + 0.06), p(x + w, y + 0.06)], "#d4b69149", 1);
    art.line(context, [p(x, y + h - 0.06), p(x + w, y + h - 0.06)], "#121c1ba4", 1);
  }

  function shelterDecoration(context, camera, art, room) {
    for (const entry of room.decor ?? []) {
      if (entry.design === "house") house(context, camera, art, entry, room);
      else if (entry.design === "baffle") baffle(context, camera, art, entry, room.trim);
      else landmarkProp(context, camera, art, entry, room);
    }
  }

  function dress(context, camera, state, art) {
    const room = state.shelter?.decor ? state.shelter : state;
    if (!room.decor) return;
    const { width, height, inhabited, trim, cloth } = room;
    const center = height * 0.54;
    const p = (x, y, z = 0.024) => art.point(camera, x, y, z);
    if (room.roomGraph) {
      for (const chamber of room.roomGraph.rooms) {
        const area = art.rectangle(camera, chamber.left + .20, chamber.top + .20, chamber.w - .40, chamber.h - .40, .017);
        art.poly(context, area, cloth + "31", trim + "58", 1.0);
      }
      for (const door of room.roomGraph.links) {
        const alongX = door.axis === "x";
        const span = door.width * .64;
        const w = alongX ? .62 : span;
        const h = alongX ? span : .62;
        art.poly(context, art.rectangle(camera, door.x - w / 2, door.y - h / 2, w, h, .026),
          "#2b302a8e", trim + "85", 1.1);
      }
    }
    if (room.paths) {
      const trace = room.paths.map(({ x, y }) => p(x, y));
      art.line(context, trace, "#151f2090", camera.unit * 0.27);
      art.line(context, trace, trim + "64", 1.25);
      for (const [px, py] of trace) art.ellipse(context, px, py, 1.8, 1.15, trim + "a0");
    } else {
      lane(context, camera, art, 1.72, center - 0.55, width - 3.3, 1.10, "#a4866232");
      lane(context, camera, art, 2.17, center + 0.55, 1.15, height - center - 1.85, "#a4866232");
      for (let x = 2.25; x < width - 1.85; x += 0.66) {
        art.line(context, [p(x, center + 0.48), p(x + 0.25, center + 0.48)], trim + "64", 1.15);
      }
    }
    for (const side of [-1, 1]) {
      const x = side === -1 ? 1.35 : width - 1.28;
      const y = height - 1.64;
      art.line(context, [p(x, y), p(x, y, 0.78)], "#62523c", Math.max(1, camera.unit * 0.055));
      lamp(context, camera, art, x, y, 0.76, inhabited ? "#ffd39a" : "#9bd0d0", 0.66);
    }
    shelterDecoration(context, camera, art, room);
    if (inhabited) {
      const atY = height - 1.72;
      const x = width * 0.82;
      const shade = cloth + "9c";
      art.poly(context, art.rectangle(camera, x - 0.69, atY - 0.27, 1.38, 0.52, 0.015), shade, trim + "66");
      if (room.layout === "line") {
        const a = p(x - 0.71, atY, 0.7), b = p(x + 0.71, atY, 0.7);
        art.line(context, [p(x - 0.71, atY), a], "#695c4b", 1.4);
        art.line(context, [p(x + 0.71, atY), b], "#695c4b", 1.4);
        art.line(context, [a, p(x, atY, 0.57), b], trim + "ba", 1.15);
        for (const [delta, fabric] of [[-0.43, "#ae8c6c"], [0.02, cloth], [0.41, "#b59e7c"]]) {
          art.poly(context, [p(x + delta - 0.13, atY, 0.61), p(x + delta + 0.13, atY, 0.60),
            p(x + delta + 0.15, atY, 0.31), p(x + delta - 0.12, atY, 0.30)], fabric);
        }
      } else if (room.layout === "supply") {
        supplies(context, camera, art, x, atY, trim);
      }
    }
  }

  function attendant(context, camera, art, x, y, cloth, variant) {
    const [px, py] = art.point(camera, x, y);
    const u = camera.unit;
    const at = (ax, ay) => [px + ax * u, py + ay * u];
    contact(context, camera, art, x, y, 0.8);
    art.line(context, [at(-0.11, -0.40), at(-0.14, -0.14), at(-0.21, -0.12)], "#272b29", Math.max(2, u * 0.10));
    art.line(context, [at(0.10, -0.40), at(0.18, -0.18), at(0.27, -0.16)], "#393a2d", Math.max(2, u * 0.102));
    art.poly(context, [at(-0.16, -0.64), at(-0.07, -0.73), at(0.09, -0.73), at(0.18, -0.61),
      at(0.12, -0.39), at(-0.16, -0.4)], cloth, "#252824");
    const arms = Math.max(1.8, u * 0.075);
    art.line(context, [at(-0.13, -0.62), at(-0.22, -0.49), at(-0.15, -0.41)], cloth, arms);
    art.line(context, [at(0.13, -0.61), at(0.23, -0.49), at(0.19, -0.40)], cloth, arms);
    art.ellipse(context, ...at(0.01, -0.77), u * 0.083, u * 0.11, "#cea989", "#3e3028", 0.8);
    art.line(context, [at(-0.07, -0.83), at(0.07, -0.82)], variant % 2 ? "#46332b" : "#695344", Math.max(1, u * 0.049));
  }

  function villageBoard(context, camera, art, entry, p) {
    const { x, y, trim } = entry;
    for (const side of [-1, 1]) {
      box(context, camera, art, x + side * .45, y, .10, .15, 1.30, "#746447", "#41382c", trim, "#3a3228");
    }
    box(context, camera, art, x, y, 1.01, .19, .71, "#584638", "#3a3127", "#8f7856", "#332b23", .54);
    const papers = [[-.28, .27, .92, 1.11, "#e3c99b"], [.02, .25, .70, 1.00, "#c7b5a0"], [.29, .22, .84, 1.08, "#ead7b2"]];
    for (const [center, width, bottom, top, color] of papers) {
      const note = (u, h) => p(center + u * width, .103, h);
      art.poly(context, [note(-.5, top), note(.5, top - .015), note(.5, bottom), note(-.5, bottom + .012)], color);
      for (let height = top - .065; height > bottom + .03; height -= .063) {
        art.line(context, [note(-.29, height), note(.24, height)], "#715849b7", .7);
      }
    }
    art.line(context, [p(-.50, .102, 1.25), p(.50, .102, 1.25)], trim, 1.6);
  }

  function villageShop(context, camera, art, entry, p) {
    const { x, y, cloth, trim, inhabited, variant } = entry;
    const shadow = "#35332a";
    box(context, camera, art, x, y, 1.46, .83, .48, "#615645", shadow, "#937d59", "#302c25");
    if (inhabited) {
      attendant(context, camera, art, x + .20, y - .45, cloth, variant);
      for (const side of [-1, 1]) {
        upright(context, camera, art, x + side * .67, y - .36, .20, 1.45, "#9a8058", 2.5);
        upright(context, camera, art, x + side * .67, y + .40, .20, 1.24, "#9a8058", 2.5);
      }
    } else {
      box(context, camera, art, x, y - .2, 1.38, .46, .86, "#637b73", "#31453e", "#95a591", "#24382f", .48);
      art.line(context, [p(-.56, .033, 1.23), p(.56, .033, 1.23)], trim, 2);
    }
    for (const [offset, color] of [[-.36, "#86b2a4"], [0, "#e4ac7d"], [.34, "#a5a8bf"]]) {
      box(context, camera, art, x + offset, y + .18, .24, .30, .15, color, "#493f37", trim, "#39372b", .48);
    }
    if (inhabited) {
      for (let stripe = 0; stripe < 6; stripe++) {
        const left = -.77 + stripe * .255;
        const right = left + .255;
        const color = stripe % 2 ? "#c0a582" : cloth;
        opaqueFace(context, art, [p(left, -.46, 1.47), p(right, -.46, 1.47), p(right, .49, 1.29), p(left, .49, 1.29)], color);
        opaqueFace(context, art, [p(left, .49, 1.29), p(right, .49, 1.29), p(right - .018, .49, 1.15), p(left + .018, .49, 1.15)], color);
      }
    } else {
      lamp(context, camera, art, x + .42, y + .035, .97, "#a3eed6", .48);
    }
  }

  function villageFire(context, camera, art, { x, y }, p) {
    const [px, py] = p(0, 0, .03);
    const unit = camera.unit;
    art.ellipse(context, px, py, unit * .53, unit * .25, "#282520", "#64574c", 1);
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
      const dx = Math.sin(angle) * .42;
      const dy = Math.cos(angle) * .42;
      box(context, camera, art, x + dx, y + dy, .22, .16, .10, "#655849", "#4d453c", "#8b7c6a", "#3c382e");
    }
    art.line(context, [p(-.24, -.17, .12), p(.24, .16, .12)], "#64452d", 3.7);
    art.line(context, [p(.24, -.20, .12), p(-.26, .16, .12)], "#866044", 3.3);
    lamp(context, camera, art, x, y, .21, "#ffab5d", 1.03);
    const flicker = art.reduced ? 0 : Math.sin(art.seconds * 8.3 + x) * .11;
    art.poly(context, [p(-.24, .16, .12), p(-.20, .09, .31), p(-.10, .05, .24), p(-.06 - flicker, 0, .61 + flicker),
      p(.08, 0, .41), p(.18, .13, .33), p(.23, .14, .15)], "#fa9b52", "#a15a38");
    art.poly(context, [p(-.11, .16, .14), p(.014, .11, .37 + flicker * .47), p(.12, .16, .15)], "#ffe3a5");
  }

  function chapelArch(at, center, half, bottom, spring, peak) {
    const shoulder = spring + (peak - spring) * .57;
    return [at(center - half, bottom), at(center - half, spring), at(center - half * .73, shoulder),
      at(center, peak), at(center + half * .73, shoulder), at(center + half, spring), at(center + half, bottom)];
  }

  function villageChapel(context, camera, art, { x, y }, p) {
    const outline = "#302b28";
    const brass = "#d9b876";
    const eave = 1.20;
    const ridge = 1.91;
    const face = (u, z) => p(u, .536, z);
    const flank = (v, z) => p(.824, v, z);
    box(context, camera, art, x, y, 1.85, 1.16, .16, "#706251", "#453d36", "#af9876", outline);
    box(context, camera, art, x, y, 1.64, 1.06, 1.115, "#9b8165", "#665a48", "#a99674", outline, .16);
    opaqueFace(context, art, [face(-.82, 1.265), face(0, ridge), face(.82, 1.265)], "#a28b6e");
    for (const level of [.31, .54, .95, 1.24]) {
      art.line(context, [face(-.815, level), face(.815, level), flank(-.52, level)], "#4a4036ad", .85);
    }
    for (const side of [-1, 1]) {
      const u = side * .65;
      art.poly(context, [face(u - .065, .19), face(u - .04, 1.18), face(u + .041, 1.18),
        face(u + .063, .19)], "#c0a37c", "#6d573e", .8);
      art.line(context, [face(u - .085, 1.105), face(u + .083, 1.105)], brass, 1.2);
      art.poly(context, chapelArch(flank, side * .25, .125, .50, .78, 1.035), "#322b2b", "#bea779", 1.05);
      art.poly(context, chapelArch(flank, side * .25, .077, .57, .77, .944), side < 0 ? "#70a99b" : "#e8bd78");
      art.line(context, [flank(side * .25, .57), flank(side * .25, .925)], "#47584e", .9);
    }
    art.poly(context, chapelArch(face, 0, .422, .165, .755, 1.17), "#4b3b32", "#e0c48e", 1.65);
    art.poly(context, chapelArch(face, 0, .322, .18, .738, 1.047), "#282b2a", "#b4925e", 1.1);
    art.poly(context, [face(-.280, .194), face(.280, .194), face(.280, .713), face(-.280, .713)], "#59402b");
    art.poly(context, [face(-.262, .733), face(0, 1.015), face(.262, .733)], "#9dc9ae", "#4d4e3a", .9);
    art.line(context, [face(-.27, .255), face(.27, .255)], brass, 1.2);
    art.line(context, [face(-.27, .656), face(.27, .656)], brass, 1.2);
    art.line(context, [face(0, .193), face(0, 1.003)], "#342a23", 1.1);
    art.ellipse(context, ...face(-.065, .455), 1.6, 1.6, "#f9d998");
    art.ellipse(context, ...face(.065, .455), 1.6, 1.6, "#f9d998");

    const rose = (angle, radius) => face(Math.cos(angle) * radius, 1.442 + Math.sin(angle) * radius);
    const circle = (radius) => Array.from({ length: 16 }, (_, i) => rose(i * Math.PI / 8, radius));
    art.poly(context, circle(.252), "#3f352d", "#efd59a", 1.45);
    const glass = ["#e9b36b", "#78ceb4", "#f7dc98", "#d38c74", "#9bddd0", "#e8bd7c"];
    for (const [index, tint] of glass.entries()) {
      const a = index * Math.PI / 3;
      art.poly(context, [rose(a, .075), rose(a - .41, .161), rose(a, .200), rose(a + .41, .161)], tint);
    }
    art.poly(context, circle(.056), "#fff0b4");
    for (const side of [-1, 1]) {
      const axis = side * .58;
      art.line(context, [face(axis, .76), face(axis, .69), face(axis - .065, .65)], "#3f3129", 1.55);
      lamp(context, camera, art, x + axis, y + .541, .65, "#ffd496", .34);
    }

    const roof = (u, v) => p(u, v, ridge - (ridge - eave) * Math.abs(u) / .917);
    const rearRidge = roof(0, -.58), frontRidge = roof(0, .58);
    const rearLeft = roof(-.917, -.58), frontLeft = roof(-.917, .58);
    const rearRight = roof(.917, -.58), frontRight = roof(.917, .58);
    opaqueFace(context, art, [rearLeft, rearRidge, frontRidge, frontLeft], "#49605a");
    opaqueFace(context, art, [rearRidge, rearRight, frontRight, frontRidge], "#437c71");
    for (const offset of [-.76, -.53, -.28, .23, .46, .69, .85]) {
      art.line(context, [roof(offset, -.579), roof(offset, .58)], offset < 0 ? "#263937" : "#a4ba8994", 1.0);
    }
    art.line(context, [frontLeft, frontRidge, frontRight, rearRight], outline, 2.0);
    art.line(context, [frontLeft, frontRidge, frontRight, rearRight], brass, .95);
    art.line(context, [rearRidge, frontRidge], "#eed197", 1.8);

    const towerX = -.43;
    const towerY = -.27;
    const towerFront = (u, z) => p(u, towerY + .279, z);
    box(context, camera, art, x + towerX, y + towerY, .72, .60, .16, "#807052", "#574c3a", "#bc9e66", outline, 1.53);
    box(context, camera, art, x + towerX, y + towerY, .62, .55, .86, "#997d58", "#60503a", "#c3a36c", outline, 1.66);
    art.poly(context, chapelArch(towerFront, towerX, .203, 1.99, 2.252, 2.442), "#212a29", "#e2bf7d", 1.3);
    art.line(context, [towerFront(towerX - .11, 2.356), towerFront(towerX + .11, 2.356)], "#aa8b56", 1.35);
    art.poly(context, [towerFront(towerX - .074, 2.32), towerFront(towerX + .074, 2.32),
      towerFront(towerX + .134, 2.118), towerFront(towerX - .134, 2.118)], "#d4a654", "#765735", .9);
    art.line(context, [towerFront(towerX - .12, 2.116), towerFront(towerX + .12, 2.116)], "#f2d691", 1.1);
    art.ellipse(context, ...towerFront(towerX, 2.066), 1.45, 1.45, "#dfba76");
    const crown = [p(towerX - .36, towerY - .325, 2.515), p(towerX + .36, towerY - .325, 2.515),
      p(towerX + .36, towerY + .325, 2.515), p(towerX - .36, towerY + .325, 2.515)];
    const finial = p(towerX, towerY, 2.87);
    opaqueFace(context, art, [crown[0], crown[1], finial], "#405350");
    opaqueFace(context, art, [crown[0], crown[3], finial], "#586b56");
    opaqueFace(context, art, [crown[3], crown[2], finial], "#a47a44", outline, 1.0);
    opaqueFace(context, art, [crown[2], crown[1], finial], "#52746b", outline, 1.0);
    art.line(context, [crown[3], crown[2], crown[1]], brass, 1.1);
    art.line(context, [crown[2], finial, p(towerX, towerY, 2.96)], "#eac87b", 1.45);
  }

  function villageShrine(context, camera, art, entry, p) {
    const { x, y, design, cloth, trim, variant } = entry;
    if (design === "chapel") {
      villageChapel(context, camera, art, entry, p);
      return;
    }

    const shade = design === "sanctuary" ? "#716c53" : "#55645e";
    const light = design === "sanctuary" ? "#f5da91" : variant % 2 ? "#b8d5df" : "#d3cc9a";
    box(context, camera, art, x, y, 1.24, .80, .17, shade, "#3e4640", "#9b9980", "#353c35");
    box(context, camera, art, x, y + .02, .66, .43, .34, shade, "#3e4640", "#b4ad91", "#3a3d34", .17);
    for (const side of [-1, 1]) {
      box(context, camera, art, x + side * .48, y - .18, .13, .18, .76, shade, "#3d4641", trim, "#3a4039", .17);
      lamp(context, camera, art, x + side * .48, y - .18, .95, light, .46);
    }
    const roof = [p(-.57, -.18, .93), p(0, -.18, 1.36), p(.57, -.18, .93), p(.31, -.18, .89),
      p(0, -.18, 1.15), p(-.31, -.18, .89)];
    if (art.occlusion) art.occlusion.push({ faces: [[roof[0], roof[1], roof[4], roof[5]], [roof[1], roof[2], roof[3], roof[4]]] });
    else art.poly(context, roof, trim, "#4c5347");
    art.poly(context, [p(-.16, .25, .34), p(.16, .25, .34), p(.17, .25, .17), p(-.17, .25, .17)], cloth);
    sidePanel(context, camera, art, x, y + .238, .11, .23, .30, light);
  }

  const villageProps = {
    board: villageBoard,
    shop: villageShop,
    campfire: villageFire,
    shrine: villageShrine,
  };

  function station(context, camera, entry, art) {
    const { x, y, kind, inhabited, cloth, trim } = entry;
    const p = (dx, dy, z = 0.025) => art.point(camera, x + dx, y + dy, z);
    const frame = inhabited ? cloth : "#596a67";
    art.poly(context, art.rectangle(camera, x - 0.72, y - 0.55, 1.44, 1.10, 0.016), "#1b2928b0");
    art.line(context, [p(-0.70, 0.55), p(0.70, 0.55)], trim + "9a", 1.4);
    contact(context, camera, art, x, y, 1.2);

    const drawVillageProp = villageProps[kind];
    if (drawVillageProp) {
      drawVillageProp(context, camera, art, entry, p);
      return;
    }

    if (kind === "workbench") {
      if (inhabited) attendant(context, camera, art, x + 0.25, y - 0.58,
        entry.style === "forge" ? "#99654b" : frame, entry.variant + 1);
      for (const offset of [-0.41, 0.41]) {
        upright(context, camera, art, x + offset, y + 0.25, 0.04, 0.53, "#514231", Math.max(2, camera.unit * 0.07));
      }
      box(context, camera, art, x, y, 1.22, 0.70, 0.11, "#62503d", "#403729", "#a88b5f", "#393122", 0.49);
      box(context, camera, art, x - 0.35, y + 0.02, 0.28, 0.35, 0.21, "#4c5855", "#353c3b", "#8a9890", "#232e2c", 0.60);
      art.line(context, [p(-0.06, -0.13, 0.64), p(0.35, 0.14, 0.64)], "#d6c8a7", 2);
      art.line(context, [p(0.20, -0.19, 0.64), p(0.39, -0.01, 0.64)], "#d29365", 1.65);
      lamp(context, camera, art, x + 0.4, y - 0.19, 0.90, "#ffbf7a", 0.55);
      return;
    }

    for (const side of [-1, 1]) {
      box(context, camera, art, x + side * 0.57, y, 0.17, 0.29, 1.02, "#72664d", "#4b4737", "#a59b72", "#2b322c");
      lamp(context, camera, art, x + side * 0.57, y + 0.14, 0.87, "#a7dac0", 0.56);
    }
    box(context, camera, art, x, y, 1.31, 0.3, 0.19, frame, "#344339", "#8e9c79", "#2b322c", 0.99);
    art.line(context, [p(-0.34, 0.04), p(0.17, 0.04), p(0.03, -0.11)], trim, 1.7);
    art.line(context, [p(0.17, 0.04), p(0.03, 0.17)], trim, 1.7);
  }

  const shelterOcclusions = new WeakMap();

  function occlusionShapes(room, stations = room?.stations ?? []) {
    if (!room) return [];
    const cached = shelterOcclusions.get(room);
    if (cached?.stations === stations) return cached.shapes;
    const shapes = [];
    const camera = { unit: 1 };
    const skip = () => {};
    // Reuse the drawing dimensions, recording opaque faces and boxes in world space only.
    const art = { occlusion: shapes, palette: {}, point: (_camera, x, y, z = 0) => [x, y, z],
      rectangle: skip, line: skip, ellipse: skip, poly: skip };
    shelterDecoration(null, camera, art, room);
    for (const entry of stations) {
      if (entry.kind !== "campfire") station(null, camera, entry, art);
    }
    shelterOcclusions.set(room, { stations, shapes });
    return shapes;
  }

  window.TowerShelter = { create, dress, station, occlusionShapes };
})();
