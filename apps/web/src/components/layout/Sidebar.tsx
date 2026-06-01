"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Bot,
  FolderKanban,
  Home,
  Info,
  Menu,
  Microscope,
  X,
} from "lucide-react";
import { MISSION_STATEMENT } from "@/lib/agents";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agents", label: "Expert Agents", icon: Bot },
  { href: "/outputs", label: "Research Outputs", icon: BookOpen },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/about", label: "About", icon: Info },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/" || pathname === "/dashboard"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
        <Link href="/" className="text-sm font-semibold text-primary" onClick={() => setMobileOpen(false)}>
          FMS Expert Agents
        </Link>
        <button
          type="button"
          className="rounded-md border border-border p-2 text-foreground"
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="sr-only">{mobileOpen ? "Close menu" : "Open menu"}</span>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="mobile-sidebar"
        className={cn(
          "flex w-full flex-col border-b border-border bg-sidebar md:w-64 md:shrink-0 md:border-b-0 md:border-r",
          "md:relative md:translate-x-0",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r shadow-xl md:shadow-none"
            : "hidden md:flex",
        )}
      >
        <div className="border-b border-gold/20 bg-gradient-to-br from-primary to-primary/90 p-5 text-primary-foreground">
          <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
            <p className="text-xs font-semibold uppercase tracking-widest text-gold-light/90">FMS</p>
            <p className="mt-1 text-lg font-semibold tracking-tight">Expert Agents</p>
            <p className="mt-2 text-xs leading-relaxed text-primary-foreground/80">{MISSION_STATEMENT}</p>
          </Link>
        </div>
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-3">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </nav>
        <div className="border-t border-border p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Microscope className="h-3.5 w-3.5" aria-hidden />
            AI governance · Peace & security think tank
          </p>
        </div>
      </aside>
    </>
  );
}
