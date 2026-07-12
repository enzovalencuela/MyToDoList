"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  Flame,
  ListTodo,
  Sparkles,
} from "lucide-react";

const pillars = [
  {
    title: "Foco Diário",
    subtitle: "Tarefas",
    description:
      "Organize as prioridades do dia com clareza. Crie, reordene, filtre e conclua tarefas com agilidade para manter o que importa sempre em evidência.",
    icon: ListTodo,
    accent: "from-blue-500/20 to-cyan-500/10 border-blue-400/30 text-blue-300",
  },
  {
    title: "Rotina Consistente",
    subtitle: "Agenda",
    description:
      "Estruture blocos de tempo fixos na sua semana para transformar intenção em hábito. Estudo, trabalho e descanso ganham horários previsíveis e notificações inteligentes.",
    icon: CalendarDays,
    accent: "from-violet-500/20 to-purple-500/10 border-violet-400/30 text-violet-300",
  },
  {
    title: "Visão de Futuro",
    subtitle: "Backlog",
    description:
      "Amadureça ideias, cursos e tecnologias no longo prazo. Arraste objetivos entre colunas com Drag and Drop e acompanhe sua evolução de forma visual.",
    icon: BookOpenCheck,
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-400/30 text-emerald-300",
  },
  {
    title: "Evolução Gamificada",
    subtitle: "Streaks & XP",
    description:
      "Transforme disciplina em recompensas reais. Ganhe XP ao concluir atividades, suba de nível e mantenha seu streak aceso para celebrar cada dia de consistência.",
    icon: Flame,
    accent: "from-orange-500/20 to-amber-500/10 border-orange-400/30 text-orange-300",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)] mb-4">
          <Sparkles className="h-3.5 w-3.5" />
          Ecossistema Nexgen
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">Sobre o Nexgen Tasks</h1>
        <p className="text-[var(--subText)] text-base sm:text-lg leading-relaxed max-w-3xl">
          O <strong className="text-[var(--text)]">Nexgen Tasks</strong> é um ecossistema inteligente de
          produtividade pessoal focado em <strong className="text-[var(--text)]">consistência de longo prazo</strong>,{" "}
          <strong className="text-[var(--text)]">evolução contínua</strong> e{" "}
          <strong className="text-[var(--text)]">gerenciamento dinâmico do tempo</strong>. Mais do que uma lista de
          tarefas, ele conecta o que você precisa fazer hoje com a rotina que sustenta amanhã e os objetivos que
          constroem o seu futuro.
        </p>
      </div>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-[var(--text)] mb-2">Nossa proposta</h2>
        <div className="bg-[var(--bgcard)] rounded-2xl p-6 sm:p-8 shadow-md border border-[var(--subbackground)]">
          <p className="text-[var(--subText)] leading-relaxed">
            Acreditamos que produtividade sustentável nasce da combinação entre foco imediato, rotina estável e visão
            estratégica. Por isso, o Nexgen Tasks integra tarefas diárias, agenda semanal, backlog de longo prazo e
            gamificação em um único fluxo — para que cada ação concluída gere progresso visível, motivação e clareza
            sobre o seu caminho.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[var(--text)] mb-5">Os pilares do ecossistema</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className={`rounded-2xl border bg-gradient-to-br p-5 sm:p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg ${pillar.accent}`}
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-80">{pillar.subtitle}</p>
                  <h3 className="text-lg font-bold text-[var(--text)]">{pillar.title}</h3>
                </div>
                <div className="rounded-2xl bg-[var(--bgcard)]/60 p-3">
                  <pillar.icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[var(--subText)]">{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-[var(--subbackground)] bg-[var(--bgcard)] p-6 shadow-md">
        <h2 className="text-lg font-bold text-[var(--text)] mb-3">Construído com tecnologia moderna</h2>
        <ul className="grid gap-2 text-sm text-[var(--subText)] sm:grid-cols-2">
          <li>Next.js 16 + TypeScript</li>
          <li>Prisma + PostgreSQL</li>
          <li>NextAuth.js (Google + Email/Senha)</li>
          <li>Tailwind CSS + Framer Motion</li>
          <li>Drag & Drop com dnd-kit</li>
          <li>Notificações push inteligentes</li>
        </ul>
      </section>
    </div>
  );
}
