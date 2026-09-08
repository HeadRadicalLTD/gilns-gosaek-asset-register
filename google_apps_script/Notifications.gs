// Read-only feeds use existing ledgers. Polling never invokes schema migrations.
function readNotificationRows_(propertyKey, sheetName, width, fallbackId) {
  const id = PropertiesService.getScriptProperties().getProperty(propertyKey) || fallbackId;
  if (!id) throw new Error('알림 대장이 연결되지 않았습니다.');
  const cache = CacheService.getScriptCache();
  const key = 'notice-rows-v1-' + sha256Text_(id + ':' + sheetName);
  const cached = cache.get(key);
  if (cached) return JSON.parse(cached);
  const sheet = SpreadsheetApp.openById(id).getSheetByName(sheetName);
  if (!sheet) throw new Error('알림 대상 시트를 찾을 수 없습니다.');
  const last = sheet.getLastRow();
  const rows = last < 2 ? [] : sheet.getRange(2, 1, last - 1, width).getDisplayValues();
  const serialized = JSON.stringify(rows);
  if (serialized.length < 22000) cache.put(key, serialized, 25);
  return rows;
}

function notificationSession_(token) {
  const session = requireSessionInfo_(token);
  if (['admin', 'registrar'].indexOf(session.role) === -1 || !session.actorName) {
    throw new Error('내부 등록자와 관리자만 알림을 확인할 수 있습니다.');
  }
  return session;
}

function notificationReadKey_(session) {
  // Keep separate identities even when an employee switches roles or browsers.
  return 'notice-read-v1-' + sha256Text_([
    session.employeeNumber || session.actorName, session.actorName, session.role,
  ].join('|'));
}

function buildInternalNotifications_(session, sources, today) {
  const items = [];
  const admin = session.role === 'admin';
  function add(module, recordId, title, status, detail, stamp, version) {
    if (!recordId) return;
    const item = { module: module, recordId: String(recordId), title: title,
      status: String(status || ''), detail: String(detail || '').slice(0, 500),
      at: String(stamp || '') };
    item.id = sha256Text_(JSON.stringify([module, recordId, status, detail, stamp, version])).slice(0, 32);
    items.push(item);
  }
  (sources.requests || []).forEach(function (r) {
    if (r[0] && (r[2] === session.actorName || (admin && r[8] === '처리 대기'))) {
      add('requests', r[0], r[4] + ' · ' + r[6], r[8], r[11] || r[7], r[10] || r[1], r[9]);
    }
  });
  (sources.visitors || []).forEach(function (r) {
    const pending = r[2] === '승인 대기';
    const mine = r[7] === session.actorName;
    const authorized = admin || mine || VISITOR_APPROVAL_POLICY === 'all_registrars';
    if (r[0] && (mine || (pending && authorized))) {
      add('visitor', r[0], '외부 방문 · ' + r[10], r[2], r[16] || r[6],
        r[22] || r[18] || r[1], r[8]);
    }
  });
  (sources.departments || []).forEach(function (r) {
    const record = departmentAccessRowToRecord_(r, 0, session);
    const mine = r[2] === session.actorName || Boolean(r[3] && session.employeeNumber && r[3] === session.employeeNumber);
    if (r[0] && (mine || (r[8] === '승인 대기' && (admin || record.canApprove)))) {
      add('employee', r[0], '부서 출입 · ' + r[2] + ' → ' + r[5], r[8],
        r[11] || r[7], r[14] || r[10] || r[1], [r[12], r[13]]);
    }
  });
  (sources.movements || []).forEach(function (r) {
    const mine = r[12] === session.actorName;
    const manager = isSiteManagerFor_(session, r[5]);
    if (!r[0] || !(mine || (r[11] === '승인 대기' && (admin || manager)) ||
      (r[11] === '반출중' && (admin || manager)))) return;
    const due = String(r[9] || '').replace(/\./g, '-').replace(/\s/g, '');
    const overdue = r[11] === '반출중' && /^\d{4}-\d{2}-\d{2}$/.test(due) && due < today;
    add('movement', r[0], '물품 반출입 · ' + r[3], overdue ? '반입 기한 경과' : r[11],
      r[15] || r[6], r[10] || r[8], overdue ? due : '');
  });
  // Native visitor ledger headers are used so older/newer layouts stay compatible.
  const headers = getVisitorLedgerHeaders_();
  (sources.entries || []).forEach(function (r) {
    function field(name) { return r[headers.indexOf(name)] || ''; }
    const host = field('담당자/동행자');
    if (!host || host !== session.actorName) return;
    const id = field('출입기록ID') || field('기록ID');
    add('visitor', id, '방문객 출입 · ' + field('성명'), field('상태'),
      field('방문목적'), field('방문일자') + ' ' + (field('퇴실시간') || field('입실시간')), '');
  });
  const unique = {};
  return items.filter(function (item) {
    if (unique[item.id]) return false;
    unique[item.id] = true;
    return true;
  }).sort(function (a, b) { return b.at.localeCompare(a.at) || a.id.localeCompare(b.id); }).slice(0, 100);
}

