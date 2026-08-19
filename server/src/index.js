import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { RoomRegistry } from "./rooms/room-registry.js";
import { registerSignalingHandlers } from "./signaling/handlers.js";
import { logger } from "./utils/logger.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientDirectory = path.resolve(currentDirectory, "../../client");
const sharedDirectory = path.resolve(currentDirectory, "../../shared");
const app = express();
const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: env.clientOrigin }
});
const roomRegistry = new RoomRegistry({ maxDevicesPerRoom: env.maxDevicesPerRoom });

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});
app.use(express.static(clientDirectory));
app.use("/shared", express.static(sharedDirectory));

registerSignalingHandlers(io, { logger, roomRegistry });

httpServer.listen(env.port, () => {
  logger.info(`MeshDrop signaling server berjalan di http://localhost:${env.port}`);
});
