import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const AGENDA_LOOKAHEAD_MINUTES = 10;
const TASK_DEADLINE_LOOKAHEAD_HOURS = 24;
const INACTIVITY_HOURS = 48;

function isCronAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return req.headers.get("authorization") === `Bearer ${secret}`;
}

function getVapidConfig() {
  const subject = process.env.VAPID_EMAIL
    ? `mailto:${process.env.VAPID_EMAIL}`
    : process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    return null;
  }

  return { subject, publicKey, privateKey };
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimeKey(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatTime(value: string) {
  return value;
}

async function sendPushNotification({
  body,
  subscription,
  title,
  url = "/dashboard",
}: {
  body: string;
  subscription: string;
  title: string;
  url?: string;
}) {
  await webpush.sendNotification(
    JSON.parse(subscription),
    JSON.stringify({ title, body, url }),
  );
}

async function sendOnce({
  body,
  referenceKey,
  subscription,
  title,
  type,
  url,
  userId,
}: {
  body: string;
  referenceKey: string;
  subscription: string;
  title: string;
  type: string;
  url?: string;
  userId: number;
}) {
  try {
    await prisma.notificationDelivery.create({
      data: {
        userId,
        type,
        referenceKey,
      },
    });
  } catch {
    return false;
  }

  try {
    await sendPushNotification({ body, subscription, title, url });
    return true;
  } catch {
    await prisma.notificationDelivery.deleteMany({
      where: {
        userId,
        type,
        referenceKey,
      },
    });
    return false;
  }
}

async function handleAgendaReminders(now: Date) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const maxMinutes = nowMinutes + AGENDA_LOOKAHEAD_MINUTES;
  const todayKey = getDateKey(now);
  const users = await prisma.usuario.findMany({
    where: {
      pushSubscription: { not: null },
      notificationSettings: {
        agendaReminders: true,
      },
      weeklyTasks: {
        some: {
          dayOfWeek: now.getDay(),
        },
      },
    },
    select: {
      id_usuario: true,
      pushSubscription: true,
      weeklyTasks: {
        where: { dayOfWeek: now.getDay() },
        select: {
          id: true,
          title: true,
          startTime: true,
        },
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    if (!user.pushSubscription) continue;

    const upcomingTasks = user.weeklyTasks.filter((task) => {
      const startMinutes = timeToMinutes(task.startTime);
      return startMinutes >= nowMinutes && startMinutes <= maxMinutes;
    });

    for (const task of upcomingTasks) {
      const didSend = await sendOnce({
        userId: user.id_usuario,
        subscription: user.pushSubscription,
        type: "AGENDA_REMINDER",
        referenceKey: `${todayKey}:${task.id}:${task.startTime}`,
        title: "Sua rotina ja vai comecar",
        body: `${task.title} inicia as ${formatTime(task.startTime)}.`,
        url: "/agenda",
      });

      if (didSend) sent += 1;
    }
  }

  return sent;
}

async function handleTaskDeadlines(now: Date) {
  const todayKey = getDateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setHours(now.getHours() + TASK_DEADLINE_LOOKAHEAD_HOURS);

  const tasks = await prisma.tarefa.findMany({
    where: {
      estado_tarefa: { not: "Finalizada" },
      data_prazo: {
        gte: new Date(`${todayKey}T12:00:00.000Z`),
        lte: new Date(`${getDateKey(tomorrow)}T12:00:00.000Z`),
      },
      usuario: {
        pushSubscription: { not: null },
        notificationSettings: {
          taskDeadlines: true,
        },
      },
    },
    select: {
      id_tarefa: true,
      titulo: true,
      data_prazo: true,
      usuario: {
        select: {
          id_usuario: true,
          pushSubscription: true,
        },
      },
    },
  });

  let sent = 0;

  for (const task of tasks) {
    if (!task.usuario.pushSubscription || !task.data_prazo) continue;

    const deadlineKey = task.data_prazo.toISOString().split("T")[0];
    const didSend = await sendOnce({
      userId: task.usuario.id_usuario,
      subscription: task.usuario.pushSubscription,
      type: "TASK_DEADLINE",
      referenceKey: `${deadlineKey}:${task.id_tarefa}`,
      title: "Prazo chegando",
      body: `${task.titulo} vence em breve.`,
      url: "/dashboard",
    });

    if (didSend) sent += 1;
  }

  return sent;
}

async function generateInactivityMessage(backlogGoals: { title: string }[]) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return "Seu backlog esta esperando voce.";
  }

  const modelName =
    process.env.GEMINI_INACTIVITY_MODEL ??
    process.env.GEMINI_MODEL ??
    "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 40,
    },
  });
  const result = await model.generateContent(`
O usuario esta ha 2 dias sem abrir o app.
Olhe o backlog dele: ${JSON.stringify(backlogGoals)}.
Crie uma notificacao push curta, espirituosa e direta de ate 40 caracteres chamando ele de volta para a acao.
Responda apenas a frase, sem aspas.
`);

  return result.response.text().trim().slice(0, 40);
}

