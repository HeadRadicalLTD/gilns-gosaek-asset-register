const APP = Object.freeze({
  title: '길앤에스 실물자산관리',
  publicWebAppUrl:
    'https://script.google.com/macros/s/' +
    'AKfycbxubcW2BW4tKQjFl5PJ0cbtTf7niLVlfr54hcwAx3ozkUQ8bEo3_SU7jlhfyOXV4ZXS' +
    '/exec',
  mobileBridgeUrl:
    'https://headradicalltd.github.io/' +
    'gilns-gosaek-asset-register/mobile.html',
  rootFolderName: '길앤에스_자산관리',
  legacyRootFolderName: '길앤에스_고색_자산관리',
  photoFolderName: '비품 사진',
  spreadsheetName: '자산관리 대장',
  legacySpreadsheetName: '고색 자산관리 대장',
  sheetName: '고색연구소',
  legacyHistorySheetName: '등록이력',
  logSpreadsheetName: '자산관리 로그',
  legacyLogSpreadsheetName: '고색 자산관리 로그',
  logSheetName: '로그',
  captureHoldingFolderName: '촬영사진 임시보관',
  capturePropertyPrefix: 'CAPTURE_SESSION_',
  captureExpiryMillis: 4 * 60 * 60 * 1000,
  headerRow: 6,
  firstDataRow: 7,
  firstDataColumn: 2,
  dataColumnCount: 10,
  logColumnCount: 21,
  timeZone: 'Asia/Seoul',
  maxFilesPerCategory: 5,
  minProductPhotos: 3,
  maxFileBytes: 8 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
});

const SITE_MANAGERS = Object.freeze({
  '화성1공장': '김한영',
  '화성2공장': '임현구',
  '화성2공장(조립실)': '임현구',
  '고색연구소': '이장명',
});

const SITE_NAME_ALIASES = Object.freeze({
  '1공장': '화성1공장',
  '화성1공장': '화성1공장',
  '2공장': '화성2공장',
  '화성2공장': '화성2공장',
  '조립실': '화성2공장(조립실)',
  '2공장(조립실)': '화성2공장(조립실)',
  '화성2공장(조립실)': '화성2공장(조립실)',
  '연구소': '고색연구소',
  '고색연구소': '고색연구소',
});

const ACCESS_DEPARTMENTS = Object.freeze([
  '화성1공장',
  '화성2공장',
  '화성2공장 (조립실)',
  '고색연구소',
]);

// 운영 초기에는 모든 등록자가 방문 신청을 처리합니다.
// 추후 'host_only'로 바꾸면 방문 대상 직원만 처리할 수 있습니다.
const VISITOR_APPROVAL_POLICY = 'all_registrars';

function normalizeSiteName_(value) {
  const compact = String(value || '').replace(/\s/g, '');
  return SITE_NAME_ALIASES[compact] || compact;
}

function getSiteManager_(sheetName) {
  const manager = SITE_MANAGERS[normalizeSiteName_(sheetName)];
  if (!manager) {
    throw new Error('선택한 시트의 관리자가 설정되어 있지 않습니다.');
  }
  return manager;
}

function getSiteManagerSafe_(siteName) {
  return SITE_MANAGERS[normalizeSiteName_(siteName)] || '';
}

function isSiteManagerFor_(session, siteName) {
  return Boolean(
    session && session.actorName &&
    getSiteManagerSafe_(siteName) === session.actorName
  );
}

const CATEGORY_MAP = Object.freeze({
  invoice: Object.freeze({
    folderName: '송장',
    filePrefix: '송장',
  }),
  purchaseOrder: Object.freeze({
    folderName: '발주서',
    filePrefix: '발주서',
  }),
  taxInvoice: Object.freeze({
    folderName: '세금계산서',
    filePrefix: '세금계산서',
  }),
  product: Object.freeze({
    folderName: '실물 사진',
    filePrefix: '실물',
  }),
});

const DOCUMENT_CATEGORY_KEYS = Object.freeze([
  'invoice',
  'purchaseOrder',
  'taxInvoice',
]);

const IMAGE_MIME_TYPES = Object.freeze({
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heif',
  'image/heif': 'heif',
  'image/avif': 'heif',
});

const ACCESS = Object.freeze({
  spreadsheetName: '출입관리 대장',
  spreadsheetPropertyKey: 'ACCESS_SPREADSHEET_ID',
  visitorApplicationSheetName: '외부 방문 신청대장',
  visitorSheetName: '외부 방문객 출입대장',
  employeeSheetName: '사원 출입대장',
  employeeRosterSheetName: '사원 명부',
  departmentAccessSheetName: '부서 출입 신청대장',
  managementRequestSheetName: '관리 요청',
  logSpreadsheetName: '출입관리 로그',
  logSpreadsheetPropertyKey: 'ACCESS_LOG_SPREADSHEET_ID',
  logSheetName: '로그',
  visitorApplicationColumnCount: 24,
  visitorColumnCount: 16,
  employeeColumnCount: 11,
  departmentAccessColumnCount: 16,
  logColumnCount: 10,
  managementRequestColumnCount: 12,
  maxOpenRecords: 100,
  maxVisitorApplications: 100,
  maxVisitorsPerApplication: 20,
  visitorRetentionYears: 5,
  visitorConsentVersion: '2026-08-11-v2',
  visitorSecurityVersion: '2026-08-07-v1',
});

const ADMIN = Object.freeze({
  registrarInitialPasswordHash:
    '2de709e7f01195c813b180daf818361ca107dcc05cf385047810267f35d35b1d',
  adminInitialPasswordHash:
    'e4a642f6d2967f985c78f3e0cf554145c81c9291255daf077231c2d532515bb6',
  registrarPasswordHashPropertyKey: 'REGISTRAR_PASSWORD_HASH_V2',
  adminPasswordHashPropertyKey: 'ADMIN_PASSWORD_HASH_V4',
  sessionPrefix: 'ADMIN_SESSION_V3_',
  sessionSeconds: 2 * 60 * 60,
});

const ROLE_CAPABILITIES = Object.freeze({
  registrar: Object.freeze({
    assetRegister: true,
    assetEdit: true,
    infoRegister: true,
    employeeEntry: true,
    visitorManage: true,
    movementRequest: true,
    requestCreate: true,
  }),
  admin: Object.freeze({
    assetRegister: true,
    assetEdit: true,
    infoRegister: true,
    infoManage: true,
    employeeEntry: true,
    employeeExit: true,
    visitorManage: true,
    movementRequest: true,
    movementManage: true,
    requestCreate: true,
    requestManage: true,
    auditRead: true,
  }),
});

const MOVEMENT = Object.freeze({
  spreadsheetName: '물품 반출입 대장',
  spreadsheetPropertyKey: 'MOVEMENT_SPREADSHEET_ID',
  sheetName: '물품 반출입 대장',
  logSheetName: '반출입 로그',
  columnCount: 16,
  logColumnCount: 10,
  maxOpenRecords: 100,
});

const INFO_ASSET = Object.freeze({
  spreadsheetName: '정보자산 관리대장',
  spreadsheetPropertyKey: 'INFO_ASSET_SPREADSHEET_ID',
  sheetName: '정보자산 대장',
  logSheetName: '정보자산 로그',
  columnCount: 18,
  logColumnCount: 10,
  maxRecords: 200,
  securityClasses: Object.freeze([
    '공개', '사내한', '대외비', '고객기밀',
  ]),
});

function getSharedBackgroundHtml_() {
  return HtmlService.createHtmlOutputFromFile(
    'SharedBackground'
  ).getContent();
}

function getCompanyLogoHtml_() {
  return HtmlService.createHtmlOutputFromFile(
    'CompanyLogo'
  ).getContent();
}

function getCachedPublicPage_(cacheKey, fileName, values) {
  const cache = CacheService.getScriptCache();
  const versionedKey = 'public-page-v92-' + cacheKey;
  let content = cache.get(versionedKey);

  if (!content) {
    const template = HtmlService.createTemplateFromFile(fileName);
    Object.keys(values || {}).forEach(function (key) {
      template[key] = values[key];
    });
    content = template.evaluate().getContent();
    if (content.length < 90000) {
      cache.put(versionedKey, content, 21600);
    }
  }

  return HtmlService.createHtmlOutput(content);
}

function warmPublicPages() {
  const webAppUrl = getPublicWebAppUrl_();
  getCachedPublicPage_('visitor-portal', 'VisitorPublic', {
    webAppUrl: webAppUrl,
  });
  getCachedPublicPage_('visitor-application', 'VisitorApplication', {
    webAppUrl: webAppUrl,
  });
  getCachedPublicPage_('visitor-checkin', 'VisitorMobile', {
    webAppUrl: webAppUrl,
  });
  getCachedPublicPage_('visitor-qr', 'VisitorQr', {
    visitorSelfUrl: webAppUrl + '?module=visitor&mode=checkin',
    webAppUrl: webAppUrl,
  });
  getCachedPublicPage_('login', 'AdminLogin', {
    webAppUrl: webAppUrl,
    requestedModule: '',
    invalidToken: false,
  });
  return true;
}

function doGet(event) {
  const parameters = event && event.parameter
    ? event.parameter
    : {};

  if (parameters.capture) {
    const template = HtmlService.createTemplateFromFile(
      'Capture'
    );
    template.sessionId = String(parameters.capture || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 80);
    template.token = String(parameters.token || '')
      .replace(/[^A-Za-z0-9-]/g, '')
      .slice(0, 160);
    template.webAppUrl = getPublicWebAppUrl_();

    return template.evaluate()
      .setTitle('길앤에스 휴대폰 촬영')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  const moduleName = String(parameters.module || '')
    .toLowerCase();
  const accessMode = String(parameters.mode || '')
    .toLowerCase();

  if (moduleName === 'visitor' && accessMode === 'portal') {
    return getCachedPublicPage_(
      'visitor-portal',
      'VisitorPublic',
      { webAppUrl: getPublicWebAppUrl_() }
    )
      .setTitle('외부 방문 안내')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'visitor' && accessMode === 'apply') {
    return getCachedPublicPage_(
      'visitor-application',
      'VisitorApplication',
      { webAppUrl: getPublicWebAppUrl_() }
    )
      .setTitle('외부 방문 신청')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (
    moduleName === 'visitor' &&
    (accessMode === 'self' || accessMode === 'checkin')
  ) {
    return getCachedPublicPage_(
      'visitor-checkin',
      'VisitorMobile',
      { webAppUrl: getPublicWebAppUrl_() }
    )
      .setTitle('외부 방문객 현장 등록')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'visitor' && accessMode === 'qr') {
    const publicUrl = getPublicWebAppUrl_();
    return getCachedPublicPage_(
      'visitor-qr',
      'VisitorQr',
      {
        visitorSelfUrl: publicUrl +
          '?module=visitor&mode=checkin',
        webAppUrl: publicUrl,
      }
    )
      .setTitle('외부 방문객 등록')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  const adminToken = cleanAdminToken_(
    parameters.adminToken
  );

  if (!moduleName && !adminToken) {
    const landingTemplate = HtmlService.createTemplateFromFile(
      'Landing'
    );
    landingTemplate.webAppUrl = getPublicWebAppUrl_();

    return landingTemplate.evaluate()
      .setTitle('길앤에스 통합 관리')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'login' && !adminToken) {
    return getCachedPublicPage_(
      'login',
      'AdminLogin',
      {
        webAppUrl: getPublicWebAppUrl_(),
        requestedModule: '',
        invalidToken: false,
      }
    )
      .setTitle('길앤에스 로그인')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  const sessionInfo = getSessionInfo_(adminToken);
  const userRole = sessionInfo ? sessionInfo.role : '';

  if (!userRole) {
    const loginTemplate = HtmlService.createTemplateFromFile(
      'AdminLogin'
    );
    loginTemplate.webAppUrl = getPublicWebAppUrl_();
    loginTemplate.requestedModule = moduleName === 'login'
      ? ''
      : moduleName;
    loginTemplate.invalidToken = Boolean(adminToken);

    return loginTemplate.evaluate()
      .setTitle('길앤에스 로그인')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'asset') {
    const assetTemplate = HtmlService.createTemplateFromFile(
      'Index'
    );
    assetTemplate.webAppUrl = getPublicWebAppUrl_();
    assetTemplate.adminToken = adminToken;
    assetTemplate.userRole = userRole;
    assetTemplate.actorName = sessionInfo.actorName;
    assetTemplate.initialMode = cleanText_(parameters.mode, 20);
    assetTemplate.initialSheetName = cleanText_(parameters.sheet, 100);
    assetTemplate.initialManagementNumber = cleanText_(parameters.asset, 20);

    return assetTemplate.evaluate()
      .setTitle(APP.title)
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'employee') {
    const departmentTemplate = HtmlService.createTemplateFromFile(
      'DepartmentAccess'
    );
    departmentTemplate.webAppUrl = getPublicWebAppUrl_();
    departmentTemplate.adminToken = adminToken;
    departmentTemplate.userRole = userRole;
    departmentTemplate.actorName = sessionInfo.actorName;
    return departmentTemplate.evaluate()
      .setTitle('부서 출입 관리')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (
    moduleName === 'visitor' &&
    !(ROLE_CAPABILITIES[userRole] || {}).visitorManage
  ) {
    const publicUrl = getPublicWebAppUrl_();
    const visitorQrTemplate = HtmlService.createTemplateFromFile('VisitorQr');
    visitorQrTemplate.visitorSelfUrl = publicUrl +
      '?module=visitor&mode=checkin';
    visitorQrTemplate.webAppUrl = publicUrl;
    visitorQrTemplate.adminToken = adminToken;
    visitorQrTemplate.userRole = userRole;
    visitorQrTemplate.actorName = sessionInfo.actorName;
    return visitorQrTemplate.evaluate()
      .setTitle('외부 방문객 등록')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (moduleName === 'visitor') {
    const accessTemplate = HtmlService.createTemplateFromFile(
      'Access'
    );
    accessTemplate.accessType = moduleName;
    accessTemplate.webAppUrl = getPublicWebAppUrl_();
    accessTemplate.adminToken = adminToken;
    accessTemplate.userRole = userRole;
    accessTemplate.actorName = sessionInfo.actorName;

    return accessTemplate.evaluate()
      .setTitle(
        moduleName === 'visitor'
          ? '외부 방문객 출입대장'
          : '부서 출입 관리'
      )
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'movement' &&
      ((ROLE_CAPABILITIES[userRole] || {}).movementRequest ||
       (ROLE_CAPABILITIES[userRole] || {}).movementManage)) {
    const movementTemplate = HtmlService.createTemplateFromFile(
      'AssetMovement'
    );
    movementTemplate.webAppUrl = getPublicWebAppUrl_();
    movementTemplate.adminToken = adminToken;
    movementTemplate.userRole = userRole;
    movementTemplate.actorName = sessionInfo.actorName;

    return movementTemplate.evaluate()
      .setTitle(userRole === 'admin'
        ? '물품 반출입 관리'
        : '물품 반출입 신청')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'info') {
    const infoTemplate = HtmlService.createTemplateFromFile(
      'InfoAssets'
    );
    infoTemplate.webAppUrl = getPublicWebAppUrl_();
    infoTemplate.adminToken = adminToken;
    infoTemplate.userRole = userRole;
    infoTemplate.actorName = sessionInfo.actorName;

    return infoTemplate.evaluate()
      .setTitle('정보자산관리')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );
  }

  if (moduleName === 'requests') {
    const requestTemplate = HtmlService.createTemplateFromFile(
      'ManagementRequests'
    );
    requestTemplate.webAppUrl = getPublicWebAppUrl_();
    requestTemplate.adminToken = adminToken;
    requestTemplate.userRole = userRole;
    requestTemplate.actorName = sessionInfo.actorName;

    return requestTemplate.evaluate()
      .setTitle('관리 요청')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  if (moduleName === 'audit' && userRole === 'admin') {
    const auditTemplate = HtmlService.createTemplateFromFile('AuditLogs');
    auditTemplate.webAppUrl = getPublicWebAppUrl_();
    auditTemplate.adminToken = adminToken;
    auditTemplate.userRole = userRole;
    auditTemplate.actorName = sessionInfo.actorName;

    return auditTemplate.evaluate()
      .setTitle('감사로그 열람')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  const portalTemplate = HtmlService.createTemplateFromFile(
    'Portal'
  );
  portalTemplate.webAppUrl = getPublicWebAppUrl_();
  portalTemplate.adminToken = adminToken;
  portalTemplate.userRole = userRole;
  portalTemplate.actorName = sessionInfo.actorName;

  return portalTemplate.evaluate()
    .setTitle('길앤에스 통합 관리')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

function adminLogin(password, requestedModule, requestedRole, actorName) {
  const role = normalizeUserRole_(requestedRole);
  const submittedHash = sha256Text_(String(password || ''));
  const properties = PropertiesService.getScriptProperties();
  const configuredHash = role === 'admin'
    ? properties.getProperty(
      ADMIN.adminPasswordHashPropertyKey
    ) || ADMIN.adminInitialPasswordHash
    : properties.getProperty(
      ADMIN.registrarPasswordHashPropertyKey
    ) || ADMIN.registrarInitialPasswordHash;

  if (!constantTimeEquals_(submittedHash, configuredHash)) {
    Utilities.sleep(500);
    throw new Error(
      (role === 'admin' ? '관리자' : '등록자') +
      ' 비밀번호가 올바르지 않습니다.'
    );
  }

  const actor = findEmployeeFromRoster_(
    ensureEmployeeRosterSheet_(getAccessSpreadsheetForRead_()),
    cleanText_(actorName, 80)
  );

  const token = Utilities.getUuid().replace(/-/g, '') +
    Utilities.getUuid().replace(/-/g, '');
  CacheService.getScriptCache().put(
    ADMIN.sessionPrefix + token,
    JSON.stringify({
      role: role,
      actorName: actor.name,
      employeeNumber: actor.employeeNumber,
      department: actor.department,
    }),
    ADMIN.sessionSeconds
  );
  const moduleName = String(requestedModule || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
  const query = [
    'adminToken=' + encodeURIComponent(token),
  ];

  if (moduleName) {
    query.push('module=' + encodeURIComponent(moduleName));
  }

  return {
    ok: true,
    token: token,
    role: role,
    actorName: actor.name,
    redirectUrl: getPublicWebAppUrl_() + '?' + query.join('&'),
  };
}

function adminLogout(token) {
  const cleanToken = cleanAdminToken_(token);

  if (cleanToken) {
    CacheService.getScriptCache().remove(
      ADMIN.sessionPrefix + cleanToken
    );
  }

  return {
    ok: true,
    redirectUrl: getPublicWebAppUrl_(),
  };
}

function changeAdminPassword(token, currentPassword, newPassword) {
  requireAdminSession_(token, 'admin');
  const nextPassword = String(newPassword || '');

  if (nextPassword.length < 12) {
    throw new Error('새 비밀번호는 12자 이상이어야 합니다.');
  }

  const properties = PropertiesService.getScriptProperties();
  const currentHash = properties.getProperty(
    ADMIN.adminPasswordHashPropertyKey
  ) || ADMIN.adminInitialPasswordHash;

  if (!constantTimeEquals_(
    sha256Text_(String(currentPassword || '')),
    currentHash
  )) {
    throw new Error('현재 비밀번호가 올바르지 않습니다.');
  }

  properties.setProperty(
    ADMIN.adminPasswordHashPropertyKey,
    sha256Text_(nextPassword)
  );

  return { ok: true };
}

function cleanAdminToken_(value) {
  return String(value || '')
    .replace(/[^A-Za-z0-9]/g, '')
    .slice(0, 128);
}

function getSessionRole_(token) {
  const session = getSessionInfo_(token);
  return session ? session.role : '';
}

function getSessionInfo_(token) {
  const cleanToken = cleanAdminToken_(token);

  if (!cleanToken) {
    return null;
  }

  const stored = CacheService.getScriptCache().get(
    ADMIN.sessionPrefix + cleanToken
  );
  if (!stored) {
    return null;
  }
  try {
    const session = JSON.parse(stored);
    if (
      (session.role === 'admin' || session.role === 'registrar') &&
      session.actorName
    ) {
      return session;
    }
  } catch (error) {
    console.warn(error);
  }
  return null;
}

function isValidAdminSession_(token) {
  return Boolean(getSessionRole_(token));
}

function normalizeUserRole_(value) {
  const role = String(value || '').toLowerCase();

  if (role !== 'registrar' && role !== 'admin') {
    throw new Error('로그인 유형을 선택하세요.');
  }

  return role;
}

function requireAdminSession_(token, requiredRole) {
  const session = getSessionInfo_(token);
  const role = session ? session.role : '';

  if (!role) {
    throw new Error(
      '로그인이 만료되었습니다. 다시 로그인하세요.'
    );
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    throw new Error('관리자만 사용할 수 있는 기능입니다.');
  }

  return role;
}

function requireSessionInfo_(token, requiredCapability) {
  const session = getSessionInfo_(token);
  if (!session) {
    throw new Error('로그인이 만료되었습니다. 다시 로그인하세요.');
  }
  if (
    requiredCapability &&
    !(ROLE_CAPABILITIES[session.role] || {})[requiredCapability]
  ) {
    throw new Error('현재 로그인 권한으로 사용할 수 없는 기능입니다.');
  }
  return session;
}

function getSessionFingerprint_(token) {
  return sha256Text_(cleanAdminToken_(token)).slice(0, 16);
}

function sha256Text_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(value || ''),
    Utilities.Charset.UTF_8
  );

  return bytes.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function constantTimeEquals_(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (a.charCodeAt(index) || 0) ^
      (b.charCodeAt(index) || 0);
  }

  return difference === 0;
}

/**
 * 공개 HTML 촬영 화면에서 보낸 사진을 처리합니다.
 * 응답은 숨은 iframe을 통해 부모 화면으로 전달합니다.
 *
 * @param {GoogleAppsScript.Events.DoPost} event POST 요청
 * @return {GoogleAppsScript.HTML.HtmlOutput} 처리 결과
 */
function doPost(event) {
  const parameters = event && event.parameter
    ? event.parameter
    : {};
  const requestId = String(parameters.requestId || '')
    .replace(/[^A-Za-z0-9-]/g, '')
    .slice(0, 80);
  let result = null;

  try {
    if (parameters.action !== 'uploadCapturedPhoto') {
      throw new Error('지원하지 않는 요청입니다.');
    }

    const payload = JSON.parse(
      String(parameters.payload || '{}')
    );
    result = uploadCapturedPhoto(payload);
    result.ok = true;
  } catch (error) {
    result = {
      ok: false,
      message: safeErrorMessage_(error),
    };
  }

  return createPostMessageResponse_(
    requestId,
    result
  );
}

/**
 * 외부 HTML의 숨은 iframe으로 업로드 결과를 보냅니다.
 *
 * @param {string} requestId 요청 식별자
 * @param {Object} result 처리 결과
 * @return {GoogleAppsScript.HTML.HtmlOutput} 응답 HTML
 */
function createPostMessageResponse_(requestId, result) {
  const message = JSON.stringify({
    source: 'gilns-mobile-upload',
    requestId: requestId,
    result: result,
  }).replace(/</g, '\\u003c');
  const html = [
    '<!doctype html><html><head>',
    '<meta charset="utf-8"></head><body>',
    '<script>',
    'window.top.postMessage(',
    message,
    ', "*");',
    '</script></body></html>',
  ].join('');

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}

/**
 * Apps Script 편집기에서 한 번 실행합니다.
 *
 * @param {string} photoRootFolderId 비품 사진 폴더 ID
 * @param {string} spreadsheetId Google Sheets 파일 ID
 * @return {Object} 연결 확인 결과
 */
function configureSystem_(photoRootFolderId, spreadsheetId) {
  const photoId = String(photoRootFolderId || '').trim();
  const sheetId = String(spreadsheetId || '').trim();

  if (!photoId || !sheetId) {
    throw new Error(
      '비품 사진 폴더 ID와 Google Sheets ID가 필요합니다.'
    );
  }

  const photoFolder = DriveApp.getFolderById(photoId);
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName(APP.sheetName);

  if (!sheet) {
    throw new Error(
      'Google Sheets에 고색연구소 시트가 없습니다.'
    );
  }

  PropertiesService.getScriptProperties().setProperties({
    PHOTO_ROOT_FOLDER_ID: photoFolder.getId(),
    SPREADSHEET_ID: spreadsheet.getId(),
    SHEET_NAME: APP.sheetName,
  });

  ensureCaptureHoldingFolderName_(photoFolder);
  const audit = ensureAuditLogSpreadsheet_(
    spreadsheet,
    photoFolder
  );

  return {
    ok: true,
    photoFolderName: photoFolder.getName(),
    photoFolderUrl: photoFolder.getUrl(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    sheetName: sheet.getName(),
    logSpreadsheetName: audit.spreadsheet.getName(),
    logSpreadsheetUrl: audit.spreadsheet.getUrl(),
  };
}

function adminRenameSystemNames(adminToken) {
  const session = requireSessionInfo_(adminToken, 'requestManage');
  const context = getContextWithAutoDiscovery_(true);
  const root = getRootFolderFromPhoto_(context.photoRoot);
  root.setName(APP.rootFolderName);
  context.spreadsheet.setName(APP.spreadsheetName);
  context.audit.spreadsheet.setName(APP.logSpreadsheetName);
  const accessSystem = getAccessSystemForUse_();
  accessSystem.spreadsheet.setName(ACCESS.spreadsheetName);
  accessSystem.log.spreadsheet.setName(ACCESS.logSpreadsheetName);
  const movementSystem = ensureMovementSystem_();
  movementSystem.spreadsheet.setName(MOVEMENT.spreadsheetName);
  const infoSystem = ensureInfoAssetSystem_();
  infoSystem.spreadsheet.setName(INFO_ASSET.spreadsheetName);
  appendAuditLog_(context.audit, {
    eventType: '시스템명칭정리',
    author: session.actorName,
    managementNumber: '',
    itemName: '전체 부서 공용 자산관리',
    status: '완료',
    remarks: '시스템 파일명에서 고색 표기를 제거함. 고색연구소 위치명은 유지.',
  });
  return {
    ok: true,
    rootFolderName: root.getName(),
    assetSpreadsheetName: context.spreadsheet.getName(),
    assetLogName: context.audit.spreadsheet.getName(),
    accessSpreadsheetName: accessSystem.spreadsheet.getName(),
    movementSpreadsheetName: movementSystem.spreadsheet.getName(),
    infoSpreadsheetName: infoSystem.spreadsheet.getName(),
  };
}

/**
 * 정해진 폴더명과 파일명으로 자동 연결을 시도합니다.
 *
 * @return {Object} 연결 결과
 */
function discoverAndConfigureSystem_() {
  let roots = collectFoldersByName_(APP.rootFolderName);
  if (roots.length === 0) {
    roots = collectFoldersByName_(APP.legacyRootFolderName);
  }

  if (roots.length !== 1) {
    throw new Error(
      '길앤에스_자산관리 폴더가 정확히 하나여야 합니다.'
    );
  }

  const root = roots[0];
  const photoFolders = collectChildFoldersByName_(
    root,
    APP.photoFolderName
  );

  if (photoFolders.length !== 1) {
    throw new Error(
      '최상위 폴더 안에 비품 사진 폴더가 정확히 하나여야 합니다.'
    );
  }

  let sheets = collectCompatibleSpreadsheets_(root);

  if (sheets.length === 0) {
    sheets = [convertSingleExcelWorkbook_(root)];
  }

  if (sheets.length !== 1) {
    throw new Error(
      '고색연구소 탭이 있는 Google Sheets 파일이 ' +
      '여러 개입니다. 사용할 파일만 남겨 주세요.'
    );
  }

  return configureSystem_(
    photoFolders[0].getId(),
    sheets[0].getId()
  );
}

/**
 * 고색연구소 탭이 있는 Google Sheets를 찾습니다.
 * 정확한 시스템 파일명이 있으면 그 파일을 우선합니다.
 *
 * @param {GoogleAppsScript.Drive.Folder} root 최상위 폴더
 * @return {GoogleAppsScript.Drive.File[]} 사용 가능한 파일
 */
function collectCompatibleSpreadsheets_(root) {
  const exactNameSheets = [];
  const compatibleSheets = [];
  const files = root.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (files.hasNext()) {
    const file = files.next();
    const spreadsheet = SpreadsheetApp.openById(file.getId());

    if (spreadsheet.getSheetByName(APP.sheetName)) {
      compatibleSheets.push(file);

      if (file.getName() === APP.spreadsheetName ||
          file.getName() === APP.legacySpreadsheetName) {
        exactNameSheets.push(file);
      }
    }
  }

  if (exactNameSheets.length === 1) {
    return exactNameSheets;
  }

  return compatibleSheets;
}

/**
 * 최상위 폴더의 엑셀 원본 한 개를 Google Sheets로 변환합니다.
 * 원본 파일은 변경하거나 삭제하지 않습니다.
 *
 * @param {GoogleAppsScript.Drive.Folder} root 최상위 폴더
 * @return {GoogleAppsScript.Drive.File} 변환된 Google Sheets
 */
function convertSingleExcelWorkbook_(root) {
  const excelFiles = [];
  const files = root.getFiles();

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    const mimeType = file.getMimeType();
    const isExcelMime = mimeType === MimeType.MICROSOFT_EXCEL;
    const isExcelName = /\.(xlsx|xls)$/i.test(name);

    if (isExcelMime || isExcelName) {
      excelFiles.push(file);
    }
  }

  if (excelFiles.length !== 1) {
    throw new Error(
      'Google Sheets 변환 대상 엑셀 파일이 ' +
      '최상위 폴더에 정확히 하나여야 합니다.'
    );
  }

  const source = excelFiles[0];
  const created = Drive.Files.create(
    {
      name: APP.spreadsheetName,
      mimeType: MimeType.GOOGLE_SHEETS,
      parents: [root.getId()],
    },
    source.getBlob(),
    {
      fields: 'id,name,mimeType',
    }
  );

  const spreadsheet = SpreadsheetApp.openById(created.id);

  if (!spreadsheet.getSheetByName(APP.sheetName)) {
    DriveApp.getFileById(created.id).setTrashed(true);
    throw new Error(
      '변환된 Google Sheets에 고색연구소 탭이 없습니다.'
    );
  }

  return DriveApp.getFileById(created.id);
}

function getPublicConfig(selectedSheetName, adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'assetRegister');
    const userRole = session.role;
    const context = getContextWithAutoDiscovery_(
      false,
      selectedSheetName
    );
    const nextAsset = getNextAssetPosition_(context.sheet);
    const sheetNames = getSelectableSheetNames_(
      context.spreadsheet
    );
    const accessSpreadsheet = getAccessSpreadsheetForRead_();
    const employeeRoster = ensureEmployeeRosterSheet_(
      accessSpreadsheet
    );

    return {
      ok: true,
      title: APP.title,
      userRole: userRole,
      actorName: session.actorName,
      nextManagementNumber: nextAsset.managementNumber,
      maxFilesPerCategory: APP.maxFilesPerCategory,
      minProductPhotos: APP.minProductPhotos,
      maxFileBytes: APP.maxFileBytes,
      maxTotalBytes: APP.maxTotalBytes,
      photoFolderName: context.photoRoot.getName(),
      sheetName: context.sheet.getName(),
      manager: getSiteManager_(context.sheet.getName()),
      assetSheetUrl:
        context.spreadsheet.getUrl() +
        '#gid=' + context.sheet.getSheetId(),
      sheetNames: sheetNames,
      employees: listEmployeeRoster_(employeeRoster),
      today: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd'
      ),
    };
  } catch (error) {
    return {
      ok: false,
      title: APP.title,
      message: safeErrorMessage_(error),
    };
  }
}

function createCaptureSession(adminToken) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    requireSessionInfo_(adminToken, 'assetRegister');
    lock.waitLock(30000);
    hasLock = true;

    const context = getContextWithAutoDiscovery_(false);
    const serviceUrl = getPublicWebAppUrl_();

    if (!serviceUrl) {
      throw new Error(
        '웹앱 배포 후 휴대폰 촬영을 연결할 수 있습니다.'
      );
    }

    cleanupExpiredCaptureSessions_();

    const sessionId = Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 20);
    const token = Utilities.getUuid().replace(/-/g, '');
    const holdingRoot = getCaptureHoldingRoot_(
      context.photoRoot
    );
    const folder = holdingRoot.createFolder(
      '촬영_' + sessionId
    );

    createCategoryFolders_(folder);

    const now = Date.now();
    const metadata = {
      sessionId: sessionId,
      token: token,
      folderId: folder.getId(),
      createdAt: now,
      expiresAt: now + APP.captureExpiryMillis,
      completedAt: null,
    };

    PropertiesService.getScriptProperties().setProperty(
      getCapturePropertyKey_(sessionId),
      JSON.stringify(metadata)
    );

    return {
      ok: true,
      sessionId: sessionId,
      token: token,
      captureUrl: getMobileBridgeUrl_() +
        '#capture=' + encodeURIComponent(sessionId) +
        '&token=' + encodeURIComponent(token),
      directCaptureUrl: serviceUrl +
        '?capture=' + encodeURIComponent(sessionId) +
        '&token=' + encodeURIComponent(token),
      expiresAt: metadata.expiresAt,
      completed: false,
      counts: emptyCategoryCounts_(),
    };
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

/**
 * 다른 사람의 휴대폰에서도 열리는 공개 배포 주소를 반환합니다.
 *
 * @return {string} /exec로 끝나는 공개 웹앱 주소
 */
function getPublicWebAppUrl_() {
  const configuredUrl = String(
    APP.publicWebAppUrl || ''
  ).trim();

  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/
    .test(configuredUrl)) {
    throw new Error(
      '공개 웹앱 주소 설정이 올바르지 않습니다.'
    );
  }

  return configuredUrl;
}

/**
 * Android의 Apps Script 링크 연결 오류를 우회하는
 * GitHub Pages 중간 주소를 반환합니다.
 *
 * @return {string} 공개 모바일 중간 페이지 주소
 */
function getMobileBridgeUrl_() {
  const configuredUrl = String(
    APP.mobileBridgeUrl || ''
  ).trim();

  if (!/^https:\/\/headradicalltd\.github\.io\/[^#?]+$/
    .test(configuredUrl)) {
    throw new Error(
      '휴대폰 연결 중간 주소 설정이 올바르지 않습니다.'
    );
  }

  return configuredUrl;
}

function uploadCapturedPhoto(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const key = cleanText_(source.category, 30);

    if (!CATEGORY_MAP[key]) {
      throw new Error('사진 종류가 올바르지 않습니다.');
    }

    const normalizedFiles = normalizeFiles_([source.file]);

    if (normalizedFiles.length !== 1) {
      throw new Error('촬영한 사진을 읽지 못했습니다.');
    }

    const file = normalizedFiles[0];

    const fileBytes = validateImageFile_(file);

    if (fileBytes > APP.maxFileBytes) {
      throw new Error('사진 한 장은 8MB를 넘을 수 없습니다.');
    }

    const snapshot = getCaptureSnapshot_(
      source.sessionId,
      source.token
    );

    if (snapshot.counts[key] >= APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 최대 ' +
        APP.maxFilesPerCategory +
        '장입니다.'
      );
    }

    if (
      snapshot.totalBytes + fileBytes >
      APP.maxTotalBytes
    ) {
      throw new Error(
        '휴대폰 촬영 사진은 전체 25MB를 넘을 수 없습니다.'
      );
    }

    const targetFolder = getCaptureCategoryFolder_(
      snapshot.folder,
      key
    );
    const sequence = snapshot.counts[key] + 1;
    const extension = getFileExtension_(
      file.name,
      file.mimeType
    );
    const fileName = CATEGORY_MAP[key].filePrefix +
      '_' + pad2_(sequence) + '.' + extension;
    const blob = Utilities.newBlob(
      Utilities.base64Decode(file.base64),
      file.mimeType,
      fileName
    );
    const driveFile = targetFolder.createFile(blob);

    driveFile.setDescription(
      '휴대폰 QR 촬영\n' +
      Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd HH:mm:ss'
      )
    );

    return getCaptureSessionStatus(
      source.sessionId,
      source.token
    );
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getCaptureSessionStatus(sessionId, token) {
  const snapshot = getCaptureSnapshot_(sessionId, token);

  return {
    ok: true,
    sessionId: snapshot.metadata.sessionId,
    expiresAt: snapshot.metadata.expiresAt,
    completed: Boolean(snapshot.metadata.completedAt),
    counts: snapshot.counts,
    totalBytes: snapshot.totalBytes,
  };
}

function completeCaptureSession(sessionId, token) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const snapshot = getCaptureSnapshot_(sessionId, token);

    snapshot.metadata.completedAt = Date.now();
    PropertiesService.getScriptProperties().setProperty(
      getCapturePropertyKey_(snapshot.metadata.sessionId),
      JSON.stringify(snapshot.metadata)
    );

    return {
      ok: true,
      sessionId: snapshot.metadata.sessionId,
      expiresAt: snapshot.metadata.expiresAt,
      completed: true,
      counts: snapshot.counts,
      totalBytes: snapshot.totalBytes,
    };
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function validateRegistrationFiles_(
  localFiles,
  snapshot,
  missingPhotos
) {
  let totalBytes = snapshot ? snapshot.totalBytes : 0;
  const capturedCounts = snapshot
    ? snapshot.counts
    : emptyCategoryCounts_();
  const missing = missingPhotos || {};

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const local = localFiles[key] || [];
    const combinedCount = local.length + capturedCounts[key];

    if (combinedCount > APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 PC와 휴대폰을 합쳐 최대 ' +
        APP.maxFilesPerCategory +
        '장입니다.'
      );
    }

    local.forEach(function (file) {
      totalBytes += estimateBase64Bytes_(file.base64);
    });

    if (
      DOCUMENT_CATEGORY_KEYS.indexOf(key) >= 0 &&
      combinedCount === 0 &&
      missing[key] !== true
    ) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진을 등록하거나 사진 없음을 선택하세요.'
      );
    }

    if (
      DOCUMENT_CATEGORY_KEYS.indexOf(key) >= 0 &&
      combinedCount > 0 &&
      missing[key] === true
    ) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진과 사진 없음을 함께 선택할 수 없습니다.'
      );
    }
  });

  const productCount =
    (localFiles.product || []).length +
    capturedCounts.product;

  if (productCount < APP.minProductPhotos) {
    throw new Error(
      '실물 사진을 최소 ' +
      APP.minProductPhotos +
      '장 등록하세요.'
    );
  }

  if (totalBytes > APP.maxTotalBytes) {
    throw new Error(
      'PC와 휴대폰 사진은 전체 25MB를 넘을 수 없습니다.'
    );
  }
}

