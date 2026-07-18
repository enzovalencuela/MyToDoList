"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Bell,
  BellRing,
  Bot,
  CalendarClock,
  Loader2,
  Send,
  TimerReset,
} from "lucide-react";
import { toast } from "react-toastify";
import { updateNotificationSettings } from "@/app/settings/actions";
import type { NotificationSettingsState } from "@/lib/notification-settings";

interface PushNotificationSettingsProps {
  initialSettings: NotificationSettingsState;
}

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

function NotificationToggle({
  checked,
  description,
  disabled,
  icon: Icon,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled: boolean;
  icon: typeof CalendarClock;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-[var(--subbackground)] bg-[var(--background)] px-4 py-4">
      <span className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/12 text-[var(--primary)]">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-bold text-[var(--text)]">
            {label}
          </span>
          <span className="mt-1 block text-sm leading-6 text-[var(--subText)]">
            {description}
          </span>
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={`mt-1 flex h-7 w-12 flex-shrink-0 items-center rounded-full p-1 transition ${
          checked ? "bg-[var(--primary)]" : "bg-[var(--subbackground)]"
        } ${disabled ? "opacity-60" : ""}`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}

export default function PushNotificationSettings({
  initialSettings,
}: PushNotificationSettingsProps) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const [sendingTest, setSendingTest] = useState(false);
  const [isSavingSettings, startSavingSettings] = useTransition();
  const isAdminMode =
    typeof window !== "undefined" &&
    document.cookie.includes("admin_mode_enabled=true");

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

  function updateSetting<Key extends keyof NotificationSettingsState>(
    key: Key,
    value: NotificationSettingsState[Key],
  ) {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(nextSettings);

    startSavingSettings(async () => {
      try {
        const savedSettings = await updateNotificationSettings({
          [key]: value,
        });
        setSettings(savedSettings);
        toast.success("Preferencias de notificacao salvas.");
      } catch (error) {
        setSettings(previousSettings);
        toast.error(
          error instanceof Error
            ? error.message
            : "Nao foi possivel salvar as preferencias.",
        );
      }
    });
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
    <div className="space-y-5 border-t border-[var(--subbackground)] pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
      </div>

      {subscribed && isAdminMode && (
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
          Testar como {isAdminMode ? "Admin" : "Usuário"}
        </button>
      )}

      <div className="space-y-3">
        <NotificationToggle
          checked={settings.agendaReminders}
          description="Receber notificacoes minutos antes de cada bloco de tempo da sua rotina iniciar."
          disabled={isSavingSettings}
          icon={CalendarClock}
          label="Lembretes da Agenda Fixa"
          onChange={(checked) => updateSetting("agendaReminders", checked)}
        />
        <NotificationToggle
          checked={settings.taskDeadlines}
          description="Ser notificado sobre prazos e vencimentos de tarefas isoladas."
          disabled={isSavingSettings}
          icon={TimerReset}
          label="Prazos de Tarefas Unicas"
          onChange={(checked) => updateSetting("taskDeadlines", checked)}
        />
        <NotificationToggle
          checked={settings.aiInactivityAlerts}
          description="Permitir que a IA crie mensagens personalizadas caso voce passe muito tempo sem atualizar suas tarefas ou interagir com a agenda."
          disabled={isSavingSettings}
          icon={Bot}
          label="Puxao de Orelha da IA"
          onChange={(checked) => updateSetting("aiInactivityAlerts", checked)}
        />
      </div>
    </div>
  );
}
