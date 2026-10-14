import {sendEmail} from './resend';
import {escapeHtml,cleanName} from './text';
import {supabaseAdmin} from './supabaseAdmin';
export function resultEmail({name,makerName,score,total,compatibility}) {
 const comparison=compatibility?`<h2>Personality comparison</h2><p>${compatibility.score}/100 personality similarity</p><ul>${compatibility.traits.map(t=>`<li>${escapeHtml(t.name)}: maker ${t.maker}/5, you ${t.taker}/5; similarity ${t.similarity}/100</li>`).join('')}</ul><p>This custom comparison is a conversation starter, not a prediction of relationship success.</p>`:'';
 return {subject:`Your results for ${cleanName(makerName)}'s quiz`,html:`<h1>Your quiz results</h1><p>Hi ${escapeHtml(name)}, you scored <b>${score}/${total}</b> guessing ${escapeHtml(makerName)}'s answers.</p>${comparison}<p><a href="https://www.yeahyouknowme.app/compatibility">How comparisons work</a></p><p>You requested this one-time result email. No marketing subscription was added.</p>`};
}
export async function emailTakerResult({attemptId,email,...result}) {
 const db=supabaseAdmin();
 try {const sent=await sendEmail({to:email,...resultEmail(result),idempotencyKey:`taker-result-${attemptId}`});await db.from('attempts').update({taker_email_status:sent.skipped?'skipped':'accepted',taker_email_provider_id:sent.id||null}).eq('id',attemptId);}
 catch {console.error('Taker result email could not be sent', {attemptId});await db.from('attempts').update({taker_email_status:'failed'}).eq('id',attemptId);}
}
