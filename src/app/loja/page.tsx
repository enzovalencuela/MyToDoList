"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Coins, Shield, Sparkles, Star } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SHOP_ITEM_COST = 500;

interface UserShopState {
  xpPoints: number;
  streakShields: number;
  level: number;
  xpMultiplierExpiresAt: string | null;
  unlockedThemes: string[];
  currentTheme: string | null;
}

async function fetchShopState() {
  const res = await fetch("/api/gamification");
  if (!res.ok) {
    throw new Error("Falha ao carregar o saldo de XP");
  }
  const data = await res.json();
  return {
    xpPoints: Number(data.xpPoints ?? 0),
    streakShields: Number(data.streakShields ?? 0),
    level: Number(data.level ?? 1),
    xpMultiplierExpiresAt: data.xpMultiplierExpiresAt ?? null,
    unlockedThemes: Array.isArray(data.unlockedThemes)
      ? data.unlockedThemes
      : [],
    currentTheme: data.currentTheme ?? null,
  } as UserShopState;
}

async function buyShieldAction() {
  const res = await fetch("/api/loja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item: "streak-shield" }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Não foi possível concluir a compra");
  }

  return data as {
    success: true;
    item: string;
    xpPoints: number;
    streakShields: number;
  };
}

async function buyXpMultiplierAction() {
  const res = await fetch("/api/loja/buy-xp-multiplier", {
    method: "POST",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Não foi possível ativar o multiplicador");
  }

  return data as {
    success: true;
    xpPoints: number;
    level: number;
    xpMultiplierExpiresAt: string | null;
  };
}

async function buyThemeAction(theme: string) {
  const res = await fetch("/api/loja/buy-theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Não foi possível comprar o tema");
  }

  return data as {
    success: true;
    xpPoints: number;
    unlockedThemes: string[];
    currentTheme: string | null;
  };
}

async function selectThemeAction(theme: string) {
  const res = await fetch("/api/loja/select-theme", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ theme }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Não foi possível equipar o tema");
  }

  return data as { success: true; currentTheme: string | null };
}

