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

export async function GET() {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  const weeklyTasks = await prisma.weeklyTask.findMany({
    where: { userId },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json(weeklyTasks.map(serializeWeeklyTask));
}

export async function POST(req: Request) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });
  }

  try {
    const payload = validateWeeklyTaskInput(await req.json());

    const weeklyTask = await prisma.weeklyTask.create({
      data: {
        ...payload,
        userId,
      },
    });

    return NextResponse.json(serializeWeeklyTask(weeklyTask), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "NÃ£o foi possÃ­vel salvar a agenda",
      },
      { status: 400 },
    );
  }
}
