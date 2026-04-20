"use client";

import { useState } from "react";
import { X, Calendar, AlignLeft, Flag } from "lucide-react";

interface AddTaskFormProps {
  onAdd: (task: { title: string; description?: string; priority: string; dueDate?: string }) => void;
  onClose: () => void;
}

export default function AddTaskForm({ onAdd, onClose }: AddTaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-[var(--bgcard)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold gradient-text">Nova Tarefa</h2>
          <button onClick={onClose} className="text-[var(--subText)] hover:text-[var(--text)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-[var(--text)] mb-1 block">Título *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que precisa ser feito?"
              className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-[var(--text)] mb-1 flex items-center gap-1">
              <AlignLeft className="w-4 h-4" /> Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-semibold text-[var(--text)] mb-1 flex items-center gap-1">
                <Flag className="w-4 h-4" /> Prioridade
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                  outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
              >
                <option value="Baixa">Baixa</option>
                <option value="Normal">Normal</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-semibold text-[var(--text)] mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Prazo
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                  outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full font-bold text-white
              bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
              hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            Adicionar Tarefa
          </button>
        </form>
      </div>
    </div>
  );
}