function getInternalNotifications(adminToken) {
  const session = notificationSession_(adminToken);
  const sources = {};
  const unavailable = [];
  const definitions = [
    ['requests', MANAGEMENT_REQUEST.spreadsheetPropertyKey, MANAGEMENT_REQUEST.sheetName,
      MANAGEMENT_REQUEST.columnCount, MANAGED_SPREADSHEET_IDS.MANAGEMENT_REQUEST_SPREADSHEET_ID],
    ['visitors', ACCESS.spreadsheetPropertyKey, ACCESS.visitorApplicationSheetName, ACCESS.visitorApplicationColumnCount],
    ['departments', ACCESS.spreadsheetPropertyKey, ACCESS.departmentAccessSheetName, ACCESS.departmentAccessColumnCount],
    ['entries', ACCESS.spreadsheetPropertyKey, ACCESS.visitorSheetName, ACCESS.visitorColumnCount],
    ['movements', MOVEMENT.spreadsheetPropertyKey, MOVEMENT.sheetName, MOVEMENT.columnCount],
  ];
  definitions.forEach(function (d) {
    try { sources[d[0]] = readNotificationRows_(d[1], d[2], d[3], d[4]); }
    catch (error) { unavailable.push(d[0]); console.error('Notification source unavailable: ' + d[0]); }
  });
  const today = Utilities.formatDate(new Date(), APP.timeZone, 'yyyy-MM-dd');
  const items = buildInternalNotifications_(session, sources, today);
  const read = JSON.parse(PropertiesService.getScriptProperties().getProperty(notificationReadKey_(session)) || '[]');
  items.forEach(function (item) { item.read = read.indexOf(item.id) !== -1; });
  return { ok: true, items: items, unreadCount: items.filter(function (item) { return !item.read; }).length,
    unavailable: unavailable };
}

function markInternalNotificationsRead(request) {
  const session = notificationSession_((request || {}).adminToken);
  const ids = (Array.isArray(request.ids) ? request.ids : []).slice(0, 100);
  if (ids.some(function (id) { return typeof id !== 'string' || !/^[a-f0-9]{32}$/.test(id); })) {
    throw new Error('알림 번호를 확인하세요.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = notificationReadKey_(session);
    const previous = JSON.parse(properties.getProperty(key) || '[]');
    const merged = previous.filter(function (id) { return ids.indexOf(id) === -1; }).concat(ids).slice(-220);
    properties.setProperty(key, JSON.stringify(merged));
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function getAssetCorrectionRequests(adminToken, kind) {
  const session = notificationSession_(adminToken);
  const requestType = kind === 'info' ? '정보자산 수정' : '실물자산 수정';
  const system = ensureManagementRequestSystem_();
  return { ok: true, requests: listManagementRequests_(system.sheet,
    session.role === 'admin' ? '' : session.actorName).filter(function (r) { return r.requestType === requestType; }) };
}

function searchAssetCorrectionTargets(request) {
  const session = requireSessionInfo_((request || {}).adminToken, 'requestCreate');
  const kind = request.kind === 'info' ? 'info' : 'asset';
  const sheet = cleanText_(request.sheetName, 100);
  const query = cleanText_(request.query, 100);
  if (!sheet || query.length < 2) throw new Error('시트를 선택하고 검색어를 2자 이상 입력하세요.');
  if (kind === 'asset') return searchAssetsForEdit(sheet, query, request.adminToken);
  const system = ensureInfoAssetSystem_();
  const target = resolveInfoAssetTarget_({ sheetName: sheet }, session.department, system.spreadsheet);
  return { ok: true, results: listInfoAssets_(system.ledger).filter(function (r) {
    return r.departmentCode === target.departmentCode &&
      [r.assetId, r.assetName, r.modelVersion].join(' ').toLowerCase().indexOf(query.toLowerCase()) !== -1;
  }).slice(0, 30).map(function (r) {
    return { managementNumber: r.assetId, itemName: r.assetName, modelMaker: r.modelVersion };
  }) };
}
