import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sourceRevision =
    process.env.RAILWAY_GIT_COMMIT_SHA ||
    process.env.FDOS_DEPLOY_REV ||
    'unknown';
  const deploymentId = process.env.RAILWAY_DEPLOYMENT_ID || 'unknown';

  return NextResponse.json(
    {
      ok: true,
      product: 'SmartPickShop Holdings',
      service: 'smartpickshop-holdings-host-route',
      canonicalDomain: 'smartpickshop.dev',
      sourceRevision,
      deploymentId,
      checkedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    },
  );
}
