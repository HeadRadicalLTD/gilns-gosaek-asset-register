import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  new URL("../docs/mobile.html", import.meta.url),
  "utf8",
);

assert.match(source, /window\.location\.hash\.slice\(1\)/);
assert.match(source, /history\.replaceState/);
assert.match(source, /form\.method = 'POST'/);
assert.match(source, /form\.target = 'uploadFrame'/);
assert.match(source, /gilns-mobile-upload/);
assert.match(source, /Google 로그인 없이/);
assert.match(
  source,
  /AKfycbxubcW2BW4tKQjFl5PJ0cbtTf7ni/,
);
assert.doesNotMatch(source, /\/dev/);

console.log("MOBILE_BRIDGE_TESTS_OK=1");
