import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft, Flame, Trophy, Sparkles } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getActivityClass(xpEarned: number, protectedDay = false) {
  if (protectedDay) {
    return "bg-slate-600";
  }

  if (!xpEarned) {
    return "bg-[var(--subbackground)]";
  }

  if (xpEarned >= 40) return "bg-green-700";
  if (xpEarned >= 30) return "bg-green-600";
  if (xpEarned >= 20) return "bg-green-500";
  if (xpEarned >= 10) return "bg-green-400";

  return "bg-green-300";
}

function buildMonthCalendar(
  year: number,
  month: number,
  activityMap: Map<string, number>,
  activityProtectedMap: Map<string, boolean>,
) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  const cells: Array<{
    dateKey: string | null;
    day: number | null;
    isCurrentMonth: boolean;
    xpEarned: number;
    protectedDay: boolean;
  }> = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - firstWeekday + 1;

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      cells.push({
        dateKey: null,
        day: null,
        isCurrentMonth: false,
        xpEarned: 0,
        protectedDay: false,
      });
      continue;
    }

    const currentDate = new Date(year, month, dayNumber);
    const dateKey = getDateKey(currentDate);
    const xpEarned = activityMap.get(dateKey) ?? 0;
    const protectedDay = activityProtectedMap.get(dateKey) ?? false;

    cells.push({
      dateKey,
      day: dayNumber,
      isCurrentMonth: true,
      xpEarned,
      protectedDay,
    });
  }

  return cells;
}

export default async function ConquistasPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: session.user.email },
    select: {
      id_usuario: true,
      name: true,
      level: true,
      xpPoints: true,
      streakCount: true,
      longestStreak: true,
    },
  });

  if (!usuario) {
    redirect("/login");
  }

  const historyRecords = await prisma.streakHistory.findMany({
    where: { userId: usuario.id_usuario },
    orderBy: { activityDate: "asc" },
    select: { activityDate: true, xpEarned: true, protected: true },
  });

  const activityMap = new Map<string, number>();
  const activityProtectedMap = new Map<string, boolean>();
  historyRecords.forEach((record) => {
    const normalizedDate = getDateKey(record.activityDate);
    activityMap.set(
      normalizedDate,
      (activityMap.get(normalizedDate) ?? 0) + record.xpEarned,
    );
    if (record.protected) {
      activityProtectedMap.set(normalizedDate, true);
    }
  });

  const currentYear = new Date().getFullYear();
  const xpInCurrentLevel = usuario.xpPoints % 100;
  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / 100) * 100),
  );
  const totalActiveDays = historyRecords.length;
  const lastActivity = historyRecords.at(-1)?.activityDate;
  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 font-semibold text-[var(--primary)] transition hover:underline"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para o perfil
        </Link>

        <header className="rounded-[28px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--subbackground)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                <Trophy className="h-4 w-4" />
                Conquistas e consistência
              </div>
              <div>
                <h1 className="text-3xl font-black sm:text-4xl">
                  Seu calendário de evolução
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[var(--subText)] sm:text-base">
                  Cada bloco representa um dia com atividade registrada. Quanto
                  mais XP você ganha em um dia, mais intenso fica o verde.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--subbackground)] px-4 py-3 text-sm font-semibold">
              <p className="text-[var(--subText)]">Nível atual</p>
              <p className="text-xl text-[var(--text)]">Nv. {usuario.level}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--subbackground)] bg-[var(--background)] p-4">
            <div className="flex items-center justify-between text-sm font-semibold">
              <span>XP no nível atual</span>
              <span>{xpInCurrentLevel} / 100 XP</span>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--subbackground)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--subText)]">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak atual
            </div>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">
              {usuario.streakCount} dias
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--subText)]">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
              Melhor streak
            </div>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">
              {usuario.longestStreak} dias
            </p>
          </article>
          <article className="rounded-[24px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-4 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--subText)]">
              <Trophy className="h-5 w-5 text-emerald-500" />
              Dias ativos
            </div>
            <p className="mt-3 text-3xl font-black text-[var(--text)]">
              {totalActiveDays}
            </p>
            <p className="mt-1 text-sm text-[var(--subText)]">
              {lastActivity
                ? `Última atividade: ${lastActivity.toLocaleDateString("pt-BR")}`
                : "Nenhuma atividade registrada ainda"}
            </p>
          </article>
        </section>

        <section className="rounded-[28px] border border-[var(--subbackground)] bg-[var(--bgcard)] p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                Mapa de calor de {currentYear}
              </h2>
              <p className="text-sm text-[var(--subText)]">
                Blocos mais escuros indicam dias com mais XP acumulado.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--subText)]">
              <span className="h-3 w-3 rounded-sm bg-[var(--subbackground)]" />
              <span>Sem atividade</span>
              <span className="h-3 w-3 rounded-sm bg-green-300" />
              <span className="h-3 w-3 rounded-sm bg-green-500" />
              <span className="h-3 w-3 rounded-sm bg-green-700" />
            </div>
          </div>

          <div className="space-y-5">
            {Array.from({ length: 12 }, (_, monthIndex) => {
              const monthCells = buildMonthCalendar(
                currentYear,
                monthIndex,
                activityMap,
                activityProtectedMap,
              );
              const weekRows = [] as Array<
                Array<{
                  dateKey: string | null;
                  day: number | null;
                  isCurrentMonth: boolean;
                  xpEarned: number;
                  protectedDay: boolean;
                }>
              >;

              for (let row = 0; row < monthCells.length / 7; row += 1) {
                weekRows.push(monthCells.slice(row * 7, row * 7 + 7));
              }

              return (
                <div key={monthIndex}>
                  <p className="mb-2 text-sm font-semibold text-[var(--subText)]">
                    {monthNames[monthIndex]}
                  </p>
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekdayLabels.map((label) => (
                      <div
                        key={`${monthIndex}-${label}`}
                        className="text-center text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--subText)]"
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {weekRows.flat().map((cell, index) => (
                      <div
                        key={`${monthIndex}-${index}`}
                        className={`h-3 w-3 rounded-[4px] sm:h-4 sm:w-4 ${cell.dateKey ? getActivityClass(cell.xpEarned, cell.protectedDay) : "bg-transparent"}`}
                        title={
                          cell.dateKey
                            ? `${cell.dateKey} · ${cell.xpEarned} XP`
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
