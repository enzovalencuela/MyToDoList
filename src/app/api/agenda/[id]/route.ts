import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import { validateWeeklyTaskInput } from "@/lib/agenda";

function serializeWeeklyTask(task: {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category: string | null;
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
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await req.json()) as {
      title: string;
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      category?: string | null;
      applyToAllInstances?: boolean;
      originalTitle?: string;
    };

    const payload = validateWeeklyTaskInput(body);
    const applyToAllInstances = body.applyToAllInstances === true;
    const originalTitle =
      typeof body.originalTitle === "string" ? body.originalTitle.trim() : "";

    const result = applyToAllInstances
      ? await prisma.weeklyTask.updateMany({
          where: { userId, title: originalTitle },
          data: {
            title: payload.title,
            startTime: payload.startTime,
            endTime: payload.endTime,
            category: payload.category,
          },
        })
      : await prisma.weeklyTask.updateMany({
          where: { id, userId },
          data: payload,
        });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Bloco semanal não encontrado" },
        { status: 404 },
      );
    }

    const updatedTask = await prisma.weeklyTask.findUnique({ where: { id } });

    if (!updatedTask) {
      return NextResponse.json(
        { error: "Bloco semanal não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      task: serializeWeeklyTask(updatedTask),
      affectedCount: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar a agenda",
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
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    applyToAllInstances?: boolean;
    originalTitle?: string;
  };
  const applyToAllInstances = body.applyToAllInstances === true;
  const originalTitle =
    typeof body.originalTitle === "string" ? body.originalTitle.trim() : "";

  const result = applyToAllInstances
    ? await prisma.weeklyTask.deleteMany({
        where: { userId, title: originalTitle },
      })
    : await prisma.weeklyTask.deleteMany({
        where: { id, userId },
      });

  return NextResponse.json({ success: true, affectedCount: result.count });
}
