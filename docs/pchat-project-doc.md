# PChat Technical Documentation

> **Version**: `20260520.1` | **Database Version**: 2 | **Date**: 2026-05-20

---

## 1. Project Overview

**PChat** is a **pure frontend P2P messaging application** built on PeerJS (WebRTC). All messages are transmitted peer-to-peer with no backend server required.

| Property | Value |
|----------|-------|
| **GitHub** | https://github.com/pchatsam/pchat |
| **Project Path** | `./pchat` |
| **Entry** | `index.html` |
| **Core Code** | `dist/pchat.js` (~356KB, 6914 lines) |
| **Stylesheet** | `dist/chat.css` (~22KB) |
| **License** | Open Source |

### Core Features

- **End-to-end encryption**: RSA-2048-OAEP key exchange + AES-256-CBC database encryption
- **P2P direct connection**: WebRTC DataChannel, no message relay server
- **Rich media**: Text, images, files, voice messages
- **Real-time calls**: WebRTC audio
- **Group chats**: Client-side grouping + per-member P2P broadcast
- **Offline storage**: All data encrypted in browser IndexedDB
- **Multi-account**: Save/switch multiple accounts in one browser
- **Account transfer**: P2P data migration to another device
- **10 languages**: Chinese, English, Japanese, German, French, Spanish, Portuguese, Hebrew, Korean, Italian
- **Session Lock**: Cross-tab duplicate login prevention

---

## 2. Tech Stack

| Layer | Technology | Description |
|-------|------------|-------------|
| **Signaling** | PeerJS 1.5.4 | WebRTC connection setup, uses public signaling server (0.peerjs.com) |
| **Transport** | WebRTC DataChannel | P2P reliable ordered transport (`reliable: true`) |
| **Voice Calls** | WebRTC MediaConnection | Real-time audio stream (getUserMedia) |
| **RSA Crypto** | Forge 0.7.0 | RSA-2048-OAEP-SHA256 key generation and encryption |
| **AES Crypto** | CryptoJS 3.x | AES-256-CBC (OpenSSL format, PBKDF2 key derivation) |
| **Storage** | IndexedDB | Encrypted multi-table storage (per-account database) |
| **QR Code** | qrcode.js | User ID / transfer ID QR generation |
| **QR Scan** | jsQR | Camera-based real-time QR recognition |
| **i18n** | Custom dictionary | 10-language runtime switching |

### Third-party Libraries (bundled locally, no CDN)

```
dist/
├── peerjs.min.js      87KB    WebRTC wrapper (PeerJS 1.5.4)
├── forge.min.js      282KB    RSA crypto (Forge 0.7.0)
├── crypto-js.js      219KB    AES + PBKDF2 (CryptoJS)
├── qrcode.min.js      20KB    QR code generation
├── jsqr.min.js       257KB    QR code scanning
├── pchat.js          356KB    Core application
└── chat.css           22KB    Global stylesheet
```

---

## 3. System Architecture

### 3.1 Overall Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Browser (pure frontend)              │
│                                                          │
│  ┌───────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  UI Layer  │   │  ChatApp    │   │   PeerConn       │  │
│  │ (index     │◄──│  Business    │◄──│  (PeerJS wrapper) │  │
│  │  .html +   │   │  - Messaging  │   │  - Connection mgmt│  │
│  │  chat.css) │   │  - Groups      │   │  - Encrypted send  │  │
│  └───────────┘   │  - File transfer│   │  - flushPending    │  │
│                  │  - Account xfer│   └────────┬─────────┘  │
│                  └──────┬──────┘            │             │
│                    ┌────┴────┐     ┌────────┴────────┐   │
│                    │  Crypto  │     │       DB        │   │
│                    │ RSA+AES  │     │   (IndexedDB)   │   │
│                    └──────────┘     └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                          │                       │
                          ▼                       ▼
             ┌─────────────────────┐    ┌─────────────────┐
             │  PeerJS Public       │    │  Peer Browser     │
             │  Signaling           │    │  (P2P DataChannel)│
             │  (0.peerjs.com:443)  │    └─────────────────┘
             └─────────────────────┘
