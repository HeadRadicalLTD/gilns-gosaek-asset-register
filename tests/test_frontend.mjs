import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(
  new URL("../google_apps_script/Index.html", import.meta.url),
  "utf8",
);

assert.ok(!html.includes('for="partNumber"'));
assert.ok(!html.includes("valueOf('partNumber')"));

const scripts = [
  ...html.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);

assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

[
  'id="author"',
  'placeholder="로그인한 사용자"',
  'readonly',
  'id="authorNameList"',
  'id="authorMatchText"',
  'class="field-label-row"',
  'class="field-meta"',
  'id="sheetName"',
  'id="itemName"',
  'id="vendor"',
  'id="purchaseDate"',
  'id="storageLocation"',
  'id="remarks"',
  'id="invoice"',
  'id="purchaseOrder"',
  'id="taxInvoice"',
  'id="product"',
  'id="invoiceMissing"',
  'id="purchaseOrderMissing"',
  'id="taxInvoiceMissing"',
  '사진 없음',
  '최소 3장을 넣어주세요',
  'id="connectPhoneButton"',
  'id="qrCode"',
  'id="registerModeButton"',
  'id="editModeButton"',
  'id="editManagementNumber"',
  'id="editAssetQuery"',
  'id="editSearchResults"',
  'id="editReason"',
  'id="sheetStepBadge"',
  'id="lookupStepBadge"',
  'id="basicStepBadge"',
  'id="photoStepBadge"',
  'id="assetSheetLink"',
  ".createCaptureSession(ADMIN_TOKEN)",
  ".getCaptureSessionStatus(",
  ".registerAsset(payload)",
  ".getAssetForEdit(",
  ".searchAssetsForEdit(",
  ".updateAsset(updatePayload)",
  "deletePhotoFileIds: {}",
  "function populateExistingPhotos(",
  "function toggleExistingPhotoDeletion(",
  "function openPhotoEditor(",
  "config.manager || ''",
  "config.minProductPhotos",
  "config.employees",
  "getAuthorMatches(valueOf('author')).length === 1",
  "missingPhotos: {",
  "DOCUMENT_KEYS.every",
  "requiredFieldsReady",
  "missingProductCount",
  "모든 필수 항목이 확인되어 등록할 수 있습니다.",
  ".getPublicConfig(sheetName, ADMIN_TOKEN)",
  "config.assetSheetUrl",
].forEach((needle) => {
  assert.ok(
    html.includes(needle),
    `missing frontend contract: ${needle}`,
  );
});

assert.ok(
  !html.includes('기존 자산 수정은 관리자만 할 수 있습니다.'),
  'registrar must be allowed to edit an existing asset',
);

assert.ok(
  !html.includes("showError('관리번호를 입력하세요.')"),
  'registrar edit lookup must not require direct management-number input',
);

assert.ok(
  html.indexOf('id="sheetStepBadge"') <
    html.indexOf('id="editLookupCard"'),
  "sheet selection must appear before asset lookup",
);

assert.ok(
  !html.includes("<svg"),
  "inline SVG is not allowed",
);

assert.ok(
  !html.includes('data-capture-key='),
  "cancelled per-category capture buttons remain",
);

assert.ok(
  !html.includes("remotePhotoCount > 0"),
  "phone completion must not gate registration",
);

console.log("FRONTEND_TESTS_OK=1");
