import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      product: 'Founder Dynasty OS 10.0',
      service: 'founder-dynasty-os-web',
      sourceRevision: process.env.FDOS_DEPLOY_REV || 'unknown',
      environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV || 'unknown',
      checkedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );
}
