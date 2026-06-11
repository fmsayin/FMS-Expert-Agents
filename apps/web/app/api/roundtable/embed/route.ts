import { NextResponse } from "next/server";

import { withBasePath } from "@/lib/base-path";
import { getEmbedTokenSecret, isAllowedEmbedReferer, verifyEmbedToken } from "@/lib/embed-token";
import { createRoundtableAccessToken } from "@/lib/roundtable-access";
import { roundtableAccessCookieOptions } from "@/lib/roundtable-access-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const embedToken = url.searchParams.get("embed_token")?.trim();

  if (!embedToken) {
    return NextResponse.redirect(new URL(withBasePath("/roundtable"), request.url));
  }

  if (!getEmbedTokenSecret()) {
    const roundtableUrl = new URL(withBasePath("/roundtable"), request.url);
    roundtableUrl.searchParams.set("embed_error", "config");
    return NextResponse.redirect(roundtableUrl);
  }

  const referer = request.headers.get("referer");
  if (!isAllowedEmbedReferer(referer)) {
    const roundtableUrl = new URL(withBasePath("/roundtable"), request.url);
    roundtableUrl.searchParams.set("embed_error", "referer");
    return NextResponse.redirect(roundtableUrl);
  }

  if (!(await verifyEmbedToken(embedToken))) {
    const roundtableUrl = new URL(withBasePath("/roundtable"), request.url);
    roundtableUrl.searchParams.set("embed_error", "invalid");
    return NextResponse.redirect(roundtableUrl);
  }

  const accessToken = await createRoundtableAccessToken();
  const response = NextResponse.redirect(new URL(withBasePath("/roundtable"), request.url));
  const cookie = roundtableAccessCookieOptions(accessToken);
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });

  return response;
}
