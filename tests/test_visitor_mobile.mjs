import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const mobile = fs.readFileSync(
  new URL("../google_apps_script/VisitorMobile.html", import.meta.url),
  "utf8",
);
const backend = fs.readFileSync(
  new URL("../google_apps_script/Code.gs", import.meta.url),
  "utf8",
);

[
  'name="viewport"',
  'id="lookupForm"',
  'id="visitorName"',
  'id="phone"',
  'id="securityConsent"',
  'id="entryButton"',
  'id="visitorDetails"',
  'const state = { ready: true',
  'function initializeForm()',
  '.getVisitorEntryEligibility(credentials)',
  '.registerApprovedVisitorEntry({',
].forEach((needle) => {
  assert.ok(
    mobile.includes(needle),
    `missing visitor mobile contract: ${needle}`,
  );
});

const scripts = [
  ...mobile.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);

assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

assert.match(
  backend,
  /'visitor-checkin',\s*'VisitorMobile'/,
);
assert.match(backend, /moduleName === 'visitor'/);
assert.match(backend, /accessMode === 'self'/);
assert.match(backend, /accessMode === 'checkin'/);
assert.match(backend, /function registerVisitorSelfEntry\(/);
assert.match(backend, /function registerVisitorGroupEntry\(/);
assert.match(backend, /function appendAccessAuditLogBatch_\(/);
assert.match(backend, /accessType:\s*'visitor'/);
assert.match(backend, /function getVisitorSelfConfig\(/);
assert.match(backend, /function getVisitorEntryEligibility\(/);
assert.match(backend, /function registerApprovedVisitorEntry\(/);
assert.match(backend, /function findEligibleVisitorByNamePhone_\(/);

console.log("VISITOR_MOBILE_TESTS_OK=1");
