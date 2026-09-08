import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const read = name => fs.readFileSync(new URL('../google_apps_script/' + name, import.meta.url), 'utf8');
const properties = new Map();
const context = vm.createContext({ console, PropertiesService: { getScriptProperties: () => ({
  getProperty: key => properties.get(key), setProperty: (key, value) => properties.set(key, value),
}) }, LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) } });
vm.runInContext(read('Code.gs') + '\n' + read('InternalNotifications.gs'), context);
context.sha256Text_ = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const user = { actorName: '이은범', employeeNumber: 'GNS-018', department: '고색연구소', role: 'registrar' };
let session = user;
context.requireSessionInfo_ = () => session;
const row = (size, cells) => Object.assign(Array(size).fill(''), cells);
const sources = {
  requests: [
    row(12, {0:'REQ-MINE',1:'2026-09-08',2:'이은범',4:'정보자산 수정',6:'Office',7:'수정 요청',8:'처리 대기'}),
    row(12, {0:'REQ-OTHER',1:'2026-09-08',2:'다른 사람',4:'실물자산 수정',8:'처리 완료',11:'비공개 답변'}),
    row(12, {0:'REQ-PENDING',1:'2026-09-08',2:'다른 사람',4:'기타 정정',8:'처리 대기'}),
  ],
  departments: [row(16, {0:'DEPT-MINE',1:'2026-09-08',2:'이은범',3:'GNS-018',5:'화성1공장',8:'승인',11:'방문 가능'}),
    row(16, {0:'DEPT-OTHER',2:'다른 사람',3:'GNS-900',5:'화성2공장',8:'반려',11:'다른 부서 비공개'})],
  visitors: [row(24, {0:'VISIT-MINE',1:'2026-09-08',2:'반려',7:'이은범',8:'V-1',10:'손님',11:'010-private',16:'일정 변경'}),
    row(24, {0:'VISIT-OTHER',2:'반려',7:'다른 사람',8:'V-2',10:'다른 손님',16:'비공개'})],
  movements: [row(16, {0:'MOVE-MINE',3:'노트북',5:'고색연구소',8:'2026-09-01',9:'2026-09-07',11:'반출중',12:'이은범'}),
    row(16, {0:'MOVE-OTHER',3:'다른 장비',5:'화성2공장',11:'반려',12:'다른 사람'})],
  entries: [row(20, {1:'2026-09-08',2:'손님',4:'회의',6:'10:30',8:'이은범',11:'ENTRY-1',12:'입실',13:'010-private'})],
};
const build = (who = user, data = sources) => context.buildInternalNotifications_(who, data, '2026-09-08');
const feed = build();
assert.deepEqual(Array.from(feed, x=>x.recordId).sort(), ['DEPT-MINE','ENTRY-1','MOVE-MINE','REQ-MINE','VISIT-MINE']);
assert.equal(feed.find(i=>i.recordId==='MOVE-MINE').status,'반입 기한 경과');
assert.ok(!JSON.stringify(feed).includes('010-private'));
const oldId = feed.find(i=>i.recordId==='REQ-MINE').id;
const changed=structuredClone(sources);changed.requests[0][8]='처리 완료';changed.requests[0][11]='수정했습니다';changed.requests[0][10]='2026-09-08 15:00';
assert.notEqual(build(user,changed).find(i=>i.recordId==='REQ-MINE').id,oldId);
assert.ok(build({...user,role:'admin'}).some(i=>i.recordId==='REQ-PENDING'));
assert.ok(!build({...user,role:'admin'}).some(i=>i.recordId==='REQ-OTHER'));
assert.equal(context.markInternalNotificationsRead({adminToken:'mock',ids:[oldId]}).ok,true);
assert.ok(properties.get(context.notificationReadKey_(user)).includes(oldId));
session={...user,actorName:'다른 사람',employeeNumber:'GNS-999'};
assert.equal(properties.get(context.notificationReadKey_(session)),undefined);
session={...user,role:'visitor'};
assert.throws(()=>context.markInternalNotificationsRead({adminToken:'mock',ids:[oldId]}),/내부/);
session=user;
assert.throws(()=>context.markInternalNotificationsRead({adminToken:'mock',ids:['forged']}),/번호/);
// Same count, new response must remain distinct; stable IDs survive repeated polls.
assert.equal(build().find(i=>i.recordId==='REQ-MINE').id,oldId);
console.log('INTERNAL_NOTIFICATIONS_OK: recipient isolation, state changes, overdue, read identity, external denial');
