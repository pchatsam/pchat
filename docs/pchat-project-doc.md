# PChat 项目技术文档

> **版本**: `20260515.5` | **数据库版本**: 2 | **文档日期**: 2026-05-16

---

## 1. 项目概述

**PChat** 是一款**纯前端 P2P 即时通讯应用**，基于 PeerJS (WebRTC) 构建，所有消息通过点对点直连传输，无需自建后端服务器。

| 属性 | 值 |
|------|-----|
| **GitHub** | https://github.com/pchatsam/pchat |
| **项目路径** | `/home/samyujie/pchat` |
| **主入口** | `index.html` |
| **核心代码** | `dist/pchat.js` (~219KB, 4432 行) |
| **样式表** | `dist/chat.css` (~29KB) |
| **许可证** | 开源 |

### 核心特性

- **端到端加密**：RSA-2048-OAEP 公钥交换 + AES-256-CBC 数据库加密
- **P2P 直连**：WebRTC DataChannel，无消息中继服务器
- **丰富媒体**：文本、图片、文件、语音消息
- **实时通话**：WebRTC 音频通话
- **群聊**：客户端分组 + 逐一点对点广播
- **离线存储**：IndexedDB 加密存储全部数据
- **多账户**：支持浏览器内保存/切换多个账户
- **账户转移**：P2P 数据迁移到另一设备
- **10 语言**：中/英/日/德/法/西/葡/希伯来/韩/意
- **Session Lock**：跨标签页防重复登录

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **信令** | PeerJS 1.5.4 | WebRTC 连接建立，使用公共信令服务器 (0.peerjs.com) |
| **传输** | WebRTC DataChannel | P2P 可靠有序传输 (`reliable: true`) |
| **语音通话** | WebRTC MediaConnection | 实时音频流 (getUserMedia) |
| **RSA 加密** | Forge 0.7.0 | RSA-2048-OAEP-SHA256 密钥对生成与加解密 |
| **AES 加密** | CryptoJS 3.x | AES-256-CBC (OpenSSL 格式, PBKDF2 密钥派生) |
| **存储** | IndexedDB | 多表加密存储 (每账户独立数据库) |
| **二维码** | qrcode.js | 用户 ID / 转移 ID 生成 QR 码 |
| **扫码** | jsQR | 摄像头实时识别 QR 码 |
| **i18n** | 自研字典方案 | 10 语言运行时切换 |

### 第三方库 (本地打包，零 CDN 依赖)

```
dist/
├── peerjs.min.js      87KB    WebRTC 封装库 (PeerJS 1.5.4)
├── forge.min.js      282KB    RSA 加解密库 (Forge 0.7.0)
├── crypto-js.js      219KB    AES 加解密 + PBKDF2 (CryptoJS)
├── qrcode.min.js      20KB    二维码生成
├── jsqr.min.js       257KB    QR 码识别
├── pchat.js          219KB    核心业务逻辑
└── chat.css           29KB    全局样式表
```

---

## 3. 系统架构

### 3.1 整体架构

```
┌──────────────────────────────────────────────────────────┐
│                     浏览器 (纯前端)                        │
│                                                          │
│  ┌───────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  UI 层    │   │  ChatApp    │   │   PeerConn       │  │
│  │ (index    │◄──│  业务逻辑    │◄──│  (PeerJS 封装)    │  │
│  │  .html +  │   │  - 消息收发  │   │  - 连接管理       │  │
│  │  chat.css)│   │  - 群组管理  │   │  - 消息加密发送    │  │
│  └───────────┘   │  - 文件传输  │   │  - flushPending   │  │
│                  │  - 账户转移  │   └────────┬─────────┘  │
│                  └──────┬──────┘            │             │
│                    ┌────┴────┐     ┌────────┴────────┐   │
│                    │  Crypto │     │       DB        │   │
│                    │ RSA+AES │     │   (IndexedDB)   │   │
│                    └─────────┘     └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                           │                       │
                           ▼                       ▼
              ┌─────────────────────┐    ┌─────────────────┐
              │  PeerJS 公共信令     │    │  对端浏览器       │
              │  (0.peerjs.com:443) │    │  (P2P DataChannel)│
              └─────────────────────┘    └─────────────────┘
```

### 3.2 模块详细说明

#### 3.2.1 `Crypto` — 加密模块 (Forge + CryptoJS)

