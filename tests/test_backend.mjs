import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../google_apps_script/Code.gs", import.meta.url),
  "utf8",
);
const manifest = JSON.parse(fs.readFileSync(
  new URL(
    "../google_apps_script/appsscript.json",
    import.meta.url,
  ),
  "utf8",
));

assert.match(source, /Drive\.Files\.create/);
assert.match(source, /function doPost\(event\)/);
assert.match(source, /gilns-mobile-upload/);
assert.match(source, /window\.top\.postMessage/);
assert.doesNotMatch(source, /window\.parent\.postMessage/);
assert.match(source, /Date\.UTC\(/);
assert.match(
  source,
  /Utilities\.formatDate\(\s*new Date\(\),\s*APP\.timeZone,\s*'yyyy-MM-dd HH:mm:ss'/
);
assert.match(source, /XFrameOptionsMode\.ALLOWALL/);
assert.match(
  source,
  /registrarInitialPasswordHash:\s*'2de709e7f01195c813b180daf818361ca107dcc05cf385047810267f35d35b1d'/,
);
assert.match(
  source,
  /adminInitialPasswordHash:\s*'e4a642f6d2967f985c78f3e0cf554145c81c9291255daf077231c2d532515bb6'/,
);
assert.match(source, /REGISTRAR_PASSWORD_HASH_V2/);
assert.match(source, /ADMIN_PASSWORD_HASH_V4/);
assert.match(source, /ADMIN_SESSION_V3_/);
assert.match(
  source,
  /'visitor-checkin',\s*'VisitorMobile'/,
);
assert.match(source, /accessMode === 'self'/);
assert.match(source, /function registerVisitorSelfEntry\(/);
assert.match(source, /function getVisitorSelfConfig\(/);
assert.match(source, /function getAccessSpreadsheetForRead_\(/);
assert.match(source, /function getAccessSystemForUse_\(/);
assert.match(source, /function processEmployeeAttendance\(/);
assert.match(source, /function registerVisitorGroupEntry\(/);
assert.match(source, /function appendAccessAuditLogBatch_\(/);
assert.match(source, /function ensureEmployeeRosterSheet_\(/);
assert.match(source, /function listEmployeeRoster_\(/);
assert.match(source, /function findEmployeeFromRoster_\(/);
assert.match(source, /function validateAssetAuthor_\(/);
assert.match(
  source,
  /function getAssetForEdit[\s\S]*?requireSessionInfo_\(adminToken, 'assetEdit'\);/,
);
assert.match(
  source,
  /function updateAsset[\s\S]*?requireSessionInfo_\([\s\S]*?'assetEdit'[\s\S]*?\);/,
);
assert.match(source, /function findOpenEmployeeRecord_\(/);
assert.equal(
  manifest.dependencies.enabledAdvancedServices[0].serviceId,
  "drive",
);

const context = {
  console,
  Date,
  Object,
  String,
  Number,
  Array,
  Math,
  RegExp,
  Error,
  Utilities: {
    base64Decode(value) {
      return Array.from(Buffer.from(value, "base64"));
    },
    formatDate(value, _timezone, pattern) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      if (pattern === "yyyy-MM-dd") return `${year}-${month}-${day}`;
      return `${year}-${month}-${day}`;
    },
    getUuid() {
      return "11111111-2222-3333-4444-555555555555";
    },
  },
};

vm.createContext(context);
vm.runInContext(
  `${source}
  globalThis.__test = {
    cleanText_,
    normalizeAmount_,
    normalizePayload_,
    validatePayload_,
    validateRegistrationFiles_,
    validateImageFile_,
    isSupportedImageBytes_,
    sanitizeFolderPart_,
    makeAssetFolderName_,
    makeStoredFileName_,
    estimateBase64Bytes_,
    getFileExtension_,
    getNextAssetPosition_,
    getContextWithAutoDiscovery_,
    getSelectableSheetNames_,
    isHistorySheetName_,
    normalizeManagementNumber_,
    normalizePlaceholder_,
    findHeaderColumn_,
    getPublicWebAppUrl_,
    getMobileBridgeUrl_,
    assertTargetRowAvailable_,
    findAssetRow_,
    normalizeAccessType_,
    normalizeAccessPayload_,
    makeAccessRowValues_,
    getAccessNameFromRow_,
    listEmployeeRoster_,
    findEmployeeFromRoster_,
    findOpenEmployeeRecord_,
    normalizeVisitorPhone_,
    cleanVisitorApplicationNumber_,
    normalizeVisitorDecisionReason_,
    getVisitorApplicationOverallStatus_,
    cleanAdminToken_,
    constantTimeEquals_,
    normalizeMovementPayload_,
    getNextInfoAssetId_,
    pad2_,
  };`,
  context,
);

const api = context.__test;

assert.equal(api.cleanAdminToken_('ab-cd_12'), 'abcd12');
assert.equal(api.constantTimeEquals_('same', 'same'), true);
assert.equal(api.constantTimeEquals_('same', 'different'), false);
assert.equal(
  api.normalizeMovementPayload_({
    sheetName: '고색연구소',
    managementNumber: '52',
    borrower: '홍길동',
    department: '개발팀',
    purpose: '시험',
    destination: '시험장',
    expectedReturnDate: '2026-08-10',
    handler: '관리자',
  }).managementNumber,
  52,
);
assert.throws(
  () => api.normalizeMovementPayload_({
    sheetName: '고색연구소',
    managementNumber: '52',
  }),
  /필수항목/,
);

const infoIdSheet = {
  getLastRow() { return 4; },
  getRange() {
    return {
      getDisplayValues() {
        return [['IA-0001'], ['IA-0007'], ['잘못된값']];
      },
    };
  },
};
assert.equal(api.getNextInfoAssetId_(infoIdSheet), 'IA-0008');

const rosterRows = [
  ['E001', '홍길동', '개발팀', '사용'],
  ['E002', '김길동', '영업팀', '미사용'],
  ['', '', '', ''],
];
const rosterSheet = {
  getLastRow() {
    return rosterRows.length + 1;
  },
  getRange() {
    return {
      getDisplayValues() {
        return rosterRows;
      },
    };
  },
};
const employees = api.listEmployeeRoster_(rosterSheet);
assert.equal(employees.length, 1);
assert.equal(employees[0].employeeNumber, 'E001');
assert.equal(employees[0].name, '홍길동');
assert.equal(
  api.findEmployeeFromRoster_(rosterSheet, '홍길동').department,
  '개발팀',
);
assert.throws(
  () => api.findEmployeeFromRoster_(rosterSheet, '없는사원'),
  /사원 명부/,
);

const employeeLedgerRows = [
  ['E-1', '', '', '', '입장중', 'E001', '홍길동'],
  ['E-2', '', '', '', '퇴장완료', 'E002', '김길동'],
];
const employeeLedgerSheet = {
  getLastRow() {
    return employeeLedgerRows.length + 1;
  },
  getRange() {
    return {
      getValues() {
        return employeeLedgerRows;
      },
    };
  },
};
assert.equal(
  api.findOpenEmployeeRecord_(employeeLedgerSheet, 'E001').row,
  2,
);
assert.equal(
  api.findOpenEmployeeRecord_(employeeLedgerSheet, 'E002'),
  null,
);

assert.equal(
  api.sanitizeFolderPart_("㈜테스트/상사:*"),
  "㈜테스트_상사_",
);
assert.equal(
  api.makeAssetFolderName_(
    72,
    "오케이 엔지니어링",
    "니블",
  ),
  "72_오케이 엔지니어링_니블",
);
assert.equal(
  api.makeStoredFileName_(
    72,
    "핸드폰 거치대",
    "invoice",
    1,
    "jpg",
  ),
  "72_핸드폰거치대_송장_01.jpg",
);
assert.equal(
  api.makeStoredFileName_(
    72,
    "핸드폰 거치대",
    "product",
    3,
    "jpg",
  ),
  "72_핸드폰거치대_03.jpg",
);
assert.equal(api.normalizeAmount_("1,234,000"), 1234000);
assert.equal(api.normalizeAmount_(""), "");
assert.equal(api.estimateBase64Bytes_("aGVsbG8="), 5);
assert.equal(api.getFileExtension_("photo.jpeg", "image/jpeg"), "jpeg");
assert.equal(api.getFileExtension_("photo", "image/png"), "png");
assert.equal(api.pad2_(3), "03");
assert.equal(api.isHistorySheetName_("등록이력"), true);
assert.equal(api.isHistorySheetName_("등록 이력"), true);
assert.equal(api.isHistorySheetName_("로그"), true);
assert.equal(api.isHistorySheetName_("고색연구소"), false);
assert.equal(api.normalizeManagementNumber_("72"), 72);
assert.throws(
  () => api.normalizeManagementNumber_("A72"),
  /관리번호/,
);
assert.equal(api.normalizePlaceholder_("-"), "");
assert.equal(api.normalizePlaceholder_("창고"), "창고");
assert.match(source, /logSpreadsheetName: '자산관리 로그'/);
assert.match(
  source,
  /captureHoldingFolderName: '촬영사진 임시보관'/,
);
assert.match(source, /function appendAuditLog_\(/);
assert.match(source, /function updateAsset\(/);
assert.match(source, /function finalizeReadOnlyAccess_\(/);
assert.match(source, /assetSheetUrl:/);
assert.match(source, /context\.sheet\.getSheetId\(\)/);
assert.match(source, /spreadsheetName: '출입관리 대장'/);
assert.match(source, /logSpreadsheetName: '출입관리 로그'/);
assert.match(source, /function registerAccessEntry\(/);
assert.match(source, /function completeAccessExit\(/);
assert.match(source, /function appendAccessAuditLog_\(/);
assert.match(source, /SpreadsheetApp\.BorderStyle\.SOLID/);
assert.equal(api.normalizeAccessType_("visitor"), "visitor");
assert.equal(api.normalizeAccessType_("EMPLOYEE"), "employee");
assert.throws(
  () => api.normalizeAccessType_("unknown"),
  /구분/,
);
const visitorAccess = api.normalizeAccessPayload_({
  accessType: "visitor",
  processedBy: "이은범",
  name: "홍길동",
  organization: "테스트상사",
  visitPurpose: "회의",
  hostName: "담당자",
});
assert.equal(visitorAccess.name, "홍길동");
assert.equal(api.normalizeVisitorPhone_("010-1234-5678"), "01012345678");
assert.throws(() => api.normalizeVisitorPhone_("1234"), /연락처/);
assert.equal(
  api.cleanVisitorApplicationNumber_("va-20260807-a1b2c3d4"),
  "VA-20260807-A1B2C3D4",
);
assert.throws(
  () => api.cleanVisitorApplicationNumber_("VA-BAD"),
  /방문신청번호/,
);
assert.equal(
  api.normalizeVisitorDecisionReason_("방문 목적 불명확", ""),
  "방문 목적 불명확",
);
assert.equal(
  api.normalizeVisitorDecisionReason_("기타", "담당자 확인 필요"),
  "기타: 담당자 확인 필요",
);
assert.throws(
  () => api.normalizeVisitorDecisionReason_("기타", ""),
  /기타 처리 사유/,
);
assert.equal(
  api.getVisitorApplicationOverallStatus_([
    { status: "승인" },
    { status: "반려" },
  ]),
  "일부 승인·일부 반려",
);
assert.equal(
  api.getVisitorApplicationOverallStatus_([
    { status: "승인" },
    { status: "승인 대기" },
  ]),
  "처리 중",
);
assert.equal(
  api.makeAccessRowValues_(
    visitorAccess,
    "V-20260805-TEST",
    new Date("2026-08-05T01:00:00Z"),
  ).length,
  16,
);
assert.equal(
  api.getAccessNameFromRow_(
    api.makeAccessRowValues_(
      visitorAccess,
      "V-20260805-TEST",
      new Date("2026-08-05T01:00:00Z"),
    ),
    "visitor",
  ),
  "홍길동",
);
assert.deepEqual(
  JSON.parse(JSON.stringify(
    api.getSelectableSheetNames_({
      getSheets() {
        return [
          { getName: () => "고색연구소" },
          { getName: () => "등록 이력" },
          { getName: () => "음성공장" },
        ];
      },
    }),
  )),
  ["고색연구소", "음성공장"],
);
assert.equal(
  api.findHeaderColumn_({
    getLastColumn() {
      return 11;
    },
    getRange() {
      return {
        getDisplayValues() {
          return [[
            "",
            "관리번호",
            "품목",
            "모델명",
            "구입처",
            "금액",
            "구입일자",
            "관리자",
            "P/N",
            "보관 장소",
            "비고",
          ]];
        },
      };
    },
  }, "비고"),
  11,
);
assert.match(
  api.getPublicWebAppUrl_(),
  /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/,
);
assert.doesNotMatch(api.getPublicWebAppUrl_(), /\/dev$/);
assert.match(
  api.getMobileBridgeUrl_(),
  /^https:\/\/headradicalltd\.github\.io\//,
);

const managementValues = [
  ["50", "T-체크플러그", "M8", "길앤에스"],
  ["51", "니블", "1/8PT", "오케이"],
  ["52", "", "", ""],
  ["53", "", "", ""],
];
const mockSheet = {
  getLastRow() {
    return 10;
  },
  getRange(row, column, rowCount, columnCount) {
    return {
      getDisplayValues() {
        if (row === 7) {
          return managementValues
            .slice(0, rowCount)
            .map((values) => [
              ...values,
              ...Array(columnCount - values.length).fill(""),
            ]);
        }
        return [[
          "52",
          ...Array(columnCount - 1).fill(""),
        ]];
      },
    };
  },
};

assert.deepEqual(
  JSON.parse(JSON.stringify(
    api.getNextAssetPosition_(mockSheet),
  )),
  {
    managementNumber: 52,
    row: 9,
    previousAssetRow: 8,
  },
);
assert.doesNotThrow(
  () => api.assertTargetRowAvailable_(mockSheet, 9, 52),
);

const occupiedSheet = {
  getRange(_row, _column, _rowCount, columnCount) {
    return {
      getDisplayValues() {
        return [[
          "",
          "기존 메모",
          ...Array(columnCount - 2).fill(""),
        ]];
      },
    };
  },
};

assert.throws(
  () => api.assertTargetRowAvailable_(
    occupiedSheet,
    10,
    52,
  ),
  /기존 내용/,
);

const prefilledOnlySheet = {
  getLastRow() {
    return 10;
  },
  getRange(_row, _column, rowCount, columnCount) {
    return {
      getDisplayValues() {
        return managementValues
          .slice(0, rowCount)
          .map((values) => [
            ...values,
            ...Array(columnCount - values.length).fill(""),
          ]);
      },
    };
  },
};

assert.equal(api.findAssetRow_(prefilledOnlySheet, 51), 8);
assert.throws(
  () => api.findAssetRow_(prefilledOnlySheet, 52),
  /찾을 수 없습니다/,
);

let contextAttempts = 0;
let discoveryCalls = 0;
context.getContext_ = () => {
  contextAttempts += 1;

  if (contextAttempts === 1) {
    throw new Error('시스템 연결이 필요합니다.');
  }

  return { connected: true };
};
context.discoverAndConfigureSystem_ = () => {
  discoveryCalls += 1;
};

assert.equal(
  api.getContextWithAutoDiscovery_(false).connected,
  true,
);
assert.equal(discoveryCalls, 1);

const validPayload = api.normalizePayload_({
  sheetName: "고색연구소",
  author: " 이은범 ",
  itemName: "노트북",
  vendor: "테스트 상사",
  purchaseDate: "2026-07-29",
  storageLocation: "고색연구소",
  remarks: "신규 장비",
  missingPhotos: {
    invoice: true,
    purchaseOrder: true,
    taxInvoice: true,
  },
  files: {
    product: [{
      name: "asset.png",
      mimeType: "image/png",
      base64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB" +
        "CAQAAAC1HAwCAAAAC0lEQVR42mP8/x8A" +
        "AusB9Y9Z0p8AAAAASUVORK5CYII=",
    }],
  },
});

assert.doesNotThrow(() => api.validatePayload_(validPayload));
assert.equal(validPayload.author, "이은범");
assert.equal(validPayload.sheetName, "고색연구소");
assert.equal(validPayload.remarks, "신규 장비");
assert.equal(validPayload.files.product.length, 1);
assert.equal(validPayload.missingPhotos.invoice, true);
assert.equal(context.amountToSheetUnit_(1000000), 1000);
assert.equal(context.amountToSheetUnit_(59900), 59.9);
assert.equal(context.amountToSheetUnit_(""), "-");
assert.equal(context.amountFromSheetUnit_(1000), 1000000);
assert.equal(context.amountFromSheetUnit_(59.9), 59900);
assert.equal(context.amountFromSheetUnit_("-"), "");
assert.equal(
  (source.match(/setHorizontalAlignment\('right'\)/g) || [])
    .length >= 2,
  true,
);
assert.doesNotThrow(
  () => api.validateImageFile_(
    validPayload.files.product[0],
  ),
);

assert.throws(
  () => api.validatePayload_({
    ...validPayload,
    author: "",
  }),
  /작성자/,
);

const noProductFiles = {
  ...validPayload.files,
  product: [],
};
const allDocumentsMissing = {
  invoice: true,
  purchaseOrder: true,
  taxInvoice: true,
};

assert.throws(
  () => api.validateRegistrationFiles_(
    noProductFiles,
    null,
    allDocumentsMissing,
  ),
  /실물 사진/,
);

assert.doesNotThrow(
  () => api.validateRegistrationFiles_(
    noProductFiles,
    {
      counts: {
        invoice: 0,
        purchaseOrder: 0,
        taxInvoice: 0,
        product: 3,
      },
      totalBytes: 5,
      metadata: {
        completedAt: Date.now(),
      },
    },
    allDocumentsMissing,
  ),
);

assert.throws(
  () => api.validateRegistrationFiles_(
    noProductFiles,
    {
      counts: {
        invoice: 0,
        purchaseOrder: 0,
        taxInvoice: 0,
        product: 2,
      },
      totalBytes: 5,
      metadata: {
        completedAt: Date.now(),
      },
    },
    allDocumentsMissing,
  ),
  /최소 3장/,
);

assert.doesNotThrow(
  () => api.validateRegistrationFiles_(
    {
      ...noProductFiles,
      product: [
        validPayload.files.product[0],
        validPayload.files.product[0],
      ],
    },
    {
      counts: {
        invoice: 0,
        purchaseOrder: 0,
        taxInvoice: 0,
        product: 1,
      },
      totalBytes: 5,
      metadata: {
        completedAt: null,
      },
    },
    allDocumentsMissing,
  ),
);

assert.throws(
  () => api.validateRegistrationFiles_(
    {
      ...noProductFiles,
      product: [
        validPayload.files.product[0],
        validPayload.files.product[0],
        validPayload.files.product[0],
      ],
    },
    null,
    {
      invoice: false,
      purchaseOrder: true,
      taxInvoice: true,
    },
  ),
  /송장.*사진 없음을 선택/,
);

assert.throws(
  () => api.validateRegistrationFiles_(
    {
      ...noProductFiles,
      invoice: [validPayload.files.product[0]],
      product: [
        validPayload.files.product[0],
        validPayload.files.product[0],
        validPayload.files.product[0],
      ],
    },
    null,
    allDocumentsMissing,
  ),
  /함께 선택할 수 없습니다/,
);

assert.throws(
  () => api.normalizeAmount_("12만원"),
  /금액은 숫자/,
);

assert.throws(
  () => api.validatePayload_({
    ...validPayload,
    files: {
      ...validPayload.files,
      invoice: [{
        name: "invoice.pdf",
        mimeType: "application/pdf",
        base64: "aGVsbG8=",
      }],
    },
  }),
  /이미지 파일/,
);

assert.throws(
  () => api.validatePayload_({
    ...validPayload,
    files: {
      ...validPayload.files,
      invoice: [{
        name: "fake.jpg",
        mimeType: "image/jpeg",
        base64: "aGVsbG8=",
      }],
    },
  }),
  /실제 이미지 파일/,
);

console.log("BACKEND_TESTS_OK=1");
