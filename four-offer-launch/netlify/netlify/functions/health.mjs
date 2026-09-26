export default async () => new Response(JSON.stringify({
  ok:true,
  runtime:"netlify-functions",
  storage:"netlify-blobs",
  payments_enabled:false
}),{headers:{"content-type":"application/json","cache-control":"no-store"}});
