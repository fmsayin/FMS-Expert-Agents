import Link from "next/link";
import { SessionList } from "@/components/sessions/SessionList";
import { Button } from "@/components/ui/button";

export default function SessionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Sessions</h1>
          <p className="mt-1 text-muted-foreground">
            All think-tank sessions with status and phase.
          </p>
        </div>
        <Button asChild>
          <Link href="/sessions/new">New session</Link>
        </Button>
      </div>
      <SessionList />
    </div>
  );
}
