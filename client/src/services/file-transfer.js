import { DATA_CHANNEL_MESSAGES, LIMITS } from "/shared/protocol.js";
import { createAppError } from "../i18n/i18n.js";

/** Menangani metadata, chunk, backpressure, progres, dan penerimaan file DataChannel. */
export class FileTransferService {
  constructor({ chunkSize, highWaterMark, lowWaterMark, onTransfer }) {
    this.chunkSize = chunkSize;
    this.highWaterMark = highWaterMark;
    this.lowWaterMark = lowWaterMark;
    this.onTransfer = onTransfer;
    this.outgoingQueues = new Map();
    this.incomingTransfers = new Map();
    this.downloadUrls = new Set();
  }

  sendFile({ peerId, peerName, channel, file }) {
    const previous = this.outgoingQueues.get(peerId) ?? Promise.resolve();
    const task = previous.catch(() => undefined).then(() => this.#sendFile({ peerId, peerName, channel, file }));
    this.outgoingQueues.set(peerId, task);
    const clearQueue = () => {
      if (this.outgoingQueues.get(peerId) === task) {
        this.outgoingQueues.delete(peerId);
      }
    };
    task.then(clearQueue, clearQueue);
    return task;
  }

  async handleData({ peerId, peerName, data }) {
    if (typeof data === "string") {
      this.#handleControlMessage(peerId, peerName, data);
      return;
    }

    const chunk = data instanceof Blob ? await data.arrayBuffer() : data;
    if (!(chunk instanceof ArrayBuffer)) {
      throw createAppError("unsupportedFileData");
    }

    const transfer = this.incomingTransfers.get(peerId);
    if (!transfer) {
      return;
    }
    transfer.chunks.push(chunk);
    transfer.receivedBytes += chunk.byteLength;
    if (transfer.receivedBytes > transfer.size) {
      this.incomingTransfers.delete(peerId);
      throw createAppError("fileExceedsSize");
    }
    this.#notify({ ...transfer, status: "receiving", progress: progressOf(transfer.receivedBytes, transfer.size) });
  }

  dispose() {
    for (const url of this.downloadUrls) {
      URL.revokeObjectURL(url);
    }
    this.downloadUrls.clear();
    this.incomingTransfers.clear();
  }

  async #sendFile({ peerId, peerName, channel, file }) {
    if (!(file instanceof File) || file.size < 0) {
      throw createAppError("invalidSelectedFile");
    }
    if (channel.readyState !== "open") {
      throw createAppError("directConnectionNotReady", { deviceName: peerName });
    }

    const transfer = {
      id: createTransferId(),
      direction: "outgoing",
      peerId,
      peerName,
      fileName: file.name || "file",
      size: file.size,
      sentBytes: 0,
      status: "sending",
      progress: 0,
      startedAt: Date.now()
    };
    this.#notify(transfer);

    try {
      channel.send(JSON.stringify({
        type: DATA_CHANNEL_MESSAGES.FILE_METADATA,
        transferId: transfer.id,
        file: {
          name: transfer.fileName,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }));

      for (let offset = 0; offset < file.size; offset += this.chunkSize) {
        await waitForChannelDrain(channel, this.highWaterMark, this.lowWaterMark);
        const chunk = await file.slice(offset, offset + this.chunkSize).arrayBuffer();
        channel.send(chunk);
        transfer.sentBytes += chunk.byteLength;
        transfer.progress = progressOf(transfer.sentBytes, transfer.size);
        this.#notify({ ...transfer });
      }

      channel.send(JSON.stringify({ type: DATA_CHANNEL_MESSAGES.FILE_COMPLETE, transferId: transfer.id }));
      this.#notify({ ...transfer, status: "sent", progress: 1, completedAt: Date.now() });
      return transfer.id;
    } catch (error) {
      if (channel.readyState === "open") {
        channel.send(JSON.stringify({ type: DATA_CHANNEL_MESSAGES.FILE_CANCEL, transferId: transfer.id }));
      }
      this.#notify({ ...transfer, status: "failed", errorCode: error.code ?? "unknownError", errorParams: error.params ?? {} });
      throw error;
    }
  }

  #handleControlMessage(peerId, peerName, rawMessage) {
    let message;
    try {
      message = JSON.parse(rawMessage);
    } catch {
      throw createAppError("invalidFileControlMessage");
    }

    if (message.type === DATA_CHANNEL_MESSAGES.FILE_METADATA) {
      this.#beginIncomingTransfer(peerId, peerName, message);
      return;
    }
    if (message.type === DATA_CHANNEL_MESSAGES.FILE_COMPLETE) {
      this.#completeIncomingTransfer(peerId, message.transferId);
      return;
    }
    if (message.type === DATA_CHANNEL_MESSAGES.FILE_CANCEL) {
      const transfer = this.incomingTransfers.get(peerId);
      if (transfer?.id === message.transferId) {
        this.incomingTransfers.delete(peerId);
        this.#notify({ ...transfer, status: "cancelled" });
      }
    }
  }

