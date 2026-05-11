/* ============================================================
   MindRender PChat — Invite-link + PeerJS P2P messaging
   - PeerJS handles all signaling (replaces custom WS relay)
   - PeerJS CDN: <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
   - PeerJS public signaling server
   - DB: MindRenderPChat (separate from chat version)
   ============================================================
*/

// ==================== i18n ====================
var _i18n = _i18n || {};
_i18n.lang = (navigator.language || navigator.userLanguage || 'zh').substring(0,2);
if (!['zh','en'].includes(_i18n.lang)) _i18n.lang = 'en';
_i18n.t = function(key) {
    var d = _i18n.dict[key];
    if (!d) return key;
    return d[_i18n.lang] || d.en;
};
_i18n.dict = {
    'pchat.placeholder.nickname':        { zh: '输入你的昵称', en: 'Enter your nickname' },
    'pchat.placeholder.password':        { zh: '输入密码', en: 'Enter password' },
    'pchat.placeholder.addFriend':       { zh: '输入对方ID添加好友', en: 'Enter ID to add friend' },
    'pchat.placeholder.message':         { zh: '输入消息...', en: 'Type a message...' },
    'pchat.placeholder.groupName':       { zh: '群组名称', en: 'Group name' },
    'pchat.title.copyId':                { zh: '点击复制ID', en: 'Click to copy ID' },
    'pchat.title.inviteLink':            { zh: '邀请链接', en: 'Invite link' },
    'pchat.title.back':                  { zh: '返回', en: 'Back' },
    'pchat.title.voiceCall':             { zh: '语音通话', en: 'Voice call' },
    'pchat.title.hangup':                { zh: '挂断', en: 'Hang up' },
    'pchat.title.voiceMsg':              { zh: '语音消息', en: 'Voice message' },
    'pchat.title.image':                 { zh: '图片', en: 'Image' },
    'pchat.title.file':                  { zh: '文件', en: 'File' },
    'pchat.title.answerCall':            { zh: '接听', en: 'Answer' },
    'pchat.title.hangupCall':            { zh: '挂断通话', en: 'Hang up call' },
    'pchat.time.justNow':                { zh: '刚刚', en: 'just now' },
    'pchat.time.minutesAgo':             { zh: '分钟前', en: 'min ago' },
    'pchat.time.today':                  { zh: '今天', en: 'Today' },
    'pchat.register.inviteFrom':         { zh: '通过邀请注册（ID: {id}）', en: 'Register via invite (ID: {id})' },
    'pchat.loading.genKey':              { zh: '生成密钥...', en: 'Generating key...' },
    'pchat.loading.deriveVerifyKey':     { zh: '派生验证密钥...', en: 'Deriving verify key...' },
    'pchat.loading.deriveDataKey':       { zh: '派生数据密钥...', en: 'Deriving data key...' },
    'pchat.loading.saveUser':            { zh: '保存用户信息...', en: 'Saving user info...' },
    'pchat.loading.verify':              { zh: '验证中...', en: 'Verifying...' },
    'pchat.loading.readUser':            { zh: '读取用户数据...', en: 'Reading user data...' },
    'pchat.loading.useCachedKey':        { zh: '使用缓存密钥...', en: 'Using cached key...' },
    'pchat.loading.loadContacts':        { zh: '加载联系人...', en: 'Loading contacts...' },
    'pchat.loading.loadGroups':          { zh: '加载群组...', en: 'Loading groups...' },
    'pchat.loading.done':                { zh: '完成!', en: 'Done!' },
    'pchat.login.btn.loggingIn':         { zh: '正在登录...', en: 'Logging in...' },
    'pchat.alert.enterNickname':         { zh: '请输入昵称', en: 'Please enter a nickname' },
    'pchat.alert.enterPassword':         { zh: '请输入密码', en: 'Please enter password' },
    'pchat.alert.passwordError':         { zh: '密码错误', en: 'Wrong password' },
    'pchat.alert.deleteConfirm':         { zh: '是否删除所有数据？', en: 'Delete all data?' },
    'pchat.alert.deleteFail':            { zh: '删除失败', en: 'Delete failed' },
    'pchat.contact.confirmDelete':       { zh: '确认', en: 'Confirm' },
    'pchat.alert.idCopied':              { zh: 'ID 已复制: {id}', en: 'ID copied: {id}' },
    'pchat.alert.copyFail':              { zh: '复制失败', en: 'Copy failed' },
    'pchat.alert.inviteCopied':          { zh: '邀请链接已复制: {url}', en: 'Invite link copied: {url}' },
    'pchat.alert.inviteCopyManual':      { zh: '复制失败，请手动复制: {url}', en: 'Copy failed, copy manually: {url}' },
    'pchat.alert.enterGroupName':        { zh: '请输入群组名称', en: 'Please enter group name' },
    'pchat.alert.selectMember':          { zh: '请选择至少一个成员', en: 'Please select at least one member' },
    'pchat.alert.friendRejected':        { zh: '{name} 拒绝了好友请求', en: '{name} rejected friend request' },
    'pchat.alert.waitingReply':          { zh: '正在等待对方回复，请勿重复添加', en: 'Waiting for reply, please wait' },
    'pchat.alert.peerOffline':           { zh: '对方不在线，请稍后再试', en: 'Peer is offline, try again later' },
    'pchat.alert.enterPeerId':           { zh: '请输入对方ID', en: 'Please enter peer ID' },
    'pchat.alert.cannotAddSelf':         { zh: '不能添加自己', en: 'Cannot add yourself' },
    'pchat.msg.voice':                   { zh: '语音', en: 'Voice' },
    'pchat.file.incomplete':             { zh: '文件传输不完整（大小不匹配）', en: 'File transfer incomplete (size mismatch)' },
    'pchat.file.checksumFail':           { zh: '文件传输校验失败（内容损坏）', en: 'File checksum failed (data corrupted)' },
    'pchat.file.prefixImage':            { zh: '[图片]', en: '[Image]' },
    'pchat.file.prefixFile':             { zh: '[文件]', en: '[File]' },
    'pchat.alert.friendNotReady':        { zh: '请先完成好友添加后再发送消息', en: 'Please accept friend request first' },
    'pchat.alert.selectChat':            { zh: '请先选择一个聊天', en: 'Please select a chat' },
    'pchat.alert.micError':              { zh: '无法访问麦克风', en: 'Cannot access microphone' },
    'pchat.alert.peerOfflineSend':       { zh: '对方不在线，无法发送', en: 'Peer is offline, cannot send' },
    'pchat.status.online':               { zh: '在线', en: 'Online' },
    'pchat.status.peerJSOnline':         { zh: 'PeerJS 在线', en: 'PeerJS online' },
    'pchat.status.offline':              { zh: '离线', en: 'Offline' },
    'pchat.status.waitingKeyExchange':   { zh: '等待公钥交换', en: 'Waiting for key exchange' },
    'pchat.status.groupMembers':         { zh: '{n} 成员', en: '{n} members' },
    'pchat.msg.self':                    { zh: '我', en: 'Me' },
    'pchat.msg.selfPrefix':              { zh: '我：', en: 'Me:' },
    'pchat.file.unknown':                { zh: '未知文件', en: 'Unknown file' },
    'pchat.msg.deleteTitle':             { zh: '删除', en: 'Delete' },
    'pchat.call.incoming':               { zh: '来电中...', en: 'Incoming call...' },
    'pchat.call.waitingAnswer':          { zh: '等待接听...', en: 'Waiting for answer...' },
    'pchat.call.log':                    { zh: '📞 通话 {dur}', en: '📞 Call {dur}' },
    'pchat.duration.seconds':            { zh: '{n}秒', en: '{n}s' },
    'pchat.duration.minutes':            { zh: '{n}分钟', en: '{n}min' },
    'pchat.duration.minSec':             { zh: '{min}分{sec}秒', en: '{min}m{sec}s' },
    'pchat.alert.callError':             { zh: '无法发起通话', en: 'Cannot initiate call' },
};

// Set placeholders and titles based on language
_i18n.applyUI = function() {
    var t = _i18n.t;
    var s = function(id, attr, val) { var el = document.getElementById(id); if (el) el[attr] = val; };
    s('nickname-input', 'placeholder', t('pchat.placeholder.nickname'));
    s('password-input', 'placeholder', t('pchat.placeholder.password'));
    s('login-password-input', 'placeholder', t('pchat.placeholder.password'));
    s('add-friend-input', 'placeholder', t('pchat.placeholder.addFriend'));
    s('message-input', 'placeholder', t('pchat.placeholder.message'));
    s('room-name-input', 'placeholder', t('pchat.placeholder.groupName'));
    s('my-id-display', 'title', t('pchat.title.copyId'));
    s('call-back-btn', 'title', t('pchat.title.back'));
    s('call-btn', 'title', t('pchat.title.voiceCall'));
    s('call-status-hangup', 'title', t('pchat.title.hangup'));
    s('voice-btn', 'title', t('pchat.title.voiceMsg'));
    s('call-reject-btn', 'title', t('pchat.title.hangup'));
    s('call-answer-btn', 'title', t('pchat.title.answerCall'));
    s('call-hangup-btn', 'title', t('pchat.title.hangupCall'));
    // title for image/file buttons
    var tools = document.querySelector('.input-tools');
    if (tools && tools.children.length >= 3) {
        tools.children[1].title = t('pchat.title.image');
        tools.children[2].title = t('pchat.title.file');
    }
};

// Replace placeholders in translation strings
_i18n.fmt = function(key) {
    var str = _i18n.t(key);
    for (var i = 1; i < arguments.length; i += 2) {
        str = str.replace('{' + arguments[i] + '}', arguments[i+1] || '');
    }
    return str;
};

