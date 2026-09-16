import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Railway injects RAILWAY_GIT_COMMIT_SHA for every Git-backed deployment.
  // Prefer it over the legacy manually managed FDOS_DEPLOY_REV so production
  // diagnostics report the code that is actually running, not the code we hoped
  // was running. Humanity has enough optimistic dashboards already.
  const sourceRevision =
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.FDOS_DEPLOY_REV ||
    'unknown';
  const sourceBranch = process.env.RAILWAY_GIT_BRANCH || 'unknown';
  const deploymentId = process.env.RAILWAY_DEPLOYMENT_ID || 'unknown';
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
      sourceBranch,
      deploymentId,
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
