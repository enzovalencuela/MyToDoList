import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

export async function GET() {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  const tarefas = await prisma.tarefa.findMany({
    where: { id_usuario },
    orderBy: [{ ordem: "asc" }],
  });

  const todos = tarefas.map((t) => ({
    id: String(t.id_tarefa),
    title: t.titulo,
    description: t.descricao,
    completed: t.estado_tarefa === "Finalizada",
    priority: t.prioridade,
    dueDate: t.data_prazo ? t.data_prazo.toISOString().split("T")[0] : null,
    order: t.ordem,
    createdAt: "",
  }));

  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  const { title, description, priority, dueDate } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "TÃ­tulo Ã© obrigatÃ³rio" }, { status: 400 });
  }

  const maxOrdem = await prisma.tarefa.aggregate({ where: { id_usuario }, _max: { ordem: true } });
  const nextOrdem = (maxOrdem._max.ordem ?? -1) + 1;

  const tarefa = await prisma.tarefa.create({
    data: {
      titulo: title,
      descricao: description || null,
      prioridade: priority || "Normal",
      data_prazo: dueDate ? new Date(dueDate) : null,
      estado_tarefa: "Pendente",
      ordem: nextOrdem,
      id_usuario,
    },
  });

  return NextResponse.json(
    {
      id: String(tarefa.id_tarefa),
      title: tarefa.titulo,
      description: tarefa.descricao,
      completed: false,
      priority: tarefa.prioridade,
      dueDate: tarefa.data_prazo?.toISOString() ?? null,
      order: tarefa.ordem,
    },
    { status: 201 }
  );
}

export async function PUT(req: Request) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  const { id, completed, title, description, priority, dueDate } = await req.json();

  if (!id) return NextResponse.json({ error: "ID Ã© obrigatÃ³rio" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (completed !== undefined) data.estado_tarefa = completed ? "Finalizada" : "Pendente";
  if (title !== undefined) data.titulo = title;
  if (description !== undefined) data.descricao = description;
  if (priority !== undefined) data.prioridade = priority;
  if (dueDate !== undefined) data.data_prazo = dueDate ? new Date(dueDate) : null;

  const result = await prisma.tarefa.updateMany({
    where: { id_tarefa: Number(id), id_usuario },
    data,
  });

  if (result.count === 0) return NextResponse.json({ error: "Tarefa nÃ£o encontrada" }, { status: 404 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const id_usuario = await getUsuarioId();
  if (!id_usuario) return NextResponse.json({ error: "NÃ£o autorizado" }, { status: 401 });

  const { id } = await req.json();

  await prisma.tarefa.deleteMany({ where: { id_tarefa: Number(id), id_usuario } });
  return NextResponse.json({ success: true });
}
