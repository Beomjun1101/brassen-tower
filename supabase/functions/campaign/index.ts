import postgres from "npm:postgres@3.4.9";

const maxSaveBytes = 2 * 1024 * 1024;
const encoder = new TextEncoder();
const databaseUrl = Deno.env.get("SUPABASE_DB_URL");
const sql = databaseUrl ? postgres(databaseUrl, { max: 1, prepare: false, ssl: "require", connect_timeout: 5, idle_timeout: 20 }) : null;
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
  if (!project || !apiKey || !sql) return reply(503, { code: "CONFIG" });

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

  if (input.action === "load") {
    const [saved] = await sql`
      select checkpoint, revision from brassen_private.campaigns where user_id = ${account.id}::uuid
    `;
    if (!saved) return reply(200, null);
    const checkpoint = typeof saved.checkpoint === "string" ? JSON.parse(saved.checkpoint) : saved.checkpoint;
    if (!validCheckpoint(checkpoint)) return reply(503, { code: "STORAGE" });
    return reply(200, { checkpoint, revision: saved.revision });
  }

  const checkpoint = input.checkpoint === null ? null : JSON.stringify(input.checkpoint);
  if (checkpoint && encoder.encode(checkpoint).length > maxSaveBytes) return reply(413, { code: "CHECKPOINT" });
  const rows = input.revision === null ? await sql`
    insert into brassen_private.campaigns (user_id, checkpoint, revision)
    values (${account.id}::uuid, ${checkpoint}::text::jsonb, 1)
    on conflict (user_id) do nothing returning revision
  ` : await sql`
    update brassen_private.campaigns set checkpoint = ${checkpoint}::text::jsonb, revision = revision + 1
    where user_id = ${account.id}::uuid and revision = ${input.revision}
    returning revision
  `;
  return rows.length ? reply(200, { revision: rows[0].revision }) : reply(409, { code: "PT409" });
}

Deno.serve(async (request) => {
  try { return await handle(request); }
  catch { return reply(503, { code: "STORAGE" }); }
});
