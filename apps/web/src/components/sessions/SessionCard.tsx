import Link from "next/link";
import type { SessionSummary } from "@fms/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function statusVariant(status: string) {
  switch (status) {
    case "completed":
      return "success" as const;
    case "running":
    case "queued":
      return "default" as const;
    case "failed":
      return "destructive" as const;
    case "paused":
      return "warning" as const;
    default:
      return "secondary" as const;
  }
}

export function SessionCard({ session }: { session: SessionSummary }) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">
            <Link href={`/sessions/${session.id}`} className="hover:text-primary">
              {session.title}
            </Link>
          </CardTitle>
          <Badge variant={statusVariant(session.status)}>{session.status}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{session.topic}</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Phase: {session.phase}</span>
        <time dateTime={session.createdAt}>
          {new Date(session.createdAt).toLocaleDateString()}
        </time>
      </CardContent>
    </Card>
  );
}