function getCaptureSnapshot_(sessionId, token) {
  const metadata = getCaptureMetadata_(sessionId, token);
  const folder = DriveApp.getFolderById(metadata.folderId);
  const files = {};
  const counts = emptyCategoryCounts_();
  let totalBytes = 0;

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const categoryFolder = getCaptureCategoryFolder_(
      folder,
      key
    );
    const iterator = categoryFolder.getFiles();
    const items = [];

    while (iterator.hasNext()) {
      const file = iterator.next();
      items.push(file);
      totalBytes += file.getSize();
    }

    items.sort(function (left, right) {
      return left.getName().localeCompare(right.getName());
    });
    files[key] = items;
    counts[key] = items.length;
  });

  return {
    metadata: metadata,
    folder: folder,
    files: files,
    counts: counts,
    totalBytes: totalBytes,
  };
}

function getCaptureMetadata_(sessionId, token) {
  const cleanSessionId = cleanText_(sessionId, 80);
  const cleanToken = cleanText_(token, 160);

  if (!cleanSessionId || !cleanToken) {
    throw new Error('휴대폰 촬영 연결정보가 없습니다.');
  }

  const property = PropertiesService.getScriptProperties()
    .getProperty(getCapturePropertyKey_(cleanSessionId));

  if (!property) {
    throw new Error(
      '촬영 연결이 만료되었습니다. QR을 다시 연결하세요.'
    );
  }

  const metadata = JSON.parse(property);

  if (metadata.token !== cleanToken) {
    throw new Error('휴대폰 촬영 연결정보가 올바르지 않습니다.');
  }

  if (Number(metadata.expiresAt) < Date.now()) {
    throw new Error(
      '촬영 연결이 만료되었습니다. QR을 다시 연결하세요.'
    );
  }

  return metadata;
}

function copyCapturedFiles_(
  categoryFolders,
  snapshot,
  existingCounts,
  author,
  managementNumber,
  itemName
) {
  const copiedCounts = emptyCategoryCounts_();

  if (!snapshot) {
    return copiedCounts;
  }

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    snapshot.files[key].forEach(function (file, index) {
      const extension = getFileExtension_(
        file.getName(),
        file.getMimeType()
      );
      const sequence = existingCounts[key] + index + 1;
      const fileName = makeStoredFileName_(
        managementNumber,
        itemName,
        key,
        sequence,
        extension
      );
      const copied = file.makeCopy(
        fileName,
        categoryFolders[key]
      );

      copied.setDescription(
        '작성자: ' + author + '\n' +
        '휴대폰 QR 촬영\n' +
        '등록일시: ' +
        Utilities.formatDate(
          new Date(),
          APP.timeZone,
          'yyyy-MM-dd HH:mm:ss'
        )
      );
      copiedCounts[key] += 1;
    });
  });

  return copiedCounts;
}

function finishCaptureSession_(snapshot) {
  snapshot.folder.setTrashed(true);
  PropertiesService.getScriptProperties().deleteProperty(
    getCapturePropertyKey_(snapshot.metadata.sessionId)
  );
}

function cleanupExpiredCaptureSessions_() {
  const properties = PropertiesService.getScriptProperties();
  const all = properties.getProperties();

  Object.keys(all).forEach(function (key) {
    if (!key.startsWith(APP.capturePropertyPrefix)) {
      return;
    }

    try {
      const metadata = JSON.parse(all[key]);

      if (Number(metadata.expiresAt) >= Date.now()) {
        return;
      }

      DriveApp.getFolderById(metadata.folderId)
        .setTrashed(true);
      properties.deleteProperty(key);
    } catch (error) {
      console.error(error);
    }
  });
}

function getCaptureHoldingRoot_(photoRoot) {
  const parents = photoRoot.getParents();
  const parent = parents.hasNext()
    ? parents.next()
    : photoRoot;
  const folders = collectChildFoldersByName_(
    parent,
    APP.captureHoldingFolderName
  );

  if (folders.length > 1) {
    throw new Error(
      '_촬영대기 폴더가 여러 개 있습니다.'
    );
  }

  return folders.length === 1
    ? folders[0]
    : parent.createFolder(APP.captureHoldingFolderName);
}

function ensureCaptureHoldingFolderName_(photoRoot) {
  const root = getRootFolderFromPhoto_(photoRoot);
  const current = collectChildFoldersByName_(
    root,
    APP.captureHoldingFolderName
  );
  const legacy = collectChildFoldersByName_(
    root,
    '_촬영대기'
  );

  if (current.length > 1 || legacy.length > 1) {
    throw new Error(
      '촬영사진 임시보관 폴더 구성을 확인하세요.'
    );
  }

  if (current.length === 1 && legacy.length === 1) {
    throw new Error(
      '기존 촬영대기 폴더와 새 임시보관 폴더가 함께 있습니다.'
    );
  }

  if (legacy.length === 1) {
    legacy[0].setName(APP.captureHoldingFolderName);
    return legacy[0];
  }

  return current.length === 1
    ? current[0]
    : root.createFolder(APP.captureHoldingFolderName);
}

function getCaptureCategoryFolder_(sessionFolder, key) {
  const folders = collectChildFoldersByName_(
    sessionFolder,
    CATEGORY_MAP[key].folderName
  );

  if (folders.length !== 1) {
    throw new Error('촬영 임시폴더 구조가 올바르지 않습니다.');
  }

  return folders[0];
}

function getCapturePropertyKey_(sessionId) {
  return APP.capturePropertyPrefix + sessionId;
}

function emptyCategoryCounts_() {
  return {
    invoice: 0,
    purchaseOrder: 0,
    taxInvoice: 0,
    product: 0,
  };
}

/**
 * 자산정보와 사진을 등록합니다.
 *
 * @param {Object} request 등록 요청
 * @return {Object} 등록 결과
 */
function registerAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let assetFolder = null;
  let assetSheet = null;
  let assetRow = null;
  let capturedSnapshot = null;

  try {
    const session = requireSessionInfo_(
      request && request.adminToken,
      'assetRegister'
    );
    lock.waitLock(30000);
    hasLock = true;

    const payload = normalizePayload_(request);
    validatePayload_(payload);
    payload.author = session.actorName;

    if (payload.captureSession.sessionId) {
      capturedSnapshot = getCaptureSnapshot_(
        payload.captureSession.sessionId,
        payload.captureSession.token
      );
    }

    validateRegistrationFiles_(
      payload.files,
      capturedSnapshot,
      payload.missingPhotos
    );

    const context = getContextWithAutoDiscovery_(
      true,
      payload.sheetName
    );
    const nextAsset = getNextAssetPosition_(context.sheet);
    assertTargetRowAvailable_(
      context.sheet,
      nextAsset.row,
      nextAsset.managementNumber
    );

    const folderName = makeAssetFolderName_(
      nextAsset.managementNumber,
      payload.vendor,
      payload.itemName
    );

    assetFolder = context.photoRoot.createFolder(folderName);

    const categoryFolders = createCategoryFolders_(assetFolder);
    const fileCounts = saveFiles_(
      categoryFolders,
      payload.files,
      payload.author,
      nextAsset.managementNumber,
      payload.itemName
    );
    const capturedCounts = copyCapturedFiles_(
      categoryFolders,
      capturedSnapshot,
      fileCounts,
      payload.author,
      nextAsset.managementNumber,
      payload.itemName
    );

    Object.keys(CATEGORY_MAP).forEach(function (key) {
      fileCounts[key] += capturedCounts[key];
    });

    assetSheet = context.sheet;
    assetRow = nextAsset.row;
    writeAssetRow_(assetSheet, nextAsset, payload);

    SpreadsheetApp.flush();

    const afterValues = createAssetSnapshot_(
      nextAsset.managementNumber,
      payload,
      assetFolder,
      fileCounts
    );
    const logId = appendAuditLog_(
      context.audit,
      {
        eventType: '신규등록',
        author: payload.author,
        sheetName: context.sheet.getName(),
        row: nextAsset.row,
        managementNumber: nextAsset.managementNumber,
        reason: '',
        beforeValues: null,
        afterValues: afterValues,
      }
    );

    if (capturedSnapshot) {
      try {
        finishCaptureSession_(capturedSnapshot);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }

    return {
      ok: true,
      managementNumber: nextAsset.managementNumber,
      sheetName: context.sheet.getName(),
      row: nextAsset.row,
      folderName: assetFolder.getName(),
      folderUrl: assetFolder.getUrl(),
      logId: logId,
      registeredAt: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd HH:mm:ss'
      ),
      fileCounts: fileCounts,
    };
  } catch (error) {
    if (assetSheet && assetRow) {
      try {
        assetSheet
          .getRange(
            assetRow,
            APP.firstDataColumn,
            1,
            APP.dataColumnCount
          )
          .clearContent();
      } catch (sheetRollbackError) {
        console.error(sheetRollbackError);
      }
    }

    if (assetFolder) {
      try {
        assetFolder.setTrashed(true);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }

    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getAssetForEdit(sheetName, managementNumber, adminToken) {
  requireSessionInfo_(adminToken, 'assetEdit');
  const cleanNumber = normalizeManagementNumber_(
    managementNumber
  );
  const context = getContextWithAutoDiscovery_(
    false,
    sheetName
  );
  const row = findAssetRow_(
    context.sheet,
    cleanNumber
  );
  const asset = readAssetRecord_(context.sheet, row);
  asset.manager = getSiteManager_(context.sheet.getName());
  const assetFolder = findAssetFolder_(
    context.photoRoot,
    cleanNumber
  );

  return {
    ok: true,
    row: row,
    asset: asset,
    photos: listAssetPhotoFiles_(assetFolder),
  };
}

function searchAssetsForEdit(sheetName, query, adminToken) {
  requireSessionInfo_(adminToken, 'assetEdit');
  const keyword = cleanText_(query, 100).toLowerCase();
  if (!keyword) {
    throw new Error('자산명 또는 품목을 입력하세요.');
  }

  const context = getContextWithAutoDiscovery_(false, sheetName);
  const sheet = context.sheet;
  const lastRow = Math.max(sheet.getLastRow(), APP.firstDataRow - 1);
  if (lastRow < APP.firstDataRow) {
    return { ok: true, sheetName: sheet.getName(), results: [] };
  }

  const rows = sheet.getRange(
    APP.firstDataRow,
    APP.firstDataColumn,
    lastRow - APP.firstDataRow + 1,
    APP.dataColumnCount
  ).getDisplayValues();
  const results = [];

  rows.forEach(function (row, index) {
    if (results.length >= 30) {
      return;
    }
    const managementNumber = String(row[0] || '').trim();
    const itemName = String(row[1] || '').trim();
    const modelMaker = normalizePlaceholder_(row[2]);
    const vendor = String(row[3] || '').trim();
    const storageLocation = String(row[8] || '').trim();
    const haystack = [itemName, modelMaker]
      .join(' ')
      .toLowerCase();

    if (/^\d+$/.test(managementNumber) && haystack.indexOf(keyword) !== -1) {
      results.push({
        managementNumber: Number(managementNumber),
        itemName: itemName,
        modelMaker: modelMaker,
        vendor: vendor,
        storageLocation: storageLocation,
        row: APP.firstDataRow + index,
      });
    }
  });

  return {
    ok: true,
    sheetName: sheet.getName(),
    results: results,
  };
}

function searchAssetsForMovement(sheetName, query, adminToken) {
  requireSessionInfo_(adminToken, 'movementRequest');
  return searchAssetsForEdit(sheetName, query, adminToken);
}

function listAssetPhotoFiles_(assetFolder) {
  const categories = {};
  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const folders = collectChildFoldersByName_(
      assetFolder,
      CATEGORY_MAP[key].folderName
    );
    categories[key] = [];
    folders.forEach(function (folder) {
      const files = folder.getFiles();
      while (files.hasNext()) {
        const file = files.next();
        categories[key].push({
          fileId: file.getId(),
          name: file.getName(),
          url: file.getUrl(),
          size: file.getSize(),
        });
      }
    });
    categories[key] = categories[key].filter(function (photo, index, list) {
      return list.findIndex(function (candidate) {
        return candidate.fileId === photo.fileId;
      }) === index;
    });
    categories[key].sort(function (left, right) {
      return left.name.localeCompare(right.name);
    });
  });
  return {
    folderUrl: assetFolder.getUrl(),
    categories: categories,
  };
}

function updateAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;
  let assetFolder = null;
  let originalFolderName = '';
  let rowUpdated = false;
  let photoMutation = null;

  try {
    const session = requireSessionInfo_(
      request && request.adminToken,
      'assetEdit'
    );
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const managementNumber = normalizeManagementNumber_(
      source.managementNumber
    );
    const reason = cleanText_(source.reason, 300);
    const payload = normalizePayload_(source);

    validatePayload_(payload);
    payload.author = session.actorName;

    if (!reason) {
      throw new Error('수정 사유를 입력하세요.');
    }

    const context = getContextWithAutoDiscovery_(
      true,
      payload.sheetName
    );
    const row = findAssetRow_(
      context.sheet,
      managementNumber
    );
    const beforeRecord = readAssetRecord_(
      context.sheet,
      row
    );

    assetFolder = findAssetFolder_(
      context.photoRoot,
      managementNumber
    );
    originalFolderName = assetFolder.getName();

    const fileCountsBefore = countAssetFiles_(assetFolder);
    const beforeValues = createAssetSnapshot_(
      managementNumber,
      beforeRecord,
      assetFolder,
      fileCountsBefore
    );

    photoMutation = applyAssetPhotoChanges_(
      assetFolder,
      payload.files,
      source.deletePhotoFileIds,
      payload.missingPhotos,
      payload.author,
      managementNumber,
      payload.itemName
    );
    const fileCounts = photoMutation.fileCounts;

    targetRange = context.sheet.getRange(
      row,
      APP.firstDataColumn,
      1,
      APP.dataColumnCount
    );
    originalValues = targetRange.getValues();

    writeExistingAssetRow_(
      context.sheet,
      row,
      managementNumber,
      payload
    );
    rowUpdated = true;

    const newFolderName = makeAssetFolderName_(
      managementNumber,
      payload.vendor,
      payload.itemName
    );
    assetFolder.setName(newFolderName);
    SpreadsheetApp.flush();

    const afterValues = createAssetSnapshot_(
      managementNumber,
      payload,
      assetFolder,
      fileCounts
    );
    const logId = appendAuditLog_(
      context.audit,
      {
        eventType: photoMutation.changed
          ? '정보·사진수정'
          : '정보수정',
        author: payload.author,
        sheetName: context.sheet.getName(),
        row: row,
        managementNumber: managementNumber,
        reason: reason,
        beforeValues: beforeValues,
        afterValues: afterValues,
      }
    );

    return {
      ok: true,
      managementNumber: managementNumber,
      sheetName: context.sheet.getName(),
      row: row,
      folderName: assetFolder.getName(),
      folderUrl: assetFolder.getUrl(),
      logId: logId,
      updatedAt: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd HH:mm:ss'
      ),
      fileCounts: fileCounts,
    };
  } catch (error) {
    if (rowUpdated && targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (sheetRollbackError) {
        console.error(sheetRollbackError);
      }
    }

    if (assetFolder && originalFolderName) {
      try {
        assetFolder.setName(originalFolderName);
      } catch (folderRollbackError) {
        console.error(folderRollbackError);
      }
    }

    if (photoMutation) {
      rollbackAssetPhotoChanges_(photoMutation);
    }

    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function normalizeManagementNumber_(value) {
  const text = String(value == null ? '' : value).trim();

  if (!/^\d+$/.test(text) || Number(text) < 1) {
    throw new Error('관리번호를 정확히 입력하세요.');
  }

  return Number(text);
}

function findAssetRow_(sheet, managementNumber) {
  const lastRow = Math.max(
    sheet.getLastRow(),
    APP.firstDataRow - 1
  );

  if (lastRow < APP.firstDataRow) {
    throw new Error('등록된 자산이 없습니다.');
  }

  const values = sheet.getRange(
    APP.firstDataRow,
    APP.firstDataColumn,
    lastRow - APP.firstDataRow + 1,
    APP.dataColumnCount
  ).getDisplayValues();
  const matches = [];

  values.forEach(function (row, index) {
    const hasAssetData = row.slice(1).some(function (value) {
      return String(value || '').trim() !== '';
    });

    if (
      hasAssetData &&
      Number(String(row[0] || '').trim()) ===
        managementNumber
    ) {
      matches.push(APP.firstDataRow + index);
    }
  });

  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? '해당 관리번호를 찾을 수 없습니다.'
        : '같은 관리번호가 여러 개입니다.'
    );
  }

  return matches[0];
}

