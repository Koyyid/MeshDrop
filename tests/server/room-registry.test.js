import assert from "node:assert/strict";
import test from "node:test";
import { RoomRegistry } from "../../server/src/rooms/room-registry.js";

test("room registry memberi peer yang sudah ada kepada device baru", () => {
  const registry = new RoomRegistry({ maxDevicesPerRoom: 2 });
  registry.join({ socketId: "socket-a", roomCode: "ALPHA", device: { id: "device-a", name: "Laptop" } });

  const joined = registry.join({ socketId: "socket-b", roomCode: "ALPHA", device: { id: "device-b", name: "Phone" } });

  assert.deepEqual(joined.peers, [{ id: "device-a", name: "Laptop" }]);
  assert.equal(registry.getPeerInSameRoom("socket-a", "device-b")?.socketId, "socket-b");
});

test("room registry membersihkan room setelah anggota terakhir keluar", () => {
  const registry = new RoomRegistry({ maxDevicesPerRoom: 2 });
  registry.join({ socketId: "socket-a", roomCode: "ALPHA", device: { id: "device-a", name: "Laptop" } });

  const departed = registry.leave("socket-a");

  assert.deepEqual(departed, { roomCode: "ALPHA", device: { id: "device-a", name: "Laptop" } });
  assert.equal(registry.get("ALPHA"), undefined);
});

test("room registry menolak anggota di atas kapasitas", () => {
  const registry = new RoomRegistry({ maxDevicesPerRoom: 1 });
  registry.join({ socketId: "socket-a", roomCode: "ALPHA", device: { id: "device-a", name: "Laptop" } });

  assert.throws(() => registry.join({
    socketId: "socket-b",
    roomCode: "ALPHA",
    device: { id: "device-b", name: "Phone" }
  }), (error) => error.code === "roomFull");
});
