"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Lock,
  Trash2,
  Mail,
  Menu,
  ShieldCheck,
  Trophy,
  User,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "@/components/ConfirmModal";
import GamificationProgress from "@/components/GamificationProgress";
import NexgenLogo from "@/components/NexgenLogo";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/gamification");
        if (!res.ok) return;
        const data = await res.json();
        setIsAdminRole(Boolean(data.isAdminRole));
      } catch {
        // ignore
      }
    })();
  }, []);

  // Check if user logged in via credentials (has password)
  const isCredentialsUser = !session?.user?.image; // Google users have image

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    setChangingPassword(true);
    const res = await fetch("/api/user/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    setChangingPassword(false);

    if (!res.ok) {
      toast.error(data.error);
    } else {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true);
    const res = await fetch("/api/user/delete", { method: "DELETE" });

    if (res.ok) {
      signOut({ callbackUrl: "/login" });
    } else {
      toast.error("Erro ao deletar conta");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
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

      <main className="flex flex-col gap-6 mx-auto max-w-[1600px] px-4 py-6 lg:ml-[290px] lg:px-8 lg:py-8">
        <h1 className="text-3xl font-bold gradient-text mb-8">Meu Perfil</h1>

        {/* User info card */}
        <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white overflow-hidden">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                {session?.user?.name || "Usuário"}
              </h2>
              {isAdminRole && (
                <div className="mt-1">
                  <span className="rounded-full bg-red-800/70 px-2 py-0.5 text-xs font-semibold text-pink-400">
                    ADMIN
                  </span>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-sm text-[var(--subText)]">
                <Mail className="w-4 h-4" />
                {session?.user?.email}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-[var(--subText)] mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {session?.user?.image ? "Conta Google" : "Email e Senha"}
              </p>
            </div>
          </div>
          <GamificationProgress />
          <Link
            href="/conquistas"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--subbackground)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--primary)]/10"
          >
            <Trophy className="h-4 w-4" />
            Ver histórico e calendário
          </Link>
        </div>

        {/* Change password (only for credentials users) */}
        {isCredentialsUser && (
          <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5" /> Alterar Senha
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Senha atual"
                className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (mín. 6 caracteres)"
                className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova senha"
                className="w-full px-4 py-2.5 rounded-full bg-[var(--subbackground)] text-[var(--text)]
                placeholder:text-[var(--subText)] outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
              />
              <button
                type="submit"
                disabled={changingPassword}
                className="w-full py-2.5 rounded-full font-bold text-white
                bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]
                hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {changingPassword ? "Alterando..." : "Alterar Senha"}
              </button>
            </form>
          </div>
        )}

        {/* Delete account */}
        <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md border border-red-500/20">
          <h3 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-2">
            <Trash2 className="w-5 h-5" /> Zona de Perigo
          </h3>
          <p className="text-sm text-[var(--subText)] mb-4">
            Ao deletar sua conta, todos os seus dados e tarefas serão
            permanentemente removidos. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-6 py-2.5 rounded-full font-bold text-white
            bg-gradient-to-r from-red-500 to-red-700
            hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 transition-all"
          >
            {deleting ? "Deletando..." : "Deletar Minha Conta"}
          </button>
        </div>

        <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md border border-red-500/20">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>

        {showDeleteConfirm && (
          <ConfirmModal
            message="Tem certeza que deseja deletar sua conta? Todos os dados serão perdidos permanentemente."
            onConfirm={handleDeleteAccount}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </main>
    </div>
  );
}
