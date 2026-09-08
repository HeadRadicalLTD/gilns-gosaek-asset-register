import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from 'file:///C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const notifications=fs.readFileSync(new URL('../google_apps_script/Notifications.html',import.meta.url),'utf8');
const shared=fs.readFileSync(new URL('../google_apps_script/SharedBackground.html',import.meta.url),'utf8');
const browsers=[['Chrome','C:/Program Files/Google/Chrome/Application/chrome.exe'],['Edge','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']];
let checks=0;
for(const [label,executablePath] of browsers){
  const browser=await chromium.launch({headless:true,executablePath});
  try{for(const width of [390,1280]){
    const context=await browser.newContext({viewport:{width,height:844}});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://notification.local/**',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><body data-admin-token="mock" data-user-role="registrar" data-current-module="info" data-web-app-url="https://notification.local/app"><main><select id="sheetName"><option value="L-정보">L-정보</option></select></main>${shared}${notifications}</body>`}));
    await page.addInitScript(()=>{
      window.calls=[];window.noticeRead=false;window.noticeVersion=0;window.failRead=false;
      const runner=(ok,fail)=>new Proxy({}, {get(_,name){
        if(name==='withSuccessHandler')return callback=>runner(callback,fail);
        if(name==='withFailureHandler')return callback=>runner(ok,callback);
        return (...args)=>{window.calls.push({name,args});setTimeout(()=>{
          if(name==='getInternalNotifications'){const terminal=window.noticeVersion===1;ok({ok:true,items:terminal?[]:[{id:(window.noticeVersion===2?'c':'a').repeat(32),module:'requests',recordId:'REQ-1',title:'정보자산 수정',status:'처리 대기',detail:'테스트 <script>evil()</script>',at:'2026-09-08',read:window.noticeRead}],unavailable:[]});}
          else if(name==='markInternalNotificationsRead'){if(window.failRead){fail(new Error('offline'));return;}window.noticeRead=true;ok({ok:true});}
          else if(name==='searchAssetCorrectionTargets')ok({ok:true,results:[{managementNumber:'GNS-S-L-001',itemName:'Office'}]});
          else if(name==='registerManagementRequest')ok({ok:true,requestId:'REQ-2'});
          else if(name==='getAssetCorrectionRequests')ok({ok:true,requests:[{targetName:'Office',status:'처리 완료',reason:'이름 정정',note:'수정했습니다'}]});
          else fail(new Error('Unexpected '+name));
        },20);};
      }});window.google={script:{run:runner()}};
    });
    await page.goto('https://notification.local/app');
    try { await page.waitForFunction(()=>document.querySelector('#gilns-notice-toggle').textContent==='알림 1건',null,{timeout:5000}); }
    catch(error){console.log({errors,details:await page.evaluate(()=>({calls:window.calls,text:document.body.innerText,hidden:document.hidden}))});throw error;}
    const box=await page.locator('#gilns-notices').boundingBox();
    assert.ok(box.x>width/2-190&&Math.abs(box.x+box.width-width)<=20,label+' right aligned');
    assert.ok(Math.abs(box.y+box.height-844)<=20,label+' bottom aligned');
    assert.equal(await page.locator('#gilns-notice-panel').isVisible(),true);
    assert.equal(await page.locator('#gilns-notice-list script').count(),0);
    fs.mkdirSync(new URL('../.codex-analysis/notifications/',import.meta.url),{recursive:true});
    await page.screenshot({path:fileURLToPath(new URL(`../.codex-analysis/notifications/${label}-${width}-open.png`,import.meta.url))});
    const topBox=await page.locator('.gilns-top-button').boundingBox();
    const toggleBox=await page.locator('#gilns-notice-toggle').boundingBox();
    if(width<720)assert.ok(topBox.x+topBox.width<=toggleBox.x,'mobile controls must not overlap');
    await page.getByRole('button',{name:'모두 읽음',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#gilns-notice-toggle').textContent==='알림');
    assert.equal(await page.locator('#gilns-notice-list a').count(),0);
    assert.equal(await page.locator('#gilns-notice-message').innerText(),'현재 알림이 없습니다.');
    await page.getByRole('button',{name:'닫기',exact:true}).click();
    await page.evaluate(()=>{window.noticeRead=false;window.noticeVersion=1;window.gilnsRefreshNotifications();});
    await page.waitForFunction(()=>document.querySelector('#gilns-notice-toggle').textContent==='알림');
    assert.equal(await page.locator('#gilns-notice-list a').count(),0);
    assert.equal(await page.locator('#gilns-notice-message').innerText(),'현재 알림이 없습니다.');
    await page.evaluate(()=>{window.noticeVersion=2;window.gilnsRefreshNotifications();});
    await page.waitForFunction(()=>!document.querySelector('#gilns-notice-panel').hidden);
    await page.evaluate(()=>{window.failRead=true;});
    await page.getByRole('button',{name:'모두 읽음',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('#gilns-notice-message').textContent.includes('실패'));
    assert.equal(await page.locator('#gilns-notice-toggle').innerText(),'알림 1건');
    await page.evaluate(()=>{window.failRead=false;});
    await page.getByRole('button',{name:'닫기',exact:true}).click();
    await page.locator('[aria-label="수정 요청할 자산 검색"]').fill('Office');
    await page.getByRole('button',{name:'자산 검색',exact:true}).click();
    await page.getByRole('button',{name:'Office · GNS-S-L-001'}).click();
    await page.locator('[aria-label="수정 요청 내용과 사유"]').fill('모델명을 변경해 주세요');
    await page.getByRole('button',{name:'관리자에게 수정 요청',exact:true}).click();
    await page.waitForFunction(()=>document.querySelector('.gilns-correction').textContent.includes('REQ-2 수정 요청이 접수'));
    const sent=await page.evaluate(()=>window.calls.find(c=>c.name==='registerManagementRequest').args[0]);
    assert.equal(sent.requestType,'정보자산 수정');assert.equal(sent.targetSheetName,'L-정보');assert.equal(sent.targetId,'GNS-S-L-001');
    await page.waitForFunction(()=>document.querySelector('.gilns-correction').textContent.includes('답변: 수정했습니다'));
    assert.deepEqual(errors,[]);
    fs.mkdirSync(new URL('../.codex-analysis/notifications/',import.meta.url),{recursive:true});
    await page.screenshot({path:fileURLToPath(new URL(`../.codex-analysis/notifications/${label}-${width}.png`,import.meta.url))});
    await page.route('https://notification.local/public',route=>route.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><body>'+notifications+'</body>'}));
    await page.goto('https://notification.local/public');
    assert.equal(await page.locator('#gilns-notices').count(),0);
    assert.equal(await page.evaluate(()=>window.calls.length),0);
    checks++;await context.close();
  }}finally{await browser.close();}
}
console.log('NOTIFICATION_BROWSER_OK='+checks+' (Chrome/Edge desktop/mobile viewports; mocked server)');
