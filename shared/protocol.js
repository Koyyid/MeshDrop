/**
 * Kontrak nama event untuk signaling Socket.IO dan pesan kontrol DataChannel.
 * File ini sengaja bebas dari API browser maupun Node agar dapat diimpor dari keduanya.
 */
export const SIGNAL_EVENTS = Object.freeze({
  ROOM_JOIN: "room:join",
  ROOM_JOINED: "room:joined",
  ROOM_LEAVE: "room:leave",
  ROOM_PEER_JOINED: "room:peer-joined",
  ROOM_PEER_LEFT: "room:peer-left",
  WEBRTC_OFFER: "webrtc:offer",
  WEBRTC_ANSWER: "webrtc:answer",
  WEBRTC_ICE_CANDIDATE: "webrtc:ice-candidate",
  ERROR: "app:error"
});

export const DATA_CHANNEL_MESSAGES = Object.freeze({
  FILE_METADATA: "file:metadata",
  FILE_CHUNK: "file:chunk",
  FILE_COMPLETE: "file:complete",
  FILE_CANCEL: "file:cancel"
});

export const LIMITS = Object.freeze({
  roomCodeMinLength: 4,
  roomCodeMaxLength: 20,
  deviceNameMinLength: 2,
  deviceNameMaxLength: 32,
  maxDevicesPerRoom: 24,
  maxIncomingFileSize: 2 * 1024 * 1024 * 1024
});
