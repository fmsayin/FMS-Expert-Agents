import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isAllowedEmbedReferer, verifyEmbedToken } from "@/lib/embed-token";

const TEST_SECRET = "test-roundtable-access-secret";
const EMBED_TOKEN_ISSUER = "fmsthinktank-agents";
const EMBED_TOKEN_AUDIENCE = "roundtable-embed";

function createTestEmbedToken(expMs: number): string {
  const payload = {
    exp: expMs,
    iss: EMBED_TOKEN_ISSUER,
    aud: EMBED_TOKEN_AUDIENCE,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", TEST_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

describe("embed-token", () => {
  afterEach(() => {
    delete process.env.ROUNDTABLE_ACCESS_SECRET;
  });

  it("accepts a valid HMAC token", async () => {
    process.env.ROUNDTABLE_ACCESS_SECRET = TEST_SECRET;
    const token = createTestEmbedToken(Date.now() + 60_000);
    await expect(verifyEmbedToken(token)).resolves.toBe(true);
  });

  it("rejects expired tokens", async () => {
    process.env.ROUNDTABLE_ACCESS_SECRET = TEST_SECRET;
    const token = createTestEmbedToken(Date.now() - 1_000);
    await expect(verifyEmbedToken(token)).resolves.toBe(false);
  });

  it("allows missing referer and same-origin redirect referers", () => {
    expect(isAllowedEmbedReferer(null)).toBe(true);
    expect(
      isAllowedEmbedReferer(
        "https://fms-expert-agents.vercel.app/roundtable?embed_token=abc",
        "https://fms-expert-agents.vercel.app",
      ),
    ).toBe(true);
    expect(isAllowedEmbedReferer("https://www.fmsthinktank.org/agents")).toBe(true);
    expect(isAllowedEmbedReferer("https://evil.example/agents")).toBe(false);
  });
});