```

### 3.2 Module Details

#### 3.2.1 `Crypto` — Encryption Module (Forge + CryptoJS)

```
Crypto
├── generateKeypair()          RSA-2048 key pair generation (forge.pki.rsa)
│   └── e=0x10001 (65537), bits=2048
├── keyFingerprint(pem)        MD5 of public key PEM, first 8 chars (unique fingerprint)
├── encryptWithPubkey()        Public key encryption → short(≤150B) single chunk / long auto-chunk
├── decryptWithPrivkey()       Private key decryption → auto-detect chunk marker '|' for mode switch
├── encryptChunks()            Chunked encryption (180 bytes/chunk, RSA-OAEP-SHA256)
├── decryptChunks()            Chunked decryption (per-chunk RSA-OAEP decrypt + concat)
├── deriveAesKey(pw, salt)     PBKDF2-SHA256 derive AES-256 key (salt=random 16-byte hex or "pchat-salt", 100,000 iters)
├── encryptAes()               AES-256-CBC encryption (CryptoJS, OpenSSL "Salted__" format)
├── decryptAes()               AES-256-CBC decryption
├── randomSalt()               Generate 16-byte random hex salt (crypto.getRandomValues)
└── generateId()               12-char random ID (excludes ambiguous chars: 0O1Il)
```

**Encryption Chain:**
```
Send: Plaintext → Peer's RSA public key → DataChannel → Peer's RSA private key → Plaintext
                                                          ↘ AES encrypted → IndexedDB

Chunking: Messages > 150 bytes (UTF-8) are auto-chunked, 180 bytes per chunk
```

**Key Derivation (register/login):**
```
Register: Password + Random Salt → PBKDF2-SHA256 (100,000 iters) → AES-256 key
→ Salt stored in plain in IndexedDB user table (id: "_salt")
→ Encrypt all IndexedDB records + file data

Login: Read salt from DB → Password + Salt → PBKDF2-SHA256 → AES-256 key
→ Old accounts without salt → fallback to "pchat-salt"
→ Login uses cachedKey for speed (stored in user record)
```

> **Note**: GitHub README claims "AES-GCM" but actual code uses `CryptoJS.AES.encrypt()` default **AES-CBC** mode (OpenSSL compatible format).

#### 3.2.2 `DB` — IndexedDB Storage Module

Database naming: `PChat_{userId}` (per-account)

```javascript
DB VER = 2

