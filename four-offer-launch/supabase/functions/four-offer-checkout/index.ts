import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import postgres from 'npm:postgres@3.4.5';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 1 });
const PROJECT_URL = Deno.env.get('SUPABASE_URL') || 'https://nqcshihyfhthywpseilx.supabase.co';
const DELIVERY_URL = `${PROJECT_URL}/functions/v1/four-offer-delivery`;
const CHECKOUT_URL = `${PROJECT_URL}/functions/v1/four-offer-checkout`;
const ALLOWED_ORIGINS = new Set([
  'https://four-offer-launch-smart-pick-shop-holdings-llc.vercel.app',
  'https://four-offer-launch-5mjfm8pny-smart-pick-shop-holdings-llc.vercel.app',
  'https://nqcshihyfhthywpseilx.supabase.co',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]);
const OFFERS: Record<string, { title: string; price: string; kind: 'digital' | 'service' }> = {
  'cashh-starter': { title: 'Cashh Radar Opportunity Intelligence Brief — Starter', price: '100.00', kind: 'service' },
  'cashh-expanded': { title: 'Cashh Radar Opportunity Intelligence Brief — Expanded', price: '200.00', kind: 'service' },
  'remote-career-diy': { title: 'Remote Career Command Center DIY', price: '29.00', kind: 'digital' },
  'ai-project-handoff': { title: 'AI Project Handoff Pack', price: '19.00', kind: 'digital' },
  'lnc-expanded': { title: 'L.N.C. 40 Project Printable — Expanded', price: '39.00', kind: 'digital' }
};

type Config = {
  paypal_client_id: string;
  paypal_client_secret: string;
  delivery_token_secret: string;
  seller_email: string;
  paypal_env: 'sandbox' | 'live';
};
let configCache: { value: Config | null; expires: number } = { value: null, expires: 0 };
let oauthCache: { value: string; expires: number } = { value: '', expires: 0 };

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://nqcshihyfhthywpseilx.supabase.co';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store'
  };
}
function json(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8' } });
}
function html(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' } });
}
function esc(v: unknown) { return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }

async function getConfig(): Promise<Config> {
  if (configCache.value && configCache.expires > Date.now()) return configCache.value;
  const rows = await sql<{ decrypted_secret: string }[]>`select decrypted_secret from vault.decrypted_secrets where name = 'four_offer_paypal_config' limit 1`;
  if (!rows.length) throw new Error('missing_checkout_config');
  const parsed = JSON.parse(rows[0].decrypted_secret) as Config;
  for (const key of ['paypal_client_id','paypal_client_secret','delivery_token_secret','seller_email','paypal_env'] as const) {
    if (!parsed[key]) throw new Error(`missing_${key}`);
  }
  if (new TextEncoder().encode(parsed.delivery_token_secret).length < 32) throw new Error('weak_delivery_token_secret');
  configCache = { value: parsed, expires: Date.now() + 60_000 };
  return parsed;
}
function apiBase(cfg: Config) { return cfg.paypal_env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }
async function paypalToken(cfg: Config) {
  if (oauthCache.value && oauthCache.expires > Date.now() + 60_000) return oauthCache.value;
  const basic = btoa(`${cfg.paypal_client_id}:${cfg.paypal_client_secret}`);
  const r = await fetch(`${apiBase(cfg)}/v1/oauth2/token`, { method: 'POST', headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials' });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.access_token) throw new Error(`paypal_oauth_${r.status}`);
  oauthCache = { value: data.access_token, expires: Date.now() + Number(data.expires_in || 300) * 1000 };
  return oauthCache.value;
}
async function paypalRequest(cfg: Config, endpoint: string, init: RequestInit) {
  const token = await paypalToken(cfg);
  const r = await fetch(`${apiBase(cfg)}${endpoint}`, { ...init, headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) } });
  const data = await r.json().catch(() => ({}));
  return { r, data };
}

