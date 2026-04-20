"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ThemeSwitch from "@/components/ThemeSwitch";

export default function SettingsPage() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>
      <h1 className="text-3xl font-bold gradient-text mb-8">Configurações</h1>

      <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[var(--text)]">Tema</h3>
            <p className="text-sm text-[var(--subText)]">Alternar entre claro e escuro</p>
          </div>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
}
