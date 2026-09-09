import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'kn', 'hi'] as const;

export default function middleware(req: NextRequest) {
  const langParam = req.nextUrl.searchParams.get('lang');

  if (langParam && locales.includes(langParam as (typeof locales)[number])) {
    const res = NextResponse.next();
    res.cookies.set('aurexa_lang', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
