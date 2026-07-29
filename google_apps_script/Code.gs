const APP = Object.freeze({
  title: '길앤에스 고색 자산등록',
  rootFolderName: '길앤에스_고색_자산관리',
  photoFolderName: '비품 사진',
  spreadsheetName: '고색 자산관리 대장',
  sheetName: '고색연구소',
  historySheetName: '등록이력',
  captureHoldingFolderName: '_촬영대기',
  capturePropertyPrefix: 'CAPTURE_SESSION_',
  captureExpiryMillis: 4 * 60 * 60 * 1000,
  headerRow: 6,
  firstDataRow: 7,
  firstDataColumn: 2,
  dataColumnCount: 9,
  historyColumnCount: 13,
  timeZone: 'Asia/Seoul',
  maxFilesPerCategory: 5,
  maxFileBytes: 8 * 1024 * 1024,
  maxTotalBytes: 25 * 1024 * 1024,
});

const CATEGORY_MAP = Object.freeze({
  invoice: Object.freeze({
    folderName: '송장',
    filePrefix: '송장',
  }),
  purchaseOrder: Object.freeze({
    folderName: '발주서',
    filePrefix: '발주서',
  }),
  taxInvoice: Object.freeze({
    folderName: '세금계산서',
    filePrefix: '세금계산서',
  }),
  product: Object.freeze({
    folderName: '실물 사진',
    filePrefix: '실물',
  }),
});

