const maxSaveBytes = 2 * 1024 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const allowedOrigin = Deno.env.get("GAME_ORIGIN") ?? "https://beomjun1101.github.io";
const headers = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

function reply(status: number, body: unknown) {
  return Response.json(body, { status, headers });
}

function encodeBase64(bytes: Uint8Array) {
  let text = "";
  for (let offset = 0; offset < bytes.length; offset += 16384) {
    text += String.fromCharCode(...bytes.subarray(offset, offset + 16384));
  }
  return btoa(text);
}

function validCheckpoint(checkpoint: any) {
  return checkpoint === null || (
    Number.isInteger(checkpoint?.floor) && checkpoint.floor >= 1 && checkpoint.floor <= 1332 &&
    checkpoint.run?.progress?.build && typeof checkpoint.run.progress.build === "object" &&
    Array.isArray(checkpoint.run.rewards) && Array.isArray(checkpoint.run.floorSeeds)
  );
}

async function requestJson(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("missing body");
  let bytes = 0;
  let body = "";
  const decoderForRequest = new TextDecoder();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxSaveBytes + 4096) throw new Error("body too large");
      body += decoderForRequest.decode(value, { stream: true });
    }
    return JSON.parse(body + decoderForRequest.decode());
  } finally {
    await reader.cancel().catch(() => {});
  }
}

async function handle(request: Request) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return reply(405, { code: "METHOD" });

  const bearer = request.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) return reply(401, { code: "AUTH" });
  const project = Deno.env.get("SUPABASE_URL");
  const apiKey = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") ?? "{}").default ?? Deno.env.get("SUPABASE_ANON_KEY");
  const repository = Deno.env.get("SAVE_GITHUB_REPOSITORY");
  const token = Deno.env.get("SAVE_GITHUB_TOKEN");
  if (!project || !apiKey || !repository?.match(/^[\w.-]+\/[\w.-]+$/) || !token) return reply(503, { code: "CONFIG" });

  const auth = await fetch(project + "/auth/v1/user", { headers: { authorization: bearer, apikey: apiKey } });
  if (!auth.ok) return reply(auth.status >= 500 ? 503 : 401, { code: "AUTH" });
  const account = await auth.json();
  if (!/^[0-9a-f-]{36}$/i.test(account.id) ||
      !account.identities?.some((identity: { provider: string }) => identity.provider === "github")) {
    return reply(401, { code: "AUTH" });
  }

  let input;
  try { input = await requestJson(request); }
  catch { return reply(400, { code: "CHECKPOINT" }); }
  if (input?.user !== account.id) return reply(403, { code: "AUTH" });
  if (input.action !== "load" && input.action !== "save") return reply(400, { code: "ACTION" });
  if (input.action === "save" && (!validCheckpoint(input.checkpoint) ||
      (input.revision !== null && (!Number.isSafeInteger(input.revision) || input.revision < 1)))) {
    return reply(400, { code: "CHECKPOINT" });
  }

  const api = "https://api.github.com/repos/" + repository;
  const github = (path = "", init: RequestInit = {}) => fetch(api + path, {
    ...init,
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json",
      "Content-Type": "application/json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  const info = await github();
  if (!info.ok) return reply(503, { code: "REPOSITORY" });
  const repo = await info.json();
  if (repo.private !== true || repo.visibility !== "private") return reply(503, { code: "REPOSITORY" });

  const path = "/contents/campaigns/" + account.id + ".json";
  async function readSave() {
    const result = await github(path);
    if (result.status === 404) return null;
    if (!result.ok) throw new Error("storage read");
    const file = await result.json();
    if (!file.sha || file.size > maxSaveBytes + 100) throw new Error("invalid save file");
    let blob = file;
    if (blob.encoding !== "base64") {
      const result = await github("/git/blobs/" + file.sha);
      if (!result.ok) throw new Error("storage blob");
      blob = await result.json();
    }
    if (blob.encoding !== "base64") throw new Error("save encoding");
    const saved = JSON.parse(decoder.decode(Uint8Array.from(atob(blob.content.replace(/\s/g, "")), char => char.charCodeAt(0))));
    return { ...saved, sha: file.sha };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const saved = await readSave();
    if (input.action === "load") {
      return reply(200, saved ? { checkpoint: saved.checkpoint, revision: saved.revision } : null);
    }
    if ((saved?.revision ?? null) !== input.revision) return reply(409, { code: "PT409" });
    const revision = (saved?.revision ?? 0) + 1;
    const file = encoder.encode(JSON.stringify({ checkpoint: input.checkpoint, revision }));
    if (file.length > maxSaveBytes) return reply(413, { code: "CHECKPOINT" });
    const updated = await github(path, { method: "PUT", body: JSON.stringify({
      message: "Save campaign", content: encodeBase64(file), ...(saved ? { sha: saved.sha } : {}),
    }) });
    if (updated.ok) return reply(200, { revision });
    if (![409, 422].includes(updated.status)) return reply(503, { code: "REPOSITORY" });
  }
  return reply(503, { code: "REPOSITORY" });
}

Deno.serve(async (request) => {
  try { return await handle(request); }
  catch { return reply(503, { code: "STORAGE" }); }
});
