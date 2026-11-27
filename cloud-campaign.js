(() => {
  "use strict";

  const cloud = window.BrassenCloud;
  let auth = {};
  let loading = false;
  let conflict = false;
  let error = "";
  let syncTask = null;
  let refresh = () => {};
  const key = (base, user) => user ? base + ":github:" + user : base;
  const userId = () => auth.user?.id;
  const readRecord = (base, user) => JSON.parse(localStorage.getItem(key(base, user))) ?? null;
  const writeRecord = (base, user, record) => localStorage.setItem(key(base, user), JSON.stringify(record));

  function setup(base, onChange, isTitle) {
    refresh = onChange;
    if (!cloud) return;
    cloud.subscribe((next) => {
      const previous = userId();
      auth = next;
      if (previous !== userId()) {
        conflict = false;
        error = "";
        if (userId()) load(base);
      }
      refresh();
    });
    window.addEventListener("online", () => {
      if (isTitle()) load(base);
      else sync(base);
    });
    window.addEventListener("focus", () => {
      if (isTitle()) load(base);
    });
  }

  async function load(base, useCloud = false) {
    const user = userId();
    if (!user || loading || syncTask) return;
    loading = true;
    refresh();
    try {
      const remote = await cloud.load(user);
      if (user !== userId()) return;
      const local = readRecord(base, user);
      if (useCloud || !local?.pending) {
        writeRecord(base, user, {
          checkpoint: remote?.checkpoint ?? null, revision: remote?.revision ?? null, pending: false,
        });
        conflict = false;
      } else {
        conflict = local.revision !== (remote?.revision ?? null);
      }
      error = "";
    } catch {
      if (user === userId()) error = "클라우드 저장을 불러오지 못했습니다.";
    } finally {
      loading = false;
      refresh();
      if (user && user !== userId()) load(base);
      else sync(base);
    }
  }

  function sync(base) {
    const user = userId();
    if (!user || loading || conflict || syncTask) return;
    let pending;
    try { pending = readRecord(base, user); }
    catch { return; }
    if (!pending?.pending) return;
    syncTask = (async () => {
      try {
        const revision = await cloud.save(pending.checkpoint, pending.revision, user);
        const current = readRecord(base, user);
        if (!current) return;
        writeRecord(base, user, current.change === pending.change
          ? { ...current, revision, pending: false } : { ...current, revision });
        if (user === userId()) error = "";
      } catch (failure) {
        if (user !== userId()) return;
        conflict = failure?.code === "PT409";
        error = conflict ? "" : "이 기기에 저장했습니다. 클라우드 연결을 다시 시도하세요.";
      } finally {
        syncTask = null;
        refresh();
        if (user !== userId()) load(base);
        else if (!error && !conflict) sync(base);
      }
    })();
  }

  function read(base, user = userId()) {
    const record = readRecord(base, user);
    return user ? record?.checkpoint : record;
  }

  function save(base, user, checkpoint) {
    if (!user) {
      if (checkpoint) writeRecord(base, null, checkpoint);
      else localStorage.removeItem(base);
      return;
    }
    const previous = readRecord(base, user);
    writeRecord(base, user, { checkpoint, revision: previous?.revision ?? null, pending: true,
      change: crypto.randomUUID() });
    if (user === userId()) sync(base);
  }

  async function authAction(action) {
    try { await cloud[action](); }
    catch {
      error = action === "signIn" ? "GitHub 로그인에 실패했습니다." : "로그아웃에 실패했습니다.";
      refresh();
    }
  }

  function menu(base) {
    if (!auth.configured) return { options: [], blocked: false };
    if (!userId()) return { options: [{ id: "github-sign-in", title: "GitHub로 로그인",
      description: "다른 기기에서도 등반을 이어갑니다.", choose: () => authAction("signIn") }],
      message: error || (auth.error ? "GitHub 로그인에 실패했습니다." : ""), blocked: Boolean(auth.loading) };

    const record = readRecord(base, userId());
    const options = [];
    const blocked = loading || conflict;
    if (conflict) options.push({ id: "cloud-use-remote", title: "클라우드 기록 불러오기",
      description: "다른 기기의 기록을 사용하고 이 기기의 미동기화 기록을 교체합니다.",
      choose: () => { if (window.confirm("이 기기의 미동기화 기록을 클라우드 기록으로 교체할까요?")) load(base, true); } });
    else if (error) options.push({ id: "cloud-retry", title: "클라우드 다시 연결", choose: () => load(base) });
    else if (!loading && !record?.checkpoint && !record?.pending && read(base, null)) {
      options.push({ id: "cloud-import", title: "이 기기의 기록을 계정에 복사",
        choose: () => save(base, userId(), read(base, null)) });
    }
    options.push({ id: "github-sign-out", title: "로그아웃", choose: () => authAction("signOut") });
    const message = conflict ? "다른 기기에서 더 최근 기록을 저장했습니다."
      : error || (loading ? "클라우드 기록을 불러오는 중입니다." : syncTask ? "클라우드에 저장하는 중입니다." : "GitHub 계정으로 연결됨");
    return { options, message, blocked };
  }

  window.BrassenCampaign = { setup, userId, read, save, menu };
})();
