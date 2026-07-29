import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(
  new URL("../google_apps_script/Index.html", import.meta.url),
  "utf8",
);

const scripts = [
  ...html.matchAll(/<script>([\s\S]*?)<\/script>/gi),
].map((match) => match[1]);

assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

[
  'id="author"',
  'id="itemName"',
  'id="vendor"',
  'id="purchaseDate"',
  'id="storageLocation"',
  'id="invoice"',
  'id="purchaseOrder"',
  'id="taxInvoice"',
  'id="product"',
  'id="connectPhoneButton"',
  'id="qrCode"',
  ".createCaptureSession()",
  ".getCaptureSessionStatus(",
  ".registerAsset(payload)",
].forEach((needle) => {
  assert.ok(
    html.includes(needle),
    `missing frontend contract: ${needle}`,
  );
});

assert.ok(
  !html.includes("<svg"),
  "inline SVG is not allowed",
);

assert.ok(
  !html.includes('data-capture-key='),
  "cancelled per-category capture buttons remain",
);

console.log("FRONTEND_TESTS_OK=1");
