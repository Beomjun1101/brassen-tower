(() => {
  "use strict";

  const clearance = 0.36;
  const forward = (axis, sign, span) => axis === "x" ? { x: sign * span, y: 0 } : { x: 0, y: sign * span };
  const offset = (point, delta) => ({ x: point.x + delta.x, y: point.y + delta.y });
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function inGate(gate, point, radius) {
    const across = gate.axis === "x" ? point.y - gate.y : point.x - gate.x;
    const along = gate.axis === "x" ? point.x - gate.x : point.y - gate.y;
    return Math.max(0, Math.abs(across) - gate.width * 0.5) ** 2 +
      Math.max(0, Math.abs(along) - 0.16) ** 2 < radius ** 2;
  }

  function clearSegment(from, to, pass) {
    const steps = Math.max(1, Math.ceil(distance(from, to) / 0.23));
    let previous = from;
    for (let index = 1; index <= steps; index++) {
      const next = { x: from.x + (to.x - from.x) * index / steps, y: from.y + (to.y - from.y) * index / steps };
      if (!pass(previous, next, clearance)) return false;
      previous = next;
    }
    return true;
  }

  function approachExists(start, goal, gate, pass, { width, height }) {
    const segment = (from, to, radius) => !inGate(gate, to, radius) &&
      !inGate(gate, { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, radius) && pass(from, to, radius);
    if (clearSegment(start, goal, segment)) return true;
    const spacing = 0.55;
    const columns = Math.floor(width / spacing);
    const rows = Math.floor(height / spacing);
    const visited = new Uint8Array(columns * rows);
    const queue = [];
    const enqueue = (col, row, from) => {
      const index = row * columns + col;
      if (col < 0 || col >= columns || row < 0 || row >= rows || visited[index]) return;
      const point = { x: (col + 0.5) * spacing, y: (row + 0.5) * spacing, col, row };
      if (!segment(from, point, clearance)) return;
      visited[index] = 1;
      queue.push(point);
    };
    const startX = Math.floor(start.x / spacing), startY = Math.floor(start.y / spacing);
    for (let x = startX - 1; x <= startX + 1; x++) {
      for (let y = startY - 1; y <= startY + 1; y++) enqueue(x, y, start);
    }
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      if (distance(current, goal) <= 0.8 && clearSegment(current, goal, segment)) return true;
      enqueue(current.col - 1, current.row, current);
      enqueue(current.col + 1, current.row, current);
      enqueue(current.col, current.row - 1, current);
      enqueue(current.col, current.row + 1, current);
    }
    return false;
  }

  function candidateLanes({ graph, anchor, player, bounds, pass, kind, heightAt }) {
    const candidates = [];
    function nominate(door, actual) {
      const axis = door.axis;
      const gate = { x: door.x, y: door.y, axis, width: Math.min(3.25, door.width), progress: 1 };
      if (kind !== "passage" && inGate(gate, player, 0.47)) return;
      // Put the housing on a level part of the doorway, even when the walkway continues up a ramp.
      const side = axis === "x" ? "y" : "x";
      if (Math.abs(heightAt(offset(gate, forward(side, -1, 0.65))) -
          heightAt(offset(gate, forward(side, 1, 0.65)))) > 0.10) return;
      for (const sign of [1, -1]) {
        if (kind !== "passage" && (player[axis] - gate[axis]) * sign > 0.35) continue;
        const near = offset(gate, forward(axis, -sign, 2.25));
        const far = offset(gate, forward(axis, sign, 2.25));
        if (!pass(near, near, clearance) || !clearSegment(near, far, pass) || !clearSegment(far, near, pass)) continue;
        const pedestal = offset(gate, forward(axis, -sign, 1.22));
        for (const shift of [-0.79, 0.79]) {
          const control = offset(pedestal, forward(side, Math.sign(shift), Math.abs(shift)));
          if (!pass(control, control, 0.50) ||
              Math.abs(heightAt(control) - heightAt(pedestal)) > 0.16) continue;
          const priority = distance(control, player) + distance(gate, anchor) * 0.32 + (actual ? 0 : 7.5);
          candidates.push({ gate, near, far, control, axis, sign, priority });
        }
      }
    }
    for (const link of graph?.links ?? []) nominate(link, true);
    // Authored legacy rooms can still stage the action in an open section of their map.
    for (const center of [anchor, player]) {
      for (const axis of ["x", "y"]) {
        for (const shift of [0, 1.2, -1.2, 2.4, -2.4]) {
          const side = axis === "x" ? "y" : "x";
          const door = { ...offset(center, forward(side, Math.sign(shift), Math.abs(shift))), axis, width: 2.35 };
          nominate(door, false);
        }
      }
    }
    return candidates.sort((a, b) => a.priority - b.priority).find(({ control, gate }) =>
      kind === "passage" || approachExists(player, control, gate, pass, bounds));
  }

  function actor(id, role, point, toward) {
    return { ...point, id, role, facingX: toward.x - point.x, facingY: toward.y - point.y, moving: false };
  }

  function create(context) {
    const { kind } = context;
    const lane = candidateLanes(context);
    if (!lane) return null;
    const { near, far, gate, axis, sign } = lane;
    if (kind === "lockdown") {
      const lever = offset(gate, forward(axis, sign, 0.56));
      const guard = actor("lockdown-guard", "guard", far, lever);
      return { ...lane, kind, lever, actors: [guard], phase: "approach", elapsed: 0, intervene: false, done: false };
    }
    if (kind === "escort") gate.progress = 0;
    const role = kind === "passage" && context.branch === "district" ? "porter" : "patient";
    const cargo = actor("convoy-cargo", role, near, far);
    const guide = actor("convoy-guide", "porter", offset(near, forward(axis, sign, 0.78)), far);
    return { ...lane, kind, actors: [cargo, guide], phase: "waiting", elapsed: 0, done: false };
  }

  function advance(actor, target, delta, speed) {
    const dx = target.x - actor.x, dy = target.y - actor.y;
    const remaining = Math.hypot(dx, dy);
    actor.moving = remaining > 0.015;
    actor.stalled = false;
    if (!actor.moving) return true;
    const step = Math.min(remaining, delta * speed);
    actor.facingX = dx / remaining;
    actor.facingY = dy / remaining;
    actor.x += actor.facingX * step;
    actor.y += actor.facingY * step;
    return remaining - step <= 0.015;
  }

  function update(action, delta, { held, player }) {
    const { actors, gate, kind } = action;
    const playerAcross = (player[action.axis] - gate[action.axis]) * action.sign > 0.35;
    action.elapsed += delta;
    if (kind === "lockdown") {
      const [guard] = actors;
      if (action.intervene) {
        action.phase = "opening";
        gate.progress = Math.min(1, gate.progress + delta * 2.2);
        const withdrew = advance(guard, action.far, delta, 2.55);
        action.done = gate.progress >= 1 && withdrew;
      } else if (action.phase === "approach") {
        if (advance(guard, action.lever, delta, 2.35)) {
          action.phase = "closing";
          guard.moving = false;
        }
      } else if (action.phase === "closing" && !playerAcross && !inGate(gate, player, 0.31)) {
        gate.progress = Math.max(0, gate.progress - delta * 1.5);
        if (gate.progress === 0) action.phase = "closed";
      }
      return;
    }
    const moving = kind === "passage" || (held && gate.progress >= 0.90);
    if (kind === "escort") {
      const inDoorway = actors.some((person) => inGate(gate, person, 0.55));
      const base = inDoorway || playerAcross || inGate(gate, player, 0.31) ? 0.90 : 0;
      gate.progress = Math.min(1, Math.max(base, gate.progress + delta * (held ? 1.72 : -1.28)));
    }
    if (!moving) {
      action.phase = "waiting";
      for (const person of actors) {
        person.moving = false;
        person.stalled = true;
      }
      return;
    }
    action.phase = "crossing";
    const [cargo, guide] = actors;
    // Keep the guide ahead of the convoy and clear of the doorway once both arrive.
    advance(guide, action.far, delta, 2.35);
    const end = offset(action.far, forward(action.axis, -action.sign, 0.68));
    action.done = advance(cargo, end, delta, 2.05);
    if (action.done) {
      cargo.moving = false;
      guide.moving = false;
      action.phase = "arrived";
    }
  }

  window.TowerFieldScenes = { create, update, inGate };
})();
