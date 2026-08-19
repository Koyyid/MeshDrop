const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const maxDevicesPerRoom = Number.parseInt(process.env.MAX_DEVICES_PER_ROOM ?? "24", 10);

export const env = Object.freeze({
  port: Number.isNaN(port) ? 3000 : port,
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  maxDevicesPerRoom: Number.isNaN(maxDevicesPerRoom) ? 24 : maxDevicesPerRoom
});
