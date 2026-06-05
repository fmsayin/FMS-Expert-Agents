"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  Bot,
  FlaskConical,
  FolderKanban,
  Home,
  Library,
  Menu,
  Microscope,
  X,
} from "lucide-react";
import { MISSION_STATEMENT } from "@/lib/mission";
import { getWorkspaceFromPathname } from "@/lib/workspace";
import { WORKSPACE_LABELS } from "@/styles/themes";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/agents", label: "Expert Agents", icon: Bot },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/outputs", label: "Research Outputs", icon: BookOpen },
  { href: "/policy-lab", label: "Policy Lab", icon: FlaskConical },
] as const;

const PLACEHOLDER_NAV = [{ href: "/knowledge", label: "Knowledge Base", icon: Library }] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-0.5">
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
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {item.label}
            </Link>
          </li>
        );
      })}
      {PLACEHOLDER_NAV.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <span
              className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground/60"
              title="Knowledge Base — coming soon"
            >
              <Icon className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
              {item.label}
              <span className="ml-auto text-[10px] uppercase tracking-wide opacity-70">Soon</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const workspace = getWorkspaceFromPathname(pathname);
  const workspaceLabel = WORKSPACE_LABELS[workspace];

  return (
    <>
      <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
        <Link href="/" className="text-sm font-semibold text-primary" onClick={() => setMobileOpen(false)}>
          FMS Expert Agents
        </Link>
        <button
          type="button"
          className="rounded-md border border-border p-2 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          className="fixed inset-0 z-40 bg-foreground/30 md:hidden"
          aria-hidden
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="mobile-sidebar"
        className={cn(
          "flex w-full flex-col border-b border-border bg-sidebar transition-colors duration-300 md:w-60 md:shrink-0 md:border-b-0 md:border-r lg:w-64",
          "md:relative md:translate-x-0",
          mobileOpen
            ? "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r shadow-xl md:shadow-none"
            : "hidden md:flex",
        )}
      >
        <div
          className={cn(
            "border-b border-border/60 p-4 md:p-5",
            workspace === "policy"
              ? "bg-gradient-to-br from-primary/25 via-sidebar to-accent/10"
              : workspace === "roundtable"
                ? "bg-gradient-to-br from-primary/15 to-sidebar"
                : "bg-gradient-to-br from-card to-sidebar",
          )}
        >
          <Link href="/" className="block" onClick={() => setMobileOpen(false)}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              FMS Think Tank OS
            </p>
            <p className="mt-1 text-base font-semibold tracking-tight text-foreground">Expert Agents</p>
            <p className="mt-0.5 text-[11px] font-medium text-primary">{workspaceLabel}</p>
            <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
              {MISSION_STATEMENT}
            </p>
          </Link>
        </div>
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto p-2.5 md:p-3">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
        </nav>
        <div className="border-t border-border p-3 md:p-4">
          <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Microscope className="h-3.5 w-3.5 shrink-0" aria-hidden />
            AI governance · Peace & security
          </p>
        </div>
      </aside>
    </>
  );
}
