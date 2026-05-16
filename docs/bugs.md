# PChat Bug 报告

> **审查日期**: 2026-05-16 | **代码版本**: `20260515.5` | **审查范围**: 全部文件

---

## Bug 总览

| 严重程度 | 数量 | 说明 |
|----------|------|------|
| 🔴 Critical | 3 | 直接影响功能正确性或安全性 |
| 🟠 High | 4 | 显著影响可靠性或数据完整性 |
| 🟡 Medium | 5 | 影响性能/体验，有workaround |
| 🟢 Low | 4 | 代码异味，影响较小 |

---

## 🔴 Critical (3)

### BUG-001: ID 变更通知无法解密

- **文件**: `dist/pchat.js`  
- **行号**: `_onIdChangeNotification()` 约 L1984-2030
- **严重程度**: 🔴 Critical

**描述:**
`_onIdChangeNotification` 尝试用 `this.my.keypair?.privateKey` 解密 ID 变更通知。

```javascript
// L1994
const myPrivKey = this.my.keypair?.privateKey;
```

但 `this.my` 是 `{ id, nickname, password, aesKey }`，**没有 `keypair` 字段**。每个联系人的密钥对存储在 `contact.keypair` 中。`this.my.keypair` 始终为 `undefined`，导致解密永远失败，ID 变更通知静默丢失。

**影响:** 好友更换 ID 后，己方永远不会收到通知，联系人列表中的旧 ID 无法自动更新。

**修复建议:**
```javascript
// 应改为：通过 senderId 查找对应联系人的密钥对
const contact = this.contacts.find(c => c.userId === senderId);
if (!contact || !contact.keypair) return;
const myPrivKey = contact.keypair.privateKey;
```

---

### BUG-002: 文件传输 SHA-256 哈希校验完全失效

- **文件**: `dist/pchat.js`  
- **行号**: `_hashBase64()` ~L2438, `_onFileFooter()` ~L2154
- **严重程度**: 🔴 Critical

**描述:**
`_hashBase64` 试图用 CryptoJS 对 base64 解码后的原始字节计算 SHA-256：

```javascript
// L2438
_hashBase64(base64Str) {
    const bytes = atob(base64Str);
    let wordArray = CryptoJS.lib.WordArray.create(bytes.length);
    for (let i = 0; i < bytes.length; i++) 
        wordArray.words[i >>> 2] |= bytes.charCodeAt(i) << (24 - (i & 3) * 8);
    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
}
```

`CryptoJS.lib.WordArray.create(bytes.length)` 将 `bytes.length` (一个数字) 作为 `words` 参数传入 `init()`。CryptoJS 的 `init` 执行 `this.words = words || []`，导致 `this.words` 被设为一个数字而非数组。后续 `wordArray.words[i >>> 2] = ...` 赋值无效。

**结果：所有文件的哈希值完全相同**，文件损坏无法被检测到。

**影响:** 大文件在 WebRTC 传输中如有 bit 翻转或丢块，接收方无法发现，用户得到损坏的文件无提示。

**修复建议:**
```javascript
_hashBase64(base64Str) {
    // 正确方式：用 CryptoJS 内置转换
    const wordArray = CryptoJS.enc.Base64.parse(base64Str);
    return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
}
```

---

### BUG-003: Transfer contacts 表 schema 不一致

- **文件**: `dist/pchat.js`  
- **行号**: `DB.openFor()` ~L310 vs `_storeTableInTarget()` ~L4400
- **严重程度**: 🔴 Critical

**描述:**
主数据库创建 contacts 表：
```javascript
// L310 - DB.openFor()
const cs = db.createObjectStore("contacts", { keyPath: "contactId" });
cs.createIndex("userId", "userId", { unique: true });
cs.createIndex("nickname", "nickname", { unique: false });
```

但账户转移创建 contacts 表：
```javascript
// Transfer _storeTableInTarget (DB creation)
const cs = db.createObjectStore("contacts", { keyPath: "userId" });
cs.createIndex("timestamp", "timestamp", { unique: false });
```

**差异:**
| 属性 | 主 DB | 转移 DB |
|------|-------|---------|
| keyPath | `contactId` | `userId` |
| 索引 1 | `userId` (unique) | `timestamp` |
| 索引 2 | `nickname` | 无 |

**影响:** 转移后的账户，`DB.get("contacts", "contact_xxx")` 会失败（keyPath 不同），所有联系人操作异常。

---

## 🟠 High (4)

### BUG-004: _onFileFooter 缺少 base64 长度校验

- **文件**: `dist/pchat.js` L2135-2160
- **严重程度**: 🟠 High

`_onFileHeader` 接收并存储了 `info.expectedBase64Len`，但在 `_onFileFooter` 中只做了哈希校验（BUG-002 导致无效），从未检查组装后的 base64 长度是否匹配。如果文件传输中有分块丢失（`info.chunkCount < info.totalChunks` 的检查有但不够），长度校验是最后的防线。

---

### BUG-005: Session Lock 心跳引用错误对象

- **文件**: `dist/pchat.js` L3795
- **严重程度**: 🟠 High

