import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "es"],
  defaultLocale: "es",
  localeDetection: true,
  localePrefix: "always",
});

export async function middleware(request: NextRequest) {
  // Handle internationalization first
  const response = intlMiddleware(request);

  // If it's a redirect (locale redirection), return it immediately
  if (response.status === 302 || response.status === 307) {
    return response;
  }

  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  response.headers.forEach((value, key) => {
    supabaseResponse.headers.set(key, value);
  });

  response.cookies.getAll().forEach((cookie) => {
    supabaseResponse.cookies.set(cookie);
  });

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
