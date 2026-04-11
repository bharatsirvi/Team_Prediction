import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'ipl2026-super-secret-jwt-key-change-me'
);
const COOKIE = 'ipl_session';

const PROTECTED_PATHS = ['/', '/dashboard'];
const PUBLIC_PATHS = ['/sign-in', '/api/', '/_next/', '/favicon.ico'];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

function isProtected(pathname: string) {
  return PROTECTED_PATHS.includes(pathname);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isPublic(pathname) && isProtected(pathname)) {
    const token = request.cookies.get(COOKIE)?.value;
    let valid = false;

    if (token) {
      try {
        await jwtVerify(token, SECRET);
        valid = true;
      } catch {
        valid = false;
      }
    }

    if (!valid) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
