import { RoundTableClient } from "@/components/roundtable/RoundTableClient";
import { RoundtablePasscodeGate } from "@/components/roundtable/RoundtablePasscodeGate";
import { hasRoundtableAccess } from "@/lib/roundtable-access-server";

export default async function RoundTablePage() {
  const allowed = await hasRoundtableAccess();
  if (!allowed) {
    return <RoundtablePasscodeGate />;
  }
  return <RoundTableClient />;
}
