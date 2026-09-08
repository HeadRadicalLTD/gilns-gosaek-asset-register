import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { chromium } from 'file:///C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';

// Local rendered templates and a mocked Apps Script API only. No login, upload,
// Google Sheet access, or other live application mutation occurs in this test.
const infoTemplate = fs.readFileSync(new URL('../google_apps_script/InfoAssets.html', import.meta.url), 'utf8');
const sharedBackground = fs.readFileSync(new URL('../google_apps_script/SharedBackground.html', import.meta.url), 'utf8');
const screenshotDirectory = process.env.INFO_ASSET_UI_SCREENSHOTS === '1'
  ? new URL('../.codex-analysis/info_sheet_ui_20260908/', import.meta.url)
  : null;
if (screenshotDirectory) fs.mkdirSync(screenshotDirectory, { recursive: true });
const sheets = [
  { sheetName: 'L-정보', department: '고색연구소', departmentCode: 'L', ledgerUrl: 'https://docs.google.com/spreadsheets/d/test-only-ledger/edit#gid=101' },
  { sheetName: 'F1-정보', department: '화성1공장', departmentCode: 'F1', ledgerUrl: 'https://docs.google.com/spreadsheets/d/test-only-ledger/edit#gid=201' },
];
const baseRecord = {
  category: 'PC·노트북', assetType: '정보자산 (S)', quantity: '1EA', provider: '테스트 제조사',
  modelVersion: '테스트 모델', serialNumber: 'LOCAL-ONLY', purchasePlace: '테스트 구입처',
  amount: '1500', purchaseDate: '2026-09-08', securityClass: '사내한', status: '사용중',
  introducedDate: '2026-09-08', expiryDate: '2027-01-01', personalData: '아니오', remarks: '',
  registeredAt: '2026-09-08 09:00:00', updatedAt: '2026-09-08 09:00:00',
};
const records = [
  { ...baseRecord, assetId: 'GNS-S-L-001', assetName: '고색연구소 검증 노트북', ...sheets[0], owner: '이장명', user: '테스트 사용자', location: '고색연구소 개발실 A-01' },
  { ...baseRecord, assetId: 'GNS-S-F1-001', assetName: '화성1공장 검증 장비', ...sheets[1], owner: '전관식', user: '테스트 사용자', location: 'https://example.invalid/' + 'long-location-segment-'.repeat(15) },
];
const config = {
  ok: true, ledgerUrl: 'https://docs.google.com/spreadsheets/d/test-only-ledger/edit#gid=1',
  sheets, categories: ['PC·노트북', '서버', '데이터·문서'],
  departments: sheets.map((sheet) => sheet.department), defaultDepartment: '고색연구소',
  managerOptionsByDepartment: { '고색연구소': ['김재웅', '이장명'], '화성1공장': ['김재웅', '전관식'] },
  employees: [
    { name: '김재웅', department: '경영지원' }, { name: '이장명', department: '고색연구소' },
    { name: '전관식', department: '화성1공장' }, { name: '테스트 사용자', department: '고색연구소' },
  ],
  securityClasses: ['공개', '사내한', '대외비'], statuses: ['사용중', '예비', '폐기'], records,
};

function renderTemplate(role) {
  const context = vm.createContext({
    webAppUrl: 'https://info-asset.local.test/app', adminToken: 'local-mock-token',
    userRole: role, actorName: '테스트 등록자', getSharedBackgroundHtml_: () => sharedBackground,
  });
  return infoTemplate.replace(/<\?(!?=)([\s\S]*?)\?>/g, (_match, _marker, expression) => String(vm.runInContext(expression.trim(), context)));
}

