"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Menu, Plus, Filter, ArrowUpDown, Trash2, LogOut, User, CalendarX2 } from "lucide-react";

import TaskCard, { type Todo } from "@/components/TaskCard";
import AddTaskForm from "@/components/AddTaskForm";
import ConfirmModal from "@/components/ConfirmModal";
import InputSearch from "@/components/InputSearch";
import Sidebar from "@/components/Sidebar";
import TaskCalendar from "@/components/TaskCalendar";
import NexgenLogo from "@/components/NexgenLogo";

type FilterType = "priority" | "date" | "title" | null;
type SortDir = "asc" | "desc";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [allTodos, setAllTodos] = useState<Todo[]>([]);
  const [filteredTodos, setFilteredTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    if (res.ok) {
      const data = await res.json();
      setAllTodos(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated") fetchTodos();
  }, [status, router, fetchTodos]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...allTodos];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    // Calendar date filter
    if (selectedDate) {
      result = result.filter((t) => t.dueDate === selectedDate);
    }

    // Separate pending and completed
    const pending = result.filter((t) => !t.completed);
    const completed = result.filter((t) => t.completed);

    // Sort pending
    if (filterType) {
      pending.sort((a, b) => {
        let cmp = 0;
        if (filterType === "priority") {
          const order = { Urgente: 0, Alta: 1, Normal: 2, Baixa: 3 };
          cmp = (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
        } else if (filterType === "date") {
          const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = da - db;
        } else if (filterType === "title") {
          cmp = a.title.localeCompare(b.title);
        }
        return sortDir === "desc" ? -cmp : cmp;
      });
    }

    setFilteredTodos([...pending, ...completed]);
  }, [allTodos, searchTerm, filterType, sortDir, selectedDate]);

  async function handleAddTask(task: { title: string; description?: string; priority: string; dueDate?: string }) {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      setShowAddForm(false);
      fetchTodos();
      toast.success("Tarefa criada!");
    } else {
      toast.error("Erro ao criar tarefa");
    }
  }

  async function handleToggle(id: string, completed: boolean) {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    setAllTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
  }

  async function handleDelete(id: string) {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setAllTodos((prev) => prev.filter((t) => t.id !== id));
    toast.success("Tarefa deletada!");
  }

  async function handleUpdate(id: string, data: Partial<Todo>) {
    await fetch("/api/todos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    fetchTodos();
    toast.success("Tarefa atualizada!");
  }

  async function handleDeleteCompleted() {
    await fetch("/api/todos/delete-completed", { method: "DELETE" });
    setShowDeleteConfirm(false);
    fetchTodos();
    toast.success("Tarefas concluídas deletadas!");
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const pending = filteredTodos.filter((t) => !t.completed);
    const completed = filteredTodos.filter((t) => t.completed);
    const oldIndex = pending.findIndex((t) => t.id === active.id);
    const newIndex = pending.findIndex((t) => t.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pending, oldIndex, newIndex);
    setFilteredTodos([...reordered, ...completed]);
    setAllTodos([...reordered, ...completed]);

    // Persist order
    fetch("/api/todos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
    });
  }

  function handleFilter(type: FilterType) {
    if (filterType === type) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setFilterType(type);
      setSortDir("asc");
    }
    setShowFilterMenu(false);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-[var(--subText)] font-semibold">Carregando...</p>
        </div>
      </div>
    );
  }

  const pendingTodos = filteredTodos.filter((t) => !t.completed);
  const completedTodos = filteredTodos.filter((t) => t.completed);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <ToastContainer position="bottom-left" autoClose={3000} theme="colored" />

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-[var(--subbackground)]/60 bg-[var(--background)]/92 backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <NexgenLogo variant="icon" className="w-8 h-8" />
            <h1 className="truncate text-lg font-bold gradient-text sm:text-xl">Nexgen Tasks</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-[var(--subText)] sm:flex">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span>Olá, {session?.user?.name || session?.user?.email?.split("@")[0]}</span>
            </div>
            <button
              onClick={() => setShowSidebar(true)}
              className="rounded-full p-2 transition hover:bg-[var(--subbackground)] lg:hidden"
            >
              <Menu className="w-6 h-6 text-[var(--text)]" />
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />

      <main className="mx-auto max-w-7xl px-4 py-6 lg:ml-[290px] lg:px-8 lg:pt-8 lg:pb-8">
        {/* Calendar + Search row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 mb-6">
          <div className="space-y-6">
            {/* Search + Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <InputSearch onSearch={setSearchTerm} />

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--subbackground)]
                  text-[var(--text)] text-sm font-semibold hover:ring-2 hover:ring-[var(--primary)] transition"
              >
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
              {showFilterMenu && (
                <div className="absolute top-full mt-1 right-0 bg-[var(--bgcard)] rounded-xl shadow-xl border border-[var(--subbackground)] z-20 w-40 py-1">
                  {(["priority", "date", "title"] as FilterType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleFilter(type)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[var(--subbackground)] transition
                        ${filterType === type ? "font-bold text-[var(--primary)]" : "text-[var(--text)]"}`}
                    >
                      {type === "priority" ? "Prioridade" : type === "date" ? "Data" : "Título"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active filter badge */}
            {filterType && (
              <button
                onClick={() => { setFilterType(null); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-bold"
              >
                {filterType === "priority" ? "Prioridade" : filterType === "date" ? "Data" : "Título"}
                <ArrowUpDown className="w-3 h-3" />
                ✕
              </button>
            )}
          </div>
            </div>
          </div>

          {/* Calendar sidebar */}
          <div className="hidden lg:block">
            <TaskCalendar todos={allTodos} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>
        </div>

        {/* Mobile calendar */}
        <div className="lg:hidden mb-6">
          <TaskCalendar todos={allTodos} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </div>

        {/* Tasks */}
        {allTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Bora organizar sua vida!</h2>
            <p className="text-[var(--subText)]">Adicione sua primeira tarefa clicando no botão abaixo.</p>
          </div>
        ) : filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CalendarX2 className="w-16 h-16 text-[var(--subText)] mb-4" />
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">
              Nenhuma tarefa {selectedDate ? "para este dia" : "encontrada"}
            </h2>
            <p className="text-[var(--subText)] text-sm mb-4">
              {selectedDate
                ? `Não há tarefas com prazo em ${selectedDate.split("-").reverse().join("/")}.`
                : "Tente ajustar os filtros ou o termo de busca."}
            </p>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="px-5 py-2 rounded-full text-sm font-bold text-white
                  bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                  hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Limpar filtro de data
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pending */}
            {pendingTodos.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold uppercase text-[var(--subText)] tracking-wider">
                  Pendentes ({pendingTodos.length})
                </h2>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={pendingTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {pendingTodos.map((todo) => (
                        <TaskCard
                          key={todo.id}
                          todo={todo}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          onUpdate={handleUpdate}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </section>
            )}

            {/* Completed */}
            {completedTodos.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase text-[var(--subText)] tracking-wider">
                    Concluídas ({completedTodos.length})
                  </h2>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full
                      bg-gradient-to-r from-red-500 to-red-700 text-white font-bold
                      hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <Trash2 className="w-3 h-3" /> Deletar Todas
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {completedTodos.map((todo) => (
                    <TaskCard
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* FAB - Add Task */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl z-30
          bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white
          flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all group"
      >
        <Plus className="w-7 h-7 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Modals */}
      {showAddForm && (
        <AddTaskForm onAdd={handleAddTask} onClose={() => setShowAddForm(false)} />
      )}
      {showDeleteConfirm && (
        <ConfirmModal
          message="Tem certeza que deseja deletar todas as tarefas concluídas?"
          onConfirm={handleDeleteCompleted}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