// ==================== Crypto (crypto-js + jsrsasign) ====================
const Crypto = {
    // 密钥指纹：公钥 PEM 的 MD5 前 8 位
    keyFingerprint(pem) {
        if (!pem) return 'null';
        const md5 = forge.md.md5.create().update(pem, 'utf8').digest().toHex();
        return md5.substring(0, 8);
    },

    generateKeypair(tag) {
        const rsa = forge.pki.rsa.generateKeyPair({bits: 2048, e: 0x10001});
        const kp = {
            publicKey: forge.pki.publicKeyToPem(rsa.publicKey),
            privateKey: forge.pki.privateKeyToPem(rsa.privateKey),
        };
        // Self-test: encrypt with pubkey, decrypt with privkey
        try {
            const test = 'forge-selftest';
            const pub = forge.pki.publicKeyFromPem(kp.publicKey);
            const enc = forge.util.encode64(pub.encrypt(test, 'RSA-OAEP', { md: forge.md.sha256.create() }));
            const priv = forge.pki.privateKeyFromPem(kp.privateKey);
            const dec = priv.decrypt(forge.util.decode64(enc), 'RSA-OAEP', { md: forge.md.sha256.create() });
            console.log(`[Crypto] Keypair self-test ${dec === test ? 'PASS' : 'FAIL'}, fp=${Crypto.keyFingerprint(kp.publicKey)}`);
        } catch(e) {
            console.warn('[Crypto] Keypair self-test FAILED:', e.message);
        }
        return kp;
    },

    async encryptWithPubkey(pubKeyPem, plaintext) {
        const fp = Crypto.keyFingerprint(pubKeyPem);
        console.log(`[Crypto] Encrypt with pubkey fp=${fp} pemPrefix=${pubKeyPem.substring(0, 26)}...`);
        const pub = forge.pki.publicKeyFromPem(pubKeyPem);
        // 将 UTF-16 字符串转为 byte string（支持中文）
        const byteString = forge.util.encodeUtf8(plaintext);
        const enc = pub.encrypt(byteString, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
        });
        return forge.util.encode64(enc);
    },

    async decryptWithPrivkey(privKeyPem, ciphertextB64) {
        const fp = Crypto.keyFingerprint(privKeyPem);
        console.log(`[Crypto] Decrypt with privkey fp=${fp} pemPrefix=${privKeyPem.substring(0, 30)}...`);
        const priv = forge.pki.privateKeyFromPem(privKeyPem);
        // 从私钥派生公钥，确认公私钥是否匹配
        const pubFromPriv = forge.pki.setRsaPublicKey(priv.n, priv.e);
        const pubPemFromPriv = forge.pki.publicKeyToPem(pubFromPriv);
        console.log(`[Crypto] Derived pubkey from this privkey fp=${Crypto.keyFingerprint(pubPemFromPriv)}`);
        
        // 自测：用这个私钥对应的公钥加密，再用这个私钥解密
        try {
            const pub2 = forge.pki.publicKeyFromPem(pubPemFromPriv);
            const testBs = forge.util.encodeUtf8('selftest');
            const testEnc = forge.util.encode64(pub2.encrypt(testBs, 'RSA-OAEP', { md: forge.md.sha256.create() }));
            const testDec = forge.util.decodeUtf8(priv.decrypt(forge.util.decode64(testEnc), 'RSA-OAEP', { md: forge.md.sha256.create() }));
            console.log(`[Crypto] Inline self-test: ${testDec === 'selftest' ? 'PASS' : 'FAIL'}`);
        } catch(e) {
            console.warn('[Crypto] Inline self-test FAILED:', e.message);
        }
        
        const enc = forge.util.decode64(ciphertextB64);
        const dec = priv.decrypt(enc, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
        });
        // 将 byte string 转回 UTF-16 字符串（支持中文）
        return forge.util.decodeUtf8(dec);
    },

    deriveAesKey(password, userId) {
        const salt = CryptoJS.enc.Utf8.parse("mindrender-chat-salt" + (userId || ""));
        return CryptoJS.PBKDF2(password, salt, {
            keySize: 256 / 32,
            iterations: 100000,
            hasher: CryptoJS.algo.SHA256
        }).toString(CryptoJS.enc.Hex);
    },

    async encryptAes(key, plaintext) {
        const encrypted = CryptoJS.AES.encrypt(plaintext, key);
        return encrypted.toString(); // OpenSSL 格式: "Salted__..."
    },

    async decryptAes(key, ciphertext) {
        const decrypted = CryptoJS.AES.decrypt(ciphertext, key);
        return decrypted.toString(CryptoJS.enc.Utf8);
    },

    generateId() {
        const c = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
        let id = "";
        for (let i = 0; i < 12; i++) id += c[Math.floor(Math.random() * c.length)];
        return id;
    },
};

// ==================== Base64 ====================
function uint8ToBase64(bytes) {
    const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let b = "";
    for (let i = 0; i < buf.length; i += 8192) {
        b += String.fromCharCode.apply(null, buf.subarray(i, Math.min(i + 8192, buf.length)));
    }
    return btoa(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToUint8(b64) {
    const raw = b64.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - raw.length % 4) % 4);
    const bin = atob(raw + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

// ==================== IndexedDB ====================
const DB = {
    NAME: "MindRenderPChat",
    VER: 1,
    db: null,

    async open() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.NAME, this.VER);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("user")) {
                    const s = db.createObjectStore("user", { keyPath: "id" });
                    s.createIndex("userId", "userId", { unique: true });
                }
                if (!db.objectStoreNames.contains("contacts")) {
                    const cs = db.createObjectStore("contacts", { keyPath: "contactId" });
                    cs.createIndex("userId", "userId", { unique: true });
                    cs.createIndex("nickname", "nickname", { unique: false });
                }
                if (!db.objectStoreNames.contains("messages")) {
                    const ms = db.createObjectStore("messages", { keyPath: "id" });
                    ms.createIndex("peerId", "peerId", { unique: false });
                    ms.createIndex("timestamp", "timestamp", { unique: false });
                }
                if (!db.objectStoreNames.contains("groups")) db.createObjectStore("groups", { keyPath: "id" });
            };
            req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
            req.onerror = () => reject(req.error);
        });
    },

    _store(name, mode) { return this.db.transaction(name, mode || "readonly").objectStore(name); },

    async put(name, item, key) {
        const enc = await Crypto.encryptAes(key, JSON.stringify(item));
        // console.log(`[DB.put] ${name} id=${item.id || item.contactId || item.userId} enc=`, enc);
        const tx = this.db.transaction(name, "readwrite");
        const store = tx.objectStore(name);
        const keyPath = store.keyPath;
        const record = { id: item.id || item.contactId || item.userId, encrypted: enc, ts: Date.now() };
        // Ensure the keyPath field exists on the record
        if (keyPath === "contactId") record.contactId = item.contactId;
        else if (keyPath === "id") record.id = item.id;
        else if (keyPath === "userId") record.userId = item.userId;
        store.put(record);
        return new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    },

    async get(name, id, key) {
        const req = this._store(name).get(id);
        return new Promise((resolve, reject) => {
            req.onsuccess = async () => {
                if (!req.result) return resolve(null);
                try { resolve(JSON.parse(await Crypto.decryptAes(key, req.result.encrypted))); }
                catch { resolve(req.result); }
            };
            req.onerror = () => reject(req.error);
        });
    },

    async list(name, key) {
        const req = this._store(name).getAll();
        return new Promise((resolve, reject) => {
            req.onsuccess = async () => {
                const results = [];
                for (const it of req.result) {
                    try {
                        results.push(JSON.parse(await Crypto.decryptAes(key, it.encrypted)));
                    } catch (e) {
                        // console.warn(`[DB] decrypt failed in ${name}:`, it.id, e.message);
                        // Fallback: construct minimal record from keyPath fields
                        const fallback = { ...it };
                        if (fallback.contactId && !fallback.userId) {
                            fallback.userId = fallback.contactId.replace("contact_", "");
                        }
                        results.push(fallback);
                    }
                }
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    },
};

// ==================== PeerConn (PeerJS wrapper) ====================
// Replaces WebRTC + WebSocket signaling with PeerJS-managed connections

const PeerConn = {
    peer: null,
    // peerId → { conn: DataConnection, myKey, peerKey, connected }
    peers: {},

    // Initialize PeerJS instance
    init(myId, callback) {
        console.log("[PeerConn] Connecting with user ID:", myId);
        this.peer = new Peer(myId);
        this.peer.on("open", (id) => {
            console.log("[PeerConn] Peer ID assigned:", id);
            if (id !== myId) {
                console.warn("[PeerConn] ID mismatch: requested", myId, "but got", id);
            }
            callback(id);
        });

        this.peer.on("connection", async (conn) => {
            console.log("[PeerConn] Incoming connection from", conn.peer);
            let myKey = null;
            const contact = ChatApp.contacts.find(c => c.userId === conn.peer);
            if (contact && contact.keypair) {
                myKey = contact.keypair;
                console.log(`[PeerConn] Receiver loaded keypair for ${conn.peer}, fp=${Crypto.keyFingerprint(myKey.publicKey)}`);
            }
            const state = { conn, myKey, peerKey: null, connected: false };
            this.peers[conn.peer] = state;
            this._bind(conn, conn.peer, false);
        });

        this.peer.on("call", (call) => {
            console.log("[PeerConn] Incoming call from", call.peer);
            ChatApp._onIncomingPeerCall(call);
        });

        this.peer.on("error", (err) => {
            console.error("[PeerConn] Error:", err.type, err.message);
        });

        this.peer.on("disconnected", () => {
            console.log("[PeerConn] Disconnected from server, reconnecting...");
            this.peer.reconnect();
        });
    },

    // Connect to a peer via data connection
    async connect(peerId) {
        if (this.peers[peerId] && this.peers[peerId].conn && this.peers[peerId].conn.open) {
            console.log(`[PeerConn] Already connected to ${peerId}`);
            return this.peers[peerId];
        }

        let myKey;
        const contact = ChatApp.contacts.find(c => c.userId === peerId);
        if (contact && contact.keypair) {
            myKey = contact.keypair;
        } else {
            myKey = await Crypto.generateKeypair();
        }
        const conn = this.peer.connect(peerId, {
            reliable: true,
            metadata: { nickname: ChatApp.my.nickname },
        });

        const state = { conn, myKey, peerKey: null, connected: false };
        this.peers[peerId] = state;
        this._bind(conn, peerId, true);

        return state;
    },

    // Bind event handlers to data connection
    _bind(conn, peerId, initiator) {
        conn.on("open", async () => {
            console.log(`[PeerConn] Connected to ${peerId}`);
            const state = this.peers[peerId];
            if (!state) return;
            state.connected = true;
            ChatApp._renderContacts();

            if (initiator) {
                const contact = ChatApp.contacts.find(c => c.userId === peerId);
                console.log(`[PeerConn] Initiator to ${peerId}, contact found: ${!!contact}, has publicKey: ${contact && !!contact.publicKey}`);
                if (contact && contact.keypair) {
                    state.myKey = contact.keypair;
                }
                if (!state.myKey) {
                    state.myKey = await Crypto.generateKeypair();
                }
                // 已有公钥的联系人（重连），设置 peerKey 用于加密
                if (contact && contact.publicKey) {
                    state.peerKey = contact.publicKey;
                }
                // For new contacts, _requestFriend sends the add message
            } else {
                // 接收方：从 contact 加载密钥对和对方公钥
                const contact = ChatApp.contacts.find(c => c.userId === peerId);
                console.log(`[PeerConn] Receiver to ${peerId}, contact found: ${!!contact}, has publicKey: ${contact && !!contact.publicKey}`);
                if (contact && contact.keypair) {
                    state.myKey = contact.keypair;
                }
                if (!state.myKey) {
                    state.myKey = await Crypto.generateKeypair();
                    // 保存新生成的密钥对到 contact
                    const contact2 = ChatApp.contacts.find(c => c.userId === peerId);
                    if (contact2 && !contact2.keypair) {
                        contact2.keypair = state.myKey;
                        ChatApp.saveContact(contact2);
                    }
                }
                // 如果已有公钥（已完成的联系人），设置 peerKey 用于加密
                if (contact && contact.publicKey) {
                    state.peerKey = contact.publicKey;
                }
            }

            this.flushPending(peerId);
        });

        conn.on("data", async (data) => {
            try {
                if (!data || !data.type) return;
                console.log(`[PeerConn] ${peerId} data type=${data.type}`);
                const state = this.peers[peerId];
                if (data.type === "add") {
                    ChatApp._onAddRequest(peerId, data);
                } else if (data.type === "accept") {
                    // Peer accepted our friend request
                    if (state) state.peerKey = data.key;
                    const userId = data.id || peerId;
                    ChatApp._onAcceptReceived(userId, data.key, data.nickname);
                } else if (data.type === "reject") {
                    ChatApp._onPeerReject(peerId);
                } else if (data.type === "chat") {
                    // Only process chat if handshake is complete (contact has publicKey)
                    const contact = ChatApp.contacts.find(c => c.userId === peerId);
                    if (!contact || !contact.publicKey) {
                        console.log(`[PeerConn] Ignoring chat from ${peerId} - handshake not complete`);
                        return;
                    }
                    let content = data.content;
                    if (data.encrypted && state && state.myKey) {
                        console.log(`[PeerConn] Decrypting from ${peerId}, myKey pubFp=${Crypto.keyFingerprint(state.myKey.publicKey)}`);
                        console.log(`[PeerConn] Decrypting from ${peerId}, myKey privFp=${Crypto.keyFingerprint(state.myKey.privateKey)}`);


                        try { content = await Crypto.decryptWithPrivkey(state.myKey.privateKey, data.content); }
                        catch(e) { console.warn(`[PeerConn] RSA decrypt failed for ${peerId}, falling back to plaintext:`, e.message, '| privKeyLen:', state.myKey.privateKey.length, '| dataLen:', data.content.length); }
                    } else {
                        console.log(`[PeerConn] Not decrypting from ${peerId}, encrypted=${data.encrypted}, hasMyKey=${!!(state && state.myKey)}`);
                    }
                    ChatApp.onChatMsg(peerId, content, data.ts);
                    // Auto-send read receipt
                    if (state && state.conn && state.conn.open && data.id) {
                        state.conn.send({ type: "receipt", msgId: data.id });
                    }
                } else if (data.type === "voice") {
                    const contact = ChatApp.contacts.find(c => c.userId === peerId);
                    if (!contact || !contact.publicKey) return;
                    ChatApp.onVoiceMsg(peerId, data.content, data.ts, data.duration);
                } else if (data.type === "file-header") {
                    const contact = ChatApp.contacts.find(c => c.userId === peerId);
                    if (!contact || !contact.publicKey) return;
                    ChatApp._onFileHeader(peerId, data);
                } else if (data.type === "file-chunk") {
                    ChatApp._onFileChunk(data);
                } else if (data.type === "file-footer") {
                    ChatApp._onFileFooter(peerId, data);
                } else if (data.type === "receipt") {
                    // Received read receipt for a message
                    ChatApp._onReceiptReceived(peerId, data.msgId);
                }
            } catch (err) { console.error("[PeerConn] parse:", err); }
        });

        conn.on("close", () => {
            console.log(`[PeerConn] Disconnected from ${peerId}`);
            const state = this.peers[peerId];
            if (state) state.connected = false;
            ChatApp._renderContacts();
        });

        conn.on("error", (err) => {
            console.error(`[PeerConn] Connection error (${peerId}):`, err);
        });
    },

    // Send chat message to peer
    async send(peerId, content, msgId) {
        const s = this.peers[peerId];
        if (!s || !s.conn || !s.conn.open) {
            console.log(`[PeerConn] Cannot send to ${peerId}, conn.open=${s ? s.conn?.open : false}`);
            return false;
        }
        console.log(`[PeerConn] Sending chat to ${peerId}: ${content.substring(0, 50)}`);
        // 公钥交换完成后用 RSA 加密
        let sendContent = content;
        if (s.peerKey) {
            console.log(`[PeerConn] Encrypting for ${peerId}, peerKey fp=${Crypto.keyFingerprint(s.peerKey)}`);
            try { sendContent = await Crypto.encryptWithPubkey(s.peerKey, content); }
            catch(e) { console.warn('[PeerConn] Encrypt failed:', e.message); }
        } else {
            console.log(`[PeerConn] No peerKey for ${peerId}, sending plaintext`);
        }
        s.conn.send({ type: "chat", id: msgId, content: sendContent, ts: Date.now(), encrypted: sendContent !== content });
        return true;
    },

    // Flush pending messages
    async flushPending(peerId) {
        const msgs = await ChatApp.getMessages(peerId);
        const pending = msgs.filter(m => m.direction === "sent" && !m.sent);
        const state = this.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;
        for (const m of pending) {
            let sendContent = m.content;
            if (state.peerKey) {
                try { sendContent = await Crypto.encryptWithPubkey(state.peerKey, m.content); }
                catch(e) { console.warn('[PeerConn] Flush encrypt failed:', e.message); }
            }
            state.conn.send({ type: "chat", id: m.id, content: sendContent, ts: m.ts, encrypted: sendContent !== m.content });
            m.sent = true;
            ChatApp.DB_put_msg(m);
        }
    },

    // Send voice message
    sendVoice(peerId, base64data, ts, duration) {
        const s = this.peers[peerId];
        if (!s || !s.conn || !s.conn.open) return false;
        s.conn.send({ type: "voice", content: base64data, ts, duration });
        return true;
    },

    // Send file header
    sendFileHeader(conn, fileId, name, mime, size, totalChunks, isImage) {
        conn.send({ type: "file-header", fileId, name, mime, size, totalChunks, isImage });
    },

    // Send file chunk
    sendFileChunk(conn, fileId, index, data) {
        conn.send({ type: "file-chunk", fileId, index, data });
    },

    // Send file footer
    sendFileFooter(conn, fileId) {
        conn.send({ type: "file-footer", fileId });
    },

    // Initiate voice call via PeerJS
    async call(peerId) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const call = this.peer.call(peerId, stream);
            ChatApp._onOutgoingPeerCall(call, peerId);
            return call;
        } catch (err) {
            console.error("[PeerConn] Call error:", err);
            ChatApp.showAlert(_i18n.t('pchat.alert.callError'));
            return null;
        }
    },

    // Close peer connection
    close() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
    },
};

