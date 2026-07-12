import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajuda",
  description:
    "FAQ do Nexgen Tasks: Agenda fixa, Backlog com Drag and Drop, Streaks, XP e gerenciamento de tarefas.",
  openGraph: {
    title: "Ajuda | Nexgen Tasks",
    description: "Perguntas frequentes sobre Agenda, Backlog, gamificação e tarefas do dia.",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
