'use client';
import {useState} from 'react';
import SelfProfileForm from './SelfProfileForm';
export default function MakerCompatibility({id,token,available=false}) {
 const [active,setActive]=useState(available),[editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(profile) {
 setBusy(true);setError('');
 try {const res=await fetch(`/api/results/${id}/profile`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,profile,shareProfile:profile!==null})});const data=await res.json();if(!res.ok)throw Error(data.error);setActive(profile!==null);setEditing(false);}catch(e){setError(e.message||'Could not save your snapshot');}finally{setBusy(false);}
 }
 return <section><h2>Compare your personalities</h2><p>{active?'Your snapshot is enabled. Takers can answer about themselves to compare your five personality traits.':'Add your own optional 20-statement snapshot so takers can compare their personality with yours.'}</p>{busy?<p>Saving…</p>:editing?<SelfProfileForm onComplete={save} onSkip={()=>setEditing(false)} sharingWith="people who complete your quiz"/>:<><button className="btn alt" onClick={()=>setEditing(true)}>{active?'Update my snapshot':'Add my personality snapshot'}</button>{active&&<button className="link-btn" onClick={()=>save(null)}>Disable comparisons and remove my snapshot</button>}</>}{error&&<p className="error">{error}</p>}</section>;
}
