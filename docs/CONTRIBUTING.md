# Contributing

## Development Workflow

### 1. Local Development

```bash
cd pchat
python3 -m http.server 8080
# Visit http://localhost:8080
```

### 2. Code Structure

```
dist/
├── pchat.js         Core business logic (single file, 6914 lines)
├── chat.css         Stylesheet
├── peerjs.min.js    PeerJS 1.5.4
├── forge.min.js     RSA crypto (Forge 0.7.0)
├── crypto-js.js     AES crypto + PBKDF2
├── qrcode.min.js    QR code generation
└── jsqr.min.js      QR code scanning
```

The project uses a single-file architecture. All business logic is in `dist/pchat.js`. When modifying:
1. Edit `dist/pchat.js` directly
2. Update resource version `?v=xxx` in `index.html`
3. Update cache version in `sw.js`

### 3. Update Version Number

In `index.html`:
```html
<script src="./dist/pchat.js?v=20260520.1"></script>
```

And in `sw.js`:
```javascript
const CACHE = 'pchat-v20260520.1';
```

### 4. Commit Conventions

```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Refactoring
perf: Performance improvement
```

---

## Code Style

### JavaScript

- Use `var` (historical code style, keep consistent)
- 4-space indentation
- Named functions or object methods
- `async/await` for async operations

### CSS

- Use `--` CSS variables for theme colors
- Flexbox layout preferred
- Mobile-first (responsive)

### Internationalization

All user-visible text uses `_i18n.t(key)`. Add new translation keys:
```javascript
'pchat.category.keyName': {
    zh: '中文',
    en: 'English',
    ja: '日本語',
    de: 'Deutsch',
    fr: 'Français',
    es: 'Español',
    pt: 'Português',
    he: 'עברית',
    ko: '한국어',
    it: 'Italiano'
}
```

### Database

- Use the `DB` module wrapper for all IndexedDB operations
- Writes through `DB.put()` or `DB.putFile()`
- Reads through `DB.get()` or `DB.list()`
- Files through `DB.putFile()` with `aesKey` parameter

### Encryption

- Message encryption: `Crypto.encryptWithPubkey()` / `Crypto.decryptWithPrivkey()`
- Database encryption: `DB.put()` (auto AES)
- File encryption: `DB.putFile(fileId, data, mime, aesKey)`
- Never store user data in plaintext

---

## Pre-Submit Checklist

- [ ] Features tested (register/login/messages/files/calls)
- [ ] Mobile tested (Chrome DevTools responsive)
- [ ] No new console.log (or controlled by `PeerConn._debug`)
- [ ] i18n text added (10 languages)
- [ ] DB schema changes documented
- [ ] Resource version updated
- [ ] Service Worker cache version updated
