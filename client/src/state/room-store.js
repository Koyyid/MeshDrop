/** State tunggal UI untuk room aktif, bahasa, device lokal, peer, dan transfer. */
export class RoomStore {
  constructor({ locale }) {
    this.state = {
      locale,
      roomCode: null,
      localDevice: null,
      peers: [],
      transfers: [],
      connectionStatus: "idle",
      notice: null
    };
    this.subscribers = new Set();
  }

  subscribe(listener) {
    this.subscribers.add(listener);
    listener(this.getSnapshot());
    return () => this.subscribers.delete(listener);
  }

  getSnapshot() {
    return {
      ...this.state,
      localDevice: this.state.localDevice ? { ...this.state.localDevice } : null,
      peers: this.state.peers.map((peer) => ({ ...peer })),
      transfers: this.state.transfers.map((transfer) => ({ ...transfer })),
      notice: this.state.notice ? { ...this.state.notice } : null
    };
  }

  enterRoom({ roomCode, device, peers }) {
    this.#set({
      locale: this.state.locale,
      roomCode,
      localDevice: device,
      peers: peers.map((peer) => ({ ...peer, connectionState: "waiting", dataChannelState: "waiting" })),
      transfers: [],
      connectionStatus: "connected",
      notice: { type: "success", key: "notices.joinedRoom", params: { roomCode } }
    });
  }

  reset({ notice = null } = {}) {
    this.#set({
      locale: this.state.locale,
      roomCode: null,
      localDevice: null,
      peers: [],
      transfers: [],
      connectionStatus: "idle",
      notice
    });
  }

  setConnectionStatus(connectionStatus) {
    this.#set({ ...this.state, connectionStatus });
  }

  setLocale(locale) {
    this.#set({ ...this.state, locale });
  }

  setNotice(type, key, params = {}) {
    this.#set({ ...this.state, notice: { type, key, params } });
  }

  clearNotice() {
    this.#set({ ...this.state, notice: null });
  }

  upsertPeer(device) {
    if (device.id === this.state.localDevice?.id) {
      return;
    }
    const existing = this.state.peers.find((peer) => peer.id === device.id);
    const peer = existing
      ? { ...existing, ...device }
      : { ...device, connectionState: "connecting", dataChannelState: "connecting" };
    const peers = existing
      ? this.state.peers.map((candidate) => candidate.id === device.id ? peer : candidate)
      : [...this.state.peers, peer];
    this.#set({ ...this.state, peers });
  }

  removePeer(deviceId) {
    this.#set({ ...this.state, peers: this.state.peers.filter((peer) => peer.id !== deviceId) });
  }

  updatePeerConnection({ id, connectionState, dataChannelState }) {
    const peers = this.state.peers.map((peer) => peer.id === id
      ? { ...peer, connectionState, dataChannelState }
      : peer);
    this.#set({ ...this.state, peers });
  }

  recordTransfer(update) {
    const existing = this.state.transfers.find((transfer) => transfer.id === update.id);
    const transfer = existing ? { ...existing, ...update } : update;
    const transfers = existing
      ? this.state.transfers.map((candidate) => candidate.id === update.id ? transfer : candidate)
      : [transfer, ...this.state.transfers].slice(0, 50);
    this.#set({ ...this.state, transfers });
  }

  #set(nextState) {
    this.state = nextState;
    const snapshot = this.getSnapshot();
    this.subscribers.forEach((listener) => listener(snapshot));
  }
}
