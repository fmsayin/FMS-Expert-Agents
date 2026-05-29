import { LiveDebateView } from "@/components/sessions/LiveDebateView";

type Props = { params: Promise<{ sessionId: string }> };

export default async function SessionLivePage({ params }: Props) {
  const { sessionId } = await params;
  return <LiveDebateView sessionId={sessionId} />;
}
