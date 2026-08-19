const storageKey = "meshdrop.locale";

export const languageOptions = Object.freeze([
  { code: "id", label: "Bahasa Indonesia" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" }
]);

const translations = {
  id: {
    ui: {
      language: "Bahasa", eyebrow: "TRANSFER FILE PEER-TO-PEER", intro: "Kirim file langsung ke perangkat lain dalam satu room. File tidak melewati server.",
      deviceName: "Nama perangkat", roomCode: "Kode room", roomCodePlaceholder: "MISAL: TEAM2026", defaultDeviceName: "Perangkat", targetDevice: "device tujuan",
      connecting: "Menghubungkan…", joinRoom: "Masuk ke room", roomCodeHint: "Gunakan room code yang sama di setiap device.",
      activeRoom: "ROOM AKTIF", leaveRoom: "Keluar", currentDevice: "Device saat ini", thisDevice: "Device ini",
      devicesInRoom: "Device di room", sendFile: "Kirim file", readyCount: "{count} siap", chooseFile: "Pilih file",
      recipients: "Tujuan", allReadyDevices: "Semua device siap ({count})", waitingForPeer: "Menunggu koneksi langsung ke device lain.",
      recentTransfers: "Transfer terbaru", noPeers: "Belum ada device lain di room ini.", readyToReceive: "Siap menerima file",
      noTransferActivity: "Belum ada aktivitas transfer.", download: "Unduh", from: "Dari", to: "Ke", transferProgress: "Progress transfer"
    },
    status: { sending: "Mengirim", sent: "Terkirim", receiving: "Menerima", received: "Diterima", failed: "Gagal", cancelled: "Dibatalkan", connectionFailed: "Koneksi gagal", connectionClosed: "Koneksi ditutup" },
    notices: { joinedRoom: "Masuk ke room {roomCode}. Menyambungkan device…", leftRoom: "Anda telah keluar dari room.", fileSent: "File selesai dikirim ke {count} device." },
    errors: {
      signalingConnectionFailed: "Tidak dapat terhubung ke signaling server.", notConnected: "Belum terhubung ke signaling server.", signalingNoResponse: "Signaling server tidak merespons.", signalingDenied: "Permintaan signaling ditolak.",
      unknownPeerAnswer: "Menerima WebRTC answer dari peer yang tidak dikenal.", directConnectionNotReady: "Koneksi langsung ke {deviceName} belum siap.", peerConnectionFailed: "Koneksi ke {deviceName} gagal.", dataChannelError: "DataChannel dengan {deviceName} mengalami error.",
      unsupportedFileData: "Menerima format data file yang tidak didukung.", fileExceedsSize: "Ukuran file yang diterima melebihi ukuran yang diumumkan.", invalidSelectedFile: "File yang dipilih tidak valid.", invalidFileControlMessage: "Menerima pesan kontrol file yang tidak valid.", invalidFileMetadata: "Metadata file yang diterima tidak valid atau terlalu besar.", incompleteFile: "Ukuran file tidak lengkap.", dataChannelClosed: "DataChannel tertutup saat file dikirim.", dataChannelDrainTimeout: "DataChannel terlalu lama menunggu buffer kosong.",
      chooseFile: "Pilih file terlebih dahulu.", deviceNameRoomRequired: "Nama device dan room code harus diisi.", noReadyPeer: "Belum ada koneksi device yang siap menerima file.", transfersCouldNotComplete: "{count} transfer tidak dapat diselesaikan.", signalingDisconnected: "Koneksi ke signaling server terputus. Silakan bergabung kembali.", unknownError: "Terjadi kesalahan yang tidak diketahui.",
      roomCodeInvalid: "Room code harus berisi 4–20 huruf atau angka.", deviceNameInvalid: "Nama device harus berisi 2–32 karakter.", deviceIdentityInvalid: "Identitas device tidak valid.", targetDeviceInvalid: "Device tujuan tidak valid.", deviceIdentityInUse: "Identitas device ini sudah digunakan di room.", roomFull: "Room telah mencapai batas jumlah device.", targetUnavailable: "Device tujuan tidak tersedia di room ini.", signalingPayloadIncomplete: "Payload signaling tidak lengkap.", serverError: "Permintaan tidak dapat diselesaikan."
    }
  },
  en: {
    ui: {
      language: "Language", eyebrow: "PEER-TO-PEER FILE TRANSFER", intro: "Send files directly to other devices in the same room. Files never pass through the server.",
      deviceName: "Device name", roomCode: "Room code", roomCodePlaceholder: "E.G. TEAM2026", defaultDeviceName: "Device", targetDevice: "target device",
      connecting: "Connecting…", joinRoom: "Join room", roomCodeHint: "Use the same room code on every device.",
      activeRoom: "ACTIVE ROOM", leaveRoom: "Leave", currentDevice: "Current device", thisDevice: "This device",
      devicesInRoom: "Devices in room", sendFile: "Send file", readyCount: "{count} ready", chooseFile: "Choose file",
      recipients: "Recipients", allReadyDevices: "All ready devices ({count})", waitingForPeer: "Waiting for a direct connection to another device.",
      recentTransfers: "Recent transfers", noPeers: "There are no other devices in this room.", readyToReceive: "Ready to receive files",
      noTransferActivity: "No transfer activity yet.", download: "Download", from: "From", to: "To", transferProgress: "Transfer progress"
    },
    status: { sending: "Sending", sent: "Sent", receiving: "Receiving", received: "Received", failed: "Failed", cancelled: "Cancelled", connectionFailed: "Connection failed", connectionClosed: "Connection closed" },
    notices: { joinedRoom: "Joined room {roomCode}. Connecting devices…", leftRoom: "You have left the room.", fileSent: "File sent to {count} device(s)." },
    errors: {
      signalingConnectionFailed: "Unable to connect to the signaling server.", notConnected: "Not connected to the signaling server.", signalingNoResponse: "The signaling server did not respond.", signalingDenied: "The signaling request was denied.",
      unknownPeerAnswer: "Received a WebRTC answer from an unknown peer.", directConnectionNotReady: "The direct connection to {deviceName} is not ready.", peerConnectionFailed: "Connection to {deviceName} failed.", dataChannelError: "The DataChannel with {deviceName} encountered an error.",
      unsupportedFileData: "Received an unsupported file data format.", fileExceedsSize: "The received file exceeds its announced size.", invalidSelectedFile: "The selected file is invalid.", invalidFileControlMessage: "Received an invalid file control message.", invalidFileMetadata: "Received invalid or oversized file metadata.", incompleteFile: "The received file is incomplete.", dataChannelClosed: "The DataChannel closed during file transfer.", dataChannelDrainTimeout: "The DataChannel buffer took too long to drain.",
      chooseFile: "Choose a file first.", deviceNameRoomRequired: "Device name and room code are required.", noReadyPeer: "No device connection is ready to receive files.", transfersCouldNotComplete: "{count} transfer(s) could not be completed.", signalingDisconnected: "The signaling server connection was lost. Please join again.", unknownError: "An unknown error occurred.",
      roomCodeInvalid: "Room code must contain 4–20 letters or numbers.", deviceNameInvalid: "Device name must contain 2–32 characters.", deviceIdentityInvalid: "Device identity is invalid.", targetDeviceInvalid: "Target device is invalid.", deviceIdentityInUse: "This device identity is already in use in the room.", roomFull: "The room has reached its device limit.", targetUnavailable: "The target device is not available in this room.", signalingPayloadIncomplete: "The signaling payload is incomplete.", serverError: "The request could not be completed."
    }
  },
  ja: {
    ui: {
      language: "言語", eyebrow: "P2P ファイル転送", intro: "同じルーム内の他のデバイスにファイルを直接送信します。ファイルはサーバーを経由しません。",
      deviceName: "デバイス名", roomCode: "ルームコード", roomCodePlaceholder: "例: TEAM2026", defaultDeviceName: "デバイス", targetDevice: "送信先デバイス",
      connecting: "接続中…", joinRoom: "ルームに参加", roomCodeHint: "すべてのデバイスで同じルームコードを使用してください。",
      activeRoom: "アクティブルーム", leaveRoom: "退出", currentDevice: "現在のデバイス", thisDevice: "このデバイス",
      devicesInRoom: "ルーム内のデバイス", sendFile: "ファイルを送信", readyCount: "{count} 台が準備完了", chooseFile: "ファイルを選択",
      recipients: "送信先", allReadyDevices: "準備完了のすべてのデバイス ({count})", waitingForPeer: "別のデバイスへの直接接続を待機しています。",
      recentTransfers: "最近の転送", noPeers: "このルームには他のデバイスがありません。", readyToReceive: "ファイルを受信可能",
      noTransferActivity: "転送アクティビティはまだありません。", download: "ダウンロード", from: "送信元", to: "送信先", transferProgress: "転送の進行状況"
    },
    status: { sending: "送信中", sent: "送信済み", receiving: "受信中", received: "受信済み", failed: "失敗", cancelled: "キャンセル済み", connectionFailed: "接続に失敗しました", connectionClosed: "接続が閉じられました" },
    notices: { joinedRoom: "ルーム {roomCode} に参加しました。デバイスを接続しています…", leftRoom: "ルームから退出しました。", fileSent: "{count} 台のデバイスにファイルを送信しました。" },
    errors: {
      signalingConnectionFailed: "シグナリングサーバーに接続できません。", notConnected: "シグナリングサーバーに接続されていません。", signalingNoResponse: "シグナリングサーバーから応答がありません。", signalingDenied: "シグナリングリクエストが拒否されました。",
      unknownPeerAnswer: "不明なピアから WebRTC answer を受信しました。", directConnectionNotReady: "{deviceName} への直接接続の準備ができていません。", peerConnectionFailed: "{deviceName} への接続に失敗しました。", dataChannelError: "{deviceName} との DataChannel でエラーが発生しました。",
      unsupportedFileData: "サポートされていないファイルデータ形式を受信しました。", fileExceedsSize: "受信したファイルが通知されたサイズを超えています。", invalidSelectedFile: "選択したファイルは無効です。", invalidFileControlMessage: "無効なファイル制御メッセージを受信しました。", invalidFileMetadata: "無効または大きすぎるファイルメタデータを受信しました。", incompleteFile: "受信したファイルが不完全です。", dataChannelClosed: "ファイル転送中に DataChannel が閉じられました。", dataChannelDrainTimeout: "DataChannel バッファの解放に時間がかかりすぎています。",
      chooseFile: "先にファイルを選択してください。", deviceNameRoomRequired: "デバイス名とルームコードを入力してください。", noReadyPeer: "ファイルを受信できるデバイス接続がありません。", transfersCouldNotComplete: "{count} 件の転送を完了できませんでした。", signalingDisconnected: "シグナリングサーバーとの接続が切断されました。もう一度参加してください。", unknownError: "不明なエラーが発生しました。",
      roomCodeInvalid: "ルームコードは 4〜20 文字の英数字で入力してください。", deviceNameInvalid: "デバイス名は 2〜32 文字で入力してください。", deviceIdentityInvalid: "デバイス ID が無効です。", targetDeviceInvalid: "送信先デバイスが無効です。", deviceIdentityInUse: "このデバイス ID はルーム内で既に使用されています。", roomFull: "ルームのデバイス数が上限に達しました。", targetUnavailable: "送信先デバイスはこのルームで利用できません。", signalingPayloadIncomplete: "シグナリングのペイロードが不完全です。", serverError: "リクエストを完了できませんでした。"
    }
  },
  zh: {
    ui: {
      language: "语言", eyebrow: "点对点文件传输", intro: "直接向同一房间内的其他设备发送文件。文件不会经过服务器。",
      deviceName: "设备名称", roomCode: "房间代码", roomCodePlaceholder: "例如：TEAM2026", defaultDeviceName: "设备", targetDevice: "目标设备",
      connecting: "正在连接…", joinRoom: "加入房间", roomCodeHint: "请在每台设备上使用相同的房间代码。",
      activeRoom: "当前房间", leaveRoom: "离开", currentDevice: "当前设备", thisDevice: "此设备",
      devicesInRoom: "房间内的设备", sendFile: "发送文件", readyCount: "{count} 台已就绪", chooseFile: "选择文件",
      recipients: "接收方", allReadyDevices: "所有已就绪设备 ({count})", waitingForPeer: "正在等待与另一台设备建立直接连接。",
      recentTransfers: "最近传输", noPeers: "此房间中没有其他设备。", readyToReceive: "可以接收文件",
      noTransferActivity: "还没有传输活动。", download: "下载", from: "来自", to: "发送至", transferProgress: "传输进度"
    },
    status: { sending: "发送中", sent: "已发送", receiving: "接收中", received: "已接收", failed: "失败", cancelled: "已取消", connectionFailed: "连接失败", connectionClosed: "连接已关闭" },
    notices: { joinedRoom: "已加入房间 {roomCode}。正在连接设备…", leftRoom: "您已离开房间。", fileSent: "文件已发送至 {count} 台设备。" },
    errors: {
      signalingConnectionFailed: "无法连接到信令服务器。", notConnected: "尚未连接到信令服务器。", signalingNoResponse: "信令服务器没有响应。", signalingDenied: "信令请求被拒绝。",
      unknownPeerAnswer: "收到了来自未知对等方的 WebRTC answer。", directConnectionNotReady: "与 {deviceName} 的直接连接尚未准备就绪。", peerConnectionFailed: "与 {deviceName} 的连接失败。", dataChannelError: "与 {deviceName} 的 DataChannel 发生错误。",
      unsupportedFileData: "收到了不支持的文件数据格式。", fileExceedsSize: "接收的文件超过了声明的大小。", invalidSelectedFile: "所选文件无效。", invalidFileControlMessage: "收到了无效的文件控制消息。", invalidFileMetadata: "收到了无效或过大的文件元数据。", incompleteFile: "接收的文件不完整。", dataChannelClosed: "文件传输期间 DataChannel 已关闭。", dataChannelDrainTimeout: "DataChannel 缓冲区清空耗时过长。",
      chooseFile: "请先选择一个文件。", deviceNameRoomRequired: "必须填写设备名称和房间代码。", noReadyPeer: "没有可接收文件的设备连接。", transfersCouldNotComplete: "无法完成 {count} 个传输。", signalingDisconnected: "与信令服务器的连接已断开。请重新加入。", unknownError: "发生未知错误。",
      roomCodeInvalid: "房间代码必须包含 4–20 个字母或数字。", deviceNameInvalid: "设备名称必须包含 2–32 个字符。", deviceIdentityInvalid: "设备身份无效。", targetDeviceInvalid: "目标设备无效。", deviceIdentityInUse: "此设备身份已在房间中使用。", roomFull: "房间已达到设备数量上限。", targetUnavailable: "目标设备不在此房间中。", signalingPayloadIncomplete: "信令负载不完整。", serverError: "无法完成请求。"
    }
  },
  ko: {
    ui: {
      language: "언어", eyebrow: "P2P 파일 전송", intro: "같은 방에 있는 다른 기기로 파일을 직접 보냅니다. 파일은 서버를 거치지 않습니다.",
      deviceName: "기기 이름", roomCode: "방 코드", roomCodePlaceholder: "예: TEAM2026", defaultDeviceName: "기기", targetDevice: "대상 기기",
      connecting: "연결 중…", joinRoom: "방 참가", roomCodeHint: "모든 기기에서 동일한 방 코드를 사용하세요.",
      activeRoom: "활성 방", leaveRoom: "나가기", currentDevice: "현재 기기", thisDevice: "이 기기",
      devicesInRoom: "방의 기기", sendFile: "파일 보내기", readyCount: "{count}개 준비됨", chooseFile: "파일 선택",
      recipients: "수신자", allReadyDevices: "준비된 모든 기기 ({count})", waitingForPeer: "다른 기기와의 직접 연결을 기다리는 중입니다.",
      recentTransfers: "최근 전송", noPeers: "이 방에 다른 기기가 없습니다.", readyToReceive: "파일 수신 준비 완료",
      noTransferActivity: "아직 전송 활동이 없습니다.", download: "다운로드", from: "보낸 사람", to: "받는 사람", transferProgress: "전송 진행 상황"
    },
    status: { sending: "보내는 중", sent: "전송됨", receiving: "받는 중", received: "수신됨", failed: "실패", cancelled: "취소됨", connectionFailed: "연결 실패", connectionClosed: "연결 종료" },
    notices: { joinedRoom: "방 {roomCode}에 참가했습니다. 기기를 연결하는 중…", leftRoom: "방에서 나갔습니다.", fileSent: "파일을 {count}개 기기로 보냈습니다." },
    errors: {
      signalingConnectionFailed: "시그널링 서버에 연결할 수 없습니다.", notConnected: "시그널링 서버에 연결되어 있지 않습니다.", signalingNoResponse: "시그널링 서버가 응답하지 않습니다.", signalingDenied: "시그널링 요청이 거부되었습니다.",
      unknownPeerAnswer: "알 수 없는 피어에서 WebRTC answer를 받았습니다.", directConnectionNotReady: "{deviceName} 기기와의 직접 연결이 준비되지 않았습니다.", peerConnectionFailed: "{deviceName} 기기와의 연결에 실패했습니다.", dataChannelError: "{deviceName} 기기와의 DataChannel에서 오류가 발생했습니다.",
      unsupportedFileData: "지원되지 않는 파일 데이터 형식을 받았습니다.", fileExceedsSize: "수신한 파일이 알린 크기를 초과했습니다.", invalidSelectedFile: "선택한 파일이 올바르지 않습니다.", invalidFileControlMessage: "잘못된 파일 제어 메시지를 받았습니다.", invalidFileMetadata: "잘못되었거나 너무 큰 파일 메타데이터를 받았습니다.", incompleteFile: "수신한 파일이 불완전합니다.", dataChannelClosed: "파일 전송 중 DataChannel이 닫혔습니다.", dataChannelDrainTimeout: "DataChannel 버퍼가 비워지는 데 너무 오래 걸립니다.",
      chooseFile: "먼저 파일을 선택하세요.", deviceNameRoomRequired: "기기 이름과 방 코드를 입력하세요.", noReadyPeer: "파일을 받을 준비가 된 기기 연결이 없습니다.", transfersCouldNotComplete: "{count}개의 전송을 완료할 수 없습니다.", signalingDisconnected: "시그널링 서버 연결이 끊어졌습니다. 다시 참가하세요.", unknownError: "알 수 없는 오류가 발생했습니다.",
      roomCodeInvalid: "방 코드는 4~20자의 영문 또는 숫자여야 합니다.", deviceNameInvalid: "기기 이름은 2~32자여야 합니다.", deviceIdentityInvalid: "기기 ID가 올바르지 않습니다.", targetDeviceInvalid: "대상 기기가 올바르지 않습니다.", deviceIdentityInUse: "이 기기 ID는 이미 방에서 사용 중입니다.", roomFull: "방의 기기 수가 한도에 도달했습니다.", targetUnavailable: "대상 기기를 이 방에서 찾을 수 없습니다.", signalingPayloadIncomplete: "시그널링 페이로드가 불완전합니다.", serverError: "요청을 완료할 수 없습니다."
    }
  }
};

let activeLocale = resolveInitialLocale();

export function getLocale() {
  return activeLocale;
}

export function setLocale(locale) {
  activeLocale = translations[locale] ? locale : "en";
  try {
    window.localStorage.setItem(storageKey, activeLocale);
  } catch {
    // Keep the in-memory selection when persistent storage is unavailable.
  }
  return activeLocale;
}

export function t(key, params = {}) {
  const template = lookup(translations[activeLocale], key) ?? lookup(translations.en, key) ?? key;
  return template.replace(/\{(\w+)\}/g, (_match, name) => String(params[name] ?? ""));
}

export function createAppError(code, params = {}) {
  const error = new Error(code);
  error.code = code;
  error.params = params;
  return error;
}

function resolveInitialLocale() {
  try {
    const storedLocale = window.localStorage.getItem(storageKey);
    if (storedLocale && translations[storedLocale]) {
      return storedLocale;
    }
  } catch {
    // Fall through to browser language detection.
  }
  const browserLocale = navigator.language?.slice(0, 2).toLowerCase();
  return translations[browserLocale] ? browserLocale : "en";
}

function lookup(source, key) {
  return key.split(".").reduce((value, segment) => value?.[segment], source);
}
