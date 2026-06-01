import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
  title,
  subtitle,
  hideHeader = false,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      <Sidebar />
      <div className={cn("flex min-w-0 flex-1 flex-col", className)}>
        {!hideHeader && <Header title={title} subtitle={subtitle} />}
        <main id="main-content" className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
