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
    'pchat.status.reconnecting':         { zh: '重连中...', en: 'Reconnecting...', ja: '再接続中...', de: 'Wiederverbindung...', fr: 'Reconnexion...', es: 'Reconectando...', pt: 'Reconectando...', he: 'מתחבר מחדש...', ko: '재연결 중...', it: 'Riconnessione...' },
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
        // Temp segment files: pchat-${fileId}-0, pchat-${fileId}-1, ...
        // Merged into pchat-${fileId} on completion
        const existing = DB._directWriters[fileId];
        DB._directWriters[fileId] = {
            fileName, segmentCount: existing?.segmentCount || 0,
            rawChunks: existing?.rawChunks || [],
            rawTotal: existing?.rawTotal || 0,
        };
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
        if (entry.bufferedSize > 100 * 1024 * 1024) {
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
            DB._directWriters[fileId] = entry = { rawChunks: [], rawTotal: 0, fileName: fileName || fileId, segmentCount: 0 };
        }
        if (!entry.rawChunks) { entry.rawChunks = []; entry.rawTotal = 0; }
        entry.rawChunks.push(chunk);
        entry.rawTotal += chunk.byteLength || chunk.length;
        if (entry.rawTotal > 100 * 1024 * 1024) {
            await DB._flushRawBuffer(fileId);
        }
    },

    // Flush raw binary chunks to OPFS as a temp segment file
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
        // Write as temp segment file (complete file, not streaming)
        const root = await this._getOprfsRoot();
        const segName = `pchat-${fileId}-${entry.segmentCount || 0}`;
        const segHandle = await root.getFileHandle(segName, { create: true });
        const segWritable = await segHandle.createWritable();
        await segWritable.write(buf);
        await segWritable.close();
        entry.segmentCount = (entry.segmentCount || 0) + 1;
        console.log(`[OPFS] Segment ${segName}: ${(buf.byteLength/1024/1024).toFixed(1)}MB (total segments: ${entry.segmentCount})`);
        // Track written bytes
        const ft = ChatApp.fileTransfer;
        const info = ft.pending[fileId];
        if (info) info._written = (info._written || 0) + buf.byteLength;
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
        // Close & reopen to commit data to OPFS
        await entry.writable.close();
        entry.writable = await entry.handle.createWritable({ keepExistingData: true });
        entry._flushing = false;
        // If more chunks arrived during flush, flush again
        if (entry.buffer && entry.buffer.length > 0) {
            DB._flushDirectBuffer(fileId);
        }
    },

    // Close direct file: merge all temp segments into final file, then delete segments
    async closeDirectFile(fileId) {
        const entry = DB._directWriters[fileId];
        if (!entry) return null;
        // Flush any remaining raw chunks
        if (entry.rawChunks && entry.rawChunks.length > 0) {
            await DB._flushRawBuffer(fileId);
        }
        const name = entry.fileName;
        const segCount = entry.segmentCount || 0;
        delete DB._directWriters[fileId];

        // Merge segments into final file
        if (segCount > 0) {
            const root = await this._getOprfsRoot();
            const finalHandle = await root.getFileHandle(`pchat-${fileId}`, { create: true });
            const finalWritable = await finalHandle.createWritable();
            for (let i = 0; i < segCount; i++) {
                try {
                    const segHandle = await root.getFileHandle(`pchat-${fileId}-${i}`);
                    const segFile = await segHandle.getFile();
                    const buf = await segFile.arrayBuffer();
                    await finalWritable.write(buf);
                    await root.removeEntry(`pchat-${fileId}-${i}`);
                } catch(e) { console.warn('[OPFS] Segment merge skip:', i, e.message); }
            }
            await finalWritable.close();
            console.log(`[OPFS] Merged ${segCount} segments for ${fileId}`);
        }
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
        } catch (e) { /* may not exist */ }
        // Also clean up any leftover temp segments
        for (let i = 0; ; i++) {
            try { await root.removeEntry(`pchat-${fileId}-${i}`); } catch(e) { break; }
        }
    },

    // Close all open writables (called on page unload to commit data)
    _closeAllWriters() {
        for (const [fid, entry] of Object.entries(DB._directWriters)) {
            try { entry.writable.close(); } catch(e) {}
        }
    },

    // Get size of partially-received file (sum of temp segment sizes)
    async getReceiveFileSize(fileId) {
        try {
            const root = await this._getOprfsRoot();
            let totalSize = 0;
            // Also check final merged file
            try {
                const finalHandle = await root.getFileHandle(`pchat-${fileId}`);
                const finalFile = await finalHandle.getFile();
                if (finalFile.size > 0) return finalFile.size;
            } catch(e) { /* no final file yet */ }
            // Sum temp segments
            for (let i = 0; ; i++) {
                try {
                    const segHandle = await root.getFileHandle(`pchat-${fileId}-${i}`);
                    const segFile = await segHandle.getFile();
                    totalSize += segFile.size;
                } catch(e) { break; }  // no more segments
            }
            return totalSize;
        } catch(e) { console.warn('[OPFS] getReceiveFileSize error:', fileId, e.message); return 0; }
    },

    // ---- Outgoing file storage (OPFS, for resume after refresh) ----
    async saveOutgoingFile(fileId, blob) {
        const root = await this._getOprfsRoot();
        const handle = await root.getFileHandle(`send-${fileId}`, { create: true });
        const writable = await handle.createWritable({ keepExistingData: false });
        await writable.write(blob);
        await writable.close();
    },

    async getOutgoingFile(fileId) {
        try {
            const root = await this._getOprfsRoot();
            const handle = await root.getFileHandle(`send-${fileId}`);
            return await handle.getFile();
        } catch(e) { return null; }
    },

    async deleteOutgoingFile(fileId) {
        try {
            const root = await this._getOprfsRoot();
            await root.removeEntry(`send-${fileId}`);
        } catch(e) { /* already deleted */ }
    },

    // Track pending sends in localStorage for resume across refreshes
    _pendingSendsKey: 'pchat_pending_sends',

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
    _amOffline: false,          // true when we lost signaling server
    _reconnectTimers: {},       // peerId → {timer, delay, attempts}
    _heartbeats: {},            // peerId → {intervalId, lastPong, missCount}

    // Heartbeat constants
    HB_INTERVAL: 5000,          // ping every 5s
    HB_TIMEOUT: 10000,          // no pong for 10s → dead

    // Initialize PeerJS instance
    init(myId, callback) {
        PeerConn._debug && console.log("[PeerConn] Connecting with user ID:", myId);
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
            PeerConn._debug && console.log("[PeerConn] Peer ID assigned:", id);
            if (id !== myId) {
                PeerConn._debug && console.warn("[PeerConn] ID mismatch: requested", myId, "but got", id);
            }
            callback(id);
        });

        this.peer.on("connection", async (conn) => {
            // Binary file transfer channel — handle separately
            if (conn.label && conn.label.startsWith('file-')) {
                const fileId = conn.label.slice(5); // 'file-xxx' → 'xxx'
                PeerConn._debug && console.log('[PeerConn] Binary file channel from', conn.peer, 'fileId:', fileId);
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
                                info.chunkCount = (info.chunkCount || 0) + 1;
                                // Snapshot base bytes before adding chunk (for resume: exclude pre-resume bytes)
                                info._resumeBaseBytes = info._resumeBaseBytes ?? (info.totalRawReceived || 0);
                                info.totalRawReceived = (info.totalRawReceived || 0) + (arr.byteLength || arr.length);
                                const nowMs = Date.now();
                                // Detect reconnection gap: if >5s since last chunk, reset speed tracking
                                if (info._lastChunkTime && nowMs - info._lastChunkTime > 5000) {
                                    info._recvStartTime = nowMs;
                                    info._resumeBaseBytes = info.totalRawReceived;
                                    info._speedWindow = [];
                                }
                                info._recvStartTime = info._recvStartTime || nowMs;
                                info._lastChunkTime = nowMs;
                                const netPct = info.size > 0 ? (info.totalRawReceived / info.size * 100) : 0;
                                info._written = info._written || 0;
                                const pct = netPct;
                                _chunkCount++;
                                // Calculate speed from NEW bytes only (exclude pre-resume data)
                                const elapsedSec = Math.max((nowMs - info._recvStartTime) / 1000, 0.01);
                                const currentSpd = (info.totalRawReceived - info._resumeBaseBytes) / elapsedSec;
                                // Sliding window avg filter — seed with first sample, then FIFO
                                info._speedWindow = info._speedWindow || [];
                                if (info._speedWindow.length === 0) {
                                    for (let i = 0; i < 100; i++) info._speedWindow.push(currentSpd);
                                } else {
                                    info._speedWindow.push(currentSpd);
                                    info._speedWindow.shift();
                                }
                                const avgSpd = info._speedWindow.reduce((a, b) => a + b, 0) / 100;
                                const speedStr = avgSpd > 1048576 ? `${(avgSpd/1048576).toFixed(1)} MB/s` : `${(avgSpd/1024).toFixed(0)} KB/s`;
                                const etaSec = info.size > info.totalRawReceived ? Math.round((info.size - info.totalRawReceived) / avgSpd) : 0;
                                // Store for receiver's own display (available from chunk 1)
                                ChatApp._transferAckSpeed = ChatApp._transferAckSpeed || {};
                                ChatApp._transferAckSpeed[fileId] = speedStr;
                                ChatApp._transferAckEta = ChatApp._transferAckEta || {};
                                ChatApp._transferAckEta[fileId] = etaSec;
                                // Every 10 chunks: send ack to sender with speed and ETA
                                if (info.chunkCount % 10 === 0) {
                                    const ackPeer = PeerConn.peers[info.peerId];
                                    if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
                                        ackPeer.conn.send({ type: 'file-ack', fileId, progress: Math.round(netPct), speed: speedStr, etaSec });
                                    }
                                }
                                ChatApp._updateTransferProgress(fileId, pct, null);
                                // Restore status if reconnected (was "重连中...")
                                const stEl = document.getElementById(`transfer-status-${fileId}`);
                                if (stEl && stEl.textContent === '重连中...') {
                                    stEl.textContent = '接收中...';
                                }
                                // Update sidebar progress (throttled: every 500ms or every 100th chunk)
                                const ar = ChatApp._activeReceives[info.peerId];
                                if (ar) {
                                    const now = Date.now();
                                    if (!ar._lastSidebarUpdate || now - ar._lastSidebarUpdate >= 500 || info.chunkCount % 100 === 0) {
                                        ar._lastSidebarUpdate = now;
                                        const p = Math.round(netPct);
                                        ar.pct = p;
                                        ChatApp._updateSidebarTransfer(info.peerId, `📥 ${ar.name.substring(0, 15)}${ar.name.length > 15 ? '...' : ''} ${p}%`);
                                    }
                                }
                                // Finalize when all data received
                                if (info.totalRawReceived >= info.size) {
                                    ChatApp._finalizeDirectReceive(fileId);
                                }
                            }
                        }
                });
                conn.on('close', async () => {
                    PeerConn._debug && console.log('[PeerConn] Binary file channel closed:', fileId);
                    // Safety net: if data complete but not finalized yet
                    const ft = ChatApp.fileTransfer;
                    const info = ft.pending[fileId];
                    if (info && info.totalRawReceived >= info.size) {
                        await ChatApp._finalizeDirectReceive(fileId);
                    }
                });
                conn.on('error', (e) => PeerConn._debug && console.error('[PeerConn] Binary file channel error:', fileId, e));
                return;
            }
            PeerConn._debug && console.log("[PeerConn] Incoming connection from", conn.peer);
            let myKey = null;
            const contact = ChatApp.contacts.find(c => c.userId === conn.peer);
            if (contact && contact.keypair) {
                myKey = contact.keypair;
                PeerConn._debug && console.log(`[PeerConn] Receiver loaded keypair for ${conn.peer}, fp=${Crypto.keyFingerprint(myKey.publicKey)}`);
            }
            const state = { conn, myKey, peerKey: null, connected: false };
            this.peers[conn.peer] = state;
            
            // 注册 open 回调（PeerJS 要求在 connection 回调中立即注册）
            conn.on("open", () => {
                PeerConn._debug && console.log(`[PeerConn] Connection opened from ${conn.peer}`);
            });
            
            this._bind(conn, conn.peer, false);
        });

        this.peer.on("call", (call) => {
            PeerConn._debug && console.log("[PeerConn] Incoming call from", call.peer);
            ChatApp._onIncomingPeerCall(call);
        });

        this.peer.on("error", (err) => {
            if (err.type === "peer-unavailable") {
                PeerConn._debug && console.log(`[PeerConn] ${err.message}`);
            } else {
                PeerConn._debug && console.error(`[PeerConn] Error: ${err.type} ${err.message}`);
            }
        });

        this.peer.on("disconnected", () => {
            PeerConn._debug && console.log("[PeerConn] Disconnected from server, reconnecting...");
            this._amOffline = true;
            // Stop all reconnect timers — we'll restart them when signaling recovers
            for (const pid of Object.keys(this._reconnectTimers)) {
                this._cancelReconnect(pid);
            }
            this.peer.reconnect();
        });
    },

    // Connect to a peer via data connection
    async connect(peerId) {
        // If we're recovering from offline, always force-reconnect (old DC may be in limbo)
        if (!this._amOffline && this.peers[peerId] && this.peers[peerId].conn && this.peers[peerId].conn.open) {
            PeerConn._debug && console.log(`[PeerConn] Already connected to ${peerId}`);
            return this.peers[peerId];
        }
        // Clean up stale state
        if (this.peers[peerId] && this.peers[peerId].conn) {
            try { this.peers[peerId].conn.close(); } catch(e) {}
        }
        this._stopHeartbeat(peerId);
        this._cancelReconnect(peerId);

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
            PeerConn._debug && console.log(`[PeerConn] Connected to ${peerId}`);
            const state = this.peers[peerId];
            if (!state) return;
            state.connected = true;
            ChatApp._renderContacts();
            PeerConn._cancelReconnect(peerId);  // reset backoff on success
            PeerConn._startHeartbeat(peerId);

            if (initiator) {
                const contact = ChatApp.contacts.find(c => c.userId === peerId);
                PeerConn._debug && console.log(`[PeerConn] Initiator to ${peerId}, contact found: ${!!contact}, has publicKey: ${contact && !!contact.publicKey}`);
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
                PeerConn._debug && console.log(`[PeerConn] Receiver to ${peerId}, contact found: ${!!contact}, has publicKey: ${contact && !!contact.publicKey}`);
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
            // Request resume for any incomplete file transfers
            ChatApp._requestFileResume(peerId);
            // Resume voice call if it was in reconnect mode
            if (ChatApp.call._reconnecting) {
                console.log("[Call] Reconnecting call to", peerId);
                ChatApp.call._reconnecting = false;
                if (ChatApp.call.direction === "sent") {
                    PeerConn.call(peerId);
                }
                // received calls: caller will re-initiate
            }
        });

        conn.on("error", (err) => {
            PeerConn._debug && console.log(`[PeerConn] ${peerId} connection error:`, err);
        });

        conn.on("data", async (data) => {
            try {
                if (!data || !data.type) { PeerConn._debug && console.log(`[PeerConn] ${peerId} data ignored (no type)`, data); return; }
                if (data.type !== "_ping" && data.type !== "_pong") {
                    PeerConn._debug && console.log(`[PeerConn] ${peerId} data type=${data.type}`, data);
                }
                const state = this.peers[peerId];
                if (data.type === "add") {
                    PeerConn._debug && console.log(`[PeerConn] ${peerId} received add request`, data);
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
                        PeerConn._debug && console.log(`[PeerConn] Ignoring chat from ${peerId} - handshake not complete`);
                        return;
                    }
                    let content = data.content;
                    if (data.encrypted && state && state.myKey) {
                        PeerConn._debug && console.log(`[PeerConn] Decrypting from ${peerId}, myKey pubFp=${Crypto.keyFingerprint(state.myKey.publicKey)}`);
                        PeerConn._debug && console.log(`[PeerConn] Decrypting from ${peerId}, myKey privFp=${Crypto.keyFingerprint(state.myKey.privateKey)}`);


                        try { content = await Crypto.decryptChunks(state.myKey.privateKey, data.content); }
                        catch(e) { PeerConn._debug && console.warn(`[PeerConn] RSA decrypt failed for ${peerId}, falling back to plaintext:`, e.message, '| privKeyLen:', state.myKey.privateKey.length, '| dataLen:', data.content.length); }
                    } else {
                        PeerConn._debug && console.log(`[PeerConn] Not decrypting from ${peerId}, encrypted=${data.encrypted}, hasMyKey=${!!(state && state.myKey)}`);
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
                } else if (data.type === "file-cancel") {
                    ChatApp._onFileCancel(peerId, data);
                } else if (data.type === "file-resume") {
                    // Sender: receiver wants us to resume a transfer
                    ChatApp._handleFileResume(peerId, data);
                } else if (data.type === "receipt") {
                    // Received read receipt for a message
                    ChatApp._onReceiptReceived(peerId, data.msgId);
                } else if (data.type === "id-change") {
                    // Contact changed their ID - update contact list
                    ChatApp._onIdChangeNotification(peerId, data);
                } else if (data.type === "_ping") {
                    // Heartbeat: reply pong immediately
                    if (state && state.conn && state.conn.open) {
                        state.conn.send({ type: "_pong", ts: data.ts });
                    }
                } else if (data.type === "_pong") {
                    // Heartbeat: update lastPong timestamp
                    const hb = PeerConn._heartbeats[peerId];
                    if (hb) { hb.lastPong = Date.now(); hb.missCount = 0; }
                } else if (data.type === "transfer-request" || data.type === "transfer-start" ||
                           data.type === "table-start" || data.type === "table-done" ||
                           data.type === "transfer-chunk" || data.type === "transfer-complete") {
                    // Transfer messages routed to transfer handler
                    await ChatApp._handleTransferInData(data);
                }
            } catch (err) { PeerConn._debug && console.error("[PeerConn] parse:", err); }
        });

        conn.on("close", () => {
            PeerConn._debug && console.log(`[PeerConn] Disconnected from ${peerId}`);
            const state = this.peers[peerId];
            if (state) state.connected = false;
            PeerConn._stopHeartbeat(peerId);
            // Update active transfer cards: receiving → reconnecting, speed → 0
            ChatApp._markTransfersReconnecting(peerId);
            if (!PeerConn._amOffline) {
                ChatApp._renderContacts();
            }
        });

        conn.on("error", (err) => {
            PeerConn._debug && console.error(`[PeerConn] Connection error (${peerId}):`, err);
        });
    },

    // ---- Heartbeat ----
    _startHeartbeat(peerId) {
        this._stopHeartbeat(peerId);
        const hb = { lastPong: Date.now(), missCount: 0, intervalId: null };
        hb.intervalId = setInterval(() => {
            const state = this.peers[peerId];
            if (!state || !state.conn || !state.conn.open) {
                this._stopHeartbeat(peerId);
                return;
            }
            // Send ping
            state.conn.send({ type: "_ping", ts: Date.now() });
            // Check timeout
            const elapsed = Date.now() - hb.lastPong;
            if (elapsed > this.HB_TIMEOUT) {
                hb.missCount++;
                PeerConn._debug && console.warn(`[PeerConn] Heartbeat timeout for ${peerId}, miss=${hb.missCount}, elapsed=${elapsed}ms`);
                if (hb.missCount >= 2) {
                    // DC is dead
                    PeerConn._debug && console.warn(`[PeerConn] DC dead for ${peerId}, closing`);
                    this._stopHeartbeat(peerId);
                    if (state.conn) { try { state.conn.close(); } catch(e) {} }
                    state.connected = false;
                    ChatApp._markTransfersReconnecting(peerId);
                    ChatApp._renderContacts();
                    // If our signaling is still up, try to reconnect (covers network partition)
                    if (!this._amOffline) {
                        this._scheduleReconnect(peerId);
                    }
                }
            }
        }, this.HB_INTERVAL);
        this._heartbeats[peerId] = hb;
    },

    _stopHeartbeat(peerId) {
        const hb = this._heartbeats[peerId];
        if (hb) {
            if (hb.intervalId) clearInterval(hb.intervalId);
            delete this._heartbeats[peerId];
        }
    },

    // ---- Reconnect backoff ----
    // Schedule reconnect with exponential backoff: 2→4→6→8→10→12→14→16→18→20→20→...
    _scheduleReconnect(peerId) {
        // Only reconnect for contacts with completed handshake
        const contact = ChatApp.contacts.find(c => c.userId === peerId);
        if (!contact || !contact.publicKey) return;

        const existing = this._reconnectTimers[peerId];
        if (existing && existing.timer) return; // already scheduled

        const rt = existing || { attempts: 0, delay: 0, timer: null };
        // Calculate backoff
        if (rt.attempts < 10) {
            rt.delay = (rt.attempts + 1) * 2000;  // 2s, 4s, ..., 20s
        } else {
            rt.delay = 20000;  // cap at 20s
        }
        rt.attempts++;
        PeerConn._debug && console.log(`[PeerConn] Scheduling reconnect to ${peerId}, attempt=${rt.attempts}, delay=${rt.delay}ms`);

        rt.timer = setTimeout(async () => {
            const wasAttempts = rt.attempts;  // save before delete
            delete this._reconnectTimers[peerId];
            if (!this._amOffline) {
                try {
                    await this.connect(peerId);
                } catch(e) {
                    PeerConn._debug && console.warn(`[PeerConn] Reconnect failed for ${peerId}:`, e.message);
                }
            }
            const s = this.peers[peerId];
            if (!s || !s.connected) {
                // Pass saved attempts so counter doesn't reset
                const nextRt = { attempts: wasAttempts, delay: 0, timer: null };
                this._reconnectTimers[peerId] = nextRt;
                this._scheduleReconnect(peerId);
            }
        }, rt.delay);
        this._reconnectTimers[peerId] = rt;
    },

    _cancelReconnect(peerId) {
        const rt = this._reconnectTimers[peerId];
        if (rt) {
            if (rt.timer) clearTimeout(rt.timer);
            delete this._reconnectTimers[peerId];
        }
    },

    // Called when our signaling recovers: reconnect all contacts that lost DC
    _reconnectAll() {
        for (const c of ChatApp.contacts) {
            if (!c.publicKey) continue;
            const s = this.peers[c.userId];
            if (!s || !s.connected) {
                this._scheduleReconnect(c.userId);
            }
        }
    },

    // Send chat message to peer
    async send(peerId, content, msgId) {
        const s = this.peers[peerId];
        if (!s || !s.conn || !s.conn.open) {
            PeerConn._debug && console.log(`[PeerConn] Cannot send to ${peerId}, conn.open=${s ? s.conn?.open : false}`);
            return false;
        }
        PeerConn._debug && console.log(`[PeerConn] Sending chat to ${peerId}: ${content.substring(0, 50)}`);
        // 公钥交换完成后用 RSA 加密
        let sendContent = content;
        if (s.peerKey) {
            PeerConn._debug && console.log(`[PeerConn] Encrypting for ${peerId}, peerKey fp=${Crypto.keyFingerprint(s.peerKey)}`);
            try { sendContent = await Crypto.encryptChunks(s.peerKey, content); }
            catch(e) { PeerConn._debug && console.warn('[PeerConn] Encrypt failed:', e.message); }
        } else {
            PeerConn._debug && console.log(`[PeerConn] No peerKey for ${peerId}, sending plaintext`);
        }
        s.conn.send({ type: "chat", id: msgId, content: sendContent, ts: Date.now(), encrypted: sendContent !== content });
        return true;
    },

    // Flush pending messages (text, voice, files)
    async flushPending(peerId) {
        const msgs = await ChatApp.getMessages(peerId);
        const pending = msgs.filter(m => m.direction === "sent" && !m.sent && m.type !== "call-log");
        const state = this.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;
        PeerConn._debug && console.log(`[PeerConn] Flushing ${pending.length} pending messages to ${peerId}`);
        for (const m of pending) {
            if (m.type === "voice" && m.content) {
                state.conn.send({ type: "voice", content: m.content, ts: m.ts, duration: m.duration || 0 });
                m.sent = true;
                ChatApp.DB_put_msg(m);
            } else if (m.type === "file" || m.type === "image") {
                // File retry: handled by ChatApp._retryPendingFile
                ChatApp._retryPendingFile(peerId, m);
            } else if (m.content !== undefined) {
                let sendContent = m.content;
                if (state.peerKey) {
                    try { sendContent = await Crypto.encryptChunks(state.peerKey, m.content); }
                    catch(e) { PeerConn._debug && console.warn('[PeerConn] Flush encrypt failed:', e.message); }
                }
                state.conn.send({ type: "chat", id: m.id, content: sendContent, ts: m.ts, encrypted: sendContent !== m.content });
                m.sent = true;
                ChatApp.DB_put_msg(m);
            }
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
            PeerConn._debug && console.error("[PeerConn] Call error:", err);
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
    // Active receives for sidebar progress (peerId → {fileId, name, size, pct})
    _activeReceives: {},
    // Active sends for sidebar + re-entry progress (peerId → {fileId, name, size, pct})
    _activeSends: {},
    // Active Binary DC send channels for cancellation (fileId → DataConnection)
    _binarySendChannels: {},
    // Pending sends persisted to localStorage: {fileId: {name, size, mime, peerId, progress, ts}}
    _pendingSends: {},
    _pendingReceives: {},  // {fileId: {name, size, peerId, ts}} for resume after refresh

    _loadPendingSends() {
        try {
            const raw = localStorage.getItem('pchat_pending_sends');
            if (raw) this._pendingSends = JSON.parse(raw);
        } catch(e) { this._pendingSends = {}; }
        // Also load pending receives (for resume after refresh)
        try {
            const raw2 = localStorage.getItem('pchat_pending_receives');
            if (raw2) this._pendingReceives = JSON.parse(raw2);
        } catch(e) { this._pendingReceives = {}; }
    },
    _savePendingSends() {
        localStorage.setItem('pchat_pending_sends', JSON.stringify(this._pendingSends));
    },
    _clearPendingSend(fileId, markCompleted) {
        if (markCompleted && this._pendingSends[fileId]) {
            this._pendingSends[fileId].completed = true;  // ≥10MB: keep for re-entry rendering
            this._savePendingSends();
        } else {
            delete this._pendingSends[fileId];  // <10MB: stored in DB, remove tracking
            this._savePendingSends();
        }
    },
    _savePendingReceives() {
        localStorage.setItem('pchat_pending_receives', JSON.stringify(this._pendingReceives));
    },

    async clearOPFS() {
        if (!confirm('清空所有 OPFS 缓存？正在进行中的传输会中断。')) return;
        try {
            const root = await DB._getOprfsRoot();
            const names = [];
            for await (const [name] of root.entries()) { names.push(name); }
            for (const name of names) {
                try { await root.removeEntry(name, { recursive: true }); } catch(e) {}
            }
        } catch(e) {
            console.warn('[OPFS] List failed:', e.message);
        }
        this._pendingSends = {}; this._savePendingSends();
        this._pendingReceives = {}; this._savePendingReceives();
        for (const k of Object.keys(DB._directWriters)) delete DB._directWriters[k];
        this.showAlert('OPFS 已清空');
    },

    // ---- Notification helpers ----
    async _notifySystem(title, body) {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/icon-192.png' });
        }
    },

    _playBeep() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 800;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
        } catch(e) {}
    },

    _playRingtone() {
        this._stopRingtone();
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'square';
            gain.gain.value = 0.2;
            let high = true;
            const interval = setInterval(() => {
                osc.frequency.value = high ? 1000 : 800;
                high = !high;
            }, 500);
            osc.start();
            this.call._ringOsc = { osc, gain, ctx, interval };
        } catch(e) {}
    },

    _stopRingtone() {
        if (this.call._ringOsc) {
            clearInterval(this.call._ringOsc.interval);
            try { this.call._ringOsc.osc.stop(); } catch(e) {}
            this.call._ringOsc = null;
        }
    },

    _shouldNotify(peerId) {
        // Page is active/visible → skip notification
        if (document.visibilityState === 'visible') return false;
        // Currently viewing this conversation → skip
        if (this.activeConv && this.activeConv.id === peerId) return false;
        const contact = this.contacts.find(c => c.userId === peerId);
        if (!contact) return false;
        return contact.notifyEnabled !== false;
    },

    async _sendMessageNotification(peerId, title, body) {
        if (!this._shouldNotify(peerId)) return;
        this._notifySystem(title, body);
        this._playBeep();
        if (navigator.vibrate) navigator.vibrate(200);
    },

    toggleNotify() {
        if (!this.activeConv || this.activeConv.type !== 'contact') return;
        const contact = this.contacts.find(c => c.userId === this.activeConv.id);
        if (!contact) return;
        // Explicit toggle: true→false, false→true (also handles undefined→false)
        contact.notifyEnabled = !contact.notifyEnabled;
        this.saveContact(contact);
        this._updateNotifyBtn(!!contact.notifyEnabled);
    },

    _updateNotifyBtn(enabled) {
        const btn = document.getElementById('notify-btn');
        if (!btn) return;
        if (enabled) {
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 4c-4 0-7 3-7 7v5l-3 4h20l-3-4v-5c0-4-3-7-7-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="13" y1="26" x2="19" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
        } else {
            btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 32 32"><path d="M16 4c-4 0-7 3-7 7v5l-3 4h20l-3-4v-5c0-4-3-7-7-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><line x1="13" y1="26" x2="19" y2="26" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="16" y1="26" x2="16" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="8" y1="8" x2="24" y2="24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
        }
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
            PeerConn._debug && console.log('[PeerConn] Cannot accept, no connection');
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
            PeerConn._debug && console.log(`[PeerConn] No state for ${peerId}, skipping`);
            return;
        }

        // 如果已经是好友（有公钥），忽略重复请求
        const existing = this.contacts.find(c => c.userId === peerId);
        if (existing && existing.publicKey) {
            PeerConn._debug && console.log(`[PeerConn] Already friends with ${peerId}, ignoring add`);
            return;
        }

        // 新联系人，显示接受卡片
        PeerConn._debug && console.log(`[PeerConn] Add request from ${peerId} (${nickname}), publicKey present: ${!!data.publicKey}`);
        this._pendingFriendRequest = { peerId, nickname, data: { publicKey: data.publicKey } };

        // 显示内联卡片
        PeerConn._debug && console.log(`[PeerConn] Showing friend request card for ${nickname}`);
        const card = document.getElementById('friend-request-card');
        PeerConn._debug && console.log(`[PeerConn] friend-request-card element:`, card);
        if (card) {
            document.getElementById('friend-request-nick').textContent = nickname;
            document.getElementById('friend-request-id').textContent = peerId;
            card.style.display = 'block';
            PeerConn._debug && console.log(`[PeerConn] Card display set to:`, card.style.display);
        } else {
            PeerConn._debug && console.warn(`[PeerConn] friend-request-card not found in DOM!`);
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
        PeerConn._stopHeartbeat(userId);
        PeerConn._cancelReconnect(userId);
        // If currently viewing this conversation, close it
        if (this.activeChatId === userId) this.closeChatView();
        this._renderContacts();
    },

    // ---- PeerJS initialization ----
    _initPeer() {
        this._loadPendingSends();
        PeerConn.init(this.my.id, async (id) => {
            console.log("[PeerJS] Initialized with ID:", id);
            
            // Check if ID was taken by someone else
            if (id !== this.my.id) {
                PeerConn._debug && console.warn("[PeerConn] ID conflict: your ID", this.my.id, "is taken");
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
            
            const wasOffline = PeerConn._amOffline;
            PeerConn._amOffline = false;
            
            if (wasOffline) {
                // Recovering from signaling loss — use backoff reconnect
                PeerConn._reconnectAll();
            } else {
                // First login — immediate auto-connect
                for (const c of this.contacts) {
                    if (c.publicKey) {
                        console.log(`[PeerJS] Auto-connect to ${c.userId} (${c.nickname})`);
                        await PeerConn.connect(c.userId);
                    }
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
        if (contact.notifyEnabled === undefined) contact.notifyEnabled = true;
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
        // Notification
        if (document.visibilityState !== 'visible' && contact && contact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === peerId)) {
            const title = contact.nickname || peerId;
            const body = typeof rawContent === 'string' ? (rawContent.length > 50 ? rawContent.substring(0, 50) : rawContent) : '';
            this._notifySystem(title, body);
            this._playBeep();
            if (navigator.vibrate) navigator.vibrate(200);
        }
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
        // Notification
        if (document.visibilityState !== 'visible' && contact && contact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === peerId)) {
            const title = contact.nickname || peerId;
            this._notifySystem(title, _i18n.t('pchat.msg.voice'));
            this._playBeep();
            if (navigator.vibrate) navigator.vibrate(200);
        }
    },

    // ---- File receive: header ----
    _onFileHeader(peerId, d) {
        const ft = this.fileTransfer;
        // If already resumed from refresh, skip header (stale re-delivery)
        if (ft.pending[d.fileId]) {
            console.log(`[File] Header skipped (already resumed): ${d.name}, fileId=${d.fileId}`);
            return;
        }
        const info = {
            peerId,
            name: d.name,
            mime: d.mime,
            size: d.size,
            isImage: d.isImage,
            directTransfer: !!d.directTransfer,
        };

        if (d.directTransfer) {
            info.binaryChannel = !!d.binaryChannel;
            info.expectedBase64Len = -1;
            info.expectedHash = '';
            info.totalChunks = -1;
            info.chunkCount = 0;
            info.totalBase64Received = 0;
            info.totalRawReceived = 0;
            info._written = 0;
            info.lastAckBytes = 0;
            info._recvStartTime = Date.now();
            console.log(`[File] DIRECT header: ${d.name} (${(d.size/1024/1024).toFixed(1)}MB)`);
            DB.openDirectFile(d.fileId, d.name).catch(e => console.error('[OPFS] openDirectFile failed:', e));
            // Progress bar only for files ≥10MB
            if (d.size >= 10 * 1024 * 1024 && this.activeConv && this.activeConv.id === peerId) {
                ChatApp._insertTransferCard(d.fileId, d.name, d.size, false);
            }
        } else {
            info.parts = new Array(d.totalChunks);
            info.totalChunks = d.totalChunks;
            info.chunkCount = 0;
            info.expectedBase64Len = d.base64Len || 0;
            info.expectedHash = d.hash || "";
            console.log(`[File] Header received: ${d.name} (${d.size}B, ${d.totalChunks} chunks, hash=${d.hash ? d.hash.slice(0,8)+'...' : 'none'})`);
            // Progress bar only for files ≥10MB
            if (d.size >= 10 * 1024 * 1024 && this.activeConv && this.activeConv.id === peerId) {
                ChatApp._insertTransferCard(d.fileId, d.name, d.size, false);
            }
        }
        ft.pending[d.fileId] = info;

        // Track active receive for sidebar progress (only files ≥10MB)
        if (d.size >= 10 * 1024 * 1024) {
            this._activeReceives[peerId] = { fileId: d.fileId, name: d.name, size: d.size, pct: 0 };
            this._renderContacts();
            // Persist for resume after page refresh
            if (d.directTransfer) {
                this._pendingReceives[d.fileId] = { name: d.name, size: d.size, peerId, ts: Date.now() };
                this._savePendingReceives();
                console.log(`[File] Saved pending receive: ${d.name} (${(d.size/1024/1024).toFixed(1)}MB) from ${peerId}, fileId=${d.fileId}`);
            }
        }
        // Notification for incoming file
        const fContact = this.contacts.find(c => c.userId === peerId);
        if (document.visibilityState !== 'visible' && fContact && fContact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === peerId)) {
            const title = fContact.nickname || peerId;
            const body = (_i18n.t('pchat.file.prefixFile') + ' ' + d.name).length > 50 ? (_i18n.t('pchat.file.prefixFile') + ' ' + d.name).substring(0, 50) : (_i18n.t('pchat.file.prefixFile') + ' ' + d.name);
            this._notifySystem(title, body);
            this._playBeep();
            if (navigator.vibrate) navigator.vibrate(200);
        }
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

            // Update sidebar progress (throttled by _updateTransferProgress's 100ms)
            const ar = ChatApp._activeReceives[info.peerId];
            if (ar) { ar.pct = estPct; ChatApp._updateSidebarTransfer(info.peerId, `📥 ${ar.name.substring(0, 15)}${ar.name.length > 15 ? '...' : ''} ${estPct}%`); }

            // Send intermediate ack every ~10MB received (raw estimate)
            const rawReceived = Math.round(info.totalBase64Received * 0.75);
            const lastAckAt = info.lastAckBytes || 0;
            if (rawReceived - lastAckAt >= 10 * 1024 * 1024) {
                // Calculate instantaneous receive speed since last ack
                const nowMs = Date.now();
                const lastAckTime = info.lastAckTime || info._recvStartTime || nowMs;
                const deltaBytes = rawReceived - lastAckAt;
                const deltaSec = Math.max((nowMs - lastAckTime) / 1000, 0.01);
                const spd = deltaBytes / deltaSec;
                // Sliding window average filter — seed with first sample, then FIFO
                info._speedWindow = info._speedWindow || [];
                if (info._speedWindow.length === 0) {
                    for (let i = 0; i < 100; i++) info._speedWindow.push(spd);
                } else {
                    info._speedWindow.push(spd);
                    info._speedWindow.shift();
                }
                const avgSpd = info._speedWindow.reduce((a, b) => a + b, 0) / 100;
                const speedStr = avgSpd > 1024*1024 ? `${(avgSpd/1024/1024).toFixed(1)} MB/s` : `${(avgSpd/1024).toFixed(0)} KB/s`;
                const etaSec = info.size > rawReceived ? Math.round((info.size - rawReceived) / avgSpd) : 0;
                info.lastAckBytes = rawReceived;
                info.lastAckTime = nowMs;
                // Store for receiver's own display too
                ChatApp._transferAckSpeed = ChatApp._transferAckSpeed || {};
                ChatApp._transferAckSpeed[d.fileId] = speedStr;
                ChatApp._transferAckEta = ChatApp._transferAckEta || {};
                ChatApp._transferAckEta[d.fileId] = etaSec;
                const ackPeer = PeerConn.peers[info.peerId];
                if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
                    ackPeer.conn.send({ type: "file-ack", fileId: d.fileId, progress: Math.round(rawReceived / info.size * 100), speed: speedStr, etaSec });
                }
            }
            return;
        }

        if (info.parts[d.index]) return; // duplicate
        info.parts[d.index] = d.data;
        info.chunkCount++;

        // Update sidebar progress (throttled: every 500ms or every 10th chunk)
        const ar = this._activeReceives[info.peerId];
        if (ar && info.totalChunks > 0) {
            const pct = Math.round(info.chunkCount / info.totalChunks * 99);
            const now = Date.now();
            if (!ar._lastSidebarUpdate || now - ar._lastSidebarUpdate >= 500 || info.chunkCount % 10 === 0) {
                ar._lastSidebarUpdate = now;
                ar.pct = pct;
                this._updateSidebarTransfer(info.peerId, `📥 ${ar.name.substring(0, 15)}${ar.name.length > 15 ? '...' : ''} ${pct}%`);
            }
        }

        // All chunks received → finalize (no footer needed)
        if (info.totalChunks > 0 && info.chunkCount >= info.totalChunks) {
            this._finalizeChunkedReceive(d.fileId);
        }
    },

    // ---- File receive: all chunks arrived → assemble, validate, store, ack ----
    async _finalizeChunkedReceive(fileId) {
        const ft = this.fileTransfer;
        const info = ft.pending[fileId];
        if (!info || info._finalized) return;
        info._finalized = true;  // prevent double-trigger from footer safety net

        if (info.chunkCount < info.totalChunks) {
            console.warn("[File] Finalize called before all chunks, missing chunks");
            return;
        }

        console.log(`[File] All chunks received for ${info.name}, assembling...`);
        const fullBase64 = info.parts.join('');

        // Integrity check: total bytes match declared size
        // base64 is ~4/3 of raw bytes, so raw size ≈ fullBase64.length * 0.75
        const estimatedRaw = Math.round(fullBase64.length * 0.75);
        if (info.expectedBase64Len && fullBase64.length !== info.expectedBase64Len) {
            console.error(`[File] Length mismatch: expected ${info.expectedBase64Len}, got ${fullBase64.length}`);
            delete ft.pending[fileId];
            ChatApp.showAlert(_i18n.t('pchat.file.incomplete'));
            return;
        }
        console.log(`[File] Size check OK: ${fullBase64.length} bytes base64 (≈${(estimatedRaw/1024).toFixed(0)}KB raw, declared ${info.size}B)`);

        // Integrity check: hash
        if (info.expectedHash) {
            try {
                const computedHash = ChatApp._hashBase64(fullBase64);
                if (computedHash !== info.expectedHash) {
                    console.error(`[File] Hash mismatch`);
                    delete ft.pending[fileId];
                    ChatApp.showAlert(_i18n.t('pchat.file.checksumFail'));
                    return;
                }
                console.log(`[File] Hash check OK`);
            } catch (e) {
                console.warn("[File] Hash check failed:", e);
            }
        }

        delete ft.pending[fileId];

        const peerId = info.peerId;
        const now = Date.now();
        const id = `msg_${peerId}_${now}_${Date.now()}`;

        // For images: generate thumbnail, store full in files store
        let storedData = fullBase64;
        let storedFileId = null;
        if (info.isImage) {
            storedFileId = fileId;
            const thumb = await DB.generateThumbnail(fullBase64, info.mime, 200);
            storedData = thumb || fullBase64;
            console.log('[File] Storing file aesKey fingerprint:', this.my.aesKey.substring(0, 16) + '...');
            await DB.putFile(fileId, fullBase64, info.mime, this.my.aesKey);
            console.log('[File] File stored, fileId:', fileId, 'dataLen:', fullBase64.length);
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

        await DB.put("messages", msg, this.my.aesKey);
        console.log('[File] Message stored, msgId:', id);

        // Replace progress card with message bubble
        const progressRow = document.getElementById(`transfer-${fileId}`);
        if (progressRow) progressRow.remove();
        delete this._transferThrottle[fileId];
        delete this._transferStartTimes[fileId]; 
        delete this._transferSizes?.[fileId];
        delete this._activeReceives[peerId];
        this._renderContacts();
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
        // Notification for file completion
        if (document.visibilityState !== 'visible' && contact && contact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === peerId)) {
            const title = contact.nickname || peerId;
            const body = (info.isImage ? '📷 ' + info.name : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name)).length > 50
                ? (info.isImage ? '📷 ' + info.name : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name)).substring(0, 50)
                : (info.isImage ? '📷 ' + info.name : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name));
            this._notifySystem(title, body);
            this._playBeep();
            if (navigator.vibrate) navigator.vibrate(200);
        }

        // Calculate average receive speed for final ack
        let finalSpeed = '';
        if (info.size > 0) {
            const nowMs = Date.now();
            const recvStart = info._recvStartTime || nowMs;
            const totalSec = (nowMs - recvStart) / 1000;
            if (totalSec > 0) {
                const spd = info.size / totalSec;
                finalSpeed = spd > 1024*1024 ? `${(spd/1024/1024).toFixed(1)} MB/s` : `${(spd/1024).toFixed(0)} KB/s`;
            }
        }
        // Send completion ack to sender
        const ackPeer = PeerConn.peers[peerId];
        if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
            ackPeer.conn.send({ type: "file-ack", fileId, speed: finalSpeed, etaSec: 0 });
            console.log(`[File] Completion ack sent for ${info.name}`);
        } else {
            console.warn(`[File] Cannot send ack — peer ${peerId} not connected`);
        }
    },

    // ---- File receive: footer (safety net for legacy senders) ----
    async _onFileFooter(peerId, d) {
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (!info) return;

        if (info.directTransfer) {
            console.log(`[File] DIRECT footer for ${info.name}`);
            if (info.binaryChannel) {
                console.log(`[File] Footer check: totalRawReceived=${info.totalRawReceived}, fileSize=${info.size}`);
                if (info.totalRawReceived >= info.size) {
                    await ChatApp._finalizeDirectReceive(d.fileId);
                }
                return;
            }
            // Legacy base64 direct transfer
            console.log(`[File] DIRECT footer for ${info.name}, closing OPFS`);
            await DB.closeDirectFile(d.fileId);
            delete ft.pending[d.fileId];

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

            // Replace progress card with proper message bubble (same as re-entry)
            const progressRow = document.getElementById(`transfer-${d.fileId}`);
            if (progressRow) progressRow.remove();
            delete this._transferThrottle[d.fileId];
            delete this._transferStartTimes[d.fileId]; 
            delete this._transferSizes?.[d.fileId];
            delete this._activeReceives[peerId];
            this._renderContacts();
            if (this.activeConv && this.activeConv.id === peerId) {
                this._appendMsg(msg);
            }

            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) {
                contact.lastMessage = {
                    content: _i18n.t('pchat.file.prefixFile') + ' ' + info.name,
                    ts: now, fromId: peerId,
                };
                this.saveContact(contact);
                this._renderContacts();
                // Notification for file completion
                if (document.visibilityState !== 'visible' && contact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === peerId)) {
                    const title = contact.nickname || peerId;
                    const body = (_i18n.t('pchat.file.prefixFile') + ' ' + info.name).length > 50 ? (_i18n.t('pchat.file.prefixFile') + ' ' + info.name).substring(0, 50) : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name);
                    this._notifySystem(title, body);
                    this._playBeep();
                    if (navigator.vibrate) navigator.vibrate(200);
                }
            }

            const ackPeer = PeerConn.peers[peerId];
            if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
                ackPeer.conn.send({ type: "file-ack", fileId: d.fileId });
            }
            return;
        }

        // Traditional chunked path: safety net (chunk-based completion handles the normal case)
        if (!info._finalized) {
            console.log(`[File] Footer safety net for ${info.name}, chunkCount=${info.chunkCount}/${info.totalChunks}`);
            await this._finalizeChunkedReceive(d.fileId);
        }
    },

    // ---- Send message ----
    async sendMessage() {
        const input = document.getElementById("message-input");
        const content = input.value.trim();
        // Send clipboard images first, then text
        const hasImages = this._clipboardImages && this._clipboardImages.length > 0;
        if (!content && !hasImages) return;
        if (!this.activeConv) return;

        // Send clipboard images as files
        if (hasImages) {
            const images = [...this._clipboardImages];
            this._clipboardImages = [];
            this._renderClipboardPreview();
            for (const img of images) {
                const file = new File([img.blob], img.name, { type: img.blob.type || 'image/png' });
                try { await this._sendFileInternal(file); } catch(err) { console.error('[Clipboard] send error:', err); }
            }
        }

        if (!content) { input.value = ""; return; }

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

    // ---- Retry a failed file send on reconnect (<10MB auto-resend from DB message data) ----
    async _retryPendingFile(peerId, msg) {
        if (!msg.fileData) return;
        const state = PeerConn.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;
        console.log(`[File] Retrying send: ${msg.fileName} (${msg.fileSize}B)`);

        const chunkSize = 262144;
        const fileId = msg.fileId || `file_retry_${msg.id}`;
        const isImage = msg.type === "image";
        const totalChunks = Math.ceil(msg.fileData.length / chunkSize);
        const fileHash = this._hashBase64(msg.fileData);

        state.conn.send({ type: "file-header", fileId, name: msg.fileName, mime: msg.mimeType || "application/octet-stream", size: msg.fileSize, totalChunks, isImage, base64Len: msg.fileData.length, hash: fileHash });
        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize; const end = Math.min(start + chunkSize, msg.fileData.length);
            state.conn.send({ type: "file-chunk", fileId, index: i, data: msg.fileData.slice(start, end) });
        }
        state.conn.send({ type: "file-footer", fileId });
        const acked = await new Promise((r) => {
            const h = (d) => { if (d.type === "file-ack" && d.fileId === fileId) { clearTimeout(t); state.conn.off("data", h); r(true); } };
            const t = setTimeout(() => { state.conn.off("data", h); r(false); }, 120000);
            state.conn.on("data", h);
        });
        if (acked) { msg.sent = true; await DB.put("messages", msg, this.my.aesKey); console.log(`[File] Retry success: ${msg.fileName}`); }
    },

    // ---- Receiver asks sender to resume incomplete Binary DC transfer ----
    async _requestFileResume(peerId) {
        const ft = this.fileTransfer;
        const pendingCount = Object.keys(ft.pending).length;
        const recvCount = Object.keys(this._pendingReceives).length;
        console.log(`[File] _requestFileResume peer=${peerId}, ft.pending=${pendingCount}, _pendingReceives=${recvCount}`);
        const state = PeerConn.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;
        for (const [fid, info] of Object.entries(ft.pending)) {
            if (info.peerId !== peerId) continue;
            const netReceived = info.totalRawReceived || 0;
            const opfsSize = await DB.getReceiveFileSize(fid);
            const received = Math.max(netReceived, opfsSize);
            console.log(`[File] Requesting resume for ${info.name}: received=${(received/1024/1024).toFixed(1)}MB / ${(info.size/1024/1024).toFixed(1)}MB`);
            state.conn.send({ type: "file-resume", fileId: fid, receivedBytes: received, totalSize: info.size });
        }
        // Also check _pendingReceives for transfers that survived page refresh
        for (const [fid, pr] of Object.entries(this._pendingReceives)) {
            console.log(`[File] _pendingReceives entry: fid=${fid}, pr.peerId=${pr.peerId}, looking for peerId=${peerId}, match=${pr.peerId === peerId}`);
            if (pr.peerId !== peerId) continue;
            if (ft.pending[fid]) continue;
            const opfsSize = await DB.getReceiveFileSize(fid);
            console.log(`[File] _pendingReceives opfsSize=${opfsSize} for fid=${fid}`);
            // Always request resume — opfsSize=0 means start from beginning
            const received = Math.max(opfsSize, 0);
            console.log(`[File] Resume after refresh: ${pr.name}, opfs=${(opfsSize/1024/1024).toFixed(1)}MB / ${(pr.size/1024/1024).toFixed(1)}MB, resumeFrom=${(received/1024/1024).toFixed(1)}MB`);
            // Reconstruct minimal info so subsequent chunks get progress UI
            const info = { peerId, name: pr.name, size: pr.size, directTransfer: true, binaryChannel: true, totalRawReceived: received, totalChunks: -1, chunkCount: 0, _written: received };
            ft.pending[fid] = info;
            this._activeReceives[peerId] = { fileId: fid, name: pr.name, size: pr.size, pct: Math.round(received / pr.size * 100) };
            this._renderContacts();
            if (this.activeConv && this.activeConv.id === peerId) {
                if (!document.getElementById(`transfer-${fid}`)) {
                    this._insertTransferCard(fid, pr.name, pr.size, false);
                }
                this._updateTransferProgress(fid, Math.round(received / pr.size * 100), null);
            }
            state.conn.send({ type: "file-resume", fileId: fid, receivedBytes: received, totalSize: pr.size });
        }
    },

    // ---- Sender handles file-resume request (Binary DC only, ≥10MB) ----
    async _handleFileResume(peerId, data) {
        const fid = data.fileId;
        const pending = this._pendingSends[fid];
        if (!pending) { console.warn(`[File] Resume request for unknown file: ${fid}`); return; }
        const offset = data.receivedBytes || 0;
        const startPct = pending.size > 0 ? Math.round(offset / pending.size * 100) : 0;
        console.log(`[File] Resume: ${pending.name}, from ${(offset/1024/1024).toFixed(1)}MB (${startPct}%)`);

        const state = PeerConn.peers[peerId];
        if (!state || !state.conn || !state.conn.open) return;

        // Close old Binary DC if still running (from original send)
        const oldConn = this._binarySendChannels[fid];
        if (oldConn) { try { oldConn.close(); } catch(e) {}; delete this._binarySendChannels[fid]; }

        let file = await DB.getOutgoingFile(fid);
        if (!file) {
            await new Promise(r => setTimeout(r, 2000));
            file = await DB.getOutgoingFile(fid);
            if (!file) { console.warn(`[File] OPFS file not found: ${fid}`); return; }
        }

        // Show progress card + sidebar (reuse existing if present)
        const existingCard = document.getElementById(`transfer-${fid}`);
        if (!existingCard) {
            this._insertTransferCard(fid, pending.name, pending.size, true);
        }
        this._activeSends[peerId] = { fileId: fid, name: pending.name, size: pending.size, pct: startPct };
        this._renderContacts();
        // Reset speed timer for resume (don't count pre-resume bytes in speed calc)
        this._transferStartTimes[fid] = Date.now();
        this._updateTransferProgress(fid, startPct, `续传中 ${startPct}%`);
        this._updateSidebarTransfer(peerId, `📤 ${pending.name.substring(0,15)}${pending.name.length>15?'...':''} ${startPct}%`);

        const chunkSize = 262144;
        const fileConn = PeerConn.peer.connect(peerId, { label: 'file-' + fid, serialization: 'binary', reliable: true });
        this._binarySendChannels[fid] = fileConn;
        await new Promise((resolve, reject) => {
            fileConn.on('open', resolve); fileConn.on('error', reject);
            setTimeout(() => reject(new Error('Timeout')), 15000);
        });

        let sentBytes = offset;
        let sentChunks = 0;
        while (sentBytes < file.size) {
            const segSize = 10 * 1024 * 1024;
            const seg = file.slice(sentBytes, sentBytes + segSize);
            const segBuf = await new Promise((r2, rj) => { const fr = new FileReader(); fr.onload = (e) => r2(new Uint8Array(e.target.result)); fr.onerror = rj; fr.readAsArrayBuffer(seg); });
            for (let i = 0; i < segBuf.length; i += chunkSize) {
                const end = Math.min(i + chunkSize, segBuf.length);
                fileConn.send(segBuf.slice(i, end)); sentBytes += (end - i); sentChunks++;
                // Flow control: wait for receiver ack every 10 chunks
                if (sentChunks % 10 === 0) {
                    await new Promise(r => {
                        const ah = (d) => {
                            if (d.type==='file-ack'&&d.fileId===fid) {
                                state.conn.off('data',ah);
                                console.log(`[File] Ack rcvd — progress=${d.progress}, speed=${d.speed || '(none)'}, eta=${d.etaSec}s`);
                                if (d.speed) {
                                    ChatApp._transferAckSpeed = ChatApp._transferAckSpeed || {};
                                    ChatApp._transferAckSpeed[fid] = d.speed;
                                }
                                if (d.etaSec != null) {
                                    ChatApp._transferAckEta = ChatApp._transferAckEta || {};
                                    ChatApp._transferAckEta[fid] = d.etaSec;
                                }
                                r();
                            }
                        };
                        state.conn.on('data', ah);
                        setTimeout(() => { state.conn.off('data',ah); r(); }, 5000);
                    });
                }
            }
            const pct = Math.round(sentBytes / file.size * 100);
            this._updateTransferProgress(fid, pct, `续传中 ${pct}%`);
            const as = this._activeSends[peerId];
            if (as) { as.pct = pct; this._updateSidebarTransfer(peerId, `📤 ${as.name.substring(0,15)}${as.name.length>15?'...':''} ${pct}%`); }
        }
        state.conn.send({ type: "file-footer", fileId: fid });
        fileConn.close();
        delete this._binarySendChannels[fid];
        this._updateTransferProgress(fid, 100, '等待对方确认...');

        const acked = await new Promise((r) => {
            const h = (d) => { if (d.type==="file-ack"&&d.fileId===fid) { clearTimeout(t); state.conn.off("data",h); r(true); } };
            const t = setTimeout(() => { state.conn.off("data",h); r(false); }, 120000);
            state.conn.on("data", h);
        });

        // Clean up progress UI
        const pr = document.getElementById(`transfer-${fid}`);
        if (pr) pr.remove();
        delete this._transferThrottle[fid];
        delete this._transferStartTimes[fid]; delete this._transferAckSpeed?.[fid]; delete this._transferAckEta?.[fid]; 
        delete this._transferSizes?.[fid];
        delete this._activeSends[peerId];

        if (acked) {
            this._clearPendingSend(fid, true);
            DB.deleteOutgoingFile(fid).catch(() => {});
            console.log(`[File] Resume ack: ${pending.name}`);
            // Show completed message
            const now = Date.now();
            const msg = { id: `msg_direct_${fid}`, peerId, ts: now, direction: "sent", sent: true, fromId: this.my.id, type: "direct-file", fileName: pending.name, mimeType: pending.mime, fileSize: pending.size, fileId: fid };
            if (this.activeConv && this.activeConv.id === peerId) this._appendMsg(msg);
            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) { contact.lastMessage = { content: _i18n.t('pchat.file.prefixFile') + ' ' + pending.name, ts: now, fromId: this.my.id }; this.saveContact(contact); }
        }
        this._renderContacts();
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

    // ---- Send file (supports multiple) ----
    async sendFile(event) {
        const files = event.target.files;
        if (!files || files.length === 0 || !this.activeConv) return;
        const fileArray = Array.from(files);
        event.target.value = "";
        for (const file of fileArray) {
            try {
                await this._sendFileInternal(file);
            } catch(err) {
                console.error('[sendFile] error:', err);
            }
        }
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

        const SHOW_PROGRESS = 10 * 1024 * 1024; // ≥10MB: Binary DC
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

            return ackReceived;
        };

        // ---- Store message in DB (always encrypted for <10MB) ----
        const storeMsg = async (base64Data, sent) => {
            const now = Date.now();
            const id = `msg_${peerId}_${now}_${Math.random().toString(36).slice(2,6)}`;
            let thumbData = null;
            let storedFileId = null;
            let msgFileData = base64Data;

            if (isImage) {
                thumbData = await DB.generateThumbnail(base64Data, file.type, 200);
                await DB.putFile(fileId, base64Data, file.type, this.my.aesKey);
                storedFileId = fileId;
                msgFileData = thumbData || base64Data;
            }

            const sentMsg = {
                id, peerId, ts: now, direction: "sent", sent,
                fromId: this.my.id,
                type: isImage ? "image" : "file",
                fileName: file.name, mimeType: file.type, fileSize: file.size,
                fileId: storedFileId,
                fileData: msgFileData,
            };

            await DB.put("messages", sentMsg, this.my.aesKey);
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
        if (file.size >= SHOW_PROGRESS) {
            // ≥10MB: Binary DC — zero encoding overhead, seekable resume
            console.log(`[File] Binary DC (${(file.size/1024/1024).toFixed(1)}MB)`);

            // Save to OPFS async (don't block sending)
            DB.saveOutgoingFile(fileId, file).catch(e => console.warn('[OPFS] saveOutgoingFile failed:', e));
            this._pendingSends[fileId] = { name: file.name, size: file.size, mime: file.type, peerId, progress: 0, ts: Date.now() };
            this._savePendingSends();

            const segSize = 10 * 1024 * 1024;
            let offset = 0;

            const fileConn = PeerConn.peer.connect(peerId, {
                label: 'file-' + fileId, serialization: 'binary', reliable: true,
            });
            this._binarySendChannels[fileId] = fileConn;
            await new Promise((resolve, reject) => {
                fileConn.on('open', resolve); fileConn.on('error', reject);
                setTimeout(() => reject(new Error('Binary channel timeout')), 15000);
            });
            console.log('[File] Binary DC opened');

            conn.send({ type: "file-header", fileId, name: file.name, mime: file.type, size: file.size, totalChunks: -1, isImage, directTransfer: true, binaryChannel: true });

            this._insertTransferCard(fileId, file.name, file.size, true);
            this._activeSends[peerId] = { fileId, name: file.name, size: file.size, pct: 0 };
            this._renderContacts();

            let sentChunks = 0, sentBytes = 0;
            try {
                while (offset < file.size) {
                    const seg = file.slice(offset, offset + segSize);
                    const segBuf = await new Promise((r2, rj) => { const fr = new FileReader(); fr.onload = (e) => r2(new Uint8Array(e.target.result)); fr.onerror = rj; fr.readAsArrayBuffer(seg); });
                    for (let i = 0; i < segBuf.length; i += chunkSize) {
                        const end = Math.min(i + chunkSize, segBuf.length);
                        fileConn.send(segBuf.slice(i, end)); sentChunks++; sentBytes += (end - i);
                        if (sentChunks % 10 === 0) {
                            await new Promise(r => {
                                const ah = (d) => {
                                    if (d.type==='file-ack'&&d.fileId===fileId) {
                                        conn.off('data',ah);
                                        console.log(`[File] Ack rcvd — progress=${d.progress}, speed=${d.speed || '(none)'}, eta=${d.etaSec}s`);
                                        // Use receiver-measured speed and ETA directly
                                        if (d.speed) {
                                            ChatApp._transferAckSpeed = ChatApp._transferAckSpeed || {};
                                            ChatApp._transferAckSpeed[fileId] = d.speed;
                                        }
                                        if (d.etaSec != null) {
                                            ChatApp._transferAckEta = ChatApp._transferAckEta || {};
                                            ChatApp._transferAckEta[fileId] = d.etaSec;
                                        }
                                        r();
                                    }
                                };
                                conn.on('data', ah);
                                setTimeout(() => { conn.off('data',ah); r(); }, 5000);
                            });
                        }
                    }
                    offset += segSize;
                    const pct = (sentBytes / file.size * 100).toFixed(1);
                    console.log(`[File] #${sentChunks} ${(sentBytes/1024/1024).toFixed(0)}MB (${pct}%)`);
                    this._updateTransferProgress(fileId, parseFloat(pct), `发送中 ${pct}%`);
                    const as = this._activeSends[peerId];
                    if (as) { as.pct = Math.round(parseFloat(pct)); this._updateSidebarTransfer(peerId, `📤 ${as.name.substring(0,15)}${as.name.length>15?'...':''} ${as.pct}%`); }
                }
            } catch(e) {
                console.error('[File] Binary send error:', e);
                fileConn.close();
                delete this._binarySendChannels[fileId];
                delete this._activeSends[peerId];
                this._renderContacts();
                return;
            }

            conn.send({ type: "file-footer", fileId });
            console.log(`[File] All ${sentChunks} chunks ${(sentBytes/1024/1024).toFixed(0)}MB sent, waiting...`);
            this._updateTransferProgress(fileId, 100, '等待对方确认...');
            const as2 = this._activeSends[peerId];
            if (as2) { as2.pct = 100; this._updateSidebarTransfer(peerId, `📤 ${as2.name.substring(0,15)}${as2.name.length>15?'...':''} 100%`); }

            const finalOk = await new Promise((ackResolve) => {
                const handler = (data) => { if (data.type==="file-ack"&&data.fileId===fileId) { clearTimeout(timer); conn.off("data",handler); if (data.speed) { ChatApp._transferAckSpeed = ChatApp._transferAckSpeed || {}; ChatApp._transferAckSpeed[fileId] = data.speed; } if (data.etaSec != null) { ChatApp._transferAckEta = ChatApp._transferAckEta || {}; ChatApp._transferAckEta[fileId] = data.etaSec; } ChatApp._updateTransferProgress(fileId, data.progress!=null?data.progress:100, `对方已接收 ${data.progress!=null?data.progress:100}%`); ackResolve(true); } };
                const timer = setTimeout(() => { conn.off("data",handler); ackResolve(false); }, 600000);
                conn.on("data", handler);
            });

            fileConn.close();
            delete this._binarySendChannels[fileId];
            if (finalOk) console.log(`[File] Ack received: ${file.name}`);

            const now = Date.now();
            const id = `msg_${peerId}_${now}_${Math.random().toString(36).slice(2,6)}`;
            const sentMsg = { id, peerId, ts: now, direction: "sent", sent: finalOk, fromId: this.my.id, type: "direct-file", fileName: file.name, mimeType: file.type, fileSize: file.size, fileId };
            // ≥10MB: OPFS-only, no DB storage. _appendMsg renders the UI card.

            const progressRow = document.getElementById(`transfer-${fileId}`);
            if (progressRow) progressRow.remove();
            delete this._transferThrottle[fileId];
            delete this._transferStartTimes[fileId]; delete this._transferAckSpeed?.[fileId]; delete this._transferAckEta?.[fileId]; 
            delete this._transferSizes?.[fileId];
            delete this._activeSends[peerId];
            if (finalOk) { this._clearPendingSend(fileId, true); DB.deleteOutgoingFile(fileId).catch(() => {}); }
            this._renderContacts();
            this._appendMsg(sentMsg);

            const contact = this.contacts.find(c => c.userId === peerId);
            if (contact) { contact.lastMessage = { content: _i18n.t('pchat.file.prefixFile') + ' ' + file.name, ts: now, fromId: this.my.id }; this.saveContact(contact); }
            this._renderContacts();
            console.log(`[File] Binary DC done: ${file.name}`);
            return;
        }

        // <10MB: chunked base64 + encryption
        // Save to OPFS async (don't block sending)
        DB.saveOutgoingFile(fileId, file).catch(e => console.warn('[OPFS] saveOutgoingFile failed:', e));
        this._pendingSends[fileId] = { name: file.name, size: file.size, mime: file.type, peerId, progress: 0, ts: Date.now() };
        this._savePendingSends();

        console.log(`[File] Chunked (${(file.size/1024/1024).toFixed(2)}MB), encrypt=true`);

        const buffer = await new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = (e) => { if (!e.target.result) return reject(new Error('Read failed')); resolve(e.target.result); };
            r.onerror = (e) => reject(e);
            r.readAsArrayBuffer(file);
        });
        const base64 = arrayBufferToBase64(buffer);
        console.log(`[File] Read complete, base64 length=${base64.length}`);
        const acked = await sendChunks(base64, file.size);
        if (acked) { this._clearPendingSend(fileId); DB.deleteOutgoingFile(fileId).catch(() => {}); }
        await storeMsg(base64, acked);
        this._renderContacts();
        console.log(`[File] Done: ${file.name}, acked=${acked}`);
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
                const connOpen = peer && peer.connected;
                const reconnecting = !connOpen && !!PeerConn._reconnectTimers[id];
                if (reconnecting) status.textContent = _i18n.t('pchat.status.reconnecting');
                else status.textContent = connOpen ? _i18n.t('pchat.status.peerJSOnline') : _i18n.t('pchat.status.offline');
                // Update notify button state
                const notifyBtn = document.getElementById('notify-btn');
                if (notifyBtn) {
                    notifyBtn.style.display = '';
                    this._updateNotifyBtn(c.notifyEnabled !== false);
                }
            }
        } else if (type === "group") {
            // Hide notify button for groups
            const notifyBtn = document.getElementById('notify-btn');
            if (notifyBtn) notifyBtn.style.display = 'none';
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

        // Insert progress cards for any active file transfers from/to this peer (≥10MB only)
        const ft = this.fileTransfer;
        // Receives:
        for (const [fid, info] of Object.entries(ft.pending)) {
            if (info.peerId !== peerId || info.size < 10 * 1024 * 1024) continue;
            const alreadyStored = conv.some(m =>
                (m.type === 'direct-file' || m.type === 'file' || m.type === 'image') &&
                m.fileId === fid
            );
            if (alreadyStored) continue;
            const pct = info.directTransfer
                ? (info.totalRawReceived > 0 ? Math.round(info.totalRawReceived / info.size * 100) : info.chunkCount > 0 ? Math.round(info.totalBase64Received * 0.75 / info.size * 100) : 0)
                : (info.totalChunks > 0 ? Math.round(info.chunkCount / info.totalChunks * 100) : 0);
            if (!document.getElementById(`transfer-${fid}`)) {
                this._insertTransferCard(fid, info.name, info.size, false);
                this._updateTransferProgress(fid, Math.min(pct, 99), null);
            }
        }
        // Sends:
        const as = this._activeSends[peerId];
        if (as) {
            const alreadyStored = conv.some(m =>
                (m.type === 'direct-file' || m.type === 'file' || m.type === 'image') &&
                m.fileId === as.fileId
            );
            if (!alreadyStored) {
                if (!document.getElementById(`transfer-${as.fileId}`)) {
                    this._insertTransferCard(as.fileId, as.name, as.size, true);
                }
                if (as.pct < 100) {
                    this._updateTransferProgress(as.fileId, as.pct, `发送中 ${as.pct}%`);
                } else {
                    this._updateTransferProgress(as.fileId, 100, '等待对方确认...');
                }
            }
        }
        // Completed ≥10MB OPFS sends (not in DB, render from _pendingSends)
        for (const [fid, ps] of Object.entries(this._pendingSends)) {
            if (ps.peerId !== peerId || !ps.completed) continue;
            const alreadyRendered = conv.some(m => m.type === 'direct-file' && m.fileId === fid);
            if (alreadyRendered) continue;
            const msg = { id: `msg_direct_${fid}`, peerId, ts: ps.ts, direction: "sent", fromId: this.my.id, type: "direct-file", fileName: ps.name, mimeType: ps.mime, fileSize: ps.size, fileId: fid };
            conv.push(msg);
            this._appendMsg(msg);
        }

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
    _transferStartTimes: {},
    _insertTransferCard(transferId, fileName, fileSize, isSender) {
        try {
        const list = document.getElementById("message-list");
        if (!list) return;
        this._transferStartTimes[transferId] = Date.now();
        if (!this._transferSizes) this._transferSizes = {};
        this._transferSizes[transferId] = fileSize;
        const icon = this._getFileIcon(fileName);
        const sizeStr = this._formatFileSize(fileSize);
        const status = isSender ? '发送中...' : '接收中...';
        const card = document.createElement("div");
        card.className = "message-row";
        card.id = `transfer-${transferId}`;
        card.innerHTML = `<div class="sender-avatar">${isSender ? _i18n.t('pchat.msg.self') : ''}</div>
            <div class="message ${isSender ? 'sent' : 'received'}">
                <div class="transfer-progress-card" id="transfer-card-${transferId}">
                    <div class="tp-header"><span class="tp-icon">${icon}</span><span class="tp-name">${fileName.replace(/</g,'&lt;')}</span><button onclick="event.stopPropagation();ChatApp.cancelTransfer('${transferId}')" style="margin-left:auto;background:none;border:none;color:var(--text3);cursor:pointer;font-size:14px;padding:2px 6px;" title="取消传输">✕</button></div>
                    <div class="tp-bar-wrap"><div class="tp-bar-fill" id="transfer-bar-${transferId}" style="width:0%"></div></div>
                    <div class="tp-status"><span id="transfer-pct-${transferId}">0%</span> · <span id="transfer-status-${transferId}">${status}</span><span class="tp-size">${sizeStr}</span><span id="transfer-speed-${transferId}" style="margin-left:6px;font-size:10px;color:var(--text3);"></span></div>
                </div>
            </div>`;
        list.appendChild(card);
        this._scroll();
        return card;
        } catch(e) { console.error('[Transfer] insertTransferCard error:', e); return null; }
    },

    _transferThrottle: {},
    _transferSpeedCalcAt: {},
    _updateTransferProgress(transferId, pct, status, fileId, fileName) {
        // Throttle: max 1 DOM update per 100ms per transfer
        // Always allow: status changes (e.g. "等待对方确认") and completion (≥99%)
        const now = Date.now();
        const last = this._transferThrottle[transferId] || 0;
        const isComplete = parseFloat(pct) >= 99;
        if (!isComplete && !status && now - last < 100) return;
        this._transferThrottle[transferId] = now;

        const bar = document.getElementById(`transfer-bar-${transferId}`);
        const pctEl = document.getElementById(`transfer-pct-${transferId}`);
        const stEl = document.getElementById(`transfer-status-${transferId}`);
        const spdEl = document.getElementById(`transfer-speed-${transferId}`);
        if (bar) bar.style.width = `${Math.min(100, Math.round(pct))}%`;
        if (pctEl) pctEl.textContent = `${Number(pct).toFixed(1)}%`;
        if (stEl && status) stEl.textContent = status;
        // Speed & ETA — only from receiver-computed values (via ACK or local calculation)
        if (spdEl && this._transferStartTimes[transferId]) {
            const pctNum = parseFloat(pct);
            const ackSpeed = this._transferAckSpeed?.[transferId];
            const ackEta = this._transferAckEta?.[transferId];
            const fmtEta = (s) => s > 3600 ? `${Math.round(s/3600)}h${Math.round(s%3600/60)}m` : s > 60 ? `${Math.round(s/60)}分` : `${Math.round(s)}秒`;
            if (ackSpeed && pctNum < 99) {
                const etaStr = ackEta != null && ackEta > 0 ? fmtEta(ackEta) : '';
                spdEl.textContent = etaStr ? `${ackSpeed} · 剩余${etaStr}` : ackSpeed;
            }
        }
        try { this._scroll(); } catch(e) {}
    },

    // Update all transfer cards for a peer to "reconnecting" state on disconnect
    _markTransfersReconnecting(peerId) {
        // Receiving
        const ar = this._activeReceives[peerId];
        if (ar) {
            const stEl = document.getElementById(`transfer-status-${ar.fileId}`);
            const spdEl = document.getElementById(`transfer-speed-${ar.fileId}`);
            if (stEl) stEl.textContent = '重连中...';
            if (spdEl) spdEl.textContent = '0 KB/s';
        }
        // Sending
        const as = this._activeSends[peerId];
        if (as) {
            const stEl = document.getElementById(`transfer-status-${as.fileId}`);
            const spdEl = document.getElementById(`transfer-speed-${as.fileId}`);
            if (stEl) stEl.textContent = '重连中...';
            if (spdEl) spdEl.textContent = '0 KB/s';
        }
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
        // Clean up throttle state for this transfer
        delete this._transferThrottle[transferId];
        delete this._transferStartTimes[transferId]; delete this._transferAckSpeed?.[transferId]; delete this._transferAckEta?.[transferId]; 
        delete this._transferSizes?.[transferId];
    },


    async cancelTransfer(fileId) {
        console.log('[Transfer] Cancel:', fileId);
        // ---- Sender side: close Binary DC + clean OPFS + tracking ----
        const fileConn = this._binarySendChannels[fileId];
        if (fileConn) {
            try { fileConn.close(); } catch(e) {}
            delete this._binarySendChannels[fileId];
        }
        const ps = this._pendingSends[fileId];
        if (ps) {
            console.log('[Transfer] Cleaning up pending send:', ps.name);
            delete this._pendingSends[fileId];
            this._savePendingSends();
            DB.deleteOutgoingFile(fileId).catch(() => {});
        }
        const peerId = ps?.peerId || this.activeConv?.id || '';
        delete this._activeSends[peerId];

        // ---- Receiver side: cancel + clean OPFS receive ----
        const ft = this.fileTransfer;
        const info = ft.pending[fileId];
        if (info) {
            const peer = PeerConn.peers[info.peerId];
            if (peer && peer.conn && peer.conn.open) {
                peer.conn.send({ type: 'file-cancel', fileId });
            }
            await DB._flushRawBuffer(fileId).catch(() => {});
            await DB.closeDirectFile(fileId).catch(() => {});
            await DB.deleteDirectFile(fileId).catch(() => {});
            delete ft.pending[fileId];
            delete this._activeReceives[info.peerId];
            delete this._pendingReceives[fileId];
            this._savePendingReceives();
        }

        // ---- Remove progress card + throttle state ----
        const row = document.getElementById(`transfer-${fileId}`);
        if (row) { row.style.opacity = '0'; setTimeout(() => row.remove(), 300); }
        delete this._transferThrottle[fileId];
        delete this._transferStartTimes[fileId]; 
        delete this._transferSizes?.[fileId];

        // ---- Delete DB messages (both sent:false chunked, and receive-side direct-file) ----
        const msgs = await DB.listMessagesByPeer(peerId, this.my.aesKey);
        for (const m of msgs) {
            if ((m.type === 'direct-file' || m.type === 'file' || m.type === 'image') && m.fileId === fileId) {
                const tx = DB.db.transaction('messages', 'readwrite');
                tx.objectStore('messages').delete(m.id);
                await new Promise(r => { tx.oncomplete = r; });
                break;
            }
        }
        this._renderContacts();
    },

    _onFileCancel(peerId, d) {
        console.log('[Transfer] Received cancel for:', d.fileId);
        const ft = this.fileTransfer;
        const info = ft.pending[d.fileId];
        if (info) {
            DB._flushRawBuffer(d.fileId).catch(() => {});
            DB.closeDirectFile(d.fileId).catch(() => {});
            DB.deleteDirectFile(d.fileId).catch(() => {});
            delete ft.pending[d.fileId];
        }
        const row = document.getElementById(`transfer-${d.fileId}`);
        if (row) { row.style.opacity = '0'; setTimeout(() => row.remove(), 300); }
        // Clean up sidebar transfer progress
        delete this._activeReceives[peerId];
        delete this._pendingReceives[d.fileId];
        this._savePendingReceives();
        this._renderContacts();
    },

    async _finalizeDirectReceive(fileId) {
        const ft = this.fileTransfer;
        const info = ft.pending[fileId];
        if (!info) return;
        console.log(`[File] Finalizing direct receive: ${info.name}`);
        await DB._flushRawBuffer(fileId);
        await DB.closeDirectFile(fileId);
        delete ft.pending[fileId];

        const now = Date.now();
        const msg = {
            id: `msg_${info.peerId}_${now}_${Math.random().toString(36).slice(2,6)}`,
            peerId: info.peerId, ts: now, direction: "received", fromId: info.peerId,
            type: "direct-file", fileName: info.name, mimeType: info.mime, fileSize: info.size, fileId,
        };
        await DB.putRaw("messages", msg);

        // Replace progress card with proper message bubble (same as re-entry)
        const progressRow = document.getElementById(`transfer-${fileId}`);
        if (progressRow) progressRow.remove();
        delete this._transferThrottle[fileId];
        delete this._transferStartTimes[fileId]; 
        delete this._transferSizes?.[fileId];
        delete this._activeReceives[info.peerId];
        delete this._pendingReceives[fileId];
        this._savePendingReceives();
        if (this.activeConv && this.activeConv.id === info.peerId) {
            this._appendMsg(msg);
        }

        const ackPeer = PeerConn.peers[info.peerId];
        if (ackPeer && ackPeer.conn && ackPeer.conn.open) {
            ackPeer.conn.send({ type: "file-ack", fileId });
        }
        const contact = this.contacts.find(c => c.userId === info.peerId);
        if (contact) {
            contact.lastMessage = { content: _i18n.t('pchat.file.prefixFile') + ' ' + info.name, ts: now, fromId: info.peerId };
            this.saveContact(contact);
            this._renderContacts();
            // Notification for file completion
            if (document.visibilityState !== 'visible' && contact.notifyEnabled !== false && !(this.activeConv && this.activeConv.id === info.peerId)) {
                const title = contact.nickname || info.peerId;
                const body = (_i18n.t('pchat.file.prefixFile') + ' ' + info.name).length > 50 ? (_i18n.t('pchat.file.prefixFile') + ' ' + info.name).substring(0, 50) : (_i18n.t('pchat.file.prefixFile') + ' ' + info.name);
                this._notifySystem(title, body);
                this._playBeep();
                if (navigator.vibrate) navigator.vibrate(200);
            }
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
        call.on("close", () => {
            // If DC is still alive, call was hung up normally. If DC is dead, enter reconnect.
            const state = PeerConn.peers[peerId];
            const dcAlive = state && state.conn && state.conn.open;
            this._onCallEnd(!dcAlive);
        });
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
        // Call notification
        if (contact && contact.notifyEnabled !== false) {
            this._notifySystem(_i18n.t('pchat.call.incoming') + ': ' + name, name);
            this._playRingtone();
            if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200]);
        }
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
        this._stopRingtone();
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
            call.on("close", () => {
                const state2 = PeerConn.peers[peerId];
                const dcAlive2 = state2 && state2.conn && state2.conn.open;
                this._onCallEnd(!dcAlive2);
            });
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
        this._stopRingtone();
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

    _updateCallStatus(text, animating) {
        const el = document.getElementById("call-status");
        if (el) {
            el.textContent = text;
            el.className = animating ? 'call-reconnecting' : '';
        }
    },

    // 通话结束统一处理
    async _onCallEnd(reconnecting) {
        const c = this.call;
        
        if (reconnecting && c.active) {
            // DC dropped but call was active — show reconnecting, keep UI
            console.log("[Call] Entering reconnect mode");
            c._reconnecting = true;
            this._updateCallStatus(_i18n.t('pchat.status.reconnecting'), true);
            return;
        }
        
        if (c._reconnecting) {
            // Call was in reconnect mode but now truly ended
            c._reconnecting = false;
        }
        
        // Stop ringtone if active
        this._stopRingtone();
        
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
            type: "call-log",
            sent: true  // call records are local, never forwarded
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
    // Update sidebar transfer progress for a specific contact (no full re-render)
    _updateSidebarTransfer(peerId, text) {
        const item = document.querySelector(`.list-item[data-id="${peerId}"]`);
        if (!item) return;
        let lastMsg = item.querySelector('.last-msg');
        if (!lastMsg) {
            lastMsg = document.createElement('div');
            lastMsg.className = 'last-msg';
            item.querySelector('.info').appendChild(lastMsg);
        }
        lastMsg.innerHTML = `<span style="color:var(--accent)">${text}</span>`;
    },

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
            const reconnecting = !connOpen && !!PeerConn._reconnectTimers[c.userId];
            if (reconnecting) { icon = "🔄"; st = _i18n.t('pchat.status.reconnecting'); }
            else if (connOpen) { icon = '<svg width="12" height="12" viewBox="0 0 32 32" style="vertical-align:middle;margin-right:4px"><circle cx="16" cy="16" r="10" fill="#4ecca3"/></svg>'; st = _i18n.t('pchat.status.online'); }
            else if (c.publicKey || hasPeerKey) { icon = "⚪"; st = _i18n.t('pchat.status.offline'); }
            else { icon = "⏳"; st = _i18n.t('pchat.status.waitingKeyExchange'); }
            let lastMsgHtml = "";
            // Show transfer progress if active receive or send
            const ar = this._activeReceives[c.userId];
            const as = this._activeSends[c.userId];
            if (ar) {
                lastMsgHtml = `<div class="last-msg"><span style="color:var(--accent)">📥 ${ar.name.substring(0, 15)}${ar.name.length > 15 ? '...' : ''} ${ar.pct}%</span></div>`;
            } else if (as) {
                lastMsgHtml = `<div class="last-msg"><span style="color:var(--accent)">📤 ${as.name.substring(0, 15)}${as.name.length > 15 ? '...' : ''} ${as.pct}%</span></div>`;
            } else if (c.lastMessage) {
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

        // ---- Clipboard paste (images) ----
        this._clipboardImages = [];
        const msgInput = document.getElementById("message-input");
        msgInput.onpaste = (e) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of items) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        this._clipboardImages.push({ name: `clipboard_${Date.now()}.png`, data: ev.target.result, blob });
                        this._renderClipboardPreview();
                    };
                    reader.readAsDataURL(blob);
                }
            }
        };

        // ---- Drag & drop ----
        const chatArea = document.getElementById("chat-active");
        if (chatArea) {
            chatArea.ondragover = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
            chatArea.ondrop = async (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (!files || files.length === 0) return;
                for (const file of files) {
                    try { await this._sendFileInternal(file); } catch(err) { console.error('[Drop] error:', err); }
                }
            };
        }
    },

    // ---- Clipboard preview ----
    _clipboardImages: [],
    _renderClipboardPreview() {
        const preview = document.getElementById("clipboard-preview");
        if (!preview || this._clipboardImages.length === 0) {
            if (preview) preview.style.display = "none";
            return;
        }
        preview.style.display = "flex";
        preview.innerHTML = this._clipboardImages.map((img, i) =>
            `<div style="position:relative;margin:4px;width:60px;height:60px;border-radius:6px;overflow:hidden;border:1px solid var(--border);flex-shrink:0">
                <img src="${img.data}" style="width:100%;height:100%;object-fit:cover">
                <button onclick="ChatApp._removeClipboardImage(${i})" style="position:absolute;top:0;right:0;background:rgba(0,0,0,.6);color:#fff;border:none;border-radius:0 0 0 6px;font-size:12px;padding:1px 6px;cursor:pointer">×</button>
            </div>`
        ).join('') + `<span style="font-size:11px;color:var(--text3);align-self:center;margin-left:4px">${this._clipboardImages.length} 张图片待发送</span>`;
    },
    _removeClipboardImage(i) {
        this._clipboardImages.splice(i, 1);
        this._renderClipboardPreview();
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