```
Crypto
├── generateKeypair()          RSA-2048 密钥对生成 (forge.pki.rsa)
│   └── e=0x10001 (65537), bits=2048
├── keyFingerprint(pem)        公钥 PEM 的 MD5 前 8 位 (唯一指纹)
├── encryptWithPubkey()        公钥加密 → 短消息(≤150B)单块 / 长消息自动分块
├── decryptWithPrivkey()       私钥解密 → 自动检测分块标记 '|' 切换模式
├── encryptChunks()            分块加密 (180 字节/块, RSA-OAEP-SHA256)
├── decryptChunks()            分块解密 (逐块 RSA-OAEP 解密后拼接)
├── deriveAesKey()             PBKDF2-SHA256 派生 AES-256 密钥 (salt="pchat-salt"+userId, 100,000 iters)
├── encryptAes()               AES-256-CBC 加密 (CryptoJS, OpenSSL "Salted__" 格式)
├── decryptAes()               AES-256-CBC 解密
└── generateId()               12 位随机 ID (排除易混淆字符: 0O1Il)
```

**加密链路:**
```
发送: 明文 → 对方 RSA 公钥加密 → DataChannel 传输 → 对方 RSA 私钥解密 → 明文
                                                    ↘ AES 加密后存入 IndexedDB
    
分块策略: 消息 > 150 字节 (UTF-8) 时自动分块，每块 180 字节
```

**密钥派生 (注册/登录):**
```
密码 + 用户ID → PBKDF2-SHA256 (salt="pchat-salt"+userId, 100,000 iters) → AES-256 密钥
→ 加密 IndexedDB 所有记录 + 文件数据
→ 登录时用 cachedKey 加速 (存储在 user 记录中)
```

> **注意**: GitHub README 声称使用 "AES-GCM"，但实际代码使用 `CryptoJS.AES.encrypt()` 默认的 **AES-CBC** 模式 (OpenSSL 兼容格式)。

#### 3.2.2 `DB` — IndexedDB 存储模块

数据库命名: `PChat_{userId}` (每账户独立)

```javascript
DB VER = 2

表结构:
├── user          keyPath: "id"         索引: userId (unique)
│   字段: id, encrypted, ts
│   解密后: { userId, nickname, cachedKey, ts }
│
├── contacts      keyPath: "contactId"  索引: userId (unique), nickname
│   字段: contactId, encrypted, ts
│   解密后: { contactId, userId, nickname, publicKey, keypair, added, requestedKey }
│
├── messages      keyPath: "id"         索引: peerId, timestamp
│   字段: id, encrypted, ts
│   解密后: { id, peerId, content, ts, direction, fromId, sent, type, ... }
│
├── groups        keyPath: "id"
│   解密后: { id, name, members[], created }
│
├── files         keyPath: "id"
│   字段: id, data (AES加密), mime, ts
│
└── invitations   keyPath: "id"
```

**加密存储规则:**

| 存储内容 | 加密方式 |
|----------|----------|
| 用户信息、联系人、消息、群组、邀请 | `DB.put/get` → AES-CBC (自动) |
| 文件/图片原始数据 | `DB.putFile/getFile` → AES-CBC (显式 aesKey 参数) |
| 缩略图 (200px JPEG) | 嵌入消息记录的 `fileData` 字段 (随消息加密) |
| 原图 | 存入 `files` 独立存储 |

#### 3.2.3 `PeerConn` — PeerJS 连接管理

```javascript
PeerConn.peers[peerId] = {
    conn:      DataConnection,  // PeerJS 数据连接
    myKey:     {publicKey, privateKey},  // 本地 RSA 密钥对
    peerKey:   PEM,             // 对方公钥 (握手完成后设置)
    connected: boolean          // 连接是否打开
}
```

**核心方法:**

| 方法 | 功能 |
|------|------|
| `init(myId, callback)` | 初始化 PeerJS，配置 STUN 服务器 |
| `connect(peerId)` | 建立 P2P 数据连接 |
| `_bind(conn, peerId, initiator)` | 绑定 data/open/close/error 事件 |
| `send(peerId, content, msgId)` | RSA 加密后发送 |
| `flushPending(peerId)` | 重连后补发未送达消息 |
| `sendVoice/sendFile*/call()` | 媒体/文件/通话 |
| `close()` | 销毁 PeerJS 实例 |

