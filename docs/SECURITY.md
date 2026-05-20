# PChat Security Audit

> **Version**: `20260520.1` | **Audit Date**: 2026-05-20

---

## 1. Encryption Architecture

### 1.1 Message Transport Encryption

```
Sender                                Receiver
  │                                     │
  ├── Build message object              │
  ├── Lookup peer's public key          │
  ├── RSA-2048-OAEP encrypt             │
  │   └── >150B → chunked encryption    │
  │       └── 180 bytes per chunk       │
  ├── WebRTC DataChannel send ─────────►│  Receive ciphertext
  │   (DTLS transport encryption)       │
  │                                     ├── RSA private key decrypt
  │                                     ├── AES-256 encrypt
  │                                     └── Store in IndexedDB
```

| Layer | Algorithm | Description |
|-------|-----------|-------------|
| Application | RSA-2048-OAEP-SHA256 | Per-message encryption with recipient's public key |
| Transport | DTLS-SRTP | WebRTC layer encryption (not controllable) |
| Storage | AES-256-CBC | All IndexedDB records encrypted |

### 1.2 Key Derivation

```
Password + Random Salt → PBKDF2-SHA256 → AES-256 Key
                                  │
                                  ├── salt: Random 16-byte hex, generated at registration
                                  ├── Storage: IndexedDB user table (id: "_salt", plaintext)
                                  ├── iterations: 100,000
                                  ├── keySize: 256 bits
                                  └── hasher: SHA256

Old account compatibility: Accounts without "_salt" record fallback to fixed "pchat-salt"
```

### 1.3 Key Management

| Key | Generated | Purpose | Storage |
|-----|-----------|---------|---------|
| RSA-2048 keypair | Register/accept friend | Message encrypt/decrypt | Local: private(AES encrypted) + public(plaintext) |
| AES-256 key | Register/login (PBKDF2) | IndexedDB encryption | Cached in user record (cachedKey) |

Per-contact RSA keypair isolation model:
- Initiator: Generate keypair, send public key, save private key
- Receiver: Generate keypair, send public key, save private key
- Result: Both sides hold one keypair each, bidirectional encryption works

---

## 2. Security Features

### 2.1 Implemented

| Feature | Implementation |
|---------|----------------|
| End-to-end encryption | RSA-2048-OAEP per message |
| Long message support | Auto-chunk (180B/chunk) |
| Database encryption | AES-256-CBC all records |
| File encryption | AES-256 independent |
| File integrity | SHA-256 hash + length check |
| Key isolation | Per-account DB + per-account key |
| Public key fingerprint | MD5(publicKey PEM) first 8 chars |
| Duplicate login | Session Lock cross-tab exclusion |
| Delete verification | Password verification |
| Transport encryption | WebRTC DTLS |

### 2.2 Not Implemented

| Feature | Status | Risk |
|---------|--------|------|
| Forward secrecy (PFS) | None | Long-term key compromise decrypts history |
| Key rotation | None | Same as above |
| Voice message encryption | DTLS only | Voice files transmitted as base64 plaintext |
| File transfer encryption | DTLS only | File chunks transmitted in plaintext |
| Client verification | None | Cannot verify peer client integrity |

---

## 3. Threat Analysis

| Threat | Impact | Protection | Status |
|--------|--------|------------|--------|
| Signaling server eavesdropping | Only sees Peer IDs and ICE info | Messages RSA encrypted | Protected |
| Network man-in-the-middle | Cannot decrypt message content | DTLS + RSA application encryption | Protected |
| Device compromise | All data leaked | AES encrypted DB + password | Partial |
| Long-term key compromise | Historical messages decryptable | No forward secrecy | Unprotected |
| Voice message interception | Voice content obtainable | DTLS only | Partial |
| File transfer tampering | File corruption | SHA-256 check | Protected |
| Cross-tab attack | Session hijacking | Session Lock | Protected |
| Password brute force | DB decryption | PBKDF2 100K iterations | Protected |
| STUN info leakage | IP address exposed | Unavoidable (protocol limit) | Protocol limit |
| Downgrade attack | RSA-OAEP downgrade | Fixed algorithm | Protected |

---

## 4. Known Risks

### High Priority

| Risk | Description | Recommendation |
|------|-------------|----------------|
| No forward secrecy | Long-term RSA keypairs, not ephemeral | Introduce ECDH ephemeral key exchange |
| Voice/files DTLS only | Voice messages and file chunks lack application-layer encryption | Add RSA/AES encryption for voice/files |
| Fixed salt | ✅ Fixed | Per-account random salt in IndexedDB |
| Public signaling server | Uses 0.peerjs.com, ID exposed | Optional custom signaling server |

### Medium Priority

| Risk | Description | Recommendation |
|------|-------------|----------------|
| Group chat visibility | Owner can encrypt to each member individually, owner sees all messages | Client limitation (cannot solve at protocol level) |
| WebRTC IP leakage | IP address exposed via ICE to peer | Add TURN relay option |
| No key rotation | RSA keypairs unchanged long-term | Periodic rotation mechanism |

---

## 5. Cryptographic Parameters

| Parameter | Value | Assessment |
|-----------|-------|------------|
| RSA key length | 2048 bits | ✅ Meets current standards |
| RSA padding | OAEP-SHA256 | ✅ Recommended |
| AES mode | CBC | ⚠️ GCM is more secure |
| AES key length | 256 bits | ✅ Strong |
| PBKDF2 iterations | 100,000 | ✅ Reasonable |
| PBKDF2 salt | Random 16-byte hex per account | ✅ Fixed |
| Hash algorithm | SHA-256 | ✅ File integrity |
| Key derivation | PBKDF2-SHA256 | ✅ Standard, Argon2 is better |

---

## 6. Improvement Recommendations

| Priority | Item | Effort | Description |
|----------|------|--------|-------------|
| 🔴 High | Forward secrecy (PFS) | Large | Introduce Double Ratchet or ECDH ephemeral keys |
| 🔴 High | Voice message encryption | Medium | RSA encrypt voice base64 |
| 🟠 Medium | Custom signaling server | Medium | Support configuring own PeerServer |
| 🟠 Medium | AES-CBC → AES-GCM | Medium | Change CryptoJS or use Web Crypto API |
| 🟡 Low | PBKDF2 → Argon2 | Medium | Better GPU attack resistance |
| 🟢 Low | Log cleanup | Small | Remove 241 console.log statements |
