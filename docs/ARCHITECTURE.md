# Arsitektur MeshDrop

## Tujuan rancangan

MeshDrop memisahkan control plane dan data plane. Server mengoordinasikan perangkat agar dapat membuat koneksi, sedangkan payload file mengalir langsung antar-browser.

| Lapisan | Tanggung jawab | Teknologi |
| --- | --- | --- |
| UI | Join room, daftar device, memilih tujuan, progres transfer, dan notifikasi | HTML, CSS, JavaScript vanilla |
| State | Menyimpan identitas device lokal, room aktif, serta device dan transfer yang terlihat UI | Modul ES browser |
| Client services | Socket signaling, lifecycle `RTCPeerConnection`, dan chunking/penerimaan file | Socket.IO client, WebRTC |
| Signaling server | Validasi event, routing pesan signaling, lifecycle socket, dan daftar device dalam room | Node.js, Express, Socket.IO |
| Shared protocol | Nama event dan bentuk pesan lintas client/server | JavaScript ES module |

## Alur koneksi yang diterapkan

1. Browser membuat `deviceId` per sesi tab dan mengirim `room:join` berisi room code dan device name.
2. Server memasukkan socket ke room Socket.IO, lalu mengirim daftar peer yang telah ada.
3. Satu sisi yang ditentukan client membuat `RTCPeerConnection` dan offer SDP.
4. Offer, answer, dan ICE candidate diteruskan server sesuai `targetDeviceId`.
5. Begitu DataChannel terbuka, peer menukar metadata dan chunk file secara langsung.
6. Ketika socket terputus, server menghapus device dari registry dan memberitahu peer lain untuk menutup koneksi terkait.

## Keputusan penting

- **Room registry in-memory terlebih dahulu:** cukup untuk satu proses Node.js dan mudah diganti adaptor Redis/database saat multi-instance diperlukan.
- **Satu `RTCPeerConnection` per pasangan device:** memudahkan pengiriman ke target tertentu, status koneksi, retry, dan broadcast (iterasi semua peer).
- **Chunking di service file transfer:** file besar tidak dibaca sekaligus ke memori; service mengatur ukuran chunk, backpressure DataChannel, metadata, dan progres.
- **Shared protocol terpisah:** mencegah nama event Socket.IO antara browser dan server menyimpang.
- **ICE server dikonfigurasi dari client config:** STUN publik dipakai untuk development; TURN perlu ditambahkan untuk jaringan NAT ketat/produksi.
- **Backpressure DataChannel:** pengirim menunggu `bufferedAmount` turun sebelum meneruskan chunk berikutnya, sehingga file tidak segera memenuhi memori kanal.
- **Penerimaan file browser:** chunk disusun menjadi `Blob`, lalu UI memberikan URL unduhan lokal. Karena itu ukuran file besar tetap dibatasi memori perangkat penerima.

## Batas keamanan tahap implementasi berikutnya

- Validasi format room code, panjang nama device, ukuran metadata, dan event target sebelum meneruskan signaling.
- Jangan percaya `deviceId` dari client tanpa mengikatnya pada socket yang telah bergabung ke room.
- Batasi ukuran file dan jumlah transfer paralel di client untuk menghindari tekanan memori.
- Gunakan WSS/HTTPS dan TURN dengan kredensial sementara pada deployment produksi.
