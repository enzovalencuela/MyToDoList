"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, Pencil, Check,
  Calendar, Flag, AlignLeft
} from "lucide-react";

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: string;
  dueDate?: string | null;
  order: number;
  createdAt: string;
}

interface TaskCardProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Todo>) => void;
}

const priorityColors: Record<string, string> = {
  Urgente: "bg-red-500",
  Alta: "bg-orange-500",
  Normal: "bg-green-500",
  Baixa: "bg-blue-500",
};

function getDueDateStatus(dueDate?: string | null) {
  if (!dueDate) return { label: "Indefinido", color: "bg-gray-400/20 text-gray-500" };

  // Parse YYYY-MM-DD safely
  const parts = dueDate.split("-");
  const due = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  due.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const formatted = `${String(due.getDate()).padStart(2, "0")}/${String(due.getMonth() + 1).padStart(2, "0")}/${due.getFullYear()}`;

  if (diffDays < 0) return { label: "Atrasada", color: "bg-red-500 text-white" };
  if (diffDays === 0) return { label: "Hoje", color: "bg-red-400 text-white" };
  if (diffDays <= 3) return { label: "Próxima", color: "bg-yellow-400 text-yellow-900" };
  return { label: formatted, color: "bg-green-500/20 text-green-700" };
}

function TaskCard({ todo, onToggle, onDelete, onUpdate }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate || "");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id, disabled: todo.completed });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDateStatus = getDueDateStatus(todo.dueDate);

  function handleSave() {
    onUpdate(todo.id, {
      title: editTitle,
      description: editDesc || null,
      priority: editPriority,
      dueDate: editDueDate || null,
    });
    setEditing(false);
  }

  function handleCancelEdit() {
    setEditTitle(todo.title);
    setEditDesc(todo.description || "");
    setEditPriority(todo.priority);
    setEditDueDate(todo.dueDate || "");
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl shadow-md transition-all border border-transparent hover:border-[var(--secondary)]/30
        ${todo.completed
          ? "bg-[var(--taskcompleted)]/30 opacity-60"
          : "bg-[var(--bgcard)]"
        }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {/* Drag handle */}
        {!todo.completed && (
          <button {...attributes} {...listeners} className="cursor-grab text-[var(--subText)] hover:text-[var(--text)]">
            <GripVertical className="w-5 h-5" />
          </button>
        )}

        {/* Checkbox */}
        <button
          onClick={() => onToggle(todo.id, todo.completed)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition
            ${todo.completed
              ? "border-green-500 bg-green-500 text-white"
              : "border-[var(--subText)] hover:border-[var(--primary)]"
            }`}
        >
          {todo.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Title + info */}
        <div className="flex-1 min-w-0">
          <span className={`font-semibold text-sm block truncate
            ${todo.completed ? "line-through text-[var(--subText)]" : "text-[var(--text)]"}`}
          >
            {todo.title}
          </span>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Due date badge */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${dueDateStatus.color}`}>
            <Calendar className="w-3 h-3" />
            {dueDateStatus.label}
          </span>

          {/* Priority badge */}
          <span className={`text-[10px] px-2 py-0.5 rounded-full text-white font-bold ${priorityColors[todo.priority]}`}>
            {todo.priority}
          </span>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[var(--subText)] hover:text-[var(--text)] flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--subbackground)]">
          {editing ? (
            <div className="space-y-3 pt-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--subbackground)] text-[var(--text)] text-sm outline-none"
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Descrição..."
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--subbackground)] text-[var(--text)] text-sm outline-none resize-none"
              />
              <div className="flex gap-2">
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--subbackground)] text-[var(--text)] text-sm outline-none"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Normal">Normal</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--subbackground)] text-[var(--text)] text-sm outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-full text-sm font-bold text-white
                    bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                    hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 rounded-full text-sm font-bold text-[var(--text)]
                    bg-[var(--subbackground)] hover:-translate-y-0.5 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 space-y-2">
              {todo.description && (
                <p className="text-sm text-[var(--subText)] flex items-start gap-2">
                  <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {todo.description}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[var(--subText)]">
                  <Flag className="w-3 h-3" /> {todo.priority}
                </span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${dueDateStatus.color}`}>
                  <Calendar className="w-3 h-3" /> {dueDateStatus.label}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                {!todo.completed && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full
                      bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white
                      hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <Pencil className="w-3 h-3" /> Editar
                  </button>
                )}
                <button
                  onClick={() => onDelete(todo.id)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full
                    bg-gradient-to-r from-red-500 to-red-700 text-white
                    hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Deletar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default React.memo(TaskCard);
