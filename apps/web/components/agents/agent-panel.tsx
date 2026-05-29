/** Single agent analysis panel (stub). */
export function AgentPanel({ displayName }: { displayName: string }) {
  return (
    <section className="rounded border border-neutral-200 p-4">
      <h3 className="font-medium">{displayName}</h3>
    </section>
  );
}
