import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/** Admin pages reachable without a session. */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/forgot-password"];

/**
 * Runs on /admin/* and /auth/*:
 *  1. Refreshes the Supabase session. If the access token has expired, `getUser()` uses the
 *     refresh token and the new cookies are written onto the response, so sessions survive
 *     reloads and long idle periods until the refresh token itself is revoked or expires.
 *  2. Redirects signed-out visitors from protected admin pages to /admin/login?next=…
 *
 * Role checks happen server-side in `requireStaff()`.
 */
export async function updateSession(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isPublicAdmin = PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!isSupabaseConfigured) {
    if (isAdmin && !isPublicAdmin) return NextResponse.redirect(new URL("/admin/login?error=not-configured", request.url));
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Do not run code between createServerClient and getUser() — it must refresh the session first.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isAdmin && !isPublicAdmin && !user) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    const redirect = NextResponse.redirect(url);
    // Carry over any cookie changes (e.g. a cleared, expired session).
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }

  // Never cache authenticated admin responses.
  if (isAdmin) response.headers.set("Cache-Control", "private, no-store");
  return response;
}
