import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../google_apps_script/Code.gs', import.meta.url), 'utf8');
const clone = (value) => structuredClone(value);

class Sheet {
  constructor(name = '대장') {
    this.name = name;
    this.cells = new Map();
    this.heights = new Map();
    this.heightWrites = [];
    this.heightReads = [];
    this.formatCopies = [];
  }
  cell(row, column) {
    const key = `${row},${column}`;
    if (!this.cells.has(key)) {
      this.cells.set(key, { value: '', formula: '', validation: null, format: {} });
    }
    return this.cells.get(key);
  }
  getName() { return this.name; }
  getMaxRows() { return 1000; }
  getRange(row, column, rows = 1, columns = 1) {
    return new Range(this, row, column, rows, columns);
  }
  getRowHeight(row) {
    this.heightReads.push(row);
    return this.heights.get(row) ?? 21;
  }
  setRowHeights(startRow, rowCount, height) {
    this.heightWrites.push({ startRow, rowCount, height });
    for (let row = startRow; row < startRow + rowCount; row += 1) {
      this.heights.set(row, height);
    }
    return this;
  }
  setRowHeight(row, height) { return this.setRowHeights(row, 1, height); }
  getLastRow() {
    let last = 0;
    for (const [key, cell] of this.cells) {
      if (cell.value !== '' || cell.formula) last = Math.max(last, Number(key.split(',')[0]));
    }
    return last;
  }
}

class Range {
  constructor(sheet, row, column, rows, columns) {
    Object.assign(this, { sheet, row, column, rows, columns });
  }
  each(callback) {
    for (let r = 0; r < this.rows; r += 1) {
      for (let c = 0; c < this.columns; c += 1) callback(this.sheet.cell(this.row + r, this.column + c), r, c);
    }
    return this;
  }
  getValues() {
    return Array.from({ length: this.rows }, (_, r) =>
      Array.from({ length: this.columns }, (_, c) => this.sheet.cell(this.row + r, this.column + c).value));
  }
  getDisplayValues() { return this.getValues().map((row) => row.map(String)); }
  getValue() { return this.sheet.cell(this.row, this.column).value; }
  getDisplayValue() { return String(this.getValue()); }
  setValues(values) {
    assert.equal(values.length, this.rows);
    values.forEach((row) => assert.equal(row.length, this.columns));
    return this.each((cell, r, c) => { cell.value = values[r][c]; cell.formula = ''; });
  }
  clearContent() { return this.each((cell) => { cell.value = ''; cell.formula = ''; }); }
  clearDataValidations() { return this.each((cell) => { cell.validation = null; }); }
  copyTo(target, mode) {
    this.sheet.formatCopies.push({ source: this, target, mode });
    assert.equal(mode, 'PASTE_FORMAT', 'A row layout must never copy cell contents.');
    return target.each((cell, r, c) => {
      cell.format = clone(this.sheet.cell(this.row + (r % this.rows), this.column + (c % this.columns)).format);
    });
  }
  copyFormatToRange(sheet, firstColumn, lastColumn, firstRow, lastRow) {
    return this.copyTo(sheet.getRange(firstRow, firstColumn, lastRow - firstRow + 1, lastColumn - firstColumn + 1), 'PASTE_FORMAT');
  }
}

for (const property of [
  'VerticalAlignment', 'HorizontalAlignment', 'NumberFormat', 'Background',
  'FontColor', 'FontFamily', 'FontSize', 'FontWeight', 'WrapStrategy', 'Wrap', 'Border',
]) {
  Range.prototype[`set${property}`] = function (...values) {
    return this.each((cell) => { cell.format[property] = clone(values.length === 1 ? values[0] : values); });
  };
}

const context = vm.createContext({
  console,
  SpreadsheetApp: {
    CopyPasteType: { PASTE_FORMAT: 'PASTE_FORMAT' },
    BorderStyle: { SOLID: 'SOLID' },
    WrapStrategy: { CLIP: 'CLIP', WRAP: 'WRAP' },
  },
});
vm.runInContext(code, context);
const run = (name, ...args) => context[name](...args);
const bodyHeight = (sheet, row) => sheet.heights.get(row) ?? 21;
const protectedContents = (sheet, startRow, rowCount, width) =>
  Array.from({ length: rowCount }, (_, offset) => Array.from({ length: width }, (_, column) => {
    const { value, formula, validation } = sheet.cell(startRow + offset, column + 1);
    return clone({ value, formula, validation });
  }));
