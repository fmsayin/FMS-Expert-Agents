import "server-only";

const EMBED_TOKEN_ISSUER = "fmsthinktank-agents";
const EMBED_TOKEN_AUDIENCE = "roundtable-embed";

const ALLOWED_EMBED_REFERER_ORIGINS = new Set([
  "https://fmsthinktank.org",
  "https://www.fmsthinktank.org",
  "http://localhost:4173",
  "http://localhost:5173",
  "http://127.0.0.1:4173",
  "http://127.0.0.1:5173",
]);

type EmbedPayload = {
  exp?: number;
  iss?: string;
  aud?: string;
};

export function getEmbedTokenSecret(): string | undefined {
  return process.env.ROUNDTABLE_ACCESS_SECRET?.trim() || undefined;
}

export function isAllowedEmbedReferer(
  referer: string | null,
  requestOrigin?: string,
): boolean {
  if (!referer) {
    return true;
  }

  try {
    const origin = new URL(referer).origin;
    if (requestOrigin && origin === requestOrigin) {
      return true;
    }
    return ALLOWED_EMBED_REFERER_ORIGINS.has(origin);
  } catch {
    return false;
  }
}

export async function verifyEmbedToken(token: string | undefined): Promise<boolean> {
  const secret = getEmbedTokenSecret();
  if (!token || !secret) {
    return false;
  }

  const dot = token.lastIndexOf(".");
  if (dot === -1) {
    return false;
  }

  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expectedSignature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const expected = bytesToBase64Url(new Uint8Array(expectedSignature));

  if (sig.length !== expected.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < sig.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    return false;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(data)) as EmbedPayload;
    return (
      payload.iss === EMBED_TOKEN_ISSUER &&
      payload.aud === EMBED_TOKEN_AUDIENCE &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now()
    );
  } catch {
    return false;
  }
}

function base64UrlDecode(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
