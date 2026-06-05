import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";

import {
  createRoundtableAccessToken,
  isRoundtableProtectionEnabled,
  verifyRoundtablePasscode,
} from "@/lib/roundtable-access";
import { roundtableAccessCookieOptions } from "@/lib/roundtable-access-server";

const unlockSchema = z.object({
  passcode: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isRoundtableProtectionEnabled()) {
    return NextResponse.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = unlockSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Passcode is required." }, { status: 400 });
  }

  if (!verifyRoundtablePasscode(parsed.data.passcode)) {
    return NextResponse.json({ error: "Incorrect passcode." }, { status: 401 });
  }

  const token = await createRoundtableAccessToken();
  const cookieStore = await cookies();
  cookieStore.set(roundtableAccessCookieOptions(token));

  return NextResponse.json({ ok: true });
}
