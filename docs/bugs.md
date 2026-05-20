# PChat Bug Report

> **Audit Date**: 2026-05-20 | **Code Version**: `20260520.1` | **Scope**: All files

---

## Status Legend

| Status | Description |
|--------|-------------|
| ✅ Fixed | Fixed in current version |
| 🔴 Critical | Directly affects functionality correctness or security |
| 🟠 High | Significantly affects reliability or data integrity |
| 🟡 Medium | Affects performance/UX, has workaround |
| 🟢 Low | Code smell, minor impact |

---

## Bug Summary

| Severity | Total | Fixed | Pending |
|----------|-------|-------|---------|
| 🔴 Critical | 3 | 3 | 0 |
| 🟠 High | 4 | 2 | 2 |
| 🟡 Medium | 5 | 0 | 5 |
| 🟢 Low | 4 | 0 | 4 |

---

## 🔴 Critical

### ✅ BUG-001: ID Change Notification Cannot Decrypt (Fixed)

- **File**: `dist/pchat.js`
- **Fixed in**: `20260520.x`
- **Fix**: `_onIdChangeNotification` now correctly uses `senderContact.keypair.privateKey`

### ✅ BUG-002: File Transfer SHA-256 Hash Check Completely Broken (Fixed)

- **File**: `dist/pchat.js`
- **Fixed in**: `20260520.x`
- **Fix**: `_hashBase64` now uses `CryptoJS.enc.Base64.parse()` correctly

### ✅ BUG-003: Transfer contacts table schema mismatch (Fixed)

- **File**: `dist/pchat.js`
- **Fixed in**: `20260520.x`
- **Fix**: `_ensureTransferDb` now uses same keyPath and indexes as main DB

---

## 🟠 High (2)

### ✅ BUG-006: deriveAesKey salt is fixed value (Fixed)

- **File**: `dist/pchat.js` L258
- **Severity**: 🟠 High → ✅ Fixed

**Original issue:**
```javascript
deriveAesKey(password, userId) {
    const salt = CryptoJS.enc.Utf8.parse("pchat-salt" + (userId || ""));
    ...
}
```

All callers used `Crypto.deriveAesKey(pw)` without userId. Documentation claimed salt was `"pchat-salt"+userId`, but it was always `"pchat-salt"`.

**Impact**: All users shared the same salt, reducing password security. Two users with the same password would have the same encryption key.

**Fix:**
- Register: `Crypto.randomSalt()` generates 16-byte random hex salt
- Store as plaintext record in IndexedDB `user` table (`id: "_salt"`), unencrypted
- Login/delete/transfer: Read salt from DB, pass to `deriveAesKey(pw, salt)`
- Old accounts without salt record → fallback to `"pchat-salt"` (backward compatible)
- Salt does not change with userId (userId is mutable, salt is fixed)
- Account transfer copies `_salt` record with `user` table to new device

---

### BUG-004: _onFileFooter missing base64 length check

- **File**: `dist/pchat.js` ~L3364
- **Severity**: 🟠 High

`_onFileHeader` stores `info.expectedBase64Len`, but `_onFileFooter` never checks if the assembled base64 length matches. SHA-256 hash check is the main defense, but length check is the last redundant check.

**Fix suggestion**: Add in `_onFileFooter`:
```javascript
if (fullBase64.length !== info.expectedBase64Len) {
    this.showAlert(_i18n.t('pchat.file.incomplete'));
    return;
}
```

---

### BUG-007: deleteAccount() is dead code

- **File**: `dist/pchat.js` L2337
- **Severity**: 🟠 High

`deleteAccount()` uses `confirm()` popup, but all delete buttons now use `_showDeleteConfirm()` (password verification modal). `deleteAccount()` is never triggered, residual code.

**Fix suggestion**: Delete the function or make it private `_deleteAccount()` and call from `_showDeleteConfirm`.

---

## 🟡 Medium (5)

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

### BUG-009: _openImageFromDb reads message twice

- **File**: `dist/pchat.js` ~L2748
- **Severity**: 🟡 Medium

Method calls `DB.get("messages", msgId)` twice — first as fallback, then again to get thumbnail.

**Fix suggestion**: Cache the first read result, reuse it.

---

### BUG-010: Call log direction always "received"

- **File**: `dist/pchat.js` `_recordCallMessage()`
- **Severity**: 🟡 Medium

```javascript
direction: "received",  // Fixed value
```

Call logs are marked `received` regardless of caller/callee. Caller's call log direction is wrong.

**Fix suggestion**: Set direction based on caller/callee role.

---

### BUG-011: Image viewer event listeners not cleaned up

- **File**: `dist/pchat.js` `_initImageViewerGesture()`
- **Severity**: 🟡 Medium

`viewer.onwheel = ...` and touch/mouse events on `container` are not removed after closing viewer. Multiple open/close cycles may accumulate duplicate listeners.

**Fix suggestion**: Remove all event listeners in `closeImageViewer()`.

---

### BUG-012: Large number of console.log not cleaned

- **File**: `dist/pchat.js` (241 occurrences)
- **Severity**: 🟡 Medium

241 `console.log/warn/error` statements in production code. While not affecting functionality:
- Increases bundle size (~15KB)
- Exposes internal implementation details
- May affect performance (log I/O)

**Fix suggestion**: Add simple log level control, disable debug logs in production mode.

---

## 🟢 Low (4)

### BUG-013: DB.put fire-and-forget

- **File**: `dist/pchat.js` multiple places
- **Severity**: 🟢 Low

```javascript
DB.put("messages", msg, this.my.aesKey).then(...)  // Not awaited
```

Messages may be displayed in UI but fail to persist. Probability is extremely low in normal scenarios.

---

### BUG-014: _onCallEnd not cleaning _pendingCall

- **File**: `dist/pchat.js`
- **Severity**: 🟢 Low

When call ends abnormally (not via rejectCall), `_pendingCall` is not cleared, may cause subsequent incoming call handling issues.

---

### BUG-015: Transfer target table missing indexes

- **File**: `dist/pchat.js` Transfer DB creation
- **Severity**: 🟢 Low

Handled in BUG-003 fix. Target device now creates correct indexes.

---

### BUG-016: Group chat send failures silent

- **File**: `dist/pchat.js` `sendMessage()` group chat branch
- **Severity**: 🟢 Low

If `PeerConn.send(memberId, content)` fails in group chat, message is silently lost, sender is unaware.

**Fix suggestion**: Add per-member send failure detection and UI feedback.

---

## Cleaned Issues (2026-05-20)

| Issue | Status | Description |
|-------|--------|-------------|
| `mr_invite` remnants | ✅ Cleaned | All `localStorage.getItem("mr_invite")` changed to `"pchat_invite"` |
| MindRender branding | ✅ Cleaned | Recorded in CHANGELOG, no remnants in code |
| BUG-001 ID change decrypt | ✅ Fixed | Uses correct keypair |
| BUG-002 SHA-256 hash | ✅ Fixed | Uses CryptoJS built-in conversion |
| BUG-003 Transfer schema | ✅ Fixed | Unified keyPath and indexes |
| BUG-005 Session Lock | ✅ Fixed | Uses PeerConn.peer correctly |
| BUG-006 deriveAesKey salt | ✅ Fixed | Per-account random salt in IndexedDB |
