import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
const SERVICE_KEY = secretKeysRaw
  ? JSON.parse(secretKeysRaw)["default"]
  : Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const USING_LEGACY = !SERVICE_KEY.startsWith("sb_secret_");
const TABLE = "four_offer_events";
const PUBLIC_EVENTS = new Set(["visitor", "page_view", "checkout_click", "intake_click"]);

const ORIGIN_PATTERNS = [
  /^https:\/\/anastaysia94-sudo\.github\.io$/,
  /^https:\/\/[a-z0-9-]+\.chatgpt\.site$/i,
  /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/i,
  /^https:\/\/[a-z0-9-]+\.railway\.app$/i,
  /^https:\/\/[a-z0-9.-]+\.railway\.com$/i,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

function allowedOrigin(origin: string | null) {
  return !origin || ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function cors(origin: string | null) {
  const value = origin && allowedOrigin(origin) ? origin : "https://anastaysia94-sudo.github.io";
  return {
    "Access-Control-Allow-Origin": value,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  };
}

function json(body: unknown, status = 200, origin: string | null = null) {
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
  const headers: Record<string, string> = { apikey: SERVICE_KEY, ...extra };
  if (USING_LEGACY) headers.Authorization = `Bearer ${SERVICE_KEY}`;
  return headers;
}

function clean(value: unknown, max = 160): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, max);
  return v || null;
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function countEvent(eventType: string, since?: string) {
  const params = new URLSearchParams({ select: "id", event_type: `eq.${eventType}` });
  if (since) params.set("occurred_at", `gte.${since}`);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?${params.toString()}`, {
    method: "GET",
    headers: adminHeaders({ Prefer: "count=exact", Range: "0-0" }),
  });
  if (!res.ok) throw new Error(`count ${eventType} failed: ${res.status}`);
  const range = res.headers.get("content-range") || "*/0";
  const total = Number(range.split("/")[1] || 0);
  return Number.isFinite(total) ? total : 0;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors(origin) });
  }
  if (!allowedOrigin(origin)) return json({ error: "origin_not_allowed" }, 403, origin);

  try {
    if (req.method === "GET") {
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const [visitors, pageViews, pageViews2h, checkoutClicks, downloads, intakeClicks] = await Promise.all([
        countEvent("visitor"),
        countEvent("page_view"),
        countEvent("page_view", since),
        countEvent("checkout_click"),
        countEvent("download_click"),
        countEvent("intake_click"),
      ]);
      return json({
        visitors,
        page_views: pageViews,
        page_views_last_2h: pageViews2h,
        checkout_clicks: checkoutClicks,
        download_clicks: downloads,
        intake_clicks: intakeClicks,
        updated_at: new Date().toISOString(),
      }, 200, origin);
    }

    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "invalid_json" }, 400, origin);

    const eventType = clean((body as Record<string, unknown>).event_type, 40);
    if (!eventType || !PUBLIC_EVENTS.has(eventType)) return json({ error: "invalid_event_type" }, 400, origin);

    const session = (body as Record<string, unknown>).session_id;
    if (!isUuid(session)) return json({ error: "invalid_session_id" }, 400, origin);

    const payload = {
      event_type: eventType,
      path: clean((body as Record<string, unknown>).path, 240) || "/",
      session_id: session,
      referrer_host: clean((body as Record<string, unknown>).referrer_host, 160),
      utm_source: clean((body as Record<string, unknown>).utm_source, 100),
      utm_medium: clean((body as Record<string, unknown>).utm_medium, 100),
      utm_campaign: clean((body as Record<string, unknown>).utm_campaign, 120),
      offer_slug: clean((body as Record<string, unknown>).offer_slug, 80),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: "POST",
      headers: adminHeaders({
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      }),
      body: JSON.stringify(payload),
    });

    if (res.status === 409 && eventType === "visitor") {
      return json({ ok: true, duplicate: true }, 200, origin);
    }
    if (!res.ok) {
      const detail = await res.text();
      console.error("analytics insert failed", res.status, detail.slice(0, 500));
      return json({ error: "insert_failed" }, 500, origin);
    }

    return json({ ok: true }, 201, origin);
  } catch (error) {
    console.error(error);
    return json({ error: "internal_error" }, 500, origin);
  }
});
