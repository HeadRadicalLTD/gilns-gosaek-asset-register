import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(
  new URL("../google_apps_script/Capture.html", import.meta.url),
  "utf8",
);

const scripts = [
  ...html.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => {
  return match[1]
    .replace(
      /<\?!=\s*JSON\.stringify\(sessionId\)\s*\?>/,
      '"session123"',
    )
    .replace(
      /<\?!=\s*JSON\.stringify\(token\)\s*\?>/,
      '"token123"',
    );
});

assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

[
  'capture="environment"',
  'data-key="invoice"',
  'data-key="purchaseOrder"',
  'data-key="taxInvoice"',
  'data-key="product"',
  'id="saveCaptureButton"',
  '최소 3장을 넣어주세요',
  '부족한 사진은 PC에서 추가할 수 있습니다.',
  '휴대폰 촬영 마치기',
  ".uploadCapturedPhoto({",
  ".getCaptureSessionStatus(",
  ".completeCaptureSession(",
].forEach((needle) => {
  assert.ok(
    html.includes(needle),
    `missing capture contract: ${needle}`,
  );
});

assert.ok(
  !html.includes("count < MIN_PRODUCT_PHOTOS"),
  "phone photo count must not block partial capture",
);

console.log("CAPTURE_TESTS_OK=1");