function doGet(event) {
  const parameters = event && event.parameter
    ? event.parameter
    : {};

  if (parameters.capture) {
    const template = HtmlService.createTemplateFromFile(
      'Capture'
    );
    template.sessionId = String(parameters.capture || '')
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 80);
    template.token = String(parameters.token || '')
      .replace(/[^A-Za-z0-9-]/g, '')
      .slice(0, 160);

    return template.evaluate()
      .setTitle('길앤에스 휴대폰 촬영')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1'
      );
  }

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(APP.title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Apps Script 편집기에서 한 번 실행합니다.
 *
 * @param {string} photoRootFolderId 비품 사진 폴더 ID
 * @param {string} spreadsheetId Google Sheets 파일 ID
 * @return {Object} 연결 확인 결과
 */
function configureSystem(photoRootFolderId, spreadsheetId) {
  const photoId = String(photoRootFolderId || '').trim();
  const sheetId = String(spreadsheetId || '').trim();

  if (!photoId || !sheetId) {
    throw new Error(
      '비품 사진 폴더 ID와 Google Sheets ID가 필요합니다.'
    );
  }

  const photoFolder = DriveApp.getFolderById(photoId);
  const spreadsheet = SpreadsheetApp.openById(sheetId);
  const sheet = spreadsheet.getSheetByName(APP.sheetName);

  if (!sheet) {
    throw new Error(
      'Google Sheets에 고색연구소 시트가 없습니다.'
    );
  }

  PropertiesService.getScriptProperties().setProperties({
    PHOTO_ROOT_FOLDER_ID: photoFolder.getId(),
    SPREADSHEET_ID: spreadsheet.getId(),
    SHEET_NAME: APP.sheetName,
  });

  ensureHistorySheet_(spreadsheet);

  return {
    ok: true,
    photoFolderName: photoFolder.getName(),
    photoFolderUrl: photoFolder.getUrl(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    sheetName: sheet.getName(),
  };
}

/**
 * 정해진 폴더명과 파일명으로 자동 연결을 시도합니다.
 *
 * @return {Object} 연결 결과
 */
function discoverAndConfigureSystem() {
  const roots = collectFoldersByName_(APP.rootFolderName);

  if (roots.length !== 1) {
    throw new Error(
      '길앤에스_고색_자산관리 폴더가 정확히 하나여야 합니다.'
    );
  }

  const root = roots[0];
  const photoFolders = collectChildFoldersByName_(
    root,
    APP.photoFolderName
  );

  if (photoFolders.length !== 1) {
    throw new Error(
      '최상위 폴더 안에 비품 사진 폴더가 정확히 하나여야 합니다.'
    );
  }

  const exactNameSheets = [];
  const compatibleSheets = [];
  const files = root.getFilesByType(MimeType.GOOGLE_SHEETS);

  while (files.hasNext()) {
    const file = files.next();
    const spreadsheet = SpreadsheetApp.openById(file.getId());

    if (spreadsheet.getSheetByName(APP.sheetName)) {
      compatibleSheets.push(file);

      if (file.getName() === APP.spreadsheetName) {
        exactNameSheets.push(file);
      }
    }
  }

  const sheets = exactNameSheets.length === 1
    ? exactNameSheets
    : compatibleSheets;

  if (sheets.length !== 1) {
    throw new Error(
      '최상위 폴더 안에 고색연구소 탭이 있는 ' +
      'Google Sheets 파일이 정확히 하나여야 합니다.'
    );
  }

  return configureSystem(
    photoFolders[0].getId(),
    sheets[0].getId()
  );
}

function getPublicConfig() {
  try {
    const context = getContextWithAutoDiscovery_(false);
    const nextAsset = getNextAssetPosition_(context.sheet);

    return {
      ok: true,
      title: APP.title,
      nextManagementNumber: nextAsset.managementNumber,
      maxFilesPerCategory: APP.maxFilesPerCategory,
      maxFileBytes: APP.maxFileBytes,
      maxTotalBytes: APP.maxTotalBytes,
      photoFolderName: context.photoRoot.getName(),
      sheetName: context.sheet.getName(),
      today: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd'
      ),
    };
  } catch (error) {
    return {
      ok: false,
      title: APP.title,
      message: safeErrorMessage_(error),
    };
  }
}

function createCaptureSession() {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const context = getContextWithAutoDiscovery_(false);
    const serviceUrl = ScriptApp.getService().getUrl();

    if (!serviceUrl) {
      throw new Error(
        '웹앱 배포 후 휴대폰 촬영을 연결할 수 있습니다.'
      );
    }

    cleanupExpiredCaptureSessions_();

    const sessionId = Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 20);
    const token = Utilities.getUuid() + Utilities.getUuid();
    const holdingRoot = getCaptureHoldingRoot_(
      context.photoRoot
    );
    const folder = holdingRoot.createFolder(
      '촬영_' + sessionId
    );

    createCategoryFolders_(folder);

    const now = Date.now();
    const metadata = {
      sessionId: sessionId,
      token: token,
      folderId: folder.getId(),
      createdAt: now,
      expiresAt: now + APP.captureExpiryMillis,
    };

    PropertiesService.getScriptProperties().setProperty(
      getCapturePropertyKey_(sessionId),
      JSON.stringify(metadata)
    );

    return {
      ok: true,
      sessionId: sessionId,
      token: token,
      captureUrl: serviceUrl +
        '?capture=' + encodeURIComponent(sessionId) +
        '&token=' + encodeURIComponent(token),
      expiresAt: metadata.expiresAt,
      counts: emptyCategoryCounts_(),
    };
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function uploadCapturedPhoto(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const source = request || {};
    const key = cleanText_(source.category, 30);

    if (!CATEGORY_MAP[key]) {
      throw new Error('사진 종류가 올바르지 않습니다.');
    }

    const normalizedFiles = normalizeFiles_([source.file]);

    if (normalizedFiles.length !== 1) {
      throw new Error('촬영한 사진을 읽지 못했습니다.');
    }

    const file = normalizedFiles[0];

    if (!/^image\//i.test(file.mimeType)) {
      throw new Error('이미지 파일만 등록할 수 있습니다.');
    }

    const fileBytes = estimateBase64Bytes_(file.base64);

    if (fileBytes > APP.maxFileBytes) {
      throw new Error('사진 한 장은 8MB를 넘을 수 없습니다.');
    }

    const snapshot = getCaptureSnapshot_(
      source.sessionId,
      source.token
    );

    if (snapshot.counts[key] >= APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 최대 ' +
        APP.maxFilesPerCategory +
        '장입니다.'
      );
    }

    if (
      snapshot.totalBytes + fileBytes >
      APP.maxTotalBytes
    ) {
      throw new Error(
        '휴대폰 촬영 사진은 전체 25MB를 넘을 수 없습니다.'
      );
    }

    const targetFolder = getCaptureCategoryFolder_(
      snapshot.folder,
      key
    );
    const sequence = snapshot.counts[key] + 1;
    const extension = getFileExtension_(
      file.name,
      file.mimeType
    );
    const fileName = CATEGORY_MAP[key].filePrefix +
      '_' + pad2_(sequence) + '.' + extension;
    const blob = Utilities.newBlob(
      Utilities.base64Decode(file.base64),
      file.mimeType,
      fileName
    );
    const driveFile = targetFolder.createFile(blob);

    driveFile.setDescription(
      '휴대폰 QR 촬영\n' +
      Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd HH:mm:ss'
      )
    );

    return getCaptureSessionStatus(
      source.sessionId,
      source.token
    );
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getCaptureSessionStatus(sessionId, token) {
  const snapshot = getCaptureSnapshot_(sessionId, token);

  return {
    ok: true,
    sessionId: snapshot.metadata.sessionId,
    expiresAt: snapshot.metadata.expiresAt,
    counts: snapshot.counts,
    totalBytes: snapshot.totalBytes,
  };
}

