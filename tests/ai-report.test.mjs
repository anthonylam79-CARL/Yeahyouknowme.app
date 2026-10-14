import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { reportEvidence, evidenceFingerprint, reportSchema } from '../lib/aiReport.js';
const quiz = { id:'demo', audience:'BFF', question_ids:[0,1], answers:[0,1], owner_token_hash:'hashed',is_premium:true };
const attempts = [{ guesses:[0,2],guesser_name:'SECRET NAME',gender:'SECRET GENDER' },{ guesses:[1,2] }];
test('evidence contains counts, no personal fields, and changes with new answers', () => {
 const evidence=reportEvidence(quiz,attempts);
 assert.equal(evidence.responses,2);assert.equal(evidence.questions[0].correctCount,1);assert.equal(evidence.questions[1].othersGuessed[0].count,2);
 assert.ok(!JSON.stringify(evidence).includes('SECRET'));
 assert.equal(evidenceFingerprint(evidence),evidenceFingerprint(reportEvidence(quiz,attempts)));
 assert.notEqual(evidenceFingerprint(evidence),evidenceFingerprint(reportEvidence(quiz,[...attempts,{guesses:[0,0]}])));
});
const report={summary:'Demo',explanation:'Demo explanation',conversationStarters:['What made you guess that?'],nextQuestions:['What would you ask next?']};
function route({row=quiz,cache=null,claim=true,generated=report}={}) {
 let calls=0,reservations=0;
 const db={from(table){ const q={select(){return q},eq(){return q},update(){return q},maybeSingle:async()=>({data:table==='quizzes'?row:cache}),then(resolve){resolve({data:table==='attempts'?attempts:null})}};return q;},rpc:async()=>{reservations++;return {data:claim}}};
 let source=readFileSync(new URL('../app/api/results/[id]/ai/route.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export const maxDuration','const maxDuration').replace('export async function POST','async function POST');
 const POST=new Function('NextResponse','generateText','Output','supabaseAdmin','hashToken','reportEvidence','evidenceFingerprint','reportSchema','REPORT_SYSTEM',source+'\nreturn POST;')({json:(b,o)=>Response.json(b,o)},async()=>{calls++;return {output:generated}},{object:s=>s},()=>db,t=>t==='valid'?'hashed':'bad',reportEvidence,evidenceFingerprint,reportSchema,'Grounded');
 return {POST,calls:()=>calls,reservations:()=>reservations};
}
async function request(r,token){return r.POST({json:async()=>({token})},{params:Promise.resolve({id:'demo'})});}
test('missing token, wrong owner and unpaid requests never call AI',async()=>{
 process.env.AI_REPORTS_ENABLED='true';
 for(const [r,t,status] of [[route(),undefined,401],[route(),'wrong',403],[route({row:{...quiz,is_premium:false}}),'valid',402]]) {assert.equal((await request(r,t)).status,status);assert.equal(r.calls(),0);assert.equal(r.reservations(),0);}
});
test('disabled gate never spends',async()=>{process.env.AI_REPORTS_ENABLED='false';const r=route();assert.equal((await request(r,'valid')).status,503);assert.equal(r.calls(),0);});
test('unchanged cached report does not reserve or call AI',async()=>{
 process.env.AI_REPORTS_ENABLED='true';const r=route({cache:{fingerprint:evidenceFingerprint(reportEvidence(quiz,attempts)),report,based_on:2}});
 assert.equal((await request(r,'valid')).status,200);assert.equal(r.calls(),0);assert.equal(r.reservations(),0);
});
test('budget or concurrency rejection never calls AI',async()=>{const r=route({claim:false});assert.equal((await request(r,'valid')).status,429);assert.equal(r.calls(),0);});
test('successful generation persists validated output',async()=>{const r=route();const response=await request(r,'valid');assert.equal(response.status,200);assert.deepEqual((await response.json()).report,report);assert.equal(r.calls(),1);});
test('malformed AI output fails without retrying',async()=>{const r=route({generated:{summary:'bad'}});assert.equal((await request(r,'valid')).status,503);assert.equal(r.calls(),1);});
