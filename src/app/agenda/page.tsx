"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import { CalendarDays, Menu, Plus, User } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import ConfirmModal from "@/components/ConfirmModal";
import NexgenLogo from "@/components/NexgenLogo";
import Sidebar from "@/components/Sidebar";
import WeeklyTaskModal from "@/components/WeeklyTaskModal";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  DEFAULT_WEEKLY_TASK_COLOR,
  DISPLAY_WEEK_DAYS,
  getWeekDay,
  getWeeklyTaskColorStyles,
  timeToMinutes,
  type WeeklyTaskBatchPayload,
  type WeeklyTaskItem,
  type WeeklyTaskPayload,
} from "@/lib/agenda";

const PIXELS_PER_MINUTE = 1.15;
const GRID_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;

function getHours() {
  return Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR },
    (_, index) => DAY_START_HOUR + index,
  );
}

export default function AgendaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<WeeklyTaskItem[]>([]);
  const [now, setNow] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<WeeklyTaskItem | null>(null);
  const [initialDayOfWeek, setInitialDayOfWeek] = useState(1);
  const [taskToDelete, setTaskToDelete] = useState<{
    task: WeeklyTaskItem;
    applyToAllInstances: boolean;
    originalTitle: string;
  } | null>(null);

  const hours = getHours();

  async function fetchWeeklyTasks() {
    const response = await fetch("/api/agenda");

    if (!response.ok) {
      setLoading(false);
      toast.error("Não foi possível carregar sua agenda.");
      return;
    }

    const data = (await response.json()) as WeeklyTaskItem[];
    setTasks(
      data.sort((a, b) =>
        a.dayOfWeek === b.dayOfWeek
          ? a.startTime.localeCompare(b.startTime)
          : a.dayOfWeek - b.dayOfWeek,
      ),
    );
    setLoading(false);
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      void (async () => {
        await fetchWeeklyTasks();
      })();
    }
  }, [router, status]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  function openCreateModal(dayOfWeek = 1) {
    setEditingTask(null);
    setInitialDayOfWeek(dayOfWeek);
    setShowModal(true);
  }

  function openEditModal(task: WeeklyTaskItem) {
    setEditingTask(task);
    setInitialDayOfWeek(task.dayOfWeek);
    setShowModal(true);
  }

  async function handleSave(payload: WeeklyTaskBatchPayload) {
    if (editingTask) {
      const updatePayload: WeeklyTaskPayload = {
        title: payload.title,
        dayOfWeek: payload.daysOfWeek[0] ?? editingTask.dayOfWeek,
        startTime: payload.startTime,
        endTime: payload.endTime,
        category: payload.category,
        color: payload.color ?? DEFAULT_WEEKLY_TASK_COLOR,
      };

      const response = await fetch(`/api/agenda/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...updatePayload,
          applyToAllInstances: payload.applyToAllInstances,
          originalTitle: payload.originalTitle ?? editingTask.title,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        affectedCount?: number;
      };

      if (!response.ok) {
        toast.error(result.error ?? "Não foi possível salvar a agenda.");
        return;
      }

      setShowModal(false);
      setEditingTask(null);
      await fetchWeeklyTasks();
      toast.success(
        payload.applyToAllInstances
          ? `${result.affectedCount ?? 0} tarefas atualizadas com sucesso`
          : "Bloco atualizado!",
      );
      return;
    }

    const createResponses = await Promise.allSettled(
      payload.daysOfWeek.map((dayOfWeek) =>
        fetch("/api/agenda", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title,
            dayOfWeek,
            startTime: payload.startTime,
            endTime: payload.endTime,
            category: payload.category,
            color: payload.color ?? DEFAULT_WEEKLY_TASK_COLOR,
          } satisfies WeeklyTaskPayload),
        }),
      ),
    );

    const failedRequests: string[] = [];

    for (const request of createResponses) {
      if (request.status === "rejected") {
        failedRequests.push("Falha de rede");
        continue;
      }

      if (!request.value.ok) {
        const result = (await request.value.json()) as { error?: string };
        failedRequests.push(
          result.error ?? "Não foi possível criar um dos blocos.",
        );
      }
    }

    if (failedRequests.length > 0) {
      toast.error(failedRequests[0]);
      return;
    }

    setShowModal(false);
    await fetchWeeklyTasks();
    toast.success(
      payload.daysOfWeek.length === 1
        ? "Bloco adicionado à agenda!"
        : `${payload.daysOfWeek.length} blocos adicionados à agenda!`,
    );
  }

  async function handleDeleteConfirmed() {
    if (!taskToDelete) {
      return;
    }

    const response = await fetch(`/api/agenda/${taskToDelete.task.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applyToAllInstances: taskToDelete.applyToAllInstances,
        originalTitle: taskToDelete.originalTitle,
      }),
    });

    const result = (await response.json()) as {
      success?: boolean;
      affectedCount?: number;
    };

    if (!response.ok) {
      toast.error("Não foi possível deletar o bloco.");
      return;
    }

    setTaskToDelete(null);
    setShowModal(false);
    setEditingTask(null);
    await fetchWeeklyTasks();
    toast.success(
      taskToDelete.applyToAllInstances
        ? `${result.affectedCount ?? 0} tarefas removidas com sucesso`
        : "Bloco removido da agenda.",
    );
  }

  const currentDayOfWeek = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentTimeTop =
    (currentMinutes - DAY_START_HOUR * 60) * PIXELS_PER_MINUTE;
  const showCurrentTimeIndicator =
    currentMinutes >= DAY_START_HOUR * 60 &&
    currentMinutes < DAY_END_HOUR * 60;
  const currentTimeLabel = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
          <p className="mt-3 font-semibold text-[var(--subText)]">
            Carregando agenda semanal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(75,185,255,0.22),_transparent_32%),linear-gradient(180deg,var(--background),var(--background-2))]">
      <ToastContainer position="bottom-left" autoClose={3000} theme="colored" />

      <header className="sticky top-0 z-20 border-b border-[var(--subbackground)]/60 bg-[var(--background)]/88 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <NexgenLogo className="h-8 w-8" />
            <div>
              <h1 className="truncate text-lg font-bold text-[var(--text)]">
                Agenda Semanal
              </h1>
              <p className="text-xs text-[var(--subText)]">
                Blocos fixos da sua rotina
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
        <section className="rounded-[32px] border border-white/30 bg-[var(--bgcard)]/82 p-4 shadow-[0_22px_70px_rgba(15,39,64,0.12)] backdrop-blur-xl lg:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[var(--text)]">
                Agenda semanal
              </h3>
              <p className="mt-1 text-sm text-[var(--subText)]">
                Colunas por dia, linhas por horário e edição rápida direto nos
                cards.
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[var(--subbackground)] bg-[var(--background)] px-6 py-20 text-center">
              <CalendarDays className="mx-auto h-14 w-14 text-[var(--primary)]" />
              <h4 className="mt-5 text-2xl font-bold text-[var(--text)]">
                Sua semana ainda está em branco
              </h4>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--subText)]">
                Crie blocos fixos para aulas, estudo, treinos e compromissos
                recorrentes. A grade vai organizá-los automaticamente por dia e
                horário.
              </p>
              <button
                onClick={() => openCreateModal(1)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus className="h-4 w-4" /> Criar primeiro bloco
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div
                className="grid min-w-[1040px] grid-cols-[72px_repeat(7,minmax(130px,1fr))] gap-x-3"
                style={{ gridAutoRows: "min-content" }}
              >
                <div />
                {DISPLAY_WEEK_DAYS.map((dayOfWeek) => {
                  const day = getWeekDay(dayOfWeek);
                  const totalDayTasks = tasks.filter(
                    (task) => task.dayOfWeek === dayOfWeek,
                  ).length;

                  return (
                    <div
                      key={dayOfWeek}
                      className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--background)]/86 px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--subText)]">
                            {day?.shortLabel}
                          </p>
                          <p className="mt-1 text-lg font-bold text-[var(--text)]">
                            {day?.fullLabel}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[var(--subText)]">
                        {totalDayTasks} bloco(s)
                      </p>
                    </div>
                  );
                })}

                <div
                  className="relative mt-3 rounded-[24px] bg-transparent"
                  style={{ height: GRID_MINUTES * PIXELS_PER_MINUTE }}
                >
                  {showCurrentTimeIndicator && (
                    <div
                      className="absolute left-0 right-0 z-10 -translate-y-1/2"
                      style={{ top: currentTimeTop }}
                    >
                      <div className="ml-auto w-fit rounded-full bg-[#ff6b57] px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                        {currentTimeLabel}
                      </div>
                    </div>
                  )}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 -translate-y-1/2 text-right text-xs font-bold text-[var(--subText)]"
                      style={{
                        top: (hour - DAY_START_HOUR) * 60 * PIXELS_PER_MINUTE,
                      }}
                    >
                      {`${String(hour).padStart(2, "0")}:00`}
                    </div>
                  ))}
                </div>

                {DISPLAY_WEEK_DAYS.map((dayOfWeek) => {
                  const dayTasks = tasks
                    .filter((task) => task.dayOfWeek === dayOfWeek)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                  return (
                    <div
                      key={`column-${dayOfWeek}`}
                      className="relative mt-3 overflow-hidden rounded-[28px] border border-[var(--subbackground)] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0.12))]"
                      style={{ height: GRID_MINUTES * PIXELS_PER_MINUTE }}
                    >
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="absolute inset-x-0 border-t border-dashed border-[var(--subbackground)]/90"
                          style={{
                            top:
                              (hour - DAY_START_HOUR) * 60 * PIXELS_PER_MINUTE,
                          }}
                        />
                      ))}

                      {showCurrentTimeIndicator &&
                        dayOfWeek === currentDayOfWeek && (
                          <div
                            className="absolute inset-x-0 z-20 -translate-y-1/2"
                            style={{ top: currentTimeTop }}
                          >
                            <div className="relative h-0.5 bg-[#ff6b57] shadow-[0_0_0_1px_rgba(255,107,87,0.18)]">
                              <span className="absolute -left-1.5 -top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#ff6b57] shadow-md" />
                            </div>
                          </div>
                        )}

                      {dayTasks.map((task) => {
                        const startMinutes = timeToMinutes(task.startTime);
                        const endMinutes = timeToMinutes(task.endTime);
                        const top =
                          Math.max(startMinutes - DAY_START_HOUR * 60, 0) *
                          PIXELS_PER_MINUTE;
                        const height = Math.max(
                          (endMinutes - startMinutes) * PIXELS_PER_MINUTE,
                          58,
                        );
                        const color = getWeeklyTaskColorStyles(task.color);

                        return (
                          <button
                            key={task.id}
                            onClick={() => openEditModal(task)}
                            className="absolute left-2 right-2 overflow-hidden rounded-[22px] border px-3 py-3 text-left shadow-[0_18px_35px_rgba(15,39,64,0.08)] transition hover:scale-[1.01] hover:shadow-[0_22px_40px_rgba(15,39,64,0.14)]"
                            style={{
                              top,
                              minHeight: 58,
                              height,
                              background: color.background,
                              borderColor: color.border,
                              borderLeftWidth: 4,
                              borderLeftColor: color.solid,
                            }}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              {task.category ? (
                                <span
                                  className="rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                                  style={{
                                    background: color.border,
                                    color: color.accent,
                                  }}
                                >
                                  {task.category}
                                </span>
                              ) : (
                                <span />
                              )}
                              <span className="text-[11px] font-bold text-[var(--subText)]">
                                {task.startTime} - {task.endTime}
                              </span>
                            </div>
                            <p className="text-sm font-bold leading-5 text-[var(--text)]">
                              {task.title}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <button
        onClick={() => openCreateModal(1)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white shadow-xl transition hover:scale-110 hover:shadow-2xl"
      >
        <Plus className="h-7 w-7" />
      </button>

      {showModal && (
        <WeeklyTaskModal
          key={editingTask?.id ?? `new-${initialDayOfWeek}`}
          task={editingTask}
          initialDayOfWeek={initialDayOfWeek}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSave={handleSave}
          onDelete={(payload) => setTaskToDelete(payload)}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          message={
            taskToDelete.applyToAllInstances
              ? `Deseja remover todas as instâncias de "${taskToDelete.originalTitle}" da agenda semanal?`
              : `Deseja remover "${taskToDelete.task.title}" da agenda semanal?`
          }
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  );
}
