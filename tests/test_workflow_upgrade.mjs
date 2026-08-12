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
assert.match(code, /current === '기밀'[\s\S]*?return \['고객기밀'\]/);

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

assert.match(code, /visitor-application-schema-v92/);
assert.match(code, /access-ledger-schema-v92/);
assert.match(code, /employee-roster-name-map-v1[\s\S]*?21600/);

console.log("WORKFLOW_UPGRADE_TESTS_OK=1");