let checks = 0;
function check(name, body) {
  body();
  checks += 1;
  console.log(`PASS ${name}`);
}

check('new rows inherit body layout without changing values, formulas, or dropdown rules', () => {
  const sheet = new Sheet();
  sheet.heights.set(1, 65);
  sheet.heights.set(2, 36);
  for (let column = 1; column <= 4; column += 1) {
    sheet.cell(1, column).format = { Background: 'header', FontWeight: 'bold' };
    sheet.cell(2, column).format = { Background: `body-${column}`, FontSize: 10 };
    for (let row = 5; row <= 7; row += 1) {
      Object.assign(sheet.cell(row, column), {
        value: `value-${row}-${column}`,
        formula: column === 3 ? `=A${row}*2` : '',
        validation: { allowedValues: ['사용중', '보관중'], strict: true },
      });
    }
  }
  const before = protectedContents(sheet, 5, 3, 4);
  run('applyLedgerRowLayout_', sheet, 5, 3, 2, 4);
  assert.deepEqual(protectedContents(sheet, 5, 3, 4), before);
  assert.deepEqual(sheet.heightReads, [2], 'Header height is not a body template.');
  assert.deepEqual(sheet.heightWrites, [{ startRow: 5, rowCount: 3, height: 36 }]);
  for (let row = 5; row <= 7; row += 1) {
    assert.equal(bodyHeight(sheet, row), 36);
    for (let column = 1; column <= 4; column += 1) {
      assert.deepEqual(sheet.cell(row, column).format, sheet.cell(2, column).format);
    }
  }
});

check('an empty ledger preserves its body template without inheriting its header', () => {
  const sheet = new Sheet();
  sheet.heights.set(8, 60);
  sheet.cell(8, 1).format = { Background: 'header', FontWeight: 'bold' };
  sheet.cell(9, 1).value = 'first record';
  run('applyLedgerRowLayout_', sheet, 9, 1, 9, 18);
  assert.equal(bodyHeight(sheet, 9), 21);
  assert.equal(sheet.cell(9, 1).value, 'first record');
  assert.deepEqual(sheet.cell(9, 1).format, {});
  assert.deepEqual(sheet.heightReads, [9]);
  assert.equal(sheet.formatCopies.length, 0);
});

check('existing compact and tall body rows are respected and invalid heights fall back safely', () => {
  for (const [configured, expected] of [[21, 21], [45, 45], [0, 30], [NaN, 30]]) {
    const sheet = new Sheet();
    sheet.heights.set(2, configured);
    run('applyLedgerRowLayout_', sheet, 6, 1, 2, 4);
    assert.equal(bodyHeight(sheet, 6), expected);
  }
});

check('formatting cannot target the header and zero-row batches do nothing', () => {
  const sheet = new Sheet();
  assert.throws(() => run('applyLedgerRowLayout_', sheet, 1, 1, 2, 11));
  run('applyLedgerRowLayout_', sheet, 2, 0, 2, 11);
  assert.deepEqual(sheet.heightWrites, []);
  assert.deepEqual(sheet.heightReads, []);
});

