const PAYLOAD = "roundtable-granted";
export const ROUNDTABLE_COOKIE_NAME = "fms-rt-access";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getRoundtablePasscode(): string | undefined {
  return process.env.ROUNDTABLE_PASSCODE?.trim() || undefined;
}

export function getRoundtableAccessSecret(): string {
  return (
    process.env.ROUNDTABLE_ACCESS_SECRET?.trim() ||
    getRoundtablePasscode() ||
    "dev-roundtable-secret"
  );
}

export function isRoundtableProtectionEnabled(): boolean {
  return !!getRoundtablePasscode();
}

export function getRoundtableSessionMaxAge(): number {
  return SESSION_MAX_AGE_SECONDS;
}

export async function createRoundtableAccessToken(): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getRoundtableAccessSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(PAYLOAD));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function verifyRoundtableAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await createRoundtableAccessToken();
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyRoundtablePasscode(input: string): boolean {
  const expected = getRoundtablePasscode();
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
