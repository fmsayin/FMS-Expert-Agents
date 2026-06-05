"use client";

import { usePathname } from "next/navigation";
import { getWorkspaceFromPathname, WORKSPACE_ATTR } from "@/lib/workspace";
import { workspaceShellClass } from "@/styles/themes";
import { cn } from "@/lib/utils";

export function WorkspaceShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const workspace = getWorkspaceFromPathname(pathname);

  return (
    <div
      {...{ [WORKSPACE_ATTR]: workspace }}
      className={cn(
        "min-h-screen transition-[background-color,color,border-color] duration-300 ease-out",
        workspaceShellClass[workspace],
        className,
      )}
    >
      {children}
    </div>
  );
}
