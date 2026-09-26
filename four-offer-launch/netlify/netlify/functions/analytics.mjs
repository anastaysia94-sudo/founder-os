import {getStore} from "@netlify/blobs";

const allowed=new Set(["visitor","page_view","checkout_click","intake_click","download_click"]);
const out=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json","cache-control":"no-store"}});

export default async (req)=>{
  const store=getStore("four-offer-analytics");
  if(req.method==="POST"){
    const body=await req.json().catch(()=>null);
    if(!body||!allowed.has(body.event_type)) return out({error:"invalid_event"},400);
    const id=crypto.randomUUID();
    await store.setJSON("event:"+id,{
      event_type:body.event_type,
      path:String(body.path||"/").slice(0,300),
      session_id:String(body.session_id||"").slice(0,100)||null,
      referrer_host:String(body.referrer_host||"").slice(0,200)||null,
      offer_slug:String(body.offer_slug||"").slice(0,100)||null,
      created_at:new Date().toISOString()
    });
    return out({ok:true},201);
  }
  if(req.method!=="GET") return out({error:"method_not_allowed"},405);
  const {blobs=[]}=await store.list({prefix:"event:"});
  const rows=[];
  for(const item of blobs.slice(-1000)){
    const row=await store.get(item.key,{type:"json"}).catch(()=>null);
    if(row) rows.push(row);
  }
  const cutoff=Date.now()-2*60*60*1000;
  return out({
    visitors:new Set(rows.filter(x=>x.event_type==="visitor").map(x=>x.session_id).filter(Boolean)).size,
    page_views:rows.filter(x=>x.event_type==="page_view").length,
    page_views_last_2h:rows.filter(x=>x.event_type==="page_view"&&Date.parse(x.created_at)>=cutoff).length,
    checkout_clicks:rows.filter(x=>x.event_type==="checkout_click").length,
    intake_clicks:rows.filter(x=>x.event_type==="intake_click").length
  });
};
