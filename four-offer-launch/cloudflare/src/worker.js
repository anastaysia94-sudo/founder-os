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

function paypalBase(env){return env.PAYPAL_ENV==="live"?"https://api-m.paypal.com":"https://api-m.sandbox.paypal.com"}
async function paypalToken(env){
 const auth=btoa(env.PAYPAL_CLIENT_ID+":"+env.PAYPAL_CLIENT_SECRET);
 const r=await fetch(paypalBase(env)+"/v1/oauth2/token",{method:"POST",headers:{Authorization:"Basic "+auth,"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
 const d=await r.json().catch(()=>({})); if(!r.ok||!d.access_token)throw new Error("paypal_oauth_"+r.status); return d.access_token;
}
async function paypalRequest(env,path,init={}){
 const token=await paypalToken(env); const r=await fetch(paypalBase(env)+path,{...init,headers:{Authorization:"Bearer "+token,Accept:"application/json","Content-Type":"application/json",...(init.headers||{})}});
 return {r,d:await r.json().catch(()=>({}))};
}
async function createOrder(req,env){
 if(req.method!=="POST")return json({error:"method_not_allowed"},405);
 const origin=req.headers.get("Origin"); if(origin&&origin!==new URL(env.PUBLIC_BASE_URL).origin)return json({error:"origin_not_allowed"},403);
 const b=await req.json().catch(()=>null), slug=String(b?.offer_slug||""), offer=OFFERS[slug]; if(!offer)return json({error:"invalid_offer"},400);
 const base=new URL(env.PUBLIC_BASE_URL).origin;
 const item={name:offer.title,unit_amount:{currency_code:"USD",value:offer.price},quantity:"1"}; if(offer.kind==="digital")item.category="DIGITAL_GOODS";
 const payload={intent:"CAPTURE",purchase_units:[{reference_id:slug,custom_id:"four-offer:"+slug,description:offer.title,amount:{currency_code:"USD",value:offer.price,breakdown:{item_total:{currency_code:"USD",value:offer.price}}},items:[item]}],payment_source:{paypal:{experience_context:{brand_name:"SmartPickShop Holdings",shipping_preference:"NO_SHIPPING",user_action:"PAY_NOW",return_url:base+"/paypal/return?offer="+encodeURIComponent(slug),cancel_url:base+"/paypal/cancel?offer="+encodeURIComponent(slug)}}}};
 const {r,d}=await paypalRequest(env,"/v2/checkout/orders",{method:"POST",headers:{"PayPal-Request-Id":crypto.randomUUID(),Prefer:"return=representation"},body:JSON.stringify(payload)});
 if(!r.ok||!d.id)return json({error:"paypal_create_"+r.status},502); const approval=d.links?.find(x=>x.rel==="approve"||x.rel==="payer-action")?.href; if(!approval)return json({error:"paypal_missing_approval_url"},502);
 await env.DB.prepare("INSERT INTO four_offer_payments(paypal_order_id,offer_slug,amount,currency_code,status,updated_at) VALUES(?,?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(paypal_order_id) DO UPDATE SET status=excluded.status,updated_at=CURRENT_TIMESTAMP").bind(d.id,slug,Number(offer.price),"USD","CREATED").run();
 return json({order_id:d.id,approve_url:approval},201);
}
async function captureOrder(env,orderId,slug){
 const offer=OFFERS[slug]; if(!offer)throw new Error("invalid_offer");
 const {r,d}=await paypalRequest(env,"/v2/checkout/orders/"+encodeURIComponent(orderId)+"/capture",{method:"POST",headers:{"PayPal-Request-Id":"capture-"+orderId,Prefer:"return=representation"},body:"{}"});
 if(!r.ok)throw new Error("paypal_capture_"+r.status); const unit=d.purchase_units?.[0],cap=unit?.payments?.captures?.[0],paid=cap?.amount||unit?.amount||{};
 if(d.status!=="COMPLETED"||cap?.status!=="COMPLETED"||unit?.reference_id!==slug||unit?.custom_id!=="four-offer:"+slug||paid.currency_code!=="USD"||Number(paid.value).toFixed(2)!==Number(offer.price).toFixed(2))throw new Error("paypal_verification_failed");
 const buyer=d.payment_source?.paypal?.email_address||d.payer?.email_address||null;
 await env.DB.prepare("UPDATE four_offer_payments SET paypal_capture_id=?,status='COMPLETED',buyer_email=?,completed_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE paypal_order_id=? AND offer_slug=?").bind(cap.id,buyer,orderId,slug).run();
 return {offer,capture:cap,buyer};
}


function bytesToHex(buf){return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("")}
async function hmacToken(secret,orderId,slug){
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const sig=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode("four-offer:"+orderId+":"+slug));
 return btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");
}
async function sha256(value){return bytesToHex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)))}
async function issueDownload(env,orderId,slug){
 const token=await hmacToken(env.DELIVERY_TOKEN_SECRET,orderId,slug),hash=await sha256(token),expires=new Date(Date.now()+7*86400000).toISOString();
 await env.DB.prepare("INSERT OR IGNORE INTO four_offer_download_tokens(token_hash,offer_slug,payment_reference,expires_at,max_downloads,download_count) VALUES(?,?,?,?,3,0)").bind(hash,slug,orderId,expires).run();
 await env.DB.prepare("UPDATE four_offer_payments SET delivery_token_hash=?,updated_at=CURRENT_TIMESTAMP WHERE paypal_order_id=?").bind(hash,orderId).run();
 return token;
}
async function paypalReturn(env,u){
 const slug=u.searchParams.get("offer")||"",orderId=u.searchParams.get("token")||"",offer=OFFERS[slug]; if(!offer||!orderId)return json({error:"invalid_return_parameters"},400);
 let row=await env.DB.prepare("SELECT status,paypal_capture_id FROM four_offer_payments WHERE paypal_order_id=? AND offer_slug=?").bind(orderId,slug).first();
 if(row?.status!=="COMPLETED")await captureOrder(env,orderId,slug);
 if(offer.kind!=="digital")return new Response("<!doctype html><title>Payment verified</title><h1>Payment verified</h1><p>Your service order is recorded. Continue with the written intake by email.</p>",{headers:{"content-type":"text/html;charset=UTF-8"}});
 const token=await issueDownload(env,orderId,slug);
 return new Response("<!doctype html><title>Purchase complete</title><h1>Payment verified</h1><p>Your protected download is unlocked.</p><p><a href='/api/delivery?token="+encodeURIComponent(token)+"'>Download your file</a></p>",{headers:{"content-type":"text/html;charset=UTF-8"}});
}
async function delivery(req,env,u){
 const token=u.searchParams.get("token")||""; if(!token)return json({error:"missing_token"},400); const hash=await sha256(token);
 const row=await env.DB.prepare("SELECT offer_slug,expires_at,max_downloads,download_count FROM four_offer_download_tokens WHERE token_hash=?").bind(hash).first();
 if(!row)return json({error:"invalid_token"},404); if(Date.parse(row.expires_at)<=Date.now())return json({error:"expired_token"},410); if(row.download_count>=row.max_downloads)return json({error:"download_limit_reached"},410);
 const assetPath="/products/"+row.offer_slug+".zip";
 const assetReq=new Request(new URL(assetPath,req.url),req);
 const object=await env.ASSETS.fetch(assetReq); if(!object.ok)return json({error:"product_not_uploaded"},503);
 await env.DB.prepare("UPDATE four_offer_download_tokens SET download_count=download_count+1 WHERE token_hash=?").bind(hash).run();
 const h=new Headers(object.headers); h.set("content-disposition",'attachment; filename="'+row.offer_slug+'.zip"'); h.set("cache-control","private, no-store"); return new Response(object.body,{status:200,headers:h});
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
 if(u.pathname==="/api/paypal/create-order")return createOrder(req,env);
 if(u.pathname==="/api/delivery")return delivery(req,env,u);
 if(u.pathname==="/paypal/return")return paypalReturn(env,u);
 if(u.pathname==="/paypal/cancel")return new Response("<!doctype html><title>Checkout cancelled</title><h1>Checkout cancelled</h1><p>No payment was captured.</p>",{headers:{"content-type":"text/html;charset=UTF-8"}});
 return env.ASSETS.fetch(req);
}};