**STUN 服务器配置 (实测可用, 按延迟排序):**
```javascript
iceServers: [
    { urls: 'stun:stun.chat.bilibili.com:3478' },    // ~95ms
    { urls: 'stun:stun.miwifi.com:3478' },           // ~106ms
    { urls: 'stun:stun.cloudflare.com:3478' },        // ~183ms
    { urls: 'stun:stun.nextcloud.com:3478' },         // ~226ms
    { urls: 'stun:stun.l.google.com:19302' },         // ~245ms
]
```

#### 3.2.4 `AccountManager` — 多账户管理

- 账户列表存储在 `localStorage` (`pchat_accounts`)
- 每账户独立 IndexedDB (`PChat_{userId}`)
- 删除账户同时清理 IndexedDB (`indexedDB.deleteDatabase`)
- 支持密码验证后删除 (防误删)

#### 3.2.5 `ChatApp` — 主业务逻辑

核心状态对象:
```javascript
ChatApp = {
    my:           { id, nickname, password, aesKey },
    contacts:     [],            // 联系人列表 (含密钥对)
    groups:       [],            // 群组列表
    unreadCount:  {},            // 未读数 {peerId: count}
    activeConv:   { type, id },  // 当前会话
    fileTransfer: { pending: {} },  // 文件接收缓冲区
    call:         { active, peerId, state, timer, ... },
    voice:        { recording, recorder, chunks, ... },
    imageViewer:  { zoom, rotation, panX, panY, swipeIndex, ... },
}
```

---

## 4. 功能详解

### 4.1 用户注册与登录

#### 注册流程 (registerUser)

1. 输入昵称 + 密码 → 校验非空
2. `Crypto.generateId()` 生成 12 位随机 ID
3. `Crypto.deriveAesKey(pw)` PBKDF2 派生 AES 密钥 (100,000 迭代)
4. `DB.openFor(myId)` 创建独立 IndexedDB
5. `DB.put("user", ...)` 保存加密用户记录 (含 cachedKey 加速登录)
6. `AccountManager.addAccount()` 注册到本地账户列表
7. `PeerConn.init()` 初始化 P2P 连接
8. 如有邀请链接参数 (`#invite-xxx`)，自动发送好友请求

#### 登录流程 (loginUser)

1. 选择已保存账户 → 输入密码
2. `DB.openFor(selectedId)` 打开对应数据库
3. `Crypto.deriveAesKey(pw)` 派生密钥 → 尝试解密 `user` 记录验证密码
4. 优先使用 `cachedKey` (避免重新派生)，无缓存则用 testKey
5. 加载联系人 + 群组列表
6. `_migrateImageMessages()` 执行图片消息迁移 (旧格式→缩略图+files分离)
7. `PeerConn.init()` 初始化 P2P，自动连接在线联系人

#### Session Lock (防重复登录)

- 通过 `localStorage.pchat_login` token 实现跨标签页互斥
- 每 2 秒心跳检测 (`setInterval`) 在 `_startLoginHeartbeat`
- 检测到同 ID 在其他标签页登录 → 发送 `kick` 事件 → 自动退出

### 4.2 好友添加 (RSA 公钥交换握手)

```
发起方 (Initiator)                          接收方 (Receiver)
  │                                              │
  │── PeerJS connect ──────────────────────────►│
  │── {type:"add", publicKey, nickname} ───────►│  弹出好友请求卡片
  │                                              │  (friend-request-card)
  │                                              │  用户点击"接受"
  │◄── {type:"accept", key, id, nickname} ──────│  生成/加载密钥对
  │                                              │  保存对方公钥
  │  保存对方公钥 + 密钥对                         │
  │  Cross-test 加密验证                          │
  │                                              │
  ✓ 双向公钥交换完成，RSA 加密通道建立               │
```

**关键实现:**
- 发起方: 建立连接后由业务层发送 `add` 消息 (非 PeerConn 自动)
- 接收方: `conn.on("data")` → type="add" → `_onAddRequest()` → 显示内联卡片
- 已存在好友且已有公钥 → 忽略重复 add 请求
- Accept 时执行 cross-test: 用对方公钥加密 "cross-test" → 验证加密可用

### 4.3 1对1 聊天

