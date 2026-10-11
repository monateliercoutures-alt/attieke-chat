import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@attieke-chat/shared';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Ignore Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rediriger la racine de chaque langue (ex: /zh, /fr, /en) directement vers /chat
  const matchedRootLocale = SUPPORTED_LOCALES.find(
    (locale) => pathname === `/${locale}`
  );
  if (matchedRootLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${matchedRootLocale}/chat`;
    return NextResponse.redirect(url);
  }

  const pathnameHasLocale = SUPPORTED_LOCALES.some((locale) =>
    pathname.startsWith(`/${locale}/`)
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const targetLocale =
    cookieLocale &&
    (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname =
    pathname === '/' ? `/${targetLocale}/chat` : `/${targetLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
};