function validateRegistrationFiles_(localFiles, snapshot) {
  let totalBytes = snapshot ? snapshot.totalBytes : 0;
  const capturedCounts = snapshot
    ? snapshot.counts
    : emptyCategoryCounts_();

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const local = localFiles[key] || [];
    const combinedCount = local.length + capturedCounts[key];

    if (combinedCount > APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 PC와 휴대폰을 합쳐 최대 ' +
        APP.maxFilesPerCategory +
        '장입니다.'
      );
    }

    local.forEach(function (file) {
      totalBytes += estimateBase64Bytes_(file.base64);
    });
  });

  const productCount =
    (localFiles.product || []).length +
    capturedCounts.product;

  if (productCount === 0) {
    throw new Error('실물 사진을 한 장 이상 등록하세요.');
  }

  if (totalBytes > APP.maxTotalBytes) {
    throw new Error(
      'PC와 휴대폰 사진은 전체 25MB를 넘을 수 없습니다.'
    );
  }
}

function getCaptureSnapshot_(sessionId, token) {
  const metadata = getCaptureMetadata_(sessionId, token);
  const folder = DriveApp.getFolderById(metadata.folderId);
  const files = {};
  const counts = emptyCategoryCounts_();
  let totalBytes = 0;

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const categoryFolder = getCaptureCategoryFolder_(
      folder,
      key
    );
    const iterator = categoryFolder.getFiles();
    const items = [];

    while (iterator.hasNext()) {
      const file = iterator.next();
      items.push(file);
      totalBytes += file.getSize();
    }

    items.sort(function (left, right) {
      return left.getName().localeCompare(right.getName());
    });
    files[key] = items;
    counts[key] = items.length;
  });

  return {
    metadata: metadata,
    folder: folder,
    files: files,
    counts: counts,
    totalBytes: totalBytes,
  };
}

function getCaptureMetadata_(sessionId, token) {
  const cleanSessionId = cleanText_(sessionId, 80);
  const cleanToken = cleanText_(token, 160);

  if (!cleanSessionId || !cleanToken) {
    throw new Error('휴대폰 촬영 연결정보가 없습니다.');
  }

  const property = PropertiesService.getScriptProperties()
    .getProperty(getCapturePropertyKey_(cleanSessionId));

  if (!property) {
    throw new Error(
      '촬영 연결이 만료되었습니다. QR을 다시 연결하세요.'
    );
  }

  const metadata = JSON.parse(property);

  if (metadata.token !== cleanToken) {
    throw new Error('휴대폰 촬영 연결정보가 올바르지 않습니다.');
  }

  if (Number(metadata.expiresAt) < Date.now()) {
    throw new Error(
      '촬영 연결이 만료되었습니다. QR을 다시 연결하세요.'
    );
  }

  return metadata;
}

function copyCapturedFiles_(
  categoryFolders,
  snapshot,
  existingCounts,
  author
) {
  const copiedCounts = emptyCategoryCounts_();

  if (!snapshot) {
    return copiedCounts;
  }

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    snapshot.files[key].forEach(function (file, index) {
      const extension = getFileExtension_(
        file.getName(),
        file.getMimeType()
      );
      const sequence = existingCounts[key] + index + 1;
      const fileName = CATEGORY_MAP[key].filePrefix +
        '_' + pad2_(sequence) + '.' + extension;
      const copied = file.makeCopy(
        fileName,
        categoryFolders[key]
      );

      copied.setDescription(
        '작성자: ' + author + '\n' +
        '휴대폰 QR 촬영\n' +
        '등록일시: ' +
        Utilities.formatDate(
          new Date(),
          APP.timeZone,
          'yyyy-MM-dd HH:mm:ss'
        )
      );
      copiedCounts[key] += 1;
    });
  });

  return copiedCounts;
}

