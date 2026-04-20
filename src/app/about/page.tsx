"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>
      <h1 className="text-3xl font-bold gradient-text mb-8">Sobre</h1>

      <div className="bg-[var(--bgcard)] rounded-2xl p-6 shadow-md space-y-4">
        <p className="text-[var(--text)] font-medium">
          <strong>Nexgen Tasks</strong> é um gerenciador de tarefas moderno, construído com:
        </p>
        <ul className="list-disc pl-6 text-[var(--subText)] space-y-1 text-sm">
          <li>Next.js 16 + TypeScript</li>
          <li>Prisma + PostgreSQL</li>
          <li>NextAuth.js (Google + Email/Senha)</li>
          <li>Tailwind CSS + Framer Motion</li>
          <li>Drag & Drop com dnd-kit</li>
        </ul>
      </div>
    </div>
  );
}