**发送消息 (`sendMessage`):**
1. 检查联系人公钥已交换 (handshake 完成) → 否则提示
2. 构造消息对象 `{id, peerId, content, ts, direction:"sent", sent:false}`
3. 通过 `PeerConn.send()` 用对方公钥 RSA 加密后发送
4. 消息存入 IndexedDB (AES 加密): `DB.put("messages", ...)`
5. 按消息长度自动选择单块或分块加密 (>150B → 分块)

**接收消息 (`onChatMsg`):**
1. PeerJS DataChannel `"data"` 事件 → `type:"chat"`
2. 检查联系人公钥已存在 (handshake 完成)
3. `Crypto.decryptChunks()` 用己方私钥 RSA 解密
4. 存入 IndexedDB (AES 加密)
5. 自动发送已读回执 `receipt`

**消息类型枚举:**
| type | 说明 | 加密 |
|------|------|------|
| `chat` | 文本消息 / HTML 消息 | ✅ RSA |
| `voice` | 语音消息 (audio/webm base64) | ❌ 明文 |
| `file-header` | 文件元数据 | ❌ 明文 |
| `file-chunk` | 文件数据分块 | ❌ 明文 |
| `file-footer` | 文件传输完成 | ❌ 明文 |
| `receipt` | 已读回执 | ❌ 明文 |
| `id-change` | ID 变更通知 | ❌ 明文 |

### 4.4 群聊

**纯客户端分组模型 (无群组服务器):**

```
              群主发送消息
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
  成员A公钥加密  成员B公钥加密  成员C公钥加密
    ▼             ▼             ▼
  P2P 直连      P2P 直连      P2P 直连
    ▼             ▼             ▼
  成员A收到     成员B收到     成员C收到
  receipts{A: ✓} receipts{B: ✓} receipts{C: ✓}
```

**实现要点:**
1. 创建群组 → `group.members[]` 存储成员 contactId 列表
2. 发送群消息 → 遍历成员，对每人单独 RSA 加密 + 发送
3. 统一 `msgId` 关联所有成员的发送记录 (群主侧)
4. 每条消息带 `receipts` 字段: `{memberId: timestamp}` 跟踪已读
5. 离线成员消息暂存 → 上线后 `flushPending()` 补发
6. 成员收到群消息 → `fromId` 标识发送方

**消息路由判断:**
- `activeConv.type === "group"` → 遍历 group.members 发送
- `activeConv.type === "contact"` → 直接发送给对应 userId

### 4.5 文件传输 (分块机制)

#### 图片传输

```
发送方:
  1. FileReader.readAsDataURL() → base64
  2. _generateThumbnail(200px JPEG) → 缩略图 base64
  3. SHA-256 计算完整原图哈希
  4. 分割 base64 为 16KB chunks (DataChannel 限制)
  5. file-header → N× file-chunk → file-footer

接收方:
  1. file-header → 创建接收记录 (_pendingFileReceives)
  2. file-chunk → 缓存到 chunks[] 数组 (去重保护, 按 index)
  3. file-footer → 校验长度 + SHA-256 哈希
  4. 拼接完整 base64 → 存入 IndexedDB (AES 加密)
  5. 渲染缩略图在消息列表
```

#### 普通文件传输

- 与图片相同机制，但不生成缩略图
- 以文件卡片形式展示 (文件名 + 大小 + 图标)
- 点击下载 → 从 DB 读取 → `URL.createObjectURL` → 触发下载

#### 完整性校验

- **长度校验**: 接收到的 chunks 拼接后 base64 长度 vs 发送方声明
- **哈希校验**: SHA-256 哈希值比对 (防止中间损坏)
- **去重保护**: 重复 index 的 chunk 自动跳过 (`if pendingChunks[index] return`)

### 4.6 语音消息

**录制:**
1. 点击 🎙️ → `navigator.mediaDevices.getUserMedia({audio:true})`
2. `MediaRecorder` 录制 audio/webm (默认编码)
3. 再次点击停止 → `reader.readAsDataURL(blob)` → base64
4. 保存消息记录 (含 `duration` 时长)
5. 通过 DataChannel 明文发送 `{type:"voice", content, duration}`

**播放:**
1. 点击语音消息 → base64 → ArrayBuffer → Blob URL
2. `new Audio(blobUrl).play()`
3. UI 显示播放状态 (动态样式)

> **安全限制**: 语音消息未做应用层加密 (仅依赖 WebRTC DTLS 传输加密)。

### 4.7 实时语音通话 (PeerJS MediaConnection)