Schema:
├── user          keyPath: "id"         Indexes: userId (unique)
│   Records: id, encrypted, ts
│   Decrypted: { userId, nickname, cachedKey, ts }
│   Special: id="_salt" stores plaintext salt (data: JSON string, not encrypted)
│
├── contacts      keyPath: "contactId"  Indexes: userId (unique), nickname
│   Records: contactId, encrypted, ts
│   Decrypted: { contactId, userId, nickname, publicKey, keypair, added, requestedKey }
│
├── messages      keyPath: "id"         Indexes: peerId, timestamp
│   Records: id, encrypted, ts
│   Decrypted: { id, peerId, content, ts, direction, fromId, sent, type, ... }
│
├── groups        keyPath: "id"
│   Decrypted: { id, name, members[], created }
│
├── files         keyPath: "id"
│   Records: id, data (AES encrypted), mime, ts
│
└── invitations   keyPath: "id"
```

**Encryption Storage Rules:**

| Content | Encryption |
|---------|------------|
| User info, contacts, messages, groups, invitations | `DB.put/get` → AES-CBC (automatic) |
| Salt record | Plaintext in `user` table (`id: "_salt"`) |
| File/image raw data | `DB.putFile/getFile` → AES-CBC (explicit aesKey param) |
| Thumbnails (200px JPEG) | Embedded in message record's `fileData` field (encrypted with message) |
| Original images | Stored in `files` store |

#### 3.2.3 `PeerConn` — PeerJS Connection Management

```javascript
PeerConn.peers[peerId] = {
    conn:      DataConnection,  // PeerJS data connection
    myKey:     {publicKey, privateKey},  // Local RSA key pair
    peerKey:   PEM,             // Peer's public key (set after handshake)
    connected: boolean          // Connection open status
}
```

**Core Methods:**

| Method | Function |
|--------|----------|
| `init(myId, callback)` | Initialize PeerJS, configure STUN servers |
| `connect(peerId)` | Establish P2P data connection |
| `_bind(conn, peerId, initiator)` | Bind data/open/close/error events |
| `send(peerId, content, msgId)` | RSA encrypt + send |
| `flushPending(peerId)` | Resend undelivered messages after reconnect |
| `sendVoice/sendFile*/call()` | Media/file/call operations |
| `close()` | Destroy PeerJS instance |

**STUN Server Configuration (tested, latency-sorted):**
```javascript
iceServers: [
    { urls: 'stun:stun.chat.bilibili.com:3478' },    // ~95ms
    { urls: 'stun:stun.miwifi.com:3478' },           // ~106ms
    { urls: 'stun:stun.cloudflare.com:3478' },        // ~183ms
    { urls: 'stun:stun.nextcloud.com:3478' },         // ~226ms
    { urls: 'stun:stun.l.google.com:19302' },         // ~245ms
]
```

#### 3.2.4 `AccountManager` — Multi-Account Management

- Account list stored in `localStorage` (`pchat_accounts`)
- Per-account IndexedDB (`PChat_{userId}`)
- Delete account also cleans IndexedDB (`indexedDB.deleteDatabase`)
- Password verification before delete

#### 3.2.5 `ChatApp` — Main Business Logic

Core state object:
```javascript
ChatApp = {
    my:           { id, nickname, password, aesKey },
    contacts:     [],            // Contact list (with key pairs)
    groups:       [],            // Group list
    unreadCount:  {},            // Unread counts {peerId: count}
    activeConv:   { type, id },  // Current conversation
    fileTransfer: { pending: {} },  // File receive buffer
    call:         { active, peerId, state, timer, ... },
    voice:        { recording, recorder, chunks, ... },
    imageViewer:  { zoom, rotation, panX, panY, swipeIndex, ... },
}
```

---

## 4. Feature Details

### 4.1 Registration and Login

#### Registration Flow (registerUser)

1. Enter nickname + password → validate non-empty
2. `Crypto.generateId()` → 12-char random ID
3. `Crypto.randomSalt()` → 16-byte random hex salt
4. `DB.openFor(myId)` → create per-account IndexedDB
5. Store salt: `DB.putRaw("user", { id: "_salt", data: JSON.stringify({ salt }) })`
6. `Crypto.deriveAesKey(pw, salt)` → PBKDF2 derive AES key
7. `DB.put("user", ...)` → save encrypted user record (with cachedKey)
8. `AccountManager.addAccount()` → register to local account list
9. `PeerConn.init()` → initialize P2P connection
10. If invite link present (`#invite-xxx`), auto-send friend request

#### Login Flow (loginUser)

1. Select saved account → enter password
2. `DB.openFor(selectedId)` → open account database
3. Read salt: `DB.get("user", "_salt")` → salt (or null for old accounts)
4. `Crypto.deriveAesKey(pw, salt)` → derive key (fallback to fixed salt)
5. Decrypt `user` record to verify password
6. Use `cachedKey` if available (avoid re-derivation)
7. Load contacts + groups
8. `_migrateImageMessages()` → migrate old image format
9. `PeerConn.init()` → initialize P2P, auto-connect online contacts

#### Session Lock (cross-tab duplicate login prevention)

- Via `localStorage.pchat_login` token, cross-tab mutual exclusion
- Heartbeat check every 2 seconds in `_startLoginHeartbeat`
- Detect same ID login in another tab → send `kick` event → auto-logout

### 4.2 Friend Request (RSA Public Key Exchange Handshake)

```
Initiator                               Receiver
  │                                         │
  │── PeerJS connect ─────────────────────►│
  │── {type:"add", publicKey, nickname} ──►│  Show friend request card
  │                                         │  (friend-request-card inline)
  │                                         │  User clicks "Accept"
  │◄── {type:"accept", key, id, nickname} ─│  Generate/load key pair
  │                                         │  Save peer's public key
  │  Save peer's public key + key pair      │
  │  Cross-test encrypt/decrypt verify      │
  │                                         │
  ✓ Bidirectional public key exchange complete, RSA channel established   │
```

