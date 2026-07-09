import { NextResponse } from "next/server";
import { validateBacklogGoalInput } from "@/lib/backlog";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

function serializeBacklogGoal(goal: {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  priority: string;
  userId: number;
  createdAt: Date;
}) {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    status: goal.status,
    priority: goal.priority,
    userId: goal.userId,
    createdAt: goal.createdAt.toISOString(),
  };
}

export async function GET() {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const goals = await prisma.backlogGoal.findMany({
    where: { userId },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(goals.map(serializeBacklogGoal));
}

export async function POST(req: Request) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const payload = validateBacklogGoalInput(await req.json());

    const goal = await prisma.backlogGoal.create({
      data: {
        ...payload,
        userId,
      },
    });

    return NextResponse.json(serializeBacklogGoal(goal), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel criar o objetivo",
      },
      { status: 400 },
    );
  }
}
