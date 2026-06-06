import { cookies } from "next/headers";

import {
  PLATFORM_COOKIE_NAME,
  getPlatformCookiePath,
  getPlatformSessionMaxAge,
  isPlatformProtectionEnabled,
  verifyPlatformAccessToken,
} from "@/lib/platform-access";

export async function hasPlatformAccess(): Promise<boolean> {
  if (!isPlatformProtectionEnabled()) return true;
  const cookieStore = await cookies();
  const token = cookieStore.get(PLATFORM_COOKIE_NAME)?.value;
  return verifyPlatformAccessToken(token);
}

export function platformAccessCookieOptions(token: string) {
  return {
    name: PLATFORM_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: getPlatformCookiePath(),
    maxAge: getPlatformSessionMaxAge(),
  };
}
