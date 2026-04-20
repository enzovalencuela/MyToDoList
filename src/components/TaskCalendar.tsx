"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Todo } from "./TaskCard";

interface TaskCalendarProps {
  todos: Todo[];
}

export default function TaskCalendar({ todos }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Build a set of dates that have tasks (YYYY-MM-DD)
  const taskDates = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; urgent: boolean }>();
    for (const todo of todos) {
      if (!todo.dueDate) continue;
      const key = todo.dueDate; // already YYYY-MM-DD
      const entry = map.get(key) || { total: 0, completed: 0, urgent: false };
      entry.total++;
      if (todo.completed) entry.completed++;
      if (todo.priority === "Urgente" || todo.priority === "Alta") entry.urgent = true;
      map.set(key, entry);
    }
    return map;
  }, [todos]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=Sun

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

  return (
    <div className="bg-[var(--bgcard)] rounded-2xl p-4 shadow-md">
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
          const allDone = info && info.total === info.completed;

          let dotColor = "";
          if (info) {
            if (allDone) dotColor = "bg-green-500";
            else if (info.urgent) dotColor = "bg-red-500";
            else dotColor = "bg-[var(--primary)]";
          }

          return (
            <div
              key={dateStr}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-semibold transition
                ${isToday
                  ? "bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white"
                  : "text-[var(--text)] hover:bg-[var(--subbackground)]"
                }`}
              title={info ? `${info.total} tarefa(s)${allDone ? " (todas concluídas)" : ""}` : undefined}
            >
              {day}
              {info && (
                <span className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-[var(--subText)]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Tarefas</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Urgente</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Concluídas</span>
      </div>
    </div>
  );
}
