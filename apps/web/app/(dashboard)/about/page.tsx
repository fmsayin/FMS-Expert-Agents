import { MISSION_STATEMENT } from "@/lib/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">About FMS Expert Agents</h1>
        <p className="mt-4 font-serif text-xl leading-relaxed text-primary">{MISSION_STATEMENT}</p>
      </header>

      <section className="space-y-4 text-muted-foreground">
        <p>
          The Foundation for Multilateral Strategies (FMS) Expert Agents platform convenes
          specialized AI experts for structured analysis in AI governance, preventive diplomacy,
          peace operations, and humanitarian protection — presented as institutional think-tank
          capabilities, not generic automation.
        </p>
        <p>
          Each expert agent embodies domain depth: literature synthesis, policy brief drafting,
          scenario planning, legal review, and evidence mapping. Outputs feed strategic reviews,
          academic publications, and decision-ready briefings for multilateral actors.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Methodology</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Multi-agent deliberation with structured phases: independent analysis, cross-domain
            challenge, consensus building, and SPRR report generation with citation discipline.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Governance</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Human-in-the-loop accountability, ethics review, humanitarian firewalls, and alignment
            with international law and human dignity as non-negotiable metrics.
          </CardContent>
        </Card>
      </section>

      <section className="rounded-lg border border-dashed border-border bg-muted/30 p-6">
        <h2 className="text-lg font-semibold">Contact</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Institutional inquiries:{" "}
          <span className="text-foreground">contact@fms-strategies.org</span> (placeholder)
        </p>
      </section>
    </div>
  );
}
