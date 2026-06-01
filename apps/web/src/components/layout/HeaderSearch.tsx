"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent } from "react";

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/agents?q=${encodeURIComponent(q)}`);
    else router.push("/agents");
  }

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <label htmlFor="global-search" className="sr-only">
        Search expert agents
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          id="global-search"
          type="search"
          placeholder="Search agents, specialties…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 md:w-72"
        />
      </div>
    </form>
  );
}
