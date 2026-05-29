import Link from "next/link";
import { MISSION_STATEMENT } from "@/lib/agents";
import { SessionList } from "@/components/sessions/SessionList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-accent/5 p-8">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          FMS Expert Agents
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          {MISSION_STATEMENT}
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Convene 13 domain experts for structured analysis, live debate, ethical review, and a
          Strategic Peace Recommendation Report.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/sessions/new">Start new session</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/agents">Meet the experts</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { step: "1", title: "Submit", desc: "Define your strategic question and context." },
          { step: "2", title: "Debate", desc: "Watch 13 experts analyze, challenge, and refine." },
          { step: "3", title: "Report", desc: "Receive consensus pillars and the full SPRR." },
        ].map((item) => (
          <Card key={item.step}>
            <CardHeader>
              <CardDescription>Step {item.step}</CardDescription>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{item.desc}</CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent sessions</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/sessions">View all</Link>
          </Button>
        </div>
        <SessionList limit={6} />
      </section>
    </div>
  );
}
