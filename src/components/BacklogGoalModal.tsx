"use client";

import { useState } from "react";
import { BookOpen, Flag, Layers3, X } from "lucide-react";
import {
  BACKLOG_CATEGORIES,
  BACKLOG_PRIORITIES,
  type BacklogCategory,
  type BacklogGoalItem,
  type BacklogGoalPayload,
  type BacklogPriority,
} from "@/lib/backlog";

interface BacklogGoalModalProps {
  goal?: BacklogGoalItem | null;
  onClose: () => void;
  onSave: (payload: BacklogGoalPayload) => Promise<void> | void;
}

export default function BacklogGoalModal({
  goal,
  onClose,
  onSave,
}: BacklogGoalModalProps) {
  const [title, setTitle] = useState(goal?.title ?? "");
  const [description, setDescription] = useState(goal?.description ?? "");
  const [category, setCategory] = useState<BacklogCategory>(
    (goal?.category as BacklogCategory | undefined) ?? "CURSO",
  );
  const [priority, setPriority] = useState<BacklogPriority>(
    (goal?.priority as BacklogPriority | undefined) ?? "MEDIUM",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSave({
      title: title.trim(),
      description: description.trim() || null,
      category,
      status: goal?.status ?? "NOT_STARTED",
      priority,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-white/30 bg-[var(--bgcard)] shadow-2xl">
        <div className="border-b border-[var(--subbackground)] bg-gradient-to-r from-[var(--background-2)] to-[var(--bgcard)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--subText)]">
                Meu Backlog
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">
                {goal ? "Editar objetivo" : "Novo objetivo"}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[var(--subText)] transition hover:bg-[var(--subbackground)] hover:text-[var(--text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <BookOpen className="h-4 w-4" /> Titulo
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Curso CS50"
                className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text)]">
                Descricao ou link
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Notas, links, trilha de estudo..."
                rows={4}
                className="w-full resize-none rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <Layers3 className="h-4 w-4" /> Categoria
                </label>
                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value as BacklogCategory)
                  }
                  className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
                >
                  {BACKLOG_CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                  <Flag className="h-4 w-4" /> Prioridade
                </label>
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as BacklogPriority)
                  }
                  className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
                >
                  {BACKLOG_PRIORITIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[var(--subbackground)] bg-[var(--bgcard)] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[var(--subbackground)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:-translate-y-0.5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {goal ? "Salvar alteracoes" : "Adicionar ao backlog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
