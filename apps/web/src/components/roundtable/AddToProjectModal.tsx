"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addSessionToProject,
  createUserProject,
  listUserProjects,
  type UserProject,
} from "@/lib/projects-storage";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onAdded?: () => void;
};

export function AddToProjectModal({ open, onOpenChange, sessionId, onAdded }: Props) {
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProjects(listUserProjects());
      setNewName("");
      setSelectedId(null);
    }
  }, [open]);

  const handleAddExisting = () => {
    if (!selectedId) return;
    addSessionToProject(selectedId, sessionId);
    onAdded?.();
    onOpenChange(false);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const project = createUserProject(name);
    addSessionToProject(project.id, sessionId);
    onAdded?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-[var(--rt-border)] bg-[var(--rt-surface)] text-[var(--rt-text)] sm:max-w-md",
        )}
        style={{ fontFamily: "var(--rt-font-body)" }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-[var(--rt-text)]"
            style={{ fontFamily: "var(--rt-font-head)" }}
          >
            Add to Project
          </DialogTitle>
          <DialogDescription className="text-[var(--rt-muted)]">
            Link this debate session to a research project in local storage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project-select" className="text-[11px] text-[var(--rt-muted)]">
                Existing projects
              </Label>
              <select
                id="project-select"
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value || null)}
                className="flex h-9 w-full rounded-md border border-[var(--rt-border)] bg-[var(--rt-bg)] px-3 py-1 text-sm text-[var(--rt-text)]"
                style={{ fontFamily: "var(--rt-font-body)" }}
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                disabled={!selectedId}
                onClick={handleAddExisting}
                className="border border-[var(--rt-accent)] bg-transparent text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
              >
                Add to selected project
              </Button>
            </div>
          )}
          <div className="space-y-2 border-t border-[var(--rt-border)] pt-4">
            <Label htmlFor="new-project" className="text-[11px] text-[var(--rt-muted)]">
              Create new project
            </Label>
            <Input
              id="new-project"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Project name"
              className="border-[var(--rt-border)] bg-[var(--rt-bg)] text-[var(--rt-text)] placeholder:text-[var(--rt-muted)] focus-visible:ring-[var(--rt-accent)]"
              style={{ fontFamily: "var(--rt-font-body)" }}
            />
            <Button
              type="button"
              size="sm"
              disabled={!newName.trim()}
              onClick={handleCreate}
              className="border border-[var(--rt-accent)] bg-transparent text-[var(--rt-accent)] hover:bg-[var(--rt-accent)] hover:text-[var(--rt-bg)]"
            >
              Create and add
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[var(--rt-border)] text-[var(--rt-muted)] hover:border-[var(--rt-accent)] hover:text-[var(--rt-text)]"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