function finishCaptureSession_(snapshot) {
  snapshot.folder.setTrashed(true);
  PropertiesService.getScriptProperties().deleteProperty(
    getCapturePropertyKey_(snapshot.metadata.sessionId)
  );
}

function cleanupExpiredCaptureSessions_() {
  const properties = PropertiesService.getScriptProperties();
  const all = properties.getProperties();

  Object.keys(all).forEach(function (key) {
    if (!key.startsWith(APP.capturePropertyPrefix)) {
      return;
    }

    try {
      const metadata = JSON.parse(all[key]);

      if (Number(metadata.expiresAt) >= Date.now()) {
        return;
      }

      DriveApp.getFolderById(metadata.folderId)
        .setTrashed(true);
      properties.deleteProperty(key);
    } catch (error) {
      console.error(error);
    }
  });
}

function getCaptureHoldingRoot_(photoRoot) {
  const parents = photoRoot.getParents();
  const parent = parents.hasNext()
    ? parents.next()
    : photoRoot;
  const folders = collectChildFoldersByName_(
    parent,
    APP.captureHoldingFolderName
  );

  if (folders.length > 1) {
    throw new Error(
      '_촬영대기 폴더가 여러 개 있습니다.'
    );
  }

  return folders.length === 1
    ? folders[0]
    : parent.createFolder(APP.captureHoldingFolderName);
}

function getCaptureCategoryFolder_(sessionFolder, key) {
  const folders = collectChildFoldersByName_(
    sessionFolder,
    CATEGORY_MAP[key].folderName
  );

  if (folders.length !== 1) {
    throw new Error('촬영 임시폴더 구조가 올바르지 않습니다.');
  }

  return folders[0];
}

function getCapturePropertyKey_(sessionId) {
  return APP.capturePropertyPrefix + sessionId;
}

function emptyCategoryCounts_() {
  return {
    invoice: 0,
    purchaseOrder: 0,
    taxInvoice: 0,
    product: 0,
  };
}

/**
 * 자산정보와 사진을 등록합니다.
 *
 * @param {Object} request 등록 요청
 * @return {Object} 등록 결과
 */
function registerAsset(request) {
  const lock = LockService.getScriptLock();
  let hasLock = false;
  let assetFolder = null;
  let assetSheet = null;
  let assetRow = null;
  let historySheet = null;
  let historyRow = null;
  let capturedSnapshot = null;

  try {
    lock.waitLock(30000);
    hasLock = true;

    const payload = normalizePayload_(request);
    validatePayload_(payload);

    if (payload.captureSession.sessionId) {
      capturedSnapshot = getCaptureSnapshot_(
        payload.captureSession.sessionId,
        payload.captureSession.token
      );
    }

    validateRegistrationFiles_(
      payload.files,
      capturedSnapshot
    );

    const context = getContextWithAutoDiscovery_(true);
    const nextAsset = getNextAssetPosition_(context.sheet);
    assertTargetRowEmpty_(context.sheet, nextAsset.row);

    const folderName = makeAssetFolderName_(
      nextAsset.managementNumber,
      payload.vendor,
      payload.itemName
    );

    assetFolder = context.photoRoot.createFolder(folderName);

    const categoryFolders = createCategoryFolders_(assetFolder);
    const fileCounts = saveFiles_(
      categoryFolders,
      payload.files,
      payload.author
    );
    const capturedCounts = copyCapturedFiles_(
      categoryFolders,
      capturedSnapshot,
      fileCounts,
      payload.author
    );

    Object.keys(CATEGORY_MAP).forEach(function (key) {
      fileCounts[key] += capturedCounts[key];
    });

    assetSheet = context.sheet;
    assetRow = nextAsset.row;
    writeAssetRow_(assetSheet, nextAsset, payload);

    historySheet = context.spreadsheet.getSheetByName(
      APP.historySheetName
    );
    historyRow = appendHistory_(
      context.spreadsheet,
      nextAsset.managementNumber,
      payload,
      assetFolder,
      fileCounts
    );

    SpreadsheetApp.flush();

    if (capturedSnapshot) {
      try {
        finishCaptureSession_(capturedSnapshot);
      } catch (cleanupError) {
        console.error(cleanupError);
      }
    }

    return {
      ok: true,
      managementNumber: nextAsset.managementNumber,
      row: nextAsset.row,
      folderName: assetFolder.getName(),
      folderUrl: assetFolder.getUrl(),
      registeredAt: Utilities.formatDate(
        new Date(),
        APP.timeZone,
        'yyyy-MM-dd HH:mm:ss'
      ),
      fileCounts: fileCounts,
    };
  } catch (error) {
    if (historySheet && historyRow) {
      try {
        historySheet
          .getRange(
            historyRow,
            1,
            1,
            APP.historyColumnCount
          )
          .clearContent();
      } catch (historyRollbackError) {
        console.error(historyRollbackError);
      }
    }

    if (assetSheet && assetRow) {
      try {
        assetSheet
          .getRange(
            assetRow,
            APP.firstDataColumn,
            1,
            APP.dataColumnCount
          )
          .clearContent();
      } catch (sheetRollbackError) {
        console.error(sheetRollbackError);
      }
    }

    if (assetFolder) {
      try {
        assetFolder.setTrashed(true);
      } catch (rollbackError) {
        console.error(rollbackError);
      }
    }

    throw new Error(safeErrorMessage_(error));
  } finally {
    if (hasLock) {
      lock.releaseLock();
    }
  }
}

