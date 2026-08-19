# MeshDrop

MeshDrop adalah web app untuk mengirim file langsung antar-device dalam satu room. Signaling berjalan melalui Socket.IO, sedangkan file berjalan peer-to-peer melalui WebRTC `RTCDataChannel`; server tidak menerima atau menyimpan isi file.

## Fitur yang tersedia

- Join room memakai room code dan nama device.
- Banyak device dalam satu room (batas default: 24 device).
- Daftar device dan status kesiapan koneksi langsung.
- Kirim file ke satu device atau semua device yang siap.
- Progres pengiriman/penerimaan, antrean per device, dan tautan unduhan untuk file masuk.
- Validasi room, device, target signaling, serta ukuran metadata file.

## Menjalankan lokal

Prasyarat: Node.js 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` pada minimal dua browser context (misalnya dua browser atau dua jendela private), gunakan room code yang sama, lalu tunggu status device menjadi **Siap menerima file**.

```bash
npm test
```

## Konfigurasi

Salin `.env.example` menjadi `.env` dan isi environment melalui shell/deployment Anda. Runtime Node bawaan tidak memuat berkas `.env` secara otomatis.

| Environment | Default | Fungsi |
| --- | --- | --- |
| `PORT` | `3000` | Port HTTP dan Socket.IO. |
| `CLIENT_ORIGIN` | `http://localhost:3000` | Origin yang diizinkan Socket.IO saat frontend di-host terpisah. |
| `MAX_DEVICES_PER_ROOM` | `24` | Batas anggota sebuah room pada satu proses server. |

## GitHub Pages

Workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) menerbitkan frontend statis setiap ada push ke branch `main`. Setelah deployment GitHub selesai, halaman tersedia di:

```text
https://koyyid.github.io/MeshDrop/
```

GitHub Pages **tidak menjalankan** signaling server Node.js. Agar transfer file berfungsi pada halaman tersebut:

1. Deploy folder `server/` ke host Node.js/HTTPS terpisah (misalnya VPS, Render, Railway, atau Fly.io).
2. Konfigurasikan host tersebut dengan `CLIENT_ORIGIN=https://koyyid.github.io` dan reverse proxy HTTPS/WSS.
3. Di repository GitHub, buka **Settings → Secrets and variables → Actions → Variables**, lalu tambahkan `MESHDROP_SIGNALING_URL` berisi URL publik server tersebut, misalnya `https://signal.example.com`.
4. Push ulang ke `main` atau jalankan workflow **Deploy GitHub Pages** secara manual.

Tanpa `MESHDROP_SIGNALING_URL`, halaman Pages tetap terbuka tetapi tidak dapat bergabung ke room karena tidak ada signaling server pada domain GitHub Pages.

## Struktur project

```text
client/
  index.html                    Entry halaman browser
  assets/styles/main.css        Gaya antarmuka
  src/config/app-config.js      URL signaling, STUN, ukuran chunk/buffer
  src/services/signaling-client.js  Adapter Socket.IO browser
  src/services/peer-manager.js  Lifecycle RTCPeerConnection/DataChannel per peer
  src/services/file-transfer.js Chunking, antrean, progres, dan file masuk
  src/state/room-store.js       State UI room, peer, notifikasi, transfer
  src/ui/app-shell.js           Render form join dan dashboard room
  src/utils/dom.js              Helper escaping HTML
server/
  src/index.js                  HTTP server, static files, Socket.IO entry
  src/config/env.js             Pembacaan environment
  src/signaling/handlers.js     Join/leave room dan relay SDP/ICE
  src/rooms/room-registry.js    Registry anggota room in-memory
  src/utils/validation.js       Validasi payload client
  src/utils/logger.js           Logging server
shared/protocol.js              Nama event dan limit bersama
tests/                          Test unit server dan client (bertahap)
docs/ARCHITECTURE.md            Arsitektur dan pertimbangan deployment
```

## Catatan deployment

STUN publik di client digunakan untuk pengembangan. Untuk production, gunakan HTTPS/WSS dan tambahkan TURN server dengan kredensial sementara agar koneksi dapat bekerja di jaringan NAT ketat. Untuk menjalankan beberapa instance signaling server, pindahkan `RoomRegistry` ke penyimpanan bersama (misalnya Redis) dan gunakan Socket.IO adapter yang sama.
