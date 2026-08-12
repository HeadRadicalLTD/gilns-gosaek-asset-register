import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const portal = fs.readFileSync(
  new URL("../google_apps_script/Portal.html", import.meta.url),
  "utf8",
);
const access = fs.readFileSync(
  new URL("../google_apps_script/Access.html", import.meta.url),
  "utf8",
);
const backend = fs.readFileSync(
  new URL("../google_apps_script/Code.gs", import.meta.url),
  "utf8",
);
const departmentAccess = fs.readFileSync(
  new URL("../google_apps_script/DepartmentAccess.html", import.meta.url),
  "utf8",
);

[
  '?module=asset',
  '?module=visitor',
  '?module=employee',
  '자산관리',
  '외부 방문객 관리',
  '부서 출입 관리',
].forEach((needle) => {
  assert.ok(
    portal.includes(needle),
    `missing portal contract: ${needle}`,
  );
});

[
  'data-access-type="<?= accessType ?>"',
  'data-web-app-url="<?= webAppUrl ?>"',
  'id="entryForm"',
  'id="processedBy"',
  'id="openCount"',
  'id="records"',
  'id="ledgerLink"',
  'id="visitorQrCard"',
  'id="visitorQrCode"',
  'id="visitorMobileLink"',
  'id="exitProcessedBy"',
  '?module=visitor&mode=checkin',
  'renderVisitorQr()',
  'loadConfig(true)',
  'loading: false',
  'id="employeeRosterLink"',
  'id="employeeNameList"',
  'id="employeeMatchText"',
  '.processEmployeeAttendance({',
  '.getAccessPublicConfig(TYPE, ADMIN_TOKEN)',
  '.registerAccessEntry(payload)',
  '.completeAccessExit({',
  '입장 등록',
  '퇴장 처리',
  'id="applicationCard"',
  'id="applications"',
  'id="applicationProcessedBy"',
  'id="applicationFilter"',
  '방문객을 한 명씩 승인 또는 반려',
  'data-action="approve">승인',
  'data-action="reject">반려',
  '승인 취소',
  '.processVisitorApplicationDecision(payload)',
].forEach((needle) => {
  assert.ok(
    access.includes(needle),
    `missing access contract: ${needle}`,
  );
});

const scripts = [
  ...access.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);

assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));
const departmentScripts = [
  ...departmentAccess.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);
assert.equal(departmentScripts.length, 1);
assert.doesNotThrow(() => new vm.Script(departmentScripts[0]));
assert.match(access, /button\s*\{\s*cursor:\s*pointer;/);
assert.match(access, /button:disabled\s*\{\s*cursor:\s*not-allowed;/);

assert.match(
  backend,
  /createTemplateFromFile\(\s*'Portal'/,
);
assert.match(
  backend,
  /createTemplateFromFile\(\s*'Index'/,
);
assert.match(
  backend,
  /createTemplateFromFile\(\s*'Access'/,
);
assert.match(
  backend,
  /'visitor-checkin',\s*'VisitorMobile'/,
);
assert.match(backend, /accessMode === 'self'/);
assert.match(backend, /accessMode === 'checkin'/);
assert.match(backend, /function registerAccessEntry\(/);
assert.match(backend, /function registerVisitorSelfEntry\(/);
assert.match(backend, /function getVisitorSelfConfig\(/);
assert.match(backend, /function completeAccessExit\(/);
assert.match(backend, /function processEmployeeAttendance\(/);
assert.match(backend, /function ensureEmployeeRosterSheet_\(/);
assert.match(backend, /function findEmployeeFromRoster_\(/);
assert.match(backend, /function findOpenEmployeeRecord_\(/);
assert.match(backend, /function appendAccessAuditLog_\(/);
assert.match(backend, /'방문신청번호', '방문객ID', '반입물품'/);
assert.match(
  backend,
  /function completeAccessExit[\s\S]*?eventType: '퇴장처리'/,
);
assert.match(
  backend,
  /function registerApprovedVisitorEntry[\s\S]*?eventType: '승인방문객입장'/,
);
assert.match(backend, /function processVisitorApplicationDecision\(/);
assert.match(backend, /function listVisitorApplications_\(/);
assert.match(backend, /createTemplateFromFile\(\s*'DepartmentAccess'/);
assert.match(backend, /function getDepartmentAccessConfig\(/);
assert.match(backend, /function createDepartmentAccessRequest\(/);
assert.match(backend, /function processDepartmentAccessDecision\(/);
assert.match(
  backend,
  /processDepartmentAccessDecision[\s\S]*?'employeeEntry'/,
);
assert.ok(departmentAccess.includes('우리 부서 승인 요청'));
assert.match(backend, /canApprove: !isMine && isTargetDepartmentMember/);
assert.ok(departmentAccess.includes('등록자의 신청을 확인'));
assert.doesNotMatch(access, /선택 제외 후 부분 승인|전체 승인|전체 반려/);

console.log("ACCESS_TESTS_OK=1");
