import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";
import { validateWeeklyTaskInput } from "@/lib/weekly-schedule";

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
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = validateWeeklyTaskInput(await req.json());

    const result = await prisma.weeklyTask.updateMany({
      where: { id, userId },
      data: payload,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Bloco semanal nÃ£o encontrado" }, { status: 404 });
    }

    const updatedTask = await prisma.weeklyTask.findUnique({ where: { id } });

    if (!updatedTask) {
      return NextResponse.json({ error: "Bloco semanal nÃ£o encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeWeeklyTask(updatedTask));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "NÃ£o foi possÃ­vel atualizar a agenda" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.weeklyTask.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json({ success: true });
}
