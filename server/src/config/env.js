const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const maxDevicesPerRoom = Number.parseInt(process.env.MAX_DEVICES_PER_ROOM ?? "24", 10);
const clientOrigins = (process.env.CLIENT_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  port: Number.isNaN(port) ? 3000 : port,
  clientOrigin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
  maxDevicesPerRoom: Number.isNaN(maxDevicesPerRoom) ? 24 : maxDevicesPerRoom
});
