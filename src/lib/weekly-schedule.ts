export interface WeeklyTaskPayload {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category?: string | null;
}

export interface WeeklyTaskItem extends WeeklyTaskPayload {
  id: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const WEEK_DAYS = [
  { value: 0, shortLabel: "Dom", fullLabel: "Domingo" },
  { value: 1, shortLabel: "Seg", fullLabel: "Segunda" },
  { value: 2, shortLabel: "Ter", fullLabel: "Terça" },
  { value: 3, shortLabel: "Qua", fullLabel: "Quarta" },
  { value: 4, shortLabel: "Qui", fullLabel: "Quinta" },
  { value: 5, shortLabel: "Sex", fullLabel: "Sexta" },
  { value: 6, shortLabel: "Sáb", fullLabel: "Sábado" },
] as const;

export const DISPLAY_WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0] as const;
export const DAY_START_HOUR = 6;
export const DAY_END_HOUR = 24;

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
  };
}
