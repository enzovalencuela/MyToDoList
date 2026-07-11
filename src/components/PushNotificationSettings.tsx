"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Loader2, Send } from "lucide-react";
import { toast } from "react-toastify";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = `${base64String}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export default function PushNotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    const hasSupport = isPushSupported();
    setSupported(hasSupport);

    if (!hasSupport) {
      return;
    }

    setPermission(Notification.permission);

    void navigator.serviceWorker
      .getRegistration("/sw.js")
      .then((registration) => registration?.pushManager.getSubscription())
      .then((subscription) => setSubscribed(Boolean(subscription)))
      .catch(() => setSubscribed(false));
  }, []);

  async function enableNotifications() {
    if (!supported) {
      toast.error("Este navegador nao suporta notificacoes push.");
      return;
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      toast.error("Chave publica VAPID nao configurada.");
      return;
    }

    setLoading(true);

    try {
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== "granted") {
        toast.error("Permissao de notificacao nao concedida.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      const existingSubscription =
        await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        }));

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(result.error ?? "Nao foi possivel salvar a inscricao.");
        return;
      }

      setSubscribed(true);
      toast.success("Notificacoes ativadas!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel ativar notificacoes.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function sendTestNotification() {
    setSendingTest(true);

    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Nexgen Tasks",
          body: "Suas notificacoes push estao funcionando.",
          url: "/dashboard",
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        toast.error(result.error ?? "Nao foi possivel enviar o teste.");
        return;
      }

      toast.success("Notificacao de teste enviada.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Nao foi possivel enviar o teste.",
      );
    } finally {
      setSendingTest(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 border-t border-[var(--subbackground)] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)]">
          {subscribed ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </div>
        <div>
          <h3 className="font-bold text-[var(--text)]">
            Ativar Notificacoes no Celular
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--subText)]">
            Receba lembretes push do Nexgen Tasks neste dispositivo.
          </p>
          {!supported && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              Este navegador nao oferece suporte a push notifications.
            </p>
          )}
          {permission === "denied" && (
            <p className="mt-2 text-xs font-semibold text-red-500">
              A permissao foi bloqueada nas configuracoes do navegador.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={enableNotifications}
          disabled={!supported || permission === "denied" || loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {subscribed ? "Reativar" : "Ativar"}
        </button>

        {subscribed && (
          <button
            type="button"
            onClick={sendTestNotification}
            disabled={sendingTest}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--subbackground)] px-5 py-3 text-sm font-bold text-[var(--text)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
          >
            {sendingTest ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Testar
          </button>
        )}
      </div>
    </div>
  );
}
