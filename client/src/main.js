import { appConfig } from "./config/app-config.js";
import { createAppError, getLocale, setLocale, t } from "./i18n/i18n.js";
import { FileTransferService } from "./services/file-transfer.js";
import { PeerManager } from "./services/peer-manager.js";
import { SignalingClient } from "./services/signaling-client.js";
import { RoomStore } from "./state/room-store.js";
import { mountAppShell } from "./ui/app-shell.js";

const rootElement = document.querySelector("#app");
const store = new RoomStore({ locale: getLocale() });
const localDeviceId = getLocalDeviceId();
let peerManager;

const transferService = new FileTransferService({
  chunkSize: appConfig.fileChunkSize,
  highWaterMark: appConfig.bufferedAmountHighWaterMark,
  lowWaterMark: appConfig.bufferedAmountLowWaterMark,
  onTransfer: (transfer) => store.recordTransfer(transfer)
});

const signalingClient = new SignalingClient({
  url: appConfig.signalingUrl,
  handlers: {
    onPeerJoined: (peer) => {
      store.upsertPeer(peer);
      peerManager.connectToPeer(peer).catch(reportError);
    },
    onPeerLeft: (peer) => {
      peerManager.closePeer(peer.id);
      store.removePeer(peer.id);
    },
    onOffer: (payload) => peerManager.handleOffer(payload).catch(reportError),
    onAnswer: (payload) => peerManager.handleAnswer(payload).catch(reportError),
    onIceCandidate: (payload) => peerManager.handleIceCandidate(payload).catch(reportError),
    onDisconnect: () => handleUnexpectedDisconnect(),
    onConnectionError: (error) => {
      if (store.getSnapshot().connectionStatus === "connecting") {
        reportError(error);
      }
    },
    onError: reportError
  }
});

peerManager = new PeerManager({
  rtcConfiguration: appConfig.rtcConfiguration,
  signalingClient,
  fileTransferService: transferService,
  onPeerState: (state) => store.updatePeerConnection(state),
  onError: reportError
});

mountAppShell(rootElement, {
  store,
  defaultDeviceName: getDefaultDeviceName(),
  actions: {
    joinRoom,
    leaveRoom,
    sendFile,
    reportError,
    changeLanguage
  }
});

applyDocumentLanguage(getLocale());

window.addEventListener("beforeunload", () => {
  signalingClient.leaveRoom().catch(() => undefined);
  peerManager.closeAll();
  transferService.dispose();
});

async function joinRoom({ roomCode, deviceName }) {
  const normalizedRoomCode = roomCode.trim().toUpperCase();
  const normalizedDeviceName = deviceName.trim().replace(/\s+/g, " ");
  if (!normalizedRoomCode || !normalizedDeviceName) {
    reportError("deviceNameRoomRequired");
    return;
  }

  try {
    store.setConnectionStatus("connecting");
    store.clearNotice();
    await signalingClient.connect();
    const joined = await signalingClient.joinRoom({
      roomCode: normalizedRoomCode,
      deviceName: normalizedDeviceName,
      deviceId: localDeviceId
    });
    store.enterRoom(joined);
  } catch (error) {
    store.setConnectionStatus("idle");
    reportError(error);
  }
}

async function leaveRoom() {
  try {
    await signalingClient.leaveRoom();
  } catch (error) {
    reportError(error);
  } finally {
    peerManager.closeAll();
    transferService.dispose();
    store.reset({ notice: { type: "info", key: "notices.leftRoom" } });
  }
}

async function sendFile(file, targetDeviceId) {
  const peerIds = targetDeviceId === "all"
    ? peerManager.getReadyPeerIds()
    : [targetDeviceId];
  if (!peerIds.length) {
    reportError("noReadyPeer");
    return;
  }

  const results = await Promise.allSettled(peerIds.map((peerId) => peerManager.sendFile(peerId, file)));
  const failed = results.filter((result) => result.status === "rejected").length;
  if (failed) {
    reportError(createAppError("transfersCouldNotComplete", { count: failed }));
  } else {
    store.setNotice("success", "notices.fileSent", { count: peerIds.length });
  }
}

function handleUnexpectedDisconnect() {
  if (!store.getSnapshot().roomCode) {
    return;
  }
  peerManager.closeAll();
  transferService.dispose();
  store.reset({ notice: { type: "error", key: "errors.signalingDisconnected" } });
}

function reportError(error) {
  const code = typeof error === "string" ? error : error?.code ?? "unknownError";
  const params = typeof error === "string" ? {} : error?.params ?? {};
  store.setNotice("error", `errors.${code}`, params);
}

function changeLanguage(locale) {
  const activeLocale = setLocale(locale);
  store.setLocale(activeLocale);
  applyDocumentLanguage(activeLocale);
}

function applyDocumentLanguage(locale) {
  document.documentElement.lang = locale;
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("ui.intro"));
}

function getLocalDeviceId() {
  const storageKey = "meshdop.device-id";
  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }
  const deviceId = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  window.sessionStorage.setItem(storageKey, deviceId);
  return deviceId;
}

function getDefaultDeviceName() {
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? t("ui.defaultDeviceName");
  return String(platform).slice(0, 32) || t("ui.defaultDeviceName");
}