async function handleInactivityAlerts(now: Date) {
  const cutoff = new Date(now.getTime() - INACTIVITY_HOURS * 60 * 60 * 1000);
  const todayKey = getDateKey(now);
  const users = await prisma.usuario.findMany({
    where: {
      pushSubscription: { not: null },
      notificationSettings: {
        aiInactivityAlerts: true,
      },
      OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }],
    },
    select: {
      id_usuario: true,
      pushSubscription: true,
      backlogGoals: {
        where: {
          status: { in: ["NOT_STARTED", "IN_PROGRESS"] },
        },
        select: {
          title: true,
        },
        take: 8,
      },
    },
  });

  let sent = 0;

  for (const user of users) {
    if (!user.pushSubscription) continue;

    const message = await generateInactivityMessage(user.backlogGoals);
    const didSend = await sendOnce({
      userId: user.id_usuario,
      subscription: user.pushSubscription,
      type: "AI_INACTIVITY",
      referenceKey: todayKey,
      title: "Nexgen Tasks",
      body: message || "Seu backlog esta esperando voce.",
      url: "/backlog",
    });

    if (didSend) sent += 1;
  }

  return sent;
}

async function handleStreakProtection(now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const users = await prisma.usuario.findMany({
    where: {
      OR: [{ streakCount: { gt: 0 } }, { streakShields: { gt: 0 } }],
    },
    select: {
      id_usuario: true,
      streakCount: true,
      streakShields: true,
      streakFrozenUntil: true,
    },
  });

  let protectedDays = 0;
  let resetStreaks = 0;

  for (const user of users) {
    const existingRecord = await prisma.streakHistory.findUnique({
      where: {
        userId_activityDate: {
          userId: user.id_usuario,
          activityDate: yesterday,
        },
      },
      select: { id: true },
    });

    if (existingRecord) {
      continue;
    }

    if (user.streakFrozenUntil && user.streakFrozenUntil >= yesterday) {
      await prisma.streakHistory.create({
        data: {
          userId: user.id_usuario,
          activityDate: yesterday,
          xpEarned: 0,
          protected: true,
        },
      });
      protectedDays += 1;
      continue;
    }

    if (user.streakShields > 0) {
      await prisma.$transaction([
        prisma.usuario.update({
          where: { id_usuario: user.id_usuario },
          data: { streakShields: { decrement: 1 } },
        }),
        prisma.streakHistory.create({
          data: {
            userId: user.id_usuario,
            activityDate: yesterday,
            xpEarned: 0,
            protected: true,
          },
        }),
      ]);
      protectedDays += 1;
      continue;
    }

    if (user.streakCount > 0) {
      await prisma.usuario.update({
        where: { id_usuario: user.id_usuario },
        data: { streakCount: 0 },
      });
      resetStreaks += 1;
    }
  }

  return { protectedDays, resetStreaks };
}

async function runNotificationCron(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const vapidConfig = getVapidConfig();

  if (!vapidConfig) {
    return NextResponse.json(
      { error: "Variaveis VAPID nao configuradas" },
      { status: 500 },
    );
  }

  webpush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey,
  );

  const now = new Date();
  const [agendaSent, deadlineSent, inactivitySent, streakProtection] =
    await Promise.all([
      handleAgendaReminders(now),
      handleTaskDeadlines(now),
      handleInactivityAlerts(now),
      handleStreakProtection(now),
    ]);

  return NextResponse.json({
    success: true,
    checkedAt: `${getDateKey(now)} ${getTimeKey(now)}`,
    sent: {
      agendaReminders: agendaSent,
      taskDeadlines: deadlineSent,
      aiInactivityAlerts: inactivitySent,
    },
    streakProtection,
  });
}

export async function GET(req: Request) {
  return runNotificationCron(req);
}

export async function POST(req: Request) {
  return runNotificationCron(req);
}
