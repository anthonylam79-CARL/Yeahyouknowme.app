import {NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabaseAdmin';
import {hashToken} from '@/lib/ids';
import {validProfile} from '@/lib/compatibility';
export async function POST(request,{params}) {
 const {id}=await params;
 let body;try{body=await request.json();}catch{return NextResponse.json({error:'Invalid JSON'},{status:400});}
 if(!body || typeof body.token!=='string')return NextResponse.json({error:'Missing token'},{status:401});
 if(body.profile!==null && (!validProfile(body.profile)||body.shareProfile!==true))return NextResponse.json({error:'Complete all 20 statements and agree to share the comparison'},{status:400});
 const db=supabaseAdmin();const {data:quiz,error}=await db.from('quizzes').select('owner_token_hash').eq('id',id).maybeSingle();
 if(error)return NextResponse.json({error:'Could not load quiz'},{status:500});
 if(!quiz || hashToken(body.token)!==quiz.owner_token_hash)return NextResponse.json({error:'Invalid private results link'},{status:403});
 const {error:saveError}=await db.from('quizzes').update({self_profile:body.profile}).eq('id',id);
 if(saveError)return NextResponse.json({error:'Could not save snapshot'},{status:500});
 return NextResponse.json({available:body.profile!==null});
}