check('physical asset registration fixes both short rows and preserves price/date semantics', () => {
  const sheet = new Sheet('L-실물');
  sheet.heights.set(9, 30);
  sheet.heights.set(52, 30);
  for (let column = 1; column <= 18; column += 1) {
    sheet.cell(52, column).format = { Background: 'existing-body', FontFamily: 'Malgun Gothic' };
    sheet.cell(53, column).validation = { column, allowed: ['existing rule'] };
  }
  sheet.cell(53, 19).formula = '=SUM(Q53:Q54)';
  const originalTemplate = protectedContents(sheet, 52, 1, 18);
  const payload = {
    assetCategory: '케이블/어댑터', itemName: 'HDMI/DVI Cable',
    modelMaker: 'Ultra HdMI to MINI HDMI', serialNumber: '', vendor: '공급자',
    quantity: '1EA', user: '이은범', manager: '이장명',
    storageLocation: '고색연구소', assetStatus: '사용중', priority: '하',
    purchaseDate: '2026-09-03', amount: 5500, remarks: '',
  };
  run('writeAssetRow_', sheet, { row: 53, previousAssetRow: 52, managementNumber: 'GNS-H-L-045' }, payload);
  run('writeAssetRow_', sheet, { row: 54, previousAssetRow: 53, managementNumber: 'GNS-H-L-046' }, { ...payload, assetStatus: '보관중' });
  assert.equal(bodyHeight(sheet, 53), 30);
  assert.equal(bodyHeight(sheet, 54), 30);
  assert.equal(sheet.cell(53, 1).value, 'GNS-H-L-045');
  assert.equal(sheet.cell(53, 17).value, 5.5);
  assert.equal(sheet.cell(54, 14).value, '보관중');
  assert.equal(sheet.cell(53, 16).format.NumberFormat, 'yyyy-mm-dd');
  assert.equal(sheet.cell(53, 4).format.Background, 'existing-body');
  assert.deepEqual(sheet.cell(53, 10).validation, { column: 10, allowed: ['existing rule'] });
  assert.equal(sheet.cell(53, 19).formula, '=SUM(Q53:Q54)');
  assert.deepEqual(protectedContents(sheet, 52, 1, 18), originalTemplate);
});

check('physical asset edits also repair an already short row', () => {
  const sheet = new Sheet('F1-실물');
  sheet.heights.set(9, 34);
  sheet.cell(20, 4).format.Background = 'keep-custom-background';
  run('writeExistingAssetRow_', sheet, 20, 'GNS-H-F1-035', {
    purchaseDate: '2026-09-03', assetCategory: '기타', itemName: '수정품',
    vendor: '공급자', quantity: '1EA', storageLocation: '화성1공장',
    assetStatus: '사용중', priority: '하', amount: 5500,
  });
  assert.equal(bodyHeight(sheet, 20), 34);
  assert.equal(sheet.cell(20, 4).format.Background, 'keep-custom-background');
  assert.equal(sheet.cell(20, 17).value, 5.5);
});

check('visitor, employee, department, movement, and information rows use their body height', () => {
  for (const [name, firstDataRow, width, extra] of [
    ['formatAccessDataRow_', 2, 20, [20]],
    ['formatAccessDataRow_', 2, 11, [11]],
    ['formatDepartmentAccessRow_', 2, 16, []],
    ['formatMovementRow_', 2, 16, []],
    ['formatInfoAssetRow_', 9, 24, []],
  ]) {
    const sheet = new Sheet(name);
    sheet.heights.set(firstDataRow - 1, 60);
    sheet.heights.set(firstDataRow, 35);
    const row = firstDataRow + 4;
    sheet.cell(row, 1).value = 'record-id';
    sheet.cell(row, 1).formula = '=A1';
    sheet.cell(row, 1).validation = { custom: true };
    run(name, sheet, row, ...extra);
    assert.equal(bodyHeight(sheet, row), 35, name);
    assert.equal(sheet.cell(row, 1).value, 'record-id', name);
    assert.equal(sheet.cell(row, 1).formula, '=A1', name);
    assert.deepEqual(sheet.cell(row, 1).validation, { custom: true }, name);
    assert.equal(sheet.heightWrites.length, 1, `${name} must not reformat the whole ledger`);
    assert.equal(sheet.heightWrites[0].rowCount, 1, `${name} stays scoped to its row`);
  }
});

check('multi-visitor application formatting uses one scoped batch height update', () => {
  const sheet = new Sheet();
  sheet.heights.set(2, 32);
  sheet.cell(7, 12).value = '01012345678';
  sheet.cell(8, 12).value = '01098765432';
  const before = protectedContents(sheet, 7, 2, 24);
  run('formatVisitorApplicationRows_', sheet, 7, 2);
  assert.deepEqual(sheet.heightWrites, [{ startRow: 7, rowCount: 2, height: 32 }]);
  assert.deepEqual(protectedContents(sheet, 7, 2, 24), before);
  assert.equal(sheet.cell(7, 12).format.NumberFormat, '@');
});