function readAssetRecord_(sheet, row) {
  const range = sheet.getRange(
    row,
    APP.firstDataColumn,
    1,
    APP.dataColumnCount
  );
  const values = range.getValues()[0];
  const displays = range.getDisplayValues()[0];
  const purchaseDate = values[5] instanceof Date
    ? Utilities.formatDate(
        values[5],
        APP.timeZone,
        'yyyy-MM-dd'
      )
    : String(displays[5] || '').trim();
  const sheetAmount = values[4];

  return {
    managementNumber: Number(displays[0]),
    itemName: String(displays[1] || '').trim(),
    modelMaker: normalizePlaceholder_(displays[2]),
    vendor: String(displays[3] || '').trim(),
    amount: amountFromSheetUnit_(sheetAmount),
    purchaseDate: purchaseDate,
    manager: normalizePlaceholder_(displays[6]),
    partNumber: normalizePlaceholder_(displays[7]),
    storageLocation: String(displays[8] || '').trim(),
    remarks: normalizePlaceholder_(displays[9]),
  };
}

function normalizePlaceholder_(value) {
  const text = String(value || '').trim();
  return text === '-' ? '' : text;
}

function writeExistingAssetRow_(
  sheet,
  row,
  managementNumber,
  payload
) {
  const purchaseDateParts = payload.purchaseDate
    .split('-')
    .map(function (value) {
      return Number(value);
    });
  const purchaseDate = new Date(Date.UTC(
    purchaseDateParts[0],
    purchaseDateParts[1] - 1,
    purchaseDateParts[2],
    12,
    0,
    0
  ));

  sheet.getRange(
    row,
    APP.firstDataColumn,
    1,
    APP.dataColumnCount
  ).setValues([[
    managementNumber,
    payload.itemName,
    payload.modelMaker || '-',
    payload.vendor,
    amountToSheetUnit_(payload.amount),
    purchaseDate,
    payload.manager || '-',
    '',
    payload.storageLocation,
    payload.remarks || '',
  ]]);
  sheet.getRange(row, 7).setNumberFormat('yyyy-mm-dd');
  sheet
    .getRange(row, APP.firstDataColumn + 4)
    .setNumberFormat('#,##0.###')
    .setHorizontalAlignment('right');
}

function findAssetFolder_(photoRoot, managementNumber) {
  const prefix = String(managementNumber) + '_';
  const folders = photoRoot.getFolders();
  const matches = [];

  while (folders.hasNext()) {
    const folder = folders.next();

    if (folder.getName().indexOf(prefix) === 0) {
      matches.push(folder);
    }
  }

  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? '자산 사진 폴더를 찾을 수 없습니다.'
        : '같은 관리번호의 사진 폴더가 여러 개입니다.'
    );
  }

  return matches[0];
}

function countAssetFiles_(assetFolder) {
  const counts = emptyCategoryCounts_();

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const folders = collectChildFoldersByName_(
      assetFolder,
      CATEGORY_MAP[key].folderName
    );

    if (folders.length !== 1) {
      throw new Error(
        assetFolder.getName() +
        ' 폴더 구조가 올바르지 않습니다.'
      );
    }

    const files = folders[0].getFiles();

    while (files.hasNext()) {
      files.next();
      counts[key] += 1;
    }
  });

  return counts;
}

function normalizeDeletePhotoFileIds_(value) {
  const source = value || {};
  const result = {};
  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const values = Array.isArray(source[key]) ? source[key] : [];
    result[key] = values.map(function (fileId) {
      return cleanText_(fileId, 100);
    }).filter(function (fileId, index, list) {
      return fileId && list.indexOf(fileId) === index;
    });
  });
  return result;
}

function applyAssetPhotoChanges_(
  assetFolder,
  fileGroups,
  deletePhotoFileIds,
  missingPhotos,
  author,
  managementNumber,
  itemName
) {
  const categoryFolders = {};
  const filesByCategory = {};
  const deleteIds = normalizeDeletePhotoFileIds_(deletePhotoFileIds);
  const mutation = {
    deletedFiles: [],
    createdFiles: [],
    fileCounts: emptyCategoryCounts_(),
    changedCategories: {},
    changed: false,
  };

  try {
    Object.keys(CATEGORY_MAP).forEach(function (key) {
      const folders = collectChildFoldersByName_(
        assetFolder,
        CATEGORY_MAP[key].folderName
      );
      categoryFolders[key] = folders.length > 0
        ? folders[0]
        : assetFolder.createFolder(CATEGORY_MAP[key].folderName);
      filesByCategory[key] = {};
      (folders.length > 0 ? folders : [categoryFolders[key]])
        .forEach(function (folder) {
          const files = folder.getFiles();
          while (files.hasNext()) {
            const file = files.next();
            filesByCategory[key][file.getId()] = file;
          }
        });

      deleteIds[key].forEach(function (fileId) {
        const file = filesByCategory[key][fileId];
        if (!file) {
          throw new Error('삭제할 사진이 해당 자산 폴더에 없습니다.');
        }
        file.setTrashed(true);
        mutation.deletedFiles.push(file);
        delete filesByCategory[key][fileId];
      });

      const remainingCount = Object.keys(filesByCategory[key]).length;
      const newCount = (fileGroups[key] || []).length;
      mutation.changedCategories[key] =
        deleteIds[key].length > 0 || newCount > 0;
      if (remainingCount + newCount > APP.maxFilesPerCategory) {
        throw new Error(
          CATEGORY_MAP[key].folderName + ' 사진은 최대 ' +
          APP.maxFilesPerCategory + '개까지 저장할 수 있습니다.'
        );
      }
      mutation.fileCounts[key] = remainingCount;
    });

    const beforeCreatedIds = {};
    Object.keys(CATEGORY_MAP).forEach(function (key) {
      beforeCreatedIds[key] = Object.keys(filesByCategory[key]);
    });
    const addedCounts = saveFiles_(
      categoryFolders,
      fileGroups,
      author,
      managementNumber,
      itemName,
      mutation.fileCounts
    );

    Object.keys(CATEGORY_MAP).forEach(function (key) {
      mutation.fileCounts[key] += Number(addedCounts[key] || 0);
      const files = categoryFolders[key].getFiles();
      while (files.hasNext()) {
        const file = files.next();
        if (beforeCreatedIds[key].indexOf(file.getId()) === -1) {
          mutation.createdFiles.push(file);
        }
      }
    });

    mutation.changed = Object.keys(CATEGORY_MAP).some(function (key) {
      return mutation.changedCategories[key];
    });
    if (
      mutation.changedCategories.product &&
      mutation.fileCounts.product < APP.minProductPhotos
    ) {
      throw new Error('실물 사진은 최소 ' + APP.minProductPhotos + '장이 필요합니다.');
    }
    DOCUMENT_CATEGORY_KEYS.forEach(function (key) {
      if (
        mutation.changedCategories[key] &&
        mutation.fileCounts[key] === 0 &&
        !(missingPhotos && missingPhotos[key] === true)
      ) {
        throw new Error(
          CATEGORY_MAP[key].folderName +
          ' 사진을 남기거나 사진 없음을 선택하세요.'
        );
      }
    });

    return mutation;
  } catch (error) {
    rollbackAssetPhotoChanges_(mutation);
    throw error;
  }
}

function rollbackAssetPhotoChanges_(mutation) {
  (mutation.createdFiles || []).forEach(function (file) {
    try {
      file.setTrashed(true);
    } catch (error) {
      console.error(error);
    }
  });
  (mutation.deletedFiles || []).forEach(function (file) {
    try {
      file.setTrashed(false);
    } catch (error) {
      console.error(error);
    }
  });
}

function getContext_(createHistory, selectedSheetName) {
  const properties = PropertiesService.getScriptProperties();
  const photoRootId = properties.getProperty(
    'PHOTO_ROOT_FOLDER_ID'
  );
  const spreadsheetId = properties.getProperty(
    'SPREADSHEET_ID'
  );
  const configuredSheetName =
    properties.getProperty('SHEET_NAME') ||
    APP.sheetName;
  const sheetName = cleanText_(selectedSheetName, 100) ||
    configuredSheetName;

  if (!photoRootId || !spreadsheetId) {
    throw new Error(
      '시스템 연결이 필요합니다.'
    );
  }

  const photoRoot = DriveApp.getFolderById(photoRootId);
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  if (
    spreadsheet.getSpreadsheetTimeZone() !== APP.timeZone
  ) {
    spreadsheet.setSpreadsheetTimeZone(APP.timeZone);
  }

  const sheet = getSelectableSheet_(spreadsheet, sheetName);
  let audit = null;

  if (createHistory) {
    audit = ensureAuditLogSpreadsheet_(
      spreadsheet,
      photoRoot
    );
  }

  return {
    photoRoot: photoRoot,
    spreadsheet: spreadsheet,
    sheet: sheet,
    audit: audit,
  };
}

function getContextWithAutoDiscovery_(
  createHistory,
  selectedSheetName
) {
  try {
    return getContext_(createHistory, selectedSheetName);
  } catch (error) {
    const message = String(
      error && error.message ? error.message : error
    );

    if (!/시스템 연결이 필요합니다/.test(message)) {
      throw error;
    }

    discoverAndConfigureSystem_();
    return getContext_(createHistory, selectedSheetName);
  }
}

function adminUnhideAllColumnsAndClearPartNumbers(adminToken) {
  const session = requireSessionInfo_(adminToken, 'movementManage');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const context = getContextWithAutoDiscovery_(true);
    const spreadsheet = context.spreadsheet;
    const sourceFile = DriveApp.getFileById(spreadsheet.getId());
    const parents = sourceFile.getParents();
    const backupName = sourceFile.getName() + '_P-N삭제전백업_' +
      Utilities.formatDate(new Date(), APP.timeZone, 'yyyyMMdd_HHmmss');
    const backupFile = parents.hasNext()
      ? sourceFile.makeCopy(backupName, parents.next())
      : sourceFile.makeCopy(backupName);
    const results = [];
    let clearedCellCount = 0;

    spreadsheet.getSheets().forEach(function (sheet) {
      const maxColumns = sheet.getMaxColumns();
      if (maxColumns > 0) {
        sheet.showColumns(1, maxColumns);
      }

      const partNumberColumn = findHeaderColumn_(sheet, 'P/N');
      let clearedValues = 0;

      if (partNumberColumn) {
        const lastRow = Math.max(sheet.getLastRow(), APP.headerRow);
        const range = sheet.getRange(
          APP.headerRow,
          partNumberColumn,
          lastRow - APP.headerRow + 1,
          1
        );
        clearedValues = range.getDisplayValues().filter(function (row) {
          return String(row[0] || '').trim() !== '';
        }).length;
        range.clearContent();
        clearedCellCount += clearedValues;
      }

      results.push({
        sheetName: sheet.getName(),
        columnCount: maxColumns,
        partNumberColumn: partNumberColumn || 0,
        clearedValues: clearedValues,
      });
    });

    appendAuditLog_(context.audit, {
      author: session.actorName,
      eventType: 'P/N 일괄삭제 및 숨김 열 해제',
      managementNumber: 0,
      sheetName: '전체 자산 시트',
      row: 0,
      reason: '사용자 요청에 따른 자산대장 정리',
      beforeValues: null,
      afterValues: {
        itemName: 'P/N 일괄삭제 및 숨김 열 해제',
        vendor: '',
        amount: '',
        folderName: '',
        folderUrl: backupFile.getUrl(),
        fileCounts: emptyCategoryCounts_(),
        clearedCellCount: clearedCellCount,
        results: results,
      },
    });

    SpreadsheetApp.flush();
    return {
      ok: true,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      backupName: backupFile.getName(),
      backupUrl: backupFile.getUrl(),
      clearedCellCount: clearedCellCount,
      results: results,
    };
  } finally {
    lock.releaseLock();
  }
}

function adminInspectPartNumberCleanup(adminToken) {
  requireSessionInfo_(adminToken, 'movementManage');
  const context = getContextWithAutoDiscovery_(false);
  const spreadsheet = context.spreadsheet;
  const assetSheetNames = getSelectableSheetNames_(spreadsheet);

  return {
    ok: true,
    spreadsheetName: spreadsheet.getName(),
    results: spreadsheet.getSheets().map(function (sheet) {
      const hiddenColumns = [];
      for (let column = 1; column <= sheet.getMaxColumns(); column += 1) {
        if (sheet.isColumnHiddenByUser(column)) {
          hiddenColumns.push(column);
        }
      }

      const remainingPartNumberValues = [];
      if (assetSheetNames.indexOf(sheet.getName()) !== -1) {
        const lastRow = Math.max(sheet.getLastRow(), APP.headerRow);
        sheet.getRange(
          APP.headerRow,
          APP.firstDataColumn + 7,
          lastRow - APP.headerRow + 1,
          1
        ).getDisplayValues().forEach(function (row, index) {
          const value = String(row[0] || '').trim();
          if (value) {
            remainingPartNumberValues.push({
              row: APP.headerRow + index,
              value: value,
            });
          }
        });
      }

      return {
        sheetName: sheet.getName(),
        hiddenColumns: hiddenColumns,
        remainingPartNumberValues: remainingPartNumberValues,
      };
    }),
  };
}

function adminListExactTestAssets(adminToken) {
  requireSessionInfo_(adminToken, 'requestManage');
  return {
    ok: true,
    candidates: listExactTestAssetCandidates_(),
  };
}

function adminDeleteExactTestAssets(adminToken) {
  const session = requireSessionInfo_(adminToken, 'requestManage');
  const lock = LockService.getScriptLock();
  let hasLock = false;
  try {
    lock.waitLock(30000);
    hasLock = true;
    const candidates = listExactTestAssetCandidates_();
    if (!candidates.length) {
      return { ok: true, deleted: [], backupUrl: '' };
    }

    const baseContext = getContextWithAutoDiscovery_(false);
    const backupName = baseContext.spreadsheet.getName() +
      '_TEST삭제전_' + Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyyMMdd_HHmmss'
      );
    const backupFile = DriveApp
      .getFileById(baseContext.spreadsheet.getId())
      .makeCopy(backupName, baseContext.root);
    const deleted = [];

    candidates.forEach(function (candidate) {
      const context = getContextWithAutoDiscovery_(
        true,
        candidate.sheetName
      );
      const row = findAssetRow_(
        context.sheet,
        candidate.managementNumber
      );
      const record = readAssetRecord_(context.sheet, row);
      if (String(record.itemName || '').trim().toLowerCase() !== 'test' &&
          String(record.itemName || '').trim() !== '테스트') {
        throw new Error('삭제 직전 TEST 자산 검증에 실패했습니다.');
      }

      let assetFolder = null;
      let fileCounts = emptyCategoryCounts_();
      try {
        assetFolder = findAssetFolder_(
          context.photoRoot,
          candidate.managementNumber
        );
        fileCounts = countAssetFiles_(assetFolder);
      } catch (folderError) {
        console.warn(folderError);
      }
      const beforeValues = createAssetSnapshot_(
        candidate.managementNumber,
        record,
        assetFolder,
        fileCounts
      );

      context.sheet.getRange(
        row,
        APP.firstDataColumn,
        1,
        APP.dataColumnCount
      ).clearContent();
      if (assetFolder) {
        assetFolder.setTrashed(true);
      }
      appendAuditLog_(context.audit, {
        eventType: '테스트자료삭제',
        author: session.actorName,
        sheetName: context.sheet.getName(),
        row: row,
        managementNumber: candidate.managementNumber,
        reason: '운영 전 TEST 자산 정리',
        beforeValues: beforeValues,
        afterValues: {
          status: '삭제',
          backupUrl: backupFile.getUrl(),
        },
      });
      deleted.push(candidate);
    });
    SpreadsheetApp.flush();
    return {
      ok: true,
      deleted: deleted,
      backupUrl: backupFile.getUrl(),
    };
  } catch (error) {
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function listExactTestAssetCandidates_() {
  const context = getContextWithAutoDiscovery_(false);
  const results = [];
  getSelectableSheetNames_(context.spreadsheet)
    .forEach(function (sheetName) {
      if (!SITE_MANAGERS[normalizeSiteName_(sheetName)]) {
        return;
      }
      const sheet = context.spreadsheet.getSheetByName(sheetName);
      const lastRow = Math.max(sheet.getLastRow(), APP.firstDataRow - 1);
      if (lastRow < APP.firstDataRow) {
        return;
      }
      sheet.getRange(
        APP.firstDataRow,
        APP.firstDataColumn,
        lastRow - APP.firstDataRow + 1,
        APP.dataColumnCount
      ).getDisplayValues().forEach(function (row, index) {
        const managementNumber = String(row[0] || '').trim();
        const itemName = String(row[1] || '').trim();
        const normalizedItemName = itemName.toLowerCase();
        if (
          /^\d+$/.test(managementNumber) &&
          (normalizedItemName === 'test' || itemName === '테스트')
        ) {
          results.push({
            sheetName: sheetName,
            row: APP.firstDataRow + index,
            managementNumber: Number(managementNumber),
            itemName: itemName,
            modelMaker: normalizePlaceholder_(row[2]),
            vendor: String(row[3] || '').trim(),
          });
        }
      });
    });
  return results;
}

function getSelectableSheetNames_(spreadsheet) {
  return spreadsheet.getSheets()
    .map(function (sheet) {
      return sheet.getName();
    })
    .filter(function (sheetName) {
      return !isHistorySheetName_(sheetName);
    });
}

function getSelectableSheet_(spreadsheet, sheetName) {
  const cleanName = cleanText_(sheetName, 100);

  if (!cleanName || isHistorySheetName_(cleanName)) {
    throw new Error('등록할 자산 관리 시트를 선택하세요.');
  }

  const sheet = spreadsheet.getSheetByName(cleanName);

  if (!sheet) {
    throw new Error(
      '선택한 자산 관리 시트를 찾을 수 없습니다.'
    );
  }

  return sheet;
}

function isHistorySheetName_(sheetName) {
  const normalized = String(sheetName || '')
    .replace(/\s/g, '');

  return normalized.indexOf('등록이력') !== -1 ||
    normalized === APP.logSheetName;
}

function getDepartmentAccessConfig(adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'employeeEntry');
    const spreadsheet = getAccessSpreadsheetForRead_();
    const sheet = ensureDepartmentAccessSheet_(spreadsheet);
    const records = listDepartmentAccessRecords_(sheet, session);
    return {
      ok: true,
      actorName: session.actorName,
      employeeNumber: session.employeeNumber,
      department: session.department,
      userRole: session.role,
      departments: ACCESS_DEPARTMENTS.slice(),
      ledgerUrl: session.role === 'admin'
        ? spreadsheet.getUrl() + '#gid=' + sheet.getSheetId()
        : '',
      myRequests: records.filter(function (record) {
        return record.isMine;
      }),
      approvalRequests: records.filter(function (record) {
        return record.canApprove && record.status === '승인 대기';
      }),
      today: Utilities.formatDate(new Date(), APP.timeZone, 'yyyy-MM-dd'),
    };
  } catch (error) {
    return { ok: false, message: safeErrorMessage_(error) };
  }
}

function createDepartmentAccessRequest(request) {
  const source = request || {};
  const session = requireSessionInfo_(source.adminToken, 'employeeEntry');
  const targetDepartment = cleanText_(source.targetDepartment, 100);
  const purpose = cleanText_(source.purpose, 300);
  const visitDate = parseVisitorDate_(source.visitDate, '출입 예정일');
  if (ACCESS_DEPARTMENTS.indexOf(targetDepartment) === -1) {
    throw new Error('출입할 부서를 목록에서 선택하세요.');
  }
  if (!purpose) {
    throw new Error('출입 목적을 입력하세요.');
  }
  const today = Utilities.formatDate(new Date(), APP.timeZone, 'yyyy-MM-dd');
  if (Utilities.formatDate(visitDate, APP.timeZone, 'yyyy-MM-dd') < today) {
    throw new Error('지난 날짜로는 출입을 신청할 수 없습니다.');
  }
  if (normalizeSiteName_(session.department) === normalizeSiteName_(targetDepartment)) {
    throw new Error('본인 부서가 아닌 다른 부서 출입만 신청하세요.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const system = getAccessSystemForUse_();
    const sheet = ensureDepartmentAccessSheet_(system.spreadsheet);
    const now = new Date();
    const requestId = 'DA-' + Utilities.formatDate(now, APP.timeZone, 'yyyyMMdd') +
      '-' + Utilities.getUuid().replace(/-/g, '').slice(0, 8).toUpperCase();
    const row = Math.max(2, sheet.getLastRow() + 1);
    sheet.getRange(row, 1, 1, ACCESS.departmentAccessColumnCount).setValues([[
      requestId, now, session.actorName, session.employeeNumber,
      session.department, targetDepartment, visitDate, purpose,
      '승인 대기', '', '', '', '', '', now, '',
    ]]);
    formatDepartmentAccessRow_(sheet, row);
    appendAccessAuditLog_(system.log, {
      eventType: '부서출입신청',
      author: session.actorName,
      accessType: 'employee',
      recordId: requestId,
      name: session.actorName,
      details: { targetDepartment: targetDepartment, purpose: purpose },
    });
    return getDepartmentAccessConfig(source.adminToken);
  } finally {
    lock.releaseLock();
  }
}

function processDepartmentAccessDecision(request) {
  const source = request || {};
  const session = requireSessionInfo_(source.adminToken, 'employeeEntry');
  const action = String(source.action || '').toLowerCase();
  if (['approve', 'reject'].indexOf(action) === -1) {
    throw new Error('승인 또는 반려를 선택하세요.');
  }
  const reason = cleanText_(source.reason, 300);
  if (action === 'reject' && !reason) {
    throw new Error('반려 사유를 입력하세요.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const system = getAccessSystemForUse_();
    const sheet = ensureDepartmentAccessSheet_(system.spreadsheet);
    const row = findDepartmentAccessRow_(sheet, cleanText_(source.requestId, 50));
    const record = departmentAccessRowToRecord_(
      sheet.getRange(row, 1, 1, ACCESS.departmentAccessColumnCount).getValues()[0],
      row,
      session
    );
    if (record.isMine) {
      throw new Error('본인의 출입 신청은 본인이 승인할 수 없습니다.');
    }
    if (!record.canApprove) {
      throw new Error('해당 부서의 출입 승인 권한이 없습니다.');
    }
    if (record.status !== '승인 대기') {
      throw new Error('이미 처리된 신청입니다.');
    }
    const now = new Date();
    sheet.getRange(row, 9, 1, 4).setValues([[
      action === 'approve' ? '승인' : '반려',
      session.actorName,
      now,
      reason,
    ]]);
    sheet.getRange(row, 15).setValue(now);
    formatDepartmentAccessRow_(sheet, row);
    appendAccessAuditLog_(system.log, {
      eventType: action === 'approve' ? '부서출입승인' : '부서출입반려',
      author: session.actorName,
      accessType: 'employee',
      recordId: record.requestId,
      name: record.requesterName,
      details: { reason: reason, targetDepartment: record.targetDepartment },
    });
    return getDepartmentAccessConfig(source.adminToken);
  } finally {
    lock.releaseLock();
  }
}

function markDepartmentAccessState(request) {
  const source = request || {};
  const session = requireSessionInfo_(source.adminToken, 'employeeEntry');
  const action = String(source.action || '').toLowerCase();
  if (['enter', 'exit'].indexOf(action) === -1) {
    throw new Error('입장 또는 퇴장을 선택하세요.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const system = getAccessSystemForUse_();
    const sheet = ensureDepartmentAccessSheet_(system.spreadsheet);
    const row = findDepartmentAccessRow_(sheet, cleanText_(source.requestId, 50));
    const record = departmentAccessRowToRecord_(
      sheet.getRange(row, 1, 1, ACCESS.departmentAccessColumnCount).getValues()[0],
      row,
      session
    );
    if (!record.isMine && session.role !== 'admin') {
      throw new Error('본인의 출입 기록만 처리할 수 있습니다.');
    }
    if (record.status !== '승인' && record.status !== '입장') {
      throw new Error('승인된 신청만 입장·퇴장 처리할 수 있습니다.');
    }
    const now = new Date();
    if (action === 'enter') {
      if (record.enteredAt) throw new Error('이미 입장 처리되었습니다.');
      sheet.getRange(row, 9).setValue('입장');
      sheet.getRange(row, 13).setValue(now);
    } else {
      if (!record.enteredAt || record.exitedAt) throw new Error('입장 상태가 아닙니다.');
      sheet.getRange(row, 9).setValue('퇴장');
      sheet.getRange(row, 14).setValue(now);
    }
    sheet.getRange(row, 15).setValue(now);
    formatDepartmentAccessRow_(sheet, row);
    appendAccessAuditLog_(system.log, {
      eventType: action === 'enter' ? '부서출입입장' : '부서출입퇴장',
      author: session.actorName,
      accessType: 'employee',
      recordId: record.requestId,
      name: record.requesterName,
      details: { targetDepartment: record.targetDepartment },
    });
    return getDepartmentAccessConfig(source.adminToken);
  } finally {
    lock.releaseLock();
  }
}

function ensureDepartmentAccessSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(ACCESS.departmentAccessSheetName);
  const cache = CacheService.getScriptCache();
  const cacheKey = 'department-access-schema-v92-' + spreadsheet.getId();
  if (sheet && cache.get(cacheKey) === '1') return sheet;
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ACCESS.departmentAccessSheetName);
  }
  const headers = [
    '신청번호', '신청일시', '신청자', '사번', '신청자 부서',
    '출입 대상 부서', '출입 예정일', '출입 목적', '상태',
    '처리자', '처리일시', '처리 사유', '입장일시', '퇴장일시',
    '최종수정', '비고',
  ];
  const current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  if (current.join('') !== headers.join('')) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight('bold').setBackground('#dce8f7')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  protectSheetForHumans_(sheet, '부서 출입 프로그램 전용 기록');
  cache.put(cacheKey, '1', 21600);
  return sheet;
}

function findDepartmentAccessRow_(sheet, requestId) {
  if (!requestId) throw new Error('출입 신청번호가 없습니다.');
  const match = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1)
    .createTextFinder(requestId).matchEntireCell(true).findNext();
  if (!match) throw new Error('부서 출입 신청을 찾을 수 없습니다.');
  return match.getRow();
}

function listDepartmentAccessRecords_(sheet, session) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(
    2, 1, sheet.getLastRow() - 1, ACCESS.departmentAccessColumnCount
  ).getValues().map(function (values, index) {
    return departmentAccessRowToRecord_(values, index + 2, session);
  }).sort(function (left, right) {
    return right.appliedAt.localeCompare(left.appliedAt);
  }).slice(0, 200);
}

function departmentAccessRowToRecord_(values, row, session) {
  const targetDepartment = String(values[5] || '');
  const isMine = String(values[3] || '') === String(session.employeeNumber || '') ||
    String(values[2] || '') === String(session.actorName || '');
  const isTargetDepartmentMember = Boolean(
    session.department && targetDepartment &&
    normalizeSiteName_(session.department) === normalizeSiteName_(targetDepartment)
  );
  return {
    row: row,
    requestId: String(values[0] || ''),
    appliedAt: formatAccessDateTime_(values[1]),
    requesterName: String(values[2] || ''),
    employeeNumber: String(values[3] || ''),
    requesterDepartment: String(values[4] || ''),
    targetDepartment: targetDepartment,
    visitDate: formatDateOnly_(values[6]),
    purpose: String(values[7] || ''),
    status: String(values[8] || ''),
    processedBy: String(values[9] || ''),
    processedAt: formatAccessDateTime_(values[10]),
    reason: String(values[11] || ''),
    enteredAt: formatAccessDateTime_(values[12]),
    exitedAt: formatAccessDateTime_(values[13]),
    isMine: isMine,
    canApprove: !isMine && isTargetDepartmentMember,
  };
}

function formatDepartmentAccessRow_(sheet, row) {
  sheet.getRange(row, 1, 1, ACCESS.departmentAccessColumnCount)
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true, '#000000',
      SpreadsheetApp.BorderStyle.SOLID);
  sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(row, 7).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(row, 11, 1, 5).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

