export interface WeeklyTaskPayload {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category?: string | null;
  color?: WeeklyTaskColorKey;
}

export interface WeeklyTaskBatchPayload {
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  category?: string | null;
  color?: WeeklyTaskColorKey;
  applyToAllInstances?: boolean;
  originalTitle?: string;
}

export interface WeeklyTaskItem extends WeeklyTaskPayload {
  id: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const WEEKLY_TASK_COLOR_OPTIONS = [
  {
    key: "slate",
    label: "Slate",
    solid: "#64748b",
    border: "rgba(100, 116, 139, 0.55)",
    background: "rgba(100, 116, 139, 0.18)",
  },
  {
    key: "red",
    label: "Red",
    solid: "#ef4444",
    border: "rgba(239, 68, 68, 0.55)",
    background: "rgba(239, 68, 68, 0.18)",
  },
  {
    key: "orange",
    label: "Orange",
    solid: "#f97316",
    border: "rgba(249, 115, 22, 0.55)",
    background: "rgba(249, 115, 22, 0.18)",
  },
  {
    key: "amber",
    label: "Amber",
    solid: "#f59e0b",
    border: "rgba(245, 158, 11, 0.55)",
    background: "rgba(245, 158, 11, 0.18)",
  },
  {
    key: "emerald",
    label: "Emerald",
    solid: "#10b981",
    border: "rgba(16, 185, 129, 0.55)",
    background: "rgba(16, 185, 129, 0.18)",
  },
  {
    key: "blue",
    label: "Blue",
    solid: "#3b82f6",
    border: "rgba(59, 130, 246, 0.55)",
    background: "rgba(59, 130, 246, 0.18)",
  },
  {
    key: "indigo",
    label: "Indigo",
    solid: "#6366f1",
    border: "rgba(99, 102, 241, 0.55)",
    background: "rgba(99, 102, 241, 0.18)",
  },
  {
    key: "violet",
    label: "Violet",
    solid: "#8b5cf6",
    border: "rgba(139, 92, 246, 0.55)",
    background: "rgba(139, 92, 246, 0.18)",
  },
  {
    key: "pink",
    label: "Pink",
    solid: "#ec4899",
    border: "rgba(236, 72, 153, 0.55)",
    background: "rgba(236, 72, 153, 0.18)",
  },
  {
    key: "rose",
    label: "Rose",
    solid: "#f43f5e",
    border: "rgba(244, 63, 94, 0.55)",
    background: "rgba(244, 63, 94, 0.18)",
  },
] as const;

export type WeeklyTaskColorKey = (typeof WEEKLY_TASK_COLOR_OPTIONS)[number]["key"];
export const DEFAULT_WEEKLY_TASK_COLOR: WeeklyTaskColorKey = "blue";

export const WEEK_DAYS = [
  { value: 0, shortLabel: "Dom", fullLabel: "Domingo" },
  { value: 1, shortLabel: "Seg", fullLabel: "Segunda" },
  { value: 2, shortLabel: "Ter", fullLabel: "Terça" },
  { value: 3, shortLabel: "Qua", fullLabel: "Quarta" },
  { value: 4, shortLabel: "Qui", fullLabel: "Quinta" },
  { value: 5, shortLabel: "Sex", fullLabel: "Sexta" },
  { value: 6, shortLabel: "Sáb", fullLabel: "Sábado" },
] as const;

export const DISPLAY_WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;
export const DAY_START_HOUR = 0;
export const DAY_END_HOUR = 24;

export function isValidWeeklyTaskColor(value: string): value is WeeklyTaskColorKey {
  return WEEKLY_TASK_COLOR_OPTIONS.some((option) => option.key === value);
}

export function getWeeklyTaskColorStyles(color?: string | null) {
  return (
    WEEKLY_TASK_COLOR_OPTIONS.find((option) => option.key === color) ??
    WEEKLY_TASK_COLOR_OPTIONS.find((option) => option.key === DEFAULT_WEEKLY_TASK_COLOR)!
  );
}

export function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function isValidTime(value: string) {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function getWeekDay(dayOfWeek: number) {
  return WEEK_DAYS.find((day) => day.value === dayOfWeek);
}

export function validateWeeklyTaskInput(data: unknown): WeeklyTaskPayload {
  if (!data || typeof data !== "object") {
    throw new Error("Dados inválidos");
  }

  const payload = data as Record<string, unknown>;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const category =
    typeof payload.category === "string" && payload.category.trim()
      ? payload.category.trim()
      : null;
  const color =
    typeof payload.color === "string" && isValidWeeklyTaskColor(payload.color)
      ? payload.color
      : DEFAULT_WEEKLY_TASK_COLOR;

  const dayOfWeek =
    typeof payload.dayOfWeek === "number"
      ? payload.dayOfWeek
      : Number(payload.dayOfWeek);

  const startTime = typeof payload.startTime === "string" ? payload.startTime : "";
  const endTime = typeof payload.endTime === "string" ? payload.endTime : "";

  if (!title) {
    throw new Error("Título é obrigatório");
  }

  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
    throw new Error("Dia da semana inválido");
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    throw new Error("Horários inválidos");
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    throw new Error("O horário final deve ser maior que o inicial");
  }

  return {
    title,
    dayOfWeek,
    startTime,
    endTime,
    category,
    color,
  };
}
