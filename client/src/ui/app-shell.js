import { escapeHtml } from "../utils/dom.js";
import { languageOptions, t } from "../i18n/i18n.js";

/** Merender UI room, daftar device, dan riwayat transfer tanpa framework. */
export function mountAppShell(rootElement, { store, actions, defaultDeviceName }) {
  if (!rootElement) {
    throw new Error("Elemen root aplikasi tidak ditemukan.");
  }

  rootElement.addEventListener("submit", (event) => handleSubmit(event, actions));
  rootElement.addEventListener("click", (event) => {
    if (event.target.closest("[data-action='leave-room']")) {
      actions.leaveRoom();
    }
  });
  rootElement.addEventListener("change", (event) => {
    if (event.target instanceof HTMLSelectElement && event.target.dataset.action === "change-language") {
      actions.changeLanguage(event.target.value);
    }
  });

  const unsubscribe = store.subscribe((state) => {
    rootElement.innerHTML = state.roomCode
      ? renderRoom(state)
      : renderJoin(state, defaultDeviceName);
  });

  return {
    destroy() {
      unsubscribe();
      rootElement.replaceChildren();
    }
  };
}

function handleSubmit(event, actions) {
  if (!(event.target instanceof HTMLFormElement)) {
    return;
  }
  event.preventDefault();
  const formData = new FormData(event.target);

  if (event.target.id === "join-form") {
    actions.joinRoom({
      roomCode: String(formData.get("roomCode") ?? ""),
      deviceName: String(formData.get("deviceName") ?? "")
    });
    return;
  }

  if (event.target.id === "send-file-form") {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0 && !file.name) {
      actions.reportError("chooseFile");
      return;
    }
    actions.sendFile(file, String(formData.get("targetDeviceId") ?? "all"));
  }
}

function renderJoin(state, defaultDeviceName) {
  const notice = renderNotice(state.notice);
  const isConnecting = state.connectionStatus === "connecting";
  return `
    <section class="app-shell join-shell">
      ${renderLanguagePicker(state.locale)}
      <div class="brand-mark" aria-hidden="true">⇄</div>
      <p class="eyebrow">${t("ui.eyebrow")}</p>
      <h1>MeshDrop</h1>
      <p class="intro">${t("ui.intro")}</p>
      ${notice}
      <form id="join-form" class="stack-form">
        <label>${t("ui.deviceName")}
          <input name="deviceName" minlength="2" maxlength="32" value="${escapeHtml(defaultDeviceName)}" autocomplete="nickname" required />
        </label>
        <label>${t("ui.roomCode")}
          <input name="roomCode" class="code-input" minlength="4" maxlength="20" placeholder="${escapeHtml(t("ui.roomCodePlaceholder"))}" autocomplete="off" autocapitalize="characters" required />
        </label>
        <button class="primary-button" type="submit" ${isConnecting ? "disabled" : ""}>
          ${isConnecting ? t("ui.connecting") : t("ui.joinRoom")}
        </button>
      </form>
      <p class="hint">${t("ui.roomCodeHint")}</p>
    </section>
  `;
}

function renderRoom(state) {
  const readyPeers = state.peers.filter((peer) => peer.dataChannelState === "open");
  return `
    <section class="app-shell room-shell">
      <header class="room-header">
        <div>
          <p class="eyebrow">${t("ui.activeRoom")}</p>
          <h1>${escapeHtml(state.roomCode)}</h1>
        </div>
        <div class="room-actions">
          ${renderLanguagePicker(state.locale)}
          <button class="secondary-button" type="button" data-action="leave-room">${t("ui.leaveRoom")}</button>
        </div>
      </header>
      ${renderNotice(state.notice)}
      <section class="local-device" aria-label="${escapeHtml(t("ui.currentDevice"))}">
        <span class="device-dot ready"></span>
        <div><strong>${escapeHtml(state.localDevice.name)}</strong><small>${t("ui.thisDevice")}</small></div>
      </section>
      <section class="panel">
        <div class="section-heading"><h2>${t("ui.devicesInRoom")}</h2><span>${state.peers.length}</span></div>
        ${renderPeerList(state.peers)}
      </section>
      <section class="panel transfer-panel">
        <div class="section-heading"><h2>${t("ui.sendFile")}</h2><span>${t("ui.readyCount", { count: readyPeers.length })}</span></div>
        <form id="send-file-form" class="stack-form">
          <label class="file-input-label">${t("ui.chooseFile")}
            <input type="file" name="file" required ${readyPeers.length ? "" : "disabled"} />
          </label>
          <label>${t("ui.recipients")}
            <select name="targetDeviceId" ${readyPeers.length ? "" : "disabled"}>
              <option value="all">${t("ui.allReadyDevices", { count: readyPeers.length })}</option>
              ${readyPeers.map((peer) => `<option value="${escapeHtml(peer.id)}">${escapeHtml(peer.name)}</option>`).join("")}
            </select>
          </label>
          <button class="primary-button" type="submit" ${readyPeers.length ? "" : "disabled"}>${t("ui.sendFile")}</button>
        </form>
        ${readyPeers.length ? "" : `<p class="hint">${t("ui.waitingForPeer")}</p>`}
      </section>
      <section class="panel">
        <div class="section-heading"><h2>${t("ui.recentTransfers")}</h2><span>${state.transfers.length}</span></div>
        ${renderTransferList(state.transfers)}
      </section>
    </section>
  `;
}

