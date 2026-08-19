import { AppError } from "../utils/app-error.js";

/** Penyimpanan room in-memory untuk satu proses signaling server. */
export class RoomRegistry {
  constructor({ maxDevicesPerRoom }) {
    this.rooms = new Map();
    this.sockets = new Map();
    this.maxDevicesPerRoom = maxDevicesPerRoom;
  }

  get(roomCode) {
    return this.rooms.get(roomCode);
  }

  join({ socketId, roomCode, device }) {
    const currentMembership = this.sockets.get(socketId);
    if (currentMembership) {
      this.leave(socketId);
    }

    const room = this.rooms.get(roomCode) ?? new Map();
    const existingDevice = room.get(device.id);
    if (existingDevice && existingDevice.socketId !== socketId) {
      throw new AppError("deviceIdentityInUse");
    }
    if (!existingDevice && room.size >= this.maxDevicesPerRoom) {
      throw new AppError("roomFull");
    }

    const peers = [...room.values()].map(toPublicDevice);
    const membership = {
      socketId,
      roomCode,
      device: { ...device },
      joinedAt: Date.now()
    };

    room.set(device.id, membership);
    this.rooms.set(roomCode, room);
    this.sockets.set(socketId, membership);

    return { device: toPublicDevice(membership), peers };
  }

  leave(socketId) {
    const membership = this.sockets.get(socketId);
    if (!membership) {
      return null;
    }

    const room = this.rooms.get(membership.roomCode);
    room?.delete(membership.device.id);
    if (room?.size === 0) {
      this.rooms.delete(membership.roomCode);
    }
    this.sockets.delete(socketId);

    return {
      roomCode: membership.roomCode,
      device: toPublicDevice(membership)
    };
  }

  getMembership(socketId) {
    return this.sockets.get(socketId) ?? null;
  }

  getPeerInSameRoom(socketId, targetDeviceId) {
    const sender = this.getMembership(socketId);
    if (!sender) {
      return null;
    }

    const target = this.rooms.get(sender.roomCode)?.get(targetDeviceId);
    return target ?? null;
  }
}

function toPublicDevice(membership) {
  return {
    id: membership.device.id,
    name: membership.device.name
  };
}
