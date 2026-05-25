import { NextResponse } from "next/server";
import { validateWeeklyTaskInput } from "@/lib/agenda";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import {
  removeWeeklyTaskTodos,
  syncWeeklyTaskToTodos,
  syncWeeklyTasksToTodos,
} from "@/lib/weekly-task-sync";

function serializeWeeklyTask(task: {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category: string | null;
  color: string;
  showInTasks: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    title: task.title,
    dayOfWeek: task.dayOfWeek,
    startTime: task.startTime,
    endTime: task.endTime,
    category: task.category,
    color: task.color,
    showInTasks: task.showInTasks,
    userId: task.userId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await req.json()) as {
      title: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      category?: string | null;
      color?: string;
      showInTasks?: boolean;
      applyToAllInstances?: boolean;
      originalTitle?: string;
    };

    const payload = validateWeeklyTaskInput(body);
    const applyToAllInstances = body.applyToAllInstances === true;
    const originalTitle =
      typeof body.originalTitle === "string" ? body.originalTitle.trim() : "";

    let affectedCount = 0;

    if (applyToAllInstances) {
      const matchingTasks = await prisma.weeklyTask.findMany({
        where: { userId, title: originalTitle },
        select: { id: true },
      });

      if (matchingTasks.length === 0) {
        return NextResponse.json(
          { error: "Bloco semanal nÃ£o encontrado" },
          { status: 404 },
        );
      }

      const result = await prisma.weeklyTask.updateMany({
        where: { userId, title: originalTitle },
        data: {
          title: payload.title,
          startTime: payload.startTime,
          endTime: payload.endTime,
          category: payload.category,
          color: payload.color,
          showInTasks: payload.showInTasks,
        },
      });

      affectedCount = result.count;

      const updatedTasks = await prisma.weeklyTask.findMany({
        where: { id: { in: matchingTasks.map((task) => task.id) } },
        select: {
          id: true,
          title: true,
          dayOfWeek: true,
          showInTasks: true,
          userId: true,
        },
      });

      await syncWeeklyTasksToTodos(updatedTasks);
    } else {
      const result = await prisma.weeklyTask.updateMany({
        where: { id, userId },
        data: payload,
      });

      affectedCount = result.count;

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Bloco semanal nÃ£o encontrado" },
          { status: 404 },
        );
      }

      const updatedTaskForSync = await prisma.weeklyTask.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          dayOfWeek: true,
          showInTasks: true,
          userId: true,
        },
      });

      if (updatedTaskForSync) {
        await syncWeeklyTaskToTodos(updatedTaskForSync);
      }
    }

    const updatedTask = await prisma.weeklyTask.findUnique({ where: { id } });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Bloco semanal nÃ£o encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      task: serializeWeeklyTask(updatedTask),
      affectedCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "NÃ£o foi possÃ­vel atualizar a agenda",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    applyToAllInstances?: boolean;
    originalTitle?: string;
  };
  const applyToAllInstances = body.applyToAllInstances === true;
  const originalTitle =
    typeof body.originalTitle === "string" ? body.originalTitle.trim() : "";

  const tasksToDelete = applyToAllInstances
    ? await prisma.weeklyTask.findMany({
        where: { userId, title: originalTitle },
        select: { id: true },
      })
    : await prisma.weeklyTask.findMany({
        where: { id, userId },
        select: { id: true },
      });

  await removeWeeklyTaskTodos(
    tasksToDelete.map((task) => task.id),
    userId,
  );

  const result = applyToAllInstances
    ? await prisma.weeklyTask.deleteMany({
        where: { userId, title: originalTitle },
      })
    : await prisma.weeklyTask.deleteMany({
        where: { id, userId },
      });

  return NextResponse.json({ success: true, affectedCount: result.count });
}
