"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  label: string;
  emoji: string;
  items: FaqItem[];
};

const faqCategories: FaqCategory[] = [
  {
    id: "agenda",
    label: "Agenda Fixa",
    emoji: "📅",
    items: [
      {
        id: "agenda-blocks",
        question: "Como funcionam os blocos de tempo?",
        answer:
          "A agenda serve para fixar sua rotina semanal. Você define seus horários de estudo ou trabalho e recebe notificações inteligentes minutos antes de cada bloco iniciar para não perder o foco.",
      },
      {
        id: "agenda-sync",
        question: "Posso vincular blocos da agenda às tarefas?",
        answer:
          "Sim. Ao criar ou editar um bloco, você pode ativar a opção de exibir na lista de tarefas. Assim, cada ocorrência do bloco aparece no dashboard e pode ser concluída como uma tarefa normal.",
      },
    ],
  },
  {
    id: "backlog",
    label: "Meu Backlog",
    emoji: "📦",
    items: [
      {
        id: "backlog-content",
        question: "O que devo colocar no Backlog?",
        answer:
          "Ideias, cursos e tecnologias que você quer aprender no longo prazo. Conforme você avança, basta arrastar o objetivo (Drag and Drop) entre as colunas 'Não Iniciado', 'Em Andamento' e 'Concluído'.",
      },
      {
        id: "backlog-categories",
        question: "Quais categorias posso usar?",
        answer:
          "O Backlog organiza objetivos por tipo — como Cursos, Projetos e Stacks — para você visualizar com clareza o que está amadurecendo e priorizar o que merece entrar em andamento.",
      },
    ],
  },
  {
    id: "gamification",
    label: "Streaks, Nível e XP",
    emoji: "🔥",
    items: [
      {
        id: "xp-level",
        question: "Como eu ganho XP e subo de nível?",
        answer:
          "Cada tarefa concluída ou bloco da agenda cumprido concede +10 XP. Ao acumular pontos, você sobe de nível automaticamente no seu painel — acompanhe o progresso na barra ao lado do seu perfil na Sidebar.",
      },
      {
        id: "streak",
        question: "Como funciona o contador de dias seguidos (Streak)?",
        answer:
          'Ao concluir pelo menos uma atividade no dia, o seu "foguinho" (🔥) se mantém aceso e acumula +1 dia de consistência. Se você passar um dia inteiro sem concluir nada, o contador reseta para manter seu compromisso real com a rotina.',
      },
    ],
  },
  {
    id: "tasks",
    label: "Tarefas do Dia",
    emoji: "✅",
    items: [
      {
        id: "create-task",
        question: "Como criar uma tarefa?",
        answer: 'Clique no botão "+" no canto inferior direito do dashboard e preencha os campos do formulário.',
      },
      {
        id: "complete-task",
        question: "Como marcar uma tarefa como concluída?",
        answer: "Clique no checkbox à esquerda do título da tarefa. Ao concluir, você ganha XP e atualiza seu streak.",
      },
      {
        id: "edit-task",
        question: "Como editar uma tarefa?",
        answer: 'Expanda a tarefa clicando na seta e depois clique em "Editar".',
      },
      {
        id: "reorder-task",
        question: "Como reordenar tarefas?",
        answer: "Arraste a tarefa pelo ícone de grip (≡) à esquerda para a posição desejada.",
      },
      {
        id: "search-task",
        question: "Como buscar tarefas?",
        answer: "Use a barra de busca no topo do dashboard para filtrar por título ou descrição.",
      },
      {
        id: "delete-completed",
        question: 'Como deletar todas as concluídas?',
        answer: 'Na seção "Concluídas", clique no botão "Deletar Todas".',
      },
    ],
  },
];

function FaqAccordion({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--subbackground)] bg-[var(--bgcard)] shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[var(--subbackground)]/40"
      >
        <span className="font-semibold text-[var(--text)]">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--subText)] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-200 ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-4 text-sm leading-relaxed text-[var(--subText)]">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-6 gradient-text font-bold hover:underline"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-3">Ajuda</h1>
        <p className="text-[var(--subText)] leading-relaxed">
          Encontre respostas sobre Agenda, Backlog, Streaks, XP e o fluxo diário de tarefas do Nexgen Tasks.
        </p>
      </div>

      <div className="space-y-8">
        {faqCategories.map((category) => (
          <section key={category.id}>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--text)]">
              <span aria-hidden="true">{category.emoji}</span>
              {category.label}
            </h2>
            <div className="space-y-2">
              {category.items.map((item) => (
                <FaqAccordion
                  key={item.id}
                  item={item}
                  isOpen={openId === item.id}
                  onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
