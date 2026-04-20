import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça o Nexgen Tasks, gerenciador de tarefas construído com Next.js, Prisma, PostgreSQL e Tailwind CSS. Moderno, rápido e gratuito.",
  openGraph: {
    title: "Sobre | Nexgen Tasks",
    description: "Conheça o Nexgen Tasks e as tecnologias por trás da plataforma.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
