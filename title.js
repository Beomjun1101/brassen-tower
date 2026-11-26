(() => {
  "use strict";

  const frames = new WeakMap();
  const tau = Math.PI * 2;
  const clamp = (number, low, high) => Math.max(low, Math.min(high, number));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const noise = (seed) => {
    const value = Math.sin(seed * 71.163 + 7.912) * 21485.634;
    return value - Math.floor(value);
  };
  let grain;

  function polygon(context, points, fill, edge, weight = 1) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.closePath();
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (edge) {
      context.lineWidth = weight;
      context.strokeStyle = edge;
      context.stroke();
    }
  }

  function stroke(context, points, color, weight = 1) {
    context.beginPath();
    context.moveTo(...points[0]);
    for (const point of points.slice(1)) context.lineTo(...point);
    context.strokeStyle = color;
    context.lineWidth = weight;
    context.stroke();
  }

  function oval(context, x, y, width, height, fill, edge, weight = 1) {
    context.beginPath();
    context.ellipse(x, y, width, height, 0, 0, tau);
    if (fill) {
      context.fillStyle = fill;
      context.fill();
    }
    if (edge) {
      context.strokeStyle = edge;
      context.lineWidth = weight;
      context.stroke();
    }
  }

  function linear(context, x, y, tx, ty, colors) {
    const gradient = context.createLinearGradient(x, y, tx, ty);
    for (const [offset, color] of colors) gradient.addColorStop(offset, color);
    return gradient;
  }

  function haze(context, x, y, width, height, color, power) {
    context.save();
    context.translate(x, y);
    context.scale(width, height);
    const colorField = context.createRadialGradient(0, 0, 0, 0, 0, 1);
    colorField.addColorStop(0, color);
    colorField.addColorStop(1, "#00000000");
    context.globalAlpha *= power;
    context.fillStyle = colorField;
    context.fillRect(-1, -1, 2, 2);
    context.restore();
  }

  function makeScene(width, height) {
    const narrow = width <= 614;
    const unit = Math.min(height / 680, width / (narrow ? 454 : 560));
    const x = width * (narrow ? 0.565 : 0.722);
    const y = height * (narrow ? 0.55 : 0.615);
    return { width, height, narrow, unit, x, y, left: -x / unit, right: (width - x) / unit,
      top: -y / unit, bottom: (height - y) / unit, near: narrow ? 199 : 322,
      shore: narrow ? 35 : -170, hero: narrow ? 0.28 : 0.37 };
  }

  function sceneTransform(context, scene) {
    context.translate(scene.x, scene.y);
    context.scale(scene.unit, scene.unit);
  }

  function grainPattern(context, scene) {
    if (!grain) {
      grain = document.createElement("canvas");
      grain.width = 168;
      grain.height = 168;
      const source = grain.getContext("2d");
      const pixels = source.createImageData(grain.width, grain.height);
      for (let index = 0; index < pixels.data.length; index += 4) {
        const shade = Math.round(32 + noise(index + 412) * 191);
        pixels.data[index] = shade * 0.8;
        pixels.data[index + 1] = shade;
        pixels.data[index + 2] = shade;
        pixels.data[index + 3] = 18 + noise(index + 173) * 34;
      }
      source.putImageData(pixels, 0, 0);
    }
    context.save();
    context.globalAlpha = 0.26;
    context.globalCompositeOperation = "soft-light";
    context.fillStyle = context.createPattern(grain, "repeat");
    context.fillRect(scene.left, scene.top, scene.right - scene.left, scene.bottom - scene.top);
    context.restore();
  }

  function weather(context, points, box, seed, count) {
    context.save();
    polygon(context, points);
    context.clip();
    for (let i = 0; i < count; i++) {
      const x = box.x + noise(seed + i * 8) * box.width;
      const y = box.y + noise(seed + i * 8 + 1) * box.height;
      const length = 2 + noise(seed + i * 8 + 2) ** 2 * 31;
      const width = 0.7 + noise(seed + i * 8 + 3) * 3;
      const color = i % 3 ? "#182326" : "#8da196";
      context.globalAlpha = 0.035 + noise(seed + i * 8 + 6) * 0.18;
      polygon(context, [[x, y], [x + width * 0.77, y + 1], [x + width, y + length * 0.39],
        [x + width * 0.42, y + length], [x, y + length * 0.83]], color);
    }
    context.restore();
  }

  function backdrop(context, scene) {
    const { left, right, top, bottom } = scene;
    context.fillStyle = linear(context, 0, top, 0, bottom, [
      [0, "#0b1922"], [0.26, "#14272c"], [0.61, "#162c2e"], [1, "#0a1720"],
    ]);
    context.fillRect(left, top, right - left, bottom - top);
    haze(context, 11, -200, 478, 354, "#375454", 0.57);
    haze(context, 62, -378, 248, 148, "#54645c", 0.45);

    const farBank = [[left, -111], [left + 68, -97], [-594, -104], [-558, -83], [-502, -82],
      [-458, -94], [-376, -72], [-264, -70], [-210, -48], [right, -45], [right, 25], [left, 25]];
    polygon(context, farBank, "#132329");
    polygon(context, [[left, -45], [-552, -37], [-532, -22], [-419, -28], [-365, -17],
      [-271, -17], [-221, -9], [right, 5], [right, 30], [left, 30]], "#102227");

    context.fillStyle = linear(context, 0, 4, 0, bottom, [
      [0, "#214148"], [0.45, "#1c4149"], [1, "#0b2029"],
    ]);
    context.fillRect(left, 5, right - left, bottom - 5);
    haze(context, 66, 40, 234, 44, "#3d6666", 0.40);
    haze(context, -292, 44, 303, 48, "#487471", 0.22);
    haze(context, 6, 39, 81, 89, "#ab7844", 0.15);

    for (let i = 0; i < 112; i++) {
      const phase = noise(i * 8 + 22) ** 1.72;
      const x = mix(left, right, noise(i * 8 + 23));
      const y = 11 + (bottom - 11) * phase;
      const length = (8 + noise(i * 8 + 24) * 75) * (0.12 + phase * 0.84);
      context.globalAlpha = (0.08 + noise(i * 8 + 25) * 0.25) * (x < -175 ? 0.38 : 0.92);
      stroke(context, [[x - length * 0.45, y], [x, y - 0.6], [x + length * 0.56, y + 0.1]],
        i % 4 ? "#53878a" : "#81aaa1", 0.6 + phase * 0.42);
    }
    context.globalAlpha = 1;
    grainPattern(context, scene);
  }

  function archPath(context, x, roof, width, foot) {
    const spring = roof + width * 0.51;
    context.beginPath();
    context.moveTo(x - width * 0.5, foot);
    context.lineTo(x - width * 0.5, spring);
    context.bezierCurveTo(x - width * 0.5, roof + width * 0.18, x - width * 0.22, roof, x, roof);
    context.bezierCurveTo(x + width * 0.22, roof, x + width * 0.5, roof + width * 0.18, x + width * 0.5, spring);
    context.lineTo(x + width * 0.5, foot);
    context.closePath();
  }

  function arch(context, x, roof, width, foot, fill, edge, weight = 1) {
    archPath(context, x, roof, width, foot);
    context.fillStyle = fill;
    context.fill();
    if (edge) {
      context.strokeStyle = edge;
      context.lineWidth = weight;
      context.stroke();
    }
  }

  function damWings(context, scene) {
    const { left, right } = scene;
    const wing = [[Math.max(left, -650), -27], [-493, -51], [-421, -61], [-373, -68],
      [-353, -117], [-223, -138], [-165, -147], [-163, 3], [Math.max(left, -650), 1]];
    polygon(context, wing, linear(context, -551, -98, -180, 4, [
      [0, "#15272c"], [0.68, "#1d3539"], [1, "#192b30"],
    ]));
    const wall = [[128, -111], [190, -130], [right + 15, -82], [right + 15, 13], [134, 6]];
    polygon(context, wall, linear(context, 170, -117, 280, 20, [
      [0, "#294246"], [0.55, "#263e3f"], [1, "#182b32"],
    ]), "#465857", 1);
    for (const [x, roof, span, foot, light] of [
      [-235, -104, 62, 3, "#3a5653"], [-306, -88, 51, 2, "#314a49"],
      [-369, -57, 36, 3, "#273f43"], [-418, -45, 28, 2, "#233a3d"],
      [198, -88, 67, 10, "#526864"], [267, -76, 49, 13, "#3e5655"],
      [317, -61, 39, 15, "#354b4d"], [359, -52, 29, 15, "#304549"],
    ]) {
      arch(context, x, roof, span, foot, "#1a2a2d", light, 2);
      arch(context, x, roof + 8, span - 14, foot, "#0f1e26", "#293b40", 1.4);
      stroke(context, [[x - span / 2, foot], [x + span / 2, foot]], "#67908a44", 1.2);
    }
    stroke(context, [[133, -119], [189, -138], [right + 4, -91]], "#58706a", 2);
    stroke(context, [[-349, -118], [-221, -139], [-158, -152]], "#5c77735a", 1.8);
    weather(context, wall, { x: 134, y: -136, width: 330, height: 149 }, 940, 96);
  }

  function pipe(context, points, diameter, wet = false) {
    context.save();
    context.lineJoin = "round";
    context.lineCap = "round";
    stroke(context, points, "#0c1b24", diameter + 4.5);
    stroke(context, points, wet ? "#49655e" : "#705949", diameter);
    const edge = points.map(([x, y]) => [x - diameter * 0.25, y - diameter * 0.22]);
    stroke(context, edge, wet ? "#91a39a" : "#b28d62", Math.max(1, diameter * 0.19));
    context.restore();
  }

  function towerBody(context, scene) {
    const face = [[-145, 11], [-142, -90], [-108, -130], [-96, -408], [-75, scene.top - 21],
      [68, scene.top - 31], [95, -418], [108, -142], [143, -105], [143, 10]];
    const side = [[143, 10], [143, -105], [108, -142], [95, -418], [68, scene.top - 31],
      [153, scene.top - 45], [176, -436], [181, -155], [211, -111], [207, -13]];
    polygon(context, side, linear(context, 103, -389, 209, -9, [
      [0, "#293d3d"], [0.64, "#1c3035"], [1, "#13252d"],
    ]));
    polygon(context, face, linear(context, -132, -429, 157, -77, [
      [0, "#4f675c"], [0.32, "#476057"], [0.67, "#344e4b"], [1, "#25373a"],
    ]), "#576a62", 1.25);
    weather(context, face, { x: -148, y: scene.top - 30, width: 295, height: 565 }, 35, 260);
    weather(context, side, { x: 75, y: scene.top - 30, width: 140, height: 542 }, 33, 135);
    stroke(context, [[142, 8], [142, -104], [107, -141], [94, -416], [69, scene.top - 31]], "#8b9d8659", 1.6);

    const buttress = (side) => {
      const from = side * 123;
      const into = side * 145;
      const base = [[into, 8], [into, -131], [side * 102, -287], [side * 88, -463],
        [side * 75, -459], [side * 88, -278], [from, -110], [from, 11]];
      polygon(context, base, side < 0 ? "#354a48" : "#263e42", "#536762", 1.25);
      stroke(context, [[from, 5], [from, -110], [side * 88, -278], [side * 75, -459]],
        side < 0 ? "#71857a" : "#55736a", 2.2);
      for (const [y, setback] of [[-63, 3], [-143, 10], [-257, 29], [-349, 42]]) {
        const wallX = side * (139 - setback);
        stroke(context, [[wallX, y - 1], [wallX - side * 14, y + 4]], "#83908569", 1.7);
      }
    };
    buttress(-1);
    buttress(1);

    for (const [index, y] of [-86, -164, -239, -311, -374, -429, -475].entries()) {
      const width = 130 - index * 7.55;
      polygon(context, [[-width - 8, y + 3], [width + 12, y + 3], [width + 8, y + 23], [-width + 1, y + 25]],
        linear(context, 0, y + 3, 0, y + 28, [[0, "#07161ad6"], [0.47, "#0d202779"], [1, "#10202600"]]));
      polygon(context, [[width + 12, y + 3], [width + 56, y - 13], [width + 57, y + 1], [width + 8, y + 23]],
        "#091b235e");
      const edge = [-width - 10, y];
      const corner = [width + 15, y];
      const far = [width + 54, y - 15];
      polygon(context, [edge, corner, far, [width - 3, y - 16], [-width + 4, y - 11]],
        linear(context, -width, y - 13, width, y, [[0, "#6a8070"], [0.58, "#4f655d"], [1, "#405a55"]]), "#738475", 1);
      polygon(context, [edge, corner, [corner[0], y + 7], [-width - 10, y + 7]], "#394e49", "#19292c", 1.1);
      polygon(context, [corner, far, [far[0], y - 9], [corner[0], y + 7]], "#233a3e", "#1a2a30", 1.1);
      stroke(context, [edge, corner], "#a2a98a82", 1.0);
      for (const fraction of [-0.69, -0.38, 0.33, 0.60, 0.85]) {
        const x = width * fraction;
        polygon(context, [[x - 5, y + 8], [x + 6, y + 8], [x + 1, y + 19], [x - 5, y + 16]], "#1d3439", "#13262d", 0.85);
        stroke(context, [[x - 4, y + 9], [x - 4, y + 15]], "#7990816e", 0.75);
      }

      if (index > 0) {
        const glassY = y + 29;
        for (const x of [-39, -14, 11, 36]) {
          arch(context, x, glassY, 12, glassY + 27, "#152830", "#425953", 1);
          if ((x === 11 && index > 2) || (x === -14 && index === 3)) {
            arch(context, x, glassY + 4, 5.8, glassY + 24, "#95714e");
          }
        }
      }
    }

    pipe(context, [[123, -21], [160, -46], [160, -175], [150, -204],
      [150, -298], [140, -326], [140, -431]], 13);
    pipe(context, [[139, -19], [181, -43], [181, -184], [175, -198],
      [175, -266], [159, -292], [159, -414]], 7.2, true);
    for (const y of [-47, -105, -142, -216, -251, -335, -380]) {
      const x = y > -177 ? 160 : y > -300 ? 150 : 140;
      polygon(context, [[x - 9, y - 3], [x + 8, y - 4], [x + 8, y + 4], [x - 9, y + 5]], "#594b41", "#a08465", 0.8);
    }
    const crown = [[-100, -477], [-65, -516], [61, -516], [122, -538], [146, -510],
      [111, -488], [81, -475], [-72, -470]];
    polygon(context, crown, "#304443", "#738479", 1.25);
    stroke(context, [[-70, -514], [-73, -540], [-54, -550], [-40, -543]], "#82918585", 1.8);
    stroke(context, [[31, -520], [33, -551], [40, -557], [44, -551]], "#80918b67", 1.65);
  }

  function pressureGate(context) {
    const foot = 7;
    arch(context, 0, -239, 167, foot, "#293c3f", "#779088", 2.2);
    arch(context, 1, -226, 149, foot, "#1c2b30", "#17252c", 2.5);
    arch(context, 0, -219, 132, foot, linear(context, -65, -219, 64, -3, [
      [0, "#705647"], [0.39, "#3f3b37"], [0.62, "#20292e"], [1, "#3e3633"],
    ]), "#987651", 2.1);
    arch(context, 0, -207, 116, foot, "#1c272b", "#624f42", 1.4);
    context.save();
    archPath(context, 0, -206, 109, foot);
    context.clip();
    context.fillStyle = linear(context, -56, 0, 56, 0, [
      [0, "#2a3637"], [0.43, "#544438"], [0.49, "#67503b"], [0.52, "#3b302c"],
      [0.83, "#2c3131"], [1, "#292c2d"],
    ]);
    context.fillRect(-62, -217, 124, 225);
    for (let index = 0; index < 50; index++) {
      const x = -55 + noise(index * 4 + 9) * 110;
      const y = -205 + noise(index * 4 + 10) * 208;
      const run = 4 + noise(index * 4 + 11) * 23;
      stroke(context, [[x, y], [x + noise(index * 4) * 2.5, y + run]], index % 3 ? "#140e1335" : "#d1a27926", 1);
    }
    for (const side of [-1, 1]) {
      const x = side * 32;
      polygon(context, [[x - 11, -159], [x + 11, -164], [x + 11, -12], [x - 11, -12]], "#272e2e", "#80654c", 1.15);
      for (const y of [-146, -94, -37]) {
        oval(context, x, y, 2.3, 2.3, "#c09160", "#292723", 0.8);
      }
    }
    haze(context, 1, -116, 51, 112, "#d78945", 0.66);
    stroke(context, [[0, -201], [0, -10]], "#8b572f", 8);
    stroke(context, [[0, -201], [0, -9]], "#dca354", 3.4);
    stroke(context, [[0, -196], [0, -15]], "#ffe1a0", 1.25);
    for (const y of [-82, -51, -21]) {
      stroke(context, [[-51, y], [-33, y - 5], [-8, y + 5]], "#92745a", 1.5);
      stroke(context, [[8, y + 5], [33, y - 5], [51, y]], "#675142", 1.5);
    }
    oval(context, 0, -111, 34, 34, "#272a2b", "#a08257", 2.9);
    oval(context, 0, -111, 29, 29, null, "#664d3d", 1.7);
    for (let j = 0; j < 8; j++) {
      const angle = tau * j / 8;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      stroke(context, [[x * 9, -111 + y * 9], [x * 28, -111 + y * 28]], "#a78355", 2.2);
      oval(context, x * 28, -111 + y * 28, 1.6, 1.6, "#d1ac71");
    }
    oval(context, 0, -111, 10, 10, "#4b332c", "#e0b277", 1.6);
    oval(context, 0, -111, 4.1, 4.1, "#ffdb8f", "#ffe8b7", 1);
    context.restore();
    for (let index = 0; index < 9; index++) {
      const theta = Math.PI + index * Math.PI / 8;
      const x = Math.cos(theta) * 78;
      const y = -154 + Math.sin(theta) * 77;
      stroke(context, [[x, y], [x * 0.91, -154 + (y + 154) * 0.91]], "#b8a38a67", 1.65);
    }
    polygon(context, [[-99, 0], [73, 0], [91, 9], [-89, 14]], "#4a544b", "#8b8a71", 1.4);
    polygon(context, [[-89, 14], [91, 9], [91, 19], [-89, 24]], "#29383a", "#1c2b30", 1.2);
  }

  function lamp(context, x, y, size = 1) {
    haze(context, x, y, 19 * size, 20 * size, "#d3944d", 0.39);
    polygon(context, [[x - 5 * size, y - 2 * size], [x, y - 8 * size],
      [x + 5 * size, y - 2 * size], [x + 4 * size, y + 5 * size], [x - 4 * size, y + 5 * size]],
    "#4c4239", "#ab8b61", 1);
    polygon(context, [[x - 2 * size, y - 2 * size], [x + 2 * size, y - 2 * size],
      [x + 1.9 * size, y + 3 * size], [x - 2 * size, y + 3 * size]], "#ffc774");
    stroke(context, [[x - 5 * size, y + 5 * size], [x + 5 * size, y + 5 * size]], "#765846", 1);
  }

  const landings = [[-72, 3], [-190, -73], [-102, -143], [-200, -210],
    [-108, -276], [-181, -332], [-113, -386], [-164, -430], [-104, -468]];

  function upperBeacon(context) {
    const [x, y] = landings[5];
    haze(context, x + 10, y - 21, 44, 36, "#e4a35b", 0.44);
    stroke(context, [[x - 1, y + 1], [x - 1, y - 39], [x + 10, y - 47]], "#263137", 4.5);
    stroke(context, [[x + 1, y - 3], [x + 1, y - 38], [x + 10, y - 45]], "#aa936e", 1.4);
    polygon(context, [[x + 2, y - 37], [x + 9, y - 43], [x + 19, y - 39],
      [x + 20, y - 18], [x + 13, y - 13], [x + 3, y - 16]], "#535044", "#b18c60", 1.0);
    polygon(context, [[x + 6, y - 34], [x + 10, y - 38], [x + 16, y - 35],
      [x + 16, y - 21], [x + 12, y - 17], [x + 6, y - 19]], "#eeb35f", "#d19a5e", 0.9);
    stroke(context, [[x + 10, y - 35], [x + 10, y - 20]], "#ffe2a5", 1.5);
    stroke(context, [[x - 11, y + 1], [x + 21, y + 1]], "#baa378", 1.8);
  }

  function scaffold(context) {
    for (const rail of [-205, -107]) {
      stroke(context, [[rail, 12], [rail + 2, -229], [rail + 9, -407], [rail + 15, -444]], "#18282c", 11);
      stroke(context, [[rail - 2, 3], [rail, -229], [rail + 7, -407], [rail + 13, -444]], "#6c7562", 2.3);
    }
    for (let index = 0; index < landings.length - 1; index++) {
      const [x, y] = landings[index];
      const [tx, ty] = landings[index + 1];
      const sections = Math.round((y - ty) / 6.1);
      const tread = [];
      for (let step = 0; step <= sections; step++) {
        const fraction = step / sections;
        const next = Math.min(1, (step + 1) / sections);
        tread.push([mix(x, tx, fraction), mix(y, ty, fraction)]);
        tread.push([mix(x, tx, next), mix(y, ty, fraction)]);
      }
      const base = [[tx + 3, ty + 9], [x + 1, y + 12]];
      polygon(context, [...tread, ...base], "#23343a", "#17252a", 0.9);
      stroke(context, [[x, y + 13], [tx, ty + 11]], "#526056", 2.8);
      stroke(context, tread, "#b6a178", 1.7);
      stroke(context, [[x + 4, y - 13], [tx + 4, ty - 16]], "#6c7867", 1.4);
      for (let post = 0; post < 5; post++) {
        const t = (post + 1) / 6;
        const sx = mix(x, tx, t);
        const sy = mix(y, ty, t);
        stroke(context, [[sx + 4, sy], [sx + 4, sy - 14]], "#68796a", 1.1);
      }
    }
    for (const [index, [x, y]] of landings.entries()) {
      const width = index === 0 ? 21 : 17;
      polygon(context, [[x - width, y - 2], [x - width + 6, y - 8], [x + width + 5, y - 8],
        [x + width, y + 3], [x + width - 2, y + 10], [x - width, y + 10]],
      "#3c504e", "#617368", 1.15);
      stroke(context, [[x - width + 2, y + 2], [x + width, y + 2]], "#cead77", 1.5);
      stroke(context, [[x - width - 1, y + 9], [x - 1, y + 25], [x + width - 6, y + 10]], "#253c41", 2.4);
      stroke(context, [[x - width + 2, y + 2], [x - width + 2, y - 21]], "#938764", 1.5);
      lamp(context, x - width + 2, y - 20, index % 2 ? 0.78 : 0.91);
    }
  }

  function bridgeSpan(context, scene) {
    const near = scene.near;
    const farX = -65;
    const nearX = scene.shore;
    const at = (depth, side) => {
      const center = mix(farX, nearX, depth);
      const span = 28 + (scene.narrow ? 51 : 76) * depth ** 1.34;
      return [center + side * span, 14 + (near - 14) * depth];
    };
    const upper = [at(0, -1), at(0, 1), at(1, 1), at(1, -1)];
    polygon(context, [[upper[0][0] + 12, upper[0][1] + 10], [upper[1][0] + 33, upper[1][1] + 16],
      [upper[2][0] + 74, upper[2][1] + 31], [upper[3][0] + 36, upper[3][1] + 24]],
    linear(context, -54, 12, 24, near, [[0, "#0c171ea6"], [0.56, "#0b1c24ab"], [1, "#0a161c3b"]]));
    for (const depth of [0.21, 0.49, 0.78]) {
      const [x, y] = at(depth, 0.87);
      const width = 5 + depth * 6;
      const height = 12 + depth * 22;
      const projection = 5 + depth * 9;
      polygon(context, [[x - width, y + 7], [x, y + 9], [x, y + height], [x - width, y + height - 2]],
        "#233c40", "#172e36", 0.9);
      polygon(context, [[x, y + 9], [x + projection, y + 5], [x + projection, y + height - 4], [x, y + height]], "#112831");
      stroke(context, [[x - width - 2, y + height], [x + projection + width, y + height]], "#41646361", 0.9);
    }
    const flank = [upper[1], upper[2], [upper[2][0], upper[2][1] + 23], [upper[1][0], upper[1][1] + 9]];
    polygon(context, flank, linear(context, farX, 16, farX + 11, near + 21, [
      [0, "#344d4c"], [0.55, "#263e43"], [1, "#10242d"],
    ]), "#314d50", 1.3);
    polygon(context, upper, linear(context, farX, 11, nearX, near, [
      [0, "#4b5951"], [0.38, "#42524d"], [1, "#182b32"],
    ]), "#7b8b79", 1.6);
    weather(context, upper, { x: Math.min(farX, nearX) - 120, y: 14, width: 275, height: near }, 934, 95);
    for (let index = 1; index < 18; index++) {
      const t = (index / 18) ** 1.55;
      const start = at(t, -0.96);
      const end = at(t, 0.95);
      const notch = [mix(start[0], end[0], 0.30 + noise(index + 80) * 0.33), start[1] + 1];
      stroke(context, [start, notch, [notch[0] + 3.5, notch[1] - 1.5], end], "#182b328d", 1.2 + t * 0.9);
      stroke(context, [[start[0], start[1] - 1.4], [notch[0], notch[1] - 1.2]], "#8b998666", 0.8);
    }
    for (const side of [-1, 1]) {
      const top = [];
      for (const depth of [0.03, 0.14, 0.28, 0.47, 0.66, 0.86]) {
        const [x, y] = at(depth, side * 0.91);
        stroke(context, [[x, y], [x + side * 1.3, y - (10 + depth * 19)]], "#3a4b48", 4 + depth * 2.2);
        stroke(context, [[x - 1, y - 1], [x + side * 1.3 - 1, y - (10 + depth * 19)]], "#a19b74", 1.4);
        top.push([x + side * 1.3, y - (10 + depth * 19)]);
      }
      stroke(context, top.slice(0, scene.narrow ? 4 : 6), "#a1956b", 2.4);
      if (side === 1) {
        const [x, y] = top[1];
        lamp(context, x, y - 2, 1.05);
      }
    }
    const [x, y] = at(scene.hero, 0.13);
    climber(context, x, y);
  }

  function climber(context, x, y) {
    context.save();
    context.translate(x, y);
    oval(context, 0, 2.4, 15, 4.8, "#0d202577");
    oval(context, -1, 1.1, 13, 4.3, null, "#c5b47873", 1.3);
    polygon(context, [[-7, -12], [-2, -13], [0, -5], [-0.8, -1.6], [-4, 0],
      [-8, -2.2], [-4.6, -4], [-7, -8]], "#4c5444", "#142831", 1.1);
    polygon(context, [[-1, -13], [5, -13.4], [8, -5], [10, -4], [9, -2], [4, -1],
      [2, -4.2], [2.6, -7]], "#83816b", "#142831", 1.1);
    polygon(context, [[-3, -24], [-11, -20], [-15, -12], [-8, -13], [-4, -10.5], [1, -12]],
      "#376a63", "#182a2e", 1.15);
    polygon(context, [[-7, -23], [-3, -27], [5, -27], [8, -21], [6, -15], [0, -11],
      [-4, -12], [-7, -16]], "#b48a56", "#1e3031", 1.1);
    polygon(context, [[-2, -34], [4, -35], [8, -32], [8.2, -27], [4.5, -24], [-2, -26]],
      "#dfb684", "#3f3b33", 1.05);
    stroke(context, [[2, -30], [8, -30.6]], "#303739", 2.0);
    stroke(context, [[5.1, -30], [8, -30.6]], "#ffda8c", 0.96);
    polygon(context, [[4, -23], [8, -23], [13, -16], [15, -15], [14, -13.2], [10.5, -13.2],
      [8, -15], [4.8, -17]], "#b7a078", "#393b35", 1.2);
    stroke(context, [[13, -14.4], [27, -17]], "#223339", 4);
    stroke(context, [[13, -14.4], [28, -17.1]], "#c2d6be", 1.5);
    oval(context, -4, -12, 2.1, 2.3, "#c5d4a0");
    context.restore();
  }

  function finish(context, scene) {
    damWings(context, scene);
    towerBody(context, scene);
    pressureGate(context);
    lamp(context, -84, -51, 0.94);
    lamp(context, 94, -55, 0.89);
    lamp(context, -96, -442, 0.69);
    haze(context, -102, -461, 28, 38, "#bc8d61", 0.35);
    scaffold(context);
    upperBeacon(context);
    bridgeSpan(context, scene);

    if (!scene.narrow) {
      polygon(context, [[scene.left, 139], [scene.left + 47, 123], [-544, 162], [-464, 190],
        [-345, 242], [-260, scene.bottom + 1], [scene.left, scene.bottom + 1]], "#0c1b23");
      stroke(context, [[scene.left, 139], [scene.left + 47, 123], [-544, 162], [-464, 190], [-345, 242]],
        "#33504f", 2.1);
    }
    const nearEdge = [[scene.right - 129, scene.bottom + 1], [scene.right - 99, scene.bottom - 45],
      [scene.right - 78, scene.bottom - 70], [scene.right - 56, scene.bottom - 67],
      [scene.right - 31, scene.bottom - 98], [scene.right + 2, scene.bottom - 116], [scene.right + 2, scene.bottom + 1]];
    polygon(context, nearEdge, "#0d1e26", "#1d3b41", 1.6);
    grainPattern(context, scene);
    haze(context, 16, scene.top + 31, 229, 176, "#6c8276", 0.48);
    haze(context, 90, scene.top - 2, 247, 210, "#2e4a4b", 0.37);
    haze(context, -255, -99, 295, 56, "#577d774d", 0.4);
  }

  function sceneWash(context, scene) {
    const { left, right, top, bottom } = scene;
    if (scene.narrow) {
      context.fillStyle = linear(context, 0, bottom - 148, 0, bottom, [
        [0, "#07141c00"], [0.51, "#07141cb0"], [1, "#07141cfa"],
      ]);
      context.fillRect(left, bottom - 148, right - left, 149);
    } else {
      context.fillStyle = linear(context, left, 0, -270, 0, [
        [0, "#081721d9"], [0.52, "#0c1b23c6"], [1, "#0b192300"],
      ]);
      context.fillRect(left, top, -270 - left, bottom - top);
    }
    const veil = linear(context, 0, top, 0, top + 105, [[0, "#0a18218f"], [1, "#0a182100"]]);
    context.fillStyle = veil;
    context.fillRect(left, top, right - left, 106);
  }

  function currents(context, scene, seconds, reduced) {
    for (let index = 0; index < 34; index++) {
      const depth = noise(index + 154) ** 1.48;
      const span = scene.right - scene.left;
      const drift = reduced ? 0 : seconds * (0.004 + depth * 0.014);
      const world = noise(index + 56) + drift;
      const x = scene.left + span * (world - Math.floor(world));
      const y = 18 + depth * (scene.bottom - 20);
      const length = (11 + noise(index + 286) * 32) * (0.25 + depth * 0.84);
      const color = index % 6 ? "#8fc2bc" : "#beaa78";
      context.globalAlpha = (x < -190 ? 0.055 : 0.16) + noise(index + 72) * 0.10;
      stroke(context, [[x - length, y], [x, y - 0.68], [x + length * 0.48, y]],
        color, 0.78 + 0.33 * depth);
    }
    for (let index = 0; index < 19; index++) {
      const phase = noise(index * 4 + 48) + (reduced ? 0 : seconds * 0.012);
      const t = phase - Math.floor(phase);
      const y = 12 + t * 112;
      const center = (noise(index * 4 + 50) - 0.5) * t * 33;
      const scale = 5 + (Math.sin(t * 37 + index) + 1) * 4 * t;
      context.globalAlpha = (1 - t) * (0.20 + noise(index + 325) * 0.27);
      stroke(context, [[center - scale, y], [center + scale * 0.64, y - 0.12]], "#e3b178", 0.79);
    }
    context.globalAlpha = 1;
  }

  const pipeSeams = [
    { x: 167, y: -104, side: 1, delay: 0.43, length: 1.06 },
    { x: 144, y: -214, side: -1, delay: 3.12, length: 1.16 },
    { x: 146, y: -335, side: 1, delay: 5.79, length: 0.97 },
    { x: 184, y: -170, side: 1, delay: 8.61, length: 1.18 },
  ];

  function seamSteam(context, seconds, reduced) {
    if (reduced) return;
    const cycleLength = 11.8;
    const cycle = Math.floor(seconds / cycleLength);
    const clock = seconds - cycle * cycleLength;
    for (const [index, { x, y, side, delay, length }] of pipeSeams.entries()) {
      const offset = cycle > 0 ? (noise(cycle * 9 + index) - 0.5) * 0.31 : 0;
      const age = clock - delay - offset;
      if (age < 0 || age >= length) continue;

      const puff = age / length;
      const pressure = Math.sin(clamp(age / 0.54, 0, 1) * Math.PI);
      if (pressure > 0) {
        const jet = linear(context, x, y, x + side * 18, y - 7, [
          [0, "#e7f2e8d6"], [0.44, "#d7e3de95"], [1, "#b3c7c000"],
        ]);
        context.save();
        context.globalAlpha = pressure * 0.56;
        polygon(context, [[x, y - 0.65], [x + side * 6, y - 3.2], [x + side * 17, y - 7.8],
          [x + side * 14, y - 3.2], [x + side * 3, y + 0.2]], jet);
        context.restore();
      }
      for (let particle = 0; particle < 7; particle++) {
        const emission = particle * 0.046;
        const progress = (age - emission) / (length - emission);
        if (!(progress > 0 && progress < 1)) continue;
        const eddy = Math.sin(progress * 5.5 + particle * 1.45 + index) * progress ** 1.6;
        const wx = x + side * (2 + 13 * progress + eddy * 6);
        const wy = y - progress * 9 - progress ** 2 * 23 + eddy * 2.8;
        const spread = 1.25 + progress * 5.9 + progress ** 2 * 3.25;
        const alpha = Math.sin(progress * Math.PI) * (0.36 - puff * 0.16);
        haze(context, wx, wy, spread * 1.31, spread, progress < 0.37 ? "#ebf1ed" : "#b2c7c5", alpha);
      }
      break;
    }
  }

  function makeLayer(width, height, ratio, scene, draw) {
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const context = canvas.getContext("2d");
    context.scale(canvas.width / width, canvas.height / height);
    context.lineCap = "round";
    context.lineJoin = "round";
    sceneTransform(context, scene);
    draw(context, scene);
    return canvas;
  }

  function draw(canvas, now = performance.now(), reduced = false) {
    const bounds = canvas.getBoundingClientRect();
    const { width, height } = bounds;
    if (!(width > 0 && height > 0)) return;
    const ratio = clamp(window.devicePixelRatio || 1, 1, 2);
    const key = `${width}:${height}:${ratio}`;
    let cached = frames.get(canvas);
    if (cached?.key !== key) {
      const scene = makeScene(width, height);
      cached = {
        key, scene, back: makeLayer(width, height, ratio, scene, backdrop),
        front: makeLayer(width, height, ratio, scene, finish), shade: makeLayer(width, height, ratio, scene, sceneWash),
      };
      frames.set(canvas, cached);
    }
    const pixelsWide = Math.round(width * ratio);
    const pixelsHigh = Math.round(height * ratio);
    if (canvas.width !== pixelsWide || canvas.height !== pixelsHigh) {
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
    }
    const context = canvas.getContext("2d");
    context.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
    context.lineJoin = "round";
    context.lineCap = "round";
    const { scene } = cached;
    if (reduced) {
      if (!cached.still) {
        const still = document.createElement("canvas");
        still.width = pixelsWide;
        still.height = pixelsHigh;
        const paint = still.getContext("2d");
        paint.setTransform(pixelsWide / width, 0, 0, pixelsHigh / height, 0, 0);
        paint.lineJoin = "round";
        paint.lineCap = "round";
        paint.drawImage(cached.back, 0, 0, width, height);
        paint.save();
        sceneTransform(paint, scene);
        currents(paint, scene, 0, true);
        paint.restore();
        paint.drawImage(cached.front, 0, 0, width, height);
        paint.drawImage(cached.shade, 0, 0, width, height);
        cached.still = still;
      }
      context.drawImage(cached.still, 0, 0, width, height);
      return;
    }
    const seconds = now / 1000;
    context.drawImage(cached.back, 0, 0, width, height);
    context.save();
    sceneTransform(context, scene);
    currents(context, scene, seconds, false);
    context.restore();
    context.drawImage(cached.front, 0, 0, width, height);
    context.save();
    sceneTransform(context, scene);
    seamSteam(context, seconds, false);
    context.restore();
    context.drawImage(cached.shade, 0, 0, width, height);
  }

  window.BrassenTitle = { draw };
})();
