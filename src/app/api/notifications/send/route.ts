import { NextResponse } from "next/server";
import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getUsuarioId } from "@/lib/usuario";

export const runtime = "nodejs";

function getVapidConfig() {
  const subject = process.env.VAPID_EMAIL
    ? `mailto:${process.env.VAPID_EMAIL}`
    : process.env.VAPID_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    return null;
  }

  return {
    subject,
    publicKey,
    privateKey,
  };
}

export async function POST(req: Request) {
  const userId = await getUsuarioId();

  if (!userId) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const vapidConfig = getVapidConfig();

  if (!vapidConfig) {
    return NextResponse.json(
      { error: "Variaveis VAPID nao configuradas" },
      { status: 500 },
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: userId },
    select: { pushSubscription: true },
  });

  if (!usuario?.pushSubscription) {
    return NextResponse.json(
      { error: "Nenhuma inscricao push encontrada" },
      { status: 404 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    body?: string;
    url?: string;
  };
  const payload = JSON.stringify({
    title: body.title || "Nexgen Tasks",
    body: body.body || "Notificacao de teste ativada com sucesso.",
    url: body.url || "/dashboard",
  });

  webpush.setVapidDetails(
    vapidConfig.subject,
    vapidConfig.publicKey,
    vapidConfig.privateKey,
  );

  try {
    await webpush.sendNotification(JSON.parse(usuario.pushSubscription), payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel enviar a notificacao",
      },
      { status: 500 },
    );
  }
}