function getAccessPublicConfig(accessType, adminToken) {
  try {
    const type = normalizeAccessType_(accessType);
    const session = requireSessionInfo_(
      adminToken,
      type === 'visitor' ? 'visitorManage' : 'employeeEntry'
    );
    const userRole = session.role;
    const spreadsheet = getAccessSpreadsheetForRead_();
    const sheet = getAccessSheet_(spreadsheet, type);
    const employeeRoster = type === 'employee'
      ? ensureEmployeeRosterSheet_(spreadsheet)
      : null;

    return {
      ok: true,
      accessType: type,
      userRole: userRole,
      actorName: session.actorName,
      title: type === 'visitor'
        ? ACCESS.visitorSheetName
        : ACCESS.employeeSheetName,
      ledgerUrl:
        spreadsheet.getUrl() +
        '#gid=' + sheet.getSheetId(),
      openRecords: listOpenAccessRecords_(sheet, type),
      applications:
        (ROLE_CAPABILITIES[userRole] || {}).visitorManage && type === 'visitor'
          ? filterVisitorApplicationsForSession_(
            listVisitorApplications_(spreadsheet), session
          )
          : [],
      employees: employeeRoster
        ? listEmployeeRoster_(employeeRoster)
        : [],
      employeeRosterUrl: employeeRoster
        ? spreadsheet.getUrl() +
          '#gid=' + employeeRoster.getSheetId()
        : '',
      refreshedAt: formatAccessDateTime_(new Date()),
    };
  } catch (error) {
    return {
      ok: false,
      message: safeErrorMessage_(error),
    };
  }
}

