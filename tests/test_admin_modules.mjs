import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (name) => fs.readFileSync(
  new URL(`../google_apps_script/${name}`, import.meta.url),
  "utf8",
);

const login = read("AdminLogin.html");
const landing = read("Landing.html");
const visitorQr = read("VisitorQr.html");
const visitorPublic = read("VisitorPublic.html");
const visitorApplication = read("VisitorApplication.html");
const portal = read("Portal.html");
const movement = read("AssetMovement.html");
const info = read("InfoAssets.html");
const requests = read("ManagementRequests.html");
const audit = read("AuditLogs.html");
const departmentAccess = read("DepartmentAccess.html");
const sharedBackground = read("SharedBackground.html");
const companyLogo = read("CompanyLogo.html");
const backend = read("Code.gs");

function assertInlineScriptsParse(source, name) {
  const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1]);
  assert.ok(scripts.length >= 1, `${name} has no inline script`);
  scripts.forEach((script) => {
    assert.doesNotThrow(() => new vm.Script(script), `${name} script`);
  });
}

assertInlineScriptsParse(login, "AdminLogin");
assertInlineScriptsParse(visitorQr, "VisitorQr");
assertInlineScriptsParse(visitorApplication, "VisitorApplication");
assertInlineScriptsParse(portal, "Portal");
assertInlineScriptsParse(movement, "AssetMovement");
assertInlineScriptsParse(info, "InfoAssets");
assertInlineScriptsParse(requests, "ManagementRequests");
assertInlineScriptsParse(audit, "AuditLogs");
assertInlineScriptsParse(departmentAccess, "DepartmentAccess");
assertInlineScriptsParse(sharedBackground, "SharedBackground");

[
  ".adminLogin(",
  "actorName",
  "id=\"loginSuccess\"",
  "id=\"portalLink\"",
  "data-role=\"registrar\"",
  "data-role=\"admin\"",
  "target=\"_top\"",
  "처음 페이지로 돌아가기",
].forEach((needle) => assert.ok(login.includes(needle)));
assert.ok(!login.includes("if (savedToken)"));
assert.ok(login.includes("<title>길앤에스 로그인</title>"));
assert.ok(login.includes("<?!= getCompanyLogoHtml_() ?>"));

[
  "외부 방문",
  "?module=visitor&amp;mode=portal",
  "?module=login",
  "GIL&amp;S",
].forEach((needle) => assert.ok(landing.includes(needle)));
assert.ok(landing.includes("<h2>로그인</h2>"));
assert.ok(!landing.includes("<h2>관리자 로그인</h2>"));
assert.ok(landing.includes("<?!= getCompanyLogoHtml_() ?>"));
assert.ok(companyLogo.includes("data:image/png;base64,iVBOR"));
[
  "01 · VISITOR",
  "02 · ADMIN",
  "방문객 등록 또는 관리자 업무를 선택하세요",
  "QR 코드를 띄워 외부 방문객이",
  "실물·정보자산과 출입 기록을 관리하는 관리자 화면",
].forEach((needle) => assert.ok(!landing.includes(needle)));

[
  "gilns-ambient-background",
  "@keyframes gilns-drift-one",
  "prefers-reduced-motion",
].forEach((needle) => assert.ok(sharedBackground.includes(needle)));
assert.ok(!sharedBackground.includes('google.script.history.replace'));

[
  "Landing.html",
  "AdminLogin.html",
  "Portal.html",
  "Index.html",
  "Capture.html",
  "VisitorMobile.html",
  "VisitorQr.html",
  "VisitorPublic.html",
  "VisitorApplication.html",
  "AssetMovement.html",
  "InfoAssets.html",
  "Access.html",
  "ManagementRequests.html",
  "AuditLogs.html",
  "DepartmentAccess.html",
].forEach((name) => {
  assert.ok(read(name).includes("<?!= getSharedBackgroundHtml_() ?>"));
});

[
  "방문 신청",
  "방문객 등록",
  "?module=visitor&amp;mode=apply",
  "?module=visitor&amp;mode=qr",
].forEach((needle) => assert.ok(visitorPublic.includes(needle)));

[
  "id=\"applicationForm\"",
  "id=\"lookupForm\"",
  "id=\"hostMessage\"",
  ".validateVisitorHostName(name)",
  ".createVisitorApplication(payload)",
  ".getVisitorApplicationStatus(payload)",
  "id=\"lookupName\"",
  ".cancelVisitorApplication({ applicationNumber:",
].forEach((needle) => assert.ok(visitorApplication.includes(needle)));