```
呼叫方                             被叫方
  │                                  │
  │ getUserMedia({audio:true})       │
  │ peer.call(peerId, stream) ──────►│
  │                                  │  peer.on("call", call)
  │                                  │  ChatApp._onIncomingPeerCall()
  │                                  │  弹出 call-modal + 响铃
  │◄── call.answer(stream) ─────────│  getUserMedia + answer
  │                                  │
  ◄════ 双向 Opus 音频流 (WebRTC) ═══►
  │                                  │
  │ call.close() ───────────────────►│  挂断
  │ _logCall(duration)               │  _logCall(duration)
```

**功能:**
- 来电弹窗 (`#call-modal`): 显示昵称 + ID + 接听/拒接按钮
- 通话计时器 (`call.timerInterval`): 实时更新 `mm:ss`
- 通话记录: 自动写入 `type:"call-log"` 消息
- 状态: `idle → waiting → connected → closed`

### 4.8 图片查看器

全屏覆盖层 (`#image-viewer`)，支持:

| 操作 | 实现 |
|------|------|
| **手势缩放** | 双指捏合 (touchstart/touchmove) / 鼠标滚轮 (wheel) |
| **拖拽平移** | mousedown/touchstart → mousemove → translate(panX, panY) |
| **左右滑动** | 当前对话图片间切换 (含邻居预加载 `img2`) |
| **旋转** | CSS `transform: rotate(90°×N)` 递增旋转 |
| **下载** | `fetch(blobUrl)` → `URL.createObjectURL` → `<a download>` |
| **工具栏** | 5 秒无操作自动隐藏 (`toolbarTimer`) |

### 4.9 账户转移 (P2P 数据迁移)

通过临时 PeerJS 连接将完整数据库从一台设备迁移到另一台:

```
转出方 (Transfer Out)                      转入方 (Transfer In)
  │                                              │
  │ 1. 选择账户 + 密码验证 (deriveAesKey)          │
  │ 2. 生成 transfer-xxx ID                       │
  │ 3. new Peer(transferId)                       │
  │ 4. 显示 QR 码 (transfer-xxx)                   │
  │                                              │  1. 扫码/手动输入 transfer ID
  │◄── PeerJS connect ──────────────────────────│  new Peer + connect
  │                                              │
  │── transfer-request ◄────────────────────────│  发送请求
  │── transfer-start (tables[]) ────────────────►│
  │── table-start (name, total) ────────────────►│  准备接收
  │── transfer-chunk (table, index, data) ──────►│  逐行存储
  │◄── transfer-ack (index) ────────────────────│  行确认 (流水线)
  │── ... (batch of 5) ─────────────────────────►│  (窗口大小=5)
  │── table-done (tableName) ───────────────────►│  表完成
  │◄── table-ack (tableName) ───────────────────│  表确认
  │── ... next table ...                         │
  │── transfer-complete ────────────────────────►│
  │                                              │  AccountManager.addAccount()
  │                                              │  完成
```

**传输协议:**
| 消息类型 | 方向 | 说明 |
|----------|------|------|
| `transfer-request` | in→out | 转入方发起请求 |
| `transfer-start` | out→in | 开始传输，列出表名 |
| `table-start` | out→in | 某表开始，含总数 |
| `transfer-chunk` | out→in | 单行数据 (JSON 序列化) |
| `transfer-ack` | in→out | 行确认收到 |
| `table-done` | out→in | 表传输完成 |
| `table-ack` | in→out | 表确认 |
| `transfer-complete` | out→in | 全部完成 |

**流水线控制:** 窗口大小 5 (最多 5 个未确认 chunk)，收到 ack 后释放槽位发送下一个。

**数据类型序列化:**
- `Date` → `{__date: timestamp}`
- `Uint8Array` → `{__uint8: [bytes]}`
- 双方用 `_convertToJSON` / `_convertFromJSON` 做双向转换

### 4.10 二维码 / 扫码

- **展示二维码**: 将自身 ID 编码为 QR 码 (`#qr-modal`)
- **扫码添加好友**: 调用摄像头 (`<video>` + `getUserMedia`) → jsQR 实时识别 → 提取 ID → 自动发起好友请求
- **扫码转移**: 在转入模式下扫码 → 识别 `transfer-xxx` ID → 自动连接
- **自动关闭**: 检测到对方扫描后，`closeQRModal()` 自动关闭弹窗
- **成功动画**: 扫码成功有视觉反馈