function renderPeerList(peers) {
  if (!peers.length) {
    return `<p class="empty-state">${t("ui.noPeers")}</p>`;
  }
  return `<ul class="device-list">${peers.map((peer) => {
    const isReady = peer.dataChannelState === "open";
    return `<li>
      <span class="device-dot ${isReady ? "ready" : "pending"}"></span>
      <div><strong>${escapeHtml(peer.name)}</strong><small>${isReady ? t("ui.readyToReceive") : peerStatus(peer)}</small></div>
    </li>`;
  }).join("")}</ul>`;
}

function renderTransferList(transfers) {
  if (!transfers.length) {
    return `<p class="empty-state">${t("ui.noTransferActivity")}</p>`;
  }
  return `<ul class="transfer-list">${transfers.map((transfer) => {
    const isIncoming = transfer.direction === "incoming";
    const action = transfer.downloadUrl
      ? `<a class="download-link" href="${escapeHtml(transfer.downloadUrl)}" download="${escapeHtml(transfer.fileName)}">${t("ui.download")}</a>`
      : "";
    return `<li>
      <div class="transfer-topline">
        <strong>${escapeHtml(transfer.fileName)}</strong>
        <span class="transfer-status ${escapeHtml(transfer.status)}">${transferStatus(transfer.status)}</span>
      </div>
      <small>${isIncoming ? t("ui.from") : t("ui.to")} ${escapeHtml(transfer.peerName)} · ${formatBytes(transfer.size)}</small>
      <div class="progress-track" aria-label="${escapeHtml(t("ui.transferProgress"))}"><span style="width:${Math.round((transfer.progress ?? 0) * 100)}%"></span></div>
      <div class="transfer-footer"><small>${Math.round((transfer.progress ?? 0) * 100)}%</small>${action}</div>
      ${transfer.errorCode ? `<small class="error-text">${escapeHtml(t(`errors.${transfer.errorCode}`, transfer.errorParams))}</small>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

function renderNotice(notice) {
  return notice ? `<p class="notice ${escapeHtml(notice.type)}" role="status">${escapeHtml(t(notice.key, notice.params))}</p>` : "";
}

function peerStatus(peer) {
  if (peer.connectionState === "failed") return t("status.connectionFailed");
  if (peer.connectionState === "closed") return t("status.connectionClosed");
  return t("ui.connecting");
}

function transferStatus(status) {
  const key = {
    sending: "status.sending",
    sent: "status.sent",
    receiving: "status.receiving",
    received: "status.received",
    failed: "status.failed",
    cancelled: "status.cancelled"
  }[status];
  return key ? t(key) : status;
}

function renderLanguagePicker(locale) {
  return `<label class="language-picker">${t("ui.language")}
    <select data-action="change-language" aria-label="${escapeHtml(t("ui.language"))}">
      ${languageOptions.map((language) => `<option value="${language.code}" ${language.code === locale ? "selected" : ""}>${language.label}</option>`).join("")}
    </select>
  </label>`;
}

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** unitIndex).toFixed(unitIndex ? 1 : 0)} ${units[unitIndex]}`;
}
