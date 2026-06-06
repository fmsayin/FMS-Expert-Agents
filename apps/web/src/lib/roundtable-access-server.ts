import "server-only";

import { cookies } from "next/headers";

import {
  ROUNDTABLE_COOKIE_NAME,
  getRoundtableSessionMaxAge,
  isRoundtableProtectionEnabled,
  verifyRoundtableAccessToken,
} from "@/lib/roundtable-access";

export async function hasRoundtableAccess(): Promise<boolean> {
  if (!isRoundtableProtectionEnabled()) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get(ROUNDTABLE_COOKIE_NAME)?.value;
  return verifyRoundtableAccessToken(token);
}

export function roundtableAccessCookieOptions(token: string) {
  return {
    name: ROUNDTABLE_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: getRoundtableSessionMaxAge(),
  };
}
