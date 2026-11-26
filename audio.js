(() => {
  "use strict";

  const tracks = {
    title: { name: "첨탑의 밤", tempo: 84, root: 50, chords: [0, 5, 3, 4], melody: [7, 9, 11, 9, 7, 4, 5, 2], hits: [0, 5, 10, 14], wave: "triangle" },
    story: { name: "인계 기록", tempo: 66, root: 47, chords: [0, 2, 5, 3], melody: [4, 5, 2, 4, 7, 6, 4, 2], hits: [0, 7, 12], wave: "triangle" },
    entry: { name: "황동의 눈", tempo: 72, root: 43, chords: [0, 0, 5, 4], melody: [9, 8, 5, 7, 6, 4, 5, 2], hits: [3, 8, 12], wave: "sine" },
    shelter: { name: "교대 시간", tempo: 76, root: 48, chords: [0, 3, 5, 4], melody: [7, 9, 10, 9, 7, 6, 4, 7], hits: [0, 4, 10, 14], wave: "sine", major: true },
    sluice: { name: "수문 아래", tempo: 97, root: 45, chords: [0, 3, 5, 2], melody: [7, 4, 8, 5, 3, 9, 7, 2], hits: [0, 3, 6, 10, 13], wave: "triangle", combat: true },
    relay: { name: "전류가 도는 밤", tempo: 112, root: 46, chords: [0, 1, 4, 3], melody: [7, 8, 11, 8, 4, 7, 10, 3], hits: [0, 2, 5, 7, 10, 12, 15], wave: "square", combat: true },
    forge: { name: "노심의 박동", tempo: 106, root: 43, chords: [0, 0, 5, 6], melody: [7, 2, 4, 8, 7, 5, 3, 6], hits: [0, 3, 4, 9, 11, 14], wave: "sawtooth", combat: true },
    boss: { name: "차단 명령", tempo: 132, root: 42, chords: [0, 1, 5, 1], melody: [7, 10, 9, 8, 6, 9, 13, 8], hits: [0, 2, 4, 7, 8, 11, 13, 15], wave: "square", combat: true },
    reward: { name: "남은 온기", tempo: 74, root: 52, chords: [0, 4, 5, 3], melody: [4, 6, 7, 9, 7, 4, 2, 4], hits: [0, 8, 12], wave: "triangle", major: true },
    defeat: { name: "기압 하강", tempo: 60, root: 45, chords: [0, 6, 5, 0], melody: [7, 6, 4, 3, 2, 1, 2, 0], hits: [0, 6, 12], wave: "sine" },
    victory: { name: "돌아오는 온수", tempo: 86, root: 53, chords: [0, 5, 3, 4], melody: [7, 9, 11, 12, 11, 9, 7, 4], hits: [0, 4, 6, 10, 14], wave: "triangle", major: true },
  };
  const themeKeys = new Set(["sluice", "relay", "forge"]);
  const preference = "brassen-tower-sound";
  let enabled = true;
  try { enabled = localStorage.getItem(preference) !== "off"; } catch {}
  let context;
  let output;
  let noise;
  let timer;
  let bus;
  let scene;
  let nextTime = 0;
  let step = 0;
  let visible = true;

  function hash(text) {
    let result = 0x811c9dc5;
    for (const letter of text) result = Math.imul(result ^ letter.codePointAt(0), 16777619);
    return result >>> 0;
  }

  function scoreFor(key, details) {
    const base = tracks[key];
    const { floor = 1, theme, foes = "", phase = 0 } = details;
    if (!base.combat) return { ...base, tonic: base.root, seed: 0, phase: 0, pulses: 0, swing: 0 };
    const seed = hash(`${theme}/${floor}/${foes}`);
    const depth = Math.min(8, Math.floor(Math.log2(Math.max(1, floor))));
    const accents = theme === "sluice" ? -3 : theme === "forge" ? -1 : 3;
    const fastOpponent = /runner|lancer/.test(foes);
    return {
      ...base, seed, phase,
      tempo: base.tempo + (floor % 5) * 2 + depth + accents + phase * 4 + (fastOpponent ? 4 : 0),
      tonic: base.root + ((floor + seed) % 7 - 3) + (theme === "relay" ? 2 : 0),
      pulses: /sentry|mortar/.test(foes) ? 2 : fastOpponent ? 1 : 0,
      swing: theme === "sluice" ? 0.055 : theme === "forge" ? 0.035 : 0,
    };
  }

  function active() {
    return enabled && visible && context?.state === "running";
  }

  function unlock() {
    if (!enabled) return Promise.resolve(false);
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return Promise.resolve(false);
        context = new Audio();
        output = context.createGain();
        output.gain.value = 0.62;
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -14;
        limiter.ratio.value = 3;
        output.connect(limiter).connect(context.destination);
        noise = context.createBuffer(1, Math.floor(context.sampleRate * 0.25), context.sampleRate);
        const samples = noise.getChannelData(0);
        let seed = 35191;
        for (let i = 0; i < samples.length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          samples[i] = seed / 2147483648 - 1;
        }
        openBus();
      }
      return context.resume().then(() => {
        if (!enabled || !visible) return false;
        output.gain.setTargetAtTime(0.62, context.currentTime, 0.035);
        timer ??= window.setInterval(pump, 42);
        pump();
        return active();
      }).catch(() => false);
    } catch {
      return Promise.resolve(false);
    }
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    try { localStorage.setItem(preference, enabled ? "on" : "off"); } catch {}
    if (enabled) return unlock();
    if (context) output.gain.setTargetAtTime(0, context.currentTime, 0.025);
    window.clearInterval(timer);
    timer = undefined;
    return Promise.resolve(false);
  }

  function setVisible(value) {
    visible = Boolean(value);
    if (!context || !enabled) return;
    output.gain.setTargetAtTime(visible ? 0.62 : 0, context.currentTime, 0.026);
    if (visible) pump();
  }

  function openBus() {
    const time = context.currentTime;
    if (bus) {
      const previous = bus;
      previous.gain.setTargetAtTime(0, time, 0.048);
      window.setTimeout(() => previous.disconnect(), 280);
    }
    bus = context.createGain();
    bus.gain.value = 0;
    bus.gain.setTargetAtTime(1, time, 0.055);
    bus.connect(output);
    nextTime = time + 0.060;
    step = 0;
  }

  function cue(key, details = {}) {
    if (!Object.hasOwn(tracks, key)) key = themeKeys.has(details.theme) ? details.theme : "title";
    const combat = tracks[key].combat;
    const signature = combat ? `${key}/${details.theme}/${details.floor}/${details.foes}/${details.phase}` : key;
    if (scene?.signature === signature) return scene.score.name;
    const score = scoreFor(key, details);
    scene = { signature, score };
    if (context) openBus();
    return score.name;
  }

  function tone(frequency, endFrequency, time, duration, wave, volume, cutoff, destination = bus) {
    const voice = context.createOscillator();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    voice.type = wave;
    voice.frequency.setValueAtTime(frequency, time);
    if (endFrequency) voice.frequency.exponentialRampToValueAtTime(endFrequency, time + duration * 0.70);
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + 0.012);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    voice.connect(filter).connect(envelope).connect(destination);
    voice.start(time);
    voice.stop(time + duration + 0.022);
  }

  function grains(time, duration, frequency, volume, destination = bus) {
    const voice = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    voice.buffer = noise;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 1.4;
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    voice.connect(filter).connect(envelope).connect(destination);
    voice.start(time);
    voice.stop(time + duration + 0.012);
  }

  const frequency = (note) => 440 * 2 ** ((note - 69) / 12);

  function noteAt(score, degree) {
    const intervals = score.major ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
    return score.tonic + intervals[(degree % 7 + 7) % 7] + 12 * Math.floor(degree / 7);
  }

  function playStep(score, count, time, interval) {
    const beat = count % 16;
    const bar = Math.floor(count / 16);
    const chord = score.chords[bar % score.chords.length];
    if (beat === 0 || beat === 8 || (score.pulses && beat === 6)) {
      const bass = noteAt(score, chord - 7 + (beat === 0 ? 0 : beat === 8 ? 4 : 2));
      tone(frequency(bass), null, time, interval * (score.combat ? 3.4 : 6), "triangle", 0.12, 920);
    }
    if (beat === 0 || (!score.combat && beat === 9)) {
      for (const spread of [0, 2, 4]) {
        tone(frequency(noteAt(score, chord + spread)), null, time + spread * 0.018, interval * 10.4,
          "triangle", score.combat ? 0.016 : 0.023, 1350);
      }
    }
    const pickup = score.pulses === 2 && (beat === 9 || beat === 15);
    if (score.hits.includes(beat) || pickup) {
      const variation = (bar + (score.seed % 8)) % 8;
      const degree = score.melody[(Math.floor(beat / 2) + variation + score.phase) % score.melody.length] + (bar % 2 ? chord : 0);
      tone(frequency(noteAt(score, degree)), null, time, interval * (beat % 4 === 0 ? 2.25 : 1.55),
        score.wave, score.combat ? 0.047 : 0.071, score.wave === "sawtooth" ? 1370 : 2230);
    }
    if (score.combat) {
      if (beat === 0 || beat === 8 || (score.phase >= 1 && beat === 10)) tone(126, 46, time, 0.15, "sine", 0.17, 950);
      if (beat === 4 || beat === 12) grains(time, 0.105, score.pulses === 2 ? 2200 : 1150, 0.083);
      if ((beat % 4 === 2) || (score.pulses === 1 && beat % 4 === 3)) grains(time, 0.05, 5100, 0.035);
    }
  }

  function pump() {
    if (!active() || !scene) return;
    const time = context.currentTime;
    const { score } = scene;
    const interval = 60 / score.tempo / 4;
    if (nextTime < time - 0.16) nextTime = time + 0.025;
    while (nextTime < time + 0.13) {
      playStep(score, step, nextTime + (step % 2 ? score.swing : 0) * interval, interval);
      nextTime += interval;
      step++;
    }
  }

  function dieTick(index) {
    if (!active()) return;
    const time = context.currentTime + 0.012;
    tone(436 + index * 123, 318 + index * 109, time, 0.075, "triangle", 0.050, 2300, output);
    grains(time, 0.045, 1030 + index * 400, 0.038, output);
  }

  function deviceSignal(kind) {
    if (!active()) return;
    const time = context.currentTime + 0.016;
    if (kind === "valve") {
      tone(83, 49, time, 0.23, "triangle", 0.063, 510, output);
      grains(time + 0.06, 0.36, 610, 0.052, output);
    } else {
      grains(time, 0.105, 1950, 0.058, output);
      tone(651, 546, time + 0.02, 0.085, "triangle", 0.026, 1700, output);
    }
  }

  window.TowerAudio = { active, cue, dieTick, deviceSignal, setEnabled, setVisible, unlock, wantsSound: () => enabled };
})();
