# PChat Changelog

## 2026-05-20

### 1. Code Cleanup
- Removed `mr_invite` remnants, unified to `pchat_invite` (5 occurrences)
- Confirmed no MindRender branding remnants in code

### 2. Security Fix: Per-Account Random Salt (BUG-006)
- `Crypto.randomSalt()` generates 16-byte random hex salt
- `Crypto.deriveAesKey(pw, salt)` accepts salt parameter, optional, fallback to `"pchat-salt"`
- Registration: generate salt, store in IndexedDB `user` table (`id: "_salt"`, plaintext)
- Login/delete/transfer: Read salt from DB, pass to key derivation
- Old accounts without salt → fallback to `"pchat-salt"` (backward compatible)
- Salt does not change with userId (userId is mutable, salt is fixed)
- Account transfer copies `_salt` record with `user` table to new device

### 3. Documentation Updates
- Updated `README.md`: Complete rewrite with architecture diagram, features, quick start, security overview
- Updated `docs/bugs.md`: Mark fixed bugs, update audit version
- Updated `docs/pchat-project-doc.md`: Version number, file size updates
- Added `docs/SECURITY.md`: Security audit report (threat model, known risks, cryptographic parameters)
- Added `docs/DEPLOY.md`: Deployment guide (Nginx/Caddy/Docker/GitHub Pages/Vercel/TURN/custom signaling)
- Added `docs/CONTRIBUTING.md`: Contribution guidelines (development workflow, code style, commit checklist)

---

## 2026-05-15

### 1. Removed MindRender Branding
- Removed all "MindRender" and "mindrender" references from `dist/pchat.js`
- Replaced with "PChat"
- Updated PBKDF2 salt from `mindrender-chat-salt` to `pchat-salt`

### 2. File Storage Encryption
- Added AES-256 encryption for file data in IndexedDB
- Modified `DB.putFile` and `DB.getFile` methods to accept `aesKey` parameter
- All call sites updated to pass `aesKey`

### 3. STUN Server Configuration Update
- Tested available STUN servers using `dist/ice-test.html`
- Removed unavailable servers (Baidu, NetEase, Alibaba, Tencent, Syncthing, Google stun1)
- Replaced with 5 tested STUN servers (latency-sorted):
  - `stun.chat.bilibili.com:3478` (~95ms)
  - `stun.miwifi.com:3478` (~106ms)
  - `stun.cloudflare.com:3478` (~183ms)
  - `stun.nextcloud.com:3478` (~226ms)
  - `stun.l.google.com:19302` (~245ms)
- Fixed `ice-test.html` ICE trigger method (added `createOffer` and `setLocalDescription`)

### 4. Removed RSA Keypair Self-Test
- Removed self-test try-catch block from `generateKeypair` function
- Reason: RSA self-test is for dev library verification, should not run on every user registration

### 5. Deleted Backup Files
- Removed `dist/pchat_new.js` (old backup file)

### 6. Removed Inline Self-Test in Decrypt
- Removed RSA encrypt/decrypt self-test that ran on every decryption in `decryptWithPrivkey`
- Reason: Severely impacted message decryption performance
- Kept cross-end encryption test in `accept` (normal encryption verification flow)

### 7. Fixed Registration Page Error
- Line 1197 of `pchat.js`: `document.getElementById("delete-account-btn")` returned null
- Added null protection, skip if element doesn't exist

### 8. Modified Account Delete Button
- CSS: Size reduced from 28px to 20px, color deepened to `#d32f2f`
- JS: Confirmation dialog on click before actual deletion
- Fixed CSS specificity: Selector changed from `.account-delete-btn` to `.setup-box .account-delete-btn`

### 9. Added Delete Confirmation Modal (Password Required)
- `index.html`: Added `delete-confirm-modal` HTML
- `pchat.js`:
  - Added `_showDeleteConfirm()` to show modal
  - Added `_handleDeleteConfirm()` for password verification and deletion
  - Password verification: PBKDF2 derive key, try reading database, delete on success
  - Changed delete button click to call `_showDeleteConfirm` instead of `confirm()`
- `chat.css`: Added `danger-btn` red button style
- i18n: Added 10-language delete confirmation text

### 10. Login Page Button Changes
- `index.html`: "Receive Transfer" button changed to "New Account"
- `pchat.js`: Added `showNewAccount()` method

### 11. Login Page Layout + Version Number Mechanism
- `index.html`: Added `PCHAT_VERSION = '20260515.4'`, resource URLs updated to `?v=20260515h`
- `dist/chat.css`: Added version comment `v20260515.4`, new `.corner-panel` and `.corner-btn` styles
- `dist/pchat.js`: Added version log and CSS rule detection in `init()`

---
