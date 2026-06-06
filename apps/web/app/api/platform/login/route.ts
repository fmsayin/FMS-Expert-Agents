import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  createPlatformAccessToken,
  isPlatformProtectionEnabled,
  verifyPlatformPassword,
} from "@/lib/platform-access";
import { platformAccessCookieOptions } from "@/lib/platform-access-server";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isPlatformProtectionEnabled()) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  if (!verifyPlatformPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  const token = await createPlatformAccessToken();
  const cookieStore = await cookies();
  cookieStore.set(platformAccessCookieOptions(token));

  return NextResponse.json({ ok: true });
}
