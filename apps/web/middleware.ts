import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ROUNDTABLE_COOKIE_NAME,
  isRoundtableProtectionEnabled,
  verifyRoundtableAccessToken,
} from "@/lib/roundtable-access";

export async function middleware(request: NextRequest) {
  if (!isRoundtableProtectionEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isRoundtableApi = pathname.startsWith("/api/roundtable/");
  const isUnlockApi = pathname === "/api/roundtable/unlock";

  if (!isRoundtableApi || isUnlockApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ROUNDTABLE_COOKIE_NAME)?.value;
  if (await verifyRoundtableAccessToken(token)) {
    return NextResponse.next();
  }

  return NextResponse.json({ error: "Roundtable access required." }, { status: 401 });
}

export const config = {
  matcher: ["/api/roundtable/:path*"],
};
