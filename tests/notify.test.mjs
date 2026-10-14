import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHmac,timingSafeEqual} from 'node:crypto';
let source=readFileSync(new URL('../lib/notify.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
const escapeHtml=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cleanName=v=>String(v||'').replace(/[\r\n]/g,' ').slice(0,30);
const n=new Function('createHmac','timingSafeEqual','escapeHtml','cleanName','formatScore',source+';return {isFirstAfterQuiet,signUnsubscribe,verifyUnsubscribe,buildAttemptEmail};')(createHmac,timingSafeEqual,escapeHtml,cleanName,String);
test('first completion notifies; busy-period repeats are grouped',()=>{
 const a=[{id:'first',created_at:'2026-10-14T12:00:00Z'},{id:'next',created_at:'2026-10-14T12:05:00Z'},{id:'later',created_at:'2026-10-14T13:00:00Z'}];
 assert.equal(n.isFirstAfterQuiet(a,'first'),true);assert.equal(n.isFirstAfterQuiet(a,'next'),false);assert.equal(n.isFirstAfterQuiet(a,'later'),true);
});
test('stop links cannot disable another quiz',()=>{
 process.env.NOTIFY_SECRET='test-only-secret';const sig=n.signUnsubscribe('one');assert.equal(n.verifyUnsubscribe('one',sig),true);assert.equal(n.verifyUnsubscribe('two',sig),false);assert.equal(n.verifyUnsubscribe('one','x'),false);
});
test('email escapes submitted names and does not reveal answer keys or owner tokens',()=>{
 const msg=n.buildAttemptEmail({origin:'https://www.yeahyouknowme.app',quizId:'demo',makerName:'Maker',guesserName:'<img src=x>',score:2,total:5,attemptRows:[{guesser_name:'Player',score:2}]});
 assert.ok(msg.html.includes('&lt;img'));assert.ok(!msg.html.includes('<img'));assert.ok(msg.html.includes('2/5'));assert.ok(!msg.html.includes('?token='));assert.ok(msg.headers['List-Unsubscribe-Post']);
});