// ==================== ChatApp ====================
const ChatApp = {
    // Current session
    my: { id: null, nickname: null, password: null, aesKey: null },

    // Runtime state
    contacts: [],
    unreadCount: {},
    groups: [],
    activeConv: null,
    invite: null,

    // File transfer state
    fileTransfer: {
        pending: {},
    },
    call: {
        active: false,
        peerId: null,
        localStream: null,
        mediaConnection: null,
        audio: null,
        startTime: null,
        timerInterval: null,
        state: "idle", // "waiting" | "connected"
    },
    voice: { recording: false, mediaStream: null, recorder: null, chunks: [], recordingStart: null },
    currentMessages: [],
    incomingCallPeerId: null,
    imageViewer: {
        url: null,
        zoom: 1,
        panX: 0,
        panY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        zoomTimer: null,
    },

    // ---- Popup helpers ----
    _pendingFriendRequest: null,

    showAlert(text) {
        document.getElementById('alert-text').textContent = text;
        this._show('alert-modal');
    },

    _closeAlert() {
        this._hide('alert-modal');
    },

    _closeAlertModal() {
        this._hide('alert-modal');
    },

    _hideFriendRequestModal() {
        const card = document.getElementById('friend-request-card');
        if (card) card.style.display = 'none';
    },

    _showFriendRequestCard(peerId, nickname) {
        const card = document.getElementById('friend-request-card');
        const nickEl = document.getElementById('friend-request-nick');
        const idEl = document.getElementById('friend-request-id');
        if (card) {
            nickEl.textContent = nickname;
            idEl.textContent = peerId;
            card.style.display = 'block';
        }
    },


    async _acceptFriendRequest() {
        const pending = this._pendingFriendRequest;
        if (!pending) return;
        const { peerId, nickname, data } = pending;
        const state = PeerConn.peers[peerId];
        if (!state || !state.conn || !state.conn.open) {
            console.log('[PeerConn] Cannot accept, no connection');
            return;
        }

        // 生成/复用密钥对
        if (!state.myKey) state.myKey = await Crypto.generateKeypair();
        console.log(`[Accept] myKey fp=${Crypto.keyFingerprint(state.myKey.publicKey)}, peerKey fp=${Crypto.keyFingerprint(data.publicKey)}`);
        // 设置对方的公钥（用于发送消息时加密）
        state.peerKey = data.publicKey;

        // 保存联系人（对方向我发送的公钥）
        let contact = this.contacts.find(c => c.userId === peerId);
        if (!contact) {
            contact = {
                contactId: "contact_" + peerId,
                userId: peerId,
                nickname,
                publicKey: data.publicKey,
                keypair: state.myKey,
                added: Date.now(),
                requestedKey: false,
            };
            this.contacts.push(contact);
        } else {
            contact.publicKey = data.publicKey;
            contact.nickname = nickname;
            contact.keypair = state.myKey;
        }
        await this.saveContact(contact);

        // Cross-test: encrypt with peer's public key, verify output
        try {
            const testEnc = await Crypto.encryptWithPubkey(data.publicKey, 'cross-test');
            console.log(`[Accept] Cross-encrypt OK, outputLen=${testEnc.length}`);
        } catch(e) {
            console.warn(`[Accept] Cross-encrypt FAILED:`, e.message);
        }
        // 发送 accept 响应（明文：自己的 ID、昵称、公钥）
        state.conn.send({
            type: "accept",
            id: this.my.id,
            key: state.myKey.publicKey,
            nickname: this.my.nickname,
        });

        // 隐藏卡片
        const card = document.getElementById('friend-request-card');
        if (card) card.style.display = 'none';
        this._pendingFriendRequest = null;
        this._renderContacts();
    },

    _rejectFriendRequest() {
        const pending = this._pendingFriendRequest;
        if (!pending) return;
        const state = PeerConn.peers[pending.peerId];
        if (state && state.conn && state.conn.open) {
            state.conn.send({ type: "reject" });
        }
        const card = document.getElementById('friend-request-card');
        if (card) card.style.display = 'none';
        this._pendingFriendRequest = null;
        this._renderContacts();
    },

    // 收到好友请求（add 消息）
    async _onAddRequest(peerId, data) {
        const nickname = data.nickname || peerId;
        const state = PeerConn.peers[peerId];
        if (!state) {
            console.log(`[PeerConn] No state for ${peerId}, skipping`);
            return;
        }

        // 如果已经是好友（有公钥），忽略重复请求
        const existing = this.contacts.find(c => c.userId === peerId);
        if (existing && existing.publicKey) {
            console.log(`[PeerConn] Already friends with ${peerId}, ignoring add`);
            return;
        }

        // 新联系人，显示接受卡片
        console.log(`[PeerConn] Add request from ${peerId} (${nickname}), publicKey present: ${!!data.publicKey}`);
        this._pendingFriendRequest = { peerId, nickname, data: { publicKey: data.publicKey } };

        // 显示内联卡片
        const card = document.getElementById('friend-request-card');
        if (card) {
            document.getElementById('friend-request-nick').textContent = nickname;
            document.getElementById('friend-request-id').textContent = peerId;
            card.style.display = 'block';
        }
    },


    // ---- Init ----
    // 格式化时间
    _formatTime(ts) {
        const now = Date.now();
        const diff = now - ts;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const year = 365 * day;
        
        if (diff < hour) {
            const mins = Math.floor(diff / minute);
            if (mins === 0) return _i18n.t('pchat.time.justNow');
            return mins + _i18n.t('pchat.time.minutesAgo');
        } else if (diff < day) {
            const h = new Date(ts).toLocaleTimeString("zh-CN", {hour:'2-digit', minute:'2-digit'});
            return _i18n.t('pchat.time.today') + h;
        } else if (diff < year) {
            const d = new Date(ts).toLocaleDateString("zh-CN", {month:'numeric', day:'numeric'});
            const t = new Date(ts).toLocaleTimeString("zh-CN", {hour:'2-digit', minute:'2-digit'});
            return d + t;
        } else {
            const y = new Date(ts).toLocaleDateString("zh-CN", {year:'numeric', month:'numeric', day:'numeric'});
            const t = new Date(ts).toLocaleTimeString("zh-CN", {hour:'2-digit', minute:'2-digit'});
            return y + t;
        }
    },

    async init() {
        _i18n.applyUI();
        await DB.open();

        // Parse invite link from URL hash — now just contains inviter ID
        const hash = location.hash.slice(1);
        let pendingInviteId = null;
        if (hash.startsWith("invite-")) {
            pendingInviteId = hash.slice(7);
        }

        // Check if user already has an account
        const ex = await DB.get("user", "current", null).catch(() => null);

        this._show("setup-panel");
        if (ex) {
            // Existing user — show login form
            if (pendingInviteId) {
                // Save invite ID for post-login connection
                this.pendingInviteId = pendingInviteId;
                localStorage.removeItem("mr_invite");
                const inviteEl = document.getElementById("invite-from");
                inviteEl.textContent = _i18n.fmt('pchat.register.inviteFrom', 'id', pendingInviteId);
                inviteEl.style.display = "block";
            }
            this._show("login-form");
            document.getElementById("delete-account-btn").style.display = "block";
        } else {
            // No account — show register form
            if (pendingInviteId) {
                this.invite = { inviterId: pendingInviteId };
                localStorage.setItem("mr_invite", JSON.stringify(this.invite));
                this._show("invite-info");
                document.getElementById("invite-from").textContent = _i18n.fmt('pchat.register.inviteFrom', 'id', pendingInviteId);
            } else {
                this._show("invite-info");
            }
            this._hide("login-form");
        }

        this._bindEvents();

        // 非 HTTPS 环境下浏览器不允许访问麦克风，隐藏语音相关按钮
        const isSecure = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
        if (!isSecure) {
            const callBtn = document.getElementById("call-btn");
            const voiceBtn = document.getElementById("voice-btn");
            if (callBtn) callBtn.style.display = "none";
            if (voiceBtn) voiceBtn.style.display = "none";
        }
    },

    _show(id) {
        const el = document.getElementById(id);
        if (id === "main-panel" || id === "create-room-modal") {
            el.style.display = "flex";
        } else {
            el.style.display = "block";
        }
    },
    _hide(id) { document.getElementById(id).style.display = "none"; },

    // Loading 进度条
    _showLoading(progress, text) {
        const el = document.getElementById("login-loading");
        const bar = document.getElementById("login-loading-bar");
        const txt = document.getElementById("login-loading-text");
        el.style.display = "block";
        bar.style.width = Math.min(100, Math.round(progress)) + "%";
        if (text) txt.textContent = text;
    },
    _hideLoading() {
        document.getElementById("login-loading").style.display = "none";
        document.getElementById("login-loading-bar").style.width = "0%";
    },

    // ---- Register (standalone or from invite link) ----
    // ---- Register (standalone or from invite link) ----
    async registerUser() {
        const nick = document.getElementById("nickname-input").value.trim();
        const pw = document.getElementById("password-input").value;
        if (!nick) { this.showAlert(_i18n.t('pchat.alert.enterNickname')); return; }
        if (!pw) { this.showAlert(_i18n.t('pchat.alert.enterPassword')); return; }


        this._showLoading(10, _i18n.t('pchat.loading.genKey'));

        this.my.id = Crypto.generateId();
        this.my.nickname = nick;
        this._showLoading(30, _i18n.t('pchat.loading.deriveVerifyKey'));
        const verifyKey = await Crypto.deriveAesKey(pw);
        this._showLoading(60, _i18n.t('pchat.loading.deriveDataKey'));
        this.my.aesKey = await Crypto.deriveAesKey(pw, this.my.id);
        this.my.password = pw;

        this._showLoading(80, _i18n.t('pchat.loading.saveUser'));
        await DB.put("user", { id: "current", userId: this.my.id, nickname: nick, ts: Date.now(), cachedKey: this.my.aesKey }, verifyKey);

        // 保存邀请人 ID（PeerJS 初始化后发送好友请求）
        const inv = JSON.parse(localStorage.getItem("mr_invite") || "null");
        if (inv && inv.inviterId) this.pendingInviteId = inv.inviterId;
        localStorage.removeItem("mr_invite");
        location.hash = "";

        this._hideLoading();

        this._hide("setup-panel");
        this._hide("invite-info");
        document.getElementById("delete-account-btn").style.display = "none";
        this._show("main-panel");

        document.getElementById("my-nickname").textContent = nick;
        document.getElementById("my-id-display").textContent = this.my.id;

        this._initPeer();
        this._renderContacts();
        this._renderGroups();
    },

    // ---- Login (existing user) ----
    async loginUser() {
        const pw = document.getElementById("login-password-input").value;
        if (!pw) { this.showAlert(_i18n.t('pchat.alert.enterPassword')); return; }

        const btn = document.getElementById("login-btn");
        const origText = btn ? btn.textContent : _i18n.t('pchat.login.btn.loggingIn');
        if (btn) { btn.textContent = _i18n.t('pchat.login.btn.loggingIn'); btn.disabled = true; }
        this._showLoading(5, _i18n.t('pchat.loading.verify'));

        try {
            // 先尝试解密验证密码（用通用盐）
            this._showLoading(10, _i18n.t('pchat.loading.deriveVerifyKey'));
            const testKey = await Crypto.deriveAesKey(pw);

            this._showLoading(30, _i18n.t('pchat.loading.readUser'));
            const user = await DB.get("user", "current", testKey);
            if (!user || !user.userId) { this._hideLoading(); if (btn) { btn.textContent = origText; btn.disabled = false; } this.showAlert(_i18n.t('pchat.alert.passwordError')); return; }

            // 用真实 userId 重新派生 AES 密钥
            this.my.id = user.userId;
            this.my.nickname = user.nickname;

            // 优先使用缓存的 aesKey
            if (user.cachedKey) {
                this._showLoading(70, _i18n.t('pchat.loading.useCachedKey'));
                this.my.aesKey = user.cachedKey;
            } else {
                this._showLoading(50, _i18n.t('pchat.loading.deriveDataKey'));
                this.my.aesKey = await Crypto.deriveAesKey(pw, this.my.id);
                // 回写缓存
                await DB.put("user", { id: "current", userId: this.my.id, nickname: this.my.nickname, ts: Date.now(), cachedKey: this.my.aesKey }, testKey);
            }
            this.my.password = pw;

            this._showLoading(85, _i18n.t('pchat.loading.loadContacts'));
            this.contacts = await DB.list("contacts", this.my.aesKey);
            console.log(`[Login] Loaded ${this.contacts.length} contacts:`, this.contacts.map(c => ({ id: c.userId, nick: c.nickname, pk: !!c.publicKey })));

            this._showLoading(95, _i18n.t('pchat.loading.loadGroups'));
            this.groups = await DB.list("groups", this.my.aesKey);

            this._showLoading(100, _i18n.t('pchat.loading.done'));

            this._hideLoading();
            if (btn) { btn.textContent = origText; btn.disabled = false; }

            this._hide("setup-panel");
            this._show("main-panel");

            document.getElementById("delete-account-btn").style.display = "none";

            document.getElementById("my-nickname").textContent = this.my.nickname;
            document.getElementById("my-id-display").textContent = this.my.id;

            this._initPeer();
            this._renderContacts();
            this._renderGroups();
        } catch (e) {
            this._hideLoading();
            if (btn) { btn.textContent = origText; btn.disabled = false; }
            this.showAlert(_i18n.t('pchat.alert.passwordError'));
        }
    },

    // ---- Delete account (clear all data) ----
    async deleteAccount() {
        if (!confirm(_i18n.t('pchat.alert.deleteConfirm'))) return;
        try {
            // Close existing DB handle first
            if (DB.db) DB.db.close();
            // Delete the entire IndexedDB database
            await new Promise((resolve, reject) => {
                const req = indexedDB.deleteDatabase(DB.NAME);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });
            localStorage.removeItem("mr_invite");
            location.hash = "";
            location.reload();
        } catch (e) {
            this.showAlert(_i18n.t('pchat.alert.deleteFail'));
        }
    },

    // ---- Contact delete with confirm ----
    _deleteTimer: null,
    showConfirmDelete(userId, btn) {
        if (this._deleteTimer) { clearTimeout(this._deleteTimer); this._deleteTimer = null; }
        btn.textContent = _i18n.t('pchat.contact.confirmDelete');
        btn.classList.add("confirm");
        const origBtn = btn;
        this._deleteTimer = setTimeout(() => {
            origBtn.textContent = "×";
            origBtn.classList.remove("confirm");
            this._deleteTimer = null;
        }, 5000);
        // Replace click handler: on "确认" click, actually delete
        btn.onclick = (e) => {
            e.stopPropagation();
            clearTimeout(this._deleteTimer);
            this._deleteTimer = null;
            this.removeContact(userId);
        };
    },
    async removeContact(userId) {
        // Remove from IndexedDB
        try { await DB.db.transaction("contacts", "readwrite").objectStore("contacts").delete("contact_" + userId).promise; } catch {}
        // Remove from memory
        this.contacts = this.contacts.filter(c => c.userId !== userId);
        // Remove messages to this peer
        try {
            const tx = DB.db.transaction("messages", "readwrite");
            const store = tx.objectStore("messages");
            const cursor = store.openCursor();
            await new Promise((resolve, reject) => {
                cursor.onsuccess = async (e) => {
                    const cur = e.target.result;
                    if (cur) {
                        if (cur.value.encrypted) {
                            try {
                                const parsed = JSON.parse(await Crypto.decryptAes(this.my.aesKey, cur.value.encrypted));
                                if (parsed.peerId === userId) {
                                    store.delete(cur.value.id);
                                }
                            } catch {}
                        }
                        cur.continue();
                    } else {
                        resolve();
                    }
                };
                cursor.onerror = () => reject(cursor.error);
            });
        } catch {}
        // Close peer connection
        if (PeerConn.peers[userId]) {
            const state = PeerConn.peers[userId];
            if (state.conn) { try { state.conn.close(); } catch {} }
        }
        delete PeerConn.peers[userId];
        // If currently viewing this conversation, close it
        if (this.activeChatId === userId) this.closeChatView();
        this._renderContacts();
    },

    // ---- PeerJS initialization ----
    _initPeer() {
        PeerConn.init(this.my.id, async (id) => {
            console.log("[PeerJS] Initialized with ID:", id);
            // Auto-connect to all contacts (only those with publicKey = handshake complete)
            for (const c of this.contacts) {
                if (c.publicKey) {
                    console.log(`[PeerJS] Auto-connect to ${c.userId} (${c.nickname})`);
                    await PeerConn.connect(c.userId);
                }
            }
            // If there's a pending invite, initiate friend request
            if (this.pendingInviteId) {
                console.log("[Init] Pending invite to", this.pendingInviteId);
                this._requestFriend(this.pendingInviteId);
                this.pendingInviteId = null;
            }
        });
    },

    // send() is used for signaling messages (now via PeerJS metadata or not needed)
    // Kept for backward compat but no-op for signaling
    send(msg) {
        // In PeerJS mode, signaling is handled internally
        // This method is kept for call-hangup notifications etc.
        console.log(`[PeerJS] send() called for type=${msg.type} (no-op in PeerJS mode)`);
    },

    // ---- Helper: get peer nickname from contacts ----
    _getPeerNickname(peerId) {
        const c = this.contacts.find(x => x.userId === peerId);
        return c?.nickname || peerId;
    },

    // ---- Copy my ID to clipboard ----
    copyMyId() {
        navigator.clipboard.writeText(this.my.id).then(() => {
            ChatApp.showAlert(_i18n.fmt('pchat.alert.idCopied', 'id', this.my.id));
        }).catch(() => ChatApp.showAlert(_i18n.t('pchat.alert.copyFail')));
    },

    // ---- Generate invite link ----
    generateInviteLink() {
        const url = location.origin + location.pathname + "#invite-" + this.my.id;
        // 尝试 navigator.clipboard（需要安全上下文），失败则用 fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                ChatApp.showAlert(_i18n.fmt('pchat.alert.inviteCopied', 'url', url));
            }).catch(() => this._copyFallback(url));
        } else {
            this._copyFallback(url);
        }
    },

    _copyFallback(url) {
        // 非安全上下文下的复制 fallback
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            ChatApp.showAlert(_i18n.fmt('pchat.alert.inviteCopied', 'url', url));
        } catch {
            ChatApp.showAlert(_i18n.fmt('pchat.alert.inviteCopyManual', 'url', url));
        }
        document.body.removeChild(ta);
    },

    // ---- Create group modal ----
    showCreateGroupModal() {
        this._show("create-room-modal");
        const list = document.getElementById("member-checklist");
        list.innerHTML = "";
        for (const c of this.contacts) {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${c.userId}"> ${c.nickname || c.userId}`;
            list.appendChild(label);
        }
    },

    closeModals() {
        this._hide("create-room-modal");
    },

    // ---- Tab switching ----
    switchTab(tab) {
        const ct = document.getElementById("contact-tab");
        const gt = document.getElementById("group-tab");
        const tcb = document.getElementById("tab-contacts");
        const tgb = document.getElementById("tab-groups");

        if (tab === "contacts") {
            ct.classList.add("active");
            gt.classList.remove("active");
            tcb.style.borderBottomColor = "#4caf50";
            tgb.style.borderBottomColor = "transparent";
        } else {
            gt.classList.add("active");
            ct.classList.remove("active");
            tgb.style.borderBottomColor = "#4caf50";
            tcb.style.borderBottomColor = "transparent";
        }
    },

    async createGroup() {
        const name = document.getElementById("room-name-input").value.trim();
        if (!name) { this.showAlert(_i18n.t('pchat.alert.enterGroupName')); return; }

        const checkboxes = document.querySelectorAll("#member-checklist input:checked");
        const memberIds = Array.from(checkboxes).map(cb => cb.value);
        if (memberIds.length === 0) { this.showAlert(_i18n.t('pchat.alert.selectMember')); return; }

        const group = {
            id: "group_" + Date.now(),
            name,
            memberIds,
            created: Date.now(),
        };
        this.groups.push(group);
        await DB.put("groups", group, this.my.aesKey);

        this.closeModals();
        this._renderGroups();
        document.getElementById("room-name-input").value = "";
    },

    // ---- Received peer's public key ----
    async _onAcceptReceived(peerId, peerPubkey, peerNickname) {
        console.log(`[AcceptReceived] peerId=${peerId}, peerPubkey fp=${Crypto.keyFingerprint(peerPubkey)}`);
        let contact = this.contacts.find(c => c.userId === peerId);

        if (!contact) {
            contact = {
                contactId: "contact_" + peerId,
                userId: peerId,
                nickname: peerNickname || peerId,
                publicKey: peerPubkey,
                keypair: await Crypto.generateKeypair(),
                added: Date.now(),
                requestedKey: false,
            };
            this.contacts.push(contact);
        } else {
            contact.publicKey = peerPubkey;
            if (peerNickname) contact.nickname = peerNickname;
        }

        await this.saveContact(contact);
        // Debug: verify saved publicKey matches received
        const saved = await DB.get("contacts", "contact_" + peerId, this.my.aesKey);
        console.log(`[AcceptReceived] Saved contact publicKey fp=${Crypto.keyFingerprint(saved?.publicKey)}, matches received: ${Crypto.keyFingerprint(saved?.publicKey) === Crypto.keyFingerprint(peerPubkey)}`);
        this._renderContacts();

        // If we have an active chat with this contact, reload messages
        if (this.activeConv && this.activeConv.id === peerId) {
            this._loadMessages(peerId);
        }
    },

    // ---- Peer rejected friend request ----
    _onPeerReject(peerId) {
        this.showAlert(_i18n.fmt('pchat.alert.friendRejected', 'name', this._getPeerNickname(peerId)));
        // Remove the temporary contact if it exists and has no publicKey
        const idx = this.contacts.findIndex(c => c.userId === peerId);
        if (idx >= 0 && !this.contacts[idx].publicKey) {
            this.contacts.splice(idx, 1);
            DB.db.transaction("contacts", "readwrite").objectStore("contacts").delete("contact_" + peerId);
        }
        this._renderContacts();
    },

    // ---- Request friend: connect and send add ----
    async _requestFriend(id) {
        // Check if already a contact with completed handshake
        const existing = this.contacts.find(c => c.userId === id);
        if (existing && existing.publicKey) { return; }
        if (existing && !existing.publicKey) { this.showAlert(_i18n.t('pchat.alert.waitingReply')); return; }

        // Generate keypair for this peer
        const myKey = await Crypto.generateKeypair();
        console.log(`[Request] Generated keypair for ${id}, fp=${Crypto.keyFingerprint(myKey.publicKey)}`);
        const contact = {
            contactId: "contact_" + id,
            userId: id,
            nickname: id,
            publicKey: null,
            keypair: myKey,
            added: Date.now(),
            requestedKey: true,
        };
        this.contacts.push(contact);
        await this.saveContact(contact);
        this._renderContacts();


        // Connect with PeerJS
        const state = await PeerConn.connect(id);
        state.myKey = myKey;

        // Wait for connection with 15s timeout
        const connected = await new Promise((resolve) => {
            if (state.conn.open) { resolve(true); return; }
            const timer = setTimeout(() => { resolve(false); }, 15000);
            state.conn.on("open", () => { clearTimeout(timer); resolve(true); });
            state.conn.on("error", () => { clearTimeout(timer); resolve(false); });
        });

        if (!connected) {
            this.showAlert(_i18n.t('pchat.alert.peerOffline'));
            const idx = this.contacts.findIndex(c => c.userId === id);
            if (idx >= 0) this.contacts.splice(idx, 1);
            DB.db.transaction("contacts", "readwrite").objectStore("contacts").delete("contact_" + id);
            if (state.conn) { try { state.conn.close(); } catch {} }
            delete PeerConn.peers[id];
            this._renderContacts();
            return;
        }

        // Send add message (plaintext: own ID, nickname, publicKey)
        state.conn.send({
            type: "add",
            id: this.my.id,
            nickname: this.my.nickname,
            publicKey: myKey.publicKey,
        });
    },

    // ---- Add friend by ID ----
    async addFriendById() {
        const id = document.getElementById("add-friend-input").value.trim();
        if (!id) { this.showAlert(_i18n.t('pchat.alert.enterPeerId')); return; }
        if (id === this.my.id) { this.showAlert(_i18n.t('pchat.alert.cannotAddSelf')); return; }

        if (this.contacts.find(c => c.userId === id && c.publicKey)) {
            return;
        }

        this._requestFriend(id);
        document.getElementById("add-friend-input").value = "";
    },

    // ---- Save contact to IndexedDB ----
    async saveContact(contact) {
        console.log("[SaveContact]", contact.contactId, contact.userId, "publicKey:", !!contact.publicKey);
        await DB.put("contacts", contact, this.my.aesKey);
    },

    // ---- Incoming chat message from data channel ----
    async onChatMsg(peerId, content, ts) {
        if (!content || typeof content === 'string' && !content.trim()) return;
        const now = ts || Date.now();
        const id = `msg_${peerId}_${now}_${Date.now()}`;
        const msg = { id, peerId, content, ts: now, direction: "received", fromId: peerId };
        DB.put("messages", msg, this.my.aesKey).then(() => {
            if (this.activeConv && this.activeConv.id === peerId) {
                this._appendMsg(msg);
            }
        });
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = { content, ts: now, fromId: peerId };
            this.saveContact(contact);
        }
        if (!(this.activeConv && this.activeConv.id === peerId)) {
            this.unreadCount[peerId] = (this.unreadCount[peerId] || 0) + 1;
        }
        this._renderContacts();
    },

    // ---- Handle incoming receipt ----
    async _onReceiptReceived(peerId, msgId) {
        console.log(`[Receipt] Got receipt from ${peerId} for msg ${msgId}`);
        // Find and update the message in DB
        const allMsgs = await DB.list("messages", this.my.aesKey);
        for (const m of allMsgs) {
            if (m.id === msgId && m.direction === "sent") {
                if (!m.receipts) m.receipts = {};
                m.receipts[peerId] = Date.now();
                await DB.put("messages", m, this.my.aesKey);
                // Also update in-memory cache if exists
                const msgs = (this._chatMessages || new Map()).get(peerId) || [];
                const cached = msgs.find(x => x.id === msgId);
                if (cached) {
                    cached.receipts = m.receipts;
                }
                break;
            }
        }
        // Re-render current conversation if it's the relevant one
        if (this.activeConv) {
            // Check if any group contains this peerId, or if it's a 1v1 chat
            const isRelevant = this.activeConv.id === peerId ||
                (this.activeConv.type === "group" && this.groups.find(g => g.id === this.activeConv.id && g.memberIds.includes(peerId)));
            if (isRelevant) {
                this._renderMessages(this.activeConv.id);
            }
        }
    },

    // ---- Render messages with receipt colors ----
    async _renderMessages(convId) {
        const msgs = await DB.list("messages", this.my.aesKey);
        const conv = msgs.filter(m => m.peerId === convId).sort((a, b) => a.ts - b.ts);
        const container = document.getElementById("message-list");
        container.innerHTML = "";
        for (const m of conv) this._appendMsg(m);
        this._scroll();
    },

    // ---- Voice Message Receive ----
    onVoiceMsg(peerId, base64data, ts, duration) {
        const now = ts || Date.now();
        const id = `msg_${peerId}_${now}_voice_${Date.now()}`;
        const msg = { id, peerId, content: base64data, ts: now, direction: "received", fromId: peerId, type: "voice", duration };
        DB.put("messages", msg, this.my.aesKey).then(() => {
            if (this.activeConv && this.activeConv.id === peerId) {
                this._appendMsg(msg);
            }
        });
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = { content: _i18n.t('pchat.msg.voice'), ts: now, fromId: peerId };
            this.saveContact(contact);
        }
        if (!(this.activeConv && this.activeConv.id === peerId)) {
            this.unreadCount[peerId] = (this.unreadCount[peerId] || 0) + 1;
        }
        this._renderContacts();
    },

    // ---- File receive: header ----
    _onFileHeader(peerId, d) {
        const ft = this.fileTransfer;
        ft.pending[d.fileId] = {
            peerId,
            parts: new Array(d.totalChunks),
            chunkCount: 0,
            totalChunks: d.totalChunks,
            name: d.name,
            mime: d.mime,
            size: d.size,
            isImage: d.isImage,
            expectedBase64Len: d.base64Len || 0,
            expectedHash: d.hash || "",
        };
        console.log(`[File] Header received: ${d.name} (${d.size}B, ${d.totalChunks} chunks, hash=${d.hash ? d.hash.slice(0,8)+'...' : 'none'})`);
    },

    // ---- File receive: chunk ----
    _onFileChunk(d) {
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (!info) return;
        if (info.parts[d.index]) {
            // Duplicate chunk received, skip
            return;
        }
        info.parts[d.index] = d.data;
        info.chunkCount++;
    },

    // ---- File receive: footer (all chunks assembled) ----
    async _onFileFooter(peerId, d) {
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (!info || info.chunkCount < info.totalChunks) {
            console.warn("[File] Footer before all chunks, missing chunks");
            return;
        }

        console.log(`[File] Footer received for ${info.name}, assembling...`);
        const fullBase64 = info.parts.join('');

        // Integrity check: base64 length
        if (info.expectedBase64Len && fullBase64.length !== info.expectedBase64Len) {
            console.error(`[File] Length mismatch: expected ${info.expectedBase64Len}, got ${fullBase64.length}`);
            delete ft.pending[d.fileId];
            ChatApp.showAlert(_i18n.t('pchat.file.incomplete'));
            return;
        }

        // Integrity check: hash
        if (info.expectedHash) {
            try {
                const computedHash = ChatApp._hashBase64(fullBase64);
                if (computedHash !== info.expectedHash) {
                    console.error(`[File] Hash mismatch`);
                    delete ft.pending[d.fileId];
                    ChatApp.showAlert(_i18n.t('pchat.file.checksumFail'));
                    return;
                }
            } catch (e) {
                console.warn("[File] Hash check failed:", e);
            }
        }

        delete ft.pending[d.fileId];

        const now = Date.now();
        const id = `msg_${peerId}_${now}_${Date.now()}`;
        const msg = {
            id,
            peerId,
            ts: now,
            direction: "received",
            fromId: peerId,
            type: info.isImage ? "image" : "file",
            fileName: info.name,
            mimeType: info.mime,
            fileSize: info.size,
            fileData: fullBase64,
        };

        // Store in DB
        await DB.put("messages", msg, this.my.aesKey);

        if (this.activeConv && this.activeConv.id === peerId) {
            this._appendMsg(msg);
        }

        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = {
                content: info.isImage ? (_i18n.t('pchat.file.prefixImage') + ' ' + info.name) : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name),
                ts: now,
                fromId: peerId,
            };
            this.saveContact(contact);
        }
        if (!(this.activeConv && this.activeConv.id === peerId)) {
            this.unreadCount[peerId] = (this.unreadCount[peerId] || 0) + 1;
        }
        this._renderContacts();
    },

    // ---- Send message ----
    async sendMessage() {
        const input = document.getElementById("message-input");
        const content = input.value.trim();
        if (!content || !this.activeConv) return;

        const now = Date.now();
        const { type, id: convId } = this.activeConv;

        if (type === "group") {
            // 群聊：给群内每个成员单独发送
            const group = this.groups.find(g => g.id === convId);
            if (!group) return;
            // 用同一条 msgId 关联所有成员的发送记录
            const msgId = `msg_${convId}_${now}`;
            // 先建一条汇总消息，含初始 receipts
            const receipts = {};
            for (const memberId of group.memberIds) {
                const contact = this.contacts.find(c => c.userId === memberId);
                if (contact && contact.publicKey) {
                    const sent = await PeerConn.send(memberId, content, msgId);
                    receipts[memberId] = null;
                    // 更新每个联系人的最后消息
                    contact.lastMessage = { content, ts: now, fromId: this.my.id };
                    this.saveContact(contact);
                }
            }
            // 存一条汇总消息
            const msg = { id: msgId, peerId: convId, content, ts: now, direction: "sent", fromId: this.my.id, receipts };
            await DB.put("messages", msg, this.my.aesKey);
            this._appendMsg(msg);
            this._renderContacts();
            input.value = "";
        } else {
            // 单聊：检查握手是否完成
            const contact = this.contacts.find(c => c.userId === convId);
            if (!contact || !contact.publicKey) {
                this.showAlert(_i18n.t('pchat.alert.friendNotReady'));
                return;
            }
            const id = `msg_${convId}_${now}`;
            const sent = await PeerConn.send(convId, content, id);
            const msg = { id, peerId: convId, content, ts: now, direction: "sent", fromId: this.my.id, sent: sent };
            DB.put("messages", msg, this.my.aesKey).then(() => {
                this._appendMsg(msg);
            });

            if (contact) {
                contact.lastMessage = { content, ts: now, fromId: this.my.id };
                this.saveContact(contact);
            }
            this._renderContacts();

            input.value = "";
        }
    },

    // ---- Send image file ----
    async sendImage(event) {
        const file = event.target.files[0];
        if (!file || !this.activeConv) return;
        event.target.value = "";
        await this._sendFileInternal(file);
    },

    // ---- Send file ----
    async sendFile(event) {
        const file = event.target.files[0];
        if (!file || !this.activeConv) return;
        event.target.value = "";
        await this._sendFileInternal(file);
    },

    // ---- Voice Message Recording ----
    startRecording() {
        const v = this.voice;
        if (v.recording) return this.stopRecording();
        
        if (!this.activeConv || !this.activeConv.id) {
            this.showAlert(_i18n.t('pchat.alert.selectChat'));
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            v.mediaStream = stream;
            v.recorder = new MediaRecorder(stream);
            v.chunks = [];
            
            v.recorder.ondataavailable = (e) => {
                if (e.data.size > 0) v.chunks.push(e.data);
            };
            
            v.recorder.onstop = () => {
                const blob = new Blob(v.chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result.split(',')[1];
                    const duration = v.recordingStart ? (Date.now() - v.recordingStart) / 1000 : 0;
                    this.sendVoice(base64, duration);
                };
                reader.readAsDataURL(blob);
                v.mediaStream.getTracks().forEach(t => t.stop());
            };
            
            v.recorder.start();
            v.recording = true;
            v.recordingStart = Date.now();
            
            const btn = document.getElementById("voice-btn");
            if (btn) {
                btn.textContent = "⏹️";
                btn.classList.add("recording");
            }
        }).catch(err => {
            console.error("[Voice] Mic error:", err);
            this.showAlert(_i18n.t('pchat.alert.micError'));
        });
    },

    stopRecording() {
        const v = this.voice;
        if (!v.recording) return;
        v.recorder.stop();
        v.recording = false;
        
        const btn = document.getElementById("voice-btn");
        if (btn) {
            btn.textContent = "🎙️";
            btn.classList.remove("recording");
        }
    },

    async sendVoice(base64data, duration) {
        const peerId = this.activeConv.id;
        const now = Date.now();
        const id = `msg_${peerId}_${now}_voice_${Date.now()}`;
        const msg = { id, peerId, content: base64data, ts: now, direction: "sent", fromId: this.my.id, type: "voice", duration };
        
        await DB.put("messages", msg, this.my.aesKey);
        if (this.activeConv && this.activeConv.id === peerId) {
            this._appendMsg(msg);
        }
        
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = { content: _i18n.t('pchat.msg.voice'), ts: now, fromId: this.my.id };
            this.saveContact(contact);
        }
        
        const peer = PeerConn.peers[peerId];
        if (peer && peer.conn && peer.conn.open) {
            peer.conn.send({ type: "voice", content: base64data, ts: now, duration });
            msg.sent = true;
            DB.put("messages", msg, this.my.aesKey);
        }
        
        this._renderContacts();
    },

    // ---- Voice Playback ----
    playVoice(msgId, element) {
        // Stop any currently playing voice
        const current = document.querySelector('.voice-msg.playing');
        if (current) current.classList.remove('playing');
        
        const msg = this.currentMessages.find(m => m.id === msgId);
        if (!msg || !msg.content) return;
        
        const byteString = atob(msg.content);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([arrayBuffer], { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        element.classList.add('playing');
        
        audio.onended = () => {
            element.classList.remove('playing');
            URL.revokeObjectURL(url);
        };
        
        audio.onerror = () => {
            element.classList.remove('playing');
        };
        
        audio.play().catch(err => {
            console.error("[Voice] Play error:", err);
            element.classList.remove('playing');
        });
    },

    // Compute SHA-256 hash of base64 data (works in any context)
    _hashBase64(base64Str) {
        const bytes = atob(base64Str);
        let wordArray = CryptoJS.lib.WordArray.create(bytes.length);
        for (let i = 0; i < bytes.length; i++) wordArray.words[i >>> 2] |= bytes.charCodeAt(i) << (24 - (i & 3) * 8);
        return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
    },
    async _sendFileInternal(file) {
        const peerId = this.activeConv.id;
        const state = PeerConn.peers[peerId];
        if (!state || !state.conn || !state.conn.open) {
            this.showAlert(_i18n.t('pchat.alert.peerOfflineSend'));
            return;
        }

        const isImage = file.type.startsWith("image/");
        const chunkSize = 16384; // 16KB chunks
        const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

        // Read file as base64
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target.result.split(',')[1]; // strip data: prefix
                const conn = state.conn;
                const totalChunks = Math.ceil(base64.length / chunkSize);

                console.log(`[File] Sending ${file.name} (${file.size}B base64=${base64.length}, ${totalChunks} chunks)`);

                // Also display in sender's chat window immediately
                const now = Date.now();
                const id = `msg_${peerId}_${now}`;
                const sentMsg = {
                    id,
                    peerId,
                    ts: now,
                    direction: "sent",
                    fromId: this.my.id,
                    type: isImage ? "image" : "file",
                    fileName: file.name,
                    mimeType: file.type,
                    fileSize: file.size,
                    fileData: base64,
                };

                // Save to DB and display
                await DB.put("messages", sentMsg, this.my.aesKey);
                this._appendMsg(sentMsg);

                // Update last message in sidebar
                const contact = this.contacts.find(c => c.userId === peerId);
                if (contact) {
                    contact.lastMessage = {
                        content: isImage ? (_i18n.t('pchat.file.prefixImage') + ' ' + file.name) : (_i18n.t('pchat.file.prefixFile') + ' ' + file.name),
                        ts: now,
                        fromId: this.my.id,
                    };
                    this.saveContact(contact);
                }
                this._renderContacts();

                // Compute integrity hash (SHA-256 of raw bytes)
                const fileHash = this._hashBase64(base64);

                // Send header
                conn.send({
                    type: "file-header",
                    fileId,
                    name: file.name,
                    mime: file.type,
                    size: file.size,
                    totalChunks,
                    isImage,
                    base64Len: base64.length,
                    hash: fileHash,
                });

                // Send chunks
                for (let i = 0; i < totalChunks; i++) {
                    const start = i * chunkSize;
                    const end = Math.min(start + chunkSize, base64.length);
                    conn.send({
                        type: "file-chunk",
                        fileId,
                        index: i,
                        data: base64.slice(start, end),
                    });
                }

                // Send footer
                conn.send({
                    type: "file-footer",
                    fileId,
                });

                console.log(`[File] Done sending ${file.name}`);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    },

    // ---- Open conversation ----
    openConversation(type, id) {
        console.log(`[Chat] Opening conversation: ${type} ${id}`);
        this.activeConv = { type, id };
        document.getElementById("chat-placeholder").style.display = "none";
        document.getElementById("chat-active").style.display = "flex";
        // Hide sidebar on mobile when opening chat
        if (window.innerWidth <= 768) {
            document.getElementById("sidebar").classList.add("hidden");
        }

        // Mobile: hide sidebar when opening chat
        if (window.innerWidth <= 768) {
            document.getElementById("sidebar").classList.add("hidden");
        }

        const title = document.getElementById("chat-title");
        const status = document.getElementById("chat-type");
        if (type === "contact") {
            const c = this.contacts.find(x => x.userId === id);
            if (c) {
                title.textContent = c.nickname || c.userId;
                const peer = PeerConn.peers[id];
                const connOpen = peer && peer.conn && peer.conn.open;
                status.textContent = connOpen ? _i18n.t('pchat.status.peerJSOnline') : _i18n.t('pchat.status.offline');
            }
        } else if (type === "group") {
            const g = this.groups.find(x => x.id === id);
            if (g) {
                title.textContent = g.name;
                status.textContent = _i18n.fmt('pchat.status.groupMembers', 'n', g.memberIds.length);
            }
        }
        this._loadMessages(id).catch(err => console.error(`[Chat] _loadMessages error:`, err));
        this._highlight(id);
        this.unreadCount[id] = 0;
        this._renderContacts();
    },

    // ---- Close chat view (mobile back) ----
    closeChatView() {
        document.getElementById("sidebar").classList.remove("hidden");
        document.getElementById("chat-active").style.display = "none";
        document.getElementById("chat-placeholder").style.display = "flex";
        this.activeConv = null;
    },

    _highlight(id) {
        document.querySelectorAll(".list-item").forEach(el => el.classList.remove("active"));
        const el = document.querySelector(`[data-id="${id}"]`);
        if (el) el.classList.add("active");
    },

    async _loadMessages(peerId) {
        console.log(`[Chat] Loading messages for ${peerId}`);
        const msgs = await DB.list("messages", this.my.aesKey);
        console.log(`[Chat] Total messages: ${msgs.length}`);
        const conv = msgs.filter(m => m.peerId === peerId).sort((a, b) => a.ts - b.ts);
        console.log(`[Chat] Messages for ${peerId}: ${conv.length}`);
        this.currentMessages = conv;
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact && conv.length > 0) {
            const last = conv[conv.length - 1];
            contact.lastMessage = { content: last.content, ts: last.ts, fromId: last.fromId };
        }
        const list = document.getElementById("message-list");
        if (!list) { console.error("[Chat] message-list element not found"); return; }
        list.innerHTML = "";
        list.onclick = (e) => {
            const img = e.target.closest('.img-thumb');
            if (img) {
                const msgEl = img.closest('.message-row');
                const msgId = msgEl?.dataset?.msgId || img.dataset.msgId;
                this._openImageFromDb(msgId, img.dataset.mime);
                return;
            }
            const fileAtt = e.target.closest('.file-attachment');
            if (fileAtt) {
                const msgEl = fileAtt.closest('.message-row');
                const msgId = msgEl?.dataset?.msgId;
                if (msgId) this.downloadAttachment(msgId);
            }
        };
        for (const m of conv) this._appendMsg(m);
        this._scroll();
    },

    _appendMsg(msg) {
        const list = document.getElementById("message-list");
        const wrapper = document.createElement("div");
        wrapper.className = "message-row";
        wrapper.dataset.msgId = msg.id;
        const sent = msg.fromId === this.my.id;
        const contact = this.contacts.find(c => c.userId === msg.peerId);
        const senderName = sent ? _i18n.t('pchat.msg.self') : (contact ? (contact.nickname || msg.fromId) : msg.fromId);
        const senderClass = sent ? "sender-avatar self" : "sender-avatar";
        let bubbleClass = sent ? "sent" : "received";
        const time = this._formatTime(msg.ts);
        let innerContent = "";
        if (msg.type === "image" && msg.fileData) {
            const src = `data:${msg.mimeType || 'image/png'};base64,${msg.fileData}`;
            innerContent = `<img class="img-thumb" src="${src}" data-msg-id="${msg.id}" data-mime="${msg.mimeType || 'image/png'}">`;
        } else if (msg.type === "file" && msg.fileData) {
            const icon = this._getFileIcon(msg.fileName);
            const sizeStr = this._formatFileSize(msg.fileSize);
            innerContent = `<div class="file-attachment" onclick="ChatApp.downloadAttachment('${msg.id}')"><div class="file-icon">${icon}</div><div class="file-info"><div class="file-name">${(msg.fileName || _i18n.t('pchat.file.unknown')).replace(/</g,'&lt;')}</div><div class="file-size">${sizeStr}</div></div></div>`;
        } else if (msg.type === "voice" && msg.content) {
            const dur = msg.duration || 0;
            const durStr = dur > 0 ? `${Math.floor(dur)}s` : _i18n.t('pchat.msg.voice');
            innerContent = `<div class="voice-msg" onclick="ChatApp.playVoice('${msg.id}', this)"><span class="voice-icon">🔊</span><span class="voice-duration">${durStr}</span></div>`;
        } else {
            const text = (msg.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            innerContent = `<div class="content">${text}</div>`;
        }
        const deleteBtn = `<button class="msg-delete-btn" onclick="ChatApp.deleteMessage('${msg.id}', event)" title="_i18n.t('pchat.msg.deleteTitle')>✕</button>`;
        
        // Receipt status for sent messages
        let receiptHtml = "";
        if (sent) {
            const hasReceipt = msg.receipts && Object.keys(msg.receipts).length > 0;
            if (this.activeConv && this.activeConv.type === "group") {
                // Group chat: show member receipt list
                const group = this.groups.find(g => g.id === this.activeConv.id);
                if (group) {
                    let memberList = "";
                    for (const mid of group.memberIds) {
                        const c = this.contacts.find(x => x.userId === mid);
                        const nick = c ? (c.nickname || mid) : mid;
                        const got = msg.receipts && msg.receipts[mid];
                        const cls = got ? "receipt-yes" : "receipt-no";
                        memberList += `<span class="${cls}">${nick}</span>`;
                    }
                    receiptHtml = `<div class="receipt-list">${memberList}</div>`;
                }
            }
            // Add received class for 1v1 color change
            if (hasReceipt) {
                bubbleClass += " received";
            }
        }
        
        wrapper.innerHTML = `<div class="${senderClass}">${senderName}</div><div class="message ${bubbleClass}">${deleteBtn}${innerContent}${receiptHtml}<div class="time">${time}</div></div>`;
        list.appendChild(wrapper);
        this._scroll();
    },

    _getFileIcon(fileName) {
        if (!fileName) return "📄";
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            'pdf': '📕', 'doc': '📘', 'docx': '📘', 'xls': '📗', 'xlsx': '📗',
            'ppt': '📙', 'pptx': '📙', 'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
            'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵', 'flac': '🎵', 'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬',
            'txt': '📝', 'log': '📝', 'js': '💻', 'py': '💻', 'java': '💻', 'cpp': '💻', 'c': '💻', 'go': '💻', 'rs': '💻',
            'json': '📋', 'xml': '📋', 'yaml': '📋', 'yml': '📋',
        };
        return icons[ext] || '📄';
    },

    _formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0, size = bytes;
        while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
        return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    },

    async _openImageFromDb(msgId, mime) {
        const msg = await DB.get("messages", msgId, this.my.aesKey);
        if (!msg || !msg.fileData) return;
        const src = `data:${mime || msg.mimeType || 'image/png'};base64,${msg.fileData}`;
        this.openImageViewer(src);
    },

    async downloadAttachment(msgId) {
        const msg = await DB.get("messages", msgId, this.my.aesKey);
        if (!msg || !msg.fileData) return;
        const blob = await this._base64ToBlob(msg.fileData, msg.mimeType || 'application/octet-stream');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = msg.fileName || 'download'; a.click();
        URL.revokeObjectURL(url);
    },

    _base64ToBlob(base64, mime) {
        const bytes = atob(base64);
        const chunks = [];
        for (let i = 0; i < bytes.length; i += 8192) {
            chunks.push(new Uint8Array(bytes.slice(i, i + 8192).split('').map(c => c.charCodeAt(0))));
        }
        return new Blob(chunks, { type: mime });
    },

    // ==================== Voice Call (PeerJS MediaConnection) ====================
    
    _onOutgoingPeerCall(call, peerId) {
        const c = this.call;
        c.active = true;
        c.peerId = peerId;
        c.mediaConnection = call;
        c.state = "waiting"; // 等待接听
        c.startTime = null;
        
        call.on("stream", (remoteStream) => {
            if (c.audio) { c.audio.pause(); c.audio.srcObject = null; }
            c.audio = new Audio(); c.audio.srcObject = remoteStream; c.audio.play();
            
            // 收到对方音频，说明已接通
            if (c.state === "waiting") {
                c.state = "connected";
                c.startTime = Date.now();
                this._showCallInHeader();
                // 启动计时器（更新 header 中的计时器）
                c.timerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - c.startTime) / 1000);
                    const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
                    const sec = (elapsed % 60).toString().padStart(2, '0');
                    const el = document.getElementById("call-status-timer");
                    if (el) el.textContent = `${min}:${sec}`;
                }, 1000);
            }
        });
        call.on("close", () => { this._onCallEnd(); });
        call.on("error", (err) => { console.error("[Call] error:", err); this.hangupCall(); });
        
        const contact = this.contacts.find(ct => ct.userId === peerId);
        const name = contact ? (contact.nickname || peerId) : peerId;
        const modal = document.getElementById("call-modal");
        if (modal) {
            document.getElementById("call-name").textContent = name;
            modal.style.display = "flex";
        }
        
        // 显示等待接听状态
        this._updateCallModal("waiting");
        
        const btn = document.getElementById("call-btn");
        if (btn) { btn.textContent = "📞"; btn.classList.add("active"); }
    },

    _onIncomingPeerCall(call) {
        const peerId = call.peer;
        console.log("[Call] Incoming call from", peerId);
        const contact = this.contacts.find(c => c.userId === peerId);
        const name = contact ? (contact.nickname || peerId) : peerId;
        this.incomingCallPeerId = peerId;
        this._pendingCall = call;
        this._showIncomingCallModal(name);
    },

    // 显示来电 modal（接收方）
    _showIncomingCallModal(name) {
        const modal = document.getElementById("call-modal");
        if (!modal) return;
        document.getElementById("call-name").textContent = name;
        document.getElementById('call-status').textContent = _i18n.t('pchat.call.incoming');
        document.getElementById("call-timer").textContent = "";
        modal.style.display = "flex";
        
        // 接收方：显示接听 + 挂断按钮
        const actionsEl = document.getElementById("call-actions");
        const hangupBtnEl = document.getElementById("call-hangup-btn");
        if (actionsEl) actionsEl.style.display = "flex";
        if (hangupBtnEl) hangupBtnEl.style.display = "none";
    },
    
    // 更新 modal 按钮状态（等待接听时）
    _updateCallModal(state) {
        const statusEl = document.getElementById("call-status");
        const actionsEl = document.getElementById("call-actions");
        const hangupBtnEl = document.getElementById("call-hangup-btn");
        
        if (state === "waiting") {
            if (statusEl) statusEl.textContent = _i18n.t('pchat.call.waitingAnswer');
            if (actionsEl) actionsEl.style.display = "none";
            if (hangupBtnEl) hangupBtnEl.style.display = "block";
        }
    },
    
    // 通话接通：隐藏 modal，显示 header 下的通话状态栏
    _showCallInHeader() {
        this._hideCallModal();
        
        const callBtn = document.getElementById("call-btn");
        const statusBar = document.getElementById("call-status-bar");
        console.log("[Call] _showCallInHeader: callBtn=", !!callBtn, "statusBar=", !!statusBar);
        if (callBtn) callBtn.style.display = "none";
        if (statusBar) statusBar.style.display = "flex";
        else console.error("[Call] call-status-bar not found!");
    },
    
    // 通话结束：隐藏通话状态栏，恢复拨打按钮
    _hideCallInHeader() {
        const callBtn = document.getElementById("call-btn");
        const statusBar = document.getElementById("call-status-bar");
        if (callBtn) callBtn.style.display = "";
        if (statusBar) statusBar.style.display = "none";
        
        const timerEl = document.getElementById("call-status-timer");
        if (timerEl) timerEl.textContent = "";
    },
    
    // 更新 header 中计时器
    _updateCallHeaderTimer() {
        const timerEl = document.getElementById("call-status-timer");
        if (!timerEl || !this.call.startTime) return;
        const elapsed = Math.floor((Date.now() - this.call.startTime) / 1000);
        const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const sec = (elapsed % 60).toString().padStart(2, '0');
        timerEl.textContent = `${min}:${sec}`;
    },

    _hideCallModal() {
        const modal = document.getElementById("call-modal");
        if (modal) modal.style.display = "none";
        this.incomingCallPeerId = null;
    },

    answerCall() {
        const peerId = this.incomingCallPeerId;
        this._hideCallModal(); this._closeAlertModal(); this._hideFriendRequestModal();
        if (!peerId) return;
        const call = this._pendingCall; this._pendingCall = null;
        navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then((localStream) => {
            const c = this.call;
            c.active = true; c.peerId = peerId; c.localStream = localStream;
            c.mediaConnection = call; c.startTime = Date.now();
            c.state = "connected";
            call.answer(localStream);
            call.on("stream", (remoteStream) => {
                if (c.audio) { c.audio.pause(); c.audio.srcObject = null; }
                c.audio = new Audio(); c.audio.srcObject = remoteStream; c.audio.play();
            });
            call.on("close", () => { this._onCallEnd(); });
            call.on("error", (err) => { console.error("[Call] error:", err); this.hangupCall(); });
            const contact = this.contacts.find(ct => ct.userId === peerId);
            const name = contact ? (contact.nickname || peerId) : peerId;
            
            // 通话接通：隐藏 modal，显示 header 中的通话栏
            this._showCallInHeader();
            
            c.timerInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - c.startTime) / 1000);
                const min = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const sec = (elapsed % 60).toString().padStart(2, '0');
                const el = document.getElementById("call-status-timer");
                if (el) el.textContent = `${min}:${sec}`;
            }, 1000);
        }).catch((err) => {
            console.error("[Call] Mic error:", err);
            this.showAlert(_i18n.t('pchat.alert.micError')); call.close();
        });
    },

    rejectCall() {
        this._hideCallModal(); this._closeAlertModal(); this._hideFriendRequestModal();
        if (this._pendingCall) { this._pendingCall.close(); this._pendingCall = null; }
    },

    startCall(peerId) {
        if (this.call.active) { this.hangupCall(); return; }
        PeerConn.call(peerId);
    },

    hangupCall() {
        console.log("[Call] Hangup");
        this._onCallEnd();
    },
    
    // 通话结束统一处理
    _onCallEnd() {
        const c = this.call;
        
        // 计算通话时长并记录
        if (c.startTime) {
            const duration = Math.floor((Date.now() - c.startTime) / 1000);
            this._recordCallMessage(c.peerId, duration);
        }
        
        this._stopCallMedia();
        this._hideCallModal();
        this._hideCallInHeader();
        this._resetCallUI();
    },
    
    // 记录通话消息到对话
    _recordCallMessage(peerId, durationSeconds) {
        const now = Date.now();
        const durStr = this._formatDuration(durationSeconds);
        const content = _i18n.fmt('pchat.call.log', 'dur', durStr);
        const id = `call_${peerId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const msg = {
            id,
            peerId,
            content,
            ts: now,
            direction: "received",
            fromId: peerId,
            type: "call-log"
        };
        
        DB.put("messages", msg, this.my.aesKey).then(() => {
            if (this.activeConv && this.activeConv.id === peerId) {
                this._appendMsg(msg);
            }
            
            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) {
                contact.lastMessage = { content: content, ts: now, fromId: peerId };
                this.saveContact(contact);
            }
        });
    },
    
    // 格式化时长
    _formatDuration(seconds) {
        if (seconds < 60) return _i18n.fmt('pchat.duration.seconds', 'n', seconds);
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        if (sec === 0) return _i18n.fmt('pchat.duration.minutes', 'n', min);
        return _i18n.fmt('pchat.duration.minSec', 'min', min, 'sec', sec);
    },

    _stopCallMedia() {
        const c = this.call;
        if (c.localStream) {
            c.localStream.getTracks().forEach(t => t.stop());
            c.localStream = null;
        }
        if (c.mediaConnection) { c.mediaConnection.close(); c.mediaConnection = null; }
        if (c.audio) { c.audio.pause(); c.audio.srcObject = null; c.audio = null; }
        if (c.timerInterval) { clearInterval(c.timerInterval); c.timerInterval = null; }
        c.active = false; c.peerId = null; c.startTime = null; c.state = "idle";
    },

    _resetCallUI() {
        const btn = document.getElementById("call-btn");
        if (btn) { btn.textContent = "📞"; btn.classList.remove("active"); }
        
        // 重置 modal 按钮状态
        const actionsEl = document.getElementById("call-actions");
        const hangupBtnEl = document.getElementById("call-hangup-btn");
        if (actionsEl) actionsEl.style.display = "flex";
        if (hangupBtnEl) hangupBtnEl.style.display = "none";
    },

    initiateCall() {
        if (!this.activeConv || !this.activeConv.id) { this.showAlert(_i18n.t('pchat.alert.selectChat')); return; }
        if (this.call.active) this.hangupCall(); else this.startCall(this.activeConv.id);
    },

    // ---- Delete message ----
    async deleteMessage(msgId, event) {
        if (event) { event.stopPropagation(); event.preventDefault(); }
        const msg = await DB.get("messages", msgId, this.my.aesKey);
        if (!msg) return;
        try {
            const tx = DB.db.transaction("messages", "readwrite");
            const store = tx.objectStore("messages");
            store.delete(msgId);
            await new Promise((resolve, reject) => { tx.oncomplete = resolve; tx.onerror = reject; });
            console.log(`[Chat] Deleted message ${msgId}`);
        } catch (e) { console.error("[Chat] Delete failed:", e); }
        const row = document.querySelector(`.message-row[data-msg-id="${msgId}"]`);
        if (row) {
            row.style.transition = 'opacity 0.3s, transform 0.3s';
            row.style.opacity = '0'; row.style.transform = 'scale(0.95)';
            setTimeout(() => row.remove(), 300);
        }
    },

    // ---- Image viewer ----
    openImageViewer(src) {
        const iv = this.imageViewer;
        iv.url = src; iv.zoom = 1; iv.panX = 0; iv.panY = 0; iv.dragging = false;
        const img = document.getElementById("image-viewer-img");
        img.src = src; img.style.transform = 'none'; img.style.transformOrigin = 'center center';
        document.getElementById("image-viewer").classList.add("show");
        this._updateZoomDisplay();
        const viewer = document.getElementById("image-viewer");
        viewer.onwheel = (e) => { e.preventDefault(); const delta = e.deltaY > 0 ? -0.1 : 0.1; this._applyZoom(iv.zoom + delta, e, img); };
        img.onpointerdown = (e) => {
            if (e.button !== 0) return;
            iv.dragging = true; iv.lastX = e.clientX; iv.lastY = e.clientY;
            img.setPointerCapture(e.pointerId); img.style.cursor = 'grabbing';
        };
        img.onpointermove = (e) => {
            if (!iv.dragging) return;
            iv.panX += e.clientX - iv.lastX; iv.panY += e.clientY - iv.lastY;
            iv.lastX = e.clientX; iv.lastY = e.clientY;
            img.style.transform = `scale(${iv.zoom}) translate(${iv.panX}px, ${iv.panY}px)`;
        };
        img.onpointerup = (e) => { iv.dragging = false; img.style.cursor = 'grab'; };
        img.ondragstart = (e) => e.preventDefault();
        document.onkeydown = (e) => { if (e.key === "Escape") this.closeImageViewer(); };
    },

    _applyZoom(newZoom, event, img) {
        const iv = this.imageViewer;
        newZoom = Math.max(0.1, Math.min(10, newZoom));
        if (event) {
            const oldZoom = iv.zoom;
            const imgRect = img.getBoundingClientRect();
            const cx = imgRect.left + imgRect.width / 2; const cy = imgRect.top + imgRect.height / 2;
            const dx = event.clientX - cx; const dy = event.clientY - cy;
            iv.panX += dx * (1 / newZoom - 1 / oldZoom);
            iv.panY += dy * (1 / newZoom - 1 / oldZoom);
        }
        iv.zoom = newZoom;
        img.style.transform = `scale(${iv.zoom}) translate(${iv.panX}px, ${iv.panY}px)`;
        this._updateZoomDisplay();
    },

    _updateZoomDisplay() {
        const iv = this.imageViewer;
        const el = document.getElementById("zoom-percent");
        if (!el) return;
        el.textContent = Math.round(iv.zoom * 100) + '%'; el.style.opacity = '1';
        clearTimeout(iv.zoomTimer);
        iv.zoomTimer = setTimeout(() => { el.style.opacity = '0'; }, 1500);
    },

    zoomIn(event) { if (event) event.stopPropagation(); this._applyZoom(this.imageViewer.zoom + 0.2, null, document.getElementById("image-viewer-img")); },
    zoomOut(event) { if (event) event.stopPropagation(); this._applyZoom(this.imageViewer.zoom - 0.2, null, document.getElementById("image-viewer-img")); },
    resetZoom(event) {
        if (event) event.stopPropagation();
        const iv = this.imageViewer; iv.zoom = 1; iv.panX = 0; iv.panY = 0;
        const img = document.getElementById("image-viewer-img"); img.style.transform = 'none';
        this._updateZoomDisplay();
    },

    closeImageViewer(event) {
        if (event) {
            if (event.target.id !== "image-viewer" && event.target.tagName !== "BUTTON" && !event.target.closest('#image-viewer-toolbar')) return;
            event.stopPropagation();
        }
        const viewer = document.getElementById("image-viewer");
        viewer.classList.remove("show"); viewer.onwheel = null;
        const img = document.getElementById("image-viewer-img");
        img.onpointerdown = null; img.onpointermove = null; img.onpointerup = null; img.ondragstart = null;
        document.onkeydown = null; clearTimeout(this.imageViewer.zoomTimer);
    },

    downloadImage(event) {
        if (event) event.stopPropagation();
        const iv = this.imageViewer; if (!iv.url) return;
        const a = document.createElement('a'); a.href = iv.url; a.download = 'image_' + Date.now(); a.click();
    },

    _scroll() { const el = document.getElementById("message-list"); if (el) el.scrollTop = el.scrollHeight; },

    // ---- Render lists ----
    _renderContacts() {
        const list = document.getElementById("contact-list");
        list.innerHTML = "";
        for (const c of this.contacts) {
            const div = document.createElement("div");
            div.className = "list-item";
            div.dataset.id = c.userId;
            const ch = (c.nickname || c.userId || "?")[0].toUpperCase();
            const unread = (this.unreadCount[c.userId] || 0);
            if (unread > 0) div.classList.add("has-unread");
            const peer = PeerConn.peers[c.userId];
            const connOpen = peer && peer.connected;
            const hasPeerKey = peer && peer.peerKey;
            let icon, st;
            if (connOpen) { icon = "🟢"; st = _i18n.t('pchat.status.online'); }
            else if (c.publicKey || hasPeerKey) { icon = "⚪"; st = _i18n.t('pchat.status.offline'); }
            else { icon = "⏳"; st = _i18n.t('pchat.status.waitingKeyExchange'); }
            let lastMsgHtml = "";
            if (c.lastMessage) {
                const lm = c.lastMessage;
                const sender = lm.fromId === this.my.id ? _i18n.t('pchat.msg.selfPrefix') : (c.nickname + ':');
                const time = this._formatTime(lm.ts);
                lastMsgHtml = `<div class="last-msg">${sender}${lm.content ? lm.content.substring(0, 20) + (lm.content.length > 20 ? '...' : '') : ''} <span class="time">${time}</span></div>`;
            }
            div.innerHTML = `<div class="avatar">${ch}</div><div class="info" onclick="ChatApp.openConversation('contact','${c.userId}')"><div class="name" style="display:flex;align-items:center;gap:6px;"><span>${c.nickname || c.userId}</span><span style="font-size:11px;color:#999;font-weight:normal;">${icon} ${st}</span></div><div style="font-size:11px;color:#666;margin-bottom:2px;">${c.userId}</div>${lastMsgHtml}</div><button class="contact-del-btn" onclick="event.stopPropagation();ChatApp.showConfirmDelete('${c.userId}',this)">×</button>${unread > 0 ? `<div class="badge">${unread}</div>` : ""}`;
            list.appendChild(div);
        }
    },

    _renderGroups() {
        const list = document.getElementById("room-list");
        list.innerHTML = "";
        for (const g of this.groups) {
            const div = document.createElement("div");
            div.className = "list-item";
            div.dataset.id = g.id;
            div.innerHTML = `<div class="avatar">👥</div><div class="info" onclick="ChatApp.openConversation('group','${g.id}')"><div class="name">${g.name}</div><div class='status'>` + _i18n.fmt('pchat.status.groupMembers', 'n', g.memberIds.length) + `<div class='status'></div>`;
            list.appendChild(div);
        }
    },

    // ---- Event binding ----
    _bindEvents() {
        document.getElementById("message-input").onkeydown = (e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
        };
        const imageUpload = document.getElementById("image-upload");
        if (imageUpload) imageUpload.onchange = (e) => this.sendImage(e);
        const resize = document.getElementById("sidebar-resize");
        if (resize) {
            let startX, startW;
            resize.onmousedown = (e) => {
                startX = e.clientX;
                startW = document.getElementById("sidebar").offsetWidth;
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", () => { document.removeEventListener("mousemove", onMove); });
            };
            const onMove = (e) => {
                const w = Math.max(200, Math.min(600, startW + (e.clientX - startX)));
                document.getElementById("sidebar").style.width = w + "px";
            };
        }
        document.getElementById("nickname-input").onkeydown = (e) => { if (e.key === "Enter") this.registerUser(); };
        document.getElementById("password-input").onkeydown = (e) => { if (e.key === "Enter") this.registerUser(); };
        document.getElementById("login-password-input").onkeydown = (e) => { if (e.key === "Enter") this.loginUser(); };
        document.getElementById("add-friend-input").onkeydown = (e) => { if (e.key === "Enter") this.addFriendById(); };
    },

    // ---- Public helpers for PeerConn module ----
    async getMessages(peerId) {
        const all = await DB.list("messages", this.my.aesKey);
        return all.filter(m => m.peerId === peerId).sort((a, b) => a.ts - b.ts);
    },

    async DB_put_msg(msg) {
        await DB.put("messages", msg, this.my.aesKey);
    },
};

document.addEventListener("DOMContentLoaded", () => ChatApp.init());