**Key points:**
- Initiator: send `add` message after connection (not PeerConn auto)
- Receiver: `conn.on("data")` → type="add" → `_onAddRequest()` → show inline card
- Already friend with existing public key → ignore duplicate add
- Accept: cross-test encrypt "cross-test" → verify encryption works

### 4.3 1-on-1 Chat

**Sending message (`sendMessage`):**
1. Check contact public key exchanged (handshake complete) → else prompt
2. Build message `{id, peerId, content, ts, direction:"sent", sent:false}`
3. `PeerConn.send()` → RSA encrypt with peer's public key → send
4. Store in IndexedDB (AES encrypted): `DB.put("messages", ...)`
5. Auto-select single-chunk or multi-chunk (>150B → chunks)

**Receiving message (`onChatMsg`):**
1. PeerJS DataChannel `"data"` event → `type:"chat"`
2. Check contact public key exists (handshake complete)
3. `Crypto.decryptChunks()` → RSA decrypt with local private key
4. Store in IndexedDB (AES encrypted)
5. Auto-send `receipt` read confirmation

**Message Type Enum:**
| type | Description | Encrypted |
|------|-------------|-----------|
| `chat` | Text message / HTML message | ✅ RSA |
| `voice` | Voice message (audio/webm base64) | ❌ Plain (DTLS only) |
| `file-header` | File metadata | ❌ Plain |
| `file-chunk` | File data chunk | ❌ Plain |
| `file-footer` | File transfer complete | ❌ Plain |
| `receipt` | Read confirmation | ❌ Plain |
| `id-change` | ID change notification | ❌ Plain |

### 4.4 Group Chat

**Pure client-side group model (no group server):**

```
              Group owner sends message
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
  Member A RSA  Member B RSA  Member C RSA
  encrypt       encrypt       encrypt
    ▼             ▼             ▼
  P2P direct    P2P direct    P2P direct
    ▼             ▼             ▼
  Member A     Member B     Member C
  receipts{A: ✓} receipts{B: ✓} receipts{C: ✓}
```

**Key points:**
1. Create group → `group.members[]` stores member contactId list
2. Send group message → iterate members, RSA encrypt + send to each
3. Unified `msgId` links all member send records (owner side)
4. Each message has `receipts` field: `{memberId: timestamp}` tracking reads
5. Offline member messages queued → `flushPending()` on reconnect
6. Member receives group message → `fromId` identifies sender

**Message routing:**
- `activeConv.type === "group"` → iterate group.members to send
- `activeConv.type === "contact"` → direct send to userId

### 4.5 File Transfer (Chunking)

#### Image Transfer

```
Sender:
  1. FileReader.readAsDataURL() → base64
  2. _generateThumbnail(200px JPEG) → thumbnail base64
  3. SHA-256 hash of full original image
  4. Split base64 into 16KB chunks (DataChannel limit)
  5. file-header → N× file-chunk → file-footer

Receiver:
  1. file-header → create receive record (_pendingFileReceives)
  2. file-chunk → buffer to chunks[] (dedup by index)
  3. file-footer → verify length + SHA-256 hash
  4. Concat full base64 → store in IndexedDB (AES encrypted)
  5. Render thumbnail in message list
```

#### File Transfer

- Same mechanism as images, no thumbnail
- Shown as file card (filename + size + icon)
- Click download → read from DB → `URL.createObjectURL` → trigger download

#### Integrity Verification

- **Length check**: Concatenated base64 length vs sender declaration
- **Hash check**: SHA-256 hash comparison (prevent corruption)
- **Dedup**: Duplicate index chunks auto-skipped

### 4.6 Voice Messages

**Recording:**
1. Click 🎙️ → `navigator.mediaDevices.getUserMedia({audio:true})`
2. `MediaRecorder` records audio/webm (default codec)
3. Click again to stop → `reader.readAsDataURL(blob)` → base64
4. Save message record (with `duration`)
5. Send via DataChannel as plain `{type:"voice", content, duration}`

