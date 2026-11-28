(() => {
  "use strict";

  const accessDigest = "0a97b8d983f044a41710bbf35867261d1efcc69fbd0611e42d5da5e61b2bdeb7";
  const accessPrefix = "brassen-tower/admin/v1:";
  let dialog;

  function setup({ maxFloor, move, revoke }) {
    const stage = document.querySelector("#game-stage");
    if (dialog || !stage) return;

    const cloud = window.BrassenCloud;
    let accountId = null;
    let accountRevision = 0;
    let eligible = false;
    let authorized = false;
    let mode;
    let attempt = 0;

    dialog = document.createElement("dialog");
    dialog.id = "tower-admin-dialog";
    dialog.setAttribute("aria-labelledby", "tower-admin-title");
    dialog.innerHTML = `
      <form class="tower-admin-form" novalidate>
        <h2 id="tower-admin-title"></h2>
        <label for="tower-admin-value"></label>
        <input id="tower-admin-value" autocomplete="off" autocapitalize="off" spellcheck="false"
          aria-describedby="tower-admin-help tower-admin-error">
        <p id="tower-admin-help"></p>
        <p id="tower-admin-error" role="status"></p>
        <div class="tower-admin-actions">
          <button type="button">취소</button>
          <button type="submit"></button>
        </div>
      </form>`;
    document.body.append(dialog);
    const form = dialog.querySelector("form");
    const title = dialog.querySelector("h2");
    const label = dialog.querySelector("label");
    const input = dialog.querySelector("input");
    const help = dialog.querySelector("#tower-admin-help");
    const error = dialog.querySelector("#tower-admin-error");
    const cancel = dialog.querySelector('button[type="button"]');
    const submit = dialog.querySelector('button[type="submit"]');
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = "tower-admin-trigger";
    trigger.textContent = "관리자";
    trigger.hidden = true;
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", dialog.id);
    stage.append(trigger);

    function open(nextMode) {
      if (dialog.open || !eligible || (nextMode === "floor" && !authorized)) return;
      mode = nextMode;
      const floorPrompt = mode === "floor";
      title.textContent = floorPrompt ? "층 이동" : "관리자 인증";
      label.textContent = floorPrompt ? "이동할 층" : "게임 코드";
      input.type = floorPrompt ? "text" : "password";
      input.inputMode = floorPrompt ? "numeric" : "text";
      input.maxLength = floorPrompt ? Math.max(8, String(maxFloor).length) : 96;
      input.value = "";
      input.removeAttribute("aria-invalid");
      help.textContent = floorPrompt ? `1층에서 ${maxFloor}층 사이의 정수를 입력하세요.` : "관리자 게임 코드를 입력하세요.";
      error.textContent = "";
      submit.textContent = floorPrompt ? "이동" : "인증";
      submit.disabled = false;
      dialog.showModal();
      input.focus({ preventScroll: true });
    }

    function reject(message) {
      error.textContent = message;
      input.setAttribute("aria-invalid", "true");
      input.focus({ preventScroll: true });
      input.select();
    }

    function close() {
      attempt++;
      input.value = "";
      dialog.close();
    }

    function clearAuthorization() {
      const wasAuthorized = authorized;
      authorized = false;
      trigger.textContent = "관리자";
      if (wasAuthorized) revoke?.();
    }

    function accountChanged({ user }) {
      const nextId = user?.id ?? null;
      if (accountId === nextId) return;
      accountId = nextId;
      const revision = ++accountRevision;
      eligible = false;
      trigger.hidden = true;
      if (dialog.open) close();
      clearAuthorization();
      if (!nextId) return;
      // Let the SDK finish notifying auth listeners before querying the current session.
      window.setTimeout(async () => {
        if (revision !== accountRevision) return;
        const allowed = await cloud.verifyAdmin(nextId).catch(() => false);
        if (revision !== accountRevision) return;
        eligible = allowed;
        trigger.hidden = !allowed;
      }, 0);
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!dialog.open || !eligible || submit.disabled) return;
      let floor;
      let submitted;
      if (mode === "floor") {
        if (!authorized) return;
        const value = input.value.trim();
        floor = Number(value);
        if (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(floor) || floor < 1 || floor > maxFloor) {
          reject(`1부터 ${maxFloor}까지의 정수를 입력하세요.`);
          return;
        }
      } else {
        if (!input.value) {
          reject("게임 코드를 입력하세요.");
          return;
        }
        if (!window.crypto?.subtle) {
          reject("HTTPS 또는 로컬 주소에서 게임 코드를 입력할 수 있습니다.");
          return;
        }
        submitted = new TextEncoder().encode(accessPrefix + input.value);
        input.value = "";
      }

      const current = ++attempt;
      submit.disabled = true;
      try {
        if (submitted) {
          const hash = await window.crypto.subtle.digest("SHA-256", submitted);
          if (!dialog.open || current !== attempt) return;
          const digest = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
          if (digest !== accessDigest) {
            reject("게임 코드가 맞지 않습니다.");
            return;
          }
        }
        const allowed = await cloud.verifyAdmin(accountId);
        if (!dialog.open || current !== attempt) return;
        if (!allowed) {
          close();
          eligible = false;
          trigger.hidden = true;
          clearAuthorization();
          return;
        }
        if (floor !== undefined) {
          close();
          move(floor);
          return;
        }
        authorized = true;
        trigger.textContent = "층 이동 /";
        close();
      } catch {
        if (dialog.open && current === attempt) reject("관리자 인증을 확인할 수 없습니다. 다시 시도하세요.");
      } finally {
        if (current === attempt) submit.disabled = false;
      }
    });

    input.addEventListener("input", () => {
      input.removeAttribute("aria-invalid");
      error.textContent = "";
    });
    cancel.addEventListener("click", close);
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close();
    });
    trigger.addEventListener("click", () => open(authorized ? "floor" : "access"));
    window.addEventListener("keydown", (event) => {
      if (dialog.open) {
        event.stopImmediatePropagation();
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        return;
      }
      if (!eligible || !authorized || event.key !== "/" || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
      const editing = event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable], [role='textbox']");
      if (editing) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) open("floor");
    }, { capture: true });
    cloud?.subscribe(accountChanged);
  }

  window.TowerAdmin = { setup, isOpen: () => Boolean(dialog?.open) };
})();
