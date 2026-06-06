import { basePath } from "@/lib/base-path";

const PAYLOAD = "platform-granted";
export const PLATFORM_COOKIE_NAME = "fms-platform-access";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getPlatformPassword(): string | undefined {
  return process.env.EXPERTS_PLATFORM_PASSWORD?.trim() || undefined;
}

export function getPlatformAccessSecret(): string {
  return (
    process.env.EXPERTS_PLATFORM_ACCESS_SECRET?.trim() ||
    getPlatformPassword() ||
    "dev-platform-secret"
  );
}

export function isPlatformProtectionEnabled(): boolean {
  return !!getPlatformPassword();
}

export function getPlatformSessionMaxAge(): number {
  return SESSION_MAX_AGE_SECONDS;
}

export function getPlatformCookiePath(): string {
  return basePath || "/";
}

export async function createPlatformAccessToken(): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getPlatformAccessSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(PAYLOAD));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function verifyPlatformAccessToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const expected = await createPlatformAccessToken();
  if (token.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < token.length; i++) {
    diff |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}

export function verifyPlatformPassword(input: string): boolean {
  const expected = getPlatformPassword();
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
