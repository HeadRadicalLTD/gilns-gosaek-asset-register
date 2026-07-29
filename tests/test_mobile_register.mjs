import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../docs/index.html", import.meta.url),
  "utf8",
);

assert.match(
  source,
  /script\.google\.com\/macros\/s\//,
);
assert.match(source, /allow="camera"/);
assert.match(source, /width: 100%/);
assert.match(source, /height: 100%/);
assert.doesNotMatch(source, /\/dev/);

console.log("MOBILE_REGISTER_TESTS_OK=1");
