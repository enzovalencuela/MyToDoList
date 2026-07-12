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

export default function LojaPage() {
  const router = useRouter();
  const [state, setState] = useState<UserShopState>({
    xpPoints: 0,
    streakShields: 0,
  });
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

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
      setState({
        xpPoints: result.xpPoints,
        streakShields: result.streakShields,
      });
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

          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-5 shadow-sm opacity-80">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-[var(--subbackground)] p-3 text-[var(--subText)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
                Em breve
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text)]">
              Tema Premium
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--subText)]">
              Novos temas visuais para personalizar sua experiência e destacar o
              painel.
            </p>
          </article>

          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-5 shadow-sm opacity-80">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-[var(--subbackground)] p-3 text-[var(--subText)]">
                <Star className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-500">
                Bloqueado
              </span>
            </div>
            <h2 className="mt-4 text-xl font-bold text-[var(--text)]">
              Multiplicador XP
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--subText)]">
              Aumente o rendimento de XP por tarefa concluída quando atingir um
              novo patamar.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
