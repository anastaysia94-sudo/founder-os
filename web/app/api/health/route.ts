import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sourceRevision = process.env.FDOS_DEPLOY_REV || 'unknown';
  const environment = process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'unknown';
  const checks = {
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    sourceRevisionConfigured: sourceRevision !== 'unknown',
  };
  const ok = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ok,
      product: 'Founder Dynasty OS 10.0',
      service: 'founder-dynasty-os-web',
      sourceRevision,
      environment,
      checks,
      checkedAt: new Date().toISOString(),
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
