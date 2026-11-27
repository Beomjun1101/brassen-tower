(() => {
  "use strict";

  const biomes = {
    sluice: {
      fog: "#16505a", upper: "#071b24", lower: "#061018",
      tiles: ["#2e4547", "#30494b", "#2b4348", "#2b4144"],
      edge: "#567b7c", seam: "#152c33", inlay: "#86a9a4", sheen: "#a9ded340",
      wallX: "#29444a", wallY: "#142a33", cap: "#779e99",
      capSide: "#426965", capDark: "#315050", accent: "#a0dfd6",
      conduit: "#549fa8", glow: "#60d3de", fixture: "#7daec7", obstacleHeight: 0.80,
      materialLight: "#528c9e", materialShade: "#0b161e", surfaceJoint: "#14242966",
    },
    relay: {
      fog: "#2a3a67", upper: "#121d35", lower: "#080d1d",
      tiles: ["#333a49", "#353f4d", "#363e4b", "#343b47"],
      edge: "#637494", seam: "#1c2336", inlay: "#7c93b4", sheen: "#a2c8ff35",
      wallX: "#313c59", wallY: "#1d243a", cap: "#8299b2",
      capSide: "#485878", capDark: "#334464", accent: "#d5deee",
      conduit: "#637de0", glow: "#a1b7ff", fixture: "#f8c477", obstacleHeight: 0.97,
      materialLight: "#8ea7d5", materialShade: "#121625", surfaceJoint: "#1b223166",
    },
    forge: {
      fog: "#512e2b", upper: "#261321", lower: "#140b15",
      tiles: ["#493939", "#503c3b", "#523e3b", "#463638"],
      edge: "#8e635d", seam: "#2e2330", inlay: "#b88b76", sheen: "#e8b69135",
      wallX: "#513338", wallY: "#392429", cap: "#ad816c",
      capSide: "#6e4d49", capDark: "#553737", accent: "#e9baa0",
      conduit: "#ac5f46", glow: "#ff985d", fixture: "#ebae80", obstacleHeight: 1.04,
      materialLight: "#c98664", materialShade: "#20131b", surfaceJoint: "#2d1e2866",
    },
  };
  const chapterEnvironments = [
    { through: 28 },
    { through: 35, landscape: "rupture", upper: "#071923", lower: "#100e1e", fog: "#455053",
      tiles: ["#35494a", "#44484a", "#3f3b46", "#4a484b"], edge: "#888b78", inlay: "#a0a995",
      wallX: "#454849", wallY: "#303743", accent: "#dfccb0", materialLight: "#a7a38a", materialShade: "#171c28" },
    { through: 209, landscape: "roots", upper: "#172c24", lower: "#071619", fog: "#415d3d",
      tiles: ["#414a32", "#4a5039", "#3b4738", "#4d533e"], edge: "#828b60", inlay: "#929f6e",
      wallX: "#3a4232", wallY: "#293332", cap: "#98916a", capSide: "#676c49", capDark: "#40462f",
      accent: "#c5ce92", materialLight: "#a6ad78", materialShade: "#242d25", surfaceJoint: "#2c352866" },
    { through: 419, landscape: "erosion", upper: "#2d271e", lower: "#17151a", fog: "#916a44",
      tiles: ["#695c47", "#6e6049", "#665741", "#74614b"], edge: "#ac906a", inlay: "#b09a73",
      wallX: "#534332", wallY: "#40352c", cap: "#ad946e", capSide: "#80684c", capDark: "#5b4734",
      accent: "#d4bd8b", materialLight: "#c3a06f", materialShade: "#342921", surfaceJoint: "#4a3b2c66" },
    { through: 664, landscape: "archive", upper: "#19292d", lower: "#0c141d", fog: "#667372",
      tiles: ["#4a5151", "#4f5653", "#484e50", "#545b56"], edge: "#8c988f", inlay: "#adb2a2",
      wallX: "#47504d", wallY: "#343b3b", cap: "#a5a897", capSide: "#696f66", capDark: "#484e48",
      accent: "#c3cebb", materialLight: "#a7b4ad", materialShade: "#202b31", surfaceJoint: "#2b373566" },
    { through: 1008, landscape: "ruins", upper: "#232336", lower: "#110f1d", fog: "#5f5469",
      tiles: ["#4d4859", "#555164", "#4d4d5d", "#5e5363"], edge: "#9889a5", inlay: "#ae9eb1",
      wallX: "#4c425b", wallY: "#322d46", cap: "#a69ab6", capSide: "#6d637c", capDark: "#4d455f",
      accent: "#d8bfd6", materialLight: "#b29ab7", materialShade: "#2a263b", surfaceJoint: "#3b344966" },
    { through: 1179, landscape: "dawn", upper: "#3d2948", lower: "#211829", fog: "#d49581",
      tiles: ["#73606a", "#78676c", "#6f5b64", "#856d73"], edge: "#b69a97", inlay: "#d1a9a4",
      wallX: "#6b515b", wallY: "#4e3b51", cap: "#c6a3a0", capSide: "#967678", capDark: "#69505c",
      accent: "#f1c2a5", materialLight: "#d59c96", materialShade: "#37293e", surfaceJoint: "#4a384c66" },
    { through: 1331, landscape: "remains", upper: "#241f30", lower: "#130f1b", fog: "#5d515c",
      tiles: ["#524c56", "#59505a", "#504b58", "#5f545d"], edge: "#9a8b9b", inlay: "#b3a3aa",
      wallX: "#494153", wallY: "#352e42", cap: "#aaa099", capSide: "#736675", capDark: "#4f4657",
      accent: "#ccc1b5", materialLight: "#b6a9a4", materialShade: "#272233", surfaceJoint: "#322a4266" },
    { through: Infinity, landscape: "stars", upper: "#151435", lower: "#070915", fog: "#57477d",
      tiles: ["#39394f", "#404158", "#3a3c57", "#45435b"], edge: "#9496c1", inlay: "#a8a9d7",
      wallX: "#403d61", wallY: "#292641", cap: "#b1b6da", capSide: "#7377a1", capDark: "#4c4e73",
      accent: "#ded7f7", materialLight: "#a5a8d3", materialShade: "#201f3b", surfaceJoint: "#22224066" },
  ];
  const environmentalPalettes = Object.fromEntries(Object.entries(biomes).map(([theme, palette]) => [
    theme, chapterEnvironments.map((chapter) => chapter.landscape ? { ...palette, ...chapter } : palette),
  ]));
  const fallbackThemes = ["sluice", "relay", "forge"];
  const backdropCache = new WeakMap();
  const terrainCache = new WeakMap();
  const terraceCache = new WeakMap();
  const shelterSceneryOrder = new WeakMap();
  const grainCache = new WeakMap();
  const frameCameras = new WeakMap();
  const motionFrames = new WeakMap();
  const motionPreference = window.matchMedia?.("(prefers-reduced-motion: reduce)");

  const heroVisualHeight = 1.40;

  const slope = 0.49;
  const tau = Math.PI * 2;
  const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
  const fraction = (value) => value - Math.floor(value);
  const noise = (a, b) => fraction(Math.sin(a * 27.125 + b * 43.261) * 12851.344);

  function surfaceHeight(elevation, x, y) {
    return elevation ? (window.TowerContent?.heightAt?.(elevation, x, y) || 0) : 0;
  }

  function cameraFor(width, height, map, player, elevation) {
    const total = map.width + map.height;
    const fit = Math.min(width / (total + 2.45), height / (total * slope + 3.5));
    const isNarrowArena = width / height < 0.9 && total > 24;
    const largeArena = total > 36;
    const scaleWithMap = largeArena ? Math.max(1, total / 46) : 1;
    const maxZoom = isNarrowArena
      ? (largeArena ? Math.min(3.10, 2.16 * scaleWithMap) : 1.60)
      : (largeArena ? Math.min(2.50, 1.73 * scaleWithMap) : 1.45);
    const zoom = player ? clamp(total / (isNarrowArena ? 20 : 22), 1, maxZoom) : 1;
    const unit = fit * zoom;
    const camera = {
      width,
      height,
      unit,
      x: (width - (map.width - map.height) * unit) / 2,
      y: (height - total * unit * slope) / 2 - unit * 0.16,
    };
    if (zoom > 1) {
      const [playerX, playerY] = point(camera, player.x, player.y, surfaceHeight(elevation, player.x, player.y));
      const panX = Math.max(0, (total * unit - width) / 2 + unit * 1.25);
      const panY = Math.max(0, (total * unit * slope - height) / 2
        + unit * (1.65 + (elevation?.height || 0) * 0.42));
      camera.x += clamp((width * 0.5 - playerX) * 0.83, -panX, panX);
      camera.y += clamp((height * 0.54 - playerY) * 0.83, -panY, panY);
    }
    return camera;
  }

  function frameCamera(canvas, bounds, state, theme, now, reduced) {
    const camera = cameraFor(bounds.width, bounds.height, state.map, state.player, state.elevation);
    const story = state.mode === "story" && (state.incident?.points.find((entry) => entry.choice && entry.done) ?? state.storyPoint);
    const gate = !reduced && state.mode === "playing" && state.gateMarker?.active && state.gateMarker;
    const key = `${theme}:${state.floor}:${state.map.width}:${state.map.height}:${bounds.width}:${bounds.height}:${Boolean(story)}`;
    if (story) {
      const focus = state.storyShot === "player" ? state.player : story;
      const wide = state.storyShot === "wide";
      const x = wide ? (focus.x + state.player.x) / 2 : focus.x;
      const y = wide ? (focus.y + state.player.y) / 2 : focus.y;
      camera.unit *= bounds.width > 580 ? 1.24 : 1.17;
      camera.x = bounds.width * 0.51 - (x - y) * camera.unit;
      const height = surfaceHeight(state.elevation, x, y);
      camera.y = bounds.height * 0.43 - ((x + y) * slope - height - 0.54) * camera.unit;
    }
    const previous = frameCameras.get(canvas);
    const elapsed = previous ? now - previous.now : Infinity;
    if (!reduced && previous?.key === key && elapsed >= 0 && elapsed < 130
      && Math.hypot(camera.x - previous.x, camera.y - previous.y) < camera.unit * 8) {
      const ease = 1 - Math.exp(-Math.max(1, elapsed) / (story ? 160 : 86));
      camera.x = previous.x + (camera.x - previous.x) * ease;
      camera.y = previous.y + (camera.y - previous.y) * ease;
    }
    const x = camera.x;
    const y = camera.y;
    if (gate) {
      const [gx, gy] = point(camera, gate.x, gate.y, 0.7);
      const push = 0.83 * eased((state.elapsed - gate.openSince + 0.045) / 0.30);
      camera.x += (bounds.width * 0.52 - gx) * push;
      camera.y += (bounds.height * 0.48 - gy) * push;
    } else if (!story && !reduced && state.cameraShakeEnabled !== false && state.cameraShake > 0) {
      const strength = clamp(state.cameraShake / 0.22, 0, 1) * Math.min(2.9, camera.unit * 0.09);
      camera.x += Math.sin(now * 0.091) * strength;
      camera.y += Math.cos(now * 0.12) * strength * 0.55;
    }
    frameCameras.set(canvas, { key, now, x, y, camera,
      floor: state.floor, elevation: state.elevation, mapWidth: state.map.width, mapHeight: state.map.height });
    return camera;
  }

  function point(camera, x, y, z = 0) {
    return [
      camera.x + (x - y) * camera.unit,
      camera.y + (x + y) * camera.unit * slope - z * camera.unit,
    ];
  }

  function rectangle(camera, x, y, width, height, z = 0) {
    return [
      point(camera, x, y, z),
      point(camera, x + width, y, z),
      point(camera, x + width, y + height, z),
      point(camera, x, y + height, z),
    ];
  }

  function raisedCamera(camera, height) {
    return height ? { ...camera, y: camera.y - camera.unit * height } : camera;
  }

  function onSurface(camera, elevation, actor) {
    return elevation ? raisedCamera(camera, surfaceHeight(elevation, actor.x, actor.y)) : camera;
  }

  function centeredBounds(entry) {
    return { left: entry.x - entry.w / 2, back: entry.y - entry.h / 2,
      right: entry.x + entry.w / 2, front: entry.y + entry.h / 2 };
  }

  function withinSurface(bounds, x, y) {
    const tolerance = 0.00001;
    return x >= bounds.left - tolerance && x <= bounds.right + tolerance
      && y >= bounds.back - tolerance && y <= bounds.front + tolerance;
  }

  function basePlanePoint(camera, x, y) {
    const horizontal = (x - camera.x) / camera.unit;
    const vertical = (y - camera.y) / (camera.unit * slope);
    return { x: (horizontal + vertical) / 2, y: (vertical - horizontal) / 2 };
  }

  function surfaceHit(elevation, ground, includeWalls) {
    if (!elevation) return { ...ground, z: 0 };
    const fullHeight = elevation.height || 0;
    const worldAt = (z) => ({ x: ground.x + z / (2 * slope), y: ground.y + z / (2 * slope), z });
    let hit = { ...ground, z: 0 };
    const apply = (z, bounds, face, owner) => {
      if (!(z > hit.z && z <= fullHeight + 0.00001)) return;
      const candidate = worldAt(z);
      if (!withinSurface(bounds, candidate.x, candidate.y)) return;
      if (face && surfaceHeight(elevation, candidate.x + (face === "x" ? 0.025 : 0),
        candidate.y + (face === "y" ? 0.025 : 0)) >= z - 0.012) return;
      hit = { ...candidate, face, bounds, owner };
    };

    for (const deck of elevation.decks ?? []) {
      const bounds = centeredBounds(deck);
      apply(fullHeight, bounds, null, deck);
      if (includeWalls) {
        apply((bounds.right - ground.x) * (2 * slope), bounds, "x", deck);
        apply((bounds.front - ground.y) * (2 * slope), bounds, "y", deck);
      }
    }
    for (const stairs of elevation.stairs ?? []) {
      const horizontal = stairs.axis === "x";
      const runs = horizontal ? stairs.w : stairs.h;
      const rise = stairs.rise < 0 ? -1 : 1;
      const start = horizontal ? ground.x - stairs.x : ground.y - stairs.y;
      const incline = fullHeight * rise / runs;
      const divisor = 1 - incline / (2 * slope);
      const bounds = centeredBounds(stairs);
      if (Math.abs(divisor) > 0.000001) {
        apply((fullHeight * 0.5 + incline * start) / divisor, bounds, null, stairs);
      }
      if (includeWalls) {
        for (const [distance, face] of [[bounds.right - ground.x, "x"], [bounds.front - ground.y, "y"]]) {
          const edgeHeight = distance * (2 * slope);
          const { x, y } = worldAt(edgeHeight);
          if (edgeHeight <= surfaceHeight(elevation, x, y) + 0.00001) apply(edgeHeight, bounds, face, stairs);
        }
      }
    }
    return hit;
  }

  function poly(context, points, fill, stroke, width = 1) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const next of points.slice(1)) context.lineTo(...next);
    context.closePath();
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.stroke();
    }
  }

  function line(context, points, stroke, width = 1) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const next of points.slice(1)) context.lineTo(...next);
    context.strokeStyle = stroke;
    context.lineWidth = width;
    context.stroke();
  }

  function ellipse(context, x, y, radiusX, radiusY, fill, stroke, width = 1) {
    context.beginPath();
    context.ellipse(x, y, radiusX, radiusY, 0, 0, tau);
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = width;
      context.stroke();
    }
  }

  function groundRing(context, camera, x, y, radius, fill, stroke, width) {
    const center = point(camera, x, y);
    ellipse(context, ...center, radius * camera.unit * Math.SQRT2,
      radius * camera.unit * Math.SQRT2 * slope, fill, stroke, width);
  }

  function contactShadow(context, x, y, unit, palette) {
    context.save();
    context.translate(x + unit * 0.20, y + unit * 0.07);
    context.rotate(0.24);
    context.scale(unit * 0.66, unit * 0.19);
    const cast = context.createRadialGradient(-0.13, 0, 0, 0.04, 0, 1);
    cast.addColorStop(0, palette.materialShade + "9c");
    cast.addColorStop(0.45, palette.materialShade + "59");
    cast.addColorStop(1, palette.materialShade + "00");
    ellipse(context, 0, 0, 1.06, 1, cast);
    context.restore();
    context.save();
    context.translate(x, y + unit * 0.015);
    context.scale(unit * 0.35, unit * 0.095);
    const contact = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    contact.addColorStop(0, "#07090dbb");
    contact.addColorStop(0.44, "#07090d79");
    contact.addColorStop(1, "#07090d00");
    ellipse(context, 0, 0, 1, 1, contact);
    context.restore();
  }

  function rockHorizon(context, width, height, tint, depth, seed, severe = false) {
    const steps = 20;
    const rim = Array.from({ length: steps + 1 }, (_, index) => [
      width * index / steps,
      height * (depth - noise(index + seed, 13) * (severe ? .18 : .05)
        - Math.sin(index * .29 + seed) ** 2 * (severe ? .19 : .13)),
    ]);
    poly(context, [...rim, [width, height], [0, height]], tint);
    return rim;
  }

  function starBackdrop(context, width, height) {
    const belt = context.createLinearGradient(0, height * .7, width, 0);
    belt.addColorStop(0, "#5d467e00");
    belt.addColorStop(.43, "#74579b45");
    belt.addColorStop(.62, "#8c66a04f");
    belt.addColorStop(1, "#43296400");
    poly(context, [[0, height * .58], [width * .82, 0], [width, height * .04],
      [width, height * .28], [width * .10, height * .86], [0, height * .77]], belt);
    for (let i = 0; i < 180; i++) {
      const x = width * noise(i, 73);
      const y = height * (i < 112 ? noise(i, 17) : clamp(.66 - x / width * .52 + (noise(i, 37) - .5) * .29, 0, 1));
      const radius = .42 + noise(i, 95) ** 2 * 1.12;
      ellipse(context, x, y, radius, radius, i % 7 === 0 ? "#ffe0bbbf" : "#d9d4fc9f");
      if (i < 10 && radius > 1) {
        line(context, [[x - radius * 2.65, y], [x + radius * 2.65, y]], "#dfc7f3a1", .62);
        line(context, [[x, y - radius * 3.35], [x, y + radius * 3.35]], "#eee2fcc1", .68);
      }
    }
    const radius = Math.min(width, height) * .113;
    const x = width * .71;
    const y = height * .21;
    context.save();
    context.translate(x, y);
    context.rotate(-.29);
    ellipse(context, 0, 0, radius * 2.08, radius * .45, null, "#d2c4eb5c", Math.max(1, radius * .033));
    ellipse(context, 0, 0, radius * 1.89, radius * .39, null, "#6f99cf59", Math.max(1.3, radius * .06));
    const disk = context.createLinearGradient(-radius, -radius, radius * .72, radius * .70);
    disk.addColorStop(0, "#ccc4e5");
    disk.addColorStop(.33, "#8f81b6");
    disk.addColorStop(.71, "#414770");
    disk.addColorStop(1, "#201c42");
    ellipse(context, 0, 0, radius, radius, disk, "#e5cef273", .85);
    context.save();
    context.beginPath();
    context.arc(0, 0, radius, 0, tau);
    context.clip();
    for (let band = -2; band <= 3; band++) {
      const px = band * radius * .20;
      line(context, [[-radius, px], [-radius * .3, px + radius * .06], [radius, px - radius * .08]],
        band % 2 ? "#ddc4e936" : "#292b593e", radius * .09);
    }
    context.restore();
    context.beginPath();
    context.ellipse(0, 0, radius * 2.08, radius * .45, 0, .15, Math.PI - .02);
    context.strokeStyle = "#e9c6f4a1";
    context.lineWidth = Math.max(1, radius * .038);
    context.stroke();
    context.restore();
  }

  function chapterBackdrop(context, camera, palette) {
    const { width, height } = camera;
    const theme = palette.landscape;
    if (theme === "stars") {
      starBackdrop(context, width, height);
      return;
    }
    if (theme === "roots") {
      rockHorizon(context, width, height, "#3d574e", .62, 16);
      rockHorizon(context, width, height, "#243e38", .74, 8);
      for (const depth of [1, 0]) {
        for (let index = 0; index < 14; index++) {
          const x = width * (index + noise(index, 91)) / 14;
          const base = height * (.77 - depth * .13);
          const tier = height * (.16 + noise(index, depth + 3) * .44);
          const spread = width * (.024 + noise(index, 57) * .035);
          const color = depth ? "#304c3e" : "#122e29";
          line(context, [[x, base], [x - spread * .2, base - tier * .68], [x + spread * .12, base - tier]], color, spread * .22);
          poly(context, [[x - spread, base - tier * .79], [x - spread * .78, base - tier],
            [x - spread * .23, base - tier * 1.10], [x + spread * .51, base - tier * 1.02],
            [x + spread, base - tier * .72], [x + spread * .27, base - tier * .67]], color);
        }
      }
      return;
    }
    if (theme === "archive" || theme === "ruins") {
      const ruins = theme === "ruins";
      rockHorizon(context, width, height, ruins ? "#4f405a" : "#3d5554", .63, 13, ruins);
      const cast = ruins ? "#372c43" : "#2d3c3e";
      const light = ruins ? "#9d829777" : "#a8ada55e";
      const span = width / (width > 650 ? 6 : 4);
      for (let i = 0; i * span < width; i++) {
        const x = i * span + span * .46;
        const foot = height * .76;
        const peak = height * (.19 + noise(i, 31) * .13);
        const r = span * (ruins ? .36 : .42);
        context.beginPath();
        context.moveTo(x - r, foot);
        context.lineTo(x - r, peak + r * .60);
        context.quadraticCurveTo(x - r * .61, peak, x, peak);
        context.quadraticCurveTo(x + r * .65, peak, x + r, peak + r * .60);
        context.lineTo(x + r, foot);
        context.strokeStyle = cast;
        context.lineWidth = r * .31;
        context.stroke();
        line(context, [[x - r * .93, peak + r * .74], [x - r * .93, foot], [x - r * .81, foot]], light, .85);
        if (ruins && i % 2 === 0) {
          poly(context, [[x + r * .78, foot], [x + r * .23, peak + r * 1.25], [x + r * 1.15, peak + r * .79],
            [x + r * 1.32, foot]], cast);
        }
      }
      return;
    }
    if (theme === "dawn") {
      const x = width * .69;
      const y = height * .46;
      const radius = Math.min(width, height) * .25;
      const haze = context.createRadialGradient(x, y, radius * .22, x, y, radius * 1.9);
      haze.addColorStop(0, "#ffe0af78");
      haze.addColorStop(1, "#ffc1a700");
      ellipse(context, x, y, radius * 2, radius * 1.1, haze);
      ellipse(context, x, y, radius * .56, radius * .56, "#f0c698cd", "#ffebc1b6", 1.05);
      for (let i = 0; i < 4; i++) {
        const yy = y + (i - .5) * radius * .16;
        line(context, [[x - radius * (1.2 + i * .19), yy], [x + radius * (1.00 + i * .08), yy]], "#e9a9a368", 1.1);
      }
      rockHorizon(context, width, height, "#86596b", .68, 7);
      rockHorizon(context, width, height, "#514054", .80, 15);
      return;
    }
    const erosion = theme === "erosion";
    const remains = theme === "remains";
    const rim = rockHorizon(context, width, height, erosion ? "#6a4e3a" : remains ? "#44384b" : "#373646", .70, 15, true);
    const thickness = height * (erosion ? .06 : .045);
    for (let strip = 1; strip <= 3; strip++) {
      line(context, rim.map(([x, y], i) => [x, y + thickness * (strip + noise(i, strip) * .48)]),
        erosion ? "#dbad7854" : "#a194a64f", thickness * .10);
    }
    if (theme === "rupture") {
      poly(context, [[width * .57, 0], [width * .65, 0], [width * .57, height * .20],
        [width * .68, height * .31], [width * .56, height * .57], [width * .59, height * .32],
        [width * .50, height * .21]], "#b4b89144");
    }
  }

  function drawBackdrop(context, camera, palette, theme) {
    const { width, height, unit } = camera;
    const fill = context.createLinearGradient(0, 0, 0, height);
    fill.addColorStop(0, palette.upper);
    fill.addColorStop(1, palette.lower);
    context.fillStyle = fill;
    context.fillRect(0, 0, width, height);

    const glow = context.createRadialGradient(
      width * 0.5, height * 0.40, 0, width * 0.5, height * 0.50, Math.max(width, height) * 0.6,
    );
    glow.addColorStop(0, palette.fog);
    glow.addColorStop(1, "#04060b00");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    if (palette.landscape) chapterBackdrop(context, camera, palette);
    if (palette.landscape && palette.landscape !== "rupture") return;

    context.save();
    for (const scale of [1, 0.62]) {
      context.globalAlpha = scale * 0.25;
      for (let column = -1; column < 12; column++) {
        const x = column * width / 10 + (scale < 1 ? width / 20 : 0);
        const y = height * (0.22 + noise(column, 7) * 0.32);
        const beam = unit * scale * (0.35 + noise(column, 3) * 0.72);
        if (theme === "sluice") {
          context.fillStyle = "#8ecbc729";
          context.fillRect(x, 0, beam, y);
          line(context, [[x, 0], [x, y], [x + beam * 2.2, y + beam * 1.1]], palette.conduit, 1.2);
        } else if (theme === "relay") {
          line(context, [[x, 0], [x, y * 0.45], [x + beam * 1.5, y * 0.56], [x + beam * 1.5, y]],
            palette.inlay, beam * 0.34 + 1);
          ellipse(context, x + beam * 1.5, y, 2, 2, palette.fixture);
        } else {
          line(context, [[x, 0], [x, y * 0.69]], palette.conduit, Math.max(1.4, beam * 0.14));
          const radius = beam * 1.7;
          poly(context, [[x - radius * 0.4, y * 0.67], [x + radius * 0.4, y * 0.67],
            [x + radius * 0.59, y * 0.80], [x + radius, y], [x - radius, y],
            [x - radius * 0.59, y * 0.80]], "#171019", palette.inlay, 0.95);
        }
      }
    }
    context.restore();
  }

  function background(context, canvas, camera, palette, theme, seconds, hazard, reduced) {
    const { width, height, unit } = camera;
    const key = `${theme}:${palette.landscape}:${width}:${height}:${unit}:${canvas.width}:${canvas.height}`;
    let backdrop = backdropCache.get(canvas);
    if (backdrop?.key !== key) {
      const surface = document.createElement("canvas");
      surface.width = canvas.width;
      surface.height = canvas.height;
      const paint = surface.getContext("2d", { alpha: false });
      paint.setTransform(surface.width / width, 0, 0, surface.height / height, 0, 0);
      paint.lineJoin = "round";
      paint.lineCap = "round";
      drawBackdrop(paint, camera, palette, theme);
      backdrop = { key, surface };
      backdropCache.set(canvas, backdrop);
    }
    context.drawImage(backdrop.surface, 0, 0, width, height);
    if (reduced) return;
    if (palette.landscape && palette.landscape !== "rupture") {
      context.save();
      for (let index = 0; index < 25; index++) {
        const stars = palette.landscape === "stars";
        const x = width * fraction(noise(index, 67) + (stars ? 0 : seconds * (.007 + noise(index, 69) * .010)));
        const y = height * fraction(noise(index, 74) - (stars ? 0 : seconds * .022));
        const size = .55 + noise(index, 78) * 1.23;
        context.globalAlpha = .18 + (.5 + Math.sin(seconds * .9 + index) * .5) * .30;
        ellipse(context, x, y, size, stars ? size : size * .65, palette.accent);
      }
      context.restore();
      return;
    }
    const speed = theme === "forge" ? 0.038 : theme === "sluice" ? -0.033 : 0.018;
    context.save();
    for (let index = 0; index < 42; index++) {
      const x = width * fraction(noise(index, 6) + seconds * (0.005 + noise(index, 2) * 0.014));
      const y = height * fraction(noise(index, 5) - seconds * speed);
      const size = 0.55 + noise(index, 8) * 1.4;
      context.globalAlpha = (hazard === "mist" ? 0.32 : 0.22) * (0.55 + noise(index, 9) * 0.45);
      if (theme === "forge") line(context, [[x, y], [x - size, y + size * 4]], palette.glow, size);
      else if (theme === "sluice") line(context, [[x, y], [x - size * 0.45, y - size * 4]], palette.glow, 1);
      else ellipse(context, x, y, size, size, palette.fixture);
    }
    context.restore();
  }

  function prism(context, camera, x, y, w, h, height, topColor, xColor, yColor, edge) {
    const base = rectangle(camera, x, y, w, h);
    const top = rectangle(camera, x, y, w, h, height);
    poly(context, [base[1], base[2], top[2], top[1]], xColor, edge, 0.75);
    poly(context, [base[2], base[3], top[3], top[2]], yColor, edge, 0.75);
    poly(context, top, topColor, edge, 0.75);
  }

  function materialShade(context, from, to, color, palette, highlight, shadow) {
    const shade = context.createLinearGradient(...from, ...to);
    shade.addColorStop(0, highlight);
    shade.addColorStop(0.24, color);
    shade.addColorStop(0.77, color);
    shade.addColorStop(1, shadow || palette.materialShade);
    return shade;
  }

  function matteSlab(context, camera, x, y, width, depth, z, palette, seed) {
    const sample = noise(x + seed, y - seed);
    const tint = palette.tiles[Math.floor(sample * palette.tiles.length)];
    const at = (horizontal, vertical) => point(camera, x + horizontal * width, y + vertical * depth, z);
    const corners = [at(0, 0), at(1, 0), at(1, 1), at(0, 1)];
    poly(context, corners, tint, palette.surfaceJoint, 0.65);
    if (width < 0.3 || depth < 0.3) return;
    const gloss = context.createLinearGradient(...at(0, 1), ...at(1, 0));
    gloss.addColorStop(0, palette.materialLight + (sample > 0.67 ? "36" : "24"));
    gloss.addColorStop(0.38, palette.materialLight + "04");
    gloss.addColorStop(1, palette.materialShade + "49");
    poly(context, corners, gloss);
    const edge = 0.18 + sample * 0.29;
    line(context, [at(0.055, 0.82), at(0.055, 0.60), at(edge, 0.60)], palette.materialLight + "23", 0.75);
    for (let i = 0; i < 3; i++) {
      const xx = 0.12 + 0.65 * noise(sample * 31 + i, x + y);
      const yy = 0.13 + 0.72 * noise(sample * 41 + i, x - y);
      const run = 0.035 + 0.105 * noise(i + 9, sample * 17 + x);
      line(context, [at(xx, yy), at(Math.min(0.96, xx + run), yy + 0.022)],
        (i ? palette.materialShade : palette.materialLight) + (i ? "27" : "39"), i === 0 ? 0.8 : 0.66);
    }
  }

  function materialGrain(palette) {
    const cached = grainCache.get(palette);
    if (cached) return cached;
    const size = 192;
    const period = 16;
    const step = size / period;
    const grain = document.createElement("canvas");
    grain.width = size;
    grain.height = size;
    const paint = grain.getContext("2d");
    const pixels = paint.createImageData(size, size);
    const colors = [palette.materialShade, palette.materialLight].map((hex) =>
      [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)));
    const knots = Array.from({ length: period * period }, (_, i) => noise(i, 91) - 0.5);
    const at = (x, y) => knots[(y % period) * period + x % period];
    for (let y = 0; y < size; y++) {
      const gy = Math.floor(y / step);
      const fy = eased(y / step - gy);
      for (let x = 0; x < size; x++) {
        const gx = Math.floor(x / step);
        const fx = eased(x / step - gx);
        const row1 = at(gx, gy) * (1 - fx) + at(gx + 1, gy) * fx;
        const row2 = at(gx, gy + 1) * (1 - fx) + at(gx + 1, gy + 1) * fx;
        const tone = (row1 * (1 - fy) + row2 * fy) * 0.69 + (noise(x, y) - 0.5) * 0.42;
        const offset = (y * size + x) * 4;
        const color = colors[Number(tone > 0)];
        pixels.data[offset] = color[0];
        pixels.data[offset + 1] = color[1];
        pixels.data[offset + 2] = color[2];
        pixels.data[offset + 3] = Math.abs(tone) * 53;
      }
    }
    paint.putImageData(pixels, 0, 0);
    grainCache.set(palette, grain);
    return grain;
  }

  function finishSurface(context, camera, map, outline, z, palette) {
    const center = point(camera, map.width * 0.43, map.height * 0.60, z);
    const spread = Math.min(map.width, map.height) * camera.unit * 0.67;
    context.save();
    const grain = context.createPattern(materialGrain(palette), "repeat");
    const grainScale = Math.max(0.57, camera.unit / 38);
    grain.setTransform(new DOMMatrix().translate(camera.x, camera.y - z * camera.unit).scale(grainScale));
    poly(context, outline, grain);
    poly(context, outline);
    context.clip();
    context.translate(...center);
    context.rotate(-0.24);
    context.scale(spread, spread * 0.57);
    const light = context.createRadialGradient(-0.15, -0.08, 0, 0, 0, 1);
    light.addColorStop(0, palette.materialLight + "68");
    light.addColorStop(0.46, palette.materialLight + "36");
    light.addColorStop(0.79, palette.materialLight + "11");
    light.addColorStop(1, palette.materialLight + "00");
    ellipse(context, 0, 0, 1, 1, light);
    context.restore();
  }

  function eased(value) {
    const fraction = clamp(value, 0, 1);
    return fraction * fraction * (3 - 2 * fraction);
  }

  const cubeDie = {
    vertices: [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]],
    faces: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 4, 7, 3], [1, 5, 6, 2], [0, 1, 5, 4], [3, 2, 6, 7]],
    values: [1, 6, 2, 5, 3, 4],
  };
  const pointDie = {
    vertices: [[0.92, 0.92, 0.92], [-0.92, -0.92, 0.92], [-0.92, 0.92, -0.92], [0.92, -0.92, -0.92]],
    faces: [[0, 1, 2], [0, 3, 1], [0, 2, 3], [1, 3, 2]],
    values: [1, 2, 3, 4],
  };
  const twoValueDie = { ...cubeDie, values: [1, 2, 1, 2, 1, 2] };
  const threeValueDie = { ...cubeDie, values: [1, 1, 2, 2, 3, 3] };
  const dicePips = [
    [],
    [[0.5, 0.5]],
    [[0.29, 0.29], [0.71, 0.71]],
    [[0.29, 0.29], [0.5, 0.5], [0.71, 0.71]],
    [[0.29, 0.29], [0.71, 0.29], [0.29, 0.71], [0.71, 0.71]],
    [[0.29, 0.29], [0.71, 0.29], [0.5, 0.5], [0.29, 0.71], [0.71, 0.71]],
    [[0.29, 0.26], [0.71, 0.26], [0.29, 0.5], [0.71, 0.5], [0.29, 0.74], [0.71, 0.74]],
  ];
  const tetraPips = [[], [[0.33, 0.33]], [[0.19, 0.42], [0.46, 0.26]],
    [[0.20, 0.20], [0.59, 0.20], [0.20, 0.59]],
    [[0.17, 0.17], [0.61, 0.19], [0.19, 0.61], [0.33, 0.33]]];

  function drawDie(context, x, y, size, rotation, shape, metal) {
    const [pitch, yaw, roll] = rotation;
    const cx = Math.cos(pitch);
    const sx = Math.sin(pitch);
    const cy = Math.cos(yaw);
    const sy = Math.sin(yaw);
    const cz = Math.cos(roll);
    const sz = Math.sin(roll);
    const vertices = shape.vertices.map(([px, py, pz]) => {
      const h = py * cx - pz * sx;
      const d = py * sx + pz * cx;
      const w = px * cy + d * sy;
      return [w * cz - h * sz, w * sz + h * cz, d * cy - px * sy];
    });
    const project = ([horizontal, vertical, depth]) => {
      const lens = size / (1 - depth * 0.102);
      return [x + horizontal * lens, y + vertical * lens];
    };
    const faces = shape.faces.map((indices, index) => {
      const corners = indices.map((id) => vertices[id]);
      const middle = [0, 1, 2].map((axis) => corners.reduce((sum, corner) => sum + corner[axis], 0) / corners.length);
      return { corners, middle, value: shape.values[index] };
    }).filter(({ middle }) => middle[2] > -0.055).sort((a, b) => a.middle[2] - b.middle[2]);
    const pigment = metal ? [215, 154, 89] : [247, 230, 194];
    for (const { corners, middle, value } of faces) {
      const [nx, ny, nz] = middle;
      const normal = Math.hypot(nx, ny, nz) || 1;
      const brightness = 0.57 + 0.45 * clamp((-nx * 0.45 - ny * 0.65 + nz * 0.61) / normal, 0, 1);
      const color = (shade) => `rgb(${pigment.map((channel) => Math.round(channel * Math.min(1.08, shade))).join(",")})`;
      poly(context, corners.map(project), color(brightness * 0.82), metal ? "#ebbd83" : "#fff0d4", 0.85);
      poly(context, corners.map((corner) => project(corner.map((part, axis) => part * 0.91 + middle[axis] * 0.09))),
        color(brightness));

      const square = corners.length === 4;
      const [a, b, c, d] = corners;
      const facePoint = (u, v) => [0, 1, 2].map((axis) => square
        ? a[axis] * (1 - u) * (1 - v) + b[axis] * u * (1 - v) + c[axis] * u * v + d[axis] * (1 - u) * v
        : a[axis] * (1 - u - v) + b[axis] * u + c[axis] * v);
      for (const [u, v] of (square ? dicePips : tetraPips)[value]) {
        const dot = [];
        for (let n = 0; n < 8; n++) {
          const angle = n / 8 * tau;
          const p = square ? 0.066 : 0.058;
          dot.push(project(facePoint(u + Math.cos(angle) * p, v + Math.sin(angle) * p)));
        }
        poly(context, dot, metal ? "#532c21" : "#523e30");
      }
    }
  }

  function bounceHeight(progress) {
    if (progress < 0.34) {
      const fall = progress / 0.34;
      return (0.23 + 0.82 * fall) * (1 - fall);
    }
    for (const [from, to, height] of [[0.34, 0.59, 0.24], [0.59, 0.76, 0.125], [0.76, 0.88, 0.063],
      [0.88, 1, 0.030]]) {
      if (progress <= to) {
        const step = (progress - from) / (to - from);
        return height * 4 * step * (1 - step);
      }
    }
    return 0;
  }

  function restRotation(shape, result, index) {
    const face = shape.faces[shape.values.indexOf(result)];
    const [x, y, z] = face.reduce((normal, vertex) =>
      normal.map((value, axis) => value + shape.vertices[vertex][axis]), [0, 0, 0]);
    return [Math.atan2(y, z) + 0.17, -Math.atan2(x, Math.hypot(y, z)) + 0.14, (index - 1.5) * 0.11];
  }

  function castingTray(context, centerX, centerY, radius, rolls, time, reduced, opening) {
    const count = rolls.length;
    const fade = 1 - eased(opening * 1.7);
    if (!(fade > 0)) return;
    const reveal = reduced ? 1 : eased((time - 174) / 88);
    const center = centerY + radius * (0.29 + (1 - reveal) * 0.20);
    const plane = (x, y, z = 0) => [centerX + x * radius * (1.27 + 0.22 * y),
      center + y * radius * 0.43 + z * radius];
    const face = (x, y, z = 0) => [plane(-x, -y, z), plane(x, -y, z), plane(x, y, z), plane(-x, y, z)];
    const outline = face(1.02, 0.91);
    const front = face(1.02, 0.91, 0.145);
    context.save();
    context.globalAlpha = fade * reveal;
    ellipse(context, centerX, center + radius * 0.18, radius * 1.54, radius * 0.49, "#03101bbb");
    poly(context, [outline[2], outline[3], front[3], front[2]], "#553d32", "#b28152", 1.25);
    poly(context, outline, "#8a6345", "#e5b97b", 1.7);
    poly(context, face(0.945, 0.76), "#382d30", "#694935", 1.35);
    const felt = context.createLinearGradient(0, center - radius * 0.33, 0, center + radius * 0.32);
    felt.addColorStop(0, "#171c27");
    felt.addColorStop(1, "#2f2330");
    poly(context, face(0.881, 0.655), felt, "#bd9057", 1.25);
    for (const xx of [-0.965, 0.965]) {
      for (const yy of [-0.82, 0.82]) {
        const [x, y] = plane(xx, yy);
        ellipse(context, x, y, 2.5, 1.7, "#ecbf82", "#422c29", 0.7);
      }
    }

    const density = Math.min(1, Math.sqrt(5 / count));
    const dice = [];
    for (let index = 0; index < count; index++) {
      const { value, sides } = rolls[index];
      const shape = sides === 4 ? pointDie : sides === 3 ? threeValueDie : sides === 2 ? twoValueDie : cubeDie;
      const wait = index * Math.min(59, 260 / count);
      if (!reduced && time < 182 + wait) continue;
      const progress = reduced ? 1 : clamp((time - 182 - wait) / (920 - wait * 0.19), 0, 1);
      const spread = 1 - (1 - progress) ** 2.08;
      const slot = -0.67 + 1.34 * (index + 0.5) / count;
      const side = index % 2 === 0 ? -1 : 1;
      const depth = (index % 2 === 0 ? -0.29 : 0.37) + noise(index, 21) * 0.13;
      const x = side * (0.49 + noise(index, 67) * 0.24) * (1 - spread) + slot * spread
        + Math.sin(progress * tau + index) * progress * (1 - progress) * 0.28;
      const y = -0.55 * (1 - spread) + depth * spread;
      const hop = reduced ? 0 : bounceHeight(progress) * (index ? 0.76 : 1.02);
      const rate = 1 - (1 - progress) ** 2.15;
      const size = radius * (sides === 6 ? 0.181 : 0.143) * density * (0.92 + (y + 1) * 0.07);
      const starts = [0.41, 0.32, index * 0.73];
      const travel = [7.9 + noise(index, 86) * 5.4, side * (8.5 + noise(index, 9) * 6), 4.6 + noise(index, 60) * 5.6];
      const rest = restRotation(shape, value, index);
      const settling = eased((progress - 0.74) / 0.26);
      const rotation = starts.map((start, axis) => {
        const from = start + rate * travel[axis];
        const to = rest[axis] + Math.round((start + travel[axis] - rest[axis]) / tau) * tau;
        return from + (to - from) * settling;
      });
      dice.push({ ground: plane(x, y), depth: y, hop, size, index, shape, rotation });
    }
    for (const { ground, hop, size } of dice) {
      context.save();
      context.globalAlpha *= 0.74 - hop * 0.63;
      ellipse(context, ...ground, size * (1.13 + hop * 0.78), size * (0.37 + hop * 0.27), "#060910b8");
      context.restore();
    }
    dice.sort((a, b) => a.depth - b.depth);
    for (const { ground, hop, size, index, shape, rotation } of dice) {
      drawDie(context, ground[0], ground[1] - radius * hop - size * 0.83, size, rotation, shape, index % 2 === 1);
    }
    context.restore();
  }

  function doorMechanism(context, x, y, radius, phase, power) {
    const notchCount = 12;
    context.save();
    context.translate(x, y);
    context.rotate(phase);
    for (let index = 0; index < notchCount; index++) {
      const angle = index / notchCount * tau;
      const point = (r, theta) => [Math.cos(theta) * r * radius, Math.sin(theta) * r * radius];
      poly(context, [point(0.96, angle - 0.075), point(1.055, angle - 0.060),
        point(1.080, angle + 0.052), point(0.96, angle + 0.077)],
      "#5a4640", "#94704e", 1);
    }
    context.restore();
    ellipse(context, x, y, radius * 0.96, radius * 0.96, null, "#d39762", 2);
    if (power > 0) {
      context.save();
      context.globalAlpha = power;
      ellipse(context, x, y, radius * 0.98, radius * 0.98, null, "#ffc986", 2.2);
      context.restore();
    }
  }

  function sealedRoom(context, width, height, state, reduced, shelter) {
    const { entryElapsed, entryDuration, entryOpenAt } = state;
    const rolls = shelter ? [] : state.entryRolls ?? [];
    const count = rolls.length;
    const timing = !shelter && entryDuration > 0;
    const drawTime = count ? state.entrySettleAt : entryOpenAt;
    const time = timing && !reduced ? clamp(entryElapsed / Math.max(1, drawTime), 0, 1) * 1360 : 180;
    const closing = timing && !reduced ? eased(time / 180) : 1;
    const spinning = count > 0 && time > 180 && time < 1330 && !reduced;
    const opening = timing ? eased((entryElapsed - entryOpenAt) / (entryDuration - entryOpenAt)) : 0;
    const drawPhase = count > 0 ? clamp((time - 180) / 1180, 0, 1) : 0;
    const motor = spinning ? Math.sin(drawPhase * Math.PI) : 0;
    const rotor = 2.5 * tau * (1 - (1 - drawPhase) ** 2);
    const centerX = width / 2;
    const centerY = height * 0.49;
    const radius = Math.min(width * 0.255, height * 0.257);
    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.64);
    glow.addColorStop(0, spinning || opening || shelter ? "#493126" : "#2a3039");
    glow.addColorStop(1, "#080b11");
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);
    const at = (x, y) => [centerX + x * radius, centerY + y * radius];
    const arch = [[-1.42, 1.16], [-1.42, -0.69], [-0.94, -1.23], [0.94, -1.23],
      [1.42, -0.69], [1.42, 1.16]];

    for (const side of [-1, 1]) {
      for (let rail = 0; rail < 4; rail++) {
        const edge = side * (1.52 + rail * 0.23);
        line(context, [at(edge, -2.2), at(edge, 0.72), at(edge + side * 0.08, 0.86),
          at(edge + side * 0.08, 1.52)], rail % 2 ? "#1a2029" : "#252c36", 2.5);
      }
      const rod = 0.12 * (1 - closing) + opening * 0.37;
      line(context, [at(side * 1.11, 0.18), at(side * (1.67 + rod), 0.18)], "#382c2c", radius * 0.17);
      line(context, [at(side * 1.18, 0.18), at(side * (1.56 + rod), 0.18)], "#b48661", radius * 0.055);
      poly(context, [at(side * (1.54 + rod), 0.01), at(side * (1.85 + rod), 0.01),
        at(side * (1.85 + rod), 0.35), at(side * (1.54 + rod), 0.35)], "#3b3439", "#77717a", 1.2);
    }
    poly(context, arch.map(([x, y]) => at(x, y)), "#111620", "#59636e", 1.6);
    poly(context, arch.map(([x, y]) => at(x * 0.92, y * 0.91)), "#1e252f", "#303b47", 2);
    ellipse(context, centerX, centerY, radius * 1.03, radius * 1.03, "#10151e", "#77808a", 2);
    ellipse(context, centerX, centerY, radius * 0.94, radius * 0.94, "#2b3440", "#111721", radius * 0.10);
    ellipse(context, centerX, centerY, radius * 0.80, radius * 0.80, "#1f2732", "#4c5866", 1.5);
    doorMechanism(context, centerX, centerY, radius * 0.97, rotor, motor * 0.8 + opening * 0.2);
    for (let index = 0; index < 8; index++) {
      const theta = index / 8 * tau + tau / 16;
      const pull = 0.21 + (1 - closing) * 0.18 + opening * 0.49;
      const inner = at(Math.cos(theta) * pull, Math.sin(theta) * pull);
      const outer = at(Math.cos(theta) * 0.75, Math.sin(theta) * 0.75);
      line(context, [inner, outer, at(Math.cos(theta + 0.10) * 0.86, Math.sin(theta + 0.10) * 0.86)],
        spinning ? "#796555" : "#57616c", 1.25);
      const [x, y] = at(Math.cos(theta) * 0.91, Math.sin(theta) * 0.91);
      ellipse(context, x, y, radius * 0.022, radius * 0.022, "#83909b", "#202631");
    }

    context.save();
    context.beginPath();
    context.arc(centerX, centerY, radius * 0.80, 0, tau);
    context.clip();
    if (timing && !reduced && time < 180) {
      for (const side of [-1, 1]) {
        const shift = (1 - closing) * 0.43;
        const half = (x, y) => at(side * (x + shift), y);
        poly(context, [half(0.016, -0.56), half(0.47, -0.69), half(0.78, -0.41),
          half(0.80, 0.39), half(0.47, 0.67), half(0.016, 0.55)],
        "#29313d", "#8ca0a8", 1.45);
        line(context, [half(0.12, -0.36), half(0.36, -0.36), half(0.48, -0.23)], "#6e756d", 1.5);
        line(context, [half(0.12, 0.36), half(0.36, 0.36), half(0.48, 0.23)], "#6e756d", 1.5);
      }
    } else if (opening > 0) {
      const beam = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * (0.28 + opening));
      beam.addColorStop(0, "#fff0cd");
      beam.addColorStop(0.24, "#e9ba86");
      beam.addColorStop(1, "#b97c4500");
      context.globalAlpha = 0.24 + opening * 0.67;
      ellipse(context, centerX, centerY, radius, radius, beam);
      line(context, [at(0, -0.31 - opening * 0.53), at(0, 0.31 + opening * 0.53)], "#fff6e0",
        Math.max(1, radius * (0.015 + opening * 0.055)));
    } else {
      poly(context, [at(0, -0.23), at(0.22, -0.11), at(0.22, 0.11), at(0, 0.23),
        at(-0.22, 0.11), at(-0.22, -0.11)], "#111722", "#9ca4af", 1.4);
      line(context, [at(0, -0.11), at(0, 0.11)], "#e2ddd3", 2);
    }
    context.restore();

    if (spinning || opening > 0) {
      for (let spark = 0; spark < 20; spark++) {
        const angle = noise(spark, 37) * tau;
        const phase = fraction(noise(spark, 10) + drawPhase * (1.5 + noise(spark, 18)) + opening * 0.8);
        const size = 0.86 + phase * 0.48;
        context.save();
        context.globalAlpha = (1 - phase) * Math.max(motor, opening) * (0.34 + noise(spark, 1) * 0.53);
        line(context, [at(Math.cos(angle) * size, Math.sin(angle) * size),
          at(Math.cos(angle) * (size + 0.04), Math.sin(angle) * (size + 0.04))], "#ffc887", 1.5);
        context.restore();
      }
    }
    for (let index = 0; index < 4; index++) {
      const y = 1.16 + index * 0.105;
      line(context, [at(-1.42 - index * 0.11, y), at(1.42 + index * 0.11, y)], "#373e49", 1.6);
    }
    if (count && (reduced ? state.entryPhase !== "throw" : timing && time >= 180)) {
      castingTray(context, centerX, centerY, radius, rolls, time, reduced, opening);
    }
  }

  function chapterGround(context, camera, bounds, z, palette, seed) {
    const { x, y, width, height } = bounds;
    const area = width * height;
    const terrain = palette.landscape;
    const at = (u, v) => point(camera, x + width * u, y + height * v, z);
    context.save();
    poly(context, [at(0, 0), at(1, 0), at(1, 1), at(0, 1)]);
    context.clip();
    const count = Math.max(8, Math.ceil(area * .14));
    for (let i = 0; i < count; i++) {
      const u = noise(i + seed, 34);
      const v = noise(i + seed, 38);
      const r = .60 + noise(i + seed, 84) * 3.6;
      const points = Array.from({ length: 7 }, (_, n) => {
        const edge = r * (.42 + noise(i, n + seed) * .58);
        const angle = n * tau / 7;
        return at(u + Math.cos(angle) * edge / width, v + Math.sin(angle) * edge * .63 / height);
      });
      poly(context, points, palette.tiles[i % palette.tiles.length] + "bf");
    }
    if (terrain === "roots") {
      for (let i = 0; i < 16; i++) {
        const u = noise(i + seed, 50);
        const v = noise(i + seed, 52);
        const direction = i % 2 ? 1 : -1;
        const spread = .8 + noise(seed, i) * 3.5;
        const start = at(u, v);
        const knot = at(u + direction * spread * .20 / width, v + spread * .29 / height);
        const end = at(u + direction * spread / width, v + spread * .72 / height);
        line(context, [start, knot, end], "#242e21a9", Math.max(1, camera.unit * .084));
        line(context, [start, knot, end], "#a19a5089", Math.max(.5, camera.unit * .031));
        const fork = at(u + direction * spread * .32 / width, v - spread * .15 / height);
        line(context, [knot, fork], "#a5966090", .86);
      }
    }
    if (terrain === "stars") {
      const center = at(.53, .51);
      const radius = Math.min(width, height) * camera.unit * .43;
      for (const scale of [.44, .70, 1]) {
        ellipse(context, ...center, radius * scale * 1.6, radius * scale * .77, null, "#a9a0d56b", 1.2);
      }
      for (let index = 0; index < 33; index++) {
        const star = at(noise(index + seed, 39), noise(index + seed, 58));
        ellipse(context, ...star, index % 7 === 0 ? 1.95 : 1.05, index % 7 === 0 ? 1.55 : .85, "#d0c9ef7c");
      }
    } else {
      const stone = terrain === "archive" || terrain === "ruins";
      const detail = Math.max(6, Math.ceil(area * (terrain === "roots" ? .33 : .18)));
      for (let i = 0; i < detail; i++) {
        const u = noise(i + seed, 12);
        const v = noise(i + seed, 15);
        const r = .09 + noise(i + seed, 43) * (stone ? .54 : .27);
        const mark = [at(u - r / width, v + r * .19 / height), at(u + r * .33 / width, v - r * .26 / height),
          at(u + r / width, v + r * .14 / height), at(u + r * .09 / width, v + r * .59 / height)];
        poly(context, mark, palette.materialShade + (stone ? "69" : "4d"));
        if (i % 3 === 0) line(context, [mark[0], mark[1]], palette.materialLight + "51", .78);
      }
      const cracks = stone ? 14 : terrain === "remains" ? 12 : 8;
      for (let i = 0; i < cracks; i++) {
        const u = noise(i + seed, 19);
        const v = noise(i + seed, 26);
        const run = .8 + noise(i + seed, 117) * 5.6;
        const offset = i % 2 ? 1 : -1;
        const joint = at(u + run * .28 / width, v + offset * run * .12 / height);
        const course = [at(u, v), joint, at(u + run * .50 / width, v + offset * run * .49 / height),
          at(u + run / width, v + offset * run * .43 / height)];
        line(context, course, palette.materialShade + "a2", Math.max(.72, camera.unit * .043));
        if (i % 2 === 0) line(context, [joint, at(u + run * .41 / width, v - offset * run * .20 / height)],
          palette.materialShade + "87", .86);
      }
    }
    context.restore();
  }

  function chapterEdge(context, camera, width, height, palette, seed) {
    for (const [parallel, length, side] of [[true, width, height], [false, height, width]]) {
      const edge = (distance, z) => parallel ? point(camera, distance, side, z) : point(camera, side, distance, z);
      for (let seam = 0; seam < 3; seam++) {
        const sections = Math.ceil(length / 2);
        const bits = Array.from({ length: sections + 1 }, (_, i) =>
          edge(length * i / sections, -.24 - seam * .18 - noise(i + seed, seam + 83) * .14));
        line(context, bits, palette.materialLight + (seam ? "4b" : "9b"), seam ? 1.02 : 1.65);
      }
      for (let at = .45; at < length - .4; at += 1.6) {
        const variation = noise(at + seed, length);
        if (palette.landscape === "roots") {
          line(context, [edge(at, -.025), edge(at + variation * .27, -.30), edge(at + variation * .11, -.66)],
            "#292b1f", Math.max(1, camera.unit * .12));
          line(context, [edge(at, -.025), edge(at + variation * .27, -.30), edge(at + variation * .11, -.66)],
            "#848851", Math.max(.7, camera.unit * .049));
        } else {
          line(context, [edge(at, -.07), edge(at + .14, -.27), edge(at + .06, -.59)], palette.seam + "a7", .95);
        }
      }
    }
  }

  function floor(context, camera, state, palette, theme) {
    const { width, height } = state.map;
    const { unit } = camera;
    const top = rectangle(camera, 0, 0, width, height);
    const foot = rectangle(camera, 0, 0, width, height, theme === "forge" ? -1.12 : -0.87);
    const rim = rectangle(camera, 0, 0, width, height, -0.19);
    const center = point(camera, width / 2, height / 2, -1.1);

    ellipse(context, ...center, (width + height) * unit * 0.44,
      (width + height) * unit * 0.19, "#0006");
    poly(context, [rim[1], rim[2], foot[2], foot[1]], palette.wallX, palette.seam);
    poly(context, [rim[2], rim[3], foot[3], foot[2]], palette.wallY, palette.seam);
    poly(context, [top[1], top[2], rim[2], rim[1]], palette.edge, palette.seam);
    poly(context, [top[2], top[3], rim[3], rim[2]], palette.capSide, palette.seam);
    poly(context, top, palette.tiles[0]);
    if (palette.landscape && palette.landscape !== "rupture") {
      chapterGround(context, camera, { x: 0, y: 0, width, height }, 0, palette, state.floor * .82);
      finishSurface(context, camera, state.map, top, 0, palette);
      chapterEdge(context, camera, width, height, palette, state.floor);
      poly(context, top, null, palette.inlay + "b8", Math.max(1.4, unit * .040));
      return;
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const blockX = x - x % 2;
        const blockY = y - y % 2;
        const wide = noise(blockX - state.floor, blockY + 2) > 0.52
          && blockX + 2 <= width && blockY + 2 <= height;
        if (wide && (x !== blockX || y !== blockY)) continue;
        matteSlab(context, camera, x, y, Math.min(wide ? 2 : 1, width - x),
          Math.min(wide ? 2 : 1, height - y), 0, palette, state.floor * 3);
      }
    }
    finishSurface(context, camera, state.map, top, 0, palette);
    if (palette.landscape === "rupture") {
      chapterGround(context, camera, { x: .3, y: .3, width: width - .6, height: height - .6 },
        0, palette, state.floor * .82);
    }
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (theme === "relay" && x % 4 === 1 && y % 4 === 1) {
          poly(context, rectangle(camera, x + 0.24, y + 0.24, 0.52, 0.52), "#222b3da6", palette.inlay + "77", 0.74);
          ellipse(context, ...point(camera, x + 0.5, y + 0.5), 1.15, 1.15, palette.fixture + "a8");
        } else if (theme === "forge" && x % 4 === 3 && y % 4 === 3) {
          line(context, [point(camera, x + 0.18, y + 0.60), point(camera, x + 0.65, y + 0.60),
            point(camera, x + 0.65, y + 0.25)], "#d8a87b36", 0.9);
        }
      }
    }

    const rail = (x1, y1, x2, y2) => line(context, [point(camera, x1, y1), point(camera, x2, y2)],
      palette.conduit, Math.max(1, unit * 0.028));
    context.save();
    context.globalAlpha = theme === "sluice" ? 0.56 : 0.33;
    for (const offset of [0.42, 0.61]) {
      rail(offset, 1, offset, height - 1);
      rail(1, height - offset, width - 1, height - offset);
      rail(width - offset, 1, width - offset, height - 1);
      rail(1, offset, width - 1, offset);
    }
    context.restore();
    poly(context, rectangle(camera, 0.18, 0.18, width - 0.36, height - 0.36), null, palette.edge + "99", 1.3);
    poly(context, top, null, palette.inlay + "c4", 1.7);

    for (let x = 0.4; x < width; x += 1) {
      const start = point(camera, x, height, -0.28);
      const end = point(camera, x + 0.22, height, -0.28);
      line(context, [start, end], palette.inlay, 1.1);
    }
    for (let y = 0.6; y < height; y += 1) {
      const start = point(camera, width, y, -0.28);
      const end = point(camera, width, y + 0.24, -0.28);
      line(context, [start, end], palette.inlay, 1.1);
    }

    context.save();
    context.globalAlpha = 0.68;
    for (let x = 2.3; x < width - 0.9; x += 3) {
      poly(context, rectangle(camera, x, 0.07, 0.48, 0.10), palette.accent);
      poly(context, rectangle(camera, x, height - 0.17, 0.48, 0.10), palette.accent);
    }
    for (let y = 2.3; y < height - 0.9; y += 3) {
      poly(context, rectangle(camera, 0.07, y, 0.10, 0.48), palette.accent);
      poly(context, rectangle(camera, width - 0.17, y, 0.10, 0.48), palette.accent);
    }
    for (const [x, y] of [[0.37, 0.37], [width - 0.37, 0.37], [0.37, height - 0.37], [width - 0.37, height - 0.37]]) {
      poly(context, rectangle(camera, x - 0.13, y - 0.13, 0.26, 0.26), palette.accent);
    }
    context.restore();
  }

  function paintTerrain(context, canvas, camera, state, palette, theme, ratio) {
    const { width, height } = state.map;
    const unit = camera.unit;
    const feature = state.facility?.feature;
    const key = `${theme}:${palette.landscape}:${state.floor}:${width}:${height}:${unit}:${ratio}:${feature}:${Boolean(state.landing || state.shelter)}`;
    let layer = terrainCache.get(canvas);
    if (layer?.key !== key || layer.elevation !== state.elevation || layer.obstacles !== state.obstacles) {
      const surface = document.createElement("canvas");
      const pad = Math.ceil(unit * 2.1);
      const drawWidth = Math.ceil((width + height) * unit + pad * 2);
      const drawHeight = Math.ceil((width + height) * unit * slope + pad * 2);
      const cacheRatio = Math.min(ratio, 4096 / Math.max(drawWidth, drawHeight),
        Math.sqrt(7600000 / (drawWidth * drawHeight)));
      surface.width = Math.ceil(drawWidth * cacheRatio);
      surface.height = Math.ceil(drawHeight * cacheRatio);
      const paint = surface.getContext("2d");
      paint.setTransform(surface.width / drawWidth, 0, 0, surface.height / drawHeight, 0, 0);
      paint.lineJoin = "round";
      paint.lineCap = "round";
      const originX = height * unit + pad;
      const originY = pad;
      const local = { ...camera, x: originX, y: originY };
      const layerIndex = state.elevation ? 0 : undefined;
      floor(paint, local, state, palette, theme);
      paintEarlyBrasswork(paint, local, state, state.elevation, layerIndex);
      if (!palette.landscape || palette.landscape === "rupture") paintFacilityDressing(paint, local, state, palette, state.elevation, layerIndex);
      layer = { key, surface, drawWidth, drawHeight, originX, originY,
        elevation: state.elevation, obstacles: state.obstacles };
      terrainCache.set(canvas, layer);
    }
    context.drawImage(layer.surface, camera.x - layer.originX, camera.y - layer.originY,
      layer.drawWidth, layer.drawHeight);
  }

  function deckPerimeter(deck, elevation) {
    const { left, back, right, front } = centeredBounds(deck);
    const sides = [
      { alongX: true, position: back, facing: -1, start: left, end: right },
      { alongX: false, position: right, facing: 1, start: back, end: front },
      { alongX: true, position: front, facing: 1, start: left, end: right },
      { alongX: false, position: left, facing: -1, start: back, end: front },
    ];
    const otherDecks = elevation.decks.filter((entry) => entry !== deck).map(centeredBounds);
    for (const side of sides) {
      const holes = [];
      const overlap = (bounds) => {
        const first = side.alongX ? bounds.left : bounds.back;
        const last = side.alongX ? bounds.right : bounds.front;
        if (last > side.start + 0.0001 && first < side.end - 0.0001) {
          holes.push([Math.max(side.start, first), Math.min(side.end, last)]);
        }
      };
      for (const bounds of otherDecks) {
        const joint = side.alongX
          ? (side.facing > 0 ? bounds.back : bounds.front)
          : (side.facing > 0 ? bounds.left : bounds.right);
        if (Math.abs(joint - side.position) < 0.0001) overlap(bounds);
      }
      for (const stair of elevation.stairs) {
        if ((side.alongX ? "y" : "x") !== stair.axis || stair.rise !== -side.facing) continue;
        const bounds = centeredBounds(stair);
        const highEnd = side.alongX
          ? (stair.rise > 0 ? bounds.front : bounds.back)
          : (stair.rise > 0 ? bounds.right : bounds.left);
        if (Math.abs(highEnd - side.position) < 0.0001) overlap(bounds);
      }
      const segments = [];
      let cursor = side.start;
      for (const [first, last] of holes.sort((a, b) => a[0] - b[0])) {
        if (first > cursor + 0.0001) segments.push([cursor, first]);
        cursor = Math.max(cursor, last);
      }
      if (cursor < side.end - 0.0001) segments.push([cursor, side.end]);
      side.segments = segments;
    }
    return sides;
  }

  function terraceFace(context, camera, side, elevation, palette) {
    const height = elevation.height;
    const { alongX, position } = side;
    const foot = (along, z) => point(camera, alongX ? along : position, alongX ? position : along, z);
    for (const [start, finish] of side.segments) {
      const count = Math.max(1, Math.ceil((finish - start) / 0.65));
      for (let section = 0; section < count; section++) {
        const at = start + section / count * (finish - start);
        const end = start + (section + 1) / count * (finish - start);
        const along = (at + end) / 2;
        const bottom = surfaceHeight(elevation, alongX ? along : position + 0.033,
          alongX ? position + 0.033 : along);
        if (bottom >= height - 0.043) continue;
        const grade = height - bottom;
        const litFace = alongX ? palette.wallY : palette.wallX;
        const surfaceFinish = materialShade(context, foot(at, height), foot(at, bottom),
          litFace, palette, palette.capSide, palette.materialShade);
        poly(context, [foot(at, bottom), foot(end, bottom), foot(end, height), foot(at, height)],
          surfaceFinish, palette.surfaceJoint, 0.65);
        const relief = Math.min(0.16, (end - at) * 0.22);
        if (grade > 0.52) {
          if (palette.landscape) {
            for (const seam of [.25, .58]) {
              line(context, [foot(at, bottom + grade * seam), foot(at + (end - at) * .45, bottom + grade * (seam + .08)),
                foot(end, bottom + grade * (seam - .02))], palette.materialLight + "4a", .85);
            }
          } else {
            poly(context, [foot(at + relief, bottom + grade * 0.19), foot(end - relief, bottom + grade * 0.19),
              foot(end - relief, bottom + grade * 0.71), foot(at + relief, bottom + grade * 0.71)],
            palette.materialShade + "72", palette.surfaceJoint, 0.8);
            line(context, [foot(at + relief, bottom + grade * 0.69), foot(end - relief, bottom + grade * 0.69)],
              palette.materialLight + "50", 0.65);
          }
        }
        line(context, [foot(at, height - 0.07), foot(end, height - 0.07)], palette.materialLight + "8b", 1.25);
        if (noise(section + 2, start - 4) > 0.52) line(context, [foot(at + relief, height - 0.16),
          foot(end - relief, height - 0.19)], palette.materialShade + "b0", 0.85);
      }
    }
  }

  function terraceCoping(context, camera, perimeter, height, palette) {
    for (const side of perimeter) {
      const edge = (along, inset) => point(camera,
        side.alongX ? along : side.position - inset * side.facing,
        side.alongX ? side.position - inset * side.facing : along, height);
      for (const [start, end] of side.segments) {
        line(context, [edge(start, 0), edge(end, 0)], palette.accent + "c9", 1.35);
        if (end - start > 0.22) {
          line(context, [edge(start + 0.08, 0.11), edge(end - 0.08, 0.11)], palette.inlay + "a3", 1);
        }
      }
    }
  }

  function raisedDeck(context, camera, deck, elevation, palette, map) {
    const { left, back, right, front } = centeredBounds(deck);
    const perimeter = deckPerimeter(deck, elevation);
    const height = elevation.height;
    for (const side of perimeter) {
      if (side.facing > 0) terraceFace(context, camera, side, elevation, palette);
    }
    const cap = rectangle(camera, left, back, deck.w, deck.h, height);
    poly(context, cap, palette.tiles[0]);
    if (palette.landscape) {
      chapterGround(context, camera, { x: left, y: back, width: deck.w, height: deck.h }, height, palette, deck.x * 7);
    } else {
      for (let x = left; x < right - 0.02; x += 1.45) {
        for (let y = back; y < front - 0.02; y += 1.45) {
          matteSlab(context, camera, x, y, Math.min(1.45, right - x), Math.min(1.45, front - y), height, palette, 15.8);
        }
      }
    }
    finishSurface(context, camera, map, cap, height, palette);
    terraceCoping(context, camera, perimeter, height, palette);
  }

  function stairTreads(stairs) {
    return Math.round(clamp((stairs.axis === "x" ? stairs.w : stairs.h) * 3.3, 7, 18));
  }

  function stairRailSegments(stairs, height) {
    const { left, back } = centeredBounds(stairs);
    const horizontal = stairs.axis === "x";
    const at = (t, side, raised = false) => [
      left + (horizontal ? t : side) * stairs.w,
      back + (horizontal ? side : t) * stairs.h,
      height * (stairs.rise < 0 ? 1 - t : t) + (raised ? .23 : 0),
    ];
    return [.035, .965].flatMap((side) => [
      ...[.03, .33, .66, .97].map((t) => ({ start: at(t, side), end: at(t, side, true), width: 1.45, color: "cap" })),
      { start: at(.02, side, true), end: at(.98, side, true), width: 1.65, color: "accent" },
    ]);
  }

  function terraceStairs(context, camera, stairs, elevation, palette) {
    const { left, back } = centeredBounds(stairs);
    const horizontal = stairs.axis === "x";
    const length = horizontal ? stairs.w : stairs.h;
    const count = stairTreads(stairs);
    const step = length / count;
    const height = elevation.height;
    const rise = stairs.rise < 0 ? -1 : 1;
    const at = (t, side, z) => point(camera,
      left + (horizontal ? t * stairs.w : side * stairs.w),
      back + (horizontal ? side * stairs.h : t * stairs.h), z);
    const riseAt = (t) => height * (rise === 1 ? t : 1 - t);
    for (let index = 0; index < count; index++) {
      const from = index / count;
      const to = (index + 1) / count;
      const treadHeight = riseAt((from + to) / 2);
      const x = left + (horizontal ? step * index : 0);
      const y = back + (horizontal ? 0 : step * index);
      prism(context, camera, x, y, horizontal ? step : stairs.w, horizontal ? stairs.h : step,
        treadHeight, index % 2 ? palette.capSide : palette.capDark, palette.wallX, palette.wallY, palette.seam);
      const nose = rise === 1 ? from : to;
      const accent = index === 0 || index === count - 1 ? palette.fixture : palette.inlay;
      line(context, [at(nose, 0.045, treadHeight), at(nose, 0.955, treadHeight)], accent, 1.2);
    }
    for (const { start, end, width, color } of stairRailSegments(stairs, height)) {
      line(context, [point(camera, ...start), point(camera, ...end)], palette[color], width);
    }
    for (const u of [.12, .28]) {
      const t = rise === 1 ? u : 1 - u;
      const level = riseAt((Math.floor(t * count) + .5) / count) + .018;
      line(context, [at(t - rise * .027, .29, level), at(t + rise * .021, .5, level),
        at(t - rise * .027, .71, level)], "#ecd09c", 1.55);
    }
  }

  function terraceCover(camera, elevation, actor) {
    if (!elevation || !(actor.height < elevation.height - 0.14)) return undefined;
    const center = actor.height + (actor.type === "item" ? 0.41 : actor.type === "obstacle" ? 0.63 : 0.76);
    const projected = point(camera, actor.x, actor.y, center);
    const hit = surfaceHit(elevation, basePlanePoint(camera, ...projected), true);
    return hit.z > center + 0.09 ? hit.owner : undefined;
  }

  function clipPolygon(vertices, distance) {
    const visible = [];
    for (let i = 0; i < vertices.length; i++) {
      const start = vertices[i];
      const end = vertices[(i + 1) % vertices.length];
      const from = distance(start);
      const to = distance(end);
      if (from >= 0) visible.push(start);
      if ((from < 0) !== (to < 0)) {
        const t = from / (from - to);
        visible.push(start.map((value, axis) => value + (end[axis] - value) * t));
      }
    }
    return visible;
  }

  function cross(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }

  function convexHull(vertices) {
    const sorted = vertices.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const chain = (points) => {
      const edge = [];
      for (const next of points) {
        while (edge.length > 1 && cross(edge.at(-2), edge.at(-1), next) <= 0) edge.pop();
        edge.push(next);
      }
      edge.pop();
      return edge;
    };
    return [...chain(sorted), ...chain(sorted.reverse())];
  }

  function stairFooting(elevation, actor) {
    const stair = elevation?.stairs.find((entry) => withinSurface(centeredBounds(entry), actor.x, actor.y));
    if (!stair) return 0;
    const count = stairTreads(stair);
    const travel = clamp(actor.height / elevation.height, 0, 1) * count - .5;
    const step = Math.floor(travel);
    const transition = eased((travel - step - .31) / .38);
    const contact = (step + .5 + transition) * elevation.height / count;
    return contact - actor.height;
  }

  function occluderBounds(vertices) {
    const axes = [0, 1, 2].map((axis) => vertices.map((vertex) => vertex[axis]));
    const [[left, right], [back, front], [bottom, top]] = axes.map((values) => [Math.min(...values), Math.max(...values)]);
    return { left, right, back, front, bottom, top };
  }

  function occlusionVolumes(objects, elevation, palette, shelterShapes) {
    const volumes = [];
    const add = (entry, bottom, top, support) => {
      if (top - bottom < 0.008 || !(entry.w > 0 && entry.h > 0)) return;
      volumes.push({ ...centeredBounds(entry), bottom, top, support });
    };
    for (const object of objects) {
      const z = object.height;
      if (object.type === "obstacle") {
        if (object.fixture && (!palette.landscape || palette.landscape === "rupture") && Object.hasOwn(facilityFixtures, object.fixture)) {
          add(facilityFootprint(object, -.48, .48, -.47, .47), z, z + .15);
          for (const [from, to, left, right, bottom, top] of facilityCasing[object.fixture] ?? []) {
            add(facilityFootprint(object, from, to, left, right), z + bottom, z + top);
          }
        } else add(object, z, z + obstacleHeight(object, palette));
      } else if (object.type === "story-gate") {
        const { span, height, progress } = storyGateSize(object);
        const alongX = object.axis !== "y";
        const box = (side, depth, width, thickness, bottom, top) => add({
          x: object.x + (alongX ? depth : side),
          y: object.y + (alongX ? side : depth),
          w: alongX ? thickness : width,
          h: alongX ? width : thickness,
        }, z + bottom, z + top);
        box(0, .145, span, .012, height * progress, height);
        box(0, 0, span + .60, .61, height - .015, height + .335);
        for (const side of [-1, 1]) box(side * (span / 2 + .14), 0, .28, .52, 0, height + .20);
      } else if (object.kind === "exit") {
        const x = object.x + .64, y = object.y;
        const progress = clamp(object.openProgress ?? Number(Boolean(object.active)), 0, 1);
        const gap = .59 * eased(progress);
        add({ x, y, w: .37, h: 2.38 }, z + 1.61, z + 1.90);
        for (const side of [-1, 1]) {
          add({ x, y: y + side * .87, w: .29, h: .56 }, z, z + 1.70);
          add({ x: x + .197, y: y + side * (.59 + gap) / 2, w: .012, h: .59 - gap }, z + .035, z + 1.58);
        }
      }
    }
    for (const shape of shelterShapes) {
      if (shape.faces) {
        for (const face of shape.faces) volumes.push({ ...occluderBounds(face), face });
      } else add(shape, shape.bottom, shape.top);
    }
    if (elevation) {
      for (const deck of elevation.decks) add(deck, 0, elevation.height, centeredBounds(deck));
      for (const stair of elevation.stairs) {
        const bounds = centeredBounds(stair);
        const horizontal = stair.axis === "x";
        const count = stairTreads(stair);
        const length = (horizontal ? stair.w : stair.h) / count;
        for (let index = 0; index < count; index++) {
          const position = (index + .5) * length;
          const t = (index + .5) / count;
          add({
            x: horizontal ? bounds.left + position : stair.x,
            y: horizontal ? stair.y : bounds.back + position,
            w: horizontal ? length : stair.w,
            h: horizontal ? stair.h : length,
          }, 0, elevation.height * (stair.rise < 0 ? 1 - t : t), bounds);
        }
        for (const rail of stairRailSegments(stair, elevation.height)) {
          volumes.push({ ...occluderBounds([rail.start, rail.end]), rail });
        }
      }
    }
    return volumes;
  }

  function railMask(camera, { start, end, width }, distance) {
    const from = distance(start);
    const to = distance(end);
    if (from <= 0 && to <= 0) return [];
    const project = (vertex, other, amount) => point(camera, ...vertex.map((value, axis) => value + (other[axis] - value) * amount));
    const a = project(start, end, from < 0 ? from / (from - to) : 0);
    const b = project(end, start, to < 0 ? to / (to - from) : 0);
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (!length) return [];
    const dx = (b[1] - a[1]) * width / (2 * length);
    const dy = (a[0] - b[0]) * width / (2 * length);
    return [[a[0] + dx, a[1] + dy], [b[0] + dx, b[1] + dy], [b[0] - dx, b[1] - dy], [a[0] - dx, a[1] - dy]];
  }

  function actorOcclusionMasks(camera, actor, volumes) {
    const depth = actor.x + actor.y;
    const side = actor.x - actor.y;
    const large = actor.kind === "boss" || actor.role === "patient";
    const addedReach = actor.type === "player" ? Math.max(0, (heroWeapons[actor.weapon]?.length ?? 1) - 1) : 0;
    const width = large ? 2.1 : 1.4 + addedReach * .78;
    const feet = depth * slope - actor.height;
    const masks = [];
    const distance = ([x, y]) => x + y - depth;
    for (const { left, right, back, front, bottom, top, support, face, rail } of volumes) {
      if (right + front <= depth || left - front > side + width || right - back < side - width) continue;
      if ((left + back) * slope - top > feet + .70 || (right + front) * slope - bottom < feet - (large ? 3.70 : 2.15)) continue;
      if (support && (actor.height >= top - .035 || withinSurface(support, actor.x, actor.y))) continue;
      if (rail) {
        const hull = railMask(camera, rail, distance);
        if (hull.length) masks.push(hull);
        continue;
      }
      const vertices = face ? clipPolygon(face, distance).map((vertex) => point(camera, ...vertex))
        : clipPolygon([[left, back], [right, back], [right, front], [left, front]], distance)
          .flatMap(([x, y]) => [point(camera, x, y, bottom), point(camera, x, y, top)]);
      const hull = convexHull(vertices);
      if (hull.length >= 3) masks.push(hull);
    }
    return masks;
  }

  function clipActorOcclusion(context, camera, masks) {
    for (const hull of masks) {
      context.beginPath();
      context.rect(0, 0, camera.width, camera.height);
      context.moveTo(...hull[0]);
      for (const vertex of hull.slice(1)) context.lineTo(...vertex);
      context.closePath();
      context.clip("evenodd");
    }
  }

  function actorVisible(camera, actor, masks) {
    if (!masks.length) return true;
    const head = actor.type === "player" ? heroVisualHeight * (camera.width < 500 ? 1.12 : 1)
      : actor.type === "enemy" ? enemyHealthHeight(actor) - .17 : actor.seated ? .96 : 1.12;
    const samples = [[0, head - .08], [-.13, head * .69], [.13, head * .69],
      [0, head * .50], [-.13, head * .30], [.13, head * .30]];
    return samples.some(([u, v]) => {
      const target = point(camera, actor.x + u / 2, actor.y - u / 2, actor.height + v);
      return !masks.some((hull) => hull.every((vertex, index) => cross(vertex, hull[(index + 1) % hull.length], target) >= 0));
    });
  }

  function terraceShadows(context, camera, elevation) {
    for (const entry of [...elevation.decks, ...elevation.stairs]) {
      const { left, back } = centeredBounds(entry);
      poly(context, rectangle(camera, left + 0.16, back + 0.23, entry.w + 0.16, entry.h + 0.15), "#07112163");
    }
  }

  function drawTerraces(context, camera, elevation, palette, map) {
    const structures = [
      ...elevation.decks.map((entry) => ({ entry, stair: false })),
      ...elevation.stairs.map((entry) => ({ entry, stair: true })),
    ];
    structures.sort((a, b) => a.entry.x + a.entry.y - b.entry.x - b.entry.y);
    for (const { entry, stair } of structures) {
      if (stair) terraceStairs(context, camera, entry, elevation, palette);
      else raisedDeck(context, camera, entry, elevation, palette, map);
    }
  }

  function paintTerraces(context, canvas, camera, state, palette, theme, ratio) {
    const { elevation, map } = state;
    const key = `${theme}:${palette.landscape}:${state.floor}:${map.width}:${map.height}:${camera.unit}:${ratio}:${state.facility?.feature}`;
    let layer = terraceCache.get(canvas);
    if (layer?.elevation !== elevation || layer.key !== key || layer.obstacles !== state.obstacles) {
      const zero = { ...camera, x: 0, y: 0 };
      const corners = [...elevation.decks, ...elevation.stairs].flatMap((entry) => {
        const { left, back } = centeredBounds(entry);
        return [
          ...rectangle(zero, left, back, entry.w, entry.h),
          ...rectangle(zero, left, back, entry.w, entry.h, elevation.height + 0.23),
        ];
      });
      if (!corners.length) return;
      const left = Math.floor(Math.min(...corners.map(([x]) => x))) - 3;
      const top = Math.floor(Math.min(...corners.map(([, y]) => y))) - 3;
      const width = Math.ceil(Math.max(...corners.map(([x]) => x))) - left + 3;
      const height = Math.ceil(Math.max(...corners.map(([, y]) => y))) - top + 3;
      const scale = Math.min(ratio, 4096 / Math.max(width, height), Math.sqrt(4600000 / (width * height)));
      const surface = document.createElement("canvas");
      surface.width = Math.ceil(width * scale);
      surface.height = Math.ceil(height * scale);
      const paint = surface.getContext("2d");
      paint.setTransform(surface.width / width, 0, 0, surface.height / height, 0, 0);
      paint.lineCap = "round";
      paint.lineJoin = "round";
      const local = { ...camera, x: -left, y: -top };
      drawTerraces(paint, local, elevation, palette, map);
      paintEarlyBrasswork(paint, local, state, elevation, 1);
      if (!palette.landscape || palette.landscape === "rupture") paintFacilityDressing(paint, local, state, palette, elevation, 1);
      layer = { surface, left, top, width, height, elevation, key, obstacles: state.obstacles };
      terraceCache.set(canvas, layer);
    }
    context.drawImage(layer.surface, camera.x + layer.left, camera.y + layer.top, layer.width, layer.height);
  }

  function perimeterHardware(context, camera, state, palette, theme, seconds, reduced) {
    if (state.landing) return;
    const { width, height } = state.map;
    const { unit } = camera;
    for (const [alongX, span, boundary, outward] of [
      [true, width, 0, -1], [false, height, 0, -1], [true, width, height, 1], [false, height, width, 1],
    ]) {
      const fixtureCount = Math.floor(span / 6.2);
      for (let index = 0; index < fixtureCount; index++) {
        const seed = index + boundary + state.floor * 4.1;
        const along = (index + 0.45 + noise(seed, span) * 0.16) * span / fixtureCount;
        const at = (forward, offset, z) => point(camera,
          alongX ? along + forward : boundary + outward * offset,
          alongX ? boundary + outward * offset : along + forward, z);
        const [x, y] = at(0, 0.18, 0);
        if (x < -unit * 2.5 || x > camera.width + unit * 2.5 || y < -unit || y > camera.height + unit) continue;
        const route = (heightOffset = 0) => [at(-1.02, 0.22, -0.35 + heightOffset),
          at(-0.53, 0.22, -0.35 + heightOffset), at(-0.34, 0.18, 0.10 + heightOffset),
          at(0.57, 0.18, 0.10 + heightOffset), at(0.80, 0.24, -0.25 + heightOffset)];
        if (theme !== "forge") {
          for (const mount of [-0.68, 0.51]) {
            const bracket = [at(mount, -0.12, -0.085), at(mount, 0.07, -0.085), at(mount, 0.23, 0.09)];
            line(context, bracket, "#18252f", unit * 0.12);
            line(context, bracket, palette.wallX, unit * 0.065);
          }
        }
        if (theme === "sluice") {
          line(context, route(), "#142226", unit * 0.17);
          line(context, route(), "#547970", unit * 0.107);
          line(context, route(0.025), "#a97658", unit * 0.052);
          for (const forward of [-0.20, 0.31, 0.55]) {
            line(context, [at(forward, 0.17, 0.017), at(forward, 0.17, 0.168)], "#bb987a", unit * 0.065);
            line(context, [at(forward + 0.052, 0.17, 0.01), at(forward + 0.052, 0.17, 0.16)], "#24332f", 1);
          }
          const drip = fraction(seconds * 0.29 + noise(seed, 63));
          if (!reduced && drip > 0.77) {
            const fall = (drip - 0.77) * 4.35;
            const drop = at(0.31, 0.18, 0.030 - fall ** 2 * 0.46);
            ellipse(context, ...drop, Math.max(0.85, unit * 0.027), Math.max(1.1, unit * 0.043), "#bce7e3c0");
          }
        } else if (theme === "relay") {
          const wire = [at(-1.12, 0.11, -0.04), at(-0.45, 0.11, -0.04),
            at(-0.18, 0.22, 0.21), at(0.81, 0.22, 0.21)];
          line(context, wire, "#162030", unit * 0.205);
          for (const [offset, color] of [[-0.048, "#49608e"], [0.0, "#7f9ab4"], [0.05, "#aa845e"]]) {
            line(context, wire.map(([px, py]) => [px, py + unit * offset]), color, unit * 0.039);
          }
          for (const forward of [-0.65, 0.20, 0.60]) {
            const z = forward < 0 ? -0.04 : 0.21;
            const mount = at(forward, 0.15, z);
            ellipse(context, ...mount, unit * 0.078, unit * 0.12, "#2a3450", "#a5a6ab", 0.9);
            line(context, [[mount[0] - unit * 0.056, mount[1]], [mount[0] + unit * 0.056, mount[1]]],
              "#b7a68a", 1.25);
          }
        } else {
          const lip = [at(-0.91, -0.11, -0.012), at(0.91, -0.11, -0.012),
            at(0.91, 0.42, -0.012), at(-0.91, 0.42, -0.012)];
          poly(context, lip, "#332831", "#947260", 0.95);
          poly(context, [lip[2], lip[3], at(-0.91, 0.42, -0.22), at(0.91, 0.42, -0.22)], "#281e25", "#14141d", 0.8);
          line(context, [at(-0.76, 0.11, 0.015), at(0.76, 0.11, 0.015)], "#c37451bb", unit * 0.09);
          for (let slat = 0; slat < 7; slat++) {
            const forward = (slat - 3) * 0.215;
            line(context, [at(forward, -0.05, 0.022), at(forward, 0.35, 0.022)], "#211c26", unit * 0.10);
            line(context, [at(forward + 0.043, -0.05, 0.029), at(forward + 0.043, 0.35, 0.029)], "#845e55",
              Math.max(0.6, unit * 0.027));
          }
        }
      }
    }
  }

  function perimeterMotion(context, camera, state, palette, theme, seconds, reduced) {
    if (palette.landscape && palette.landscape !== "rupture") return;
    const { width, height } = state.map;
    const unit = camera.unit;
    perimeterHardware(context, camera, state, palette, theme, seconds, reduced);
    context.save();
    for (let index = 0; index < 21; index++) {
      const phase = fraction(noise(index, 61) + (reduced ? 0 : seconds * (0.10 + noise(index, 85) * 0.09)));
      const along = fraction(noise(index, 13) + (reduced ? 0 : seconds * 0.035));
      const x = index % 2 ? along * width : width - 0.52;
      const y = index % 2 ? height - 0.52 : along * height;
      const [xx, yy] = point(camera, x, y);
      context.globalAlpha = 0.11 + Math.sin(phase * Math.PI) * 0.35;
      if (theme === "sluice") {
        ellipse(context, xx, yy, unit * (0.12 + phase * 0.66),
          unit * (0.05 + phase * 0.17), null, palette.glow, 1);
      } else if (theme === "relay") {
        const trail = index % 2
          ? point(camera, Math.max(0, x - 0.4), y)
          : point(camera, x, Math.max(0, y - 0.4));
        line(context, [[xx, yy], trail], palette.glow, 2);
      } else {
        line(context, [[xx, yy - unit * phase * 1.3],
          [xx + unit * 0.08, yy - unit * phase * 1.18]], palette.glow, 1.6);
      }
    }
    context.restore();
  }

  function stageArrival(context, camera, state, palette, theme, reduced) {
    const secondsLeft = state.revealTimer;
    if (!(secondsLeft > 0)) return;
    const fade = clamp(secondsLeft / 1.05, 0, 1);
    const progress = reduced ? 0.55 : 1 - fade;
    const { width, height } = state.map;
    const { unit } = camera;
    const focusX = state.player?.x ?? width / 2;
    const focusY = state.player?.y ?? height / 2;
    const [x, y] = point(camera, focusX, focusY);
    const reach = unit * (1.8 + progress * 5.8);
    const glow = context.createRadialGradient(x, y, 0, x, y, reach);
    glow.addColorStop(0, palette.glow);
    glow.addColorStop(1, "#11142100");
    context.save();
    context.globalAlpha = reduced ? 0.085 : 0.20 * fade;
    ellipse(context, x, y, reach, reach * 0.56, glow);
    const rim = (edge, alpha) => {
      context.globalAlpha = alpha;
      poly(context, rectangle(camera, edge, edge, width - 2 * edge, height - 2 * edge), null, palette.glow, 2.8);
    };
    rim(0.24, reduced ? 0.26 : 0.63 * fade);
    if (!reduced) {
      context.globalAlpha = 0.46 * fade;
      if (theme === "sluice") {
        rim(0.36 + progress * 0.85, 0.46 * fade);
        for (const side of [0.52, width - 0.52]) {
          for (let index = 0; index < 12; index++) {
            const yy = fraction(noise(index, 1) + progress * 0.36) * height;
            const [cx, cy] = point(camera, side, yy);
            ellipse(context, cx, cy, unit * (0.21 + progress * 0.52), unit * 0.10, null, palette.glow, 1.35);
          }
        }
      } else if (theme === "relay") {
        const xEnd = Math.min(width - 0.52, 0.52 + width * progress);
        const yEnd = Math.min(height - 0.52, 0.52 + height * progress);
        line(context, [point(camera, 0.52, yEnd), point(camera, 0.52, 0.52), point(camera, xEnd, 0.52)],
          palette.glow, 3);
        line(context, [point(camera, width - 0.52, height - yEnd),
          point(camera, width - 0.52, height - 0.52), point(camera, width - xEnd, height - 0.52)], palette.glow, 3);
      } else {
        for (let spark = 0; spark < 26; spark++) {
          const xx = spark % 2 ? noise(spark, 1) * width : width - 0.68;
          const yy = spark % 2 ? height - 0.68 : noise(spark, 5) * height;
          const lift = progress * (0.45 + noise(spark, 26));
          const [cx, cy] = point(camera, xx, yy, lift);
          line(context, [[cx, cy], [cx - unit * 0.09, cy + unit * 0.19]], palette.glow, 1.8);
        }
      }
    }
    context.restore();
  }

  function storyLighting(context, camera, state) {
    const { width, height } = camera;
    const radius = Math.max(width, height);
    const color = state.scene === "heart" ? "#261923c7" : state.scene === "memory" ? "#17142ac7" : "#09171ec9";
    const shade = context.createRadialGradient(width * 0.51, height * 0.40, radius * 0.14,
      width * 0.50, height * 0.43, radius * 0.70);
    shade.addColorStop(0, "#08111b00");
    shade.addColorStop(0.55, "#08111b2a");
    shade.addColorStop(1, color);
    context.fillStyle = shade;
    context.fillRect(0, 0, width, height);
  }

  function surfaceAxes(camera, entry) {
    const horizontal = entry.w >= entry.h;
    const length = horizontal ? entry.w : entry.h;
    const breadth = horizontal ? entry.h : entry.w;
    const at = (along, across, height = 0) => point(camera,
      entry.x + (horizontal ? along * length : across * breadth),
      entry.y + (horizontal ? across * breadth : along * length), height);
    const face = (span, depth, height = 0) => [
      at(-span, -depth, height), at(span, -depth, height), at(span, depth, height), at(-span, depth, height),
    ];
    return { at, face, length, breadth };
  }

  function waterSurface(context, camera, entry, seconds, reduced) {
    const { at, face, length } = surfaceAxes(camera, entry);
    const rim = face(0.5, 0.5);
    const interior = face(0.494, 0.445);
    const from = at(0, -0.45);
    const to = at(0, 0.45);
    const water = context.createLinearGradient(...from, ...to);
    water.addColorStop(0, "#10333e");
    water.addColorStop(0.44, "#1b697a");
    water.addColorStop(1, "#124454");
    poly(context, rim, "#1d3a3c", "#76a5a2", 1.25);
    poly(context, interior, water, "#246b74", 0.9);
    context.save();
    poly(context, interior);
    context.clip();
    for (let index = 0; index < Math.ceil(Math.min(27, length * 1.6)); index++) {
      const phase = fraction(noise(index, 73) + (reduced ? 0 : seconds * (0.10 + noise(index, 4) * 0.08)));
      const x = phase - 0.5;
      const y = (noise(index, 43) - 0.5) * 0.82;
      const width = 0.026 + noise(index, 56) * 0.15;
      context.globalAlpha = 0.22 + noise(index, 35) * 0.39;
      line(context, [at(x, y), at(x + width * 0.36, y - 0.032), at(x + width, y - 0.012)],
        index % 4 === 0 ? "#a3f4ee" : "#55afbd", index % 4 === 0 ? 1.6 : 1.1);
    }
    context.restore();
    for (const side of [-1, 1]) {
      line(context, [at(-0.50, side * 0.466), at(0.50, side * 0.466)], "#8ecec160", 1.25);
    }
  }

  function bridgeSurface(context, camera, entry) {
    const { at, face, length } = surfaceAxes(camera, entry);
    const lower = face(0.50, 0.50);
    const upper = face(0.50, 0.50, 0.12);
    const rim = "#a2b3a0";
    poly(context, [lower[1], lower[2], upper[2], upper[1]], "#294a50", "#1b3038", 1);
    poly(context, [lower[2], lower[3], upper[3], upper[2]], "#294a50", "#1b3038", 1);
    poly(context, upper, "#1a383ee0", rim, 1.1);
    const slats = Math.round(clamp(length * 4, 4, 30));
    for (let slot = 1; slot < slats; slot++) {
      const along = slot / slats - 0.5;
      line(context, [at(along, -0.49, 0.13), at(along, 0.49, 0.13)], "#7d9e95", 1.15);
    }
    for (const side of [-1, 1]) {
      const across = side * 0.45;
      line(context, [at(-0.5, across, 0.27), at(0.5, across, 0.27)], "#ccd6ad", 1.4);
      for (const along of [-0.49, 0, 0.49]) {
        line(context, [at(along, across, 0.12), at(along, across, 0.27)], rim, 1.3);
      }
    }
  }

  function conduitSurface(context, camera, entry, seconds, reduced) {
    const { at, face, length } = surfaceAxes(camera, entry);
    const live = entry.status === "active";
    const warning = entry.status === "warning";
    const accent = live ? "#ffe0a1" : warning ? "#ffc579" : "#839bba";
    poly(context, face(0.5, 0.5, 0.04), "#2d354a", "#697997", 1.15);
    poly(context, face(0.48, 0.39, 0.05), live ? "#964f36" : warning ? "#5c3f37" : "#1b2336", "#4f5367", 0.85);
    context.save();
    if (warning) context.setLineDash([6, 3]);
    for (const side of [-1, 1]) {
      line(context, [at(-0.48, side * 0.36, 0.07), at(0.48, side * 0.36, 0.07)], accent, live ? 2.15 : 1.3);
    }
    context.restore();
    const cells = Math.round(clamp(length * 2, 4, 23));
    for (let slot = 0; slot < cells; slot++) {
      const along = (slot + 0.5) / cells - 0.5;
      const polarity = slot % 2 ? -1 : 1;
      const modulation = Number.isFinite(entry.phase) ? entry.phase * tau : seconds * 16;
      const energy = reduced ? 0.72 : 0.47 + noise(slot, 19) * 0.17 + Math.sin(modulation + slot) * 0.24;
      context.save();
      if (live) context.globalAlpha = energy;
      line(context, [at(along - 0.013, -0.24, 0.065), at(along + 0.013, 0.24, 0.065)],
        live ? "#ffd696" : warning ? "#c58a62" : "#526584", live ? 1.3 : 0.9);
      if (live && !reduced && slot % 2 === 0) {
        line(context, [at(along - 0.016, -0.34 * polarity, 0.09),
          at(along + 0.017, -0.05 * polarity, 0.17), at(along - 0.010, 0.13 * polarity, 0.15),
          at(along + 0.018, 0.34 * polarity, 0.09)], "#fff1c4", 1.45);
      }
      context.restore();
    }
  }

  function steamPlume(context, x, y, unit, time, seed, reduced, strength) {
    const jet = context.createLinearGradient(x, y, x + unit * 0.07, y - unit * 0.55);
    jet.addColorStop(0, "#d9e6e6b7");
    jet.addColorStop(0.39, "#e5ece96e");
    jet.addColorStop(1, "#aebbca00");
    context.save();
    context.globalAlpha = strength * (reduced ? 0.55 : 1);
    poly(context, [[x - unit * 0.025, y], [x - unit * 0.071, y - unit * 0.53],
      [x + unit * 0.15, y - unit * 0.69], [x + unit * 0.043, y - unit * 0.05]], jet);
    for (let index = 0; index < 10; index++) {
      const phase = reduced ? (index + 1) / 11 : fraction(index * 0.10 + time * 0.44 + seed);
      const lift = unit * (0.15 + phase * 1.40 + phase ** 2 * 0.61);
      const flow = Math.sin(seed * 21 + index * 1.82 + (reduced ? 0 : time * 2.9));
      const wx = x + unit * (phase * 0.11 + phase * phase * (0.28 + flow * 0.46));
      const wy = y - lift;
      const radius = unit * (0.076 + phase * 0.20 + phase * phase * 0.15);
      context.save();
      context.translate(wx, wy);
      context.rotate(flow * phase * 0.29);
      context.scale(0.63 + phase * 1.19, 1.38 + phase * 0.16);
      const wisps = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      wisps.addColorStop(0, phase < 0.34 ? "#e6efedcc" : "#b9c5cb8f");
      wisps.addColorStop(0.56, phase < 0.34 ? "#d8e2e3a3" : "#afbec35c");
      wisps.addColorStop(1, "#8f9aa800");
      context.globalAlpha = strength * (reduced ? 0.42 : 1) * Math.sin(phase * Math.PI) * 0.49;
      ellipse(context, 0, 0, radius, radius, wisps);
      context.restore();
    }
    context.restore();
  }

  function ventSurface(context, camera, entry, seconds, reduced) {
    const { at, face } = surfaceAxes(camera, entry);
    const live = entry.status === "active";
    const warning = entry.status === "warning";
    const rim = live ? "#ffc89b" : warning ? "#edaf78" : "#9d7d62";
    poly(context, face(0.50, 0.50, 0.06), "#4d3539", rim, 1.25);
    poly(context, face(0.43, 0.42, 0.08), live ? "#995b43" : "#251b24", "#674c45", 1);
    for (let index = 1; index <= 5; index++) {
      const across = (index / 6 - 0.5) * 0.82;
      line(context, [at(-0.40, across, 0.15), at(0.40, across, 0.15)], rim, 1.65);
    }
    if (live || warning) {
      context.save();
      if (warning) context.setLineDash([4, 3]);
      poly(context, face(0.48, 0.46, 0.16), null, live ? "#ffb978" : "#f2a571", 2);
      context.restore();
    }
    for (const position of [-0.32, 0.27]) {
      const mouth = at(position, -0.07, 0.40);
      line(context, [at(position - 0.13, -0.07, 0.14), at(position, -0.07, 0.14), mouth],
        "#261c31", camera.unit * 0.17);
      line(context, [at(position - 0.13, -0.07, 0.14), at(position, -0.07, 0.14), mouth],
        live ? "#da946c" : "#a37b65", camera.unit * 0.107);
      ellipse(context, ...mouth, camera.unit * 0.068, camera.unit * 0.035, "#28313a", "#d6ad91", 1.0);
      if (live) steamPlume(context, ...mouth, camera.unit, seconds, position + entry.x * 0.16, reduced, 0.96);
    }
  }

  function drawTerrain(context, camera, surfaces, seconds, reduced, elevation, layer) {
    if (!Array.isArray(surfaces)) return;
    const layers = { water: waterSurface, bridge: bridgeSurface, conduit: conduitSurface, vent: ventSurface };
    for (const [kind, render] of Object.entries(layers)) {
      for (const entry of surfaces) {
        if (entry.kind !== kind || entry.w <= 0 || entry.h <= 0) continue;
        const height = surfaceHeight(elevation, entry.x, entry.y);
        if (layer !== undefined && (height > 0.04 ? 1 : 0) !== layer) continue;
        render(context, raisedCamera(camera, height), entry, seconds, reduced);
      }
    }
  }

  function floorStencil(context, camera, at, label, color) {
    const size = clamp(camera.unit * 0.32, 10, 17);
    context.save();
    context.translate(...at);
    context.scale(1, 0.84);
    context.font = `800 ${size}px system-ui, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.strokeStyle = "#132329";
    context.lineWidth = 2.5;
    context.strokeText(label, 0, 0);
    context.fillStyle = color;
    context.fillText(label, 0, 0);
    context.restore();
  }

  function gatePlate(context, camera, gate, palette, label) {
    const open = Boolean(gate.active ?? gate.open);
    const color = open ? "#b8eccd" : "#efd09b";
    const rx = gate.facingX ?? 1;
    const ry = gate.facingY ?? 0;
    const length = Math.hypot(rx, ry);
    const dx = length ? rx / length : 1;
    const dy = length ? ry / length : 0;
    const at = (ahead, across, z = 0.02) => point(camera,
      gate.x + dx * ahead - dy * across, gate.y + dy * ahead + dx * across, z);
    const frame = [at(-1.52, -0.73), at(0.38, -0.73), at(0.38, 0.73), at(-1.52, 0.73)];
    poly(context, frame, palette.materialShade + "ae", color + "ba", 1.45);
    poly(context, [at(-1.44, -0.63), at(0.23, -0.63), at(0.23, 0.63), at(-1.44, 0.63)],
      null, color + "6a", 0.9);
    for (const side of [-1, 1]) {
      const lamp = at(0.19, side * 0.5, 0.06);
      ellipse(context, ...lamp, camera.unit * 0.104, camera.unit * 0.053, color + "7d");
      ellipse(context, ...lamp, Math.max(1.5, camera.unit * 0.05), Math.max(1, camera.unit * 0.024), color);
      line(context, [at(-1.52, side * 0.73), at(-1.19, side * 0.73)], color, 1.45);
    }
    for (const ahead of [-2.16, -1.78]) {
      line(context, [at(ahead - 0.10, -0.35), at(ahead + 0.12, 0), at(ahead - 0.10, 0.35)],
        color + "d0", Math.max(1.45, camera.unit * 0.062));
    }
    floorStencil(context, camera, at(-1.03, 0, 0.05), label, color);
  }

  function paintGateMarkings(context, camera, state, palette, elevation, layer) {
    if (!state.revealed) return;
    const accepts = (entry) => layer === undefined
      || (surfaceHeight(elevation, entry.x, entry.y) > 0.04 ? 1 : 0) === layer;
    const marker = state.gateMarker;
    const exit = state.items?.find((entry) => entry.kind === "exit" && !entry.collected);
    if (marker && Number.isFinite(marker.x) && Number.isFinite(marker.y) && accepts(marker)) {
      gatePlate(context, onSurface(camera, elevation, marker), marker, palette, marker.type === "sluice" ? "수문" : "출구");
    }
    if (exit && accepts(exit) && (!marker || Math.hypot(exit.x - marker.x, exit.y - marker.y) > 0.6)) {
      gatePlate(context, onSurface(camera, elevation, exit), exit, palette, state.theme === "sluice" ? "수문 출구" : "출구");
    }
    const zone = state.holdZone;
    if (!zone || !accepts(zone)) return;
    const local = onSurface(camera, elevation, zone);
    const radius = zone.radius ?? 1.7;
    const color = zone.active ? "#c4f6dd" : "#90d7be";
    groundRing(context, local, zone.x, zone.y, radius * 0.88, "#193c412f", color + "b0", 1.25);
    context.save();
    context.setLineDash([3.5, 3.5]);
    groundRing(context, local, zone.x, zone.y, radius * 0.70, null, color + "82", 1);
    context.restore();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      line(context, [point(local, zone.x + dx * radius * 0.68, zone.y + dy * radius * 0.68, 0.02),
        point(local, zone.x + dx * radius * 0.87, zone.y + dy * radius * 0.87, 0.02)], color, 1.3);
    }
    floorStencil(context, local, point(local, zone.x + radius * 0.25, zone.y + radius * 0.47, 0.04), "동기화", color);
  }

  function housingTop(context, camera, entry, palette, theme, deck, seconds, reduced) {
    const { x, y, w, h } = entry;
    const unit = camera.unit;
    const span = Math.min(0.76, w * 0.61, h * 0.76);
    const top = palette.obstacleHeight;
    if (theme === "sluice") {
      const size = Math.min(w * 0.78, 1.8);
      poly(context, rectangle(camera, x - size / 2, y - span / 2, size, span, deck),
        "#203b45", palette.inlay, 1);
      for (let index = 1; index < 6; index++) {
        const xx = x - size / 2 + size * index / 6;
        line(context, [point(camera, xx, y - span * 0.41, deck),
          point(camera, xx, y + span * 0.41, deck)], palette.cap, 1.3);
      }
      const [cx, cy] = point(camera, x, y, top);
      ellipse(context, cx, cy, unit * 0.23, unit * 0.12, "#284854", palette.fixture, 1.3);
      line(context, [[cx - unit * 0.16, cy], [cx + unit * 0.16, cy]], palette.fixture, 1);
      line(context, [[cx, cy - unit * 0.075], [cx, cy + unit * 0.075]], palette.fixture, 1);
      return;
    }
    if (theme === "relay") {
      const distance = Math.min(0.44, w * 0.30);
      const offset = span * 0.16;
      for (const side of [-1, 1]) {
        const xx = x + distance * side;
        const [ax, ay] = point(camera, xx, y, deck - 0.01);
        const [bx, by] = point(camera, xx, y, top);
        line(context, [[ax, ay], [bx, by]], "#223046", unit * 0.21);
        for (let rung = 1; rung <= 3; rung++) {
          const [cx, cy] = point(camera, xx, y, deck + (top - deck) * rung / 3);
          ellipse(context, cx, cy, unit * 0.105, unit * 0.050, palette.conduit, palette.fixture, 0.65);
        }
      }
      const pulse = reduced ? 0.62 : 0.30 + Math.abs(Math.sin(seconds * 7 + x)) * 0.62;
      context.save();
      context.globalAlpha *= pulse;
      line(context, [point(camera, x - distance, y, top), point(camera, x - offset, y, top - 0.09),
        point(camera, x, y - offset, top + 0.05), point(camera, x + distance, y, top)], palette.glow, 1.5);
      context.restore();
      return;
    }

    const [cx, seat] = point(camera, x, y, deck + 0.015);
    const topY = point(camera, x, y, top)[1];
    const half = span * unit * 0.56;
    poly(context, [[cx - half, seat], [cx - half * 0.67, seat - unit * 0.14],
      [cx - half * 0.38, topY], [cx + half * 0.34, topY], [cx + half * 0.71, seat - unit * 0.14],
      [cx + half, seat]], "#392327", palette.cap, 1.2);
    ellipse(context, cx, seat, half, unit * 0.105, "#301a23", palette.glow, 1.15);
    line(context, [[cx + half * 0.23, topY + unit * 0.07], [cx + half * 0.55, seat - unit * 0.06]],
      palette.fixture, 1.0);
  }

  const facilityMetal = {
    copper: ["#674f43", "#a47758", "#d2a477"],
    iron: ["#34373d", "#59626a", "#8c9895"],
    ceramic: ["#3c5060", "#71969b", "#bdd7cc"],
    stone: ["#3b3435", "#736154", "#aa9077"],
  };

  function facilityFootprint(entry, from, to, left, right) {
    const horizontal = entry.w >= entry.h;
    const along = (from + to) / 2;
    const across = (left + right) / 2;
    return {
      x: entry.x + (horizontal ? along : across) * entry.w,
      y: entry.y + (horizontal ? across : along) * entry.h,
      w: (horizontal ? to - from : right - left) * entry.w,
      h: (horizontal ? right - left : to - from) * entry.h,
    };
  }

  function facilityAxes(context, camera, entry, palette) {
    const frame = surfaceAxes(camera, entry);
    const box = (from, to, left, right, base, top, metal = facilityMetal.iron) => {
      const { x, y, w, h } = facilityFootprint(entry, from, to, left, right);
      prism(context, raisedCamera(camera, base), x - w / 2, y - h / 2, w, h, top - base,
        metal[2], metal[1], metal[0], palette.surfaceJoint);
    };
    return { ...frame, box };
  }

  function facilityPipe(context, points, unit, radius, metal = facilityMetal.copper) {
    line(context, points, metal[0], unit * radius);
    line(context, points.map(([x, y]) => [x, y - unit * radius * 0.10]), metal[1], unit * radius * 0.72);
    line(context, points.map(([x, y]) => [x, y - unit * radius * 0.23]), metal[2],
      Math.max(0.62, unit * radius * 0.18));
  }

  function facilityDrum(context, at, along, across, base, top, radius, unit, metal, contents) {
    const [x, y] = at(along, across, base);
    const capY = at(along, across, top)[1];
    const rx = Math.max(2, unit * radius * 1.18);
    const ry = rx * 0.4;
    const fill = context.createLinearGradient(x - rx, y, x + rx, y);
    fill.addColorStop(0, metal[0]);
    fill.addColorStop(0.33, metal[2]);
    fill.addColorStop(0.65, metal[1]);
    fill.addColorStop(1, metal[0]);
    context.beginPath();
    context.moveTo(x - rx, capY);
    context.lineTo(x - rx, y);
    context.ellipse(x, y, rx, ry, 0, Math.PI, 0, true);
    context.lineTo(x + rx, capY);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.strokeStyle = "#20242b";
    context.lineWidth = 0.9;
    context.stroke();
    ellipse(context, x, capY, rx, ry, metal[2], metal[0], 1);
    ellipse(context, x, capY + ry * 0.08, rx * 0.76, ry * 0.74, contents ?? metal[1], metal[0], 0.9);
    for (const z of [base + (top - base) * 0.13, base + (top - base) * 0.76]) {
      const bandY = at(along, across, z)[1];
      context.beginPath();
      context.ellipse(x, bandY, rx, ry * 0.87, 0, Math.PI * 0.02, Math.PI * 0.98);
      context.strokeStyle = metal[0];
      context.lineWidth = Math.max(0.8, unit * 0.048);
      context.stroke();
    }
  }

  function facilityWheel(context, center, radius, angle, metal = facilityMetal.copper) {
    const [x, y] = center;
    const ry = radius * 0.74;
    ellipse(context, x, y, radius, ry, "#292b2c", metal[0], Math.max(1, radius * 0.22));
    ellipse(context, x, y, radius * 0.88, ry * 0.88, null, metal[2], Math.max(1, radius * 0.14));
    for (let arm = 0; arm < 3; arm++) {
      const phase = angle + arm * tau / 3;
      line(context, [[x, y], [x + Math.cos(phase) * radius * 0.84, y + Math.sin(phase) * ry * 0.84]],
        metal[1], Math.max(0.85, radius * 0.14));
    }
    ellipse(context, x, y, Math.max(1, radius * 0.22), Math.max(1, ry * 0.22), metal[2]);
  }

  function fixtureIntake(context, camera, axis, entry, phase) {
    const { at, box, face } = axis;
    const unit = camera.unit;
    poly(context, face(0.46, 0.39, 0.14), "#14292e", "#80a398", 1.3);
    poly(context, face(0.41, 0.30, 0.16), "#265964", "#517977", 0.82);
    for (const across of [-0.22, -0.07, 0.09, 0.22]) {
      const head = -0.38 + (across + 0.25 + phase) % 0.69;
      line(context, [at(head, across, 0.17), at(head + 0.10, across + 0.02, 0.17)],
        "#9edbd6aa", Math.max(1, unit * 0.033));
    }
    box(-0.43, 0.43, -0.45, -0.31, 0.08, 0.90, facilityMetal.iron);
    facilityPipe(context, [at(-0.43, -0.26, 0.84), at(0.43, -0.26, 0.84)], unit, 0.15);
    for (let slat = -3; slat <= 3; slat++) {
      const x = slat * 0.113;
      line(context, [at(x, -0.24, 0.78), at(x, 0.29, 0.23)], "#1b3036", unit * 0.11);
      line(context, [at(x + 0.01, -0.24, 0.79), at(x + 0.01, 0.29, 0.24)], "#7b9e99", Math.max(1, unit * 0.045));
    }
    facilityPipe(context, [at(-0.43, 0.29, 0.22), at(0.43, 0.29, 0.22)], unit, 0.13, facilityMetal.iron);
  }

  function fixturePumps(context, camera, axis, entry, phase, reduced) {
    const { at, box, breadth } = axis;
    const unit = camera.unit;
    box(-0.46, 0.46, -0.30, 0.30, 0.12, 0.38);
    const radius = Math.min(0.32, breadth * 0.24, axis.length * 0.15);
    for (const [along, motion] of [[-0.25, phase], [0.22, phase + 0.33]]) {
      facilityDrum(context, at, along, 0, 0.28, 0.87, radius, unit, facilityMetal.copper);
      const arm = (reduced ? 0 : Math.sin(motion * tau) * 0.055);
      facilityPipe(context, [at(along, -0.26, 0.64), at(along, 0.20, 0.64),
        at(along + 0.105 + arm, 0.37, 0.44)], unit, 0.16, facilityMetal.iron);
      facilityWheel(context, at(along + 0.035, 0.25, 0.69), Math.max(3.5, unit * radius * 0.71), motion * tau);
    }
    facilityPipe(context, [at(-0.43, 0.36, 0.38), at(0.43, 0.36, 0.38)], unit, 0.18);
  }

  function fixtureCondenser(context, camera, axis, entry, phase, reduced) {
    const { at, box, face, length } = axis;
    const unit = camera.unit;
    poly(context, face(0.44, 0.40, 0.16), "#1e333b", "#8db5af", 1.0);
    box(-0.45, 0.45, -0.39, -0.29, 0.13, 0.34); // Back collecting trough.
    const count = Math.max(3, Math.min(6, Math.round(length * 1.4)));
    for (let i = 0; i < count; i++) {
      const along = -0.38 + i * (0.76 / (count - 1));
      facilityPipe(context, [at(along, -0.30, 0.25), at(along, -0.30, 0.97),
        at(along, -0.17, 1.19), at(along, 0.11, 1.19), at(along, 0.28, 0.97), at(along, 0.28, 0.24)],
      unit, 0.13, i % 2 ? facilityMetal.copper : facilityMetal.iron);
      const fall = fraction(phase * 2 + i * 0.37);
      if (!reduced && fall > 0.50) {
        ellipse(context, ...at(along + 0.01, 0.29, 0.74 - (fall - 0.50) ** 2 * 2.4),
          Math.max(0.9, unit * 0.031), Math.max(1, unit * 0.041), "#b3e8e0b0");
      }
    }
    facilityPipe(context, [at(-0.43, 0.30, 0.28), at(0.43, 0.30, 0.28)], unit, 0.18, facilityMetal.ceramic);
  }

  function fixtureBoilers(context, camera, axis, entry, phase) {
    const { at, length, breadth } = axis;
    const unit = camera.unit;
    const radius = Math.min(0.46, breadth * 0.31, length * 0.205);
    for (const [along, crown] of [[-0.22, 1.23], [0.22, 1.06]]) {
      facilityDrum(context, at, along, -0.025, 0.17, crown, radius, unit, facilityMetal.copper);
      facilityPipe(context, [at(along, -0.10, crown), at(along, -0.10, crown + 0.28),
        at(along + 0.08, -0.10, crown + 0.39)], unit, 0.19, facilityMetal.iron);
      const gauge = at(along - 0.04, 0.32, crown * 0.67);
      ellipse(context, ...gauge, unit * 0.106, unit * 0.12, "#392f2e", "#d4af87", 1);
      line(context, [gauge, [gauge[0] + Math.cos(phase * 1.3) * unit * 0.07, gauge[1] - unit * 0.061]],
        "#f5cea0", 1);
    }
  }

  function fixtureSmelter(context, camera, axis, entry, phase) {
    const { at, box } = axis;
    const unit = camera.unit;
    box(-0.46, 0.46, -0.36, -0.21, 0.15, 1.12, facilityMetal.stone);
    for (const [start, end] of [[-0.44, -0.31], [0.31, 0.44]]) {
      box(start, end, -0.21, 0.32, 0.15, 1.14, facilityMetal.stone);
    }
    const opening = [at(-0.31, 0.31, 0.23), at(0.31, 0.31, 0.23), at(0.31, 0.31, 0.93),
      at(-0.31, 0.31, 0.93)];
    const ember = context.createLinearGradient(...opening[0], ...opening[3]);
    ember.addColorStop(0, "#f3a662");
    ember.addColorStop(0.35, "#924d39");
    ember.addColorStop(1, "#201b25");
    poly(context, opening, ember, "#2c2225", 1.1);
    for (let i = -2; i <= 2; i++) {
      const along = i * 0.117;
      line(context, [at(along, 0.325, 0.21), at(along, 0.325, 1.0)], "#352b2c", unit * 0.088);
      line(context, [at(along - 0.01, 0.337, 0.24), at(along - 0.01, 0.337, 0.76)], "#b97b56", 0.8);
      const lip = at(along, 0.38, 0.23 + Math.sin(phase * tau + i * 2.2) * 0.035);
      ellipse(context, ...lip, Math.max(0.8, unit * 0.025), Math.max(0.8, unit * 0.025), "#ffc77c99");
    }
    poly(context, [at(-0.44, 0.35, 1.01), at(0.44, 0.35, 1.01), at(0.27, 0.03, 1.52),
      at(-0.27, 0.03, 1.52)], "#626160", "#2b2a2b", 1.15);
    line(context, [at(-0.41, 0.34, 1.09), at(0.41, 0.34, 1.09)], "#b17b61", Math.max(1, unit * 0.032));
    box(-0.17, 0.17, -0.18, 0.10, 1.45, 1.80, facilityMetal.iron);
  }

  function fixtureCrucible(context, camera, axis, entry, phase) {
    const { at, box, length, breadth } = axis;
    const radius = Math.min(0.67, breadth * 0.36, length * 0.31);
    const unit = camera.unit;
    for (const p of [-0.34, 0.34]) box(p - 0.09, p + 0.09, -0.35, 0.35, 0.13, 0.78, facilityMetal.iron);
    facilityDrum(context, at, 0, 0, 0.35, 1.04, radius, unit, facilityMetal.stone, "#d77242");
    const [x, y] = at(0, 0, 1.055);
    const hot = unit * radius;
    const swirl = 0.76 + Math.sin(phase * tau) * 0.12;
    ellipse(context, x, y, hot * 0.73, hot * 0.25, "#ffb05f");
    ellipse(context, x - hot * 0.18, y, hot * swirl * 0.53, hot * 0.17, "#ffe3979e");
    for (const [u, v] of [[-0.29, 0.09], [0.24, -0.08], [0.06, 0.10]]) {
      ellipse(context, x + u * hot, y + v * hot, Math.max(1.2, hot * 0.13), Math.max(1, hot * 0.043), "#d87546");
    }
    facilityPipe(context, [at(0.18, 0.23, 0.78), at(0.33, 0.31, 0.78), at(0.46, 0.38, 0.39)],
      unit, 0.15, facilityMetal.iron);
  }

  function fixtureTransformers(context, camera, axis, entry, phase) {
    const { at, box, length } = axis;
    const unit = camera.unit;
    box(-0.43, 0.43, -0.32, 0.32, 0.13, 0.56, facilityMetal.iron);
    const count = Math.max(2, Math.min(4, Math.floor(length * 0.85)));
    const terminals = [];
    for (let i = 0; i < count; i++) {
      const along = -0.33 + i * (0.66 / (count - 1));
      const crown = 1.45 - (i % 2) * 0.15;
      const across = i % 2 ? 0.18 : -0.10;
      facilityPipe(context, [at(along, across, 0.56), at(along, across, crown)],
        unit, 0.17, facilityMetal.ceramic);
      for (const z of [0.70, 0.84, 0.98, 1.12, 1.26]) {
        if (z < crown) ellipse(context, ...at(along, across, z), unit * 0.134, unit * 0.060,
          "#7ca0a5", "#b6ddd2", 0.8);
      }
      terminals.push(at(along, across, crown));
    }
    facilityPipe(context, terminals, unit, 0.072);
    const blip = terminals[Math.floor(phase * terminals.length) % terminals.length];
    ellipse(context, ...blip, Math.max(1.6, unit * 0.049), Math.max(1.3, unit * 0.040), "#c9f7e9");
    for (const y of [-0.17, 0.05, 0.20]) line(context, [at(-0.41, y, 0.58), at(0.41, y, 0.58)], "#bfb5976d", 1.0);
  }

  function fixtureRelayRack(context, camera, axis, entry, phase) {
    const { at, box } = axis;
    const unit = camera.unit;
    box(-0.43, 0.43, -0.34, 0.07, 0.12, 1.31, ["#333647", "#566577", "#9babae"]);
    for (const u of [-0.27, 0, 0.27]) {
      poly(context, [at(u - 0.112, 0.081, 0.25), at(u + 0.112, 0.081, 0.25),
        at(u + 0.112, 0.081, 1.19), at(u - 0.112, 0.081, 1.19)], "#25313c", "#687f8e", 0.86);
      for (let slot = 0; slot < 4; slot++) {
        const z = 0.38 + slot * 0.12;
        line(context, [at(u - 0.087, 0.089, z), at(u + 0.086, 0.089, z)], "#8698a4", Math.max(0.7, unit * 0.02));
      }
      const color = phase > 0.38 + u * 0.78 ? "#b2ead4" : "#e5bb7b";
      ellipse(context, ...at(u + 0.022, 0.089, 1.044), unit * 0.041, unit * 0.045, color);
    }
    for (const [i, shade] of ["#7189af", "#9d785f", "#78ad9e"].entries()) {
      const across = 0.19 + 0.075 * i;
      line(context, [at(-0.37, across, 0.24), at(0.31, across, 0.24), at(0.39, 0.1, 0.71)],
        shade, Math.max(1.0, unit * 0.054));
    }
  }

  function fixtureDrydock(context, camera, axis, entry, phase) {
    const { at, box, face } = axis;
    const unit = camera.unit;
    poly(context, face(0.46, 0.37, 0.14), "#172a31", "#829c9b", 1.05);
    for (const side of [-1, 1]) {
      const outside = side * 0.42;
      const inside = side * 0.24;
      box(-0.44, 0.44, Math.min(outside, inside), Math.max(outside, inside), 0.12, 0.39, facilityMetal.iron);
      for (const t of [-0.34, -0.05, 0.25]) {
        line(context, [at(t, side * 0.35, 0.43), at(t + 0.08, side * 0.21, 0.22)], "#bfc3a1", unit * 0.075);
      }
      facilityPipe(context, [at(-0.44, side * 0.17, 0.27), at(0.44, side * 0.17, 0.27)],
        unit, 0.082, facilityMetal.iron);
    }
    box(-0.39, -0.28, -0.37, 0.37, 0.14, 0.91, facilityMetal.iron);
    for (const y of [-0.24, 0.24]) ellipse(context, ...at(-0.28, y, 0.68), unit * 0.066, unit * 0.050,
      phase > 0.85 ? "#e9bd7a" : "#a6c9c0");
    line(context, [at(0.40, -0.31, 0.25), at(0.40, 0.31, 0.25)], "#a8b4a1", 1.5);
  }

  function fixtureManifold(context, camera, axis, entry, phase) {
    const { at, box } = axis;
    const unit = camera.unit;
    box(-0.45, 0.45, -0.38, -0.21, 0.14, 0.36);
    facilityPipe(context, [at(-0.44, -0.33, 0.70), at(0.44, -0.33, 0.70)], unit, 0.23);
    for (const [along, metal] of [[-0.30, facilityMetal.copper], [0.0, facilityMetal.iron], [0.29, facilityMetal.ceramic]]) {
      facilityPipe(context, [at(along, -0.33, 0.71), at(along, 0.19, 0.71),
        at(along + 0.04, 0.35, 0.36), at(along + 0.12, 0.35, 0.29)], unit, 0.18, metal);
      facilityWheel(context, at(along, 0.11, 0.88), Math.max(3.1, unit * 0.14), phase * 1.4 + along, metal);
    }
  }

  function fixtureValveBank(context, camera, axis, entry, phase) {
    const { at, box } = axis;
    const unit = camera.unit;
    box(-0.44, 0.44, -0.35, 0.02, 0.13, 1.30, facilityMetal.stone);
    facilityPipe(context, [at(-0.44, 0.22, 0.40), at(0.44, 0.22, 0.40)], unit, 0.20, facilityMetal.iron);
    for (const forward of [-0.28, 0, 0.28]) {
      facilityPipe(context, [at(forward, 0.22, 0.43),
        at(forward, 0.22, 0.95), at(forward, 0.03, 0.95)], unit, 0.154);
      facilityWheel(context, at(forward, 0.27, 0.92), Math.min(unit * 0.28, axis.length * unit * 0.128), phase * 1.7 + forward);
    }
    line(context, [at(-0.43, 0.027, 1.17), at(0.43, 0.027, 1.17)], "#bca681", 1.3);
  }

  function fixtureScrubber(context, camera, axis, entry, phase, reduced, seconds) {
    const { at, box, length, breadth } = axis;
    const unit = camera.unit;
    const radius = Math.min(0.46, breadth * 0.30, length * 0.26);
    facilityDrum(context, at, -0.04, -0.06, 0.14, 1.14, radius, unit, facilityMetal.iron);
    box(-0.16, 0.16, -0.23, 0.12, 1.11, 1.34, facilityMetal.ceramic);
    facilityPipe(context, [at(-0.39, 0.28, 0.31), at(-0.31, 0.28, 0.64), at(0.17, 0.28, 0.64),
      at(0.29, 0.12, 0.91), at(0.13, 0.12, 1.20)], unit, 0.23, facilityMetal.iron);
    const mouth = at(0, -0.03, 1.35);
    ellipse(context, ...mouth, Math.max(2, unit * 0.19), Math.max(1.5, unit * 0.061),
      "#253a3c", "#b6cabe", 1);
    if (!reduced && phase > 0.40 && phase < 0.82) {
      steamPlume(context, ...mouth, unit, seconds, entry.x + 3, false, 0.72);
    }
  }

  const facilityFixtures = {
    intake: fixtureIntake, pumps: fixturePumps, condenser: fixtureCondenser, boilers: fixtureBoilers,
    smelter: fixtureSmelter, crucible: fixtureCrucible, transformers: fixtureTransformers, "relay-rack": fixtureRelayRack,
    drydock: fixtureDrydock, manifold: fixtureManifold, "valve-bank": fixtureValveBank, scrubber: fixtureScrubber,
  };

  const facilityCasing = {
    intake: [[-.43, .43, -.45, -.31, .08, .90]],
    smelter: [[-.46, .46, -.36, -.21, .15, 1.12],
      [-.44, -.31, -.21, .32, .15, 1.14], [.31, .44, -.21, .32, .15, 1.14]],
    "relay-rack": [[-.43, .43, -.34, .07, .12, 1.31]],
    drydock: [[-.39, -.28, -.37, .37, .14, .91]],
    "valve-bank": [[-.44, .44, -.35, .02, .13, 1.30]],
  };

  function paintFacilityDressing(context, camera, state, palette, elevation, layer) {
    const feature = state.facility?.feature;
    if (!feature || !Object.hasOwn(facilityFixtures, feature)) return;
    for (const entry of state.obstacles ?? []) {
      if (entry.fixture !== feature) continue;
      const height = surfaceHeight(elevation, entry.x, entry.y);
      if (layer !== undefined && (height > 0.04 ? 1 : 0) !== layer) continue;
      const horizontal = entry.w >= entry.h;
      const along = horizontal ? entry.w : entry.h;
      const across = horizontal ? entry.h : entry.w;
      const project = ([u, v]) => [
        entry.x + (horizontal ? u : v) * entry.w,
        entry.y + (horizontal ? v : u) * entry.h,
      ];
      const sameSurface = ([x, y]) => x > 0.15 && y > 0.15 && x < state.map.width - 0.15
        && y < state.map.height - 0.15 && Math.abs(surfaceHeight(elevation, x, y) - height) < 0.04;
      const stroke = (marks, color, weight) => {
        const world = marks.map(project);
        if (world.every(sameSurface)) line(context, world.map(([x, y]) => point(camera, x, y, height + 0.016)), color, weight);
      };
      const apron = Math.min(0.37, 0.65 / across);
      const tail = Math.min(0.44, 1.15 / along);
      const bridge = feature === "drydock" || feature === "intake";
      const service = feature === "transformers" || feature === "relay-rack";
      const hot = feature === "boilers" || feature === "smelter" || feature === "crucible";
      const steel = palette.materialLight + "74";
      const signal = hot ? "#d0915b9a" : service ? "#94a8c88f" : "#9fc1ae91";
      const unit = camera.unit;
      for (const sign of [-1, 1]) {
        const lane = sign * (0.5 + apron);
        stroke([[-0.44, lane], [0.44, lane]], palette.materialShade + "8f", Math.max(1.3, unit * 0.075));
        stroke([[-0.44, lane], [0.44, lane]], steel, Math.max(0.78, unit * 0.024));
        for (const end of [-1, 1]) stroke([[end * 0.44, lane], [end * 0.54, lane],
          [end * 0.54, sign * (0.29 + apron)]], signal, Math.max(1, unit * 0.032));
      }
      if (bridge || service) {
        for (const v of [-0.22, 0.22]) {
          stroke([[-0.48, v], [-0.62 - tail, v], [-0.65 - tail, v + 0.13]],
            palette.materialShade + "a4", Math.max(1.4, unit * 0.065));
          stroke([[-0.48, v], [-0.62 - tail, v], [-0.65 - tail, v + 0.13]],
            signal, Math.max(0.7, unit * 0.025));
        }
      } else {
        stroke([[0.46, 0.22], [0.60, 0.22], [0.72, 0.28 + apron * 0.52], [0.60 + tail, 0.28 + apron * 0.52]],
          palette.materialShade + "91", Math.max(1.55, unit * 0.067));
        stroke([[0.46, 0.22], [0.60, 0.22], [0.72, 0.28 + apron * 0.52], [0.60 + tail, 0.28 + apron * 0.52]],
          signal, Math.max(0.76, unit * 0.026));
      }
    }
  }

  function paintEarlyBrasswork(context, camera, state, elevation, layer) {
    if (state.floor > 8 || state.landing || state.shelter) return;
    const { width, height } = state.map;
    const unit = camera.unit;
    const brass = "#a37955";
    const worn = "#d4b178";
    const patina = "#426e68";
    const seam = "#19252a";
    const track = (world, z) => {
      if (!world.every(([x, y]) => Math.abs(surfaceHeight(elevation, x, y) - z) < .045)) return;
      const marks = world.map(([x, y]) => point(camera, x, y, z + .023));
      line(context, marks, seam + "cd", Math.max(2, unit * .104));
      line(context, marks, brass + "d4", Math.max(1.15, unit * .064));
      line(context, marks.map(([x, y]) => [x, y - .5]), worn + "b8", Math.max(.65, unit * .021));
    };
    if (layer === 1) {
      for (const deck of elevation.decks) {
        for (const side of deckPerimeter(deck, elevation)) {
          for (const [from, to] of side.segments) {
            if (to - from < 1.92) continue;
            const normal = side.position - side.facing * .31;
            const along = (x) => side.alongX ? [x, normal] : [normal, x];
            track([along(from + .34), along(to - .34)], elevation.height);
          }
        }
      }
      return;
    }

    const turn = Math.min(1.62, height * .12);
    const passage = height * .58;
    const reach = Math.min(width * .42, 10.2);
    for (const d of [0, .26]) {
      track([[.52 + d, .82], [.52 + d, passage - turn], [1.17 + d, passage - .45],
        [1.82 + d, passage - .21], [reach, passage - .21 + d]], 0);
      track([[width * .32, .59 + d], [width * .58, .59 + d],
        [width * .67, .93 + d], [width - .76, .93 + d]], 0);
    }
    for (let along = 2.3; along < reach - .26; along += 1.42) {
      if (surfaceHeight(elevation, along, passage) > .045) continue;
      const corners = rectangle(camera, along - .058, passage - .32, .116, .46, .031);
      poly(context, corners, patina + "d8", seam + "c2", .68);
      line(context, [point(camera, along, passage - .24, .036), point(camera, along, passage + .07, .036)],
        worn + "b2", .76);
    }
  }

  function facilityObstacle(context, camera, entry, palette, seconds, reduced) {
    const fixture = facilityFixtures[entry.fixture];
    if (!fixture) return false;
    const [x, y] = point(camera, entry.x, entry.y);
    const reach = camera.unit * ((entry.w + entry.h) * 0.53 + 2.3);
    if (x + reach < 0 || x - reach > camera.width || y + reach < 0 || y - reach > camera.height) return true;
    const axis = facilityAxes(context, camera, entry, palette);
    const phase = reduced ? 0.45 : fraction(seconds * 0.56 + noise(entry.x, entry.y));
    const ground = axis.face(0.49, 0.49, 0.012);
    const plinth = [palette.wallY, palette.capDark, palette.capSide];
    poly(context, ground, palette.materialShade + "51");
    axis.box(-0.48, 0.48, -0.47, 0.47, 0.01, 0.15, plinth);
    poly(context, axis.face(0.447, 0.423, 0.155), null, palette.inlay + "ad", 0.93);
    fixture(context, camera, axis, entry, phase, reduced, seconds);
    return true;
  }

  function obstacleHeight(entry, palette) {
    if (entry.structural) return 1.48;
    const dressed = entry.w > 0.90 && entry.h > 0.74;
    return palette.obstacleHeight * (dressed ? 0.69 : 1);
  }

  function rockObstacle(context, camera, entry, palette) {
    const { x, y, w, h } = entry;
    const height = obstacleHeight(entry, palette);
    const seed = noise(x, y);
    const at = (u, v, z = height) => point(camera, x + u * w, y + v * h, z);
    const outline = [at(-.5, -.5), at(.5, -.5), at(.5, .5), at(-.5, .5)];
    const corner = at(.04 + seed * .16, -.16);
    contactShadow(context, ...at(.18, .08, 0), camera.unit * Math.min(w + h, 4.4), palette);
    const face = materialShade(context, outline[0], outline[2], palette.capSide, palette, palette.cap, palette.capDark);
    prism(context, camera, x - w * .5, y - h * .5, w, h, height, face, palette.wallX, palette.wallY, palette.seam);
    poly(context, [outline[0], outline[1], corner, at(-.36, .02)], palette.materialLight + "51");
    poly(context, [corner, outline[1], outline[2], at(.12, .39)], palette.materialShade + "52");
    line(context, [outline[0], at(-.37, -.11), at(-.41, .19), outline[3]], palette.materialLight + "a1", 1.15);
    for (const rise of [.19, .48, .76]) {
      line(context, [at(-.50, .5, height * rise), at(-.18, .5, height * (rise + .09)),
        at(.13, .5, height * (rise - .07)), at(.50, .5, height * (rise + .04))], palette.materialLight + "57", .86);
      line(context, [at(.50, -.50, height * rise), at(.50, -.09, height * (rise + .13)),
        at(.50, .5, height * (rise + .04))], palette.materialLight + "3f", .82);
    }
    if (palette.landscape === "roots") {
      const moss = [at(-.48, -.45, height + .01), at(.17, -.48, height + .01), at(.36, -.23, height + .01),
        at(.23, .18, height + .015), at(-.07, .24, height + .015), at(-.50, -.04, height + .01)];
      poly(context, moss, "#7e8348a9", "#b2bc6c8e", .91);
      for (const start of [-.34, -.04, .21]) {
        line(context, [at(start, -.24, height + .02), at(start - .07, .29, height + .02),
          at(start, .50), at(start + .13, .50, height * .53), at(start + .09, .50, height * .15)], "#ac955bba", 1.35);
      }
    } else if (palette.landscape === "archive" || palette.landscape === "ruins") {
      for (const [start, end] of [[-.28, .11], [-.12, .28]]) {
        line(context, [at(start, -.28), at(start + .065, .13), at(end, .17)], palette.materialShade + "ac", .9);
        line(context, [at(start, -.25), at(start + .045, .11), at(end, .14)], palette.materialLight + "75", .85);
      }
    } else {
      line(context, [at(-.29, -.25), at(-.09, -.045), at(.09, -.12), at(.31, .28), at(.49, .32)],
        palette.materialShade + "cf", Math.max(.86, camera.unit * .049));
      if (palette.landscape === "stars") {
        for (const [u, v] of [[-.26, -.30], [.04, .01], [.25, -.24]]) {
          const [sx, sy] = at(u, v, height + .025);
          ellipse(context, sx, sy, Math.max(1.3, camera.unit * .058), Math.max(.85, camera.unit * .031), "#d5cfffaa");
        }
      }
    }
  }

  function obstacle(context, camera, entry, palette, seconds, theme, reduced) {
    if (palette.landscape && palette.landscape !== "rupture") {
      rockObstacle(context, camera, entry, palette);
      return;
    }
    if (entry.fixture && facilityObstacle(context, camera, entry, palette, seconds, reduced)) return;
    const { x, y, w, h } = entry;
    const dressed = w > 0.90 && h > 0.74;
    const height = obstacleHeight(entry, palette);
    const left = x - w / 2;
    const top = y - h / 2;
    const trim = Math.min(0.18, w * 0.13, h * 0.13);
    const outer = rectangle(camera, left, top, w, h, height);
    const inner = rectangle(camera, left + trim, top + trim, w - trim * 2, h - trim * 2, height);
    const topFinish = materialShade(context, outer[3], outer[1], palette.capSide, palette,
      palette.cap, palette.capDark);
    const rightFinish = materialShade(context, outer[1], point(camera, left + w, top),
      palette.wallX, palette, palette.capSide);
    const frontFinish = materialShade(context, outer[3], point(camera, left, top + h),
      palette.capDark, palette, palette.capSide);

    poly(context, rectangle(camera, left + height * 0.22, top - height * 0.09, w + height * 0.23, h + height * 0.22),
      palette.materialShade + "45");
    poly(context, rectangle(camera, left + 0.03, top - 0.01, w + 0.12, h + 0.09), palette.materialShade + "64");
    prism(context, camera, left, top, w, h, height, topFinish, rightFinish, frontFinish, palette.surfaceJoint);
    poly(context, inner, topFinish, palette.materialLight + "35", 0.82);
    line(context, [outer[0], outer[3], outer[2]], palette.materialLight + "b8", 1.3);
    for (const position of [0.27, 0.71]) {
      line(context, [point(camera, left + w * position, top + h * 0.80, height),
        point(camera, left + w * Math.min(0.98, position + 0.12), top + h * 0.84, height)],
      palette.materialLight + "52", 0.88);
    }

    const panels = Math.ceil(w * 1.6);
    for (let index = 0; index < panels; index++) {
      const start = left + (index + 0.27) * w / panels;
      const end = left + (index + 0.73) * w / panels;
      const lower = point(camera, start, top + h, height * 0.28);
      poly(context, [lower, point(camera, end, top + h, height * 0.28),
        point(camera, end, top + h, height * 0.67), point(camera, start, top + h, height * 0.67)],
      palette.materialShade + "72", palette.surfaceJoint, 0.73);
      context.save();
      context.globalAlpha *= 0.39 + Math.sin(seconds * 2.1 + x + index) * 0.15;
      line(context, [point(camera, start, top + h, height * 0.76),
        point(camera, end, top + h, height * 0.76)], palette.accent, 1);
      context.restore();
    }
    if (entry.structural) {
      const alongX = w >= h;
      const span = alongX ? w : h;
      const cap = (offset, inset) => point(camera,
        alongX ? left + offset : x + inset,
        alongX ? y + inset : top + offset, height + 0.006);
      const edge = Math.min(w, h) * 0.27;
      for (const inset of [-edge, edge]) {
        line(context, [cap(trim, inset), cap(span - trim, inset)], palette.inlay + "a5", 1.3);
      }
      for (let offset = trim + 0.4; offset < span - trim; offset += 0.95) {
        line(context, [cap(offset, -edge), cap(offset, edge)], palette.materialShade + "85", 1.0);
      }
    } else if (dressed) {
      housingTop(context, camera, entry, palette, theme, height, seconds, reduced);
    } else if (w > 0.65 && h > 0.65) {
      poly(context, rectangle(camera, x - 0.18, y - 0.14, 0.36, 0.28, height + 0.01),
        palette.capDark, palette.fixture, 1);
      for (const offset of [-0.28, 0.28]) {
        if (theme === "sluice") {
          line(context, [point(camera, left + 0.13, y + h * offset, height),
            point(camera, left + w - 0.13, y + h * offset, height)], palette.sheen, 1.4);
        } else {
          const [xx, yy] = point(camera, x + w * offset, y, height);
          ellipse(context, xx, yy, 1.45, 1.45, palette.fixture);
        }
      }
    }
  }

  function dangerRing(context, camera, x, y, radius, fill, stroke, width, dashed) {
    context.save();
    if (dashed) context.setLineDash([Math.max(3, camera.unit * 0.12), 3]);
    groundRing(context, camera, x, y, radius, fill, stroke, width);
    context.restore();
  }

  function hazardTiles(context, baseCamera, tiles, seconds, elevation) {
    for (const { x, y, active } of tiles ?? []) {
      const camera = raisedCamera(baseCamera, surfaceHeight(elevation, x, y));
      context.save();
      context.globalAlpha = active ? 0.95 : 0.54 + 0.15 * Math.sin(seconds * 12);
      dangerRing(context, camera, x, y, 0.75, active ? "#eda24a44" : "#ffb56816", "#ffd07f", 1.65, !active);
      if (active) {
        line(context, [point(camera, x, y, 0.08), point(camera, x - 0.14, y, 0.44),
          point(camera, x + 0.16, y, 0.37), point(camera, x + 0.03, y, 0.73)], "#ffdb9a", 1.65);
      }
      context.restore();
    }
  }

  function enemyTelegraph(context, baseCamera, enemy, elevation) {
    if (!(enemy.windup > 0)) return;
    const camera = onSurface(baseCamera, elevation, enemy);
    const aimed = Number.isFinite(enemy.aimX) && Number.isFinite(enemy.aimY);
    const marksman = enemy.kind === "marksman";
    if ((enemy.kind === "sentry" || marksman) && aimed) {
      const origin = point(camera, enemy.x, enemy.y, 0.64);
      const targetCamera = raisedCamera(baseCamera, surfaceHeight(elevation, enemy.aimX, enemy.aimY));
      const target = point(targetCamera, enemy.aimX, enemy.aimY, 0.10);
      const color = marksman ? "#ffd48b" : "#ffb284";
      line(context, [origin, target], marksman ? "#ff9b4e65" : "#ff664c58", Math.max(3, camera.unit * 0.13));
      context.save();
      context.setLineDash(marksman ? [10, 3, 3, 4] : [6, 4]);
      line(context, [origin, target], color, marksman ? 1.95 : 1.6);
      context.restore();
      poly(context, rectangle(targetCamera, enemy.aimX - 0.19, enemy.aimY - 0.19, 0.38, 0.38, 0.10),
        "#f15a382e", color, 1.3);
      if (marksman) {
        const [dx, dy] = [target[0] - origin[0], target[1] - origin[1]];
        const length = Math.hypot(dx, dy) || 1;
        for (const offset of [0.10, 0.17]) {
          const x = target[0] - dx * offset, y = target[1] - dy * offset;
          line(context, [[x - dy * 4.5 / length, y + dx * 4.5 / length],
            [x + dy * 4.5 / length, y - dx * 4.5 / length]], color, 1.5);
        }
      }
      return;
    }
    if (enemy.kind === "lancer" && aimed) {
      const dx = enemy.aimX - enemy.x;
      const dy = enemy.aimY - enemy.y;
      const length = Math.hypot(dx, dy) || 1;
      const px = -dy / length * 0.33;
      const py = dx / length * 0.33;
      const at = (x, y) => point(baseCamera, x, y, surfaceHeight(elevation, x, y));
      context.save();
      context.setLineDash([6, 4]);
      poly(context, [at(enemy.x + px, enemy.y + py), at(enemy.aimX + px, enemy.aimY + py),
        at(enemy.aimX + dx / length * 0.30, enemy.aimY + dy / length * 0.30),
        at(enemy.aimX - px, enemy.aimY - py), at(enemy.x - px, enemy.y - py)],
      "#ff704a36", "#ffae82", 1.8);
      context.restore();
      return;
    }
    if (enemy.kind === "skirmisher" && aimed) {
      const angle = Math.atan2(enemy.aimY - enemy.y, enemy.aimX - enemy.x);
      const half = Math.acos(.60);
      const radius = enemy.attackRange || 1.05;
      const fan = [point(camera, enemy.x, enemy.y, .02)];
      for (let index = 0; index <= 12; index++) {
        const direction = angle - half + 2 * half * index / 12;
        fan.push(point(camera, enemy.x + Math.cos(direction) * radius, enemy.y + Math.sin(direction) * radius, .02));
      }
      poly(context, fan, "#f265393d", "#ffad7d", 1.8);
      line(context, fan.slice(2, -1), "#ffd19a", 2.2);
      return;
    }
    if (enemy.kind === "breaker") {
      const radius = enemy.attackRange || 2.2;
      dangerRing(context, camera, enemy.x, enemy.y, radius, "#f0522b42", "#ffaf76", 2.6, true);
      groundRing(context, camera, enemy.x, enemy.y, radius * .82, null, "#ffc189a8", 1.4);
      return;
    }
    if (enemy.kind === "saboteur") return;
    const boss = enemy.kind === "boss";
    const radius = enemy.attackRange || (boss ? 2.2 : 1.05);
    dangerRing(context, camera, enemy.x, enemy.y, radius, boss ? "#ff58374b" : "#f65d313b",
      boss ? "#ffac81" : "#ff8e6d", boss ? 2.6 : 1.9, true);
    groundRing(context, camera, enemy.x, enemy.y,
      radius * (0.3 + (1 - clamp(enemy.windup / 0.85, 0, 1)) * 0.69), null, "#ffad825e", 1);
  }

  function bossTargets(context, baseCamera, targets, seconds, elevation) {
    for (const { x, y, radius, active, kind } of targets ?? []) {
      const camera = raisedCamera(baseCamera, surfaceHeight(elevation, x, y));
      const charge = (Math.sin(seconds * 17) + 1) * 0.5;
      const size = Math.max(0.15, radius || 0.9);
      if (kind === "mine") {
        const color = active ? "#ffc884" : "#d9a879";
        dangerRing(context, camera, x, y, size, active ? "#eb6e3435" : "#dc974b19", color, active ? 2 : 1.4, !active);
        const [px, py] = point(camera, x, y, .095);
        const at = (u, v) => [px + u * camera.unit, py + v * camera.unit];
        mineCasing(context, at, camera.unit, color, active);
        continue;
      }
      if (kind === "aftershock") {
        dangerRing(context, camera, x, y, size, active ? "#ff752755" : "#d0754629",
          active ? "#ffe3b4" : "#f6a770", active ? 2.8 : 2, !active);
        groundRing(context, camera, x, y, size * (active ? .82 : .64), null, "#ffc098a1", 1.4);
        continue;
      }
      const ringColor = active ? "#ffdfae" : "#ff9d66";
      context.save();
      context.globalAlpha = active ? 0.98 : 0.72 + charge * 0.26;
      dangerRing(context, camera, x, y, size, active ? "#ff50245c" : "#e9432844", ringColor, 2.4, !active);
      groundRing(context, camera, x, y, size * (0.52 + charge * 0.32), null, "#ff806d", 1.5);
      for (const sign of [-1, 1]) {
        const reach = size * 0.27;
        line(context, [point(camera, x - reach, y - reach * sign),
          point(camera, x + reach, y + reach * sign)], ringColor, 1.6);
      }
      if (active) {
        const [targetX, targetY] = point(camera, x, y);
        const height = camera.unit * 1.5;
        line(context, [[targetX + 5, targetY - height], [targetX - 4, targetY - height * 0.55],
          [targetX + 4, targetY - height * 0.51], [targetX, targetY]], "#fff0c0", 2.4);
      }
      context.restore();
    }
  }

  function holdArea(context, camera, zone) {
    if (!zone || zone.active === false || !Number.isFinite(zone.x) || !Number.isFinite(zone.y)) return;
    const radius = Math.max(0.1, Number.isFinite(zone.radius) ? zone.radius : 1.7);
    const progress = zone.progress > 1 ? zone.progress / 100 : zone.progress || 0;
    const [x, y] = point(camera, zone.x, zone.y);
    const sx = radius * camera.unit * Math.SQRT2;
    const sy = sx * slope;
    context.save();
    context.setLineDash([8, 5]);
    ellipse(context, x, y, sx, sy, "#66e2bd20", "#8bddc4", 2);
    context.restore();
    if (progress > 0) {
      context.beginPath();
      context.ellipse(x, y, sx, sy, 0, -Math.PI / 2, -Math.PI / 2 + clamp(progress, 0, 1) * tau);
      context.strokeStyle = "#d8ffe9";
      context.lineWidth = 3;
      context.stroke();
    }
  }

  function bulkheadDoor(context, camera, entry, palette) {
    const x = entry.x + 0.64;
    const y = entry.y;
    const unit = camera.unit;
    const progress = clamp(entry.openProgress ?? Number(Boolean(entry.active)), 0, 1);
    const width = 0.59;
    const at = (across, height, depth = 0.149) => point(camera, x + depth, y + across, height);
    const aperture = [at(-width, 0.02), at(width, 0.02), at(width, 1.37),
      at(0.43, 1.62), at(-0.43, 1.62), at(-width, 1.37)];
    const apertureLight = context.createLinearGradient(...at(0, 1.60), ...at(0, 0.01));
    apertureLight.addColorStop(0, "#090f18");
    apertureLight.addColorStop(0.64, "#111a22");
    apertureLight.addColorStop(1, progress > 0.34 ? "#3c6a66" : "#151d25");
    poly(context, rectangle(camera, x - 0.69, y - 1.21, 1.09, 2.42), palette.materialShade + "70");
    poly(context, rectangle(camera, x - 0.52, y - 0.67, 0.88, 1.34, 0.02),
      palette.capDark, palette.inlay + "85", 0.94);
    for (const depth of [-0.42, -0.27, 0.14, 0.25]) {
      line(context, [at(-0.63, 0.03, depth), at(0.63, 0.03, depth)], palette.materialLight + "77", 1.0);
    }
    poly(context, aperture, apertureLight, palette.materialShade, 1.0);
    if (progress > 0.05) {
      context.save();
      context.globalAlpha *= progress * 0.7;
      poly(context, [at(-0.55, 0.10), at(-0.38, 0.08, -0.30), at(0.38, 0.08, -0.30),
        at(0.55, 0.10)], "#78a4a17a");
      line(context, [at(-0.47, 0.15, -0.12), at(0.47, 0.15, -0.12)], "#b0d0bd", Math.max(1.1, unit * 0.032));
      context.restore();
    }

    if (progress < 1) {
      context.save();
      poly(context, aperture);
      context.clip();
      const shift = width * eased(progress);
      for (const side of [-1, 1]) {
        const leaf = (u, z) => at(side * (u + shift), z, 0.197);
        const shaded = materialShade(context, leaf(0.56, 1.53), leaf(0.04, 0.03),
          palette.capSide, palette, palette.cap, palette.wallY);
        poly(context, [leaf(0, 0.035), leaf(0.64, 0.035), leaf(0.64, 1.52), leaf(0.46, 1.67), leaf(0, 1.67)],
          shaded, "#25242b", 1.2);
        for (const z of [0.36, 0.75, 1.15]) {
          line(context, [leaf(0.065, z), leaf(0.57, z)], "#2a282f", Math.max(0.9, unit * 0.040));
          line(context, [leaf(0.065, z + 0.025), leaf(0.56, z + 0.025)], "#caa17d", 0.9);
        }
        line(context, [leaf(0.045, 0.075), leaf(0.045, 1.58)], "#ceaa83", Math.max(1.0, unit * 0.034));
        ellipse(context, ...leaf(0.19, 0.81), Math.max(1.3, unit * 0.046), Math.max(1.15, unit * 0.057),
          "#4a3840", "#d0a178", 0.85);
      }
      context.restore();
    }

    for (const start of [-1.15, width]) {
      prism(context, camera, x - 0.145, y + start, 0.29, 0.56, 1.70,
        palette.capSide, palette.wallX, palette.wallY, palette.surfaceJoint);
      const outer = start < 0 ? start + 0.08 : start + 0.48;
      const pierInside = start < 0 ? start + 0.42 : start + 0.14;
      poly(context, [at(outer, 0.20), at(pierInside, 0.20), at(pierInside, 1.49), at(outer, 1.49)],
        palette.materialShade + "55", palette.materialLight + "64", 0.8);
      for (const z of [0.31, 1.38]) ellipse(context, ...at((outer + pierInside) / 2, z),
        Math.max(1.15, unit * 0.033), Math.max(0.9, unit * 0.028), "#9a7759", "#322b30", 0.7);
    }
    const lintel = raisedCamera(camera, 1.61);
    prism(context, lintel, x - 0.18, y - 1.19, 0.37, 2.38, 0.29,
      palette.cap, palette.capSide, palette.wallY, palette.seam);
    poly(context, [at(-width, 0.035), at(-width, 1.40), at(-0.43, 1.66),
      at(0.43, 1.66), at(width, 1.40), at(width, 0.035)],
    null, "#bf9470", Math.max(1.35, unit * 0.053));
    line(context, [at(-1.14, 1.82, 0.197), at(1.14, 1.82, 0.197)], "#d3a882", Math.max(1, unit * 0.035));
    for (const across of [-0.87, 0.87]) {
      const light = at(across, 0.99, 0.20);
      ellipse(context, ...light, unit * 0.064, unit * 0.096, "#222a33", "#84674f", 0.9);
      ellipse(context, ...light, Math.max(1.4, unit * 0.030), Math.max(1.5, unit * 0.047),
        entry.active ? "#a8dbc2" : "#f0b36f");
    }
  }

  function storyGateSize(entry) {
    return {
      span: clamp(entry.width ?? entry.span ?? 2.2, 0.85, 6),
      height: clamp(entry.apertureHeight ?? 1.72, 1.0, 3),
      progress: clamp(entry.progress ?? 0, 0, 1),
    };
  }

  function rollingStoryGate(context, camera, entry, palette) {
    const { span, height, progress } = storyGateSize(entry);
    const unit = camera.unit;
    const half = span * 0.5;
    const alongX = entry.axis !== "y";
    const at = (side, z, depth = 0.19) => point(camera,
      entry.x + (alongX ? depth : side), entry.y + (alongX ? side : depth), z);
    const face = (left, right, bottom, top, depth) => [at(left, bottom, depth), at(right, bottom, depth),
      at(right, top, depth), at(left, top, depth)];
    const box = (left, length, depth, tall, lift, colors) => prism(context, raisedCamera(camera, lift),
      entry.x + (alongX ? -depth / 2 : left), entry.y + (alongX ? left : -depth / 2),
      alongX ? depth : length, alongX ? length : depth, tall, ...colors, palette.seam);
    const housing = [palette.capSide, palette.wallX, palette.wallY];
    const light = progress > 0.93 ? "#b9e3b8" : progress > 0.04 ? "#f6c178" : "#ee886e";
    const feet = [at(-half - .32, .016, -.40), at(half + .32, .016, -.40),
      at(half + .32, .016, .43), at(-half - .32, .016, .43)];
    poly(context, feet, "#1b252dc4", palette.inlay + "a0", 1.0);
    for (const mark of [-.28, .0, .28]) {
      line(context, [at(-half, .029, mark), at(half, .029, mark)], palette.materialLight + "7a", .84);
    }
    if (progress < 1) {
      const lower = height * progress;
      const panel = face(-half, half, lower, height, .145);
      const tint = materialShade(context, at(-half, height), at(half, 0),
        palette.capDark, palette, palette.capSide, palette.wallY);
      context.save();
      poly(context, panel, tint, "#26232c", 1.2);
      poly(context, panel);
      context.clip();
      const rung = height / 7;
      for (let index = 1; index <= 7; index++) {
        const z = lower + index * rung;
        line(context, [at(-half, z, .152), at(half, z, .152)], "#25252d", Math.max(1, unit * .067));
        line(context, [at(-half, z - .033, .157), at(half, z - .033, .157)], "#d4ae7885", Math.max(.7, unit * .025));
      }
      poly(context, face(-half, half, lower, lower + .145, .172), "#997653", "#d3a474", 1.0);
      for (let u = -half + .12; u < half - .08; u += .28) {
        line(context, [at(u, lower + .034), at(u + .106, lower + .110)], "#493432", Math.max(.8, unit * .040));
      }
      context.restore();
    }
    for (const side of [-1, 1]) {
      box(side < 0 ? -half - .28 : half, .28, .52, height + .20, 0, housing);
      const center = side * (half + .14);
      line(context, [at(center, .18, .267), at(center, height + .12, .267)], "#ac856280", 1.3);
      ellipse(context, ...at(center, height * .73, .28), unit * .073, unit * .096, "#262b35", "#b08862", 1.15);
      ellipse(context, ...at(center, height * .73, .291), Math.max(1.5, unit * .036), Math.max(1.6, unit * .050), light);
    }
    box(-half - .30, span + .60, .61, .35, height - .015,
      [palette.cap, palette.capSide, palette.wallY]);
    line(context, [at(-half - .23, height + .24, .31), at(half + .23, height + .24, .31)], "#d7b183", 1.35);
    for (const side of [-1, 1]) {
      const plate = at(side * half * .72, height + .12, .326);
      ellipse(context, ...plate, Math.max(1.3, unit * .065), Math.max(1.05, unit * .054), "#3a2c31", "#c49a70", .88);
    }
  }

  function item(context, camera, entry, seconds, palette) {
    if (entry.collected) return;
    const unit = camera.unit;
    const [x, y] = point(camera, entry.x, entry.y);
    if (entry.kind === "beacon") {
      poly(context, rectangle(camera, entry.x - 0.34, entry.y - 0.34, 0.68, 0.68),
        "#284547", "#91d5cc", 1.2);
      poly(context, [[x - unit * 0.18, y - unit * 0.20], [x - unit * 0.21, y - unit * 0.78],
        [x, y - unit * 1.02], [x + unit * 0.21, y - unit * 0.78], [x + unit * 0.18, y - unit * 0.20]],
      "#1a3038", "#a6e9da", 1.35);
      for (const side of [-1, 1]) {
        line(context, [[x + side * unit * 0.10, y - unit * 0.29], [x + side * unit * 0.10, y - unit * 0.70]],
          "#b8fff0", 1.35);
      }
      return;
    }
    if (entry.kind === "exit") {
      bulkheadDoor(context, camera, entry, palette);
      return;
    }

    const bob = 0.56 + 0.09 * Math.sin(seconds * 3.5 + entry.x);
    const [upperX, upperY] = point(camera, entry.x, entry.y, bob);
    poly(context, rectangle(camera, entry.x - 0.27, entry.y - 0.27, 0.54, 0.54),
      "#5dedff20", "#93f3fbb6", 1.15);
    const halo = context.createRadialGradient(upperX, upperY, 0, upperX, upperY, unit * 0.78);
    halo.addColorStop(0, "#56edfa6f");
    halo.addColorStop(1, "#48e7fb00");
    ellipse(context, upperX, upperY, unit * 0.78, unit * 0.78, halo);
    poly(context, [[upperX, upperY - unit * 0.33], [upperX + unit * 0.19, upperY],
      [upperX, upperY + unit * 0.30], [upperX - unit * 0.19, upperY]], "#68dae1", "#c8ffff", 1.05);
    poly(context, [[upperX, upperY - unit * 0.33], [upperX, upperY + unit * 0.30],
      [upperX - unit * 0.19, upperY]], "#c4ffff");
    line(context, [[x, y], [upperX, upperY + unit * 0.30]], "#78f1ff67");
  }

  function clinicPipes(context, camera, state, palette) {
    if (state.landing !== "cold-pipe") return;
    const at = (x, y, z) => point(camera, x, y, z);
    const pipe = [at(0.15, 2.1, 0.36), at(5.65, 2.1, 0.36), at(6.35, 2.8, 0.35), at(6.35, 4.67, 0.15)];
    const gauge = at(5.1, 2.1, 0.71);
    line(context, pipe, "#101b20", camera.unit * 0.30);
    line(context, pipe, "#666d59", camera.unit * 0.18);
    line(context, [at(0.1, 2.1, 0.42), at(5.65, 2.1, 0.42), at(6.35, 2.8, 0.41)], palette.cap, camera.unit * 0.035);
    for (const x of [0.8, 2.9, 4.2, 5.4]) {
      line(context, [at(x, 2.1, 0.23), at(x, 2.1, 0.50)], "#ae956b", camera.unit * 0.15);
    }
    ellipse(context, ...gauge, camera.unit * 0.16, camera.unit * 0.16, "#1b2323", "#bd9b65", 1.2);
    line(context, [gauge, [gauge[0] - camera.unit * 0.10, gauge[1] + camera.unit * 0.055]], "#bcdae0", 1.4);
  }

  function storyDevicePosition(entry) {
    return entry.atExit ? { x: entry.x - 0.6, y: entry.y - 0.95 } : entry;
  }

  const warmIncidentChoices = new Set(["quiet", "reserve", "testimony", "archive", "engineers"]);

  function incidentColor(entry) {
    if (entry.choice) return warmIncidentChoices.has(entry.choice) ? "#edb573" : "#93dfd0";
    return entry.done ? "#a7e2ba" : "#f4d393";
  }

  function cartridge(context, x, y, unit, rotation) {
    context.save();
    context.translate(x, y);
    context.rotate(rotation);
    const body = [[-.34, -.13], [.21, -.13], [.34, -.06], [.34, .06], [.21, .13], [-.34, .13]];
    poly(context, body.map(([u, v]) => [u * unit, v * unit]), "#b38b56", "#242a2b", Math.max(1, unit * .048));
    context.fillStyle = "#38585b";
    context.fillRect(-.20 * unit, -.10 * unit, .32 * unit, .20 * unit);
    context.fillStyle = "#b2ede0";
    context.fillRect(-.16 * unit, -.069 * unit, .24 * unit, .063 * unit);
    for (const plate of [-.26, .18]) {
      line(context, [[plate * unit, -.11 * unit], [plate * unit, .11 * unit]], "#e4bd79", Math.max(1, unit * .064));
    }
    line(context, [[-.30 * unit, -.098 * unit], [.24 * unit, -.098 * unit]], "#ffe2a7", Math.max(.65, unit * .026));
    context.restore();
  }

  function incidentGround(context, camera, state, palette, layer) {
    for (const entry of state.incident?.points ?? []) {
      const height = surfaceHeight(state.elevation, entry.x, entry.y);
      if (layer !== undefined && (height > .04 ? 1 : 0) !== layer) continue;
      const local = raisedCamera(camera, height);
      const pressure = entry.device === "pressure";
      const color = entry.active || entry.done ? incidentColor(entry) : "#797970";
      const span = pressure ? .90 : .62;
      const depth = pressure ? .72 : .49;
      const scale = local.unit;
      const at = (u, v, z = .03) => point(local, entry.x + u, entry.y + v, z);
      const plate = (u, v, z) => [at(-u, -v, z), at(u, -v, z), at(u, v, z), at(-u, v, z)];
      poly(context, plate(span, depth, .018), "#172425e8", color + "a1", Math.max(.82, scale * .036));
      if (pressure) {
        const progress = entry.done ? 1 : entry.active ? clamp(state.incident.progress ?? 0, 0, 1) : 0;
        const lift = .145 - progress * .08;
        const top = plate(.72, .55, lift);
        const base = plate(.72, .55, .024);
        poly(context, [top[1], top[2], base[2], base[1]], "#675245", "#262a2b", .8);
        poly(context, [top[2], top[3], base[3], base[2]], "#53423b", "#262a2b", .8);
        poly(context, top, "#393e3e", color, 1.1);
        for (const side of [-1, 1]) {
          for (const position of [-.56, -.34, -.12, .10, .32, .54]) {
            line(context, [at(position, side * .50, lift + .01), at(position + .11, side * .29, lift + .01)],
              color + (entry.active || entry.done ? "dd" : "89"), Math.max(.85, scale * .045));
          }
        }
        const track = (end) => [at(-.49, -.106, lift), at(end, -.106, lift), at(end, .106, lift), at(-.49, .106, lift)];
        poly(context, track(.49), "#141e20", "#6c7772", .78);
        if (progress > .003) poly(context, track(-.49 + .98 * progress), color);
        for (const u of [-.76, .76]) {
          ellipse(context, ...at(u, -.62), scale * .065, scale * .03, color);
        }
      } else {
        const marks = [at(-.51, -.30), at(-.51, .30)];
        if (entry.active || entry.done) {
          line(context, [at(-.85, -.17), at(-.68, 0), at(-.85, .17)], color, Math.max(1.2, scale * .047));
        }
        for (const [x, y] of marks) ellipse(context, x, y, scale * .048, scale * .028, color);
      }
    }
  }

  function incidentApparatus(context, camera, entry, palette, seconds, reduced) {
    const { x, y, device, active, done } = entry;
    const unit = camera.unit;
    const at = (u, v, z = 0) => point(camera, x + u, y + v, z);
    const color = active || done ? incidentColor(entry) : "#8c8c80";
    if (device === "cartridge") {
      const base = rectangle(camera, x - .43, y - .33, .86, .66);
      poly(context, base, "#263233", palette.capSide, 1.1);
      const cradle = [at(-.33, -.25, .12), at(.33, -.25, .12), at(.33, .25, .12), at(-.33, .25, .12)];
      poly(context, cradle, "#364345", palette.inlay, .9);
      for (const u of [-.27, .27]) line(context, [at(u, -.26, .20), at(u, .26, .20)], "#9b7959", unit * .078);
      if (active && !done) cartridge(context, ...at(0, 0, .33), unit, -.30);
      ellipse(context, ...at(.31, .20, .13), unit * .047, unit * .031, color);
      return;
    }
    if (device === "pump") {
      const running = entry.kind === "switch" ? !done : done;
      prism(context, camera, x - .51, y - .41, 1.02, .82, .25, "#575143", "#32383b", "#252b31", palette.capSide);
      for (const side of [-1, 1]) {
        const elbow = [at(-.52, side * .20, .28), at(-.27, side * .20, .28), at(-.27, side * .20, .69)];
        line(context, elbow, "#242a2d", unit * .17);
        line(context, elbow, "#a37a57", unit * .084);
      }
      const bottom = at(0, 0, .30);
      const crown = at(0, 0, .86);
      const radius = unit * .30;
      const cap = radius * .38;
      poly(context, [[crown[0] - radius, crown[1]], [crown[0] + radius, crown[1]],
        [bottom[0] + radius, bottom[1]], [bottom[0] - radius, bottom[1]]], "#59666a", "#222e33", 1.2);
      for (const center of [bottom, crown]) {
        ellipse(context, ...center, radius, cap, "#4b4141", "#b18c61", Math.max(.8, unit * .041));
      }
      const socket = at(.10, .22, .58);
      ellipse(context, ...socket, unit * .145, unit * .12, running ? "#e6b571" : "#212d32", "#b8aa89", 1.2);
      if (running) ellipse(context, ...socket, unit * .06, unit * .055, "#ffe0a6");
      const hinge = at(.23, -.21, .63);
      const lever = at(done ? .40 : .06, -.19, done ? .74 : 1.00);
      line(context, [hinge, lever], "#241d24", unit * .15);
      line(context, [hinge, lever], "#c39b70", unit * .078);
      ellipse(context, ...lever, unit * .080, unit * .069, color, "#3a302d", .85);
      return;
    }
    if (entry.choice) {
      const warm = warmIncidentChoices.has(entry.choice);
      const outlet = warm ? .69 : -.69;
      const trace = [at(-.34, 0, .10), at(-.62, 0, .10), at(-.65, outlet, .07), at(-.96, outlet, .07)];
      line(context, trace, "#252b2e", unit * .138);
      line(context, trace, color, unit * (done ? .078 : .040));
      const terminal = at(-.96, outlet, .07);
      if (warm) poly(context, [[terminal[0] - unit * .105, terminal[1] + unit * .048],
        [terminal[0], terminal[1] - unit * .085], [terminal[0] + unit * .105, terminal[1] + unit * .048]], color);
      else ellipse(context, ...terminal, unit * .092, unit * .071, null, color, Math.max(1, unit * .041));
    }
    storyApparatus(context, camera, { ...entry, tint: color, setting: done ? entry.choice ?? "on" : undefined,
      triggeredAt: done ? 0 : undefined }, palette, seconds, reduced);
  }

  function woundedGuard(context, camera, entry, palette) {
    const [x, y] = point(camera, entry.x, entry.y);
    const unit = camera.unit * 1.12;
    const at = (u, v) => [x + u * unit, y + v * unit];
    const shape = (corners, fill, edge) => poly(context, corners.map(([u, v]) => at(u, v)), fill, edge, 1.1);
    contactShadow(context, x, y, unit * 1.35, palette);
    shape([[-.48, -.23], [-.47, -.77], [-.27, -.86], [-.18, -.23], [-.29, -.11]], palette.wallY, palette.inlay);
    articulatedLimb(context, [at(-.14, -.39), at(.26, -.24), at(.42, -.08)], [unit * .184, unit * .155, unit * .13],
      "#534751", "#201e28", "#8c7470");
    articulatedLimb(context, [at(-.14, -.37), at(.10, -.18), at(.27, -.07)], [unit * .21, unit * .164, unit * .148],
      "#6b574f", "#271f26", "#a38972");
    shape([[.30, -.14], [.45, -.14], [.51, -.063], [.46, -.026], [.31, -.064]], "#3e332f", "#1d2026");
    shape([[.18, -.12], [.31, -.139], [.36, -.063], [.31, -.014], [.17, -.046]], "#584135", "#231e25");
    shape([[-.38, -.64], [-.28, -.78], [-.07, -.73], [.12, -.54], [.02, -.37], [-.23, -.33], [-.40, -.44]],
      "#75615a", "#2c282d");
    shape([[-.31, -.66], [-.13, -.69], [.02, -.52], [-.10, -.44], [-.29, -.49]], "#a3856b", "#5e4d46");
    miniatureFace(context, (u, v) => at(-.22 + u * .75, -.85 + v * .77), unit * .83, palette,
      { skin: ["#724e46", "#b9866c", "#d1a186"], crown: ["#46434c", "#71667a", "#aaa1a8"], hood: true });
    articulatedLimb(context, [at(-.26, -.63), at(-.15, -.42), at(.054, -.49)],
      [unit * .19, unit * .16, unit * .133], "#624d48", "#342933", "#9b7c6c");
    line(context, [at(-.15, -.43), at(-.015, -.47), at(.048, -.49)], "#d8cbb2", Math.max(1.1, unit * .069));
    ellipse(context, ...at(.045, -.49), unit * .064, unit * .045, "#c79675", "#493b3a", .74);
  }

  const storyOutfits = {
    guard: { coat: ["#25343d", "#5b6971", "#a0a7a0"], hat: ["#30343e", "#64717d", "#b3a48a"], detail: "#d2b480" },
    porter: { coat: ["#263e3c", "#648c83", "#b1cec1"], hat: ["#423d34", "#7a7760", "#bbb18a"], detail: "#d9d2a5" },
    patient: { coat: ["#3d4640", "#89947a", "#c5c6a4"], hat: ["#393a37", "#726b5a", "#c7b596"], detail: "#e5d2a1" },
  };

  function storyWalker(context, origin, unit, role, pose, palette, grip, footing = 0) {
    const [x, y] = origin;
    const [fx, fy] = unitVector(pose.look);
    const side = pose.facingRight ? 1 : -1;
    const { coat, hat, detail } = storyOutfits[role];
    const size = unit * (role === "guard" ? .97 : grip ? .84 : .94);
    const ground = (u, v) => [x + u * size, y + v * size];
    const contact = (u, v) => [x + u * size, y + v * size - footing * unit];
    const hipShift = grip ? fx * .043 : fx * pose.gait * .055;
    const bob = pose.breath * .73 - Math.abs(pose.stride) * .22;
    const at = (u, v) => ground(u + hipShift, v + bob);
    contactShadow(context, x, y - footing * unit, size, palette);
    legStride(context, contact, at, unitVector(pose.travel), pose, size, "#343e40", "#655a48", 0, true);

    const backArm = armJoints(at(-side * .18, -.75), at(-side * .25, -.43 + pose.stride * .36), size, side * .70);
    paintArm(context, backArm, size, coat, "#22292b");
    forgedPlate(context, [at(-.24, -.67), at(-.15, -.89), at(.14, -.88), at(.26, -.72),
      at(.22, -.48), at(.29, -.39), at(.17, -.27), at(-.25, -.32), at(-.27, -.46)], coat, palette, size, .31);
    line(context, [at(-.20, -.43), at(.18, -.43), at(.24, -.47)], "#4b4038", Math.max(.8, size * .049));
    if (role === "guard") {
      for (const u of [-.20, .20]) {
        line(context, [at(u - .07, -.75), at(u, -.81), at(u + .07, -.75)], detail, Math.max(.9, size * .046));
      }
      line(context, [at(-side * .16, -.69), at(side * .09, -.57), at(side * .13, -.44)], "#a38c6a", Math.max(.85, size * .039));
    } else {
      forgedPlate(context, [at(-.19, -.84), at(.18, -.85), at(.16, -.72), at(-.05, -.67), at(-.19, -.73)],
        ["#6e6853", detail, "#efe0b6"], palette, size, .28);
      if (!grip) {
        line(context, [at(-side * .16, -.70), at(side * .16, -.46)], "#9a7e59", Math.max(1.1, size * .062));
        ellipse(context, ...at(-side * .13, -.53), size * .116, size * .101, "#7c7157", "#514d40", 1.0);
      }
    }

    const head = (u, v) => at(side * (u + .023), -.99 + v + fy * .035);
    miniatureFace(context, head, size * .94, palette, {
      skin: role === "patient" ? ["#755345", "#bb906a", "#dcb68a"] : ["#71534e", "#bc8a68", "#d6a680"], crown: hat,
    });
    if (role === "guard") {
      poly(context, [head(-.21, -.108), head(-.16, -.22), head(.10, -.235), head(.22, -.116),
        head(.17, -.069), head(-.18, -.062)], hat[1], "#2e343c", 1.0);
      line(context, [head(-.19, -.068), head(.20, -.071), head(.27, -.048)], detail, Math.max(.65, size * .028));
    }
    const handSide = grip ? Math.sign(grip[0] - x) || side : side;
    const shoulder = at(handSide * .20, -.75);
    const target = grip ?? at(side * .32 + fx * pose.stride * .44, -.43 + fy * pose.stride * .67);
    const arm = armJoints(shoulder, target, size, -handSide * .58, .28, .26);
    paintArm(context, arm, size, coat, "#272b2e");
    ellipse(context, ...arm[2], size * .064, size * .054, role === "guard" ? "#796350" : "#cbab7f", "#362e2b", .83);
  }

  function storyPatient(context, camera, actor, pose, palette, elevation, reduced) {
    const [sx, sy] = unitVector(pose.look);
    const directionX = sx + sy / slope;
    const directionY = sy / slope - sx;
    const length = Math.hypot(directionX, directionY) || 1;
    const dx = directionX / length, dy = directionY / length;
    const unit = camera.unit;
    const baseHeight = actor.height ?? 0;
    const bob = Math.abs(pose.stride) * .14;
    const ground = (u, v = 0) => ({ x: actor.x + dx * u - dy * v, y: actor.y + dy * u + dx * v });
    const level = (at) => surfaceHeight(elevation, at.x, at.y) - baseHeight;
    const rear = ground(-.87), front = ground(.87);
    const rearHeight = level(rear), frontHeight = level(front);
    const at = (u, v, z = .46) => {
      const location = ground(u, v);
      const tilt = rearHeight + (frontHeight - rearHeight) * clamp((u + .87) / 1.74, 0, 1);
      return point(camera, location.x, location.y, z + tilt + bob);
    };
    const projected = (at, z) => point(camera, at.x, at.y, z);
    const pair = [{ ground: rear, height: rearHeight, side: -1 }, { ground: front, height: frontHeight, side: 1 }]
      .sort((a, b) => a.ground.x + a.ground.y - b.ground.x - b.ground.y);
    const carrier = (entry) => {
      const footing = reduced ? 0 : stairFooting(elevation, { ...entry.ground, height: baseHeight + entry.height });
      storyWalker(context, projected(entry.ground, entry.height), unit, "patient",
        { ...pose, cadence: pose.cadence + (entry.side < 0 ? Math.PI * .48 : 0) }, palette,
        at(entry.side * .76, .16, .43), footing);
    };
    contactShadow(context, ...point(camera, actor.x, actor.y), unit * 1.54, palette);
    carrier(pair[0]);
    poly(context, [at(-.65, -.26, .43), at(.65, -.26, .43), at(.65, .26, .43), at(-.65, .26, .43)],
      "#8b7962", "#3a3833", 1.12);
    poly(context, [at(-.56, -.20, .50), at(.60, -.20, .50), at(.60, .20, .50), at(-.56, .20, .50)],
      "#d6c6a4", "#51706c", .89);
    for (const edge of [-.25, .25]) {
      line(context, [at(-.87, edge, .45), at(.87, edge, .45)], "#413125", Math.max(1.0, unit * .069));
      line(context, [at(-.865, edge, .464), at(.865, edge, .464)], "#c39664", Math.max(.75, unit * .038));
    }
    const pillow = at(-.39, 0, .53);
    ellipse(context, ...pillow, unit * .16, unit * .083, "#ebd8b3", "#818976", .86);
    ellipse(context, ...at(-.36, .025, .59), unit * .09, unit * .065, "#be896c", "#5f5645", .75);
    poly(context, [at(-.25, -.17, .57), at(-.10, -.23, .61), at(.54, -.16, .55),
      at(.53, .16, .55), at(-.13, .23, .59), at(-.27, .14, .57)], "#bcc4a1", "#6e947f", .85);
    line(context, [at(-.22, -.12, .61), at(-.23, .12, .61)], "#dec59a", Math.max(.7, unit * .042));
    line(context, [at(.27, -.09, .57), at(.45, -.05, .54), at(.51, .04, .54)], "#e0d7b1", .81);
    carrier(pair[1]);
  }

  function drawStoryActor(context, camera, actor, palette, elevation, reduced) {
    if (actor.role === "patient") storyPatient(context, camera, actor, actor.pose, palette, elevation, reduced);
    else if (actor.role === "guard" && actor.seated) woundedGuard(context, camera, actor, palette);
    else storyWalker(context, point(camera, actor.x, actor.y), camera.unit,
      actor.role === "guard" ? "guard" : "porter", actor.pose, palette, null,
      reduced ? 0 : stairFooting(elevation, actor));
  }

  function storyApparatus(context, camera, entry, palette, seconds, reduced) {
    const { unit } = camera;
    const { x, y } = entry;
    const at = (u, v, z = 0) => point(camera, x + u, y + v, z);
    const device = entry.device ?? entry.scene?.device;
    if (device === "guard") {
      woundedGuard(context, camera, entry, palette);
      return;
    }
    const lamp = entry.tint ?? (entry.active ? "#efc486" : entry.setting ? "#a8f3be" : "#917a58");
    const motion = entry.done ? 1 : entry.triggeredAt === undefined ? 0 : reduced ? 1 : eased((seconds - entry.triggeredAt) / 0.8);
    const base = rectangle(camera, x - 0.53, y - 0.43, 1.06, 0.86);
    const top = rectangle(camera, x - 0.48, y - 0.36, 0.96, 0.72, 0.65);
    contactShadow(context, ...at(0, 0), unit * 1.35, palette);
    if (device === "valve") {
      const poweredSide = entry.setting === "reserve" ? 1 : -1;
      for (const side of [-1, 1]) {
        const branch = [at(0, side * 0.30, 0.12), at(0, side * 0.89, 0.12), at(-1.04, side * 0.89, 0.12)];
        line(context, branch, "#201d1b", unit * 0.24);
        line(context, branch, "#7d6851", unit * 0.12);
        if (entry.setting && side === poweredSide) {
          const color = entry.setting === "reserve" ? "#debd7f" : "#f7a664";
          context.save();
          context.globalAlpha = 0.42 + 0.49 * motion;
          line(context, branch, color, unit * 0.065);
          if (!reduced) {
            const progress = fraction((seconds - entry.triggeredAt) * 0.9);
            const location = progress < 0.38 ? at(0, side * (0.30 + (0.59 * progress) / 0.38), 0.16)
              : at((-1.04 * (progress - 0.38)) / 0.62, side * 0.89, 0.16);
            ellipse(context, ...location, unit * 0.11, unit * 0.078, "#ffe7b9d0");
          }
          context.restore();
        }
      }
    }
    poly(context, [top[1], top[2], base[2], base[1]], palette.wallY, "#18252a", 1.0);
    poly(context, [top[2], top[3], base[3], base[2]], palette.wallX, "#18252a", 1.15);
    poly(context, top, palette.capSide, palette.cap, 1.45);
    line(context, [at(0.48, -0.31, 0.28), at(0.48, 0.34, 0.28), at(-0.42, 0.34, 0.28)], "#b88d596b", 1.15);
    if (device === "valve") {
      const pivot = at(0, 0, 0.87);
      line(context, [at(-0.24, 0.17, 0.63), pivot], "#9c7550", unit * 0.16);
      ellipse(context, ...pivot, unit * 0.28, unit * 0.20, "#1a2928", "#c7955b", Math.max(2, unit * 0.055));
      for (let index = 0; index < 3; index++) {
        const theta = index * tau / 3 + 0.42 + (entry.setting ? motion * Math.PI * (entry.setting === "reserve" ? -0.74 : 0.74) : 0);
        line(context, [pivot, [pivot[0] + Math.cos(theta) * unit * 0.26, pivot[1] + Math.sin(theta) * unit * 0.19]], "#c7955b", 1.6);
      }
      ellipse(context, ...at(0.20, -0.13, 0.72), unit * 0.053, unit * 0.053, lamp);
      return;
    }
    const instrument = [[-0.33, 0.19, 0.67], [0.29, 0.19, 0.67], [0.29, -0.20, 1.03], [-0.33, -0.2, 1.03]]
      .map((entry) => at(...entry));
    poly(context, instrument, "#263538", "#b39060", 1.2);
    if (device === "radio" || device === "relay") {
      line(context, [at(-0.22, -0.16, 1.0), at(-0.22, -0.16, 1.45)], "#aa916d", 1.7);
      for (const offset of [-0.15, -0.064, 0.022]) {
        line(context, [at(offset, 0.05, 0.81), at(offset + 0.24, 0.05, 0.81)], "#698384", 1.25);
      }
    } else if (device === "ledger") {
      poly(context, [[-0.26, 0.14, 0.74], [0.2, 0.14, 0.74], [0.2, -0.13, 0.97], [-0.26, -0.13, 0.97]]
        .map((entry) => at(...entry)), "#c3a878", "#e6c896", 0.85);
      line(context, [at(-0.16, -0.051, 0.91), at(0.07, -0.051, 0.91)], "#6d553d", 1.25);
    } else {
      for (const row of [0, 1, 2]) {
        line(context, [at(-0.22, -0.11 + row * 0.066, 0.97 - row * 0.06),
          at(0.20 - row * 0.08, -0.11 + row * 0.066, 0.97 - row * 0.06)], "#84a09a", 1.45);
      }
    }
    const bulb = at(0.23, 0.04, 0.85);
    if (entry.active) {
      const response = entry.setting ? 0.23 * motion : 0.08 * motion;
      ellipse(context, ...bulb, unit * (0.13 + response), unit * (0.13 + response), lamp + "40");
    }
    const pulse = 0.039 + (device === "radio" ? 0.008 * Math.sin(seconds * 4.2) : 0);
    ellipse(context, ...bulb, Math.max(1.8, unit * pulse), Math.max(1.8, unit * pulse), lamp);
  }

  function objectiveLabel(context, camera, entry, placed) {
    const exit = entry.kind === "exit";
    const beacon = entry.kind === "beacon";
    const object = entry.type === "station" || entry.type === "story";
    const color = entry.accent ?? (object ? "#f6d29a" : exit ? "#b9fdd2" : beacon ? "#aaf2de" : "#b2efff");
    const label = object ? entry.caption : beacon ? "방어 구역" : "";
    const [targetX, targetY] = point(camera, entry.x, entry.y, entry.labelHeight ?? (object ? 1.58 : 1.27));
    const fontSize = clamp(camera.unit * 0.4, 11, 14);
    context.save();
    context.font = `700 ${fontSize}px system-ui, sans-serif`;
    context.textBaseline = "middle";
    context.textAlign = "center";
    const labelWidth = label ? context.measureText(label).width + 24 : 25;
    const labelHeight = fontSize * 1.46;
    const x = clamp(targetX, labelWidth / 2 + 4, camera.width - labelWidth / 2 - 4);
    const nearY = clamp(targetY, fontSize + 5, camera.height - fontSize - 5);
    const offscreen = Math.abs(x - targetX) > 2 || Math.abs(nearY - targetY) > 2;
    const fits = (candidate) => candidate >= fontSize + 5 && candidate <= camera.height - fontSize - 5
      && placed.every((prior) => Math.abs(x - prior.x) >= (labelWidth + prior.width) / 2 + 3
        || Math.abs(candidate - prior.y) >= labelHeight + 3);
    let y = nearY;
    if ((offscreen || entry.accent) && !fits(y)) {
      const step = labelHeight + 4;
      const candidates = placed.flatMap((_, index) => [nearY + (index + 1) * step, nearY - (index + 1) * step]);
      y = candidates.find(fits) ?? y;
    }
    placed.push({ x, y, width: labelWidth });
    context.beginPath();
    context.roundRect(x - labelWidth / 2, y - labelHeight / 2, labelWidth, labelHeight, 5);
    context.fillStyle = "#0c1724ef";
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
    if (entry.holdProgress > 0) {
      const width = labelWidth - 12;
      context.fillStyle = color + "42";
      context.fillRect(x - width / 2, y + labelHeight / 2 - 3, width, 1.7);
      context.fillStyle = color;
      context.fillRect(x - width / 2, y + labelHeight / 2 - 3, width * entry.holdProgress, 1.7);
    }
    context.fillStyle = color;
    if (label) context.fillText(label, x + (offscreen ? 3 : 0), y);
    else {
      const glyph = x + (offscreen ? 4 : 0);
      poly(context, [[glyph, y - 4], [glyph + 3, y], [glyph, y + 4], [glyph - 3, y]], color);
    }
    if (offscreen) {
      context.translate(x - labelWidth / 2 + 7, y);
      context.rotate(Math.atan2(targetY - y, targetX - x));
      line(context, [[-2, -3], [2, 0], [-2, 3]], color, 1.5);
    }
    context.restore();
  }

  function objectiveLabels(context, camera, state, visibleStoryActors) {
    let offscreenCell;
    let minimumDistance = Infinity;
    const placed = [];
    const stations = (state.stations ?? []).map((station) => ({
      ...station,
      type: "station",
      ...(station.kind === "shrine" && station.design === "chapel" ? { labelHeight: 3.82, accent: "#f4cd90" } : {}),
    }));
    const story = state.storyPoint;
    if (story?.active) stations.push({ ...story, ...storyDevicePosition(story), type: "story", caption: story.prompt ?? story.scene.prompt });
    for (const entry of state.incident?.points ?? []) {
      if (!entry.active || entry.done) continue;
      stations.push({ ...entry, type: "story", caption: entry.label, accent: incidentColor(entry),
        labelHeight: entry.device === "pressure" ? .47 : entry.device === "cartridge" ? .78 : 1.55,
        holdProgress: entry.kind === "hold" ? clamp(state.incident.progress ?? 0, 0, 1) : 0 });
    }
    if (state.storyGate?.label) {
      stations.push({ ...state.storyGate, type: "story", caption: state.storyGate.label, labelHeight: 2.3, accent: "#e8bd86" });
    }
    for (const entry of visibleStoryActors) {
      if (entry.label) stations.push({ ...entry, type: "story", caption: entry.label, accent: "#b4ddcd" });
    }
    for (const entry of [...(state.items ?? []), ...stations]) {
      if (entry.collected || entry.kind === "exit") continue;
      const itemCamera = onSurface(camera, state.elevation, entry);
      const [x, y] = point(itemCamera, entry.x, entry.y, 0.9);
      const offscreen = x < 35 || x > camera.width - 35 || y < 20 || y > camera.height - 20;
      if (entry.kind !== "cell") {
        objectiveLabel(context, itemCamera, entry, placed);
        continue;
      }
      if (!offscreen) continue;
      const distance = state.player
        ? Math.hypot(entry.x - state.player.x, entry.y - state.player.y)
        : Math.hypot(x - camera.width / 2, y - camera.height / 2);
      if (distance < minimumDistance) {
        minimumDistance = distance;
        offscreenCell = entry;
      }
    }
    if (offscreenCell) objectiveLabel(context, onSurface(camera, state.elevation, offscreenCell), offscreenCell, placed);
  }

  function direction(entity) {
    const x = (entity.facingX ?? 1) - (entity.facingY ?? 0);
    const y = ((entity.facingX ?? 1) + (entity.facingY ?? 0)) * slope;
    const length = Math.hypot(x, y) || 1;
    return [x / length, y / length];
  }

  const walkProfiles = {
    player: [15.5, 0.28, 0.34],
    porter: [13.2, 0.24, 0.35],
    patient: [11.7, 0.22, 0.29],
    guard: [12.6, 0.25, 0.32],
    runner: [23.2, 0.34, 0.55],
    sentry: [10.5, 0.16, 0.50],
    lancer: [16.0, 0.27, 0.37],
    mortar: [8.8, 0.17, 0.24],
    warden: [9.8, 0.20, 0.27],
    skirmisher: [21.0, 0.31, 0.54],
    breaker: [8.2, 0.21, 0.22],
    marksman: [11.4, 0.20, 0.32],
    saboteur: [13.5, 0.23, 0.40],
    boss: [10.7, 0.22, 0.19],
  };
  const swingProfiles = [
    { duration: 0.24, coil: -1.18, pass: 1.05, reach: 0.14, cutY: -0.03 },
    { duration: 0.27, coil: 1.32, pass: -1.08, reach: 0.20, cutY: 0.08 },
    { duration: 0.32, coil: -1.64, pass: 0.62, reach: 0.29, cutY: 0.20 },
  ];

  const heroWeapons = {
    sword: {},
    hammer: { style: "overhead", length: .90, lift: .71 },
    rapier: { style: "thrust", length: 1.22 },
    daggers: { style: "dual", length: .61 },
    maul: { style: "overhead", length: 1.19, lift: 1, twoHands: true },
    poleaxe: { style: "overhead", length: 1.34, lift: .79, twoHands: true },
    sabre: { length: 1.08, sweep: 1.22 },
    greatsword: { style: "overhead", length: 1.24, lift: .90, twoHands: true },
    twinblades: { style: "dual", length: .86 },
    hooks: { style: "dual", length: .73, sweep: 1.18 },
    staff: { style: "cast", length: 1.20 },
    orb: { style: "cast", length: .54 },
    bow: { style: "draw", length: .64, twoHands: true },
    crossbow: { style: "draw", length: .77, twoHands: true },
    gauntlets: { style: "fist", length: .41, dual: true },
    tonfa: { style: "fist", length: .69, dual: true },
  };

  function beginMotionFrame(canvas, state, now, reduced) {
    const previous = motionFrames.get(canvas);
    const sameArena = previous?.map === state.map && previous.floor === state.floor;
    const previousPoses = sameArena ? previous.poses : new Map();
    const elapsed = sameArena ? clamp((now - previous.now) / 1000, 0, 0.07) : 0;
    const running = (!state.mode || state.mode === "playing") && !(state.hitStop > 0);
    const frame = { previousPoses, poses: new Map(), step: running ? elapsed : 0,
      map: state.map, floor: state.floor, now, reduced };
    motionFrames.set(canvas, frame);
    return frame;
  }

  function approach(previous, target, step, response) {
    return previous + (target - previous) * (1 - Math.exp(-step * response));
  }

  function turnAngle(previous, target, step, response) {
    const offset = Math.atan2(Math.sin(target - previous), Math.cos(target - previous));
    return approach(previous, previous + offset, step, response);
  }

  function unitVector(angle) {
    return [Math.cos(angle), Math.sin(angle)];
  }

  function actorPose(frame, actor, key) {
    const style = actor.bossProfile?.style;
    const kind = key === "player" ? "player" : style === "hunter" ? "skirmisher" : actor.role ?? actor.kind;
    const profile = walkProfiles[kind] ?? walkProfiles.guard;
    const prior = frame.previousPoses.get(key);
    const { step, reduced } = frame;
    const enemyWindup = actor.windup || 0;
    const charge = reduced ? Number(actor.chargeTime > 0) : clamp((actor.chargeTime || 0) / 0.13, 0, 1);
    const aimed = (enemyWindup > 0 || charge > 0) && Number.isFinite(actor.aimX) && Number.isFinite(actor.aimY);
    const intended = aimed ? { facingX: actor.aimX - actor.x, facingY: actor.aimY - actor.y } : actor;
    const [targetX, targetY] = direction(intended);
    const targetAngle = Math.atan2(targetY, targetX);
    const look = prior && !reduced ? turnAngle(prior.look, targetAngle, step, aimed ? 34 : 23) : targetAngle;
    const horizontalLook = Math.cos(look);
    const facingRight = Math.abs(horizontalLook) < 0.13 && prior ? prior.facingRight : horizontalLook >= 0;
    const [moveX, moveY] = direction(prior && Math.hypot(actor.x - prior.x, actor.y - prior.y) > 0.002
      ? { facingX: actor.x - prior.x, facingY: actor.y - prior.y } : actor);
    const moveAngle = Math.atan2(moveY, moveX);
    const travel = prior && !reduced ? turnAngle(prior.travel, moveAngle, step, 18) : moveAngle;
    const stepsIntoStrike = actor.kind === "skirmisher" || (style === "hunter" && actor.bossMove === "pursuit");
    const moving = Boolean(actor.moving) && !actor.stalled && !actor.seated && (enemyWindup <= 0 || stepsIntoStrike) && charge <= 0;
    const gait = reduced ? 0 : prior
      ? approach(prior.gait, moving ? 1 : 0, step, moving ? 13 : 18)
      : moving ? 0.64 : 0;
    const cadence = (prior?.cadence ?? (0.5 + noise(actor.x, actor.y)) * tau) + step * profile[0] * (0.46 + gait * 0.54);
    const peak = enemyWindup > 0 ? Math.max(enemyWindup, prior?.peak || 0) : 0;
    const pitch = enemyWindup > 0 ? (0.21 + 0.79 * eased(1 - enemyWindup / Math.max(peak, 0.001))) : 0;
    const anticipation = reduced ? (enemyWindup > 0 ? 0.63 : 0)
      : !prior ? pitch : approach(prior.anticipation, pitch, step, 27);
    const volleyPending = actor.kind === "marksman" && actor.volleyAt != null;
    const released = (prior?.windup || 0) > 0 && enemyWindup <= 0 && !(actor.flash > 0.13);
    const releaseAge = released || (prior?.volleyPending && !volleyPending) ? 0
      : Math.min(1, (prior?.releaseAge ?? 1) + step);
    const recoil = Math.max(1 - eased(releaseAge / 0.20), clamp((actor.recover || 0) / 0.20, 0, 1));
    const hurtAge = key === "player" && prior && actor.hp < prior.hp ? 0
      : Math.min(1, (prior?.hurtAge ?? 1) + step);
    const impact = Math.max(clamp((actor.flash || 0) / 0.16, 0, 1), 1 - eased(hurtAge / 0.18));
    const guarded = reduced || !prior ? Number(Boolean(actor.guarded))
      : approach(prior.guarded, Number(Boolean(actor.guarded)), step, 24);
    const dashing = reduced ? 0 : prior
      ? approach(prior.dashing, Number(actor.dashRemaining > 0), step, 23)
      : Number(actor.dashRemaining > 0);
    const swingRemaining = actor.swingLife ?? actor.attackFlash ?? 0;
    const swingAngle = prior && swingRemaining > 0 && swingRemaining <= prior.swingRemaining + 0.006
      ? prior.swingAngle : targetAngle;
    const verticalLook = Math.sin(look);
    const armSide = clamp(horizontalLook * 2.8 + verticalLook * 0.55, -1, 1);
    const armDepth = verticalLook * 0.071;
    const pose = { x: actor.x, y: actor.y, hp: actor.hp, look, facingRight, armSide, armDepth, travel, gait, cadence, peak, anticipation, windup: enemyWindup,
      guarded, charge, dashing, releaseAge, volleyPending, recoil: reduced ? 0 : recoil, impact, swingAngle, swingRemaining,
      hurtAge, stepLength: profile[1] * gait * 0.72, stride: Math.sin(cadence) * profile[1] * gait * 0.70, lift: profile[2],
      breath: reduced ? 0 : Math.sin(cadence * 0.38 + actor.x * 0.18) * (1 - gait) * 0.027 };
    frame.poses.set(key, pose);
    return pose;
  }

  function articulatedLimb(context, joints, widths, fill, edge, light) {
    const segments = [[0, 1], [1, 2]];
    for (const [grow, color] of [[0.66, edge], [0, fill]]) {
      for (const [start, end] of segments) {
        const [ax, ay] = joints[start];
        const [bx, by] = joints[end];
        const length = Math.hypot(bx - ax, by - ay) || 1;
        const nx = (ay - by) / length;
        const ny = (bx - ax) / length;
        const near = widths[start] * 0.5 + grow;
        const far = widths[end] * 0.5 + grow;
        poly(context, [[ax + nx * near, ay + ny * near], [bx + nx * far, by + ny * far],
          [bx - nx * far, by - ny * far], [ax - nx * near, ay - ny * near]], color);
      }
      for (const [index, [x, y]] of joints.entries()) {
        const radius = widths[index] * 0.5 + grow;
        ellipse(context, x, y, radius, radius, color);
      }
    }
    const [ax, ay] = joints[0];
    const [bx, by] = joints[1];
    line(context, [[ax, ay], [ax * 0.52 + bx * 0.48, ay * 0.52 + by * 0.48]], light, 0.85);
  }

  function armJoints(shoulder, target, size, bend, upper = 0.24, lower = 0.22) {
    const dx = target[0] - shoulder[0];
    const dy = target[1] - shoulder[1];
    const length = Math.hypot(dx, dy);
    const ux = length > 0.001 ? dx / length : 0;
    const uy = length > 0.001 ? dy / length : 1;
    const reach = clamp(length / size, Math.abs(upper - lower) + 0.012, upper + lower - 0.012);
    const fold = (reach * reach + upper * upper - lower * lower) / (2 * reach);
    // Keep a visible forearm when the side-on bend foreshortens near the camera axis.
    const front = 1 - Math.min(1, Math.abs(bend) * 2);
    const along = fold + (clamp(fold, reach * 0.32, reach * 0.68) - fold) * front;
    const across = Math.sqrt(Math.max(0, upper * upper - fold * fold)) * bend;
    return [shoulder, [shoulder[0] + (ux * along - uy * across) * size,
      shoulder[1] + (uy * along + ux * across) * size],
    [shoulder[0] + ux * reach * size, shoulder[1] + uy * reach * size]];
  }

  function paintArm(context, [shoulder, elbow, wrist], size, metal, edge) {
    const normal = (a, b) => {
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const length = Math.hypot(dx, dy) || 1;
      return [-dy / length, dx / length];
    };
    const upper = normal(shoulder, elbow);
    const lower = normal(elbow, wrist);
    const middle = [(upper[0] + lower[0]) * 0.5, (upper[1] + lower[1]) * 0.5];
    const offset = (point, axis, amount) => [point[0] + axis[0] * amount * size, point[1] + axis[1] * amount * size];
    forgedPlate(context, [
      offset(shoulder, upper, 0.118), offset(elbow, middle, 0.095), offset(wrist, lower, 0.062),
      offset(wrist, lower, -0.062), offset(elbow, middle, -0.096), offset(shoulder, upper, -0.118),
    ], metal, { materialShade: edge }, size, 0.24);
  }

  function legStride(context, ground, body, facing, pose, scale, shade, boot, lunge = 0, chunky = false) {
    const [fx, fy] = facing;
    for (const side of [-1, 1]) {
      const step = fraction(pose.cadence / tau + (side > 0 ? 0.5 : 0));
      const recovery = clamp((step - 0.59) / 0.41, 0, 1);
      const forward = step <= 0.59 ? 1 - 2 * step / 0.59 : -1 + eased(recovery) * 2;
      const leg = forward * pose.stepLength + lunge * side;
      const lift = Math.sin(recovery * Math.PI) * pose.stepLength * pose.lift;
      const footX = side * 0.138 + fx * leg;
      const footY = -0.055 + fy * leg - lift;
      const pieces = [body(side * 0.109, -0.48), ground(side * 0.134 + fx * leg * 0.54, footY - 0.205),
        ground(footX, footY - 0.025)];
      const bootSize = chunky ? 1.28 : 1;
      articulatedLimb(context, pieces, [scale * 0.19, scale * 0.164 * bootSize, scale * 0.125 * bootSize], shade, "#111a25", boot);
      poly(context, [ground(footX - 0.078 * bootSize, footY - 0.061),
        ground(footX + (fx * 0.096 + 0.055) * bootSize, footY - 0.047),
        ground(footX + (fx * 0.12 + 0.055) * bootSize, footY + 0.032),
        ground(footX - 0.063 * bootSize, footY + 0.041)], boot, "#15202a", 0.75);
      if (chunky) line(context, [ground(footX - 0.062, footY + 0.013),
        ground(footX + (fx * 0.10 + .047) * bootSize, footY + 0.010)], "#c09567", Math.max(.6, scale * .022));
    }
  }

  function swordPose(at, size, armSide, idleAngle, strikeAngle, profile, weapon, progress, reduced, carrySwing) {
    const active = progress !== null;
    let sweep = 0;
    let extension = 0;
    let dip = 0;
    if (active && reduced) {
      sweep = profile.pass * 0.15;
      extension = profile.reach * 0.6;
    } else if (active && progress < 0.18) {
      const coil = eased(progress / 0.18);
      sweep = profile.coil * coil;
      dip = -0.08 * coil;
    } else if (active && progress < 0.37) {
      const cut = (progress - 0.18) / 0.19;
      sweep = profile.coil * (1 - cut ** 1.6);
      extension = profile.reach * cut ** 1.45;
      dip = -0.08 + (profile.cutY + 0.08) * cut;
    } else if (active && progress < 0.62) {
      const pass = (progress - 0.37) / 0.25;
      sweep = profile.pass * (1 - (1 - pass) ** 1.8);
      extension = profile.reach * (1 - 0.31 * pass);
      dip = profile.cutY;
    } else if (active) {
      const settle = 1 - eased((progress - 0.62) / 0.38);
      sweep = profile.pass * settle;
      extension = profile.reach * 0.69 * settle;
      dip = profile.cutY * settle;
    }
    sweep *= weapon.sweep ?? 1;
    if (active && ["thrust", "draw", "fist", "cast"].includes(weapon.style)) {
      const forward = progress < .37 ? eased((progress - .16) / .21) : 1 - eased((progress - .37) / .54);
      const pullback = progress < .16 ? eased(progress / .16) : 1 - eased((progress - .16) / .20);
      const casting = weapon.style === "cast";
      const holding = weapon.style === "draw";
      sweep = casting ? sweep * .23 : sweep * .07;
      extension = reduced ? .30 : forward * (holding ? .34 : .42) - pullback * (holding ? -.11 : .17);
      dip = casting ? -.30 * (pullback + .42 * forward) : -.055 * forward - (holding ? .14 : 0);
    } else if (active && weapon.style === "overhead") {
      const side = Math.sign(armSide) || 1;
      const lift = progress < .19 ? eased(progress / .19) : 1 - eased((progress - .19) / .22);
      const fall = progress < .45 ? eased((progress - .26) / .19) : 1 - eased((progress - .45) / .55);
      if (!reduced) {
        sweep = -side * lift * (1.12 + weapon.lift * .60) + side * fall * .68 + sweep * .23;
        dip += fall * .18 - lift * weapon.lift * .60;
        extension *= .80;
      }
    }
    const weight = active ? Math.min(eased(progress / 0.18), eased((1 - progress) / 0.38)) : 0;
    const difference = strikeAngle - idleAngle;
    const angle = idleAngle + Math.atan2(Math.sin(difference), Math.cos(difference)) * weight;
    const [forwardX, forwardY] = unitVector(angle);
    const [edgeX, edgeY] = unitVector(angle + sweep);
    const shoulder = at(armSide * 0.223, -0.762);
    const target = at(armSide * (weapon.twoHands ? .14 : .205) + edgeX * (0.105 + extension * (weapon.style ? .69 : .55)),
      -0.485 + forwardY * 0.041 + edgeY * 0.094 + dip * 0.73 + carrySwing * (1 - weight));
    const joints = armJoints(shoulder, target, size, -armSide * 0.76);
    const hand = joints[2];
    const reach = weapon.length ?? 1;
    const tip = [hand[0] + edgeX * size * 0.735 * reach, hand[1] + edgeY * size * 0.585 * reach];
    return { joints, hand, tip };
  }

  function swordTrail(context, progress, sample, style) {
    const end = Math.min(progress, 0.62);
    const start = Math.max(0.18, progress - 0.23);
    if (end <= start) return;
    const inner = [];
    const outer = [];
    for (let index = 0; index <= 7; index++) {
      const { hand, tip } = sample(start + (end - start) * index / 7);
      outer.push(tip);
      inner.push([hand[0] * 0.36 + tip[0] * 0.64, hand[1] * 0.36 + tip[1] * 0.64]);
    }
    context.save();
    context.globalAlpha *= 0.76 * (1 - eased((progress - 0.53) / 0.27));
    if (style === "thrust") line(context, outer, "#dcfff5b5", 1.4);
    else poly(context, [...outer, ...inner.reverse()], style === "overhead" ? "#ffcf984a" : "#80f3c441",
      style === "overhead" ? "#ffe6c5b5" : "#dcfff5ad", 0.85);
    context.restore();
  }

  function miniatureFace(context, at, size, palette, { skin, crown, hood, mask, hero }) {
    forgedPlate(context, [at(-0.202, -0.12), at(-0.114, -0.24), at(0.091, -0.228),
      at(0.185, -0.136), at(0.186, -0.024), at(0.234, 0.019), at(0.169, 0.066), at(0.111, 0.161),
      at(-0.074, 0.171), at(-0.184, 0.081)], skin, palette, size, 0.25);
    poly(context, [at(-0.126, -0.116), at(0.096, -0.157), at(0.146, -0.034), at(0.109, 0.038),
      at(-0.064, 0.063), at(-0.126, 0.024)], skin[2]);
    if (hero) {
      forgedPlate(context, [at(-0.249, -0.08), at(-0.215, -0.219), at(-0.143, -0.298), at(0.015, -0.304),
        at(0.154, -0.284), at(0.224, -0.205), at(0.207, -0.124), at(0.104, -0.149), at(-0.031, -0.117),
        at(-0.098, -0.012), at(-0.127, 0.091), at(-0.224, 0.038)], crown, palette, size, 0.22);
      line(context, [at(-0.158, -0.237), at(-0.019, -0.272), at(0.108, -0.250)], crown[2] + "be", size * 0.027);
      line(context, [at(-0.194, -0.166), at(-0.151, -0.208), at(-0.093, -0.219)], crown[1], size * 0.027);
    } else {
      forgedPlate(context, [at(-0.245, -0.04), at(-0.203, -0.200), at(-0.107, -0.276), at(0.082, -0.270),
        at(0.187, -0.191), at(0.25, -0.076), at(0.16, -0.059), at(-0.11, -0.038), at(-0.18, 0.045)],
      crown, palette, size, 0.23);
      line(context, [at(-0.168, -0.179), at(-0.077, -0.23), at(0.053, -0.23)], crown[2], Math.max(.7, size * 0.025));
      if (!hood) line(context, [at(-0.217, -0.043), at(0.226, -0.086)], crown[0], Math.max(.8, size * 0.037));
    }
    if (mask) {
      poly(context, [at(-0.064, 0.007), at(0.162, -0.011), at(0.17, 0.10), at(0.057, 0.153),
        at(-0.103, 0.115)], "#453937", "#312829", Math.max(.7, size * 0.017));
      line(context, [at(0.012, 0.066), at(0.13, 0.045)], crown[2] + "8b", Math.max(.55, size * .024));
    } else {
      line(context, [at(0.064, 0.117), at(0.13, 0.102)], "#805449", Math.max(.65, size * .017));
    }
    ellipse(context, ...at(0.055, -0.055), Math.max(0.75, size * 0.025), Math.max(0.65, size * 0.032), "#302828");
    ellipse(context, ...at(0.142, -0.065), Math.max(0.67, size * 0.017), Math.max(0.60, size * 0.027), "#39292a");
    if (hero) ellipse(context, ...at(-0.076, 0.04), size * 0.043, size * 0.050, skin[1], skin[0], Math.max(.55, size * .012));
  }

  function heroBlade(context, hand, tip, unit) {
    const dx = tip[0] - hand[0];
    const dy = tip[1] - hand[1];
    const length = Math.hypot(dx, dy) || 1;
    const blade = (t, offset) => [hand[0] + dx * t - dy / length * unit * offset,
      hand[1] + dy * t + dx / length * unit * offset];
    line(context, [blade(-0.09, 0), blade(0.17, 0)], "#352929", unit * 0.093);
    line(context, [blade(0.14, -0.102), blade(0.14, 0.102)], "#d2a76f", unit * 0.053);
    poly(context, [blade(0.205, -0.050), blade(0.76, -0.046), blade(1.04, 0), blade(0.76, 0.055),
      blade(0.205, 0.052)], "#c5dbd4", "#26363a", Math.max(.8, unit * 0.028));
    poly(context, [blade(0.25, 0), blade(1.01, 0), blade(0.775, -0.032), blade(0.25, -0.038)], "#f1f1ce");
    line(context, [blade(0.33, 0.024), blade(0.76, 0.028)], "#7eaca3", Math.max(.58, unit * 0.019));
  }

  const heroWeaponEdges = {
    rapier: [[.15,-.023],[.79,-.019],[1.08,0],[.77,.02],[.15,.024]],
    daggers: [[.19,-.079],[.52,-.109],[1,-.011],[.57,.078],[.19,.051]],
    sabre: [[.16,-.046],[.49,-.099],[.78,-.182],[1.02,-.239],[.94,-.102],[.67,.014],[.19,.051]],
    greatsword: [[.16,-.115],[.79,-.098],[1.09,-.008],[.79,.100],[.16,.109]],
    twinblades: [[.17,-.051],[.64,-.151],[1.03,-.095],[.78,.015],[.40,.067],[.17,.048]],
    hooks: [[.18,-.029],[.61,-.061],[.76,-.172],[.65,-.229],[.59,-.208],[.65,-.123],[.49,-.045],[.18,.049]],
  };

  function heroWeapon(context, name, hand, tip, support, unit, progress) {
    if (name === "sword") {
      heroBlade(context, hand, tip, unit);
      return;
    }
    const dx = tip[0] - hand[0], dy = tip[1] - hand[1];
    const length = Math.hypot(dx, dy) || 1;
    const at = (u, v = 0) => [hand[0] + dx * u - dy / length * unit * v,
      hand[1] + dy * u + dx / length * unit * v];
    const dark = "#2d292e", edge = "#d9b57e", bright = "#f0e1b2";
    const outline = Math.max(.78, unit * .028);
    const metal = (shape, fill, border = dark) => poly(context, shape.map(([u, v]) => at(u, v)), fill, border, outline);
    const draw = (points, color, width) => line(context, points.map(([u, v]) => at(u, v)), color, Math.max(.65, unit * width));
    const blade = heroWeaponEdges[name];
    const charge = progress === null ? 0 : Math.sin(Math.PI * Math.min(1, progress / .74));
    if (blade) {
      const width = name === "greatsword" ? .16 : name === "daggers" ? .07 : .10;
      draw([[-.22,0],[.19,0]], "#4b3938", .083);
      draw([[.13,-width],[.17,width]], edge, .053);
      if (name === "rapier") {
        ellipse(context, ...at(.11), unit * .094, unit * .052, "#a98061", bright, outline);
      }
      metal(blade, name === "hooks" ? "#9aad9b" : "#c5dbd4");
      draw([blade[0], blade[1], blade[2]], bright, name === "rapier" ? .046 : .029);
    } else if (name === "hammer" || name === "maul" || name === "poleaxe") {
      const wide = name === "maul";
      draw([[-.28,0],[.92,0]], dark, wide ? .113 : .087);
      draw([[-.23,-.014],[.89,-.018]], "#bb8e58", .039);
      if (name === "poleaxe") {
        metal([[.64,-.055],[.73,-.161],[.83,-.248],[1.08,-.258],[1,-.095],[.89,-.027],
          [.99,.069],[.79,.104],[.65,.055]], "#859d95");
        draw([[.75,-.163],[.84,-.219],[1.04,-.234]], bright, .029);
      } else {
        const spread = wide ? .235 : .174;
        metal([[.61,-spread],[.86,-spread],[1.01,-spread*.51],[1.015,spread*.55],
          [.90,spread],[.64,spread],[.55,spread*.62],[.55,-spread*.62]], wide ? "#717f81" : "#a6977b");
        draw([[.71,-spread*.88],[.697,spread*.80]], edge, .052);
        draw([[.897,-spread*.83],[.90,spread*.79]], wide ? "#be8357" : "#d7c497", .032);
      }
    } else if (name === "staff" || name === "orb") {
      if (name === "staff") {
        draw([[-.37,0],[.88,0]], dark, .092);
        draw([[-.30,-.019],[.88,-.02]], edge, .035);
        metal([[.64,-.065],[.83,-.15],[1.06,-.082],[1.08,.081],[.86,.154],[.66,.057]], "#a17f55");
      }
      const [x, y] = at(name === "staff" ? .91 : .78);
      const radius = unit * ((name === "orb" ? .15 : .10) + charge * .036);
      ellipse(context, x, y, radius, radius, "#78cbd3", "#3d5961", outline);
      ellipse(context, x - radius * .23, y - radius * .24, radius * .52, radius * .47, "#d3fbf1");
      if (name === "orb") {
        ellipse(context, x, y, radius * 1.38, radius * .70, null, "#f7d38ba3", 1.1);
      }
    } else if (name === "bow" || name === "crossbow") {
      const crossbow = name === "crossbow";
      const arc = crossbow ? [[.29,-.27],[.62,-.176],[.59,0],[.62,.176],[.29,.27]]
        : [[-.27,-.35],[.00,-.28],[.18,-.17],[.22,0],[.18,.17],[.00,.28],[-.27,.35]];
      if (crossbow) {
        metal([[-.39,-.064],[.44,-.058],[.70,-.033],[.70,.058],[.09,.061],[-.33,.107]], "#8e644b");
        draw([[-.26,-.021],[.61,-.018]], edge, .031);
      }
      draw(arc, dark, .09);
      draw(arc, "#bc8d5a", .045);
      const pull = support && progress !== null && progress < .37 ? support : null;
      const nock = pull ?? at(crossbow ? .28 : -.27);
      line(context, [at(...arc[0]), nock, at(...arc[arc.length - 1])], "#f1dfac", Math.max(.72, unit * .022));
    } else if (name === "tonfa") {
      metal([[-.42,-.053],[.58,-.057],[.86,-.030],[.86,.054],[.55,.087],[-.42,.066]], "#936747");
      draw([[.16,-.162],[.16,.052]], dark, .092);
      draw([[.24,-.019],[.77,.015]], edge, .036);
    } else {
      metal([[-.33,-.134],[.23,-.165],[.61,-.098],[.62,.092],[.26,.164],[-.33,.119]], "#797e70");
      draw([[.025,-.129],[.07,.122]], edge, .060);
      draw([[.45,-.093],[.48,.077]], "#b4ddd0", .041);
    }
  }

  function player(context, camera, actor, seconds, reduced, pose, palette, carryingCartridge, footing) {
    const [x, y] = point(camera, actor.x, actor.y);
    const unit = camera.unit * (camera.width < 500 ? 1.12 : 1);
    const [fx, fy] = unitVector(pose.look);
    const side = pose.facingRight ? 1 : -1;
    const armDepth = pose.armDepth;
    const stride = pose.stride;
    const weaponName = Object.hasOwn(heroWeapons, actor.weapon) ? actor.weapon : "sword";
    const weapon = heroWeapons[weaponName];
    const dual = weapon.style === "dual" || weapon.dual;
    const variant = Number.isInteger(actor.attackVariant) && swingProfiles[actor.attackVariant] ? actor.attackVariant : 0;
    const armSide = weapon.style === "fist" && variant === 1 ? -pose.armSide : pose.armSide;
    const profile = swingProfiles[variant];
    const length = actor.swingDuration > 0 ? actor.swingDuration : actor.swingLife !== undefined ? profile.duration : 0.20;
    const progress = pose.swingRemaining > 0 ? clamp(1 - pose.swingRemaining / length, 0, 1) : null;
    const burst = weapon.style === "thrust" || weapon.style === "fist" ? .17 : .089;
    const thrust = progress === null || reduced ? 0 : Math.sin(progress * Math.PI) * burst;
    const tuck = pose.dashing * 0.082;
    const flinch = reduced ? 0 : pose.impact;
    const bob = pose.breath - Math.abs(stride) * 0.21 + tuck + flinch * 0.10;
    const base = (horizontal, vertical) => [x + horizontal * unit, y + vertical * unit];
    const ground = (horizontal, vertical) => [x + horizontal * unit, y + vertical * unit - footing * camera.unit];
    const at = (horizontal, vertical) => base(horizontal + fx * (thrust + tuck * 0.70 - flinch * 0.14), vertical + bob);
    const cloth = ["#25413f", "#45867b", "#8bc1ab"];
    const scarf = ["#265654", "#50a998", "#a7e7c7"];
    const brass = ["#664b3e", "#b98a57", "#e3ba7b"];
    const boot = ["#373233", "#6c5444", "#a78360"];
    const skin = ["#7d564f", "#c8906d", "#e5b18b"];
    const hair = ["#2e3032", "#56403a", "#8e634a"];

    contactShadow(context, x, y - footing * camera.unit, unit, palette);
    context.save();
    if (actor.invulnerable > 0) context.globalAlpha = reduced ? 0.78 : 0.59 + Math.abs(Math.sin(seconds * 27)) * 0.41;
    groundRing(context, raisedCamera(camera, footing), actor.x, actor.y, 0.39, "#99e9c428", "#9be5cd", 1.9);
    if (actor.wet > 0 && pose.gait > 0.30 && !reduced) {
      groundRing(context, camera, actor.x, actor.y, 0.48 + Math.abs(stride) * 0.62, null, "#a7f4eb92", 1.15);
    }
    legStride(context, ground, at, unitVector(pose.travel), pose, unit, "#3d454b", boot[1], 0, true);

    const idleAngle = pose.look + stride * 0.24;
    const swordArm = (u, v) => at(u, v + armDepth);
    const carry = stride * .12 - tuck * .58;
    const sampleSwing = (phase) => swordPose(swordArm, unit, armSide, idleAngle, pose.swingAngle, profile, weapon, phase, reduced, carry);
    const { joints, hand, tip } = sampleSwing(progress);
    const backArm = (u, v) => at(u, v - armDepth);
    const supportShoulder = backArm(-armSide * .218, -.775);
    const lampTarget = backArm(-armSide * .33 - stride * .16, -.48 + stride * .12 - tuck * .48);
    let supportArm;
    if (dual) {
      const reverse = { ...profile, coil: -profile.coil * .84, pass: -profile.pass };
      const offhandPhase = weapon.style === "fist" ? null : progress;
      const offhand = swordPose(backArm, unit, -armSide, idleAngle - side * .96,
        pose.swingAngle, reverse, weapon, offhandPhase, reduced, carry);
      supportArm = offhand.joints;
      paintArm(context, supportArm, unit, cloth, "#182b2f");
      heroWeapon(context, weaponName, offhand.hand, offhand.tip, null, unit, progress);
    } else if (weapon.twoHands) {
      const length = Math.hypot(tip[0] - hand[0], tip[1] - hand[1]) || 1;
      const nock = weapon.style === "draw" && progress !== null && progress < .37
        ? .12 + eased(progress / .24) * .18 : .13;
      const target = [hand[0] - (tip[0] - hand[0]) * unit * nock / length,
        hand[1] - (tip[1] - hand[1]) * unit * nock / length];
      supportArm = armJoints(supportShoulder, target, unit, armSide * .63, .31, .29);
      paintArm(context, supportArm, unit, cloth, "#182b2f");
    } else {
      supportArm = armJoints(supportShoulder, lampTarget, unit, armSide * .64);
      paintArm(context, supportArm, unit, cloth, "#182b2f");
    }
    const grip = dual || weapon.twoHands ? at(-armSide * .269, -.41) : supportArm[2];
    forgedPlate(context, [at(-0.29, -0.80), at(-0.16, -0.92), at(0.17, -0.92), at(0.28, -0.76),
      at(0.22, -0.51), at(0.33, -0.24), at(0.15, -0.165), at(-0.01, -0.252), at(-0.22, -0.18), at(-0.30, -0.35)],
    cloth, palette, unit, 0.28);
    poly(context, [at(-side * 0.22, -0.79), at(side * 0.085, -0.85), at(side * 0.063, -0.44),
      at(side * 0.17, -0.256), at(-side * 0.15, -0.32), at(-side * 0.22, -0.55)], "#9cccab5e");
    line(context, [at(-0.21, -0.43), at(0.09, -0.45), at(0.21, -0.42)], "#3e3434", Math.max(1, unit * 0.060));
    ellipse(context, ...at(side * .045, -.438), unit * .053, unit * .037, "#d7ae75", "#473732", .72);

    const wind = reduced ? 0 : Math.sin(seconds * 4.3 + x * 0.025) * 0.024 + stride * 0.35;
    forgedPlate(context, [at(-side * 0.08, -0.89), at(-side * 0.34, -0.87),
      at(-side * (0.50 + Math.abs(stride) * 0.32), -0.75 + wind),
      at(-side * 0.39, -0.69 + wind), at(-side * 0.19, -0.78), at(side * .15, -.866)],
    scarf, palette, unit, 0.22);
    miniatureFace(context, (horizontal, vertical) => at(side * (horizontal + .05), -1.08 + vertical + fy * .026),
      unit, palette, { skin, crown: hair, hero: true });
    forgedPlate(context, [at(-0.20, -0.926), at(-0.10, -0.94), at(0.05, -0.904), at(0.21, -0.933),
      at(0.20, -0.846), at(0.064, -0.792), at(-0.13, -0.817)], scarf, palette, unit, 0.25);

    if (!reduced && progress !== null && weapon.style !== "draw" && weapon.style !== "cast") {
      swordTrail(context, progress, sampleSwing, weapon.style);
    }
    paintArm(context, joints, unit, brass, "#312b2e");
    const sleeveCap = (u, v) => swordArm(armSide * 0.223 + u, v);
    forgedPlate(context, [sleeveCap(-0.114, -.827), sleeveCap(-0.053, -.872), sleeveCap(0.084, -.856),
      sleeveCap(0.124, -.766), sleeveCap(0.062, -.695), sleeveCap(-0.095, -.71)], brass, palette, unit, .26);
    heroWeapon(context, weaponName, hand, tip, supportArm[2], unit, progress);
    ellipse(context, ...hand, unit * 0.08, unit * 0.083, boot[1], "#30282b", Math.max(.75, unit * .017));
    if (weapon.twoHands) ellipse(context, ...supportArm[2], unit * .067, unit * .066, boot[1], "#30282b", .76);

    const [lampX, lampY] = grip;
    if (carryingCartridge) cartridge(context, lampX - side * unit * .062, lampY + unit * .097, unit * .92, -side * .32);
    if (!dual && !weapon.twoHands) ellipse(context, lampX, lampY, unit * .083, unit * .076, boot[1], "#332928", .85);
    if (carryingCartridge) {
      context.restore();
      return;
    }
    line(context, [[lampX, lampY + unit * .033], [lampX, lampY + unit * .139]], "#e2b779", Math.max(.75, unit * .03));
    const globe = (u,v) => [lampX + unit * u, lampY + unit * v];
    poly(context, [globe(-.073,.119), globe(.070,.119), globe(.105,.188), globe(.073,.274), globe(-.073,.274),
      globe(-.105,.188)], "#6dcdb7", "#2e3236", Math.max(.85, unit*.028));
    poly(context, [globe(-.039,.146), globe(.035,.146), globe(.054,.197), globe(.026,.239), globe(-.035,.239)],
      "#c6f3bf");
    line(context, [globe(-.078,.267), globe(.078,.267)], "#c59769", Math.max(.75, unit * .030));
    context.restore();
  }

  const guardianMetals = {
    guard: ["#392b2c", "#955c45", "#d4a77e"],
    runner: ["#3f2a29", "#aa603c", "#e4a574"],
    sentry: ["#29333e", "#677b83", "#aabdc0"],
    lancer: ["#3d3027", "#9a7949", "#dac08a"],
    mortar: ["#392c35", "#83676a", "#b7a39b"],
    warden: ["#322c46", "#726886", "#b3a9c3"],
    skirmisher: ["#4b2e2e", "#a76843", "#efb476"],
    breaker: ["#38272b", "#8c4f45", "#d39571"],
    marksman: ["#293740", "#58788a", "#acc9ce"],
    saboteur: ["#363a2a", "#777748", "#cbb675"],
    boss: ["#392b43", "#8a568e", "#c998ca"],
  };

  const specialistArt = {
    skirmisher: { scale: .89, breadth: .81, coat: ["#39262f", "#936048", "#d7a76b"], height: 1.30 },
    breaker: { scale: 1.28, breadth: 1.16, coat: ["#302a32", "#6d4c43", "#ca9b7e"], height: 1.88 },
    marksman: { scale: 1.02, breadth: .86, coat: ["#263641", "#466878", "#a3bfc3"], height: 1.51 },
    saboteur: { scale: .98, breadth: 1.02, coat: ["#343829", "#646947", "#c7b77d"], height: 1.45 },
  };

  const bossStyles = {
    warden: { kit: "breaker", scale: 1.55, height: 2.30, metal: ["#442b27", "#a35e46", "#f0bc79"] },
    hunter: { kit: "hunter", scale: 1.43, height: 2.05, metal: ["#33263e", "#76567f", "#e7ad9b"] },
    engine: { kit: "engine", scale: 1.67, height: 2.24, metal: ["#352b31", "#a56643", "#ffb573"] },
    beast: { scale: 1.76, height: 2.13, metal: ["#44293d", "#895275", "#e4ad91"] },
    stellar: { scale: 1.74, height: 2.86 },
  };

  const bossStances = {
    sweep: [.14, .05],
    rupture: [.04, .105],
    barrage: [-.12, .045],
    pursuit: [.24, .095],
    crossfire: [-.075, .075],
    orbit: [-.05, -.065],
  };

  function mineCasing(context, at, size, color, armed) {
    const shape = [at(-.21, .015), at(-.12, -.075), at(.11, -.083), at(.218, .009),
      at(.15, .095), at(-.144, .095)];
    poly(context, shape, "#66563e", "#242a2b", Math.max(.75, size * .032));
    poly(context, [at(-.14, -.038), at(.13, -.046), at(.186, .004), at(.10, .041), at(-.113, .039)],
      armed ? "#93623f" : "#747552", color, Math.max(.6, size * .021));
    ellipse(context, ...at(.036, -.003), Math.max(1, size * .047), Math.max(.78, size * .028),
      armed ? "#fff2b5" : "#e8cc88", "#302c2a", .6);
  }

  function specialistWeapon(context, kit, hand, farHand, pose, facing, size, metal, palette, signature) {
    const facingSide = pose.facingRight ? 1 : -1;
    const tilt = facing[1];
    const wind = pose.anticipation;
    const follow = pose.recoil;
    const bladeAt = (grip, angle, side) => {
      const dx = Math.cos(angle) * side, dy = Math.sin(angle);
      return (u, v = 0) => [grip[0] + (u * dx - v * dy * side) * size,
        grip[1] + (u * dy + v * Math.cos(angle)) * size];
    };
    if (kit === "skirmisher" || kit === "hunter") {
      const knife = (grip, angle, side, reach) => {
        const edge = bladeAt(grip, angle, side);
        line(context, [edge(-.10), edge(.166)], "#40302f", size * .077);
        line(context, [edge(.175, -.103), edge(.15, .09)], "#d3a472", size * .045);
        forgedPlate(context, [edge(.19, -.055), edge(reach * .78, -.11), edge(reach, -.207),
          edge(reach * .92, .025), edge(reach * .56, .094), edge(.207, .058)],
        ["#463644", "#c3a58a", "#ffddb2"], palette, size, .14, true);
        line(context, [edge(.24, -.035), edge(reach * .76, -.069), edge(reach, -.18)], "#ffe6ba", size * .027);
      };
      const pursuit = signature === "pursuit";
      if (kit === "hunter") knife(farHand, .77 + wind * (pursuit ? .62 : .40), -facingSide, .58);
      knife(hand, .35 + tilt * .35 - wind * (pursuit ? .72 : .91) + follow * .42, facingSide, kit === "hunter" ? .70 : .63);
    } else if (kit === "breaker") {
      const sweep = signature === "sweep";
      const head = bladeAt(hand, .40 + tilt * .14 - wind * (sweep ? 1.30 : 1.85) + follow * (sweep ? .82 : .56), facingSide);
      line(context, [head(-.37), head(.78)], "#31252a", size * .115);
      line(context, [head(-.35, -.028), head(.75, -.027)], "#c29a6a", size * .041);
      forgedPlate(context, [head(.60, -.17), head(.73, -.24), head(.99, -.17), head(1.04, -.042),
        head(.96, .17), head(.78, .21), head(.62, .132)],
      ["#493432", "#8f5747", "#e6af7a"], palette, size, .17, true);
      line(context, [head(.77, -.185), head(.72, .125)], "#e0a371", size * .052);
      line(context, [head(.945, -.131), head(.89, .124)], "#553835", size * .045);
      ellipse(context, ...farHand, size * .064, size * .060, metal[1], metal[0], .75);
    } else if (kit === "marksman") {
      const barrel = bladeAt(hand, -.15 + tilt * .34 - wind * .12 + follow * .08, facingSide);
      forgedPlate(context, [barrel(-.41, -.045), barrel(-.02, -.081), barrel(.58, -.065), barrel(.62, .061),
        barrel(.02, .068), barrel(-.29, .13), barrel(-.44, .081)], ["#292931", "#62534b", "#b99367"], palette, size, .17);
      for (const side of [-1, 1]) {
        const offset = side * .045;
        line(context, [barrel(.23, offset), barrel(.94, offset)], "#212936", size * .075);
        line(context, [barrel(.25, offset - .012), barrel(.91, offset - .012)], metal[2], size * .023);
      }
      ellipse(context, ...barrel(.94), size * .046, size * .095, wind > 0 ? "#ffe2a0" : "#242b35", "#c9af8f", .8);
      ellipse(context, ...farHand, size * .066, size * .059, metal[1], metal[0], .72);
    } else if (kit === "saboteur") {
      const device = (u, v) => [hand[0] + u * size * .83, hand[1] + v * size * .83];
      mineCasing(context, device, size * .83, wind > 0 ? "#ffe89b" : metal[2], wind > 0);
    } else {
      for (const grip of [farHand, hand]) {
        const glove = (u, v) => [grip[0] + (u + facingSide * .09) * size, grip[1] + v * size];
        forgedPlate(context, [glove(-.16, -.105), glove(.16, -.13), glove(.19, .06), glove(.098, .129),
          glove(-.123, .13), glove(-.185, .023)], metal, palette, size, .23, true);
        for (const nub of [-.068, .055]) {
          line(context, [glove(nub, -.081), glove(nub + .008, .062)], wind > 0 ? "#ffd28d" : "#e18b55", size * .034);
        }
      }
    }
    ellipse(context, ...hand, size * .063, size * .055, metal[1], metal[0], .75);
  }

  function forgedPlate(context, points, metal, palette, size, radius = 0.18, inked = false) {
    const left = Math.min(...points.map(([x]) => x));
    const right = Math.max(...points.map(([x]) => x));
    const top = Math.min(...points.map(([, y]) => y));
    const bottom = Math.max(...points.map(([, y]) => y));
    const span = bottom - top;
    const lerp = (a, b, amount) => [a[0] + (b[0] - a[0]) * amount, a[1] + (b[1] - a[1]) * amount];
    const contour = new Path2D();
    contour.moveTo(...lerp(points[0], points[1], radius));
    for (let i = 1; i <= points.length; i++) {
      const previous = points[i - 1];
      const corner = points[i % points.length];
      const next = points[(i + 1) % points.length];
      contour.lineTo(...lerp(corner, previous, radius));
      contour.quadraticCurveTo(...corner, ...lerp(corner, next, radius));
    }
    contour.closePath();
    if (inked) {
      context.save();
      context.clip(contour);
      context.fillStyle = metal[1];
      context.fillRect(left, top, right - left, span);
      poly(context, [[left, top], [right, top], [right, top + span * 0.26],
        [left + (right - left) * 0.44, top + span * 0.44], [left, top + span * 0.51]], metal[2] + "8f");
      poly(context, [[left, bottom - span * 0.15], [right, bottom - span * 0.35], [right, bottom], [left, bottom]], metal[0] + "9d");
      context.restore();
    } else {
      const forming = context.createLinearGradient(left, top, left + span * 0.65, bottom);
      forming.addColorStop(0, metal[2]);
      forming.addColorStop(0.26, metal[1]);
      forming.addColorStop(0.58, metal[1]);
      forming.addColorStop(1, metal[0]);
      context.fillStyle = forming;
      context.fill(contour);
    }
    context.strokeStyle = palette.materialShade;
    context.lineWidth = Math.max(0.67, size * (inked ? 0.039 : 0.026));
    context.stroke(contour);
  }

  function guardianRivet(context, at, x, y, size, metal) {
    const [px, py] = at(x, y);
    ellipse(context, px, py, size * 0.030, size * 0.026, metal[0]);
    ellipse(context, px - size * 0.006, py - size * 0.006, size * 0.012, size * 0.010, metal[2]);
  }

  function pressureGunner(context, at, facing, actor, pose, size, metal, palette) {
    const mortar = actor.kind === "mortar";
    const [fx, fy] = facing;
    const wind = pose.anticipation;
    const live = actor.windup > 0;
    const width = mortar ? 1.12 : 1;
    const shell = (x, y) => at(x * width, y + (mortar ? 0.065 : 0));
    forgedPlate(context, [shell(-0.46, -0.55), shell(-0.51, -0.75), shell(-0.37, -0.97),
      shell(-0.15, -1.045), shell(0.19, -1.045), shell(0.43, -0.92), shell(0.51, -0.70),
      shell(0.36, -0.49), shell(0.09, -0.40), shell(-0.30, -0.44)], metal, palette, size, .22, true);
    line(context, [shell(-0.40, -0.80), shell(-0.30, -0.94), shell(-0.14, -0.993), shell(0.09, -0.995)],
      metal[2] + "ae", Math.max(0.8, size * 0.025));
    for (const side of [-1, 1]) {
      guardianRivet(context, shell, side * 0.36, -0.76, size, metal);
      line(context, [shell(side * 0.40, -0.59), shell(side * 0.27, -0.52)], metal[0] + "a8", size * 0.031);
    }
    const pivot = at(fx * 0.17, -0.72);
    const muzzle = mortar
      ? at(fx * (0.31 - pose.recoil * 0.20), -1.12 + fy * 0.11 - wind * 0.14 + pose.recoil * 0.10)
      : at(fx * (0.91 - pose.recoil * 0.21), -0.75 + fy * 0.26 - wind * 0.058);
    const barrel = size * (mortar ? 0.28 : 0.15);
    const barrelMid = [pivot[0] * 0.32 + muzzle[0] * 0.68, pivot[1] * 0.32 + muzzle[1] * 0.68];
    ellipse(context, ...pivot, size * 0.19, size * 0.177, metal[0], palette.materialShade, 1.05);
    line(context, [pivot, muzzle], palette.materialShade, barrel * 1.37);
    line(context, [pivot, muzzle], metal[1], barrel);
    line(context, [[pivot[0], pivot[1] - barrel * 0.16], [muzzle[0], muzzle[1] - barrel * 0.17]],
      metal[2], Math.max(0.8, barrel * 0.24));
    line(context, [barrelMid, muzzle], metal[0], barrel * 0.83);
    ellipse(context, ...muzzle, barrel * (mortar ? 0.56 : 0.33), barrel * (mortar ? 0.48 : 0.38),
      live ? "#ffe3a8" : "#211f28", metal[2], Math.max(0.6, size * 0.022));
    const lens = shell(-fx * 0.15, -0.76);
    ellipse(context, ...lens, size * 0.132, size * 0.086, "#252936", metal[2], Math.max(1, size * 0.029));
    ellipse(context, ...lens, size * 0.081, size * 0.043, live ? "#fff1b3" : "#ed9b5c");
    ellipse(context, lens[0] - size * 0.032, lens[1] - size * 0.011, size * 0.026, size * 0.012, "#ffe7b0");
  }

  function compressionGuard(context, at, actor, pose, size, metal, palette, facing, kit) {
    const [fx, fy] = facing;
    const boss = actor.kind === "boss";
    const runner = actor.kind === "runner";
    const lancer = actor.kind === "lancer";
    const warden = actor.kind === "warden";
    const human = actor.faction === "human" && kit !== "engine";
    const ranged = kit === "marksman" || (human && (actor.kind === "sentry" || actor.kind === "mortar"));
    const agile = kit === "skirmisher" || kit === "hunter";
    const specialization = specialistArt[kit === "hunter" ? "skirmisher" : kit];
    const side = pose.facingRight ? 1 : -1;
    const armSide = pose.armSide;
    const armDepth = pose.armDepth;
    const weaponSide = clamp(fx * 2.8, -1, 1);
    const breadth = specialization?.breadth ?? (boss ? 1.19 : runner ? 0.82 : warden ? 1.08 : 1);
    const chest = (x, y) => at(x * breadth + fx * (0.077 * Math.max(0, -y - 0.48)), y);
    const wind = pose.anticipation;
    const follow = Math.max(pose.charge * 0.74, pose.recoil * 0.86);
    const folding = warden ? pose.guarded * 0.21 : 0;
    const wristX = armSide * (0.38 + follow * (agile ? .24 : .17) - wind * 0.08) + pose.stride * 0.15;
    const wristY = -0.48 + armDepth + fy * 0.083 - wind * (kit === "breaker" ? .40 : .24)
      + follow * 0.072 - folding + (kit === "saboteur" ? wind * .21 : 0);
    const nearArm = armJoints(chest(armSide * 0.258, -0.742 + armDepth),
      at(wristX, ranged ? wristY - 0.105 : wristY), size, -armSide * 0.74, 0.248, 0.23);
    const hand = nearArm[2];
    const gunAngle = -0.14 + fy * 0.24 - wind * 0.09 + pose.recoil * 0.09;
    const gunPoint = (distance) => [hand[0] + distance * weaponSide * size, hand[1] + distance * gunAngle * size];
    const farTarget = ranged ? gunPoint(-0.26) : kit === "breaker" ?
      [hand[0] - side * size * .10, hand[1] + size * (.09 + wind * .04)] :
      at(-armSide * (0.33 - follow * 0.09) - pose.stride * 0.14, -0.45 - armDepth - wind * 0.10);
    const farArm = armJoints(chest(-armSide * 0.235, -0.74 - armDepth), farTarget, size, armSide * 0.69);
    const coat = human ? specialization?.coat ?? ["#3c3036", runner ? "#886749" : warden ? "#665675" : "#805644", "#bb936d"]
      : [metal[0], metal[0], metal[1]];
    if (kit === "saboteur") {
      const pack = (u, v) => chest(-side * (.31 + u), v);
      forgedPlate(context, [pack(-.14, -.76), pack(-.08, -1.00), pack(.22, -.995), pack(.30, -.82),
        pack(.24, -.43), pack(-.12, -.44)], ["#373327", "#78734b", "#d3b579"], palette, size, .21, true);
      for (const u of [.05, .22]) {
        line(context, [pack(u, -.92), pack(u, -.56)], "#333d31", size * .122);
        line(context, [pack(u, -.87), pack(u, -.63)], u > .1 ? "#bfa663" : "#a9ae6b", size * .072);
      }
      line(context, [pack(-.055, -.72), pack(.23, -.72)], "#e1c18b", size * .040);
    }
    if (agile) {
      const clothHang = pose.stride * .36 + wind * .07;
      forgedPlate(context, [chest(-side * .20, -.88), chest(-side * .44, -.77 + clothHang),
        chest(-side * .60, -.53 + clothHang), chest(-side * .41, -.58 + clothHang), chest(-side * .26, -.73)],
      [coat[0], kit === "hunter" ? metal[1] : "#c48047", metal[2]], palette, size, .18, true);
    }
    paintArm(context, farArm, size, coat, "#1b1820");
    forgedPlate(context, [chest(-0.24, -0.60), chest(0.24, -0.60), chest(0.27, -0.39),
      chest(0.13, human ? -0.24 + pose.stride * 0.26 : -0.29),
      chest(-0.19, human ? -0.26 - pose.stride * 0.16 : -0.31), chest(-0.28, -0.43)], coat, palette, size, .24, !human);
    forgedPlate(context, [chest(-0.35, -0.70), chest(-0.31, boss ? -0.96 : -0.87), chest(-0.12, -0.865),
      chest(0.12, -0.87), chest(0.31, boss ? -0.96 : -0.88), chest(0.365, -0.68),
      chest(0.25, -0.53), chest(0.13, -0.43), chest(-0.18, -0.46), chest(-0.29, -0.55)], metal, palette, size, .24, !human);
    line(context, [chest(-0.30, -0.73), chest(-0.15, -0.81), chest(0.12, -0.805), chest(0.27, -0.75)],
      metal[2] + "ba", Math.max(0.65, size * 0.025));
    line(context, [chest(-0.16, -0.55), chest(-0.08, -0.50), chest(0.16, -0.53)], metal[0], size * 0.032);
    for (const edge of [-1, 1]) guardianRivet(context, chest, edge * 0.245, -0.715, size, metal);
    if (human) {
      poly(context, [chest(-side * 0.25, -0.78), chest(-side * 0.07, -0.80), chest(side * 0.13, -0.60),
        chest(side * 0.08, -0.50), chest(-side * 0.13, -0.59)], metal[2] + "76");
      line(context, [chest(-side * 0.155, -0.78), chest(side * 0.07, -0.61), chest(side * 0.17, -0.51)],
        "#453332", Math.max(1, size * 0.06));
      line(context, [chest(-side * 0.14, -0.79), chest(side * 0.07, -0.61)], coat[2], Math.max(0.56, size * 0.019));
      line(context, [chest(-0.15, -0.395), chest(0.16, -0.39)], "#362a2c", size * 0.056);
      guardianRivet(context, chest, -side * 0.055, -0.389, size * 1.24, metal);
      forgedPlate(context, [chest(-side * 0.22, -0.883), chest(-side * 0.055, -0.91), chest(side * 0.07, -0.873),
        chest(side * 0.18, -0.90), chest(side * 0.13, -0.79), chest(-side * 0.066, -0.795)],
      coat, palette, size, 0.24);
    } else if (boss || actor.elite) {
      const core = chest(0.028, -0.645);
      ellipse(context, ...core, size * 0.096, size * 0.118, metal[0], metal[2], Math.max(0.75, size * 0.022));
      ellipse(context, ...core, size * 0.049, size * 0.063, actor.phase > 1 ? "#ff895d" : "#ffd089");
    }

    const brow = (x, y) => chest(x + fx * (0.044 + follow * 0.04),
      y + (runner || agile ? 0.075 : 0) + fy * 0.031);
    if (human) {
      const skin = actor.id % 3 === 1 ? ["#6b4844", "#ba8d69", "#dfb886"] : ["#784c44", "#bc855f", "#e3b48b"];
      const face = (x, y) => brow(x * side, -1.076 + y);
      miniatureFace(context, face, size, palette, {
        skin, crown: runner ? coat : metal, hood: runner || kit === "hunter", mask: ranged || runner || agile,
      });
      if (kit === "marksman") {
        line(context, [face(-.25, -.06), face(.21, -.08), face(.29, -.045)], metal[2], size * .035);
      } else if (kit === "breaker") {
        line(context, [face(-.24, .015), face(-.36, .16), face(-.18, .22)], metal[2], size * .062);
      }
    } else {
      forgedPlate(context, [brow(-0.205, -0.99), brow(-0.128, -1.16), brow(0.092, -1.186),
        brow(0.194, -1.08), brow(0.225, -0.941), brow(0.124, -0.833), brow(-0.137, -0.86)],
      metal, palette, size, 0.24, true);
      line(context, [brow(-0.155, -0.997), brow(0.165, -0.977)], "#291d24", size * 0.093);
      const signal = actor.windup > 0 ? "#fff3bc" : "#fbd191";
      for (const offset of [-0.062, 0.058]) {
        const eye = fx * 0.043 + offset;
        line(context, [brow(eye - 0.021, -1.005), brow(eye + 0.023, -0.973)],
          signal, Math.max(1.1, size * 0.033));
      }
    }

    paintArm(context, nearArm, size, human ? coat : metal, "#1b1820");
    const pauldron = (x, y) => chest(armSide * 0.258 + x, y + armDepth);
    forgedPlate(context, [pauldron(-0.115, -0.80), pauldron(-0.071, -0.866), pauldron(0.071, -0.863),
      pauldron(0.129, -0.758), pauldron(0.071, -0.695), pauldron(-0.101, -0.707)],
      metal, palette, size, 0.28);
    if (kit) {
      specialistWeapon(context, kit, hand, farArm[2], pose, facing, size, metal, palette, actor.bossMove);
    } else if (lancer) {
      const roll = 0.14 + fy * 0.39 - wind * 0.23 + pose.charge * 0.16;
      const blade = (distance, width = 0) =>
        [hand[0] + weaponSide * distance * size, hand[1] + (distance * roll + width) * size];
      line(context, [blade(-0.67), blade(0.60 + pose.charge * 0.23)], "#2c2024", size * 0.091);
      line(context, [blade(-0.67, -0.018), blade(0.60 + pose.charge * 0.23, -0.018)], metal[2], size * 0.035);
      const reach = 0.59 + pose.charge * 0.23;
      forgedPlate(context, [blade(reach - 0.12, -0.075), blade(reach + 0.23), blade(reach - 0.04, 0.086)],
        ["#55423a", "#ae9869", "#f4d9a7"], palette, size);
      ellipse(context, ...hand, size * 0.075, size * 0.068, metal[1], metal[0], 0.72);
    } else if (ranged) {
      const launcher = actor.kind === "mortar";
      const stock = gunPoint(-0.44);
      const muzzle = gunPoint(launcher ? 0.36 : 0.51);
      line(context, [stock, muzzle], palette.materialShade, size * (launcher ? 0.22 : 0.14));
      line(context, [[stock[0], stock[1] - size * 0.022], [muzzle[0], muzzle[1] - size * 0.025]],
        metal[2], size * (launcher ? 0.095 : 0.055));
      ellipse(context, ...muzzle, size * 0.044, size * (launcher ? 0.066 : 0.039),
        actor.windup > 0 ? "#ffcc8a" : metal[0], metal[2], 0.7);
      ellipse(context, ...farArm[2], size * 0.061, size * 0.049, coat[1], metal[0], 0.72);
      ellipse(context, ...hand, size * 0.071, size * 0.057, coat[1], metal[0], 0.74);
    } else if (warden) {
      const shield = (x, y) =>
        [hand[0] + (x * (0.75 + Math.abs(armSide) * 0.25) + armSide * 0.035) * size,
          hand[1] + (y + fy * x * 0.18) * size];
      const emboss = actor.guarded ? "#9fe6ee" : "#b2a1c6";
      forgedPlate(context, [shield(0.02, -0.29), shield(0.26, -0.22), shield(0.29, 0.08),
        shield(0.16, 0.26), shield(-0.13, 0.23), shield(-0.20, -0.04), shield(-0.16, -0.21)],
      ["#342838", "#534563", emboss], palette, size, .20, !human);
      line(context, [shield(-0.08, -0.185), shield(0.05, -0.232), shield(0.18, -0.17)], emboss, 1.0);
      line(context, [shield(0.019, -0.13), shield(0.026, 0.16)], emboss + "ab", Math.max(0.72, size * 0.024));
    } else {
      const gauntlet = (x, y) => [hand[0] + (x - 0.06 + armSide * 0.06) * size, hand[1] + y * size];
      const knuckle = human ? 0.035 : 0;
      forgedPlate(context, [gauntlet(-0.08, -0.08 - knuckle), gauntlet(0.12 + (boss ? 0.075 : 0), -0.075 - knuckle),
        gauntlet(0.15 + knuckle + (boss ? 0.075 : 0), 0.04), gauntlet(0.052, 0.115 + knuckle), gauntlet(-0.065, 0.065)],
      metal, palette, size, .21, !human);
      line(context, [gauntlet(0.015, 0.01), gauntlet(0.085, -0.045)], metal[2], Math.max(0.55, size * 0.023));
    }
  }

  const creatureSkins = {
    guard: ["#402b35", "#95574b", "#d68a6c"],
    runner: ["#442a2d", "#ad5d43", "#e4a075"],
    sentry: ["#293540", "#637982", "#a4a9a0"],
    lancer: ["#45352a", "#947745", "#d2ad79"],
    mortar: ["#422f3c", "#8a626b", "#b88490"],
    warden: ["#352d47", "#756387", "#b2a0bc"],
    skirmisher: ["#493036", "#9b5b55", "#eea484"],
    breaker: ["#402d33", "#a26457", "#dfa98a"],
    marksman: ["#2e354b", "#637e98", "#b5bacb"],
    saboteur: ["#303d34", "#798052", "#c8bb76"],
    boss: ["#352438", "#895986", "#d69abd"],
  };

  function burrowCreature(context, base, at, actor, pose, size, skin, palette, facing, kit) {
    const [fx, fy] = facing;
    const side = pose.facingRight ? 1 : -1;
    const boss = actor.kind === "boss";
    const skirmisher = kit === "skirmisher" || kit === "hunter";
    const breaker = kit === "breaker";
    const marksman = kit === "marksman";
    const saboteur = kit === "saboteur";
    const runner = actor.kind === "runner" || skirmisher;
    const lancer = actor.kind === "lancer";
    const warden = actor.kind === "warden";
    const mortar = actor.kind === "mortar";
    const sentry = actor.kind === "sentry";
    const low = runner || mortar || warden || sentry || marksman || saboteur;
    const bodyWide = breaker ? 1.30 : boss ? 1.11 : low ? 1.19 : 0.98;
    const bodyDip = low ? (runner ? 0.17 : 0.09) : 0;
    const body = (x, y) => at(side * x * bodyWide, y + bodyDip);
    const fore = pose.anticipation;
    const thrust = pose.recoil * 0.15 + pose.charge * 0.27;
    if (!sentry) {
      const tailRoot = body(-0.30, -0.59);
      const tailBend = body(-0.65, -0.51 - pose.stride * 0.26 - (breaker ? fore * .33 : 0));
      const tailTip = body(runner ? -1.07 : -0.90, -0.63 + pose.stride * 0.40
        + (breaker ? -.76 * fore + .31 * pose.recoil : fore * .12));
      line(context, [tailRoot, tailBend, tailTip], skin[0], size * 0.136);
      line(context, [tailRoot, tailBend, tailTip], skin[1], size * 0.078);
      line(context, [tailBend, tailTip], skin[2] + "a9", size * 0.033);
      if (breaker) {
        const club = (u, v) => [tailTip[0] + u * size * side, tailTip[1] + v * size];
        forgedPlate(context, [club(-.25, -.12), club(-.11, -.25), club(.06, -.20), club(.18, -.095),
          club(.12, .16), club(-.07, .23), club(-.23, .135)], skin, palette, size, .21, true);
        line(context, [club(-.15, -.22), club(-.08, -.08), club(-.22, .10)], "#f4bd8b", size * .031);
      }
    }
    const paw = (leg, depth) => {
      const legPhase = fraction(pose.cadence / tau + (leg < 0 ? 0.5 : 0) + depth * 0.24);
      const kneeUp = Math.sin(Math.PI * clamp((legPhase - 0.61) / 0.39, 0, 1)) * pose.stepLength * 0.47;
      const swing = Math.cos(legPhase * tau) * pose.stepLength * (runner ? 1.5 : 0.8);
      const hipX = side * (leg * (low ? 0.23 : 0.13) + depth * 0.08);
      const spread = sentry ? leg * (0.23 - depth * 0.045) : 0;
      const foot = base(hipX + fx * swing + side * (spread + (leg > 0 ? thrust * 0.53 : -0.02)),
        -0.043 + depth * 0.08 + fy * swing * 0.38 - kneeUp);
      const from = at(hipX, low ? -0.45 + bodyDip : -0.57);
      const elbow = [from[0] * 0.39 + foot[0] * 0.61 - side * size * 0.07,
        from[1] * (sentry ? 0.68 : 0.40) + foot[1] * (sentry ? 0.32 : 0.60)];
      articulatedLimb(context, [from, elbow, foot], [size * 0.20, size * 0.133, size * 0.115],
        depth < 0 ? skin[0] : skin[1], "#281e29", depth < 0 ? skin[1] : skin[2]);
      line(context, [foot, [foot[0] + side * size * 0.12, foot[1] + size * 0.023]], "#cdb390", size * 0.032);
    };
    if (low || boss) {
      paw(-1, -1);
      paw(1, -1);
    }
    if (sentry) {
      paw(-1, -.48);
      paw(1, -.48);
    }
    paw(-1, 0);
    paw(1, 0);

    const shoulderRise = boss ? 0.085 : 0;
    forgedPlate(context, [body(-0.44, -0.61), body(-0.36, -0.78), body(-0.15, -0.87 - shoulderRise),
      body(0.13, -0.87 - shoulderRise), body(0.34, -0.72), body(0.41, -0.55),
      body(0.26, -0.44), body(0.07, -0.36), body(-0.24, -0.39), body(-0.40, -0.46)],
    skin, palette, size, 0.37, true);
    if (warden || boss) {
      const ridge = warden ? (actor.guarded ? "#99cad4" : "#aa90bc") : skin[2];
      forgedPlate(context, [body(-0.43, -0.65), body(-0.33, -0.86), body(-0.15, -0.96),
        body(0.08, -0.93), body(0.25, -0.75), body(0.09, -0.64), body(-0.21, -0.60)],
      [skin[0], skin[1], ridge], palette, size, 0.27, true);
      line(context, [body(-0.27, -0.79), body(-0.14, -0.83), body(-0.01, -0.78)], ridge + "be", size * 0.042);
    } else if (mortar || saboteur) {
      const color = actor.windup > 0 ? "#e09365" : skin[1];
      const sacs = saboteur ? [[-.42, -.83, .83], [-.17, -.84, .72], [-.32, -1, 1.03]]
        : [[-.25, -.91, .63], [.065, -.86, .58], [-.10, -.95, 1]];
      for (const [u,v,ratio] of sacs) {
        const sac = body(u, v - fore * 0.12 + pose.recoil * 0.15);
        ellipse(context, ...sac, size * (0.16 + fore * 0.065) * ratio, size * 0.141 * ratio,
          saboteur ? "#aba35c" : color, skin[0], Math.max(.8, size * 0.039));
        ellipse(context, sac[0] - size * 0.050 * ratio, sac[1] - size * 0.051 * ratio,
          size * 0.061 * ratio, size * 0.032 * ratio, "#ffd4a7ae");
      }
    } else {
      line(context, [body(-0.31, -0.70), body(-0.16, -0.76), body(0.02, -0.75)],
        skin[2] + "ad", Math.max(0.7, size * 0.037));
    }
    if (!low || skirmisher) {
      const forearm = armJoints(body(0.16, -0.69), body(0.42 + thrust, -0.34 - fore * 0.25),
        size, -side * 0.68, 0.26, 0.235);
      paintArm(context, forearm, size, skin, "#281e29");
      const forelimb = forearm[2];
      line(context, [forelimb, [forelimb[0] + side * size * 0.105, forelimb[1] + size * 0.05]],
        "#d1b192", size * 0.034);
      if (skirmisher) {
        const claw = (u, v) => [forelimb[0] + side * u * size, forelimb[1] + (v - fore * u * .20) * size];
        forgedPlate(context, [claw(-.035, -.065), claw(.23, -.15), claw(.41, -.266),
          claw(.35, -.054), claw(.17, .061), claw(-.052, .062)],
        ["#513442", "#ad7264", "#ffd3a0"], palette, size, .10, true);
      }
    }

    const rise = sentry ? -0.15 : runner ? 0.065 : boss ? -0.045 : 0;
    const head = (x, y) => at(side * (x + 0.245 + thrust - fore * 0.06),
      y + bodyDip + rise + fy * 0.08);
    const jaw = fore * 0.072 + pose.recoil * 0.038;
    if (runner) {
      forgedPlate(context, [head(-0.195, -0.938), head(-0.36, -1.117), head(-0.211, -1.095),
        head(-0.037, -0.984)], skin, palette, size, .18, true);
      forgedPlate(context, [head(-0.091, -0.951), head(-0.209, -1.160), head(-0.069, -1.134),
        head(0.051, -0.994)], skin, palette, size, .18, true);
    }
    forgedPlate(context, [head(-0.20, -0.77), head(-0.176, -0.96), head(-0.056, -1.031),
      head(0.10, -1.006), head(0.225, -0.927), head(0.26, -0.824), head(0.175, -0.77 + jaw),
      head(0.04, -0.69 + jaw), head(-0.095, -0.73)], skin, palette, size, 0.32, true);
    line(context, [head(0.26, -0.826), head(0.13, -0.800 + jaw * 0.22), head(0.022, -0.772 + jaw * 0.46)],
      "#291e29", size * (sentry ? 0.071 : 0.045));
    if (marksman) {
      for (const lift of [-.048, .050]) {
        forgedPlate(context, [head(.127, -.89 + lift), head(.39, -.949 + lift), head(.71 - pose.recoil * .13, -.915 + lift),
          head(.51, -.864 + lift), head(.191, -.82 + lift)], skin, palette, size, .13, true);
      }
      ellipse(context, ...head(.399, -.938), size * .043, size * .052,
        actor.windup > 0 ? "#ffdc93" : "#7badba", "#403441", .78);
    }
    const eyes = sentry ? [[-.061,-.956,.044],[.045,-.979,.057],[.157,-.947,.037]] : [[.093,-.949,.055]];
    for (const [u,v,radius] of eyes) {
      const eye = head(u,v);
      ellipse(context, ...eye, size * radius, size * radius * .71,
        actor.windup > 0 ? "#ffedaa" : sentry ? "#ff9c60" : "#ffe498", "#3f2b34", Math.max(.7, size * .019));
      ellipse(context, ...head(u + radius * .35, v + radius * .15), size * radius * .39, size * radius * .50, "#392a34");
    }
    if (lancer || boss) {
      const hornReach = lancer ? 0.53 + pose.charge * 0.28 : 0.25;
      forgedPlate(context, [head(-0.074, -0.94), head(-0.05, -1.065), head(hornReach, -1.13 + fore * 0.09),
        head(0.156, -0.959)], ["#543b3d", "#b18f68", "#f1ce9c"], palette, size, 0.15, true);
      if (boss) line(context, [head(-0.14, -0.867), head(-0.31, -1.06), head(-0.38, -1.115)],
        skin[2], size * 0.067);
    }
  }

  function stellarFigure(context, at, pose, actor, size) {
    const active = actor.windup > 0;
    const orbiting = actor.bossMove === "orbit";
    const flare = .10 + pose.anticipation * (orbiting ? .28 : .16);
    const shade = context.createLinearGradient(...at(-.40, -1.15), ...at(.45, -.18));
    shade.addColorStop(0, "#baacdc");
    shade.addColorStop(.38, "#716d9a");
    shade.addColorStop(1, "#2b284b");
    const cloth = [at(0, -1.02), at(.33, -.88), at(.38, -.63), at(.46 + flare, -.29), at(.38, -.13),
      at(.16, -.26), at(.10, -.07), at(-.10, -.24), at(-.37, -.10),
      at(-.47 - flare, -.32), at(-.39, -.66), at(-.31, -.89)];
    poly(context, cloth, shade, "#211d3b", Math.max(1.15, size * .043));
    for (const sign of [-1, 1]) {
      line(context, [at(sign * .16, -.83), at(sign * .18, -.53), at(sign * (.43 + flare), -.28)], "#c2b7eaab", size * .035);
      const hand = at(sign * (.48 + flare), -.55 - pose.anticipation * .20);
      articulatedLimb(context, [at(sign * .23, -.83), at(sign * (.37 + flare), -.68), hand],
        [size * .22, size * .136, size * .09], "#837caa", "#2a2548", "#c7b9e3");
      ellipse(context, ...hand, size * .064, size * .064, active ? "#ffce91" : "#d5c4f4", "#413451", 1.0);
    }
    const core = at(0, -.68);
    poly(context, [at(-.13, -.69), at(0, -.84), at(.13, -.69), at(0, -.49)], "#301f47", "#b2a5dd", 1.05);
    ellipse(context, ...core, size * .057, size * .068, active ? "#ffdfab" : "#e4d7fc");
    const head = at(0, -1.15);
    ellipse(context, ...head, size * (.33 + (orbiting ? pose.anticipation * .13 : 0)),
      size * .19, null, "#a99bd4", Math.max(1.2, size * .025));
    ellipse(context, ...head, size * .192, size * .21, "#181931", "#d6c6ed", Math.max(1.1, size * .033));
    ellipse(context, ...at(.049, -1.184), size * .126, size * .156, "#282448");
    for (const [x, y] of [[-.32, -1.16], [.33, -1.20], [.06, -1.45]]) {
      const tip = at(x, y);
      const r = size * .055;
      poly(context, [[tip[0], tip[1] - r * 1.32], [tip[0] + r, tip[1]], [tip[0], tip[1] + r * 1.32],
        [tip[0] - r, tip[1]]], "#efe0fb");
    }
  }

  function enemy(context, camera, actor, reduced, pose, palette, footing) {
    const [x, y] = point(camera, actor.x, actor.y);
    const unit = camera.unit;
    const boss = actor.kind === "boss";
    const runner = actor.kind === "runner";
    const warden = actor.kind === "warden";
    const mortar = actor.kind === "mortar";
    const gunner = actor.kind === "sentry" || mortar;
    const bossStyle = boss ? actor.bossProfile?.style : undefined;
    const profile = bossStyles[bossStyle];
    const specialty = specialistArt[actor.kind];
    const kit = profile?.kit ?? (specialty ? actor.kind : undefined);
    const size = unit * (profile?.scale ?? specialty?.scale ?? (boss ? 1.74 : runner ? 0.82 : warden ? 1.22 : 1));
    const creature = bossStyle === "beast" || (actor.faction === "creature" && bossStyle !== "engine");
    const skins = creature ? creatureSkins : guardianMetals;
    const armor = profile?.metal ?? skins[actor.kind] ?? skins.guard;
    const accent = actor.bossProfile?.accent;
    const colored = profile && typeof accent === "string" && /^#[0-9a-f]{6}$/i.test(accent)
      ? [armor[0], armor[1], accent] : armor;
    const metal = actor.flash > 0.08 ? ["#4d4046", "#c4a39b", "#fce8d4"] : colored;
    const facing = unitVector(pose.look);
    const [fx] = facing;
    const impact = reduced ? 0 : pose.impact;
    const quick = runner || kit === "skirmisher" || kit === "hunter";
    const ranged = gunner || kit === "marksman" || kit === "engine";
    const action = boss ? bossStances[actor.bossMove] : undefined;
    const force = pose.anticipation * .72 + pose.recoil * .54;
    const lean = pose.recoil * (ranged ? -0.10 : 0.14) + pose.charge * 0.18
      - pose.anticipation * 0.09 - impact * 0.079 + (quick ? pose.gait * 0.14 : 0) + (action?.[0] ?? 0) * force;
    const dip = pose.breath - Math.abs(pose.stride) * (quick ? 0.25 : 0.13)
      + pose.anticipation * (mortar || quick ? 0.105 : 0.062) + pose.charge * 0.09 + (action?.[1] ?? 0) * force;
    const base = (horizontal, vertical) => [x + horizontal * size, y + vertical * size];
    const ground = (horizontal, vertical) => [x + horizontal * size, y + vertical * size - footing * unit];
    const at = (horizontal, vertical) => base(horizontal + fx * lean, vertical + dip);
    contactShadow(context, x, y - footing * unit, size, palette);
    groundRing(context, raisedCamera(camera, footing), actor.x, actor.y, boss ? 0.51 : 0.29, "#fa78560e", "#f394756c", 1.1);
    if (actor.stellar || bossStyle === "stellar" || (boss && palette.landscape === "stars")) {
      stellarFigure(context, at, pose, actor, size);
      return;
    }
    if (actor.shielded) ellipse(context, ...at(0, -0.59), unit * 0.92, unit * 1.27, "#7febff20", "#a1e8f8", 2);
    if (warden && (actor.guarded || pose.guarded > 0.07)) {
      context.save();
      context.globalAlpha *= actor.guarded ? 0.6 + pose.guarded * 0.4 : pose.guarded;
      poly(context, [at(-0.53, -0.63), at(-0.43, -1.15), at(0, -1.43),
        at(0.43, -1.15), at(0.53, -0.63), at(0, -0.16)], "#5fdbed21", "#aef4ff", 1.4);
      context.restore();
    }
    if (creature) {
      burrowCreature(context, ground, at, actor, pose, size, metal, palette, facing, kit);
      return;
    }
    legStride(context, ground, at, pose.charge > 0 ? facing : unitVector(pose.travel),
      pose, size, metal[0], metal[1], pose.charge * 0.15, actor.faction === "human");
    if (gunner && actor.faction !== "human") pressureGunner(context, at, facing, actor, pose, size, metal, palette);
    else compressionGuard(context, at, actor, pose, size, metal, palette, facing, kit);
  }

  function enemyHealthHeight(actor) {
    if (actor.stellar) return 2.86;
    const profile = actor.kind === "boss" && bossStyles[actor.bossProfile?.style];
    if (profile) return profile.height;
    const specialty = specialistArt[actor.kind];
    if (specialty) return specialty.height - (actor.faction === "creature" ? .16 : 0);
    if (actor.faction === "human") {
      return actor.kind === "boss" ? 2.43 : actor.kind === "runner" ? 1.16 : actor.kind === "warden" ? 1.77 : 1.48;
    }
    if (actor.faction === "creature" && actor.kind === "boss") return 2.14;
    return actor.kind === "boss" ? 2.03 : actor.kind === "runner" ? 1.04 : actor.kind === "warden" ? 1.55 : 1.3;
  }

  function enemyHealth(context, camera, actor) {
    const boss = actor.kind === "boss";
    const [x, y] = point(camera, actor.x, actor.y, enemyHealthHeight(actor));
    const width = camera.unit * (boss ? 1.66 : 0.85);
    const height = boss ? 4.4 : 2.8;
    context.fillStyle = "#171620";
    context.fillRect(x - width / 2 - 1, y - 1, width + 2, height + 2);
    context.fillStyle = actor.shielded ? "#a1e8f8" : boss ? "#febc8a" : "#ef866a";
    context.fillRect(x - width / 2, y, width * clamp(actor.hp / actor.maxHp, 0, 1), height);
    if (actor.marked) {
      const top = y - Math.max(7, camera.unit * 0.25);
      const marker = Math.max(3.5, camera.unit * 0.14);
      poly(context, [[x, top - marker], [x + marker, top], [x, top + marker], [x - marker, top]],
        "#da88f3", "#fff1fb", 1.2);
      ellipse(context, x, top, marker * 0.21, marker * 0.21, "#44284d");
    }
    if (actor.gateGuard) {
      const top = y - Math.max(8, camera.unit * 0.28);
      const marker = Math.max(4.0, camera.unit * 0.16);
      const badgeX = actor.marked ? x + marker * 2.5 : x;
      poly(context, [[badgeX - marker, top - marker * 0.84], [badgeX + marker, top - marker * 0.84],
        [badgeX + marker * 0.76, top + marker * 0.27], [badgeX, top + marker * 1.03],
        [badgeX - marker * 0.76, top + marker * 0.27]], "#9f6038", "#fff0bb", 1.2);
      line(context, [[badgeX, top - marker * 0.55], [badgeX, top + marker * 0.36]], "#fff0bb", 1.1);
    }
  }

  function playerHealth(context, camera, actor, pose, elevation, enemies) {
    const local = onSurface(camera, elevation, actor);
    const unit = camera.unit * (camera.width < 500 ? 1.12 : 1);
    const head = heroVisualHeight - (pose?.dashing || 0) * 0.082 - (pose?.breath || 0);
    const [x, anchorY] = point(local, actor.x, actor.y, head * unit / camera.unit);
    const width = Math.max(19, unit * 0.79);
    const height = camera.width < 500 ? 3.1 : 3.8;
    const bars = enemies.map((enemy) => {
      const target = onSurface(camera, elevation, enemy);
      const [barX, barY] = point(target, enemy.x, enemy.y, enemyHealthHeight(enemy));
      return { x: barX, y: barY, half: camera.unit * (enemy.kind === "boss" ? 0.83 : 0.425),
        space: enemy.marked || enemy.gateGuard ? 12 : 5 };
    });
    let y = anchorY - 5.5;
    for (const bar of bars.sort((a, b) => b.y - a.y)) {
      if (Math.abs(bar.x - x) < width / 2 + bar.half + 2 && y + height + 1 > bar.y - bar.space && y < bar.y + 5) {
        y = bar.y - bar.space - height - 2;
      }
    }
    const left = x - width / 2;
    if (y < anchorY - 7.5) line(context, [[x, y + height], [x, anchorY - 1]], "#a5dfc788", 0.75);
    context.fillStyle = "#111c24";
    context.fillRect(left - 1, y - 1, width + 2, height + 2);
    context.fillStyle = "#44665f";
    context.fillRect(left, y, width, height);
    context.fillStyle = "#aceed3";
    context.fillRect(left, y, width * clamp(actor.hp / Math.max(1, actor.maxHp), 0, 1), height);
  }

  function projectile(context, camera, entry, reduced, elevation) {
    if (entry.life <= 0) return;
    const absolute = Number.isFinite(entry.absoluteZ);
    const z = absolute ? entry.absoluteZ : surfaceHeight(elevation, entry.x, entry.y) + 0.56;
    const [x, y] = point(camera, entry.x, entry.y, z);
    const radius = Math.max(2.7, (entry.radius || 0.13) * camera.unit);
    if (!reduced) {
      const trailX = entry.x - (entry.vx || 0) * 0.08;
      const trailY = entry.y - (entry.vy || 0) * 0.08;
      const trailZ = absolute ? z - (entry.vz || 0) * 0.08 : surfaceHeight(elevation, trailX, trailY) + 0.56;
      const trail = point(camera, trailX, trailY, trailZ);
      line(context, [[x, y], trail], "#fb724c90", radius * 1.54);
    }
    ellipse(context, x, y, radius * 1.55, radius * 1.55, "#f8543790");
    ellipse(context, x, y, radius, radius, "#fff1cb", "#ff9557", 1.2);
  }

  function heroProjectile(context, camera, entry, reduced, elevation) {
    if (entry.life <= 0) return;
    const z = Number.isFinite(entry.absoluteZ) ? entry.absoluteZ : surfaceHeight(elevation, entry.x, entry.y) + .56;
    const tip = point(camera, entry.x, entry.y, z);
    const delta = point(camera, entry.x - (entry.vx || 0), entry.y - (entry.vy || 0), z - (entry.vz || 0));
    const length = Math.hypot(tip[0] - delta[0], tip[1] - delta[1]) || 1;
    const dx = (tip[0] - delta[0]) / length, dy = (tip[1] - delta[1]) / length;
    const unit = camera.unit;
    const head = (back, side = 0) => [tip[0] - dx * unit * back - dy * unit * side,
      tip[1] - dy * unit * back + dx * unit * side];
    if (entry.kind === "arrow") {
      line(context, [head(.52), tip], "#2c302e", Math.max(1.8, unit * .091));
      line(context, [head(.50), head(.08)], "#caad78", Math.max(1.0, unit * .045));
      poly(context, [head(.45, -.074), head(.31, -.015), head(.45, .074), head(.51)], "#9cd4bc");
      poly(context, [tip, head(.135, .049), head(.096), head(.135, -.049)], "#f4ecd4", "#4e5b54", .62);
    } else if (entry.kind === "spell") {
      const radius = Math.max(2.5, unit * .095);
      if (!reduced) line(context, [head(.41), tip], "#72e0ff76", radius * 1.36);
      ellipse(context, ...tip, radius * 1.55, radius * 1.43, "#7fe0ff73");
      ellipse(context, ...tip, radius, radius, "#d6fff2", "#6fc8e4", 1.1);
    }
  }

  function rewardEffect(context, camera, entry, alpha) {
    const progress = 1 - alpha;
    const level = entry.kind === "level";
    const color = level ? "#fff1a3" : "#e8bbff";
    const { unit } = camera;
    context.globalAlpha = Math.min(1, alpha * 1.6);
    groundRing(context, camera, entry.x, entry.y, 0.35 + progress * (level ? 1.2 : 0.70),
      level ? "#ffe58c34" : "#ba79f636", color, 1.8);

    if (level) {
      for (const [dx, dy] of [[0.37, 0.28], [-0.37, -0.28], [-0.32, 0.37], [0.32, -0.37]]) {
        const x = entry.x + dx;
        const y = entry.y + dy;
        line(context, [point(camera, x, y, progress * 0.58),
          point(camera, x, y, 1.68 + progress * 0.6)], "#ffd05862", unit * 0.075);
        line(context, [point(camera, x, y, 0.37 + progress * 0.7),
          point(camera, x, y, 1.50 + progress * 0.7)], color, Math.max(1, unit * 0.025));
      }
    }

    const [x, y] = point(camera, entry.x, entry.y, (level ? 1.22 : 0.58) + progress * 0.92);
    const halfSize = unit * (level ? 0.18 : 0.16);
    poly(context, [[x, y - halfSize * 1.38], [x + halfSize, y], [x, y + halfSize * 1.38],
      [x - halfSize, y]], level ? "#ffe29046" : "#bc83ef9a", color, 1.4);
    for (let index = 0; index < 6; index++) {
      const theta = index / 6 * tau;
      const radius = unit * (0.32 + progress * 0.43);
      ellipse(context, x + Math.cos(theta) * radius, y + Math.sin(theta) * radius * 0.58, 1.6, 1.6, color);
    }
  }

  function effect(context, camera, entry, reduced) {
    const alpha = clamp(entry.life / (entry.maxLife || 0.26), 0, 1);
    if (alpha === 0) return;
    const [x, y] = point(camera, entry.x, entry.y, 0.46);
    const unit = camera.unit;
    context.save();
    context.globalAlpha = alpha;
    if (entry.kind === "slash") {
      const angle = Math.atan2(entry.facingY ?? 0, entry.facingX ?? 1);
      const arc = [];
      for (let part = 0; part <= 10; part++) {
        const theta = angle - 0.91 + part * 0.182;
        const radius = 0.82 + (1 - alpha) * 0.57;
        arc.push(point(camera, entry.x + Math.cos(theta) * radius, entry.y + Math.sin(theta) * radius, 0.50));
      }
      if (!reduced) line(context, arc, "#58d3b06c", unit * 0.23);
      line(context, arc, "#d8fff0", Math.max(1.6, unit * 0.069));
    } else if (entry.kind === "dash") {
      groundRing(context, camera, entry.x, entry.y, 0.35 + (1 - alpha) * 0.4, "#9feac624", "#b8ffdb", 1.2);
    } else if (entry.kind === "parry") {
      const radius = reduced ? .67 : .44 + (1 - alpha) * .55;
      groundRing(context, camera, entry.x, entry.y, radius, "#8fe6ff27", "#c9f5ff", 2.15);
      const [px, py] = point(camera, entry.x, entry.y, .68);
      for (const angle of [-Math.PI * .72, -.88, .55, 2.36]) {
        const at = (u) => [px + Math.cos(angle) * unit * u, py + Math.sin(angle) * unit * u * .79];
        line(context, [at(radius * .52), at(radius * .96)], "#80ddff", 1.65);
      }
    } else if (entry.kind === "danger") {
      groundRing(context, camera, entry.x, entry.y, 0.6 + (1 - alpha) * 0.67, "#f8905a40", "#ffad85", 1.9);
    } else if (entry.kind === "level" || entry.kind === "loot") {
      rewardEffect(context, camera, entry, alpha);
    } else if (entry.kind === "charge") {
      dangerRing(context, camera, entry.x, entry.y, 0.42 + alpha * 0.68, "#fb573622", "#ffc296", 1.7, true);
    } else if (entry.kind === "hit" || entry.kind === "pickup" || entry.kind === "fall") {
      const color = entry.kind === "hit" ? "#ffe1a5" : entry.kind === "fall" ? "#d8a492" : "#a3faff";
      const count = reduced ? 4 : entry.kind === "fall" ? 10 : 7;
      if (!reduced && entry.kind === "hit") ellipse(context, x, y, unit * 0.19, unit * 0.15, "#fff2cf");
      if (entry.kind === "fall") groundRing(context, camera, entry.x, entry.y,
        0.30 + (1 - alpha) * 0.38, "#60444144", "#b77464", 1.15);
      for (let index = 0; index < count; index++) {
        const theta = index / count * tau;
        const near = (0.15 + (1 - alpha) * 0.21) * unit;
        const far = (0.28 + (1 - alpha) * 0.42) * unit;
        const ray = (radius) => [x + Math.cos(theta) * radius, y + Math.sin(theta) * radius * 0.74];
        line(context, [ray(near), ray(far)], color, 1.45);
      }
    }
    context.restore();
  }

  function shelterBrushes(palette, seconds, reduced) {
    return { point, rectangle, poly, line, ellipse, contactShadow, palette, seconds, reduced };
  }

  function isInView(camera, entry, side, above, below) {
    const unit = camera.unit;
    const x = camera.x + (entry.x - entry.y) * unit;
    const y = camera.y + (entry.x + entry.y) * unit * slope;
    return x + side * unit >= -2 && x - side * unit <= camera.width + 2
      && y + below * unit >= -2 && y - above * unit <= camera.height + 2;
  }

  function drawArenaObjects(context, camera, objects, state, palette, theme, seconds, reduced, brushes) {
    for (const object of objects) {
      const height = object.height ?? 0;
      const local = raisedCamera(camera, height);
      const clipped = object.occlusionMasks?.length;
      if (clipped) {
        context.save();
        clipActorOcclusion(context, camera, object.occlusionMasks);
      }
      switch (object.type) {
        case "obstacle": {
          const span = (object.w + object.h) * 0.5;
          if (!object.fixture && !isInView(local, object, span + 0.8, span * slope + 1.8, span * slope + 0.6)) break;
          obstacle(context, local, object, palette, seconds, theme, reduced);
          break;
        }
        case "story-gate": {
          const { span, height } = storyGateSize(object);
          if (!isInView(local, object, span + .6, height + 1.6, span * slope + .9)) break;
          rollingStoryGate(context, local, object, palette);
          break;
        }
        case "story-actor":
          if (isInView(local, object, 2.1, 2.4, 1.1)) drawStoryActor(context, local, object, palette, state.elevation, reduced);
          break;
        case "story": storyApparatus(context, local, object, palette, seconds, reduced); break;
        case "incident": incidentApparatus(context, local, object, palette, seconds, reduced); break;
        case "station": window.TowerShelter.station(context, local, object, brushes); break;
        case "shelter-decoration": window.TowerShelter.decoration(context, local, object, brushes, state.shelter); break;
        case "item": item(context, local, object, seconds, palette); break;
        case "enemy":
          if (isInView(local, object, 3.2, 3.6, 1.5)) {
            enemy(context, local, object, reduced, object.pose, palette, reduced ? 0 : stairFooting(state.elevation, object));
          }
          break;
        case "player": {
          const footing = reduced ? 0 : stairFooting(state.elevation, object);
          player(context, local, object, seconds, reduced, object.pose, palette, state.incident?.payload, footing);
          break;
        }
      }
      if (clipped) context.restore();
    }
  }

  function isActor(entry) {
    return entry.type === "player" || entry.type === "enemy" || entry.type === "story-actor";
  }

  function isWall(entry) {
    return entry.type === "obstacle" || entry.type === "story-gate" || entry.kind === "exit";
  }

  function sortShelterScenery(state, scenery) {
    const cached = shelterSceneryOrder.get(state);
    if (cached?.walls === state.obstacles && cached.stations === state.stations && cached.decor === state.shelter.decor
        && cached.count === scenery.length) {
      return cached.order.map((index) => scenery[index]);
    }
    const bounds = scenery.map((object) => {
      if (object.type === "station") {
        if (object.kind === "workbench") return centeredBounds({ ...object, w: 1.22, h: .70 });
        const footprint = state.obstacles.find((wall) => wall.shelterDecor && wall.x === object.x && wall.y === object.y);
        return centeredBounds(footprint ?? { ...object, w: 1.31, h: object.kind === "departure" ? .30 : .70 });
      }
      // The raised roof extends one lip beyond the collidable house on each side.
      if (object.design === "house") return centeredBounds({ ...object, w: object.w + .24, h: object.h + .24 });
      return centeredBounds({ ...object, w: object.w ?? 0, h: object.h ?? 0 });
    });
    const before = bounds.map(() => []);
    const pending = bounds.map(() => 0);
    for (let a = 0; a < bounds.length; a++) {
      const first = bounds[a];
      for (let b = a + 1; b < bounds.length; b++) {
        const second = bounds[b];
        if (first.right - first.back < second.left - second.front || second.right - second.back < first.left - first.front) continue;
        const firstBehind = first.right <= second.left + .01 || first.front <= second.back + .01;
        const secondBehind = second.right <= first.left + .01 || second.front <= first.back + .01;
        if (firstBehind === secondBehind) continue;
        const rear = firstBehind ? a : b;
        const front = firstBehind ? b : a;
        before[rear].push(front);
        pending[front]++;
      }
    }
    const order = [];
    while (order.length < scenery.length) {
      // Intersecting or cyclic silhouettes keep the existing centre-depth priority as a fallback.
      let next = pending.indexOf(0);
      if (next < 0) next = pending.findIndex((count) => count !== Infinity);
      pending[next] = Infinity;
      order.push(next);
      for (const front of before[next]) pending[front]--;
    }
    shelterSceneryOrder.set(state, { walls: state.obstacles, stations: state.stations, decor: state.shelter.decor,
      count: scenery.length, order });
    return order.map((index) => scenery[index]);
  }

  function drawArenaCues(context, camera, state, enemies, elevation, seconds, layer) {
    const elevated = (entry) => surfaceHeight(elevation, entry.x, entry.y) > 0.04;
    const matches = (entry) => Boolean(layer) === elevated(entry);
    const hazards = layer === undefined ? state.hazardTiles : state.hazardTiles?.filter(matches);
    const targets = layer === undefined ? state.bossTargets : state.bossTargets?.filter(matches);
    const shells = layer === undefined ? state.mortarTargets : state.mortarTargets?.filter(matches);
    const zone = state.holdZone;
    if (zone && (layer === undefined || matches(zone))) holdArea(context, onSurface(camera, elevation, zone), zone);
    hazardTiles(context, camera, hazards, seconds, elevation);
    bossTargets(context, camera, targets, seconds, elevation);
    bossTargets(context, camera, shells, seconds, elevation);
    for (const enemy of enemies) {
      if (enemy.kind === "boss" && enemy.bossMove && state.bossTargets?.length) continue;
      const crossTier = enemy.kind === "sentry" || enemy.kind === "marksman";
      if (layer === undefined || (crossTier ? layer === 1 : matches(enemy))) {
        enemyTelegraph(context, camera, enemy, elevation);
      }
    }
  }

  function draw(canvas, state, now = performance.now()) {
    const bounds = canvas.getBoundingClientRect();
    if (!(bounds.width > 0 && bounds.height > 0)) return;
    const ratio = clamp(window.devicePixelRatio || 1, 1, 2);
    const pixelWidth = Math.round(bounds.width * ratio);
    const pixelHeight = Math.round(bounds.height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const context = canvas.getContext("2d");
    context.setTransform(pixelWidth / bounds.width, 0, 0, pixelHeight / bounds.height, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    const reduced = state.reducedMotion === true || motionPreference?.matches === true;
    const story = state.mode === "story";
    const quietDoor = state.mode === "shelter" && !state.landing;
    if (quietDoor || state.revealed === false || !state.map) {
      frameCameras.delete(canvas);
      motionFrames.delete(canvas);
      sealedRoom(context, bounds.width, bounds.height, state, reduced || story, quietDoor);
      return;
    }
    const fallback = fallbackThemes[(Math.max(1, state.floor || 1) - 1) % fallbackThemes.length];
    const theme = Object.hasOwn(biomes, state.theme) ? state.theme : fallback;
    const chapter = chapterEnvironments.findIndex(({ through }) => (state.floor || 1) <= through);
    const palette = environmentalPalettes[theme][chapter];
    const camera = frameCamera(canvas, bounds, state, theme, now, reduced);
    const motion = beginMotionFrame(canvas, state, now, reduced);
    const seconds = reduced ? 0 : now / 1000;
    const elevation = state.elevation;
    const enemies = state.combatComplete || story ? [] : (state.enemies ?? []).filter((entry) => entry.hp > 0);
    const brushes = state.shelter ? shelterBrushes(palette, seconds, reduced) : null;
    const objects = [
      ...(state.obstacles ?? []).filter((entry) => !entry.shelterDecor && !entry.gateDecor && !(state.storyGate && entry.storyGate))
        .map((entry) => ({ ...entry, type: "obstacle" })),
      ...(state.items ?? []).map((entry) => ({ ...entry, type: "item" })),
      ...(state.shelter?.decor ?? []).map((entry) => ({ ...entry, type: "shelter-decoration" })),
      ...(state.stations ?? []).map((entry) => ({ ...entry, type: "station" })),
      ...enemies.map((entry, index) => ({ ...entry, type: "enemy", pose: actorPose(motion, entry, entry.id ?? index) })),
    ];
    if (state.gateMarker) objects.push({ ...state.gateMarker, type: "item", kind: "exit" });
    if (state.storyGate) {
      const { height: apertureHeight, ...gate } = state.storyGate;
      objects.push({ ...gate, apertureHeight, type: "story-gate" });
    }
    for (const [index, actor] of (state.storyActors ?? []).entries()) {
      objects.push({ ...actor, type: "story-actor", pose: actorPose(motion, actor, `story:${actor.id ?? index}`) });
    }
    const incidentPoints = state.incident?.points ?? [];
    const keepReservoirValve = state.storyPoint && state.incident?.reservoir && !incidentPoints.some((entry) =>
      Math.hypot(entry.x - state.storyPoint.x, entry.y - state.storyPoint.y) < 1.25);
    if (state.storyPoint && (!state.incident || keepReservoirValve)) {
      const marker = state.storyPoint;
      objects.push({ ...marker, ...storyDevicePosition(marker), type: "story" });
    }
    for (const entry of incidentPoints) {
      if (entry.device !== "pressure") objects.push({ ...entry, type: "incident" });
    }
    if (state.player) objects.push({ ...state.player, type: "player", pose: actorPose(motion, state.player, "player") });
    const painterDepth = (entry) => entry.x + entry.y + (entry.kind === "exit" ? 0.64 : 0);
    objects.sort((a, b) => painterDepth(a) - painterDepth(b));
    background(context, canvas, camera, palette, theme, seconds, state.hazard, reduced);
    paintTerrain(context, canvas, camera, state, palette, theme, ratio);
    drawTerrain(context, camera, state.terrain, seconds, reduced, elevation, elevation ? 0 : undefined);
    clinicPipes(context, camera, state, palette);
    if (brushes) window.TowerShelter.dress(context, camera, state, brushes);
    paintGateMarkings(context, camera, state, palette, elevation, elevation ? 0 : undefined);
    incidentGround(context, camera, state, palette, elevation ? 0 : undefined);
    perimeterMotion(context, camera, state, palette, theme, seconds, reduced);
    stageArrival(context, camera, state, palette, theme, reduced);
    const rear = [];
    const scenery = [];
    const actors = [];
    for (const object of objects) {
      object.height = surfaceHeight(elevation, object.x, object.y);
      if (isActor(object)) actors.push(object);
      else (terraceCover(camera, elevation, object) ? rear : scenery).push(object);
    }
    const shelterShapes = state.shelter ? window.TowerShelter?.occlusionShapes?.(state.shelter, state.stations ?? []) ?? [] : [];
    const volumes = occlusionVolumes(objects.filter(isWall), elevation, palette, shelterShapes);
    const visibleEnemies = [];
    const visibleStoryActors = [];
    let visiblePlayer;
    for (const object of actors) {
      object.occlusionMasks = actorOcclusionMasks(camera, object, volumes);
      if (!actorVisible(camera, object, object.occlusionMasks)) continue;
      if (object.type === "enemy") visibleEnemies.push(object);
      else if (object.type === "story-actor") visibleStoryActors.push(object);
      else visiblePlayer = object;
    }
    if (elevation) {
      terraceShadows(context, camera, elevation);
      drawArenaCues(context, camera, state, enemies, elevation, seconds, 0);
      drawArenaObjects(context, camera, rear, state, palette, theme, seconds, reduced, brushes);
      paintTerraces(context, canvas, camera, state, palette, theme, ratio);
      drawTerrain(context, camera, state.terrain, seconds, reduced, elevation, 1);
      paintGateMarkings(context, camera, state, palette, elevation, 1);
      incidentGround(context, camera, state, palette, 1);
    }
    drawArenaCues(context, camera, state, enemies, elevation, seconds, elevation ? 1 : undefined);
    const orderedScenery = state.shelter ? sortShelterScenery(state, scenery) : scenery;
    drawArenaObjects(context, camera, orderedScenery, state, palette, theme, seconds, reduced, brushes);
    drawArenaObjects(context, camera, actors, state, palette, theme, seconds, reduced, brushes);
    for (const entry of state.projectiles ?? []) projectile(context, camera, entry, reduced, elevation);
    for (const entry of state.playerProjectiles ?? []) heroProjectile(context, camera, entry, reduced, elevation);
    for (const entry of visibleEnemies) {
      context.save();
      clipActorOcclusion(context, camera, entry.occlusionMasks);
      enemyHealth(context, raisedCamera(camera, entry.height), entry);
      context.restore();
    }
    if (state.mode === "playing" && visiblePlayer?.hp > 0) {
      context.save();
      clipActorOcclusion(context, camera, visiblePlayer.occlusionMasks);
      playerHealth(context, camera, visiblePlayer, visiblePlayer.pose, elevation, visibleEnemies);
      context.restore();
    }
    const swingVisible = state.player && (state.player.swingLife ?? state.player.attackFlash) > 0;
    for (const entry of state.effects ?? []) {
      if (entry.kind !== "slash" || !swingVisible) effect(context, onSurface(camera, elevation, entry), entry, reduced);
    }
    if (state.mode === "playing") objectiveLabels(context, camera, state, visibleStoryActors);
    if (story) storyLighting(context, camera, state);
  }

  function screenToWorld(canvas, clientX, clientY, state) {
    const bounds = canvas.getBoundingClientRect();
    if (!(bounds.width > 0 && bounds.height > 0) || state.revealed === false || !state.map) return { x: 0, y: 0 };
    const elevation = state.elevation;
    const painted = frameCameras.get(canvas);
    const currentFrame = painted?.camera.width === bounds.width && painted.camera.height === bounds.height
      && painted.mapWidth === state.map.width && painted.mapHeight === state.map.height
      && painted.floor === state.floor && painted.elevation === elevation;
    const camera = currentFrame ? painted.camera : cameraFor(bounds.width, bounds.height, state.map, state.player, elevation);
    const ground = basePlanePoint(camera, clientX - bounds.left, clientY - bounds.top);
    if (!elevation) return ground;
    const { x, y } = surfaceHit(elevation, ground, true);
    return { x, y };
  }

  function storyDeviceHit(canvas, clientX, clientY, state, marker = state.storyPoint) {
    const camera = frameCameras.get(canvas)?.camera;
    if (!marker?.active || marker.done || !camera || state.revealed === false) return false;
    const bounds = canvas.getBoundingClientRect();
    const device = storyDevicePosition(marker);
    const height = marker.device === "pressure" ? .09 : marker.device === "cartridge" ? .33 : .78;
    const [x, y] = point(onSurface(camera, state.elevation, device), device.x, device.y, height);
    const radius = marker.device === "pressure" ? .82 : .53;
    return Math.hypot(clientX - bounds.left - x, clientY - bounds.top - y) <= Math.max(16, camera.unit * radius);
  }

  window.TowerRenderer = { draw, screenToWorld, storyDeviceHit };
})();
