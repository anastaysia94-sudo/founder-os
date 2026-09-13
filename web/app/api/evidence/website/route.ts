import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import dns from 'node:dns/promises';
import net from 'node:net';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const MAX_HTML_BYTES = 262_144;

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }

  const x = ip.toLowerCase();
  return x === '::1' || x === '::' || x.startsWith('fc') || x.startsWith('fd') || x.startsWith('fe8') || x.startsWith('fe9') || x.startsWith('fea') || x.startsWith('feb');
}

async function validateUrl(input: string) {
  const u = new URL(input);
  if (!['http:', 'https:'].includes(u.protocol)) throw new Error('Only http and https website addresses are allowed.');
  if (['localhost', '0.0.0.0', '127.0.0.1', '::1'].includes(u.hostname.toLowerCase())) throw new Error('Local/private addresses are not allowed.');

  const answers = await dns.lookup(u.hostname, { all: true });
  if (!answers.length || answers.some((a) => isPrivateIp(a.address))) throw new Error('Private or unresolved addresses are not allowed.');
  return u;
}

function clean(text: string) {
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function meta(html: string, name: string) {
  const re1 = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["'][^>]*>`, 'i');
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["'][^>]*>`, 'i');
  return (html.match(re1) || html.match(re2))?.[1]?.trim() || '';
}

async function safeFetch(start: URL) {
  let current = start;

  for (let i = 0; i < 4; i += 1) {
    await validateUrl(current.toString());
    const res = await fetch(current, {
      redirect: 'manual',
      headers: { 'user-agent': 'FounderDynastyOS-EvidenceBot/1.2' },
      signal: AbortSignal.timeout(8000),
    });

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get('location');
      if (!loc) throw new Error('Website redirected without a destination.');
      current = new URL(loc, current);
      continue;
    }

    if (!res.ok) throw new Error(`Website returned HTTP ${res.status}.`);
    const type = res.headers.get('content-type') || '';
    if (!type.includes('text/html')) throw new Error('This evidence connector currently supports HTML web pages only.');

    const reader = res.body?.getReader();
    if (!reader) throw new Error('Website returned no readable body.');

    let total = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.length;
      if (total > MAX_HTML_BYTES) throw new Error('Website page is too large for the evidence connector.');
      chunks.push(value);
    }

    const html = new TextDecoder().decode(Buffer.concat(chunks.map((c) => Buffer.from(c))));
    return { html, url: current.toString(), status: res.status };
  }

  throw new Error('Too many redirects.');
}

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !publishableKey) return NextResponse.json({ error: 'Evidence service is not configured.' }, { status: 500 });

    const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

    const body = await req.json();
    const businessId = String(body.businessId || '');
    const inputUrl = String(body.url || '');
    if (!businessId || !inputUrl) return NextResponse.json({ error: 'Business and website URL are required.' }, { status: 400 });

    const client = createClient(supabaseUrl, publishableKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: userError } = await client.auth.getUser(token);
    if (userError || !user) return NextResponse.json({ error: 'Your session is no longer valid.' }, { status: 401 });

    const owned = await client
      .from('fdos_business_records')
      .select('id,offer,problem,customer,purpose')
      .eq('id', businessId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (owned.error || !owned.data) return NextResponse.json({ error: 'Business record not found.' }, { status: 404 });

    const fetched = await safeFetch(await validateUrl(inputUrl));
    const pageText = clean(fetched.html);
    const title = clean((fetched.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || 'Untitled page').slice(0, 240);
    const description = (meta(fetched.html, 'description') || meta(fetched.html, 'og:description') || pageText.slice(0, 700)).slice(0, 1200);

    const proposals: Array<{ target_type: string; title: string; rationale: string; payload: Record<string, unknown> }> = [];
    const add = (target_type: string, proposalTitle: string, rationale: string, payload: Record<string, unknown>) => {
      proposals.push({ target_type, title: proposalTitle, rationale, payload });
    };

    add(
      'value',
      `Treat “${title}” as a public business asset`,
      'This is a direct E2 observation from the captured public page. Approving it adds the page to the Value Map as an Asset, without claiming the page proves customer demand.',
      { kind: 'Asset', title: `Public website: ${title}`, detail: description, evidence_class: 'E2' },
    );

    add(
      'opportunity',
      'Test whether the public promise on this page is clear and valuable',
      'The page is real E2 evidence. The opportunity itself is an E5 hypothesis: test whether customers understand and value the promise before treating it as proven.',
      { title: 'Test the promise shown on the public website', observation: `The captured page presents “${title}”. Test whether the intended customer understands and values that promise.`, evidence_class: 'E5', confidence: 55, impact: 7, speed: 7, reversibility: 9, cost: 2, complexity: 3, risk: 2 },
    );

    add(
      'risk',
      'Check for drift between the website and Business DNA',
      'A mismatch between public positioning and the internal business model could create confusion. This is an E5 risk hypothesis derived from E2 source material, not a verified failure.',
      { title: 'Public positioning may drift from Business DNA', level: 'Medium', response: 'Compare the captured website language with the saved problem, customer, offer and purpose. Resolve meaningful mismatches deliberately.', evidence_class: 'E5' },
    );

    add(
      'decision',
      'Decide whether this public positioning should become canonical',
      'The captured page provides a real external reference point. Founder approval is required before it changes the business model.',
      { question: 'Should the positioning on this captured website page become part of the canonical Business DNA?', next: 'Compare it with customer evidence and the current Business DNA, then keep, revise, or reject it.', evidence_class: 'E5' },
    );

    const offer = String((owned.data as { offer?: string }).offer || '').trim();
    if (!offer || /not decided|unknown|untitled/i.test(offer)) {
      add(
        'dna',
        'Propose a first Offer description from the public website',
        'Business DNA is currently missing a concrete offer. This proposal uses the captured public description as a starting point only; approval is required and the source remains visible.',
        { field: 'offer', value: description.slice(0, 500), evidence_class: 'E2' },
      );
    }

    const persisted = await client.rpc('fdos_store_website_evidence', {
      p_business_id: businessId,
      p_source_url: fetched.url,
      p_title: title,
      p_summary: description,
      p_raw: { http_status: fetched.status, captured_title: title, captured_description: description },
      p_proposals: proposals,
    });

    if (persisted.error) throw persisted.error;

    const stored = persisted.data as {
      evidence?: { id?: string; captured_at?: string };
      proposals?: unknown[];
    } | null;

    if (!stored?.evidence?.id) throw new Error('Evidence was not persisted.');

    return NextResponse.json({
      ok: true,
      evidence: {
        id: stored.evidence.id,
        title,
        summary: description,
        url: fetched.url,
        capturedAt: stored.evidence.captured_at,
        evidenceClass: 'E2',
      },
      proposals: stored.proposals || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not capture website evidence.' }, { status: 400 });
  }
}
