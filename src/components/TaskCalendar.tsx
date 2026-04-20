"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Todo } from "./TaskCard";

interface TaskCalendarProps {
  todos: Todo[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export default function TaskCalendar({ todos, selectedDate, onSelectDate }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build a set of dates that have tasks (YYYY-MM-DD)
  const taskDates = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; urgent: boolean }>();
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      const key = todo.dueDate;
      const entry = map.get(key) || { total: 0, completed: 0, urgent: false };
      entry.total++;
      if (todo.completed) entry.completed++;
      if (todo.priority === "Urgente" || todo.priority === "Alta") entry.urgent = true;
      map.set(key, entry);
    }
    return map;
  }, [todos]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function handleClickDay(dateStr: string) {
    if (selectedDate === dateStr) {
      onSelectDate(null); // toggle off
    } else {
      onSelectDate(dateStr);
    }
  }

  // Format selected date for display
  function formatSelectedDate(dateStr: string) {
    const parts = dateStr.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return (
    <div className="rounded-3xl border border-white/40 bg-[var(--bgcard)]/92 p-4 shadow-[0_24px_60px_rgba(30,41,57,0.08)] backdrop-blur-sm dark:border-white/6 dark:shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-[var(--subbackground)] transition">
          <ChevronLeft className="w-5 h-5 text-[var(--text)]" />
        </button>
        <span className="font-bold text-[var(--text)] text-sm">
          {monthNames[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-[var(--subbackground)] transition">
          <ChevronRight className="w-5 h-5 text-[var(--text)]" />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-[var(--subText)] uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const info = taskDates.get(dateStr);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const allDone = info && info.total === info.completed;

          let dotColor = "";
          if (info) {
            if (allDone) dotColor = "bg-green-500";
            else if (info.urgent) dotColor = "bg-red-500";
            else dotColor = "bg-[var(--primary)]";
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleClickDay(dateStr)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-semibold transition cursor-pointer
                ${isSelected
                  ? "ring-2 ring-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]"
                  : isToday
                    ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white"
                    : "text-[var(--text)] hover:bg-[var(--subbackground)]"
                }`}
              title={info ? `${info.total} tarefa(s)${allDone ? " (todas concluídas)" : ""}` : undefined}
            >
              {day}
              {info && (
                <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date badge */}
      {selectedDate && (
        <div className="flex items-center justify-between mt-3 px-2 py-1.5 rounded-full bg-[var(--primary)]/10">
          <span className="text-xs font-bold text-[var(--primary)]">
            Filtrando: {formatSelectedDate(selectedDate)}
          </span>
          <button
            onClick={() => onSelectDate(null)}
            className="p-0.5 rounded-full hover:bg-[var(--primary)]/20 transition"
          >
            <X className="w-3.5 h-3.5 text-[var(--primary)]" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-[var(--subText)]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Tarefas</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Urgente</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Concluídas</span>
      </div>
    </div>
  );
}
