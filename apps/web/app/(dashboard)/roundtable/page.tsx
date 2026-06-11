import { redirect } from "next/navigation";

import { RoundTableClient } from "@/components/roundtable/RoundTableClient";
import { RoundtablePasscodeGate } from "@/components/roundtable/RoundtablePasscodeGate";
import { withBasePath } from "@/lib/base-path";
import { hasRoundtableAccess } from "@/lib/roundtable-access-server";

type RoundTablePageProps = {
  searchParams: Promise<{ embed_token?: string; embed_error?: string }>;
};

export default async function RoundTablePage({ searchParams }: RoundTablePageProps) {
  const params = await searchParams;
  const embedToken = params.embed_token?.trim();

  if (embedToken && !(await hasRoundtableAccess())) {
    redirect(
      `${withBasePath("/api/roundtable/embed")}?embed_token=${encodeURIComponent(embedToken)}`,
    );
  }

  const allowed = await hasRoundtableAccess();
  if (!allowed) {
    return <RoundtablePasscodeGate embedError={params.embed_error} />;
  }
  return <RoundTableClient />;
}
