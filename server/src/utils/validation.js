import { LIMITS } from "../../../shared/protocol.js";
import { AppError } from "./app-error.js";

const roomCodePattern = new RegExp(`^[A-Z0-9]{${LIMITS.roomCodeMinLength},${LIMITS.roomCodeMaxLength}}$`);
const deviceIdPattern = /^[a-zA-Z0-9_-]{8,80}$/;

export function validateJoinPayload(payload) {
  const roomCode = String(payload?.roomCode ?? "").trim().toUpperCase();
  const deviceName = String(payload?.deviceName ?? "").trim().replace(/\s+/g, " ");
  const deviceId = String(payload?.deviceId ?? "").trim();

  if (!roomCodePattern.test(roomCode)) {
    throw new AppError("roomCodeInvalid");
  }
  if (deviceName.length < LIMITS.deviceNameMinLength || deviceName.length > LIMITS.deviceNameMaxLength) {
    throw new AppError("deviceNameInvalid");
  }
  if (!deviceIdPattern.test(deviceId)) {
    throw new AppError("deviceIdentityInvalid");
  }

  return { roomCode, device: { id: deviceId, name: deviceName } };
}

export function validateSignalPayload(payload) {
  const targetDeviceId = String(payload?.targetDeviceId ?? "").trim();
  if (!deviceIdPattern.test(targetDeviceId)) {
    throw new AppError("targetDeviceInvalid");
  }
  return targetDeviceId;
}
