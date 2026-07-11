"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import {
  BookOpen,
  GripVertical,
  Menu,
  Pencil,
  Plus,
  Target,
  Trash2,
  User,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "react-toastify/dist/ReactToastify.css";

import BacklogGoalModal from "@/components/BacklogGoalModal";
import ConfirmModal from "@/components/ConfirmModal";
import NexgenLogo from "@/components/NexgenLogo";
import Sidebar from "@/components/Sidebar";
import {
  BACKLOG_STATUSES,
  getBacklogCategoryLabel,
  getBacklogPriorityLabel,
  type BacklogGoalItem,
  type BacklogGoalPayload,
  type BacklogStatus,
} from "@/lib/backlog";

const categoryStyles: Record<string, string> = {
  CURSO: "border-blue-400/40 bg-blue-500/15 text-blue-300",
  PROJETO: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  STACK: "border-violet-400/40 bg-violet-500/15 text-violet-300",
};

const priorityStyles: Record<string, string> = {
  LOW: "bg-slate-500/16 text-slate-300",
  MEDIUM: "bg-amber-500/16 text-amber-300",
  HIGH: "bg-rose-500/16 text-rose-300",
};

const statusAccent: Record<BacklogStatus, string> = {
  NOT_STARTED: "bg-slate-400",
  IN_PROGRESS: "bg-sky-400",
  COMPLETED: "bg-emerald-400",
};

function isBacklogStatus(value: unknown): value is BacklogStatus {
  return BACKLOG_STATUSES.some((statusItem) => statusItem.value === value);
}