function getContext_(createHistory) {
  const properties = PropertiesService.getScriptProperties();
  const photoRootId = properties.getProperty(
    'PHOTO_ROOT_FOLDER_ID'
  );
  const spreadsheetId = properties.getProperty(
    'SPREADSHEET_ID'
  );
  const sheetName = properties.getProperty('SHEET_NAME') ||
    APP.sheetName;

  if (!photoRootId || !spreadsheetId) {
    throw new Error(
      '시스템 연결이 필요합니다. configureSystem()을 실행하세요.'
    );
  }

  const photoRoot = DriveApp.getFolderById(photoRootId);
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('고색연구소 시트를 찾을 수 없습니다.');
  }

  if (createHistory) {
    ensureHistorySheet_(spreadsheet);
  }

  return {
    photoRoot: photoRoot,
    spreadsheet: spreadsheet,
    sheet: sheet,
  };
}

function getContextWithAutoDiscovery_(createHistory) {
  try {
    return getContext_(createHistory);
  } catch (error) {
    const message = String(
      error && error.message ? error.message : error
    );

    if (!/시스템 연결이 필요합니다/.test(message)) {
      throw error;
    }

    discoverAndConfigureSystem();
    return getContext_(createHistory);
  }
}

function getNextAssetPosition_(sheet) {
  const lastRow = Math.max(
    sheet.getLastRow(),
    APP.firstDataRow - 1
  );
  let maxManagementNumber = 0;
  let lastAssetRow = APP.firstDataRow - 1;

  if (lastRow >= APP.firstDataRow) {
    const values = sheet
      .getRange(
        APP.firstDataRow,
        APP.firstDataColumn,
        lastRow - APP.firstDataRow + 1,
        1
      )
      .getDisplayValues();

    values.forEach(function (row, index) {
      const text = String(row[0] || '').trim();

      if (/^\d+$/.test(text)) {
        maxManagementNumber = Math.max(
          maxManagementNumber,
          Number(text)
        );
        lastAssetRow = APP.firstDataRow + index;
      }
    });
  }

  return {
    managementNumber: maxManagementNumber + 1,
    row: Math.max(lastAssetRow + 1, APP.firstDataRow),
    previousAssetRow: lastAssetRow,
  };
}

function assertTargetRowEmpty_(sheet, row) {
  const values = sheet
    .getRange(
      row,
      APP.firstDataColumn,
      1,
      APP.dataColumnCount
    )
    .getDisplayValues()[0];
  const hasContent = values.some(function (value) {
    return String(value || '').trim() !== '';
  });

  if (hasContent) {
    throw new Error(
      '다음 입력 행에 기존 내용이 있습니다. ' +
      '관리대장을 확인하세요.'
    );
  }
}

