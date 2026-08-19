import { SIGNAL_EVENTS } from "../../../shared/protocol.js";
import { AppError } from "../utils/app-error.js";
import { validateJoinPayload, validateSignalPayload } from "../utils/validation.js";

/** Mendaftarkan event room dan relay SDP/ICE tanpa pernah menerima payload file. */
export function registerSignalingHandlers(io, { logger, roomRegistry }) {
  io.on("connection", (socket) => {
    logger.info(`Socket terhubung: ${socket.id}`);

    socket.on(SIGNAL_EVENTS.ROOM_JOIN, (payload, acknowledge = noOp) => {
      try {
        const { roomCode, device } = validateJoinPayload(payload);
        const previousMembership = roomRegistry.getMembership(socket.id);
        if (previousMembership && previousMembership.roomCode !== roomCode) {
          socket.leave(previousMembership.roomCode);
          socket.to(previousMembership.roomCode).emit(SIGNAL_EVENTS.ROOM_PEER_LEFT, previousMembership.device);
        }
        const joined = roomRegistry.join({ socketId: socket.id, roomCode, device });
        socket.join(roomCode);

        acknowledge({ ok: true, roomCode, device: joined.device, peers: joined.peers });
        socket.to(roomCode).emit(SIGNAL_EVENTS.ROOM_PEER_JOINED, joined.device);
        logger.info(`Device ${device.id} bergabung ke room ${roomCode}`);
      } catch (error) {
        acknowledge({ ok: false, errorCode: error.code ?? "serverError" });
      }
    });

    socket.on(SIGNAL_EVENTS.ROOM_LEAVE, (acknowledge = noOp) => {
      const departed = roomRegistry.leave(socket.id);
      if (departed) {
        socket.leave(departed.roomCode);
        socket.to(departed.roomCode).emit(SIGNAL_EVENTS.ROOM_PEER_LEFT, departed.device);
      }
      acknowledge({ ok: true });
    });

    registerRelay(socket, io, roomRegistry, SIGNAL_EVENTS.WEBRTC_OFFER, "description");
    registerRelay(socket, io, roomRegistry, SIGNAL_EVENTS.WEBRTC_ANSWER, "description");
    registerRelay(socket, io, roomRegistry, SIGNAL_EVENTS.WEBRTC_ICE_CANDIDATE, "candidate");

    socket.on("disconnect", (reason) => {
      const departed = roomRegistry.leave(socket.id);
      if (departed) {
        io.to(departed.roomCode).emit(SIGNAL_EVENTS.ROOM_PEER_LEFT, departed.device);
      }
      logger.info(`Socket terputus: ${socket.id} (${reason})`);
    });
  });
}

function registerRelay(socket, io, roomRegistry, eventName, payloadKey) {
  socket.on(eventName, (payload, acknowledge = noOp) => {
    try {
      const targetDeviceId = validateSignalPayload(payload);
      const sender = roomRegistry.getMembership(socket.id);
      const target = roomRegistry.getPeerInSameRoom(socket.id, targetDeviceId);
      if (!sender || !target) {
        throw new AppError("targetUnavailable");
      }
      if (!payload?.[payloadKey]) {
        throw new AppError("signalingPayloadIncomplete");
      }

      io.to(target.socketId).emit(eventName, {
        from: sender.device,
        [payloadKey]: payload[payloadKey]
      });
      acknowledge({ ok: true });
    } catch (error) {
      acknowledge({ ok: false, errorCode: error.code ?? "serverError" });
    }
  });
}

function noOp() {}
