import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (name) => fs.readFileSync(
  new URL(`../google_apps_script/${name}`, import.meta.url),
  "utf8",
);
const code = read("Code.gs");
const access = read("Access.html");
const visitor = read("VisitorApplication.html");
const movement = read("AssetMovement.html");
const department = read("DepartmentAccess.html");
const info = read("InfoAssets.html");
const physical = read("Index.html");

new vm.Script(code);
[access, visitor, movement, department, info].forEach((html) => {
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gi)];
  assert.equal(scripts.length, 1);
  assert.doesNotThrow(() => new vm.Script(scripts[0][1]));
});

assert.ok(visitor.includes('id="lookupName"'));
assert.ok(visitor.includes('대표 방문객의 이름과 연락처'));
assert.ok(!visitor.includes('id="lookupNumber"'));
assert.match(code, /function findVisitorApplicationsByRepresentative_\(/);

assert.ok(access.includes('방문객을 한 명씩 승인 또는 반려'));
assert.ok(access.includes('data-action="approve">승인'));
assert.ok(access.includes('data-action="reject">반려'));
assert.doesNotMatch(access, /선택 제외 후 부분 승인|전체 승인|전체 반려/);
assert.match(code, /eventType = action === 'approve'[\s\S]*?'방문객승인'/);
assert.match(code, /return '일부 승인·일부 반려'/);

assert.match(code, /securityClasses: Object\.freeze\(\[[\s\S]*?'공개', '사내한', '대외비', '고객기밀'/);
assert.match(code, /requireValueInList\(INFO_ASSET\.securityClasses\.slice\(\), true\)/);
assert.match(code, /current === '사내'[\s\S]*?return \['사내한'\]/);
assert.match(code, /current === '기밀' \|\| current === '중요기밀'[\s\S]*?return \['고객기밀'\]/);
assert.match(code, /spreadsheet\.setSpreadsheetTimeZone\(APP\.timeZone\)/);
assert.match(code, /logSpreadsheet\.setSpreadsheetTimeZone\(APP\.timeZone\)/);
assert.ok(info.includes('id="assetName"'));
assert.ok(info.includes("addEventListener('input',scheduleCatalogSearch)"));
assert.ok(info.includes("searchInfoAssetCatalog(query,ADMIN_TOKEN)"));
['originalNumber', 'identifier', 'networkIdentifier'].forEach((id) => {
  assert.ok(!info.includes(`id="${id}"`));
});
assert.ok(!info.includes('id="catalogQuery"'));
assert.ok(!info.includes('id="catalogSearchButton"'));
assert.ok(!info.includes('<label for="originalNumber">기존번호</label>'));
assert.ok(!info.includes('식별번호·계정명'));
assert.ok(!info.includes('네트워크 식별정보'));
assert.match(code, /columnCount: 24/);
assert.ok(info.includes('id="serialNumber"'));
assert.ok(info.includes('<select id="owner"'));
assert.ok(physical.includes('id="serialNumber"'));
assert.ok(physical.includes('managerOptionsBySite'));
assert.ok(physical.includes('renderManagerOptionsForSheet(sheetName)'));
assert.match(
  code,
  /'관리번호', '자산구분', '자산유형', '자산명\(용도\)', '모델명\/제품명',[\s\S]*?'S\/N'[\s\S]*?'금액\(천원\)', '비고'/,
);
assert.match(
  code,
  /'관리번호', '자산분류', '보안등급', '자산구분',[\s\S]*?'모델·버전', 'S\/N'[\s\S]*?'최종수정시각', '비고'/,
);
assert.match(code, /'등록시각', '최종수정시각', '비고'/);
assert.match(code, /function ensureInfoAssetLeanSchema_\(/);
assert.match(code, /function ensureInfoAssetFreeTextLocation_\(/);
assert.match(code, /INFO_ASSET_COL\.location[\s\S]*?clearDataValidations\(\)/);
assert.match(code, /function clearInfoAssetDataRangeByColumn_\(/);
assert.match(
  code,
  /function formatInfoAssetRow_\([\s\S]*?for \(let column = 1;[\s\S]*?sheet\.getRange\(row, column\)/,
);
assert.match(
  code,
  /function syncInformationDepartmentSheets_\([\s\S]*?clearInfoAssetDataRangeByColumn_\(/,
);
const accessEntryBlock = code.slice(
  code.indexOf('function registerAccessEntry('),
  code.indexOf('function registerVisitorSelfEntry('),
);
const infoRegisterBlock = code.slice(
  code.indexOf('function registerInfoAsset('),
  code.indexOf('function updateInfoAsset('),
);
const physicalRegisterBlock = code.slice(
  code.indexOf('function registerAsset('),
  code.indexOf('function getAssetForEdit('),
);
const physicalUpdateBlock = code.slice(
  code.indexOf('function updateAsset('),
  code.indexOf('function getPhysicalAssetSheetMeta_('),
);
assert.match(
  infoRegisterBlock,
  /targetRange\.setValues\(values\);[\s\S]*?copyInfoAssetRowFormat_\(system\.ledger, row\);/,
);
assert.ok(accessEntryBlock.includes('targetRange.clearContent()'));
assert.ok(!accessEntryBlock.includes('clearInfoAssetDataRangeByColumn_'));
assert.ok(infoRegisterBlock.includes('clearInfoAssetDataRangeByColumn_'));
assert.match(code, /function syncPhysicalIntegratedAssetRow_\(/);
assert.match(code, /function syncInformationDepartmentSheetRow_\(/);
assert.match(code, /function formatInfoAssetDateFields_\([\s\S]*?INFO_ASSET_COL\.introducedDate, 1, 2[\s\S]*?'yyyy-mm-dd'/);
assert.match(physicalRegisterBlock, /syncPhysicalIntegratedAssetRow_\(/);
assert.equal((physicalRegisterBlock.match(/syncPhysicalIntegratedSheet_\(/g) || []).length, 1);
assert.match(physicalUpdateBlock, /syncPhysicalIntegratedAssetRow_\(/);
assert.doesNotMatch(physicalUpdateBlock, /syncPhysicalIntegratedSheet_\(/);
assert.match(infoRegisterBlock, /syncInformationDepartmentSheetRow_\(/);
assert.doesNotMatch(infoRegisterBlock, /syncInformationDepartmentSheets_\(/);

[
  'cleanupTestVisitorApplicationsOnce_',
  'ensureProfessorApplicationRecord_',
  'cleanupVisitorLedgerTestRowsOnce_',
  'normalizeVisitorLedgerFinalRows_',
  'seedVisitorLedgerReferenceRows_',
].forEach((unsafeFunction) => assert.ok(!code.includes(unsafeFunction)));
assert.doesNotMatch(code, /성덕환|2026-08-12T/);

assert.match(code, /canApprove: !isMine && isTargetDepartmentMember/);
assert.match(code, /processDepartmentAccessDecision[\s\S]*?'employeeEntry'/);
assert.ok(department.includes('우리 부서 승인 요청'));

assert.ok(movement.includes('id="assetSearch"'));
assert.ok(movement.includes('id="managementNumber" type="hidden"'));
assert.ok(movement.includes('반출입 대장 열기'));
assert.match(code, /function searchAssetsForMovement\(/);
assert.match(code, /function listMovementPendingForApprover_\(/);
assert.match(code, /해당 부서 실장만 반출 신청을 승인·반려할 수 있습니다/);
assert.match(code, /const movementStatus = '승인 대기'/);
assert.match(code, /MOVEMENT_APPROVER_RANKS = Object\.freeze\(\['LM', 'BM', 'ES'\]\)/);
assert.match(code, /function isSiteManagerFor_\([\s\S]*?isMovementApproverRank_\(employee\.rank\)/);
assert.ok(movement.includes('id="requestPageLink"'));
assert.ok(movement.includes('id="managePageLink"'));
assert.ok(movement.includes("const MANAGEMENT_VIEW = document.body.dataset.movementView === 'manage'"));

assert.match(code, /visitor-application-schema-v92/);
assert.match(code, /access-ledger-schema-v95/);
assert.match(code, /employee-roster-name-map-v1[\s\S]*?21600/);

console.log("WORKFLOW_UPGRADE_TESTS_OK=1");
