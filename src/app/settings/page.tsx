import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

import { getNotificationSettings } from "@/app/settings/actions";
import { getUsuarioId } from "@/lib/usuario";
import { prisma } from "@/lib/prisma";
import AdminModeToggle from "@/components/AdminModeToggle";
import PushNotificationSettings from "@/components/PushNotificationSettings";
import ThemeSwitch from "@/components/ThemeSwitch";

export default async function SettingsPage() {
  const notificationSettings = await getNotificationSettings();
  const userId = await getUsuarioId();
  let isAdminRole = false;
  if (userId) {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: userId },
      select: { role: true },
    });
    isAdminRole = usuario?.role === "USER_ADMIN";
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <ToastContainer position="bottom-left" autoClose={3000} theme="colored" />
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>
      <h1 className="text-3xl font-bold gradient-text mb-8">Configurações</h1>

      <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[var(--text)]">Tema</h3>
            <p className="text-sm text-[var(--subText)]">
              Alternar entre claro e escuro
            </p>
          </div>
          <ThemeSwitch />
        </div>
        <PushNotificationSettings initialSettings={notificationSettings} />
      </div>
      {isAdminRole && (
        <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md space-y-4 mt-6">
          <h3 className="text-lg font-bold text-[var(--text)]">
            Configurações de Administrador
          </h3>
          <AdminModeToggle />
        </div>
      )}
    </div>
  );
}