function registerAccessEntry(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;

  try {
    requireSessionInfo_(request && request.adminToken, 'employeeEntry');
    lock.waitLock(30000);
    hasLock = true;

    const payload = normalizeAccessPayload_(request);
    if (payload.accessType === 'visitor') {
      throw new Error(
        '방문객 입장은 승인된 방문 신청의 QR 등록으로만 처리할 수 있습니다.'
      );
    }
    const system = getAccessSystemForUse_();
    const sheet = getAccessSheet_(
      system.spreadsheet,
      payload.accessType
    );
    const entryAt = new Date();
    const recordId = makeAccessRecordId_(
      payload.accessType,
      entryAt
    );
    const row = Math.max(sheet.getLastRow() + 1, 2);
    const values = makeAccessRowValues_(
      payload,
      recordId,
      entryAt
    );

    targetRange = sheet.getRange(
      row,
      1,
      1,
      values.length
    );
    targetRange.setValues([values]);
    formatAccessDataRow_(
      sheet,
      row,
      values.length
    );
    SpreadsheetApp.flush();

    appendAccessAuditLog_(system.log, {
      eventType: '입장등록',
      author: payload.processedBy,
      accessType: payload.accessType,
      recordId: recordId,
      name: payload.name,
      details: Object.assign({}, payload, {
        sessionFingerprint: getSessionFingerprint_(request.adminToken),
      }),
    });

    return {
      ok: true,
      accessType: payload.accessType,
      recordId: recordId,
      name: payload.name,
      enteredAt: formatAccessDateTime_(entryAt),
      openRecords: listOpenAccessRecords_(
        sheet,
        payload.accessType
      ),
    };
  } catch (error) {
    if (targetRange) {
      try {
        targetRange.clearContent();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function registerVisitorSelfEntry(request) {
  return registerApprovedVisitorEntry(request);
}

function registerVisitorGroupEntry(request) {
  throw new Error(
    '방문객은 사전 승인된 방문 신청으로만 입장할 수 있습니다.'
  );
}

function getVisitorSelfConfig() {
  try {
    const spreadsheet = getAccessSpreadsheetForRead_();
    getAccessSheet_(spreadsheet, 'visitor');
    ensureVisitorApplicationSheet_(spreadsheet);

    return {
      ok: true,
      title: '외부 방문객 현장 등록',
      maxVisitors: ACCESS.maxVisitorsPerApplication,
    };
  } catch (error) {
    return {
      ok: false,
      message: safeErrorMessage_(error),
    };
  }
}

function getVisitorApplicationConfig() {
  try {
    const spreadsheet = getAccessSpreadsheetForRead_();
    ensureVisitorApplicationSheet_(spreadsheet);
    ensureEmployeeRosterSheet_(spreadsheet);

    return {
      ok: true,
      maxVisitors: ACCESS.maxVisitorsPerApplication,
      today: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd'
      ),
      retentionYears: ACCESS.visitorRetentionYears,
      consentVersion: ACCESS.visitorConsentVersion,
    };
  } catch (error) {
    return {
      ok: false,
      message: safeErrorMessage_(error),
    };
  }
}

function validateVisitorHostName(name) {
  try {
    const normalizedName = cleanText_(name, 80);

    if (!normalizedName) {
      return {
        ok: true,
        exists: false,
        message: '방문 대상 직원 이름을 입력하세요.',
      };
    }

    const spreadsheet = getAccessSpreadsheetForRead_();
    const exists = getEmployeeRosterNameMapCached_(
      spreadsheet
    )[normalizedName] === true;

    return {
      ok: true,
      exists: exists,
      message: exists
        ? ''
        : '사원 명부에서 해당 이름을 찾을 수 없습니다.',
    };
  } catch (error) {
    return {
      ok: false,
      exists: false,
      message: safeErrorMessage_(error),
    };
  }
}

function createVisitorApplication(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const payload = normalizeVisitorApplicationRequest_(request);
    const system = getAccessSystemForUse_();
    const sheet = ensureVisitorApplicationSheet_(
      system.spreadsheet
    );
    assertVisitorHostExists_(system.spreadsheet, payload.hostName);

    const appliedAt = new Date();
    const applicationNumber = makeVisitorApplicationNumber_(
      appliedAt
    );
    const retentionDate = new Date(payload.visitStartDate);
    retentionDate.setFullYear(
      retentionDate.getFullYear() + ACCESS.visitorRetentionYears
    );
    const startRow = Math.max(sheet.getLastRow() + 1, 2);
    const rows = payload.visitors.map(function (visitor) {
      return [
        applicationNumber,
        appliedAt,
        '승인 대기',
        payload.organization,
        payload.visitStartDate,
        payload.visitEndDate,
        payload.visitPurpose,
        payload.hostName,
        visitor.visitorId,
        visitor.isRepresentative ? '대표' : '',
        visitor.name,
        visitor.phone,
        visitor.vehicleNumber,
        visitor.carryItems,
        appliedAt,
        ACCESS.visitorConsentVersion,
        '',
        '',
        '',
        '',
        '',
        retentionDate,
        '',
        payload.remarks,
      ];
    });

    targetRange = sheet.getRange(
      startRow,
      1,
      rows.length,
      ACCESS.visitorApplicationColumnCount
    );
    sheet.getRange(startRow, 1, rows.length, 1)
      .setNumberFormat('@');
    sheet.getRange(startRow, 9, rows.length, 1)
      .setNumberFormat('@');
    sheet.getRange(startRow, 12, rows.length, 1)
      .setNumberFormat('@');
    targetRange.setValues(rows);
    formatVisitorApplicationRows_(sheet, startRow, rows.length);
    SpreadsheetApp.flush();

    const representative = payload.visitors.filter(
      function (visitor) {
        return visitor.isRepresentative;
      }
    )[0];

    appendAccessAuditLog_(system.log, {
      eventType: '방문신청',
      author: representative.name,
      accessType: 'visitor',
      recordId: applicationNumber,
      name: representative.name,
      details: {
        applicationNumber: applicationNumber,
        organization: payload.organization,
        visitStartDate: formatDateOnly_(payload.visitStartDate),
        visitEndDate: formatDateOnly_(payload.visitEndDate),
        visitPurpose: payload.visitPurpose,
        hostName: payload.hostName,
        visitorNames: payload.visitors.map(function (visitor) {
          return visitor.name;
        }),
        privacyConsentVersion: ACCESS.visitorConsentVersion,
        companionConsentConfirmed: true,
      },
    });

    return {
      ok: true,
      applicationNumber: applicationNumber,
      representativeName: representative.name,
      representativePhone: representative.phone,
      status: '승인 대기',
      appliedAt: formatAccessDateTime_(appliedAt),
    };
  } catch (error) {
    if (targetRange) {
      try {
        targetRange.clearContent();
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getVisitorApplicationStatus(request) {
  try {
    const source = request || {};
    const name = cleanText_(source.name, 80);
    const phone = normalizeVisitorPhone_(source.phone);
    if (!name) {
      throw new Error('신청자 이름을 입력하세요.');
    }
    const spreadsheet = getAccessSpreadsheetForRead_();
    const applications = findVisitorApplicationsByRepresentative_(
      spreadsheet,
      name,
      phone
    );

    return {
      ok: true,
      applications: applications,
    };
  } catch (error) {
    throw new Error(safeErrorMessage_(error));
  }
}

function findVisitorApplicationsByRepresentative_(spreadsheet, name, phone) {
  const sheet = ensureVisitorApplicationSheet_(spreadsheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('이름과 연락처가 일치하는 방문 신청이 없습니다.');
  }
  const records = sheet.getRange(
    2,
    1,
    lastRow - 1,
    ACCESS.visitorApplicationColumnCount
  ).getValues().map(function (values, index) {
    return visitorApplicationRowToRecord_(values, index + 2);
  });
  const applicationNumbers = {};
  records.forEach(function (record) {
    if (
      record.isRepresentative &&
      record.name === name &&
      record.phone === phone
    ) {
      applicationNumbers[record.applicationNumber] = true;
    }
  });
  const grouped = {};
  records.forEach(function (record) {
    if (!applicationNumbers[record.applicationNumber]) return;
    if (!grouped[record.applicationNumber]) {
      grouped[record.applicationNumber] = [];
    }
    grouped[record.applicationNumber].push(record);
  });
  const applications = Object.keys(grouped).map(function (applicationNumber) {
    return summarizeVisitorApplication_(spreadsheet, grouped[applicationNumber]);
  }).sort(function (left, right) {
    return right.appliedAt.localeCompare(left.appliedAt);
  });
  if (!applications.length) {
    throw new Error('이름과 연락처가 일치하는 방문 신청이 없습니다.');
  }
  return applications;
}

function cancelVisitorApplication(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const applicationNumber = cleanVisitorApplicationNumber_(
      source.applicationNumber
    );
    const phone = normalizeVisitorPhone_(source.phone);
    const system = getAccessSystemForUse_();
    const sheet = ensureVisitorApplicationSheet_(system.spreadsheet);
    const rows = getVisitorApplicationRows_(sheet, applicationNumber);
    const representative = assertRepresentativePhone_(rows, phone);
    const overallStatus = getVisitorApplicationOverallStatus_(rows);

    if (!rows.some(function (row) {
      return row.status === '승인 대기' || row.status === '승인';
    })) {
      throw new Error('현재 상태에서는 신청을 취소할 수 없습니다.');
    }
    if (hasVisitorApplicationEntry_(system.spreadsheet, applicationNumber)) {
      throw new Error('한 명이라도 입장한 신청은 취소할 수 없습니다.');
    }

    const processedAt = new Date();
    const startRow = rows[0].row;
    targetRange = sheet.getRange(
      startRow,
      1,
      rows.length,
      ACCESS.visitorApplicationColumnCount
    );
    originalValues = targetRange.getValues();
    const nextValues = originalValues.map(function (values) {
      const next = values.slice();
      next[2] = '신청 취소';
      next[16] = '방문자 신청 취소';
      next[17] = representative.name;
      next[18] = processedAt;
      next[22] = processedAt;
      return next;
    });
    targetRange.setValues(nextValues);
    formatVisitorApplicationRows_(sheet, startRow, rows.length);
    SpreadsheetApp.flush();

    appendAccessAuditLog_(system.log, {
      eventType: '방문신청취소',
      author: representative.name,
      accessType: 'visitor',
      recordId: applicationNumber,
      name: representative.name,
      details: {
        previousStatus: overallStatus,
        cancelledAt: formatAccessDateTime_(processedAt),
      },
    });

    return {
      ok: true,
      applicationNumber: applicationNumber,
      status: '신청 취소',
      cancelledAt: formatAccessDateTime_(processedAt),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function filterVisitorApplicationsForSession_(applications, session) {
  if (session.role === 'admin' || VISITOR_APPROVAL_POLICY === 'all_registrars') {
    return applications;
  }
  return applications.filter(function (application) {
    return application.hostName === session.actorName;
  });
}

function assertVisitorApplicationAuthority_(session, rows) {
  if (session.role === 'admin' || VISITOR_APPROVAL_POLICY === 'all_registrars') {
    return true;
  }
  if (!rows.length || rows[0].hostName !== session.actorName) {
    throw new Error('본인이 방문 대상인 신청만 처리할 수 있습니다.');
  }
  return true;
}

function getVisitorEntryEligibility(request) {
  try {
    const source = request || {};
    const spreadsheet = getAccessSpreadsheetForRead_();
    const eligible = findEligibleVisitorByNamePhone_(
      spreadsheet,
      cleanText_(source.name, 80),
      normalizeVisitorPhone_(source.phone)
    );

    return {
      ok: true,
      visitor: eligible.publicRecord,
    };
  } catch (error) {
    throw new Error(safeErrorMessage_(error));
  }
}

function findEligibleVisitorByNamePhone_(spreadsheet, name, phone) {
  if (!name) {
    throw new Error('성명을 입력하세요.');
  }
  const sheet = ensureVisitorApplicationSheet_(spreadsheet);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('성명 또는 본인 연락처와 일치하는 승인 내역이 없습니다.');
  }
  const matches = sheet.getRange(
    2, 1, lastRow - 1, ACCESS.visitorApplicationColumnCount
  ).getValues().map(function (row, index) {
    return visitorApplicationRowToRecord_(row, index + 2);
  }).filter(function (record) {
    return record.name === name && record.phone === phone;
  }).sort(function (left, right) {
    return new Date(right.appliedAt).getTime() -
      new Date(left.appliedAt).getTime();
  });
  if (!matches.length) {
    throw new Error('성명 또는 본인 연락처와 일치하는 승인 내역이 없습니다.');
  }
  let lastError = null;
  for (let index = 0; index < matches.length; index += 1) {
    try {
      return findEligibleVisitorForEntry_(
        spreadsheet,
        matches[index].applicationNumber,
        phone
      );
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('현장 등록이 가능한 승인 내역이 없습니다.');
}

function registerApprovedVisitorEntry(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let ledgerRange = null;
  let applicationRange = null;
  let originalApplicationValues = null;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    if (source.securityConsent !== true) {
      throw new Error('방문객 보안수칙에 동의해야 입장할 수 있습니다.');
    }

    const system = getAccessSystemForUse_();
    const eligible = findEligibleVisitorForEntry_(
      system.spreadsheet,
      cleanVisitorApplicationNumber_(source.applicationNumber),
      normalizeVisitorPhone_(source.phone)
    );
    const application = eligible.application;
    const entryAt = new Date();
    const payload = normalizeAccessPayload_({
      accessType: 'visitor',
      processedBy: application.name + ' (방문객 직접입력)',
      name: application.name,
      organization: application.organization,
      phone: application.phone,
      visitPurpose: application.visitPurpose,
      hostName: application.hostName,
      vehicleNumber: application.vehicleNumber,
      carryItems: application.carryItems,
      applicationNumber: application.applicationNumber,
      visitorId: application.visitorId,
      remarks: '보안수칙 동의 ' + ACCESS.visitorSecurityVersion,
    });
    const ledger = getAccessSheet_(system.spreadsheet, 'visitor');
    const recordId = makeAccessRecordId_('visitor', entryAt);
    const ledgerRow = Math.max(ledger.getLastRow() + 1, 2);
    const values = makeAccessRowValues_(payload, recordId, entryAt);

    ledgerRange = ledger.getRange(
      ledgerRow,
      1,
      1,
      ACCESS.visitorColumnCount
    );
    ledger.getRange(ledgerRow, 8).setNumberFormat('@');
    ledgerRange.setValues([values]);
    formatAccessDataRow_(
      ledger,
      ledgerRow,
      ACCESS.visitorColumnCount
    );

    const applicationSheet = ensureVisitorApplicationSheet_(
      system.spreadsheet
    );
    applicationRange = applicationSheet.getRange(
      eligible.row,
      20,
      1,
      2
    );
    originalApplicationValues = applicationRange.getValues();
    const firstEntry = originalApplicationValues[0][0] || entryAt;
    applicationRange.setValues([[firstEntry, entryAt]]);
    applicationRange.setNumberFormat('yyyy-mm-dd hh:mm:ss');
    SpreadsheetApp.flush();

    appendAccessAuditLog_(system.log, {
      eventType: '승인방문객입장',
      author: payload.processedBy,
      accessType: 'visitor',
      recordId: recordId,
      name: payload.name,
      details: {
        applicationNumber: payload.applicationNumber,
        visitorId: payload.visitorId,
        enteredAt: formatAccessDateTime_(entryAt),
        securityConsentVersion: ACCESS.visitorSecurityVersion,
      },
    });

    return {
      ok: true,
      recordId: recordId,
      name: payload.name,
      enteredAt: formatAccessDateTime_(entryAt),
    };
  } catch (error) {
    if (ledgerRange) {
      try {
        ledgerRange.clearContent();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    if (applicationRange && originalApplicationValues) {
      try {
        applicationRange.setValues(originalApplicationValues);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    SpreadsheetApp.flush();
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function processVisitorApplicationDecision(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    const session = requireSessionInfo_(
      request && request.adminToken,
      'visitorManage'
    );
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const action = cleanText_(source.action, 40);
    const applicationNumber = cleanVisitorApplicationNumber_(
      source.applicationNumber
    );
    const visitorId = cleanText_(source.visitorId, 80);
    const processedBy = session.actorName;

    const system = getAccessSystemForUse_();
    validateAssetAuthor_(processedBy);
    const sheet = ensureVisitorApplicationSheet_(system.spreadsheet);
    const rows = getVisitorApplicationRows_(sheet, applicationNumber);
    assertVisitorApplicationAuthority_(session, rows);
    const overallStatus = getVisitorApplicationOverallStatus_(rows);

    if (action === 'cancelApproval') {
      if (!rows.some(function (row) { return row.status === '승인'; })) {
        throw new Error('승인된 방문객이 있을 때만 승인 취소가 가능합니다.');
      }
      if (hasVisitorApplicationEntry_(system.spreadsheet, applicationNumber)) {
        throw new Error('한 명이라도 입장한 신청은 승인 취소할 수 없습니다.');
      }
    } else {
      if (action !== 'approve' && action !== 'reject') {
        throw new Error('승인 또는 반려를 선택하세요.');
      }
      if (!visitorId) {
        throw new Error('처리할 방문객을 선택하세요.');
      }
      const targetVisitor = rows.filter(function (row) {
        return row.visitorId === visitorId;
      })[0];
      if (!targetVisitor) {
        throw new Error('처리할 방문객을 찾을 수 없습니다.');
      }
      if (targetVisitor.status !== '승인 대기') {
        throw new Error('이미 처리된 방문객입니다.');
      }
    }

    const processedAt = new Date();
    const reason = action === 'approve'
      ? ''
      : normalizeVisitorDecisionReason_(
          source.reasonCode,
          source.reasonDetail
        );

    const startRow = rows[0].row;
    targetRange = sheet.getRange(
      startRow,
      1,
      rows.length,
      ACCESS.visitorApplicationColumnCount
    );
    originalValues = targetRange.getValues();
    const nextValues = originalValues.map(function (values) {
      const next = values.slice();
      const currentVisitorId = String(next[8] || '');
      const shouldChange = action === 'cancelApproval'
        ? String(next[2] || '') === '승인'
        : currentVisitorId === visitorId;
      if (!shouldChange) {
        return next;
      }
      if (action === 'approve') {
        next[2] = '승인';
        next[16] = '';
      } else if (action === 'reject') {
        next[2] = '반려';
        next[16] = reason;
      } else {
        next[2] = '승인 취소';
        next[16] = reason;
      }

      next[17] = processedBy;
      next[18] = processedAt;
      return next;
    });
    targetRange.setValues(nextValues);
    formatVisitorApplicationRows_(sheet, startRow, rows.length);
    SpreadsheetApp.flush();

    const eventType = action === 'approve'
      ? '방문객승인'
      : action === 'reject'
        ? '방문객반려'
        : '방문승인취소';
    appendAccessAuditLog_(system.log, {
      eventType: eventType,
      author: processedBy,
      accessType: 'visitor',
      recordId: applicationNumber,
      name: rows.filter(function (row) {
        return row.isRepresentative;
      })[0].name,
      details: {
        previousStatus: overallStatus,
        nextStatus: getVisitorApplicationOverallStatus_(
          getVisitorApplicationRows_(sheet, applicationNumber)
        ),
        reason: reason,
        visitorId: visitorId,
        visitorName: rows.filter(function (row) {
          return row.visitorId === visitorId;
        }).map(function (row) { return row.name; })[0] || '',
        processedAt: formatAccessDateTime_(processedAt),
      },
    });

    return {
      ok: true,
      applicationNumber: applicationNumber,
      status: getVisitorApplicationOverallStatus_(
        getVisitorApplicationRows_(sheet, applicationNumber)
      ),
      applications: listVisitorApplications_(system.spreadsheet),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function processEmployeeAttendance(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    const session = requireSessionInfo_(
      request && request.adminToken,
      'employeeEntry'
    );
    const userRole = session.role;
    lock.waitLock(30000);
    hasLock = true;

    const requestedName = cleanText_(
      request && request.name,
      80
    );

    if (!requestedName) {
      throw new Error('이름을 입력하세요.');
    }

    const system = getAccessSystemForUse_();
    const rosterSheet = ensureEmployeeRosterSheet_(
      system.spreadsheet
    );
    const employee = findEmployeeFromRoster_(
      rosterSheet,
      requestedName
    );
    const sheet = getAccessSheet_(
      system.spreadsheet,
      'employee'
    );
    const openRecord = findOpenEmployeeRecord_(
      sheet,
      employee.employeeNumber
    );
    const processedAt = new Date();

    if (openRecord) {
      if (!(ROLE_CAPABILITIES[userRole] || {}).employeeExit) {
        throw new Error('사원 퇴장 처리는 관리자만 할 수 있습니다.');
      }
      targetRange = sheet.getRange(openRecord.row, 4, 1, 2);
      originalValues = targetRange.getValues();
      targetRange.setValues([[processedAt, '퇴장완료']]);
      sheet.getRange(openRecord.row, 4).setNumberFormat(
        'yyyy-mm-dd hh:mm:ss'
      );
      SpreadsheetApp.flush();

      appendAccessAuditLog_(system.log, {
        eventType: '사원퇴장처리',
        author: session.actorName,
        accessType: 'employee',
        recordId: String(openRecord.values[0] || ''),
        name: employee.name,
        details: {
          employeeNumber: employee.employeeNumber,
          department: employee.department,
          exitedAt: formatAccessDateTime_(processedAt),
        },
      });

      return {
        ok: true,
        action: 'exit',
        name: employee.name,
        processedAt: formatAccessDateTime_(processedAt),
        openRecords: listOpenAccessRecords_(sheet, 'employee'),
      };
    }

    const payload = {
      accessType: 'employee',
      processedBy: employee.name,
      name: employee.name,
      employeeNumber: employee.employeeNumber,
      department: employee.department,
      accessPurpose: '사원 출입',
      remarks: '',
    };
    const recordId = makeAccessRecordId_(
      'employee',
      processedAt
    );
    const row = Math.max(sheet.getLastRow() + 1, 2);
    const values = makeAccessRowValues_(
      payload,
      recordId,
      processedAt
    );

    targetRange = sheet.getRange(
      row,
      1,
      1,
      values.length
    );
    targetRange.setValues([values]);
    formatAccessDataRow_(sheet, row, values.length);
    SpreadsheetApp.flush();

    appendAccessAuditLog_(system.log, {
      eventType: '사원입장등록',
      author: session.actorName,
      accessType: 'employee',
      recordId: recordId,
      name: employee.name,
      details: {
        employeeNumber: employee.employeeNumber,
        department: employee.department,
        enteredAt: formatAccessDateTime_(processedAt),
      },
    });

    return {
      ok: true,
      action: 'enter',
      name: employee.name,
      processedAt: formatAccessDateTime_(processedAt),
      openRecords: listOpenAccessRecords_(sheet, 'employee'),
    };
  } catch (error) {
    if (targetRange) {
      try {
        if (originalValues) {
          targetRange.setValues(originalValues);
        } else {
          targetRange.clearContent();
        }
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function completeAccessExit(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    const session = requireSessionInfo_(
      request && request.adminToken,
      'employeeExit'
    );
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const accessType = normalizeAccessType_(
      source.accessType
    );
    const recordId = cleanText_(source.recordId, 80);
    const processedBy = session.actorName;

    if (!recordId) {
      throw new Error('퇴장 처리할 기록을 선택하세요.');
    }


    const system = getAccessSystemForUse_();
    const sheet = getAccessSheet_(
      system.spreadsheet,
      accessType
    );
    const row = findOpenAccessRecordRow_(
      sheet,
      recordId
    );
    const columnCount = getAccessColumnCount_(accessType);
    const values = sheet
      .getRange(row, 1, 1, columnCount)
      .getValues()[0];
    const exitAt = new Date();

    targetRange = sheet.getRange(row, 4, 1, 2);
    originalValues = targetRange.getValues();
    targetRange.setValues([[exitAt, '퇴장완료']]);
    sheet.getRange(row, 4).setNumberFormat(
      'yyyy-mm-dd hh:mm:ss'
    );
    SpreadsheetApp.flush();

    appendAccessAuditLog_(system.log, {
      eventType: '퇴장처리',
      author: processedBy,
      accessType: accessType,
      recordId: recordId,
      name: getAccessNameFromRow_(values, accessType),
      details: {
        exitedAt: formatAccessDateTime_(exitAt),
      },
    });

    return {
      ok: true,
      accessType: accessType,
      recordId: recordId,
      name: getAccessNameFromRow_(values, accessType),
      exitedAt: formatAccessDateTime_(exitAt),
      openRecords: listOpenAccessRecords_(
        sheet,
        accessType
      ),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getManagementRequestConfig(adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'requestCreate');
    const system = getAccessSystemForUse_();
    const sheet = ensureManagementRequestSheet_(system.spreadsheet);
    const assetContext = getContextWithAutoDiscovery_(false);
    return {
      ok: true,
      userRole: session.role,
      actorName: session.actorName,
      assetSheets: getSelectableSheetNames_(assetContext.spreadsheet),
      defaultAssetSheet: assetContext.sheet.getName(),
      requestTypes: [
        '실물자산 삭제',
        '정보자산 삭제',
        '반출입기록 정정',
        '기타 정정',
      ],
      requests: listManagementRequests_(
        sheet,
        session.role === 'admin' ? '' : session.actorName
      ),
    };
  } catch (error) {
    return { ok: false, message: safeErrorMessage_(error) };
  }
}

function registerManagementRequest(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'requestCreate'
    );
    const requestType = cleanText_(source.requestType, 80);
    let targetId = cleanText_(source.targetId, 100);
    let targetName = cleanText_(source.targetName, 150);
    const targetSheetName = cleanText_(source.targetSheetName, 100);
    const reason = cleanText_(source.reason, 500);
    if (!requestType || !targetId || !reason) {
      throw new Error('요청 구분, 대상 자산, 요청 사유를 입력하세요.');
    }
    if (requestType.indexOf('실물자산') === 0) {
      const assetContext = getContextWithAutoDiscovery_(
        false,
        targetSheetName
      );
      const managementNumber = normalizeManagementNumber_(targetId);
      const assetRow = findAssetRow_(assetContext.sheet, managementNumber);
      const asset = readAssetRecord_(assetContext.sheet, assetRow);
      targetId = String(managementNumber);
      targetName = '[' + assetContext.sheet.getName() + '] ' + asset.itemName;
    } else if (requestType.indexOf('정보자산') === 0) {
      const infoSystem = ensureInfoAssetSystem_();
      const infoRow = findInfoAssetRow_(
        infoSystem.ledger,
        String(targetId || '').toUpperCase()
      );
      const infoRecord = listInfoAssets_(infoSystem.ledger).filter(function (item) {
        return item.assetId === String(targetId || '').toUpperCase();
      })[0];
      if (!infoRecord || !infoRow) {
        throw new Error('정보자산을 찾을 수 없습니다.');
      }
      targetId = infoRecord.assetId;
      targetName = infoRecord.assetName;
    }
    lock.waitLock(30000);
    hasLock = true;
    const system = getAccessSystemForUse_();
    const sheet = ensureManagementRequestSheet_(system.spreadsheet);
    const now = new Date();
    const requestId = 'REQ-' + Utilities.formatDate(
      now,
      APP.timeZone,
      'yyyyMMdd'
    ) + '-' + Utilities.getUuid().replace(/-/g, '')
      .slice(0, 8).toUpperCase();
    const row = sheet.getLastRow() + 1;
    targetRange = sheet.getRange(
      row,
      1,
      1,
      ACCESS.managementRequestColumnCount
    );
    targetRange.setValues([[
      requestId,
      now,
      session.actorName,
      session.role === 'admin' ? '관리자' : '등록자',
      requestType,
      targetId,
      targetName,
      reason,
      '처리 대기',
      '',
      '',
      '',
    ]]);
    targetRange.setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
    sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    SpreadsheetApp.flush();
    appendAccessAuditLog_(system.log, {
      author: session.actorName,
      eventType: '관리요청접수',
      accessType: 'management',
      recordId: requestId,
      name: targetId,
      details: {
        requestType: requestType,
        targetName: targetName,
        reason: reason,
        sessionFingerprint: getSessionFingerprint_(source.adminToken),
      },
    });
    return {
      ok: true,
      requestId: requestId,
      requests: listManagementRequests_(
        sheet,
        session.role === 'admin' ? '' : session.actorName
      ),
    };
  } catch (error) {
    if (targetRange) {
      try {
        targetRange.clearContent();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function searchInfoAssetsForRequest(query, adminToken) {
  requireSessionInfo_(adminToken, 'requestCreate');
  const keyword = cleanText_(query, 100).toLowerCase();
  if (!keyword) return { ok: true, results: [] };
  const system = ensureInfoAssetSystem_();
  return {
    ok: true,
    results: listInfoAssets_(system.ledger).filter(function (item) {
      return [item.assetId, item.assetName, item.category, item.identifier]
        .join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 30).map(function (item) {
      return {
        assetId: item.assetId,
        itemName: item.assetName,
        modelMaker: item.category,
      };
    }),
  };
}

function executeManagementDeletion(request) {
  const source = request || {};
  const session = requireSessionInfo_(source.adminToken, 'requestManage');
  const requestId = cleanText_(source.requestId, 80);
  const confirmation = cleanText_(source.confirmation, 40);
  if (confirmation !== 'DELETE_CONFIRMED') {
    throw new Error('삭제 확인 절차가 완료되지 않았습니다.');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const accessSystem = getAccessSystemForUse_();
    const requestSheet = ensureManagementRequestSheet_(accessSystem.spreadsheet);
    const requestRow = findManagementRequestRow_(requestSheet, requestId);
    const requestValues = requestSheet.getRange(
      requestRow, 1, 1, ACCESS.managementRequestColumnCount
    ).getValues()[0];
    const requestType = String(requestValues[4] || '');
    const targetId = String(requestValues[5] || '');
    const targetName = String(requestValues[6] || '');
    if (String(requestValues[8] || '') !== '처리 대기') {
      throw new Error('이미 처리된 관리 요청입니다.');
    }
    if (['실물자산 삭제', '정보자산 삭제'].indexOf(requestType) === -1) {
      throw new Error('이 요청은 자동 삭제 대상이 아닙니다.');
    }
    let backupFile;
    if (requestType === '실물자산 삭제') {
      const sheetMatch = targetName.match(/^\[([^\]]+)\]/);
      if (!sheetMatch) throw new Error('대상 시트 정보가 없습니다.');
      const context = getContextWithAutoDiscovery_(true, sheetMatch[1]);
      const managementNumber = normalizeManagementNumber_(targetId);
      const row = findAssetRow_(context.sheet, managementNumber);
      const sourceFile = DriveApp.getFileById(context.spreadsheet.getId());
      const root = getRootFolderFromPhoto_(context.photoRoot);
      backupFile = sourceFile.makeCopy(
        sourceFile.getName() + '_삭제전백업_' +
          Utilities.formatDate(new Date(), APP.timeZone, 'yyyyMMdd_HHmmss'),
        root
      );
      context.sheet.getRange(
        row, APP.firstDataColumn, 1, APP.dataColumnCount
      ).clearContent();
      const assetFolder = findAssetFolder_(context.photoRoot, managementNumber);
      if (assetFolder) assetFolder.setTrashed(true);
      appendAuditLog_(context.audit, {
        eventType: '관리요청자산삭제',
        author: session.actorName,
        managementNumber: managementNumber,
        itemName: targetName,
        status: '삭제',
        remarks: requestId + ' · 백업 ' + backupFile.getUrl(),
      });
    } else {
      const infoSystem = ensureInfoAssetSystem_();
      const row = findInfoAssetRow_(infoSystem.ledger, targetId);
      const sourceFile = DriveApp.getFileById(infoSystem.spreadsheet.getId());
      const parents = sourceFile.getParents();
      backupFile = parents.hasNext()
        ? sourceFile.makeCopy(
          sourceFile.getName() + '_삭제전백업_' +
            Utilities.formatDate(new Date(), APP.timeZone, 'yyyyMMdd_HHmmss'),
          parents.next()
        )
        : sourceFile.makeCopy(sourceFile.getName() + '_삭제전백업');
      infoSystem.ledger.deleteRow(row);
      appendManagedLog_(infoSystem.log, {
        actor: session.actorName,
        eventType: '관리요청정보자산삭제',
        recordId: targetId,
        target: targetName,
        details: { requestId: requestId, backupUrl: backupFile.getUrl() },
      });
    }
    const now = new Date();
    requestSheet.getRange(requestRow, 9, 1, 4).setValues([[
      '처리 완료', session.actorName, now,
      '삭제 실행 완료 · 백업 ' + backupFile.getUrl(),
    ]]);
    requestSheet.getRange(requestRow, 11).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    appendAccessAuditLog_(accessSystem.log, {
      author: session.actorName,
      eventType: '관리요청삭제실행',
      accessType: 'management',
      recordId: requestId,
      name: targetId,
      details: { requestType: requestType, backupUrl: backupFile.getUrl() },
    });
    return {
      ok: true,
      requestId: requestId,
      status: '처리 완료',
      backupUrl: backupFile.getUrl(),
      requests: listManagementRequests_(requestSheet, ''),
    };
  } finally {
    lock.releaseLock();
  }
}

function processManagementRequest(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;
  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'requestManage'
    );
    const requestId = cleanText_(source.requestId, 80);
    const action = cleanText_(source.action, 20);
    const note = cleanText_(source.note, 500);
    if (action !== 'approve' && action !== 'reject') {
      throw new Error('승인 또는 반려를 선택하세요.');
    }
    if (!note) {
      throw new Error('처리 메모를 입력하세요.');
    }
    lock.waitLock(30000);
    hasLock = true;
    const system = getAccessSystemForUse_();
    const sheet = ensureManagementRequestSheet_(system.spreadsheet);
    const row = findManagementRequestRow_(sheet, requestId);
    targetRange = sheet.getRange(row, 9, 1, 4);
    originalValues = targetRange.getValues();
    if (String(originalValues[0][0] || '') !== '처리 대기') {
      throw new Error('이미 처리된 관리 요청입니다.');
    }
    const status = action === 'approve' ? '처리 완료' : '반려';
    const processedAt = new Date();
    targetRange.setValues([[
      status,
      session.actorName,
      processedAt,
      note,
    ]]);
    sheet.getRange(row, 11).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    SpreadsheetApp.flush();
    appendAccessAuditLog_(system.log, {
      author: session.actorName,
      eventType: '관리요청' + status,
      accessType: 'management',
      recordId: requestId,
      name: String(sheet.getRange(row, 6).getDisplayValue() || ''),
      details: {
        note: note,
        sessionFingerprint: getSessionFingerprint_(source.adminToken),
      },
    });
    return {
      ok: true,
      requestId: requestId,
      status: status,
      requests: listManagementRequests_(sheet, ''),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function ensureManagementRequestSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(
    ACCESS.managementRequestSheetName
  );
  if (!sheet) {
    sheet = spreadsheet.insertSheet(ACCESS.managementRequestSheetName);
  }
  if (sheet.getLastRow() === 0) {
    sheet.getRange(
      1,
      1,
      1,
      ACCESS.managementRequestColumnCount
    ).setValues([[
      '요청번호', '요청일시', '요청자', '요청자권한',
      '요청구분', '대상번호', '대상명', '요청사유',
      '상태', '처리자', '처리일시', '처리메모',
    ]]);
    styleManagedHeader_(
      sheet,
      ACCESS.managementRequestColumnCount,
      '#FDE7D3'
    );
    protectSheetForHumans_(sheet, '프로그램 전용 관리 요청 기록');
  }
  return sheet;
}

function findManagementRequestRow_(sheet, requestId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2 || !requestId) {
    throw new Error('관리 요청을 찾을 수 없습니다.');
  }
  const values = sheet.getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues();
  const matches = [];
  values.forEach(function (row, index) {
    if (String(row[0] || '') === requestId) {
      matches.push(index + 2);
    }
  });
  if (matches.length !== 1) {
    throw new Error(
      matches.length ? '같은 요청번호가 여러 개입니다.' :
        '관리 요청을 찾을 수 없습니다.'
    );
  }
  return matches[0];
}

function listManagementRequests_(sheet, requesterName) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  return sheet.getRange(
    2,
    1,
    lastRow - 1,
    ACCESS.managementRequestColumnCount
  ).getValues()
    .filter(function (row) {
      return String(row[0] || '') &&
        (!requesterName || String(row[2] || '') === requesterName);
    })
    .slice(-200)
    .reverse()
    .map(function (row) {
      return {
        requestId: String(row[0] || ''),
        requestedAt: formatAccessDateTime_(row[1]),
        requester: String(row[2] || ''),
        requesterRole: String(row[3] || ''),
        requestType: String(row[4] || ''),
        targetId: String(row[5] || ''),
        targetName: String(row[6] || ''),
        reason: String(row[7] || ''),
        status: String(row[8] || ''),
        processedBy: String(row[9] || ''),
        processedAt: formatAccessDateTime_(row[10]),
        note: String(row[11] || ''),
      };
    });
}

function getAuditLogConfig(adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'auditRead');
    const assetContext = getContextWithAutoDiscovery_(true, APP.sheetName);
    const accessSystem = getAccessSystemForUse_();
    const movementSystem = ensureMovementSystem_();
    const infoSystem = ensureInfoAssetSystem_();
    return {
      ok: true,
      actorName: session.actorName,
      userRole: session.role,
      logs: [
        readAuditSheet_('실물자산 로그', assetContext.audit.sheet),
        readAuditSheet_('출입·관리요청 로그', accessSystem.log.sheet),
        readAuditSheet_('물품 반출입 로그', movementSystem.log),
        readAuditSheet_('정보자산 로그', infoSystem.log),
      ],
    };
  } catch (error) {
    return { ok: false, message: safeErrorMessage_(error) };
  }
}

function readAuditSheet_(name, sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 1 || lastColumn < 1) {
    return { name: name, headers: [], rows: [] };
  }
  const headers = sheet.getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map(function (value) {
      return String(value || '');
    });
  const count = Math.min(Math.max(lastRow - 1, 0), 100);
  const rows = count
    ? sheet.getRange(lastRow - count + 1, 1, count, lastColumn)
      .getDisplayValues()
      .reverse()
      .map(function (row) {
        return row.map(function (value) {
          const text = String(value == null ? '' : value);
          return text.length > 500 ? text.slice(0, 500) + '…' : text;
        });
      })
    : [];
  return { name: name, headers: headers, rows: rows };
}

function normalizeVisitorApplicationRequest_(request) {
  const source = request || {};
  const organization = cleanText_(source.organization, 100);
  const visitPurpose = cleanText_(source.visitPurpose, 200);
  const hostName = cleanText_(source.hostName, 80);
  const visitStartDate = parseVisitorDate_(
    source.visitStartDate,
    '방문 시작일'
  );
  const visitEndDate = parseVisitorDate_(
    source.visitEndDate,
    '방문 종료일'
  );
  const rawVisitors = Array.isArray(source.visitors)
    ? source.visitors
    : [];

  if (!organization) {
    throw new Error('소속회사를 입력하세요.');
  }
  if (!visitPurpose) {
    throw new Error('방문 목적을 입력하세요.');
  }
  if (!hostName) {
    throw new Error('방문 대상 직원 이름을 입력하세요.');
  }
  if (visitEndDate.getTime() < visitStartDate.getTime()) {
    throw new Error('방문 종료일은 시작일보다 빠를 수 없습니다.');
  }

  const todayText = Utilities.formatDate(
    new Date(),
    APP.timeZone,
    'yyyy-MM-dd'
  );
  if (formatDateOnly_(visitStartDate) < todayText) {
    throw new Error('오늘 이전 날짜로는 방문 신청할 수 없습니다.');
  }
  if (rawVisitors.length < 1) {
    throw new Error('방문객을 한 명 이상 입력하세요.');
  }
  if (rawVisitors.length > ACCESS.maxVisitorsPerApplication) {
    throw new Error(
      '방문객은 한 번에 최대 ' +
      ACCESS.maxVisitorsPerApplication +
      '명까지 신청할 수 있습니다.'
    );
  }
  if (source.privacyConsent !== true) {
    throw new Error('개인정보 수집·이용에 동의해야 합니다.');
  }
  if (rawVisitors.length > 1 && source.companionConsent !== true) {
    throw new Error('동행인의 개인정보 제공 동의를 확인하세요.');
  }

  const usedPhones = {};
  let representativeCount = 0;
  const visitors = rawVisitors.map(function (raw, index) {
    const visitor = raw || {};
    const name = cleanText_(visitor.name, 80);
    const phone = normalizeVisitorPhone_(visitor.phone);
    const isRepresentative = visitor.isRepresentative === true ||
      (index === 0 && !rawVisitors.some(function (item) {
        return item && item.isRepresentative === true;
      }));

    if (!name) {
      throw new Error((index + 1) + '번째 방문객 성명을 입력하세요.');
    }
    if (usedPhones[phone]) {
      throw new Error('방문객별로 서로 다른 본인 연락처를 입력하세요.');
    }
    usedPhones[phone] = true;
    if (isRepresentative) {
      representativeCount += 1;
    }

    return {
      visitorId: Utilities.getUuid(),
      isRepresentative: isRepresentative,
      name: name,
      phone: phone,
      vehicleNumber: cleanText_(visitor.vehicleNumber, 40),
      carryItems: cleanText_(visitor.carryItems, 300),
    };
  });

  if (representativeCount !== 1) {
    throw new Error('대표 방문객을 한 명만 선택하세요.');
  }

  return {
    organization: organization,
    visitStartDate: visitStartDate,
    visitEndDate: visitEndDate,
    visitPurpose: visitPurpose,
    hostName: hostName,
    visitors: visitors,
    remarks: cleanText_(source.remarks, 300),
  };
}

function parseVisitorDate_(value, label) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    throw new Error(label + '을 올바르게 입력하세요.');
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0,
    0
  );

  if (formatDateOnly_(date) !== text) {
    throw new Error(label + '을 올바르게 입력하세요.');
  }
  return date;
}

function normalizeVisitorPhone_(value) {
  const phone = String(value || '').replace(/\D/g, '');

  if (!/^0\d{9,10}$/.test(phone)) {
    throw new Error('연락처를 휴대전화 번호로 정확히 입력하세요.');
  }
  return phone;
}

function normalizeStoredVisitorPhone_(value) {
  const digits = String(value == null ? '' : value)
    .replace(/\D/g, '');

  if (/^0\d{9,10}$/.test(digits)) {
    return digits;
  }
  if (/^[1-9]\d{8,9}$/.test(digits)) {
    return '0' + digits;
  }
  return digits;
}

function cleanVisitorApplicationNumber_(value) {
  const applicationNumber = String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s/g, '');

  if (!/^VA-\d{8}-[A-F0-9]{8}$/.test(applicationNumber)) {
    throw new Error('방문신청번호를 정확히 입력하세요.');
  }
  return applicationNumber;
}

function makeVisitorApplicationNumber_(date) {
  const day = Utilities.formatDate(date, APP.timeZone, 'yyyyMMdd');
  const unique = Utilities.getUuid()
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase();
  return 'VA-' + day + '-' + unique;
}

function assertVisitorHostExists_(spreadsheet, hostName) {
  const exists = getEmployeeRosterNameMapCached_(
    spreadsheet
  )[hostName] === true;

  if (!exists) {
    throw new Error('사원 명부에서 해당 이름을 찾을 수 없습니다.');
  }
}

function getEmployeeRosterNameMapCached_(spreadsheet) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'employee-roster-name-map-v1';
  const cached = cache.get(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (error) {
      console.warn(error);
    }
  }

  const roster = ensureEmployeeRosterSheet_(spreadsheet);
  const nameMap = {};
  listEmployeeRoster_(roster).forEach(function (employee) {
    nameMap[employee.name] = true;
  });
  cache.put(cacheKey, JSON.stringify(nameMap), 21600);
  return nameMap;
}

function formatVisitorApplicationRows_(sheet, startRow, rowCount) {
  sheet.getRange(
    startRow,
    1,
    rowCount,
    ACCESS.visitorApplicationColumnCount
  )
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.getRange(startRow, 2, rowCount, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(startRow, 5, rowCount, 2)
    .setNumberFormat('yyyy-mm-dd');
  sheet.getRange(startRow, 15, rowCount, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(startRow, 19, rowCount, 3)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(startRow, 22, rowCount, 1)
    .setNumberFormat('yyyy-mm-dd');
  sheet.getRange(startRow, 23, rowCount, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sheet.getRange(startRow, 1, rowCount, 1)
    .setNumberFormat('@');
  sheet.getRange(startRow, 9, rowCount, 1)
    .setNumberFormat('@');
  sheet.getRange(startRow, 12, rowCount, 1)
    .setNumberFormat('@');
  sheet.getRange(startRow, 1, rowCount, 3)
    .setHorizontalAlignment('center');
}

function getVisitorApplicationRows_(sheet, applicationNumber) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error('방문 신청 내역을 찾을 수 없습니다.');
  }

  const matches = sheet.getRange(2, 1, lastRow - 1, 1)
    .createTextFinder(applicationNumber)
    .matchEntireCell(true)
    .findAll()
    .map(function (range) {
      return range.getRow();
    })
    .sort(function (left, right) {
      return left - right;
    });

  if (!matches.length) {
    throw new Error('방문 신청 내역을 찾을 수 없습니다.');
  }
  matches.forEach(function (rowNumber, index) {
    if (rowNumber !== matches[0] + index) {
      throw new Error('방문 신청 행이 분리되어 있어 관리자 확인이 필요합니다.');
    }
  });
  return sheet.getRange(
    matches[0],
    1,
    matches.length,
    ACCESS.visitorApplicationColumnCount
  ).getValues().map(function (row, index) {
    return visitorApplicationRowToRecord_(
      row,
      matches[0] + index
    );
  });
}

function visitorApplicationRowToRecord_(values, rowNumber) {
  return {
    row: rowNumber,
    applicationNumber: String(values[0] || ''),
    appliedAt: values[1],
    status: String(values[2] || ''),
    organization: String(values[3] || ''),
    visitStartDate: values[4],
    visitEndDate: values[5],
    visitPurpose: String(values[6] || ''),
    hostName: String(values[7] || ''),
    visitorId: String(values[8] || ''),
    isRepresentative: String(values[9] || '') === '대표',
    name: String(values[10] || ''),
    phone: normalizeStoredVisitorPhone_(values[11]),
    vehicleNumber: String(values[12] || ''),
    carryItems: String(values[13] || ''),
    reason: String(values[16] || ''),
    processedBy: String(values[17] || ''),
    processedAt: values[18],
    firstEntryAt: values[19],
    latestEntryAt: values[20],
    retentionDate: values[21],
    cancelledAt: values[22],
    remarks: String(values[23] || ''),
  };
}

function assertRepresentativePhone_(rows, phone) {
  const representative = rows.filter(function (row) {
    return row.isRepresentative;
  })[0];

  if (!representative || representative.phone !== phone) {
    throw new Error('방문신청번호 또는 대표 연락처가 일치하지 않습니다.');
  }
  return representative;
}

function getVisitorApplicationOverallStatus_(rows) {
  const statuses = {};
  rows.forEach(function (row) {
    statuses[row.status] = true;
  });
  const keys = Object.keys(statuses);

  if (keys.length === 1) {
    return keys[0];
  }
  if (statuses['승인 대기']) {
    return '처리 중';
  }
  if (
    statuses['승인'] &&
    (statuses['반려'] || statuses['제외'])
  ) {
    return '일부 승인·일부 반려';
  }
  return keys.join(' / ');
}

function getVisitorAccessStateMap_(spreadsheet, applicationNumber) {
  const sheet = getAccessSheet_(spreadsheet, 'visitor');
  const lastRow = sheet.getLastRow();
  const states = {};

  if (lastRow < 2) {
    return states;
  }

  const values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    ACCESS.visitorColumnCount
  ).getValues();
  values.forEach(function (row) {
    if (String(row[13] || '') !== applicationNumber) {
      return;
    }
    const visitorId = String(row[14] || '');
    const current = states[visitorId];
    const entryTime = row[2] instanceof Date
      ? row[2].getTime()
      : 0;
    if (!current || entryTime >= current.entryTime) {
      states[visitorId] = {
        entryTime: entryTime,
        status: String(row[4] || '') === '입장중'
          ? '입장'
          : '퇴장',
      };
    }
  });
  return states;
}

function hasVisitorApplicationEntry_(spreadsheet, applicationNumber) {
  return Object.keys(
    getVisitorAccessStateMap_(spreadsheet, applicationNumber)
  ).length > 0;
}

function summarizeVisitorApplication_(spreadsheet, rows, fullPhone) {
  const first = rows[0];
  const accessStates = getVisitorAccessStateMap_(
    spreadsheet,
    first.applicationNumber
  );
  const overallStatus = getVisitorApplicationOverallStatus_(rows);
  const hasEntry = Object.keys(accessStates).length > 0;

  return {
    applicationNumber: first.applicationNumber,
    appliedAt: formatAccessDateTime_(first.appliedAt),
    status: overallStatus,
    organization: first.organization,
    visitStartDate: formatDateOnly_(first.visitStartDate),
    visitEndDate: formatDateOnly_(first.visitEndDate),
    visitPurpose: first.visitPurpose,
    hostName: first.hostName,
    representativeName: rows.filter(function (row) {
      return row.isRepresentative;
    })[0].name,
    processedBy: first.processedBy,
    processedAt: formatAccessDateTime_(first.processedAt),
    canCancel: !hasEntry && rows.some(function (row) {
      return row.status === '승인 대기' || row.status === '승인';
    }),
    canCancelApproval: !hasEntry && rows.some(function (row) {
      return row.status === '승인';
    }),
    visitors: rows.map(function (row) {
      const accessState = accessStates[row.visitorId];
      let visitStatus = row.status;
      if (accessState) {
        visitStatus = accessState.status;
      } else if (row.status === '승인') {
        visitStatus = '미방문';
      }
      return {
        visitorId: row.visitorId,
        isRepresentative: row.isRepresentative,
        name: row.name,
        phone: fullPhone ? row.phone : maskVisitorPhone_(row.phone),
        vehicleNumber: row.vehicleNumber,
        carryItems: row.carryItems,
        approvalStatus: row.status,
        visitStatus: visitStatus,
        reason: row.reason,
      };
    }),
  };
}

function listVisitorApplications_(spreadsheet) {
  const sheet = ensureVisitorApplicationSheet_(spreadsheet);
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    ACCESS.visitorApplicationColumnCount
  ).getValues();
  const grouped = {};
  values.forEach(function (values, index) {
    const record = visitorApplicationRowToRecord_(
      values,
      index + 2
    );
    if (!record.applicationNumber) {
      return;
    }
    if (!grouped[record.applicationNumber]) {
      grouped[record.applicationNumber] = [];
    }
    grouped[record.applicationNumber].push(record);
  });

  return Object.keys(grouped)
    .map(function (applicationNumber) {
      return summarizeVisitorApplication_(
        spreadsheet,
        grouped[applicationNumber],
        true
      );
    })
    .sort(function (left, right) {
      return right.appliedAt.localeCompare(left.appliedAt);
    })
    .slice(0, ACCESS.maxVisitorApplications);
}

function maskVisitorPhone_(phone) {
  const text = String(phone || '');
  if (text.length < 7) {
    return text;
  }
  return text.slice(0, 3) + '-****-' + text.slice(-4);
}

function findEligibleVisitorForEntry_(
  spreadsheet,
  applicationNumber,
  phone
) {
  const rows = getVisitorApplicationRows_(
    ensureVisitorApplicationSheet_(spreadsheet),
    applicationNumber
  );
  const matches = rows.filter(function (row) {
    return row.phone === phone;
  });

  if (matches.length !== 1) {
    throw new Error('방문신청번호 또는 본인 연락처가 일치하지 않습니다.');
  }

  const visitor = matches[0];
  if (visitor.status !== '승인') {
    throw new Error(
      visitor.status === '승인 대기'
        ? '아직 승인 대기 중인 방문 신청입니다.'
        : '현장 등록이 허용되지 않은 방문 신청입니다.'
    );
  }

  const today = Utilities.formatDate(
    new Date(),
    APP.timeZone,
    'yyyy-MM-dd'
  );
  const startDate = formatDateOnly_(visitor.visitStartDate);
  const endDate = formatDateOnly_(visitor.visitEndDate);
  if (today < startDate || today > endDate) {
    throw new Error('승인된 방문기간이 아닙니다.');
  }

  const accessStates = getVisitorAccessStateMap_(
    spreadsheet,
    applicationNumber
  );
  if (
    accessStates[visitor.visitorId] &&
    accessStates[visitor.visitorId].status === '입장'
  ) {
    throw new Error('이미 입장 처리된 방문객입니다.');
  }

  return {
    row: visitor.row,
    application: visitor,
    publicRecord: {
      applicationNumber: visitor.applicationNumber,
      visitorId: visitor.visitorId,
      name: visitor.name,
      organization: visitor.organization,
      visitStartDate: startDate,
      visitEndDate: endDate,
      visitPurpose: visitor.visitPurpose,
      hostName: visitor.hostName,
      vehicleNumber: visitor.vehicleNumber,
      carryItems: visitor.carryItems,
      securityVersion: ACCESS.visitorSecurityVersion,
    },
  };
}

function normalizeVisitorDecisionReason_(reasonCode, reasonDetail) {
  const code = cleanText_(reasonCode, 80);
  const detail = cleanText_(reasonDetail, 300);
  const allowed = [
    '방문 일정 확인 필요',
    '방문 대상 담당자 확인 불가',
    '방문 목적 불명확',
    '방문객 정보 불일치',
    '보안상 승인 불가',
    '기타',
  ];

  if (allowed.indexOf(code) === -1) {
    throw new Error('처리 사유를 선택하세요.');
  }
  if (code === '기타' && !detail) {
    throw new Error('기타 처리 사유를 입력하세요.');
  }
  return code === '기타' ? '기타: ' + detail : code;
}

function normalizeAccessType_(value) {
  const type = String(value || '').toLowerCase();

  if (type !== 'visitor' && type !== 'employee') {
    throw new Error('출입대장 구분이 올바르지 않습니다.');
  }

  return type;
}

function normalizeAccessPayload_(request) {
  const source = request || {};
  const accessType = normalizeAccessType_(
    source.accessType
  );
  const payload = {
    accessType: accessType,
    processedBy: cleanText_(source.processedBy, 80),
    name: cleanText_(source.name, 80),
    organization: cleanText_(source.organization, 100),
    phone: cleanText_(source.phone, 40),
    visitPurpose: cleanText_(source.visitPurpose, 200),
    hostName: cleanText_(source.hostName, 80),
    vehicleNumber: cleanText_(source.vehicleNumber, 40),
    carryItems: cleanText_(source.carryItems, 300),
    applicationNumber: cleanText_(source.applicationNumber, 80),
    visitorId: cleanText_(source.visitorId, 80),
    employeeNumber: cleanText_(source.employeeNumber, 40),
    department: cleanText_(source.department, 100),
    accessPurpose: cleanText_(source.accessPurpose, 200),
    remarks: cleanText_(source.remarks, 300),
  };

  if (!payload.processedBy) {
    throw new Error('처리자를 입력하세요.');
  }

  if (!payload.name) {
    throw new Error('성명을 입력하세요.');
  }

  if (accessType === 'visitor') {
    if (!payload.organization) {
      throw new Error('소속을 입력하세요.');
    }
    if (!payload.visitPurpose) {
      throw new Error('방문 목적을 입력하세요.');
    }
    if (!payload.hostName) {
      throw new Error('방문 대상을 입력하세요.');
    }
  } else {
    if (!payload.employeeNumber) {
      throw new Error('사번을 입력하세요.');
    }
    if (!payload.department) {
      throw new Error('부서를 입력하세요.');
    }
  }

  return payload;
}

function ensureAccessSystem_() {
  const assetContext = getContextWithAutoDiscovery_(
    false,
    APP.sheetName
  );
  const root = getRootFolderFromPhoto_(
    assetContext.photoRoot
  );
  const spreadsheet = openOrCreateManagedSpreadsheet_(
    root,
    ACCESS.spreadsheetName,
    ACCESS.spreadsheetPropertyKey
  );
  const logSpreadsheet = openOrCreateManagedSpreadsheet_(
    root,
    ACCESS.logSpreadsheetName,
    ACCESS.logSpreadsheetPropertyKey
  );

  spreadsheet.setSpreadsheetTimeZone(APP.timeZone);
  logSpreadsheet.setSpreadsheetTimeZone(APP.timeZone);

  ensureVisitorApplicationSheet_(spreadsheet);
  ensureAccessLedgerSheet_(spreadsheet, 'visitor');
  ensureAccessLedgerSheet_(spreadsheet, 'employee');
  ensureEmployeeRosterSheet_(spreadsheet);
  ensureManagementRequestSheet_(spreadsheet);
  const logSheet = ensureAccessLogSheet_(logSpreadsheet);

  return {
    spreadsheet: spreadsheet,
    log: {
      spreadsheet: logSpreadsheet,
      sheet: logSheet,
    },
  };
}

function getAccessSpreadsheetForRead_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(
    ACCESS.spreadsheetPropertyKey
  );

  if (spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      ensureAccessLedgerSheet_(spreadsheet, 'visitor');
      ensureAccessLedgerSheet_(spreadsheet, 'employee');
      return spreadsheet;
    } catch (error) {
      console.warn(error);
    }
  }

  return ensureAccessSystem_().spreadsheet;
}

function getAccessSystemForUse_() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty(
    ACCESS.spreadsheetPropertyKey
  );
  const logSpreadsheetId = properties.getProperty(
    ACCESS.logSpreadsheetPropertyKey
  );

  if (spreadsheetId && logSpreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const logSpreadsheet = SpreadsheetApp.openById(
        logSpreadsheetId
      );
      ensureVisitorApplicationSheet_(spreadsheet);
      ensureAccessLedgerSheet_(spreadsheet, 'visitor');
      ensureAccessLedgerSheet_(spreadsheet, 'employee');
      ensureManagementRequestSheet_(spreadsheet);
      const logSheet = logSpreadsheet.getSheetByName(
        ACCESS.logSheetName
      );

      if (!logSheet) {
        throw new Error('출입관리 로그 시트를 찾을 수 없습니다.');
      }

      return {
        spreadsheet: spreadsheet,
        log: {
          spreadsheet: logSpreadsheet,
          sheet: logSheet,
        },
      };
    } catch (error) {
      console.warn(error);
    }
  }

  return ensureAccessSystem_();
}

function openOrCreateManagedSpreadsheet_(
  root,
  spreadsheetName,
  propertyKey
) {
  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty(propertyKey);
  let spreadsheet = null;

  if (configuredId) {
    try {
      spreadsheet = SpreadsheetApp.openById(configuredId);
    } catch (error) {
      properties.deleteProperty(propertyKey);
    }
  }

  if (!spreadsheet) {
    const candidates = [];
    const files = root.getFilesByName(spreadsheetName);

    while (files.hasNext()) {
      const file = files.next();

      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        candidates.push(file);
      }
    }

    if (candidates.length > 1) {
      throw new Error(
        spreadsheetName + ' 파일이 여러 개입니다.'
      );
    }

    if (candidates.length === 1) {
      spreadsheet = SpreadsheetApp.openById(
        candidates[0].getId()
      );
    } else {
      spreadsheet = SpreadsheetApp.create(spreadsheetName);
      DriveApp.getFileById(spreadsheet.getId()).moveTo(root);
    }
  }

  spreadsheet.setName(spreadsheetName);
  properties.setProperty(propertyKey, spreadsheet.getId());
  return spreadsheet;
}

function getAccessSheet_(spreadsheet, accessType) {
  const sheetName = accessType === 'visitor'
    ? ACCESS.visitorSheetName
    : ACCESS.employeeSheetName;
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error(sheetName + ' 시트를 찾을 수 없습니다.');
  }

  return sheet;
}

function ensureVisitorApplicationSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(
    ACCESS.visitorApplicationSheetName
  );
  const cache = CacheService.getScriptCache();
  const cacheKey = 'visitor-application-schema-v92-' + spreadsheet.getId();
  if (sheet && cache.get(cacheKey) === '1') return sheet;

  if (!sheet) {
    sheet = spreadsheet.insertSheet(
      ACCESS.visitorApplicationSheetName
    );
  }

  const headers = [[
    '방문신청번호', '신청일시', '상태', '소속회사',
    '방문시작일', '방문종료일', '방문목적', '방문대상',
    '방문객ID', '대표여부', '방문객성명', '연락처',
    '차량번호', '반입물품', '개인정보동의시각',
    '동의문서버전', '처리사유', '처리자', '처리시각',
    '첫입장시각', '최근입장시각', '보존기한',
    '신청취소시각', '비고',
  ]];

  sheet.getRange(
    1,
    1,
    1,
    ACCESS.visitorApplicationColumnCount
  )
    .setValues(headers)
    .setFontWeight('bold')
    .setBackground('#DCE8C4')
    .setFontColor('#172033')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.setFrozenRows(1);

  [
    170, 145, 100, 150, 105, 105, 220, 120,
    170, 80, 110, 130, 110, 220, 145, 130,
    240, 110, 145, 145, 145, 105, 145, 220,
  ].forEach(function (width, index) {
    sheet.setColumnWidth(index + 1, width);
  });

  repairVisitorPhoneStorageOnce_(sheet);

  protectSheetForHumans_(
    sheet,
    '방문 신청 프로그램 전용 기록'
  );
  cache.put(cacheKey, '1', 21600);
  return sheet;
}

function repairVisitorPhoneStorageOnce_(sheet) {
  const properties = PropertiesService.getScriptProperties();
  const propertyKey = 'VISITOR_PHONE_STORAGE_REPAIR_V1_' +
    sheet.getSheetId();

  if (properties.getProperty(propertyKey) === 'DONE') {
    return;
  }

  const availableRows = Math.max(sheet.getMaxRows() - 1, 1);
  sheet.getRange(2, 12, availableRows, 1)
    .setNumberFormat('@');

  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const phoneRange = sheet.getRange(2, 12, lastRow - 1, 1);
    const values = phoneRange.getValues();
    let changed = false;

    values.forEach(function (row) {
      const current = String(row[0] == null ? '' : row[0]);
      const normalized = normalizeStoredVisitorPhone_(row[0]);
      if (normalized && normalized !== current) {
        row[0] = normalized;
        changed = true;
      }
    });

    if (changed) {
      phoneRange.setValues(values);
      SpreadsheetApp.flush();
    }
  }

  properties.setProperty(propertyKey, 'DONE');
}

function ensureAccessLedgerSheet_(spreadsheet, accessType) {
  const sheetName = accessType === 'visitor'
    ? ACCESS.visitorSheetName
    : ACCESS.employeeSheetName;
  let sheet = spreadsheet.getSheetByName(sheetName);
  const cache = CacheService.getScriptCache();
  const cacheKey = 'access-ledger-schema-v92-' +
    spreadsheet.getId() + '-' + accessType;
  if (sheet && cache.get(cacheKey) === '1') return sheet;

  if (!sheet) {
    const sheets = spreadsheet.getSheets();

    if (
      sheets.length === 1 &&
      sheets[0].getLastRow() === 0
    ) {
      sheet = sheets[0];
      sheet.setName(sheetName);
    } else {
      sheet = spreadsheet.insertSheet(sheetName);
    }
  }

  const headers = accessType === 'visitor'
    ? [[
        '기록ID', '방문일자', '입장시각', '퇴장시각',
        '상태', '성명', '소속', '연락처', '방문목적',
        '방문대상', '차량번호', '처리자', '비고',
        '방문신청번호', '방문객ID', '반입물품',
      ]]
    : [[
        '기록ID', '출입일자', '입장시각', '퇴장시각',
        '상태', '사번', '성명', '부서', '출입목적',
        '처리자', '비고',
      ]];
  const columnCount = headers[0].length;

  sheet.getRange(1, 1, 1, columnCount)
    .setValues(headers)
    .setFontWeight('bold')
    .setBackground('#DCE8C4')
    .setFontColor('#172033')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.setFrozenRows(1);
  setAccessColumnWidths_(sheet, accessType);

  protectSheetForHumans_(
    sheet,
    '출입관리 프로그램 전용 기록'
  );
  cache.put(cacheKey, '1', 21600);
  return sheet;
}

function ensureEmployeeRosterSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(
    ACCESS.employeeRosterSheetName
  );

  if (!sheet) {
    sheet = spreadsheet.insertSheet(
      ACCESS.employeeRosterSheetName
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 4)
      .setValues([[
        '사번', '성명', '부서', '사용여부',
      ]])
      .setFontWeight('bold')
      .setBackground('#DCE8C4')
      .setFontColor('#172033')
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle')
      .setBorder(
        true, true, true, true, true, true,
        '#000000',
        SpreadsheetApp.BorderStyle.SOLID
      );
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 120);
    sheet.setColumnWidth(2, 120);
    sheet.setColumnWidth(3, 160);
    sheet.setColumnWidth(4, 100);
  }

  return sheet;
}

function listEmployeeRoster_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  return sheet.getRange(2, 1, lastRow - 1, 4)
    .getDisplayValues()
    .map(function (row) {
      return {
        employeeNumber: cleanText_(row[0], 40),
        name: cleanText_(row[1], 80),
        department: cleanText_(row[2], 100),
        enabled: cleanText_(row[3], 20) !== '미사용',
      };
    })
    .filter(function (employee) {
      return employee.enabled &&
        employee.employeeNumber &&
        employee.name &&
        employee.department;
    })
    .sort(function (left, right) {
      return left.name.localeCompare(right.name, 'ko');
    });
}

