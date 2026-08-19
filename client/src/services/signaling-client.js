import { io } from "https://cdn.socket.io/4.8.3/socket.io.esm.min.js";
import { createAppError } from "../i18n/i18n.js";
import { SIGNAL_EVENTS } from "../../shared/protocol.js";

/** Adapter Socket.IO untuk room dan relay negosiasi WebRTC. */
export class SignalingClient {
  constructor({ url, handlers = {} }) {
    this.handlers = handlers;
    this.socket = io(url, {
      autoConnect: false,
      reconnection: false
    });
    this.#bindEvents();
  }

  connect() {
    if (this.socket.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const handleConnect = () => {
        cleanup();
        resolve();
      };
      const handleError = (error) => {
        cleanup();
        reject(createAppError("signalingConnectionFailed"));
      };
      const cleanup = () => {
        this.socket.off("connect", handleConnect);
        this.socket.off("connect_error", handleError);
      };

      this.socket.once("connect", handleConnect);
      this.socket.once("connect_error", handleError);
      this.socket.connect();
    });
  }

  joinRoom({ roomCode, deviceName, deviceId }) {
    return this.#emitWithAcknowledgement(SIGNAL_EVENTS.ROOM_JOIN, { roomCode, deviceName, deviceId });
  }

  leaveRoom() {
    if (!this.socket.connected) {
      return Promise.resolve({ ok: true });
    }
    return this.#emitWithAcknowledgement(SIGNAL_EVENTS.ROOM_LEAVE);
  }

  sendOffer(targetDeviceId, description) {
    return this.#emitWithAcknowledgement(SIGNAL_EVENTS.WEBRTC_OFFER, { targetDeviceId, description });
  }

  sendAnswer(targetDeviceId, description) {
    return this.#emitWithAcknowledgement(SIGNAL_EVENTS.WEBRTC_ANSWER, { targetDeviceId, description });
  }

  sendIceCandidate(targetDeviceId, candidate) {
    return this.#emitWithAcknowledgement(SIGNAL_EVENTS.WEBRTC_ICE_CANDIDATE, { targetDeviceId, candidate });
  }

  disconnect() {
    this.socket.disconnect();
  }

  #bindEvents() {
    this.socket.on(SIGNAL_EVENTS.ROOM_PEER_JOINED, (peer) => this.handlers.onPeerJoined?.(peer));
    this.socket.on(SIGNAL_EVENTS.ROOM_PEER_LEFT, (peer) => this.handlers.onPeerLeft?.(peer));
    this.socket.on(SIGNAL_EVENTS.WEBRTC_OFFER, (payload) => this.handlers.onOffer?.(payload));
    this.socket.on(SIGNAL_EVENTS.WEBRTC_ANSWER, (payload) => this.handlers.onAnswer?.(payload));
    this.socket.on(SIGNAL_EVENTS.WEBRTC_ICE_CANDIDATE, (payload) => this.handlers.onIceCandidate?.(payload));
    this.socket.on(SIGNAL_EVENTS.ERROR, (payload) => this.handlers.onError?.(createAppError(payload?.errorCode ?? "serverError")));
    this.socket.on("disconnect", (reason) => this.handlers.onDisconnect?.(reason));
    this.socket.on("connect_error", () => this.handlers.onConnectionError?.(createAppError("signalingConnectionFailed")));
  }

  #emitWithAcknowledgement(eventName, payload) {
    if (!this.socket.connected) {
      return Promise.reject(createAppError("notConnected"));
    }

    return new Promise((resolve, reject) => {
      const acknowledge = (timeoutError, response) => {
        if (timeoutError) {
          reject(createAppError("signalingNoResponse"));
          return;
        }
        if (!response?.ok) {
          reject(createAppError(response?.errorCode ?? "signalingDenied"));
          return;
        }
        resolve(response);
      };
      if (payload === undefined) {
        this.socket.timeout(10_000).emit(eventName, acknowledge);
      } else {
        this.socket.timeout(10_000).emit(eventName, payload, acknowledge);
      }
    });
  }
}