function writeAssetRow_(sheet, nextAsset, payload) {
  const target = sheet.getRange(
    nextAsset.row,
    APP.firstDataColumn,
    1,
    APP.dataColumnCount
  );

  if (nextAsset.previousAssetRow >= APP.firstDataRow) {
    const previous = sheet.getRange(
      nextAsset.previousAssetRow,
      APP.firstDataColumn,
      1,
      APP.dataColumnCount
    );
    previous.copyTo(
      target,
      SpreadsheetApp.CopyPasteType.PASTE_FORMAT,
      false
    );
  }

  const purchaseDate = new Date(
    payload.purchaseDate + 'T00:00:00+09:00'
  );

  target.setValues([[
    nextAsset.managementNumber,
    payload.itemName,
    payload.modelMaker || '-',
    payload.vendor,
    payload.amount === '' ? '-' : payload.amount,
    purchaseDate,
    payload.manager || '-',
    payload.partNumber || '',
    payload.storageLocation,
  ]]);

  sheet
    .getRange(nextAsset.row, 7)
    .setNumberFormat('yyyy-mm-dd');
}

function ensureHistorySheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(
    APP.historySheetName
  );

  if (!sheet) {
    sheet = spreadsheet.insertSheet(APP.historySheetName);
    const headers = [[
      '등록ID',
      '관리번호',
      '작성자',
      '등록일시',
      '품목',
      '구입처',
      '금액(원)',
      '사진폴더명',
      '사진폴더URL',
      '송장수',
      '발주서수',
      '세금계산서수',
      '실물사진수',
    ]];

    sheet.getRange(1, 1, 1, headers[0].length)
      .setValues(headers)
      .setFontWeight('bold')
      .setBackground('#24324A')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function appendHistory_(
  spreadsheet,
  managementNumber,
  payload,
  assetFolder,
  fileCounts
) {
  const sheet = ensureHistorySheet_(spreadsheet);
  const row = sheet.getLastRow() + 1;

  const values = [[
    Utilities.getUuid(),
    managementNumber,
    payload.author,
    new Date(),
    payload.itemName,
    payload.vendor,
    payload.amount === '' ? '' : payload.amount,
    assetFolder.getName(),
    assetFolder.getUrl(),
    fileCounts.invoice,
    fileCounts.purchaseOrder,
    fileCounts.taxInvoice,
    fileCounts.product,
  ]];

  try {
    sheet
      .getRange(row, 1, 1, values[0].length)
      .setValues(values);
    sheet
      .getRange(row, 4)
      .setNumberFormat('yyyy-mm-dd hh:mm:ss');
  } catch (error) {
    sheet
      .getRange(row, 1, 1, values[0].length)
      .clearContent();
    throw error;
  }

  return row;
}

function createCategoryFolders_(assetFolder) {
  const folders = {};

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    folders[key] = assetFolder.createFolder(
      CATEGORY_MAP[key].folderName
    );
  });

  return folders;
}

function saveFiles_(categoryFolders, fileGroups, author) {
  const counts = {
    invoice: 0,
    purchaseOrder: 0,
    taxInvoice: 0,
    product: 0,
  };

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const files = fileGroups[key] || [];

    files.forEach(function (file, index) {
      const bytes = Utilities.base64Decode(file.base64);
      const extension = getFileExtension_(
        file.name,
        file.mimeType
      );
      const safeFileName = CATEGORY_MAP[key].filePrefix +
        '_' + pad2_(index + 1) + '.' + extension;
      const blob = Utilities.newBlob(
        bytes,
        file.mimeType,
        safeFileName
      );
      const driveFile = categoryFolders[key].createFile(blob);

      driveFile.setDescription(
        '작성자: ' + author + '\n' +
        '등록일시: ' +
        Utilities.formatDate(
          new Date(),
          APP.timeZone,
          'yyyy-MM-dd HH:mm:ss'
        )
      );

      counts[key] += 1;
    });
  });

  return counts;
}

function normalizePayload_(request) {
  const source = request || {};
  const files = source.files || {};

  return {
    author: cleanText_(source.author, 40),
    itemName: cleanText_(source.itemName, 100),
    modelMaker: cleanText_(source.modelMaker, 150),
    vendor: cleanText_(source.vendor, 100),
    amount: normalizeAmount_(source.amount),
    purchaseDate: cleanText_(source.purchaseDate, 10),
    manager: cleanText_(source.manager, 40),
    partNumber: cleanText_(source.partNumber, 100),
    storageLocation: cleanText_(
      source.storageLocation,
      100
    ),
    files: {
      invoice: normalizeFiles_(files.invoice),
      purchaseOrder: normalizeFiles_(files.purchaseOrder),
      taxInvoice: normalizeFiles_(files.taxInvoice),
      product: normalizeFiles_(files.product),
    },
    captureSession: {
      sessionId: cleanText_(
        source.captureSession &&
        source.captureSession.sessionId,
        80
      ),
      token: cleanText_(
        source.captureSession &&
        source.captureSession.token,
        160
      ),
    },
  };
}

