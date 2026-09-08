import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../google_apps_script/Code.gs', import.meta.url), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
const baseUrl = 'https://docs.google.com/spreadsheets/d/test-info-ledger/edit';
const sites = [
  { sheetName: 'L-정보', department: '고색연구소', departmentCode: 'L', id: 1001 },
  { sheetName: 'F1-정보', department: '화성1공장', departmentCode: 'F1', id: 1002 },
  { sheetName: 'F2-정보', department: '화성2공장', departmentCode: 'F2', id: 1003 },
  { sheetName: 'F2-A-정보', department: '화성2공장(조립실)', departmentCode: 'F2-A', id: 1004 },
];
const expectedTarget = ({ sheetName, department, departmentCode, id }) => ({
  sheetName, department, departmentCode, ledgerUrl: `${baseUrl}#gid=${id}`,
});

function spreadsheetWithout(missing = []) {
  const sheets = new Map(sites.filter((site) => !missing.includes(site.sheetName)).map((site) => [
    site.sheetName,
    {
      getName: () => site.sheetName,
      getSheetId: () => site.id,
      getRange() { throw new Error('Department projections must be written through the existing synchronizer.'); },
    },
  ]));
  sheets.set('임의 시트', { getName: () => '임의 시트', getSheetId: () => 3000 });
  return {
    getUrl: () => baseUrl,
    getSheetByName: (name) => sheets.get(name) ?? null,
    getSheets: () => [...sheets.values()],
  };
}

function environment({ missing = [], sessionDepartment = '고색연구소', existingDepartment = '고색연구소' } = {}) {
  const writes = [];
  const permissions = [];
  const observed = { syncCalls: 0, syncRows: [], idDepartments: [], lockReleased: 0, listLimits: [] };
  const spreadsheet = spreadsheetWithout(missing);
  const original = Array(24).fill('');
  original[0] = 'GNS-S-L-001';
  original[4] = existingDepartment;
  original[5] = sites.find((site) => site.department === existingDepartment)?.departmentCode ?? 'L';
  original[6] = '원래 자산';
  original[21] = new Date('2026-01-01T00:00:00Z');
  const ledger = {
    getSheetId: () => 999,
    getLastRow: () => 9,
    getRange(row, column, rowCount = 1, columnCount = 1) {
      return {
        getValues: () => [original.slice(column - 1, column - 1 + columnCount)],
        getDisplayValues: () => [original.slice(column - 1, column - 1 + columnCount).map(String)],
        setValues(values) { writes.push({ row, column, rowCount, columnCount, values: plain(values) }); return this; },
        getSheet: () => ledger,
        getRow: () => row,
        getNumRows: () => rowCount,
      };
    },
  };
  const context = vm.createContext({
    console: { ...console, error() {} },
    SpreadsheetApp: { flush() {} },
    LockService: {
      getScriptLock: () => ({ waitLock() {}, releaseLock() { observed.lockReleased += 1; } }),
    },
  });
  vm.runInContext(code, context);
  context.requireSessionInfo_ = (_token, permission) => {
    permissions.push(permission);
    return { actorName: '관리자', role: 'admin', department: sessionDepartment };
  };
  context.ensureInfoAssetSystem_ = () => ({ spreadsheet, ledger, log: {} });
  const employeeRoster = {};
  context.getAccessSpreadsheetForRead_ = () => ({});
  context.ensureEmployeeRosterSheet_ = () => employeeRoster;
  context.listEmployeeRoster_ = (sheet) => {
    assert.equal(sheet, employeeRoster);
    return [{ employeeNumber: 'GNS-001', name: '테스트 사용자', department: '고색연구소', enabled: true }];
  };
  context.listInfoAssets_ = (_ledger, perDepartmentLimit) => { observed.listLimits.push(perDepartmentLimit); return []; };
  context.getNextInfoAssetId_ = (_ledger, department) => {
    observed.idDepartments.push(department);
    return `GNS-S-${sites.find((site) => site.department === department)?.departmentCode}-002`;
  };
  context.findInfoAssetRow_ = () => 9;
  context.copyInfoAssetRowFormat_ = () => {};
  context.formatInfoAssetRow_ = () => {};
  context.clearInfoAssetDataRangeByColumn_ = () => { writes.push({ rollback: 'clear' }); };
  context.syncInformationDepartmentSheets_ = (actualSpreadsheet, actualLedger) => {
    assert.equal(actualSpreadsheet, spreadsheet);
    assert.equal(actualLedger, ledger);
    observed.syncCalls += 1;
  };
  context.syncInformationDepartmentSheetRow_ = (actualSpreadsheet, actualLedger, row, departmentCode) => {
    assert.equal(actualSpreadsheet, spreadsheet);
    assert.equal(actualLedger, ledger);
    observed.syncRows.push({ row, departmentCode });
  };
  context.appendManagedLog_ = () => {};
  context.getSessionFingerprint_ = () => 'session-fingerprint';
  return { context, spreadsheet, writes, observed, permissions };
}

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}
const request = {
  adminToken: 'test-token', category: 'PC·노트북', assetName: '테스트 정보자산',
  securityClass: '사내한', quantity: '1EA', amount: '5500',
  assetId: 'GNS-S-L-001', reason: '사업장 선택 확인',
};

