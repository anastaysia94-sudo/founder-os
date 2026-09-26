import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
const SECRET_KEY = secretKeysRaw
  ? JSON.parse(secretKeysRaw)["default"]
  : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const USING_LEGACY = !SECRET_KEY.startsWith("sb_secret_");

const ORIGIN_PATTERNS = [
  /^https:\/\/anastaysia94-sudo\.github\.io$/,
  /^https:\/\/[a-z0-9-]+\.chatgpt\.site$/i,
  /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i,
  /^https:\/\/[a-z0-9-]+\.railway\.app$/i,
  /^https:\/\/[a-z0-9.-]+\.railway\.com$/i,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

function originAllowed(origin: string | null) {
  return !origin || origin === 'https://nqcshihyfhthywpseilx.supabase.co' || ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function cors(origin: string | null) {
  const allowed = origin && originAllowed(origin) ? origin : "https://anastaysia94-sudo.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Expose-Headers": "content-disposition,content-length,x-content-sha256",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function adminHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = {
    apikey: SECRET_KEY,
    ...extra,
  };
  if (USING_LEGACY) headers.Authorization = `Bearer ${SECRET_KEY}`;
  return headers;
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function decodeBytea(value: string) {
  if (!value.startsWith("\\x")) throw new Error("unexpected_bytea_format");
  const hex = value.slice(2);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return out;
}

function safeFilename(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 180) || "download.zip";
}

async function rest(path: string, init: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: adminHeaders({ ...(init.headers as Record<string, string> || {}) }),
  });
}

async function logDownload(offerSlug: string) {
  try {
    await rest("four_offer_events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ event_type: "download_click", path: "/delivery", offer_slug: offerSlug }),
    });
  } catch (error) {
    console.error("download analytics failed", error);
  }
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405, origin);
  if (!originAllowed(origin)) return json({ error: "origin_not_allowed" }, 403, origin);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token")?.trim();
    if (!token || token.length < 24 || token.length > 512) return json({ error: "invalid_or_missing_token" }, 401, origin);

    const tokenHash = await sha256Hex(token);
    const tokenQuery = new URLSearchParams({
      select: "token_hash,offer_slug,expires_at,max_downloads,download_count",
      token_hash: `eq.${tokenHash}`,
      limit: "1",
    });
    const tokenRes = await rest(`four_offer_download_tokens?${tokenQuery.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!tokenRes.ok) throw new Error(`token_lookup_${tokenRes.status}`);
    const tokenRows = await tokenRes.json();
    if (!Array.isArray(tokenRows) || tokenRows.length !== 1) return json({ error: "invalid_or_expired_token" }, 401, origin);

    const row = tokenRows[0];
    if (new Date(row.expires_at).getTime() <= Date.now()) return json({ error: "invalid_or_expired_token" }, 401, origin);
    if (Number(row.download_count) >= Number(row.max_downloads)) return json({ error: "download_limit_reached" }, 410, origin);

    const nextCount = Number(row.download_count) + 1;
    const claimQuery = new URLSearchParams({
      token_hash: `eq.${tokenHash}`,
      download_count: `eq.${row.download_count}`,
    });
    const claimRes = await rest(`four_offer_download_tokens?${claimQuery.toString()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ download_count: nextCount, last_downloaded_at: new Date().toISOString() }),
    });
    if (!claimRes.ok) throw new Error(`token_claim_${claimRes.status}`);
    const claimed = await claimRes.json();
    if (!Array.isArray(claimed) || claimed.length !== 1) return json({ error: "token_already_in_use_retry" }, 409, origin);

    const fileQuery = new URLSearchParams({
      select: "offer_slug,filename,mime_type,file_bytes,sha256,size_bytes,active",
      offer_slug: `eq.${row.offer_slug}`,
      active: "eq.true",
      limit: "1",
    });
    const fileRes = await rest(`four_offer_downloads?${fileQuery.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!fileRes.ok) throw new Error(`file_lookup_${fileRes.status}`);
    const files = await fileRes.json();
    if (!Array.isArray(files) || files.length !== 1) return json({ error: "file_unavailable" }, 404, origin);

    const file = files[0];
    const bytes = decodeBytea(file.file_bytes);
    if (bytes.byteLength !== Number(file.size_bytes)) throw new Error("stored_size_mismatch");

    await logDownload(file.offer_slug);

    return new Response(bytes, {
      status: 200,
      headers: {
        ...cors(origin),
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `attachment; filename=\"${safeFilename(file.filename)}\"`,
        "Cache-Control": "private, no-store, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Content-SHA256": file.sha256,
      },
    });
  } catch (error) {
    console.error("delivery failure", error);
    return json({ error: "delivery_failed" }, 500, origin);
  }
});
