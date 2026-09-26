const OFFERS = {
  "cashh-starter": { title:"Cashh Radar Opportunity Intelligence Brief — Starter", price:"100.00", kind:"service" },
  "cashh-expanded": { title:"Cashh Radar Opportunity Intelligence Brief — Expanded", price:"200.00", kind:"service" },
  "remote-career-diy": { title:"Remote Career Command Center DIY", price:"29.00", kind:"digital" },
  "ai-project-handoff": { title:"AI Project Handoff Pack", price:"19.00", kind:"digital" },
  "lnc-expanded": { title:"L.N.C. 40 Project Printable — Expanded", price:"39.00", kind:"digital" }
};
const SELLER_EMAIL="anastaysia98@gmail.com";
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
function readiness(env){
 const required=["PAYPAL_CLIENT_ID","PAYPAL_CLIENT_SECRET","PUBLIC_BASE_URL","DELIVERY_TOKEN_SECRET"];
 const missing=required.filter(k=>!String(env[k]||"").trim());
 const invalid=[];
 try{const u=new URL(env.PUBLIC_BASE_URL);if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)invalid.push("PUBLIC_BASE_URL")}catch{if(env.PUBLIC_BASE_URL)invalid.push("PUBLIC_BASE_URL")}
 if(env.DELIVERY_TOKEN_SECRET && new TextEncoder().encode(env.DELIVERY_TOKEN_SECRET).length<32)invalid.push("DELIVERY_TOKEN_SECRET");
 return {ready:missing.length===0&&invalid.length===0,paypal_environment:env.PAYPAL_ENV==="live"?"live":"sandbox",database:"d1",missing,invalid};
}
function config(env){
 return `window.FOUR_OFFER_CONFIG=${JSON.stringify({sellerEmail:SELLER_EMAIL,analyticsUrl:"/api/analytics",deliveryUrl:"/api/delivery",paypalApiReady:readiness(env).ready,paypalEnvironment:env.PAYPAL_ENV==="live"?"live":"sandbox",paypalLinks:{}})};`;
}
async function analytics(req,env){
 if(req.method==="GET"){
  const q=async(sql)=>Number((await env.DB.prepare(sql).first())?.n||0);
  return json({visitors:await q("SELECT COUNT(DISTINCT session_id) n FROM four_offer_events WHERE event_type='visitor'"),page_views:await q("SELECT COUNT(*) n FROM four_offer_events WHERE event_type='page_view'"),page_views_last_2h:await q("SELECT COUNT(*) n FROM four_offer_events WHERE event_type='page_view' AND created_at>=datetime('now','-2 hours')"),checkout_clicks:await q("SELECT COUNT(*) n FROM four_offer_events WHERE event_type='checkout_click'"),intake_clicks:await q("SELECT COUNT(*) n FROM four_offer_events WHERE event_type='intake_click'")});
 }
 if(req.method!=="POST")return json({error:"method_not_allowed"},405);
 const b=await req.json().catch(()=>null); if(!b||!["visitor","page_view","checkout_click","intake_click","download_click"].includes(b.event_type))return json({error:"invalid_event"},400);
 await env.DB.prepare("INSERT INTO four_offer_events(event_type,path,session_id,referrer_host,offer_slug,utm_source,utm_medium,utm_campaign,utm_content) VALUES(?,?,?,?,?,?,?,?,?)").bind(b.event_type,String(b.path||"/").slice(0,300),String(b.session_id||"").slice(0,100)||null,String(b.referrer_host||"").slice(0,200)||null,String(b.offer_slug||"").slice(0,100)||null,String(b.utm_source||"").slice(0,100)||null,String(b.utm_medium||"").slice(0,100)||null,String(b.utm_campaign||"").slice(0,100)||null,String(b.utm_content||"").slice(0,100)||null).run();
 return json({ok:true},201);
}
export default {async fetch(req,env){
 const u=new URL(req.url);
 if(u.pathname==="/health")return json({ok:true,runtime:"cloudflare-workers",database:"d1"});
 if(u.pathname==="/ready"){const s=readiness(env);return json(s,s.ready?200:503)}
 if(u.pathname==="/config.js")return new Response(config(env),{headers:{"content-type":"application/javascript;charset=UTF-8","cache-control":"no-store"}});
 if(u.pathname==="/api/analytics")return analytics(req,env);
 if(u.pathname==="/api/paypal/create-order")return json({error:"paypal_migration_pending"},503);
 if(u.pathname==="/api/delivery")return json({error:"delivery_migration_pending"},503);
 return env.ASSETS.fetch(req);
}};