function findEmployeeFromRoster_(sheet, name) {
  const normalizedName = cleanText_(name, 80);
  const matches = listEmployeeRoster_(sheet)
    .filter(function (employee) {
      return employee.name === normalizedName;
    });

  if (matches.length === 0) {
    throw new Error(
      '사원 명부에서 이름을 찾을 수 없습니다.'
    );
  }

  if (matches.length > 1) {
    throw new Error(
      '동명이인이 있습니다. 관리자에게 사원 명부 구분을 요청하세요.'
    );
  }

  return matches[0];
}

function validateAssetAuthor_(author) {
  const spreadsheet = getAccessSpreadsheetForRead_();
  const roster = ensureEmployeeRosterSheet_(spreadsheet);
  return findEmployeeFromRoster_(roster, author);
}

function findOpenEmployeeRecord_(sheet, employeeNumber) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return null;
  }

  const values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    ACCESS.employeeColumnCount
  ).getValues();
  const matches = [];

  values.forEach(function (row, index) {
    if (
      String(row[4] || '') === '입장중' &&
      String(row[5] || '') === employeeNumber
    ) {
      matches.push({
        row: index + 2,
        values: row,
      });
    }
  });

  if (matches.length > 1) {
    throw new Error(
      '같은 사원의 출입 중 기록이 여러 개입니다.'
    );
  }

  return matches.length ? matches[0] : null;
}

function setAccessColumnWidths_(sheet, accessType) {
  const widths = accessType === 'visitor'
    ? [170, 95, 145, 145, 85, 100, 130, 120,
        220, 110, 110, 100, 240, 170, 170, 220]
    : [170, 95, 145, 145, 85, 90, 100, 130,
        220, 100, 240];

  widths.forEach(function (width, index) {
    sheet.setColumnWidth(index + 1, width);
  });
}

function ensureAccessLogSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(
    ACCESS.logSheetName
  );

  if (!sheet) {
    const sheets = spreadsheet.getSheets();

    if (
      sheets.length === 1 &&
      sheets[0].getLastRow() === 0
    ) {
      sheet = sheets[0];
      sheet.setName(ACCESS.logSheetName);
    } else {
      sheet = spreadsheet.insertSheet(ACCESS.logSheetName);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, ACCESS.logColumnCount)
      .setValues([[
        '로그ID', '처리시각', '처리자', '처리유형',
        '출입구분', '기록ID', '성명', '상세내용',
        '이전해시', '현재해시',
      ]])
      .setFontWeight('bold')
      .setBackground('#E8EAED')
      .setFontColor('#202124');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 230);
    sheet.setColumnWidth(2, 150);
    sheet.setColumnWidth(8, 420);
    sheet.setColumnWidth(9, 300);
    sheet.setColumnWidth(10, 300);
  }

  protectSheetForHumans_(
    sheet,
    '출입관리 감사로그 프로그램 전용 기록'
  );
  return sheet;
}

function makeAccessRowValues_(payload, recordId, entryAt) {
  if (payload.accessType === 'visitor') {
    return [
      recordId,
      entryAt,
      entryAt,
      '',
      '입장중',
      payload.name,
      payload.organization,
      payload.phone,
      payload.visitPurpose,
      payload.hostName,
      payload.vehicleNumber,
      payload.processedBy,
      payload.remarks,
      payload.applicationNumber,
      payload.visitorId,
      payload.carryItems,
    ];
  }

  return [
    recordId,
    entryAt,
    entryAt,
    '',
    '입장중',
    payload.employeeNumber,
    payload.name,
    payload.department,
    payload.accessPurpose || '일반 출입',
    payload.processedBy,
    payload.remarks,
  ];
}

function formatAccessDataRow_(sheet, row, columnCount) {
  const range = sheet.getRange(row, 1, 1, columnCount);

  range
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd');
  sheet.getRange(row, 3, 1, 2).setNumberFormat(
    'yyyy-mm-dd hh:mm:ss'
  );
  sheet.getRange(row, 1, 1, 5)
    .setHorizontalAlignment('center');
  if (columnCount === ACCESS.visitorColumnCount) {
    sheet.getRange(row, 8).setNumberFormat('@');
  }
}

function makeAccessRecordId_(accessType, date) {
  const prefix = accessType === 'visitor' ? 'V' : 'E';
  const day = Utilities.formatDate(
    date,
    APP.timeZone,
    'yyyyMMdd'
  );
  const unique = Utilities.getUuid()
    .replace(/-/g, '')
    .slice(0, 8)
    .toUpperCase();

  return prefix + '-' + day + '-' + unique;
}

function getAccessColumnCount_(accessType) {
  return accessType === 'visitor'
    ? ACCESS.visitorColumnCount
    : ACCESS.employeeColumnCount;
}

function findOpenAccessRecordRow_(sheet, recordId) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    throw new Error('입장 중인 기록을 찾을 수 없습니다.');
  }

  const values = sheet
    .getRange(2, 1, lastRow - 1, 5)
    .getDisplayValues();
  const matches = [];

  values.forEach(function (row, index) {
    if (row[0] === recordId && row[4] === '입장중') {
      matches.push(index + 2);
    }
  });

  if (matches.length !== 1) {
    throw new Error(
      matches.length === 0
        ? '이미 퇴장했거나 기록을 찾을 수 없습니다.'
        : '같은 기록ID가 여러 개입니다.'
    );
  }

  return matches[0];
}

function listOpenAccessRecords_(sheet, accessType) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return [];
  }

  const columnCount = getAccessColumnCount_(accessType);
  const values = sheet
    .getRange(2, 1, lastRow - 1, columnCount)
    .getValues();

  return values
    .filter(function (row) {
      return String(row[4] || '') === '입장중';
    })
    .slice(-ACCESS.maxOpenRecords)
    .reverse()
    .map(function (row) {
      return {
        recordId: String(row[0] || ''),
        enteredAt: formatAccessDateTime_(row[2]),
        name: getAccessNameFromRow_(row, accessType),
        organization: accessType === 'visitor'
          ? String(row[6] || '')
          : String(row[7] || ''),
        identifier: accessType === 'visitor'
          ? '방문대상 ' + String(row[9] || '')
          : String(row[5] || ''),
        purpose: accessType === 'visitor'
          ? String(row[8] || '')
          : String(row[8] || ''),
      };
    });
}

function getAccessNameFromRow_(row, accessType) {
  return String(
    accessType === 'visitor' ? row[5] : row[6]
  );
}

function getAssetMovementConfig(adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'movementRequest');
    const context = getContextWithAutoDiscovery_(
      false,
      APP.sheetName
    );
    const system = ensureMovementSystem_();
    const canManageMovement = Object.keys(SITE_MANAGERS).some(
      function (siteName) {
        return SITE_MANAGERS[siteName] === session.actorName;
      }
    );

    return {
      ok: true,
      actorName: session.actorName,
      department: session.department,
      userRole: session.role,
      assetSheets: getSelectableSheetNames_(context.spreadsheet),
      ledgerUrl: system.spreadsheet.getUrl() +
        '#gid=' + system.ledger.getSheetId(),
      canManageMovement: canManageMovement,
      canReturnMovement: session.role === 'admin',
      pendingRecords: canManageMovement
        ? listMovementPendingForApprover_(system.ledger, session)
        : [],
      openRecords: session.role === 'admin'
        ? listOpenMovementRecords_(system.ledger)
        : [],
      myRecords: listMyMovementRecords_(system.ledger, session.actorName),
    };
  } catch (error) {
    return {
      ok: false,
      message: safeErrorMessage_(error),
    };
  }
}

function registerAssetCheckout(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;

  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'movementRequest'
    );
    lock.waitLock(30000);
    hasLock = true;

    const payload = normalizeMovementPayload_(source);
    payload.handler = session.actorName;
    if (session.role === 'registrar') {
      payload.borrower = session.actorName;
      payload.department = session.department;
    }
    const context = getContextWithAutoDiscovery_(
      false,
      payload.sheetName
    );
    const assetSheet = getSelectableSheet_(
      context.spreadsheet,
      payload.sheetName
    );
    const assetRow = findAssetRow_(
      assetSheet,
      payload.managementNumber
    );
    const asset = readAssetRecord_(assetSheet, assetRow);
    const system = ensureMovementSystem_();

    if (findOpenMovementByAsset_(
      system.ledger,
      payload.sheetName,
      payload.managementNumber
    )) {
      throw new Error('이미 반출 중인 자산입니다.');
    }

    const checkedOutAt = new Date();
    const movementStatus = '승인 대기';
    const recordId = 'M-' + Utilities.formatDate(
      checkedOutAt,
      APP.timeZone,
      'yyyyMMdd'
    ) + '-' + Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 8)
      .toUpperCase();
    const values = [[
      recordId,
      payload.sheetName,
      payload.managementNumber,
      asset.itemName,
      payload.borrower,
      payload.department,
      payload.purpose,
      payload.destination,
      checkedOutAt,
      payload.expectedReturnDate,
      '',
      movementStatus,
      payload.handler,
      '',
      '',
      payload.remarks,
    ]];
    const row = system.ledger.getLastRow() + 1;

    targetRange = system.ledger.getRange(
      row,
      1,
      1,
      MOVEMENT.columnCount
    );
    targetRange.setValues(values);
    formatMovementRow_(system.ledger, row);
    SpreadsheetApp.flush();

    appendManagedLog_(system.log, {
      actor: payload.handler,
      eventType: '반출신청',
      recordId: recordId,
      target:
        payload.sheetName + ' #' + payload.managementNumber +
        ' ' + asset.itemName,
      details: {
        borrower: payload.borrower,
        department: payload.department,
        purpose: payload.purpose,
        destination: payload.destination,
        expectedReturnDate: payload.expectedReturnDate,
      },
    });

    return {
      ok: true,
      recordId: recordId,
      itemName: asset.itemName,
      status: movementStatus,
      checkedOutAt: formatAccessDateTime_(checkedOutAt),
      pendingRecords: isSiteManagerFor_(session, payload.department)
        ? listMovementPendingForApprover_(system.ledger, session)
        : [],
      openRecords: session.role === 'admin'
        ? listOpenMovementRecords_(system.ledger)
        : [],
      myRecords: listMyMovementRecords_(system.ledger, session.actorName),
    };
  } catch (error) {
    if (targetRange) {
      try {
        targetRange.clearContent();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function processAssetCheckoutDecision(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'movementRequest'
    );
    const action = String(source.action || '').toLowerCase();
    const reason = cleanText_(source.reason, 300);
    if (['approve', 'reject'].indexOf(action) === -1) {
      throw new Error('승인 또는 반려를 선택하세요.');
    }
    if (action === 'reject' && !reason) {
      throw new Error('반려 사유를 입력하세요.');
    }

    lock.waitLock(30000);
    hasLock = true;
    const system = ensureMovementSystem_();
    const found = findMovementByRecordIdAndStatus_(
      system.ledger,
      cleanText_(source.recordId, 80),
      '승인 대기'
    );
    if (!isSiteManagerFor_(session, String(found.values[5] || ''))) {
      throw new Error('해당 부서 실장만 반출 신청을 승인·반려할 수 있습니다.');
    }
    targetRange = system.ledger.getRange(
      found.row,
      1,
      1,
      MOVEMENT.columnCount
    );
    originalValues = targetRange.getValues();
    const values = originalValues[0].slice();
    const processedAt = new Date();
    const note = action === 'approve'
      ? '승인: ' + session.actorName + ' · ' +
        formatAccessDateTime_(processedAt)
      : '반려: ' + session.actorName + ' · ' + reason;
    values[11] = action === 'approve' ? '반출중' : '반려';
    values[15] = [String(values[15] || ''), note]
      .filter(Boolean)
      .join(' / ');
    if (action === 'approve') {
      values[8] = processedAt;
    }
    targetRange.setValues([values]);
    formatMovementRow_(system.ledger, found.row);
    SpreadsheetApp.flush();

    appendManagedLog_(system.log, {
      actor: session.actorName,
      eventType: action === 'approve' ? '반출승인' : '반출반려',
      recordId: String(values[0] || ''),
      target: String(values[1] || '') + ' #' +
        String(values[2] || '') + ' ' + String(values[3] || ''),
      details: { reason: reason, requester: String(values[12] || '') },
    });

    return getAssetMovementConfig(source.adminToken);
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function returnCheckedOutAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;

  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'movementManage'
    );
    lock.waitLock(30000);
    hasLock = true;

    const recordId = cleanText_(source.recordId, 80);
    const handler = session.actorName;
    const condition = cleanText_(source.condition, 120);

    if (!recordId) {
      throw new Error('반입 처리할 기록을 선택하세요.');
    }
    if (!handler) {
      throw new Error('반입 처리자를 입력하세요.');
    }
    if (!condition) {
      throw new Error('반입 상태를 입력하세요.');
    }

    const system = ensureMovementSystem_();
    const found = findOpenMovementByRecordId_(
      system.ledger,
      recordId
    );
    const returnedAt = new Date();
    targetRange = system.ledger.getRange(found.row, 11, 1, 5);
    originalValues = targetRange.getValues();
    targetRange.setValues([[
      returnedAt,
      '반입완료',
      found.values[12],
      handler,
      condition,
    ]]);
    system.ledger.getRange(found.row, 11).setNumberFormat(
      'yyyy-mm-dd hh:mm:ss'
    );
    SpreadsheetApp.flush();

    appendManagedLog_(system.log, {
      actor: handler,
      eventType: '반입처리',
      recordId: recordId,
      target:
        String(found.values[1] || '') + ' #' +
        String(found.values[2] || '') + ' ' +
        String(found.values[3] || ''),
      details: {
        returnedAt: formatAccessDateTime_(returnedAt),
        condition: condition,
      },
    });

    return {
      ok: true,
      recordId: recordId,
      itemName: String(found.values[3] || ''),
      returnedAt: formatAccessDateTime_(returnedAt),
      openRecords: listOpenMovementRecords_(system.ledger),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function normalizeMovementPayload_(request) {
  const payload = {
    sheetName: cleanText_(request.sheetName, 100),
    managementNumber: Number(request.managementNumber),
    borrower: cleanText_(request.borrower, 80),
    department: cleanText_(request.department, 100),
    purpose: cleanText_(request.purpose, 200),
    destination: cleanText_(request.destination, 150),
    expectedReturnDate: cleanText_(request.expectedReturnDate, 20),
    handler: cleanText_(request.handler, 80),
    remarks: cleanText_(request.remarks, 300),
  };

  if (!payload.sheetName) {
    throw new Error('자산 시트를 선택하세요.');
  }
  if (!Number.isInteger(payload.managementNumber) ||
      payload.managementNumber < 1) {
    throw new Error('관리번호를 정확히 입력하세요.');
  }
  ['borrower', 'department', 'purpose', 'destination',
    'expectedReturnDate', 'handler'].forEach(function (key) {
    if (!payload[key]) {
      throw new Error('반출 필수항목을 모두 입력하세요.');
    }
  });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.expectedReturnDate)) {
    throw new Error('반입 예정일 형식이 올바르지 않습니다.');
  }

  return payload;
}

function ensureMovementSystem_() {
  const spreadsheet = openManagedSpreadsheetFast_(
    MOVEMENT.spreadsheetName,
    MOVEMENT.spreadsheetPropertyKey
  );
  let ledger = spreadsheet.getSheetByName(MOVEMENT.sheetName);
  let log = spreadsheet.getSheetByName(MOVEMENT.logSheetName);

  if (!ledger) {
    const sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      ledger = sheets[0];
      ledger.setName(MOVEMENT.sheetName);
    } else {
      ledger = spreadsheet.insertSheet(MOVEMENT.sheetName);
    }
  }
  if (ledger.getLastRow() === 0) {
    ledger.getRange(1, 1, 1, MOVEMENT.columnCount)
      .setValues([[
        '기록ID', '자산시트', '관리번호', '품목',
        '반출자', '부서', '반출목적', '반출장소',
        '신청·반출시각', '반입예정일', '반입시각', '상태',
        '신청·반출처리자', '반입처리자', '반입상태', '비고',
      ]]);
    styleManagedHeader_(ledger, MOVEMENT.columnCount, '#DCE8C4');
    protectSheetForHumans_(ledger, '물품 반출입 프로그램 전용 기록');
  }
  ledger.getRange(1, 9).setValue('신청·반출시각');
  ledger.getRange(1, 13).setValue('신청·반출처리자');

  if (!log) {
    log = spreadsheet.insertSheet(MOVEMENT.logSheetName);
  }
  ensureManagedLogSheet_(log, '물품 반출입 변경 불가 로그');

  return { spreadsheet: spreadsheet, ledger: ledger, log: log };
}

