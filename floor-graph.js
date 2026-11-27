(() => {
  "use strict";

  const wallThickness = 0.58;
  const minimumRoom = 5.8;
  const area = (room) => (room.right - room.left) * (room.bottom - room.top);
  const middle = ({ left, right, top, bottom }) => ({ x: (left + right) / 2, y: (top + bottom) / 2 });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  function movementContext({ floor, choices = {}, kind }) {
    const decision = floor >= 16 && choices.inspection || floor >= 6 && choices.reservoir || choices.commission;
    if (decision === "quiet" || decision === "evidence") return { mode: "bypass", extra: 2, vertical: 0.44 };
    if (decision === "reserve" || kind === "relay") return { mode: "junction", extra: 1, vertical: 0.72 };
    if (decision === "escort" || decision === "district" || kind === "hold") return { mode: "evacuation", extra: 0, vertical: 0.70 };
    return { mode: "crossing", extra: kind === "boss" ? 0 : 1, vertical: 0.78 };
  }

  function randomFor(context, intent) {
    let seed = (Number(context.seed) ^ Math.imul(context.floor, 0x9e3779b1) ^
      Math.imul((context.attempt ?? 0) + 1, 0x45d9f3b) ^ (context.placement << 14) ^ (context.minor << 6) ^ context.macro) | 0;
    for (const letter of intent.mode + context.kind + context.theme) seed = Math.imul(seed ^ letter.charCodeAt(0), 0x01000193);
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let value = Math.imul(seed ^ (seed >>> 15), seed | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    };
  }

  function partition(width, height, count, rng, intent, profile) {
    const sections = [{ left: 0, right: width, top: 0, bottom: height }];
    let firstCut;
    while (sections.length < count) {
      const choices = sections.map((room, index) => {
        const w = room.right - room.left;
        const h = room.bottom - room.top;
        const canX = w >= minimumRoom * 2;
        const canY = h >= minimumRoom * 2;
        return { index, room, w, h, canX, canY, priority: area(room) * (0.78 + rng() * 0.44) };
      }).filter(({ canX, canY }) => canX || canY).sort((a, b) => b.priority - a.priority);
      if (!choices.length) break;
      const { index, room, w, h, canX, canY } = choices[0];
      const preference = firstCut ? clamp(w / (w + h) * 1.25, 0.22, 0.78) : intent.vertical;
      const axis = canX && (!canY || rng() < preference) ? "x" : "y";
      const low = axis === "x" ? room.left : room.top;
      const high = axis === "x" ? room.right : room.bottom;
      const skew = (profile?.laneBias ?? 0) * (!firstCut ? 0.036 : 0.02);
      const fraction = (intent.mode === "bypass" ? 0.33 : 0.39) + rng() * (intent.mode === "bypass" ? 0.34 : 0.22) + skew;
      const position = clamp(Math.round((low + (high - low) * fraction) * 2) / 2,
        low + minimumRoom, high - minimumRoom);
      sections.splice(index, 1, axis === "x" ? { ...room, right: position } : { ...room, bottom: position },
        axis === "x" ? { ...room, left: position } : { ...room, top: position });
      firstCut ??= { axis, position };
    }
    return { firstCut, rooms: sections.map((room, id) => ({
      ...room, ...middle(room), w: room.right - room.left, h: room.bottom - room.top, id,
    })) };
  }

  function border(a, b) {
    if (a.right === b.left || b.right === a.left) {
      return { axis: "x", position: a.right === b.left ? a.right : b.right,
        start: Math.max(a.top, b.top), end: Math.min(a.bottom, b.bottom) };
    }
    if (a.bottom === b.top || b.bottom === a.top) {
      return { axis: "y", position: a.bottom === b.top ? a.bottom : b.bottom,
        start: Math.max(a.left, b.left), end: Math.min(a.right, b.right) };
    }
    return null;
  }

  function neighbors(rooms, rng) {
    const edges = [];
    for (const a of rooms) {
      for (const b of rooms.slice(a.id + 1)) {
        const shared = border(a, b);
        if (shared && shared.end - shared.start > 0.001) {
          edges.push({ ...shared, a: a.id, b: b.id, score: rng() });
        }
      }
    }
    return edges;
  }

  function spanning(rooms, edges, entry, intent, exit, width, height) {
    const center = { x: width * 0.5, y: height * 0.5 };
    const start = intent.mode === "junction"
      ? rooms.reduce((best, room) => distance(room, center) < distance(best, center) ? room : best).id : entry;
    const connected = new Set([start]);
    const selected = new Set();
    const degrees = rooms.map(() => 0);
    while (connected.size < rooms.length) {
      let pick;
      let best = Infinity;
      for (const edge of edges) {
        const a = connected.has(edge.a);
        const b = connected.has(edge.b);
        if (a === b || edge.end - edge.start < 3.65) continue;
        const from = a ? edge.a : edge.b;
        const to = a ? edge.b : edge.a;
        const narrow = (intent.mode === "evacuation" ? 0.72 : 0.35) / (edge.end - edge.start - 3.1);
        const bias = intent.mode === "evacuation" ? degrees[from] * 0.37 :
          intent.mode === "junction" ? distance(rooms[from], rooms[start]) * 0.045 :
          distance(rooms[to], rooms[exit]) * 0.014;
        const cost = edge.score + narrow + bias;
        if (cost < best) {
          best = cost;
          pick = edge;
        }
      }
      if (!pick) return null;
      selected.add(pick);
      connected.add(pick.a);
      connected.add(pick.b);
      degrees[pick.a]++;
      degrees[pick.b]++;
    }
    const remaining = edges.filter((edge) => !selected.has(edge) && edge.end - edge.start >= 4)
      .sort((a, b) => a.score - b.score);
    for (const edge of remaining.slice(0, intent.extra)) selected.add(edge);
    return selected;
  }

  function findRoute(rooms, links, entry, exit) {
    const route = new Map([[entry, [entry]]]);
    for (const [current, path] of route) {
      if (current === exit) return path;
      for (const link of links) {
        const next = link.a === current ? link.b : link.b === current ? link.a : -1;
        if (next >= 0 && next < rooms.length && !route.has(next)) route.set(next, [...path, next]);
      }
    }
    return [];
  }

  function boardRect(axis, position, start, end, depth) {
    return axis === "x" ? { x: position, y: (start + end) / 2, w: depth, h: end - start }
      : { x: (start + end) / 2, y: position, w: end - start, h: depth };
  }

  function build(context) {
    const { width, height, floor, profile } = context;
    if (floor < 1 || floor > 20 || width < 17 || height < 14) return null;
    const intent = movementContext(context);
    const rng = randomFor(context, intent);
    const baseline = context.kind === "shelter" ? 4 : context.kind === "boss" ? 4 : floor <= 4 ? 4 : 5;
    const roomCount = baseline + Number(rng() > 0.56) + Number(intent.mode === "bypass" && floor > 4)
      + Number(profile?.structureIndex === 1 && width * height > 630);
    const { rooms, firstCut } = partition(width, height, roomCount, rng, intent, profile);
    if (rooms.length < 3) return null;
    const entry = rooms.filter((room) => room.left === 0)
      .sort((a, b) => Math.abs(a.y - height * 0.58) - Math.abs(b.y - height * 0.58))[0].id;
    const exit = rooms.filter((room) => room.right === width)
      .sort((a, b) => Math.abs(a.y - height * 0.42) - Math.abs(b.y - height * 0.42) +
        (context.kind === "boss" ? (area(b) - area(a)) * 0.10 : 0))[0].id;
    if (entry === exit) return null;
    const edges = neighbors(rooms, rng);
    const connections = spanning(rooms, edges, entry, intent, exit, width, height);
    if (!connections) return null;
    const links = [];
    const walls = [];
    for (const edge of edges) {
      const { axis, position, start, end, a, b } = edge;
      const wall = (left, right) => {
        if (right - left > 0.04) walls.push({ ...boardRect(axis, position, left, right, wallThickness), structural: true });
      };
      if (!connections.has(edge)) {
        wall(start, end);
        continue;
      }
      const width = Math.min(end - start - 0.78, 2.75 + rng() * 0.50 + (intent.mode === "evacuation" ? 0.23 : 0));
      const pad = width / 2 + 0.38;
      const center = start + pad + (end - start - pad * 2) * rng();
      wall(start, center - width / 2);
      wall(center + width / 2, end);
      links.push({ a, b, axis, position, width,
        x: axis === "x" ? position : center, y: axis === "x" ? center : position });
    }
    return { rooms, links, walls, entry, exit, firstCut, mode: intent.mode, route: findRoute(rooms, links, entry, exit) };
  }

  function waterway(stage, graph, width, depth) {
    if (!stage.terrain.some(({ kind }) => kind === "water")) return [];
    const { axis, position } = graph.firstCut;
    const wet = 1.42;
    const span = axis === "x" ? depth : width;
    const water = { ...boardRect(axis, position, 0, span, wet), kind: "water" };
    const bridges = graph.links.filter((link) => link.axis === axis && Math.abs(link.position - position) < 0.001);
    return [water, ...bridges.map(({ x, y, width: opening }) =>
      ({ ...boardRect(axis, position, (axis === "x" ? y : x) - opening / 2,
        (axis === "x" ? y : x) + opening / 2, wet + 0.75), kind: "bridge" }))];
  }

  function overlapInterior(a, b) {
    return Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-6
      && Math.abs(a.y - b.y) < (a.h + b.h) / 2 - 1e-6;
  }

  function upperRoom(stage, graph) {
    if (!stage.elevation) return null;
    const deck = graph.rooms[graph.exit];
    const raised = [deck];
    if (stage.kind === "relay") {
      const other = graph.links.filter(({ a, b }) => a === deck.id || b === deck.id)
        .map(({ a, b }) => graph.rooms[a === deck.id ? b : a]).filter(({ id }) => id !== graph.entry)
        .sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if (other) raised.push(other);
    }
    const upperIds = new Set(raised.map(({ id }) => id));
    const ramps = graph.links.filter(({ a, b }) => upperIds.has(a) !== upperIds.has(b)).map((link) => {
      const destination = graph.rooms[upperIds.has(link.a) ? link.a : link.b];
      const uphill = link.axis === "x" ? destination.x > link.x : destination.y > link.y;
      const rise = uphill ? 1 : -1;
      const run = 2.3;
      const transverse = link.axis === "x" ? link.y : link.x;
      return { ...boardRect(link.axis, link.position - rise * run / 2,
        transverse - link.width / 2, transverse + link.width / 2, run), axis: link.axis, rise };
    });
    const decks = raised.map(({ x, y, w, h }) => ({ x, y, w, h }));
    // Adjacent surfaces may share an edge, but overlapping ramps assign two different heights there.
    if (ramps.some((ramp, index) => decks.some((deck) => overlapInterior(ramp, deck))
        || ramps.slice(0, index).some((other) => overlapInterior(ramp, other)))) return null;
    const elevation = { height: stage.elevation.height, title: "연결 통로 상단", decks, stairs: ramps };
    const { heightAt, canTraverse } = window.TowerContent;
    const continuous = ramps.every(({ x, y, w, h, axis, rise }) => {
      const low = { x, y };
      const high = { x, y };
      const approach = ((axis === "x" ? w : h) / 2 + 0.18) * rise;
      low[axis] -= approach;
      high[axis] += approach;
      return heightAt(elevation, low.x, low.y) === 0 && heightAt(elevation, high.x, high.y) === elevation.height
        && canTraverse(elevation, low.x, low.y, high.x, high.y);
    });
    return continuous ? elevation : null;
  }

  function recreate(stage, graph, width, height, context) {
    const geometry = window.TowerContent;
    const elevation = upperRoom(stage, graph);
    if (stage.elevation && !elevation) return null;
    const terrain = waterway(stage, graph, width, height);
    const walls = [...graph.walls];
    const reserved = [];
    let exitClearance;
    const random = randomFor({ ...context, attempt: (context.attempt ?? 0) + 17 }, movementContext(context));
    const inFootprint = (point, body, margin) =>
      Math.abs(point.x - body.x) <= body.w / 2 + margin && Math.abs(point.y - body.y) <= body.h / 2 + margin;
    const clear = (point, margin) => geometry.isDry(elevation, terrain, point.x, point.y, margin)
      && !walls.some((wall) => inFootprint(point, wall, margin))
      && !(exitClearance && inFootprint(point, exitClearance, margin))
      && !elevation?.stairs.some((stair) => inFootprint(point, stair, margin * 0.75));
    function place(room, desired, margin = 0.60, separation = 1.10) {
      const border = margin + 0.47;
      const points = [desired];
      for (let x = room.left + border; x <= room.right - border; x += 0.82) {
        for (let y = room.top + border; y <= room.bottom - border; y += 0.82) points.push({ x, y });
      }
      let chosen;
      let closest = Infinity;
      for (const point of points) {
        if (point.x < room.left + border || point.x > room.right - border ||
            point.y < room.top + border || point.y > room.bottom - border || !clear(point, margin) ||
            reserved.some((other) => distance(point, other) < separation)) continue;
        const cost = distance(point, desired);
        if (cost < closest) {
          chosen = point;
          closest = cost;
        }
      }
      if (chosen) reserved.push(chosen);
      return chosen;
    }
    const rooms = graph.rooms;
    const entry = rooms[graph.entry];
    const end = rooms[graph.exit];
    const regions = rooms.filter(({ id }) => id !== entry.id && id !== end.id);
    const sideRooms = regions.filter(({ id }) => !graph.route.includes(id));
    const storageRooms = graph.mode === "junction"
      ? [...sideRooms, ...regions.filter((room) => !sideRooms.includes(room))]
      : [...regions].sort((a, b) => a.x - b.x || a.y - b.y);
    const route = graph.route.map((id) => rooms[id]);
    const nearEnd = route.at(-2) ?? entry;
    const isUpper = (room, position) => room.elevation &&
      geometry.heightAt(room.elevation, position.x, position.y) >= room.elevation.height / 2;
    const rebuiltRoom = { elevation };
    const spawn = place(entry, { x: entry.left + 1.55, y: entry.y + 0.5 });
    const hasExit = stage.items.some(({ kind }) => kind === "exit");
    const goal = (stage.number === 1 || hasExit)
      ? place(end, { x: end.right - 1.75, y: end.y }, 0.68) : null;
    if (goal && hasExit) exitClearance = { x: goal.x + 0.64, y: goal.y, w: 0.30, h: 2.30 };
    const holdPosition = stage.hold ? place(end, end, 0.82, 2.1) : null;
    const storySocket = stage.storySocket ? place(end, { x: end.x, y: end.y + end.h * 0.20 }, 0.87, 2.1) : null;
    if (!spawn || (stage.number === 1 || hasExit) && !goal ||
        stage.hold && !holdPosition || stage.storySocket && !storySocket) return null;
    const hold = holdPosition ? { ...stage.hold, ...holdPosition, radius: Math.min(stage.hold.radius, end.w * 0.36, end.h * 0.36) } : null;
    const roomsByHeight = (upper) => [...storageRooms, end, entry]
      .filter((room) => Boolean(isUpper(rebuiltRoom, room)) === upper);
    const items = stage.items.map((item, index) => {
      const choices = roomsByHeight(Boolean(isUpper(stage, item)));
      const room = choices[index % choices.length] ?? nearEnd;
      const spot = item.kind === "exit" ? goal : place(room, room, 0.65);
      return spot ? { ...item, ...spot } : null;
    });
    let index = 0;
    const populate = (enemy) => {
      const jitter = () => (random() - 0.5) * 2.25;
      const role = index++;
      const encounterRooms = route.length > 2 ? route.slice(1) : [...regions, end];
      const upperSentry = enemy.kind === "sentry" && isUpper(stage, enemy);
      const upperChoices = upperSentry ? roomsByHeight(true) : [];
      const preferred = enemy.kind === "boss" || enemy.gateGuard || enemy.target ? end :
        upperSentry ? upperChoices[role % upperChoices.length] ?? end :
        enemy.engaged ? entry : encounterRooms[role % encounterRooms.length] ?? end;
      const desired = enemy.kind === "boss" ? { x: end.x, y: end.y - end.h * 0.15 } : enemy.gateGuard && goal
        ? { x: goal.x - 1.6, y: goal.y } : { x: preferred.x + jitter(), y: preferred.y + jitter() };
      let spot = place(preferred, desired, enemy.kind === "boss" ? 0.65 : 0.57,
        enemy.kind === "boss" ? 1.55 : 1.1);
      if (!spot && enemy.kind !== "boss" && !enemy.gateGuard && !enemy.target) {
        for (const room of upperSentry ? upperChoices : regions) {
          spot = place(room, room, 0.57);
          if (spot) break;
        }
      }
      return spot ? { ...enemy, ...spot } : null;
    };
    const enemies = stage.enemies.map(populate);
    const wave = stage.wave.map(populate);
    const reinforcements = stage.reinforcements.map(populate);
    if ([...items, ...enemies, ...wave, ...reinforcements].some((point) => !point)) return null;
    const machinery = stage.obstacles.find(({ fixture }) => fixture);
    const machineRoom = storageRooms[0] ?? nearEnd;
    if (machinery) {
      const footprint = Math.min(2.1, machinery.w) * 0.5 + 0.3;
      const bay = place(machineRoom, { x: machineRoom.x + 1.28, y: machineRoom.y - 1.2 }, footprint, 1.95);
      if (bay) walls.push({ ...bay, w: Math.min(2.1, machinery.w), h: Math.min(1.45, machinery.h), fixture: machinery.fixture });
    }
    for (const hazard of stage.terrain.filter(({ kind }) => kind === "conduit" || kind === "vent")) {
      const room = rooms[(index++) % rooms.length];
      const spot = place(room, { x: room.x - 1.0, y: room.y + 0.95 }, 0.83, 1.72);
      if (spot) terrain.push({ ...hazard, ...spot, w: Math.min(1.67, hazard.w), h: Math.min(1.57, hazard.h) });
    }
    const layout = stage.rolls.at(-2);
    const detail = graph.rooms.length + "개 방 · 통로 " + graph.links.length + "곳" +
      (terrain.some(({ kind }) => kind === "bridge") ? " · 수로 교량" : "") +
      (elevation ? " · 상단 계단 " + elevation.stairs.length + "곳" : "");
    const rolls = stage.rolls.map((roll) => roll === layout ? { ...roll, detail } : roll);
    return { ...stage, width, height, rolls, spawn, items, enemies, wave, reinforcements, hold, storySocket,
      obstacles: walls, terrain, elevation, roomGraph: graph,
      floorPlan: { id: graph.mode, title: detail },
      gateMarker: stage.number === 1 ? goal : null };
  }

  function rebuild(stage, context) {
    const width = Math.max(20, stage.width);
    const height = Math.max(17, stage.height);
    const graph = build({ ...context, profile: context.proposal, width, height });
    return graph ? recreate(stage, graph, width, height, context) : null;
  }

  window.TowerFloorGraph = { build, rebuild };
})();
