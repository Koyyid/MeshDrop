import { createAppError, t } from "../i18n/i18n.js";

/** Mengelola satu RTCPeerConnection dan satu DataChannel untuk setiap device remote. */
export class PeerManager {
  constructor({ rtcConfiguration, signalingClient, fileTransferService, onPeerState, onError }) {
    this.rtcConfiguration = rtcConfiguration;
    this.signalingClient = signalingClient;
    this.fileTransferService = fileTransferService;
    this.onPeerState = onPeerState;
    this.onError = onError;
    this.peers = new Map();
  }

  async connectToPeer(device) {
    if (this.peers.has(device.id)) {
      return;
    }

    const peer = this.#createPeer(device, { createsDataChannel: true });
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    await this.signalingClient.sendOffer(device.id, peer.connection.localDescription);
  }

  async handleOffer({ from, description }) {
    const peer = this.peers.get(from.id) ?? this.#createPeer(from, { createsDataChannel: false });
    await peer.connection.setRemoteDescription(new RTCSessionDescription(description));
    await this.#flushPendingCandidates(peer);

    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    await this.signalingClient.sendAnswer(from.id, peer.connection.localDescription);
  }

  async handleAnswer({ from, description }) {
    const peer = this.peers.get(from.id);
    if (!peer) {
      throw createAppError("unknownPeerAnswer");
    }
    await peer.connection.setRemoteDescription(new RTCSessionDescription(description));
    await this.#flushPendingCandidates(peer);
  }

  async handleIceCandidate({ from, candidate }) {
    const peer = this.peers.get(from.id) ?? this.#createPeer(from, { createsDataChannel: false });
    if (!peer.connection.remoteDescription) {
      peer.pendingCandidates.push(candidate);
      return;
    }
    await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  async sendFile(peerId, file) {
    const peer = this.peers.get(peerId);
    if (!peer?.dataChannel || peer.dataChannel.readyState !== "open") {
      throw createAppError("directConnectionNotReady", { deviceName: peer?.device.name ?? t("ui.targetDevice") });
    }
    return this.fileTransferService.sendFile({
      peerId,
      peerName: peer.device.name,
      channel: peer.dataChannel,
      file
    });
  }

  getReadyPeerIds() {
    return [...this.peers.values()]
      .filter((peer) => peer.dataChannel?.readyState === "open")
      .map((peer) => peer.device.id);
  }

  closePeer(peerId) {
    const peer = this.peers.get(peerId);
    if (!peer) {
      return;
    }
    peer.dataChannel?.close();
    peer.connection.close();
    this.peers.delete(peerId);
    this.#notifyPeerState(peer, "closed", "closed");
  }

  closeAll() {
    [...this.peers.keys()].forEach((peerId) => this.closePeer(peerId));
  }

  #createPeer(device, { createsDataChannel }) {
    const connection = new RTCPeerConnection(this.rtcConfiguration);
    const peer = {
      device,
      connection,
      dataChannel: null,
      pendingCandidates: []
    };
    this.peers.set(device.id, peer);

    connection.onicecandidate = ({ candidate }) => {
      if (!candidate) {
        return;
      }
      this.signalingClient.sendIceCandidate(device.id, candidate.toJSON()).catch((error) => this.#reportError(error));
    };
    connection.onconnectionstatechange = () => {
      this.#notifyPeerState(peer, connection.connectionState, peer.dataChannel?.readyState ?? "connecting");
      if (connection.connectionState === "failed") {
        this.#reportError(createAppError("peerConnectionFailed", { deviceName: device.name }));
      }
    };
    connection.ondatachannel = ({ channel }) => this.#wireDataChannel(peer, channel);

    if (createsDataChannel) {
      this.#wireDataChannel(peer, connection.createDataChannel("meshdop-file", { ordered: true }));
    }
    this.#notifyPeerState(peer, "connecting", "connecting");
    return peer;
  }

  #wireDataChannel(peer, channel) {
    if (peer.dataChannel && peer.dataChannel !== channel) {
      channel.close();
      return;
    }
    peer.dataChannel = channel;
    channel.binaryType = "arraybuffer";
    channel.onopen = () => this.#notifyPeerState(peer, peer.connection.connectionState, "open");
    channel.onclose = () => this.#notifyPeerState(peer, peer.connection.connectionState, "closed");
    channel.onerror = () => this.#reportError(createAppError("dataChannelError", { deviceName: peer.device.name }));
    channel.onmessage = ({ data }) => {
      this.fileTransferService.handleData({ peerId: peer.device.id, peerName: peer.device.name, data })
        .catch((error) => this.#reportError(error));
    };
  }

  async #flushPendingCandidates(peer) {
    const candidates = peer.pendingCandidates.splice(0);
    for (const candidate of candidates) {
      await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }

  #notifyPeerState(peer, connectionState, dataChannelState) {
    this.onPeerState?.({
      id: peer.device.id,
      connectionState,
      dataChannelState
    });
  }

  #reportError(error) {
    this.onError?.(error);
  }
}
