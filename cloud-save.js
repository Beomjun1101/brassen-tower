(() => {
  "use strict";

  const config = window.BrassenCloudConfig;
  const configured = window.location.protocol !== "file:" && Boolean(config?.url && config?.publishableKey);
  const listeners = new Set();
  let status = { configured, loading: configured, user: null, error: null };

  function update(changes) {
    status = { ...status, ...changes };
    for (const listener of listeners) listener(status);
  }

  function loadSdk() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.2/dist/umd/supabase.js";
      script.integrity = "sha384-A97u3Qnt9GZHURO9YJZRe7VQgGUeFzcv6I1oIGnUTxQrCxnpQMwR0/G8F2zt9abZ";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (typeof window.supabase?.createClient === "function") resolve(window.supabase);
        else reject(new Error("로그인 라이브러리를 불러오지 못했습니다."));
      };
      script.onerror = () => reject(new Error("로그인 라이브러리를 불러오지 못했습니다."));
      document.head.append(script);
    });
  }

  async function initialize() {
    const url = new URL(config.url);
    if (url.protocol !== "https:" || !config.publishableKey.startsWith("sb_publishable_")) {
      throw new Error("클라우드 저장 설정을 확인해 주세요.");
    }
    const { createClient } = await loadSdk();
    const client = createClient(url.href, config.publishableKey, {
      auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true },
    });
    const { data, error } = await client.auth.getSession();
    client.auth.onAuthStateChange((_event, session) => {
      update({ loading: false, user: session?.user ?? null, error: null });
    });
    update({ loading: false, user: data.session?.user ?? null, error: error ?? null });
    return client;
  }

  const ready = configured ? initialize().catch((error) => {
    update({ loading: false, error });
    return null;
  }) : Promise.resolve(null);

  async function requireClient() {
    const client = await ready;
    if (!client) throw status.error ?? new Error("클라우드 저장 설정이 필요합니다.");
    return client;
  }

  function requireUser(id = status.user?.id) {
    if (!id || status.user?.id !== id) throw new Error("현재 GitHub 계정으로 다시 로그인해 주세요.");
    return id;
  }

  window.BrassenCloud = {
    subscribe(listener) {
      listeners.add(listener);
      listener(status);
      return () => listeners.delete(listener);
    },
    async signIn() {
      const client = await requireClient();
      const redirect = new URL(window.location.href);
      redirect.pathname = redirect.pathname.replace(/\/index\.html$/, "/");
      redirect.search = redirect.hash = "";
      const { error } = await client.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: redirect.href },
      });
      if (error) throw error;
    },
    async signOut() {
      const client = await requireClient();
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    },
    async load(expectedUser) {
      return campaignRequest("load", expectedUser);
    },
    async save(checkpoint, expectedRevision, expectedUser) {
      const { revision } = await campaignRequest("save", expectedUser, { checkpoint, revision: expectedRevision });
      if (!Number.isSafeInteger(revision) || revision < 1) throw new Error("클라우드 저장 결과를 확인할 수 없습니다.");
      return revision;
    },
  };

  async function campaignRequest(action, expectedUser, fields = {}) {
    const id = requireUser(expectedUser);
    const client = await requireClient();
    const { data: session, error: sessionError } = await client.auth.getSession();
    requireUser(id);
    if (sessionError) throw sessionError;
    if (session.session?.user?.id !== id) throw new Error("현재 GitHub 계정으로 다시 로그인해 주세요.");
    const { data, error } = await client.functions.invoke("campaign", {
      headers: { Authorization: "Bearer " + session.session.access_token },
      body: { action, user: id, ...fields },
    });
    requireUser(id);
    if (error) {
      if (error.context?.status === 409) throw Object.assign(new Error("클라우드 저장 충돌"), { code: "PT409" });
      throw error;
    }
    return data;
  }
})();