check('only actual supported department sheets are offered with their own ledger links', () => {
  const { context, spreadsheet } = environment();
  assert.deepEqual(plain(context.getInfoAssetSheetOptions_(spreadsheet)), sites.map(expectedTarget));
  const partial = spreadsheetWithout(['F1-정보', 'F2-A-정보']);
  assert.deepEqual(plain(context.getInfoAssetSheetOptions_(partial)), [sites[0], sites[2]].map(expectedTarget));
  assert.deepEqual(plain(context.getInfoAssetSheetOptions_(spreadsheetWithout(sites.map((site) => site.sheetName)))), []);
});

check('each explicit sheet resolves to its canonical department regardless of the actor default', () => {
  const { context, spreadsheet } = environment();
  for (const site of sites) {
    assert.deepEqual(
      plain(context.resolveInfoAssetTarget_({ sheetName: site.sheetName }, '다른 부서 기본값', spreadsheet)),
      expectedTarget(site),
    );
    assert.deepEqual(
      plain(context.resolveInfoAssetTarget_({ sheetName: site.sheetName, department: site.department }, '', spreadsheet)),
      expectedTarget(site),
    );
  }
});

check('legacy department-only and default-department requests resolve all four sites', () => {
  const { context, spreadsheet } = environment();
  for (const site of sites) {
    assert.deepEqual(plain(context.resolveInfoAssetTarget_({ department: site.department }, '', spreadsheet)), expectedTarget(site));
    assert.deepEqual(plain(context.resolveInfoAssetTarget_({}, site.department, spreadsheet)), expectedTarget(site));
  }
  assert.deepEqual(
    plain(context.resolveInfoAssetTarget_({ department: '화성1공장' }, '고색연구소', spreadsheet)),
    expectedTarget(sites[1]),
    'The submitted legacy department takes precedence over the session default.',
  );
});

check('recognized legacy aliases become canonical site names and matching aliases are accepted', () => {
  const { context, spreadsheet } = environment();
  for (const [alias, site] of [
    ['고색 연구소', sites[0]], ['화성2공장조립실', sites[3]], ['화성2공장 (조립실)', sites[3]],
  ]) {
    assert.deepEqual(plain(context.resolveInfoAssetTarget_({ department: alias }, '', spreadsheet)), expectedTarget(site));
    assert.deepEqual(
      plain(context.resolveInfoAssetTarget_({ sheetName: site.sheetName, department: alias }, '', spreadsheet)),
      expectedTarget(site),
    );
  }
});

