"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "Como criar uma tarefa?", a: "Clique no botão \"+\" no canto inferior direito e preencha os campos do formulário." },
  { q: "Como marcar uma tarefa como concluída?", a: "Clique no checkbox à esquerda do título da tarefa." },
  { q: "Como editar uma tarefa?", a: "Expanda a tarefa clicando na seta e depois clique em \"Editar\"." },
  { q: "Como reordenar tarefas?", a: "Arraste a tarefa pelo ícone de grip (≡) à esquerda para a posição desejada." },
  { q: "Como deletar todas as concluídas?", a: "Na seção \"Concluídas\", clique no botão \"Deletar Todas\"." },
  { q: "Como buscar tarefas?", a: "Use a barra de busca no topo do dashboard para filtrar por título ou descrição." },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline">
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>
      <h1 className="text-3xl font-bold gradient-text mb-8">Ajuda</h1>

      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-[var(--bgcard)] rounded-xl shadow-md overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-semibold text-[var(--text)]">{faq.q}</span>
              <ChevronRight
                className={`w-5 h-5 text-[var(--subText)] transition-transform ${openIndex === i ? "rotate-90" : ""}`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-[var(--subText)]">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