---

## 5. 消息数据结构

### 文本消息
```javascript
{
    id: "msg_{peerId}_{timestamp}",
    peerId: string,          // 对端/群组 ID
    content: string,         // 消息正文 (HTML 消息以 [HTML] 前缀标记)
    ts: number,              // 时间戳
    direction: "sent" | "received",
    fromId: string,          // 发送方 ID (群聊中标识发言者)
    sent: boolean,           // 是否已成功发出
    isHtml: boolean,         // 是否为 HTML 格式
    receipts: {}             // 已读回执 {memberId: timestamp}
}
```

### 图片消息
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "image",
    fileName: string,
    mimeType: string,
    fileSize: number,
    fileId: string,          // 原图在 files 存储中的 ID
    fileData: string,        // 缩略图 base64 (200px JPEG, 嵌入消息)
    originalHash: string     // 原图 SHA-256 哈希
}
```

### 文件消息
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "file",
    fileName: string,
    mimeType: string,
    fileSize: number,
    fileId: string,          // 原文件在 files 存储中的 ID
    fileData: string         // 完整文件 base64 (AES 加密存储)
}
```

### 语音消息
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "voice",
    content: string,         // audio/webm base64
    duration: number         // 时长 (秒)
}
```

### 通话记录
```javascript
{
    id, peerId, ts, direction, fromId,
    type: "call-log",
    content: string          // "📞 通话 3分20秒" (i18n)
}
```

---

## 6. UI 结构

```
index.html
├── #setup-panel                    注册/登录面板
│   ├── .setup-box
│   │   ├── h2 "🍃 P.Chat"
│   │   ├── #invite-from            邀请来源提示
│   │   ├── #invite-info            注册表单 (昵称 + 密码 + 按钮)
│   │   ├── #account-select-panel   账户选择列表
│   │   ├── #login-password-panel   密码输入 + 登录按钮
│   │   ├── .corner-btn-left        "转移账户" 按钮
│   │   ├── .corner-btn-right       "新建账户" 按钮
│   │   └── #login-loading          进度条 (宽 220px)
│
├── #main-panel                     主界面
│   ├── #sidebar                    侧边栏 (可拖动调整宽度)
│   │   ├── .sidebar-header         用户信息 (昵称+ID+二维码+扫码)
│   │   ├── Tab: #tab-contacts / #tab-groups
│   │   ├── #friend-request-card    好友请求内联卡片
│   │   ├── #contact-tab / #group-tab
│   │   └── #add-friend-box         ID 输入 + 添加按钮
│   ├── #sidebar-resize             拖动分隔条
│   └── #chat-area                  聊天区域
│       ├── #chat-placeholder       空状态占位 "选择一个联系人开始聊天"
│       └── #chat-active            活跃会话
│           ├── #chat-header        标题 + 返回 + 通话按钮
│           ├── #call-status-bar    通话状态栏 (计时器 + 挂断)
│           ├── #message-list       消息列表 (滚动容器)
│           └── #input-area         输入区
│               ├── .input-tools    语音 🎙️ / 图片 🖼️ / 文件 📎
│               ├── textarea        消息输入
│               └── #send-btn       发送按钮
│
├── #call-modal                     语音通话弹窗 (来电/通话中)
├── #create-room-modal              创建群组弹窗 (名称 + 多选成员)
├── #alert-modal                    消息提示弹窗
├── #qr-modal                       我的 ID 二维码弹窗
├── #scan-modal                     扫码弹窗 (video + canvas)
├── #delete-confirm-modal           删除账户密码确认弹窗
├── #image-viewer                   图片全屏查看器 (缩放+旋转+滑动)
├── #transfer-out-panel             账户转出面板 (选择+验证+QR)
└── #transfer-in-panel              账户转入面板 (扫码+输入ID+连接)
```

---

## 7. 国际化 (i18n)

支持 **10 种语言**: 中文、英文、日文、德文、法文、西班牙文、葡萄牙文、希伯来文、韩文、意大利文

**实现机制:**
```javascript
// 1. 浏览器语言检测 (navigator.language 前 2 字符)
_i18n.lang = navigator.language.substring(0,2)
// 2. 字典映射
_i18n.dict = { 'pchat.placeholder.nickname': { zh: '输入你的昵称', en: 'Enter your nickname', ... } }
// 3. 翻译函数
_i18n.t(key) → 返回当前语言的翻译文本
// 4. 带参数格式化
_i18n.fmt(key, placeholder, value) → '你的ID: abc123'
// 5. UI 占位符应用 (在 init() 中调用)
_i18n.applyUI() → 设置所有 input placeholder + button title
// 6. HTML 语言切换 (index.html <head> 中内联)
.lang-zh .zh { display:inline }  (JS 生成 <style> 标签)
```

---

## 8. 安全模型

### 8.1 完整加密链路

```
┌─────────────────────────────────────────────────────────┐
│  用户 A (发送方)                                         │
│                                                         │
│  明文 ──► RSA-2048-OAEP (B 的公钥) ──► 密文              │
│                │                                        │
│                │  >150B → 分块加密 (180B×N)              │
│                ▼                                        │
│         DataChannel ─────────────►                      │
│         (DTLS-SRTP 传输加密)       │                     │
│                                    ▼                     │
│                              用户 B (接收方)              │
│                                                         │
│                              密文 ──► RSA 私钥解密 ──► 明文│
│                                         │               │
│                                         ▼               │
│                              AES-CBC 加密 ──► IndexedDB  │
└─────────────────────────────────────────────────────────┘
```

### 8.2 安全特性

| 防护层 | 实现 |
|--------|------|
| **消息传输** | RSA-2048-OAEP-SHA256 端到端加密 |
| **长消息** | 超过 150 字节自动分块 (180 字节/块) |
| **数据库** | AES-256-CBC 加密全部记录 |
| **文件存储** | AES-256-CBC 独立加密 |
| **密钥派生** | PBKDF2-SHA256, 100,000 次迭代, salt="pchat-salt"+userId |
| **密钥隔离** | 每账户独立 IndexedDB + 独立 AES 密钥 |
| **公钥指纹** | MD5(publicKey PEM) 前 8 位 |
| **文件校验** | SHA-256 哈希 + 长度双重校验 |
| **传输层** | WebRTC DTLS 加密通道 |
| **防重复登录** | Session Lock 跨标签页互斥 |
| **删除验证** | 删除账户需输入密码验证 |

### 8.3 安全边界与限制

| 风险 | 说明 |
|------|------|
| **信令泄露** | 使用 PeerJS 公共信令服务器 (0.peerjs.com)，用户 ID 暴露给信令服务 |
| **语音消息** | 语音消息 `{type:"voice"}` 不经过 RSA 应用层加密，仅依赖 DTLS 传输加密 |
| **群聊可见性** | 群主向每个成员单独加密发送，群主可见所有成员的消息内容 |
| **无前向安全性** | 使用长期 RSA 密钥对，非临时密钥 (无 PFS) |
| **密钥存储** | 私钥以 AES 加密存储在 IndexedDB，浏览器环境的安全性取决于设备本身 |
| **WebRTC 元数据** | IP 地址通过 ICE 暴露给对端 (STUN 服务器可见) |

---

## 9. 部署与使用

### 9.1 运行方式

```bash
# 方式一: 本地 HTTP 服务 (推荐开发)
cd /home/samyujie/pchat
python3 -m http.server 8080
# 访问 http://localhost:8080

