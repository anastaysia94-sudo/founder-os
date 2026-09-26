import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sourceRevision =
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.FDOS_DEPLOY_REV ||
    'unknown';

  const checks = {
    supabaseUrlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    sourceRevisionConfigured: sourceRevision !== 'unknown',
  };

  const ready = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ready,
      product: 'Founder Dynasty OS 10.0',
      service: 'founder-dynasty-os-web',
      sourceRevision,
      checks,
      checkedAt: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
