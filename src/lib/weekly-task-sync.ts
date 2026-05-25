import { prisma } from "@/lib/prisma";

const TASK_SYNC_WINDOW_DAYS = 30;

interface SyncableWeeklyTask {
  id: string;
  title: string;
  dayOfWeek: number;
  showInTasks: boolean;
  userId: number;
}

function getStartOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00.000Z`);
}

function getUpcomingDateKeysForDay(dayOfWeek: number) {
  const today = getStartOfToday();
  const dates: string[] = [];

  for (let offset = 0; offset < TASK_SYNC_WINDOW_DAYS; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    if (date.getDay() === dayOfWeek) {
      dates.push(formatDateKey(date));
    }
  }

  return dates;
}

export async function removeWeeklyTaskTodos(weeklyTaskIds: string[], userId: number) {
  if (weeklyTaskIds.length === 0) {
    return 0;
  }

  const syncs = await prisma.weeklyTaskTodoSync.findMany({
    where: {
      weeklyTaskId: { in: weeklyTaskIds },
      weeklyTask: { userId },
    },
    select: {
      tarefaId: true,
    },
  });

  if (syncs.length === 0) {
    return 0;
  }

  const tarefaIds = syncs.map((sync) => sync.tarefaId);

  const result = await prisma.tarefa.deleteMany({
    where: {
      id_tarefa: { in: tarefaIds },
      id_usuario: userId,
    },
  });

  return result.count;
}

export async function syncWeeklyTaskToTodos(task: SyncableWeeklyTask) {
  if (!task.showInTasks) {
    await removeWeeklyTaskTodos([task.id], task.userId);
    return;
  }

  const desiredDateKeys = getUpcomingDateKeysForDay(task.dayOfWeek);
  const desiredDateKeySet = new Set(desiredDateKeys);

  const existingSyncs = await prisma.weeklyTaskTodoSync.findMany({
    where: { weeklyTaskId: task.id },
    select: {
      id: true,
      tarefaId: true,
      scheduledDate: true,
    },
  });

  const existingByDateKey = new Map(
    existingSyncs.map((sync) => [formatDateKey(sync.scheduledDate), sync]),
  );

  const outdatedSyncs = existingSyncs.filter(
    (sync) => !desiredDateKeySet.has(formatDateKey(sync.scheduledDate)),
  );

  if (outdatedSyncs.length > 0) {
    await prisma.tarefa.deleteMany({
      where: {
        id_tarefa: { in: outdatedSyncs.map((sync) => sync.tarefaId) },
        id_usuario: task.userId,
      },
    });
  }

  const maxOrder = await prisma.tarefa.aggregate({
    where: { id_usuario: task.userId },
    _max: { ordem: true },
  });
  let nextOrder = (maxOrder._max.ordem ?? -1) + 1;

  for (const dateKey of desiredDateKeys) {
    const existingSync = existingByDateKey.get(dateKey);

    if (existingSync) {
      await prisma.tarefa.updateMany({
        where: {
          id_tarefa: existingSync.tarefaId,
          id_usuario: task.userId,
        },
        data: {
          titulo: task.title,
          data_prazo: createDateFromKey(dateKey),
        },
      });
      continue;
    }

    const createdTask = await prisma.tarefa.create({
      data: {
        titulo: task.title,
        descricao: null,
        prioridade: "Normal",
        data_prazo: createDateFromKey(dateKey),
        estado_tarefa: "Pendente",
        ordem: nextOrder,
        id_usuario: task.userId,
      },
    });
    nextOrder += 1;

    await prisma.weeklyTaskTodoSync.create({
      data: {
        weeklyTaskId: task.id,
        tarefaId: createdTask.id_tarefa,
        scheduledDate: createDateFromKey(dateKey),
      },
    });
  }
}

export async function syncWeeklyTasksToTodos(tasks: SyncableWeeklyTask[]) {
  for (const task of tasks) {
    await syncWeeklyTaskToTodos(task);
  }
}