**Playback:**
1. Click voice message → base64 → ArrayBuffer → Blob URL
2. `new Audio(blobUrl).play()`
3. UI shows playing state (dynamic styles)

> **Security note**: Voice messages are NOT application-layer encrypted (DTLS transport only).

### 4.7 Real-Time Voice Calls (PeerJS MediaConnection)

```
Caller                                Callee
  │                                     │
  │ getUserMedia({audio:true})          │
  │ peer.call(peerId, stream) ─────────►│
  │                                     │  peer.on("call", call)
  │                                     │  ChatApp._onIncomingPeerCall()
  │                                     │  Show call-modal + ringtone
  │◄── call.answer(stream) ────────────│  getUserMedia + answer
  │                                     │
  ◄════ Bidirectional Opus audio (WebRTC) ═══►
  │                                     │
  │ call.close() ──────────────────────►│  Hangup
  │ _logCall(duration)                  │  _logCall(duration)
```

**Features:**
- Incoming call modal (`#call-modal`): Shows nickname + ID + accept/reject
- Call timer: Real-time `mm:ss`
- Call log: Auto-write `type:"call-log"` message
- States: `idle → waiting → connected → closed`

### 4.8 Image Viewer

Fullscreen overlay (`#image-viewer`) with:

| Action | Implementation |
|--------|----------------|
| **Pinch zoom** | Two-finger pinch (touch) / mouse wheel (desktop) |
| **Pan** | mousedown/touchstart → mousemove → translate(panX, panY) |
| **Swipe** | Left/right swipe between images in conversation |
| **Rotate** | CSS `transform: rotate(90°×N)` incremental |
| **Download** | `fetch(blobUrl)` → `URL.createObjectURL` → `<a download>` |
| **Toolbar** | Auto-hide after 5s inactivity (`toolbarTimer`) |

### 4.9 Account Transfer (P2P Data Migration)

Transfer complete database from one device to another via temporary PeerJS connection:

```
Sender (Transfer Out)                        Receiver (Transfer In)
  │                                             │
  │ 1. Select account + password verify         │
  │ 2. Generate transfer-xxx ID                 │
  │ 3. new Peer(transferId)                     │
  │ 4. Show QR code (transfer-xxx)              │
  │                                             │  1. Scan QR / enter transfer ID
  │◄── PeerJS connect ─────────────────────────│  new Peer + connect
  │                                             │
  │── transfer-request ◄───────────────────────│  Send request
  │── transfer-start (tables[]) ──────────────►│
  │── table-start (name, total) ──────────────►│  Prepare receive
  │── transfer-chunk (table, index, data) ────►│  Row-by-row store
  │◄── transfer-ack (index) ──────────────────│  Row ACK (pipeline)
  │── ... (batch of 5) ──────────────────────►│  (window size=5)
  │── table-done (tableName) ─────────────────►│  Table complete
  │◄── table-ack (tableName) ─────────────────│  Table ACK
  │── ... next table ...                       │
  │── transfer-complete ──────────────────────►│
  │                                             │  AccountManager.addAccount()
  │                                             │  Complete
```

**Transfer Protocol:**
| Type | Direction | Description |
|------|-----------|-------------|
| `transfer-request` | in→out | Receiver initiates |
| `transfer-start` | out→in | Start transfer, list tables |
| `table-start` | out→in | Table start with count |
| `transfer-chunk` | out→in | Single row (JSON serialized) |
| `transfer-ack` | in→out | Row ACK |
| `table-done` | out→in | Table complete |
| `table-ack` | in→out | Table ACK |
| `transfer-complete` | out→in | All done |

