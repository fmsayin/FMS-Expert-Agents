import "server-only";

import { cookies } from "next/headers";

import {
  ROUNDTABLE_COOKIE_NAME,
  createRoundtableAccessToken,
  getRoundtableSessionMaxAge,
  isRoundtableProtectionEnabled,
  verifyRoundtableAccessToken,
} from "@/lib/roundtable-access";

export { createRoundtableAccessToken };

export async function hasRoundtableAccess(): Promise<boolean> {
  if (!isRoundtableProtectionEnabled()) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get(ROUNDTABLE_COOKIE_NAME)?.value;
  return verifyRoundtableAccessToken(token);
}

type RoundtableCookieOptions = {
  crossSite?: boolean;
};

export function roundtableAccessCookieOptions(token: string, options?: RoundtableCookieOptions) {
  const crossSite = options?.crossSite ?? false;

  return {
    name: ROUNDTABLE_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: crossSite || process.env.NODE_ENV === "production",
    sameSite: (crossSite ? "none" : "lax") as "lax" | "none",
    path: "/",
    maxAge: getRoundtableSessionMaxAge(),
    ...(crossSite ? { partitioned: true as const } : {}),
  };
}

/** Cross-site iframe cookie (Think Tank → Expert Agents embed). */
export function roundtableEmbedAccessCookieOptions(token: string) {
  return roundtableAccessCookieOptions(token, { crossSite: true });
}