function BacklogGoalCard({
  dragging = false,
  goal,
  onDelete,
  onEdit,
}: {
  dragging?: boolean;
  goal: BacklogGoalItem;
  onDelete?: (goal: BacklogGoalItem) => void;
  onEdit?: (goal: BacklogGoalItem) => void;
}) {
  return (
    <article
      className={`rounded-2xl border border-[var(--subbackground)] bg-[var(--background)] p-4 shadow-sm transition ${
        dragging
          ? "opacity-80 shadow-xl ring-2 ring-[var(--primary)]/30"
          : "hover:-translate-y-0.5 hover:border-[var(--primary)]/35"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-bold leading-6 text-[var(--text)]">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-[var(--subText)]">
              {goal.description}
            </p>
          )}
        </div>
        <BookOpen className="mt-1 h-5 w-5 flex-shrink-0 text-[var(--primary)]" />
      </div>

      <div className="flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            categoryStyles[goal.category] ?? categoryStyles.CURSO
          }`}
        >
          {getBacklogCategoryLabel(goal.category as never)}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            priorityStyles[goal.priority] ?? priorityStyles.MEDIUM
          }`}
        >
          {getBacklogPriorityLabel(goal.priority as never)}
        </span>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 cursor-grab items-center justify-center rounded-full bg-[var(--subbackground)] text-[var(--subText)] active:cursor-grabbing"
            title="Arrastar"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--subbackground)] text-[var(--text)] transition hover:-translate-y-0.5"
              title="Editar"
              type="button"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-500/12 text-red-500 transition hover:-translate-y-0.5 hover:bg-red-500/18"
              title="Deletar"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </article>
  );
}

function DraggableBacklogGoalCard({
  goal,
  onDelete,
  onEdit,
}: {
  goal: BacklogGoalItem;
  onDelete: (goal: BacklogGoalItem) => void;
  onEdit: (goal: BacklogGoalItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: goal.id,
      data: {
        goalId: goal.id,
        status: goal.status,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <BacklogGoalCard goal={goal} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}

function BacklogColumn({
  goals,
  isDraggingOver,
  onDelete,
  onEdit,
  statusValue,
}: {
  goals: BacklogGoalItem[];
  isDraggingOver: boolean;
  onDelete: (goal: BacklogGoalItem) => void;
  onEdit: (goal: BacklogGoalItem) => void;
  statusValue: BacklogStatus;
}) {
  const statusItem = BACKLOG_STATUSES.find((item) => item.value === statusValue);
  const { setNodeRef } = useDroppable({ id: statusValue });

  return (
    <div
      className={`min-h-[420px] rounded-[28px] border p-4 shadow-[0_22px_70px_rgba(15,39,64,0.10)] backdrop-blur-xl transition ${
        isDraggingOver
          ? "border-[var(--primary)]/55 bg-[var(--primary)]/10"
          : "border-white/30 bg-[var(--bgcard)]/82"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${statusAccent[statusValue]}`} />
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--text)]">
            {statusItem?.label}
          </h2>
        </div>
        <span className="rounded-full bg-[var(--subbackground)] px-3 py-1 text-xs font-bold text-[var(--subText)]">
          {goals.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[320px] space-y-3 rounded-2xl transition ${
          isDraggingOver ? "bg-white/5 p-2" : ""
        }`}
      >
        {goals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--subbackground)] px-4 py-10 text-center text-sm text-[var(--subText)]">
            Nenhum objetivo aqui.
          </div>
        ) : (
          goals.map((goal) => (
            <DraggableBacklogGoalCard
              key={goal.id}
              goal={goal}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function BacklogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [goals, setGoals] = useState<BacklogGoalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<BacklogGoalItem | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<BacklogGoalItem | null>(null);
  const [activeGoal, setActiveGoal] = useState<BacklogGoalItem | null>(null);
  const [activeOverStatus, setActiveOverStatus] = useState<BacklogStatus | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const fetchBacklogGoals = useCallback(async () => {
    const response = await fetch("/api/backlog");

    if (!response.ok) {
      setLoading(false);
      toast.error("Nao foi possivel carregar seu backlog.");
      return;
    }

    const data = (await response.json()) as BacklogGoalItem[];
    setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      // Match the existing authenticated page loading pattern used in this app.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchBacklogGoals();
    }
  }, [fetchBacklogGoals, router, status]);

  function openCreateModal() {
    setEditingGoal(null);
    setShowModal(true);
  }

  function openEditModal(goal: BacklogGoalItem) {
    setEditingGoal(goal);
    setShowModal(true);
  }

  async function handleSave(payload: BacklogGoalPayload) {
    const response = await fetch(
      editingGoal ? `/api/backlog/${editingGoal.id}` : "/api/backlog",
      {
        method: editingGoal ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          status: editingGoal?.status ?? payload.status ?? "NOT_STARTED",
        }),
      },
    );

    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      toast.error(result.error ?? "Nao foi possivel salvar o objetivo.");
      return;
    }

    setShowModal(false);
    setEditingGoal(null);
    await fetchBacklogGoals();
    toast.success(editingGoal ? "Objetivo atualizado!" : "Objetivo criado!");
  }

  function handleDragStart(event: DragStartEvent) {
    const goal = goals.find((item) => item.id === event.active.id);
    setActiveGoal(goal ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    setActiveOverStatus(
      isBacklogStatus(event.over?.id) ? event.over.id : null,
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const goalId = String(event.active.id);
    const nextStatus = event.over?.id;
    const draggedGoal = goals.find((goal) => goal.id === goalId);

    setActiveGoal(null);
    setActiveOverStatus(null);

    if (!draggedGoal || !isBacklogStatus(nextStatus)) {
      return;
    }

    if (draggedGoal.status === nextStatus) {
      return;
    }

    const previousGoals = goals;
    const nextGoals = goals.map((goal) =>
      goal.id === draggedGoal.id ? { ...goal, status: nextStatus } : goal,
    );

    setGoals(nextGoals);

    const response = await fetch(`/api/backlog/${draggedGoal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draggedGoal.title,
        description: draggedGoal.description,
        category: draggedGoal.category,
        priority: draggedGoal.priority,
        status: nextStatus,
      } satisfies BacklogGoalPayload),
    });

    if (!response.ok) {
      setGoals(previousGoals);
      toast.error("Nao foi possivel mover o objetivo.");
      return;
    }

    await fetchBacklogGoals();
    router.refresh();
  }

  async function handleDeleteConfirmed() {
    if (!goalToDelete) return;

    const response = await fetch(`/api/backlog/${goalToDelete.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      toast.error("Nao foi possivel deletar o objetivo.");
      return;
    }

    setGoalToDelete(null);
    await fetchBacklogGoals();
    toast.success("Objetivo removido do backlog.");
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          <p className="mt-3 font-semibold text-[var(--subText)]">
            Carregando backlog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(75,185,255,0.18),_transparent_32%),linear-gradient(180deg,var(--background),var(--background-2))]">
      <ToastContainer position="bottom-left" autoClose={3000} theme="colored" />

      <header className="sticky top-0 z-20 border-b border-[var(--subbackground)]/60 bg-[var(--background)]/88 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <NexgenLogo className="h-8 w-8" />
            <div>
              <h1 className="truncate text-lg font-bold text-[var(--text)]">
                Meu Backlog
              </h1>
              <p className="text-xs text-[var(--subText)]">
                Cursos, projetos e stacks
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-[var(--subText)] sm:flex">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5" />
              )}
              <span>
                {session?.user?.name || session?.user?.email?.split("@")[0]}
              </span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="rounded-full p-2 transition hover:bg-[var(--subbackground)]"
            >
              <Menu className="h-6 w-6 text-[var(--text)]" />
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      <main className="mx-auto max-w-[1600px] px-4 py-6 lg:ml-[290px] lg:px-8 lg:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--subText)]">
              Planejamento de longo prazo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-[var(--text)]">
              Meu Backlog
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--subText)]">
              Ideias, cursos e tecnologias para maturar antes de virarem tarefas do dia.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" /> Novo objetivo
          </button>
        </div>

        {goals.length === 0 ? (
          <section className="rounded-[28px] border border-dashed border-[var(--subbackground)] bg-[var(--bgcard)]/82 px-6 py-20 text-center shadow-[0_22px_70px_rgba(15,39,64,0.12)] backdrop-blur-xl">
            <Target className="mx-auto h-14 w-14 text-[var(--primary)]" />
            <h2 className="mt-5 text-2xl font-bold text-[var(--text)]">
              Seu backlog ainda esta vazio
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--subText)]">
              Guarde aqui aquilo que vale aprender, construir ou pesquisar sem precisar transformar tudo em tarefa agora.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" /> Adicionar primeiro objetivo
            </button>
          </section>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
              setActiveGoal(null);
              setActiveOverStatus(null);
            }}
          >
            <section className="grid gap-4 xl:grid-cols-3">
              {BACKLOG_STATUSES.map((statusItem) => (
                <BacklogColumn
                  key={statusItem.value}
                  goals={goals.filter(
                    (goal) => goal.status === statusItem.value,
                  )}
                  isDraggingOver={activeOverStatus === statusItem.value}
                  onDelete={setGoalToDelete}
                  onEdit={openEditModal}
                  statusValue={statusItem.value}
                />
              ))}
            </section>
            <DragOverlay>
              {activeGoal ? (
                <div className="w-[min(360px,calc(100vw-48px))]">
                  <BacklogGoalCard goal={activeGoal} dragging />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </main>

      <button
        onClick={openCreateModal}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-xl transition hover:scale-110 hover:shadow-2xl"
      >
        <Plus className="h-7 w-7" />
      </button>

      {showModal && (
        <BacklogGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSave}
        />
      )}

      {goalToDelete && (
        <ConfirmModal
          message={`Deseja remover "${goalToDelete.title}" do backlog?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setGoalToDelete(null)}
        />
      )}
    </div>
  );
}
