import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

export default async function ReportRedirectPage({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/sessions/${sessionId}#report`);
}
