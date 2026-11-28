(() => {
  "use strict";

  const spacing = 0.64;
  const arrivedAt = 0.15;
  const mapCache = new WeakMap();
  const actorRoutes = new WeakMap();

  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function unit(x, y) {
    const length = Math.hypot(x, y);
    return length > 0.001 ? { x: x / length, y: y / length } : null;
  }

  function segmentOpen(from, to, radius, openStep) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const samples = Math.max(1, Math.ceil(Math.hypot(dx, dy) / 0.19));
    let previous = from;
    for (let index = 1; index <= samples; index++) {
      const x = from.x + dx * index / samples;
      const y = from.y + dy * index / samples;
      // Enemy movement resolves x before y. Match that order at corners and stair landings.
      if (dx && !openStep(previous, x, previous.y, radius)) return false;
      if (dy && !openStep({ x, y: previous.y }, x, y, radius)) return false;
      previous = { x, y };
    }
    return true;
  }

  function navigationFor(state) {
    const cached = mapCache.get(state);
    if (cached?.map === state.map && cached.obstacles === state.obstacles &&
        cached.terrain === state.terrain && cached.elevation === state.elevation) return cached;
    const navigation = { map: state.map, obstacles: state.obstacles, terrain: state.terrain,
      elevation: state.elevation, grids: new Map() };
    mapCache.set(state, navigation);
    return navigation;
  }

  function gridFor(navigation, radius, walkable, openStep) {
    const cached = navigation.grids.get(radius);
    if (cached) return cached;
    const columns = Math.floor(navigation.map.width / spacing);
    const rows = Math.floor(navigation.map.height / spacing);
    const points = Array.from({ length: columns * rows }, (_, index) => ({
      x: (index % columns + 0.5) * spacing, y: (Math.floor(index / columns) + 0.5) * spacing,
    }));
    const open = points.map(({ x, y }) => walkable(x, y, radius));
    const links = points.map(() => []);
    for (let index = 0; index < points.length; index++) {
      if (!open[index]) continue;
      const forward = index % columns < columns - 1 ? [index + 1, index + columns] : [index + columns];
      for (const next of forward) {
        if (!open[next] || !segmentOpen(points[index], points[next], radius, openStep)) continue;
        links[index].push(next);
        links[next].push(index);
      }
    }
    const grid = { columns, rows, points, open, links, fields: new Map() };
    navigation.grids.set(radius, grid);
    return grid;
  }

  function nearbyPoints(grid, actor) {
    const column = Math.floor(actor.x / spacing);
    const row = Math.floor(actor.y / spacing);
    const candidates = [];
    for (let y = Math.max(0, row - 2); y <= Math.min(grid.rows - 1, row + 2); y++) {
      for (let x = Math.max(0, column - 2); x <= Math.min(grid.columns - 1, column + 2); x++) {
        const index = y * grid.columns + x;
        if (!grid.open[index]) continue;
        candidates.push({ index, gap: distance(actor, grid.points[index]) });
      }
    }
    return candidates.sort((a, b) => a.gap - b.gap || a.index - b.index);
  }

  function reverseField(grid, target, radius, walkable, openStep) {
    if (grid.goal && distance(grid.goal, target) < 0.23) return grid.goal.field;
    // A player can fit beside a wall where a heavier enemy cannot. Route to reachable nearby cells in that case.
    const clearance = walkable(target.x, target.y, radius) ? radius : Math.min(radius, 0.12);
    const nearby = nearbyPoints(grid, target);
    const destinations = [];
    let nearest = Infinity;
    for (const { index, gap } of nearby) {
      if (gap > 1.38 || gap > nearest + 0.34) break;
      if (!segmentOpen(grid.points[index], target, clearance, openStep)) continue;
      nearest = Math.min(nearest, gap);
      destinations.push(index);
    }
    destinations.sort((a, b) => a - b);
    const key = destinations.join(",");
    let field = grid.fields.get(key);
    if (!field && destinations.length) {
      const next = new Int32Array(grid.points.length).fill(-1);
      const costs = new Int32Array(grid.points.length).fill(-1);
      const queue = [...destinations];
      for (const index of destinations) {
        next[index] = index;
        costs[index] = 0;
      }
      for (let index = 0; index < queue.length; index++) {
        const point = queue[index];
        for (const neighbor of grid.links[point]) {
          if (costs[neighbor] >= 0) continue;
          costs[neighbor] = costs[point] + 1;
          next[neighbor] = point;
          queue.push(neighbor);
        }
      }
      field = { next, costs };
      if (grid.fields.size >= 4) grid.fields.delete(grid.fields.keys().next().value);
      grid.fields.set(key, field);
    }
    grid.goal = { x: target.x, y: target.y, field };
    return field;
  }

  function directPath(route, enemy, target, radius, walkable, openStep) {
    const cached = route.direct;
    if (cached && distance(cached.from, enemy) < 0.18 && distance(cached.to, target) < 0.18) return cached.clear;
    const clear = walkable(target.x, target.y, radius) && segmentOpen(enemy, target, radius, openStep);
    route.direct = { from: { x: enemy.x, y: enemy.y }, to: { x: target.x, y: target.y }, clear };
    return clear;
  }

  function routeWaypoint(route, grid, field, enemy, radius, openStep) {
    const previous = route.waypoint;
    if (previous != null && distance(enemy, grid.points[previous]) > arrivedAt &&
        segmentOpen(enemy, grid.points[previous], radius, openStep)) return previous;

    let origin = previous;
    if (origin == null || field.costs[origin] < 0 || distance(enemy, grid.points[origin]) > arrivedAt) {
      origin = null;
      let cheapest = Infinity;
      for (const { index, gap } of nearbyPoints(grid, enemy)) {
        if (gap > spacing * 2.5) break;
        const steps = field.costs[index];
        if (steps < 0 || steps * spacing + gap >= cheapest ||
            !segmentOpen(enemy, grid.points[index], radius, openStep)) continue;
        origin = index;
        cheapest = steps * spacing + gap;
      }
    }
    if (origin == null) return null;

    // Follow the reverse field, skipping intermediate cells only when the full segment is traversable.
    let waypoint = origin;
    for (let shortcut = 0; shortcut < 3; shortcut++) {
      const next = field.next[waypoint];
      if (next === waypoint || !segmentOpen(enemy, grid.points[next], radius, openStep)) break;
      waypoint = next;
    }
    // A nearby corner or landing still has to be reached before the turn fits.
    if (waypoint === origin && field.next[origin] !== origin) return origin;
    return distance(enemy, grid.points[waypoint]) > arrivedAt ? waypoint : null;
  }

  function direction(enemy, desired, radius, { state, walkable, openStep, destination }) {
    const target = destination ?? state.player;
    const direct = unit(target.x - enemy.x, target.y - enemy.y);
    if (!direct) return null;
    const navigation = navigationFor(state);
    let route = actorRoutes.get(enemy);
    if (!route || route.navigation !== navigation || route.radius !== radius) {
      route = { navigation, radius, waypoint: null };
      actorRoutes.set(enemy, route);
    }
    if (route.destination !== destination) {
      route.destination = destination;
      route.waypoint = null;
      route.direct = null;
    }
    if (directPath(route, enemy, target, radius, walkable, openStep)) {
      const aim = desired && unit(desired.x, desired.y);
      const probe = Math.min(0.31, distance(enemy, target));
      if (segmentOpen(enemy, { x: enemy.x + direct.x * probe, y: enemy.y + direct.y * probe }, radius, openStep)) {
        route.waypoint = null;
        if (aim && aim.x * direct.x + aim.y * direct.y >= 0.52 &&
            segmentOpen(enemy, { x: enemy.x + aim.x * probe, y: enemy.y + aim.y * probe }, radius, openStep)) return aim;
        return direct;
      }
    }

    const grid = gridFor(navigation, radius, walkable, openStep);
    const field = reverseField(grid, target, radius, walkable, openStep);
    if (!field) return null;
    const waypoint = routeWaypoint(route, grid, field, enemy, radius, openStep);
    route.waypoint = waypoint;
    return waypoint == null ? null : unit(grid.points[waypoint].x - enemy.x, grid.points[waypoint].y - enemy.y);
  }

  window.TowerPursuit = { direction };
})();