[
  "id=\"visitorQr\"",
  "data-visitor-url=\"<?= visitorSelfUrl ?>\"",
  "new QRCode(target",
].forEach((needle) => assert.ok(visitorQr.includes(needle)));

[
  "실물자산관리",
  "정보자산관리",
  "외부 방문객 관리",
  "부서 출입 관리",
  "물품 반출입",
  "adminToken=<?= adminToken ?>",
  "id=\"passwordForm\"",
  "처음 페이지",
  ".changeAdminPassword(ADMIN_TOKEN, current, next)",
].forEach((needle) => assert.ok(portal.includes(needle)));

[
  "id=\"checkoutForm\"",
  "id=\"managementNumber\"",
  ".getAssetMovementConfig(ADMIN_TOKEN)",
  ".registerAssetCheckout(payload)",
  ".processAssetCheckoutDecision({",
  ".returnCheckedOutAsset({",
  "id=\"pendingRecords\"",
].forEach((needle) => assert.ok(movement.includes(needle)));

[
  "맨 위로 돌아가기",
  "gilns-job-toggle",
  "hero.appendChild(nav)",
].forEach((needle) => assert.ok(sharedBackground.includes(needle)));
assert.ok(!sharedBackground.includes("document.body.appendChild(nav)"));

[
  "id=\"assetForm\"",
  "id=\"securityClass\"",
  "비밀번호, 인증키, 복구코드",
  ".getInfoAssetConfig(ADMIN_TOKEN)",
  "runner.registerInfoAsset(request)",
  "runner.updateInfoAsset(request)",
].forEach((needle) => assert.ok(info.includes(needle)));

[
  'id="assetSheet"',
  'id="assetQuery"',
  'id="assetResults"',
  'id="adminEditCard"',
  'id="adminAssetQuery"',
  '.searchAssetsForEdit(sheet,query,ADMIN_TOKEN)',
  'mode=edit&sheet=',
  '등록자 요청 관리',
].forEach((needle) => assert.ok(requests.includes(needle)));
assert.ok(!requests.includes('실물자산 사진 정정'));
assert.ok(!requests.includes('placeholder="예: 52, IA-0007, 출입기록 ID"'));

[
  /function getSharedBackgroundHtml_\(/,
  /function getCompanyLogoHtml_\(/,
  /createTemplateFromFile\(\s*'Landing'/,
  /createTemplateFromFile\(\s*'AdminLogin'/,
  /'visitor-qr',\s*'VisitorQr'/,
  /'visitor-portal',\s*'VisitorPublic'/,
  /'visitor-application',\s*'VisitorApplication'/,
  /createTemplateFromFile\(\s*'AssetMovement'/,
  /createTemplateFromFile\(\s*'InfoAssets'/,
  /function adminLogin\(/,
  /function getSessionRole_\(/,
  /function normalizeUserRole_\(/,
  /function changeAdminPassword\(/,
  /function requireAdminSession_\(/,
  /function registerAssetCheckout\(/,
  /function returnCheckedOutAsset\(/,
  /function registerInfoAsset\(/,
  /function updateInfoAsset\(/,
  /function searchAssetsForEdit\(/,
  /function applyAssetPhotoChanges_\(/,
  /function registerManagementRequest\(/,
  /function processManagementRequest\(/,
  /function getAuditLogConfig\(/,
  /function getDepartmentAccessConfig\(/,
  /function createDepartmentAccessRequest\(/,
  /function processDepartmentAccessDecision\(/,
  /function executeManagementDeletion\(/,
  /function appendManagedLog_\(/,
].forEach((pattern) => assert.match(backend, pattern));

[
  "'화성1공장': '김한영'",
  "'화성2공장': '임현구'",
  "'화성2공장(조립실)': '임현구'",
  "'고색연구소': '이장명'",
  'manager: getSiteManager_(sheetName)',
  'asset.manager = getSiteManager_(context.sheet.getName())',
].forEach((needle) => assert.ok(backend.includes(needle)));
assert.ok(!backend.includes("'실물자산 사진 정정'"));

assert.doesNotMatch(backend, /rlfdosdptm[12]!/);
assert.match(backend, /registrarInitialPasswordHash/);
assert.match(backend, /adminInitialPasswordHash/);
assert.ok(portal.includes('data-user-role="<?= userRole ?>"'));
assert.ok(info.includes('data-user-role="<?= userRole ?>"'));
assert.ok(info.includes("runner.updateInfoAsset(request)"));

console.log("ADMIN_MODULE_TESTS_OK=1");