# 方式二: HTTPS 部署 (语音功能需要 HTTPS 或 localhost)
# 部署到 Nginx / Caddy / GitHub Pages 等静态服务器
# 示例 Caddy 配置:
# :5009 {
#     tls internal
#     reverse_proxy localhost:5008
# }

# 方式三: 直接用浏览器打开 index.html
# (部分功能如语音通话需要 HTTP 服务)
```

### 9.2 浏览器兼容性

| 浏览器 | 支持 |
|--------|------|
| Chrome / Edge 90+ | ✅ 完全支持 |
| Firefox 90+ | ✅ 完全支持 |
| Safari 15+ | ✅ 基本支持 |
| iOS Safari / Chrome | ✅ 基本支持 (响应式布局) |
| 移动端 Chrome / Firefox | ✅ 支持 |

### 9.3 使用流程

1. **注册**: 打开页面 → 输入昵称 + 密码 → 自动生成 12 位 ID
2. **添加好友**: 分享 ID / 生成二维码 / 扫码
3. **聊天**: 文本、图片、文件、语音消息
4. **通话**: 点击 📞 发起语音通话
5. **群聊**: 群组 Tab → "+ 新建群" → 选择成员
6. **换设备**: "转移账户" → 生成 QR → 新设备扫码接收

---

## 10. 文件清单

```
pchat/
├── index.html                  主入口页面 (含全部 UI HTML)
├── README.md                   项目说明 (英文)
├── webrtc-test.html            WebRTC 网络诊断工具
├── webrtc-candidates.html      ICE Candidate 检测工具
├── .gitignore
│
├── docs/
│   ├── pchat-project-doc.md    本技术文档
│   └── CHANGELOG.md            修改日志
│
└── dist/
    ├── pchat.js                核心业务逻辑 (219KB, 4432 行)
    ├── chat.css                全局样式表 (29KB)
    ├── peerjs.min.js           PeerJS 1.5.4 (87KB)
    ├── forge.min.js            Forge 0.7.0 RSA 库 (282KB)
    ├── crypto-js.js            CryptoJS AES 库 (219KB)
    ├── qrcode.min.js           二维码生成 (20KB)
    ├── jsqr.min.js             QR 码识别 (257KB)
    └── ice-test.html           STUN 服务器连通性测试页
