"use client";

import { useEffect, useState } from "react";
import {
  listKnowledgeBaseEntries,
  type KnowledgeBaseEntry,
} from "@/lib/knowledge-base-storage";

export function KnowledgeBaseClient() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);

  useEffect(() => {
    setEntries(listKnowledgeBaseEntries());
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Knowledge Base</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Stub workspace for round table exports saved from your browser. Entries are stored in
          local storage under <code className="text-xs">fms-knowledge-base</code>.
        </p>
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No entries yet. Use Knowledge Base in the Round Table Reports tab after a debate.
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-border p-4">
              <p className="font-medium">{entry.title}</p>
              <p className="text-xs text-muted-foreground">
                {entry.type} · {new Date(entry.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
