/* ============================================================
   PChat — Invite-link + PeerJS P2P messaging
   - PeerJS handles all signaling (replaces custom WS relay)
   - PeerJS CDN: <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
   - PeerJS public signaling server
   - DB: PChat (separate from chat version)
   ============================================================
*/

// ==================== i18n ====================
var _i18n = _i18n || {};
_i18n.lang = (navigator.language || navigator.userLanguage || 'zh').substring(0,2);
if (!['zh','en','ja','de','fr','es','pt','he','ko','it'].includes(_i18n.lang)) _i18n.lang = 'en';
_i18n.t = function(key) {
    var d = _i18n.dict[key];
    if (!d) return key;
    return d[_i18n.lang] || d.en;
};
_i18n.dict = {
    'pchat.placeholder.nickname':        { zh: '输入你的昵称', en: 'Enter your nickname', ja: 'ニックネームを入力', de: 'Namen eingeben', fr: 'Entrez votre surnom', es: 'Ingresa tu apodo', pt: 'Digite seu apelido', he: 'הזן כינוי', ko: '닉네임 입력', it: 'Inserisci nickname' },
    'pchat.placeholder.password':        { zh: '输入密码', en: 'Enter password', ja: 'パスワードを入力', de: 'Passwort eingeben', fr: 'Entrez le mot de passe', es: 'Ingresa contraseña', pt: 'Digite a senha', he: 'הזן סיסמה', ko: '비밀번호 입력', it: 'Inserisci password' },
    'pchat.placeholder.addFriend':       { zh: '输入对方ID添加好友', en: 'Enter ID to add friend', ja: 'IDを入力して友達を追加', de: 'ID eingeben um Freund hinzuzufügen', fr: 'Entrez l\'ID pour ajouter un ami', es: 'Ingresa ID para agregar amigo', pt: 'Digite ID para adicionar amigo', he: 'הזן מזהה להוספת חבר', ko: 'ID 입력하여 친구 추가', it: 'Inserisci ID per aggiungere amico' },
    'pchat.placeholder.message':         { zh: '输入消息...', en: 'Type a message...', ja: 'メッセージを入力...', de: 'Nachricht eingeben...', fr: 'Tapez un message...', es: 'Escribe un mensaje...', pt: 'Digite uma mensagem...', he: 'הקלד הודעה...', ko: '메시지 입력...', it: 'Scrivi un messaggio...' },
    'pchat.placeholder.groupName':       { zh: '群组名称', en: 'Group name', ja: 'グループ名', de: 'Gruppenname', fr: 'Nom du groupe', es: 'Nombre del grupo', pt: 'Nome do grupo', he: 'שם קבוצה', ko: '그룹 이름', it: 'Nome gruppo' },
    'pchat.title.showQR':              { zh: '点击显示二维码', en: 'Click to show QR code', ja: 'クリックしてQRコードを表示', de: 'Klicken um QR-Code anzuzeigen', fr: 'Cliquez pour afficher le QR Code', es: 'Click para mostrar código QR', pt: 'Clique para mostrar código QR', he: 'לחץ להצגת קוד QR', ko: 'QR 코드를 보려면 클릭', it: 'Clicca per mostrare codice QR' },
    'pchat.title.inviteLink':            { zh: '邀请链接', en: 'Invite link', ja: '招待リンク', de: 'Einladungslink', fr: 'Lien d\'invitation', es: 'Enlace de invitación', pt: 'Link de convite', he: 'קישור הזמנה', ko: '초대 링크', it: 'Link invito' },
    'pchat.title.back':                  { zh: '返回', en: 'Back', ja: '戻る', de: 'Zurück', fr: 'Retour', es: 'Volver', pt: 'Voltar', he: 'חזור', ko: '돌아가기', it: 'Indietro' },
    'pchat.title.voiceCall':             { zh: '语音通话', en: 'Voice call', ja: 'ボイス通話', de: 'Sprachanruf', fr: 'Appel vocal', es: 'Llamada de voz', pt: 'Chamada de voz', he: 'שיחת קול', ko: '음성통화', it: 'Chiamata vocale' },
    'pchat.title.hangup':                { zh: '挂断', en: 'Hang up', ja: '切る', de: 'Auflegen', fr: 'Raccrocher', es: 'Colgar', pt: 'Desligar', he: 'נתק', ko: '끊기', it: 'Chiama' },
    'pchat.title.voiceMsg':              { zh: '语音消息', en: 'Voice message', ja: 'ボイスメッセージ', de: 'Sprachnachricht', fr: 'Message vocal', es: 'Mensaje de voz', pt: 'Mensagem de voz', he: 'הודעה קולית', ko: '음성메시지', it: 'Messaggio vocale' },
    'pchat.title.image':                 { zh: '图片', en: 'Image', ja: '画像', de: 'Bild', fr: 'Image', es: 'Imagen', pt: 'Imagem', he: 'תמונה', ko: '이미지', it: 'Immagine' },
    'pchat.title.file':                  { zh: '文件', en: 'File', ja: 'ファイル', de: 'Datei', fr: 'Fichier', es: 'Archivo', pt: 'Arquivo', he: 'קובץ', ko: '파일', it: 'File' },
    'pchat.title.answerCall':            { zh: '接听', en: 'Answer', ja: '応答', de: 'Annehmen', fr: 'Répondre', es: 'Contestar', pt: 'Atender', he: 'ענה', ko: '받기', it: 'Rispondi' },
    'pchat.title.hangupCall':            { zh: '挂断通话', en: 'Hang up call', ja: '通話を切る', de: 'Anruf beenden', fr: 'Raccrocher l\'appel', es: 'Colgar llamada', pt: 'Encerrar chamada', he: 'נתק שיחה', ko: '통화 종료', it: 'Chiama' },
    'pchat.time.justNow':                { zh: '刚刚', en: 'just now', ja: 'たった今', de: 'gerade eben', fr: 'à l\'instant', es: 'ahora', pt: 'agora', he: 'עכשיו', ko: '방금', it: 'adesso' },
    'pchat.time.minutesAgo':             { zh: '分钟前', en: 'min ago', ja: '分前', de: 'Min. her', fr: 'min avant', es: 'min antes', pt: 'min atrás', he: 'דק קודם', ko: '분 전', it: 'min fa' },
    'pchat.time.today':                  { zh: '今天', en: 'Today', ja: '今日', de: 'Heute', fr: 'Aujourd\'hui', es: 'Hoy', pt: 'Hoje', he: 'היום', ko: '오늘', it: 'Oggi' },
    'pchat.loading.genKey':              { zh: '生成密钥...', en: 'Generating key...', ja: '鍵を生成中...', de: 'Schlüssel wird erstellt...', fr: 'Génération de clé...', es: 'Generando clave...', pt: 'Gerando chave...', he: 'מייצר מפתח...', ko: '키 생성 중...', it: 'Generazione chiave...' },
    'pchat.loading.deriveVerifyKey':     { zh: '派生验证密钥...', en: 'Deriving verify key...', ja: '検証鍵を派生中...', de: 'Verifizierungsschlüssel wird abgeleitet...', fr: 'Dérivation de clé de vérification...', es: 'Derivando clave de verificación...', pt: 'Derivando chave de verificação...', he: 'מפיק מפתח אימות...', ko: '검증 키 파생 중...', it: 'Derivazione chiave verifica...' },
    'pchat.loading.deriveDataKey':       { zh: '派生数据密钥...', en: 'Deriving data key...', ja: 'データ鍵を派生中...', de: 'Datenschlüssel wird abgeleitet...', fr: 'Dérivation de clé de données...', es: 'Derivando clave de datos...', pt: 'Derivando chave de dados...', he: 'מפיק מפתח נתונים...', ko: '데이터 키 파생 중...', it: 'Derivazione chiave dati...' },
    'pchat.loading.saveUser':            { zh: '保存用户信息...', en: 'Saving user info...', ja: 'ユーザー情報を保存中...', de: 'Benutzerinfo wird gespeichert...', fr: 'Sauvegarde des infos utilisateur...', es: 'Guardando info de usuario...', pt: 'Salvando info do usuário...', he: 'שומר מידע משתמש...', ko: '사용자 정보 저장 중...', it: 'Salvataggio info utente...' },
    'pchat.loading.verify':              { zh: '验证中...', en: 'Verifying...', ja: '検証中...', de: 'Wird überprüft...', fr: 'Vérification...', es: 'Verificando...', pt: 'Verificando...', he: 'מאמת...', ko: '검증 중...', it: 'Verifica...' },
    'pchat.loading.readUser':            { zh: '读取用户数据...', en: 'Reading user data...', ja: 'ユーザーデータを読み込み中...', de: 'Benutzerdaten werden gelesen...', fr: 'Lecture des données utilisateur...', es: 'Leyendo datos de usuario...', pt: 'Lendo dados do usuário...', he: 'קורא נתוני משתמש...', ko: '사용자 데이터 읽는 중...', it: 'Lettura dati utente...' },
    'pchat.loading.useCachedKey':        { zh: '使用缓存密钥...', en: 'Using cached key...', ja: 'キャッシュされた鍵を使用...', de: 'Zwischengespeicherten Schlüssel wird verwendet...', fr: 'Utilisation de la clé mise en cache...', es: 'Usando clave en caché...', pt: 'Usando chave em cache...', he: 'משתמש במפתח מטמון...', ko: '캐시 키 사용 중...', it: 'Uso chiave cache...' },
    'pchat.loading.loadContacts':        { zh: '加载联系人...', en: 'Loading contacts...', ja: '連絡先を読み込み中...', de: 'Kontakte werden geladen...', fr: 'Chargement des contacts...', es: 'Cargando contactos...', pt: 'Carregando contatos...', he: 'טוען אישות...', ko: '연락처 로드 중...', it: 'Caricamento contatti...' },
    'pchat.loading.loadGroups':          { zh: '加载群组...', en: 'Loading groups...', ja: 'グループを読み込み中...', de: 'Gruppen werden geladen...', fr: 'Chargement des groupes...', es: 'Cargando grupos...', pt: 'Carregando grupos...', he: 'טוען קבוצות...', ko: '그룹 로드 중...', it: 'Caricamento gruppi...' },
    'pchat.loading.done':                { zh: '完成!', en: 'Done!', ja: '完了!', de: 'Fertig!', fr: 'Terminé!', es: '¡Listo!', pt: 'Concluído!', he: 'סיום!', ko: '완료!', it: 'Fatto!' },
    'pchat.login.btn.loggingIn':         { zh: '正在登录...', en: 'Logging in...', ja: 'ログイン中...', de: 'Anmelden...', fr: 'Connexion...', es: 'Iniciando sesión...', pt: 'Entrando...', he: 'מתחבר...', ko: '로그인 중...', it: 'Accesso...' },
    'pchat.alert.enterNickname':         { zh: '请输入昵称', en: 'Please enter a nickname', ja: 'ニックネームを入力してください', de: 'Bitte Namen eingeben', fr: 'Veuillez entrer un surnom', es: 'Por favor ingresa un apodo', pt: 'Por favor digite um apelido', he: 'אנא הזן כינוי', ko: '닉네임을 입력하세요', it: 'Inserisci un nickname' },
    'pchat.alert.enterPassword':         { zh: '请输入密码', en: 'Please enter password', ja: 'パスワードを入力してください', de: 'Bitte Passwort eingeben', fr: 'Veuillez entrer le mot de passe', es: 'Por favor ingresa contraseña', pt: 'Por favor digite a senha', he: 'אנא הזן סיסמה', ko: '비밀번호를 입력하세요', it: 'Inserisci la password' },
    'pchat.alert.passwordError':         { zh: '密码错误', en: 'Wrong password', ja: 'パスワードが間違っています', de: 'Falsches Passwort', fr: 'Mot de passe incorrect', es: 'Contraseña incorrecta', pt: 'Senha incorreta', he: 'סיסמה שגויה', ko: '잘못된 비밀번호', it: 'Password errata' },
    'pchat.alert.deleteConfirm':         { zh: '是否删除所有数据？', en: 'Delete all data?', ja: 'すべてのデータを削除しますか？', de: 'Alle Daten löschen?', fr: 'Supprimer toutes les données?', es: '¿Eliminar todos los datos?', pt: 'Excluir todos os dados?', he: 'למחוק את כל הנתונים?', ko: '모든 데이터를 삭제하시겠습니까?', it: 'Eliminare tutti i dati?' },
    'pchat.alert.deleteFail':            { zh: '删除失败', en: 'Delete failed', ja: '削除に失敗しました', de: 'Löschen fehlgeschlagen', fr: 'Suppression échouée', es: 'Eliminación fallida', pt: 'Exclusão falhou', he: 'מחיקה נכשלה', ko: '삭제 실패', it: 'Eliminazione fallita' },
    'pchat.alert.fileReadFail':          { zh: '文件读取失败', en: 'File read failed', ja: 'ファイル読み込み失敗', de: 'Datei konnte nicht gelesen werden', fr: 'Échec de lecture du fichier', es: 'Error al leer archivo', pt: 'Falha ao ler arquivo', he: 'קריאת קובץ נכשלה', ko: '파일 읽기 실패', it: 'Lettura file fallita' },
    'pchat.alert.downloadExpired':       { zh: '文件已过期或不存在', en: 'File expired or not found', ja: 'ファイルの有効期限が切れています', de: 'Datei abgelaufen oder nicht gefunden', fr: 'Fichier expiré ou introuvable', es: 'Archivo caducado o no encontrado', pt: 'Arquivo expirado ou não encontrado', he: 'הקובץ פג תוקף או לא נמצא', ko: '파일이 만료되었거나 존재하지 않습니다', it: 'File scaduto o non trovato' },
    'pchat.contact.confirmDelete':       { zh: '确认', en: 'Confirm', ja: '確認', de: 'Bestätigen', fr: 'Confirmer', es: 'Confirmar', pt: 'Confirmar', he: 'אשר', ko: '확인', it: 'Conferma' },
    'pchat.alert.idCopied':              { zh: 'ID 已复制: {id}', en: 'ID copied: {id}', ja: 'IDコピー済み: {id}', de: 'ID kopiert: {id}', fr: 'ID copié: {id}', es: 'ID copiado: {id}', pt: 'ID copiado: {id}', he: 'מזהה הועתק: {id}', ko: 'ID 복사됨: {id}', it: 'ID copiato: {id}' },
    'pchat.alert.copyFail':              { zh: '复制失败', en: 'Copy failed', ja: 'コピーに失敗しました', de: 'Kopieren fehlgeschlagen', fr: 'Copie échouée', es: 'Copia fallida', pt: 'Cópia falhou', he: 'העתקה נכשלה', ko: '복사 실패', it: 'Copia fallita' },
    'pchat.alert.idCopyManual':          { zh: '你的ID: {id} （请手动复制）', en: 'Your ID: {id} (please copy manually)', ja: 'あなたのID: {id} （手動でコピー）', de: 'Deine ID: {id} (manuell kopieren)', fr: 'Votre ID: {id} (copiez manuellement)', es: 'Tu ID: {id} (copia manualmente)', pt: 'Seu ID: {id} (copie manualmente)', he: 'המזהה שלך: {id} (העתק ידנית)', ko: '내 ID: {id} (직접 복사하세요)', it: 'Il tuo ID: {id} (copia manualmente)' },
    'pchat.alert.inviteCopied':          { zh: '邀请链接已复制: {url}', en: 'Invite link copied: {url}', ja: '招待リンクをコピーしました: {url}', de: 'Einladungslink kopiert: {url}', fr: 'Lien d\'invitation copié: {url}', es: 'Enlace de invitación copiado: {url}', pt: 'Link de convite copiado: {url}', he: 'קישור הזמנה הועתק: {url}', ko: '초대 링크 복사됨: {url}', it: 'Link invito copiato: {url}' },
    'pchat.alert.inviteCopyManual':      { zh: '复制失败，请手动复制: {url}', en: 'Copy failed, copy manually: {url}', ja: 'コピー失敗、手動でコピー: {url}', de: 'Kopieren fehlgeschlagen, manuell kopieren: {url}', fr: 'Copie échouée, copiez manuellement: {url}', es: 'Copia fallida, copia manualmente: {url}', pt: 'Cópia falhou, copie manualmente: {url}', he: 'העתקה נכשלה, העתק ידנית: {url}', ko: '복사 실패, 수동 복사: {url}', it: 'Copia fallita, copia manualmente: {url}' },
    'pchat.alert.enterGroupName':        { zh: '请输入群组名称', en: 'Please enter group name', ja: 'グループ名を入力してください', de: 'Bitte Gruppenname eingeben', fr: 'Veuillez entrer le nom du groupe', es: 'Por favor ingresa nombre del grupo', pt: 'Por favor digite nome do grupo', he: 'אנא הזן שם קבוצה', ko: '그룹 이름을 입력하세요', it: 'Inserisci nome gruppo' },
    'pchat.alert.selectMember':          { zh: '请选择至少一个成员', en: 'Please select at least one member', ja: '少なくとも1人のメンバーを選択してください', de: 'Bitte mindestens ein Mitglied auswählen', fr: 'Veuillez sélectionner au moins un membre', es: 'Por favor selecciona al menos un miembro', pt: 'Por favor selecione pelo menos um membro', he: 'אנא בחר לפחות חבר אחד', ko: '최소 1명의 멤버를 선택하세요', it: 'Seleziona almeno un membro' },
    'pchat.alert.friendRejected':        { zh: '{name} 拒绝了好友请求', en: '{name} rejected friend request', ja: '{name}が友達リクエストを拒否しました', de: '{name} hat Freundesanfrage abgelehnt', fr: '{name} a rejeté la demande d\'ami', es: '{name} rechazó solicitud de amistad', pt: '{name} recusou solicitação de amizade', he: '{name} דחה בקשת חברות', ko: '{name}이 친구 요청을 거부했습니다', it: '{name} ha rifiutato richiesta amicizia' },
    'pchat.alert.waitingReply':          { zh: '正在等待对方回复，请勿重复添加', en: 'Waiting for reply, please wait', ja: '返信を待機中、お待ちください', de: 'Warten auf Antwort, bitte warten', fr: 'En attente de réponse, veuillez patienter', es: 'Esperando respuesta, por favor espera', pt: 'Aguardando resposta, por favor aguarde', he: 'ממתין לתשובה, אנא המתן', ko: '회신 대기 중, 잠시 기다려주세요', it: 'In attesa di risposta, attendi' },
    'pchat.alert.peerOffline':           { zh: '对方不在线，请稍后再试', en: 'Peer is offline, try again later', ja: '相手がオフラインです、後で再試行', de: 'Peer ist offline, versuchen Sie es später', fr: 'Le pair est hors ligne, réessayez plus tard', es: 'Contacto desconectado, intenta más tarde', pt: 'Contato offline, tente mais tarde', he: 'הצד השני לא מחובר, נסה שוב מאוחר יותר', ko: '대피가 오프라인입니다, 나중에 재시도', it: 'Contatto offline, riprova più tardi' },
    'pchat.alert.enterPeerId':           { zh: '请输入对方ID', en: 'Please enter peer ID', ja: '相手のIDを入力してください', de: 'Bitte Peer-ID eingeben', fr: 'Veuillez entrer l\'ID du pair', es: 'Por favor ingresa ID del contacto', pt: 'Por favor digite ID do contato', he: 'אנא הזן מזהה עמית', ko: '대피 ID를 입력하세요', it: 'Inserisci ID del contatto' },
    'pchat.alert.cannotAddSelf':         { zh: '不能添加自己', en: 'Cannot add yourself', ja: '自分を追加することはできません', de: 'Sie können sich nicht selbst hinzufügen', fr: 'Vous ne pouvez pas vous ajouter vous-même', es: 'No puedes agregarte a ti mismo', pt: 'Não pode adicionar a si mesmo', he: 'לא ניתן להוסיף את עצמך', ko: '자신을 추가할 수 없습니다', it: 'Non puoi aggiungerti' },
    'pchat.alert.idConflict':            { zh: '你的 ID "{id}" 已被占用，是否更换 ID？', en: 'Your ID "{id}" is taken, change ID?', ja: 'ID「{id}」が既に使われています、ID を変更しますか？', de: 'Ihre ID "{id}" ist belegt, ID ändern?', fr: 'Votre ID "{id}" est prise, changer d\'ID ?', es: 'Tu ID "{id}" está ocupada, cambiar ID?', pt: 'Seu ID "{id}" está ocupado, trocar ID?', he: 'המזהה "{id}" תפוס, להחליף מזהה?', ko: 'ID "{id}"이(가) 이미 사용 중입니다, ID를 변경하시겠습니까?', it: 'Il tuo ID "{id}" è occupato, cambiare ID?' },
    'pchat.alert.idChanged':             { zh: 'ID 已更换', en: 'ID changed', ja: 'ID が変更されました', de: 'ID geändert', fr: 'ID modifié', es: 'ID cambiado', pt: 'ID alterado', he: 'מזהה הוחלף', ko: 'ID 가 변경되었습니다', it: 'ID modificato' },
    'pchat.msg.idChanged':               { zh: '{name} 更换了 ID（旧 ID：{oldId}）', en: '{name} changed ID (old ID: {oldId})', ja: '{name} の ID が変更されました（旧 ID: {oldId}）', de: '{name} hat ID geändert (alte ID: {oldId})', fr: '{name} a changé d\'ID (ancien ID: {oldId})', es: '{name} cambió ID (ID anterior: {oldId})', pt: '{name} alterou ID (ID anterior: {oldId})', he: '{name} שינה מזהה (מזהה ישן: {oldId})', ko: '{name}(이)가 ID를 변경했습니다(기존 ID: {oldId})', it: '{name} ha cambiato ID (vecchio ID: {oldId})' },
    'pchat.msg.idChangedSystem':         { zh: '系统', en: 'System', ja: 'システム', de: 'System', fr: 'Système', es: 'Sistema', pt: 'Sistema', he: 'מערכת', ko: '시스템', it: 'Sistema' },
    // Transfer
    'pchat.transfer.title':              { zh: '转移账户', en: 'Transfer Account', ja: 'アカウント移行', de: 'Konto übertragen', fr: 'Transférer le compte', es: 'Transferir cuenta', pt: 'Transferir conta', he: 'העבר חשבון', ko: '계정 이전', it: 'Trasferisci account' },
    'pchat.transfer.titleReceive':       { zh: '接收转移', en: 'Receive Transfer', ja: '移行受け取り', de: 'Übertragung empfangen', fr: 'Recevoir le transfert', es: 'Recibir transferencia', pt: 'Receber transferência', he: 'קבל העברה', ko: '이전 받기', it: 'Ricevi trasferimento' },
    'pchat.transfer.selectAccount':      { zh: '选择要转移的账户', en: 'Select account to transfer', ja: '移行するアカウントを選択', de: 'Konto zum Übertragen wählen', fr: 'Sélectionner le compte à transférer', es: 'Seleccionar cuenta a transferir', pt: 'Selecionar conta para transferir', he: 'בחר חשבון להעברה', ko: '이전할 계정 선택', it: 'Seleziona account da trasferire' },
    'pchat.transfer.enterPassword':      { zh: '输入密码验证', en: 'Enter password to verify', ja: 'パスワードを入力して確認', de: 'Passwort zur Überprüfung eingeben', fr: 'Entrez le mot de passe pour vérifier', es: 'Ingresa contraseña para verificar', pt: 'Digite senha para verificar', he: 'הזן סיסמה לאימות', ko: '확인 위해 비밀번호 입력', it: 'Inserisci password per verificare' },
    'pchat.transfer.verify':             { zh: '验证', en: 'Verify', ja: '確認', de: 'Überprüfen', fr: 'Vérifier', es: 'Verificar', pt: 'Verificar', he: 'אימות', ko: '확인', it: 'Verifica' },
    'pchat.transfer.scanning':           { zh: '等待对方连接...', en: 'Waiting for connection...', ja: '接続を待機中...', de: 'Warten auf Verbindung...', fr: 'En attente de connexion...', es: 'Esperando conexión...', pt: 'Aguardando conexão...', he: 'מחכה לחיבור...', ko: '연결 대기 중...', it: 'In attesa di connessione...' },
    'pchat.transfer.connecting':         { zh: '正在连接...', en: 'Connecting...', ja: '接続中...', de: 'Verbinde...', fr: 'Connexion...', es: 'Conectando...', pt: 'Conectando...', he: 'מתחבר...', ko: '연결 중...', it: 'Connessione...' },
    'pchat.transfer.sending':            { zh: '正在发送: {table}', en: 'Sending: {table}', ja: '送信中: {table}', de: 'Senden: {table}', fr: 'Envoi: {table}', es: 'Enviando: {table}', pt: 'Enviando: {table}', he: 'שולח: {table}', ko: '전송 중: {table}', it: 'Invio: {table}' },
    'pchat.transfer.receiving':          { zh: '正在接收: {table}', en: 'Receiving: {table}', ja: '受信中: {table}', de: 'Empfangen: {table}', fr: 'Réception: {table}', es: 'Recibiendo: {table}', pt: 'Recebendo: {table}', he: 'מקבל: {table}', ko: '수신 중: {table}', it: 'Ricezione: {table}' },
    'pchat.transfer.complete':           { zh: '转移完成！', en: 'Transfer complete!', ja: '移行完了！', de: 'Übertragung abgeschlossen!', fr: 'Transfert terminé!', es: '¡Transferencia completa!', pt: 'Transferência concluída!', he: 'העברה הושלמה!', ko: '이전 완료!', it: 'Trasferimento completo!' },
    'pchat.transfer.received':           { zh: '接收完成！账户已添加', en: 'Received! Account added', ja: '受け取り完了！アカウント追加', de: 'Empfangen! Konto hinzugefügt', fr: 'Reçu! Compte ajouté', es: '¡Recibido! Cuenta agregada', pt: 'Recebido! Conta adicionada', he: 'התקבל! חשבון נוסף', ko: '수신 완료! 계정 추가됨', it: 'Ricevuto! Account aggiunto' },
    'pchat.transfer.error.password':     { zh: '密码错误', en: 'Wrong password', ja: 'パスワードが間違っています', de: 'Falsches Passwort', fr: 'Mot de passe incorrect', es: 'Contraseña incorrecta', pt: 'Senha incorreta', he: 'סיסמה שגויה', ko: '잘못된 비밀번호', it: 'Password errata' },
    'pchat.transfer.error.noSelect':     { zh: '请先选择账户', en: 'Please select an account first', ja: 'まずアカウントを選択してください', de: 'Bitte wählen Sie zuerst ein Konto', fr: 'Veuillez d\'abord sélectionner un compte', es: 'Selecciona una cuenta primero', pt: 'Selecione uma conta primeiro', he: 'בחר חשבון קודם', ko: '먼저 계정을 선택하세요', it: 'Seleziona prima un account' },
    'pchat.transfer.btn.out':            { zh: '转移账户', en: 'Transfer', ja: '移行', de: 'Übertragen', fr: 'Transférer', es: 'Transferir', pt: 'Transferir', he: 'העברה', ko: '이전', it: 'Trasferisci' },
    'pchat.transfer.btn.in':             { zh: '接收转移', en: 'Receive', ja: '受け取り', de: 'Empfangen', fr: 'Recevoir', es: 'Recibir', pt: 'Receber', he: 'קבל', ko: '받기', it: 'Ricevi' },
    'pchat.transfer.btn.scan':           { zh: '扫描二维码', en: 'Scan QR Code', ja: 'QRコードスキャン', de: 'QR-Code scannen', fr: 'Scanner QR Code', es: 'Escanear QR', pt: 'Escanear QR', he: 'סרוק QR', ko: 'QR 코드 스캔', it: 'Scansiona QR' },
    'pchat.transfer.btn.connect':        { zh: '连接', en: 'Connect', ja: '接続', de: 'Verbinden', fr: 'Connecter', es: 'Conectar', pt: 'Conectar', he: 'חיבור', ko: '연결', it: 'Connetti' },
    'pchat.transfer.enterId':            { zh: '或输入 ID', en: 'Or enter ID', ja: 'またはIDを入力', de: 'Oder ID eingeben', fr: 'Ou entrer l\'ID', es: 'O ingresa ID', pt: 'Ou digite ID', he: 'או הזן מזהה', ko: '또는 ID 입력', it: 'O inserisci ID' },
    'pchat.transfer.pending':            { zh: '等待接收方连接', en: 'Waiting for receiver', ja: '受信者待機中', de: 'Warten auf Empfänger', fr: 'En attente du récepteur', es: 'Esperando receptor', pt: 'Aguardando receptor', he: 'מחכה לקולט', ko: '수신자 대기 중', it: 'In attesa del destinatario' },
    'pchat.transfer.done':               { zh: '完成', en: 'Done', ja: '完了', de: 'Fertig', fr: 'Terminé', es: 'Listo', pt: 'Concluído', he: 'סיום', ko: '완료', it: 'Fatto' },
    'pchat.transfer.table.user':         { zh: '用户信息', en: 'User info', ja: 'ユーザー情報', de: 'Benutzerinfo', fr: 'Infos utilisateur', es: 'Info usuario', pt: 'Info do usuário', he: 'פרטי משתמש', ko: '사용자 정보', it: 'Info utente' },
    'pchat.transfer.table.contacts':     { zh: '联系人', en: 'Contacts', ja: '連絡先', de: 'Kontakte', fr: 'Contacts', es: 'Contactos', pt: 'Contatos', he: 'אנשי קשר', ko: '연락처', it: 'Contatti' },
    'pchat.transfer.table.messages':     { zh: '消息', en: 'Messages', ja: 'メッセージ', de: 'Nachrichten', fr: 'Messages', es: 'Mensajes', pt: 'Mensagens', he: 'הודעות', ko: '메시지', it: 'Messaggi' },
    'pchat.transfer.table.groups':       { zh: '群组', en: 'Groups', ja: 'グループ', de: 'Gruppen', fr: 'Groupes', es: 'Grupos', pt: 'Grupos', he: 'קבוצות', ko: '그룹', it: 'Gruppi' },
    'pchat.transfer.table.invitations':  { zh: '邀请', en: 'Invitations', ja: '招待', de: 'Einladungen', fr: 'Invitations', es: 'Invitaciones', pt: 'Convites', he: 'הזמנות', ko: '초대', it: 'Inviti' },
    'pchat.login.btn.selectAccount':     { zh: '请先选择账户', en: 'Please select an account', ja: 'アカウントを選択してください', de: 'Bitte Konto wählen', fr: 'Veuillez sélectionner un compte', es: 'Selecciona una cuenta', pt: 'Selecione uma conta', he: 'בחר חשבון', ko: '계정을 선택하세요', it: 'Seleziona un account' },
    'pchat.login.btn.deleteAccount':     { zh: '删除此账户', en: 'Delete this account', ja: 'このアカウントを削除', de: 'Dieses Konto löschen', fr: 'Supprimer ce compte', es: 'Eliminar esta cuenta', pt: 'Excluir esta conta', he: 'מחק חשבון זה', ko: '이 계정 삭제', it: 'Elimina questo account' },
    'pchat.msg.deleteConfirm':           { zh: '请输入密码确认删除此账户，此操作不可恢复', en: 'Enter password to confirm account deletion. This action cannot be undone.', ja: 'アカウント削除を確認するにはパスワードを入力してください。この操作は取り消せません。', de: 'Passwort eingeben, um Kontolöschung zu bestätigen. Diese Aktion kann nicht rückgängig gemacht werden.', fr: 'Entrez le mot de passe pour confirmer la suppression du compte. Cette action est irréversible.', es: 'Ingrese la contraseña para confirmar la eliminación de la cuenta. Esta acción no se puede deshacer.', pt: 'Digite a senha para confirmar a exclusão da conta. Esta ação não pode ser desfeita.', he: 'הזן סיסמה כדי לאשר מחיקת חשבון. פעולה זו אינה ניתנת לביטול.', ko: '계정 삭제를 확인하려면 암호를 입력하십시오. 이 작업은 취소할 수 없습니다.', it: 'Inserisci la password per confermare l\'eliminazione dell\'account. Questa azione non può essere annullata.' },
    'pchat.msg.voice':                   { zh: '语音', en: 'Voice', ja: '音声', de: 'Sprache', fr: 'Voix', es: 'Voz', pt: 'Voz', he: 'קול', ko: '음성', it: 'Voce' },
    'pchat.file.incomplete':             { zh: '文件传输不完整（大小不匹配）', en: 'File transfer incomplete (size mismatch)', ja: 'ファイル転送が不完全（サイズ不一致）', de: 'Dateiübertragung unvollständig (Größenunterschied)', fr: 'Transfert de fichier incomplet (taille incompatible)', es: 'Transferencia incompleta (tamaño no coincide)', pt: 'Transferência incompleta (tamanho incompatível)', he: 'העברת קובץ לא הושלמה (אי התאמה בגודל)', ko: '파일 전송 불완전(크기 불일치)', it: 'Trasferimento incompleto (dimensioni non corrispondenti)' },
    'pchat.file.checksumFail':           { zh: '文件传输校验失败（内容损坏）', en: 'File checksum failed (data corrupted)', ja: 'ファイルチェックサム失敗（データ破損）', de: 'Datei-Prüfsumme fehlgeschlagen (Daten beschädigt)', fr: 'Vérification de fichier échouée (données corrompues)', es: 'Verificación fallida (datos corruptos)', pt: 'Verificação falhou (dados corrompidos)', he: 'בדיקת קובץ נכשלה (נתונים פגומים)', ko: '파일 체크섬 실패(데이터 손상)', it: 'Verifica fallita (dati corrotti)' },
    'pchat.file.prefixImage':            { zh: '[图片]', en: '[Image]', ja: '[画像]', de: '[Bild]', fr: '[Image]', es: '[Imagen]', pt: '[Imagem]', he: '[תמונה]', ko: '[이미지]', it: '[Immagine]' },
    'pchat.file.prefixFile':             { zh: '[文件]', en: '[File]', ja: '[ファイル]', de: '[Datei]', fr: '[Fichier]', es: '[Archivo]', pt: '[Arquivo]', he: '[קובץ]', ko: '[파일]', it: '[File]' },
    'pchat.alert.friendNotReady':        { zh: '请先完成好友添加后再发送消息', en: 'Please accept friend request first', ja: 'まず友達リクエストを承認してください', de: 'Bitte Freundesanfrage zuerst annehmen', fr: 'Veuillez d\'abord accepter la demande d\'ami', es: 'Primero acepta la solicitud de amistad', pt: 'Primeiro aceite a solicitação de amizade', he: 'אנא קבל תחילה את בקשת החברות', ko: '먼저 친구 요청을 수락하세요', it: 'Accetta prima la richiesta di amicizia' },
    'pchat.alert.selectChat':            { zh: '请先选择一个聊天', en: 'Please select a chat', ja: 'チャットを選択してください', de: 'Bitte einen Chat auswählen', fr: 'Veuillez sélectionner un chat', es: 'Por favor selecciona un chat', pt: 'Por favor selecione um chat', he: 'אנא בחר צ\'אט', ko: '채팅을 선택하세요', it: 'Seleziona una chat' },
    'pchat.alert.micError':              { zh: '无法访问麦克风', en: 'Cannot access microphone', ja: 'マイクにアクセスできません', de: 'Kein Zugriff auf Mikrofon', fr: 'Impossible d\'accéder au microphone', es: 'No se puede acceder al micrófono', pt: 'Não é possível acessar o microfone', he: 'לא ניתן לגשת למיקרופון', ko: '마이크에 액세스할 수 없습니다', it: 'Impossibile accedere al microfono' },
    'pchat.alert.peerOfflineSend':       { zh: '对方不在线，无法发送', en: 'Peer is offline, cannot send', ja: '相手がオフライン、送信できません', de: 'Peer ist offline, kann nicht senden', fr: 'Le pair est hors ligne, impossible d\'envoyer', es: 'Contacto desconectado, no se puede enviar', pt: 'Contato offline, não é possível enviar', he: 'הצד השני לא מחובר, לא ניתן לשלוח', ko: '대피가 오프라인, 전송 불가', it: 'Contatto offline, impossibile inviare' },
    'pchat.status.online':               { zh: '在线', en: 'Online', ja: 'オンライン', de: 'Online', fr: 'En ligne', es: 'En línea', pt: 'Online', he: 'מחובר', ko: '온라인', it: 'Online' },
    'pchat.status.peerJSOnline':         { zh: 'PeerJS 在线', en: 'PeerJS online', ja: 'PeerJS オンライン', de: 'PeerJS online', fr: 'PeerJS en ligne', es: 'PeerJS en línea', pt: 'PeerJS online', he: 'PeerJS מחובר', ko: 'PeerJS 온라인', it: 'PeerJS online' },
    'pchat.status.offline':              { zh: '离线', en: 'Offline', ja: 'オフライン', de: 'Offline', fr: 'Hors ligne', es: 'Desconectado', pt: 'Offline', he: 'לא מחובר', ko: '오프라인', it: 'Offline' },
    'pchat.status.waitingKeyExchange':   { zh: '等待公钥交换', en: 'Waiting for key exchange', ja: '鍵交換を待機中', de: 'Warten auf Schlüsselaustausch', fr: 'En attente d\'échange de clés', es: 'Esperando intercambio de claves', pt: 'Aguardando troca de chaves', he: 'ממתין להחלפת מפתחות', ko: '키 교환 대기 중', it: 'In attesa di scambio chiavi' },
    'pchat.status.groupMembers':         { zh: '{n} 成员', en: '{n} members', ja: '{n} 人のメンバー', de: '{n} Mitglieder', fr: '{n} membres', es: '{n} membri', pt: '{n} membros', he: '{n} חברים', ko: '{n}명', it: '{n} membri' },
    'pchat.msg.self':                    { zh: '我', en: 'Me', ja: '私', de: 'Ich', fr: 'Moi', es: 'Yo', pt: 'Eu', he: 'אני', ko: '나', it: 'Io' },
    'pchat.msg.selfPrefix':              { zh: '我：', en: 'Me:', ja: '私:', de: 'Ich:', fr: 'Moi:', es: 'Yo:', pt: 'Eu:', he: 'אני:', ko: '나:', it: 'Io:' },
    'pchat.file.unknown':                { zh: '未知文件', en: 'Unknown file', ja: '不明なファイル', de: 'Unbekannte Datei', fr: 'Fichier inconnu', es: 'Archivo desconocido', pt: 'Arquivo desconhecido', he: 'קובץ לא ידוע', ko: '알 수 없는 파일', it: 'File sconosciuto' },
    'pchat.msg.deleteTitle':             { zh: '删除', en: 'Delete', ja: '削除', de: 'Löschen', fr: 'Supprimer', es: 'Eliminar', pt: 'Excluir', he: 'מחק', ko: '삭제', it: 'Elimina' },
    'pchat.call.incoming':               { zh: '来电中...', en: 'Incoming call...', ja: '着信中...', de: 'Eingehender Anruf...', fr: 'Appel entrant...', es: 'Llamada entrante...', pt: 'Chamada recebida...', he: 'שיחה נכנסת...', ko: '발신전화...', it: 'Chiamata in arrivo...' },
    'pchat.call.waitingAnswer':          { zh: '等待接听...', en: 'Waiting for answer...', ja: '応答を待機中...', de: 'Warten auf Antwort...', fr: 'En attente de réponse...', es: 'Esperando respuesta...', pt: 'Aguardando resposta...', he: 'ממתין לתשובה...', ko: '대기 중...', it: 'In attesa di risposta...' },
    'pchat.call.log':                    { zh: '📞 通话 {dur}', en: '📞 Call {dur}', ja: '📞 通話 {dur}', de: '📞 Anruf {dur}', fr: '📞 Appel {dur}', es: '📞 Llamada {dur}', pt: '📞 Chamada {dur}', he: '📞 שיחה {dur}', ko: '📞 통화 {dur}', it: '📞 Chiamata {dur}' },
    'pchat.duration.seconds':            { zh: '{n}秒', en: '{n}s', ja: '{n}秒', de: '{n}s', fr: '{n}s', es: '{n}s', pt: '{n}s', he: '{n}ש"', ko: '{n}초', it: '{n}s' },
    'pchat.duration.minutes':            { zh: '{n}分钟', en: '{n}min', ja: '{n}分', de: '{n} Min', fr: '{n} min', es: '{n} min', pt: '{n} min', he: '{n} דק', ko: '{n}분', it: '{n} min' },
    'pchat.duration.minSec':             { zh: '{min}分{sec}秒', en: '{min}m{sec}s', ja: '{min}分{sec}秒', de: '{min} Min {sec}s', fr: '{min} min {sec}s', es: '{min} min {sec}s', pt: '{min} min {sec}s', he: '{min} דק {sec}ש"', ko: '{min}분 {sec}초', it: '{min} min {sec}s' },
    'pchat.alert.callError':             { zh: '无法发起通话', en: 'Cannot initiate call', ja: '通話を開始できません', de: 'Anruf kann nicht gestartet werden', fr: 'Impossible d\'initier l\'appel', es: 'No se puede iniciar la llamada', pt: 'Não é possível iniciar a chamada', he: 'לא ניתן להפעיל שיחה', ko: '통화를 시작할 수 없습니다', it: 'Impossibile avviare la chiamata' },
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
        return {
            publicKey: forge.pki.publicKeyToPem(rsa.publicKey),
            privateKey: forge.pki.privateKeyToPem(rsa.privateKey),
        };
    },

    async encryptChunks(pubKeyPem, plaintext) {
        // RSA-OAEP 2048 max ~190 bytes, use 180 byte chunks for safety
        const pub = forge.pki.publicKeyFromPem(pubKeyPem);
        const byteString = forge.util.encodeUtf8(plaintext);
        const CHUNK_SIZE = 180;
        const chunks = [];
        for (let i = 0; i < byteString.length; i += CHUNK_SIZE) {
            const chunk = byteString.substring(i, i + CHUNK_SIZE);
            const enc = pub.encrypt(chunk, 'RSA-OAEP', { md: forge.md.sha256.create() });
            chunks.push(forge.util.encode64(enc));
        }
        return chunks.join('|');
    },

    async decryptChunks(privKeyPem, ciphertext) {
        const priv = forge.pki.privateKeyFromPem(privKeyPem);
        const parts = ciphertext.split('|');
        let result = '';
        for (const part of parts) {
            const enc = forge.util.decode64(part);
            const dec = priv.decrypt(enc, 'RSA-OAEP', { md: forge.md.sha256.create() });
            result += forge.util.decodeUtf8(dec);
        }
        return result;
    },

    async encryptWithPubkey(pubKeyPem, plaintext) {
        const fp = Crypto.keyFingerprint(pubKeyPem);
        console.log(`[Crypto] Encrypt with pubkey fp=${fp} pemPrefix=${pubKeyPem.substring(0, 26)}...`);
        // Use chunked encryption for long messages
        const byteLen = forge.util.encodeUtf8(plaintext).length;
        if (byteLen > 150) {
            console.log(`[Crypto] Using chunked encryption (${byteLen} bytes)`);
            return this.encryptChunks(pubKeyPem, plaintext);
        }
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
        // If ciphertext contains '|', it's chunked
        if (ciphertextB64.includes('|')) {
            console.log(`[Crypto] Using chunked decryption`);
            return this.decryptChunks(privKeyPem, ciphertextB64);
        }
        // Original single-chunk decryption
        const priv = forge.pki.privateKeyFromPem(privKeyPem);
        // 从私钥派生公钥，确认公私钥是否匹配
        const pubFromPriv = forge.pki.setRsaPublicKey(priv.n, priv.e);
        const pubPemFromPriv = forge.pki.publicKeyToPem(pubFromPriv);
        console.log(`[Crypto] Derived pubkey from this privkey fp=${Crypto.keyFingerprint(pubPemFromPriv)}`);
        

        const enc = forge.util.decode64(ciphertextB64);
        const dec = priv.decrypt(enc, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
        });
        // 将 byte string 转回 UTF-16 字符串（支持中文）
        return forge.util.decodeUtf8(dec);
    },

    deriveAesKey(password, userId) {
        const salt = CryptoJS.enc.Utf8.parse("pchat-salt" + (userId || ""));
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
    BASE_NAME: "PChat",
    NAME: "PChat", // can be overridden to BASE_NAME + "_" + userId
    VER: 2,
    db: null,

    async openFor(userId) {
        // Close existing DB if different
        const targetName = userId ? (this.BASE_NAME + "_" + userId) : this.BASE_NAME;
        if (this.db && this.NAME !== targetName) {
            try { this.db.close(); } catch(e) {}
            this.db = null;
        }
        this.NAME = targetName;
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
                if (!db.objectStoreNames.contains("files")) {
                    db.createObjectStore("files", { keyPath: "id" });
                }
                if (!db.objectStoreNames.contains("invitations")) {
                    db.createObjectStore("invitations", { keyPath: "id" });
                }
            };
            req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
            req.onerror = () => reject(req.error);
        });
    },

    // Legacy open (backward compat)
    async open() { return this.openFor(null); },

    _store(name, mode) { return this.db.transaction(name, mode || "readonly").objectStore(name); },

    async put(name, item, key) {
        const enc = await Crypto.encryptAes(key, JSON.stringify(item));
        // console.log(`[DB.put] ${name} id=${item.id || item.contactId || item.userId} enc=`, enc);
        const tx = this.db.transaction(name, "readwrite");
        const store = tx.objectStore(name);
        const keyPath = store.keyPath;
        const record = { id: item.id || item.contactId || item.userId, encrypted: enc, ts: Date.now(), peerId: item.peerId || '', timestamp: item.ts || Date.now() };
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
                // Raw format (no encryption, for large files)
                if (req.result.data) {
                    try { resolve(JSON.parse(req.result.data)); }
                    catch { resolve(req.result.data); }
                    return;
                }
                // Encrypted format
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
                        // Raw format (no encryption, for direct-file messages)
                        if (it.data) {
                            try { results.push(JSON.parse(it.data)); }
                            catch { results.push({ ...it, _raw: it.data }); }
                            continue;
                        }
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

    // 利用 peerId 索引做范围查询，避免全表扫描+解密
    async listMessagesByPeer(peerId, aesKey) {
        const tx = this.db.transaction("messages", "readonly");
        const store = tx.objectStore("messages");
        const index = store.index("peerId");
        const range = IDBKeyRange.only(peerId);
        const req = index.getAll(range);
        return new Promise((resolve, reject) => {
            tx.onerror = () => reject(tx.error);
            req.onsuccess = async () => {
                const results = [];
                for (const it of req.result) {
                    try {
                        // Raw format (no encryption, for direct-file messages)
                        if (it.data) {
                            try { results.push(JSON.parse(it.data)); }
                            catch { results.push({ ...it, id: it.id, peerId: it.peerId, _raw: it.data }); }
                            continue;
                        }
                        const parsed = JSON.parse(await Crypto.decryptAes(aesKey, it.encrypted));
                        results.push(parsed);
                    } catch (e) {
                        console.warn('[DB] Decrypt failed for message', it.id, ':', e.message, 'aesKey fingerprint:', (aesKey || '').substring(0, 16) + '...');
                        const fallback = { ...it };
                        if (fallback.contactId && !fallback.userId) {
                            fallback.userId = fallback.contactId.replace("contact_", "");
                        }
                        results.push(fallback);
                    }
                }
                results.sort((a, b) => a.ts - b.ts);
                // Fallback: if index returned nothing (old records lack peerId field),
                // do full table scan and filter by decrypted peerId
                if (results.length === 0) {
                    console.log('[DB] Index empty, falling back to full scan for peerId:', peerId);
                    const allReq = store.getAll();
                    allReq.onsuccess = async () => {
                        const allResults = [];
                        for (const it of allReq.result) {
                            try {
                                // Raw format (no encryption)
                                if (it.data) {
                                    try { allResults.push(JSON.parse(it.data)); }
                                    catch { allResults.push({ ...it, id: it.id, peerId: it.peerId, _raw: it.data }); }
                                    continue;
                                }
                                const parsed = JSON.parse(await Crypto.decryptAes(aesKey, it.encrypted));
                                if (parsed.peerId === peerId) allResults.push(parsed);
                            } catch (e) { /* skip undecryptable */ }
                        }
                        allResults.sort((a, b) => a.ts - b.ts);
                        resolve(allResults);
                    };
                    allReq.onerror = () => reject(allReq.error);
                    return;
                }
                resolve(results);
            };
            req.onerror = () => reject(req.error);
        });
    },

    // ---- Store raw file data (AES encrypted, separate store) ----
    async putFile(fileId, base64Data, mime, aesKey) {
        const tx = this.db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        const encrypted = await Crypto.encryptAes(aesKey, base64Data);
        store.put({ id: fileId, data: encrypted, mime: mime || "image/png", ts: Date.now() });
        return new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    },

    // Store file WITHOUT encryption (for large files > 2MB)
    async putFileRaw(fileId, base64Data, mime) {
        const tx = this.db.transaction("files", "readwrite");
        const store = tx.objectStore("files");
        store.put({ id: fileId, data: base64Data, mime: mime || "application/octet-stream", ts: Date.now() });
        return new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    },

    // Store message WITHOUT encryption (for large files > 2MB)
    async putRaw(name, item) {
        const raw = JSON.stringify(item);
        const tx = this.db.transaction(name, "readwrite");
        const store = tx.objectStore(name);
        const record = { id: item.id || item.userId, data: raw, ts: Date.now(), peerId: item.peerId || '' };
        store.put(record);
        return new Promise((r, j) => { tx.oncomplete = r; tx.onerror = j; });
    },

    async getFile(fileId, aesKey) {
        const req = this._store("files").get(fileId);
        return new Promise((resolve) => {
            req.onsuccess = async () => {
                const record = req.result;
                if (!record) { resolve(null); return; }
                try {
                    const decrypted = await Crypto.decryptAes(aesKey, record.data);
                    record.data = decrypted;
                } catch(e) {
                    console.warn(`[DB] File decrypt failed for ${fileId}:`, e.message, 'aesKey fingerprint:', (aesKey || '').substring(0, 16) + '...');
                    resolve(null); return;
                }
                resolve(record);
            };
            req.onerror = () => resolve(null);
        });
    },

    async deleteFile(fileId) {
        this.db.transaction("files", "readwrite").objectStore("files").delete(fileId);
    },

    // ---- OPFS direct file storage (for large files > 20MB, bypasses IndexedDB) ----
    _opfsRoot: null,
    _directWriters: {},
    async _getOprfsRoot() {
        if (!this._opfsRoot) {
            this._opfsRoot = await navigator.storage.getDirectory();
        }
        return this._opfsRoot;
    },

    // Open a writable stream for a direct-transfer file
    async openDirectFile(fileId, fileName) {
        const root = await this._getOprfsRoot();
        const handle = await root.getFileHandle(`pchat-${fileId}`, { create: true });
        const writable = await handle.createWritable({ keepExistingData: false });
        // Preserve any chunks that arrived before header (lazy entry)
        const existing = DB._directWriters[fileId];
        DB._directWriters[fileId] = {
            writable, handle, fileName,
            buffer: existing?.buffer || [],
            bufferedSize: existing?.bufferedSize || 0,
            rawChunks: existing?.rawChunks || [],
            rawTotal: existing?.rawTotal || 0,
        };
        // If lazy chunks were buffered, flush them now
        if (existing?.rawChunks?.length > 0) {
            DB._flushRawBuffer(fileId).catch(e => console.error('[OPFS] lazy flush failed:', e));
        }
        return true;
    },

    // Write a chunk to buffer, flush every ~1MB to avoid thousands of tiny OPFS writes
    async writeDirectChunk(fileId, base64Chunk) {
        const entry = DB._directWriters[fileId];
        if (!entry) return false;
        if (!entry.buffer) { entry.buffer = []; entry.bufferedSize = 0; }
        entry.buffer.push(base64Chunk);
        entry.bufferedSize += base64Chunk.length;
        // Flush when buffer exceeds ~10MB (matching sender segment size)
        if (entry.bufferedSize > 10 * 1024 * 1024) {
            await DB._flushDirectBuffer(fileId);
        }
        return true;
    },

    // Buffer raw binary chunk (no base64 — from dedicated binary DC)
    // Lazily creates entry if header hasn't arrived yet
    async bufferRawChunk(fileId, chunk, fileName) {
        let entry = DB._directWriters[fileId];
        if (!entry) {
            // Binary data arrived before file-header — create entry lazily
            DB._directWriters[fileId] = entry = { rawChunks: [], rawTotal: 0, fileName: fileName || fileId };
        }
        if (!entry.rawChunks) { entry.rawChunks = []; entry.rawTotal = 0; }
        entry.rawChunks.push(chunk);
        entry.rawTotal += chunk.byteLength || chunk.length;
        if (entry.rawTotal > 10 * 1024 * 1024) {
            await DB._flushRawBuffer(fileId);
        }
    },

    // Flush raw binary chunks to OPFS — no base64, no atob, no charCodeAt!
    async _flushRawBuffer(fileId) {
        const entry = DB._directWriters[fileId];
        if (!entry || !entry.rawChunks || entry.rawChunks.length === 0) return;
        if (entry._flushing) return;
        entry._flushing = true;
        const chunks = entry.rawChunks;
        entry.rawChunks = [];
        entry.rawTotal = 0;
        const blob = new Blob(chunks);
        const buf = await blob.arrayBuffer();
        await entry.writable.write(buf);
        entry._flushing = false;
        if (entry.rawChunks && entry.rawChunks.length > 0) {
            DB._flushRawBuffer(fileId);
        }
    },

    // Flush buffered chunks to OPFS — process in 256KB slices to avoid blocking main thread
    async _flushDirectBuffer(fileId) {
        const entry = DB._directWriters[fileId];
        if (!entry || !entry.buffer || entry.buffer.length === 0) return;
        if (entry._flushing) return; // previous flush still running
        entry._flushing = true;
        // Atomically swap buffer
        const chunks = entry.buffer;
        entry.buffer = [];
        entry.bufferedSize = 0;
        const combined = chunks.join('');

        // Decode base64 → binary in 256KB slices with event-loop yields
        const SLICE = 256 * 1024; // 256KB base64 per slice → ~192KB raw
        const totalRaw = Math.ceil(combined.length * 3 / 4);
        const bytes = new Uint8Array(totalRaw);
        let srcOff = 0, dstOff = 0;

        while (srcOff < combined.length) {
            const seg = combined.slice(srcOff, srcOff + SLICE);
            const raw = atob(seg);
            for (let i = 0; i < raw.length; i++) bytes[dstOff + i] = raw.charCodeAt(i);
            srcOff += SLICE;
            dstOff += raw.length;
            // Yield to event loop so data channel messages can be delivered
            if (srcOff < combined.length) {
                await new Promise(r => setTimeout(r, 0));
            }
        }

        await entry.writable.write(bytes);
        entry._flushing = false;
        // If more chunks arrived during flush, flush again
        if (entry.buffer && entry.buffer.length > 0) {
            DB._flushDirectBuffer(fileId);
        }
    },

    // Close direct file stream, flush remaining buffer first
    async closeDirectFile(fileId) {
        const entry = DB._directWriters[fileId];
        if (!entry) return null;
        // Flush any remaining buffered chunks (base64 or raw)
        if (entry.buffer && entry.buffer.length > 0) {
            await DB._flushDirectBuffer(fileId);
        }
        if (entry.rawChunks && entry.rawChunks.length > 0) {
            await DB._flushRawBuffer(fileId);
        }
        await entry.writable.close();
        const name = entry.fileName;
        delete DB._directWriters[fileId];
        return { fileId, fileName: name };
    },

    // Read a direct file and trigger download
    async readDirectFile(fileId) {
        try {
            const root = await this._getOprfsRoot();
            const handle = await root.getFileHandle(`pchat-${fileId}`);
            const file = await handle.getFile();
            const url = URL.createObjectURL(file);
            return url;
        } catch (e) {
            console.error('[OPFS] Read failed:', fileId, e);
            return null;
        }
    },

    // Delete a direct file
    async deleteDirectFile(fileId) {
        try {
            const root = await this._getOprfsRoot();
            await root.removeEntry(`pchat-${fileId}`);
        } catch (e) {
            // File may not exist, ignore
        }
    },

    // ---- Generate thumbnail from base64 image ----
    async generateThumbnail(base64Data, mime, maxDim) {
        maxDim = maxDim || 200;
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let w = img.width, h = img.height;
                if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
                else { w = Math.round(w * maxDim / h); h = maxDim; }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL("image/jpeg", 0.7).split(",")[1]);
            };
            img.onerror = () => resolve(null);
            img.src = `data:${mime || "image/png"};base64,${base64Data}`;
        });
    },
};

