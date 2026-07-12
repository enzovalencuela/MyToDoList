"use client";

import { useState } from "react";
import { BrainCircuit, Clock3, RefreshCw, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import type { RecommendationResponse } from "@/lib/recommendation";

const RECOMMENDATION_CACHE_KEY = "@nexgen-tasks:last-recommendation";

interface AiRecommendationModalProps {
  onClose: () => void;
  canUseAi: boolean;
  purchasedAiQueries: number;
  onQuotaUpdated: () => Promise<void> | void;
}

interface CachedRecommendation {
  generatedAt: string;
  dateKey: string;
  data: RecommendationResponse;
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isRecommendationResponse(
  value: unknown,
): value is RecommendationResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.saudacao === "string" && Array.isArray(payload.recomendacoes)
  );
}

function parseCachedRecommendation(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<CachedRecommendation>;

    if (
      typeof parsed.generatedAt !== "string" ||
      typeof parsed.dateKey !== "string" ||
      !isRecommendationResponse(parsed.data)
    ) {
      return null;
    }

    return parsed as CachedRecommendation;
  } catch {
    return null;
  }
}

function formatGeneratedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `Gerado hoje as ${date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getValidCachedRecommendation() {
  if (typeof window === "undefined") {
    return null;
  }

  const cachedRecommendation = parseCachedRecommendation(
    window.localStorage.getItem(RECOMMENDATION_CACHE_KEY),
  );

  if (!cachedRecommendation) {
    return null;
  }

  const todayKey = getLocalDateKey(new Date());

  if (cachedRecommendation.dateKey !== todayKey) {
    window.localStorage.removeItem(RECOMMENDATION_CACHE_KEY);
    return null;
  }

  return cachedRecommendation;
}

export default function AiRecommendationModal({
  onClose,
  canUseAi,
  purchasedAiQueries,
  onQuotaUpdated,
}: AiRecommendationModalProps) {
  const [cachedRecommendation] = useState(getValidCachedRecommendation);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] =
    useState<RecommendationResponse | null>(cachedRecommendation?.data ?? null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(
    cachedRecommendation?.generatedAt ?? null,
  );

  async function fetchRecommendation() {
    if (!canUseAi) {
      toast.error(
        "Você já usou a consulta gratuita de hoje e não possui consultas extras.",
      );
      return;
    }

    setLoading(true);
    setRecommendation(null);
    setGeneratedAt(null);

    const response = await fetch("/api/recommendation");
    const result = (await response.json()) as RecommendationResponse & {
      error?: string;
    };

    setLoading(false);

    if (!response.ok) {
      toast.error(result.error ?? "Nao foi possivel consultar a IA.");
      await onQuotaUpdated();
      return;
    }

    const now = new Date();
    const cachePayload: CachedRecommendation = {
      generatedAt: now.toISOString(),
      dateKey: getLocalDateKey(now),
      data: result,
    };

    window.localStorage.setItem(
      RECOMMENDATION_CACHE_KEY,
      JSON.stringify(cachePayload),
    );
    setRecommendation(result);
    setGeneratedAt(cachePayload.generatedAt);
    await onQuotaUpdated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-white/30 bg-[var(--bgcard)] shadow-2xl">
        <div className="border-b border-[var(--subbackground)] bg-gradient-to-r from-[var(--background-2)] to-[var(--bgcard)] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--subText)]">
                  Assistente de IA
                </p>
                <h2 className="mt-2 text-2xl font-bold text-[var(--text)]">
                  O que fazer agora?
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[var(--subText)] transition hover:bg-[var(--subbackground)] hover:text-[var(--text)]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {!loading && !recommendation && (
            <div className="rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] px-5 py-8 text-center">
              <BrainCircuit className="mx-auto h-12 w-12 text-[var(--primary)]" />
              <h3 className="mt-4 text-xl font-bold text-[var(--text)]">
                Recomendar proximo foco
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--subText)]">
                A IA vai olhar suas tarefas de hoje, sua agenda fixa e seu
                backlog ativo.
              </p>
              <div className="mt-4 inline-flex rounded-full border border-[var(--subbackground)] bg-[var(--background)] px-3 py-1.5 text-sm font-semibold text-[var(--text)]">
                {purchasedAiQueries > 0
                  ? `${purchasedAiQueries} consulta${purchasedAiQueries > 1 ? "s" : ""} extra${purchasedAiQueries > 1 ? "s" : ""} disponível${purchasedAiQueries > 1 ? "is" : ""}`
                  : "1 consulta gratuita disponível hoje"}
              </div>
              <button
                onClick={fetchRecommendation}
                disabled={!canUseAi}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-4 w-4" /> Gerar recomendacao
              </button>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] p-5">
                <div className="h-4 w-40 animate-pulse rounded-full bg-[var(--subbackground)]" />
                <div className="mt-3 h-8 w-3/4 animate-pulse rounded-full bg-[var(--subbackground)]" />
              </div>
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] p-5"
                >
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-[var(--subbackground)]" />
                  <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-[var(--subbackground)]" />
                  <div className="mt-2 h-3 w-5/6 animate-pulse rounded-full bg-[var(--subbackground)]" />
                </div>
              ))}
            </div>
          )}

          {recommendation && (
            <div>
              <div className="rounded-3xl border border-[var(--primary)]/20 bg-[var(--primary)]/10 p-5">
                {generatedAt && (
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--subText)]">
                    {formatGeneratedAt(generatedAt)}
                  </p>
                )}
                <p className="text-sm font-semibold leading-6 text-[var(--text)]">
                  {recommendation.saudacao}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {recommendation.recomendacoes.length === 0 ? (
                  <div className="rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] p-6 text-center text-sm text-[var(--subText)]">
                    Nao encontrei uma recomendacao clara com os dados de hoje.
                  </div>
                ) : (
                  recommendation.recomendacoes.map((item, index) => (
                    <article
                      key={`${item.titulo}-${index}`}
                      className="rounded-3xl border border-[var(--subbackground)] bg-[var(--background)] p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="break-words text-base font-bold leading-6 text-[var(--text)]">
                            {item.titulo}
                          </h3>
                          <p className="mt-2 break-words text-sm leading-6 text-[var(--subText)]">
                            {item.motivo}
                          </p>
                        </div>
                        <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-[var(--subbackground)] px-3 py-1 text-xs font-bold text-[var(--text)]">
                          <Clock3 className="h-3.5 w-3.5" />
                          {item.tempoEstimado}
                        </span>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <button
                onClick={fetchRecommendation}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--subbackground)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:-translate-y-0.5"
              >
                <RefreshCw className="h-4 w-4" /> Atualizar recomendacoes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
