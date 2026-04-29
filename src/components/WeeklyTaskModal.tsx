"use client";

import { useState } from "react";
import { CalendarDays, Clock3, Tag, Trash2, X } from "lucide-react";
import { WEEK_DAYS, type WeeklyTaskItem, type WeeklyTaskPayload } from "@/lib/weekly-schedule";

interface WeeklyTaskModalProps {
  task?: WeeklyTaskItem | null;
  initialDayOfWeek?: number;
  onClose: () => void;
  onSave: (payload: WeeklyTaskPayload) => Promise<void> | void;
  onDelete?: (task: WeeklyTaskItem) => Promise<void> | void;
}

export default function WeeklyTaskModal({
  task,
  initialDayOfWeek = 1,
  onClose,
  onSave,
  onDelete,
}: WeeklyTaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [dayOfWeek, setDayOfWeek] = useState(task?.dayOfWeek ?? initialDayOfWeek);
  const [startTime, setStartTime] = useState(task?.startTime ?? "08:00");
  const [endTime, setEndTime] = useState(task?.endTime ?? "09:00");
  const [category, setCategory] = useState(task?.category ?? "");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSave({
      title: title.trim(),
      dayOfWeek,
      startTime,
      endTime,
      category: category.trim() || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-white/30 bg-[var(--bgcard)] shadow-2xl">
        <div className="border-b border-[var(--subbackground)] bg-gradient-to-r from-[var(--background-2)] to-[var(--bgcard)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--subText)]">
                Agenda Semanal
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">
                {task ? "Editar bloco" : "Novo bloco"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[var(--subText)] transition hover:bg-[var(--subbackground)] hover:text-[var(--text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--text)]">Título</label>
            <input
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Ir à Faculdade"
              className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <CalendarDays className="h-4 w-4" /> Dia
              </label>
              <select
                value={dayOfWeek}
                onChange={(event) => setDayOfWeek(Number(event.target.value))}
                className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              >
                {WEEK_DAYS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.fullLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Tag className="h-4 w-4" /> Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Estudo, Trabalho, Lazer..."
                className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Clock3 className="h-4 w-4" /> Início
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Clock3 className="h-4 w-4" /> Fim
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="w-full rounded-2xl border border-transparent bg-[var(--subbackground)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:bg-[var(--bgcard)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--subbackground)] pt-4 sm:flex-row sm:justify-between">
            {task && onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-red-500/12 px-5 py-3 text-sm font-bold text-red-500 transition hover:-translate-y-0.5 hover:bg-red-500/18"
              >
                <Trash2 className="h-4 w-4" /> Deletar
              </button>
            ) : (
              <span />
            )}

            <div className="flex gap-3">
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
                {task ? "Salvar alterações" : "Adicionar à agenda"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
