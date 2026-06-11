import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { RoundTableClient } from "@/components/roundtable/RoundTableClient";
import { RoundtablePasscodeGate } from "@/components/roundtable/RoundtablePasscodeGate";
import { isAllowedEmbedReferer, verifyEmbedToken } from "@/lib/embed-token";
import {
  createRoundtableAccessToken,
  hasRoundtableAccess,
  roundtableAccessCookieOptions,
} from "@/lib/roundtable-access-server";

type RoundTablePageProps = {
  searchParams: Promise<{ embed_token?: string }>;
};

export default async function RoundTablePage({ searchParams }: RoundTablePageProps) {
  const params = await searchParams;
  const embedToken = params.embed_token?.trim();

  if (embedToken && !(await hasRoundtableAccess())) {
    const requestHeaders = await headers();
    const referer = requestHeaders.get("referer");

    if (
      isAllowedEmbedReferer(referer) &&
      (await verifyEmbedToken(embedToken))
    ) {
      const accessToken = await createRoundtableAccessToken();
      const cookieStore = await cookies();
      cookieStore.set(roundtableAccessCookieOptions(accessToken));
      redirect("/roundtable");
    }
  }

  const allowed = await hasRoundtableAccess();
  if (!allowed) {
    return <RoundtablePasscodeGate />;
  }
  return <RoundTableClient />;
}