// ==================== AccountManager ====================
// Manages multiple user accounts in localStorage + per-account IndexedDB
const AccountManager = {
    STORAGE_KEY: "pchat_accounts",

    // Get all saved accounts
    listAccounts() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (!data) return [];
        try { return JSON.parse(data); } catch(e) { return []; }
    },

    // Add account
    addAccount(userId, nickname) {
        const accounts = this.listAccounts();
        const existing = accounts.find(a => a.userId === userId);
        if (existing) {
            existing.nickname = nickname;
        } else {
            accounts.push({ userId, nickname, ts: Date.now() });
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accounts));
    },

    // Remove account
    async removeAccount(userId) {
        const accounts = this.listAccounts();
        const filtered = accounts.filter(a => a.userId !== userId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        // Close DB connection before deleting
        if (DB.db) { try { DB.db.close(); } catch(e) {} DB.db = null; }
        // Delete the IndexedDB for this account
        const dbName = DB.BASE_NAME + "_" + userId;
        try {
            const dbNames = await indexedDB.databases();
            for (const db of dbNames) {
                if (db.name === dbName) {
                    indexedDB.deleteDatabase(dbName);
                    break;
                }
            }
        } catch(e) {
            // Fallback: delete by name directly
            indexedDB.deleteDatabase(dbName);
        }
    },

    // Check if account has data (DB exists with user record)
    async hasData(userId) {
        try {
            await DB.openFor(userId);
            const user = await DB.get("user", "current", null).catch(() => null);
            return !!user;
        } catch(e) {
            return false;
        }
    },

    // Open DB for account
    async openDBFor(userId) {
        return DB.openFor(userId);
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
        const peerConfig = {
            config: {
                iceServers: [
                    { urls: 'stun:stun.chat.bilibili.com:3478' },
                    { urls: 'stun:stun.miwifi.com:3478' },
                    { urls: 'stun:stun.cloudflare.com:3478' },
                    { urls: 'stun:stun.nextcloud.com:3478' },
                    { urls: 'stun:stun.l.google.com:19302' },
                ]
            }
        };
        this.peer = new Peer(myId, peerConfig);
        this.peer.on("open", (id) => {
            console.log("[PeerConn] Peer ID assigned:", id);
            if (id !== myId) {
                console.warn("[PeerConn] ID mismatch: requested", myId, "but got", id);
            }
            callback(id);
        });

        this.peer.on("connection", async (conn) => {
            // Binary file transfer channel — handle separately
            if (conn.label && conn.label.startsWith('file-')) {
                const fileId = conn.label.slice(5); // 'file-xxx' → 'xxx'
                console.log('[PeerConn] Binary file channel from', conn.peer, 'fileId:', fileId);
                let _chunkCount = 0;
                conn.on('data', async (chunk) => {
                    let raw = chunk;
                    if (chunk instanceof Blob) raw = await chunk.arrayBuffer();
                    const arr = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
                    if (_chunkCount === 0) {
                        console.log('[BinaryDC] First chunk, dataLen:', arr.byteLength);
                    }
                        DB.bufferRawChunk(fileId, arr).catch(e => console.error('[OPFS] bufferRawChunk:', e));
                        // Track progress from DB entry
                        const entry = DB._directWriters[fileId];
                        if (entry) {
                            const ft = ChatApp.fileTransfer;
                            const info = ft.pending[fileId];
                            if (info) {
                                const rawReceived = info.totalRawReceived;
                                info.chunkCount = (info.chunkCount || 0) + 1;
                                info.totalRawReceived = (info.totalRawReceived || 0) + (arr.byteLength || arr.length);
                                const pct = info.size > 0 ? Math.min(99.9, (rawReceived / info.size * 100)).toFixed(1) : '0';
                                if (info.chunkCount % 100 === 0) {
                                    console.log(`[BinaryDC] ${info.chunkCount} chunks, ${(rawReceived/1024/1024).toFixed(1)}MB, ${pct}%`);
                                }
                                _chunkCount++;
                                if (_chunkCount % 100 === 0) {
                                    console.log(`[BinaryDC] ${_chunkCount} chunks, ${(rawReceived/1024/1024).toFixed(1)}MB, ${pct}%`);
                                }
                                ChatApp._updateTransferProgress(fileId, pct, null);
                                // Finalize when all data received AND footer arrived
                                if (info.footerReceived && rawReceived >= info.size) {
                                    ChatApp._finalizeDirectReceive(fileId);
                                }
                            }
                        }
                });
                conn.on('close', async () => {
                    console.log('[PeerConn] Binary file channel closed:', fileId);
                    // Safety net: if data complete + footer received but not finalized yet
                    const ft = ChatApp.fileTransfer;
                    const info = ft.pending[fileId];
                    if (info && info.footerReceived && info.totalRawReceived >= info.size) {
                        await ChatApp._finalizeDirectReceive(fileId);
                    }
                });
                conn.on('error', (e) => console.error('[PeerConn] Binary file channel error:', fileId, e));
                return;
            }
            console.log("[PeerConn] Incoming connection from", conn.peer);
            let myKey = null;
            const contact = ChatApp.contacts.find(c => c.userId === conn.peer);
            if (contact && contact.keypair) {
                myKey = contact.keypair;
                console.log(`[PeerConn] Receiver loaded keypair for ${conn.peer}, fp=${Crypto.keyFingerprint(myKey.publicKey)}`);
            }
            const state = { conn, myKey, peerKey: null, connected: false };
            this.peers[conn.peer] = state;
            
            // 注册 open 回调（PeerJS 要求在 connection 回调中立即注册）
            conn.on("open", () => {
                console.log(`[PeerConn] Connection opened from ${conn.peer}`);
            });
            
            this._bind(conn, conn.peer, false);
        });

        this.peer.on("call", (call) => {
            console.log("[PeerConn] Incoming call from", call.peer);
            ChatApp._onIncomingPeerCall(call);
        });

        this.peer.on("error", (err) => {
            if (err.type === "peer-unavailable") {
                console.log(`[PeerConn] ${err.message}`);
            } else {
                console.error(`[PeerConn] Error: ${err.type} ${err.message}`);
            }
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

        conn.on("close", () => {
            console.log(`[PeerConn] ${peerId} connection closed`);
            const state = this.peers[peerId];
            if (state) state.connected = false;
        });

        conn.on("error", (err) => {
            console.log(`[PeerConn] ${peerId} connection error:`, err);
        });

        conn.on("data", async (data) => {
            try {
                if (!data || !data.type) { console.log(`[PeerConn] ${peerId} data ignored (no type)`, data); return; }
                console.log(`[PeerConn] ${peerId} data type=${data.type}`, data);
                const state = this.peers[peerId];
                if (data.type === "add") {
                    console.log(`[PeerConn] ${peerId} received add request`, data);
                    // Auto-close QR modal when someone scans it
                    ChatApp.closeQRModal();
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


                        try { content = await Crypto.decryptChunks(state.myKey.privateKey, data.content); }
                        catch(e) { console.warn(`[PeerConn] RSA decrypt failed for ${peerId}, falling back to plaintext:`, e.message, '| privKeyLen:', state.myKey.privateKey.length, '| dataLen:', data.content.length); }
                    } else {
                        console.log(`[PeerConn] Not decrypting from ${peerId}, encrypted=${data.encrypted}, hasMyKey=${!!(state && state.myKey)}`);
                    }
                    ChatApp.onChatMsg(peerId, content, data.ts);
                    // Dispatch custom event for extensions
                    window.dispatchEvent(new CustomEvent('pchat-message', { detail: { peerId, content, ts: data.ts } }));
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
                } else if (data.type === "id-change") {
                    // Contact changed their ID - update contact list
                    ChatApp._onIdChangeNotification(peerId, data);
                } else if (data.type === "transfer-request" || data.type === "transfer-start" ||
                           data.type === "table-start" || data.type === "table-done" ||
                           data.type === "transfer-chunk" || data.type === "transfer-complete") {
                    // Transfer messages routed to transfer handler
                    await ChatApp._handleTransferInData(data);
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
            try { sendContent = await Crypto.encryptChunks(s.peerKey, content); }
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
        const pending = msgs.filter(m => m.direction === "sent" && !m.sent && m.content !== undefined);
        const state = this.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;
        for (const m of pending) {
            let sendContent = m.content;
            if (state.peerKey) {
                try { sendContent = await Crypto.encryptChunks(state.peerKey, m.content); }
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
        minZoom: 1,
        rotation: 0,
        panX: 0,
        panY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        zoomTimer: null,
        toolbarTimer: null,
        swipeIndex: -1,
        swipeImages: [],
    },

    // ---- Popup helpers ----
    _navStack: [],
    _pendingFriendRequest: null,

    _initBackButton() {
        const self = this;
        self._navPopping = false;
        window.addEventListener('popstate', function(e) {
            if (self._navPopping) {
                self._navPopping = false;
                return;
            }
            if (self._navStack.length > 0) {
                const item = self._navStack.pop();
                if (item.close) item.close();
            }
        });
    },

    _pushNav(closeFn) {
        this._navStack.push({ close: closeFn });
        history.pushState({ nav: this._navStack.length }, '');
    },

    _popNav() {
        if (this._navStack.length > 0) {
            this._navStack.pop();
            this._navPopping = true;
            history.back();
        }
    },

    showAlert(text) {
        document.getElementById('alert-text').textContent = text;
        this._show('alert-modal');
        this._pushNav(() => this._closeAlertModal());
    },

    _closeAlert() {
        this._popNav();
        this._hide('alert-modal');
    },

    _closeAlertModal() {
        this._popNav();
        this._hide('alert-modal');
    },

    // ---- Delete confirm popup ----
    _deleteConfirmUserId: null,

    async _showDeleteConfirm(userId) {
        const modal = document.getElementById("delete-confirm-modal");
        if (!modal) return;

        const titleEl = document.getElementById("delete-confirm-title");
        const descEl = document.getElementById("delete-confirm-desc");
        const pwInput = document.getElementById("delete-confirm-password");
        const cancelBtn = document.getElementById("delete-confirm-cancel");
        const okBtn = document.getElementById("delete-confirm-ok");

        if (titleEl) titleEl.textContent = _i18n.t('pchat.login.btn.deleteAccount');
        if (descEl) descEl.textContent = _i18n.t('pchat.msg.deleteConfirm');
        if (pwInput) pwInput.value = '';

        this._deleteConfirmUserId = userId;

        // 移除旧监听，避免重复绑定
        const newCancelBtn = cancelBtn ? cancelBtn.cloneNode(true) : null;
        const newOkBtn = okBtn ? okBtn.cloneNode(true) : null;
        if (cancelBtn && newCancelBtn) cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        if (okBtn && newOkBtn) okBtn.parentNode.replaceChild(newOkBtn, okBtn);

        this._show("delete-confirm-modal");
        this._pushNav(() => this._hide("delete-confirm-modal"));

        const finalCancel = document.getElementById("delete-confirm-cancel");
        const finalOk = document.getElementById("delete-confirm-ok");
        const finalPw = document.getElementById("delete-confirm-password");

        if (finalCancel) {
            finalCancel.onclick = () => { this._popNav(); this._hide("delete-confirm-modal"); };
        }
        if (finalOk) {
            finalOk.onclick = () => this._handleDeleteConfirm();
        }
        if (finalPw) {
            finalPw.onkeydown = (e) => { if (e.key === "Enter") this._handleDeleteConfirm(); };
        }

        setTimeout(() => { if (finalPw) finalPw.focus(); }, 100);
    },

    async _handleDeleteConfirm() {
        const pwInput = document.getElementById("delete-confirm-password");
        const inputPw = pwInput ? pwInput.value : '';

        if (!inputPw) {
            this.showAlert(_i18n.t('pchat.alert.enterPassword'));
            return;
        }

        const userId = this._deleteConfirmUserId;
        try {
            // 用密码派生密钥，尝试读取 user 记录验证密码
            await DB.openFor(userId);
            const testKey = await Crypto.deriveAesKey(inputPw);
            const user = await DB.get("user", "current", testKey);
            if (user && user.userId) {
                // 密码正确，执行删除
                this._hide("delete-confirm-modal");
                AccountManager.removeAccount(userId);
                this.init();
            } else {
                this.showAlert(_i18n.t('pchat.alert.passwordError'));
                if (pwInput) pwInput.value = '';
            }
        } catch (err) {
            this.showAlert(_i18n.t('pchat.alert.passwordError'));
            if (pwInput) pwInput.value = '';
        }
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
        console.log(`[PeerConn] Showing friend request card for ${nickname}`);
        const card = document.getElementById('friend-request-card');
        console.log(`[PeerConn] friend-request-card element:`, card);
        if (card) {
            document.getElementById('friend-request-nick').textContent = nickname;
            document.getElementById('friend-request-id').textContent = peerId;
            card.style.display = 'block';
            console.log(`[PeerConn] Card display set to:`, card.style.display);
        } else {
            console.warn(`[PeerConn] friend-request-card not found in DOM!`);
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
        // Version and debug info
        console.log('[PChat] init() - Version: ' + (typeof PCHAT_VERSION !== 'undefined' ? PCHAT_VERSION : 'unknown'));
        // Debug: check if corner-btn styles exist
        try {
            var sheets = document.styleSheets;
            for (var s = 0; s < sheets.length; s++) {
                try {
                    var rules = sheets[s].cssRules || sheets[s].rules;
                    for (var r = 0; r < rules.length; r++) {
                        if (rules[r].selectorText && rules[r].selectorText.indexOf('corner-btn') !== -1) {
                            console.log('[PChat] Found corner-btn rule: ' + rules[r].selectorText);
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {
            console.warn('[PChat] Style check failed:', e);
        }

        this._initBackButton();

        _i18n.applyUI();

        // Parse invite link from URL hash
        const hash = location.hash.slice(1);
        let pendingInviteId = null;
        if (hash.startsWith("invite-")) {
            pendingInviteId = hash.slice(7);
        }

        // Load account list
        const accounts = AccountManager.listAccounts();
        this._show("setup-panel");

        // Render account list
        const accountList = document.getElementById("account-list");
        if (accountList) {
            accountList.innerHTML = "";
            if (accounts.length > 0) {
                const listEl = document.getElementById("account-select-panel");
                if (listEl) listEl.style.display = "block";
                
                for (const acc of accounts) {
                    const div = document.createElement("div");
                    div.className = "account-item";
                    div.innerHTML = `
                        <div class="account-info">
                            <span class="account-nickname">${acc.nickname}</span>
                            <span class="account-id">${acc.userId}</span>
                        </div>
                        <div class="account-actions">
                            <button class="account-delete-btn" data-id="${acc.userId}" title="${_i18n.t('pchat.login.btn.deleteAccount')}">×</button>
                        </div>
                    `;
                    div.querySelector(".account-info").onclick = () => {
                        // Select this account
                        document.querySelectorAll(".account-item").forEach(el => el.classList.remove("selected"));
                        div.classList.add("selected");
                        this._selectedAccountId = acc.userId;
                        // Show password input
                        const pwForm = document.getElementById("login-password-panel");
                        if (pwForm) pwForm.style.display = "block";
                    };
                    div.querySelector(".account-delete-btn").onclick = (e) => {
                        e.stopPropagation();
                        const pwFormDel = document.getElementById("login-password-panel");
                        if (pwFormDel) pwFormDel.style.display = "none";
                        this._showDeleteConfirm(acc.userId);
                    };
                    accountList.appendChild(div);
                }
            } else {
                const listEl = document.getElementById("account-select-panel");
                if (listEl) listEl.style.display = "none";
            }
        }

        // Show register form if no accounts or invite link
        const regForm = document.getElementById("invite-info");
        if (regForm) {
            if (accounts.length === 0 || pendingInviteId) {
                regForm.style.display = "block";
                if (pendingInviteId) {
                    this.pendingInviteId = pendingInviteId;
                    localStorage.removeItem("mr_invite");
                    const inviteEl = document.getElementById("invite-from");
                    if (inviteEl) {
                        inviteEl.textContent = _i18n.fmt('pchat.register.inviteFrom', 'id', pendingInviteId);
                        inviteEl.style.display = "block";
                    }
                }
            } else {
                regForm.style.display = "none";
            }
        }

        // Show corner buttons
        const transferBtn = document.getElementById("transfer-out-btn");
        const newAccBtn = document.getElementById("new-account-btn");
        if (transferBtn) {
            transferBtn.style.display = accounts.length > 0 ? "inline-block" : "none";
        }
        if (newAccBtn) {
            newAccBtn.style.display = "inline-block";
        }

        this._bindEvents();

        // Hide voice features in non-secure context
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
        } else if (el.classList.contains('modal')) {
            el.classList.add('show');
            el.style.display = 'flex';
        } else {
            el.style.display = "block";
        }
    },
    _hide(id) {
        const el = document.getElementById(id);
        el.style.display = "none";
        el.classList.remove('show');
    },

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
        this.my.aesKey = verifyKey;
        this.my.password = pw;

        // Open DB for this account
        this._showLoading(70, _i18n.t('pchat.loading.openDB'));
        await DB.openFor(this.my.id);

        this._showLoading(80, _i18n.t('pchat.loading.saveUser'));
        await DB.put("user", { id: "current", userId: this.my.id, nickname: nick, ts: Date.now(), cachedKey: this.my.aesKey }, verifyKey);

        // Save to account list
        AccountManager.addAccount(this.my.id, nick);

        // 保存邀请人 ID（PeerJS 初始化后发送好友请求）
        const inv = JSON.parse(localStorage.getItem("mr_invite") || "null");
        if (inv && inv.inviterId) this.pendingInviteId = inv.inviterId;
        localStorage.removeItem("mr_invite");
        location.hash = "";

        this._hideLoading();

        this._hide("setup-panel");
        this._hide("invite-info");
        var deleteBtn = document.getElementById("delete-account-btn");
        if (deleteBtn) deleteBtn.style.display = "none";
        this._navStack = [];
        this._show("main-panel");

        document.getElementById("my-nickname").textContent = nick;
        document.getElementById("my-id-display").textContent = this.my.id;

        this._initPeer();
        this._renderContacts();
        this._renderGroups();

        // Write login token + start heartbeat
        this._writeLoginToken();
        this._startLoginHeartbeat();
    },

    // ---- Login (existing user) ----
    async loginUser() {
        const pw = document.getElementById("login-password-input").value;
        if (!pw) { this.showAlert(_i18n.t('pchat.alert.enterPassword')); return; }

        // Check if account is selected
        if (!this._selectedAccountId) {
            this.showAlert(_i18n.t('pchat.alert.selectAccount'));
            return;
        }

        const btn = document.getElementById("login-btn");
        const origText = btn ? btn.textContent : _i18n.t('pchat.login.btn.loggingIn');
        if (btn) { btn.textContent = _i18n.t('pchat.login.btn.loggingIn'); btn.disabled = true; }
        this._showLoading(5, _i18n.t('pchat.loading.verify'));

        try {
            // Open DB for selected account
            this._showLoading(10, _i18n.t('pchat.loading.openDB'));
            await DB.openFor(this._selectedAccountId);

            // Verify password
            this._showLoading(30, _i18n.t('pchat.loading.deriveVerifyKey'));
            const testKey = await Crypto.deriveAesKey(pw);

            this._showLoading(50, _i18n.t('pchat.loading.readUser'));
            const user = await DB.get("user", "current", testKey);
            if (!user || !user.userId) {
                this._hideLoading();
                if (btn) { btn.textContent = origText; btn.disabled = false; }
                this.showAlert(_i18n.t('pchat.alert.passwordError'));
                return;
            }

            this.my.id = user.userId;
            this.my.nickname = user.nickname;

            if (user.cachedKey) {
                this._showLoading(70, _i18n.t('pchat.loading.useCachedKey'));
                this.my.aesKey = user.cachedKey;
            } else {
                this._showLoading(70, _i18n.t('pchat.loading.deriveDataKey'));
                this.my.aesKey = testKey;
            }
            this.my.password = pw;

            this._showLoading(85, _i18n.t('pchat.loading.loadContacts'));
            this.contacts = await DB.list("contacts", this.my.aesKey);
            console.log(`[Login] Loaded ${this.contacts.length} contacts:`, this.contacts.map(c => ({ id: c.userId, nick: c.nickname, pk: !!c.publicKey })));

            this._showLoading(95, _i18n.t('pchat.loading.loadGroups'));
            this.groups = await DB.list("groups", this.my.aesKey);

            this._showLoading(97, 'Migrating images...');
            await this._migrateImageMessages();

            this._showLoading(100, _i18n.t('pchat.loading.done'));

            this._hideLoading();
            if (btn) { btn.textContent = origText; btn.disabled = false; }

            this._hide("setup-panel");
            this._navStack = [];
            this._show("main-panel");

            document.getElementById("my-nickname").textContent = this.my.nickname;
            document.getElementById("my-id-display").textContent = this.my.id;

            this._initPeer();
            this._renderContacts();
            this._renderGroups();

            // Write login token to localStorage (cross-tab same-identity detection)
            this._writeLoginToken();
            this._startLoginHeartbeat();
        } catch (e) {
            this._hideLoading();
            if (btn) { btn.textContent = origText; btn.disabled = false; }
            this.showAlert(_i18n.t('pchat.alert.passwordError'));
        }
    },

    // ---- Migrate old image messages to new thumbnail + files store structure ----
    async _migrateImageMessages() {
        const messages = await DB.list("messages", this.my.aesKey);
        const imageMsgs = messages.filter(m => m.type === "image" && m.fileData && !m.fileId);
        if (imageMsgs.length === 0) return;
        console.log(`[Migrate] Found ${imageMsgs.length} image messages without fileId, migrating...`);

        // Use requestAnimationFrame to avoid blocking UI
        await new Promise((resolve) => {
            let i = 0;
            const processNext = async () => {
                if (i >= imageMsgs.length) {
                    console.log(`[Migrate] Done migrating ${imageMsgs.length} image messages`);
                    resolve();
                    return;
                }
                try {
                    const msg = imageMsgs[i];
                    const fileId = `file_migrated_${msg.id}`;
                    const thumb = await DB.generateThumbnail(msg.fileData, msg.mimeType || "image/png", 200);

                    // Store full image in files store
                    await DB.putFile(fileId, msg.fileData, msg.mimeType || "image/png", this.my.aesKey);

                    // Update message: keep only thumbnail, add fileId reference
                    if (thumb) {
                        msg.fileData = thumb;
                    }
                    msg.fileId = fileId;
                    msg.mimeType = msg.mimeType || "image/png";
                    await DB.put("messages", msg, this.my.aesKey);
                    console.log(`[Migrate] Migrated msg ${msg.id} (${i + 1}/${imageMsgs.length})`);
                } catch (e) {
                    console.warn(`[Migrate] Failed to migrate msg ${imageMsgs[i]?.id}:`, e);
                }
                i++;
                // Yield to UI thread between each migration
                requestAnimationFrame(processNext);
            };
            processNext();
        });
    },

    // ---- Delete account (clear all data) ----
    // DEPRECATED: use _showDeleteConfirm() instead
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
        try {
            const delTx = DB.db.transaction("contacts", "readwrite");
            const delStore = delTx.objectStore("contacts");
            delStore.delete("contact_" + userId);
            await new Promise((resolve, reject) => {
                delTx.oncomplete = () => resolve();
                delTx.onerror = () => reject(delTx.error);
            });
        } catch {}
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
            
            // Check if ID was taken by someone else
            if (id !== this.my.id) {
                console.warn("[PeerConn] ID conflict: your ID", this.my.id, "is taken");
                const oldId = this.my.id;
                const peer = PeerConn.peer;
                if (peer) peer.destroy();
                
                // Ask user if they want to change ID
                const confirmed = confirm(_i18n.fmt('pchat.alert.idConflict', 'id', oldId));
                if (!confirmed) {
                    // User declined - return to login
                    this._show('setup-panel');
                    this._hide('main-panel');
                    return;
                }
                
                // Change ID
                await this._changeMyId(oldId);
                // Notify contacts after ID change (will happen after PeerJS is ready)
                this._notifyIdChange(oldId);
                return;
            }
            
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

    // ---- Change my ID (emergency when ID is taken) ----
    async _changeMyId(oldId) {
        console.log("[IDChange] Changing ID from", oldId);
        const newId = Crypto.generateId();
        console.log("[IDChange] New ID:", newId);
        
        // Update user record (aesKey stays the same, only ID changes)
        this.my.id = newId;
        await DB.put("user", {
            id: "current",
            userId: newId,
            nickname: this.my.nickname,
            ts: Date.now(),
            cachedKey: this.my.aesKey
        }, this.my.aesKey);
        
        // Update UI
        document.getElementById("my-id-display").textContent = newId;
        
        // Re-init PeerJS with new ID
        this._initPeer();
    },

    // ---- Notify contacts about ID change ----
    async _notifyIdChange(oldId) {
        console.log("[IDChange] Notifying contacts of ID change");
        for (const c of this.contacts) {
            if (!c.publicKey) continue;
            
            try {
                const payload = JSON.stringify({
                    type: "id-change",
                    oldId: oldId,
                    newId: this.my.id,
                    timestamp: Date.now()
                });
                
                const encrypted = await Crypto.encryptWithPubkey(c.publicKey, payload);
                
                // Try to connect and send (if online)
                const state = await PeerConn.connect(c.userId);
                if (state && state.conn && state.conn.open) {
                    state.conn.send({
                        type: "id-change",
                        fromId: this.my.id,
                        encrypted: encrypted
                    });
                    console.log(`[IDChange] Sent to ${c.userId}`);
                }
            } catch (e) {
                console.warn(`[IDChange] Failed to notify ${c.userId}:`, e.message);
            }
        }
        
        // Show success message
        this.showAlert(_i18n.fmt('pchat.alert.idChanged', 'id', this.my.id));
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

    // ---- Copy ID prompt ----
    copyIdPrompt() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this.my.id).then(() => {
                this.showAlert(_i18n.fmt('pchat.alert.idCopied', 'id', this.my.id));
            }).catch(() => this._showIdFallback());
        } else {
            this._showIdFallback();
        }
    },

    _showIdFallback() {
        this.showAlert(_i18n.fmt('pchat.alert.idCopyManual', 'id', this.my.id));
    },

    // ---- Show my ID QR code ----
    showMyQR() {
        const container = document.getElementById('qr-canvas');
        if (!container) return;
        container.innerHTML = '';
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: this.my.id,
                width: 240,
                height: 240,
                colorDark: '#000000',
                colorLight: '#ffffff'
            });
        }
        this._show('qr-modal');
        this._pushNav(() => this.closeQRModal());
    },

    closeQRModal() {
        this._popNav();
        this._hide('qr-modal');
    },

    // ---- Scan QR code to add friend ----
    scanStream: null,
    scanAnimFrame: null,

    async showScanModal() {
        this._show('scan-modal');
        this._pushNav(() => this.closeScanModal());
        const video = document.getElementById('scan-video');
        const canvas = document.getElementById('scan-canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('scan-status');
        if (status) status.textContent = '';

        try {
            this.scanStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = this.scanStream;
            await video.play();

            const scan = (resolveScan) => {
                if (!video.srcObject) return;
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    const id = code.data.trim();
                    console.log('[Scan] QR detected:', id);
                    if (id && id !== this.my.id) {
                        this.scanAnimFrame = null; // prevent further scans
                        
                        // Check if in transfer-in scan mode
                        if (this._transferInScanMode) {
                            // Transfer mode: route to transfer handler
                            if (this._handleTransferInScanResult(id)) {
                                // Stop camera and close modal
                                if (this.scanStream) {
                                    this.scanStream.getTracks().forEach(t => t.stop());
                                    this.scanStream = null;
                                }
                                if (video) video.srcObject = null;
                                if (video) video.style.display = 'none';
                                if (status) {
                                    status.innerHTML = '<svg width="80" height="80" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#4caf50" stroke-width="2.5"/><polyline points="10,16 14,21 23,11" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                                    status.style.fontSize = '80px';
                                    status.style.color = '#4caf50';
                                }
                                setTimeout(() => {
                                    this.closeScanModal();
                                    if (video) video.style.display = '';
                                    if (status) {
                                        status.textContent = '';
                                        status.style.fontSize = '12px';
                                        status.style.color = '#888';
                                    }
                                }, 1000);
                            }
                            return;
                        }
                        
                        // Auto-detect transfer ID from normal scan
                        if (id.startsWith("transfer_")) {
                            console.log('[Scan] Auto-detect transfer ID:', id);
                            this.transferInConnect(id);
                            // Stop camera
                            if (this.scanStream) {
                                this.scanStream.getTracks().forEach(t => t.stop());
                                this.scanStream = null;
                            }
                            if (video) { video.srcObject = null; video.style.display = 'none'; }
                            if (status) {
                                status.innerHTML = '<svg width="80" height="80" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#4caf50" stroke-width="2.5"/><polyline points="10,16 14,21 23,11" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                                status.style.fontSize = '80px';
                                status.style.color = '#4caf50';
                            }
                            setTimeout(() => {
                                this.closeScanModal();
                                if (video) video.style.display = '';
                                if (status) { status.textContent = ''; status.style.fontSize = '12px'; status.style.color = '#888'; }
                            }, 1000);
                            return;
                        }

                        // Normal mode: add friend
                        if (id.startsWith("transfer_")) {
                            console.warn('[Scan] BUG: transfer_ ID reached _requestFriend — auto-detect not working!');
                        }
                        this._requestFriend(id);
                        // Stop camera
                        if (this.scanStream) {
                            this.scanStream.getTracks().forEach(t => t.stop());
                            this.scanStream = null;
                        }
                        if (video) video.srcObject = null;
                        // Show success icon (green ✓), hide video
                        if (video) {
                            video.style.display = 'none';
                            video.srcObject = null;
                        }
                        if (status) {
                            status.innerHTML = '<svg width="80" height="80" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="#4caf50" stroke-width="2.5"/><polyline points="10,16 14,21 23,11" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                            status.style.fontSize = '80px';
                            status.style.color = '#4caf50';
                        }
                        // After 2s, close modal
                        setTimeout(() => {
                            this.closeScanModal();
                            if (video) video.style.display = '';
                            if (status) {
                                status.textContent = '';
                                status.style.fontSize = '12px';
                                status.style.color = '#888';
                            }
                        }, 2000);
                        return;
                    }
                }
                this.scanAnimFrame = requestAnimationFrame(scan.bind(null, resolveScan));
            };
            this.scanAnimFrame = requestAnimationFrame(scan);
        } catch (e) {
            if (status) status.textContent = '无法访问相机';
        }
    },

    closeScanModal() {
        this._popNav();
        this._hide('scan-modal');
        if (this.scanStream) {
            this.scanStream.getTracks().forEach(t => t.stop());
            this.scanStream = null;
        }
        if (this.scanAnimFrame) {
            cancelAnimationFrame(this.scanAnimFrame);
            this.scanAnimFrame = null;
        }
        const video = document.getElementById('scan-video');
        if (video) video.srcObject = null;
    },

    // ---- Create group modal ----
    showCreateGroupModal() {
        this._show("create-room-modal");
        this._pushNav(() => this.closeModals());
        const list = document.getElementById("member-checklist");
        list.innerHTML = "";
        for (const c of this.contacts) {
            const label = document.createElement("label");
            label.innerHTML = `<input type="checkbox" value="${c.userId}"> ${c.nickname || c.userId}`;
            list.appendChild(label);
        }
    },

    closeModals() {
        this._popNav();
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

        if (id.startsWith("transfer_")) {
            // Route transfer IDs to transfer-in flow (uses main PeerJS)
            document.getElementById("add-friend-input").value = "";
            this.transferInConnect(id);
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
        if (!content || typeof content === 'string' && !content.trim() || content === "undefined") return;
        const now = ts || Date.now();
        const id = `msg_${peerId}_${now}_${Date.now()}`;
        
        // Check for HTML marker
        const isHtml = content.startsWith('[HTML]');
        const rawContent = isHtml ? content.substring(6) : content;
        
        const msg = { id, peerId, content: rawContent, ts: now, direction: "received", fromId: peerId, isHtml };
        await DB.put("messages", msg, this.my.aesKey);
        if (this.activeConv && this.activeConv.id === peerId) {
            this._appendMsg(msg);
        }
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = { content: rawContent, ts: now, fromId: peerId, isHtml };
            this.saveContact(contact);
        }
        if (!(this.activeConv && this.activeConv.id === peerId)) {
            this.unreadCount[peerId] = (this.unreadCount[peerId] || 0) + 1;
        }
        this._renderContacts();
    },

    // ---- Handle incoming receipt ----
    // ---- Handle ID change notification ----
    async _onIdChangeNotification(senderId, data) {
        console.log("[IDChange] Got notification from", senderId);
        try {
            // Decrypt the payload using sender's private key
            const senderContact = this.contacts.find(c => c.userId === senderId);
            if (!senderContact || !senderContact.keypair) {
                console.warn("[IDChange] No keypair available for", senderId);
                return;
            }
            const myPrivKey = senderContact.keypair.privateKey;
            
            const decrypted = await Crypto.decryptWithPrivkey(myPrivKey, data.encrypted);
            const payload = JSON.parse(decrypted);
            
            if (payload.type !== "id-change") {
                console.warn("[IDChange] Invalid payload type");
                return;
            }
            
            // Find contact by oldId (the sender's previous ID)
            const oldId = payload.oldId;
            const newId = payload.newId;
            const contact = this.contacts.find(c => c.userId === oldId);
            
            if (!contact) {
                console.warn("[IDChange] No contact found for oldId", oldId);
                return;
            }
            
            // Update contact's userId
            contact.userId = newId;
            await DB.put("contacts", contact, this.my.aesKey);
            
            // Update in-memory contacts
            this.contacts = await DB.list("contacts", this.my.aesKey);
            
            // Re-render UI
            this._renderContacts();
            
            // Add system message to current conversation
            const nick = contact.nickname || oldId;
            this.showAlert(_i18n.fmt('pchat.msg.idChanged', 'name', nick, 'oldId', oldId));
            
            console.log(`[IDChange] Updated ${oldId} → ${newId}`);
        } catch (e) {
            console.warn("[IDChange] Failed to process:", e.message);
        }
    },

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
        const conv = (await DB.listMessagesByPeer(convId, this.my.aesKey)).filter(m => !(m.content === "undefined" && !m.type));
        this.currentMessages = conv;
        const container = document.getElementById("message-list");
        container.innerHTML = "";
        container.onclick = (e) => {
            const img = e.target.closest('.img-thumb');
            if (img) {
                const msgEl = img.closest('.message-row');
                const msgId = msgEl?.dataset?.msgId || img.dataset.msgId;
                const fileId = img.dataset.fileId;
                this._openImageFromDb(msgId, fileId, img.dataset.mime);
                return;
            }
        };
        for (const m of conv) this._appendMsg(m);
        this._scroll();
    },

    // ---- Voice Message Receive ----
    async onVoiceMsg(peerId, base64data, ts, duration) {
        const now = ts || Date.now();
        const id = `msg_${peerId}_${now}_voice_${Date.now()}`;
        const msg = { id, peerId, content: base64data, ts: now, direction: "received", fromId: peerId, type: "voice", duration };
        await DB.put("messages", msg, this.my.aesKey);
        if (this.activeConv && this.activeConv.id === peerId) {
            this._appendMsg(msg);
        }
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
        const info = {
            peerId,
            name: d.name,
            mime: d.mime,
            size: d.size,
            isImage: d.isImage,
            directTransfer: !!d.directTransfer,
        };

        if (d.directTransfer) {
            info.expectedBase64Len = -1;
            info.expectedHash = '';
            info.totalChunks = -1;
            info.chunkCount = 0;
            info.totalBase64Received = 0;
            info.totalRawReceived = 0;
            info.lastAckBytes = 0;
            console.log(`[File] DIRECT header: ${d.name} (${(d.size/1024/1024).toFixed(1)}MB)`);
            DB.openDirectFile(d.fileId, d.name).catch(e => console.error('[OPFS] openDirectFile failed:', e));
            ChatApp._insertTransferCard(d.fileId, d.name, d.size, false);
        } else {
            info.parts = new Array(d.totalChunks);
            info.totalChunks = d.totalChunks;
            info.chunkCount = 0;
            info.expectedBase64Len = d.base64Len || 0;
            info.expectedHash = d.hash || "";
            console.log(`[File] Header received: ${d.name} (${d.size}B, ${d.totalChunks} chunks, hash=${d.hash ? d.hash.slice(0,8)+'...' : 'none'})`);
        }
        ft.pending[d.fileId] = info;
    },

    // ---- File receive: chunk ----
    _onFileChunk(d) {
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (!info) return;

        if (info.directTransfer) {
            // Direct transfer: write chunk to OPFS immediately
            DB.writeDirectChunk(d.fileId, d.data).catch(e => console.error('[OPFS] writeDirectChunk failed:', e));
            info.chunkCount++;
            info.totalBase64Received = (info.totalBase64Received || 0) + (d.data ? d.data.length : 0);
            // Estimate progress: base64 is ~4/3 of raw bytes
            const estPct = info.size > 0 ? Math.min(99, Math.round(info.totalBase64Received * 0.75 / info.size * 100)) : 0;
            ChatApp._updateTransferProgress(d.fileId, estPct, null);

            // Send intermediate ack every ~10MB received (raw estimate)
            const rawReceived = Math.round(info.totalBase64Received * 0.75);
            const lastAckAt = info.lastAckBytes || 0;
            if (rawReceived - lastAckAt >= 10 * 1024 * 1024) {
                info.lastAckBytes = rawReceived;
                const ackPeer = PeerConn.peers[info.peerId];
                if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
                    ackPeer.conn.send({ type: "file-ack", fileId: d.fileId, progress: Math.round(rawReceived / info.size * 100) });
                }
            }
            return;
        }

        if (info.parts[d.index]) return; // duplicate
        info.parts[d.index] = d.data;
        info.chunkCount++;
    },

    // ---- File receive: footer (all chunks assembled) ----
    async _onFileFooter(peerId, d) {
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (!info) return;

        if (info.directTransfer) {
            console.log(`[File] DIRECT footer for ${info.name}`);
            if (info.binaryChannel) {
                info.footerReceived = true;
                console.log(`[File] Footer check: rawReceived=${info.totalRawReceived}, fileSize=${info.size}`);
                if (info.totalRawReceived >= info.size) {
                    await ChatApp._finalizeDirectReceive(d.fileId);
                }
                return;
            }
            // Legacy base64 direct transfer
            console.log(`[File] DIRECT footer for ${info.name}, closing OPFS`);
            await DB.closeDirectFile(d.fileId);
            delete ft.pending[d.fileId];

            ChatApp._finishTransferCard(d.fileId, d.fileId, info.name, false);

            const now = Date.now();
            const id = `msg_${peerId}_${now}_${Math.random().toString(36).slice(2,6)}`;
            const msg = {
                id, peerId, ts: now,
                direction: "received", fromId: peerId,
                type: "direct-file",
                fileName: info.name, mimeType: info.mime, fileSize: info.size,
                fileId: d.fileId,
            };
            await DB.putRaw("messages", msg);

            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) {
                contact.lastMessage = {
                    content: _i18n.t('pchat.file.prefixFile') + ' ' + info.name,
                    ts: now, fromId: peerId,
                };
                this.saveContact(contact);
                this._renderContacts();
            }

            const ackPeer = PeerConn.peers[peerId];
            if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
                ackPeer.conn.send({ type: "file-ack", fileId: d.fileId });
            }
            return;
        }

        if (info.chunkCount < info.totalChunks) {
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

        // For images: generate thumbnail, store full in files store
        let storedData = fullBase64;
        let storedFileId = null;
        if (info.isImage) {
            storedFileId = d.fileId;
            const thumb = await DB.generateThumbnail(fullBase64, info.mime, 200);
            storedData = thumb || fullBase64;
            // Store full image in files store
            console.log('[File] Storing file aesKey fingerprint:', this.my.aesKey.substring(0, 16) + '...');
            await DB.putFile(d.fileId, fullBase64, info.mime, this.my.aesKey);
            console.log('[File] File stored, fileId:', d.fileId, 'dataLen:', fullBase64.length);
        }

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
            fileId: storedFileId,
            fileData: storedData,
        };

        // Store in DB
        console.log('[File] Storing message aesKey fingerprint:', this.my.aesKey.substring(0, 16) + '...');
        await DB.put("messages", msg, this.my.aesKey);
        console.log('[File] Message stored, msgId:', id, 'hasFileData:', !!msg.fileData, 'fileDataLen:', (msg.fileData || '').length);

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

        // Send ack back to sender so it can proceed to next file (backpressure)
        const ackState = PeerConn.peers[peerId];
        if (ackState && ackState.conn && ackState.conn.open) {
            ackState.conn.send({ type: "file-ack", fileId: d.fileId });
        }
    },

    // ---- Send message ----
    async sendMessage() {
        const input = document.getElementById("message-input");
        const content = input.value.trim();
        if (!content || !this.activeConv) return;

        // Check for HTML content marker
        const isHtml = content.startsWith('[HTML]');
        const rawContent = isHtml ? content.substring(6) : content;

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
            let anySent = false;
            for (const memberId of group.memberIds) {
                const contact = this.contacts.find(c => c.userId === memberId);
                if (contact && contact.publicKey) {
                    const sent = await PeerConn.send(memberId, content, msgId);
                    if (sent) anySent = true;
                    receipts[memberId] = sent ? Date.now() : null;
                    // 更新每个联系人的最后消息
                    contact.lastMessage = { content: rawContent, ts: now, fromId: this.my.id, isHtml };
                    this.saveContact(contact);
                }
            }
            // 全部发送失败时提示
            if (!anySent && group.memberIds.length > 0) {
                this.showAlert(_i18n.t('pchat.alert.peerOffline'));
            }
            // 存一条汇总消息
            const msg = { id: msgId, peerId: convId, content: rawContent, ts: now, direction: "sent", fromId: this.my.id, receipts, isHtml };
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
            const msg = { id, peerId: convId, content: rawContent, ts: now, direction: "sent", fromId: this.my.id, sent: sent, isHtml: isHtml };
            await DB.put("messages", msg, this.my.aesKey);
            this._appendMsg(msg);

            if (contact) {
                contact.lastMessage = { content: rawContent, ts: now, fromId: this.my.id, isHtml };
                this.saveContact(contact);
            }
            this._renderContacts();

            input.value = "";
        }
    },

    // ---- Send image file (supports multiple) ----
    async sendImage(event) {
        const files = event.target.files;
        const hasFiles = files && files.length > 0;
        const hasConv = !!this.activeConv;
        console.log('[sendImage] files=%o files.length=%d activeConv=%o', files, files?.length, this.activeConv);
        if (!hasFiles || !hasConv) {
            console.log('[sendImage] ABORT: hasFiles=%s hasConv=%s', hasFiles, hasConv);
            return;
        }
        console.log('[sendImage] OK, sending %d files', files.length);
        // Convert FileList to array to avoid mutation during iteration
        const fileArray = Array.from(files);
        event.target.value = "";
        for (const file of fileArray) {
            console.log('[sendImage] sending:', file.name);
            try {
                await this._sendFileInternal(file);
            } catch(err) {
                console.error('[sendImage] error:', err);
            }
        }
        console.log('[sendImage] all done');
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
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 32 32"><rect x="12" y="4" width="8" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><line x1="16" y1="22" x2="16" y2="28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="8" y1="28" x2="24" y2="28" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 19a10 14 0 0 0 14 0" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5"/></svg>';
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
            await DB.put("messages", msg, this.my.aesKey);
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
        // CryptoJS 内置 Base64 → WordArray 转换
        const wordArray = CryptoJS.enc.Base64.parse(base64Str);
        return CryptoJS.SHA256(wordArray).toString(CryptoJS.enc.Hex);
    },
    async _sendFileInternal(file) {
        console.log('[sendFile] start, file:', file.name, 'type:', file.type, 'size:', file.size);
        const peerId = this.activeConv.id;
        const state = PeerConn.peers[peerId];
        console.log('[sendFile] state:', state, 'conn open:', state?.conn?.open);
        if (!state || !state.conn || !state.conn.open) {
            console.log('[sendFile] peer offline, showing alert');
            this.showAlert(_i18n.t('pchat.alert.peerOfflineSend'));
            return;
        }

        const LARGE_FILE = 2 * 1024 * 1024;  // 2MB: skip encryption
        const DIRECT_FILE = 20 * 1024 * 1024; // 20MB: direct transfer, no DB
        const conn = state.conn;
        const isImage = file.type.startsWith("image/");
        const chunkSize = 262144;  // 256KB for direct transfer // 256KB for direct, 16KB for small
        const fileId = `file_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

        // Helper: ArrayBuffer → base64
        const arrayBufferToBase64 = (buffer) => {
            let binary = '';
            const bytes = new Uint8Array(buffer);
            const len = bytes.length;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return btoa(binary);
        };

        // Helper: send file metadata + chunks to peer
        const sendChunks = async (base64Data, totalSize) => {
            const totalChunks = Math.ceil(base64Data.length / chunkSize);
            const fileHash = this._hashBase64(base64Data);

            conn.send({
                type: "file-header",
                fileId, name: file.name, mime: file.type,
                size: totalSize, totalChunks, isImage,
                base64Len: base64Data.length, hash: fileHash,
            });

            for (let i = 0; i < totalChunks; i++) {
                const start = i * chunkSize;
                const end = Math.min(start + chunkSize, base64Data.length);
                conn.send({
                    type: "file-chunk", fileId, index: i,
                    data: base64Data.slice(start, end),
                });
            }

            conn.send({ type: "file-footer", fileId });
            console.log(`[File] Sent ${file.name}, waiting ack...`);

            const ackReceived = await new Promise((ackResolve) => {
                const handler = (data) => {
                    if (data.type === "file-ack" && data.fileId === fileId) {
                        clearTimeout(timer);
                        conn.off("data", handler);
                        ackResolve(true);
                    }
                };
                const timer = setTimeout(() => {
                    conn.off("data", handler);
                    console.warn(`[File] Ack timeout for ${file.name}`);
                    ackResolve(false);
                }, 120000); // 2 min for large files
                conn.on("data", handler);
            });

            if (ackReceived) {
                console.log(`[File] Ack received: ${file.name}`);
            }
            return base64Data;
        };

        // ---- Store message in DB (with optional encryption skip) ----
        const storeMsg = async (base64Data, skipEncryption) => {
            const now = Date.now();
            const id = `msg_${peerId}_${now}_${Math.random().toString(36).slice(2,6)}`;
            let thumbData = null;
            let storedFileId = null;
            let msgFileData = base64Data;

            if (isImage) {
                thumbData = await DB.generateThumbnail(base64Data, file.type, 200);
                if (skipEncryption) {
                    // Store raw in files store
                    await DB.putFileRaw(fileId, base64Data, file.type);
                } else {
                    await DB.putFile(fileId, base64Data, file.type, this.my.aesKey);
                }
                storedFileId = fileId;
                msgFileData = thumbData || base64Data;
            }

            const sentMsg = {
                id, peerId, ts: now, direction: "sent",
                fromId: this.my.id,
                type: isImage ? "image" : "file",
                fileName: file.name, mimeType: file.type, fileSize: file.size,
                fileId: storedFileId,
                fileData: msgFileData,
            };

            if (skipEncryption) {
                await DB.putRaw("messages", sentMsg);
            } else {
                await DB.put("messages", sentMsg, this.my.aesKey);
            }
            this._appendMsg(sentMsg);

            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) {
                contact.lastMessage = {
                    content: (isImage ? _i18n.t('pchat.file.prefixImage') : _i18n.t('pchat.file.prefixFile')) + ' ' + file.name,
                    ts: now, fromId: this.my.id,
                };
                this.saveContact(contact);
            }
            this._renderContacts();
        };

        // ======== Main flow ========
        if (file.size > DIRECT_FILE) {
            // >20MB: dedicated binary data channel — zero encoding overhead
            console.log(`[File] DIRECT transfer (${(file.size/1024/1024).toFixed(1)}MB), binary DC, 10MB segments`);
            const segSize = 10 * 1024 * 1024;
            let offset = 0;

            // Open dedicated binary data channel
            const fileConn = PeerConn.peer.connect(peerId, {
                label: 'file-' + fileId,
                serialization: 'binary',
                reliable: true,
            });
            await new Promise((resolve, reject) => {
                fileConn.on('open', resolve);
                fileConn.on('error', reject);
                setTimeout(() => reject(new Error('Binary channel timeout')), 15000);
            });
            console.log('[File] Binary DC opened');

            // Send header on main JSON channel
            conn.send({
                type: "file-header",
                fileId, name: file.name, mime: file.type,
                size: file.size, totalChunks: -1, isImage: false,
                directTransfer: true, binaryChannel: true,
            });

            this._insertTransferCard(fileId, file.name, file.size, true);

            // Send all chunks in one pass with pacing
            let totalSent = 0;
            try {
                while (offset < file.size) {
                    const seg = file.slice(offset, offset + segSize);
                    const segBuf = await new Promise((resolve, reject) => {
                        const r = new FileReader();
                        r.onload = (e) => resolve(new Uint8Array(e.target.result));
                        r.onerror = reject;
                        r.readAsArrayBuffer(seg);
                    });

                    let batchCount = 0;
                    for (let i = 0; i < segBuf.length; i += chunkSize) {
                        const end = Math.min(i + chunkSize, segBuf.length);
                        fileConn.send(segBuf.slice(i, end));
                        batchCount++;
                        if (batchCount >= 8) {
                            batchCount = 0;
                            await new Promise(r => setTimeout(r, 50));
                        }
                    }
                    offset += segSize;
                    totalSent = offset;
                    const pct = (offset / file.size * 100).toFixed(1);
                    console.log(`[File] Sent ${(offset/1024/1024).toFixed(0)}MB (${pct}%)`);
                    this._updateTransferProgress(fileId, parseFloat(pct), `发送中 ${pct}%`);
                }
                await new Promise(r => setTimeout(r, 200));
            } catch(e) {
                console.error('[File] Binary send error:', e);
                fileConn.close();
                return;
            }

            // DON'T close binary channel yet — let receiver finish processing
            // Send footer, wait for ack, then close
            conn.send({ type: "file-footer", fileId });
            console.log(`[File] All ${(totalSent/1024/1024).toFixed(0)}MB sent, waiting for receiver...`);
            this._updateTransferProgress(fileId, 100, '等待对方确认...');

            const finalOk = await new Promise((ackResolve) => {
                const handler = (data) => {
                    if (data.type === "file-ack" && data.fileId === fileId) {
                        clearTimeout(timer);
                        conn.off("data", handler);
                        const ackPct = data.progress != null ? data.progress : 100;
                        ChatApp._updateTransferProgress(fileId, ackPct, `对方已接收 ${ackPct}%`);
                        ackResolve(true);
                    }
                };
                const timer = setTimeout(() => {
                    conn.off("data", handler);
                    ackResolve(false);
                }, 600000);
                conn.on("data", handler);
            });

            fileConn.close();  // close only after receiver confirms
            if (finalOk) {
                console.log(`[File] Ack received: ${file.name}`);
            }
            this._finishTransferCard(fileId, fileId, file.name, true);

            // Store metadata-only message (no fileData — receiver gets it from OPFS)
            const now = Date.now();
            const id = `msg_${peerId}_${now}_${Math.random().toString(36).slice(2,6)}`;
            const sentMsg = {
                id, peerId, ts: now, direction: "sent",
                fromId: this.my.id,
                type: "direct-file",
                fileName: file.name, mimeType: file.type, fileSize: file.size,
                fileId,
            };
            await DB.putRaw("messages", sentMsg);
            // Don't _appendMsg — the transfer progress card IS the message

            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) {
                contact.lastMessage = {
                    content: _i18n.t('pchat.file.prefixFile') + ' ' + file.name,
                    ts: now, fromId: this.my.id,
                };
                this.saveContact(contact);
            }
            this._renderContacts();
            console.log(`[File] DIRECT transfer sent: ${file.name}`);
            return;
        }

        if (file.size > LARGE_FILE) {
            // >2MB: ArrayBuffer (no base64 doubling), skip encryption
            console.log(`[File] Large file (${(file.size/1024/1024).toFixed(1)}MB), using ArrayBuffer, skipping encryption`);
            const buffer = await new Promise((resolve, reject) => {
                const r = new FileReader();
                r.onload = (e) => {
                    if (!e.target.result) return reject(new Error('Read failed'));
                    resolve(e.target.result);
                };
                r.onerror = (e) => reject(e);
                r.readAsArrayBuffer(file);
            });
            const base64 = arrayBufferToBase64(buffer);
            console.log(`[File] Read complete, base64 length=${base64.length}`);
            await sendChunks(base64, file.size);
            await storeMsg(base64, true);
            console.log(`[File] Done: ${file.name}`);
            return;
        }

        // ≤2MB: legacy base64 approach with encryption
        console.log(`[File] Small file (${(file.size/1024).toFixed(1)}KB), base64 + encryption`);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const result = e.target.result;
                if (!result || typeof result !== 'string') {
                    console.error('[File] FileReader returned invalid result:', result);
                    this.showAlert(_i18n.t('pchat.alert.fileReadFail'));
                    resolve();
                    return;
                }
                const commaIdx = result.indexOf(',');
                const base64 = commaIdx >= 0 ? result.substring(commaIdx + 1) : result;
                if (!base64) {
                    console.error('[File] Empty base64 data');
                    this.showAlert(_i18n.t('pchat.alert.fileReadFail'));
                    resolve();
                    return;
                }
                console.log(`[File] Read complete, base64 length=${base64.length}`);
                await sendChunks(base64, file.size);
                await storeMsg(base64, false);
                resolve();
            };
            reader.onerror = (e) => {
                console.error('[File] FileReader error:', e);
                this.showAlert(_i18n.t('pchat.alert.fileReadFail'));
                resolve();
            };
            reader.readAsDataURL(file);
        });
    },

    // ---- Open conversation ----
    openConversation(type, id) {
        console.log(`[Chat] Opening conversation: ${type} ${id}`);
        this._pushNav(() => this.closeChatView());
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
        this._popNav();
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
        const conv = (await DB.listMessagesByPeer(peerId, this.my.aesKey)).filter(m => !(m.content === "undefined" && !m.type));
        const imgCount = conv.filter(m => m.type === 'image').length;
        console.log(`[Chat] Messages for ${peerId}: ${conv.length} total, ${imgCount} images, aesKey fingerprint: ${this.my.aesKey.substring(0, 16)}...`);
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
                const fileId = img.dataset.fileId;
                this._openImageFromDb(msgId, fileId, img.dataset.mime);
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
        // Push to currentMessages ONLY for new real-time messages (not during _loadMessages which already sets currentMessages)
        if (this.activeConv && msg.peerId === this.activeConv.id && this.currentMessages) {
            if (!this.currentMessages.find(m => m.id === msg.id)) {
                this.currentMessages.push(msg);
            }
        }
        const list = document.getElementById("message-list");
        // System messages (call logs, etc.) — no bubble, no delete
        if (msg.type === "call-log") {
            const sysDiv = document.createElement("div");
            sysDiv.className = "system-msg";
            sysDiv.textContent = msg.content || "";
            list.appendChild(sysDiv);
            this._scroll();
            return;
        }
        
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
            // New messages: fileData is JPEG thumbnail; old messages: full original image
            const mime = (msg.fileId && msg.mimeType) ? 'image/jpeg' : (msg.mimeType || 'image/png');
            const src = `data:${mime};base64,${msg.fileData}`;
            innerContent = `<img class="img-thumb" src="${src}" data-msg-id="${msg.id}" data-file-id="${msg.fileId || ''}" data-mime="${msg.mimeType || 'image/png'}">`;
        } else if (msg.type === "image") {
            // Image message without fileData (migration/partial state) - show placeholder
            innerContent = `<div class="content" style="opacity:0.5;"><svg width="20" height="20" viewBox="0 0 32 32" style="vertical-align:middle"><rect x="3" y="5" width="26" height="22" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="10" cy="12" r="3" fill="currentColor" opacity="0.5"/><polygon points="3,27 11,18 17,24 22,18 29,25 29,27" fill="currentColor" opacity="0.15"/></svg> ${msg.fileName || '图片'}</div>`;
        } else if (msg.type === "file" && msg.fileData) {
            const icon = this._getFileIcon(msg.fileName);
            const sizeStr = this._formatFileSize(msg.fileSize);
            innerContent = `<div class="file-attachment" onclick="ChatApp.downloadAttachment('${msg.id}')"><div class="file-icon">${icon}</div><div class="file-info"><div class="file-name">${(msg.fileName || _i18n.t('pchat.file.unknown')).replace(/</g,'&lt;')}</div><div class="file-size">${sizeStr}</div></div></div>`;
        } else if (msg.type === "direct-file") {
            // Direct transfer: file stored in OPFS, not IndexedDB
            const icon = this._getFileIcon(msg.fileName);
            const sizeStr = this._formatFileSize(msg.fileSize);
            if (sent) {
                innerContent = `<div class="file-attachment direct-transfer sent"><div class="file-icon">${icon}</div><div class="file-info"><div class="file-name">${(msg.fileName || '').replace(/</g,'&lt;')}</div><div class="file-size">${sizeStr} · 直传 · 已发送 ✓</div></div></div>`;
            } else {
                const safeName = (msg.fileName || 'download').replace(/'/g,"\\'");
                innerContent = `<div class="file-attachment direct-transfer" onclick="event.stopPropagation();ChatApp.downloadDirectFile('${msg.fileId}','${safeName}')"><div class="file-icon">${icon}</div><div class="file-info"><div class="file-name">${(msg.fileName || '').replace(/</g,'&lt;')}</div><div class="file-size">${sizeStr} · 直传</div><button class="tp-done-btn" style="margin-top:4px;" onclick="event.stopPropagation();ChatApp.downloadDirectFile('${msg.fileId}','${safeName}')">下载</button></div></div>`;
            }
        } else if (msg.type === "voice" && msg.content) {
            const dur = msg.duration || 0;
            const durStr = dur > 0 ? `${Math.floor(dur)}s` : _i18n.t('pchat.msg.voice');
            innerContent = `<div class="voice-msg" onclick="ChatApp.playVoice('${msg.id}', this)"><span class="voice-icon"><svg width="20" height="20" viewBox="0 0 32 32"><polygon points="8,12 4,12 4,20 8,20 14,25 14,7" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M18 10a6 6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M22 7a10 10 0 0 1 0 18" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5" stroke-linecap="round"/></svg></span><span class="voice-duration">${durStr}</span></div>`;
        } else {
            const text = msg.isHtml ? (msg.content || "") : (msg.content || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            innerContent = `<div class="content">${text}</div>`;
        }
        const deleteBtn = `<button class="msg-delete-btn" onclick="ChatApp.deleteMessage('${msg.id}', event)" title="${_i18n.t('pchat.msg.deleteTitle')}"><svg width="14" height="14" viewBox="0 0 32 32"><line x1="10" y1="10" x2="22" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><line x1="22" y1="10" x2="10" y2="22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button>`;
        
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

    // ---- Transfer progress UI ----
    _insertTransferCard(transferId, fileName, fileSize, isSender) {
        try {
        const list = document.getElementById("message-list");
        if (!list) return;
        const icon = this._getFileIcon(fileName);
        const sizeStr = this._formatFileSize(fileSize);
        const status = isSender ? '发送中...' : '接收中...';
        const card = document.createElement("div");
        card.className = "message-row";
        card.id = `transfer-${transferId}`;
        card.innerHTML = `<div class="sender-avatar">${isSender ? _i18n.t('pchat.msg.self') : ''}</div>
            <div class="message ${isSender ? 'sent' : 'received'}">
                <div class="transfer-progress-card" id="transfer-card-${transferId}">
                    <div class="tp-header"><span class="tp-icon">${icon}</span><span class="tp-name">${fileName.replace(/</g,'&lt;')}</span></div>
                    <div class="tp-bar-wrap"><div class="tp-bar-fill" id="transfer-bar-${transferId}" style="width:0%"></div></div>
                    <div class="tp-status"><span id="transfer-pct-${transferId}">0%</span> · <span id="transfer-status-${transferId}">${status}</span><span class="tp-size">${sizeStr}</span></div>
                </div>
            </div>`;
        list.appendChild(card);
        this._scroll();
        return card;
        } catch(e) { console.error('[Transfer] insertTransferCard error:', e); return null; }
    },

    _updateTransferProgress(transferId, pct, status, fileId, fileName) {
        const bar = document.getElementById(`transfer-bar-${transferId}`);
        const pctEl = document.getElementById(`transfer-pct-${transferId}`);
        const stEl = document.getElementById(`transfer-status-${transferId}`);
        if (bar) bar.style.width = `${Math.min(100, Math.round(pct))}%`;
        if (pctEl) pctEl.textContent = `${Math.round(pct)}%`;
        if (stEl && status) stEl.textContent = status;
        try { this._scroll(); } catch(e) {}
    },

    _finishTransferCard(transferId, fileId, fileName, isSender) {
        try {
            const bar = document.getElementById(`transfer-bar-${transferId}`);
            const pctEl = document.getElementById(`transfer-pct-${transferId}`);
            const stEl = document.getElementById(`transfer-status-${transferId}`);
            const card = document.getElementById(`transfer-card-${transferId}`);
            if (bar) bar.style.width = '100%';
            if (pctEl) pctEl.textContent = '100%';
            if (isSender) {
                if (stEl) stEl.textContent = '✓ 已发送';
            } else if (card && fileId) {
            // Receiver: add download button
            const safeName = (fileName || 'download').replace(/'/g, "\\'");
            card.innerHTML = card.innerHTML.replace(
                /<div class="tp-status">.*<\/div>/,
                `<div class="tp-status"><span>100%</span> · <span>✓ 已完成</span><button class="tp-done-btn" onclick="event.stopPropagation();ChatApp.downloadDirectFile('${fileId}','${safeName}')">下载</button></div>`
            );
        }
        } catch(e) {
            console.error('[Transfer] finishTransferCard error:', e);
        }
    },


    async _finalizeDirectReceive(fileId) {
        const ft = this.fileTransfer;
        const info = ft.pending[fileId];
        if (!info) return;
        console.log(`[File] Finalizing direct receive: ${info.name}`);
        await DB._flushRawBuffer(fileId);
        await DB.closeDirectFile(fileId);
        delete ft.pending[fileId];
        this._finishTransferCard(fileId, fileId, info.name, false);
        const now = Date.now();
        const msg = {
            id: `msg_${info.peerId}_${now}_${Math.random().toString(36).slice(2,6)}`,
            peerId: info.peerId, ts: now, direction: "received", fromId: info.peerId,
            type: "direct-file", fileName: info.name, mimeType: info.mime, fileSize: info.size, fileId,
        };
        await DB.putRaw("messages", msg);
        const ackPeer = PeerConn.peers[info.peerId];
        if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
            ackPeer.conn.send({ type: "file-ack", fileId });
        }
        const contact = this.contacts.find(c => c.userId === info.peerId);
        if (contact) {
            contact.lastMessage = { content: _i18n.t('pchat.file.prefixFile') + ' ' + info.name, ts: now, fromId: info.peerId };
            this.saveContact(contact);
            this._renderContacts();
        }
    },

    _getFileIcon(fileName) {
        if (!fileName) return '<svg width="24" height="24" viewBox="0 0 32 32"><path d="M8 2h12l8 8v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="#888" stroke-width="2" stroke-linejoin="round"/><polyline points="20,2 20,10 28,10" fill="none" stroke="#888" stroke-width="2" stroke-linejoin="round"/><line x1="10" y1="16" x2="22" y2="16" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="20" x2="18" y2="20" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="24" x2="14" y2="24" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>';
        const ext = fileName.split('.').pop().toLowerCase();
        const svg = (color, paths) => `<svg width="24" height="24" viewBox="0 0 32 32"><path d="M8 2h12l8 8v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/><polyline points="20,2 20,10 28,10" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/>${paths}</svg>`;
        const icons = {
            'pdf': svg('#e74c3c', '<line x1="10" y1="18" x2="22" y2="18" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="22" x2="18" y2="22" stroke="#e74c3c" stroke-width="2" stroke-linecap="round"/>'),
            'doc': svg('#3498db', '<rect x="10" y="16" width="12" height="8" rx="1" fill="none" stroke="#3498db" stroke-width="1.5"/><line x1="13" y1="16" x2="13" y2="24" stroke="#3498db" stroke-width="1"/><line x1="16" y1="16" x2="16" y2="24" stroke="#3498db" stroke-width="0.5"/>'),
            'docx': svg('#3498db', '<rect x="10" y="16" width="12" height="8" rx="1" fill="none" stroke="#3498db" stroke-width="1.5"/><line x1="13" y1="16" x2="13" y2="24" stroke="#3498db" stroke-width="1"/><line x1="16" y1="16" x2="16" y2="24" stroke="#3498db" stroke-width="0.5"/>'),
            'xls': svg('#2ecc71', '<rect x="8" y="14" width="16" height="12" rx="1" fill="none" stroke="#2ecc71" stroke-width="1.5"/><line x1="11" y1="18" x2="21" y2="18" stroke="#2ecc71" stroke-width="1"/><line x1="11" y1="22" x2="18" y2="22" stroke="#2ecc71" stroke-width="1"/>'),
            'xlsx': svg('#2ecc71', '<rect x="8" y="14" width="16" height="12" rx="1" fill="none" stroke="#2ecc71" stroke-width="1.5"/><line x1="11" y1="18" x2="21" y2="18" stroke="#2ecc71" stroke-width="1"/><line x1="11" y1="22" x2="18" y2="22" stroke="#2ecc71" stroke-width="1"/>'),
            'ppt': svg('#e67e22', '<rect x="10" y="15" width="12" height="9" rx="1" fill="none" stroke="#e67e22" stroke-width="1.5"/><polyline points="11,20 15,16 19,20 21,18" fill="none" stroke="#e67e22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
            'pptx': svg('#e67e22', '<rect x="10" y="15" width="12" height="9" rx="1" fill="none" stroke="#e67e22" stroke-width="1.5"/><polyline points="11,20 15,16 19,20 21,18" fill="none" stroke="#e67e22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
            'zip': svg('#795548', '<rect x="11" y="18" width="10" height="4" rx="1" fill="none" stroke="#795548" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="18" stroke="#795548" stroke-width="1.5"/><line x1="18" y1="16" x2="18" y2="18" stroke="#795548" stroke-width="1.5"/>'),
            'rar': svg('#795548', '<rect x="11" y="18" width="10" height="4" rx="1" fill="none" stroke="#795548" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="18" stroke="#795548" stroke-width="1.5"/><line x1="18" y1="16" x2="18" y2="18" stroke="#795548" stroke-width="1.5"/>'),
            '7z': svg('#795548', '<rect x="11" y="18" width="10" height="4" rx="1" fill="none" stroke="#795548" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="18" stroke="#795548" stroke-width="1.5"/><line x1="18" y1="16" x2="18" y2="18" stroke="#795548" stroke-width="1.5"/>'),
            'tar': svg('#795548', '<rect x="11" y="18" width="10" height="4" rx="1" fill="none" stroke="#795548" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="18" stroke="#795548" stroke-width="1.5"/><line x1="18" y1="16" x2="18" y2="18" stroke="#795548" stroke-width="1.5"/>'),
            'gz': svg('#795548', '<rect x="11" y="18" width="10" height="4" rx="1" fill="none" stroke="#795548" stroke-width="1.5"/><line x1="14" y1="16" x2="14" y2="18" stroke="#795548" stroke-width="1.5"/><line x1="18" y1="16" x2="18" y2="18" stroke="#795548" stroke-width="1.5"/>'),
            'mp3': svg('#9b59b6', '<circle cx="12" cy="21" r="4" fill="none" stroke="#9b59b6" stroke-width="1.5"/><line x1="16" y1="21" x2="22" y2="17" stroke="#9b59b6" stroke-width="1.5" stroke-linecap="round"/>'),
            'wav': svg('#9b59b6', '<circle cx="12" cy="21" r="4" fill="none" stroke="#9b59b6" stroke-width="1.5"/><line x1="16" y1="21" x2="22" y2="17" stroke="#9b59b6" stroke-width="1.5" stroke-linecap="round"/>'),
            'ogg': svg('#9b59b6', '<circle cx="12" cy="21" r="4" fill="none" stroke="#9b59b6" stroke-width="1.5"/><line x1="16" y1="21" x2="22" y2="17" stroke="#9b59b6" stroke-width="1.5" stroke-linecap="round"/>'),
            'flac': svg('#9b59b6', '<circle cx="12" cy="21" r="4" fill="none" stroke="#9b59b6" stroke-width="1.5"/><line x1="16" y1="21" x2="22" y2="17" stroke="#9b59b6" stroke-width="1.5" stroke-linecap="round"/>'),
            'mp4': svg('#e74c3c', '<polygon points="13,17 13,25 21,21" fill="#e74c3c" opacity="0.4"/>'),
            'avi': svg('#e74c3c', '<polygon points="13,17 13,25 21,21" fill="#e74c3c" opacity="0.4"/>'),
            'mov': svg('#e74c3c', '<polygon points="13,17 13,25 21,21" fill="#e74c3c" opacity="0.4"/>'),
            'mkv': svg('#e74c3c', '<polygon points="13,17 13,25 21,21" fill="#e74c3c" opacity="0.4"/>'),
            'txt': svg('#888', '<line x1="10" y1="16" x2="22" y2="16" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="20" x2="18" y2="20" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="24" x2="14" y2="24" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>'),
            'log': svg('#888', '<line x1="10" y1="16" x2="22" y2="16" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="20" x2="18" y2="20" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="24" x2="14" y2="24" stroke="#888" stroke-width="1.5" stroke-linecap="round"/>'),
            'js': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'py': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'java': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'cpp': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'c': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'go': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'rs': svg('#5b8def', '<polyline points="10,18 14,22 23,14" fill="none" stroke="#5b8def" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'),
            'json': svg('#f39c12', '<rect x="9" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="17" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="9" y="21" width="4" height="3" rx="1" fill="#f39c12" opacity="0.3"/>'),
            'xml': svg('#f39c12', '<rect x="9" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="17" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="9" y="21" width="4" height="3" rx="1" fill="#f39c12" opacity="0.3"/>'),
            'yaml': svg('#f39c12', '<rect x="9" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="17" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="9" y="21" width="4" height="3" rx="1" fill="#f39c12" opacity="0.3"/>'),
            'yml': svg('#f39c12', '<rect x="9" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="17" y="16" width="6" height="3" rx="1" fill="#f39c12" opacity="0.3"/><rect x="9" y="21" width="4" height="3" rx="1" fill="#f39c12" opacity="0.3"/>'),
        };
        return icons[ext] || '<svg width="24" height="24" viewBox="0 0 32 32"><path d="M8 2h12l8 8v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="none" stroke="#888" stroke-width="2" stroke-linejoin="round"/><polyline points="20,2 20,10 28,10" fill="none" stroke="#888" stroke-width="2" stroke-linejoin="round"/><line x1="10" y1="16" x2="22" y2="16" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="20" x2="18" y2="20" stroke="#888" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="24" x2="14" y2="24" stroke="#888" stroke-width="1.5" stroke-linecap="round"/></svg>';
    },

    _formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB'];
        let i = 0, size = bytes;
        while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
        return size.toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
    },

    async _openImageFromDb(msgId, fileId, mime) {
        // 先取消息记录（只取一次）
        const msg = await DB.get("messages", msgId, this.my.aesKey);
        console.log('[ImageViewer] aesKey fingerprint:', this.my.aesKey.substring(0, 16) + '...', 'fileId:', fileId, 'msg.fileId:', msg?.fileId);

        // Try to load full image from files store directly
        let fullData = null;
        if (fileId) {
            const fileRecord = await DB.getFile(fileId, this.my.aesKey);
            console.log('[ImageViewer] getFile result:', !!fileRecord, 'hasData:', !!fileRecord?.data);
            if (fileRecord && fileRecord.data) {
                fullData = fileRecord.data;
                mime = fileRecord.mime || mime;
            }
        }
        // Fallback: use msg.fileId to load from files
        if (!fullData && msg && msg.fileId && (!fileId || msg.fileId !== fileId)) {
            const fileRecord2 = await DB.getFile(msg.fileId, this.my.aesKey);
            if (fileRecord2 && fileRecord2.data) {
                fullData = fileRecord2.data;
                mime = fileRecord2.mime || mime;
            }
        }
        // Fallback: use fileData from message
        if (!fullData && msg && msg.fileData) {
            fullData = msg.fileData;
            mime = mime || msg.mimeType;
        }
        if (!fullData) return;

        // 复用已读取的 msg 对象
        const thumbData = msg && msg.fileData ? msg.fileData : fullData;
        const thumbSrc = `data:${mime || 'image/jpeg'};base64,${thumbData}`;
        this._currentImageMsgId = msgId;
        this.openImageViewer(thumbSrc, this.activeConv ? this.activeConv.id : null, msgId, fileId, mime);
    },

    async downloadAttachment(msgId) {
        const msg = await DB.get("messages", msgId, this.my.aesKey);
        if (!msg) return;
        
        // For images: try to get full image from files store
        let data = msg.fileData;
        let mime = msg.mimeType || 'application/octet-stream';
        if (msg.type === "image" && msg.fileId) {
            const fileRecord = await DB.getFile(msg.fileId, this.my.aesKey);
            if (fileRecord && fileRecord.data) {
                data = fileRecord.data;
                mime = fileRecord.mime || mime;
            }
        }
        if (!data) return;
        const blob = await this._base64ToBlob(data, mime);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = msg.fileName || 'download'; a.click();
        URL.revokeObjectURL(url);
    },

    // Download a direct-transfer file from OPFS
    async downloadDirectFile(fileId, fileName) {
        const url = await DB.readDirectFile(fileId);
        if (!url) {
            this.showAlert(_i18n.t('pchat.alert.downloadExpired'));
            return;
        }
        const a = document.createElement('a');
        a.href = url; a.download = fileName || 'download'; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
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
        c.direction = "sent"; // 主叫标记
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
            this._pushNav(() => this.hangupCall());
        }
        
        // 显示等待接听状态
        this._updateCallModal("waiting");
        
        const btn = document.getElementById("call-btn");
        if (btn) { btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M7 5c-2 2-2 8 0 14s8 12 14 14c2-2 4-5 4-7l-5-5-2 2c-3-2-7-6-7-10l2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'; btn.classList.add("active"); }
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
        this._pushNav(() => this.hangupCall());
        
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
        this._popNav();
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
            c.direction = "received"; // 接听标记
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
    async _onCallEnd() {
        const c = this.call;
        
        // 计算通话时长并记录
        if (c.startTime) {
            const duration = Math.floor((Date.now() - c.startTime) / 1000);
            await this._recordCallMessage(c.peerId, duration, c.direction || "received");
        }
        
        this._stopCallMedia();
        this._hideCallModal();
        this._hideCallInHeader();
        this._resetCallUI();
        
        // BUG-014: 清理残留的 _pendingCall，防止通话异常结束后残留
        if (this._pendingCall) {
            try { this._pendingCall.close(); } catch(e) {}
            this._pendingCall = null;
        }
    },
    
    // 记录通话消息到对话
    async _recordCallMessage(peerId, durationSeconds, direction) {
        const now = Date.now();
        const durStr = this._formatDuration(durationSeconds);
        const content = _i18n.fmt('pchat.call.log', 'dur', durStr);
        const id = `call_${peerId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const msg = {
            id,
            peerId,
            content,
            ts: now,
            direction: direction || "received",
            fromId: peerId,
            type: "call-log"
        };
        
        await DB.put("messages", msg, this.my.aesKey);
        if (this.activeConv && this.activeConv.id === peerId) {
            this._appendMsg(msg);
        }
        
        const contact = this.contacts.find(c => c.userId === peerId);
        if (contact) {
            contact.lastMessage = { content: content, ts: now, fromId: peerId };
            this.saveContact(contact);
        }
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
        if (btn) { btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M7 5c-2 2-2 8 0 14s8 12 14 14c2-2 4-5 4-7l-5-5-2 2c-3-2-7-6-7-10l2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>'; btn.classList.remove("active"); }
        
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
        // Delete associated file from files store if image
        if (msg.type === "image" && msg.fileId) {
            await DB.deleteFile(msg.fileId);
        }
        // Delete OPFS file if direct transfer
        if (msg.type === "direct-file" && msg.fileId) {
            await DB.deleteDirectFile(msg.fileId);
        }
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
    // Open image viewer: show thumbnail first, load full image async
    async openImageViewer(thumbSrc, convId, currentMsgId, currentFileId, currentMime) {
        const iv = this.imageViewer;
        iv.url = thumbSrc; iv.zoom = 1; iv.panX = 0; iv.panY = 0; iv.dragging = false;
        iv.swipeImages = []; iv.swipeIndex = -1;
        const img = document.getElementById("image-viewer-img");
        const img2 = document.getElementById("image-viewer-img2");
        img.style.transform = 'none';
        img.style.transformOrigin = 'center center';
        img.style.transition = 'none';
        if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transition = 'none'; img2.style.transform = 'translate(-50%,-50%) scale(1)'; }
        document.getElementById("image-viewer").classList.add("show");
        this._pushNav(() => this.closeImageViewer());
        this._showToolbar();
        this._resetToolbarTimer();

        // Collect swipeable images from current conversation
        if (convId) {
            const msgs = this.currentMessages || [];
            const images = msgs.filter(m => m.type === 'image' && m.fileData);
            if (images.length > 1) {
                iv.swipeImages = images.map(m => ({
                    msgId: m.id,
                    fileId: m.fileId,
                    mime: m.mimeType || 'image/jpeg',
                    thumbData: m.fileData,
                    fullSrc: null,
                    fullLoading: false,
                    rotation: 0
                }));
                const targetId = currentMsgId || this._currentImageMsgId;
                for (let i = 0; i < images.length; i++) {
                    if (iv.swipeImages[i].msgId === targetId) {
                        iv.swipeIndex = i; break;
                    }
                }
                if (iv.swipeIndex < 0) iv.swipeIndex = 0;

                // Current image: thumbnail is showing, load full image async
                this._loadFullImage(iv.swipeIndex);
                // Preload neighbor thumbnail into img2
                if (img2) {
                    const neighborIdx = iv.swipeIndex + 1;
                    if (neighborIdx < iv.swipeImages.length) {
                        const ns = this._getSrcForIndex(neighborIdx);
                        if (ns) img2.src = ns;
                    }
                }
                // Load neighbors in background
                this._preloadNeighbors();
            } else {
                // Single image: just load full if we have fileId
                if (currentFileId) {
                    iv.swipeImages = [{
                        msgId: currentMsgId,
                        fileId: currentFileId,
                        mime: currentMime,
                        thumbData: thumbSrc,
                        fullSrc: null,
                        fullLoading: false,
                        rotation: 0
                    }];
                    iv.swipeIndex = 0;
                    this._loadFullImage(0);
                }
            }
        }

        // Set onload BEFORE src to avoid missed load events
        const _onFirstImageLoad = () => {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const vw = window.innerWidth, vh = window.innerHeight;
                const scale = Math.min(vw / img.naturalWidth, vh / img.naturalHeight);
                img.style.width = img.naturalWidth + 'px';
                img.style.height = img.naturalHeight + 'px';
                img.style.maxWidth = 'none';
                img.style.maxHeight = 'none';
                iv.zoom = scale;
                iv.minZoom = scale;
            }
            this._initImageViewerGesture();
        };
        img.onload = _onFirstImageLoad;
        img.src = thumbSrc;
    },

    // Load full-size image for a given index, cache in swipeImages[idx].fullSrc
    async _loadFullImage(idx) {
        const iv = this.imageViewer;
        const item = iv.swipeImages[idx];
        if (!item || item.fullSrc || item.fullLoading) return;
        item.fullLoading = true;
        // No separate full-size file stored; thumbnail is the full image
        if (!item.fileId) {
            item.fullSrc = item.thumbData ? `data:${item.mime || 'image/jpeg'};base64,${item.thumbData}` : null;
            return;
        }
        let fullData = null;
        let mime = item.mime;
        if (item.fileId) {
            const fileRecord = await DB.getFile(item.fileId, this.my.aesKey);
            if (fileRecord && fileRecord.data) {
                fullData = fileRecord.data;
                mime = fileRecord.mime || mime;
                item.mime = mime;
            }
        }
        if (!fullData && item.thumbData) fullData = item.thumbData;
        if (fullData) {
            item.fullSrc = `data:${mime || 'image/jpeg'};base64,${fullData}`;
            // If this is the currently displayed image, swap to full-res
            if (idx === iv.swipeIndex) {
                const img = document.getElementById("image-viewer-img");
                if (img) {
                    img.onload = () => {
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                            const vw = window.innerWidth, vh = window.innerHeight;
                            const rotation = iv.swipeImages[iv.swipeIndex] ? iv.swipeImages[iv.swipeIndex].rotation || 0 : 0;
                            const rotW = (rotation % 180 === 90) ? img.naturalHeight : img.naturalWidth;
                            const rotH = (rotation % 180 === 90) ? img.naturalWidth : img.naturalHeight;
                            const scale = Math.min(vw / rotW, vh / rotH);
                            img.style.width = img.naturalWidth + 'px';
                            img.style.height = img.naturalHeight + 'px';
                            img.style.maxWidth = 'none';
                            img.style.maxHeight = 'none';
                            iv.zoom = scale;
                            iv.minZoom = scale;
                            this._updateImageTransform();
                        }
                        // Hide thumb (img2) now that full image is loaded
                        const img2 = document.getElementById("image-viewer-img2");
                        if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.zIndex = '-1'; }
                    };
                    img.src = item.fullSrc;
                }
            }
        }
        item.fullLoading = false;
    },

    // Async: load neighbors in background
    _preloadNeighbors() {
        const iv = this.imageViewer;
        const { swipeImages, swipeIndex } = iv;
        const loadDir = (dir) => {
            const idx = swipeIndex + dir;
            if (idx < 0 || idx >= swipeImages.length) return;
            if (swipeImages[idx].fullSrc || swipeImages[idx].fullLoading) return;
            this._loadFullImage(idx);
        };
        loadDir(-1);
        loadDir(1);
    },

    // Get display source for an image (full if loaded, otherwise thumb)
    _getSrcForIndex(idx) {
        const item = this.imageViewer.swipeImages[idx];
        if (!item) return null;
        return item.fullSrc || (item.thumbData ? `data:${item.mime || 'image/jpeg'};base64,${item.thumbData}` : null);
    },

    _initImageViewerGesture() {
        const iv = this.imageViewer;
        const img = document.getElementById("image-viewer-img");
        const img2 = document.getElementById("image-viewer-img2");
        const viewer = document.getElementById("image-viewer");
        const container = document.getElementById("image-viewer-container");

        let lastPinchDist = 0;
        let lastPinchCenter = null;

        // Helper: fit image to screen (max-width/max-height fit, can upscale)
        const _fitToScreen = (el, ignoreRotation) => {
            if (!el) return;
            const doFit = () => {
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const iw = el.naturalWidth;
                const ih = el.naturalHeight;
                if (iw === 0 || ih === 0) return;
                // Use per-image rotation (no rotation for img2 peek)
                const cur = iv.swipeImages[iv.swipeIndex];
                const rotation = (!ignoreRotation && cur) ? (cur.rotation || 0) : 0;
                const rotW = (rotation % 180 === 90) ? ih : iw;
                const rotH = (rotation % 180 === 90) ? iw : ih;
                const scale = Math.min(vw / rotW, vh / rotH);
                el.style.width = iw + 'px';
                el.style.height = ih + 'px';
                el.style.maxWidth = 'none';
                el.style.maxHeight = 'none';
                iv.zoom = scale;
                iv.minZoom = scale;
            };
            if (el.complete && el.naturalWidth > 0) {
                doFit();
            } else {
                el.onload = doFit;
            }
        };

        // ---- Wheel zoom ----
        viewer.onwheel = (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this._applyZoom(iv.zoom + delta, e, img);
            this._resetToolbarTimer();
        };

        // ---- Pointer drag: pan or swipe with neighbor peek ----
        let dragStartX = 0;
        let isDragging = false;

        img.onpointerdown = (e) => {
            if (e.pointerType === 'touch' && e.isPrimary === false) return;
            if (e.button !== 0) return;
            e.preventDefault();
            isDragging = true;
            dragStartX = e.clientX;
            iv.lastX = e.clientX; iv.lastY = e.clientY;
            img.setPointerCapture(e.pointerId);
            img.style.cursor = 'grabbing';
            img.style.transition = 'none';
            if (img2) img2.style.transition = 'none';
            this._resetToolbarTimer();
        };

        img.onpointermove = (e) => {
            if (!isDragging) return;
            const totalDx = e.clientX - dragStartX;

            // If zoomed in: free pan
            if (iv.zoom > iv.minZoom + 0.01) {
                iv.panX += e.clientX - iv.lastX;
                iv.panY += e.clientY - iv.lastY;
                iv.lastX = e.clientX; iv.lastY = e.clientY;
                this._updateImageTransform();
                return;
            }

            // At minZoom: horizontal swipe
            iv.panY = 0;

            if (iv.swipeImages.length > 1) {
                const dir = totalDx < 0 ? 1 : -1; // left drag → next, right drag → prev
                const neighborIdx = iv.swipeIndex + dir;

                if (neighborIdx >= 0 && neighborIdx < iv.swipeImages.length) {
                    // Get neighbor source
                    const src = this._getSrcForIndex(neighborIdx);
                    if (!img2 || !src) {
                        iv.panX = totalDx * 0.3;
                        this._updateImageTransform();
                    } else {
                        // Set img2 source if not already set
                        if (img2.src !== src) {
                            img2.style.visibility = "hidden";
                            img2.src = src;
                            // Only show img2 when fully loaded and dimensions are known
                            img2.onload = () => {
                                if (img2.naturalWidth > 0 && img2.naturalHeight > 0) {
                                    img2.style.width = img2.naturalWidth + 'px';
                                    img2.style.height = img2.naturalHeight + 'px';
                                    img2.style.maxWidth = 'none';
                                    img2.style.maxHeight = 'none';
                                    img2.style.visibility = "visible";
                                }
                            };
                            // Apply if already loaded (cached)
                            if (img2.naturalWidth > 0 && img2.naturalHeight > 0) {
                                img2.style.width = img2.naturalWidth + 'px';
                                img2.style.height = img2.naturalHeight + 'px';
                                img2.style.maxWidth = 'none';
                                img2.style.maxHeight = 'none';
                                img2.style.visibility = "visible";
                            }
                        }
                        // Both images move together with drag
                        const offset = totalDx * 0.8;
                        const screenW = window.innerWidth;
                        // Calculate img2's own screen-fit scale
                        const img2Scale = (img2.naturalWidth > 0 && img2.naturalHeight > 0)
                            ? Math.min(screenW / img2.naturalWidth, window.innerHeight / img2.naturalHeight)
                            : 1;
                        // Current image moves with drag (keep its own scale)
                        const dragRot = iv.swipeImages[iv.swipeIndex] ? iv.swipeImages[iv.swipeIndex].rotation : 0;
                        img.style.transform = `translate(${offset}px, 0) rotate(${dragRot}deg) scale(${iv.zoom})`;
                        // Neighbor peeks from the other side with its own scale
                        const img2Offset = offset + (dir === 1 ? screenW : -screenW);
                        img2.style.transform = `translate(calc(-50% + ${img2Offset}px), -50%) scale(${img2Scale})`;
                        img.style.zIndex = '1';
                        img2.style.zIndex = '0';
                    }
                } else {
                    // Edge: just drag with resistance
                    iv.panX = totalDx * 0.3;
                    if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transform = 'translate(-50%,-50%) scale(1)'; img2.style.zIndex = '-1'; }
                    this._updateImageTransform();
                }
            } else {
                iv.panX = totalDx * 0.3;
                if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transform = 'translate(-50%,-50%) scale(1)'; img2.style.zIndex = '-1'; }
                this._updateImageTransform();
            }
            iv.lastX = e.clientX; iv.lastY = e.clientY;
        };

        img.onpointerup = async (e) => {
            isDragging = false;
            img.style.cursor = 'grab';
            this._resetToolbarTimer();

            const totalDx = e.clientX - dragStartX;

            // Zoomed in: stop panning
            if (iv.zoom > iv.minZoom + 0.01) return;

            iv.panY = 0;

            if (iv.swipeImages.length > 1 && Math.abs(totalDx) > 80) {
                const goingLeft = totalDx < 0;
                const dir = goingLeft ? 1 : -1;
                const newIdx = iv.swipeIndex + dir;

                if (newIdx >= 0 && newIdx < iv.swipeImages.length) {
                    const screenW = window.innerWidth;
                    const offset = goingLeft ? -screenW : screenW;

                    // Both img and img2 animate together: img slides out, img2 slides to center
                    img.style.transition = 'transform 0.3s ease';
                    const saveCur = iv.swipeImages[iv.swipeIndex];
                    const saveRotation = saveCur ? saveCur.rotation : 0;
                    img.style.transform = `translate(${offset}px, 0) rotate(${saveRotation}deg) scale(${iv.zoom})`;

                    // img2 animates to center, keeping its current scale (no scale animation)
                    if (img2) {
                        // Calculate img2's screen-fit scale to preserve it in animation
                        const img2Scale = (img2.naturalWidth > 0 && img2.naturalHeight > 0)
                            ? Math.min(screenW / img2.naturalWidth, window.innerHeight / img2.naturalHeight)
                            : 1;
                        img2.style.transition = 'transform 0.3s ease';
                        img2.style.transform = `translate(-50%,-50%) scale(${img2Scale})`;
                    }

                    await new Promise(r => setTimeout(r, 300));

                    // Commit: swap roles — img takes over, img2 hidden
                    iv.swipeIndex = newIdx;
                    const src = this._getSrcForIndex(newIdx);
                    const item = iv.swipeImages[newIdx];
                    this._currentImageMsgId = item.msgId;
                    iv.url = src;

                    iv.panX = 0; iv.panY = 0;

                    // Pre-fit using img2's dimensions (img2 already loaded this image)
                    if (img2 && img2.naturalWidth > 0 && img2.naturalHeight > 0) {
                        img.style.width = img2.naturalWidth + 'px';
                        img.style.height = img2.naturalHeight + 'px';
                        img.style.maxWidth = 'none';
                        img.style.maxHeight = 'none';
                        const vw = window.innerWidth, vh = window.innerHeight;
                        const rotation = item.rotation || 0;
                        const rotW = (rotation % 180 === 90) ? img2.naturalHeight : img2.naturalWidth;
                        const rotH = (rotation % 180 === 90) ? img2.naturalWidth : img2.naturalHeight;
                        iv.zoom = Math.min(vw / rotW, vh / rotH);
                        iv.minZoom = iv.zoom;
                    }

                    // Hide img2 and show img at center (no transition)
                    if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transition = 'none'; img2.style.zIndex = '-1'; }

                    img.style.transition = 'none';
                    img.style.zIndex = '1';
                    img.src = src || img.src;
                    // When img finishes loading, recalc scale based on its own natural dimensions
                    img.onload = () => {
                        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                            const vw = window.innerWidth, vh = window.innerHeight;
                            const rotation = iv.swipeImages[iv.swipeIndex] ? iv.swipeImages[iv.swipeIndex].rotation || 0 : 0;
                            const rotW = (rotation % 180 === 90) ? img.naturalHeight : img.naturalWidth;
                            const rotH = (rotation % 180 === 90) ? img.naturalWidth : img.naturalHeight;
                            const scale = Math.min(vw / rotW, vh / rotH);
                            img.style.width = img.naturalWidth + 'px';
                            img.style.height = img.naturalHeight + 'px';
                            img.style.maxWidth = 'none';
                            img.style.maxHeight = 'none';
                            iv.zoom = scale;
                            iv.minZoom = scale;
                            this._updateImageTransform();
                        }
                        // Hide thumb (img2) now that full image is loaded
                        const img2b = document.getElementById("image-viewer-img2");
                        if (img2b) { img2b.removeAttribute('src'); img2b.style.visibility = 'hidden'; img2b.style.zIndex = '-1'; }
                    };
                    this._updateImageTransform();

                    // Load full image in background
                    this._loadFullImage(newIdx);
                    this._updateImageCounter();
                } else {
                    // Bounce back
                    img.style.transition = 'transform 0.3s ease';
                    iv.panX = 0;
                    this._updateImageTransform();
                    if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transition = 'none'; img2.style.transform = 'translate(-50%,-50%) scale(1)'; img2.style.zIndex = '-1'; }
                }
            } else {
                // Not enough drag or no swipe: spring back
                img.style.transition = 'transform 0.3s ease';
                iv.panX = 0;
                this._updateImageTransform();
                if (img2) { img2.removeAttribute('src'); img2.style.visibility = 'hidden'; img2.style.transition = 'none'; img2.style.transform = 'translate(-50%,-50%) scale(1)'; img2.style.zIndex = '-1'; }
            }
        };

        img.ondragstart = (e) => e.preventDefault();

        // ---- Pinch-to-zoom ----
        container.ontouchstart = (e) => {
            if (e.touches.length === 2) {
                isDragging = false;
                lastPinchDist = this._touchDist(e.touches);
                lastPinchCenter = this._touchCenter(e.touches);
                img.style.transition = 'none';
                this._resetToolbarTimer();
            }
        };
        container.ontouchmove = (e) => {
            e.preventDefault();
            if (e.touches.length === 2) {
                const dist = this._touchDist(e.touches);
                const center = this._touchCenter(e.touches);
                if (lastPinchDist > 0) {
                    const scale = dist / lastPinchDist;
                    const newZoom = Math.max(iv.minZoom, Math.min(10, iv.zoom * scale));
                    if (lastPinchCenter && center) {
                        iv.panX += (center.x - lastPinchCenter.x);
                        iv.panY += (center.y - lastPinchCenter.y);
                    }
                    iv.zoom = newZoom;
                    this._updateImageTransform();
                    this._updateZoomDisplay();
                }
                lastPinchDist = dist;
                lastPinchCenter = center;
            }
        };
        container.ontouchend = (e) => {
            if (e.touches.length < 2) {
                lastPinchDist = 0;
                lastPinchCenter = null;
            }
        };

        // ---- Keyboard ----
        document.onkeydown = (e) => {
            if (e.key === "Escape") this.closeImageViewer();
            if (e.key === "ArrowLeft" && iv.swipeIndex > 0) {
                iv.swipeIndex--;
                this._swipeToImage(iv.swipeImages[iv.swipeIndex], -window.innerWidth);
            }
            if (e.key === "ArrowRight" && iv.swipeIndex < iv.swipeImages.length - 1) {
                iv.swipeIndex++;
                this._swipeToImage(iv.swipeImages[iv.swipeIndex], window.innerWidth);
            }
        };

        // ---- Toolbar hover pause ----
        const toolbar = document.getElementById("image-viewer-toolbar");
        toolbar.onmouseenter = () => { clearTimeout(iv.toolbarTimer); };
        toolbar.onmouseleave = () => { this._resetToolbarTimer(); };

        // ---- Mouse move resets toolbar timer ----
        viewer.onmousemove = () => { this._resetToolbarTimer(); };
    },

    _updateImageTransform() {
        const iv = this.imageViewer;
        const img = document.getElementById("image-viewer-img");
        const rotation = iv.swipeImages[iv.swipeIndex] ? iv.swipeImages[iv.swipeIndex].rotation : (iv.rotation || 0);
        img.style.transform = `translate(${iv.panX}px, ${iv.panY}px) rotate(${rotation}deg) scale(${iv.zoom})`;
    },

    _touchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },
    _touchCenter(touches) {
        return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 };
    },
    async _swipeToImage(image, entryX) {
        const iv = this.imageViewer;
        // Save old image rotation, restore new image's rotation
        const idx = iv.swipeImages.indexOf(image);
        iv.panX = entryX || 0; iv.panY = 0; iv.zoom = iv.minZoom;
        this._currentImageMsgId = image.msgId;
        // Load full image
        let fullData = null;
        if (image.fileId) {
            const fileRecord = await DB.getFile(image.fileId, this.my.aesKey);
            if (fileRecord && fileRecord.data) {
                fullData = fileRecord.data;
                image.mime = fileRecord.mime || image.mime;
            }
        }
        if (!fullData && image.fileData) {
            fullData = image.fileData;
        }
        if (!fullData) return;
        const src = `data:${image.mime || 'image/jpeg'};base64,${fullData}`;
        iv.url = src;
        const img = document.getElementById("image-viewer-img");
        // Update swipeIndex so _updateImageTransform uses the right rotation
        if (idx >= 0) iv.swipeIndex = idx;
        // Set initial position BEFORE changing src to avoid flicker
        img.style.transition = 'none';
        this._updateImageTransform();
        img.src = src;
        // Animate to center after image is ready
        img.onload = () => {
            if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                const vw = window.innerWidth, vh = window.innerHeight;
                const rotation = image.rotation || 0;
                const rotW = (rotation % 180 === 90) ? img.naturalHeight : img.naturalWidth;
                const rotH = (rotation % 180 === 90) ? img.naturalWidth : img.naturalHeight;
                const scale = Math.min(vw / rotW, vh / rotH);
                img.style.width = img.naturalWidth + "px";
                img.style.height = img.naturalHeight + "px";
                img.style.maxWidth = "none";
                img.style.maxHeight = "none";
                iv.zoom = scale; iv.minZoom = scale;
            }
            img.style.transition = 'transform 0.3s ease';
            void img.offsetWidth;
            iv.panX = 0;
            this._updateImageTransform();
        };
    },
    _updateImageCounter() {
        const iv = this.imageViewer;
        const el = document.getElementById("image-count");
        if (el) {
            el.textContent = `${iv.swipeIndex + 1}/${iv.swipeImages.length}`;
        }
    },
    _resetToolbarTimer() {
        const iv = this.imageViewer;
        if (iv._toolbarPending) return; // already scheduled
        iv._toolbarPending = true;
        requestAnimationFrame(() => {
            clearTimeout(iv.toolbarTimer);
            const toolbar = document.getElementById("image-viewer-toolbar");
            if (toolbar) toolbar.style.opacity = '1';
            iv.toolbarTimer = setTimeout(() => {
                if (toolbar) toolbar.style.opacity = '0';
            }, 5000);
            iv._toolbarPending = false;
        });
    },
    _showToolbar() {
        const toolbar = document.getElementById("image-viewer-toolbar");
        if (toolbar) toolbar.style.opacity = '1';
        this._resetToolbarTimer();
    },

    _applyZoom(newZoom, event, img) {
        const iv = this.imageViewer;
        newZoom = Math.max(iv.minZoom, Math.min(10, newZoom));
        if (event) {
            const oldZoom = iv.zoom;
            const imgRect = img.getBoundingClientRect();
            const cx = imgRect.left + imgRect.width / 2; const cy = imgRect.top + imgRect.height / 2;
            const dx = event.clientX - cx; const dy = event.clientY - cy;
            iv.panX += dx * (1 / newZoom - 1 / oldZoom);
            iv.panY += dy * (1 / newZoom - 1 / oldZoom);
        }
        iv.zoom = newZoom;
        const rotation = iv.swipeImages[iv.swipeIndex] ? iv.swipeImages[iv.swipeIndex].rotation : 0;
        img.style.transform = `translate(${iv.panX}px, ${iv.panY}px) rotate(${rotation}deg) scale(${iv.zoom})`;
        this._updateZoomDisplay();
        this._resetToolbarTimer();
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
    rotateImage(event) {
        if (event) event.stopPropagation();
        const iv = this.imageViewer;
        const cur = iv.swipeImages[iv.swipeIndex];
        const rotation = cur ? (cur.rotation = (cur.rotation + 90) % 360) : (iv.rotation = (iv.rotation + 90) % 360);
        iv.panX = 0; iv.panY = 0;
        const img = document.getElementById("image-viewer-img");
        // After rotation, the rendered bounding box swaps width/height
        // Recalculate fit based on rotated bounding box
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const rotW = (rotation % 180 === 90) ? img.naturalHeight : img.naturalWidth;
            const rotH = (rotation % 180 === 90) ? img.naturalWidth : img.naturalHeight;
            const scale = Math.min(vw / rotW, vh / rotH);
            // Keep CSS width/height as natural dimensions (transform rotates the rendered box)
            img.style.width = img.naturalWidth + "px";
            img.style.height = img.naturalHeight + "px";
            img.style.maxWidth = "none";
            img.style.maxHeight = "none";
            iv.zoom = scale;
            iv.minZoom = scale;
        }
        this._updateImageTransform();
        this._resetToolbarTimer();
    },

    closeImageViewer(event) {
        this._popNav();
        if (event) {
            if (event.target.id !== "image-viewer" && event.target.id !== "image-viewer-container" && event.target.tagName !== "BUTTON" && !event.target.closest('#image-viewer-toolbar')) return;
            event.stopPropagation();
        }
        const viewer = document.getElementById("image-viewer");
        viewer.classList.remove("show"); viewer.onwheel = null; viewer.onmousemove = null;
        const img2Close = document.getElementById("image-viewer-img2");
        if (img2Close) { img2Close.removeAttribute("src"); img2Close.style.visibility = "hidden"; }
        const img = document.getElementById("image-viewer-img");
        img.onpointerdown = null; img.onpointermove = null; img.onpointerup = null; img.ondragstart = null;
        img.onload = null;  // 清理图片加载事件
        img.style.transform = '';  // 重置缩放/平移变换
        const container = document.getElementById("image-viewer-container");
        container.ontouchstart = null; container.ontouchmove = null; container.ontouchend = null;
        const toolbar = document.getElementById("image-viewer-toolbar");
        toolbar.onmouseenter = null; toolbar.onmouseleave = null;
        document.onkeydown = null; clearTimeout(this.imageViewer.zoomTimer); clearTimeout(this.imageViewer.toolbarTimer);
    },

    downloadImage(event) {
        if (event) event.stopPropagation();
        const iv = this.imageViewer; if (!iv.url) return;
        const a = document.createElement('a'); a.href = iv.url; a.download = 'image_' + Date.now(); a.click();
    },

    logout() {
        location.reload();
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
            if (connOpen) { icon = '<svg width="12" height="12" viewBox="0 0 32 32" style="vertical-align:middle;margin-right:4px"><circle cx="16" cy="16" r="10" fill="#4ecca3"/></svg>'; st = _i18n.t('pchat.status.online'); }
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
            div.innerHTML = `<div class="avatar"><svg width="24" height="24" viewBox="0 0 32 32"><circle cx="12" cy="9" r="5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 26c0-4 3-7 8-7s8 3 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="23" cy="9" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M17 24c0-3 3-5 6-5s6 2 6 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div><div class="info" onclick="ChatApp.openConversation('group','${g.id}')"><div class="name">${g.name}</div><div class='status'>` + _i18n.fmt('pchat.status.groupMembers', 'n', g.memberIds.length) + `<div class='status'></div>`;
            list.appendChild(div);
        }
    },

    // ---- Session lock: prevent duplicate login across tabs ----
    _writeLoginToken() {
        localStorage.setItem('pchat_login', JSON.stringify({ id: this.my.id, ts: Date.now() }));
    },

    _startLoginHeartbeat() {
        if (this._loginHeartbeat) clearInterval(this._loginHeartbeat);
        this._loginHeartbeat = setInterval(() => {
            const raw = localStorage.getItem('pchat_login');
            if (!raw) return;
            try {
                const tok = JSON.parse(raw);
                if (tok.id === this.my.id && tok.ts > this._lastTokenTs + 3000) {
                    // Another tab logged in as us — silently exit
                    clearInterval(this._loginHeartbeat);
                    if (PeerConn.peer) PeerConn.peer.destroy();
                    Object.values(PeerConn.peers).forEach(s => { try { s.conn.close(); } catch(e){} });
                    location.hash = '';
                    location.reload();
                }
            } catch(e) {}
        }, 2000);
        this._lastTokenTs = Date.now();
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
        return await DB.listMessagesByPeer(peerId, this.my.aesKey);
    },

    async DB_put_msg(msg) {
        await DB.put("messages", msg, this.my.aesKey);
    },

    // ==================== TRANSFER (Account Migration) ====================
    // Temporary PeerJS instance for transfer
    _transferPeer: null,
    _transferConn: null,
    _transferDirection: null, // 'out' or 'in'
    _transferSourceDb: null,
    _transferSourceKey: null,
    _transferSourceUserId: null,
    _transferSourceNickname: null,
    _transferTargetDb: null,
    _transferTargetUserId: null,
    _transferTargetNickname: null,
    _transferSelectedId: null,
    _transferInScanMode: false,
    _transferOutId: null,

    // ---- UI: Show Transfer Out Modal ----
    showTransferOut() {
        const pwForm = document.getElementById("login-password-panel");
        if (pwForm) pwForm.style.display = "none";
        const modal = document.getElementById("transfer-out-panel");
        if (modal) modal.classList.add("show");
        if (modal) modal.style.display = "flex";
        this._pushNav(() => this.hideTransferOut());

        const container = document.getElementById("transfer-out-account-select");
        if (!container) return;

        const accounts = AccountManager.listAccounts();
        container.innerHTML = "";

        const label = document.createElement("p");
        label.textContent = _i18n.t('pchat.transfer.selectAccount');
        label.style.cssText = "font-size:12px;color:#888;margin-bottom:8px;text-align:center;";
        container.appendChild(label);

        for (const acc of accounts) {
            const div = document.createElement("div");
            div.className = "account-item";
            div.dataset.id = acc.userId;
            div.innerHTML = `
                <div class="account-info">
                    <span class="account-nickname">${acc.nickname}</span>
                    <span class="account-id">${acc.userId}</span>
                </div>
            `;
            div.onclick = () => {
                container.querySelectorAll(".account-item").forEach(el => el.classList.remove("selected"));
                div.classList.add("selected");
                this._transferSelectedId = acc.userId;
            };
            container.appendChild(div);
        }

        document.getElementById("transfer-out-password").value = "";
        document.getElementById("transfer-out-password").style.display = "";
        document.getElementById("transfer-out-verify-btn").style.display = "";
        document.getElementById("transfer-out-account-select").style.display = "";
        document.getElementById("transfer-out-qr").style.display = "none";
        document.getElementById("transfer-out-progress").style.display = "none";
        this._transferSelectedId = null;
    },

    hideTransferOut() {
        this._popNav();
        const modal = document.getElementById("transfer-out-panel");
        if (modal) modal.classList.remove("show");
        if (modal) modal.style.display = "none";
        this._destroyTransferPeer();
        this._transferOutId = null;
    },

    copyTransferId() {
        if (!this._transferOutId) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(this._transferOutId).then(() => {
                this.showAlert(_i18n.fmt('pchat.alert.idCopied', 'id', this._transferOutId));
            }).catch(() => {
                this.showAlert(_i18n.fmt('pchat.alert.idCopyManual', 'id', this._transferOutId));
            });
        } else {
            this.showAlert(_i18n.fmt('pchat.alert.idCopyManual', 'id', this._transferOutId));
        }
    },

    // ---- UI: Show Transfer In Modal ----
    showTransferIn() {
        const modal = document.getElementById("transfer-in-panel");
        if (modal) modal.classList.add("show");
        if (modal) modal.style.display = "flex";

        document.getElementById("transfer-in-status").textContent = "";
        document.getElementById("transfer-in-id-input").value = "";
        document.getElementById("transfer-in-progress").style.display = "none";
        this._pushNav(() => this.hideTransferIn());
    },

    hideTransferIn() {
        this._popNav();
        const modal = document.getElementById("transfer-in-panel");
        if (modal) modal.classList.remove("show");
        if (modal) modal.style.display = "none";
        this._destroyTransferPeer();
    },

    // ---- UI: Show New Account ----
    showNewAccount() {
        location.hash = "";
        localStorage.removeItem("mr_invite");
        // 隐藏已有账户列表区域，显示注册表单
        const accountList = document.getElementById("account-select-panel");
        if (accountList) accountList.style.display = "none";
        const pwForm = document.getElementById("login-password-panel");
        if (pwForm) pwForm.style.display = "none";
        const inviteInfo = document.getElementById("invite-info");
        if (inviteInfo) inviteInfo.style.display = "block";
        const transferBtn = document.getElementById("transfer-out-btn");
        if (transferBtn) transferBtn.style.display = "none";
        const newAccBtn = document.getElementById("new-account-btn");
        if (newAccBtn) newAccBtn.style.display = "none";
        this._pushNav(() => this._backFromNewAccount());
    },

    _backFromNewAccount() {
        // Reverse showNewAccount: show account list, hide register form
        const accountList = document.getElementById("account-select-panel");
        if (accountList) accountList.style.display = "block";
        const pwForm = document.getElementById("login-password-panel");
        if (pwForm) pwForm.style.display = "none";
        const inviteInfo = document.getElementById("invite-info");
        if (inviteInfo) inviteInfo.style.display = "none";
        const transferBtn = document.getElementById("transfer-out-btn");
        if (transferBtn) transferBtn.style.display = "block";
        const newAccBtn = document.getElementById("new-account-btn");
        if (newAccBtn) newAccBtn.style.display = "block";
    },

    showTransferInScan() {
        console.log('[Transfer-In] showTransferInScan() called');
        this._transferInScanMode = true;
        this.showScanModal();
    },

    _handleTransferInScanResult(qrText) {
        if (!qrText || !qrText.startsWith("transfer_")) {
            this.showAlert("Invalid QR code");
            this._transferInScanMode = false;
            return false;
        }
        const transferId = qrText;  // already "transfer_xxx"
        console.log('[Transfer-In] Scan result:', transferId);
        document.getElementById("transfer-in-id-input").value = transferId;
        this._transferInScanMode = false;
        this.transferInConnect();
        return true;
    },

    _destroyTransferPeer() {
        if (this._transferPeer) {
            try { this._transferPeer.destroy(); } catch(e) {}
            this._transferPeer = null;
        }
        this._transferConn = null;
        this._transferDirection = null;
    },

    // ---- TRANSFER OUT: Verify password ----
    async transferOutVerify() {
        if (!this._transferSelectedId) {
            this.showAlert(_i18n.t('pchat.transfer.error.noSelect'));
            return;
        }

        const pw = document.getElementById("transfer-out-password").value;
        if (!pw) {
            this.showAlert(_i18n.t('pchat.alert.enterPassword'));
            return;
        }

        try {
            // Open source DB
            const sourceDb = await new Promise((resolve, reject) => {
                const dbName = DB.BASE_NAME + "_" + this._transferSelectedId;
                const req = indexedDB.open(dbName, DB.VER);
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });

            // Verify password
            const testKey = await Crypto.deriveAesKey(pw);
            const userStore = sourceDb.transaction("user", "readonly").objectStore("user");
            const user = await new Promise((resolve, reject) => {
                const req = userStore.get("current");
                req.onsuccess = async () => {
                    // Try to decrypt
                    const raw = req.result;
                    if (!raw) { resolve(null); return; }
                    try {
                        const decrypted = await Crypto.decryptAes(testKey, raw.encrypted);
                        resolve(JSON.parse(decrypted));
                    } catch(e) { resolve(null); }
                };
                req.onerror = () => resolve(null);
            });

            if (!user || !user.userId) {
                this.showAlert(_i18n.t('pchat.transfer.error.password'));
                return;
            }

            this._transferSourceDb = sourceDb;
            this._transferSourceKey = testKey;
            this._transferSourceUserId = user.userId;
            this._transferSourceNickname = user.nickname || user.userId;

            // Generate transfer ID
            const transferId = "transfer_" + Crypto.generateId();

            this._transferPeer = new Peer(transferId, {
                debug: 1,
                config: {
                    iceServers: [
                        { urls: 'stun:stun.chat.bilibili.com:3478' },
                        { urls: 'stun:stun.miwifi.com:3478' },
                        { urls: 'stun:stun.cloudflare.com:3478' },
                        { urls: 'stun:stun.nextcloud.com:3478' },
                        { urls: 'stun:stun.l.google.com:19302' },
                    ]
                }
            });
            console.log('[Transfer-Out] Peer created, waiting for open...');

            this._transferPeer.on("open", (id) => {
                console.log("[Transfer-Out] Peer OPEN, signaling registered. My ID:", id);

                const qrDiv = document.getElementById("transfer-out-qr");
                qrDiv.style.display = "block";
                const canvas = document.getElementById("transfer-out-qr-canvas");
                canvas.innerHTML = "";
                new QRCode(canvas, {
                    text: transferId,  // ID already has "transfer_" prefix
                    width: 180,
                    height: 180,
                });

                // Show transfer ID below QR
                const idDisplay = document.getElementById("transfer-out-id-display");
                if (idDisplay) idDisplay.textContent = transferId;
                const copyBtn = document.getElementById("transfer-out-copy-btn");
                if (copyBtn) copyBtn.style.display = "inline-block";
                this._transferOutId = transferId;

                document.getElementById("transfer-out-account-select").style.display = "none";
                document.getElementById("transfer-out-password").style.display = "none";
                document.getElementById("transfer-out-verify-btn").style.display = "none";

                const progress = document.getElementById("transfer-out-progress");
                if (progress) {
                    progress.style.display = "block";
                    progress.querySelector(".transfer-progress-info").textContent = _i18n.t('pchat.transfer.pending');
                }
            });

            this._transferPeer.on("connection", (conn) => {
                console.log("[Transfer-Out] CONNECTION event from:", conn.peer, "metadata:", conn.metadata);
                this._transferConn = conn;
                this._transferDirection = "out";

                conn.on("open", () => {
                    console.log("[Transfer-Out] DataChannel OPEN, ready to transfer");
                });

                conn.on("data", async (data) => {
                    console.log("[Transfer-Out] DATA received, type:", data.type, "table:", data.tableName || data.table || '');
                    await this._handleTransferOutData(data);
                });

                conn.on("error", (err) => {
                    console.error("[Transfer-Out] Connection ERROR:", err.type || err, err);
                });

                conn.on("close", () => {
                    console.log("[Transfer-Out] Connection CLOSED");
                });
            });

            this._transferPeer.on("disconnected", () => {
                console.log("[Transfer-Out] Peer DISCONNECTED from signaling server");
            });

            this._transferPeer.on("error", (err) => {
                console.error("[Transfer-Out] Peer ERROR:", err.type, err.message || err);
                if (err.type === "unavailable-id") {
                    this._transferPeer.destroy();
                    this.transferOutVerify();
                } else if (err.type === "disconnected" || err.type === "network") {
                    this.showAlert(_i18n.t('pchat.alert.peerOffline'));
                }
            });

        } catch (e) {
            console.error("[Transfer] Verify error:", e);
            this.showAlert(_i18n.t('pchat.transfer.error.password'));
        }
    },

    async _handleTransferOutData(data) {
        if (data.type === "transfer-request") {
            const hasTables = data.hasTables || {};
            await this._startSendingTables(hasTables);

        } else if (data.type === "transfer-ack") {
            this._releaseTransferNext();

        } else if (data.type === "table-ack") {
            const tableName = data.tableName;
            console.log("[Transfer-Out] Table", tableName, "done");
            if (this._transferTableQueue) {
                this._transferTableQueue.shift();
                this._sendNextTable();
            }
        }
    },

    async _startSendingTables(hasTables) {
        const tables = ["user", "contacts", "messages", "groups", "invitations", "files"];
        this._transferTableQueue = [...tables];
        this._transferHasTables = hasTables;
        this._transferPendingAck = 0;

        this._transferConn.send({
            type: "transfer-start",
            tables: tables,
            userId: this._transferSourceUserId,
            nickname: this._transferSourceNickname,
        });

        await this._sendNextTable();
    },

    async _sendNextTable() {
        if (this._transferTableQueue.length === 0) {
            this._transferConn.send({ type: "transfer-complete" });

            const progress = document.getElementById("transfer-out-progress");
            if (progress) {
                progress.querySelector(".transfer-progress-info").textContent = _i18n.t('pchat.transfer.complete');
                progress.querySelector(".transfer-progress-fill").style.width = "100%";
            }

            setTimeout(() => {
                this._destroyTransferPeer();
                this.hideTransferOut();
                this.showAlert(_i18n.t('pchat.transfer.complete'));
            }, 1000);
            return;
        }

        const tableName = this._transferTableQueue[0];

        // Get all items from source DB table
        const items = await new Promise((resolve) => {
            try {
                const store = this._transferSourceDb.transaction(tableName, "readonly").objectStore(tableName);
                const req = store.getAll();
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            } catch(e) { resolve([]); }
        });

        console.log("[Transfer-Out] Table", tableName, ":", items.length, "items");

        this._transferConn.send({
            type: "table-start",
            tableName,
            total: items.length,
        });

        const tableLabel = _i18n.t('pchat.transfer.table.' + tableName) || tableName;
        const progress = document.getElementById("transfer-out-progress");
        if (progress) {
            progress.style.display = "block";
            progress.querySelector(".transfer-progress-info").textContent =
                _i18n.fmt('pchat.transfer.sending', 'table', tableLabel);
        }

        this._transferCurrentTable = tableName;
        this._transferCurrentItems = items;
        this._transferCurrentIndex = 0;
        this._transferPendingAck = 0;
        this._transferTableTotal = items.length;

        // Send first batch (up to 5)
        for (let i = 0; i < Math.min(5, items.length); i++) {
            this._sendTransferItem(items[i], i);
        }

        // If no items, send table-done immediately
        if (items.length === 0) {
            this._transferConn.send({ type: "table-done", tableName });
        }
    },

    _sendTransferItem(item, index) {
        try {
            const data = this._convertToJSON(item);
            this._transferConn.send({
                type: "transfer-chunk",
                table: this._transferCurrentTable,
                index,
                total: this._transferTableTotal,
                data,
            });
            this._transferCurrentIndex++;
            this._transferPendingAck++;

            const pct = Math.round((index / this._transferTableTotal) * 100);
            const progress = document.getElementById("transfer-out-progress");
            if (progress) {
                progress.querySelector(".transfer-progress-fill").style.width = pct + "%";
            }
        } catch (e) {
            console.error("[Transfer-Out] Send error:", e);
        }
    },

    _releaseTransferNext() {
        this._transferPendingAck--;

        if (this._transferCurrentIndex < this._transferTableTotal && this._transferPendingAck < 5) {
            const item = this._transferCurrentItems[this._transferCurrentIndex];
            this._sendTransferItem(item, this._transferCurrentIndex);
        } else if (this._transferCurrentIndex >= this._transferTableTotal && this._transferPendingAck <= 0) {
            this._transferConn.send({
                type: "table-done",
                tableName: this._transferCurrentTable,
            });
        }
    },

    _convertToJSON(val) {
        if (val === null || val === undefined) return null;
        if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
        if (val instanceof Date) return { __date: val.getTime() };
        if (val instanceof ArrayBuffer || val instanceof Uint8Array || val instanceof Uint8ClampedArray) {
            return { __uint8: Array.from(new Uint8Array(val)) };
        }
        if (Array.isArray(val)) return val.map(v => this._convertToJSON(v));
        if (typeof val === 'object') {
            const obj = {};
            for (const [k, v] of Object.entries(val)) {
                obj[k] = this._convertToJSON(v);
            }
            return obj;
        }
        return String(val);
    },

    // ---- TRANSFER IN: Connect via main PeerJS ----
    async transferInConnect(transferId) {
        if (!transferId) return;
        console.log('[Transfer-In] Initiating transfer from:', transferId);

        // Clean up any previous transfer
        this._destroyTransferPeer();

        // DB creation is deferred until we receive the user record (to preserve original userId)
        this._transferTargetDb = null;
        this._transferTargetUserId = null;

        // Connect via main PeerJS (same instance as chat)
        console.log('[Transfer-In] Connecting via main PeerJS to:', transferId);
        const state = await PeerConn.connect(transferId);

        // Wait for connection to open (30s timeout)
        const connected = await new Promise((resolve) => {
            if (state.conn.open) { resolve(true); return; }
            const t = setTimeout(() => { console.error("[Transfer-In] Connection timeout"); resolve(false); }, 30000);
            state.conn.on("open", () => { clearTimeout(t); resolve(true); });
            state.conn.on("error", () => { clearTimeout(t); resolve(false); });
        });

        if (!connected) {
            this.showAlert(_i18n.t('pchat.alert.peerOffline'));
            delete PeerConn.peers[transferId];
            return;
        }

        console.log('[Transfer-In] Connected, sending transfer-request');
        this._transferConn = state.conn;
        this._transferDirection = "in";
        state.conn.send({ type: "transfer-request", hasTables: {} });
        this.showAlert(_i18n.t('pchat.transfer.receiving'));
    },

    async _handleTransferInData(data) {
        if (data.type === "transfer-start") {
            this._transferInTables = data.tables || [];
            this._transferInCurrentTable = null;
            this._transferInItems = [];
            this._transferInExpected = 0;
            this._transferInReceived = 0;
            // Use the original userId and nickname
            if (data.userId) {
                this._transferTargetUserId = data.userId;
                this._transferTargetNickname = data.nickname || data.userId;
            } else {
                this._transferTargetUserId = Crypto.generateId();
            }
            await this._ensureTransferDb(this._transferTargetUserId);
            console.log("[Transfer-In] Tables:", this._transferInTables, "userId:", data.userId);

        } else if (data.type === "table-start") {
            this._transferInCurrentTable = data.tableName;
            this._transferInExpected = data.total;
            this._transferInReceived = 0;
            this._transferInItems = new Array(data.total);

            const tableLabel = _i18n.t('pchat.transfer.table.' + data.tableName) || data.tableName;
            const progress = document.getElementById("transfer-in-progress");
            if (progress) {
                progress.style.display = "block";
                progress.querySelector(".transfer-progress-info").textContent =
                    _i18n.fmt('pchat.transfer.receiving', 'table', tableLabel) + ` (0/${data.total})`;
                progress.querySelector(".transfer-progress-fill").style.width = "0%";
            }

        } else if (data.type === "transfer-chunk") {
            const item = this._convertFromJSON(data.data);

            // For files table, store immediately to avoid memory accumulation
            if (data.table === "files" && this._transferTargetDb) {
                try {
                    await new Promise((resolve) => {
                        const s = this._transferTargetDb.transaction("files", "readwrite").objectStore("files");
                        const req = s.put(item);
                        req.onsuccess = () => resolve();
                        req.onerror = () => resolve();
                    });
                } catch(e) {}
            } else {
                this._transferInItems[data.index] = item;
            }
            this._transferInReceived++;

            const pct = Math.round((this._transferInReceived / this._transferInExpected) * 100);
            const tableLabel = _i18n.t('pchat.transfer.table.' + this._transferInCurrentTable) || this._transferInCurrentTable;
            const progress = document.getElementById("transfer-in-progress");
            if (progress) {
                progress.querySelector(".transfer-progress-info").textContent =
                    _i18n.fmt('pchat.transfer.receiving', 'table', tableLabel) +
                    ` (${this._transferInReceived}/${this._transferInExpected})`;
                progress.querySelector(".transfer-progress-fill").style.width = pct + "%";
            }

            this._transferConn.send({
                type: "transfer-ack",
                index: data.index,
                table: data.table,
            });

        } else if (data.type === "table-done") {
            const tableName = data.tableName;
            console.log("[Transfer-In] Table", tableName, "complete:", this._transferInReceived + "/" + this._transferInExpected);

            // For files table, items were already stored inline, skip bulk insert
            if (tableName !== "files") {
                await this._storeTableInTarget(tableName, this._transferInItems);
            } else {
                console.log("[Transfer-In] Files table stored inline, skipping bulk insert");
            }

            this._transferConn.send({ type: "table-ack", tableName });

        } else if (data.type === "transfer-complete") {
            console.log("[Transfer-In] Transfer complete!");

            // Use original userId and nickname from transfer metadata
            const userId = this._transferTargetUserId;
            const nickname = this._transferTargetNickname || "Transferred Account";

            // Close target DB (it will be reopened on login)
            if (this._transferTargetDb) {
                try { this._transferTargetDb.close(); } catch(e) {}
            }

            // Register the account with original userId and nickname
            AccountManager.addAccount(userId || this._transferTargetUserId, nickname);

            const progress = document.getElementById("transfer-in-progress");
            if (progress) {
                progress.querySelector(".transfer-progress-info").textContent = _i18n.t('pchat.transfer.received');
                progress.querySelector(".transfer-progress-fill").style.width = "100%";
            }

            setTimeout(() => {
                this._destroyTransferPeer();
                this.hideTransferIn();
                this.showAlert(_i18n.t('pchat.transfer.received'));
                this.init();
            }, 1500);
        }
    },

    async _ensureTransferDb(userId) {
        if (this._transferTargetDb) return;
        const targetDbName = DB.BASE_NAME + "_" + userId;
        console.log('[Transfer-In] Creating target DB for userId:', userId);
        this._transferTargetDb = await new Promise((resolve, reject) => {
            const req = indexedDB.open(targetDbName, DB.VER);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("user")) db.createObjectStore("user", { keyPath: "id" });
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
                if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
                if (!db.objectStoreNames.contains("invitations")) db.createObjectStore("invitations", { keyPath: "id" });
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async _storeTableInTarget(tableName, items) {
        // Wait for DB to be ready (created asynchronously in transfer-start)
        if (!this._transferTargetDb) {
            console.warn("[Transfer-In] DB not ready yet, waiting...");
            // Poll with short timeout
            for (let i = 0; i < 50; i++) {
                await new Promise(r => setTimeout(r, 100));
                if (this._transferTargetDb) break;
            }
            if (!this._transferTargetDb) {
                console.error("[Transfer-In] DB never became ready");
                return;
            }
        }
        // Remember user records for nickname extraction
        if (tableName === "user") {
            this._transferInItems_user = items;
        }

        const store = this._transferTargetDb.transaction(tableName, "readwrite").objectStore(tableName);

        for (const item of items) {
            if (item === null || item === undefined) continue;
            try {
                await new Promise((resolve) => {
                    const req = store.put(item);
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                });
            } catch (e) {
                console.warn("[Transfer-In] Failed to store", tableName, "item:", e.message);
            }
        }
        console.log("[Transfer-In] Stored", items.filter(Boolean).length, "items in", tableName);
    },

    _convertFromJSON(val) {
        if (val === null || val === undefined) return val;
        if (typeof val !== 'object') return val;
        if (val.__date !== undefined) return new Date(val.__date);
        if (val.__uint8 !== undefined) return new Uint8Array(val.__uint8);
        if (Array.isArray(val)) return val.map(v => this._convertFromJSON(v));
        const obj = {};
        for (const [k, v] of Object.entries(val)) {
            obj[k] = this._convertFromJSON(v);
        }
        return obj;
    },
};

document.addEventListener("DOMContentLoaded", () => ChatApp.init());

// Expose to window for extension hooks
window.ChatApp = ChatApp;
