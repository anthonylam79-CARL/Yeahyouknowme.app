'use client';
import {useState} from 'react';
import {PROFILE_ITEMS, PROFILE_OPTIONS} from '@/lib/compatibility';
export default function SelfProfileForm({onComplete,onSkip,sharingWith}) {
 const [answers,setAnswers]=useState(Array(20).fill(null));
 const [index,setIndex]=useState(0);
 const [consent,setConsent]=useState(false);
 return <section><h2>Your personality snapshot</h2><p>Describe yourself as you generally are now. Answer about yourself, rather than guessing anyone else.</p>
 <small>Statement {index+1} of 20</small><h3>{PROFILE_ITEMS[index].prompt}</h3>
 {PROFILE_OPTIONS.map((label,value)=><button key={value} className={'opt'+(answers[index]===value?' picked':'')} aria-pressed={answers[index]===value} onClick={()=>setAnswers(old=>old.map((v,i)=>i===index?value:v))}>{label}</button>)}
 {index>0 && <button className="link-btn" onClick={()=>setIndex(index-1)}>Back</button>}
 {index<19 ? <button className="btn" disabled={answers[index]===null} onClick={()=>setIndex(index+1)}>Next</button> : <><label><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> I agree to share my five trait scores and comparison with {sharingWith}. Individual answers stay private.</label><button className="btn" disabled={!consent || answers.some(v=>v===null)} onClick={()=>onComplete(answers)}>Save my snapshot</button></>}
 <button className="link-btn" onClick={onSkip}>Skip for now</button><p className="note">Optional. A conversation starter, not a diagnosis or a prediction of relationship success. <a href="/compatibility">How it works</a></p></section>;
}
