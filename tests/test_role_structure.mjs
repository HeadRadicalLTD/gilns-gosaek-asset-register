import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const read = (name) => fs.readFileSync(
  new URL(`../google_apps_script/${name}`, import.meta.url),
  "utf8",
);

const code = read("Code.gs");
const portal = read("Portal.html");
const login = read("AdminLogin.html");
const requests = read("ManagementRequests.html");
const audit = read("AuditLogs.html");
const info = read("InfoAssets.html");

for (const [name, source] of [
  ["ManagementRequests", requests],
  ["AuditLogs", audit],
  ["InfoAssets", info],
]) {
  const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/gi)]
    .map((match) => match[1]);
  assert.ok(scripts.length, `${name} inline script missing`);
  scripts.forEach((script) => assert.doesNotThrow(
    () => new vm.Script(script),
    `${name} inline script`,
  ));
}

assert.match(code, /const ROLE_CAPABILITIES = Object\.freeze/);
assert.match(code, /registrar:[\s\S]*?assetEdit: true/);
assert.match(code, /admin:[\s\S]*?requestManage: true/);
const registrarCapabilities = code.match(
  /registrar: Object\.freeze\(\{[\s\S]*?\}\),\s*admin:/,
)[0];
assert.doesNotMatch(registrarCapabilities, /infoManage/);
assert.match(registrarCapabilities, /visitorManage: true/);
assert.doesNotMatch(registrarCapabilities, /movementManage/);
assert.doesNotMatch(registrarCapabilities, /auditRead/);
assert.match(registrarCapabilities, /movementRequest: true/);
assert.match(code, /function processAssetCheckoutDecision\(/);
assert.match(code, /function getSessionInfo_\(/);
assert.match(code, /actorName: actor\.name/);
assert.match(code, /sessionPrefix: 'ADMIN_SESSION_V3_'/);
assert.match(code, /sessionSeconds: 2 \* 60 \* 60/);
assert.match(code, /function registerManagementRequest\(/);
assert.match(code, /function processManagementRequest\(/);
assert.match(code, /function getAuditLogConfig\(/);
assert.match(code, /function updateInfoAsset\(/);
assert.match(code, /'사원입장등록'/);
assert.match(code, /'사원퇴장처리'/);
assert.doesNotMatch(code, /출근|퇴근/);

assert.ok(login.includes('id="actorName"'));
assert.ok(login.includes("actorName"));
assert.ok(portal.includes("module=requests"));
assert.ok(portal.includes("module=audit"));
assert.ok(portal.includes("실물자산 등록·수정"));
assert.ok(portal.includes("정보자산 등록"));
assert.ok(portal.includes("외부 방문객 등록"));
assert.ok(portal.includes("부서 출입 신청"));
assert.ok(portal.includes("물품 반출입 신청"));
assert.ok(portal.includes("userRole === 'admin'"));
assert.ok(requests.includes("관리자에게 요청"));
assert.ok(audit.includes("읽기 전용"));
assert.ok(info.includes("정보자산 수정"));
[
  'id="adminModeCard"',
  'id="registerModeButton"',
  'id="editModeButton"',
  'id="editLookupCard"',
  'class="form-section edit-only hidden"',
  "const nextMode=IS_ADMIN&&mode==='edit'?'edit':'register'",
  "if(isEdit){runner.updateInfoAsset(request);}else{runner.registerInfoAsset(request);}",
  '등록할 시트를 선택하세요',
  'id="sheetSelectionCard"',
  '<select id="department" disabled>',
  '<select id="user" disabled>',
  "renderUserOptions(record.user||'');",
].forEach((needle) => assert.ok(
  info.includes(needle),
  `InfoAssets role/mode separation missing: ${needle}`,
));
assert.match(
  code,
  /departments:\s*\[\s*'고색연구소',\s*'화성1공장',\s*'화성2공장',\s*'화성2공장\(조립실\)'/,
);
assert.match(
  code,
  /validationRange\.clearDataValidations\(\);[\s\S]*?range\.setValues\(values\);[\s\S]*?validationRange\.setDataValidation\(validation\);/,
);

for (const name of [
  "AdminLogin.html",
  "Portal.html",
  "Index.html",
  "Access.html",
  "AssetMovement.html",
  "InfoAssets.html",
  "ManagementRequests.html",
  "AuditLogs.html",
  "DepartmentAccess.html",
]) {
  assert.ok(
    read(name).includes('name="referrer" content="no-referrer"'),
    `${name} must block referrer leakage`,
  );
}

console.log("ROLE_STRUCTURE_TESTS_OK=1");