check('arbitrary sheets, absent sheets, mismatches, and unknown departments are rejected', () => {
  const { context, spreadsheet } = environment();
  for (const source of [
    { sheetName: '임의 시트' },
    { sheetName: '정보자산(S)' },
    { sheetName: 'L-정보', department: '화성1공장' },
    { sheetName: 'L-정보', department: '알 수 없는 부서' },
    { department: '알 수 없는 부서' },
    { department: '1공장' },
  ]) assert.throws(() => context.resolveInfoAssetTarget_(source, '고색연구소', spreadsheet));
  assert.throws(() => context.resolveInfoAssetTarget_({}, '', spreadsheet));
  assert.throws(() => context.resolveInfoAssetTarget_({}, '알 수 없는 부서', spreadsheet));
  const missing = spreadsheetWithout(['F1-정보']);
  assert.throws(() => context.resolveInfoAssetTarget_({ sheetName: 'F1-정보' }, '', missing));
  assert.throws(() => context.resolveInfoAssetTarget_({ department: '화성1공장' }, '', missing));
  assert.throws(() => context.resolveInfoAssetTarget_({}, '화성1공장', missing));
});

check('public configuration exposes actual sheets while keeping the existing permission requirement', () => {
  const { context, permissions, observed } = environment({ missing: ['F2-정보'] });
  const config = context.getInfoAssetConfig('test-token');
  assert.equal(config.ok, true);
  assert.deepEqual(plain(config.sheets), [sites[0], sites[1], sites[3]].map(expectedTarget));
  assert.equal(config.recordLimit, 200);
  assert.deepEqual(observed.listLimits, [true]);
  assert.deepEqual(permissions, ['infoRegister']);
});

check('per-department listing retains older site assets without changing the legacy global limit', () => {
  const context = vm.createContext({ console });
  vm.runInContext(code, context);
  const makeRow = (site, sequence) => {
    const row = Array(24).fill('');
    row[0] = `GNS-S-${site.departmentCode}-${String(sequence).padStart(3, '0')}`;
    row[4] = site.department;
    row[5] = site.departmentCode;
    row[6] = `${site.department} 자산 ${sequence}`;
    return row;
  };
  const rows = [makeRow(sites[1], 1), ...Array.from({ length: 201 }, (_, index) => makeRow(sites[0], index + 1))];
  const ledger = {
    getLastRow: () => rows.length + 8,
    getRange: (startRow, _column, rowCount) => ({
      getValues: () => rows.slice(startRow - 9, startRow - 9 + rowCount),
    }),
  };
  const scoped = plain(context.listInfoAssets_(ledger, true));
  assert.equal(scoped.length, 201);
  assert.equal(scoped.filter((record) => record.departmentCode === 'L').length, 200);
  assert.equal(scoped.filter((record) => record.departmentCode === 'F1').length, 1);
  assert.equal(scoped.some((record) => record.assetId === 'GNS-S-F1-001'), true);
  assert.equal(scoped.some((record) => record.assetId === 'GNS-S-L-001'), false);
  assert.equal(scoped[0].assetId, 'GNS-S-L-201');
  const legacy = plain(context.listInfoAssets_(ledger));
  assert.equal(legacy.length, 200);
  assert.equal(legacy.every((record) => record.departmentCode === 'L'), true);
  assert.deepEqual(plain(context.listInfoAssets_(ledger, false)), legacy);
});

check('registration stores the selected canonical site then updates only its projection row', () => {
  for (const site of sites) {
    const { context, writes, observed, permissions } = environment({ existingDepartment: site.department });
    const result = context.registerInfoAsset({ ...request, sheetName: site.sheetName });
    assert.equal(result.ok, true);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].values[0][4], site.department);
    assert.equal(writes[0].values[0][5], site.departmentCode);
    assert.equal(writes[0].values[0][6], request.assetName);
    assert.deepEqual(observed.idDepartments, [site.department]);
    assert.deepEqual(observed.syncRows, [{ row: 10, departmentCode: site.departmentCode }]);
    assert.deepEqual(observed.listLimits, [true]);
    assert.deepEqual(permissions, ['infoRegister']);
    assert.equal(observed.lockReleased, 1);
  }
});

