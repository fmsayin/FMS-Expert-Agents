import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { withBasePath } from "@/lib/base-path";
import {
  PLATFORM_COOKIE_NAME,
  isPlatformProtectionEnabled,
  verifyPlatformAccessToken,
} from "@/lib/platform-access";
import {
  ROUNDTABLE_COOKIE_NAME,
  isRoundtableProtectionEnabled,
  verifyRoundtableAccessToken,
} from "@/lib/roundtable-access";

const PUBLIC_PATHS = new Set(["/login", "/sign-in", "/sign-up"]);
const PUBLIC_API_PATHS = new Set(["/api/platform/login", "/api/health", "/api/roundtable/unlock"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (PUBLIC_API_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/_next/")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPlatformProtectionEnabled() && !isPublicPath(pathname)) {
    const platformToken = request.cookies.get(PLATFORM_COOKIE_NAME)?.value;
    if (!(await verifyPlatformAccessToken(platformToken))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Platform access required." }, { status: 401 });
      }

      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = withBasePath("/login");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isRoundtableProtectionEnabled()) {
    const isRoundtableApi = pathname.startsWith("/api/roundtable/");
    const isUnlockApi = pathname === "/api/roundtable/unlock";

    if (isRoundtableApi && !isUnlockApi) {
      const token = request.cookies.get(ROUNDTABLE_COOKIE_NAME)?.value;
      if (!(await verifyRoundtableAccessToken(token))) {
        return NextResponse.json({ error: "Roundtable access required." }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
