import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { RoundTableClient } from "@/components/roundtable/RoundTableClient";
import { RoundtablePasscodeGate } from "@/components/roundtable/RoundtablePasscodeGate";
import { verifyEmbedToken } from "@/lib/embed-token";
import { withBasePath } from "@/lib/base-path";
import { createRoundtableAccessToken } from "@/lib/roundtable-access";
import {
  hasRoundtableAccess,
  roundtableEmbedAccessCookieOptions,
} from "@/lib/roundtable-access-server";

type RoundTablePageProps = {
  searchParams: Promise<{ embed_token?: string; embed_error?: string }>;
};

export default async function RoundTablePage({ searchParams }: RoundTablePageProps) {
  const params = await searchParams;
  const embedToken = params.embed_token?.trim();

  if (embedToken && !(await hasRoundtableAccess())) {
    if (await verifyEmbedToken(embedToken)) {
      const accessToken = await createRoundtableAccessToken();
      const cookieStore = await cookies();
      cookieStore.set(roundtableEmbedAccessCookieOptions(accessToken));
      redirect(withBasePath("/roundtable"));
    }

    return <RoundtablePasscodeGate embedError="invalid" />;
  }

  const allowed = await hasRoundtableAccess();
  if (!allowed) {
    return <RoundtablePasscodeGate embedError={params.embed_error} />;
  }
  return <RoundTableClient />;
}