async function installMock(page, role, configMode = 'success') {
  await page.addInitScript(({ config, role, configMode }) => {
    window.__infoCalls = [];
    let mockRecords = structuredClone(config.records);
    const makeRunner = (success, failure) => new Proxy({}, {
      get(_target, name) {
        if (name === 'withSuccessHandler') return (handler) => makeRunner(handler, failure);
        if (name === 'withFailureHandler') return (handler) => makeRunner(success, handler);
        return (...args) => {
          window.__infoCalls.push({ method: name, args: structuredClone(args) });
          setTimeout(() => {
            try {
              if (name === 'getInfoAssetConfig') {
                if (configMode === 'rejected') success({ ok: false, message: '모의 대장 접근 실패' });
                else if (configMode === 'transport') failure(new Error('모의 연결 응답 실패'));
                else success({ ...structuredClone(config), ...(configMode === 'empty' ? { sheets: [] } : {}), userRole: role, actorName: '테스트 등록자' });
              } else if (name === 'searchInfoAssetCatalog') {
                success({ results: [] });
              } else if (name === 'registerInfoAsset' || name === 'updateInfoAsset') {
                const request = args[0];
                const sheet = config.sheets.find((item) => item.sheetName === request.sheetName);
                if (!sheet) throw new Error('Mock rejected missing or unknown sheetName');
                if (name === 'updateInfoAsset' && role !== 'admin') throw new Error('Mock rejected registrar edit');
                const assetId = name === 'registerInfoAsset' ? 'GNS-S-' + sheet.departmentCode + '-003' : request.assetId;
                const saved = { ...request, ...sheet, assetId, registeredAt: '2026-09-08 10:00:00', updatedAt: '2026-09-08 10:00:00' };
                mockRecords = mockRecords.filter((item) => item.assetId !== assetId).concat(saved);
                success({ ok: true, assetId, assetName: request.assetName, records: role === 'admin' ? structuredClone(mockRecords) : [] });
              } else {
                throw new Error('Unexpected mock API: ' + String(name));
              }
            } catch (error) {
              if (failure) failure(error);
              else throw error;
            }
          }, 0);
        };
      },
    });
    window.google = { script: { run: makeRunner() } };
  }, { config, role, configMode });
}

const isHidden = (page, selector) => page.locator(selector).evaluate((element) => getComputedStyle(element).display === 'none');
const callsFor = (page, method) => page.evaluate((name) => window.__infoCalls.filter((call) => call.method === name), method);

async function captureUi(page, browserName, width, role, stage) {
  if (!screenshotDirectory || browserName !== 'Chrome' || role !== 'admin') return;
  await page.screenshot({ path: fileURLToPath(new URL(`chrome-${width}-${stage}.png`, screenshotDirectory)), fullPage: true, animations: 'disabled' });
}

async function assertNoOverflow(page, label) {
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth, body: document.body.scrollWidth, root: document.documentElement.scrollWidth,
    escapedControls: [...document.querySelectorAll('input,select,textarea,form button')]
      .filter((element) => element.getClientRects().length && (element.getBoundingClientRect().right > innerWidth + 1 || element.getBoundingClientRect().left < -1))
      .map((element) => element.id),
  }));
  assert.ok(dimensions.body <= dimensions.viewport + 1 && dimensions.root <= dimensions.viewport + 1, label + ': horizontal document overflow ' + JSON.stringify(dimensions));
  assert.deepEqual(dimensions.escapedControls, [], label + ': controls outside viewport');
}

