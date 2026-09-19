import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APEX_HOST = 'smartpickshop.dev';
const WWW_HOST = 'www.smartpickshop.dev';

function secure(response: NextResponse) {
  response.headers.set('x-content-type-options', 'nosniff');
  response.headers.set('x-frame-options', 'DENY');
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  response.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set(
    'content-security-policy',
    "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  );
  return response;
}

export function proxy(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  const pathname = request.nextUrl.pathname;

  if (host === WWW_HOST) {
    const target = new URL(request.url);
    target.protocol = 'https:';
    target.host = APEX_HOST;
    return NextResponse.redirect(target, 308);
  }

  if (host !== APEX_HOST) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    return secure(NextResponse.rewrite(new URL('/holdings/index.html', request.url)));
  }

  if (pathname === '/robots.txt') {
    return secure(NextResponse.rewrite(new URL('/holdings/robots.txt', request.url)));
  }

  if (pathname === '/sitemap.xml') {
    return secure(NextResponse.rewrite(new URL('/holdings/sitemap.xml', request.url)));
  }

  if (pathname === '/health' || pathname === '/ready') {
    return secure(NextResponse.rewrite(new URL('/api/holdings-health', request.url)));
  }

  if (pathname.startsWith('/holdings/') || pathname.startsWith('/.well-known/')) {
    return secure(NextResponse.next());
  }

  return NextResponse.redirect(new URL('/', request.url), 308);
}

export const config = {
  matcher: '/:path*',
};
