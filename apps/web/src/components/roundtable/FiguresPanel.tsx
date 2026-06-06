"use client";

import { useState } from "react";
import { CustomFigureForm } from "@/components/roundtable/CustomFigureForm";
import { FigureSelector } from "@/components/roundtable/FigureSelector";
import {
  addCustomFigure,
  deleteCustomFigure,
  updateCustomFigure,
  type CustomFigure,
  type CustomFigureInput,
} from "@/lib/custom-figures-storage";
import { sortCustomFiguresByName } from "@/lib/figure-sort";

type Props = {
  activeFigureIds: string[];
  customFigures: CustomFigure[];
  onCustomFiguresChange: (figures: CustomFigure[]) => void;
  onToggleFigure: (id: string) => void;
  onCustomFigureDeleted: (storageId: string) => void;
};

export function FiguresPanel({
  activeFigureIds,
  customFigures,
  onCustomFiguresChange,
  onToggleFigure,
  onCustomFigureDeleted,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingFigure, setEditingFigure] = useState<CustomFigure | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingFigure(null);
    setFormOpen(true);
  };

  const handleEdit = (figure: CustomFigure) => {
    setEditingFigure(figure);
    setFormOpen(true);
  };

  const handleSave = (input: CustomFigureInput, editingId: string | null) => {
    if (editingId) {
      const updated = updateCustomFigure(editingId, input);
      if (updated) {
        onCustomFiguresChange(
          sortCustomFiguresByName(
            customFigures.map((f) => (f.id === editingId ? updated : f)),
          ),
        );
        setSaveNotice(`Updated ${updated.fullName}`);
      }
    } else {
      const created = addCustomFigure(input);
      onCustomFiguresChange(sortCustomFiguresByName([...customFigures, created]));
      setSaveNotice(`Saved ${created.fullName}`);
    }
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleDelete = (figure: CustomFigure) => {
    if (!deleteCustomFigure(figure.id)) return;
    onCustomFiguresChange(customFigures.filter((f) => f.id !== figure.id));
    onCustomFigureDeleted(`custom-${figure.id}`);
  };

  return (
    <>
      {saveNotice && (
        <p
          className="shrink-0 border-b px-3 py-1.5 text-[10px] text-[var(--rt-accent)]"
          style={{ borderColor: "var(--rt-border)" }}
          role="status"
        >
          {saveNotice}
        </p>
      )}
      <FigureSelector
        variant="panel"
        activeFigureIds={activeFigureIds}
        customFigures={customFigures}
        onToggleFigure={onToggleFigure}
        onAddCustomFigure={handleAdd}
        onEditCustomFigure={handleEdit}
        onDeleteCustomFigure={handleDelete}
      />
      <CustomFigureForm
        open={formOpen}
        editingFigure={editingFigure}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </>
  );
}