async function verifyScenario(browser, browserName, width, role) {
  const label = `${browserName}-${width}-${role}`;
  const context = await browser.newContext({ viewport: { width, height: 915 }, isMobile: width < 600, hasTouch: width < 600 });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await installMock(page, role);
  await page.route('**/*', (route) => route.request().url().startsWith('https://info-asset.local.test/')
    ? route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: renderTemplate(role) })
    : route.abort());
  try {
    await page.goto('https://info-asset.local.test/' + role, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('#sheetName')?.options.length === 3);
    assert.equal(await page.locator('#sheetName').inputValue(), '', label + ': initially no selected sheet');
    assert.equal(await isHidden(page, '#formCard'), true, label + ': form blocked until sheet selected');
    assert.equal(await isHidden(page, '#editLookupCard'), true, label + ': edit list blocked until sheet selected');
    assert.equal(await page.locator('#submitButton').isDisabled(), true);
    await captureUi(page, browserName, width, role, 'before-sheet');
    await page.evaluate(() => {
      document.querySelector('#category').value = 'PC·노트북';
      saveAsset(new Event('submit'));
      setMode('edit');
    });
    assert.equal((await callsFor(page, 'registerInfoAsset')).length, 0, label + ': missing sheet cannot submit');
    assert.equal(await isHidden(page, '#formCard'), true);
    assert.equal(await isHidden(page, '#editLookupCard'), true);

    await page.locator('#sheetName').selectOption(sheets[0].sheetName);
    await page.evaluate(() => setMode('register'));
    assert.equal(await isHidden(page, '#formCard'), false);
    assert.equal(await page.locator('#department').inputValue(), sheets[0].department);
    assert.equal(await page.locator('#department').isDisabled(), true, label + ': department locked to sheet');
    assert.equal(await page.locator('#departmentCode').inputValue(), sheets[0].departmentCode);
    assert.equal(await page.locator('#ledgerLink').getAttribute('href'), sheets[0].ledgerUrl);
    assert.deepEqual(await page.locator('#owner option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean)), ['김재웅', '이장명']);

    await page.locator('#category').selectOption('PC·노트북');
    await page.locator('#assetName').fill('신규 모의 검증 자산');
    await page.locator('#owner').selectOption('이장명');
    assert.equal(await page.locator('#user').isDisabled(), false, label + ': user enabled after owner selection');
    assert.deepEqual(await page.locator('#user option').evaluateAll((options) => options.map((option) => option.value)), ['미지정', '김재웅', '전관식', '테스트 사용자']);
    await page.locator('#user').selectOption('테스트 사용자');
    await page.locator('#location').fill('고색연구소 개발실 A-02');
    await page.locator('#securityClass').selectOption('사내한');
    await page.locator('#status').selectOption('사용중');
    await assertNoOverflow(page, label);
    await captureUi(page, browserName, width, role, 'selected-sheet');
    assert.equal(await page.locator('#submitButton').isDisabled(), false);
    await page.locator('#submitButton').click();
    await page.waitForFunction(() => document.querySelector('#successMessage').textContent.includes('등록 완료'));
    const registration = await callsFor(page, 'registerInfoAsset');
    assert.equal(registration.length, 1);
    assert.equal(registration[0].args[0].sheetName, sheets[0].sheetName);
    assert.equal(registration[0].args[0].department, sheets[0].department);
    assert.equal(registration[0].args[0].owner, '이장명');
    assert.equal(await page.locator('#sheetName').inputValue(), sheets[0].sheetName, label + ': selected sheet retained after saving');
    assert.equal(await page.locator('#department').inputValue(), sheets[0].department);
    assert.equal(await page.locator('#category').inputValue(), '');
    assert.equal(await page.locator('#submitButton').isDisabled(), true);

    if (role === 'admin') {
      await page.locator('#editModeButton').click();
      assert.equal(await page.locator('#records .edit-button').count(), 2);
      assert.ok(!(await page.locator('#records').innerText()).includes('GNS-S-F1-001'), label + ': edit list limited to selected site');
      await page.locator('#records .edit-button[data-id="GNS-S-L-001"]').click();
      assert.equal(await page.locator('#assetId').inputValue(), 'GNS-S-L-001');
      assert.equal(await page.locator('#location').inputValue(), records[0].location, label + ': existing location retained in edit form');
      assert.equal(await page.locator('#user').inputValue(), records[0].user, label + ': existing roster user retained in edit form');
      await page.locator('#editReason').fill('로컬 모의 수정 검증');
      await page.locator('#location').fill('고색연구소 개발실 A-03');
      await page.locator('#submitButton').click();
      await page.waitForFunction(() => document.querySelector('#successMessage').textContent.includes('수정 완료'));
      const updates = await callsFor(page, 'updateInfoAsset');
      assert.equal(updates.length, 1);
      assert.equal(updates[0].args[0].sheetName, sheets[0].sheetName);
      assert.equal(updates[0].args[0].location, '고색연구소 개발실 A-03');
      assert.equal(updates[0].args[0].expiryDate, '2027-01-01', label + ': editing location retains existing hidden expiry date');
      assert.equal(await page.locator('#sheetName').inputValue(), sheets[0].sheetName);
      await page.locator('#records .edit-button[data-id="GNS-S-L-001"]').click();
      await page.locator('#editReason').fill('전환 시 남으면 안 되는 수정 사유');
      await page.locator('#sheetName').selectOption(sheets[1].sheetName);
      assert.equal(await page.locator('#assetId').inputValue(), '', label + ': sheet switch clears edit selection');
      assert.equal(await page.locator('#editReason').inputValue(), '');
      assert.equal(await page.locator('#department').inputValue(), sheets[1].department);
      assert.equal(await page.locator('#ledgerLink').getAttribute('href'), sheets[1].ledgerUrl);
      assert.deepEqual(await page.locator('#owner option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean)), ['김재웅', '전관식']);
      await page.evaluate(() => setMode('edit'));
      assert.equal(await page.locator('#records .edit-button').count(), 1);
      assert.ok((await page.locator('#records').innerText()).includes('GNS-S-F1-001'));
      assert.ok(!(await page.locator('#records').innerText()).includes('GNS-S-L-001'));
      await page.evaluate(() => startEdit('GNS-S-L-001'));
      assert.equal(await page.locator('#assetId').inputValue(), '', label + ': cross-sheet edit cannot be selected');
      await assertNoOverflow(page, label + '-edit');
    } else {
      assert.equal(await isHidden(page, '#adminModeCard'), true);
      await page.evaluate(() => { setMode('edit'); startEdit('GNS-S-L-001'); });
      assert.equal(await isHidden(page, '#editLookupCard'), true, label + ': registrar cannot enter edit mode');
      assert.equal(await page.locator('#assetId').inputValue(), '');
      assert.equal((await callsFor(page, 'updateInfoAsset')).length, 0);
      assert.equal(await page.locator('#records .edit-button').count(), 0);
    }
    assert.deepEqual(errors, [], label + ': no browser script errors');
    console.log('PASS ' + label);
  } finally {
    await context.close();
  }
}

async function verifyConfigFailures(browser) {
  for (const [configMode, expectedMessage] of [
    ['rejected', '모의 대장 접근 실패'],
    ['transport', '모의 연결 응답 실패'],
    ['empty', '등록 가능한 정보자산 시트가 없습니다'],
  ]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 915 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await installMock(page, 'admin', configMode);
    await page.route('**/*', (route) => route.request().url().startsWith('https://info-asset.local.test/')
      ? route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: renderTemplate('admin') })
      : route.abort());
    try {
      await page.goto('https://info-asset.local.test/config-' + configMode, { waitUntil: 'domcontentloaded' });
      await page.locator('#errorMessage.show').waitFor();
      assert.ok((await page.locator('#errorMessage').innerText()).includes(expectedMessage));
      assert.equal(await page.locator('#systemStatus').innerText(), '정보자산 대장 연결 실패');
      assert.ok((await page.locator('#sheetSelectionHelp').innerText()).includes('대장 연결을 확인'));
      for (const id of ['sheetName', 'submitButton', 'registerModeButton', 'editModeButton']) {
        assert.equal(await page.locator('#' + id).isDisabled(), true, configMode + ': ' + id + ' disabled');
      }
      for (const id of ['formCard', 'editLookupCard', 'ledgerLink']) {
        assert.equal(await isHidden(page, '#' + id), true, configMode + ': ' + id + ' hidden');
      }
      await page.evaluate(() => saveAsset(new Event('submit')));
      assert.equal((await callsFor(page, 'registerInfoAsset')).length, 0);
      assert.equal((await callsFor(page, 'updateInfoAsset')).length, 0);
      assert.deepEqual(errors, []);
      console.log('PASS Chrome-config-' + configMode);
    } finally {
      await context.close();
    }
  }
}

await Promise.all([
  ['Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['Edge', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'],
].map(async ([name, executablePath]) => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    for (const width of [1440, 390]) {
      for (const role of ['admin', 'registrar']) await verifyScenario(browser, name, width, role);
    }
    if (name === 'Chrome') await verifyConfigFailures(browser);
  } finally {
    await browser.close();
  }
}));
console.log('INFO_ASSET_SHEET_BROWSER_OK=11/11 (mock server; no live writes)');
