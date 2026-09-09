import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function isPrivateIp(ip:string){
  if(net.isIPv4(ip)){
    const [a,b]=ip.split('.').map(Number);
    return a===10||a===127||a===0||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168);
  }
  const x=ip.toLowerCase();
  return x==='::1'||x==='::'||x.startsWith('fc')||x.startsWith('fd')||x.startsWith('fe8')||x.startsWith('fe9')||x.startsWith('fea')||x.startsWith('feb');
}

async function validateUrl(input:string){
  const u=new URL(input);
  if(!['http:','https:'].includes(u.protocol)) throw new Error('Only http and https website addresses are allowed.');
  if(['localhost','0.0.0.0','127.0.0.1','::1'].includes(u.hostname.toLowerCase())) throw new Error('Local/private addresses are not allowed.');
  const answers=await dns.lookup(u.hostname,{all:true});
  if(!answers.length||answers.some(a=>isPrivateIp(a.address))) throw new Error('Private or unresolved addresses are not allowed.');
  return u;
}

function clean(text:string){return text.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
function meta(html:string,name:string){const re1=new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`,'i');const re2=new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`,'i');return (html.match(re1)||html.match(re2))?.[1]?.trim()||'';}

async function safeFetch(start:URL){
  let current=start;
  for(let i=0;i<4;i++){
    await validateUrl(current.toString());
    const res=await fetch(current,{redirect:'manual',headers:{'user-agent':'FounderDynastyOS-EvidenceBot/1.0'},signal:AbortSignal.timeout(8000)});
    if([301,302,303,307,308].includes(res.status)){
      const loc=res.headers.get('location'); if(!loc) throw new Error('Website redirected without a destination.');
      current=new URL(loc,current); continue;
    }
    if(!res.ok) throw new Error(`Website returned HTTP ${res.status}.`);
    const type=res.headers.get('content-type')||'';
    if(!type.includes('text/html')) throw new Error('This first evidence connector currently supports HTML web pages only.');
    const reader=res.body?.getReader(); let total=0; const chunks:Uint8Array[]=[];
    if(!reader) throw new Error('Website returned no readable body.');
    while(true){const {done,value}=await reader.read();if(done)break;if(value){total+=value.length;if(total>262144)break;chunks.push(value);}}
    const html=new TextDecoder().decode(Buffer.concat(chunks.map(c=>Buffer.from(c))));
    return {html,url:current.toString(),status:res.status};
  }
  throw new Error('Too many redirects.');
}

export async function POST(req:NextRequest){
  try{
    if(!supabaseUrl||!publishableKey) return NextResponse.json({error:'Evidence service is not configured.'},{status:500});
    const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
    if(!token) return NextResponse.json({error:'Sign in first.'},{status:401});
    const body=await req.json();
    const businessId=String(body.businessId||''); const inputUrl=String(body.url||'');
    if(!businessId||!inputUrl) return NextResponse.json({error:'Business and website URL are required.'},{status:400});
    const client=createClient(supabaseUrl,publishableKey,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false}});
    const {data:{user},error:userError}=await client.auth.getUser(token);
    if(userError||!user) return NextResponse.json({error:'Your session is no longer valid.'},{status:401});
    const owned=await client.from('fdos_business_records').select('id').eq('id',businessId).eq('user_id',user.id).maybeSingle();
    if(owned.error||!owned.data) return NextResponse.json({error:'Business record not found.'},{status:404});
    const validated=await validateUrl(inputUrl);
    const fetched=await safeFetch(validated);
    const title=clean((fetched.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1]||'Untitled page').slice(0,240);
    const description=(meta(fetched.html,'description')||meta(fetched.html,'og:description')||clean(fetched.html).slice(0,700)).slice(0,1200);
    const insert=await client.from('fdos_evidence').insert({user_id:user.id,business_id:businessId,evidence_class:'E2',source_type:'website',source_url:fetched.url,title,summary:description,raw:{http_status:fetched.status,captured_title:title,captured_description:description}}).select('id,captured_at').single();
    if(insert.error) throw insert.error;
    await client.from('fdos_memory').insert({user_id:user.id,business_id:businessId,kind:'External evidence captured',summary:`Captured website evidence from ${fetched.url}: ${title}`,evidence_class:'E2'});
    return NextResponse.json({ok:true,evidence:{id:insert.data.id,title,summary:description,url:fetched.url,capturedAt:insert.data.captured_at,evidenceClass:'E2'}});
  }catch(error:any){return NextResponse.json({error:error?.message||'Could not capture website evidence.'},{status:400});}
}
