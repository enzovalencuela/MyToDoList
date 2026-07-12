import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import type { RecommendationResponse } from "@/lib/recommendation";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

export const runtime = "nodejs";

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDateOnly(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

function stripJsonFence(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeRecommendation(data: unknown): RecommendationResponse {
  if (!data || typeof data !== "object") {
    throw new Error("Resposta invalida da IA");
  }

  const payload = data as Record<string, unknown>;
  const saudacao =
    typeof payload.saudacao === "string" && payload.saudacao.trim()
      ? payload.saudacao.trim()
      : "Aqui vai um proximo passo inteligente para hoje.";
  const recomendacoes = Array.isArray(payload.recomendacoes)
    ? payload.recomendacoes
        .map((item) => {
          if (!item || typeof item !== "object") return null;

          const recommendation = item as Record<string, unknown>;
          const titulo =
            typeof recommendation.titulo === "string"
              ? recommendation.titulo.trim()
              : "";
          const motivo =
            typeof recommendation.motivo === "string"
              ? recommendation.motivo.trim()
              : "";
          const tempoEstimado =
            typeof recommendation.tempoEstimado === "string"
              ? recommendation.tempoEstimado.trim()
              : "";

          if (!titulo || !motivo || !tempoEstimado) return null;

          return { titulo, motivo, tempoEstimado };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .slice(0, 3)
    : [];

  return {
    saudacao,
    recomendacoes,
  };
}

export async function GET() {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY nao configurada" },
      { status: 500 },
    );
  }

  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const todayDate = createDateOnly(todayKey);
  const dayOfWeek = today.getDay();

  const [tasksToday, weeklyTasksToday, activeBacklogGoals, userProfile] =
    await Promise.all([
      prisma.tarefa.findMany({
        where: {
          id_usuario: userId,
          data_prazo: todayDate,
          estado_tarefa: { not: "Finalizada" },
        },
        orderBy: [{ prioridade: "asc" }, { ordem: "asc" }],
        select: {
          titulo: true,
          descricao: true,
          prioridade: true,
          estado_tarefa: true,
        },
      }),
      prisma.weeklyTask.findMany({
        where: {
          userId,
          dayOfWeek,
        },
        orderBy: [{ startTime: "asc" }],
        select: {
          title: true,
          startTime: true,
          endTime: true,
          category: true,
        },
      }),
      prisma.backlogGoal.findMany({
        where: {
          userId,
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: {
          title: true,
          description: true,
          category: true,
          status: true,
          priority: true,
        },
      }),
      prisma.usuario.findUnique({
        where: { id_usuario: userId },
        select: { advancedAiUses: true },
      }),
    ]);

  const advancedAnalysisEnabled = (userProfile?.advancedAiUses ?? 0) > 0;

  const prompt = `
Voce e um Mentor de Produtividade do Nexgen Tasks.
Analise o dia do usuario e recomende 2 a 3 acoes concretas.

Regras obrigatorias:
- Use estritamente itens presentes em "tarefasPendentesHoje" ou "objetivosAtivosBacklog".
- Nao invente cursos, projetos, tarefas ou tecnologias fora do contexto.
- Considere a rotina fixa para identificar blocos ocupados e possiveis espacos vagos.
- Seja especifico, pratico e curto.
- ${advancedAnalysisEnabled ? "Mapeie o backlog com mais profundidade e priorize o que mais impacta o dia de hoje." : "Foque nas tarefas e metas mais imediatas."}
- Responda apenas JSON valido, sem markdown, sem crases e sem texto extra.

Formato exato:
{
  "saudacao": "Uma frase motivacional curta baseada no momento do dia",
  "recomendacoes": [
    { "titulo": "O que fazer", "motivo": "Por que focar nisso agora", "tempoEstimado": "Ex: 45 min" }
  ]
}

Contexto:
${JSON.stringify(
  {
    dataAtual: todayKey,
    horaAtual: today.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    tarefasPendentesHoje: tasksToday,
    rotinaFixaHoje: weeklyTasksToday,
    objetivosAtivosBacklog: activeBacklogGoals,
  },
  null,
  2,
)}
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(stripJsonFence(text)) as unknown;

    return NextResponse.json(normalizeRecommendation(parsed));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel gerar recomendacoes agora",
      },
      { status: 500 },
    );
  }
}
