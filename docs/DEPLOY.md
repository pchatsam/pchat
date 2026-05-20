# PChat Deployment Guide

> **Version**: `20260520.1`

PChat is a pure frontend static application, deployable on any static file HTTP server. Voice and camera features require HTTPS or localhost.

---

## Local Development

```bash
cd pchat
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## Nginx

```nginx
server {
    listen 80;
    server_name chat.example.com;
    root /var/www/pchat;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /dist/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

HTTPS (Let's Encrypt):
```bash
sudo certbot --nginx -d chat.example.com
```

---

## Caddy

```
chat.example.com {
    root * /var/www/pchat
    file_server
    encode gzip
    file_server {
        try_files {path} {path}/ /index.html
    }
    header /dist/ Cache-Control "public, max-age=604800, immutable"
    header /sw.js Cache-Control "no-cache"
}
```

Caddy handles HTTPS automatically.

---

## GitHub Pages

1. Push code to `main` branch
2. Repository Settings → Pages → Source: `main` branch, `/` (root)
3. Visit `https://username.github.io/repo-name/`

> **Note**: GitHub Pages uses HTTPS, but some CDN edge nodes may not support WebRTC TCP fallback.

---

## Vercel

```bash
npm i -g vercel
cd pchat
vercel

# vercel.json:
{
    "buildCommand": null,
    "outputDirectory": ".",
    "framework": null
}
```

---

## Cloudflare Pages

1. Create Pages project in Cloudflare Dashboard
2. Connect GitHub repository
3. Build settings: No build, root `.`
4. Deploy

Cloudflare provides free TURN relay via Zero Trust, solving symmetric NAT issues.

---

## Docker

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

`nginx.conf`:
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /dist/ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
docker build -t pchat .
docker run -d -p 8080:80 pchat
```

---

## Cache Strategy

| File | Cache Policy | Reason |
|------|-------------|--------|
| `/index.html` | `no-cache` | Contains version number, check for updates |
| `/dist/pchat.js?v=xxx` | `immutable` (7 days) | Version number controls cache invalidation |
| `/dist/*.min.js` | `immutable` (30 days) | Third-party libs rarely change |
| `/sw.js` | `no-cache` | Service Worker update mechanism |
| `/manifest.json` | `no-cache` | PWA install info |

Update resources by changing `?v=` version number in `index.html`.

---

## TURN Server (Optional)

When both peers are behind symmetric NAT or firewalls, TURN relay is needed:

| Provider | Free | Notes |
|----------|------|-------|
| Cloudflare Zero Trust | 10GB/month | Free, requires domain |
| Twilio Network Traversal | 10GB/month | Free trial |
| Google STUN + self-hosted TURN | - | coturn |
| PeerJS Public | Limited | Signaling only, not TURN |

Add TURN to PeerJS config (`dist/pchat.js` `PeerConn.init`):
```javascript
iceServers: [
    { urls: 'stun:stun.chat.bilibili.com:3478' },
    // Add TURN:
    {
        urls: 'turn:turn.example.com:3478',
        username: 'user',
        credential: 'pass'
    }
]
```

---

## Custom PeerJS Signaling Server

Default uses public signaling server `0.peerjs.com`. Self-host:

```bash
npm install peer
node -e "var PeerServer = require('peer'); PeerServer({ port: 9000, path: '/pchat' });"
```

Modify PeerJS config in `dist/pchat.js`:
```javascript
new Peer(myId, {
    host: 'your-server.com',
    port: 9000,
    path: '/pchat',
    config: { iceServers: [...] }
});
```

---

## Pre-Deployment Checklist

- [ ] HTTPS configured (required for voice/camera)
- [ ] All `dist/` files uploaded
- [ ] `manifest.json` icon paths correct
- [ ] `sw.js` `FILES` array paths correct
- [ ] Resource `?v=` version matches code
- [ ] Test: Register → Add friend → Message → Image → Voice call
- [ ] Mobile test: PWA install + portrait lock
