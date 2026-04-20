import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const todos = await prisma.todo.findMany({
    where: { userId },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { title, description, priority, dueDate } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  const maxOrder = await prisma.todo.aggregate({ where: { userId }, _max: { order: true } });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description || null,
      priority: priority || "Normal",
      dueDate: dueDate ? new Date(dueDate) : null,
      order: nextOrder,
      userId,
    },
  });

  return NextResponse.json(todo, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id, completed, title, description, priority, dueDate } = await req.json();

  if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (completed !== undefined) data.completed = completed;
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (priority !== undefined) data.priority = priority;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  const result = await prisma.todo.updateMany({
    where: { id, userId },
    data,
  });

  if (result.count === 0) return NextResponse.json({ error: "Todo não encontrado" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await req.json();

  await prisma.todo.deleteMany({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