function listOpenMovementRecords_(sheet) {
  return listMovementRecordsByStatus_(sheet, ['반출중']);
}

function listMovementRecordsByStatus_(sheet, statuses) {
  const allowed = statuses || [];
  return readMovementRows_(sheet)
    .filter(function (entry) {
      return allowed.indexOf(String(entry.values[11] || '')) >= 0;
    })
    .slice(-MOVEMENT.maxOpenRecords)
    .reverse()
    .map(function (entry) {
      return movementRowToRecord_(entry.values);
    });
}

function listMovementPendingForApprover_(sheet, session) {
  return readMovementRows_(sheet)
    .filter(function (entry) {
      return String(entry.values[11] || '') === '승인 대기' &&
        isSiteManagerFor_(session, String(entry.values[5] || ''));
    })
    .slice(-MOVEMENT.maxOpenRecords)
    .reverse()
    .map(function (entry) {
      return movementRowToRecord_(entry.values);
    });
}

function listMyMovementRecords_(sheet, actorName) {
  return readMovementRows_(sheet)
    .filter(function (entry) {
      return String(entry.values[12] || '') === String(actorName || '');
    })
    .slice(-MOVEMENT.maxOpenRecords)
    .reverse()
    .map(function (entry) {
      return movementRowToRecord_(entry.values);
    });
}

function movementRowToRecord_(row) {
  return {
    recordId: String(row[0] || ''),
    sheetName: String(row[1] || ''),
    managementNumber: String(row[2] || ''),
    itemName: String(row[3] || ''),
    borrower: String(row[4] || ''),
    department: String(row[5] || ''),
    purpose: String(row[6] || ''),
    destination: String(row[7] || ''),
    checkedOutAt: formatAccessDateTime_(row[8]),
    expectedReturnDate: formatDateOnly_(row[9]),
    returnedAt: formatAccessDateTime_(row[10]),
    status: String(row[11] || ''),
    requestedBy: String(row[12] || ''),
    returnedBy: String(row[13] || ''),
    returnCondition: String(row[14] || ''),
    remarks: String(row[15] || ''),
  };
}

function findOpenMovementByAsset_(sheet, sheetName, managementNumber) {
  const records = readMovementRows_(sheet);
  const matches = records.filter(function (entry) {
    return ['승인 대기', '반출중'].indexOf(
      String(entry.values[11] || '')
    ) >= 0 &&
      String(entry.values[1] || '') === sheetName &&
      Number(entry.values[2]) === Number(managementNumber);
  });

  if (matches.length > 1) {
    throw new Error('같은 자산의 반출 중 기록이 여러 개입니다.');
  }
  return matches.length ? matches[0] : null;
}

function findOpenMovementByRecordId_(sheet, recordId) {
  const matches = readMovementRows_(sheet).filter(function (entry) {
    return String(entry.values[0] || '') === recordId &&
      String(entry.values[11] || '') === '반출중';
  });

  if (matches.length !== 1) {
    throw new Error(
      matches.length ? '같은 반출 기록이 여러 개입니다.' :
        '반출 중인 기록을 찾을 수 없습니다.'
    );
  }
  return matches[0];
}

function findMovementByRecordIdAndStatus_(sheet, recordId, status) {
  const matches = readMovementRows_(sheet).filter(function (entry) {
    return String(entry.values[0] || '') === String(recordId || '') &&
      String(entry.values[11] || '') === String(status || '');
  });
  if (matches.length !== 1) {
    throw new Error(matches.length
      ? '같은 반출 신청이 여러 개입니다.'
      : '처리할 반출 신청을 찾을 수 없습니다.');
  }
  return matches[0];
}

function readMovementRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }
  return sheet.getRange(2, 1, lastRow - 1, MOVEMENT.columnCount)
    .getValues()
    .map(function (values, index) {
      return { row: index + 2, values: values };
    });
}

function formatMovementRow_(sheet, row) {
  sheet.getRange(row, 1, 1, MOVEMENT.columnCount)
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.getRange(row, 9).setNumberFormat('yyyy-mm-dd hh:mm:ss');
}

function getInfoAssetConfig(adminToken) {
  try {
    const session = requireSessionInfo_(adminToken, 'infoRegister');
    const userRole = session.role;
    const system = ensureInfoAssetSystem_();
    return {
      ok: true,
      userRole: userRole,
      actorName: session.actorName,
      ledgerUrl: system.spreadsheet.getUrl() +
        '#gid=' + system.ledger.getSheetId(),
      categories: [
        'PC·노트북', '서버', '네트워크 장비',
        '소프트웨어·라이선스', '클라우드·SaaS',
        '계정·권한', '데이터·문서', '기타',
      ],
      securityClasses: INFO_ASSET.securityClasses.slice(),
      statuses: ['사용중', '예비', '점검중', '폐기예정', '폐기'],
      records: userRole === 'admin'
        ? listInfoAssets_(system.ledger)
        : [],
    };
  } catch (error) {
    return { ok: false, message: safeErrorMessage_(error) };
  }
}

function registerInfoAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;

  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'infoRegister'
    );
    const userRole = session.role;
    lock.waitLock(30000);
    hasLock = true;
    const payload = normalizeInfoAssetPayload_(source);
    const system = ensureInfoAssetSystem_();
    const assetId = getNextInfoAssetId_(system.ledger);
    const now = new Date();
    const row = system.ledger.getLastRow() + 1;
    const values = [[
      assetId,
      payload.category,
      payload.assetName,
      payload.provider,
      payload.modelVersion,
      payload.identifier,
      payload.owner,
      payload.department,
      payload.location,
      payload.securityClass,
      payload.status,
      payload.introducedDate,
      payload.expiryDate,
      payload.networkIdentifier,
      payload.personalData,
      payload.remarks,
      now,
      now,
    ]];

    targetRange = system.ledger.getRange(
      row,
      1,
      1,
      INFO_ASSET.columnCount
    );
    targetRange.setValues(values);
    formatInfoAssetRow_(system.ledger, row);
    SpreadsheetApp.flush();

    appendManagedLog_(system.log, {
      actor: session.actorName,
      eventType: '정보자산등록',
      recordId: assetId,
      target: payload.category + ' ' + payload.assetName,
      details: payload,
    });

    return {
      ok: true,
      assetId: assetId,
      assetName: payload.assetName,
      records: userRole === 'admin'
        ? listInfoAssets_(system.ledger)
        : [],
    };
  } catch (error) {
    if (targetRange) {
      try {
        targetRange.clearContent();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function updateInfoAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let targetRange = null;
  let originalValues = null;
  try {
    const source = request || {};
    const session = requireSessionInfo_(
      source.adminToken,
      'infoManage'
    );
    const assetId = cleanText_(source.assetId, 40).toUpperCase();
    const reason = cleanText_(source.reason, 300);
    if (!reason) {
      throw new Error('정보자산 수정 사유를 입력하세요.');
    }
    const payload = normalizeInfoAssetPayload_(source);
    lock.waitLock(30000);
    hasLock = true;
    const system = ensureInfoAssetSystem_();
    const row = findInfoAssetRow_(system.ledger, assetId);
    targetRange = system.ledger.getRange(
      row,
      1,
      1,
      INFO_ASSET.columnCount
    );
    originalValues = targetRange.getValues();
    const createdAt = originalValues[0][16] || new Date();
    const now = new Date();
    const values = [[
      assetId,
      payload.category,
      payload.assetName,
      payload.provider,
      payload.modelVersion,
      payload.identifier,
      payload.owner,
      payload.department,
      payload.location,
      payload.securityClass,
      payload.status,
      payload.introducedDate,
      payload.expiryDate,
      payload.networkIdentifier,
      payload.personalData,
      payload.remarks,
      createdAt,
      now,
    ]];
    targetRange.setValues(values);
    formatInfoAssetRow_(system.ledger, row);
    SpreadsheetApp.flush();
    appendManagedLog_(system.log, {
      actor: session.actorName,
      eventType: '정보자산수정',
      recordId: assetId,
      target: payload.category + ' ' + payload.assetName,
      details: {
        reason: reason,
        before: originalValues[0],
        after: values[0],
        sessionFingerprint: getSessionFingerprint_(source.adminToken),
      },
    });
    return {
      ok: true,
      assetId: assetId,
      assetName: payload.assetName,
      records: listInfoAssets_(system.ledger),
    };
  } catch (error) {
    if (targetRange && originalValues) {
      try {
        targetRange.setValues(originalValues);
        SpreadsheetApp.flush();
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }
    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function findInfoAssetRow_(sheet, assetId) {
  if (!/^IA-\d+$/.test(assetId)) {
    throw new Error('올바른 정보자산 ID를 입력하세요.');
  }
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    throw new Error('정보자산을 찾을 수 없습니다.');
  }
  const values = sheet.getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues();
  const matches = [];
  values.forEach(function (row, index) {
    if (String(row[0] || '').toUpperCase() === assetId) {
      matches.push(index + 2);
    }
  });
  if (matches.length !== 1) {
    throw new Error(
      matches.length ? '같은 정보자산 ID가 여러 개입니다.' :
        '정보자산을 찾을 수 없습니다.'
    );
  }
  return matches[0];
}

function normalizeInfoAssetPayload_(request) {
  const payload = {
    category: cleanText_(request.category, 80),
    assetName: cleanText_(request.assetName, 150),
    provider: cleanText_(request.provider, 150),
    modelVersion: cleanText_(request.modelVersion, 150),
    identifier: cleanText_(request.identifier, 150),
    owner: cleanText_(request.owner, 80),
    department: cleanText_(request.department, 100),
    location: cleanText_(request.location, 250),
    securityClass: cleanText_(request.securityClass, 30),
    status: cleanText_(request.status, 30),
    introducedDate: cleanText_(request.introducedDate, 20),
    expiryDate: cleanText_(request.expiryDate, 20),
    networkIdentifier: cleanText_(request.networkIdentifier, 150),
    personalData: cleanText_(request.personalData, 20),
    remarks: cleanText_(request.remarks, 500),
  };

  ['category', 'assetName', 'owner', 'department',
    'securityClass', 'status'].forEach(function (key) {
    if (!payload[key]) {
      throw new Error('정보자산 필수항목을 모두 입력하세요.');
    }
  });
  if (INFO_ASSET.securityClasses.indexOf(payload.securityClass) === -1) {
    throw new Error('보안등급은 공개·사내한·대외비·고객기밀 중에서 선택하세요.');
  }

  return payload;
}

function ensureInfoAssetSystem_() {
  const spreadsheet = openManagedSpreadsheetFast_(
    INFO_ASSET.spreadsheetName,
    INFO_ASSET.spreadsheetPropertyKey
  );
  let ledger = spreadsheet.getSheetByName(INFO_ASSET.sheetName);
  let log = spreadsheet.getSheetByName(INFO_ASSET.logSheetName);

  if (!ledger) {
    const sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      ledger = sheets[0];
      ledger.setName(INFO_ASSET.sheetName);
    } else {
      ledger = spreadsheet.insertSheet(INFO_ASSET.sheetName);
    }
  }
  if (ledger.getLastRow() === 0) {
    ledger.getRange(1, 1, 1, INFO_ASSET.columnCount)
      .setValues([[
        '자산ID', '분류', '자산명', '제조사·서비스',
        '모델·버전', '식별번호', '담당자', '부서',
        '위치·접속주소', '보안등급', '상태', '도입일',
        '만료일', 'IP·MAC', '개인정보포함', '비고',
        '등록시각', '최종수정시각',
      ]]);
    styleManagedHeader_(ledger, INFO_ASSET.columnCount, '#DDD5F5');
    protectSheetForHumans_(ledger, '정보자산 프로그램 전용 기록');
  }

  if (!log) {
    log = spreadsheet.insertSheet(INFO_ASSET.logSheetName);
  }
  ensureManagedLogSheet_(log, '정보자산 변경 불가 로그');
  ensureInfoAssetSecurityClasses_(spreadsheet, ledger, log);

  return { spreadsheet: spreadsheet, ledger: ledger, log: log };
}

function ensureInfoAssetSecurityClasses_(spreadsheet, ledger, log) {
  const properties = PropertiesService.getScriptProperties();
  const propertyKey = 'INFO_SECURITY_CLASS_V2_' + spreadsheet.getId();
  if (properties.getProperty(propertyKey) === '1') return;
  const lastRow = ledger.getLastRow();
  let migratedCount = 0;
  if (lastRow >= 2) {
    const range = ledger.getRange(2, 10, lastRow - 1, 1);
    const values = range.getValues().map(function (row) {
      const current = String(row[0] || '').trim();
      if (current === '사내') {
        migratedCount += 1;
        return ['사내한'];
      }
      if (current === '기밀') {
        migratedCount += 1;
        return ['고객기밀'];
      }
      return [current];
    });
    range.setValues(values);
  }
  const validation = SpreadsheetApp.newDataValidation()
    .requireValueInList(INFO_ASSET.securityClasses.slice(), true)
    .setAllowInvalid(false)
    .setHelpText('공개·사내한·대외비·고객기밀 중에서 선택하세요.')
    .build();
  ledger.getRange(2, 10, Math.max(ledger.getMaxRows() - 1, 1), 1)
    .setDataValidation(validation);
  ledger.getRange(1, 10)
    .setNote('허용값: 공개 / 사내한 / 대외비 / 고객기밀');
  if (migratedCount > 0) {
    appendManagedLog_(log, {
      actor: '시스템',
      eventType: '보안등급체계변경',
      recordId: 'INFO-CLASS-V2',
      target: INFO_ASSET.sheetName,
      details: {
        migratedCount: migratedCount,
        securityClasses: INFO_ASSET.securityClasses.slice(),
      },
    });
  }
  properties.setProperty(propertyKey, '1');
}

function listInfoAssets_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  return sheet.getRange(2, 1, lastRow - 1, INFO_ASSET.columnCount)
    .getValues()
    .filter(function (row) {
      return String(row[0] || '') !== '';
    })
    .slice(-INFO_ASSET.maxRecords)
    .reverse()
    .map(function (row) {
      return {
        assetId: String(row[0] || ''),
        category: String(row[1] || ''),
        assetName: String(row[2] || ''),
        provider: String(row[3] || ''),
        modelVersion: String(row[4] || ''),
        identifier: String(row[5] || ''),
        owner: String(row[6] || ''),
        department: String(row[7] || ''),
        location: String(row[8] || ''),
        securityClass: String(row[9] || ''),
        status: String(row[10] || ''),
        introducedDate: formatDateOnly_(row[11]),
        expiryDate: formatDateOnly_(row[12]),
        networkIdentifier: String(row[13] || ''),
        personalData: String(row[14] || ''),
        remarks: String(row[15] || ''),
      };
    });
}

function getNextInfoAssetId_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return 'IA-0001';
  }
  const values = sheet.getRange(2, 1, lastRow - 1, 1)
    .getDisplayValues();
  const maxNumber = values.reduce(function (max, row) {
    const match = String(row[0] || '').match(/^IA-(\d+)$/);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return 'IA-' + String(maxNumber + 1).padStart(4, '0');
}

function formatInfoAssetRow_(sheet, row) {
  sheet.getRange(row, 1, 1, INFO_ASSET.columnCount)
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.getRange(row, 17, 1, 2).setNumberFormat(
    'yyyy-mm-dd hh:mm:ss'
  );
}

function openManagedSpreadsheetFast_(name, propertyKey) {
  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty(propertyKey);

  if (configuredId) {
    try {
      return SpreadsheetApp.openById(configuredId);
    } catch (error) {
      properties.deleteProperty(propertyKey);
    }
  }

  const context = getContextWithAutoDiscovery_(false, APP.sheetName);
  const root = getRootFolderFromPhoto_(context.photoRoot);
  return openOrCreateManagedSpreadsheet_(
    root,
    name,
    propertyKey
  );
}

function styleManagedHeader_(sheet, columnCount, background) {
  sheet.getRange(1, 1, 1, columnCount)
    .setFontWeight('bold')
    .setBackground(background)
    .setFontColor('#172033')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(
      true, true, true, true, true, true,
      '#000000',
      SpreadsheetApp.BorderStyle.SOLID
    );
  sheet.setFrozenRows(1);
}

function ensureManagedLogSheet_(sheet, description) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 10).setValues([[
      '로그ID', '처리시각', '처리자', '처리유형',
      '기록ID', '대상', '상세내용', '이전해시',
      '현재해시', '비고',
    ]]);
    styleManagedHeader_(sheet, 10, '#E8EAED');
    protectSheetForHumans_(sheet, description);
  }
}

function appendManagedLog_(sheet, event) {
  const row = sheet.getLastRow() + 1;
  const processedAt = new Date();
  const previousHash = row > 2
    ? String(sheet.getRange(row - 1, 9).getValue() || '')
    : '';
  const logId = Utilities.getUuid();
  const details = JSON.stringify(event.details || {});
  const currentHash = computeAuditHash_({
    logId: logId,
    processedAt: formatAccessDateTime_(processedAt),
    actor: event.actor,
    eventType: event.eventType,
    recordId: event.recordId,
    target: event.target,
    details: details,
    previousHash: previousHash,
  });

  sheet.getRange(row, 1, 1, 10).setValues([[
    logId,
    processedAt,
    event.actor,
    event.eventType,
    event.recordId,
    event.target,
    details,
    previousHash,
    currentHash,
    '',
  ]]);
  sheet.getRange(row, 2).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  SpreadsheetApp.flush();
}

function formatDateOnly_(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return Utilities.formatDate(value, APP.timeZone, 'yyyy-MM-dd');
  }
  return String(value || '');
}

function appendAccessAuditLogBatch_(audit, events) {
  if (!events || !events.length) {
    return;
  }

  const sheet = audit.sheet;
  const startRow = sheet.getLastRow() + 1;
  let previousHash = startRow > 2
    ? String(sheet.getRange(startRow - 1, 10).getValue() || '')
    : '';
  const rows = events.map(function (event) {
    const processedAt = new Date();
    const logId = Utilities.getUuid();
    const details = JSON.stringify(event.details || {});
    const canonical = {
      logId: logId,
      processedAt: formatAccessDateTime_(processedAt),
      author: event.author,
      eventType: event.eventType,
      accessType: event.accessType,
      recordId: event.recordId,
      name: event.name,
      details: details,
      previousHash: previousHash,
    };
    const currentHash = computeAuditHash_(canonical);
    const row = [
      logId,
      processedAt,
      event.author,
      event.eventType,
      getAccessTypeLabel_(event.accessType),
      event.recordId,
      event.name,
      details,
      previousHash,
      currentHash,
    ];
    previousHash = currentHash;
    return row;
  });

  sheet.getRange(
    startRow,
    1,
    rows.length,
    ACCESS.logColumnCount
  ).setValues(rows);
  sheet.getRange(startRow, 2, rows.length, 1)
    .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  SpreadsheetApp.flush();
}

function appendAccessAuditLog_(audit, event) {
  const sheet = audit.sheet;
  const row = sheet.getLastRow() + 1;
  const processedAt = new Date();
  const previousHash = row > 2
    ? String(sheet.getRange(row - 1, 10).getValue() || '')
    : '';
  const logId = Utilities.getUuid();
  const details = JSON.stringify(event.details || {});
  const canonical = {
    logId: logId,
    processedAt: formatAccessDateTime_(processedAt),
    author: event.author,
    eventType: event.eventType,
    accessType: event.accessType,
    recordId: event.recordId,
    name: event.name,
    details: details,
    previousHash: previousHash,
  };
  const currentHash = computeAuditHash_(canonical);

  sheet.getRange(row, 1, 1, ACCESS.logColumnCount)
    .setValues([[
      logId,
      processedAt,
      event.author,
      event.eventType,
      getAccessTypeLabel_(event.accessType),
      event.recordId,
      event.name,
      details,
      previousHash,
      currentHash,
    ]]);
  sheet.getRange(row, 2).setNumberFormat(
    'yyyy-mm-dd hh:mm:ss'
  );
  SpreadsheetApp.flush();
  return logId;
}

function formatAccessDateTime_(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return '';
  }

  return Utilities.formatDate(
    value,
    APP.timeZone,
    'yyyy-MM-dd HH:mm:ss'
  );
}

function getAccessTypeLabel_(accessType) {
  if (accessType === 'visitor') {
    return '외부 방문객';
  }
  if (accessType === 'employee') {
    return '사원';
  }
  return '관리 요청';
}

function synchronizeRemarksColumns_() {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const context = getContextWithAutoDiscovery_(false);
    const spreadsheet = context.spreadsheet;
    const referenceSheet = spreadsheet.getSheetByName(
      APP.sheetName
    );

    if (!referenceSheet) {
      throw new Error('고색연구소 시트를 찾을 수 없습니다.');
    }

    const remarksColumn = findHeaderColumn_(
      referenceSheet,
      '비고'
    );

    if (!remarksColumn) {
      throw new Error(
        '고색연구소 시트에서 비고 헤더를 찾을 수 없습니다.'
      );
    }

    const plans = [];
    const skipped = [];
    const conflicts = [];

    getSelectableSheetNames_(spreadsheet)
      .forEach(function (sheetName) {
        const sheet = spreadsheet.getSheetByName(sheetName);

        if (sheetName === referenceSheet.getName()) {
          skipped.push(sheetName);
          return;
        }

        const existingRemarksColumn = findHeaderColumn_(
          sheet,
          '비고'
        );

        if (existingRemarksColumn === remarksColumn) {
          skipped.push(sheetName);
          return;
        }

        if (existingRemarksColumn) {
          conflicts.push(
            sheetName + ': 비고 열 위치가 다릅니다.'
          );
          return;
        }

        plans.push({
          sheet: sheet,
          sheetName: sheetName,
        });
      });

    if (conflicts.length) {
      throw new Error(
        '비고 열을 추가하지 못한 시트가 있습니다. ' +
        conflicts.join(' / ')
      );
    }

    const referenceHeader = referenceSheet.getRange(
      APP.headerRow,
      remarksColumn
    );
    plans.forEach(function (plan) {
      const sheet = plan.sheet;

      if (sheet.getMaxColumns() < remarksColumn) {
        sheet.insertColumnsAfter(
          sheet.getMaxColumns(),
          remarksColumn - sheet.getMaxColumns()
        );
      }

      const targetHeader = sheet.getRange(
        APP.headerRow,
        remarksColumn
      );
      referenceHeader.copyTo(
        targetHeader,
        SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
        false
      );
      targetHeader.setValue('비고');

      sheet.setColumnWidth(
        remarksColumn,
        referenceSheet.getColumnWidth(remarksColumn)
      );
    });

    SpreadsheetApp.flush();

    return {
      ok: true,
      remarksColumn: remarksColumn,
      updatedSheets: plans.map(function (plan) {
        return plan.sheetName;
      }),
      skippedSheets: skipped,
    };
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function findHeaderColumn_(sheet, headerName) {
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const headers = sheet
    .getRange(APP.headerRow, 1, 1, lastColumn)
    .getDisplayValues()[0];
  const normalizedHeader = String(headerName || '')
    .replace(/\s/g, '');

  for (let index = 0; index < headers.length; index += 1) {
    if (
      String(headers[index] || '').replace(/\s/g, '') ===
      normalizedHeader
    ) {
      return index + 1;
    }
  }

  return 0;
}

function hasColumnContent_(sheet, column) {
  const lastRow = Math.max(sheet.getLastRow(), APP.headerRow);
  const values = sheet
    .getRange(
      APP.headerRow,
      column,
      lastRow - APP.headerRow + 1,
      1
    )
    .getDisplayValues();

  return values.some(function (row) {
    return String(row[0] || '').trim() !== '';
  });
}

function inspectRemarksColumns_() {
  const context = getContextWithAutoDiscovery_(false);
  const spreadsheet = context.spreadsheet;
  const referenceSheet = spreadsheet.getSheetByName(
    APP.sheetName
  );
  const remarksColumn = findHeaderColumn_(
    referenceSheet,
    '비고'
  );

  return {
    remarksColumn: remarksColumn,
    sheets: getSelectableSheetNames_(spreadsheet)
      .map(function (sheetName) {
        const sheet = spreadsheet.getSheetByName(sheetName);
        const lastRow = Math.max(
          sheet.getLastRow(),
          APP.headerRow
        );
        const values = sheet
          .getRange(
            APP.headerRow,
            remarksColumn,
            lastRow - APP.headerRow + 1,
            1
          )
          .getDisplayValues();
        const nonEmpty = [];

        values.forEach(function (row, index) {
          const value = String(row[0] || '').trim();

          if (value && nonEmpty.length < 20) {
            nonEmpty.push({
              row: APP.headerRow + index,
              value: value,
            });
          }
        });

        return {
          sheetName: sheetName,
          currentRemarksColumn: findHeaderColumn_(
            sheet,
            '비고'
          ),
          nonEmptyAtReferenceColumn: nonEmpty,
        };
      }),
  };
}

function getNextAssetPosition_(sheet) {
  const lastRow = Math.max(
    sheet.getLastRow(),
    APP.firstDataRow - 1
  );
  let maxManagementNumber = 0;
  let lastAssetRow = APP.firstDataRow - 1;

  if (lastRow >= APP.firstDataRow) {
    const values = sheet
      .getRange(
        APP.firstDataRow,
        APP.firstDataColumn,
        lastRow - APP.firstDataRow + 1,
        APP.dataColumnCount
      )
      .getDisplayValues();

    values.forEach(function (row, index) {
      const text = String(row[0] || '').trim();
      const hasAssetData = row.slice(1).some(function (value) {
        return String(value || '').trim() !== '';
      });

      if (/^\d+$/.test(text) && hasAssetData) {
        const managementNumber = Number(text);

        if (managementNumber > maxManagementNumber) {
          maxManagementNumber = managementNumber;
          lastAssetRow = APP.firstDataRow + index;
        }
      }
    });
  }

  return {
    managementNumber: maxManagementNumber + 1,
    row: Math.max(lastAssetRow + 1, APP.firstDataRow),
    previousAssetRow: lastAssetRow,
  };
}

function assertTargetRowAvailable_(
  sheet,
  row,
  managementNumber
) {
  const values = sheet
    .getRange(
      row,
      APP.firstDataColumn,
      1,
      APP.dataColumnCount
    )
    .getDisplayValues()[0];
  const existingManagementNumber = String(
    values[0] || ''
  ).trim();
  const hasAssetData = values.slice(1).some(function (value) {
    return String(value || '').trim() !== '';
  });
  const numberConflicts =
    existingManagementNumber !== '' &&
    Number(existingManagementNumber) !==
      Number(managementNumber);

  if (hasAssetData || numberConflicts) {
    throw new Error(
      '다음 입력 행에 기존 내용이 있습니다. ' +
      '관리대장을 확인하세요.'
    );
  }
}

function writeAssetRow_(sheet, nextAsset, payload) {
  const target = sheet.getRange(
    nextAsset.row,
    APP.firstDataColumn,
    1,
    APP.dataColumnCount
  );

  if (nextAsset.previousAssetRow >= APP.firstDataRow) {
    const previous = sheet.getRange(
      nextAsset.previousAssetRow,
      APP.firstDataColumn,
      1,
      APP.dataColumnCount
    );
    previous.copyTo(
      target,
      SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
      false
    );
  }

  const purchaseDateParts = payload.purchaseDate
    .split('-')
    .map(function (value) {
      return Number(value);
    });
  const purchaseDate = new Date(Date.UTC(
    purchaseDateParts[0],
    purchaseDateParts[1] - 1,
    purchaseDateParts[2],
    12,
    0,
    0
  ));

  target.setValues([[
    nextAsset.managementNumber,
    payload.itemName,
    payload.modelMaker || '-',
    payload.vendor,
    amountToSheetUnit_(payload.amount),
    purchaseDate,
    payload.manager || '-',
    '',
    payload.storageLocation,
    payload.remarks || '',
  ]]);

  sheet
    .getRange(nextAsset.row, 7)
    .setNumberFormat('yyyy-mm-dd');
  sheet
    .getRange(nextAsset.row, APP.firstDataColumn + 4)
    .setNumberFormat('#,##0.###')
    .setHorizontalAlignment('right');
}

function ensureAuditLogSpreadsheet_(
  assetSpreadsheet,
  photoRoot
) {
  const properties = PropertiesService.getScriptProperties();
  const configuredId = properties.getProperty(
    'AUDIT_LOG_SPREADSHEET_ID'
  );
  let spreadsheet = null;

  if (configuredId) {
    try {
      spreadsheet = SpreadsheetApp.openById(configuredId);
    } catch (error) {
      properties.deleteProperty('AUDIT_LOG_SPREADSHEET_ID');
    }
  }

  const root = getRootFolderFromPhoto_(photoRoot);

  if (!spreadsheet) {
    const candidates = [];
    let files = root.getFilesByName(APP.logSpreadsheetName);
    if (!files.hasNext()) {
      files = root.getFilesByName(APP.legacyLogSpreadsheetName);
    }

    while (files.hasNext()) {
      const file = files.next();

      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        candidates.push(file);
      }
    }

    if (candidates.length > 1) {
      throw new Error(
        '자산관리 로그 파일이 여러 개입니다.'
      );
    }

    if (candidates.length === 1) {
      spreadsheet = SpreadsheetApp.openById(
        candidates[0].getId()
      );
    } else {
      spreadsheet = SpreadsheetApp.create(
        APP.logSpreadsheetName
      );
      DriveApp.getFileById(spreadsheet.getId()).moveTo(root);
    }
  }

  if (spreadsheet.getId() === assetSpreadsheet.getId()) {
    throw new Error(
      '자산대장과 로그 파일은 서로 달라야 합니다.'
    );
  }

  spreadsheet.setName(APP.logSpreadsheetName);
  spreadsheet.setSpreadsheetTimeZone(APP.timeZone);
  const sheet = ensureAuditLogSheet_(spreadsheet);

  properties.setProperty(
    'AUDIT_LOG_SPREADSHEET_ID',
    spreadsheet.getId()
  );

  return {
    spreadsheet: spreadsheet,
    sheet: sheet,
  };
}

