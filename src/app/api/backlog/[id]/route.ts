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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const payload = validateBacklogGoalInput(await req.json());

    const result = await prisma.backlogGoal.updateMany({
      where: { id, userId },
      data: payload,
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Objetivo nao encontrado" },
        { status: 404 },
      );
    }

    const updatedGoal = await prisma.backlogGoal.findUnique({ where: { id } });

    if (!updatedGoal) {
      return NextResponse.json(
        { error: "Objetivo nao encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(serializeBacklogGoal(updatedGoal));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel atualizar o objetivo",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.backlogGoal.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json({ success: true });
}
