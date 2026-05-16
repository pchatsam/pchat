# PChat 修改日志

## 2026-05-15

### 1. 移除 MindRender 品牌残留
- 从 `dist/pchat.js` 中移除所有 "MindRender" 和 "mindrender" 引用
- 替换为 "PChat"
- 更新 PBKDF2 盐值从 `mindrender-chat-salt` 改为 `pchat-salt`

### 2. 文件存储加密
- 为 IndexedDB 中文件数据添加 AES-256 加密
- 修改 `DB.putFile` 和 `DB.getFile` 方法，增加 `aesKey` 参数
- 所有调用处增加 `aesKey` 传递

### 3. STUN 服务器配置更新
- 使用 `dist/ice-test.html` 测试可用 STUN 服务器
- 移除不可用服务器（百度、网易、阿里、腾讯云、Syncthing、Google stun1）
- 替换为实测可用的 5 个 STUN 服务器（按延迟排序）：
  - `stun.chat.bilibili.com:3478` (95ms)
  - `stun.miwifi.com:3478` (106ms)
  - `stun.cloudflare.com:3478` (183ms)
  - `stun.nextcloud.com:3478` (226ms)
  - `stun.l.google.com:19302` (245ms)
- 修复 `ice-test.html` ICE 触发方式（添加 `createOffer` 和 `setLocalDescription`）

### 4. 移除 RSA 密钥对生成时的自测验证
- 从 `generateKeypair` 函数中移除 self-test try-catch 块
- 原因：RSA 自测是开发阶段验证库功能的，不应让每个用户注册时都执行

### 5. 删除备份文件
- 删除 `dist/pchat_new.js`（旧版备份文件）

### 6. 移除 decrypt 函数中的 inline self-test
- 移除 `decryptWithPrivkey` 函数中每次解密都执行的 RSA 加解密自测
- 原因：严重影响消息解密性能
- 保留 `accept` 中的跨端加密测试（正常加密切验流程）

### 7. 修复注册页面报错
- `pchat.js` 第 1197 行：`document.getElementById("delete-account-btn")` 返回 null 导致报错
- 添加空值保护，页面不存在该元素时不执行

### 8. 修改账号删除按钮
- CSS：尺寸从 28px 缩小到 20px，颜色加深为 `#d32f2f`
- JS：点击时弹出确认框，确认后才会真正删除
- 修复 CSS 优先级问题：选择器从 `.account-delete-btn` 改为 `.setup-box .account-delete-btn`

### 9. 添加删除确认弹窗（需输入密码）
- `index.html`：添加 `delete-confirm-modal` 弹窗 HTML
- `pchat.js`：
  - 添加 `_showDeleteConfirm()` 方法显示弹窗
  - 添加 `_handleDeleteConfirm()` 方法处理密码验证和删除逻辑
  - 密码验证：PBKDF2 派生密钥后尝试读取数据库，验证成功才执行删除
  - 修改删除按钮点击事件，调用 `_showDeleteConfirm` 替代 `confirm()`
- `chat.css`：添加 `danger-btn` 红色按钮样式
- `i18n`：添加 10 种语言的删除确认提示

### 10. 登录页面按钮修改
- `index.html`："接收转移"按钮改为"新建账户"
- `pchat.js`：添加 `showNewAccount()` 方法，点击后显示注册表单

### 11. 登录页面布局调整 + 版本号机制
- 根因排查：之前的布局修改没有生效（之前的码农改了错误路径）
- `index.html`：添加 `PCHAT_VERSION = '20260515.4'`，资源 URL 更新为 `?v=20260515h`
- `dist/chat.css`：添加版本注释 `v20260515.4`，新增 `.corner-panel` 和 `.corner-btn` 样式
- `dist/pchat.js`：`init()` 开头添加版本日志和 CSS rule 检测
- 角落按钮右上角固定定位，点击展开/收起面板

---
