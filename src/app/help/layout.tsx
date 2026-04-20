import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ajuda",
  description:
    "Perguntas frequentes sobre o Nexgen Tasks. Aprenda a criar, editar, reordenar e filtrar tarefas no gerenciador.",
  openGraph: {
    title: "Ajuda | Nexgen Tasks",
    description: "FAQ e dicas de como usar o Nexgen Tasks.",
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
