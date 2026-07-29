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
    sanitizeFolderPart_,
    makeAssetFolderName_,
    estimateBase64Bytes_,
    getFileExtension_,
    getNextAssetPosition_,
    getContextWithAutoDiscovery_,
    getPublicWebAppUrl_,
    getMobileBridgeUrl_,
    assertTargetRowEmpty_,
    pad2_,
  };`,
  context,
);

const api = context.__test;

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
assert.equal(api.normalizeAmount_("1,234,000"), 1234000);
assert.equal(api.normalizeAmount_(""), "");
assert.equal(api.estimateBase64Bytes_("aGVsbG8="), 5);
assert.equal(api.getFileExtension_("photo.jpeg", "image/jpeg"), "jpeg");
assert.equal(api.getFileExtension_("photo", "image/png"), "png");
assert.equal(api.pad2_(3), "03");
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
  ["69"],
  ["70"],
  ["71"],
  [""],
];
const mockSheet = {
  getLastRow() {
    return 10;
  },
  getRange(row, column, rowCount, columnCount) {
    return {
      getDisplayValues() {
        if (columnCount === 1) {
          return managementValues.slice(0, rowCount);
        }
        return [[...Array(columnCount)].map(() => "")];
      },
    };
  },
};

assert.deepEqual(
  JSON.parse(JSON.stringify(
    api.getNextAssetPosition_(mockSheet),
  )),
  {
    managementNumber: 72,
    row: 10,
    previousAssetRow: 9,
  },
);
assert.doesNotThrow(
  () => api.assertTargetRowEmpty_(mockSheet, 10),
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
  () => api.assertTargetRowEmpty_(occupiedSheet, 10),
  /기존 내용/,
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
context.discoverAndConfigureSystem = () => {
  discoveryCalls += 1;
};

assert.equal(
  api.getContextWithAutoDiscovery_(false).connected,
  true,
);
assert.equal(discoveryCalls, 1);

const validPayload = api.normalizePayload_({
  author: " 이은범 ",
  itemName: "노트북",
  vendor: "테스트 상사",
  purchaseDate: "2026-07-29",
  storageLocation: "고색연구소",
  files: {
    product: [{
      name: "asset.jpg",
      mimeType: "image/jpeg",
      base64: "aGVsbG8=",
    }],
  },
});

assert.doesNotThrow(() => api.validatePayload_(validPayload));
assert.equal(validPayload.author, "이은범");
assert.equal(validPayload.files.product.length, 1);

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

assert.throws(
  () => api.validateRegistrationFiles_(
    noProductFiles,
    null,
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
        product: 1,
      },
      totalBytes: 5,
    },
  ),
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

console.log("BACKEND_TESTS_OK=1");
