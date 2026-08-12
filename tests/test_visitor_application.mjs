import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const application = fs.readFileSync(
  new URL("../google_apps_script/VisitorApplication.html", import.meta.url),
  "utf8",
);
const backend = fs.readFileSync(
  new URL("../google_apps_script/Code.gs", import.meta.url),
  "utf8",
);

const scripts = [...application.matchAll(/<script>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1]);
assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

[
  'id="applicationForm"',
  'id="visitorList"',
  'id="addVisitor"',
  'id="privacyConsent"',
  'id="companionConsent"',
  'id="lookupForm"',
  'id="lookupName"',
  'const state = { ready: true',
  'function getKoreanToday()',
  '사원 명부에서 해당 이름을 찾을 수 없습니다.',
  '.validateVisitorHostName(name)',
  '.createVisitorApplication(payload)',
  '.getVisitorApplicationStatus(payload)',
  '.cancelVisitorApplication({ applicationNumber:',
].forEach((needle) => assert.ok(application.includes(needle), needle));

[
  /function getVisitorApplicationConfig\(/,
  /function validateVisitorHostName\(/,
  /function createVisitorApplication\(/,
  /function getVisitorApplicationStatus\(/,
  /function cancelVisitorApplication\(/,
  /function normalizeVisitorApplicationRequest_\(/,
  /function ensureVisitorApplicationSheet_\(/,
  /function getEmployeeRosterNameMapCached_\(/,
  /createTextFinder\(applicationNumber\)/,
  /function normalizeStoredVisitorPhone_\(/,
  /function repairVisitorPhoneStorageOnce_\(/,
  /setNumberFormat\('@'\)/,
  /visitorApplicationSheetName:\s*'외부 방문 신청대장'/,
  /visitorRetentionYears:\s*5/,
  /'승인 대기'/,
  /'일부 승인·일부 반려'/,
  /function findVisitorApplicationsByRepresentative_\(/,
  /'신청 취소'/,
  /'승인 취소'/,
].forEach((pattern) => assert.match(backend, pattern));

const storedPhoneFunction = backend.match(
  /function normalizeStoredVisitorPhone_\([\s\S]*?\n}\n/,
);
assert.ok(storedPhoneFunction);
const phoneSandbox = {};
vm.runInNewContext(storedPhoneFunction[0], phoneSandbox);
assert.equal(
  phoneSandbox.normalizeStoredVisitorPhone_(1012345678),
  "01012345678",
);
assert.equal(
  phoneSandbox.normalizeStoredVisitorPhone_("010-1234-5678"),
  "01012345678",
);
assert.equal(
  phoneSandbox.normalizeStoredVisitorPhone_(101234567),
  "0101234567",
);

console.log("VISITOR_APPLICATION_TESTS_OK=1");
