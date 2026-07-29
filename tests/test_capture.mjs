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
  ".uploadCapturedPhoto({",
  ".getCaptureSessionStatus(",
].forEach((needle) => {
  assert.ok(
    html.includes(needle),
    `missing capture contract: ${needle}`,
  );
});

console.log("CAPTURE_TESTS_OK=1");