check('updates store the selected canonical site and retain the original registration timestamp', () => {
  for (const site of sites) {
    const { context, writes, observed, permissions } = environment({ existingDepartment: site.department });
    const result = context.updateInfoAsset({ ...request, sheetName: site.sheetName });
    assert.equal(result.ok, true);
    assert.equal(writes.length, 1);
    assert.equal(writes[0].values[0][4], site.department);
    assert.equal(writes[0].values[0][5], site.departmentCode);
    assert.equal(writes[0].values[0][21], '2026-01-01T00:00:00.000Z');
    assert.deepEqual(observed.syncRows, [{ row: 9, departmentCode: site.departmentCode }]);
    assert.deepEqual(observed.listLimits, [true]);
    assert.deepEqual(permissions, ['infoManage']);
  }
});

check('legacy registration and update paths still resolve a canonical department', () => {
  for (const operation of ['registerInfoAsset', 'updateInfoAsset']) {
    const { context, writes } = environment();
    const result = context[operation]({ ...request, department: '화성2공장 (조립실)' });
    assert.equal(result.ok, true);
    assert.equal(writes[0].values[0][4], '화성2공장(조립실)');
    assert.equal(writes[0].values[0][5], 'F2-A');
  }
  const registration = environment({ sessionDepartment: '화성2공장' });
  registration.context.registerInfoAsset(request);
  assert.equal(registration.writes[0].values[0][4], '화성2공장');
  const update = environment({ sessionDepartment: '고색연구소', existingDepartment: '화성1공장' });
  update.context.updateInfoAsset(request);
  assert.equal(update.writes[0].values[0][4], '화성1공장', 'An old client edit without a department keeps its existing site.');
});

check('invalid site requests are rejected by registration and updates before any write or rollback', () => {
  for (const operation of ['registerInfoAsset', 'updateInfoAsset']) {
    for (const [source, options] of [
      [{ sheetName: '임의 시트' }, {}],
      [{ sheetName: 'L-정보', department: '화성1공장' }, {}],
      [{ department: '알 수 없는 부서' }, {}],
      [{ sheetName: 'F1-정보' }, { missing: ['F1-정보'] }],
      [{ department: '화성1공장' }, { missing: ['F1-정보'] }],
    ]) {
      const { context, writes, observed } = environment(options);
      assert.throws(() => context[operation]({ ...request, ...source }), `${operation}: ${JSON.stringify(source)}`);
      assert.deepEqual(writes, [], 'Rejecting a bad selection must not cause a row write, including rollback writes.');
      assert.deepEqual(observed.syncRows, []);
    }
  }
});

check('an explicit-sheet edit cannot move an existing asset into another site', () => {
  const { context, writes, observed } = environment({ existingDepartment: '고색연구소' });
  assert.throws(() => context.updateInfoAsset({ ...request, sheetName: 'F1-정보' }));
  assert.deepEqual(writes, []);
  assert.deepEqual(observed.syncRows, []);
});

check('configuration and write endpoints keep authentication failures ahead of all storage changes', () => {
  for (const operation of ['getInfoAssetConfig', 'registerInfoAsset', 'updateInfoAsset']) {
    const { context, writes, observed } = environment();
    context.requireSessionInfo_ = () => { throw new Error('권한 없음'); };
    if (operation === 'getInfoAssetConfig') {
      assert.equal(context[operation]('invalid-token').ok, false);
    } else {
      assert.throws(() => context[operation]({ ...request, sheetName: 'L-정보' }));
    }
    assert.deepEqual(writes, []);
    assert.equal(observed.syncCalls, 0);
  }
});

console.log(`INFO_ASSET_SHEET_SELECTION_TESTS_OK=${passed}`);
