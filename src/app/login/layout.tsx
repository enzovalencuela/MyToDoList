import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entrar",
  description:
    "Faça login no Nexgen Tasks com email/senha ou Google. Acesse suas tarefas organizadas por prioridade, prazo e calendário.",
  openGraph: {
    title: "Entrar | Nexgen Tasks",
    description: "Faça login e organize suas tarefas com o Nexgen Tasks.",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
