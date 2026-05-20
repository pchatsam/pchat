# PChat Bug Report

> **Audit Date**: 2026-05-20 | **Code Version**: `20260520.1` | **Scope**: All files

---

## Status Legend

| Status | Description |
|--------|-------------|
| 🔴 Critical | Directly affects functionality correctness or security |
| 🟠 High | Significantly affects reliability or data integrity |
| 🟡 Medium | Affects performance/UX, has workaround |
| 🟢 Low | Code smell, minor impact |

---

## Bug Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 0 |
| 🟠 High | 2 |
| 🟡 Medium | 6 |
| 🟢 Low | 5 |

---

## 🟠 High

### BUG-004: `_onFileFooter` missing base64 length check

- **File**: `dist/pchat.js` ~L3579
- **Severity**: 🟠 High

`_onFileHeader` stores `info.expectedBase64Len`, but in the traditional path of `_onFileFooter`, length check is handled by `_finalizeChunkedReceive` (`fullBase64.length !== info.expectedBase64Len`). The Binary DC path's `file-footer` only checks `totalRawReceived >= size`, lacking exact length match.

---

### BUG-007: `deleteAccount()` is dead code

- **File**: `dist/pchat.js` L2337
- **Severity**: 🟠 High

`deleteAccount()` uses `confirm()` popup, but all delete buttons now use `_showDeleteConfirm()` (password verification modal). `deleteAccount()` is never triggered, residual code.

**Fix suggestion**: Delete the function or make it private `_deleteAccount()` and call from `_showDeleteConfirm`.

---

## 🟡 Medium

### BUG-008: Message list decrypts all messages every time

- **File**: `dist/pchat.js` `_renderMessages()`, `_loadMessages()`
- **Severity**: 🟡 Medium

```javascript
const msgs = await DB.list("messages", this.my.aesKey);  // Decrypt ALL messages!
const conv = msgs.filter(m => m.peerId === convId);       // Then filter
```

Every message needs AES decryption. As message count grows (thousands), switching conversations causes noticeable lag. IndexedDB has `peerId` index but it's unused.

**Fix suggestion**: Use `DB.listMessagesByPeer(peerId, aesKey)` or add peerId-indexed query.

---

### BUG-009: `_openImageFromDb` reads message twice

- **File**: `dist/pchat.js` ~L2748
- **Severity**: 🟡 Medium

Method calls `DB.get("messages", msgId)` twice — first as fallback, then again to get thumbnail.

**Fix suggestion**: Cache the first read result, reuse it.

---

### BUG-011: Image viewer event listeners not cleaned up

- **File**: `dist/pchat.js` `_initImageViewerGesture()`
- **Severity**: 🟡 Medium

`viewer.onwheel = ...` and touch/mouse events on `container` are not removed after closing viewer. Multiple open/close cycles may accumulate duplicate listeners.

**Fix suggestion**: Remove all event listeners in `closeImageViewer()`.

---

### BUG-012: Large number of `console.log` not cleaned

- **File**: `dist/pchat.js` (241 occurrences)
- **Severity**: 🟡 Medium

241 `console.log/warn/error` statements in production code. While not affecting functionality:
- Increases bundle size (~15KB)
- Exposes internal implementation details
- May affect performance (log I/O)

**Fix suggestion**: Add simple log level control, disable debug logs in production mode.

---

### BUG-015: `_formatTime` hardcodes `zh-CN` locale

- **File**: `dist/pchat.js` L2173-2181
- **Severity**: 🟡 Medium

```javascript
const h = new Date(ts).toLocaleTimeString("zh-CN", {hour:'2-digit', minute:'2-digit'});
const d = new Date(ts).toLocaleDateString("zh-CN", {month:'numeric', day:'numeric'});
```

All time formatting hardcodes `"zh-CN"` locale. Non-Chinese users see Chinese time formats (e.g. `下午3:00` instead of `3:00 PM`). 4 call sites in `_formatTime`.

**Fix suggestion**: Use `_i18n.lang` or `navigator.language` instead of hardcoded locale.

---

### BUG-017: `_recordCallMessage` is never called

- **File**: `dist/pchat.js` L5511
- **Severity**: 🟡 Medium

`_recordCallMessage(peerId, durationSeconds, direction)` is defined with full implementation (stores call-log message to IndexedDB) but is **never invoked** from any code path. `_onCallEnd` does not call it. The `initiateCall()` comment says "5. Record call log message with duration" but step 5 never executes.

**Fix suggestion**: Call `_recordCallMessage` from `_onCallEnd` when call truly ends (not reconnecting). Compute duration from `c.startTime` to `Date.now()`.

---

## 🟢 Low

### BUG-013: `DB.put` fire-and-forget

- **File**: `dist/pchat.js` multiple places
- **Severity**: 🟢 Low

```javascript
DB.put("messages", msg, this.my.aesKey).then(...)  // Not awaited
```

Messages may be displayed in UI but fail to persist. Probability is extremely low in normal scenarios.

---

### BUG-016: Group chat send failures silent

- **File**: `dist/pchat.js` `sendMessage()` group chat branch
- **Severity**: 🟢 Low

If `PeerConn.send(memberId, content)` fails in group chat, message is silently lost, sender is unaware.

**Fix suggestion**: Add per-member send failure detection and UI feedback.

---

### BUG-018: `_onReceiptReceived` full DB scan

- **File**: `dist/pchat.js` L3221
- **Severity**: 🟢 Low

```javascript
async _onReceiptReceived(peerId, msgId) {
    const allMsgs = await DB.list("messages", this.my.aesKey);  // Full scan!
    for (const m of allMsgs) {
        if (m.id === msgId && m.direction === "sent") { ... }
    }
}
```

Every message receipt triggers full DB decrypt + full table scan. High frequency in group chats (one per member receipt).

**Fix suggestion**: Use `DB.get("messages", msgId)` for direct primary key lookup, or maintain in-memory message cache.

---

### BUG-019: `playVoice` Blob URL leak on error path

- **File**: `dist/pchat.js` L4072
- **Severity**: 🟢 Low

```javascript
audio.onerror = () => {
    element.classList.remove('playing');
    // Missing URL.revokeObjectURL(url)
};
audio.play().catch(err => {
    element.classList.remove('playing');
    // Missing URL.revokeObjectURL(url)
});
```

`audio.onended` path properly revokes the Blob URL, but `onerror` and `play().catch()` paths do not. On playback errors (unsupported codec, etc.), Blob URLs accumulate.

**Fix suggestion**: Add `URL.revokeObjectURL(url)` in both error handlers.

---

### BUG-020: Voice recording mic tracks not closed on error

- **File**: `dist/pchat.js` `startRecording()`
- **Severity**: 🟢 Low

The `v.mediaStream` tracks from `navigator.mediaDevices.getUserMedia()` are only stopped in `recorder.onstop`. If `MediaRecorder` errors during recording (device removed, permission revoked), `onstop` is not triggered and the microphone stays open.

**Fix suggestion**: Add `recorder.onerror` handler to close tracks, or force-close in `stopRecording()`.