  #beginIncomingTransfer(peerId, peerName, message) {
    const file = message.file;
    const size = Number(file?.size);
    const fileName = String(file?.name ?? "file").slice(0, 255);
    if (!message.transferId || !Number.isSafeInteger(size) || size < 0 || size > LIMITS.maxIncomingFileSize || !fileName) {
      throw createAppError("invalidFileMetadata");
    }

    const activeTransfer = this.incomingTransfers.get(peerId);
    if (activeTransfer) {
      this.#notify({ ...activeTransfer, status: "cancelled" });
    }
    const transfer = {
      id: message.transferId,
      direction: "incoming",
      peerId,
      peerName,
      fileName,
      fileType: String(file.type ?? "application/octet-stream"),
      size,
      receivedBytes: 0,
      chunks: [],
      status: "receiving",
      progress: 0,
      startedAt: Date.now()
    };
    this.incomingTransfers.set(peerId, transfer);
    this.#notify(transfer);
  }

  #completeIncomingTransfer(peerId, transferId) {
    const transfer = this.incomingTransfers.get(peerId);
    if (!transfer || transfer.id !== transferId) {
      return;
    }
    this.incomingTransfers.delete(peerId);
    if (transfer.receivedBytes !== transfer.size) {
      this.#notify({ ...transfer, status: "failed", errorCode: "incompleteFile" });
      return;
    }

    const downloadUrl = URL.createObjectURL(new Blob(transfer.chunks, { type: transfer.fileType }));
    this.downloadUrls.add(downloadUrl);
    this.#notify({
      ...transfer,
      chunks: undefined,
      status: "received",
      progress: 1,
      completedAt: Date.now(),
      downloadUrl
    });
  }

  #notify(transfer) {
    const { chunks, ...transferForUi } = transfer;
    this.onTransfer?.(transferForUi);
  }
}

function createTransferId() {
  return globalThis.crypto?.randomUUID?.() ?? `transfer-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function progressOf(completed, total) {
  return total === 0 ? 1 : Math.min(completed / total, 1);
}

function waitForChannelDrain(channel, highWaterMark, lowWaterMark) {
  if (channel.readyState !== "open") {
    return Promise.reject(createAppError("dataChannelClosed"));
  }
  if (channel.bufferedAmount <= highWaterMark) {
    return Promise.resolve();
  }

  channel.bufferedAmountLowThreshold = lowWaterMark;
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(createAppError("dataChannelDrainTimeout"));
    }, 20_000);
    const onLow = () => {
      cleanup();
      resolve();
    };
    const onClose = () => {
      cleanup();
      reject(createAppError("dataChannelClosed"));
    };
    const cleanup = () => {
      window.clearTimeout(timeout);
      channel.removeEventListener("bufferedamountlow", onLow);
      channel.removeEventListener("close", onClose);
    };
    channel.addEventListener("bufferedamountlow", onLow, { once: true });
    channel.addEventListener("close", onClose, { once: true });
    if (channel.bufferedAmount <= lowWaterMark) {
      onLow();
    }
  });
}
