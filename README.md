# PChat — P2P Encrypted Chat

Pure frontend peer-to-peer messaging. No backend, no data center, no tracking. Messages flow directly between browsers via WebRTC with end-to-end encryption.

## Features

- **End-to-end encryption** — RSA-2048-OAEP for message encryption, AES-256 for local storage
- **Peer-to-peer** — data travels directly between browsers, no message relay server
- **Rich media** — text, images, files, and voice messages
- **Voice calls** — real-time WebRTC audio
- **Group chats** — client-side group model with per-member encryption
- **Multi-account** — save and switch between multiple accounts in one browser
- **Account transfer** — migrate your entire account (contacts, messages, groups) P2P to another device
- **QR code** — generate and scan QR codes to add friends
- **PWA** — installable on mobile with offline support
- **10 languages** — Chinese, English, Japanese, German, French, Spanish, Portuguese, Hebrew, Korean, Italian

## Quick Start

### Local Development

```bash
cd pchat
python3 -m http.server 8080
# Open http://localhost:8080
```

### Deploy to Production

See [docs/DEPLOY.md](docs/DEPLOY.md) for Nginx, Caddy, GitHub Pages, and Vercel setups.

## Architecture

```
Browser A                         Browser B
┌─────────────┐                 ┌─────────────┐
│   PChat UI  │                 │   PChat UI  │
│  + Crypto   │                 │  + Crypto   │
│   (RSA)     │                 │   (RSA)     │
└──────┬──────┘                 └──────┬──────┘
       │                               │
       │── WebRTC DataChannel ─────────│── P2P
       │   (RSA encrypted messages)    │
       │                               │
┌──────┴──────┐                 ┌──────┴──────┐
│  IndexedDB  │                 │  IndexedDB  │
│ (AES stored)│                 │ (AES stored)│
└─────────────┘                 └─────────────┘
              │
              ├── PeerJS signaling (0.peerjs.com)
              │
              └── STUN servers (ICE candidates)
```

- **Signaling**: PeerJS public server (0.peerjs.com) for connection setup only
- **Transport**: WebRTC DataChannel (encrypted via DTLS)
- **Encryption**: RSA-2048-OAEP-SHA256 per-message, AES-256-CBC for IndexedDB
- **Storage**: IndexedDB (one database per account), OPFS for large files

## Security

- Messages are end-to-end encrypted with RSA-2048 before transmission
- All local data is AES-256 encrypted in IndexedDB
- PBKDF2 key derivation (100,000 iterations)
- Per-contact RSA keypairs for isolation
- File integrity via SHA-256 checksums

See [docs/SECURITY.md](docs/SECURITY.md) for the full security model and threat analysis.

## Project Structure

```
├── index.html                  Main entry (UI + inline scripts)
├── manifest.json               PWA manifest
├── sw.js                       Service worker (offline cache)
├── logo.svg / icon-*.png       Branding assets
├── dist/
│   ├── pchat.js                Core application (~7KB minified)
│   ├── chat.css                Styles
│   ├── peerjs.min.js           PeerJS 1.5.4
│   ├── forge.min.js            RSA crypto (Forge 0.7.0)
│   ├── crypto-js.js            AES + PBKDF2 (CryptoJS)
│   ├── qrcode.min.js           QR code generation
│   └── jsqr.min.js             QR code scanning
└── docs/
    ├── pchat-project-doc.md    Full technical documentation
    ├── SECURITY.md             Security model and audit
    ├── DEPLOY.md               Deployment guide
    └── CHANGELOG.md            Version history
```

## Browser Support

- Edge 90+ — Full support (recommended for Windows)
- Chrome 90+ — Full support (Linux/macOS)
- Firefox 90+ — Full support
- Safari 15+ — Basic support
- Mobile Safari / Chrome — Supported (responsive)

> **Windows users**: Chrome on Windows may have ICE candidate issues causing P2P connection failures. **Microsoft Edge is recommended on Windows** — same Chromium engine, more reliable WebRTC networking on Windows.

Voice and camera features require HTTPS or localhost.

## License

Open source. See [LICENSE](LICENSE) if present, or contact the maintainer.

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).
