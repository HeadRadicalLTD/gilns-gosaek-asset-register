import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../docs/mobile.html", import.meta.url),
  "utf8",
);

assert.match(source, /window\.location\.replace\(target\)/);
assert.match(source, /window\.location\.hash\.slice\(1\)/);
assert.match(source, /history\.replaceState/);
assert.match(
  source,
  /AKfycbwRjRFFFj6FKGDV96Qol59PXvfGv/,
);
assert.doesNotMatch(source, /\/dev/);

console.log("MOBILE_BRIDGE_TESTS_OK=1");