**Pipeline control:** Window size 5 (max 5 unACK'd chunks), release slot on ACK.

**Data serialization:**
- `Date` → `{__date: timestamp}`
- `Uint8Array` → `{__uint8: [bytes]}`
- Both sides use `_convertToJSON` / `_convertFromJSON`

### 4.10 QR Code / Scanning

- **Show QR**: Encode own ID as QR code (`#qr-modal`)
- **Scan to add friend**: Camera (`<video>` + `getUserMedia`) → jsQR real-time → extract ID → auto-send friend request
- **Scan to transfer**: In transfer mode, scan → recognize `transfer-xxx` → auto-connect
- **Auto-close**: Detect peer scan → `closeQRModal()` auto-closes
- **Success animation**: Visual feedback on scan success

---

## 5. Message Data Structures

### Text Message
```javascript
{
    id: "msg_{peerId}_{timestamp}",
    peerId: string,          // Peer/group ID
    content: string,         // Message text (HTML messages prefixed with [HTML])
    ts: number,              // Timestamp
    direction: "sent" | "received",
    fromId: string,          // Sender ID (in group chat)
    sent: boolean,           // Successfully sent
    isHtml: boolean,         // HTML format
    receipts: {}             // Read receipts {memberId: timestamp}
}
```

### Image Message
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "image",
    fileName: string,
    mimeType: string,
    fileSize: number,
    fileId: string,          // Original image ID in files store
    fileData: string,        // Thumbnail base64 (200px JPEG, embedded)
    originalHash: string     // SHA-256 hash of original
}
```

### File Message
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "file",
    fileName: string,
    mimeType: string,
    fileSize: number,
    fileId: string,          // File ID in files store
    fileData: string         // Full file base64 (AES encrypted storage)
}
```

### Voice Message
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "voice",
    content: string,         // audio/webm base64
    duration: number         // Duration (seconds)
}
```

### Call Log
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "call-log",
    content: string          // "📞 Call 3m20s" (i18n)
}
```

---

## 6. UI Structure

```
index.html
├── #setup-panel                    Registration/Login panel
│   ├── .setup-box
│   │   ├── h2 "🍃 P.Chat"
│   │   ├── #invite-from            Invite source hint
│   │   ├── #invite-info            Register form (nickname + password + button)
│   │   ├── #account-select-panel   Account selection list
│   │   ├── #login-password-panel   Password input + login button
│   │   ├── .corner-btn-left        "Transfer Account" button
│   │   ├── .corner-btn-right       "New Account" button
│   │   └── #login-loading          Progress bar (220px wide)
│
├── #main-panel                     Main interface
│   ├── #sidebar                    Sidebar (draggable width)
│   │   ├── .sidebar-header         User info (nickname+ID+QR+scan)
│   │   ├── Tab: #tab-contacts / #tab-groups
│   │   ├── #friend-request-card    Friend request inline card
│   │   ├── #contact-tab / #group-tab
│   │   └── #add-friend-box         ID input + add button
│   ├── #sidebar-resize             Drag separator
│   └── #chat-area                  Chat area
│       ├── #chat-placeholder       Empty state "Select a contact to start chatting"
│       └── #chat-active            Active conversation
│           ├── #chat-header        Title + back + call button
│           ├── #call-status-bar    Call status bar (timer + hangup)
│           ├── #message-list       Message list (scroll container)
│           └── #input-area         Input area
│               ├── .input-tools    Voice 🎙️ / Image 🖼️ / File 📎
│               ├── textarea        Message input
│               └── #send-btn       Send button
│
├── #call-modal                     Voice call modal (incoming/active)
├── #create-room-modal              Create group modal (name + member multi-select)
├── #alert-modal                    Alert modal
├── #qr-modal                       My ID QR code modal
├── #scan-modal                     QR scan modal (video + canvas)
├── #delete-confirm-modal           Delete account password confirmation
├── #image-viewer                   Image fullscreen viewer (zoom+rotate+swipe)
├── #transfer-out-panel             Account transfer-out panel (select+verify+QR)
└── #transfer-in-panel              Account transfer-in panel (scan+enter ID+connect)
```

---

## 7. Internationalization (i18n)

Supports **10 languages**: Chinese, English, Japanese, German, French, Spanish, Portuguese, Hebrew, Korean, Italian

