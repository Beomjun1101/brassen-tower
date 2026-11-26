(() => {
  "use strict";

  const runtime = "https://cdn.jsdelivr.net/npm/@wllama/wllama@4.0.0/esm";
  const model = Object.freeze({
    title: "Kanana 1.5 2.1B Instruct · Q4_K_M",
    url: "https://huggingface.co/horongbul/kanana-1.5-2.1b-instruct-2505-GGUF/resolve/b558d1d5e5d0246dfdd693cedda858eba8a64fb4/kanana-1.5-2.1b-instruct-2505-Q4_K_M.gguf",
    bytes: 1522796768,
    sha256: "63cff72b7e963ee34e2e26df0d95441f30c3a15bf53a17ef3e4c2e16dceb9f14",
  });
  const topologies = ["spine", "fork", "loop"];
  const grammar = String.raw`
root ::= "{" ws "\"slots\"" ws ":" ws slots ws "," ws "\"links\"" ws ":" ws links ws "}"
slots ::= "[" ws slot ws "," ws slot ws "," ws slot ws "," ws slot ws "]"
links ::= "[" ws link ws "," ws link ws "," ws link (ws "," ws link)? (ws "," ws link)? ws "]"
slot ::= "10" | "11" | [0-9]
link ::= "[" ws room ws "," ws room ws "]"
room ::= [0-3]
ws ::= " "?
`;
  let engine;
  let loading;
  let generating;
  let loadAbort;
  let generateAbort;
  let state = { phase: "off" };

  function getStatus() {
    return { ...state };
  }

  function within(value, min, max) {
    return Number.isInteger(value) && value >= min && value <= max;
  }

  function validate(plan) {
    const invalid = () => { throw new Error("생성된 지도에서 방이나 통로를 연결할 수 없습니다."); };
    if (!plan || !Array.isArray(plan.slots) || plan.slots.length !== 4
      || new Set(plan.slots).size !== 4 || !plan.slots.every((slot) => within(slot, 0, 11))
      || !Array.isArray(plan.links) || !within(plan.links.length, 3, 5)) invalid();
    const rooms = plan.slots.map((slot, id) => {
      const column = slot % 4;
      const row = Math.floor(slot / 4);
      return { id, x: column * 3, y: row * 3, w: (row + column) % 2 ? 2 : 3, h: row === 2 ? 2 : 3 };
    });
    const graph = rooms.map(() => []);
    const links = plan.links.map((link) => {
      if (!Array.isArray(link) || link.length !== 2 || !link.every((id) => within(id, 0, rooms.length - 1))) invalid();
      const [a, b] = link;
      if (a === b || graph[a].includes(b)) invalid();
      graph[a].push(b);
      graph[b].push(a);
      return [a, b];
    });
    const reachable = new Set([0]);
    for (const room of reachable) for (const neighbor of graph[room]) reachable.add(neighbor);
    if (reachable.size !== rooms.length) invalid();
    const hasLoop = links.length >= rooms.length;
    const hasFork = graph.some((neighbors) => neighbors.length >= 3);
    const topology = hasLoop ? "loop" : hasFork ? "fork" : "spine";
    return { topology, rooms, links };
  }

  async function load(file, { onProgress, device = "auto" } = {}) {
    if (loading || generating) throw new Error("현재 모델 작업을 마친 뒤 다시 시도하세요.");
    const previous = engine;
    engine = undefined;
    const controller = new AbortController();
    loadAbort = controller;
    state = { phase: "loading", loaded: 0, total: file?.size ?? model.bytes };
    loading = (async () => {
      await previous?.exit();
      if (file != null) {
        if (!(file instanceof Blob) || await file.slice(0, 4).text() !== "GGUF") {
          throw new Error("GGUF 모델 파일을 선택하세요.");
        }
      }
      const { Wllama, LoggerWithoutDebug } = await import(runtime + "/index.js");
      if (controller.signal.aborted) throw controller.signal.reason;
      const candidate = new Wllama({ default: runtime + "/wasm/wllama.wasm" }, { logger: LoggerWithoutDebug });
      const config = {
        n_ctx: 1024, n_batch: 128, n_parallel: 1, n_threads: window.crossOriginIsolated ? 3 : 1,
        jinja: true, skip_chat_parsing: true, ...(device === "cpu" ? { n_gpu_layers: 0 } : {}),
      };
      try {
        if (file == null) {
          await candidate.loadModelFromUrl(model.url, { ...config, signal: controller.signal,
            progressCallback({ loaded, total }) {
              state = { phase: "loading", loaded, total };
              onProgress?.({ loaded, total });
            } });
        } else {
          await candidate.loadModel([file], config);
          onProgress?.({ loaded: file.size, total: file.size });
        }
        if (controller.signal.aborted) throw controller.signal.reason;
        engine = candidate;
        state = { phase: "ready", model: file?.name ?? model.title };
      } catch (error) {
        await candidate.exit().catch(() => {});
        throw error;
      }
    })();
    try {
      await loading;
      return getStatus();
    } catch (error) {
      state = controller.signal.aborted ? { phase: "off" }
        : { phase: "error", error: error instanceof Error ? error.message : String(error) };
      throw error;
    } finally {
      loading = undefined;
      loadAbort = undefined;
    }
  }

  async function generate({ floor, seed, theme, kind } = {}) {
    if (!engine || state.phase !== "ready") throw new Error("먼저 로컬 AI 모델을 불러오세요.");
    const controller = new AbortController();
    generateAbort = controller;
    const previous = state;
    state = { ...previous, phase: "generating" };
    const context = [Number.isInteger(floor) ? floor : null,
      ["sluice", "relay", "forge"].includes(theme) ? theme : null,
      ["combat", "hunt", "escape", "hold", "boss"].includes(kind) ? kind : null].filter((entry) => entry !== null).join(" ");
    const pattern = topologies[(Number.isInteger(seed) ? seed >>> 0 : 0) % topologies.length];
    const instruction = `Design a dungeon for ${context}. Choose four distinct slots from 0–11 in a 4×3 grid.
Slots are the positions for rooms 0 to 3. Link all rooms in a ${pattern} with 3–5 unique undirected pairs.
Example for a fork: {"slots":[0,6,11,9],"links":[[0,1],[1,2],[1,3]]}. Return JSON only.`;
    generating = engine.createChatCompletion({
      messages: [{ role: "user", content: instruction }],
      max_tokens: 120, temperature: 0.35, seed: Number.isInteger(seed) ? seed >>> 0 : undefined, grammar,
      abortSignal: controller.signal,
    });
    try {
      const response = await generating;
      const text = response.choices[0].message.content?.trim() ?? "";
      const object = text.match(/\{[^{}]*\}/)?.[0] ?? text;
      return validate(JSON.parse(object));
    } finally {
      generating = undefined;
      generateAbort = undefined;
      state = previous;
    }
  }

  async function unload() {
    loadAbort?.abort();
    generateAbort?.abort();
    await Promise.allSettled([loading, generating]);
    const active = engine;
    engine = undefined;
    state = { phase: "off" };
    await active?.exit();
  }

  window.TowerLocalAI = { model, getStatus, load, generate, unload };
})();