async function createOrder(offerSlug: string) {
  const offer = OFFERS[offerSlug];
  if (!offer) throw new Error('invalid_offer');
  const cfg = await getConfig();
  const item: Record<string, unknown> = { name: offer.title, unit_amount: { currency_code: 'USD', value: offer.price }, quantity: '1' };
  if (offer.kind === 'digital') item.category = 'DIGITAL_GOODS';
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [{ reference_id: offerSlug, custom_id: `four-offer:${offerSlug}`, description: offer.title, amount: { currency_code: 'USD', value: offer.price, breakdown: { item_total: { currency_code: 'USD', value: offer.price } } }, items: [item] }],
    payment_source: { paypal: { experience_context: { brand_name: 'SmartPickShop Holdings', shipping_preference: 'NO_SHIPPING', user_action: 'PAY_NOW', return_url: `${CHECKOUT_URL}?action=return&offer=${encodeURIComponent(offerSlug)}`, cancel_url: `${CHECKOUT_URL}?action=cancel&offer=${encodeURIComponent(offerSlug)}` } } }
  };
  const { r, data } = await paypalRequest(cfg, '/v2/checkout/orders', { method: 'POST', headers: { 'PayPal-Request-Id': crypto.randomUUID(), Prefer: 'return=representation' }, body: JSON.stringify(payload) });
  if (!r.ok || !data.id) throw new Error(`paypal_create_${r.status}`);
  const approval = Array.isArray(data.links) ? data.links.find((x: any) => x.rel === 'approve' || x.rel === 'payer-action') : null;
  if (!approval?.href) throw new Error('paypal_missing_approval_url');
  await sql`insert into public.four_offer_payments (paypal_order_id, offer_slug, amount, currency_code, status, updated_at) values (${data.id}, ${offerSlug}, ${Number(offer.price)}, 'USD', 'CREATED', now()) on conflict (paypal_order_id) do update set offer_slug=excluded.offer_slug, amount=excluded.amount, status='CREATED', updated_at=now()`;
  return { order_id: data.id, approve_url: approval.href };
}

async function captureOrder(orderId: string, offerSlug: string) {
  const offer = OFFERS[offerSlug];
  if (!offer) throw new Error('invalid_offer');
  const cfg = await getConfig();
  const { r, data } = await paypalRequest(cfg, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, { method: 'POST', headers: { 'PayPal-Request-Id': `capture-${orderId}` }, body: '{}' });
  if (!r.ok) throw new Error(`paypal_capture_${r.status}`);
  const unit = Array.isArray(data.purchase_units) ? data.purchase_units[0] : null;
  const capture = unit?.payments?.captures?.[0];
  if (data.status !== 'COMPLETED' || capture?.status !== 'COMPLETED') throw new Error('paypal_not_completed');
  if (unit?.reference_id !== offerSlug || unit?.custom_id !== `four-offer:${offerSlug}`) throw new Error('paypal_offer_mismatch');
  const paid = capture.amount || unit.amount || {};
  if (paid.currency_code !== 'USD' || Number(paid.value).toFixed(2) !== Number(offer.price).toFixed(2)) throw new Error('paypal_amount_mismatch');
  const receiver = String(capture.payee?.email_address || unit.payee?.email_address || '').toLowerCase();
  if (receiver && receiver !== cfg.seller_email.toLowerCase()) throw new Error('paypal_receiver_mismatch');
  const buyerEmail = data.payment_source?.paypal?.email_address || data.payer?.email_address || null;
  return { capture, buyerEmail, cfg, offer };
}