check('audit append applies body layout while preserving readable wrapped details', () => {
  const sheet = new Sheet('감사로그');
  sheet.cell(1, 1).value = '처리일시';
  sheet.cell(2, 1).value = '기존 처리';
  sheet.cell(2, 1).format.FontFamily = 'Malgun Gothic';
  sheet.heights.set(2, 40);
  run('appendReadableAuditLog_', sheet, {
    actor: '담당자', business: '실물자산', recordId: 'GNS-H-L-045',
    target: '케이블', action: '등록', summary: '여러 항목의 처리 내용',
    result: '완료', reason: '', beforeText: '', afterText: '보관중',
    skipIntegratedIndex: true,
  });
  assert.equal(bodyHeight(sheet, 3), 40);
  assert.equal(sheet.cell(3, 2).value, '담당자');
  assert.equal(sheet.cell(3, 7).value, '여러 항목의 처리 내용');
  assert.equal(sheet.cell(3, 7).format.Wrap, true);
  assert.equal(sheet.cell(3, 1).format.FontFamily, 'Malgun Gothic');
});

check('audit ledgers with a title block use row six rather than title or header formatting', () => {
  const sheet = new Sheet('제목이 있는 감사로그');
  sheet.cell(1, 1).value = '감사로그 제목';
  sheet.cell(2, 1).value = '설명';
  sheet.cell(2, 1).format = { Background: 'title-background', FontSize: 22 };
  sheet.heights.set(2, 65);
  sheet.cell(5, 1).value = '처리일시';
  sheet.heights.set(5, 42);
  sheet.cell(6, 1).value = '기존 감사 기록';
  sheet.cell(6, 1).format = { Background: 'audit-body', FontSize: 10 };
  sheet.heights.set(6, 30);
  run('appendReadableAuditLog_', sheet, {
    actor: '담당자', business: '등록', summary: '완료', skipIntegratedIndex: true,
  });
  assert.equal(bodyHeight(sheet, 7), 30);
  assert.deepEqual(sheet.heightReads, [6]);
  assert.equal(sheet.cell(7, 1).format.Background, 'audit-body');
  assert.equal(sheet.cell(7, 1).format.FontSize, 10);
});

check('information department sync keeps the correct source format across blank source rows', () => {
  const ledger = new Sheet('정보자산');
  ledger.cell(9, 1).value = 'GNS-S-L-001';
  ledger.cell(9, 6).value = 'L';
  ledger.cell(9, 3).format.Background = 'public-green';
  ledger.cell(10, 3).format.Background = 'blank-row-red';
  ledger.cell(11, 1).value = 'GNS-S-F1-001';
  ledger.cell(11, 6).value = 'F1';
  ledger.cell(11, 3).format.Background = 'secret-yellow';
  const targets = new Map(['L', 'F1'].map((code) => [
    `${code}-정보`, new Sheet(`${code}-정보`),
  ]));
  for (const sheet of targets.values()) {
    sheet.heights.set(9, 34);
    sheet.cell(9, 1).validation = { existing: 'protected-dropdown' };
  }
  run('syncInformationDepartmentSheets_', { getSheetByName: (name) => targets.get(name) ?? null }, ledger);
  assert.equal(targets.get('L-정보').cell(9, 1).value, 'GNS-S-L-001');
  assert.equal(targets.get('F1-정보').cell(9, 1).value, 'GNS-S-F1-001');
  assert.equal(targets.get('F1-정보').cell(9, 3).format.Background, 'secret-yellow');
  for (const sheet of targets.values()) {
    assert.equal(bodyHeight(sheet, 9), 34);
    assert.deepEqual(sheet.cell(9, 1).validation, { existing: 'protected-dropdown' });
  }
});

console.log(`LEDGER_ROW_LAYOUT_TESTS_OK=${checks}`);
