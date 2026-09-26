export default async () => {
  const missing=[];
  if(!process.env.URL && !process.env.DEPLOY_PRIME_URL) missing.push("NETLIFY_SITE_URL");
  return new Response(JSON.stringify({
    ready:missing.length===0,
    runtime:"netlify-functions",
    storage:"netlify-blobs",
    payments_enabled:false,
    missing
  }),{
    status:missing.length?503:200,
    headers:{"content-type":"application/json","cache-control":"no-store"}
  });
};