**Implementation:**
```javascript
// 1. Browser language detection (navigator.language first 2 chars)
_i18n.lang = navigator.language.substring(0,2)
// 2. Dictionary mapping
_i18n.dict = { 'pchat.placeholder.nickname': { zh: '输入你的昵称', en: 'Enter your nickname', ... } }
// 3. Translation function
_i18n.t(key) → returns current language text
// 4. Parameter formatting
_i18n.fmt(key, placeholder, value) → 'Your ID: abc123'
// 5. UI placeholder application (called in init())
_i18n.applyUI() → sets all input placeholders + button titles
// 6. HTML language switching (inline in index.html <head>)
.lang-zh .zh { display:inline }  (JS generates <style> tag)
```

---

## 8. Security Model

### 8.1 Complete Encryption Chain

```
┌─────────────────────────────────────────────────────────┐
│  User A (Sender)                                        │
│                                                         │
│  Plaintext → RSA-2048-OAEP (B's public key) → Ciphertext│
│                │                                        │
│                │  >150B → chunked encryption            │
│                ▼                                        │
│         DataChannel ─────────────►                      │
│         (DTLS transport encryption)       │              │
│                                    ▼                     │
│                              User B (Receiver)           │
│                                                         │
│                              Ciphertext → RSA private key → Plaintext
│                                        │               │
│                                        ▼               │
│                              AES-CBC encrypt → IndexedDB │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Security Features

| Protection Layer | Implementation |
|-----------------|----------------|
| Message transport | RSA-2048-OAEP-SHA256 end-to-end |
| Long messages | Auto-chunk (>150B, 180B/chunk) |
| Database | AES-256-CBC all records |
| File storage | AES-256-CBC independent |
| Key derivation | PBKDF2-SHA256, 100K iterations, random salt per account |
| Key isolation | Per-account IndexedDB + per-account AES key |
| Public key fingerprint | MD5(publicKey PEM) first 8 chars |
| File integrity | SHA-256 hash + length double check |
| Transport | WebRTC DTLS encrypted channel |
| Duplicate login | Session Lock cross-tab mutual exclusion |
| Delete verification | Password verification before account deletion |

### 8.3 Security Boundaries and Limitations

| Risk | Description |
|------|-------------|
| Signaling leakage | Public PeerJS server (0.peerjs.com) sees user IDs |
| Voice messages | `{type:"voice"}` not RSA encrypted, DTLS only |
| Group visibility | Group owner can see all messages (per-member encryption) |
| No forward secrecy | Long-term RSA key pairs, no PFS |
| Key storage | Private key AES-encrypted in IndexedDB, depends on device security |
| WebRTC metadata | IP address exposed via ICE to peer |

---

## 9. Deployment and Usage

### 9.1 Running

```bash
# Method 1: Local HTTP server (recommended for dev)
cd pchat
python3 -m http.server 8080
# Visit http://localhost:8080

# Method 2: HTTPS deployment (voice features need HTTPS or localhost)
# Deploy to Nginx / Caddy / GitHub Pages etc.

# Method 3: Open index.html directly in browser
# (some features like voice calls need HTTP server)
```

### 9.2 Browser Compatibility

| Browser | Support |
|---------|---------|
| Edge 90+ | ✅ Full (recommended for Windows) |
| Chrome 90+ | ✅ Full (Linux/macOS; Windows users: see note) |
| Firefox 90+ | ✅ Full |
| Safari 15+ | ✅ Basic |
| iOS Safari / Chrome | ✅ Basic (responsive) |
| Mobile Chrome / Firefox | ✅ Supported |

> **Windows users**: Chrome on Windows may fail to generate correct ICE candidates in certain network environments, causing P2P connections to fail. **Microsoft Edge is recommended on Windows** — it uses the same Chromium engine but handles network interfaces more reliably for WebRTC.

### 9.3 Usage Flow

1. **Register**: Open page → enter nickname + password → auto-generate 12-char ID
2. **Add friend**: Share ID / generate QR / scan
3. **Chat**: Text, images, files, voice messages
4. **Call**: Click 📞 to initiate voice call
5. **Groups**: Groups Tab → "+ New Group" → select members
6. **Transfer device**: "Transfer Account" → generate QR → scan on new device

---

## 10. File List

```
pchat/
├── index.html                  Main entry page (all UI HTML)
├── README.md                   Project description (English)
├── webrtc-test.html            WebRTC network diagnostic tool
├── webrtc-candidates.html      ICE Candidate detection tool
├── .gitignore
│
├── docs/
│   ├── pchat-project-doc.md    This technical documentation
│   ├── SECURITY.md             Security model and audit
│   ├── DEPLOY.md               Deployment guide
│   ├── CONTRIBUTING.md         Contribution guidelines
│   ├── bugs.md                 Bug report
│   └── CHANGELOG.md            Version history
│
└── dist/
    ├── pchat.js                Core business logic (356KB, 6914 lines)
    ├── chat.css                Global stylesheet (22KB)
    ├── peerjs.min.js           PeerJS 1.5.4 (87KB)
    ├── forge.min.js            Forge 0.7.0 RSA library (282KB)
    ├── crypto-js.js            CryptoJS AES library (219KB)
    ├── qrcode.min.js           QR code generation (20KB)
    └── jsqr.min.js             QR code scanning (257KB)
