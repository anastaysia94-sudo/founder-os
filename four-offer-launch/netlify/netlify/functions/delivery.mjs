const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async ()=>json({
  error:"checkout_disabled",
  message:"Digital delivery is packaged and deployable, but payment-gated delivery is disabled on this deployment."
},503);
