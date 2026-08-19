const querySignalingUrl = new URLSearchParams(window.location.search).get("signal");
const configuredSignalingUrl = querySignalingUrl ?? globalThis.MESHDROP_CONFIG?.signalingUrl?.trim();

/** Konfigurasi runtime browser; TURN/STUN produksi akan ditambahkan di tahap koneksi. */
export const appConfig = Object.freeze({
  signalingUrl: normalizeSignalingUrl(configuredSignalingUrl) ?? window.location.origin,
  rtcConfiguration: {
    // STUN publik cukup untuk development. Tambahkan TURN berautentikasi di production.
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  },
  fileChunkSize: 64 * 1024,
  bufferedAmountHighWaterMark: 1024 * 1024,
  bufferedAmountLowWaterMark: 256 * 1024
});

function normalizeSignalingUrl(value) {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : null;
  } catch {
    return null;
  }
}
