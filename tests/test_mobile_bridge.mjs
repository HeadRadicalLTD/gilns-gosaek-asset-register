import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(
  new URL("../docs/mobile.html", import.meta.url),
  "utf8",
);
const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1]);
assert.equal(scripts.length, 1);
assert.doesNotThrow(() => new vm.Script(scripts[0]));

assert.match(source, /window\.location\.hash\.slice\(1\)/);
assert.match(source, /history\.replaceState/);
assert.match(source, /sessionStorage\.setItem\(CAPTURE_STORAGE_KEY/);
assert.match(source, /CAPTURE_MAX_AGE = 4 \* 60 \* 60 \* 1000/);
assert.match(source, /form\.method = 'POST'/);
assert.match(source, /form\.acceptCharset = 'UTF-8'/);
assert.match(source, /form\.target = 'uploadFrame'/);
assert.match(source, /gilns-mobile-upload/);
assert.match(source, /Google 로그인 없이/);
assert.match(source, /typeof window\.createImageBitmap === 'function'/);
assert.match(source, /URL\.createObjectURL\(file\)/);
assert.match(source, /const maxDimension = 1600/);
assert.match(source, /'image\/jpeg',\s*0\.74/);
assert.match(
  source,
  /AKfycbxubcW2BW4tKQjFl5PJ0cbtTf7ni/,
);
assert.doesNotMatch(source, /\/dev/);

console.log("MOBILE_BRIDGE_TESTS_OK=1");
