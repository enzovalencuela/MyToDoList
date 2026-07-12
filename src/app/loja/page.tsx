"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  Eye,
  Menu,
  Shield,
  Snowflake,
  Sparkles,
  Star,
  User,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  equipTheme,
  purchaseAdvancedAi,
  purchaseStreakFreeze,
  purchaseTheme,
} from "./actions";
import NexgenLogo from "@/components/NexgenLogo";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";

const SHOP_ITEM_COST = 500;

type ThemeKey = "default" | "emerald" | "cyberpunk" | "dracula";

interface UserShopState {
  xpPoints: number;
  streakShields: number;
  level: number;
  streakFrozenUntil: string | null;
  xpMultiplierExpiresAt: string | null;
  unlockedThemes: string[];
  currentTheme: string | null;
  purchasedAiQueries: number;
  isAdmin?: boolean;
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
    streakFrozenUntil: data.streakFrozenUntil ?? null,
    xpMultiplierExpiresAt: data.xpMultiplierExpiresAt ?? null,
    unlockedThemes: Array.isArray(data.unlockedThemes)
      ? data.unlockedThemes
      : [],
    currentTheme: data.currentTheme ?? null,
    purchasedAiQueries: Number(
      data.purchasedAiQueries ?? data.advancedAiUses ?? 0,
    ),
    isAdmin: Boolean(data.isAdmin ?? false),
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

export default function LojaPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [state, setState] = useState<UserShopState>({
    xpPoints: 0,
    streakShields: 0,
    level: 1,
    streakFrozenUntil: null,
    xpMultiplierExpiresAt: null,
    unlockedThemes: [],
    currentTheme: null,
    purchasedAiQueries: 0,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [buyingMultiplier, setBuyingMultiplier] = useState(false);
  const [buyingTheme, setBuyingTheme] = useState(false);
  const [buyingFreeze, setBuyingFreeze] = useState(false);
  const [buyingAdvancedAi, setBuyingAdvancedAi] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeKey | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { data: session } = useSession();

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

  const isXpMultiplierActive = useMemo(() => {
    return Boolean(
      state.xpMultiplierExpiresAt &&
      new Date(state.xpMultiplierExpiresAt) > new Date(),
    );
  }, [state.xpMultiplierExpiresAt]);

  const isStreakFrozen = useMemo(() => {
    return Boolean(
      state.streakFrozenUntil && new Date(state.streakFrozenUntil) > new Date(),
    );
  }, [state.streakFrozenUntil]);

  const previewThemeClass = previewTheme ? `theme-${previewTheme}` : "";

  async function handleBuyShield() {
    if (!state.isAdmin && state.xpPoints < SHOP_ITEM_COST) {
      toast.error("Você não tem XP suficiente para este item");
      return;
    }

    setBuying(true);
    try {
      const result = await buyShieldAction();
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints ?? prev.xpPoints,
        streakShields: result.streakShields ?? prev.streakShields,
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
        xpPoints: result.xpPoints ?? prev.xpPoints,
        level: result.level ?? prev.level,
        xpMultiplierExpiresAt:
          result.xpMultiplierExpiresAt ?? prev.xpMultiplierExpiresAt,
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

  async function handleBuyTheme(theme: ThemeKey) {
    if (state.unlockedThemes.includes(theme)) {
      const result = await equipTheme(theme);
      if (!result.success) {
        toast.error(result.error ?? "Erro ao equipar tema");
        return;
      }

      setState((prev) => ({
        ...prev,
        currentTheme: result.currentTheme ?? prev.currentTheme,
      }));
      setTheme(theme === "default" ? "light" : theme);
      toast.success(`Tema ${themeLabel(theme)} equipado`);
      return;
    }

    setBuyingTheme(true);
    try {
      const result = await purchaseTheme(theme);
      if (!result.success) {
        throw new Error(result.error);
      }

      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints ?? prev.xpPoints,
        unlockedThemes: result.unlockedThemes ?? prev.unlockedThemes,
        currentTheme: result.currentTheme ?? prev.currentTheme,
      }));
      setTheme(theme === "default" ? "light" : theme);
      toast.success(`Tema ${themeLabel(theme)} comprado e equipado`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao comprar tema",
      );
    } finally {
      setBuyingTheme(false);
    }
  }

  async function handleBuyFreeze() {
    setBuyingFreeze(true);
    try {
      const result = await purchaseStreakFreeze();
      if (!result.success) {
        throw new Error(result.error);
      }
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints ?? prev.xpPoints,
        streakFrozenUntil: result.streakFrozenUntil
          ? new Date(result.streakFrozenUntil).toISOString()
          : null,
      }));
      toast.success("Congelador de Streak ativado por 7 dias");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao ativar congelador",
      );
    } finally {
      setBuyingFreeze(false);
    }
  }

  async function handleBuyAdvancedAi() {
    setBuyingAdvancedAi(true);
    try {
      const result = await purchaseAdvancedAi();
      if (!result.success) {
        throw new Error(result.error);
      }
      setState((prev) => ({
        ...prev,
        xpPoints: result.xpPoints ?? prev.xpPoints,
        purchasedAiQueries:
          result.purchasedAiQueries ?? prev.purchasedAiQueries,
      }));
      toast.success("Análise Avançada da IA liberada");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao adquirir análise avançada",
      );
    } finally {
      setBuyingAdvancedAi(false);
    }
  }

  return (
    <>
      {previewThemeClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div
            className={`w-full max-w-3xl rounded-[28px] border border-white/20 bg-(--bgcard) p-5 shadow-2xl ${previewThemeClass}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--subText)">
                  Preview
                </p>
                <h3 className="mt-2 text-xl font-bold text-(--text)">
                  {themeLabel(previewTheme)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="rounded-full p-2 text-(--subText) transition hover:bg-(--subbackground) hover:text-(--text)"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="rounded-3xl border border-(--subbackground) bg-(--background) p-4">
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded-full bg-(--primary)/40" />
                  <div className="h-3 w-24 rounded-full bg-(--secondary)/40" />
                  <div className="h-3 w-20 rounded-full bg-(--subbackground)" />
                  <div className="h-3 w-28 rounded-full bg-(--subbackground)" />
                </div>
                <div className="mt-4 rounded-2xl bg-(--bgcard) p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-(--primary)" />
                    <div className="h-3 flex-1 rounded-full bg-(--subbackground)" />
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-(--subbackground) bg-(--background) p-4">
                <div className="flex items-center justify-between rounded-2xl border border-(--subbackground) bg-(--bgcard) px-3 py-2">
                  <div className="h-3 w-24 rounded-full bg-(--subbackground)" />
                  <div className="h-8 w-8 rounded-full bg-(--primary)" />
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-(--subbackground) bg-(--bgcard) p-4">
                    <div className="h-3 w-24 rounded-full bg-(--subbackground)" />
                    <div className="mt-3 h-20 rounded-2xl bg-(--background-2)" />
                  </div>
                  <div className="rounded-2xl border border-(--subbackground) bg-(--bgcard) p-4">
                    <div className="h-3 w-24 rounded-full bg-(--subbackground)" />
                    <div className="mt-3 h-20 rounded-2xl bg-(--primary)/10" />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewTheme(null)}
                className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-white"
              >
                Fechar preview
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[var(--background)]">
        <ToastContainer
          position="bottom-left"
          autoClose={3000}
          theme="colored"
        />

        <header className="sticky top-0 z-20 border-b border-[var(--subbackground)]/60 bg-[var(--background)]/88 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <NexgenLogo className="h-8 w-8" />
              <div>
                <h1 className="truncate text-lg font-bold text-[var(--text)]">
                  Agenda Semanal
                </h1>
                <p className="text-xs text-[var(--subText)]">
                  Blocos fixos da sua rotina
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm text-[var(--subText)] sm:flex">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-5 w-5" />
                )}
                <span>
                  {session?.user?.name || session?.user?.email?.split("@")[0]}
                </span>
                {state.isAdmin && (
                  <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                    ADMIN
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowSidebar(true)}
                className="rounded-full p-2 transition hover:bg-[var(--subbackground)]"
              >
                <Menu className="h-6 w-6 text-[var(--text)]" />
              </button>
            </div>
          </div>
        </header>

        <Sidebar isOpen={showSidebar} onClose={() => setShowSidebar(false)} />
        <main className="mx-auto flex flex-col gap-6 max-w-[1600px] px-4 py-6 lg:ml-[290px] lg:px-8 lg:py-8">
          <section className="grid gap-4 lg:grid-cols-3">
            <article className="rounded-3xl border border-(--subbackground) bg-(--bgcard) p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-(--subbackground) px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-(--subText)">
                  Destaque
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-(--text)">
                Escudo de Streak
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--subText)">
                Proteja sua sequência de dias quando você perder uma atividade.
                O escudo evita a quebra da streak e marca o dia como protegido
                no calendário.
              </p>
              <div className="mt-4 rounded-2xl bg-(--subbackground) p-3 text-sm text-(--subText)">
                <p>Funciona automaticamente no próximo ciclo diário.</p>
              </div>
              <button
                onClick={handleBuyShield}
                disabled={
                  buying ||
                  loading ||
                  (!state.isAdmin && state.xpPoints < SHOP_ITEM_COST)
                }
                className="mt-5 w-full rounded-full bg-gradient-to-r from-(--primary) to-(--secondary) px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buying
                  ? "Comprando..."
                  : state.isAdmin
                    ? `Resgatar (Admin)`
                    : `Comprar por ${SHOP_ITEM_COST} XP`}
              </button>
            </article>

            <article
              className={`rounded-3xl border p-5 shadow-sm ${isXpMultiplierActive ? "border-amber-400/60 bg-amber-500/10" : "border-(--subbackground) bg-(--bgcard)"}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-2xl p-3 ${isXpMultiplierActive ? "bg-amber-500/20 text-amber-400" : "bg-(--subbackground) text-(--subText)"}`}
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
              <h2 className="mt-4 text-xl font-bold text-(--text)">
                Multiplicador XP
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--subText)">
                Dobre a recompensa padrão de cada tarefa concluída por 24 horas.
              </p>
              <div className="mt-4 rounded-2xl bg-(--subbackground) p-3 text-sm text-(--subText)">
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
                  (!state.isAdmin && state.level < 2) ||
                  (!state.isAdmin && state.xpPoints < 300)
                }
                className="mt-5 w-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buyingMultiplier
                  ? "Ativando..."
                  : state.isAdmin
                    ? "Ativar (Admin)"
                    : "Comprar por 300 XP"}
              </button>
            </article>

            <article
              className={`rounded-3xl border p-5 shadow-sm ${isStreakFrozen ? "border-cyan-400/60 bg-cyan-500/10" : "border-(--subbackground) bg-(--bgcard)"}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-2xl p-3 ${isStreakFrozen ? "bg-cyan-500/20 text-cyan-400" : "bg-(--subbackground) text-(--subText)"}`}
                >
                  <Snowflake className="h-6 w-6" />
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${isStreakFrozen ? "bg-cyan-500/20 text-cyan-400" : "bg-slate-500/10 text-slate-400"}`}
                >
                  {isStreakFrozen ? "Ativo" : "Consumível"}
                </span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-(--text)">
                Congelador de Streak
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--subText)">
                Pause o reset da sua streak por 7 dias e viaje sem perder o
                progresso acumulado.
              </p>
              <div className="mt-4 rounded-2xl bg-(--subbackground) p-3 text-sm text-(--subText)">
                <p>
                  Preço: 800 XP • Ativa até{" "}
                  {isStreakFrozen
                    ? new Date(state.streakFrozenUntil!).toLocaleDateString(
                        "pt-BR",
                      )
                    : "uma data futura"}
                  .
                </p>
              </div>
              <button
                onClick={handleBuyFreeze}
                disabled={
                  buyingFreeze ||
                  loading ||
                  (!state.isAdmin && state.xpPoints < 800)
                }
                className="mt-5 w-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {buyingFreeze
                  ? "Ativando..."
                  : state.isAdmin
                    ? "Ativar (Admin)"
                    : "Comprar por 800 XP"}
              </button>
            </article>
          </section>

          <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {themeDefinitions.map((theme) => {
              const unlocked = state.unlockedThemes.includes(theme.key);
              const active =
                state.currentTheme === theme.key ||
                (!state.currentTheme && theme.key === "default");

              return (
                <article
                  key={theme.key}
                  className={`rounded-3xl border p-5 shadow-sm ${active ? "border-(--primary)/40 bg-(--primary)/10" : "border-(--subbackground) bg-(--bgcard)"}`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`rounded-2xl p-3 ${active ? "bg-(--primary)/20 text-(--primary)" : "bg-(--subbackground) text-(--subText)"}`}
                    >
                      {theme.icon}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${active ? "bg-(--primary)/20 text-(--primary)" : unlocked ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}
                    >
                      {active ? "Ativo" : unlocked ? "Comprado" : "Disponível"}
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-(--text)">
                    {theme.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-(--subText)">
                    {theme.description}
                  </p>
                  <div className="mt-4 rounded-2xl bg-(--subbackground) p-3 text-sm text-(--subText)">
                    <p>
                      Preço: {theme.cost} XP • {theme.type}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewTheme(theme.key)}
                      className="inline-flex items-center gap-2 rounded-full border border-(--subbackground) px-3 py-2 text-sm font-semibold text-(--text) transition hover:bg-(--subbackground)"
                    >
                      <Eye className="h-4 w-4" /> Visualizar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleBuyTheme(theme.key as ThemeKey)}
                      disabled={
                        buyingTheme ||
                        loading ||
                        (!state.isAdmin && state.xpPoints < theme.cost)
                      }
                      className={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${active ? "bg-(--primary)" : "bg-gradient-to-r from-(--primary) to-(--secondary)"}`}
                    >
                      {buyingTheme
                        ? "Processando..."
                        : unlocked
                          ? active
                            ? "Equipado"
                            : "Equipar"
                          : state.isAdmin
                            ? `Resgatar (Admin)`
                            : `Comprar (${theme.cost} XP)`}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-3xl border border-(--subbackground) bg-(--bgcard) p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-(--subText)">
                  Upgrade
                </p>
                <h2 className="mt-2 text-xl font-bold text-(--text)">
                  Análise Avançada da IA
                </h2>
              </div>
              <div className="rounded-2xl bg-(--subbackground) p-3 text-(--primary)">
                <BrainCircuit className="h-6 w-6" />
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-(--subText)">
              Compre um uso extra para a IA mapear melhor seu backlog e gerar
              recomendações mais profundas na tela “Consultar IA”.
            </p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-(--subbackground) px-4 py-3 text-sm text-(--subText)">
              <span>
                Preço: 150 XP • Consultas extras: {state.purchasedAiQueries}
              </span>
              <span>
                {state.purchasedAiQueries > 0 ? "Ativo" : "Disponível"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBuyAdvancedAi}
              disabled={
                buyingAdvancedAi ||
                loading ||
                (!state.isAdmin && state.xpPoints < 150)
              }
              className="mt-5 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buyingAdvancedAi
                ? "Processando..."
                : state.isAdmin
                  ? "Resgatar (Admin)"
                  : "Comprar (150 XP)"}
            </button>
          </section>
        </main>
      </div>
    </>
  );
}

const themeDefinitions = [
  {
    key: "default",
    name: "Tema Padrão",
    description:
      "A paleta clássica do Nexgen Tasks com foco em clareza e leitura.",
    cost: 0,
    type: "Tema",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    key: "emerald",
    name: "Tema Esmeralda",
    description:
      "Muda o destaque do app para verde neon com uma sensação de foco e energia.",
    cost: 1000,
    type: "Tema",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    key: "cyberpunk",
    name: "Tema Cyberpunk",
    description:
      "Paleta rosa e roxo neon dramática para uma interface premium e futurista.",
    cost: 1200,
    type: "Tema",
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    key: "dracula",
    name: "Tema Drácula",
    description:
      "Uma estética dark suave com detalhes roxo pastel para reduzir fadiga visual.",
    cost: 800,
    type: "Tema",
    icon: <Sparkles className="h-6 w-6" />,
  },
] as const;

function themeLabel(theme: ThemeKey | string | null | undefined) {
  if (!theme || theme === "default") return "Tema padrão";
  switch (theme) {
    case "emerald":
      return "Tema Esmeralda";
    case "cyberpunk":
      return "Tema Cyberpunk";
    case "dracula":
      return "Tema Drácula";
    default:
      return "Tema padrão";
  }
}