```

---

## 11. 关键设计决策

| 决策 | 理由 |
|------|------|
| 纯前端，无后端 | 最大隐私保护，零运维成本 |
| PeerJS 公共信令 | 无需自建信令服务器，降低部署门槛 |
| RSA-2048 每联系人独立密钥对 | 简化密钥管理，隔离不同联系人的加密 |
| 分块加密 (180B/块) | RSA-2048 单次加密上限 ~190 字节 |
| IndexedDB 而非 localStorage | 支持大容量存储 (图片/文件可达 GB 级) |
| 群聊点对点广播 | 无需群密钥管理和服务器协调 |
| 依赖本地打包 | 离线可用，不依赖 CDN，隐私友好 |
| OpenSSL 格式 AES | CryptoJS 默认格式，跨语言兼容 |
| 缩略图 + 原图分离 | 缩略图快速渲染，原图按需下载 |

---

## 12. 改进建议

| 建议 | 优先级 | 说明 |
|------|--------|------|
| **视频通话** | 中 | 当前仅支持音频，可扩展 `getUserMedia({video:true})` |
| **自定义信令服务器** | 高 | 替换公共 PeerJS 信令，提升可靠性和隐私 |
| **语音消息加密** | 高 | 当前语音消息未经应用层加密 |
| **前向安全性 (PFS)** | 中 | 引入 ECDH 临时密钥交换替代长期 RSA |
| **消息撤回/删除** | 低 | 支持撤回已发送消息或删除本地记录 |
| **消息搜索** | 低 | 在聊天记录中全文搜索 |
| **PWA 支持** | 中 | Service Worker 实现离线缓存和安装 |
| **文件断点续传** | 低 | 大文件传输中断后可从断点继续 |
| **TURN 中继** | 中 | 添加 TURN 服务器应对对称 NAT 场景 |
| **视频消息** | 低 | 类似语音消息的短视频录制发送 |

---

## 附录 A: 数据流图

```
注册:
  用户输入 ──► generateId() ──► deriveAesKey(password) ──► DB 创建 ──► PeerJS 初始化
                    │                    │
                    ▼                    ▼
              12位随机ID          AES-256 密钥 (Hex)
                              (PBKDF2 100K iters)

登录:
  选择账户 + 密码 ──► deriveAesKey(password) ──► 解密 user 记录
                                                    │
                                        成功 → 加载联系人/群组 → PeerJS init
                                        失败 → "密码错误"

发送消息:
  消息文本 ──► contact.publicKey ──► RSA encryptChunks() ──► conn.send()
                                          │
                                   >150B: 分块加密
                                   ≤150B: 单块加密

接收消息:
  conn.on("data") ──► type="chat" ──► RSA decryptChunks() ──► AES encryptAes()
                                          │                      │
                                    己方 privateKey           存入 IndexedDB
```

## 附录 B: 版本历史摘要

| 版本 | 日期 | 主要变更 |
|------|------|----------|
| `20260515.5` | 2026-05-15 | 多账户管理 + ID 变更通知 + 账户转移 (P2P) |
| 更早 | - | Session Lock, 扫码, 图片查看器, 文件加密, STUN 优化, MindRender 去品牌化 |

详见 `docs/CHANGELOG.md`