async function hmacToken(secret: string, input: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,'0')).join('');
}
async function fulfill(orderId: string, offerSlug: string, captureId: string, buyerEmail: string | null, cfg: Config) {
  const offer = OFFERS[offerSlug];
  if (!offer) throw new Error('invalid_offer');
  let rawToken: string | null = null;
  let tokenHash: string | null = null;
  if (offer.kind === 'digital') {
    rawToken = await hmacToken(cfg.delivery_token_secret, `four-offer:${orderId}:${offerSlug}`);
    tokenHash = await sha256(rawToken);
    await sql`insert into public.four_offer_download_tokens (token_hash, offer_slug, payment_reference, expires_at, max_downloads, download_count) values (${tokenHash}, ${offerSlug}, ${orderId}, now() + interval '7 days', 3, 0) on conflict (token_hash) do nothing`;
  }
  await sql`insert into public.four_offer_payments (paypal_order_id, paypal_capture_id, offer_slug, amount, currency_code, status, buyer_email, delivery_token_hash, completed_at, updated_at) values (${orderId}, ${captureId}, ${offerSlug}, ${Number(offer.price)}, 'USD', 'COMPLETED', ${buyerEmail}, ${tokenHash}, now(), now()) on conflict (paypal_order_id) do update set paypal_capture_id=excluded.paypal_capture_id, status='COMPLETED', buyer_email=excluded.buyer_email, delivery_token_hash=coalesce(public.four_offer_payments.delivery_token_hash, excluded.delivery_token_hash), completed_at=coalesce(public.four_offer_payments.completed_at, excluded.completed_at), updated_at=now()`;
  return rawToken ? `${DELIVERY_URL}?token=${encodeURIComponent(rawToken)}` : null;
}
function completePage(title: string, downloadUrl: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Purchase complete</title><style>body{margin:0;background:#090414;color:#f7f2ff;font:16px/1.55 system-ui;padding:30px}.box{max-width:680px;margin:8vh auto;background:#180d31;border:1px solid #49306f;border-radius:22px;padding:28px}.btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#ff43d1,#8c5cff);color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:13px}.muted{color:#b9acd0}</style></head><body><main class="box"><p>✅ Payment verified</p><h1>${esc(title)}</h1><p>Your protected download is unlocked. The link allows up to three downloads and expires after seven days.</p><a class="btn" href="${esc(downloadUrl)}">Download your ZIP</a></main></body></html>`;
}
function servicePage(title: string, orderId: string, sellerEmail: string) {
  const subject = encodeURIComponent(`${title} — paid intake`);
  const body = encodeURIComponent(`PayPal order: ${orderId}\n\nBusiness/service:\nCustomer type:\nGeography/remote:\nMinimum project value:\nRequired contact method:\nExclusions:\nExisting outreach/clients to exclude:\nDeadline:\nBuyer-supplied facts I may quote:\n`);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Payment verified</title><style>body{margin:0;background:#090414;color:#f7f2ff;font:16px/1.55 system-ui;padding:30px}.box{max-width:680px;margin:8vh auto;background:#180d31;border:1px solid #49306f;border-radius:22px;padding:28px}.btn{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#ff43d1,#8c5cff);color:white;text-decoration:none;font-weight:800;padding:13px 18px;border-radius:13px}</style></head><body><main class="box"><p>✅ Payment verified</p><h1>${esc(title)}</h1><p>Send the written intake so the custom research can be scoped and fulfilled.</p><a class="btn" href="mailto:${esc(sellerEmail)}?subject=${subject}&body=${body}">Send paid intake</a><p>Order reference: ${esc(orderId)}</p></main></body></html>`;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) });
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || '';
  try {
    if (action === 'health') {
      const cfg = await getConfig();
      return json({ ok: true, paypal_environment: cfg.paypal_env, configured: true }, 200, origin);
    }
    if (action === 'create-order') {
      if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, origin);
      if (!origin || !ALLOWED_ORIGINS.has(origin)) return json({ error: 'origin_not_allowed' }, 403, origin);
      const body = await req.json().catch(() => ({}));
      const offerSlug = String(body.offer_slug || '');
      if (!OFFERS[offerSlug]) return json({ error: 'invalid_offer' }, 400, origin);
      return json(await createOrder(offerSlug), 201, origin);
    }
    if (action === 'return') {
      const offerSlug = url.searchParams.get('offer') || '';
      const orderId = url.searchParams.get('token') || '';
      const offer = OFFERS[offerSlug];
      if (!offer || !/^[A-Z0-9-]{10,60}$/i.test(orderId)) return html('<h1>Invalid PayPal return</h1>', 400);
      const existing = await sql<any[]>`select paypal_capture_id, offer_slug, status, buyer_email from public.four_offer_payments where paypal_order_id = ${orderId} limit 1`;
      let downloadUrl: string | null = null;
      const cfg = await getConfig();
      if (existing[0]?.status === 'COMPLETED' && existing[0]?.offer_slug === offerSlug && existing[0]?.paypal_capture_id) {
        downloadUrl = await fulfill(orderId, offerSlug, existing[0].paypal_capture_id, existing[0].buyer_email, cfg);
      } else {
        const paid = await captureOrder(orderId, offerSlug);
        downloadUrl = await fulfill(orderId, offerSlug, paid.capture.id, paid.buyerEmail, paid.cfg);
      }
      return html(offer.kind === 'digital' ? completePage(offer.title, downloadUrl!) : servicePage(offer.title, orderId, cfg.seller_email));
    }
    if (action === 'cancel') {
      const offerSlug = url.searchParams.get('offer') || '';
      return html(`<!doctype html><html><body style="background:#090414;color:#f7f2ff;font:16px system-ui;padding:30px"><main style="max-width:680px;margin:8vh auto"><h1>Checkout cancelled</h1><p>No payment was captured.</p><p><a style="color:#37e9ff" href="https://four-offer-launch-smart-pick-shop-holdings-llc.vercel.app/">Return to storefront</a></p><p>${esc(OFFERS[offerSlug]?.title || '')}</p></main></body></html>`);
    }
    return json({ error: 'not_found' }, 404, origin);
  } catch (e) {
    console.error('four-offer-checkout', e instanceof Error ? e.message : String(e));
    return json({ error: 'checkout_error' }, 500, origin);
  }
});