function getRootFolderFromPhoto_(photoRoot) {
  const parents = photoRoot.getParents();

  return parents.hasNext() ? parents.next() : photoRoot;
}

function ensureAuditLogSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(APP.logSheetName);

  if (!sheet) {
    const sheets = spreadsheet.getSheets();

    if (
      sheets.length === 1 &&
      sheets[0].getLastRow() === 0
    ) {
      sheet = sheets[0];
      sheet.setName(APP.logSheetName);
    } else {
      sheet = spreadsheet.insertSheet(APP.logSheetName);
    }
  }

  const headers = [[
    '로그ID',
    '처리일시',
    '작업자 입력명',
    '작업구분',
    '관리번호',
    '시트명',
    '행번호',
    '변경사유',
    '변경 전 내용',
    '변경 후 내용',
    '품목',
    '구입처',
    '금액(원)',
    '사진폴더명',
    '사진폴더URL',
    '송장수',
    '발주서수',
    '세금계산서수',
    '실물사진수',
    '이전해시',
    '현재해시',
  ]];

  if (sheet.getLastRow() === 0) {
    sheet
      .getRange(1, 1, 1, APP.logColumnCount)
      .setValues(headers)
      .setFontWeight('bold')
      .setBackground('#E8EAED')
      .setFontColor('#202124');
    sheet.setFrozenRows(1);
    sheet.getRange('A:U').setVerticalAlignment('middle');
    sheet.setColumnWidth(1, 230);
    sheet.setColumnWidth(2, 145);
    sheet.setColumnWidth(3, 120);
    sheet.setColumnWidth(4, 100);
    sheet.setColumnWidth(5, 90);
    sheet.setColumnWidth(6, 110);
    sheet.setColumnWidth(7, 70);
    sheet.setColumnWidth(8, 220);
    sheet.setColumnWidth(9, 360);
    sheet.setColumnWidth(10, 360);
    sheet.setColumnWidth(14, 240);
    sheet.setColumnWidth(15, 280);
    sheet.setColumnWidth(20, 300);
    sheet.setColumnWidth(21, 300);
  }

  protectSheetForHumans_(
    sheet,
    '프로그램 전용 추가 기록'
  );
  return sheet;
}

function protectSheetForHumans_(sheet, description) {
  const protections = sheet.getProtections(
    SpreadsheetApp.ProtectionType.SHEET
  );
  let protection = protections.length
    ? protections[0]
    : sheet.protect();

  protection.setDescription(description);
  protection.setWarningOnly(false);

  const editors = protection.getEditors();

  editors.forEach(function (user) {
    try {
      protection.removeEditor(user);
    } catch (error) {
      console.warn(error);
    }
  });

  if (protection.canDomainEdit()) {
    protection.setDomainEdit(false);
  }
}

function createAssetSnapshot_(
  managementNumber,
  payload,
  assetFolder,
  fileCounts
) {
  return {
    managementNumber: Number(managementNumber),
    itemName: payload.itemName,
    modelMaker: payload.modelMaker || '-',
    vendor: payload.vendor,
    amount: payload.amount === '' ? '' : payload.amount,
    purchaseDate: payload.purchaseDate,
    manager: payload.manager || '-',
    partNumber: '',
    storageLocation: payload.storageLocation,
    remarks: payload.remarks || '',
    folderName: assetFolder ? assetFolder.getName() : '',
    folderUrl: assetFolder ? assetFolder.getUrl() : '',
    fileCounts: {
      invoice: Number(fileCounts.invoice || 0),
      purchaseOrder: Number(fileCounts.purchaseOrder || 0),
      taxInvoice: Number(fileCounts.taxInvoice || 0),
      product: Number(fileCounts.product || 0),
    },
    missingPhotos: {
      invoice:
        Number(fileCounts.invoice || 0) === 0,
      purchaseOrder:
        Number(fileCounts.purchaseOrder || 0) === 0,
      taxInvoice:
        Number(fileCounts.taxInvoice || 0) === 0,
    },
  };
}

function appendAuditLog_(audit, event) {
  if (!audit || !audit.sheet) {
    throw new Error('자산관리 로그 연결이 필요합니다.');
  }

  const sheet = audit.sheet;
  const row = sheet.getLastRow() + 1;
  const logId = Utilities.getUuid();
  const processedAt = Utilities.formatDate(
    new Date(),
    APP.timeZone,
    'yyyy-MM-dd HH:mm:ss'
  );
  const previousHash = row > 2
    ? String(
        sheet.getRange(row - 1, 21).getDisplayValue() || ''
      )
    : 'GENESIS';
  const afterValues = event.afterValues || {};
  const counts = afterValues.fileCounts ||
    (event.beforeValues && event.beforeValues.fileCounts) ||
    emptyCategoryCounts_();
  const canonical = {
    logId: logId,
    processedAt: processedAt,
    author: event.author,
    eventType: event.eventType,
    managementNumber: Number(event.managementNumber),
    sheetName: event.sheetName,
    row: Number(event.row),
    reason: event.reason || '',
    beforeValues: event.beforeValues || null,
    afterValues: event.afterValues || null,
    previousHash: previousHash,
  };
  const currentHash = computeAuditHash_(canonical);

  sheet.getRange(row, 1, 1, APP.logColumnCount)
    .setValues([[
      logId,
      processedAt,
      event.author,
      event.eventType,
      Number(event.managementNumber),
      event.sheetName,
      Number(event.row),
      event.reason || '',
      event.beforeValues
        ? JSON.stringify(event.beforeValues)
        : '',
      event.afterValues
        ? JSON.stringify(event.afterValues)
        : '',
      afterValues.itemName || '',
      afterValues.vendor || '',
      afterValues.amount === undefined
        ? ''
        : afterValues.amount,
      afterValues.folderName || '',
      afterValues.folderUrl || '',
      Number(counts.invoice || 0),
      Number(counts.purchaseOrder || 0),
      Number(counts.taxInvoice || 0),
      Number(counts.product || 0),
      previousHash,
      currentHash,
    ]]);
  sheet.getRange(row, 2).setNumberFormat(
    'yyyy-mm-dd hh:mm:ss'
  );

  SpreadsheetApp.flush();
  return logId;
}

function computeAuditHash_(value) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(value),
    Utilities.Charset.UTF_8
  );

  return bytes.map(function (byte) {
    const unsigned = byte < 0 ? byte + 256 : byte;
    return ('0' + unsigned.toString(16)).slice(-2);
  }).join('');
}

function setupAssetManagementSystem_() {
  const configured = discoverAndConfigureSystem_();
  const context = getContextWithAutoDiscovery_(
    true,
    APP.sheetName
  );
  const migration = migrateLegacyHistory_(
    context.spreadsheet,
    context.audit
  );

  return {
    ok: true,
    configured: configured,
    migration: migration,
    verification: verifySystemState_(
      context,
      false
    ),
  };
}

function migrateLegacyHistory_(assetSpreadsheet, audit) {
  const sheet = assetSpreadsheet.getSheetByName(
    APP.legacyHistorySheetName
  );

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      migrated: 0,
      status: '기존 등록이력 없음',
    };
  }

  const propertyKey = 'LEGACY_HISTORY_MIGRATED_' +
    assetSpreadsheet.getId();
  const properties = PropertiesService.getScriptProperties();

  if (properties.getProperty(propertyKey) === '1') {
    return {
      migrated: 0,
      status: '이미 이관됨',
    };
  }

  const rowCount = sheet.getLastRow() - 1;
  const values = sheet.getRange(
    2,
    1,
    rowCount,
    13
  ).getDisplayValues();
  let migrated = 0;

  values.forEach(function (row) {
    const managementNumber = Number(
      String(row[1] || '').trim()
    );

    if (!managementNumber) {
      return;
    }

    let assetRow = 0;

    try {
      assetRow = findAssetRow_(
        assetSpreadsheet.getSheetByName(APP.sheetName),
        managementNumber
      );
    } catch (error) {
      assetRow = 0;
    }

    appendAuditLog_(
      audit,
      {
        eventType: '기존등록 이관',
        author: cleanText_(row[2], 40) || '미기재',
        sheetName: APP.sheetName,
        row: assetRow,
        managementNumber: managementNumber,
        reason: '기존 등록이력 이관',
        beforeValues: null,
        afterValues: {
          managementNumber: managementNumber,
          itemName: row[4] || '',
          modelMaker: '',
          vendor: row[5] || '',
          amount: normalizeLegacyAmount_(row[6]),
          purchaseDate: '',
          manager: '',
          partNumber: '',
          storageLocation: '',
          remarks: '',
          folderName: row[7] || '',
          folderUrl: row[8] || '',
          fileCounts: {
            invoice: Number(row[9] || 0),
            purchaseOrder: Number(row[10] || 0),
            taxInvoice: Number(row[11] || 0),
            product: Number(row[12] || 0),
          },
        },
      }
    );
    migrated += 1;
  });

  protectSheetForHumans_(
    sheet,
    '별도 로그 파일로 이관된 기존 기록'
  );
  sheet.hideSheet();
  properties.setProperty(propertyKey, '1');

  return {
    migrated: migrated,
    status: '이관 완료',
  };
}

function normalizeLegacyAmount_(value) {
  const text = String(value || '')
    .replace(/,/g, '')
    .trim();
  return /^\d+$/.test(text) ? Number(text) : '';
}

function finalizeReadOnlyAccess_() {
  const context = getContextWithAutoDiscovery_(
    true,
    APP.sheetName
  );
  const root = getRootFolderFromPhoto_(context.photoRoot);
  const targets = [
    {
      name: root.getName(),
      id: root.getId(),
    },
    {
      name: context.photoRoot.getName(),
      id: context.photoRoot.getId(),
    },
    {
      name: context.spreadsheet.getName(),
      id: context.spreadsheet.getId(),
    },
    {
      name: context.audit.spreadsheet.getName(),
      id: context.audit.spreadsheet.getId(),
    },
  ];

  protectAllSheets_(
    context.spreadsheet,
    '자산관리 프로그램 전용 수정'
  );
  protectAllSheets_(
    context.audit.spreadsheet,
    '자산관리 프로그램 전용 로그 추가'
  );
  ensureAnyoneWithLinkViewer_(
    context.audit.spreadsheet.getId()
  );

  const permissionChanges = [];

  targets.forEach(function (target) {
    const changes = downgradeEditorsToViewers_(target.id);

    changes.forEach(function (change) {
      permissionChanges.push(
        target.name + ': ' + change
      );
    });
  });

  return verifySystemState_(
    context,
    true,
    permissionChanges
  );
}

function ensureAnyoneWithLinkViewer_(fileId) {
  const response = Drive.Permissions.list(
    fileId,
    {
      fields: 'permissions(id,type,role)',
    }
  );
  const anyonePermissions = (
    response.permissions || []
  ).filter(function (permission) {
    return permission.type === 'anyone';
  });

  if (anyonePermissions.length === 0) {
    Drive.Permissions.create(
      {
        type: 'anyone',
        role: 'reader',
      },
      fileId,
      {
        fields: 'id,type,role',
      }
    );
    return;
  }

  anyonePermissions.forEach(function (permission) {
    if (permission.role !== 'reader') {
      Drive.Permissions.update(
        {
          role: 'reader',
        },
        fileId,
        permission.id,
        {
          fields: 'id,type,role',
        }
      );
    }
  });
}

function protectAllSheets_(spreadsheet, description) {
  spreadsheet.getSheets().forEach(function (sheet) {
    protectSheetForHumans_(sheet, description);
  });
}

function downgradeEditorsToViewers_(fileId) {
  const response = Drive.Permissions.list(
    fileId,
    {
      fields:
        'permissions(id,type,role,emailAddress,displayName,' +
        'permissionDetails(inherited))'
    }
  );
  const changes = [];

  (response.permissions || []).forEach(function (permission) {
    const inherited = (
      permission.permissionDetails || []
    ).some(function (detail) {
      return detail.inherited;
    });

    if (
      inherited ||
      permission.role !== 'writer' &&
      permission.role !== 'fileOrganizer' &&
      permission.role !== 'organizer'
    ) {
      return;
    }

    Drive.Permissions.update(
      {
        role: 'reader',
      },
      fileId,
      permission.id,
      {
        fields: 'id,role',
      }
    );
    changes.push(
      permission.emailAddress ||
      permission.displayName ||
      permission.type
    );
  });

  return changes;
}

function verifySystemState_(
  context,
  requireLocked,
  permissionChanges
) {
  const root = getRootFolderFromPhoto_(context.photoRoot);
  const holdingFolders = collectChildFoldersByName_(
    root,
    APP.captureHoldingFolderName
  );
  const assetProtections = context.spreadsheet.getSheets()
    .map(function (sheet) {
      return {
        sheetName: sheet.getName(),
        protected: sheet.getProtections(
          SpreadsheetApp.ProtectionType.SHEET
        ).some(function (protection) {
          return !protection.isWarningOnly();
        }),
      };
    });
  const logProtections =
    context.audit.spreadsheet.getSheets()
      .map(function (sheet) {
        return {
          sheetName: sheet.getName(),
          protected: sheet.getProtections(
            SpreadsheetApp.ProtectionType.SHEET
          ).some(function (protection) {
            return !protection.isWarningOnly();
          }),
        };
      });
  const hashVerification = verifyAuditHashChain_(
    context.audit.sheet
  );
  const locked = assetProtections.every(function (item) {
    return item.protected;
  }) && logProtections.every(function (item) {
    return item.protected;
  });

  if (requireLocked && !locked) {
    throw new Error('자산대장 또는 로그 보호가 누락되었습니다.');
  }

  return {
    ok: true,
    rootFolderName: root.getName(),
    photoFolderName: context.photoRoot.getName(),
    captureHoldingFolderCount: holdingFolders.length,
    captureHoldingFolderName:
      holdingFolders.length === 1
        ? holdingFolders[0].getName()
        : '',
    assetSpreadsheetName: context.spreadsheet.getName(),
    logSpreadsheetName:
      context.audit.spreadsheet.getName(),
    logSpreadsheetUrl:
      context.audit.spreadsheet.getUrl(),
    assetProtections: assetProtections,
    logProtections: logProtections,
    hashVerification: hashVerification,
    permissionChanges: permissionChanges || [],
  };
}

function verifyAuditHashChain_(sheet) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return {
      ok: true,
      rows: 0,
    };
  }

  const values = sheet.getRange(
    2,
    1,
    lastRow - 1,
    APP.logColumnCount
  ).getDisplayValues();
  let expectedPreviousHash = 'GENESIS';

  for (let index = 0; index < values.length; index += 1) {
    const row = values[index];
    const canonical = {
      logId: row[0],
      processedAt: row[1],
      author: row[2],
      eventType: row[3],
      managementNumber: Number(row[4]),
      sheetName: row[5],
      row: Number(row[6]),
      reason: row[7],
      beforeValues: row[8] ? JSON.parse(row[8]) : null,
      afterValues: row[9] ? JSON.parse(row[9]) : null,
      previousHash: row[19],
    };
    const expectedHash = computeAuditHash_(canonical);

    if (
      row[19] !== expectedPreviousHash ||
      row[20] !== expectedHash
    ) {
      return {
        ok: false,
        rows: values.length,
        brokenAtRow: index + 2,
      };
    }

    expectedPreviousHash = row[20];
  }

  return {
    ok: true,
    rows: values.length,
  };
}

function createCategoryFolders_(assetFolder) {
  const folders = {};

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    folders[key] = assetFolder.createFolder(
      CATEGORY_MAP[key].folderName
    );
  });

  return folders;
}

function saveFiles_(
  categoryFolders,
  fileGroups,
  author,
  managementNumber,
  itemName,
  startingCounts
) {
  const counts = {
    invoice: 0,
    purchaseOrder: 0,
    taxInvoice: 0,
    product: 0,
  };

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const files = fileGroups[key] || [];

    files.forEach(function (file, index) {
      const bytes = Utilities.base64Decode(file.base64);
      const extension = getFileExtension_(
        file.name,
        file.mimeType
      );
      const safeFileName = makeStoredFileName_(
        managementNumber,
        itemName,
        key,
        Number(startingCounts && startingCounts[key] || 0) + index + 1,
        extension
      );
      const blob = Utilities.newBlob(
        bytes,
        file.mimeType,
        safeFileName
      );
      const driveFile = categoryFolders[key].createFile(blob);

      driveFile.setDescription(
        '작성자: ' + author + '\n' +
        '등록일시: ' +
        Utilities.formatDate(
          new Date(),
          APP.timeZone,
          'yyyy-MM-dd HH:mm:ss'
        )
      );

      counts[key] += 1;
    });
  });

  return counts;
}

function normalizePayload_(request) {
  const source = request || {};
  const files = source.files || {};
  const missingPhotos = source.missingPhotos || {};
  const sheetName = cleanText_(source.sheetName, 100);

  return {
    sheetName: sheetName,
    author: cleanText_(source.author, 40),
    itemName: cleanText_(source.itemName, 100),
    modelMaker: cleanText_(source.modelMaker, 150),
    vendor: cleanText_(source.vendor, 100),
    amount: normalizeAmount_(source.amount),
    purchaseDate: cleanText_(source.purchaseDate, 10),
    manager: getSiteManager_(sheetName),
    partNumber: '',
    storageLocation: cleanText_(
      source.storageLocation,
      100
    ),
    remarks: cleanText_(source.remarks, 500),
    files: {
      invoice: normalizeFiles_(files.invoice),
      purchaseOrder: normalizeFiles_(files.purchaseOrder),
      taxInvoice: normalizeFiles_(files.taxInvoice),
      product: normalizeFiles_(files.product),
    },
    missingPhotos: {
      invoice: missingPhotos.invoice === true,
      purchaseOrder: missingPhotos.purchaseOrder === true,
      taxInvoice: missingPhotos.taxInvoice === true,
    },
    captureSession: {
      sessionId: cleanText_(
        source.captureSession &&
        source.captureSession.sessionId,
        80
      ),
      token: cleanText_(
        source.captureSession &&
        source.captureSession.token,
        160
      ),
    },
  };
}

function validatePayload_(payload) {
  const required = [
    ['자산 관리 목록표', payload.sheetName],
    ['작성자', payload.author],
    ['품목', payload.itemName],
    ['구입처', payload.vendor],
    ['구입일자', payload.purchaseDate],
    ['보관 장소', payload.storageLocation],
  ];

  required.forEach(function (entry) {
    if (!entry[1]) {
      throw new Error(entry[0] + ' 항목을 입력하세요.');
    }
  });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.purchaseDate)) {
    throw new Error('구입일자 형식이 올바르지 않습니다.');
  }

  let totalBytes = 0;

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const files = payload.files[key];

    if (files.length > APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 최대 ' +
        APP.maxFilesPerCategory +
        '개까지 등록할 수 있습니다.'
      );
    }

    files.forEach(function (file) {
      const byteLength = validateImageFile_(file);

      if (byteLength > APP.maxFileBytes) {
        throw new Error(
          '사진 한 장은 8MB를 넘을 수 없습니다.'
        );
      }

      totalBytes += byteLength;
    });
  });

  if (totalBytes > APP.maxTotalBytes) {
    throw new Error(
      '전체 사진 용량은 25MB를 넘을 수 없습니다.'
    );
  }
}

function validateImageFile_(file) {
  const mimeType = String(file && file.mimeType || '')
    .toLowerCase();

  if (!IMAGE_MIME_TYPES[mimeType]) {
    throw new Error('이미지 파일만 등록할 수 있습니다.');
  }

  let bytes = null;

  try {
    bytes = Utilities.base64Decode(
      String(file && file.base64 || '')
    );
  } catch (error) {
    throw new Error('이미지 파일을 읽을 수 없습니다.');
  }

  if (!isSupportedImageBytes_(bytes, mimeType)) {
    throw new Error(
      '실제 이미지 파일만 등록할 수 있습니다.'
    );
  }

  return bytes.length;
}

function isSupportedImageBytes_(bytes, mimeType) {
  const values = Array.prototype.map.call(
    bytes || [],
    function (value) {
      return Number(value) & 255;
    }
  );
  const type = IMAGE_MIME_TYPES[
    String(mimeType || '').toLowerCase()
  ];

  if (!type) {
    return false;
  }

  if (type === 'jpeg') {
    return values.length >= 3 &&
      values[0] === 0xFF &&
      values[1] === 0xD8 &&
      values[2] === 0xFF;
  }

  if (type === 'png') {
    const signature = [
      0x89, 0x50, 0x4E, 0x47,
      0x0D, 0x0A, 0x1A, 0x0A,
    ];
    return signature.every(function (value, index) {
      return values[index] === value;
    });
  }

  if (type === 'gif') {
    return bytesToAscii_(values, 0, 6) === 'GIF87a' ||
      bytesToAscii_(values, 0, 6) === 'GIF89a';
  }

  if (type === 'webp') {
    return bytesToAscii_(values, 0, 4) === 'RIFF' &&
      bytesToAscii_(values, 8, 4) === 'WEBP';
  }

  if (type === 'heif') {
    const brand = bytesToAscii_(values, 8, 4);
    return bytesToAscii_(values, 4, 4) === 'ftyp' &&
      [
        'heic',
        'heix',
        'hevc',
        'hevx',
        'mif1',
        'msf1',
        'avif',
      ].indexOf(brand) >= 0;
  }

  return false;
}

function bytesToAscii_(bytes, start, length) {
  return bytes.slice(start, start + length)
    .map(function (value) {
      return String.fromCharCode(value);
    })
    .join('');
}

function normalizeFiles_(files) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map(function (file) {
    return {
      name: cleanText_(file && file.name, 160),
      mimeType: cleanText_(
        file && file.mimeType,
        80
      ).toLowerCase(),
      base64: String(file && file.base64 || '')
        .replace(/\s/g, ''),
    };
  }).filter(function (file) {
    return file.base64;
  });
}

function normalizeAmount_(value) {
  const text = String(value == null ? '' : value)
    .replace(/,/g, '')
    .trim();

  if (!text) {
    return '';
  }

  if (!/^\d+$/.test(text)) {
    throw new Error('금액은 숫자로 입력하세요.');
  }

  return Number(text);
}

function amountToSheetUnit_(amountInWon) {
  if (amountInWon === '') {
    return '-';
  }

  return Number(amountInWon) / 1000;
}

function amountFromSheetUnit_(amountInThousands) {
  if (
    amountInThousands === '' ||
    amountInThousands === '-' ||
    amountInThousands == null
  ) {
    return '';
  }

  const value = Number(
    String(amountInThousands).replace(/,/g, '')
  );

  return Number.isFinite(value)
    ? Math.round(value * 1000)
    : '';
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function makeAssetFolderName_(
  managementNumber,
  vendor,
  itemName
) {
  return [
    String(managementNumber),
    sanitizeFolderPart_(vendor),
    sanitizeFolderPart_(itemName),
  ].join('_').slice(0, 180);
}

function makeStoredFileName_(
  managementNumber,
  itemName,
  categoryKey,
  sequence,
  extension
) {
  const itemPart = sanitizeFolderPart_(itemName)
    .replace(/\s+/g, '');
  const categoryPart = categoryKey === 'product'
    ? ''
    : '_' + CATEGORY_MAP[categoryKey].filePrefix;

  return [
    String(managementNumber),
    itemPart,
  ].join('_') +
    categoryPart +
    '_' + pad2_(sequence) +
    '.' + String(extension || 'jpg').toLowerCase();
}

function sanitizeFolderPart_(value) {
  return cleanText_(value, 80)
    .replace(/[\\/:*?"<>|#%{}~&]/g, '_')
    .replace(/[. ]+$/g, '')
    .replace(/_+/g, '_') || '미입력';
}

function getFileExtension_(name, mimeType) {
  const match = String(name || '').match(/\.([A-Za-z0-9]{2,5})$/);

  if (match) {
    return match[1].toLowerCase();
  }

  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };

  return extensions[mimeType] || 'jpg';
}

function estimateBase64Bytes_(base64) {
  const text = String(base64 || '');
  const padding = text.endsWith('==') ? 2 :
    text.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor(text.length * 3 / 4) - padding);
}

function collectFoldersByName_(name) {
  const folders = [];
  const iterator = DriveApp.getFoldersByName(name);

  while (iterator.hasNext()) {
    folders.push(iterator.next());
  }

  return folders;
}

function collectChildFoldersByName_(parent, name) {
  const folders = [];
  const iterator = parent.getFoldersByName(name);

  while (iterator.hasNext()) {
    folders.push(iterator.next());
  }

  return folders;
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}

function safeErrorMessage_(error) {
  const message = String(
    error && error.message ? error.message : error
  );

  console.error(error && error.stack ? error.stack : message);

  if (/권한|permission|access denied/i.test(message)) {
    return 'Google Drive 또는 Sheets 권한을 확인하세요.';
  }

  return message.slice(0, 240);
}
