// src/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Create an initial response object. This will be cloned and modified if cookies need to be set.
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
          // Clone the request and response to ensure immutability and correct header propagation
          const newReqHeaders = new Headers(req.headers);
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set on the cloned request cookies for potential use in the same middleware chain
            // (though Next.js request cookies are read-only, this is more about updating our 'view')
            // More importantly, set on the response cookies.
            newReqHeaders.append('Cookie', `${name}=${value}`); // This might not be standard for updating req.cookies
                                                              // but the main goal is to update the response.
                                                              // Supabase client might rely on this for internal state.
          });
          
          // Create a new response with the updated cookies
          response = NextResponse.next({
            request: {
              headers: newReqHeaders, // Pass potentially updated request headers
            },
          });
          // Apply all cookies to the new response
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This call is crucial. It will use the cookie handlers above.
  // If it needs to set/refresh cookies, our `setAll` will be called.
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  if (!session && pathname.startsWith('/admin')) {
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && pathname === '/auth/login') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return response; // Return the (potentially modified) response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/admin/:path*',
    '/auth/login',
  ],
};
