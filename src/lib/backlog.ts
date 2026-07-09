export const BACKLOG_STATUSES = [
  { value: "NOT_STARTED", label: "Nao Iniciado" },
  { value: "IN_PROGRESS", label: "Em Andamento" },
  { value: "COMPLETED", label: "Concluido" },
] as const;

export const BACKLOG_CATEGORIES = [
  { value: "CURSO", label: "Curso" },
  { value: "PROJETO", label: "Projeto" },
  { value: "STACK", label: "Stack" },
] as const;

export const BACKLOG_PRIORITIES = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
] as const;

export type BacklogStatus = (typeof BACKLOG_STATUSES)[number]["value"];
export type BacklogCategory = (typeof BACKLOG_CATEGORIES)[number]["value"];
export type BacklogPriority = (typeof BACKLOG_PRIORITIES)[number]["value"];

export interface BacklogGoalPayload {
  title: string;
  description?: string | null;
  category: BacklogCategory;
  status?: BacklogStatus;
  priority: BacklogPriority;
}

export interface BacklogGoalItem extends Required<BacklogGoalPayload> {
  id: string;
  userId: number;
  createdAt: string;
}

function isBacklogCategory(value: unknown): value is BacklogCategory {
  return BACKLOG_CATEGORIES.some((category) => category.value === value);
}

function isBacklogStatus(value: unknown): value is BacklogStatus {
  return BACKLOG_STATUSES.some((status) => status.value === value);
}

function isBacklogPriority(value: unknown): value is BacklogPriority {
  return BACKLOG_PRIORITIES.some((priority) => priority.value === value);
}

export function getBacklogStatusLabel(status: BacklogStatus) {
  return BACKLOG_STATUSES.find((item) => item.value === status)?.label ?? status;
}

export function getBacklogCategoryLabel(category: BacklogCategory) {
  return BACKLOG_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}

export function getBacklogPriorityLabel(priority: BacklogPriority) {
  return BACKLOG_PRIORITIES.find((item) => item.value === priority)?.label ?? priority;
}

export function validateBacklogGoalInput(data: unknown): BacklogGoalPayload {
  if (!data || typeof data !== "object") {
    throw new Error("Dados invalidos");
  }

  const payload = data as Record<string, unknown>;
  const title = typeof payload.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload.description === "string" && payload.description.trim()
      ? payload.description.trim()
      : null;
  const category = isBacklogCategory(payload.category) ? payload.category : "CURSO";
  const status = isBacklogStatus(payload.status) ? payload.status : "NOT_STARTED";
  const priority = isBacklogPriority(payload.priority) ? payload.priority : "MEDIUM";

  if (!title) {
    throw new Error("Titulo e obrigatorio");
  }

  return {
    title,
    description,
    category,
    status,
    priority,
  };
}