```

---

## 11. Key Design Decisions

| Decision | Reason |
|----------|--------|
| Pure frontend, no backend | Maximum privacy, zero ops cost |
| PeerJS public signaling | No need to build signaling server, low deployment barrier |
| RSA-2048 per-contact key pair | Simplified key management, isolate different contacts |
| Chunked encryption (180B/chunk) | RSA-2048 single encryption limit ~190 bytes |
| IndexedDB over localStorage | Supports large storage (images/files up to GB) |
| Group chat P2P broadcast | No group key management or server coordination |
| Dependencies bundled locally | Offline-capable, no CDN dependency, privacy-friendly |
| OpenSSL format AES | CryptoJS default format, cross-language compatible |
| Thumbnail + original separation | Fast thumbnail render, original on-demand |

---

## 12. Improvement Suggestions

| Suggestion | Priority | Description |
|------------|----------|-------------|
| **Video calls** | Medium | Currently audio only, extend `getUserMedia({video:true})` |
| **Custom signaling server** | High | Replace public PeerJS signaling for reliability and privacy |
| **Voice message encryption** | High | Voice messages not application-layer encrypted |
| **Forward secrecy (PFS)** | Medium | Introduce ECDH ephemeral key exchange instead of long-term RSA |
| **Message recall/delete** | Low | Support recall sent messages or delete local records |
| **Message search** | Low | Full-text search in chat history |
| **PWA support** | Medium | Service Worker offline cache and install |
| **File resume transfer** | Low | Large file transfer resume from breakpoint |
| **TURN relay** | Medium | Add TURN server for symmetric NAT scenarios |
| **Video messages** | Low | Short video recording and sending like voice messages |

---

## Appendix A: Data Flow Diagram

```
Register:
  User input ──► generateId() ──► randomSalt() ──► deriveAesKey(password, salt)
                          │                    │
                          ▼                    ▼
                    12-char random ID     AES-256 key (Hex)
                                     (PBKDF2 100K iters)
  DB.create → store salt (plain) → store user (encrypted) → PeerJS init

Login:
  Select account + password ──► DB.read salt ──► deriveAesKey(password, salt)
                                                    │
                                        Success → load contacts/groups → PeerJS init
                                        Fail → "Wrong password"

Send message:
  Message text ──► contact.publicKey ──► RSA encryptChunks() ──► conn.send()
                                          │
                                   >150B: chunked
                                   ≤150B: single chunk

Receive message:
  conn.on("data") ──► type="chat" ──► RSA decryptChunks() ──► AES encryptAes()
                                          │                      │
                                    Local privateKey          Store in IndexedDB
```

## Appendix B: Version History Summary

| Version | Date | Key Changes |
|---------|------|-------------|
| `20260520.1` | 2026-05-20 | Per-account random salt, code cleanup |
| `20260515.5` | 2026-05-15 | Multi-account + ID change + account transfer |
| Earlier | - | Session Lock, QR scan, image viewer, file encryption, STUN optimization, MindRender rebranding |

See `docs/CHANGELOG.md` for details.
