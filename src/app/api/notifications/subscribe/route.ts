import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

function isValidPushSubscription(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Record<string, unknown>;
  const keys = payload.keys as Record<string, unknown> | undefined;

  if (!keys) {
    return false;
  }

  return (
    typeof payload.endpoint === "string" &&
    Boolean(payload.endpoint) &&
    typeof keys.p256dh === "string" &&
    typeof keys.auth === "string"
  );
}

export async function POST(req: Request) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const subscription = await req.json().catch(() => null);

  if (!isValidPushSubscription(subscription)) {
    return NextResponse.json(
      { error: "Inscricao de push invalida" },
      { status: 400 },
    );
  }

  await prisma.usuario.update({
    where: { id_usuario: userId },
    data: {
      pushSubscription: JSON.stringify(subscription),
    },
  });

  return NextResponse.json({ success: true });
}
