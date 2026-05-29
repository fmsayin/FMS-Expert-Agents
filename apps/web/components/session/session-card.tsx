/** Session list card (stub). */
export function SessionCard({ id, topic }: { id: string; topic: string }) {
  return (
    <article className="rounded border border-neutral-200 p-4">
      <h3 className="font-medium">{topic}</h3>
      <p className="text-sm text-neutral-500">{id}</p>
    </article>
  );
}
