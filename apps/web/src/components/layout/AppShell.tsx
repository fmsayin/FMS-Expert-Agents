import Link from "next/link";
import { MISSION_STATEMENT } from "@/lib/agents";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sessions", label: "Sessions" },
  { href: "/sessions/new", label: "New session" },
  { href: "/agents", label: "Experts" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <aside className="border-b border-border bg-card md:w-60 md:border-b-0 md:border-r">
        <div className="p-5">
          <Link href="/dashboard" className="block">
            <p className="text-lg font-semibold tracking-tight text-foreground">
              FMS Expert Agents
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {MISSION_STATEMENT}
            </p>
          </Link>
        </div>
        <nav aria-label="Main navigation" className="px-3 pb-4 md:pb-6">
          <ul className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV.map((item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <div className={cn("flex flex-1 flex-col", className)}>
        <header className="border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <p className="text-sm text-muted-foreground">
            Multi-agent peace think tank · 13 expert domains
          </p>
        </header>
        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
