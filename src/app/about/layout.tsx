import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça o Nexgen Tasks: ecossistema de produtividade com Tarefas, Agenda, Backlog e gamificação por Streaks e XP.",
  openGraph: {
    title: "Sobre | Nexgen Tasks",
    description:
      "Ecossistema inteligente de produtividade pessoal com foco diário, rotina consistente e evolução gamificada.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
