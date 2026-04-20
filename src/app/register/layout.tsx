import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar Conta",
  description:
    "Crie sua conta gratuita no Nexgen Tasks. Gerencie tarefas com prioridades, prazos, drag-and-drop e calendário integrado.",
  openGraph: {
    title: "Criar Conta | Nexgen Tasks",
    description: "Crie sua conta gratuita e comece a organizar suas tarefas.",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
