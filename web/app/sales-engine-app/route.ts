import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DEFAULT_SALES_OS_URL = 'https://sales-engine-pwa-production.up.railway.app/';

export async function GET() {
  const destination = process.env.SALES_OS_URL?.trim() || DEFAULT_SALES_OS_URL;

  let url: URL;
  try {
    url = new URL(destination);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Sales OS destination is not configured correctly.' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }

  if (url.protocol !== 'https:') {
    return NextResponse.json(
      { ok: false, error: 'Sales OS destination must use HTTPS.' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }

  return NextResponse.redirect(url, 307);
}