export default function LojaPage() {
  const router = useRouter();
  const [state, setState] = useState<UserShopState>({
    xpPoints: 0,
    streakShields: 0,
    level: 1,
    xpMultiplierExpiresAt: null,
    unlockedThemes: [],
    currentTheme: null,
  });
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyingMultiplier, setBuyingMultiplier] = useState(false);
  const [buyingTheme, setBuyingTheme] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const shopState = await fetchShopState();
        setState(shopState);
      } catch {
        toast.error("Não foi possível carregar a loja");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleBuyShield() {
    if (state.xpPoints < SHOP_ITEM_COST) {
      toast.error("Você não tem XP suficiente para este item");
      return;
    }

    setBuying(true);

    try {
      const result = await buyShieldAction();
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints,
        streakShields: result.streakShields,
      }));
      toast.success("Escudo de Streak comprado com sucesso!");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao comprar item",
      );
    } finally {
      setBuying(false);
    }
  }

  async function handleBuyXpMultiplier() {
    if (state.level < 2) {
      toast.error("O multiplicador desbloqueia a partir do nível 2");
      return;
    }

    setBuyingMultiplier(true);
    try {
      const result = await buyXpMultiplierAction();
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints,
        level: result.level,
        xpMultiplierExpiresAt: result.xpMultiplierExpiresAt,
      }));
      toast.success("Multiplicador de XP ativado por 24 horas");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao ativar multiplicador",
      );
    } finally {
      setBuyingMultiplier(false);
    }
  }

  async function handleBuyTheme() {
    if (state.unlockedThemes.includes("emerald")) {
      const result = await selectThemeAction("emerald");
      setState((prev) => ({ ...prev, currentTheme: result.currentTheme }));
      toast.success("Tema Esmeralda equipado");
      return;
    }

    setBuyingTheme(true);
    try {
      const result = await buyThemeAction("emerald");
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints,
        unlockedThemes: result.unlockedThemes,
        currentTheme: result.currentTheme,
      }));
      toast.success("Tema Esmeralda comprado e equipado");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao comprar tema",
      );
    } finally {
      setBuyingTheme(false);
    }
  }

  const isXpMultiplierActive = Boolean(
    state.xpMultiplierExpiresAt &&
    new Date(state.xpMultiplierExpiresAt) > new Date(),
  );
  const hasUnlockedTheme = state.unlockedThemes.includes("emerald");
  const isThemeActive = state.currentTheme === "emerald";

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] transition hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para o painel
        </Link>

        <header className="rounded-[28px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--subbackground)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                <Coins className="h-4 w-4" />
                Loja de XP
              </div>
              <h1 className="mt-3 text-3xl font-black sm:text-4xl">
                Troque disciplina por proteção
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[var(--subText)] sm:text-base">
                Use seus pontos para fortalecer sua consistência e proteger sua
                streak em dias difíceis.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--subbackground)] bg-[var(--background)] px-4 py-4">
              <p className="text-sm text-[var(--subText)]">Saldo atual</p>
              <p className="mt-1 text-2xl font-black text-[var(--text)]">
                {loading ? "—" : state.xpPoints} XP
              </p>
              <p className="mt-2 text-sm text-[var(--subText)]">
                🛡️ {loading ? "—" : state.streakShields} escudos armazenados
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                <Shield className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-[var(--subbackground)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--subText)]">
                Destaque
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text)]">
              Escudo de Streak
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--subText)]">
              Proteja sua sequência de dias quando você perder uma atividade. O
              escudo evita a quebra da streak e marca o dia como protegido no
              calendário.
            </p>
            <div className="mt-4 rounded-2xl bg-[var(--subbackground)] p-3 text-sm text-[var(--subText)]">
              <p>Funciona automaticamente no próximo ciclo diário.</p>
            </div>
            <button
              onClick={handleBuyShield}
              disabled={buying || loading || state.xpPoints < SHOP_ITEM_COST}
              className="mt-5 w-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buying ? "Comprando..." : `Comprar por ${SHOP_ITEM_COST} XP`}
            </button>
          </article>

          <article
            className={`rounded-[24px] border p-5 shadow-sm ${isThemeActive ? "border-emerald-400/60 bg-emerald-500/10" : "border-[var(--subbackground)] bg-[var(--bgcard)]"}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`rounded-2xl p-3 ${isThemeActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[var(--subbackground)] text-[var(--subText)]"}`}
              >
                <Sparkles className="h-6 w-6" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isThemeActive ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}
              >
                {hasUnlockedTheme
                  ? isThemeActive
                    ? "Equipado"
                    : "Comprado"
                  : "Disponível"}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text)]">
              Tema Esmeralda
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--subText)]">
              Troque os detalhes azuis por um visual neon verde para destacar
              seu painel e suas ações principais.
            </p>
            <div className="mt-4 rounded-2xl bg-[var(--subbackground)] p-3 text-sm text-[var(--subText)]">
              <p>Preço: 1000 XP • Compra única e equipável.</p>
            </div>
            <button
              onClick={handleBuyTheme}
              disabled={buyingTheme || loading || state.xpPoints < 1000}
              className={`mt-5 w-full rounded-full px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${isThemeActive ? "bg-emerald-500" : "bg-gradient-to-r from-emerald-500 to-lime-500"}`}
            >
              {buyingTheme
                ? "Processando..."
                : hasUnlockedTheme
                  ? isThemeActive
                    ? "Equipado"
                    : "Equipar Tema"
                  : "Comprar por 1000 XP"}
            </button>
          </article>

          <article
            className={`rounded-[24px] border p-5 shadow-sm ${isXpMultiplierActive ? "border-amber-400/60 bg-amber-500/10" : "border-[var(--subbackground)] bg-[var(--bgcard)]"}`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`rounded-2xl p-3 ${isXpMultiplierActive ? "bg-amber-500/20 text-amber-400" : "bg-[var(--subbackground)] text-[var(--subText)]"}`}
              >
                <Star className="h-6 w-6" />
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isXpMultiplierActive ? "bg-amber-500/20 text-amber-400" : state.level >= 2 ? "bg-sky-500/10 text-sky-500" : "bg-slate-500/10 text-slate-400"}`}
              >
                {isXpMultiplierActive
                  ? "Ativo"
                  : state.level >= 2
                    ? "Disponível"
                    : "Bloqueado"}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text)]">
              Multiplicador XP
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--subText)]">
              Dobre a recompensa padrão de cada tarefa concluída por 24 horas.
            </p>
            <div className="mt-4 rounded-2xl bg-[var(--subbackground)] p-3 text-sm text-[var(--subText)]">
              <p>Preço: 300 XP • Requer nível 2.</p>
              {isXpMultiplierActive && (
                <p className="mt-1 text-amber-400">
                  Ativo até{" "}
                  {new Date(state.xpMultiplierExpiresAt!).toLocaleString(
                    "pt-BR",
                  )}
                </p>
              )}
            </div>
            <button
              onClick={handleBuyXpMultiplier}
              disabled={
                buyingMultiplier ||
                loading ||
                state.level < 2 ||
                state.xpPoints < 300
              }
              className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buyingMultiplier ? "Ativando..." : "Comprar por 300 XP"}
            </button>
          </article>
        </section>
      </div>
    </div>
  );
}