```javascript
// _startLoginHeartbeat
if (this.peer) this.peer.destroy();   // ❌ this 是 ChatApp, 没有 .peer
```

`peer` 在 `PeerConn` 模块上，不是 `ChatApp`。跨标签重复登录检测后，PeerJS 连接未正确销毁。好在后续 `location.reload()` 会刷新页面。

---

### BUG-006: deriveAesKey 的 userId 参数从未使用

- **文件**: `dist/pchat.js` L247-253
- **严重程度**: 🟠 High

```javascript
deriveAesKey(password, userId) {
    const salt = CryptoJS.enc.Utf8.parse("pchat-salt" + (userId || ""));
    ...
}
```

所有调用点 `registerUser()` 和 `loginUser()` 都是 `Crypto.deriveAesKey(pw)` (无 userId)。文档声称 salt 为 `"pchat-salt"+userId`，实际永远是 `"pchat-salt"`。

**影响:** 所有用户的 AES 密钥使用同一个 salt，降低了密码安全性。若两个用户密码相同，加密密钥也相同。

---

### BUG-007: removeContact 中 .promise 在标准 IndexedDB 不存在

- **文件**: `dist/pchat.js` ~L1496
- **严重程度**: 🟠 High

```javascript
DB.db.transaction("contacts", "readwrite")
    .objectStore("contacts")
    .delete("contact_" + userId).promise;  // ❌ IDBRequest 无 .promise
```

抛出 TypeError（被 try/catch 吞掉），联系人删除的 DB 操作静默失败。联系人已从内存移除但下次登录会重新出现。

---

## 🟡 Medium (5)

### BUG-008: 消息列表每次都全量解密

- **文件**: `dist/pchat.js` `_renderMessages()` L2070, `_onReceiptReceived()` L2032, `_loadMessages()` L2580
- **严重程度**: 🟡 Medium

```javascript
const msgs = await DB.list("messages", this.my.aesKey);  // 解密全部消息!
const conv = msgs.filter(m => m.peerId === convId);       // 然后过滤
```

每条消息都需 AES 解密。随着消息量增大（数千条），切换会话会明显卡顿。IndexedDB 已有 `peerId` 索引但未利用。

---

### BUG-009: _openImageFromDb 重复读取消息

- **文件**: `dist/pchat.js` ~L2748
- **严重程度**: 🟡 Medium

方法中 `DB.get("messages", msgId)` 被调用了两次——先作为 fallback，后面又调用来取 thumbnail。

---

### BUG-010: 通话记录的 direction 始终为 "received"

- **文件**: `dist/pchat.js` `_recordCallMessage()` ~L3000
- **严重程度**: 🟡 Medium

```javascript
direction: "received",  // 固定值
```

无论主叫还是被叫，通话记录都标记为 `received`。主叫方的通话记录方向错误。

---

### BUG-011: deleteAccount() 为死代码

- **文件**: `dist/pchat.js` ~L1431
- **严重程度**: 🟡 Medium

`deleteAccount()` 使用 `confirm()` 弹窗，但所有删除按钮已改为 `_showDeleteConfirm()` (密码验证弹窗)。`deleteAccount()` 永远无法被触发，属残留代码。

---

### BUG-012: 图片查看器事件监听未清理

- **文件**: `dist/pchat.js` `_initImageViewerGesture()` ~L3224
- **严重程度**: 🟡 Medium

`viewer.onwheel = ...` 和 `container` 上的 touch/mouse 事件在关闭 viewer 后未移除，多次打开关闭可能累积重复监听。

---

## 🟢 Low (4)

### BUG-013: DB.put 火后不理 (fire-and-forget)

- **文件**: `dist/pchat.js` 多处
- **严重程度**: 🟢 Low

```javascript
DB.put("messages", msg, this.my.aesKey).then(...)  // 未 await
```

消息可能在 UI 显示后、但持久化失败时丢失。正常场景下概率极低。

---

### BUG-014: _onCallEnd 未清理 _pendingCall

- **文件**: `dist/pchat.js` ~L2977
- **严重程度**: 🟢 Low

当通话因异常结束（非通过 rejectCall）时，`_pendingCall` 未被清空，可能导致后续来电处理异常。

---

### BUG-015: Transfer 转入表缺少索引

- **文件**: `dist/pchat.js` Transfer DB 创建
- **严重程度**: 🟢 Low

转入方创建的 contacts 表缺少 `nickname` 索引，且 keyPath 不匹配。已在 BUG-003 中详述。

---

### BUG-016: 群聊发送失败时无错误提示

- **文件**: `dist/pchat.js` `sendMessage()` 群聊分支 ~L2260
- **严重程度**: 🟢 Low

群聊中如果 `PeerConn.send(memberId, content)` 失败，消息静默丢失，发信人无感知。

---

## 汇总建议

| 优先修复 | Bug IDs |
|----------|---------|
| 🔴 立即修复 | BUG-001, BUG-002, BUG-003 |
| 🟠 尽快修复 | BUG-004, BUG-005, BUG-006, BUG-007 |
| 🟡 计划修复 | BUG-008 ~ BUG-012 |
| 🟢 低优先级 | BUG-013 ~ BUG-016 |
