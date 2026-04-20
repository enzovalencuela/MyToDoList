"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock, Trash2, User, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <ToastContainer position="bottom-left" autoClose={3000} theme="colored" />

      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <h1 className="text-3xl font-bold gradient-text mb-8">Meu Perfil</h1>

      {/* User info card */}
      <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white overflow-hidden">
            {session?.user?.image ? (
              <img src={session.user.image} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              {session?.user?.name || "Usuário"}
            </h2>
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
          Ao deletar sua conta, todos os seus dados e tarefas serão permanentemente removidos. Esta ação não pode ser desfeita.
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

      {showDeleteConfirm && (
        <ConfirmModal
          message="Tem certeza que deseja deletar sua conta? Todos os dados serão perdidos permanentemente."
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