function validatePayload_(payload) {
  const required = [
    ['작성자', payload.author],
    ['품목', payload.itemName],
    ['구입처', payload.vendor],
    ['구입일자', payload.purchaseDate],
    ['보관 장소', payload.storageLocation],
  ];

  required.forEach(function (entry) {
    if (!entry[1]) {
      throw new Error(entry[0] + ' 항목을 입력하세요.');
    }
  });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.purchaseDate)) {
    throw new Error('구입일자 형식이 올바르지 않습니다.');
  }

  let totalBytes = 0;

  Object.keys(CATEGORY_MAP).forEach(function (key) {
    const files = payload.files[key];

    if (files.length > APP.maxFilesPerCategory) {
      throw new Error(
        CATEGORY_MAP[key].folderName +
        ' 사진은 최대 ' +
        APP.maxFilesPerCategory +
        '개까지 등록할 수 있습니다.'
      );
    }

    files.forEach(function (file) {
      if (!/^image\//i.test(file.mimeType)) {
        throw new Error('이미지 파일만 등록할 수 있습니다.');
      }

      const byteLength = estimateBase64Bytes_(file.base64);

      if (byteLength > APP.maxFileBytes) {
        throw new Error(
          '사진 한 장은 8MB를 넘을 수 없습니다.'
        );
      }

      totalBytes += byteLength;
    });
  });

  if (totalBytes > APP.maxTotalBytes) {
    throw new Error(
      '전체 사진 용량은 25MB를 넘을 수 없습니다.'
    );
  }
}

function normalizeFiles_(files) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map(function (file) {
    return {
      name: cleanText_(file && file.name, 160),
      mimeType: cleanText_(
        file && file.mimeType,
        80
      ).toLowerCase(),
      base64: String(file && file.base64 || '')
        .replace(/\s/g, ''),
    };
  }).filter(function (file) {
    return file.base64;
  });
}

function normalizeAmount_(value) {
  const text = String(value == null ? '' : value)
    .replace(/,/g, '')
    .trim();

  if (!text) {
    return '';
  }

  if (!/^\d+$/.test(text)) {
    throw new Error('금액은 숫자로 입력하세요.');
  }

  return Number(text);
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function makeAssetFolderName_(
  managementNumber,
  vendor,
  itemName
) {
  return [
    String(managementNumber),
    sanitizeFolderPart_(vendor),
    sanitizeFolderPart_(itemName),
  ].join('_').slice(0, 180);
}

function sanitizeFolderPart_(value) {
  return cleanText_(value, 80)
    .replace(/[\\/:*?"<>|#%{}~&]/g, '_')
    .replace(/[. ]+$/g, '')
    .replace(/_+/g, '_') || '미입력';
}

function getFileExtension_(name, mimeType) {
  const match = String(name || '').match(/\.([A-Za-z0-9]{2,5})$/);

  if (match) {
    return match[1].toLowerCase();
  }

  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };

  return extensions[mimeType] || 'jpg';
}

function estimateBase64Bytes_(base64) {
  const text = String(base64 || '');
  const padding = text.endsWith('==') ? 2 :
    text.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor(text.length * 3 / 4) - padding);
}

function collectFoldersByName_(name) {
  const folders = [];
  const iterator = DriveApp.getFoldersByName(name);

  while (iterator.hasNext()) {
    folders.push(iterator.next());
  }

  return folders;
}

function collectChildFoldersByName_(parent, name) {
  const folders = [];
  const iterator = parent.getFoldersByName(name);

  while (iterator.hasNext()) {
    folders.push(iterator.next());
  }

  return folders;
}

function pad2_(value) {
  return String(value).padStart(2, '0');
}

function safeErrorMessage_(error) {
  const message = String(
    error && error.message ? error.message : error
  );

  console.error(error && error.stack ? error.stack : message);

  if (/권한|permission|access denied/i.test(message)) {
    return 'Google Drive 또는 Sheets 권한을 확인하세요.';
  }

  return message.slice(0, 240);
}
